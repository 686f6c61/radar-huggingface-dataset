# aee4/G17-BUS-Segmentation

## Resumen

G17-BUS-Segmentation es un modelo de segmentación semántica de lesiones en ecografía mamaria (breast ultrasound, BUS) publicado por el usuario aee4 en Hugging Face. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador basado en la librería `segmentation-models-pytorch`, concretamente en una arquitectura U-Net++ con encoder ResNet-34 preentrenado en ImageNet y entrada de un solo canal (escala de grises). El repositorio contiene dos variantes finales, cada una formada por un ensemble de tres miembros.

El modelo resuelve la tarea de delimitar la región de una lesión en imágenes de ecografía mamaria, un problema clásico de imagen médica donde la relación señal-ruido es baja y la apariencia depende fuertemente del escáner. El autor reporta un Dice interno de 89,06 sobre 266 exploraciones reservadas para la variante de despliegue, y de 89,36 para la variante de paper, que además obtiene 79,66 en evaluación zero-shot sobre el conjunto BrEaST.

Es relevante como referencia reproducible de un pipeline completo de segmentación médica: pérdida Focal Tversky, aumento de datos orientado a la apariencia del escáner, inferencia con test-time augmentation (espejo horizontal) y agregación por ensemble. El modelo está marcado explícitamente como de uso exclusivamente investigador y no es un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net++ con encoder ResNet-34 preentrenado en ImageNet, entrada de 1 canal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 256x256 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,6 GB, librería `segmentation-models-pytorch`) |

## Arquitectura y entrenamiento

La arquitectura es U-Net++, una variante de U-Net con conexiones densas entre nodos del decoder y del encoder, lo que mejora la propagación de características de distinta escala. El encoder es un ResNet-34 con pesos iniciales de ImageNet adaptado a un único canal de entrada. Cada variante final es un ensemble de tres miembros entrenados de forma independiente; en inferencia, cada miembro promedia la predicción de la imagen original y su espejo horizontal (test-time augmentation), y el ensemble promedia las probabilidades de los tres miembros antes de aplicar un umbral de 0,5.

El entrenamiento usa pérdida Focal Tversky con parámetros a=0,5, b=0,5 y gamma=1,33, pensada para mitigar el desequilibrio entre píxeles de lesión y fondo, y un aumento de datos específico de "apariencia de escáner" para mejorar la robustez frente a distintos equipos. Se entrenaron 100 épocas. La variante `final/` se entrenó sobre train + val + todo BrEaST (2875 exploraciones) usando el checkpoint de la última época; la variante `r5_paper/` se entrenó solo sobre train (2102 exploraciones) y usa el mejor checkpoint por validación. El preprocesado es escala de grises, redimensionado a 256x256 con interpolación INTER_AREA y normalización `(x/255-0,5)/0,5`. No se documenta el uso de RLHF, DPO ni técnicas de decodificación, por no tratarse de un modelo generativo.

## Capacidades

- Segmentación binaria de lesiones en imágenes de ecografía mamaria en escala de grises.
- Salida de máscara de probabilidad por píxel con umbral configurable (0,5 por defecto).
- Ensemble de tres miembros con test-time augmentation por espejo horizontal.
- Regla de revisión calibrada (`review_rule`) incluida en `final/config.json`, usada por la aplicación para marcar casos dudosos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio; es un modelo puramente visual y de una única modalidad.
- No se documenta soporte de otras modalidades de imagen médica (RM, TC) ni de otros órganos.

## Casos de uso

- Investigación en segmentación de lesiones mamarias: el modelo sirve como línea base reproducible para comparar nuevas pérdidas, encoders o estrategias de aumento de datos sobre ecografía mamaria, con métricas Dice reportadas sobre conjuntos internos y BrEaST.
- Preprocesado en pipelines de análisis de imagen médica: generar máscaras de lesión que alimenten etapas posteriores (extracción de características morfológicas, cálculo de área, contorno o textura) en estudios retrospectivos.
- Evaluación de robustez entre escáneres: gracias al aumento de apariencia de escáner, puede emplearse para estudiar la degradación de la segmentación al cambiar de equipo o de protocolo de adquisición.
- Demostración docente de ensembles en imagen médica: el repositorio documenta dos variantes (despliegue frente a paper) y permite ilustrar el compromiso entre incluir datos de test en entrenamiento y mantener una evaluación honesta.
- Integración en una aplicación Streamlit de revisión: el autor menciona una aplicación G17 Streamlit que consume el modelo y la regla de revisión calibrada, útil como ejemplo de despliegue de un segmentador médico con marcado de casos dudosos.
- Estudio de generalización zero-shot: la variante `r5_paper/` permite analizar el rendimiento sobre un conjunto externo (BrEaST) sin haber visto sus datos, con un Dice de 79,66 reportado.
- Prototipado de asistentes de anotación: usar las máscaras predichas como propuesta inicial que un experto corrige, reduciendo el tiempo de etiquetado en la creación de nuevos conjuntos de datos.

## Benchmarks y rendimiento

| Variante | Entrenamiento | Dice test interno (266 exploraciones) | Dice BrEaST |
|---|---|---|---|
| `final/` | train + val + todo BrEaST (2875), última época | 89,06 | incluido en entrenamiento |
| `r5_paper/` | train (2102), mejor checkpoint de validación | 89,36 | 79,66 zero-shot |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, comparativas con otros segmentadores) ni métricas adicionales como IoU, sensibilidad o especificidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del encoder ResNet-34 y la entrada de 256x256, la inferencia de un miembro cabe holgadamente en GPUs de consumo, pero el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible. Cualquier GPU con suficiente memoria para ResNet-34 a 256x256 debería bastar; no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido del modelo y del repo (0,6 GB), aunque no se documenta una cifra de VRAM.
- Opciones de despliegue: la librería declarada es `segmentation-models-pytorch`; el autor menciona una aplicación Streamlit. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación de ecografía mamaria ni con arquitecturas alternativas (U-Net clásica, TransUNet, SAM adaptado, etc.).

## Limitaciones y advertencias

- Uso exclusivamente investigador: el autor indica explícitamente que no es un dispositivo médico y no debe usarse para diagnóstico clínico.
- La variante `final/` incluye en entrenamiento todo el conjunto BrEaST, por lo que su Dice interno no es una medida de generalización a datos externos; para evaluación honesta debe usarse `r5_paper/`.
- El rendimiento zero-shot sobre BrEaST (79,66) es notablemente inferior al interno (89,36), lo que sugiere sensibilidad al dominio y al escáner.
- Modelo entrenado solo con ecografía mamaria en escala de grises a 256x256; no se garantiza su comportamiento en otras modalidades, órganos o resoluciones.
- Riesgo de falsos negativos y positivos en lesiones de bajo contraste o bordes difusos; no se documentan métricas de sensibilidad ni especificidad.
- No se documentan sesgos demográficos ni de adquisición; la composición del dataset de entrenamiento (más allá del recuento de exploraciones) no está disponible.
- Licencia MIT, que permite uso comercial del código y pesos, pero ello no exime de las obligaciones regulatorias aplicables a software médico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad.
- No se especifican los formatos de pesos ni instrucciones de carga más allá de la librería `segmentation-models-pytorch`.

## Enlaces

- Hugging Face: https://huggingface.co/aee4/G17-BUS-Segmentation
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
