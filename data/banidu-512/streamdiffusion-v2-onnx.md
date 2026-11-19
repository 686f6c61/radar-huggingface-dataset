# banidu-512/streamdiffusion-v2-onnx

## Resumen

StreamDiffusion V2 ONNX es una exportación lista para ejecutar del modelo de difusión vídeo-a-vídeo causal StreamDiffusionV2, construido sobre la base Wan2.1-T2V-1.3B. El paquete lo publica el usuario banidu-512 y deriva del repositorio oficial de StreamDiffusionV2; su propósito es ofrecer inferencia en tiempo real sin dependencias de Python, integrándose directamente en la herramienta TiXL a través de su navegador de modelos. Resuelve el problema de desplegar difusión de vídeo causal en producción con un pipeline autocontenido en formato ONNX.

El artefacto incluye cuatro componentes: el DiT causal entrenado con destilación DMD en fp16 con resolución 256x256 y perfil de caché KV para lotes de 1 a 4, el codificador de texto UMT5-XXL, el autoencoder TAEHV y el tokenizer. El tamaño total del repositorio es de 14,3 GB. La arquitectura subyacente es un transformer de difusión (DiT) con atención causal que permite generación incremental de fotogramas manteniendo estado en caché.

Es relevante porque demuestra un flujo de exportación de difusión de vídeo en tiempo real a ONNX con licencia Apache-2.0, lo que facilita su integración en aplicaciones nativas y pipelines sin entorno Python. No obstante, se trata de un artefacto de exportación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni model card detallada más allá de la descripción del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT causal (transformer de difusión) sobre Wan2.1-T2V-1.3B, con destilación DMD |
| Parametros totales | 1,3B (modelo base Wan2.1-T2V-1.3B); total del paquete no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (perfil de caché KV para lotes de 1 a 4) |
| Tipos de cuantizacion | fp16 (DiT); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos); TAEHV bajo MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) causal derivado de Wan2.1-T2V-1.3B, adaptado para vídeo-a-vídeo en tiempo real mediante StreamDiffusionV2. La variante exportada emplea destilación DMD (Distribution Matching Distillation) para reducir el número de pasos de muestreo, y mantiene una caché KV con perfiles de lote de 1 a 4 para la generación causal de fotogramas. La resolución de trabajo es 256x256 y los pesos del DiT están en fp16.

El pipeline completo incluye el codificador de texto UMT5-XXL, el autoencoder TAEHV (MIT, de madebyollin/taehv) y el tokenizer. La exportación se generó con los scripts incluidos en TiXL (Operators/StreamDiffusion/tools/streamdiffusionv2). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Difusión vídeo-a-vídeo causal en tiempo real a resolución 256x256.
- Generación incremental de fotogramas mediante caché KV con perfiles de lote de 1 a 4.
- Acondicionamiento por texto a través del codificador UMT5-XXL.
- Codificación y decodificación de vídeo mediante el autoencoder TAEHV.
- Ejecución sin Python en la máquina destino gracias al formato ONNX.
- Integración directa con el navegador de modelos de TiXL.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponibles (no aplica a un modelo de difusión de vídeo).

## Casos de uso

- Estilización de vídeo en tiempo real: el modelo transforma un flujo de vídeo de entrada fotograma a fotograma manteniendo coherencia temporal gracias a la atención causal y la caché KV, adecuado para filtros en directo.
- Integración en aplicaciones nativas sin Python: al estar exportado a ONNX, puede cargarse desde runtimes ONNX en C++, C# o Rust, lo que encaja en herramientas de creación como TiXL.
- Prototipado de pipelines de vídeo generativo: sirve como bloque de difusión listo para ejecutar en pruebas de concepto de vídeo-a-vídeo a baja resolución.
- Previsualización rápida en edición de vídeo: la resolución 256x256 y la destilación DMD permiten generar previsualizaciones estilizadas antes del render final.
- Investigación en difusión causal: útil para experimentar con perfiles de caché KV y lotes pequeños en entornos controlados.
- Despliegue en estaciones de trabajo con GPU de consumo: el tamaño de 1,3B parámetros en fp16 facilita su ejecución en GPUs consumer, aunque los requisitos exactos no están documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el DiT de 1,3B en fp16 requiere del orden de 2,6 GB solo para pesos, a lo que se suman UMT5-XXL, TAEHV y las activaciones, por lo que el total del pipeline es sustancialmente mayor (el repositorio completo ocupa 14,3 GB).
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU consumer: probable por el tamaño del DiT, pero no confirmada por el autor.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) y la herramienta TiXL; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StreamDiffusion V2 ONNX (este) | 1,3B (base Wan2.1) | no disponible | ONNX | Apache-2.0 | Hugging Face, 0 descargas |
| StreamDiffusionV2 original | 1,3B (base Wan2.1) | no disponible | PyTorch | no disponible en la informacion | GitHub |
| Wan2.1-T2V-1.3B | 1,3B | no disponible | safetensors | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de exportación con cero descargas y cero likes: no hay validación comunitaria ni evidencia de uso en producción.
- Resolución limitada a 256x256, insuficiente para muchos flujos de producción final.
- No se documentan sesgos, comportamiento multilingüe ni evaluación de calidad.
- Riesgo de artefactos y alucinaciones visuales inherente a los modelos de difusión; no cuantificado por el autor.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el usuario debe verificar las licencias de las dependencias (TAEHV es MIT) y del modelo base Wan2.1.
- Requiere un runtime ONNX compatible y perfiles de caché KV ajustados al tamaño de lote (1 a 4); fuera de ese rango el comportamiento no está documentado.
- Sin información sobre latencia real ni throughput, lo que dificulta planificar despliegues en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/banidu-512/streamdiffusion-v2-onnx
- Repositorio StreamDiffusionV2: https://github.com/chenfengxu714/StreamDiffusionV2
- TiXL: https://github.com/foxnne/tixl
- Autoencoder TAEHV: https://huggingface.co/madebyollin/taehv
