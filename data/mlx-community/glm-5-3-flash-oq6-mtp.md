# mlx-community/GLM-5.3-Flash-oQ6-mtp

## Resumen

GLM-5.3-Flash-oQ6-mtp es una cuantización en formato oQ de 6 bits del modelo zai-org/GLM-5.3-Flash, publicada por la comunidad mlx-community para su ejecución sobre Apple Silicon mediante la librería MLX. El modelo base es un transformer multimodal de tipo image-text-to-text desarrollado por Zhipu AI (zai-org) dentro de la familia GLM, con 321.323.031.390 parámetros totales según los pesos en safetensors y una ventana de contexto declarada de 1.048.576 tokens en la configuración del modelo.

La particularidad de esta variante es que conserva y cuantiza el bloque MTP (multi-token prediction) del modelo original, lo que habilita decodificación especulativa de forma nativa sin necesidad de un modelo borrador separado. El resultado es una build orientada a inferencia local en equipos con memoria unificada muy grande: el repo ocupa 264,3 GB y los pesos rondan los 246 GB, por lo que el requisito práctico arranca en 256 GB de memoria unificada y se recomiendan 512 GB para contexto largo más caché KV.

Es relevante ahora porque demuestra que la cuantización mixta por tensor (perfil oQ6, grupo de 64, bits mixtos asignados tensor a tensor) permite llevar un modelo de más de 300.000 millones de parámetros, con visión y contexto de un millón de tokens, a hardware de escritorio de gama alta de Apple, manteniendo el cabezal MTP operativo para acelerar la decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con bloque MTP (multi-token prediction); tipo `glm5_next` |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | oQ6: cuantización afín, group size 64, bits mixtos asignados por tensor según el perfil oQ6 de oMLX; bloque MTP cuantizado incluido |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint oQ para MLX) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia GLM-5.3 de Zhipu AI, con arquitectura de transformer multimodal que acepta entradas de texto e imagen (pipeline `image-text-to-text`). La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO; tampoco se especifica si el modelo base emplea mezcla de expertos, aunque el recuento de 321.000 millones de parámetros totales y la ausencia de un dato de parámetros activos impiden confirmarlo.

La innovación técnica destacable de esta variante es la preservación del cabezal MTP, cuantizado junto al resto del modelo, lo que permite decodificación especulativa lista para usar. La cuantización oQ aplica cuantización afín con grupos de 64 elementos y asigna precisión de forma mixta por tensor, lo que permite mantener componentes sensibles (como el bloque MTP y las capas de visión) en mayor precisión mientras se comprimen las capas más redundantes. Los componentes de visión se conservan, de modo que la entrada multimodal sigue operativa tras la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 1.048.576 tokens.
- Entrada multimodal de imagen y texto (`image-text-to-text`), con los componentes de visión retenidos en el checkpoint cuantizado.
- Decodificación especulativa nativa mediante el bloque MTP cuantizado, sin modelo borrador externo.
- Servicio mediante API compatible con OpenAI, según indica la model card (cliente OpenAI-compatible contra un servidor oMLX).
- Razonamiento y generación de código: no se documentan explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de gran escala sobre Apple Silicon: el checkpoint está diseñado para ejecutarse en equipos con 256-512 GB de memoria unificada (por ejemplo, Mac Studio M3 Ultra), permitiendo servir un modelo de 321.000 millones de parámetros sin infraestructura de GPU dedicada.
- Procesamiento de documentos extensos: con 1.048.576 tokens de contexto se pueden ingerir libros completos, expedientes o bases de código en una sola llamada; conviene asumir un TTFT de unos 259 s para un prefill de 131.072 tokens según las mediciones del autor.
- Análisis de imágenes con contexto textual largo: al conservar los componentes de visión, el modelo puede recibir capturas, diagramas o páginas escaneadas junto a instrucciones extensas en la misma petición.
- Servicio conversacional con API compatible con OpenAI: se puede desplegar con oMLX v0.7 o superior y apuntar clientes existentes al endpoint sin cambiar el código de integración.
- Aceleración de decodificación en producción: el bloque MTP permite activar decodificación especulativa para aumentar el throughput de generación (41,4 a 70,6 tok/s según la longitud de prefill medida).
- Evaluación e investigación de cuantización: útil para estudiar el impacto de la cuantización mixta por tensor (oQ6) y del MTP cuantizado sobre la calidad y la latencia en comparación con el modelo base sin cuantizar.
- Prototipado de pipelines multimodales en estación de trabajo: adecuado para desarrolladores que necesitan probar flujos image-text-to-text con contexto muy largo antes de migrar a infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de throughput en Mac Studio M3 Ultra (512 GB de memoria unificada), oMLX v0.7.3, MTP activado, valores por defecto del servidor, 256 tokens generados y media de 3 ejecuciones:

| Prefill (tokens) | Prefill tok/s | Decode tok/s |
|---|---|---|
| 1024 | 486,0 | 41,4 |
| 4096 | 560,1 | 43,2 |
| 32768 | 521,6 | 50,7 |
| 131072 | 505,3 | 70,6 |

El prefill se mantiene estable en todo el rango (486-560 tok/s) y el decode mejora con el contexto, de 41,4 a 70,6 tok/s. El coste del contexto largo se concentra en el TTFT: aproximadamente 259 s para un prefill de 131.072 tokens.

## Requisitos de hardware

- Memoria: pesos de aproximadamente 246 GB; se requiere un mínimo de 256 GB de memoria unificada y se recomiendan 512 GB para contexto largo más caché KV.
- Hardware medido: Mac Studio M3 Ultra con 512 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el checkpoint es específico para MLX y Apple Silicon, por lo que no se contempla su ejecución en GPU NVIDIA con esta build.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el tamaño de pesos excede con holgura los 24 GB de una RTX 4090.
- Despliegue: runtime oMLX v0.7 o posterior (requisito para cargar checkpoints oQ con MTP); servicio mediante API compatible con OpenAI.
- Throughput medido: 486-560 tok/s de prefill y 41,4-70,6 tok/s de decode según longitud de prefill; TTFT de unos 259 s con 131.072 tokens de entrada.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible para este checkpoint oQ.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ6-mtp (esta ficha) | 321.323.031.390 | 1.048.576 | oQ / MLX (oMLX) | no disponible | Hugging Face, 0 descargas |
| zai-org/GLM-5.3-Flash (base) | no disponible en la información | no disponible en la información | safetensors originales | no disponible | Hugging Face |
| Otras cuantizaciones de GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base zai-org/GLM-5.3-Flash antes de cualquier despliegue en producción.
- Requisito de hardware extremo: 256 GB de memoria unificada como mínimo y 512 GB recomendados; queda fuera del alcance de la mayoría de equipos.
- Dependencia de runtime: solo carga en oMLX v0.7 o superior; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con este checkpoint.
- TTFT elevado en contexto largo: aproximadamente 259 s para 131.072 tokens de prefill, lo que limita su uso en aplicaciones interactivas con entradas muy grandes.
- Riesgo de degradación por cuantización: la cuantización mixta de 6 bits y la cuantización del bloque MTP pueden afectar a la calidad respecto al modelo base; no se han publicado evaluaciones comparativas.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos de los evaluados por el autor del modelo base.
- Sesgos y alucinaciones: no hay información específica publicada en la model card; se aplican los riesgos habituales de los modelos de lenguaje de gran escala.
- Madurez de la publicación: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Capacidades de tool calling y agentes no confirmadas en la documentación disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/GLM-5.3-Flash-oQ6-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
