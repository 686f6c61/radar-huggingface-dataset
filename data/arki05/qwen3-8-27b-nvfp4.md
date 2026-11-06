# Arki05/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantizacion de pesos en NVFP4 del modelo Qwen/Qwen3.8-27B, publicada por el usuario Arki05. Se distribuye como checkpoint en formato compressed-tensors para su uso directo con vLLM, sin necesidad de pasar por herramientas de conversion adicionales. El modelo conserva la arquitectura multimodal original (entrada imagen-texto, pipeline image-text-to-text) y aplica cuantizacion FP4 unicamente a las capas lineales de los bloques de texto, manteniendo en BF16 el encoder de vision, los embeddings, el `lm_head` y la capa de prediccion multi-token.

El interes practico de esta publicacion es la reduccion de huella: pasa de aproximadamente 54 GB en BF16 a 20,6 GB, lo que permite servir un modelo de 27.781 millones de parametros en configuraciones de dos GPU de consumo (el autor reporta pruebas en 2x RTX 5080 de 16 GB con unos 9 GB de pesos por GPU) o en una unica GPU de 24 GB o mas con los valores por defecto de vLLM. La cuantizacion es weight-only (W4A16): los valores son FP4 E2M1, con una escala FP8 E4M3 por cada 16 valores y una escala FP32 por tensor, mientras las activaciones permanecen en 16 bits.

La relevancia es doble: por un lado, demuestra el flujo de cuantizacion NVFP4 con compressed-tensors sobre un modelo multimodal de ~28B; por otro, la licencia Apache-2.0 del modelo base se mantiene, lo que facilita su evaluacion en entornos comerciales. No obstante, se trata de una publicacion reciente, sin descargas ni valoraciones, y el propio autor indica que la tabla de calidad (divergencia KL frente al BF16) esta pendiente de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion lineal en los bloques de texto (familia Qwen3.5, tag `qwen3_5`); encoder de vision mas bloques de texto y capa de prediccion multi-token |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servicio usa `--max-model-len 4096`) |
| Tipos de cuantizacion | NVFP4 weight-only (W4A16): FP4 E2M1 con escala FP8 E4M3 por grupo de 16 valores y escala FP32 por tensor; capas no lineales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4), para vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de la familia Qwen3.5 que combina un encoder de vision con bloques de texto que incluyen capas de atencion lineal ademas de atencion estandar, y una capa de prediccion multi-token. Esta publicacion no entrena el modelo: parte de los pesos BF16 originales de Qwen y cuantiza las 496 capas lineales de los 64 bloques de texto (atencion, atencion lineal y MLP), lo que suma 24,4 B de parametros cuantizados. Permanecen en BF16 el embedding, el `lm_head`, el encoder de vision y la capa de prediccion multi-token.

La innovacion tecnica esta en el procedimiento de cuantizacion: cada capa se cuantiza con informacion de segundo orden (Hessiano) sobre las entradas de la capa y sobre como sus salidas afectan a la distribucion del siguiente token, medida sobre una mezcla de texto web, texto enciclopedico y multilingue, matematicas, codigo, ciencia, seguimiento de instrucciones, uso de herramientas y documentos de contexto largo, incluyendo respuestas generadas por el propio modelo. Todas las capas se cuantizan desde los pesos BF16 originales, sin conversion intermedia desde otra cuantizacion. Las capas que vLLM fusiona (q/k/v, gate/up y las proyecciones de entrada de la atencion lineal) comparten su escala por tensor.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones multi-turno, heredadas del modelo base.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), con encoder de vision intacto en BF16.
- Razonamiento multi-paso y prediccion multi-token gracias a la capa MTP conservada.
- Uso de herramientas y agentes: el dataset de calibracion incluye datos de tool use, lo que sugiere soporte de function calling en el modelo base (no se detalla en la model card de esta cuantizacion).
- Capacidades multilingues: el conjunto de calibracion incluye texto multilingue, pero no se enumeran los idiomas soportados.
- Procesamiento de documentos de contexto largo, segun la composicion del dataset de calibracion.
- Capacidades de codigo, matematicas y ciencia implicitas en el modelo base; no se documentan de forma especifica para esta version cuantizada.

## Casos de uso

