# ken-jo/QEV-0.5B

## Resumen

QEV-0.5B es un modelo de decisión multimodal desarrollado por ken-jo, publicado originalmente como QEV-0.8B-compact. No es un modelo generativo al uso: recibe evidencia (texto y hasta cuatro imágenes) junto con un conjunto de opciones candidatas y devuelve, en un único forward pass y sin generar tokens, una probabilidad calibrada para cada opción, una respuesta tipada y un indicador de abstención independiente. Está pensado para tareas de clasificación zero-shot y selección entre alternativas donde la latencia y la memoria son críticas.

El modelo se obtiene podando QEV-0.8B v3: el transformer de lenguaje se corta tras el bloque 16 de 24 y el vocabulario de entrada se reduce de 248.320 a 32.768 filas. El resultado son 466.313.408 parámetros (55% del modelo padre), con una pérdida de solo 0,18 puntos en el índice público de decisión visual de su suite interna. Conserva el encoder de visión Qwen3.5 congelado y el proyector del modelo original.

Es relevante porque demuestra que un modelo de decisión puede ejecutarse en una GPU de consumo de 8 GB con latencias de decenas de milisegundos, manteniendo calibración explícita y capacidad de abstención. Su licencia Apache 2.0 y su formato de checkpoint con verificación de integridad lo hacen apto para despliegues en producción con requisitos de memoria ajustados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder de visión Qwen3.5 congelado, proyector y LM podado (bloques 1-16 de 24) con cabeza de lectura de opciones |
| Parámetros totales | 466.313.408 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada; hasta 4 imágenes de 1.638.400 píxeles cada una |
| Tipos de cuantización | no disponible (entrenado y servido en bf16) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato de backbone empaquetado (`manifest.json` `format_version` 3, verificación SHA-256) |

## Arquitectura y entrenamiento

QEV-0.5B es una poda estructurada de QEV-0.8B v3. El encoder de visión y el proyector se mantienen intactos (encoder Qwen3.5 congelado). El modelo de lenguaje conserva los bloques 1 a 16 de 24 y la normalización final, eliminando los bloques 17 a 24. El vocabulario de entrada se recorta a 32.768 filas de las 248.320 originales, manteniendo todos los tokens producidos en los prompts de entrenamiento y desarrollo, los tokens especiales y de byte, y las fusiones necesarias para construirlos, con un tokenizador de byte-fallback reescrito y un `vocab-map.json`.

La cabeza de lectura opera en el bloque 16: cuatro ranuras de razonamiento, una vista de decisión y una cabeza de enlace condicionada de rango 64, destilada desde la cabeza de profundidad completa sobre las preguntas de entrenamiento y seleccionada únicamente con datos de desarrollo. La temperatura y los umbrales de abstención se reajustaron sobre las 3.000 filas del Calibration DEV de la release, con el mismo procedimiento que v3: minimización de NLL en una mitad y selección del umbral de abstención en la otra, sin usar filas de la suite pública ni del holdout. No se dispone de información sobre el volumen total de tokens de entrenamiento ni sobre la composición del dataset más allá de lo indicado en la model card del modelo padre.

## Capacidades

- Decisión tipada sobre opciones dadas: devuelve una probabilidad calibrada por opción, una respuesta tipada y un flag de abstención separado en un solo forward pass.
- Clasificación zero-shot multimodal: texto e imágenes como evidencia, con hasta cuatro imágenes por petición.
- Tres tipos de salida con calibración específica: `choice`, `score` y `noul`, cada uno con su temperatura y umbral de abstención.
- Extracción de campos en documentos: alto rendimiento en KIE (CORD+FUNSD, 92,1 puntos en la suite pública).
- Selección de elementos de interfaz para agentes: Mind2Web con 76,7 puntos.
- Verificación de correspondencia imagen-texto: Winoground con 50,8 puntos.
- Abstención calibrada: cobertura del 68,8% con tasa de error observada ≤15% en el tipo `noul`.
- No soporta generación libre de texto, tool calling ni razonamiento multi-paso generativo; su salida es siempre una decisión sobre opciones predefinidas.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un texto de incidencia y un conjunto cerrado de categorías, el modelo devuelve la probabilidad de cada categoría y un flag de abstención para derivar a revisión humana los casos dudosos, con latencias de decenas de milisegundos.
- Extracción de campos en recibos y formularios: con KIE en 92,1 puntos sobre CORD+FUNSD, se puede usar para mapear regiones de un documento escaneado a campos tipados concretos, aprovechando el modo `accurate` con imágenes de hasta 1,6 MP.
- Selección de elementos en automatización de interfaz: para agentes que operan sobre pantallas, el modelo elige entre los elementos candidatos de la UI (Mind2Web, 76,7 puntos) sin generar texto, lo que reduce la latencia del bucle del agente.
- Verificación de coincidencia imagen-texto en pipelines de moderación asistida: comparar pares imagen-descripción y obtener una probabilidad calibrada, con la advertencia de que la habilidad de moderación es baja (~28 puntos) y requiere revisión humana.
- Clasificación zero-shot en entornos con GPU de 8 GB: despliegue en una RTX 4060 Ti con 1,15 GiB de memoria pico en bf16, adecuado para servicios de clasificación de bajo coste.
- Control de calidad en pipelines de datos: validar si una imagen cumple un criterio entre varias opciones definidas, con abstención cuando la confianza es insuficiente, para no propagar etiquetas erróneas.
- Tareas de sí/no con evidencia visual: por ejemplo, comprobar si un formulario está firmado o si un producto coincide con una referencia, usando el tipo `choice` con temperatura 1,059 y ECE de 0,032.

## Benchmarks y rendimiento

