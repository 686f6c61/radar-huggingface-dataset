# Sean123123123/zils-z3-r3

## Resumen

zils-z3-r3 es un modelo de extracción de características publicado por el usuario Sean123123123 en Hugging Face, construido como un "soup body" de la familia Zils sobre el fine-tune `vllm-sr/d3-ultra`, cuyo modelo padre es `Qwen/Qwen3.8-27B`. El modelo conserva la torre de visión intacta del chasis original y solo ha entrenado las capas de lenguaje mediante LoRA (r=16, alpha=32), fusionadas en FP32 y almacenadas en BF16. Cuenta con 26.085.330.160 parámetros totales según los pesos en safetensors y un repositorio de 52,2 GB.

El problema que aborda es la calibración de decisiones basadas en resultados del mundo real: se entrenó con 13.533 ejemplos de decisión extraídos de eventos resueltos (reversiones de ediciones en Wikipedia/Wikidata, revisiones de Articles for Creation, revisiones de código en Gerrit, resultados de preguntas en Stack Exchange y categorías de arXiv), combinados con particiones de entrenamiento de conjuntos de datos públicos etiquetados. La relevancia actual es limitada: se trata de un artefacto experimental sin descargas ni interacciones, con pipeline declarado de extracción de características y sin model card pública más allá de los metadatos.

La licencia es Apache 2.0 y la librería es transformers, con soporte declarado de `custom_code` y compatibilidad con endpoints. No se dispone de información sobre idiomas soportados, benchmarks ni detalles adicionales de arquitectura más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, con torre de visión; etiqueta `qwen3_5` en los tags) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `vllm-sr/d3-ultra`, un fine-tune de `Qwen/Qwen3.8-27B` (commit `1d4bf0f2`). La intervención consiste en un ajuste LoRA con rango 16 y alpha 32 aplicado exclusivamente a las capas de lenguaje; los adaptadores se fusionaron en FP32 y se almacenaron en BF16. La torre de visión del chasis original se mantiene sin cambios, por lo que el modelo conserva capacidades multimodales heredadas, aunque el entrenamiento no las haya modificado.

El conjunto de entrenamiento consta de 13.533 ejemplos de decisión construidos a partir de resultados reales resueltos: reversiones de ediciones en Wikipedia y Wikidata, revisiones de Articles for Creation, revisiones de código en Gerrit, resultados de preguntas en Stack Exchange y categorías de arXiv. Estos datos se recopilaron con las herramientas públicas Zils Outcomes en periodos anteriores a cualquier ventana de evaluación y se mezclaron con las particiones de entrenamiento de conjuntos públicos etiquetados, sin usar particiones de validación ni de test. Los hiperparámetros fueron: learning rate 0,0001, 1,0 épocas, peso Brier de 0,25 y semilla 86. La función de pérdida incorpora un componente Brier, lo que sugiere un objetivo de calibración probabilística de decisiones, aunque la model card no detalla la formulación exacta.

## Capacidades

- Extracción de características: pipeline declarado `feature-extraction`, orientado a representaciones para clasificación o scoring posterior.
- Razonamiento sobre resultados y calibración de decisiones: entrenado con eventos resueltos y peso Brier, apunta a estimar probabilidades de desenlace.
- Capacidades de lenguaje heredadas de Qwen3.8-27B: generación de texto y comprensión lectora, sin datos específicos publicados.
- Capacidades de visión heredadas del chasis: la torre visual se conserva sin reentrenar, pero no se documenta su comportamiento tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Moderación de ediciones colaborativas: el modelo puede puntuar la probabilidad de que una edición en Wikipedia o Wikidata sea revertida, usando el formato de ejemplos de decisión con el que fue entrenado; es adecuado porque el entrenamiento se construyó precisamente sobre reversiones reales.
- Triaje de revisiones de código: integrado en un pipeline de Gerrit, puede asignar una probabilidad de aceptación o rechazo a un cambio antes de la revisión humana, priorizando la cola de revisores.
- Filtrado de propuestas en Articles for Creation: permite estimar la probabilidad de que una propuesta sea aceptada, ayudando a ordenar la cola de revisión editorial.
- Priorización de preguntas en comunidades tipo Stack Exchange: puede clasificar preguntas según la probabilidad de obtener una respuesta aceptada, útil para sistemas de recomendación de contenido.
- Clasificación temática de preprints: con las categorías de arXiv como señal de entrenamiento, puede asistir en el etiquetado primario de manuscritos, siempre con verificación humana.
- Extracción de embeddings para clasificadores downstream: al declarar `feature-extraction`, puede usarse como codificador congelado para modelos de scoring entrenados sobre sus representaciones.
- Evaluación de riesgo en flujos de decisión automatizada: el objetivo Brier permite usar sus salidas como probabilidades calibradas en sistemas de decisión con umbrales, sujeto a validación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 52 GB solo para pesos (26,1 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; se requiere al menos una GPU de 80 GB para margen cómodo.
- Cuantización a 8 bits: aproximadamente 26 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizaciones más agresivas o descarga parcial.
- Cuantización a 4 bits: alrededor de 13-15 GB de pesos, lo que permitiría su ejecución en GPUs consumer de 24 GB (RTX 3090, RTX 4090), siempre que existan conversiones GGUF disponibles, que no se documentan.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; para consumer, RTX 4090 o RTX 3090 con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), con soporte de `custom_code`; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-z3-r3 | 26,1 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune LoRA de d3-ultra con objetivo Brier |
| Qwen/Qwen3.8-27B | ~27 B (según nombre) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del chasis |
| vllm-sr/d3-ultra | no disponible | no disponible | no disponible en esta ficha | Hugging Face | Fine-tune intermedio del que deriva zils-z3-r3 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el entrenamiento se apoya en decisiones de comunidades concretas (Wikipedia, Gerrit, Stack Exchange, arXiv), lo que puede introducir sesgos hacia las políticas y sesgos de esas plataformas.
- Riesgo de alucinación: al conservar las capas de lenguaje de un modelo generativo, mantiene el riesgo de generar contenido incorrecto; el ajuste no elimina este comportamiento.
- Contexto e idiomas: no se documenta la longitud de contexto efectiva ni los idiomas soportados; no debe asumirse un rendimiento multilingüe sin evaluación.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones de los modelos base (`vllm-sr/d3-ultra` y `Qwen/Qwen3.8-27B`) deben verificarse por separado antes de producción.
- Validación: el autor declara no haber usado particiones de validación ni de test, por lo que no existen métricas de generalización publicadas; cualquier uso en producción requiere evaluación propia.
- Madurez: cero descargas y cero interacciones en Hugging Face; es un artefacto experimental sin soporte comunitario documentado.
- Código personalizado: el tag `custom_code` implica que la carga requiere confiar en código del repositorio, lo que añade riesgo de seguridad en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sean123123123/zils-z3-r3
- Modelo base intermedio: https://huggingface.co/vllm-sr/d3-ultra
- Modelo padre: https://huggingface.co/Qwen/Qwen3.8-27B
