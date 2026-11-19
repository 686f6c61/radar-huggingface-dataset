# shiva123782/ShivaAI

## Resumen

ShivaAI es un ajuste fino mediante LoRA/QLoRA (PEFT) del modelo base Qwen/Qwen2.5-0.5B-Instruct de Alibaba Cloud, publicado en Hugging Face por el autor identificado como shiva123782 (Ram123). No se trata de un modelo entrenado desde cero, sino de un adaptador de bajo rango que modifica el comportamiento del modelo base de 0,5 mil millones de parámetros para tareas de generación de texto instruccional. El problema que aborda es acotado: proporcionar una identidad de marca propia ("ShivaAI", atribuida a Ram123) y un ajuste de estilo sobre instrucciones, algo que el autor declara como objetivo de entrenamiento y no como garantía.

El modelo se distribuye como adaptador PEFT que requiere cargar primero Qwen2.5-0.5B-Instruct y después superponer los pesos LoRA. También se documenta la posibilidad de fusionar el adaptador en un modelo monolítico de aproximadamente 1 GB para servir con vLLM, Ollama o llama.cpp sin dependencia del runtime de PEFT. La relevancia práctica es limitada: es un experimento de ajuste fino de un SLM (small language model) con licencia Apache-2.0, orientado solo a inglés y con cero descargas en el momento de la consulta.

Al estar construido sobre Qwen2.5-0.5B-Instruct, hereda la arquitectura transformer decoder-only del base, con una ventana de contexto de 32 768 tokens (dato del modelo base, no verificado en la model card de este adaptador). El dataset de ajuste declarado es yahma/alpaca-cleaned, un corpus de instrucciones en inglés de uso común para fine-tuning supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct), ajuste fino con LoRA/QLoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); tamaño del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base Qwen2.5-0.5B-Instruct; no confirmado en la model card del adaptador |
| Tipos de cuantizacion | No especificados en la model card; el base admite cuantizacion (GGUF, AWQ, GPTQ) por herramientas externas, pero no se documenta para este adaptador |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (licencia del base: Apache-2.0) |
| Formato de pesos | Adaptador PEFT (LoRA); fusionable a safetensors monolítico (~1 GB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA/QLoRA sobre Qwen2.5-0.5B-Instruct. El base es un transformer decoder-only con atención causal estándar, 0,5 mil millones de parámetros y 32 768 tokens de contexto, entrenado originalmente por Alibaba Cloud con datos multilingües y alineamiento por instrucciones. Sobre esa base, el autor aplica un ajuste fino supervisado con el dataset yahma/alpaca-cleaned, un conjunto de instrucciones en inglés derivado de Alpaca. No se documentan hiperparámetros de entrenamiento, rango del LoRA, número de pasos, tokens vistos ni si hubo etapas de RLHF o DPO adicionales.

La innovación técnica declarada es mínima: el autor menciona "Kaveri AI Autonomous Studio" y "SMT Assurance" como marco de construcción, sin detallar metodología verificable. El flujo de uso documentado incluye la fusión del adaptador (`merge_and_unload`) para generar un checkpoint monolítico servible. No se reportan técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades

- Generación de texto instruccional en inglés, heredada del base Qwen2.5-0.5B-Instruct.
- Respuesta a preguntas de identidad: el modelo declara ser "ShivaAI", creado por "Ram123" (objetivo de entrenamiento, no garantía).
- Seguimiento de instrucciones simples y conversación de un solo turno o pocos turnos, limitado por el tamaño del base (0,5B).
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según el campo `language`.
- Capacidad de razonamiento y matemáticas no evaluada ni documentada.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un adaptador de 0,5B parámetros, se puede cargar en una GPU consumer o incluso en CPU para validar flujos de diálogo antes de invertir en modelos mayores.
- Experimentación educativa con PEFT y LoRA: sirve como ejemplo reproducible de cómo ajustar un SLM con alpaca-cleaned y cómo fusionar el adaptador para despliegue.
- Pruebas de identidad de marca en chatbots: el ajuste fuerza una identidad concreta ("ShivaAI" / "Ram123"), útil para demostrar personalización de personaje o marca en demos.
- Despliegue en entornos con recursos muy limitados: el modelo fusionado ocupa ~1 GB, por lo que puede servirse con llama.cpp u Ollama en hardware modesto para tareas de generación corta.
- Generación de texto auxiliar de bajo coste: resúmenes breves, reformulación de frases o respuestas a preguntas simples en inglés donde no se requiera alta precisión.
- Base para fine-tuning ulterior: al ser un adaptador pequeño sobre un base Apache-2.0, puede servir como punto de partida para ajustes específicos de dominio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 0,5B en fp16 requiere aproximadamente 1 GB de pesos; con el adaptador LoRA añadido, el consumo es marginalmente superior (tamaño exacto del adaptador no disponible).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas e incluso en CPU.
- Opciones de despliegue: transformers + PEFT (adaptador), o modelo fusionado con `merge_and_unload` para vLLM, Ollama, llama.cpp o TGI.
- Latencia y throughput estimados: no disponibles; por el tamaño del base se espera baja latencia en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ShivaAI | 0,5B (adaptador LoRA) | 32 768 (heredado del base, no confirmado) | Apache-2.0 | Hugging Face, 0 descargas | Ajuste de identidad sobre Qwen2.5-0.5B-Instruct; solo inglés |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 | Apache-2.0 | Hugging Face, ampliamente usado | Modelo base original de Alibaba Cloud; multilingüe |
| SmolLM2-360M-Instruct | 360M | 8 192 (aprox., según variante) | Apache-2.0 | Hugging Face | Alternativa SLM de Hugging Face; datos no verificados aquí |
| TinyLlama-1.1B-Chat | 1,1B | 2 048 | Apache-2.0 | Hugging Face | SLM algo mayor; contexto más corto |

Los datos de los modelos alternativos se incluyen como referencia de categoría y no proceden de la información proporcionada sobre ShivaAI; conviene verificarlos en sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre yahma/alpaca-cleaned, hereda los sesgos de ese corpus y los del base Qwen2.5-0.5B-Instruct; no se documenta ninguna mitigación.
- Riesgo de alucinación: alto en un modelo de 0,5B parámetros; no se reportan evaluaciones de fidelidad ni de tasas de alucinación.
- Limitaciones de contexto e idioma: solo inglés declarado; el contexto de 32 768 tokens es el del base y no se confirma que el ajuste LoRA lo preserve.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor recomienda confirmar los términos del modelo base antes de uso comercial.
- Caveat de producción: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- La identidad "ShivaAI"/"Ram123" es un objetivo de entrenamiento declarado, no una garantía; puede fallar o ser inconsistente.
- No se documentan hiperparámetros de entrenamiento ni evaluación, lo que dificulta reproducir o auditar el ajuste.
- El modelo está pensado como demostración; no se recomienda para tareas que requieran razonamiento complejo, matemáticas o código en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/ShivaAI
- Visor de arquitectura: https://hfviewer.com/shiva123782/ShivaAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
