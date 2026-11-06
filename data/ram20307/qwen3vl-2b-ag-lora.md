# Ram20307/qwen3vl-2b-ag-lora

## Resumen

`qwen3vl-2b-ag-lora` es un adaptador LoRA entrenado sobre el modelo base multimodal Qwen3-VL-2B-Instruct (2.000 millones de parámetros, familia Qwen3-VL de Alibaba). El adaptador especializa al modelo en una tarea concreta de visión por computador: la extracción de relaciones persona-objeto en forma de grafo de escena (scene graph), emitiendo JSON estructurado con los objetos visibles relacionados con una persona según tres tipos de relación (atención, espacial y contacto). Lo publica el usuario Ram20307 en Hugging Face bajo licencia Apache 2.0.

El modelo resuelve un problema de percepción estructurada: dado un fotograma, generar una representación legible por máquina de las relaciones entre una persona y los objetos de su entorno, en lugar de texto libre. Esto lo hace útil para pipelines de análisis de vídeo, robótica o accesibilidad, donde se necesita salida parseable y no descripciones narrativas. El entrenamiento se realizó sobre aproximadamente 3.900 fotogramas del dataset Action Genome (derivado de 500 vídeos de Charades), en precisión bf16.

Es relevante ahora porque demuestra el patrón de especialización de modelos visión-lenguaje pequeños (2B) mediante LoRA para tareas de percepción simbólica, un enfoque de bajo coste computacional que permite desplegar extracción de scene graphs en hardware modesto. No obstante, el propio autor advierte que los datos de entrenamiento (Action Genome y Charades) tienen licencia solo para investigación no comercial, lo que condiciona el uso del adaptador más allá de ese ámbito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-2B-Instruct (transformer multimodal visión-lenguaje) |
| Parámetros totales | 2.000 millones en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-2B-Instruct; no se especifica en la información) |
| Tipos de cuantización | no disponible (entrenado en bf16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés) |
| Licencia | Apache 2.0 (adaptador); datos de entrenamiento con licencia solo para investigación no comercial |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-VL-2B-Instruct, un transformer multimodal de la familia Qwen3-VL que combina un codificador visual con un modelo de lenguaje para tareas de comprensión imagen-texto. El ajuste se realiza mediante LoRA (Low-Rank Adaptation) en precisión bf16, lo que congela los pesos del modelo base y entrena únicamente matrices de bajo rango, reduciendo drásticamente el coste de entrenamiento y el tamaño del artefacto (el repositorio ocupa 0,1 GB).

Los datos de entrenamiento son aproximadamente 3.900 fotogramas de Action Genome, un dataset de anotaciones de relaciones persona-objeto construido sobre 500 vídeos de Charades. La tarea se formula como generación de JSON estricto: el prompt pide listar cada objeto visible relacionado con la persona y clasificar la relación en atención, espacial o contacto. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, ni si hubo RLHF o DPO. No se describen innovaciones técnicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de scene graphs en JSON estructurado: dado un fotograma, emite una lista de objetos relacionados con una persona con etiquetas de relación (atención, espacial, contacto).
- Comprensión visual de imágenes: hereda las capacidades del modelo base Qwen3-VL-2B-Instruct para interpretar escenas.
- Salida parseable por máquina: el formato JSON fijo facilita su integración en pipelines automatizados.
- Seguimiento de instrucciones con formato estricto: el adaptador está entrenado para responder únicamente con JSON según el prompt especificado.
- Capacidades del modelo base no garantizadas tras el ajuste: tool calling, agentes, multilingüismo o razonamiento multi-paso no se documentan para este adaptador y pueden haberse degradado por la especialización.
- No se documentan capacidades de audio ni modo thinking en la información disponible.

## Casos de uso

