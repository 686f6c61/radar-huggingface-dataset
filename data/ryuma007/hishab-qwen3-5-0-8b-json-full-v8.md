# ryuma007/hishab-qwen3.5-0.8b-json-full-v8

## Resumen

`hishab-qwen3.5-0.8b-json-full-v8` es un ajuste fino completo (full fine-tune) del modelo `Qwen/Qwen3.5-0.8B`, publicado por el usuario ryuma007. Está especializado en una única tarea: convertir un mensaje sobre dinero escrito en banglish (bengalí transcrito a caracteres latinos), bengalí o inglés —a menudo mezclados— en un array JSON de transacciones financieras con las claves `description`, `amount`, `category` y `type`.

El modelo tiene 752.393.024 parámetros (unos 0,75 mil millones), pesos en bf16, ocupa 1,5 GB de repositorio y se distribuye bajo licencia Apache 2.0. El ajuste se hizo sobre el dataset sintético `ryuma007/hishab-synthetic-v4` durante 3 épocas con una tasa de aprendizaje de 3e-05, actualizando todos los pesos.

Su relevancia es de nicho pero concreta: la extracción estructurada de transacciones a partir de texto coloquial multilingüe (con abreviaturas como `1.5k` o `2 lakh` que hay que expandir a números) es el paso previo típico de cualquier aplicación de finanzas personales, y un modelo de menos de mil millones de parámetros con 100% de JSON válido y 89,6% de coincidencia exacta del conjunto de transacciones en un test reservado de 518 filas resulta desplegable en hardware muy modesto, incluso sin GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, variante de texto (tag `qwen3_5_text`). Detalles internos de la arquitectura del modelo base: no disponible |
| Parametros totales | 752.393.024 (≈0,75 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos completos en este repositorio); builds GGUF para llama.cpp en repositorio aparte, con niveles de cuantización no especificados |
| Idiomas soportados | bengalí (`bn`), inglés (`en`), banglish (bengalí en caracteres latinos) y mensajes con mezcla de los tres |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); también GGUF en el repositorio `ryuma007/hishab-qwen3.5-0.8b-json-full-v8-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen3.5. El autor no detalla en la model card la configuración interna del modelo base (número de capas, cabezas de atención, tipo de atención, vocabulario), por lo que esos datos quedan como no disponibles. Lo que sí se documenta es el procedimiento de ajuste: un fine-tune completo sobre todos los pesos, 3 épocas, tasa de aprendizaje 3e-05, sobre el dataset sintético `ryuma007/hishab-synthetic-v4`.

No se menciona uso de RLHF, DPO ni ninguna otra etapa de alineación posterior; el entrenamiento es de tipo supervisado sobre pares entrada-salida donde la salida es siempre el array JSON. Una particularidad operativa relevante es que Qwen3.5 se entrena y se sirve con el modo de razonamiento desactivado, es decir, con un bloque `<think>` vacío en el turno del asistente. El prompt de sistema usado en el entrenamiento está fijado y debe emplearse de forma literal para reproducir el comportamiento esperado. El pipeline de entrenamiento está publicado en el repositorio de GitHub `RaihanulHaque/hishab`, dentro del directorio `ml/`.

## Capacidades

- Extracción de transacciones financieras: genera un array JSON de objetos con las claves `description`, `amount`, `category` y `type` a partir de texto libre.
- Expansión de cantidades abreviadas o escritas en palabras: interpreta formas como `1.5k` o `2 lakh` y las convierte en números en BDT.
- Clasificación en 14 categorías cerradas: `food`, `grocery`, `rent`, `utilities`, `mobile_recharge`, `transport`, `tuition`, `salary`, `gift`, `loan`, `shopping`, `medical`, `entertainment`, `other`.
- Distinción entre ingreso y gasto mediante el campo `type` (`income` o `expense`).
- Manejo de entradas multilingües: bengalí, inglés, banglish y mensajes con mezcla de idiomas dentro de la misma frase.
- Salida determinista y parseable: 100% de JSON válido en el conjunto de test reservado, con posibilidad de devolver un array vacío cuando no hay ninguna transacción en el mensaje.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo se sirve con el modo de razonamiento desactivado.
- Capacidades de visión o audio: no disponibles.
- Generación de texto general, código o matemáticas: fuera del alcance documentado del ajuste.

## Casos de uso

- Registro automático de gastos en una app de finanzas personales: el usuario escribe en lenguaje natural ("ayer pagué 5000 de tuition y 80 de rickshaw") y el modelo devuelve directamente las filas listas para insertar en la base de datos, sin necesidad de formularios estructurados.
- Ingesta de mensajes bancarios y de billeteras móviles: al recibir SMS o notificaciones de transacciones en bengalí o inglés, el modelo extrae importe, concepto, categoría y signo, lo que permite construir un libro mayor automático.
- Normalización de notas de voz transcritas: en un pipeline de reconocimiento de voz a texto donde la transcripción sale en banglish, el modelo convierte ese texto informal en transacciones estructuradas.
- Clasificación de gastos para informes y presupuestos: las categorías cerradas permiten agregaciones mensuales por tipo de gasto sin post-procesado adicional, y el campo `type` separa ingresos de egresos.
- Asistentes conversacionales de presupuesto para el mercado de Bangladés: al estar entrenado con cantidades en BDT y con terminología local, encaja en productos dirigidos a usuarios que operan en taka.
- Extracción por lotes (batch) sobre históricos de conversaciones: procesar miles de mensajes de chat para reconstruir el histórico financiero de un usuario o de un conjunto de usuarios con fines analíticos.
- Despliegue en el borde o embebido: con menos de 800 millones de parámetros y builds GGUF, puede ejecutarse en local o en un servidor pequeño, lo que resulta adecuado cuando los datos financieros no pueden salir del dispositivo por motivos de privacidad.
- Generación de datos etiquetados para otros sistemas: usar el modelo como etiquetador para preanotar transacciones que después se revisan o se usan como conjunto de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test reservado de 518 filas nunca vistas en entrenamiento:

| Metrica | Valor |
|---|---|
| Coincidencia exacta del conjunto de transacciones | 89,6% |
| F1 por tupla | 94,4% |
| JSON válido | 100,0% |
| Coincidencia exacta en banglish | 83,1% |
| Coincidencia exacta en bengalí | 92,0% |
| Coincidencia exacta en inglés | 94,9% |
| Coincidencia exacta en mensajes mixtos | 97,3% |
| Coincidencia exacta cuando los números van escritos en palabras (357 filas) | 84,9% |

No se han publicado resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El fichero `eval_hf.json` del repositorio contiene el desglose completo de resultados.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 1,5 GB en disco y en memoria. Con caché KV, la VRAM necesaria estimada se sitúa en torno a 2-3 GB.
- Cuantización GGUF tipo Q4: en torno a 0,5 GB; tipo Q8: en torno a 0,8 GB (estimaciones basadas en el número de parámetros, no cifras publicadas por el autor).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs integradas con memoria compartida. También es viable la inferencia en CPU.
- Las GPUs de gama alta (A100, H100) están sobredimensionadas para este modelo y solo tendrían sentido para servir muchas réplicas o lotes muy grandes en paralelo.
- Opciones de despliegue: Transformers (pesos safetensors), llama.cpp y Ollama mediante los builds GGUF, y servidores de inferencia como vLLM o TGI para despliegues con concurrencia.
- Latencia y throughput: no disponible. No se han publicado cifras de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| hishab-qwen3.5-0.8b-json-full-v8 | 752.393.024 | no disponible | Extracción de transacciones financieras a JSON (bn/en/banglish) | Apache 2.0 | safetensors bf16, GGUF |
| Qwen/Qwen3.5-0.8B (base) | ≈0,8 mil millones | no disponible | Modelo de propósito general | Apache 2.0 (según el modelo base) | safetensors |
| ryuma007/hishab-qwen3.5-0.8b-json-lora-GGUF | no disponible (variante LoRA del mismo base) | no disponible | Misma tarea de extracción, versión LoRA | Apache 2.0 | GGUF |

No se dispone de datos de rendimiento comparativos entre estas variantes ni frente a otros modelos de extracción de información, por lo que la comparación se limita a parámetros, licencia, formato y tarea. No disponible para alternativas de otras familias con la misma función.

## Limitaciones y advertencias

- Modelo altamente especializado: no es válido como asistente de propósito general ni para generación de texto libre, código o matemáticas.
- El rendimiento cae en banglish (83,1% de coincidencia exacta) y cuando las cantidades aparecen escritas en palabras (84,9%), que son precisamente los casos más frecuentes en lenguaje coloquial.
- Riesgo de error en torno al 10% de los mensajes en el conjunto exacto: puede omitir transacciones, inventar importes o asignar categorías incorrectas, por lo que en producción conviene validar la salida antes de persistirla.
- Requiere usar el prompt de sistema de entrenamiento de forma literal; su uso con otro prompt no está validado y es probable que degrade el resultado.
- Debe servirse con el modo de razonamiento desactivado (bloque `<think>` vacío), tal y como se entrenó.
- Solo cubre bengalí, inglés y banglish. No hay soporte documentado para otros idiomas, incluido el español.
- La longitud de contexto no está publicada, por lo que no hay garantías sobre el comportamiento con entradas largas o conversaciones multi-turno extensas.
- La categoría `other` actúa como cajón de sastre y puede absorber clasificaciones erróneas sin que el error sea evidente.
- La licencia Apache 2.0 permite uso comercial, pero no se detalla la procedencia ni el proceso de generación del dataset sintético de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- No se han publicado evaluaciones en benchmarks estándar ni auditorías de sesgo, por lo que se desconoce el comportamiento diferencial entre dialectos o variantes ortográficas del banglish.
- Fecha de creación y actualización del repositorio: 2026-10-16. El proyecto parece reciente y sin historial de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-json-full-v8
- Builds GGUF para llama.cpp: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-json-full-v8-GGUF
- Variante LoRA en GGUF: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-json-lora-GGUF
- Pipeline de entrenamiento: https://github.com/RaihanulHaque/hishab
- Dataset de entrenamiento: https://huggingface.co/datasets/ryuma007/hishab-synthetic-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Resultados completos de evaluación: fichero `eval_hf.json` en el repositorio del modelo
- Ficha de registro en free2aitools (variante LoRA): https://free2aitools.com/model/ryuma007/hishab-qwen3.5-0.8b-json-lora-gguf
