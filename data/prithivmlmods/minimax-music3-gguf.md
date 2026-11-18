# prithivMLmods/MiniMax-Music3-GGUF

## Resumen

MiniMax-Music3 es un modelo de generación de música a partir de texto desarrollado por MiniMax AI, publicado con pesos abiertos y distribuido en formato GGUF por el usuario prithivMLmods. Genera canciones completas y estructuralmente coherentes de hasta cinco minutos en formato WAV estéreo de 32 kHz y 16 bits, condicionado por letras etiquetadas por secciones (por ejemplo `[Verse]` y `[Chorus]`) y por descripciones de estilo que cubren metadatos, voces y arreglos instrumentales.

La arquitectura es un sistema híbrido jerárquico denominado Hybrid-LM: combina un LLM global de 8B inicializado desde Qwen3, encargado de la estructura musical de largo alcance, con un LLM local de 0,6B que modela el detalle acústico a nivel de trama. En lugar de decodificar directamente desde tokens de cuantización vectorial residual (RVQ), el sistema fusiona los estados ocultos de ambos modelos y sintetiza el audio mediante un módulo de Flow Matching de 2,4B y un decodificador Flow-VAE. El total de parámetros asciende a 8.584.475.648.

Su relevancia actual reside en que ofrece generación musical de alta fidelidad con pesos abiertos y despliegue local: admite SGLang-Omni, `diffusers` de Hugging Face y ComfyUI, y con offloading por capas puede ejecutarse en GPU de 8 GB de VRAM. Esta versión GGUF añade además compatibilidad con `llama.cpp` mediante el binario `llama-tts`, lo que facilita la inferencia en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-LM jerarquica (LLM global 8B + LLM local 0,6B + Flow Matching 2,4B + Flow-VAE) |
| Parametros totales | 8.584.475.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | ingles (en) |
| Licencia | minimax-music3-community-license |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida jerárquica en la que dos modelos de lenguaje trabajan a escalas temporales distintas. El LLM global de 8B, inicializado desde Qwen3, modela la estructura musical de largo alcance (secciones, progresión armónica global, organización de la canción), mientras que el LLM local de 0,6B se ocupa del detalle acústico a nivel de trama. Los estados ocultos de ambos se fusionan y alimentan un módulo de Flow Matching de 2,4B que sintetiza el audio, el cual se decodifica finalmente mediante un Flow-VAE a WAV estéreo de 32 kHz y 16 bits. El condicionamiento se realiza sobre letras etiquetadas por secciones y descripciones de estilo detalladas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre el uso de RLHF o DPO en la información proporcionada. La innovación técnica destacable es la sustitución de la decodificación directa desde tokens RVQ por la fusión de estados ocultos de dos LLM y la síntesis mediante Flow Matching, lo que permite generar audio de alta fidelidad preservando coherencia estructural en piezas de hasta cinco minutos.

## Capacidades

