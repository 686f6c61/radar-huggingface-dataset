# joamCriff123/zils-lite-lsx79

## Resumen

zils-lite-lsx79 es un modelo de decisión ("decision body") de la familia d3-lite, derivado mediante fine-tuning LoRA del modelo base Qwen/Qwen3.5-0.8B. Lo publica el usuario joamCriff123 en Hugging Face y está pensado para el pool "lite" de la subred 127 de Zils, una plataforma cuyo objetivo es entrenar modelos pequeños capaces de clasificar peticiones, señalar problemas o puntuar coincidencias a partir de ejemplos etiquetados por el usuario. No es, por tanto, un modelo conversacional de propósito general, sino una pieza especializada en tareas de decisión y extracción de características.

El modelo parte de un "soup" (mezcla de pesos) previo, qhoenix/zils-lite-decision-v9, sobre el que se aplicaron dos ejecuciones LoRA con semillas distintas; el cuerpo final es la media de ambas. El entrenamiento se realizó sobre ítems en formato de examen generados con OpenAI Codex, DeepSeek y Gemini (con verificación ciega por una segunda pasada) y sobre los exámenes semilla públicos de Zils v1 y v4.

Con 852.985.920 parámetros (aproximadamente 0,85 mil millones) y un repositorio de 1,7 GB, se sitúa en la gama ultraligera, apta para inferencia en CPU o en GPU de consumo. Su licencia Apache-2.0 y su compatibilidad con endpoints de transformers lo hacen fácilmente desplegable, aunque la ausencia de benchmarks publicados y de documentación sobre idiomas limita la evaluación objetiva de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización GGUF/AWQ no documentada) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El modelo se distribuye con `custom_code`, lo que implica que requiere cargar código propio del repositorio para instanciarlo correctamente en transformers. La tarea declarada en el pipeline es `feature-extraction`, coherente con su uso como extractor de representaciones para decisiones.

El entrenamiento consistió en un fine-tuning LoRA sobre el soup qhoenix/zils-lite-decision-v9. Los datos son ítems en formato de examen escritos específicamente para esta tarea con OpenAI Codex, DeepSeek y Gemini, con cada respuesta verificada a ciegas por una segunda pasada, más los exámenes semilla públicos zils-ai/base-exam-seed-v1 y zils-ai/base-exam-seed-v4. El cuerpo final resulta de promediar dos ejecuciones LoRA con semillas diferentes, una técnica de ensembles de adaptadores que busca estabilizar el ajuste. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y decisión sobre peticiones: el modelo está diseñado para ordenar solicitudes, señalar problemas o puntuar coincidencias según ejemplos proporcionados por el usuario.
- Extracción de características: pipeline `feature-extraction`, útil para generar embeddings o representaciones internas.
- Razonamiento de formato de examen: entrenado sobre ítems tipo test, por lo que responde bien a preguntas con opciones o respuestas estructuradas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están declarados en la model card.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Triaje de solicitudes en atención al cliente: el modelo puede clasificar tickets entrantes en categorías predefinidas a partir de ejemplos etiquetados, aprovechando su entrenamiento específico en tareas de decisión.
- Moderación y marcado de contenido: entrenado para "flag problems", puede señalar mensajes que cumplan criterios definidos por el usuario en un conjunto de ejemplos.
- Puntuación de coincidencias en motores de búsqueda o recomendación: su capacidad de "score matches" permite ordenar pares consulta-documento o perfil-oferta.
- Enrutamiento de peticiones en pipelines internos: al ser ultraligero (0,85 B parámetros), puede desplegarse como clasificador previo que derive cada consulta al modelo grande adecuado.
- Evaluación automática de exámenes: dado su entrenamiento sobre ítems tipo test con verificación, puede usarse para corregir o validar respuestas estructuradas.
- Extracción de características para sistemas downstream: mediante `feature-extraction` puede alimentar clasificadores lineales o índices vectoriales en entornos con recursos limitados.
- Prototipado en CPU o GPU de consumo: su tamaño permite iterar rápidamente en local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,7 GB de pesos más overhead de activaciones y caché KV; en fp32, unos 3,4 GB. En cuantización de 8 bits cabría en torno a 0,9 GB, y en 4 bits alrededor de 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4). Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, e incluso en CPU con llama.cpp si se generan pesos GGUF.
- Opciones de despliegue: transformers (requiere `trust_remote_code` por el `custom_code`), vLLM y TGI si el código personalizado es compatible, llama.cpp/Ollama previa conversión a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con los Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-lsx79 | 0,85 B | No disponible | Decision / feature-extraction | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Generacion de texto | Apache-2.0 (segun base) | Hugging Face |
| qhoenix/zils-lite-decision-v9 | No disponible | No disponible | Decision | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-0.8B y de datos generados por modelos comerciales (Codex, DeepSeek, Gemini), puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: presente, como en cualquier modelo generativo de base; su uso como clasificador reduce pero no elimina este riesgo si se emplea en modo generativo.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están declarados, lo que impide garantizar su comportamiento fuera del inglés o de entradas cortas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones de upstream indicadas en LICENSE y NOTICE.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes, sin benchmarks ni validación externa; requiere `trust_remote_code` por el código personalizado, lo que implica revisar el código antes de ejecutarlo. Está especializado en el pool lite de la subred 127 de Zils y su rendimiento fuera de ese dominio no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-lite-lsx79
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Soup de partida: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Examen semilla v1: https://huggingface.co/zils-ai/base-exam-seed-v1
- Examen semilla v4: https://huggingface.co/zils-ai/base-exam-seed-v4
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio web de Zils: https://zils.ai/
