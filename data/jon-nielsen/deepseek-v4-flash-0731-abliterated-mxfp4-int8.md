# Jon-Nielsen/DeepSeek-V4-Flash-0731-Abliterated-MXFP4-INT8

## Resumen

DeepSeek-V4-Flash-0731-Abliterated-MXFP4-INT8 es una conversión del modelo DeepSeek-V4-Flash-0731 (versión abliterada por lovesenko) a un formato de cuantización mixta MXFP4-INT8, diseñada específicamente para ejecutarse en GPUs Ampere de consumo como la RTX 3090 (sm86). El modelo original utiliza FP8 y MXFP4, formatos que no tienen soporte nativo de tensor cores en Ampere, por lo que este checkpoint reempaqueta los pesos para aprovechar los tensor cores INT4 e INT8 de esa arquitectura mediante el fork de vLLM de AppMana.

La conversión mantiene los expertos en MXFP4 (E2M1) sin pérdida, reinterpretándolos como INT4 con escalas E8M0 aplicadas en el epílogo, y convierte los lineales densos de FP8 a INT8 con una pérdida mínima (SNR de 40 dB). Además, la caché KV se cuantiza a int8, duplicando la longitud de contexto efectiva hasta 437K tokens en una configuración de 8x RTX 3090. El modelo es una mezcla de expertos (MoE) con atención multi-latente (MLA) y soporta tool calling, pero el mecanismo de decodificación especulativa DSpark no funciona correctamente en esta configuración y debe deshabilitarse.

La relevancia de este modelo radica en que permite ejecutar un modelo de la familia DeepSeek V4 en hardware de consumo (8x RTX 3090) con una ventana de contexto muy amplia, algo que no era posible con los checkpoints oficiales. Está pensado como inspiración para propietarios de rigs con varias GPUs Ampere, no como una solución lista para producción sin evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con MLA (Multi-Latent Attention) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 437K tokens con KV cache int8 en 8x24GB (220K con fp8) |
| Tipos de cuantizacion | MXFP4 (expertos), INT8 (lineales densos), INT8 KV cache |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4-Flash-0731, un transformer MoE con atención multi-latente (MLA) y decodificación especulativa DSpark (3 etapas MTP). Este checkpoint no es un entrenamiento nuevo, sino una conversión de pesos: se parte del modelo abliterado de lovesenko (que edita 46 tensores `wo_b` en el espacio de pesos para eliminar la censura) y se reempaqueta para Ampere.

La conversión utiliza la herramienta `dsv4_requant_checkpoint.py` del fork de AppMana. Los expertos se mantienen en MXFP4 (E2M1) y se reinterpretan como INT4 con signo para los tensor cores de Ampere vía Marlin, con escalas E8M0 aplicadas en el epílogo. Los lineales densos pasan de FP8 E4M3 a INT8 por canal, con una pérdida medida de 40 dB SNR (~1% de error relativo medio). La caché KV se cuantiza a int8 con el esquema `int8_ds_mla`, duplicando el contexto de ~220K a 437K tokens en 8x24GB. No se aplicó ningún entrenamiento adicional ni RLHF/DPO; la abliteración es una edición en el espacio de pesos que sobrevive al reempaquetado.

## Capacidades

- Generación de texto coherente en formato largo, según las pruebas del autor.
- Tool calling funcional (verificado en las pruebas de inferencia).
- Razonamiento matemático correcto (mencionado en las pruebas).
- Modelo "uncensored" (abliterado): se han eliminado las restricciones de contenido del modelo base.
- Soporte de contexto muy largo (hasta 437K tokens con la configuración adecuada).
- Capacidades multilingües no documentadas en la información disponible.
- No se mencionan capacidades de visión, audio ni multimodalidad; es solo texto.

## Casos de uso

- Despliegue de un modelo de la familia DeepSeek V4 en hardware de consumo: permite ejecutar un MoE de gran tamaño en 8x RTX 3090 (24GB) con contexto de 437K tokens, algo inviable con los checkpoints oficiales en Ampere.
- Generación de texto de formato largo con contexto extenso: la ventana de 437K tokens permite procesar documentos completos, libros o conversaciones muy largas sin truncamiento.
- Agentes con tool calling: el modelo soporta llamadas a herramientas, por lo que puede integrarse en pipelines de agentes que necesiten interactuar con APIs o ejecutar acciones.
- Investigación sobre cuantización y despliegue en GPUs sin soporte FP8: sirve como referencia para entender cómo reempaquetar modelos MXFP4/FP8 para arquitecturas Ampere.
- Servidor de inferencia self-hosted con vLLM: el fork de AppMana permite servir el modelo con API compatible con OpenAI, útil para entornos que requieren control total de los datos.
- Experimentación con modelos abliterados: al ser una versión sin censura, puede usarse para estudiar el comportamiento del modelo sin restricciones de contenido, siempre respetando las licencias de los modelos fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no hay evaluaciones de calidad y recomienda evaluar antes de usar en producción.

