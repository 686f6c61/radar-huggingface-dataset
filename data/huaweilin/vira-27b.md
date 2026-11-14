# huaweilin/ViRA-27B

## Resumen

ViRA-27B es un modelo visión-lenguaje de tipo agente visual desarrollado por huaweilin, presentado en el artículo "ViRA: Toward Ultra-High-Resolution Visual Agents via Cross-Input Relative Policy Optimization". Se construye sobre Qwen/Qwen3.8-27B mediante aprendizaje por refuerzo con el método CrossRPO, y está diseñado para responder preguntas sobre detalles pequeños en fotografías de alta resolución. El modelo primero observa la imagen completa con un presupuesto de píxeles determinado, después amplía las regiones que necesita mediante una herramienta de zoom y finalmente responde.

La relevancia del modelo radica en su estrategia de entrenamiento: CrossRPO opera sobre conjuntos de contraste (contrast sets), es decir, K versiones de una misma fotografía que difieren únicamente en un objeto pequeño, con una pregunta y una respuesta correcta distinta para cada versión. Un agente que responde adivinando a partir del resto de la imagen daría la misma respuesta en todas las versiones, por lo que no puede resolver el conjunto sin leer realmente el objeto en cuestión. Esto fuerza al modelo a aprender a localizar y ampliar detalles finos de forma efectiva.

