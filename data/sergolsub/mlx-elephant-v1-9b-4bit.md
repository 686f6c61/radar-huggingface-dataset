# sergolsub/mlx-elephant-v1-9B-4bit

## Resumen

sergolsub/mlx-elephant-v1-9B-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo baselabs/elephant-1, un modelo de 9.000 millones de parámetros orientado a la toma de decisiones estructuradas. Lo publica el usuario sergolsub como artefacto derivado para ejecución en Apple Silicon mediante la librería `mlx_lm`, sin reentrenamiento ni cambios de arquitectura: se obtiene por desmantelamiento de una conversión previa a 8 bits y recuantización afín a 4 bits con el mismo tamaño de grupo.

El modelo no es un generador de texto conversacional al uso, sino un motor de decisión: expone una API `decide()` que resuelve tareas tipadas (`noul`, `choice`, `score`) con instrucciones y criterios definidos por el desarrollador. Esa orientación lo hace relevante para pipelines de clasificación y enrutamiento en producción, donde interesa una latencia controlada y una salida estructurada frente a texto libre.

La ficha se centra en el artefacto MLX 4 bits, del que el autor publica métricas medidas en un Mac mini M4 Pro con 48 GB de memoria unificada: 7,43 GB en disco, 8,24 GB de memoria residente máxima y una latencia mediana de decisión de 1654 ms. La licencia MIT se hereda de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (derivada de baselabs/elephant-1); incluye cabezas de decisión/joint según los ficheros `*_mlx.py`, `decision_config.json` y `joint_config.json` |
| Parametros totales | 9B (según el nombre del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín MLX (recuantizado desde una conversión previa a 8 bits, mismo tamaño de grupo) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de los pesos originales; prevalece la LICENSE del repositorio upstream en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `*_mlx.py`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un entrenamiento: el autor indica explícitamente que no hay reentrenamiento ni cambios de arquitectura. El proceso parte de una conversión propia a 8 bits en MLX, se desmantela y se recuantiza a 4 bits afín con el mismo tamaño de grupo, y se evalúa contra el modelo original. El modelo subyacente, baselabs/elephant-1, es un transformer de 9B parámetros del que esta ficha no dispone de detalles sobre composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO.

La innovación destacable no está en el preentrenamiento sino en la interfaz: el modelo incorpora un modo de decisión con cabezas específicas que resuelven preguntas tipadas (`noul`, `choice`, `score`) a partir de un texto de entrada, unas instrucciones y, en su caso, criterios de clasificación. El repositorio incluye el pegamento de inferencia necesario (`onejev_mlx.OneJev`) para ejecutar ese modo.

## Capacidades

- Toma de decisiones binarias tipo `noul` (sí/no) sobre un texto de entrada, con instrucciones en lenguaje natural.
- Clasificación por elección (`choice`) entre un conjunto de criterios etiquetados, útil para enrutamiento a equipos o categorías.
- Puntuación ordinal (`score`) sobre una lista de niveles de severidad definidos por el desarrollador.
- Salida estructurada por tarea: cada pregunta es un objeto independiente con su propio tipo, instrucciones y criterios.
- Ejecución nativa en Apple Silicon mediante MLX (`mlx_lm`), con un cargador propio incluido en el repositorio.
- Integración con el servidor `/v1/systemone` del autor mediante el mismo runtime `qev`.
- Generación de texto libre: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un mapa de equipos con sus descripciones, y devuelve el equipo asignado mediante una decisión `choice`. Encaja porque la salida es una etiqueta cerrada y la latencia medida (1654 ms de mediana) es compatible con colas de triaje.
- Detección de intención de reembolso: con una decisión `noul` y la instrucción "¿el cliente quiere un reembolso?", se clasifica el mensaje antes de pasarlo al flujo de facturación, evitando derivaciones innecesarias.
- Priorización de incidencias: con una decisión `score` sobre criterios como `cosmetic`, `annoying` o `blocks`, se asigna severidad a errores de plataforma (por ejemplo, fallos de exportación por cuota de disco) para ordenar la cola de trabajo.
- Triaje de correos o formularios entrantes: cada mensaje se evalúa con varias preguntas independientes en paralelo (tipo, equipo, severidad) y se compone un registro estructurado listo para base de datos.
- Moderación y clasificación de contenido en local: al ejecutarse en un Mac con MLX y 8,24 GB de memoria residente máxima, permite desplegar el clasificador en estaciones de trabajo sin GPU dedicada ni envío de datos a la nube.
- Prototipado rápido de reglas de negocio: los criterios y las instrucciones se definen en el momento de la llamada, de modo que un equipo puede iterar sobre la política de decisión sin reentrenar ni redeployar el modelo.
- Automatización de back office en macOS: integrado en scripts o servicios locales, resuelve decisiones repetitivas (asignación, severidad, sí/no) con un throughput sostenido de 0,89 decisiones cortas por segundo.

## Benchmarks y rendimiento

El autor publica métricas de calidad comparando la cuantización 4 bits con el modelo en bf16, además de medidas de ejecución en un Mac mini M4 Pro de 48 GB.

| Metrica | 4 bits (MLX) | bf16 (referencia) |
|---|---|---|
| Accuracy | 86,7 % | 92,2 % |
| Noul | 92,5 % | 95,0 % |
| Choice | 84,0 % | 92,0 % |
| Score | 80,0 % | 88,0 % |
| Perplejidad de calibración | 1,897 | 1,771 |

| Medida de ejecución (Mac mini M4 Pro 48 GB) | Valor |
|---|---|
| Tamano en disco | 7,43 GB |
| Tiempo de carga | 4,98 s |
| Memoria residente maxima | 8,24 GB |
| Latencia mediana de decisión | 1654 ms |
| Throughput sostenido | 0,89 decisiones cortas/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 8,24 GB de memoria residente máxima medida; 7,43 GB de pesos en disco.
- Hardware de referencia: Mac mini M4 Pro con 48 GB de memoria unificada; el consumo medido deja margen para ejecutarlo en equipos Apple Silicon con 16 GB o más.
- GPU NVIDIA: no disponible; el artefacto está empaquetado para MLX, no para CUDA.
- Cabe en GPU de consumo: no aplica en el formato publicado; para GPUs NVIDIA habría que recurrir a los pesos originales de baselabs/elephant-1 y a otra ruta de cuantización.
- Opciones de despliegue: `mlx_lm` y el cargador incluido `onejev_mlx.OneJev`; el autor menciona el servidor `/v1/systemone` con el mismo runtime `qev`. vLLM, llama.cpp, Ollama y TGI no están soportados por este artefacto.
- Latencia y throughput: mediana de 1654 ms por decisión y 0,89 decisiones cortas por segundo en el hardware de referencia; tiempo de carga de 4,98 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| sergolsub/mlx-elephant-v1-9B-4bit | 9B | no disponible | MLX 4 bits | MIT | Decisiones estructuradas en Apple Silicon |
| baselabs/elephant-1 (original) | 9B | no disponible | safetensors (bf16) | MIT | Decisiones estructuradas, referencia de calidad |
| Conversión MLX 8 bits del mismo autor | 9B | no disponible | MLX 8 bits | MIT | Misma tarea con mayor precisión y más memoria |

No se dispone de datos de benchmarks ni de especificaciones de contexto de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible una comparación cuantitativa con terceros.

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la calidad de forma medible: entre 3 y 8 puntos porcentuales en las métricas del autor (score cae de 88,0 % a 80,0 %), y la perplejidad de calibración sube de 1,771 a 1,897.
- El artefacto está atado a MLX y Apple Silicon; no es portable a CUDA sin reconvertir desde los pesos originales.
- La model card mezcla referencias: los ficheros listados incluyen `*.safetensors` descritos como "8-bit weights (MLX layout)" pese a que el repositorio se anuncia como 4 bits; conviene verificar la cuantización real de los tensores antes de desplegar.
- El repositorio registra 0 descargas y 0 likes, y no hay pipeline declarado ni idiomas especificados: la validación externa es inexistente.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento fuera de las tareas de decisión tipadas.
- La licencia MIT se hereda del repositorio upstream y este prevalece en caso de conflicto; conviene revisar la LICENSE de baselabs/elephant-1 antes de uso comercial.
- El uso previsto es la decisión estructurada; emplearlo como generador de texto libre o en agentes multi-paso no está documentado ni validado.
- La fecha de creación y actualización del repositorio (2026-11-22) y la ausencia de métricas de terceros aconsejan tratarlo como artefacto experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-elephant-v1-9B-4bit
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Librería MLX: no disponible enlace oficial en la información proporcionada
- Paper, blog o demo del autor: no disponible
