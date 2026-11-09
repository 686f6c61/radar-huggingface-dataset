# ProCreations/nib-4b-preview-EXL3

## Resumen

Nib 4B (preview) es un modelo de lenguaje y visión de 4.000 millones de parámetros desarrollado por ProCreations, obtenido mediante post-entrenamiento de Qwen3.5-4B para actuar como agente de navegador (browser agent) y de uso de ordenador (computer use). El modelo está afinado para operar dentro de distintos arneses de agente (harnesses), ejecutar llamadas a herramientas y encadenar razonamiento multi-paso con contexto de hasta 32.768 tokens.

La ficha que nos ocupa no describe el modelo original, sino una familia de cuantizaciones EXL3 del mismo, publicadas para exllamav3 y TabbyAPI. Cada tasa de bits se distribuye en su propia rama del repositorio (de 3,05 a 6,05 bpw, entre 3,6 y 4,9 GB), con el codificador de visión, los embeddings, las normas, las compuertas Gated DeltaNet y los pesos MTP conservados en BF16 byte a byte. La relevancia actual reside en que permite ejecutar un agente multimodal de 4B con contexto de 32k en hardware de consumo, con una fidelidad frente a BF16 medida y documentada.

La licencia es Apache 2.0, heredada del modelo base Qwen3.5-4B, y el idioma declarado es únicamente inglés. Se trata de una versión preview, por lo que el autor remite a la model card principal para benchmarks, detalles de entrenamiento y limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de Qwen3.5-4B, con capas Gated DeltaNet y pesos MTP (multi-token prediction); no se detalla la proporción exacta en la información disponible |
| Parámetros totales | 4.000 millones (modelo base Qwen3.5-4B); parámetros del checkpoint EXL3 no disponibles |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (max_seq_len y cache_size recomendados en la configuración de TabbyAPI) |
| Tipos de cuantización | EXL3 en 3,05, 3,55, 4,05, 4,55, 5,05 y 6,05 bpw; solo se cuantizan las proyecciones lineales principales |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors EXL3 (exllamav3) más `nib-protected.safetensors` con los tensores en BF16 |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer con capas Gated DeltaNet (atención lineal con compuertas y parámetros de decaimiento), pesos de multi-token prediction y un codificador de visión para entrada image-text-to-text. ProCreations lo post-entrena como agente de navegador sobre episodios de agente pertenecientes a arneses comunes; la model card de esta cuantización no detalla el volumen de tokens, la composición del dataset ni si se emplearon RLHF o DPO, y remite a la model card principal para ello.

La innovación técnica de esta publicación es el proceso de cuantización: el conversor de exllamav3 1.6 se aplicó sobre episodios de agente del propio dominio (in-domain), y la fidelidad se midió contra el modelo BF16 sobre 5.070 tokens de asistente reservados, procedentes de 48 episodios completos de hasta 32k tokens y diez arneses distintos, ninguno usado para calibración. El resultado es una curva de degradación explícita: 3,05 bpw alcanza un KL medio de 0,0257 y un 96,3 % de acuerdo top-1, mientras que 6,05 bpw baja a 0,0007 de KL y un 99,3 % de acuerdo. Además, se preservan sin cuantizar el codificador de visión, los embeddings y la cabeza de salida atada, las normas, las compuertas Gated DeltaNet, las convoluciones, los parámetros de decaimiento y los pesos MTP.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable: `enable_thinking: false` lo desactiva; `enable_thinking: true` admite `reasoning_effort` en `low`, `medium` o `xhigh` (valor por defecto).
- Control de navegador y de ordenador: entrenado explícitamente para arneses de browser-use y computer-use.
- Tool calling y function calling: el autor verificó una llamada a herramienta parseada a través de la API compatible con OpenAI de TabbyAPI, con la plantilla de chat incluida.
- Razonamiento multi-paso y comportamiento de agente sobre episodios de hasta 32k tokens.
- Entrada multimodal image-text-to-text: los pesos de visión están incluidos en el checkpoint, aunque la entrada de imágenes a través de exllamav3 no fue probada por el autor.
- Multilingüismo: limitado al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de audio ni de generación de código o matemáticas específicas en la información disponible.

## Casos de uso

- Automatización de navegación web: el modelo ejecuta tareas de browser-use dentro de arneses de agente, con contexto de 32.768 tokens suficiente para mantener el historial de una sesión completa de navegación con decenas de pasos intermedios.
- Agente de escritorio con computer use: al estar post-entrenado sobre episodios de control de interfaz, puede integrarse en pipelines que traducen instrucciones en lenguaje natural a acciones sobre la UI mediante llamadas a herramientas.
- Servicio de agente autoalojado en hardware de consumo: con la rama de 4,05 bpw (4,0 GB) puede servirse en una GPU de gama media mediante TabbyAPI y exllamav3, manteniendo 32k de contexto en caché.
- Extracción de datos estructurados desde páginas web: combinando tool calling con razonamiento de esfuerzo bajo para reducir latencia en tareas repetitivas de scraping guiado.
- Orquestación multi-paso con verificación intermedia: el modo de pensamiento con `reasoning_effort` ajustable permite subir a `xhigh` en tareas críticas y bajarlo a `low` en pasos mecánicos dentro del mismo flujo.
- Prototipado de agentes multimodales: los pesos de visión están presentes en el checkpoint, de modo que un equipo puede validar el pipeline de imagen a texto antes de confirmar el soporte completo en exllamav3.
- Evaluación de cuantizaciones en producción: las distintas ramas bpw permiten comparar latencia y calidad en el mismo entorno de serving sin cambiar de modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas en la información disponible. El autor indica explícitamente que estas cuantizaciones no se ejecutaron sobre el benchmark de tareas de navegador, y que fueron las builds FP8 y NVFP4 las que se compararon con BF16, coincidiendo dentro del ruido. La única métrica publicada es la fidelidad de cuantización frente a BF16:

