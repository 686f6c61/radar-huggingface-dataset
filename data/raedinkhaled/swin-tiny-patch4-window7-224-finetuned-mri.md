# raedinkhaled/swin-tiny-patch4-window7-224-finetuned-mri

## Resumen

`raedinkhaled/swin-tiny-patch4-window7-224-finetuned-mri` es un clasificador de imagen binario obtenido al ajustar (fine-tuning) el checkpoint `microsoft/swin-tiny-patch4-window7-224` sobre cortes de resonancia magnética cardiaca. El modelo distingue entre dos clases: `cad` (enfermedad arterial coronaria) y `healthy` (sano). Lo publica Raedin Khaled Sakhri como artefacto de investigación derivado de su tesis de máster de 2022 en la Universidad Ferhat Abbas (Argelia), codirigida con Loutfi Boufeligha y tutorizada por el profesor Abdelouaheb Moussaoui.

Se trata de un transformer de visión jerárquico de tipo Swin, preentrenado en ImageNet-1k y ajustado durante 3 épocas sobre 57.231 imágenes de entrenamiento (reparto 90/10 de un total de 63.425 imágenes del CAD Cardiac MRI Dataset). El autor declara una exactitud de 0,9807 sobre el conjunto de evaluación de 6.360 imágenes. Su relevancia es doble: por un lado demuestra que un backbone genérico de visión preentrenado en imágenes naturales se transfiere con muy pocas épocas a una tarea médica concreta; por otro, es un ejemplo claro de artefacto de investigación reproducible y pequeña escala (0,4 GB de repositorio) que no debe confundirse con un producto clínico.

