# f3nc3r/GLiDE-0.4B-Q4_K_M-GGUF

## Resumen

GLiDE-0.4B es un modelo encoder de tipo ModernBERT desarrollado por Fastino, diseñado específicamente como modelo de decisión y no como modelo generativo de texto. Dado un estado de entrada y un conjunto de preguntas tipadas, el modelo puntúa las opciones proporcionadas y devuelve probabilidades sobre ellas. Esta ficha describe la versión cuantizada Q4_K_M en formato GGUF, publicada por el usuario f3nc3r, que empaqueta el checkpoint BF16 original del modelo base `fastino/GLiDE-0.4B` en un único fichero de 259,74 MiB.

El modelo base cuenta con 395.042.816 parámetros (aproximadamente 0,4B) y emplea una arquitectura ModernBERT con una cabeza de decisión específica de GLiDE que produce 255 códigos de opción (de `A` a `JU`). Utiliza pooling de tipo `LAST` sobre la representación del encoder y una capa de salida `cls.output.weight` de forma `[1024, 255]`. Su pipeline declarado es `text-classification` y `feature-extraction`.

La relevancia de esta publicación es doble: por un lado, ofrece una vía para ejecutar GLiDE en entornos locales mediante llama.cpp; por otro, documenta los cambios necesarios en el conversor de llama.cpp para reconocer el layout encoder/readout de GLiDE y evitar que se confunda con checkpoints `pplx-decider`. Es importante subrayar que este GGUF no es un modelo de chat estándar y requiere un build de llama.cpp con soporte específico para GLiDE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder con readout de decisión GLiDE |
| Parámetros totales | 395.042.816 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (5,48 BPW) |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License |
| Formato de pesos | GGUF (artefacto cuantizado); checkpoint original en BF16 |
| Tamaño de fichero | 272.358.688 bytes (259,74 MiB) |
| Número de tensores | 171 |
| Pooling | LAST (`modern-bert.pooling_type = 3`) |
| Códigos de opción | 255 (`A`–`JU`) |
| Forma del readout | `cls.output.weight` `[1024, 255]` |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT (`ModernBertForMaskedLM` como backbone) con una cabeza de decisión añadida específica de GLiDE. La conversión a GGUF exporta los pesos del encoder, registra el pooling tipo `LAST`, almacena los 255 códigos de opción en `classifier.output_labels` y mapea `readout.safetensors` al tensor `cls.output.weight`. El artefacto cuantizado contiene 171 tensores y se genera en dos pasos: conversión del checkpoint Hugging Face a un GGUF F16 intermedio y posterior cuantización a Q4_K_M con `llama-quantize`.

Los cambios introducidos en el conversor de llama.cpp son relevantes para reproducir el proceso: se restringió la detección de checkpoints `pplx-decider` a los tipos de modelo Qwen3.5 (`qwen3_5_text`, `qwen3_5`, `qwen3_5_moe`) para evitar que los checkpoints ModernBERT de GLiDE, que también contienen `decision_config.json` y `readout.safetensors`, fuesen mal identificados. Además, se añadió y registró `GlideModernBertModel` en `conversion/bert.py` y `conversion/__init__.py`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de lo propio de ModernBERT.

## Capacidades

- Modelo de decisión: puntúa un conjunto de opciones tipadas y devuelve probabilidades sobre ellas, en lugar de generar texto libre.
- Soporta hasta 255 códigos de opción (`A`–`JU`) mediante la cabeza de readout `cls.output.weight`.
- Extracción de características (`feature-extraction`) a partir de la representación del encoder con pooling `LAST`.
- Clasificación de texto (`text-classification`) como pipeline declarado.
- Interfaz de decisión expuesta mediante el endpoint `/v1/systemone` en el build compatible de llama.cpp.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Toma de decisiones estructuradas: el modelo recibe un estado de entrada y una pregunta con opciones discretas, y devuelve la distribución de probabilidad sobre cada opción, adecuado para sistemas de enrutamiento o selección entre alternativas predefinidas.
- Clasificación de texto con etiquetas fijas: al disponer de 255 códigos de opción, puede emplearse para tareas de clasificación con hasta ese número de clases, usando el readout como clasificador.
- Extracción de características para pipelines de downstream: la salida del encoder con pooling `LAST` puede alimentar clasificadores o recuperadores posteriores.
- Componente de decisión en sistemas mayores: integrado mediante el endpoint `/v1/systemone`, puede actuar como subsistema de selección dentro de un agente o flujo de orquestación, siempre que la decisión se reduzca a elegir entre opciones tipadas.
- Despliegue local en entornos con recursos limitados: con 259,74 MiB en Q4_K_M, cabe en hardware modesto y permite ejecutar la decisión sin depender de servicios externos.
- Evaluación y experimentación con modelos de decisión: útil para investigar arquitecturas encoder+readout y comparar cuantizaciones en tareas de selección, dado su reducido tamaño.
- Filtrado o triaje previo: puede puntuar opciones de forma rápida en pipelines que necesiten descartar alternativas antes de un paso generativo más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en Q4_K_M (fichero de 259,74 MiB más overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo, e incluso es viable en CPU por su reducido tamaño.
- Opciones de despliegue: llama.cpp con soporte específico para GLiDE (build `fencerJP/llama.cpp-glide`), que expone el endpoint `/v1/systemone`. No se indica compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| GLiDE-0.4B Q4_K_M (esta ficha) | ~395M | no disponible | Encoder de decisión (ModernBERT) | Fastino Community License | GGUF |
| fastino/GLiDE-0.4B (base) | ~395M | no disponible | Encoder de decisión (ModernBERT) | Fastino Community License | BF16 safetensors |
| Alternativas de encoder de clasificación de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables con datos de rendimiento verificables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo puntúa opciones predefinidas.
- Requiere un build de llama.cpp con soporte GLiDE específico; un build genérico puede no reconocer el layout encoder/readout y fallar al cargar el modelo.
- No se documentan los idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- No se dispone de información sobre sesgos conocidos ni sobre la tasa de alucinación (concepto menos aplicable a un modelo de decisión, pero relevante si se interpretan sus probabilidades como certeza).
- La licencia Fastino Community License puede imponer restricciones para uso comercial; es necesario revisar el fichero LICENSE y el NOTICE del modelo base antes de desplegarlo en producción.
- Los componentes de terceros pueden tener términos separados; conviene verificar la atribución.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día; no hay validación comunitaria del artefacto.
- La fecha de creación indicada (2026-11-17) es posterior a la fecha actual; conviene verificar la consistencia de los metadatos del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/f3nc3r/GLiDE-0.4B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/fastino/GLiDE-0.4B
- Licencia del modelo base: https://huggingface.co/fastino/GLiDE-0.4B/blob/main/LICENSE
- NOTICE del modelo base: https://huggingface.co/fastino/GLiDE-0.4B/blob/main/NOTICE
- Build de llama.cpp con soporte GLiDE: https://github.com/fencerJP/llama.cpp-glide
- llama.cpp HOWTO Add a Model: https://github.com/ggml-org/llama.cpp/blob/master/docs/development/HOWTO-add-model.md
- llama.cpp issue #32152: https://github.com/ggml-org/llama.cpp/issues/32152
