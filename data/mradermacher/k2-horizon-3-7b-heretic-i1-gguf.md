# mradermacher/K2-Horizon-3.7B-heretic-i1-GGUF

## Resumen

K2-Horizon-3.7B-heretic-i1-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo Avicennasis/K2-Horizon-3.7B-heretic, una variante "abliterated" (con el alineamiento de seguridad eliminado) del modelo K2-Horizon etiquetada con los descriptores heretic y uncensored. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local: el autor aplica cuantización con imatrix (matriz de importancia) sobre los pesos originales en Transformers para producir archivos listos para llama.cpp y derivados.

El interés práctico del repositorio está en la batería de cuantizaciones ofrecida, que cubre desde 1,6 GB (i1-IQ1_S) hasta 4,3 GB (i1-Q6_K), lo que permite ejecutar un modelo de aproximadamente 5.058 millones de parámetros en hardware de consumo. El repositorio incluye además el archivo imatrix de 0,1 GB, útil para que terceros generen sus propias cuantizaciones con la misma matriz de calibración.

La relevancia es doble: por un lado, ofrece una vía de despliegue local de bajo coste para un modelo bilingüe inglés-chino; por otro, el hecho de ser una variante "abliterated/uncensored" lo sitúa en un nicho muy concreto de investigación sobre comportamiento de modelos sin capas de rechazo, con las advertencias de uso que ello implica. El repositorio registra 0 descargas y 0 likes en el momento de la consulta y no incluye model card propia más allá de la información de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo documenta la cuantizacion, no la arquitectura del modelo base) |
| Parametros totales | 5.058.255.360 (~5,06 mil millones, segun safetensors del modelo base); el nombre del modelo indica 3.7B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Tambien existe un repositorio aparte con cuantizaciones estaticas |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base usa safetensors y la libreria transformers |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base (transformer denso, MoE, hibrido u otra), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio se limita a describir el proceso de cuantizacion: cuantizacion ponderada con imatrix sobre los pesos del modelo Avicennasis/K2-Horizon-3.7B-heretic, con conversion a formato HF y salida en GGUF. Los metadatos indican un tipo de vocabulario no especificado y la version de cuantizacion 2.

La innovacion tecnica relevante aqui es precisamente el uso de imatrix (matriz de importancia de pesos), una tecnica de llama.cpp que calibra el error de cuantizacion con datos de activacion reales para mejorar la calidad de las cuantizaciones de baja precision (especialmente IQ1/IQ2/IQ3). El sufijo "heretic" del modelo base hace referencia a la familia de tecnicas de ablation de direcciones de rechazo, que eliminan selectivamente las direcciones de activacion asociadas a respuestas de negativa, dando lugar a las variantes etiquetadas como abliterated o uncensored.

## Capacidades

