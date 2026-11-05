# ComputationalLinguisticsLab/LexisLM-1B

## Resumen

LexisLM-1B es un modelo de lenguaje de tipo decoder-only desarrollado por ComputationalLinguisticsLab, especializado en la generacion de texto en griego moderno. Se trata de un modelo base, es decir, no ha sido sometido a ajuste por instrucciones ni a alineacion mediante RLHF o DPO, por lo que su proposito es servir como punto de partida para experimentacion y fine-tuning posterior en tareas de procesamiento del lenguaje natural en griego.

El modelo emplea una arquitectura compatible con Llama, con 20 capas transformer, un tamano oculto de 2.048 y 16 cabezas de atencion, sumando un total de 1.093.232.640 parametros. Su ventana de contexto es de 4.096 tokens y dispone de un vocabulario de 32.004 tokens. Fue preentrenado durante 335.000 pasos sobre aproximadamente 22.000 millones de tokens extraidos de FineWeb2 y de la Wikipedia en griego.

Su relevancia radica en la escasez relativa de modelos abiertos dedicados especificamente al griego con licencia permisiva Apache-2.0 y un tamano contenido que permite su despliegue en hardware modesto. Resulta adecuado para investigadores que necesiten una base ligera sobre la que construir sistemas de generacion de texto, completado o clasificacion en griego sin depender de modelos multilingues de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only compatible con Llama (causal language model) |
| Parametros totales | 1.093.232.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Griego (el) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Especificaciones adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Capas transformer | 20 |
| Tamano oculto | 2.048 |
| Cabezas de atencion | 16 |
| Vocabulario | 32.004 tokens |
| Pasos de preentrenamiento | 335.000 |
| Tokens de entrenamiento | ~22.000 millones |
| Tamano del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

LexisLM-1B es un modelo transformer causal de tipo decoder-only con una configuracion compatible con la familia Llama, lo que permite cargarlo directamente mediante `AutoModelForCausalLM` de Hugging Face Transformers. La pila consta de 20 capas con un tamano oculto de 2.048 y 16 cabezas de atencion, una configuracion compacta que situa el modelo en el rango de los 1.000 millones de parametros. No se documenta el uso de arquitecturas hibridas, mecanismos de atencion lineal ni decodificacion especulativa.

El preentrenamiento se realizo durante 335.000 pasos sobre aproximadamente 22.000 millones de tokens procedentes de dos fuentes: FineWeb2 (corpus web multilingue de HuggingFaceFW, distribuido bajo ODC-By-1.0) y la Wikipedia en griego. Los documentos de preentrenamiento se separaron mediante el token `<eos>`, y el autor indica que debe anteponerse dicho token al inicio de cada documento nuevo en inferencia. No se menciona en la informacion disponible la aplicacion de RLHF, DPO ni ninguna fase de ajuste por instrucciones; se trata, por tanto, de un modelo estrictamente base.

## Capacidades

- Generacion de texto en griego moderno mediante completado autoregresivo de secuencias.
- Modelado de lenguaje causal: predice el siguiente token dado un contexto, lo que habilita tareas de completado de frases y parrafos.
- Capacidad de servir como base para fine-tuning supervisado en tareas downstream en griego (clasificacion, extraccion, resumen, etc.).
- Soporte de tool calling / function calling: no disponible; el modelo no ha sido entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser un modelo base sin ajuste por instrucciones, no se espera un comportamiento agentico fiable.
- Capacidades multilingues: limitadas al griego segun la model card; no se declaran capacidades en otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Completado de texto en griego: el modelo puede generar continuaciones coherentes de fragmentos de texto en griego, util para asistentes de escritura o generacion de borradores, siempre anteponiendo el token `<eos>` al prompt como indica el autor.
- Punto de partida para fine-tuning supervisado: al ser un modelo base de 1.000 millones de parametros con licencia Apache-2.0, es adecuado para ajustarse con datasets etiquetados en griego en tareas como clasificacion de documentos, analisis de sentimiento o extraccion de entidades.
- Investigacion en linguistica computacional: su tamano reducido y su entrenamiento especifico en griego lo convierten en una base controlada para estudiar el comportamiento de modelos monolingues pequenos frente a modelos multilingues de mayor escala.
- Generacion aumentada de documentos en griego: puede integrarse en pipelines que necesiten producir texto de relleno o variaciones de contenido a partir de contextos de hasta 4.096 tokens.
- Prototipado rapido en entornos con recursos limitados: su tamano (aproximadamente 2,2 GB en safetensors) permite cargarlo en GPUs de consumo para experimentos de generacion de texto en griego sin infraestructura dedicada.
- Ajuste por instrucciones como fase posterior: sirve como modelo base para construir un modelo de chat o de respuesta a preguntas en griego mediante SFT y, opcionalmente, DPO, partiendo de un preentrenamiento ya orientado al idioma.
- Evaluacion comparativa de modelos monolingues: util como referencia en estudios que comparen el rendimiento en griego de modelos pequenos entrenados desde cero frente a modelos multilingues.

