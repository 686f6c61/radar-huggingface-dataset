# greg1506/qwen3-1p7b-coffee-router-v3-GGUF

## Resumen

qwen3-1p7b-coffee-router-v3 es un modelo especializado de 1.720.574.976 parámetros (1,7B) derivado de Qwen/Qwen3-1.7B mediante fine-tuning supervisado. No es un modelo de propósito general: funciona como enrutador (router) de un asistente de café offline. Su tarea es leer una consulta sobre café y emitir un único objeto JSON que identifique una herramienta de cálculo, una consulta a tabla, una petición de argumento faltante o una derivación al camino de respuesta en prosa.

El modelo se distribuye en formato GGUF con dos cuantizaciones (Q5_K_M y Q4_K_M), acompañadas de una gramática GBNF que restringe la decodificación y de un wrapper de referencia en Python (`toolcall_dispatch.py`) que valida los argumentos antes de ejecutar las herramientas. La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso con modo thinking desactivable mediante `enable_thinking=False`.

Su relevancia radica en el patrón de diseño: en lugar de pedir al modelo que haga aritmética, se le entrena únicamente para enrutar hacia ocho herramientas deterministas, y una capa externa valida que los argumentos estén fundamentados en el texto del usuario. El autor reporta 0,887 de system EM en CoffeeBench (336 ítems) con Q5_K_M, con 249/249 aciertos aritméticos resueltos por el wrapper y no por el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (valor usado en el ejemplo de despliegue del autor; no se especifica el máximo del modelo base) |
| Tipos de cuantizacion | Q5_K_M (1,26 GB), Q4_K_M (1,11 GB); referencia bf16 en HF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de 1,7B parámetros con licencia Apache-2.0. Sobre esa base se aplicó un fine-tuning adicional con datos abiertos de café (`qwen3-1p7b-coffee-open`) y después un SFT específico de enrutamiento: aproximadamente 1.000 filas generadas programáticamente que cubren las ocho herramientas, el arrastre de argumentos entre turnos, las peticiones de argumentos faltantes, los negativos de sobre-uso de herramientas y el registro de fraseo del bench, con números frescos. El constructor garantiza cero solapamientos exactos con las preguntas del bench o del conjunto de evaluación.

La innovación técnica principal no está en la arquitectura sino en el contrato de inferencia. La salida del modelo se restringe con una gramática GBNF (`toolcall.gbnf`, 3 KB) que fuerza un único objeto JSON con uno de tres esquemas (`tool`, `ask`, `answer`). Esto desacopla la validez sintáctica de la cuantización: el autor reporta 1.000 de JSON válido en todas las cuantizaciones. La segunda pieza es el wrapper `toolcall_dispatch.py`, que trata los argumentos del modelo como una propuesta y exige que cada argumento numérico consuma un número distinto presente en los turnos del usuario, tipado por su unidad (g/gram para masas, %/TDS para TDS, 1:X para ratios). Los argumentos de tipo enum deben aparecer literalmente en las palabras del usuario con coincidencia por mención más temprana, de modo que `medium-dark` no valida como `medium`. Cualquier propuesta no fundamentada se convierte en un `ask` y se registra para auditoría. Además, un parser determinista conservador resuelve la aritmética cuando todos los números están tipados por unidad y la pregunta nombra la cantidad; en el bench parseó 249/249 ítems aritméticos exactos con 0 falsos positivos en el conjunto de evaluación natural.

## Capacidades

- Enrutamiento a herramientas: emite JSON que selecciona una de ocho herramientas (`calc_ey`, `calc_ratio`, `calc_solids`, `calc_beverage_for_ey`, `calc_beverage_for_ratio`, `calc_dose_for_ratio`, `lookup_roast`, `lookup_processing`).
- Detección de argumentos faltantes: emite `{"action":"ask","missing":[...]}` cuando falta una entrada requerida.
- Derivación a respuesta en prosa: emite `{"action":"answer"}` para preguntas que no requieren cálculo ni consulta a tabla.
- Arrastre de contexto multi-turno: reutiliza entradas de turnos anteriores cuando el usuario no las repite.
- Selección de herramientas inversas: distingue entre calcular una masa objetivo (EY o ratio) y calcular una masa a partir de un objetivo.
- Negativos de sobre-uso: no dispara una herramienta cuando un ratio se menciona de pasada y no constituye una petición de cálculo.
- Cumplimiento de formato garantizado por gramática: JSON válido en todas las cuantizaciones.
- Conocimiento de dominio limitado: el camino de respuesta en prosa cubre definiciones, métodos de preparación y mapas de tueste/procesamiento, con 49/87 en las familias no aritméticas del bench.
- Sin soporte declarado de visión, audio, tool calling genérico ni agentes multi-paso fuera del contrato descrito.

## Casos de uso

