# Fushi21/vision-qc-models

## Resumen

Vision QC models es un conjunto de cuatro artefactos ONNX publicados por el usuario Fushi21 que implementan dos métodos de detección de anomalías visuales para inspección industrial: PatchCore y WinCLIP. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de pesos exportados desde PyTorch a ONNX que actúan como backend de la aplicación Vision QC, una herramienta de inspección visual de defectos que aprende únicamente a partir de fotografías de productos correctos y se ejecuta íntegramente en CPU.

El paquete combina un extractor de características WideResNet-50-2 (capas 2 y 3, pesos ImageNet de torchvision) para el flujo PatchCore, y una torre de visión CLIP `ViT-B-16-plus-240` con pesos `laion400m_e31` de OpenCLIP, dividida en dos grafos ONNX (`winclip_tokens` y `winclip_encode`) más un fichero `.npy` con los embeddings de texto de los prompts "normal" y "anomalous" para el flujo WinCLIP. El repositorio ocupa 0,6 GB y está pensado para descargarse mediante el script `scripts/download_models.py` de la aplicación, que verifica los hashes SHA-256 publicados.

Su relevancia práctica reside en que permite inspección de defectos en producción sin GPU, sin entrenamiento supervisado con ejemplos defectuosos y con dos regímenes complementarios: PatchCore para productos con un histórico amplio de imágenes correctas (AUROC de imagen del 98,4 % en MVTec AD) y WinCLIP para productos con menos de 20 fotos, con un rendimiento de 88,6 % a 0 fotos, 93,0 % con una y 94,3 % con cinco. La licencia del export y de la model card es MIT, aunque los pesos subyacentes arrastran sus propias licencias (BSD-3-Clause para torchvision, MIT para OpenCLIP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WideResNet-50-2 (capas 2 y 3) para PatchCore; CLIP ViT-B-16-plus-240 dividido en dos grafos para WinCLIP |
| Parametros totales | no disponible (no se publica el recuento; el repo pesa 0,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen los grafos ONNX en float32) |
| Idiomas soportados | no disponible (los prompts de texto son "normal" y "anomalous" en inglés) |
| Licencia | MIT para el código de export y la model card; pesos torchvision BSD-3-Clause; pesos OpenCLIP MIT |
| Formato de pesos | ONNX (grafos) y `.npy` (embeddings de texto) |

Ficheros incluidos:

| Fichero | Tamano | Funcion |
|---|---|---|
| `backbone/wide_resnet50_l23.onnx` | 99 MB | Extractor de características PatchCore (obligatorio) |
| `zeroshot/winclip_tokens.onnx` | 3,6 MB | WinCLIP: imagen a tokens de parche |
| `zeroshot/winclip_encode.onnx` | 465 MB | WinCLIP: secuencia de tokens a embedding |
| `zeroshot/winclip_text.npy` | 5 KB | WinCLIP: embeddings de los prompts "normal" y "anomalous" |

## Arquitectura y entrenamiento

El paquete no entrena modelos nuevos: exporta a ONNX redes preentrenadas y las adapta a los pipelines de detección de anomalías. El backbone es WideResNet-50-2 con pesos ImageNet de torchvision; el grafo recibe `image` float32 de forma `(B, 3, 256, 256)` en rango [0, 1] con la normalización ImageNet integrada en el grafo, y devuelve `layer2` `(B, 512, 32, 32)` y `layer3` `(B, 1024, 16, 16)`, exactamente las capas que PatchCore emplea para construir el banco de memoria de parches. PatchCore (Roth et al., CVPR 2022) no requiere entrenamiento por gradiente: almacena características de parches de imágenes correctas y puntúa anomalías por distancia al vecino más cercano en ese banco.

El flujo WinCLIP (Jeong et al., CVPR 2023) parte de CLIP `ViT-B-16-plus-240` con pesos `laion400m_e31` de OpenCLIP 4.2.2. La torre de visión se ha dividido en dos grafos para que el backend pueda construir por sí mismo las ventanas de parches: `winclip_tokens` recibe `image` float32 `(B, 3, 240, 240)` en [0, 1] con normalización CLIP interna y devuelve `tokens` `(B, 226, 896)`, es decir, el token de clase más 15×15 tokens de parche con embeddings posicionales tras `ln_pre`; `winclip_encode` acepta `tokens` `(N, L, 896)` con cualquier longitud de secuencia y devuelve `pooled` `(N, 640)` (token de clase proyectado) y `patch_tokens` `(N, L-1, 896)` tras `ln_post`. La aplicación alimenta imágenes completas y ventanas de parche 2×2 y 3×3. El fichero `winclip_text.npy` contiene una matriz `(2, 640)` de vectores unitarios con la media del ensemble de prompts de WinCLIP para "object" (normal, anómalo).

La exportación se realizó en Kaggle con los cuadernos del repositorio de la aplicación (`notebooks/make_notebook.py` genera `01_patchcore_mvtec_kaggle.ipynb`, `02_eval_backend_kaggle.ipynb` y `03_winclip_zeroshot_kaggle.ipynb`). Se incluyó una comprobación ONNX frente a PyTorch con coseno mínimo de 0,9999998, lo que indica una fidelidad numérica prácticamente exacta de la exportación.

## Capacidades

- Detección de anomalías visuales en imágenes industriales sin necesidad de ejemplos defectuosos: PatchCore se ajusta solo con fotos correctas.
- Clasificación de imagen a nivel de imagen (AUROC de imagen) mediante el pipeline `image-classification` declarado en Hugging Face.
- Segmentación y localización de defectos a nivel de parche gracias a los mapas `layer2`/`layer3` de PatchCore y a los `patch_tokens` de WinCLIP.
- Modo zero-shot y few-shot: WinCLIP funciona con 0, 1 o 5 fotos correctas, lo que cubre productos nuevos o de baja cadencia.
- Inferencia en CPU: todos los grafos están pensados para ejecutarse sin GPU en el backend de la aplicación.
- Procesamiento por ventanas: el backend puede construir ventanas 2×2 y 3×3 sobre los tokens de parche para análisis multiescala.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y discriminativo.
- Capacidades multilingües: no disponibles; los prompts de texto están en inglés ("normal", "anomalous").

## Casos de uso

- Inspección de defectos en línea de producción con histórico de piezas correctas: se despliega el backbone PatchCore y se construye el banco de memoria con las fotos buenas del producto; cada pieza nueva se puntúa por distancia al vecino más cercano en el espacio de parches, con una AUROC de imagen del 98,4 % en MVTec AD.
- Arranque de referencias nuevas con pocas muestras: para un producto del que solo hay una o cinco fotos correctas, se usa el flujo WinCLIP zero/few-shot, que alcanza 93,0 % y 94,3 % de AUROC de imagen respectivamente, evitando esperar a acumular un dataset amplio.
- Control de calidad en dispositivos sin GPU: al ejecutarse íntegramente en CPU con ONNX Runtime, el paquete es adecuado para PCs industriales, mini-PC o entornos edge donde no hay acelerador dedicado.
- Localización de defectos para retrabajo: los mapas de parche permiten señalar la región defectuosa de la imagen, no solo clasificar la pieza como correcta o incorrecta, lo que facilita la revisión manual posterior.
- Auditoría y trazabilidad de modelos: los hashes SHA-256 publicados para los cuatro ficheros permiten verificar la integridad de los pesos descargados en cada despliegue, algo relevante en entornos regulados.
- Prototipado rápido de un sistema de inspección: los cuadernos de Kaggle y el script `download_models.py` permiten reproducir la evaluación en MVTec AD y validar el pipeline antes de integrarlo en la aplicación Vision QC.
- Detección de anomalías en productos textiles, componentes metálicos o PCB: cualquier categoría con apariencia visual repetible y variabilidad acotada puede beneficiarse del enfoque, siempre que las imágenes de entrada se capturen con condiciones controladas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MVTec AD (15 categorías, backend CPU), en AUROC de imagen:

| Metodo | Fotos correctas | Image AUROC |
|---|---|---|
| PatchCore | Todas las fotos buenas disponibles | 98,4 % |
| WinCLIP | 0 | 88,6 % |
| WinCLIP | 1 | 93,0 % |
| WinCLIP | 5 | 94,3 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparativas numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM: no aplica; el backend está diseñado para ejecutarse en CPU. En caso de usar GPU, los grafos ONNX en float32 requerirían aproximadamente 0,1 GB para el backbone y 0,5 GB para `winclip_encode`, pero no se documenta soporte GPU.
- GPU recomendadas: no disponibles; el paquete no declara requisitos de GPU ni se ha validado en A100, H100 o RTX 4090.
- Cabe en cualquier equipo consumer: el modelo más grande es `winclip_encode.onnx` con 465 MB, por lo que el conjunto completo (unos 0,6 GB) se puede cargar en memoria en portátiles y mini-PC convencionales.
- Opciones de despliegue: ONNX Runtime como backend principal de la aplicación Vision QC; los grafos son estándar y podrían ejecutarse con otros runtimes compatibles con ONNX, aunque no se documentan.
- Latencia y throughput: no disponibles; no se publican medidas de tiempo por imagen ni de imágenes por segundo en la model card.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Rendimiento en MVTec AD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vision QC models (este paquete) | PatchCore + WinCLIP exportados a ONNX | no disponible | no aplica | 98,4 % PatchCore; 88,6–94,3 % WinCLIP | MIT (export) con pesos BSD-3-Clause/MIT | Hugging Face, 0 descargas |
| PatchCore original (Roth et al., CVPR 2022) | Detección de anomalías con banco de memoria | WideResNet-50-2 | no aplica | 99,1 % en el paper original (referencia) | Código de investigación, revisar | Repositorio oficial de los autores |
| WinCLIP original (Jeong et al., CVPR 2023) | Zero/few-shot con CLIP | ViT-B-16-plus-240 | no aplica | Resultados del paper original | Código de investigación, revisar | Repositorio oficial de los autores |
| Otros detectores de anomalías ONNX | Varía (autoencoders, PaDiM, etc.) | Varía | no aplica | no disponible | Varía | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso fuera de inspección visual de imágenes es inadecuado.
- Dependencia de condiciones de captura: PatchCore y WinCLIP asumen imágenes con encuadre, iluminación y escala consistentes; cambios de cámara o de iluminación pueden degradar el AUROC de forma significativa.
- PatchCore requiere almacenar el banco de memoria de parches de todas las imágenes correctas, lo que aumenta el consumo de RAM en producción a medida que crece el histórico del producto.
- WinCLIP con 0 fotos correctas baja al 88,6 % de AUROC de imagen, un margen considerablemente inferior al de PatchCore; para productos críticos conviene acumular al menos 5 muestras.
- Riesgo de falsos positivos y falsos negativos: no se publican curvas de precisión-exhaustividad ni umbrales recomendados; el umbral debe calibrarse por producto.
- Los prompts de texto de WinCLIP están en inglés y limitados a "normal" y "anomalous"; no hay soporte multilingüe documentado.
- Sesgos conocidos: no documentados por el autor; los pesos heredan los sesgos de los datasets de preentrenamiento (ImageNet para WideResNet, LAION-400M para CLIP), que pueden afectar a la representación de ciertos materiales o texturas.
- Restricciones de licencia: el export y la model card son MIT, pero los pesos de torchvision son BSD-3-Clause y los de OpenCLIP MIT; conviene revisar ambas licencias antes de un uso comercial y citar los papers de PatchCore y WinCLIP.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de adopción ni de mantenimiento continuado.
- No se documentan requisitos de GPU, latencia ni throughput, lo que dificulta planificar un despliegue a gran escala sin pruebas propias.

## Enlaces

- [Hugging Face: Fushi21/vision-qc-models](https://huggingface.co/Fushi21/vision-qc-models)
- [Repositorio de la aplicación Vision QC](https://github.com/pdlong4002/vision-qc)
- [torchvision (pesos WideResNet-50-2)](https://github.com/pytorch/vision)
- [OpenCLIP (pesos ViT-B-16-plus-240)](https://github.com/mlfoundations/open_clip)
- Paper PatchCore: Roth et al., *Towards Total Recall in Industrial Anomaly Detection*, CVPR 2022 (no se proporciona URL directa en la información disponible)
- Paper WinCLIP: Jeong et al., *WinCLIP: Zero-/Few-Shot Anomaly Classification and Segmentation*, CVPR 2023 (no se proporciona URL directa en la información disponible)
