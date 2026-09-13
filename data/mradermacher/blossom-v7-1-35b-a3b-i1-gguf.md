# mradermacher/Blossom-V7.1-35B-A3B-i1-GGUF

## Resumen

Blossom-V7.1-35B-A3B-i1-GGUF es la version cuantizada en formato GGUF del modelo Azure99/Blossom-V7.1-35B-A3B, publicada por el usuario mradermacher, especializado en la generacion de cuantizaciones con imatrix. El repositorio no contiene el modelo original, sino ficheros derivados listos para su uso con motores de inferencia compatibles con GGUF (llama.cpp y sus envoltorios). La nomenclatura "35B-A3B" apunta a una arquitectura de mezcla de expertos con unos 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, aunque la model card del repositorio no detalla la arquitectura.

El modelo base es multimodal (etiqueta `multimodal` y aviso explicito de que se trata de un modelo de vision con ficheros mmproj) y esta orientado a conversacion y razonamiento. Soporta ingles y chino, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin las restricciones habituales de otras licencias de modelos abiertos. La cuantizacion emplea el metodo i1 (imatrix), que calibra los errores de cuantizacion con un conjunto de datos de activaciones para preservar mejor la calidad en tipos de cuantizacion agresivos.

La relevancia practica de esta ficha esta en el formato: al tratarse de un GGUF, el modelo puede ejecutarse en hardware de consumo o en servidores sin necesidad de pilas de inferencia pesadas, y permite elegir entre mas de 25 tipos de cuantizacion en funcion del equilibrio entre VRAM y calidad. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y su tamano declarado (0,2 GB) sugiere que la mayor parte de los ficheros cuantizados se aloja en el repositorio estatico enlazado desde la model card, no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura del modelo sugiere mezcla de expertos tipo MoE, no confirmado en la model card) |
| Parametros totales | 35B segun la nomenclatura del modelo; el repositorio declara 48.036.230 parametros en safetensors (cifra compatible con un proyector multimodal mmproj, no con el modelo completo) |
| Parametros activos | aproximadamente 3B segun la nomenclatura "A3B" (no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL (24+ tipos, con fichero imatrix adicional de 0,3 GB) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion i1/imatrix); el modelo base se distribuye en safetensors |
| Modelo base | Azure99/Blossom-V7.1-35B-A3B |
| Autor de la cuantizacion | mradermacher (mradermacher) |
| Capacidades declaradas | conversational, reasoning, multimodal |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Fecha de creacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-13 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. El identificador "35B-A3B" sigue la convencion habitual para modelos de mezcla de expertos (MoE), en la que el primer numero indica los parametros totales y el segundo los parametros activos por token; de ser asi, el modelo activaria del orden de 3.000 millones de parametros en cada paso de decodificacion, lo que reduciria de forma notable el coste de inferencia respecto a un modelo denso de 35B. Esta interpretacion no aparece confirmada en la model card del repositorio de cuantizacion.

Tampoco se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base recibio alineacion mediante RLHF, DPO u otras tecnicas. La presencia de la etiqueta `multimodal` y el aviso explicito de que se trata de un modelo de vision indican que el modelo base incorpora un codificador visual y un proyector (mmproj) que se distribuye en el repositorio estatico; los ficheros mmproj no forman parte de esta cuantizacion i1. En cuanto al proceso de cuantizacion, el autor aplica el metodo i1 con fichero imatrix, que estima la importancia de cada peso a partir de las activaciones observadas durante la calibracion, mejorando la calidad frente a cuantizaciones estaticas del mismo tamano, especialmente en tipos de baja precision como IQ2 o IQ1.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento (etiqueta `reasoning` en la model card), sin detalle del modo de razonamiento ni de si existe un modo "thinking" explicito.
- Capacidades multimodales: el modelo base es un modelo de vision y requiere los ficheros mmproj del repositorio estatico para procesar imagenes. Esta cuantizacion no incluye dichos ficheros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a los idiomas declarados: ingles y chino. No se declara soporte de castellano.
- Tamano de contexto: no disponible.
- Capacidades especiales adicionales (audio, thinking mode, decodificacion especulativa): no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional bilingue: al distribuirse en GGUF, el modelo puede ejecutarse con llama.cpp en una estacion de trabajo con GPU de consumo, manteniendo conversaciones multi-turno en ingles y chino sin depender de APIs externas.
- Analisis de documentos e imagenes en chino: combinando esta cuantizacion con los ficheros mmproj del repositorio estatico, puede emplearse para describir capturas, diagramas o documentos escaneados en entornos donde el idioma principal de los datos es el chino.
- Prototipado de productos con licencia permisiva: la licencia Apache 2.0 permite integrar el modelo en productos comerciales sin obligacion de publicar el codigo propietario, siempre que se respeten las condiciones de atribucion.
- Evaluacion de compromiso entre precision y VRAM: la disponibilidad de mas de 24 tipos de cuantizacion, desde IQ1_S hasta Q6_K, permite medir en un mismo modelo como degrada la calidad al reducir el tamano, algo util para equipos que necesitan decidir el formato de despliegue de un MoE de 35B.
- Servidores de inferencia con GPU limitada: la parte densa activa por token (aproximadamente 3B segun la nomenclatura) reduce el coste computacional por token, lo que facilita servir varias peticiones concurrentes con un solo acelerador si el motor de inferencia gestiona correctamente la carga de expertos.
- Generacion de datos sinteticos en chino: el modelo puede emplearse para producir texto de forma masiva en un idioma para el que muchos modelos abiertos tienen menos cobertura, siempre que se verifique la calidad de la salida.
- Investigacion sobre cuantizacion con imatrix: los ficheros i1 y el imatrix publicado facilitan reproducir experimentos de calibracion y comparar los resultados con las cuantizaciones estaticas del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano nominal del modelo (35B) y del tipo de cuantizacion, no datos publicados por el autor. Deben verificarse empiricamente antes de dimensionar infraestructura.

