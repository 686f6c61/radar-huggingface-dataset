# qatfactory/Qwen3.5-9B-NVFP4-LoRA-r256-QAD

## Resumen

Qwen3.5-9B-NVFP4-LoRA-r256-QAD es una versión cuantizada del modelo Qwen/Qwen3.5-9B publicada por el usuario qatfactory en HuggingFace. Se trata de un checkpoint sometido a entrenamiento con reconocimiento de cuantización (QAT, quantization-aware training) sobre una adaptación LoRA con rango 256, cuyo resultado se exporta en formato NVFP4 (punto flotante de 4 bits de NVIDIA) y se empaqueta con compressed-tensors para su uso con vLLM. El repositorio tiene 9.409.813.744 parámetros y ocupa 8,9 GB.

El modelo hereda la arquitectura y capacidades del Qwen3.5-9B original (familia Qwen de Alibaba), pero el interés técnico de esta publicación está en el pipeline de cuantización: combina LoRA de alto rango con QAT para preservar la calidad del modelo base tras reducir los pesos a 4 bits en el formato NVFP4, orientado a GPUs Blackwell de NVIDIA. Está pensado para despliegues de inferencia de alto rendimiento con vLLM, donde el formato NVFP4 permite aprovechar los kernels nativos de cuantización de esa arquitectura.

La ficha se basa exclusivamente en los metadatos públicos del repositorio de HuggingFace. No se ha publicado información sobre el dataset de entrenamiento, los resultados de benchmarks ni los detalles del proceso QAT más allá de lo que indican los tags. El acceso es restringido (gated): es necesario aceptar las condiciones en HuggingFace para descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA) con compressed-tensors; tag "8-bit" en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parámetros. Sobre ese modelo base se ha aplicado una adaptación LoRA de rango 256 en un proceso de quantization-aware training: durante el entrenamiento se simula la cuantización para que los pesos aprendan a ser robustos a la reducción de precisión, y el checkpoint final se exporta en NVFP4, un formato de coma flotante de 4 bits con escala por bloque definido por NVIDIA para sus GPUs Blackwell. El empaquetado usa compressed-tensors, la librería de compresión de modelos integrada en vLLM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros del proceso QAT. El tag "8-bit" del repositorio convive con la designación NVFP4 del nombre y con la etiqueta compressed-tensors; la documentación pública no aclara esa discrepancia, por lo que conviene verificar la configuración exacta de cuantización en el `config.json` del repositorio antes de desplegar.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Qwen3.5-9B base, aunque no se documentan evaluaciones específicas tras la cuantización.
- Generación de código y matemáticas: presumiblemente conservadas del modelo base; sin datos verificables en la información disponible.
- Tool calling / function calling: no confirmado en la información del repositorio.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles en los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia optimizada en vLLM con kernels NVFP4 en hardware Blackwell: es la capacidad diferencial de esta publicación.

## Casos de uso

- Despliegue de alto rendimiento en GPUs Blackwell: el formato NVFP4 está diseñado para aprovechar los kernels de cuantización nativos de las GPU Blackwell de NVIDIA, de modo que el modelo se usaría en servidores con vLLM para maximizar throughput por vatio.
- Servicio de inferencia con vLLM: al estar publicado con la librería vLLM y compressed-tensors, se integra directamente en un servidor OpenAI-compatible para exponer el modelo como API interna.
- Reducción de huella de memoria en producción: con 9,4 mil millones de parámetros en 4 bits, el checkpoint ocupa 8,9 GB, lo que permite servir el modelo en una sola GPU con menos VRAM que la versión en bf16.
- Experimentación con QAT y LoRA de alto rango: sirve como referencia para equipos que investigan pipelines de cuantización consciente del entrenamiento y quieran reproducir o comparar la receta de qatfactory.
- Evaluación comparativa de calidad tras cuantización: útil para medir la degradación de un modelo Qwen3.5-9B al pasar a NVFP4 frente al original en bf16.
- Prototipado de asistentes conversacionales con contexto largo: si el modelo base conserva su ventana de contexto, podría usarse para diálogo multi-turno, aunque la longitud exacta no está documentada en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 8,9 GB en NVFP4; se necesita margen adicional para caché KV y overhead del runtime, por lo que se estima un mínimo práctico en torno a 12-16 GB de VRAM, aunque no hay cifras oficiales.
- GPU recomendadas: GPUs NVIDIA Blackwell (serie B200, RTX 50xx) para aprovechar los kernels NVFP4 nativos; en arquitecturas anteriores el soporte de NVFP4 es limitado o emulado.
- ¿Cabe en GPU de consumo? Probablemente en RTX 50xx con suficiente VRAM, siempre que vLLM soporte NVFP4 en esa arquitectura; no confirmado.
- Opciones de despliegue: vLLM (soporte declarado en el repositorio) con compressed-tensors; llama.cpp, Ollama y TGI no están confirmados para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qatfactory/Qwen3.5-9B-NVFP4-LoRA-r256-QAD | 9,4 B | no disponible | NVFP4 (QAT + LoRA r256) | Apache 2.0 | Gated en HuggingFace |
| Qwen/Qwen3.5-9B (base) | 9,4 B | no disponible | bf16/fp16 | Apache 2.0 | Publico en HuggingFace |
| Otras cuantizaciones de Qwen3.5-9B (GPTQ, AWQ, GGUF) | 9,4 B | no disponible | 4-8 bits | Apache 2.0 | Segun publicador |

La comparación con alternativas cuantizadas de la misma familia no puede completarse con datos de rendimiento porque no se han publicado benchmarks para este checkpoint.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de descargar los pesos.
- Sin benchmarks publicados: no hay evidencia pública de la degradación de calidad respecto al Qwen3.5-9B en bf16.
- Ambigüedad en la cuantización: el tag "8-bit" y la designación NVFP4 del nombre no coinciden; verificar la configuración real antes de desplegar.
- Dependencia de hardware: NVFP4 está optimizado para GPUs NVIDIA Blackwell; en otras arquitecturas el rendimiento puede degradarse o no estar soportado.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen3.5-9B, no evaluados tras la cuantización.
- Idiomas y contexto: no documentados en este repositorio; consultar la ficha del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene revisar las condiciones del modelo base y del acceso gated.
- Publicación reciente y sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-LoRA-r256-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
