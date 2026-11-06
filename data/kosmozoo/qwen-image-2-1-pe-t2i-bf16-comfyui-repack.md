# kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack

## Resumen

Qwen-Image-2.1-PE-T2I es un modelo de lenguaje especializado en la reescritura de prompts (prompt rewriting) para el modelo de generación de imágenes Qwen Image 2.1. Se trata de un fine-tune de Qwen3.5-VL de 9B parámetros desarrollado por el equipo de Qwen (Hangzhou Tongyi Laboratory Technology Co., Ltd.), diseñado específicamente para transformar indicaciones de texto en prompts optimizados para el pipeline de síntesis de imágenes. No es un modelo de generación de imágenes ni un LLM de propósito general: su función es exclusivamente la mejora y expansión de prompts en el contexto de Qwen Image 2.1.

El repositorio que nos ocupa, publicado por el usuario kosmozoo, no es un modelo nuevo sino un reempaquetado no oficial del checkpoint original en formato BF16 de archivo único para ComfyUI. El proceso de empaquetado fusiona los cuatro shards BF16 originales en un único checkpoint nativo sin modificar los 760 tensores, sus nombres, formas, dtypes ni los bytes de carga útil. Se trata, por tanto, de una operación de contenedor, no de una cuantización ni de un nuevo fine-tune.

