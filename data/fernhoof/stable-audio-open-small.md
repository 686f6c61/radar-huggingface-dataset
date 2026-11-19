# fernhoof/stable-audio-open-small

## Resumen

Stable Audio Open Small (versión móvil optimizada en ONNX) es una conversión del modelo de síntesis de audio de Stability AI, empaquetado por el usuario fernhoof para su ejecución en dispositivos iOS y Android a través de ONNX Runtime Mobile. El modelo original, de 341 millones de parámetros, genera pasajes de audio estéreo de aproximadamente 10 segundos a 44,1 kHz a partir de prompts de texto en inglés, y esta variante lo redistribuye como tres grafos ONNX independientes con pesos almacenados en INT8 para reducir el tamaño de descarga a unos 0,5 GB.

La relevancia de esta ficha radica en que demuestra un patrón de despliegue on-device de modelos generativos de audio: separación en etapas (codificador de texto, paso de difusión y decodificador VAE), cuantización weight-only que preserva el grafo de cómputo en fp32 y verificación de integridad mediante sumas SHA-256. Es un artefacto de inferencia, no un modelo entrenado desde cero: la arquitectura, los pesos y la licencia provienen de Stability AI.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño total de 9,6 GB (que incluye artefactos adicionales no detallados en la model card, frente a los ~0,5 GB del conjunto de descarga descrito). La licencia es la Stability AI Community License, con restricciones para uso comercial según umbrales de facturación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Audio Open Small: T5 text encoder + Diffusion Transformer (DiT) con rectified flow + VAE decoder Oobleck; exportado como 3 grafos ONNX secuenciales |
| Parametros totales | 341 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto codificado con T5-base; longitud máxima no especificada) |
| Tipos de cuantizacion | Weight-only INT8 simétrica (per-output-channel en matrices 2D+, per-tensor en 1D), con `DequantizeLinear` a fp32; cómputo en fp32; existen versiones de referencia FP16 y FP32 |
| Idiomas soportados | en (inglés) |
| Licencia | Stability AI Community License (`stability-ai-community`) |
| Formato de pesos | ONNX con datos externos `.onnx.data`; JSON para embedder, tokenizer y configuración |

## Arquitectura y entrenamiento

El modelo base es Stable Audio Open Small, desarrollado por Stability AI en colaboración con Arm. La arquitectura se compone de un codificador de texto T5-base que produce embeddings de condicionamiento por cross-attention, un Diffusion Transformer (DiT) que ejecuta pasos de denoising con formulación de rectified flow, y un decodificador VAE Oobleck que transforma un latente de 64 canales en audio estéreo a 44,1 kHz con un factor de upsampling de 2048×. La generación se realiza en 8 pasos de rectified-flow pingpong, produciendo segmentos de aproximadamente 10,0 segundos (215 pasos latentes).

Esta variante no incluye información sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO o etapas de fine-tuning), por lo que esos datos deben consultarse en la model card del modelo base de Stability AI. La innovación técnica de este repositorio es de despliegue: la exportación en tres grafos independientes permite invocar repetidamente solo el paso de difusión, la cuantización INT8 weight-only reduce el tamaño de descarga a ~0,5 GB (frente a ~1,0 GB en FP16 y ~2,0 GB en FP32) sin alterar el grafo de cómputo, y se reporta una correlación de forma de onda superior a 0,98 respecto a la versión FP16, sin clipping ni NaN en las validaciones con onnxruntime.

## Capacidades

