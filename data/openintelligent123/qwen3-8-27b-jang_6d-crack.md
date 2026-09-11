# Openintelligent123/Qwen3.8-27B-JANG_6D-CRACK

## Resumen

Qwen3.8-27B-JANG_6D-CRACK es una version cuantizada y modificada del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Openintelligent123 a partir del trabajo de dealignai. Se trata de un modelo denso hibrido de 27.781.427.952 parametros (unos 27,8 B) que combina capas de atencion lineal GatedDeltaNet con capas de atencion completa con compuertas, a lo largo de 64 capas, y que ademas incorpora comprension de imagen y video (pipeline `image-text-to-text`).

Sobre esa base se aplican dos transformaciones. La primera es CRACK (Controlled Refusal Ablation via Calibrated Knockouts), un metodo de ablacion a nivel de pesos que elimina el comportamiento de rechazo del modelo. La segunda es la cuantizacion JANG_6D, un bundle MLX de ~6 bits con cuantizacion afin y calibracion por imatrix, que deja el modelo en unos 24 GB de peso para ejecutarse en Apple Silicon.

Su relevancia practica es doble: por un lado es una de las pocas variantes de la familia con vision, video, tool calling nativo, modo de razonamiento por niveles y cabecera MTP de decodificacion especulativa preservadas tras la cuantizacion; por otro, sirve como caso de estudio de hasta que punto una ablacion de rechazo agresiva puede mantener la calidad general. El modelo declara una subida de +0,35 pp en MMLU respecto al base (89,12 % frente a 88,77 %) y un 100 % de cumplimiento en HarmBench harm-240, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: GatedDeltaNet (atencion lineal) + atencion completa con compuertas, 64 capas |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG_6D: ~6 bits, afin, con imatrix, empaquetado MLX (~24 GB). La familia incluye tambien perfiles 2D (11 GB), 4D (17 GB) y MXFP8 (27 GB) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bundle MLX; libreria `mlx`, sin GGUF publicado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27,8 B parametros con una arquitectura hibrida de 64 capas que alterna mecanismos de atencion lineal tipo GatedDeltaNet con capas de atencion completa con compuertas. Esta mezcla busca reducir el coste de la atencion sobre secuencias largas manteniendo la capacidad de recuperacion de informacion de la atencion completa. El modelo es multimodal (imagen y video) y conserva una cabecera nativa de Multi-Token Prediction (MTP) que actua como borrador para decodificacion especulativa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el pipeline de alineamiento (RLHF/DPO) del modelo base. Lo que si se documenta es el post-procesado: la ablacion CRACK elimina la conducta de rechazo calibrando los knockouts por modelo, y la cuantizacion JANG_6D aplica cuantizacion afin de ~6 bits con calibracion imatrix. Segun la model card, la cabecera MTP se ha reajustado para alinearse con el modelo sin censura, de modo que sus borradores siguen las salidas complacientes, con una tasa de aceptacion de borradores medida de ~68 % en esta cuantizacion; el MTP se activa automaticamente con temperatura 0 o muestreo determinista.

## Capacidades

- Generacion de texto conversacional multilingue en ingles y chino.
- Razonamiento con niveles de esfuerzo configurables: `xhigh` (por defecto), `medium` y `low` mediante el kwarg `reasoning_effort` de la plantilla de chat; etiquetas `<think>...</think>`; se puede desactivar con `enable_thinking=False`.
- Comprension de imagen y video (pipeline `image-text-to-text`).
- Tool calling nativo con esquema XML de llamada a funciones, preservado tras la cuantizacion.
- Decodificacion especulativa mediante cabecera MTP nativa, preservada y realineada con el modelo modificado.
- Comportamiento de rechazo eliminado a nivel de pesos: el modelo responde a peticiones de todas las categorias de tarea en lugar de negarse.
- Capacidades de conocimiento general medidas con MMLU de 57 materias (89,12 % en modo logit sobre esta cuantizacion).
- No se documentan capacidades de audio ni de generacion de imagenes.

## Casos de uso

