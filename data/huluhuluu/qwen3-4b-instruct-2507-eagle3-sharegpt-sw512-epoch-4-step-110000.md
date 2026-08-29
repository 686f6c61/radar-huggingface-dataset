# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-110000

## Resumen

Este repositorio contiene un modelo de draft (borrador) para decodificación especulativa, entrenado con el método EAGLE3 mediante la herramienta SpecForge. No es un modelo de chat autónomo: su única función es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` cuando se despliega con SGLang y el backend `flashinfer`. El autor, `huluhuluu`, publica 47 checkpoints de un entrenamiento online de 10 épocas; esta ficha se centra en el checkpoint de la época 4, paso 110000.

El modelo usa una arquitectura ligera de una sola capa decoder con atención de ventana deslizante de 512 tokens y un vocabulario reducido de 32000 entradas, frente al vocabulario completo de 151936 del modelo objetivo. Con solo 202,7 millones de parámetros, su coste de computación por token es muy bajo, lo que permite que el modelo objetivo genere varios tokens por paso en lugar de uno solo, reduciendo la latencia total del servicio.

La relevancia de esta publicación radica en que ofrece un draft model listo para usar con Qwen3-4B-Instruct-2507, un modelo instructivo multilingüe de 4B publicado recientemente por Alibaba. Al no existir aún un draft model oficial de EAGLE3 para esta versión, este repositorio cubre un hueco práctico para equipos que despliegan Qwen3-4B en producción con SGLang y necesitan reducir la latencia sin cambiar el modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, attention causal con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens de entrenamiento; ventana deslizante del draft de 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponibles (dataset ShareGPT limpio, sin registro de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una arquitectura diseñada para decodificación especulativa. Consiste en una única capa decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas clave/valor, más una proyección de vocabulario que reduce el espacio de 151936 (vocabulario del modelo objetivo) a 32000 tokens. La atención usa una ventana deslizante de 512 tokens, lo que limita el alcance del contexto que el draft puede considerar para predecir el siguiente token. El peso de los parámetros está en bfloat16.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, sobre un dataset ShareGPT limpio de origen local. Se ejecutaron 10 épocas con un total de 231810 pasos de optimización, batch efectivo de 4, learning rate 1e-4 con warmup lineal del 1,5% y posterior annealing cosenoidal, weight decay 0 y gradiente máximo normalizado a 0,5. La longitud máxima de secuencia fue de 2048 tokens y el parámetro TTT (test-time training) de EAGLE3 se fijó en 7. El backend objetivo es SGLang con flashinfer y tensor parallel size 1. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Decodificación especulativa: genera secuencias de tokens candidatos (draft) que el modelo objetivo verifica en paralelo, acelerando la inferencia.
- Integración con SGLang: diseñado específicamente para usarse como ruta de draft en SGLang con el modelo Qwen3-4B-Instruct-2507.
- Ventana deslizante de 512 tokens: limita el coste de atención del draft, reduciendo la latencia por token propuesto.
- Entrenamiento online (TTT): el parámetro TTT length de 7 permite adaptar el draft durante la inferencia, mejorando la tasa de aceptación en datos no vistos.
- Sin capacidades de chat directo: no puede generar respuestas por sí mismo; requiere el modelo objetivo para producir texto final.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con latencia reducida: se configura SGLang con el draft model como ruta especulativa. El draft propone 7-10 tokens por paso y el modelo objetivo los verifica, logrando un throughput mayor que la generación autoregresiva estándar.
- Servicios de chat multilingüe de bajo coste: al usar un draft de solo 200M parámetros, el coste adicional por token es mínimo, permitiendo servir el modelo de 4B en GPUs consumer con menor latencia percibida.
- Evaluación de políticas de árbol de especulación: los checkpoints publicados permiten experimentar con distintos tamaños de árbol (tree settings) en SGLang para optimizar la tasa de aceptación según la carga de trabajo.
- Investigación en decodificación especulativa: el repositorio incluye `training_state.pt` con el estado del optimizador, útil para reanudar entrenamientos o estudiar la dinámica de convergencia de EAGLE3 en datos ShareGPT.
- Integración con pipelines de inferencia que usan flashinfer: el backend objetivo está fijado a flashinfer, lo que facilita su uso en entornos que ya emplean esta librería de kernels.
- Benchmarking de draft models para Qwen3: permite comparar la tasa de aceptación y la aceleración frente a otros draft models (p. ej., EAGLE-1/2 o draft models estándar) en el mismo modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de aceptación, aceleración relativa ni latencia medida. Se recomienda realizar un benchmark propio con el workload objetivo antes de desplegar en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa aproximadamente 405 MB en bf16 (202,7M parámetros × 2 bytes). Con overhead de ejecución, cabe en cualquier GPU con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o GPU de datacenter (A10, A100, H100). El modelo objetivo Qwen3-4B requiere al menos 8-10 GB en bf16, por lo que el draft añade un coste marginal despreciable.
- Despliegue: exclusivamente con SGLang (backend flashinfer). No es compatible con llama.cpp, Ollama ni vLLM sin adaptaciones, ya que usa la arquitectura `LlamaForCausalLMEagle3` específica de EAGLE3.
- Latencia y throughput: no disponibles. Dependen del modelo objetivo, del tamaño del árbol de especulación y del hardware. Se recomienda ajustar los tree settings mediante benchmark.

## Comparativa con modelos similares

No disponible. No se han encontrado datos publicados de otros draft models específicamente entrenados para `Qwen3-4B-Instruct-2507` con EAGLE3. Como referencia general, los draft models EAGLE3 suelen lograr tasas de aceptación de 0,6-0,8 en datos de dominio similar, pero no hay cifras verificables para este checkpoint concreto.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo directamente como modelo de generación producirá resultados sin sentido. Debe emparejarse siempre con `Qwen/Qwen3-4B-Instruct-2507`.
- Sin métricas de seguridad ni evaluación: el autor declara explícitamente que no se registraron métricas de evaluación ni de seguridad. No hay garantías sobre la calidad de los tokens draft en dominios fuera de ShareGPT.
- Ventana deslizante de 512 tokens: el draft solo considera los últimos 512 tokens de contexto. En secuencias más largas, la tasa de aceptación puede degradarse.
- Dataset ShareGPT: el entrenamiento se realizó sobre ShareGPT, que contiene principalmente datos de conversación en inglés. Para cargas de trabajo en otros idiomas (p. ej., chino), la tasa de aceptación puede ser menor.
- `training_state.pt`: contiene el estado del optimizador y argumentos de entrenamiento. Solo debe deserializarse en entornos de confianza, ya que puede ejecutar código arbitrario si se manipula.
- Compatibilidad: requiere una versión de SGLang que soporte EAGLE3 y el backend flashinfer. Verificar la versión antes de su uso.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen License) que debe revisarse por separado.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-110000
- Checkpoint de la época 7: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementación oficial de EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
