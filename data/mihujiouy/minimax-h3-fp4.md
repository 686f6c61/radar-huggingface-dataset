# MIHUJIOUY/MiniMax-H3-FP4

## Resumen

MiniMax-H3-FP4 es una versión cuantizada en NVFP4 (formato de coma flotante de 4 bits de NVIDIA, E2M1) del backbone de vídeo Ref2VA del modelo MiniMax-H3, desarrollado originalmente por MiniMax. La cuantización la firma el usuario MIHUJIOUY y reduce el peso del transformer de 66,28 GB en BF16 a 37,48 GB, con un núcleo FP4 efectivo de solo 11,3 GB. El objetivo es hacer viable la generación de vídeo a partir de una imagen de referencia (image-to-video con pista de audio) en GPUs de consumo de la familia Blackwell, hasta una RTX 5070 de 12 GB.

El modelo resuelve un problema de accesibilidad de hardware: el MiniMax-H3 original en BF16 requiere alrededor de 30 minutos por clip en la configuración de referencia, mientras que esta variante FP4 reporta unos 203 segundos por clip de 124 fotogramas a 512x512 con 8 pasos (modo turbo), es decir, aproximadamente 6 veces más rápido. Se apoya en los tensor cores FP4 de las arquitecturas sm120 (RTX 50), por lo que no es utilizable en GPUs de la serie 40 o anteriores ni en AMD.

Es relevante ahora porque demuestra una ruta práctica de cuantización W4A4 para modelos de difusión de vídeo de gran tamano, con un manifiesto de cuantización explícito, cachés AdaLN precalculadas por número de pasos y sumas de verificación SHA-256 para cada fragmento. No obstante, es un derivado no oficial, con cero descargas y cero likes en el momento de la consulta, y depende de componentes externos (codificador de texto Qwen3-VL de 63 GB, VAE de vídeo y audio) que no se incluyen en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (backbone Ref2VA de MiniMax-H3) con cuantización NVFP4 W4A4 |
| Parametros totales | no disponible (pesos BF16 originales: 66,28 GB; cuantizados: 37,48 GB) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de vídeo; ventana expresada en fotogramas: 124 fotogramas por clip en las pruebas) |
| Tipos de cuantizacion | NVFP4 (E2M1) W4A4 con escala por bloque de 16 (FP8) y escala global por tensor; capas AdaLN, norm, embed, cabeza de salida y patchify se mantienen en BF16/FP32 |
| Idiomas soportados | en (inglés) |
| Licencia | MiniMax-H3 Community License Agreement (licencia "other", derivado cuantizado) |
| Formato de pesos | safetensors (13 fragmentos `model-00001-of-00013` a `model-00013-of-00013`, más `adaln_cache*.safetensors` y `fp4_manifest.json`) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo: es una derivado de cuantización del transformer Ref2VA de MiniMax-H3, un modelo de difusión para generación de vídeo condicionada por imagen de referencia y con pista de audio. La cuantización se aplica a las capas FFN (fc1/fc2) y de atención (qkv/out) en formato NVFP4 E2M1 con escala por bloque de 16 elementos almacenada en FP8 más una escala global por tensor. El resto de componentes (AdaLN, normalizaciones, embeddings, cabeza de salida y patchify) permanece en BF16/FP32, lo que supone 26 GB de pesos preservados frente a los 11,3 GB del núcleo FP4 real.

