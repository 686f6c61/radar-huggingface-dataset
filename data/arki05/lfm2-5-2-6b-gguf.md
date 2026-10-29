# Arki05/LFM2.5-2.6B-GGUF

## Resumen

LFM2.5-2.6B-GGUF (Arki05) es una colección de 17 cuantizaciones GGUF del modelo LiquidAI/LFM2.5-2.6B, un modelo de texto de 2.697.198.592 parámetros (~2,69 B) desarrollado por Liquid AI como miembro de la familia LFM2.5, orientado específicamente a cargas de trabajo agénticas y con una ventana de contexto de 128 000 tokens según la documentación de la familia. Este repositorio no es un modelo nuevo: es una redistribución cuantizada del checkpoint oficial en BF16, publicada por un tercero (Arki05).

El interés del repositorio está en el método de cuantización. En lugar de aplicar un tipo GGUF uniforme, cada tensor recibe un tipo distinto (mezcla de IQ2_XXS a Q8_0, con BF16 en tensores pequeños a partir de 5,16 bits por peso) mediante la herramienta qalloc. El autor publica métricas de divergencia KL frente al modelo BF16 y compara con los ficheros de tamaño equivalente de bartowski y de Liquid AI, reportando reducciones de entre el 26 % y el 77 % en KL, y de aproximadamente la mitad o menos en el rango de 3 a 5 bits por peso.

Es relevante ahora porque permite ejecutar un modelo de 2,69 B con contexto largo en hardware muy modesto: los ficheros van de 1,02 GB (3,01 bpw) a 2,30 GB (6,80 bpw), lo que los sitúa en el rango de cualquier GPU de consumo, e incluso de CPU con llama.cpp. La contrapartida es que se trata de un repositorio de terceros con licencia LFM Open License v1.0, no de una publicación oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (familia de Liquid AI, según la model card); detalles de capas y bloques no disponibles en la información proporcionada |
| Parámetros totales | 2.697.198.592 (~2,69 B) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 128 000 tokens (familia LFM2.5); no verificado en la model card de este repositorio |
| Tipos de cuantización | Mezcla por tensor de tipos estándar de llama.cpp: IQ2_XXS, IQ3_XXS/XS/M, Q2_K, Q3_K_M/L/XL, IQ4_XS, Q4_0, Q4_1, Q4_K_M/L, Q5_K_M/L, Q6_K/L, Q8_0 y BF16 para tensores pequeños; 17 ficheros entre 3,01 y 6,80 bpw. Variantes `-hq` y `-hq1` cuantizadas por Hessianas (familia GPTQ) usadas internamente en la selección, pero los GGUF publicados solo contienen tipos llama.cpp estándar |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiqueta `other`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors/BF16 está en LiquidAI/LFM2.5-2.6B |
| Tamaño del repositorio | 37,4 GB (17 ficheros) |
| Tamaño por fichero | De 1,02 GB (3,01 bpw) a 2,30 GB (6,80 bpw) |
| Descargas / likes | 281 descargas, 0 likes |
| Fecha de creación / actualización | 2026-10-20 / 2026-10-29 |

## Arquitectura y entrenamiento

La model card de este repositorio no documenta la arquitectura interna ni el proceso de entrenamiento; solo indica que parte de los pesos BF16 de LiquidAI/LFM2.5-2.6B, reconstruidos en el repositorio de shards Arki05/LFM2.5-2.6B-GGUF-shards. La documentación de la familia LFM2.5 describe el modelo base como un modelo de texto de 2,69 B construido sobre la arquitectura LFM2 y post-entrenado específicamente para cargas agénticas, con 128 000 tokens de contexto. No se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición del corpus ni etapas de RLHF/DPO.

