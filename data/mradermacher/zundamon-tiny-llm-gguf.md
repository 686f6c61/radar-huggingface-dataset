# mradermacher/zundamon-tiny-llm-GGUF

## Resumen

`mradermacher/zundamon-tiny-llm-GGUF` es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo `k4rasu/zundamon-tiny-llm`, un modelo de lenguaje de 1.738.880 parámetros (aproximadamente 1,74 millones) entrenado para interpretar al personaje japonés Zundamon. No es un modelo nuevo: el repositorio contiene únicamente los pesos del modelo base convertidos a formato GGUF en doce variantes de cuantización, listas para su uso con llama.cpp y herramientas compatibles.

El interés del modelo es su escala extrema. Con menos de dos millones de parámetros, el modelo está pensado para ejecutarse en hardware muy limitado: las etiquetas del autor mencionan explícitamente `llama2.c` y `esp32`, lo que sitúa el objetivo en microcontroladores y sistemas embebidos, no en servidores de inferencia. El tamaño de cada fichero cuantizado ronda los 0,1 GB según la tabla del autor (cifra redondeada; en la práctica, un modelo de 1,74 M de parámetros ocupa unos pocos megabytes).

La relevancia es, por tanto, educativa y experimental: sirve como banco de pruebas de bajo coste para pipelines GGUF, para demostraciones de inferencia en dispositivos y para estudiar el comportamiento de un transformer diminuto entrenado en japonés con un rol de personaje concreto. No compite en capacidades generales con modelos de miles de millones de parámetros y la model card no documenta arquitectura detallada, datos de entrenamiento ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo llama2.c (según las etiquetas `llama` y `llama2.c` del autor; la model card no detalla capas ni dimensiones) |
| Parámetros totales | 1.738.880 (dato real de safetensors del modelo base) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (este repositorio); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base: no se indican número de capas, dimensión oculta, cabezas de atención, tamaño de vocabulario ni función de activación. Las etiquetas del autor (`llama`, `llama2.c`, `tiny`, `esp32`) apuntan a un transformer decoder-only del estilo descrito en el proyecto llama2.c de Andrej Karpathy, es decir, una implementación mínima de atención causal con RMSNorm y SwiGLU, pero esto es una inferencia a partir de las etiquetas y no un dato confirmado en la model card.

Tampoco se detallan los datos de entrenamiento: se desconoce el número de tokens, la composición del corpus, si hubo fases de ajuste supervisado, RLHF o DPO, y si el entrenamiento se hizo desde cero o por destilación a partir de un modelo mayor. El único dato cierto sobre el proceso es el que corresponde a este repositorio: mradermacher ha aplicado cuantización estática (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) sobre los pesos en formato Hugging Face del modelo base, sin cuantizaciones ponderadas ni imatrix en el momento de publicar la ficha. Todos los ficheros son de una sola parte, por lo que no hace falta concatenar volúmenes.

## Capacidades

- Generación de texto corto en japonés, orientada a respuestas breves y a mantener el registro del personaje Zundamon.
- Interpretación de rol o personaje: el modelo está entrenado específicamente para esa identidad, no como asistente general.
- Conversación multi-turno muy limitada: no se documenta la ventana de contexto, por lo que la profundidad de diálogo real es incierta.
- Ejecución en hardware embebido y sin GPU, gracias a su tamaño inferior a dos millones de parámetros.
- Inferencia en CPU con llama.cpp y derivados; también es posible cargar los pesos originales con `transformers`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de razonamiento multi-paso, agentes, matemáticas, código ni visión.
- No se documenta modo "thinking" ni ninguna capacidad multimodal (audio, imagen o vídeo).
- Multilingüismo no disponible: el único idioma declarado es el japonés.

## Casos de uso