- Investigacion en seguridad y red teaming: el modelo permite estudiar como se comporta un LLM sin mecanismos de rechazo, comparando sus respuestas con las del base para caracterizar el efecto de la ablacion sobre distintos tipos de peticion.
- Evaluacion de tecnicas de ablacion: reproduce el metodo CRACK sobre un modelo denso hibrido de 27,8 B y sirve para medir el coste real de la ablacion en conocimiento general (delta de MMLU) usando el arnes descrito en la model card.
- Testing de clasificadores de contenido: al producir cumplimiento del 100 % en HarmBench harm-240, es un generador adversario util para validar y calibrar clasificadores de moderacion que deben detectar contenido problematico.
- Asistentes multimodales en local sobre Apple Silicon: con vision y video preservados y ~24 GB de peso, se puede desplegar un asistente que describa imagenes o resuma video sin enviar datos a la nube.
- Pipelines de agentes con tool calling: el esquema XML nativo permite integrar el modelo en bucles de agente multi-paso que invocan herramientas externas, con el modo de razonamiento ajustado a `low` o `medium` para reducir latencia.
- Analisis de documentos e imagenes tecnicas en ingles y chino: combinando contexto y vision, es adecuado para extraer informacion de capturas, diagramas o fotogramas de video en flujos de trabajo bilingues.
- Inferencia local con decodificacion especulativa: la cabecera MTP con ~68 % de aceptacion de borradores permite acelerar la generacion en entornos MLX con muestreo determinista, util en aplicaciones interactivas sobre hardware de Apple.
- Fine-tuning e investigacion academica: al estar bajo Apache 2.0 y en safetensors, se puede usar como punto de partida para estudios de alineacion, aunque con las advertencias eticas y legales indicadas mas abajo.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados a traves del runtime MLX. HarmBench se puntua con un clasificador estricto consciente de codigo y quimica (solo cuenta el cumplimiento sustantivo, coherente y sobre el tema). MMLU es el benchmark estandar de 57 materias en modo logit.

| Metrica | Base | CRACK |
|---|---:|---:|
| MMLU (57 materias, logit) | 88,77 % | 89,12 % |
| HarmBench (harm-240, cumplimiento / ASR) | rechaza | 100,0 % |

Comparativa entre niveles de cuantizacion de la misma familia, con el mismo arnes de evaluacion:

| Perfil | Tamano | MMLU base | MMLU CRACK | Delta MMLU | HarmBench-240 |
|---|---|---:|---:|---:|---:|
| 2D | 11 GB | 80,0 % | 76,84 % | -3,16 pp | 100,0 % |
| 4D | 17 GB | 88,77 % | 87,72 % | -1,05 pp | 100,0 % |
| 6D (este modelo) | 24 GB | 88,77 % | 89,12 % | +0,35 pp | 100,0 % |
| MXFP8 | 27 GB | 86,67 % | 86,67 % | +0,0 pp | 100,0 % |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (HumanEval, GSM8K, MMMU, MMLU-Pro, etc.).

## Requisitos de hardware

- El bundle JANG_6D ocupa unos 24 GB (el repositorio completo pesa 25,8 GB), por lo que se necesita memoria unificada de al menos 32 GB en Apple Silicon para dejarlo cargado con margen para cache KV; 24 GB exactos es un limite demasiado ajustado.
- Disenado especificamente para Apple Silicon: la model card indica que todos los modelos JANG estan pensados para ejecutarse en vMLX (vmlx.net), un inferenciador MLX con cuantizacion de cache KV, reutilizacion de cache de prefijo, tool calling agentico y decodificacion especulativa.
- Tambien se puede cargar con la libreria `mlx_vlm` (`from mlx_vlm import load, generate`), tal como muestra la model card.
- No hay pesos GGUF publicados, por lo que no hay soporte directo conocido para llama.cpp, Ollama, vLLM, TGI ni TensorRT-LLM en esta publicacion.
- No se han publicado datos de latencia ni de throughput (tokens/s) mas alla de la tasa de aceptacion de borradores MTP (~68 %), que reduce el numero de pasos de decodificacion necesarios con muestreo determinista.
- No hay informacion sobre requisitos o rendimiento en GPU NVIDIA (A100, H100, RTX 4090).

