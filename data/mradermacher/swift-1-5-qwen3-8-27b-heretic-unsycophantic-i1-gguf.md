# mradermacher/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF

## Resumen
Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic. Se trata de un ajuste fino (post-training) sobre una base Qwen3 de 27.000 millones de parametros aproximadamente (26.895.998.464 parametros segun los pesos en safetensors), orientado a razonamiento eficiente en tokens (efficient-thinking, token-efficient) y a eliminar el comportamiento servil o adulador (no-sycophancy). El modelo ha sido ademas "abliterated" o decensurado (heretic, uncensored, decensored), lo que implica la supresion de mecanismos de rechazo.

La relevancia de esta ficha reside en que combina tres tendencias actuales del ecosistema open source: la optimizacion del razonamiento para reducir el consumo de tokens, la modificacion de la alineacion para eliminar sesgos de complacencia, y la distribucion en cuantizaciones GGUF con matriz de importancia (imatrix) para su uso en hardware de consumo. El repositorio ocupa 300,3 GB e incluye un amplio abanico de cuantizaciones, desde IQ1_S de 7,2 GB hasta Q6_K.

La licencia es swift-open-license-1.0, una licencia personalizada del autor original que debe revisarse antes de cualquier uso comercial. El modelo esta etiquetado como conversacional y compatible con endpoints, y la model card indica que es un modelo de vision (los ficheros mmproj, si existen, se alojan en el repositorio estatico). No se dispone de informacion sobre longitud de contexto ni sobre idiomas soportados mas alla del ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas con imatrix) |
| Idiomas soportados | en (ingles; no se detallan otros) |
| Licencia | swift-open-license-1.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna mas alla de su filiacion a la familia Qwen3 (tag qwen3_8) y su naturaleza transformer. El modelo base RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic es un ajuste fino post-entrenamiento sobre una base Qwen3 de aproximadamente 27.000 millones de parametros. Las etiquetas indican que el entrenamiento se centro en razonamiento eficiente en tokens (efficient-thinking, token-efficient) y en la eliminacion de la adulacion (no-sycophancy), ademas de un proceso de abliteration o decensurado (heretic, uncensored, decensored, abliterated). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF, DPO u otras tecnicas de alineacion.

La innovacion principal de esta publicacion es la cuantizacion: mradermacher ha generado cuantizaciones ponderadas con matriz de importancia (imatrix) a partir del modelo base, empleando el formato i1 de llama.cpp. El repositorio incluye el fichero imatrix para que terceros puedan generar sus propias cuantizaciones. La model card menciona que se trata de un modelo de vision y que los ficheros mmproj, si los hay, se encuentran en el repositorio estatico de cuantizaciones, aunque no se confirma la existencia de dichos ficheros.

