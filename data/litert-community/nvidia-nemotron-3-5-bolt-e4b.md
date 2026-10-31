# litert-community/NVIDIA-Nemotron-3.5-Bolt-E4B

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B (versión LiteRT-LM) es una conversión al formato `.litertlm` del modelo SLM de NVIDIA del mismo nombre, publicada por el equipo de litert-community en Hugging Face. El modelo base, `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, es un modelo pequeño de lenguaje (SLM) post-entrenado por NVIDIA a partir de Gemma-4-E4B-it, orientado a mejorar el uso de herramientas en conversaciones multi-turno, el seguimiento de instrucciones y la conexión con la entrada (input grounding) en asistentes de voz locales, personas interactivas e interfaces de edge/embebidas.

Esta versión cuantizada está pensada específicamente para ejecución en dispositivo (on-device): incluye un archivo int4 para CPU y GPU y otro compilado ahead-of-time para la NPU Snapdragon SM8850 de Qualcomm. En un Galaxy S26 el archivo int4 alcanza un prefill de 1.024 tokens a 868 tokens/s y una decodificación sostenida de 15,2 tokens/s en GPU. Es relevante porque combina razonamiento (thinking mode), soporte de herramientas y un tamaño apto para móviles, con licencia abierta (openmdw-1.1) lista para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Gemma 4 E4B), con sliding window attention y cross-layer KV sharing |
| Parametros totales | no disponible (el tamaño del archivo int4 es 4,40 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens (KV cache de los archivos LiteRT-LM; la del modelo original no se indica) |
| Tipos de cuantizacion | int4 en bloques de 32 (CPU/GPU), int8/int4 por canal con activaciones int16 estáticas (NPU SM8850) |
| Idiomas soportados | Inglés (en) |
| Licencia | openmdw-1.1 (Other; uso comercial y no comercial permitido según NVIDIA) |
| Formato de pesos | .litertlm (LiteRT-LM); el modelo base está en BF16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Gemma 4 E4B: 42 capas decodificadoras, de las cuales 35 usan una ventana deslizante (sliding window) de 512 tokens y 7 usan atención completa (full attention). El tamaño oculto es 2.560, con 8 cabezas de consulta (query) y 2 cabezas clave-valor (KV). El vocabulario tiene 262.144 tokens, complementado con una segunda tabla de embeddings que aporta 256 valores por token a cada capa; además, las últimas 18 capas leen las claves y valores de capas anteriores (cross-layer KV sharing), lo que reduce el consumo de memoria del KV cache.

Sobre el entrenamiento del modelo base, NVIDIA solo indica que es un post-entrenamiento adicional (further post-training) sobre Gemma-4-E4B-it, orientado a tool use multi-turno, seguimiento de instrucciones e input grounding. No se publican detalles del corpus, número de tokens ni técnicas de alineación (RLHF/DPO) en la información disponible. La conversión a LiteRT-LM se realizó con litert-torch `export_hf` 0.10.0 para LiteRT-LM v0.18.0. Los archivos de esta versión eliminan los codificadores de imagen y audio que hereda del checkpoint de Gemma 4, quedando solo entrada y salida de texto.

## Capacidades

- Generación de texto en inglés, con pipeline de text-generation.
- Modo de razonamiento (thinking) desactivado por defecto; se activa con `--thinking true` y se puede limitar con `--thinking-budget`. Los pensamientos se devuelven como canal separado (`<|channel>thought` … `<channel|>`).
- Uso de herramientas (tool calling) multi-turno mejorado respecto a Gemma-4-E4B-it, según NVIDIA.
- Seguimiento de instrucciones e input grounding optimizados para asistentes locales.
- Extracción de información estructurada de texto (por ejemplo, fechas), demostrada en los ejemplos de uso.
- Resolución de problemas de matemáticas básicas (GSM8K) con alta precisión incluso cuantizado.
- Diseñado para asistentes de voz/dispositivo, personas interactivas e interfaces embebidas/edge (aunque estos archivos solo procesan texto).
- Sin visión ni audio en estos archivos (los codificadores de Gemma 4 se han excluido de la conversión).

## Casos de uso

- Asistentes de voz locales en móvil: el modelo está post-entrenado específicamente para asistentes de dispositivo; con 15,2 tokens/s sostenidos en GPU de un Galaxy S26 y un footprint de unos 4,3 GB, cabe en smartphones flagship actuales.
- Extracción de datos estructurados en dispositivo: puede identificar y extraer fechas, entidades o campos de texto sin enviar datos a la nube, útil por privacidad y latencia.
- Agentes con tool calling en edge: el post-entrenamiento en uso de herramientas multi-turno lo hace adecuado para orquestar funciones locales (calendario, recordatorios, APIs del sistema) en apps móviles.
- Personas interactivas y chatbots offline: el thinking mode configurable permite respuestas más deliberadas en tareas complejas, con el razonamiento separado de la respuesta final.
- Interfaces embebidas e IoT con NPU Qualcomm: el archivo compilado para Snapdragon SM8850 (12,2 tokens/s en NPU) permite desplegar el modelo en dispositivos con esa SoC liberando CPU y GPU.
- Matemáticas y cálculo rápido en local: obtiene 92-93/100 en las primeras preguntas de GSM8K incluso cuantizado, apto para calculadoras inteligentes o asistencia educativa offline.
- Prototipado on-device con LiteRT-LM: la CLI de litert-lm permite probar el modelo con una sola instrucción, ideal para desarrolladores que evalúan SLMs en terminal.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión (GSM8K, primeras preguntas del split de test, decodificación greedy, thinking desactivado):

| Configuracion | Resultado GSM8K |
|---|---|
| Referencia BF16 (transformers 5.14.1, CPU) | 93 / 100 |
| int4, Mac M4 Max GPU (activaciones fp16) | 92 / 100 |
| int4, Galaxy S26 GPU (primeras 52 preguntas) | 48 / 52 (referencia: 49 / 52) |
| NPU, Galaxy S26 NPU (primeras 99 preguntas) | 92 / 99 (referencia: 92 / 99) |

Rendimiento en dispositivo (prefill forzado de 1.024 tokens, decodificación de 256 tokens, valores sostenidos):

| Dispositivo / backend | Prefill | Decodificacion |
|---|---|---|
| Galaxy S26, GPU (int4) | 868 tokens/s | 15,2 tokens/s |
| Galaxy S26, NPU SM8850 (archivo dedicado) | no disponible | 12,2 tokens/s |
| Mac M4 Max (CPU/GPU, int4) | no disponible | respuesta completa en 2,4 s (incluida creacion del motor), pico de memoria 4,3 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: unos 4,3 GB de pico de memoria para el archivo int4 en Mac M4 Max; el archivo ocupa 4,40 GB en disco (int4 CPU/GPU) y 5,04 GB (NPU SM8850).
- Consumer GPUs: cabe en GPUs de portátil y sobremesa con 6-8 GB de VRAM (verificado en Mac M4 Max con GPU integrada); no se han publicado pruebas en RTX 4090 ni similares.
- Moviles: verificado en Galaxy S26 (GPU y NPU Snapdragon SM8850); el archivo NPU es específico para SM8850 y no funcionará en otras SoC.
- Despliegue: LiteRT-LM v0.18.0 (CPU y GPU); el archivo NPU requiere el ejecutor NPU de LiteRT-LM con las librerías QNN de Qualcomm QAIRT 2.47.0 (verificado con un build de main, commit `3dbb23e1`; no se probó con builds de release).
- Latencia/throughput: 868 tokens/s de prefill y 15,2 tokens/s de decodificación sostenida en Galaxy S26 GPU; 12,2 tokens/s en NPU. En Galaxy S26 GPU, el calor puede reducir la velocidad a cerca de un minuto por pregunta en tareas largas.
- No es compatible directamente con vLLM, llama.cpp, Ollama o TGI; requiere el runtime LiteRT-LM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B (LiteRT-LM) | no disponible (E4B, archivo int4 de 4,40 GB) | 2.048 tokens (KV cache del archivo) | int4 / int8-int4 NPU | openmdw-1.1 | Hugging Face, LiteRT-LM |
| Gemma-4-E4B-it (modelo base) | no disponible (E4B) | no disponible | BF16 (original) | no disponible | Hugging Face (nvidia y Google) |
| Otros SLMs on-device comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparativas cuantitativas con otros modelos en la información disponible.

## Limitaciones y advertencias

- Solo inglés: el idioma soportado declarado es el inglés; no hay garantías de rendimiento en castellano u otros idiomas.
- Contexto limitado a 2.048 tokens en estos archivos: el prompt, el pensamiento (si hay thinking activo) y la respuesta comparten esa caché, lo que restringe tareas con documentos largos.
- Sin visión ni audio: aunque el checkpoint base hereda los codificadores de imagen y audio de Gemma 4, estos archivos los omiten; solo texto de entrada y salida.
- Riesgo de alucinación: no evaluado específicamente en la información disponible; como todo SLM, puede generar contenido incorrecto, y el thinking mode no elimina este riesgo.
- Rendimiento térmico en móvil: en Galaxy S26 GPU, el calor redujo la velocidad de ejecución (hasta ~1 minuto por pregunta en GSM8K); los valores publicados son sostenidos, no picos.
- Soporte NPU experimental: el archivo para SM8850 solo se ha verificado con un build no release de LiteRT-LM y QAIRT 2.47.0; no está garantizado que funcione con builds estables.
- Licencia: openmdw-1.1 (Other); NVIDIA declara el modelo base listo para uso comercial y no comercial, pero conviene revisar el texto de la licencia y las condiciones de Gemma 4 heredadas antes de uso en producción.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Ficha del modelo (LiteRT-LM): https://huggingface.co/litert-community/NVIDIA-Nemotron-3.5-Bolt-E4B
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
