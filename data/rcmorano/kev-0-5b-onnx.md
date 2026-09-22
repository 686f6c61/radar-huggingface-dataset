# rcmorano/kev-0.5b-onnx

## Resumen

kev-0.5b-onnx es la exportacion a ONNX del modelo de decision `jaredpalmer/kev-0.5b`, un adaptador LoRA sobre el backbone Qwen2.5-0.5B con una cabeza de lectura tipo pointer. El autor de esta version, rcmorano, publica un unico grafo fp16 de aproximadamente 0,99 GB que se ejecuta integramente en el navegador mediante `onnxruntime-web`, con aceleracion WebGPU o, como respaldo portable, WASM. El repositorio incluye ademas los pesos de la cabeza pointer (`head.json`), metadatos de tokens especiales (`meta.json`) y el tokenizador de Qwen2.5 listo para `transformers.js`.

La particularidad del modelo es que no genera texto: es un modelo prefill-only que, en una sola pasada hacia delante, puntua opciones de respuesta para multiples preguntas empaquetadas contra un mismo prefijo de estado compartido (la primitiva que el autor denomina "system one"). El grafo devuelve unicamente `last_hidden_state` y la decision se calcula en JavaScript aplicando la cabeza pointer al token `decide` y a los tokens `optend` de cada rama de opcion, seguida de un softmax.

