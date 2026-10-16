# prabakaranchandran/baby-pooh-46m-midtrain-r3

## Resumen

Baby Pooh 46M midtrain r3 es un modelo de lenguaje causal de 46.151.680 parametros entrenado desde cero por el autor prabakaranchandran, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo experimental y en desarrollo (work in progress) que parte de Baby Pooh 46M v1 y aplica una fase adicional de mid-training para inyectar conocimiento del universo de Winnie the Pooh de A. A. Milne. No es un modelo instruido ni de chat: la persona, el dialogo conversacional y la seguridad se reservan para fases de post-training posteriores que, segun la informacion disponible, aun no se han publicado.

La arquitectura sigue el diseno de Qwen3 (transformer causal con atencion estandar, tag `qwen3-architecture`) y el entrenamiento usa el optimizador Muon combinado con AdamW, con un pico de learning rate de 4e-3 y 131.000 tokens por paso. El contexto de entrenamiento es de 4.096 tokens, tras un cambio de 512 a 4.096 tokens durante la decaida final del learning rate de v1. El modelo esta entrenado exclusivamente en ingles sobre corpus de escala infantil (BabyLM) mas un flujo especifico del mundo de Pooh.

Su relevancia es fundamentalmente de investigacion: sirve para estudiar recetas de mid-training, mezcla de datos sinteticos y retenidos de conocimiento de dominio en modelos minusculos, y para medir el impacto de cada decision de mezcla sobre el rendimiento general y especifico. La ronda r3 anade la "autobiografia de Pooh" (1,77M tokens en primera persona, 7,8 pasadas) sobre la ronda r2, que a su vez anadia diversidad mediante relaciones EntiGraph y reformulaciones WRAP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen3, `qwen3-architecture`) |
| Parametros totales | 46.151.680 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Libreria | transformers (tambien etiquetado para text-generation-inference y endpoints) |
| Optimizador | Muon + AdamW |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 15 de octubre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con la topologia de Qwen3, entrenado desde cero (from scratch) sobre el corpus BabyLM. La receta de v1 incluye el optimizador Muon junto a AdamW, un pico de learning rate de 4e-3, un tamano de batch de 131.000 tokens por paso y 3.363 pasos de decaida de learning rate. Durante esa decaida el contexto se amplia de 512 a 4.096 tokens, que es la ventana final del modelo. Cada ronda de mid-training no continua el entrenamiento, sino que rehace esa decaida partiendo del checkpoint pre-decaida de v1, mezclando en cada batch un flujo del dataset `pooh-world-midtrain`. Las rondas son alternativas entre si, no etapas secuenciales: se cambia una cosa cada vez.

En concreto, r3 parte de r2 y anade la "autobiografia de Pooh": los libros recontados por el propio Pooh en primera persona, manteniendo literalmente las palabras del resto de personajes y anadiendo momentos y autodescripciones en primera persona. El flujo resultante tiene 1,77M tokens, ocupa 1 de cada 32 filas de cada batch (3,1%) y se recorre 7,8 veces. Para comparar: r1 usaba 666k tokens al 6,25% del batch con 41,4 pasadas, y r2 anadio diversidad (relaciones EntiGraph y reformulaciones WRAP) hasta 1,58M tokens con 8,7 pasadas. El modelo no ha pasado por RLHF ni DPO; tampoco hay fase de instruction tuning.

## Capacidades

- Generacion de texto en ingles en modo continuacion de prompt (no conversacional).
- Modelado de lenguaje causal puro: siguiente token, con secuencias que comienzan con el token `</s>`, igual que en entrenamiento.
- Conocimiento factual del universo de Pooh (personajes, tramas, relaciones, emociones) adquirido via mid-training, medido con un conjunto de evaluacion especifico de 411 items de eleccion multiple (azar 25%).
- Capacidades linguisticas generales de escala pequena: sintaxis (BLiMP), conocimiento del mundo (EWoK), seguimiento de entidades y plausibilidad (COMPS).
- Sin soporte de tool calling ni function calling documentado.
- Sin soporte de agentes ni razonamiento multi-paso documentado.
- Sin capacidades multimodales (vision, audio) ni modo "thinking".
- Multilingue: no disponible; solo ingles.
- No es un modelo de chat ni sigue instrucciones.

