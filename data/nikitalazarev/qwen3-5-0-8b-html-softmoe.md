# NikitaLazarev/Qwen3.5-0.8B-HTML-SoftMoE

## Resumen

Qwen3.5-0.8B-HTML-SoftMoE es un derivado de la familia Qwen3.5 de Alibaba, publicado por el usuario NikitaLazarev. No se trata de un modelo entrenado de forma convencional, sino de una variante obtenida mediante *weight-space steering* sobre el modelo denso base Qwen/Qwen3.5-0.8B: se extrae una dirección de dominio en el espacio de activaciones y se incrusta en las matrices de salida de determinadas capas, sin aplicar gradientes ni fine-tuning. El resultado se presenta como un "experto Soft MoE" especializado en autoría HTML (corpus WHATWG/MDN).

El modelo conserva la arquitectura y el tamaño del base (873.438.784 parámetros reales según los pesos safetensors) y añade un router en espacio de embeddings que decide cuándo usar esta variante frente al modelo original. La propuesta es relevante porque demuestra una vía de especialización de coste muy bajo (sin entrenamiento) y despliegue directo con `transformers`, aunque su alcance es experimental y la documentación pública es mínima.

La ficha se basa únicamente en la model card del autor y en los metadatos de Hugging Face; no hay datos de benchmarks, licencia ni idiomas declarados, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5) con parche de steering rank-one sobre capas seleccionadas; variante "Soft MoE" con router en espacio de embeddings |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es un MoE disperso real; el "Soft MoE" es una denominación del autor para el enrutado entre variantes) |
| Longitud de contexto | No disponible (heredada del base Qwen/Qwen3.5-0.8B; no declarada en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible (el dominio de especialización es HTML en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de unos 873 millones de parámetros. Sobre él se aplica un procedimiento de *weight-space programming* inspirado en Takeyama et al. (MIT CSAIL, 2026): mediante un escaneo de activaciones se calcula la diferencia de medias de hidden states entre prompts del dominio HTML y prompts de contraste, obteniendo una dirección de dominio d̂. Esa dirección se incrusta como un parche de steering de rango uno en las matrices de salida `down_proj`, `o_proj` y `out_proj` de las capas [15, 16, 17, 18, 20, 21, 22, 23], con un factor α = 0,2 y modo `steer`.

No hay entrenamiento ni ajuste por gradientes: la modificación es puramente algebraica sobre los pesos. El autor reporta una puerta de validación del escaneo con AUC = 1,0, lo que indica separación perfecta entre prompts del dominio y de contraste en el conjunto de validación empleado. Además, un router basado en embeddings y margen coseno selecciona esta variante frente al modelo base para consultas del tema. La herramienta utilizada es Ivanna Lab, un laboratorio de modelos autoalojado.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Especialización en autoría HTML: marcado, elementos, atributos y formularios según el dominio WHATWG/MDN.
- Procesamiento image-text-to-text según el pipeline declarado en Hugging Face (capacidad multimodal heredada del base, no verificada en la model card).
- Enrutado condicional: un router en espacio de embeddings decide si se usa esta variante o el modelo base según la consulta.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan tool calling, function calling, agentes, modo thinking ni capacidades multilingües específicas.

## Casos de uso

- Asistencia a desarrolladores web: generación y corrección de fragmentos HTML (formularios, tablas, elementos semánticos) aprovechando el steering hacia el dominio WHATWG/MDN.
- Documentación técnica: redacción de ejemplos de marcado y explicaciones de atributos HTML coherentes con las especificaciones.
- Enseñanza de HTML: respuestas guiadas sobre estructura de documentos, accesibilidad y buenas prácticas de autoría.
- Prototipado de plantillas: generación rápida de esqueletos HTML para maquetación previa a la integración en un framework.
- Enrutado de consultas en un sistema mayor: usar el router para derivar peticiones de temática HTML a esta variante y el resto al modelo base, reduciendo interferencias de dominio.
- Investigación en weight-space steering: caso de estudio reproducible para evaluar la eficacia de parches de dirección de dominio sin entrenamiento en modelos pequeños.
- Experimentos de bajo coste en hardware de consumo: al ser un modelo de menos de mil millones de parámetros, permite probar variantes especializadas en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es la puerta del escaneo de activaciones (AUC = 1,0), que mide la separabilidad del dominio en el conjunto de validación del autor y no el rendimiento generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7-2 GB solo para pesos, más overhead de activaciones y caché KV; aproximadamente 3-4 GB en total para contextos moderados.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, en torno a 0,5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) sin problema, aunque están sobredimensionadas para este tamaño.
- Despliegue: `transformers` es la vía documentada; al ser safetensors estándar, es compatible con vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no publicada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-HTML-SoftMoE | 873 M | No disponible | HTML (steering sin entrenamiento) | No disponible | safetensors |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Generalista | No disponible | safetensors |
| Qwen2.5-0.5B / 1.5B (generación previa) | 0,5-1,5 B | 32 K (según versión) | Generalista | Apache 2.0 (versiones previas) | safetensors, GGUF |

La comparación con alternativas de la misma categoría (modelos densos de menos de mil millones de parámetros) es limitada porque no hay benchmarks publicados para esta variante ni datos de licencia. El base Qwen3.5-0.8B es el referente directo; las versiones Qwen2.5 de tamaño similar sirven como orientación de mercado, pero no son equivalentes generacionales.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente.
- El steering de rango uno puede degradar capacidades generales fuera del dominio HTML; el autor no documenta evaluaciones de regresión.
- Riesgo de alucinación inherente a un modelo de 0,8 B, especialmente en especificaciones HTML poco frecuentes.
- El AUC = 1,0 corresponde al conjunto de validación del autor y no garantiza generalización.
- Licencia no declarada: no se puede confirmar el uso comercial; conviene contactar con el autor o consultar la licencia del base Qwen3.5-0.8B.
- Idiomas no declarados; el dominio de especialización está en inglés, por lo que el rendimiento en castellano no está verificado.
- Contexto máximo no documentado en la model card; debe consultarse la del modelo base.
- La denominación "Soft MoE" no implica una arquitectura MoE dispersa: es un enrutado entre variantes de pesos, no expertos entrenados en paralelo.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-HTML-SoftMoE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ivanna Lab (herramienta del autor): https://github.com/wiskeone/ivanna-lab
- Referencia metodológica citada: Weight-Space Programming (Takeyama et al., MIT CSAIL, 2026); no se proporciona URL directa en la información disponible.
