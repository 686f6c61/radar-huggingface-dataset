# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-160000

## Resumen

Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-160000 es un modelo de borrador (draft model) diseñado para decodificación especulativa, desarrollado por el usuario huluhuluu mediante entrenamiento online con el framework SpecForge y el algoritmo EAGLE3. Su función no es generar texto de forma autónoma, sino acelerar la inferencia del modelo objetivo Qwen/Qwen3-4B-Instruct-2507, proponiendo secuencias de tokens que el modelo grande verifica en paralelo, reduciendo así la latencia por token generado.

Con solo 202,7 millones de parámetros y una única capa decodificadora, este draft model emplea atención causal con ventana deslizante de 512 tokens y una longitud de contexto de entrenamiento de 2048. Se entrenó sobre datos ShareGPT limpios durante 10 épocas (231810 pasos de optimización) con un tamaño de lote efectivo de 4. El repositorio contiene el checkpoint correspondiente al paso 160000 de la época 6, dentro de una colección de 47 checkpoints publicados por el autor.

La relevancia de este modelo radica en que permite implementar decodificación especulativa EAGLE3 sobre Qwen3-4B-Instruct-2507 utilizando SGLang como backend de inferencia, una combinación que puede mejorar significativamente el rendimiento en entornos de producción donde la latencia es crítica. Su licencia Apache-2.0 facilita su uso comercial y su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decodificadora, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas KV) |
| Parametros totales | 202.700.416 (202,7M) |
| Longitud de contexto | 2048 tokens (maximo de entrenamiento), ventana deslizante de 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3-4B-Instruct-2507) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que utiliza una capa decodificadora adicional sobre el modelo objetivo. En este caso, la capa tiene un tamaño oculto de 2560, un tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de borrador de 32000 tokens (frente a los 151936 del modelo objetivo). La atención es causal con ventana deslizante de 512 tokens, lo que limita el alcance de cada token al contexto reciente y reduce el coste computacional durante el entrenamiento y la inferencia.

El entrenamiento se realizó de forma online (online EAGLE3) con SpecForge, un método que entrena el draft model mientras el modelo objetivo se ejecuta en producción, utilizando datos ShareGPT limpios. Los parámetros clave incluyen longitud de secuencia máxima de 2048, longitud de TTT (test-time training) de 7, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y decaimiento coseno, sin weight decay y con norma de gradiente máxima de 0,5. El backend de destino es SGLang con flashinfer y paralelismo tensorial de 1. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Decodificación especulativa EAGLE3: acelera la generación del modelo Qwen3-4B-Instruct-2507 proponiendo múltiples tokens candidatos que el modelo objetivo verifica en paralelo.
- Integración con SGLang: diseñado para usarse como ruta de borrador (draft path) en SGLang, con soporte para configuración de árbol de especulación.
- No es un modelo de chat independiente: no genera respuestas por sí mismo ni soporta tool calling, razonamiento multi-paso, visión u otras capacidades propias; todas las funcionalidades dependen del modelo base.
- Entrenamiento online: el checkpoint puede reanudarse mediante training_state.pt, aunque se recomienda usar solo model.safetensors para inferencia.
- Múltiples checkpoints: el autor publica 47 checkpoints en una colección, lo que permite seleccionar el paso de entrenamiento más adecuado para una carga de trabajo concreta.

## Casos de uso

