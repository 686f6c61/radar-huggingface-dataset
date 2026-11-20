# isilicon/mango-qwen38-flashnext-iq4xs

## Resumen

Mango Qwen3.8 Flash Next IQ4_XS es un espejo de preservación publicado por isilicon (colección Mango) sobre el paquete GGUF que mradermacher generó a partir de Qwen3.8 Flash Next, un modelo de texto de la familia Qwen con modificaciones de rechazo introducidas por OrcaRouter. El repositorio no entrena ni modifica los pesos: conserva los bytes del cuantizado original IQ4_XS y añade una evaluación propia y trazable de esa configuración exacta. Con 176.943.899.520 parámetros y un payload de 98,42 GB (91,66 GiB) en un único fichero, está pensado para despliegue local en hardware de gama alta más que para servir en producción a gran escala.

Su relevancia actual es doble. Por un lado, ofrece una instantánea reproducible de un modelo de razonamiento y código de gran tamaño en cuantización de 4 bits, con revisión de origen fijada (`3aa3ff434a0dc2b9dd6886fe12da134756229f74`) y licencia Apache 2.0. Por otro, publica un protocolo de evaluación con subconjuntos pequeños y graders locales (EQ-Bench v2, CTI, CyberMetric, BFCL-style, HumanEval+, IFEval, MMLU-Pro, MATH-500) que permite comparar configuraciones sobre la misma carga de trabajo, aunque con intervalos de confianza amplios.

La ficha debe leerse con cautela: los datos de arquitectura y entrenamiento del modelo subyacente no están disponibles en la información proporcionada, y las puntuaciones publicadas corresponden a subconjuntos reducidos, no a los pipelines oficiales completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 176.943.899.520 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ4_XS (GGUF); el repositorio publica una única configuración medida |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero único, 98,42 GB / 91,66 GiB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna (tipo de transformer, atención, posibles componentes MoE o híbridos), el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) del modelo base Qwen3.8 Flash Next. La model card del espejo no documenta estos extremos y se limita a describir el proceso de preservación y evaluación.

Lo que sí está documentado es la cadena de procedencia: OrcaRouter aplicó modificaciones de rechazo sobre Qwen3.8 Flash Next, mradermacher empaquetó el resultado en GGUF con cuantización IQ4_XS, y isilicon conserva esos bytes sin alteración bajo la etiqueta `preservation-mirror`. La innovación técnica destacable del repositorio no está en el modelo sino en el método de evaluación: una carga de trabajo emparejada de 202 preguntas más 12 casos de agente mecánico, con tiempos, latencias p50/p95, TTFT y tokens de salida registrados, y con intervalos de confianza (bootstrap y Wilson) para cada tarea. Se incluye además un estudio separado sobre el esfuerzo de razonamiento de Qwen (medium 82,87 frente a xhigh 84,41 sobre 404 preguntas, diferencia pareada de +1,54 puntos con intervalo del 95 % de [-1,71, +4,82]).

## Capacidades

