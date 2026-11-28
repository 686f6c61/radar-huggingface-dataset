# mradermacher/Qwen3.5-4B-Abliterated-Full-GGUF

## Resumen

`mradermacher/Qwen3.5-4B-Abliterated-Full-GGUF` es la version cuantizada en formato GGUF del modelo `panzy1222/Qwen3.5-4B-Abliterated-Full`, un derivado de la familia Qwen3.5 con aproximadamente 4.200 millones de parametros. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source que distribuye a traves de su cuenta de Hugging Face y de su pagina de seguimiento en hf.tst.eu.

El modelo base pertenece a la estirpe Qwen3.5, aunque la model card no documenta la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. El sufijo "Abliterated" indica que se ha aplicado una tecnica de ablacion o "abliteration" sobre los pesos, orientada a eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento. Este tipo de modificaciones suele degradar la coherencia general y las salvaguardas del modelo original, por lo que conviene tratarlo como un experimento de la comunidad y no como un modelo de referencia.

La relevancia practica de esta ficha esta en la disponibilidad de cuantizaciones estaticas en un rango amplio de precisiones (de Q2_K a f16), lo que permite ejecutar un modelo de 4B en hardware de consumo. El repositorio acumula 1.850 descargas y ocupa 39,2 GB en total, aunque cada archivo individual pesa entre 2,1 y 8,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5, transformer segun el prefijo del nombre) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base: la model card de la cuantizacion no incluye detalles sobre el tipo de transformer, el numero de capas, la dimension oculta, la atencion (estandar o lineal) ni la estrategia de posicionamiento. Tampoco se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otros metodos de alineamiento.

El unico dato tecnico relevante que aporta la model card es el proceso de cuantizacion: se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) generadas con llama.cpp a partir de los pesos en formato Hugging Face. El autor indica que las versiones con imatrix (ponderadas) estan en un repositorio separado (`Qwen3.5-4B-Abliterated-Full-i1-GGUF`), lo que sugiere que las de este repositorio no usan matriz de importancia.

El sufijo "Abliterated" implica una modificacion de los pesos orientada a suprimir las respuestas de rechazo. Esta tecnica, habitual en la comunidad, no viene acompanada de documentacion sobre el metodo exacto aplicado ni sobre el impacto medido en las capacidades del modelo.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- Capacidades de razonamiento, codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada.
- Soporte multilingue: limitado al ingles segun la etiqueta de idioma; no se documentan otros idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en equipos de sobremesa: con la cuantizacion Q4_K_M (2,8 GB) el modelo cabe en GPUs de consumo con 6-8 GB de VRAM, lo que permite experimentar con un 4B en hardware asequible.
- Prototipado de chatbots en ingles: la etiqueta `conversational` y su compatibilidad con endpoints lo hacen util para montar demos rapidas de dialogo sin depender de APIs externas.
- Pruebas de investigacion sobre ablacion: al ser una variante "abliterated", sirve para estudiar como afecta la supresion de rechazos al comportamiento del modelo en tareas de seguridad y alineamiento.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes de precision, lo que permite medir la degradacion de perplejidad entre Q2_K y f16 en un mismo modelo.
- Integracion en pipelines de CI para pruebas de regresion: un modelo de 4B cuantizado a Q4_K_S puede ejecutarse en runners con CPU y RAM moderada para validar plantillas de prompt.
- Experimentacion con tecnicas de cuantizacion: util para quien quiera comparar cuantizaciones estaticas frente a las versiones i1 con imatrix del mismo autor.
- Educacion y docencia: el tamano reducido y el formato GGUF facilitan explicar el funcionamiento de un LLM en un aula con portatiles convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo mas un margen para el contexto. Q2_K ronda 2,1 GB; Q4_K_M, 2,8 GB; Q8_0, 4,6 GB; f16, 8,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; 8 GB o mas para Q8_0; 12 GB o mas para f16 con contexto amplio. Una RTX 3060 de 12 GB o una RTX 4090 cubren todas las variantes con holgura.
- Cabe en GPU de consumo: si, en tarjetas como GTX 1660 (6 GB), RTX 3060, RTX 4060, RTX 4070 o superiores, usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. Tambien puede servirse mediante endpoints compatibles segun la etiqueta del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Abliterated-Full (este) | 4,2 B | no disponible | no disponible | GGUF, safetensors | Variante abliterated, solo ingles |
| Qwen3.5-4B (original, referencia) | ~4 B | no disponible | no disponible | safetensors | Modelo base sin ablacion; conserva alineamiento |
| mradermacher/Qwen3.5-4B-Abliterated-Full-i1-GGUF | 4,2 B | no disponible | no disponible | GGUF (imatrix) | Misma base con cuantizaciones ponderadas |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La ablacion de los mecanismos de rechazo puede incrementar la probabilidad de generar contenido danino, ofensivo o inseguro; no se recomienda su uso en produccion orientada al publico sin filtros adicionales.
- El proceso de ablacion suele degradar la coherencia y la calidad general respecto al modelo original; no hay evaluaciones publicadas que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a un modelo de 4B, agravado por la falta de documentacion sobre entrenamiento y alineamiento.
- Idioma limitado al ingles segun la etiqueta del repositorio; el rendimiento en castellano no esta documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Conviene consultar el repositorio del modelo base antes de cualquier despliegue productivo.
- El modelo base (`panzy1222/Qwen3.5-4B-Abliterated-Full`) no documenta arquitectura, contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad tecnica.
- La cuantizacion Q3_K_M aparece marcada como "lower quality" por el propio autor; para uso serio se recomienda Q4_K_M o superior.
- El repositorio no incluye resultados de benchmarks ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-Abliterated-Full-GGUF
- Modelo base: https://huggingface.co/panzy1222/Qwen3.5-4B-Abliterated-Full
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Abliterated-Full-i1-GGUF
- Pagina de seguimiento del autor: https://hf.tst.eu/model#Qwen3.5-4B-Abliterated-Full-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
