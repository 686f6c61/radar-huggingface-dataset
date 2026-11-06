# moneykoikoi/gemma4_engraft_physarum

## Resumen

`moneykoikoi/gemma4_engraft_physarum` es un repositorio de pesos alojado en Hugging Face por el usuario `moneykoikoi`, publicado bajo licencia Apache 2.0. Por el nombre se infiere que se trata de un modelo derivado de la familia Gemma (la referencia "gemma4" sugiere una variante de cuarta generación, aunque esto no está confirmado en la información disponible) sometido a algún tipo de proceso de "engraft" o injerto, combinado con el término "physarum", que remite a *Physarum polycephalum*, el moho mucilaginoso utilizado habitualmente como inspiración en computación bioinspirada y optimización de redes.

El repositorio tiene un tamaño de 2,5 GB, lo que es coherente con pesos en precisión reducida (por ejemplo, fp16 o bf16) de un modelo de aproximadamente 1.000 a 1.300 millones de parámetros, o con cuantizaciones de un modelo algo mayor. No obstante, esta estimación es una deducción a partir del tamaño del repo y no un dato confirmado por el autor.

La información disponible es extremadamente limitada: la model card no contiene más que la etiqueta de licencia, sin descripción, sin especificaciones técnicas, sin datos de entrenamiento ni benchmarks. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y no está asociado a ningún pipeline declarado. Se trata, por tanto, de un artefacto experimental o de investigación sin documentación pública verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (nombre sugiere base Gemma; sin confirmar) |
| Parámetros totales | no disponible (estimación indirecta: ~1.000–1.300 M por tamaño del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2,5 GB; formato no declarado) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. El nombre del repositorio sugiere una base de la familia Gemma, que emplea arquitecturas transformer decoder-only con atención multi-cabeza y mecanismos de atención local/global, pero no hay confirmación de que este repositorio conserve esa arquitectura ni de qué modificaciones introduce el proceso de "engraft".

Tampoco hay datos sobre el corpus de entrenamiento, número de tokens, composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o similares. El término "physarum" podría indicar un enfoque de entrenamiento o poda bioinspirado en el comportamiento de redes del moho *Physarum polycephalum*, pero esto es una especulación basada únicamente en la nomenclatura y no está respaldado por documentación.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No hay confirmación de soporte de tool calling ni function calling.
- No hay confirmación de capacidades de agente o razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay información sobre modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre técnicas de injerto de pesos ("engraft"): el modelo podría emplearse como objeto de estudio para reproducir o analizar el proceso de combinación de pesos descrito en el nombre, aunque no hay documentación que lo respalde.
- Experimentación con métodos bioinspirados: si el término "physarum" alude a optimización basada en redes de moho mucilaginoso, el artefacto podría servir como referencia en estudios comparativos de dichos métodos, siempre que el investigador valide previamente su comportamiento.
- Evaluación de modelos derivados de Gemma: útil para quienes estudian cómo se comportan variantes no oficiales de la familia Gemma frente al modelo base, con la cautela de que no hay métricas publicadas.
- Reproducción de experimentos académicos: el repositorio puede citarse como artefacto en trabajos que documenten procesos de modificación de pesos, aunque su falta de model card limita la reproducibilidad.
- Pruebas de robustez y análisis de sesgos: dado que no hay documentación, serviría como caso de estudio sobre la opacidad en la publicación de modelos y sus riesgos.
- No se recomienda su uso en producción sin una evaluación previa exhaustiva, dado que no existen benchmarks ni especificaciones verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de ~1.000–1.300 M de parámetros en fp16 se requerirían aproximadamente 2–3 GB de VRAM, y en cuantización de 4 bits en torno a 1 GB, pero estos cálculos son estimaciones indirectas basadas en el tamaño del repo y no en especificaciones confirmadas.
- GPU recomendadas: no disponible. Para el rango de tamaño estimado, una RTX 3060 de 12 GB o superior sería suficiente en teoría, pero no hay confirmación.
- Compatibilidad con GPU de consumo: probablemente sí para el rango estimado, sin confirmación oficial.
- Opciones de despliegue: no disponible. No se ha declarado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Documentación | Disponibilidad |
|---|---|---|---|---|---|
| moneykoikoi/gemma4_engraft_physarum | no disponible (~1.000–1.300 M estimados) | no disponible | Apache 2.0 | Prácticamente inexistente | Hugging Face, 0 descargas |
| Gemma 2 2B (Google) | 2.600 M | 8.192 tokens | Gemma Terms of Use | Model card completa y benchmarks | Amplia |
| Qwen2.5 1.5B (Alibaba) | 1.540 M | 32.768 tokens | Apache 2.0 | Model card completa y benchmarks | Amplia |
| Phi-3-mini (Microsoft) | 3.800 M | 4.096 tokens (128K en variante) | MIT | Model card completa y benchmarks | Amplia |

La comparación es aproximada: el modelo analizado no dispone de especificaciones verificables, por lo que la comparación se limita a modelos de rango de tamaño similar con documentación pública.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay información sobre arquitectura, entrenamiento, datos ni evaluación.
- Riesgo elevado de alucinación y comportamiento impredecible al no existir benchmarks ni evaluaciones publicadas.
- Sesgos desconocidos: sin documentación sobre la composición del dataset, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- Aunque la licencia es Apache 2.0, lo que permite uso comercial, la falta de documentación sobre el origen de los datos y los pesos hace recomendable una revisión legal antes de un despliegue comercial.
- El proceso de "engraft" no está descrito; podría implicar modificaciones que afecten a la estabilidad o coherencia del modelo.
- Cero descargas y cero interacciones: no hay evidencia de validación por parte de la comunidad.
- No apto para producción sin una evaluación independiente exhaustiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moneykoikoi/gemma4_engraft_physarum
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
