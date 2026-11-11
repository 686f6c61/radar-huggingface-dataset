# agentscope-ai/Piccolo-9B-VL

## Resumen

Piccolo 9B VL es un modelo de lenguaje y vision (image-text-to-text) publicado por el equipo agentscope-ai en Hugging Face. El checkpoint declara la arquitectura `Qwen3_5ForConditionalGeneration` con una configuración de visión, lo que lo sitúa en la familia de modelos multimodales derivados de la línea Qwen 3.5. El repositorio contiene pesos en Safetensors (cuatro shards principales más un fichero `model-frozen-mtp.safetensors`) y el conjunto completo de configuraciones de modelo, generación, tokenizer, processor y plantilla de chat.

Con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones) y un tamaño de repositorio de 19,3 GB, el modelo se posiciona en el segmento de VLMs de tamaño medio, adecuado para despliegues en una sola GPU de gama alta o en configuraciones multi-GPU con cuantización. La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

La relevancia de este lanzamiento radica en su integración con el ecosistema transformers y su compatibilidad declarada con endpoints, lo que simplifica el despliegue en infraestructuras de inferencia gestionadas. No obstante, la model card es extremadamente escueta y no documenta detalles de entrenamiento, datos, benchmarks ni idiomas soportados, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con configuración de visión) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (4 shards principales + model-frozen-mtp.safetensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration`, que combina un backbone de lenguaje de tipo transformer con un codificador de visión para tareas de imagen-a-texto. La presencia de un fichero `model-frozen-mtp.safetensors` sugiere la inclusión de módulos de predicción multi-token (MTP) congelados, un componente habitual en arquitecturas recientes orientadas a decodificación especulativa o entrenamiento multi-token. Sin embargo, la model card no detalla la función exacta de este fichero ni cómo se integra en la inferencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, las etapas de alineación (RLHF, DPO) ni innovaciones técnicas adicionales. La documentación publicada se limita a describir la estructura del repositorio y las configuraciones incluidas, sin aportar detalles sobre el proceso de entrenamiento o las decisiones de diseño.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, lo que implica capacidad de describir, responder preguntas y razonar sobre imágenes.
- Conversación multi-turno: incluye plantilla de chat, lo que facilita su uso en diálogos estructurados.
- Procesamiento multimodal: integra un processor específico para entradas de imagen y texto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en infraestructuras de inferencia gestionadas compatibles con transformers.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Soporte multilingüe: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en catálogos de producto: el modelo puede recibir una imagen y generar descripciones textuales estructuradas, útil para comercio electrónico y gestión de activos digitales.
- Asistencia a personas con discapacidad visual: integrado en aplicaciones de lectura de pantalla, el modelo puede describir escenas, documentos o gráficos a partir de una imagen capturada.
- Extracción de información de documentos escaneados: combinando entrada de imagen y texto, puede responder preguntas sobre facturas, formularios o capturas de pantalla en flujos de automatización de back-office.
- Moderación de contenido visual: el modelo puede analizar imágenes y generar informes textuales sobre su contenido para sistemas de revisión semiautomatizada.
- Interfaces conversacionales con soporte visual: en asistentes de atención al cliente que reciben capturas de pantalla o fotos del producto, el modelo puede interpretar la imagen y continuar la conversación multi-turno.
- Anotación asistida de datasets multimodales: investigadores pueden usar el modelo para preetiquetar pares imagen-texto antes de la revisión humana, acelerando la construcción de corpus.
- Prototipado rápido en investigación: gracias a la licencia Apache 2.0 y al formato Safetensors compatible con transformers, es adecuado para experimentos académicos sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-12 GB para pesos, más overhead; viable en GPUs de 16-24 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 6-8 GB para pesos, más overhead; viable en GPUs consumer de 12 GB o superiores.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegues en FP16; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización; RTX 3090/4080 para cuantización 8/4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 con FP16 y contexto limitado, o en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (nativo), vLLM y TGI si soportan la arquitectura Qwen3_5ForConditionalGeneration; llama.cpp/Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Piccolo 9B VL | 9,65 B | no disponible | Apache 2.0 | Safetensors | Arquitectura Qwen3_5, multimodal |
| Qwen2.5-VL-7B | 7 B | 128k (según documentación pública de Qwen) | Apache 2.0 | Safetensors | Multimodal, familia Qwen |
| Llama 3.2 11B Vision | 11 B | 128k (según documentación pública de Meta) | Llama 3.2 Community License | Safetensors | Multimodal, licencia con restricciones |
| InternVL2-8B | 8 B | no disponible | MIT (según documentación pública) | Safetensors | Multimodal, orientado a investigación |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa de categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; no hay garantías sobre el comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de imagen-a-texto puede describir elementos inexistentes o malinterpretar detalles visuales.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés (y posiblemente chino, dada la arquitectura Qwen) es incierto.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con requisitos de contexto largo.
- El fichero `model-frozen-mtp.safetensors` no está descrito en detalle; su uso incorrecto o su omisión podría afectar a la inferencia.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los componentes derivados (tokenizer, processor) incluidos en el repositorio.
- El número de descargas (38) y likes (0) indica un modelo muy reciente y poco validado por la comunidad; no hay evidencia de uso en producción.
- No se dispone de información sobre latencia, throughput ni requisitos mínimos de software (versión de transformers, CUDA).

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-9B-VL
