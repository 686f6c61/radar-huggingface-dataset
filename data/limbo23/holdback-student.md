# limbo23/holdback-student

## Resumen

holdback-student es un modelo de clasificación de tokens (token-classification) especializado en la detección de datos personales (PII) y secretos en texto que los agentes de código envían a modelos en la nube. Lo desarrolla el usuario limbo23 como parte del proyecto holdback, un proxy local y hook para Claude Code que sustituye valores privados por marcadores de posición antes de que una petición salga de la máquina. El modelo es un destilado del Privacy Filter de OpenAI (un mixto de expertos de 1.500 millones de parámetros) y actúa como su reemplazo ligero.

Arquitectónicamente es un transformer BERT de 6 capas, dimensión oculta 384 y 28,2 millones de parámetros, derivado de las primeras 6 capas de intfloat/multilingual-e5-small, con un vocabulario de 45.252 piezas podado a partir del original. Detecta ocho categorías del Privacy Filter (account_number, private_address, private_date, private_email, private_person, private_phone, private_url y secret) mediante etiquetado BIO.

Su relevancia actual radica en que ofrece una alternativa de muy bajo coste computacional (decenas de milisegundos por inferencia en CPU y menos de 200 MB de memoria en procesos de 8.192 tokens) frente a modelos de detección mucho más pesados, con soporte para ocho idiomas y una licencia Apache-2.0 permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), 6 capas, hidden size 384 |
| Parametros totales | 28.228.241 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de hasta 254 tokens (entrenamiento); el texto largo debe dividirse |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según repo) |
| Idiomas soportados | en, zh, de, fr, es, it, pt, nl |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT de 6 capas y dimensión oculta 384, inicializado a partir de las 6 primeras capas de intfloat/multilingual-e5-small (12 capas en total), con un vocabulario podado a 45.252 piezas. La cabeza de clasificación de tokens emite etiquetas BIO sobre las ocho categorías del Privacy Filter de OpenAI. Se trata de un proceso de destilación: el modelo grande actúa como profesor y genera etiquetas que el estudiante aprende a reproducir.

Los datos de entrenamiento combinan etiquetas del profesor sobre texto natural (con las etiquetas propias del dataset cuando el profesor no encontró nada en los conjuntos públicos) y, en texto de desarrollador, solo valores plantados. Se incluyen 16.000 filas de nvidia/Nemotron-PII (CC BY 4.0), filas 1.000 a 6.999 de asgdaudahu/pii-bench-zh (Apache-2.0), etiquetas del profesor de openai/privacy-filter (Apache-2.0), código fuente de crates Rust y paquetes Python públicos, lockfiles y listados de objetos git de ripgrep, serde y fd, documentación china de ant-design, vant, ahooks y umi con valores plantados, y filas generadas con Faker. Se excluyó explícitamente ai4privacy/pii-masking-400k por su licencia solo académica y no comercial. No se documenta uso de RLHF ni DPO; el entrenamiento es supervisado sobre etiquetas BIO.

## Capacidades

- Detección de entidades PII: nombres de persona, direcciones, correos electrónicos, teléfonos, fechas privadas, URLs privadas y números de cuenta.
- Detección de secretos en código y configuración: contraseñas, tokens y credenciales en lockfiles, checksums, snippets de código y salidas de CI/agentes.
- Clasificación de tokens con etiquetado BIO sobre ventanas de hasta 254 tokens.
- Multilingüe en ocho idiomas (en, zh, de, fr, es, it, pt, nl).
- Integración nativa con el proxy holdback y con hooks de Claude Code para redacción previa al envío a la nube.
- Uso directo desde Python mediante `transformers.pipeline("token-classification")`.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de etiquetado, no generativo.

## Casos de uso

- Redacción de PII antes de enviar prompts a modelos en la nube: integrado en holdback, sustituye correos, teléfonos y nombres por marcadores de posición antes de que la petición salga de la máquina, con una latencia de 1,8 ms para 16 tokens en CPU Apple M5.
- Protección de secretos en asistentes de código: detecta contraseñas y tokens en snippets, lockfiles y salidas de CI, permitiendo que agentes como Claude Code operen sobre repositorios sin filtrar credenciales.
- Cumplimiento de privacidad en pipelines de datos: clasificación de tokens para anonimizar registros antes de almacenarlos o compartirlos, con soporte para ocho idiomas europeos y chino.
- Enmascarado en logs y telemetría: procesamiento de salidas de cluster, pagos y configuraciones generadas por agentes para eliminar valores sensibles antes de su recolección.
- Preprocesado en entornos con recursos limitados: al ocupar 76 MB en procesos de 16 tokens y 190 MB en 8.192 tokens, es adecuado para proxies locales, portátiles y contenedores sin GPU.
- Filtrado en herramientas de desarrollo y CI/CD: hook que inspecciona diffs, mensajes de commit y ficheros de configuración para bloquear la fuga de credenciales antes del push.
- Anonimización de documentación multilingüe: detección de nombres y datos en documentación técnica china y europea antes de publicarla o enviarla a servicios externos.

