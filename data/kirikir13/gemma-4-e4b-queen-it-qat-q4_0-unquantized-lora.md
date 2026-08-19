# kirikir13/gemma-4-E4B-Queen-it-qat-q4_0-unquantized-lora

## Resumen

Este repositorio contiene un adaptador LoRA denominado "Queen", desarrollado por el usuario kirikir13, que se aplica sobre el modelo base `google/gemma-4-E4B-it-qat-q4_0-unquantized`. Se trata de un ajuste fino por supervisión (SFT) que utiliza la librería PEFT y el stack de Unsloth, orientado a tareas de generación de texto conversacional. El adaptador tiene un tamaño de 0,1 GB y fue publicado en agosto de 2026.

El modelo base es un Gemma 4 E4B en su variante QAT (quantization-aware training) con pesos Q4_0 sin cuantizar, lo que significa que los pesos se extrajeron del pipeline de cuantización en precisión media (half-precision) para permitir compilaciones personalizadas o investigación. Gemma 4 es una familia de modelos de Google que combina arquitecturas densas y MoE, con soporte de contexto de hasta 256K tokens y más de 140 idiomas. La variante E4B es un modelo MoE con 4.000 millones de parámetros totales y aproximadamente 1.000 millones de parámetros activos, diseñado para ejecutarse en dispositivos de gama baja como teléfonos y portátiles.

