# aghasalim/siba-meristem-1.0

## Resumen

SIBA Meristem 1.0 es un adaptador LoRA de ajuste fino supervisado sobre el modelo base Qwen2.5-3B-Instruct, desarrollado por SIBA (aghasalim) con el objetivo de mejorar el soporte del azerí y otras lenguas del Cáucaso y Eurasia (ruso, inglés y turco) en tareas de instrucción multilingüe. El modelo cuenta con 3.085.938.688 parámetros totales (unos 42 millones entrenables en el adaptador) y hereda la ventana de contexto de 32.768 tokens nativos de Qwen2.5, ampliable a 131.072 tokens mediante RoPE scaling.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de adaptación lingüística de bajo coste mediante QLoRA de 4 bits con Unsloth, entrenado sobre 167.785 pares de instrucción multilingües (~32,5 millones de tokens). Por otro, y de forma igualmente importante, el autor publica de manera transparente que el modelo rinde por debajo de su propio modelo base en la evaluación azbench: 32,9 % frente a 39,5 % de media en la versión 1.0, y 38,9 % frente a 39,4 % en la versión reparada 1.0.1. Es, por tanto, un artefacto de investigación útil como referencia metodológica y como ejemplo de publicación honesta de resultados negativos, no un modelo recomendado para producción.

La licencia es la Qwen Research License (solo investigación, no comercial), corregida por el autor el 25 de septiembre de 2026 tras detectar un etiquetado erróneo como Apache 2.0. El repositorio ocupa 4,1 GB e incluye pesos en safetensors, adaptadores LoRA y una cuantización GGUF Q4_K_M de 1,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 3.085.938.688 (~3B) |
| Parametros activos | no disponible (no es MoE; ~42M entrenables en el adaptador) |
| Longitud de contexto | 32.768 tokens nativos (hasta 131.072 con RoPE scaling, según Qwen2.5); entrenamiento a 8.192 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (1,8 GB); QLoRA 4-bit NF4 en entrenamiento |
| Idiomas soportados | Azerí (az), ruso (ru), inglés (en), turco (tr) |
| Licencia | Qwen Research License (solo investigación, no comercial) |
| Formato de pesos | safetensors, GGUF, adaptadores LoRA/PEFT |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, y se ajusta mediante QLoRA con cuantización 4-bit NF4 (bitsandbytes) y la librería Unsloth junto con PEFT v0.20.0. La configuración del adaptador es r=16, alpha=32, dropout 0.0 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, lo que supone aproximadamente 42 millones de parámetros entrenables sobre los 3B totales. El entrenamiento usa batch size 1 con acumulación de gradientes, longitud máxima de secuencia de 8.192 tokens, precisión mixta BF16 y optimizador AdamW.

El corpus de ajuste consta de 167.785 pares de instrucción multilingües (~32,5 millones de tokens) compuestos a partir de mlabonne/FineTome-100k, mesolitica/malaysian-llm-multiturn, mesolitica/alpaca-en-ms-synthetic y tatsu-lab/alpaca. La pérdida de entrenamiento bajó de 2,491 inicial a 1,346 en el paso 250 y 1,262 en el paso 500, una reducción del 49,4 %. El detalle crítico es que el modelo se publicó en el paso 500 de un plan de 31.461 pasos, es decir, aproximadamente el 1,6 % del entrenamiento previsto. La versión 1.0.1 continúa el mismo LoRA durante 20 pasos adicionales sobre preguntas cloze de azerí con letras balanceadas, construidas a partir de Wikipedia en azerí (CC BY-SA), calculando la pérdida solo sobre la letra de respuesta.

## Capacidades

- Generación de texto conversacional e instrucciones en azerí, ruso, inglés y turco.
- Razonamiento básico y respuesta a preguntas de opción múltiple (con el sesgo documentado hacia la letra "C" en la versión 1.0).
- Comprensión lectora multilingüe y tareas de examen tipo INCLUDE y TUMLU en azerí.
- Ajuste fino adicional: al distribuirse como adaptador LoRA, permite entrenamiento posterior sobre el modelo base.
- Inferencia local en hardware de consumo mediante GGUF Q4_K_M y Ollama.
- Soporte de plantillas de chat propias de Qwen2.5 (ChatML), heredadas del modelo base.
- No se documenta soporte específico de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Investigación sobre adaptación lingüística de bajo rango: el adaptador sirve como caso de estudio reproducible de QLoRA con Unsloth sobre una lengua de bajos recursos como el azerí, con hiperparámetros y curvas de pérdida publicados.
- Reproducción de evaluaciones multilingües: útil para validar pipelines de evaluación como azbench, Belebele, INCLUDE o TUMLU en entornos locales con cuantización Q4_K_M.
- Punto de partida para ajustes posteriores: al ser un LoRA sobre Qwen2.5-3B-Instruct, un equipo puede continuar el entrenamiento con datos propios y corregir el sesgo de letra documentado.
- Despliegue experimental en hardware de consumo: con 1,8 GB en Q4_K_M y requisitos de 4 GB o más de VRAM, permite probar flujos conversacionales multilingües en portátiles o GPUs de gama media.
- Docencia y formación en IA abierta: ejemplo real de publicación de resultados negativos y de corrección de licencia, útil para enseñar buenas prácticas de transparencia.
- Prototipado de asistentes para lenguas túrquicas y caucásicas: sirve para explorar respuestas en azerí y turco, siempre con validación humana y sin uso comercial por la licencia.
- No se recomienda para atención al cliente en producción, generación de código ni tareas de razonamiento crítico, dado que rinde por debajo de su modelo base en las evaluaciones publicadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. La evaluación azbench consta de 2.148 preguntas de opción múltiple en azerí, zero-shot, con puntuación por letra exacta. Las tablas no son directamente comparables entre sí porque emplean plantillas de prompt distintas.

