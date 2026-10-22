# ninhnv/chon-1.0-12b

## Resumen

Chon-1.0-12B es un adaptador LoRA (PEFT) sobre google/gemma-4-12B-it que convierte un modelo de lenguaje generalista de 12B parámetros en un **modelo de decisión tipada**: recibe un estado (texto, JSON o una conversación) y una pregunta con un conjunto cerrado de opciones, y devuelve una probabilidad calibrada para cada opción. Soporta tres tipos de pregunta: `choice` (de 2 a 256 opciones con etiqueta, leídas en grupos cuando hay más de 16), `yes/no` (devuelve P(sí)) y `score` (distribución sobre niveles ordenados). Lo desarrolla el usuario ninhnv y el código de servicio vive en el repositorio xoai/chon.

Su relevancia está en el nicho: en lugar de generar texto libre que luego hay que parsear, expone una interfaz determinista (`/v1/systemone`, formato TypeSafe usado por el benchmark JevBench) pensada para enrutado, clasificación y triaje con probabilidades utilizables en producción. El adaptador ocupa ~1,0 GB y se carga junto al modelo base sin modificarlo.

Según las mediciones del autor (no son cifras oficiales de ningún board), el modelo obtiene 84,9 de capacidad en un conjunto held-out de 720 ítems y 84,7 en el conjunto público de JevBench (231 ítems), con un p95 de respuesta de 4,8 s en una H100 80 GB tras la actualización del 22 de octubre de 2026, que rebajó el coste a ~0,042 USD por 1.000 decisiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer decoder-only google/gemma-4-12B-it; no se modifican los pesos del modelo base |
| Parametros totales | 12B en el modelo base; el adaptador pesa ~1,0 GB (número exacto de parámetros entrenables no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Estado de entrada hasta 6.000 tokens (lo que exceda se trunca conservando el inicio); prompt hasta 8.192 tokens |
| Tipos de cuantizacion | bf16 para el adaptador y el modelo base; FP8 para el modelo base en la ruta de razonamiento servida con vLLM. No se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés; vietnamita también soportado |
| Licencia | Apache-2.0 (la model card la declara también para el modelo base) |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json), formato PEFT/LoRA; tokenizer y chat template del modelo base sin cambios |

Otros metadatos: repositorio de 1,1 GB, 37 descargas y 1 like en el momento de la consulta; creado el 14 de octubre de 2026 y actualizado el 22 de octubre de 2026. El repositorio incluye además `chon_config.json` con los ajustes de prompt y calibración que lee el servidor `chon`.

## Arquitectura y entrenamiento

El modelo no es un modelo completo, sino un adaptador LoRA cargado junto a google/gemma-4-12B-it, que se mantiene sin modificar. La innovación no está en la arquitectura del transformer, sino en la interfaz: el adaptador aprende a emitir una decisión tipada con distribución de probabilidad calibrada sobre opciones cerradas, en lugar de texto libre. Sobre preguntas en las que el modelo no está seguro, primero redacta hasta 512 tokens de razonamiento con el modelo base "en crudo" y después lee su respuesta; esa escritura puede delegarse a un servidor vLLM del modelo base en FP8, o resolverse con una KV cache estática si no hay memoria libre suficiente. La lectura final de la decisión siempre la hace este adaptador.

No se dispone de información sobre el dataset de entrenamiento (número de tokens, composición, mezcla de idiomas), ni sobre si se aplicaron etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla el rank, alpha ni las capas objetivo del LoRA. En la actualización del 22 de octubre de 2026 no se reentrenó el adaptador ni se tocó la calibración (misma revisión `cf3c0d3`): solo cambiaron el servicio (razonamiento con vLLM en FP8 en lugar de generación con transformers) y los umbrales de "inseguro", que bajaron del 20 % al 11 % de las preguntas que activan la ruta de razonamiento, a costa de ~1,1 puntos de capacidad held-out (86,7 → 84,9) y ~1,1 puntos en el conjunto público (85,8 → 84,7).

## Capacidades

