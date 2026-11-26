# MIC-DKFZ/nnFoundationViT

## Resumen

nnFoundationViT es un modelo fundacional de visión 3D para radiología médica, desarrollado por el German Cancer Research Center (DKFZ) y publicado bajo el identificador MIC-DKFZ/nnFoundationViT en Hugging Face. Forma parte de la familia nnFoundation, compuesta por dos modelos complementarios: este ViT de 674M parámetros y un CNN de 102M parámetros (nnFoundationCNN). Ambos se han preentrenado con el framework de aprendizaje autosupervisado nnssl del mismo grupo, diseñado específicamente para volúmenes médicos 3D.

El modelo emplea la arquitectura Primus (un transformer de visión 3D con 40 capas, dimensión de embedding 1056 y 16 cabezas de atención), que tokeniza volúmenes mediante parches de 8³ vóxeles. Resuelve el problema de la escasez de datos etiquetados en imagen médica: en lugar de entrenar desde cero, los investigadores pueden partir de un backbone preentrenado con grandes volúmenes de datos sin anotaciones y hacer fine-tuning en tareas concretas como segmentación, detección, clasificación o generación de informes radiológicos.

Su relevancia actual radica en la integración nativa con el ecosistema nnU-Net, el framework de referencia para segmentación médica. nnU-Net puede descargar automáticamente estos pesos, adaptar el plan de preprocesamiento y usarlos como inicialización, lo que reduce drásticamente el coste computacional y los datos necesarios para obtener resultados competitivos en tareas clínicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Primus (transformer de visión 3D), 40 capas, dim. de embedding 1056, 16 cabezas, parches 8³ |
| Parámetros totales | 674M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (volumen de entrada; parche recomendado 192×192×192) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`checkpoint_final.pth`, dict serializado con `torch.save`) |

## Arquitectura y entrenamiento

nnFoundationViT se basa en Primus, una arquitectura transformer de visión adaptada a volúmenes 3D. El modelo procesa volúmenes de un solo canal mediante tokenización en parches cúbicos de 8³ vóxeles, con 40 capas transformer, dimensión de embedding de 1056 y 16 cabezas de atención. El checkpoint incluye un plan de adaptación (`adaptation_plan.json`) que describe la arquitectura y el preprocesamiento esperado, lo que permite a nnU-Net verificar compatibilidad y reconstruir la red.

El preentrenamiento se realizó con el framework nnssl, que implementa aprendizaje autosupervisado sobre datos médicos 3D sin etiquetas. La model card cita el dataset OpenMind y los checkpoints OpenMind como base de datos y pesos asociados al framework. No se especifican en la información disponible el número exacto de tokens/volúmenes de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo de visión). La entrada esperada son volúmenes 3D de un solo canal, normalizados con Z-score y sin remuestreo, con un tamaño de parche recomendado de 192×192×192.

## Capacidades

- Extracción de características 3D a partir de volúmenes radiológicos (TC, RM, etc.) de un solo canal.
- Inicialización para fine-tuning en segmentación semántica 3D mediante nnU-Net.
- Inicialización para fine-tuning en detección de lesiones mediante nnDetection.
- Inicialización para clasificación de imágenes médicas 3D.
- Soporte para generación de informes radiológicos 3D (repositorio 3d_report_generation).
- Aprendizaje autosupervisado que permite adaptación con pocos datos etiquetados.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un backbone de visión, no un modelo de lenguaje.
- Capacidades multilingües no aplicables (modelo de imagen).

## Casos de uso

