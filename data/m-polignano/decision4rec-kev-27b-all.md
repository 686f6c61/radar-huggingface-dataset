# m-polignano/decision4rec-kev-27b-all

## Resumen

Decision4Rec Kev-27B (all) es un adaptador LoRA de rango 16, junto con una cabeza de tipo pointer, entrenado sobre el modelo base Qwen/Qwen3.8-27B (congelado) para funcionar como lector de decisión dentro del framework Decision4Rec. Lo desarrolla Marco Polignano y colaboradores, y resuelve un problema muy concreto dentro de los sistemas de recomendación: dado un conjunto de hasta 30 candidatos producidos por un pool multiagente, el modelo devuelve una probabilidad por candidato en un único forward pass (protocolo System One, pregunta de tipo `choice`), sin generación autoregresiva de texto.

El modelo parte del adaptador publicado `jaredpalmer/kev-27b` (revisión `v1-lora`) y su cabeza pointer, y se ha entrenado sobre 34.667 registros reales de elecciones siguientes de usuarios en tres dominios de Amazon (Video Games, Musical Instruments y Steam). Es relevante porque formaliza empíricamente una "ley de evidencia": la información que aporta el modelo decae a medida que crece la evidencia disponible sobre el ítem objetivo, con una pendiente agregada de -0,033 nats por cada multiplicación por diez de compras previas (p = 0,0003).

Se trata de un artefacto de investigación especializado, no de un modelo conversacional: su pipeline declarado es `text-classification` y su función es el reranking de candidatos, no la recuperación. El repositorio ocupa 0,5 GB y se distribuye bajo licencia Apache-2.0 (el modelo base conserva la suya).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8-27B congelado) con adaptadores LoRA de rango 16 en todas las capas lineales y cabeza pointer para scoring de candidatos |
| Parametros totales | 27B en el modelo base (congelado); adaptadores LoRA de rango 16 y cabeza pointer entrenables (número exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre catálogos de productos y juegos en inglés) |
| Licencia | Apache-2.0 (adaptador y cabeza); el modelo base conserva su propia licencia |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Qwen/Qwen3.8-27B en revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, mantenido congelado, y añade adaptadores LoRA de rango 16 sobre todas las capas lineales más una cabeza pointer que produce una probabilidad por cada candidato de entrada. La entrada combina el texto de cada ítem candidato, las declaraciones del grafo de conocimiento del escenario y los agentes que propusieron cada candidato; la salida es un vector de probabilidades sobre los 30 mejores candidatos del pool en un solo forward pass.

El entrenamiento usa 34.667 elecciones siguientes reales de usuarios de Amazon Video Games, Amazon Musical Instruments y Steam (se descartaron 480 registros más largos), optimizando la verosimilitud del ítem que el usuario eligió realmente, sin usar salidas de modelos comerciales. La receta es de una época, learning rate 2e-5, schedule one-cycle, micro-batch 1 con acumulación 8 (8 registros por paso, 4.274 pasos), precisión bf16 y gradient checkpointing, con semilla 0. Se entrenó con `kev.train` (commit 84847f0) sobre una única NVIDIA DGX Spark durante aproximadamente 129 horas.

## Capacidades

- Scoring y reranking de candidatos: devuelve una probabilidad por candidato en un único forward pass, sin decodificación autoregresiva.
- Integración de señales heterogéneas: combina texto de ítem, declaraciones de un grafo de conocimiento del escenario y metadatos de los agentes que generaron cada candidato.
- Razonamiento de decisión tipo System One: selección rápida sobre un pool acotado de hasta 30 candidatos.
- Generalización a dominios no vistos en entrenamiento (se reportan ganancias en CDs and Vinyl, Toys and Games y Software).
- Modelado de preferencias secuenciales a partir del historial de compras del usuario.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido conversacional.
- Capacidades multilingües: no disponibles; el entrenamiento se realizó sobre catálogos en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reranking en producción de recomendadores secuenciales: se usa como segunda etapa tras un recuperador (por ejemplo, SASRecF+ o un pool multiagente) para reordenar los 30 mejores candidatos; encaja porque su coste es un único forward pass sobre un pool pequeño.
- Sistemas de recomendación multiagente: cada agente propone candidatos y el modelo los puntúa incorporando la identidad del agente proponente como señal, lo que permite ponderar implícitamente la fiabilidad de cada agente.
- Recomendación en catálogos de videojuegos y productos de consumo: el modelo se entrenó específicamente sobre Video Games, Musical Instruments y Steam, por lo que es directamente aplicable a dominios de e-commerce con catálogos en inglés.
- Arranque en frío de dominios nuevos: las ganancias reportadas en dominios no vistos durante el entrenamiento (+49,2% en CDs and Vinyl, +50,6% en Toys and Games) sugieren su uso como reranker cuando no hay historial propio del dominio.
- Investigación sobre leyes de escalado de evidencia: permite medir cómo decae la información añadida por el modelo a medida que crece el historial del usuario objetivo, útil para estudiar cuándo merece la pena un reranker neuronal.
- Enriquecimiento con grafos de conocimiento: al aceptar declaraciones de un KG del escenario, sirve para escenarios donde los ítems tienen atributos estructurados que complementan el texto descriptivo.
- Evaluación comparativa de recuperadores: al ser un reranker fijo, permite aislar la calidad de distintas etapas de recuperación manteniendo constante la etapa de decisión.

