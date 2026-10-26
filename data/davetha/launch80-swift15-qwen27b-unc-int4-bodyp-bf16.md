# davetha/launch80-swift15-qwen27b-unc-int4-bodyp-bf16

## Resumen

Launch80 Swift-1.5 Qwen3.8-27B Uncensored es un checkpoint cuantizado en INT4 GPTQ publicado por el usuario davetha sobre el modelo base `swift-1-5/swift-1-5-qwen3-8-27b-uncensored`, un modelo de ~27.800 millones de parámetros de la familia Qwen3.5 (etiqueta `qwen3_5`). No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de cuantización con una única promoción de precisión quirúrgica, en la que la capa `model.layers.63.self_attn.o_proj` se almacena en BF16 mientras el resto de las 409 capas lineales permanecen en INT4.

El interés técnico está en el método, no en el delta de calidad. El autor midió el error de cuantización tensor a tensor mediante captura de la Hessiana de activaciones sobre el propio checkpoint INT4, con un corpus de prompts (BetterBench) y validación de doble métrica, en lugar de aplicar una heurística genérica de capas sensibles. El resultado es un checkpoint con error estrictamente menor que el bake INT4 original, sin coste de servicio adicional: el islote BF16 midió incluso ligeramente más rápido que la de-cuantización INT4 en la pila del autor.

Es relevante para quienes sirven modelos Qwen3.5 de ~27B en GPUs de 32 GB con vLLM y decodificación especulativa, porque documenta un pipeline reproducible de promoción selectiva de precisión y advierte de una limitación concreta del cargador de vLLM 0.30 al mapear tensores BF16 densos en módulos `qkv_proj` fusionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (etiqueta `qwen3_5`); no se especifica en la información disponible si es denso o MoE |
| Parámetros totales | 27.781.427.952 (~27,8 mil millones), según safetensors |
| Parámetros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 131k tokens, según la configuración de servicio reportada por el autor |
| Tipos de cuantización | INT4 GPTQ con promoción mixta: `model.layers.63.self_attn.o_proj` en BF16; caché KV en fp8 en el despliegue de referencia |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ 4-bit + tensores BF16); no se publican GGUF ni otros formatos |
| Modelo base | swift-1-5/swift-1-5-qwen3-8-27b-uncensored |
| Tamaño del repositorio | 17,1 GB |
| Fecha de publicación | 26 de octubre de 2026 (según HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5 con aproximadamente 27.800 millones de parámetros totales. La información disponible no detalla el número de capas, la dimensión oculta, el tipo de atención ni si emplea mezcla de expertos; la referencia a `model.layers.63.self_attn.o_proj` confirma al menos 64 capas con atención con proyección de salida separada. Tampoco se documentan los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO): esta ficha solo puede describir el proceso de cuantización, no el preentrenamiento.

La innovación técnica del checkpoint es el procedimiento de promoción de precisión. El autor ejecutó tres fases: (1) captura de la Hessiana de activaciones sobre el objetivo INT4 en producción, usando una mezcla de prompts del corpus BetterBench y preseleccionando los 24 tensores candidatos con peor comportamiento mediante validación de doble métrica; (2) construcción de una tabla de error en espacio de activaciones frente a una referencia BF16, tras comprobar que el prefiltro en espacio de pesos sobre las 409 capas lineales arrojaba un clúster estrecho del 12-15 % sin valores atípicos y por tanto no discriminaba; (3) sustitución del peor lineal aislado (`model.layers.63.self_attn.o_proj`, con un 6,18 % de error de pesos) por su original en BF16, quedando con error de cuantización exactamente cero. Los metadatos de cuantización, incluidas las reglas dinámicas de ignorar BF16 (formas ajustada y de prefijo laxa, para robustez en el mapeo de nombres), se incluyen en `quantize_config.json`.

## Capacidades

- Generación de texto en inglés con el perfil de comportamiento heredado del modelo base sin censura declarada por el autor.
- Razonamiento y conversación multi-turno hasta 131k tokens de contexto en la configuración de servicio reportada.
- Compatibilidad con decodificación especulativa en vLLM mediante un drafter externo (z-lab Qwen3.8-27B-DFlash2, k=7), con aceptación medida de 4,6 a 5,4 tokens por actualización.
- Servicio en vLLM 0.30 o superior con cargador GPTQ y caché KV en fp8.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito. No se han verificado.

## Casos de uso

- Servicio de inferencia en producción con vLLM: el checkpoint está pensado para desplegarse tal cual con vLLM >= 0.30 y GPTQ, con los metadatos de cuantización ya resueltos en `quantize_config.json`; el autor reporta 92,0 tok/s y un TTFT p50 de ~178 ms en una GPU de 32 GB, lo que lo hace apto para APIs de chat con latencia interactiva.
- Decodificación especulativa a gran escala: al combinarse con el drafter DFlash2 (k=7) y una tasa de aceptación de 4,6-5,4 tokens por actualización, reduce el número de pasos del modelo objetivo y mejora el throughput efectivo en cargas de generación larga.
- Procesamiento de documentos largos en inglés: la ventana de 131k tokens permite resumir, extraer entidades o responder preguntas sobre contratos, informes o bases de conocimiento técnico sin troceado previo, aunque con un coste de caché KV que condiciona el hardware.
- Investigación sobre cuantización de precisión mixta: sirve como caso de referencia reproducible para estudiar la captura de Hessianas de activaciones, la selección de tensores sensibles y el impacto real de promover una única capa a BF16 frente al bake INT4 puro.
- Evaluación comparativa de artefactos de cuantización: útil en pipelines internos que comparan checkpoints INT4 frente a variantes con islotes de mayor precisión usando métricas de rendimiento (tok/s, TTFT, aceptación especulativa) además de evaluaciones de calidad.
- Base para ajuste fino o experimentación en entornos de investigación: la licencia Apache 2.0 y el formato safetensors permiten cargar el modelo en frameworks estándar, siempre que se asuma el perfil del modelo base sin censura y el idioma inglés.
- Validación de compatibilidad de cargadores: el propio autor documenta el fallo de vLLM <= 0.30 al alimentar tensores BF16 densos en módulos `qkv_proj` fusionados, por lo que este repositorio es útil como caso de prueba para parches del cargador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son métricas de servicio, obtenidas en una GPU Intel clase B70 de 32 GB con vLLM 0.30, decodificación especulativa con el drafter z-lab Qwen3.8-27B-DFlash2 (k=7), caché KV fp8 y contexto de 131k:

