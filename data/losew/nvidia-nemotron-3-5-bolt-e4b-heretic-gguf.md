# Losew/NVIDIA-Nemotron-3.5-Bolt-E4B-heretic-GGUF

## Resumen

Nemotron 3.5 Bolt E4B Heretic GGUF es una coleccion de cuantizaciones en formato GGUF de un derivado modificado del modelo NVIDIA Nemotron 3.5 Bolt E4B, que a su vez se basa en Gemma 4 E4B IT. El repositorio lo publica el usuario Losew y su unico proposito es ofrecer los pesos en distintos niveles de compresion para su uso con llama.cpp; no introduce entrenamiento adicional ni cambios de arquitectura respecto al modelo de origen. La modificacion "Heretic", realizada por el autor upstream del modelo Heretic (Philipp Emanuel Weidmann y colaboradores), se aplico sobre el checkpoint original de NVIDIA antes de llegar a este repositorio.

El modelo cuenta con 7.463.013.674 parametros totales en su version BF16, lo que lo situa en la gama de modelos densos de aproximadamente 7-8 mil millones de parametros. El repositorio ocupa 57,1 GB e incluye nueve archivos que cubren desde BF16 sin perdida hasta IQ2_M, pasando por Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K e IQ3_XXS. La licencia declarada es OpenMDW 1.1, con la advertencia de que el modelo base tambien remite a la licencia Apache 2.0 de Gemma 4.

Su relevancia es practica: permite ejecutar un derivado de Nemotron en hardware de consumo mediante cuantizacion agresiva, con la salvedad de que se trata de un derivado no oficial, sin benchmarks publicados en la informacion disponible y con cero descargas y cero likes en el momento de redactar esta ficha. Es un artefacto de distribucion, no un modelo con validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma 4 E4B IT segun la model card) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ3_XXS, IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (el modelo base remite ademas a Apache 2.0 de Gemma 4) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card indica que el checkpoint original es NVIDIA Nemotron 3.5 Bolt E4B BF16, descrito como basado en Gemma 4 E4B IT, y que la variante Heretic es una modificacion de ese checkpoint realizada por el autor upstream del proyecto Heretic. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea alguna variante de atencion lineal o decodificacion especulativa.

Tampoco se documentan los datos de entrenamiento: no hay cifras de tokens, composicion del dataset, ni confirmacion de si hubo RLHF, DPO u otra fase de alineamiento. El proceso aplicado en este repositorio es exclusivamente de conversion a GGUF y cuantizacion mediante llama.cpp, partiendo del BF16 GGUF publicado por el usuario grumd0. Cualquier innovacion tecnica del modelo original queda fuera del alcance de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto para dialogo multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a traves de infraestructura compatible con la API de HuggingFace.
- Ejecucion local con llama.cpp: los archivos estan pensados para `llama-cli`, `llama-server` y el resto del ecosistema llama.cpp.
- Razonamiento, codigo, matematicas y vision: no disponible en la informacion proporcionada.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, audio, vision): no disponible.

## Casos de uso

- Prototipado local en estaciones de trabajo: cargar el archivo Q4_K_M con `llama-cli -ngl 99 -cnv` permite disponer de un chatbot funcional sin conexion, util para validar prompts e integrar el modelo en scripts antes de decidir un despliegue mayor.
- Despliegue en hardware de consumo: las variantes Q3_K_M, IQ3_XXS e IQ2_M reducen la huella de memoria lo suficiente para probar el modelo en GPUs con poca VRAM o incluso en CPU, a costa de una perdida de calidad que conviene medir empiricamente.
- Servidor de inferencia ligero: `llama-server` sobre un archivo Q5_K_M o Q6_K permite exponer una API HTTP compatible con el formato de chat en una maquina modestas, adecuada para demos internas o entornos de desarrollo.
- Evaluacion comparativa de cuantizaciones: al ofrecer nueve niveles, el repositorio sirve para medir la degradacion de calidad entre BF16 y IQ2_M sobre el mismo conjunto de prompts, un ejercicio habitual antes de fijar una cuantizacion en produccion.
- Filtrado y generacion de texto en pipelines por lotes: con llama.cpp en modo no interactivo se puede procesar grandes volumenes de texto (resumenes, reescritura, clasificacion simple) en CPU, sin dependencia de servicios externos.
- Experimentacion con variantes "Heretic": investigadores interesados en el efecto de este tipo de modificaciones sobre el comportamiento del modelo pueden comparar esta version con el checkpoint original de NVIDIA usando los mismos prompts y la misma cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el numero de parametros (7,46 mil millones), BF16 requeriria del orden de 15 GB solo para pesos, Q8_0 unos 8 GB, Q4_K_M unos 4,5 GB e IQ2_M alrededor de 2,5 GB, sin contar cache KV ni overhead del runtime.
- GPU recomendadas: no disponible. Por tamano, una RTX 4090 (24 GB) o una A100/H100 podrian alojar cualquier cuantizacion de este repositorio; una RTX 3060 de 12 GB bastaria para Q8_0 y superiores en la mayoria de configuraciones.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8 GB o mas de VRAM usando Q4_K_M o inferiores; las cuantizaciones IQ2_M e IQ3_XXS podrian ejecutarse incluso en equipos con 4-6 GB, aunque la calidad no esta validada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o llama-cpp-python; vLLM y TGI no consumen GGUF de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput: no disponible. Dependera del hardware, del nivel de cuantizacion y de la longitud de contexto configurada con `-c`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt E4B Heretic GGUF (este) | 7,46 B | no disponible | openmdw-1.1 | GGUF | Derivado no oficial, sin benchmarks publicados |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | no disponible en esta ficha | no disponible | openmdw-1.1 | safetensors/BF16 | Checkpoint original de NVIDIA, referencia para comparar el efecto Heretic |
| grumd0/Nemotron-3.5-Bolt-E4B-Heretic-GGUF | 7,46 B (heredado) | no disponible | no disponible | GGUF BF16 | Fuente directa de la cuantizacion de este repositorio |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Derivado no oficial: el repositorio no es un producto de NVIDIA ni de Google, y el autor declara explicitamente que no ha ejecutado Heretic sobre el checkpoint original.
- Sin validacion publicada: cero descargas y cero likes en el momento de la ficha, y ausencia total de benchmarks, evaluaciones de calidad o pruebas de regresion.
- Riesgo de alucinacion: no cuantificado; al no haber evaluaciones, no puede acotarse el comportamiento del modelo en tareas factuales.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otras lenguas, por lo que el rendimiento multilingue no puede asumirse.
- Contexto desconocido: el ejemplo de la model card usa `-c 4096`, pero no se confirma cual es la ventana nativa del modelo; configurar un valor superior al soportado puede degradar la coherencia.
- Perdida por cuantizacion: las variantes Q2_K e IQ2_M, y en menor medida IQ3_XXS, introducen degradacion que no ha sido medida; no se recomiendan para produccion sin evaluacion previa.
- Licencia: OpenMDW 1.1 con remision a Apache 2.0 de Gemma 4; es imprescindible revisar los terminos upstream antes de uso comercial o redistribucion, y el repositorio se distribuye sin garantia.
- Modificacion Heretic: el efecto de esta intervencion sobre sesgos, rechazos y comportamiento de seguridad no esta documentado en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Losew/NVIDIA-Nemotron-3.5-Bolt-E4B-heretic-GGUF
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- GGUF BF16 upstream: https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic-GGUF
- Licencia OpenMDW 1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