- Generación de música a partir de texto: produce canciones completas de hasta cinco minutos en WAV estéreo de 32 kHz y 16 bits.
- Condicionamiento por letras etiquetadas por secciones (`[intro]`, `[verse]`, `[pre-chorus]`, `[chorus]`, `[bridge]`, `[final chorus]`, `[outro]`).
- Control de estilo mediante metadatos: género, BPM, estado de ánimo, tipo de voces y especificaciones de producción.
- Generación de voces con entrega melódica y armonías por capas, según la descripción de estilo.
- Soporte de audio multimodal mediante el proyector `mmproj-bf16`.
- Integración con `llama.cpp` a través del binario `llama-tts`.
- Compatibilidad con SGLang-Omni, `diffusers` de Hugging Face y ComfyUI.
- Capacidad de ejecución con offloading por capas en GPU de 8 GB de VRAM.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Producción musical asistida: un compositor introduce letras estructuradas por secciones y una descripción de estilo con BPM, instrumentación y tipo de voz para obtener una maqueta completa de hasta cinco minutos que sirva como referencia antes de la grabación real.
- Generación de bandas sonoras para vídeo: creación de temas originales ajustando género, estado de ánimo y tempo a las necesidades de un montaje, con salida estéreo de 32 kHz apta para postproducción.
- Prototipado rápido de jingles y cuñas publicitarias: la ventana de cinco minutos y el control fino de estilo permiten iterar variantes de una misma pieza cambiando únicamente los metadatos de la descripción.
- Contenido musical para creadores: generación local de canciones con voces e instrumentación para podcasts, streams o vídeos, ejecutable en GPU de consumo gracias a las cuantizaciones GGUF y al offloading por capas.
- Investigación en generación de audio: el formato GGUF y la integración con `llama.cpp` permiten experimentar con cuantizaciones de 3 a 8 bits y medir el impacto en calidad de audio sobre hardware modesto.
- Desarrollo de aplicaciones interactivas de música: integración vía `diffusers`, ComfyUI o SGLang-Omni en herramientas que generen piezas personalizadas a partir de la entrada del usuario, con control estructurado por secciones.
- Pruebas de concepto en entornos con VRAM limitada: el archivo Q3_K_M (4,37 GB) y el Q4_K_M (5,3 GB) permiten desplegar el modelo en equipos con 8 GB de VRAM aplicando offloading.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q3_K_M 4,37 GB, Q3_K_L 4,68 GB, Q4_K_S 5,08 GB, Q4_K_M 5,3 GB, Q5_K_S 6,02 GB, Q5_K_M 6,15 GB, Q6_K 7,05 GB, Q8_0 9,13 GB, BF16 17,2 GB. A estos hay que sumar el proyector multimodal `mmproj-bf16` de 6,64 GB.
- El autor indica que el modelo puede ejecutarse en GPU de 8 GB de VRAM mediante offloading por capas.
- GPU recomendadas: no disponible de forma explícita; por tamaño de pesos, una RTX 4090 (24 GB) permite BF16 completo, mientras que GPU de 8-12 GB requieren cuantizaciones Q3-Q5 y offloading.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3 a Q6 y offloading por capas; el BF16 completo requiere al menos 17,2 GB solo para los pesos del modelo.
- Opciones de despliegue: `llama.cpp` (binario `llama-tts` con backend CUDA), SGLang-Omni, `diffusers` de Hugging Face y ComfyUI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de salida | Licencia | Despliegue local |
|---|---|---|---|---|---|
| MiniMax-Music3 (esta ficha) | 8.584.475.648 | no disponible | WAV estéreo 32 kHz, 16 bits | minimax-music3-community-license | llama.cpp, SGLang-Omni, diffusers, ComfyUI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés como idioma, lo que limita la generación de letras y descripciones de estilo en castellano u otras lenguas.
- La licencia `minimax-music3-community-license` es de tipo "other" y no equivale a una licencia permisiva estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- No se documentan sesgos conocidos ni tasas de alucinación medibles; al tratarse de un modelo generativo de audio, puede producir letras ininteligibles, desajustes entre secciones o artefactos acústicos.
- La longitud de contexto no está especificada, por lo que el límite práctico de letras y descripciones de estilo que admite el condicionamiento no es verificable a partir de la información disponible.
- El tamaño total del repositorio es de 71,6 GB, lo que exige espacio en disco considerable si se descargan varias cuantizaciones.
- La cuantización reduce la calidad del audio generado; el autor califica Q3_K_M como de baja calidad y recomienda Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S y Q6_K para uso general.
- El proyector multimodal `mmproj-bf16` (6,64 GB) es necesario para las capacidades de audio y debe descargarse junto con los pesos.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no existe evidencia comunitaria de validación en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/MiniMax-Music3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Archivo BF16: https://huggingface.co/prithivMLmods/MiniMax-Music3-GGUF/blob/main/MiniMax-Music3.BF16.gguf
- Archivo Q4_K_M: https://huggingface.co/prithivMLmods/MiniMax-Music3-GGUF/blob/main/MiniMax-Music3.Q4_K_M.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/MiniMax-Music3-GGUF/blob/main/MiniMax-Music3.mmproj-bf16.gguf
