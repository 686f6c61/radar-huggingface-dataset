# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-80000

## Resumen
Este repositorio contiene un checkpoint del modelo auxiliar de decodificación especulativa EAGLE3 entrenado sobre Qwen3-4B-Instruct-2507. Es un modelo de una sola capa, con 202,7 millones de parámetros, diseñado para acelerar la inferencia del modelo base mediante la generación de múltiples tokens candidatos en paralelo. No es un modelo de chat autónomo: debe emparejarse con el modelo objetivo Qwen/Qwen3-4B-Instruct-2507 para funcionar.

El entrenamiento se realizó con el método online EAGLE3 de SpecForge, utilizando datos ShareGPT limpios, durante 10 épocas y 231 810 pasos de optimización. Este checkpoint concreto corresponde a la época 3, paso 80 000, y se publica como parte de una colección de 47 checkpoints que cubren toda la ejecución. Su relevancia radica en que permite reducir la latencia de inferencia del modelo base en entornos de producción, especialmente cuando se sirve con SGLang.

El modelo está licenciado bajo Apache-2.0, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder) |
| Parametros totales | 202 700 416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con secuencias de 2048 tokens; el contexto efectivo lo define el modelo base) |
| Tipos de cuantizacion | bf16 (nativo) |
| Idiomas soportados | No disponible (hereda los del modelo base, que es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo implementa la arquitectura `LlamaForCausalLMEagle3`, que consiste en una única capa decoder con tamaño oculto 2560, tamaño intermedio 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario del modelo auxiliar es de 32 000 tokens, mientras que el del modelo objetivo es de 151 936. Los pesos están en bfloat16.

El entrenamiento se realizó con el método online EAGLE3 de SpecForge, que actualiza el modelo auxiliar durante la propia inferencia especulativa. Los datos de entrenamiento provienen de un conjunto ShareGPT limpio (fuente local, sin revisión registrada). Se usaron 10 épocas, 231 810 pasos de optimización, tamaño de lote efectivo de 4, tasa de aprendizaje 1e-4 con calentamiento lineal del 1,5 % y posterior decaimiento coseno, y una longitud máxima de secuencia de 2048 tokens. La longitud TTT de EAGLE3 se fijó en 7 y la atención del draft usa `sdpa`. El backend objetivo es SGLang con flashinfer. No se aplicó ventana deslizante en esta ejecución.

## Capacidades
- Aceleración de la decodificación especulativa: genera múltiples tokens candidatos en paralelo para el modelo base Qwen3-4B-Instruct-2507.
- Compatibilidad con SGLang: se integra como ruta de draft en el servidor de SGLang mediante el algoritmo EAGLE3.
- Reducción de latencia: al proponer varios tokens por paso, disminuye el número de iteraciones secuenciales necesarias para generar texto.
- No es un modelo de generación autónoma: no produce respuestas por sí mismo, solo asiste al modelo base.
- Sin capacidades de tool calling, agentes o razonamiento propio: todas las capacidades funcionales dependen del modelo base.

## Casos de uso
- Despliegue de Qwen3-4B-Instruct-2507 en producción con SGLang: el modelo auxiliar se carga como `--speculative-draft-model-path` para acelerar la inferencia del modelo base en servicios de chat o API.
- Reducción de costes de inferencia: al disminuir el número de pasos de decodificación, se reduce el tiempo de cómputo por petición, lo que permite servir más solicitudes con los mismos recursos.
- Mejora de la experiencia de usuario en aplicaciones interactivas: la menor latencia hace que las respuestas parezcan más fluidas, especialmente en tareas de generación larga.
- Evaluación de estrategias de decodificación especulativa: los investigadores pueden comparar el rendimiento de este checkpoint con otros de la misma colección para estudiar el efecto del número de pasos de entrenamiento.
- Optimización de servidores de inferencia con SGLang: permite ajustar parámetros como `--speculative-num-steps` y `--speculative-eagle-topk` para encontrar la configuración óptima para una carga de trabajo concreta.
- Uso como referencia para entrenar modelos auxiliares similares: el repositorio incluye `training_state.pt` con el estado del optimizador, útil para reanudar entrenamientos o reproducir experimentos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación ni de seguridad para esta ejecución.

## Requisitos de hardware
- VRAM adicional estimada: aproximadamente 0,4 GB en bf16 (202,7 M parámetros × 2 bytes).
- GPU recomendada: cualquier GPU capaz de ejecutar el modelo base Qwen3-4B-Instruct-2507. Para el modelo base se recomienda al menos 8-10 GB de VRAM en cuantizaciones bajas; el draft model añade un requisito marginal.
- Compatible con GPUs de consumo: sí, el draft model cabe en cualquier GPU con más de 1 GB de VRAM, pero el conjunto (base + draft) requiere al menos lo que exija el modelo base.
- Opciones de despliegue: SGLang (recomendado, con soporte nativo para EAGLE3). También puede usarse con el framework EAGLE-Qwen3 de GitHub, aunque la integración principal es vía SGLang.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la configuración del servidor y de la carga.

## Comparativa con modelos similares
No se dispone de datos comparativos publicados para este checkpoint. Existen otros checkpoints de la misma colección (por ejemplo, `epoch-6-step-155000` y `epoch-3-step-85000`) que pueden compararse entre sí para estudiar el efecto del número de pasos de entrenamiento, pero no hay métricas publicadas. Como alternativa, se podría comparar con otros draft models EAGLE3 para Qwen3, pero no se han encontrado datos en la información disponible.

## Limitaciones y advertencias
- Modelo auxiliar, no autónomo: no debe usarse como modelo de chat independiente; requiere emparejarse con Qwen3-4B-Instruct-2507.
- Sin evaluación de seguridad ni de calidad: la model card indica que no se registraron métricas de evaluación ni de seguridad durante el entrenamiento.
- Datos de entrenamiento ShareGPT: el conjunto ShareGPT puede contener sesgos y ruido; no se realizó un filtrado exhaustivo más allá de la limpieza mencionada.
- Longitud de secuencia limitada en entrenamiento: 2048 tokens, aunque el modelo base soporta contextos mayores; el draft model puede no funcionar óptimamente en contextos muy largos.
- Solo pesos bf16: no se ofrecen cuantizaciones alternativas; el uso en entornos con precisión reducida requeriría conversión manual.
- Dependencia de infraestructura específica: la integración principal es con SGLang; otros frameworks pueden requerir adaptaciones.
- `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por seguridad.

## Enlaces
- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-80000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementación oficial de EAGLE-Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Checkpoint hermano (epoch 6, step 155000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000
- Checkpoint hermano (epoch 3, step 85000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-85000
