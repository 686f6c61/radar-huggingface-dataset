# jkim96/Qwen3.5-35B-A3B-DASHQ-Q2-GGUF

## Resumen

Qwen3.5-35B-A3B-DASHQ-Q2-GGUF es una coleccion de cuantizaciones de 2 bits del modelo Qwen3.5-35B-A3B, publicada por el usuario jkim96 en HuggingFace. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer de tipo Mixture of Experts (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. Esta version concreta aplica la tecnica de cuantizacion DASH-Q (desarrollada por JaeminK) para comprimir el modelo a entre 2,35 y 2,67 bits por peso, generando ficheros GGUF de entre 10,44 GB y 11,88 GB que se cargan en cualquier build reciente de llama.cpp.

La relevancia de esta ficha esta en que permite ejecutar un modelo MoE de 35B en hardware de consumo: al reducir el peso a aproximadamente 11-12 GB, el modelo cabe en GPUs de 16 GB o incluso de 12 GB con contexto reducido, algo inviable con los pesos originales en bf16 (unos 69 GB). Ademas, al ser MoE con solo 3B activos, el coste computacional por token es bajo, lo que se traduce en velocidades de generacion propias de un modelo mucho mas pequeno.

El repositorio incluye tres variantes (IQ2_XXS, IQ2_XS y Q2_K_XL) y publica mediciones de perplejidad en WikiText-2 y C4 que superan a las cuantizaciones equivalentes de llama.cpp y a las de unsloth. Se trata de una cuantizacion solo de texto: la torre de vision del modelo base no esta incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), modelo base Qwen3.5-35B-A3B |
| Parametros totales | 34.660.610.688 (aproximadamente 34,66 mil millones) |
| Parametros activos | aproximadamente 3 mil millones (segun la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (2,35 bits/peso), IQ2_XS (2,50 bits/peso), Q2_K_XL (2,67 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), sin tensores por encima de 4 bits |

Tamano de los ficheros publicados:

| Fichero | Tipo | Tamano | Bits por peso |
|---|---|---|---|
| `Qwen3.5-35B-A3B-DASHQ-IQ2_XXS.gguf` | IQ2_XXS | 10,44 GB | 2,35 |
| `Qwen3.5-35B-A3B-DASHQ-IQ2_XS.gguf` | IQ2_XS | 11,11 GB | 2,50 |
| `Qwen3.5-35B-A3B-DASHQ-Q2_K_XL.gguf` | Q2_K_XL | 11,88 GB | 2,67 |

El tamano total del repositorio es de 68,3 GB. Nota: la tabla de perplejidad del autor asigna 12,36 GB al fichero Q2_K_XL, mientras que la tabla de ficheros indica 11,88 GB; la discrepancia no se explica en la model card.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un transformer con capa de mezcla de expertos (MoE). Segun la informacion disponible, se trata de un modelo de razonamiento y vision-lenguaje que soporta uso de herramientas, con 35B parametros totales y 3B activados por token. La cuantizacion DASH-Q actua sobre los pesos del modelo base y, segun el autor, emplea unicamente tipos de tensor estandar de llama.cpp, sin ningun tensor por encima de 4 bits, lo que garantiza compatibilidad con builds recientes del runtime. La torre de vision no se incluye en estos GGUF, por lo que el resultado es un modelo exclusivamente de texto.

No hay informacion disponible en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre las etapas de alineacion (RLHF, DPO u otras) del modelo base. Tampoco se detallan innovaciones de atencion o decodificacion mas alla de la propia cuantizacion DASH-Q, cuyo objetivo es minimizar la perdida de calidad en regimenes de muy baja precision mediante una asignacion optimizada de bits por tensor.

## Capacidades

- Generacion de texto conversacional, orientada a tareas de asistencia y dialogo (la etiqueta del repositorio incluye `conversational`).
- Razonamiento, segun la descripcion del modelo base como modelo de razonamiento.
- Capacidades de vision propias del modelo base, no disponibles en esta cuantizacion al no incluirse la torre de vision.
- Soporte de tool calling / function calling, heredado del modelo base segun la informacion del modelo original.
- Uso en agentes y razonamiento multi-paso, derivado del soporte de herramientas del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Inferencia en CPU y GPU mediante llama.cpp, con carga directa de los ficheros GGUF.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a sus 10-12 GB de pesos, el modelo puede ejecutarse en una unica RTX 4080 o RTX 4060 Ti de 16 GB, permitiendo asistentes de codigo o chat sin depender de servicios en la nube.
- Asistente de programacion integrado en el IDE: el soporte de tool calling del modelo base permite conectarlo a herramientas de compilacion, linters o busqueda en repositorio, y los 3B parametros activos mantienen baja la latencia por token.
- Generacion de codigo en pipelines de CI/CD: puede invocarse mediante `llama-server` para tareas de revision de parches, generacion de tests o resumenes de cambios, con coste de hardware contenido.
- Procesamiento por lotes en servidores con GPU modestas: la combinacion de MoE con 3B activos y pesos de 2 bits permite servir varias instancias o peticiones concurrentes en una sola GPU de 24 GB.
- Analisis y resumen de documentacion tecnica larga: el modelo puede gestionar entradas extensas dentro de su ventana de contexto (longitud no confirmada en la informacion disponible) para condensar manuales y repositorios.
- Experimentacion en investigacion sobre cuantizacion extrema: al publicar curvas de perplejidad frente a otras cuantizaciones de 2 bits, sirve como referencia reproducible para estudiar el impacto de la precision reducida en modelos MoE.
- Chat de asistencia tecnica en entornos con requisitos de privacidad: al ejecutarse integramente en local y bajo licencia Apache 2.0, se puede desplegar sin enviar datos a terceros.
- Evaluacion comparativa de tecnicas de cuantizacion: util para equipos que quieran medir el equilibrio entre tamano y calidad en sus propios dominios frente a las variantes de llama.cpp o unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente proporciona mediciones de perplejidad con `llama-perplexity` a contexto 2048, sobre WikiText-2 test y C4 validation (256 secuencias de 2048 tokens):

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 9,97 GB | 8,51 | 12,64 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 10,66 GB | 6,71 | 10,80 |
| IQ2_XXS | DASH-Q IQ2_XXS | 10,44 GB | 6,68 | 11,03 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 10,98 GB | 8,09 | 11,83 |
| IQ2_XS | DASH-Q IQ2_XS | 11,11 GB | 6,47 | 10,78 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 12,14 GB | 7,33 | 11,13 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 13,42 GB | 6,77 | 11,08 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 12,16 GB | 6,43 | 10,53 |
| Q2_K_XL | DASH-Q Q2_K_XL | 12,36 GB | 6,40 | 10,64 |

Menor perplejidad es mejor. En WikiText-2, la variante DASH-Q Q2_K_XL obtiene el mejor valor de la tabla (6,40); en C4, la mejor marca es para unsloth UD-Q2_K_XL (10,53), seguida de cerca por DASH-Q Q2_K_XL (10,64).

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 10,5 GB (IQ2_XXS), 11,1 GB (IQ2_XS) y 11,9 GB (Q2_K_XL).
- VRAM adicional para cache KV: no cuantificada en la informacion disponible; depende de la longitud de contexto configurada y de la configuracion de atencion del modelo base. Con 8192 tokens de contexto el uso total se situa por encima de los pesos, por lo que se recomienda reservar margen.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 / 4080 Super (16 GB) y RTX 4060 Ti 16 GB pueden alojar los pesos completos con contexto moderado. En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) el modelo entra con contexto reducido o requiriendo offload parcial de capas a CPU.
- Configuraciones de multiples GPU: no documentadas en la informacion disponible.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-perplexity`), y por extension herramientas compatibles con GGUF como Ollama o LM Studio (el modelo base aparece listado en LM Studio). La compatibilidad directa con vLLM o TGI para estos ficheros no esta documentada en la informacion proporcionada.
- Ejemplo de invocacion publicado por el autor: `llama-cli -m Qwen3.5-35B-A3B-DASHQ-Q2_K_XL.gguf -ngl 99 -c 8192`.
- Latencia y throughput: no disponibles. Como referencia cualitativa, al tratarse de un MoE con aproximadamente 3B parametros activos, el coste por token es sustancialmente inferior al de un modelo denso del mismo tamano total.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de cuantizacion | Tamano | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-DASHQ (este repo) | 34,66B totales / ~3B activos | IQ2_XXS, IQ2_XS, Q2_K_XL | 10,44-11,88 GB | 6,40-6,68 | Apache 2.0 | HuggingFace (jkim96) |
| Qwen3.5-35B-A3B cuantizado por llama.cpp | 34,66B totales / ~3B activos | IQ2_XXS, IQ2_XS, IQ2_M, Q2_K (imatrix) | 9,97-13,42 GB | 6,77-8,51 | Apache 2.0 | llama.cpp / HuggingFace |
| Qwen3.5-35B-A3B cuantizado por unsloth | 34,66B totales / ~3B activos | UD-IQ2_XXS, UD-Q2_K_XL | 10,66-12,16 GB | 6,43-6,71 | Apache 2.0 | HuggingFace (unsloth) |

No se dispone de datos sobre otras alternativas de la misma categoria (por ejemplo, cuantizaciones de 2 bits de otros MoE) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits degrada la calidad respecto a los pesos originales; las perplejidades de 6,4-6,7 en WikiText-2 son notablemente superiores a las de un modelo en 8 o 16 bits, y el impacto puede ser mayor en tareas de razonamiento o codigo que en modelado de lenguaje general.
- No se incluye la torre de vision: cualquier caso de uso multimodal del modelo base no es posible con estos ficheros.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad especificas para esta cuantizacion. Al ser una derivacion del modelo base, hereda los sesgos y limitaciones de este.
- La longitud de contexto soportada no esta documentada en la informacion disponible; no debe asumirse la ventana del modelo base sin verificarla.
- Los idiomas soportados no estan documentados en la informacion proporcionada.
- Licencia Apache 2.0, heredada del modelo base, lo que permite uso comercial segun los terminos de dicha licencia, pero conviene revisar las condiciones del modelo original Qwen/Qwen3.5-35B-A3B.
- El repositorio tiene un volumen de descargas bajo (570) y cero likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es limitada.
- No se han publicado benchmarks de tareas (solo perplejidad), de modo que el rendimiento real en aplicaciones concretas no esta verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkim96/Qwen3.5-35B-A3B-DASHQ-Q2-GGUF
- Variante relacionada DASHQ-INT4-g64: https://huggingface.co/jkim96/Qwen3.5-35B-A3B-DASHQ-INT4-g64
- Repositorio de la tecnica DASH-Q: https://github.com/JaeminK/dashq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-35b-a3b
- Repositorio de referencia Qwen3.5 en GitHub: https://github.com/LifeJiggy/Qwen3.5
- Entrada de directorio sobre la variante INT4-g32: https://essamamdani.com/ai-models/hf-jkim96-qwen3-5-35b-a3b-dashq-int4-g32
