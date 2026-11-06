# Adhitiad/uis_0.1

## Resumen

uis_0.1 es un modelo multimodal de tipo image-text-to-text publicado por el usuario Adhitiad en Hugging Face, construido sobre el modelo base kestrel-4b-coder. Se trata de un modelo de aproximadamente 4.326 millones de parámetros (4,3 mil millones) que combina capacidades de generación de texto y procesamiento de imágenes, empaquetado tanto en formato safetensors como en GGUF cuantizado para inferencia local. El repositorio ocupa 13,2 GB e incluye pesos en Q5_K_M y un proyector multimodal en F16.

La relevancia del modelo radica en su orientación a despliegue local y fine-tuning, con artefactos listos para transformers y llama.cpp. Sin embargo, la información pública es muy limitada: no se documentan datos de entrenamiento, benchmarks ni detalles arquitectónicos más allá de lo inferible de los ficheros de configuración. El modelo declara soporte únicamente para indonesio (`id`) y licencia MIT.

La ficha se ha elaborado exclusivamente a partir de la model card y los metadatos disponibles en Hugging Face. Cualquier dato no presente en esa información se marca explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5`; transformer multimodal con proyector de visión) |
| Parámetros totales | 4.326.350.848 (~4,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q5_K_M (GGUF), F16 (proyector multimodal), safetensors sin cuantizar |
| Idiomas soportados | indonesio (`id`) |
| Licencia | MIT |
| Formato de pesos | safetensors (2 shards + index), GGUF (Q5_K_M y F16-mmproj) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. Los metadatos incluyen el tag `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, y el pipeline declarado es `image-text-to-text`, lo que confirma un modelo multimodal con codificador visual y proyector hacia el espacio del modelo de lenguaje. El repositorio incluye un fichero `Kestrel-4B-Coder.F16-mmproj.gguf` que corresponde al proyector multimodal en precisión F16, separado de los pesos del LLM, patrón habitual en despliegues GGUF multimodales con llama.cpp.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El modelo base declarado es `kestrel-4b-coder`, del cual no se aportan más detalles en la model card.

## Capacidades

- Generación de texto conversacional en indonesio.
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text), con proyector multimodal dedicado.
- Capacidades de código inferidas del nombre del modelo base (`kestrel-4b-coder`), aunque no se documentan explícitamente en la model card.
- Plantilla de chat Jinja2 (`chat_template.jinja`) para formatear conversaciones multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a indonesio según el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional en indonesio: el modelo puede gestionar diálogos multi-turno mediante la plantilla de chat incluida, adecuado para aplicaciones de atención al cliente dirigidas a usuarios indonesios.
- Descripción y análisis de imágenes: gracias al pipeline image-text-to-text y al proyector F16, puede emplearse para generar descripciones, responder preguntas sobre imágenes o extraer información visual en flujos documentales.
- Inferencia local en hardware de consumo: los pesos GGUF Q5_K_M permiten ejecutar el modelo en GPUs de gama media mediante llama.cpp, útil para prototipos y entornos sin acceso a la nube.
- Fine-tuning sobre dominio específico: los shards safetensors permiten cargar el modelo con transformers y ajustarlo con datasets propios en indonesio.
- Asistencia a la programación en indonesio: dado el origen coder del modelo base, puede emplearse para autocompletado o explicación de código en entornos localizados, aunque esta capacidad no está documentada formalmente.
- Procesamiento de documentación con imágenes: combinación de OCR implícito y generación de texto para digitalizar y resumir documentos escaneados en indonesio.
- Base para experimentación multimodal: el repositorio incluye todos los artefactos necesarios (processor_config, tokenizer, chat template) para reproducir pipelines de visión-lenguaje en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q5_K_M: aproximadamente 3,5–4,5 GB para los pesos del LLM, más el proyector F16 y el contexto KV; en la práctica, entre 5 y 7 GB según longitud de contexto.
- VRAM estimada en safetensors sin cuantizar (F16/BF16): aproximadamente 9–10 GB para los pesos, más overhead de activaciones.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para uso local; A100 o H100 para servir a múltiples usuarios.
- Cabe en GPUs de consumo: sí, especialmente en formato Q5_K_M con llama.cpp en GPUs de 8 GB o superiores.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`, `AutoProcessor`), llama.cpp, ctransformers, llama-cpp-python. No se documenta soporte explícito para vLLM, TGI u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.
- Requisitos de software: Python 3.9+, transformers >= 4.40, torch >= 2.1, sentencepiece, protobuf, huggingface_hub.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uis_0.1 (Kestrel-4B-Coder) | ~4,3 B | no disponible | Texto + imagen | MIT | Hugging Face |
| Qwen2.5-VL-3B | ~3 B | no disponible en esta ficha | Texto + imagen | Apache 2.0 (según familia Qwen) | Hugging Face |
| Phi-3.5-vision | ~4,2 B | no disponible en esta ficha | Texto + imagen | MIT | Hugging Face |
| LLaVA-1.5-7B | ~7 B | no disponible en esta ficha | Texto + imagen | LLaMA 2 (uso restringido) | Hugging Face |

No se dispone de datos de rendimiento comparativo para uis_0.1, por lo que la comparativa se limita a parámetros, modalidad y licencia. Los datos de los modelos alternativos se indican de forma orientativa y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Información muy escasa: no se documentan datos de entrenamiento, benchmarks ni arquitectura detallada, lo que dificulta evaluar su calidad real.
- Idiomas: el campo `language` solo declara indonesio; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Sesgos: no se han publicado análisis de sesgos; al ser un modelo derivado de un base coder y ajustado presumiblemente en indonesio, pueden aparecer sesgos lingüísticos y culturales.
- Licencia MIT: permite uso comercial, pero el modelo base `kestrel-4b-coder` podría tener condiciones adicionales no reflejadas en esta model card; conviene verificar la licencia del base antes de producción.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con documentos largos.
- Tool calling y agentes: no documentados; no asumir su disponibilidad.
- Repositorio con pocas descargas (52) y sin likes: ecosistema mínimo, sin garantías de mantenimiento ni soporte comunitario.
- Fecha de creación futura (2026-11-03) en los metadatos: posible inconsistencia que conviene verificar.
- El aviso de la model card sobre ficheros binarios no rastreados en Git sugiere que el repositorio puede estar incompleto si se clona sin LFS.

## Enlaces

- Hugging Face: https://huggingface.co/Adhitiad/uis_0.1
- Modelo base declarado: `kestrel-4b-coder` (no se proporciona URL directa en la información disponible)
- Repositorio llama.cpp (para inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Repositorio ctransformers: https://github.com/marella/ctransformers
- Repositorio llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Documentación transformers: https://huggingface.co/docs/transformers
