# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-190000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) para decodificación especulativa, entrenado con el método EAGLE3 sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. El modelo ha sido desarrollado por el usuario `huluhuluu` y forma parte de una serie de checkpoints publicados como repositorios independientes en Hugging Face, correspondientes a distintos pasos de entrenamiento.

Su propósito no es funcionar como un modelo de chat autónomo, sino como componente acelerador: se empareja con el modelo objetivo en un servidor de inferencia (SGLang) para generar múltiples tokens candidatos en paralelo y reducir la latencia por token. La arquitectura es una única capa decoder de tipo Llama con atención causal de ventana deslizante de 512 tokens, lo que lo hace extremadamente ligero (202,7 millones de parámetros) en comparación con el modelo objetivo de 4B.

La relevancia de este modelo reside en la creciente adopción de la decodificación especulativa en entornos de producción para reducir costes de inferencia. Al tratarse de un draft model entrenado específicamente para Qwen3-4B-Instruct-2507, ofrece una integración directa con SGLang y una posible mejora de throughput sin necesidad de ajustar el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención causal con sliding window de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de draft de 512 tokens (entrenado con secuencias de hasta 2048) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una variante de decodificación especulativa que entrena una cabeza de borrador sobre las representaciones ocultas del modelo objetivo. La arquitectura es `LlamaForCausalLMEagle3`: una única capa decoder con hidden size de 2560, intermediate size de 9728, 32 cabezas de atención y 8 cabezas clave/valor, además de un vocabulario de draft de 32000 tokens frente a los 151936 del modelo objetivo. La atención utiliza ventana deslizante causal de 512 tokens y se implementa con `sdpa` (scaled dot-product attention).

El entrenamiento se realizó con el método online EAGLE3 mediante SpecForge, sobre un dataset ShareGPT limpio (formato JSONL, fuente local sin revisión registrada). Se emplearon 10 épocas con un total de 231810 pasos de optimizador, tamaño de lote efectivo global de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y posterior decaimiento coseno, y longitud máxima de secuencia de 2048 tokens. El parámetro TTT (test-time training) de EAGLE3 se fijó en 7. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleración de inferencia especulativa: genera secuencias de tokens candidatos para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`, permitiendo verificación paralela y reducción de latencia.
- Integración con SGLang: diseñado para usarse como ruta de draft (speculative draft path) en SGLang con backend `flashinfer`.
- Ventana deslizante de 512 tokens: limita el contexto del draft a 512 tokens, lo que reduce el coste computacional y la memoria.
- Peso reducido: con 202,7 millones de parámetros, su huella de memoria es aproximadamente el 5% del modelo objetivo, lo que permite ejecutarlo en paralelo en la misma GPU.
- No es un modelo de chat: no genera respuestas útiles de forma autónoma; su única función es servir como borrador para el modelo objetivo.

## Casos de uso

- Despliegue de servidores de inferencia de baja latencia: integrar este draft model con SGLang y `Qwen/Qwen3-4B-Instruct-2507` en un mismo proceso permite reducir la latencia por token en cargas de trabajo de chat en tiempo real, como asistentes virtuales o chatbots de soporte.
- Reducción de costes de inferencia en producción: al acelerar la generación del modelo objetivo sin modificar sus pesos, se puede servir más solicitudes por segundo con el mismo hardware, reduciendo el coste por petición en entornos con alta concurrencia.
- Optimización de pipelines de generación de código: el modelo objetivo Qwen3-4B-Instruct-2507 tiene capacidades de razonamiento y código; el draft model acelera la generación de respuestas largas en herramientas de autocompletado o asistentes de programación.
- Evaluación comparativa de decodificación especulativa: investigadores pueden utilizar este checkpoint (junto con otros de la colección) para estudiar el efecto del número de pasos de entrenamiento en la tasa de aceptación del draft y el speedup real en distintas cargas de trabajo.
- Ajuste fino de parámetros de árbol de draft: los operadores de SGLang pueden experimentar con diferentes configuraciones de árbol especulativo (tree settings) usando este modelo para encontrar el equilibrio óptimo entre tasa de aceptación y overhead.
- Entornos con GPU limitada: al ser un modelo de solo 202M parámetros, puede ejecutarse en GPUs consumer (por ejemplo, RTX 3060 o superiores) junto al modelo objetivo, permitiendo experimentar con decodificación especulativa en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no se registraron métricas de evaluación ni de seguridad" para esta ejecución de entrenamiento. Por tanto, no hay datos cuantitativos sobre tasa de aceptación, speedup o comparación con otros métodos de decodificación especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa aproximadamente 0,4 GB en bfloat16 (202,7M parámetros). Junto al modelo objetivo Qwen3-4B-Instruct-2507 (que ocupa unos 8 GB en bf16), el par completo cabe en una GPU con 12 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM para la combinación draft + objetivo. Para el draft solo, una GPU con 2 GB es suficiente, pero en la práctica siempre se ejecuta junto al modelo objetivo.
- Compatibilidad con GPU consumer: sí, cabe en RTX 3060 12GB, RTX 4070, RTX 4090, así como en GPUs de datacenter como A10, A100 o H100.
- Opciones de despliegue: SGLang (con backend flashinfer) es el destino principal. No se proporcionan archivos GGUF ni integración con llama.cpp u Ollama para este checkpoint.
- Latencia y throughput estimados: no disponibles, al no haberse publicado benchmarks. El speedup depende de la tasa de aceptación del draft, que a su vez depende de la similitud entre la distribución del draft y la del modelo objetivo.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Este modelo es un draft model específico para `Qwen/Qwen3-4B-Instruct-2507`, y no existen en la información proporcionada métricas que permitan compararlo con otras soluciones de decodificación especulativa como Medusa, EAGLE2 o draft models independientes (p. ej., los de la serie `draft-*` de otros proveedores). La comparativa dependería de la tasa de aceptación y el speedup medidos en un entorno concreto, datos que no se han publicado.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo de forma autónoma producirá salidas sin sentido o de baja calidad. Debe emparejarse exclusivamente con `Qwen/Qwen3-4B-Instruct-2507`.
- Sin métricas de seguridad: la model card indica que no se registraron métricas de evaluación ni de seguridad. No hay garantía sobre la alucinación, sesgos o comportamiento del draft en dominios específicos.
- Ventana de draft limitada a 512 tokens: el draft solo considera los últimos 512 tokens de contexto. Para secuencias más largas, la tasa de aceptación puede degradarse.
- Datos de entrenamiento restringidos: entrenado únicamente con ShareGPT (conversaciones de ChatGPT), lo que puede introducir sesgos propios de ese tipo de datos y limitar la generalización a otros dominios.
- Dependencia de SGLang: la integración requiere una versión de SGLang con soporte para EAGLE3 y configuración de árbol especulativo. No se proporcionan instrucciones para otros frameworks.
- Checkpoint intermedio: este repositorio corresponde al paso 190000 de 231810. Otros checkpoints de la colección pueden ofrecer diferente rendimiento; se recomienda evaluar varios pasos para la carga de trabajo concreta.
- `training_state.pt` incluye estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-8-step-190000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint asociado (epoch 1, step 30000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-30000
- Checkpoint asociado (epoch 3, step 75000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Guía de despliegue local de Qwen3-4B-Instruct-2507 (referencia para el modelo objetivo): https://aiindigo.com/tutorials/getting-started-with-qwen3-4b-instruct-2507-deploying-efficient-local-ai
