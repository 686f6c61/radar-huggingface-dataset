# bambocher/Huihui-Qwen3.5-9B-abliterated-oQ4e-mtp

## Resumen

Huihui-Qwen3.5-9B-abliterated-oQ4e-mtp es una versión cuantizada del modelo Qwen3.5-9B en su variante «abliterated» (con el comportamiento de rechazo eliminado mediante edición de pesos), publicada por el usuario bambocher en HuggingFace. El repositorio no contiene un modelo entrenado desde cero, sino un artefacto de cuantización de precisión mixta generado con oQ (oMLX v0.7.0), una herramienta del ecosistema MLX de Apple. El resultado son pesos en safetensors de 4 bits con group size 64, formato nativo de MLX, con un total de 9.653.104.368 parámetros y un tamaño de repositorio de 6,2 GB.

La relevancia de esta ficha es acotada y conviene ser explícito: no hay model card descriptiva, no se declara licencia, no se indican idiomas y el repositorio registra 0 descargas y 0 likes en el momento de la consulta. Se trata, por tanto, de un artefacto derivado de terceros cuyo uso en producción exige verificar por cuenta propia la procedencia de los pesos base, las condiciones legales y la calidad de la cuantización.

El nombre del repositorio sugiere la composición: el prefijo «Huihui» apunta a un fine-tune de la comunidad sobre una base Qwen3.5 de 9B, «abliterated» indica la supresión de la alineación de rechazo, «oQ4e» corresponde a la cuantización oQ de 4 bits y el sufijo «mtp» no está explicado en la documentación disponible (podría aludir a multi-token prediction, pero no se confirma en ninguna fuente consultada). La fecha de creación declarada en los metadatos (2026-10-19) es anómala y no se ha podido contrastar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer de tipo `qwen3_5` (según el campo `model_type` de la model card); detalles de capas y atención no disponibles |
| Parámetros totales | 9.653.104.368 (≈9,65 mil millones, dato real de los safetensors) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits, group size 64, cuantización mixta de precisión generada con oQ (oMLX v0.7.0); no se ofrecen otros niveles en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`); no hay GGUF ni AWQ/GPTQ publicados |
| Tamaño del repositorio | 6,2 GB |
| Librería de inferencia | MLX |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura interna más allá del identificador `qwen3_5` declarado en la model card, que sitúa el modelo en la familia Qwen 3.5 de Alibaba. No se publican detalles sobre el número de capas, el tipo de atención (completa, lineal o híbrida), la dimensionalidad del estado oculto ni la composición del vocabulario. Tampoco se indica si el modelo base emplea mezcla de expertos, por lo que no se puede afirmar ni descartar.

Sobre el entrenamiento no hay ningún dato: no se especifica el volumen de tokens, la composición del corpus, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La model card se limita a documentar el proceso de cuantización: cuantización mixta de precisión con oQ (oMLX v0.7.0) a 4 bits con group size 64, empaquetada en safetensors MLX. La naturaleza «abliterated» implica que los pesos base fueron modificados para eliminar la dirección de rechazo en el espacio de activaciones, una técnica de edición post-entrenamiento que no añade conocimiento nuevo y que degrada la alineación de seguridad de forma deliberada. No se documenta qué método concreto de abliteración se aplicó ni qué evaluaciones de daño se realizaron.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.5-9B (sin verificación independiente en este repositorio).
- Generación de código y matemáticas: capacidad esperable por la familia de origen, pero no hay benchmarks ni ejemplos publicados en el repositorio que lo confirmen.
- Ejecución local en Apple Silicon mediante MLX, con pesos ya cuantizados a 4 bits listos para cargar con `mlx-lm` u oMLX.
- Comportamiento sin rechazo: la variante «abliterated» responde a solicitudes que el modelo base alinearía con un rechazo, lo que constituye una capacidad técnica diferencial y, a la vez, el principal riesgo del artefacto.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponible; los tags no incluyen componentes de visión.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo «thinking» explícito: no disponible (no documentado para esta variante).

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el paquete MLX de 4 bits (≈5,4-6,2 GB) se carga directamente con `mlx-lm` en un Mac con memoria unificada de 16 GB o superior, sin necesidad de GPU dedicada ni de servicios en la nube.
- Prototipado de asistentes conversacionales en local: permite iterar sobre prompts y flujos multi-turno sin coste por token y sin enviar datos a terceros, adecuado para entornos de desarrollo con requisitos de privacidad.
- Evaluación de cuantización: sirve como caso de estudio para medir la degradación de calidad de oQ 4 bits con group size 64 frente a los pesos originales en tareas de generación, siempre que se disponga de los pesos base para comparar.
- Investigación sobre alineación y edición de pesos: la variante «abliterated» es útil como objeto de estudio en trabajos que analizan cómo la supresión de la dirección de rechazo afecta a la distribución de respuestas y a las métricas de seguridad.
- Procesamiento de texto por lotes off-line en un portátil: resúmenes, extracción de entidades o clasificación sobre documentos locales en un equipo de sobremesa Apple, con throughput modesto pero sin dependencia de red.
- Base para experimentos de destilación o fine-tuning ligero en MLX: al estar ya cuantizado en formato nativo, puede servir de punto de partida para pruebas de adaptación en hardware de consumo, asumiendo las limitaciones de una base de 4 bits.
- Docencia y demostraciones: permite ilustrar en un aula el ciclo completo de un modelo open source (fine-tune de comunidad, edición de pesos, cuantización y despliegue local) con un único fichero de 6,2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto documentación técnica sobre este repositorio (los resultados obtenidos corresponden a definiciones de diccionario del término francés «bambocher» y son irrelevantes). Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos en 4 bits ocupan aproximadamente 5,4 GB (9,65 mil millones de parámetros a ~4,5 bits efectivos por parámetro); el repositorio completo son 6,2 GB. Hay que añadir la caché KV y el overhead del runtime, cuyo tamaño exacto no se puede calcular sin conocer el número de capas y cabezas.
- Memoria unificada recomendada: 16 GB o más en Apple Silicon para contexto corto y margen de seguridad; 8 GB queda muy justo y probablemente fuerce swapping. Para contextos largos, 24-32 GB es más realista.
- GPU: el formato es MLX, por lo que el destino natural son chips Apple M1/M2/M3/M4 (incluidas variantes Pro, Max y Ultra). No hay pesos GGUF, AWQ ni GPTQ publicados, así que no se puede ejecutar directamente en A100, H100 ni RTX 4090 sin convertir el modelo.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 16 GB o más de memoria unificada. En el ecosistema NVIDIA no hay artefacto listo para usar.
- Opciones de despliegue: `mlx-lm` (carga directa de safetensors MLX), oMLX/oQ (herramienta con la que se generó la cuantización), MLX Swift para integración en apps de macOS/iOS. vLLM, TGI, llama.cpp y Ollama no son compatibles de forma nativa con este repositorio; requerirían una conversión previa (por ejemplo, deconstruir la cuantización oQ y recuantizar a GGUF), lo que introduciría una pérdida adicional de calidad.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-9B-abliterated-oQ4e-mtp (este) | 9,65 mil millones | no disponible | MLX safetensors 4 bits (oQ) | no disponible | 0 descargas, 0 likes |
| Qwen3.5-9B (modelo base al que alude el nombre) | ~9 mil millones (no confirmado) | no disponible | no disponible | no disponible | no verificado en la información proporcionada |
| Qwen2.5-7B-Instruct (referencia de la familia anterior) | 7,6 mil millones | 32.768 tokens (ampliable) | safetensors, GGUF, AWQ, GPTQ | Apache 2.0 | ampliamente disponible |
| Llama 3.1 8B Instruct (alternativa de tamaño comparable) | 8,03 mil millones | 131.072 tokens | safetensors, GGUF, entre otros | Llama 3.1 Community License | ampliamente disponible |

La comparación con Qwen2.5-7B y Llama 3.1 8B se ofrece solo como referencia de categoría (modelos densos de 7-9 mil millones de parámetros), no como equivalencia técnica: no existen datos públicos que permitan situar a este artefacto frente a ellos en calidad, y las cifras de contexto y licencia de este repositorio se desconocen. Cualquier afirmación de superioridad o inferioridad sería especulativa.

## Limitaciones y advertencias

- Ausencia total de licencia: al no declararse licencia en el repositorio, no puede asumirse ningún permiso de uso comercial, redistribución o modificación. Cualquier uso en producción requiere contactar con el autor y con los titulares de los derechos del modelo base.
- Alineación de seguridad eliminada: la variante «abliterated» ha sido modificada para no rechazar solicitudes que el modelo original bloquearía. Es previsible que genere contenido dañino, ilegal o inseguro ante prompts adversarios, y no debe exponerse a usuarios finales sin filtros externos.
- Riesgo de alucinación: no documentado para esta variante. La cuantización agresiva a 4 bits con group size 64 tiende a incrementar la degradación en tareas de razonamiento largo y en la fidelidad de detalles factuales, pero no hay mediciones que lo cuantifiquen aquí.
- Trazabilidad dudosa: con 0 descargas y 0 likes, sin model card descriptiva y sin papers asociados, no hay evidencia pública sobre quién construyó los pesos base ni con qué datos. La cadena de custodia del modelo es opaca.
- Fecha de creación anómala: los metadatos indican 2026-10-19, una fecha que no se ha podido verificar y que sugiere posibles inconsistencias en el registro del repositorio.
- Limitación de plataforma: el formato MLX restringe la ejecución a hardware Apple. No hay artefacto equivalente para CUDA ni para CPU genérica, lo que excluye la mayoría de despliegues en servidores.
- Idiomas y contexto desconocidos: al no declararse la lista de idiomas ni la ventana de contexto, no se puede garantizar un comportamiento correcto en castellano ni planificar aplicaciones que dependan de contexto largo.
- Riesgo de cuantización de terceros: la herramienta oQ aplica precisión mixta según criterios heurísticos no publicados en el repositorio; no se incluye informe de perplejidad ni comparación con los pesos originales.
- Sin soporte ni mantenimiento: no hay issues, discusiones ni autor identificable más allá del nombre de usuario; no cabe esperar correcciones de errores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bambocher/Huihui-Qwen3.5-9B-abliterated-oQ4e-mtp
- Herramienta de cuantización oQ / oMLX (referenciada en la model card): https://github.com/jundot/omlx
- Repositorio MLX de Apple (framework de ejecución): https://github.com/ml-explore/mlx
- Repositorio mlx-lm (carga de modelos cuantizados en MLX): https://github.com/ml-explore/mlx-lm

Nota: la búsqueda web realizada no ha devuelto ninguna fuente relevante sobre este modelo; los resultados obtenidos eran definiciones de diccionario del término francés «bambocher» y se han descartado por no guardar relación con el artefacto. No se han localizado papers, blogs, demos ni repositorios adicionales asociados a esta publicación.
