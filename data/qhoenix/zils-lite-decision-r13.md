# qhoenix/zils-lite-decision-r13

## Resumen

zils-lite-decision-r13 es un modelo de decisión de 0,85 mil millones de parámetros publicado por el usuario qhoenix en Hugging Face. Se construye sobre Qwen/Qwen3.5-0.8B mediante un proceso de *soup* (promediado de pesos) seguido de un ajuste fino completo de los pesos del lenguaje. El modelo pertenece a la familia Zils d3-lite, una línea de cuerpos pequeños orientados a tareas de decisión y clasificación, no a generación abierta de texto.

El modelo parte de una media ponderada: 50% de qhoenix/zils-lite-decision-v9 y 12,5% de cada uno de cuatro cuerpos Apache-2.0 (vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full). Sobre esa base se realiza un ajuste fino completo en FP32 con *learning rate* 5e-6 durante una época, sobre aproximadamente 86.000 ítems de decisión en el formato de examen Zils.

Su relevancia radica en que es un modelo extremadamente pequeño (1,7 GB en el repositorio) pensado para integrarse como componente de decisión en pipelines, con licencia Apache-2.0 y compatibilidad con la librería transformers y endpoints. No obstante, la información pública disponible es muy limitada: no hay datos de benchmarks, idiomas declarados ni documentación de la arquitectura interna más allá de la herencia de Qwen3.5-0.8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); *soup* de cuerpos d3-lite con ajuste fino completo |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; el autor menciona pesos maestros FP32 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, código personalizado: `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer heredado de Qwen3.5-0.8B, con 852.985.920 parámetros. La construcción sigue un esquema de *model soup*: se parte de una media ponderada de cinco cuerpos (50% de zils-lite-decision-v9 y 12,5% de cada uno de vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full), todos Apache-2.0. Sobre esa media se realiza un ajuste fino completo de los pesos del lenguaje con pesos maestros en FP32, *learning rate* 5e-6 y una época.

El entrenamiento emplea aproximadamente 86.000 ítems de decisión en el formato de examen Zils, extraídos de *splits* TRAIN públicos con etiquetas gold y de ítems redactados a partir de *splits* TRAIN públicos de conjuntos de datos de uso comercial. La función de pérdida combina entropía cruzada suave y *Brier loss*, con un ancla KL (coeficiente 0,1) respecto al modelo de partida. El autor declara explícitamente que no se usaron semillas de examen, ni *splits* de validación o test, durante el entrenamiento. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y decisión: el modelo está diseñado para tareas de decisión en el formato de examen Zils, no para generación abierta de texto.
- Extracción de características: la *pipeline* declarada es `feature-extraction`, por lo que puede emplearse para obtener representaciones internas.
- Ajuste fino específico: entrenado con pérdida de decisión (entropía cruzada suave + Brier) orientada a etiquetas probabilísticas.
- Herencia de Qwen3.5-0.8B: al derivar de un modelo base de la familia Qwen3.5, podría conservar parte de las capacidades del base, aunque no se documentan explícitamente.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Clasificación binaria o multietiqueta en pipelines de producción: el modelo puede integrarse como clasificador de decisión gracias a su tamaño reducido (852 M de parámetros) y su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales.
- Enrutamiento de consultas en sistemas RAG: usar el modelo como componente de decisión para determinar si una consulta requiere recuperación, respuesta directa o derivación a otro servicio, aprovechando su formato de examen Zils.
- Moderación y filtrado de contenido: emplear la salida probabilística (entrenada con *Brier loss*) para puntuar la probabilidad de que un texto cumpla un criterio definido, con umbral ajustable.
- Extracción de características para *downstream*: al declararse como `feature-extraction`, puede usarse para generar *embeddings* de frases o documentos que alimenten clasificadores o sistemas de búsqueda semántica.
- Evaluación automática de respuestas: el formato de examen Zils y la pérdida de decisión lo hacen adecuado para puntuar respuestas candidatas en entornos de evaluación o *benchmarking* interno.
- Prototipado rápido en hardware modesto: con 1,7 GB de repositorio y pesos BF16, cabe en GPUs de consumo y permite iterar en local antes de escalar a modelos mayores.
- Componente de un *ensemble* de decisión: su construcción como *soup* de cinco cuerpos lo convierte en un candidato para combinar con otros clasificadores pequeños en sistemas de votación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en BF16 (tamaño del repositorio); en FP16 similar; en cuantizaciones de 8 bits o 4 bits podría reducirse por debajo de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles según los tags; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y la presencia de `custom_code` puede requerir `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qhoenix/zils-lite-decision-r13 | 852.985.920 | no disponible | Apache-2.0 | Decisión / clasificación (formato Zils) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la información | Modelo base de propósito general |
| internlm/Intern-Decision-0.8B | ~0,8 B | no disponible | Apache-2.0 (según el autor) | Decisión |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 (según el autor) | Decisión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de cuerpos entrenados con datos públicos, puede heredar sesgos de esos conjuntos.
- Riesgo de alucinación: el modelo está orientado a decisión y clasificación, no a generación factual; su uso como generador abierto no está validado.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas soportados, lo que impide garantizar su comportamiento fuera del inglés o de entradas cortas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo incorpora pesos de Qwen3.5-0.8B y de otros cuerpos; conviene verificar las licencias de todos los componentes base antes de un despliegue comercial.
- Código personalizado: el tag `custom_code` implica que la carga requiere `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar código del autor.
- Madurez: el repositorio tiene 0 descargas y 0 *likes*, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni validación externa.
- Sin *splits* de validación o test: el autor declara no haber usado validación ni test, por lo que no hay métricas de generalización publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-r13
- Modelo relacionado (zils-lite-decision): https://huggingface.co/qhoenix/zils-lite-decision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo base vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo base internlm/Intern-Decision-0.8B: https://huggingface.co/internlm/Intern-Decision-0.8B
- Cuerpo base Maincode/Matilda-Decision-v1-Edge: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Cuerpo base zils-ai/jiwo-0.8b-full: https://huggingface.co/zils-ai/jiwo-0.8b-full
