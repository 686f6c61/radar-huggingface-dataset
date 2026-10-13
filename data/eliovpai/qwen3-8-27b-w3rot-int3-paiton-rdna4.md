# EliovpAI/Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4

## Resumen

Este repositorio contiene un conjunto de pesos de cuantizacion de 3 bits para las proyecciones del decodificador de [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B), calibrados por EliovpAI (Eliovp-BV) mediante una ejecucion propia de GPTQ sobre datos con licencias permisivas. No es un checkpoint autonomo: funciona como complemento del paquete Paiton para Qwen3.8 sobre una unica GPU AMD Radeon AI PRO R9700 (RDNA4, `gfx1201`, 32 GB), y necesita ademas un checkpoint objetivo en NVFP4 y un borrador de decodificacion especulativa DFlash2 en FP8.

El objetivo es reducir el coste de memoria y aumentar el rendimiento de decodificacion manteniendo la mayor parte de la calidad del modelo original. Frente a la ruta MXFP4 previa, la decodificacion ponderada sube un 19,9 % y el prefill entre un 5 % y un 13 %, mientras que la memoria del modelo baja de 19,18 a 15,89 GiB. El precio es una perdida de unos 3 puntos de recuerdo de conocimiento en MMLU-Pro, de los que la actualizacion del 12 de octubre de 2026 recupera entre 0,5 y 1 punto.

Las caracteristicas relevantes incluyen cuantizacion INT3 con rotacion Hadamard (W3A4), cabecera de salida en FP8, decodificacion especulativa con DFlash2, vision integrada mediante la ruta `--vision`, contexto por defecto de 65 536 tokens ampliable a 262 144 (y 524 288 en modo experimental) y una cache compartida de hasta 628 877 tokens en texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3.8-27B: transformer denso multimodal nativo con atencion lineal Gated DeltaNet combinada con atencion completa; este repositorio aporta pesos INT3 con rotacion Hadamard (W3A4) para las proyecciones del decodificador |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B); este repositorio contiene unicamente un subconjunto de pesos de sustitucion |
| Parametros activos | no aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 65 536 por defecto; hasta 262 144; 524 288 en modo experimental (`long-512k`) |
| Tipos de cuantizacion | INT3 (3 bits) en pesos y 4 bits en activaciones (W3A4) con GPTQ y rotacion Hadamard; ruta alternativa MXFP4 en el mismo paquete; cabecera de salida en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio con `w3rot-manifest.json` y `SHA256SUMS`; no se documenta safetensors ni GGUF) |
| Tamano de los pesos | 9,55 GB |
| Tamano del repositorio | 19,1 GB |
| GPU objetivo | AMD Radeon AI PRO R9700 (`gfx1201`, RDNA4, 32 GB) |
| Revision de estos pesos | `3ef7eb149ec0bd9a0f7927491bf30f53f54ced01` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso y multimodal nativo publicado por el equipo Qwen de Alibaba. La presencia de filas rotadas de «Gated DeltaNet» en el proceso de cuantizacion indica una arquitectura hibrida que combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa. El paquete de inferencia anade decodificacion especulativa mediante un borrador DFlash2 en FP8, ademas de cache de prefijos y cache KV de 4 bits en el modo `long-kv4`.

Estos pesos W3Rot no se han entrenado: se han obtenido con una ejecucion propia de GPTQ sobre datos con licencias permisivas, documentada en `CALIBRATION.md`. La innovacion principal es la rotacion Hadamard aplicada antes de la cuantizacion, que reparte los valores atipicos y permite bajar a 3 bits en pesos con activaciones de 4 bits. La actualizacion del 12 de octubre de 2026 destilo las escalas de grupo en BF16 hacia el modelo bf16, sin cambiar el formato, los codigos de 3 bits, la imagen de ejecucion ni el lanzador: solo cambian los valores de escala. El resultado es una reduccion de la divergencia KL respecto a bf16 del 20,9 % en decodificacion y del 23,8 % en prefill, y del 19,5 % cuando se sirve en la R9700, a velocidad sin cambios. El modelo se apoya en el checkpoint objetivo `unsloth/Qwen3.8-27B-NVFP4` para el resto de tensores y en el borrador `tcclaviger/Qwen3.8-27B-DFlash2-FP8`.

## Capacidades

