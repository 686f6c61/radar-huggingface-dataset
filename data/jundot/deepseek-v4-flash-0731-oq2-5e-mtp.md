# Jundot/DeepSeek-V4-Flash-0731-oQ2.5e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ2.5e-mtp es una cuantización de precisión mixta en formato MLX del modelo deepseek-ai/DeepSeek-V4-Flash-0731, publicada por el usuario Jundot. Se trata de un checkpoint de 304.180 millones de parámetros lógicos almacenado con una media efectiva de 3,113 bits por peso, que ocupa 110,252 GiB en disco (118,383 GB de repositorio). El objetivo es hacer desplegable en hardware Apple Silicon un modelo que en su versión original en BF16 resultaría inmanejable para memoria unificada de gama alta.

La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.1) mediante la técnica Improved oQe, que asigna bits según la sensibilidad medida de cada capa y aplica una matriz de importancia de 1024 muestras por 512 tokens, seguida de un reajuste de escala y sesgo por mínimos cuadrados ponderados. El checkpoint conserva tanto el backbone del modelo de lenguaje (284,335B de pesos lógicos) como la cabeza MTP (Multi-Token Prediction) de 19,846B, que actúa como módulo de decodificación especulativa.

El interés de esta ficha es doble: por un lado documenta una de las pocas rutas prácticas para ejecutar un modelo de la clase DeepSeek-V4 en un solo equipo con memoria unificada grande (el autor lo probó en un M3 Ultra con 512 GB), y por otro sirve de referencia sobre el estado del arte en cuantización extrema de modelos masivos, donde bajar de 3,2 bits por peso manteniendo la cabeza especulativa funcional es el principal reto técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek_v4 (backbone de lenguaje) con cabeza MTP para decodificacion especulativa; el modelo base declara la misma estructura que DeepSeek-V4-Flash-DSpark |
| Parametros totales | 304.180.418.494 (304,180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ2.5e: affine 2-bit group 64 (56,479% de pesos), affine 3-bit group 64 (34,594%), MXFP4 group 32 (6,354%), MXFP8 group 32 (2,056%), affine 8-bit group 64 (0,450%), BF16 (0,055%), FP32 (0,012%), I32 (0,001%). Media efectiva de 3,113 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |

Distribucion de almacenamiento declarada por el autor:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 284,335B | 107,457 GB / 100,077 GiB |
| Cabeza MTP | 19,846B | 10,926 GB / 10,175 GiB |
| Total | 304,180B | 118,383 GB / 110,252 GiB |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base: no se especifican el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. Lo unico documentado es que deepseek-ai/DeepSeek-V4-Flash-0731 es un lanzamiento oficial que sucede a una version preview, con capacidades aganticas reforzadas, y que comparte estructura con DeepSeek-V4-Flash-DSpark, al que se le incorpora un modulo de decodificacion especulativa. La arquitectura interna (atencion, posible mezcla de expertos, atencion lineal o hibrida) no se detalla en la informacion proporcionada.

Lo que si esta documentado es el proceso de cuantizacion. La herramienta oQ (oMLX v0.7.1) aplica una estrategia de precision mixta en dos pasos: primero mide la sensibilidad de cada capa y reparte el presupuesto de bits en funcion de ella; despues redondea cada grupo usando una matriz de importancia construida con 1024 muestras de 512 tokens y un reajuste de escala y sesgo por minimos cuadrados ponderados (Improved oQe Quantization). El resultado asigna 2 bits a la mayoria de los pesos (56,479%) y reserva 3 bits (34,594%) y formatos de mayor precision (MXFP4, MXFP8, affine 8-bit, BF16, FP32) para las capas mas sensibles. La cabeza MTP se conserva y se cuantiza por separado, manteniendo operativa la ruta de decodificacion especulativa.

## Capacidades

- Generacion de texto y decodificacion autoregresiva, heredadas del modelo base DeepSeek-V4-Flash-0731.
- Decodificacion especulativa mediante la cabeza MTP incluida en el checkpoint (19,846B de pesos logicos), que permite proponer varios tokens por paso y validarlos con el backbone.
- Capacidades aganticas reforzadas segun la descripcion del modelo base, orientadas a tareas de varios pasos.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; la model card solo declara pipeline text-generation.

## Casos de uso

- Despliegue local de un modelo de clase 300B en hardware Apple Silicon: el checkpoint esta pensado para ejecutarse con MLX sobre equipos con memoria unificada grande (el autor lo probo en un M3 Ultra de 512 GB), lo que permite disponer de un modelo de gran escala sin depender de clusters de GPU.
- Investigacion en cuantizacion extrema: la distribucion de bits por capa y el uso de matrices de importancia lo convierten en un caso de estudio para medir el impacto de bajar a 3,113 bits/peso en tareas aganticas.
- Evaluacion de decodificacion especulativa: la cabeza MTP incluida permite comparar latencia y throughput frente al mismo checkpoint sin MTP, aislando el efecto de la propuesta de multiples tokens.
- Prototipado de agentes de varios pasos: dado que el modelo base orienta su lanzamiento a capacidades aganticas, el checkpoint sirve para validar flujos de razonamiento encadenado en local antes de pasar a inferencia en servidor.
- Benchmarking de MLX frente a otros runtimes: al ser un artefacto MLX puro, es adecuado para comparar rendimiento de MLX contra vLLM o llama.cpp sobre el mismo modelo base.
- Generacion de texto en entornos con restricciones de memoria: con 110,252 GiB de pesos, encaja en configuraciones de memoria unificada alta donde no es viable cargar la version BF16.
- Reproduccion de resultados: el autor referencia la revision 5c8b681 del checkpoint, lo que facilita reproducir mediciones concretas en trabajos de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia cualitativa es la descripcion del modelo base en featherless.ai, que afirma un rendimiento competitivo frente a modelos propietarios potentes en diversas pruebas aganticas, pero sin cifras concretas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica para este checkpoint cuantizado, ni comparaciones medidas contra el modelo base en BF16.

## Requisitos de hardware

- VRAM / memoria unificada estimada: 110,252 GiB solo para los pesos, mas el overhead de activaciones y cache KV. Practicamente exige 128 GB de memoria unificada como minimo absoluto y 192 GB o mas para trabajar con comodidad.
- Configuracion de referencia documentada: el autor probo el checkpoint en un Apple M3 Ultra con 512 GB de memoria unificada.
- GPU dedicadas: una A100 de 80 GB o una H100 de 80 GB no son suficientes para alojar los pesos completos en una sola tarjeta; seria necesario repartir el modelo entre varias GPU. No se especifica si MLX permite esa distribucion.
- GPU de consumo (RTX 4090, RTX 5090 y similares con 24-32 GB): no cabe. El modelo no es ejecutable en GPU de consumo con esta cuantizacion.
- Opciones de despliegue: MLX (libreria declarada), mediante oMLX / oQ; el formato safetensors MLX no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin conversion previa, que no esta documentada en la informacion disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de la ganancia aportada por la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Precision efectiva | Tamano | Licencia |
|---|---|---|---|---|---|
| Jundot/DeepSeek-V4-Flash-0731-oQ2.5e-mtp | 304,180B | MLX safetensors + MTP | 3,113 bits/peso | 110,252 GiB | MIT |
| Jundot/DeepSeek-V4-Flash-0731-oQ2.5e | no disponible | MLX safetensors | no disponible | no disponible | MIT |
| Jundot/DeepSeek-V4-Flash-0731-oQ4e-mtp | no disponible | MLX safetensors + MTP | no disponible (etiqueta 4e) | no disponible | MIT |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | 304,180B (logicos) | safetensors (BF16, presumiblemente) | 16 bits/peso | no disponible en la informacion | MIT |

No se dispone de contexto, rendimiento ni parametros activos del modelo base ni de las variantes oQ, por lo que la comparativa se limita al formato, la precision efectiva y la licencia. No se identifican en la informacion proporcionada modelos de otras familias directamente comparables.

## Limitaciones y advertencias

- La cuantizacion a 2 y 3 bits en mas del 90% de los pesos introduce perdida de calidad respecto al modelo base en BF16; el autor no publica evaluaciones que cuantifiquen esa degradacion.
- El checkpoint lleva la etiqueta 2-bit y una media de 3,113 bits/peso, pero la mezcla real incluye grupos en MXFP8, BF16 y FP32, de modo que el consumo de memoria no se reduce proporcionalmente al numero de bits declarado.
- La cabeza MTP esta cuantizada de forma independiente al backbone; su precision efectiva no se detalla, lo que añade incertidumbre sobre la calidad de las propuestas especulativas.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del que se asuma por defecto; la model card no declara idiomas soportados.
- No se especifica la longitud de contexto, lo que impide planificar despliegues con requisitos de ventana larga.
- El formato MLX limita el despliegue a ecosistema Apple Silicon; no hay ruta documentada a vLLM, llama.cpp, Ollama o TGI.
- La licencia es MIT y permite uso comercial segun los terminos del modelo base, pero conviene verificar el fichero LICENSE del repositorio y las condiciones del modelo original de DeepSeek, ya que esta ficha solo refleja lo indicado en la model card.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 2026-10-11; es un artefacto reciente y poco validado por la comunidad.
- No hay benchmarks publicados, por lo que no es posible estimar su idoneidad para produccion sin una evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ2.5e-mtp
- Variante oQ2.5e sin MTP: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ2.5e
- Variante oQ4e-mtp: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ4e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Discusion sobre configuracion del modelo: https://github.com/jundot/omlx/discussions/2499
- Ficha del modelo base en featherless.ai: https://featherless.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Ficha del modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
