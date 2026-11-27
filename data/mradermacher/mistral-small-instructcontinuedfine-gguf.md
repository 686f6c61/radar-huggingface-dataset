# mradermacher/Mistral-Small-InstructContinuedFine-GGUF

## Resumen

Mistral-Small-InstructContinuedFine-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo AlSamCur123/Mistral-Small-InstructContinuedFine. El modelo subyacente es un ajuste fino (SFT) del Mistral Small Instruct original, entrenado con las librerias Unsloth y TRL, y orientado a tareas conversacionales en ingles. El repositorio que nos ocupa no contiene pesos en precision completa, sino exclusivamente ficheros GGUF listos para su uso con llama.cpp y derivados.

El modelo base cuenta con 22.247.282.688 parametros (aproximadamente 22,2 mil millones), lo que lo situa en la gama media-alta de la familia Mistral Small. La licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas. El repositorio completo ocupa 139,3 GB e incluye diez variantes de cuantizacion que van desde Q2_K (8,4 GB) hasta Q8_0 (23,7 GB).

La relevancia de esta ficha radica en que permite desplegar un modelo de 22B en hardware de consumo mediante cuantizacion agresiva, manteniendo la compatibilidad con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, entre otros). No obstante, se trata de un ajuste fino de terceros con muy poca traccion (47 descargas y 0 likes en el momento de la consulta), por lo que debe evaluarse con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral Small Instruct); detalles especificos no disponibles |
| Parametros totales | 22.247.282.688 (22,2B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas, sin imatrix) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino supervisado (SFT) del Mistral Small Instruct, realizado por el autor AlSamCur123 con las herramientas Unsloth y TRL. Los tags del repositorio confirman el uso de SFT y de la pila de Mistral, pero no se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases adicionales de RLHF o DPO. Tampoco se detalla la arquitectura interna (numero de capas, dimensiones de atencion, uso de GQA, etc.) mas alla de su pertenencia a la familia Mistral Small.

Las cuantizaciones de este repositorio son estaticas, es decir, generadas sin calibracion mediante imatrix (el propio autor indica que las variantes ponderadas/imatrix no estan disponibles por el momento). Esto implica que, a igualdad de tamano, las versiones IQ incluidas (unicamente IQ4_XS) pueden ofrecer una relacion calidad/tamano inferior a la que se obtendria con una imatrix bien calibrada. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste fino sobre Mistral Small Instruct.
- Razonamiento de proposito general y respuesta a instrucciones, segun el pipeline SFT declarado.
- Compatibilidad con text-generation-inference y transformers como librerias de referencia.
- Ejecucion en llama.cpp y derivados gracias al formato GGUF (Ollama, LM Studio, koboldcpp, etc.).
- Capacidades multilingues limitadas al ingles segun el campo `language` del repositorio.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (13,4 GB) permite ejecutar un modelo de 22B en GPUs con 16 GB de VRAM o en configuraciones CPU+GPU, algo inviable con los pesos en fp16 (aproximadamente 44 GB).
- Prototipado de asistentes conversacionales en ingles: el ajuste SFT sobre Mistral Small Instruct esta orientado a dialogo, por lo que puede emplearse para validar flujos de chat multi-turno antes de invertir en modelos mayores.
- Evaluacion comparativa de ajustes finos de terceros: util para investigadores que quieran medir como se comporta un SFT comunitario frente al Mistral Small Instruct original en tareas controladas.
- Inferencia en entornos con recursos limitados: las variantes Q2_K (8,4 GB) y Q3_K_S (9,7 GB) permiten ejecutar el modelo en equipos con 12 GB de VRAM o incluso en CPU con RAM suficiente, a costa de una perdida de calidad notable.
- Generacion de texto por lotes en ingles: con llama.cpp o TGI se puede procesar volumenes moderados de documentacion, resumenes o respuestas plantilla sin depender de APIs externas.
- Experimentacion educativa: sirve como caso practico para estudiar el impacto de las distintas cuantizaciones (Q2 a Q8) en la perplejidad y la calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~8,4 GB de pesos; ~10-11 GB en total con contexto moderado.
  - Q4_K_M: ~13,4 GB de pesos; ~15-16 GB en total.
  - Q5_K_M: ~15,8 GB de pesos; ~17-18 GB en total.
  - Q6_K: ~18,4 GB de pesos; ~20-21 GB en total.
  - Q8_0: ~23,7 GB de pesos; ~25-26 GB en total.
- GPU recomendadas:
  - Q8_0 y Q6_K: A100 40 GB, H100, RTX 6000 Ada, RTX 4090 (24 GB, justo para Q8_0).
  - Q5_K_M y Q4_K_M: RTX 4090, RTX 4080 Super, RTX 3090, A6000.
  - Q3_K y Q2_K: RTX 4070 Ti Super, RTX 4060 Ti 16 GB, GPUs con 12 GB.
- Cabe en GPU de consumo: si, desde Q2_K (12 GB) hasta Q4_K_M (16 GB); Q5 y superiores requieren 24 GB o configuracion CPU+GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-inference (para el modelo base en transformers), vLLM (requiere pesos no GGUF o soporte GGUF experimental).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-InstructContinuedFine-GGUF (este) | 22,2B | no disponible | Apache 2.0 | GGUF | SFT comunitario, solo ingles, sin imatrix |
| Mistral Small Instruct (original) | ~22B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF (via terceros) | Modelo de referencia oficial de Mistral AI |
| Gemma 2 27B Instruct | 27B | 8K (segun documentacion publica del modelo) | Gemma Terms of Use | safetensors, GGUF | Mayor tamano, licencia no Apache |
| Qwen2.5 32B Instruct | 32B | 128K (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto, multilingue |

La comparativa se limita a datos publicos de cada modelo; no se dispone de resultados de benchmarks de este ajuste fino que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo ajustado por un autor comunitario con muy poca validacion publica (47 descargas, 0 likes); no hay evidencia de evaluacion independiente de calidad.
- Solo soporta ingles segun el campo `language`; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en el ajuste fino.
- Las cuantizaciones son estaticas (sin imatrix), por lo que la calidad relativa puede ser inferior a la de cuantizaciones calibradas del mismo tamano.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar que el ajuste fino cumple las condiciones de la licencia original de Mistral Small.
- No se documentan sesgos conocidos, pero al ser un SFT sobre un modelo generalista es probable que herede los sesgos del modelo base.
- No hay informacion sobre la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- El repositorio incluye unicamente ficheros GGUF; para usar transformers o TGI en precision completa hay que acudir al modelo base AlSamCur123/Mistral-Small-InstructContinuedFine.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mistral-Small-InstructContinuedFine-GGUF
- Modelo base: https://huggingface.co/AlSamCur123/Mistral-Small-InstructContinuedFine
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-Small-InstructContinuedFine-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
