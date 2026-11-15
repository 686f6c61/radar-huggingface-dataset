# joamCriff123/zils-lite-l1114b

## Resumen

zils-lite-l1114b es un modelo de 852.985.920 parámetros publicado en Hugging Face por el usuario joamCriff123. Se presenta como un "d3-lite decision body" de la familia Qwen3.5-0.8B, afinado a partir de Qwen/Qwen3.5-0.8B y orientado a tareas de extracción de características y toma de decisiones dentro de lo que el autor denomina "Zils subnet 127 lite pool". El pipeline declarado en Hugging Face es `feature-extraction`, no generación de texto, lo que condiciona su uso previsto.

La información pública es muy escasa: la model card se limita a una descripción de una línea, no se declaran idiomas soportados, no hay datos de benchmarks ni documentación sobre el proceso de entrenamiento. El repositorio ocupa 1,7 GB y los pesos están en formato safetensors con código personalizado (`custom_code`), lo que implica que la carga requiere confiar en implementaciones del autor y no solo en `transformers` estándar.

Por su tamaño (menos de mil millones de parámetros) y su licencia Apache-2.0, el modelo es relevante únicamente como artefacto experimental de un ecosistema muy específico. No debe confundirse con un modelo de chat o instrucciones de propósito general: las etiquetas `decision-model`, `zils` y `d3-lite` apuntan a un uso de clasificación o puntuación dentro de un pipeline concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (derivada de Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Requiere codigo personalizado | si (`custom_code`) |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo deriva de Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura transformer de esa familia, aunque la model card no detalla variantes (atención, normalización, tokenizador) ni confirma qué componentes se han modificado. El tamaño real de pesos (852.985.920 parámetros) es coherente con un modelo de la clase 0.8B, lo que sugiere que el ajuste no ha alterado sustancialmente la estructura del modelo base.

No se publica información sobre el dataset de entrenamiento, el número de tokens, la composición de datos, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas (decodificación especulativa, atención lineal, mezcla de expertos). La etiqueta `decision-model` y la referencia a "Zils subnet 127 lite pool" indican un ajuste orientado a una tarea de decisión concreta, pero sin más detalle en la información disponible.

## Capacidades

- Extracción de características: es el pipeline declarado y el uso principal documentado.
- Toma de decisiones: la etiqueta `decision-model` sugiere puntuación o clasificación, sin especificar el dominio.
- Generación de texto: no declarada; al ser un modelo base de la familia Qwen3.5, podría tener capacidad generativa, pero no se documenta ni se garantiza.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Puntuación o clasificación dentro de un pipeline de decisión: el modelo se presenta como "decision body" para el pool "Zils subnet 127 lite", por lo que su uso natural es como componente de scoring en ese sistema concreto.
- Extracción de embeddings para downstream: al declararse `feature-extraction`, puede emplearse para obtener representaciones vectoriales de texto en tareas de recuperación o clasificación, siempre que se valide su calidad.
- Prototipado de clasificadores ligeros: con menos de mil millones de parámetros y licencia Apache-2.0, permite experimentar en entornos con recursos limitados.
- Filtrado o enrutamiento de peticiones: un modelo de decisión pequeño puede servir como primera etapa de un sistema mayor que derive consultas a modelos más grandes.
- Investigación sobre ajuste de modelos base pequeños: útil para estudiar cómo se comporta un fine-tune de Qwen3.5-0.8B en tareas específicas.
- Evaluación de ecosistemas emergentes: como artefacto de un subnet concreto, sirve para analizar prácticas de publicación y reproducibilidad en comunidades pequeñas.

En todos los casos, la ausencia de benchmarks y de documentación obliga a validar el modelo empíricamente antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más memoria para activaciones y overhead del runtime; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de 4-8 GB.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están confirmados para este modelo y requerirían conversión o adaptación por el `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-l1114b | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune de Qwen3.5-0.8B, `custom_code` |
| Qwen/Qwen3.5-0.8B | ~0.8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Modelo upstream del que deriva |
| Alternativas de la clase 0.8B (p. ej. Qwen2.5-0.5B, Llama-3.2-1B) | 0,5-1,2B | 32K-128K según modelo | Apache-2.0 / Llama | Amplia | Modelos de propósito general con documentación y benchmarks públicos |

La comparación con alternativas de la misma clase es desfavorable en términos de información: los modelos de propósito general de tamaño similar publican benchmarks, idiomas y guías de despliegue, mientras que zils-lite-l1114b no ofrece ninguno de esos datos.

## Limitaciones y advertencias

- Información insuficiente: no hay benchmarks, idiomas declarados ni documentación de entrenamiento; cualquier evaluación de calidad debe hacerse por cuenta propia.
- Código personalizado: el tag `custom_code` obliga a ejecutar código del autor al cargar el modelo con `transformers`, lo que supone un riesgo de seguridad y de reproducibilidad.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo se traslada a clasificaciones erróneas o scores poco calibrados.
- Sesgos: desconocidos, al no documentarse la composición del dataset de ajuste.
- Limitaciones de contexto e idioma: no disponibles; no se puede asumir multilingüismo ni una ventana concreta.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones; conviene revisar el LICENSE y NOTICE del repositorio.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción ni mantenimiento.
- Confusión de propósito: no es un modelo de chat ni de instrucciones; usarlo como tal probablemente dé resultados pobres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1114b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Qwen (organización): https://huggingface.co/Qwen
