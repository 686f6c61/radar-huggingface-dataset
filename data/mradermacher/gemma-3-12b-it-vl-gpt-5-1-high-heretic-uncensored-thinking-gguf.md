# mradermacher/gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking-GGUF

## Resumen

Esta ficha describe una cuantización GGUF del modelo `DavidAU/gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking`, un fine-tune sobre Gemma 3 12B IT con capacidades de visión y lenguaje. El autor del artefacto publicado es mradermacher, un conocido cuantizador de la comunidad open source que genera versiones GGUF estáticas de modelos populares para su uso en llama.cpp y entornos compatibles. El modelo original combina la base de Google Gemma 3 12B con un ajuste fino orientado a escritura creativa y razonamiento, entrenado sobre el dataset `TeichAI/gpt-5.1-high-reasoning-1000x`.

La relevancia de esta publicación radica en que ofrece una vía práctica para ejecutar un modelo multimodal de 11.766 millones de parámetros en hardware de consumo mediante cuantización GGUF, con opciones desde Q2_K (4,9 GB) hasta Q8_0 (12,6 GB). El modelo incorpora además técnicas de "abliteration" y "heretic" que buscan reducir los mecanismos de rechazo del modelo base, lo que lo orienta a usos creativos sin restricciones temáticas, aunque con implicaciones éticas y de seguridad que deben considerarse.

El contexto de entrenamiento declarado es exclusivamente en inglés, y la licencia es Apache 2.0 según la model card, aunque conviene verificar las condiciones heredadas del modelo base Gemma, que tiene su propia licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 3 12B IT) con adaptador de visión; fine-tune con abliteration |
| Parametros totales | 11.766.034.176 (11,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (según model card; verificar condiciones del base Gemma) |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 12B IT, un transformer decoder-only de Google con capacidades multimodales (visión y lenguaje). Sobre esta base, el autor DavidAU aplicó un fine-tune orientado a escritura creativa y razonamiento, entrenado sobre el dataset `TeichAI/gpt-5.1-high-reasoning-1000x`, que según la nomenclatura contiene aproximadamente 1000 ejemplos de razonamiento de alta calidad. El proceso incluye técnicas de "abliteration" y "heretic", que buscan eliminar o reducir las capas de rechazo del modelo alineado, un procedimiento habitual en la comunidad para obtener modelos menos restrictivos.

La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1), con conversión desde formato HF y sin recuantización dinámica. Se ofrecen tanto cuantizaciones estándar como versiones imatrix en un repositorio separado (`-i1-GGUF`). No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO adicionales más allá del fine-tune declarado.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo "thinking" heredado del entrenamiento sobre datos de razonamiento.
- Capacidades de visión (VL): el modelo incluye adaptador multimodal (mmproj) para procesar imágenes junto con texto.
- Escritura creativa y ficción: el fine-tune está explícitamente orientado a narrativa, generación de tramas, subtramas, continuación de escenas y escritura vívida en múltiples géneros.
- Soporte de conversación multi-turno (pipeline conversacional).
- Modelo "uncensored"/abliterated: menor tendencia a rechazar peticiones por contenido sensible.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se ha confirmado soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Escritura creativa asistida: generación de relatos, novelas y guiones con continuidad de estilo y trama, aprovechando el fine-tune específico en ficción y la ventana de contexto del base Gemma 3.
- Generación de tramas y subtramas: el modelo puede producir estructuras narrativas complejas y ramificaciones argumentales para proyectos de ficción o videojuegos narrativos.
- Continuación de escenas: útil en herramientas de escritura interactiva donde el autor necesita sugerencias coherentes con el tono y los personajes previos.
- Análisis de imágenes con descripción narrativa: gracias al adaptador de visión, puede describir imágenes y convertirlas en texto creativo o contextualizado.
- Prototipado de asistentes de escritura sin restricciones temáticas: para entornos de investigación creativa donde se requiere explorar géneros como terror, romance o ciencia ficción sin filtros excesivos.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (7,4 GB) puede ejecutarse en GPUs de consumo como RTX 3060 de 12 GB o superiores, permitiendo privacidad total de los textos generados.
- Experimentación académica sobre alineación y abliteration: permite estudiar el comportamiento de modelos con capas de rechazo reducidas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_M: ~6,1 GB
  - IQ4_XS: ~6,7 GB
  - Q4_K_M: ~7,4 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
  - Añadir ~0,7-1,0 GB para el proyector multimodal (mmproj) si se usa visión.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para cuantizaciones altas con contexto largo; A100/H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, desde Q4_K_S en GPUs de 8-12 GB (con contexto moderado) hasta Q8_0 en GPUs de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo original en safetensors: transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (GGUF de Gemma 3 12B fine-tune) | 11,77 B | no disponible | Sí | apache-2.0 (verificar base) | GGUF |
| Gemma 3 12B IT (Google) | 12 B | 128K (según documentación de Google, no confirmado aquí) | Sí | Gemma license | safetensors, GGUF |
| Mistral Small 3.1 24B | 24 B | 128K | Sí | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-VL 7B | 7 B | 128K | Sí | Apache 2.0 | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparables provienen de conocimiento general y no de la información proporcionada en esta ficha; verificar en sus respectivas model cards.

## Limitaciones y advertencias

- El modelo está entrenado y declarado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un modelo "uncensored"/abliterated, puede generar contenido sensible, ofensivo o inapropiado sin las salvaguardas habituales; no es adecuado para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en tareas factuales.
- La licencia apache-2.0 declarada en la model card debe contrastarse con las condiciones del modelo base Gemma de Google, que impone restricciones adicionales de uso.
- El fine-tune sobre un dataset de razonamiento relativamente pequeño (1000 ejemplos) puede no mejorar de forma consistente el rendimiento general y podría degradar capacidades en tareas no relacionadas con escritura creativa.
- La cuantización Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- No hay información sobre benchmarks que permita validar el rendimiento real frente al modelo base.
- El repositorio ocupa 83,9 GB, lo que requiere espacio de almacenamiento considerable si se descargan múltiples cuantizaciones.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking-GGUF
- Modelo base (fine-tune): https://huggingface.co/DavidAU/gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/gpt-5.1-high-reasoning-1000x
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
