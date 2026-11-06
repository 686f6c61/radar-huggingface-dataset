# MedMLX/mlx-generate-ctmr

## Resumen

mlx-generate-ctmr es una conversión nativa a MLX de los pesos de la familia NV-Generate de NVIDIA, orientada a la generación incondicional de imágenes médicas sintéticas (TC y RM) sobre Apple Silicon. El paquete agrupa cuatro configuraciones —TC, máscaras TC emparejadas, RM general y RM cerebral— con sus respectivos VAE de imagen, UNet y, en el caso de TC, un ControlNet. Los pesos se han convertido a safetensors sin reentrenamiento, por lo que el modelo conserva el comportamiento de los originales de NVIDIA.

El repositorio lo mantiene MedMLX, un proyecto centrado en inferencia médica on-device para chips de Apple. La relevancia actual reside en que permite ejecutar localmente modelos de generación de imagen médica que de otro modo requerirían infraestructura CUDA, lo que facilita investigación reproducible y experimentación con datos sintéticos sin depender de la nube.

La arquitectura subyacente es de difusión latente (VAE + UNet, con ControlNet en TC), derivada de los trabajos MAISI y MAISI-v2. El modelo es exclusivamente de inferencia (`inference: false` en la model card indica que no se distribuye para entrenamiento), con salida de imagen volumétrica y licencia restringida a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente: VAE de imagen + UNet; ControlNet adicional en la configuración CT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantización declarada) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-mixed-model-terms; MR general bajo NVIDIA OneWay Non-Commercial License; CT, máscaras y MR-Brain sujetos simultáneamente a Open Model License y Community Model License |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de difusión latente empleado en MAISI y MAISI-v2: un VAE comprime el volumen médico a un espacio latente y una UNet aprende a eliminar ruido en ese espacio. En la configuración de TC se añade un ControlNet que condiciona la generación a máscaras anatómicas emparejadas, y se incluye un UNet y VAE específicos para generar dichas máscaras. Las configuraciones de RM (general y cerebral) usan VAE y UNet propios; MR-Brain reutiliza además el VAE de CT.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO. La model card indica explícitamente que la conversión a MLX se realizó sin reentrenamiento, de modo que las capacidades y sesgos provienen íntegramente de los pesos originales de NVIDIA (NV-Generate-CT, NV-Generate-MR y NV-Generate-MR-Brain). Se incluyen artefactos auxiliares sin modificar: el mapeo de etiquetas `label_dict_124_to_132.json` (de NV-Generate-CTMR, Apache-2.0) y la base de datos de tamaños anatómicos `all_anatomy_size_conditions.json` (de NV-Generate-CT).

## Capacidades

- Generación incondicional de volúmenes de TC sintéticos.
- Generación de máscaras anatómicas de TC emparejadas mediante un UNet y VAE dedicados.
- Generación de volúmenes de RM general.
- Generación de volúmenes de RM cerebral (MR-Brain).
- Condicionamiento por anatomía y tamaño a través de la base de datos de condiciones anatómicas incluida.
- ControlNet para guiar la síntesis de TC a partir de máscaras de etiquetas.
- Ejecución nativa en Apple Silicon mediante MLX.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo generativo de imagen, no de lenguaje.
- No dispone de modo thinking, visión, audio ni capacidades multimodales de entrada.

## Casos de uso

