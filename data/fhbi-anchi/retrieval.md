# fhbi-anchi/retrieval

## Resumen

fhbi-anchi/retrieval, publicado bajo el título "Dino for Retrieval", es una implementación reducida de una arquitectura Dino orientada a tareas de recuperación (retrieval) y distribuida por el usuario fhbi-anchi con licencia MIT. No es un modelo entrenado ni un release listo para producción: la propia model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests) y que no se reclama ninguna puntuación de benchmark. El repositorio se completa con `pipeline.py`, `config.json` y `training_args.json` como artefactos de una receta experimental reproducible.

La arquitectura declarada corresponde a la variante "xlarge" con atención de consulta agrupada (grouped query attention), fusión bilineal, activación gelu tanh y normalización groupnorm. El recuento real de parámetros según los ficheros safetensors es de 24.832, una cifra que contrasta de forma notable con la etiqueta "xlarge" y que, de confirmarse, situaría al modelo varios órdenes de magnitud por debajo de cualquier DINO entrenado de referencia. No se especifican ventana de contexto, idiomas soportados ni tipos de cuantización.

Su relevancia actual es estrictamente metodológica: sirve como esqueleto reproducible para experimentos de recuperación y como punto de partida para entrenar y evaluar sobre conjuntos como Flickr30k. No es un modelo para desplegar en producción, y en el momento de la consulta acumula cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dino (implementación propia) |
| Parametros totales | 24.832 (dato real de los ficheros safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Escala declarada | xlarge |
| Atencion | grouped query |
| Fusion | bilineal |
| Activacion | gelu tanh |
| Normalizacion | groupnorm |
| Optimizador de la receta | AdamW con scheduler OneCycle |

## Arquitectura y entrenamiento

La model card describe una arquitectura Dino con atención de consulta agrupada, fusión bilineal (habitual en tareas de emparejamiento imagen-texto), activación gelu tanh y normalización groupnorm, una elección poco frecuente en transformers de visión, donde lo habitual es LayerNorm. No se documenta el número de capas, la dimensión oculta, el número de cabezas ni la resolución de entrada. La receta de experimento por defecto emplea AdamW con un scheduler OneCycle, pero el autor aclara de forma explícita que son valores de partida del script y no evidencia de un entrenamiento completado.

No hay entrenamiento efectivo. El repositorio no reporta número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. El checkpoint safetensors es una inicialización sin entrenar, no auditada en robustez, equidad o transferencia de dominio. La guía de evaluación sugerida por el propio autor propone usar Flickr30k, reportar la métrica de la tarea sobre al menos tres semillas e incluir una línea base de capacidad equivalente, manteniendo los registros de entrenamiento y las versiones del entorno junto a cualquier resultado publicado.

## Capacidades

- Recuperación (retrieval): la arquitectura está diseñada para tareas de emparejamiento y búsqueda, con fusión bilineal entre representaciones.
- Ejecución de un pipeline de ejemplo: el fichero `pipeline.py` incluye un bloque `__main__` con un ejemplo de smoke test (`python pipeline.py --help`).
- Configuración explícita y reproducible: `config.json` registra los ajustes de arquitectura generados y `training_args.json` la receta por defecto.
- Punto de partida para entrenamiento: puede usarse como inicialización para experimentos propios, no como modelo con capacidades aprendidas.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión-a-texto generativa ni modo de pensamiento.
- No se declara soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Punto de partida reproducible para investigación en recuperación: el repositorio ofrece script, configuración y argumentos de entrenamiento en un solo paquete, de modo que un equipo puede arrancar una ablación sin reescribir la infraestructura.
- Smoke test de infraestructura: cargar `model.safetensors` y ejecutar `pipeline.py` permite validar el entorno (versiones de PyTorch, disponibilidad de GPU, rutas de datos) antes de lanzar entrenamientos largos y costosos.
- Evaluación sobre Flickr30k: la propia model card propone este conjunto como primera referencia, reportando la métrica de la tarea sobre al menos tres semillas y comparando contra una línea base de capacidad equivalente.
- Experimentos de arquitectura: al incluir una configuración explícita con atención de consulta agrupada, fusión bilineal y groupnorm, sirve para estudiar el efecto de estas decisiones frente a alternativas estándar.
- Docencia y formación: es un ejemplo manejable para explicar el ciclo completo de definición de arquitectura, inicialización de pesos y configuración de un experimento de recuperación.
- Base para adaptación a dominio propio: partiendo del checkpoint de inicialización, un equipo puede entrenar sobre su propio corpus de pares imagen-texto y documentar los resultados de forma separada a los valores por defecto del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint suministrado no ha sido entrenado. La evaluación sugerida sobre Flickr30k es una recomendación metodológica del autor, no un resultado medido.

## Requisitos de hardware

- VRAM para inferencia: con 24.832 parámetros y pesos en safetensors de precisión completa (float32), el checkpoint ocupa del orden de decenas de kilobytes, por lo que cabe en cualquier GPU e incluso en CPU.
- GPU recomendadas: no aplica en el estado actual; cualquier GPU con soporte PyTorch es suficiente. Alternativas como A100, H100 o RTX 4090 solo tendrían sentido para un futuro entrenamiento a la escala "xlarge" declarada, para la cual no se especifican requisitos.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 o una RTX 3060.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fhbi-anchi/retrieval | 24.832 | no disponible | no | MIT | HuggingFace |
| DINOv2 (Meta) | cientos de millones | no aplica (vision) | si | Apache 2.0 / varios | HuggingFace, GitHub |
| CLIP (OpenAI) | ~150 M (ViT-B/32) | 77 tokens (texto) | si | MIT (variantes) | GitHub, HuggingFace |
| SigLIP (Google) | ~90 M-1 B | no disponible | si | Apache 2.0 | HuggingFace |

La comparación es estructural y no de rendimiento: las alternativas de la tabla son modelos entrenados con cientos de millones de parámetros y resultados publicados, mientras que fhbi-anchi/retrieval es un esqueleto con 24.832 parámetros y sin entrenamiento. No se dispone de datos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El checkpoint distribuido no ha sido entrenado: no debe usarse para inferencia real ni para decisiones en producción.
- No ha sido auditado en robustez, equidad, sesgo o transferencia de dominio.
- El recuento real de parámetros (24.832) contradice la etiqueta "xlarge" de la ficha, lo que introduce ambigüedad sobre la escala real del modelo y de cualquier entrenamiento futuro.
- Riesgo de alucinación: no aplica a generación de texto, pero cualquier uso derivado heredaría los sesgos de los datos de entrenamiento que se introduzcan.
- No hay información sobre idiomas, por lo que no puede garantizarse soporte multilingüe ni corrección lingüística en castellano.
- No se documenta la longitud de contexto, lo que impide planificar escenarios de contexto largo.
- La licencia MIT del repositorio no cubre los términos de los datos de origen: si se usa con conjuntos externos (por ejemplo, Flickr30k), hay que revisar sus condiciones por separado.
- Al ser una implementación personalizada, no es compatible con las APIs de carga automática estándar sin escribir un adaptador.
- Cualquier resultado obtenido con un checkpoint futuro debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/fhbi-anchi/retrieval
- Ficheros del repositorio: `pipeline.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors`
- Referencia de evaluación sugerida: Flickr30k (sin enlace específico en la información disponible)
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo en los resultados de búsqueda web disponibles.
