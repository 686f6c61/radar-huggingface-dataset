# odelpa/qwen14-scienziato-v2

## Resumen

El modelo `odelpa/qwen14-scienziato-v2` es un adaptador LoRA (r = 16, α = 16) sobre el modelo base Qwen/Qwen3-14B, desarrollado por el investigador independiente Giovanni Del Papa en el marco del proyecto "Lo Scienziato Dilettante GDP" (Arianna Labs). No es un modelo completo, sino un adaptador de bajo rango que modifica el comportamiento identitario del modelo base sin alterar sus capacidades subyacentes. El repositorio ocupa 9,3 GB y se distribuye con licencia Apache 2.0.

El problema que aborda es específico: inyectar una identidad declarada (nombre, afiliación, proyecto) en un modelo que, de serie, no la reconoce. Según la model card, la identidad medida por palabras clave pasa del 8 % al 100 % en un test de 50 preguntas, mientras que las métricas de capacidad (ARC-it, GSM8K, IFEval) no muestran diferencias estadísticamente significativas respecto al modelo base. El autor es explícito: "el único beneficio significativo es la identidad; no hay ninguna mejora de capacidad".

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de *self-distillation* con *context distillation* (la ficha de identidad se ve solo en generación, no en entrenamiento) sobre Qwen3-14B, un transformer denso de 14 mil millones de parámetros. Por otro, es un ejemplo de publicación pre-registrada con reglas R1/R2/R3 fijadas antes del run, algo poco habitual en adaptadores LoRA de identidad. El adaptador está pensado para uso en italiano e inglés, y solo en modo *non-thinking*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-14B |
| Parametros totales | 64.225.280 parametros del adaptador (0,43 % del base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-14B; no especificada en la model card) |
| Tipos de cuantizacion | bf16 en entrenamiento y evaluacion; el autor publica solo el adaptador (sin pesos fusionados); menciona un GGUF para Ollama no evaluado en el articulo |
| Idiomas soportados | it, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-14B, un transformer denso de 14 mil millones de parámetros. El LoRA usa r = 16, α = 16, dropout 0,05 y se inyecta en 7 proyecciones, sumando 64.225.280 parámetros entrenables (0,43 % del total). El entrenamiento se hizo en bf16 (sin 4-bit), con LR 3·10⁻⁵, schedule coseno, warm-up del 3 %, 1 época, batch 16 y 538 pasos sobre una A100 de 80 GB durante aproximadamente 67 minutos. La loss bajó de 0,299 a 0,198 (validación 0,188).

La innovación técnica es el pipeline de *self-distillation* con *context distillation*. Primero, Qwen3-14B genera sus propias respuestas (vLLM, bf16, modo non-thinking, T = 0,7) con una ficha de identidad visible solo durante la generación. Después, esa ficha se elimina del conjunto de entrenamiento, de modo que el adaptador aprende a reproducir la identidad sin necesitar el contexto en inferencia. Los datos combinan prompts de `aya_dataset` (ITA), `oasst1`, GSM8K-train (MIT), prompts generados por el propio Qwen3-14B y restricciones verificables estilo IFEval (propias, no las de IFEval). Se excluyeron explícitamente ultrachat, personahub, codealpaca, numinamath-tir, no_robots, wildchat y flan. El resultado fueron 8.601 secuencias de entrenamiento y 299 de validación (4,02 M tokens). La selección de la escala de merge siguió una regla pre-registrada R1 (la escala más pequeña con identidad dev ≥ 95 %, GSM8K dev ≥ base − 1 pt e IFEval dev ≥ base − 1 pt), que resultó en s = 1,0.

## Capacidades

- Generación de texto en italiano e inglés, heredada del modelo base Qwen3-14B.
- Razonamiento y matemáticas (GSM8K) y seguimiento de instrucciones (IFEval) al mismo nivel que el base, sin mejora ni degradación significativa.
- Identidad declarada consistente: responde con el nombre, afiliación y proyecto del autor en el 100 % de las 50 preguntas del test de palabras clave.
- Modo *non-thinking* exclusivamente; el autor no evalúa ni soporta el modo *thinking* de Qwen3.
- No se reporta soporte de *tool calling* ni de *function calling* en la model card.
- No se reporta soporte de agentes ni de razonamiento multi-paso más allá de lo que hereda del base.
- Sin capacidades de visión ni audio.
- No se evalúan capacidades de código (excluido explícitamente del dataset de entrenamiento).

## Casos de uso

- **Personificación de un investigador o proyecto concreto**: el adaptador sirve para que un asistente conversacional se presente consistentemente como "Giovanni Del Papa / Lo Scienziato Dilettante GDP" sin necesidad de inyectar la ficha de identidad en cada prompt. Es el caso de uso central y el único con evidencia empírica en la model card.
- **Demostración de *context distillation* en cursos o artículos**: el repositorio incluye código reproducible (`code/pod/`) y reglas pre-registradas, lo que lo convierte en un ejemplo didáctico de cómo inyectar identidad sin degradar capacidades medidas.
- **Prototipos de asistentes en italiano**: al estar entrenado con `aya_dataset` (ITA) y `oasst1`, puede usarse como base para experimentos de conversación multi-turno en italiano, siempre que se acepte que las capacidades son las del Qwen3-14B subyacente.
- **Investigación sobre sesgos de identidad en LLM**: el adaptador permite estudiar cómo un LoRA de bajo rango (0,43 % de parámetros) altera la auto-presentación del modelo y qué tipo de detalles inventa (CEO, empresario, personaje imaginario, variante "Chimica").
- **Evaluación de pipelines de *merge* y cuantización**: el autor documenta que el merge físico en bf16 pierde identidad (82 %) e IFEval −1,5 puntos, lo que hace del repositorio un caso práctico para estudiar la fragilidad de los adaptadores ante la fusión de pesos.
- **Base para *fine-tuning* adicional en identidad corporativa**: el pipeline (generación con ficha visible → entrenamiento sin ficha → selección de escala pre-registrada) es replicable para otras identidades, aunque requeriría reentrenar el adaptador.