El modelo **no es un dispositivo médico y el autor prohíbe explícitamente su uso clínico**. Cualquier evaluación debe partir del hecho de que solo se publicó exactitud, no hay validación externa ni a nivel de paciente, y se desconoce si imágenes del mismo paciente quedaron repartidas entre entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer jerárquico con atención en ventanas desplazadas (shifted windows); variante tiny, parche de 4, ventana de 7, resolución 224x224 |
| Parametros totales | no disponible en la informacion proporcionada (el checkpoint base es la variante tiny de Swin Transformer) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: clasificador de imagen con entrada fija de 224x224 píxeles |
| Tipos de cuantizacion | no disponible para este checkpoint; el modelo base dispone de conversiones ONNX/OpenVINO en Open Model Zoo |
| Idiomas soportados | no aplica (procesamiento de imagen, sin componente de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | pesos de PyTorch para Transformers (repositorio de 0,4 GB); no se especifica si se publican safetensors |
| Pipeline | image-classification |
| Clases de salida | `cad` (enfermedad arterial coronaria) y `healthy` |
| Modelo base | microsoft/swin-tiny-patch4-window7-224 |
| Dataset de ajuste | CAD Cardiac MRI Dataset (Kaggle), 63.425 imágenes |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Swin Transformer introducida por Liu et al.: un transformer de visión que construye mapas de características jerárquicos fusionando parches en capas profundas y que calcula la autoatención únicamente dentro de ventanas locales de 7x7, con desplazamiento de ventanas entre bloques para permitir el intercambio de información entre regiones. Cada parche se trata como un token de tamaño 4 y su vector inicial es la concatenación de los valores RGB en bruto. Esto da una complejidad lineal respecto al tamaño de la imagen, en contraste con la complejidad cuadrática de un ViT estándar. El backbone fue preentrenado en ImageNet-1k a 224x224 y después se ajustó con una cabeza de clasificación de dos clases.

El ajuste se realizó con Hugging Face Transformers 4.20.0, PyTorch 1.11.0+cu113, Datasets 2.3.2 y Tokenizers 0.12.1 sobre Google Colab. Hiperparámetros: learning rate 5e-05, batch de entrenamiento y evaluación 32, acumulación de gradiente 4 (batch efectivo 128), semilla 42, optimizador Adam (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 10 % de warmup, 3 épocas y precisión mixta con Native AMP. Las imágenes se convirtieron a RGB, se redimensionaron a 224x224 y se normalizaron con el extractor de características del modelo base. El entrenamiento registró aproximadamente 6,1 horas para las 3 épocas (la tesis lo redondea a unas 7 horas). No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador.

## Capacidades

- Clasificación binaria de cortes de resonancia magnética cardiaca en las etiquetas `cad` y `healthy`.
- Extracción de características visuales del backbone Swin, reutilizable como extractor congelado para otras tareas de imagen médica.
- Inferencia a través del pipeline estándar de Transformers (`pipeline("image-classification", ...)`) y de `AutoModelForImageClassification`.
- Entrada de imagen RGB redimensionada a 224x224 con la normalización del extractor del modelo base.
- Ejecución tanto en CPU como en GPU, dado el reducido tamaño del checkpoint.
- Transferencia a nuevos dominios mediante reajuste de la cabeza de clasificación (el autor lo plantea como artefacto de investigación y educación).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generación de texto, matemáticas ni procesamiento de audio o vídeo.
- No tiene capacidades multilingües: no procesa texto de ningún tipo.

## Casos de uso

- **Preanotación de datasets de imagen cardiaca**: usar el modelo como etiquetador automático de primera pasada sobre cortes de resonancia magnética para acelerar el etiquetado manual posterior por parte de cardiólogos o investigadores, reduciendo el coste de anotación a nivel de volumen.
- **Investigación comparativa de arquitecturas de visión**: reproducir el experimento de la tesis y comparar Swin-Tiny frente a ViT-Base, DeiT o CNN sobre el mismo dataset, midiendo el compromiso entre coste de entrenamiento y exactitud.
- **Prototipado de pipelines de imagen médica**: integrar el clasificador como primer módulo de un pipeline que después aplique segmentación o detección, aprovechando que su salida es una distribución de probabilidad sobre dos clases.
- **Extracción de embeddings para análisis exploratorio**: emplear el backbone como extractor de características para agrupar cortes por similitud, detectar ejemplos atípicos o estudiar la separabilidad de las dos clases con técnicas como UMAP o t-SNE.
- **Docencia y prácticas de aprendizaje por transferencia**: es un ejemplo compacto y de licencia permisiva para enseñar fine-tuning de transformers de visión en un entorno Colab con recursos limitados.
- **Validación de infraestructura de despliegue**: servir como modelo de prueba de bajo coste para verificar que un stack de inferencia (Triton, TorchServe, un contenedor ONNX Runtime) funciona de extremo a extremo antes de desplegar modelos médicos más grandes.
- **Análisis de sesgo y robustez en investigación**: evaluar cómo se degrada un clasificador médico preentrenado en imágenes naturales cuando se aplica a escáneres, protocolos de adquisición o poblaciones distintas de las del dataset original.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el CAD Cardiac MRI Dataset (Image Classification, exactitud, no verificada de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Image Classification | CAD Cardiac MRI Dataset (Kaggle) | Accuracy | 0,9807 |

Evolución por época reportada por el autor:

| Epoca | Perdida de entrenamiento | Perdida de validacion | Accuracy |
|---|---|---|---|
| 1 | 0,0592 | 0,0823 | 0,9695 |
| 2 | 0,0196 | 0,0761 | 0,9739 |
| 3 | 0,0058 | 0,0608 | 0,9807 |

Comparativa interna de la tesis (mismo dataset y tarea, según la model card):

| Modelo | Accuracy | Nota |
|---|---|---|
| DeiT | 0,9901 | el autor indica sobreajuste |
| ViT-Base | 0,9827 | — |
| Swin-Tiny (este checkpoint) | 0,9807 | 3 épocas, ~6,1 h en Colab |
| CNN | 0,88 | — |
| Vision Transformer desde cero | 0,7573 | — |

## Requisitos de hardware

- El repositorio completo ocupa 0,4 GB, por lo que el ajuste y la inferencia son viables en recursos modestos; el entrenamiento se completó en Google Colab con precisión mixta, no en clúster.
- VRAM estimada en FP32: cabe holgadamente en cualquier GPU de consumo con 8 GB o menos, e incluso en CPU para inferencia por lotes pequeños. Cifras exactas de VRAM no están publicadas en la información disponible.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es más que suficiente para inferencia y para reajustes; A100 o H100 solo tendrían sentido si se escala a lotes masivos o a entrenamiento desde cero.
- Despliegue: el pipeline de Hugging Face Transformers funciona directamente; para producción se puede exportar a ONNX Runtime, OpenVINO (existe conversión del modelo base en Open Model Zoo), TorchServe o Triton. vLLM y llama.cpp no aplican, ya que son runners de modelos generativos de lenguaje.
- Latencia y throughput: no publicados en la información disponible. Con un backbone tiny de visión a 224x224 se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swin-tiny-patch4-window7-224-finetuned-mri | no disponible | imagen 224x224 | Accuracy 0,9807 (autor) | apache-2.0 | Hugging Face, 12 descargas, 1 like |
| ViT-Base (según la tesis) | no disponible | imagen 224x224 | Accuracy 0,9827 | no disponible | referencia en la tesis |
| DeiT (según la tesis) | no disponible | imagen 224x224 | Accuracy 0,9901, con sobreajuste señalado | no disponible | referencia en la tesis |
| CNN (según la tesis) | no disponible | imagen 224x224 | Accuracy 0,88 | no disponible | referencia en la tesis |
| microsoft/swin-tiny-patch4-window7-224 | no disponible | imagen 224x224 | no aplica (clasificación ImageNet-1k) | apache-2.0 | Hugging Face, Open Model Zoo |

No hay datos de parámetros ni de coste computacional en la información proporcionada para ninguno de los modelos comparados, por lo que la comparación se limita a la exactitud declarada y a la licencia.

## Limitaciones y advertencias

- **No es un dispositivo médico.** El propio autor lo etiqueta como artefacto de investigación de una tesis de 2022 y prohíbe su uso clínico. No debe emplearse para diagnóstico, triaje ni decisión terapéutica.
- **Un único dataset público.** No existe validación externa ni validación a nivel de paciente, por lo que se desconoce el comportamiento en otros escáneres, hospitales o poblaciones.
- **Riesgo de fuga de datos.** La tesis no documenta si las imágenes del mismo paciente se mantuvieron en un único split, de modo que no puede descartarse solapamiento entre entrenamiento y evaluación; esto podría inflar la exactitud reportada.
- **Métrica incompleta.** Solo se midió exactitud. No hay precisión, sensibilidad, especificidad, recall, F1 ni AUC, que son imprescindibles en un contexto médico y más aún con clases desbalanceadas (25.861 sanos frente a 37.564 enfermos).
- **Desbalance de clases sin tratamiento documentado.** No se indica si se aplicaron pesos de clase, remuestreo o umbrales de decisión ajustados, por lo que la exactitud agregada puede ocultar diferencias relevantes entre clases.
- **Sesgos potenciales.** El modelo hereda los sesgos de ImageNet-1k y del dataset cardiaco de origen, cuya composición demográfica, geográfica y de equipamiento no está documentada.
- **Sin información de calibración.** No se publican curvas de fiabilidad ni umbrales recomendados, por lo que las probabilidades de salida no deben interpretarse como confianza clínica.
- **Licencia permisiva, pero con responsabilidad.** apache-2.0 permite uso comercial del software, si bien el uso comercial en un contexto sanitario quedaría fuera del alcance previsto por el autor y sin respaldo regulatorio (marcado CE, FDA, etc.).
- **Madurez y mantenimiento.** El repositorio acumula 12 descargas y 1 like, con última actualización registrada en 2026 pero sin actividad de mantenimiento documentada; no hay garantía de soporte ni de corrección de errores.
- **Idioma y modalidad.** No procesa texto; cualquier expectativa multilingüe o de generación es inaplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raedinkhaled/swin-tiny-patch4-window7-224-finetuned-mri
- Modelo base: https://huggingface.co/microsoft/swin-tiny-patch4-window7-224
- Dataset CAD Cardiac MRI en Kaggle: https://www.kaggle.com/code/kerneler/starter-cad-cardiac-mri-dataset-966083ec-e/data
- Open Model Zoo, ficha del modelo base: https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/swin-tiny-patch4-window7-224/README.md
- Documentación OpenVINO del modelo base: https://docs.openvino.ai/2023.3/omz_models_model_swin_tiny_patch4_window7_224.html
- Réplica del modelo base en ModelScope: https://www.modelscope.cn/models/microsoft/swin-tiny-patch4-window7-224