- Análisis de vídeo para investigación en interacción persona-objeto: procesar fotogramas de Charades o datasets similares para extraer automáticamente relaciones persona-objeto y construir grafos de escena a escala, sustituyendo anotación manual.
- Robótica asistencial: generar representaciones estructuradas de qué objetos rodean a una persona y si los está tocando, mirando o tiene cerca, para planificación de manipulación o navegación segura.
- Accesibilidad visual: describir de forma estructurada la relación de una persona con objetos del entorno para sistemas de asistencia a personas con discapacidad visual, con salida JSON que otros módulos pueden verbalizar.
- Monitorización de entornos industriales o domésticos: detectar contacto o proximidad entre operarios y objetos (herramientas, equipos) en flujos de vídeo, usando la salida JSON como señal para alertas.
- Anotación semiautomática de datasets: preetiquetar fotogramas con relaciones persona-objeto para acelerar la curación de nuevos conjuntos de datos de scene graphs, con revisión humana posterior.
- Investigación en percepción simbólica: servir como baseline ligero (2B) para estudiar la viabilidad de modelos visión-lenguaje pequeños en tareas de extracción de relaciones, comparando con modelos mayores.
- Prototipado de pipelines de comprensión de escena: integrar el adaptador en un servicio de inferencia para validar arquitecturas de scene graph antes de escalar a modelos mayores o datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 2.000 millones de parámetros; en bf16 requiere aproximadamente 4-5 GB solo para pesos, más overhead de activaciones y codificador visual. En cuantización de 8 bits cabría en torno a 2-3 GB; en 4 bits, en torno a 1,5-2 GB (estimaciones orientativas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, así como en GPUs integradas con suficiente memoria compartida en cuantización agresiva.
- Opciones de despliegue: PEFT con transformers para cargar el adaptador sobre el modelo base; vLLM y TGI para servir el modelo base con el adaptador fusionado; llama.cpp u Ollama solo si se convierte a GGUF (no documentado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-2b-ag-lora | 2B (base) + LoRA | no disponible | Scene graph persona-objeto (JSON) | Apache 2.0 (adaptador); datos solo investigación | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible | Visión-lenguaje general | Apache 2.0 | Hugging Face (modelo base público) |
| Otros adaptadores de scene graph sobre VLMs | no disponible | no disponible | Scene graph | variable | no disponible |

No se dispone de información sobre alternativas específicas de scene graph con las que comparar rendimiento, contexto o latencia. La comparación principal es con el modelo base, del que este adaptador hereda arquitectura y tamaño pero del que se diferencia por la especialización en salida JSON de relaciones persona-objeto.

## Limitaciones y advertencias

- Restricción de licencia en datos: Action Genome y Charades están licenciados solo para investigación no comercial; aunque el adaptador se publica como Apache 2.0, el uso comercial derivado del entrenamiento es jurídicamente discutible y el autor lo advierte explícitamente.
- Especialización estrecha: el adaptador está entrenado para una única tarea y formato de prompt; fuera de ese prompt o de escenas similares a Action Genome, el rendimiento puede degradarse notablemente.
- Riesgo de alucinación: como todo modelo generativo, puede inventar objetos o relaciones no presentes en la imagen, especialmente en escenas con oclusiones o categorías no vistas en entrenamiento.
- Sesgos del dataset: Action Genome procede de Charades (vídeos domésticos en su mayoría), por lo que el modelo puede estar sesgado hacia objetos, entornos y actividades domésticas y rendir peor en escenas industriales, exteriores o de otras culturas.
- Idiomas: el prompt de entrenamiento está en inglés y no se documenta soporte multilingüe para esta tarea.
- Contexto: no se especifica la longitud de contexto efectiva del adaptador; no se garantiza el manejo de múltiples imágenes o secuencias largas.
- Madurez: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni benchmarks publicados; no hay evidencia de validación independiente.
- Formato de salida frágil: aunque se entrena para JSON estricto, no se garantiza validez sintáctica en todos los casos; conviene validar y parsear con tolerancia a errores en producción.
- Sin datos de cuantización: no se han publicado versiones GGUF ni cuantizadas, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Hugging Face: https://huggingface.co/Ram20307/qwen3vl-2b-ag-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset Action Genome: no disponible en la información proporcionada (referenciado como `action-genome` en la model card)
- Dataset Charades: no disponible en la información proporcionada
- Paper o blog del adaptador: no disponible en la información proporcionada
