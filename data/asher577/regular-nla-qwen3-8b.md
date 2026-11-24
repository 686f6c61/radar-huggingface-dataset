# asher577/regular-nla-qwen3-8b

## Resumen

Regular NLA (Qwen3-8B, layer 24) es un autoencoder en lenguaje natural (natural language autoencoder, NLA) publicado por el usuario asher577 sobre el modelo base Qwen/Qwen3-8B. No es un modelo de propósito general, sino una herramienta de interpretabilidad: traduce una activación del flujo residual de la capa 24 de Qwen3-8B a una explicación breve en texto libre y, a la inversa, reconstruye la activación original a partir de esa explicación. Se distribuye como un par de modelos acoplados (verbalizador y reconstructor) junto con metadatos de inyección y plantillas de prompt.

La relevancia de esta publicación es metodológica: sirve como línea base no composicional para las variantes Focus y Subspace NLA del mismo autor, y permite auditar qué información semántica es recuperable del estado interno de un transformer de 8 mil millones de parámetros mediante descripciones en lenguaje natural. El verbalizador alcanza un FVE (fracción de varianza explicada) del 81,0 % sobre activaciones retenidas en el paso publicado, lo que da una medida cuantitativa de cuánta información del vector original sobrevive al cuello de botella textual.

El modelo tiene 8 mil millones de parámetros (arquitectura transformer de Qwen3), un flujo residual de dimensión 4096 en la capa 24 y se distribuye en safetensors en precisión bf16 con licencia Apache 2.0. El repositorio ocupa 27,4 GB e incluye tanto los pesos del verbalizador como el backbone truncado del reconstructor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) finetuneado; verbalizador completo + reconstructor truncado a 25 capas con cabeza lineal 4096 -> 4096 |
| Parametros totales | 8 mil millones (modelo base Qwen3-8B); el reconstructor usa solo las 25 primeras capas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face); verbalizador en bf16 con LoRA RL fusionada; reconstructor con `value_head.safetensors` |
| Dimension del flujo residual | 4096 (capa 24, `hidden_states[25]` en numeracion HF) |
| Token marcador | `㈎` (token 149705) |
| FVE en held-out | 81,0 % (media de las ultimas cinco evaluaciones, 64 activaciones retenidas cada una) |

## Arquitectura y entrenamiento

El sistema consta de dos componentes. El verbalizador (`av/`) es un Qwen3-8B afinado que recibe una activación `x` inyectada en su propio flujo residual: en la salida de la capa 1 del decoder, el residual `h` en la posición del token marcador `㈎` se sustituye por `h + |h| * x / |x|`. El prompt usa la plantilla `actor` de `nla_meta.yaml` como un único turno de usuario con la plantilla de chat aplicada (`add_generation_prompt=True`), y la respuesta se emite dentro de etiquetas `<explanation>`. El reconstructor (`ar/`) es el mismo Qwen3-8B truncado a sus 25 primeras capas, con la norma final y la LM head sin usar; la explicación completa se envuelve en la plantilla `critic` y el último estado oculto en el último token, reescalado a norma sqrt(d), pasa por una cabeza lineal 4096 -> 4096 que produce `x_hat`.

El entrenamiento parte de activaciones extraídas de texto web (FineFineWeb), con 10 posiciones de token por documento, todas en la posición 50 o posterior; los tokens anteriores quedan fuera de la distribución de entrenamiento. El arranque en caliente consiste en un ajuste supervisado del verbalizador sobre explicaciones escritas por Claude del texto hasta cada posición, en el formato del paper original de NLA, y del reconstructor en la dirección inversa. Después se aplica RL con GRPO durante 4000 pasos (512 activaciones x 8 muestras por paso), con generación limitada a 150 tokens y recompensa basada en la calidad de reconstrucción de la explicación. El verbalizador se entrena como LoRA de rango 128 (fusionada en los pesos publicados) con penalización KL de 0,01 respecto al arranque en caliente, mientras que el reconstructor se afina completamente en paralelo; la versión publicada del reconstructor corresponde al mismo paso que el verbalizador.

## Capacidades

- Verbalización de activaciones: dada una activación del flujo residual de la capa 24 de Qwen3-8B, genera una explicación breve en texto libre (dos o tres fragmentos cortos, según el prompt) dentro de etiquetas `<explanation>`.
- Reconstrucción de activaciones: a partir de una explicación textual, produce un vector de 4096 dimensiones que aproxima la activación original, con una cabeza lineal entrenada para ello.
- Evaluación cuantitativa de fidelidad: calcula FVE y similitud coseno entre activación original y reconstruida, lo que permite medir la calidad de cada lectura.
- Lectura de posiciones concretas: el quickstart permite seleccionar un token de un texto de entrada (por ejemplo, el token 10 de 11 en el ejemplo de la model card) e inspeccionar su activación.
- Modo chat: la opción `--chat` lee el último token del mensaje en lugar de los tokens que la plantilla de chat añade al final.
- Detección de tokens sink: el quickstart avisa cuando un token tiene activaciones de más de 10 veces la norma mediana, casos en los que la lectura no es fiable.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es una herramienta de interpretabilidad, no un asistente.

