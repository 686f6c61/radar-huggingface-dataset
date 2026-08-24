# ArtCloud/Zubr1.5-VL-32B

## Resumen

Zubr1.5-VL-32B es el primer modelo afinado de la familia Zubr, desarrollado por ArtCloud para la plataforma ZubrIQ. Se trata de un adaptador QLoRA sobre el modelo base Qwen/Qwen3-VL-32B-Instruct, especializado en el ordenamiento jurídico de la República de Bielorrusia. El modelo integra capacidades multimodales (imagen y texto) para leer escaneos y fotografías de documentos, y está orientado a escenarios legales dentro del territorio bielorruso.

El adaptador fue entrenado sobre un corpus de 6.302 documentos legales (133,4 millones de caracteres) que incluye los 28 códigos de Bielorrusia y material analítico de práctica jurídica. Con 32.762 millones de parámetros en total, el modelo conserva la arquitectura vision-language del base y añade conocimiento especializado sin modificar la torre de visión, que permanece congelada durante el entrenamiento. Su relevancia radica en ser una de las pocas opciones abiertas y en ruso/bielorruso para asistencia legal con soporte de documentos escaneados, publicada bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen3-VL-32B-Instruct |
| Parametros totales | 32.762.123.264 (32,7 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento; 16.384 tokens en inferencia recomendada (medido en producción) |
| Tipos de cuantizacion | Q4_K_M (GGUF fusionado); adaptador QLoRA en 4-bit NF4 |
| Idiomas soportados | Ruso (ru), bielorruso (be), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador), GGUF (modelo fusionado) |

## Arquitectura y entrenamiento

El modelo se compone de un adaptador LoRA de bajo rango (r=16, alpha=32, dropout=0.05) aplicado sobre las proyecciones lineales del transformer base (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). La torre de visión del modelo base se mantiene congelada; solo se entrena la capa de lenguaje. El entrenamiento se realizó con QLoRA en precisión 4-bit NF4, una sola época, tasa de aprendizaje 1e-4, longitud máxima de secuencia de 4.096 tokens, batch efectivo de 16 (batch 1 × grad_accum 16), bf16 y gradient checkpointing, sobre una NVIDIA H100 de 80 GB.

El corpus de entrenamiento combina 757 actos normativos oficiales (incluidos los 28 códigos de Bielorrusia) procedentes de etalonline.by y 5.545 artículos analíticos de la plataforma ilex, con un total de 133,4 millones de caracteres. La mezcla se complementa con aproximadamente 200 ejemplos de identidad de plataforma (duplicados ×10) para que el modelo se presente como «Zubr» y conozca los productos de ZubrIQ. Los temas dominantes son tributación (IVA, USN, impuesto sobre la renta), proceso económico, datos personales, derecho bancario y laboral. No se aplicaron técnicas de RLHF ni DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Generación de texto conversacional en ruso, bielorruso e inglés, con conocimiento especializado en legislación bielorrusa.
- Lectura y comprensión de documentos escaneados o fotografiados (imagen a texto), gracias a la torre de visión del modelo base.
- Razonamiento jurídico sobre los 28 códigos de Bielorrusia y su práctica de aplicación, incluyendo impuestos, proceso civil y penal, derecho laboral y bancario.
- Capacidad de citar o referenciar normativa cuando se le solicita, aunque no se garantiza la exactitud de las referencias.
- Identidad de plataforma integrada: se presenta como «Zubr» y conoce los productos de ZubrIQ.
- Soporte de contexto largo en inferencia (hasta 16.384 tokens medidos en producción), adecuado para documentos extensos.
- No se menciona soporte explícito de tool calling ni function calling en la documentación disponible.

## Casos de uso

- Asistencia legal interna en despachos bielorrusos: el modelo puede redactar borradores de contratos, demandas o escritos basándose en los códigos vigentes, agilizando el trabajo de revisión de los abogados.
- Consulta normativa para ciudadanos: un chatbot integrado en un portal público puede responder preguntas sobre impuestos, vivienda o derecho laboral, citando los artículos correspondientes de los códigos bielorrusos.
- Digitalización de expedientes: gracias a su capacidad multimodal, el modelo puede extraer datos relevantes de escaneos de documentos judiciales o administrativos y resumirlos en texto estructurado.
- Formación y capacitación jurídica: estudiantes y profesionales pueden usarlo para estudiar la práctica de aplicación de los códigos, con explicaciones basadas en el corpus analítico de ilex.
- Preparación de respuestas a requerimientos fiscales: el modelo puede ayudar a interpretar normativa tributaria (IVA, USN, impuesto sobre la renta) y generar borradores de alegaciones o recursos.
- Verificación de vigencia normativa: aunque no sustituye una base de datos oficial, el modelo puede señalar qué código o artículo es aplicable a un supuesto, siempre que el usuario contraste con la fuente original (etalonline.by).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas estándar como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos legales. El único dato de rendimiento medido es la velocidad de generación en producción: 31–33 tokens por segundo en un entorno con 4× Tesla V100 de 16 GB y contexto de 16.384 tokens, usando llama.cpp con el GGUF Q4_K_M.

