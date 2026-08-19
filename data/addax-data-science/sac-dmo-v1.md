# Addax-Data-Science/SAC-DMO-v1

## Resumen

El modelo `Addax-Data-Science/SAC-DMO-v1` es un repositorio publicado en Hugging Face por la organización Addax Data Science, una empresa especializada en soluciones de inteligencia artificial para ecología y conservación de la naturaleza. Según la información disponible, se trata de un modelo de código abierto redistribuido para su integración con la herramienta AddaxAI, un sistema de análisis de imágenes de cámaras trampa que identifica animales en fotografías y vídeos. El repositorio enlazado en la model card, `small-animal-classifier` en GitHub, sugiere que el modelo está orientado a la clasificación de especies de animales pequeños, aunque no se proporcionan detalles técnicos adicionales.

El tamaño del repositorio es de 1,2 GB, lo que indica que probablemente se trata de un modelo de visión por computadora (clasificación de imágenes) de tamaño moderado. Sin embargo, la model card no incluye información sobre arquitectura, parámetros, contexto ni datos de entrenamiento. La licencia declarada es Apache 2.0, según el enlace al repositorio original. Este modelo es relevante para el ámbito de la ecología y la monitorización de fauna, ya que permite automatizar el análisis de grandes volúmenes de imágenes de cámaras trampa, una tarea tradicionalmente manual y costosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 (según el repositorio enlazado) |
| Formato de pesos | no disponible (probablemente safetensors o pytorch, no confirmado) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo, los datos de entrenamiento, el número de tokens (en caso de ser multimodal) ni las técnicas de optimización utilizadas. El repositorio enlazado en GitHub (`small-animal-classifier`) podría contener detalles, pero no se ha accedido a su contenido. La model card solo indica que el modelo es redistribuido por Addax Data Science para su uso con AddaxAI, manteniendo la licencia original. No hay datos sobre si se empleó aprendizaje supervisado, transferencia de aprendizaje, o si se utilizaron técnicas como fine-tuning sobre arquitecturas preentrenadas.

## Capacidades

- Clasificación de imágenes de animales pequeños, según el nombre del repositorio enlazado (`small-animal-classifier`).
- Integración con la plataforma AddaxAI para el análisis de cámaras trampa, lo que sugiere capacidades de detección y reconocimiento de especies en imágenes.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales adicionales.
- No se confirma si el modelo es capaz de procesar vídeo o solo imágenes estáticas.

## Casos de uso

- Monitorización de fauna en estudios ecológicos: el modelo puede clasificar automáticamente las especies presentes en imágenes de cámaras trampa, reduciendo el tiempo de revisión manual por parte de los investigadores.
- Conservación de especies amenazadas: al identificar animales pequeños (roedores, mustélidos, etc.) en áreas protegidas, permite estimar poblaciones y detectar patrones de actividad.
- Gestión de conflictos con fauna: en entornos agrícolas o periurbanos, el modelo puede ayudar a identificar especies problemáticas en imágenes de sensores.
- Educación y divulgación: clasificación de imágenes de fauna para proyectos ciudadanos de ciencia.
- Automatización de pipelines de datos: integración con flujos de trabajo que requieren etiquetado automático de imágenes para bases de datos ecológicas.
- Auditoría de biodiversidad: análisis de grandes conjuntos de imágenes históricas para evaluar cambios en la composición de especies.

Nota: estos casos de uso se deducen del contexto (clasificador de animales para cámaras trampa) y no están confirmados por documentación oficial del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre precisión, recall, F1 u otras métricas en conjuntos de referencia como iNaturalist, COCO u otros específicos de fauna.

## Requisitos de hardware

- No se dispone de información sobre requisitos de VRAM, GPU recomendadas ni opciones de despliegue.
- Dado el tamaño del repositorio (1,2 GB), es plausible que el modelo pueda ejecutarse en GPUs consumer con al menos 4-6 GB de VRAM, pero esto es una especulación no confirmada.
- No se conocen herramientas de despliegue específicas (vLLM, llama.cpp, Ollama, TGI) porque se trata de un modelo de visión, no de lenguaje.
- No hay datos sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (clasificadores de fauna). Existen modelos como MegaDetector (detección de animales en cámaras trampa) o clasificadores basados en ResNet entrenados sobre iNaturalist, pero no se puede establecer una comparación rigurosa sin datos de rendimiento del modelo evaluado.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de clasificación de fauna, es posible que presente sesgos hacia especies o entornos representados en sus datos de entrenamiento, que no se han hecho públicos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede haber errores de clasificación en imágenes con condiciones adversas (iluminación, oclusión, especies similares).
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe verificar que el modelo original (en el repositorio de GitHub) cumpla con los mismos términos, ya que la redistribución puede tener condiciones adicionales.
- No hay información sobre el mantenimiento del modelo, actualizaciones o soporte.
- El modelo está pensado para un dominio específico (animales pequeños en cámaras trampa); su uso fuera de ese contexto probablemente degrade el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Addax-Data-Science/SAC-DMO-v1
- Repositorio original (GitHub): https://github.com/agentmorris/small-animal-classifier
- Organización Addax Data Science: https://huggingface.co/Addax-Data-Science
- Sitio web de Addax Data Science: https://addaxdatascience.com/
- Herramienta AddaxAI: https://addaxdatascience.com/addaxai/
- Repositorio de AddaxAI en GitHub: https://github.com/PetervanLunteren/AddaxAI
