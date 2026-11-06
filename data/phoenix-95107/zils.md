# Phoenix-95107/zils

## Resumen

Zils soup body es un modelo de decisión de 0,85 mil millones de parámetros derivado de Qwen/Qwen3.5-0.8B mediante un proceso de model soup (promediado de pesos). Lo desarrolla el usuario Phoenix-95107 y está pensado como "body" (cuerpo de pesos) para el pool de soups `d3-lite` de Zils, un sistema de entrenamiento de modelos pequeños de decisión asociado al subnet 127 de Bittensor. El modelo no se presenta como un asistente conversacional general, sino como la capa de pesos que, combinada con el "chassis" fijado del pool (capa de respuesta, prompt y runtime), produce un modelo capaz de clasificar peticiones, marcar problemas o puntuar coincidencias.

El modelo parte del promedio uniforme de dos fine-tunes previos (thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5). Sobre ese punto de partida se realizaron dos fine-tunes independientes, cada uno con un LoRA fusionado entrenado con `zils.teacher train`, y los resultados se promediaron de nuevo de forma uniforme. El repositorio contiene únicamente pesos (1,7 GB en formato safetensors) y no incluye código de inferencia ni la capa de respuesta, que aporta el chassis del pool.

Su relevancia es acotada pero específica: se trata de un artefacto de competición dentro de un ecosistema de entrenamiento distribuido, con licencia Apache 2.0 y un tamaño que cabe en cualquier GPU de consumo. No hay métricas publicadas en la información disponible, ni idiomas declarados, ni pipeline de inferencia definido en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-0.8B; detalles internos no disponibles) |
| Parametros totales | 852.985.920 (0,85 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,85 B parámetros. No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto nativa del base. El modelo final se construye por promediado de pesos (model soup), una técnica que combina los parámetros de varios fine-tunes del mismo origen para obtener un punto en el espacio de pesos con mejor generalización que cualquiera de sus componentes por separado.

El entrenamiento se realizó en dos rondas. Primero se calculó la media uniforme de thermopylae-777/zils-lite-body-2 y dasLOL/zils-lite-skills-v5. Desde ese punto de partida se ejecutaron dos fine-tunes independientes con `zils.teacher train`, cada uno con su propio LoRA fusionado y su propio muestreo de datos. El primer fine-tune usó 86.526 filas (33.816 de "generated and datasets", 12.710 de "pin" y 40.000 de "relay", tras descartar duplicados y filas demasiado largas). El segundo usó 86.868 filas con una composición similar (33.817 generadas, 13.051 de pin y 40.000 de relay). Las filas provienen de splits de entrenamiento, con una excepción indicada por la fuente: validación de Crisscrossed Captions. El autor declara que no se usaron datos del examen del validador ni datos de clientes, y que los ítems semilla públicos se excluyeron del entrenamiento. Finalmente, los dos fine-tunes se promediaron de forma uniforme para producir este body.

No se documenta el uso de RLHF, DPO ni ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.). El modelo no incluye la capa de respuesta: esta la aporta el chassis fijado del pool d3-lite.

## Capacidades

- Clasificación y decisión: el modelo está diseñado para ordenar peticiones, marcar problemas o puntuar coincidencias, según la descripción del proyecto Zils.
- Tareas de enrutamiento y triaje: al ser un modelo de decisión de 0,85 B, su función prevista es emitir juicios categóricos o puntuaciones sobre entradas cortas.
- Integración con el pool d3-lite: funciona como cuerpo de pesos que, junto con el chassis del pool (prompt, capa de respuesta y runtime), completa el sistema de decisión.
- Generación de texto, razonamiento, código, matemáticas y visión: no disponible en la información proporcionada; no se declaran capacidades de este tipo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Triaje de solicitudes en aplicaciones: el modelo puede puntuar o clasificar peticiones entrantes (soporte, incidencias, consultas) usando el prompt y la capa de respuesta del chassis d3-lite, aprovechando su tamaño reducido para inferencia de baja latencia.
- Marcado de problemas en pipelines de datos: puede emplearse para etiquetar registros anómalos o duplicados en flujos de ingesta, dado su entrenamiento orientado a decisión y su huella de memoria mínima.
- Puntuación de coincidencias en sistemas de recomendación o matching: el modelo puede emitir una puntuación de afinidad entre pares de entradas, integrándose como componente de scoring en un servicio existente.
- Enrutamiento de consultas en un asistente: puede decidir a qué submodelo o herramienta derivar una petición, actuando como clasificador previo de bajo coste en una arquitectura de cascada.
- Evaluación de candidatos en competiciones de Bittensor: el body está preparado para ser evaluado en el chassis fijado del pool d3-lite del subnet 127, por lo que sirve como participante en la competición de entrenamiento de Zils.
- Filtrado previo en moderación de contenido: puede clasificar entradas según criterios definidos en el prompt del chassis, reduciendo el volumen que llega a modelos mayores.
- Prototipado rápido en CPU o GPU de gama baja: al tener 0,85 B parámetros (1,7 GB en safetensors), permite experimentar con el pipeline de decisión en hardware modesto antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las tareas de decisión del pool d3-lite, y la página de investigación de Zils menciona benchmarks públicos registrados sin que se hayan proporcionado sus valores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precisión de 16 bits (tamaño del repo en safetensors); alrededor de 0,9 GB en cuantización de 8 bits y 0,5 GB en 4 bits, estimaciones calculadas a partir del número de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090 y en GPUs de datacenter como A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs de consumo actuales, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el repo solo contiene safetensors, por lo que requiere cargar los pesos con transformers o un runtime compatible con el base Qwen3.5-0.8B. No se publican variantes GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia. vLLM y TGI son viables si el base Qwen3.5-0.8B está soportado por esos motores, lo cual no se confirma en la información disponible. El uso previsto pasa por el runtime del chassis d3-lite.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zils soup body (este modelo) | 0,85 B | no disponible | no disponible | Apache 2.0 | Pesos en Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| thermopylae-777/zils-lite-body-2 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| dasLOL/zils-lite-skills-v5 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión de menos de 1 B) no puede completarse con datos numéricos: no se dispone de parámetros, contexto ni métricas de los modelos del propio pool, y no se identifican en la información proporcionada otros modelos de decisión comparables fuera del ecosistema Zils.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo describe como body para un pool de soups con un chassis específico; fuera de ese runtime su comportamiento no está garantizado.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones que permitan estimar su calidad frente a alternativas, lo que dificulta justificar su uso en producción.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de decisión, el riesgo se traduce en clasificaciones o puntuaciones incorrectas sin señal de confianza documentada.
- Sesgos conocidos: no documentados; el entrenamiento usa datos de "generated and datasets", "pin" y "relay" cuya composición y procedencia no se detalla, lo que impide auditar sesgos.
- Idiomas: no se declaran idiomas soportados; se desconoce si el ajuste conserva las capacidades multilingües del base Qwen3.5-0.8B.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar entradas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte que cada fuente de datos tiene su propia licencia y que el repositorio contiene solo pesos; el uso comercial exige verificar las licencias de los datos de entrenamiento y del modelo base.
- Datos excluidos: el autor declara que no se usaron datos del examen del validador ni datos de clientes, pero no aporta evidencia verificable de ello.
- Madurez: creado y actualizado en noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; es un artefacto experimental de competición sin adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoenix-95107/zils
- Zils (sitio principal): https://zils.ai/
- Zils, investigación del modelo de decisión: https://zils.ai/model
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Componente del soup: https://huggingface.co/dasLOL/zils-lite-skills-v5
