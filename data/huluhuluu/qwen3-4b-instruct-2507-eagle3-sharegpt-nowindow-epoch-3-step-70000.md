# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-70000

## Resumen

Este repositorio contiene un checkpoint concreto del modelo de borrador (draft model) EAGLE3 entrenado en línea con SpecForge para el modelo objetivo Qwen/Qwen3-4B-Instruct-2507. No es un modelo de chat independiente, sino un componente auxiliar diseñado para acelerar la inferencia mediante decodificación especulativa: el modelo de borrador genera tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo la latencia por token sin degradar la calidad de las respuestas.

El checkpoint corresponde al tercer epoch y al paso 70.000 de un entrenamiento de 10 epochs y 231.810 pasos totales. El modelo tiene 202,7 millones de parámetros, una sola capa de decoder, y pesa aproximadamente 0,4 GB en formato safetensors con precisión bfloat16. Está pensado para usarse exclusivamente como ruta de borrador en SGLang con el algoritmo EAGLE3, emparejado con el modelo objetivo de la familia Qwen3-4B-Instruct-2507.

La relevancia de este modelo radica en que permite reducir el coste computacional de servir modelos de 4B parámetros en producción, especialmente en escenarios de alta concurrencia o baja latencia. Al ser un borrador pequeño, su huella de memoria es mínima y puede ejecutarse en cualquier GPU consumer, lo que lo hace atractivo para despliegues en edge o entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (maximo de secuencia durante entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | no disponible (modelo de borrador, depende del modelo objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que utiliza una sola capa de transformer como borrador. Los detalles de configuración incluyen hidden size de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de borrador de 32.000 tokens y un vocabulario objetivo de 151.936 tokens. No se aplica ventana deslizante en la ejecución estándar.

El entrenamiento se realizó con SpecForge, un framework de entrenamiento en línea para modelos de borrador, sobre datos ShareGPT limpios en formato JSONL. Se utilizaron 10 epochs, 231.810 pasos de optimizador, batch efectivo de 4, learning rate de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, y gradiente máximo de 0,5. La longitud máxima de secuencia fue de 2048 tokens y la longitud de TTT (test-time training) de EAGLE3 fue de 7. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleración de inferencia: el modelo genera tokens candidatos para el modelo objetivo Qwen3-4B-Instruct-2507, permitiendo verificación paralela y reduciendo la latencia por token.
- Compatibilidad con SGLang: se integra como ruta de borrador especulativa mediante `--speculative-algorithm EAGLE3`.
- No es un modelo de chat: no puede generar respuestas de forma autónoma; requiere el modelo objetivo para producir texto final.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: estas capacidades dependen del modelo objetivo, no del borrador.
- Multilingüismo: heredado del modelo objetivo; el borrador en sí no tiene capacidades lingüísticas propias.
- Sin modo thinking ni capacidades de visión o audio.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen3-4B-Instruct-2507 con este borrador en SGLang permite reducir la latencia de respuesta en aplicaciones de atención al cliente o asistentes conversacionales, manteniendo la calidad del modelo objetivo.
- Inferencia en entornos con recursos limitados: al pesar solo 0,4 GB, el borrador puede ejecutarse junto al modelo objetivo en una única GPU consumer (por ejemplo, RTX 3060 o superior), haciendo viable el despliegue local.
- Procesamiento por lotes de alto rendimiento: en servidores con múltiples peticiones concurrentes, la decodificación especulativa reduce el número de pasos secuenciales del modelo objetivo, mejorando el throughput efectivo.
- Evaluación comparativa de algoritmos de decodificación especulativa: este checkpoint (epoch 3, paso 70.000) puede usarse para estudiar el impacto del punto de entrenamiento en la tasa de aceptación de tokens y la velocidad de generación.
- Optimización de costes en APIs de inferencia: al reducir la latencia, se pueden cumplir acuerdos de nivel de servicio más estrictos sin aumentar el número de GPUs.
- Investigación en modelos de borrador: el repositorio incluye `training_state.pt` con el estado del optimizador, lo que permite reanudar el entrenamiento o analizar la dinámica de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. Se recomienda realizar una evaluación propia de tasa de aceptación y latencia en el entorno de despliegue objetivo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para los pesos en bfloat16, más overhead de activaciones y atención. En la práctica, el borrador comparte la GPU con el modelo objetivo (4B parámetros), por lo que la VRAM total necesaria depende del modelo principal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar el borrador junto al modelo objetivo en cuantización de 4 bits. Para el modelo objetivo en bfloat16 se recomienda una GPU con 16 GB o más (RTX 4080, A10, L4, A100).
- Compatibilidad con GPU consumer: sí, el borrador cabe en cualquier GPU moderna, incluidas las de gama baja.
- Opciones de despliegue: SGLang con backend flashinfer (recomendado por el autor). No se documenta compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; dependen del hardware, del modelo objetivo y de la configuración de árbol especulativo (por ejemplo, `--speculative-num-steps 3`, `--speculative-eagle-topk 1`, `--speculative-num-draft-tokens 4`).

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros modelos de borrador (como Medusa, EAGLE-2, o los borradores nativos de SGLang). A modo cualitativo, este modelo se distingue por:

- Entrenamiento en línea con SpecForge, lo que permite adaptar el borrador a la distribución real del tráfico.
- Checkpoints por epoch y paso, facilitando la selección del punto óptimo de entrenamiento.
- Diseño específico para Qwen3-4B-Instruct-2507, lo que limita su uso a esta familia de modelos.

Para una comparación rigurosa, se necesitarían benchmarks de tasa de aceptación y latencia frente a otros borradores en el mismo hardware y carga de trabajo.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo como modelo independiente producirá salidas sin sentido o errores.
- Sin métricas de seguridad ni evaluación: el autor no registró ningún dato de rendimiento, sesgo o alucinación; no se recomienda su uso en producción sin validación previa.
- Dependencia del modelo objetivo: solo funciona con Qwen3-4B-Instruct-2507; emparejarlo con otro modelo puede causar fallos o degradación grave.
- Longitud de contexto limitada a 2048 durante el entrenamiento: aunque el modelo base soporte contextos mayores, la eficacia del borrador no está garantizada más allá de ese rango.
- `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; debe deserializarse solo en entornos de confianza por riesgo de ejecución de código malicioso.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen Research License) que debe verificarse antes de un despliegue comercial.
- Sin soporte de cuantización documentada: los pesos están en bfloat16; cuantizaciones adicionales no han sido probadas ni publicadas.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-70000
- Checkpoint alternativo (epoch 3, sin NoWindow): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-70000
- Checkpoint epoch 7: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Documentación de Qualcomm AI Hub sobre Qwen3-4B-Instruct-2507: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guía de instalación local (WAY TO AI): https://www.way-to-ai.com/install-qwen3-4b-instruct-2507-dummy-proof-guide/
- Guía de despliegue con Ollama: https://mattselander.com/deploy-qwen3-4b-instruct-2507-locally-via-ollama-2/
