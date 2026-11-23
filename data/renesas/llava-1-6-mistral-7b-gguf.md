# Renesas/LLaVA-1.6-Mistral-7B-GGUF

## Resumen

LLaVA-1.6-Mistral-7B-GGUF es una conversión a formato GGUF en precisión FP16 del modelo multimodal LLaVA-1.6-Mistral-7B, publicada por Renesas para su uso en la plataforma embebida R-Car X5H. El modelo original, desarrollado por el equipo LLaVA (Haotian Liu et al.) y alojado en Hugging Face bajo el identificador `llava-hf/llava-v1.6-mistral-7b-hf`, combina el modelo de lenguaje Mistral-7B con un proyector visual que permite procesar imágenes junto a texto. Esta publicación concreta no introduce cambios en los pesos: es una conversión directa de los pesos originales a F16 mediante `convert_hf_to_gguf.py` de llama.cpp.

La relevancia de esta ficha es fundamentalmente práctica: Renesas la aloja porque no existía un GGUF público en FP16 de este modelo, y lo ha validado con **npx-llm**, su paquete de llama.cpp con backend para la NPU NPX6 del SoC R-Car X5H. Por tanto, el interés principal es el despliegue de un modelo visión-lenguaje de 7B en hardware automotriz/embebido con aceleración NPU, no una mejora del modelo en sí.

El modelo resuelve tareas de image-text-to-text: descripción de imágenes, respuesta a preguntas visuales (VQA) y razonamiento multimodal básico, con la solidez de Mistral-7B como base lingüística. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLaVA 1.6): LLM Mistral-7B + proyector visual (mmproj) |
| Parametros totales | 7B (aproximado, según el modelo base Mistral-7B; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP16 (F16) únicamente en esta publicación |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16), más mmproj F16 externo |

## Arquitectura y entrenamiento

La arquitectura corresponde a LLaVA 1.6, un modelo visión-lenguaje que acopla un codificador visual (CLIP/SigLIP, según la variante 1.6) a un modelo de lenguaje Mistral-7B mediante un proyector multimodal entrenado para alinear representaciones visuales con el espacio de tokens del LLM. En esta publicación, el fichero GGUF contiene únicamente el modelo de lenguaje convertido de los pesos upstream; el proyector visual (mmproj) no se incluye y debe descargarse por separado desde `cjpais/llava-1.6-mistral-7b-gguf` (`mmproj-model-f16.gguf`).

No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card indica explícitamente que el fichero es una conversión directa sin modificaciones adicionales ("It is not changed otherwise"), por lo que las características de entrenamiento son las del modelo LLaVA-1.6-Mistral-7B original.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes y respuesta a preguntas visuales.
- Razonamiento multimodal básico combinando contexto textual e imagen en un mismo prompt.
- Conversación multi-turno con soporte de imágenes en el contexto (según capacidades del modelo base LLaVA 1.6).
- Inferencia en llama.cpp mediante `llama-mtmd-cli` con `--mmproj` para entrada visual.
- Ejecución acelerada en la NPU NPX6 del Renesas R-Car X5H a través de npx-llm.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en cabina o entorno automotriz: el modelo puede describir o interpretar imágenes capturadas por cámaras del vehículo en la plataforma R-Car X5H, aprovechando la NPU NPX6 para inferencia local sin dependencia de la nube.
- Sistemas de inspección visual embebidos: integración en dispositivos con SoC R-Car X5H para clasificar o describir imágenes de sensores en tiempo casi real.
- Prototipado de aplicaciones VQA en hardware Renesas: validación de pipelines de visión-lenguaje sobre la NPU antes de desplegar en producción, usando el SDK npx-llm.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo en dispositivos empotrados con recursos limitados.
- Documentación y anotación semiautomática de imágenes: uso del modelo para preetiquetar contenido visual en flujos de trabajo internos.
- Evaluación comparativa de backends NPU: referencia FP16 para medir latencia y throughput de llama.cpp frente al backend NPX6 en el R-Car X5H.
- Investigación en despliegue de VLMs en el borde: base para estudiar el comportamiento de LLaVA 1.6 en hardware embebido con memoria NPU limitada (`NPX_MEMORY_MB=18432` en el ejemplo de la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del fichero GGUF F16: 14,5 GB (SHA-256 `559dfae1f9350cef66282753d5bf36d381eb939102fc4af0bbbc3bba609022dc`).
- Memoria NPU configurada en el ejemplo oficial: `NPX_MEMORY_MB=18432` (18 GB) en el Renesas R-Car X5H.
- Hardware objetivo: SoC Renesas R-Car X5H con NPU NPX6, mediante el SDK npx-llm (llama.cpp con backend NPU) distribuido en el portal de clientes de Renesas.
- GPU de consumo: no disponible en la información proporcionada; el fichero F16 de 14,5 GB requiere al menos ~15-16 GB de VRAM para cargarse completo en GPU, aunque no se documenta soporte específico.
- Opciones de despliegue: `llama-cli` y `llama-mtmd-cli` de npx-llm en la placa; llama.cpp estándar para GGUF (no validado explícitamente en esta publicación).
- Parámetros de ejecución de referencia: `-at f16 -fa on -t 4` (atención en F16, flash attention activada, 4 hilos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA-1.6-Mistral-7B (esta publicación, GGUF F16) | ~7B | no disponible | Imagen + texto | Apache 2.0 | Hugging Face (Renesas) |
| llava-hf/llava-v1.6-mistral-7b-hf (upstream) | ~7B | no disponible | Imagen + texto | Apache 2.0 | Hugging Face (pesos originales) |
| cjpais/llava-1.6-mistral-7b-gguf | ~7B | no disponible | Imagen + texto | Apache 2.0 (heredada) | Hugging Face (GGUF cuantizado + mmproj) |

La diferencia principal frente al upstream es el formato (GGUF F16 frente a safetensors) y la validación en la NPU NPX6. Frente a la publicación de `cjpais`, esta versión ofrece FP16 sin cuantizar y un SHA-256 publicado, pero no incluye el mmproj.

## Limitaciones y advertencias

- El fichero contiene solo el modelo de lenguaje; sin el mmproj externo (`cjpais/llava-1.6-mistral-7b-gguf`) no es funcional para tareas de imagen.
- El modelo no ha sido modificado ni afinado por Renesas: hereda todos los sesgos y limitaciones de LLaVA-1.6-Mistral-7B, incluidos posibles sesgos visuales y de género/raza en descripciones.
- Riesgo de alucinación inherente a los modelos visión-lenguaje de esta generación, especialmente en descripciones detalladas o preguntas sobre texto en imágenes.
- Idiomas soportados no documentados; el comportamiento multilingüe puede degradarse respecto al inglés.
- El despliegue validado está ligado al SDK npx-llm y al hardware R-Car X5H; el uso en otras plataformas no está verificado por el autor.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del codificador visual subyacente.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- No se documentan requisitos de VRAM, latencia ni throughput fuera del hardware Renesas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renesas/LLaVA-1.6-Mistral-7B-GGUF
- Modelo base upstream: https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf
- Proyector visual (mmproj): https://huggingface.co/cjpais/llava-1.6-mistral-7b-gguf/blob/main/mmproj-model-f16.gguf
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Renesas (sitio corporativo): https://www.renesas.com/
- Renesas productos: https://www.renesas.com/en/products
- Renesas Electronics (Wikipedia): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas en L'Embarqué: https://lembarque.com/entreprise/renesas