La innovación técnica de este repositorio es la herramienta de asignación de tipos por tensor. qalloc mantiene un almacén con cada tensor del modelo en cada tipo de cuantización disponible, incluyendo dos builds cuantizados por Hessianas (`-hq` y `-hq1`) por cada tipo de llama.cpp, y resuelve la mezcla óptima para un tamaño objetivo. El resultado es un GGUF que solo contiene tipos estándar de llama.cpp, por lo que se ejecuta en llama.cpp sin parches y en cualquier proyecto derivado (Ollama, LM Studio, llama-cpp-python, koboldcpp). Además, el autor ofrece una aplicación web que resuelve la mezcla para cualquier tamaño elegido y ensambla el fichero en el navegador a partir de los shards.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y la plantilla de chat del modelo base están presentes; el pipeline declarado es `text-generation`.
- Cargas agénticas: el modelo base está post-entrenado para flujos de trabajo con agentes según la documentación de la familia LFM2.5.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el formato es consumible por servicios de inferencia compatibles con llama.cpp.
- Ejecución local en llama.cpp: todos los tensores son de tipos estándar, sin operadores personalizados.
- Ajuste fino del compromiso calidad/tamaño: 17 puntos de operación entre 3,01 y 6,80 bpw, más la posibilidad de generar tamaños intermedios con la aplicación qalloc.
- Modelo solo de texto: no se declaran capacidades de visión, audio ni multimodalidad en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la model card de este repositorio; la orientación agéntica del modelo base es el único indicio disponible.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en portátiles y equipos sin GPU dedicada: el fichero de 3,01 bpw ocupa 1,02 GB y puede ejecutarse en CPU con llama.cpp a velocidades interactivas, lo que permite tener un asistente conversacional local sin conexión.
- Asistente de código en el IDE: con el fichero de 4,94 bpw (1,67 GB) y contexto de hasta 128 000 tokens, el modelo puede mantener el contexto de varios ficheros abiertos y responder con latencia baja en una RTX 4060 o similar.
- Procesado por lotes de documentos largos: la ventana de contexto extendida permite resumir o extraer información de contratos, informes o expedientes completos en una sola pasada, con la ventaja de que el modelo cabe entero en VRAM junto con cachés KV moderadas.
- Prototipado de agentes antes de escalar: al ser un modelo pequeño y con orientación agéntica, sirve para validar bucles de tool calling y planificación multi-paso en local antes de migrar a un modelo mayor, con un coste de iteración muy bajo.
- Clasificación y etiquetado de texto a gran escala: sustituye llamadas a API en tareas de extracción de entidades o categorización donde el coste por token importa, ejecutando varias instancias en paralelo en una sola GPU de 24 GB.
- Entornos con requisitos de privacidad o air-gapped: al distribuirse como GGUF y ejecutarse íntegramente en local, los datos no salen de la máquina, lo que encaja en sectores regulados.
- Base para ajuste fino ligero y experimentación con cuantización: el repositorio de shards permite reconstruir el modelo en cualquier mezcla de tipos, útil para estudiar el impacto de la cuantización por tensor en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor publica métricas de fidelidad de cuantización: divergencia KL media por token frente al modelo BF16 (menor es mejor) y porcentaje de veces que el token más probable coincide con el del BF16 (mayor es mejor), sobre WikiText-2 y un conjunto propio de calibración (calibration-v6).

