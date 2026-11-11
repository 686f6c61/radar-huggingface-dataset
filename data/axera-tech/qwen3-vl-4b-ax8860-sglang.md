# AXERA-TECH/Qwen3-VL-4B-AX8860-SGLang

## Resumen

Qwen3-VL-4B-AX8860-SGLang es un paquete de despliegue publicado por AXERA-TECH que adapta el modelo multimodal Qwen3-VL-4B-Instruct para ejecutarse sobre la NPU Axera AX8860 mediante SGLang. No se trata de un modelo entrenado desde cero, sino de una receta de empaquetado: el modelo de lenguaje se sirve con pesos NVFP4 (checkpoint de 4,43 GB alojado en un repositorio externo) y la torre de visión se compila como un AXModel BF16 de rejilla fija para la NPU.

El repositorio (0,9 GB) contiene el artefacto de visión compilado (`qwen3_vl_4b_vision_40.axmodel`), scripts de exportación y validación, parches de runtime para la DMA de visión y una caché precompilada de 40 entradas BRUN. El checkpoint NVFP4 no se incluye y debe descargarse por separado desde `JEILDLWLRMA/Qwen3-VL-4B-Instruct-NVFP4`, verificando su SHA256.

Su relevancia es práctica: demuestra cómo llevar un VLM de 4B parámetros a hardware NPU edge con una configuración validada (cuatro núcleos AX8860, contexto de 512 tokens, KV cache BF16, una petición simultánea). Resulta útil para equipos que despliegan inferencia multimodal en dispositivos Axera y necesitan reproducir exactamente un entorno que ya funciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3-VL-4B-Instruct (transformer multimodal con torre de visión); despliegue NPU AX8860 con SGLang |
| Parametros totales | 4B (modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en la configuracion validada (presupuesto KV total 2048) |
| Tipos de cuantizacion | NVFP4 para el modelo de lenguaje; BF16 para la torre de visión (AXModel) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | `model.safetensors` (NVFP4, 4.430.839.936 bytes) + `.axmodel` (BF16, visión) + caché `precompiled-cache.tar.gz` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-4B-Instruct, un VLM de la familia Qwen3-VL con una torre de visión y un modelo de lenguaje transformer. Este repositorio no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO); esa información no está disponible en la model card proporcionada y debe consultarse en la ficha original de Qwen3-VL-4B-Instruct.

La aportación técnica del paquete es la adaptación al hardware: el modelo de lenguaje usa pesos NVFP4, mientras que la torre de visión se compila como un grafo fijo para la NPU AX8860 con entrada BF16 `[1600, 1536]`, salida BF16 `[400, 10240]` y rejilla `[1, 40, 40]`. El preprocesado de imagen es 640x640, lo que produce 400 tokens de imagen. El artefacto de visión solo acepta esa rejilla cuadrada fija; para otra resolución hay que recompilar con `export_qwen3_vl_vision_axmodel.py`. El despliegue validado usa BRUN, cuatro núcleos AX8860, atención de visión SDPA, KV cache BF16, tamaño de chunk/página 256, una petición simultánea y CUDA graphs desactivados.

## Capacidades

- Generación de texto y razonamiento con el modelo de lenguaje Qwen3-VL-4B-Instruct.
- Comprensión de imágenes mediante la torre de visión compilada (entrada 640x640, 400 tokens de imagen).
- Inferencia multimodal en dispositivo NPU Axera AX8860, sin GPU dedicada.
- Ejecución determinista con `temperature: 0` para validación greedy.
- Servido mediante SGLang con el entrypoint AXModel configurado vía `SGLANG_AXERA_VL_AXMODEL`.
- Soporte de tool calling, agentes o thinking mode: no disponible en la información proporcionada (depende del modelo base, no documentado aquí).
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue edge de un VLM en hardware Axera: usar el paquete para servir Qwen3-VL-4B sobre una placa AX8860 con SGLang, reproduciendo la configuración validada (cuatro núcleos, contexto 512, una petición).
- Validación de pipelines de compilación NPU: emplear `validate_qwen3_vl_vision_axmodel.py` para comprobar formas y dtypes del artefacto antes de integrarlo en producción.
- Recompilación de la torre de visión para otras resoluciones: usar `export_qwen3_vl_vision_axmodel.py` con `--grid-size` distinto para adaptar el modelo a imágenes de otra rejilla.
- Reproducción de entornos de inferencia: aplicar `scripts/apply_runtime_patches.py` e `import_cache.sh` para restaurar la caché BRUN y los parches de DMA en una placa con el mismo stack de software.
- Prototipado de asistentes visuales de baja latencia en dispositivo: con contexto de 512 tokens y una petición simultánea, adecuado para tareas de descripción de imagen o VQA simple en entornos embebidos.
- Verificación de integridad de artefactos: comprobar el SHA256 del checkpoint NVFP4 y del AXModel de visión antes de desplegar, tal como documenta la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU Axera AX8860 con cuatro núcleos (configuración validada).
- Checkpoint NVFP4 de 4,43 GB (4.430.839.936 bytes) descargado aparte.
- Artefacto de visión BF16 de 897 MB cargado en la NPU.
- Runtime validado: CPython 3.12.15, torch 2.13.0+cpu con runtime Axera, transformers 5.12.1, sglang-axera 0.5.18, sgl-kernel-axera 0.1.0, axnn 8.0, pyAXCL 0.5.1.
- La carga del archivo de visión en una sola llamada DMA devuelve `EINVAL`; se requieren chunks DMA de 4 MiB (parche incluido).
- VRAM de GPU: no aplica; el despliegue es sobre NPU. No cabe en GPU consumer por diseño de este paquete.
- Opciones de despliegue: SGLang con el entorno Axera instalado y `SGLANG_AXERA_VL_AXMODEL` apuntando al `.axmodel` de visión. No se documentan vLLM, llama.cpp ni Ollama para este artefacto.
- Latencia y throughput: no disponibles; la configuración validada procesa una petición a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B-AX8860-SGLang | 4B | 512 (validado) | NPU Axera AX8860 | BSD-3-Clause | Hugging Face (AXERA-TECH) |
| Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | GPU | no disponible en esta ficha | Hugging Face (Qwen) |
| Qwen3-VL-4B-Instruct-NVFP4 | 4B | no disponible en esta ficha | GPU (pesos NVFP4) | no disponible en esta ficha | Hugging Face (JEILDLWLRMA) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye el checkpoint NVFP4; sin la descarga externa y la verificación de SHA256 el modelo no arranca.
- La torre de visión acepta únicamente la rejilla fija 40x40 (640x640, 400 tokens); otras resoluciones requieren recompilar el AXModel.
- Contexto limitado a 512 tokens en la configuración validada, con presupuesto KV total de 2048 y una sola petición simultánea: no apto para conversaciones largas ni alta concurrencia.
- El exportador de visión requiere un checkpoint BF16 con `model.safetensors.index.json`; el checkpoint NVFP4 no sirve como `--model-dir`.
- El parche de DMA de 4 MiB es necesario en la placa validada; sin él, la carga del archivo de visión falla con `EINVAL`.
- La licencia BSD-3-Clause se hereda del checkpoint Qwen3-VL-4B-Instruct según la model card; conviene verificar los términos del modelo base para uso comercial.
- Sesgos y riesgo de alucinación: no documentados en la información proporcionada; aplican los del modelo base Qwen3-VL-4B-Instruct.
- Idiomas soportados: no disponibles en la model card de este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-VL-4B-AX8860-SGLang
- Checkpoint NVFP4: https://huggingface.co/JEILDLWLRMA/Qwen3-VL-4B-Instruct-NVFP4
