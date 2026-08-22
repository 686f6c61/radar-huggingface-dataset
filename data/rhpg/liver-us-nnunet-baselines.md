# rhpg/liver-us-nnunet-baselines

## Resumen

El modelo `rhpg/liver-us-nnunet-baselines` es un conjunto de modelos de segmentación semántica basados en la arquitectura nnU-Net, desarrollados por Robert Price (usuario `rhpg` en Hugging Face y GitHub) para la segmentación automática de hígado y masas hepáticas en imágenes de ultrasonido. El repositorio aloja los pesos entrenados de los "baselines" (líneas base) que se utilizan como referencia en el estudio del autor sobre eficiencia de datos y rendimiento en la segmentación hepática por ecografía.

El modelo resuelve un problema clínico relevante: la delineación precisa del hígado y de las lesiones (masas) en ultrasonido, una tarea difícil por el ruido inherente de la imagen ecográfica y la variabilidad anatómica. Según los resultados publicados en el repositorio de GitHub, el modelo alcanza un Dice de 0.901 para la segmentación del hígado y de 0.648 para la segmentación de masas cuando se entrena con las 625 imágenes completas del conjunto de datos. El estudio muestra que la detección del contorno hepático es eficiente en términos de datos (logra 0.886 Dice con solo 200 imágenes), mientras que la detección de masas sigue siendo una tarea que requiere más datos y no muestra una meseta de rendimiento en los tamaños evaluados.

El modelo está publicado bajo licencia Apache-2.0, lo que permite su uso comercial y modificación. El repositorio de Hugging Face tiene un tamaño de 2.6 GB, pero no se especifican detalles sobre el número exacto de parámetros, la arquitectura interna concreta (aunque se sabe que es nnU-Net) ni los datos de entrenamiento en la model card. La información disponible es limitada, pero el modelo es relevante para la comunidad de imagen médica por su enfoque en un dominio específico y su carácter de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net (U-Net 2D o 3D, no se especifica la variante exacta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión por computadora, no procesa texto) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones; probablemente pesos completos en formato de PyTorch) |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente archivos .pth o .pt de PyTorch, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura se basa en nnU-Net, un marco de trabajo de segmentación médica que adapta automáticamente la arquitectura de U-Net al conjunto de datos de entrada. nnU-Net es un sistema de segmentación semántica que configura automáticamente el preprocesamiento, la arquitectura de la red, el entrenamiento y la inferencia para cada nuevo dataset. Aunque no se especifican los detalles concretos de la configuración (número de capas, filtros, etc.), se sabe que el modelo fue entrenado para segmentar dos clases: hígado y masas (lesiones) en imágenes de ultrasonido. El repositorio de GitHub indica que se usaron 625 imágenes de entrenamiento a escala completa y que se evaluó la eficiencia de datos con subconjuntos de 200, 400 y 625 imágenes. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de visión y no de lenguaje. Tampoco se indica la composición exacta del dataset ni el número total de épocas o pasos de entrenamiento.

## Capacidades

- Segmentación semántica de hígado en imágenes de ultrasonido, con un Dice de 0.901 a escala completa (625 imágenes de entrenamiento).
- Segmentación de masas hepáticas (lesiones) en las mismas imágenes, con un Dice de 0.648 a escala completa.
- Detección del límite hepático de forma eficiente en términos de datos: alcanza un Dice de 0.886 con solo 200 imágenes de entrenamiento.
- Capacidad de generalización a distintos tamaños de conjunto de datos (200, 400, 625 imágenes) según los experimentos reportados.
- No se ha reportado soporte para otras modalidades (CT, MRI) ni para tareas de clasificación o detección de objetos.
- No se menciona soporte para tool calling ni agentes, al ser un modelo de visión puro.

## Casos de uso

