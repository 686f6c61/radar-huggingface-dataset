# jkim96/QwQ-32B-DASHQ-Q2-GGUF

## Resumen

QwQ-32B-DASHQ-Q2-GGUF es un conjunto de cuatro cuantizaciones GGUF de 2 bits del modelo de razonamiento Qwen/QwQ-32B, publicadas por el usuario jkim96, autor del método de cuantización DASH-Q. El modelo base es un transformer denso de 32.763.876.352 parámetros (32,76 B) de la serie Qwen, diseñado específicamente para tareas de razonamiento, matemáticas y código mediante cadenas de pensamiento largas. La aportación de este repositorio no es el modelo, sino la cuantización: según su model card, DASH-Q logra mejor perplejidad que las cuantizaciones IQ2 de llama.cpp o las UD de Unsloth con tamanos de archivo comparables.

El repositorio incluye cuatro variantes (IQ2_XXS, IQ2_XS, IQ2_M y Q2_K_XL) de entre 9,24 GB y 12,52 GB, con 2,26-3,06 bits por peso, y utiliza únicamente tipos de tensor estándar de llama.cpp (ningún tensor supera los 4 bits), por lo que carga en cualquier build reciente de llama.cpp. Esto permite ejecutar un modelo de razonamiento de 32B completamente en GPU en tarjetas de 12-16 GB de VRAM, algo inviable con los pesos originales en BF16, que rondan los 65 GB.

La licencia es Apache-2.0, heredada del modelo base, de modo que el uso comercial está permitido. El interés práctico está en la combinación de razonamiento tipo R1 a escala 32B con requisitos de memoria propios de un modelo de 7-9B, asumiendo la degradación de calidad inherente a 2 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Qwen/QwQ-32B); la model card de esta cuantización no detalla la arquitectura interna |
| Parametros totales | 32.763.876.352 (32,76 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens según el modelo base Qwen/QwQ-32B; no especificado en la model card de esta cuantización |
| Tipos de cuantizacion | IQ2_XXS (2,26 bpw), IQ2_XS (2,59 bpw), IQ2_M (2,79 bpw), Q2_K_XL (3,06 bpw) |
| Idiomas soportados | no disponible en la model card ni en los metadatos del repositorio |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp), cuatro archivos en un repositorio de 43,7 GB |
| Tamano por archivo | 9,24 GB / 10,58 GB / 11,40 GB / 12,52 GB |
| Libreria | gguf (llama.cpp) |
| Fecha de publicacion | 8 de octubre de 2026 (creacion), 8 de octubre de 2026 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/QwQ-32B, un transformer decoder-only denso de 32,76 B parámetros de la familia Qwen, entrenado por Alibaba Qwen para razonamiento explícito: genera una cadena de pensamiento antes de la respuesta final. La model card de esta cuantización no documenta la composición del dataset, el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí.

La innovación técnica de este repositorio es el método de cuantización DASH-Q, cuya model card describe como una cuantización de 2 bits que conserva únicamente tipos de tensor estándar de llama.cpp. No se documenta la descripción algorítmica del método en la información disponible; el repositorio de referencia es https://github.com/JaeminK/dashq. Los archivos resultantes no incluyen ningún tensor por encima de 4 bits, lo que garantiza compatibilidad con builds recientes de llama.cpp sin parches.

## Capacidades