- Decisión sobre conjuntos cerrados: `choice` con 2 a 256 opciones etiquetadas; por encima de 16 opciones las lee en grupos y hace una ronda final.
- Preguntas booleanas con probabilidad calibrada: devuelve P(sí) en lugar de una respuesta categórica.
- Puntuación ordinal: distribución de probabilidad sobre niveles ordenados (`score`).
- Entrada heterogénea: texto plano, JSON o conversación multi-turno como "estado".
- Salida con probabilidades por opción, apta para umbrales y abstención en producción.
- Ruta de razonamiento corta (hasta 512 tokens) activada solo en preguntas inseguras, con decodificación delegada a vLLM.
- Interfaz HTTP TypeSafe (`/v1/systemone`) y métricas de `usage` (`input_tokens`, `output_tokens`).
- Multilingüe limitado a inglés y vietnamita.
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio, tool calling ni agents multi-paso; el adaptador está especializado en clasificación/calibración.

## Casos de uso

- **Enrutado de tickets de soporte**: pasar el histórico del ticket como estado y definir opciones como `refund`, `shipping` u `other`; el servicio devuelve la opción y su probabilidad, lo que permite derivar a un humano cuando P(mejor opción) queda por debajo de un umbral. Es el ejemplo que documenta el propio autor.
- **Triaje de incidencias en CI/CD o alertas**: clasificar un evento (log, JSON de monitorización) en niveles ordenados (`score`) para decidir severidad y página de guardia, aprovechando la salida ordinal calibrada en lugar de un texto que haya que parsear.
- **Moderación con abstención**: usar `yes/no` sobre criterios concretos ("¿incumple la política X?") y enviar a revisión humana los casos con P(sí) entre 0,2 y 0,8, que es precisamente el rango que JevBench penaliza como respuesta poco informativa.
- **Clasificación de respuestas de encuestas**: mapear texto libre a un conjunto cerrado de categorías de negocio (motivo de baja, motivo de contacto, sentimiento por niveles) manteniendo la distribución de probabilidad para el análisis de incertidumbre.
- **Scoring de leads o solicitudes**: `score` sobre niveles tipo A/B/C/D con probabilidades, para priorizar colas sin introducir un umbral arbitrario sobre una salida generativa.
- **Extracción de decisión desde JSON**: al aceptar estados en JSON, encaja en pipelines donde un orquestador ya serializa el contexto (pedido, cliente, histórico) y solo necesita una etiqueta calibrada como siguiente paso.
- **Evaluación y benchmark interno de clasificadores**: al servir el formato wire de JevBench, puede usarse como referencia contra la que comparar clasificadores propios sobre el mismo conjunto de preguntas y criterios.

## Benchmarks y rendimiento

Mediciones del autor (explícitamente no son cifras oficiales de ningún board):

| Conjunto | Intelligence | Calibración (proxy) | Capacidad (proxy) |
|---|---:|---:|---:|
| Held-out replica (720 ítems) | 79,2 | 90,6 | 84,9 |
| JevBench público (231 ítems) | 81,0 | 88,5 | 84,7 |

Precisión con el harness oficial de JevBench (adaptador `typesafe`, ficheros públicos) contra el paquete servido:

| Dificultad | Precisión |
|---|---:|
| easy | 100,0 % |
| original | 98,6 % |
| hard | 84,7 % |

Detalles de evaluación declarados: el held-out tiene 720 ítems con la mezcla de JevBench v1.5 (Choice 360 / yes-no 180 / score 180; niveles 14/28/28/30 %), escritos para el proyecto y nunca usados en entrenamiento. El cálculo sigue las fórmulas publicadas del board (pesos iguales por tipo, pesos de nivel 10/20/30/40; en yes/no, respuestas dentro de 0,2-0,8 cuentan como fallo). La columna de calibración es un proxy propio porque el mapeo de calibración del board no está publicado por completo. Un hilo de foro cita 85,3 en la métrica Capability; la model card publica 84,7 sobre el conjunto público.

## Requisitos de hardware

