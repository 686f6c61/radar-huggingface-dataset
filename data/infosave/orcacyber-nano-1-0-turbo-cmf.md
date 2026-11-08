# infosave/OrcaCyber-Nano-1.0-Turbo-cmf

## Resumen

OrcaCyber-Nano-1.0-Turbo-cmf es una cuantización de 4 bits del modelo OrcaCyber-Nano-1.0, desarrollado por OrcaRouter sobre la arquitectura Qwen3.8-27B. Lo publica el usuario infosave bajo el paraguas técnico de su proyecto Qwen3.8-27B Turbo, que introduce una cabecera ("turbo header") capaz de mantener en memoria de dispositivo las claves y valores de prompts largos mediante un mecanismo de atención de campo lejano. El modelo está orientado a trabajo de seguridad defensiva, aunque conserva razonamiento general y asistencia de código.

El problema que resuelve es concreto: ejecutar un modelo de 27B con contexto largo en tarjetas gráficas de 16 GB sin agotar la VRAM. Según la model card, el fichero estándar se queda sin memoria de dispositivo a partir de 16 000 tokens en una RTX 2000 Ada de 16 GB, mientras que esta variante lee 64 000 tokens en 14,8 GB y decodifica a 26,0 tok/s. Incorpora además una cabeza MTP (multi-token prediction) que actúa como decodificación especulativa y duplica aproximadamente la velocidad en código.

La distribución se hace en un único fichero `.cmf` de 14,3 GB para `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de ML, con backend Vulkan. El modelo es relevante ahora porque demuestra inferencia de contexto largo de un 27B en hardware consumer de gama media mediante técnicas de offload selectivo de KV cache y decodificación especulativa integrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con cabeza MTP para decodificación especulativa |
| Parámetros totales | 27B (según model card; no se detalla desglose) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 000 tokens verificados en 16 GB; longitud máxima nativa no disponible |
| Tipos de cuantización | 4 bits (q4tp) en formato CMF |
| Idiomas soportados | en, ru, zh |
| Licencia | qwen (license: other, license_name: qwen) |
| Formato de pesos | CMF (fichero único de 14,3 GB), exclusivo de `cortiq` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros con arquitectura Qwen3.8, adaptado por OrcaRouter para tareas de seguridad defensiva. La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. La variante Turbo añade una cabecera que gestiona la memoria de dispositivo en prompts largos: en una tarjeta de 16 GB se leen exactamente las primeras 4096 filas del prompt (8192 en tarjetas mayores), y las claves y valores de las filas posteriores se descargan a RAM o SSD conforme se leen. Antes de las últimas 512 filas se reconstruye el campo lejano capa a capa combinando filas exactas, landmarks por cabeza de atención y una selección de las 248 filas con mayor puntuación (claves, códigos, nombres). El mecanismo está sujeto a solicitud de patente (No. 19/738,763).

La segunda innovación es la cabeza MTP integrada, que genera borradores de tokens aceptados por el modelo principal. En la model card se reportan tasas de aceptación del 76 % en generación de código Rust, 70 % en revisión de seguridad de un handler Flask, 64 % en triaje de logs de autenticación y 48 % en prosa y respuestas en ruso. El fichero se ejecuta exclusivamente con `cortiq`, motor en Rust con backend Vulkan, sin dependencias de Python ni de frameworks de ML.

## Capacidades

- Generación de texto y razonamiento general, con modo de razonamiento (`thinking`) activable o desactivable mediante `enable_thinking` o `--no-think`.
- Asistencia de código: análisis, corrección y generación, con buen rendimiento en Rust y Python según los ejemplos de la model card.
- Revisión de seguridad defensiva: análisis de vulnerabilidades (el ejemplo de la model card detecta y explica un desbordamiento de buffer por `strcpy`), revisión de handlers y triaje de logs de autenticación.
- Tool calling / function calling: el endpoint `/v1/chat/completions` acepta el parámetro `tools`.
- Soporte de agentes vía API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz`), con streaming.
- Capacidades multilingües en inglés, ruso y chino.
- Contexto largo efectivo: lectura de prompts de hasta 64 000 tokens en 16 GB de VRAM, con recuperación de hechos plantados en posiciones aleatorias de documentos de 100 000 caracteres (6 de 6 con filas exactas).
- Decodificación especulativa mediante cabeza MTP integrada, activada por defecto en `cortiq bench`.
- No se documentan capacidades de visión ni de audio en esta variante, pese a que la búsqueda web menciona un modelo "Image-Text-to-Text" de 2B con el mismo nombre base; esa referencia no coincide con las especificaciones de esta ficha.

