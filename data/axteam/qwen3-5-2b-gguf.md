# axteam/Qwen3.5-2B-GGUF

## Resumen

`axteam/Qwen3.5-2B-GGUF` es una conversión a formato GGUF del modelo `Qwen/Qwen3.5-2B`, publicada por el usuario axteam. Se trata, por tanto, de un derivado cuantizado y no de un modelo entrenado desde cero: los pesos originales y el tokenizador pertenecen al equipo Qwen (Alibaba Cloud), y el trabajo de axteam consiste en la conversión mediante `convert_hf_to_gguf.py` de llama.cpp y la publicación de dos cuantizaciones listas para usar.

El modelo base pertenece a la serie Qwen3.5, descrita por sus autores como una familia multilingüe con arquitectura híbrida y mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3. El recuento real de parámetros en safetensors es de 1.942.653.248 (aproximadamente 1,94 mil millones), coherente con la denominación comercial "2B". El repositorio ocupa 3,4 GB e incluye únicamente dos ficheros: `Qwen3.5-2B-Q4_K_M.gguf` (1,3 GB) y `Qwen3.5-2B-Q8_0.gguf` (2,1 GB).

La relevancia de esta ficha es práctica: permite ejecutar un modelo de la familia Qwen3.5 en hardware de consumo mediante llama.cpp, Ollama o LM Studio, con licencia Apache-2.0 y sin dependencia de GPUs de datacenter. Conviene tener en cuenta que la conversión es solo de texto: el codificador visual del modelo original no está incluido en estos GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen3.5; la documentación de la serie menciona arquitectura híbrida con Gated Delta Networks y MoE disperso, si bien no se confirma esta configuración para la variante de 2B) |
| Parámetros totales | 1.942.653.248 (≈1,94 B), dato real de safetensors |
| Parámetros activos | No disponible (no se confirma que la variante 2B sea MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa `-c 8192`, pero es un ajuste de runtime, no el máximo del modelo) |
| Tipos de cuantización | Q4_K_M (4 bits, k-quant medium) y Q8_0 (8 bits) |
| Idiomas soportados | No disponible; la serie Qwen3.5 se describe como multilingüe y la model card incluye ejemplos en coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 3,4 GB con dos ficheros: Q4_K_M de 1,3 GB y Q8_0 de 2,1 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5. La documentación de la serie citada en las fuentes describe una "arquitectura híbrida eficiente" que combina Gated Delta Networks con mezcla de expertos dispersa (MoE) para obtener inferencia de alto rendimiento, además de un entrenamiento de fusión temprana sobre tokens multimodales ("Unified Vision-Language Foundation"). No se dispone de confirmación de que la variante de 2B emplee MoE ni de cuántos expertos active; el recuento de 1,94 B parámetros totales es el único dato verificado. Tampoco se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

El trabajo de axteam se limita a la cuantización: conversión con `convert_hf_to_gguf.py`, preservación del `chat_template` original embebido y publicación de dos niveles de precisión (Q8_0, prácticamente equivalente al original, y Q4_K_M, aproximadamente la mitad de tamaño con una pérdida de calidad pequeña según el autor). El codificador visual del modelo original queda excluido, por lo que estos GGUF son estrictamente de texto.

## Capacidades

- Generación de texto conversacional en formato chat, gracias al `chat_template` original embebido en el GGUF.
- Razonamiento y seguimiento de instrucciones: la serie Qwen3.5 se presenta con mejoras en reasoning e instruction-following frente a Qwen3.
- Generación de código y tareas de agentes: la documentación de la serie menciona paridad o mejora frente a Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual (en el modelo completo; el GGUF no incluye visión).
- Capacidades multilingües heredadas del modelo base (la serie se describe como multilingüe; no hay lista cerrada de idiomas en la información disponible).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada; debe validarse contra la model card de `Qwen/Qwen3.5-2B`.
- Capacidad de visión: presente en el modelo original (entrenamiento multimodal de fusión temprana), ausente en esta conversión GGUF.
- Ejecución local en CPU y GPU mediante llama.cpp, Ollama y LM Studio.

## Casos de uso

