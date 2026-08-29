# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-0-step-20000

## Resumen

Este repositorio contiene un modelo de draft (borrador) para decodificación especulativa EAGLE3, diseñado específicamente para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es generar propuestas de tokens que el modelo objetivo verifica en paralelo, reduciendo la latencia de generación en entornos de servicio como SGLang. El autor, `huluhuluu`, publica este checkpoint (época 0, paso 20000) como parte de una colección de 47 checkpoints de un entrenamiento online con SpecForge.

El modelo emplea una arquitectura ligera de una sola capa de decoder con atención de ventana deslizante de 512 tokens, lo que lo hace extremadamente compacto: 202,7 millones de parámetros frente a los 4.000 millones del modelo objetivo. La relevancia actual radica en que la decodificación especulativa es una técnica clave para reducir costes de inferencia en modelos de tamaño medio, y este repositorio ofrece un draft model entrenado con datos ShareGPT limpios, listo para integrarse en SGLang con backend flashinfer.

Es importante destacar que se trata de un checkpoint intermedio (paso 20000 de 231810), por lo que su rendimiento de aceptación de tokens será inferior al de los checkpoints finales de la misma colección. El autor no reporta métricas de evaluación ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas key/value) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens de entrenamiento; ventana deslizante de atencion de 512 tokens |
| Tipos de cuantizacion | Solo bfloat16 (no se mencionan cuantizaciones alternativas) |
| Idiomas soportados | No disponible (datos de entrenamiento ShareGPT, probablemente multilingue pero sin especificar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, training_state.pt |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una variante de decodificación especulativa que utiliza una única capa de transformer ligera para predecir los siguientes tokens basándose en los hidden states del modelo objetivo. La arquitectura concreta es `LlamaForCausalLMEagle3` con una sola capa decoder, hidden size de 2560, intermediate size de 9728, 32 cabezas de atención y 8 cabezas key/value, con atención causal de ventana deslizante de 512 tokens. El vocabulario de draft es de 32000 tokens, mientras que el vocabulario objetivo es de 151936 tokens, lo que implica una proyección de embeddings adaptada.

El entrenamiento se realizó con el método online EAGLE3 / SpecForge, usando datos ShareGPT limpios (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, batch size global efectivo de 4, learning rate de 1e-4 con warmup lineal del 1,5% y posterior cosine annealing, weight decay 0.0, max gradient norm 0.5 y longitud máxima de secuencia de 2048 tokens. El parámetro EAGLE3 TTT length es 7 (ventana de tokens de entrenamiento en tiempo real) y la atención del draft usa `sdpa`. El backend objetivo es SGLang con flashinfer, tensor parallel size 1. Este checkpoint concreto corresponde a la época 0, paso 20000.

## Capacidades

- Generación de tokens de draft para decodificación especulativa: predice secuencias de tokens que el modelo objetivo verifica en paralelo.
- Aceleración de inferencia: reduce la latencia de generación del modelo Qwen3-4B-Instruct-2507 en entornos SGLang.
- Soporte de ventana deslizante de 512 tokens: limita el alcance de atención para reducir coste computacional del draft.
- Compatibilidad con SGLang: diseñado para usarse como ruta de draft especulativo con el backend flashinfer.
- Entrenamiento online: el método SpecForge permite actualizar el draft model durante el servicio, aunque este checkpoint es estático.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de visión o audio: es un modelo auxiliar, no un modelo de propósito general.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con latencia reducida: el draft model se integra como ruta especulativa en SGLang, permitiendo que el servidor genere más tokens por segundo sin cambiar el modelo objetivo.
- Servicio de chat multiusuario en GPU compartidas: al reducir la latencia por petición, se puede atender más concurrencia con la misma VRAM, útil en entornos con una sola GPU como A100 o RTX 4090.
- Experimentación con decodificación especulativa: investigadores pueden comparar la tasa de aceptación de este checkpoint intermedio frente a los checkpoints finales de la colección (p. ej. epoch 7, step 185000) para estudiar el efecto del entrenamiento online.
- Optimización de costes en inferencia serverless: plataformas que facturan por tiempo de cómputo se benefician de una menor latencia por generación, reduciendo el coste por petición.
- Evaluación de draft models con diferentes ventanas deslizantes: al variar el tamaño de la ventana (aquí 512), se puede medir el equilibrio entre tasa de aceptación y sobrecarga computacional.
- Integración en pipelines de fine-tuning especulativo: el checkpoint sirve como punto de partida para continuar el entrenamiento con SpecForge si se dispone de datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se registraron métricas de evaluación ni de seguridad para este run. No se proporcionan tasas de aceptación de tokens, speedup relativo ni comparaciones con otros draft models.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 202,7 millones de parámetros en bfloat16, lo que ocupa aproximadamente 0,4 GB en memoria. La VRAM total necesaria depende del modelo objetivo (Qwen3-4B-Instruct-2507) que se sirve en paralelo.
- GPU recomendadas: cualquier GPU con soporte para bfloat16 y suficiente VRAM para el modelo objetivo. Para Qwen3-4B en bf16 (unos 8 GB), una RTX 3090/4090 (24 GB) o A100 (40/80 GB) son adecuadas. El draft model en sí es trivial para cualquier GPU moderna.
- Cabe en GPU de consumo: sí, el draft model cabe en cualquier GPU con más de 1 GB de VRAM, pero el conjunto completo (draft + objetivo) requiere al menos 9-10 GB, por lo que GPUs como RTX 4060 Ti 16 GB o superiores son viables.
- Opciones de despliegue: SGLang (backend recomendado, con flashinfer), vLLM (si soporta EAGLE3 en la versión usada), y posiblemente otros frameworks que implementen especulación EAGLE3.
- Latencia y throughput estimados: no disponibles. Dependen del modelo objetivo, del tamaño del árbol de especulación configurado y de la carga del servidor.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros draft models de la misma categoría. Se puede indicar que los draft models alternativos para Qwen3-4B-Instruct-2507 incluyen los otros checkpoints de la misma colección (p. ej. epoch 7, step 185000) y potencialmente modelos EAGLE2 o Medusa, pero no hay datos públicos de rendimiento comparativo. La licencia Apache-2.0 de este modelo es más permisiva que la de muchos draft models propietarios.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo directamente para generar respuestas producirá resultados incoherentes. Debe emparejarse con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Checkpoint intermedio: corresponde a la época 0, paso 20000 de 231810. Su tasa de aceptación será previsiblemente inferior a la de los checkpoints finales. Se recomienda usar los checkpoints de épocas posteriores para producción.
- Datos de entrenamiento ShareGPT: pueden contener sesgos y contenido no filtrado; el autor no reporta mitigaciones de seguridad ni evaluaciones de sesgo.
- Ventana deslizante de 512 tokens: limita la capacidad del draft para predecir tokens que dependen de contexto más allá de 512 tokens, lo que puede reducir la tasa de aceptación en tareas de contexto largo.
- Sin métricas de seguridad: no se realizaron evaluaciones de toxicidad, sesgo o robustez. No apto para aplicaciones sensibles sin validación adicional.
- training_state.pt: contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecución de código arbitrario.
- Compatibilidad: requiere una versión de SGLang que soporte EAGLE3 y el backend flashinfer. No hay garantía de soporte en otras herramientas de inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-0-step-20000
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint posterior de la colección: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Implementación oficial de EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
