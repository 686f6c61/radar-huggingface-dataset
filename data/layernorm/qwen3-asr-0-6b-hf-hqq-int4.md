# LayerNorm/Qwen3-ASR-0.6B-hf-hqq-int4

## Resumen

Qwen3-ASR-0.6B-HQQ-INT4 es una versión cuantizada en 4 bits mediante HQQ (Half-Quadratic Quantization) del modelo de reconocimiento automático de voz Qwen3-ASR-0.6B, desarrollado por el equipo Qwen de Alibaba. Esta variante ha sido producida por el usuario LayerNorm y no constituye un lanzamiento oficial. El modelo base combina un codificador de audio de estilo Whisper con un decodificador de lenguaje Qwen3, lo que le permite transcribir voz en múltiples idiomas y dialectos, además de realizar identificación de idioma. Con 490,7 millones de parámetros y un tamaño en disco de aproximadamente 650 MB, esta cuantización reduce el peso original en un 57 %, lo que facilita su despliegue en GPUs con memoria limitada o en entornos de borde. La relevancia actual radica en que ofrece un equilibrio entre precisión y tamaño que lo hace adecuado para aplicaciones de ASR en producción con restricciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper + decodificador de lenguaje Qwen3 (modelo ASR) |
| Parametros totales | 490.681.030 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | HQQ-INT4 (nbits=4, group_size=64, axis=1, compute dtype bfloat16) |
| Idiomas soportados | 30 idiomas listados en la model card: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro. La familia Qwen3-ASR soporta 52 idiomas y dialectos segun la documentacion oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tensores HQQ empaquetados: W_q, scale, zero, nbits) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-0.6B emplea una arquitectura hibrida que combina un codificador de audio inspirado en Whisper con un decodificador basado en el modelo de lenguaje Qwen3. Esta configuracion permite procesar senales de audio y generar transcripciones textuales directamente, sin necesidad de un modulo de ASR externo. El entrenamiento del modelo original se realizo con datos de voz a gran escala y aprovecho las capacidades de comprension de audio del modelo fundacional Qwen3-Omni. La version cuantizada aplica HQQ con 4 bits por peso, un tamaño de grupo de 64 y una dimension de cuantizacion por eje (axis=1), excluyendo la capa `lm_head`. No se dispone de informacion sobre el uso de RLHF o DPO en el entrenamiento del modelo base.

## Capacidades

- Reconocimiento automatico de voz (ASR) multilingue: transcribe audio en 30 idiomas listados, incluyendo chino mandarin, ingles, español, frances, aleman, arabe, japones, coreano, entre otros.
- Identificacion de idioma: el modelo puede detectar el idioma hablado en el audio de entrada.
- Soporte de audio de larga duracion: segun la documentacion oficial, la familia Qwen3-ASR maneja grabaciones extensas, aunque no se especifica la duracion maxima en esta variante.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generacion de codigo, ya que se trata de un modelo especializado en ASR, no de un LLM general.

## Casos de uso

- Transcripcion de reuniones y videoconferencias: el modelo puede convertir audio de reuniones en texto en tiempo real o diferido. Su tamaño reducido permite ejecutarlo en estaciones de trabajo con GPUs de gama media, como una RTX 3060, manteniendo una latencia aceptable para clips cortos (alrededor de 1 segundo).
- Subtitulacion automatica de contenido audiovisual: ideal para generar subtitulos en multiples idiomas a partir de videos o podcasts. La cuantizacion reduce el uso de memoria a unos 643 MB, lo que permite procesar varios flujos de audio simultaneamente en un mismo servidor.
- Asistentes de voz en dispositivos de borde: al ocupar solo 650 MB en disco, puede desplegarse en dispositivos con almacenamiento limitado, como routers, NAS o mini-PCs, para tareas de dictado o control por voz.
- Transcripcion de llamadas de atencion al cliente: en centros de contacto, el modelo puede transcribir conversaciones para su analisis posterior. Su soporte multilingue cubre los principales idiomas europeos y asiaticos, aunque la latencia mayor (1,8-2 veces la del modelo bf16) debe tenerse en cuenta en escenarios de tiempo real.
- Procesamiento de audio en entornos con restricciones de memoria: la reduccion del 57 % en memoria GPU (de 1492 MB a 643 MB) permite ejecutar el modelo en GPUs con 1 GB de VRAM o menos, como las integradas en algunos SoC, o compartir la GPU con otros procesos.
- Sistemas de dictado medico o legal: la capacidad de identificar el idioma y transcribir audio largo facilita su uso en consultas o despachos donde se requiere documentacion precisa. La cuantizacion apenas degrada la precision (CER adicional de 0,006 respecto al modelo bf16), por lo que es viable para tareas que exigen fidelidad.

## Benchmarks y rendimiento

La model card incluye una evaluacion realizada en una RTX 3060 12GB (CUDA 13.3, Ampere, compute 8.6) sobre un corpus chino compuesto por clips cortos de AISHELL-1, un clip largo de ~47 segundos, un clip con ruido de 8 dB y el clip de demostracion oficial (10 muestras en total). Los resultados comparan la version cuantizada con el modelo base en bf16:

