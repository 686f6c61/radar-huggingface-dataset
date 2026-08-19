# Aswenna/CornDiseaseVision

## Resumen

Aswenna/CornDiseaseVision es un modelo de visión por computador basado en una arquitectura Vision Transformer (ViT) con 85,8 millones de parámetros, publicado por el usuario Aswenna en Hugging Face en agosto de 2026. El nombre del modelo indica que está especializado en la detección de enfermedades del maíz a partir de imágenes de cultivos. Se enmarca dentro del ecosistema Aswenna, una plataforma agrícola inteligente orientada a pequeños agricultores de Sri Lanka, cuyo objetivo es digitalizar el diagnóstico fitosanitario y mejorar la trazabilidad de las explotaciones.

El modelo carece de model card, por lo que la información disponible es limitada: se sabe que es un ViT con pesos en formato F32 y que no está desplegado en ningún Inference Provider de Hugging Face. Su relevancia radica en la creciente demanda de herramientas de diagnóstico agrícola accesibles para regiones en desarrollo, donde el acceso a agrónomos especializados es limitado. Al tratarse de un modelo de tamaño contenido, puede ejecutarse en hardware modesto, lo que facilita su adopción en entornos de campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) |
| Parametros totales | 85.801.732 (85,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo F32) |
| Idiomas soportados | no aplica (procesa imagenes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Vision Transformer (ViT), que divide la imagen de entrada en parches de tamaño fijo y los procesa mediante capas de atención multi-cabeza, replicando el mecanismo de los transformers de texto pero aplicado a señales visuales. Con 85,8 millones de parámetros, se sitúa en el rango de un ViT de tamaño base o pequeño, similar a ViT-Base pero con una configuración reducida.

No se dispone de información sobre el dataset de entrenamiento, el número de imágenes utilizadas, la composición de las clases (qué enfermedades concretas detecta) ni si se aplicaron técnicas de fine-tuning, aumentación de datos o aprendizaje por transferencia desde un modelo preentrenado en ImageNet. Tampoco se documentan innovaciones técnicas particulares en la información disponible.

## Capacidades

- Clasificación de imágenes de hojas de maíz para detectar enfermedades, presumiblemente mediante clasificación de imagen única.
- Inferencia sobre imágenes de cultivos capturadas en campo, siempre que el dominio de entrenamiento sea representativo.
- Posibilidad de transfer learning: al ser un ViT, puede adaptarse mediante fine-tuning a otras tareas de visión agrícola (detección de plagas, evaluación de madurez, etc.).
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo puramente discriminativo de visión.

## Casos de uso

- Diagnóstico fitosanitario en campo: un agricultor fotografía una hoja de maíz con su teléfono móvil y el modelo clasifica si presenta alguna enfermedad, permitiendo una actuación temprana antes de que se propague.
- Integración en plataformas agrícolas digitales: el modelo puede incorporarse a la plataforma Aswenna u otras aplicaciones de agricultura de precisión para ofrecer recomendaciones automatizadas de tratamiento.
- Monitorización de cultivos a escala: mediante drones o cámaras fijas instaladas en parcelas, el modelo puede analizar imágenes periódicas para detectar focos de enfermedad y alertar al agricultor.
- Educación agrícola: utilizado como herramienta didáctica en escuelas de agronomía para que los estudiantes aprendan a identificar visualmente enfermedades del maíz.
- Investigación fitopatológica: apoyo a investigadores para cribar grandes volúmenes de imágenes de campo y priorizar muestras que requieran análisis de laboratorio.
- Validación de tratamientos: comparación de imágenes capturadas antes y después de aplicar fungicidas u otros productos, ayudando a evaluar la eficacia de los tratamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 85,8 M de parámetros en F32, los pesos ocupan aproximadamente 343 MB, por lo que cualquier GPU con al menos 1 GB de VRAM es suficiente para inferencia.
- GPU recomendadas: cualquier GPU de consumo (GTX 1060 6 GB, RTX 3060, RTX 4090) es válida; también puede ejecutarse en CPU con tiempos de inferencia aceptables para imágenes individuales.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede servirse con Hugging Face Transformers, ONNX Runtime, TorchServe o cualquier framework compatible con PyTorch.
- No se dispone de datos medidos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables específicos para detección de enfermedades del maíz en Hugging Face. Existen modelos genéricos de clasificación de plantas basados en el dataset PlantVillage, pero no se dispone de datos de rendimiento comparables para este modelo, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No existe model card, por lo que se desconocen los datos de entrenamiento, las clases soportadas, los posibles sesgos y las limitaciones específicas del modelo.
- La licencia no está especificada, lo que impide conocer si su uso comercial está permitido o si existen restricciones de redistribución.
- Al ser un modelo de visión sin capacidades de generación de texto, no puede explicar sus decisiones ni emitir recomendaciones por sí solo; necesita integrarse con un sistema que traduzca la clasificación en acciones.
- El riesgo de error de clasificación es real si las imágenes de entrada difieren del dominio de entrenamiento (iluminación, ángulo, variedad de maíz, etc.).
- No se especifican las enfermedades concretas que detecta ni el número de clases soportadas, lo que dificulta evaluar su adecuación a un caso de uso particular.
- El modelo no está desplegado en ningún Inference Provider de Hugging Face, por lo que requiere despliegue propio.

## Enlaces

- https://huggingface.co/Aswenna/CornDiseaseVision
- https://huggingface.co/Aswenna
- https://github.com/Wakka-Wakka/AswennaAI
- https://github.com/Informatic-Institute-of-Technology/aswenna
