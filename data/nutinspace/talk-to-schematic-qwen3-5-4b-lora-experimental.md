# nutinspace/talk-to-schematic-qwen3.5-4b-lora-experimental

## Resumen
El modelo es un adaptador LoRA de rango 16 sobre el modelo base Qwen3.5-4B, desarrollado por el usuario nutinspace. Se trata de un adaptador experimental de visión-lenguaje entrenado para conversaciones sobre esquemáticos electrónicos con atribución de fuentes. Resuelve la necesidad de interactuar con esquemáticos electrónicos mediante lenguaje natural, permitiendo consultar valores de componentes, pines y otras características visuales. Su relevancia radica en que explora el ajuste fino multimodal sobre un modelo base de 4B parámetros, aunque el propio autor advierte que no está cualificado para validación de ingeniería. El adaptador tiene un tamaño de repositorio de 0.2 GB y se distribuye bajo la librería PEFT.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre Qwen3.5-4B; el modelo base es de tipo visión-lenguaje (pipeline image-text-to-text). No se especifican detalles de la arquitectura interna del base (transformer, MoE, etc.). |
| Parámetros totales | Aproximadamente 4B en el modelo base (según el nombre Qwen3.5-4B); el adaptador LoRA añade parámetros no cuantificados (repositorio de 0.2 GB). |
| Parámetros activos | No aplica (no es un modelo MoE). |
| Longitud de contexto | No disponible para inferencia; durante el entrenamiento se usó una longitud máxima de secuencia de 8192 tokens. |
| Tipos de cuantización | No disponible; el entrenamiento se realizó en bf16 LoRA. |
| Idiomas soportados | Inglés (en). |
| Licencia | No disponible en la información proporcionada. El modelo base se registra como Apache-2.0 y el corpus fuente como CC BY-SA 3.0. |
| Formato de pesos | safetensors (adaptador LoRA). |

## Arquitectura y entrenamiento
El adaptador se construye sobre una instantánea fijada de Qwen3.5-4B en la revisión `3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636`, con ajuste fino conjunto de visión y lenguaje. Se trata de un LoRA de rango 16 en bf16, entrenado con semilla 3407, tasa de aprendizaje 0,0001, tres épocas, acumulación de gradiente 4, longitud máxima de secuencia de 8192 tokens y tamaño máximo de imagen de 1024 píxeles. El entorno de entrenamiento empleó Unsloth 2026.8.22, Transformers 5.5.0, TRL 0.23.1, PEFT 0.18.1 y Torch 2.11.0+cu130 sobre una NVIDIA RTX 4090. No se menciona el uso de RLHF o DPO.

El corpus de entrenamiento procede del conjunto atribuido de esquemáticos Adafruit EAGLE. La partición de entrenamiento contiene 173 conversaciones y 866 turnos de asistente; la de validación, 26 conversaciones y 130 turnos. Las familias de placas se mantienen en particiones disjuntas. El entrenamiento combina vistas asistidas por evidencia nativa (con hechos extraídos de componentes y redes) y vistas solo de imagen. El autor advierte que el éxito en las vistas asistidas no demuestra reconocimiento independiente de cableado. La vista solo de imagen cubre la búsqueda de valores visibles y el rechazo de hechos no soportados.

