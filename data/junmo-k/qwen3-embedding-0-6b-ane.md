# junmo-k/qwen3-embedding-0.6b-ane

## Resumen

`junmo-k/qwen3-embedding-0.6b-ane` es una conversión a Core ML del modelo de embeddings `Qwen/Qwen3-Embedding-0.6B` de Alibaba Qwen, optimizada para ejecutarse en la Apple Neural Engine (ANE) de los chips de Apple Silicon. El autor de la conversión es el usuario de Hugging Face junmo-k, y el objetivo es permitir la generación de embeddings de texto de forma local en Macs con chip M-series, sin necesidad de GPU dedicada ni de conexión a servicios en la nube.

El modelo base es un transformer de 0,6 mil millones de parámetros especializado en feature extraction (generación de representaciones vectoriales de texto), con una ventana de contexto de hasta 32.768 tokens. Esta conversión mantiene la fidelidad numérica del modelo original con una similitud coseno superior a 0,9998 en las pruebas publicadas, lo que la hace adecuada para tareas de recuperación semántica, búsqueda y clustering que requieran ejecución local y de baja latencia en hardware Apple.

La relevancia actual de esta ficha radica en que demuestra un patrón de despliegue de embeddings en el borde (edge): cuantización y compilación para un acelerador específico (ANE) manteniendo la calidad del modelo original. Es un ejemplo práctico de cómo llevar modelos de recuperación de información a entornos sin GPU y con requisitos de privacidad, aunque con limitaciones claras de plataforma (solo Apple Silicon) y de herramientas (requiere ANERun).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-Embedding-0.6B), convertido a Core ML para Apple Neural Engine |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (por defecto 2.048 en la herramienta ANERun) |
| Tipos de cuantizacion | no disponible (la model card no detalla el esquema de cuantización de la conversión Core ML) |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base Qwen3-Embedding es multilingüe, pero no se detalla aquí) |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquetes Core ML (repo de 2,4 GB); no se distribuyen safetensors ni GGUF en esta conversión |

## Arquitectura y entrenamiento

La conversión se basa en el modelo `Qwen/Qwen3-Embedding-0.6B`, un transformer encoder de 0,6 mil millones de parámetros diseñado para producir embeddings de texto normalizados. El autor de la conversión no documenta en la model card el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card original de Qwen. Lo que sí se documenta es el proceso de conversión: los pesos se compilan a Core ML para ejecutarse en la Apple Neural Engine, con el tokenizador y los fixtures de autoprueba incluidos en el paquete.

La innovación técnica destacable es la fidelidad de la conversión: el autor compara los vectores normalizados producidos por ANERun contra los del modelo original en FP32 y reporta similitudes coseno de 0,999802 (peor caso en seis entradas cortas, incluida una query de 37 dimensiones), 0,999873 (texto multilingüe y código de 2.060 tokens) y 0,999897 (texto multilingüe y código de 32.768 tokens). Estas cifras indican que la cuantización/compilación para ANE introduce una degradación numérica mínima en la práctica. No se detalla en la información disponible si la conversión usa cuantización de pesos, paletización u otra técnica de compresión para Core ML.

## Capacidades

- Generación de embeddings de texto normalizados para tareas de recuperación semántica, búsqueda y similitud.
- Soporte de contexto largo: hasta 32.768 tokens con `--max-tokens 32768` (por defecto 2.048).
- Manejo de texto multilingüe y código, según las pruebas de fidelidad publicadas (entradas multilingües y de código de hasta 32.768 tokens).
- Soporte de prompts de consulta (`--prompt query`) para distinguir embeddings de query frente a embeddings de documento, útil en pipelines de retrieval.
- Ejecución local en Apple Silicon mediante la Apple Neural Engine, sin GPU dedicada.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking; es un modelo exclusivamente de feature extraction.

## Casos de uso

