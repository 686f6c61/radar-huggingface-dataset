# JohnP1/d1a-e4b

## Resumen

D1A-E4B es un adaptador PEFT (LoRA más una cabeza de decisión tipo pointer head) sobre el modelo base google/gemma-4-E4B, publicado por el usuario JohnP1. Su función no es generar texto, sino recibir un documento junto con un conjunto de preguntas tipadas y devolver, en una única pasada forward, una probabilidad calibrada para cada opción de respuesta. Se enmarca por tanto en la categoría de modelos de decisión y clasificación, no en la de modelos generativos, y se etiqueta con pipeline text-classification.

El repositorio, creado y actualizado el 30 de septiembre de 2026, es en este momento un marcador de posición: la propia model card indica que el entrenamiento está en curso y que el checkpoint E4B todavía no se ha publicado. Hasta la primera release, el autor remite al prototipo JohnP1/kev-gemma4-e2b. Esto implica que no hay pesos disponibles, cero descargas y cero valoraciones, y que cualquier evaluación de rendimiento real es todavía imposible.

La relevancia del proyecto radica en su enfoque: sustituir la generación autoregresiva por una decisión probabilística calibrada de una sola pasada, construida sobre el framework Kev (tipado y typesafe) de Jared Palmer y con la capa de soporte de Gemma 4 mantenida por el propio autor. La licencia declarada es Apache-2.0, la misma que Google aplica a Gemma 4 según la documentación del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer google/gemma-4-E4B con cabeza de decisión (pointer head) |
| Parámetros totales | No disponible (adaptador; el repositorio no publica recuento) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Gemma 4 E4B se documenta con 128K tokens en fuentes web de terceros |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador PEFT tipo LoRA (formato concreto no especificado; PEFT suele emplear safetensors) |

## Arquitectura y entrenamiento

La arquitectura consiste en un adaptador LoRA acoplado al modelo base google/gemma-4-E4B, al que se añade una cabeza de decisión que produce distribuciones de probabilidad sobre opciones tipadas. El modo de inferencia es de una sola pasada forward, sin decodificación autoregresiva ni generación de texto, lo que en principio reduce latencia y coste frente a un enfoque generativo equivalente. La model card menciona explícitamente "preguntas tipadas" y "probabilidad calibrada", lo que sitúa el foco en la calibración de la salida y en la verificación de tipos del framework Kev.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La model card indica que el entrenamiento está en curso y que este repositorio "albergará" el checkpoint E4B, por lo que no hay detalles de innovaciones técnicas más allá de la combinación de LoRA con una cabeza de decisión y la integración con las herramientas Kev del autor.

## Capacidades

- Clasificación y decisión sobre documentos: dada una entrada documental y un conjunto de preguntas tipadas, devuelve una probabilidad calibrada por cada opción.
- Inferencia en una única pasada forward, sin generación de texto, lo que habilita umbrales de decisión explícitos.
- Tipado estricto de entradas y salidas, heredado del framework Kev.
- Integración con el ecosistema Kev y su soporte específico para Gemma 4, mantenido por el autor del modelo.
- Capacidad de operar sobre documentos largos en la medida en que lo permita la ventana del modelo base.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Triaje automático de tickets: el modelo recibiría el texto del ticket y un conjunto de categorías tipadas, y devolvería la probabilidad de cada una en una sola pasada, permitiendo enrutado con umbrales ajustables.
- Clasificación documental con calibración: en procesos legales o administrativos, clasificar contratos o expedientes según campos tipados y usar la probabilidad como medida de confianza para escalado humano.
- Screening previo en pipelines RAG: descartar o priorizar documentos candidatos antes de pasarlos a un modelo generativo, reduciendo el coste total del pipeline.
- Moderación de contenido con umbral explícito: al proporcionar probabilidades calibradas, se puede fijar el punto de corte según la política de la plataforma en lugar de depender de texto libre.
- Enrutado de agentes y selección de herramientas: usar las probabilidades sobre opciones tipadas para decidir qué herramienta o ruta activar antes de invocar un LLM generativo.
- Auditoría de cumplimiento normativo: evaluar lotes de documentos frente a preguntas tipadas de conformidad y registrar las probabilidades resultantes como evidencia.
- Análisis de avisos de seguridad: el etiquetado "kev" del repositorio sugiere un posible uso en el ámbito de vulnerabilidades, aunque la información disponible no confirma este extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio es un marcador de posición con el entrenamiento en curso, sin pesos publicados ni métricas de evaluación.

## Requisitos de hardware

- VRAM de inferencia: no disponible para el adaptador; depende íntegramente del modelo base google/gemma-4-E4B, cuyo consumo no se detalla en la información proporcionada.
- GPU recomendadas: no disponibles.
- Encaje en GPU de consumo: no confirmado; fuentes web de terceros indican que los modelos Gemma 4 E2B y E4B pueden ejecutarse en Raspberry Pi y en navegador mediante WebGPU, lo que sugiere que el base es de gama edge, pero no hay datos oficiales en el repositorio.
- Opciones de despliegue: el adaptador es PEFT, por lo que sería desplegable allí donde se sirva el modelo base; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JohnP1/d1a-e4b | Adaptador de decisión sobre Gemma 4 E4B | No disponible | No disponible | Apache-2.0 | No publicado (entrenamiento en curso) |
| JohnP1/kev-gemma4-e2b | Prototipo de decisión sobre Gemma 4 E2B | No disponible | No disponible | No disponible | Citado como checkpoint prototipo |
| google/gemma-4-E4B | Modelo base generativo | No disponible | 128K según fuentes de terceros | Apache-2.0 | Disponible como modelo base |

No se dispone de datos de rendimiento comparativos entre estas opciones. Cualquier comparación cuantitativa adicional no está disponible.

## Limitaciones y advertencias

- El repositorio es un marcador de posición: no contiene pesos entrenados y su uso en producción no es posible en el estado actual.
- No hay información sobre sesgos, por lo que se desconoce el comportamiento del modelo ante subgrupos o dominios sensibles.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero la calibración de probabilidades es una afirmación del autor no verificada de forma independiente.
- Limitación de idioma: la lista de idiomas soportados no está publicada.
- Limitación de contexto: no se documenta la ventana efectiva del adaptador; el dato de 128K procede de fuentes de terceros referidas al modelo base.
- Licencia Apache-2.0 en el adaptador, coherente con la licencia de Gemma 4 indicada por el autor; conviene verificar los términos aplicables a Gemma 4 antes de un uso comercial.
- El identificador "E4B" sugiere una variante de gama edge, pero no hay confirmación oficial en el repositorio sobre parámetros totales o arquitectura interna.
- Dependencia del prototipo kev-gemma4-e2b, cuya licencia y condiciones no se detallan.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JohnP1/d1a-e4b
- Checkpoint prototipo: https://huggingface.co/JohnP1/kev-gemma4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Código D1A: https://github.com/jonpol01/d1a
- Framework Kev (Jared Palmer): https://github.com/jaredpalmer/kev
- Soporte Gemma 4 para Kev: https://github.com/jonpol01/kev
- Demos y casos de uso: https://github.com/jonpol01/kev-usecases-poc
- Gemma 4 Technical Report: https://arxiv.org/html/2607.02770v2
- Gemma 4 E4B en Core AI Model Zoo: https://github.com/john-rocky/coreai-model-zoo/tree/main/models/gemma4-e4b
- Artículo sobre Gemma 4 en Raspberry Pi: https://dev.to/alanwest/gemma-4-runs-on-a-raspberry-pi-i-tested-it-56c5
