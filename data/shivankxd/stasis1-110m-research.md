# ShivankXD/Stasis1-110M-Research

## Resumen

Stasis1 110M Research es un proyecto de investigacion sobre modelos de lenguaje a pequena escala desarrollado por el usuario ShivankXD, centrado en explorar preentrenamiento, ajuste supervisado y evaluacion bajo un presupuesto de computo muy limitado. El candidato principal registra 109.529.856 parametros, una configuracion de 12 capas, tamano oculto 768, 12 cabezas de atencion, tamano intermedio 2.048, vocabulario de 32.000 tokens y una longitud de contexto de 2.048 tokens.

La relevancia de este repositorio no esta en su rendimiento, sino en su metodologia: es un repositorio exclusivamente documental que publica resultados negativos, criterios de aceptacion predeclarados, hashes SHA-256 de los checkpoints y una cronologia de entrenamiento completa. El autor declara explicitamente que el candidato no ha superado ninguna prueba de aceptacion global ni ha demostrado capacidad de seguir instrucciones, y que las cuatro tareas expuestas en la galeria historica de conversaciones obtuvieron 0 aciertos de 4.

No se distribuyen pesos, tokenizador ni paquete de inferencia, y la compatibilidad con cargadores de Hugging Face o servicios de inferencia alojados no esta establecida. Por tanto, se trata de material de referencia metodologica para investigacion a baja escala, no de un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (deducido de la configuracion registrada; el autor no declara la familia arquitectonica de forma explicita) |
| Parametros totales | 109.529.856 (aproximadamente 109,5 M) |
| Parametros activos | No aplica; no se declara arquitectura MoE |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; no se distribuyen pesos |
| Idiomas soportados | Ingles (en); corpus y evaluacion en ingles |
| Licencia | No disponible; el repositorio remite a `LICENSE_AND_ATTRIBUTION.md` y el propio autor indica que la autorizacion de redistribucion de pesos, tokenizador y datos crudos esta pendiente |
| Formato de pesos | No disponible; repositorio de solo documentacion, sin pesos descargables |
| Capas | 12 |
| Tamano oculto | 768 |
| Cabezas de atencion | 12 |
| Tamano intermedio | 2.048 |
| Tamano de vocabulario | 32.000 |
| Inicializacion | Pesos aleatorios (random initialization) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La configuracion registrada del checkpoint base corresponde a un transformer de 12 capas con tamano oculto 768, 12 cabezas de atencion (dimensión de cabeza 64), tamano intermedio 2.048, vocabulario de 32.000 tokens y contexto de 2.048 tokens. No se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa o arquitecturas hibridas SSM; el proyecto se presenta como un ejercicio de preentrenamiento y ajuste bajo restricciones de computo.

El preentrenamiento base se realizo desde inicializacion aleatoria con 7.630 actualizaciones del optimizador y 500.039.680 exposiciones a tokens, sobre un corpus fijo de 211.030.755 posiciones de token. Las exposiciones incluyen pasadas repetidas sobre el corpus, por lo que no equivalen a contenido unico. Las fuentes registradas son una muestra acotada de FineWeb-Edu y un corpus estrecho de repositorios Python. La etapa de ajuste fino mas reciente realizo 244 actualizaciones del optimizador, dos pasadas sobre 485 registros de entrenamiento, 970 presentaciones de ejemplo y 165.776 objetivos supervisados de asistente, con una tasa de aprendizaje maxima de 0,000003, supervision exclusiva sobre turnos de asistente y sin perdida de replay. Las fuentes de ajuste incluyen dialogo de OpenAssistant, material sintetico generado por IA y adaptaciones curadas de codigo de repositorios. Se reservaron 198 registros para validacion, excluidos de la optimizacion.

El proyecto documenta tambien un intento previo de ajuste mixto que fallo sus criterios de aceptacion (preservacion del ingles, mejora en episodios de desarrollo, mejora en turnos exactos naturales y aumento de finalizacion de tareas en ejemplos heredados); el candidato actual es una rama nueva desde el checkpoint A0, no una continuacion de ese intento. Los pilotos historicos de 45 y 129 actualizaciones ramificaron de forma independiente desde la base preentrenada.

## Capacidades