## Benchmarks y rendimiento

Resultados publicados por el autor con 0 ejemplos few-shot. ARC emplea precision normalizada; el resto, precision o metricas de eleccion multiple segun se indica.

| Benchmark | Metrica | Puntuacion | Preguntas |
|---|---|---:|---:|
| ARC-Challenge | Precision normalizada | 25,34% | 1.168 |
| ARC-Easy | Precision normalizada | 33,38% | 2.376 |
| MMLU | Precision | 23,15% | 14.042 |
| TruthfulQA | MC1 | 24,60% | 817 |
| TruthfulQA | MC2 | 43,49% | 817 |

No se han publicado en la informacion disponible resultados de benchmarks de generacion como HumanEval, GSM8K ni evaluaciones especificas de griego.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits (bf16/fp16): aproximadamente 2,2 GB para los pesos, mas overhead de activaciones y cache KV, situandose en torno a 3-4 GB en funcion de la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,1-1,5 GB para los pesos; en 4 bits, aproximadamente 0,6-0,8 GB (estimaciones teoricas, ya que el repositorio no distribuye variantes cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para 16 bits; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Despliegue: compatible con Hugging Face Transformers (segun la model card), y por su arquitectura Llama es susceptible de servirse con vLLM, TGI (el tag `text-generation-inference` esta presente) y, previa conversion, llama.cpp u Ollama. No se documentan recetas oficiales para estas ultimas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos comparables en griego con los que establecer una comparacion cuantitativa rigurosa. A continuacion se ofrece una comparacion estructural basica basada en caracteristicas conocidas de la categoria, sin cifras de benchmarks inventadas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LexisLM-1B | ~1,09 B | 4.096 | Griego | Apache-2.0 | Hugging Face |
| Modelos multilingues de ~1B (familia Llama/Qwen) | ~1 B | variable (2K-32K) | Multilingue | variable | Hugging Face |
| Modelos griegos de mayor tamano (p. ej. variantes de 7B) | ~7 B | variable | Griego/multilingue | variable | Hugging Face |

La comparacion de rendimiento frente a estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: las peticiones en formato chat o pregunta-respuesta pueden no producir respuestas fiables; el autor lo advierte explicitamente.
- Riesgo de alucinacion: al ser un modelo de completado preentrenado, puede generar texto inexacto o inventado; debe revisarse antes de usarse en contextos de consecuencias relevantes.
- Sesgos: el texto generado puede reflejar sesgos presentes en los datos de entrenamiento (FineWeb2 y Wikipedia en griego); no se documentan evaluaciones de sesgo.
- Limitacion idiomatica: el modelo esta entrenado unicamente en griego; no se declaran capacidades en otros idiomas y su uso fuera del griego no esta respaldado por la model card.
- Ventana de contexto limitada a 4.096 tokens, lo que restringe tareas que requieran contextos largos.
- Vocabulario de 32.004 tokens, relativamente pequeno, lo que puede afectar a la eficiencia de tokenizacion en dominios especializados.
- Restricciones de licencia: los pesos se distribuyen bajo Apache-2.0, permisiva para uso comercial; sin embargo, los derechos sobre los datos de entrenamiento (FineWeb2 bajo ODC-By-1.0 y Wikipedia) permanecen con sus titulares, por lo que conviene revisar las condiciones de las fuentes antes de un uso comercial a gran escala.
- Sin datos publicados sobre cuantizacion, latencia o throughput, lo que limita la planificacion de despliegues en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ComputationalLinguisticsLab/LexisLM-1B
- FineWeb2 (HuggingFaceFW): no se proporciona URL directa en la informacion disponible; referenciado en la model card como fuente de datos.
- Wikipedia en griego: fuente de datos citada en la model card; no se proporciona URL directa.
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
