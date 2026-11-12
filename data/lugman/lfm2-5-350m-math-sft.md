# lugman/LFM2.5-350M-Math-SFT

## Resumen

LFM2.5-350M-Math-SFT es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de pequeño tamano (354,5 millones de parámetros) orientado, por el nombre del repositorio, a tareas de matemáticas, aunque la model card no documenta el dataset de entrenamiento ni los objetivos concretos del ajuste.

El modelo hereda la arquitectura LFM2 de LiquidAI, una familia de modelos compactos disenada para inferencia eficiente en dispositivos con recursos limitados. Al estar construido sobre una base de 350M de parámetros, su interes principal reside en el despliegue en entornos con poca VRAM, edge computing y experimentacion rapida con tecnicas de ajuste fino (en este caso, mediante Unsloth y TRL).

La relevancia de esta ficha es limitada en terminos de evidencia: el repositorio no incluye resultados de benchmarks, no detalla la composicion del dataset de SFT ni documenta el proceso de entrenamiento mas alla de mencionar el uso de Unsloth. Cualquier evaluacion practica debe realizarse por cuenta del usuario antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer compacto de LiquidAI; detalles especificos no disponibles) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via transformers/bitsandbytes, no confirmado por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base LiquidAI/LFM2.5-350M, que pertenece a la familia LFM2 de LiquidAI. No se dispone de informacion detallada sobre la arquitectura interna (numero de capas, dimensiones, tipo de atencion, uso de SSM o attention lineal) en la informacion proporcionada; la model card unicamente etiqueta el modelo con `lfm2` y `transformers`.

El entrenamiento consistio en un SFT (supervised fine-tuning) realizado con Unsloth y la libreria TRL de Hugging Face, segun indica el autor, que afirma haber logrado un entrenamiento "2x mas rapido" con Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF/DPO ni hiperparametros utilizados. Tampoco se documenta si el ajuste se realizo con cuantizacion (QLoRA) o a precision completa.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM2.5-350M.
- Ajuste orientado a tareas matematicas segun el nombre del repositorio (`Math-SFT`), aunque no se documenta que tipo de problemas cubre.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion con ajuste fino en hardware modesto: el tamano de 350M permite reproducir el pipeline de SFT con Unsloth en una unica GPU consumer, sirviendo como plantilla para otros ajustes.
- Prototipado de asistentes matematicos en ingles: para resolver problemas aritmeticos o algebraicos sencillos en entornos de demo, con la advertencia de que no hay benchmarks que validen su precision.
- Evaluacion comparativa de tecnicas de SFT: util como baseline para comparar contra el modelo base LiquidAI/LFM2.5-350M y medir el efecto del ajuste.
- Despliegue en edge computing: con 354M de parametros, cabe en dispositivos con poca memoria y puede ejecutarse con llama.cpp u Ollama si se generan pesos GGUF (no incluidos en el repo).
- Generacion de texto de bajo coste en ingles: para tareas de completado simple donde la latencia y el coste importan mas que la calidad.
- Fine-tuning posterior (continued pretraining o DPO): al ser Apache 2.0 y de pequeno tamano, sirve como punto de partida para ajustes especializados adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en FP16 (354M parametros x 2 bytes), alrededor de 0,35 GB en int8 y menos de 0,25 GB en int4 (estimacion teorica; no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en GPUs de gama baja e incluso en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM.
- Opciones de despliegue: transformers (confirmado por la libreria del repo), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no incluidos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/LFM2.5-350M-Math-SFT | 354M | no disponible | apache-2.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M aprox. | no disponible | no disponible en esta ficha | Hugging Face |
| Qwen2.5-0.5B | 500M aprox. | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| SmolLM2-360M | 360M aprox. | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en tareas matematicas.
- Dataset de SFT no documentado: se desconoce la composicion, el tamano y la calidad de los datos de entrenamiento, lo que impide evaluar sesgos introducidos.
- Riesgo de alucinacion: como todo modelo de 350M, la precision en razonamiento matematico y factual es limitada.
- Idioma: solo soporta ingles segun el campo `language: en`; no se garantiza un rendimiento aceptable en castellano.
- Contexto: no se documenta la longitud de contexto, lo que dificulta planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Model card minimalista: no incluye informacion sobre hiperparametros, evaluacion ni limitaciones conocidas.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Math-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
