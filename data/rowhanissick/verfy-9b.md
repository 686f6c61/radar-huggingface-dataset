# Rowhanissick/Verfy-9B

## Resumen

Verfy-9B es un modelo de lenguaje publicado por Rowhanissick (Verfy Labs) y presentado como un agente autónomo de sistema operativo con capacidades de razonamiento en ciberseguridad, red-teaming y automatización de escritorio y servidor. Según la model card, se construye a partir de una arquitectura que el autor denomina "Qwen3.5 9B Hybrid-Attention" y declara como modelo base Qwen/Qwen2.5-7B-Instruct en los metadatos de Hugging Face, una discrepancia que conviene tener en cuenta al evaluarlo. El repositorio contiene 9.409.813.744 parámetros reales en safetensors (unos 9,4 mil millones), lo que encaja con un modelo denso de tamaño intermedio.

El modelo se distribuye con licencia Apache 2.0, soporte declarado únicamente de inglés y un contexto anunciado de 1.048.576 tokens mediante escalado YaRN. Su propuesta diferencial no es tanto la generación de texto como la emisión de bloques estructurados en estilo XML (`<think>`, `<steps>`, `<command>`, ``, `<screenshot>`, `<vuln>`) que un orquestador externo puede interpretar para ejecutar comandos de shell, mover el ratón, pulsar teclas o capturar pantalla.

Es relevante ahora porque se posiciona en la intersección de tres tendencias activas: los agentes que operan ordenadores (computer-use), los modelos "abliterated" sin censura orientados a investigación de seguridad, y las ventanas de contexto muy largas para trazar trayectorias agénticas completas. Ahora bien, la información disponible procede casi exclusivamente de la model card del autor y no incluye resultados de benchmarks ni detalles verificables del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso; el autor la describe como "Qwen3.5 9B Hybrid-Attention", con modelo base declarado Qwen/Qwen2.5-7B-Instruct |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) segun la model card, via YaRN rope-scaling |
| Tipos de cuantizacion | GGUF Q3_K_M, Q4_K_M, Q5_K_M y Q8_0 en el repo oficial Verfy-9B-GGUF; ademas 4-bit NF4 via BitsAndBytes en el ejemplo de la model card |
| Idiomas soportados | Ingles (declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo secundario) |

## Arquitectura y entrenamiento

La model card describe una arquitectura transformer densa con atención híbrida, heredera de la familia Qwen, y un ajuste fino orientado a agentes. El dato verificable es que los pesos suman 9,41 mil millones de parámetros y que el autor declara Qwen/Qwen2.5-7B-Instruct como modelo base en los metadatos, mientras que el texto de la ficha habla de "Qwen3.5 9B Hybrid-Attention"; esta inconsistencia no se resuelve con la información disponible y debería contrastarse antes de cualquier uso en producción.

En cuanto al entrenamiento, no se especifican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o procesos de abliteration documentados más allá de la etiqueta "abliterated / uncensored". Sí se declaran innovaciones a nivel de comportamiento: una pasada interna de verificación y reflexión antes de emitir comandos, conciencia de un "credential enclave" para no volcar PII o tokens en texto plano, y ejecución condicionada a tokens de autorización del operador. Estas capacidades se presentan como rasgos del ajuste, no como componentes arquitectónicos verificables de forma independiente.

## Capacidades

