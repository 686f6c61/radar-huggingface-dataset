# Jongbin-kr/llama3.1-8b-instruct_math_RFT-gold_k10_lora-r16a32_lr1e-4_ep3_n2000

## Resumen

El modelo `Jongbin-kr/llama3.1-8b-instruct_math_RFT-gold_k10_lora-r16a32_lr1e-4_ep3_n2000` es un adaptador LoRA entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` por el usuario Jongbin-kr. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (0,2 GB) que debe cargarse junto al modelo base de Meta para su uso. Su propósito es mejorar el razonamiento matemático del modelo base mediante *rejection-sampling fine-tuning* (RFT) sobre muestras generadas por el propio modelo.

El entrenamiento emplea 2.000 problemas del split de entrenamiento de MATH (`DigitalLearningGmbH/MATH-lighteval`, estratificado por nivel, semilla 42). Para cada problema se generan 10 muestras con Llama-3.1-8B-Instruct (temperatura 0,7, top_p 1,0) y se seleccionan las correctas mediante la variante `gold`, que utiliza las etiquetas reales (el primer ejemplo calificado como correcto). Es, por tanto, un límite superior teórico del pipeline RFT: la precisión de los datos de entrenamiento es del 100 %, con 1.761 ejemplos efectivos tras descartar los problemas sin ninguna muestra correcta.

La relevancia es metodológica: el autor compara cinco estrategias de selección (random, sc, llm-choice, jev-noul y gold) sobre las mismas muestras, mostrando que solo la selección con etiquetas (`gold`) supera al modelo base en MATH-500 (53,2 % frente a 49,2 %). Es un recurso útil para investigadores que estudien RFT, self-training y selección de datos, no tanto como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8,03 mil millones (modelo base); adaptador LoRA de rango 16 sobre todas las proyecciones lineales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite bf16, fp16, int8, int4 y GGUF) |
| Idiomas soportados | no disponible (heredados del modelo base: principalmente ingles, con soporte multilingue declarado por Meta) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors o formato compatible |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de Llama 3.1 con 8.000 millones de parametros. El LoRA tiene rango r=16, alpha=32, dropout 0,05 y se aplica a todas las proyecciones lineales. El entrenamiento usa learning rate 1e-4 con scheduler coseno, warmup del 3 %, 3 épocas, batch efectivo de 32, loss solo sobre la completion, precisión bf16 y semilla 42 en una única ejecución.

El pipeline es RFT con rejection sampling: se generan 10 muestras por problema de MATH con el prompt `<problem>\n\nPlease reason step by step, and put your final answer within \boxed{}.`. La variante `gold` selecciona el primer ejemplo calificado como correcto usando las etiquetas del dataset, descartando los problemas sin ninguna muestra válida (de 2.000 quedan 1.761). No hay RLHF ni DPO; es SFT supervisado sobre datos autogenerados y filtrados. El autor advierte que con una sola semilla de entrenamiento por selección, diferencias inferiores a 2-3 puntos pueden ser ruido.

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso (heredadas del modelo base).
- Razonamiento matemático reforzado: resolución de problemas de competición con respuesta final en formato `\boxed{}`.
- Generación de código y matemáticas (capacidades del modelo base Llama 3.1 8B Instruct).
- Soporte de tool calling / function calling (heredado del modelo base).
- Soporte de agentes y razonamiento multi-paso (heredado del modelo base).
- Capacidades multilingües del modelo base (no verificadas específicamente en este adaptador).
- No incorpora visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación en RFT y self-training: replicar el pipeline de selección (`gold`, `sc`, `llm-choice`, `jev-noul`) sobre las mismas muestras para estudiar el efecto de la precisión de los datos en el rendimiento final.
- Evaluación de límites superiores en destilación de razonamiento: usar `gold` como referencia teórica frente a métodos sin etiquetas como `jev-noul` o `llm-choice`.
- Resolución de problemas matemáticos de nivel competición en entornos de investigación, con salida estructurada en `\boxed{}` para extracción automática de la respuesta.
- Generación de datos sintéticos matemáticos: el adaptador puede producir cadenas de razonamiento que sirvan como semilla para otros pipelines de destilación.
- Fine-tuning posterior sobre dominios matemáticos específicos: al ser un adaptador LoRA ligero (0,2 GB), se puede componer o continuar entrenando sin tocar el modelo base.
- Docencia e investigación educativa: analizar las cadenas de razonamiento generadas para estudiar errores y patrones de resolución.
- Integración en pipelines de evaluación automática con `math-verify` para medir precisión en MATH-500.

## Benchmarks y rendimiento

Evaluación sobre MATH-500 (`HuggingFaceH4/MATH-500`) con decodificación greedy y `math-verify`. La columna "data precision" es la proporción de ejemplos de SFT cuya respuesta final es correcta.

| Selección | Ejemplos SFT | Precisión de datos (%) | Precisión en eval (%) |
|---|---|---|---|
| base (sin SFT) | — | — | 49,2 |
| random | 2000 | 63,2 | 49,0 |
| sc | 2000 | 79,8 | 49,2 |
| llm-choice | 2000 | 72,1 | 50,6 |
| jev-noul | 2000 | 80,0 | 50,4 |
| **gold** (este adaptador) | 1761 | 100,0 | 53,2 |

El autor advierte que, con una sola semilla de entrenamiento por selección, diferencias inferiores a 2-3 puntos pueden ser ruido.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache.
- En cuantización int8: en torno a 8-9 GB; en int4/GGUF Q4: en torno a 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en bf16; RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto limitado; en RTX 3090/4080 mediante cuantización int8/int4.
- El adaptador LoRA en sí ocupa unos 0,2 GB y se carga sobre el modelo base con `peft`.
- Opciones de despliegue: `transformers` + `peft` (flujo nativo del autor), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (gold) | 8B + LoRA r16 | 128k | 53,2 % | llama3.1 | Hugging Face (0 descargas) |
| Llama-3.1-8B-Instruct (base) | 8B | 128k | 49,2 % | llama3.1 | Hugging Face |
| Adaptador jev-noul (mismo autor) | 8B + LoRA r16 | 128k | 50,4 % | llama3.1 | Hugging Face |
| Adaptador llm-choice (mismo autor) | 8B + LoRA r16 | 128k | 50,6 % | llama3.1 | Hugging Face |

No se dispone de datos de benchmarks frente a modelos matemáticos especializados de otros autores (p. ej. Qwen2.5-Math, DeepSeek-Math) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `meta-llama/Llama-3.1-8B-Instruct` y aplicar el adaptador con `peft`.
- La selección `gold` usa las etiquetas del dataset, por lo que es un límite superior y no un método desplegable sin anotaciones.
- Entrenado solo sobre 1.761 ejemplos de MATH; la generalización fuera de ese dominio no está verificada.
- Una única semilla de entrenamiento: diferencias de 2-3 puntos pueden ser ruido estadístico.
- Riesgo de alucinación y de sesgos heredados del modelo base Llama 3.1 8B Instruct.
- Idiomas soportados no documentados específicamente para el adaptador.
- Uso comercial sujeto a la Llama 3.1 Community License, con sus restricciones (p. ej. umbral de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable).
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes).

## Enlaces

- Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_math_RFT-gold_k10_lora-r16a32_lr1e-4_ep3_n2000
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset de evaluación: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Librería PEFT: https://github.com/huggingface/peft
