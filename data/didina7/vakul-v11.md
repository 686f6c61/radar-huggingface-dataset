# Didina7/VAKUL-v11

## Resumen

VAKUL-v11 es un adaptador LoRA publicado por el usuario Didina7 en Hugging Face, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit`, es decir, la versión de Llama 3.2 de 1B parámetros en formato Instruct que Unsloth distribuye ya cuantizada en 4 bits con bitsandbytes. No se trata por tanto de un modelo entrenado desde cero, sino de un ajuste fino ligero (PEFT) que debe cargarse junto al checkpoint base para poder utilizarse. El repositorio contiene únicamente los pesos del adaptador en safetensors y la configuración de PEFT 0.20.0.

La relevancia de esta ficha es limitada y conviene ser explícito: la model card es una plantilla sin rellenar, no se declara licencia, no se documentan idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación, y el repositorio acumula 0 descargas y 1 like desde su creación (fechada el 18 de octubre de 2026 según los metadatos). El nombre "VAKUL" no va acompañado de ninguna explicación sobre el dominio, el dataset o el objetivo del ajuste.

Por todo ello, esta ficha describe lo que se puede verificar (naturaleza del adaptador, modelo base, implicaciones de arquitectura y tamaño heredadas) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), adaptador LoRA sobre atención y proyecciones del modelo base; no es MoE |
| Parametros totales | 1.240 millones en el modelo base Llama 3.2 1B; el número de parámetros entrenables del adaptador no está documentado |
| Parametros activos | No aplica (modelo denso, no es mezcla de expertos) |
| Longitud de contexto | 131.072 tokens en el modelo base Llama 3.2 1B; la longitud usada durante el SFT del adaptador no está documentada |
| Tipos de cuantizacion | El modelo base se distribuye en 4 bits con bitsandbytes (bnb-4bit); el adaptador se publica en safetensors (precisión original del entrenamiento no documentada). Al fusionarse puede cuantizarse a GGUF/AWQ/GPTQ, pero el autor no publica versiones |
| Idiomas soportados | No disponible en la información del adaptador; el modelo base Llama 3.2 1B Instruct soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible para el adaptador; el modelo base se distribuye bajo Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` 0.20.0 |
| Modelo base | unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit |
| Tipo de ajuste | LoRA + SFT (tags: lora, sft, trl, unsloth) |
| Tamaño del repositorio | 0.0 GB según Hugging Face (adaptador de muy pocos pesos) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 1B Instruct, un transformer decoder-only denso con atención por causal masking, normalización RMSNorm pre-attention, activación SwiGLU y RoPE, con vocabulario de 128.256 tokens y ventana de contexto de 131.072 tokens en el modelo original. Llama 3.2 1B es un modelo con los embeddings atados (tied embeddings), lo que explica su reducido número de parámetros y su idoneidad para despliegue en dispositivos con poca memoria. El adaptador LoRA introduce matrices de bajo rango en las proyecciones de atención y MLP; el rango, alpha, dropout y capas objetivo no están documentados en el repositorio.

La información sobre el entrenamiento es prácticamente inexistente: los tags confirman el uso de TRL (SFTTrainer) y Unsloth, y la referencia al modelo base cuantizado en 4 bits sugiere un entrenamiento con QLoRA sobre GPU de consumo, pero no se publican dataset, número de tokens, composición de los datos, hiperparámetros (learning rate, épocas, batch size, scheduler) ni si hubo fases posteriores de DPO o RLHF. La versión de PEFT declarada es 0.20.0. No hay ninguna innovación técnica documentada asociada al adaptador.

## Capacidades

Debe tenerse en cuenta que estas capacidades son, en su mayor parte, las heredadas del modelo base Llama 3.2 1B Instruct, no verificadas para el adaptador:

- Generación de texto conversacional multi-turno, con el formato de chat de Llama 3.2 (roles system/user/assistant).
- Razonamiento básico y respuesta a instrucciones simples; la capacidad de razonamiento complejo está limitada por el tamaño de 1B parámetros.
- Generación de código y matemáticas elementales, con fiabilidad baja en tareas de varios pasos.
- Soporte de tool calling / function calling en el formato nativo de Llama 3.2 Instruct; no verificado tras el ajuste.
- Capacidad multilingüe heredada (8 idiomas oficiales), con rendimiento notablemente inferior al inglés en el modelo de 1B.
- No dispone de visión, audio ni modo "thinking" explícito.
- El autor no documenta ninguna capacidad especial, ni mejoras concretas aportadas por el ajuste SFT.

## Casos de uso

Dado que no hay documentación del ajuste, estos escenarios son planteamientos razonables para un adaptador LoRA de 1B, no casos validados:

