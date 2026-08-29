# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-165000

## Resumen

Este repositorio contiene un checkpoint concreto del modelo de borrador (draft model) EAGLE3 entrenado de forma online con SpecForge para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un modelo auxiliar de decodificación especulativa, no de un modelo de chat independiente: su única función es acelerar la generación de texto del modelo principal proponiendo secuencias de tokens plausibles que el modelo objetivo verifica en paralelo.

El checkpoint corresponde a la época 7, paso 165000, de un entrenamiento de 10 épocas y 231810 pasos sobre un dataset ShareGPT limpiado. La arquitectura es una variante de Llama con una única capa de decoder, tamaño oculto 2560, 32 cabezas de atención y 8 cabezas clave/valor, con 202,7 millones de parámetros en total. Está diseñado para ejecutarse con SGLang usando el algoritmo EAGLE3, y se publica bajo licencia Apache 2.0.

La relevancia de este modelo radica en que permite reducir la latencia de inferencia del Qwen3-4B-Instruct-2507 en entornos de producción, manteniendo la calidad del modelo base sin necesidad de modificar sus pesos. Es parte de una colección de 47 checkpoints publicados por el mismo autor, cada uno en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate size 9728, 32 heads, 8 KV heads, vocabulario draft 32000, vocabulario objetivo 151936) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Depende del modelo base (Qwen3-4B-Instruct-2507: 8K tokens); el entrenamiento del draft usó secuencias de maximo 2048 tokens |
| Tipos de cuantizacion | bf16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible (el modelo base es multilingue; el entrenamiento del draft uso ShareGPT, mayoritariamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una arquitectura diseñada para decodificación especulativa. Consiste en una única capa de decoder ligera que predice los siguientes tokens basándose en el hidden state del modelo objetivo, permitiendo que el modelo principal verifique múltiples tokens candidatos en un solo paso. La implementación usa atención sdpa y está pensada para el backend SGLang con flashinfer.

El entrenamiento se realizó de forma online con SpecForge, un método que entrena el modelo de borrador mientras el modelo objetivo genera datos, sobre un dataset ShareGPT limpiado (la revisión exacta del dataset no se registró). Los hiperparámetros incluyen: 10 épocas, 231810 pasos de optimizador, batch global efectivo de 4, learning rate 1e-4 con warmup lineal del 1.5% y decaimiento coseno, weight decay 0.0, gradiente maximo 0.5, y longitud máxima de secuencia 2048. El EAGLE3 TTT length es 7 y el tensor parallel size es 1.

No se aplicó una ventana deslizante en esta ejecución estándar. El checkpoint incluye `model.safetensors`, `config.json` y `training_state.pt` (este último solo para reanudar entrenamiento en entornos de confianza).

## Capacidades

- Aceleración de inferencia para el modelo Qwen3-4B-Instruct-2507 mediante decodificación especulativa EAGLE3.
- Generación de múltiples tokens candidatos por paso (configurable con `--speculative-num-steps` y `--speculative-num-draft-tokens`).
- Integración nativa con SGLang a través del parámetro `--speculative-draft-model-path`.
- No es un modelo de chat ni tiene capacidades propias de razonamiento, generación de código, tool calling o funciones de agente.
- No soporta thinking mode, visión ni audio.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia: el draft model se usa como componente de aceleración en un servidor SGLang, reduciendo el tiempo de generación de tokens sin alterar la calidad del modelo objetivo.
- Servicio de chat multiusuario: en un backend con SGLang, el draft model permite atender más peticiones concurrentes al disminuir el tiempo de cómputo por respuesta, útil para aplicaciones de atención al cliente o asistentes virtuales.
- Evaluación de rendimiento de decodificación especulativa: investigadores pueden comparar este checkpoint con otros de la misma colección (47 checkpoints) para estudiar el efecto del número de pasos de entrenamiento en la tasa de aceptación de tokens.
- Optimización de costes de inferencia: al reducir los pasos de autogeneración del modelo principal, se disminuye el consumo energético y el uso de GPU en entornos con cargas de trabajo intensivas.
- Desarrollo de sistemas de generación de código en tiempo real: el Qwen3-4B-Instruct-2507 es capaz de generar código, y el draft model acelera la respuesta en herramientas de autocompletado o asistentes de programación.
- Investigación sobre modelos de borrador: el repositorio sirve como referencia para implementar y ajustar EAGLE3 con SpecForge, incluyendo los parámetros de entrenamiento detallados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para esta ejecucion. No se proporcionan datos de latencia, throughput ni tasa de aceptacion de tokens.

## Requisitos de hardware

- El draft model en bf16 ocupa aproximadamente 405 MB (202.7M parametros × 2 bytes). El modelo base Qwen3-4B-Instruct-2507 en bf16 ocupa unos 8 GB, por lo que el conjunto completo requiere al menos 8.5 GB de VRAM sin cuantizacion.
- Con cuantizacion del modelo base (por ejemplo, AWQ o GPTQ), el requisito total puede bajar a unos 5-6 GB, permitiendo su ejecucion en GPUs consumer como RTX 3060 12GB, RTX 4070, o RTX 4090.
- Para despliegue en produccion se recomienda al menos una GPU con 16 GB de VRAM (por ejemplo, A100 40GB, L4, o RTX 4090) para dejar margen a la cache KV y al propio draft model.
- El modelo esta diseñado para SGLang con backends flashinfer; tambien puede usarse con vLLM si este soporta EAGLE3 (no confirmado en la informacion disponible).
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas contra otros draft models de EAGLE3 para Qwen3. Como referencia cualitativa, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-165000 | 202.7M | 2048 (entrenamiento) | Apache 2.0 | Draft para Qwen3-4B-Instruct-2507 |
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000 | 202.7M (presumible) | 2048 (entrenamiento) | Apache 2.0 | Draft para Qwen3-4B-Instruct-2507 (checkpoint posterior) |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B | 8K | Apache 2.0 | Modelo de chat instruct |

La comparativa directa en rendimiento (tasa de aceptacion, latencia) no esta disponible en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo de chat ni debe usarse de forma independiente; solo tiene sentido como parte de un sistema de decodificacion especulativa con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507`.
- El entrenamiento se realizo sobre ShareGPT, que contiene principalmente datos en ingles; el draft model puede tener un rendimiento suboptimo en otros idiomas si el modelo objetivo genera en ellos.
- La longitud maxima de secuencia durante el entrenamiento fue de 2048 tokens; aunque el modelo base soporta 8K, el draft model no ha sido validado para secuencias mas largas y podria degradar su tasa de aceptacion.
- No se registraron metricas de evaluacion ni de seguridad; no hay garantias sobre sesgos, alucinaciones o comportamientos toxicos.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza por riesgo de ejecucion de codigo arbitrario.
- Los parametros de arbol de especulacion (num-steps, topk, num-draft-tokens) son valores iniciales; deben ser ajustados mediante pruebas de rendimiento para cada carga de trabajo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tambien esta bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-165000
- Checkpoint hermano (epoch 7, step 185000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementacion oficial EAGLE para Qwen3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
