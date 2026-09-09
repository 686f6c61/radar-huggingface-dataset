# mikeinnyc/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16

## Resumen

El modelo `mikeinnyc/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16` es una cuantización GPTQ a 4 bits del modelo denso `Qwen/Qwen3.8-27B`, preparada por Mike Caldera para su despliegue en GPUs Intel Arc Pro con el servidor vLLM XPU. Se ha optimizado para reducir la ocupación de VRAM manteniendo una ventana de contexto muy amplia: en las pruebas documentadas, el checkpoint G128 alcanza 161.000 tokens con una utilización de GPU del 90% y memoria KV en FP8.

El modelo base Qwen3.8-27B es descrito como un transformer denso, nativo visión-lenguaje, con control flexible de pensamiento y orientado a tareas complejas de varios pasos. Esta cuantización hereda dichas capacidades pero no es un fine-tune: se obtuvo directamente del checkpoint BF16 original mediante GPTQModel 7.3.2, sin entrenamiento adicional. Sus 27.781 millones de parámetros y su formato GPTQ INT4 simétrico con grupo de 128 lo hacen especialmente adecuado para entornos con memoria GPU limitada.

La relevancia del modelo reside en que ofrece una ruta práctica para servir un LLM de 27B capaz de razonamiento multimodal y largo contexto en una sola GPU de 32 GB, incorporando además MTP (multi-token prediction) para decodificación especulativa, lo que permite reducir la latencia de generación en cargas de trabajo de agente o análisis de documentos extensos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, multimodal (visión-lenguaje) |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 161.000 tokens en configuración probada (vLLM XPU con KV cache FP8); máximo oficial no disponible |
| Tipos de cuantización | GPTQ INT4 (simétrico, grupo 128, desc_act desactivado), tensores MTP en BF16 sin cuantizar |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (5 shards + configuración, tokenizer y chat template) |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado, no un re-entrenamiento. La arquitectura subyacente es la del modelo base `Qwen/Qwen3.8-27B`: un transformer denso de 27.781 millones de parámetros con capacidades nativas de visión y lenguaje, capaz de procesar imágenes y vídeos, y con control flexible de razonamiento (modo pensamiento). Según la descripción del fabricante, el modelo base está diseñado para llevar a cabo tareas complejas de varios pasos con mayor fiabilidad.

La cuantización se realizó directamente sobre el checkpoint BF16 original usando GPTQModel 7.3.2. La calibración usó un conjunto congelado de 128 muestras de 1.024 tokens cada una, provenientes del dataset C4, lo que suma 131.072 tokens de calibración (archivo `c4-fixed-128x1024.json`, con su SHA256 publicado en la model card). Los tensores asociados al MTP (multi-token prediction) se excluyeron de la cuantización y se mantienen en BF16, de modo que la ruta de decodificación especulativa conserva su fidelidad. La cuantización no incluye la cuantización de la cabeza LM (lm head) ni la activación de `desc_act`. Se eligió el grupo G128 frente a G32 por ofrecer un mejor equilibrio entre tamaño y capacidad de contexto en las pruebas del autor.

## Capacidades

- Generación de texto y razonamiento multi-paso, con control de pensamiento flexible, heredado del modelo base `Qwen3.8-27B`.
- Comprensión de imágenes y vídeos, al tratarse de un modelo nativo visión-lenguaje; la capacidad multimodal está presente en el modelo base y se preserva en este checkpoint cuantizado.
- Ventana de contexto larga: se ha servido con éxito a 161.000 tokens en vLLM XPU con KV cache en FP8.
- Decodificación especulativa mediante MTP: los tensores MTP (mantenidos sin cuantizar) permiten lanzar hasta 4 tokens especulativos, lo que puede reducir la latencia de generación.
- Integración con APIs compatibles con OpenAI a través de vLLM; el autor documenta el flujo completo hasta Open WebUI.
- Soporte para agentes y tareas de razonamiento de varios pasos, según la descripción del modelo base.
- No se especifica soporte de tool calling/function calling en la información disponible del checkpoint.

## Casos de uso

