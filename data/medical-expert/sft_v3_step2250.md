# medical-expert/sft_v3_step2250

## Resumen

El modelo `medical-expert/sft_v3_step2250` es un checkpoint intermedio de un proceso de fine-tuning supervisado (SFT) sobre un modelo base de visión-lenguaje orientado a imágenes médicas, desarrollado por el usuario `medical-expert`. Está diseñado para abordar tareas de clasificación y grounding (localización de hallazgos) en radiografías de tórax y otros estudios radiológicos. El autor reporta mejoras significativas en métricas como CheXpert macro F1, MS-CXR y Vindr-CXR en comparación con modelos previos de la misma familia y con otros modelos de referencia.

El entrenamiento emplea LoRA con rango 32, un batch size global de 32 y un total de 50 973 muestras (30 000 de clasificación y 20 973 de grounding). El repositorio tiene un tamaño de 1.0 GB, lo que sugiere que se trata de un adaptador LoRA más que de un modelo completo. La relevancia actual radica en su potencial para mejorar la precisión en tareas de diagnóstico asistido por imagen, un área con alta demanda de modelos especializados y reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base. Sin embargo, el proceso de entrenamiento indica que se aplicó fine-tuning con LoRA (rango 32) sobre un modelo preentrenado no especificado. El dataset de entrenamiento combina tareas de clasificación (30 000 muestras) y grounding (20 973 muestras), totalizando 50 973 ejemplos. El entrenamiento se realizó con un batch size global de 32 y un epoch equivale a aproximadamente 1600 pasos. El checkpoint evaluado corresponde al paso 2250, que según los datos reportados obtiene el mejor rendimiento global (Overall 43.00) entre los steps evaluados. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Clasificación de imágenes médicas, especialmente radiografías de tórax, para detectar patologías (probablemente en el marco de CheXpert y ChestXray).
- Grounding o localización de hallazgos anómalos en imágenes radiológicas (evaluado en MS-CXR y Vindr-CXR).
- Soporte para múltiples tareas de visión médica en un mismo modelo gracias al entrenamiento mixto.
- No se dispone de información sobre generación de texto, tool calling, capacidades multilingües o modo de razonamiento.

## Casos de uso

- Asistencia al radiólogo: el modelo puede predecir la presencia de enfermedades torácicas a partir de radiografías, ayudando a priorizar casos urgentes y reducir la carga de trabajo.
- Localización de hallazgos: mediante la tarea de grounding, el modelo puede señalar regiones específicas de la imagen donde se detectan anomalías, facilitando la interpretación clínica.
- Triaje automático en servicios de urgencias: clasificación rápida de radiografías para identificar pacientes con patologías críticas como neumotórax o derrame pleural.
- Investigación en modelos de visión médica: sirve como referencia para comparar técnicas de fine-tuning con LoRA en dominios clínicos.
- Desarrollo de herramientas educativas: puede integrarse en plataformas de formación para estudiantes de medicina, mostrando ejemplos de detección y localización de patologías.
- Auditoría de calidad en servicios de radiología: uso como segundo lector para verificar la consistencia de los informes radiológicos.

## Benchmarks y rendimiento

El autor reporta resultados de evaluación en cuatro conjuntos de datos médicos. La siguiente tabla muestra los valores para el checkpoint step2250 (el modelo en cuestión) y para otros steps del mismo entrenamiento, así como para modelos de referencia.

| Modelo | Chexpert (macro F1) | MS-CXR | ChestXray | Vindr-cxr | Overall |
|---|---|---|---|---|---|
| chexfound | 51.1 | - | - | - | - |
| eva-x | 41.2 | - | - | - | - |
| unichest | 60.7 | - | - | - | - |
| sft-v3-step1000 | 60.8 | 38.2 | 20.7 | 27.9 | 36.90 |
| sft-v3-step1250 | 55.6 | 46.0 | 19.2 | 30.9 | 37.92 |
| sft-v3-step1500 | 61.4 | 52.3 | 22.6 | 31.8 | 42.02 |
| sft-v3-step1750 | 59.5 | 49.9 | 23.2 | 30.5 | 40.77 |
| sft-v3-step2000 | **62.7** | 52.5 | 23.2 | 32.2 | 42.65 |
| sft-v3-step2250 | 62.0 | 54.7 | 22.4 | **32.9** | **43.00** |
| sft-v3-step2500 | 56.6 | **56.2** | **23.6** | 32.6 | 42.25 |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Dado que el repositorio pesa 1.0 GB y se trata de un adaptador LoRA, es plausible que la inferencia pueda ejecutarse en GPUs de consumo (por ejemplo, RTX 3090 o RTX 4090) con VRAM de 8-12 GB, pero esta es una estimación no verificada. Para despliegue se podría usar frameworks como vLLM, llama.cpp u Ollama, aunque no hay confirmación de compatibilidad. Se recomienda consultar la documentación del modelo base subyacente, que no se ha identificado.

## Comparativa con modelos similares

La tabla de benchmarks ya incluye comparaciones con tres modelos de referencia (chexfound, eva-x, unichest) en la tarea de CheXpert. No se dispone de información sobre parámetros, contexto o licencias de estos modelos. Tampoco se conocen alternativas directas con el mismo enfoque de LoRA sobre visión médica. Por tanto, la comparativa se limita a los resultados de rendimiento presentados por el autor.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es utilizable en entornos comerciales o de producción sin permiso explícito.
- Sesgos y generalización: los resultados se basan en conjuntos de datos específicos (CheXpert, MS-CXR, ChestXray, Vindr-CXR); el rendimiento en otras poblaciones o tipos de imagen no está garantizado.
- Alucinación y errores de localización: al ser un modelo de visión, puede producir falsos positivos o negativos en la clasificación y grounding, con riesgo clínico si se usa sin supervisión humana.
- Checkpoint intermedio: el modelo corresponde al paso 2250 de un entrenamiento que continúa hasta al menos el paso 2500; no es el checkpoint final, aunque muestra el mejor Overall.
- Idioma y contexto: no se especifican idiomas soportados ni longitud de contexto, lo que limita su uso en tareas que requieran comprensión de texto en varios idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/medical-expert/sft_v3_step2250
- GitHub - ExpertOpsAI/MedicalModelLibrary: https://github.com/ExpertOpsAI/MedicalModelLibrary/
- MedGemma (Google DeepMind): https://deepmind.google/models/gemma/medgemma/
- Health AI (Google AI): https://ai.google/health/
- GitHub - transformers-Medical-Expert: https://github.com/zysea23/transformers-Medical-Expert
- Intelligent-Internet/II-Medical-8B: https://huggingface.co/Intelligent-Internet/II-Medical-8B
