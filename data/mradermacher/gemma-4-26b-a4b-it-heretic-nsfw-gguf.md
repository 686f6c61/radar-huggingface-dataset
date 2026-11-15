# mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-GGUF

## Resumen

`mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-GGUF` es una coleccion de cuantizaciones estaticas en formato GGUF del modelo `yukiworks/gemma-4-26B-A4B-it-heretic-NSFW`, un ajuste fino de la familia Gemma 4 con nomenclatura MoE (26B totales, 4B activos segun el nombre del checkpoint base). El trabajo de mradermacher se limita a la conversion y cuantizacion: no entrena ni modifica los pesos mas alla del proceso de quantize, tal como indica la model card (`static quants of https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW`).

El modelo base es un derivado "heretic" y "NSFW" de un checkpoint instruct de Gemma 4, lo que sugiere un proceso de ablacion de rechazos (uncensoring) orientado a reducir las negativas del modelo en conversaciones para adultos. El repositorio incluye 12 variantes de cuantizacion (desde Q2_K hasta F16, incluyendo IQ4_XS y Q4_K_S), lo que permite desplegarlo en un rango amplio de hardware, desde GPUs de consumo hasta servidores.

Es relevante ahora por dos motivos: primero, porque los GGUF de modelos MoE de ~26B con solo ~4B activos ofrecen un equilibrio interesante entre calidad y velocidad de inferencia en hardware modesto; segundo, porque el etiquetado `not-for-all-audiences` y la naturaleza del ajuste implican consideraciones de despliegue y cumplimiento que conviene evaluar antes de integrarlo en produccion. La fecha de creacion del repositorio (15 de noviembre de 2026) y el contador de descargas a cero indican que se trata de una publicacion muy reciente y sin validacion comunitaria todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del checkpoint base Gemma 4; nomenclatura A4B sugiere MoE con ~4B parametros activos) |
| Parametros totales | 25.233.142.046 (~25,2B, dato de safetensors del repo) |
| Parametros activos | no disponible con cifra exacta (el nombre del checkpoint sugiere ~4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas, `quantize_version: 2`, `output_tensor_quantised: 1`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al checkpoint base `yukiworks/gemma-4-26B-A4B-it-heretic-NSFW`, del que no se proporcionan detalles en la informacion disponible. El sufijo "A4B" en la nomenclatura de Gemma indica un diseno de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token sobre un total de ~25,2B, pero no se confirma en la documentacion facilitada ni se detalla el numero de expertos, el enrutador ni la ventana de contexto. El tag `conversational` sugiere un ajuste orientado a dialogo multi-turno.

Respecto al entrenamiento, no hay informacion sobre volumen de tokens, composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similares. El termino "heretic" en el nombre hace referencia a una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, orientada a eliminar comportamientos de negativa sin reentrenamiento completo; el sufijo "NSFW" indica que el ajuste esta pensado para contenido para adultos. El repositorio de mradermacher no aporta informacion adicional sobre el proceso: es exclusivamente un trabajo de cuantizacion estatica en formato GGUF, con `convert_type: hf` (conversion desde pesos Hugging Face) y sin modificaciones estructurales mas alla de la cuantizacion de tensores.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Conversacion sin restricciones tematicas orientada a contenido para adultos (ajuste "NSFW" y "heretic").
- Razonamiento y generacion de codigo: capacidades heredadas de la familia Gemma 4 instruct, no verificadas en este repositorio.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Modo thinking o vision: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva para adultos: el ajuste "heretic-NSFW" reduce las negativas del modelo base en contextos de ficcion adulta, lo que lo hace adecuado para plataformas de entretenimiento conversacional con moderacion propia.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M y Q4_K_S permiten ejecutar un modelo de ~25B con ~4B activos en GPUs de 16-24 GB de VRAM mediante llama.cpp u Ollama.
- Servicio de chat autoalojado con privacidad estricta: al ser GGUF y ejecutable en local, permite procesar conversaciones sensibles sin enviar datos a APIs de terceros.
- Prototipado de asistentes de personaje con personalidad: la naturaleza conversacional del checkpoint base y el ajuste de rechazos permiten definir personajes con limites tematicos mas flexibles.
- Investigacion sobre alineacion y ablacion de rechazos: util para estudiar como afecta la eliminacion de direcciones de rechazo a la calidad general, la coherencia y la seguridad del modelo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes (Q2_K a F16), lo que permite medir la degradacion de calidad frente al ahorro de VRAM en un modelo MoE de este tamano.
- Generacion de ficcion y guiones: con contexto suficiente (no confirmado), podria emplearse para redactar escenas largas y coherentes con un tono adulto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del repo de 28 GB y las cuantizaciones listadas):
  - F16: ~50 GB (no incluido en el repo, pero referenciado como variante).
  - Q8_0: ~27 GB.
  - Q6_K: ~21 GB.
  - Q5_K_M: ~18 GB.
  - Q4_K_M: ~15-16 GB.
  - Q4_K_S / IQ4_XS: ~14-15 GB.
  - Q3_K_M: ~12 GB.
  - Q2_K: ~9-10 GB.
