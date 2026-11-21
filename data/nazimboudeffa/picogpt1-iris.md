# nazimboudeffa/PicoGPT1-Iris

## Resumen

PicoGPT1-Iris es un ajuste fino (fine-tuning) del modelo GPT-2 completo desarrollado por el usuario nazimboudeffa. Se trata de un modelo experimental de generacion de texto de 124 millones de parametros (12 capas, 768 dimensiones, 12 cabezas de atencion) que parte de los pesos preentrenados de GPT-2 y se ajusta sobre un conjunto de datos instruccionales filtrado. La version 1.1.0, con nombre en clave Iris, sustituye al anterior PicoGPT1-Jasmine y representa un salto cualitativo al emplear el GPT-2 completo en lugar de una version reducida de 2 capas.

El modelo resuelve un problema concreto: la generacion de respuestas instruccionales con un mecanismo de anclaje (grounding) y absteccion ante preguntas fuera de su base de conocimiento. Para ello incorpora un pipeline RAG en Python que recupera hechos de una base cerrada de 30 entradas mediante TF-IDF y verifica que la respuesta este respaldada por el contexto recuperado; si no lo esta, el modelo responde "Je ne sais pas." (No lo se). Esta funcionalidad de absteccion solo esta disponible a traves de los scripts Python, no en el fichero GGUF.

