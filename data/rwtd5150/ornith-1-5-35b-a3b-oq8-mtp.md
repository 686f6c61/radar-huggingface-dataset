# rwtd5150/Ornith-1.5-35B-A3B-oQ8-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ8-mtp es una publicación alojada en Hugging Face bajo el identificador `rwtd5150/Ornith-1.5-35B-A3B-oQ8-mtp`. El nombre sugiere un modelo de arquitectura Mixture of Experts (MoE) de 35 mil millones de parámetros totales con aproximadamente 3 mil millones de parámetros activos por token, cuantizado en un formato que la nomenclatura identifica como "oQ8" (probablemente una cuantización de 8 bits) y con soporte de "mtp" (multi-token prediction). Sin embargo, la model card publicada no contiene más que la línea de licencia, por lo que no es posible confirmar ninguno de estos extremos a partir de la información disponible.

El repositorio no incluye pipeline declarado, idiomas soportados, descripción de arquitectura, datos de entrenamiento ni resultados de benchmarks. Tampoco registra descargas ni interacciones en el momento de la consulta, lo que apunta a una publicación reciente o de muy baja difusión. La licencia declarada es MIT, lo que en principio permitiría uso comercial amplio, aunque la ausencia de documentación técnica impide verificar las condiciones reales del modelo subyacente.

Por todo ello, esta ficha debe interpretarse como un registro de lo que se puede afirmar con certeza (identificador, autor, licencia y fecha) y de lo que queda explícitamente sin confirmar. Cualquier evaluación de idoneidad para producción requeriría inspeccionar los pesos y los archivos del repositorio, algo que la información proporcionada no permite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE; sin confirmar) |
| Parametros totales | no disponible (el nombre sugiere 35B; sin confirmar) |
| Parametros activos | no disponible (el nombre sugiere 3B; sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el sufijo "oQ8" sugiere 8 bits; sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el sufijo "mtp" sugiere multi-token prediction; sin confirmar) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo. La model card se limita a declarar la licencia MIT y no describe si se trata de un transformer denso, un Mixture of Experts, un modelo híbrido con capas de estado o cualquier otra variante. El identificador del repositorio incluye los fragmentos "35B-A3B", que en la convención habitual de nombres de modelos MoE indicarían 35 mil millones de parámetros totales y 3 mil millones activos, y "mtp", que en algunas publicaciones recientes designa cabezales de predicción multi-token para decodificación especulativa. Ninguno de estos extremos está documentado por el autor.

Tampoco se dispone de datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni sobre innovaciones técnicas concretas más allá de lo que sugiere el nombre del repositorio. Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto: no confirmada por documentación del autor; presumible en un modelo de lenguaje, pero sin verificación.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Predicción multi-token: el sufijo "mtp" del identificador podría indicarlo, pero no está documentado.

## Casos de uso

No es posible recomendar casos de uso concretos con rigor, dado que no se ha publicado información sobre capacidades, contexto, idiomas ni rendimiento. Los siguientes escenarios son únicamente hipótesis condicionadas a que el modelo se comporte como sugiere su nombre, y en ningún caso deben tomarse como validados:

- Inferencia en hardware limitado: si se confirma una arquitectura MoE de 35B totales con 3B activos, el coste computacional por token sería bajo en comparación con un modelo denso del mismo tamaño, lo que permitiría desplegarlo en GPUs de gama alta para consumidores con cuantización de 8 bits. Sin datos de contexto ni de calidad, no se puede garantizar su idoneidad.
- Servicio de chat multi-turno: requeriría conocer la ventana de contexto, que no está documentada; sin ese dato no se puede dimensionar la memoria KV ni el número de turnos viables.
- Generación de código en pipelines: imposible de evaluar sin benchmarks de HumanEval o similares y sin confirmación de soporte de tool calling.
- Procesamiento por lotes de documentos: dependería de la longitud de contexto y de los idiomas soportados, ambos no disponibles.
- Fine-tuning sobre dominio específico: la licencia MIT facilitaría en principio la adaptación y el uso comercial, pero la falta de documentación sobre el modelo base y sus datos de entrenamiento impide evaluar riesgos de sesgo o contaminación.
- Despliegue en producción: sin benchmarks, sin model card técnica y sin comunidad verificable (cero descargas, cero likes), no es un candidato recomendable para entornos productivos sin una evaluación interna exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con certeza. Si se confirmara un MoE de 35B totales cuantizado a 8 bits, el peso de los parámetros ocuparía del orden de 35 GB, a los que habría que sumar la memoria KV y los buffers de activación; sin conocer la longitud de contexto ni el número de capas, no se puede dar una cifra fiable.
- GPU recomendadas: no disponible. Un modelo de ese tamaño en 8 bits requeriría probablemente GPUs con 48 GB o más de VRAM (A6000, L40S, A100 80GB, H100) para inferencia cómoda, pero es una estimación condicionada al nombre del repositorio.
- Viabilidad en GPU de consumidor: incierta. Una RTX 4090 con 24 GB no podría alojar 35B parámetros a 8 bits sin offloading a memoria del sistema; una cuantización más agresiva (4 bits) sí podría, pero no está confirmada su disponibilidad en este repositorio.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores. El sufijo "mtp" podría implicar requisitos específicos de decodificación especulativa no soportados por todos los frameworks.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque no se conocen los parámetros reales, el contexto, el rendimiento ni los idiomas del modelo. A modo de referencia estructural, se indican alternativas de la misma categoría nominal (MoE de ~30-40B totales con pocos parámetros activos), sin que ello implique equivalencia funcional:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ8-mtp | no disponible (nombre sugiere 35B) | no disponible (nombre sugiere 3B) | no disponible | MIT | Repositorio Hugging Face, sin descargas registradas |
| Qwen3-30B-A3B | 30B | 3B | 128K (según documentación pública del modelo) | Apache 2.0 | Ampliamente disponible |
| Mixtral 8x7B | 46,7B | 12,9B | 32K (según documentación pública del modelo) | Apache 2.0 | Ampliamente disponible |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K (según documentación pública del modelo) | MIT (código) / licencia propia (pesos) | Ampliamente disponible |

Los datos de las filas comparativas corresponden a documentación pública de esos modelos; los de la primera fila son estimaciones derivadas del nombre del repositorio y no están confirmados por el autor.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe arquitectura, datos de entrenamiento, idiomas ni rendimiento, lo que impide cualquier evaluación técnica seria.
- Riesgo de alucinación: desconocido, pero sin benchmarks ni evaluación publicada no hay evidencia de robustez factual.
- Sesgos: no evaluados ni documentados; la ausencia de información sobre el corpus de entrenamiento impide estimar sesgos de género, idioma o dominio.
- Limitaciones de contexto e idioma: no disponibles; no se declara ninguna ventana de contexto ni conjunto de idiomas.
- Licencia: se declara MIT, lo que permitiría uso comercial y modificación, pero conviene verificar que el autor original de los pesos tenga derecho a relicenciarlos bajo MIT, dado que el repositorio parece una republicación o cuantización de un modelo previo.
- Procedencia incierta: el identificador del autor (`rwtd5150`) y la ausencia de descargas o interacciones no permiten verificar la cadena de custodia del modelo ni la integridad de los pesos.
- Producción: no recomendable sin una evaluación interna previa que cubra calidad, latencia, seguridad y comportamiento en el dominio objetivo.
- Fecha de creación futura: el repositorio figura creado el 2026-11-17, lo que puede indicar un error de metadatos o una publicación programada; conviene contrastarlo antes de confiar en cualquier dato del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/rwtd5150/Ornith-1.5-35B-A3B-oQ8-mtp
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