## Capacidades
- Generacion de texto conversacional multi-turno, segun la etiqueta conversational.
- Razonamiento con modo de pensamiento eficiente en tokens (efficient-thinking, token-efficient, reasoning), orientado a reducir el consumo de tokens de cadena de pensamiento.
- Capacidades de terminal y ejecucion de tareas de linea de comandos (tag terminal-bench).
- Comportamiento no servil (no-sycophancy): el ajuste busca reducir la tendencia a complacer al usuario frente a respuestas incorrectas.
- Modelo decensurado o abliterated: se han suprimido los mecanismos de rechazo, lo que permite generar contenido que otros modelos bloquearian.
- Posible soporte de vision, segun la mencion de la model card a ficheros mmproj (no confirmado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque las etiquetas de razonamiento y terminal-bench sugieren uso en tareas de varios pasos.
- Capacidades multilingues: solo se declara ingles (en).

## Casos de uso
- Razonamiento eficiente en produccion: el ajuste token-efficient reduce el numero de tokens de pensamiento, lo que abarata el coste por consulta en pipelines de inferencia con presupuesto ajustado, especialmente con las cuantizaciones Q4_K_M (16,6 GB) o IQ4_XS (15,2 GB).
- Automatizacion de terminal y tareas de sistema: la etiqueta terminal-bench sugiere su uso como agente que interpreta salidas de shell, genera comandos y resuelve tareas de administracion en entornos controlados.
- Analisis de documentos sin restricciones de contenido: al ser un modelo decensurado, resulta adecuado para investigacion sobre sesgos, analisis de contenido sensible o generacion de texto en dominios donde otros modelos aplican rechazos.
- Evaluacion de alineacion y Robustez: util en investigacion para estudiar el efecto de la abliteration y la eliminacion de la adulacion sobre la calidad de las respuestas y la calibracion.
- Despliegue local en hardware de consumo: las cuantizaciones IQ2_M (10,1 GB) o IQ3_M (12,7 GB) permiten ejecutar un modelo de 27.000 millones de parametros en GPUs de 12-16 GB de VRAM con llama.cpp u Ollama.
- Generacion de codigo y scripts: con la cuantizacion Q5_K_M (18,9 GB aproximadamente) se puede integrar en asistentes de programacion locales, aunque no se han publicado benchmarks de HumanEval que lo confirmen.
- Prototipado de asistentes conversacionales en ingles: su naturaleza conversacional y su ventana de contexto (no documentada) permiten construir chatbots multi-turno para pruebas internas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona la etiqueta terminal-bench como area de entrenamiento, sin cifras asociadas.

## Requisitos de hardware
- VRAM estimada segun cuantizacion: IQ1_S ~7,2 GB; IQ2_M ~10,1 GB; IQ3_M ~12,7 GB; IQ4_XS ~15,2 GB; Q4_K_M ~16,6 GB; Q5_K_M ~18,9 GB; Q6_K ~22 GB (tamanos de fichero; la VRAM necesaria es ligeramente superior por el contexto y los buffers de inferencia).
- GPU recomendadas: para las cuantizaciones mayores (Q5_K_M, Q6_K), una RTX 4090 (24 GB) o A100/H100; para IQ4_XS y Q4_K_M, una RTX 4080/4090 o una RTX 3090 (24 GB) con margen; para IQ2/IQ3, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: si, en las cuantizaciones IQ1 a Q4_K_M con GPUs de 8-16 GB, y en Q5/Q6 con GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI si se dispone de los pesos en safetensors.
- Latencia y throughput: no disponibles; dependen de la cuantizacion, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF | ~26,9 mil millones | no disponible | swift-open-license-1.0 | GGUF | Cuantizacion imatrix de un ajuste heretic/no-sycophancy |
| Qwen3-32B (oficial) | 32,8 mil millones | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Base oficial, alineado y con benchmarks publicados |
| Gemma-3-27B-it | 27 mil millones | 128.000 tokens | Gemma Terms of Use | safetensors, GGUF | Modelo multimodal con contexto largo |
| Mistral-Small-3.1-24B | 24 mil millones | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea con licencia permisiva |

La comparativa se limita a parametros y licencia, ya que no se dispone de datos de rendimiento del modelo evaluado. Frente a las alternativas, la principal diferencia es su naturaleza decensurada y su licencia personalizada, que restringe la adopcion comercial en comparacion con Apache 2.0.

## Limitaciones y advertencias
- Modelo decensurado (abliterated): la supresion de rechazos implica que puede generar contenido danino, ilegal o sexualmente explicito; no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; el ajuste no-sycophancy puede reducir la complacencia, pero no garantiza la correccion factual.
- Sesgos conocidos: no documentados; al derivar de Qwen3 y de un ajuste fino no supervisado, hereda los sesgos de la base y puede amplificarlos por la falta de alineacion.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: swift-open-license-1.0 es una licencia personalizada; es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Vision: la model card menciona que es un modelo de vision, pero no se confirma la disponibilidad de ficheros mmproj en este repositorio; verificar antes de asumir capacidades multimodales.
- Produccion: al ser una cuantizacion de un ajuste fino no oficial, no cuenta con garantias de soporte ni con benchmarks que avalen su calidad frente a la base Qwen3.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF
- Modelo base: https://huggingface.co/RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