## Benchmarks y rendimiento

Datos publicados en la model card (test held-out, greedy, seed 1234, vLLM 0.32.0 bf16):

| Test | n | Base | + LoRA (s = 1,0) | Diferencia [IC 95 %] | p (McNemar) |
|---|---|---|---|---|---|
| ARC-it | 1132 | 90,72 % | 90,72 % | 0 (0 / 0 items) | 1,00 |
| GSM8K | 919 | 94,78 % | 94,67 % | −0,11 [−0,99; +0,77] | 1,00 (8/9) |
| IFEval (prompt-level strict) | 341 | 83,58 % | 83,00 % | −0,59 [−2,58; +1,40] | 0,77 (5/7) |
| Identidad (palabras clave) | 50 | 8 % | 100 % | +92 | 2,8·10⁻¹⁴ (46/0) |

El autor advierte que el 100 % de identidad no equivale a corrección factual: el modelo inventa detalles y en una pregunta ("¿Eres ChatGPT?") responde en inglés. La diferencia mínima detectable es aproximadamente 2,8·SE.

## Requisitos de hardware

- **VRAM para inferencia**: el adaptador pesa 9,3 GB en el repositorio, pero se sirve junto al base Qwen3-14B. En bf16, el conjunto requiere del orden de 28-30 GB de VRAM (14B × 2 bytes + overhead de activaciones y KV cache). No se dispone de cifras oficiales del autor.
- **GPU recomendadas**: A100 80 GB o H100 para el pipeline completo de entrenamiento y evaluación (el autor usó una A100 80 GB). Para inferencia, una RTX 4090 (24 GB) no es suficiente en bf16 con contexto largo; se necesitaría cuantización del base.
- **Consumer GPU**: no cabe en GPUs de consumo en bf16. Con cuantización 4-bit del base (por ejemplo, GPTQ/AWQ) podría intentarse en una RTX 4090, pero el autor no publica ni evalúa esa configuración.
- **Despliegue**: el autor usa vLLM 0.32.0 con `enable_thinking=False` y template de Qwen3. También menciona un GGUF para Ollama, aunque aclara que no es el objeto evaluado en el artículo. No se documenta soporte en TGI ni llama.cpp.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Identidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| odelpa/qwen14-scienziato-v2 | 64,2 M (adaptador) sobre Qwen3-14B | no disponible | 100 % (palabras clave, n=50) | Apache 2.0 | Hugging Face (solo adaptador) |
| Qwen/Qwen3-14B (base) | 14 B | no disponible | 8 % (palabras clave, n=50) | Apache 2.0 | Hugging Face |
| Mistral del proyecto (referencia en la model card) | no disponible | no disponible | scorer distinto (solo "gdp"/"del papa") | no disponible | no disponible |

No se dispone de comparación con otros adaptadores de identidad LoRA en la información proporcionada.

## Limitaciones y advertencias

- **La identidad se mide con palabras clave/regex** (`code/pod/score.py`), no con un juez humano ni con un modelo. Las 4 respuestas "correctas" del base (v01, v03, v18, n27) son falsos positivos porque la palabra clave está en la pregunta; sobre preguntas reales el base obtiene 0.
- **El 100 % no es corrección factual**: el modelo fine-tuned inventa detalles (CEO, empresario, personaje imaginario, variante "Chimica", significado de *ing-gdp-ai*) y en n03 ("¿Eres ChatGPT?") responde en inglés.
- **Sin mejora de capacidad**: la no-regresión es solo una estimación puntual con intervalos de confianza amplios (para IFEval no se excluye una pérdida de ~2,6 puntos).
- **Un solo run, un solo seed, greedy**: el run r1 (5,69 $) se perdió por un error operativo; r2 costó 4,48 $. El ruido del scorer IFEval es de 0,86 frente a 0,865 con generaciones idénticas.
- **El merge físico en bf16 pierde identidad (82 %)** e IFEval −1,5 puntos; por eso se publica solo el adaptador, sin pesos fusionados. El GGUF para Ollama no es el objeto evaluado.
- **Ficha de identidad escrita a mano**, solo modo non-thinking, sin evaluación de seguridad ni de código.
- **Idiomas**: solo italiano e inglés; no se evalúa el comportamiento en castellano ni en otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del adaptador en producción.

## Enlaces

- Hugging Face: https://huggingface.co/odelpa/qwen14-scienziato-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- DOI Zenodo v1.0: https://doi.org/10.5281/zenodo.23757653
- DOI Zenodo (principal): https://doi.org/10.5281/zenodo.23757652
- Dataset de resultados: https://huggingface.co/datasets/odelpa/qwen14-scienziato-v2-dati
- Artículo (IT): `paper/article_it.pdf` (en el repositorio)
- Artículo (EN): `paper/article_en.pdf` (en el repositorio)
- Divulgativa (IT): `paper/divulgativa_it.pdf` (en el repositorio)
- Divulgativa (EN): `paper/divulgativa_en.pdf` (en el repositorio)