- Planificación quirúrgica hepática: el modelo puede delinear automáticamente el hígado y las lesiones en ultrasonidos preoperatorios, ayudando a los cirujanos a evaluar la extensión de la enfermedad y planificar resecciones.
- Seguimiento de lesiones hepáticas en pacientes con enfermedad hepática crónica: la segmentación automática permite medir cambios en el tamaño y número de masas a lo largo del tiempo.
- Evaluación de la eficacia de tratamientos oncológicos: al cuantificar el volumen tumoral mediante la segmentación, se puede monitorizar la respuesta a terapias como la quimioembolización o la ablación.
- Investigación clínica en radiología: el modelo sirve como herramienta de anotación automática para estudios que requieren segmentaciones de hígado y masas en grandes cohortes de ultrasonidos.
- Entrenamiento de modelos de diagnóstico asistido: puede integrarse como componente de un sistema más amplio que combine la segmentación con clasificación de patologías.
- Evaluación de la eficiencia de datos en aprendizaje profundo para imagen médica: el modelo se presenta como baseline para estudiar cómo la cantidad de datos de entrenamiento afecta al rendimiento de la segmentación, útil para investigadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información proporcionada. Sin embargo, el repositorio de GitHub reporta los siguientes valores de Dice (coeficiente de similitud de Dice) para la segmentación:

| Conjunto de entrenamiento | Dice hígado | Dice masas |
|---|---|---|
| 200 imágenes | 0.886 | no disponible |
| 625 imágenes (escala completa) | 0.901 | 0.648 |

No se comparan con otros modelos en los datos disponibles. Se trata de resultados de validación interna del autor.

## Requisitos de hardware

No se han publicado requisitos específicos de hardware para este modelo. Dado que es un modelo nnU-Net típico de segmentación 2D o 3D, se puede estimar:

- VRAM: para una imagen de ultrasonido típica (p.ej. 512x512 píxeles), un modelo nnU-Net 2D con parámetros estándar puede requerir entre 4 y 8 GB de VRAM en inferencia, dependiendo de la profundidad y los filtros.
- GPU recomendadas: se puede ejecutar en GPUs de consumo como NVIDIA RTX 3080/3090 o superiores, así como en GPUs de datacenter como A100.
- Si cabe en consumer GPU: sí, para imágenes de 2D es probable que quepa en una RTX 2080 Ti o superior.
- Opciones de despliegue: dado que es un modelo de PyTorch, se puede servir con frameworks como TorchServe, ONNX Runtime o directamente con el script de inferencia de nnU-Net. No se menciona soporte para vLLM, Ollama o llama.cpp, que son para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (segmentación hepática en ultrasonido) dentro del contexto de este ficha. No hay alternativas documentadas en los datos proporcionados. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para imágenes de ultrasonido del hígado, por lo que su rendimiento en otros tipos de imagen (TC, RM) o en otras regiones anatómicas no está garantizado.
- La segmentación de masas tiene un Dice de 0.648 a escala completa, lo que indica que la detección de lesiones es considerablemente menos precisa que la del hígado. Esto puede llevar a falsos negativos o positivos en aplicaciones clínicas.
- El modelo no se ha validado en entornos clínicos prospectivos; es una herramienta de investigación y no debe usarse como diagnóstico sin supervisión médica.
- La eficiencia de datos del modelo para la detección de masas es baja: no muestra una mejora clara al aumentar los datos de entrenamiento, lo que sugiere que la tarea es intrínsecamente difícil.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de exactitud clínica.
- No se ha publicado información sobre sesgos o alucinaciones (no aplica a modelos de visión de la misma manera que a modelos de lenguaje).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rhpg/liver-us-nnunet-baselines
- Repositorio GitHub: https://github.com/roprice/liver-us-nnunet-baselines
- README del repositorio GitHub: https://github.com/roprice/liver-us-nnunet-baselines/blob/main/README.md
- (No se encontraron otros enlaces relevantes en la búsqueda web)</think>## Resumen

