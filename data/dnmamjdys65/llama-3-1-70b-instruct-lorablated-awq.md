# dnmamjdys65/Llama-3.1-70B-Instruct-lorablated-AWQ

## Resumen

Llama-3.1-70B-Instruct-lorablated-AWQ es una cuantización de 4 bits (AWQ) del modelo mlabonne/Llama-3.1-70B-Instruct-lorablated, publicado por el usuario dnmamjdys65 en Hugging Face. El modelo base es una versión "abliterada" (abliterated) de Meta-Llama-3.1-70B-Instruct, es decir, una variante a la que se le han eliminado las salvaguardas de rechazo mediante una intervención LoRA sobre las direcciones de rechazo (refusal directions) en el espacio de activaciones del modelo. Este tipo de variantes se usa en investigación de alineamiento y por usuarios que quieren controlar por sí mismos las políticas de contenido del modelo.

El modelo subyacente conserva la arquitectura transformer densa de Llama 3.1 con 70,6 mil millones de parámetros y una ventana de contexto de 128.000 tokens, manteniendo las capacidades de razonamiento, código y conversación del modelo original de Meta. La cuantización AWQ reduce el tamaño de los pesos a unos 39,8 GB, lo que permite ejecutar el modelo en una única GPU de gama alta con 48 GB de VRAM, algo inviable en precisión completa (FP16 requiere ~140 GB).

Es relevante porque combina tres elementos demandados en el ecosistema open source: un modelo base de referencia (Llama 3.1 70B), una versión sin restricciones de contenido útil para investigación y casos de uso con moderación externa, y una cuantización AWQ compatible con vLLM y TGI para despliegue eficiente en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Llama 3.1) |
| Parametros totales | 70.553.706.496 (~70,6B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no confirmado en la model card) |
| Tipos de cuantizacion | AWQ 4-bit |
| Idiomas soportados | no disponible (Llama 3.1 soporta oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (AWQ 4-bit) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 70B Instruct: un transformer decoder denso con atención agrupada por consultas (GQA), RoPE y normalización RMSNorm, entrenado por Meta sobre más de 15 billones de tokens y posteriormente afinado con aprendizaje por refuerzo con feedback humano (RLHF) y DPO para la versión Instruct.

La variante "lorablated" fue creada por mlabonne aplicando la técnica de abliteración: se identifican las direcciones de rechazo (refusal directions) en las activaciones del modelo comparando respuestas a peticiones dañinas y benignas, y se entrena un LoRA que proyecta dichas direcciones a cero, eliminando el comportamiento de rechazo sin reentrenar el modelo completo. Esta cuantización AWQ no modifica el comportamiento del modelo base; solo comprime los pesos a 4 bits usando Activated Channel Weight quantization, que protege los canales más sensibles según las activaciones observadas para minimizar la pérdida de calidad.

No se ha publicado información sobre datos de entrenamiento adicionales más allá del modelo original de Meta y el LoRA de abliteración.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1 70B Instruct.
- Razonamiento general y resolución de problemas, con rendimiento competitivo en benchmarks académicos del modelo base original.
- Generación y comprensión de código en múltiples lenguajes de programación.
- Resolución de problemas matemáticos.
- Ventana de contexto larga (hasta 128.000 tokens en el modelo base) para documentos extensos.
- Capacidades multilingües en los 8 idiomas oficiales de Llama 3.1, incluido el español.
- Sin rechazos de contenido incorporados (abliterated): responde a peticiones que el modelo original rechazaría, lo que exige moderación externa en producción.
- Compatibilidad con vLLM y text-generation-inference según los tags del repositorio.

No consta en la información disponible soporte nativo de tool calling, vision ni audio, aunque el modelo base Llama 3.1 Instruct soporta tool calling.

## Casos de uso

- Investigación en alineamiento y seguridad: permite estudiar el comportamiento de un modelo sin salvaguardas internas, útil para evaluar red teams, jailbreaks y mecanismos de rechazo.
- Despliegue en una sola GPU de 48 GB: la cuantización AWQ a 4 bits (~39,8 GB) permite servir el modelo en una A6000, L40S o A40 sin necesidad de multi-GPU.
- Asistentes conversacionales con moderación externa: al no tener rechazos internos, se puede implementar un filtro de contenido propio más flexible y auditable que las salvaguardas del fabricante.
- Procesamiento de documentos largos: con 128.000 tokens de contexto (en el modelo base), es adecuado para resumir y analizar contratos, informes o corpus técnicos extensos.
- Generación de código en entornos controlados: integrable en pipelines de desarrollo donde la política de contenido se gestiona a nivel de aplicación.
- Experimentación con cuantización AWQ: sirve como caso de estudio para medir la degradación de calidad de AWQ 4-bit frente a FP16 en un modelo de 70B.
- Servidor de inferencia autoalojado con vLLM: los tags del repositorio indican compatibilidad directa con vLLM, lo que facilita despliegues con PagedAttention y alto throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia, el modelo base Meta-Llama-3.1-70B-Instruct reporta en su ficha oficial valores como 83,6 en MMLU (5-shot, macro_avg) y 96,8 en HumanEval (0-shot), pero no existen mediciones publicadas de esta cuantización AWQ concreta ni de la variante abliterada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~40-44 GB para los pesos AWQ 4-bit (39,8 GB) más la KV cache, que crece con el contexto.
- GPU recomendadas: una sola NVIDIA A6000 (48 GB), L40S (48 GB), A40 (48 GB) o A100 40/80 GB. Con A100 80 GB u H100 queda margen amplio para contextos largos.
- Consumer GPUs: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) de forma nativa; requeriría offload a CPU con llama.cpp (con pérdida notable de velocidad) o cuantizaciones más agresivas no disponibles en este repositorio.
- Despliegue: compatible con vLLM y text-generation-inference según los tags del repositorio; también debería funcionar con llama.cpp y Ollama si se convierte a GGUF (esta versión se distribuye en safetensors AWQ, no GGUF).
- Latencia y throughput: no disponibles en la información proporcionada; en vLLM sobre una GPU de 48 GB cabe esperar del orden de decenas de tokens/s por petición individual, con buen throughput agregado gracias a PagedAttention.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| dnmamjdys65/Llama-3.1-70B-Instruct-lorablated-AWQ | 70,6B | AWQ 4-bit | 128k (base) | Llama 3.1 | Abliterated, sin rechazos internos |
| mlabonne/Llama-3.1-70B-Instruct-lorablated | 70,6B | FP16 | 128k | Llama 3.1 | Modelo base de esta cuantización; requiere ~140 GB VRAM |
| Meta-Llama-3.1-70B-Instruct | 70,6B | FP16 (oficial) | 128k | Llama 3.1 | Con salvaguardas de rechazo estándar |
| TheDrummer/otras variantes abliterated 70B | ~70B | variable | 128k | Llama 3.1 | Alternativas abliterated de la comunidad, calidad variable |

