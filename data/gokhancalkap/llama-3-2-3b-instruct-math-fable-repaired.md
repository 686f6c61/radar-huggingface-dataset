# GokhanCalkap/Llama-3.2-3B-Instruct-math-fable-repaired

## Resumen

Llama-3.2-3B-Instruct-math-fable-repaired es un artefacto de investigación publicado por GokhanCalkap que aplica una edición de pesos sin entrenamiento (weight editing) sobre Llama-3.2-3B-Instruct de Meta. El punto de partida es un fine-tune matemático de MergeBench (`MergeBench/Llama-3.2-3B-Instruct_math`, entrenado sobre DART-Math) que mejoraba GSM8K pero degradaba el seguimiento de instrucciones. La edición conserva únicamente el cambio del fine-tune en 36 tensores (las MLPs de los bloques 12 a 23) y toma los pesos del modelo base en el resto, es decir, 218 tensores.

El modelo no entrena nada: aplica la regla `θ = θ_base + λ · (θ_fine-tune − θ_base)` por tensor, con λ = 1 en `mlp.gate_proj`, `mlp.up_proj` y `mlp.down_proj` de los bloques 12 a 23, y λ = 0 en el resto. La localización de la edición la decidió un editor basado en LLM (Claude, modelo `claude-fable-5-2`) que razonó sobre medidas de forward-pass del cambio del fine-tune componente a componente. El resultado es un modelo de 3.212.749.824 parámetros con el tokenizer y la plantilla de chat originales de Llama-3.2-3B-Instruct.

Su relevancia es metodológica más que de producto: documenta un único resultado medido y pre-registrado en el que se conserva la ganancia en GSM8K del fine-tune (ratio de conservación 1,18; intervalo 1,03–1,37) y se recupera el 94 % de la pérdida en IFEval (0,84–1,04). El propio autor advierte que no es una mejora general sobre el modelo base y que debe leerse como artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), pesos editados sin entrenamiento |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | en |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |
| Tamano del repo | 6,4 GB |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Modelo fine-tune de partida | MergeBench/Llama-3.2-3B-Instruct_math |
| Tensores editados | 36 (MLPs de bloques 12–23); 218 sin tocar |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct sin modificación estructural: un transformer decoder-only con atención causal estándar, tokenizer y plantilla de chat idénticos al original. No hay entrenamiento: ni un solo paso de gradiente ni datos nuevos. La edición se construye con interpolación lineal de pesos por tensor entre el modelo base y el fine-tune matemático, seleccionando qué tensores reciben el cambio completo (λ = 1) y cuáles se quedan en el base (λ = 0).

La decisión de dónde aplicar la edición proviene de un editor LLM que analizó mapas de sondas de forward-pass sobre ítems de desarrollo. Su lectura fue que el hábito de escribir la respuesta en `\boxed{}` reside en las MLPs de los bloques 12 a 23, mientras que los bloques 8 a 11 concentran la mayor parte del daño al seguimiento de instrucciones. La receta completa, las revisiones y los SHA-256 de los ficheros de entrada y salida están en `recipe.json`, de modo que el modelo se puede reconstruir desde los dos modelos públicos en menos de un minuto en CPU.

## Capacidades