## Requisitos de hardware

- VRAM estimada: aproximadamente 27 GiB para inferencia con contexto de 16.384 tokens y cuantización Q4_K_M, según medición en producción.
- GPU recomendadas: NVIDIA H100 (80 GB) para entrenamiento; para inferencia, GPUs con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A10G, L4) pueden ejecutar el GGUF Q4_K_M, aunque el rendimiento dependerá de la memoria disponible.
- En consumer GPUs: el GGUF Q4_K_M ocupa 19 GB, por lo que cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), pero no en GPUs de 16 GB o menos sin reducir contexto o usar cuantizaciones más agresivas.
- Opciones de despliegue: vLLM (cargando el adaptador LoRA sobre el base), llama.cpp (con el GGUF fusionado y el mmproj del base para visión), Ollama (compatible con GGUF), y Transformers con PEFT.
- Latencia y throughput: 31–33 tokens/s medidos en 4× Tesla V100 16 GB con llama.cpp; el throughput variará según el hardware y la configuración de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zubr1.5-VL-32B (este) | 32,7B | 16k (inferencia) | Derecho bielorruso + vision | Apache 2.0 | Hugging Face |
| Qwen3-VL-32B-Instruct (base) | 32,7B | No especificado | Generalista multimodal | Apache 2.0 | Hugging Face |
| Zubr1.0-VL-4B | 4B (aprox.) | No especificado | Derecho bielorruso + vision | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos de la misma familia y al base, ya que no se dispone de información sobre otros modelos legales bielorrusos comparables. Zubr1.5-VL-32B ofrece una ventaja clara sobre Zubr1.0-VL-4B en capacidad de razonamiento y calidad de generación, al partir de un base mucho mayor. Frente al base Qwen3-VL-32B-Instruct, la diferencia está en el conocimiento jurídico específico y en la identidad de plataforma, aunque el base conserva un rendimiento generalista superior fuera del dominio legal.

## Limitaciones y advertencias

- Desequilibrio del corpus: el 88 % de los datos de entrenamiento son artículos analíticos de autor (ilex) y solo el 12 % son textos normativos, por lo que el modelo puede presentar interpretaciones de un autor concreto como si fueran norma vigente.
- Identidad reforzada artificialmente: los ejemplos de identidad de plataforma se duplicaron ×10, lo que puede provocar que el modelo mencione «Zubr» o ZubrIQ en contextos donde no es pertinente.
- Sesgo temático: las áreas de tributación y proceso económico están mucho mejor cubiertas que ramas jurídicas menos frecuentes en el corpus.
- Adaptación superficial: al entrenarse solo una época, la asimilación del conocimiento es desigual; los temas frecuentes se aprenden mejor que los raros.
- La torre de visión no se afinó: el reconocimiento de documentos depende de las capacidades originales del modelo base, sin mejora específica para documentos legales bielorrusos.
- Actualidad limitada: el corpus se recopiló en julio de 2026; cualquier cambio legislativo posterior a esa fecha es desconocido para el modelo.
- No se realizó prueba de memorización: no se ha verificado si el modelo puede reproducir fragmentos literales del corpus de entrenamiento, un riesgo conocido en modelos legales.
- Uso restringido: no debe utilizarse para emitir dictámenes legales, tomar decisiones automáticas sobre personas, ni aplicarse a jurisdicciones fuera de Bielorrusia. Las respuestas deben contrastarse siempre con la fuente oficial (etalonline.by).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArtCloud/Zubr1.5-VL-32B
- Colección Zubr de ArtCloud: https://huggingface.co/collections/ArtCloud/zubr
- Modelo anterior Zubr1.0-VL-4B: https://huggingface.co/ArtCloud/Zubr1.0-VL-4B
- Plataforma ZubrIQ: https://zubriq.by
- Sitio de ArtCloud: https://artcloud.co/en/
- Fuente normativa oficial (etalonline.by): https://etalonline.by