El modelo `rhpg/liver-us-nnunet-baselines` es un conjunto de modelos de segmentación semántica basados en la arquitectura nnU-Net, desarrollados por Robert Price (usuario `rhpg`) para la segmentación automática del hígado y de masas hepáticas en imágenes de ultrasonido. El repositorio en Hugging Face contiene los pesos de los modelos de referencia ("baselines") que se emplean en el estudio de eficiencia de datos y rendimiento en esta tarea clínica.

El modelo resuelve el problema de la delineación precisa de estructuras hepáticas en ecografía, una tarea difícil por el ruido inherente de la imagen y la variabilidad anatómica. Según los datos publicados en el repositorio de GitHub del autor, con el conjunto de entrenamiento completo (625 imágenes) el modelo alcanza un Dice de 0.901 en la segmentación del hígado y de 0.648 en la segmentación de masas. La detección del contorno hepático es eficiente en términos de datos (Dice de 0.886 con solo 200 imágenes), mientras que la detección de masas no muestra una curva de mejora clara con el aumento de datos, lo que confirma que es el reto más difícil y clínicamente relevante.

El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial y modificaciones. El repositorio de Hugging Face tiene un tamaño de 2.6 GB. La model card es mínima y no proporciona detalles sobre arquitectura interna, parámetros exactos ni composición del dataset de entrenamiento. Esta ficha se basa en la información disponible en Hugging Face y en los resultados de la búsqueda web.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nnU-Net (U-Net 2D o 3D, no se especifica la variante concreta) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no procesa texto) |
| Tipos de cuantización | no disponible (probablemente pesos completos en formato PyTorch, sin cuantización) |
| Idiomas soportados | no aplicable |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente archivos `.pth` o `.pt` de PyTorch, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura se basa en nnU-Net, un marco de segmentación médica que configura automáticamente el preprocesamiento, la arquitectura de la red y el entrenamiento para cada dataset. Aunque no se especifican los detalles concretos (número de capas, filtros, profundidad), el modelo está entrenado para segmentar dos clases: hígado y masas (lesiones) en imágenes de ultrasonido. El repositorio de GitHub indica que se utilizaron 625 imágenes de entrenamiento a escala completa y se evaluó la eficiencia de datos con subconjuntos de 200, 400 y 625 imágenes.

No se menciona el uso de técnicas de aprendizaje por refuerzo (RLHF, DPO) ni otras innovaciones metodológicas. El entrenamiento es de tipo supervisado clásico para segmentación. No hay información pública sobre el número total de tokens (imágenes) ni sobre el proceso de optimización de hiperparámetros. La falta de detalle en la model card es una limitación para evaluar la reproducibilidad.

## Capacidades

- Segmentación semántica del hígado en imágenes de ultrasonido, con Dice de 0.901 a escala completa (625 imágenes de entrenamiento).
- Segmentación de masas hepáticas (lesiones) en las mismas imágenes, con Dice de 0.648 a escala completa.
- Detección eficiente del límite hepático: alcanza Dice de 0.886 con solo 200 imágenes de entrenamiento, lo que sugiere que la tarea de contorno hepático es relativamente fácil de aprender.
- Capacidad de inferencia en imágenes de tamaño variable gracias a la adaptación automática de nnU-Net (aunque no se especifica el tamaño de entrada).
- No se han reportado capacidades de tool calling, agentes ni procesamiento de texto, ya que es un modelo de visión puro.

## Casos de uso