## Casos de uso

- Triaje de alertas de seguridad: el modelo procesa lotes de líneas de log de autenticación y clasifica eventos sospechosos. La decodificación especulativa mantiene 23,6 tok/s en este tipo de tarea y el contexto largo permite incluir ventanas amplias de logs en un solo prompt.
- Revisión de código en busca de vulnerabilidades: análisis de funciones C, Python o Rust para detectar desbordamientos, inyecciones y malas prácticas, como demuestra el ejemplo de `strcpy` de la model card. Apto para integrarse en pipelines de CI/CD mediante la API HTTP de `cortiq serve`.
- Resumen de documentos extensos en hardware limitado: la model card documenta el resumen correcto de unos 24 600 tokens (100 000 caracteres de Wikipedia) en una tarjeta de 16 GB, con 20,8 tok/s de decodificación. Útil para informes de incidentes o documentación técnica larga.
- Asistente local de análisis forense: lectura de volcados o informes de incidentes de decenas de miles de tokens manteniendo en VRAM solo lo esencial y descargando el resto a RAM o SSD con `--o1-spill`.
- Generación de tests y código de utilidades en Rust: la model card reporta 28,2 tok/s con borradores MTP en la generación de una función Rust con tests, el doble que sin decodificación especulativa.
- Despliegue en estaciones de trabajo con GPU de 16 GB: al caber en una RTX 2000 Ada o similar, permite ofrecer un asistente de seguridad y código local sin depender de la nube, con el servidor `cortiq serve` escuchando en `127.0.0.1:8080`.
- Extracción de datos concretos en documentos largos: recuperación de claves de acceso, códigos, contraseñas o números de habitación plantados en posiciones aleatorias, con 6 de 6 aciertos según la model card.

## Benchmarks y rendimiento

Calidad (medida por el autor, no son benchmarks estándar de la comunidad):

| Prueba | Resultado |
|---|---|
| WikiText-2, perplejidad (12 ventanas de 512 tokens) | 8,89 (8,79 para Qwen3.8-27B Turbo en el mismo harness) |
| Código fuente Rust, perplejidad | 3,79 |
| Recuperación de hechos en 100 000 caracteres | 6 de 6 con filas exactas; 0 de 2 sin campo lejano |

Rendimiento en NVIDIA RTX 2000 Ada (16 GB, 70 W), Vulkan, `cortiq bench --core`, 60 tokens tras el prompt:

| Prompt (tokens) | Primer token, s (turbo) | Decodificación, tok/s (turbo) | VRAM pico, GB (turbo) |
|---:|---:|---:|---:|
| 1 000 | 8,9 | 29,9 | 14,1 |
| 4 000 | 36,7 | 26,7 | 14,5 |
| 16 000 | 159 | 26,7 | 14,8 |
| 32 000 | 324 | 26,3 | 14,8 |
| 64 000 | 652 | 26,0 | 14,8 |

