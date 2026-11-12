# joamCriff123/zils-mini-m1112

## Resumen

zils-mini-m1112 es un modelo de decisión (decision-model) publicado por el usuario joamCriff123 en Hugging Face, construido como un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B. Se presenta como un "d3-mini decision body" destinado al "Zils subnet 127 mini pool", lo que sugiere su uso dentro de una infraestructura de subredes o pools de decisión propietaria del autor. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 11 de noviembre de 2026.

El modelo cuenta con 4.539.265.536 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 4.500 millones de parámetros. La arquitectura declarada es `qwen3_5`, heredada del modelo base, y se distribuye en formato safetensors con licencia Apache-2.0. El tamaño del repositorio es de 9,1 GB.

La información pública disponible es muy limitada: la model card apenas contiene una descripción de una línea y metadatos básicos. No se detallan datos de entrenamiento, benchmarks, idiomas soportados ni capacidades específicas más allá de su etiquetado como modelo de extracción de características (feature-extraction) y modelo de decisión. Esta ficha refleja exclusivamente lo que puede verificarse en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, heredada de Qwen/Qwen3.5-4B) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5`, correspondiente a la familia del modelo base Qwen/Qwen3.5-4B, del cual este modelo es un ajuste fino. Se trata, por tanto, de un transformer de aproximadamente 4.500 millones de parámetros. El pipeline declarado es `feature-extraction`, aunque las etiquetas incluyen también `decision-model`, `zils` y `d3-mini`, lo que indica un uso orientado a la toma de decisiones dentro de la infraestructura "Zils subnet 127 mini pool". El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en implementaciones del autor más allá de las clases estándar de transformers.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de RLHF, DPO u otras fases de alineamiento, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, mezcla de expertos, etc.). La model card se limita a indicar la licencia Apache-2.0 y remitir a los ficheros LICENSE y NOTICE para las atribuciones del modelo base.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado en Hugging Face, por lo que el modelo puede emplearse para generar representaciones vectoriales de texto.
- Modelo de decisión (decision-model): etiqueta del autor que sugiere un uso orientado a la toma de decisiones dentro de la infraestructura Zils.
- Generación de texto y razonamiento: no confirmado explícitamente en la información disponible, aunque es plausible por herencia de la familia Qwen3.5; no se puede verificar.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: al estar etiquetado como `feature-extraction`, el modelo puede emplearse para generar representaciones vectoriales de documentos y consultas en sistemas de recuperación de información (RAG), siempre que se valide su calidad frente a alternativas estándar.
- Clasificación y enrutamiento de decisiones en pipelines internos: la etiqueta `decision-model` y su pertenencia al "Zils subnet 127 mini pool" apuntan a un uso como componente de decisión dentro de una infraestructura concreta del autor; su utilidad fuera de ese contexto no está documentada.
- Prototipado de ajustes finos sobre Qwen3.5-4B: al ser un finetune del modelo base, puede servir como punto de partida o referencia para experimentos de ajuste sobre la misma familia.
- Evaluación comparativa de modelos de ~4.500 millones de parámetros: su tamaño permite desplegarlo en hardware de gama media para experimentos de investigación, aunque sin benchmarks publicados la comparación carece de base objetiva.
- Investigación sobre modelos de decisión en subredes: útil para quienes estudien el ecosistema "Zils" o arquitecturas de decisión distribuidas, dado que es el único artefacto público identificado de ese pool.
- Filtrado y puntuación de candidatos en sistemas de recomendación: un modelo de 4.500 millones de parámetros con pipeline de extracción de características puede puntuar pares consulta-elemento, previa validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para los pesos (4.539 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 12-16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB para pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se confirman formatos de cuantización disponibles.
- GPU recomendadas: A100, H100 o L40S para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 en contextos moderados; RTX 4080/4070 Ti (16 GB) para fp16 ajustado o cuantización.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 16 GB o más en fp16, y en tarjetas de 8-12 GB si se aplica cuantización, siempre que el código personalizado del modelo lo permita.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados y dependen de la compatibilidad del `custom_code`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m1112 | 4.539 M | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Finetune de Qwen3.5-4B, pipeline feature-extraction, código personalizado |
| Qwen/Qwen3.5-4B (base) | ~4.000 M (según nombre) | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva; sin datos de benchmarks en esta ficha |
| Alternativas de ~4.500 M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, idiomas, contexto ni capacidades, lo que impide evaluar su idoneidad para producción.
- Sin benchmarks publicados: no hay evidencia objetiva de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).
- Código personalizado: el tag `custom_code` implica que la carga requiere `trust_remote_code=True` y ejecutar código del autor, con el riesgo de seguridad asociado.
- Repositorio sin tracción: 0 descargas y 0 likes reducen la probabilidad de que el modelo haya sido validado por terceros.
- Riesgo de alucinación y sesgos: no evaluado ni documentado; debe asumirse el comportamiento del modelo base Qwen3.5-4B, cuyas características tampoco se detallan aquí.
- Idiomas no declarados: no puede confirmarse el soporte multilingüe ni la calidad en castellano.
- Licencia Apache-2.0: permite uso comercial, pero deben revisarse los ficheros LICENSE y NOTICE para las atribuciones del modelo base y posibles restricciones adicionales del ecosistema Zils.
- Contexto desconocido: sin longitud de contexto declarada, no es posible planificar aplicaciones con ventanas largas.
- Uso previsto acotado: su diseño para el "Zils subnet 127 mini pool" sugiere que su comportamiento óptimo está ligado a una infraestructura específica no documentada públicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1112
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio, paper, blog o demo adicionales: no disponibles en la información proporcionada.
