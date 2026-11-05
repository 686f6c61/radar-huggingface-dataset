# PrajwalAmte/saarthi-place-matcher

## Resumen

Saarthi place matcher es un modelo experimental de clasificación de pares (cross-encoder) desarrollado por PrajwalAmte dentro del proyecto Saarthi, una aplicación de viajes centrada en India. Su tarea es puntuar si dos registros de mapas describen el mismo lugar real, combinando el nombre, la categoría y la distancia geográfica entre ambos. Parte de la base sentence-transformers/all-MiniLM-L6-v2, cuyas seis capas de encoder se reutilizan y se ajustan como cross-encoder, con una cabeza clasificadora nueva que incorpora la distancia en escala logarítmica y un indicador de coincidencia de categorías.

El modelo resuelve un problema concreto de deduplicación de puntos de interés (POI) procedentes de fuentes heterogéneas como Overture Maps, Wikidata y OpenStreetMap. Con 22.565.763 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo pequeño y ligero, pensado para ejecutarse en hardware modesto. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

Es relevante ahora como ejemplo de enfoque pragmático: un cross-encoder diminuto con features geoespaciales explícitas, entrenado con etiquetas derivadas de reglas heurísticas en lugar de anotación humana. No obstante, el propio autor advierte de que no supera claramente a las reglas que pretendía sustituir, por lo que debe considerarse una prueba de concepto más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer (MiniLM de 6 capas) con cabeza clasificadora personalizada |
| Parametros totales | 22.565.763 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en 32 bits, safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (90 MB en 32 bits) |

## Arquitectura y entrenamiento

Se parte de all-MiniLM-L6-v2 (revisión `1110a243`), un transformer de 6 capas de encoder. Las capas se conservan y se ajustan como cross-encoder: cada par se procesa como `name (category)` para ambos lados. Una cabeza clasificadora nueva toma la salida del primer token y la combina con dos entradas adicionales: la distancia en escala logarítmica y un indicador booleano de si las categorías son idénticas.

El entrenamiento consistió en 400 pasos con batches de 32 pares (mitad de cada clase), optimizador AdamW con learning rate máximo de 5e-5, 10% de warm-up, weight decay de 0,01 y gradient clipping de 1,0. Se usó el framework Burn 0.22 en Rust sobre una GPU de Apple. Un segundo entrenamiento con la misma semilla produjo puntuaciones con una diferencia inferior a 0,000002, lo que indica alta reproducibilidad.

Los datos de entrenamiento son 19.332 pares de un registro fuente y un lugar mapeado. Las etiquetas no son anotaciones humanas, sino las decisiones de las reglas de matching de Saarthi, con un 90% de respuestas "same" y un 10% "different". Las fuentes son Overture Maps Places (18.406 pares), monumentos protegidos de Wikidata con números ASI (761) y OpenStreetMap (165). Los pares no se publican con el modelo.

## Capacidades

- Clasificación binaria de pares de registros de mapas: determina si dos entradas describen el mismo lugar.
- Integración de señales textuales (nombre, categoría) y geoespaciales (distancia) en una única puntuación.
- Puntuación de similitud utilizable para ranking de candidatos duplicados.
- Manejo de categorías como `restaurant`, `hotel` o `railway_station` dentro del esquema propio de Saarthi.
- Umbral de decisión calibrado en 0,154 sobre pares de calibración.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada: solo inglés y nombres mayoritariamente en script latino.

## Casos de uso

- Revisión asistida de duplicados en bases de datos de POI: el modelo puede ordenar candidatos por puntuación para que un operador humano confirme las fusiones, dado que aproximadamente una de cada cinco respuestas "same" resultó errónea en el test.
- Deduplicación de registros de monumentos protegidos: los pares con números ASI de Wikidata permiten cruzar catálogos oficiales con datos de Overture u OSM usando nombre, categoría y distancia.
- Enriquecimiento de datasets de viajes: integrar registros de Overture Maps con OSM para consolidar fichas de restaurantes y hoteles en una aplicación como Saarthi.
- Evaluación comparativa de pipelines de entity matching: sirve como baseline neuronal frente a reglas heurísticas o gradient boosting en problemas de resolución de entidades geoespaciales.
- Prototipado de sistemas de matching en Rust: al requerir el framework Burn y no cargar con `AutoModel` de transformers, es útil para equipos que ya trabajan con el ecosistema Rust.
- Filtrado previo en procesos de limpieza de datos geográficos: descartar pares claramente distintos antes de aplicar verificaciones más costosas, aceptando su baja precisión relativa.
- Investigación sobre aprendizaje a partir de reglas: caso de estudio de destilación de heurísticas en un cross-encoder pequeño y su comparación cuantitativa con el sistema original.

## Benchmarks y rendimiento

