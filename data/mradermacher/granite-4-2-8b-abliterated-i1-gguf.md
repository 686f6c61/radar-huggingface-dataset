# mradermacher/granite-4.2-8b-abliterated-i1-GGUF

## Resumen

`mradermacher/granite-4.2-8b-abliterated-i1-GGUF` es una distribucion de cuantizaciones GGUF del modelo `Lonelyguyse1/granite-4.2-8b-abliterated`, una variante "abliterated" (con el mecanismo de rechazo suprimido) de la familia IBM Granite 4.2 en su version de 8B parametros. El autor de las cuantizaciones es mradermacher, un conocido publicador de quants GGUF de la comunidad, que en este caso aplica cuantizacion con imatrix (matriz de importancia) para preservar la calidad en tasas de bits bajas.

El modelo base es un transformer denso de 8.791.592.960 parametros (segun los safetensors del repositorio), entrenado originalmente por IBM y posteriormente modificado mediante tecnicas de "abliteration" o "refusal removal" para eliminar las respuestas de rechazo ante peticiones que el modelo original declinaria. Esta orientado a un unico idioma declarado, el ingles, y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en que permite desplegar un modelo de 8B con contexto conversacional en hardware de consumo mediante llama.cpp u Ollama, sin las restricciones de rechazo del modelo original. Es, por tanto, una opcion para investigacion sobre alineamiento, evaluacion de sesgos y experimentacion con modelos sin filtros, mas que un modelo recomendado para produccion orientada al publico general. El repositorio ocupa 3,4 GB y en el momento de la consulta no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia IBM Granite 4.2, derivado del modelo base abliterated) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-Q2_K (3,5 GB), entre otras del catalogo i1/imatrix (IQ1_S a Q6_K segun la lista de quants del autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia IBM Granite 4.2, un transformer denso de aproximadamente 8,8 mil millones de parametros. Sobre el modelo base original se aplico un proceso de "abliteration" (tambien etiquetado como "heretic" y "refusal-removal" en las etiquetas del repositorio), una tecnica que identifica y modifica las direcciones de activacion asociadas al comportamiento de rechazo para suprimir dicho comportamiento sin reentrenar el modelo desde cero. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo original ni sobre la composicion exacta del dataset.

Sobre el modelo abliterated, mradermacher ha generado cuantizaciones GGUF con imatrix, un metodo que calcula una matriz de importancia a partir de datos de calibracion para asignar mas bits a los pesos mas sensibles y reducir la perdida de calidad en cuantizaciones agresivas. El repositorio incluye el fichero imatrix (`granite-4.2-8b-abliterated.imatrix.gguf`, 0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No se detalla la composicion del dataset de calibracion ni si se aplico RLHF o DPO adicional tras la abliteration.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones heredadas del modelo Granite 4.2 base.
- Generacion de codigo y tareas de programacion propias de un modelo de 8B de la familia Granite.
- Supresion del comportamiento de rechazo: el modelo responde a peticiones que el modelo original declinaria (de ahi las etiquetas `uncensored`, `abliterated`, `heretic`, `refusal-removal`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso en infraestructuras de inferencia tipo API.
- Soporte de cuantizacion GGUF para ejecucion en CPU y GPU con llama.cpp y derivados.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como cambia el comportamiento de un modelo al eliminar el mecanismo de rechazo, comparando respuestas del modelo abliterated con las del Granite 4.2 original en un mismo conjunto de prompts.
- Evaluacion de sesgos y robustez: util para medir la tasa de respuestas toxicas o problematicas sin la capa de refusal, en entornos controlados de laboratorio.
- Despliegue local en hardware de consumo: con la cuantizacion i1-Q2_K (3,5 GB) o superiores del catalogo, el modelo cabe en GPUs de gama media y en CPU, lo que facilita experimentos sin infraestructura cloud.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas que el modelo original rechazaria, siempre que el uso cumpla la legislacion aplicable.
- Pruebas de pipelines de inferencia GGUF: sirve como banco de pruebas para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de desplegar modelos mayores.
- Analisis comparativo de cuantizaciones: el fichero imatrix incluido permite generar quants propios y comparar la degradacion de calidad entre IQ1_S, IQ2 y Q4/Q5, util para estudiar el impacto de la cuantizacion en un modelo de 8B.
- Fine-tuning y destilacion experimentales: como modelo base sin refusal, puede emplearse en experimentos de ajuste fino donde el comportamiento de rechazo interfiera con el dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB para la cuantizacion i1-Q2_K; entre 4 y 6 GB para quants de 3-4 bits (Q3_K_M, IQ4_XS); en torno a 6-7 GB para Q5_K_M; y cerca de 7-8 GB para Q6_K, a los que hay que sumar el espacio de contexto KV cache.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para cuantizaciones de 4 bits (RTX 3060 Ti, RTX 4060, RTX 3070); RTX 4090, A100 o H100 para ejecucion en FP16 o quants altos con contextos largos.
- Cabe en GPU de consumo: si, en modelos con 6-8 GB de VRAM usando quants de 3-4 bits; tambien en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` lo sugiere); vLLM y TGI no soportan GGUF de forma nativa sin conversion a otros formatos.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| granite-4.2-8b-abliterated-i1-GGUF (este) | 8,79 B | no disponible | en | apache-2.0 | GGUF (i1/imatrix) | Variante sin refusal, cuantizada por mradermacher |
| Lonelyguyse1/granite-4.2-8b-abliterated | 8,79 B | no disponible | en | apache-2.0 | safetensors | Modelo base abliterated del que deriva este |
| mradermacher/granite-4.2-8b-abliterated-GGUF | 8,79 B | no disponible | en | apache-2.0 | GGUF (static) | Cuantizaciones estaticas del mismo modelo base |
| IBM Granite 4.2 8B (original) | 8,79 B | no disponible | en (y otros segun version) | apache-2.0 | safetensors | Modelo original con comportamiento de rechazo intacto |

## Limitaciones y advertencias

- La abliteration elimina el mecanismo de rechazo, lo que incrementa el riesgo de generar contenido toxico, ilegal o danino; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion propio de un modelo de 8B, agravado por la perdida de calidad de las cuantizaciones de 2-3 bits (i1-Q2_K es la mas agresiva del catalogo y el propio autor sugiere IQ3_XXS como alternativa de mejor calidad).
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto no documentada en la informacion disponible; conviene verificarla en el modelo base antes de disenar aplicaciones con contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador; la ausencia de refusal no exime del cumplimiento normativo.
- Modelo sin descargas ni likes en el momento de la consulta y creado en 2026-11-27: no hay evidencia de comunidad, validacion externa ni reportes de calidad.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esta perdida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/granite-4.2-8b-abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/Lonelyguyse1/granite-4.2-8b-abliterated
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/granite-4.2-8b-abliterated-GGUF
- Pagina de overview del autor para este modelo: https://hf.tst.eu/model#granite-4.2-8b-abliterated-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/granite-4.2-8b-abliterated-i1-GGUF/resolve/main/granite-4.2-8b-abliterated.imatrix.gguf
- Cuantizacion i1-Q2_K: https://huggingface.co/mradermacher/granite-4.2-8b-abliterated-i1-GGUF/resolve/main/granite-4.2-8b-abliterated.i1-Q2_K.gguf
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del autor): https://www.nethype.de/