- GPU recomendadas: A100 40/80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) para Q6_K y Q5_K_M; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q4_K_S; RTX 4060 Ti 16 GB o GPUs de 12 GB para Q3_K_M y Q2_K.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q3; las variantes Q2_K permiten incluso configuraciones con 8-10 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo sugiere). vLLM y TGI no soportan GGUF de forma nativa para este tipo de checkpoint sin conversion previa.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con ~4B activos, el throughput deberia ser notablemente superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-GGUF | ~25,2B totales, ~4B activos (segun nombre) | no disponible | no disponible | GGUF | Cuantizaciones de un ajuste NSFW/heretic; sin benchmarks |
| yukiworks/gemma-4-26B-A4B-it-heretic-NSFW | ~25,2B totales | no disponible | no disponible | safetensors (presumiblemente) | Checkpoint base del que derivan estos GGUF |
| Gemma 4 26B-A4B-it (original de Google) | ~25,2B totales, ~4B activos | no disponible | Gemma Terms of Use | safetensors, GGUF | Modelo instruct oficial, con filtros de seguridad intactos |
| Mistral Small 3 / 24B instruct | ~24B densos | 32k-128k segun version | Apache 2.0 | safetensors, GGUF | Alternativa densa con licencia permisiva |

La comparacion con alternativas densas de ~24B es pertinente porque comparten rango de VRAM en cuantizaciones Q4, aunque el MoE con 4B activos del checkpoint Gemma 4 ofrece, en teoria, mayor velocidad de decodificacion a igualdad de memoria.

## Limitaciones y advertencias

- El modelo esta explicitamente etiquetado como `not-for-all-audiences`: no es apto para entornos laborales, educativos ni productos dirigidos a menores.
- El ajuste "heretic" elimina o atenua los rechazos del modelo base, lo que incrementa el riesgo de generar contenido danino, ofensivo o inexacto en temas sensibles.
- Riesgo elevado de alucinacion en dominios facticos: los ajustes de ablacion de rechazos suelen degradar la calibracion y la disposicion del modelo a admitir incertidumbre.
- La licencia no esta disponible en la informacion facilitada; no se puede confirmar si el uso comercial esta permitido. El modelo base Gemma suele estar sujeto a los Gemma Terms of Use, que imponen restricciones de uso y obligaciones de atribucion.
- No hay informacion sobre idiomas soportados; el rendimiento fuera del ingles (y posiblemente otros idiomas mayoritarios) es desconocido.
- La longitud de contexto no esta confirmada; asumir la del checkpoint base sin verificacion puede provocar truncamientos inesperados en produccion.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta: no hay validacion de la comunidad ni evidencia de calidad mas alla de la del checkpoint base.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad en modelos de este tamano; para uso en produccion se recomienda Q4_K_M o superior.
- El tag `endpoints_compatible` no garantiza compatibilidad con todos los servidores de inferencia; conviene verificar con llama.cpp u Ollama antes de integrar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-NSFW-GGUF
- Checkpoint base: https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Familia Gemma (Google): https://huggingface.co/google
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