Los únicos datos de rendimiento disponibles son de inferencia, medidos en 8x RTX 3090 (24GB, sm86), CUDA 13.1, torch 2.13.0+cu130:

| Configuracion | Contexto | Velocidad | Notas |
|---|---|---|---|
| KV int8, FULL_DECODE_ONLY graphs | 437K | 62 tok/s | DSpark desactivado |
| DSpark activado | 62K | 35 tok/s | 0% de aceptación de drafts |

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 95 GB, por lo que se necesitan al menos 95 GB de VRAM para cargar los pesos, más overhead de activaciones y KV cache. La configuración probada usa 8x RTX 3090 (24GB cada una, 192 GB totales).
- GPU recomendadas: RTX 3090 (sm86) o cualquier GPU Ampere con soporte INT4/INT8 tensor cores. No requiere FP8 nativo.
- Cabe en GPUs de consumo: sí, pero se necesitan múltiples GPUs (8x 24GB para el contexto máximo). Con menos GPUs se puede reducir el contexto o el batch.
- Opciones de despliegue: exclusivamente el fork de vLLM de AppMana (`vllm-consumer-nvidia-platforms`) con los parches incluidos y la librería `flash-mla==2.0.0+8ec3de6`. No se menciona compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: 62 tok/s en generación con contexto de 437K y DSpark desactivado. Con DSpark activado baja a 35 tok/s y no aporta beneficio (0% aceptación).
- Ajustes recomendados: `GPU_MEM_UTIL=0.93` (0.95 causa OOM en 24GB), `--max-num-batched-tokens 128` para 100% de caché Triton JIT.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Velocidad | Notas |
|---|---|---|---|---|
| Este modelo (MXFP4-INT8) | MXFP4 expertos + INT8 densos | 437K (int8 KV) | 62 tok/s | DSpark desactivado, sin pérdida en expertos |
| appmana/deepseek-v4-mxfp4-int8 | MXFP4 + INT8 (pre-0731) | no disponible | no disponible | Sin DSpark, versión anterior |
| appmana/deepseek-v4-int4-int8 | INT4 expertos + INT8 densos | no disponible | más rápido | Menos headroom de calidad |

No se dispone de datos de benchmarks de calidad para ninguna de estas variantes. La comparativa se basa únicamente en las descripciones cualitativas de la model card.

## Limitaciones y advertencias

- DSpark (decodificación especulativa) no funciona en esta configuración: 0% de aceptación de drafts con KV int8 en sm86. Debe deshabilitarse en producción.
- La conversión de lineales densos de FP8 a INT8 introduce una pérdida medida de 40 dB SNR (~1% de error relativo medio), que aunque es baja, no es cero.
- No hay evaluaciones de calidad publicadas; el autor recomienda evaluar antes de cualquier uso en producción.
- El modelo es "uncensored" (abliterado): puede generar contenido que el modelo base rechazaría. El usuario es responsable del uso conforme a las leyes y políticas aplicables.
- La licencia MIT se aplica a este checkpoint, pero el modelo base (DeepSeek-V4-Flash-0731) y la versión abliterada pueden tener sus propias condiciones. La model card indica "Use according to the original license(s) of the source models".
- La ruta de atención sm86 depende de la librería `flash-mla` servida desde una URL externa (`appmana.github.io`). Si esa URL deja de estar disponible, no hay fallback y el modelo no podrá servirse.
- El contexto de 437K solo se alcanza con 8x RTX 3090 y KV cache int8; con menos GPUs o con fp8 el contexto se reduce a ~220K o menos.
- No se garantiza la idoneidad para ningún propósito; el autor declara explícitamente que no hace afirmaciones de aptitud.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jon-Nielsen/DeepSeek-V4-Flash-0731-Abliterated-MXFP4-INT8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Modelo abliterado fuente: https://huggingface.co/lovesenko/DeepSeek-V4-Flash-0731-Abliterated
- Fork de vLLM de AppMana: https://github.com/appmana/vllm (rama `vllm-consumer-nvidia-platforms`)
- Quants similares: https://huggingface.co/appmana/deepseek-v4-mxfp4-int8 y https://huggingface.co/appmana/deepseek-v4-int4-int8
