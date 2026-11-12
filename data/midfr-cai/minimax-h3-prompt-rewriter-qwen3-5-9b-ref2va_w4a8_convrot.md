# MidFR-CAI/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA_w4a8_convrot

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA_w4a8_convrot es una versión cuantizada del modelo lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA, publicada por el usuario MidFR-CAI. Se trata de un rewriter de prompts construido sobre una base Qwen3.5 de 9.000 millones de parámetros, según se deduce del nombre del repositorio, y orientado a reescribir y refinar instrucciones de texto. La cuantización aplicada es w4a8 (pesos de 4 bits y activaciones de 8 bits) con una variante denominada "convrot".

El propósito declarado del autor es su uso como codificador de texto (text encoder) dentro de ComfyUI, concretamente en el directorio `models/text_encoders`. Esto lo sitúa en flujos de generación de imagen o vídeo donde se necesita transformar prompts de usuario en descripciones enriquecidas antes de pasarlas al modelo generativo. El repositorio no incluye model card detallada más allá de una nota breve, y no se han publicado métricas de rendimiento ni especificaciones completas.

La relevancia de esta ficha es limitada por la escasez de información pública: cero descargas, cero likes, licencia no declarada y ausencia de benchmarks. Se documenta aquí lo que puede verificarse a partir de los metadatos y del nombre del modelo, marcando explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido del nombre "Qwen3.5-9B"; no confirmado en la model card) |
| Parámetros totales | 9B (según el nombre del repositorio; no confirmado en la model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | w4a8 (pesos 4 bits, activaciones 8 bits), variante "convrot" |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a la página del modelo base) |
| Formato de pesos | safetensors (archivo `MiniMax-H3-Prompt-Rewriter-9B-Ref2VA_w4a8_convrot.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO. El nombre del repositorio sugiere una base Qwen3.5 de 9B, pero la model card no lo confirma ni detalla la composición del dataset de ajuste para la tarea de reescritura de prompts.

La única innovación técnica documentada es el esquema de cuantización w4a8 con "convrot", que reduce el peso de los pesos a 4 bits y mantiene las activaciones en 8 bits. El autor no explica en qué consiste "convrot" ni aporta métricas de degradación respecto al modelo original. La finalidad declarada es la integración como text encoder en ComfyUI, lo que implica que el modelo se carga en un pipeline de difusión para transformar prompts antes de la generación.

## Capacidades

- Reescritura y refinamiento de prompts de texto, según el nombre y la función declarada del modelo.
- Uso como text encoder en ComfyUI dentro de flujos de generación de imagen o vídeo.
- Formato de pesos compatible con safetensors, pensado para cargarse en el directorio `models/text_encoders`.
- No consta soporte de tool calling, function calling ni capacidades de agente.
- No consta modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enriquecimiento de prompts en ComfyUI: el modelo se coloca en `models/text_encoders` y reescribe la instrucción del usuario antes de pasarla al modelo de difusión, mejorando la coherencia descriptiva del prompt final.
- Flujos de generación de vídeo con MiniMax-H3: al estar vinculado a la familia MiniMax-H3, encaja en pipelines de vídeo donde se necesita un rewriter que expanda la instrucción original.
- Prototipado de interfaces de prompting: permite experimentar con reescritura automática de instrucciones en entornos de investigación sin depender de APIs externas.
- Reducción de carga cognitiva del usuario: transforma prompts escuetos en descripciones detalladas de forma automática dentro de una aplicación local.
- Integración en nodos personalizados de ComfyUI: al ser un safetensors cuantizado, puede cargarse en nodos que esperen un text encoder compatible con el pipeline de MiniMax-H3.
- Despliegue en hardware con VRAM limitada: la cuantización w4a8 reduce el peso del modelo respecto a la versión en precisión completa, lo que facilita su uso en GPUs de consumo medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 9B en w4a8 requiere aproximadamente entre 5 y 7 GB solo para los pesos, más el overhead del runtime; el autor no confirma cifras.
- GPU recomendadas: no especificadas. Por tamaño, cabría esperar funcionamiento en GPUs consumer con 8-12 GB de VRAM, pero no hay confirmación.
- Compatibilidad con GPU consumer: probable por la cuantización w4a8, sin datos verificados.
- Opciones de despliegue: ComfyUI (uso declarado). No consta soporte oficial para vLLM, llama.cpp, Ollama o TGI, y la cuantización w4a8 personalizada puede no ser compatible con esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA_w4a8_convrot | 9B (según nombre) | no disponible | w4a8 | no disponible | Hugging Face, 0 descargas |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA (base) | 9B (según nombre) | no disponible | precisión original (no confirmada) | no disponible | Hugging Face |
| Otros rewriters de prompts de la familia MiniMax-H3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas para establecer una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Información pública mínima: cero descargas y cero likes en el momento de la consulta, sin model card detallada ni benchmarks.
- Licencia no declarada: el autor remite a la página del modelo base, por lo que el uso comercial queda sujeto a los términos de lightx2v, que no se detallan aquí.
- La cuantización w4a8 con "convrot" no está documentada técnicamente; se desconoce la degradación de calidad frente al modelo original.
- El formato cuantizado personalizado puede no ser compatible con runtimes estándar distintos de ComfyUI.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar su comportamiento en casos multilingües o de contexto largo.
- El uso previsto es específico (text encoder en ComfyUI); no debe asumirse como modelo de propósito general.
- No hay garantía de mantenimiento ni soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MidFR-CAI/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA_w4a8_convrot
- Modelo base: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA
- ComfyUI (entorno de uso declarado): https://github.com/comfyanonymous/ComfyUI
