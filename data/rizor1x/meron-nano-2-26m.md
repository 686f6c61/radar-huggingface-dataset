# Rizor1x/Meron-Nano-2.26M

## Resumen

Meron-Nano-2.26M es un modelo de lenguaje base de tamano ultracompacto desarrollado por Rizor1x, publicado bajo licencia Apache 2.0. Con 2.263.298 parametros totales y 910.178 parametros activos por token, emplea una arquitectura de mezcla de expertos (MoE) con enrutamiento dinamico y bucles de deliberacion con comparticion recurrente de parametros. El modelo esta disenado especificamente para tareas de razonamiento matematico, cientifico y de sentido comun fisico en entornos de computacion en el borde (edge AI).

Su relevancia radica en la eficiencia parametral: segun la model card, alcanza un Intelligence Index de 13,83 en la suite de evaluacion Open SLM Leaderboard para modelos por debajo de 10M de parametros, superando a modelos densos de hasta 10M con una reduccion de 11 veces en parametros activos. El modelo se entrena sobre 1.355 millones de tokens en un curriculum de tres etapas que separa el anclaje sintactico general del razonamiento algoritmico y la calibracion de preferencias.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face. Muchos datos tecnicos (longitud de contexto, tipos de cuantizacion, formato de pesos mas alla de safetensors) no estan disponibles en la model card y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dinamica con topologia de enrutamiento desacoplada y bucles de deliberacion con comparticion recurrente de parametros |
| Parametros totales | 2.263.298 (2,26M) |
| Parametros activos | 910.178 (0,91M) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) de enrutamiento dinamico. La model card describe una "topologia de enrutamiento desacoplada" y "bucles de deliberacion con comparticion recurrente de parametros", lo que sugiere que una parte de los pesos se reutiliza en pasos recurrentes de computo para aumentar la profundidad efectiva sin incrementar el recuento de parametros. La relacion entre parametros totales y activos es de aproximadamente 2,49:1, de modo que solo el 40,2% de los pesos interviene en cada token.

El entrenamiento se organiza en tres etapas sobre un total de 1.355 millones de tokens. La etapa 1 (preentrenamiento, 1.000M de tokens, 73,80% del computo) combina Nemotron-ClimbMix y Cosmopedia v2 (500M), FactBase-DCLM (300M) y Python canonico y primitivas logicas (200M). La etapa 2 (especializacion, 320M de tokens, 23,62%) usa libros de texto cientificos (200M) y razonamiento matematico con cadenas de pensamiento paso a paso sobre 45 arquetipos aritmeticos (120M). La etapa 3 (postentrenamiento, 35M de tokens, 2,58%) aplica un curriculum de QA procedimental fisica (PIQA) y alineacion de decisiones contrastiva con optimizacion de preferencias contrastiva (CPO). La optimizacion combina Muon (matrices 2D, LR 0,010) y AdamW (embeddings, normas y router, LR 1,0e-3).

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base (no instruct).
- Razonamiento aritmetico de varios pasos mediante cadenas de pensamiento entrenadas de forma explicita.
- Razonamiento cientifico y de sentido comun fisico (mecanismos causales, relaciones cualitativas).
- Recuperacion de conocimiento factual basico y sintaxis de Python canonico y primitivas logicas.
- Enrutamiento dinamico de expertos por token (capacidad arquitectonica, no una habilidad de usuario).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible mas alla del CoT aritmetico entrenado.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles.

## Casos de uso

- Evaluacion de investigacion en eficiencia parametral: sirve como referencia para estudiar arquitecturas MoE de enrutamiento dinamico en el regimen sub-3M, comparando el rendimiento por parametro activo frente a modelos densos.
- Razonamiento aritmetico en dispositivos de borde: con 0,91M de parametros activos, puede ejecutarse en microcontroladores o SoCs de bajo consumo para resolver operaciones con acarreo y cadenas de pasos en aplicaciones educativas o de calculo asistido.
- Clasificacion y respuesta de opcion multiple en dominios STEM: su entrenamiento con perdida de margen de eleccion directa lo hace adecuado para tareas de seleccion entre candidatos (tipo PIQA o ARC) en sistemas de evaluacion automatica.
- Filtrado y puntuacion de razonamiento cientifico: puede usarse como modelo auxiliar para puntuar plausibilidad causal en respuestas de fisica o quimica dentro de pipelines de generacion aumentada.
- Prototipado rapido de asistentes educativos de matematicas basicas: su curriculum de 45 arquetipos aritmeticos permite generar explicaciones paso a paso en tutoria automatizada de primaria y secundaria.
- Investigacion sobre calibracion de logits y alineacion contrastiva: el modelo incorpora CPO y ajuste de logits, por lo que sirve como banco de pruebas para estudiar tecnicas de alineacion en modelos minusculos.
- Generacion de codigo Python basico: el entrenamiento con Python canonico y primitivas logicas permite autocompletar fragmentos simples de sintaxis y flujo de control en entornos con recursos extremadamente limitados.

