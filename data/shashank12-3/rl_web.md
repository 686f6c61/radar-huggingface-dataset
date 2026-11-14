# shashank12-3/rl_web

## Resumen

`shashank12-3/rl_web` es el repositorio de pesos y artefactos asociado a ContextGuard, un sistema de moderacion de contenido con enrutado por idioma desarrollado por el usuario shashank12-3. No se trata de un unico modelo generativo, sino de un conjunto de artefactos de inferencia que combina varios componentes: un clasificador de toxicidad basado en DistilBERT para ingles, un clasificador basado en HingBERT para hindi, hinglish, texto mixto e incierto, un router de identificacion de idioma basado en FastText (`lid.176.ftz`), un clasificador zero-shot de tipo de contenido (`facebook/bart-large-mnli`) y una politica de decision basada en GRPO sobre un export causal-LM de la familia Qwen.

El problema que resuelve es la moderacion multilingue en entornos donde conviven ingles, hindi en devanagari y romanizado (hinglish), evitando que un unico clasificador monolingue procese texto que no entiende. La innovacion principal es el enrutado previo a la inferencia: se detecta el idioma combinando la confianza de FastText con deteccion de escritura Unicode y evidencia lexica a nivel de token y caracter para el roman-hindi, en lugar de depender solo de listas de palabras clave.

El repositorio ocupa 40,6 GB e incluye safetensors entre sus formatos. La model card no declara licencia, idiomas soportados ni pipeline, y no se han publicado resultados de benchmarks en la informacion disponible. El sistema esta pensado como servicio local (FastAPI + Streamlit) que nunca descarga modelos en tiempo de ejecucion: exige que todos los artefactos esten presentes en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multi-componente: DistilBERT (clasificador ingles), HingBERT (clasificador hindi/hinglish), FastText `lid.176.ftz` (router de idioma), BART-large-MNLI (clasificador zero-shot de contenido), export causal-LM Qwen con politica GRPO (decision) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles; hindi (devanagari); hinglish; texto mixto; texto incierto (segun logica de enrutado descrita) |
| Licencia | no disponible |
| Formato de pesos | safetensors; checkpoints PyTorch (`.pt`) para los clasificadores; `.ftz` para FastText |

## Arquitectura y entrenamiento

El sistema se organiza en una cadena de inferencia. Primero, `4_prodgate.py` detecta el idioma del texto de entrada combinando tres senales: la confianza del modelo FastText `lid.176.ftz` cargado localmente una sola vez, la deteccion de escritura Unicode y evidencia de roman-hindi a nivel de token y caracter. Segun el resultado, el texto se enruta al checkpoint DistilBERT afinado para ingles (`contextguard_weights/english_bert/english_bert.pt`) o al checkpoint HingBERT afinado (`hingbert_weights/hingbert_best.pt`). En paralelo, `content_classifier.py` carga de forma perezosa `facebook/bart-large-mnli` mediante el pipeline zero-shot de Transformers (CUDA si esta disponible, CPU en caso contrario) y clasifica el contenido en `political`, `news`, `humor_meme`, `rant` o `casual`, con umbral de confianza configurable via `CONTEXTGUARD_CONTENT_CONFIDENCE_THRESHOLD`.

La decision final la toma un modelo entrenado con GRPO (TRL) cargado desde `/home/contextguard_v2_grpo_final`, export byte-identico a `contextguard_v2_grpo/checkpoint-500`. La funcion de recompensa actual es `(correctness_base + format_bonus) * content_weight`, con un bonus de formato de hasta `+0.5` y peso `1.0` para fallos de clasificacion, incertidumbre o metadatos ausentes. El modelo emite una accion ordinal (`BENIGN=0`, `WARN=0.5`, `ESCALATE=1`) que se expone en el campo `fused_score` por compatibilidad de API, aunque no es una probabilidad calibrada. La model card advierte explicitamente de que el checkpoint desplegado se entreno con las funciones de recompensa separadas anteriores (`correctness_reward_func` y `format_reward_func`) y con un CSV que solo contiene `Input_Sequence` y `Target_Score`, por lo que no pudo aprender a usar los campos de plataforma ni las probabilidades del clasificador; se requiere reentrenamiento para certificar la configuracion actual.

## Capacidades

