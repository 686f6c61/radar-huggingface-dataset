# nidl-neurospin/neuro-simclr-resnet18

## Resumen

Neuro-SimCLR ResNet-18 es un modelo de visión 3D para resonancia magnética cerebral, desarrollado por el grupo NIDL (NeuroImaging and Deep Learning) del centro de investigación NeuroSpin (CEA, Francia). No es un modelo de lenguaje: es un backbone convolucional 3D de 33,5 millones de parámetros preentrenado con el método de aprendizaje autosupervisado SimCLR sobre volúmenes de MRI cerebral, y se distribuye como pesos iniciales para tareas de diagnóstico neurológico.

El modelo resuelve el problema de la escasez de datos etiquetados en neuroimagen: en lugar de depender de grandes cohortes anotadas, aprende representaciones genéricas mediante pares aumentados del mismo volumen y se transfiere después a tareas concretas (clasificación de enfermedades neurológicas, segmentación, detección de anomalías) con ajuste fino sobre pocas muestras.

Es relevante ahora porque forma parte de una línea de trabajo presentada en el workshop CVAMD de ICCV 2025, que propone un modelo fundacional autosupervisado común a varias enfermedades neurológicas en MRI cerebral 3D. Los pesos se publican en safetensors y se integran en la librería `nidl`, lo que facilita su uso reproducible en pipelines de investigación. No hay datos publicados sobre longitud de contexto, idiomas ni cuantizaciones, al no tratarse de un modelo generativo de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 3D (CNN con conexiones residuales, convoluciones volumétricas) |
| Parámetros totales | 33.465.408 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión 3D, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; procesa volúmenes de MRI) |
| Licencia | other (ver repositorio de origen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es una ResNet-18 adaptada a entrada 3D: las convoluciones 2D se sustituyen por convoluciones volumétricas para procesar directamente el volumen de MRI cerebral en lugar de cortes individuales. El preentrenamiento emplea SimCLR, un marco de aprendizaje autosupervisado contrastivo en el que dos vistas aumentadas del mismo volumen se atraen en el espacio latente mientras se repelen las de volúmenes distintos, con una cabeza de proyección sobre el embedding global.

Según la model card, los pesos publicados son los originales del trabajo de Kaczmarek et al. (ICCV 2025 Workshop CVAMD), convertidos a safetensors sin ninguna modificación. El trabajo de origen plantea un modelo fundacional SimCLR entrenado de forma conjunta sobre varias enfermedades neurológicas para obtener representaciones transferibles a diagnósticos de MRI cerebral 3D. No se detallan en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de ajuste supervisado posteriores al preentrenamiento contrastivo.

## Capacidades

- Extracción de representaciones (embeddings) de volúmenes de MRI cerebral 3D.
- Aprendizaje por transferencia: ajuste fino para clasificación de enfermedades neurológicas.
- Base para tareas de segmentación y detección de anomalías con cabezas específicas.
- Preprocesamiento integrado en `nidl` con orientación de entrada configurable (por ejemplo, `RAS`).
- Inferencia sobre volúmenes completos 3D, sin necesidad de dividir en cortes 2D.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni generación de texto.
- No dispone de modo thinking, visión 2D natural, audio ni otras modalidades fuera de MRI 3D.

## Casos de uso

- Clasificación de enfermedades neurológicas: se carga el backbone y se añade una cabeza de clasificación, ajustando con un conjunto etiquetado reducido; el preentrenamiento contrastivo aporta representaciones útiles cuando hay pocas muestras por patología.
- Detección temprana de anomalías estructurales: los embeddings del modelo pueden alimentar clasificadores o detectores de valores atípicos sobre volúmenes de nuevos pacientes.
- Segmentación asistida de estructuras cerebrales: se usa como encoder en una arquitectura tipo U-Net 3D, aprovechando las características multiescala de la ResNet.
- Investigación en modelos fundacionales de neuroimagen: sirve como punto de partida para estudiar la transferibilidad entre cohortes y enfermedades, comparando con otros backbones autosupervisados.
- Preprocesamiento y control de calidad de datos: los embeddings permiten agrupar estudios por similitud y detectar volúmenes corruptos o fuera de distribución antes de entrenar otros modelos.
- Reproducción de resultados académicos: al publicarse los pesos originales sin modificar y con integración en `nidl`, se puede replicar el pipeline del paper de ICCV 2025 de forma directa.
- Búsqueda por similitud en bases de datos de MRI: indexar los embeddings de una cohorte para recuperar casos morfológicamente parecidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 33,5 millones de parámetros (unos 134 MB en fp32, unos 67 MB en fp16); el consumo real lo domina el tamaño del volumen de entrada y el batch, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para volúmenes individuales; A100, H100 o RTX 4090 para entrenamiento y lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070 y superiores), siempre que se ajuste el tamaño de lote al volumen de entrada.
- Opciones de despliegue: la librería `nidl` (instalación con `pip install nidl[pretrained]`); al ser una CNN estándar en safetensors, también puede cargarse con PyTorch directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neuro-SimCLR ResNet-18 | 33,5 M | MRI 3D | SimCLR autosupervisado | other | Hugging Face, librería `nidl` |
| Alternativas de backbone 3D autosupervisado para MRI | no disponible | MRI 3D | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en MRI cerebral 3D; no es aplicable a texto, imagen natural 2D ni otras modalidades.
- No se documentan en la información disponible los sesgos de la cohorte de entrenamiento (demografía, equipos, protocolos de adquisición), un factor crítico en neuroimagen.
- Riesgo de generalización limitada a dominios distintos del de entrenamiento (otras secuencias, intensidades de campo o poblaciones).
- La licencia es «other»: es imprescindible consultar el repositorio de origen (github.com/emilykaczmarek/3D-Neuro-SimCLR) antes de cualquier uso comercial.
- Al ser pesos autosupervisados sin cabeza de tarea, requieren ajuste fino supervisado para producir predicciones clínicas.
- No debe usarse como dispositivo médico ni para decisiones clínicas sin validación regulatoria y estudio prospectivo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es aún inexistente.
- No se especifican requisitos de preprocesamiento más allá de la orientación de entrada; conviene revisar el pipeline de `nidl` para garantizar consistencia con el entrenamiento original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nidl-neurospin/neuro-simclr-resnet18
- Repositorio de la librería nidl: https://github.com/neurospin-deepinsight/nidl
- Trabajo original (código): https://github.com/emilykaczmarek/3D-Neuro-SimCLR
- Paper (arXiv): https://arxiv.org/abs/2509.10620