| Metrica | bf16 (baseline) | HQQ-INT4 | Diferencia |
|---|---:|---:|---:|
| Tamano del checkpoint (MB) | 1503,3 | 650,7 | -56,7 % |
| Memoria GPU (MB) | 1492,5 | 643,1 | -56,9 % |
| CER medio vs. bf16 | — | 0,0063 | — |
| CER vs. ground truth AISHELL | 0,0231 | 0,0157 | — |
| Latencia media (s) | 0,90 | 1,76 | x1,9 |
| Latencia mediana clips cortos (s) | 0,60 | 1,07 | x1,8 |
| Latencia clip largo ~47 s (s) | 3,69 | 7,23 | x2,0 |

CER = character error rate (tasa de error por caracter). La cuantizacion introduce una degradacion minima en precision (CER adicional de 0,006) y, en esta prueba concreta, la version cuantizada obtuvo incluso un CER absoluto ligeramente inferior al del modelo bf16 (0,0157 vs. 0,0231). El coste principal es la latencia, que se multiplica por aproximadamente 1,8-2 en GPUs Ampere de consumo. No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 643 MB con la cuantizacion HQQ-INT4, frente a los 1492 MB del modelo bf16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. La evaluacion se realizo en una RTX 3060 12GB, pero modelos como RTX 4060, RTX 3050 o incluso GPUs integradas con suficiente memoria compartida podrian ser suficientes.
- Compatibilidad con GPUs de consumo: si, cabe en GPUs consumer de gama baja y media.
- Opciones de despliegue: el modelo no se puede cargar directamente con `AutoModelForMultimodalLM.from_pretrained` porque los pesos cuantizados se almacenan como tensores HQQ empaquetados y las capas `HQQLinear` no se reconstruyen automaticamente. Se debe utilizar el script incluido en el repositorio (`scripts/infer_hqq_int4.py`) o seguir los pasos de reproduccion que reconstruyen las capas. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: en la prueba con RTX 3060, la latencia media fue de 1,76 segundos por clip, con 1,07 segundos para clips cortos y 7,23 segundos para un clip de ~47 segundos. El throughput no se especifica.

## Comparativa con modelos similares

La comparacion mas directa es con el modelo base sin cuantizar y con la version mayor de la misma familia:

| Modelo | Parametros | Tamano checkpoint | Memoria GPU | CER (AISHELL) | Latencia media | Licencia |
|---|---:|---:|---:|---:|---:|---:|
| Qwen3-ASR-0.6B-hf (bf16) | 490,7 M | 1503 MB | 1492 MB | 0,0231 | 0,90 s | Apache 2.0 |
| Qwen3-ASR-0.6B-hf-hqq-int4 (este modelo) | 490,7 M | 650 MB | 643 MB | 0,0157 | 1,76 s | Apache 2.0 |
| Qwen3-ASR-1.7B | ~1,7 B | No disponible | No disponible | No disponible | No disponible | Apache 2.0 |

No se dispone de datos de benchmarks de otros modelos ASR como Whisper o Parakeet en la informacion proporcionada. La documentacion oficial indica que Qwen3-ASR-1.7B logra un rendimiento de ultima generacion entre los modelos ASR de codigo abierto, mientras que la version de 0.6B ofrece el mejor equilibrio precision-tamaño.

## Limitaciones y advertencias

- No es un lanzamiento oficial: se trata de una cuantizacion de terceros (LayerNorm) sobre el modelo Qwen3-ASR-0.6B-hf. No hay garantia de soporte ni de mantenimiento por parte del equipo Qwen.
- Carga no estandar: los pesos cuantizados no se reconstruyen con `AutoModelForMultimodalLM.from_pretrained`; es imprescindible usar el script de inferencia incluido o replicar los pasos de reconstruccion de capas HQQ. Cargar el modelo de forma incorrecta puede descartar silenciosamente los pesos cuantizados.
- Latencia aumentada: la inferencia es aproximadamente 1,8-2 veces mas lenta que el modelo bf16 en GPUs Ampere de consumo. Esto puede ser un problema en aplicaciones de transcripcion en tiempo real.
- Degradacion de precision: aunque la prueba mostro una degradacion minima (CER adicional de 0,006), los resultados pueden variar con otros idiomas, acentos o condiciones de ruido. No se ha evaluado el modelo en todos los 30 idiomas listados.
- Cobertura de idiomas limitada en la practica: la model card lista 30 idiomas, pero la documentacion oficial menciona 52. Es posible que algunos idiomas o dialectos no esten bien representados en esta cuantizacion.
- Sin informacion sobre sesgos: no se han publicado analisis de sesgos relacionados con genero, acentos o variedades dialectales. Como modelo ASR, puede presentar errores sistematicos en habla no nativa o con ruido de fondo.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero al ser una cuantizacion no oficial, el usuario debe verificar la procedencia y la integridad de los pesos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/LayerNorm/Qwen3-ASR-0.6B-hf-hqq-int4
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Repositorio GitHub de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe tecnico de Qwen3-ASR (arXiv): https://arxiv.org/html/2601.21337v1
- Documentacion de transformers para Qwen3-ASR: https://huggingface.co/docs/transformers/v5.13.1/en/model_doc/qwen3_asr
