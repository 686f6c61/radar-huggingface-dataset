# chenqinyuluguan/NeoHorse-1-4B

## Resumen

NeoHorse-1-4B es un modelo de lenguaje causal de aproximadamente 4B parametros (4.205.751.296 parametros reales segun los pesos en safetensors) desarrollado por TokenRhythm. Se trata de un ajuste fino (post-entrenamiento) sobre Qwen/Qwen3.5-4B, orientado especificamente a flujos agenticos basados en texto: uso de herramientas (tool use), generacion de codigo, razonamiento e instrucciones. El repositorio de HuggingFace que se analiza esta publicado bajo la cuenta `chenqinyuluguan`, mientras que la model card referencia los repositorios oficiales de `TokenRhythm`, lo que sugiere una copia o espejo.

El modelo se presenta como un prototipo inicial en la senda de la "automejora recursiva" (recursive self-improvement, RSI). El metodo propuesto en el informe tecnico asociado consiste en un "routing harness" que asigna tareas a un pool heterogeneo de modelos, registra las interacciones con herramientas y sus resultados, estima la demanda de capacidades y utiliza esa retroalimentacion por capacidad para configurar la siguiente mezcla de entrenamiento. Los modelos actualizados vuelven al harness, cerrando un ciclo evaluacion-seleccion-actualizacion.

Su relevancia practica es doble: por un lado, ofrece un modelo de 4B con licencia Apache-2.0 y pesos abiertos en safetensors, desplegable en hardware de gama media; por otro, documenta un incremento agregado de 5,93 puntos en una media macro sobre diez benchmarks frente a su modelo base (64,87 frente a 58,94). Esta es una release solo de texto: los pesos de vision del modelo base no se incluyen, y el reempaquetado cambia la configuracion y los nombres de las claves de los tensores sin modificar los valores finos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (etiqueta de arquitectura en transformers: `qwen3_5_text`); reempaquetado para inferencia solo de texto |
| Parametros totales | 4.205.751.296 (aproximadamente 4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (pesos publicados en safetensors en precision completa/bf16; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen3.5-4B (relacion: finetune) |
| Tamano del repositorio | 8,4 GB |
| Familia | NeoHorse Agent-Native Causal Language Model |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only, heredado de Qwen3.5-4B y reempaquetado bajo la etiqueta `qwen3_5_text` para inferencia exclusivamente textual. El reempaquetado modifica la configuracion y los nombres de las claves de los tensores, pero no los valores de los tensores ya ajustados; no se incluyen los pesos de vision. No se especifican en la informacion disponible el numero de capas, la dimension oculta ni el mecanismo de atencion (por ejemplo, si emplea atencion lineal o hibrida).

El post-entrenamiento se describe como un marco agentico guiado por enrutamiento, con dos componentes principales: SFT con curriculum guiado por enrutamiento y destilacion on-policy tambien guiada por enrutamiento. La idea central es convertir trayectorias de ejecucion reales en senal de entrenamiento, preservando el contexto de ejecucion y del harness alrededor de cada respuesta. El pipeline de datos aplica eliminacion de duplicados exactos y casi duplicados, descontaminacion respecto a los conjuntos de evaluacion, validacion estructural, evaluacion semantica en seis dimensiones y etiquetado a nivel de subescena con la tripleta Scene/Goal/Outcome. No se indican el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto conversacional e instrucciones (instruction-following) en el marco de un modelo causal de 4B.
- Uso de herramientas y function calling, segun los tags declarados (`tool-use`, `agentic`).
- Razonamiento multi-paso y comportamiento agentico dentro de un harness de ejecucion, que es el escenario para el que fue post-entrenado.
- Generacion y asistencia en codigo (`coding`).
- Razonamiento general (`reasoning`).
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La release es solo de texto y excluye explicitamente los pesos de vision del modelo base.

## Casos de uso

- Agentes autonomos con uso de herramientas: el modelo esta post-entrenado sobre trayectorias de ejecucion con contexto de harness, por lo que puede encadenar llamadas a funciones y mantener el estado de la tarea a lo largo de varios pasos.
- Asistente de codigo integrado en el IDE: sus tags de `coding` e `instruction-following` y su tamano de 4B permiten ejecucion local con latencia baja en una GPU de consumo, sin enviar codigo propietario a servicios externos.
- Automatizacion de pipelines de CI/CD: puede generar parches, mensajes de commit o scripts de correccion a partir de salidas de tests, actuando como un paso mas del pipeline mediante tool calling.
- Enrutamiento y orquestacion de modelos: el propio metodo de entrenamiento se basa en un routing harness que asigna tareas a un pool de modelos; NeoHorse-1-4B puede actuar como el componente ligero que clasifica la tarea, estima la demanda de capacidad y decide a que modelo derivar.
- Atencion al cliente automatizada: al ser un modelo de instrucciones con licencia Apache-2.0, se puede desplegar en servidores propios para conversaciones multi-turno, siempre que la longitud de contexto real del despliegue se valide (no publicada).
- Extraccion y estructuracion de informacion en flujos documentales: el pipeline de datos del proyecto usa etiquetado Scene/Goal/Outcome, lo que sugiere buena adaptacion a tareas de segmentacion y resumen de objetivos y resultados en documentos.
- Entornos de investigacion en agentes: util como baseline reproducible de 4B para comparar estrategias de post-entrenamiento agentico, dado que los pesos son abiertos y la licencia no restringe el uso comercial.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son la media macro agregada sobre diez benchmarks y la comparacion con el modelo base.

| Modelo | Media macro (10 benchmarks) | Diferencia |
|---|---|---|
| NeoHorse-1-4B | 64,87 | +5,93 |
| Qwen3.5-4B (base) | 58,94 | referencia |

No se han publicado en la informacion disponible los resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros), ni las condiciones de evaluacion (zero-shot/few-shot, harness, limites de tokens).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,4 GB en bf16/fp16 (coincide con el tamano del repositorio); en torno a 4,5 GB en int8 y alrededor de 2,5-3 GB en int4, aunque no se distribuyen pesos cuantizados oficiales y habria que generarlos.
- GPU recomendadas: para bf16, tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, L40S, A100, H100). Para cuantizacion int4, tarjetas de 8 GB pueden ser suficientes.
- Cabe en GPU de consumo: si, en bf16 cabe ajustadamente en una RTX 3060 de 12 GB o superior, y con holgura en una RTX 4090 de 24 GB. En GPUs de 8 GB es recomendable cuantizar.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM o SGLang para servido con throughput alto, y llama.cpp/Ollama solo si se convierte previamente a GGUF (no se proporciona GGUF en el repositorio). Tambien es compatible con endpoints alojados segun el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos de rendimiento en esta ficha |
|---|---|---|---|---|---|
| NeoHorse-1-4B | ~4,2B | no disponible | Apache-2.0 | Post-entrenamiento agentico sobre Qwen3.5-4B | Media macro 64,87 en 10 benchmarks |
| Qwen/Qwen3.5-4B | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base multimodal (incluye vision) | Media macro 58,94 en 10 benchmarks |
| Qwen3-4B | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo generalista de la familia Qwen3 | no disponible |
| Llama-3.2-3B | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo generalista de ~3B | no disponible |

