# jaredpalmer/kev-0.8b

## Resumen

Kev-0.8B es un modelo de decisión, no un modelo generativo: recibe un documento (el *state*) y un conjunto de preguntas tipadas, y devuelve en una sola pasada hacia delante una distribución de probabilidad por pregunta. No produce texto libre. Se distribuye como adaptador LoRA (r=16, 11,3 millones de parámetros entrenables) más una *pointer head* entrenada desde cero sobre `Qwen/Qwen3.5-0.8B-Base` (revisión `dc7cdfe2`), y sirve el contrato público `/v1/systemone` de TypeSafe. Lo desarrolla jaredpalmer dentro de la familia Kev, que incluye también Kev-0.6B, Kev-4B, Kev-9B y Jev.

El problema que aborda es el de la clasificación tipada con calibración utilizable: en lugar de elegir una etiqueta, el modelo devuelve probabilidades por opción (incluida la opción "ninguna de las anteriores" y variantes de respuesta tipo *score*), lo que permite decidir cuándo automatizar y cuándo derivar a un humano. Con 0,829 de exactitud en el desarrollo in-distribution y un ECE de 0,095 sobre probabilidades crudas, es el primer miembro pequeño de la familia que aprende composición de reglas (0,38 en pares con estructura de política reservada, frente a 0,08 de Kev-0.6B).

Su relevancia ahora es doble: por un lado, mejora a Kev-0.6B (Qwen3) en todas las particiones congeladas (+5,7 pp fuera de dominio, intervalo [+1,2, +10,0] con bootstrap agrupado por registro); por otro, es un adaptador de 0,1 GB que cabe en entornos donde un modelo de 4B no entra. La contrapartida declarada por el autor es explícita: fuera de dominio sigue siendo un modelo sub-1B, con MMLU 0,41 y PAWS 0,59 cerca de la base sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16) + pointer head sobre el transformer `Qwen/Qwen3.5-0.8B-Base`; el adaptador se aplica a las proyecciones de atencion, MLP y DeltaNet |
| Parametros totales | Modelo base de aproximadamente 0,8 mil millones; el adaptador anade 11,3 millones de parametros entrenables (r=16, alpha=32) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 para el adaptador y la pointer head; la base Qwen3.5 es Apache-2.0; los datasets conservan sus licencias propias |
| Formato de pesos | safetensors (repositorio de adaptador PEFT); libreria `peft`, compatible con `transformers >= 5.17` y `peft >= 0.21` |

## Arquitectura y entrenamiento

El modelo no es un generador: es una cabeza de decisión sobre una base Qwen3.5-0.8B. El adaptador LoRA modifica las proyecciones de atención, MLP y DeltaNet del modelo base, y sobre esa representación se entrena desde cero una *pointer head* que emite una distribución sobre las opciones de cada pregunta tipada. La tarea soportada es "typed decision (choice / noul / score)": elección entre opciones, opción "ninguna de las anteriores" y respuestas de tipo puntuación. Un único *forward pass* resuelve todas las preguntas de una petición.

El entrenamiento usa la suite congelada `evals/v7/decision-v7`: 10.000 registros públicos (1.000 por fuente, procedentes de banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en e imdb), 896 registros de pares mínimos de política sobre nueve familias de plantillas y 1.680 registros generados a partir de 60 estructuras de reglas aleatorias en cuatro estilos de renderizado. Se hicieron dos épocas con LoRA r=16, alpha=32, *pointer head* desde cero, entropía cruzada sobre la distribución de opciones, learning rate 1e-4 con OneCycle, batch 8, autocast en bf16 con pesos maestros en fp32. Se aplicaron permutación de opciones, inserción de "ninguna de las anteriores", distractores y pares mínimos de "none" en el 25 % de los registros de tipo Choice. El coste declarado es de unos 20 minutos en una H100. No se usaron salidas de Jev para el entrenamiento. El protocolo de evaluación separa particiones de desarrollo (para seleccionar modelos) de una partición de test bloqueada que se lee como máximo una vez por candidato; cada resultado guarda el hash de la suite, los hashes de código y el commit de git en `result.json`. El checkpoint publicado es la semilla 2 de tres (transferencia 0,622 / 0,634 / **0,643**), elegida por mayor exactitud en la partición de desarrollo.