El modelo cuenta con 27.356.728.560 parámetros totales (según safetensors), soporta imágenes de hasta 16,8 MP (16.384 tokens visuales de 32 x 32 px) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 54,7 GB y el modelo está pensado exclusivamente para inglés. Su modo de razonamiento (thinking mode) está desactivado por defecto, aunque el agente escribe su razonamiento dentro de etiquetas `<think>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basada en Qwen/Qwen3.8-27B |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ViRA-27B parte de Qwen/Qwen3.8-27B, un modelo visión-lenguaje, y se afina mediante aprendizaje por refuerzo con CrossRPO (cross-input relative policy optimization), con λ = 0,5 y una recompensa basada en la corrección de la respuesta. El entrenamiento utiliza 3.401 elementos del dataset ViRA-Train (columna `in_vira27b_train`): 1.338 conjuntos de contraste y 2.063 imágenes individuales, en una sola pasada. En cada paso se usan 16 elementos y 12 rollouts por elemento, con un presupuesto de píxeles muestreado de forma log-uniforme entre 0,5 y 16,8 MP. El optimizador es AdamW con tasa de aprendizaje 1e-6.

La innovación técnica principal es el entrenamiento sobre conjuntos de contraste: para cada conjunto, el modelo debe responder correctamente a la pregunta asociada a cada variante de la imagen, lo que impide resolver la tarea mediante atajos contextuales. El agente interactúa con la imagen a través de la herramienta `image_zoom_in_tool`, que recibe un `bbox_2d` en escala 0-1000 sobre la imagen indicada por `source` (`original_image` para la primera vista u `observation_k` para el k-ésimo recorte). La imagen de entrada más grande soportada es de 16,8 MP, equivalentes a 16.384 tokens visuales de 32 x 32 px. El modo de razonamiento está desactivado, pero el agente escribe su razonamiento dentro de etiquetas `<think>`.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes de alta resolución.
- Respuesta a preguntas sobre detalles finos en fotografías de hasta 16,8 MP.
- Uso de herramienta de zoom (`image_zoom_in_tool`) con coordenadas `bbox_2d` en escala 0-1000 y selección de fuente (`original_image` u `observation_k`).
- Razonamiento multi-paso: el agente decide qué regiones ampliar y encadena recortes sucesivos antes de responder.
- Razonamiento explícito dentro de etiquetas `<think>` (modo thinking desactivado por defecto).
- Capacidades de agente visual con planificación de recortes y presupuesto de píxeles controlable.
- Soporte multilingüe limitado al inglés según la model card.
- No se documentan capacidades de tool calling genérico, audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Inspección de imágenes satelitales o aéreas: el modelo puede localizar objetos pequeños (vehículos, infraestructuras, cambios en el terreno) ampliando regiones concretas con la herramienta de zoom, gracias a su soporte de hasta 16,8 MP y a su entrenamiento específico en detalles finos.
- Verificación de documentos y facturas de alta resolución: permite leer campos pequeños, sellos o códigos en escaneos densos ampliando las zonas relevantes en lugar de procesar toda la imagen a baja resolución.
- Control de calidad industrial: inspección de defectos superficiales en imágenes de alta resolución de componentes, donde el agente amplía la zona sospechosa y confirma el defecto antes de emitir un veredicto.
- Análisis de imágenes médicas o de laboratorio (con las debidas salvaguardas): localización de estructuras pequeñas en imágenes de alta resolución mediante recortes sucesivos guiados por el razonamiento del agente.
- Automatización de tareas de observación (remote sensing, monitorización): integración en pipelines donde el modelo recibe una imagen y un presupuesto de píxeles, y devuelve respuestas verificables sobre elementos pequeños, con la posibilidad de ajustar el presupuesto entre 0,5 y 16,8 MP según latencia y coste.
- Investigación en agentes visuales: el modelo sirve como referencia para estudiar políticas de zoom y entrenamiento por refuerzo con conjuntos de contraste, usando el código público de entrenamiento, evaluación e inferencia.
- Evaluación comparativa de modelos de alta resolución: puede utilizarse junto con ViRA-Bench y ViRA-Bench-Real para medir la capacidad de resolver detalles finos en imágenes reales y sintéticas.

## Benchmarks y rendimiento

Resultados de precisión (%) en ViRA-Bench (762 conjuntos de contraste) y ViRA-Bench-Real (78 conjuntos). Un conjunto se considera resuelto solo si se responden correctamente la imagen original y ambas variantes. El presupuesto de píxeles limita la primera vista y cada recorte. En negrita, el mejor de cada fila.

| Benchmark | Presupuesto | Qwen3.5-9B + tool | ViRA-9B | Qwen3.8-27B + tool | **ViRA-27B** | Claude Haiku 5.5 | GPT-6-Luna |
|---|---|---|---|---|---|---|---|
| ViRA-Bench | 0,5 MP | 21,1 | 38,7 | 26,5 | **64,0** | 58,8 | 46,2 |
|  | 1 MP | 26,2 | 46,9 | 33,3 | **68,4** | 59,6 | 47,4 |
|  | 2 MP | 31,4 | 55,6 | 41,1 | **71,2** | 63,4 | 56,4 |
|  | 4 MP | 34,4 | 57,5 | 44,0 | **72,9** | 63,3 | 55,6 |
|  | Max | 34,6 | 63,3 | 48,6 | **71,5** | 63,3 | 26,6 |
| ViRA-Bench-Real | 0,5 MP | 10,3 | 31,2 | 20,5 | 72,6 | **73,1** | 52,6 |
|  | 1 MP | 16,7 | 49,6 | 30,8 | **75,2** | 66,7 | 43,6 |
|  | 2 MP | 20,5 | 57,7 | 33,3 | **79,1** | 69,2 | 51,3 |
|  | 4 MP | 23,1 | 68,8 | 44,9 | **80,8** | 67,9 | 50,0 |
|  | Max | 34,6 | **77,4** | 59,0 | 76,5 | 67,9 | 47,4 |

Precisión (%) en benchmarks generales de imagen única a 1 MP y a la resolución máxima de cada modelo. En negrita, el mejor de cada fila.

| Benchmark | Presupuesto | Qwen3.5-9B + tool | ViRA-9B | Qwen3.8-27B + tool | **ViRA-27B** | Claude Haiku 5.5 | GPT-6-Luna |
|---|---|---|---|---|---|---|---|
| V* | 1 MP | 83,8 | 92,0 | 84,8 | **95,5** | 89,5 | 84,3 |
|  | Max | 90,6 | 96,2 | 92,1 | **97,6** | 94,2 | 85,9 |
| HR-Bench 4K | 1 MP | 76,9 | 87,5 | 84,0 | 91,0 | **91,8** | 91,2 |
|  | Max | 82,5 | 91,0 | 88,5 | **92,0** | 91,9 | 89,2 |
| HR-Bench 8K | 1 MP | 70,6 | 84,7 | 75,9 | **90,5** | 90,2 | 85,4 |
|  | Max | 77,1 | 90,1 | 81,4 | 91,0 | **92,2** | 66,6 |
| MME-RealWorld-Lite | 1 MP | 55,0 | **63,6** | 55,6 | 63,4 | 57,9 | 57,6 |
|  | Max | 57,5 | **65,3** | 59,8 | 64,5 | 60,0 | 55,5 |
| TreeBench | 1 MP | 48,9 | 56,3 | 52,1 | **67,4** | 63,7 | 61,5 |
|  | Max | 49,4 | 57,0 | 55,6 | **68,1** | 66,4 | 62,2 |
| O3-Bench | 1 MP | 34,5 | 50,4 | 47,2 | 64,3 | **78,3** | 76,5 |
|  | Max | 45,2 | 67,0 | 59,7 | 84,1 | **85,2** | 80,3 |
| MMStar | Max | 70,7 | 77,1 | 77,0 | **82,1** | 79,0 | 79,3 |
| HallusionBench | Max | 73,2 | 79,6 | 80,3 | **86,0** | 83,9 | 81,4 |

La etiqueta "+ tool" indica el modelo base con una herramienta de zoom en formato DeepEyes (caja sobre la foto, recortes no ampliados). Claude Haiku 5.5 y GPT-6-Luna se ejecutan con la herramienta de zoom de ViRA a su nivel de razonamiento más alto. La decodificación es greedy. Los números de ViRA en ViRA-Bench, ViRA-Bench-Real, V* y HR-Bench son medias de tres ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 27.356 millones de parámetros en precisión de 16 bits requiere aproximadamente 54,7 GB de pesos, lo que excede la memoria de GPUs de consumo individuales.
- GPU recomendadas: no disponible de forma explícita. Por tamaño, se necesitan GPUs de centro de datos con memoria suficiente (por ejemplo, A100 de 80 GB o H100) para inferencia en precisión completa; no se confirma en la información disponible.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo con los datos disponibles; se requeriría cuantización o reparto entre varias GPUs, aunque no se documentan cuantizaciones soportadas.
- Opciones de despliegue: la model card indica compatibilidad con transformers y con endpoints compatibles (`endpoints_compatible`). No se documentan vLLM, llama.cpp, Ollama ni TGI de forma explícita.
- Latencia y throughput: no disponibles. El coste depende del presupuesto de píxeles (0,5 a 16,8 MP) y del número de recortes que realice el agente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ViRA-Bench (Max) | ViRA-Bench-Real (Max) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ViRA-27B | 27,36 B | no disponible | 71,5 | 76,5 | Apache 2.0 | Hugging Face |
| ViRA-9B | no disponible | no disponible | 63,3 | 77,4 | no disponible | Hugging Face |
| Qwen3.8-27B + tool | 27 B (base) | no disponible | 48,6 | 59,0 | no disponible | Hugging Face |
| Claude Haiku 5.5 | no disponible | no disponible | 63,3 | 67,9 | propietaria | API |
| GPT-6-Luna | no disponible | no disponible | 26,6 | 47,4 | propietaria | API |

ViRA-27B supera a su modelo base con herramienta de zoom en ViRA-Bench (71,5 frente a 48,6 en el presupuesto máximo) y en ViRA-Bench-Real (76,5 frente a 59,0), y también supera a Claude Haiku 5.5 y GPT-6-Luna en la mayoría de benchmarks de alta resolución, con la excepción de O3-Bench y algunos casos puntuales de HR-Bench 8K y MME-RealWorld-Lite.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se documentan capacidades multilingües.
- Está especializado en preguntas sobre detalles en imágenes de alta resolución; su rendimiento en tareas generales de texto o razonamiento no se documenta.
- Riesgo de alucinación inherente a los modelos visión-lenguaje; no se han publicado análisis específicos de sesgos en la información disponible.
- El modo thinking está desactivado por defecto; el razonamiento se escribe en etiquetas `<think>`, lo que puede requerir gestión específica en producción.
- El uso de la herramienta de zoom requiere implementar el protocolo `image_zoom_in_tool` con coordenadas en escala 0-1000 y fuentes `original_image`/`observation_k`; una integración incorrecta degrada el rendimiento.
- El presupuesto de píxeles afecta directamente a la precisión y al coste computacional; debe configurarse según el caso de uso (los resultados varían entre 0,5 y 16,8 MP).
- El modelo tiene pocas descargas (37) y ningún "like" en el momento de la consulta, lo que sugiere una adopción limitada y poca validación externa.
- No se documentan cuantizaciones oficiales ni requisitos de hardware, lo que dificulta el despliegue en entornos con recursos limitados.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.8-27B y del dataset ViRA-Train.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huaweilin/ViRA-27B
- Modelo ViRA-9B: https://huggingface.co/huaweilin/ViRA-9B
- Código (entrenamiento, evaluación e inferencia): https://github.com/huawei-lin/ViRA
- Dataset ViRA-Train: https://huggingface.co/datasets/huaweilin/ViRA-Train
- Benchmark ViRA-Bench: https://huggingface.co/datasets/huaweilin/ViRA-Bench
- Colección ViRA: https://huggingface.co/collections/huaweilin/vira
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia Apache 2.0 del proyecto: https://github.com/huawei-lin/ViRA/blob/main/LICENSE