No se dispone de datos verificados en la informacion proporcionada para completar una comparativa cuantitativa con alternativas de la misma categoria. La unica comparacion con respaldo es frente al modelo base Qwen3.5-4B, donde NeoHorse-1-4B reporta una ventaja de 5,93 puntos en la media macro.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Riesgo de alucinacion: inherente a un modelo causal de 4B post-entrenado para agentes; no se publican tasas de alucinacion ni evaluaciones de fidelidad factual.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto soportada ni la lista de idiomas, lo que impide garantizar un comportamiento multilingue correcto en produccion.
- Doble procedencia del artefacto: la ficha analizada esta publicada bajo la cuenta `chenqinyuluguan`, mientras que la model card y los enlaces apuntan a repositorios de `TokenRhythm`. Conviene verificar la cadena de publicacion antes de usarlo en produccion.
- Solo texto: los pesos de vision del modelo base no se incluyen, por lo que cualquier tarea de imagen queda fuera de alcance.
- Sin pesos cuantizados oficiales: no se distribuyen variantes GGUF, AWQ ni GPTQ, lo que traslada al usuario el trabajo de cuantizacion y su validacion.
- Metrica agregada: el unico resultado publicado es una media macro sobre diez benchmarks sin desglose, lo que dificulta evaluar el rendimiento en tareas concretas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales, siempre que se conserven los avisos de copyright y licencia. Hay que comprobar ademas las condiciones del modelo base Qwen3.5-4B, no detalladas en la informacion disponible.
- Estado de prototipo: el propio autor lo describe como prototipo inicial dentro de una linea de investigacion, no como un modelo listo para produccion a gran escala.

## Enlaces

- Modelo en HuggingFace (ficha analizada): https://huggingface.co/chenqinyuluguan/NeoHorse-1-4B
- Modelo en HuggingFace (organizacion TokenRhythm): https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.08183
- Repositorio en GitHub: https://github.com/TokenRhythm/NeoHorse
- ModelScope: https://www.modelscope.cn/models/TokenRhythm/NeoHorse-1-4B
- Pagina de la organizacion: https://tokenrhythm.ai/
- Perfil en X/Twitter: https://x.com/opensquilla
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron enlaces genericos a YouTube, sin relacion con NeoHorse-1-4B ni con su informe tecnico.
