# primitive-ai/K2-Horizon-MoVA-36B-A4B-NVFP4

## Resumen

K2-Horizon-MoVA-36B-A4B-NVFP4 es una cuantización NVFP4 de 4 bits del modelo K2-Horizon-MoVA-36B-A4B, desarrollada por primitive-ai. El modelo base, creado por el Institute of Foundation Models (IFM), utiliza una arquitectura Mixture of Value Attention (MoVA) con aproximadamente 36.000 millones de parámetros totales y 4.000 millones de parámetros activos por token. Esta versión cuantizada reduce el peso a 36,7 GB, un 50% menos que la versión BF16 y un 24% menos que la FP8 oficial, manteniendo un rendimiento de conocimiento prácticamente idéntico.

La relevancia de este modelo radica en que permite ejecutar el modelo completo en una sola tarjeta gráfica de 96 GB sin necesidad de paralelismo de tensores, lo que simplifica el despliegue en servidores locales. Además, es la primera cuantización NVFP4 de este modelo y utiliza el formato compressed-tensors, compatible con vLLM a través de una compilación nightly. La longitud de contexto verificada es de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Value Attention (MoVA), mezcla de expertos (MoE) |
| Parametros totales | 37.444.792.020 (según safetensors) |
| Parametros activos | 4.000 millones (4B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits) en las 13.500 proyecciones de expertos enrutados; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base K2-Horizon-MoVA-36B-A4B emplea una arquitectura Mixture of Value Attention (MoVA), una variante de mezcla de expertos (MoE) en la que las proyecciones de valor se enrutan dinámicamente. Según la documentación de primitive-ai, la cuantización NVFP4 se aplica exclusivamente a las 13.500 proyecciones de expertos enrutados, mientras que el resto de los pesos se mantienen en BF16. El proceso de cuantización utiliza redondeo al más cercano (round-to-nearest) y calibración únicamente para observar las escalas de activación NVFP4, sin kernels personalizados.

No se han publicado datos sobre los datos de entrenamiento, el número de tokens o el uso de RLHF/DPO en la información disponible. La cuantización se realizó con la biblioteca compressed-tensors y la lista de módulos ignorados resuelve a 3.408 módulos, el mismo recuento que la configuración FP8 oficial de IFM.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking mode) mediante etiquetas específicas: `<ifm|think>` para esfuerzo alto, `<ifm|think_fast>` para medio y `<ifm|think_faster>` para bajo.
- Soporte de tool calling / function calling, aunque con una pérdida de 4,2 puntos respecto a la versión FP8 oficial.
- Soporte de agentes y razonamiento multi-paso, apto para tareas que requieren planificación y ejecución secuencial.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se mencionan capacidades de visión o audio; el modelo es exclusivamente de texto.

## Casos de uso

- Despliegue de razonamiento en servidor local: gracias a su tamaño de 36,7 GB y a que cabe en una sola GPU de 96 GB con TP=1, es adecuado para entornos donde no se dispone de múltiples tarjetas. El comando de vLLM con `--reasoning-parser k2_horizon` permite servir el modelo con una configuración mínima.
- Asistentes conversacionales con contexto largo: con 32.768 tokens de ventana y 273.920 tokens de KV, puede gestionar conversaciones multi-turno extensas sin perder el hilo de la conversación.
- Automatización de procesos con tool calling: soporta function calling y puede integrarse en pipelines de automatización. Para cargas agénticas críticas se recomienda la variante FP8 oficial por el gap de 4,2 puntos en tool calling.
- Procesamiento por lotes en producción: las pruebas de la model card se realizaron con concurrencia 32 y una tasa de finalización del 96,0%, lo que sugiere viabilidad para servir múltiples peticiones simultáneas en una sola GPU.
- Investigación en cuantización: es la primera NVFP4 del modelo y sirve como referencia para estudiar el impacto de la cuantización 4-bit en razonamiento y tool calling, especialmente en arquitecturas MoE.
- Generación de documentación y análisis técnico: con su modo de razonamiento de esfuerzo configurable, puede producir explicaciones detalladas y análisis de código, aunque se debe validar la salida por la pérdida en tool calling.

## Benchmarks y rendimiento

