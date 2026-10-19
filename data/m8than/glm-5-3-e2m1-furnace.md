# m8than/GLM-5.3-E2M1-Furnace

## Resumen

GLM-5.3-E2M1-Furnace es una conversión de cuantización del modelo zai-org/GLM-5.3, publicada por el usuario m8than. No se trata de un modelo entrenado desde cero, sino de un artefacto de pesos empaquetados en formato E2M1 (coma flotante de 4 bits) aplicado selectivamente a los expertos enrutados de una arquitectura de mezcla de expertos (MoE), manteniendo atención y expertos compartidos en mayor precisión. El repositorio ocupa 251,6 GB e incluye también el módulo MTP (multi-token prediction) nativo del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un intento de reducir el coste de memoria de un modelo de gran tamano mediante FP4 en las capas de expertos, una técnica cada vez más habitual para servir MoE de gran escala en menos GPUs. Por otro, el propio autor advierte en la model card de que la conversión y la subida están en curso y de que el repositorio todavía no es un checkpoint completo ni cargable, por lo que no debe utilizarse en producción.

La información publicada es muy limitada: no se declaran parámetros totales ni activos, longitud de contexto, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja únicamente lo que consta en la model card y en los metadatos de HuggingFace, y marca explícitamente como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados y expertos compartidos, según la model card; detalles de la arquitectura base no disponibles |
| Parametros totales | No disponible (estimación no verificada: cota superior de ~500 000 millones si todos los pesos estuvieran a 4 bits; ver nota) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Expertos enrutados empaquetados en E2M1 (FP4, 4 bits); atención y expertos compartidos en mayor precisión (valor no especificado) |
| Idiomas soportados | No disponible |
| Licencia | "other", con license_name "glm-5.3"; el repo incluye el archivo LICENSE con la licencia y el aviso de copyright del modelo original |
| Formato de pesos | Pesos empaquetados E2M1 dentro de un repo de 251,6 GB; el formato de serialización no se explicita en la model card. Requiere soporte de Furnace para `moe_e2m1` |

Nota sobre la estimación de parámetros: 251,6 GB a 4 bits por peso equivalen a un máximo aproximado de 5,0 × 10^11 parámetros. Dado que atención y expertos compartidos se guardan en mayor precisión (8 o 16 bits), el número real de parámetros sería sensiblemente inferior. Es una estimación derivada del tamano del repositorio, no un dato publicado.

## Arquitectura y entrenamiento

