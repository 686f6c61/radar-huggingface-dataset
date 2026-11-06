# kodetr/SasakLLM-1.5B-Instruct-v2

## Resumen

SasakLLM-1.5B-Instruct-v2 es un ajuste fino por LoRA del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario kodetr, orientado a la comprension y generacion de conversaciones en bahasa sasak, una lengua regional hablada en la isla de Lombok (Indonesia). El modelo parte de una base ya instruida y se adapta mediante LoRA sobre un corpus propio denominado `sasaknlp`, que segun el autor combina literatura, lexico morfologico e instrucciones conversacionales equilibradas.

La relevancia del proyecto reside en su enfoque de preservacion linguistica: la mayoria de los modelos multilingues tienen una cobertura muy limitada de lenguas regionales con pocos recursos digitales, y este ajuste busca cubrir ese hueco con un modelo pequeno (1.500 millones de parametros) que puede ejecutarse en hardware modesto. La ficha tecnica publicada es minima: no se detallan hiperparametros de entrenamiento, volumen de tokens ni resultados de evaluacion.

El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere que los pesos publicados corresponden al adaptador LoRA y no a una fusion completa con el modelo base. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino mediante LoRA |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); tamano del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, aunque el ajuste podria no preservarlo) |
| Tipos de cuantizacion | No disponible; al ser safetensors, es compatible con cuantizaciones estandar de llama.cpp, GPTQ y AWQ previa conversion |
| Idiomas soportados | Sasak (sas), indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion por causalidad, RoPE, normalizacion RMSNorm y activacion SwiGLU, entrenado originalmente por Alibaba sobre un corpus multilingue amplio. Sobre esa base, kodetr aplica un ajuste fino con LoRA (Low-Rank Adaptation), una tecnica de parametros eficientes que congela los pesos originales e introduce matrices de bajo rango entrenables en las capas de atencion y proyeccion.

El conjunto de datos de ajuste es `sasaknlp`, descrito por el autor como una mezcla de corpus literario, lexico morfologico e instrucciones conversacionales. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de LoRA (rango, alpha, capas objetivo), la tasa de aprendizaje, el numero de epocas ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. Tampoco se documenta si el ajuste preserva el modo de razonamiento o el soporte de tool calling del modelo base.

## Capacidades

- Generacion de texto conversacional en bahasa sasak y, presumiblemente, en indonesio, dado el par de idiomas declarado.
- Respuesta a instrucciones en formato chat, ya que el modelo base esta instruido y el autor publica un ejemplo con `apply_chat_template`.
- Comprension de vocabulario y estructuras morfologicas del sasak derivadas del corpus `sasaknlp`.
- Capacidad de generacion de texto general heredada del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base lo soporta, pero no hay evidencia de que el ajuste LoRA lo preserve.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades multilingues adicionales: no documentadas; solo se declaran `sas` e `id`.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Preservacion y divulgacion del bahasa sasak: el modelo puede generar textos, explicaciones y material didactico en sasak, util para escuelas y proyectos de documentacion linguistica en Lombok.
- Traduccion asistida sasak-indonesio: con un par de idiomas declarado, puede emplearse como borrador en flujos de traduccion que luego revisa un hablante nativo.
- Chatbots de atencion ciudadana local: un asistente conversacional en sasak para servicios publicos o turismo en Lombok, ejecutable en hardware modesto por su tamano de 1,5B.
- Investigacion en NLP de bajos recursos: sirve como punto de partida para experimentos de ajuste LoRA sobre lenguas regionales, comparando tecnicas y corpus.
- Generacion de contenido cultural: resumenes o adaptaciones de literatura sasak a partir del corpus literario usado en el entrenamiento.
- Prototipado rapido en entornos con GPU de consumo: al ser un adaptador LoRA sobre un modelo de 1,5B, puede desplegarse en una unica GPU consumer para demos y pruebas de concepto.
- Educacion linguistica: ejercicios de practica de conversacion en sasak con correccion y explicaciones, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de evaluacion (perplejidad, MMLU, HumanEval, GSM8K ni evaluaciones especificas de sasak) en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3 GB para los pesos del modelo base (1,5B parametros) mas overhead de activaciones y cache KV; en la practica, entre 3,5 y 5 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB; en 4 bits, alrededor de 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas con 6 GB o mas; tambien puede ejecutarse en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador LoRA), vLLM y TGI tras fusionar el adaptador con el modelo base, llama.cpp y Ollama previa conversion a GGUF, y servidores de inferencia compatibles con OpenAI API.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 1,5B, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SasakLLM-1.5B-Instruct-v2 | 1,5B (base) + adaptador LoRA | No disponible | sas, id | Apache 2.0 | Ajuste regional sobre Qwen2.5; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Multilingue amplio | Apache 2.0 | Modelo base; cobertura de sasak muy limitada |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Multilingue amplio | Apache 2.0 (Qwen Research para algunos tamanos) | Mayor capacidad general, pero sin ajuste especifico en sasak |
| Llama 3.2 1B Instruct | 1B | 128.000 tokens | Multilingue (8 idiomas oficiales) | Llama 3.2 Community License | No cubre lenguas regionales de Indonesia |

La comparativa directa con otros modelos ajustados a sasak no esta disponible en la informacion proporcionada; no se conocen alternativas publicas equivalentes para esta lengua en el ecosistema Hugging Face segun los datos consultados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa de la calidad del ajuste en sasak ni de posibles regresiones en las capacidades del modelo base.
- Riesgo de alucinacion: como todo modelo generativo de 1,5B, puede producir texto fluido pero factualmente incorrecto, especialmente en un idioma de bajos recursos donde los datos de entrenamiento son escasos.
- Cobertura limitada de idiomas: solo se declaran sasak e indonesio; el rendimiento en castellano u otras lenguas no esta garantizado y probablemente sea inferior al del modelo base.
- Sesgos desconocidos: no se documenta la composicion del corpus `sasaknlp`, por lo que no es posible evaluar sesgos culturales, de genero o geograficos.
- Longitud de contexto no confirmada: aunque el modelo base soporta 32.768 tokens, el ajuste LoRA podria degradar el rendimiento en contextos largos; no hay documentacion al respecto.
- Formato de publicacion: el repositorio parece contener solo el adaptador LoRA (0,1 GB), por lo que es necesario descargar el modelo base Qwen2.5-1.5B-Instruct y cargar el adaptador con PEFT; no se ofrece una version fusionada ni GGUF lista para usar.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base Qwen2.5-1.5B-Instruct mantiene la misma licencia (asi es) y cumplir con la atribucion correspondiente.
- Madurez del proyecto: el repositorio tiene cero descargas y cero likes en el momento de la consulta, sin comunidad ni mantenimiento documentado; no es recomendable para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kodetr/SasakLLM-1.5B-Instruct-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentacion de PEFT (carga de adaptadores LoRA): https://huggingface.co/docs/peft
- Documentacion de transformers: https://huggingface.co/docs/transformers
