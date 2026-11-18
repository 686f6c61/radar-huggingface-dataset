# dndll/Nex-N2.6-NVFP4-MXFP8-CSF

## Resumen

Nex-N2.6-NVFP4-MXFP8-CSF es una exportación cuantizada de precisión mixta, realizada después del entrenamiento (PTQ), del modelo multimodal nex-agi/Nex-N2.6, desarrollado por Nex-AGI. Se trata de un modelo de aproximadamente 321B parámetros (342.688.596.030 parámetros reales según los safetensors) orientado a tareas agénticas, generación de código, uso de ordenador y flujos de herramientas de horizonte largo. La arquitectura es `Glm5NextForConditionalGeneration`, con pipeline image-text-to-text, lo que indica capacidades multimodales de entrada de texto e imagen.

El repositorio lo mantiene el usuario `dndll`, no Nex-AGI, y es un derivado no oficial. La innovación principal es el uso de una mezcla de precisión: los expertos enrutados del decodificador se cuantizan en NVFP4 (E2M1, grupo 16) con escalas de bloque E4M3 comprimidas sin pérdida mediante el esquema CSF (Compressed Scale Format), mientras que la atención, los expertos compartidos y la atención de visión usan MXFP8 (E4M3, grupo 32). El resultado ocupa 178,55 GB de almacenamiento tensorial en 37 archivos safetensors.

Es relevante ahora porque demuestra una ruta práctica para servir modelos de escala 300B+ en hardware Blackwell con dos GPUs, reduciendo el peso en disco y memoria frente a un checkpoint BF16, a costa de requerir un runtime específico que entienda la codificación CSF y la arquitectura GLM5-Next. No es un export MXFP8 puro ni un checkpoint compatible con cargadores NVFP4 genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (transformer multimodal con expertos enrutados, MTP, atención KDA/MLA/DSA) |
| Parametros totales | 342.688.596.030 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1, grupo 16) en expertos enrutados; MXFP8 (E4M3, grupo 32) en atención, expertos compartidos y visión; BF16 en embeddings, lm_head, routers, norms, convoluciones y MLP denso de capas 0-2 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (37 archivos, 178,55 GB / 166,28 GiB), con índices bajo `tensors/` y archivo separado de escalas de activación |

## Arquitectura y entrenamiento

El modelo base Nex-N2.6 es un transformer multimodal de aproximadamente 321B parámetros con 46 capas y mecanismo de expertos (MoE), incluyendo expertos enrutados en las capas 3-44 y expertos enrutados MTP en la capa 45. La atención combina variantes KDA, MLA y un indexador DSA. Esta exportación concreta no modifica la arquitectura, sino que aplica cuantización post-entrenamiento con `quant_method: "modelopt"` y `quant_algo: "MIXED_PRECISION"`.

La calibración de escalas estáticas de activación se realizó sobre 198.549 tokens de activaciones de expertos enrutados, de los cuales 133.759 son tokens de prompt (el resto del dato no está disponible en la información proporcionada). Los expertos enrutados usan W4A4 durante el prefill y W4A16 durante el decode con la configuración de serving fijada; el resto de grupos cuantizados emplean activaciones MXFP8 dinámicas o BF16. CSF comprime sin pérdida 36.288 matrices de escalas de expertos enrutados del decodificador: 19,03 GB de escalas crudas pasan a 9,61 GB de flujo fijo más 1,07 GB de datos de excepción. La cuantización de pesos en sí es con pérdida.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Tareas agénticas y de horizonte largo con uso de herramientas, según la descripción del modelo base.
- Generación y asistencia de código.
- Uso de ordenador (computer-use) como caso de uso declarado del modelo base.
- Modo de razonamiento configurable mediante `reasoning_effort` con valores `low`, `high` y `max` en la plantilla de chat.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada, aunque el modelo base se describe como orientado a tareas con herramientas.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de revisión y generación de código, aprovechando su orientación a tareas de programación y su soporte de plantilla de chat con `reasoning_effort` para ajustar la profundidad de razonamiento.
- Agentes de uso de ordenador: adecuado para flujos que requieren interpretar capturas de pantalla y decidir acciones, gracias a su entrada de imagen y su orientación declarada a computer-use.
- Automatización de flujos con herramientas de horizonte largo: el modelo base está diseñado para tareas multi-paso con llamadas a herramientas, por lo que encaja en orquestadores de agentes que mantienen estado entre pasos.
- Análisis de documentos con imágenes: al aceptar entradas de texto e imagen, puede extraer información de capturas, diagramas o documentos escaneados y responder en texto.
- Despliegue de razonamiento de alta exigencia en clústeres Blackwell: con el runtime `karmic-kraken` y el preset TP2, puede servir como backend de razonamiento en dos GPUs para cargas internas de evaluación o prototipado.
- Investigación en cuantización: sirve como referencia práctica para estudiar el impacto de NVFP4 con escalas CSF frente a BF16 en modelos de escala 300B+, comparando calidad y uso de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 178,55 GB en disco; en memoria requiere al menos esa cantidad repartida entre GPUs, más KV-cache y escalas de activación. El despliegue verificado reserva aproximadamente 432 MB adicionales por rank frente al checkpoint QAD de referencia por el mayor conjunto de excepciones de escalas.
- GPU recomendadas: el ejemplo verificado usa dos GPUs con perfil `rtx-pro-6000-pcie` (Blackwell) en TP2.
- Cabe en consumer GPU: no disponible; el ejemplo documentado no es un comando universal de una sola GPU.
- Opciones de despliegue: vLLM mediante la imagen `ghcr.io/local-inference-lab/vllm` (digest `sha256:bc48d33ee167fb7675a59889fe0a7fea539bc6700c53cada89284d594a754b54`) con el lanzador `lil-serve`, perfil `glm53-flash` y preset `glm53-tp2`. vLLM estándar, Transformers, GGUF/llama.cpp y cargadores NVFP4 genéricos no soportan automáticamente las escalas comprimidas CSF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.6-NVFP4-MXFP8-CSF | 342.688.596.030 | no disponible | NVFP4 + MXFP8 + CSF | apache-2.0 | Hugging Face, requiere runtime específico |
| nex-agi/Nex-N2.6 (base) | ~321B | no disponible | BF16 (presumible) | no disponible | Hugging Face |
| Checkpoint QAD de referencia | no disponible | no disponible | QAD (referenciado en la receta) | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Derivado no oficial: mantenido por `dndll`, no por Nex-AGI; no es el checkpoint QAD referenciado por la receta de conversión.
- La cuantización de pesos es con pérdida; CSF solo comprime sin pérdida las escalas almacenadas, no garantiza preservación de calidad del modelo.
- Requiere un runtime que implemente el contrato `weight_scale_encoding: "csf"` para `glm5_next`; los cargadores estándar rechazan o ignoran esta codificación.
- No forzar `instanttensor` ni pasar `--quantization` o `--load-format`: se omite el enrutamiento CSF y se rechaza el layout `tensors/`.
- Los tensores indexados viven bajo `tensors/` y deben mantenerse junto con `config.json` y `model.safetensors.index.json`, incluido el archivo separado de escalas de activación.
- El despliegue documentado es TP2 en Blackwell; no es un comando universal de una sola GPU ni de hardware de consumo.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y sus derivados pueden tener condiciones adicionales no detalladas aquí.

## Enlaces

- Hugging Face: https://huggingface.co/dndll/Nex-N2.6-NVFP4-MXFP8-CSF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- Runtime verificado (Local Inference Lab, `karmic-kraken`): https://github.com/local-inference-lab/blackwell-llm-docker
- Guía de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/en/guides/cli
