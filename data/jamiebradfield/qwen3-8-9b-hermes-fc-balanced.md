# JamieBradfield/qwen3.8-9b-hermes-fc-balanced

## Resumen

Qwen3.8-9B Hermes FC — Balanced es un ajuste fino por QLoRA del modelo Empero/Qwen3.8-9B-Distill, publicado por el usuario JamieBradfield en Hugging Face. Su objetivo es enseñar a un modelo de 9.200 millones de parámetros a manejar el conjunto de herramientas del agente Hermes: invocación de funciones, uso de herramientas y planificación multi-paso con llamadas a `todo`. Se distribuye con licencia Apache-2.0 y pesos en BF16 (12 shards, 18,4 GB) más una cuantización GGUF ROCmFPX en un repositorio complementario.

El modelo parte de una arquitectura `Qwen3_5ForConditionalGeneration` con una cabeza MTP (multi-token prediction) de 15 claves conservada del modelo base, vocabulario ampliado de 248.077 a 248.079 tokens (se añaden `<|tool_call|>` y `<|tool_response|>`) y torre visual eliminada, por lo que es estrictamente texto. El entrenamiento combina 1.543 filas en formato ShareGPT: 979 trayectorias reales del agente Hermes, ventanas de SWE-rebench remapeadas a herramientas Hermes, unidades de llamada de APIGen-MT-5k y filas PREF de When2Call.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de SFT sobre un modelo pequeño para uso de herramientas. Por otro, su model card incluye una corrección metodológica del 3 de septiembre de 2026 en la que el propio autor reconoce que el arnés de evaluación utilizado medía una interfaz sintética (esquemas embebidos en el texto del sistema, XML crudo) y no la ruta nativa de `tools` de OpenAI que Hermes emplea realmente. El programa de ajuste fino quedó congelado en esa fecha y el modelo base es ahora el valor por defecto del autor en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForConditionalGeneration` con cabeza MTP (multi-token prediction) de 15 claves; torre visual eliminada (solo texto) |
| Parametros totales | 9.195.119.616 (9,20B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la reproducción de la evaluación usa `CTX=65536` en la configuración de servicio |
| Tipos de cuantizacion | BF16 (merge completo); GGUF cuantizado ROCmFPX en repositorio complementario |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (12 shards, 18,4 GB); GGUF en repo complementario |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 9,20B parámetros derivado de Empero/Qwen3.8-9B-Distill, con la particularidad de conservar la cabeza MTP del base tras el merge, lo que permite decodificación multi-token especulativa si el runtime la soporta. El ajuste se aplica como QLoRA de 4 bits sobre los pesos ya fusionados de la versión v2 (`qwen3.8-9b-hermes-fc-real-traces`), de modo que el envoltorio de herramientas y los tokens especiales ya estaban integrados en el punto de partida. Hiperparámetros: rango 16, alpha 16, dropout 0, batch 1 con acumulación de gradiente 8 (efectivo 8), learning rate 2e-4, warmup 0,1, longitud máxima de secuencia 6.144 y 1 época equivalente a 193 pasos, con pérdida final de 0,0552.

Los datos de entrenamiento suman 1.543 filas en formato ShareGPT: 979 filas de la v2 (933 trayectorias reales del agente Hermes más 46 de relleno de huecos, descartando las filas lambda), ventanas de SWE-rebench generadas con Qwen3-Coder-480B en OpenHands y remapeadas a herramientas Hermes (`execute_bash`→`terminal`, `str_replace_editor`→`read_file`/`write_file`/`patch`), unidades de llamada de APIGen-MT-5k (GPT-4o y DeepSeek-V3) y filas PREF de When2Call (Mixtral-8x22B). No se documenta en la información disponible el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO; el procedimiento es SFT supervisado.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia.
- Llamada a funciones y uso de herramientas en el conjunto del agente Hermes: `terminal`, `read_file`, `write_file`, `patch`, `todo`, búsqueda web y otras herramientas del ecosistema.
- Planificación multi-paso con llamada a `todo` como primer paso en tareas compuestas; según la evaluación corregida del autor, esta es la única capacidad que la línea de ajuste fino añadió de forma medible (de 3/10 en el base a 8/10 en este checkpoint y 10/10 en el retrain limpio armB2).
- Tokens especiales dedicados `<|tool_call|>` y `<|tool_response|>` para delimitar invocaciones y respuestas de herramientas.
- Razonamiento multi-paso orientado a agentes, con trayectorias de ejecución de comandos y edición de ficheros.
- Capacidad multilingüe: limitada al inglés según la model card.
- Capacidades de visión: no disponibles (la torre visual fue eliminada en el merge).
- Capacidades de audio: no disponibles.

## Casos de uso

- Automatización de tareas de terminal en entornos de desarrollo: el modelo puede emitir llamadas `terminal` con comandos de shell dentro de un bucle de agente, inspeccionar la salida y encadenar la siguiente acción, lo que encaja en flujos de tipo OpenHands o Hermes para tareas de mantenimiento de repositorios.
- Edición de código guiada por parches: con las herramientas `read_file`, `write_file` y `patch`, puede localizar un fichero, leer su contenido, aplicar un cambio quirúrgico y verificar el resultado, un patrón útil para pipelines de refactorización asistida en CI/CD.
- Planificación de tareas largas con `todo`: dado que el ajuste mejora la emisión de un primer paso de planificación en tareas multi-paso, resulta adecuado como capa de descomposición en agentes que necesitan registrar subtareas antes de ejecutar herramientas.
- Generación de datos sintéticos de uso de herramientas: las trayectorias etiquetadas con llamadas y respuestas de herramienta pueden reutilizarse para entrenar o evaluar otros modelos pequeños en formato ShareGPT.
- Evaluación de arneses de function calling: el modelo y su corrección metodológica sirven como caso de estudio para validar que un banco de pruebas usa la ruta nativa de `tools` en lugar de esquemas embebidos en el prompt, evitando falsos positivos y negativos.
- Prototipado de asistentes de operaciones con contención de llamadas: para tareas de trivia o conversación general, el modelo debe configurarse con instrucciones explícitas de no invocar herramientas, ya que la evaluación corregida muestra deriva de herramienta en 4/10 casos de trivia.
- Despliegue en hardware modesto mediante GGUF: la cuantización ROCmFPX permite servir el modelo en GPUs de consumo para pruebas de agentes en local, con contexto configurable hasta 65.536 tokens en la configuración de referencia.

## Benchmarks y rendimiento

La model card incluye una batería nativa de 4 herramientas con decodificación greedy, corregida por el autor el 3 de septiembre de 2026. Los resultados comparan el modelo base sin ajuste, este checkpoint (v28 ckpt-175) y un retrain limpio (armB2-175):

| Modelo | Tier-1 disparado | Tier-1 name=todo | Tier-2 todo primero | Tier-3 disparado (deseado 0) | Tier-4 disparado (deseado 0) |
|---|---|---|---|---|---|
| Base (sin ajuste) | 18/20 | 17/20 | 3/10 | 5/10 | 0/10 |
| v28 ckpt-175 (este modelo) | 17/20 | 10/20 | 8/10 | 9/10 | 4/10 |
| armB2-175 (retrain limpio) | 10/20 | 8/20 | 10/10 | 4/10 | 0/10 |

La model card también incluye una tabla de evaluación sobre la interfaz sintética (45 trayectorias ambiguas retenidas, greedy) en la que el base obtiene 0/45 en disparo, coincidencia de nombre, argumentos y formato exacto; el autor advierte explícitamente que esas cifras miden una interfaz que no corresponde ni a la plantilla de chat del base ni a la ruta real de Hermes, por lo que no deben interpretarse como competencia nativa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 18,4 GB solo para pesos, más caché KV; en la práctica requiere GPUs de 24 GB o más para contexto moderado.
- VRAM estimada en GGUF cuantizado: no disponible en la información proporcionada; la cuantización ROCmFPX del repositorio complementario reduce el requisito por debajo de los pesos BF16, pero no se documentan bits ni tamaño exacto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado; GPUs de consumo de 16-24 GB para la variante GGUF.
- Cabe en GPU de consumo: sí, en RTX 4090 con BF16 y contexto recortado, y en GPUs de 16 GB o más con la cuantización GGUF.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama para GGUF, vLLM o TGI para servir en BF16; el autor referencia una configuración de servicio con `CTX=65536`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-9B Hermes FC — Balanced (este) | 9,20B | no disponible (servicio de referencia a 65.536) | SFT QLoRA para herramientas Hermes | Apache-2.0 | Hugging Face, 197 descargas, 2 likes |
| Empero/Qwen3.8-9B-Distill (base) | 9,20B | no disponible | Modelo destilado generalista con function calling nativo | Apache-2.0 | Hugging Face |
| armB2-175 (retrain limpio del mismo autor) | 9,20B | no disponible | SFT con supresión de llamadas corregida | Apache-2.0 | Referenciado en la model card, disponibilidad pública no confirmada |
| Qwen3-Coder-480B (generador de datos) | 480B | no disponible | Modelo de código usado para trayectorias OpenHands | no disponible | no disponible |

## Limitaciones y advertencias

- La corrección metodológica del autor invalida las puntuaciones de la sección de evaluación original: el arnés no usaba el parámetro nativo `tools` y exigía XML crudo, por lo que las cifras de la interfaz sintética no reflejan el comportamiento real en Hermes.
- Regresión de contención: el ajuste aumenta el disparo de herramientas en contextos donde no debería (tier-3 de 5/10 a 9/10) y provoca deriva de herramienta en trivia (tier-4 de 0/10 a 4/10).
- Pérdida de precisión en la selección de herramienta: tier-1 name=todo cae de 17/20 en el base a 10/20 en este checkpoint.
- El programa de ajuste fino está congelado desde el 3 de septiembre de 2026; el autor usa el modelo base como valor por defecto en producción.
- Riesgo de alucinación en argumentos de herramientas y en la selección de la herramienta adecuada, especialmente en tareas ambiguas; se recomienda validación de esquema en el servidor.
- Soporte exclusivamente en inglés; no se declaran capacidades multilingües.
- Sin torre visual: no admite entradas de imagen pese a la etiqueta `image-text-to-text` del repositorio.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento (trayectorias de terceros, APIGen-MT-5k, When2Call, SWE-rebench) deben revisarse por separado para cumplir sus respectivas condiciones.
- El repositorio tiene un volumen de uso muy bajo (197 descargas, 2 likes) y no cuenta con validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-balanced
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Modelo base alternativo citado: https://huggingface.co/Empero/Qwen3.8-9B
- Repositorio complementario con GGUF ROCmFPX: no disponible (referenciado en la model card sin URL)
- Dataset del ajuste v28: no disponible (referenciado como `hermes-fc-v28-data` sin URL)
- Scripts de reproducción: `scripts/native_battery.py`, `scripts/todo_probes.jsonl`, `scripts/no_drift_probes.jsonl` (sin URL pública en la información disponible)
- Apoyo al autor: https://ko-fi.com/jamesonbradfield
