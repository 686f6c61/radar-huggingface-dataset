# keytron46/Allan-LM-Quark

## Resumen
Allan-LM Quark 1.1 es un modelo de lenguaje de tipo Mixture of Experts (MoE) entrenado desde cero por KEYTRON para su asistente Allan. Con 278M parámetros totales y 107M activos por token, es un modelo de investigación diseñado específicamente para demostrar el uso correcto de herramientas (tool calling) en modelos pequeños: llama a `calc` para aritmética exacta y a `facts` para consultar países y elementos químicos. Responde en ruso e inglés y separa su razonamiento en un bloque `think` antes de la respuesta final.

El modelo se distribuye bajo licencia Business Source License 1.1 (BSL-1.1) y utiliza una arquitectura personalizada que no carga con `transformers`, llama.cpp ni Ollama. Su contexto de entrenamiento es de 1024 tokens, con posiciones RoPE hasta 2048. El tokenizador es un BPE propio de 32.000 tokens de texto, con un vocabulario total de 36.160 que incluye tokens especiales de chat, razonamiento, herramientas y tokens de audio reservados.

Su relevancia radica en el enfoque de entrenamiento: todas las tareas de agente y escolares fueron generadas por programas a partir de plantillas, ejecutando realmente las herramientas, de modo que las respuestas son correctas por construcción. No se utilizó texto escrito por ningún modelo de lenguaje ni traducción automática en ninguna etapa. Es un caso de estudio para quienes investigan modelos pequeños con uso de herramientas, no una fuente de información general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE personalizada (10 capas, d_model 640, 10 cabezas, 2 KV heads, GQA) |
| Parámetros totales | 283.661.440 (278M según model card) |
| Parámetros activos | 107M por token |
| Longitud de contexto | Entrenado a 1024 tokens; posiciones RoPE hasta 2048 |
| Tipos de cuantización | No disponible (pesos en fp32) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | BSL-1.1 (Business Source License 1.1) |
| Formato de pesos | safetensors (fp32, embeddings atados) |

## Arquitectura y entrenamiento
La arquitectura es un transformer MoE personalizado definido en `allan_lm/model.py`. Consta de 10 capas con dimensión de modelo 640, 10 cabezas de atención con 2 KV heads (GQA) y un feed-forward de tipo Mixture of Experts con 8 expertos, top-2, más 1 experto compartido. Incorpora Per-Layer Embeddings (d_ple 80) al estilo de los modelos E de Gemma. Los embeddings están atados y los pesos se distribuyen en fp32 safetensors.

El preentrenamiento (que corresponde a Quark 1.0) utilizó aproximadamente 10.000 millones de tokens de texto web ruso (fineweb-2), texto web educativo inglés (fineweb-edu) y código fuente (github-code-clean). El ajuste supervisado se realizó en varias etapas sobre GPUs de RunPod con OpenAssistant/oasst2 (diálogo humano), CohereLabs/aya_dataset (respuestas en ruso e inglés), openai/gsm8k (problemas de palabras), tareas de agente generadas por código (llamadas a herramientas con salida real: aritmética, ficheros, fechas, lectura de `--help`, verificación de afirmaciones del usuario) y tareas escolares generadas por código (ecuaciones, fracciones, geometría, física, química mediante `calc`; países y elementos mediante `facts`). Las tablas de `facts` provienen de Wikidata (CC0). No se empleó texto generado por modelos ni traducción automática en ninguna fase.

## Capacidades
- Generación de texto conversacional en ruso e inglés con formato de chat estructurado mediante tokens especiales.
- Razonamiento en bloque separado (`<|think|> ... <|think_end|>`) antes de la respuesta.
- Tool calling con dos herramientas integradas: `calc` para aritmética exacta y `facts` para países, capitales y elementos químicos.
- Ejecución de tareas de agente multi-paso con resultados reales de herramientas.
- Aritmética y matemáticas escolares (ecuaciones, fracciones, geometría, física, química) a través de `calc`.
- Consulta de hechos geográficos y químicos a través de `facts`.
- Capacidad de discrepar de afirmaciones incorrectas del usuario manteniendo una respuesta correcta.
- Soporte de formato de sistema específico (`allan_lm.agent.SYSTEM`) necesario para activar el uso de herramientas.
- No dispone de visión, audio ni otras capacidades multimodales (los tokens de audio están reservados pero no implementados).