## Comparativa con modelos similares

Comparativa con las otras cuantizaciones de la misma familia CRACK, que son la alternativa mas directa segun presupuesto de memoria:

| Modelo | Parametros | Tamano | MMLU (CRACK) | HarmBench | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-JANG_6D-CRACK (este) | 27,8 B | 24 GB | 89,12 % | 100,0 % | apache-2.0 | MLX safetensors |
| Qwen3.8-27B-JANG_4D-CRACK | 27,8 B | 17 GB | 87,72 % | 100,0 % | apache-2.0 | MLX safetensors |
| Qwen3.8-27B-JANG_2D-CRACK | 27,8 B | 11 GB | 76,84 % | 100,0 % | apache-2.0 | MLX safetensors |
| Qwen3.8-27B-MXFP8-CRACK | 27,8 B | 27 GB | 86,67 % | 100,0 % | apache-2.0 | MLX safetensors |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | 88,77 % | rechaza | apache-2.0 | safetensors |

No se dispone de datos que permitan comparar con modelos de otros fabricantes y tamano similar (por ejemplo, alternativas densas de ~27-32 B con vision) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- El modelo tiene la conducta de rechazo eliminada a nivel de pesos. La propia model card lo declara como material para investigacion y advierte de que seguira instrucciones que el modelo base rechazaria. Su uso en produccion orientada al publico es desaconsejable sin capas de moderacion externas.
- Riesgo elevado de generar contenido danino, ilegal o eticamente problematico, incluido contenido quimico o de codigo peligroso, dado el 100 % de cumplimiento declarado en HarmBench harm-240.
- El autor informa de que la evaluacion se hizo con el razonamiento desactivado y un clasificador especifico, por lo que las cifras no son directamente comparables con otros arneses de evaluacion de seguridad.
- Los benchmarks declarados son muy limitados: MMLU de 57 materias y HarmBench. No hay datos de codigo, matematicas, vision, video, tool calling ni agentes, pese a que estas capacidades se anuncian.
- La ganancia de +0,35 pp en MMLU esta dentro del ruido entre ejecuciones, segun reconoce la propia model card, por lo que no debe interpretarse como una mejora real de capacidad.
- La cuantizacion de 6 bits puede degradar tareas sensibles a la precision numerica; en la familia, el perfil 2D pierde mas de 3 puntos de MMLU.
- Idiomas limitados a ingles y chino: no hay soporte declarado de castellano ni de otras lenguas.
- Longitud de contexto no documentada en la informacion disponible.
- El modelo esta atado al ecosistema MLX y Apple Silicon: no hay pesos GGUF ni rutas de despliegue en vLLM, TGI u Ollama, lo que limita su uso en servidores GPU convencionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en septiembre de 2026, sin historial de mantenimiento. El ID de HuggingFace (`Openintelligent123/...`) no coincide con la organizacion citada en la model card (`dealignai/...`), lo que conviene verificar antes de confiar en el artefacto.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin mecanismos de rechazo puede entrar en conflicto con normativas de moderacion de contenido y con las condiciones de las plataformas donde se despliegue; la responsabilidad legal recae en el desplegador.
- La model card no incluye informacion sobre sesgos demograficos, toxicidad ni evaluacion de equidad.

## Enlaces

- HuggingFace: https://huggingface.co/Openintelligent123/Qwen3.8-27B-JANG_6D-CRACK
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 2D: https://huggingface.co/dealignai/Qwen3.8-27B-JANG_2D-CRACK
- Variante 4D: https://huggingface.co/dealignai/Qwen3.8-27B-JANG_4D-CRACK
- Variante MXFP8: https://huggingface.co/dealignai/Qwen3.8-27B-MXFP8-CRACK
- Inferenciador vMLX: https://vmlx.net
- Sitio del autor: https://dealign.ai
- Perfil en X: https://x.com/dealignai
- Apoyo al desarrollo: https://ko-fi.com/dealignai
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo (los resultados devueltos corresponden a un servicio de impresion fotografica y no guardan relacion).