- Despliegue de un modelo de ~28B en hardware de consumo: con 20,6 GB de pesos, cabe en una GPU de 24 GB (RTX 4090, L4, A10G de 24 GB) o en dos GPU de 16 GB con tensor parallelism, como reporta el autor con 2x RTX 5080.
- Servicio de chat multimodal en produccion con vLLM: al cargarse directamente como weight-only FP4 (kernel Marlin), se integra en el servidor OpenAI-compatible de vLLM sin flags de cuantizacion adicionales.
- Procesamiento de documentos con imagen y texto: al conservar el encoder de vision en BF16, mantiene la capacidad de leer capturas, formularios o diagramas y responder sobre ellos, con menor coste de memoria que el BF16.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de un modelo multimodal de ~28B al pasar de BF16 a NVFP4, junto con la build GGUF del mismo autor.
- Prototipado de agentes con tool calling: el formato compressed-tensors es compatible con el motor de vLLM, lo que permite levantar un endpoint de herramientas con requisitos de VRAM reducidos.
- Inferencia por lotes en una sola GPU de 24 GB: con `--max-num-seqs` y `--max-num-batched-tokens` ajustados, se puede servir a varios usuarios concurrentes en un nodo pequeno.
- Pruebas de contexto largo en hardware limitado: util para validar cargas de trabajo de documentos extensos antes de escalar a la version BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la divergencia KL frente al modelo BF16 en texto reservado se publicara en una actualizacion de la tarjeta, y remite a la build GGUF del mismo autor para mediciones a distintos tamanos. No se deben asumir cifras de MMLU, HumanEval o GSM8K para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada: unos 20,6 GB solo para pesos; con overhead de KV cache y activaciones, se recomienda un minimo de 24 GB para contexto corto.
- El autor reporta unos 9 GB de pesos por GPU en una configuracion de 2x RTX 5080 de 16 GB con `--tensor-parallel-size 2`, `--max-model-len 4096`, `--max-num-batched-tokens 1024` y `--max-num-seqs 4`.
- GPU recomendadas: RTX 4090 o L4/A10G de 24 GB para una sola tarjeta; A100 40/80 GB y H100 para produccion con contexto largo y mayor concurrencia; 2x RTX 5080 16 GB como configuracion de consumo validada por el autor.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y en parejas de RTX 5080/5090 de 16 GB o mas con tensor parallelism.
- Despliegue: vLLM (probado con la version 0.33.0), que detecta el formato desde `config.json` y ejecuta el kernel Marlin en modo weight-only FP4. No se documenta soporte para llama.cpp, Ollama o TGI en esta publicacion.
- Latencia y throughput: no disponibles; no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Arki05/Qwen3.8-27B-NVFP4 | ~27,8 B | no disponible | safetensors compressed-tensors NVFP4 (W4A16), 20,6 GB | Apache-2.0 | Requiere vLLM; calidad KL pendiente de publicacion |
| Qwen/Qwen3.8-27B (base) | ~27,8 B | no disponible | BF16, ~54 GB | Apache-2.0 | Referencia de calidad; mayor huella de VRAM |
| Arki05/Qwen3.8-27B-GGUF | ~27,8 B | no disponible | GGUF a varios tamanos | Apache-2.0 | Alternativa para llama.cpp y Ollama; el autor remite ahi para mediciones |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion FP4 introduce degradacion respecto al BF16; el autor no ha publicado aun la divergencia KL, por lo que la perdida de calidad no esta cuantificada.
- El encoder de vision, los embeddings, el `lm_head` y la capa MTP permanecen en BF16, de modo que el ahorro de memoria no es proporcional en esas partes y el modelo sigue necesitando capacidad para componentes de 16 bits.
- La configuracion probada por el autor es solo texto, con imagenes y video deshabilitados (`--limit-mm-per-prompt '{"image":0,"video":0}'`); el rendimiento multimodal no esta validado en la model card.
- No se documentan los idiomas soportados ni sesgos conocidos para esta version.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion puede amplificarlo en tareas de razonamiento largo.
- La licencia Apache-2.0 permite uso comercial, pero se trata de pesos modificados del modelo original y conviene conservar la atribucion a Qwen.
- Publicacion sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta); no hay evidencia independiente de estabilidad en produccion.
- Dependencia de una version concreta de vLLM (probado con 0.33.0); el soporte de compressed-tensors NVFP4 puede variar entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Arki05/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build GGUF del mismo autor: https://huggingface.co/Arki05/Qwen3.8-27B-GGUF
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Repositorio vLLM: https://github.com/vllm-project/vllm