Resultados de la mitad pública de la suite de visión del JEV Decision Index (12.210 filas, 11 benchmarks), ejecutados por el autor con el kit público y el motor oficial:

| Modelo | Parámetros | Índice público de visión | Intervalo bootstrap 95% |
|---|---:|---:|---|
| QEV-0.5B | 466M | 52,52 | 51,0 a 54,2 |
| QEV-0.8B v3 | 853M | 52,70 | no disponible |

Desglose por benchmark (puntos de habilidad públicos, peso entre paréntesis):

| Benchmark | QEV-0.5B | QEV-0.8B |
|---|---:|---:|
| CV-Bench (1) | 59,9 | 58,7 |
| BLINK (1) | 30,6 | 31,4 |
| RealWorldQA (1) | 40,9 | 40,1 |
| CharXiv (1) | 55,1 | 55,6 |
| InfographicVQA (1) | 68,9 | 70,0 |
| Mind2Web (1) | 76,7 | 77,5 |
| Winoground (1) | 50,8 | 51,3 |
| KIE, CORD+FUNSD (1) | 92,1 | 91,7 |
| Moderation, Hateful Memes (1) | 28,4 | 28,0 |
| R-Bench-M (0,5) | 13,9 | 15,7 |
| MMMU-Pro vision (0,25) | 7,6 | 8,6 |

Rendimiento y memoria (RTX 4060 Ti 8 GB, batch 1, bf16, 47 perfiles de petición con hasta 16 opciones a resolución completa, 3 de calentamiento y 30 ejecuciones cronometradas por perfil):

| Modelo | p95 peor caso | p50 mediana | Memoria GPU pico |
|---|---:|---:|---:|
| QEV-0.5B | 273,6 ms | 54,4 ms | 1,15 GiB |
| QEV-0.8B v3, modo accurate | 331,3 ms | 62,9 ms | 1,86 GiB |

Calibración y abstención (refit sobre 3.000 filas de Calibration DEV):

| Tipo | Temperatura | Abstención por debajo de | Precisión (mitad de política) | ECE | Cobertura |
|---|---:|---:|---:|---:|---:|
| choice | 1,059 | 0,312 | 86,3% | 0,032 | 100% |
| score | 0,891 | 0,471 | 89,9% | 0,087 | 100% |
| noul | 0,866 | 0,747 | 76,3% | 0,109 | 68,8% |

## Requisitos de hardware

- VRAM estimada: 1,15 GiB de memoria GPU pico en bf16 con batch 1, según medición del autor en RTX 4060 Ti 8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el autor valida RTX 4060 Ti 8 GB. Para mayor throughput, A100 o H100 no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 4060 Ti 8 GB y presumiblemente en cualquier GPU consumer con 4 GB o más, aunque solo la 4060 Ti está validada explícitamente.
- Opciones de despliegue: `QEVEngine` del paquete `qev` (instalación desde el repositorio GitHub en el commit `e091f7ae8c6f064860d59be560faa27f0387ff35`) o carga directa con `veyra.option_model.OptionModel.load(path, device="cuda")` sobre un snapshot descargado. Solo modo `accurate`; el modo `fast` no se ofrece.
- Latencia y throughput: p95 peor caso de 273,6 ms y mediana p50 de 54,4 ms en RTX 4060 Ti 8 GB con batch 1. No se publican cifras de throughput con batch mayor.
- Requisito de integridad: el loader verifica el SHA-256 de cada archivo bajo `backbone/` y rechaza archivos ausentes, extra o modificados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público de visión | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| QEV-0.5B | 466M | 8.192 tokens, 4 imágenes | 52,52 | Apache 2.0 | Hugging Face |
| QEV-0.8B v3 | 853M | no disponible | 52,70 | Apache 2.0 | Hugging Face |
| Modelos de clasificación zero-shot multimodales comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparaciones con modelos de otras familias. La única referencia directa es su modelo padre QEV-0.8B v3, del que es una poda con pérdida de 0,18 puntos en el índice público y reducción del 45% en parámetros y del 38% en memoria GPU pico.

## Limitaciones y advertencias

- No apto para moderación automática de contenido ni para decisiones sobre personas sin revisión humana: la habilidad en Hateful Memes es de aproximadamente 28 puntos.
- No debe usarse para decisiones médicas, legales o financieras.
- No soporta generación libre de texto ni lenguajes distintos del inglés.
- El objetivo de 15% de error en abstención es una tasa observada en datos de desarrollo del autor, no una garantía, y no se traslada a otros datos sin reajuste.
- Cuando el modelo se abstiene, aun así devuelve una respuesta; el consumidor debe comprobar el flag de abstención.
- El vocabulario recortado hace que texto fuera de los dominios cubiertos consuma más tokens; las peticiones que exceden el presupuesto se rechazan, nunca se truncan.
- Hereda los datos de entrenamiento, la auditoría de contaminación y los modos de fallo de QEV-0.8B v3.
- La puntuación en la mitad privada del JEV Decision Index no se conoce todavía; solo hay resultados de la mitad pública ejecutados por el propio autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.
- La suite de benchmarks es interna del autor (JEV Decision Index), no un estándar de la comunidad, lo que limita la comparabilidad con otros modelos.

## Enlaces

- [Modelo en Hugging Face: ken-jo/QEV-0.5B](https://huggingface.co/ken-jo/QEV-0.5B)
- [Modelo base: ken-jo/QEV-0.8B](https://huggingface.co/ken-jo/QEV-0.8B)
- [Dataset de resultados: ken-jo/decision-index-results](https://huggingface.co/datasets/ken-jo/decision-index-results)
- [Repositorio del paquete qev en GitHub](https://github.com/ken-jo/qev)
