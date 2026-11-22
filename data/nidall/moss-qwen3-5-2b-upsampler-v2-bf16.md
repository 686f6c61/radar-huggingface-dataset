# NidAll/moss-qwen3.5-2b-upsampler-v2-bf16

## Resumen

moss-qwen3.5-2b-upsampler-v2-bf16 es un fine-tune de 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) desarrollado por el usuario NidAll sobre `huihui-ai/Huihui-Qwen3.5-2B-abliterated`, una variante abliterada del modelo Qwen3.5-2B de Alibaba. Su propósito es muy concreto: actuar como upsampler de prompts en lenguaje natural para MOSS-Image y para flujos de generación texto-a-imagen (T2I). Es decir, recibe una instrucción breve del usuario y la expande en un prompt visual rico y detallado que se pasa después al modelo de difusión.

El modelo se distribuye como safetensors en bfloat16 (4,4 GB de repositorio) y se carga con `transformers` mediante `AutoModelForImageTextToText`, ya que la arquitectura base `qwen3_5` es un VLM unificado. La versión v2 duplica el corpus de entrenamiento respecto a v1 (12.000 filas de entrenamiento y 300 de evaluación) y lo sustituye por un subconjunto curado con DeepSeek-V4.1-Flash en modo juez JSON, con limpieza de contradicciones visuales y de sanitizaciones encubiertas del profesor.

Es relevante ahora porque los pipelines de ComfyUI y de difusión en local necesitan expansores de prompt ligeros que quepan en GPU de consumo y que puedan descargarse de VRAM tras la expansión. Con cuantización INT8/Q8_0 ocupa alrededor de 2,2 GB, y su licencia Apache 2.0 facilita la integración comercial sin fricción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer VLM unificado (`qwen3_5`), fine-tune con LoRA de 16 bits sobre proyecciones de atención y MLP del lenguaje; codificador visual congelado |
| Parámetros totales | 2.213.241.664 (aproximadamente 2,2 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `max_seq_length=1024`) |
| Tipos de cuantización | BF16 nativo; el autor indica que cuantiza limpiamente a INT8 / Q8_0 (aproximadamente 2,2 GB) y es apto para GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`torch.bfloat16`) |

## Arquitectura y entrenamiento

La base es un VLM unificado de la familia Qwen3.5 en su variante de 2B, tomada de la versión abliterada de huihui-ai. Sobre ella se aplicó un adaptador LoRA de 16 bits con `r=32`, `alpha=64` y dropout 0, restringido a las proyecciones de atención y MLP del modelo de lenguaje; el codificador visual se mantuvo 100 % congelado y se verificó tras el entrenamiento ("Frozen Vision Tower Check: Passed"). El entrenamiento partió directamente del modelo base, no apilado sobre v1, para evitar solapamiento de datos y deriva de la abliteración.

El corpus es `NidAll/moss-pup-qwen35-curated-12k`, con 12.000 ejemplos de entrenamiento y 300 de evaluación generados y puntuados por DeepSeek-V4.1-Flash en modo juez JSON sin thinking (puntuación compuesta media de 5,00/5,00). Antes de entrenar se eliminaron contradicciones visuales y de medio (por ejemplo, color frente a blanco y negro, o errores de pose espacial) y se descartaron salidas del profesor que hubieran sido sanitizadas de forma encubierta. Los dominios visuales están limitados a un 22 % máximo por categoría en 10 dominios, con 1.264 filas de tipografía y diseño para preservar texto exacto, y aproximadamente un 15 % de prompts oscuros, crudos y artísticos para mantener la abliteración.

La configuración de entrenamiento fue: 1 época, batch efectivo de 16 (2 × 8), schedule coseno con `lr=8e-05`, 38 pasos de warmup, `max_seq_length=1024`, enmascaramiento de pérdida solo en la respuesta, `adamw_8bit` y semilla 3407. El entrenamiento completo tardó 115 minutos en una única Tesla T4. La pérdida final de entrenamiento fue 1,5807 y la de validación 1,4435 (frente a 1,5398 en v1). La auditoría de abliteración reporta 0/30 rechazos, 0/30 sanitizaciones encubiertas, 0 fugas del token `<think>` y una tasa de finalización limpia con EOS de 30/30.

## Capacidades