## Limitaciones y advertencias

- Ausencia de salvaguardas: al ser un modelo abliterated, no rechaza peticiones dañinas. Su uso en producción sin moderación externa plantea riesgos legales y éticos significativos y puede incumplir la Llama 3.1 Community License, que exige cumplir la política de uso aceptable de Meta.
- Riesgo de alucinación: heredado del modelo base; la abliteración y la cuantización AWQ pueden agravar ligeramente la fiabilidad factual, aunque no hay mediciones publicadas de esta degradación.
- Licencia Llama 3.1: permite uso comercial, pero con restricciones: no se puede usar para entrenar modelos competidores, aplica la política de uso aceptable de Meta y las plataformas con más de 700 millones de usuarios mensuales necesitan licencia específica.
- Pérdida de calidad por cuantización: AWQ 4-bit implica una pequeña degradación respecto a FP16, no cuantificada en este repositorio.
- Sin model card detallada: el README no documenta benchmarks, idiomas ni instrucciones de uso; la fiabilidad del repositorio depende del autor (dnmamjdys65), no de mlabonne ni de Meta.
- Contexto: la ventana de 128k se hereda del modelo base y no está verificada en esta cuantización; la KV cache en contextos largos puede superar la VRAM disponible incluso en GPUs de 48 GB.
- Popularidad muy baja del repositorio (233 descargas, 0 likes): conviene verificar la integridad de los pesos antes de uso serio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dnmamjdys65/Llama-3.1-70B-Instruct-lorablated-AWQ
- Modelo base (mlabonne/Llama-3.1-70B-Instruct-lorablated): https://huggingface.co/mlabonne/Llama-3.1-70B-Instruct-lorablated
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct
- Licencia Llama 3.1 Community License: https://huggingface.co/meta-llama/Llama-3.1-70B-Instruct/blob/main/LICENSE
- No se han encontrado enlaces a papers, blogs ni demos en la informacion disponible.
