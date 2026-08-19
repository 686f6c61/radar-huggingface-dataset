# RaspizdAI/debil-1.5-completion

## Resumen

`debil-1.5-completion` es un modelo de lenguaje causal (causal language model) de pequeño tamaño, desarrollado por RaspizdAI, con 46,5 millones de parámetros. Está diseñado exclusivamente para completar texto: dado un fragmento de contexto, predice la continuación más probable token a token. No ha sido entrenado con datasets de instrucciones ni de diálogo, por lo que no sigue órdenes ni mantiene conversaciones estructuradas.

Se trata de un modelo base (base model) pensado para tareas de autocompletado y generación de texto libre, no para asistentes conversacionales. Su arquitectura sigue el estilo GPT-2, con 8 capas ocultas, 8 cabezas de atención y una dimensión de embedding de 480. El tamaño reducido lo hace adecuado para entornos con recursos limitados, aunque su capacidad de razonamiento y coherencia es limitada en comparación con modelos más grandes.

La relevancia actual de este modelo es principalmente didáctica o para prototipos ligeros donde se necesite una generación de texto sencilla sin requisitos de calidad elevados. No se dispone de información pública sobre el contexto máximo, los idiomas soportados ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model (estilo GPT-2) |
| Parametros totales | 46.538.400 (~46,5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar, similar a GPT-2, con 8 capas ocultas, 8 cabezas de atención, dimensión de embedding de 480 y head dimension de 60. El vocabulario tiene 50.257 tokens. El objetivo de entrenamiento es la predicción del siguiente token (next-token prediction).

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. Al ser un modelo base, no incorpora capas de instrucción ni formato de chat. No se mencionan innovaciones técnicas destacables más allá de su arquitectura simple y ligera.

## Capacidades

- Generación de texto por completación: dado un prefijo, continúa la secuencia de forma autónoma.
- Modelado de lenguaje causal: puede estimar la probabilidad de una secuencia y generar texto coherente a nivel local.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No tiene capacidades de visión, audio ni modo de pensamiento explícito.
- Multilingüismo: no se ha especificado, por lo que se asume que depende de los datos de entrenamiento (desconocidos).

## Casos de uso

- Autocompletado de texto en aplicaciones simples: por ejemplo, sugerir continuaciones de frases en un editor de texto básico. El modelo predice la siguiente palabra o secuencia según el contexto dado.
- Generación de texto para prototipos y demos: cuando se necesita un generador de texto rápido y ligero para pruebas de concepto, sin requisitos de calidad alta.
- Pre-entrenamiento o fine-tuning: al ser un modelo base pequeño, puede servir como punto de partida para ajuste fino en tareas específicas de generación de texto con pocos recursos.
- Herramientas educativas: para enseñar conceptos de modelos de lenguaje y generación de texto, dado su tamaño reducido y facilidad de ejecución en CPU.
- Generación de contenido corto: como titulares, eslóganes o ideas creativas, donde la coherencia a corto plazo es suficiente.
- Investigación en eficiencia: para estudiar el comportamiento de modelos pequeños en tareas de completación sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una imagen que no puede interpretarse en este contexto, por lo que no se dispone de datos numéricos verificables sobre MMLU, HumanEval, GSM8K u otras métricas estándar.

## Requisitos de hardware

- Al tener solo 46,5M de parámetros, el modelo ocupa aproximadamente 186 MB en precisión fp32 (46.538.400 × 4 bytes). En cuantización fp16 serían unos 93 MB.
- Es ejecutable en CPU sin problemas, con latencias de milisegundos por token en hardware moderno.
- Cabe en cualquier GPU consumer (por ejemplo, GTX 1060, RTX 3060, etc.) e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con librerías como Transformers de HuggingFace, llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta adecuadamente).
- Para inferencia en producción, se puede servir con vLLM o TGI, aunque para un modelo tan pequeño no es necesario; una simple API con FastAPI sería suficiente.
- Throughput estimado: en una CPU moderna, se pueden generar decenas de tokens por segundo; en una GPU consumer, cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Uso principal |
|---|---|---|---|---|---|
| debil-1.5-completion | 46,5M | no disponible | GPT-2-like | MIT | Completación de texto |
| GPT-2 small | 124M | 1024 | GPT-2 | MIT | Generación de texto |
| DistilGPT-2 | 82M | 1024 | GPT-2 destilado | Apache-2.0 | Generación de texto eficiente |

No se dispone de resultados de benchmarks para comparar directamente el rendimiento. En términos de parámetros, `debil-1.5-completion` es significativamente más pequeño que GPT-2 small y DistilGPT-2, por lo que se espera una menor capacidad de generación coherente, aunque también un menor coste computacional. La licencia MIT permite uso comercial sin restricciones, similar a GPT-2.

## Limitaciones y advertencias

- No está entrenado para seguir instrucciones ni mantener diálogos: cualquier intento de usarlo como chatbot dará resultados pobres o incoherentes.
- Riesgo de alucinación y generación de texto sin sentido, especialmente en contextos largos o ambiguos.
- No se conoce la longitud máxima de contexto; si es corta (por ejemplo, 512 o 1024 tokens), la coherencia se degradará rápidamente en textos extensos.
- Idiomas no especificados: puede que solo funcione bien en inglés (por el vocabulario de GPT-2), pero no hay confirmación.
- No se han publicado datos de sesgos o comportamientos problemáticos; al ser un modelo pequeño, los sesgos pueden estar menos marcados, pero no se puede garantizar su ausencia.
- Para uso en producción, se recomienda evaluar exhaustivamente la calidad de las salidas y considerar un fine-tuning específico si se requiere un dominio concreto.
- La ausencia de benchmarks públicos impide conocer su rendimiento real frente a alternativas establecidas.

## Enlaces

- [HuggingFace - RaspizdAI/debil-1.5-completion](https://huggingface.co/RaspizdAI/debil-1.5-completion)
