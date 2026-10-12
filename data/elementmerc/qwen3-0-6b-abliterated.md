# ElementMerc/qwen3-0.6b-abliterated

## Resumen

ElementMerc/qwen3-0.6b-abliterated es una variante "abliterated" del modelo denso Qwen/Qwen3-0.6B, publicada por el usuario ElementMerc. La abliteración es una técnica de edición de pesos que elimina el comportamiento de rechazo (refusal) del modelo proyectando sus pesos fuera de las direcciones que codifican ese comportamiento, sin ningún entrenamiento adicional. El resultado conserva la arquitectura, el tamaño (596.049.920 parámetros, aproximadamente 0,6 B) y la precisión del modelo base, pero responde a peticiones que el original declina.

La relevancia de esta ficha es doble. Por un lado, es un modelo de generación de texto en inglés, con licencia Apache 2.0, pensado para ejecución local en hardware muy modesto (el repositorio ocupa 1,2 GB). Por otro, se publica como artefacto de un experimento de interpretabilidad muy concreto: determinar si al eliminar el reflejo de rechazo se elimina también el conocimiento que el modelo tiene sobre el daño. La model card incluye un aviso de corrección del 1 de octubre de 2026 en el que el autor retira todas las cifras publicadas anteriormente, porque las tres herramientas de medición utilizadas tenían fallos que alteraban lo medido.

