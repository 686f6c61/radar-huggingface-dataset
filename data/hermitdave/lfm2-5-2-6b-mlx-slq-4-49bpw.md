# hermitdave/LFM2.5-2.6B-MLX-SLQ-4.49bpw

## Resumen

LFM2.5-2.6B-MLX-SLQ-4.49bpw es una versión cuantizada del modelo LiquidAI/LFM2.5-2.6B, publicada por el usuario hermitdave. No se trata de un modelo entrenado desde cero, sino de un checkpoint empaquetado mediante la técnica SLQ (Statistically-Lossless Quantization) a 4,49 bits por peso (bpw), con el objetivo de reducir el espacio en disco y la memoria necesaria para inferencia en Apple Silicon sin degradar apreciablemente la calidad del modelo original. El resultado es un artefacto de aproximadamente 1,9 GiB frente a los ~5,0 GiB del base en BF16, es decir, unas 2,6 veces más pequeño.

El modelo base pertenece a la familia LFM2 de LiquidAI, una arquitectura híbrida que combina 22 bloques de convolución corta con 8 bloques de atención completa, distribuidos en 30 capas. Según la model card, el modelo original declara 2,69B parámetros y una ventana de contexto de 128K tokens, aunque la información de safetensors del repositorio cuantizado indica 642.448.384 parámetros, cifra que probablemente refleja solo un subconjunto de tensores o un recuento parcial y no el total real del modelo.

La relevancia de esta ficha radica en que muestra un flujo de cuantización no uniforme por capas orientado a inferencia eficiente en hardware de Apple, con validación empírica de fidelidad (ratio de perplejidad, divergencia KL simétrica y recuperación en tareas zero-shot). Es un ejemplo práctico de cómo reducir el coste de despliegue de un modelo de ~2,7B en equipos con memoria unificada limitada, a cambio de depender de MLX y de código remoto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (22 bloques de convolución corta + 8 bloques de atención completa), 30 capas |
| Parámetros totales | 2,69B según la model card; 642.448.384 según safetensors del repo cuantizado (dato no coincidente) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | SLQ no uniforme afín por capa, group_size=128, objetivo 4,50 bpw, medido 4,4948 bpw |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetado MLX (mlx-packed-affine, QuantizedLinear) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B emplea una arquitectura híbrida en la que la mayoría de las capas (22 de 30) usan convolución corta en lugar de atención, reservando la atención completa para 8 bloques. Este diseño busca reducir el coste computacional y de memoria frente a un transformer denso equivalente, manteniendo capacidad de modelado de contexto largo. La ventana declarada es de 128K tokens.

Sobre el proceso de entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí está documentado es el proceso de cuantización del checkpoint: una primera etapa GPTQ que genera pesos pseudo-cuantizados por capa a anchos de 2 a 8 bits; una segunda etapa que construye una base de datos de error relativo de Frobenius por capa; una tercera etapa de búsqueda con un asignador greedy heurístico por capa con objetivo EAR ≥ 0,99; y una cuarta etapa de empaquetado en un checkpoint MLX con capas QuantizedLinear. La calibración se realizó con FineWeb-Edu (1.048.576 tokens, 32 secuencias de 1024, longitud de secuencia 512). El checkpoint requiere `trust_remote_code=True` porque incluye un archivo de arquitectura personalizado (`slq_model.py`).

## Capacidades

- Generación de texto conversacional y continuaciones de prompt.
- Razonamiento general y respuesta a preguntas, heredado del modelo base.
- Soporte multilingüe limitado: la model card solo declara inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento (thinking).
- Inferencia optimizada para Apple Silicon mediante MLX y `quantized_matmul` fusionado.

## Casos de uso

