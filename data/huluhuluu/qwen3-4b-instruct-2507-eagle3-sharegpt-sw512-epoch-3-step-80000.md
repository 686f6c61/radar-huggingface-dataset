# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-80000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-80000` es un modelo auxiliar de decodificación especulativa (draft model) basado en la técnica EAGLE3, diseñado para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es generar propuestas de tokens que el modelo objetivo valida y acepta, reduciendo la latencia de generación en entornos de producción con SGLang. Ha sido entrenado por el usuario huluhuluu mediante SpecForge, un framework de entrenamiento online para modelos de draft, sobre datos limpios de ShareGPT.

Este checkpoint concreto corresponde a la época 3, paso 80000 de un entrenamiento de 10 épocas y 231810 pasos totales. El modelo emplea una arquitectura ligera de una sola capa decoder con atención de ventana deslizante de 512 tokens, lo que le permite predecir secuencias cortas de forma rápida y eficiente. Relevancia: la decodificación especulativa es una técnica clave para reducir el coste computacional de los LLM en producción, y este modelo ofrece una implementación práctica y publicada bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder) |
| Parametros totales | 202.700.416 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 (máximo de entrenamiento); ventana de draft de 512 tokens |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | no disponible (depende del modelo objetivo Qwen3-4B-Instruct-2507) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `LlamaForCausalLMEagle3`, una variante específica de EAGLE3 para decodificación especulativa. Consta de una única capa decoder con hidden size de 2560, intermediate size de 9728, 32 cabezas de atención y 8 cabezas de clave/valor. El vocabulario del draft es de 32000 tokens, mientras que el vocabulario objetivo es de 151936, lo que permite al modelo de draft trabajar con un espacio de tokens reducido y más manejable. La atención es de tipo causal con ventana deslizante de 512 tokens (sliding window), lo que limita el alcance de atención a los últimos 512 tokens generados.

El entrenamiento se realizó con el método online EAGLE3 mediante SpecForge, sobre un dataset limpio de ShareGPT (JSONL local, sin revisión registrada). Los parámetros clave incluyen: 10 épocas, 231810 pasos de optimización, batch size efectivo de 4 (data-parallel size 4, sin acumulación de gradientes), learning rate 1e-4 con warmup lineal del 1.5% y decaimiento coseno, weight decay 0, max grad norm 0.5, y longitud máxima de secuencia de 2048 tokens. La longitud TTT (test-time training) de EAGLE3 es de 7 tokens, y el draft usa atención sdpa. El backend objetivo es SGLang con flashinfer, con tensor parallel size 1. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: predice secuencias de tokens que el modelo objetivo valida, acelerando la inferencia.
- Compatibilidad exclusiva con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`: debe emparejarse con ese modelo exacto, no con otros.
- Soporte de ventana deslizante de 512 tokens para el draft, lo que limita la memoria de atención y acelera el cálculo.
- Integración con SGLang: se usa como ruta de draft en el motor de inferencia, aprovechando la configuración EAGLE3 soportada por SGLang.
- No ofrece capacidades de chat, razonamiento, código o tool calling por sí mismo; todas las capacidades funcionales provienen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia en servicios de chat en producción: al desplegar Qwen3-4B-Instruct-2507 en SGLang, este draft model reduce la latencia por token al proponer secuencias que el modelo objetivo acepta con alta probabilidad, mejorando el throughput en cargas de trabajo de chat multi-turno.
- Reducción de costes de GPU en entornos con alta demanda: al disminuir el número de pasos de decodificación autoregresiva del modelo grande, se reduce el consumo de VRAM y el tiempo de cómputo, permitiendo servir más peticiones concurrentes con los mismos recursos.
- Optimización de pipelines de generación de texto largo: en tareas como resumen de documentos o generación de informes extensos, la ventana deslizante de 512 tokens del draft mantiene la precisión de las propuestas mientras acelera la generación de secuencias largas.
- Evaluación de técnicas de decodificación especulativa: investigadores pueden usar este checkpoint para estudiar el impacto de la ventana deslizante y la longitud TTT en la tasa de aceptación y la latencia, comparando con otros checkpoints de la misma colección.
- Despliegue en entornos con GPU limitada: dado que el draft model tiene solo 202M parámetros, cabe en GPUs de gama media junto al modelo objetivo, permitiendo aceleración sin necesidad de hardware de alta gama.
- Benchmarking de configuraciones de árbol de especulación: los operadores de SGLang pueden ajustar los parámetros del árbol de especulación (tree settings) para encontrar el equilibrio óptimo entre tasa de aceptación y sobrecarga computacional, usando este checkpoint como candidato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "No evaluation or safety metrics were recorded for this run". No hay datos de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el draft model en bf16 ocupa aproximadamente 0.4 GB de pesos (202M parámetros × 2 bytes). En la práctica, al ejecutarse junto al modelo objetivo Qwen3-4B-Instruct-2507 (que ocupa ~8 GB en bf16), se requieren al menos 10-12 GB de VRAM total para la configuración completa con SGLang.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4090, A10, L4). Para cargas de producción con alta concurrencia, se recomiendan GPUs de data center como A100 (40/80 GB) o H100.
- Cabe en GPUs consumer: sí, en GPUs de 12 GB o más, siempre que el modelo objetivo también quepa.
- Opciones de despliegue: SGLang es el backend objetivo (con flashinfer). También es posible usar el modelo con otros motores que soporten EAGLE3, aunque no se documentan alternativas.
- Latencia y throughput: no se proporcionan datos medidos. Se espera una reducción de latencia típica de la decodificación especulativa, pero depende de la tasa de aceptación y de la configuración del árbol de especulación, que deben ser ajustados mediante benchmarks propios.

## Comparativa con modelos similares

No se dispone de información sobre otros draft models de EAGLE3 comparables (mismo tamaño o misma tarea) en la documentación proporcionada. La comparativa natural sería contra otros checkpoints de la misma colección (47 checkpoints de diferentes épocas y pasos), pero no se publican métricas comparativas. El modelo base Qwen3-4B-Instruct-2507 tiene 4B parámetros, pero no es un draft model, por lo que no es directamente comparable. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Es un modelo de draft, no un modelo de chat: no debe usarse de forma independiente para generar respuestas. Requiere emparejamiento con el modelo objetivo Qwen3-4B-Instruct-2507.
- No se registraron métricas de evaluación ni de seguridad durante el entrenamiento: no hay garantías sobre la calidad de las propuestas ni sobre sesgos o alucinaciones.
- El checkpoint está entrenado con datos de ShareGPT, que pueden contener sesgos lingüísticos y temáticos; no se especifica la composición exacta del dataset ni su idioma.
- La ventana deslizante de 512 tokens limita la capacidad del draft para proponer tokens basados en contexto muy largo; para secuencias superiores a 512 tokens, la tasa de aceptación puede degradarse.
- El uso en producción requiere ajustar los parámetros del árbol de especulación en SGLang; un ajuste incorrecto puede reducir el rendimiento en lugar de mejorarlo.
- El archivo `training_state.pt` incluido en el repositorio contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- Licencia Apache 2.0 permite uso comercial, pero el modelo objetivo Qwen3-4B-Instruct-2507 tiene su propia licencia (probablemente Apache 2.0 también, pero debe verificarse).

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-80000
- Colección de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507 (referencia indirecta; no se proporciona URL directa en la información)
- Repositorio oficial de EAGLE-Qwen3 (implementación de EAGLE-1/3): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Información sobre Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
