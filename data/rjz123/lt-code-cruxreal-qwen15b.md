# rjz123/lt-code-cruxreal-qwen15b

## Resumen

El modelo `rjz123/lt-code-cruxreal-qwen15b` es un checkpoint de razonamiento latente para predicción de salida de código (razonamiento de ejecución), desarrollado por rjz123. Parte del modelo base `Qwen/Qwen2.5-1.5B-Instruct` y se entrena con la técnica Latent-Thoughts-Tuning sobre una escalera de dificultad de tres niveles construida íntegramente con datasets públicos reales: CRUXEval, LiveCodeBench (execution-v2) y MBPP. No se utiliza ningún dato sintético.

El objetivo es explorar el razonamiento latente: en lugar de generar cadenas de pensamiento explícitas, el modelo inyecta representaciones internas en los tokens `<thinking>` durante el entrenamiento. La relevancia actual radica en que permite comparar directamente el método Latent-Thoughts-Tuning con otras plataformas como CoLaR y Latent-SFT, ya que comparten el mismo pool de datos subyacente. La arquitectura es un transformer de 1.5B parámetros (según el modelo base) y la longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.5B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y pytorch_model.bin (checkpoints) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer `Qwen/Qwen2.5-1.5B-Instruct` con el driver `NeosKnight233/Latent-Thoughts-Tuning` en el commit `c18aac6`. El entrenamiento se divide en tres etapas que no son simples épocas del mismo proceso: el grafo de cómputo directo cambia entre ellas. En la etapa 0 (`common`) el modelo se entrena como SFT plano, sin tokens `<thinking>` en los datos, por lo que no hay razonamiento latente. En la etapa 1 (`hidden_state`) el slot `<thinking>` se rellena con el estado oculto de la posición anterior directamente. En la etapa 2 (`soft_fusion`) se inyecta una combinación `α·hidden + (1−α)·(promedio ponderado de embeddings de vocabulario filtrado por top-p y escalado por temperatura)`. La pérdida es idéntica en las tres etapas (cross-entropy desplazada), pero los valores no son comparables entre etapas porque los embeddings inyectados difieren.

Los datos de entrenamiento provienen de CRUXEval (800 filas, nivel superficial-medio), LiveCodeBench execution-v2 (479 filas, nivel profundo con `numsteps` nativo de 497 a 996) y MBPP (374 filas, nivel superficial-medio). En total son 1488 filas de entrenamiento y 165 de validación, con semilla 0. La distribución por niveles es T0: 562, T1: 612 y T2: 479. La escalera de dificultad se define como `depth_proxy = #lines + 8 × #loops` para CRUXEval y MBPP, mientras que LiveCodeBench usa su `numsteps` nativo. Los pasos intermedios se derivan mecánicamente del código fuente real: las líneas del cuerpo de la función, limitadas a 7, más una frase concluyente de plantilla. No son cadenas de razonamiento escritas por humanos ni por modelos.

El entrenamiento usa un lote efectivo de 16 (4 × grad-accum 4), LR de 5e-5 con cosine, warmup_ratio 0.05 y weight_decay 0.01. Los valores de `labels_per_stage` son `[0, 10, 16]`, `thinking_insertion_prob` `[0.0, 0.85, 0.95]` y `fusion_alpha` `[0.5, 0.5, 0.6]`. Se utiliza `sdpa` como atención, sin flash-attention. El autor documenta cuatro parches locales necesarios para que el entrenamiento concluyera: desactivar `save_safetensors`, usar `save_strategy: epoch`, desactivar `save_dataset` y mover el modelo a GPU antes del preprocesado.

## Capacidades

- Predicción de salida de código (razonamiento de ejecución): el modelo está entrenado para predecir la salida de fragmentos de código, a partir de preguntas y respuestas reales de CRUXEval, LiveCodeBench y MBPP.
- Razonamiento latente a través de la técnica Latent-Thoughts-Tuning: en las etapas 1 y 2, el modelo utiliza representaciones internas en los tokens `<thinking>` en lugar de generar cadenas de pensamiento explícitas.
- Generación de texto y código: al partir de `Qwen2.5-1.5B-Instruct`, conserva las capacidades base del modelo, aunque no se especifican en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible; el razonamiento latente se activa mediante el mecanismo de inyección en `<thinking>`, pero no se documenta un modo de uso en inferencia.

