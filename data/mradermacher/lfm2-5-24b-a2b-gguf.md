# mradermacher/LFM2.5-24B-A2B-GGUF

## Resumen

LFM2.5-24B-A2B-GGUF es la version cuantizada en formato GGUF del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario mradermacher. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 23.971.587.712 parametros totales segun los pesos en safetensors del modelo original, orientado por su nomenclatura (A2B) y por las etiquetas del repositorio (liquid, lfm2.5, edge, moe) al despliegue en entornos de borde y hardware limitado. El nombre del modelo base corresponde al laboratorio LiquidAI, responsable de la familia LFM (Liquid Foundation Models).

Este repositorio no aporta el modelo entrenado, sino una coleccion de cuantizaciones estaticas generadas con llama.cpp a partir de los pesos originales. Incluye once variantes que van desde Q2_K (8,9 GB) hasta Q8_0 (25,6 GB), lo que permite ajustar el equilibrio entre calidad y huella de memoria en funcion del hardware disponible. Los pesos originales en precision completa requieren el repositorio del modelo base.

La relevancia de esta publicacion es practica: al ser un MoE con aproximadamente 2.000 millones de parametros activos por token (segun la nomenclatura A2B del nombre; no confirmado de forma explicita en la informacion disponible), el coste computacional por token es previsiblemente muy inferior al de un modelo denso de 24.000 millones de parametros, mientras que la cuantizacion GGUF reduce adicionalmente los requisitos de VRAM. El repositorio declara soporte para 16 idiomas y una licencia lfm1.0 de tipo "other". El numero de descargas en el momento de la consulta es de 44 y el repositorio no tiene likes, por lo que se trata de una publicacion reciente y con poca adopcion registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformers, segun etiquetas del repositorio y modelo base LiquidAI/LFM2.5-24B-A2B (no se detalla en la informacion disponible) |
| Parametros totales | 23.971.587.712 (23,97 mil millones) |
| Parametros activos | No disponible de forma explicita; la nomenclatura A2B del nombre sugiere del orden de 2.000 millones activos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; el repositorio tambien menciona x-f16 e imatrix en el modelo i1 |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco (16 idiomas) |
| Licencia | lfm1.0, etiquetada como "other" con enlace a LICENSE |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors para transformers) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo original mas alla de su caracter MoE: el repositorio cuantizado no incluye detalles sobre el numero de expertos, el mecanismo de enrutamiento, el tipo de atencion ni la disposicion de las capas. La etiqueta "liquid" del repositorio remite a la familia LFM de LiquidAI, y la etiqueta "edge" indica que el modelo esta pensado para despliegue en dispositivos con recursos limitados. El prefijo A2B en el nombre sigue la convencion habitual en modelos MoE de indicar el numero de parametros activos (aproximadamente 2B) frente al total (24B).

