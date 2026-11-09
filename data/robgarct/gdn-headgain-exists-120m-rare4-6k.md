# robgarct/gdn-headgain-exists-120m-rare4-6k

## Resumen

gdn-headgain-exists-120m-rare4-6k es un modelo de lenguaje de 120 millones de parámetros desarrollado por el usuario robgarct, publicado en Hugging Face como parte de una serie de ablaciones sobre circuitos de recuerdo en contexto (in-context recall). Se trata de un modelo de investigación, no de un modelo listo para producción, cuyo objetivo es aislar el efecto de una señal concreta: una compuerta por cabeza de atención (per-head output gain) condicionada únicamente a la existencia o no de un candidato de n-grama a nivel de token, es decir, un solo bit 0/1.

El modelo emplea una arquitectura Gated DeltaNet, una variante de atención lineal con estado recurrente, y fue entrenado sobre el dataset Pile durante 6.000 actualizaciones (3.146 mil millones de tokens, batch global de 256 x 2.048) con un objetivo denominado rare4, que aplica un factor de pérdida de 4x a los tokens que completan un bigrama raro. La semilla utilizada fue 1111. Su relevancia es puramente científica: permite estudiar si una señal binaria mínima basta para modular el comportamiento de recuerdo en atención lineal, un problema abierto en el diseño de arquitecturas recurrentes eficientes.

La model card reporta resultados medidos: perplejidad de 12,20 en el Pile (1.000 secuencias de validación), perplejidad de 2,88 en Rare-AR (66.394 eventos de primer recuerdo raro), precisión top-1 de 76,1% en Rare-AR y un 6,3% en Natural FDA (1.102 ejemplos, generación, respuesta contenida). No se dispone de información sobre licencia, idiomas soportados ni pipeline de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal con estado recurrente) |
| Parametros totales | 120 millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `final.ckpt` (checkpoint sin estado del optimizador, `global_step` 6000) |

## Arquitectura y entrenamiento

El modelo se basa en Gated DeltaNet, una arquitectura de atención lineal con estado recurrente que sustituye la atención cuadrática por una actualización recurrente del estado, lo que reduce el coste computacional en secuencias largas. La innovación concreta de esta ablación es una ganancia de salida por cabeza (un escalar aprendido por cabeza y token, aplicado antes de la proyección de salida) condicionada a la entrada de la capa y a una única señal binaria: si existe o no un candidato de n-grama a nivel de token. Esta señal se codifica como un bit 0/1, lo que convierte el experimento en una prueba de si una modulación mínima puede influir en el recuerdo en contexto.

El entrenamiento se realizó sobre el dataset Pile con 6.000 actualizaciones, un batch global de 256 secuencias de 2.048 tokens (3.146 mil millones de tokens en total) y el objetivo rare4, que aplica una pérdida 4x mayor a los tokens que completan un bigrama raro. La semilla fue 1111. El checkpoint publicado tiene el estado del optimizador eliminado y se acompaña de `resolved-config.yaml` (configuración exacta de entrenamiento) y `metadata.json` (identidad de la ejecución). El código está disponible en la rama `ngram-router-ablations` del repositorio recurrent-recall-circuits, con el experimento `gdn_router/headgain_exists_rare4` (alias de registro `gdn_120m_rare4_gate_exists`).

## Capacidades

- Generación de texto autoregresiva sobre el dataset Pile.
- Recuerdo en contexto (in-context recall) de bigramas raros, evaluado mediante Rare-AR.
- Modulación por compuerta binaria de existencia de n-grama, que permite estudiar el efecto de señales mínimas en el recuerdo.
- No se ha documentado soporte de tool calling, function calling, agentes, multi-step reasoning ni capacidades multimodales.
- Capacidades multilingües: no disponible; el entrenamiento se realizó sobre Pile, predominantemente en inglés.
- No se ha documentado modo thinking, visión ni audio.

## Casos de uso

- Investigación en arquitecturas de atención lineal: el modelo sirve como punto de comparación en ablaciones para medir el impacto de una compuerta binaria en el recuerdo en contexto, usando la configuración `gdn_router/headgain_exists_rare4`.
- Estudio de circuitos de recuerdo: permite analizar cómo una señal de un solo bit modula la ganancia por cabeza y afecta a la precisión top-1 en eventos de primer recuerdo raro (76,1% reportado).
- Reproducción de experimentos: el checkpoint incluye `resolved-config.yaml` y `metadata.json`, lo que facilita replicar el entrenamiento con la semilla 1111 y el objetivo rare4.
- Evaluación de objetivos de pérdida ponderada: el objetivo rare4 (4x pérdida en bigramas raros) puede estudiarse como técnica para mejorar el recuerdo de patrones poco frecuentes.
- Docencia e investigación académica: modelo pequeño (120M) que cabe en una GPU consumer y permite experimentar con arquitecturas recurrentes sin grandes recursos.
- Análisis de perplejidad en el Pile: útil para comparar el efecto de la compuerta binaria frente a variantes sin ella en la misma familia de ablaciones.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Pile PPL (1.000 secuencias de validación) | 12,20 |
| Rare-AR PPL (66.394 eventos de primer recuerdo raro) | 2,88 |
| Rare-AR top-1 accuracy | 76,1% |
| Natural FDA (1.102 ejemplos, generación, respuesta contenida) | 6,3% |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 120M parámetros en fp16 se estiman aproximadamente 0,25 GB de pesos, más overhead de activaciones y estado recurrente.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) debería poder alojar los pesos.
- Cabe en GPU consumer: sí, por el tamaño del modelo (120M), aunque no se ha verificado el soporte de los frameworks de despliegue.
- Opciones de despliegue: no disponible; el modelo usa la librería `recurrent-recall-circuits` y se carga con `recurrent_recall_circuits.utils.checkpoint.load_checkpoint`, no con vLLM, llama.cpp, Ollama ni TGI de forma documentada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gdn-headgain-exists-120m-rare4-6k | 120M | no disponible | no disponible | Hugging Face (0 descargas) |
| Otros modelos de la familia Gated DeltaNet | no disponible | no disponible | no disponible | no disponible |
| Alternativas de atención lineal de 120M | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones comerciales.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Idiomas no especificados: el entrenamiento sobre Pile sugiere predominio del inglés, pero no está documentado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- Contexto máximo no documentado: se desconoce la longitud de contexto soportada.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.
- El checkpoint no incluye estado del optimizador, por lo que no es directamente reanudable para entrenamiento sin reconstruirlo.
- Resultados limitados a los benchmarks reportados por el autor; no hay validación independiente.
- El objetivo rare4 y la compuerta binaria son específicos de esta ablación y pueden no generalizar a otras tareas.

## Enlaces

- Hugging Face: https://huggingface.co/robgarct/gdn-headgain-exists-120m-rare4-6k
- Repositorio de código: rama `ngram-router-ablations` de recurrent-recall-circuits (no se proporciona URL directa en la información disponible)
- Configuración de entrenamiento: `resolved-config.yaml` (incluido en el repositorio)
- Metadatos de la ejecución: `metadata.json` (incluido en el repositorio)
