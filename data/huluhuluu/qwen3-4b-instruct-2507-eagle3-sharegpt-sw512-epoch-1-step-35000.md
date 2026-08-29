# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-35000

## Resumen

Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-35000 es un modelo de draft (borrador) diseñado para acelerar la inferencia del modelo objetivo Qwen/Qwen3-4B-Instruct-2507 mediante decodificación especulativa con el algoritmo EAGLE3. Lo desarrolla el usuario huluhuluu y se publica bajo licencia Apache-2.0. No es un modelo de chat independiente, sino un componente auxiliar que debe emparejarse con el modelo objetivo exacto para funcionar correctamente.

El modelo se entrenó con el framework SpecForge en modo online EAGLE3, utilizando datos ShareGPT limpios y una ventana deslizante de draft de 512 tokens. Con solo 202,7 millones de parámetros (una capa decodificadora, hidden size 2560), su función es predecir varios tokens a la vez para que el modelo objetivo los verifique en paralelo, reduciendo la latencia por token generado. Este checkpoint concreto corresponde a la época 1, paso 35000, dentro de una serie de 47 checkpoints publicados en una colección.

La relevancia actual de este modelo radica en la necesidad de reducir costes y latencia en despliegues de LLMs en producción. La decodificación especulativa con EAGLE3 es una técnica consolidada que permite multiplicar el throughput de servidores de inferencia sin degradar la calidad de las respuestas, y este modelo ofrece una implementación lista para usar con SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decodificadora, attention causal con ventana deslizante de 512 tokens, atención sdpa) |
| Parametros totales | 202.700.416 (202,7 millones) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento; el draft usa ventana deslizante de 512) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (hereda del modelo objetivo Qwen3-4B-Instruct-2507, multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, training_state.pt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que entrena un pequeño modelo de draft sobre las representaciones ocultas del modelo objetivo. Concretamente, se compone de una única capa decodificadora con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas clave/valor, y un vocabulario de draft de 32000 tokens frente a los 151936 del modelo objetivo. La atención es causal con ventana deslizante de 512 tokens, lo que limita el alcance del draft a los últimos 512 tokens generados.

El entrenamiento se realizó con SpecForge en modo online, lo que significa que el modelo de draft se entrena mientras se ejecuta la decodificación especulativa contra el modelo objetivo real, en lugar de usar datos pre-generados. Se utilizaron datos ShareGPT limpios (fuente local, sin revisión registrada), con una longitud máxima de secuencia de 2048 tokens, una longitud TTT (test-time training) de 7 y una ventana deslizante de draft de 512 tokens. El entrenamiento duró 10 épocas con 231810 pasos de optimizador, batch global efectivo de 4, learning rate 1e-4 con warmup lineal del 1,5% y decaimiento coseno, y weight decay 0. No se aplicó RLHF ni DPO: el objetivo es únicamente imitar la distribución del modelo objetivo para maximizar la tasa de aceptación del draft.

## Capacidades

- Decodificación especulativa: genera secuencias de draft de varios tokens que el modelo objetivo verifica en paralelo, reduciendo la latencia de inferencia.
- Compatibilidad específica: debe emparejarse con Qwen/Qwen3-4B-Instruct-2507; no funciona con otros modelos.
- Integración con SGLang: diseñado para usarse como ruta de draft (speculative draft path) con el backend SGLang y flashinfer.
- Atención con ventana deslizante de 512 tokens: limita el coste computacional del draft y es adecuado para contextos largos donde solo importan los tokens recientes.
- No es un modelo de chat: no genera respuestas finales por sí mismo, ni soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Servidores de inferencia de alta concurrencia: al reducir la latencia por token, permite atender más peticiones simultáneas con el mismo hardware, ideal para APIs de chat públicas o internas.
- Despliegue de Qwen3-4B-Instruct-2507 en producción con SGLang: se configura el modelo de draft como ruta especulativa junto al modelo objetivo para acelerar la generación sin cambiar la API ni los resultados.
- Reducción de costes en GPU: al necesitar menos pasos de generación autoregresiva del modelo grande, se reduce el consumo de VRAM y energía por petición, permitiendo usar GPUs más pequeñas o menos instancias.
- Experimentación con decodificación especulativa: el checkpoint permite estudiar el impacto de la ventana deslizante y la longitud TTT en la tasa de aceptación del draft para diferentes cargas de trabajo.
- Evaluación de draft models: al publicarse 47 checkpoints a lo largo del entrenamiento, se puede analizar la evolución de la calidad del draft y seleccionar el punto óptimo para un caso concreto.
- Optimización de latencia en aplicaciones interactivas: chatbots, asistentes de código o herramientas de autocompletado que requieren respuestas casi instantáneas se benefician de la reducción de latencia por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se registraron métricas de evaluación ni de seguridad para este run. No se dispone de tasas de aceptación del draft, latencia medida ni comparaciones con otros draft models.

## Requisitos de hardware

- Tamaño del modelo: 202,7 millones de parámetros en bfloat16, aproximadamente 0,4 GB en disco.
- VRAM para inferencia: al ser un modelo auxiliar, la VRAM adicional sobre el modelo objetivo es pequeña, del orden de 0,5-1 GB según la implementación. El requisito dominante es el del modelo objetivo Qwen3-4B-Instruct-2507 (unos 8-10 GB en bfloat16).
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede alojar el modelo objetivo y el draft juntos (p. ej., RTX 3060 12GB, RTX 4070, RTX 4090, A10, A100). Para despliegues de producción con SGLang y flashinfer se recomienda GPU con soporte CUDA reciente (Ampere o superior).
- Si cabe en consumer GPU: sí, en GPUs de consumo con 12 GB o más de VRAM, siempre que el modelo objetivo también quepa.
- Opciones de despliegue: SGLang (backend recomendado, con soporte EAGLE3), potencialmente vLLM si añade soporte para EAGLE3 (no confirmado en la información disponible), y cualquier framework que implemente el algoritmo EAGLE3. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependen de la configuración del árbol de draft (tree settings) y de la carga de trabajo; la model card recomienda ajustar estos parámetros mediante benchmarks propios.

## Comparativa con modelos similares

No se dispone de información sobre otros draft models EAGLE3 para Qwen3-4B-Instruct-2507 en la información proporcionada. Como referencia, se puede comparar con el modelo objetivo y con alternativas de decodificación especulativa genéricas:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (objetivo) | 4.000 millones | 256K (según documentación de Qwen) | Apache-2.0 | Modelo de chat completo |
| Este draft model | 202,7 millones | 2048 (entrenamiento), ventana 512 | Apache-2.0 | Acelerador de inferencia |
| Draft models basados en n-gramas o en el propio modelo (self-speculative) | variable | variable | variable | Alternativas sin entrenamiento adicional |

La comparativa directa no es posible porque este modelo no genera texto por sí mismo y su calidad se mide por la tasa de aceptación del draft, dato no publicado.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como modelo independiente producirá resultados sin sentido. Debe emparejarse con el modelo objetivo exacto Qwen/Qwen3-4B-Instruct-2507.
- Sin métricas de evaluación: la model card indica que no se registraron métricas de rendimiento ni de seguridad. No se puede garantizar la calidad del draft en todos los escenarios.
- Datos de entrenamiento no auditados: se usó ShareGPT limpio de una fuente local sin revisión registrada; puede contener sesgos o contenido inapropiado.
- Riesgo de alucinación y sesgos: al ser un modelo derivado de Qwen3-4B-Instruct-2507, hereda las limitaciones del modelo base, aunque su función es solo de draft y no genera contenido final.
- Restricciones de uso: la licencia Apache-2.0 permite uso comercial, pero el modelo depende de SGLang y de la infraestructura del modelo objetivo; hay que verificar la licencia del modelo objetivo (Apache-2.0 también).
- training_state.pt: contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgos de seguridad.
- Contexto limitado a 2048 tokens en entrenamiento: aunque el modelo objetivo soporta más, el draft se entrenó con un máximo de 2048, lo que puede degradar la tasa de aceptación en secuencias más largas.
- Sin garantía de soporte: es un proyecto de un usuario individual, sin mantenimiento asegurado ni canal de soporte formal.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-35000
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint relacionado (época 7, paso 185000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Checkpoint relacionado (época 0, paso 5000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-0-step-5000
- Guía de Qwen3-2507 de Unsloth: https://unsloth.ai/docs/models/tutorials/qwen3-how-to-run-and-fine-tune/qwen3-2507
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