- Generacion de texto basica en ingles a partir de un modelo de 109,5 M de parametros preentrenado sobre 500 M de exposiciones a tokens.
- Capacidad de seguir instrucciones: no demostrada. El autor indica que los resultados no establecen un seguimiento fiable de instrucciones.
- Finalizacion de tareas solicitadas: los tres modelos historicos registrados (base preentrenada, piloto de 45 actualizaciones y piloto de 129 actualizaciones) satisficieron 0 de 4 tareas solicitadas.
- Soporte de tool calling o function calling: no disponible y no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible y no documentado.
- Capacidades multilingues: no; el modelo esta orientado exclusivamente al ingles.
- Vision, audio u otras modalidades: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Generacion de codigo: no se establece ningun pass@1 funcional, pese a que el corpus de preentrenamiento incluye un corpus estrecho de Python.
- Evaluacion cuantitativa disponible: perplejidad (NLL) sobre un subconjunto heredado de validacion y bits per byte sobre documentos en ingles.

## Casos de uso

- Replicacion de experimentos de preentrenamiento con presupuesto reducido: los registros de 7.630 actualizaciones del optimizador, 500.039.680 exposiciones a tokens y un corpus de 211.030.755 posiciones permiten a un laboratorio academico reproducir un ciclo completo de preentrenamiento a escala de 110 M de parametros en hardware modesto.
- Diseno de protocolos de evaluacion con criterios predeclarados: el proyecto define tolerancias antes de medir (por ejemplo, una tolerancia del 1 % en bits per byte) y conserva resultados negativos, lo que sirve como plantilla metodologica para evitar la seleccion retrospectiva de metricas.
- Auditoria de procedencia de datos: la documentacion enlaza fuentes concretas (muestra acotada de FineWeb-Edu, corpus Python, OpenAssistant, material sintetico) junto con hashes SHA-256 de los checkpoints, util para estudiar trazabilidad en modelos pequenos.
- Estudio de fallos a baja escala: los transcritos historicos registran errores factuales, repeticion e incoherencia en respuestas, lo que permite analizar modos de fallo tipicos de modelos de ~100 M de parametros sin coste de inferencia elevado.
- Baseline academico en ingles para comparativas a escala ~100 M: con contexto de 2.048 tokens y vocabulario de 32.000, puede usarse como punto de referencia documentado en estudios de escalado, siempre que se consigan los pesos, que no se distribuyen.
- Analisis de sobreajuste en ajuste fino con pocos datos: la etapa de 244 actualizaciones sobre 485 registros y 165.776 objetivos supervisados es un caso de estudio sobre como el ajuste con supervision exclusiva de asistente reduce la NLL de validacion mientras degrada ligeramente una metrica general de ingles.
- Docencia sobre el ciclo completo de desarrollo: la cronologia de entrenamiento, los informes de evaluacion y la galeria de conversaciones permiten ilustrar en un curso la diferencia entre "entrenamiento completado" y "capacidad demostrada".

## Benchmarks y rendimiento

| Evaluacion | A0 (base) | Candidato reciente | Interpretacion |
|---|---:|---:|---|
| NLL de validacion heredada (nats por objetivo de asistente) | 2,9744810100 | 2,8382381136 | 4,5804 % menor; las 23 perdidas por registro mejoraron |
| Bits per byte en ingles | 1,0696198812 | 1,0720000244 | 0,2225 % peor; dentro de la tolerancia predeclarada del 1 % |

Detalles de medicion: el subconjunto heredado contiene 23 registros y 8.397 objetivos supervisados de asistente; la evaluacion en ingles contiene 93 documentos fijos, 72.554 tokens puntuados y 337.390 bytes puntuados. Ambas comparaciones usan el mismo entorno de ejecucion en CPU y la misma configuracion de puntuacion. En ambas metricas, un valor menor es mejor.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. El autor indica expresamente que la evidencia no establece superioridad sobre GPT-2, ni preparacion para chat, ni pass@1 funcional en codigo. La validacion adicional de 175 registros y la evaluacion de desarrollo protegida no se han ejecutado para el candidato, por lo que no existe un resultado emparejado.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir de 109.529.856 parametros; no confirmada por el autor, ya que no se distribuyen pesos):
  - FP32: aproximadamente 438 MB.
  - FP16 / BF16: aproximadamente 219 MB.
  - INT8: aproximadamente 110 MB.
  - INT4: aproximadamente 55 MB.
