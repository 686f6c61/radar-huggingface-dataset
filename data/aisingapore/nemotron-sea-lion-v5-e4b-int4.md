# aisingapore/Nemotron-SEA-LION-v5-E4B-INT4

## Resumen

Nemotron-SEA-LION-v5-E4B-INT4 es la versión cuantizada a 4 bits del modelo multimodal Nemotron-SEA-LION-v5-E4B, desarrollado por el AI Products Pillar de AI Singapore con financiación del National Research Foundation Singapore. Forma parte de la familia SEA-LION (Southeast Asian Languages In One Network), una colección de modelos diseñada específicamente para dar cobertura a las lenguas del sudeste asiático, un ámbito tradicionalmente infrarrepresentado en los grandes modelos generalistas. El modelo parte de la arquitectura Gemma 4 y se distribuye como un modelo de tipo "E4B" con aproximadamente 8.000 millones de parámetros totales.

La variante INT4 reduce el peso de los pesos de 16,0 GB (BF16) a 10,4 GB, manteniendo en BF16 los codificadores de visión y audio, los embeddings por capa y el resto de componentes no lineales. La cuantización se realizó con GPTQ simétrico, tamaño de grupo 32, calibrado sobre datos de instrucciones del sudeste asiático mediante la herramienta llm-compressor. El tokenizador, la plantilla de chat y los parámetros de muestreo son idénticos a los del modelo original.

