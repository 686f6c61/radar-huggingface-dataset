# kamikaze-san/pplx-decider-v1.3-mlx

## Resumen

pplx-decider-v1.3-mlx es una cuantizacion en 4 bits para MLX del backbone de texto de perplexity-ai/pplx-decider-v1.3, un modelo de decision y clasificacion multi-pregunta desarrollado por Perplexity AI. No se trata de un modelo generativo al uso, sino de un clasificador que, dado un estado (por ejemplo, un turno de conversacion) y un conjunto de preguntas con criterios, emite decisiones calibradas sobre cada una de ellas. La version aqui descrita es una obra derivada no oficial, publicada por el usuario kamikaze-san bajo la misma licencia Apache 2.0 del original.

El modelo base emplea un backbone Qwen/Qwen3.8-27B, con 25.624.600.064 parametros totales segun los pesos safetensors del repositorio (14,4 GB en total, 13,4 GB de pesos cuantizados). La conversion elimina la torre de vision, de modo que solo admite entrada de texto, y aplica cuantizacion afina de MLX a 4 bits con grupo de 64 en todas las capas Linear del backbone y en el embedding de tokens; las normas, las conv1d y los parametros A_log y dt_bias quedan sin cuantizar.

Su relevancia actual radica en que permite ejecutar localmente en hardware Apple Silicon un evaluador de seguridad y clasificador de decisiones de 27B, con un runner no causal que reproduce el protocolo original: un prompt conjunto, un marcador `<|fim_suffix|>` por pregunta, capas de atencion completa no causal y una lectura (readout) en cada marcador. La model card advierte explicitamente de que `mlx_lm.generate` no es utilizable con este modelo y de que la concordancia con los pesos bf16 originales no ha sido verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.8-27B) con capas de atencion no causal para el runner de decision; sin torre de vision |
| Parametros totales | 25.624.600.064 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afina de 4 bits, group size 64, en capas Linear y embedding de tokens; normas, conv1d, A_log y dt_bias sin cuantizar; readout en fp32 |
| Idiomas soportados | no disponible (la evaluacion cubre ingles, hindi, telugu, japones, hinglish y formas code-mixed con ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `readout.safetensors` [255, 5120] y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint oficial perplexity-ai/pplx-decider-v1.3, construido sobre un backbone Qwen/Qwen3.8-27B. La conversion, realizada con `convert_decider_mlx.py`, carga el checkpoint bf16 oficial, elimina la torre de vision, cuantiza a 4 bits con grupo de 64 y guarda el readout y las configuraciones originales. El layout de pesos se reorganiza de `language_model.*` a `language_model.model.*` (layout `qwen3_5` de mlx-lm); los pesos de conv1d se transponen y los de RMSNorm se convierten a la forma `1 + w` mediante el `sanitize` de mlx-lm, cambios numericamente equivalentes. El modelo se construye con `tie_word_embeddings: true` porque el checkpoint oficial de 27B no incluye `lm_head` (el readout de decision lo sustituye) mientras su config declara embeddings no ligados; como las decisiones solo leen estados ocultos, esto no altera el resultado.

El readout `readout.safetensors` ([255, 5120]) se mantiene sin cuantizar y se aplica en fp32, con la temperatura calibrada leida de `decision_config.json`. El modelo requiere un runner no causal: el runner incluido (`runner/`, procedente de Jakevin/pplx-decider-flash-v1.2-mlx, Apache 2.0) ejecuta el protocolo original con atencion completa no causal y un readout en cada marcador. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Clasificacion y decision multi-pregunta: dado un estado y un conjunto de preguntas con criterios (por ejemplo, tipo `choice` con opciones como billing, support o sales), emite una decision calibrada por pregunta.
- Evaluacion de seguridad: preguntas como "complied" (si la respuesta proporciono lo que pedia el objetivo del atacante) y "hazard" (si la respuesta da detalles daninos accionables).
- Procesamiento de conversaciones multi-turno y multilingues, segun la evaluacion realizada (ingles, hindi, telugu, japones, hinglish y formas code-mixed).
- Entrada exclusivamente de texto: la torre de vision fue eliminada, por lo que no admite imagenes.
- No soporta generacion de texto libre: `mlx_lm.generate` no es significativo con este modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el modelo actua como clasificador dentro de un pipeline.

## Casos de uso

- Moderacion y evaluacion de seguridad en conversaciones multi-turno: el modelo puede clasificar si una respuesta cumple un objetivo danino o proporciona detalles peligrosos, usando el runner no causal con un marcador por pregunta; es adecuado porque emite decisiones calibradas con umbral 0.5 y temperatura calibrada.
- Enrutamiento de tickets de soporte: a partir de un estado como "mi integracion falla con un 401 desde que rotamos la clave de API", el modelo decide entre categorias como billing, support o sales, tal como muestra el ejemplo de uso de la model card.
- Auditoria de jailbreaks multilingues: permite evaluar respuestas en ingles, hindi, telugu, japones, hinglish y formas code-mixed, lo que lo hace util para proyectos de seguridad que cubren varios idiomas.
- Etiquetado asistido de datos de seguridad: puede generar etiquetas de complied y hazard sobre conjuntos de respuestas para su revision posterior por anotadores humanos, dado su coste de ejecucion local.
- Investigacion en alineacion y evaluacion de modelos: sirve como juez local en Apple Silicon, con un coste aproximado de 15 segundos por fila multi-turno larga en un M4 Pro (unos 30 minutos para 128 filas).
- Clasificacion de intencion en pipelines de atencion al cliente: el modelo puede integrarse como componente de decision dentro de un sistema mayor que gestione conversaciones multi-turno, siempre que se respete el protocolo no causal del runner.

## Benchmarks y rendimiento

La model card no incluye benchmarks clasicos (MMLU, HumanEval, GSM8K). El unico dato publicado es la concordancia con un unico anotador humano sobre 128 respuestas de conversaciones de jailbreak multilingues y multi-turno (16 por forma linguistica), con umbral 0.5 e intervalos de confianza del 95 % calculados con 1.000 muestras bootstrap:

| Modelo | complied κ | hazard κ |
|---|---|---|
| pplx-decider-flash-v1.2 (MLX 4-bit, referencia) | 0,36 [0,22; 0,51], recall 80/113, falsos positivos 0/15 | 0,31 [0,19; 0,43], recall 35/81, falsos positivos 3/47 |
| pplx-decider-v1.3-mlx (este modelo) | 0,32 [0,19; 0,48], recall 76/113, falsos positivos 0/15 | 0,43 [0,28; 0,57], recall 49/81, falsos positivos 6/47 |

El autor advierte de que hubo un solo anotador y sin adjudicacion, por lo que es una comprobacion de referencia y no un estandar de oro, y de que no se ha comparado esta conversion con los pesos bf16 originales: esa concordancia debe considerarse no verificada.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 14,4 GB y los pesos cuantizados 13,4 GB; se ejecuta en memoria unificada de Apple Silicon, no en VRAM de GPU dedicada.
- GPU recomendadas: no aplica GPU NVIDIA; el modelo esta pensado para Apple Silicon. La model card cita un Apple M4 Pro como referencia de rendimiento.
- Cabe en consumer hardware: si, en equipos Apple Silicon con memoria unificada suficiente para alojar los aproximadamente 13,4 GB de pesos mas el overhead del runner.
- Opciones de despliegue: MLX y mlx-lm (probado con mlx 0.32.4 y mlx-lm 0.32.2) y transformers solo para el tokenizador; requiere el runner no causal incluido en `runner/`. No es compatible con vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Latencia y throughput: aproximadamente 15 segundos por fila multi-turno larga en un M4 Pro, unos 30 minutos para 128 filas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.3-mlx (este modelo) | 25.624.600.064 | no disponible | complied κ 0,32; hazard κ 0,43 (128 respuestas, un anotador) | Apache 2.0 | Hugging Face, MLX |
| perplexity-ai/pplx-decider-v1.3 (original bf16) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Jakevin/pplx-decider-flash-v1.2-mlx | no disponible | no disponible | complied κ 0,36; hazard κ 0,31 | Apache 2.0 | Hugging Face, MLX |

## Limitaciones y advertencias

- No es una version oficial de Perplexity: es una obra derivada no oficial bajo Apache 2.0, con LICENSE y NOTICE originales incluidos sin cambios.
- La concordancia con los pesos bf16 originales no ha sido verificada; la validacion de la receta se hizo sobre la version v1.2.
- La evaluacion se basa en un unico anotador humano sin adjudicacion y sobre 128 respuestas, por lo que no constituye un estandar de oro.
- Solo admite texto: la torre de vision fue eliminada y no procesa imagenes.
- No es un modelo generativo: `mlx_lm.generate` no es significativo y se requiere el runner no causal para reproducir el comportamiento.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Limitaciones de contexto e idiomas: la longitud de contexto no esta disponible; los idiomas soportados no estan declarados, aunque la evaluacion cubre varias lenguas y formas code-mixed.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una obra derivada conviene conservar los avisos de licencia y atribucion del modelo original.
- Para produccion: el rendimiento depende del hardware Apple Silicon y del runner; no hay datos de throughput en GPU dedicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kamikaze-san/pplx-decider-v1.3-mlx
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- Variante de referencia del runner: https://huggingface.co/Jakevin/pplx-decider-flash-v1.2-mlx