Una innovación operativa destacable es el uso de cachés AdaLN precalculadas (`adaln_cache_s2`, `s4`, `s8`, `s20`) ligadas al número de pasos de muestreo; el motor debe seleccionar la caché correspondiente al valor de `--steps` o el resultado degenera en ruido. El autor reporta la pérdida de cuantización como error relativo L2 de ida y vuelta: 9,4-9,6 % en primera ronda (atribuido al suelo inherente de E2M1), 0,86 % en segunda ronda y 0,078 % en tercera. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de vídeo a partir de una imagen de referencia (image-to-video) con pista de audio asociada.
- Modos de muestreo configurables: turbo de 8 pasos (124 fotogramas a 512x512) y estándar de 20 pasos.
- Generación de alta resolución mediante mosaico (tiling): 2K y 4K con 22 fotogramas y tile de 1024, con solapamiento configurable.
- Control de fotogramas y resolución mediante parámetros de línea de comandos (`--frames`, `--size`, `--steps`, `--turbo`).
- Condicionamiento por referencia visual (`--ref`) y tensor de condición (`--cond`).
- Salida en MP4 (`--out`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de vídeo, no un LLM.
- Capacidad multilingüe limitada al inglés en la metadata del repositorio.

## Casos de uso

- Prototipado de vídeo generativo en estaciones de trabajo con RTX 5070 de 12 GB: permite iterar sobre clips de 124 fotogramas a 512x512 en unos 203 segundos con 8 pasos, un tiempo asumible para ciclos de prueba y error en diseño de concepto.
- Animación de imágenes fijas para previsualización de storyboards: a partir de una imagen de referencia se obtiene un clip corto con audio, útil para presentar ideas a clientes antes de producir el material definitivo.
- Generación de material promocional de bajo coste en local: evita depender de APIs en la nube y mantiene los datos en la máquina, algo relevante para contenido sujeto a confidencialidad.
- Pruebas de concepto en alta resolución con GPUs de 24-32 GB: el autor indica que con 32 GB se puede mantener todo residente y abordar 2K/4K sin degradar la configuración, lo que sirve para validar composiciones antes de un render final en BF16.
- Investigación sobre cuantización de modelos de difusión de vídeo: el manifiesto `fp4_manifest.json`, las cachés AdaLN y las sumas SHA-256 permiten reproducir y auditar el proceso de cuantización W4A4.
- Evaluación comparativa de calidad FP4 frente a BF16: la referencia de 30 minutos por clip en BF16 frente a los 284 segundos en FP4 a 20 pasos permite medir la degradación visual introducida por la cuantización en un pipeline controlado.
- Educación y demostración técnica: útil para explicar en un entorno docente cómo funcionan los tensor cores FP4 de Blackwell y qué compromisos impone la cuantización extrema en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta mediciones de tiempo de inferencia en una RTX 5070 de 12 GB (noviembre de 2026):

| Configuración | Tiempo medido |
|---|---|
| 124 fotogramas / 512², turbo 8 pasos | ≈203 s por clip (primer fotograma bloqueado, L1 0,037) |
| 124 fotogramas / 512², 20 pasos | ≈284 s (11,88 s por paso: 10,5 % cuantización, 60,3 % atención) |
| 2K, 22 fotogramas, tile 1024, solapamiento 0 | 51 s por paso |
| 4K, 22 fotogramas, tile 1024, solapamiento 0 | 173 s por paso más ≈945 s de decodificación VAE |
| BF16 de referencia, misma configuración a 20 pasos | ≈30 minutos (FP4 ≈6× más rápido) |

## Requisitos de hardware

- VRAM estimada: el núcleo FP4 ocupa 11,3 GB y el flujo por paso lee en streaming unos 11,5 GB tras precalcular AdaLN; los 26 GB de pesos preservados en BF16/FP32 condicionan el uso en tarjetas pequenas.
- GPU mínima probada: NVIDIA RTX 5070 de 12 GB (sm120, Blackwell), con resolución 512x512 y 124 fotogramas.
- GPU recomendadas: RTX 5070 Ti, RTX 5080 y RTX 5090 por su mayor VRAM y ancho de banda; con 16 GB o más el autor indica mayor residencia y velocidad, y con 32 GB se puede mantener todo residente y abordar 2K/4K sin degradar.
- Incompatibilidad: no funciona en GPUs de la serie 40 (Ada) ni anteriores, ni en AMD, por ausencia de tensor cores FP4.
- Opciones de despliegue: motor propio `h3_fp4` del repositorio de GitHub del autor (`ai-pipeline/h3_fp4`), invocado mediante `python code/h3_video_job.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo de este tipo).
- Dependencias externas: requiere los pesos oficiales de `MiniMax/MiniMax-H3` para `video_vae`, `audio_vae`, `text_encoder` (Qwen3-VL, 63 GB), `processor`, `tokenizer`, `scheduler` y `audio_scheduler`, que suman aproximadamente 10,4 GB más el codificador de texto.
- Latencia y throughput: ver tabla de benchmarks; el cuello de botella declarado es la atención (60,3 % del tiempo por paso) frente a la cuantización (10,5 %).

## Comparativa con modelos similares

| Modelo | Parámetros / tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-FP4 (este) | 37,48 GB en disco; núcleo FP4 de 11,3 GB | 124 fotogramas por clip (pruebas) | ≈203 s/clip turbo 8 pasos en RTX 5070 12 GB | MiniMax-H3 Community License | Hugging Face, 0 descargas |
| MiniMax-H3 (BF16 original) | 66,28 GB | no disponible | ≈30 min/clip a 20 pasos (misma configuración) | MiniMax-H3 Community License | Hugging Face (MiniMaxAI) |
| Otros modelos de image-to-video comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos de image-to-video de la misma categoria en la información proporcionada, por lo que la comparativa se limita al original frente a su derivado cuantizado.

## Limitaciones y advertencias

- Es un derivado no oficial: no lo publica MiniMax, sino un tercero (MIHUJIOUY), con cero descargas y cero likes en el momento de la consulta; no hay validación independiente de la calidad.
- La pérdida de cuantización de primera ronda es alta (9,4-9,6 % de error relativo L2), atribuida al suelo inherente de E2M1; puede traducirse en degradación visual perceptible frente al BF16.
- El parámetro `--steps` debe coincidir exactamente con la caché AdaLN disponible (2, 4, 8 o 20); una combinación incorrecta produce resultados corruptos ("confetti").
- El repositorio no incluye el codificador de texto Qwen3-VL (63 GB), los VAE de vídeo y audio, el tokenizer, el processor ni los schedulers; sin ellos el modelo no es funcional.
- Dependencia estricta de hardware Blackwell (sm120): inutilizable en RTX 40, A100, H100, AMD o Apple Silicon.
- La licencia MiniMax-H3 Community License Agreement impone condiciones específicas para uso comercial; es necesario revisar el texto completo de `LICENSE` y `NOTICE` antes de cualquier despliegue productivo.
- Idiomas: solo inglés según la metadata; no se documenta soporte multilingüe.
- Riesgo de alucinación visual y de artefactos en la generación: no se han publicado evaluaciones de fidelidad ni de coherencia temporal.
- Las sumas SHA-256 de los fragmentos están anunciadas pero el autor indica que se completarán tras la subida; conviene verificar la integridad antes de usar los pesos.
- El rendimiento reportado corresponde a una única GPU y configuración; no hay datos de escalado multi-GPU ni de throughput agregado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MIHUJIOUY/MiniMax-H3-FP4
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Motor, manual de uso y muestras: https://www.modelscope.cn/models/Xanyiyan/H3-FP4-5070
- Código fuente: https://github.com/xuanyiyanyuyin/ai-pipeline/tree/main/h3_fp4
