# SC117/MiniCPM5-2B-abliterated-FIT-GGUF

## Resumen

MiniCPM5-2B-abliterated-FIT-GGUF es una redistribución cuantizada y modificada del modelo openbmb/MiniCPM5-2B, publicada por el usuario SC117 en Hugging Face. Se trata de un modelo de generación de texto de 2.516.756.480 parámetros (unos 2,52 B) con una ventana de contexto declarada de 128K tokens y orientado explícitamente a ejecución en dispositivo (on-device). El repositorio combina dos transformaciones sobre el modelo base: una abliteration (ablación de la dirección de rechazo en los pesos) y una cuantización en formato GGUF realizada con la herramienta FIT-GGUF.

La propuesta técnica diferencial no es el modelo en sí, sino el pipeline de cuantización. FIT-GGUF es una capa de planificación determinista a nivel de tensor construida sobre la cuantización de llama.cpp: en lugar de elegir un preset cerrado, se declara un objetivo de fidelidad (divergencia KL macro por debajo de un ancla de nivel y una métrica "same-top" por encima de un umbral calibrado con el propio modelo) y la herramienta busca el GGUF más pequeño que lo cumple. El autor declara cuatro niveles de fidelidad entre 1,14 y 1,46 GiB, con verificación byte-exacta contra el BF16 de referencia de cada archivo publicado.

Es relevante porque demuestra un flujo reproducible de cuantización con contrato de fidelidad medido, en un rango de tamaño que permite ejecutar un modelo de 128K de contexto en hardware muy modesto, incluso sin GPU dedicada. Como contrapartida, es una publicación reciente (10 de septiembre de 2026) sin descargas ni validación comunitaria, sin benchmarks de tareas publicados y con los riesgos propios de un modelo abliterated.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniCPM5-2B; la información proporcionada no detalla el tipo de transformer) |
| Parámetros totales | 2.516.756.480 (~2,52 B) |
| Parámetros activos | no aplica / no se indica que sea MoE |
| Longitud de contexto | 128K tokens (declarado en la model card) |
| Tipos de cuantización | 4 niveles de fidelidad FIT-GGUF, entre 1,14 y 1,46 GiB por archivo; nomenclatura exacta de los esquemas no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | openbmb/MiniCPM5-2B (relación: quantized) |
| Tarea (pipeline) | text-generation (etiqueta conversational) |
| Tamaño del repositorio | 15,3 GB |
| Fecha de publicación | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base (tipo de transformer, número de capas, cabezas de atención, uso de atención lineal o decodificación especulativa) ni los datos de entrenamiento (número de tokens, composición del dataset, si hubo RLHF, DPO u otro ajuste por preferencias). Lo único indicado es que MiniCPM5-2B es un modelo on-device de 2,5 B de parámetros con contexto de 128K, y que este repositorio es una versión cuantizada del mismo, no un reentrenamiento.

Sobre el proceso aplicado sí hay detalle. La cuantización la realiza FIT-GGUF, definida por el autor como una capa de planificación determinista a nivel de tensor sobre la cuantización de llama.cpp, que trabaja con un contrato de fidelidad: divergencia KL macro menor o igual al ancla del nivel, y métrica same-top por encima del suelo calibrado para el modelo. El autor declara que cada archivo publicado ha sido reverificado contra su propio BF16 de referencia, con entrega byte-exacta y validación de predicción de tamaño (puerta G2, delta = 0). La afirmación de optimalidad universal de la asignación de tensores se marca explícitamente en la model card como no establecida: FIT-GGUF reclama contratos de fidelidad verificados, no un óptimo de calidad universal. Adicionalmente, los pesos han sido sometidos a abliteration, etiquetada en la model card como "trial #68", técnica que elimina una dirección de rechazo en el espacio de activaciones o pesos; no se documentan en la información disponible ni el método exacto ni el número de capas afectadas.

## Capacidades

