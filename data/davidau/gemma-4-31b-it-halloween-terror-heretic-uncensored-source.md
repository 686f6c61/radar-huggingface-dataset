# DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source

## Resumen

Gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source es un ajuste fino (finetune) no censurado y orientado al entretenimiento de terror, creado por DavidAU a partir de su propio modelo DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking, que a su vez deriva de la familia Gemma 4 (versión instruct de 31B). El modelo incorpora un sistema de prompts denominado "Halloween O/S" con diez personajes de terror preconfigurados (Joker, Harley Quinn, Jason Voorhees, Freddy Krueger, Pennywise, Chucky, entre otros), además de la posibilidad de invocar cualquier persona o entidad ficticia definida por el usuario.

Técnicamente se trata de un modelo image-text-to-text de unos 31.273 millones de parámetros, distribuido en formato safetensors (62,6 GB de repositorio), con soporte de razonamiento ("thinking") y 13 modos de instrucción y 13 modos de razonamiento accesibles mediante comandos de invocación como `[summon:help]`. Su relevancia es principalmente de nicho: es un modelo de demostración y entretenimiento para Halloween, no una herramienta de producción, y su valor radica en mostrar técnicas de abliteración (eliminación de rechazos de seguridad), roleplay avanzado y escritura creativa sin filtros.

El autor recomienda un contexto mínimo de 64k tokens para conversaciones largas y publica también versiones cuantizadas en GGUF (repositorio NEO-GGUF) para su uso en llama.cpp u Ollama, incluyendo un archivo mmproj para capacidades de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), pipeline image-text-to-text |
| Parametros totales | 31.273.086.512 (dato real de safetensors) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible (el autor recomienda mínimo 64k tokens) |
| Tipos de cuantizacion | safetensors sin cuantizar (source); GGUF disponibles en repositorio aparte (q4ks no imatrix; se mencionan IQ3_S, imatrix y quants altos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (este repositorio); GGUF + mmproj en el repositorio NEO-GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 4 instruct de 31B parámetros, un transformer denso multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). Sobre esa base, DavidAU aplicó un ajuste fino sucesivo: primero sobre su variante "The DECKARD-HERETIC-UNCENSORED-Thinking" (que ya incorporaba abliteración y modos de razonamiento) y después con un dataset de terror ("Horror dataset") para construir el "Halloween O/S", un sistema de prompts embebido en el modelo que gestiona diez personajes ("constructs") con system prompts de entre 2000 y 4000 tokens cada uno, según la model card.

No se han publicado detalles sobre el número de tokens de entrenamiento, composición del dataset, hiperparámetros ni uso de técnicas como RLHF o DPO. Las innovaciones destacables que sí documenta el autor son: el sistema dual de modos (13 modos instruct y 13 modos de razonamiento), la invocación dinámica de personajes mediante comandos `[summon:...]`, la abliteración/heretic para eliminar rechazos del modelo base, y la generación de versiones GGUF con archivo mmproj para inferencia local con imágenes.

## Capacidades

- Generación de texto creativo y escritura de ficción de todos los géneros, con énfasis en terror y horror.
- Roleplay conversacional inmersivo con diez personajes de terror preconfigurados ("Evil Constructs": Joker, Harley Quinn, Borg Queen, Jason Voorhees, Freddy Krueger, Norman Bates, Pennywise, Vecna, Mind Flayer y Chucky).
- Invocación ("conjuro") de cualquier personaje o entidad arbitraria definida por el usuario, real, histórica o ficticia.
- Modo de razonamiento ("thinking") con cadena de pensamiento explícita antes de la respuesta.
- 13 modos instruct y 13 modos de razonamiento seleccionables mediante el menú interactivo accesible con `[summon:help]`.
- Comprensión de imágenes (image-text-to-text), mediante archivo mmproj en las versiones GGUF.
- Conversación multi-turno de larga duración (se recomienda contexto de 64k o superior).
- No soporta tool calling: la model card advierte expresamente NO activar herramientas ("DO NOT enable tools").

## Casos de uso

