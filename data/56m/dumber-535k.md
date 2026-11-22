# 56m/dumber-535k

## Resumen

Dumber-535K es un modelo de lenguaje de escala extrema (sub-1M de parámetros) desarrollado por el usuario 56m y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de entrenamiento desde cero sobre 500 millones de tokens del subconjunto `sample-10BT` del dataset FineWeb-Edu, con una arquitectura basada en Llama (RoPE, RMSNorm, SwiGLU y weight tying). Con 535.584 parámetros totales, un vocabulario de 768 tokens (BPE a nivel de byte) y una longitud de contexto de 512 tokens, el modelo se sitúa muy por debajo de cualquier LLM de uso práctico y debe entenderse como una pieza de investigación sobre los límites del entrenamiento a pequeña escala.

Su relevancia es fundamentalmente didáctica y experimental: permite estudiar el comportamiento de un transformer diminuto con una ratio de sobrentrenamiento de aproximadamente 47x respecto a Chinchilla, es decir, muchos más tokens de los que serían óptimos para su tamaño. Los resultados publicados en ARC-Easy (28,79% en `acc_norm`, frente al 25% aleatorio) y ARC-Challenge (22,18%, por debajo del azar) confirman que el modelo apenas supera el rendimiento aleatorio en tareas de razonamiento, lo que es coherente con su escala.

No debe confundirse con un modelo listo para producción: no hay información sobre pipeline, idiomas soportados ni benchmarks adicionales más allá de los dos citados. Su interés radica en servir como banco de pruebas para tokenizadores, curvas de escalado, técnicas de entrenamiento y evaluación con `lm-evaluation-harness` en el régimen de los cientos de miles de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (RoPE, RMSNorm, SwiGLU, weight tying) |
| Parametros totales | 535.584 (~535K) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 768 tokens (BPE a nivel de byte) |
| Dimension oculta | 96 |
| Capas | 5 |
| Cabezas de atencion | 4 |
| Tokens de entrenamiento | ~500M (ratio de sobrentrenamiento ~47x Chinchilla) |
| Dataset | HuggingFaceFW/fineweb-edu (sample-10BT) |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo Llama, con normalizacion RMSNorm, activacion SwiGLU, embeddings posicionales rotatorios (RoPE) y weight tying entre la capa de embedding de entrada y la proyeccion de salida. La red es extremadamente compacta: 5 capas, dimension oculta de 96 y 4 cabezas de atencion, con un vocabulario de solo 768 tokens construido mediante BPE a nivel de byte. El contexto maximo es de 512 tokens.

El entrenamiento se realizo desde cero sobre aproximadamente 500 millones de tokens del subconjunto `sample-10BT` de FineWeb-Edu, un corpus de contenido educativo filtrado por calidad. La ratio de sobrentrenamiento declarada es de aproximadamente 47x respecto a la asignacion optima de Chinchilla, lo que sugiere que el autor priorizo la exposicion a datos frente al calculo optimo para explorar el regimen de sobrentrenamiento en modelos minusculos. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva basica a partir de un prompt, con temperatura y `max_new_tokens` configurables mediante `transformers`.
- Capacidad muy limitada de continuacion de texto en dominios educativos, dado el corpus de entrenamiento (FineWeb-Edu).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el vocabulario de 768 tokens limita severamente la cobertura linguistica.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- El rendimiento en tareas de razonamiento esta cerca del azar segun los benchmarks publicados (ARC-Easy 28,79%, ARC-Challenge 22,18%).

## Casos de uso

- Investigacion sobre escalado y sobrentrenamiento: el modelo sirve para estudiar curvas de perdida y comportamiento en el regimen sub-1M con una ratio de 47x Chinchilla, comparando con modelos de tamano similar entrenados con menos tokens.
- Pruebas de tokenizadores BPE a nivel de byte: con un vocabulario de solo 768 tokens, es util para analizar el impacto del tamano de vocabulario en la calidad de la generacion y en la longitud efectiva de las secuencias.
- Validacion de pipelines de evaluacion: permite probar integraciones con `lm-evaluation-harness` en tareas como ARC-Easy y ARC-Challenge antes de escalar a modelos mayores.
- Docencia y divulgacion: sirve como ejemplo minimo y reproducible de un transformer decoder-only completo (RoPE, RMSNorm, SwiGLU, weight tying) para explicar cada componente en un curso.
- Pruebas de infraestructura de despliegue: al ocupar practicamente nada en disco, es util para verificar pipelines de carga con `transformers`, serializacion en safetensors y flujos de CI antes de usar modelos grandes.
- Generacion de texto de relleno o sintetico en tests: su salida, aunque de baja calidad, puede emplearse como datos ficticios en pruebas unitarias de sistemas que consumen texto.

## Benchmarks y rendimiento

Evaluacion 0-shot con `lm-evaluation-harness`, segun la model card:

| Benchmark | Metrica | Resultado | Referencia aleatoria |
|---|---|---|---|
| ARC-Easy | acc_norm | 28,79% | 25,0% |
| ARC-Challenge | acc_norm | 22,18% | 25,0% |
| HellaSwag | no disponible | no disponible | no disponible |
| PIQA | no disponible | no disponible | no disponible |

El modelo supera ligeramente el azar en ARC-Easy pero queda por debajo en ARC-Challenge, lo que refleja la ausencia practica de razonamiento a esta escala.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en cualquier precision; el modelo cabe holgadamente en CPU.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una iGPU moderna; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos o Raspberry Pi.
- Opciones de despliegue: `transformers` (referencia en la model card); `llama.cpp`, `Ollama`, `vLLM` o `TGI` no estan documentados para este modelo y requeririan conversion a GGUF u otros formatos no publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la inferencia en CPU deberia ser del orden de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dumber-535K (56m) | 535.584 | 512 | Apache 2.0 | Hugging Face |
| TinyStories-1M (roneneldan) | ~1M | 512 (tipico) | MIT (segun repo) | Hugging Face |
| Pythia-14M (EleutherAI) | 14M | 2048 | Apache 2.0 | Hugging Face |

La comparacion con TinyStories-1M y Pythia-14M es orientativa: Dumber-535K es aun mas pequeno que ambos y emplea un vocabulario mucho mas reducido (768 frente a decenas de miles de tokens), lo que limita la calidad de la generacion. No se dispone de benchmarks comparativos directos en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de generacion muy baja: con 535K parametros y un vocabulario de 768 tokens, la salida es en la practica incoherente para uso real.
- Riesgo elevado de alucinacion y de continuaciones sin sentido; el modelo no tiene conocimiento factual fiable.
- Contexto limitado a 512 tokens y vocabulario minimo, lo que restringe severamente la cobertura linguistica y la expresividad.
- Idiomas soportados no documentados; probablemente el ingles sea el unico con cierta presencia por el corpus FineWeb-Edu, pero no esta confirmado.
- Sesgos: no documentados, pero heredables del corpus FineWeb-Edu (contenido educativo filtrado, predominantemente en ingles).
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para produccion por su calidad.
- No hay informacion sobre cuantizaciones, formatos GGUF ni integraciones con frameworks de inferencia distintos de `transformers`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/56m/dumber-535k
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- `lm-evaluation-harness`: https://github.com/EleutherAI/lm-evaluation-harness
- Documentacion de `transformers`: https://huggingface.co/docs/transformers