- **Planificación quirúrgica hepática**: el modelo puede delinear automáticamente el hígado y las masas en ecografías preoperatorias, facilitando la evaluación de la extensión tumoral y la planificación de resecciones.
- **Monitorización de pacientes con enfermedad hepática crónica**: permite cuantificar el volumen del hígado y de las lesiones a lo largo del tiempo, útil para seguir la progresión de la enfermedad.
- **Evaluación de respuesta a tratamientos**: en pacientes con tumores hepáticos sometidos a terapias como quimioembolización o radiofrecuencia, el modelo puede medir cambios en el volumen de la masa para valorar la eficacia del tratamiento.
- **Investigación clínica en radiología**: el modelo sirve como herramienta de anotación automática en estudios retrospectivos de grandes cohortes de ultrasonidos hepáticos, reduciendo el trabajo manual.
- **Entrenamiento de modelos de diagnóstico**: puede integrarse en un pipeline de análisis de imagen que combine la segmentación con clasificación de patologías hepáticas.
- **Investigación en eficiencia de datos**: el modelo se ha utilizado como baseline para estudiar cómo la cantidad de datos de entrenamiento afecta al rendimiento de la segmentación, un tema relevante para el desarrollo de modelos con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. Sin embargo, el repositorio de GitHub reporta los siguientes valores de Dice (coeficiente de similitud de Dice) para la segmentación en el conjunto de validación:

| Imágenes de entrenamiento | Dice hígado | Dice masas |
|---|---|---|
| 200 | 0.886 | no disponible |
| 625 (escala completa) | 0.901 | 0.648 |

Estos valores son internos del estudio y no se comparan con otros modelos en la información proporcionada.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación. Dado que se trata de un modelo nnU-Net típico para segmentación de imágenes 2D o 3D, se puede estimar:

- **VRAM**: para una imagen de 512x512 píxeles, un nnU-Net 2D con parámetros estándar puede requerir entre 4 y 8 GB de VRAM en inferencia. Para volúmenes 3D, el requisito puede aumentar significativamente (8-16 GB).
- **GPU recomendadas**: una NVIDIA RTX 3080/3090 o RTX 4090 sería suficiente para inferencia en 2D. Para 3D o entrenamiento, se recomienda una A100 o H100.
- **GPU de consumo**: sí, cabe en una RTX 3090 Ti o superior para inferencia en 2D.
- **Opciones de despliegue**: al ser un modelo de PyTorch, se puede servir con TorchServe, ONNX Runtime o mediante los scripts de predicción de nnU-Net. No se menciona soporte para vLLM, Ollama o llama.cpp (herramientas orientadas a modelos de lenguaje).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en el mismo dominio (segmentación hepática en ultrasonido) dentro de los datos proporcionados. No hay alternativas documentadas en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para imágenes de ultrasonido del hígado; su rendimiento en otras modalidades de imagen (TC, RM) o en otros órganos no está garantizado.
- La segmentación de masas tiene un Dice de 0.648, lo que indica una precisión moderada y un riesgo notable de falsos positivos o negativos en la detección de lesiones. No debe utilizarse como herramienta de diagnóstico definitivo sin supervisión clínica.
- No se ha validado en entornos clínicos prospectivos; es un modelo de investigación y no una herramienta clínica certificada.
- La eficiencia de datos para la detección de masas es limitada: el rendimiento no mejora sustancialmente al aumentar el número de imágenes de entrenamiento de 200 a 625, lo que sugiere que la tarea es intrínsecamente compleja y que el modelo podría necesitar más datos o un enfoque diferente.
- No se han publicado análisis de sesgos (por ejemplo, en función de la etnia, la edad o la calidad de la imagen). La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de precisión clínica.

## Enlaces

- Repositorio Hugging Face: [https://huggingface.co/rhpg/liver-us-nnunet-baselines](https://huggingface.co/rhpg/liver-us-nnunet-baselines)
- Repositorio GitHub: [https://github.com/roprice/liver-us-nnunet-baselines](https://github.com/roprice/liver-us-nnunet-baselines)
- README del repositorio GitHub: [https://github.com/roprice/liver-us-nnunet-baselines/blob/main/README.md](https://github.com/roprice/liver-us-nnunet-baselines/blob/main/README.md)

No se encontraron otros enlaces relevantes en la búsqueda web.
