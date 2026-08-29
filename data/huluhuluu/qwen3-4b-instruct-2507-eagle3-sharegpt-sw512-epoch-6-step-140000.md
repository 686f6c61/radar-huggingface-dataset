# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-140000

## Resumen

Este repositorio contiene un checkpoint concreto del modelo de draft EAGLE3 entrenado en línea con SpecForge sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un modelo de decodificación especulativa, no de un chatbot independiente: su única función es proponer tokens candidatos para acelerar la inferencia del modelo objetivo. El checkpoint corresponde al paso 140000 de la época 6 de un entrenamiento de 10 épocas y 231810 pasos totales, sobre datos ShareGPT limpios.

El modelo emplea la arquitectura `LlamaForCausalLMEagle3` con una sola capa de decoder, tamaño oculto de 2560, ventana deslizante de atención de 512 tokens y un vocabulario de draft de 32000 tokens que se proyecta al vocabulario objetivo de 151936. Con aproximadamente 202,7 millones de parámetros y un peso de 0.4 GB en bf16, está diseñado para ejecutarse como ruta de draft en SGLang junto al modelo Qwen3-4B-Instruct-2507. Su relevancia radica en que permite reducir la latencia de generación del modelo objetivo sin modificar sus pesos, una técnica cada vez más usada en despliegues de producción con alta carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, atención causal con ventana deslizante de 512) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 (máxima secuencia de entrenamiento; ventana de draft 512) |
| Tipos de cuantizacion | bfloat16 (pesos publicados); no se documentan cuantizaciones adicionales |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una variante de decodificación especulativa que utiliza una única capa de transformer ligera para predecir múltiples tokens futuros del modelo objetivo. La arquitectura concreta es `LlamaForCausalLMEagle3` con una sola capa de decoder, tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. Emplea atención con ventana deslizante de 512 tokens (parámetro `sliding_window`), lo que limita el campo de atención del draft y reduce el coste computacional. El vocabulario de draft es de 32000 tokens, mientras que el vocabulario objetivo es de 151936, lo que requiere una capa de proyección para alinear ambos espacios.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, sobre datos ShareGPT limpios (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231810 pasos de optimizador, tamaño de lote efectivo de 4 (tamaño por dispositivo 1, paralelismo de datos 4, sin acumulación de gradientes), tasa de aprendizaje de 1e-4 con calentamiento lineal del 1.5% y posterior decaimiento coseno, weight decay 0.0 y norma de gradiente máxima 0.5. La longitud máxima de secuencia fue 2048 tokens, con una longitud TTT (test-time training) de 7 y backend objetivo SGLang con flashinfer. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Decodificación especulativa: genera secuencias de tokens candidatos (draft) para acelerar la inferencia del modelo objetivo Qwen3-4B-Instruct-2507.
- Integración con SGLang: diseñado para usarse como ruta de draft mediante los ajustes de EAGLE3 soportados por SGLang.
- Ventana deslizante de 512 tokens: limita el contexto del draft, reduciendo memoria y coste computacional frente a atención completa.
- Proyección de vocabulario: mapea el vocabulario de draft (32000) al vocabulario objetivo (151936) para alinear las predicciones con el modelo principal.
- No es un modelo de chat: no genera respuestas por sí mismo; requiere emparejarse con el modelo objetivo para cualquier tarea de generación.
- Sin capacidades de tool calling, agentes, visión ni audio: el modelo es exclusivamente un componente de aceleración de inferencia.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia: el draft model se configura como ruta especulativa en SGLang, de modo que el modelo objetivo acepta o rechaza los tokens propuestos, reduciendo el número de pasos de autodecodificación y, por tanto, la latencia por petición.
- Servicio de chat multiusuario con alto throughput: al acelerar la generación del modelo objetivo, se pueden atender más peticiones concurrentes con la misma infraestructura GPU, especialmente útil en entornos con colas de inferencia.
- Evaluación de configuraciones de árbol de draft: el checkpoint permite experimentar con distintos ajustes de árbol (tree settings) en SGLang para optimizar la tasa de aceptación según la carga de trabajo.
- Investigación en decodificación especulativa: sirve como caso de estudio de entrenamiento online EAGLE3 con SpecForge, incluyendo el efecto de la ventana deslizante de 512 tokens en la calidad del draft.
- Reanudación de entrenamiento: el archivo `training_state.pt` incluido permite continuar el entrenamiento desde el paso 140000, útil para ajustar hiperparámetros o extender el entrenamiento en entornos de investigación.
- Comparación de checkpoints: al existir 47 checkpoints publicados en la colección del autor, este repositorio permite comparar la evolución del draft model a lo largo del entrenamiento y seleccionar el punto óptimo para un despliegue concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no se registraron métricas de evaluación ni de seguridad" para este entrenamiento. No se dispone de cifras de tasa de aceptación, reducción de latencia ni comparativas con otros draft models. Se recomienda realizar un benchmark propio con la carga de trabajo objetivo antes de desplegar en producción.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 202,7 millones de parámetros en bf16 (0.4 GB), la VRAM necesaria para el draft es mínima. Sin embargo, el requisito real viene del modelo objetivo Qwen3-4B-Instruct-2507 (aproximadamente 8 GB en bf16), que debe cargarse junto al draft en la misma GPU.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede alojar ambos modelos (por ejemplo, RTX 3060 12GB, RTX 4070, L4, A10). Para despliegues con mayor concurrencia, se recomiendan A100 40GB o H100.
- Compatibilidad con GPU de consumo: sí, siempre que se use cuantización del modelo objetivo (por ejemplo, AWQ o GPTQ) y el draft en bf16. El draft en sí cabe en cualquier GPU moderna.
- Opciones de despliegue: SGLang es el backend objetivo declarado (con flashinfer). No se documenta soporte para vLLM, llama.cpp u Ollama en la model card.
- Latencia y throughput: no disponibles. Dependen de la configuración del árbol de draft, la tasa de aceptación y el hardware. Se recomienda ajustar los tree settings mediante benchmarking.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un draft model específico para Qwen3-4B-Instruct-2507, una categoría muy especializada. Como referencia alternativa, se pueden considerar:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512 (este) | 202,7 M | 2048 (draft 512) | Apache-2.0 | Draft para Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 (modelo objetivo) | ~4 B | 256K (según documentación de Qwen) | Apache-2.0 | Chat e instrucciones |
| Draft models EAGLE3 genéricos (p. ej. para Llama-3) | variable | variable | variable | Draft para otros modelos objetivo |

No se han encontrado otros draft models EAGLE3 públicos para Qwen3-4B-Instruct-2507 con los que comparar directamente. La colección del autor incluye otros checkpoints del mismo entrenamiento, pero no modelos de arquitectura distinta.

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse de forma aislada para generar respuestas; solo funciona como componente de decodificación especulativa junto al modelo objetivo.
- Sin métricas de calidad: no se registraron evaluaciones de precisión, tasa de aceptación ni seguridad durante el entrenamiento. El rendimiento real es desconocido hasta que se pruebe con la carga de trabajo concreta.
- Ventana de draft limitada a 512 tokens: el draft solo considera los últimos 512 tokens de contexto, lo que puede reducir la calidad de las predicciones en secuencias largas, aunque es una decisión deliberada para ahorrar coste.
- Dependencia de SGLang: el modelo está diseñado para el backend SGLang con flashinfer; otros entornos de inferencia pueden no soportar la arquitectura EAGLE3 o requerir adaptaciones no documentadas.
- Datos de entrenamiento no auditados: el dataset ShareGPT limpio proviene de una fuente local sin revisión registrada; puede contener sesgos o información personal, y no se documentó ningún proceso de filtrado de seguridad.
- `training_state.pt` no debe deserializarse en entornos no confiables: contiene estado del optimizador y argumentos de entrenamiento; su carga en un entorno comprometido podría ejecutar código arbitrario.
- Licencia Apache-2.0 permite uso comercial, pero el modelo objetivo Qwen3-4B-Instruct-2507 también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Sin garantía de aceleración: la eficacia de la decodificación especulativa depende de la tasa de aceptación del draft, que puede variar según el tipo de petición (código, matemáticas, diálogo) y no está medida para este checkpoint.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-6-step-140000
- Modelo objetivo (Qwen3-4B-Instruct-2507): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano (epoch 7, step 185000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Checkpoint hermano (epoch 6, step 155000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000
- Referencia de Qualcomm AI Hub sobre Qwen3-4B-Instruct-2507: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio de Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
