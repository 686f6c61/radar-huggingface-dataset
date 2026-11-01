# Maxkuo/TEA-ASR-1.1-mlx-q8

## Resumen

TEA-ASR-1.1-mlx-q8 es una cuantizacion de 8 bits en formato MLX del modelo de reconocimiento automatico del habla TEA-ASR-1.1, desarrollado originalmente por JacobLinCool. Se trata de una adaptacion al mandarin de Taiwan (con salida en chino tradicional) del modelo Qwen3-ASR-1.7B de Alibaba Cloud. Esta version concreta la publica el usuario Maxkuo para su uso en Apple Silicon mediante la libreria mlx-qwen3-asr, con el objetivo de reducir el peso del checkpoint y permitir inferencia local en equipos Mac.

El modelo resuelve la transcripcion de audio a texto en chino (con enfasis en mandarin de Taiwan y escritura en caracteres tradicionales) e ingles. Frente al Qwen3-ASR original, TEA-ASR incorpora una reescritura de 12.379 tokens de caracteres simplificados a tradicional, lo que lo hace adecuado para flujos de trabajo que requieren salida en chino tradicional sin postprocesado externo.

Esta variante cuantizada ocupa 2,2 GB en el repositorio y esta pensada para ejecutarse en macOS sobre chips Apple M-series, no para GPU NVIDIA ni para despliegues en servidor convencionales. Su relevancia es practica: permite ASR bilingue chino/ingles en local en un Mac sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder de audio + decoder de texto tipo transformer), adaptada a mandarin de Taiwan |
| Parametros totales | 1,7 B (heredados de Qwen3-ASR-1.7B; no se detalla el desglose encoder/decoder) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64, encoder de audio tambien a 8 bits |
| Idiomas soportados | chino (mandarin de Taiwan, salida en tradicional) e ingles |
| Licencia | MIT (adaptacion TEA-ASR); pesos base Qwen3-ASR bajo Apache 2.0 |
| Formato de pesos | safetensors (MLX), mas vocab.json y merges.txt |
| Libreria de inferencia | mlx-qwen3-asr 0.4.4 sobre mlx 0.32.4 |
| Tamano del repositorio | 2,2 GB |
| Revision base | bda08df76d4fd6b487b4a1dd7f0bddf8541696f8 de JacobLinCool/TEA-ASR-1.1 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-ASR-1.7B, una arquitectura de reconocimiento del habla compuesta por un encoder de audio y un decoder de texto de tipo transformer. TEA-ASR-1.1 es una adaptacion de ese checkpoint al mandarin de Taiwan: reescribe 12.379 tokens de caracteres simplificados como chino tradicional y marca 1.161 de ellos con un caracter de uso privado (U+E000-U+F8FF) que el tokenizer original elimina en su paso de decodificacion. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la adaptacion.

Esta variante concreta no reentrena nada: solo cuantiza. Todos los modulos `Linear` y `Embedding` del encoder de audio y del decoder de texto se convierten a 8 bits con group size 64 mediante `mlx_qwen3_asr.convert.quantize_model`, y los pesos se guardan con `mx.save_safetensors`. El `lm_head` esta atado a la embedding de tokens y no se almacena; el loader lo vuelve a atar en tiempo de carga. Los ficheros `vocab.json` y `merges.txt` se generan a partir del `tokenizer.json` propio de TEA-ASR, por lo que no son intercambiables con los del Qwen3-ASR estandar. La receta de conversion es la misma que la de `moona3k/mlx-qwen3-asr-1.7b-8bit`.

## Capacidades

- Transcripcion de voz a texto (ASR) en mandarin de Taiwan e ingles.
- Salida en chino tradicional, con reescritura interna de tokens simplificados.
- Procesamiento de audio con encoder dedicado y decoder de texto autorregresivo.
- Soporte de seleccion de idioma en la llamada de transcripcion (`language="Chinese"`).
- Inferencia local en Apple Silicon mediante MLX.
- No se documentan capacidades de tool calling, agentes, vision, audio generation ni modo thinking.
- Capacidades multilingues limitadas a los dos idiomas declarados (zh, en).

## Casos de uso

