# beaver-zip/sumunjang

## Resumen

Sumunjang (수문장, "guardián" en coreano) es un clasificador de texto multilingüe (coreano e inglés) desarrollado por beaver-zip para detectar información sensible en capturas de pantalla antes de que se envíen a servicios de IA en la nube. El modelo forma parte del proyecto SILLOG, una herramienta para macOS que intercepta el contenido de la pantalla y decide si debe excluirse de un envío externo. Se distribuye principalmente como modelo Core ML (fp16, entrada 1×512) para ejecución local en Mac, con pesos PyTorch también incluidos.

Técnicamente es un ajuste fino del modelo base `convaiinnovations/laya-multilingual`, orientado a una tarea de clasificación multietiqueta sobre cinco categorías de datos sensibles según el artículo 23 de la ley coreana de protección de datos personales: creencias y convicciones, afiliación sindical o partidista, opinión política, salud y vida sexual. El modelo no genera texto: produce probabilidades por categoría para cada ventana de 512 tokens.

Su relevancia radica en el enfoque de privacidad en el borde (on-device): el filtrado ocurre en el propio Mac antes de cualquier transmisión, lo que reduce la exposición de datos personales. Con 1,4 GB de peso en el repositorio y una ventana de contexto de 512 tokens por fragmento, está diseñado para un caso de uso muy concreto más que para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tuning de `convaiinnovations/laya-multilingual`); no se detalla la arquitectura interna del modelo base |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por ventana de entrada; ventanas con solapamiento de 64 tokens sobre el texto de pantalla |
| Tipos de cuantizacion | fp16 (Core ML); pesos PyTorch en el repositorio |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`) y PyTorch (`pytorch/`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `convaiinnovations/laya-multilingual` (commit `92d22143468d8af669dc1a5a0480a2b21b4fe56e`) para clasificación de texto multietiqueta. La entrada se construye concatenando un prefijo con la pregunta y la categoría a evaluar más una ventana de 512 tokens del texto de pantalla; la salida es una probabilidad por categoría. El texto de pantalla se segmenta en ventanas con solapamiento de 64 tokens y a cada ventana se le antepone la cabecera del registro (aplicación, título de ventana, URL, ruta de fichero). La puntuación final del registro es el máximo de `1 - P(none)` entre todas las ventanas, con umbral de decisión en 0,8.

El entrenamiento se realizó con `laya` 0.4.37 sobre 14.500 registros de pantalla sintéticos generados con personajes ficticios: 5.800 sensibles, 5.800 casos ambiguos de difícil clasificación y 2.900 registros cotidianos, más 500 de validación. No se usaron registros reales de usuarios en el entrenamiento. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, uso de RLHF/DPO ni innovaciones arquitectónicas adicionales.

## Capacidades

- Clasificación multietiqueta de texto en cinco categorías de información sensible: `thought_belief` (religión, creencias, ideología), `union_party` (afiliación sindical o partidista), `political_view` (posición política), `health` (historial médico, medicación, salud mental, discapacidad) y `sex_life` (orientación e identidad sexual, vida sexual).
- Detección de información sensible en capturas de pantalla y en el texto asociado (título de ventana, URL, ruta de fichero, cuerpo).
- Ejecución local en macOS mediante Core ML, sin envío de datos a servicios externos.
- Procesamiento de textos largos mediante segmentación en ventanas de 512 tokens con solapamiento de 64.
- Capacidad multilingüe limitada a coreano e inglés.
- No soporta tool calling, function calling, agentes ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo al envío a asistentes de IA: integrado en SILLOG, intercepta la captura de pantalla y, si la puntuación supera 0,8, excluye título, URL, cuerpo y captura antes de transmitir el contenido a un servicio externo.
- Cumplimiento del artículo 23 de la ley coreana de protección de datos: automatiza la detección de las cinco categorías de datos sensibles que la norma exige tratar con cautela.
- Registro de actividad con privacidad por diseño: en herramientas de captura o análisis de pantalla para productividad, permite almacenar metadatos sin conservar fragmentos con datos sensibles.
- Telemetría y analítica de producto: filtra contenido de pantalla antes de agregarlo en pipelines de analítica, reduciendo la probabilidad de ingerir información personal sensible.
- Soporte y depuración remota: al compartir registros de pantalla con equipos de soporte, el clasificador puede marcar y ocultar automáticamente las secciones sensibles.
- Moderación de contenido en corpus de coreano e inglés: útil para etiquetar conjuntos de datos que contengan textos con datos personales sensibles antes de su publicación o uso en entrenamiento.
- Ejecución en el dispositivo en Mac: al distribuirse como Core ML fp16, puede integrarse en aplicaciones nativas de macOS sin depender de GPU dedicada ni de conectividad.

## Benchmarks y rendimiento

Evaluación sobre 400 registros de pantalla recogidos en uso real (160 sensibles), con umbral 0,8:

| Metrica | Valor |
|---|---|
| Reproduccion (recall) | 91,2% (146/160) |
| Precision | 86,9% (146/168) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia orientada a CPU y Neural Engine de Apple Silicon mediante Core ML; el modelo se distribuye en fp16 con entrada 1×512.
- VRAM estimada: no disponible; al ser Core ML, el consumo se reparte entre memoria unificada y Neural Engine del Mac.
- GPU recomendadas: no aplica en el sentido habitual; el destino son equipos Mac con Apple Silicon. No se documenta compatibilidad con GPU NVIDIA.
- Cabe en hardware de consumo: sí, en Mac con Apple Silicon; el repositorio ocupa 1,4 GB.
- Opciones de despliegue: Core ML (`.mlpackage`) para aplicaciones macOS; pesos PyTorch para inferencia con el ecosistema de `laya`/PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| beaver-zip/sumunjang | Clasificador de información sensible (fine-tuning) | ko, en | 512 tokens por ventana | Apache 2.0 | Core ML fp16, umbral 0,8, recall 91,2% |
| convaiinnovations/laya-multilingual | Modelo base multilingüe | Multilingüe (no detallado) | no disponible | no disponible | Base sobre la que se ajusta Sumunjang |
| Clasificadores PII genéricos (p. ej. Presidio, modelos NER de PII) | Detección de entidades | Variable | Variable | Variable | Enfoque basado en entidades (nombres, tarjetas, correos) frente a categorías semánticas de datos sensibles; no directamente comparables |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no debe usarse como única salvaguarda para tratar información sensible: hay pantallas que no detecta (recall del 91,2%, es decir, 14 de 160 casos sensibles no detectados en la evaluación).
- La precisión del 86,9% implica falsos positivos: 22 de 168 registros marcados como sensibles no lo eran, lo que puede provocar bloqueos innecesarios.
- Solo cubre coreano e inglés; no hay soporte documentado para castellano ni otros idiomas.
- La evaluación se realizó sobre 400 registros, una muestra pequeña y específica del contexto de SILLOG; la generalización a otros dominios no está validada.
- El entrenamiento usó únicamente datos sintéticos con personajes ficticios; el rendimiento sobre distribuciones reales distintas de las evaluadas puede degradarse.
- Las categorías están alineadas con la legislación coreana; su aplicabilidad a marcos normativos de otros países (por ejemplo, el RGPD) no está documentada.
- No es un modelo generativo: no puede resumir, redactar ni razonar; cualquier expectativa de uso como LLM es incorrecta.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre idoneidad para producción.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos y negativos) con consecuencias sobre la privacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beaver-zip/sumunjang
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio SILLOG: https://github.com/sillog-admin/SILLOG
- Código de conversión: `scripts/sumunjang/convert.py` en el repositorio SILLOG
- Paquete `laya` en PyPI: https://pypi.org/project/laya/