## Benchmarks y rendimiento

Resultados publicados en la model card (valores etiquetados filtrados / caracteres falsos positivos, ambos detectores seguidos de las reglas de holdback):

| Test | Privacy Filter | holdback-student |
| --- | ---: | ---: |
| PrivacyBench, persona nunca entrenada | 9,7% / 0,6% | 0,8% / 0,6% |
| PrivacyBench, tres personas más (lockbox) | 18,8% / 0,3% | 3,2% / 0,4% |
| ai4privacy EN validation (no entrenado) | 12,7% / 11,1% | 6,0% / 10,8% |
| CredData, credenciales de ficheros no muestreados (lockbox) | 19,8% / 6,1% | 20,2% / 4,8% |
| Tareas de agente generadas (semillas 7 y 11): valores filtrados de 288 y tareas rotas de 186 | 1 y 0; 6 y 6 | 0 y 0; 6 y 6 |
| Texto de desarrollador, reemplazos falsos por 100 KB (tuning, held-out) | 4, 0 | 4, 2 |
| Sesiones de Claude Code en 9 crates públicas, 45 tareas, modo hook | 45/45 | 45/45, sin valor plantado enviado |
| Nombres chinos en noticias, filas impares MSRA NER, 1.301 nombres | 67,3% / 0,6% | 13,1% / 1,4% |
| 30 peticiones de desarrollador en chino, 10 valores | 2 de 10 / 0,8% | 0 de 10 / 0,6% |

Rendimiento y memoria en holdback 0.1.1 sobre CPU Apple M5, para entradas de 16, 128, 2.048 y 8.192 tokens (según el tokenizador del Privacy Filter): etiquetado en 1,8, 7,5, 65 y 261 ms (Privacy Filter: 24,5, 87, 512 y 1.856 ms). Un proceso nuevo alcanza un pico de 76 MB para 16 tokens y 190 MB para 8.192 (Privacy Filter: 83 y 146 MB).

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ocupa 0,1 GB en disco y puede ejecutarse en CPU.
- GPU recomendadas: no necesarias; cualquier GPU moderna (RTX 4090, A100, H100) puede alojarlo, pero no aporta ventaja significativa frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer y en CPU de portátil; pico de memoria de proceso de 76 MB (16 tokens) a 190 MB (8.192 tokens).
- Opciones de despliegue: transformers (pipeline de token-classification), integración nativa con holdback 0.1.1 o superior, y despliegue como endpoint compatible (tag endpoints_compatible).
- Latencia y throughput: 1,8 ms para 16 tokens, 7,5 ms para 128, 65 ms para 2.048 y 261 ms para 8.192 en CPU Apple M5; aproximadamente 4-13 veces más rápido que el Privacy Filter según la longitud de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Detección PII (PrivacyBench lockbox) | Licencia | Disponibilidad |
| --- | ---: | --- | --- | --- | --- |
| holdback-student | 28,2 M | 254 tokens por ventana | 3,2% fugas / 0,4% FP | Apache-2.0 | Hugging Face, integración holdback |
| openai/privacy-filter | 1,5 B (MoE) | no disponible | 18,8% fugas / 0,3% FP | Apache-2.0 | Hugging Face |
| ai4privacy/pii-masking-400k (dataset) | no aplica | no aplica | no disponible | solo académico/no comercial | Hugging Face |
| intfloat/multilingual-e5-small (base) | 118 M | 512 tokens | no aplica (embedding, no NER) | MIT | Hugging Face |

## Limitaciones y advertencias

- Los secretos en código se detectan con una frecuencia similar al Privacy Filter, no superior; los UUID se conservan por política de holdback y cuentan como fugas en CredData.
- En chino detecta muchos más nombres que el Privacy Filter, pero a veces confunde palabras comunes con nombres (1,4% de caracteres en noticias y 0,6% en peticiones de desarrollador, frente a 0,8% y 0,6% del profesor).
- Los sistemas de escritura no presentes en los datos de entrenamiento caen en piezas de un solo carácter, degradando la detección.
- Entrenado con una sola semilla; en PrivacyBench, semillas de la misma receta difieren en torno a 1,5 puntos.
- Ventana de 254 tokens: el texto más largo debe dividirse en saltos de línea, comas o espacios, lo que puede romper entidades a caballo entre fragmentos.
- Es un modelo de etiquetado, no generativo: no razona ni mantiene conversaciones; su salida son etiquetas BIO.
- Riesgo de falsos positivos en texto de desarrollador (4 por 100 KB en tuning, 2 en held-out), que pueden provocar reemplazos innecesarios.
- La licencia Apache-2.0 cubre el modelo, pero las fuentes de datos conservan sus propias licencias; Nemotron-PII se usa bajo CC BY 4.0 con atribución a NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/limbo23/holdback-student
- Proyecto holdback: https://github.com/Daveyuwang/holdback
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset pii-bench-zh: https://huggingface.co/datasets/asgdaudahu/pii-bench-zh
- Privacy Filter (profesor): https://huggingface.co/openai/privacy-filter