- Generacion de texto en modo `text-generation`, con decodificacion codiciosa en las mediciones publicadas y razonamiento con «thinking» desactivado en las pruebas.
- Razonamiento y conocimiento general, con una degradacion declarada de en torno a 3 puntos en MMLU-Pro respecto a la ruta MXFP4 (recuperando entre 0,5 y 1 punto con la actualizacion de octubre).
- Codigo y flujos de agentes de programacion: el modo `long-kv4` esta pensado explicitamente para agentes de codigo y documentos largos.
- Vision: soporte de imagenes mediante `--vision`, con lectura de imagenes de hasta 4K a resolucion completa y una cache de prefijos de 555 128 tokens cuando hay imagenes.
- Contexto largo: 262 144 tokens por peticion en los modos `long` y `long-kv4`, y 524 288 en el modo experimental `long-512k`.
- Concurrencia: todos los modos admiten hasta ocho peticiones simultaneas.
- Cache de prefijos, incluida persistencia tras un reinicio en el modo `long-kv4 --extend-cache` (entre 0,7 y 2,8 millones de tokens en RAM del sistema o en NVMe/SSD).
- Decodificacion especulativa mediante el borrador DFlash2, que acelera la generacion.
- Tool calling, function calling, capacidades de agentes multi-paso y cobertura multilingue: no documentadas en la informacion disponible para este paquete de pesos.

## Casos de uso

- Agentes de programacion sobre repositorios grandes: el modo `long-kv4` ofrece 262 144 tokens por peticion y una cache compartida de 628 877 tokens, suficiente para mantener en memoria varios ficheros y el historial de herramientas de un agente que itera sobre el mismo codigo.
- Analisis de documentacion extensa: informes, contratos o expedientes que caben en una sola ventana de 262 144 tokens, con lectura por pasos de 2048 tokens para no bloquear al resto de usuarios.
- Asistentes con vision para capturas de pantalla: lectura de imagenes hasta 4K a resolucion completa y cache con imagenes de 555 128 tokens, adecuada para revisar interfaces, diagramas o documentacion escaneada.
- Atencion al cliente multi-turno concurrente: el modo por defecto (`--mode 65k`) mantiene seis peticiones de longitud completa simultaneas y evita la cache de prefijos para priorizar la latencia en conversaciones cortas.
- RAG sobre corpus persistentes: con `long-kv4 --extend-cache` la cache sobrevive a los reinicios, de modo que un servicio puede reutilizar entre 0,7 y 2,8 millones de tokens ya procesados sin recalcular el prefill.
- Analisis de repositorios completos: el modo experimental `long-512k` permite una unica peticion de hasta 524 288 tokens con cache de 594 290, util para revisiones globales de un arbol de codigo.
- Despliegue en hardware AMD de gama profesional: con 9,55 GB de pesos y 15,89 GiB de memoria de modelo, una sola R9700 de 32 GB puede servir un modelo de 27 000 millones de parametros con vision y contexto largo, sin GPU NVIDIA.

## Benchmarks y rendimiento

La informacion disponible incluye resultados relativos medidos en modelo el 26 de septiembre de 2026 con la imagen Paiton, usando decodificacion codiciosa y «thinking» desactivado, comparando cada prueba contra la imagen MXFP4 sobre elementos identicos. No se han publicado cifras absolutas de MMLU, HumanEval, GSM8K u otros benchmarks en la informacion proporcionada.

| Metrica | Comparacion | Resultado |
|---|---|---|
| Decodificacion ponderada | frente a la imagen MXFP4 previa | +19,9 % |
| Prefill | frente a la imagen MXFP4 previa | +5 % a +13 % |
| Memoria del modelo | frente a la imagen MXFP4 previa | 19,18 GiB → 15,89 GiB |
| MMLU-Pro (recuerdo de conocimiento) | frente a la imagen MXFP4 previa | −3 puntos aproximadamente |
| Recuperacion de MMLU-Pro (actualizacion del 12 de octubre de 2026) | frente a los pesos anteriores | +0,5 a +1 punto estimado |
| Divergencia KL respecto a bf16 (decodificacion) | frente a los pesos anteriores | −20,9 % |
| Divergencia KL respecto a bf16 (prefill) | frente a los pesos anteriores | −23,8 % |
| Divergencia KL respecto a bf16 servido en la R9700 | frente a los pesos anteriores | −19,5 % |
| Latencia de respuesta corta durante una lectura de 64K | modo `long-kv4` | 0,7 s en lugar de 5,9 s |

## Requisitos de hardware

- GPU: una unica AMD Radeon AI PRO R9700 (`gfx1201`, RDNA4, 32 GB). No se documenta soporte para CUDA ni para otras GPU.
- Memoria de modelo: 15,89 GiB, frente a 19,18 GiB de la ruta MXFP4, gracias a los pesos INT3 de 9,55 GB.
- Memoria adicional: en `--mode long-kv4` la tabla de embeddings (2,4 GiB) se mantiene en RAM del sistema fijada (pinned); `--extend-cache` anade entre 0,7 y 2,8 millones de tokens de cache en RAM o en NVMe/SSD.
- Cache KV: 4 bits en el modo `long-kv4`; la cache compartida de texto llega a 628 877 tokens y a 555 128 con imagenes.
- Requisitos de host: Linux x86-64, Python 3, Docker y acceso al dispositivo AMD GPU (`/dev/kfd`, `/dev/dri`).
- Imagen de ejecucion: `ghcr.io/eliovp/paiton-vllm-plugin:qwen38-rocm10-vllm029-20261005-r1@sha256:245c71d54f046f89b74dbfbd4c894003754561e55c9d215a8d3ce65364fb0f80`.
- Lanzador: `models/Qwen3.8-MXFP4-DFlash2/run-3bit.sh` del repositorio publico del plugin.
- Opciones de despliegue: exclusivamente vLLM a traves del plugin Paiton. No se documentan llama.cpp, Ollama ni TGI para este paquete.
- Rendimiento: la mejora de velocidad depende del modo; el modo `long-512k` es experimental y no se publican cifras de throughput absolutas.