La relevancia de este adaptador radica en que demuestra el flujo de trabajo de fine-tuning eficiente sobre modelos QAT ya optimizados, permitiendo a desarrolladores e investigadores adaptar Gemma 4 a dominios específicos sin necesidad de reentrenar el modelo completo. Sin embargo, la documentación proporcionada es extremadamente escasa: la model card no contiene información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia, por lo que gran parte de los datos técnicos deben inferirse del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Gemma 4 E4B (MoE) |
| Parametros totales | 0,1 GB (adaptador); modelo base: 4.000 millones |
| Parametros activos | Modelo base: ~1.000 millones (MoE) |
| Longitud de contexto | Hasta 256K tokens (modelo base) |
| Tipos de cuantizacion | Q4_0 (modelo base QAT); adaptador en precisión completa |
| Idiomas soportados | Más de 140 (modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención y MLP. Esto permite fine-tuning con un coste computacional y de memoria muy reducido en comparación con el ajuste completo. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando las librerías transformers, TRL y Unsloth, como indican las etiquetas del repositorio.

El modelo base, Gemma 4 E4B, emplea una arquitectura Mixture-of-Experts (MoE) con 4.000 millones de parámetros totales y aproximadamente 1.000 millones de activos por token. Google aplicó quantization-aware training (QAT) para que el modelo mantenga su calidad incluso tras ser comprimido a Q4_0, un formato de cuantización de 4 bits. La variante "unquantized" de este checkpoint contiene los pesos en half-precision extraídos del pipeline QAT, pensados para compilación personalizada o investigación. No se dispone de información sobre el dataset de entrenamiento del adaptador, el número de tokens utilizados ni si se aplicaron técnicas adicionales como DPO o RLHF.

## Capacidades

- Generación de texto conversacional: el adaptador está etiquetado como `text-generation` y `conversational`, por lo que su uso previsto es el diálogo multi-turno.
- Razonamiento y codificación: heredados del modelo base Gemma 4, que está diseñado para tareas de razonamiento, generación de código y matemáticas.
- Soporte multilingüe: el modelo base mantiene soporte en más de 140 idiomas, aunque no se especifica si el adaptador conserva esta capacidad.
- Tool calling y function calling: no se menciona explícitamente, pero Gemma 4 incluye soporte para estas capacidades en su versión instruct.
- Capacidades de visión: el modelo base Gemma 4 es un modelo vision-language (VLM), por lo que el adaptador podría conservar esta capacidad, aunque no está documentado.
- Modo thinking: no se menciona en la documentación disponible.

## Casos de uso

- Asistentes conversacionales especializados: el adaptador puede ajustar Gemma 4 a un dominio concreto (por ejemplo, atención al cliente de un sector específico) con un coste de entrenamiento mínimo, aprovechando la ventana de contexto de 256K tokens para gestionar historiales largos.
- Despliegue en dispositivos de borde: al combinar el modelo base QAT (diseñado para teléfonos y portátiles) con un adaptador LoRA ligero, es posible ejecutar un asistente personalizado en hardware de gama baja con menos de 4 GB de RAM.
- Investigación en eficiencia de fine-tuning: el adaptador sirve como caso de estudio para evaluar cómo se comporta LoRA sobre modelos QAT, un área de investigación activa en compresión de modelos.
- Generación de código asistida en entornos con recursos limitados: el modelo base es capaz de generar código, y el adaptador puede especializarlo en un lenguaje o framework concreto sin necesidad de una GPU de alta gama.
- Prototipado rápido de chatbots: los desarrolladores pueden cargar el adaptador con PEFT y probar variaciones de comportamiento sin duplicar el modelo base, acelerando el ciclo de iteración.
- Fine-tuning incremental en producción: si el modelo base se actualiza, el adaptador LoRA puede reentrenarse o sustituirse sin redistribuir el modelo completo, facilitando el mantenimiento de sistemas desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye métricas de evaluación, y no se proporcionan comparaciones con otros modelos. El modelo base Gemma 4 E4B ha sido evaluado por Google en tareas como MMLU, HumanEval y GSM8K, pero esos datos no están incluidos en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade una sobrecarga mínima (0,1 GB en disco). El modelo base Q4_0 requiere aproximadamente 2-3 GB de memoria, y la variante unquantized (half-precision) puede necesitar entre 6 y 8 GB.
- GPU recomendadas: el modelo base está diseñado para ejecutarse en portátiles y teléfonos. En GPU, una RTX 3060 (12 GB) o superior sería suficiente para la variante unquantized; la versión Q4_0 puede funcionar en GPUs con 4 GB o menos.
- Compatibilidad con GPU de consumo: sí, el modelo base Q4_0 cabe en GPUs de consumo como la RTX 4060 o incluso en Apple Silicon con suficiente RAM unificada.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers y PEFT. Para el modelo base, existen opciones como llama.cpp, Ollama, vLLM y TGI, aunque la compatibilidad con el adaptador LoRA dependerá del runtime.
- Latencia y throughput: no se dispone de datos medidos. En un MoE con ~1B parámetros activos, se espera una latencia de decodificación de 20-40 tokens/segundo en hardware de consumo, pero esto es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 E4B (base) | 4B totales, ~1B activos | 256K | Gemma Terms of Use | QAT, safetensors |
| Qwen3-4B | 4B densos | 32K | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B | 3B densos | 128K | Llama License | safetensors, GGUF |

El adaptador Queen no es directamente comparable con modelos completos, ya que es un complemento sobre Gemma 4 E4B. Su valor depende enteramente del modelo base. Frente a alternativas como Qwen3-4B o Llama 3.2 3B, Gemma 4 E4B ofrece una ventana de contexto muy superior (256K) y arquitectura MoE, lo que puede traducirse en menor latencia para tareas de razonamiento. Sin embargo, la licencia de Gemma 4 es más restrictiva que la Apache 2.0 de Qwen3.

## Limitaciones y advertencias

- La model card del adaptador está completamente vacía: no hay información sobre el dataset de entrenamiento, los hiperparámetros, el proceso de evaluación ni los sesgos conocidos.
- No se especifica la licencia del adaptador, lo que genera incertidumbre legal para uso comercial. El modelo base Gemma 4 está sujeto a los Gemma Terms of Use, que imponen restricciones de uso.
- El adaptador tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se han publicado benchmarks, por lo que no hay evidencia de que el adaptador mejore o mantenga la calidad del modelo base en tareas específicas.
- Al ser un adaptador LoRA sobre un modelo QAT, existe riesgo de degradación de calidad si el rango del adaptador es insuficiente o si el dataset de fine-tuning es de baja calidad.
- El modelo base es un VLM, pero no se confirma que el adaptador conserve las capacidades multimodales.
- La fecha de creación (agosto de 2026) es futura, lo que sugiere que el repositorio podría ser un experimento o un placeholder.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/kirikir13/gemma-4-E4B-Queen-it-qat-q4_0-unquantized-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Documentación de Gemma 4 QAT (Unsloth): https://unsloth.ai/docs/models/gemma-4/qat
- Anuncio de Gemma 4 con QAT: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Checkpoint similar de otro autor: https://huggingface.co/aifeifei798/gemma-4-E4B-Queen-it-qat-q4_0-unquantized
