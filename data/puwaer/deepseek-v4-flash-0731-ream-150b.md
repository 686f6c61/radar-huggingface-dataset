# puwaer/DeepSeek-V4-Flash-0731-ream-150b

## Resumen

DeepSeek-V4-Flash-0731-ream-150b es un checkpoint comprimido del modelo oficial DeepSeek-V4-Flash-0731 de DeepSeek, producido por el usuario puwaer mediante la técnica REAM (Router-weighted Expert Activation Merging). El objetivo es reducir la huella de memoria del modelo base sin recurrir a fine-tuning, destilación ni pasos de gradiente: los expertos enrutados se reducen de 256 a 132 por capa fusionando los expertos de baja saliencia en los centroides supervivientes, en una única pasada de calibración. El resultado es un checkpoint que pasa de 156 GiB a 79 GiB, manteniendo las 43 capas decodificadoras y los 6 expertos activos por token.

El modelo conserva la arquitectura MoE original y el formato de prompt del modelo base, incluyendo el modo de razonamiento visible (thinking) activado por defecto con niveles de esfuerzo configurable. La compresión se realizó con la herramienta `moe-compress` y los pesos se sirven con SGLang en formato MXFP4 para GPUs Hopper. La licencia MIT permite uso comercial sin restricciones.

Es relevante para equipos que necesitan desplegar un modelo de razonamiento y código de gran tamaño en infraestructura limitada, sacrificando algo de rendimiento en tareas matemáticas a cambio de una reducción de casi el 50% en el tamaño del checkpoint y la posibilidad de ejecutarlo en una sola GPU de 96 GB durante la compresión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), 43 capas decodificadoras |
| Parametros totales | 150.128.549.111 (150B) |
| Parametros activos | 6 expertos activos por token (de 132 por capa) |
| Longitud de contexto | no disponible (evaluado con contexto de 4096 tokens) |
| Tipos de cuantizacion | MXFP4 (expertos), FP8 (tags del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una variante comprimida de DeepSeek-V4-Flash-0731, un MoE denso con 43 capas decodificadoras, 256 expertos enrutados por capa en el original y 6 expertos activos por token. La compresión REAM reduce la población de expertos a 132 por capa fusionando expertos de baja saliencia en los supervivientes, ponderando la fusión por la activación del router. No hay fine-tuning, destilación ni gradientes: es una transformación en una sola pasada basada en estadísticas de calibración.

La calibración se realizó con el script de `moe-compress` sobre un conjunto mixto de 30 % matemáticas y 70 % código (sin datos C4), con 8192 muestras de activación y longitud de secuencia 512. El proceso emplea streaming de capas, lo que permite comprimir un checkpoint de 156 GiB en una sola GPU de 96 GB. Los módulos de predicción multi-token (MTP `mtp.0/1/2`) del modelo base se han eliminado, por lo que la decodificación especulativa basada en MTP no está disponible; los motores que busquen esos pesos caen en decodificación ordinaria.

La calidad de reconstrucción medida durante la compresión sobre una sonda de 4096 tokens arroja un coseno medio de 0.9047 (mínimo 0.7826) y un error L2 relativo medio de 0.2991 entre la salida del bloque MoE reconstruido y el original, promediado sobre las 43 capas.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento visible (thinking) activado por defecto y tres niveles de esfuerzo (`low`, `high`, `max`).
- Generación de código y solución de problemas de programación, con resultados en HumanEval+ y MBPP+.
- Tool calling y mensajes de sistema, desarrollador y recordatorios de última hora mediante el codificador `encoding/encoding_dsv4.py` copiado del repositorio base (el `chat_template.jinja` no implementa estas funciones).
- Razonamiento matemático básico, aunque con pérdidas significativas respecto al base en GSM8K y MATH-500.
- Capacidades multilingües no documentadas en la información disponible.
- Sin soporte de visión ni audio.

## Casos de uso

- **Generación de código en entornos de recursos limitados**: el checkpoint de 79 GiB permite servir un modelo de razonamiento y código en infraestructura con 2 GPUs de 96 GB, cuando el base requería más del doble de memoria. Adecuado para pipelines de CI/CD con generación de código asistida.
- **Asistencia de razonamiento en entornos educativos**: con el modo thinking activado, puede generar explicaciones paso a paso de problemas de matemáticas y lógica, aunque con menor precisión que el base en tareas de matemáticas (GSM8K 0.6922).
- **Chat conversacional con contexto de herramientas**: el codificador base soporta tool calling, por lo que puede integrarse en asistentes que llaman a funciones externas (APIs, bases de datos) siempre que se use `encoding_v4.py` en lugar de la plantilla.
- **Despliegue en servidores con memoria de checkpoint limitada**: al reducir el checkpoint a la mitad, se puede desplegar en nodos con 2 GPU de 96 GB o 4 de 48 GB, donde el modelo base requería más espacio.
- **Evaluación de técnicas de compresión de MoE**: el checkpoint sirve como referencia para comparar REAM frente a otras técnicas de poda o fusión de expertos, con métricas de reconstrucción documentadas.
- **Prototipado de agentes de código**: con el modo `thinking` y la capacidad de razonamiento multi-paso, se puede usar para tareas de depuración o refactorización de código en entornos de desarrollo, sacrificando algo de precisión por el menor coste de despliegue.

## Benchmarks y rendimiento

La model card incluye la siguiente tabla de benchmarks comparando con el modelo base y otras compresiones de la misma familia. Todos los resultados son greedy (n=1), contexto de 4096 tokens, `enable_thinking=false`, servidos con SGLang.

| Modelo | Expertos | Tamano | GSM8K | MATH-500 | HumanEval+ | MBPP+ | Media |
|---|---|---|---|---|---|---|---|
| base 284b | 256 | 156 GiB | 0.9484 | 0.7060 | 0.8720 | 0.7407 | 0.8168 |
| REAP 200b | 178 | 104 GiB | 0.9401 | 0.6880 | 0.8720 | 0.7407 | 0.8102 |
| REAM 200b | 178 | 104 GiB | 0.8620 | 0.6080 | 0.8841 | 0.7698 | 0.7810 |
| REAP 150b | 132 |  79 GiB | 0.9295 | 0.7140 | 0.8963 | 0.7593 | 0.8248 |
| **REAM 150b** | 132 |  79 GiB | **0.6922** | **0.5020** | **0.8537** | **0.7328** | **0.6952** |

Diferencia con el modelo base, en puntos:

| GSM8 | MATH | HumanEval+ | MBPP+ | media |
|---|---|---|---|---|
| -25.63 | -20.40 | -1.83 | -0.79 | -12.16 |

El modelo pierde más de 25 puntos en GSM8 y 20 en MATH respecto al base, pero solo 1.83 y 0.79 en HumanEval+ y MBPP+. La degradación se concentra en tareas de razonamiento matemático, mientras que el código se mantiene casi intacto.

## Requisitos de hardware

- Checkpoint de 79 GiB en formato safetensors, lo que requiere al menos ~80 GB de VRAM para cargar los pesos en memoria sin cuantización adicional.
- La model card verifica el despliegue con SGLang en configuraciones de tensor parallelism (TP) de 2 nodos con GPU de 96 GB (Hopper), usando el runner MoE `flashinfer_mxfp4` para el layout MXFP4 de expertos.
- En GPUs consumer (RTX 4090, 24 GB) no cabe el checkpoint completo; se necesitaría cuantización adicional (por ejemplo, GGUF o FP4) no documentada en el repositorio.
- Opciones de despliegue verificadas: SGLang con `--moe-runner-backend flashinfer_mxfp4`. En Hopper, el modo `auto` puede caer en un path Triton que falla con los pesos empaquetados, por lo que hay que forzar el runner.
- Latencia y throughput no documentados en la información disponible.
- El modelo no incluye módulos MTP, por lo que no se puede usar decodificación especulativa basada en MTP; los motores que la busquen caerán en decodificación ordinaria.

## Comparativa con modelos similares

| Modelo | Expertos | Param | Checkpoint | GSM8 | MATH500 | HumanEval+ | MBPP+ | Licencia |
|---|---|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 256 | 284B | 156 GiB | 0.9484 | 0.7060 | 0.8720 | 0.7407 | MIT |
| REAP 200b | 178 | 200B | 104 GiB | 0.9401 | 0.6880 | 0.8720 | 0.7407 | MIT |
| REAM 200b | 178 | 200B | 104 GiB | 0.8620 | 0.6080 | 0.8841 | 0.7698 | MIT |
| REAP 150b | 132 | 150B | 79 GiB | 0.9295 | 0.7140 | 0.8963 | 0.7593 | MIT |
| **REAM 150b (este)** | 132 | 150B | 79 GiB | 0.6922 | 0.5020 | 0.8537 | 0.7328 | MIT |

Frente a la variante REAP del mismo tamaño (132 expertos, 79 GiB), este modelo pierde 23.7 puntos en GSM8 y 21.2 en MATH500, pero mantiene un rendimiento similar en código. La compresión REAM es más agresiva en razonamiento matemático que REAP. El modelo base es superior en todas las tareas, pero ocupa el doble de espacio.

## Limitaciones y advertencias

- **Pérdida significativa de rendimiento en matemáticas**: GSM8 cae un 25.62 % y MATH500 un 20.40 % respecto al base; no es recomendable para tareas de razonamiento matemático de alta precisión.
- **Sin decodificación especulativa**: los módulos MTP (`mtp.0/1/2`) se han eliminado, por lo que no se puede usar la decodificación especulativa basada en MTP; motores que la busquen volverán a decodificación ordinaria.
- **Sesgos y alucinaciones**: no se han documentado evaluaciones de sesgos ni de riesgo de alucinación en la información disponible; el modelo puede producir contenido inexacto en tareas de razonamiento, especialmente en matemáticas.
- **Idiomas**: no se ha documentado la cobertura de idiomas, por lo que el comportamiento fuera del inglés no está verificado.
- **Contexto**: la ventana de contexto máxima no está documentada; los benchmarks se realizaron con 4096 tokens, por lo que el comportamiento con contextos largos es desconocido.
- **Despliegue específico**: en GPUs Hopper es necesario forzar el runner MoE MXFP4; el modo automático puede fallar con los pesos empaquetados. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puwaer/DeepSeek-V4-Flash-0731-ream-150b
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de compresión: https://github.com/puwaer/moe-expert-compress
- Informe técnico REAM: arxiv:2510.13999
- Informe técnico de compresión (REAP/REAM): arxiv:2604.04356
- Modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- API y playground (Fireworks AI): https://fireworks.ai/models/deepseek-ai/deepseek-v4-flash-0731