- Generación de audio a partir de texto (text-to-audio / text-to-soundscape) en inglés, con salida estéreo a 44,1 kHz.
- Producción de pasajes de ~10,0 segundos con transiciones sin costuras (seamless) según la model card.
- Condicionamiento por duración total mediante un embedder `seconds_total` (archivo `seconds_embedder.json`).
- Inferencia on-device en iOS y Android mediante ONNX Runtime Mobile, integrable en Flutter.
- Ejecución por etapas: el sampler invoca el grafo `dit_step.onnx` repetidamente (8 pasos), lo que permite controlar el coste computacional.
- Verificación de integridad de descargas mediante `checksums.sha256`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Síntesis de paisajes sonoros en apps móviles: integración en Flutter mediante ONNX Runtime Mobile para generar ambientes de ~10 s a partir de descripciones en inglés, con una descarga de ~0,5 GB adecuada para distribución en tiendas de aplicaciones.
- Generación de audio offline: al ejecutarse completamente en el dispositivo, permite crear efectos y ambientes sin conexión ni envío de prompts a servidores, útil en apps de bienestar, meditación o creación musical.
- Prototipado de experiencias interactivas: el control por pasos del DiT (`dit_step.onnx`) permite experimentar con el número de pasos de denoising para intercambiar calidad por latencia en dispositivos de gama baja.
- Pruebas de concepto de IA generativa de audio en investigación: los tres grafos separados y la configuración completa en `model_config.json` facilitan el análisis de cada componente (T5, DiT, VAE) de forma aislada.
- Generación de bucles y bases para producción musical: los segmentos seamless de 10 s pueden encadenarse como capas de ambiente en herramientas de DAW o apps de creación musical.
- Evaluación de pipelines de cuantización: el repositorio sirve como referencia para medir el impacto de la cuantización weight-only INT8 en modelos de audio, con métricas de correlación de forma de onda frente a FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de validación de la cuantización: ausencia de clipping y NaN, y correlación de forma de onda superior a 0,98 frente a la versión con almacenamiento FP16 sobre las mismas entradas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: no disponible de forma explícita; los pesos INT8 suman aproximadamente 506 MB (105 MB T5 + 326 MB DiT + 75 MB VAE), más el embedder de 4,2 MB y los archivos de tokenizer/configuración. El cómputo se ejecuta en fp32, por lo que el pico de memoria es superior al tamaño de los pesos.
- GPU recomendadas: no disponible. El destino declarado son dispositivos móviles iOS y Android con ONNX Runtime Mobile, no GPU de escritorio.
- Compatibilidad con GPU de consumo: no se documenta; al ser artefactos ONNX, podrían ejecutarse en GPU de consumo mediante ONNX Runtime, pero no hay datos de rendimiento publicados.
- Opciones de despliegue: ONNX Runtime Mobile (iOS/Android, vía Flutter); ONNX Runtime estándar para escritorio o servidor; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La generación requiere 8 pasos de rectified-flow pingpong, pero no se publican tiempos por dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Audio Open Small — Mobile Optimized (ONNX) | 341 M | no disponible | ~10 s estéreo a 44,1 kHz | Stability AI Community License | ONNX en HF (este repo) |
| Stable Audio Open Small (original, Stability AI) | 341 M | no disponible | ~10 s estéreo a 44,1 kHz | Stability AI Community License | Pesos originales en HF |
| Stable Audio Open (versión grande, Stability AI) | no disponible en la información proporcionada | no disponible | no disponible | Stability AI Community License | HF |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Solo admite prompts en inglés; no hay soporte multilingüe documentado.
- Los segmentos generados son de ~10,0 segundos, lo que limita la generación de piezas largas sin concatenación externa.
- La cuantización INT8 introduce más ruido que el almacenamiento FP16; la model card la considera aceptable para audio ambiental, pero puede no serlo para usos de alta fidelidad.
- Riesgo de alucinación sonora: al ser un modelo generativo, puede producir audio que no corresponde fielmente al prompt.
- No se documentan sesgos específicos del modelo base ni evaluaciones de seguridad en esta conversión.
- Licencia Stability AI Community License: incluye restricciones para uso comercial (umbrales de facturación y obligaciones de atribución) que deben revisarse en el enlace de licencia antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño total del repo (9,6 GB) excede el conjunto de descarga descrito (~0,5 GB), lo que sugiere artefactos adicionales no documentados; conviene verificar los checksums antes de usar.
- La autoría de la conversión corresponde a un usuario individual (fernhoof), no a Stability AI; no hay garantías de mantenimiento ni soporte oficial.
- No se documentan capacidades de tool calling, agentes ni entrada de audio, por lo que no es adecuado para tareas conversacionales o multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fernhoof/stable-audio-open-small
- Modelo base Stable Audio Open Small: https://huggingface.co/stabilityai/stable-audio-open-small
- Licencia Stability AI Community License: https://huggingface.co/stabilityai/stable-audio-open-small/blob/main/LICENSE.md
