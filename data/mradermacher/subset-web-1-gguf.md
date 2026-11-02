# mradermacher/subset-web-1-GGUF

## Resumen

`mradermacher/subset-web-1-GGUF` es la version cuantizada en formato GGUF del modelo `Yuichi1218/subset-web-1`, un modelo de lenguaje de aproximadamente 8.030 millones de parametros (8B) publicado bajo licencia Apache 2.0 y orientado exclusivamente al idioma ingles. El repositorio lo mantiene mradermacher, un conocido autor de cuantizaciones GGUF para la comunidad, y pone a disposicion del ecosistema de inferencia local un conjunto de ficheros en distintos niveles de compresion (desde Q2_K hasta f16) listos para usarse con llama.cpp, Ollama y otros runners compatibles con GGUF.

El modelo base esta etiquetado con los tags `unsloth`, `llama` y `trl`, lo que sugiere que fue entrenado o afinado con el stack de Unsloth sobre una arquitectura de la familia Llama y con TRL para el ajuste. No se dispone de informacion detallada sobre el dataset de entrenamiento, la longitud de contexto ni los resultados de evaluacion en la informacion proporcionada.

Su relevancia actual es practica: al ser un modelo de 8B con cuantizaciones que van de 3,3 GB a 16,2 GB, es desplegable en GPUs de consumo y en CPU, lo que lo hace util para experimentacion local, prototipado rapido y despliegues con recursos limitados. La licencia Apache 2.0 facilita su uso comercial sin las restricciones adicionales de otras licencias de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, segun tags `llama` y `unsloth`); detalles no disponibles |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base original en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `Yuichi1218/subset-web-1`. Los tags del repositorio (`llama`, `unsloth`, `trl`, `transformers`) apuntan a un transformer de la familia Llama afinado con el framework Unsloth y TRL, pero no se especifican numero de capas, dimensiones de atencion, tipo de atencion (MHA/GQA) ni si incorpora innovaciones adicionales como decodificacion especulativa o atencion lineal.

Tampoco se publican datos sobre el corpus de entrenamiento: numero de tokens, composicion del dataset, si hubo fases de RLHF, DPO o ajuste supervisado, ni el proceso de alineacion. El nombre `subset-web-1` sugiere un entrenamiento sobre un subconjunto de datos web, pero esta interpretacion no esta confirmada en la model card. Las cuantizaciones de mradermacher son estaticas (no se ofrecen variantes con imatrix en el momento de la publicacion), segun se indica en el propio README.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para el idioma ingles.
- Compatibilidad con `text-generation-inference` y con el ecosistema `transformers`, segun los tags del repositorio.
- Inferencia local mediante llama.cpp y runners compatibles con GGUF (Ollama, LM Studio, koboldcpp, etc.).
- Soporte de cuantizaciones de 2 a 16 bits, lo que permite ajustar el equilibrio entre calidad y memoria.
- Capacidades especificas de razonamiento, codigo, matematicas, tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado local en estaciones de trabajo: con la cuantizacion Q4_K_M (5,0 GB) el modelo cabe en GPUs de consumo de 8 GB o superiores, lo que permite iterar en el desarrollo de aplicaciones de generacion de texto sin depender de APIs externas.
- Despliegue en CPU para entornos sin GPU: la cuantizacion Q2_K (3,3 GB) o Q3_K_S (3,8 GB) permite ejecutar el modelo en servidores modestos o portatiles, util para demos y pruebas de concepto.
- Generacion de texto en ingles para pipelines de contenido: resumen, reescritura o generacion de borradores en ingles, aprovechando la licencia Apache 2.0 para uso comercial sin restricciones adicionales.
- Base para fine-tuning posterior: al ser un modelo de 8B con pesos originales disponibles en el repositorio base, puede servir como punto de partida para ajustes especificos de dominio en ingles.
- Experimentacion academica y evaluacion de cuantizaciones: el rango completo de cuantizaciones (de Q2_K a f16) permite estudiar el impacto de la compresion en la calidad de salida con un mismo modelo base.
- Integracion en entornos de inferencia compatibles con GGUF: despliegue con llama.cpp u Ollama en aplicaciones de escritorio o servicios internos donde el ingles sea el idioma de trabajo.
- Evaluacion comparativa de modelos 8B: util como referencia adicional en estudios comparativos de modelos pequenos de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_S: ~3,8 GB
  - Q3_K_M: ~4,1 GB
  - Q3_K_L: ~4,4 GB
  - IQ4_XS: ~4,6 GB
  - Q4_K_S: ~4,8 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_S: ~5,7 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: no especificadas por el autor. Por tamano, un modelo 8B en Q4_K_M encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en Q8_0 requiere al menos 12 GB de VRAM; en f16 requiere ~16 GB o mas (A100 40 GB, H100, RTX 4090 24 GB).
- Cabe en GPU de consumo: si, en la mayoria de configuraciones modernas con 8-12 GB de VRAM usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; el modelo base tambien es compatible con `transformers` y `text-generation-inference`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parametros y disponibilidad. Se comparan alternativas de tamano similar (8B) con licencia permisiva.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| subset-web-1 (este) | 8B | no disponible | Apache 2.0 | GGUF, safetensors | Solo ingles; sin benchmarks publicados |
| Llama 3.1 8B | 8B | 128K (segun model card oficial) | Llama 3.1 Community License | GGUF, safetensors | Multilingue; requiere cumplir la licencia de Meta |
| Mistral 7B | 7,3B | 32K (segun model card oficial) | Apache 2.0 | GGUF, safetensors | Multilingue; benchmarks publicos disponibles |
| Qwen2.5 7B | 7,6B | 128K (segun model card oficial) | Apache 2.0 (mayoria de variantes) | GGUF, safetensors | Multilingue; benchmarks publicos disponibles |

La comparativa de rendimiento no esta disponible al no haberse publicado evaluaciones del modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Sin benchmarks publicados: no es posible verificar la calidad del modelo frente a alternativas establecidas; se recomienda evaluacion propia antes de usarlo en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay informacion sobre el proceso de alineacion o mitigacion aplicado.
- Sesgos: no se documentan sesgos conocidos ni el proceso de filtrado del corpus de entrenamiento; el nombre `subset-web-1` sugiere datos web, que suelen arrastrar sesgos.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin verificacion previa.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay variantes con imatrix, lo que puede implicar una perdida de calidad algo mayor en los niveles bajos (Q2, Q3) frente a cuantizaciones ponderadas.
- Repositorio con muy poca traccion (32 descargas, 0 likes en el momento de la consulta): menor probabilidad de soporte comunitario o correccion de errores.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las obligaciones de atribucion y las condiciones del modelo base original.
- El repositorio no especifica el pipeline ni la configuracion de generacion recomendada; es necesario consultar el modelo base para parametros de inferencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/subset-web-1-GGUF
- Modelo base: https://huggingface.co/Yuichi1218/subset-web-1
- Pagina de descargas del autor: https://hf.tst.eu/model#subset-web-1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
