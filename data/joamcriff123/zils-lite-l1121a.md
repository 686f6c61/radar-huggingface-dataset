# joamCriff123/zils-lite-l1121a

## Resumen

zils-lite-l1121a es un modelo de decisión ("decision body") publicado por el usuario joamCriff123 en Hugging Face, construido como fine-tuning del modelo base Qwen/Qwen3.5-0.8B. Según la model card, está pensado para el "Zils subnet 127 lite pool", un contexto de despliegue que el autor no detalla. El repositorio se etiqueta con los identificadores `decision-model`, `zils` y `d3-lite`, y se declara compatible con endpoints de inferencia. El pipeline asignado en el Hub es `feature-extraction`, aunque el modelo base es un modelo de lenguaje generativo.

El modelo tiene 852.985.920 parámetros (datos reales de los pesos en safetensors), lo que lo sitúa en la franja de los 0,85 mil millones de parámetros, coherente con la familia Qwen3.5-0.8B. El repositorio ocupa 1,7 GB y se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que la arquitectura requiere cargar módulos propios del repositorio y no solo la clase estándar de transformers. La licencia declarada es Apache-2.0.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño, de licencia permisiva y derivado de una familia conocida, lo que lo hace potencialmente útil para tareas de clasificación o decisión de baja latencia en entornos con recursos restringidos. No obstante, la información pública es mínima: no hay datos de entrenamiento, benchmarks, idiomas soportados ni documentación sobre el formato de entrada y salida esperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado `qwen3_5`; requiere `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3_5` y la referencia al modelo base Qwen/Qwen3.5-0.8B. El repositorio incluye código personalizado, lo que sugiere que la implementación no se limita a las clases estándar de transformers y que la carga del modelo requiere confiar en el código del autor. El pipeline declarado es `feature-extraction`, lo que apunta a un uso como extractor de representaciones o clasificador más que como generador de texto libre, aunque no se especifica la cabeza de salida.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO u otra etapa de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta el proceso de fine-tuning a partir del modelo base. Todo ello debe considerarse no disponible.

## Capacidades

- No se documentan capacidades específicas en la model card más allá de su uso como "decision body" para el pool lite de Zils subnet 127.
- El pipeline declarado es `feature-extraction`, lo que sugiere uso para obtener representaciones vectoriales o puntuaciones de decisión.
- No hay evidencia publicada de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay información sobre modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- Al derivar de Qwen3.5-0.8B, podría heredar parte de las capacidades del base, pero no se confirma ni se cuantifica en la información disponible.

## Casos de uso

- Clasificación o filtrado de candidatos en un pipeline de decisión: dado que el autor lo describe como "decision body", podría emplearse para puntuar opciones o rutas en un sistema de enrutamiento, siempre que se documente el formato de entrada y salida esperado.
- Extracción de características para búsqueda semántica: el pipeline `feature-extraction` permite usarlo como encoder para generar embeddings de frases o documentos en un índice vectorial, con la ventaja de su tamaño reducido.
- Despliegue en entornos con recursos limitados: con menos de 1.000 millones de parámetros, puede ejecutarse en CPU o en GPU de gama media para tareas de baja latencia.
- Prototipado de agentes con módulo de decisión ligero: integrar el modelo como componente de selección de acciones en un agente mayor, dejando la generación de texto a un modelo más grande.
- Evaluación comparativa de fine-tunes pequeños: sirve como caso de estudio para medir el efecto de un fine-tuning sobre Qwen3.5-0.8B en tareas de decisión, aunque sin benchmarks publicados la comparación es limitada.
- Investigación sobre modelos derivados con código personalizado: útil para estudiar cómo se empaquetan y distribuyen fine-tunes que requieren `trust_remote_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (probablemente fp32 o bf16): entre 3,4 GB (fp32) y 1,7 GB (bf16) solo para pesos, más memoria para activaciones y contexto.
- En cuantización de 8 bits: aproximadamente 0,9 GB de pesos; en 4 bits: aproximadamente 0,5 GB. No se confirman cuantizaciones oficiales en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (por ejemplo, RTX 3050, RTX 4060, T4). Para fp32 se recomienda al menos 6-8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más, y potencialmente en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía indicada por las etiquetas. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la presencia de `custom_code` complica el uso en runtimes que no ejecutan código Python arbitrario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zils-lite-l1121a | 852.985.920 | no disponible | Apache-2.0 | safetensors + custom_code | Fine-tuning de Qwen3.5-0.8B para decision; sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8 B (familia) | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo base del que deriva; capacidades generativas estándar de la familia |
| Modelos de ~1 B parámetros de la familia Qwen3 | ~1 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Alternativas genéricas de tamaño similar; no se dispone de datos comparativos verificados |

La comparación cuantitativa no es posible con la información disponible, ya que no hay benchmarks ni especificaciones de contexto publicadas para el modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debe asumirse un rendimiento concreto en producción.
- Documentación mínima: la model card no describe el formato de entrada/salida, el tokenizador esperado ni el propósito exacto del "decision body".
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; debe auditarse antes de usarlo en entornos sensibles.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y posiblemente especializado, la generación de texto libre no está validada.
- Idiomas: no se declaran idiomas soportados; no debe asumirse multilingüismo.
- Contexto: no se declara longitud de contexto; planificar con margen conservador.
- Licencia Apache-2.0: permite uso comercial, pero deben revisarse los ficheros LICENSE y NOTICE para las atribuciones del modelo base y de terceros.
- Procedencia: el autor tiene 0 descargas y 0 likes en el momento de la consulta; no hay señales de validación por la comunidad.
- Fecha de creación futura (2026-11-21) en los metadatos del Hub: conviene verificar la integridad y el origen del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1121a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
