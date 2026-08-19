# AIOmarRehan/medtrace-brats-segresnet

## Resumen

MEDTRACE brain tumour segmentation (SegResNet) es un modelo de segmentación semántica 3D para imágenes de resonancia magnética (MRI) cerebral, desarrollado por AIOmarRehan como parte del proyecto MEDTRACE, una plataforma de seguimiento longitudinal de la evolución de tumores cerebrales. El modelo segmenta tres compartimentos tumorales —núcleo tumoral (TC), tumor completo (WT) y tumor realzante (ET)— a partir de cuatro secuencias MRI co-registradas (T1 con contraste, T1 nativa, T2-FLAIR y T2). Está entrenado sobre el conjunto de datos BraTS 2023 GLI (glioma) y publicado bajo licencia Apache-2.0.

El modelo se basa en la arquitectura SegResNet implementada en MONAI, con 18,8 millones de parámetros y una ventana de entrada de 128×128×128 vóxeles. Su relevancia radica en que ofrece un rendimiento sólido en segmentación de glioma preoperatorio (Dice medio de 0,922 para tumor completo en un split de test independiente) y se distribuye con pesos en formato TorchScript, lo que permite su ejecución sin dependencias de MONAI. Es un prototipo de investigación, no un dispositivo médico, y el propio autor advierte explícitamente de que no debe usarse para diagnóstico ni decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegResNet (MONAI `monai.networks.nets.SegResNet`) |
| Parametros totales | 18,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, patch de 128×128×128 vóxeles) |
| Tipos de cuantizacion | no disponible (pesos en float32; se usó AMP float16 en entrenamiento) |
| Idiomas soportados | no disponible (modelo de segmentacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`medtrace_seg_best.pt`) y TorchScript (`medtrace_seg.torchscript.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SegResNet, una red neuronal convolucional 3D de tipo encoder-decoder con conexiones residuales, diseñada para segmentación volumétrica. La configuración concreta es: `init_filters=32`, `blocks_down=[1,2,2,4]`, `blocks_up=[1,1,1]` y `dropout_prob=0.2`. Tiene 4 canales de entrada (las cuatro secuencias MRI) y 3 canales de salida con activación sigmoide independiente, lo que permite que las regiones segmentadas se solapen (TC, WT y ET no son mutuamente excluyentes).

El entrenamiento se realizó sobre el split de entrenamiento de BraTS 2023 GLI, el único con etiquetas. Se usó DiceFocalLoss como función de pérdida, optimizador AdamW con tasa de aprendizaje 2e-4, programación de cosine annealing y entrenamiento con precisión mixta (AMP float16) en una GPU Tesla T4. Se completaron 37 de las 60 épocas planificadas; la época 32 se seleccionó por mayor Dice medio en validación. El muestreo de parches fue 80% centrado en el tumor completo y 20% uniforme. Como aumentos se aplicaron volteos aleatorios de ejes y variaciones de intensidad (escala y desplazamiento dentro del 10%). La semilla aleatoria fue 20260813. El entorno de entrenamiento fue MONAI 1.6.0 y PyTorch 2.10.0+cu128.

## Capacidades

- Segmentación 3D de tres compartimentos tumorales cerebrales: núcleo tumoral (TC), tumor completo (WT) y tumor realzante (ET), con salidas solapadas mediante sigmoide independiente.
- Inferencia con ventana deslizante (sliding window) de tamaño 128×128×128, solapamiento 0.5 y mezcla gaussiana.
- Conversión a etiquetas enteras BraTS (WT=2, TC=1, ET=3) con orden de escritura específico para producir el anidamiento correcto.
- Supresión de regiones de tumor realzante por debajo de 200 vóxeles para reducir falsos positivos.
- Exportación a TorchScript, lo que permite ejecutar el modelo sin dependencias de MONAI en entornos de producción.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; es exclusivamente un modelo de segmentación de imágenes médicas.

## Casos de uso

- Investigación en neurooncología: el modelo puede segmentar automáticamente gliomas preoperatorios en estudios retrospectivos, facilitando la extracción de biomarcadores volumétricos y radiomímicos a partir de MRI multi-secuencia.
- Plataformas de seguimiento longitudinal: integrado en el sistema MEDTRACE, permite comparar segmentaciones entre estudios seriados para detectar cambios en el volumen tumoral a lo largo del tiempo, siempre que los estudios sean preoperatorios y cumplan el preprocesado BraTS.
- Preprocesado de datos para pipelines de análisis: al generar máscaras de TC, WT y ET, puede servir como paso previo para registro de imágenes, extracción de características o entrenamiento de otros modelos.
- Evaluación de algoritmos de segmentación: al estar disponible en TorchScript y con una card de modelo detallada, puede usarse como baseline reproducible en comparativas de segmentación de glioma.
- Docencia e investigación formativa: su tamaño reducido (72 MB) y su licencia Apache-2.0 lo hacen adecuado para cursos de deep learning aplicado a imagen médica, donde los estudiantes pueden ejecutarlo en GPUs de gama media.
- Desarrollo de herramientas de apoyo a la lectura de imágenes: aunque no es un dispositivo médico, puede integrarse en entornos de investigación para generar segmentaciones preliminares que un radiólogo podría revisar, siempre bajo supervisión experta y con las advertencias legales correspondientes.

## Benchmarks y rendimiento

El autor reporta resultados sobre un split de test retenido de 186 casos de 169 sujetos, separados por sujeto para evitar fuga de datos. Las métricas se calcularon siguiendo la convención BraTS: con ground truth vacío, Dice es 1 si la predicción también es vacía y 0 en caso contrario.

| Region | Dice medio | Dice mediana | HD95 mediana (mm) | Sensibilidad | Precision |
|---|---|---|---|---|---|
| Nucleo tumoral (TC) | 0.908 | 0.956 | 2.00 | 0.917 | 0.917 |
| Tumor completo (WT) | 0.922 | 0.949 | 2.45 | 0.925 | 0.924 |
| Tumor realzante (ET) | 0.852 | 0.898 | 1.41 | 0.883 | 0.849 |

El autor advierte que los umbrales de post-procesado y la selección de época se ajustaron sobre validación, por lo que las cifras de test son las fiables. No se han publicado comparativas con otros modelos (p. ej., nnUNet o SwinUNETR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 18,8 millones de parámetros y pesos de 72 MB, por lo que la inferencia con un patch de 128³ cabe en GPUs con 4 GB de VRAM o menos, dependiendo del tamaño de lote y del uso de precisión mixta.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, desde una NVIDIA T4 (usada en entrenamiento) hasta una RTX 3060 o superior. En CPU es posible ejecutar el modelo TorchScript, aunque con latencia mayor.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 4090, etc. El entrenamiento se realizó en una Tesla T4, que es una GPU de gama media en centros de datos.
- Opciones de despliegue: el formato TorchScript permite integración directa con PyTorch en producción. También puede usarse con MONAI para inferencia con ventana deslizante. No se mencionan integraciones con vLLM, Ollama o TGI, que son específicas de modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño del modelo y el uso de ventana deslizante con solapamiento 0.5, se espera una inferencia de varios segundos por volumen completo en GPU de gama media, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada por el autor contra otros modelos de segmentación de glioma. En la literatura y en repositorios públicos existen alternativas como nnUNet y SwinUNETR, también entrenados sobre BraTS, pero no se han encontrado resultados comparables en la información proporcionada. La siguiente tabla resume lo que se conoce de forma general, sin cifras de rendimiento verificadas:

| Modelo | Arquitectura | Parametros | Contexto / patch | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MEDTRACE SegResNet | SegResNet (CNN 3D) | 18,8 M | 128³ | Apache-2.0 | Hugging Face, TorchScript |
| nnUNet (BraTS 2023) | U-Net 3D adaptativo | no disponible | no disponible | Apache-2.0 (aprox.) | GitHub, MONAI Model Zoo |
| SwinUNETR (BraTS 2023) | Transformer + U-Net | no disponible | no disponible | no disponible | MONAI Model Zoo |

No se puede establecer una comparativa cuantitativa fiable sin datos de benchmarks comunes. Se recomienda consultar el MONAI Model Zoo para alternativas preentrenadas.

## Limitaciones y advertencias

- Prototipo de investigación, no un dispositivo médico. No está clínicamente validado y no debe usarse para diagnóstico, planificación de tratamiento ni ninguna decisión clínica.
- Entrenado exclusivamente sobre glioma adulto preoperatorio. No representa apariencias post-tratamiento, como cavidades de resección o cambios por radiación.
- Requiere las cuatro secuencias MRI (t1c, t1n, t2f, t2w). El comportamiento con una secuencia ausente no está probado.
- Asume preprocesado BraTS: skull-stripping, co-registro y espaciado isotrópico de 1 mm. Desviaciones de este preprocesado degradarán el rendimiento.
- El orden de los canales de entrada no es recuperable desde los pesos; un orden incorrecto produce salidas erróneas sin aviso.
- La concordancia con un único protocolo de anotación en un único dataset no es una medida de precisión clínica.
- Los datos de BraTS no se redistribuyen en este repositorio; el usuario debe cumplir el acuerdo de uso de datos de BraTS y citar las publicaciones correspondientes.
- Riesgo de alucinación: como todo modelo de segmentación, puede producir falsos positivos o negativos, especialmente en regiones ambiguas o con artefactos de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIOmarRehan/medtrace-brats-segresnet
- Space de MEDTRACE: https://huggingface.co/spaces/AIOmarRehan/medtrace
- Dataset derivado RHUH-GBM: https://huggingface.co/datasets/AIOmarRehan/medtrace-rhuh-gbm-derived
- Repositorio de código: https://github.com/AIOmarRehan/medtrace
- Perfil del autor en Hugging Face: https://huggingface.co/AIOmarRehan
- MONAI Model Zoo: https://project-monai.github.io/model-zoo.html
- Paper de referencia de BraTS 2021: https://doi.org/10.48550/arXiv.2107.02314
- Paper original de BraTS (Menze et al., 2015): https://doi.org/10.1109/TMI.2014.2377694
- Paper de TCGA glioma (Bakas et al., 2017): https://doi.org/10.1038/sdata.2017.117