## Casos de uso

- Investigacion en recetas de mid-training: comparar r1, r2 y r3 permite aislar el efecto de la composicion del flujo de dominio sobre el rendimiento general y especifico, con las rondas disenadas como alternativas de un solo cambio.
- Experimentos de retencion de conocimiento de dominio: sirve para medir cuanto conocimiento de un corpus pequeno y sintetico se retiene con 1 de cada 32 filas de batch y 7,8 pasadas, y cuanto se olvida del dominio general.
- Estudios de olvido catastrofico en modelos pequenos: la caida de perdida de validacion en Milne retenido pasa de 2,560 (v1) a 3,403 (r3), un caso claro para analizar el intercambio entre dominio y generalidad.
- Evaluacion psicolinguistica estilo BabyLM: el modelo se puede ejecutar en la evaluation-pipeline-2025 (backend causal) para obtener puntuaciones de BLiMP, EWoK, COMPS y tecnicas de lectura autoregulada.
- Base para fine-tuning posterior de un asistente con personalidad: al ser un checkpoint mid-trained sin instruction tuning, es el punto de partida natural para una fase de post-training de chat o persona.
- Demostraciones educativas de entrenamiento desde cero: con 46M de parametros y 0,1 GB de repositorio, se puede cargar y ejecutar en portatiles y entornos sin GPU para ilustrar el ciclo completo de preentrenamiento, mid-training y evaluacion.
- Generacion de texto creativo de dominio cerrado: continuaciones de estilo Milne para prototipos y materiales de investigacion, siempre con revision humana, dado el bajo rendimiento en tareas abiertas.
- Ablaciones de datos sinteticos frente a datos originales: comparar el flujo de r1 (texto de Milne + texto abierto + vistas generadas por el autor) con el de r3 (autobiografia en primera persona) permite medir el valor de la reescritura sintetica.

## Benchmarks y rendimiento

BabyLM zero-shot con evaluation-pipeline-2025, backend causal (mayor es mejor):

| Modelo | BLiMP | BLiMP suppl. | EWoK | Entity tracking | COMPS | Eye tracking | Self-paced reading |
|---|---|---|---|---|---|---|---|
| Baby Pooh v1 (etapa 1) | 77,53 | 72,77 | 54,91 | 31,18 | 58,60 | 8,79 | 4,04 |
| r1: flujo Pooh, 0,67M tokens, 41 pasadas | 77,22 | 71,33 | 53,55 | 32,65 | 58,32 | 8,45 | 3,87 |
| r2: + diversidad (EntiGraph, WRAP), 1,58M tokens, 8,7 pasadas | 76,22 | 70,33 | 55,36 | 32,00 | 58,55 | 9,11 | 4,04 |
| r3: + autobiografia de Pooh, 1,77M tokens, 7,8 pasadas | 76,49 | 70,77 | 53,91 | 30,80 | 58,30 | 8,77 | 3,92 |
| GPT-2 100M (baseline BabyLM) | 74,88 | 63,32 | 51,64 | 31,51 | 56,17 | 7,89 | 3,18 |
| GPT-BERT causal (baseline BabyLM) | 79,29 | 70,42 | 51,18 | 30,90 | 58,25 | 8,36 | 3,02 |

Perdida de validacion al final del entrenamiento (nats/token, menor es mejor):