- Aumento de datos para investigación en imagen médica: generar volúmenes sintéticos de TC o RM para ampliar conjuntos de entrenamiento en estudios de segmentación o detección, con la advertencia de que la salida sintética no es ground truth.
- Prototipado de pipelines de análisis médico en local: desarrolladores con Mac equipados con Apple Silicon pueden iterar sobre algoritmos de preprocesado o registro usando volúmenes sintéticos sin depender de GPU NVIDIA ni de servicios cloud.
- Docencia y formación: generar ejemplos anatómicos variados (la base de tamaños anatómicos permite modular dimensiones) para ilustrar casos en cursos de imagen médica.
- Evaluación de robustez de modelos: alimentar detectores o segmentadores con TC y RM sintéticos para medir su comportamiento ante distribuciones controladas.
- Investigación en generación condicionada: usar el ControlNet de TC y las máscaras emparejadas para estudiar cómo las etiquetas anatómicas influyen en la síntesis, replicando experimentos de MAISI-v2 en hardware de Apple.
- Pruebas de privacidad y anonimización: emplear datos totalmente sintéticos en lugar de datos de pacientes en entornos de desarrollo donde no se permite manipular información clínica real.
- Benchmarking de infraestructura MLX: comparar throughput y latencia de difusión latente en chips M-series frente a implementaciones CUDA de los mismos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM equivalente (memoria unificada en Apple Silicon): el repositorio ocupa 3,5 GB en safetensors; la memoria necesaria en inferencia será superior por los estados intermedios del VAE, UNet y ControlNet, pero no se ha publicado una cifra concreta.
- GPU recomendadas: el modelo está diseñado para Apple Silicon (MLX); no se distribuyen pesos para CUDA en este repositorio, aunque los originales de NVIDIA pueden ejecutarse en A100, H100 o RTX 4090 con sus propios frameworks.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no se especifica el mínimo exacto.
- Opciones de despliegue: paquete `mlx-generate-ctmr` (versión >= 0.5.2.post2) sobre MLX; descarga de pesos con `huggingface-hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-generate-ctmr (este) | no disponible | no aplica | TC, máscaras TC, RM, RM cerebral; MLX | NVIDIA mixed terms (restringida) | Hugging Face, MLX |
| nvidia/NV-Generate-CT | no disponible | no aplica | TC y máscaras TC | Open Model License / Community Model License | Hugging Face, CUDA |
| nvidia/NV-Generate-MR | no disponible | no aplica | RM general | OneWay Non-Commercial | Hugging Face, CUDA |
| nvidia/NV-Generate-MR-Brain | no disponible | no aplica | RM cerebral | NVIDIA mixed terms | Hugging Face, CUDA |

La comparativa se limita a los modelos upstream, ya que no se dispone de datos de benchmarks ni de parámetros para confrontarlos con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- No validado para uso clínico: la model card indica explícitamente que es para investigación y educación, y que la salida sintética no constituye ground truth.
- Licencia restrictiva: MR general es solo para investigación no comercial (NVIDIA OneWay Non-Commercial License). CT, máscaras emparejadas y MR-Brain están sujetos simultáneamente a la Open Model License y la Community Model License, con ambigüedad declarada por el propio autor hasta que NVIDIA aclare los términos del CT.
- La Community Model License restringe algunos usos de las salidas para desarrollar otros modelos de IA y condiciona el uso en producción; es necesario consultar los acuerdos antes de cualquier despliegue.
- Riesgo de alucinación anatómica: al ser un modelo generativo, puede producir estructuras plausibles pero inexistentes; no debe interpretarse como evidencia diagnóstica.
- Sesgos heredados de los datos de entrenamiento de NVIDIA, no documentados en la información disponible.
- Idioma: únicamente inglés en metadatos y documentación.
- Dependencia de Apple Silicon: los pesos son MLX y no funcionan directamente en CUDA sin reconversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No se dispone de información sobre cuantizaciones, por lo que el consumo de memoria real en producción debe medirse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/MedMLX/mlx-generate-ctmr
- Repositorio del paquete: https://github.com/MedMLX/mlx-generate-ctmr
- Paper MAISI-v2: https://arxiv.org/abs/2508.05772
- Paper MAISI: https://arxiv.org/abs/2409.11169
- Paper MedMLX (medRxiv): https://doi.org/10.64898/2026.10.28.26366762
- Modelo base NV-Generate-CT: https://huggingface.co/nvidia/NV-Generate-CT
- Modelo base NV-Generate-MR-Brain: https://huggingface.co/nvidia/NV-Generate-MR-Brain
- Repositorio NV-Generate-CTMR: https://github.com/NVIDIA-Medtech/NV-Generate-CTMR
- Licencia Open Model: https://huggingface.co/MedMLX/mlx-generate-ctmr/blob/main/LICENSE_NVIDIA_OPEN_MODEL.pdf
- Licencia Community Model: https://huggingface.co/MedMLX/mlx-generate-ctmr/blob/main/LICENSE_NVIDIA_COMMUNITY_MODEL.pdf
- Licencia OneWay Non-Commercial (MR): https://huggingface.co/MedMLX/mlx-generate-ctmr/blob/main/mr/NVIDIA-ONEWAY-NONCOMMERCIAL.pdf
