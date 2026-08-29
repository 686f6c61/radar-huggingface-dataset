# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-145000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-145000` es un modelo de borrador (draft model) para decodificación especulativa EAGLE3, diseñado específicamente para acelerar la inferencia del modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el usuario huluhuluu mediante un entrenamiento online con la herramienta SpecForge, utilizando datos limpios de ShareGPT. Su propósito no es generar texto de forma autónoma, sino servir como componente auxiliar en un sistema de decodificación especulativa, donde propone secuencias de tokens que el modelo principal valida, reduciendo la latencia de generación.

Con solo 202,7 millones de parámetros y una única capa de decoder, este draft model implementa una arquitectura ligera con atención de ventana deslizante de 512 tokens. Se publica bajo licencia Apache 2.0 y forma parte de una colección de 47 checkpoints intermedios del mismo entrenamiento, cada uno en un repositorio separado. Este checkpoint concreto corresponde a la época 6, paso 145.000, y está pensado para usarse con SGLang y el backend de atención flashinfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden size 2560, intermediate 9728, 32 cabezas de atencion, 8 cabezas KV, causal sliding-window attention) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana deslizante de 512 tokens; entrenamiento hasta 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (el modelo base Qwen3 es multilingue, pero el draft no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una técnica de decodificación especulativa que entrena un pequeño modelo auxiliar para predecir tokens futuros basándose en características ocultas del modelo objetivo. La arquitectura es `LlamaForCausalLMEagle3`, con una sola capa decoder, tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario del draft es de 32.000 tokens, mientras que el del modelo objetivo es de 151.936, lo que obliga a una proyección entre ambos espacios. La atención es causal con ventana deslizante de 512 tokens, y los pesos se almacenan en bfloat16.

El entrenamiento se realizó con SpecForge, un sistema de entrenamiento online para EAGLE3, sobre un subconjunto limpio de ShareGPT en formato JSONL. Se ejecutaron 10 épocas con un total de 231.810 pasos de optimización, tamaño de batch efectivo de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y posterior decaimiento coseno, y sin weight decay. La longitud máxima de secuencia fue de 2048 tokens, con una longitud de entrenamiento TTT (test-time training) de 7 tokens. El entrenamiento se realizó con tensor parallelism de 1 y atención SDPA. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Decodificación especulativa EAGLE3: el modelo actúa como borrador para acelerar la generación del modelo base `Qwen3-4B-Instruct-2507`, proponiendo múltiples tokens por paso que luego son verificados por el modelo principal.
- Integración con SGLang: diseñado para usarse como ruta de draft especulativo en SGLang con backend flashinfer, permitiendo ajustar parámetros de árbol de verificación según la carga de trabajo.
- Ligereza computacional: al tener solo 202,7 millones de parámetros, añade una sobrecarga mínima de VRAM y cómputo frente al modelo base.
- Ventana deslizante de 512 tokens: limita el alcance de atención del draft, lo que reduce el coste de memoria y mantiene la precisión en predicciones locales.
- No es un modelo de chat independiente: no genera respuestas útiles por sí mismo; su única función es servir como componente interno en un sistema de inferencia especulativa.
- Sin capacidades adicionales: no soporta tool calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Aceleración de inferencia en servicios de chat con Qwen3-4B-Instruct-2507: al desplegar SGLang con este draft model, se reduce la latencia de generación en entornos de producción con alta concurrencia, manteniendo la calidad del modelo base.
- Optimización de costes en infraestructura de IA: al disminuir el tiempo de generación por petición, se puede atender el mismo volumen de tráfico con menos GPUs o reducir el tiempo de cómputo facturado.
- Despliegue en entornos con restricciones de VRAM: el draft model requiere muy poca memoria adicional (menos de 0,5 GB), lo que permite usarlo junto al modelo base en GPUs de gama media como RTX 4090 o A10 sin necesidad de servidores dedicados.
- Experimentación con decodificación especulativa: investigadores pueden comparar este checkpoint con otros de la colección de 47 para estudiar el efecto del número de pasos de entrenamiento en la tasa de aceptación de tokens.
- Integración en pipelines de generación de código y razonamiento: el modelo base Qwen3-4B-Instruct-2507 destaca en tareas de programación y matemáticas; el draft acelera estas cargas sin alterar los resultados.
- Evaluación de estrategias de árbol de verificación: al ser un checkpoint intermedio, permite probar distintas configuraciones de árbol en SGLang para encontrar el equilibrio óptimo entre tasa de aceptación y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad durante el entrenamiento. No hay datos de tasa de aceptación, latencia relativa ni comparación con otros draft models.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 202,7 millones de parámetros en bfloat16, lo que ocupa aproximadamente 405 MB de memoria. Al usarse junto al modelo base Qwen3-4B-Instruct-2507 (alrededor de 8 GB en bfloat16), la VRAM total necesaria ronda los 9-10 GB para una carga completa.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM es suficiente, como RTX 3090, RTX 4090, A10, A100 o H100. Para entornos de producción con alta concurrencia, se recomiendan GPUs con mayor ancho de banda (A100 o H100).
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3090/4090 y otras GPU de gama alta para uso local o pruebas.
- Opciones de despliegue: SGLang con backend flashinfer es el soporte principal indicado en la model card. También podría utilizarse con vLLM si se implementa soporte EAGLE3, aunque no está confirmado en la documentación.
- Latencia y throughput: no se han publicado mediciones. La ganancia de velocidad depende de la tasa de aceptación del draft, que no ha sido reportada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros draft models para Qwen3-4B-Instruct-2507. Existen implementaciones oficiales EAGLE-1/2/3 en el repositorio `Yunhai-Hu/EAGLE-Qwen3`, pero no se han publicado métricas que permitan una comparación directa. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Este checkpoint (EAGLE3 draft) | 202,7 M | Ventana 512 | Apache 2.0 | Draft para Qwen3-4B-Instruct-2507 |
| Qwen3-4B-Instruct-2507 (base) | 4 B | No especificado en la info | Apache 2.0 | Modelo de chat instruct |
| EAGLE-Qwen3 oficial (repo) | No disponible | No disponible | No disponible | Draft models para Qwen3 |

La comparación directa no es posible sin datos de benchmarks. Se recomienda consultar la colección de checkpoints para evaluar la evolución del entrenamiento.

## Limitaciones y advertencias

- Modelo auxiliar, no autónomo: no sirve para generar texto directamente; solo funciona como borrador en un sistema de decodificación especulativa con el modelo base exacto `Qwen/Qwen3-4B-Instruct-2507`.
- Sin evaluación de seguridad: la model card indica que no se registraron métricas de seguridad ni de calidad. No se debe usar en producción sin validación previa.
- Sesgo del dataset de entrenamiento: entrenado exclusivamente con ShareGPT limpio, que refleja conversaciones reales de usuarios; puede heredar sesgos y patrones indeseados de ese corpus.
- Ventana deslizante limitada a 512 tokens: el draft solo considera el contexto reciente, lo que puede reducir la tasa de aceptación en secuencias largas con dependencias lejanas.
- Dependencia de la infraestructura: requiere SGLang con soporte EAGLE3 y backend flashinfer; no es compatible con cualquier framework de inferencia.
- Checkpoint intermedio: este repositorio contiene un paso concreto del entrenamiento (época 6, paso 145.000); otros checkpoints de la colección pueden ofrecer un rendimiento diferente. No hay garantía de que este paso sea el óptimo.
- Riesgo de alucinación: al ser un modelo de borrador, no genera contenido final, pero hereda las limitaciones del modelo base en cuanto a exactitud factual.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-145000
- Colección de checkpoints EAGLE3 para Qwen3-4B-Instruct-2507: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Implementación oficial EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo base Qwen3-4B-Instruct-2507 (Qualcomm AI Hub): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio de modelos Qualcomm en GitHub: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_4b_instruct_2507