| Conjunto de validacion | v1 | r1 | r2 | r3 |
|---|---|---|---|---|
| babylm/bnc_spoken | 3,220 | 3,231 | 3,229 | 3,226 |
| babylm/childes | 1,627 | 1,632 | 1,629 | 1,630 |
| babylm/gutenberg | 3,300 | 3,324 | 3,312 | 3,314 |
| babylm/open_subtitles | 2,982 | 2,995 | 2,988 | 2,988 |
| babylm/simple_wiki | 2,136 | 2,150 | 2,145 | 2,146 |
| babylm/switchboard | 2,173 | 2,180 | 2,178 | 2,178 |
| fineweb_edu | 3,377 | 3,397 | 3,390 | 3,388 |
| Milne retenido: WtP cap. 2 | 2,560 | 4,259 | 3,349 | 3,403 |
| Milne retenido: HPC cap. 6 | 2,622 | 4,504 | 3,393 | 3,534 |
| soda | 1,491 | 1,509 | 1,502 | 1,498 |
| tinydialogues | 1,581 | 1,598 | 1,593 | 1,593 |
| media sobre fuentes | 2,461 | 2,798 | 2,610 | 2,627 |

Conjunto de evaluacion Pooh (411 items, eleccion multiple por verosimilitud, azar 25%; exactitud en % y cambio frente a v1 con intervalo de confianza del 95% por bootstrap emparejado):

| Grupo | n | v1 | r1 | r1-20pass | r2 | r3 |
|---|---|---|---|---|---|---|
| canon-seen | 122 | 27,0 | 55,7 (+28,7 [+19, +39]) | 56,6 (+29,5 [+20, +39]) | 55,7 (+28,7 [+19, +39]) | 59,8 (+32,8 [+24, +43]) |
| canon-held-out | 37 | 27,0 | 48,6 (+21,6 [+3, +41]) | 27,0 (+0,0 [-14, +14]) | 48,6 (+21,6 [+8, +38]) | 37,8 (+10,8 [-5, +27]) |
| characters | 29 | 41,4 | 41,4 (+0,0 [-21, +21]) | 58,6 (+17,2 [+0, +38]) | 55,2 (+13,8 [+0, +31]) | 44,8 (+3,4 [-17, +24]) |
| feelings | 47 | 34,0 | 40,4 (+6,4 [-6, +19]) | 44,7 (+10,6 [-4, +26]) | 38,3 (+4,3 [-11, +19]) | 38,3 (+4,3 [-13, +19]) |
| creation | 33 | 18,2 | 36,4 (+18,2 [-3, +39]) | 48,5 (+30,3 [+9, +52]) | 36,4 (+18,2 [-3, +36]) | 27,3 (+9,1 [-9, +27]) |
| world | 57 | 49,1 | 47,4 (-1,8 [-11, +7]) | No disponible | No disponible | No disponible |

Nota: la informacion de origen corta la tabla de evaluacion Pooh en la fila `world`; los valores restantes de esa fila no estan disponibles. Todos los numeros proceden de los ficheros de resultados del autor, generados con `tools/midtrain_report.py`. No se han publicado resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada aritmeticamente del numero de parametros (46,15M): unos 184 MB en FP32, unos 92 MB en FP16/BF16, unos 46 MB en INT8 y unos 23 MB en INT4, mas el cache KV a 4.096 tokens de contexto.
- Tamano del repositorio: 0,1 GB, lo que confirma que los pesos caben holgadamente en cualquier dispositivo.
- GPU recomendadas: cualquier GPU consumer sirve; el modelo cabe en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin ninguna optimizacion. No se requiere memoria de GPU dedicada: la inferencia en CPU es viable con tiempos de respuesta aceptables para un modelo de este tamano.
- Cabe en GPU consumer: si, en todas las generaciones recientes e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: la model card solo documenta `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`; el repositorio esta etiquetado para text-generation-inference y endpoints compatibles. El soporte en vLLM, llama.cpp u Ollama no esta confirmado en la informacion disponible y no se publican pesos GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.
- Detalle de ejecucion a tener en cuenta: las secuencias deben comenzar con el token `</s>`, tal como en el entrenamiento, si se quiere reproducir el comportamiento esperado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | BLiMP | EWoK | COMPS | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Baby Pooh 46M midtrain r3 | 46,15M | 4.096 | Apache 2.0 | en | 76,49 | 53,91 | 58,30 | Publicado en HuggingFace |
| Baby Pooh 46M midtrain r2 | 46,15M (misma base) | 4.096 | Apache 2.0 | en | 76,22 | 55,36 | 58,55 | Publicado en HuggingFace |
| Baby Pooh 46M v1 | 46,15M | 4.096 | no disponible en la informacion | en | 77,53 | 54,91 | 58,60 | Publicado en HuggingFace |
| GPT-2 100M (baseline BabyLM) | ~100M | 1.024 (configuracion habitual, no confirmada aqui) | no disponible en la informacion | en | 74,88 | 51,64 | 56,17 | Baseline de referencia BabyLM |
| GPT-BERT causal (baseline BabyLM) | no disponible | no disponible | no disponible | en | 79,29 | 51,18 | 58,25 | Baseline de referencia BabyLM |

