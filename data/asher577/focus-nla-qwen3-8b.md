# asher577/focus-nla-qwen3-8b

## Resumen

Focus NLA (Qwen3-8B, layer 24) es un autoencoder en lenguaje natural (natural language autoencoder, NLA) construido sobre Qwen/Qwen3-8B para interpretar el flujo residual de la capa 24 de ese modelo. Lo desarrolla el usuario asher577 y se publica bajo licencia Apache 2.0. No es un modelo conversacional al uso: es una herramienta de interpretabilidad mecanicista que traduce vectores de activación internos a descripciones en lenguaje natural y viceversa.

El sistema se compone de dos modelos acoplados. El verbalizador (`av/`) es un Qwen3-8B afinado que recibe un vector de activación inyectado en su flujo residual en un token marcador y genera cuatro párrafos cortos que lo describen. El reconstructor (`ar/`) es un Qwen3-8B truncado a sus primeras 25 capas con una cabeza lineal que mapea cada párrafo de vuelta a un vector; la suma de los cuatro vectores más un vector medio fijo `mu` aproxima la activación original.

Su relevancia es metodológica: permite auditar qué representaciones internas tiene el modelo en cada posición de token mediante texto legible, y cuantificar la fidelidad de esa traducción con una métrica objetiva (fracción de varianza explicada, FVE). El repositorio ocupa 27,4 GB, coherente con dos copias de un modelo de 8 mil millones de parámetros en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3); verbalizador completo + reconstructor truncado a 25 capas con cabeza lineal 4096 → 4096 |
| Parámetros totales | 8 mil millones (modelo base Qwen3-8B); el reconstructor usa solo las primeras 25 capas más la cabeza lineal |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face); `comp_mean_bias.npy` para `mu`; `nla_meta.yaml` y `nla_config.json` como metadatos |

## Arquitectura y entrenamiento

El verbalizador es un Qwen3-8B completo en bf16 con el LoRA de RL fusionado. La activación objetivo `x` es el flujo residual a la salida de la capa 24 del decodificador (índice `hidden_states[25]` en numeración de Hugging Face), con dimensión d = 4096. La inyección se produce en la salida de la capa 1 del verbalizador: en la posición del token marcador `㈎` (token 149705), el residual `h` se sustituye por `h + |h| * x / |x|`, de modo que el vector se normaliza y se escala a la norma del residual local antes de sumarse. El prompt usa la plantilla `actor` de `nla_meta.yaml` como turno de usuario más la instrucción de `nla.composition.bullet_instruction(4)`, con la plantilla de chat aplicada y `add_generation_prompt=True`; la respuesta queda dentro de etiquetas `<explanation>` con párrafos separados por líneas en blanco.

El reconstructor es un Qwen3-8B truncado a 25 capas de decodificador (sin norma final ni cabeza LM) más una cabeza lineal `value_head.safetensors` de 4096 a 4096. Cada párrafo se envuelve en la plantilla `critic` (`Summary of the following text: <text>...</text> <summary>`) y la salida en el último token es el vector de ese párrafo; la reconstrucción es `x_hat = mu + sum_j AR(paragraph_j)`. La fidelidad se mide con FVE = `1 - MSE(n(x_hat), n(x)) / 0.563`, donde `n` reescala a norma sqrt(d) y 0,563 es la varianza de las activaciones normalizadas del conjunto de entrenamiento.

El entrenamiento parte de activaciones extraídas de conversaciones de WildChat, con 10 posiciones de token por conversación. Hay un arranque en frío supervisado: el verbalizador se afina sobre descripciones de cuatro párrafos escritas por Claude del texto hasta cada posición, y el reconstructor en la dirección inversa. Después se aplica RL con GRPO durante 2000 pasos (256 activaciones × 8 muestras por paso), con recompensa basada en la calidad de reconstrucción de los párrafos sumados. El verbalizador se entrena como LoRA de rango 128 (fusionado en la publicación) con penalización KL de 0,01 respecto al arranque en frío, y el reconstructor se afina por completo de forma simultánea. Los cuatro párrafos tienen roles fijos: procedencia y contexto del texto, persona actual del modelo (empieza por `Persona:`), creencias del modelo sobre quien escribió el texto, y objetivos inmediatos del modelo.

## Capacidades