- Generación de texto conversacional, con la etiqueta `conversational` y pipeline `text-generation`.
- Ventana de contexto de 128K tokens, adecuada para documentos extensos y conversaciones multi-turno largas.
- Bilingüe: inglés y chino (códigos `en` y `zh`).
- Ejecución on-device: los archivos GGUF de 1,14 a 1,46 GiB permiten inferencia en CPU, iGPU y dispositivos de gama baja.
- Comportamiento "uncensored" / abliterated: el modelo no aplica los mecanismos de rechazo del modelo base, lo que se traduce en respuestas sin negativas ante peticiones que el original rechazaría.
- Cuatro perfiles de fidelidad seleccionables, lo que permite intercambiar tamaño por calidad sin cambiar de modelo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Rendimiento en código, matemáticas o razonamiento lógico: no hay datos publicados en la información disponible.

## Casos de uso

- Asistentes locales sin GPU dedicada: con archivos de 1,14 a 1,46 GiB, el modelo se ejecuta íntegramente en CPU con llama.cpp, lo que permite desplegar un asistente conversacional en un portátil de oficina o en un mini-PC sin acelerador, manteniendo los datos en el dispositivo.
- Procesamiento de documentos largos en local: la ventana de 128K tokens admite resúmenes, extracción de cláusulas o preguntas sobre contratos, informes y expedientes sin trocear el documento, algo poco habitual en modelos de este tamaño.
- Despliegue en edge y embebido: el rango de 1,14 a 1,46 GiB cabe en SBC tipo Raspberry Pi 5 con 8 GB de RAM o en dispositivos móviles mediante llama.cpp, habilitando clasificación, etiquetado y generación de texto offline.
- Prototipado y estudio de cuantización: al publicar cuatro niveles con contrato de fidelidad medido, el repositorio sirve como banco de pruebas para medir cuánta calidad se pierde por GiB en un modelo de 2,5 B, comparando la salida de cada nivel contra el BF16 de referencia.
- Investigación sobre abliteration: permite contrastar el comportamiento del modelo base frente a la versión abliterated en la misma arquitectura y tamaño, útil para estudiar cómo se manifiesta la dirección de rechazo y qué capacidades se ven afectadas por su eliminación.
- Atención al cliente bilingüe inglés-chino: con soporte nativo de ambos idiomas y contexto largo, puede gestionar conversaciones multi-turno con historial extenso e integración en backends ligeros.
- Escritura creativa y generación de contenido sin restricciones temáticas: el comportamiento abliterated es adecuado para ficción con temáticas sensibles, siempre que exista una capa de moderación externa y revisión humana antes de cualquier publicación.
- Preprocesado y anotación de datasets en local: generación de resúmenes, reformulaciones o etiquetas sobre grandes volúmenes de texto sin coste de API ni envío de datos a terceros.
- Traducción asistida inglés-chino en entornos aislados: útil en escenarios con requisitos de confidencialidad donde no se puede recurrir a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona métricas internas del pipeline de cuantización (divergencia KL macro y métrica same-top por nivel de fidelidad), pero los valores numéricos concretos no se incluyen en la información proporcionada, por lo que no se pueden reproducir aquí. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües.

## Requisitos de hardware

- Tamaño en disco: entre 1,14 y 1,46 GiB por archivo GGUF según el nivel de fidelidad elegido (cuatro niveles).
- VRAM estimada para inferencia: en el entorno de 2 GB para contextos cortos, sumando el tamaño del archivo más la caché KV y el overhead del runtime. El tamaño exacto de la caché KV a 128K tokens no puede calcularse porque no se dispone del número de capas ni de cabezas de atención, pero en un modelo de este tamaño la caché puede superar holgadamente el peso del propio archivo en contextos muy largos.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060) lo ejecuta con margen amplio; modelos como RTX 4090, A100 o H100 están sobredimensionados para un solo flujo y solo tienen sentido para servir lotes grandes.
- ¿Cabe en GPU de consumo? Sí, en prácticamente todas las GPU de consumo modernas y en muchas integradas con memoria compartida suficiente.
- CPU y RAM: viable en CPU con aproximadamente 2 GB de RAM libres para el nivel más pequeño más la caché KV.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python, text-generation-webui y otros frontends compatibles con GGUF. El soporte de GGUF en vLLM es experimental y limitado; TGI no está pensado para GGUF y requeriría pesos en safetensors.
- Latencia y throughput estimados: no disponible. Dependerá del nivel de fidelidad, del runtime, de si se usa GPU o CPU y de la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad en GGUF | Notas |
|---|---|---|---|---|---|
| SC117/MiniCPM5-2B-abliterated-FIT-GGUF | 2,52 B | 128K | Apache-2.0 | Sí, 4 niveles (1,14–1,46 GiB) | Abliterated; sin benchmarks publicados |
| openbmb/MiniCPM5-2B (base) | 2,52 B | 128K | no disponible en la información proporcionada | no disponible en la información proporcionada | Modelo original sin abliterar |
| Qwen2.5-3B-Instruct | ~3,1 B | 32K nativo (ampliable con YaRN) | Apache-2.0 | Sí, amplia comunidad de cuantizaciones | Ecosistema maduro y muy desplegado |
| Llama-3.2-3B-Instruct | ~3,2 B | 128K | Llama 3.2 Community License | Sí | Licencia con cláusulas adicionales, no Apache |
| Gemma-2-2B-it | ~2,6 B | 8K | Gemma Terms of Use | Sí | Contexto muy inferior |

