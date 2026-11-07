# kritaphatson/thai_snake_image_classifier

## Resumen

El Thai snake image classifier es un modelo de clasificación de imágenes especializado en la identificación de 139 especies de serpientes tailandesas. Lo desarrolla el usuario kritaphatson y se distribuye a través de Hugging Face bajo licencia MIT en su versión raíz, aunque los checkpoints de referencia del benchmark derivan parcialmente de pesos con licencia CC-BY-NC-4.0. El modelo resuelve un problema de biodiversidad aplicada: la identificación automática de especies de serpientes, una tarea crítica en un país con alta incidencia de mordeduras de serpiente y donde distinguir especies venenosas de inofensivas puede ser determinante para el tratamiento médico.

Técnicamente se trata de un modelo de visión por computador basado en la librería `timm` (PyTorch Image Models), con arquitectura Swin Transformer según las etiquetas del repositorio, y un total de 86.805.973 parámetros. El repositorio contiene además un benchmark con once modelos finales que cubren nueve arquitecturas a 224 píxeles y ConvNeXt-V2-Base a 384 píxeles, entrenados con cross-entropy y con Seesaw loss, lo que lo convierte en un recurso de referencia para evaluación comparativa de clasificadores de especies.

Su relevancia actual radica en su carácter de benchmark reproducible: incluye configuraciones, puntuaciones sobre test bloqueado, código y predicciones en un repositorio de GitHub asociado, además de una demo interactiva en Hugging Face Spaces. No es un modelo de propósito general, sino una herramienta vertical para un dominio concreto con implicaciones sanitarias y de conservación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer (librería `timm`); el benchmark incluye nueve arquitecturas a 224 px y ConvNeXt-V2-Base a 384 px |
| Parámetros totales | 86.805.973 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT en la raíz del repositorio; los checkpoints ConvNeXt-V2 derivan de pesos CC-BY-NC-4.0 y son de uso no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo raíz emplea una arquitectura Swin Transformer, un transformer jerárquico con atención por ventanas desplazadas diseñado para visión por computador. El repositorio incluye además un benchmark (`benchmark_v4/`) con once modelos finales para 139 especies de serpientes tailandesas: nueve arquitecturas a resolución de 224 píxeles y ConvNeXt-V2-Base a 384 píxeles, cada una entrenada con dos funciones de pérdida distintas, cross-entropy y Seesaw loss. Esta última está diseñada para manejar desequilibrios de clase, algo esperable en un dataset de biodiversidad donde algunas especies tendrán muchas menos imágenes que otras.

No se dispone en la información proporcionada del número de tokens o imágenes de entrenamiento, de la composición exacta del dataset ni de si se aplicaron técnicas de aumento de datos, destilación o ajuste fino adicional. Tampoco se detalla si hubo validación cruzada o cómo se definió el test bloqueado sobre el que se reportan las puntuaciones. La información disponible indica que los registros, predicciones y código están en el repositorio de GitHub asociado, en la carpeta `benchmark/`, que sería la fuente para obtener esos detalles.

## Capacidades

- Clasificación de imágenes de serpientes en 139 especies tailandesas.
- Identificación de especies a partir de fotografías, con resolución de entrada de 224 píxeles (arquitecturas del benchmark) o 384 píxeles (ConvNeXt-V2-Base).
- Soporte de inferencia mediante la librería `timm` y pesos en formato safetensors.
- Integración con TensorBoard para seguimiento de entrenamiento (según etiquetas del repositorio).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es un clasificador de imágenes puro.
- Demo interactiva disponible en Hugging Face Spaces para prueba directa.

## Casos de uso

