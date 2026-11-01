# MouthCare/intraoral-voting-classifier

## Resumen

MouthCare/intraoral-voting-classifier es un modelo de segmentación semántica de imágenes desarrollado por MouthCare, orientado al ámbito de la odontología y la salud oral. El modelo se distribuye a través de HuggingFace con pipeline `image-segmentation` y está construido sobre `segmentation-models-pytorch`, con un esquema de ensemble o votación (de ahí el nombre "voting-classifier") que combina las salidas de varios segmentadores para producir una máscara final. El repositorio ocupa aproximadamente 0,5 GB y los pesos se distribuyen en formato PyTorch.

El modelo se publica bajo la licencia propietaria `mouthcare-evaluation-license` y con acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo. Está entrenado y evaluado sobre el dataset `MouthCare/intraoral-sample` y declara únicamente el idioma inglés en sus metadatos, aunque al tratarse de un modelo de visión la relevancia del idioma es marginal (afecta a etiquetas y documentación, no a la inferencia sobre píxeles).

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho clínico, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados en la información disponible y con una licencia que restringe el uso comercial. Es útil para equipos que trabajen en fotografía clínica intraoral y quieran evaluar un pipeline de segmentación preentrenado, pero no debe considerarse un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de segmentación semántica sobre `segmentation-models-pytorch` (backbone concreto no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no disponible) |
| Tipos de cuantizacion | no disponible (pesos PyTorch; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (metadatos; irrelevante para la tarea de segmentación) |
| Licencia | mouthcare-evaluation-license (licencia de evaluación propietaria) |
| Formato de pesos | PyTorch (`pytorch` como librería; safetensors/bin no confirmado) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se apoya en `segmentation-models-pytorch`, una librería que proporciona encoders preentrenados (típicamente ResNet, EfficientNet, MobileNet o similares) combinados con cabezales de segmentación tipo U-Net, FPN, PSPNet o DeepLabV3. El nombre "voting-classifier" sugiere una estrategia de agregación por votación sobre las predicciones de varios modelos o cabezales, aunque no se especifica si la votación es a nivel de píxel, de clase o de máscara, ni cuántos miembros componen el ensemble.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset `MouthCare/intraoral-sample`, el número de imágenes, las clases segmentadas (dientes, encías, caries, placa, etc.) ni si se emplearon técnicas de aumento de datos, balanceo de clases o validación cruzada. Tampoco se documenta si hubo ajuste fino supervisado, destilación o entrenamiento desde cero. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Segmentación semántica de imágenes de fotografía clínica intraoral: genera máscaras por píxel sobre las regiones de interés que el modelo haya aprendido a delimitar.
- Pipeline nativo de HuggingFace `image-segmentation`, lo que facilita su integración con `transformers` y `segmentation-models-pytorch`.
- Agregación por votación (ensemble) para reducir la varianza de la predicción frente a un único segmentador, según se deduce del nombre del modelo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente visual y discriminativo.
- No se documenta capacidad multilingüe ni generación de texto.
- No se documenta modo "thinking", visión general (más allá de la segmentación), audio ni otras modalidades.

## Casos de uso

- Asistencia al diagnóstico en fotografía intraoral: el modelo puede producir una máscara preliminar de las estructuras dentales y gingivales sobre una fotografía clínica, que el odontólogo revisa y corrige. Es adecuado porque el pipeline de segmentación está pensado exactamente para este tipo de imagen.
- Preprocesado en pipelines de teleodontología: segmentar la región de interés antes de aplicar clasificadores posteriores (caries, placa, inflamación) reduce el ruido de fondo y mejora la robustez de las etapas siguientes.
- Anonimización parcial de imágenes clínicas: la máscara permite recortar o difuminar regiones no relevantes antes de compartir el caso con otros profesionales, siempre que la licencia lo permita.
- Investigación en salud oral: uso como baseline reproducible en estudios comparativos de segmentación intraoral, dado que el modelo y el dataset de muestra están publicados en HuggingFace.
- Docencia y formación: generación de máscaras de referencia para comparar con las anotaciones manuales de estudiantes en prácticas de odontología.
- Control de calidad de adquisición de imagen: detectar fotografías en las que la segmentación falla de forma sistemática (encuadre incorrecto, iluminación pobre) para descartarlas antes de entrar en producción.
- Evaluación interna de proveedores: al estar bajo licencia de evaluación, encaja en pruebas comparativas de herramientas de visión clínica antes de decidir una compra o integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de IoU, Dice, precisión, recall ni comparaciones con otros segmentadores intraorales en la ficha de HuggingFace consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,5 GB, por lo que en FP32 la inferencia cabría holgadamente en GPUs de 4-8 GB, pero el tamaño real de los pesos y del ensemble no se documenta.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, una RTX 3060 o superior sería suficiente en la mayoría de escenarios, pero es una estimación, no un dato del autor.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del repo (0,5 GB), aunque no está confirmado por el autor.
- Opciones de despliegue: al ser PyTorch + `segmentation-models-pytorch`, el despliegue natural es un script de inferencia con PyTorch o TorchServe. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia genérica de la categoría, cabría comparar con segmentadores genéricos tipo SAM (Segment Anything Model) o con arquitecturas U-Net/DeepLab entrenadas específicamente en imágenes dentales, pero no se han encontrado datos de rendimiento del modelo MouthCare que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MouthCare/intraoral-voting-classifier | no disponible | no aplica | mouthcare-evaluation-license | Gated en HuggingFace |
| SAM (referencia genérica) | no disponible en esta ficha | no aplica | Apache 2.0 (versión original) | Pública |
| U-Net/DeepLab entrenados ad hoc | no disponible | no aplica | variable | Depende del autor |

## Limitaciones y advertencias

- Licencia `mouthcare-evaluation-license`: es una licencia de evaluación propietaria; el uso comercial, la redistribución o el despliegue en producción requieren revisar y probablemente negociar condiciones con MouthCare. No asumir uso libre.
- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos, lo que añade fricción a pipelines automatizados de CI/CD.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni de validación externa.
- Sin benchmarks publicados: no se puede afirmar su calidad frente a alternativas; cualquier decisión de adopción debería ir precedida de una evaluación propia sobre un conjunto de imágenes representativo.
- Riesgo de alucinación de máscaras: como todo segmentador, puede producir contornos plausibles pero incorrectos en imágenes fuera de distribución (iluminación distinta, encuadre atípico, instrumental, etc.).
- Sesgos potenciales: el dataset `MouthCare/intraoral-sample` puede no representar la diversidad de tonos de piel, tipos de dentición o condiciones clínicas de una población amplia; no se documenta la composición.
- Idiomas: los metadatos declaran solo inglés, lo que afecta a la documentación y a las etiquetas, no a la inferencia.
- No apto para diagnóstico autónomo: es una herramienta de apoyo; cualquier uso clínico debe ir supervisado por un profesional y cumplir la normativa sanitaria aplicable (MDR en la UE, FDA en EE. UU., etc.).
- No se documenta el backbone exacto, el número de clases ni el formato de salida, lo que complica la integración sin inspeccionar el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/MouthCare/intraoral-voting-classifier
- Dataset de referencia: https://huggingface.co/datasets/MouthCare/intraoral-sample
- Librería base: https://github.com/qubvel/segmentation_models.pytorch
- Documentación de HuggingFace sobre image-segmentation: https://huggingface.co/docs/transformers/tasks/semantic_segmentation