| Fichero | bpw | Tamaño | Referencia de tamaño similar | KLD WikiText-2 | KLD calibration-v6 | Top-1 igual WikiText-2 (%) | Top-1 igual calibration-v6 (%) |
|---|---|---|---|---|---|---|---|
| 3.01bpw | 3,01 | 1,02 GB | bartowski IQ2_M | 0,848 → 0,411 (−52 %) | 1,08 → 0,539 (−50 %) | 59,5 → 71,4 | 65,6 → 75,7 |
| 3.24bpw | 3,24 | 1,10 GB | bartowski Q2_K | 0,940 → 0,318 (−66 %) | 1,39 → 0,395 (−72 %) | 58,6 → 75,0 | 65,7 → 78,8 |
| 3.43bpw | 3,43 | 1,17 GB | bartowski Q2_K_L | 0,939 → 0,253 (−73 %) | 1,39 → 0,324 (−77 %) | 58,6 → 77,6 | 65,7 → 80,8 |
| 3.81bpw | 3,81 | 1,29 GB | bartowski IQ3_M | 0,384 → 0,150 (−61 %) | 0,542 → 0,229 (−58 %) | 72,5 → 82,4 | 75,8 → 84,3 |
| 4.29bpw | 4,29 | 1,45 GB | bartowski Q3_K_L | 0,281 → 0,0850 (−70 %) | 0,468 → 0,135 (−71 %) | 76,3 → 86,4 | 78,5 → 87,7 |
| 4.47bpw | 4,47 | 1,52 GB | bartowski Q3_K_XL (y IQ4_XS, +0,3 %) | 0,279 → 0,0678 (−76 %) | 0,464 → 0,105 (−77 %) | 76,3 → 87,6 | 78,6 → 89,1 |
| 4.94bpw | 4,94 | 1,67 GB | LiquidAI Q4_K_M / bartowski Q4_K_M (+0,6 %) | 0,160/0,0952 → 0,0497 | 0,235/0,175 → 0,0760 | 81,4/85,6 → 89,6 | 83,6/86,3 → 90,7 |
| 5.73bpw | 5,73 | 1,94 GB | LiquidAI Q5_K_M / bartowski Q5_K_M (+0,4 %) | 0,0487/0,0334 → 0,0233 | 0,0867/0,0648 → 0,0374 | 89,3/91,2 → 92,5 | 90,0/91,5 → 93,1 |
| 6.56bpw | 6,56 | 2,22 GB | LiquidAI Q6_K / bartowski Q6_K (+0,7 %) | 0,0166/0,0131 → 0,00936 | 0,0313/0,0237 → 0,0161 | 93,4/94,2 → 94,9 | 93,8/94,6 → 95,3 |

Lectura práctica: por debajo de 4 bpw la divergencia sigue siendo alta en términos absolutos (KLD 0,15-0,41), mientras que a partir de 4,94 bpw el modelo se acerca al BF16 con KLD 0,0497 y un 89,6 % de coincidencia en el token más probable. El punto de equilibrio razonable para uso en producción es 4,70-5,16 bpw (1,59-1,75 GB).

## Requisitos de hardware

- VRAM para inferencia (solo pesos): 1,02 GB con el fichero de 3,01 bpw; 1,67 GB con el de 4,94 bpw; 2,30 GB con el de 6,80 bpw.
- VRAM total incluyendo caché KV: no disponible con precisión (no se detallan capas ni cabezas KV en la información proporcionada). Como referencia práctica, los ficheros de 4-5 bpw funcionan con comodidad en 8 GB de VRAM con contextos de 8 000 a 16 000 tokens; a 128 000 tokens la caché KV puede crecer varios GB y conviene usar cuantización de caché (Q8_0/Q4_0) en llama.cpp.
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB o más (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RX 7600). En el extremo alto, A100/H100 no son necesarias; una GPU de 24 GB permite múltiples instancias en paralelo o contexto muy largo.
- ¿Cabe en GPU de consumo? Sí, todos los ficheros, incluido el de 6,80 bpw, caben en GPUs de 4 GB o más; con 3,01 bpw también es viable en iGPU y CPU.
- Opciones de despliegue: llama.cpp (principal), Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y cualquier servicio compatible con endpoints de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habría que partir del modelo base en safetensors.
- Latencia y throughput: no disponibles. Al ser un modelo de 2,69 B, se espera una velocidad muy superior a la de modelos de 7-8 B en el mismo hardware, pero no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

| Repositorio | Modelo base | Rango de cuantizaciones | Tamaño típico Q4 | Enfoque | Licencia |
|---|---|---|---|---|---|
| Arki05/LFM2.5-2.6B-GGUF (este) | LiquidAI/LFM2.5-2.6B | Mezcla por tensor, 3,01-6,80 bpw, 17 ficheros | 1,67 GB (4,94 bpw) | Minimizar KL a tamaño dado mediante qalloc | LFM v1.0 |
| LiquidAI/LFM2.5-2.6B-GGUF | LiquidAI/LFM2.5-2.6B | Q4_0, Q4_K_M, Q5_K_M, Q6_K, más un build QAD | ~1,68 GB (Q4_K_M) | Cuantizaciones oficiales, incluida QAD (quantization-aware distillation) | LFM v1.0 |
| bartowski/LiquidAI_LFM2.5-2.6B-GGUF | LiquidAI/LFM2.5-2.6B | IQ2_M a Q6_K_L, escalera estándar | ~1,68 GB (Q4_K_M) | Cuantizaciones estándar de referencia en la comunidad | LFM v1.0 |
| prithivMLmods/LFM2.5-2.6B-GGUF | LiquidAI/LFM2.5-2.6B | No detallado en la información disponible | No disponible | Espejo en ModelScope | LFM v1.0 |

