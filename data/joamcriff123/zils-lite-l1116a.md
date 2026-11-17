# joamCriff123/zils-lite-l1116a

## Resumen

zils-lite-l1116a es un modelo de decisión (decision-model) publicado por el usuario joamCriff123 en Hugging Face, construido como un fine-tuning del modelo base Qwen/Qwen3.5-0.8B. Forma parte de lo que el autor denomina "Zils subnet 127 lite pool", un ecosistema orientado a la toma de decisiones automatizada dentro de un pool de modelos ligeros. El modelo se distribuye con la etiqueta de pipeline feature-extraction y la arquitectura declarada qwen3_5.

Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), se posiciona en el segmento de modelos ultraligeros, pensados para despliegues con recursos limitados o para formar parte de sistemas de enrutamiento y decisión donde la latencia y el coste importan más que la profundidad de razonamiento. El repositorio ocupa 1,7 GB y los pesos están en formato safetensors, con código personalizado (custom_code) que requiere confiar en la implementación del autor.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo recién publicado (16 de noviembre de 2026), sin descargas ni likes, sin model card detallada y sin benchmarks publicados. Resulta útil como referencia de un patrón emergente de modelos de decisión especializados derivados de bases pequeñas, pero cualquier evaluación de producción debe hacerse con cautela dada la ausencia de documentación técnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según etiqueta del autor; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline declarado | feature-extraction |
| Tags | decision-model, zils, d3-lite, custom_code, endpoints_compatible |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La información disponible indica únicamente que el modelo deriva de Qwen/Qwen3.5-0.8B mediante fine-tuning y que se etiqueta con la arquitectura qwen3_5. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado. El autor lo describe como un "d3-lite decision body", término propio del ecosistema Zils que sugiere un entrenamiento orientado a tareas de decisión más que a generación abierta de texto.

El repositorio incluye la etiqueta custom_code, lo que implica que la carga del modelo requiere ejecutar código del autor (típicamente mediante `trust_remote_code=True` en transformers). No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. Tampoco se detalla si el fine-tuning preserva las capacidades generativas del modelo base o si las sustituye por una cabeza de clasificación/decisión, aunque el pipeline feature-extraction apunta a lo segundo.

## Capacidades

- Extracción de características (feature-extraction): el pipeline declarado sugiere que el modelo produce representaciones vectoriales, no necesariamente texto generado.
- Toma de decisiones: la etiqueta decision-model y la descripción "decision body" indican un uso previsto como componente de decisión dentro de un sistema mayor.
- Integración con endpoints: la etiqueta endpoints_compatible indica compatibilidad con el sistema de inference endpoints de Hugging Face.
- Generación de texto, razonamiento, código, matemáticas o visión: no disponible; no se documentan.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutamiento de consultas en un pool de modelos: el modelo puede actuar como clasificador ligero que decide a qué modelo mayor derivar una petición, aprovechando su tamaño de 0,85B parámetros para mantener baja la latencia del enrutador.
- Filtrado previo en pipelines de datos: al ser un modelo de decisión de pequeño tamaño, puede usarse para descartar entradas irrelevantes antes de pasarlas a modelos más costosos, reduciendo el gasto computacional del pipeline.
- Componente de decisión en la subnet Zils 127: su propósito declarado es servir dentro del "lite pool" de esa subnet, por lo que su caso de uso natural es el que defina ese ecosistema concreto.
- Extracción de embeddings para búsqueda semántica: el pipeline feature-extraction permite generar representaciones vectoriales para indexar documentos o consultas en sistemas de recuperación (RAG), siempre que se valide la calidad de los embeddings.
- Clasificación binaria o multiclase en producción: con casi 853 millones de parámetros, cabe en GPUs de consumo y puede servir como clasificador de baja latencia en servicios con alto volumen de peticiones.
- Prototipado rápido de sistemas de decisión: al ser Apache-2.0 y de tamaño reducido, es adecuado para experimentar con arquitecturas de agentes o routers antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y contexto; en la práctica, entre 2 y 3 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5-0,7 GB para pesos (requiere conversión propia, ya que no se distribuyen variantes GGUF).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas, incluidas las integradas de gama alta con memoria unificada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por la etiqueta custom_code); vLLM, llama.cpp, Ollama o TGI solo si el código personalizado es compatible, lo cual no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-l1116a | 852.985.920 | no disponible | apache-2.0 | Hugging Face, 0 descargas | Fine-tuning de Qwen3.5-0.8B, sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| Modelos de decisión ligeros tipo clasificador (p. ej. MiniLM, DistilBERT) | 20-70M | 256-512 tokens típicos | MIT/Apache-2.0 habituales | Amplia | Mucho más pequeños, pero sin capacidad generativa; comparación solo orientativa |

La comparación con alternativas es limitada porque no se dispone de datos de rendimiento del modelo ni de especificaciones detalladas de su base. Cualquier elección frente a un clasificador transformer clásico debería basarse en una evaluación empírica propia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no puede recomendarse para producción sin evaluación previa.
- Model card mínima: el README no documenta datos de entrenamiento, contexto, idiomas ni comportamiento esperado.
- Código personalizado: la etiqueta custom_code obliga a ejecutar código del autor con `trust_remote_code=True`, lo que introduce un riesgo de seguridad que debe auditarse antes de usarlo.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta implican que el modelo no ha sido validado por la comunidad.
- Riesgo de alucinación: no evaluado; si conserva capacidades generativas del modelo base, hereda sus sesgos y errores, y si es un clasificador, los errores se manifiestan como decisiones incorrectas.
- Idiomas: no disponibles; no puede asumirse soporte multilingüe.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las atribuciones del modelo base Qwen y revisarse el archivo NOTICE mencionado por el autor.
- Contexto desconocido: no debe asumirse una ventana larga; conviene verificar la configuración antes de usarlo con entradas extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1116a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio o demo del autor: no disponible