Su relevancia actual radica en tres factores: cobertura de nueve idiomas (incluidos birmano, tamil, tailandés y vietnamita, poco frecuentes en modelos abiertos), contexto de 64K tokens, licencia MIT que permite uso comercial sin restricciones, y soporte de tool calling, modo de razonamiento (thinking) y entrada image-text-to-text. Todo ello en un paquete que cabe en GPUs de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 4 (image-text-to-text) |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | 64K tokens |
| Tipos de cuantizacion | INT4 (GPTQ simetrico, group size 32) para capas lineales; BF16 para codificadores de vision/audio y embeddings por capa; existen variantes BF16, FP8 y GGUF |
| Idiomas soportados | en, zh, my (birmano), id (indonesio), fil (filipino), ms (malayo), ta (tamil), th (tailandes), vi (vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal derivada de Gemma 4, con codificadores separados para visión y audio que permanecen en BF16 tras la cuantización. La variante INT4 aplica cuantización GPTQ simétrica con tamaño de grupo 32 exclusivamente a las capas lineales, calibrada sobre datos de instrucciones del sudeste asiático para preservar el rendimiento en esos idiomas. El resto de componentes (embeddings por capa, capas de normalización, cabezas de salida) mantiene precisión BF16, lo que reduce la degradación típica de las cuantizaciones agresivas.

No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO. La model card remite al modelo base (aisingapore/Nemotron-SEA-LION-v5-E4B) y a la ficha de NVIDIA (nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16) para los detalles de entrenamiento, evaluación de seguridad y limitaciones. Sí se documenta la existencia de un modo de razonamiento (thinking) activado por defecto, un presupuesto de razonamiento configurable en tiempo de ejecución, un modo conversacional para respuestas breves de estilo hablado y soporte de tool calling con parser específico `gemma4`.

## Capacidades

- Generación de texto y razonamiento multi-step con modo thinking activable y presupuesto de razonamiento configurable.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador de visión en BF16.
- Procesamiento de audio (codificador de audio en BF16), aunque el ejemplo de despliegue de vLLM limita las entradas multimodales a cero.
- Tool calling / function calling nativo, con `--enable-auto-tool-choice` y parser `gemma4` en vLLM.
- Capacidades multilingües en nueve idiomas: inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita.
- Modo conversacional (`conversational_mode`) para respuestas breves de estilo oral.
- Soporte de contexto largo de hasta 64K tokens para conversaciones multi-turno y documentos extensos.
- Compatible con endpoints OpenAI a través de vLLM.

## Casos de uso

- Atención al cliente en el sudeste asiático: el modelo puede gestionar conversaciones multi-turno en birmano, tailandés, vietnamita o indonesio con hasta 64K tokens de contexto, lo que permite mantener el historial completo de un cliente y documentación de producto en la misma ventana.
- Automatización de exportación y logística regional: tal como ilustra el ejemplo de la model card, redactar explicaciones de documentación aduanera, tiempos de tránsito y riesgos de cadena de frío en indonesio a partir de una consulta en lenguaje natural.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, puede extraer y resumir información de facturas, albaranes o formularios escaneados en idiomas locales.
- Asistentes de voz o audio: el codificador de audio permite transcribir o interpretar contenido hablado y responder en el mismo idioma, útil para líneas de atención telefónica.
- Agentes con tool calling: integrado en vLLM con parser `gemma4`, puede invocar funciones externas (consultas meteorológicas, bases de datos, APIs de logística) en flujos de agente multi-paso.
- Generación de código y soporte técnico multilingüe: útil para desarrolladores que trabajan en mercados del sudeste asiático y necesitan explicaciones o documentación en inglés, chino o lenguas locales.
- Despliegue en infraestructura limitada: con 10,4 GB de pesos en INT4, puede servirse en una única GPU de consumo de gama alta para prototipos, demos o entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,4 GB solo para los pesos en INT4; con caché KV para 64K tokens y overhead de runtime, se recomienda un mínimo de 16-24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para producción; RTX 4090 (24 GB) para despliegue en una sola tarjeta de consumo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en tarjetas de 16 GB el margen es muy ajustado con contexto largo.
- Opciones de despliegue: vLLM (soporte oficial documentado, con `--reasoning-parser gemma4` y `--tool-call-parser gemma4`); la variante GGUF del modelo base permite llama.cpp y Ollama; SGLang 0.5.23 no puede cargar esta build cuantizada según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas SEA | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-SEA-LION-v5-E4B-INT4 | ~8B | 64K | 9 (incl. my, ta, th, vi) | MIT | safetensors INT4 |
| Nemotron-SEA-LION-v5-E4B (BF16) | ~8B | 64K | 9 | MIT | safetensors BF16 |
| Nemotron-SEA-LION-v5-E4B-FP8 | ~8B | 64K | 9 | MIT | safetensors FP8 |
| Nemotron-SEA-LION-v5-E4B-GGUF | ~8B | 64K | 9 | MIT | GGUF (llama.cpp) |

No se dispone en la información proporcionada de datos de rendimiento comparativo frente a otros modelos de la misma categoría (por ejemplo, Qwen, Llama o Gemma en sus variantes multilingües). La comparativa se limita a las distintas variantes de cuantización de la misma familia.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de protección adicionales.
- No se ha evaluado la robustez frente a prompting adversario.
- Riesgo de alucinación documentado por el autor: puede generar contenido irrelevante o elementos ficticios no fundamentados en el contexto.
- Posibles inconsistencias en las respuestas que requieren validación por parte del usuario.
- La cuantización INT4 puede introducir degradación adicional respecto a la versión BF16, especialmente en tareas de razonamiento complejo o idiomas de bajos recursos.
- El ejemplo de despliegue en vLLM limita las entradas multimodales a cero (`--limit-mm-per-prompt '{"image":0,"video":0,"audio":0}'`), por lo que para usar visión o audio hay que ajustar esa configuración.
- SGLang 0.5.23 no puede cargar esta build cuantizada; es necesario usar vLLM.
- Aunque la licencia MIT permite uso comercial sin restricciones, el autor declina toda responsabilidad por reclamaciones derivadas del uso de los pesos.
- No se dispone de información sobre sesgos específicos por idioma ni sobre evaluación en tareas de seguridad para las lenguas del sudeste asiático cubiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-INT4
- Modelo base BF16: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B
- Variante FP8: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-FP8
- Variante GGUF: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B-GGUF
- Colección SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5
- Ficha de NVIDIA Nemotron-3.5-Bolt-E4B-BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Proyecto SEA-LION: https://sea-lion.ai
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia MIT: https://mit-license.org/