- Asistente de café offline en dispositivos sin conectividad: el modelo en Q4_K_M ocupa 1,11 GB y se ejecuta con llama.cpp en hardware modesto; el wrapper en Python solo usa la biblioteca estándar, por lo que el conjunto completo funciona sin dependencias externas.
- Cálculo de rendimiento de extracción (EY): el usuario indica dosis, bebida y TDS; el modelo emite `calc_ey` y el wrapper calcula el porcentaje, evitando que el modelo tenga que hacer aritmética.
- Conversión entre ratio y masas: para preguntas del tipo "¿qué dosis necesito para 250 g a 1:16?", el modelo selecciona `calc_dose_for_ratio` y el wrapper valida que el ratio y la masa estén tipados en el texto.
- Recomendación de temperatura de preparación por nivel de tueste: el modelo enruta a `lookup_roast`, que devuelve la guía de temperatura asociada al nivel mencionado por el usuario.
- Perfil de sabor por procesamiento: el modelo enruta a `lookup_processing` para responder sobre procesos (por ejemplo, lavado, natural) a partir de una tabla determinista.
- Gestión de conversaciones multi-turno con datos incompletos: si el usuario dice "18 gramos" y luego "¿y el ratio?", el modelo arrastra la dosis del turno anterior y emite `{"action":"ask","missing":["beverage_g"]}` si falta la bebida.
- Integración en pipelines con validación estricta: el wrapper rechaza propuestas no fundamentadas y las registra, lo que permite auditar fallos de enrutamiento en producción sin exponer al usuario a respuestas incorrectas.
- Enrutamiento como primera etapa de un sistema mayor: la salida JSON puede alimentar un orquestador que decida entre ejecutar una herramienta, pedir datos o invocar el camino de prosa del mismo modelo.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. CoffeeBench es un conjunto sintético de 336 ítems sobre café (aritmética, definiciones, métodos de preparación y mapas de tueste/procesamiento). "System EM" significa que la pregunta pasó por router, validación de argumentos y herramienta o tabla.

| Build | System EM (336) | Aritmética | Routing eval (30 casos) |
|---|---|---|---|
| HF bf16 (referencia) | 0,890 | 249/249 | 0,967 |
| Q5_K_M | 0,887 | 249/249 | 1,000 |
| Q4_K_M | 0,884 | 249/249 | 0,967 |

En el conjunto separado de 30 casos de enrutamiento en lenguaje natural, Q5_K_M obtiene 1,000 en JSON válido, 1,000 en acción, 1,000 en herramienta y 1,000 en argumentos. El único fallo de Q4_K_M es una pregunta de TDS 1,35% interpretada como ratio en lugar de como llamada de rendimiento de extracción. Los 38 fallos restantes del bench corresponden a ítems de conocimiento del camino de respuesta (mapas de tueste/procesamiento, especie/origen, bebidas con leche). El camino de respuesta en prosa obtiene 49/87 en las familias no aritméticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para Q5_K_M y 1,2 GB para Q4_K_M, incluyendo overhead de contexto; el tamaño de archivo es 1,26 GB y 1,11 GB respectivamente.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre; el ejemplo del autor usa `-ngl 99` para descargar todas las capas en GPU. Funciona en RTX 3060, RTX 4060, RTX 4090 y superiores; también en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada de los últimos años y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--grammar-file toolcall.gbnf -c 2048 -ngl 99`; el repo está etiquetado como `endpoints_compatible`. No se documentan recetas para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito adicional: el wrapper `toolcall_dispatch.py` (18 KB, solo biblioteca estándar) es parte del contrato de despliegue; la model card indica explícitamente que no es opcional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3-1p7b-coffee-router-v3 | 1,7B | 2048 (uso documentado) | Router de herramientas de café con gramática y wrapper | Apache-2.0 | GGUF |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Modelo de propósito general | Apache-2.0 | safetensors, GGUF |
| Router genérico basado en prompt | depende del modelo | depende del modelo | Enrutamiento por prompt sin gramática ni validación | depende | depende |

La comparación con alternativas de la misma categoría (routers especializados con gramática y validación de argumentos) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia medible es el cumplimiento de formato garantizado por gramática y la tasa de acierto de enrutamiento reportada (1,000 en el conjunto de 30 casos para Q5_K_M), a costa de renunciar a capacidades generales y a la aritmética directa.

## Limitaciones y advertencias

- Deliberadamente malo en aritmética: el wrapper existe para que el modelo nunca tenga que calcular; usarlo sin el wrapper produce respuestas numéricas no fiables.
- Conocimiento limitado: el camino de respuesta en prosa obtiene 49/87 en las familias no aritméticas del bench (mapas de tueste/procesamiento, especie/origen, bebidas con leche).
- Dominio estrecho: entrenado exclusivamente para café y las ocho herramientas listadas; fuera de ese ámbito no hay garantía de comportamiento útil.
- Dependencia del wrapper: la validación de argumentos, la resolución determinista de aritmética y la conversión de propuestas no fundamentadas en `ask` viven en `toolcall_dispatch.py`; sin él, el contrato de seguridad se rompe.
- Dependencia de la gramática: la validez del JSON se garantiza en inferencia con `toolcall.gbnf`; sin decodificación restringida, la tasa de JSON válido no está garantizada.
- Contexto corto en el ejemplo de despliegue: 2048 tokens; el arrastre multi-turno consume ventana y no se documenta el máximo soportado por el modelo base.
- Idiomas: no disponibles; el system prompt y los ejemplos están en inglés.
- Sesgos: no documentados en la información proporcionada.
- Riesgo de alucinación: presente en el camino de respuesta en prosa, acotado en el camino de herramientas por la validación de argumentos.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3-1.7B conserva su propia licencia Apache-2.0, que debe respetarse.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; el proyecto es reciente (creado el 2026-11-14) y no cuenta con validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/greg1506/qwen3-1p7b-coffee-router-v3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo intermedio de café (referenciado en la model card): `qwen3-1p7b-coffee-open` (no se proporciona URL)
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de gramáticas GBNF en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/grammars/README.md
- No se han proporcionado enlaces a papers, blogs, demos ni al repositorio del wrapper.
