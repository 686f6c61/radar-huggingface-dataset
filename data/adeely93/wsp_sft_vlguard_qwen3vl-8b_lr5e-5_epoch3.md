# Adeely93/wsp_sft_vlguard_qwen3vl-8b_lr5e-5_epoch3

## Resumen

`wsp_sft_vlguard_qwen3vl-8b_lr5e-5_epoch3` es un ajuste fino supervisado (SFT) del modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por el usuario Adeely93 en el contexto de los experimentos WSP-MLLM-Safety. El objetivo no es crear un asistente generalista, sino un *baseline* de seguridad: un modelo de 8.767 millones de parametros entrenado sobre VLGuard, un conjunto de datos orientado a la alineacion de seguridad de modelos vision-lenguaje, para reducir respuestas inseguras ante entradas imagen-texto.

El modelo parte de la arquitectura Qwen3-VL (transformer multimodal con torre de vision y proyector multimodal) y aplica un LoRA de rango 8 sobre todas las capas lineales, con la torre de vision y el proyector congelados. El adaptador se fusiona en los pesos en bf16, de modo que el resultado es un checkpoint denso estandar de 8.767 millones de parametros, cargable con `transformers` y compatible con vLLM. La relevancia actual radica en que sirve como referencia reproducible para evaluar tecnicas de alineacion de seguridad en modelos multimodales, con puntuaciones publicadas en varios benchmarks de seguridad y utilidad.

