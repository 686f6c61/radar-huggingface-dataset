# lethalbeats/embeddinggemma-2-0.8bpw-multimodal

## Resumen
EmbeddingGemma-2 0.8 BPW Multimodal es un derivado cuantizado del modelo de embeddings google/embeddinggemma-2, publicado por el usuario de Hugging Face lethalbeats (LethalBeats). Se trata de un modelo de representaciones (feature extraction / sentence-similarity) de tipo omni-modal que proyecta texto, imagen, vídeo y audio en un unico espacio vectorial unificado de 768 dimensiones, orientado a busqueda y recuperacion entre modalidades.

El artefacto parte de la arquitectura completa de Google DeepMind de unos 740 millones de parametros (270 M de backbone de texto, 170 M de encoder de vision/video y 300 M de encoder de audio) y le aplica el marco de cuantizacion sub-1-bit LittleBit de Samsung Research (arXiv:2506.13771), con una factorizacion latente asimetrica 65/35 sobre los tres encoders. El resultado son unos 704 MB de pesos, un 76,2 % menos que la base en BF16/FP32 (~2.960 MB), es decir, unas 4,2 veces mas compacto.

Su relevancia actual reside en que, segun la model card, permite busqueda omni-modal sobre hardware de borde, electrodomesticos y microinstancias sin necesidad de GPU, ya que la dequantizacion se realiza en caliente dentro de registros SIMD de CPU (AVX2) en bloques de 8/16 elementos por ciclo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 Multimodal Omni-Transformer (base google/embeddinggemma-2) |
| Parametros totales | ~740 M (270 M texto + 170 M vision/video + 300 M audio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (secuencia de texto) |
| Tipos de cuantizacion | LittleBit 0.8 BPW (sub-1-bit); factorizacion latente asimetrica 65/35 |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | bitstream empaquetado; requiere la libreria personalizada modeling_littlebit |

## Arquitectura y entrenamiento
El modelo no introduce un entrenamiento nuevo: es un artefacto de cuantizacion post-entrenamiento sobre google/embeddinggemma-2, un transformer multimodal de la familia Gemma 2. La arquitectura mantiene tres encoders diferenciados (texto, vision/video y audio) que comparten un espacio de embedding comun de 768 dimensiones, con similitud coseno (producto escalar sobre la esfera unitaria S^767). El backbone de texto admite secuencias de hasta 8.192 tokens; el encoder de vision procesa video muestreado a 1 fps y el encoder de audio trabaja con senal mono a 16 kHz.

La innovacion tecnica principal es la cuantizacion LittleBit de Samsung Research, que comprime los pesos a 0.8 bits por peso (BPW) mediante una factorizacion latente asimetrica (65 % primaria / 35 % secundaria) aplicada a los tres encoders. La model card indica que los pesos permanecen en RAM en formato bitstream empaquetado y se descomprimen al vuelo en registros SIMD de CPU (ymm0, ymm1 en AVX2) con una sobrecarga de cache de trabajo inferior a 64 KB, evitando picos de memoria durante la inferencia. El modelo base soporta de forma nativa Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings a 512 o 256 dimensiones y renormalizarlos en L2.

## Capacidades
- Generacion de embeddings multimodales: texto, imagen, video y audio en un unico espacio comun de 768 dimensiones.
- Recuperacion entre modalidades (cross-modal retrieval): consultas de texto contra imagenes, video o audio, y combinaciones cruzadas entre ellas.
- Feature extraction y sentence-similarity sobre cadenas de texto.
- Matryoshka Representation Learning (MRL): permite truncar los vectores a 512 o 256 dimensiones y renormalizarlos para reducir almacenamiento en bases de datos vectoriales.
- Procesamiento de video mediante muestreo a 1 fps a traves del encoder de vision.
- Procesamiento de audio a 16 kHz mono.
- No genera texto ni mantiene dialogos: es un modelo de representaciones, no un modelo generativo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; la model card declara unicamente ingles (en).

## Casos de uso
- Busqueda semantica de imagenes por texto: el modelo permite indexar un catalogo de imagenes en el espacio de 768 dimensiones y recuperarlas con consultas en lenguaje natural, sin necesidad de etiquetas manuales ni GPU.
- Recuperacion de fragmentos de video: dado que procesa video a 1 fps mediante el encoder de vision, es adecuado para localizar clips relevantes en un archivo audiovisual a partir de una descripcion de texto.
- Indexacion y busqueda de audio: con entrada de audio a 16 kHz mono, permite buscar grabaciones (por ejemplo, tormentas, aves o eventos sonoros) mediante consultas textuales en un corpus de audio.
- Sistemas de recomendacion y deduplicacion: los embeddings multimodales permiten calcular similitud entre elementos heterogeneos (texto, imagen, audio) para agrupar o recomendar contenido relacionado.
- Busqueda multimodal en aplicaciones de borde: al requerir solo ~704 MB de RAM y no necesitar GPU, encaja en microinstancias, electrodomesticos o dispositivos con CPU AVX2 para busqueda local sin conexion.
- Clasificacion y clustering no supervisado: los vectores de 768 dimensiones sirven como caracteristicas de entrada para tareas posteriores de clasificacion o agrupamiento sobre contenido mixto.
- Optimizacion de bases de datos vectoriales: gracias a MRL, se pueden almacenar embeddings truncados a 256 dimensiones renormalizados, reduciendo el coste de almacenamiento y la latencia de busqueda.
- Moderacion o filtrado de contenido: la similitud cross-modal permite detectar coincidencias entre texto y material audiovisual en pipelines automatizados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MTEB, recuperacion cross-modal ni evaluaciones de calidad tras la cuantizacion, por lo que no es posible cuantificar la perdida de rendimiento respecto a la base google/embeddinggemma-2.

## Requisitos de hardware
- VRAM: no disponible. El modelo no requiere GPU segun la model card.
- Memoria de pesos en RAM: ~704 MB (frente a ~2.960 MB de la base en BF16/FP32).
- GPU recomendadas: no aplica; el modelo esta disenado para ejecucion en CPU.
- CPU: se beneficia de instrucciones SIMD AVX2 (la dequantizacion se realiza en registros ymm0/ymm1).
- Cabe en hardware de consumo: si, en cualquier equipo con CPU moderna y AVX2; tambien en dispositivos de borde, electrodomesticos y microinstancias.
- Opciones de despliegue: requiere la libreria personalizada modeling_littlebit; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Tamano de pesos | Contexto texto | Licencia |
|---|---|---|---|---|---|
| embeddinggemma-2 0.8 BPW multimodal (este) | ~740 M | Texto, imagen, video, audio | ~704 MB | 8.192 tokens | Gemma |
| google/embeddinggemma-2 (base) | ~740 M | Texto, imagen, video, audio | ~2.960 MB (BF16/FP32) | 8.192 tokens | Gemma |
| Alternativas de embedding de texto de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion principal es contra el modelo base del que deriva: misma arquitectura y mismas capacidades multimodales, con una reduccion de memoria del 76,2 % a cambio de una posible perdida de calidad no cuantificada. No se dispone de informacion sobre otros modelos omni-modales directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias
- Idioma: la model card declara soporte unicamente de ingles (en); no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Cuantizacion agresiva: con 0.8 BPW (sub-1-bit) es esperable una degradacion de la calidad de los embeddings, pero no se aportan metricas que la cuantifiquen.
- Alucinacion: al ser un modelo de representaciones no genera texto, pero la similitud cross-modal puede producir coincidencias imprecisas o falsos positivos en la recuperacion.
- Licencia Gemma: el uso esta sujeto a los Gemma Terms of Use, que imponen condiciones y restricciones que deben revisarse antes de un uso comercial.
- Artefacto de la comunidad: no es una distribucion oficial de Google; es un derivado cuantizado por un tercero (lethalbeats).
- Madurez: el repositorio registra 0 descargas y 0 likes, con un tamano declarado de 0,0 GB, por lo que su validacion en produccion es limitada.
- Dependencia de software: requiere la libreria personalizada modeling_littlebit, lo que reduce la portabilidad respecto a formatos estandar.
- Para produccion: no se dispone de datos de latencia, throughput ni evaluacion, por lo que se recomienda validar exhaustivamente antes de desplegarlo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lethalbeats/embeddinggemma-2-0.8bpw-multimodal
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paper de LittleBit (Samsung Research): https://arxiv.org/abs/2506.13771
- Paper de LittleBit (HTML, v5): https://arxiv.org/html/2506.13771v5
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Perfil del autor: https://huggingface.co/lethalbeats