- Transcripcion de reuniones en mandarin de Taiwan: el modelo genera directamente caracteres tradicionales, lo que evita un paso posterior de conversion simplificado-tradicional en actas y notas.
- Subtitulado de contenido audiovisual en chino tradicional: al estar cuantizado a 8 bits y ocupar unos 2,2 GB, puede ejecutarse en un Mac portatil para generar subtitulos sin subir el audio a la nube.
- Dictado local en aplicaciones de escritorio para macOS: la integracion via mlx-qwen3-asr permite invocar la transcripcion desde una app nativa en Apple Silicon con latencia baja y sin conexion.
- Prototipado de asistentes de voz bilingues chino/ingles: el soporte de ambos idiomas en un mismo checkpoint simplifica pipelines que alternan idioma en una conversacion.
- Investigacion en ASR para variedades del chino: sirve como referencia cuantizada para comparar el comportamiento de Qwen3-ASR frente a adaptaciones regionales sin necesidad de GPU dedicada.
- Procesamiento por lotes de archivos de audio en un Mac: el formato MLX y el peso reducido permiten transcribir colecciones de grabaciones en local con un consumo de memoria moderado.
- Evaluacion de tecnicas de cuantizacion: al publicarse la receta exacta (bits, group size, encoder_bits) y los hashes SHA-256 de cada fichero, es util para reproducir experimentos de cuantizacion MLX sobre modelos ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, CER ni comparaciones cuantitativas con otros modelos; remite a la model card del modelo base para precision y limitaciones.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint pesa aproximadamente 2,17 GB (`weights.safetensors`), por lo que se necesita al menos ese espacio mas el overhead de activaciones y del runtime MLX; en la practica, un Mac con 8 GB o mas de memoria unificada deberia poder cargarlo.
- GPU recomendadas: exclusivamente Apple Silicon (el autor lo convirtio y probo en un Apple M5 con macOS). No esta pensado para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple M-series; no se ha validado en GPUs NVIDIA consumer.
- Opciones de despliegue: mlx-qwen3-asr 0.4.4 sobre mlx 0.32.4 con Python 3.12. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| TEA-ASR-1.1-mlx-q8 (este) | 1,7 B | no disponible | zh (Taiwan, tradicional), en | MIT (base Apache 2.0) | MLX 8 bits, Apple Silicon |
| JacobLinCool/TEA-ASR-1.1 | 1,7 B | no disponible | zh (Taiwan, tradicional), en | MIT (base Apache 2.0) | safetensors sin cuantizar |
| moona3k/mlx-qwen3-asr-1.7b-8bit | 1,7 B | no disponible | zh, en (Qwen3-ASR estandar) | Apache 2.0 | MLX 8 bits, Apple Silicon |
| Qwen/Qwen3-ASR-1.7B | 1,7 B | no disponible | zh, en y otros segun model card original | Apache 2.0 | safetensors |

La diferencia principal frente a las alternativas es la salida en chino tradicional y la adaptacion al mandarin de Taiwan, ausentes en el Qwen3-ASR estandar. No se dispone de datos de rendimiento comparativo para establecer diferencias de precision entre ellos.

## Limitaciones y advertencias

- Solo cubre chino (mandarin de Taiwan) e ingles; no se declaran otros idiomas.
- La cuantizacion a 8 bits puede degradar ligeramente la precision respecto al checkpoint original, aunque no se aportan mediciones.
- El decoder de mlx-qwen3-asr no aplica el paso `Replace` del `tokenizer.json` original, por lo que pueden aparecer caracteres de uso privado (U+E000-U+F8FF) en la salida; es necesario eliminarlos con una expresion regular como se indica en la model card.
- No se deben sustituir `vocab.json` ni `merges.txt` por los del Qwen3-ASR estandar: son especificos de TEA-ASR.
- Riesgo de alucinacion y de errores de transcripcion inherente a los modelos ASR; no se documentan tasas de error.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un modelo entrenado predominantemente con datos en chino e ingles, el rendimiento fuera de esos registros puede degradarse.
- Licencia: la adaptacion TEA-ASR es MIT, pero los pesos base Qwen3-ASR de Alibaba Cloud siguen sujetos a Apache 2.0 y a sus terminos de atribucion; conviene revisarlos antes de un uso comercial.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no es portable a CUDA sin conversion adicional.
- Modelo de nicho con 25 descargas y sin likes en el momento de la consulta; no hay validacion comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maxkuo/TEA-ASR-1.1-mlx-q8
- Modelo base: https://huggingface.co/JacobLinCool/TEA-ASR-1.1
- Qwen3-ASR-1.7B original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Libreria de inferencia mlx-qwen3-asr: https://github.com/moona3k/mlx-qwen3-asr
- Receta de cuantizacion de referencia: https://huggingface.co/moona3k/mlx-qwen3-asr-1.7b-8bit