- Segmentación de órganos y lesiones en TC/RM: se carga el checkpoint como inicialización en nnU-Net, se ejecuta `nnUNetv2_preprocess_like_nnssl` con `-am like_pretrained` y se hace fine-tuning sobre el dataset clínico; el backbone preentrenado reduce la necesidad de datos anotados.
- Detección de nódulos pulmonares o metástasis: fine-tuning con nnDetection partiendo de los pesos de nnFoundationViT para localizar lesiones en volúmenes 3D con mayor sensibilidad que un entrenamiento desde cero.
- Clasificación de estudios radiológicos (por ejemplo, triaje de gravedad o fenotipado): fine-tuning del backbone con el repositorio image_classification para etiquetar volúmenes completos.
- Generación de informes radiológicos asistida: uso del backbone en el pipeline 3d_report_generation para producir descripciones estructuradas a partir del volumen.
- Investigación en aprendizaje autosupervisado médico: reutilización del checkpoint como referencia para comparar estrategias de preentrenamiento 3D.
- Prototipado rápido en entornos con recursos limitados: al partir de un backbone preentrenado de 674M parámetros, se necesitan menos épocas y menos datos para alcanzar resultados razonables en tareas downstream.
- Desarrollo de herramientas de investigación multi-tarea: un único backbone sirve para segmentación, detección y clasificación, simplificando el mantenimiento de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el checkpoint ocupa 2,7 GB, lo que sugiere que en precisión completa (FP32) los pesos requieren aproximadamente esa cantidad y en FP16 alrededor de 1,4 GB, aunque el consumo real depende del tamaño de parche (192×192×192) y de las activaciones intermedias.
- GPU recomendadas: no disponible; por el tamaño del modelo y el volumen de entrada, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090/4090, A100, H100) para fine-tuning, y menos para inferencia con parches reducidos.
- Compatibilidad con GPU de consumo: probable en GPUs de gama alta (RTX 3090/4090) para inferencia con parches moderados; el fine-tuning con parches 192³ puede requerir más memoria.
- Opciones de despliegue: nnU-Net (carga nativa desde Hugging Face o ruta local), nnDetection, image_classification y 3d_report_generation; descarga mediante `huggingface_hub.hf_hub_download`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nnFoundationViT | Primus (ViT 3D) | 674M | parche 192×192×192 | CC BY-SA 4.0 | Hugging Face (MIC-DKFZ) |
| nnFoundationCNN | ResEnc (CNN 3D) | 102M | parche 192×192×192 | CC BY-SA 4.0 | Hugging Face (MIC-DKFZ) |
| Otros modelos fundacionales 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso clínico ni diagnóstico; requiere validación regulatoria antes de cualquier aplicación en producción sanitaria.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obligación de compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para productos propietarios.
- Entrada restringida: solo volúmenes 3D de un solo canal, normalizados con Z-score y sin remuestreo; no procesa imágenes 2D ni texto.
- Riesgo de sesgo: el rendimiento depende de la distribución de los datos de preentrenamiento (OpenMind y otros); puede degradarse en modalidades, anatomías o poblaciones poco representadas.
- Riesgo de alucinación: en tareas de generación de informes, el modelo puede producir descripciones no sustentadas en la imagen.
- Sin datos publicados de benchmarks en la información disponible, lo que dificulta la comparación objetiva con alternativas.
- Idiomas no aplicables; no es un modelo lingüístico.

## Enlaces

- Hugging Face: https://huggingface.co/MIC-DKFZ/nnFoundationViT
- Modelo CNN complementario: https://huggingface.co/MIC-DKFZ/nnFoundationCNN
- Paper nnFoundation (arXiv 2609.26924): https://arxiv.org/abs/2609.26924
- Paper ResEnc (arXiv 2404.09556): https://arxiv.org/abs/2404.09556
- Paper Primus (arXiv 2503.01835): https://arxiv.org/abs/2503.01835
- Framework nnssl: https://github.com/MIC-DKFZ/nnssl
- Fine-tuning en nnU-Net: https://github.com/MIC-DKFZ/nnUNet/blob/master/documentation/finetuning_from_nnssl_checkpoints.md
- Fine-tuning en nnDetection: https://github.com/MIC-DKFZ/nnDetection/blob/finetuning/docs/finetuning.md
- Fine-tuning para clasificación: https://github.com/MIC-DKFZ/image_classification/blob/master/docs/nnfoundation.md
- Generación de informes 3D: https://github.com/MIC-DKFZ/3d_report_generation