## Casos de uso

- Evaluación de modelos de código en entornos académicos: el modelo puede utilizarse para comparar el rendimiento de razonamiento latente frente a CoT explícito en benchmarks como CRUXEval, LiveCodeBench y MBPP, dado que comparte el mismo pool de datos que las ejecuciones CoLaR y Latent-SFT.
- Predicción de salidas de funciones en análisis estático: en herramientas de análisis de código, el modelo puede predecir la salida de una función sin ejecutarla, lo que resulta útil para detectar comportamientos inesperados o errores lógicos.
- Generación de casos de prueba: a partir de una función y su entrada, el modelo puede predecir la salida esperada, facilitando la generación automática de casos de prueba en suites de testing.
- Depuración asistida: el modelo puede ayudar a razonar sobre el flujo de ejecución de un fragmento de código, anticipando resultados intermedios y facilitando la localización de fallos.
- Investigación en razonamiento latente: es un checkpoint de referencia para estudiar cómo la inyección de estados ocultos en tokens de pensamiento afecta al aprendizaje de tareas de ejecución de código, sin depender de datos sintéticos.
- Comparación de métodos de entrenamiento: al estar construido sobre el mismo pool de datos que CoLaR y Latent-SFT, permite comparar directamente el impacto de la estrategia de razonamiento latente frente a otras aproximaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card documenta únicamente las pérdidas de entrenamiento por etapa: stage0 pasó de 5.132 a 0.155, y stage1 de 38.878 a 0.915. Estos valores no son comparables entre etapas ni constituyen métricas de evaluación sobre conjuntos de test.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 3,1 GB (según el tamaño de `model.safetensors`). Para inferencia básica se estima que una GPU con al menos 8 GB de VRAM es suficiente, teniendo en cuenta activaciones y caché KV.
- GPU recomendadas: no se han publicado requisitos oficiales. Por tamaño, una GPU de consumo como RTX 3060, 4060 o superior puede ejecutar el modelo; para entrenamiento o inferencia con lotes grandes se recomienda una A100 o similar.
- Si cabe en consumer GPU: sí, en GPUs de consumo con 8 GB o más de VRAM.
- Opciones de despliegue: no se han publicado instrucciones específicas. Al ser un modelo de 1.5B, es compatible con frameworks estándar como vLLM, llama.cpp, Ollama o TGI, aunque no se proporcionan configuraciones de ejemplo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado datos comparativos en la información disponible. La model card indica que el modelo comparte el pool de datos subyacente con las ejecuciones CoLaR y Latent-SFT, lo que permite comparaciones directas de método, pero no se aportan resultados numéricos. Como referencia, el modelo base `Qwen/Qwen2.5-1.5B-Instruct` es la alternativa sin el mecanismo de razonamiento latente, pero no se ofrecen métricas de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- El checkpoint `stage2/` está en proceso de entrenamiento y actualmente solo contiene un stub; no debe usarse para trabajo de razonamiento latente.
- El checkpoint `stage0/` es SFT plano y no incorpora razonamiento latente, a pesar de estar incluido en el repositorio.
- Los pasos intermedios del dataset se derivan mecánicamente del código fuente (líneas del cuerpo de la función más una frase de plantilla), por lo que no representan cadenas de razonamiento humanas o generadas por modelos.
- Las pérdidas de entrenamiento entre etapas no son comparables, ya que los embeddings inyectados en los tokens `<thinking>` difieren.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas de código no está verificado.
- El modelo tiene 0 descargas y 0 likes, lo que indica que es un experimento de investigación sin validación externa.
- Al ser un fine-tuning de `Qwen2.5-1.5B-Instruct`, puede heredar sesgos y limitaciones del modelo base, aunque no se documentan en la información disponible.
- Existe riesgo de alucinación en la predicción de salidas de código, especialmente en fragmentos complejos o con bucles anidados.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales ni atribuciones requeridas más allá de las de la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/rjz123/lt-code-cruxreal-qwen15b
- Perfil del autor: https://huggingface.co/rjz123
- Repositorio de Latent-Thoughts-Tuning: https://github.com/NeosKnight233/Latent-Thoughts-Tuning
- Paper CRUXEval: https://arxiv.org/abs/2401.03065
- Paper LiveCodeBench: https://arxiv.org/abs/2403.07974
- Paper MBPP: https://arxiv.org/abs/2108.07732
