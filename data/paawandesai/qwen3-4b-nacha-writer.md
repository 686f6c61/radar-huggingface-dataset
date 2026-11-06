# paawandesai/qwen3-4b-nacha-writer

## Resumen

Qwen3-4B NACHA ACH file writer es un adaptador LoRA entrenado sobre Qwen3-4B (de Alibaba) por el usuario paawandesai, especializado en una tarea muy concreta: generar archivos NACHA ACH completos y byte a byte correctos a partir de especificaciones de pago en lenguaje natural. Un archivo ACH es un formato bancario estricto donde cada registro debe tener exactamente 94 caracteres, con padding correcto, totales de lote y fichero, hashes de entrada y bloques de relleno de 9; un solo carácter erróneo invalida el archivo. El modelo resuelve este problema de generación estructurada con precisión extrema, algo en lo que los modelos frontera como GPT-5.5 o Claude Opus 5.5 fallan sistemáticamente según las evaluaciones del autor.

La relevancia de este trabajo está en demostrar que un modelo pequeño de 4B parámetros, afinado con datos sintéticos generados por código, puede superar a modelos mucho mayores en una tarea de dominio estrecho: en el conjunto de evaluación de 20 especificaciones, el adaptador obtiene 18/20 aciertos exactos frente a 17/20 de Claude Opus 5.5 y 3/20 de GPT-5.5. La metodología incluye un paso intermedio de "worksheet" (hoja de trabajo numerada con recuentos de registros, padding campo a campo y sumas acumuladas) antes de emitir el archivo final dentro de un bloque de código ```ach.

El resultado se valida por código (comparación exacta byte a byte), no por juicio humano, y los conjuntos de evaluación usan semillas disjuntas del entrenamiento. Es un ejemplo notable de especialización vertical de modelos pequeños para tareas de formato financiero regulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (Qwen3-4B) |
| Parametros totales | 4.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE; el adaptador añade pesos LoRA r32 en todas las proyecciones) |
| Longitud de contexto | 32.768 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante entrenamiento) |
| Idiomas soportados | no disponible (heredados de Qwen3-4B; el dominio de uso es inglés técnico sobre pagos ACH) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, 0,8 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3-4B, un transformer decoder denso de 4.000 millones de parámetros. Sobre él se entrena un adaptador LoRA con rango 32 y alpha 64 aplicado a todas las proyecciones de atención y MLP, lo que explica el tamaño reducido del repositorio (0,8 GB) frente a los pesos completos del modelo base.

El entrenamiento usa TRL SFTTrainer con learning rate 2e-4 con calendario coseno, batch size 8, longitud máxima de 32.768 tokens, precisión bf16 y una única época sobre una GPU NVIDIA L40S. Los datos de entrenamiento son completamente sintéticos, generados por código (el módulo `finspread/ach.py` del repositorio del proyecto), con 6.000 archivos en la versión actual (v7): los 3.000 de la v3 más 3.000 adicionales con variación en todos los campos. Los conjuntos de evaluación emplean semillas disjuntas de las de entrenamiento, lo que garantiza que las métricas no reflejen memorización de ejemplos vistos.

La innovación metodológica principal es el formato de salida en dos fases: el modelo escribe primero una hoja de trabajo con entradas numeradas, recuentos de registros y bloques, el padding o truncado de cada campo de texto agrupado en bloques de 5 caracteres, y las sumas acumuladas en grupos de 3 dígitos con acarreos; solo después emite el archivo ACH final. Esta descomposición actúa como razonamiento intermedio (chain-of-thought estructurado) que reduce errores aritméticos y de posición en los campos de longitud fija.

## Capacidades

- Generación de archivos NACHA ACH completos y válidos byte a byte a partir de especificaciones en lenguaje natural (originador, lotes, entradas con números de ruta, cuentas e importes).
- Cálculo correcto de totales de lote y de fichero, hashes de entrada, padding de campos de longitud fija (registros de exactamente 94 caracteres) y conteo de bloques de relleno de 9.
- Razonamiento aritmético estructurado mediante la hoja de trabajo previa (sumas acumuladas en grupos de 3 dígitos con acarreos).
- Salida estructurada determinista dentro de un único bloque de código ```ach, apta para verificación automática por código.
- Manejo de especificaciones multi-lote y multi-entrada dentro de la ventana de contexto de 32.768 tokens.
- No está diseñado ni evaluado para chat general, código general, razonamiento general ni capacidades multimodales.

## Casos de uso

- Generación automatizada de ficheros ACH para plataformas de pagos: una fintech puede integrar el modelo en su backend para convertir órdenes de pago en lenguaje natural o estructuradas en archivos NACHA listos para enviar al banco, con verificación automática por código antes del envío.
- Prototipado y pruebas de sistemas bancarios: los equipos de QA pueden generar archivos ACH sintéticos pero válidos para poblar entornos de test sin construir generadores a medida.
- Migración de sistemas legacy: conversión de datos de pagos almacenados en formatos internos hacia el estándar NACHA, revisando la hoja de trabajo intermedia para auditar el proceso.
- Asistente interno para operaciones de tesorería: un operador describe los pagos del día y el modelo produce el fichero correspondiente, reduciendo errores manuales de padding y totales.
- Herramienta educativa sobre el formato NACHA: la hoja de trabajo explica explícitamente cómo se rellena y trunca cada campo y cómo se calculan los totales, útil para formar a desarrolladores en el estándar.
- Benchmark interno de precisión en generación estructurada: dado que la evaluación es automática (comparación exacta byte a byte), sirve como caso de estudio para comparar afinado de modelos pequeños frente a modelos frontera en tareas de formato estricto.

