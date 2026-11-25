# kashif-deepfake/detector-weights

## Resumen

`kashif-deepfake/detector-weights` no es un modelo generativo, sino un repositorio espejo (mirror) que agrupa los pesos congelados de una coleccion de detectores de deepfake y de imagenes sinteticas utilizados por el proyecto Kashif. Cada archivo es una copia byte a byte del checkpoint original publicado por sus autores, de modo que el proyecto no dependa de que los hosts de origen sigan disponibles. El repositorio no entrena nada nuevo: su valor es la reproducibilidad y la trazabilidad de los pesos.

El contenido es heterogeneo. Conviven detectores de voz (basados en wav2vec2 XLS-R, conformer y arquitecturas tipo AASIST), detectores de imagen generada (CNNSpot, CLIP-based, DDA, DRCT, Fatformer, Community Forensics), detectores de caras manipuladas del ecosistema DeepfakeBench (Capsule, F3-Net, RECCE, SRM, Xception, MesoNet, etc.) y utilidades auxiliares como el predictor de landmarks faciales de dlib. Los formatos incluyen `.pth`, `.bin`, `.safetensors` y `.onnx`.

Es relevante para quien construye pipelines de deteccion de contenido sintetico o de anti-spoofing, porque concentra en un unico punto de descarga decenas de checkpoints con hashes sha256 verificables. No obstante, el repositorio no documenta arquitecturas, rendimiento ni condiciones de uso mas alla de la tabla de ficheros, y la licencia agregada no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (coleccion heterogenea: wav2vec2/Conformer, CLIP ViT-L/14, ConvNeXt, EfficientNet-B4, Xception, Capsule, F3-Net, entre otras) |
| Parametros totales | no disponible (variable por checkpoint; el repo pesa 62,2 GB en total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precision original; un checkpoint en ONNX) |
| Idiomas soportados | no disponible (las etiquetas de idioma no aplican a detectores) |
| Licencia | no disponible (cada checkpoint conserva la licencia de su autor original; no hay licencia agregada declarada) |
| Formato de pesos | `.pth`, `.bin`, `.safetensors`, `.onnx`, `.dat` (dlib) y ficheros `.py`/`.json` de definicion y configuracion |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia ni un proceso de entrenamiento unificado. Es un contenedor de checkpoints ya entrenados por terceros. La tabla de la model card enumera cada detector con su ruta, el prefijo de su sha256 y el enlace a la fuente original, lo que permite auditar la procedencia fichero a fichero. Entre los componentes se incluyen:

- Detectores de voz: `df_arena_500m` (backbone basado en wav2vec2 XLS-R 300M con capas Conformer) y `xlsr_sls` en formato ONNX.
- Detectores de imagen sintetica basados en CLIP: `clipdet` (con backbone OpenCLIP ViT-L/14 CommonPool.XL), `corvi2023`, `c2p_clip`, `effort` y `fatformer` (que ademas requiere `ViT-L-14.pt` de OpenAI).
- Detectores de imagen de la familia AIGCBench y afines: `cnnspot`, `dda`, `drct` (ConvNeXt entrenado sobre DRCT-2M/SD v1.4), `community_forensics` (modelo de 384 px de OwensLab), `b_free` (DINOv2), `aide`, `aligned_forensics` y `antifakeprompt` (que arrastra InstructBLIP Vicuna-7B y EVA-ViT-G como dependencias).
- Familia DeepfakeBench: `capsule`, `cnnaug`, `core`, `effnb4`, `f3net`, `ffd`, `meso4`, `meso4incep`, `recce`, `spsl`, `srm`, `ucf` y `xception`, con el predictor `shape_predictor_81_face_landmarks.dat` compartido para el preprocesado facial.

