# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-175000

## Resumen
Este repositorio contiene un checkpoint concreto del modelo de draft EAGLE3 entrenado en línea con SpecForge para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo objetivo mediante decodificación especulativa, generando múltiples tokens candidatos que el modelo grande verifica en paralelo.

El autor, huluhuluu, publica una colección de 47 checkpoints de un entrenamiento de 10 épocas sobre datos ShareGPT limpios. Este checkpoint concreto es el correspondiente a la época 7, paso 175000, y no aplica ventana deslizante (NoWindow). Con solo 202,7 millones de parámetros y un peso de 0,4 GB, está diseñado para integrarse como ruta de draft en SGLang con el algoritmo EAGLE3, no para uso directo como generador de texto.

La relevancia de este modelo es práctica: permite reducir la latencia de Qwen3-4B-Instruct-2507 en despliegues de producción sin modificar el modelo grande, aprovechando la arquitectura EAGLE3 que predice múltiples tokens basándose en las características ocultas del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, EAGLE3) |
| Parametros totales | 202.700.416 |
| Parametros activos | 202.700.416 (no es MoE) |
| Longitud de contexto | 2048 (máximo de secuencia de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos publicados) |
| Idiomas soportados | no disponible (depende del modelo objetivo; ShareGPT es mayoritariamente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento
El modelo usa la arquitectura EAGLE3, una evolución de EAGLE-2 que incorpora un mecanismo de test-time training (TTT) dentro del módulo de draft. Concretamente, este checkpoint tiene una única capa decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención, 8 cabezas key/value, vocabulario de draft de 32000 tokens y vocabulario objetivo de 151936 tokens. La atención del draft usa `sdpa` (scaled dot-product attention) y los pesos están en bfloat16.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, con el modelo Qwen3-4B-Instruct-2507 como modelo objetivo. Los datos de entrenamiento fueron un JSONL de ShareGPT limpio (fuente local, revisión no registrada). Se usaron 10 épocas con 231810 pasos de optimizador en total, batch efectivo de 4, learning rate 1e-4 con warmup lineal del 1.5% y decaimiento coseno, weight decay 0.0, gradiente máximo 0.5 y longitud máxima de secuencia 2048. La longitud TTT de EAGLE3 es 7. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades
- Decodificación especulativa: genera hasta 4 tokens candidatos por paso (configuración recomendada `--speculative-num-draft-tokens 4`) que el modelo objetivo verifica en paralelo.
- Aceleración de inferencia: reduce la latencia de Qwen3-4B-Instruct-2507 en servidores SGLang sin degradar la calidad de salida, ya que el modelo grande siempre verifica los candidatos.
- Integración directa con SGLang: se usa como ruta de draft con el algoritmo EAGLE3 (`--speculative-algorithm EAGLE3`).
- Sin modo pensamiento: el modelo objetivo Qwen3-4B-Instruct-2507 no tiene soporte de thinking mode, por lo que este draft tampoco lo contempla.
- No es un modelo de chat: no genera texto por sí mismo; debe emparejarse con el modelo objetivo exacto.
- Multilingüe limitado: el entrenamiento con ShareGPT (mayoritariamente inglés) puede penalizar el rendimiento del draft en otros idiomas.

## Casos de uso
- Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia: integrar este draft en SGLang permite atender peticiones de chat con menor tiempo de respuesta, útil en asistentes conversacionales donde la fluidez es crítica.
- Servicio de API de generación de texto: en un backend con vLLM o SGLang, el draft model acelera el throughput del modelo objetivo, reduciendo el coste por petición en entornos con alta carga.
- Fine-tuning de draft models: los checkpoints intermedios (como este) pueden servir para estudiar la dinámica de entrenamiento de EAGLE3 y ajustar hiperparámetros (topk, num-steps, num-draft-tokens) para cargas de trabajo específicas.
- Evaluación de decodificación especulativa: investigadores pueden comparar la tasa de aceptación de este checkpoint frente a otros de la misma colección (distintas épocas/pasos) para entender la convergencia del draft.
- Optimización de costes en inferencia en la nube: al reducir la latencia por petición, se pueden usar instancias más pequeñas o atender más peticiones concurrentes con el mismo hardware.
- Entornos edge con GPU limitada: con solo 0,4 GB de pesos, el draft cabe en cualquier GPU consumer y acelera el modelo objetivo incluso en tarjetas de gama media.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. No se proporcionan tasas de aceptación de tokens, latencia medida ni comparativas con otros draft models.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,4 GB para los pesos del draft en bfloat16, más overhead de activaciones y KV cache. En la práctica, el draft se ejecuta junto al modelo objetivo (que ocupa unos 8 GB en bf16), por lo que la VRAM total necesaria depende del modelo grande.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede alojar el modelo objetivo más el draft (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4090). Para producción, A100 40GB o H100 son adecuadas para servir múltiples peticiones concurrentes.
- Compatibilidad con consumer GPU: sí, el draft en sí es extremadamente ligero y cabe en cualquier GPU moderna.
- Opciones de despliegue: SGLang es el backend objetivo (con backend de atención flashinfer). También se puede usar con el framework SpecForge si se desea reanudar entrenamiento. No se menciona compatibilidad con llama.cpp, Ollama o TGI en la documentación.
- Latencia y throughput: no disponibles. Los valores de `--speculative-num-steps 3`, `--speculative-eagle-topk 1` y `--speculative-num-draft-tokens 4` son valores de partida que deben ajustarse mediante benchmarking con la carga de trabajo real.

## Comparativa con modelos similares
No hay modelos comparables publicados en la informacion disponible. La colección de huluhuluu contiene otros 46 checkpoints del mismo entrenamiento (distintas épocas y pasos), que son las alternativas más directas. Se puede comparar este checkpoint (epoch 7, step 175000) con:
- `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000`: mismo entrenamiento, un paso posterior (185000 vs 175000), prácticamente idéntico en arquitectura y datos.
- `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-175000` (este): variante sin ventana deslizante; el resto de checkpoints de la colección pueden tener o no ventana deslizante según la configuración estándar.

No se dispone de datos de rendimiento para comparar con otros draft models como los oficiales de EAGLE-Qwen3 (que se entrenan con ShareGPT para Qwen2).

## Limitaciones y advertencias
- No es un modelo de chat: usarlo directamente como generador de texto producirá resultados incoherentes. Debe emparejarse con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507`.
- Sin métricas de seguridad: el autor no registró evaluaciones de seguridad, sesgos ni alucinaciones. No se recomienda su uso en aplicaciones donde la seguridad del contenido sea crítica sin una evaluación independiente.
- Sesgo de datos: ShareGPT contiene principalmente conversaciones en inglés; el rendimiento del draft en otros idiomas puede degradarse, afectando a la tasa de aceptación y a la latencia final.
- Ventana de contexto limitada: el entrenamiento se realizó con secuencias de máximo 2048 tokens. Para contextos más largos, la tasa de aceptación del draft puede caer.
- Riesgo de alucinación: aunque el draft no genera texto final, una mala predicción puede aumentar la latencia (más rechazos), pero no altera la calidad del output final, que siempre pasa por el modelo objetivo.
- Restricciones de uso: el repositorio contiene `training_state.pt` con estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que puede contener código arbitrario.
- Sin soporte comercial específico: la licencia Apache-2.0 permite uso comercial, pero el modelo depende de SGLang y de la infraestructura del autor; no hay garantías de mantenimiento.

## Enlaces
- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-175000
- Checkpoint hermano (epoch 7, step 185000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementación oficial de EAGLE para Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guía de despliegue local con Ollama (contexto del modelo objetivo): https://mattselander.com/deploy-qwen3-4b-instruct-2507-locally-via-ollama-2/