- Expansión de prompts en lenguaje natural para MOSS-Image y para flujos T2I genéricos: convierte una instrucción breve en un prompt visual detallado.
- Preservación de texto exacto en los prompts generados, reforzada por el bloque de tipografía y diseño del corpus.
- Generación conversacional de un solo turno orientada a la tarea de upsampling, con finalización limpia mediante EOS.
- Modo thinking desaconsejado y desactivado por configuración (`enable_thinking=False`); el autor exige desactivarlo para que la salida empiece directamente por el prompt.
- Capacidad multimodal heredada del VLM base (pipeline `image-text-to-text`), aunque el codificador visual está congelado y el fine-tune se centra en texto.
- Sin rechazos en las 30 pruebas de abliteración del autor, lo que permite generar prompts de contenido oscuro o explícito sin sanitización.
- Soporte de plantilla de chat mediante `apply_chat_template` con `add_generation_prompt=True`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Upsampling de prompts en ComfyUI: se carga el modelo en BF16 o Q8_0, se expande el prompt del usuario y se descarga de VRAM antes de invocar el modelo de difusión, aprovechando que en Q8_0 ocupa aproximadamente 2,2 GB.
- Generación de carteles y rótulos con texto legible: el corpus incluye 1.264 filas de tipografía y diseño, lo que ayuda a producir prompts que especifican con precisión cadenas como rótulos de neón o carteles.
- Automatización de pipelines T2I por lotes: al ser un modelo de 2,2 B con salida de 512 a 600 tokens, se puede ejecutar en serie sobre miles de prompts cortos con latencia baja en una sola GPU.
- Creación de prompts artísticos oscuros o crudos: la abliteración sin rechazos permite expandir instrucciones que otros modelos sanitizarían, útil en ilustración de terror, cine negro o estética grunge.
- Prototipado rápido de interfaces de generación de imágenes: se integra con `transformers` y `AutoModelForImageTextToText` en pocas líneas, adecuado para demos y pruebas de concepto.
- Ajuste fino posterior o destilación: al ser un safetensors BF16 estándar, sirve como punto de partida para INT8/GGUF o para nuevos LoRA sobre dominios visuales específicos.
- Expansión de prompts en inglés para equipos que trabajan con MOSS-Image: el modelo está entrenado exclusivamente en inglés, por lo que encaja en flujos cuyo prompt final debe estar en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas internas de entrenamiento y auditoría:

| Métrica | Resultado v2 | Referencia v1 |
|---|---|---|
| Pérdida final de entrenamiento | 1,5807 | No disponible |
| Pérdida final de validación | 1,4435 | 1,5398 |
| Rechazos en auditoría de abliteración (30 sondas) | 0/30 (0,0 %) | No disponible |
| Sanitización encubierta (30 sondas) | 0/30 (0,0 %) | No disponible |
| Fugas del token `<think>` | 0 | No disponible |
| Tasa de finalización limpia con EOS | 30/30 (100,0 %) | No disponible |
| Verificación del codificador visual congelado | Superada | No disponible |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica unos 6 GB.
- VRAM estimada en INT8/Q8_0: aproximadamente 2,2 GB para pesos, con un total práctico en torno a 3-4 GB.
- GPU recomendadas: Tesla T4 (fue la GPU usada para el entrenamiento), RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100. Cabe holgadamente en GPU de consumo con 8 GB o más en BF16 y con 4-6 GB en Q8_0.
- Despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor`; el autor menciona cuantización a INT8/GGUF, por lo que es compatible con llama.cpp/Ollama tras conversión, aunque no se documenta un flujo oficial.
- Latencia y throughput: no disponibles. Como referencia, el entrenamiento completo (750 pasos, batch efectivo 16, secuencia 1024) tardó 115 minutos en una T4.
- Gestión de VRAM en ComfyUI: el autor recomienda descargar el modelo tras la expansión del prompt para liberar memoria antes de cargar el modelo de difusión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| moss-qwen3.5-2b-upsampler-v2-bf16 | 2,2 B | No disponible (entrenado a 1024) | Apache 2.0 | Upsampling de prompts para MOSS-Image y T2I | Hugging Face, safetensors BF16 |
| moss-qwen3.5-2b-upsampler-bf16 (v1) | 2,2 B (misma base) | No disponible | Apache 2.0 | Versión previa con corpus de 6k filas filtrado por regex | Hugging Face |
| huihui-ai/Huihui-Qwen3.5-2B-abliterated | 2,2 B | No disponible | No disponible en la información | Modelo base abliterado, uso general | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo está entrenado y evaluado en inglés; no se garantiza calidad en castellano ni en otros idiomas.
- El modo thinking debe desactivarse siempre; si se activa, pueden aparecer tokens `<think>` o salidas mal formadas.
- Es un modelo especializado en una única tarea (expansión de prompts); su rendimiento en conversación general, código o matemáticas no está evaluado y probablemente sea deficiente.
- La abliteración elimina los rechazos, lo que implica que puede generar contenido explícito, violento u ofensivo sin filtro; requiere moderación externa si se expone a usuarios finales.
- Riesgo de alucinación en detalles visuales: el expansor puede inventar elementos no solicitados (colores, objetos, texto) al enriquecer el prompt.
- El corpus fue generado por DeepSeek-V4.1-Flash, por lo que puede heredar sesgos estilísticos del profesor.
- La longitud de contexto no está documentada; el entrenamiento usó 1024 tokens, por lo que prompts de entrada muy largos pueden degradar la calidad.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base abliterado y del dataset curado antes de un uso comercial a gran escala.
- No hay datos publicados de benchmarks estándar ni de latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NidAll/moss-qwen3.5-2b-upsampler-v2-bf16
- Versión v1: https://huggingface.co/NidAll/moss-qwen3.5-2b-upsampler-bf16
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/NidAll/moss-pup-qwen35-curated-12k