- Servicios de chat con baja latencia: al integrar este draft model con Qwen3-4B-Instruct-2507 en SGLang, se puede reducir el tiempo de respuesta en aplicaciones conversacionales interactivas, donde cada milisegundo de latencia afecta a la experiencia del usuario.
- Optimización de costes de inferencia: la decodificación especulativa permite mantener el rendimiento del modelo de 4B parámetros mientras se reduce el número de pasos de generación secuenciales, lo que puede disminuir el consumo de GPU en entornos de alto volumen.
- Experimentación con EAGLE3 y SpecForge: investigadores y desarrolladores pueden utilizar este checkpoint como referencia para estudiar el comportamiento del entrenamiento online de draft models y comparar diferentes configuraciones de árbol de especulación.
- Despliegue en producción con SGLang: el modelo está diseñado para funcionar con el backend SGLang y flashinfer, por lo que puede integrarse en pipelines existentes que ya usan estas herramientas para servir modelos Qwen.
- Evaluación de checkpoints intermedios: la colección de 47 checkpoints permite probar distintos puntos de entrenamiento y seleccionar el que mejor equilibre precisión y velocidad para un caso de uso específico.
- Investigación en decodificación especulativa: al ser un modelo pequeño y con licencia Apache-2.0, es adecuado para reproducir experimentos académicos sobre aceleración de inferencia sin necesidad de recursos masivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (como MMLU, HumanEval o GSM8K) ni comparaciones de rendimiento con otros draft models. Se recomienda realizar pruebas propias con la carga de trabajo objetivo para medir la tasa de aceptación de tokens y la mejora de latencia frente a la generación autoregresiva estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el draft model en sí ocupa aproximadamente 0,4 GB (202,7M parámetros en bfloat16), pero debe desplegarse junto con el modelo base Qwen3-4B-Instruct-2507, que requiere al menos 8 GB en cuantización de 4 bits y alrededor de 16 GB en bfloat16.
- GPU recomendadas: cualquier GPU con al menos 12-16 GB de VRAM, como RTX 3090, RTX 4090, A10, A100 o H100. Para entornos de producción con SGLang, se recomienda una GPU con soporte para FlashInfer (Ampere o superior).
- Compatibilidad con GPUs de consumo: sí, una RTX 4090 o similar puede ejecutar el modelo base y el draft model sin problemas, aunque el rendimiento dependerá de la configuración de árbol de especulación.
- Opciones de despliegue: SGLang (backend principal, con flashinfer), aunque también podría integrarse en otros frameworks que soporten EAGLE3 si se adapta el formato.
- Latencia y throughput estimados: no hay datos publicados; dependerán del hardware, del tamaño del árbol de especulación y de la tasa de aceptación del draft model sobre el modelo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512 (este) | 202,7M | 2048 (SW 512) | Apache-2.0 | Draft model para decodificación especulativa |
| Qwen3-4B-Instruct-2507 (modelo base) | 4B | 32K (según documentación oficial) | Apache-2.0 | Modelo de chat instructivo sin modo thinking |
| EAGLE-2 (draft model genérico) | varía según modelo objetivo | varía | MIT (según repo oficial) | Draft model para decodificación especulativa |

La comparativa directa con otros draft models es limitada porque no se dispone de datos de rendimiento publicados para este checkpoint. La principal diferencia frente al modelo base es su tamaño reducido y su propósito específico de aceleración. Frente a EAGLE-2, EAGLE3 introduce mejoras en la eficiencia del entrenamiento online y en la calidad de las propuestas, aunque los resultados concretos dependen de la configuración.

## Limitaciones y advertencias

- No es un modelo de chat autónomo: intentar usarlo como un modelo de generación independiente producirá resultados incorrectos o vacíos; debe emparejarse con el modelo objetivo Qwen3-4B-Instruct-2507.
- Sin métricas de seguridad ni evaluación: el autor indica explícitamente que no se registraron métricas de evaluación ni de seguridad, por lo que no hay garantía sobre la calidad o el comportamiento del draft model en escenarios reales.
- Ventana de contexto limitada: la ventana deslizante de 512 tokens y la longitud máxima de 2048 pueden limitar la eficacia en tareas que requieran contexto largo, aunque el modelo base tiene una ventana mayor.
- Dependencia de SGLang: el modelo está diseñado para SGLang con flashinfer; otros frameworks podrían no soportar la arquitectura EAGLE3 sin modificaciones.
- training_state.pt sensible: el archivo de estado de entrenamiento contiene parámetros del optimizador y argumentos; solo debe deserializarse en entornos confiables para evitar riesgos de seguridad.
- Riesgo de alucinación: al ser un draft model, no genera texto final; el riesgo de alucinación recae en el modelo base, pero la calidad de las propuestas puede influir indirectamente en la salida final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-160000
- Checkpoint inicial de la colección (referencia): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-0-step-5000
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementación oficial de EAGLE (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Documentación de Qwen3 (GitHub): https://github.com/HybridMAS/qwen3
- Ficha de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
