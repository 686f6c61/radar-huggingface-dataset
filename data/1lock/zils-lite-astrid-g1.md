# 1lock/zils-lite-astrid-g1

## Resumen

zils-lite-astrid-g1 es un ajuste fino completo (full fine-tune) del modelo vllm-sr/d3-lite, un transformer de tipo decoder-only con 852.985.920 parametros (aproximadamente 0,85B). El modelo base d3-lite es a su vez un fine-tune de Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura y el chasis del modelo Qwen original. Lo desarrolla el autor identificado como 1lock y esta publicado con licencia Apache-2.0.

El modelo esta especializado en tareas de decision en el formato del "examen" Zils, un conjunto de evaluacion ligado a la subnet 127 (Zils) de Bittensor. Se ha entrenado sobre 5.592 items de decision generados con una receta de autoria publica que combina un modelo autor y un verificador ciego, usando como fuentes de estilo los splits de entrenamiento de diversos datasets publicos con licencias de uso comercial (razonamiento de sentido comun, matematicas, NLI, function calling, analisis de sentimiento, etc.).

Su relevancia es acotada y muy especifica: sirve como cuerpo candidato para la mineria de la subnet Zils de Bittensor, con un rendimiento en las semillas publicas del examen (47,3) superior al del modelo base d3-lite (44,45), pero inferior a este en los flujos publicos de "Outcomes". Es, por tanto, un modelo de nicho orientado a un benchmark concreto, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (chasis d3-lite, derivado de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 (aprox. 0,85B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model-00001-of-00001.safetensors + model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura del chasis d3-lite, un transformer decoder-only derivado de Qwen/Qwen3.5-0.8B, con aproximadamente 0,85B de parametros. No se documentan innovaciones arquitectonicas propias: el autor reutiliza el layout de pesos del chasis d3-lite sin modificaciones estructurales. No se especifica la longitud de contexto ni detalles sobre atencion (lineal, sliding window, etc.) en la informacion disponible.

El entrenamiento consistio en un full fine-tune sobre 5.592 items de decision en formato de examen Zils, generados con la receta publica `scripts/author_exam.py` del repositorio `ooo-hq/zils`, que combina un modelo autor con un verificador ciego. Las fuentes de estilo fueron los splits de entrenamiento de datasets publicos con licencia de uso comercial: cosmos_qa, commonsense_qa, ai2_arc, gsm8k, SVAMP, multi_nli, scinli, snli, dbpedia_14, squad_v2, boolq, drop, hermes-function-calling-v1, go_emotions, Sarcasm News Headlines, amazon_polarity, math_qa, ropes y qasc. Se excluyeron los splits de validacion y test reservados, la fuente de herramientas glaive y las semillas publicas del examen; los items se deduplicaron (exacta y casi duplicada) contra las semillas y los splits reservados, y se descartaron 342 items cuyo texto fuente aparecia tambien en un split reservado. La receta de optimizacion usa entropia cruzada suave mas perdida de Brier y un termino KL (0,1) hacia el modelo base, con learning rate 5e-6 durante 2 epocas.

## Capacidades

- Generacion de texto y respuestas a items de decision en el formato del examen Zils (opcion multiple y familias de decision afines).
- Razonamiento de sentido comun y respuesta a preguntas, derivado de las fuentes cosmos_qa, commonsense_qa, ai2_arc, boolq, qasc y dbpedia_14.
- Razonamiento matematico basico, entrenado con gsm8k, SVAMP, math_qa y ropes.
- Inferencia de lenguaje natural (NLI) y deteccion de contradiccion, a partir de multi_nli, snli y scinli.
- Comprension lectora y respuesta extractiva, con squad_v2 y drop como fuentes.
- Function calling basico, por la inclusion de hermes-function-calling-v1 en el dataset de entrenamiento.
- Clasificacion de emociones y analisis de sentimiento, derivado de go_emotions, amazon_polarity y Sarcasm News Headlines.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, vision o audio: no documentados.

## Casos de uso

- Mineria en la subnet 127 (Zils) de Bittensor: el modelo se commit a la subnet mediante la hotkey indicada en `zils-owner.json`, y su proposito declarado es servir como cuerpo candidato en el examen de decision de dicha subnet. Es adecuado porque su puntuacion en las semillas publicas del examen (47,3) supera la del modelo base d3-lite (44,45).
- Evaluacion comparativa de cuerpos de modelo en el examen Zils: permite medir el efecto de un full fine-tune sobre el chasis d3-lite frente al modelo base, usando las semillas publicas `zils-ai/base-exam-seed-v1..v4` filtradas por items relevantes para la variante lite.
- Clasificacion y respuesta a items de sentido comun en formato de opcion multiple: util para prototipar pipelines de evaluacion de razonamiento sobre datasets como commonsense_qa, ai2_arc o qasc, dado que el modelo fue entrenado con esos estilos.
- Experimentos de investigacion sobre perdida de Brier y terminos KL en ajuste fino: la receta documentada (soft cross-entropy + Brier + KL 0,1) permite reproducir y estudiar el efecto de estas funciones de perdida en modelos pequenos de 0,85B.
- Tareas de function calling ligero en entornos con recursos limitados: al derivar de un modelo de 0,85B y haberse entrenado con hermes-function-calling-v1, puede desplegarse en un solo GPU consumer para prototipos de invocacion de herramientas, aunque sin garantias de robustez en produccion.
- Analisis de sentimiento y emociones en textos cortos: adecuado para experimentos de clasificacion sobre resenas (amazon_polarity) o titulares (Sarcasm News Headlines), siempre que se valide su comportamiento fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

| Benchmark | zils-lite-astrid-g1 | vllm-sr/d3-lite (base) |
|---|---|---|
| Semillas publicas del examen Zils (`base-exam-seed-v1..v4`, items lite) | 47,3 | 44,45 |
| Flujos publicos de Zils Outcomes (`python -m zils.current`) | por debajo de d3-lite (sin cifra publicada) | referencia |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas cifras publicadas corresponden al examen propio de la subnet Zils.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parametros, en fp16 se requieren aproximadamente 1,7 GB solo para pesos; en fp32, unos 3,4 GB. El repositorio ocupa 1,7 GB, coherente con pesos en fp16 o bf16.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para inferencia en fp16 con overhead de activaciones y cache KV; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas de VRAM; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al estar en formato transformers con safetensors, es compatible con vLLM, TGI y transformers nativo; no se documentan pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento documentado |
|---|---|---|---|---|---|
| zils-lite-astrid-g1 | 0,85B | no disponible | Apache-2.0 | Fine-tune para examen Zils (subnet 127 Bittensor) | 47,3 en semillas publicas del examen Zils |
| vllm-sr/d3-lite | no disponible (chasis del mismo tamano) | no disponible | Apache-2.0 | Modelo base del que deriva | 44,45 en semillas publicas del examen Zils |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | no disponible en la informacion | Modelo generalista de proposito general | no disponible |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que no se dispone de datos de benchmarks convencionales ni de modelos alternativos evaluados en el examen Zils en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo rinde por debajo de d3-lite en los flujos publicos de Zils Outcomes: esta ajustado a la familia de examen de decision autoria, no a los items de Outcomes.
- Es un modelo de nicho: su entrenamiento se limita a 5.592 items en formato de examen Zils, por lo que su capacidad de proposito general es muy limitada y no debe evaluarse como un modelo generalista de 0,85B.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de calibracion fuera del examen; el uso de perdida de Brier y termino KL no garantiza calibracion en dominios no vistos.
- Sesgos conocidos: no documentados. Las fuentes de entrenamiento incluyen datasets de sentimiento y noticias que pueden introducir sesgos de dominio y de estilo periodistico.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingue mas alla del que herede del modelo base Qwen.
- Longitud de contexto: no disponible; no se documenta la ventana maxima soportada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las fuentes de datos de entrenamiento tienen licencias variadas (CC-BY-4.0, CC-BY-SA-3.0/4.0, MIT, Apache-2.0, OANC); el autor declara haber usado solo datasets con licencia de uso comercial, aunque el cumplimiento de atribucion de las licencias CC-BY y CC-BY-SA debe verificarse por el usuario.
- El modelo se publica con 0 descargas y 0 likes en el momento de la consulta, y su fecha de creacion es 2026-11-05; no hay evidencia de validacion independiente fuera de la subnet.
- Para produccion: no se documentan pesos cuantizados, latencias ni pruebas de robustez; se recomienda validacion exhaustiva antes de cualquier despliegue fuera del contexto de mineria de la subnet.

## Enlaces

- HuggingFace: https://huggingface.co/1lock/zils-lite-astrid-g1
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Repositorio de la receta de autoria: `ooo-hq/zils` (ruta `scripts/author_exam.py`; no se proporciona URL directa en la informacion disponible)
- Documentacion de mineria de la subnet: `docs/mining.md` del repositorio `ooo-hq/zils` (no se proporciona URL directa)
- Semillas publicas del examen: `zils-ai/base-exam-seed-v1..v4` (no se proporciona URL directa)
- Modelo Qwen de referencia: https://huggingface.co/Qwen/Qwen3.5-0.8B (enlace inferido del model card; no verificado en la busqueda)