- Búsqueda semántica local en aplicaciones de escritorio para macOS: el modelo puede indexar documentos y generar embeddings de consulta en el propio Mac, aprovechando la ANE para reducir consumo energético y evitar enviar datos a la nube.
- Recuperación aumentada (RAG) con privacidad: en asistentes internos o herramientas de empresa, los embeddings de los documentos y de las preguntas se calculan localmente, de modo que el contenido sensible no sale del dispositivo.
- Clasificación y clustering de tickets de soporte: se generan embeddings de cada ticket y se agrupan por similitud para enrutamiento automático, con contexto suficiente para tickets largos gracias a los 32.768 tokens.
- Deduplicación y detección de near-duplicates en corpus de código: las pruebas del autor incluyen código y texto multilingüe, por lo que el modelo puede comparar fragmentos de código para detectar clones o duplicados.
- Motor de recomendación de contenido basado en similitud: se calculan embeddings de artículos o productos y se recomiendan los más cercanos al perfil del usuario, ejecutando todo en el dispositivo.
- Búsqueda en documentación técnica multilingüe: el modelo base es multilingüe y la conversión mantiene la fidelidad en entradas multilingües, lo que permite consultas en un idioma contra documentos en otro.
- Prototipado e investigación en Mac: investigadores pueden evaluar pipelines de embeddings sin infraestructura GPU, usando el modelo convertido como sustituto fiel del original para experimentos preliminares.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de retrieval (MTEB u otros); solo reporta la fidelidad de la conversión frente al modelo original:

| Prueba | Similitud coseno con el original |
|---|---:|
| Peor caso en seis entradas cortas (incluye query de 37 dimensiones) | 0,999802 |
| Texto multilingüe y código, 2.060 tokens | 0,999873 |
| Texto multilingüe y código, 32.768 tokens | 0,999897 |

Para benchmarks de retrieval del modelo base, la model card remite a la [model card original de Qwen](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B). No se han publicado resultados de benchmarks de rendimiento (latencia, throughput) en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con Apple Neural Engine (la model card cita un Mac mini M4 de 16 GiB como entorno de prueba).
- VRAM: no aplica; el modelo se ejecuta en la ANE y en memoria unificada del sistema. El repo ocupa 2,4 GB.
- GPU recomendadas: no aplica (no usa GPU discreta); requiere chip Apple M-series.
- Cabe en hardware de consumo: sí, en Macs con Apple Silicon; el ejemplo documentado es un Mac mini M4 de 16 GiB.
- Opciones de despliegue: herramienta ANERun (instalación vía `anerun models install`), que verifica el manifiesto y compila los paquetes Core ML en el Mac de destino. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| junmo-k/qwen3-embedding-0.6b-ane | 0,6B | 32.768 | Core ML | Apache 2.0 | Apple Silicon (ANE) |
| Qwen/Qwen3-Embedding-0.6B (original) | 0,6B | 32.768 | safetensors | Apache 2.0 | GPU/CPU genérica |
| Otros modelos de embeddings de 0,5-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo original de Qwen: misma arquitectura, mismos parámetros y mismo contexto, pero distinto formato y plataforma objetivo. Esta conversión no ofrece ventajas de calidad frente al original, sino de despliegue en hardware Apple. No se dispone de datos de benchmarks comparativos con otros modelos de embeddings en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con Apple Neural Engine; no es portable a GPU NVIDIA, AMD ni a CPU genérica.
- Requiere la herramienta ANERun para instalar y ejecutar el modelo; no se documentan alternativas de despliegue.
- El contexto por defecto es de 2.048 tokens; para usar los 32.768 tokens hay que especificar `--max-tokens 32768` en la instalación y en tiempo de ejecución.
- No se detalla el esquema de cuantización de la conversión Core ML, lo que dificulta evaluar el impacto en casos límite.
- La fidelidad reportada (similitud coseno > 0,9998) es una medida agregada; no se publican métricas de retrieval (recall, nDCG) de la versión convertida.
- Riesgo de alucinación: no aplica directamente, ya que el modelo genera embeddings, no texto; el riesgo se traslada a los sistemas de recuperación que lo usan (recuperar documentos irrelevantes).
- Sesgos: no documentados en la información disponible; deben evaluarse en el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el aviso de conversión (NOTICE) del repo por posibles condiciones adicionales.
- Idiomas soportados: no disponibles en esta ficha; el modelo base es multilingüe, pero no se detalla el conjunto exacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/junmo-k/qwen3-embedding-0.6b-ane
- Modelo base original: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Revisión original usada en la conversión: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B/tree/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3
- Herramienta ANERun: https://github.com/junmo-kim/ANERun
- Licencia: https://huggingface.co/junmo-k/qwen3-embedding-0.6b-ane/blob/main/LICENSE
- Aviso de conversión: https://huggingface.co/junmo-k/qwen3-embedding-0.6b-ane/blob/main/NOTICE
