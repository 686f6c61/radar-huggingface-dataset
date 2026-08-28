# MergekitCloud/mergekit-70

## Resumen

MergekitCloud/mergekit-70 es un modelo de lenguaje de 8.000 millones de parametros creado mediante la fusion de cuatro modelos base de la familia Llama-3.1-8B utilizando la herramienta open source mergekit. El modelo resultante combina las capacidades de ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, Undi95/Llama3-Unholy-8B-OAS y, como base para la fusion, vicgalle/Humanish-Roleplay-Llama-3.1-8B. La tecnica empleada es Model Stock, un metodo de interpolacion de pesos descrito en el articulo arXiv 2403.19522.

El proposito de esta fusion es combinar las fortalezas de modelos especializados en roleplay, conversacion y generacion de texto sin censura en un unico modelo de proposito general. Al tratarse de un merge, no se ha realizado ningun entrenamiento adicional, por lo que las capacidades del modelo son una combinacion ponderada de las de sus predecesores. El modelo esta disponible en formato safetensors y es compatible con la libreria transformers, lo que facilita su uso con herramientas como vLLM o text-generation-inference. Cabe destacar que el modelo tiene cero descargas y cero likes en el momento de su publicacion, lo que sugiere que es un experimento reciente o de baja difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (herencia de Llama-3.1-8B: 128K tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (solo se distribuye en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusion de cuatro modelos basados en la arquitectura Llama-3.1-8B, todos ellos transformers decoder-only con atencion por ventanas deslizantes. La fusion se realizo con el metodo Model Stock, que calcula una combinacion lineal de los pesos de los modelos participantes sin necesidad de entrenamiento adicional. La configuracion YAML indica que se usaron tres modelos como fuentes (ArliAI, Orenguteng y Undi95) y un cuarto como base (vicgalle/Humanish-Roleplay-Llama-3.1-8B). El parametro `int8_mask: true` sugiere que se aplico una mascara de cuantizacion int8 durante el proceso de fusion para preservar ciertos pesos, mientras que `normalize: false` indica que no se normalizaron los pesos resultantes.

No se ha realizado ningun entrenamiento supervisado, fine-tuning ni RLHF sobre el modelo fusionado. Las capacidades del modelo dependen enteramente de los modelos originales: ArliAI-RPMax es conocido por su fine-tuning en razonamiento y matemáticas, Lexi-Uncensored-V2 por su generacion de texto sin censura, Unholy-8B-OAS por su especializacion en roleplay y Humanish-Roleplay por conversacion naturalista. La fusion busca combinar estas especialidades, aunque el resultado exacto depende de la compatibilidad de los pesos.

## Capacidades

- Generacion de texto conversacional y roleplay: hereda las capacidades de Humanish-Roleplay y Unholy-8B-OAS, orientadas a dialogos naturales y personajes.
- Generacion de texto sin censura: los modelos Lexi-Uncensored-V2 y Unholy-8B-OAS aportan una reduccion de restricciones en contenido explicito o sensible.
- Razonamiento y matematicas: ArliAI-RPMax contribuye con capacidades mejoradas en tareas de razonamiento logico y aritmetico.
- Soporte de tool calling: no confirmado; depende de las capacidades de los modelos base, que no la documentan explicitamente.
- Soporte de agentes y multi-step reasoning: no confirmado; los modelos base no documentan esta capacidad.
- Capacidades multilingues: no disponibles; los modelos base estan entrenados principalmente en ingles.
- Thinking mode, vision, audio: no disponibles; ninguno de los modelos base incluye estas modalidades.

## Casos de uso

- Creacion de personajes para juegos de rol: el modelo puede generar dialogos coherentes y mantener la personalidad de un personaje durante conversaciones largas, gracias a la herencia de Humanish-Roleplay. Se usaria con prompts que definan el personaje y el contexto.
- Escritura creativa sin restricciones: autores que necesiten explorar temas tabu o contenido adulto pueden usar el modelo para generar borradores, dado el sesgo "uncensored" de dos de sus modelos base. Adecuado para ficcion explicita o narrativa oscura.
- Prototipado rapido de chatbots: al ser un modelo de 8B, se puede desplegar en una GPU consumer y usarse para pruebas de concepto de asistentes conversacionales antes de pasar a modelos mayores. Su naturaleza de merge permite evaluar rapidamente si la combinacion de estilos es util.
- Generacion de dialogos para guiones: guionistas que necesiten variaciones de conversaciones entre personajes pueden usar el modelo para generar multiples alternativas de dialogo con diferentes tonos, aprovechando la mezcla de estilos de los modelos base.
- Experimentacion con tecnicas de fusion: investigadores que quieran estudiar el comportamiento de modelos fusionados pueden usar este modelo como caso de estudio, comparando sus salidas con las de los modelos originales para entender que capacidades se preservan o se pierden en el merge.
- Generacion de contenido para comunidades online: foros o servidores de Discord donde se necesite un bot que responda sin filtros tematicos, siempre que se asuman los riesgos de contenido inapropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado que es un modelo fusionado sin entrenamiento adicional, su rendimiento en benchmarks seria una interpolacion de los resultados de los modelos base, pero no se dispone de datos verificables.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 8.030 millones de parametros en float16, lo que ocupa aproximadamente 16 GB en memoria. Con cuantizacion int8 (no incluida por defecto) se reduciria a unos 8 GB, y con int4 a unos 4 GB.
- GPU recomendadas: para inferencia en float16 se necesita una GPU con al menos 20 GB de VRAM, como una RTX 4090 (24 GB) o una A100 (40/80 GB). Con cuantizacion int8 cabria en una RTX 3080/3090 (10-24 GB), y con int4 en GPUs de 8 GB como la RTX 3070.
- Compatibilidad con consumer GPU: si, especialmente si se aplica cuantizacion. Sin cuantizar, solo las GPUs de gama alta con 24 GB pueden cargarlo completo.
- Opciones de despliegue: al estar en formato safetensors, es compatible con vLLM, text-generation-inference, llama.cpp (tras conversion a GGUF), Ollama y Transformers de HuggingFace.
- Latencia y throughput: no disponibles; dependen del hardware y del backend. En una RTX 4090 con vLLM, un modelo de 8B suele generar entre 50 y 100 tokens por segundo, pero no hay datos especificos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-70 | 8B | no disponible | no disponible | safetensors | Roleplay y texto sin censura |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8B | 128K (Llama-3.1) | Llama 3.1 Community License | safetensors | Razonamiento y matematicas |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8B | 128K (Llama-3.1) | no disponible | safetensors | Texto sin censura |
| vicgalle/Humanish-Roleplay-Llama-3.1-8B | 8B | 128K (Llama-3.1) | no disponible | safetensors | Roleplay conversacional |

La comparativa directa con otros modelos de 8B como Llama-3.1-8B-Instruct o Mistral-7B-Instruct no es posible sin datos de benchmarks. La principal diferencia es que mergekit-70 no tiene una licencia clara ni documentacion de rendimiento, lo que limita su uso en produccion.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha realizado ninguna evaluacion de sesgos. Al ser una fusion de modelos con fine-tunings especificos, los sesgos de los modelos originales pueden amplificarse o combinarse de forma impredecible.
- Riesgo de alucinacion: alto, especialmente en tareas de razonamiento y hechos factuales, ya que ninguno de los modelos base esta optimizado para precision factual.
- Contenido sin censura: el modelo puede generar contenido explicito, ofensivo o inapropiado. No debe usarse en aplicaciones publicas sin moderacion.
- Licencia: no disponible. Esto impide su uso comercial sin riesgo legal, ya que se desconoce si los modelos base permiten la redistribucion de derivados.
- Limitaciones de contexto: la longitud de contexto no esta documentada. Aunque los modelos base soportan 128K tokens, la fusion podria degradar esta capacidad.
- Idioma: no se documentan idiomas soportados; se asume que el modelo funciona principalmente en ingles, con capacidades limitadas en otros idiomas.
- Sin mantenimiento: el modelo tiene cero descargas y no hay indicios de que el autor vaya a proporcionar actualizaciones o soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-70
- Articulo Model Stock (arXiv 2403.19522): https://arxiv.org/abs/2403.19522
- Repositorio de mergekit en GitHub: https://github.com/arcee-ai/mergekit
- Modelo base Humanish-Roleplay: https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B
- Modelo base ArliAI-RPMax: https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
- Modelo base Lexi-Uncensored: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Modelo base Unholy: https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS
