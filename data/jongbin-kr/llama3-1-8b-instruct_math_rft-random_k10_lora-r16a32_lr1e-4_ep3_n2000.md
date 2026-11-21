# Jongbin-kr/llama3.1-8b-instruct_math_RFT-random_k10_lora-r16a32_lr1e-4_ep3_n2000

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base meta-llama/Llama-3.1-8B-Instruct, desarrollado por el usuario Jongbin-kr. No se trata de un modelo completo, sino de un ajuste fino ligero (PEFT) orientado a mejorar el razonamiento matemático mediante una técnica de autoentrenamiento denominada rejection-sampling fine-tuning (RFT) sin etiquetas. El adaptador se entrena sobre las propias muestras del modelo base, seleccionando una de ellas según distintos criterios; en esta variante concreta, la selección es aleatoria.

El modelo resulta relevante como pieza de un estudio comparativo: el autor publica varias variantes del mismo experimento (selección aleatoria, self-consistency, elección por LLM, jev-noul y gold) para medir cómo afecta la precisión de los datos de entrenamiento al rendimiento final en matemáticas. El adaptador "random" es la línea base de selección ingenua, con una precisión de datos del 63,2 % y una exactitud de evaluación del 49,0 % en MATH-500.

El adaptador es pequeño (0,2 GB en el repositorio) y se aplica sobre los pesos originales de Llama 3.1 8B Instruct, por lo que hereda su arquitectura, contexto de 128 000 tokens y licencia Llama 3.1 Community License. No se dispone de información sobre idiomas soportados más allá de los del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 8 000 millones (modelo base); el adaptador LoRA es de rango 16 (tamaño exacto del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se entrena en bf16; el modelo base admite cuantizaciones estándar de Llama 3.1) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only de 8 000 millones de parámetros con atención por grupos (GQA) y ventana de contexto de 128 000 tokens. El ajuste se realiza con LoRA de rango 16, alpha 32, dropout 0,05, aplicado a todas las proyecciones lineales, con learning rate 1e-4, scheduler coseno, warmup del 3 %, 3 épocas, batch efectivo de 32, pérdida solo sobre la completación (completion-only loss), precisión bf16 y semilla 42 en una única ejecución.

El entrenamiento sigue un esquema de rejection-sampling fine-tuning (RFT) sin etiquetas: se toman 2 000 problemas del split de entrenamiento de MATH (DigitalLearningGmbH/MATH-lighteval, estratificado por nivel, semilla 42), se generan 10 muestras por problema con el modelo base (temperatura 0,7, top_p 1,0) usando el prompt `<problem>\n\nPlease reason step by step, and put your final answer within \boxed{}.`, y se selecciona una muestra por problema. En esta variante la selección es aleatoria (la primera de las 10, cuyo orden es aleatorio). No se emplean etiquetas doradas ni verificadores externos en la selección. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso, heredados del modelo base Llama 3.1 8B Instruct.
- Razonamiento matemático con formato de respuesta final en `\boxed{}`, inducido por el prompt de entrenamiento.
- Generación de cadenas de razonamiento (step-by-step reasoning) como parte del ajuste.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada (el modelo base Llama 3.1 lo soporta; el adaptador no lo documenta).
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para el adaptador.
- Capacidades multilingües: no disponibles (no especificadas en la model card).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre autoentrenamiento: el adaptador sirve como línea base "random" en el estudio comparativo de selección de muestras para RFT, permitiendo medir el efecto de la precisión de los datos frente a otras estrategias (sc, llm-choice, jev-noul, gold).
- Resolución de problemas matemáticos de competición: el adaptador está ajustado para producir razonamiento paso a paso y respuesta final en `\boxed{}`, adecuado para experimentos sobre el dataset MATH.
- Evaluación de técnicas de PEFT: al ser un adaptador LoRA de rango 16 sobre un modelo de 8B, es útil para estudiar el impacto de hiperparámetros de LoRA en tareas de razonamiento matemático.
- Reproducción de experimentos: el repositorio documenta semilla, datos, prompt y configuración de entrenamiento, lo que facilita replicar el pipeline de RFT.
- Generación de datos sintéticos de razonamiento: las muestras del modelo pueden usarse como material para otros pipelines de destilación o filtrado, dado el formato estructurado de las respuestas.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0,2 GB sobre un modelo de 8B, puede cargarse junto al modelo base en GPUs de consumo con cuantización, aunque no se documentan requisitos concretos.

## Benchmarks y rendimiento

Evaluación en MATH-500 (`HuggingFaceH4/MATH-500`), decodificación greedy, verificación con math-verify. La precisión de datos es la proporción de ejemplos de SFT cuya respuesta final es correcta.

| Selección | Ejemplos SFT | Precisión de datos (%) | Exactitud evaluación (%) |
|---|---|---|---|
| base (sin SFT) | — | — | 49,2 |
| **random (este adaptador)** | 2000 | 63,2 | 49,0 |
| sc | 2000 | 79,8 | 49,2 |
| llm-choice | 2000 | 72,1 | 50,6 |
| jev-noul | 2000 | 80,0 | 50,4 |
| gold | 1761 | 100,0 | 53,2 |

El autor advierte que se trata de una única semilla de entrenamiento por selección y que las diferencias inferiores a 2-3 puntos pueden ser ruido. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; el modelo base Llama 3.1 8B requiere aproximadamente 16 GB en bf16 y en torno a 5-6 GB en cuantización de 4 bits (estimación estándar, no documentada en la model card).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del modelo base, cabría en GPUs de consumo de gama alta con cuantización (por ejemplo, RTX 3090/4090 de 24 GB) y en GPUs de datacenter (A100, H100) sin cuantizar.
- ¿Cabe en GPU de consumo? No documentado; el adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base completo.
- Opciones de despliegue: no documentadas; el adaptador se carga con `peft.PeftModel` sobre `transformers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (random) | 8B + LoRA r16 | 128k | 49,0 | llama3.1 | Hugging Face |
| Variante sc (mismo autor) | 8B + LoRA r16 | 128k | 49,2 | llama3.1 | Hugging Face |
| Variante llm-choice (mismo autor) | 8B + LoRA r16 | 128k | 50,6 | llama3.1 | Hugging Face |
| Variante gold (mismo autor) | 8B + LoRA r16 | 128k | 53,2 | llama3.1 | Hugging Face |
| Llama 3.1 8B Instruct (base) | 8B | 128k | 49,2 | llama3.1 | Hugging Face |

No se dispone de comparaciones con otros modelos matemáticos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador "random" no mejora al modelo base en MATH-500 (49,0 % frente a 49,2 %); su interés es experimental, no de rendimiento.
- La precisión de los datos de entrenamiento es baja (63,2 %), lo que introduce ejemplos con respuestas incorrectas en el ajuste.
- Resultados basados en una única semilla de entrenamiento; el autor advierte que las diferencias menores de 2-3 puntos pueden ser ruido.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma más allá de las del modelo base.
- Licencia Llama 3.1 Community License: restricciones para uso comercial y obligaciones de atribución según los términos de Meta; debe revisarse antes de producción.
- El adaptador requiere cargar el modelo base completo, por lo que los requisitos de hardware son los de Llama 3.1 8B.
- No se documenta soporte de tool calling, agentes ni modo thinking para este adaptador concreto.

## Enlaces

- Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_math_RFT-random_k10_lora-r16a32_lr1e-4_ep3_n2000
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
