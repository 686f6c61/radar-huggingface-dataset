# Bjjjhhko/Maxwell-V1-Flash-Uncensored-GGUF

## Resumen

Maxwell-V1-Flash-Uncensored-GGUF es una adaptación del modelo base Maxwell-V1-Flash (desarrollado por el equipo Maxwell, licencia Apache-2.0) publicada por el usuario Bjjjhhko y cuantizada por AtomicChat. Se trata de un adaptador LoRA de rango 1 que proyecta la dirección de rechazo fuera de cada bloque del transformer, dando como resultado una variante "uncensored" del modelo original. El repositorio contiene únicamente los pesos en formato GGUF (0,1 GB), pensados para su uso con llama.cpp mediante un port específico que añade soporte para la arquitectura Maxwell.

El modelo base declara 28.157.952 parámetros totales según los safetensors, lo que lo sitúa en la categoría de modelos pequeños (aproximadamente 28 millones de parámetros). La model card menciona 45 bloques y una arquitectura MoE con expertos enrutados y compartidos, además de un modo de razonamiento ("thinking") activado por defecto. Sin embargo, no se especifican la longitud de contexto nativa, los idiomas soportados ni los detalles del dataset de entrenamiento del modelo base.

La relevancia de esta ficha radica en que documenta una técnica de "abliteration" (eliminación de la dirección de rechazo mediante edición de activaciones) aplicada de forma medible y con puertas de calidad explícitas, incluyendo los fallos reconocidos por el autor. Es un caso útil para estudiar los compromisos entre eliminar rechazos y preservar capacidades como el tool calling o la fidelidad de la distribución de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 45 bloques según la model card; el modelo base es Maxwell-V1-Flash |
| Parametros totales | 28.157.952 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de ejecución usa `-c 32768` |
| Tipos de cuantizacion | GGUF: BF16 hasta `AD-Q4_K-IQ4_XS` (builds de AtomicChat); el adaptador LoRA se distribuye en GGUF (113 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA en GGUF); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Maxwell-V1-Flash es un transformer con mezcla de expertos (MoE) que, según la model card, contiene 45 bloques con atención, FFN densas, expertos compartidos y expertos enrutados, además de embeddings de tokens. El adaptador publicado aquí es un LoRA de rango 1 que edita 133 puntos de escritura en los flujos residuales: salida de atención, FFN densas, expertos compartidos y enrutados, y embeddings de tokens. En cada uno de los 45 bloques elimina la dirección de rechazo propia de ese bloque, calculada como la diferencia entre las activaciones medias en prompts dañinos y prompts inofensivos, con la media de los inofensivos proyectada fuera.

El adaptador se construyó a partir del split de entrenamiento del dataset `mlabonne/harmful_behaviors` y se evaluó con el split de test del mismo dataset, XSTest para sobre-rechazo y 2.000 preguntas de MMLU. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el razonamiento ("thinking") está activado por defecto y que puede desactivarse mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generación de texto con modo de razonamiento ("thinking") activado por defecto y desactivable por parámetro.
- Eliminación de rechazos en prompts dañinos: 2 de 81 rechazos con thinking off (2,5%) y 0 de 30 con thinking on, según las mediciones del autor.
- Tool calling / function calling: capacidad presente pero degradada; 10 de 20 llamadas válidas frente a 13 de 20 del original.
- Razonamiento de múltiples pasos mediante el modo thinking con presupuesto de tokens (el ejemplo usa 3.072 tokens).
- Comprensión de contexto largo: recuperación correcta en una prueba de aguja en un pajar de 30.000 tokens (3 de 3).
- Conocimiento general medido en MMLU (74,35% con adaptador frente a 75,10% del original).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el adaptador permite estudiar empíricamente cómo la proyección de la dirección de rechazo afecta a la distribución de salida, el tool calling y el rendimiento en MMLU, con métricas publicadas y comparación contra una edición aleatoria de la misma magnitud.
- Evaluación de robustez de filtros de seguridad: permite comprobar si clasificadores o guardarraíles externos detectan respuestas dañinas cuando el modelo subyacente ya no rechaza, útil para diseñar defensas en capas.
- Despliegue local en llama.cpp: el ejemplo de ejecución con `-c 32768 -ngl 99` y cuantización `AD-Q4_K-IQ4_XS` permite ejecutar el modelo en hardware de consumo, aunque requiere el port de AtomicChat sobre llama.cpp `d3c3e242c`.
- Análisis de degradación de capacidades: el fallo reconocido en tool calling (10/20 frente a 13/20) sirve como caso de estudio de los costes de las ediciones de activaciones en modelos con MoE.
- Pruebas de fidelidad distribucional: los valores de KLD (0,216 en texto neutro, 0,212 en código) y de KL en el primer token (0,48) permiten investigar cuánto se desvía la distribución del modelo editado respecto al original.
- Experimentación con adaptadores LoRA en GGUF: el adaptador de 113 MB puede combinarse con distintos builds del modelo base (de BF16 a `AD-Q4_K-IQ4_XS`) mediante `--lora` o `--lora-scaled`, lo que facilita comparar configuraciones de cuantización.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, comparando el modelo BF16 con y sin adaptador, decodificación greedy:

| Prueba | Original | Con adaptador | Puerta | Resultado |
|---|---:|---:|---|---|
| Prompts dañinos rechazados, thinking off (81) | 71 (87,7%) | 2 (2,5%) | ≤ 3% | pasa |
| Prompts dañinos rechazados, thinking on, 3.072 tokens (30) | 29 | 0 | ≤ 1 | pasa |
| Prompts seguros de XSTest rechazados (250) | 12 (4,8%) | 0 | ≤ original + 1 pt | pasa |
| Respuestas vacías | 0% | 0,5% | ≤ 1% | pasa |
| Prompts inofensivos sin cerrar thinking en 3.072 tokens (30) | 0 | 1 | ≤ original + 1 | pasa |
| MMLU, 2.000 preguntas | 75,10% | 74,35% (-0,75 pt, McNemar p = 0,31) | sin caída significativa | pasa |
| Aguja en pajar de 30K tokens (3) | 3 | 3 | igual que el original | pasa |
| Llamadas de herramienta válidas (20) | 13 | 10 | dentro de 1 | **falla** |
| KL del primer token en prompts inofensivos | - | 0,48 (edición aleatoria: 0,36) | 0,10; juzgado contra la edición aleatoria | ver nota |
| KLD respecto al original, texto neutro | - | 0,216 (edición aleatoria: 0,076) | 0,05 | **falla** |

Sobre el build `AD-Q4_K-IQ4_XS` con adaptador y thinking off: de los primeros 20 prompts dañinos del test, 19 fueron rechazados sin adaptador y 0 con él; de 20 prompts inofensivos, 0 y 0.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 28,16 millones de parámetros, los pesos en BF16 ocupan aproximadamente 56 MB y la cuantización Q4_K-IQ4_XS alrededor de 14-16 MB, a lo que hay que sumar el adaptador LoRA (113 MB) y la caché KV para el contexto configurado (32.768 tokens en el ejemplo).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer moderna debería poder alojar los pesos, aunque el cuello de botella real es la memoria para la caché KV en contextos largos.
- Cabe en GPU consumer: sí, previsiblemente, dado el reducido tamaño de los pesos; no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp con el port de Maxwell (`maxwell-moe-port.patch` sobre `d3c3e242c`); llama-server con `--jinja -c 32768 -ngl 99 --temp 0.6 --top-p 0.95 --top-k 20`. Stock llama.cpp, LM Studio y Ollama **no** cargan Maxwell todavía.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Maxwell-V1-Flash-Uncensored (este) | 28,16 M | no disponible (ejemplo con 32K) | Apache-2.0 | GGUF + LoRA GGUF | Requiere port de llama.cpp; tool calling degradado (10/20) |
| Maxwell-V1-Flash (base) | 28,16 M | no disponible | Apache-2.0 | safetensors / GGUF | Sin edición de rechazos; 13/20 tool calls válidos; MMLU 75,10% |
| Modelos "uncensored" de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la información proporcionada |

## Limitaciones y advertencias

- **Fallo en tool calling**: 10 de 20 llamadas válidas frente a 13 de 20 del original; el autor reconoce que la muestra es pequeña (intervalo del 95% de 9 a 16) pero lo reporta como fallo de su puerta de calidad.
- **Desviación distribucional**: KLD de 0,216 en texto neutro (puerta 0,05) y 0,212 en código; una edición aleatoria de la misma magnitud ya produce 0,076, por lo que la puerta absoluta no se cumple.
- **KL del primer token**: 0,48 frente a una puerta de 0,10; juzgado contra la edición aleatoria (0,36) supone 1,3 veces.
- **Respuestas vacías**: 0,5% con adaptador frente a 0% del original (puerta ≤ 1%).
- **Riesgo de contenido dañino**: el objetivo declarado del adaptador es eliminar los rechazos, por lo que su uso en producción sin filtros externos expone a generar contenido dañino.
- **Compatibilidad de despliegue**: no funciona con llama.cpp stock, LM Studio ni Ollama; requiere el port específico, lo que limita su portabilidad.
- **Sesgos**: no se documentan sesgos específicos en la información proporcionada.
- **Idiomas**: no se especifican los idiomas soportados.
- **Licencia**: Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el desplegador.
- **Contexto**: la longitud nativa no está documentada; el ejemplo usa 32.768 tokens, pero no se confirma que sea el máximo soportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bjjjhhko/Maxwell-V1-Flash-Uncensored-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Builds GGUF de AtomicChat del modelo base: https://huggingface.co/AtomicChat/Maxwell-V1-Flash-GGUF
- Aplicación Atomic Chat: https://atomic.chat/
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
- Dataset `mlabonne/harmful_behaviors`: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