- Cache KV adicional en FP16 con contexto completo de 2.048 tokens: aproximadamente 72 MB (12 capas x 2 tensores x 12 cabezas x 64 dimensiones x 2.048 tokens x 2 bytes).
- GPU recomendadas: por tamano, cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; no se requieren A100, H100 ni RTX 4090. No hay mediciones publicadas de latencia ni de throughput en la informacion disponible.
- Viabilidad en GPU consumer: si, en cualquier GPU consumer moderna e incluso en CPU, siempre que se obtuvieran los pesos, cosa que el repositorio no permite.
- Opciones de despliegue: no disponible. El autor advierte que la configuracion registrada no establece compatibilidad con cargadores de Hugging Face ni con servicios de inferencia alojados. No se puede confirmar funcionamiento en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de rendimiento de los modelos comparables no estan incluidos en la informacion proporcionada, por lo que la comparacion se limita a especificaciones publicas conocidas fuera de este material. No se dispone de ninguna comparacion de metricas entre Stasis1 y estos modelos.

| Modelo | Parametros | Capas / oculto | Contexto | Licencia | Pesos disponibles |
|---|---:|---|---:|---|---|
| Stasis1 110M Research | 109,5 M | 12 / 768 | 2.048 | No disponible (redistribucion pendiente) | No |
| GPT-2 small | 124 M | 12 / 768 | 1.024 | MIT | Si |
| Pythia-160M | 160 M | 12 / 768 | 2.048 | Apache 2.0 | Si |

Diferencias relevantes: Stasis1 no publica pesos ni tokenizador, carece de licencia declarada y no tiene resultados de benchmarks estandar comparables, mientras que los dos alternativas son modelos ampliamente redistribuidos con evaluaciones publicas. La unica ventaja documental de Stasis1 es la trazabilidad del proceso de entrenamiento y la publicacion de resultados negativos.

## Limitaciones y advertencias

- No se distribuyen pesos, tokenizador, datos crudos ni paquete de inferencia. El repositorio ocupa 0,0 GB y es exclusivamente documental.
- Licencia no disponible. El autor indica que la autorizacion de redistribucion de pesos, tokenizador y datos crudos esta pendiente, lo que impide cualquier uso comercial o redistribucion.
- Seguimiento de instrucciones no demostrado. El autor afirma explicitamente que los resultados no establecen un seguimiento fiable de instrucciones.
- Fallos observados en la revision de cuatro prompts heredados expuestos: errores factuales, repeticion e incoherencia en las respuestas.
- Los pilotos historicos de ajuste fino satisficieron 0 de 4 tareas solicitadas en cada etapa.
- La evaluacion final esta incompleta: faltan la validacion de 175 registros y la evaluacion de desarrollo protegida con resultado emparejado.
- La mejora en NLL de validacion (-4,5804 %) viene acompanada de un empeoramiento del 0,2225 % en bits per byte en ingles, dentro de la tolerancia predeclarada del 1 %.
- Riesgo de alucinacion: elevado, coherente con un modelo de 109,5 M de parametros entrenado sobre 500 M de exposiciones a tokens y con errores factuales ya documentados.
- Limitacion idiomatica: solo ingles. No hay soporte multilingue declarado.
- Limitacion de contexto: 2.048 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- Las transcripciones de la galeria corresponden a prompts expuestos durante el desarrollo, por lo que no constituyen un benchmark ciego.
- Las cifras redondeadas de los informes historicos no deben sustituir a los resultados emparejados mas recientes, segun advierte el propio autor.
- No se debe interpretar este repositorio como un modelo listo para produccion, para chat ni para generacion de codigo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShivankXD/Stasis1-110M-Research
- Informe de evaluacion: https://huggingface.co/ShivankXD/Stasis1-110M-Research/blob/main/reports/evaluation.md
- Resultados en formato legible por maquina: https://huggingface.co/ShivankXD/Stasis1-110M-Research/blob/main/reports/evaluation_summary.json
- Cronologia de entrenamiento: https://huggingface.co/ShivankXD/Stasis1-110M-Research/blob/main/provenance/training_progress.md
- Metadatos de entrenamiento: https://huggingface.co/ShivankXD/Stasis1-110M-Research/blob/main/provenance/training_progress.json
- Galeria de conversaciones historicas: https://huggingface.co/ShivankXD/Stasis1-110M-Research/blob/main/assets/conversations/README.md
- Registro historico de preentrenamiento: https://huggingface.co/ShivankXD/Stasis1-110M-Research/blob/main/assets/history/README.md
- Informe de investigacion del 6 de octubre de 2026 (PDF): https://huggingface.co/ShivankXD/Stasis1-110M-Research/blob/main/reports/history/stasis1-research-report-20261006.pdf
- Licencia y atribucion: https://huggingface.co/ShivankXD/Stasis1-110M-Research/blob/main/LICENSE_AND_ATTRIBUTION.md
- No se han encontrado papers, blogs, demos ni repositorios externos asociados en la informacion disponible.