- Prototipado local en Mac: cargar el checkpoint con `mlx_lm.generate` para probar prompts y flujos conversacionales en un portátil con memoria unificada, aprovechando los ~1,9 GiB del artefacto frente a los ~5,0 GiB del BF16.
- Generación de texto en aplicaciones de escritorio para macOS: integrar el modelo en una app nativa que use MLX como backend, con latencia baja gracias a la cuantización a 4,49 bpw y al uso de kernels fusionados.
- Experimentación con cuantización no uniforme: usar este checkpoint como referencia para comparar la fidelidad de SLQ frente a cuantizaciones uniformes de 4 bits en tareas como ARC, HellaSwag o Winogrande.
- Evaluación de pipelines de inferencia eficiente: servir el modelo en un entorno de pruebas con contexto largo (hasta 128K tokens) para medir consumo de memoria y throughput en Apple Silicon.
- Base para ajuste fino ligero o evaluación académica: al estar bajo Apache 2.0 y en formato MLX, puede servir para experimentos de investigación que requieran un modelo pequeño y de licencia permisiva.
- Generación de borradores y resúmenes en inglés: tareas de texto donde la fidelidad del cuantizado (ratio de perplejidad 1,0456) es suficiente y no se requiere el modelo completo en BF16.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la validación de fidelidad de la cuantización, no a benchmarks absolutos del modelo base frente a otros modelos. Se midieron con un límite de 400 ejemplos por tarea.

| Métrica | Valor |
|---|---|
| Ratio de perplejidad (FineWeb-Edu, seq 512) | 1,0456 |
| KLD simétrica (FineWeb-Edu, seq 512) | 4,31 |
| Recuperación media zero-shot (4 tareas, n=400) | 1,0128 |
| Veredicto de pérdida en tareas | Sí (task-lossless) |

| Tarea | BF16 | SLQ 4,49 bpw | Recuperación | IC 95% |
|---|---|---|---|---|
| arc_challenge | 0,3600 | 0,3850 | 1,0694 | [-0,0068, +0,0568] |
| arc_easy | 0,5925 | 0,5800 | 0,9789 | [-0,0439, +0,0189] |
| hellaswag | 0,4175 | 0,4100 | 0,9820 | [-0,0238, +0,0088] |
| winogrande | 0,4800 | 0,4900 | 1,0208 | [-0,0304, +0,0504] |

No se han publicado resultados de benchmarks del modelo base frente a modelos similares en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~1,9 GiB para el checkpoint SLQ empaquetado; ~5,0 GiB para el base en BF16.
- Hardware objetivo: Apple Silicon exclusivamente (MLX ≥ 0,27). No funciona en GPU NVIDIA ni en CPU x86 mediante este formato.
- Cabe en cualquier Mac con memoria unificada de 8 GB o superior, siempre que se reserve espacio para el sistema y el runtime de MLX.
- Opciones de despliegue: `mlx-lm` (comando `python -m mlx_lm.generate`); no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/hardware | Notas |
|---|---|---|---|---|---|
| hermitdave/LFM2.5-2.6B-MLX-SLQ-4.49bpw | 2,69B (declarado) | 128K | Apache 2.0 | MLX, Apple Silicon | Cuantizado a 4,49 bpw, ~1,9 GiB |
| LiquidAI/LFM2.5-2.6B (base) | 2,69B | 128K | Apache 2.0 | Safetensors BF16 | Modelo original, ~5,0 GiB |
| Otras cuantizaciones MLX del mismo base | 2,69B | 128K | Apache 2.0 | MLX | No disponibles en la información proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está documentado.
- Requiere `trust_remote_code=True` por el archivo de arquitectura personalizado `slq_model.py`, lo que implica ejecutar código del autor del repositorio.
- Dependencia exclusiva de MLX y Apple Silicon: no es portable a CUDA, ROCm ni CPU estándar sin reconversión.
- El recuento de parámetros de safetensors (642.448.384) no coincide con el declarado en la model card (2,69B); conviene verificar antes de usarlo en producción.
- Los benchmarks de fidelidad se limitaron a 400 ejemplos por tarea, frente a los ~15.500 de los conjuntos completos, por lo que los intervalos de confianza son amplios.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la documentación.
- Sesgos del modelo base no documentados; la calibración con FineWeb-Edu puede introducir sesgos de dominio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el código remoto deben revisarse por separado.
- No se documentan capacidades de tool calling, agentes ni visión; no asumirlas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/LFM2.5-2.6B-MLX-SLQ-4.49bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repositorio de la herramienta de cuantización: https://github.com/hermitdave/slq-mlx
- NousResearch (Hermes Agent): https://nousresearch.com