La relevancia de esta ficha radica en que documenta un artefacto de despliegue práctico para ComfyUI, con verificación criptográfica completa (SHA256) y equivalencia tensorial comprobada, pero también en que aclara las restricciones de licencia del modelo subyacente (Qwen Research License, solo para investigación y evaluación) y las limitaciones de su validación, que no incluyó una carga real del modelo ni inferencia por parte del empaquetador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForConditionalGeneration), 32 capas de texto, anchura oculta 4096, vocabulario 248320, cabeza de salida no atada |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (el repositorio es un repack BF16; no se documentan otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License Agreement (research/evaluation only); herramientas y documentación del empaquetado bajo MIT |
| Formato de pesos | safetensors (archivo único `qwen3.5_9b_qwen_image_2.1_pe_t2i_bf16.safetensors`, 18.819.722.624 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Qwen3.5-VL de 9B parámetros, identificado en la configuración como `Qwen3_5ForConditionalGeneration`, con 32 capas de texto, anchura oculta de 4096 y un vocabulario de 248.320 tokens con cabeza de salida no atada. El recuento real de parámetros empaquetados es de 9.409.813.744. La tarea para la que fue ajustado es la reescritura de prompts de texto a imagen para Qwen Image 2.1; el autor del repack insiste en que se trata del fine-tune T2I y no del enhancer PE-I2I de edición de imágenes, ni de un LLM base genérico, ni del upsampler de FLUX, ni del DiT de generación de imágenes.

El repositorio de kosmozoo no aporta información sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). Lo que sí documenta con precisión es el proceso de empaquetado: los cuatro shards BF16 oficiales se fusionaron en un único checkpoint mediante streaming de bytes y operaciones de metadatos, y un lector estricto independiente verificó los 760 pares SHA256 de tensores de origen y salida, la cobertura completa del índice, el rechazo de claves duplicadas, los offsets contiguos y no solapados, los límites y la longitud exacta del archivo. El SHA256 completo del archivo es `5c93236acbcf73b17cad77e8a5479e15893987a34844dc653c639faff91c1a91`. No se realizó ninguna carga del modelo con la librería safetensors ni inferencia durante el empaquetado.

## Capacidades

- Reescritura y mejora de prompts de texto a imagen para el pipeline Qwen Image 2.1.
- Generación de texto condicionada por el prompt de entrada (pipeline declarado: text-generation).
- Procesamiento multimodal de entrada, heredado de la base Qwen3.5-VL (el repositorio no detalla las capacidades de visión del fine-tune).
- Integración nativa en ComfyUI mediante `CLIPLoader` con tipo `stable_diffusion` y dispositivo `default`, en el flujo del prompt-enhancer que alimenta `TextGenerate`.
- Soporte de modo Thinking y presupuestos de tokens, según los parámetros de muestreo del flujo de trabajo del autor.
- No se documentan capacidades de tool calling, function calling, agentes, matemáticas o código para este fine-tune específico.

## Casos de uso

- Mejora automática de prompts en ComfyUI: el modelo se coloca en el cargador del prompt-enhancer que alimenta el nodo `TextGenerate`, de modo que cada indicación del usuario se reescribe antes de llegar al generador de imágenes, mejorando la fidelidad del resultado sin intervención manual.
- Sustitución del enhancer INT8 en flujos existentes: al ser un repack BF16 del mismo modelo, puede reemplazar al checkpoint INT8 correspondiente conservando el tipo de cargador, dispositivo, prompts, modo Thinking, presupuestos de tokens, semilla y parámetros de muestreo del perfil ya configurado.
- Despliegue en equipos Apple Silicon: el autor registra un flujo probado en Apple M3 Ultra con 256 GiB de memoria unificada, ComfyUI 0.42.5 y Torch 2.14.1, lo que lo hace adecuado para estaciones de trabajo sin GPU NVIDIA dedicada.
- Investigación sobre reescritura de prompts: al estar bajo licencia de solo investigación y evaluación, encaja en estudios comparativos sobre cómo la expansión de prompts afecta a la calidad de la imagen generada.
- Verificación de integridad en pipelines de producción: el repositorio incluye `SHA256SUMS`, `VERIFICATION.json` y `TENSOR-EQUIVALENCE.json`, lo que permite auditar que el checkpoint desplegado coincide byte a byte con el original antes de usarlo.
- Reproducibilidad de entornos ComfyUI: al fijar la revisión inmutable `f3ed7985c788ad75b3ab7223e0c4c51e2a43545b` del modelo fuente y conservar config, tokenizer, chat template y system prompt en `upstream/`, facilita la reconstrucción exacta del entorno de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para los pesos (18.819.722.624 bytes), más el overhead de activaciones, caché KV y contexto, por lo que se recomienda un mínimo de 24 GB de memoria.
- GPU recomendadas: no disponibles en la información proporcionada; el único entorno documentado es Apple M3 Ultra con 256 GiB de memoria unificada.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 24 GB o más (por ejemplo, RTX 4090), aunque el autor no lo confirma ni aporta pruebas de inferencia.
- Opciones de despliegue: ComfyUI nativo (versión registrada 0.42.5 con Torch 2.14.1); no se documentan vLLM, llama.cpp, Ollama ni TGI, y el repositorio no es una carpeta de modelo `from_pretrained` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack | 9.409.813.744 | No disponible | Reescritura de prompts T2I | Qwen Research (solo investigación) | safetensors BF16 único |
| Qwen/Qwen-Image-2.1-PE-T2I (original) | 9.409.813.744 | No disponible | Reescritura de prompts T2I | Qwen Research (solo investigación) | Cuatro shards BF16 |
| Qwen Image 2.1 PE-I2I enhancer | No disponible | No disponible | Mejora de prompts para edición de imágenes | No disponible | No disponible |
| FLUX prompt upsampler | No disponible | No disponible | Mejora de prompts para FLUX | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia restrictiva: la Qwen Research License Agreement (versión de 20 de septiembre de 2026) limita el uso a investigación y evaluación; el uso comercial requiere una licencia separada solicitada a `model-business@notice.qwencloud.com`. No es Apache 2.0 ni MIT.
- El aviso MIT del repositorio cubre únicamente las herramientas de empaquetado y la documentación nueva, no los pesos ni los archivos originales.
- El empaquetador no realizó ninguna carga del modelo ni inferencia; la validación se limita a la equivalencia tensorial y de bytes. La única evidencia de funcionamiento es el reporte de un usuario en Apple MPS, sin parámetros de prueba completos.
- El repositorio no es una carpeta de modelo de Transformers: no admite `from_pretrained` directamente y está pensado para el cargador nativo de ComfyUI.
- No debe confundirse con el enhancer PE-I2I de edición de imágenes ni con el DiT generador de imágenes; sustituirlo por el checkpoint equivocado rompe el flujo.
- No se documentan sesgos, riesgo de alucinación ni cobertura idiomática del fine-tune.
- El modelo está especializado en una única tarea (reescritura de prompts para Qwen Image 2.1); su uso fuera de ese pipeline no está respaldado por la documentación.
- El nombre del repositorio incluye el espacio de nombres del publicador para dejar claro que no es una versión oficial de Qwen.

## Enlaces

- Repositorio del repack: https://huggingface.co/kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack
- Modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Licencia del modelo: https://huggingface.co/kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack/blob/main/LICENSE
- Alcance de licencias: https://huggingface.co/kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack/blob/main/LICENSE-SCOPE.md
- Licencia de herramientas y documentación: https://huggingface.co/kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack/blob/main/LICENSE-TOOLS-DOCS
- Aviso de atribución: https://huggingface.co/kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack/blob/main/Notice
- Registro de cambios: https://huggingface.co/kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack/blob/main/CHANGELOG.md
- Verificación: https://huggingface.co/kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack/blob/main/VERIFICATION.json
- Equivalencia tensorial: https://huggingface.co/kosmozoo/Qwen-Image-2.1-PE-T2I-BF16-ComfyUI-Repack/blob/main/TENSOR-EQUIVALENCE.json
