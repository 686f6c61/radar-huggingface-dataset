# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-60000

# Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-60000

## Resumen

Este repositorio contiene un checkpoint concreto (época 2, paso 60000) de un modelo de borrador (draft model) EAGLE3 entrenado para acelerar la inferencia del modelo Qwen/Qwen3-4B-Instruct-2507 mediante decodificación especulativa. El modelo ha sido desarrollado por el usuario huluhuluu utilizando el framework SpecForge, empleando datos limpios de ShareGPT en formato JSONL. No es un modelo de chat independiente: su única función es generar candidatos de tokens que el modelo objetivo valida, reduciendo la latencia y aumentando el throughput en despliegues de servidor.

El checkpoint forma parte de una serie de 47 publicaciones que cubren desde la época 0 hasta la época 9, cada una con su propio repositorio en Hugging Face. Este modelo concreto corresponde al entrenamiento sin ventana deslizante (NoWindow), con una arquitectura de una sola capa decoder y 202,7 millones de parámetros, lo que lo hace extremadamente ligero en comparación con el modelo base de 4.000 millones. Está pensado para usarse exclusivamente con SGLang como backend de inferencia, configurando la ruta del draft model dentro del algoritmo EAGLE3.

La relevancia de este modelo radica en que permite acelerar la inferencia de Qwen3-4B-Instruct-2507 sin sacrificar calidad, ya que la decodificación especulativa garantiza que la salida final sea idéntica a la del modelo original. Su licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atención, 8 cabezas clave/valor) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (máxima secuencia durante el entrenamiento; la longitud efectiva depende del modelo objetivo) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (depende del modelo objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `LlamaForCausalLMEagle3`, una variante de una sola capa decoder diseñada específicamente para la decodificación especulativa EAGLE3. Con un tamaño de capa oculta de 2560, una capa intermedia de 9728 y 32 cabezas de atención (8 para clave/valor), este draft model es sustancialmente más pequeño que el modelo objetivo (202,7M frente a 4B parámetros), lo que permite generar borradores de tokens de forma rápida y eficiente. El vocabulario del draft es de 32.000 tokens, mientras que el vocabulario objetivo es de 151.936, por lo que el draft model solo predice un subconjunto de tokens que luego son validados por el modelo principal.

El entrenamiento se realizó con SpecForge, un framework especializado en entrenamiento online de modelos de borrador. Se utilizaron datos limpios de ShareGPT en formato JSONL (la revisión exacta del dataset no se registró), con un total de 10 épocas y 231.810 pasos de optimización. El batch efectivo global fue de 4 (tamaño de batch por dispositivo 1, paralelismo de datos 4, sin acumulación de gradientes). La tasa de aprendizaje inicial fue de 1e-4 con un programa de calentamiento lineal del 1,5% seguido de decaimiento coseno. No se aplicó weight decay y el gradiente máximo se limitó a 0,5. La longitud máxima de secuencia fue de 2048 tokens, con una longitud de TTT (test-time training) de 7 para EAGLE3. La atención del draft utiliza `sdpa` (scaled dot-product attention) y el backend objetivo es SGLang con FlashInfer. El paralelismo tensorial se fijó en 1.

## Capacidades

- No es un modelo de chat independiente: no genera texto por sí mismo ni mantiene conversaciones.
- Su función es exclusivamente la de generar candidatos de tokens (draft tokens) para el modelo Qwen3-4B-Instruct-2507 durante la decodificación especulativa.
- Acelera la inferencia del modelo objetivo sin alterar la distribución de salida, garantizando resultados idénticos al modelo original.
- Compatible con el backend SGLang mediante el algoritmo EAGLE3, con parámetros configurables como número de pasos especulativos, top-k y número de tokens de borrador.
- Soporta el uso con el modelo objetivo Qwen3-4B-Instruct-2507, que a su vez ofrece capacidades multilingües, generación de código, matemáticas y razonamiento (sin modo thinking, según la ficha de Qualcomm AI Hub).
- No incluye capacidades de visión, audio ni tool calling propias; estas dependen del modelo objetivo.

## Casos de uso

- **Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia**: el draft model se integra como ruta de borrador en SGLang, reduciendo el tiempo de generación de tokens en servicios de chat o asistentes virtuales. Es adecuado para entornos donde la latencia es crítica, como atención al cliente en tiempo real.
- **Optimización de throughput en servidores de inferencia**: al acelerar la generación, permite atender más peticiones concurrentes con el mismo hardware, reduciendo el coste por consulta en infraestructura cloud.
- **Integración en pipelines de generación de código**: el modelo objetivo Qwen3-4B-Instruct-2507 destaca en tareas de programación; el draft model acelera la generación de código en herramientas de autocompletado o asistentes de desarrollo integrados en IDE.
- **Sistemas de razonamiento multi-paso**: para aplicaciones que requieren cadenas de razonamiento largas, la decodificación especulativa reduce el tiempo de cálculo sin pérdida de calidad, mejorando la experiencia en agentes conversacionales.
- **Traducción y procesamiento multilingüe**: el modelo objetivo soporta múltiples idiomas; el draft model acelera la inferencia en servicios de traducción automática o análisis de texto multilingüe.
- **Evaluación de modelos y pruebas A/B**: al mantener la misma salida que el modelo no acelerado, permite comparar el rendimiento de Qwen3-4B-Instruct-2507 en diferentes configuraciones de hardware sin introducir variables de sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no se registraron métricas de evaluación o seguridad para este run". Por tanto, no es posible ofrecer cifras de aceleración, reducción de latencia o throughput. Se recomienda realizar pruebas propias con la carga de trabajo específica para determinar el beneficio real.

## Requisitos de hardware

- El draft model ocupa aproximadamente 0,4 GB en formato safetensors (202,7M parámetros en bfloat16), por lo que su huella de VRAM es mínima.
- Los requisitos de hardware están dominados por el modelo objetivo Qwen3-4B-Instruct-2507, que necesita alrededor de 8-10 GB de VRAM en bfloat16 (o menos con cuantización).
- En conjunto, el despliegue cabe en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB) sin problemas, e incluso en GPUs de 16 GB como la RTX 4080 si se cuantiza el modelo objetivo.
- Para entornos de producción con alta concurrencia, se recomienda GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB), que permiten mayor throughput y soporte para FlashInfer.
- El despliegue se realiza mediante SGLang, que es el backend objetivo según la configuración de entrenamiento. También es posible usar vLLM si soporta EAGLE3, aunque la model card especifica SGLang como backend recomendado.
- No se proporcionan datos de latencia o throughput estimados; estos dependen de la configuración de hardware, el tamaño del batch y los parámetros especulativos (número de pasos, top-k, tokens de borrador).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3 (este checkpoint) | 202,7M | 2048 (entrenamiento) | Apache 2.0 | Draft model para Qwen3-4B-Instruct-2507 |
| MNN/Qwen3-4B-Instruct-2507-Eagle3 (ModelScope) | no disponible | no disponible | no disponible | Draft model EAGLE-3 para el mismo modelo objetivo |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B | 32.768 (según documentación de Qwen) | Apache 2.0 | Modelo de chat instruct multilingüe |

