# RX5950XT/Inkling-2-Mini-Uncensored-Strata

## Resumen

Inkling-2-Mini-Uncensored-Strata es una redistribución en formato `.strata` v1.1 del modelo Inkling-2-Mini-Uncensored publicado por OpenUncensored, que a su vez es una versión "abliterated" (eliminación de rechazos) del Inkling-2-Mini de Thinking Machines. El autor de este repositorio, RX5950XT, no entrena ni modifica los pesos de forma sustancial: toma los ficheros oficiales `.strata` de strata-engine y sustituye únicamente las 20 matrices de salida de atención (`attn.wo_ud`) de las capas 4 a 23 por las versiones BF16 del modelo sin censura. Todo lo demás (expertos MoE, borrador especulativo DSpark, módulo de visión, tokenizer y plantilla de chat) permanece byte a byte idéntico al original.

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) con atención en bucle (`inkling2_loop`), pipeline `image-text-to-text` (acepta imagen y texto como entrada) y decodificación especulativa mediante DSpark. Se distribuye en tres tamaños de cuantización propietaria: SQ-10 (10,47 GB), SQ-15 (14,35 GB) y SQ-20 (19,35 GB), pensados para GPUs de 12, 16 y 24 GB respectivamente. La variante SQ-20 es declarada sin pérdida respecto al modelo original en BF16.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de ingeniería de parcheado de pesos en un formato de serialización propietario (`.strata`), con verificación criptográfica y comparación bit a bit; por otro, expone un fallo real de kernel CUDA en GPUs Blackwell (sm_120/sm_121) relacionado con el tratamiento del valor `0xFF` como centinela de escala cero en el formato UE8M0, que la comunidad debe conocer antes de desplegar estos modelos en RTX 50.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención en bucle (`inkling2_loop`), decodificación especulativa DSpark, módulo de visión multimodal |
| Parametros totales | no disponible |
| Parametros activos | no disponible (es MoE, pero el número de expertos activos no se indica en la información disponible) |
| Longitud de contexto | 32.768 tokens (valor usado en la configuración de ejemplo del autor; no se confirma como máximo oficial) |
| Tipos de cuantizacion | SQ-10 (~2,8 bits medios por expertos), SQ-15 (~4,0 bits), SQ-20 (~5,1 bits); expertos de capas 20-23 en MX8; matrices de atención parcheadas en 8 bits por columna (BF16 en SQ-20 y en capas 5, 11, 17, 23 de SQ-15); KV cache fp8 |
| Idiomas soportados | no disponible (la model card no publica lista de idiomas; las pruebas mencionan respuestas en inglés, chino, español y ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.strata` v1.1 (formato propietario del motor Strata); incluye `tokenizer.json` y `chat_template.jinja` en formato Hugging Face |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE con atención en bucle (tag `inkling2_loop`), en el que las capas 20 a 23 contienen expertos almacenados en formato MX8 (bloques de 32 valores con escala UE8M0). Incorpora un módulo de visión independiente (`Inkling-2-Mini-Vision.strata`, 0,64 GB) y un borrador especulativo DSpark para decodificación especulativa. El modelo original procede de Thinking Machines y fue entrenado por ellos; los detalles de composición del dataset, número de tokens y etapas de RLHF/DPO no están disponibles en la información proporcionada.

La modificación aplicada en este repositorio es puramente quirúrgica: se reemplazan las 20 matrices `attn.wo_ud` de las capas 4 a 23 con los bytes BF16 originales del modelo de OpenUncensored. El proceso de parcheado está implementado en `tools/inkling_uncensor_patch.py` y sigue un protocolo de verificación estricto: primero re-codifica las capas 0 a 3 no modificadas y comprueba que coinciden bit a bit con el fichero oficial; tras escribir, actualiza el SHA-256 de la sección 1 de la cabecera y valida con `--selfcheck --verify-hash`; finalmente compara el resultado completo con el original, confirmando que las únicas diferencias son las 20 matrices sustituidas y los campos de hash de cabecera. La reproducibilidad está documentada: SQ-10 generado en dos días distintos produce el mismo SHA-256.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento previo a la respuesta (el modelo "piensa antes de responder", por lo que requiere `max_tokens` de al menos 1.000 para evitar respuestas vacías).
- Procesamiento de imagen y texto (`image-text-to-text`), mediante el módulo de visión incluido.
- Razonamiento aritmético básico verificado en pruebas (17×23 = 391) y conocimiento factual (capital de Australia).
- Generación multilingüe: las pruebas documentadas incluyen respuestas en inglés, chino, español y ruso.
- Decodificación especulativa DSpark, que acelera la generación mediante un borrador integrado.
- Eliminación de rechazos: responde a peticiones que el modelo original rechazaría (32 de 32 preguntas dañinas pasan de rechazo a respuesta según la model card de OpenUncensored).
- Servicio mediante API compatible con OpenAI a través de `serve/server.py` del motor Strata.
- No se documenta soporte explícito de tool calling, function calling ni uso agéntico multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un sistema sin mecanismos de rechazo, comparando directamente con la variante original para analizar qué se gana y qué se pierde al aplicar abliteration (la model card reporta MMLU 78,95 % → 79,47 % en el modelo de origen).
- Evaluación de formatos de serialización propietarios: sirve como caso de referencia para auditar el formato `.strata` v1.1, su cabecera con SHA-256 por sección y su verificador `--selfcheck --verify-hash`, útil para quien integre motores de inferencia no estándar.
- Despliegue en hardware de gama media: la variante SQ-10 (10,47 GB) está pensada para GPUs de 12 GB y la SQ-15 (14,35 GB) para 16 GB, lo que permite ejecutar un MoE multimodal en tarjetas consumer en lugar de requerir A100/H100.
- Análisis de documentos con imagen: gracias al pipeline `image-text-to-text` y a una ventana de 32.768 tokens, se puede usar para extracción de información de capturas, tablas escaneadas o documentación técnica mixta.
- Generación de contenido multilingüe sin filtros editoriales: para proyectos de traducción, redacción o dataset augmentation donde las políticas de rechazo del modelo base interfieren con el flujo (asumiendo la responsabilidad legal descrita abajo).
- Pruebas de regresión de kernels CUDA: el fallo documentado en `encode_ue8m0` para sm_120/sm_121 convierte este repositorio en un banco de pruebas útil para validar implementaciones de MX8/UE8M0 en GPUs Blackwell antes de desplegar en producción.
- Reproducción de experimentos de cuantización: las métricas de KLD, coincidencia de siguiente token y perplejidad por tamaño (SQ-10, SQ-15, SQ-20) permiten calibrar el coste de calidad de cada nivel de compresión en un MoE real.

## Benchmarks y rendimiento

Datos publicados por el autor (medidos el 2026-11-24 en RTX 5060 Ti 16 GB + RTX 3060 Ti 8 GB, Windows 11). La muestra de pruebas de rechazo es de 4 preguntas, insuficiente para una evaluación completa.

Pruebas de rechazo (decodificación greedy, servidor Strata):

| Variante | Petición dañina en inglés | Petición dañina en chino | 17×23 | Capital de Australia |
|---|---|---|---|---|
| SQ-10 oficial (control) | rechaza | rechaza | 391 | Canberra |
| SQ-10 sin censura | responde | responde | 391 | Canberra |
| SQ-15 sin censura | responde | responde | 391 | Canberra |
| SQ-20 sin censura | responde | responde | 391 | Canberra |

Fidelidad respecto al modelo original (documento en chino de 512 tokens, referencia SQ-20 en CPU):

| Variante y configuración | KLD | Siguiente token coincidente | Perplejidad |
|---|---|---|---|
| SQ-10 (GPU) | 0,115 | 87,3 % | 7,33 |
| SQ-15 (GPU) | 0,027 | 93,0 % | 6,93 |
| SQ-20 (5060 Ti, token a token) | 0,003 | 98,0 % | 6,96 |
| SQ-20 (5060 Ti, por lotes, kernel corregido) | 0,015 | 95,5 % | 7,02 |
| SQ-20 (5060 Ti, por lotes, kernel sin corregir) | 1,663 | 60,7 % | 34,4 |
| SQ-20 (3060 Ti, por lotes) | 0,006 | 97,5 % | 6,91 |

Calidad de cuantización declarada por strata-engine (medida sobre el fichero oficial sin modificar):

| Métrica | SQ-10 | SQ-15 | SQ-20 |
|---|---|---|---|
| Bits medios por expertos | ~2,8 | ~4,0 | ~5,1 |
| Siguiente token coincidente | 92,35 % | 96,68 % | 100 % |
| KLD | 0,050 | 0,009 | 0 |

Datos de MMLU y tasa de rechazo del modelo de origen (OpenUncensored, sobre su fichero de precisión original): MMLU 78,95 % → 79,47 %; rechazos en 32 preguntas dañinas 32 → 0.

## Requisitos de hardware

- VRAM estimada: 12 GB para SQ-10, 16 GB para SQ-15, 24 GB para SQ-20, según las recomendaciones oficiales del formato.
- GPUs verificadas en las pruebas: RTX 5060 Ti 16 GB (sm_120, Blackwell) y RTX 3060 Ti 8 GB (arquitectura Ampere). Las pruebas con SQ-10 y SQ-15 se ejecutaron en el conjunto de ambas tarjetas.
- Cabe en GPU consumer: sí, en RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 5060 Ti, RTX 5070 Ti, RTX 5080 y RTX 5090 según el tamaño del fichero. No hay datos de despliegue en A100/H100 en la información disponible.
- Despliegue: exclusivamente mediante el motor propietario Strata (`strata-inkling` o `strata-inkling.exe`) más el servidor Python `serve/server.py`, que expone una API compatible con OpenAI en `127.0.0.1:8080` por defecto. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.strata` es propietario.
- Dependencias del motor: requiere `cublas64_13.dll` y `cublasLt64_13.dll` en la carpeta del ejecutable.
- Configuración recomendada por el autor: `--max-context 32768`, `--kv fp8`, `drafting: dspark`, `arch: inkling2_loop`.
- Latencia y throughput: no se publican cifras de tokens por segundo. Se documenta cualitativamente que la decodificación especulativa DSpark está activa y que la generación requiere `max_tokens ≥ 1.000` por el modo de razonamiento previo.
- Advertencia crítica de hardware: en GPUs Blackwell (sm_120/sm_121, familia RTX 50) la variante SQ-20 produce salidas corruptas con el kernel sin parchear (KLD 1,663 frente a 0,015 corregido). La corrección es una línea en `engine/src/inkling2/cuda/ink_moe_fp4_sm120.cu`, función `encode_ue8m0`, sustituyendo `return 255u` por `return 0u`. SQ-10 no se ve afectado (KLD idéntico antes y después); SQ-15 no ejecuta ese kernel por no tener expertos MX8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Multimodal | Rechazos eliminados |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-Strata (este) | no disponible (MoE) | 32.768 (config. de ejemplo) | `.strata` v1.1 / Strata | Apache 2.0 | Sí (image-text-to-text) | Sí |
| strata-engine/Inkling-2-Mini-Strata | no disponible (MoE) | no disponible | `.strata` v1.1 / Strata | Apache 2.0 | Sí | No |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible (MoE) | no disponible | Pesos Hugging Face (BF16) | Apache 2.0 | Sí | Sí |
| Inkling-2-Mini original (Thinking Machines) | no disponible (MoE) | no disponible | Pesos Hugging Face | Apache 2.0 | Sí | No |

La diferencia entre las cuatro variantes es exclusivamente el mecanismo de rechazo y el formato de serialización; la arquitectura, el tokenizer y el módulo de visión son comunes. Este repositorio añade valor frente a OpenUncensored únicamente por la disponibilidad en `.strata` con tres niveles de compresión, no por capacidades nuevas.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo responde a peticiones dañinas que el original rechaza. La model card del autor declara explícitamente que el uso y el cumplimiento legal recaen sobre el usuario. No es apto para despliegues públicos sin moderación externa.
- Sesgos: no documentados en la información disponible. Al derivar de un modelo entrenado por terceros, hereda los sesgos del Inkling-2-Mini original, que no se analizan aquí.
- Riesgo de alucinación: no cuantificado. Las pruebas publicadas se limitan a aritmética simple y conocimiento factual básico, insuficientes para estimar la tasa de alucinación.
- Fallo de kernel en Blackwell: SQ-20 en sm_120/sm_121 con el kernel sin parchear genera mezcla de idiomas y respuestas truncadas. El fallo persiste en la versión 0.1.65 del motor Strata y en la rama `main` upstream, según el autor. Verificar la versión del motor antes de desplegar en RTX 50.
- Formato propietario: `.strata` no es interoperable con vLLM, llama.cpp, Ollama, TGI ni transformers. La integración exige el binario Strata y su servidor Python, lo que limita portabilidad y opciones de escalado.
- Contexto: el valor de 32.768 tokens aparece solo en la configuración de ejemplo del autor; no se confirma como máximo arquitectónico. Contextos mayores no están verificados.
- Idiomas: no se publica lista oficial. Las pruebas mencionan inglés, chino, español y ruso, pero no hay evaluación de calidad por idioma.
- Reproducibilidad del parche: depende de commits concretos (`04996a1e` para strata-engine y `4e5f06d7` para OpenUncensored). Réplicas futuras deben fijar esas revisiones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y traslada toda la responsabilidad legal al usuario. La titularidad del modelo subyacente es de Thinking Machines.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en un intervalo de 70 minutos. No hay validación independiente de terceros.
- Ausencia de datos clave: parámetros totales, parámetros activos, número de expertos, tokens de entrenamiento y composición del dataset no están disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RX5950XT/Inkling-2-Mini-Uncensored-Strata
- Modelo base sin censura: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Ficheros oficiales `.strata`: https://huggingface.co/strata-engine/Inkling-2-Mini-Strata
- Motor Strata (GitHub): https://github.com/Niko1221/Strata
- Herramienta de parcheado: `tools/inkling_uncensor_patch.py` dentro del repositorio
- Sumas de verificación: `SHA256SUMS.txt` dentro del repositorio