Nota: los datos de las filas de Qwen, Llama y Gemma proceden de conocimiento general y no de la información proporcionada en esta búsqueda; conviene verificarlos antes de usarlos en una decisión de producción. No hay datos de rendimiento comparativo disponibles para el modelo de esta ficha, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de la dirección de rechazo implica que el modelo puede generar contenido dañino, ilegal o sensible sin negarse. No es apto para producción sin una capa de moderación externa y sin revisión humana.
- Sin benchmarks de tareas: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas. Las métricas declaradas por el autor (KL y same-top) miden fidelidad de la cuantización, no la calidad del modelo ni el impacto de la abliteration en sus capacidades.
- Riesgo de alucinación: con 2,52 B de parámetros, la tasa de invención de hechos es inherentemente alta, especialmente en dominios especializados.
- Idiomas: solo inglés y chino. No hay evidencia de rendimiento en castellano ni en otras lenguas, por lo que su uso en español requiere evaluación previa.
- Contexto largo: los 128K tokens están declarados, pero no se aportan resultados de evaluaciones de recuperación en contexto largo (por ejemplo, needle-in-a-haystack), y es habitual que la calidad se degrade mucho antes de agotar la ventana.
- Cuantización agresiva: los tamaños de archivo (1,14–1,46 GiB para 2,52 B de parámetros) equivalen aproximadamente a entre 3,9 y 5,0 bits por parámetro, es decir, una compresión notable respecto al BF16. El autor afirma contratos de fidelidad verificados, pero no se aportan los valores de KL en la información disponible.
- Licencia: el derivado se publica como Apache-2.0, pero la licencia del modelo base openbmb/MiniCPM5-2B no consta en la información proporcionada; conviene verificarla antes de un uso comercial.
- Sin validación comunitaria: 0 descargas y 0 likes en la fecha de consulta, publicación del 10 de septiembre de 2026. No hay informes independientes de comportamiento en producción.
- Repositorio de 15,3 GB: clonar el repositorio completo implica descargar mucho más que el archivo GGUF que se vaya a usar; conviene descargar ficheros sueltos.
- Atribución de calidad: la model card incluye afirmaciones de marketing propias de la herramienta FIT-GGUF (planificación determinista, entrega byte-exacta) y también reconoce explícitamente que la optimalidad universal de la asignación de tensores no está establecida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SC117/MiniCPM5-2B-abliterated-FIT-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- README en chino simplificado: https://huggingface.co/SC117/MiniCPM5-2B-abliterated-FIT-GGUF/blob/main/README.zh-CN.md
- Repositorio de la herramienta FIT-GGUF: https://github.com/Scorp1o117/FIT-GGUF
- Banner del repositorio: https://huggingface.co/SC117/MiniCPM5-2B-abliterated-FIT-GGUF/resolve/main/assets/fit-gguf-banner.png
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a una tabla comparativa de tarjetas gráficas en Zhihu y a hilos de soporte de Instagram, sin relación con el modelo.