No se documentan volumenes de datos de entrenamiento, composicion de datasets ni tecnicas de alineacion como RLHF o DPO, porque cada checkpoint procede de un trabajo distinto. La innovacion practica del repositorio es la integridad verificable: cada sha256 del manifiesto (`weights_manifest.json`) debe coincidir con el fichero descargado, y la descarga completa se realiza con `huggingface-cli download kashif-deepfake/detector-weights --local-dir "$KASHIF_WEIGHTS_DIR"`.

## Capacidades

- Deteccion de voz sintetica o convertida (anti-spoofing): clasificacion de audio real frente a generado mediante los checkpoints de la familia DF Arena y XLSR-SLS.
- Deteccion de imagenes generadas por difusion y GAN: clasificadores entrenados sobre datasets como DRCT-2M, SD v1.4, COCO y variantes de Stable Diffusion 2/3.
- Deteccion de caras manipuladas (face swap y face reenactment): modelos de DeepfakeBench y detectores especificos como Capsule, RECCE o F3-Net.
- Analisis forense de imagenes: modelos como Aligned Forensics y AIDE orientados a localizar manipulaciones, no solo a clasificar la imagen global.
- Extraccion de landmarks faciales: el predictor de 81 puntos de dlib permite el preprocesado de recortes de cara que requieren varios de los detectores.
- Inferencia en ONNX: el checkpoint `xlsr-sls.onnx` puede ejecutarse con ONNX Runtime sin depender de PyTorch.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Moderacion de contenido en plataformas: clasificar imagenes subidas por usuarios con `clipdet`, `corvi2023` o `community_forensics` antes de publicarlas, usando el sha256 del manifiesto para garantizar que el checkpoint desplegado es el esperado.
- Verificacion de autenticidad de audio en medios: pasar locuciones sospechosas por `df_arena_500m` o `xlsr_sls` para obtener una puntuacion de spoofing; util en redacciones y agencias de fact-checking.
- Analisis forense pericial: combinar `aligned_forensics` y `aide` para localizar regiones manipuladas en una imagen y aportar mapas de evidencia en un informe.
- Investigacion en deteccion de deepfakes: usar los checkpoints de DeepfakeBench como linea base reproducible en experimentos de comparacion, evitando depender de enlaces de Google Drive o GitHub Releases que pueden caer.
- Pipeline de preprocesado facial: emplear `shape_predictor_81_face_landmarks.dat` junto con los detectores de cara para alinear recortes antes de la inferencia, manteniendo coherencia con el preprocesado original de DeepfakeBench.
- Despliegue en entornos con restricciones de red: al ser un mirror unico, un equipo con acceso limitado a Hugging Face puede aprovisionar todos los detectores en una sola descarga y verificar integridad contra `weights_manifest.json`.
- Auditoria de cadena de suministro de modelos: comprobar que los pesos usados en produccion coinciden con los publicados por los autores originales mediante los hashes sha256 documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de AUC, EER, precision ni recall para ningun detector, y el repositorio no aporta evaluaciones propias.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende de cada checkpoint. El repositorio completo ocupa 62,2 GB en disco, pero la inferencia se hace cargando un detector cada vez.
- GPU recomendadas: no disponible. Los detectores de imagen basados en ViT-L/14 (clipdet, fatformer, effort) y los de voz con backbone XLS-R 300M requieren GPU con memoria suficiente para el backbone completo; los clasificadores ligeros tipo MesoNet o F3-Net pueden ejecutarse en CPU.
- GPU de consumo: no confirmado. Los modelos ligeros de DeepfakeBench son candidatos razonables para GPU de consumo, pero no hay datos publicados de VRAM por checkpoint en la informacion disponible.
- Opciones de despliegue: PyTorch para los `.pth`/`.bin`/`.safetensors`; ONNX Runtime para `xlsr-sls.onnx`; los ficheros `.py` incluidos (`backbone.py`, `conformer.py`) son necesarios para reconstruir la arquitectura de `df_arena_500m`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | kashif-deepfake/detector-weights | OwensLab/commfor-model-384 | SCLBD/DeepfakeBench | SpeechAntiSpoofingBenchmarks/DF_Arena_500M_V_1 |
|---|---|---|---|---|
| Tipo | Mirror agregado de detectores | Detector unico de imagen | Framework con multiples detectores | Detector unico de voz |
| Parametros | Variable por checkpoint | no disponible | Variable por checkpoint | no disponible |
| Contexto | no aplica | no aplica | no aplica | no aplica |
| Rendimiento | no disponible | no disponible | no disponible | no disponible |
| Licencia | no disponible (hereda de cada autor) | no disponible | no disponible | no disponible |
| Disponibilidad | Un solo repo, 62,2 GB | Hugging Face | GitHub Releases | Hugging Face |