- Generación de texto conversacional con la misma interfaz que Llama-3.2-3B-Instruct (roles user/assistant, plantilla de chat original).
- Razonamiento aritmético y resolución de problemas matemáticos de tipo GSM8K, con tendencia a presentar la respuesta final en formato `\boxed{}`.
- Seguimiento de instrucciones (IFEval) prácticamente al nivel del modelo base, según la medición pre-registrada del autor.
- Generación de código: el autor reporta HumanEval+ +1,2 puntos frente al base en ítems de desarrollo, con intervalo que cruza cero.
- Conocimiento general: MMLU-Pro +0,1 puntos frente al base en 300 ítems de desarrollo, sin diferencia distinguible.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Tool calling / function calling: no documentado en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre edición de pesos y merging: el modelo sirve como caso reproducible para estudiar cómo aislar el efecto de un fine-tune en un subconjunto de tensores y comparar con merges clásicos como WiSE-FT. La receta y los SHA-256 permiten reconstruirlo y auditar el resultado.
- Evaluación de métodos training-free: útil como referencia frente a técnicas como WiSE-FT (α = 0,3 y α = 0,5) o la receta de control del propio autor, con intervalos bootstrap pareados ya publicados.
- Reproducción de experimentos de MergeBench: al partir de `MergeBench/Llama-3.2-3B-Instruct_math`, encaja en pipelines que ya evalúan fine-tunes matemáticos sobre Llama-3.2-3B.
- Prototipado de asistentes de matemáticas básicas en inglés: para problemas de aritmética de primaria/secundaria (estilo GSM8K) con salida en `\boxed{}`, sin coste de entrenamiento adicional.
- Docencia y divulgación técnica: ejemplo didáctico de cómo un fine-tune puede ganar una métrica y perder otra, y de cómo una edición selectiva mitiga el olvido catastrófico sin reentrenar.
- Baseline en ablaciones de localización: para comparar si una búsqueda automática de tensores supera la selección hecha por el editor LLM, dado que el autor no ejecutó ese brazo experimental.
- Despliegue ligero en entornos con recursos limitados: al ser un modelo de 3B en safetensors de 6,4 GB, cabe en GPUs de consumo para inferencia en bf16 o cuantizado, siempre que se acepten las limitaciones descritas.

## Benchmarks y rendimiento

Resultados del test final pre-registrado del autor: GSM8K test, mitad B (659 problemas, 8 muestras cada uno) y una mitad sellada de IFEval (271 prompts, 16 muestras cada uno). Precisión en %, media por ítem sobre las muestras. Muestreo según la generation config de Meta (temperatura 0,6, top-p 0,9), máximo 4.096 tokens nuevos. GSM8K strict califica el último `\boxed{}`; lenient acepta el box y, en su defecto, el último número.

| Modelo | GSM8K strict | GSM8K lenient | IFEval |
|---|---|---|---|
| base (Llama-3.2-3B-Instruct) | 69,3 | 77,9 | 70,1 |
| fine-tune (MergeBench math) | 78,9 | 82,2 | 57,0 |
| WiSE-FT, α = 0,3 | 79,1 | 80,7 | 66,9 |
| WiSE-FT, α = 0,5 | 81,7 | 81,9 | 64,6 |
| receta de control (WiSE-FT 0,5 con bloques 0–11 y MLPs 24–27 en el base) | 80,1 | 81,2 | 68,1 |
| este modelo | 80,7 | 81,3 | 69,3 |

Diferencias frente a cada modelo, en puntos, con intervalos bootstrap pareados al 95 % sobre ítems:

| Frente a | GSM8K strict | IFEval |
|---|---|---|
| base | +11,4 (+9,7 … +13,1) | −0,8 (−2,2 … +0,5) |
| WiSE-FT 0,3 | +1,6 (+0,4 … +2,7) | +2,3 (+1,0 … +3,8) |
| WiSE-FT 0,5 | −1,0 (−2,1 … +0,0) | +4,7 (+2,8 … +6,6) |
| receta de control | +0,6 (−0,4 … +1,5) | +1,2 (+0,0 … +2,4) |