- Generación de texto conversacional y razonamiento técnico en inglés.
- Emisión de bloques estructurados XML para orquestación: `<think>`, `<steps>`, `<screenshot>`, `<command>`, `<read>`, `<write>`, `` y `<vuln>`.
- Ejecución de comandos de shell/Bash mediante etiquetas interpretables por un harness externo.
- Control de interfaz gráfica: movimientos de ratón, clics y envío de pulsaciones de teclado.
- Petición de capturas de pantalla o de ventana para inspección visual (el modelo solicita la captura, no procesa imágenes de forma nativa según la información disponible).
- Lectura y escritura de ficheros, logs y volcados de memoria.
- Detección y marcado de vulnerabilidades con identificadores CVE, severidad y CWE.
- Reflexión y autocorrección: crítica de consistencia lógica y de seguridad de comandos antes de finalizar la respuesta.
- Marcado de PII y secretos para almacenamiento en bóveda en lugar de eco en texto plano.
- Contexto largo de 1M tokens para trayectorias agénticas y análisis de repositorios completos.
- No se declara soporte de tool calling nativo en formato JSON, ni visión nativa, ni audio.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede emitir secuencias de `<command>` para inspeccionar sockets, servicios y logs, y encadenarlas con `<read>` para revisar la salida, aprovechando el contexto de 1M tokens para mantener el estado de una sesión larga.
- Red-teaming y pentesting autorizado: con las etiquetas `<vuln>` y `<write>` puede proponer y desplegar scripts de prueba en un entorno controlado, marcando hallazgos con CVE, severidad y CWE para su triaje posterior.
- Análisis de repositorios completos: la ventana de 1M tokens permite cargar un codebase entero y pedir auditorías de seguridad o trazas de flujo de datos sin trocear el contexto.
- Agente de escritorio para tareas repetitivas: mediante `` y `<screenshot>` puede orquestar clics y pulsaciones en aplicaciones sin API, solicitando capturas para verificar el estado de la interfaz.
- Asistente de respuesta a incidentes: lectura de `/var/log/syslog` y otros logs con `<read>`, correlación de eventos y propuesta de comandos de contención, con la pasada de reflexión como control previo a la ejecución.
- Formación y laboratorios de ciberseguridad: al ser un modelo sin censura y con licencia Apache 2.0, encaja en entornos de práctica donde se necesita explicación técnica sin filtros comerciales, siempre sobre sistemas propios o con autorización explícita.
- Investigación sobre agentes autónomos: su formato de bloques estructurados y su rutina de verificación lo hacen útil como banco de pruebas para estudiar fallos de razonamiento agéntico y mecanismos de autocorrección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de agentes (por ejemplo, OSWorld o SWE-bench), y tampoco se aportan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 18-19 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- VRAM estimada en 4-bit NF4: en torno a 5-6 GB para pesos, más caché KV; manejable en GPUs de 8-12 GB con contexto moderado.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 5,5-6 GB; Q8_0 en torno a 10 GB.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 1M tokens y despliegue multiusuario; RTX 4090 (24 GB) para FP16 con contexto reducido o cuantización agresiva; RTX 3090, 4080 y 4070 Ti para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores usando GGUF Q4_K_M o Q5_K_M. El contexto de 1M tokens no es viable en estas tarjetas por el coste de la caché KV.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio mediante los GGUF oficiales; vLLM y TGI para safetensors en servidor; Transformers con BitsAndBytes para prototipado.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un modelo denso de 9,4 B en una RTX 4090 con Q4_K_M suele moverse en decenas de tokens por segundo, pero no hay medición publicada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verfy-9B | 9,41 B | 1M (declarado) | Agente de SO y ciberseguridad, sin censura | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen2.5-7B-Instruct | 7,6 B | 128K | Asistente generalista con tool calling | Apache 2.0 | Hugging Face, amplio ecosistema |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 128K | Código y agentes de desarrollo | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8 B | 128K | Asistente generalista multilingüe | Llama 3.1 Community | Hugging Face, muy extendido |

La comparación con Qwen2.5-7B-Instruct es la más directa, ya que figura como modelo base en los metadatos: Verfy-9B añade parámetros, un contexto nominal mucho mayor y un ajuste específico para agentes y seguridad, pero carece de las evaluaciones públicas y el soporte de la comunidad que acompañan al modelo original. Frente a Llama 3.1 8B, Verfy-9B renuncia al multilingüismo y a la integración estándar en frameworks de tool calling a cambio de un formato de bloques propio y de la ausencia de censura.

## Limitaciones y advertencias

- Discrepancia documental sobre el modelo base: los metadatos indican Qwen2.5-7B-Instruct y el texto de la ficha habla de "Qwen3.5 9B Hybrid-Attention". No hay información que permita resolver cuál es correcta.
- Ausencia total de benchmarks publicados, lo que impide validar las capacidades declaradas de razonamiento, agente y ciberseguridad.
- Modelo "abliterated / uncensored": elimina deliberadamente barreras de seguridad, por lo que puede generar instrucciones operativas para actividades dañinas. Requiere uso exclusivo en entornos autorizados y con supervisión humana.
- Riesgo elevado de alucinación en comandos y scripts: la propia model card reconoce que la pasada de reflexión sirve para detectar "mock scripts" inventados, lo que implica que el modelo puede producirlos.
- Capacidad de ejecución real delegada en un harness externo: el modelo solo emite etiquetas; cualquier daño requiere que un orquestador las ejecute sin validación.
- Soporte únicamente de inglés declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- El contexto de 1M tokens depende de escalado YaRN y no está verificado; su calidad efectiva en ventanas extremas es desconocida y el coste de caché KV es prohibitivo en hardware de consumo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad por el uso ofensivo; conviene revisar implicaciones legales en jurisdicciones con regulación específica de ciberseguridad.
- Proyecto de un autor individual con 824 descargas y 3 likes en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento ni de soporte.
- No se declara soporte nativo de visión: las etiquetas `<screenshot>` solicitan capturas a un sistema externo, no implican procesamiento de imágenes por el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rowhanissick/Verfy-9B
- GGUF oficiales: https://huggingface.co/Rowhanissick/Verfy-9B-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Portfolio del autor: https://rowhanissick.onrender.com
- Perfil de Hugging Face del autor: https://huggingface.co/Rowhanissick
- Contacto del autor: iuske553@gmail.com