- Generación de texto conversacional en formato multi-turno (la etiqueta `conversational` está presente en los metadatos).
- Razonamiento explícito con cadena de pensamiento (thinking mode): el modelo base QwQ está diseñado para producir un bloque de razonamiento antes de la respuesta, lo que según la documentación de NVIDIA mejora el rendimiento en problemas difíciles.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Generación y explicación de código, heredada del modelo base.
- Soporte de tool calling / function calling: no confirmado en la model card de esta cuantización (el modelo base Qwen sí lo soporta, pero no se documenta aquí).
- Capacidades de agente y razonamiento multi-paso: derivadas del modo de pensamiento del modelo base; no verificadas específicamente para esta cuantización.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades de visión o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Razonamiento matemático asistido en local: un equipo de investigación puede ejecutar IQ2_M (11,40 GB) en una RTX 4080 de 16 GB y resolver problemas de varios pasos sin enviar datos a una API externa, a costa de una perplejidad mayor que la de cuantizaciones de 4 bits.
- Asistente de código en estaciones de trabajo sin GPU de gama alta: con IQ2_XXS (9,24 GB) es posible hacer offload total en una GPU de 12 GB y mantener el contexto en 2-4 K tokens, suficiente para completar funciones y explicar fragmentos.
- Prototipado de pipelines de razonamiento antes de escalar a un despliegue con el modelo en BF16: el coste de validación se reduce al poder usar una única GPU consumer en lugar de un nodo con A100.
- Generación de documentación técnica y resúmenes de documentos largos: el modelo base soporta hasta 131.072 tokens de contexto, aunque con esta cuantización conviene limitar la longitud por el coste de la caché KV y por la pérdida de precisión acumulada.
- Evaluación comparativa de métodos de cuantización: el repositorio incluye la tabla de perplejidad completa, lo que lo hace útil como punto de referencia reproducible de DASH-Q frente a llama.cpp e Unsloth con la misma herramienta (`llama-perplexity`).
- Despliegue en entornos aislados (air-gapped): al ser un GGUF de llama.cpp con licencia Apache-2.0, puede distribuirse e integrarse en herramientas internas sin dependencia de servicios en la nube.
- Chatbot local de uso personal en hardware modesto: con IQ2_XS (10,58 GB) y cuantización de la caché KV, cabe en GPUs de 12-16 GB con contexto moderado.

## Benchmarks y rendimiento

La model card solo publica perplejidad (menor es mejor), medida con `llama-perplexity` a contexto 2048 sobre WikiText-2 test y C4 validation (256 secuencias de 2048 tokens). No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks para esta cuantización.

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 9,03 GB | 7,55 | 12,95 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 9,34 GB | 7,55 | 12,74 |
| IQ2_XXS | DASH-Q IQ2_XXS | 9,24 GB | 7,00 | 12,17 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 9,96 GB | 6,96 | 12,16 |
| IQ2_XS | DASH-Q IQ2_XS | 10,58 GB | 6,26 | 11,31 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 11,26 GB | 6,38 | 11,51 |
| IQ2_M | unsloth UD-IQ2_M | 11,50 GB | 6,50 | 11,51 |
| IQ2_M | DASH-Q IQ2_M | 11,40 GB | 6,04 | 11,03 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 12,31 GB | 6,37 | 11,37 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 12,70 GB | 6,19 | 11,09 |
| Q2_K_XL | DASH-Q Q2_K_XL | 12,52 GB | 6,03 | 10,97 |

Lectura de los datos: DASH-Q mejora la perplejidad frente a las alternativas en las cuatro categorías. La ganancia es mayor en IQ2_XXS (7,00 frente a 7,55, un 7,3 % mejor) y menor en Q2_K_XL (6,03 frente a 6,19, un 2,6 % mejor). El coste en tamano es de entre +0,21 GB y +0,62 GB según la variante. Las cifras corresponden a contexto 2048: no se publican mediciones a contextos largos.

## Requisitos de hardware

- Pesos en memoria (solo pesos): 9,24 GB (IQ2_XXS), 10,58 GB (IQ2_XS), 11,40 GB (IQ2_M), 12,52 GB (Q2_K_XL).
- Caché KV: estimación basada en una arquitectura de 64 capas con 8 cabezas KV de dimension 128, aproximadamente 0,25 MiB por token en FP16. Esto supone unos 2 GiB con 8 K tokens y unos 8 GiB con 32 K tokens; cuantizar la caché a Q8_0 reduce estas cifras a la mitad. No hay cifras oficiales publicadas para esta cuantización.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4070 Ti): solo IQ2_XXS con contexto corto (2-4 K tokens) y sin margen amplio; el resto de variantes requiere offload parcial de capas a CPU.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 4080): IQ2_XXS e IQ2_XS con contexto medio (8 K) de forma holgada; IQ2_M y Q2_K_XL con contexto corto o caché KV cuantizada.
- GPU de 24 GB (RTX 3090, RTX 4090): las cuatro variantes con offload total y contexto de 16-32 K usando caché KV cuantizada. Es el escenario recomendado para uso interactivo.
- GPU de datacenter (A100 40/80 GB, H100): sobredimensionadas para estos archivos; solo tienen sentido si se necesita contexto muy largo o varios usuarios concurrentes con `llama-server`.
- CPU y RAM: IQ2_XXS puede ejecutarse íntegramente en CPU con 16 GB de RAM; se recomiendan 32 GB para Q2_K_XL con contexto largo. El throughput en CPU no está documentado en la información disponible.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF con un Modelfile), LM Studio, koboldcpp y llama-cpp-python. El soporte de GGUF en vLLM es experimental y no se recomienda para cuantizaciones de 2 bits; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para estos archivos.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | WikiText-2 (ppl) | C4 (ppl) | Licencia |
|---|---|---|---|---|---|
| DASH-Q Q2_K_XL (este repo) | 32,76 B | 12,52 GB | 6,03 | 10,97 | Apache-2.0 |
| unsloth UD-Q2_K_XL | 32,76 B | 12,70 GB | 6,19 | 11,09 | Apache-2.0 |
| llama.cpp Q2_K (imatrix) | 32,76 B | 12,31 GB | 6,37 | 11,37 | Apache-2.0 |
| DASH-Q IQ2_M (este repo) | 32,76 B | 11,40 GB | 6,04 | 11,03 | Apache-2.0 |
| llama.cpp IQ2_M (imatrix) | 32,76 B | 11,26 GB | 6,38 | 11,51 | Apache-2.0 |
| QwQ-32B original (BF16) | 32,76 B | ~65 GB | no disponible | no disponible | Apache-2.0 |