## Casos de uso

- Auditoría de representaciones internas: investigar qué conceptos codifica la capa 24 de Qwen3-8B en contextos controlados, leyendo la explicación generada para tokens concretos y comparándola con el texto de entrada.
- Línea base para investigación en NLA: servir como referencia no composicional frente a las variantes Focus y Subspace NLA, permitiendo aislar la ganancia atribuible a la composicionalidad en experimentos de interpretabilidad.
- Detección de sesgos latentes: analizar activaciones en frases con carga demográfica o política para observar qué asociaciones semánticas aparecen en la explicación, con la cautela de que las citas textuales pueden ser incorrectas.
- Validación de reconstrucción: usar el FVE y la similitud coseno como métrica objetiva de cuánta información semántica sobrevive al paso por lenguaje natural, en estudios sobre cuellos de botella textuales.
- Depuración de comportamientos anómalos: leer activaciones en posiciones donde el modelo base produce salidas inesperadas (por ejemplo, tras tokens sink o en plantillas de chat) para entender qué representación está activa.
- Docencia y divulgación: demostrar de forma reproducible, con un solo GPU de ~20 GB, cómo se traduce un vector interno de un LLM a lenguaje natural y viceversa, usando el ejemplo del quickstart con la Torre Eiffel.
- Investigación sobre fidelidad de explicaciones: comparar la explicación generada con el texto real de entrada para cuantificar alucinaciones en la verbalización, ya que la model card advierte que las frases citadas pueden ser erróneas.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| FVE en held-out | 81,0 % | Media de las ultimas cinco evaluaciones, 64 activaciones retenidas cada una |
| Similitud coseno (ejemplo) | 0,944 | Ejemplo del quickstart con "The Eiffel Tower is located in the city of" |
| FVE (ejemplo) | 0,802 | Mismo ejemplo del quickstart |
| Norma de activacion (ejemplo) | 224,5 | Token ' of' del ejemplo |

No se han publicado resultados de benchmarks en la informacion disponible para tareas estándar (MMLU, HumanEval, GSM8K u otras); el modelo no está diseñado para ellas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB para ejecutar el quickstart completo (verbalizador y reconstructor), según la model card.
- Descarga necesaria: 27 GB del repositorio más 16 GB de Qwen/Qwen3-8B, es decir, unos 43 GB de disco.
- GPU recomendadas: no se especifican modelos concretos; se indica una GPU con unos 20 GB de memoria, lo que encaja con A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) y RTX A6000 (48 GB).
- Cabe en GPU consumer: sí, en tarjetas con al menos 24 GB de VRAM como la RTX 4090, siempre que se respete el requisito de ~20 GB del quickstart.
- Opciones de despliegue: el repositorio `nla` con los helpers de inferencia en `nla/` y el ejemplo `scripts/hf_quickstart.py`; instalación con `pip install -e . einops`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación está limitada a 150 tokens durante el entrenamiento, pero no se publican cifras de latencia en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FVE / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Regular NLA (Qwen3-8B, layer 24) | 8B (reconstructor truncado a 25 capas) | no disponible | FVE 81,0 % en held-out | Apache 2.0 | Hugging Face (asher577/regular-nla-qwen3-8b) |
| Focus NLA | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card como variante composicional |
| Subspace NLA | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card como variante composicional |
| NLA original (paper) | no disponible | no disponible | no disponible | no disponible | Referenciado como formato de partida |

Las variantes Focus y Subspace NLA se mencionan únicamente como comparadores conceptuales; no se proporcionan sus especificaciones, licencias ni resultados en la información disponible.

## Limitaciones y advertencias

- Las lecturas no son transcripciones del texto: las frases citadas y los detalles específicos de la explicación pueden ser erróneos y deben contrastarse con la entrada.
- Los tokens sink (con activaciones de más de 10 veces la norma mediana, como los que añade la plantilla de chat) producen lecturas no fiables; el FVE no lo detecta porque esas activaciones apuntan en direcciones casi idénticas y se reconstruyen bien.
- Los tokens situados antes de la posición 50 de un documento están fuera de la distribución de entrenamiento, por lo que las lecturas en esas posiciones son menos fiables.
- El modelo está especializado en la capa 24 de Qwen3-8B; no es un modelo de propósito general y no debe usarse para generación de texto, código, matemáticas ni tareas de asistente.
- No se documentan sesgos conocidos, pero al entrenarse sobre texto web (FineFineWeb) y explicaciones generadas por Claude, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación en la verbalización: la explicación puede afirmar contenidos que no están en la activación ni en el texto original.
- Idiomas soportados no disponibles; el comportamiento multilingüe no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse.
- El reconstructor emite un aviso al cargarse porque `lm_head.weight` y `model.norm.weight` se inicializan de nuevo; es esperado, ya que se sustituyen por identidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/regular-nla-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
