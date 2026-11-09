# Philiaxis/Himel3-1.7B-graft

## Resumen

Himel3-1.7B-graft es un ajuste fino (finetune) experimental del modelo LFM3-1.7B de Liquid AI, desarrollado por Philiaxis. Se distribuye en formato MLX bfloat16 para Apple Silicon y cuenta con 1.728.801.536 parámetros totales (aproximadamente 3,46 GB de pesos). El checkpoint incorpora dos modificaciones sobre el modelo base: un ajuste de identidad mediante LoRA para que el modelo responda con su propio nombre y desarrollador, y una técnica denominada "BOS graft", consistente en una actualización rank-1 en forma cerrada aplicada a las proyecciones K/V de las capas 2, 4, 6 y 8.

El problema que aborda es el comportamiento del modelo cuando se omite el turno de sistema: el graft busca mejorar la respuesta en ese escenario sin necesidad de un mensaje de sistema explícito. La evaluación publicada se limita a MGSM (aritmética) en japonés e inglés, con 250 preguntas por idioma, donde el modelo alcanza un 78,4 % en japonés y un 94,4 % en inglés.

Es relevante ahora como experimento abierto y reproducible sobre modelos pequeños orientados a razonamiento, aunque su alcance es acotado: un único benchmark, licencia derivada de LFM Open License v1.0 y soporte únicamente para japonés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LiquidAI/LFM3-1.7B; el modelo base emplea arquitectura LFM, sin detalle en la informacion proporcionada) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (MLX bfloat16); no se documentan otras cuantizaciones |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors con disposicion de tensores MLX |

## Arquitectura y entrenamiento

El modelo es un finetune del LFM3-1.7B de Liquid AI. No se detalla en la informacion proporcionada la arquitectura interna del base (tipo de transformer, atencion, composicion del dataset de preentrenamiento ni numero de tokens). Lo que si se documenta es el proceso de ajuste: se aplica un LoRA de identidad (para que el modelo se identifique como Himel3 de Philiaxis) y un "BOS graft", que consiste en una actualizacion rank-1 en forma cerrada sobre las proyecciones clave/valor de las capas 2, 4, 6 y 8, con el objetivo de modificar el comportamiento cuando no se proporciona turno de sistema.

No se indica si hubo RLHF, DPO ni otras fases de alineamiento adicionales. La innovacion tecnica destacable es precisamente el BOS graft como mecanismo de bajo coste para inyectar comportamiento condicionado al inicio de secuencia, evaluado de forma controlada con prueba exacta de McNemar.

## Capacidades

- Generacion de texto conversacional en japones e ingles.
- Razonamiento aritmetico (evaluado con MGSM).
- Modo de pensamiento activable mediante `--enable-thinking` en la CLI de MLX-VLM.
- Respuesta de identidad propia (nombre del modelo y desarrollador) gracias al LoRA de identidad.
- Ejecucion en Apple Silicon mediante MLX.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Evaluacion de investigacion sobre condicionamiento de inicio de secuencia: el checkpoint permite reproducir el experimento de BOS graft y comparar su efecto frente al uso de mensajes de sistema, con el codigo y los resultados publicados en el informe de Philiaxis.
- Razonamiento aritmetico en japones e ingles: adecuado para prototipos de resolucion de problemas matematicos de enunciado, dado su rendimiento medido en MGSM (78,4 % / 94,4 %).
- Desarrollo y pruebas en Apple Silicon: al distribuirse en MLX bfloat16, se puede ejecutar localmente en equipos Mac con `mlx-vlm`, lo que facilita iteracion sin GPU dedicada.
- Asistente conversacional ligero en japones: para aplicaciones de chat de baja latencia en hardware de consumo, con la advertencia de que el contexto y las capacidades generales no estan documentadas.
- Base para experimentos de identidad de modelo: el LoRA de identidad sirve como referencia para estudiar como se inyecta personalidad o marca en modelos pequenos.
- Comparacion de tecnicas de ajuste: util como punto de control en estudios que comparen LoRA, grafting y prompting de sistema sobre un mismo modelo base.

## Benchmarks y rendimiento

Evaluacion en MGSM (250 preguntas por idioma, temperature 0,6, top-p 0,95, maximo 8.192 tokens de salida; sin mensaje de sistema salvo donde se indica):

| Modelo y condicion | Japones | Ingles |
|---|---:|---:|
| Himel3-1.7B | 77,6 % | 92,8 % |
| Himel3-1.7B-graft | 78,4 % | 94,4 % |
| LFM3-1.7B | 75,6 % | 93,6 % |
| LFM3-1.7B + system | 84,0 % | 94,8 % |
| LFM3-1.7B + BOS graft | 80,0 % | 94,0 % |

La diferencia del graft en Himel3 para japones es de +0,8 puntos (prueba exacta de McNemar, p = 0,864), es decir, no significativa. En el modelo base, el graft aporto +4,4 puntos y el mensaje de sistema +8,4 puntos en japones. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16 de aproximadamente 3,46 GB; el repositorio ocupa 3,5 GB.
- VRAM/unified memory estimada: alrededor de 4 GB para los pesos, mas overhead de activaciones y cache KV (no cuantificado en la informacion disponible).
- Disenado para Apple Silicon (MLX); no se documenta despliegue en GPU NVIDIA.
- Cabe en equipos Mac con memoria unificada de 8 GB o superior, en funcion del contexto utilizado.
- Opciones de despliegue: `mlx-vlm` 0.7.11 con Transformers 5.22.2 (probado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MGSM ja / en | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Himel3-1.7B-graft | 1,73 B | no disponible | 78,4 % / 94,4 % | LFM Open License v1.0 | MLX (HF) |
| LFM3-1.7B (base) | ~1,7 B | no disponible | 75,6 % / 93,6 % | LFM Open License v1.0 | HF |
| LFM3-1.7B + system | ~1,7 B | no disponible | 84,0 % / 94,8 % | LFM Open License v1.0 | HF |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion limitada a MGSM (aritmetica); no mide contexto largo, uso de herramientas ni conocimiento general.
- El beneficio del graft en Himel3 no es estadisticamente significativo (p = 0,864).
- En preguntas en japones el razonamiento puede derivar al ingles, y en cadenas largas se puede alcanzar el limite de tokens de salida.
- Solo soporta japones e ingles; no hay evidencia de rendimiento en castellano.
- Licencia LFM Open License v1.0: las condiciones de uso comercial dependen de la clausula 5; es necesario revisar el archivo LICENSE y NOTICE.md.
- Al ser un checkpoint experimental con LoRA de identidad, puede presentar sesgos o comportamientos no documentados; riesgo de alucinacion no cuantificado.
- Distribucion exclusiva en MLX bfloat16, lo que limita su uso fuera del ecosistema Apple Silicon sin conversion adicional.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Philiaxis/Himel3-1.7B-graft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Informe experimental de Himel3: https://himel.philiaxis.com/himel3/
- Licencia (en el repositorio): LICENSE
- Notas de cambios y atribucion: NOTICE.md