## Benchmarks y rendimiento

Resultados zero-shot con `acc_norm` segun el protocolo del Open SLM Leaderboard, con descontaminacion estricta por coincidencia exacta de 13-gramas:

| Benchmark | Meron Nano MoE | Ethoric-10M | min-spark-1.7 | TinyBrainBot-3M-v2 | GPT-S3-3M | Tokle-3M |
|---|---|---|---|---|---|---|
| Parametros activos | 0,91M | 9,97M | 9,98M | 2,94M | 2,97M | 2,91M |
| Parametros totales | 2,26M | 9,97M | 9,98M | 2,94M | 2,97M | 2,91M |
| ArithMark-3.0 | 60,10% | 41,60% | 36,60% | 45,10% | 39,10% | 40,80% |
| PIQA | 57,34% | 59,85% | 60,39% | 56,75% | 57,02% | 55,01% |
| ARC-Challenge | 26,71% | 24,66% | 24,15% | 22,53% | 23,12% | 23,98% |
| ARC-Easy | 30,18% | 37,58% | 39,90% | 33,38% | 33,54% | 34,00% |
| HellaSwag | 25,59 | 28,75% | 29,65% | 27,29% | 27,68% | 27,20% |
| Open SLM Intelligence Index | 13,83 | 12,94 | 12,71 | 10,39 | 9,39 | 8,76 |

La model card destaca una asimetria entre ARC-Challenge (26,71%) y ARC-Easy (30,18%): atribuye el menor rendimiento en ARC-Easy a la falta de capacidad de almacenamiento para trivia declarativa en modelos sub-3M, y el mejor rendimiento relativo en ARC-Challenge a su curriculum de mecanismos causales. El valor de HellaSwag se publica sin simbolo de porcentaje en la tabla original.

## Requisitos de hardware

- VRAM estimada: con 2,26M de parametros, el modelo ocupa del orden de 9 MB en fp32 y unos 4,5 MB en fp16, sin contar el codigo personalizado ni el runtime.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo esta pensado para CPU y aceleradores de borde (Coral, Jetson Nano, microcontroladores con soporte de inferencia).
- Cabe en cualquier GPU consumer y en la mayoria de dispositivos con unos pocos megabytes de memoria libre.
- Opciones de despliegue: al requerir `custom_code`, la via principal es `transformers` con `trust_remote_code=True`; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Arquitectura | ArithMark-3.0 | Intelligence Index | Licencia |
|---|---|---|---|---|---|---|
| Meron-Nano-2.26M | 2,26M | 0,91M | MoE dinamica | 60,10% | 13,83 | Apache 2.0 |
| Ethoric-10M | 9,97M | 9,97M | Densa + Canon Conv | 41,60% | 12,94 | no disponible |
| min-spark-1.7 | 9,98M | 9,98M | Recurrente con bucles | 36,60% | 12,71 | no disponible |
| TinyBrainBot-3M-v2 | 2,94M | 2,94M | Transformer densa | 45,10% | 10,39 | no disponible |

La ventaja principal de Meron-Nano frente a los modelos densos de su division es la relacion entre rendimiento y parametros activos: supera en ArithMark-3.0 a modelos con hasta 11 veces mas computo por token. En PIQA y HellaSwag, sin embargo, queda por debajo de Ethoric-10M y min-spark-1.7.

## Limitaciones y advertencias

- Es un modelo base, no ajustado para instrucciones: no debe esperarse comportamiento de chat ni seguimiento de instrucciones conversacionales.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo elevado de alucinacion en conocimiento factual: los propios resultados en ARC-Easy (30,18%, apenas 5 puntos sobre el azar del 25%) indican poca capacidad de recuperacion de trivia.
- Rendimiento bajo en tareas de sentido comun general (HellaSwag 25,59), lo que limita su uso fuera de dominios STEM.
- Longitud de contexto no documentada: no se puede garantizar el manejo de entradas largas en produccion.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de documentacion sobre sesgos hace recomendable una evaluacion propia antes de integrarlo en productos.
- El modelo es extremadamente pequeno: no es adecuado para generacion de texto abierta de calidad, resumen, traduccion ni tareas generativas complejas.

## Enlaces

- Hugging Face: https://huggingface.co/Rizor1x/Meron-Nano-2.26M
- Open SLM Leaderboard: no disponible como enlace en la informacion proporcionada
- Paper o blog tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
