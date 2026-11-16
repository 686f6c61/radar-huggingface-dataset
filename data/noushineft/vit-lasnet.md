# Noushineft/ViT-LASNet

## Resumen

ViT-LASNet es una familia de clasificadores de imágenes de plancton marino publicada por Noushineft, derivada del trabajo *Improving in situ real-time classification of long-tail marine plankton images for ecosystem studies*. El modelo aborda un problema específico de la ecología marina: la clasificación automática de imágenes de plancton capturadas in situ por el instrumento Plankton Imager (Pi-10), un dominio donde la distribución de clases es fuertemente long-tail (unas pocas clases como detritus y copépodos dominan el dataset mientras muchas otras son raras).

La propuesta técnica consiste en afinar Vision Transformers preentrenados (ViT-Base/16 y BEiT-Base/16) mediante técnicas de aprendizaje con desbalanceo de clases, concretamente label-aware smoothing dinámico (MiSLAS) y entropía cruzada con ajuste de logits (Bal_CE). El repositorio incluye cinco variantes: dos transformers para 18 clases, una variante de 3 clases y dos baselines ResNet18.

El modelo es relevante para investigadores en oceanografía y monitorización ambiental que necesiten clasificar grandes volúmenes de imágenes de plancton de forma automática, aunque se trata de pesos de investigación no validados para monitorización operativa y entrenados con un único instrumento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base/16), BEiT-Base/16 y ResNet18 (baselines) |
| Parámetros totales | no disponible (ViT-Base/16 y BEiT-Base/16 tienen ~86M; no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224×224 para ViT/BEiT, 256×256 para ResNet) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Vision Transformers preentrenados de Hugging Face: `google/vit-base-patch16-224` para las variantes `vit-mislas` y `vit-balce-3class`, y `microsoft/beit-base-patch16-224-pt22k-ft22k` para `beit-balce`. Sobre estos checkpoints se realiza un fine-tuning de clasificación con 18 clases (o 3 en la variante reducida), aplicando estrategias específicas para el desbalanceo long-tail: dynamic label-aware smoothing (MiSLAS) en `vit-mislas` con learning rate 5e-5 durante 30 épocas, y logit-adjusted cross-entropy (Bal_CE) en `beit-balce` (20 épocas) y `vit-balce-3class` (10 épocas). Los baselines ResNet18 se entrenan con pérdida estándar.

Los datos de entrenamiento son imágenes de plancton Pi-10 recogidas in situ y etiquetadas en las 18 clases del dataset (detritus, diatomeas, dinoflagelados, copépodos, cnidarios, tintínidos, etc.). El dataset no se distribuye con los pesos. No se especifica el número de imágenes ni la composición exacta del conjunto de entrenamiento en la información disponible.

## Capacidades

- Clasificación de imágenes de plancton marino en 18 clases taxonómicas (o 3 clases en la variante reducida: copepod, detritus, noncopepod).
- Clasificación de imágenes en formato TIFF convertidas a RGB.
- Manejo de distribuciones de clases long-tail mediante pérdidas ajustadas (MiSLAS, Bal_CE).
- Inferencia compatible con la librería `transformers` (`ViTForImageClassification`, `BeitForImageClassification`) y con `torchvision` para los baselines ResNet18.
- Integración con el script de línea de comandos `test/test.py` del repositorio de código para procesar directorios de imágenes y volcar predicciones a CSV.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües (es un modelo puramente de visión).

## Casos de uso

- Monitorización ecológica automatizada de muestras de plancton: el modelo clasifica imágenes Pi-10 en 18 clases taxonómicas, permitiendo procesar lotes grandes de imágenes in situ sin revisión manual, adecuado por su entrenamiento específico en este dominio.
- Estudios de biodiversidad marina: la clasificación automática de copépodos, diatomeas y dinoflagelados facilita el análisis de composición de comunidades a lo largo de campañas oceanográficas.
- Detección de proliferaciones de dinoflagelados: las clases `Phyto_dinoflagellate_gonyaulacales_Tripos` y variantes permiten identificar muestras asociadas a eventos de floración algal.
- Seguimiento de detritus y materia orgánica: la clase `Detritus`, dominante en el dataset, permite cuantificar la fracción no viva en muestras de plancton.
- Filtrado y triaje previo a análisis experto: la variante de 3 clases (`copepod`, `detritus`, `noncopepod`) sirve como primer filtro rápido para reducir el volumen de imágenes que requieren inspección taxonómica detallada.
- Investigación en aprendizaje long-tail: los checkpoints sirven como referencia reproducible para comparar MiSLAS frente a Bal_CE en un dominio real con desbalanceo extremo.
- Integración en pipelines de imagen submarina: el modelo puede ejecutarse sobre imágenes capturadas por el instrumento Pi-10 en flujos de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para ViT-Base/16 y BEiT-Base/16 en fp32 se requiere aproximadamente 1-2 GB de VRAM (estimación basada en el tamaño típico de estos modelos, no confirmada en la información).
- GPU recomendadas: no disponible. Cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar la inferencia en fp32 para ViT-Base/16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores (no confirmado en la información).
- Opciones de despliegue: `transformers` con `AutoImageProcessor` y `ViTForImageClassification`/`BeitForImageClassification`; `torchvision` + `safetensors` para ResNet18; script CLI `test/test.py` del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViT-LASNet (`vit-mislas`) | ViT-Base/16 | 18 | 224×224 | no disponible | Hugging Face |
| ViT-LASNet (`beit-balce`) | BEiT-Base/16 | 18 | 224×224 | no disponible | Hugging Face |
| ViT-LASNet (`vit-balce-3class`) | ViT-Base/16 | 3 | 224×224 | no disponible | Hugging Face |
| ResNet18 baseline | ResNet18 | 18 / 3 | 256×256 | no disponible | Hugging Face |

No se dispone de información sobre modelos comparables de terceros para clasificación de plancton en la información proporcionada.

## Limitaciones y advertencias

- Entrenados con imágenes de un único instrumento (Pi-10) y sus condiciones de captura; se espera una precisión menor en otras cámaras o regiones sin fine-tuning.
- Las clases raras tienen pocos ejemplos de entrenamiento, por lo que sus predicciones son menos fiables que las de clases comunes.
- Son modelos de investigación no validados para monitorización operativa.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Riesgo de sesgo hacia las clases dominantes (detritus, copépodos) inherente al dataset long-tail.
- No se especifica el volumen ni la composición del dataset de entrenamiento, lo que dificulta evaluar su representatividad.
- No soportan procesamiento de lenguaje, tool calling ni agentes; su uso está restringido a clasificación de imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/Noushineft/ViT-LASNet
- Paper (Springer): https://link.springer.com/chapter/10.1007/978-3-031-92387-6_8
- Código (GitHub): https://github.com/alan-turing-institute/ViT-LASNet
- Página del proyecto: https://alan-turing-institute.github.io/ViT-LASNet/