Es relevante ahora como ejemplo de modelo pequeno orientado a instruction-following con control de alucinaciones mediante recuperacion externa, asi como por su compatibilidad con llama.cpp y llama.app para despliegue local. No obstante, se trata de un modelo experimental con capacidades limitadas, un contexto de 1024 posiciones y sin datos publicados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 completo) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 posiciones en el modelo; ejemplos de entrenamiento truncados a 256 tokens |
| Tipos de cuantizacion | GGUF (variante incluida en el repo); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible (la model card esta en frances; el tokenizer es GPT-2, principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-2 estandar: un transformer decoder-only con 12 capas, 768 dimensiones de embedding, 12 cabezas de atencion y un tokenizer GPT-2 de 50.257 tokens. Parte de los pesos preentrenados de GPT-2 y se ajusta durante 5 epocas sobre un total de 2.652 ejemplos. El formato aprendido es `prompt\nrespuesta<|endoftext|>`.

El conjunto de entrenamiento combina 2.000 instrucciones/respuestas Alpaca filtradas, 245 ejemplos de anclaje, 197 pares pregunta/respuesta directos extraidos de una base cerrada de 30 hechos, 90 ejemplos de rechazo ("cercanos a la base") y 120 reformulaciones ancladas. Respecto a la version anterior (Jasmine), se eliminaron errores factuales conocidos (agua a 115 grados, definicion falsa de "mole", token `<nooutput>`), se suprimieron duplicados y se uniformizo el formato. El decodificado por defecto paso de greedy a muestreo (`top_k=40`, `no_repeat_ngram_size=3`, `repetition_penalty=1.15`), con parada en EOS o en el primer salto de linea. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto e instrucciones en formato prompt/respuesta.
- Respuesta a preguntas sobre una base cerrada de 30 hechos mediante el pipeline RAG en Python.
- Absteccion controlada: responde "Je ne sais pas." cuando la puntuacion de anclaje es inferior a 0,40 o la respuesta no se extrae del contexto.
- Recuperacion de hechos mediante TF-IDF (`char_wb` 3-5) sobre `texto + pregunta`.
- Generacion determinista con beam search (`num_beams=5`) en el modo anclado.
- Compatibilidad con llama.cpp y llama.app para inferencia local.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues no documentadas; el tokenizer GPT-2 esta orientado al ingles y los datos de entrenamiento parecen estar en frances.

## Casos de uso

- Demostracion educativa de fine-tuning de GPT-2: util para ilustrar el flujo completo desde el preentrenamiento hasta el ajuste instruccional con un modelo de 124 M de parametros que cabe en cualquier GPU consumer.
- Prototipado de sistemas RAG con absteccion: el pipeline `rag.py` sirve como referencia para implementar recuperacion TF-IDF y verificacion de anclaje en entornos de bajo coste.
- Pruebas de concepto de control de alucinaciones: permite experimentar con umbrales de anclaje (0,40) y medir la tasa de absteccion correcta frente a respuestas inventadas.
- Inferencia local en CPU o GPU modesta: gracias a su tamano y a la variante GGUF, puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp.
- Base para investigacion sobre modelos pequenos: util para estudiar el equilibrio entre coherencia y absteccion en modelos de menos de 200 M de parametros.
- Integracion en pipelines de evaluacion: los scripts `test.py` y `evaluate.py` permiten reproducir las metricas de anclaje y comparar variantes del modelo.
- Chat local de demostracion: `llama serve` levanta una interfaz web en el puerto 9931 para interactuar con el GGUF sin escribir codigo.

## Benchmarks y rendimiento

Los unicos datos disponibles son las metricas del pipeline de anclaje, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Medicion | Resultado |
|---|---|
| Preguntas en la base (conjunto canonico) | 30 |
| Respuestas exactas (conjunto canonico) | 30/30 |
| Respuestas ancladas (conjunto canonico) | 30/30 |
| Abstecciones erroneas (conjunto canonico) | 0/30 |
| Retrieval correcto (conjunto canonico) | 30/30 |
| Preguntas fuera de base (conjunto canonico) | 10 |
| Abstecciones correctas (conjunto canonico) | 10/10 |
| Respuestas exactas en base (split test, 40 preguntas no vistas) | 29/30 |
| Respuestas ancladas (split test) | 30/30 |
| Retrieval correcto (split test) | 30/30 |
| Abstecciones fuera de base lejanas (split test) | 5/5 |
| Abstecciones fuera de base cercanas (split test) | 2/5 |

El propio autor advierte que los resultados del conjunto canonico son optimistas porque esas 30 preguntas se usaron en el entrenamiento. El punto debil son las preguntas fuera de base cercanas a un hecho conocido: 3 de 5 siguen devolviendo una respuesta copiada del hecho mas proximo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 500 MB solo para pesos (124 M parametros x 4 bytes), mas overhead de activaciones y cache KV.
- En cuantizacion GGUF de 4 bits, el modelo ocupa del orden de 70-80 MB, apto para CPU.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090); tambien funciona en CPU.
- Cabe holgadamente en GPU consumer y en sistemas embebidos con suficiente RAM.
- Opciones de despliegue: Transformers (PyTorch), llama.cpp, llama.app (CLI y servidor web en el puerto 9931), text-generation-inference (segun tags del repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PicoGPT1-Iris | 124 M | 1024 | Fine-tuning GPT-2 + RAG con absteccion | no disponible | Hugging Face, safetensors y GGUF |
| PicoGPT1-Jasmine (version anterior) | ~2 capas, 128 dims | 256 | Fine-tuning GPT-2 reducido, sin RAG | no disponible | Hugging Face |
| GPT-2 (original) | 124 M | 1024 | Preentrenamiento base | MIT (segun el modelo original) | Hugging Face, ampliamente disponible |
| Daisy (referencia del autor) | no disponible | no disponible | RAG con absteccion | no disponible | no disponible |

La comparativa con Daisy procede de la propia model card: Daisy obtiene 28/30 respuestas exactas y 1/5 en abstecciones fuera de base cercanas, frente a 29/30 y 2/5 de Iris en el split test. No se dispone de datos de benchmarks estandar para comparar con modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte que las respuestas en generacion libre pueden ser aproximadas.
- Riesgo de alucinacion elevado en generacion libre; el control solo funciona con el pipeline RAG en Python, no con el GGUF.
- El GGUF no incluye la base de hechos ni el TF-IDF, por lo que la absteccion no esta disponible en llama.cpp ni en llama.app.
- Debilidad documentada en preguntas fuera de base cercanas a un hecho conocido: 3 de 5 devuelven una respuesta copiada del hecho mas proximo.
- Contexto limitado a 1024 posiciones y ejemplos de entrenamiento truncados a 256 tokens.
- Idiomas soportados no documentados; el tokenizer GPT-2 esta orientado al ingles y los datos parecen en frances, lo que limita el uso en castellano.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sesgos conocidos: no documentados, pero al derivar de GPT-2 y de un dataset Alpaca filtrado, hereda los sesgos de ambas fuentes.
- Conjunto de evaluacion muy pequeno (30-40 preguntas) y con solapamiento con el entrenamiento en el conjunto canonico, lo que limita la validez estadistica de las metricas.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nazimboudeffa/PicoGPT1-Iris
- Version anterior (Jasmine): https://huggingface.co/nazimboudeffa/PicoGPT1-Jasmine
- Repositorio de codigo fuente: https://github.com/nazimboudeffa/picogpt-kit
- Documentacion del benchmark: `doc/14-benchmark.md` del repositorio anterior
- llama.app: https://llama.app
