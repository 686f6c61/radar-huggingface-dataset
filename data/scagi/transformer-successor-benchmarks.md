# ScAGI/transformer-successor-benchmarks

## Resumen

`ScAGI/transformer-successor-benchmarks` no es un modelo de lenguaje entrenado ni un artefacto listo para inferencia: es un repositorio de resultados de investigación que documenta una comparación controlada entre arquitecturas sobre un corpus de bytes. Lo publica el colectivo ScAGI bajo las etiquetas `architecture-research`, `benchmarks` y `reproducibility`, y su objetivo declarado es medir, con parámetros aproximadamente igualados, si una arquitectura neuronal (GRU o Transformer) supera a un modelo de conteo de n-gramas en la tarea de predecir el siguiente byte.

El contenido principal es el piloto P028, que enfrenta un modelo de conteo de n-gramas (orden 8, suavizado alpha 50), una GRU de 164.864 parámetros, un Transformer de dos capas, anchura 72 y cuatro cabezas con 172.624 parámetros, y las mezclas de conteo con cada red neuronal. La métrica central es bits por byte (bpb) sobre la cola oficial del test de WikiText-2 raw (32 KiB, 254 fragmentos, 16.256 objetivos puntuados), junto con latencias medidas en una GTX 1660 SUPER.

Es relevante ahora porque ejemplifica una práctica poco frecuente: publicar resultados negativos o ambiguos con semillas múltiples, intervalos de incertidumbre y advertencias explícitas sobre qué no demuestran los datos. El propio autor aclara que no es un "Transformer successor" demostrado, que no hay pesos ni datasets publicados y que el índice personalizado que propone solo describe esta carga de trabajo concreta de predicción de siguiente byte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de benchmarks; incluye GRU, Transformer (2 capas, anchura 72, 4 cabezas) y modelo de conteo de n-gramas de orden 8 |
| Parametros totales | GRU: 164.864; Transformer: 172.624 (P028). En P026 el Transformer tenía 478.720 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 bytes en entrenamiento y evaluación |
| Tipos de cuantizacion | No disponible (no se publican pesos) |
| Idiomas soportados | No disponible (trabaja sobre bytes, no sobre tokens lingüísticos) |
| Licencia | No disponible |
| Formato de pesos | No disponible; el repositorio no publica pesos, solo métricas en JSON y tablas Markdown |

## Arquitectura y entrenamiento

El piloto P028 entrena cada modelo neuronal con exactamente 524.288 bytes de entrenamiento, lotes de 16, contexto de 128 y flujos de bytes con desplazamiento de lote emparejado. La selección de hiperparámetros se hizo con la semilla de desarrollo 11, explorando tasas de AdamW de 0,0005, 0,002 y 0,008 y presupuestos de 1.000 y 3.000 actualizaciones; ambos modelos seleccionaron 0,002 y 3.000 actualizaciones, lo que equivale a 6.144.000 presentaciones de objetivos por ejecución final. Las semillas finales son 101, 103 y 107.

El Transformer es un modelo de dos capas, anchura 72 y cuatro cabezas de atención, con 172.624 parámetros, un 4,707 % más que la GRU de referencia; el autor advierte que los parámetros están aproximadamente igualados, no exactamente, y que los FLOPs no están igualados. El modelo de conteo es un n-grama suavizado de hasta 8 bytes con retroceso, con tablas de aproximadamente 19,93 MB, ejecutado en CPU mientras las redes neuronales corren en CUDA. La innovación metodológica destacable no es arquitectónica sino de evaluación: mezclas de conteo con redes neuronales, diferencias pareadas por semilla, cribado de duplicados exactos de 129 bytes contra entrenamiento y contra el test de P026, y un diagnóstico separado de fuga de máscara (P027) que marca como inválida una puntuación con atención al futuro.

## Capacidades

