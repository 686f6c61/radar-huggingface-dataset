# petro-popov/coilstellaration-mlp-v1

## Resumen

CoilStellaration `fixed_shape` MLP Baseline (v1) es la primera entrega end-to-end al benchmark CoilStellaration, un reto de optimización de bobinas para reactores de fusión de tipo stellarator. Lo desarrolla el usuario petro-popov y se publica bajo licencia MIT. No es un modelo de lenguaje: es una red neuronal pequeña que predice la geometría de las bobinas a partir de un vector de entrada de 94 dimensiones, dentro de la pista `fixed_shape` del benchmark (N_fp = 3, 5 bobinas únicas por semiperíodo).

El modelo resuelve un problema de regresión científica en el dominio de la física de plasmas: dado un conjunto de parámetros de entrada del benchmark, produce 230 valores de salida que definen la forma de las bobinas. Su relevancia es la de establecer una línea base reproducible y exportable a ONNX para futuras comparaciones en el benchmark CoilStellaration, no la de competir en capacidades generales.

Arquitectura: perceptrón multicapa (MLP) de 4 capas con activación GELU, entrenado durante 4.000 pasos sobre filas `used_for_ml_baseline` de la pista `fixed_shape`. El rendimiento local es modesto: pérdida media de 0,0752 y una factibilidad estricta del 1,0% en la evaluación estratificada de 300 filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 4 capas (94 → 512 → 512 → 512 → 512 → 230) con activación GELU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (exportado mediante `leaderboard.scripts.export_coilstellaration_onnx`) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa puro de cuatro capas ocultas de 512 unidades cada una, con activación GELU y una capa de salida de 230 dimensiones. La entrada es un vector de 94 dimensiones. No emplea mecanismos de atención, convoluciones ni recurrencia: es una red densa feed-forward orientada a regresión. Se exportó a formato ONNX para su uso en el benchmark.

El entrenamiento se realizó durante 4.000 pasos con `batch_size=64`, optimizador AdamW y un scheduler de warmup cosine con tasa de aprendizaje de 1e-3 a 1e-5, sobre las filas `used_for_ml_baseline` de la pista `fixed_shape`. El tiempo de entrenamiento fue de 1 minuto y 34 segundos en CPU de Apple Silicon, con una mejor pérdida de evaluación de 0,07314. No se documenta composición del dataset, número de tokens (no aplica) ni uso de RLHF/DPO.

## Capacidades

- Regresión geométrica: predice un vector de 230 valores que define la forma de las bobinas para el benchmark CoilStellaration.
- Pista `fixed_shape`: soporta exclusivamente la pista `fixed_shape` (N_fp = 3, 5 bobinas únicas por semiperíodo).
- Exportación ONNX: los pesos están disponibles en formato ONNX, lo que permite inferencia portable.
- Entrenamiento reproducible: hiperparámetros y procedimiento documentados en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Línea base para el benchmark CoilStellaration: sirve como referencia mínima contra la que comparar futuras entregas en la pista `fixed_shape`, ya que es la primera submission end-to-end documentada.
- Reproducción de experimentos: investigadores pueden reentrenar el MLP con los hiperparámetros publicados (4.000 pasos, AdamW, warmup cosine) para verificar la pérdida reportada de 0,07314.
- Integración en pipelines ONNX: al estar exportado a ONNX, puede cargarse en runtimes de inferencia ligeros (ONNX Runtime) para evaluar predicciones de geometría de bobinas sin dependencias de PyTorch.
- Prototipado rápido de regresores geométricos: la arquitectura MLP de 94 a 230 dimensiones sirve como plantilla para otros problemas de regresión de forma en física de plasmas.
- Evaluación de factibilidad: permite medir la tasa de factibilidad estricta (1,0% en la evaluación local) y comparar con modelos posteriores que aspiren a mejorarla.
- Docencia y divulgación: ejemplo sencillo y completamente documentado de un flujo end-to-end de benchmark científico con exportación ONNX.

## Benchmarks y rendimiento

Evaluación local reportada por el autor sobre 300 filas estratificadas (100 por estrato):

| Metrica | Valor |
|---|---|
| Pérdida media | 0,0752 |
| Estrato loose | 0,1438 |
| Estrato medium | 0,0765 |
| Estrato tight | 0,0055 |
| Factibilidad estricta | 1,0% |
| Mejor pérdida de evaluación (entrenamiento) | 0,07314 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es un MLP de 4 capas con capas ocultas de 512 unidades, por lo que cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la práctica).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: ONNX Runtime, o cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; el entrenamiento completo tardó 1 minuto y 34 segundos en CPU de Apple Silicon, lo que da una idea del reducido coste computacional.

## Comparativa con modelos similares

No disponible. No se conocen otros modelos comparables en la información proporcionada; se trata de la primera submission documentada al benchmark CoilStellaration en la pista `fixed_shape`.

## Limitaciones y advertencias

- Factibilidad estricta muy baja: solo el 1,0% de las predicciones evaluadas resultan estrictamente factibles, lo que limita su uso directo en producción científica.
- Pérdida elevada en el estrato loose (0,1438) frente al tight (0,0055), lo que indica un rendimiento desigual según la dificultad del estrato.
- Ámbito restringido: solo soporta la pista `fixed_shape`; no es aplicable a otras pistas del benchmark.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero las predicciones geométricas pueden ser no factibles físicamente.
- Sesgos conocidos: no documentados; el entrenamiento se limita a las filas `used_for_ml_baseline` de la pista `fixed_shape`, por lo que puede no generalizar fuera de esa distribución.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la idoneidad de las predicciones.
- Caveat para producción: al ser una línea base con 1,0% de factibilidad estricta, no se recomienda su uso en diseño real de bobinas sin validación física posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/petro-popov/coilstellaration-mlp-v1
- Benchmark CoilStellaration: https://huggingface.co/spaces/proxima-fusion/coilstellaration-bench
