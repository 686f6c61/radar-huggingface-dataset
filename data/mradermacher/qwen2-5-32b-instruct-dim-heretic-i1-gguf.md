# mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-DiM-heretic, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo Qwen2.5-32B-Instruct de Alibaba, en la que se ha aplicado una tecnica de modificacion de pesos para eliminar (o reducir significativamente) el comportamiento de rechazo y censura aprendido durante el alineamiento. El resultado es un modelo de chat que responde a practicamente cualquier peticion sin las negativas tipicas de los modelos alineados.

El modelo base subyacente, Qwen2.5-32B-Instruct, es un transformer decoder-only denso de 32.763.876.352 parametros (aproximadamente 32,8 mil millones), desarrollado por el equipo Qwen de Alibaba. Esta cuantizacion concreta emplea el metodo i1 (imatrix) de mradermacher, que genera cuantizaciones ponderadas con matriz de importancia para preservar mejor la calidad en tasas de compresion agresivas. El repositorio incluye un amplio conjunto de variantes de cuantizacion, desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en hardware muy diverso.

La relevancia de esta ficha radica en que combina tres factores: un modelo base de gran calidad y ampliamente conocido (Qwen2.5-32B-Instruct), una modificacion de alineamiento que lo hace util para investigacion sobre seguridad y comportamiento de modelos, y un formato GGUF optimizado para inferencia local con llama.cpp y derivados. Es importante senalar que el modelo esta etiquetado unicamente para ingles y que su naturaleza "uncensored" implica riesgos adicionales en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (i1/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multi-parte), mas archivo imatrix |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-32B-Instruct es un transformer decoder-only denso con atencion por causalidad estandar, desarrollado por Alibaba. La informacion proporcionada no detalla la composicion exacta del dataset de preentrenamiento ni el numero de tokens, aunque el modelo original fue entrenado con un corpus multilingue masivo y posteriormente afinado con instrucciones y tecnicas de alineamiento (SFT y RLHF/DPO, segun la documentacion publica de Qwen2.5). Esta ficha no dispone de esos detalles numericos.

La modificacion "DiM-heretic" aplicada por richardyoung sobre el modelo base es una tecnica de abliteration: se identifican las direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y se proyectan fuera de los pesos, de modo que el modelo pierde la tendencia a negarse a responder. El resultado se etiqueta como "reproducible" en los tags, lo que sugiere que el proceso de abliteration es documentado y replicable. Sobre esta variante, mradermacher ha generado cuantizaciones i1 (imatrix) que usan una matriz de importancia calculada a partir de datos de calibracion para minimizar la perdida de calidad en cada nivel de compresion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento general, matematicas y codigo (heredados del modelo base Qwen2.5-32B-Instruct).
- Respuestas sin rechazo ante peticiones que los modelos alineados rechazarian (comportamiento "uncensored" o "abliterated").
- Soporte de chat con plantilla de conversacion (etiqueta chat).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- No se confirma en la informacion disponible soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: el modelo permite estudiar como se comporta un LLM cuando se elimina la capa de rechazo, comparandolo con el Qwen2.5-32B-Instruct original para analizar diferencias en tasas de respuesta, toxicidad y sesgo.
- Red teaming y evaluacion de robustez: util para generar respuestas a prompts adversarios y medir la eficacia de filtros externos o clasificadores de seguridad en pipelines de moderacion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas sensibles que los modelos alineados suelen evitar, con la advertencia de revisar el contenido antes de publicarlo.
- Despliegue local en hardware de consumo: las cuantizaciones IQ2/IQ3 permiten ejecutar un modelo de 32B en GPUs con 12-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos completos en fp16.
- Experimentacion con cuantizacion: el repositorio incluye un archivo imatrix y multiples variantes, lo que permite comparar la degradacion de calidad entre IQ1, IQ2, IQ3, Q4, Q5 y Q6 en un mismo modelo.
- Fine-tuning posterior sobre la variante abliterated: sirve como punto de partida para adaptaciones de dominio que requieran un modelo base sin sesgo de rechazo, aunque con las cautelas legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): IQ1_S en torno a 9-10 GB; IQ2 en torno a 11-13 GB; IQ3 en torno a 14-16 GB; Q4_K_M en torno a 19-20 GB; Q5_K_M en torno a 23-24 GB; Q6_K en torno a 27-28 GB; fp16 en torno a 65 GB.
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para Q6 o fp16 se recomienda A100 40/80 GB, H100 o multiples GPUs.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 4080 (16 GB, solo IQ2/IQ3) y GPUs con 12 GB o mas usando cuantizaciones IQ2 muy agresivas con offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; tambien es posible usar vLLM o TGI si se convierte a otro formato, aunque no es el proposito de este repo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente de la cuantizacion, la GPU y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF (este) | 32,8B | no disponible | apache-2.0 | GGUF (i1) | Variante abliterated, solo ingles |
| Qwen2.5-32B-Instruct (original) | 32,8B | 131.072 tokens (segun documentacion publica) | apache-2.0 | safetensors, GGUF | Modelo alineado, multilingue |
| richardyoung/Qwen2.5-32B-Instruct-DiM-heretic | 32,8B | no disponible | apache-2.0 | safetensors | Modelo base de esta cuantizacion, sin cuantizar |
| mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF | 32,8B | no disponible | apache-2.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo base |

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica los filtros de rechazo del Qwen2.5-32B-Instruct original, por lo que puede generar contenido toxico, ilegal o peligroso. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos, citas y datos; la abliteration no elimina este riesgo y puede aumentar la confianza en respuestas incorrectas.
- Sesgos: al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento original; la eliminacion del rechazo puede exponer sesgos que el alineamiento ocultaba.
- Licencia: apache-2.0, lo que permite uso comercial, pero el usuario es responsable del contenido generado y del cumplimiento normativo (por ejemplo, RGPD o la AI Act europea).
- Contexto: no se confirma en esta ficha la longitud de contexto soportada por la cuantizacion; conviene verificar la configuracion del backend antes de asumir 131k tokens.
- Calidad en cuantizaciones muy bajas: IQ1 e IQ2 degradan notablemente el rendimiento; para produccion se recomienda Q4_K_M o superior.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente de la calidad de estas cuantizaciones concretas.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-DiM-heretic-GGUF
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Pagina de overview de mradermacher: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-DiM-heretic-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