- Roleplay de terror interactivo: el usuario conversa uno a uno con personajes como Freddy Krueger o Pennywise; el "Halloween O/S" gestiona la transición entre personajes manteniendo coherencia de personalidad gracias a system prompts de 2000-4000 tokens por construct.
- Escritura de ficción de género horror: generación de relatos, diálogos y escenas de terror en primera persona, aprovechando el dataset de horror del ajuste fino y los modos creativos.
- Creación de villanos a medida: mediante el comando de conjuro, un escritor puede generar un antagonista coherente ("un monstruo hecho de mi propia culpa") para novelas, guiones o juegos de rol.
- Juegos de rol por texto (evil sims): simulación de escenarios oscuros con personajes que mantienen voz y "firma" propias a lo largo de sesiones largas.
- Generación de contenido temático para Halloween: diálogos, guiones de eventos, textos inmersivos para atracciones de terror o contenido para redes sociales.
- Pruebas y demostración de abliteración: como modelo de exhibición, sirve para estudiar cómo un finetune uncensored modifica el comportamiento de rechazo de un modelo base tipo Gemma.
- Experimentación con modos de razonamiento en roleplay: comparar respuestas en modo instruct frente a modo thinking para análisis de comportamiento de modelos afinados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos cualitativos de salida generada con la cuantización q4ks (no imatrix), señalando que quants superiores (imatrix o altos) producirán resultados más potentes.

## Requisitos de hardware

- VRAM estimada para el modelo completo en safetensors: aproximadamente 62-63 GB en FP16/BF16 (62,6 GB de repositorio), lo que exige al menos una GPU de 80 GB (A100/H100) o reparto entre varias GPUs.
- Con cuantizaciones GGUF del repositorio NEO-GGUF: una cuantización tipo q4 de 31B ocupa en torno a 18-20 GB, viable en una RTX 3090/4090 de 24 GB con contexto moderado; cuantizaciones IQ3_S aún menores, a costa de calidad (el propio autor muestra salidas generadas a IQ3_S).
- El autor recomienda cuantizaciones altas para mejor rendimiento y un contexto mínimo de 64k, lo que añade KV cache adicional a la VRAM necesaria.
- Consumer GPUs: viable en RTX 3090/4090 (24 GB) con quants de 3-4 bits; para contexto de 64k+ puede requerir descarga parcial en RAM (offload de capas) con llama.cpp.
- Opciones de despliegue: llama.cpp (formato GGUF con mmproj para visión), Ollama, LM Studio; el formato safetensors es compatible con transformers y endpoints_compatible (vLLM/TGI en principio, aunque no se documenta soporte específico).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-4-31B-it-Halloween-Terror-Heretic (este) | 31,27B | no disponible (min. 64k recomendado) | Apache 2.0 | Roleplay horror, uncensored, multimodal |
| DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking (base) | ~31B | no disponible | Apache 2.0 | Uncensored generalista con thinking |
| Gemma 3 27B it (Google, base original de la familia) | 27B | 128k | Gemma license (uso comercial restringido) | Generalista multimodal |

Respecto al modelo base DECKARD-HERETIC, esta versión añade el "Halloween O/S", los diez constructs y el dataset de horror, siendo más especializada en roleplay de terror. Frente a un Gemma 3 27B it estándar, ofrece ausencia de rechazos y modos de razonamiento adicionales, pero sin garantías de calidad general ni benchmarks publicados.

## Limitaciones y advertencias

- Modelo diseñado exclusivamente para entretenimiento ("for entertainment purposes only"); el autor advierte no creer nada de lo que digan el O/S ni los constructs y verificar cualquier salida seria.
- Contenido potencialmente perturbador: etiquetado "not-for-all-audiences", con temática de horror, violencia y personajes villanescos sin filtros de seguridad (ablit/heretic/uncensored).
- Riesgo elevado de alucinación: al ser un finetune de nicho con abliteración, no hay garantías de factualidad; el propio autor recomienda "double check everything".
- No debe usarse con herramientas: la model card prohíbe explícitamente activar tool calling, lo que limita su uso en agentes o pipelines.
- Solo inglés: no hay soporte documentado para castellano u otros idiomas.
- Contexto: no se especifica la ventana máxima nativa; el autor recomienda 64k como mínimo para conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado (personajes con copyright como Joker, Freddy Krueger, Pennywise, Chucky) puede plantear problemas de derechos de autor en uso comercial.
- La calidad de salida depende fuertemente de la cuantización: las versiones bajas (IQ3_S, q4ks no imatrix) degradan notablemente el rendimiento según el autor.
- Advertencia de seguridad general: al tratarse de un modelo abliterado sin guardrails, no es adecuado para entornos de producción ni para usuarios no expertos.

## Enlaces

- Modelo (source, safetensors): https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source
- Versiones GGUF (con mmproj para visión): https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
