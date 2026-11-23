# joamCriff123/zils-z3-z1123a

## Resumen

zils-z3-z1123a es un modelo de decisión ("decision body") publicado por el usuario joamCriff123 en Hugging Face, derivado por ajuste fino del modelo base Qwen/Qwen3.8-27B. Según la model card, está pensado para operar dentro del "Zils subnet 127 z3 pool", un contexto de despliegue que el autor no detalla. El repositorio declara la etiqueta `decision-model` y la arquitectura `qwen3_5`, con pipeline de `feature-extraction` en la librería Transformers.

El modelo cuenta con 26.085.330.160 parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de modelos densos de gran tamaño (aproximadamente 26.000 millones de parámetros), coherente con su base Qwen3.8-27B. El repositorio ocupa 52,2 GB, un tamaño consistente con pesos en precisión de 16 bits para ese número de parámetros.

La relevancia de esta ficha es limitada: se trata de un modelo recién creado (23 de noviembre de 2026), sin descargas ni interacciones, sin benchmarks publicados y con una model card mínima que no describe el proceso de entrenamiento, los datos utilizados ni las capacidades concretas. La información disponible permite documentar únicamente la arquitectura heredada, el tamaño y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en Hugging Face; derivada de Qwen/Qwen3.8-27B) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es un ajuste fino del base Qwen/Qwen3.8-27B y que utiliza la arquitectura etiquetada como `qwen3_5` en Hugging Face. No se especifica si se trata de un transformer denso estándar, de una variante con atención lineal o de una mezcla de expertos; el recuento de parámetros (26.085 millones) y el tamaño del repositorio (52,2 GB) son compatibles con un modelo denso en FP16/BF16.

No se han publicado datos sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card se limita a indicar que es un "decision body" para el pool z3 de la subnet 127 de Zils y a remitir a los ficheros LICENSE y NOTICE para las atribuciones del modelo base. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- No se documentan capacidades específicas en la model card más allá de la etiqueta `decision-model`.
- Por herencia del base Qwen3.8-27B, es razonable esperar generación de texto, razonamiento y conocimiento multilingüe, pero el autor no lo confirma ni cuantifica.
- El pipeline declarado en Hugging Face es `feature-extraction`, lo que sugiere uso para extracción de representaciones, aunque no se detalla la tarea concreta.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.
- No se confirma soporte de visión, audio ni modo "thinking".
- No se detallan los idiomas soportados.

## Casos de uso

- Extracción de características para clasificación downstream: dado que el pipeline declarado es `feature-extraction`, el modelo puede emplearse para generar embeddings de texto que alimenten clasificadores o sistemas de recuperación, siempre que se valide empíricamente su calidad.
- Componente de decisión en el pool z3 de la subnet 127 de Zils: el uso previsto por el autor es operar como "decision body" dentro de ese entorno, por lo que su despliegue principal sería en la infraestructura de dicha subnet.
- Ajuste fino adicional sobre tareas propias: al estar bajo Apache-2.0 y en formato safetensors, puede servir como punto de partida para especializaciones posteriores con Transformers.
- Investigación sobre ajuste fino de modelos de ~26B: útil como caso de estudio de cómo un base Qwen se adapta a un dominio concreto, aunque sin datos publicados de evaluación la comparación es limitada.
- Prototipado interno de asistentes de texto: si se confirma el comportamiento heredado de Qwen, podría usarse para generación de texto en entornos controlados, previa validación de calidad y sesgos.
- Despliegue en pipelines de Transformers con `trust_remote_code`: el tag `custom_code` indica que requiere cargar código remoto, lo que condiciona su integración en entornos con políticas de seguridad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren GPUs de 80 GB (A100, H100) o configuraciones multi-GPU.
- Cuantización a 8 bits: en torno a 26-28 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o con offloading parcial.
- Cuantización a 4 bits: alrededor de 13-15 GB de pesos, lo que permitiría su ejecución en GPUs de consumo como RTX 4090 o RTX 3090, siempre que existan pesos cuantizados (no publicados en el repo).
- GPUs recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs para inferencia en precisión completa.
- Opciones de despliegue: Transformers (librería declarada), con posible uso de vLLM o TGI si la arquitectura `qwen3_5` es compatible; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-z3-z1123a | 26.085 M | no disponible | Apache-2.0 | Hugging Face (repo público, 0 descargas) |
| Qwen/Qwen3.8-27B (base) | ~27.000 M (según nombre) | no disponible | no disponible | Hugging Face |
| Alternativas de ~27B densos | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría, ya que no se han publicado benchmarks ni especificaciones detalladas del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, lo que impide recomendarlo para producción sin una evaluación propia.
- Model card mínima: no se describen datos de entrenamiento, sesgos, alineación ni limitaciones conocidas.
- Riesgo de alucinación: no evaluado; al ser un ajuste fino de un LLM, es esperable, pero no está cuantificado.
- Idiomas y contexto: no confirmados; no se puede asumir el soporte multilingüe del base sin verificación.
- Requiere `trust_remote_code`: el tag `custom_code` implica ejecutar código del autor, con el riesgo de seguridad asociado en entornos de producción.
- Licencia Apache-2.0: permite uso comercial, pero deben revisarse los ficheros LICENSE y NOTICE para las atribuciones del modelo base Qwen.
- Madurez: creado el 23 de noviembre de 2026, sin descargas ni "likes", sin comunidad ni mantenimiento demostrado.
- Uso previsto restringido: el autor lo describe como componente de un pool concreto de la subnet Zils, lo que puede limitar su idoneidad fuera de ese contexto.

## Enlaces

- Hugging Face: https://huggingface.co/joamCriff123/zils-z3-z1123a
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
