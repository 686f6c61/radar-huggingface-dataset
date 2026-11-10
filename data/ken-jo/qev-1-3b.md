# ken-jo/QEV-1.3B

## Resumen

QEV-1.3B es un modelo de decisión multimodal compacto desarrollado por ken-jo, publicado originalmente como QEV-2B-compact. No es un modelo generativo al uso: recibe evidencia (texto y hasta cuatro imágenes) junto con un conjunto de opciones candidatas y devuelve, en un único forward pass y sin generar tokens, una probabilidad calibrada por opción, una respuesta tipada y un flag de abstención separado. Está pensado para tareas de clasificación zero-shot y selección entre alternativas donde la memoria es un recurso escaso.

El modelo se obtiene recortando QEV-2B v3: conserva los bloques 1-16 de 24 del language model, elimina los bloques 17-24 y reduce el vocabulario de entrada de 248.320 a 32.768 filas. El resultado son 1.314.213.824 parámetros (el 59% del modelo padre) con una pérdida de rendimiento de solo 0,12 puntos en el índice público de visión de su suite de evaluación. El encoder visual y el proyector se mantienen intactos respecto al padre (encoder Qwen3.5 congelado).

Su relevancia actual radica en la eficiencia: cabe en una GPU consumer de 8 GB con un pico de 2,76 GiB en bf16 y ofrece una latencia mediana de 99 ms por petición, lo que lo hace apto para decisiones en bucle dentro de agentes y pipelines de extracción de datos donde un modelo generativo sería demasiado costoso. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder visual Qwen3.5 congelado y language model recortado (bloques 1-16 de 24) |
| Parametros totales | 1.314.213.824 (1,31B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada; hasta 4 imágenes de 1.638.400 píxeles cada una |
| Tipos de cuantizacion | No disponible (la model card solo documenta ejecución en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato bundled-backbone, `format_version` 3, con `manifest.json` y SHA-256 por fichero) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual Qwen3.5 congelado con proyector sin cambios respecto a QEV-2B v3, y un language model derivado de los pesos fusionados de QEV-2B v3 al que se le han eliminado los bloques 17-24 tras un depth probe que determinó que la decisión queda completa en el bloque 16. El vocabulario de entrada se recorta a 32.768 filas (de 248.320) conservando todos los tokens producidos en los prompts de entrenamiento y desarrollo, todos los tokens especiales y de byte, y las fusiones necesarias para construirlos, con un tokenizer byte-fallback reescrito y un `vocab-map.json`. Las peticiones que exceden el presupuesto se rechazan, nunca se truncan.

La cabeza de lectura (readout) es la del bloque 16: cuatro slots de razonamiento, una vista de decisión y una cabeza de binding condicionada de rango 64, destilada desde la cabeza de profundidad completa sobre las preguntas de entrenamiento y seleccionada únicamente con datos de desarrollo. Las temperaturas y umbrales de abstención se reajustaron para este paquete sobre las 3.000 filas del Calibration DEV de release, con el mismo procedimiento que v3: en mitades disjuntas por grupo, la temperatura minimiza NLL en una mitad y el umbral de abstención en la otra toma la mayor cobertura con como máximo un 15% de error empírico y al menos 20 ejemplos aceptados. No se usó ninguna fila de la suite pública ni del holdout. El checkpoint usa un formato de backbone empaquetado que verifica la integridad de todos los ficheros bajo `backbone/` mediante SHA-256, rechazando ficheros ausentes, extra o modificados.

## Capacidades

- Clasificación zero-shot y selección entre opciones candidatas con probabilidad calibrada por opción.
- Decisiones tipadas: tipos `choice`, `score` y `noul`, cada uno con su propia temperatura y umbral de abstención.
- Procesamiento multimodal: texto más hasta cuatro imágenes por petición en modo `accurate`.
- Extracción de campos de recibos y formularios (key information extraction).
- Selección de elementos de pantalla para agentes (grounding de UI).
- Comprobaciones sí/no y verificación de condiciones.
- Abstención calibrada con flag separado, manteniendo la respuesta aun cuando el modelo se abstiene.
- Inferencia en un único forward pass sin generación de tokens.
- No soporta tool calling, function calling ni razonamiento multi-step generativo; no es un modelo de chat ni de generación libre.

## Casos de uso

- Selección de elementos de interfaz en agentes: dado un screenshot y una lista de candidatos (botones, campos, enlaces), el modelo devuelve la probabilidad de cada uno en una sola pasada, con 81,8 puntos en Mind2Web y latencia mediana de 99 ms, adecuado para bucles de automatización de navegador.
- Extracción de campos en recibos y formularios: con 92,3 puntos en KIE (CORD+FUNSD), puede mapear regiones de un documento a campos tipados sin generar texto, integrándose en pipelines de digitalización de facturas.
- Enrutamiento y triaje de tickets: clasificar una consulta entre un conjunto fijo de categorías con probabilidad calibrada (ECE de 0,019 en tipo `choice`) permite umbrales de derivación a humano basados en la confianza real del modelo.
- Verificación visual de condiciones: comprobaciones sí/no sobre imágenes (por ejemplo, si un producto cumple un criterio visual) usando el tipo `noul` con abstención cuando la evidencia es insuficiente.
- Puntuación de relevancia en recuperación multimodal: puntuar pares imagen-texto o candidatos de ranking con el tipo `score` (ECE de 0,077) para reordenar resultados en buscadores de documentos escaneados.
- Control de calidad en almacenamiento limitado: desplegado en una RTX 4060 Ti de 8 GB con 2,76 GiB de pico, permite ejecutar decisiones en local o en el borde sin depender de APIs externas.
- Comparación de captions o descripciones: con 66,0 puntos en Winoground, puede discriminar entre descripciones alternativas de una misma imagen en tareas de anotación asistida.

## Benchmarks y rendimiento

Resultados de la mitad pública de la suite de visión JEV Decision Index (12.210 filas, 11 benchmarks, kit público, motor oficial cargando el repositorio desde el Hub en un commit fijado). Son ejecuciones propias del autor; la mitad privada la ejecutan los mantenedores del board, por lo que la puntuación completa del board no se conoce todavía.

| Modelo | Parametros | Indice publico de vision | Intervalo bootstrap 95% |
|---|---:|---:|---:|
| QEV-1.3B | 1,31B | 62,15 | 60,7 a 63,5 |
| QEV-2B v3 (mismo kit y motor, ejecucion propia) | 2,21B | 62,27 | no disponible |

Desglose por benchmark (puntos de skill públicos; peso entre paréntesis):

| Benchmark | QEV-1.3B | QEV-2B |
|---|---:|---:|
| CV-Bench (1) | 71,1 | 71,8 |
| BLINK (1) | 48,1 | 48,0 |
| RealWorldQA (1) | 56,2 | 55,3 |
| CharXiv (1) | 65,2 | 65,7 |
| InfographicVQA (1) | 80,9 | 81,4 |
| Mind2Web (1) | 81,8 | 83,6 |
| Winoground (1) | 66,0 | 65,5 |
| KIE, CORD+FUNSD (1) | 92,3 | 92,6 |
| Moderation, Hateful Memes (1) | 31,4 | 31,6 |
| R-Bench-M (0,5) | 19,5 | 15,4 |
| MMMU-Pro vision (0,25) | 13,2 | 16,0 |

Calibración y abstención (sobre la mitad de política del Calibration DEV):

| Tipo | Temperatura | Abstenerse por debajo de | Precision (mitad de politica) | ECE | Cobertura |
|---|---:|---:|---:|---:|---:|
| choice | 1,029 | 0,301 | 89,5% | 0,019 | 100% |
| score | 0,579 | 0,454 | 88,6% | 0,077 | 100% |
| noul | 1,223 | 0,674 | 71,3% | 0,070 | 61,3% |

Rendimiento medido en una RTX 4060 Ti de 8 GB, batch 1, bf16, 47 perfiles de petición de hasta 16 opciones a resolución completa (1,6 MP por imagen), 3 ejecuciones de calentamiento y 30 cronometradas por perfil:

| Modelo | p95 peor caso | Mediana p50 | Memoria GPU pico |
|---|---:|---:|---:|
| QEV-1.3B | 630,4 ms | 99,0 ms | 2,76 GiB |
| QEV-2B v3, modo accurate | 736,4 ms | 122,9 ms | 4,44 GiB |

## Requisitos de hardware

- VRAM estimada: 2,76 GiB de pico en bf16 con batch 1 en el peor caso medido.
- GPU recomendadas: RTX 4060 Ti 8 GB (medida por el autor); cualquier GPU con al menos 4 GB de VRAM libre en bf16 debería ser suficiente, aunque no se han publicado mediciones en otras GPU.
- Cabe en GPU consumer: sí, en una RTX 4060 Ti de 8 GB y presumiblemente en modelos con 6-8 GB; no hay datos publicados para GPUs de gama de entrada con menos memoria.
- Opciones de despliegue: el motor propio `QEVEngine` del paquete `qev` (instalable desde el repositorio GitHub con commit fijado) o carga directa con `veyra.option_model.OptionModel.load(path, device="cuda")` sobre un snapshot descargado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 99,0 ms y p95 de 630,4 ms en el peor caso; no se publica throughput agregado.
- Solo modo `accurate` (hasta 1.638.400 píxeles por imagen, 8.192 tokens de entrada, máximo 4 imágenes); el modo `fast` no se ofrece.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice publico de vision | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| QEV-1.3B | 1,31B | 8.192 tokens, 4 imagenes | 62,15 | Apache 2.0 | Hugging Face |
| QEV-2B v3 | 2,21B | no disponible | 62,27 | Apache 2.0 (segun modelo padre) | Hugging Face |
| QEV-0.8B | no disponible | no disponible | no disponible | no disponible | Hugging Face (usado como control en las mediciones) |

No se dispone de datos de benchmarks de otros modelos de decisión comparables en la información proporcionada; la comparación se limita a la familia QEV. Frente a su padre QEV-2B v3, QEV-1.3B ofrece una diferencia de −0,12 puntos en el índice público (intervalo pareado del 95%: −0,90 a +0,70) con un 41% menos de parámetros y un 38% menos de memoria GPU pico.

## Limitaciones y advertencias

- No apto para moderación de contenido automatizada ni para decisiones sobre personas sin revisión humana: la skill de Hateful Memes ronda los 30 puntos.
- No debe usarse para decisiones médicas, legales o financieras.
- No soporta generación libre de texto ni conversación; solo decisiones tipadas sobre opciones dadas.
- Solo inglés; no se garantiza comportamiento en otros idiomas.
- El objetivo del 15% de error en abstención es una tasa observada en datos de desarrollo, no una garantía, y no se traslada a otros datos sin reajuste.
- Cuando el modelo se abstiene sigue devolviendo una respuesta; el consumidor debe comprobar el flag de abstención.
- El vocabulario recortado a 32.768 filas implica que texto fuera de los dominios cubiertos puede consumir más tokens; las peticiones que exceden el presupuesto se rechazan en lugar de truncarse.
- Hereda los datos de entrenamiento, la auditoría de contaminación y los modos de fallo de QEV-2B v3.
- La puntuación en la mitad privada del board no se conoce todavía.
- El recorte de profundidad se validó con un depth probe propio; no hay evaluación independiente de que los bloques eliminados no aporten en dominios fuera de los evaluados.
- El ecosistema de despliegue es propietario (`qev`, `veyra`); no hay soporte documentado para runtimes estándar como vLLM o llama.cpp, lo que limita la portabilidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ken-jo/QEV-1.3B
- Modelo base: https://huggingface.co/ken-jo/QEV-2B
- Repositorio de código: https://github.com/ken-jo/qev
- Registros de resultados: https://huggingface.co/datasets/ken-jo/decision-index-results
