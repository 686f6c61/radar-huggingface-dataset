# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-60000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-60000` es un modelo de draft para decodificación especulativa EAGLE3, desarrollado por el usuario huluhuluu. No es un modelo de chat independiente, sino un componente auxiliar diseñado para acelerar la inferencia del modelo base `Qwen/Qwen3-4B-Instruct-2507` (un instruct model de 4B parámetros sin modo thinking). Su función es predecir secuencias cortas de tokens candidatos que el modelo base verifica en paralelo, reduciendo así la latencia y el coste computacional por token generado.

La arquitectura es `LlamaForCausalLMEagle3` con una única capa de decoder, hidden size de 2560 y atención de ventana deslizante de 512 tokens. El modelo tiene 202.700.416 parámetros (aproximadamente 202,7 millones), un tamaño de repo de 0,4 GB y se distribuye en formato `safetensors` con pesos en `bfloat16`. Este checkpoint concreto corresponde a la época 2, paso 60000 de un entrenamiento online con SpecForge sobre datos ShareGPT, y forma parte de una colección de 47 checkpoints publicados como repositorios separados. Su relevancia radica en que ofrece una vía práctica para desplegar decodificación especulativa sobre Qwen3-4B-Instruct-2507 con SGLang, un backend de inferencia muy utilizado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa de decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas key/value) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana deslizante de draft: 512 tokens; secuencia maxima de entrenamiento: 2048 tokens |
| Tipos de cuantizacion | bfloat16 (safetensors); no se proporcionan otras cuantizaciones |
| Idiomas soportados | No disponible (hereda el vocabulario del modelo base Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura EAGLE3 (Enhanced Auto-regressive Generation with Linear Extrapolation) sobre un backbone Llama. Consta de una única capa de decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas key/value. El vocabulario del draft es de 32.000 tokens, mientras que el vocabulario del modelo objetivo es de 151.936 tokens. La atención es causal con ventana deslizante de 512 tokens, lo que limita el alcance del contexto que el draft puede considerar al predecir tokens.

El entrenamiento se realizó con el método online EAGLE3 / SpecForge, utilizando un dataset ShareGPT limpio (en formato JSONL, sin registro de revisión). Se ejecutaron 10 épocas con un total de 231.810 pasos de optimizador, batch size por dispositivo de 1, data-parallel size de 4 (batch global efectivo de 4), y una tasa de aprendizaje de 1e-4 con warmup lineal del 1,5% seguido de cosine annealing. El peso de decaimiento fue 0, el gradiente máximo normalizado 0,5, y la longitud máxima de secuencia 2048 tokens. La longitud TTT (test-time training) de EAGLE3 fue de 7 tokens. El backend objetivo es SGLang con flashinfer, y el tensor parallel size es 1. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Generación especulativa de tokens: el modelo predice hasta un número configurable de tokens candidatos en un solo paso de avance, que el modelo base verifica en paralelo. Esto acelera la decodificación autoreresiva.
- Compatibilidad específica con Qwen3-4B-Instruct-2507: está entrenado para emparejarse exactamente con este modelo objetivo, por lo que no funciona correctamente con otros modelos.
- Integración con SGLang: el checkpoint está diseñado para usarse como ruta de draft en el servidor de inferencia SGLang, que soporta decodificación especulativa EAGLE3.
- Ventana deslizante de draft de 512 tokens: permite que el draft mantenga un contexto reciente limitado, reduciendo el coste de atención en comparación con una ventana completa.
- Formato de pesos estándar: safetensors con bfloat16, compatible con el ecosistema transformers y SGLang.
- No es un modelo de chat ni de generación autónoma: no produce texto por sí mismo; su única función es proponer tokens para acelerar la inferencia del modelo base.

## Casos de uso

- Aceleración de inferencia en producción con SGLang: el caso principal es desplegar este draft junto con `Qwen/Qwen3-4B-Instruct-2507` en un servidor SGLang, configurando la ruta de draft especulativa. Esto reduce la latencia por petición en servicios de chat o API de generación de texto, especialmente útil en entornos con alta concurrencia.
- Reducción de coste por token en servicios de streaming: al generar varios tokens por paso de verificación, se disminuye el número de pasos autoreresivos del modelo base, lo que baja el consumo de cómputo y energía en despliegues a gran escala.
- Optimización de throughput en servidores con múltiples peticiones: en un escenario de batch dinámico, la decodificación especulativa permite completar más peticiones por segundo con la misma capacidad de GPU, mejorando el rendimiento agregado.
- Desarrollo de pipelines de generación de código en CI/CD: si el modelo base se usa para autocompletar o generar código, el draft acelera la respuesta, haciendo viable su integración en entornos de integración continua donde el tiempo de espera es crítico.
- Investigación en decodificación especulativa: este checkpoint, junto con los otros 46 de la colección, permite estudiar el efecto del número de pasos de entrenamiento en la calidad del draft, comparando épocas y pasos para calibrar el rendimiento.
- Evaluación de configuraciones de árbol en EAGLE3: los desarrolladores pueden usar este modelo para ajustar los parámetros de árbol especulativo (número de candidatos, profundidad, etc.) en SGLang, midiendo el trade-off entre tasa de aceptación y overhead.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no se registraron métricas de evaluación ni de seguridad" durante el entrenamiento. Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo de draft.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,4 GB (202,7M parámetros × 2 bytes). Con overhead de activaciones y buffers, se puede ejecutar en GPUs con 2 GB de VRAM o más, aunque en la práctica SGLang requiere al menos 4-6 GB para operar cómodamente con el modelo base y el draft juntos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para el draft en solitario; por ejemplo, RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100 o H100. Para el despliegue completo con el modelo base (4B parámetros), se recomienda al menos 16 GB de VRAM si se usa cuantización, o 24 GB para bfloat16 completo.
- Capacidad en consumer GPU: sí, el draft cabe en cualquier GPU consumer con 2 GB o más. Sin embargo, el modelo base Qwen3-4B-Instruct-2507 requiere más recursos; con cuantización GGUF puede ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: SGLang es el backend objetivo y el único soportado oficialmente para este checkpoint (con flashinfer). También se puede cargar con transformers para pruebas locales, pero la funcionalidad especulativa requiere SGLang.
- Latencia y throughput estimados: no disponibles. Dependen de la configuración del árbol especulativo, el hardware y la carga de trabajo. Se recomienda medir localmente con la herramienta de benchmark de SGLang.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de draft (como EAGLE-2, Medusa o modelos de draft de otras familias). La siguiente tabla compara las características estructurales con el modelo base y con un hipotético draft genérico, basándose únicamente en la información pública.

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4B | No disponible | Apache 2.0 | Modelo de chat instruct multilingue |
| Este draft EAGLE3 | 202,7M | 512 tokens (ventana deslizante) | Apache 2.0 | Modelo de draft especulativo |
| Otros draft models (EAGLE-2, Medusa) | Variable | Variable | Variable | Modelos de draft especulativo |

No se puede establecer una comparación cuantitativa de rendimiento porque no hay benchmarks publicados ni para este modelo ni para alternativas en la misma categoría dentro de la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni un generador de texto autónomo: intentar usarlo como tal producirá resultados incoherentes. Debe emparejarse estrictamente con el modelo base `Qwen/Qwen3-4B-Instruct-2507`.
- Sin métricas de evaluación ni seguridad: la model card indica que no se registraron métricas de evaluación ni de seguridad. No hay garantía sobre la calidad de las predicciones del draft ni sobre sesgos potenciales.
- Sesgos y alucinaciones: al ser un modelo de draft, no genera texto final, pero puede producir tokens incorrectos que el modelo base debe rechazar. La tasa de aceptación dependerá del entrenamiento y no se ha medido.
- Restricciones de contexto: la ventana deslizante de 512 tokens limita el alcance del draft. Si el modelo base usa un contexto mayor, el draft solo considera los últimos 512 tokens, lo que puede reducir la tasa de aceptación en tareas que requieren contexto largo.
- Dependencia de SGLang: el checkpoint está diseñado para SGLang con flashinfer. Otras implementaciones de EAGLE3 pueden no ser compatibles sin modificaciones.
- Archivo `training_state.pt`: contiene el estado del optimizador y argumentos de entrenamiento. Debe deserializarse únicamente en entornos confiables, ya que podría contener código o datos sensibles.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también es Apache 2.0, por lo que no hay restricciones adicionales de licencia para producción.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-2-step-60000
- Checkpoint relacionado (época 2, paso 50000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Checkpoint relacionado (época 3, paso 75000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Modelo base Qwen3-4B-Instruct-2507 (Qualcomm AI Hub): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio oficial EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ejemplo de ejecución local en NPU (GitHub): https://github.com/locomotive-works/npu-local-model-running