La comparativa es estructural: el mirror se distingue por agregar checkpoints de varios autores con verificacion sha256, mientras que las alternativas publican un unico modelo o un framework. No hay datos de rendimiento comparables en la informacion disponible.

## Limitaciones y advertencias

- Ausencia de licencia agregada: cada checkpoint conserva la licencia de su autor original y la model card advierte explicitamente de que hay que comprobar la fuente de cada fichero antes de redistribuirlo. El uso comercial no esta garantizado para ningun componente.
- Sin documentacion de arquitectura ni de preprocesado por detector: solo se incluyen algunos ficheros de definicion y configuracion; reproducir la inferencia de un checkpoint concreto exige consultar el repositorio original.
- Riesgo de falsos positivos y negativos: no se publican tasas de error, y los detectores de deepfake son sensibles a la compresion, al ruido y al dominio de entrenamiento.
- Generalizacion limitada: los clasificadores entrenados sobre generadores concretos (por ejemplo, SD v1.4) pueden degradarse frente a modelos generativos posteriores.
- Dependencias pesadas y no triviales: `antifakeprompt` arrastra InstructBLIP Vicuna-7B y EVA-ViT-G, y `fatformer` requiere el `ViT-L-14.pt` de OpenAI, lo que eleva mucho los requisitos de memoria.
- Fechas del repositorio: la model card indica creacion en noviembre de 2026, lo que conviene contrastar con el estado real de los enlaces de origen.
- Sin garantias de mantenimiento: al ser un mirror, no hay compromiso de actualizacion si los autores originales publican nuevas versiones.
- No apto para uso generativo: no debe emplearse como modelo de lenguaje ni para tareas fuera de la deteccion forense.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kashif-deepfake/detector-weights
- Fuente original DF Arena 500M: https://huggingface.co/SpeechAntiSpoofingBenchmarks/DF_Arena_500M_V_1
- Fuente original XLSR-SLS: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-SLS
- Config de wav2vec2 XLS-R 300M: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Community Forensics 384: https://huggingface.co/OwensLab/commfor-model-384
- DeepfakeBench (releases de pesos): https://github.com/SCLBD/DeepfakeBench
- ClipBased Synthetic Image Detection (GRIP UNINA): https://github.com/grip-unina/ClipBased-SyntheticImageDetection
- B-Free (GRIP UNINA): https://www.grip.unina.it/download/prog/B-Free/weights/BFREE_dino2reg4.zip
- Dual Data Alignment (DDA): https://huggingface.co/Junwei-Xi/Dual-Data-Alignment
- DRCT-2M (ModelScope): https://modelscope.cn/datasets/BokingChen/DRCT-2M
- OpenCLIP ViT-L/14 CommonPool.XL: https://huggingface.co/laion/CLIP-ViT-L-14-CommonPool.XL-s13B-b90K
- InstructBLIP Vicuna-7B (LAVIS): https://storage.googleapis.com/sfr-vision-language-research/LAVIS/models/InstructBLIP/instruct_blip_vicuna7b_trimmed.pth
- EVA-ViT-G (LAVIS): https://storage.googleapis.com/sfr-vision-language-research/LAVIS/models/BLIP2/eva_vit_g.pth
