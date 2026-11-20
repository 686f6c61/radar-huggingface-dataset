# minas2025/Gemma-4-E2B-Conversational-Uncensored

## Resumen

Gemma-4-E2B-Conversational-Uncensored es un ajuste fino (finetune) de tipo conversacional del modelo Gemma 4 E2B en su variante "Heretic-abliterated", desarrollado por el usuario minas2025 y publicado en Hugging Face. El modelo parte de `llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic`, una ablación de rechazos (abliteration) sobre `google/gemma-4-E2B-it`, y se ha entrenado con QLoRA sobre el dataset Airoboros 3.2 para dotarlo de un tono conversacional más natural, directo y sin las típicas respuestas corporativas.

El objetivo declarado es ofrecer un compañero de conversación local y privado, con comportamiento de "cero rechazos" heredado de la base, útil para brainstorming, explicaciones sencillas, escritura creativa y charla informal. No es un especialista en roleplay de formato largo ni un modelo orientado a tareas de asesoramiento profesional.

El modelo se distribuye principalmente en formato GGUF (cuantización Q8_0, aproximadamente 5,1 GB) para su uso en runners locales como llama.cpp, LM Studio o KoboldCpp. Cuenta con 4.647.450.147 parámetros totales según los pesos en safetensors del repositorio, y hereda la licencia Gemma a través de su cadena de modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B), ajuste fino QLoRA sobre base abliterated; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Entrenado con contexto de 2048; se recomienda usar 4096-8192 en inferencia |
| Tipos de cuantizacion | Q8_0 (GGUF); el entrenamiento uso QLoRA 4-bit |
| Idiomas soportados | Ingles (tag `en`); no se detallan otros idiomas |
| Licencia | Gemma Terms of Use (heredada de google/gemma-4-E2B-it) |
| Formato de pesos | GGUF (Q8_0); safetensors disponibles en el repo (4.647.450.147 parametros) |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 E2B, un transformer de la familia Gemma de Google, en su variante instruction-tuned (`google/gemma-4-E2B-it`). Sobre esa base se aplico primero una abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) por parte de llmfan46, dando lugar a `gemma-4-E2B-it-ultra-uncensored-heretic`. Posteriormente, minas2025 realizo un ajuste fino QLoRA de 4 bits con rango 16, alpha 16, dropout 0 y todas las capas lineales como objetivo, durante 1.000 pasos con batch 1, contexto de 2048, learning rate 8e-5 con schedule coseno y optimizador AdamW de 8 bits (weight decay 0,001).

El dataset de entrenamiento fue `jondurbin/airoboros-3.2` en formato ShareGPT, con aproximadamente 59.000 conversaciones de instruccion y dialogo. El entrenamiento se ejecuto en una unica GPU AMD Radeon RX 6700 XT de 12 GB con ROCm, en unos 23 minutos, usando Unsloth Studio para entrenamiento, merge y conversion a GGUF mediante llama.cpp. La perdida final suavizada se situo en el rango 0,7-1,0, un valor bajo que el autor atribuye a datos sinteticos limpios. El ajuste es deliberadamente ligero para preservar el conocimiento y el razonamiento del modelo base.

## Capacidades

- Generacion de texto conversacional con tono natural, directo y sin respuestas corporativas.
- Comportamiento de cero rechazos (zero-refusal) heredado de la base abliterated: no introduce advertencias ni sermones a mitad de conversacion.
- Brainstorming y generacion de ideas.
- Explicaciones simplificadas de conceptos complejos (por ejemplo, explicar un modelo cuantizado "como a un nino de cinco anos").
- Escritura creativa y charla informal (casual banter).
- Capacidad multimodal opcional si se descarga el archivo `mmproj` (proyeccion de vision) para entrada de imagenes; para uso solo de texto no es necesario.
- Compatibilidad con endpoints OpenAI-compatible a traves de llama-server y otros frontends.
- Soporte de plantilla Jinja (`--jinja`) en llama.cpp.
- No se documenta soporte explicito de tool calling, function calling, agentes o modo thinking en la informacion disponible.

