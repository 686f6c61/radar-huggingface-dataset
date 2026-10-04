# ardana-ai/decider-2b-ONNX

## Resumen

`ardana-ai/decider-2b-ONNX` es una variante cuantizada en formato ONNX del modelo `Mapika/decider-2b`, publicada por el usuario `ardana-ai`. Se trata de una conversion int4 pensada especificamente para ejecucion en el navegador mediante `onnxruntime-web` sobre el execution provider WebGPU, no de un modelo entrenado desde cero. El autor lo describe como la variante "para el navegador" del modelo de libreria de Ardana, `decider-2b`.

El artefacto se genero a partir de la revision `533964dae8be954c5b5e19fa4948e48408094c1e` del modelo base mediante el comando `cargo xtask onnx convert decider-2b` del repositorio de Ardana, y los pesos se exportaron con el model builder de `onnxruntime-genai` 0.17.1. El repositorio ocupa 1,1 GB e incluye el grafo (`model.onnx`), los pesos int4 (`model.onnx.data`) y los ficheros auxiliares de tokenizacion y plantilla de chat copiados sin cambios del modelo original.

Su relevancia es acotada y muy especifica: interesa a quien quiera desplegar inferencia de un modelo de la familia de 2.000 millones de parametros directamente en el navegador, sin servidor, aprovechando la aceleracion por GPU de WebGPU. La licencia es Apache 2.0, heredada del modelo base. No hay datos publicados sobre idiomas, contexto o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la describe; se distribuye como grafo ONNX exportado con onnxruntime-genai) |
| Parametros totales | no disponible (el nombre `decider-2b` sugiere del orden de 2.000 millones, sin confirmacion del autor) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos int4; entradas y salidas en fp16; se emiten unicamente los logits de la ultima posicion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` y `model.onnx.data`) |

## Arquitectura y entrenamiento

El autor no aporta informacion sobre la arquitectura del modelo original ni sobre su proceso de entrenamiento. Lo unico documentado es el procedimiento de conversion: los pesos se exportaron con el model builder de `onnxruntime-genai` 0.17.1 para el execution provider WebGPU, con entradas y salidas en fp16, sin cabeza de prediccion multi-token y con el embedding compartido con la LM head. Los ficheros `chat_template.jinja`, `decider_config.json`, `tokenizer.json` y `tokenizer_config.json` se copian sin modificaciones desde `Mapika/decider-2b`.

Al no publicarse la model card del modelo base en la informacion disponible, no se puede detallar el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La unica innovacion tecnica documentada es de despliegue, no de entrenamiento: la cuantizacion a int4 y la restriccion de logits a la ultima posicion reducen el coste de memoria y computo lo suficiente para ejecutar el modelo en el navegador.

## Capacidades

- Generacion de texto conversacional, segun la plantilla de chat incluida (`chat_template.jinja`).
- Ejecucion en navegador mediante `onnxruntime-web` con el execution provider WebGPU.
- Distribucion autocontenida: grafo, pesos y tokenizador en un unico repositorio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible. Se confirma explicitamente la ausencia de cabeza de prediccion multi-token.

## Casos de uso

- Inferencia local en el navegador: el modelo se carga con `onnxruntime-web` sobre WebGPU y genera texto sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones web con requisitos de privacidad estrictos.
- Demos interactivas sin backend: al empaquetar grafo y pesos en 1,1 GB, permite publicar una demo de chat que funciona integramente en el cliente y elimina el coste de infraestructura de GPU.
- Prototipado rapido de interfaces conversacionales: el `chat_template.jinja` incluido facilita montar un chat con el mismo formato de prompt que el modelo base, sin reescribir la capa de plantillas.
- Aplicaciones de escritorio o extensiones con inferencia embebida: cualquier entorno que soporte ONNX Runtime puede consumir el grafo, no solo el navegador.
- Evaluacion comparativa de cuantizacion int4 frente al modelo original: al derivar de una revision concreta del modelo base, sirve para medir la perdida de calidad introducida por la cuantizacion.
- Distribucion offline: el repositorio de 1,1 GB se puede cachear en el cliente y usar sin conexion, util en entornos con red restringida.
- Integracion en pipelines de investigacion sobre inferencia en el borde: sirve como banco de pruebas de latencia y consumo de memoria de un modelo de ~2B en int4 sobre WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna metrica de evaluacion (MMLU, HumanEval, GSM8K ni similares), y los resultados de busqueda web obtenidos no guardan relacion con el modelo.

## Requisitos de hardware

- Pesos: el repositorio completo ocupa 1,1 GB, incluyendo el grafo ONNX y los pesos int4. Es la unica cifra de tamano confirmada.
- VRAM estimada: no disponible de forma oficial. Como referencia, un modelo de ~2B parametros en int4 ocupa en torno a 1-1,5 GB solo en pesos; hay que anadir el overhead del runtime y la cache KV, que depende de la longitud de contexto (no publicada).
- GPU recomendadas: no disponible. El execution provider objetivo es WebGPU, por lo que depende del soporte WebGPU del navegador y del driver de la GPU del usuario.
- Compatibilidad con GPU de consumo: no confirmada por el autor. Por tamano, el modelo deberia caber en GPU de consumo con varios GB de VRAM, pero no hay validacion publicada.
- Opciones de despliegue: `onnxruntime-web` (navegador) y `onnxruntime-genai` 0.17.1. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion. El unico punto de referencia documentado es el propio modelo base:

| Modelo | Relacion | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ardana-ai/decider-2b-ONNX | variante cuantizada | no disponible | no disponible | apache-2.0 | ONNX int4 |
| Mapika/decider-2b | modelo base | no disponible | no disponible | apache-2.0 (heredada) | no disponible |

## Limitaciones y advertencias

- No hay datos publicados sobre sesgos del modelo, idiomas soportados ni comportamiento en dominios especificos.
- Riesgo de alucinacion: no cuantificado; al no existir benchmarks ni evaluaciones, no se puede estimar.
- La cuantizacion a int4 puede degradar la calidad de generacion respecto al modelo base; no se ha publicado ninguna medicion de esa perdida.
- El modelo emite logits unicamente de la ultima posicion y carece de cabeza de prediccion multi-token, lo que limita tecnicas de decodificacion especulativa o de scoring sobre secuencias completas.
- El artefacto esta orientado a WebGPU: en entornos sin soporte WebGPU el rendimiento puede caer drasticamente o no funcionar.
- La longitud de contexto no esta documentada, por lo que no se puede garantizar el comportamiento en conversaciones largas.
- Licencia Apache 2.0, que permite uso comercial, pero el autor hereda la licencia del modelo base y no anade garantias propias.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- No se documenta si el modelo ha pasado por procesos de alineacion (RLHF/DPO), por lo que no se puede asumir un comportamiento seguro por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ardana-ai/decider-2b-ONNX
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Revision concreta del modelo base usada en la conversion: https://huggingface.co/Mapika/decider-2b/tree/533964dae8be954c5b5e19fa4948e48408094c1e
- Los resultados de busqueda web disponibles no contienen enlaces relevantes para este modelo (papers, blogs, repos o demos).
