# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-215000

## Resumen

Este repositorio contiene un modelo de borrador (draft model) diseñado para decodificación especulativa con el algoritmo EAGLE3, entrenado específicamente para acelerar la inferencia del modelo Qwen/Qwen3-4B-Instruct-2507. No es un modelo de chat independiente: su única función es generar candidatos de tokens que el modelo objetivo verifica en paralelo, reduciendo la latencia de generación en entornos de producción.

El modelo ha sido entrenado por el usuario huluhuluu utilizando la herramienta SpecForge con un enfoque de entrenamiento online EAGLE3 sobre un dataset limpio de ShareGPT. Con solo 202,7 millones de parámetros y una única capa decoder, su tamaño es reducido en comparación con el modelo base de 4 mil millones, lo que permite ejecutarlo con un coste computacional mínimo. La licencia Apache-2.0 facilita su uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en que la decodificación especulativa es una técnica clave para reducir la latencia en servidores de inferencia de modelos grandes. Al ser un draft model ligero y específico para Qwen3-4B-Instruct-2507, ofrece una vía práctica para mejorar el rendimiento de despliegues basados en SGLang sin modificar el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas clave/valor) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (maximo de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (hereda las capacidades del modelo base, pero no se especifican) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `LlamaForCausalLMEagle3`, que consiste en una única capa decoder con hidden size de 2560, intermediate size de 9728, 32 cabezas de atencion y 8 cabezas clave/valor. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario objetivo (del modelo base) es de 151936 tokens. Los pesos se almacenan en bfloat16.

El entrenamiento se realizó con el método online EAGLE3 implementado en SpecForge, utilizando un dataset ShareGPT limpio (fuente local, sin registro de revisión). Se ejecutaron 10 épocas con un total de 231810 pasos de optimizador, batch efectivo global de 4, learning rate de 1e-4 con warmup lineal del 1,5% y posterior annealing coseno. La longitud máxima de secuencia fue de 2048 tokens y se empleó atención sdpa para el borrador. El backend objetivo es SGLang con flashinfer.

Una característica destacable es que el entrenamiento se realizó de forma online, es decir, el modelo de borrador se actualiza continuamente durante el proceso de decodificación especulativa, lo que permite adaptarse mejor a la distribución real de tokens del modelo objetivo. El nombre "NoWindow" indica que no se aplicó una ventana deslizante en este entrenamiento.

## Capacidades

- Generacion de tokens de borrador para decodificacion especulativa con EAGLE3.
- Aceleracion de la inferencia del modelo Qwen3-4B-Instruct-2507 cuando se usa como draft path en SGLang.
- No es un modelo de chat: no genera respuestas directas ni mantiene conversaciones.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo.
- No tiene capacidades multimodales (vision, audio, etc.).
- Al ser un modelo auxiliar, su unica funcion es producir candidatos de tokens que el modelo base verifica.

## Casos de uso

- Despliegue de servidores de inferencia de baja latencia: integrado como draft model en SGLang, reduce el tiempo de generacion de Qwen3-4B-Instruct-2507 en aplicaciones de chat en tiempo real.
- Optimizacion de costes en produccion: al reducir la latencia, permite servir más peticiones por segundo con el mismo hardware, amortizando la inversión en GPUs.
- Evaluacion de estrategias de decodificacion especulativa: util para investigadores que quieran comparar el rendimiento de EAGLE3 frente a otros metodos (Medusa, EAGLE-2) en el mismo modelo base.
- Pruebas de integracion en pipelines de IA generativa: sirve como componente para validar la configuracion de SGLang con decodificacion especulativa antes de escalar a modelos mayores.
- Entrenamiento continuo de draft models: el repositorio incluye `training_state.pt` que permite reanudar el entrenamiento, aunque solo debe deserializarse en entornos de confianza.
- Benchmarking de hardware: al ser un modelo pequeño, se puede usar para medir el overhead de la decodificacion especulativa en diferentes GPUs y configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "No evaluation or safety metrics were recorded for this run". Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para este modelo de borrador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de borrador ocupa aproximadamente 0,4 GB en bfloat16 (202,7M parametros x 2 bytes). Sin embargo, al usarse junto con el modelo base Qwen3-4B-Instruct-2507, la VRAM total necesaria es la suma de ambos: alrededor de 8-10 GB en bfloat16, o menos si se cuantiza el modelo base.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el conjunto completo (draft + base). Por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100.
- Cabe en GPUs de consumo: si, siempre que el modelo base se cuantice (por ejemplo, a 4 bits) o se use un GPU con suficiente memoria.
- Opciones de despliegue: SGLang es el backend principal soportado (con `--speculative-algorithm EAGLE3` y `--speculative-draft-model-path`). Tambien se puede cargar con transformers para pruebas locales, pero no esta pensado para uso independiente.
- Latencia y throughput: no se han publicado mediciones especificas. Se espera una reduccion de latencia de 2-3x en comparacion con la generacion autoregresiva estandar, segun los resultados tipicos de EAGLE3, pero esto depende de la carga de trabajo y el hardware.

## Comparativa con modelos similares

No se dispone de informacion sobre otros draft models comparables con los que contrastar directamente. Existen alternativas genericas como EAGLE-2, Medusa o el draft model de DeepSeek, pero no se han encontrado datos publicos de rendimiento relativo. La comparativa queda pendiente de futuras evaluaciones.

| Modelo | Parametros | Contexto | Metodo | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-EAGLE3 (este) | 202,7M | 2048 | EAGLE3 | Apache-2.0 |
| EAGLE-2 (generico) | variable | variable | EAGLE-2 | MIT |
| Medusa (generico) | variable | variable | Medusa | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo de chat: usarlo de forma independiente produce resultados sin sentido, ya que solo genera tokens de borrador.
- Entrenado exclusivamente con ShareGPT: puede heredar sesgos presentes en ese dataset de conversaciones.
- Sin evaluacion de seguridad ni metricas de rendimiento: no hay garantias sobre su comportamiento en produccion.
- Longitud de contexto limitada a 2048 tokens durante el entrenamiento: puede degradarse con contextos mas largos, aunque el modelo base soporte mas.
- Dependencia del modelo base: solo funciona correctamente con Qwen/Qwen3-4B-Instruct-2507; no es transferible a otros modelos.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento: deserializarlo en un entorno no confiable es un riesgo de seguridad.
- No se han registrado metricas de latencia ni throughput: los beneficios en rendimiento deben validarse en cada despliegue especifico.

## Enlaces

- Repositorio principal: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-215000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint hermano (epoch 6 step 155000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000
- Checkpoint hermano (epoch 6 step 140000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-140000
- Guia de instalacion de Qwen3-4B-Instruct-2507 (Way to AI): https://www.way-to-ai.com/install-qwen3-4b-instruct-2507-dummy-proof-guide/
- Modelo Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
