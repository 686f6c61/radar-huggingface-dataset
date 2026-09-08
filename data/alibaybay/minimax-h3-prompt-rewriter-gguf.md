# alibaybay/MiniMax-H3-Prompt-Rewriter-GGUF

## Resumen

MiniMax-H3 Prompt Rewriter es un modelo de texto a texto diseñado para reescribir peticiones breves de usuarios en el esquema estructurado que requiere el sistema de generación de video y audio MiniMax-H3. Se trata de un finetune de tipo LoRA sobre el backbone «Thinker» de Qwen/Qwen2.5-Omni-7B, desarrollado originalmente por lightx2v y fusionado y cuantizado por alibaybay para su uso con llama.cpp y Ollama. Su relevancia actual radica en que permite obtener prompts de alta calidad para generación de video sin depender de servicios externos ni exponer datos a APIs remotas, todo ello ejecutándose en local.

El modelo se distribuye únicamente en formato GGUF, con dos niveles de cuantización: Q4_K_M, de aproximadamente 4,5 GB, y Q8_0, de aproximadamente 7,5 GB. La arquitectura subyacente corresponde a un transformer multimodal, aunque en esta versión su función se limita a la reescritura de prompts de texto. La información sobre la longitud de contexto y los detalles de entrenamiento no se encuentra en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone «Thinker» de Qwen2.5-Omni-7B) con adaptador LoRA fusionado |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-Omni-7B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (~4,5 GB) y Q8_0 (~7,5 GB) |
| Idiomas soportados | Ingles, chino (entrada); salida en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-Omni-7B, un modelo multimodal de 7.000 millones de parámetros que integra capacidades de texto, imagen, audio y video en su backbone «Thinker». Sobre este modelo base se ha aplicado el adaptador LoRA «MiniMax-H3-Prompt-Rewriter-LoRA-Omni» de lightx2v, que ha sido fusionado con los pesos originales y posteriormente convertido a formato GGUF mediante llama.cpp. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. La única innovación técnica documentada es la conversión a cuantización GGUF para permitir su ejecución en entornos con recursos limitados.

## Capacidades

- Reescritura de prompts cortos en el esquema oficial de MiniMax-H3, compuesto por los campos `integrated_multimodal_description`, `overall_soundscape` y `non_diegetic_music`.
- Generación de salida en inglés, independientemente del idioma de entrada, tal como se describe en los repositorios de la comunidad.
- Funcionamiento como modelo de generación de texto puro (text-generation) en formato GGUF; no se confirma soporte de visión o audio en esta versión cuantizada.
- Ejecución local mediante llama.cpp y Ollama, sin necesidad de servicios en la nube.
- Integración con nodos de ComfyUI para automatizar el proceso de reescritura de prompts en flujos de generación de video.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Generación de prompts para video con MiniMax-H3: el modelo transforma una petición simple, como «un zorro rojo camina por un bosque nevado al amanecer», en una descripción completa con desglose de planos, movimientos de cámara y estilo visual, lista para ser enviada al generador de video.
- Pipelines de ComfyUI para creadores de contenido: los nodos que integran este reescritor permiten conectar texto de entrada con generación de video o audio de forma totalmente local, manteniendo el flujo reproducible.
- Uso local con Ollama: gracias al tamaño reducido de la cuantización Q4_K_M, el modelo puede ejecutarse en portátiles con GPU de baja VRAM o incluso en CPU, facilitando su uso en entornos de desarrollo sin acceso a infraestructura cloud.
- Enriquecimiento de diseño de sonido: el campo `overall_soundscape` y la sección de música no diegética permiten generar descripciones de ambientes sonoros, efectos físicos y bandas sonoras para proyectos audiovisuales.
- Automatización de producción de contenido en agencias de video: el modelo puede integrarse en scripts para convertir breves indicaciones de clientes en prompts estructurados, reduciendo el tiempo de preparación de peticiones para MiniMax-H3.
- Reescritura multilingüe de prompts para exportarse a inglés: dado que la salida es siempre en inglés, sirve para unificar prompts provenientes de equipos que trabajan en otros idiomas.
- Herramientas de apoyo a editores de video amateur: aplicaciones de escritorio que incorporen Ollama pueden ofrecer reescritura de prompts en local, sin coste por API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Cuantización Q4_K_M (~4,5 GB): puede ejecutarse en CPU o en GPU con entre 6 y 8 GB de VRAM; es la opción recomendada para Ollama en equipos de consumo.
- Cuantización Q8_0 (~7,5 GB): requiere al menos 10-12 GB de VRAM o una CPU con suficiente memoria RAM; ofrece una fidelidad cercana a FP16.
- Despliegue compatible con Ollama, llama.cpp y nodos de ComfyUI.
- No se han publicado mediciones de latencia ni throughput para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3 Prompt Rewriter (GGUF) | 7.000 millones (Qwen2.5-Omni-7B) | No disponible | Apache 2.0 | GGUF, Ollama, llama.cpp |
| Qwen2.5-Omni-7B (base) | 7.000 millones | No indicado en esta fuente | Apache 2.0 | Checkpoints originales, no optimizado para reescritura |
| Reescritor de prompts de pytraveler (Qwen3.6-27B) | 27.000 millones | No disponible | No indicado | GGUF, requiere más recursos |

La comparativa se basa solo en la información encontrada en la documentación disponible; no se han verificado los contextos ni el rendimiento de los modelos alternativos.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de sesgos para este modelo, por lo que es posible que herede sesgos del modelo base Qwen2.5-Omni-7B.
- Existe el riesgo de alucinación inherente a los modelos generativos de lenguaje, que puede provocar que la reescritura de prompts resulte inexacta o inconsistente.
- La salida del modelo es siempre en inglés, lo que limita su utilidad para generar prompts en otros idiomas.
- La entrada está documentada principalmente para inglés y chino; otros idiomas pueden ofrecer peores resultados.
- La licencia Apache 2.0 permite el uso comercial, pero exige mantener el aviso de licencia en las obras derivadas.
- La cuantización a Q4_K_M puede degradar la calidad de la reescritura con respecto al modelo original en FP16.
- Este modelo no es un generador de video o audio; únicamente reescribe prompts. No sustituye a MiniMax-H3 ni a otros modelos de difusión.

## Enlaces

- https://huggingface.co/alibaybay/MiniMax-H3-Prompt-Rewriter-GGUF
- https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-Omni
- https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- https://comfy.icu/node/MiniMaxH3PromptRewriter
- https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-GGUF