- VRAM: una GPU con 40 GB o más para bf16 (medido en una H100 80 GB). El adaptador añade ~1,0 GB al modelo base de 12B.
- GPU recomendadas: H100 80 GB (entorno medido). Con 40 GB (A100 40 GB, L40S 48 GB) el requisito publicado se cumple, aunque no hay cifras de latencia para esas tarjetas.
- GPU de consumo: no cabe en 24 GB (RTX 4090/3090) según el requisito de 40 GB del autor; no se publican cuantizaciones GGUF que permitan bajarlo.
- Despliegue: `pip install "chon[serve]"` y `python -m chon.serve --model ninhnv/chon-1.0-12b --port 8000`, que descarga el modelo base y el adaptador; también hay imagen Docker (`docker/Dockerfile.serve`) con los dos entornos. Requiere `chon` 1.1.0 o superior para la ruta vLLM.
- vLLM opcional para el paso de razonamiento: se instala en un entorno aparte (`vllm==0.32.0`), arranca en un puerto local libre con la memoria sobrante, o se apunta con `$CHON_VLLM_URL` a un servidor propio. Sin vLLM se usa KV cache estática (más lento, sin segunda copia de los pesos).
- Arranque de vLLM: ~5 minutos la primera vez por compilación de kernels, ~2 minutos con caché, hasta 20 minutos en disco lento.
- Latencia y coste medidos en una H100 80 GB, una petición a la vez: mediana 0,11 s, p95 4,8 s, media 0,6 s; 744 tokens de entrada y 51 de salida por decisión de media; ~0,042 USD por 1.000 decisiones a 0,05/0,1 USD por millón de tokens de entrada/salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chon-1.0-12B | 12B + LoRA ~1,0 GB | estado 6.000 / prompt 8.192 tokens | Decisión tipada con probabilidades calibradas | Apache-2.0 | HuggingFace + GitHub xoai/chon |
| google/gemma-4-12B-it (base) | 12B | no disponible en la informacion | Generación de texto y chat; sin capa de calibración ni interfaz de decisión | Apache-2.0 según la card de Chon | HuggingFace |
| LLM generalista de ~12B con salida JSON forzada | ~12B | depende del modelo | Clasificación vía prompt + esquema JSON; sin probabilidades calibradas por opción | depende del modelo | genérica |

No se han identificado en la información disponible otros modelos de decisión tipada directamente comparables; las cifras de rendimiento de las filas alternativas figuran como "no disponible" porque no se han publicado en las fuentes consultadas. El autor afirma que el modelo supera a varios modelos mayores en tareas de decisión estructurada, pero no se aportan los nombres ni los números de esa comparación.

## Limitaciones y advertencias

- Idiomas: solo inglés y vietnamita; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- Contexto: los estados de más de 6.000 tokens se truncan conservando el inicio, de modo que la información relevante al final del estado puede perderse silenciosamente.
- Calibración: la columna de calibración de la tabla de evaluación es un proxy propio porque el mapeo del board no está completamente publicado; no debe tratarse como una calibración certificada.
- Benchmarks: todas las cifras son mediciones del autor, no resultados oficiales del board; el conjunto público tiene solo 231 ítems y el held-out, 720, por lo que los intervalos de confianza son amplios.
- Alucinación: al ser una tarea de opción cerrada el riesgo de texto inventado es bajo, pero el modelo puede asignar alta probabilidad a una opción incorrecta cuando el estado es ambiguo; se recomienda umbral de abstención.
- Sin datos de entrenamiento publicados: no se puede evaluar la composición del dataset, el sesgo inducido ni la existencia de ajuste por preferencias.
- Sesgos: no documentados por el autor; al heredar el modelo base, arrastra los sesgos de sus datos, no inspeccionables desde esta ficha.
- Licencia: la card declara Apache-2.0 tanto para el adaptador como para el modelo base; conviene verificar los términos vigentes de google/gemma-4-12B-it antes de un uso comercial, porque los modelos Gemma de Google han usado históricamente su propia licencia.
- Operación: el rendimiento publicado depende de vLLM con FP8 y de una H100 80 GB; sin vLLM la ruta de razonamiento es más lenta y no hay cifras de throughput con concurrencia (las mediciones son con una petición a la vez).
- Madurez: 37 descargas y 1 like; proyecto muy reciente (octubre de 2026), sin ecosistema de terceros ni herramientas de cuantización para hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ninhnv/chon-1.0-12b
- Ficheros del repositorio: https://huggingface.co/ninhnv/chon-1.0-12b/tree/main
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Código de servicio (GitHub): https://github.com/xoai/chon/tree/main
- Ficha en PublicAI Index: https://publicai.io/model-index/m/chon-1-0-12b
- Hilo de discusión con mediciones de terceros: https://hostingdiscussion.com/threads/chon-1-0-12b-beat-larger-models-on-jevbench-but-one-number-caught-my-attention.90728/
- Paper técnico: no disponible en la información proporcionada.
