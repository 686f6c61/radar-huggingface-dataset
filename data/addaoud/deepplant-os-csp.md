# Addaoud/DeepPlant-OS-CSP

## Resumen

DeepPlant-OS-CSP es un modelo de aprendizaje profundo publicado en Hugging Face por el usuario Addaoud, orientado a genómica vegetal y genómica regulatoria. Con 238.305.118 parámetros (aproximadamente 238 millones) y un tamaño de repositorio de 1,0 GB, se distribuye en formato safetensors mediante la integración `PyTorchModelHubMixin` de Hugging Face Hub, lo que permite cargarlo con una API de alto nivel desde Python. La licencia es MIT, lo que facilita su uso comercial y su modificación.

El modelo no es un modelo de lenguaje generativo: su `pipeline_tag` es `other` y sus etiquetas apuntan a bioinformática, genómica vegetal y genómica regulatoria. Por el nombre (OS-CSP) y el contexto de genómica regulatoria, cabe interpretar que está diseñado para tareas de predicción sobre secuencias reguladoras o elementos de unión, aunque la model card no documenta la arquitectura, los datos de entrenamiento ni las métricas de evaluación. La información pública disponible es mínima: la model card es prácticamente el texto autogenerado por la integración de Hugging Face Hub, con referencias a código, paper y documentación marcadas como "More Information Needed".

Su relevancia actual es limitada pero concreta: ofrece un checkpoint de tamaño medio (238 M de parámetros) para experimentación en genómica computacional de plantas, con licencia permisiva y pesos en safetensors. No obstante, la ausencia de documentación técnica y de benchmarks hace que deba tratarse como un artefacto de investigación sin garantías de reproducibilidad ni de rendimiento validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 238.305.118 |
| Parámetros activos | no aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo no lingüístico; opera sobre secuencias biológicas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,0 GB |
| Pipeline declarado | other |
| Etiquetas | bioinformatics, model_hub_mixin, plant-genomics, pytorch_model_hub_mixin, regulatory-genomics |
| Descargas | 19 |
| Likes | 0 |
| Fecha de creación | 2026-10-31 |
| Fecha de actualización | 2026-10-31 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card no especifica si se trata de un transformer, una CNN, un modelo híbrido o una arquitectura específica para secuencias genómicas. Tampoco se documenta el número de capas, la dimensión de los embeddings, el mecanismo de atención ni la función de pérdida. El único dato estructural fiable es el recuento de parámetros obtenido de los tensores en safetensors: 238.305.118.

Tampoco hay información sobre el corpus de entrenamiento: no se indica el número de tokens o pares de bases, la composición del dataset (especies vegetales, tipos de elementos reguladores, ventanas de secuencia), ni si se emplearon técnicas de ajuste fino supervisado, RLHF o aumentación de datos. La model card remite a un repositorio de código (`https://huggingface.co/your-username/deepplant`) que aparentemente es una plantilla sin completar, y marca paper y documentación como "More Information Needed". En consecuencia, no es posible evaluar la calidad, la cobertura ni los posibles sesgos del entrenamiento.

## Capacidades

