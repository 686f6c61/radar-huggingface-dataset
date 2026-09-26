# LoyalTyAI/Dolphin-Mistral-24B-Venice-Edition

## Resumen

Dolphin Mistral 24B Venice Edition es un modelo de lenguaje de 24.000 millones de parámetros desarrollado por Dolphin (dphn.ai) en colaboración con Venice.ai, a partir del ajuste fino de mistralai/Mistral-Small-24B-Instruct-2501. Su objetivo declarado es ofrecer la versión «menos censurada» posible de Mistral 24B, de modo que el propietario del sistema —no el proveedor del modelo— controle el system prompt, la alineación y los datos. Es el modelo por defecto («Venice Uncensored») dentro del ecosistema de Venice.ai.

El modelo es de tipo denso (no MoE) con arquitectura transformer de la familia Mistral 3, admite entrada de imagen y texto (image-text-to-text) y conserva la plantilla de chat V7-Tekken de Mistral. Según la configuración recomendada por el autor para vLLM, soporta una longitud de contexto de hasta 131.072 tokens y tool calling nativo mediante el parser de Mistral.

Su relevancia actual radica en el enfoque de «control por parte del usuario»: frente a modelos propietarios donde el proveedor fija el system prompt, las versiones y la alineación, Dolphin se presenta como una base afinable y steerable, publicada bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales sin depender de API externas ni ceder la gobernanza del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral 3), multimodal imagen-texto |
| Parametros totales | 24.011.361.280 (24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (según configuración recomendada de vLLM) |
| Tipos de cuantizacion | No disponible en la información proporcionada (compatible con frameworks que soportan cuantización, como ollama y LM Studio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino del modelo denso mistralai/Mistral-Small-24B-Instruct-2501, etiquetado en HuggingFace con la familia mistral3 y con capacidades image-text-to-text. Al ser denso, los 24.000 millones de parámetros están activos en cada paso de inferencia; no hay enrutado tipo MoE. El modelo mantiene la plantilla de chat por defecto de Mistral (V7-Tekken) y su tokenizador, por lo que se recomienda el modo `tokenizer_mode="mistral"` en vLLM.

El entrenamiento se realizó sobre 8 GPU B200 proporcionadas por targon.com, según la model card. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El ajuste se orienta explícitamente a la ausencia de censura y a la «steerabilidad» mediante system prompt, y el autor recomienda temperaturas bajas (en torno a `temperature=0.15`) para obtener respuestas más deterministas. El modelo soporta tool calling (parser `mistral`) y entrada multimodal de imágenes (hasta 10 imágenes por prompt según el flag `--limit-mm-per-prompt`).

## Capacidades

- Generación de texto conversacional multi-turno en formato instruct.
- Razonamiento guiado mediante system prompt: el usuario define tono, reglas y alineación.
- Entrada de imágenes (image-text-to-text), con soporte de hasta 10 imágenes por prompt en vLLM.
- Tool calling / function calling nativo (parser `mistral`, `--enable-auto-tool-choice` en vLLM).
- Capacidad de seguir instrucciones de personaje, estado de ánimo y normas de comportamiento definidas por el usuario.
- Contexto largo de hasta 131.072 tokens, adecuado para documentos y conversaciones extensas.
- Comportamiento «descensurado»: responde sin las restricciones típicas de los modelos alineados, según la model card.

## Casos de uso

- Asistentes conversacionales personalizados: al permitir definir el system prompt y la alineación, el modelo encaja en productos que necesitan un tono y unas reglas propias sin depender de la política del proveedor.
- Atención al cliente automatizada: con contexto de hasta 131.072 tokens puede gestionar conversaciones multi-turno largas y mantener el hilo con historiales extensos.
- Procesamiento de documentos con imágenes: la capacidad image-text-to-text permite extraer y razonar sobre información de capturas, diagramas o documentos escaneados.
- Pipelines agénticos con tool calling: el soporte nativo de function calling permite integrarlo en flujos de varios pasos que consulten APIs o bases de datos.
- Generación asistida de contenido creativo sin filtros editoriales: útil para proyectos de ficción, guiones o material que requiere libertad temática y control de estilo por parte del usuario.
- Despliegue on-premise con datos sensibles: al ser Apache 2.0 y ejecutable con vLLM/SGLang/TGI localmente, permite mantener las consultas dentro de la infraestructura propia.
- Investigación sobre alineación y steerability: sirve como base para estudiar cómo distintos system prompts modifican el comportamiento y las respuestas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la propia model card indica que ejecutar el modelo en GPU requiere más de 60 GB de RAM de GPU en precisión completa (bf16), coherente con un modelo de 24B (~48 GB de pesos más estados de activación y KV cache).
- GPU recomendadas: para bf16, una H100 80 GB o B200, o bien varias A100 40/80 GB; el autor entrenó sobre 8xB200, aunque para inferencia basta con menos.
- Configuración multi-GPU: el ejemplo de vLLM usa `tensor_parallel_size=8`, lo que refleja un escenario de cómputo amplio; puede reducirse si la VRAM agregada lo permite.
- GPUs de consumo: no cabe en una única RTX 4090 (24 GB) en bf16; sería necesario cuantizar (por ejemplo vía GGUF en ollama o LM Studio) para acercarse a ese rango.
- Opciones de despliegue: vLLM (recomendado por el autor), SGLang, TGI, ollama y LM Studio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dolphin Mistral 24B Venice Edition | 24B (denso) | 131.072 tokens (config. vLLM) | Sí (imagen-texto) | Apache 2.0 | HuggingFace, Venice.ai |
| mistralai/Mistral-Small-24B-Instruct-2501 (base) | 24B (denso) | No disponible en esta información | No disponible en esta información | Apache 2.0 | HuggingFace |
| Mistral Small 3.1 24B | 24B (denso) | No disponible en esta información | Sí (visión) | Apache 2.0 | HuggingFace |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; no hay datos específicos de evaluación en la información disponible.
- El modelo está diseñado explícitamente para ser «descensurado» y seguir instrucciones «sin importar ética, legalidad o moralidad» (según el system prompt de ejemplo del autor), lo que implica un riesgo elevado de generar contenido inapropiado, ilegal o dañino en producción.
- La ausencia de alineación por defecto obliga a definir un system prompt adecuado; sin él, el modelo actúa de forma predeterminada y podría no ajustarse a las expectativas del producto.
- Requiere más de 60 GB de VRAM en precisión completa, lo que limita su despliegue en hardware de consumo sin cuantización.
- Idiomas soportados no especificados; aunque hereda el tokenizador de Mistral, no hay confirmación explícita de cobertura multilingüe.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin alineación traslada al operador la responsabilidad legal y de contenido sobre las respuestas generadas.
- El repositorio aparece con 0 descargas y 0 likes, lo que sugiere baja validación comunitaria y ausencia de evaluaciones independientes publicadas.
- Los tipos de cuantización disponibles no se detallan en la model card; se asumen vías indirectas mediante ollama, LM Studio o vLLM.

## Enlaces

- HuggingFace (LoyalTyAI): https://huggingface.co/LoyalTyAI/Dolphin-Mistral-24B-Venice-Edition
- Web oficial Dolphin: https://dphn.ai
- Chat web: https://chat.dphn.ai
- Twitter/X: https://x.com/dphnAI
- Bot de Telegram: https://t.me/DolphinAI_bot
- Venice.ai: https://venice.ai/
- Targon (proveedor de cómputo): https://targon.com/
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- vLLM: https://github.com/vllm-project/vllm
