# nace-ai/drex-v1.5

## Resumen

Drex v1.5 es un modelo de decisión desarrollado por Nace.AI que no genera texto: lee un estado (en texto plano o JSON) junto con preguntas tipadas (`choice`, `noul`, `score` ordinal) y devuelve, en un único forward pass por pregunta, una probabilidad calibrada para cada opción. Está construido sobre el backbone `Qwen3_5ForCausalLM` de 32 capas con atención híbrida (tres capas de atención lineal por cada capa de atención completa) y un total de 8.953.803.264 parámetros (unos 9B), con pesos en bf16 que ocupan aproximadamente 18 GB en disco.

El modelo se afina a partir de `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` y añade una cabeza de puntero (`head.pt`) que puntúa cada opción a partir de los estados ocultos del backbone. Su contexto por defecto es de 16.384 tokens, ampliable hasta 131.072, y expone la API compatible con TypeSafe `/v1/systemone` mediante el código Kev incluido, con el mismo formato de petición y respuesta que la API alojada de Drex y que Drex DLM.

Su relevancia actual radica en que ocupa el primer puesto entre los modelos de menos de 10B parámetros en el Decision Index 0.3.1 público, con una puntuación de 58,08, por delante de Jev 1.13.0 (57,96) y Bespoke Nimble 9B v3 (57,19). Frente a los modelos generativos, la propuesta es sustituir la generación de texto por la evaluación directa de decisiones, lo que reduce la latencia y evita la deriva de formato en tareas de clasificación y recomendación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM`, 32 capas, atención híbrida (3 capas de atención lineal por cada capa de atención completa) + cabeza de puntero (`head.pt`) |
| Parametros totales | 8.953.803.264 (unos 9B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens por defecto, hasta 131.072 |
| Tipos de cuantizacion | bf16 (pesos originales), Q8_0 GGUF (unos 9,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | nace-ai-open-rail-m (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (checkpoint Hugging Face), GGUF (conversión vía llama.cpp) |

## Arquitectura y entrenamiento

El backbone es un transformer causal `Qwen3_5ForCausalLM` de 32 capas que combina atención lineal y atención completa en una proporción de 3:1, lo que reduce el coste computacional en secuencias largas manteniendo la capacidad de atención global. Sobre los estados ocultos del backbone se aplica una cabeza de puntero (`head.pt`) que asigna una puntuación a cada opción de la pregunta tipada, de modo que el modelo no decodifica tokens: produce directamente distribuciones de probabilidad calibradas por opción en un solo forward pass.

El modelo parte de `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` y se especializa mediante ajuste fino en la tarea de decisión (preguntas `choice`, `noul` y `score` ordinal). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; esa información no está disponible. La innovación destacable es el paradigma de "system-one": evaluación de decisiones en un único paso, sin generación autoregresiva, con soporte de contexto largo verificado hasta 128k tokens y una API estandarizada (`/v1/systemone`) compartida con el resto del ecosistema Drex.

## Capacidades

- Evaluación de decisiones tipadas: responde preguntas `choice` (selección entre opciones), `noul` y `score` ordinal devolviendo una probabilidad calibrada por opción.
- Procesamiento de estado en texto plano o JSON, apto para estados de agentes, formularios, registros estructurados y documentos.
- Clasificación de texto zero-shot y recomendación, con pipeline declarado `text-classification`.
- Contexto largo: manejo de documentos de hasta 128k tokens con precisión reportada.
- API HTTP compatible con TypeSafe: endpoint `POST /v1/systemone`, soporte de lotes mediante `{"requests": [...]}` y endpoint `GET /health`.
- Integración con llama.cpp y Ollama para despliegue en CPU y Apple Silicon (Metal).
- Soporte de preguntas múltiples sobre un mismo estado compartiendo la codificación (flag `-np 2` en llama.cpp).
- No genera texto libre, no soporta tool calling generativo ni razonamiento multi-paso por decodificación; su función es puntuar opciones.

## Casos de uso

- Enrutamiento de peticiones en agentes: dado el estado de la conversación en JSON y una pregunta `choice` con las herramientas o rutas disponibles, el modelo devuelve la probabilidad de cada opción en un forward pass, lo que permite enrutar sin coste de generación y con latencia de milisegundos.
- Moderación y clasificación de contenido: con preguntas `choice` sobre categorías de política, se obtienen probabilidades calibradas que permiten fijar umbrales y auditar decisiones, algo más robusto que parsear la salida de un modelo generativo.
- Recomendación de siguiente acción en soporte al cliente: el estado incluye el historial y el contexto del ticket; el modelo puntúa acciones candidatas (escalar, pedir datos, cerrar) con contexto de hasta 128k tokens para casos con historiales largos.
- Triaje documental: clasificación de documentos legales o técnicos largos (32k–128k tokens) en categorías tipadas, con precisión reportada del 93,4% en el rango 32k–128k y latencia mediana de 2,0 s.
- Evaluación de políticas y simulaciones: en el arena de juegos OpenSpiel frente a Jev, el modelo obtuvo 122 victorias, 47 tablas y 87 derrotas (56,8%), lo que lo hace útil para agentes que eligen movimientos entre opciones discretas.
- Decisión en pipelines de datos: puntuar registros JSON contra reglas de negocio tipadas (por ejemplo, aprobar o rechazar una solicitud) desplegando el servidor `serve.py` o `llama-server` con el GGUF Q8_0 en hardware modesto.
- Sustitución de llamadas a LLM generativo en tareas de clasificación: al no generar texto, elimina fallos de formato y reduce el coste por decisión, manteniendo el mismo contrato de API que la API alojada de Drex.

## Benchmarks y rendimiento

Decision Index 0.3.1 (solo benchmarks públicos, 37 pruebas en cinco áreas; columnas de área como habilidad corregida por azar × 100):

| Modelo | Índice público | Raw | Conocimiento y razonamiento | Lenguaje | Recuperación | Herramientas | Artes |
|---|---|---|---|---|---|---|---|
| Drex v1.5 (9B) | 58,08 | 68,08 | 44,6 | 60,4 | 61,7 | 75,0 | 48,8 |
| Jev 1.13.0 | 57,96 | 68,55 | 53,9 | 59,2 | 55,4 | 75,1 | 39,1 |
| Bespoke Nimble 9B v3 | 57,19 | 68,38 | 41,0 | 60,7 | 55,5 | 84,2 | 44,0 |
| Cloudflare clef-flash | 56,15 | 66,53 | 53,0 | 47,2 | 52,2 | 81,9 | 48,4 |
| ezjev 4B s2 | 50,82 | 63,16 | 31,0 | 60,5 | 56,3 | 69,9 | 31,1 |

JevBench (231 elementos públicos):

| Modelo | Precisión | Fácil | Estándar | Difícil |
|---|---|---|---|---|
| Jev 1.13.0 | 87,0% | 100,0% | 98,6% | 73,9% |
| Drex v1.5 | 86,2% | 100,0% | 95,8% | 73,9% |
| decider-4b v2.1 | 83,1% | 100,0% | 98,6% | 65,8% |

Contexto largo:

| Longitud de contexto | Precisión | Truncado a 8k | Latencia mediana |
|---|---|---|---|
| 8k – 32k tokens | 89,5% | 76,5% | 0,65 s |
| 32k – 128k tokens | 93,4% | 78% | 2,0 s |

Arena de juegos frente a Jev (ocho juegos de OpenSpiel, 32 partidas cada uno): 122 victorias, 47 tablas y 87 derrotas (56,8%).

## Requisitos de hardware

- VRAM estimada: unos 18 GB para los pesos bf16, con consumo creciente según la longitud del documento; el GGUF Q8_0 ocupa unos 9,5 GB.
- GPU recomendadas: A100, H100 o RTX 4090 para bf16; en consumer GPU, una RTX 4090 (24 GB) cubre los pesos bf16 con margen limitado para contexto largo, y tarjetas de 12–16 GB pueden usar el GGUF Q8_0.
- Apple Silicon (Metal) y CPU: soportados mediante llama.cpp u Ollama con el GGUF Q8_0.
- Opciones de despliegue: `inference.py` y `serve.py` (PyTorch + transformers, requieren CUDA), `llama-server` de la rama `drex-v1.5` del repositorio de llama.cpp, y Ollama.
- Latencia: mediana de 0,65 s para contextos de 8k–32k tokens y de 2,0 s para 32k–128k tokens, según los datos de la model card.
- Nota de despliegue: `serve.py` escucha en `127.0.0.1` sin autenticación; debe mantenerse en local o protegerse con un proxy de autenticación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público 0.3.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drex v1.5 | 8,95B | 16k por defecto, hasta 131k | 58,08 | nace-ai-open-rail-m | Pesos en Hugging Face (safetensors + GGUF) |
| Jev 1.13.0 | no publicado | no disponible | 57,96 | no disponible | Leaderboard de decisión |
| Bespoke Nimble 9B v3 | 9B | no disponible | 57,19 | no disponible | Leaderboard de decisión |
| Cloudflare clef-flash | no disponible | no disponible | 56,15 | no disponible | Leaderboard de decisión |
| ezjev 4B s2 | 4B | no disponible | 50,82 | no disponible | Leaderboard de decisión |

Drex v1.5, Jev y Nimble quedan dentro de la banda de empate de 0,9 puntos del leaderboard; Drex v1.5 supera a Jev en 20 de las 37 pruebas. En JevBench, Jev mantiene una ventaja de 0,8 puntos porcentuales en precisión global, mientras que ambos empatan en la categoría difícil (73,9%).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, código ni razonamiento multi-paso por decodificación; solo puntúa opciones predefinidas.
- La model card no documenta sesgos conocidos, composición del dataset ni idiomas soportados; la evaluación multilingüe y de equidad queda sin datos.
- Riesgo de calibración deficiente fuera de la distribución de DecisionBench y JevBench; las probabilidades deben validarse con datos propios antes de fijar umbrales en producción.
- El contexto por defecto es de 16.384 tokens; usar 128k exige configuración explícita y aumenta la memoria y la latencia (2,0 s de mediana en el rango 32k–128k).
- La licencia `nace-ai-open-rail-m` está etiquetada como `other`; es imprescindible revisar `LICENSE` antes de uso comercial, ya que las condiciones no están resumidas en la model card.
- El servidor `serve.py` no incluye autenticación y escucha en `127.0.0.1`; exponerlo requiere añadir una capa de autenticación.
- El soporte de llama.cpp depende de una rama específica (`drex-v1.5`) del repositorio, no de la versión principal; la conversión a GGUF requiere `--no-mtp`.
- Los resultados de benchmarks son en gran parte autoinformados por el autor (la suite pública se ejecutó con el kit oficial), y Jev tiene un recuento de parámetros no publicado, lo que dificulta la comparación estricta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/drex-v1.5
- Paper (Towards Foundation Decision Models: Drex): https://huggingface.co/papers/2611.07854
- Repositorio Drex: https://github.com/nace-ai/drex-decision-models
- Drex DLM: https://huggingface.co/nace-ai/drex-dlm
- Documentación de la API alojada: https://drex.nace.ai/docs
- Agent skill de Drex: https://github.com/nace-ai/drex-agent-skill
- Leaderboard del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Rama de llama.cpp para Drex v1.5: https://github.com/nace-ai/llama.cpp
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Sitio de Nace.AI: https://www.nace.ai/
