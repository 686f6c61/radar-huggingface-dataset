# ronnitburman/qwen3.5-0.8b-banking77-intent-lora

## Resumen

El modelo `ronnitburman/qwen3.5-0.8b-banking77-intent-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario ronnitburman que especializa el modelo base Qwen/Qwen3.5-0.8B en una tarea concreta: la clasificación de intenciones en el dominio de la banca minorista. El adaptador transforma un modelo generativo de propósito general en un clasificador que devuelve exactamente uno de los 77 nombres de intención del conjunto de datos Banking77 (PolyAI), a partir de un mensaje de un cliente de banca.

La relevancia del modelo radica en que demuestra cómo un adaptador de muy bajo coste (4,0 millones de parámetros entrenables sobre un modelo de 0,8 mil millones) puede pasar de un 38,9 % de precisión en el modelo base sin adaptar a un 90,6 % con el adaptador, manteniendo un 100 % de salidas con nombre de intención válido. Está pensado para despliegues ligeros, incluidos entornos Apple Silicon mediante MLX, y su licencia Apache 2.0 facilita el uso comercial.

El adaptador se entrenó con la librería mlx-tune sobre mlx-vlm y se distribuye tanto en formato PEFT (safetensors) como en formato MLX. El repositorio tiene un tamaño de 0,0 GB, lo que refleja que solo contiene los pesos del adaptador, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5 (adaptador de bajo rango sobre proyecciones de atención y atención lineal del modelo de lenguaje) |
| Parametros totales | 4,0 M parámetros entrenables (adaptador LoRA); el modelo base Qwen3.5-0.8B tiene 0,8 mil millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base en bf16 para MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y formato MLX (carpeta `mlx/`, mlx-vlm 0.8.0) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 sobre las proyecciones de atención y atención lineal del modelo de lenguaje Qwen3.5-0.8B. El entrenamiento se realizó con mlx-tune 0.6.0 sobre mlx-vlm 0.7.6, con AdamW a tasa de aprendizaje 2e-4, programación coseno, batch de 4 con 4 pasos de acumulación, 2 épocas y 1.188 pasos totales sobre 9.503 mensajes de entrenamiento (Banking77 train, con un 5 % reservado para validación). El entrenamiento consumió aproximadamente 4 horas en un Apple M5 Pro con un pico de memoria de 6 GB.

Una particularidad técnica documentada por el autor es la escala del LoRA: la versión de mlx-tune utilizada dividía alpha por el rango dos veces, de modo que la escala efectiva aplicada en entrenamiento y evaluación fue 0,125 en lugar de la pretendida 2,0 (alpha 32 / rango 16). Los ficheros publicados reflejan el valor real (`lora_alpha` 2 con r 16 en la configuración PEFT y `scale` 0,125 en `mlx/adapter_config.json`). El fichero `verification.json` recoge una comprobación sobre 60 mensajes de test en la que el modelo original, la copia MLX y la copia PEFT dieron respuestas idénticas en los 60 casos.

## Capacidades

- Clasificación de intenciones de banca minorista: devuelve exactamente uno de los 77 nombres de intención del conjunto Banking77 a partir de un mensaje de cliente.
- Generación de texto restringida: la salida se limita a un nombre de intención, sin texto adicional, cuando se usa el prompt y la configuración recomendados.
- Despliegue en Apple Silicon mediante MLX (mlx-vlm 0.8.0) y en entornos Python con transformers + PEFT.
- Inferencia con decodificación greedy y `enable_thinking=False` en la plantilla de chat.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo específico más allá de las heredadas del modelo base.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el adaptador clasifica cada mensaje entrante en una de las 77 intenciones (por ejemplo, `card_arrival` o `wrong_exchange_rate_for_cash_withdrawal`) y permite dirigirlo automáticamente al equipo o flujo correspondiente.
- Triaje en chatbots de atención al cliente: integrado en un sistema conversacional, identifica la intención del usuario antes de decidir la respuesta o la derivación a un agente humano.
- Análisis de voz del cliente: clasificación masiva de mensajes y transcripciones para medir qué intenciones dominan y detectar problemas recurrentes.
- Automatización de respuestas predefinidas: al mapear cada intención a una plantilla de respuesta, el modelo actúa como primer nivel de atención sin intervención humana.
- Despliegue en local sobre portátiles Apple: gracias a su tamaño (0,8B + adaptador de 4,0 M) y a su formato MLX, puede ejecutarse en un Mac con unas necesidades de memoria muy contenidas (6 GB de pico durante el entrenamiento; la inferencia es inferior).
- Prototipado rápido de clasificadores de dominio: sirve como referencia de cómo adaptar un modelo generativo pequeño a una tarea de clasificación cerrada con muy pocos recursos.
- Filtrado y priorización en colas de soporte: la salida de intención válida en el 100 % de los casos permite usar el resultado directamente en lógica de enrutamiento sin necesidad de validación posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test de Banking77 (3.080 mensajes, mismo prompt en ambos casos):

| Medida | Adaptador | Modelo base sin adaptador |
|---|---|---|
| Precisión (accuracy) | 90,6 % | 38,9 % |
| Macro-F1 | 90,5 % | 36,6 % |
| Salida con nombre de intención válido | 100 % | 93,0 % |
| Latencia mediana por mensaje (Apple M5 Pro) | 97 ms | 75 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 0,8B y el adaptador añade 4,0 M de parámetros, por lo que la huella es muy reducida (el entrenamiento tuvo un pico de 6 GB en Apple M5 Pro).
- GPU recomendadas: no disponibles en la información proporcionada; el autor valida el funcionamiento en Apple M5 Pro mediante MLX.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,8B) y del adaptador; no se especifican modelos concretos de GPU de consumo.
- Opciones de despliegue: transformers + PEFT (con `AutoModelForImageTextToText` y `PeftModel`), y mlx-vlm 0.8.0 con `python -m mlx_vlm.server --model mlx-community/Qwen3.5-0.8B-bf16 --adapter-path ./mlx`.
- Latencia y throughput: latencia mediana de 97 ms por mensaje en Apple M5 Pro con el adaptador (75 ms sin adaptador); no se publica throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.5-0.8B + LoRA) | 0,8B base + 4,0 M adaptador | no disponible | 90,6 % accuracy / 90,5 % macro-F1 | Apache 2.0 | Hugging Face (PEFT y MLX) |
| Qwen3.5-0.8B sin adaptador | 0,8B | no disponible | 38,9 % accuracy / 36,6 % macro-F1 | Apache 2.0 | Hugging Face |
| Alternativas de clasificación específicas para Banking77 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros adaptadores o clasificadores comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en las 77 intenciones de Banking77; fuera de ese dominio su comportamiento no está garantizado.
- No se documentan sesgos conocidos, pero al entrenarse sobre un conjunto de datos concreto de banca puede heredar los sesgos de dicho corpus.
- Riesgo de alucinación: aunque el autor reporta un 100 % de salidas con nombre de intención válido en test, no se garantiza en producción; conviene validar la salida contra la lista de etiquetas.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; el conjunto Banking77 está en inglés, por lo que el rendimiento en otros idiomas no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base (Qwen3.5-0.8B) y la del conjunto de datos (CC BY 4.0, con atribución a Casanueva et al., NLP4ConvAI 2020).
- Caveat de producción: el autor advierte de la discrepancia en la escala del LoRA (0,125 efectiva en lugar de 2,0); los ficheros publicados ya incorporan el valor real, pero cualquier reentrenamiento debe tenerlo en cuenta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks adicionales más allá de los indicados.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ronnitburman/qwen3.5-0.8b-banking77-intent-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Conjunto de datos Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Modelo base en formato MLX: https://huggingface.co/mlx-community/Qwen3.5-0.8B-bf16
- Paper de referencia del dataset: Casanueva et al., *Efficient Intent Detection with Dual Sentence Encoders*, NLP4ConvAI 2020 (no se proporciona URL directa en la información disponible)