El test usó 254 pares reservados antes del entrenamiento, sin solapamiento de registros, lugares ni nombres con el conjunto de entrenamiento. De ellos, 198 recibieron respuesta (128 "same", 70 "different"). Los resultados están ponderados por el tamaño real de cada regla. Las etiquetas fueron del autor, con aproximadamente un 30% redactado por IA y revisado posteriormente.

| Sistema | Precision | Recall | F1 | Rango F1 95% | Ganancia F1 sobre reglas, 95% |
|---|---|---|---|---|---|
| Reglas actuales | 0,976 | 0,610 | 0,750 | 0,638–0,880 | n/a |
| Solo similitud de nombres | 0,653 | 0,916 | 0,762 | 0,636–0,882 | −0,219 a +0,205 |
| Gradient boosting | 0,904 | 0,803 | 0,850 | 0,726–0,957 | −0,064 a +0,244 |
| Este modelo | 0,781 | 0,897 | 0,835 | 0,714–0,945 | −0,116 a +0,262 |

No hay un ganador claro: el rango de ganancia de este modelo incluye el cero. Encuentra más coincidencias verdaderas que las reglas, pero genera bastantes más falsos positivos, y un modelo de gradient boosting simple obtiene una puntuación similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 265 MB de memoria en ejecución según el autor, con pesos de 90 MB en 32 bits.
- GPU recomendadas: no se especifican modelos concretos; el autor lo ejecutó en una GPU de Apple (Apple Silicon).
- Cabe en cualquier GPU consumer moderna por su reducido tamaño, aunque no se han publicado pruebas en GPUs NVIDIA o AMD.
- Opciones de despliegue: exclusivamente mediante el tool en Rust del repositorio Saarthi con el framework Burn 0.22; no es compatible con `AutoModel` de transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 54 pares por segundo en CPU y 66 pares por segundo en GPU, medidos en macOS sobre Apple Silicon. Linux no ha sido probado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saarthi place matcher | 22,5 M | no disponible | Matching de POI en India | Apache-2.0 | HuggingFace, requiere tool Rust |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens (típico en MiniLM) | Embeddings de frases | Apache-2.0 | HuggingFace, transformers |
| Gradient boosting (baseline del autor) | no disponible | n/a | Matching de POI | no disponible | No publicado |
| Reglas heurísticas de Saarthi | n/a | n/a | Matching de POI | n/a | Código en repositorio Saarthi |

La comparación más directa es con el modelo base MiniLM, del que hereda la arquitectura y que puede usarse como embedder para similitud coseno, y con el baseline de gradient boosting, que obtuvo un F1 de 0,850 frente al 0,835 de este modelo. No se dispone de comparación con otros cross-encoders especializados en entity matching geoespacial en la información proporcionada.

## Limitaciones y advertencias

- Ámbito geográfico restringido a India y a las categorías propias de Saarthi; otras categorías pueden comportarse de forma impredecible.
- Solo el 0,7% de los nombres de entrenamiento contenían caracteres no ASCII y el modelo base se entrenó en inglés, por lo que los nombres en escrituras indias no funcionan bien.
- Los 56 pares marcados como "unsure" (22% del test) se excluyeron de los resultados, por lo que la precisión en el mundo real puede ser inferior.
- El test es pequeño (198 respuestas), con rangos amplios que no permiten separar sistemas cercanos.
- Las etiquetas de entrenamiento son decisiones de reglas heurísticas, no anotaciones humanas, por lo que el modelo hereda sus errores.
- La comparación usa las reglas tal como estaban al exportar los pares; las reglas han cambiado desde entonces y su precisión no se ha vuelto a medir.
- El modelo no ve teléfonos, webs ni direcciones, por lo que no puede distinguir dos sucursales de una misma cadena.
- Las puntuaciones no son probabilidades: el entrenamiento balanceado las aleja de las tasas reales, de ahí el umbral tan bajo de 0,154. Deben usarse para ranking o con el umbral indicado.
- Solo se ha probado en macOS sobre Apple Silicon; Linux no está testeado.
- La licencia Apache-2.0 no altera los términos de los datos de origen (ODbL de OSM, CDLA, CC0); no ha habido revisión legal sobre si los pesos entrenados con nombres ODbL constituyen una base de datos derivada.
- El modelo no se usa en el sitio en producción de Saarthi y no ha superado claramente a las reglas manuales con las que se comparó.
- Los pesos no cargan con `AutoModel` de transformers; requieren el tool en Rust del repositorio Saarthi.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrajwalAmte/saarthi-place-matcher
- Repositorio Saarthi: https://github.com/PrajwalAmte/Saarthi-Travel-Unfolded
- Modelo base all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Framework Burn: https://burn.dev
- Overture Maps (atribución): https://docs.overturemaps.org/attribution/
- Wikidata, propiedad P1371 (números ASI): https://www.wikidata.org/wiki/Property:P1371
- OpenStreetMap (copyright): https://www.openstreetmap.org/copyright