- Generación de texto conversacional en inglés y chino, con soporte declarado para `text-generation`.
- Razonamiento y conocimiento general: MMLU-Pro (subconjunto de 14 preguntas) con 92,86 % y MATH-500 niveles 4-5 con 100 % sobre 5 preguntas.
- Generación de código: 95 % en 20 tests locales estilo HumanEval+.
- Function calling: 77,50 % en 40 comprobaciones locales estilo BFCL.
- Seguimiento de instrucciones estrictas: 85 % de prompts superados en IFEval (20 casos).
- Comportamiento agéntico multi-paso: 12/12 casos con comprobaciones mecánicas de finalización, evidencia y permisos superadas.
- Conocimiento de ciberseguridad: CyberMetric 100 % (20 preguntas), CTI multiple choice 70 % y análisis de causa raíz/CWE 80 %.
- Comprensión social y emocional: EQ-Bench v2 con media de 82,16 y OpenToM con 66,67 % de etiquetas correctas.
- Modificación de rechazo aplicada por OrcaRouter sobre el modelo base, orientada a reducir negativas del modelo original (sin detalle técnico publicado).
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Evaluación comparativa de cuantizaciones: el repositorio está diseñado como configuración de referencia medible; un equipo puede reproducir la carga de 202 preguntas y 12 casos de agente para contrastar su propio hardware o sus propios cuantizados frente a esta línea base.
- Asistente de código en local: con 95 % en tests locales de HumanEval+ y soporte de function calling, encaja en entornos de desarrollo con GPU de 80 GB o más donde se quiera autocompletado, refactorización y generación de tests sin salida a la nube.
- Automatización agéntica con permisos: los 12/12 casos mecánicos (finalización, evidencia, permisos, totales de precios) lo hacen apto para prototipos de agentes que deben justificar acciones y respetar límites declarados.
- Análisis de ciberseguridad asistido: los resultados en CyberMetric y CTI sugieren uso en triaje de alertas, clasificación de CWE y resumen de informes de amenazas, siempre con revisión humana dada la muestra pequeña.
- Atención al cliente en inglés y chino: su perfil EQ (82,16 en EQ-Bench v2) y su capacidad conversacional permiten pilotos de soporte multi-turno en ambos idiomas, con la limitación de que no se documenta la ventana de contexto.
- Investigación sobre modificación de rechazo: útil para estudiar cómo cambia el comportamiento de un modelo al aplicarle ajustes de rechazo, comparando esta variante con el Qwen3.8 Flash Next original bajo el mismo conjunto de pruebas.
- Despliegue en estación de trabajo con 96 GB de VRAM o más: el payload de 91,66 GiB en un solo fichero simplifica la distribución y permite servir el modelo con llama.cpp u Ollama en máquinas de gama alta.

## Benchmarks y rendimiento

Resultados publicados por el autor del espejo sobre subconjuntos locales (no son los pipelines oficiales completos):

| Tarea / grader local | n | Resultado | Intervalo 95 % | Método |
|---|---|---|---|---|
| EQ-Bench v2 | 30 | 82,16 | 74,79–88,30 | Bootstrap |
| OpenToM labels | 18 | 66,67 % | 43,75–83,72 | Wilson |
| CTI multiple choice | 20 | 70,00 % | 48,10–85,45 | Wilson |
| CTI root-cause / CWE | 15 | 80,00 % | 54,81–92,95 | Wilson |
| CyberMetric | 20 | 100,00 % | 83,89–100,00 | Wilson |
| BFCL-style local calls | 40 | 77,50 % | 62,50–87,68 | Wilson |
| HumanEval+ local tests | 20 | 95,00 % | 76,39–99,11 | Wilson |
| IFEval strict prompt pass | 20 | 85,00 % | 63,96–94,76 | Wilson |
| MMLU-Pro subset | 14 | 92,86 % | 68,53–98,73 | Wilson |
| MATH-500 niveles 4-5 | 5 | 100,00 % | 56,55–100,00 | Wilson |
| Agent-loop heuristic | 12 | 100,00 % | 75,75–100,00 | Wilson |

Puntuación global ponderada: 84,19/100 (social 30 %, ciberseguridad 20 %, agéntico 30 %, código 10 %, instrucciones 5 %, conocimiento/matemáticas 5 %). En una comparación posterior en RTX 3090 (3 de noviembre de 2026) se registró 84,66610/100 sobre 202+12 casos y una puntuación separada de juez único de 7,86364/10.

Rendimiento medido en la configuración evaluada:

| Medición | Valor |
|---|---|
| Carga completa emparejada | 35,33 min |
| Tiempo de la suite de peticiones | 32,19 min |
| Tiempo de los 12 casos de agente | 3,14 min |
| Tareas por minuto | 6,06 |
| Latencia p50 / p95 | 7,02 / 15,76 s |
| TTFT p50 / p95 | 0,64 / 1,47 s |
| Tokens de salida por segundo de petición (mediana) | 86,52 |
| Tokens de finalización reportados | 169.681 (202/202 peticiones) |
| Finalizaciones por longitud | 0 |

## Requisitos de hardware

