# infosave/SenseNova-Loop-9B-Turbo-cmf

## Resumen

SenseNova-Loop-9B-Turbo-cmf es una cuantización de 4 bits (formato q4tp) del modelo multimodal SenseNova-Loop-9B de SenseTime (SenseNova), empaquetada en un único fichero CMF para el motor de inferencia cortiq, escrito en Rust sin dependencias de Python ni de frameworks de ML. El modelo base es un transformer con bucle (looped transformer): 24 de sus capas se ejecutan dos veces, y cada pasada mantiene sus propias claves y valores, lo que duplica el coste de memoria de atención en prompts largos. Esta versión "Turbo" aborda precisamente ese problema mediante una cabecera que gestiona la memoria de la caché KV de forma agresiva para contexto largo.

La propuesta central es ejecutar prompts de hasta 524 288 tokens en una GPU de 24 GB. Según la model card, con un prompt de 128 000 tokens el fichero ocupa 8,3 GB de VRAM frente a 16,5 GB del fichero estándar, con 140 s hasta el primer token y 49,9 tok/s de decodificación (frente a 30,5 tok/s del estándar). Con 250 000 tokens mantiene los 8,3 GB, tarda 265 s en el primer token y decodifica a 50,4 tok/s, volcando las filas del prompt a RAM o a disco con `--o1-spill`.