- Predicción sobre genómica vegetal y genómica regulatoria: las etiquetas del repositorio indican que el modelo está orientado a tareas de análisis de elementos reguladores en genomas de plantas, aunque no se detalla la tarea exacta (clasificación de secuencias, predicción de accesibilidad, identificación de sitios de unión, etc.).
- Carga mediante `PyTorchModelHubMixin`: el modelo se puede instanciar y cargar desde el Hub con la API de mixins de `huggingface_hub`, lo que facilita su integración en pipelines de PyTorch.
- Compatibilidad con el ecosistema Hugging Face: al estar en safetensors y usar `model_hub_mixin`, se integra con las herramientas estándar de descarga y versionado del Hub.
- Generación de texto: no documentada; el pipeline `other` y el dominio biológico sugieren que no es un modelo generativo de lenguaje.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicables; no es un modelo lingüístico.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Anotación funcional de genomas vegetales: usar el modelo como extractor de características o clasificador sobre ventanas de secuencia para priorizar regiones candidatas a elementos reguladores antes de su validación experimental con ChIP-seq o ATAC-seq.
- Búsqueda de motivos reguladores en cultivos: aplicar el checkpoint sobre secuencias promotoras de especies de interés agronómico (por ejemplo, cereales o leguminosas) para generar hipótesis sobre sitios de unión de factores de transcripción que luego se contrastan in silico con herramientas como FIMO o JASPAR.
- Filtrado previo en pipelines de ensamblaje y anotación: integrar el modelo como paso de scoring en flujos de anotación automática, reduciendo el número de regiones que pasan a validación manual o experimental.
- Investigación en genómica comparativa: puntuar ortosecuencias reguladoras conservadas entre especies vegetales para detectar elementos bajo selección purificadora, aprovechando que el modelo trabaja sobre representaciones de secuencia.
- Prototipado académico y docencia: al tener 238 M de parámetros y licencia MIT, sirve como base para prácticas de bioinformática computacional y para experimentos de ajuste fino con datasets propios de laboratorio.
- Integración en servicios de análisis genómico: desplegar el modelo como microservicio PyTorch detrás de una API para que grupos de biología molecular envíen lotes de secuencias y reciban puntuaciones, siempre que se valide antes su calibración con datos independientes.
- Ajuste fino con `PyTorchModelHubMixin`: reentrenar las capas finales sobre un conjunto etiquetado propio (por ejemplo, datos de accesibilidad de cromatina en una especie concreta) y volver a publicar el checkpoint con el mismo formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (AUROC, AUPRC, precisión, recall, F1 ni comparaciones con baselines como Basenji, Enformer o modelos específicos de plantas). Tampoco se documentan tiempos de inferencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,95 GB solo para pesos (238,3 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, entre 1,5 y 3 GB según el tamaño de lote y la longitud de secuencia.
- VRAM estimada en FP16/BF16: aproximadamente 0,48 GB para pesos; entre 1 y 2 GB con activaciones para lotes pequeños.
- VRAM estimada en INT8: aproximadamente 0,24 GB para pesos; cuantización no documentada por el autor, requeriría conversión manual.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia en FP32 con lotes pequeños; una RTX 3060, RTX 4060, RTX 4090 o una T4 en cloud cubren el caso de uso sin problemas. Para entrenamiento o ajuste fino, se recomienda una A100, H100 o L40S por el mayor ancho de banda de memoria.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas (GTX 1660 en adelante), e incluso en CPU para inferencia por lotes pequeños, dado el reducido tamaño del modelo.
- Opciones de despliegue: al no ser un modelo de lenguaje, no aplican vLLM, TGI ni llama.cpp. El despliegue natural es PyTorch nativo con `PyTorchModelHubMixin`, exportación a TorchScript u ONNX Runtime para producción, o un servidor FastAPI/TorchServe envolviendo el modelo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de genómica vegetal o regulatoria, y la falta de documentación sobre arquitectura y tarea impide establecer una comparación rigurosa con alternativas como Enformer, Basenji2 o modelos específicos de plantas. Se indica "no disponible" en lugar de especular.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe arquitectura, datos de entrenamiento, tarea objetivo ni métricas; el repositorio de código enlazado parece una plantilla sin completar (`your-username/deepplant`).
- Sin benchmarks ni validación independiente: no hay evidencia publicada de que el modelo funcione correctamente en ninguna tarea concreta; no debe usarse en producción sin una evaluación propia.
- Riesgo de alucinación en sentido amplio: al no conocerse la calibración del modelo, las puntuaciones pueden ser arbitrarias o estar mal calibradas para datos fuera de la distribución de entrenamiento.
- Sesgos desconocidos: se desconoce la composición del dataset; es probable un sesgo hacia las especies vegetales y tipos de elementos reguladores presentes en el entrenamiento, con degradación esperada en taxones no representados.
- Limitaciones de contexto: no se documenta la longitud máxima de secuencia de entrada; secuencias más largas de lo que soporte la arquitectura podrían truncarse o producir errores.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución y sin garantía; no obstante, la licencia del modelo no cubre posibles restricciones sobre los datos de entrenamiento, que se desconocen.
- Caveat para producción: con 19 descargas y 0 likes, el modelo no tiene tracción ni validación comunitaria; tratar como artefacto de investigación.
- Fecha de creación anómala (2026-10-31): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Addaoud/DeepPlant-OS-CSP
- Repositorio de código referenciado en la model card (plantilla sin completar): https://huggingface.co/your-username/deepplant
- Documentación de `PyTorchModelHubMixin`: https://huggingface.co/docs/huggingface_hub/package_reference/mixins#huggingface_hub.PyTorchModelHubMixin
- Paper: no disponible
- Documentación adicional: no disponible