- VRAM estimada para inferencia, segun cuantizacion (modelo de 35B, sin contar el contexto ni el codificador visual):
  - IQ1_S / IQ2_XXS: en torno a 9-13 GB.
  - Q2_K / Q2_K_S: en torno a 13-15 GB.
  - Q3_K_S / IQ3_XXS: en torno a 16-18 GB.
  - Q4_K_S / Q4_K_M: en torno a 20-22 GB.
  - Q5_K_M: en torno a 24-26 GB.
  - Q6_K: en torno a 28-30 GB.
  - Q8 o superior: en torno a 36-38 GB.
- GPU recomendadas: para cuantizaciones Q4 y superiores, una RTX 3090 o RTX 4090 con 24 GB es suficiente en Q4_K_S; para Q5 y Q6 se recomienda una RTX 6000 Ada, L40S o A100 de 40 GB; para Q8, una A100 80 GB o H100.
- Compatibilidad con GPU de consumo: si la arquitectura es realmente MoE con aproximadamente 3B de parametros activos, las cuantizaciones Q4 e inferiores caben en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 3090). En cuantizaciones IQ1/IQ2 podria caber en 12 GB, con perdida de calidad no cuantificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros motores compatibles con GGUF. Los motores tipo vLLM o TGI no consumen GGUF de forma nativa y requeririan el modelo base en safetensors.
- Requisito adicional para vision: los ficheros mmproj se encuentran en el repositorio estatico y deben descargarse aparte.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se ha proporcionado informacion sobre modelos comparables de terceros, por lo que no es posible establecer una comparativa de rendimiento verificada. La tabla recoge unicamente las variantes del mismo modelo base sobre las que si hay datos en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Blossom-V7.1-35B-A3B-i1-GGUF (esta ficha) | 35B nominales (A3B segun nomenclatura) | no disponible | sin benchmarks publicados | apache-2.0 | GGUF con cuantizaciones i1/imatrix |
| mradermacher/Blossom-V7.1-35B-A3B-GGUF | mismos | no disponible | sin benchmarks publicados | apache-2.0 | GGUF con cuantizaciones estaticas y ficheros mmproj |
| Azure99/Blossom-V7.1-35B-A3B (modelo base) | 35B nominales | no disponible | sin benchmarks publicados | apache-2.0 | safetensors, transformers |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de datos verificados sobre arquitectura, contexto, datos de entrenamiento ni alineacion; cualquier decision de produccion deberia partir de una evaluacion propia sobre el modelo base.
- El repositorio de cuantizacion tiene 0 descargas y 0 "likes" y fue creado y actualizado el mismo dia, por lo que no existe validacion de la comunidad sobre la calidad de estas cuantizaciones concretas.
- El tamano declarado del repositorio (0,2 GB) y el hecho de que la model card solo enlace el fichero imatrix apuntan a que los ficheros cuantizados pueden no estar subidos en este repositorio; conviene comprobar la disponibilidad real de cada tipo de cuantizacion antes de planificar una descarga, y consultar el repositorio estatico para los ficheros mmproj de vision.
- La cifra de parametros declarada en safetensors (48.036.230) no corresponde al modelo completo de 35B, sino previsiblemente al proyector multimodal; no debe usarse como referencia de tamano del modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es inherente a los modelos generativos y no hay evaluaciones publicadas que lo acoten.
- Idiomas: el modelo declara unicamente ingles y chino. No hay soporte declarado de castellano; usarlo en espanol puede degradar la calidad de forma notable.
- Las cuantizaciones de muy baja precision (IQ1, IQ2, Q2_K) suelen introducir degradaciones medibles en razonamiento y coherencia; no se han publicado mediciones de perplexity para estas variantes.
- Licencia Apache 2.0 en el modelo base y en esta cuantizacion, lo que permite uso comercial; aun asi, conviene verificar las condiciones del modelo original y la atribucion correspondiente al autor de la cuantizacion.
- Para uso multimodal es imprescindible descargar por separado los ficheros mmproj del repositorio estatico; sin ellos, el modelo solo procesa texto.
- Compatibilidad de motores: al ser GGUF, no es directamente desplegable en vLLM o TGI sin conversion previa al formato original.

## Enlaces

- Repositorio de la cuantizacion i1-GGUF: https://huggingface.co/mradermacher/Blossom-V7.1-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Blossom-V7.1-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Azure99/Blossom-V7.1-35B-A3B
- Pagina del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de modelos a cuantizar: https://huggingface.co/mradermacher/model_requests
- Pagina de descarga de cuantizaciones: https://hf.tst.eu/model
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplexity por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
