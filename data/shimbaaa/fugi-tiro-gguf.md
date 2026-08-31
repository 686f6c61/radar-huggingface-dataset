# shimbaaa/Fugi-tiro-GGUF

## Resumen

Fugi-tiro-GGUF es un modelo de lenguaje finetuneado por el usuario shimbaaa sobre la base Qwen2.5-0.5B, posteriormente convertido al formato GGUF mediante la librería Unsloth. El repositorio contiene únicamente un archivo cuantizado (`Qwen2.5-0.5B.Q4_K_M.gguf`) de aproximadamente 0,4 GB, lo que lo convierte en una opción ligera para ejecución en entornos con recursos limitados, como CPUs o GPUs de baja VRAM.

Al tratarse de un modelo de 494 millones de parámetros, su principal interés radica en la posibilidad de desplegarlo en dispositivos edge o en aplicaciones donde la latencia y el consumo de memoria son críticos. La cuantización Q4_K_M reduce el tamaño del modelo manteniendo un equilibrio razonable entre calidad y eficiencia, y su compatibilidad con llama.cpp y herramientas derivadas (Ollama, LM Studio) facilita su integración en pipelines locales.

Sin embargo, la información pública sobre el finetune es escasa: no se especifican los datos de entrenamiento, el propósito del ajuste ni la licencia. Esto limita las conclusiones sobre sus capacidades reales más allá de las inherentes al modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (0.5B) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no presente) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar, aunque no se proporcionan detalles sobre la configuración exacta (número de capas, cabezas de atención, etc.) en la información disponible. El autor indica que el finetune se realizó con la librería Unsloth, que optimiza el entrenamiento mediante kernels personalizados y técnicas de memoria eficiente, y posteriormente se convirtió a GGUF para su uso con llama.cpp.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el proceso.

## Capacidades

- Generación de texto: como modelo de 0,5B basado en Qwen2.5, puede realizar tareas básicas de completado y generación de texto.
- Razonamiento simple: capacidades limitadas para razonamiento lógico y aritmética, acordes a su tamaño.
- Soporte de tool calling: no confirmado, aunque Qwen2.5 soporta function calling en algunas versiones; no hay evidencia específica para este finetune.
- Capacidades multilingües: desconocidas, aunque Qwen2.5 base tiene soporte multilingüe; no se especifica para este modelo.
- Capacidades multimodales: no aplica, el archivo es solo texto (aunque la model card menciona un comando `llama-mtmd-cli`, no hay archivos de visión en el repositorio).

## Casos de uso

- Chatbots en dispositivos edge: al pesar solo 0,4 GB, puede ejecutarse en Raspberry Pi o teléfonos móviles mediante llama.cpp, ofreciendo respuestas sencillas en tiempo real.
- Asistente de escritura ligero: útil para autocompletar frases o generar borradores cortos en aplicaciones de procesamiento de texto con recursos limitados.
- Clasificación de texto básica: puede adaptarse para etiquetado de sentimiento o categorización de documentos mediante prompts específicos, aunque su capacidad de comprensión es limitada.
- Generación de código simple: para snippets cortos o autocompletado en editores ligeros, siempre que el finetune haya sido orientado a código (no confirmado).
- Prototipado rápido: permite probar flujos de inferencia local con bajo coste antes de escalar a modelos mayores.
- Educación y experimentación: sirve para enseñar conceptos de generación de lenguaje y despliegue de modelos GGUF sin necesidad de hardware caro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este finetune específico.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa ~0,4 GB, por lo que la VRAM necesaria es inferior a 1 GB si se carga en GPU. En CPU, se requiere memoria RAM equivalente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2050, o integradas modernas). También funciona en CPU con rendimiento aceptable.
- Cabe en consumer GPU: sí, incluso en GPUs integradas de portátiles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no se proporcionan datos específicos, pero para un modelo de 0,5B en CPU se esperan velocidades de decodificación de decenas de tokens por segundo; en GPU, cientos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. Como referencia, el modelo base Qwen2.5-0.5B tiene 0,5B parámetros y una longitud de contexto de 32K tokens (según la documentación oficial de Qwen), pero este finetune no confirma ese valor. Otros modelos GGUF de tamaño similar (como TinyLlama-1.1B o Phi-2) no son directamente comparables sin datos de rendimiento.

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Fugi-tiro-GGUF | 0,5B | no disponible | GGUF | no disponible |
| Qwen2.5-0.5B (base) | 0,5B | 32K | safetensors | Apache 2.0 |
| TinyLlama-1.1B | 1,1B | 2K | safetensors/GGUF | Apache 2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: al ser un finetune de Qwen2.5, puede heredar sesgos presentes en el modelo base, aunque no hay evaluación específica.
- Riesgo de alucinación: los modelos de 0,5B tienen una alta propensión a generar información inventada, especialmente en tareas complejas.
- Limitaciones de contexto: la longitud de contexto no está documentada; se recomienda asumir el valor del base (32K) solo si se verifica experimentalmente.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar su uso comercial. Se debe contactar con el autor antes de utilizarlo en producción.
- Caveats de producción: al carecer de benchmarks y documentación de entrenamiento, no se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shimbaaa/Fugi-tiro-GGUF
- Unsloth (herramienta de finetune y conversión): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5 (referencia): https://huggingface.co/Qwen/Qwen2.5-0.5B