- Demostración de inferencia en microcontrolador: con 1,74 M de parámetros y cuantizaciones de un dígito de megabytes, el modelo cabe en la memoria flash o PSRAM de una placa ESP32, lo que permite montar una demo de generación de texto totalmente local y sin conexión.
- Prototipado de personajes conversacionales en japonés: estudios de videojuego o aplicaciones de ocio pueden usar el modelo para validar el tono y las respuestas de un personaje antes de invertir en un modelo mayor afinado sobre el mismo rol.
- Pruebas de humo de pipelines GGUF: sirve para verificar que el cargador, el tokenizador japonés, la cuantización y el servidor de inferencia (llama.cpp, Ollama con importación manual) funcionan de extremo a extremo antes de desplegar modelos de varios gigabytes.
- Docencia e investigación sobre entrenamiento a pequeña escala: permite reproducir experimentos de tokenización japonesa, curvas de pérdida y dinámica de atención en un modelo que se entrena y evalúa en minutos sobre una sola GPU de consumo.
- Generación de datos simulados para pruebas de interfaz: produce frases cortas en japonés que pueden usarse como relleno en tests de localización, maquetas de UI o pruebas de carga de un front-end de chat.
- Componente de respuesta rápida en dispositivos de voz: integrado detrás de un sistema STT/TTS, puede generar una contestación inmediata y muy breve mientras un modelo mayor, en la nube, se encarga de la parte compleja de la conversación.
- Juguete educativo de privacidad por diseño: al ejecutarse íntegramente en local y ocupar tan poco, ilustra arquitecturas de asistente donde ningún texto sale del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K, JGLUE ni ninguna otra métrica de evaluación, y tampoco se aportan datos de perplejidad comparativos entre las distintas cuantizaciones ofrecidas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en Q4_K_M y en torno a 3,5 MB en F16, calculando 2 bytes por parámetro. La tabla del autor redondea todos los ficheros a 0,1 GB.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU. Cualquier GPU, incluida una iGPU o una GTX 1050, es más que suficiente y el cuello de botella será el lanzamiento del proceso, no el cálculo.
- Cabe en GPU de consumo: sí, en todas, y también en Raspberry Pi, routers y microcontroladores con suficiente memoria (la etiqueta `esp32` del autor así lo sugiere).
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama mediante importación de un Modelfile con el GGUF, y `transformers` si se usan los pesos en safetensors del repositorio base. llama2.c es una alternativa si se convierte el checkpoint a su formato propietario.
- Latencia y throughput estimados: no disponible. Por el tamaño, la generación en CPU debería resolverse en milisegundos por token, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| zundamon-tiny-llm-GGUF (este) | 1,74 M | No disponible | ja | MIT | GGUF en HuggingFace, 12 cuantizaciones |
| k4rasu/zundamon-tiny-llm (base) | 1,74 M | No disponible | ja | MIT (según el repositorio de cuantizaciones) | Safetensors en HuggingFace |
| roneneldan/TinyStories-33M | 33 M | No disponible | en | No disponible | Transformers en HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | en (multilingüe parcial) | Apache 2.0 | Safetensors y GGUF en HuggingFace |

Nota: los datos de las filas de modelos alternativos provienen del conocimiento general del ecosistema y no de la información proporcionada en esta ficha; conviene verificarlos en sus respectivas model cards antes de tomar decisiones. La comparación relevante es de escala: este modelo es entre 19 y 600 veces más pequeño que las alternativas, lo que se traduce en una diferencia cualitativa de capacidades, no solo cuantitativa.

## Limitaciones y advertencias

- Capacidad de conocimiento prácticamente nula: con 1,74 M de parámetros no hay espacio para almacenar hechos, por lo que cualquier pregunta factual producirá respuestas inventadas o incoherentes.
- Riesgo de alucinación muy alto y, además, difícil de detectar, porque el modelo no está diseñado para tareas de recuperación de información.
- Idiomas: solo japonés declarado. No hay evidencia de que responda de forma útil en castellano, inglés u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar un uso multi-turno sin medir empíricamente el punto en que la coherencia se rompe.
- No se documentan sesgos, pero un modelo entrenado sobre un personaje y un corpus no especificado puede reproducir estereotipos de género o de registro propios del material original.
- No se documenta ningún proceso de alineación o moderación (RLHF, DPO, filtros), por lo que no debe exponerse directamente a usuarios finales sin una capa de control.
- Licencia MIT: permisiva para uso comercial y modificación, siempre que se conserve el aviso de copyright y la atribución correspondiente.
- Los pesos son una cuantización estática del modelo base; las variantes de 2 y 3 bits pueden degradar aún más la coherencia de un modelo que ya parte de una capacidad muy limitada.
- No debe evaluarse como alternativa a un LLM de propósito general: su función es embebida, educativa o de personaje.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/zundamon-tiny-llm-GGUF
- Modelo base original: https://huggingface.co/k4rasu/zundamon-tiny-llm
- Página de descargas y visión general de mradermacher: https://hf.tst.eu/model#zundamon-tiny-llm-GGUF
- Guía de uso de ficheros GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura empleada por el autor): https://www.nethype.de/