| Métrica | Este checkpoint | Bake INT4 puro |
|---|---|---|
| BetterBench ponderado (5 pasadas) | 92,0 tok/s | 90,6 tok/s |
| TTFT p50 | ~178 ms | 199 ms |
| Aceptación de decodificación especulativa | 4,6-5,4 tok/actualización | 4,2-5,1 tok/actualización |
| Salida | coherente, verificada con gates | línea base |

Nota: el autor advierte que el delta de calidad frente al bake INT4 es el de anular el error de un único módulo y que las diferencias visibles en benchmarks son pequeñas por diseño.

## Requisitos de hardware

- Pesos: 17,1 GB en el repositorio (INT4 GPTQ con un tensor BF16 adicional), por lo que la VRAM mínima para cargar el modelo ronda los 17-18 GB, sin contar caché KV ni overhead del runtime.
- GPU verificada por el autor: Intel clase B70 con 32 GB, sirviendo 131k de contexto con caché KV fp8 y decodificación especulativa.
- GPUs de consumo: una RTX 4090 (24 GB) o RTX 5090 (32 GB) deberían poder cargar los pesos; en 24 GB la longitud de contexto práctica queda limitada por la caché KV, que no se cuantifica en la información disponible. Estimación, no medida publicada.
- vLLM >= 0.30 es requisito explícito; el autor advierte de no añadir manualmente grupos qkv fusionados a la lista de ignorados en vLLM <= 0.30 por un fallo del mapeador de nombres en `qwen3_5` (`AttributeError: QKVParallelLinear has no attribute .data`).
- No se publican GGUF, por lo que llama.cpp y Ollama no son opciones directas con este repositorio; TGI y otras pilas no se mencionan en la información disponible.
- Throughput y latencia medidos: 92,0 tok/s (BetterBench ponderado, 5 pasadas) y TTFT p50 de ~178 ms en la configuración descrita; la decodificación especulativa requiere emparejar el drafter DFlash2.

## Comparativa con modelos similares

No se dispone de datos de especificaciones ni de rendimiento de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación se limita a las variantes directas del mismo linaje documentadas por el autor:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Launch80 INT4 + o_proj BF16) | ~27,8 mil millones | 131k (config. de servicio) | INT4 GPTQ + 1 tensor BF16 | Apache 2.0 | HuggingFace, safetensors |
| Bake INT4 puro (Launch80) | ~27,8 mil millones | no disponible | INT4 GPTQ | Apache 2.0 (heredada) | Referenciado en la model card |
| swift-1-5-qwen3-8-27b-uncensored (base) | no disponible en detalle | no disponible | BF16 (referencia de error) | Apache 2.0 | HuggingFace |
| Otras alternativas de ~27-32B (Qwen3, Gemma, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El beneficio de calidad es marginal por diseño: se anula el error de cuantización de un solo módulo lineal (6,18 % de error de pesos) y el autor reconoce que las diferencias visibles en benchmarks son pequeñas. No es un modelo distinto.
- El modelo base declara perfil "uncensored": no incorpora los filtros de seguridad habituales del linaje original, lo que implica riesgo de generar contenido inapropiado y exige moderación externa en producción.
- Solo se declara inglés como idioma soportado; no hay evidencia de calidad multilingüe.
- Riesgo de alucinación no evaluado: no se publican benchmarks de fidelidad, MMLU, HumanEval ni GSM8K en la información disponible.
- Hereda los artefactos propios de GPTQ INT4, incluida una degradación no uniforme en las capas no promocionadas.
- Doce promociones adicionales de grupos qkv fusionados, seleccionadas por Hessiana, quedan pendientes de un parche en el cargador de vLLM; el repositorio sirve intencionadamente solo la promoción aislada que carga sin problemas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del modelo base sin censura y sobre el cumplimiento normativo recae en el desplegador.
- El checkpoint no tiene descargas ni valoraciones en HuggingFace en el momento de la consulta; no hay validación independiente de las métricas reportadas.
- La fecha de publicación registrada (26 de octubre de 2026) es posterior a la fecha actual de referencia habitual, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/davetha/launch80-swift15-qwen27b-unc-int4-bodyp-bf16
- Modelo base: https://huggingface.co/swift-1-5/swift-1-5-qwen3-8-27b-uncensored
- Configuración de cuantización incluida en el repositorio: `quantize_config.json`
- Documentación de vLLM (requisito >= 0.30): no se proporciona enlace en la información disponible
- Drafter de decodificación especulativa z-lab Qwen3.8-27B-DFlash2: no se proporciona enlace en la información disponible
- Paper, blog o repositorio del método de promoción por Hessiana: no disponible