En sintesis: frente a los baselines de BabyLM, r3 supera a GPT-2 100M en BLiMP, EWoK, Entity tracking, COMPS, Eye tracking y Self-paced reading, pero queda por debajo de GPT-BERT causal en BLiMP (76,49 frente a 79,29). Frente a v1, r3 mejora de forma clara el conocimiento del canon de Pooh (27,0% a 59,8% en canon-seen, con intervalo de confianza que no incluye el cero) a costa de un ligero descenso en tareas linguisticas generales.

## Limitaciones y advertencias

- Modelo experimental y en desarrollo: el propio autor lo etiqueta como experimental y work-in-progress; no debe usarse como componente critico en produccion.
- No esta instruido ni alineado: no sigue instrucciones, no es un modelo de chat y carece de entrenamiento de seguridad o de rechazo de peticiones daninas.
- Riesgo de alucinacion alto: con 46M de parametros y un corpus de escala infantil, la generacion libre produce texto poco fiable y con coherencia limitada mas alla de unos pocos cientos de tokens.
- Mid-training con perdida de generalidad: la media de perdida de validacion empeora respecto a v1 (2,627 frente a 2,461) y la perdida en Milne retenido sube de 2,560 a 3,403, lo que indica un intercambio claro entre dominio y generalidad.
- Ambiguedad en la evaluacion de dominio: en `world` el rendimiento baja ligeramente frente a v1; en `canon-held-out` la mejora de r3 (+10,8) tiene un intervalo que incluye el cero, por lo que no es concluyente. En `characters` y `creation`, r3 rinde peor que r2 y que r1-20pass.
- Contexto limitado: 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles: no hay evidencia de capacidades en castellano ni en otros idiomas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o sesgo demografico. El corpus BabyLM incluye fuentes como subtitulos y switchboard que pueden arrastrar sesgos de esos dominios.
- Propiedad intelectual: el modelo se entrena sobre material de Winnie the Pooh de A. A. Milne, dominio publico en Estados Unidos pero con copyright vigente en el Reino Unido hasta 2047; conviene revisar la jurisdiccion antes de cualquier uso comercial del contenido generado.
- Licencia: Apache 2.0 sobre los pesos, lo que permite uso comercial del modelo, pero esa licencia no cubre los derechos sobre el material de entrenamiento ni sobre las ilustraciones enlazadas en la model card.
- Sin cuantizaciones publicadas ni soporte documentado fuera de `transformers`: desplegar en vLLM, llama.cpp u Ollama requeriria conversion y validacion propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prabakaranchandran/baby-pooh-46m-midtrain-r3
- Modelo base v1: https://huggingface.co/prabakaranchandran/baby-pooh-46m
- Ronda anterior r2: https://huggingface.co/prabakaranchandran/baby-pooh-46m-midtrain-r2
- Dataset de mid-training: https://huggingface.co/datasets/prabakaranchandran/pooh-world-midtrain
- Dataset de mezcla BabyLM: https://huggingface.co/datasets/prabakaranchandran/pooh-babylm-mix-220m
- Ilustracion de E. H. Shepard (1926) via Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Winnie-the-Pooh_143.png
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