- Deteccion de idioma con enrutado entre ingles, hindi (devanagari), hinglish, texto mixto y texto incierto, combinando FastText, escritura Unicode y evidencia roman-hindi.
- Clasificacion de toxicidad en tres vias (softmax) mediante clasificadores DistilBERT y HingBERT afinados.
- Clasificacion zero-shot de tipo de contenido en cinco categorias (`political`, `news`, `humor_meme`, `rant`, `casual`) con score y peso inicial configurable.
- Emision de resultado `uncertain` cuando la confianza del clasificador de contenido cae por debajo del umbral configurado.
- Decision de moderacion con tres niveles de severidad (`BENIGN`, `WARN`, `ESCALATE`) mediante politica GRPO.
- Politica de fallo configurable: por defecto devuelve 503 seguro ante fallo de carga o generacion (`service_unavailable`); modo `classifier` permite decisiones de emergencia solo con clasificador, marcadas con `decision_source: classifier_fallback`.
- API HTTP con FastAPI y interfaz de chat con Streamlit.
- No soporta tool calling, agentes, vision, audio ni modo thinking segun la informacion disponible.

## Casos de uso

- Moderacion de comentarios en plataformas con audiencia india: el router detecta si el texto esta en ingles, devanagari o hinglish y lo envia al clasificador adecuado, evitando que un modelo monolingue procese texto roman-hindi como si fuera ruido.
- Moderacion de comunidades mixtas ingles-hindi: la combinacion de FastText con deteccion Unicode y evidencia roman-hindi permite clasificar mensajes que alternan escrituras dentro del mismo texto, un escenario frecuente en redes sociales del subcontinente.
- Filtrado de contenido politico o de rant en foros: el clasificador zero-shot BART-large-MNLI etiqueta el tipo de contenido y el peso asociado modula la recompensa de la politica GRPO, de modo que un error de escalado en contenido politico penaliza mas que en contenido casual.
- Pasarela de moderacion como microservicio: el despliegue con `uvicorn 4_prodgate:app` permite integrar la API en un pipeline existente que envie texto y reciba accion, `fused_score`, `confidence`, `model_used` y `decision_source`.
- Entornos con requisitos de privacidad o air-gapped: el servicio nunca descarga modelos y falla con error explicito si falta un artefacto, lo que facilita auditoria y despliegue en infraestructura controlada.
- Evaluacion y depuracion de enrutado: la suite de tests con un predictor FastText falso cubre entradas en ingles, hindi, hinglish, mixtas, vacias y ambiguas, util para validar la logica de enrutado antes de conectar los checkpoints reales.
- Moderacion de chats en vivo con Streamlit: la interfaz `chatui.py` permite probar el comportamiento del sistema sobre conversaciones antes de exponerlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 40,6 GB, pero la model card no desglosa el tamano de cada checkpoint ni sus requisitos de memoria.
- GPU recomendadas: no disponible. La model card solo indica que el clasificador zero-shot usa CUDA cuando esta disponible y CPU en caso contrario.
- Compatibilidad con GPU de consumo: no disponible; depende del tamano real del export Qwen y de los checkpoints BERT, no documentado.
- Opciones de despliegue: FastAPI con `uvicorn` (`uvicorn 4_prodgate:app --host 127.0.0.1 --port 8000`) y Streamlit (`streamlit run chatui.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos de artefactos locales: `rl_web/models/lid.176.ftz` (o variable `CONTEXTGUARD_FASTTEXT_MODEL`), `contextguard_weights/english_bert/english_bert.pt`, `hingbert_weights/hingbert_best.pt` y el export `/home/contextguard_v2_grpo_final`. Un artefacto ausente provoca error explicito.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (sistemas de moderacion multilingue con enrutado por idioma) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no declara licencia; no hay garantia de uso comercial sin consultar al autor.
- El checkpoint desplegado (`checkpoint-500`) se entreno con una configuracion de recompensa anterior y un dataset sin columnas de plataforma ni probabilidades del clasificador; la model card reconoce que no pudo aprender a usar esas senales en inferencia. Se requiere reentrenamiento para certificar el comportamiento actual.
- `fused_score` no es una probabilidad calibrada: representa la severidad ordinal de la accion GRPO (`0`, `0.5`, `1`).
- El parametro `platform` se acepta en la API pero no influye actualmente en la clasificacion.
- El sistema exige todos los artefactos en local y no descarga modelos; un despliegue incompleto devuelve error o 503, no un fallback silencioso.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Cobertura limitada a ingles, hindi, hinglish y texto mixto segun la logica descrita; no se documentan otros idiomas.
- La deteccion de hinglish combina varias senales, pero la model card no reporta metricas de precision o recall del router.
- No hay benchmarks publicados que permitan estimar falsos positivos o falsos negativos en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shashank12-3/rl_web
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