Es relevante para desarrolladores que necesiten contexto muy largo y capacidades de imagen-texto en hardware de gama profesional (RTX A5000, 24 GB) sin recurrir a clústeres multi-GPU. La contrapartida es que depende en exclusiva del motor cortiq y de su ecosistema (CLI y servidor compatible con la API de OpenAI), y que el repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer); 24 capas ejecutadas dos veces; 8 capas de atención completa, 6 de ellas en ambas pasadas (14 conjuntos KV por token); cabeza MTP para draft tokens |
| Parametros totales | 9B (según nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 524 288 tokens según la model card; límite por defecto de `CMF_MAX_SEQ` en 32 768, configurable |
| Tipos de cuantizacion | q4tp (4 bits) en formato CMF; no se documentan otros niveles |
| Idiomas soportados | inglés, ruso, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero único para el motor cortiq) |
| Tamaño del repositorio | 5,7 GB |
| Modalidad | image-text-to-text (visión + texto) |
| Aceleración | CUDA, Vulkan, DX12, Metal |
| Servidor | API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`, `/healthz`) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucle: 24 de sus capas se recorren dos veces, de modo que el modelo reutiliza parámetros para profundizar el cómputo sin aumentar el número de pesos. Cada pasada del bucle mantiene su propia caché de claves y valores, lo que implica que un token genera 14 conjuntos KV (8 capas de atención completa, 6 de ellas presentes en ambas pasadas). Esa duplicación es la causa de que el fichero estándar consuma el doble de memoria en prompts largos.

La innovación de esta variante Turbo no está en el entrenamiento (no se documentan datos de preentrenamiento, número de tokens, composición del corpus ni fases de RLHF/DPO), sino en la gestión de la caché KV. Las primeras 8192 filas del prompt se leen con atención exacta; a partir de ahí, las claves y valores salen de la GPU hacia RAM o disco. Antes de las últimas 512 filas del prompt, cada uno de los 14 conjuntos KV se reconstruye como "campo lejano": las primeras 4 filas y las últimas 1800 permanecen exactas y el resto se comprime en 32 landmarks por cabeza, de modo que la memoria y el coste por token dejan de crecer con la longitud del texto. Para no perder información crítica, cada fila se puntúa según la geometría de las claves (distancia al span de los landmarks) y la norma del valor, mediante un ajuste lineal sobre 112 rangos calibrado con hechos plantados en textos de Wikipedia; las 248 mejores filas se conservan exactas y se leen al responder. El modelo incorpora además una cabeza MTP que genera tokens borrador para decodificación especulativa, activada con `--greedy` o `temperature: 0`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento opcional (`enable_thinking`); `--no-think` fuerza respuesta directa.
- Comprensión de imágenes: entrada como parte `image_url` (data URL o HTTP(S)); lectura de gráficos, tablas y documentos visuales.
- Procesamiento de contexto muy largo: hasta 524 288 tokens, con recuperación verificada de hechos en textos de 60 000, 120 000 y 240 000 caracteres (hasta 56 000 tokens), con 4 aciertos de 4 en cada longitud.
- Tool calling / function calling mediante el parámetro `tools` en la API de chat.
- Decodificación especulativa con draft tokens de la cabeza MTP (desactivada en peticiones con imagen).
- Multilingüe en inglés, ruso y chino.
- Servidor HTTP compatible con clientes OpenAI (Python, curl y cualquier librería que acepte `base_url`).
- Streaming de respuestas (`stream: true`) y reutilización incremental de turnos previos (solo procesa lo nuevo).

## Casos de uso

- Análisis de documentación extensa: resumir o extraer conclusiones de informes de cientos de miles de tokens en una sola pasada, gracias al contexto de 524 288 tokens y a la compresión de la caché KV que mantiene el uso de VRAM en 8,3 GB.
- Recuperación de hechos en corpus largos: localizar datos concretos ("contraseñas", cifras, nombres) plantados en textos de hasta 240 000 caracteres; la retención de 248 filas exactas está diseñada específicamente para no perder detalles puntuales.
- Atención al cliente con historial largo: conversaciones multi-turno donde el servidor cortiq solo procesa los tokens nuevos de cada turno, reduciendo latencia en diálogos prolongados.
- Análisis de gráficos y documentos escaneados: enviar una imagen vía `image_url` y pedir la lectura de valores, tablas o tendencias, integrándolo en un pipeline con la API de OpenAI.
- Generación de código asistida: peticiones de funciones (por ejemplo, fusionar listas ordenadas) con tool calling para integrarse en flujos de CI/CD o asistentes de IDE que consuman la API local.
- Procesamiento multilingüe EN/RU/ZH: traducción, resumen o extracción de información en los tres idiomas soportados sin cambiar de modelo.
- Despliegue en estaciones de trabajo con GPU de 24 GB: servir el modelo en local con `cortiq serve` y `--host 127.0.0.1` para entornos con requisitos de privacidad, sin depender de la nube.
- Procesamiento por lotes de prompts largos en hardware modester: con `--o1-spill` se pueden volcar las filas del prompt a SSD, habilitando contextos de 250 000 tokens en tarjetas de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente aporta métricas de rendimiento del motor sobre una RTX A5000 (24 GB) con CUDA:

| Escenario | VRAM | Primer token | Decodificación |
|---|---|---|---|
| Prompt de 128 000 tokens (fichero Turbo) | 8,3 GB | 140 s | 49,9 tok/s |
| Prompt de 128 000 tokens (fichero estándar) | 16,5 GB | 142 s | 30,5 tok/s |
| Prompt de 250 000 tokens (fichero Turbo) | 8,3 GB | 265 s | 50,4 tok/s |

| Prueba de recuperación de hechos | Longitud | Aciertos |
|---|---|---|
| Hechos plantados en Wikipedia | 60 000 caracteres | 4 de 4 |
| Hechos plantados en Wikipedia | 120 000 caracteres | 4 de 4 |
| Hechos plantados en Wikipedia | 240 000 caracteres (hasta 56 000 tokens) | 4 de 4 |

## Requisitos de hardware

- VRAM: 8,3 GB en el escenario medido (prompt de 128 000 y 250 000 tokens en RTX A5000); el fichero ocupa 5,7 GB en disco.
- GPU recomendadas: RTX A5000 (24 GB) es la referencia medida; por huella de memoria, tarjetas de 12-16 GB podrían alojar el modelo, aunque no se documentan pruebas en ellas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) y similares; no hay cifras publicadas para estas tarjetas.
- Despliegue: motor cortiq (Rust) vía `cortiq-cli` y `cortiq serve`; compilación con `--features cuda` para NVIDIA o sin flags para Vulkan, DX12 y Metal. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Requiere una versión de cortiq posterior a 0.9.4 o compilar desde la rama `sensenova-loop9b`.
- Latencia y throughput medidos: 140 s al primer token con 128 000 tokens de prompt; 49,9-50,4 tok/s de decodificación.
- Para contextos de 250 000 tokens se necesita RAM o disco adicional con `--o1-spill` para volcar las filas del prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Turbo-cmf | 9B | 524 288 tokens | Apache 2.0 | CMF / cortiq | 8,3 GB VRAM con 128 000 tokens; 49,9 tok/s |
| SenseNova-Loop-9B-cmf (estándar) | 9B | 524 288 tokens | Apache 2.0 | CMF / cortiq | 16,5 GB VRAM con 128 000 tokens; 30,5 tok/s |
| SenseNova-Loop-9B (original) | 9B | no disponible | Apache 2.0 (según modelo base) | safetensors (presumible) | Pesos sin cuantizar; requiere framework estándar |

No se dispone de datos de benchmarks que permitan comparar la calidad frente a otros modelos de 9B de la misma categoría (por ejemplo, variantes multimodales de contexto largo); esa comparación no está disponible.

## Limitaciones y advertencias

- Dependencia exclusiva del motor cortiq: no hay pesos en safetensors ni GGUF, por lo que no se puede usar con vLLM, llama.cpp, Ollama, TGI ni transformers sin reconvertir.
- La decodificación especulativa se desactiva en peticiones con imagen, lo que reduce el throughput en tareas de visión.
- La compresión de la caché KV es una aproximación: solo las primeras 4 filas y las últimas 1800 permanecen exactas más allá de las 8192 iniciales, y la selección de 248 filas exactas se calibró con hechos plantados en Wikipedia; puede fallar en dominios con patrones distintos.
- El servidor no comprueba API key por defecto y escucha en todas las interfaces salvo que se indique `--host 127.0.0.1`; riesgo de exposición si se despliega sin revisar la configuración.
- Idiomas limitados a inglés, ruso y chino; el castellano no está declarado como soportado, por lo que el rendimiento en español es incierto.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación del modelo base ni de esta cuantización.
- Cuantización de 4 bits: puede degradar la calidad respecto a los pesos originales; no se publican comparativas de precisión entre el fichero Turbo y el estándar.
- Repositorio sin descargas ni likes y publicado por un autor individual (`infosave`), no por SenseTime; la reproducibilidad y el mantenimiento a largo plazo no están garantizados.
- La patente mencionada (No. 19/738,763) aplica al mecanismo de gestión de memoria; conviene revisar implicaciones si se reimplementa la técnica.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base SenseNova-Loop-9B de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/SenseNova-Loop-9B-Turbo-cmf
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Versión estándar en CMF: https://huggingface.co/infosave/SenseNova-Loop-9B-cmf
- Repositorio del motor cortiq / CMF: https://github.com/infosave2007/cmf
