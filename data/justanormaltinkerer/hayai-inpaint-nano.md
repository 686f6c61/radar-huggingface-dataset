# JustANormalTinkerer/hayai-inpaint-nano

## Resumen

Hayai Inpaint Nano es un modelo de inpainting de imagen especializado en limpieza de manga y comics, desarrollado por JustANormalTinkerer. Su proposito es eliminar texto, efectos de sonido (SFX) y rotulacion de paginas de manga para facilitar pipelines de traduccion automatica local, rellenando las zonas borradas con contenido coherente (tramas, lineas de tinta, speedlines y screentones). Se distribuye principalmente como modelo ONNX optimizado para ejecucion en CPU, sin necesidad de GPU.

El modelo es notablemente pequeno: 1,78 millones de parametros y aproximadamente 13,3 GMACs por ROI de 512x512. Pese a su tamano, incorpora una arquitectura poco habitual que combina una transformada wavelet de Haar 2D en espacio YCoCg con bloques FFC-DCT (Fast Fourier Convolution con DCT real) inspirados en LaMa. La interfaz ONNX es de dos tensores (imagen y mascara de agujero) y garantiza la preservacion bit-exacta de los pixeles fuera de la mascara.

Es relevante ahora porque demuestra que tareas de inpainting estructurado en dominios muy especificos (lineas de tinta de 1 px, tramas periodicas) pueden resolverse en CPU con latencias de cientos de milisegundos y modelos de menos de 2M de parametros, lo que abarata enormemente el despliegue de pipelines de traduccion de manga en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con stem wavelet YCoCg + 2D Haar DWT (12 bandas), encoder/decoder con bloques depthwise-separable con gating y bottleneck espectral FFC-DCT |
| Parametros totales | 1,78 M (generador, BatchNorm plegado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); entrada fija de 512x512 |
| Tipos de cuantizacion | no disponible (se distribuye en FP32; ONNX opset 17) |
| Idiomas soportados | no disponible (no procesa texto; opera sobre pixeles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`hayai_inpaint_nano_512.onnx`), PyTorch FP32 (`hayai_inpaint_nano_fused.pt`), PyTorch EMA sin plegar (`hayai_inpaint_nano_latest_ema.pt`) |

## Arquitectura y entrenamiento

La arquitectura parte de una transformada wavelet de Haar 2D sin perdidas sobre espacio YCoCg firmado, que descompone la imagen en 12 bandas y reduce la resolucion espacial a 256x256 antes de las convoluciones. El encoder y el decoder usan bloques depthwise-separable con gating (`c0=48`, `c1=96`, `c2=256`) y fusion de skips con gating por mascara. El cuello de botella espectral consta de 8 bloques FFC-DCT duales a 64x64 (rama local densa multi-dilatacion 3x3 en paralelo con rama global condicionada por frecuencia via DCT-II 2D) mas 1 bloque FFC-DCT a 128x128. Toda la normalizacion BatchNorm se pliega algebraicamente en las Conv2d en el grafo exportado, de modo que no queda ninguna capa de normalizacion en ONNX, lo que garantiza invariancia al tamano de mascara y velocidad en CPU.

En cuanto al entrenamiento, los datos son un 85% Manga109-s (6.696 paginas de entrenamiento) junto con manga109-segmentation v3.0.0 (169.719 mascaras RLE ajustadas de texto y onomatopeyas), con recorte multiescala (0,65x-1,35x) y exclusion de texto existente; el 15% restante corresponde a AnimeText (2 shards; el dato de tamano queda truncado en la informacion disponible). No se detalla en la model card si hubo RLHF, DPO u otras fases de ajuste, ni el numero total de tokens o pasos.

## Capacidades

- Inpainting de imagen condicionado por mascara binaria: rellena regiones marcadas como agujero preservando el resto de pixeles de forma bit-exacta.
- Eliminacion de texto y rotulacion en paginas de manga, incluyendo bordes negros y blancos tras dilatacion de mascara de 2-4 px.
- Reconstruccion de lineas de tinta de 1 px, speedlines, tramas y screentones periodicos gracias al campo receptivo global de los bloques FFC-DCT.
- Reconstruccion de bordes de panel y estructuras lineales a traves de huecos anchos de texto o SFX.
- Procesamiento por ROI nativo a 512x512 con contexto circundante recomendado de al menos 72 px.
- Interfaz ONNX de dos tensores (imagen y mascara) sin preprocesadores auxiliares ni transformadas de distancia OpenCV.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de imagen.
- No procesa texto ni audio; no tiene capacidades multilingues ni modo de pensamiento.
- Opcion de "chroma snap" para forzar cero croma en paginas en blanco y negro.

## Casos de uso