- VRAM estimada: el payload ocupa 91,66 GiB en disco; en inferencia hay que sumar KV cache y memoria de trabajo, por lo que se necesita al menos una GPU de 96 GB (A100 80 GB no basta en una sola unidad; H100 80 GB tampoco) o reparto multi-GPU.
- GPU recomendadas: H100 80 GB en configuración multi-GPU, A100 80 GB multi-GPU, o GPUs con 96 GB o más por unidad. En RTX 3090 (24 GB) solo es viable con reparto entre varias unidades y offload parcial a CPU, con la penalización de latencia correspondiente; el autor reporta una comparación en RTX 3090, pero no detalla la configuración de reparto.
- Consumer GPU: no cabe en una sola RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Requiere al menos cuatro RTX 4090/3090 para acercarse al tamaño del fichero, antes de contar KV cache.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; vLLM y TGI no están confirmados para este formato en la información disponible. La model card declara `inference: false` para el repositorio de Hugging Face, es decir, no se sirve desde la infraestructura de HF.
- Latencia y throughput: sobre el hardware de la evaluación, TTFT p50 de 0,64 s y p95 de 1,47 s; latencia por petición p50 de 7,02 s y p95 de 15,76 s; mediana de 86,52 tokens de salida por segundo de petición. La carga completa de 202 preguntas más 12 casos tardó 35,33 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización evaluada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mango Qwen3.8 Flash Next IQ4_XS (este) | 176,9 B | no disponible | IQ4_XS | Apache 2.0 | GGUF en HF |
| Qwen27 MLX4 (referencia del mismo cohorte Mango) | no disponible | no disponible | MLX 4 bits | no disponible | MLX |
| Qwen3.8 Flash Next original (sin modificación de rechazo) | no disponible | no disponible | no disponible | no disponible | no disponible |
| mradermacher/Qwen3.8 Flash-Next-Uncensored-GGUF (base directa) | no disponible | no disponible | varias GGUF | Apache 2.0 (según este repo) | GGUF en HF |

En el cohorte de diez configuraciones del autor, esta configuración obtuvo la puntuación global más alta (84,19/100) y tardó 35,33 minutos frente a 23,98 minutos de Qwen27 MLX4; el propio autor advierte que la ventaja de calidad sobre Qwen es incierta con esta muestra y que los intervalos pareados son más informativos que el ranking. No hay datos públicos de arquitectura ni de contexto para el resto de configuraciones.

## Limitaciones y advertencias

- Las puntuaciones provienen de subconjuntos pequeños (entre 5 y 40 preguntas por tarea) y de graders locales; los intervalos de confianza son amplios y no equivalen a los benchmarks oficiales completos.
- Los resultados de hardware y cohortes distintos no deben agruparse: el autor separa explícitamente la medición en Blackwell (84,19/100) de la de RTX 3090 (84,66610/100).
- No se documentan sesgos conocidos, pero al ser un modelo con modificación de rechazo, el comportamiento ante contenido sensible puede diferir del Qwen3.8 Flash Next original y no está caracterizado en la información disponible.
- Riesgo de alucinación no cuantificado: no hay evaluación de factualidad ni de calibración más allá de MMLU-Pro y MATH-500 sobre muestras mínimas.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- La licencia Apache 2.0 se declara en este repositorio, pero la cadena de procedencia incluye modificaciones de OrcaRouter y cuantización de mradermacher; conviene verificar las condiciones en cada eslabón antes de uso comercial.
- El repositorio se marca como `inference: false`: no se puede invocar directamente desde la infraestructura de Hugging Face y requiere descarga y despliegue propio.
- El tamaño de 91,66 GiB en un único fichero implica requisitos de almacenamiento y de memoria considerables, y el autor advierte que el tamaño en disco no equivale a la VRAM necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isilicon/mango-qwen38-flashnext-iq4xs
- Modelo base (GGUF de mradermacher): https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
- Colección Mango de modelos probados y espejos de preservación: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluación Mango (dataset): https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen medium vs xhigh: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Infinity en Discord: https://discord.gg/5n5YDbQCMy