La ficha tecnica disponible es limitada: el autor no documenta idiomas soportados ni detalles del dataset mas alla de su nombre, y no hay resultados de benchmarks generales (MMLU, HumanEval, etc.). La informacion de rendimiento se limita a las metricas de seguridad y utilidad reportadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL: torre de vision + proyector + LLM decoder); ajuste LoRA fusionado |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `cutoff_len: 2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con cuantizacion estandar de transformers/vLLM, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 17,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct: un transformer multimodal que procesa entradas de imagen y texto y genera texto, con una torre de vision, un proyector multimodal y un decoder de lenguaje. Sobre esa base se aplico un SFT con LoRA de rango 8, alpha 16 y dropout 0,05 sobre todas las capas lineales (`lora_target: all`), manteniendo congeladas la torre de vision (`freeze_vision_tower: true`) y el proyector multimodal (`freeze_multi_modal_projector: true`). El entrenamiento se realizo con LLaMA-Factory sobre el 100 % de los datos SFT de VLGuard, con learning rate 5e-5, 3 epocas, scheduler coseno, warmup del 10 %, batch global 8 (batch por dispositivo 1 con acumulacion de gradientes 8), `cutoff_len` 2048, bf16 y TF32, semilla 42 y determinismo completo. La resolucion maxima de imagen configurada fue de 1.310.720 pixeles.

El adaptador resultante (sha256 `f86054f525006a92dc802d5377b694a6458e5d059faec143616c8d294612b675`) se fusiono en los pesos en bf16 con PEFT mediante el script `eval/generate.py` del proyecto WSP-MLLM-Safety (commit `4f2763c`). La revision del modelo base utilizada fue `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`. Todo el entrenamiento se ejecuto en una unica GPU NVIDIA A40. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, RLHF/DPO) mas alla del propio SFT con LoRA.

## Capacidades

- Generacion de texto e imagen-texto: el modelo acepta entradas multimodales (imagen + texto) y produce respuestas de texto, heredando las capacidades del Qwen3-VL-8B-Instruct base.
- Razonamiento visual: al conservar la torre de vision y el proyector del modelo base, mantiene la capacidad de interpretar imagenes y responder preguntas sobre ellas.
- Alineacion de seguridad: el ajuste con VLGuard busca reducir respuestas inseguras ante prompts visuales y textuales potencialmente daninos.
- Conversacion multi-turno: la pipeline `image-text-to-text` y el template `qwen3_vl_nothink` indican soporte de dialogo conversacional.
- Modo sin *thinking*: el template de entrenamiento es `qwen3_vl_nothink`, por lo que el ajuste se realizo sin el modo de razonamiento extendido del modelo base.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Capacidades multilingues: no documentadas (idiomas no disponibles).

## Casos de uso

- Evaluacion de tecnicas de alineacion de seguridad: el modelo sirve como *baseline* SFT reproducible para comparar contra otras estrategias (DPO, RLHF, filtrado de datos) en el benchmark VLGuard; su valor esta en las puntuaciones publicadas y en la configuracion de entrenamiento documentada.
- Moderacion de contenido multimodal en produccion: puede integrarse como clasificador/generador de respuestas seguras ante imagenes subidas por usuarios, aprovechando su entrenamiento especifico en rechazo de peticiones inseguras (FigStep, MM-SafetyBench).
- Investigacion en sobre-rechazo: con una metrica de utilidad del 78,5 % y un 12 % de rechazo en FigStep-benign, es util para estudiar el equilibrio entre seguridad y utilidad en asistentes visuales.
- Asistente visual con restricciones de seguridad: en entornos donde se requiere que el modelo decline peticiones daninas con alta tasa (MM-SafetyBench 0 % unsafe), puede desplegarse como capa de respuesta en aplicaciones de atencion al cliente con imagenes.
- Reproduccion de experimentos: dado que la model card documenta commit, semilla, hiperparametros y hashes de datos y adaptador, permite reproducir el entrenamiento y auditar el pipeline con LLaMA-Factory.
- Despliegue en infraestructura existente de Qwen3-VL: al conservar todos los ficheros del modelo base salvo los pesos, puede servirse con vLLM (`LLM(model="Adeely93/wsp_sft_vlguard_qwen3vl-8b_lr5e-5_epoch3")`) sin cambios en el stack de inferencia.

## Benchmarks y rendimiento

Resultados reportados en la model card (seguridad: % unsafe; utilidad: media de % correcto en ScienceQA y MathVista; sobre-rechazo: % de rechazos; 100 muestras por conjunto, juez gpt-4.1-mini, margen aproximado de ±8 puntos; decodificacion con temperature 0,7, top-p 0,8, top-k 20, presence penalty 1,5, maximo 4.096 tokens nuevos, semilla 42):

| Benchmark | Resultado |
|---|---|
| FigStep (seguridad) | 8 % unsafe |
| MM-SafetyBench (seguridad) | 0 % unsafe |
| JB-Mini (seguridad) | 3 % unsafe |
| Utility (ScienceQA + MathVista) | 78,5 % |
| MOSSBench (sobre-rechazo) | 86 % |
| FigStep-benign (sobre-rechazo) | 12 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 17,5 GB, por lo que se necesitan al menos ~18-20 GB de VRAM para cargar el modelo completo en bf16, mas el espacio para el procesador de vision y el KV cache.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA A40 (48 GB). Para inferencia en bf16 son adecuadas A40, A100 (40/80 GB) y H100; en consumer, una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen ajustado, y cuantizaciones de 8 o 4 bits reducen el requisito por debajo de 16 GB.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB o menos requerira cuantizacion, no documentada por el autor.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (ejemplo oficial de la model card); vLLM (`LLM(model=...)`), segun indica el autor; el resto de ficheros son los del modelo base, por lo que deberia funcionar donde lo haga Qwen3-VL-8B-Instruct.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wsp_sft_vlguard_qwen3vl-8b_lr5e-5_epoch3 | 8,77 B | no disponible | SFT de seguridad multimodal (VLGuard) | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8 B | no disponible | Asistente multimodal generalista | no disponible en la informacion | Hugging Face |
| Otros baselines WSP (Adeely93/wsp_sft_vlguard_baselines) | no disponible | no disponible | Variantes SFT de seguridad | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de benchmarks.

## Limitaciones y advertencias

- El modelo es un *baseline* de investigacion con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion independiente.
- El sobre-rechazo es elevado: 86 % en MOSSBench y 12 % en FigStep-benign, lo que indica tendencia a rechazar peticiones benignas.
- La utilidad cae al 78,5 % (media de ScienceQA y MathVista), inferior a la del modelo base presumiblemente, lo que sugiere un coste en capacidad generalista tras el ajuste de seguridad.
- Las metricas se calcularon con 100 muestras por conjunto y un juez automatico (gpt-4.1-mini) con margen de ±8 puntos; la fiabilidad estadistica es limitada.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un modelo generativo multimodal, persiste el riesgo inherente.
- Sesgos conocidos: no documentados por el autor.
- Idiomas soportados: no disponibles; el ajuste se realizo con VLGuard, cuya composicion linguistica no se detalla.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene sus propios terminos que deben verificarse.
- El entrenamiento uso `cutoff_len` 2048 y template `qwen3_vl_nothink`; el comportamiento con contextos mas largos o con modo *thinking* no esta validado.
- No se documentan capacidades de tool calling ni de agente; no asumirlas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/wsp_sft_vlguard_qwen3vl-8b_lr5e-5_epoch3
- Baselines WSP: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio del proyecto (WSP-MLLM-Safety, commit `4f2763c`): no disponible como URL en la informacion proporcionada
- Dataset VLGuard: no disponible como URL en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