## Benchmarks y rendimiento

Resultados publicados por el autor, verificados por código (coincidencia exacta del archivo). Los conjuntos de evaluación usan semillas disjuntas del entrenamiento:

| Conjunto | Qwen3-4B base | v3 (Early) | v7 (actual) |
|---|---|---|---|
| eval (50) | 0 | 38 | 45 |
| holdout (100), semillas nuevas | 0 | 85 | 99 |
| nombres no vistos, tamaño normal (10) | - | 0 | 9 |
| nombres de entrenamiento, ficheros mayores (10) | - | 1 | 6 |
| todos los campos variados (30) | - | 0 | 20 |
| especificaciones escritas a mano (4) | - | 0 | 2 |
| ficheros mayores + nombres no vistos (50) | - | 0 (21% de líneas) | 11 (73% de líneas) |

Comparación con modelos frontera en las primeras 20 especificaciones de eval (semillas 400-419, mejor prompt por modelo):

| Modelo | Aciertos exactos (de 20) |
|---|---|
| Claude Opus 5.5 | 17 |
| GPT-5.5 | 3 |
| Claude Sonnet 5.5 | 1 |
| Este adaptador (v7) | 18 |

## Requisitos de hardware

- El adaptador LoRA ocupa 0,8 GB; para inferencia hay que cargar además Qwen3-4B en bf16, lo que requiere aproximadamente 8-9 GB de VRAM para el modelo base completo.
- Cabe con holgura en GPUs de consumo como una RTX 4090 (24 GB) o una RTX 3090, incluso con contextos largos cercanos a los 32.768 tokens; con fusión del adaptador o cuantización del base (no publicada oficialmente), podría caber en GPUs de 12 GB.
- GPUs recomendadas: cualquier GPU con 16 GB o más de VRAM (RTX 4090, RTX 4080, A10G, L4, L40S).
- Despliegue: el propio autor proporciona `eval.py` con soporte del motor vLLM; al ser un adaptador PEFT estándar, también es compatible con llama.cpp (previa conversión a GGUF, no publicada), Ollama, TGI y la API de PEFT/transformers de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B NACHA writer (este) | LoRA sobre Qwen3-4B | 4B (base) | Generación de ficheros ACH exactos | Apache 2.0 | Hugging Face, abierto |
| Qwen/Qwen3-4B (base) | Transformer denso | 4B | Uso general | Apache 2.0 | Hugging Face, abierto |
| Claude Opus 5.5 | Modelo frontera propietario | no disponible | Uso general (17/20 en ACH) | Propietaria | API de Anthropic |
| GPT-5.5 | Modelo frontera propietario | no disponible | Uso general (3/20 en ACH) | Propietaria | API de OpenAI |

En su dominio estrecho, este adaptador de 4B supera a los modelos frontera evaluados por el autor, con la ventaja añadida de despliegue local, coste marginal por inferencia y licencia permisiva.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: fuera de la generación de ficheros ACH, el comportamiento del modelo tras el afinado no está evaluado; no sustituye a Qwen3-4B para chat general, código o razonamiento general.
- Limitación conocida declarada por el autor: en ficheros mayores (2-3 lotes de 15-24 entradas) el modelo aún comete errores en las sumas acumuladas largas; la mayoría de fallos se concentran en unas pocas líneas de los totales de control (11/50 aciertos exactos en el conjunto de ficheros grandes con nombres no vistos).
- Rendimiento degradado con especificaciones escritas a mano (2/4) frente a especificaciones sintéticas, lo que sugiere sensibilidad al estilo del prompt.
- Los datos de entrenamiento son sintéticos generados por código; puede no cubrir todas las peculiaridades de ficheros ACH reales producidos por sistemas bancarios en producción.
- Riesgo de alucinación: en tareas de formato financiero cualquier error de un solo carácter invalida el fichero; es imprescindible validar la salida por código antes de enviarla a un banco, tal como hace la propia evaluación del autor.
- Sesgos: no aplicables de forma relevante al dominio, aunque el modelo hereda los sesgos generales de Qwen3-4B si se usa fuera de su especialidad.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero recuerda que el modelo base Qwen3-4B debe descargarse y desplegarse por separado.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/paawandesai/qwen3-4b-nacha-writer
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/paawandesai/nacha-ach-writer
- Demo en vivo (base vs afinado, evaluado por código): https://moe-slm--nacha-demo-web.us-east.modal.run
- Repositorio con código, sets de evaluación y script de entrenamiento: https://labs.gauntletai.com/paawandesai/moe_slm