Frente a los ficheros de bartowski y de Liquid AI, el autor reporta menor KLD en todos los tamaños comparables, con una ventaja especialmente grande en el rango de 3 a 4,5 bpw (hasta −77 %). La ventaja se estrecha en 5,73 y 6,56 bpw, donde la reducción cae al 29-52 %. La opción oficial QAD (quantization-aware distillation) de Liquid AI no aparece en la comparativa del autor, por lo que no hay datos que permitan situarla frente a estas mezclas.

## Limitaciones y advertencias

- Repositorio de terceros: no lo mantiene Liquid AI. La trazabilidad y la continuidad de las actualizaciones dependen del autor individual (Arki05).
- Licencia LFM Open License v1.0: no es una licencia de código abierto permisiva. Es responsabilidad del usuario revisar el fichero LICENSE antes de cualquier uso comercial o redistribución; no se detallan en la información proporcionada las condiciones exactas sobre atribución, límites de ingresos o restricciones de despliegue.
- Riesgo de alucinación: inherente a un modelo de 2,69 B de parámetros. En tareas de razonamiento factual o matemáticas complejas la fiabilidad es inferior a la de modelos de mayor tamaño; no hay benchmarks publicados en esta ficha que permitan cuantificarla.
- Idiomas: no se declara la lista de idiomas soportados. No se puede asumir un rendimiento correcto en castellano sin evaluarlo; conviene validar con un conjunto propio antes de desplegar en producción.
- Calidad en cuantizaciones bajas: con 3,01-3,43 bpw el KLD absoluto es 0,25-0,41 y solo el 71-78 % de los tokens más probables coinciden con el BF16. Para tareas sensibles al detalle conviene ir a 4,70 bpw o más.
- Compatibilidad restringida a llama.cpp y derivados: no hay ficheros para vLLM, TGI o TensorRT-LLM en este repositorio; el formato GGUF limita el uso de motores de alto throughput con batching continuo.
- Contexto: el dato de 128 000 tokens procede de la documentación de la familia LFM2.5, no de la model card de este repositorio. El contexto efectivo puede degradarse en los extremos de la ventana y el coste de memoria de la caché KV crece de forma lineal.
- Metadatos incompletos: el pipeline está declarado como `text-generation`, pero no se publican detalles de arquitectura, plantilla de chat ni parámetros de generación en este repositorio; hay que consultarlos en el modelo base.
- Ficheros `-hq`/`-hq1`: son builds internos del autor usados durante la selección. Los GGUF publicados contienen únicamente tipos estándar de llama.cpp, por lo que no se obtiene ninguna ventaja de ejecución específica al descargarlos, solo de calidad.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/Arki05/LFM2.5-2.6B-GGUF
- Repositorio de shards (todos los tensores en todos los tipos): https://huggingface.co/Arki05/LFM2.5-2.6B-GGUF-shards
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Cuantizaciones oficiales de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF
- Cuantizaciones de bartowski (referencia comparativa): https://huggingface.co/bartowski/LiquidAI_LFM2.5-2.6B-GGUF
- Espejo en ModelScope: https://www.modelscope.cn/models/prithivMLmods/LFM2.5-2.6B-GGUF
- Proyecto qalloc (herramienta de asignación de tipos por tensor): https://arki05.com/projects/qalloc/
- Aplicación web qalloc (construir un GGUF a medida): https://qalloc.arki05.com
- Ficha en Free2AITools: https://free2aitools.com/model/arki05/lfm2.5-2.6b-gguf
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/lfm2-5-2-6b.html