## Capacidades

- Decisión tipada en una sola pasada: dada una *state* y varias preguntas, emite una distribución de probabilidad por pregunta y opción.
- Clasificación de texto multietiqueta y de opción múltiple sobre diez dominios públicos de entrenamiento (intención bancaria, noticias, reseñas, NLI, temas, sentimiento de cinco niveles).
- Soporte de respuestas tipo *score* además de elección discreta, según la etiqueta de tarea "choice / noul / score".
- Opción "ninguna de las anteriores" integrada en el entrenamiento: exactitud de 0,83 cuando la opción *none* está presente.
- Composición de reglas de política: 0,38 de acierto en pares con estructura de política no vista durante el entrenamiento (frente a 0,08 de Kev-0.6B).
- Calibración de probabilidades: ECE de 0,095 con probabilidades crudas en dominio, y *coverage* de 0,17 a un umbral de error del 5 %.
- Multilingüe: no. El modelo declara únicamente inglés.
- *Tool calling* / *function calling*: no disponible; el modelo no genera texto ni llamadas a herramientas, solo distribuciones sobre opciones.
- Modo *thinking*, visión o audio: no soportados.
- Integración con el contrato `/v1/systemone` de TypeSafe mediante `TypeSafeClient`.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica la intención del cliente sobre las etiquetas de banking77 y devuelve probabilidad por clase; el sistema puede enrutar automáticamente por encima de un umbral de confianza y escalar a un agente humano en el resto, usando el *coverage* de 0,17 al 5 % de error como referencia conservadora.
- Moderación de contenido y detección de toxicidad: con 0,62 de exactitud fuera de dominio en TweetEval-offensive y 0,54 en Emotion, sirve como primer filtro barato en una cascada donde los casos dudosos se reenvían a un modelo mayor como Kev-4B o Jev.
- Análisis de sentimiento y voz del cliente: clasificación de reseñas de Yelp, Amazon e IMDb y de SST-5 en cinco niveles, con distribución de probabilidad que permite agregar métricas ponderadas por confianza en lugar de etiquetas duras.
- Clasificación temática de documentos: AG News, DBpedia-14 y TREC ofrecen etiquetas de tema y tipo de pregunta; el modelo puede etiquetar grandes lotes de documentos sin generar texto, lo que reduce coste y latencia frente a un LLM generativo.
- Inferencia de relación textual (NLI): con 0,82 en QNLI, puede usarse para comprobar si una respuesta está respaldada por un documento en un pipeline de *retrieval-augmented generation*, sin necesidad de un modelo de razonamiento completo.
- Control de autorización y cumplimiento de políticas: con 0,90 de exactitud en la fuente de autorización, el modelo decide si una acción está permitida según una política escrita, devolviendo probabilidad para auditar cada decisión automática.
- Cálculo de plazos y aritmética de fechas: la tarea `deadline` (aritmética de fechas de tres niveles) obtiene 0,28, por lo que solo es apto como señal auxiliar o para triaje, nunca como fuente única de verdad en gestión de vencimientos.
- *Gating* de agentes con abstención: al soportar la opción "ninguna de las anteriores", puede actuar como portero que decide si una consulta entra en el flujo automatizado o se rechaza, con 0,83 de exactitud cuando la opción *none* está presente.
- Automatización selectiva con presupuesto de error: usando la calibración en dominio (ECE 0,095), se puede fijar un umbral de confianza y automatizar solo la fracción de decisiones que lo supere, midiendo la cobertura resultante sobre datos propios.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false` en el model-index). Todas las filas usan los mismos ítems congelados.

| Particion | Metrica | Valor |
|---|---|---|
| decision-v7 development (1.204 registros, in-distribution) | exactitud | 0,829 |
| decision-v7 development (in-distribution) | ECE, probabilidades crudas | 0,095 |
| transfer-v4 development (764 registros, out-of-domain) | exactitud | 0,643 |
| transfer-v4 development (out-of-domain) | Brier | 0,513 |
| Test bloqueado, in-distribution | exactitud | 0,827 |
| Test bloqueado, in-distribution | Brier | 0,258 |
| Test bloqueado, in-distribution | ECE | 0,096 |
| Test bloqueado, out-of-domain | exactitud | 0,668 |
| Test bloqueado, out-of-domain | Brier | 0,473 |
| Test bloqueado, out-of-domain | ECE | 0,164 |
| Test bloqueado, out-of-domain | errores confiados (p >= 0,9 e incorrectos) | 9,6 % |
| Test bloqueado, out-of-domain | pares con politica reservada, ambos correctos | 0,36 |

Comparativa de la familia sobre los mismos ítems congelados:

| Metrica | Kev-0.6B (Qwen3) | Kev-0.8B | Kev-4B | Kev-9B | Jev |
|---|---|---|---|---|---|
| Exactitud in-distribution (decision-v7 dev) | 0,801 | 0,829 | 0,877 | 0,876 | 0,845 |
| Exactitud out-of-domain (transfer-v4 dev) | 0,620 | 0,643 | 0,794 | 0,812 | 0,857 |
| Brier out-of-domain | 0,536 | 0,513 | 0,316 | 0,291 | 0,211 |
| Errores confiados out-of-domain (p >= 0,9) | 10,8 % | 9,6 % | 8,2 % | 7,5 % | 3,7 % |
| Cobertura con error <= 5 % | no disponible | 0,17 | 0,54 | 0,53 | 0,70 |
| Estructuras de politica reservadas, ambos correctos | 0,08 | 0,38 | 0,78 | 0,80 | 0,86 |
| Tasa de inversion por orden de opciones | 0,07 | 0,06 | 0,08 | 0,03 | 0,00 |
| Opcion "none" presente, exactitud | 0,80 | 0,83 | 0,93 | 0,90 | no disponible |

Exactitud out-of-domain por fuente (Kev-0.8B / Jev): QNLI 0,82 / 0,93; SciQ 0,90 / 0,99; TweetEval-offensive 0,62 / 0,81; PAWS 0,59 / 0,79; MMLU 0,41 / 0,90; Emotion 0,54 / 0,59; autorización 0,90 / 1,00; deadline (aritmética de fechas de tres niveles) 0,28 / 0,93; (A o B) y C 0,66 / 0,91; (A y B) o no C 0,62 / 0,97; if A then not B else C 0,72 / 0,78.

Comparación emparejada frente a Kev-0.6B sobre los mismos ítems (bootstrap agrupado por registro): +5,7 pp [+1,2, +10,0] out-of-domain. En el test bloqueado, Kev-0.6B obtiene 0,808 in-distribution y 0,642 out-of-domain.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación derivada del tamaño del modelo base, no publicada por el autor): en bf16, alrededor de 1,6 GB solo de pesos, más overhead de activaciones y runtime; en la práctica, unos 2-3 GB. En fp32, unos 3,2 GB de pesos. En 8 bits, en torno a 0,8-1 GB, y en 4 bits, alrededor de 0,4-0,5 GB.
- El repositorio completo ocupa 0,1 GB, ya que solo contiene el adaptador y la *pointer head*; la base Qwen3.5-0.8B se descarga aparte.
- GPU recomendadas: el autor entrena en una H100 (unos 20 minutos). Para inferencia, cualquier GPU CUDA con suficiente VRAM sirve; una RTX 4090 o una RTX 3060 de 12 GB son suficientes por tamaño. No hay cifras de latencia publicadas para CUDA.
- Cabe en GPU de consumo: sí, por tamaño de pesos. El factor limitante no es la VRAM sino los kernels: en Mac, los kernels de DeltaNet no tienen implementación MPS.
- Rendimiento en Apple Silicon declarado: una petición de cinco preguntas tarda aproximadamente 0,33 s en bf16 sobre un M5 (Kev-0.6B: 0,12 s). El autor lo califica de lento para su tamaño. En CUDA con `flash-linear-attention` es rápido, sin cifra concreta.
- Opciones de despliegue: `uv run --extra serve python -m kev.serve --run jaredpalmer/kev-0.8b --port 8008`, con clientes compatibles con TypeSafe (`TypeSafeClient(api_key="local", base_url="http://127.0.0.1:8008", model="kev-latest")`). Requiere `transformers >= 5.17` y `peft >= 0.21`.
- vLLM, llama.cpp, Ollama o TGI: no disponible. Al no ser un modelo generativo y depender de una *pointer head* sobre el contrato de TypeSafe, no hay documentación de integración con esos servidores.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

Comparación con los otros miembros de la familia Kev, que comparten receta, datos y protocolo de evaluación:

| Modelo | Base | Exactitud in-distribution (dev) | Exactitud out-of-domain (dev) | Brier out-of-domain | Cobertura con error <= 5 % | Licencia y disponibilidad |
|---|---|---|---|---|---|---|
| Kev-0.6B | Qwen3 | 0,801 | 0,620 | 0,536 | no disponible | no disponible |
| Kev-0.8B | Qwen3.5-0.8B | 0,829 | 0,643 | 0,513 | 0,17 | Apache-2.0, publicado en HuggingFace |
| Kev-4B | no disponible | 0,877 | 0,794 | 0,316 | 0,54 | no disponible |
| Kev-9B | no disponible | 0,876 | 0,812 | 0,291 | 0,53 | no disponible |
| Jev | no disponible | 0,845 | 0,857 | 0,211 | 0,70 | no disponible |

La comparativa con alternativas externas de la misma categoría (modelos de decisión calibrada sub-1B) no está disponible en la información proporcionada. El propio autor recomienda usar Kev-4B cuando prime la exactitud y reservar Kev-0.8B para los casos en que la memoria descarte al modelo de 4B, midiendo siempre sobre datos propios.

## Limitaciones y advertencias

- Fuera de dominio es un modelo sub-1B: MMLU 0,41 y PAWS 0,59, cerca de la base sin entrenar. La misma receta alcanza 0,79 a 4B y 0,81 a 9B en esos ítems.
- Tasa de errores confiados fuera de dominio del 9,6 % (p >= 0,9 e incorrectos). Las probabilidades son utilizables en dominio (ECE 0,095) pero deben tratarse como orientativas fuera de él (ECE 0,184).
- Aritmética de fechas deficiente: 0,28 en la tarea `deadline`, con colapso hacia el nivel intermedio (*ordinal hedging*). No apto como fuente única en cálculo de plazos.
- Composición de reglas limitada: 0,38 en pares con estructura de política reservada, lejos del 0,78-0,86 de los modelos mayores.
- Dependencia de versiones estrictas: requiere `transformers >= 5.17` y `peft >= 0.21`.
- Rendimiento pobre en Mac para su tamaño: los kernels de DeltaNet no tienen implementación MPS; 0,33 s por petición de cinco preguntas en un M5, frente a 0,12 s de Kev-0.6B.
- Solo inglés. No hay soporte declarado de otros idiomas.
- No es un modelo generativo: no acepta instrucciones en lenguaje natural ni produce texto, no soporta *tool calling* ni razonamiento multi-paso conversacional. Cualquier uso debe respetar el contrato de decisiones tipadas de TypeSafe.
- Licencia Apache-2.0 en adaptador y cabeza, y Apache-2.0 en la base Qwen3.5, lo que permite uso comercial; los diez datasets de entrenamiento conservan sus licencias propias y deben verificarse por separado.
- Selección de checkpoint sobre la partición de desarrollo (semilla 2 de tres). Las métricas del model-index figuran como no verificadas.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaredpalmer/kev-0.8b
- Repositorio de código, suites, resultados y registro de investigación: https://github.com/jaredpalmer/kev
- Planes y documentación citados en la model card: `PLAN_Qwen35.md`, `PLAN.md`, `runs/leaderboard.md`, `runs/locked/kev-08b-q35-ungated/result.json` dentro del repositorio anterior
- Modelo base: `Qwen/Qwen3.5-0.8B-Base` (revisión `dc7cdfe2`), referenciado desde el repositorio del adaptador
- Resultados de la búsqueda web: no contienen información sobre este modelo. Las cinco URLs devueltas corresponden a la temporada 2024 de las Grandes Ligas de Béisbol (Wikipedia, Baseball-Reference, ESPN y MLB.com) y no guardan relación con Kev-0.8B, por lo que no se incluyen.