- Limpieza de paginas de manga para traduccion automatica: el modelo elimina el texto original de los globos y SFX, permitiendo que un pipeline posterior inserte la traduccion sin artefactos. Es adecuado por su preservacion bit-exacta fuera de mascara y su velocidad en CPU.
- Preprocesado en escaneo y remasterizacion de manga: se puede integrar en un pipeline de digitalizacion para borrar rotulacion de ediciones antiguas y reconstruir tramas, usando el modelo ONNX en servidores sin GPU.
- Limpieza por lotes en estaciones de trabajo modestas: con ~390 ms por ROI de 512x512 en 4 hilos de CPU, se pueden procesar cientos de paginas por hora en hardware de consumo, lo que lo hace viable para editoriales pequenas o proyectos de fan translation.
- Deteccion y eliminacion de SFX y onomatopeyas: el entrenamiento con mascaras de onomatopeyas de manga109-segmentation permite borrar SFX integrados en la trama sin romper el screentone subyacente.
- Integracion en herramientas de edicion de comics: el contrato ONNX simple (imagen y mascara) facilita su inclusion en plugins de GIMP, Krita o scripts de Python para retoque interactivo por regiones.
- Generacion de datos sinteticos para entrenamiento: al poder borrar texto y rellenar de forma coherente, se pueden crear pares imagen/mascara para aumentar datasets de deteccion de texto o de inpainting en dominio manga.
- Despliegue en dispositivos de borde o entornos air-gapped: al ser un modelo de 1,78M de parametros y ~13,3 GMACs, cabe en CPU de bajo consumo y no requiere conexion ni GPU, lo que encaja en flujos de traduccion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay tablas de MMLU, HumanEval, GSM8K ni metricas de inpainting como PSNR, SSIM o LPIPS en la model card). Los unicos datos de rendimiento publicados son de latencia:

| Metrica | Valor |
|---|---|
| Latencia por ROI 512x512 (ONNX Runtime, 4 hilos CPU) | ~390 ms |
| Latencia por ROI 512x512 (PyTorch FP32 fusionado, 4 hilos CPU) | 549 ms |
| Tiempo total en doble pagina completa (14 ROIs, ONNX) | 5,47 s |
| Parametros | 1,78 M |
| Computo por ROI 512x512 | ~13,3 GMACs |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo recomendado (CPU). En GPU, el modelo es tan pequeno (1,78M de parametros en FP32, unos 7 MB de pesos) que la VRAM necesaria es marginal, aunque no se publican cifras.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU. Cualquier GPU moderna (RTX 4090, A100, H100) podria ejecutarlo, pero el autor no reporta latencias en GPU.
- Cabe en cualquier CPU de consumo; el autor reporta ~390 ms por ROI en 4 hilos. No requiere GPU de consumo.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (recomendado, con `ORT_ENABLE_ALL` y 4 hilos intra-op), PyTorch FP32 fusionado, y el script `infer_hayai_inpaint_nano.py` para pipeline de ROI clustering. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de imagen).
- Latencia y throughput: ~390 ms/ROI en ONNX (4 hilos), 549 ms/ROI en PyTorch FP32 fusionado, 5,47 s para una doble pagina de 14 ROIs en ONNX. El throughput escala con el numero de hilos y ROIs.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hayai Inpaint Nano | 1,78 M | CNN + wavelet + FFC-DCT, CPU-first | 512x512 ROI | Apache 2.0 | ONNX + PyTorch |
| LaMa (referencia citada) | no disponible | FFC con rfft2, inpainting general | no disponible | no disponible | no disponible |
| Modelos de inpainting generales (p. ej. Stable Diffusion inpainting) | cientos de millones a miles de millones | difusion | 512x512 o 1024x1024 | variable | variable |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada; la comparativa se limita a caracteristicas arquitectonicas y de licencia. LaMa se menciona solo como inspiracion arquitectonica, sin cifras de rendimiento comparables.

## Limitaciones y advertencias

- Modelo de dominio especifico (manga/comic): su rendimiento fuera de ese dominio (fotografia, ilustracion generica) no esta documentado y probablemente sea pobre.
- Entrada fija de 512x512: no se debe reescalar una pagina completa de alta resolucion a 512x512, ya que se destruyen lineas finas y tramas; hay que usar el pipeline de ROI clustering con contexto de al menos 72 px.
- Requiere mascaras razonablemente precisas; el autor recomienda dilatar 2-4 px para eliminar halos de contorno de texto.
- Riesgo de artefactos en huecos muy anchos o en regiones con estructura no vista en entrenamiento; no hay metricas publicadas de calidad (PSNR/SSIM/LPIPS).
- No procesa texto, audio ni razonamiento; no es un modelo de lenguaje y no soporta tool calling ni agentes.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenar sobre todo con Manga109-s y AnimeText, puede heredar sesgos estilisticos de esos corpus.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los datasets de entrenamiento (Manga109-s y AnimeText) si redistribuye derivados.
- No hay informacion sobre cuantizacion ni sobre rendimiento en GPU; el despliegue en produccion debe validarse con datos propios.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustANormalTinkerer/hayai-inpaint-nano
- Paper de referencia Manga109 (arxiv:2109.07161): https://arxiv.org/abs/2109.07161
- Dataset Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- Dataset manga109-segmentation: https://huggingface.co/datasets/mayocream/manga109-segmentation
- Imagen de comparacion (CDN de Hugging Face): https://cdn-uploads.huggingface.co/production/uploads/63b7fbed59060ca9f4c5cf8f/k_CMLuurCosAFENlHP-xx.png