Es relevante ahora porque demuestra un patron de despliegue poco habitual: inferencia de un transformer de ~0,5B de parametros dentro de una extension de Chrome MV3, sin servidor, con una perdida de fidelidad declarada de ~5e-4 de error absoluto maximo en probabilidad respecto al checkpoint de PyTorch. La licencia Apache-2.0, heredada del modelo base y del checkpoint padre, facilita su reutilizacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-0.5B) sin `lm_head` + adaptador LoRA fusionado + cabeza pointer de lectura |
| Parametros totales | ~0,49B en el backbone; la cabeza pointer anade proyecciones 896→256 (`qw`, `qb`, `kw`, `kb`). Total exacto: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; `meta.json` define limites de longitud, pero no se publican cifras. El backbone Qwen2.5-0.5B soporta hasta 32.768 tokens |
| Tipos de cuantizacion | fp16 (grafo publicado); el autor menciona un grafo fp32 (~2 GB) que provoca OOM en un renderer de Chrome |
| Idiomas soportados | ingles (`en`); no se documentan otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`) + JSON (`head.json`); tokenizador en `tokenizer*`, `vocab.json`, `merges.txt` |
| Tamano del repositorio | 1,0 GB |
| Entradas del grafo | `input_ids` int64 [B, L], `position_ids` int64 [B, L], `attention_mask` fp16 [B, 1, L, L] |
| Salidas del grafo | `last_hidden_state` fp16 [B, L, 896] |
| Tarea declarada | `text-classification` (multiple-choice, decision-model, feature-extraction) |
| Libreria | onnx |
| Modelo base | Qwen/Qwen2.5-0.5B (relacion: adapter) |

## Arquitectura y entrenamiento

El modelo parte del backbone de Qwen2.5-0.5B, un transformer decoder denso, sobre el que se aplica un adaptador LoRA y una cabeza pointer. Para la exportacion, el adaptador LoRA se fusiona en el tronco y se elimina la `lm_head`: el grafo ONNX resultante solo produce estados ocultos. La cabeza pointer (`qw`, `qb`, `kw`, `kb`, con proyeccion 896→256, mas los parametros `scale`, `d` y `dp`) se aplica fuera del grafo, en JavaScript, calculando `logits[option] = (k(h_opt) · q(h_decide)) * scale` y un softmax posterior. La exportacion se realizo con `torch.onnx.export`, opset 17 y `dynamo=False`.

La innovacion tecnica principal esta en la mascara de atencion: no es una mascara 2D de padding, sino una mascara aditiva block-causal personalizada de forma [B, 1, L, L]. Un token de un segmento k (una rama de pregunta) atiende al prefijo de estado compartido (segmento 0) y unicamente a su propio segmento, mientras que el prefijo de estado atiende causalmente a si mismo. Los valores permitidos son `0x0000` y los enmascarados `0xFBFF` (−65504, el minimo finito de fp16). Esto permite empaquetar varias preguntas contra un mismo estado compartido y resolverlas todas en una sola pasada hacia delante. El cliente construye la mascara a partir del registro empaquetado (funcion `branchMask` en `browser/engine.js`).

Sobre los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no hay informacion en el material disponible: la model card remite al `MODEL_CARD.md` del modelo padre `jaredpalmer/kev-0.5b`, cuyo contenido no se ha proporcionado. El autor describe explicitamente este artefacto como un prototipo de modelo de decision, no como un asistente conversacional.

## Capacidades

- Clasificacion y eleccion multiple: puntua opciones candidatas para una o varias preguntas y devuelve probabilidades por opcion mediante softmax sobre los logits del pointer head.
- Decision en una sola pasada (prefill-only): no decodifica texto, no hay generacion autoregresiva ni `lm_head` en el grafo.
- Empaquetado multi-pregunta: varias ramas de pregunta pueden resolverse contra un prefijo de estado compartido en un unico forward pass.
- Extraccion de caracteristicas: el grafo expone `last_hidden_state` de dimension 896, reutilizable como embedding para tareas posteriores.
- Ejecucion en navegador: compatible con `onnxruntime-web` sobre WebGPU y WASM CPU, y con `transformers.js` para el tokenizador.
- Integracion como extension de navegador: el autor lo construyo para una extension de Chrome MV3 que carga los ficheros desde un directorio local `model/`.
- Multilingue: no; el modelo esta etiquetado unicamente como ingles.
- Tool calling, agentes, vision, audio, modo thinking: no disponible / no soportado segun la documentacion publicada.
- Fidelidad numerica declarada: error absoluto maximo de probabilidad ~5e-4 respecto al checkpoint de PyTorch, con decisiones identicas; las probabilidades redondeadas a dos decimales pueden diferir en ±0,01.

## Casos de uso

- Extension de navegador con modelo embebido: la propia motivacion del autor. La extension MV3 apunta al repositorio remoto en lugar de empaquetar ~1 GB en el ZIP, descargando el grafo fp16 y ejecutandolo con WebGPU cuando hay GPU disponible.
- Clasificacion de intenciones en cliente: dado un texto de entrada y un conjunto cerrado de etiquetas, el modelo puntua cada opcion y devuelve una distribucion de probabilidad, sin enviar datos a un servidor.
- Enrutado de consultas en pipelines de agentes: elegir entre herramientas o flujos disponibles planteando la seleccion como una pregunta de eleccion multiple resuelta en una sola pasada de prefill.
- Encuestas y formularios interactivos: responder cuestionarios de opcion multiple con contexto de estado compartido, aprovechando el empaquetado de varias preguntas en un mismo forward pass.
- Triaje de tickets o comentarios: asignar categoria o prioridad dentro de un conjunto predefinido de opciones, con el coste de inferencia de un modelo de ~0,5B ejecutandose localmente.
- Pre-filtrado y moderacion en el cliente: descartar o marcar contenido antes de enviarlo a un modelo mayor alojado en servidor, reduciendo coste y latencia de red.
- Extraccion de caracteristicas para busqueda semantica local: usar `last_hidden_state` (896 dimensiones) como embedding en aplicaciones web sin backend.
- Demostraciones educativas de inferencia ONNX en navegador: ejemplo funcional de exportacion fp16, mascara custom y lectura con pointer head para quien quiera replicar el patron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos publicados son de fidelidad de la exportacion y de rendimiento de ejecucion:

| Metrica | Valor |
|---|---|
| Error absoluto maximo de probabilidad (fp16 ONNX vs PyTorch) | ~5e-4 |
| Coincidencia de decisiones vs checkpoint | identicas (verificado en Chrome real, backend WASM) |
| Diferencia en probabilidades a 2 decimales | ±0,01 |
| WebGPU vs WASM CPU | ~18× mas rapido en hardware GPU real |
| Prefill WASM CPU | ~3 s para 60 tokens |
| OpSet de exportacion | 17 (`torch.onnx.export`, `dynamo=False`) |

## Requisitos de hardware

- Inferencia en navegador, no en servidor: el artefacto esta pensado para `onnxruntime-web` dentro de un cliente (extension de Chrome MV3) o cualquier cliente JS/WASM.
- Memoria de GPU estimada: en torno a 1 GB para el grafo fp16 residente en GPU (estimacion derivada del tamano del fichero de 0,99 GB; el autor no publica una cifra de VRAM). Cualquier GPU consumer con soporte WebGPU deberia poder alojarlo.
- Respaldo WASM CPU: portable y estable, pero con heap limitado; el autor senala que el grafo fp32 (~2 GB) provoca OOM en un renderer de Chrome, lo que motivo la exportacion fp16.
- Latencia: ~3 s de prefill para 60 tokens en WASM CPU; aplicando el factor ~18× declarado para WebGPU, el orden de magnitud en GPU real seria de decimas de segundo para esa misma longitud (valor derivado, no publicado directamente).
- Advertencia de backend: bajo rasterizadores software (SwiftShader, sin GPU), el execution provider WebGPU puede devolver salida a cero tras la primera ejecucion; en ese caso hay que usar WASM.
- Ancho de banda de red: ~1 GB de descarga si se sirve desde el repositorio en lugar de empaquetarlo con la aplicacion.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) y `@huggingface/transformers` para el tokenizador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un grafo prefill-only sin `lm_head`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rcmorano/kev-0.5b-onnx | ~0,49B + cabeza pointer | no disponible | ONNX fp16 | Apache-2.0 | Prefill-only, sin generacion de texto; pensado para navegador |
| jaredpalmer/kev-0.5b (modelo padre) | ~0,49B + cabeza pointer | no disponible | checkpoint PyTorch (según model card) | Apache-2.0 | Requiere PyTorch; el export ONNX busca su fidelidad respecto a este checkpoint |
| Qwen/Qwen2.5-0.5B (backbone) | ~0,49B | 32.768 tokens | safetensors | Apache-2.0 | Modelo generativo completo, con `lm_head`; aqui solo se usa el tronco |
| Otros modelos ONNX de clasificacion en navegador | no disponible | no disponible | ONNX | no disponible | No se han identificado alternativas equivalentes de decision prefill-only en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto, la `lm_head` se ha eliminado y el grafo es estrictamente prefill-only.
- Solo ingles: la etiqueta de idioma es `en`; no hay evidencia de soporte multilingue.
- Sin benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones de calidad de decision; la unica validacion publicada es de fidelidad numerica frente al checkpoint de PyTorch.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por terceros es nula.
- Precaucion de precision fp16: aunque el error maximo absoluto de probabilidad es ~5e-4, las probabilidades redondeadas a dos decimales pueden variar ±0,01 respecto al checkpoint original.
- Dependencia de metadatos externos: la mascara de atencion y el orden de los tokens especiales (`state`, `q`, `opt`, `optend`, `decide`) se construyen en el cliente a partir de `meta.json` y `head.json`; un empaquetado incorrecto del registro produce decisiones invalidas de forma silenciosa.
- Limitaciones de contexto no documentadas: los limites de longitud estan en `meta.json` pero no se publican cifras, lo que dificulta planificar cargas.
- Riesgo de fallo de backend: WebGPU bajo SwiftShader puede devolver salidas a cero tras la primera ejecucion; hay que forzar WASM en esos entornos.
- Riesgo de alucinacion: al no tratarse de un modelo generativo, el riesgo se traslada a calibracion: el softmax sobre las opciones siempre asigna probabilidad, aunque ninguna opcion sea correcta.
- Sesgos: no se documentan analisis de sesgo; al derivar del backbone Qwen2.5-0.5B hereda los sesgos de sus datos de entrenamiento, no detallados en esta model card.
- Licencia: Apache-2.0, permisiva para uso comercial. La model card indica que la licencia se hereda del modelo base y del checkpoint de kev. Conviene verificar el `MODEL_CARD.md` del modelo padre por si anade condiciones de uso.
- Anadir: el autor declara que el modelo es un prototipo y no un asistente de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rcmorano/kev-0.5b-onnx
- Modelo padre (checkpoint con la cabeza pointer): https://huggingface.co/jaredpalmer/kev-0.5b
- Backbone base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Ficheros internos del repositorio: `onnx/model_fp16.onnx`, `head.json`, `meta.json`, `config.json`, `vocab.json`, `merges.txt`, `added_tokens.json`, `special_tokens_map.json`
- Script de exportacion citado por el autor: `browser/export/export_fp16.py` (opset 17, `dynamo=False`)
- Codigo de cliente citado por el autor: `browser/engine.js` (funcion `branchMask`) y `browser/extension/`
- `onnxruntime-web`: no se proporciona URL en la informacion disponible
- `transformers.js` (`@huggingface/transformers`): no se proporciona URL en la informacion disponible
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos tratan sobre registros maritimos de Panama y no guardan relacion con el artefacto.