El modelo base es zai-org/GLM-5.3, del que esta publicación es una cuantización (relación `quantized` declarada en los metadatos). La model card indica que se trata del GLM-5.3 completo y no de la variante GLM-5.3-Flash, y que la conversión afecta a los expertos enrutados, empaquetados en E2M1, mientras que la atención y los expertos compartidos conservan mayor precisión. También se preserva el módulo MTP nativo, lo que sugiere que el modelo original incorpora predicción multi-token, probablemente orientada a decodificación especulativa, aunque la model card no lo detalla.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, las etapas de alineación (RLHF, DPO u otras) ni innovaciones de atención o de enrutamiento más allá de lo mencionado. Tampoco se documenta la metodología exacta de cuantización: no se especifica si hubo calibración con datos, qué esquema de escalas se usa (por canal, por grupo o por tensor), ni qué error de reconstrucción se midió. El autor sí indica un requisito técnico concreto: hace falta soporte de Furnace para la ruta `moe_e2m1`, es decir, el checkpoint no es cargable con runtimes estándar que no implementen ese kernel.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`; no se documentan capacidades específicas adicionales.
- Razonamiento, código y matemáticas: no disponibles en la información proporcionada (presumiblemente heredadas del modelo base, sin confirmar).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidad especial: incluye el módulo MTP (multi-token prediction) nativo del modelo original, conservado tras la conversión.
- Estado del artefacto: la model card indica que la conversión está en curso y que el repositorio aún no es un checkpoint completo ni cargable, por lo que ninguna capacidad es verificable hasta que finalice la subida.

## Casos de uso

- Evaluación de la pérdida de calidad por cuantización FP4: comparar las salidas de este checkpoint con las del GLM-5.3 original sobre un conjunto de evaluación propio, para medir la degradación atribuible al empaquetado E2M1 en los expertos enrutados.
- Servicio de inferencia con memoria limitada: si el checkpoint se completa, reducción de la huella de pesos de los expertos enrutados de forma aproximada a la mitad frente a FP8, lo que permitiría desplegar el modelo en un nodo con menos GPUs o liberar VRAM para caché KV y ampliar el lote.
- Investigación en kernels de cuantización: servir como caso de prueba real para implementar y validar la ruta `moe_e2m1` en Furnace u otros runtimes que quieran soportar expertos en FP4.
- Estudio de arquitecturas MoE con módulo MTP: analizar cómo interactúa la predicción multi-token con expertos de baja precisión, midiendo la tasa de aceptación de tokens especulados.
- Despliegue en clústeres de GPUs de gama alta para generación de texto a gran escala, una vez validada la calidad, aprovechando que solo los expertos enrutados pierden precisión.
- Reproducibilidad de conversiones: usar el repositorio y el commit del modelo origen citado como referencia para replicar el proceso de cuantización y comparar metodologías.
- Baseline en trabajos de compresión: punto de comparación frente a otras técnicas (GPTQ, AWQ, FP8, poda estructurada) aplicadas al mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K u otras), ni medidas de perplejidad, ni curvas de degradación respecto al modelo original, ni cifras de latencia o throughput. Tampoco se aportan datos del propio proceso de cuantización, como el error cuadrático medio de reconstrucción por capa.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 251,6 GB, por lo que solo los pesos requieren del orden de 252 GB de memoria. A ello hay que sumar caché KV, buffers de activación y el overhead del runtime, cantidades no especificadas.
- GPU recomendadas: no se indica ninguna configuración oficial. Por tamano, el despliegue exige múltiples aceleradores de centro de datos (por ejemplo, 4 × H100 80 GB o 4 × A100 80 GB como mínimo para los pesos, con margen escaso) o nodos con más GPUs para disponer de holgura de caché KV.
- GPUs de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 (24 GB) necesitaría más de diez unidades solo para los pesos, lo que descarta el despliegue en una sola tarjeta.
- Opciones de despliegue: la model card exige soporte de Furnace para `moe_e2m1`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI; sin esa ruta de kernel específica, el checkpoint no es cargable.
- Latencia y throughput: no disponibles. No hay medidas publicadas ni estimaciones del autor.
- Advertencia: el repositorio está incompleto según el propio autor, por lo que cualquier cálculo de despliegue es teórico hasta que finalice la conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de pesos | Licencia | Estado |
|---|---|---|---|---|---|
| m8than/GLM-5.3-E2M1-Furnace | No disponible (repo de 251,6 GB) | No disponible | E2M1 (FP4) en expertos enrutados; mayor precision en atencion y expertos compartidos | "other" (glm-5.3) | Conversion en curso, no cargable |
| zai-org/GLM-5.3 (modelo base) | No disponible | No disponible | Original (no cuantizado) | glm-5.3 | Publicado; commit de origen citado |
| zai-org/GLM-5.3-Flash | No disponible | No disponible | No disponible | No disponible | Variante distinta, explicitamente no cubierta por este repo |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la información proporcionada, por lo que no es posible una comparación cuantitativa. Tampoco se han identificado en la búsqueda web alternativas de terceros con especificaciones verificables para contrastar.

## Limitaciones y advertencias

- Checkpoint incompleto: la model card afirma literalmente que la conversión y la subida están en curso y que el repositorio no es todavía un checkpoint completo ni cargable. No debe usarse en producción ni en evaluaciones cuyos resultados se vayan a publicar.
- Dependencia de runtime: requiere soporte de Furnace para `moe_e2m1`; sin él, los pesos empaquetados no se pueden interpretar.
- Degradación por cuantización: los expertos enrutados se almacenan en FP4 (E2M1), el formato de menor rango dinámico de los habituales. No se han publicado mediciones del impacto en perplejidad, razonamiento o código, por lo que el riesgo de degradación es desconocido y debe evaluarse empíricamente.
- Ausencia total de datos de evaluación: sin benchmarks ni comparación con el modelo original, no hay base para afirmar que la calidad se mantiene.
- Sesgos y alucinación: no documentados. Al heredar el comportamiento del modelo base, arrastra los sesgos de este, pero no se aporta ninguna evaluación al respecto.
- Idiomas: no se declara cobertura lingüística; se desconoce el soporte real del castellano y de otras lenguas.
- Licencia: se trata de una licencia "other" con nombre "glm-5.3". Las condiciones exactas (permisos de uso comercial, restricciones, obligaciones de atribución) están en el archivo LICENSE del repositorio y no se recogen en la model card; es imprescindible revisarlas antes de cualquier uso, incluido el de investigación.
- Repositorio de terceros: publicado por un usuario individual (m8than) con 0 descargas y 1 like en el momento de la consulta, sin validación por parte del equipo de Z.ai. La trazabilidad depende del commit del modelo origen que se cita.
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con el modelo (páginas genéricas de editores de Python en línea) y no aportan información técnica utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/m8than/GLM-5.3-E2M1-Furnace
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Commit del modelo origen citado en la model card: https://huggingface.co/zai-org/GLM-5.3/tree/ba32f8c19c8738e2c57c71798c601d477a7bf844
- Licencia incluida en el repositorio: https://huggingface.co/m8than/GLM-5.3-E2M1-Furnace/blob/main/LICENSE
- Paper, blog, repositorio de código o demo de Furnace: no disponibles en la información proporcionada.