- Predicción de siguiente byte sobre flujos de texto codificados en UTF-8, no generación de lenguaje natural.
- Comparación controlada de arquitecturas con parámetros aproximadamente igualados.
- Mezcla de modelos: combinación de un modelo de conteo con una red neuronal para mejorar la log-verosimilitud.
- Evaluación con múltiples semillas y reporte de diferencias pareadas.
- Diagnóstico de fuga de información futura en atención causal.
- Publicación de métricas legibles por máquina en JSON, con fórmula del índice y entradas por semilla.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Reproducción de resultados de investigación: el JSON incluido permite recalcular el índice y las diferencias pareadas sin depender de las tablas del README.
- Auditoría metodológica de benchmarks: sirve como ejemplo de cómo reportar resultados ambiguos con tres semillas en lugar de una sola ejecución.
- Estudio de líneas base de n-gramas: el modelo de conteo de orden 8 con suavizado alpha 50 puede replicarse en CPU para comparar con modelos neuronales pequeños.
- Docencia sobre evaluación de modelos: el diagnóstico P027 de fuga de máscara es un caso práctico de por qué una puntuación con atención al futuro es inválida.
- Diseño de experimentos con presupuesto ajustado: la selección de tasa de aprendizaje y actualizaciones sobre datos de desarrollo, sin tocar test, es un patrón reutilizable.
- Investigación en arquitecturas eficientes: las latencias medidas con prefijo completo de 128 bytes permiten estudiar el coste de mezclar modelos de conteo con redes neuronales en hardware de gama baja.
- Verificación de afirmaciones sobre "sucesores del Transformer": el repositorio documenta explícitamente que no demuestra superioridad amplia, útil para contrastar titulares.

## Benchmarks y rendimiento

Resultados del piloto P028 sobre la cola de 32 KiB del test oficial de WikiText-2 raw (16.256 objetivos puntuados). Menos bpb y menos latencia es mejor.

| Modelo | bpb de test | Latencia (ms) | Índice personalizado |
|---|---:|---:|---:|
| Counts | 2,424530 | 0,084968 | 100,000 |
| GRU | 2,543230 | 0,293541 | 51,633 |
| Counts + GRU | 2,343964 | 0,396542 | 47,600 |
| Counts + Transformer | 2,351676 | 0,820309 | 33,007 |
| Transformer | 2,677182 | 0,713362 | 31,619 |

Calidad por semilla en P028:

| Semilla | GRU bpb | Transformer bpb | Counts + GRU bpb | Counts + Transformer bpb |
|---|---:|---:|---:|---:|
| 101 | 2,541732 | 2,670399 | 2,341508 | 2,348494 |
| 103 | 2,545003 | 2,670493 | 2,350639 | 2,349275 |
| 107 | 2,542957 | 2,690654 | 2,339746 | 2,357259 |

La mezcla con GRU supera a la mezcla con Transformer en 0,007712 bpb de media, pero las diferencias pareadas son -0,006986, +0,001363 y -0,017512: una semilla favorece al Transformer. La precisión de Counts es 52,8297 %, la de la mezcla con GRU 52,8584 % y la de la mezcla con Transformer 52,6308 %.

Cohorte anterior P026 (tres semillas por arquitectura y corpus, 1.000 actualizaciones, contexto 128):

| Corpus | Counts bpb | GRU bpb | Transformer bpb | Counts + GRU bpb | Counts + Transformer bpb |
|---|---:|---:|---:|---:|---:|
| wikitext2 | 2,477984 | 2,742733 | 2,911345 | 2,397077 | 2,419358 |
| tinyshakespeare | 2,695707 | 2,767025 | 3,068588 | 2,555412 | 2,597795 |

Cohorte P025, solo código Python (cuatro módulos, 4.096 objetivos, tres semillas): Counts 3,134211 bpb; Counts + GRU 2,975992 bpb; Counts + Transformer 3,008238 bpb.

