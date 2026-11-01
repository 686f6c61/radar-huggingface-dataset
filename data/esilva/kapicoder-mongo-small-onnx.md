# esilva/KapiCoder-Mongo-Small-ONNX

## Resumen

KapiCoder-Mongo-Small-ONNX es la distribucion en formato ONNX del modelo KapiCoder-Mongo-Small (v3, etiqueta `v0.1.0-preview`), un ajuste fino de Qwen2.5-Coder-1.5B orientado a autocompletado fill-in-the-middle (FIM) sobre MongoDB. Lo desarrolla el usuario esilva y esta pensado especificamente para el editor Kapibara Studio, que lo carga mediante `onnxruntime-genai`. El repositorio contiene unicamente artefactos convertidos y cuantizados, no los pesos originales en safetensors.

El modelo resuelve un nicho concreto: sugerir codigo de acceso a MongoDB (consultas, pipelines de agregacion, esquemas) dentro de un editor, con el formato de prompt `editor-context-v1` descrito en la model card del repositorio principal. Al estar exportado a ONNX, puede ejecutarse en CPU con INT8 o en GPU mediante DirectML con FP16, sin necesidad de un stack de inferencia basado en PyTorch.

Su relevancia es limitada y experimental: se marca explicitamente como PREVIEW, no cualificado, sin evaluacion propia en este repositorio (las metricas del modelo principal se midieron sobre los pesos bf16, no sobre estas builds), con cero descargas y cero likes en el momento de la consulta. Es un artefacto de despliegue para una aplicacion concreta, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (`model.type=qwen2` en onnxruntime-genai) |
| Parametros totales | 1.5B (heredados de Qwen2.5-Coder-1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta ficha; la configuracion recomendada de la IDE es contexto de 2048 tokens |
| Tipos de cuantizacion | INT8 (CPU) y FP16 (GPU DirectML); INT4 no se ofrece por perdida de precision |
| Idiomas soportados | en, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), con `genai_config.json` y tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-1.5B, un transformer decoder-only denso de 1.5B parametros desarrollado por el equipo Qwen (Hui et al., arXiv:2409.12186), con licencia Apache-2.0. Sobre esos pesos, esilva realizo un ajuste fino para autocompletado fill-in-the-middle especifico de MongoDB, segun se detalla en el repositorio principal `esilva/KapiCoder-Mongo-Small`. La model card menciona datos sinteticos entre las etiquetas del modelo y remite a `REPLAY_ATTRIBUTION.md` para la atribucion de datos y replay, pero no se proporcionan en esta informacion el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de este repositorio es puramente de despliegue: la conversion a ONNX mediante `onnxruntime-genai` 0.15.2, con dos variantes autocontenidas (`cpu-int8/` y `dml-fp16/`), cada una con manifiestos de verificacion SHA-256 (`kapicoder_manifest.json`) y de exportacion (`export_manifest.json`). Se documenta una advertencia relevante sobre la integracion de EOS en GenAI 0.15.2: la generacion puede terminar sin anadir token, por lo que la IDE corregida consume un token solo cuando `GetSequence(0)` crece tras `GenerateNextToken`, evitando repetir el token previo; comprobar unicamente `IsDone()` puede descartar un token valido. En Python se referencia `get_next_tokens()`.

## Capacidades