- Identificación de especies en campo: un herpetólogo o guarda forestal fotografía una serpiente y el modelo devuelve la especie probable entre las 139 clases, útil para inventarios de biodiversidad y para distinguir especies venenosas de inofensivas en contextos de riesgo sanitario.
- Apoyo a servicios de toxicología y urgencias: ante una mordedura, la identificación rápida de la especie a partir de una foto puede orientar la elección del antiveneno, aunque el modelo no sustituye la evaluación clínica.
- Educación y divulgación: la demo en Hugging Face Spaces permite a estudiantes y público general comprobar la clasificación de fotos y aprender a distinguir especies, con la ventaja de estar entrenada específicamente para la fauna tailandesa.
- Investigación en biodiversidad: el benchmark con once modelos y dos funciones de pérdida sirve como referencia reproducible para comparar arquitecturas (Swin, ConvNeXt-V2 y otras) en tareas de clasificación de especies con clases desequilibradas.
- Monitorización con cámaras trampa: integrado en un pipeline de procesamiento por lotes, el modelo puede etiquetar automáticamente imágenes capturadas en campo y filtrar las que contienen serpientes para revisión posterior por expertos.
- Aplicaciones móviles de citizen science: al ser un modelo de 86,8 M de parámetros y pesos safetensors, puede desplegarse en servidores modestos o convertirse a formatos ligeros para apps que ayuden a ciudadanos a reportar avistamientos con identificación asistida.
- Control de tráfico de fauna y aduanas: clasificación rápida de imágenes de especímenes o decomisos para verificar especies declaradas, apoyando la labor de inspectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los checkpoints del benchmark incluyen "locked-test scores" y que las predicciones y configuraciones están en la carpeta `benchmark/` del repositorio de GitHub, pero los valores numéricos no se han proporcionado en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 86,8 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 347 MB; en FP16, unos 174 MB; en INT8, unos 87 MB. A esto hay que sumar la memoria de activaciones, que para una imagen de 224×224 es moderada (típicamente menos de 1 GB en total en FP16).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060, RTX 4090 o incluso una GPU integrada con soporte CUDA puede ejecutar el modelo. Para despliegues en servidor, A100 o H100 no son necesarias pero funcionarían sin problema.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` con PyTorch es la vía natural; también es posible exportar a ONNX o TorchScript para servir con ONNX Runtime o Triton. No se indica soporte nativo para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thai snake image classifier | 86,8 M | Imagen 224 px (384 px en ConvNeXt-V2-Base) | Clasificación de 139 especies de serpientes tailandesas | MIT (raíz); CC-BY-NC-4.0 en checkpoints ConvNeXt-V2 | Hugging Face, GitHub, demo en Spaces |
| Otros clasificadores `timm` genéricos (p. ej. Swin-Base) | ~88 M | Imagen 224 px | Clasificación ImageNet (1000 clases) | Apache 2.0 o MIT según variante | Hugging Face, `timm` |
| Modelos de clasificación de especies de iNaturalist | no disponible | Imagen variable | Clasificación de especies a gran escala | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, tarea y licencia; para una comparación de precisión habría que consultar las puntuaciones del test bloqueado en el repositorio de GitHub del autor.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para 139 especies de serpientes tailandesas; no reconoce serpientes de otras regiones ni otras clases de animales, y probablemente asignará cualquier imagen de serpiente a una de sus 139 clases aunque no corresponda.
- Riesgo de alucinación de clase: al ser un clasificador cerrado, siempre devolverá una etiqueta con cierta confianza, incluso ante imágenes ambiguas, borrosas o de especies no vistas. No debe usarse como única fuente para decisiones médicas o de seguridad.
- Desequilibrio de clases: la presencia de Seesaw loss en el benchmark sugiere que el dataset tiene clases con pocas muestras, lo que puede afectar a la precisión en especies raras.
- Licencia mixta: aunque la raíz del repositorio es MIT, los checkpoints ConvNeXt-V2 derivan de pesos CC-BY-NC-4.0 y son de uso no comercial. Cualquier uso comercial debe verificar qué checkpoint concreto se emplea y su licencia.
- Sesgos geográficos y de distribución: el modelo se ha entrenado con imágenes de Tailandia; el rendimiento puede degradarse con fotos de otras regiones, condiciones de iluminación distintas o especímenes juveniles.
- Sin información sobre el dataset de entrenamiento: no se detalla el número de imágenes, la procedencia ni el proceso de anotación, lo que dificulta evaluar la robustez y los posibles sesgos.
- No apto para diagnóstico médico: la identificación de especies con fines clínicos debe ser confirmada por un experto; el modelo es una ayuda, no un sustituto.
- Idiomas: al ser un modelo de visión, no procesa texto; las etiquetas de clase están presumiblemente en inglés o tailandés, pero no se especifica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kritaphatson/thai_snake_image_classifier
- Demo interactiva: https://huggingface.co/spaces/kritaphatson/thai-snake-image-classifier-app
- Repositorio de GitHub con registros, predicciones y código: https://github.com/kritsong/thai_snake_classification
- Perfil del autor en Hugging Face: https://huggingface.co/kritaphatson/models