La comparativa se limita a otros draft models para el mismo modelo objetivo. No se dispone de datos de rendimiento relativos entre los distintos checkpoints de huluhuluu ni entre estos y el de MNN. La principal diferencia entre los checkpoints de huluhuluu es el número de pasos de entrenamiento y la configuración de ventana deslizante (este es "NoWindow", mientras que otros pueden incluirla). El modelo de MNN es una alternativa similar, pero su licencia y especificaciones no están documentadas en los resultados de búsqueda.

## Limitaciones y advertencias

- **No es un modelo autónomo**: no puede utilizarse para generar texto ni mantener conversaciones; debe emparejarse obligatoriamente con el modelo objetivo Qwen3-4B-Instruct-2507.
- **Sin evaluación de seguridad**: la model card indica que no se registraron métricas de evaluación ni de seguridad. No hay garantías sobre sesgos, alucinaciones o comportamiento ético del draft model, aunque al ser un componente interno, el riesgo recae principalmente en el modelo objetivo.
- **Entrenamiento limitado a ShareGPT**: los datos de entrenamiento provienen de conversaciones de ShareGPT, lo que puede introducir sesgos en la distribución de tokens que el draft model aprende. Esto podría afectar a la eficiencia de la decodificación especulativa en dominios muy diferentes a los de ShareGPT.
- **Longitud de contexto limitada**: el draft model se entrenó con una longitud máxima de 2048 tokens. Aunque el modelo objetivo soporta contextos más largos, el rendimiento del draft model fuera de ese rango no está garantizado.
- **Sin métricas de aceleración publicadas**: no se proporcionan datos de cuánto se reduce la latencia ni de la tasa de aceptación de tokens. Es necesario realizar benchmarks propios antes de adoptarlo en producción.
- **Dependencia de SGLang**: el modelo está optimizado para SGLang con FlashInfer. Su uso con otros backends de inferencia puede no ser compatible o requerir modificaciones.
- **Restricciones de uso**: aunque la licencia Apache 2.0 permite uso comercial, el modelo es un componente técnico que requiere conocimientos avanzados de decodificación especulativa para su correcta configuración.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-2-step-60000
- Checkpoint de la época 7, paso 185000 (misma serie): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Checkpoint de la época 2, paso 50000 (misma serie): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-2-step-50000
- Modelo objetivo en Hugging Face: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Implementación oficial de EAGLE (EAGLE-1, EAGLE-2, EAGLE-3) en GitHub: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Alternativa de draft model en ModelScope: https://www.modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-Eagle3
