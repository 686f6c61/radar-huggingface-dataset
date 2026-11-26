# mradermacher/Signet-9B-GGUF

## Resumen

Signet-9B-GGUF es la distribucion en formato GGUF del modelo Signet-9B, desarrollado por Laplace-AI-Research y cuantizado por mradermacher. El modelo base es un transformer denso de 8.953.803.264 parametros (aproximadamente 9B) afinado mediante GRPO (Group Relative Policy Optimization) y LoRA sobre un modelo preentrenado, con un enfoque explicito en la reduccion de la adulacion (sycophancy) y en la revision de creencias (belief revision) basada en procedencia de la informacion. El problema que aborda es la tendencia de los modelos conversacionales a ceder ante la presion del usuario y abandonar respuestas correctas cuando se les contradice, un fallo critico en aplicaciones donde la fiabilidad del juicio importa mas que la complacencia.

La relevancia de esta ficha radica en que el modelo incorpora un conjunto de evaluacion propio, ConvictionBench, disenado para medir la resistencia a la persuasion indebida y la capacidad de mantener posiciones fundamentadas. Los tags del repositorio (grpo, lora, sycophancy, belief-revision, provenance, convictionbench, signet) confirman que el entrenamiento se oriento especificamente a estas competencias. La licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF desde Q2_K hasta f16 facilitan su despliegue en entornos locales y en produccion.

Esta ficha cubre exclusivamente la version GGUF producida por mradermacher, que es una conversion estatica del modelo original. No se dispone de informacion sobre la longitud de contexto, la composicion exacta del dataset de entrenamiento ni resultados numericos de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado del modelo base Signet-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Signet-9B es un transformer denso de aproximadamente 9B parametros. El entrenamiento descrito en los metadatos incluye GRPO (Group Relative Policy Optimization), una variante de optimizacion por preferencias que no requiere un modelo critico separado, combinada con LoRA (Low-Rank Adaptation). Este esquema sugiere un ajuste eficiente sobre el modelo preentrenado, orientado a modificar el comportamiento conversacional sin reentrenar todos los pesos. El dataset asociado es ConvictionBench, un conjunto de evaluacion propio de Laplace-AI-Research centrado en sycophancy, belief revision y provenance.

La innovacion tecnica destacable es el enfoque en la revision de creencias basada en procedencia: el modelo esta disenado para distinguir entre ceder ante presion social y actualizar una creencia cuando se aporta evidencia nueva y trazable. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal. La cuantizacion GGUF la realiza mradermacher con conversion de tipo hf y version de cuantizacion 2; no se ofrecen cuantizaciones ponderadas/imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento con resistencia a la adulacion: mantiene posiciones fundamentadas ante contradicciones del usuario.
- Revision de creencias: actualiza respuestas cuando se aporta evidencia nueva, no por presion social.
- Trazabilidad de procedencia (provenance) como eje del comportamiento entrenado.
- Evaluacion integrada mediante ConvictionBench para medir conviccion y revision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de atencion al cliente con verificacion de hechos: el modelo puede mantener una respuesta correcta cuando un cliente insiste en una version erronea, reduciendo la complacencia en conversaciones multi-turno.
- Sistemas de soporte a la decision en entornos regulados: util para conservar el juicio del modelo ante usuarios que intentan sesgar la recomendacion mediante presion conversacional.
- Moderacion de debates y verificacion de afirmaciones: el enfoque en provenance permite rastrear de donde procede una creencia y cuando debe revisarse.
- Evaluacion de robustez conversacional: ConvictionBench puede emplearse como suite de pruebas para medir la resistencia a la persuasion en otros modelos.
- Investigacion en alineacion: el modelo sirve como caso de estudio de entrenamiento con GRPO + LoRA para reducir sycophancy.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (5,8 GB) y Q5_K_M (6,6 GB) permiten ejecutar el modelo en GPU de consumo con llama.cpp u Ollama.
- Pipelines de generacion de texto en ingles con requisitos de consistencia: util donde se prioriza no cambiar de opinion sin evidencia frente a la fluidez maxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,0 GB (Q2_K), 5,8 GB (Q4_K_M), 6,6 GB (Q5_K_M), 9,6 GB (Q8_0) y 18,0 GB (f16), segun los tamanos de archivo publicados.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 y f16; RTX 3080/4070 (10-12 GB) para Q4_K_M y Q5_K_M; GPUs con 8 GB para Q3_K_M e inferiores.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizaciones Q2_K a Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Signet-9B-GGUF | 8,95B | no disponible | Antisycophancy, belief revision | apache-2.0 | GGUF (12 cuantizaciones) |
| Modelo base Signet-9B | 8,95B | no disponible | Mismo enfoque | apache-2.0 | safetensors |
| Alternativas de 9B orientadas a robustez conversacional | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se han documentado capacidades multilingues.
- No se dispone de datos sobre sesgos conocidos ni sobre evaluaciones de alucinacion.
- La longitud de contexto no esta documentada, lo que impide planificar cargas de contexto largo con precision.
- El enfasis en mantener convicciones puede, en teoria, dificultar la correccion cuando el usuario tiene razon; no se han publicado metricas que acoten este riesgo.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar la calidad; el autor marca Q3_K_M como "lower quality".
- No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base y del dataset ConvictionBench.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria publica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Signet-9B-GGUF
- Modelo base: https://huggingface.co/Laplace-AI-Research/Signet-9B
- Dataset de evaluacion: https://huggingface.co/datasets/Laplace-AI-Research/ConvictionBench
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Signet-9B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