- Generacion de texto conversacional: la etiqueta conversational del repositorio y el pipeline de transformers indican uso como modelo de chat.
- Capacidades bilingues limitadas a ingles (en) y chino (zh); no se documentan otros idiomas.
- Formato GGUF compatible con llama.cpp y toda su cadena de herramientas (llama-server, Ollama, LM Studio, kobold.cpp, entre otros).
- Uso sin restricciones de rechazo: al ser una variante abliterated/heretic, el modelo no aplica las capas de negativa propias de un modelo alineado; esto es una caracteristica de comportamiento, no una capacidad funcional adicional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible; el repositorio no incluye proyecciones multimodales.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Inferencia local en portatil o equipo de gama media: con las cuantizaciones i1-Q4_K_M (3,3 GB) o i1-Q4_K_S (3,1 GB) el modelo cabe en GPUs con 6-8 GB de VRAM, lo que permite desplegar un asistente conversacional bilingue sin conexion a servicios externos.
- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para analizar el efecto de las tecnicas de ablation sobre la tasa de rechazo y sobre la calidad de las respuestas en tareas sensibles, comparandolo con el modelo base no abliterated.
- Generacion de texto en chino e ingles: util para tareas de redaccion, resumen y traduccion bidireccional en entornos donde solo se dispone de hardware modesto.
- Prototipado rapido de aplicaciones de chat: el archivo GGUF se carga directamente en llama-server o Ollama, lo que reduce el tiempo de puesta en marcha de un prototipo conversacional a minutos.
- Experimentacion con cuantizacion extrema: las variantes i1-IQ1_S e i1-IQ1_M (1,6 GB) permiten estudiar el impacto de la cuantizacion a 1-2 bits en la coherencia del texto generado, comparando contra la variante Q4_K_M como referencia de calidad.
- Creacion de cuantizaciones propias: el archivo imatrix de 0,1 GB incluido en el repositorio puede reutilizarse para generar cuantizaciones personalizadas con la misma matriz de calibracion, por ejemplo para tipos de cuantizacion no incluidos en la lista publicada.
- Despliegue en entornos con memoria limitada: la variante i1-Q2_K (2,2 GB) o i1-IQ3_S (2,5 GB) permite ejecutar el modelo en dispositivos con 4 GB de VRAM, a costa de una perdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion. La unica referencia grafica es un enlace externo a una comparativa de perplejidad entre tipos de cuantizacion de baja calidad (https://www.nethype.de/huggingface_embed/quantpplgraph.png), que no aporta valores numericos en la informacion proporcionada.

## Requisitos de hardware

Los tamanos siguientes corresponden a los archivos publicados; la VRAM necesaria es una estimacion que anade el coste del contexto y del runtime (KV cache, buffers de llama.cpp) al tamano del archivo.

| Cuantizacion | Tamano en disco | VRAM estimada en inferencia |
|---|---|---|
| i1-IQ1_S / i1-IQ1_M | 1,6 GB | ~2-3 GB |
| i1-IQ2_M | 2,1 GB | ~3 GB |
| i1-Q2_K | 2,2 GB | ~3 GB |
| i1-IQ3_S / i1-IQ3_M | 2,5-2,6 GB | ~3-4 GB |
| i1-IQ4_XS | 3,0 GB | ~4 GB |
| i1-Q4_K_S | 3,1 GB | ~4 GB |
| i1-Q4_K_M | 3,3 GB | ~4-5 GB |
| i1-Q5_K_M | 3,7 GB | ~5 GB |
| i1-Q6_K | 4,3 GB | ~5-6 GB |

- Cabe en GPU de consumo: si, todas las cuantizaciones caben en tarjetas con 6 GB o mas de VRAM (RTX 2060, RTX 3060, RTX 4060, RX 6600, entre otras). Las variantes IQ2 e IQ3 podrian caber en GPUs de 4 GB.
- GPU recomendada para uso comodo: RTX 3060 12 GB o superior, que permite cargar i1-Q6_K y dejar margen amplio para contexto.
- GPU de centro de datos (A100, H100): innecesarias para este tamano; su uso solo tendria sentido para servir muchas instancias concurrentes.
- Ejecucion en CPU: viable gracias al formato GGUF, con velocidades dependientes del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, kobold.cpp y cualquier runtime compatible con GGUF. Los archivos estan marcados como endpoints_compatible, lo que sugiere compatibilidad con endpoints de inferencia tipo OpenAI a traves de llama-server.
- Latencia y throughput: no disponible; el repositorio no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparativa de rendimiento fiable. A continuacion se comparan unicamente las dos distribuciones del mismo modelo base publicadas por el mismo autor, mas el modelo original.

| Version | Formato | Parametros | Tamano de la variante principal | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/K2-Horizon-3.7B-heretic-i1-GGUF | GGUF con imatrix | ~5,06 mil millones | 1,6-4,3 GB segun cuantizacion | apache-2.0 | Cuantizacion ponderada con matriz de importancia |
| mradermacher/K2-Horizon-3.7B-heretic-GGUF | GGUF estatico | ~5,06 mil millones | no disponible | apache-2.0 | Cuantizacion sin ponderacion imatrix |
| Avicennasis/K2-Horizon-3.7B-heretic | safetensors (transformers) | ~5,06 mil millones | no disponible | apache-2.0 | Modelo base sin cuantizar |

## Limitaciones y advertencias

- Modelo abliterated/uncensored: las capas de rechazo han sido eliminadas, por lo que el modelo puede producir contenido que un modelo alineado rechazaria. No es apto para aplicaciones orientadas a usuarios finales sin moderacion adicional.
- Riesgo elevado de alucinacion: no hay datos publicados sobre tasas de alucinacion, y el modelo base K2-Horizon carece de documentacion tecnica en la informacion disponible.
- Cobertura linguistica limitada a ingles y chino; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Discrepancia de parametros: el nombre indica 3.7B pero el recuento de safetensors del modelo base es de 5.058.255.360 parametros. Conviene verificar cual es la cifra correcta antes de dimensionar infraestructura.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero al derivar de un modelo abliterated conviene revisar las condiciones del modelo base y las obligaciones legales aplicables al contenido generado.
- Sin garantias de calidad en cuantizaciones extremas: el propio autor etiqueta i1-IQ1_S como "for the desperate" y i1-IQ1_M como "mostly desperate"; las variantes Q2_K_S y Q4_0 se marcan como de calidad baja.
- Sin datos de benchmarks, contexto ni arquitectura: no es posible evaluar el rendimiento esperado ni la idoneidad para tareas de razonamiento o codigo sin pruebas propias.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No hay informacion sobre sesgos; al ser un modelo entrenado con datos no documentados, se desconoce la composicion del corpus y los sesgos asociados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/K2-Horizon-3.7B-heretic-i1-GGUF
- Modelo base: https://huggingface.co/Avicennasis/K2-Horizon-3.7B-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/K2-Horizon-3.7B-heretic-GGUF
- Pagina resumen del modelo con lista de descargas: https://hf.tst.eu/model#K2-Horizon-3.7B-heretic-i1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