Pérdida de entrenamiento (model-index):

| Metrica | Valor |
|---|---|
| Initial Loss | 2,491 |
| Training Loss (step 250) | 1,346 |
| Training Loss (step 500) | 1,262 |

azbench, ejecución inicial en Q4_K_M con el prompt de sistema por defecto del modelo base:

| Modelo | Lectura (Belebele, 900) | Exámenes (INCLUDE, 548) | Escolar (TUMLU, 700) | Media |
|---|---|---|---|---|
| Modelo base | 43,9 % | 39,4 % | 35,1 % | 39,5 % |
| Meristem 1.0 | 35,8 % | 33,6 % | 29,4 % | 32,9 % |

Subconjunto de lectura, primeras 300 preguntas, Q4_K_M, temperatura 0:

| Modelo | Lectura (300) | Letras elegidas A / B / C / D |
|---|---|---|
| Modelo base | 49,0 % | 88 / 70 / 63 / 79 |
| Meristem 1.0 | 40,7 % | 15 / 27 / 233 / 25 |
| Meristem 1.0.1 | 46,3 % | 70 / 62 / 69 / 99 |

azbench completo para 1.0.1, RTX 3090, Q4_K_M vía Ollama, temperatura 0, plantilla propia de cada modelo:

| Modelo | Lectura (Belebele, 900) | Exámenes (INCLUDE, 548) | Escolar (TUMLU, 700) | Media |
|---|---|---|---|---|
| Modelo base | 45,2 % | 36,9 % | 36,0 % | 39,4 % |
| Meristem 1.0.1 | 38,9 % | 40,0 % | 37,7 % | 38,9 % |
| Responder siempre la más común | 27,9 % | 26,3 % | 42,7 % | no disponible |

## Requisitos de hardware

- VRAM estimada: 4 GB o más para inferencia en Q4_K_M (1,8 GB de pesos más overhead de contexto y KV cache); en FP16/BF16, aproximadamente 6,2 GB para los pesos más overhead.
- GPU recomendadas: RTX 3090 (usada por el autor para la evaluación completa), RTX 4090, A100 y H100 para mayor throughput; cualquier GPU con 6-8 GB de VRAM para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM (GTX 1660, RTX 3060, RTX 4060 y superiores) usando GGUF Q4_K_M.
- Opciones de despliegue: Ollama (tag `aghasalim/siba-meristem-1.0`, digest `80deca0d15a4` para `latest` = 1.0.1), llama.cpp con GGUF, transformers con PEFT para cargar el adaptador LoRA, y vLLM o TGI para servir el modelo fusionado en FP16/BF16.
- Latencia y throughput: no se han publicado mediciones de latencia o tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento azbench (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 32.768 (131.072 con RoPE scaling) | 39,4-39,5 % | Qwen Research License | Hugging Face |
| SIBA Meristem 1.0 | 3B + LoRA (~42M entrenables) | 32.768 | 32,9 % | Qwen Research License | Hugging Face, Ollama, GGUF |
| SIBA Meristem 1.0.1 | 3B + LoRA (~42M entrenables) | 32.768 | 38,9 % | Qwen Research License | Hugging Face, Ollama, GGUF |

No se dispone de datos comparativos frente a otros modelos multilingües de tamaño similar (por ejemplo, Gemma 2 2B o Llama 3.2 3B) en azbench dentro de la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base: 32,9 % frente a 39,5 % en azbench para la 1.0, y 38,9 % frente a 39,4 % para la 1.0.1. El autor lo califica explícitamente como una reparación, no una mejora.
- Entrenamiento incompleto: la versión 1.0 se publicó en el paso 500 de 31.461 previstos, lo que explica en parte el bajo rendimiento.
- Sesgo de respuesta: la versión 1.0 eligió la letra "C" en el 82 % de las respuestas del conjunto de lectura; la 1.0.1 lo corrige parcialmente (233 de 300 frente a 99 de 300).
- Licencia no comercial: Qwen Research License, uso exclusivamente de investigación. El autor descartó Apache 2.0 porque el adaptador no puede tener una licencia más laxa que el modelo base y parte de los datos (tatsu-lab/alpaca) son CC BY-NC 4.0.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; al ser un ajuste sobre un modelo de 3B con entrenamiento mínimo, el riesgo es alto en dominios especializados.
- Cobertura idiomática limitada y no cuantificada: se declaran cuatro idiomas, pero no hay métricas por idioma salvo el azerí.
- Sin datos de sesgos sociales, toxicidad ni robustez adversarial.
- No apto para producción: el propio autor indica que el próximo Meristem se construirá sobre una base con licencia comercial y solo se publicará si supera a su base en azbench.
- La inferencia en GGUF puede degradar ligeramente la calidad respecto a FP16/BF16; las comparativas publicadas usan Q4_K_M en todos los modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aghasalim/siba-meristem-1.0
- Versión 1.0.1: https://huggingface.co/aghasalim/siba-meristem-1.0/tree/main/v1.0.1
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Ollama: https://ollama.com/aghasalim/siba-meristem-1.0
- azbench (evaluación): https://siba.az/en/azbench/
- Resultados crudos de azbench: https://github.com/aghasalim/azbench/tree/master/results/ollama
- Dataset FineTome-100k: https://huggingface.co/datasets/mlabonne/FineTome-100k
- Dataset Malaysian LLM multiturn: https://huggingface.co/datasets/mesolitica/malaysian-llm-multiturn
- Dataset Alpaca EN-MS synthetic: https://huggingface.co/datasets/mesolitica/alpaca-en-ms-synthetic
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
