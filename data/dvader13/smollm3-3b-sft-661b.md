# dvader13/smollm3-3b-sft-661b

## Resumen

Este repositorio contiene checkpoints intermedios de *supervised fine-tuning* (SFT) sobre el modelo base SmolLM3-3B de Hugging Face, publicados por el usuario dvader13. La particularidad es que se ofrecen diez fracciones de dosis de entrenamiento (del 10 % al 100 %), lo que permite estudiar el efecto de la cantidad de datos de SFT en el rendimiento final del modelo. Cada checkpoint está en formato bf16 y es de solo inferencia, sin estado de optimizador.

El modelo base, SmolLM3-3B, es un modelo de lenguaje de 3 mil millones de parámetros desarrollado por Hugging Face, diseñado para razonamiento eficiente, comprensión de contexto largo (hasta 128 000 tokens) y aplicaciones multilingües. Este repositorio, por tanto, no presenta un modelo nuevo sino una familia de variantes SFT que pueden usarse para estudiar la dinámica del entrenamiento o para despliegues donde se necesite un ajuste específico sin reentrenar desde cero.

La relevancia actual radica en la creciente necesidad de entender cómo el volumen de datos de ajuste fino impacta en las capacidades de modelos compactos, y en la disponibilidad de artefactos intermedios que facilitan este análisis. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: SmolLM3-3B) |
| Parametros totales | 3 000 millones (del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (del modelo base) |
| Tipos de cuantizacion | no disponible (los pesos se publican en bf16) |
| Idiomas soportados | no disponible para el checkpoint; el modelo base soporta 6 idiomas (arabe, aleman, español, frances, ingles, portugues) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se basa en SmolLM3-3B, un modelo transformer decoder-only con atención causal estándar. El modelo base fue preentrenado con 661 000 millones de tokens, y posteriormente se realizó un proceso de post-entrenamiento en tres fases: mid-training, SFT y DPO (según la documentación oficial). El presente repositorio contiene los checkpoints de la fase de SFT, en concreto las fracciones de dosis de 10 % a 100 %, lo que implica que cada checkpoint ha sido entrenado con una proporción distinta del dataset de SFT.

No se proporcionan detalles del dataset de SFT utilizado ni del procedimiento exacto (pérdida, optimizador, etc.). Los ficheros se publican en bf16 y están preparados únicamente para inferencia, sin estado de optimizador, lo que facilita su carga y evaluación sin necesidad de reproducir el entrenamiento.

## Capacidades

- Generación de texto autoregresiva: hereda las capacidades del modelo base SmolLM3-3B.
- Razonamiento de doble modo: el modelo base incluye un modo de razonamiento (similar a un modo "thinking") que se activa mediante un token especial. Esta capacidad se mantiene en los checkpoints SFT.
- Contexto largo: soporta hasta 128 000 tokens, útil para documentos extensos o conversaciones multi-turno.
- Multilingüismo: el modelo base soporta seis idiomas (árabe, alemán, francés, inglés, portugués y español). No se especifica si el SFT afecta a este soporte.
- Capacidades de tool calling y function calling: no documentadas específicamente para este checkpoint; se asume que dependen del dataset de SFT, que no se describe.
- Capacidades de visión o audio: no disponibles, es un modelo solo de texto.

## Casos de uso

- Investigación en entrenamiento de modelos: estudiar cómo la cantidad de datos de SFT (dosis) afecta al rendimiento en tareas de razonamiento, generación y multilingüismo. Permite trazar curvas de rendimiento frente a volumen de datos.
- Fine-tuning adicional: partir de un checkpoint con una dosis intermedia (p. ej., 50 %) para hacer fine-tuning en un dominio específico, reduciendo el tiempo de entrenamiento frente a partir del modelo base.
- Evaluación de la estabilidad del entrenamiento: comparar la consistencia de las respuestas entre las distintas fracciones para detectar overfitting o underfitting.
- Despliegue en entornos con recursos limitados: al ser un modelo de 3B, con cuantización puede ejecutarse en GPUs de consumo. Los checkpoints en bf16 requieren más memoria, pero con cuantización a 8 o 4 bits se pueden usar en tarjetas de 12 GB.
- Generación de texto multilingüe: dado que el modelo base soporta seis idiomas, puede usarse para traducción, redacción o chatbots en esos idiomas.
- Prototipado rápido: como checkpoint de SFT ya afinado, se puede usar directamente para tareas de instrucción sin necesidad de más entrenamiento, aunque la calidad dependerá de la dosis elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base SmolLM3-3B tiene resultados públicos (p. ej., en MMLU, GSM8K, HumanEval), pero no se proporcionan datos específicos para estos checkpoints de SFT. Para evaluar el rendimiento, se recomienda comparar directamente las dosis entre sí o contra el modelo base en un conjunto de pruebas propio.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 61.5 GB en bf16, lo que implica que la inferencia sin cuantización requiere al menos 61.5 GB de VRAM (p. ej., una A100 80 GB o un conjunto de GPUs). Con cuantización a 8 bits, se reduce a ~3.2 GB; con 4 bits, ~1.6 GB.
- GPU recomendadas: para bf16, NVIDIA A100 (40 o 80 GB) o H100. Para cuantización, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes.
- Despliegue: compatible con vLLM, llama.cpp, Ollama, TGI, etc., siempre que se convierta a formatos como GGUF o se use con librerías de cuantización.
- Latencia y throughput: no se dispone de datos concretos; en un RTX 4090 con cuantización 4 bits se espera una generación de ~50-100 tokens/s para un modelo de 3B.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para estos checkpoints. Como referencia, el modelo base SmolLM3-3B se puede comparar con otros modelos de 3B como Qwen2.5-3B, Phi-3-mini (3.8B) o Gemma-3-4B, pero no hay datos de rendimiento de este checkpoint frente a ellos.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero el modelo base puede heredar sesgos de los datos de preentrenamiento.
- Riesgo de alucinación: no se ha evaluado para estos checkpoints; en general, los modelos de 3B tienden a alucinar en hechos concretos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener limitaciones adicionales (no es el caso, es open-source).
- El checkpoint no incluye estado de optimizador, por lo que no se puede continuar el entrenamiento desde este punto sin recrear el estado.
- No se especifican los idiomas exactos del SFT; se asume que se mantienen los del modelo base, pero no está verificado.
- La carga en memoria de los checkpoints bf16 requiere hardware con alta VRAM; para uso práctico se recomienda cuantizar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/smollm3-3b-sft-661b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Sitio oficial SmolLM3: https://smollm3.org/
- Guía de SFT con SmolLM3: https://huggingface.co/learn/smol-course/unit1/3
- Recetas de post-entrenamiento (alignment-handbook): https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md