| Rama | Tamaño | KL medio vs BF16 | Acuerdo top-1 |
|---|---:|---:|---:|
| 3.05bpw | 3,6 GB | 0,0257 | 96,3 % |
| 3.55bpw | 3,8 GB | 0,0124 | 97,2 % |
| 4.05bpw | 4,0 GB | 0,0067 | 98,0 % |
| 4.55bpw | 4,2 GB | 0,0046 | 98,5 % |
| 5.05bpw | 4,5 GB | 0,0021 | 99,0 % |
| 6.05bpw | 4,9 GB | 0,0007 | 99,3 % |

Las evaluaciones del modelo se realizaron con temperatura 1,0 y top_p 0,95.

## Requisitos de hardware

- VRAM estimada: entre 3,6 y 4,9 GB solo para los pesos, según la rama bpw elegida; hay que sumar la caché KV para 32.768 tokens, cuyo tamaño exacto no se detalla en la información disponible.
- El repositorio completo ocupa 13,9 GB porque contiene todas las ramas; conviene descargar una sola revisión con `--revision`.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con 8 GB o más de VRAM debería alojar las ramas de 3,05 a 4,55 bpw con contexto moderado; las ramas de 5,05 y 6,05 bpw dejan menos margen para la caché.
- Despliegue: exllamav3 1.6 con TabbyAPI es la combinación probada por el autor (backend `exllamav3`, `max_seq_len: 32768`, `cache_size: 32768`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato EXL3 es específico de exllamav3.
- Latencia y throughput: no disponibles.
- Configuración de referencia del autor: `reasoning: true` y `vision: false`, dado que la entrada de imágenes no se validó en exllamav3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Nib 4B preview EXL3 (esta ficha) | 4B | 32.768 | Agente de navegador y computer use | Apache 2.0 | EXL3 |
| Nib 4B preview (BF16) | 4B | 32.768 | Agente de navegador y computer use | Apache 2.0 | safetensors |
| Qwen3.5-4B | 4B | no disponible | Modelo generalista multimodal | Apache 2.0 | safetensors |

La comparación con alternativas de otros autores no está disponible en la información proporcionada. El contraste más directo es interno: frente al Nib 4B en BF16, esta familia EXL3 reduce el peso de 3,6 a 4,9 GB según la rama, con un acuerdo top-1 de entre el 96,3 % y el 99,3 %.

## Limitaciones y advertencias

- El autor advierte que el modelo a menudo reporta éxito en tareas que no ha completado; cualquier sistema en producción debe verificar el resultado real y no fiarse del mensaje de finalización.
- Es una versión preview, con posibles cambios en el modelo base y en las cuantizaciones.
- Solo se declara soporte de inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- La entrada de imágenes no se probó a través de exllamav3, pese a que los pesos de visión están incluidos; la configuración recomendada desactiva `vision`.
- Las cuantizaciones no se evaluaron sobre el benchmark de tareas de navegador, por lo que el impacto real de la cuantización en el éxito de las tareas es desconocido.
- Solo se cuantizan las proyecciones lineales principales; el resto de tensores se mantiene en BF16, lo que limita cuánto se puede reducir el tamaño total.
- El formato EXL3 obliga a usar exllamav3 o TabbyAPI; no hay ruta de despliegue documentada en otros motores de inferencia.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un derivado de Qwen3.5-4B, hereda los del modelo base, que no se detallan aquí.
- Licencia Apache 2.0 permite uso comercial, con las obligaciones habituales de atribución y conservación del aviso de licencia.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/ProCreations/nib-4b-preview-EXL3
- Rama 3.05bpw: https://huggingface.co/ProCreations/nib-4b-preview-EXL3/tree/3.05bpw
- Rama 3.55bpw: https://huggingface.co/ProCreations/nib-4b-preview-EXL3/tree/3.55bpw
- Rama 4.05bpw: https://huggingface.co/ProCreations/nib-4b-preview-EXL3/tree/4.05bpw
- Rama 4.55bpw: https://huggingface.co/ProCreations/nib-4b-preview-EXL3/tree/4.55bpw
- Rama 5.05bpw: https://huggingface.co/ProCreations/nib-4b-preview-EXL3/tree/5.05bpw
- Rama 6.05bpw: https://huggingface.co/ProCreations/nib-4b-preview-EXL3/tree/6.05bpw
- Modelo base Nib 4B preview: https://huggingface.co/ProCreations/nib-4b-preview
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- exllamav3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- Perfil del autor en Hugging Face: https://huggingface.co/ProCreations
