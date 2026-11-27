# marmossburg/gpt2-124m-smoltalk

## Resumen

GPT-2 124M — Smol-SmolTalk es un ajuste fino supervisado del modelo `marmossburg/gpt2-124m-reproduction`, una reproduccion desde cero de la arquitectura GPT-2 de 124 millones de parametros preentrenada sobre FineWeb-Edu. El autor, marmossburg, ha aplicado dos rondas consecutivas de ajuste fino conversacional sobre el dataset Smol-SmolTalk de HuggingFaceTB, actualizando la totalidad de los pesos (no es un adaptador LoRA).

El objetivo es dotar a un GPT-2 pequeño de capacidades basicas de dialogo de un solo turno mediante una plantilla de chat incluida en el tokenizador. El modelo resuelve el problema de partir de un checkpoint base sin alineacion conversacional y acercarlo a un formato de instrucciones sencillo, con un coste computacional muy bajo (entrenado en una unica RTX 5090).

Es relevante como pieza experimental y educativa: demuestra el flujo completo de reproduccion y ajuste fino de un transformer decoder-only clasico con recursos de consumo. No obstante, el propio autor advierte que las respuestas pueden ser irrelevantes, repetitivas y fallar en el seguimiento del contexto. La longitud de contexto de entrenamiento es de 1.024 tokens y el modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.475.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 estandar: un transformer decoder-only con atencion causal multi-cabeza, normalizacion previa a cada bloque y embeddings posicionales aprendidos. El checkpoint base fue preentrenado desde cero sobre FineWeb-Edu, segun indica el autor, y este modelo es un ajuste fino de pesos completos sobre dicho checkpoint, no un adaptador.

El ajuste fino consistio en dos rondas consecutivas de entrenamiento supervisado (SFT), cada una con 12.000 conversaciones distintas de un solo turno procedentes de `HuggingFaceTB/smol-smoltalk`. La segunda ronda reanudo desde el checkpoint 1.500, incluyendo el estado del optimizador, y termino en la actualizacion 3.000. La configuracion fue: una RTX 5090, precision BF16, tamano de lote 8, longitud de contexto 1.024, AdamW fusionado, tasa de aprendizaje constante de 2e-5, weight decay 0.01, recorte de gradiente 1.0 y semilla 42. La funcion de perdida cubre las respuestas del asistente y su token de fin. El stack probado es Transformers 4.57.3 y PyTorch 2.9.1. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Dialogo de un solo turno mediante la plantilla de chat incluida en el tokenizador (`apply_chat_template`).
- Respuesta a preguntas tecnicas sencillas (el ejemplo de la model card es "What is a Python dictionary?").
- Seguimiento de instrucciones basicas adquirido por SFT sobre Smol-SmolTalk.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito.
- Multilingue: no; solo ingles declarado.
- Capacidad conversacional multi-turno limitada: el autor recomienda anadir la respuesta real del asistente al historial y recortar intercambios completos, pero advierte de fallos de seguimiento de contexto.

## Casos de uso

- Prototipado docente de pipelines de ajuste fino: sirve para ilustrar el ciclo completo de SFT sobre un GPT-2 pequeño con un unico GPU de consumo, incluyendo reanudacion desde checkpoint con estado del optimizador.
- Pruebas de integracion con Transformers y text-generation-inference: al estar etiquetado como `endpoints_compatible`, permite validar plantillas de chat y flujos de despliegue en entornos de laboratorio sin coste elevado.
- Generacion de respuestas cortas en ingles para tareas de formato fijo: con prompts bien acotados y `max_new_tokens` bajo, puede producir respuestas de una o dos frases en demos internas.
- Evaluacion comparativa de tecnicas de SFT: su tabla de perdida y precision por token del asistente (base, 1.500 y 3.000 actualizaciones) permite reproducir curvas de aprendizaje y comparar hiperparametros.
- Generacion de texto de relleno o sintetico para pruebas de carga de infraestructura: su bajo coste de inferencia permite generar volumen en pipelines de test sin depender de APIs externas.
- Base para experimentos de alineacion posteriores: al ser un checkpoint pequeno y con pesos completos, es adecuado como punto de partida para probar DPO, RLHF ligero o destilacion en entornos academicos.
- No se recomienda para atencion al cliente en produccion, generacion de codigo fiable ni tareas que requieran contexto largo, dado el aviso explicito del autor sobre respuestas irrelevantes y repetitivas.

## Benchmarks y rendimiento

El autor publica metricas de entrenamiento sobre 50 conversaciones reservadas, no benchmarks estandar:

| Checkpoint | Perdida en held-out | Precision en tokens del asistente |
|---|---:|---:|
| Base | 2,497597 | 51,79% |
| 1.500 actualizaciones | 1,429402 | 65,59% |
| 3.000 actualizaciones | 1,337016 | 66,94% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 0,25 GB de pesos mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- En cuantizacion de 8 bits o 4 bits el modelo ocuparia del orden de 125 MB o 65 MB de pesos, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se realizo en una RTX 5090, pero la inferencia funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 o incluso CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales e integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers (stack probado: 4.57.3 con PyTorch 2.9.1), text-generation-inference (etiqueta `text-generation-inference`), y previsiblemente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta conversion oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (124 M de parametros) se espera una latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---:|---:|---|---|---|
| marmossburg/gpt2-124m-smoltalk | 124 M | 1.024 | no disponible | en | SFT conversacional experimental |
| GPT-2 original (OpenAI) | 124 M | 1.024 | MIT (segun publicacion original) | en | Sin ajuste conversacional |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 (segun su model card) | Apache 2.0 (segun su model card) | en y otros | Entrenado con datos mas recientes y mayor contexto |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | en | Mayor capacidad, mayor coste |

La comparativa se limita a datos publicos de cada model card; no se dispone de evaluaciones cruzadas en la informacion proporcionada. Frente a GPT-2 original, este modelo anade formato conversacional; frente a SmolLM-135M y TinyLlama, carece de contexto mas largo y de licencia declarada.

## Limitaciones y advertencias

- El autor advierte explicitamente de que las respuestas generadas pueden ser irrelevantes, repetitivas y no seguir el contexto. Es un modelo experimental.
- Longitud de contexto de solo 1.024 tokens: prompt y generacion deben caber en ese limite; para chat continuo hay que recortar intercambios completos.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- No se declara licencia, lo que impide confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier uso en produccion.
- Riesgo elevado de alucinacion y de deriva tematica por el tamano del modelo (124 M) y el volumen limitado de datos de SFT (24.000 conversaciones en total).
- Sesgos no evaluados: no se documenta ninguna evaluacion de sesgos, toxicidad ni robustez.
- No apto para tool calling, agentes ni razonamiento multi-paso.
- El tokenizador incluye una plantilla de chat, pero el modelo no ha sido evaluado con prompts fuera de distribucion; el rendimiento puede degradarse con system prompts largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marmossburg/gpt2-124m-smoltalk
- Modelo base: https://huggingface.co/marmossburg/gpt2-124m-reproduction
- Dataset de ajuste fino: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Paper de GPT-2 (arquitectura de referencia): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- FineWeb-Edu (dataset de preentrenamiento del modelo base, segun el autor): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Documentacion de Transformers sobre plantillas de chat: https://huggingface.co/docs/transformers/chat_templating
- No se han encontrado papers, blogs, repos ni demos adicionales en la informacion proporcionada.
