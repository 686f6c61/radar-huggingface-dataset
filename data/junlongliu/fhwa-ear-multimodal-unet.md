# JunlongLiu/fhwa-ear-multimodal-unet

## Resumen

El modelo `JunlongLiu/fhwa-ear-multimodal-unet` es un checkpoint de investigación para segmentación de daños en pavimentos, desarrollado por Junlong Liu en el marco del proyecto FHWA EAR Pavement AI (acuerdo 693JJ32350032). Se trata de una U-Net multimodal que recibe como entrada imágenes en escala de grises 2D alineadas con mapas de profundidad 3D y predice clases de deterioro del firme (grietas, baches, etc.). No es un modelo de lenguaje ni un modelo fundacional: es un segmentador de imágenes especializado y de dominio muy restringido.

El repositorio contiene únicamente el checkpoint `checkpoint.pth` (unos 0,1 GB), con hash SHA-256 verificado en la model card, y apunta al código fuente y a los resultados de evaluación alojados en GitHub. La model card advierte explícitamente de que se trata de un artefacto experimental y de que el autor no asigna una puntuación de informe a este fichero concreto sin una coincidencia de evaluación verificada.

Su relevancia es acotada: sirve como referencia reproducible para investigadores que trabajen en inspección automatizada de carreteras con datos multimodales (2D + 3D), pero no está pensado para uso general ni para producción sin una validación previa del preprocesado y del orden de clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net multimodal (2D grayscale + 3D depth) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint.pth`) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net multimodal que fusiona dos modalidades de entrada: imágenes 2D en escala de grises y mapas de profundidad 3D alineados. El objetivo es la segmentación semántica de clases de deterioro del pavimento. La model card no detalla el número de parámetros, la profundidad del encoder/decoder, el mecanismo exacto de fusión multimodal ni la función de pérdida empleada.

No se especifica el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino supervisado más allá del entrenamiento base. El proyecto se enmarca en el acuerdo FHWA EAR 693JJ32350032, y la documentación de resultados y condiciones de evaluación se remite al repositorio de GitHub, no a la model card. El autor insiste en que el preprocesado y el orden de clases deben verificarse contra el código fuente antes de la inferencia.

## Capacidades

- Segmentación de imágenes de pavimento en clases de deterioro a partir de entradas multimodales alineadas (2D grayscale + 3D depth).
- Predicción densa por píxel (segmentación semántica), no generación de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- Sin capacidades multilingües (no es un modelo de lenguaje).
- Sin modo thinking, visión general, audio ni otras capacidades especiales más allá de la segmentación de dominio específico.

## Casos de uso

- Inspección automatizada de firmes: el modelo puede procesar pares de imagen 2D y mapa de profundidad capturados por sistemas de auscultación para generar máscaras de daños (grietas, baches) y priorizar el mantenimiento de tramos.
- Investigación en visión multimodal: sirve como baseline reproducible para comparar estrategias de fusión 2D+3D en segmentación de superficies, dado que el checkpoint y el hash están publicados.
- Anotación asistida de datasets: las máscaras predichas pueden usarse como preanotación para que revisores humanos corrijan y aceleren el etiquetado de nuevas imágenes de pavimento.
- Control de calidad en obra: integrado en un pipeline de captura (cámara + sensor de profundidad), permite detectar daños en tiempo casi real durante la recepción de un tramo.
- Docencia y reproducción: al estar vinculado a un repositorio público con código y resultados, es útil para reproducir experimentos de segmentación con entradas multimodales.
- Evaluación comparativa de arquitecturas U-Net: como checkpoint de referencia para medir el impacto de añadir profundidad 3D frente a un U-Net puramente 2D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados y las condiciones de evaluación están en el repositorio de GitHub del proyecto, pero no se incluyen cifras (IoU, mIoU, F1 por clase) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint ocupa 0,1 GB, por lo que un U-Net de este tamaño es probable que quepa en GPUs de consumo, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del checkpoint, pero no confirmado por el autor.
- Opciones de despliegue: PyTorch nativo (carga de `checkpoint.pth`); no se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JunlongLiu/fhwa-ear-multimodal-unet` | Segmentación de daños en pavimento (2D+3D) | no disponible | no aplica | no disponible | Hugging Face + GitHub |
| U-Net clásico (Ronneberger et al.) | Segmentación de imágenes biomédicas | ~31 M (configuración original) | no aplica | código público | Amplia |
| Segment Anything (SAM) | Segmentación general de imágenes | ~636 M (ViT-H) | no aplica | Apache 2.0 (versión original) | Amplia |
| Modelos de segmentación de pavimento publicados en literatura | Segmentación de grietas | variable | no aplica | variable | Variable |

La comparación es cualitativa: no hay datos de rendimiento del checkpoint FHWA EAR que permitan una comparación numérica con alternativas.

## Limitaciones y advertencias

- Artefacto experimental: el autor advierte explícitamente de que es un checkpoint de investigación y no asigna una puntuación de informe sin una evaluación verificada.
- Verificación obligatoria del preprocesado y del orden de clases contra el código fuente antes de cualquier inferencia; un desajuste produce máscaras incorrectas sin aviso.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor o al proyecto FHWA.
- Dominio muy restringido: solo pavimentos con entradas 2D+3D alineadas; no generaliza a otras tareas de visión.
- Riesgo de sesgo por el dataset de captura (tipo de sensor, iluminación, geografía), no documentado en la model card.
- Riesgo de falsos negativos en daños poco representados en el entrenamiento; no hay métricas por clase publicadas en la información disponible.
- Sin garantías de mantenimiento ni soporte; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/JunlongLiu/fhwa-ear-multimodal-unet
- Código fuente y notas de uso: https://github.com/JunlongCode/FHWA-EAR-Pavement-AI/tree/main/source-code/01-distress-segmentation
- Resultados y condiciones de evaluación: https://github.com/JunlongCode/FHWA-EAR-Pavement-AI/tree/main/results