Los datos disponibles provienen del dataset PQE-1.2 de primitive-ai, con 1.170 ítems de conocimiento, temperatura 0.6, top_p 0.95, top_k 20, thinking activado, presupuesto de 16.384 tokens y concurrencia 32. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K).

| Build | Tamaño | Knowledge (strict) | Tool calling | Completion | Mean out / median |
|---|---|---|---|---|---|
| IFM BF16 | 74.92 GB | 85.94 ±0.66 (n=2) | 71.83 ±1.04 (n=3) | 96.1% | 1170 / 208 |
| IFM FP8 | 48.39 GB | 86.84 ±0.48 (n=2) | 72.67 ±0.29 (n=3) | 95.9% | 1184 / 211 |
| primitive-ai NVFP4 | 36.74 GB | 86.13 ±0.95 (n=3) | 68.50 ±2.18 (n=3) | 96.0% | 1216 / 216 |

En conocimiento, las tres variantes forman un solo grupo: la diferencia entre medias es menor que la variación run-to-run del propio conjunto de pruebas. En tool calling, la diferencia de 4,2 puntos entre el NVFP4 y el FP8 oficial es real y está fuera del ruido, con una varianza mayor en la versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: 88.8 GB residentes en una RTX PRO 6000 Blackwell, según la verificación de primitive-ai.
- GPU recomendada: RTX PRO 6000 Blackwell o equivalente con 96 GB de VRAM.
- No cabe en GPUs de consumo de 24 GB; se necesitan al menos 96 GB para servir con vLLM y TP=1. Existen builds GGUF y MLX 4-bit, pero no sirven en vLLM.
- Opciones de despliegue: vLLM nightly (main) con `--trust-remote-code` y `--reasoning-parser k2_horizon`; también es compatible con la librería transformers.
- Latencia y throughput: no se han publicado mediciones de latencia. Las pruebas se realizaron con concurrencia 32 y una tasa de finalización del 96,0%.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Tamaño | Tool calling | Licencia |
|---|---|---|---|---|---|---|
| IFM/K2-Horizon-MoVA-36B-A4B (BF16) | ~37.4B | 4B | 32K | 74.92 GB | 71.83 | Apache 2.0 |
| IFM/K2-Horizon-MoVA-36B-A4B-FP8 | ~37.4B | 4B | 32K | 48.39 GB | 72.67 | Apache 2.0 |
| primitive-ai/K2-Horizon-MoVA-36B-A4B-NVFP4 | ~37.4B | 4B | 32K | 36.74 GB | 68.50 | Apache 2.0 |

## Limitaciones y advertencias

- El tool calling es 4,2 puntos inferior al FP8 oficial y con mayor varianza (2.18 frente a 0.29). Para cargas agénticas se recomienda usar la variante FP8 hasta que se publique el rebuild calibrado.
- El soporte de K2-Horizon en vLLM se fusionó en main el 3 de septiembre de 2026 y no está en una release; se debe usar una compilación nightly.
- El reasoning effort se configura a nivel de servidor. Si el cliente envía un esfuerzo distinto al configurado, las etiquetas no coinciden y el razonamiento no se separa en `message.reasoning`.
- La cuantización NVFP4 usa round-to-nearest sin calibración GPTQ. Hay un rebuild calibrado en progreso que podría cerrar el gap en tool calling.
- No se han publicado benchmarks estándar; los únicos datos de rendimiento disponibles son del dataset PQE-1.2, propiedad de primitive-ai.
- Los idiomas soportados no están especificados, por lo que no se puede garantizar un comportamiento multilingüe.
- El modelo es reciente (creado el 4 de septiembre de 2026) y su ecosistema de herramientas aún está en desarrollo.

## Enlaces

- HuggingFace: https://huggingface.co/primitive-ai/K2-Horizon-MoVA-36B-A4B-NVFP4
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Variante FP8 oficial: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B-FP8
- Pull request de vLLM (soporte K2-Horizon): https://github.com/vllm-project/vllm/pull/55063
- Dataset PQE-1.2: https://huggingface.co/datasets/primitive-ai/pqe
- Press release de IFM: https://ifm.ai/k2/press-release/
- Web de primitive-ai: https://primitive.com