- Descripción en lenguaje natural de vectores de activación del flujo residual de la capa 24 de Qwen3-8B, en cuatro párrafos con roles fijos.
- Reconstrucción inversa: conversión de texto descriptivo a un vector de 4096 dimensiones en el espacio de activaciones del modelo base.
- Cuantificación de fidelidad mediante FVE, con denominador calibrado sobre el conjunto de entrenamiento (0,563).
- Interpretabilidad mecanicista: lectura de procedencia, persona, creencias sobre el interlocutor y objetivos inmediatos del modelo en una posición de token concreta.
- Soporte de modo chat mediante la plantilla `actor` y el script `scripts/hf_quickstart.py --chat`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; no es un modelo de propósito general.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Auditoría de representaciones internas: extraer la activación de la capa 24 en una posición concreta de Qwen3-8B e introducirla en el verbalizador para obtener una descripción legible del estado del modelo en ese token, útil para estudiar cómo codifica contexto y persona.
- Investigación en interpretabilidad mecanicista: usar la pareja verbalizador/reconstructor como sonda entrenada para comparar hipótesis sobre qué información está linealmente accesible en la capa 24, midiendo FVE como criterio objetivo.
- Detección de persona y rol: el segundo párrafo, que empieza por `Persona:`, permite inspeccionar qué personaje cree estar interpretando el modelo en cada punto de una conversación, aplicable a estudios de alineación y jailbreaks.
- Análisis de atribución de autor: el tercer párrafo recoge las creencias del modelo sobre quien escribió el texto, lo que sirve para estudiar sesgos de atribución y estereotipos implícitos en el modelo base.
- Monitorización de objetivos: el cuarto párrafo describe los objetivos inmediatos del modelo, aprovechable para construir señales de aviso en pipelines de evaluación de comportamiento.
- Docencia y divulgación: el script `hf_quickstart.py` con la opción `--chat` permite demostrar en vivo cómo se traduce una activación a texto y se reconstruye, con una métrica cuantitativa asociada.
- Validación de métodos NLA: servir como referencia reproducible (Apache 2.0, pesos en safetensors) para comparar nuevas técnicas de autoencoder en lenguaje natural sobre el mismo modelo base y la misma capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica descrita es la fracción de varianza explicada (FVE) definida en la model card, sin valor numérico reportado para el modelo final.

## Requisitos de hardware

- El repositorio completo ocupa 27,4 GB (dos copias de Qwen3-8B en bf16 más la cabeza lineal y los metadatos).
- Inferencia del verbalizador en bf16: aproximadamente 16 GB de VRAM solo para pesos, más caché KV y activaciones; en la práctica requiere GPUs de 24 GB o más (RTX 3090, RTX 4090, L40S, A100 40 GB).
- Inferencia del reconstructor: al usar solo 25 capas, el coste es menor que el del verbalizador completo, pero sigue siendo un transformer de 8B truncado; se recomienda al menos 16-24 GB de VRAM en bf16.
- Para ejecutar el pipeline completo (verbalizador y reconstructor) de forma simultánea se recomienda una A100 40/80 GB o H100; en consumer, una RTX 4090 de 24 GB puede quedarse justa si ambos modelos residen a la vez en memoria.
- Cuantización: no se documentan pesos GGUF ni recetas de cuantización; el uso previsto es bf16 en formato Hugging Face.
- Opciones de despliegue: carga directa con Transformers mediante el repositorio `nla` y `scripts/hf_quickstart.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Focus NLA (Qwen3-8B, layer 24) | 8B (verbalizador) + 25 capas (reconstructor) | no disponible | Autoencoder en lenguaje natural para interpretabilidad | Apache 2.0 | Hugging Face (`asher577/focus-nla-qwen3-8b`) |
| Qwen/Qwen3-8B | 8B | no disponible en la información proporcionada | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| Otros NLA / sondas textuales | no disponible | no disponible | Interpretabilidad de activaciones | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre Focus NLA y otras herramientas de interpretabilidad en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: no debe usarse para generación de texto, código, matemáticas ni tareas conversacionales convencionales.
- El verbalizador está acoplado a la capa 24 de Qwen3-8B y a la dimensión 4096; no es trasladable a otras capas, modelos o dimensiones sin reentrenamiento.
- La fidelidad de la descripción es aproximada por construcción: la reconstrucción es una suma de cuatro vectores más `mu`, no una igualdad exacta, y la métrica FVE no tiene valor publicado en la model card.
- El entrenamiento usa activaciones de WildChat y descripciones generadas por Claude como arranque en frío, lo que puede introducir sesgos de dominio (conversaciones de chat) y de estilo en las descripciones.
- Los cuatro párrafos tienen roles fijos; desviaciones del formato (por ejemplo, no empezar el segundo con `Persona:`) pueden degradar la reconstrucción.
- Riesgo de alucinación en las descripciones: el verbalizador puede generar texto plausible que no corresponda fielmente a la activación, y el FVE es la única salvaguarda cuantitativa.
- Idiomas soportados no documentados; el comportamiento multilingüe del verbalizador y del reconstructor no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (22 de noviembre de 2026); no hay evidencia de validación externa ni de mantenimiento.
- No se documentan cuantizaciones, por lo que el despliegue en hardware limitado exige trabajo adicional no cubierto por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/focus-nla-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio `nla` con helpers de inferencia y `scripts/hf_quickstart.py`: referenciado en la model card, sin URL explícita en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