- Autocompletado de codigo fill-in-the-middle (FIM) con enfasis en el ecosistema MongoDB: consultas, pipelines de agregacion y esquemas.
- Generacion de texto condicionada por el formato de prompt `editor-context-v1`, definido en la model card del repositorio principal.
- Sugerencia de texto dentro del editor; el modelo nunca ejecuta nada, solo propone.
- Capacidades multilingues limitadas a ingles y portugues segun la model card.
- Inferencia en CPU (INT8) y en GPU via DirectML (FP16) mediante `onnxruntime-genai`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Autocompletado en el editor Kapibara Studio: el modelo se integra como motor de sugerencias en linea mediante `onnxruntime-genai`, con decodificacion greedy y 32 tokens de salida recomendados, usando el formato `editor-context-v1`.
- Sugerencia de consultas MongoDB en el IDE: dado el contexto del fichero, propone expresiones de filtrado, proyecciones y actualizaciones sobre colecciones, que el desarrollador valida antes de ejecutar.
- Generacion de pipelines de agregacion: ayuda a completar etapas `$match`, `$group` y `$lookup` a partir del contexto del codigo circundante, reduciendo el cambio de contexto hacia la documentacion.
- Despliegue en entornos sin GPU: la variante `cpu-int8/` permite ejecutar el modelo en estaciones de trabajo o portatiles sin acelerador dedicado, con un consumo de disco contenido dentro de un repo de 6.9 GB.
- Pruebas de integracion de `onnxruntime-genai` en pipelines propios: los manifiestos SHA-256 y `genai_config.json` facilitan la verificacion de artefactos en procesos de CI y la reproducibilidad de la carga del modelo.
- Evaluacion comparativa de cuantizaciones: al ofrecer INT8 y FP16 sobre los mismos pesos, sirve para medir la deriva de precision frente a los pesos bf16 en prompts propios antes de fijar una variante en produccion.
- Vista previa offline en la IDE: seleccionando la carpeta completa de una variante mediante el ajuste de directorio local de modelos ONNX, sin depender de descarga remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este repositorio no tiene evaluacion propia y que las cifras del repositorio principal se midieron sobre los pesos bf16 en safetensors, no sobre estas builds ONNX. Tampoco se proporcionan datos de latencia ni de throughput; la propia card senala que la latencia depende del host y no fue medida para esta ficha.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud para 1.5B parametros, la variante FP16 ronda los 3 GB de pesos y la INT8 aproximadamente 1.5 GB, sin contar overhead de runtime ni cache KV.
- GPU recomendadas: no disponibles. La unica ruta GPU documentada es DirectML (FP16), de caracter experimental; la card advierte que el empaquetado correcto no garantiza la seleccion de adaptador ni el rendimiento en GPU.
- Compatibilidad con GPU de consumo: probable en GPUs compatibles con DirectML, pero no confirmada por el autor; la ruta CPU INT8 es la opcion por defecto para este tamano.
- Opciones de despliegue: `onnxruntime-genai` 0.15.2 con proveedor `cpu` (INT8) o DirectML (FP16). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos ni publicados. La configuracion recomendada es decodificacion greedy con 32 tokens de salida y contexto de 2048; la cache de prefijo permanece deshabilitada a la espera de cualificacion de latencia y memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| KapiCoder-Mongo-Small-ONNX | 1.5B | no disponible (recomendado 2048) | en, pt | Apache-2.0 | ONNX (INT8, FP16) | Especializado en FIM para MongoDB; preview sin evaluacion propia |
| Qwen2.5-Coder-1.5B | 1.5B | no disponible en esta informacion | no disponible en esta informacion | Apache-2.0 | safetensors | Modelo base original del equipo Qwen; proposito general de codigo |
| KapiCoder-Mongo-Small | 1.5B | no disponible | en, pt | Apache-2.0 | safetensors (bf16) | Pesos originales del ajuste fino; aqui se midieron las metricas del proyecto |

La comparacion con otros modelos de autocompletado especializado en bases de datos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Estado PREVIEW / experimental y no cualificado: el autor no garantiza su idoneidad para produccion.
- Sin evaluacion propia en este repositorio: las metricas del proyecto corresponden a los pesos bf16, no a las builds ONNX.
- Las builds cuantizadas y convertidas pueden diferir de los pesos bf16 tanto en precision como en el texto generado; es necesario medir sobre prompts propios.
- Cobertura linguistica limitada a ingles y portugues; no se declara soporte de castellano.
- Riesgo de alucinacion en nombres de campos y APIs de MongoDB: la card exige validar los nombres de campo antes de ejecutar cualquier sugerencia.
- El modelo solo sugiere texto y nunca ejecuta nada; no debe tratarse como un agente con acceso a la base de datos.
- Advertencia de integracion EOS con GenAI 0.15.2: usar solo `IsDone()` puede descartar un token valido o duplicar el anterior; se requiere el runtime corregido de la IDE.
- La cache de prefijo esta deshabilitada por falta de cualificacion de latencia y memoria.
- Los ficheros `kapibarastudio-model.json` y `kapicoder_manifest.json` son metadatos especificos de Kapibara Studio; otras aplicaciones deben ignorarlos.
- No es un producto de Alibaba Cloud ni del equipo Qwen y no cuenta con su respaldo; la licencia Apache-2.0 exige mantener el aviso de modificacion y la atribucion.
- Sin senales de adopcion: cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/esilva/KapiCoder-Mongo-Small-ONNX
- Repositorio del modelo base (safetensors): https://huggingface.co/esilva/KapiCoder-Mongo-Small
- Modelo original Qwen2.5-Coder: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Paper de Qwen2.5-Coder (Hui et al.): https://arxiv.org/abs/2409.12186
- onnxruntime-genai: no disponible en la informacion proporcionada
