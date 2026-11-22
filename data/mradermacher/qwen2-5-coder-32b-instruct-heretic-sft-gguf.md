# mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-GGUF

## Resumen

`mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-GGUF` es una distribucion de cuantizaciones GGUF del modelo `PeetPedro/qwen2.5-coder-32b-instruct-heretic-sft`, un ajuste fino (SFT) derivado de Qwen2.5-Coder-32B-Instruct. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de pesos GGUF en Hugging Face, y el resultado es un conjunto de ficheros listos para inferencia local con llama.cpp y derivados (Ollama, LM Studio, text-generation-webui).

El modelo subyacente parte de la arquitectura densa de Qwen2.5-Coder de 32B parametros (32.763.876.352 parametros segun los safetensors del repo), orientada a generacion de codigo, instrucciones y conversacion. La variante "heretic" hace referencia a un proceso de desalineacion deliberada de las restricciones de rechazo del modelo original, y "sft" indica que se ha aplicado un ajuste supervisado adicional sobre esa base.

Su relevancia practica es doble: por un lado, ofrece un modelo de codigo de 32B en formato GGUF con un abanico amplio de niveles de cuantizacion (de Q2_K a Q8_0), lo que permite desplegarlo desde equipos con ~16 GB de VRAM hasta estaciones con 48 GB o mas; por otro, su licencia Apache 2.0 facilita el uso comercial sin las restricciones de otras familias de modelos. El repo acumula 571 descargas y no tiene likes, lo que sugiere una adopcion temprana y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-Coder-32B-Instruct: un transformer denso con atencion por causalidad, sin mezcla de expertos. Sobre esa base, el autor del modelo original (`PeetPedro`) aplico un ajuste fino supervisado (SFT) con un sesgo declarado de "heretic", es decir, orientado a reducir los rechazos y la censura del modelo instruct original. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en esta variante concreta.

El trabajo de mradermacher se limita a la conversion y cuantizacion: genera cuantizaciones estaticas (Q2_K a Q8_0) y un conjunto paralelo de cuantizaciones ponderadas con imatrix en el repositorio `qwen2.5-coder-32b-instruct-heretic-sft-i1-GGUF`. La model card no documenta innovaciones arquitectonicas adicionales (no hay decodificacion especulativa, atencion lineal ni mecanismos hibridos declarados); las etiquetas `8b-is`, `sovereign` y `quantal` presentes en los tags no van acompanadas de explicacion tecnica en la informacion disponible.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada de la base Qwen2.5-Coder-32B-Instruct.
- Razonamiento sobre instrucciones y conversacion multi-turno (formato instruct).
- Completado y explicacion de fragmentos de codigo, refactorizacion y generacion de tests, segun las capacidades tipicas de la familia Qwen2.5-Coder (no verificadas de forma independiente para esta variante).
- Respuestas con menor tasa de rechazo que el modelo instruct original, por el ajuste "heretic".
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta variante concreta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara `en`; el resto de idiomas no esta disponible.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Asistente de programacion en local: el modelo puede integrarse en un IDE o en un CLI de desarrollo para autocompletar, explicar y refactorizar codigo, ejecutandose con llama.cpp sobre una estacion de trabajo con GPU consumer de gama alta y cuantizacion Q4_K_M (20,0 GB).
- Generacion de tests y documentacion: con la cuantizacion Q5_K_M (23,4 GB) se obtiene un equilibrio razonable entre calidad y huella de memoria para generar suites de pruebas y docstrings en pipelines de integracion continua.
- Analisis de repositorios y revision de codigo: la variante de 32B permite manejar fragmentos extensos de codigo y mantener coherencia en tareas de revision, siempre que se confirme la ventana de contexto efectiva del modelo base.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, encaja en productos comerciales donde otras licencias (por ejemplo, las de Llama) imponen restricciones adicionales.
- Prototipado de agentes de codigo sin dependencia de API: la cuantizacion Q8_0 (34,9 GB) permite servir el modelo en una unica GPU de 48 GB o en dos GPU de 24 GB, con calidad cercana al modelo original en FP16.
- Investigacion sobre alineacion y censura: la variante "heretic" es util para estudiar el comportamiento de modelos desalineados respecto a sus versiones instruct, comparando tasas de rechazo y calidad de respuesta.
- Educacion y experimentacion: las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten probar el modelo en hardware modesto, asumiendo la perdida de calidad documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, mas overhead de contexto y KV cache):
  - Q2_K: 12,4 GB
  - Q3_K_S: 14,5 GB
  - Q3_K_M: 16,0 GB
  - Q3_K_L: 17,3 GB
  - IQ4_XS: 18,0 GB
  - Q4_K_S: 18,9 GB
  - Q4_K_M: 20,0 GB
  - Q5_K_S: 22,7 GB
  - Q5_K_M: 23,4 GB
  - Q6_K: 27,0 GB
  - Q8_0: 34,9 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S con contexto moderado; A100 40 GB o H100 para Q6_K y Q8_0; configuraciones multi-GPU de 2x24 GB para Q8_0.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q5_K_S; las cuantizaciones Q2_K a Q3_K_L caben en tarjetas de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el repo incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen2.5-coder-32b-instruct-heretic-sft-GGUF (este) | 32,8B | no disponible | Apache 2.0 | GGUF | Variante desalineada con SFT; cuantizaciones Q2_K a Q8_0 |
| Qwen2.5-Coder-32B-Instruct (original) | 32,8B | no disponible en la informacion proporcionada | Apache 2.0 | safetensors, GGUF (terceros) | Modelo instruct de referencia, con rechazos estandar |
| PeetPedro/qwen2.5-coder-32b-instruct-heretic-sft | 32,8B | no disponible | Apache 2.0 | safetensors | Modelo base de esta cuantizacion, sin cuantizar |
| DeepSeek-Coder-V2-Instruct | no disponible | no disponible | no disponible | no disponible | Alternativa de codigo de gran tamano; datos no verificados en esta ficha |

## Limitaciones y advertencias

- El ajuste "heretic" reduce deliberadamente los rechazos del modelo: puede generar contenido que el modelo original rechazaria, con implicaciones de seguridad y cumplimiento en produccion.
- No hay benchmarks publicados para esta variante; no se puede asumir que la calidad de codigo sea equivalente a la del Qwen2.5-Coder-32B-Instruct original.
- La model card solo declara ingles (`en`); el rendimiento en castellano no esta verificado.
- La longitud de contexto no figura en la informacion proporcionada; conviene verificarla antes de disenar flujos con documentos largos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- La licencia Apache 2.0 del repo de cuantizacion no exime de verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Riesgo de alucinacion inherente a los modelos de 32B, especialmente en tareas de codigo con APIs poco documentadas.
- Repo con 0 likes y 571 descargas: poca validacion comunitaria, sin garantias de mantenimiento.
- El proceso de desalineacion puede introducir sesgos o comportamientos no documentados; se recomienda evaluacion propia antes de uso en produccion.

## Enlaces

- Repo Hugging Face: https://huggingface.co/mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-GGUF
- Modelo base: https://huggingface.co/PeetPedro/qwen2.5-coder-32b-instruct-heretic-sft
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/qwen2.5-coder-32b-instruct-heretic-sft-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#qwen2.5-coder-32b-instruct-heretic-sft-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