Alternativas de la misma categoría (modelos de razonamiento de ~32B) que el autor ha cuantizado con el mismo método: jkim96/DeepSeek-R1-Distill-Qwen-32B-DASHQ-Q2-GGUF y jkim96/Olmo-3.1-32B-Instruct-DASHQ-Q2-GGUF. No se dispone de perplejidad comparable publicada para esos repositorios en la información disponible, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada la calidad de forma apreciable: la perplejidad en WikiText-2 se sitúa entre 6,03 y 7,00, muy por encima de lo esperable en cuantizaciones de 4 bits o superiores del mismo modelo. Para tareas sensibles a la precisión (matemáticas complejas, código en producción) conviene validar la variante concreta antes de adoptarla.
- Riesgo de alucinación acentuado: en modelos de razonamiento con cadenas de pensamiento largas, una cuantización agresiva puede producir cadenas internamente inconsistentes que el modelo no detecta. No se han publicado evaluaciones de fidelidad del razonamiento para estos archivos.
- La longitud de contexto práctica está limitada por la memoria, no solo por el modelo: 131.072 tokens es la cifra del modelo base, pero la caché KV necesaria a esa longitud excede cualquier GPU consumer. En la práctica se trabaja con 8-32 K tokens.
- Idiomas soportados no declarados en la model card. Aunque el modelo base Qwen es multilingüe, no hay confirmación para esta cuantización, y las cuantizaciones de 2 bits tienden a degradar antes los idiomas con menos representación en el entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia, e indicar los cambios realizados. Es la licencia heredada del modelo base Qwen/QwQ-32B.
- Cada archivo GGU​F incluye una única variante; el repositorio completo suma 43,7 GB si se descargan los cuatro.
- Requiere un build reciente de llama.cpp con soporte de los tipos IQ2_XXS, IQ2_XS, IQ2_M y Q2_K_XL. Builds antiguos pueden fallar al cargar los tensores.
- Adopción mínima y validación externa escasa: el repositorio registra 0 descargas y 0 likes, y DASH-Q es un método reciente cuyo único punto de referencia publicado es la tabla de perplejidad del propio autor. No se han realizado evaluaciones independientes.
- Las mediciones de perplejidad se hicieron a contexto 2048, por lo que no informan sobre el comportamiento en generaciones largas ni en contextos extensos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jkim96/QwQ-32B-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/Qwen/QwQ-32B
- Repositorio del método DASH-Q: https://github.com/JaeminK/dashq
- Imagen de portada de DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
- Documentación de QwQ-32B en NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/qwen-qwq-32b
- Cuantización hermana del mismo autor (DeepSeek-R1-Distill-Qwen-32B): https://huggingface.co/jkim96/DeepSeek-R1-Distill-Qwen-32B-DASHQ-Q2-GGUF
- Cuantización hermana del mismo autor (Olmo-3.1-32B-Instruct): https://huggingface.co/jkim96/Olmo-3.1-32B-Instruct-DASHQ-Q2-GGUF
- Ficha de registro en free2aitools (DeepSeek-R1-Distill-Qwen-32B DASH-Q): https://free2aitools.com/model/jkim96/deepseek-r1-distill-qwen-32b-dashq-q2-gguf
- Ficha de registro en free2aitools (Olmo 3.1 32B Instruct DASH-Q): https://free2aitools.com/model/jkim96/olmo-3.1-32b-instruct-dashq-q2-gguf