- Prototipado rápido de asistentes conversacionales de dominio cerrado: el adaptador se carga sobre el base en 4 bits y permite iterar sobre un estilo o una tarea concreta con muy poco coste de cómputo, gracias al tamaño de 1.24B parámetros.
- Clasificación y etiquetado de texto (intenciones, categorías, sentimiento) en pipelines internos: un modelo de este tamaño puede ejecutarse en CPU o en una GPU modesta con latencia baja, y el ajuste SFT puede haber especializado el formato de salida.
- Enrutamiento de consultas en sistemas multiagente: usar el adaptador como clasificador de intención previo a un modelo mayor reduce coste por petición y requiere poca VRAM (del orden de 1-3 GB).
- Extracción de entidades o de campos estructurados en documentos cortos, siempre que la ventana efectiva se limite a unos miles de tokens y se validen las salidas con un parser.
- Generación de texto en local o en el borde (edge): al partir de un base en 4 bits y un adaptador de pocos megabytes, el conjunto fusionado puede convertirse a GGUF y ejecutarse con llama.cpp u Ollama en un portátil sin GPU dedicada.
- Base de partida para nuevos ajustes: el adaptador sirve como punto inicial para experimentos de SFT con TRL/Unsloth sobre una tarea concreta, especialmente en entornos con una sola GPU de consumo.
- Pruebas de integración de PEFT en un stack propio: útil para validar la carga de adaptadores, la fusión de pesos y el despliegue con vLLM o TGI antes de invertir en modelos mayores.
- Resumen de conversaciones o notas breves en aplicaciones de productividad, con revisión humana obligatoria por la propensión a la alucinación de un modelo de 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye ninguna sección de evaluación completada, y el autor no aporta métricas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. Tampoco se documenta una comparación con el modelo base para cuantificar el efecto del ajuste SFT.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base más adaptador fusionado): en torno a 2,5-3 GB en fp16/bf16 y 0,8-1,5 GB en cuantización de 4 bits, sin contar el espacio del KV cache, que crece con la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (RTX 3050, RTX 4060, T4, L4). Para serving con concurrencia alta, A10G, L40S o A100 si se necesita throughput elevado.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas actuales, e incluso puede ejecutarse en CPU con llama.cpp a velocidades de pocos tokens por segundo.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sin fusionar); fusión de pesos y conversión a GGUF para llama.cpp, Ollama o LM Studio; vLLM o TGI tras fusionar el adaptador en un checkpoint completo; Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles para este adaptador en concreto. Como referencia de orden de magnitud para un modelo denso de 1.2B, cabría esperar decenas de tokens por segundo en una GPU de consumo moderna y varios cientos en una A100 con batching, pero son estimaciones no medidas sobre este checkpoint.

## Comparativa con modelos similares

Los datos de parámetros, contexto y licencia de las alternativas provienen de su documentación pública; la columna de rendimiento no puede completarse porque este adaptador no aporta métricas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| VAKUL-v11 (este adaptador) | 1,24B (base) + LoRA | 131.072 en el base; SFT sin documentar | No disponible para el adaptador | Repo público, 0 descargas | No disponible |
| Llama 3.2 1B Instruct (base) | 1,24B | 131.072 | Llama 3.2 Community License | Muy extendido | Referencia frente a la que medir el adaptador; sin datos publicados aquí |
| Qwen2.5 1.5B Instruct | 1,54B | 32.768 | Apache 2.0 | Muy extendido | No comparado en la información disponible |
| Gemma 2 2B Instruct | 2,61B | 8.192 | Gemma Terms of Use | Extendido | No comparado en la información disponible |
| SmolLM2 1.7B Instruct | 1,71B | 8.192 | Apache 2.0 | Extendido | No comparado en la información disponible |

La diferencia práctica más relevante frente a estas alternativas no es de rendimiento, sino de trazabilidad: los modelos citados cuentan con model cards completas, evaluaciones publicadas y licencias explícitas, mientras que VAKUL-v11 no ofrece nada de ello.

## Limitaciones y advertencias

- Model card sin contenido: la práctica totalidad de los campos son plantillas "[More Information Needed]", por lo que se desconoce el propósito real del ajuste.
- Dataset de entrenamiento no documentado: no se puede evaluar la calidad de los datos, su procedencia ni las obligaciones legales asociadas a su uso.
- Sesgos desconocidos: al no existir información sobre la composición del corpus, no es posible caracterizar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación alto: con 1.24B parámetros, el modelo tiende a inventar hechos, citas y APIs; en producción exige validación posterior y anclaje a fuentes (RAG).
- Capacidad limitada en razonamiento multi-paso, matemáticas y código: no es un sustituto de modelos de 7B o superiores en tareas complejas.
- Cobertura de idiomas incierta: aunque el base soporta ocho idiomas, el SFT puede haber desplazado el comportamiento hacia uno solo; el castellano no está verificado.
- Ambigüedad de licencia: el adaptador no declara licencia, mientras que el modelo base está sujeto a la Llama 3.2 Community License, que impone condiciones (incluida la cláusula de denominación "Llama" y restricciones de uso para ciertos productos). El uso comercial requiere revisión legal específica.
- Ausencia de validación comunitaria: 0 descargas y 1 like implican que nadie ha reportado resultados; no hay garantía de que el adaptador cargue correctamente ni de que el ajuste haya funcionado.
- Fechas de metadatos anómalas (creación 2026-10-18), lo que dificulta evaluar la vigencia del repositorio.
- El tamaño reportado del repositorio (0.0 GB) no permite verificar el contenido real de los pesos; conviene inspeccionar los ficheros antes de integrarlo en un pipeline.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Didina7/VAKUL-v11
- Modelo base utilizado: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-unsloth-bnb-4bit
- Modelo original de Meta Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Anuncio y blog de Llama 3.2: https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Licencia comunitaria Llama 3.2: https://www.llama.com/llama3_2/license/
- Librería PEFT: https://huggingface.co/docs/peft
- TRL (SFTTrainer): https://huggingface.co/docs/trl
- Unsloth: https://github.com/unslothai/unsloth
- Referencia citada en la plantilla (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