## Casos de uso
- Investigación sobre modelos pequeños con tool calling: el modelo sirve como banco de pruebas para estudiar cómo un modelo de 107M parámetros activos aprende a invocar herramientas y a estructurar el razonamiento, gracias a su arquitectura MoE con experto compartido y su formato de chat explícito.
- Asistente aritmético de precisión: integrado mediante `allan_lm.agent.Agent`, resuelve operaciones exactas delegando en `calc`, lo que evita errores de cálculo típicos de modelos pequeños y resulta adecuado para entornos educativos controlados.
- Consulta de datos de referencia estructurados: usando la herramienta `facts` con tablas derivadas de Wikidata, responde sobre capitales, países y elementos químicos con respuestas cortas y verificables.
- Docencia y demostración de arquitecturas MoE: al ser un modelo desde cero con código propio (`allan_lm/model.py`), permite estudiar en detalle la implementación de GQA, per-layer embeddings y enrutamiento top-2 sin depender de `transformers`.
- Despliegue serverless con API compatible con OpenAI: el worker de RunPod (`serverless/handler.py`) expone `/v1/chat/completions` con streaming y `/v1/models`, lo que facilita integrarlo en pipelines existentes que ya consumen la API de OpenAI.
- Evaluación de robustez ante afirmaciones erróneas: su entrenamiento incluye tareas de verificación de afirmaciones del usuario, lo que lo hace útil para probar técnicas de pushback y consistencia en asistentes conversacionales.
- Estudio de tokenizadores y formatos de chat: su BPE propio de 32.000 tokens con tokens especiales dedicados permite investigar el diseño de vocabularios y marcadores de control en modelos pequeños.

## Benchmarks y rendimiento

| Métrica | Quark 1.0 | Quark 1.1 |
|---|---|---|
| Entropía cruzada de validación en la mezcla SFT (nats/token) | — | 1.574 |
| Tareas de agente y escolares con herramientas reales (380 tareas) | — | 95% |

Las 380 tareas de evaluación son muestras nuevas de los mismos generadores (con una semilla no utilizada en entrenamiento) resueltas con herramientas reales. Miden si el modelo usa sus herramientas y formatos correctamente, no conocimiento general. La mayoría de tipos (aritmética, ecuaciones, fracciones, hechos) obtienen entre 95% y 100%; la lectura de `--help` para encontrar una opción es el punto débil, con aproximadamente un 50%.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 278M parámetros en fp32, los pesos ocupan aproximadamente 1,1 GB; el repo completo pesa 2,3 GB. No se han publicado estimaciones para cuantizaciones.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM libre debería poder alojar los pesos en fp32, aunque no se ha verificado oficialmente.
- Cabe en GPU consumer: probablemente sí, dado el tamaño, pero no hay datos oficiales de compatibilidad ni de rendimiento.
- Opciones de despliegue: el modelo no carga con `transformers`, llama.cpp ni Ollama. El despliegue oficial es mediante el código propio (`chat.py`, `allan_lm.agent.Agent`) o el worker serverless de RunPod (`serverless/handler.py`, imagen `keytron46/allan-lm-worker:quark-1.1` en Docker Hub).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|
| Allan-LM Quark 1.1 | 278M totales / 107M activos (MoE) | 1024 (RoPE hasta 2048) | BSL-1.1 | Código propio, RunPod serverless |
| Modelos comparables | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (modelos pequeños MoE con tool calling entrenados desde cero) en la documentación proporcionada.

## Limitaciones y advertencias
- El propio autor advierte que es un modelo de investigación que sigue bien los formatos que se le enseñaron y sabe muy poco más allá de ellos.
- Riesgo alto de alucinación en hechos: si se le pregunta por un dato sin llamar a una herramienta, a menudo lo inventa (ejemplo citado en la model card: "Столица Австралии — Тасмания").
- Puede malinterpretar un resultado correcto de una herramienta.
- La conversación abierta deriva hacia texto no relacionado tras unas pocas frases.
- El código que genera no funciona.
- El uso de herramientas solo se activa tras el system prompt específico con el que fue entrenado (`allan_lm.agent.SYSTEM`); sin él responde como un modelo de chat simple.
- Contexto limitado a 1024 tokens de entrenamiento (posiciones RoPE hasta 2048), insuficiente para conversaciones largas o documentos extensos.
- Solo soporta ruso e inglés; no hay soporte multilingüe general.
- Licencia BSL-1.1: es una licencia de código disponible con restricciones de uso comercial que deben revisarse en el fichero LICENSE antes de cualquier despliegue en producción.
- No es compatible con el ecosistema estándar (`transformers`, llama.cpp, Ollama), lo que limita la integración con herramientas habituales.
- No debe usarse como fuente de información; el autor lo indica explícitamente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/keytron46/Allan-LM-Quark
- Dataset OpenAssistant/oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset CohereLabs/aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Wikidata: https://www.wikidata.org
- Imagen Docker del worker: `keytron46/allan-lm-worker:quark-1.1` (Docker Hub)