## Benchmarks y rendimiento

Los resultados publicados corresponden al lector de 9B entrenado sobre los mismos 34.667 registros (Decision4Rec-Full), no al lector de 27B de esta ficha. Se comparan contra el mejor referencia (SASRecF+) en NDCG@10 sobre 10.000 usuarios reservados por dominio, con corrección de Holm (p < 0,01 en todas las filas).

| Dominio | Referencia | NDCG@10 referencia | Decision4Rec-Full | Ganancia |
|---|---|---|---|---|
| Video Games | SASRecF+ | 0,0478 | 0,0608 | +27,2% |
| Musical Instruments | SASRecF+ | 0,0278 | 0,0375 | +34,8% |
| Steam | SASRecF+ | 0,0613 | 0,0649 | +6,0% |
| Industrial & Scientific (no visto en entrenamiento) | SASRecF+ | 0,0263 | 0,0326 | +23,9% |

En tres escenarios nunca vistos en entrenamiento las ganancias sobre la mejor referencia son +49,2% (CDs and Vinyl), +50,6% (Toys and Games) y +6,1% (Software).

Ley de evidencia (pendiente de la información añadida sobre log10(1 + compras previas del objetivo), en nats por multiplicación por diez, test de permutación agrupado):

| | Video Games | Musical Instr. | Steam | Industrial & Sci. | ML-1M | ML-1M enr. | Agrupado |
|---|---|---|---|---|---|---|---|
| Este modelo | -0,062 | -0,034 | -0,053 | -0,146 | +0,042 | +0,053 | -0,033 (p = 0,0003) |

No se han publicado resultados de benchmarks específicos para el lector de 27B en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un backbone de 27B en bf16 requiere del orden de 54 GB solo para pesos, más el estado de activaciones y la cabeza pointer; no se ha confirmado esta cifra para este artefacto.
- GPU recomendadas: el autor reporta el entrenamiento en una única NVIDIA DGX Spark; no se especifican GPU recomendadas para inferencia.
- Cabe en GPU de consumo: no disponible. Con cuantización de 4 bits un modelo de 27B podría situarse en el rango de 14-16 GB, pero no se ha publicado ni verificado para este adaptador.
- Opciones de despliegue: el autor proporciona un servidor propio mediante `uv run --extra serve python -m kev.serve --run m-polignano/decision4rec-kev-27b-all --port 8009`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento consumió aproximadamente 129 horas en una DGX Spark para 4.274 pasos, dato de entrenamiento que no permite inferir latencia de servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision4Rec Kev-27B (all) | 27B base + LoRA r16 | no disponible | Reranking de hasta 30 candidatos con KG y agentes | Apache-2.0 (adaptador) | Hugging Face, 0 descargas |
| Decision4Rec-Full (lector 9B) | 9B | no disponible | Misma función, lector de referencia del paper v2 | no disponible | Uso interno del paper |
| SASRecF+ | no disponible | no disponible | Recomendación secuencial (referencia fuerte) | no disponible | Referencia comparativa del paper |
| jaredpalmer/kev-27b | 27B base + LoRA | no disponible | Punto de partida del adaptador | no disponible | Hugging Face (revisión `v1-lora`) |

No se dispone de datos de benchmarks del lector de 27B que permitan una comparación numérica directa con el lector de 9B ni con SASRecF+ en igualdad de condiciones.

## Limitaciones y advertencias

- Entrenado sobre catálogos de productos y juegos en inglés; el rendimiento en otros idiomas no está caracterizado.
- Los dominios densos con historiales largos (MovieLens) se benefician menos: la pendiente de la ley de evidencia es positiva o plana allí, lo que indica que el modelo añade poca información cuando el objetivo ya es bien conocido.
- El modelo solo ordena los candidatos que recibe; no recupera. Su calidad está acotada por la del pool de entrada.
- Riesgo de sesgo heredado de los datos de Amazon y Steam: popularidad de ítems, sesgos de catálogo y de población de usuarios.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto libre), pero sí de calibración deficiente de las probabilidades fuera de la distribución de entrenamiento.
- El adaptador y la cabeza son Apache-2.0, pero el modelo base Qwen/Qwen3.8-27B conserva su propia licencia, que debe verificarse para uso comercial.
- Los datos de entrenamiento provienen de datasets de investigación públicos y no se redistribuyen con el modelo.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- No se documentan contexto máximo, cuantizaciones soportadas ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/m-polignano/decision4rec-kev-27b-all
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador de partida: https://huggingface.co/jaredpalmer/kev-27b
- Repositorio Decision4Rec: https://github.com/marcopoli/decision4rec
- Trainer Kev: https://github.com/jaredpalmer/kev
