# mradermacher/Whittle-Qwen-3.8-35B-A3B-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones en formato GGUF del modelo `logic65/Whittle-Qwen-3.8-35B-A3B`, publicadas por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a GGUF con cuantizaciones ponderadas mediante imatrix, orientada a su ejecución en llama.cpp y herramientas compatibles. El repositorio ocupa 49,3 GB e incluye un amplio abanico de niveles de cuantización, desde IQ1_S hasta Q6_K.

El modelo base cuenta con 35.547.542.656 parámetros totales, según los tensores safetensors del repositorio, lo que lo sitúa en la gama de los 35,5 mil millones de parámetros. El sufijo "A3B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible. El prefijo "Qwen" apunta a una familia derivada de Qwen, y la etiqueta "nicoboss" en los metadatos sugiere una posible procedencia de un ajuste o variante de ese autor.

La relevancia de esta ficha es limitada por la escasez de documentación: el repositorio no incluye model card descriptiva más allá de los metadatos de cuantización, no declara licencia, idiomas ni contexto, y registra 0 descargas y 0 likes en el momento de la captura. Se trata, por tanto, de una publicación reciente y sin validación comunitaria, útil principalmente para quien ya conozca el modelo base y quiera ejecutarlo en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El sufijo A3B del nombre sugiere mezcla de expertos (MoE) con ~3 B activos, sin confirmar en la informacion proporcionada |
| Parametros totales | 35.547.542.656 (~35,5 B), segun los tensores safetensors del repositorio |
| Parametros activos | No disponible (el nombre sugiere ~3 B activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |
| Tamano del repositorio | 49,3 GB (conjunto de todas las cuantizaciones) |
| Fecha de creacion | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El identificador `Whittle-Qwen-3.8-35B-A3B` sugiere una variante de la familia Qwen con 35.500 millones de parametros totales y un regimen de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos, un patron habitual en modelos como Qwen3-30B-A3B. Sin embargo, ni la model card ni los metadatos confirman esta arquitectura, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF, DPO o similares.

Lo unico documentado tecnicamente es el proceso de cuantizacion: el autor indica que se trata de cuantizaciones "weighted/imatrix" del modelo base, un metodo que ajusta la precision de cada tensor en funcion de su importancia medida mediante una matriz de informacion (imatrix), mejorando la calidad respecto a cuantizaciones uniformes del mismo tamano. Los metadatos internos registran `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversion desde pesos de HuggingFace.

## Capacidades

- No se han documentado capacidades especificas en la informacion proporcionada.
- La etiqueta `conversational` del repositorio sugiere optimizacion o uso previsto para dialogos multi-turno.
- La etiqueta `endpoints_compatible` indica compatibilidad con endpoints de inferencia tipo API.
- Al derivar de un modelo de la familia Qwen con nomenclatura de mezcla de expertos, es probable que herede capacidades de generacion de texto, razonamiento y codigo, pero esto no puede confirmarse con los datos disponibles.
- No hay confirmacion de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

Los siguientes casos son aplicaciones plausibles dado el perfil del repositorio, pero deben validarse experimentalmente antes de llevarlos a produccion, ya que no existen evaluaciones publicadas del modelo:

- Despliegue local en estaciones de trabajo: las cuantizaciones IQ2/IQ3 (en torno a 10-15 GB) permiten ejecutar un modelo de 35,5 B en GPUs de consumo con 12-16 GB de VRAM mediante offload parcial en llama.cpp.
- Generacion de texto y asistentes conversacionales: el tag `conversational` sugiere uso en dialogos multi-turno; la eficiencia de una arquitectura MoE con pocos parametros activos reduce el coste por token frente a un modelo denso del mismo tamano.
- Prototipado rapido en CPU: las cuantizaciones mas agresivas (IQ1_S, IQ2_XXS) permiten probar el modelo en equipos sin GPU dedicada, a costa de una degradacion de calidad significativa.
- Integracion en aplicaciones de escritorio: al ser GGUF, el modelo se puede empaquetar con Ollama, LM Studio o llama-cpp-python para aplicaciones offline sin dependencia de servicios en la nube.
- Experimentacion academica con tecnicas de cuantizacion: el repositorio ofrece 24 niveles distintos del mismo modelo, lo que permite estudiar la degradacion de calidad en funcion del ancho de bits de forma controlada.
- Servicios autoalojados con API compatible: la etiqueta `endpoints_compatible` sugiere que el modelo puede exponerse mediante un endpoint OpenAI-compatible para integrarse en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de tamano son estimaciones calculadas a partir del numero de parametros (35,5 B) y del ancho de bits aproximado de cada familia de cuantizacion. No proceden de mediciones del repositorio.

| Cuantizacion | Tamano aproximado de pesos | VRAM recomendada (con contexto) |
|---|---|---|
| IQ1_S | ~7 GB | 8-10 GB |
| IQ2_XXS / IQ2_XS | ~9-10 GB | 12 GB |
| IQ2_S / IQ2_M / Q2_K | ~11-12,5 GB | 12-16 GB |
| IQ3_XXS / IQ3_XS / IQ3_S | ~13,5-15,5 GB | 16-20 GB |
| Q3_K_M / Q3_K_L | ~17-19 GB | 20-24 GB |
| IQ4_XS / Q4_0 / Q4_1 | ~19-20 GB | 24 GB |
| Q4_K_S / Q4_K_M | ~20,5-21,5 GB | 24 GB |
| Q5_K_S / Q5_K_M | ~24-25,5 GB | 32-40 GB |
| Q6_K | ~29 GB | 40 GB |

- Cabe en GPU de consumo: las cuantizaciones de 1 a 3 bits caben en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080). Las de 4 bits requieren 24 GB (RTX 3090, RTX 4090) o reparto entre dos GPU de 12 GB. Las de 5-6 bits exigen 32-48 GB.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S para las cuantizaciones altas y para servir varias instancias concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con GGUF. vLLM admite GGUF de forma experimental. No se recomienda TGI para GGUF por soporte limitado.
- Latencia y throughput: no disponibles. Al tratarse presumiblemente de una arquitectura MoE con ~3 B de parametros activos, el coste de computo por token deberia ser inferior al de un modelo denso de 35 B, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

Las cifras de los modelos de referencia proceden de su documentacion publica, no de la informacion proporcionada para este repositorio.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|
| Whittle-Qwen-3.8-35B-A3B (este repositorio) | 35,5 B | No disponible (~3 B segun el nombre) | No disponible | No disponible | GGUF |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32.768 nativo, ampliable a 131.072 | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 | Apache 2.0 | safetensors, GGUF |
| Llama 3.3 70B | 70 B | 70 B (denso) | 128.000 | Llama 3.3 Community License | safetensors, GGUF |

Frente a Qwen3-30B-A3B, el modelo de este repositorio tiene un 16 % mas de parametros totales y un regimen de activacion similar, pero carece de licencia declarada y de benchmarks publicados. Frente a Mixtral 8x7B, activa muchos menos parametros por token, lo que se traduce en menor coste de inferencia. Frente a un denso como Llama 3.3 70B, ofrece presumiblemente una latencia muy inferior a costa de capacidad potencialmente menor. La ausencia de datos de rendimiento impide una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Contactar con el autor o con el publicador del modelo base antes de usarlo en produccion.
- Sin resultados de benchmarks: no hay evidencia publica del rendimiento en tareas de razonamiento, codigo o matematicas.
- Es un repositorio de cuantizacion, no el modelo original: la calidad final depende del nivel elegido. Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ2_XXS, IQ2_XS) degradan notablemente la coherencia y no deberian usarse en aplicaciones sensibles.
- Longitud de contexto, idiomas soportados y capacidades de tool calling no documentados.
- Sin evaluacion de sesgos ni de seguridad publicada.
- Los metadatos incluyen la etiqueta `nicoboss`, asociada en la comunidad a modelos ajustados o variantes sin censura. Esto podria implicar una alineacion de seguridad reducida, aunque no esta confirmado y debe tratarse como una cautela, no como un hecho verificado.
- Riesgo de alucinacion no medido; en ausencia de evaluaciones, aplicar las precauciones habituales en produccion (verificacion de salidas, citas de fuentes, supervision humana).
- 0 descargas y 0 likes en el momento de la captura: sin validacion de la comunidad ni informes de comportamiento en uso real.
- Fecha de publicacion muy reciente, lo que reduce la probabilidad de que existan conversiones alternativas o correcciones posteriores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mradermacher/Whittle-Qwen-3.8-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a productos farmaceuticos sin relacion con el repositorio. No se dispone de paper, blog tecnico ni demo asociados.