- Despliegue en GPU Intel Arc Pro B70 de 32 GB: la cuantización G128 ocupa aproximadamente 18,22 GB de VRAM, lo que permite dejar espacio para una KV cache FP8 de 161.000 tokens con `gpu_memory_utilization=0.90`. Es un caso de uso real para servir el modelo en un entorno XPU con vLLM.
- Análisis y extracción de información en documentos extensos: con 161K de contexto, el modelo puede recibir un repositorio completo, un manual técnico o un contrato largo en una sola pasada y responder preguntas sobre el contenido, sin necesidad de dividir el texto en fragmentos.
- Asistente conversacional de memoria larga: vía vLLM como backend y Open WebUI como cliente, se pueden mantener conversaciones de muchos turnos, gracias a la ventana amplia y al soporte de la API compatible con OpenAI.
- Tareas de razonamiento multi-paso con baja latencia: la decodificación especulativa con MTP (4 tokens especulativos) está pensada para aplicaciones de agente o flujos de razonamiento donde la latencia por pasos es crítica.
- Pipeline multimodal interno de descripción de imágenes o vídeos: al conservar las capacidades de visión-lenguaje del modelo base, el checkpoint puede emplearse en sistemas que necesiten interpretar contenido visual junto con texto, siempre que se sirva con vLLM y el backend apropiado.
- Evaluación y benchmark de cuantizaciones: el autor publica la variante G32 y el checkpoint BF16 original, lo que convierte este modelo en una referencia para comparar el equilibrio entre tamaño, contexto y calidad en entornos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente presenta una comparación de tamaño y contexto entre las variantes G128 y G32, sin métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni datos de throughput o latencia. En consecuencia, no es posible evaluar numéricamente la pérdida de rendimiento debida a la cuantización INT4.

## Requisitos de hardware

- VRAM estimada: el checkpoint G128 pesa aproximadamente 18,22 GB. Para servir el modelo con 161.000 tokens y KV cache FP8 se necesitan al menos 32 GB de VRAM (configuración probada con Intel Arc Pro B70 y `gpu_memory_utilization=0.90`). En una GPU de 24 GB (por ejemplo, RTX 4090) los pesos caben, pero la ventana de contexto debería reducirse; esta configuración no ha sido probada por el autor.
- GPU recomendada: Intel Arc Pro B70 de 32 GB, entorno vLLM XPU con las variables y parches documentados en el repositorio. No se han publicado pruebas en otras GPUs.
- Compatibilidad con consumer GPU: sí en cuanto a la carga de pesos (18,22 GB), aunque el contexto máximo dependerá de la memoria disponible para KV cache.
- Opciones de despliegue: vLLM XPU (con parches específicos) como servidor de inferencia; Open WebUI como frontend mediante una conexión compatible con OpenAI. No es compatible con llama.cpp, Ollama ni GGUF, ya que el checkpoint está en formato safetensors y no es un archivo GGUF único.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño checkpoint | Contexto probado | Cuantización | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16 original) | 27.78B | No disponible | No disponible | Ninguna | Apache-2.0 |
| mikeinnyc/...-G32 (misma fuente) | 27.78B | 19,54 GB | 128.000 tokens | GPTQ INT4 G32 | Apache-2.0 |
| mikeinnyc/...-G128 (este modelo) | 27.78B | 18,22 GB | 161.000 tokens | GPTQ INT4 G128 | Apache-2.0 |

No se dispone de información sobre otros modelos comparables de la misma categoría con datos verificables en la documentación aportada.

## Limitaciones y advertencias

- La cuantización INT4 introduce pérdida de fidelidad frente al checkpoint BF16; el autor no publica evaluaciones cuantitativas de esa pérdida ni tests de calidad.
- El despliegue no es trivial: la configuración probada requiere un entorno vLLM XPU con parches, variables de entorno y Dockerfiles específicos (documentados en el repositorio GitHub). Una instalación estándar de vLLM puede no funcionar con este checkpoint.
- No es un archivo GGUF, por lo que no se puede cargar directamente en herramientas como Ollama o llama.cpp. Se necesita vLLM como middleware.
- La información disponible no incluye benchmarks de seguridad, alineación ni sesgos. No se han realizado pruebas de adversarios ni análisis de sesgos en el modelo cuantizado.
- Los datos de calibración provienen exclusivamente de 128 muestras del dataset C4, lo que puede sesgar el comportamiento hacia lenguaje general en inglés y afectar a otros idiomas o dominios específicos.
- El soporte de tool calling y function calling no está confirmado en la documentación; se recomienda validar esta funcionalidad antes de usarlo en sistemas que dependan de ella.
- La licencia Apache-2.0 del checkpoint cuantizado es permisiva, pero conviene revisar la licencia del modelo base `Qwen/Qwen3.8-27B` antes de usarlo en producción.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/mikeinnyc/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio con procedimiento de cuantización y despliegue: https://github.com/MikeCaldera/intel-arc-pro-b70-qwen38-vllm