Diagnóstico P027 de fuga de máscara: atención causal 3,846 bpb, evaluación honesta sin máscara 3,976 bpb, evaluación con fuga al futuro 3,809 bpb (puntuación inválida, no debe entrar en rankings).

## Requisitos de hardware

- Los modelos neuronales del piloto se ejecutaron en una GTX 1660 SUPER; el modelo de conteo corrió en CPU.
- VRAM estimada: no disponible de forma explícita; con 164.864 y 172.624 parámetros, los pesos en fp32 ocupan menos de 1 MB, por lo que caben en cualquier GPU consumer.
- Las tablas de conteo ocupan aproximadamente 19,93 MB y no están igualadas en memoria con los pesos neuronales.
- Latencia medida: 0,084968 ms para Counts, 0,293541 ms para GRU, 0,396542 ms para Counts + GRU, 0,713362 ms para Transformer y 0,820309 ms para Counts + Transformer. Son medianas de lote 1 con prefijo completo de 128 bytes, 20 llamadas cronometradas por ejecución, no generación con caché KV ni latencias de servicio en red.
- Opciones de despliegue: no aplica; no se publican pesos ni artefactos de inferencia. El repositorio solo contiene métricas y documentación.

## Comparativa con modelos similares

No hay modelos de lenguaje comparables en el sentido habitual, porque este repositorio no contiene un modelo desplegable. La comparación relevante es interna, entre las arquitecturas evaluadas en el propio piloto:

| Candidato | Parámetros | Contexto | bpb P028 | Latencia (ms) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Counts (n-grama orden 8) | Tablas de ~19,93 MB | 8 bytes de historial | 2,424530 | 0,084968 | No disponible | Solo métricas |
| GRU | 164.864 | 128 bytes | 2,543230 | 0,293541 | No disponible | Solo métricas |
| Transformer (2 capas, 4 cabezas) | 172.624 | 128 bytes | 2,677182 | 0,713362 | No disponible | Solo métricas |
| Counts + GRU | Mixto | 128 bytes | 2,343964 | 0,396542 | No disponible | Solo métricas |
| Counts + Transformer | Mixto | 128 bytes | 2,351676 | 0,820309 | No disponible | Solo métricas |

## Limitaciones y advertencias

- El propio autor declara que no es un modelo listo para inferencia ni un sucesor del Transformer demostrado; no hay pesos ni datasets publicados.
- El índice personalizado no mide capacidad, memoria, economía ni superioridad amplia; solo describe la carga de trabajo de predicción de siguiente byte con prefijo completo, y otros pesos pueden alterar el ranking.
- Solo tres semillas: no establecen superioridad amplia, y una de ellas favorece a la arquitectura contraria a la media.
- Los parámetros están aproximadamente igualados, no exactamente, y los FLOPs no están igualados; las comparaciones entre arquitecturas no son de cómputo equivalente.
- Las tablas de conteo no están igualadas en memoria con los pesos neuronales.
- El cribado de duplicados exactos de 129 bytes no garantiza disjunción semántica ni por artículo; los flujos de bytes pueden cruzar fronteras entre artículos.
- Las latencias son medianas de 20 llamadas con lote 1 y no establecen una p95 de producción; no incluyen caché KV ni servicio en red.
- El proceso RSS es un máximo acumulado, no RAM por modelo.
- Las puntuaciones absolutas de P026 y P028 no son comparables como ganancias controladas, porque cambiaron el cohorte de test y la receta de entrenamiento.
- P025 (solo código), P026 y P028 no deben clasificarse conjuntamente en una única tabla.
- La puntuación con fuga al futuro de P027 es inválida y no debe entrar en rankings.
- No hay información sobre sesgos lingüísticos, alucinación o restricciones de licencia comercial; la licencia figura como no disponible.
- La documentación no concede una nueva licencia sobre los datasets subyacentes ni sobre el código de investigación original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ScAGI/transformer-successor-benchmarks
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