Mediciones secundarias en ítems de desarrollo (no forman parte de la evidencia pre-registrada): MMLU-Pro +0,1 (−2,0 … +2,1) sobre 300 ítems y HumanEval+ +1,2 (−1,3 … +3,9) sobre 164 problemas, sin efectos secundarios señalados frente al base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB según longitud de contexto y lote.
- Cuantización: el autor no publica versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors. En 8 bits los pesos bajarían a unos 3,2 GB y en 4 bits a unos 1,6 GB, aunque estos valores son estimaciones de cálculo, no datos publicados.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 en bf16; en A100, H100 o L40S sobra capacidad y se puede aumentar el lote. Con cuantización a 4 bits cabría en GPUs de 8 GB.
- Opciones de despliegue: transformers (código de ejemplo incluido en la model card), text-generation-inference (etiqueta `text-generation-inference` en los metadatos) y endpoints compatibles (etiqueta `endpoints_compatible`). vLLM, llama.cpp y Ollama no están documentados para este modelo, aunque al ser una arquitectura Llama estándar deberían ser compatibles previa conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K strict | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 3,21 B | no disponible | 80,7 | 69,3 | llama3.2 | Hugging Face (0 descargas) |
| Llama-3.2-3B-Instruct (base) | 3,21 B | no disponible | 69,3 | 70,1 | llama3.2 | Hugging Face (oficial de Meta) |
| MergeBench/Llama-3.2-3B-Instruct_math (fine-tune) | 3,21 B | no disponible | 78,9 | 57,0 | no disponible en la información proporcionada | Hugging Face |
| WiSE-FT α = 0,5 sobre los mismos modelos | 3,21 B | no disponible | 81,7 | 64,6 | derivada de llama3.2 | no es un checkpoint publicado; receta de merging |

El modelo se sitúa en un punto intermedio: cede aproximadamente un punto de GSM8K strict frente a WiSE-FT 0,5 (intervalo que toca cero) a cambio de 4,7 puntos de IFEval, y supera a WiSE-FT 0,3 en ambas tareas. No es el mejor en ninguna métrica por separado: WiSE-FT 0,5 gana en GSM8K y el base en IFEval, sin diferencia distinguible frente a este modelo.

## Limitaciones y advertencias

- No incorpora una habilidad matemática real: la mayor parte de la ganancia en GSM8K strict es el hábito de escribir la respuesta en `\boxed{}`. Con el calificador lenient, el fine-tune está 4,3 puntos por encima del base en estos ítems y este modelo 3,4 puntos.
- No se demuestra que un LLM sea necesario para localizar la edición: no se ejecutó ningún brazo de búsqueda automática ni otros métodos training-free (por ejemplo DG-Hard). La receta de control, derivada del mismo mapa de sondas, queda muy cerca, lo que sugiere que el mapa aporta la mayor parte del resultado.
- Sin replicación: un solo test final y un solo par de modelos. En una segunda familia (Gemma-2-2b-it y su fine-tune matemático de MergeBench) solo se midieron merges simples en ítems de desarrollo, y el merge simple ya dejaba poco margen para que se notara una edición.
- La comparación es frente a merges WiSE-FT (Wortsman et al., 2022), no frente a «métodos simples» en general.
- Modelos pequeños, prompts y muestreo propios del autor; las comparaciones secundarias no están corregidas por el número de comparaciones.
- Riesgo de alucinación: no evaluado en la información proporcionada; al ser un modelo de 3B, es esperable en tareas de conocimiento factual, pero no hay medición publicada.
- Sesgos: no documentados en la información proporcionada.
- Idioma: solo inglés según los metadatos; no se ha validado su comportamiento en castellano.
- Licencia llama3.2: impone las condiciones de la Llama 3.2 Community License de Meta, incluidos requisitos de atribución («Built with Llama») y restricciones de uso; conviene revisar los términos antes de un uso comercial.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento posterior.
- El autor advierte explícitamente de que no es una mejora de propósito general sobre Llama-3.2-3B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GokhanCalkap/Llama-3.2-3B-Instruct-math-fable-repaired
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Fine-tune de partida (MergeBench): https://huggingface.co/MergeBench/Llama-3.2-3B-Instruct_math
- Mirror de pesos del base usado en la receta: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Referencia del método de merging WiSE-FT: Wortsman et al., 2022 (no se proporciona URL en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