## Casos de uso

- Companero de conversacion local y privado: el modelo esta disenado para charla diaria sin filtros corporativos, ejecutable en local con llama.cpp o LM Studio, lo que permite conversaciones privadas sin enviar datos a servicios externos.
- Brainstorming y generacion de ideas: su entrenamiento sobre Airoboros 3.2 lo hace adecuado para sesiones de lluvia de ideas, exploracion de enfoques creativos y generacion de alternativas sin las restricciones tipicas de modelos alineados de forma conservadora.
- Explicaciones divulgativas: puede reformular conceptos tecnicos en lenguaje sencillo y con ejemplos cotidianos, util para materiales educativos o documentacion introductoria.
- Escritura creativa y narrativa breve: adecuado para relatos cortos, dialogos y textos de ficcion donde se busca un tono natural y sin autocensura, aunque no esta especializado en roleplay de formato largo.
- Prototipado de asistentes conversacionales: al ser compatible con la API de OpenAI mediante llama-server, puede integrarse rapidamente en prototipos de chatbots y frontends como Open WebUI o SillyTavern antes de invertir en modelos mayores.
- Experimentacion con modelos abliterated: sirve como caso de estudio de ajuste fino QLoRA sobre una base sin rechazos, util para investigadores que quieran reproducir el pipeline (Unsloth + llama.cpp) en hardware de consumo.
- Despliegue en hardware modesto: con cuantizacion Q8_0 (~5,1 GB) cabe en GPUs de consumo de 8-12 GB, lo que permite entornos de pruebas locales sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con la cuantizacion Q8_0 (~5,1 GB de pesos mas overhead de contexto y KV cache); con contexto de 8192 la KV cache anade consumo adicional no cuantificado en la informacion disponible.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para Q8_0; el autor entreno en una AMD RX 6700 XT de 12 GB (ROCm), lo que confirma viabilidad en gama media.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB como RX 6700 XT, RTX 3060 Ti/4060 Ti de 8 GB (ajustando contexto) o superiores. No se dispone de datos para GPUs de datacenter como A100 o H100, aunque por tamano serian sobradamente suficientes.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli` para multimodal), LM Studio, KoboldCpp y cualquier frontend compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-E2B-Conversational-Uncensored (este) | 4.647.450.147 | Entrenado a 2048; recomendado 4096-8192 | Gemma Terms of Use | GGUF Q8_0 | Finetune conversacional sin rechazos sobre base abliterated |
| llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic | no disponible | no disponible | Gemma Terms of Use | no disponible | Modelo base directo de este finetune; abliteration sin ajuste conversacional adicional |
| google/gemma-4-E2B-it | no disponible | no disponible | Gemma Terms of Use | no disponible | Modelo original de Google, con alineacion estandar y rechazos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura por diseno: las salidas no estan filtradas; el usuario es responsable del contenido generado y del cumplimiento de la legislacion local.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa con aparente seguridad; no debe usarse para asesoramiento medico, legal o financiero.
- Idiomas: el tag del modelo indica solo ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto limitado en entrenamiento (2048 tokens): aunque se recomienda usar 4096-8192 en inferencia, el modelo no fue entrenado con esa longitud, lo que puede degradar la coherencia en conversaciones muy largas.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones especificas; debe revisarse antes de cualquier despliegue en produccion.
- Ajuste ligero: 1.000 pasos de QLoRA sobre una base abliterated; el autor advierte que no es un especialista en roleplay de formato largo.
- Datos de entrenamiento sinteticos y sin validacion: la perdida final baja (0,7-1,0) se atribuye a datos limpios, pero no hay evaluacion independiente publicada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minas2025/Gemma-4-E2B-Conversational-Uncensored
- Modelo base (abliteration): https://huggingface.co/llmfan46/gemma-4-E2B-it-ultra-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/jondurbin/airoboros-3.2
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (inferencia y conversion GGUF): https://github.com/ggml-org/llama.cpp
