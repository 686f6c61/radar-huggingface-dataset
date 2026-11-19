# khrotubutms/if-guesser

## Resumen

if-guesser es un micro-modelo desarrollado por el usuario khrotubutms que predice la probabilidad de que una condición de rama en Python (`if` / `while`) se evalúe como verdadera. Se trata de un transformer encoder a nivel de byte con aproximadamente 592.000 parámetros, entrenado desde cero sin modelo base, sobre un dataset sintético de 3,07 millones de pares condición-resultado. El modelo no recibe contexto del programa: solo la expresión de la condición en sí.

El modelo resuelve un problema muy acotado: estimar el resultado booleano de una comparación aislada. No es un modelo de lenguaje general ni un asistente de código; es un clasificador binario especializado en condiciones de rama. Su relevancia es fundamentalmente académica o experimental, como ejemplo de micro-modelo de predicción de ramas para análisis estático o investigación sobre branch prediction en código.

La información pública disponible es muy limitada: el repositorio no incluye licencia, pipeline, idiomas declarados ni resultados de benchmarks. El tamaño del repositorio es de 0,0 GB y no consta ningún archivo de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (PyTorch `nn.TransformerEncoder`) a nivel de byte, con embedding de tokens y embedding posicional, y cabeza lineal de clasificación binaria |
| Parametros totales | ~592.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 224 tokens (longitud máxima de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, `micro_branch.pt`; también se distribuye en formato ONNX según los tags) |
| Idiomas soportados | no disponible (opera sobre bytes de expresiones Python, no sobre lenguaje natural) |
| Licencia | no disponible (el autor indica que no se incluye archivo de licencia) |
| Formato de pesos | PyTorch (`.pt`) y ONNX (según tags del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tamaño muy reducido. Según el código de uso publicado, el modelo consta de un embedding de tokens de vocabulario 259, un embedding posicional de longitud máxima 224, una pila de capas `nn.TransformerEncoderLayer` (con `d_model`, `n_heads`, `ffn` y `n_layers` configurables mediante `cfg`) y una cabeza lineal que produce un único logit a partir del primer token. La entrada se codifica a nivel de byte: la condición se serializa como texto con marcadores especiales (tokens 257 y 258 para inicio y fin, 256 para padding) y los enteros se desplazan con un sesgo de 5.000.000.000.000 y se formatean a 13 dígitos.

El entrenamiento se realizó desde cero (sin modelo base) con 3,07 millones de pares condición-resultado generados sintéticamente, cubriendo comprobaciones de truthiness, comparaciones numéricas, pertenencia, comprobaciones de tipo, comparaciones encadenadas y subcondiciones con `and` / `or`. Se usó pérdida BCE con label smoothing, optimizador AdamW con tasa de aprendizaje 3e-4 y decaimiento coseno, un currículo mixto con minería de ejemplos difíciles, 12.000 pasos, tamaño de batch efectivo de 256 y longitud máxima de secuencia de 224. El entrenamiento se ejecutó en una única NVIDIA L4.

## Capacidades

- Predicción binaria de la probabilidad de que una condición de rama Python se evalúe como verdadera.
- Manejo de condiciones con comparaciones numéricas (`==`, `!=`, `<`, `>`, `<=`, `>=`).
- Manejo de comprobaciones de truthiness, pertenencia (`in`), comprobaciones de tipo y comparaciones encadenadas.
- Manejo de subcondiciones combinadas con `and` / `or`.
- Entrada a nivel de byte, sin tokenizador de lenguaje natural.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido de lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis estático de código: estimar la probabilidad de que una condición concreta se cumpla para priorizar la revisión de ramas sospechosas o muertas en un pipeline de linting.
- Investigación en branch prediction: usar el modelo como banco de pruebas para estudiar cómo un micro-transformer aprende patrones de comparación numérica y truthiness.
- Docencia y experimentación: ejemplo mínimo reproducible de entrenamiento de un transformer desde cero con pérdida BCE y currículo de ejemplos difíciles.
- Generación de datos sintéticos de prueba: emplear las probabilidades como señal para filtrar o etiquetar condiciones generadas automáticamente en suites de test.
- Análisis de cobertura de tests: detectar condiciones que el modelo considera casi siempre verdaderas o casi siempre falsas, lo que puede indicar ramas no cubiertas.
- Prototipado de heurísticas de optimización: integrar la probabilidad como feature en un sistema de decisión sobre reordenación o simplificación de ramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene ~592.000 parámetros y los pesos en FP32 ocupan aproximadamente 2,4 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se realizó en una NVIDIA L4.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090, etc.) e incluso puede ejecutarse en CPU.
- Opciones de despliegue: PyTorch nativo (código de uso publicado), ONNX Runtime (según tags del repositorio). No consta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia de milisegundos en CPU y sub-milisegundo en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

No disponible. No se conocen modelos públicos directamente comparables en la categoría de predicción de ramas a nivel de byte con este tamaño y propósito.

## Limitaciones y advertencias

- El modelo no recibe contexto del programa: solo evalúa la condición aislada, por lo que ignora el estado de las variables en tiempo de ejecución.
- Entrenado exclusivamente con datos sintéticos, lo que puede no reflejar la distribución real de condiciones en código de producción.
- La serialización de enteros usa un sesgo fijo y formato de 13 dígitos; enteros fuera de ese rango o condiciones no numéricas pueden no codificarse correctamente.
- Longitud máxima de secuencia de 224 tokens, lo que limita la complejidad de las condiciones que puede procesar.
- No hay archivo de licencia: el uso comercial queda sin marco legal explícito y debe consultarse con el autor.
- No se han publicado métricas de precisión, calibración ni evaluación en benchmarks, por lo que no es posible valorar su fiabilidad.
- Riesgo de alucinación en el sentido de producir probabilidades mal calibradas para condiciones fuera de la distribución de entrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona y no debe usarse como asistente.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/khrotubutms/if-guesser