- Asistente conversacional local en escritorio: con Q4_K_M (1,3 GB) el modelo cabe en cualquier portátil y puede atenderse desde Ollama (`ollama run hf.co/axteam/Qwen3.5-2B-GGUF:Q4_K_M`) sin conexión a internet, lo que resulta adecuado para prototipos de chat con requisitos de privacidad.
- Clasificación y extracción de información por lotes: procesar grandes volúmenes de texto (etiquetado de tickets, extracción de entidades) en CPU con llama.cpp, donde el coste por token y el tamaño del modelo importan más que la calidad punta.
- Generación de texto asistida en editores y herramientas CLI: integración con `llama-cli` o la API de `llama-server` para autocompletado, resúmenes y reescritura en un flujo de trabajo de terminal.
- Enrutamiento y preprocesado dentro de un pipeline mayor: usar el modelo como clasificador de intención o generador de consultas preliminares antes de llamar a un modelo mayor, reduciendo coste y latencia global.
- Desarrollo y pruebas de aplicaciones LLM: el par Q4_K_M/Q8_0 permite comparar el impacto de la cuantización en la calidad de salida sobre la misma aplicación antes de fijar una configuración de producción.
- Despliegue en dispositivos con recursos limitados: el tamaño de 1,3 GB hace viable la inferencia en mini-PC, placas SBC con suficiente RAM o entornos embebidos mediante llama.cpp; Qualcomm AI Hub referencia el modelo base como orientado a inferencia on-device.
- Fine-tuning ligero y experimentación docente: al ser Apache-2.0 y un modelo pequeño, sirve como base para probar pipelines de cuantización, evaluación o ajuste sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas, y las fuentes web consultadas solo mencionan afirmaciones cualitativas sobre la serie Qwen3.5 (paridad con Qwen3 y mejora frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual) sin cifras concretas ni referidas a la variante de 2B.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 1,6-2,5 GB incluyendo caché KV para contextos moderados (el fichero pesa 1,3 GB).
- VRAM estimada para Q8_0: aproximadamente 2,5-3,5 GB con caché KV para contextos moderados (el fichero pesa 2,1 GB).
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); Q4_K_M puede ejecutarse incluso en GPUs de 2-3 GB con contexto reducido.
- Inferencia en CPU: viable en exclusiva con RAM; Q4_K_M requiere ~2 GB de memoria libre del sistema.
- Apple Silicon: ejecutable vía llama.cpp y LM Studio aprovechando Metal.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio; vLLM solo con soporte experimental de GGUF, no verificado para este repositorio.
- Ejemplo de la model card: `llama-server -hf axteam/Qwen3.5-2B-GGUF:Q4_K_M -c 8192`.
- Latencia y throughput: no disponibles (no se han publicado mediciones de tokens por segundo para estas cuantizaciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/Qwen3.5-2B-GGUF (este) | 1,94 B | No disponible | GGUF (Q4_K_M, Q8_0) | Apache-2.0 | Solo texto; codificador visual excluido; 0 descargas, 0 likes |
| Qwen/Qwen3.5-2B (base) | 1,94 B | No disponible | Safetensors | Apache-2.0 | Incluye capacidades multimodales; requiere conversión para uso local |
| unsloth/Qwen3.5-2B-GGUF | No disponible | No disponible | GGUF | Apache-2.0 (heredada) | Alternativa de cuantización del mismo base, publicada en ModelScope/Hugging Face |
| xlnk/qwen3.5-2b-gguf | No disponible | No disponible | GGUF | No disponible | Otra conversión comunitaria del mismo modelo base |
| Llama 3.2 1B (referencia externa) | 1,24 B | 128 K | Safetensors, GGUF | Llama 3.2 Community License | Datos de referencia general no verificados en la información proporcionada |
| Gemma 3 1B (referencia externa) | 1 B | 32 K | Safetensors, GGUF | Gemma Terms of Use | Datos de referencia general no verificados en la información proporcionada |

No se dispone de comparaciones de rendimiento (benchmarks) entre estas alternativas en la información proporcionada; la comparación anterior es únicamente de parámetros, formato y licencia.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: la calidad máxima está acotada por el modelo base `Qwen/Qwen3.5-2B` y por el nivel de cuantización elegido.
- El codificador visual no está incluido; pese a que la serie Qwen3.5 es multimodal, estos GGUF solo procesan texto.
- No hay datos publicados de benchmarks ni de evaluación de la pérdida de calidad introducida por Q4_K_M en este repositorio concreto.
- La longitud máxima de contexto no está documentada; el valor `-c 8192` del ejemplo es una configuración de servidor, no una garantía del modelo. Usar contextos mayores requiere verificar el límite real del base.
- Riesgo de alucinación inherente a un modelo de ~2 B parámetros: no es adecuado para tareas de alta precisión sin verificación humana o recuperación externa (RAG).
- Sesgos y cobertura idiomática no documentados en el repositorio; la lista de idiomas soportados no está disponible.
- El soporte de tool calling y de razonamiento multi-paso no está confirmado en la información disponible y debe validarse empíricamente.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de comunidad, validación independiente ni mantenimiento continuado por parte del autor.
- Licencia Apache-2.0 permite uso comercial y modificación, pero los pesos originales y el tokenizador pertenecen al equipo Qwen; conviene revisar también la licencia del modelo base por si añade condiciones adicionales.
- Fecha de creación del repositorio: 2026-10-29, con última actualización dos segundos después, lo que sugiere una publicación única sin revisiones posteriores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Cuantización alternativa (unsloth) en ModelScope: https://www.modelscope.cn/models/unsloth/Qwen3.5-2B-GGUF/summary
- Cuantización alternativa (xlnk), ficha de terceros: https://free2aitools.com/model/xlnk/qwen3.5-2b-gguf
- Directorio de modelos GGUF: https://local-ai-zone.github.io/models/qwen3-5-2b.html
