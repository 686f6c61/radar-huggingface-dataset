# mradermacher/dots.llm1.base-GGUF

## Resumen

dots.llm1.base es un modelo de lenguaje de gran tamano desarrollado por dots-studio (vinculado a rednote-hilab, la organizacion de investigacion de Xiaohongshu). Esta ficha documenta la version GGUF del modelo base, publicada por mradermacher, que permite ejecutar el modelo en entornos de inferencia local mediante llama.cpp y derivados. El modelo original se distribuye bajo licencia MIT y esta orientado a los idiomas ingles y chino.

Se trata de un modelo base (no una version instruida o chat), pensado para servir como punto de partida para fine-tuning o para generacion de texto sin formato conversacional. El repositorio GGUF incluye unicamente cuantizaciones estaticas (Q2_K a Q8_0); las cuantizaciones ponderadas con imatrix se publican en un repositorio separado.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad un modelo de gran tamano en formato GGUF, con opciones de cuantizacion que van desde aproximadamente 58 GB hasta 152 GB, lo que permite desplegarlo en hardware de gama alta o servidores multi-GPU. El tamano del repositorio (1025 GB) refleja la magnitud del modelo original en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors via el modelo base |

## Arquitectura y entrenamiento

La informacion disponible sobre la arquitectura interna del modelo base (dots-studio/dots.llm1.base) no esta detallada en la model card del repositorio GGUF. No se especifica si se trata de un transformer denso, un modelo MoE o una arquitectura hibrida, ni se documentan el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

Lo unico verificable a partir de los datos proporcionados es que el modelo original se distribuye bajo licencia MIT, que soporta ingles y chino, y que mradermacher ha generado cuantizaciones estaticas con la herramienta de cuantizacion de llama.cpp (se indica `quantize_version: 2` y `output_tensor_quantised: 1`). Las cuantizaciones con imatrix, que suelen preservar mejor la calidad a igual tamano, estan disponibles en el repositorio dots.llm1.base-i1-GGUF.

## Capacidades

- Generacion de texto en ingles y chino, como modelo base sin ajuste conversacional.
- Punto de partida para fine-tuning: al ser un modelo base, es adecuado para entrenamiento posterior orientado a tareas especificas.
- Inferencia local mediante llama.cpp y herramientas compatibles con GGUF.
- Soporte multilingue limitado a ingles y chino segun los tags del repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Fine-tuning para dominio especifico: el modelo base puede ajustarse con datos propios (por ejemplo, corpus juridicos o tecnicos) en ingles o chino, usando las cuantizaciones de mayor precision (Q8_0 o Q6_K) como referencia de calidad o los pesos originales para entrenamiento completo.
- Generacion de texto en servidores multi-GPU: con cuantizaciones Q4_K_M (94,6 GB) o Q5_K_M (108,1 GB) puede desplegarse en nodos con varias GPU de 80 GB para tareas de generacion por lotes.
- Despliegue en estaciones de trabajo de gama alta: las cuantizaciones Q2_K (58,2 GB) y Q3_K_S (67,8 GB) reducen el requisito de memoria lo suficiente para entornos con 4 GPU de 24 GB o configuraciones con memoria unificada amplia, a costa de calidad.
- Experimentacion con cuantizacion: el repositorio permite comparar el impacto de distintos niveles de cuantizacion (Q2_K frente a Q8_0) sobre la perplexidad, util para estudiar la degradacion de modelos de gran tamano.
- Traduccion y procesamiento bilingue ingles-chino: dado el soporte declarado de ambos idiomas, puede emplearse para tareas de transformacion de texto entre estas lenguas, con validacion humana por tratarse de un modelo base.
- Investigacion academica sobre modelos abiertos: la licencia MIT facilita el uso en estudios comparativos y replicas de experimentos sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 58 GB (Q2_K) y 152 GB (Q8_0), segun la cuantizacion; a esto hay que sumar la memoria para el contexto KV.
- GPU recomendadas: configuraciones multi-GPU de 80 GB (A100, H100) para las cuantizaciones Q5 a Q8; para Q2_K y Q3_K_S pueden bastar 4 GPU de 24 GB (RTX 4090) o equivalentes, aunque con calidad reducida.
- Cabe en consumer GPU: solo en configuraciones multi-GPU o con memoria unificada muy amplia; una unica RTX 4090 (24 GB) no es suficiente para ninguna de las cuantizaciones publicadas.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; los pesos originales en safetensors pueden servirse con vLLM o TGI si se dispone de hardware adecuado.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota: las cuantizaciones Q5_K_S en adelante estan divididas en 3 o 4 partes y requieren concatenacion previa al uso.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de arquitectura, parametros ni rendimiento que permitan establecer una comparacion fiable con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin ajuste posterior.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos base de gran tamano.
- Sesgos conocidos: no documentados en la model card; al entrenarse presumiblemente con datos web, cabe esperar sesgos de dominio, idioma y cultura.
- Licencia MIT: permite uso comercial, pero conviene revisar el enlace de licencia del modelo original (rednote-hilab/dots.llm1.base) por si existen condiciones adicionales de atribucion.
- Requisitos de hardware elevados: ninguna cuantizacion cabe en una GPU de consumo individual; el despliegue exige infraestructura multi-GPU.
- Las cuantizaciones de menor tamano (Q2_K, Q3_K_M) degradan la calidad de forma notable segun las notas del propio autor.
- Las cuantizaciones con imatrix, de mejor relacion calidad-tamano, estan en un repositorio aparte y no en este.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dots.llm1.base-GGUF
- Modelo base original: https://huggingface.co/dots-studio/dots.llm1.base
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/dots.llm1.base-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#dots.llm1.base-GGUF
- Licencia del modelo original: https://huggingface.co/rednote-hilab/dots.llm1.base/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
