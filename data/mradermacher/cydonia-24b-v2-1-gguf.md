# mradermacher/Cydonia-24B-v2.1-GGUF

## Resumen

Cydonia-24B-v2.1-GGUF es la distribucion en formato GGUF del modelo Cydonia-24B-v2.1, desarrollado originalmente por TheDrummer y cuantizado por mradermacher. Se trata de un modelo de lenguaje conversacional de aproximadamente 23.570 millones de parametros (23,57B), pensado para generacion de texto y dialogos multi-turno en ingles. La version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en safetensors a precision completa.

El modelo base es un transformer denso (no se documenta una arquitectura MoE en la informacion disponible) orientado a conversacion, con la etiqueta "conversational" en Hugging Face. Su relevancia practica reside en que ofrece un tamano intermedio-grande (24B) con cuantizaciones que van desde 9 GB (Q2_K) hasta 25,2 GB (Q8_0), lo que permite desplegarlo en GPUs de consumo de gama alta con cuantizaciones agresivas o en estaciones de trabajo con 24-48 GB de VRAM.

La ficha se centra en la distribucion GGUF de mradermacher, que incluye cuantizaciones estaticas (K-quants) y remite a una version con cuantizaciones ponderadas/imatrix en un repositorio separado. La licencia es "other", lo que obliga a revisar los terminos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (no se detalla variante especifica en la informacion disponible) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix/ponderadas en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base TheDrummer/Cydonia-24B-v2.1 mas alla de tratarse de un transformer de 23,57B parametros orientado a conversacion. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o atencion lineal.

La aportacion de esta ficha es la cuantizacion: mradermacher genera cuantizaciones estaticas con la herramienta de llama.cpp, marcando como "fast, recommended" las variantes Q4_K_S y Q4_K_M, y como "very good quality" la Q6_K. El proceso de cuantizacion utiliza la version 2 del formato de cuantizacion (segun los metadatos de la model card) y mantiene el vocabulario del modelo original. Para cuantizaciones ponderadas con matriz de importancia (imatrix), el autor remite a un repositorio independiente.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte para dialogos multi-turno (etiqueta "conversational").
- Razonamiento y respuesta a instrucciones, segun el proposito declarado del modelo base.
- Ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documentan capacidades de vision, audio, tool calling, function calling ni agentes en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose en una estacion de trabajo con una cuantizacion Q4_K_M (14,4 GB), adecuada para GPUs de 16-24 GB de VRAM.
- Prototipado de chatbots sin conexion: al distribuirse en GGUF, permite desplegar un asistente en entornos air-gapped o con requisitos de privacidad, usando llama.cpp u Ollama.
- Generacion de texto creativo en ingles: la naturaleza conversacional del modelo base lo hace apto para redaccion asistida, siempre que se valide la calidad con pruebas propias dado que no hay benchmarks publicados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el compromiso entre tamano y calidad (por ejemplo, Q4_K_S frente a Q6_K) en un mismo modelo.
- Despliegue en servidores modestos: la cuantizacion Q2_K (9,0 GB) permite ejecutar el modelo en GPUs de 12 GB, a costa de una perdida de calidad no cuantificada en la informacion disponible.
- Integracion en pipelines de generacion de texto por lotes: mediante la API de llama.cpp o servidores compatibles con endpoints, para tareas de resumen o reescritura en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del archivo GGUF mas overhead de contexto):
  - Q2_K: ~9,0 GB de pesos; requiere ~10-11 GB de VRAM con contexto moderado.
  - Q4_K_M: ~14,4 GB de pesos; requiere ~16-18 GB de VRAM.
  - Q6_K: ~19,4 GB de pesos; requiere ~21-23 GB de VRAM.
  - Q8_0: ~25,2 GB de pesos; requiere ~27-29 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la model card remite a las instrucciones de TheBloke para el uso de archivos GGUF multiparte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cydonia-24B-v2.1-GGUF (este) | 23,57B | no disponible | other | GGUF | Cuantizaciones estaticas Q2_K-Q8_0 |
| TheDrummer/Cydonia-24B-v2.1 (base) | 23,57B | no disponible | other | safetensors | Pesos originales, sin cuantizar |
| mradermacher/Cydonia-24B-v2.1-i1-GGUF | 23,57B | no disponible | other | GGUF (imatrix) | Cuantizaciones ponderadas del mismo modelo |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles, es probable que presente sesgos culturales y linguisticos propios de ese corpus.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo sin benchmarks publicados, requiere validacion en produccion.
- Limitacion de idioma: solo se declara soporte de ingles ("en"); el rendimiento en castellano no esta garantizado.
- Licencia "other": no es una licencia estandar; es imprescindible revisar los terminos del modelo base TheDrummer/Cydonia-24B-v2.1 antes de cualquier uso comercial.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; la propia model card marca Q3_K_M como "lower quality".
- El repositorio ocupa 161,4 GB, lo que implica descargas parciales por archivo y suficiente espacio en disco.
- Sin datos de benchmarks ni de throughput: la idoneidad para produccion debe evaluarse con pruebas propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cydonia-24B-v2.1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Cydonia-24B-v2.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Cydonia-24B-v2.1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Cydonia-24B-v2.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
