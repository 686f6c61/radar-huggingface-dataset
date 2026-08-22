# Gio-010/JARVIS-Qwen

## Resumen

JARVIS-Qwen es un modelo de lenguaje multimodal derivado de Qwen3.5-4B, convertido a formato GGUF mediante la herramienta Unsloth para su ejecución eficiente con llama.cpp. El autor, Gio-010, lo publica en HuggingFace como un modelo conversacional orientado a asistentes personales, con capacidad de procesamiento de visión (vision-language model). El repositorio incluye dos archivos: un GGUF cuantizado en Q4_K_M para el modelo principal y un proyector multimodal en F16 para el módulo de visión.

El modelo tiene aproximadamente 4.330 millones de parámetros y un tamaño de repositorio de 3.5 GB, lo que lo sitúa en la gama de modelos pequeños y desplegables en hardware de consumo. Su relevancia radica en combinar capacidades multimodales con un formato optimizado para inferencia local, aunque la información pública disponible es muy limitada y no permite evaluar su rendimiento real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformer multimodal) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

La arquitectura se basa en Qwen3.5-4B, un modelo transformer multimodal que combina un codificador de visión con un decodificador de lenguaje. El finetuning se realizó con la librería Unsloth, que optimiza el entrenamiento mediante técnicas de atención eficiente y kernels de CUDA. El modelo se convirtió posteriormente a formato GGUF para su uso con llama.cpp, incluyendo un proyector multimodal en F16 para procesar imágenes.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el finetuning.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos coherentes y contextualmente relevantes.
- Comprensión multimodal: al ser un vision-language model, puede procesar imágenes junto con texto.
- Ejecución local: el formato GGUF permite su uso en entornos sin GPU dedicada o con recursos limitados.
- Compatibilidad con llama.cpp: soporta tanto la CLI estándar (`llama-cli`) como la multimodal (`llama-mtmd-cli`).
- No se confirma soporte de tool calling, function calling, agentes o razonamiento multi-step.
- No se detalla capacidad multilingüe.

## Casos de uso

- Asistente personal conversacional: puede integrarse en aplicaciones de chat locales que requieran respuestas contextuales en tiempo real, aprovechando su tamaño reducido para ejecución en hardware modesto.
- Análisis de imágenes en dispositivos de borde: gracias al módulo de visión, puede describir o responder preguntas sobre imágenes sin necesidad de conexión a la nube.
- Prototipado de aplicaciones de IA: desarrolladores pueden usarlo como base para pruebas de concepto de chatbots o asistentes multimodales antes de migrar a modelos mayores.
- Despliegue en infraestructura propia: al estar en GGUF, puede ejecutarse con llama.cpp en servidores sin GPU, reduciendo costes de inferencia.
- Automatización de tareas de documentación: puede resumir o extraer información de imágenes escaneadas o capturas de pantalla.
- Educación y demostraciones técnicas: útil para enseñar el despliegue de modelos multimodales en hardware básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa aproximadamente 3.5 GB, por lo que la inferencia con cuantización Q4 necesita menos de 4 GB de VRAM (o RAM para CPU).
- GPU recomendadas: cualquier GPU con 4 GB o más (GTX 1660, RTX 2060, RTX 3050, etc.) puede ejecutarlo. También funciona en CPU con llama.cpp.
- Compatible con consumer GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli), Ollama, llama-cpp-python, y servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no se proporcionan datos oficiales, pero por su tamaño y cuantización, se estima una generación de 20-40 tokens/s en GPU de gama media y 5-10 tokens/s en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa fiable con otros modelos. El único dato conocido es que se basa en Qwen3.5-4B, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial requiere verificar la licencia de Qwen3.5-4B (normalmente Apache 2.0 o similar, pero no confirmado para este modelo).
- No hay información sobre sesgos o alucinaciones específicas del modelo.
- La longitud de contexto es desconocida, lo que limita su uso en tareas que requieran ventanas largas.
- El modelo es muy reciente (agosto de 2026) y no tiene descargas ni likes, lo que indica que no ha sido validado por la comunidad.
- No se han publicado benchmarks ni evaluaciones de calidad.
- La arquitectura multimodal requiere el proyector F16, lo que puede aumentar los requisitos de memoria si se usa con imágenes.

## Enlaces

- https://huggingface.co/Gio-010/JARVIS-Qwen
- https://github.com/unslothai/unsloth
- https://github.com/JoshiiWahWah/jarvis (proyecto homónimo, no relacionado directamente)
- https://qwen.ai/home
