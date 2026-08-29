# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-LR5e-5-epoch-0-step-10000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) para decodificación especulativa, entrenado con el método EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El autor, `huluhuluu`, ha publicado dos checkpoints de un entrenamiento en línea con SpecForge: `epoch_0_step_5000` y `epoch_0_step_10000`. Este modelo concreto es el checkpoint de paso 10000, con una tasa de aprendizaje pico de 5e-5 y entrenado sobre el dataset ShareGPT limpio.

No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo objetivo (Qwen3-4B-Instruct-2507) cuando se despliega con SGLang y se activa la decodificación especulativa EAGLE3. Con solo 202,7 millones de parámetros y una única capa decoder, actúa como un predictor de tokens que reduce la latencia de generación del modelo grande sin sacrificar calidad, ya que el modelo objetivo verifica y corrige las predicciones.

La relevancia actual radica en que la decodificación especulativa es una técnica clave para reducir costes de inferencia en producción, y este modelo ofrece un checkpoint listo para usar con SGLang, con una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas key/value) |
| Parametros totales | 202.700.416 (pesos en bfloat16) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (maxima secuencia de entrenamiento; el modelo base Qwen3-4B-Instruct-2507 soporta 32k, pero este draft model no lo especifica) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bfloat16) |
| Idiomas soportados | No disponible (el dataset ShareGPT original contiene principalmente ingles; el autor no especifica otros idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura `LlamaForCausalLMEagle3`, una variante de una sola capa decoder diseñada para decodificación especulativa. La capa tiene hidden size de 2560, intermediate size de 9728, 32 cabezas de atención y 8 cabezas key/value, con un vocabulario de borrador de 32000 tokens frente al vocabulario objetivo de 151936 tokens. No se aplica ventana deslizante.

El entrenamiento se realizó con el método EAGLE3 en línea mediante SpecForge, con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Se usó un dataset ShareGPT limpio (fuente local, sin revisión registrada), con 10 épocas planificadas aunque el entrenamiento se detuvo en el paso 10000. Los hiperparámetros incluyen batch efectivo global de 4, learning rate de 5e-5 con warmup lineal del 1,5% y decaimiento coseno, weight decay de 0, y longitud máxima de secuencia de 2048. La atención de borrador usa `sdpa` y el backend objetivo es SGLang con `flashinfer`. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleración de inferencia para el modelo `Qwen/Qwen3-4B-Instruct-2507` mediante decodificación especulativa EAGLE3.
- Predicción de tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el número de pasos de decodificación autoregresiva.
- Compatible con SGLang como ruta de borrador especulativa (speculative draft path) con configuraciones EAGLE3.
- No es un modelo de generación de texto, razonamiento, código o matemáticas por sí mismo; no soporta tool calling, agentes ni capacidades multimodales.
- No soporta pensamiento extendido (thinking mode) porque el modelo base Qwen3-4B-Instruct-2507 no lo incluye, según la información de Qualcomm AI Hub.
- Multilingüismo limitado: el entrenamiento con ShareGPT (mayormente inglés) puede degradar el rendimiento en otros idiomas, como señala la documentación oficial de EAGLE-Qwen3.

## Casos de uso

- Despliegue de servicios de chat de baja latencia: al combinar este draft model con Qwen3-4B-Instruct-2507 en SGLang, se puede reducir la latencia de generación en entornos de producción donde el tiempo de respuesta es crítico, como asistentes conversacionales en tiempo real.
- Optimización de costes de inferencia en GPU compartidas: al acelerar la generación, se reduce el tiempo de ocupación de la GPU, permitiendo servir más peticiones con el mismo hardware.
- Evaluación de técnicas de decodificación especulativa: investigadores pueden comparar el rendimiento de este checkpoint con otros draft models (EAGLE-1, EAGLE-2) sobre el mismo modelo base, utilizando las herramientas de benchmarking de SGLang.
- Ajuste de parámetros de árbol de especulación: los equipos de ingeniería pueden usar este modelo para calibrar la configuración de árbol (tree settings) de SGLang según su carga de trabajo, midiendo throughput y aceptación de tokens.
- Integración en pipelines de inferencia existentes: dado que el modelo es un complemento del modelo base, puede añadirse a un stack ya desplegado con Qwen3-4B-Instruct-2507 sin cambios en la lógica de aplicación, solo configurando la ruta de borrador en SGLang.
- Investigación sobre entrenamiento de draft models: el checkpoint y el archivo `training_state.pt` permiten reanudar el entrenamiento o analizar el efecto de la tasa de aprendizaje 5e-5 en la calidad del borrador, útil para experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. No se proporcionan datos de MMLU, HumanEval, GSM8K ni de velocidad de aceptación de tokens especulativos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 0,4 GB en bfloat16, por lo que el draft model cabe en cualquier GPU con al menos 1 GB de VRAM. Sin embargo, se ejecuta junto con el modelo objetivo Qwen3-4B-Instruct-2507, que requiere aproximadamente 8-10 GB en bfloat16 (o menos con cuantización). En total, se recomienda al menos 12 GB de VRAM para el par completo.
- GPU recomendadas: cualquier GPU consumer con 12 GB o más (RTX 3060, RTX 4070, RTX 4090) o GPUs de datacenter como A100 o H100 para despliegues de alto throughput.
- Compatibilidad con consumer GPU: sí, el conjunto completo (draft + target) puede ejecutarse en una RTX 4090 o similar con suficiente VRAM.
- Opciones de despliegue: SGLang (backend recomendado, con soporte EAGLE3 y flashinfer). No se menciona compatibilidad con vLLM, llama.cpp u Ollama; estos no soportan EAGLE3 de forma nativa.
- Latencia y throughput: no disponibles. Dependen de la configuración del árbol de especulación, el hardware y la carga de trabajo; se recomienda benchmarkear con la carga de servicio real.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint. Como referencia conceptual, se puede comparar con otros draft models de la familia EAGLE:

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-LR5e-5 (este) | 202,7 M | 2048 (entrenamiento) | EAGLE3 | Apache-2.0 | HuggingFace |
| EAGLE-1 / EAGLE-2 (para Qwen2) | no disponible | no disponible | EAGLE-1/2 | no disponible | GitHub (Yunhai-Hu/EAGLE-Qwen3) |
| Draft model de Medusa (para otros modelos) | no disponible | no disponible | Medusa | no disponible | no disponible |

No se han encontrado benchmarks que comparen este draft model con alternativas sobre el mismo modelo base. La documentación oficial de EAGLE-Qwen3 sugiere que el rendimiento del draft model depende del dataset de entrenamiento y del idioma, pero no ofrece cifras concretas.

## Limitaciones y advertencias

- No es un modelo de chat independiente: usarlo directamente para generar texto producirá resultados sin sentido. Debe emparejarse estrictamente con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Limitación de idioma: el entrenamiento se realizó con ShareGPT, que contiene mayoritariamente datos en inglés. Para otros idiomas (español, chino, etc.), el rendimiento de la especulación puede degradarse, como advierte la documentación oficial de EAGLE-Qwen3.
- Sin evaluación de seguridad: la model card indica que no se registraron métricas de seguridad ni de alineación. Al ser un componente interno de inferencia, no genera contenido directamente, pero su calidad de predicción puede afectar a la eficiencia, no a la seguridad del texto final (que depende del modelo objetivo).
- Contexto limitado: la longitud máxima de secuencia durante el entrenamiento fue de 2048 tokens. Si el modelo objetivo recibe contextos más largos (hasta 32k), el draft model podría no predecir eficazmente más allá de su ventana de entrenamiento, reduciendo la tasa de aceptación.
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera respuestas. Sin embargo, una mala calidad de predicción puede provocar rechazos frecuentes por parte del modelo objetivo, aumentando la latencia en lugar de reducirla.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero el archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; debe deserializarse solo en entornos de confianza.
- Dependencia de SGLang: el modelo solo es útil con SGLang y la configuración EAGLE3; no funciona con otros servidores de inferencia sin adaptación adicional.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-LR5e-5-epoch-0-step-10000
- Checkpoint hermano (epoch 0 step 5000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-0-step-10000
- Checkpoint posterior (epoch 7 step 185000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial de EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guía de despliegue local con Ollama (del modelo base): https://mattselander.com/deploy-qwen3-4b-instruct-2507-locally-via-ollama-2/
