# deshwalmahesh/domyn-edge-jev-decision

## Resumen

D-Edge-Decision es un ajuste fino completo (full fine-tune) de 3.930 millones de parámetros sobre el modelo base domyn/Domyn-Edge-SFT, desarrollado por el autor independiente deshwalmahesh. Su particularidad es que no genera texto: responde a decisiones tipadas (sí/no, elección múltiple, puntuación graduada) leyendo directamente la distribución de probabilidad del siguiente token sobre códigos de opción de un solo token (`A`, `B`, `C`…). Se trata, por tanto, de un modelo de "Sistema 1" que produce una distribución de probabilidad nativa en un único forward pass, sin tokens generados.

El modelo está pensado para escenarios donde se necesita una decisión calibrada y con incertidumbre cuantificable, no una respuesta conversacional. Al exponer probabilidades sobre las opciones en lugar de texto libre, permite umbralizar, comparar y auditar decisiones de forma programática, algo útil en enrutamiento, clasificación de tickets o triaje automatizado.

Es relevante ahora porque propone una alternativa ligera (3,93B) y de bajo coste computacional (un solo paso, cero tokens generados) frente a pipelines que invocan modelos generativos grandes para tareas de decisión. El modelo se publica bajo licencia Apache-2.0 y está entrenado únicamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de domyn/Domyn-Edge-SFT), con código personalizado (`trust_remote_code`) |
| Parámetros totales | 3.928.787.968 (3,93B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenado con secuencias de 16k tokens) |
| Tipos de cuantización | no disponible (la model card solo documenta carga en fp16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (repo de 23,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de domyn/Domyn-Edge-SFT, con ajuste fino de todos los parámetros (full-parameter SFT). La innovación principal no está en la arquitectura sino en el uso: en lugar de decodificar texto, se lee la distribución del siguiente token restringida a los códigos de opción (`A`, `B`, …) y se normaliza con softmax para obtener una probabilidad por opción. La model card recomienda mantener la LM head y RoPE en fp32, ya que los logits de las opciones se sitúan en el rango aproximado de 30–36, donde un paso en fp16 puede desplazar la probabilidad en un punto porcentual.

El entrenamiento se realizó sobre los datasets tasksource/tasksource-jev-typed-decisions y caiovicentino1/eikos-decisions, dejando crh225/plumb-decisions como conjunto de test. Se usó una función de pérdida de entropía cruzada suave más un término de Brier con peso 1.0 sobre las opciones, secuencias de 16k tokens, una sola época, LR coseno de 3,5e-6 y selección de checkpoint por NLL de evaluación. El autor indica explícitamente que fue una única ejecución, sin ablaciones.

## Capacidades

- Decisión tipada en un único forward pass: sí/no, elección múltiple y puntuación graduada, devolviendo una distribución de probabilidad sobre las opciones.
- Calibración de incertidumbre: las probabilidades por opción permiten umbralizar y detectar casos ambiguos.
- Lectura de estado y pregunta en formato conversacional mediante plantilla de chat (`apply_chat_template`), con `enable_thinking=False`.
- Cero generación de tokens: el coste de inferencia es un solo paso del modelo, independientemente del número de opciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño es de un solo paso ("System One").
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: modo de decisión con distribución nativa de probabilidad; no se documentan visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, decidir entre equipos (facturación, envío, técnico) leyendo la probabilidad de cada etiqueta; el ejemplo de la model card muestra `billing: 0.98` frente a `shipping: 0.01`, lo que permite umbralizar y escalar casos ambiguos.
- Triaje de moderación de contenido: clasificar un texto en categorías discretas y usar la probabilidad como señal de confianza para revisión humana cuando caiga por debajo de un umbral.
- Clasificación de intención en asistentes: sustituir un clasificador dedicado por el modelo, aprovechando que devuelve una distribución calibrada sobre opciones definidas en tiempo de inferencia.
- Validación de respuestas en pipelines RAG: decidir si un fragmento recuperado responde a la pregunta (sí/no) y usar la probabilidad para decidir si se recupera más contexto.
- Puntuación graduada en evaluación: asignar una nota ordinal (por ejemplo, de 1 a 5) a una respuesta o a un estado, obteniendo la distribución sobre los niveles.
- Decisión de escalado en agentes: como "portero" barato que decide si una consulta requiere un modelo mayor o puede resolverse con una ruta simple, gracias a su coste de un solo paso.
- Control de calidad en pipelines de datos: filtrar pares pregunta-respuesta o ejemplos de entrenamiento con una decisión binaria calibrada antes de incorporarlos a un dataset.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JevBench (231 ítems públicos). La columna Composite es la media armónica de Intelligence, Speed y Cost.

| # | Sistema | Composite | Intelligence | Speed | Cost |
|---|---|---|---|---|---|
| 1 | Plumb-4B | 76,57 | 84,77 | 92,61 | 60,30 |
| 2 | H2O-Lightning-4B † | 76,40 | 84,14 | 92,61 | 60,30 |
| 3 | Imajev-4B | 75,13 | 79,70 | 92,61 | 60,30 |
| 4 | JevK5 v0.2.0 | 74,75 | 78,43 | 92,61 | 60,30 |
| 5 | decider-4b v2 | 73,97 | 75,89 | 92,61 | 60,30 |
| 6 | D-Edge-Decision (ours) | 73,56 | 74,62 | 92,61 | 60,30 |
| 7 | SemIf (Qwen3.5-4B) | 72,72 | 72,09 | 92,61 | 60,30 |
| 8 | local-jev Qwen3.5-4B | 72,50 | 71,45 | 92,61 | 60,30 |
| 9 | Jev 1.13.0 (API) | 72,03 | 80,33 | 91,50 | 54,73 |
| 10 | reflex 4B | 71,84 | 69,55 | 92,61 | 60,30 |

Precisión por dificultad en JevBench:

| Nivel | Aciertos | Precisión |
|---|---|---|
| easy | 48/48 | 1,000 |
| medium | 70/72 | 0,972 |
| hard | 73/111 | 0,658 |
| all | 191/231 | 0,827 |

El autor indica que sus cifras son autoevaluadas con JevBench y el adaptador PR #241 (Calibration 77,92; Capability 76,27). Los valores de Speed y Cost son idénticos para todos los modelos de 4B (fila de H2O-Lightning-4B en el tablero), salvo Jev, que usa su propia fila. La entrada marcada con † es autodeclarada. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los pesos de 3,93B ocupan aproximadamente 7,9 GB; con overhead de activaciones y contexto conviene reservar del orden de 10–12 GB. En cuantizaciones de 8 bits o 4 bits el requisito bajaría, pero no se documentan en la model card.
- GPU recomendadas: A100, H100 o L40S para despliegue de producción; una RTX 4090 (24 GB) es suficiente para fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y previsiblemente en tarjetas de 16 GB con cuantización, aunque esta última opción no está documentada por el autor.
- Opciones de despliegue: la model card solo documenta Transformers (Python 3.12, `transformers==5.22.1`, `torch==2.15.0`, `einops`), con `trust_remote_code=True` y carga en fp16 sin `autocast`. No se documentan vLLM, llama.cpp, Ollama ni TGI; el uso de código personalizado y la lectura directa de logits hacen que estos motores no estén garantizados.
- Latencia y throughput: no disponibles de forma explícita. Por diseño, cada decisión requiere un único forward pass sin generación, por lo que la latencia depende del tamaño del prompt y no del número de opciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench Composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-Edge-Decision | 3,93B | no disponible | 73,56 | Apache-2.0 | Hugging Face |
| Plumb-4B | ~4B | no disponible | 76,57 | no disponible | tablero JevBench |
| H2O-Lightning-4B | ~4B | no disponible | 76,40 | no disponible | tablero JevBench |
| Imajev-4B | ~4B | no disponible | 75,13 | no disponible | tablero JevBench |
| Jev 1.13.0 (API) | no disponible | no disponible | 72,03 | propietaria (API) | API |

La comparativa se limita a los sistemas incluidos en el tablero JevBench de la model card; no se dispone de datos de parámetros, contexto ni licencia de las alternativas más allá de lo indicado. D-Edge-Decision queda en sexta posición en Composite y séptima en Intelligence, por debajo de Plumb-4B, H2O-Lightning-4B, Imajev-4B, JevK5 y decider-4b, y por encima de SemIf, local-jev, Jev 1.13.0 y reflex 4B.

## Limitaciones y advertencias

- Rendimiento desigual por dificultad: la precisión cae al 65,8 % en el nivel hard de JevBench, frente al 100 % en easy y el 97,2 % en medium.
- Entrenamiento de una sola ejecución y una sola época, sin ablaciones, según declara el autor; no hay garantía de que la configuración sea óptima.
- Solo inglés: no se documenta soporte de otros idiomas.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de ejecutarlo en producción.
- Sensibilidad numérica: la model card advierte que la LM head debe ir en fp32 porque los logits de las opciones están en el rango 30–36 y fp16 puede alterar la probabilidad; además, la atención necesita q/k/v en un mismo dtype, por lo que no debe usarse `autocast`.
- Las métricas de JevBench son autoevaluadas por el autor con un adaptador (PR #241) y los valores de Speed y Cost son compartidos entre todos los modelos de 4B, por lo que no miden diferencias reales de velocidad entre ellos.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de robustez fuera del conjunto de decisión; al leer directamente logits, el modelo puede asignar alta probabilidad a opciones incorrectas en estados fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base domyn/Domyn-Edge-SFT; conviene verificar las condiciones de dicho modelo base.
- El autor declara que es un experimento personal e independiente, sin afiliación con ninguna empresa u organización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deshwalmahesh/domyn-edge-jev-decision
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de entrenamiento: https://huggingface.co/datasets/caiovicentino1/eikos-decisions
- Dataset de test (held out): https://huggingface.co/datasets/crh225/plumb-decisions
- Referencia al adaptador JevBench PR #241: no disponible (no se proporciona URL en la información disponible)