## Comparativa con modelos similares

| Modelo o ruta | Parametros | Contexto | Memoria de modelo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EliovpAI Qwen3.8-27B W3Rot INT3 (este repositorio) | 27 000 M (denso) | 65 536 por defecto, hasta 262 144 (524 288 experimental) | 15,89 GiB, pesos de 9,55 GB | Apache 2.0 | Complemento, requiere objetivo NVFP4 y borrador DFlash2 FP8 |
| Ruta MXFP4 del mismo plugin Paiton | 27 000 M (denso) | hasta 262 144 por peticion | 19,18 GiB | Apache 2.0 | Paquete Paiton sobre la misma imagen |
| `unsloth/Qwen3.8-27B-NVFP4` (checkpoint objetivo) | 27 000 M (denso) | no disponible | no disponible | no disponible | Checkpoint publico en HuggingFace |
| `tcclaviger/Qwen3.8-27B-DFlash2-FP8` (borrador especulativo) | no disponible | no disponible | no disponible | no disponible | Checkpoint publico en HuggingFace, usado como drafter |
| `amd/Qwen3.8-27B-Quark-Qronos-INT4-W4A16` | 27 000 M (denso) | no disponible | no disponible | no disponible | Cuantizacion INT4 alternativa sobre ROCm, mencionada en el repositorio del plugin |

No se dispone de comparativas de rendimiento con modelos de otros fabricantes del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint autonomo: sin el checkpoint objetivo NVFP4 y el borrador DFlash2 FP8 en las revisiones exactas indicadas, los pesos no funcionan. Las filas rotadas de Gated DeltaNet b/a se derivaron de los bytes de la revision objetivo.
- Perdida de calidad declarada: aproximadamente 3 puntos de MMLU-Pro frente a MXFP4, con una recuperacion estimada de solo 0,5 a 1 punto tras la actualizacion de escalas.
- Dependencia de hardware muy estrecha: una unica Radeon AI PRO R9700 con `gfx1201`. No se documenta funcionamiento en otras GPU AMD ni en NVIDIA, ni rutas alternativas como llama.cpp u Ollama.
- Dependencia de una imagen Docker concreta, fijada por digest, y de revisiones concretas de dos checkpoints adicionales; cualquier desviacion puede romper la coherencia de los pesos rotados.
- Riesgo de alucinacion: no se han publicado mediciones de fidelidad factual, tasa de alucinacion ni evaluaciones de seguridad para estos pesos.
- Idiomas soportados: no disponibles. La model card no documenta cobertura multilingue, por lo que no puede asumirse un comportamiento equivalente al del modelo base en idiomas distintos del ingles.
- Tool calling, function calling, comportamiento agentico de multiples pasos y modo de razonamiento extendido no estan documentados para este paquete; las mediciones se hicieron con «thinking» desactivado.
- El modo `long-512k` es experimental y no publica datos de cache con vision.
- Licencia: los pesos de este repositorio son Apache 2.0 y permiten uso comercial, pero el despliegue depende de checkpoints de terceros (`unsloth/Qwen3.8-27B-NVFP4` y `tcclaviger/Qwen3.8-27B-DFlash2-FP8`) cuyas licencias no se detallan en la informacion disponible y deben verificarse antes de un uso en produccion.
- Los datos de calibracion del GPTQ proceden de un conjunto con licencias permisivas segun el autor, pero la composicion exacta solo se detalla en `CALIBRATION.md`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EliovpAI/Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4
- Documento de calibracion: https://huggingface.co/EliovpAI/Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4/blob/d74ae7d5f5f1b4b45dd12fb1271e3664283a2ec1/CALIBRATION.md
- Repositorio del plugin Paiton: https://github.com/Eliovp-BV/paiton-vllm-plugin
- Instrucciones del paquete Qwen3.8 (ruta MXFP4 y 3 bits): https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/main/models/Qwen3.8-MXFP4-DFlash2/README.md
- Directorio de modelos Qwen3.8 del plugin: https://github.com/Eliovp-BV/paiton-vllm-plugin/tree/main/models/Qwen3.8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Checkpoint objetivo NVFP4: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4/tree/f0b7c9e722f5565102fff8481c99e4d86ae099c7
- Borrador DFlash2 FP8: https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8/tree/ee0cb26a8279b7910cc28d82a8a3e15e4728d56f
- Ficha en free2aitools: https://free2aitools.com/model/eliovpai/qwen3.8-27b-w3rot-int3-paiton-rdna4