El fichero estándar no cabe a partir de 16 000 tokens en esa tarjeta. La lectura del prompt se realiza a 98–112 tok/s con la build de `cortiq` basada en el PR #99; la versión 0.8.63 lee a unos 75 tok/s. RAM host consumida durante la lectura: 4,1 GB a 16 000 tokens, 7,1 GB a 32 000 y 13,3 GB a 64 000.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 14,1–14,8 GB según longitud de prompt, en cuantización 4 bits (q4tp).
- GPU recomendadas: RTX 2000 Ada (16 GB) es la plataforma medida por el autor. Cualquier GPU con 16 GB o más y soporte Vulkan debería poder ejecutar el fichero; no se han publicado medidas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 2000 Ada). En tarjetas de 8–12 GB no hay datos publicados.
- RAM host: al menos 4 GB para prompts de 16 000 tokens; 13,3 GB para 64 000 tokens. `--o1-spill` permite descargar a disco.
- Despliegue: exclusivamente mediante `cortiq` (Rust, Vulkan). No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es propietario.
- Latencia: primer token de 8,9 s a 1 000 tokens (incluye unos 5 s de carga de pesos) y 652 s a 64 000 tokens. Decodificación estable en 26–30 tok/s. La carga del modelo por proceso es de unos 8 s para 14 GB.
- Throughput de lectura de prompt: 98–112 tok/s con la build del PR #99; 75 tok/s con `cortiq` 0.8.63.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor |
|---|---|---|---|---|---|
| OrcaCyber-Nano-1.0-Turbo-cmf | 27B | 64 000 (verificado en 16 GB) | 4 bits (q4tp) | qwen | cortiq (Rust, Vulkan) |
| OrcaCyber-Nano-1.0 (base) | 27B | no disponible | completa | qwen | no disponible |
| Qwen3.8-27B Turbo (referencia del autor) | 27B | 64 000 (mismo harness) | 4 bits | qwen | cortiq |
| Modelos Qwen3 de 27B en GGUF (llama.cpp) | ~27B | según configuración | Q4_K_M, Q5_K_M, etc. | Apache 2.0 / qwen según variante | llama.cpp, Ollama |

La comparación con cuantizaciones GGUF equivalentes no puede hacerse con datos publicados en esta ficha: no hay cifras de rendimiento ni de VRAM para esas variantes en la información disponible. La ventaja diferencial de este fichero es la gestión de contexto largo en 16 GB, que en llama.cpp requeriría offload de KV cache a RAM con penalización de latencia no documentada aquí.

## Limitaciones y advertencias

- Solo se ejecuta con `cortiq`, un motor joven y específico del autor; no hay integración con ecosistemas estándar (vLLM, TGI, llama.cpp, transformers).
- El formato CMF es propietario y el fichero tiene un SHA-256 publicado, pero no hay verificación independiente de la integridad ni auditoría del proceso de cuantización.
- Idiomas limitados a inglés, ruso y chino; el castellano no está declarado como soportado.
- El modelo está especializado en seguridad defensiva; su comportamiento en dominios ajenos puede ser menos fiable que el del base.
- La atención de campo lejano es aproximada: solo las primeras 4096 filas (8192 en tarjetas mayores) y las últimas 1800 son exactas; el resto se reconstruye con landmarks, lo que puede degradar la recuperación de información en posiciones intermedias de prompts muy largos.
- La licencia es "qwen" con `license: other`; conviene revisar los términos del modelo base (orcarouter/OrcaCyber-Nano-1.0) antes de uso comercial. No se detalla si se permite uso comercial en esta ficha.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de robustez ni de sesgos publicadas.
- El primer token en prompts largos es muy lento (652 s a 64 000 tokens), lo que limita su uso interactivo en esos rangos.
- El modelo base figura como "Image-Text-to-Text" de 2B en una referencia de la búsqueda web, lo que contradice las especificaciones de 27B de la model card; existe ambigüedad sobre la naturaleza exacta del base que conviene verificar antes de desplegar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/OrcaCyber-Nano-1.0-Turbo-cmf
- Modelo base: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0
- README del modelo base: https://huggingface.co/orcarouter/OrcaCyber-Nano-1.0/blob/main/README.md
- Referencia Qwen3.8-27B Turbo: https://huggingface.co/infosave/Qwen3.8-27B-Turbo-cmf
- Repositorio CMF: https://github.com/infosave2007/cmf
- PR #99 de CMF (build medida): https://github.com/infosave2007/cmf/pull/99
- Comparativa estándar vs turbo: https://huggingface.co/infosave/OrcaCyber-Nano-1.0-Turbo-cmf/resolve/main/assets/compare_en.png
- Gráfico de techo de contexto: https://huggingface.co/infosave/OrcaCyber-Nano-1.0-Turbo-cmf/resolve/main/assets/ceiling_en.png