Tampoco se detallan en la informacion proporcionada los datos de entrenamiento: no hay cifras sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o decodificacion especulativa. El repositorio de mradermacher es exclusivamente un artefacto de cuantizacion: los ficheros GGUF se generaron a partir de los pesos del modelo base mediante llama.cpp, con cuantizaciones estaticas en esta publicacion y una version adicional con cuantizacion ponderada por importancia (imatrix) publicada en un repositorio separado. Para obtener informacion sobre arquitectura y proceso de entrenamiento es necesario consultar la model card de LiquidAI/LFM2.5-24B-A2B, que no forma parte de los datos disponibles en esta ficha.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio indica que el modelo esta ajustado para dialogos multi-turno.
- Capacidades multilingues: 16 idiomas declarados, con cobertura de ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Etiqueta "endpoints_compatible": el repositorio declara compatibilidad con endpoints de inferencia, lo que sugiere su uso a traves de APIs compatibles con el formato de HuggingFace.
- Razonamiento y generacion de codigo: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en equipos de sobremesa con GPU de consumo: la variante Q4_K_M ocupa 14,6 GB y esta marcada por el autor como "fast, recommended", por lo que puede ejecutarse en GPUs con 16 GB o mas de VRAM, cubriendo asistentes conversacionales locales sin conexion a servicios externos.
- Asistentes conversacionales multilingues: con soporte declarado de 16 idiomas, el modelo puede atender usuarios en espanol, portugues, frances, aleman, arabe, chino o japones desde una unica instancia, lo que simplifica el mantenimiento frente a desplegar un modelo por idioma.
- Procesamiento por lotes en servidores con VRAM limitada: la combinacion de arquitectura MoE (coste por token mas bajo que un denso equivalente) y cuantizaciones de 8,9 a 17,1 GB permite ejecutar cargas de generacion masiva en GPUs de gama media como la RTX 4090 o la A6000.
- Despliegue en el borde o en dispositivos con memoria unificada: las variantes Q2_K (8,9 GB) y Q3_K_S (10,5 GB) son las unicas que permiten encajar el modelo en equipos con 12-16 GB de memoria unificada, como portatiles con Apple Silicon, a cambio de una perdida de calidad que el autor advierte en la variante Q3_K_M ("lower quality").
- Prototipado e investigacion sobre modelos MoE: al disponer de once niveles de cuantizacion del mismo modelo, permite estudiar experimentalmente la degradacion de calidad en funcion del regimen de compresion sin cambiar de arquitectura.
- Sustitucion de APIs propietarias en entornos con requisitos de soberania del dato: al ejecutarse en local mediante llama.cpp u Ollama, ninguna peticion abandona la infraestructura del usuario, lo que resulta adecuado para datos personales o informacion sensible.
- Evaluacion comparativa de infraestructura: la disponibilidad de formatos desde Q2_K hasta Q8_0 permite medir throughput y latencia en distintos hardware antes de comprometer un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio cuantizado de mradermacher no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base ni para las variantes cuantizadas. La unica referencia de rendimiento es un grafico externo de perplejidad comparando tipos de cuantizacion de baja calidad, enlazado en la model card pero no acompanado de cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo orientativo a partir del tamano de fichero declarado mas overhead de contexto; no confirmado por el autor): Q2_K en torno a 10-11 GB, Q3_K_S 11-12 GB, Q3_K_M 12-13 GB, Q3_K_L 13-14 GB, IQ4_XS 14-15 GB, Q4_K_S 15-16 GB, Q4_K_M 16-17 GB, Q5_K_S 18-19 GB, Q5_K_M 19-20 GB, Q6_K 21-22 GB, Q8_0 27-28 GB.
- GPU recomendadas segun variante: RTX 4090 (24 GB) o RTX 3090 para Q4_K_M, Q5_K_S y Q5_K_M; A6000, L40S o A100 40 GB para Q6_K y Q8_0; GPUs de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB quedan limitadas a las variantes Q3 y Q4_K_S.
- Cabe en GPU de consumo: si. Las variantes de 8,9 a 14,6 GB (Q2_K hasta Q4_K_M) caben en GPUs de 12-16 GB; Q5 y superiores requieren 24 GB o mas. En memoria unificada, un Mac con 16 GB puede alojar Q2_K o Q3_K_S, y uno con 32 GB puede alojar hasta Q6_K.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama, LM Studio, llama-cpp-python y text-generation-webui, entre otros. Para el modelo base en safetensors serian aplicables vLLM, TGI o transformers. El repositorio no documenta explicitamente ningun runtime concreto.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-GGUF (este repositorio) | 23,97 mil millones | No confirmado (nomenclatura A2B) | No disponible | GGUF | lfm1.0 | 11 cuantizaciones estaticas, 8,9-25,6 GB |
| LFM2.5-24B-A2B-i1-GGUF | 23,97 mil millones | No confirmado | No disponible | GGUF | lfm1.0 | Cuantizaciones ponderadas con imatrix, publicadas por el mismo autor |
| LiquidAI/LFM2.5-24B-A2B | 23,97 mil millones | No confirmado | No disponible | Safetensors | lfm1.0 | Modelo base en precision completa; repositorio de origen de las cuantizaciones |

No se dispone en la informacion proporcionada de datos sobre modelos alternativos de terceros (por ejemplo, otros MoE de tamano similar) que permitan una comparacion de rendimiento, contexto o calidad. Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo ni sobre alternativas comparables.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el propio autor advierte que Q3_K_M ofrece "lower quality" y que las cuantizaciones mas agresivas (Q2_K, Q3_K_S) degradan la perplejidad. Un modelo de 24B en Q2_K puede rendir por debajo de un modelo denso menor en Q4_K_M, por lo que la eleccion de cuantizacion debe validarse con evaluaciones propias.
- Riesgo de alucinacion: no disponible en la informacion proporcionada. No se documentan tasas de alucinacion ni evaluaciones de veracidad para el modelo base.
- Sesgos conocidos: no disponible. El repositorio no incluye ninguna seccion de sesgos, consideraciones eticas o limitaciones documentadas.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas que dependan de ventanas largas. Aunque se declaran 16 idiomas, no hay datos sobre la calidad relativa en cada uno; es previsible un rendimiento inferior en idiomas con menos presencia en los datos de entrenamiento.
- Restricciones de licencia: la licencia lfm1.0 esta etiquetada como "other", no como una licencia de codigo abierto estandar. Antes de un uso comercial es imprescindible revisar el fichero LICENSE del repositorio de LiquidAI, ya que este tipo de licencias suelen incorporar condiciones de uso aceptable, umbrales de facturacion o requisitos de atribucion.
- Fecha de creacion inusual: los metadatos indican 14 de octubre de 2026 como fecha de creacion, posterior a la fecha de consulta habitual, lo que sugiere un posible error en los metadatos del repositorio.
- Valoracion baja de la comunidad: 44 descargas y 0 likes indican que el repositorio no ha sido validado de forma amplia por terceros. No hay evidencia publica de que las cuantizaciones hayan sido probadas en produccion.
- Dependencia del modelo base: cualquier limitacion del modelo LiquidAI/LFM2.5-24B-A2B (sesgos, idiomas, capacidades) se hereda intacta en estas cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#LFM2.5-24B-A2B-GGUF
- Fichero de licencia: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-GGUF/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura del autor): https://www.nethype.de/