## Capacidades
- Generación de texto conversacional sobre esquemáticos electrónicos.
- Comprensión de imágenes de esquemáticos (pipeline image-text-to-text).
- Lectura de valores de componentes visibles (value lookup).
- Identificación de pines (pin F1 del 100% en evaluación con evidencia asistida).
- Rechazo de hechos no soportados (refusal accuracy del 100% en las pruebas realizadas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente inglés.
- Capacidad especial: modo de razonamiento con evidencia asistida, en el que se proporcionan hechos extraídos de componentes o redes.

## Casos de uso
- Asistencia en lectura de esquemáticos electrónicos: el modelo puede responder preguntas sobre valores de componentes visibles en una imagen de esquemático, aunque con una precisión del 67,5% en la prueba solo de imagen.
- Extracción de valores de componentes en documentación técnica: integrarlo en un pipeline que procese imágenes de esquemáticos para extraer valores como resistencias o condensadores, con verificación humana debido a errores en valores similares (por ejemplo, 10K en lugar de 49,9K o 47K).
- Identificación de pines en diagramas: con evidencia asistida alcanza un pin F1 del 100%, útil para tareas de auditoría donde se disponga de metadatos extraídos.
- Rechazo controlado de consultas no soportadas: el modelo puede negarse a responder a hechos no soportados por la imagen, lo que ayuda a evitar alucinaciones en entornos de ingeniería.
- Prototipado de asistentes conversacionales para ingenieros electrónicos: permite conversaciones multi-turno (hasta 8192 tokens) sobre un esquemático, aunque solo en inglés.
- Investigación en adaptación multimodal: sirve como ejemplo de fine-tuning LoRA de rango 16 sobre un modelo de 4B para visión-lenguaje, reproducible con Unsloth en una RTX 4090.
- Validación de valores en control de calidad: puede usarse como primera pasada para detectar discrepancias en valores, pero requiere revisión humana por la tasa de error del 32,5% en solo imagen.
- Asistencia a la documentación de proyectos: generar descripciones de esquemáticos a partir de imágenes, con la salvedad de que no está cualificado para sign-off.

## Benchmarks y rendimiento
Los resultados publicados por el autor son métricas deterministas sobre conjuntos de prueba pequeños y fijos. No constituyen prueba de corrección general.

| Prueba | Resultado |
|---|---|
| Evidencia asistida, 20 placas held-out, historial gold (120 turnos) | Precisión de valores 100%; pin F1 100%; precisión de rechazo 100% |
| Solo imagen, 80 turnos | Precisión de valores 67,5%; precisión de rechazo 100% |

Comparación base frente a adaptador en lectura de valores solo con imagen:

| Prueba | Modelo base | Adaptador |
|---|---:|---:|
| Held-out test, historial gold | 26/40 (65%) | 27/40 (67,5%) |
| Validación, historial gold | 9/26 (34,6%) | 12/26 (46,2%) |

Selección de resolución en validación con el mismo adaptador e imágenes originales:

| Resolución | Precisión de valores | Rechazos |
|---|---:|---:|
| 1024 px | 12/26 | 26/26 |
| 1536 px | 22/26 | 26/26 |
| 2048 px | 24/26 | 26/26 |

Una ejecución de validación separada con render corregido v3 a 2048 px obtuvo 23/26 en valores y 26/26 en rechazos; la geometría corregida no mejoró la puntuación. En la cola completa de 720 turnos base/adaptador, el adaptador no tuvo fallos de generación; el base tuvo un fallo en una generación de prueba con evidencia asistida, que se mantuvo en la puntuación.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El adaptador ocupa 0,2 GB; el modelo base Qwen3.5-4B requiere VRAM adicional (aproximadamente 8 GB en bf16 para los 4B parámetros, más el codificador de visión, aunque no se especifica).
- GPU recomendadas: no disponible. El entrenamiento se realizó en una NVIDIA RTX 4090.
- ¿Cabe en GPU de consumo? No se especifica. Por el tamaño del modelo base (4B), es probable que quepa en GPUs con 8-12 GB de VRAM en cuantizaciones de 8 o 4 bits, pero no hay confirmación oficial.
- Opciones de despliegue: el autor indica usar el cargador de despliegue de Unsloth del repositorio, con un procesador capaz de imágenes y la plantilla de chat proporcionada. No se mencionan vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
- Comparación con el modelo base sin adaptador (Qwen3.5-4B): los resultados se incluyen en la tabla de benchmarks. El adaptador mejora ligeramente la lectura de valores en solo imagen (27/40 frente a 26/40 en held-out test) y en validación (12/26 frente a 9/26).
- Otras alternativas de la misma categoría (modelos visión-lenguaje de aproximadamente 4B parámetros orientados a esquemáticos): no disponible en la información proporcionada.

## Limitaciones y advertencias
- Checkpoint experimental: la puerta de liberación solo de imagen falló.
- Precisión de valores en solo imagen: 67,5% en el conjunto de prueba; errores como sustituir 10K por 49,9K o 47K.
- Métricas deterministas con limitaciones léxicas; requieren inspección de las respuestas.
- Corpus pequeño (173 conversaciones de entrenamiento) que no establece competencia general en revisión de diseño.
- No soporta mediciones potenciadas, valores de componentes ocultos ni formatos de esquemático arbitrarios.
- No cualificado para sign-off de ingeniería.
- Solo inglés.
- Licencia no especificada; el corpus fuente es CC BY-SA 3.0, lo que puede afectar a la redistribución.
- No se incluyen pesos del modelo base ni imágenes fuente en el adaptador.
- Posibles alucinaciones en valores no visibles o no soportados por la imagen.

## Enlaces
- HuggingFace: https://huggingface.co/nutinspace/talk-to-schematic-qwen3.5-4b-lora-experimental
- Instrucciones del proyecto en GitHub: https://github.com/tkarcheski/talk-to-schematic-unsloth/tree/codex/production-schematic-model
- Inventario de fuentes (Adafruit EAGLE): https://github.com/tkarcheski/talk-to-schematic-unsloth/blob/codex/production-schematic-model/corpora/adafruit-120.json
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
