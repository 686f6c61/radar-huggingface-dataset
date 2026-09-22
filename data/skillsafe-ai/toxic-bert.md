# skillsafe-ai/toxic-bert

## Resumen

toxic-bert de skillsafe-ai es un artefacto ONNX listo para navegador derivado de Xenova/toxic-bert, que a su vez es la exportacion ONNX del clasificador de toxicidad toxic-bert de Unitary (proyecto Detoxify). Se publica dentro del catalogo de SkillSafe como un modelo de `text-classification` con seis etiquetas de salida y licencia Apache-2.0. No es un entrenamiento nuevo: es una importacion reproducible del modelo upstream, fijada por SHA-256 y verificada con `onnx.checker` y una ejecucion de humo en onnxruntime sobre CPU.

El problema que resuelve es la moderacion automatica de texto en el propio navegador, sin enviar contenido a un servidor. Al distribuirse en formato ONNX con soporte de `onnxruntime-web` y WebGPU/WASM, permite ejecutar el clasificador en el cliente: el modelo completo ocupa 417,91 MB y la variante cuantizada 105,59 MB, con latencias de 4,4 ms y 3,1 ms respectivamente en la prueba de humo declarada (lote de 1, secuencia de 8 tokens, CPU).

Es relevante ahora porque el pipeline de `transformers.js` permite integrar filtrado de toxicidad en aplicaciones web con una unica llamada a `InferenceSession.create`, y porque la model card documenta de forma exhaustiva la procedencia (commit upstream, hash de la receta, versiones de toolchain) y los hashes por fichero, algo poco habitual en exports derivados. El modelo subyacente es un encoder tipo BERT con salida de 6 logits por secuencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional) para clasificacion de secuencias, exportado a ONNX opset 11 |
| Parametros totales | no disponible en la model card (el original de Detoxify emplea BERT-base, en torno a 110 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada explicitamente; las pruebas de verificacion usan secuencias de 8 tokens con ejes dinamicos. La arquitectura BERT subyacente admite ventanas de hasta 512 tokens |
| Tipos de cuantizacion | FP32 (`onnx/model.onnx`, 417,91 MB) y cuantizada (`onnx/model_quantized.onnx`, 105,59 MB); el esquema exacto de cuantizacion no se especifica |
| Idiomas soportados | no disponible; el modelo upstream de Detoxify esta orientado principalmente a ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_quantized.onnx`), mas `tokenizer.json`, `vocab.txt`, `config.json` y `special_tokens_map.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT con cabeza de clasificacion de secuencia, que produce un tensor `logits` de forma `[batch_size, 6]` (una puntuacion por etiqueta). El grafo exportado tiene tres entradas `int64` de rango dinamico —`input_ids`, `attention_mask` y `token_type_ids`— y esta fijado en opset 11 de ONNX, lo que garantiza compatibilidad con `onnxruntime-web` en navegadores con WebGPU o WASM.

No se ha entrenado ningun parametro en esta publicacion: la model card indica explicitamente "Imported as published upstream (no conversion)", es decir, los pesos son identicos a los de Xenova/toxic-bert en el commit `65cbc2607cb7fad64f98d1e8a5a3d1f8577895fd`, que a su vez deriva de toxic-bert de Unitary (Detoxify). Por tanto, no hay informacion sobre volumen de tokens, composicion del dataset, RLHF o DPO en la informacion proporcionada; esos detalles corresponden al entrenamiento original de Detoxify y no se reproducen en esta ficha. La innovacion tecnica destacable de esta publicacion es de ingenieria y trazabilidad: receta reproducible (`recipes/toxic-bert.yaml`, sha256 `733756f7d1c1e0a88e272dc1d43d245a48f80f489b1768e8c27672a10ca6198d`), toolchain fijada (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0) y verificacion por hash de cada fichero.

## Capacidades

- Clasificacion de texto en seis etiquetas de toxicidad; la model card especifica "6 labels" y una salida `logits` de dimension 6, aunque no enumera los nombres de las clases (el modelo original de Detoxify usa el conjunto toxicidad, toxicidad severa, obsceno, amenaza, insulto y ataque a la identidad).
- Ejecucion en navegador mediante `onnxruntime-web`, con `executionProviders: ["webgpu", "wasm"]`.
- Inferencia en CPU sin GPU, con latencias declaradas de 4,4 ms (FP32, lote 1, secuencia 8) y 3,1 ms (cuantizado).
- Entradas de longitud variable en lote, al declarar los ejes `batch_size` y `sequence_length` como dinamicos.
- Integracion con el ecosistema `transformers.js` como modelo de `text-classification`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico: es exclusivamente un clasificador de secuencia.
- No se declaran capacidades multilingues; el idioma no figura en la informacion disponible.

## Casos de uso

- Moderacion de comentarios en el cliente: antes de enviar un comentario a la API, el frontend puede ejecutar `model_quantized.onnx` (105,59 MB) en WebGPU o WASM, clasificar el texto y bloquear o marcar el contenido sin que el texto abandone el dispositivo, lo que reduce costes de servidor y exposicion de datos personales.
- Filtrado de mensajes en herramientas de chat en tiempo real: con latencias declaradas del orden de milisegundos para secuencias cortas, el clasificador puede evaluar cada mensaje entrante por turno dentro de un flujo conversacional sin introducir retraso perceptible.
- Prefiltrado en pipelines de anotacion: usar el modelo como primer paso de triaje para separar grandes volumenes de comentarios en "revisar" y "descartar", y reservar la revision humana para los casos ambiguos.
- Moderacion de resenas de producto o marketplace: integracion en el backend mediante onnxruntime para puntuar resenas antes de publicarlas, aplicando umbrales por etiqueta segun la politica del sitio.
- Investigacion en deteccion de discurso toxico: al ser un export verificado byte a byte con hashes declarados, sirve como linea base reproducible frente a la que comparar variantes cuantizadas o modelos alternativos, con la ventaja de que el ONNX se puede ejecutar en un portatil sin GPU.
- Extension de navegador o PWA de bienestar digital: empaquetar el modelo como recurso local de la extension para resaltar o difuminar contenido toxico en foros y redes, con funcionamiento offline una vez descargados los pesos.
- Demostraciones y tests de integracion: la verificacion de humo con entradas de ceros y formas declaradas permite montar un test automatico que compruebe que el grafo carga y devuelve `logits` de forma `[1, 6]` en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta cifras de verificacion funcional (no de calidad del clasificador):

| Fichero | Entradas | Salidas | Tiempo (ms) |
|---|---|---|---|
| `onnx/model.onnx` | input_ids[1, 8], attention_mask[1, 8], token_type_ids[1, 8] | logits[1, 6] | 4,4 |
| `onnx/model_quantized.onnx` | input_ids[1, 8], attention_mask[1, 8], token_type_ids[1, 8] | logits[1, 6] | 3,1 |

Ambas pruebas se ejecutan sobre CPU con onnxruntime y entradas rellenas de ceros; no miden exactitud ni throughput en produccion.

## Requisitos de hardware

- VRAM/RAM para inferencia: la variante cuantizada ocupa 105,59 MB en disco y la FP32 417,91 MB; en memoria hay que sumar el grafo, el tokenizador y los tensores de activacion, por lo que un presupuesto practico es del orden de cientos de MB en la variante cuantizada y alrededor de 0,5-1 GB para la FP32.
- Cabe en cualquier GPU de consumo e incluso en CPU exclusiva; no requiere acelerador dedicado.
- GPU recomendadas: no aplica en sentido estricto; el modelo esta pensado para WebGPU en el navegador o para CPU con onnxruntime. Cualquier GPU integrada o discreta reciente sirve como acelerador opcional.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) en el navegador, `transformers.js`, y onnxruntime nativo (Python, C++, C#) en servidor; tambien es compatible con backends que acepten ONNX.
- Latencia declarada: 4,4 ms con el modelo FP32 y 3,1 ms con el cuantizado, en lote de 1 y secuencia de 8 tokens sobre CPU. No se aportan datos de throughput ni de latencia para secuencias largas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Etiquetas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skillsafe-ai/toxic-bert | BERT + cabeza de clasificacion | 6 | ONNX (FP32 y cuantizado) | Apache-2.0 | HuggingFace; pesos identicos al upstream |
| Xenova/toxic-bert | BERT + cabeza de clasificacion | 6 | ONNX | Apache-2.0 | HuggingFace; es el origen directo de este export |
| unitary/toxic-bert (Detoxify) | BERT + cabeza de clasificacion | 6 | PyTorch | Apache-2.0 | HuggingFace y GitHub de Detoxify; es el origen del entrenamiento |
| Alternativas de moderacion basadas en RoBERTa (por ejemplo variantes de hate speech de CardiffNLP) | RoBERTa + cabeza de clasificacion | variable | PyTorch / ONNX segun variante | variable | HuggingFace; datos de rendimiento no disponibles en esta busqueda |

La comparativa se limita a parametros de formato, licencia y origen: no hay resultados de benchmarks publicados en la informacion disponible que permitan comparar exactitud entre estas alternativas.

## Limitaciones y advertencias

- No hay resultados de evaluacion de calidad (exactitud, F1, tasas de falsos positivos) en la informacion proporcionada; las unicas cifras son pruebas de humo con entradas de ceros.
- La model card no enumera los nombres de las seis etiquetas ni su orden en el tensor `logits`, por lo que el mapeo clase-indice debe verificarse antes de usarlo en produccion.
- El modelo upstream esta orientado al ingles; no se declaran idiomas soportados, de modo que el comportamiento en castellano u otras lenguas es desconocido.
- Los clasificadores de toxicidad de este tipo cometen errores sistematicos con variedades dialectales, jerga, lenguaje recuperado (por ejemplo, citas de discurso de odio con fines academicos) y expresiones identitarias autoafirmativas; sin datos de evaluacion no es posible cuantificar estos sesgos en esta variante.
- Riesgo de alucinacion no aplica del mismo modo que en un modelo generativo, pero si existe riesgo de clasificacion incorrecta con alta confianza en textos cortos o ambiguos.
- Uso comercial permitido bajo Apache-2.0, con la obligacion de conservar el aviso de licencia y la atribucion a Unitary (Detoxify) y a Xenova por la exportacion ONNX, tal como indica la propia model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado sin historial de uso; conviene validar el comportamiento antes de adoptarlo en un sistema en produccion.
- La fecha de creacion declarada (2026-09-22) y las versiones de toolchain (torch 2.10.0, onnxruntime 1.30.0) deben comprobarse contra el manifiesto del repositorio si se va a auditar la procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/toxic-bert
- Modelo base en HuggingFace: https://huggingface.co/Xenova/toxic-bert
- Commit upstream fijado: https://huggingface.co/Xenova/toxic-bert/tree/65cbc2607cb7fad64f98d1e8a5a3d1f8577895fd
- Repositorio de recetas y convertidor de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Proyecto Detoxify (Unitary): https://github.com/unitaryai/detoxify
- Licencia de Detoxify: https://github.com/unitaryai/detoxify/blob/master/LICENSE
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- transformers.js: https://github.com/huggingface/transformers.js
