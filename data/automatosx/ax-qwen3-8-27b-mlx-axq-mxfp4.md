# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP4

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-27B, desarrollado por AutomatosX mediante la herramienta AXQuant (AXQ). Está diseñado específicamente para ejecutarse en Apple Silicon, aprovechando la memoria unificada de los Macs para servir un modelo de visión-lenguaje de 27 mil millones de parámetros con una huella de almacenamiento reducida a aproximadamente 16,6 GB. El checkpoint emplea cuantización mixta de precisión MXFP4, con la mayor parte de los tensores en 4 bits, una fracción en 8 bits y los tensores protegidos en BF16, logrando un BPW medido de 4,8441.

El modelo base, Qwen3.8-27B, es un modelo denso de 27B con arquitectura Qwen3_5ForConditionalGeneration, que incluye un componente de visión y una ventana de contexto nativa de 262 144 tokens. Esta versión cuantizada conserva el sidecar de visión en BF16 (460,73 millones de parámetros) y el texto cuantizado, lo que permite ejecutar tareas de generación de texto y comprensión de imágenes en equipos Apple con recursos limitados. Es relevante ahora porque ofrece una vía práctica para desplegar un VLM de última generación en hardware de consumo, sin necesidad de GPUs dedicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa) |
| Parametros totales | 27,36B lógicos (texto) + 460,73M (sidecar de visión) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (configurado; límite práctico según memoria unificada) |
| Tipos de cuantizacion | MXFP4 mixta: 4-bit (89,01%), 8-bit (9,29%), BF16 (1,69%) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX Safetensors (no PyTorch ni GGUF) |

## Arquitectura y entrenamiento

Este checkpoint no es un modelo entrenado desde cero, sino una conversión cuantizada del modelo BF16 original Qwen/Qwen3.8-27B. La cuantización se realiza con AXQuant 1.8.1, que asigna diferentes precisiones a distintos tensores según su sensibilidad: el 89,01% de los parámetros principales se cuantizan a 4 bits, el 9,29% a 8 bits y el 1,69% se mantiene en BF16 como protección. El sidecar de visión (333 tensores, 460,73M parámetros) se preserva íntegramente en BF16. No se ha aplicado calibración con datos; la asignación se basa en priors de arquitectura.

El modelo base es un VLM denso con arquitectura Qwen3_5, que soporta razonamiento configurable y contexto largo. La cuantización no introduce cambios arquitectónicos, solo reduce la precisión numérica. No se incluye el módulo de predicción multi-token (MTP), por lo que no hay aceleración por ese mecanismo. El checkpoint se sirve mediante MLX-LM o AX Engine, este último como autoridad del contrato de runtime AXQ.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo (hasta 262K tokens).
- Razonamiento configurable: el modelo base permite activar o desactivar el modo de razonamiento explícito.
- Comprensión de imágenes (visión) gracias al sidecar de visión en BF16, aunque la compatibilidad con MLX-LM estándar no está garantizada.
- Generación de código y asistencia en tareas de programación, según las capacidades del modelo base.
- Soporte para tareas de investigación y trabajo profesional de largo alcance (long-horizon agentic tasks), según la documentación del modelo base.
- Capacidades multilingües: no documentadas en la información disponible, aunque el modelo base de Qwen suele ser multilingüe.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede gestionar conversaciones con contexto largo gracias a su ventana de 262K tokens, ejecutándose completamente en el dispositivo sin conexión a internet.
- Análisis de documentos con imágenes: al incluir el sidecar de visión, permite extraer información de capturas, diagramas o documentos escaneados, útil en entornos de oficina o investigación.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden probar un VLM de 27B en su MacBook o Mac Studio sin necesidad de infraestructura en la nube, usando MLX-LM.
- Generación de código asistida en entornos aislados: el modelo base es competente en tareas de programación, y la versión cuantizada permite ejecutarlo en equipos sin GPU dedicada, ideal para desarrollo offline.
- Investigación sobre cuantización y eficiencia: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta en la calidad de salida de modelos grandes.
- Despliegue en edge computing con Apple Silicon: para aplicaciones que requieren inferencia local con privacidad de datos, como procesamiento de documentos confidenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay claim de retención de calidad frente al modelo BF16 o a un baseline uniforme, y que no se han realizado evaluaciones comparativas.

## Requisitos de hardware

- Memoria unificada: los pesos ocupan aproximadamente 16,6 GB (descarga completa 16,59 GB). Se recomienda un Mac con al menos 32 GB de memoria unificada para dejar margen al runtime y al contexto.
- GPU: no requiere GPU dedicada; funciona en cualquier chip Apple Silicon (M1, M2, M3, M4) gracias a MLX.
- Ejecución: compatible con MLX-LM (versión registrada 0.31.3) y AX Engine (versión no registrada en la model card).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Precision | Tamano (aprox.) | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-MXFP4 (este) | MXFP4 mixta (4/8/BF16) | 16,6 GB | 262K | Apache-2.0 | MLX Safetensors |
| AX-Qwen3.8-27B-MLX-AXQ-6bit | AXQ 6-bit (mayor precision) | Mayor que 16,6 GB | 262K | Apache-2.0 | MLX Safetensors |
| AX-Qwen3.8-27B-MLX-AXQ-4bit | AXQ 4-bit (menor precision) | Menor que 16,6 GB | 262K | Apache-2.0 | MLX Safetensors |
| Qwen/Qwen3.8-27B (BF16 original) | BF16 | ~55 GB | 262K | Apache-2.0 | PyTorch / Safetensors |

La comparativa se limita a los hermanos de cuantización y al modelo base, ya que no hay datos de rendimiento publicados para este checkpoint. El modelo base BF16 requiere aproximadamente el triple de memoria y no está optimizado para Apple Silicon.

## Limitaciones y advertencias

- Es una versión de desarrollo: la model card lo etiqueta como "development" y no certifica la retención de calidad frente al modelo original.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que el impacto de la cuantización en tareas reales es desconocido.
- El sidecar de visión puede no ser totalmente compatible con MLX-LM estándar; se recomienda usar AX Engine para garantizar el contrato de runtime.
- No incluye módulo MTP, por lo que no hay aceleración por predicción multi-token.
- Solo funciona en Apple Silicon; no es compatible con GPUs NVIDIA ni con formatos GGUF.
- La cuantización mixta puede introducir degradación en tareas de alta precisión numérica (matemáticas, razonamiento complejo).
- No se han documentado los idiomas soportados ni posibles sesgos del modelo base.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP4)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio AXQuant (GitHub)](https://github.com/defai-digital/axquant)
- [Certificado Tier 1 del checkpoint](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen38-27b-axq-mxfp4-tier1.md)
- [Colección de modelos AutomatosX](https://huggingface.co/AutomatosX/collections)
