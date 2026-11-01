# mydubber-org/translategemma-4b-text-GGUF

## Resumen

TranslateGemma 4B text-only GGUF es una conversión comunitaria del modelo `google/translategemma-4b-it` de Google, publicada por `mydubber-org` para su uso en Ollama y llama.cpp. La modificación principal consiste en la eliminación del codificador de visión y su proyector multimodal, conservando únicamente el modelo de lenguaje como `Gemma3ForCausalLM` con los tensores sin alterar, y cuantizando los pesos a 4 bits con `Q4_K_M` e imatrix. El resultado es un modelo de 3.880.263.168 parámetros (aproximadamente 3,9 mil millones) orientado exclusivamente a traducción de texto.

El modelo está pensado para el backend local de traducción del proyecto myDubber, un pipeline de doblaje que necesita traducir transcripciones entre idiomas sin depender de servicios en la nube. Al ser una variante text-only de un modelo multimodal, sacrifica cualquier capacidad de procesamiento de imagen a cambio de un tamaño menor y un despliegue más sencillo en hardware de consumo.

La relevancia actual radica en que ofrece una alternativa local y cuantizada de un modelo de traducción de Google bajo licencia Gemma, con un repositorio de 5,0 GB y compatibilidad con el ecosistema Ollama. No obstante, se trata de una conversión de terceros, no de un modelo oficial, y su plantilla de chat ha sido sustituida por la de Gemma 3 estándar, lo que puede afectar al comportamiento respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), sin codificador de visión; clase `Gemma3ForCausalLM` |
| Parametros totales | 3.880.263.168 (aproximadamente 3,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M con imatrix (unica cuantizacion publicada en el repo) |
| Idiomas soportados | no disponible de forma explicita; el modelo base es de traduccion multilingue y la calibracion usa ingles y los idiomas destino del pipeline de doblaje |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | GGUF (`translategemma-4b-text.gguf`), convertido desde bf16 con llama.cpp `b11553` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Gemma 3 en su variante de 4B, un transformer decoder-only. En esta conversión concreta se ha eliminado el codificador de visión y su proyector, de modo que solo se conserva el modelo de lenguaje, guardado como `Gemma3ForCausalLM` con los tensores idénticos a los del modelo original. No se ha realizado un reentrenamiento: la conversión es puramente estructural y de cuantización. La plantilla de chat utilizada es la nativa de Gemma 3 (el mensaje de sistema se inserta en el primer turno de usuario), en lugar de la plantilla estructurada específica de TranslateGemma.

El proceso de cuantización se realizó con llama.cpp en la versión `b11553`: conversión a GGUF en bf16 mediante `convert_hf_to_gguf.py`, generación de una matriz de importancia con `llama-imatrix` y cuantización final `Q4_K_M --imatrix`. La calibración empleó 512 prompts en el formato de traductor de dubber, construidos a partir del dataset `google/wmt24pp` (Apache-2.0), con dirección inglés hacia y desde los idiomas destino de las voces del pipeline. El script de construcción está publicado en el repositorio `vladbehash/dubber`. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre si se aplicaron técnicas de RLHF o DPO en su desarrollo original.

## Capacidades

- Traducción de texto entre idiomas, orientada al pipeline de doblaje de myDubber (inglés hacia y desde los idiomas destino de las voces).
- Generación de texto conversacional en formato chat, con la plantilla nativa de Gemma 3.
- Procesamiento exclusivamente de texto: la capacidad de visión ha sido eliminada en esta conversión.
- Compatibilidad con Ollama mediante `ollama create` y con llama.cpp por el formato GGUF.
- Soporte de endpoints compatibles (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingües heredadas del modelo base de traducción de Google, aunque los idiomas exactos no se detallan en la información disponible.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Traducción de subtítulos y transcripciones en pipelines de doblaje: el modelo se integra en el backend local de myDubber para traducir el texto transcrito entre inglés y los idiomas de destino de cada voz, evitando enviar contenido a APIs externas.
- Traducción local con privacidad: al ejecutarse en Ollama o llama.cpp sobre hardware propio, permite traducir documentos sensibles sin que el texto salga de la infraestructura del usuario.
- Prototipado de sistemas de traducción sin conexión: su tamaño de 3,9 B y cuantización Q4_K_M permiten desplegarlo en estaciones de trabajo para experimentar con traducción automática sin depender de la nube.
- Preprocesado multilingüe en pipelines de datos: traducción de corpus al inglés (o desde él) antes de tareas posteriores de análisis, clasificación o indexación.
- Asistente de traducción en editores o herramientas internas: gracias a su formato chat compatible con endpoints, puede conectarse a interfaces que consuman una API local de generación de texto.
- Generación de borradores de traducción para revisión humana: útil en flujos de localización donde un traductor profesional pule la salida del modelo antes de publicar.
- Integración en aplicaciones de escritorio con llama.cpp: al ser un único archivo GGUF de aproximadamente 5 GB de repositorio, puede empaquetarse en aplicaciones de escritorio que necesiten traducción sin backend remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M de un modelo de 3,9 B, se estima en torno a 3-4 GB de VRAM, aunque el dato exacto no está publicado en la información disponible.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, el modelo es apto para GPUs de consumo con al menos 6-8 GB de VRAM.
- Cabe en GPUs de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y equivalentes con suficiente VRAM; también puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama (`ollama create translategemma-4b-text -f Modelfile`) y llama.cpp (formato GGUF, construido con `llama.cpp b11553`). No se documenta soporte para vLLM ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mydubber-org/translategemma-4b-text-GGUF | 3,9 B | no disponible | No (eliminada) | Gemma Terms of Use | GGUF Q4_K_M | Conversion comunitaria text-only para Ollama/llama.cpp |
| google/translategemma-4b-it | no disponible | no disponible | Si (modelo original multimodal) | Gemma Terms of Use | safetensors (original) | Modelo base oficial de Google con vision y plantilla de chat estructurada |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es una versión modificada de Gemma: se han eliminado el codificador de visión y su proyector, y los pesos están cuantizados a 4 bits. No es el modelo oficial de Google.
- La plantilla de chat ha sido sustituida por la nativa de Gemma 3, lo que puede alterar el comportamiento respecto a la plantilla estructurada de TranslateGemma y afectar a la calidad de traducción en algunos formatos de prompt.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en bf16; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en segmentos ambiguos o con terminología especializada.
- Los idiomas soportados no se detallan explícitamente; la calibración se centró en inglés y los idiomas destino del pipeline de dubber, por lo que el rendimiento en otros pares de idiomas es incierto.
- Uso comercial sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que deben transmitirse a cualquier destinatario de una redistribución.
- Al ser una conversión de terceros con 415 descargas y 0 likes en el momento de la consulta, carece de validación comunitaria amplia.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mydubber-org/translategemma-4b-text-GGUF
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- Script de construcción: https://github.com/vladbehash/dubber/blob/main/libs/dub-pipeline/scripts/build_translategemma.py
- Dataset de calibración: https://huggingface.co/datasets/google/wmt24pp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