El propio autor advierte de que el modelo es un modelo de razonamiento (emite un bloque de pensamiento antes de responder), lo que agrava los problemas de medición: parte del lenguaje de rechazo aparece dentro del bloque de razonamiento y no se traduce en un rechazo efectivo. En el momento de redactar esta ficha no hay métricas fiables asociadas al modelo; el autor ha anunciado una reconstrucción de la tarjeta con nuevas mediciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), sin mezcla de expertos. Pesos editados por abliteración, sin reentrenamiento |
| Parámetros totales | 596.049.920 (≈0,6 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base Qwen/Qwen3-0.6B: 32.768 tokens nativos. No especificada en la ficha del modelo |
| Tipos de cuantización | safetensors con la precisión original del modelo base (sin cambios); builds GGUF en repositorio aparte para llama.cpp, Ollama y LM Studio (tipos concretos no especificados) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; GGUF (repositorio separado) |

Datos adicionales: repositorio de 1,2 GB, 266 descargas y 0 likes en el momento de la consulta. Creado el 27 de julio de 2026 y actualizado el 11 de octubre de 2026. Compatible con Text Generation Inference (TGI) y con endpoints alojados.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only denso de aproximadamente 0,6 B de parámetros, y no introduce ningún cambio arquitectónico. La modificación consiste exclusivamente en una edición directa de los pesos mediante senbonzakura, la herramienta del propio autor. A diferencia de los enfoques clásicos de abliteración, que restan una única dirección global de rechazo, senbonzakura busca una proyección por capa, optimizada contra un conjunto de validación con una penalización KL para minimizar la perturbación del comportamiento general del modelo. La búsqueda se ejecutó durante 100 ensayos sobre este modelo.

No hubo actualizaciones de gradiente, ni datos de entrenamiento, ni ajuste fino: los pesos se editan directamente y la precisión del modelo base se mantiene sin cambios. El autor declara explícitamente que la publicación responde a una pregunta de investigación (si la eliminación del reflejo de rechazo arrastra consigo el conocimiento sobre el daño) y que, por tanto, el resultado principal del repositorio son las mediciones, no el modelo en sí.

La model card advierte de que se trata de un modelo de razonamiento: genera un bloque de pensamiento antes de emitir la respuesta. Este detalle es relevante porque invalida parte del proceso de evaluación previo, y porque el autor publica que el propio modelo base, medido con otro conjunto de validación, obtiene una tasa de rechazo del 4,7 % con el scorer del proyecto y del 38,3 % con la regla de palabras clave que usa Heretic. La diferencia entre ambas métricas se atribuye precisamente al bloque de razonamiento.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con plantilla de chat compatible con `apply_chat_template`.
- Modo de razonamiento: el modelo emite un bloque de pensamiento antes de responder, característica heredada de la familia Qwen3.
- Ausencia total de rechazo: responde a solicitudes que el modelo base declina, incluidas las dañinas. Es una propiedad del artefacto, no un fallo.
- Ejecución local en hardware muy limitado, incluida inferencia en CPU y en GPU de gama de entrada.
- Compatibilidad con tool calling y function calling: no documentada en la ficha del modelo. Al conservar los pesos del base Qwen3-0.6B, la capacidad de partir de la que se hereda, pero no está verificada ni declarada por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la información disponible.
- Capacidades multilingües: solo se declara inglés (`language: en`); no se documentan otros idiomas.
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- Investigación sobre mecanismos de rechazo: el modelo se utiliza como artefacto experimental para estudiar si la dirección de rechazo es separable del conocimiento sobre el daño. Es el uso para el que fue publicado y para el que está documentado.
- Red teaming y evaluación de seguridad: sirve como modelo de referencia sin capa de seguridad para probar detectores de contenido dañino, clasificadores de moderación y pipelines de filtrado, en un entorno aislado.
- Generación de datos sintéticos para entrenar clasificadores de seguridad: al no rechazar, puede producir ejemplos etiquetados de peticiones y respuestas problemáticas que alimenten un clasificador externo.
- Asistente local de redacción y resumen en inglés: con 0,6 B de parámetros y 1,2 GB de pesos, se ejecuta en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, útil para tareas de texto sin requisitos de precisión alta.
- Fines educativos y demostraciones de abliteración: permite reproducir el efecto de la edición de pesos sobre el comportamiento del modelo en un equipo de gama baja, con tiempos de carga y ejecución muy reducidos.
- Base para ajuste fino sobre dominios donde los rechazos del modelo original estorban (por ejemplo, seguridad ofensiva documentada, ficción con contenido sensible o investigación legal), siempre que el despliegue resultante añada su propia capa de seguridad y filtrado.
- Preprocesado y generación de texto en pipelines por lotes de bajo coste: por su tamaño, es viable ejecutar miles de generaciones cortas en CPU o en una única GPU pequeña, por ejemplo para normalización o etiquetado preliminar de corpus en inglés.
- Componente de comparación en estudios de interpretabilidad: al compartir arquitectura y pesos base con Qwen3-0.6B, permite experimentos controlados de "base frente a abliterado" cambiando una sola variable.

En todos los casos orientados a producción, el autor indica explícitamente que cualquier despliegue que exponga el modelo a terceros necesita su propia capa de seguridad, porque el modelo no incorpora ninguna.

## Benchmarks y rendimiento

El autor ha retirado expresamente todas las cifras publicadas en la model card (aviso de corrección del 1 de octubre de 2026). Los motivos declarados son tres fallos de la herramienta de medición: un filtro que aceptaba todos los candidatos en lugar de seleccionar solo las direcciones que portan rechazo, un detector de evasivas que puntuaba respuestas conformes como rechazos suaves, y una fila de discriminación de daño (AUC) retirada por la propia documentación del proyecto. No existe, por tanto, ningún resultado de benchmark válido para este modelo.

A modo de registro histórico, y marcada como retirada y no utilizable, la tabla original era la siguiente:

| Métrica (retirada) | Base | Abliterado |
|---|---|---|
| Tasa de rechazo (200 prompts dañinos) | 0,0 % | 0,0 % |
| Discriminación de daño (AUC) | 0,7293 | 0,6312 |

El propio autor indica que estas cifras no deben citarse ni escalarse. La única medición posterior publicada se refiere al modelo base, no al abliterado: 4,7 % de rechazo con el scorer del proyecto y 38,3 % con la regla de palabras clave de Heretic, sobre 128 filas de validación del conjunto de evaluación incluido en el proyecto. Esa medición tampoco es directamente comparable con la tabla retirada ni se ha publicado todavía como artefacto con su intervalo y su procedencia.

No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estándar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 1,2 GB solo para los pesos, más caché KV y overhead; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: del orden de 0,8 a 1,2 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): del orden de 0,5 a 0,8 GB.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 y tarjetas con 4 GB o más. También en GPUs integradas y en Apple Silicon mediante Metal.
- Inferencia en CPU plenamente viable gracias al tamaño; el repositorio GGUF está preparado para llama.cpp, Ollama y LM Studio.
- No requiere A100, H100 ni GPUs de centro de datos.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM, Text Generation Inference (etiqueta `text-generation-inference`), llama.cpp, Ollama, LM Studio y endpoints alojados (etiqueta `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comportamiento de rechazo | Disponibilidad |
|---|---|---|---|---|---|
| ElementMerc/qwen3-0.6b-abliterated | 0,596 B | Heredado del base (32.768 tokens nativos) | Apache-2.0 | Declarado 0,0 % en la tabla retirada y no verificado; el autor advierte de que la medición no es fiable | HuggingFace, safetensors y GGUF |
| Qwen/Qwen3-0.6B (base) | 0,596 B | 32.768 tokens nativos | Apache-2.0 | 4,7 % con el scorer del proyecto y 38,3 % con la regla de palabras clave de Heretic, sobre 128 filas | HuggingFace |
| Otras variantes abliteradas de Qwen3-0.6B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos densos comparables de ~0,5-1 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más sólida disponible es contra el modelo base, del que este artefacto solo se diferencia por la edición de pesos. No se ha documentado en la información proporcionada ninguna comparación con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no rechaza. Es su función principal y el riesgo principal: responderá a peticiones que el modelo base declina, incluidas las dañinas, y no incorpora ninguna capa de seguridad propia. Cualquier despliegue expuesto a terceros debe añadir moderación externa.
- Las métricas de la model card están retiradas por el propio autor. No hay ninguna medición fiable del efecto real de la abliteración sobre este modelo, ni de la degradación de sus capacidades generales.
- La abliteración puede degradar capacidades generales. La penalización KL del método busca minimizar el daño, pero no garantiza que sea nulo, y no se han publicado evaluaciones que lo cuantifiquen.
- Modelo de razonamiento: emite un bloque de pensamiento antes de responder. Esto complica la evaluación automática del rechazo, como documenta el propio autor, y aumenta el consumo de tokens por respuesta.
- Riesgo de alucinación alto por tamaño: con 0,6 B de parámetros, la fiabilidad factual, el razonamiento complejo y las matemáticas son limitados. No se han publicado métricas al respecto.
- Idioma: solo se declara inglés. El comportamiento en castellano u otros idiomas no está documentado y no puede asumirse.
- Modelo pequeño: no es adecuado para tareas que exijan razonamiento profundo, código complejo o contextos muy largos con recuperación precisa de información.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece ninguna garantía ni asume responsabilidad sobre el contenido generado. La licencia no exime de cumplir la normativa aplicable sobre contenido dañino.
- Adopción muy baja (266 descargas, 0 likes) y ficha en reconstrucción, lo que reduce la trazabilidad de cualquier resultado que se obtenga con el modelo.
- No se documentan capacidades de tool calling, agentes ni multimodalidad, por lo que no deben asumirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElementMerc/qwen3-0.6b-abliterated
- Builds GGUF (llama.cpp, Ollama, LM Studio): https://huggingface.co/ElementMerc/qwen3-0.6b-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de senbonzakura: https://github.com/elementmerc/senbonzakura
- Registro de cambios del proyecto: https://github.com/elementmerc/senbonzakura/blob/main/CHANGELOG.md
- Página "what we got wrong" del proyecto: https://elementmerc.github.io/senbonzakura/guide/what-we-got-wrong
