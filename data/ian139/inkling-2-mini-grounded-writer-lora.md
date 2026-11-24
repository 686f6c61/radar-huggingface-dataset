# ian139/inkling-2-mini-grounded-writer-lora

## Resumen

Inkling-2-Mini Grounded Writer LoRA es un adaptador LoRA de atención desarrollado por el usuario ian139 sobre el modelo base `thinkingmachines/Inkling-2-Mini`, un transformer MoE de 26,4B parámetros totales y aproximadamente 5,4B activos. El adaptador, de solo 67 MB y 17,5M parámetros (0,066% del modelo base), está especializado en generación de texto fundamentada en fuentes: redacción de documentos largos, respuestas breves de preguntas y respuestas y salida JSON plana con formato `{id: answer}`, todo ello estrictamente a partir de material de referencia proporcionado, sin introducir afirmaciones no verificadas.

El problema que aborda es la fidelidad a la fuente en tareas de escritura aumentada por recuperación (RAG) y redacción asistida: el modelo base tiende a alucinar entidades, cifras y duraciones cuando redacta a partir de contexto. El adaptador se entrena con autodestilación sintética al 100% seguida de GRPO determinista sin juez LLM, y consigue mejoras medibles en benchmarks ciegos de escritura fundamentada frente a modelos locales y en la nube de tamaño comparable.

Es relevante ahora porque demuestra que un adaptador minúsculo sobre un MoE cuantizado puede igualar o superar a modelos en la nube en tareas de escritura fundamentada con latencias de 14-21 segundos por documento en hardware local, y porque introduce una técnica de fusión sin pérdida de cuantización (zero-PTQ) que preserva los expertos en NVFP4/MXFP8 intactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE (Inkling-2-Mini); solo se adaptan las proyecciones de auto-atención |
| Parámetros totales | 17,5M en el adaptador (0,066% del base); base de 26,4B totales |
| Parámetros activos | ~5,4B en el modelo base (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base con expertos enrutados en NVFP4/MXFP8; atención en BF16; adaptador en safetensors (BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); script de fusión a pesos nativos |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 que se aplica exclusivamente a las 120 proyecciones de auto-atención en BF16 del modelo base (24 capas × 5 proyecciones). Los expertos enrutados del MoE, que están almacenados en NVFP4/MXFP8, permanecen congelados, al igual que la torre de visión y el fichero `mtp.safetensors` de DSpark. Esta decisión de diseño permite que el script `merge_lora_to_native.py` fusione el adaptador en una copia de los pesos base en unos 5 segundos sin pérdida de re-cuantización posterior (zero-PTQ).

El entrenamiento se realizó en una única A100-80GB durante aproximadamente 6,5 horas. La primera fase fue autodestilación sintética al 100% usando únicamente Inkling-2-Mini como profesor, con trazas de verificación concisas supervisadas dentro de `message.reasoning_content` con `reasoning_effort="low"`. La segunda fase aplicó GRPO con recompensas deterministas basadas en expresiones regulares y comprobaciones de entidades: penalización de fugas de entidades solo presentes en el contexto, números, duraciones y años no atestiguados, marcadores de posición entre corchetes (-3,0) y meta-rechazos fuera de personaje (-3,0), con modelado de longitud, especificidad y capacidad de respuesta al prompt (KL ~0,009-0,014). Una ablación clave mostró que entrenar con `reasoning_effort="none"` y `reasoning_content` vacío desactivaba el canal de pensamiento (0% de tokens `<|content_thinking|>`) y disparaba la alucinación; supervisar trazas con `reasoning_effort="low"` mantuvo el canal activo en el 100% de los pasos de GRPO (60/60) y elevó las puntuaciones ciegas en +1,28.

## Capacidades

- Generación de texto fundamentada en fuentes: redacción de documentos largos a partir de material de referencia sin introducir afirmaciones no verificadas.
- Respuestas breves de preguntas y respuestas abiertas con fidelidad al contexto proporcionado.
- Salida JSON plana con formato `{id: answer}` para integración en pipelines estructurados.
- Canal de pensamiento (`<|content_thinking|>`) activo con `reasoning_effort="low"`, con trazas de verificación concisas.
- Verificación híbrida opcional: aproximadamente el 31% de los borradores activan una comprobación de fuentes ligera en un segundo paso.
- Capacidades multimodales heredadas del modelo base (torre de visión presente y preservada en la fusión), aunque no documentadas como objetivo del adaptador.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Redacción de documentación técnica a partir de especificaciones y notas internas: el adaptador genera documentos largos de varias secciones citando solo entidades, cifras y duraciones presentes en el material de referencia, lo que reduce el riesgo de introducir datos inventados en manuales y guías.
- Generación de respuestas de soporte fundamentadas en una base de conocimiento: dado un contexto recuperado, el modelo produce respuestas concisas en formato Q&A sin mezclar afirmaciones del prompt del usuario con hechos no verificados.
- Rellenado de cuestionarios y formularios estructurados: la salida JSON `{id: answer}` permite mapear respuestas a identificadores de preguntas en pipelines automatizados de evaluación o encuestas.
- Síntesis de informes a partir de múltiples fuentes: el modo de verificación híbrida (21 s por documento) activa una comprobación de fuentes en aproximadamente un tercio de los borradores, adecuado para informes donde la trazabilidad es crítica.
- Generación de contenido en local para entornos con requisitos de privacidad: al ejecutarse en Apple Silicon vía oMLX o en vLLM, los datos de referencia no salen de la infraestructura propia, con latencias de 14 s por documento en modo de un solo paso.
- Evaluación y anotación de datasets: la salida JSON plana y la fidelidad a la fuente permiten generar respuestas de referencia para conjuntos de evaluación de RAG sin contaminación por conocimiento paramétrico.
- Redacción asistida en herramientas de autoría: con temperatura 0,25-0,3 y `max_tokens` 3072, el modelo puede integrarse como servicio de generación de borradores que el usuario revisa, manteniendo la procedencia de cada afirmación.

## Benchmarks y rendimiento

Evaluación sobre un conjunto ciego de 39 elementos (20 documentos largos fundamentados y 19 preguntas abiertas), juzgado a ciegas por `claude-opus-5-5:medium`. Las puntuaciones del LoRA y de los modelos en la nube son medias de 3 ejecuciones (117 generaciones cada una).

| Modelo | Alojamiento | Largo (`/10`) | Inventado /20 | Q&A (`/10`) | Inventado /19 | Global (`/10`) |
|---|---|---:|---:|---:|---:|---:|
| Ternary-Bonsai-2-9B (2-bit) | Local | 2,85 | 17,0 | 3,89 | 6,0 | 3,36 |
| Qwen3.5-9B | Local | 3,10 | 18,0 | 4,42 | 7,0 | 3,74 |
| Ternary-Bonsai-2-27B | Local | 3,60 | 12,0 | 5,47 | 4,0 | 4,51 |
| Gemma-4-26B-QAT (4-bit) | Local | 4,26 | 3,16 | 4,67 | 1,0 | 4,46 |
| Inkling-2-Mini base (1 paso, `low`) | Local | 5,55 | 6,00 | 5,74 | 5,0 | 5,64 |
| google/gemini-4-hydrogen (`low`) | Nube | 5,80 | 0,67 | 6,44 | 1,67 | 6,12 |
| Inkling-2-Mini base (2 pasos, ~42 s/doc) | Local | 6,05 | 1,00 | 6,00 | 1,0 | 6,03 |
| Inkling-2-Mini + LoRA (1 paso, 14 s/doc) | Local | 6,08 | 2,33 | 6,04 | 1,33 | 6,06 |
| meta/muse-ember-1.0 | Nube | 6,17 | 3,00 | 7,07 | 0,00 | 6,61 |
| Inkling-2-Mini + LoRA (híbrido, 21 s/doc) | Local | 6,23 | 1,00 | 6,14 | 0,33 | 6,19 |

En documentos largos fundamentados, el modo híbrido obtuvo 29 victorias, 8 empates y 23 derrotas (61,7% victoria+empate) frente a `muse-ember-1.0`, superó a este en naturalidad (3,52 frente a 3,02) y especificidad (4,68 frente a 3,97), y no emitió marcadores de posición en 117 ejecuciones.

Ablaciones de entrenamiento:

| Ablación | Profesor / esfuerzo | Pensamiento activo | Largo (`/10`) | Inventado /20 | Q&A (`/10`) |
|---|---|---:|---:|---:|---:|
| Run 1 | Autodestilación (`none`) | 0% | 5,33 | 2,00 | 5,46 |
| Run 2 | 31B sin pensamiento (`none`) | 0% | 4,23 | 9,67 | 5,06 |
| Run 3 | Autodestilación (`low`) | 100% | 5,57 | 3,00 | 6,26 |
| Run 3B 1 paso (final) | +210 tareas difíciles (`low`) | 100% | 6,08 | 2,33 | 6,04 |
| Run 3B híbrido (final) | +31% verificación condicional | 100% | 6,23 | 1,00 | 6,14 |

## Requisitos de hardware

- Entrenamiento: una única A100-80GB durante aproximadamente 6,5 horas.
- Inferencia: el adaptador pesa 67 MB y se fusiona en el modelo base; los requisitos de VRAM vienen determinados por Inkling-2-Mini (26,4B totales, ~5,4B activos) con expertos en NVFP4/MXFP8 y atención en BF16. La VRAM exacta para inferencia no está disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; el modelo base está pensado para ejecutarse en Apple Silicon vía oMLX y en vLLM.
- GPU de consumo: no disponible en la información proporcionada.
- Despliegue: oMLX (Apple Silicon) o vLLM con `--reasoning-parser inkling`, `reasoning_effort: "low"`, temperatura 0,25-0,3 y `max_tokens` 3072; también es posible cargar el adaptador directamente con `transformers` y `peft` usando `AutoModelForMultimodalLM` y `PeftModel`.
- Latencia: 14 s por documento en modo de un solo paso; 21 s por documento en modo híbrido con verificación (aproximadamente el 31% de los borradores activan el segundo paso); el modelo base en dos pasos tarda unos 42 s por documento.
- Throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global (`/10`) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini + LoRA (híbrido) | 26,4B totales / ~5,4B activos + 17,5M adaptador | no disponible | 6,19 | apache-2.0 | Hugging Face, local |
| meta/muse-ember-1.0 | no disponible | no disponible | 6,61 | no disponible | Nube |
| google/gemini-4-hydrogen (`low`) | no disponible | no disponible | 6,12 | no disponible | Nube |
| Gemma-4-26B-QAT (4-bit) | 26B | no disponible | 4,46 | no disponible | Local |
| Ternary-Bonsai-2-27B | 27B | no disponible | 4,51 | no disponible | Local |

El adaptador iguala o supera a `gemini-4-hydrogen` y a `muse-ember-1.0` en documentos largos fundamentados (6,23 frente a 5,80 y 6,17) y logra la menor tasa de invención en el conjunto de preguntas abiertas (0,33 por 19) entre todos los modelos evaluados, incluidos los de nube.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- El adaptador está entrenado exclusivamente para escritura fundamentada en fuentes; su comportamiento en otras tareas (código, matemáticas, razonamiento general) no está documentado y puede degradarse respecto al modelo base.
- Riesgo de alucinación residual: en el modo de un solo paso se detectaron 2,33 invenciones por cada 20 documentos largos y 1,33 por cada 19 preguntas abiertas; el modo híbrido reduce estas cifras a 1,00 y 0,33 respectivamente, a costa de mayor latencia.
- El canal de pensamiento debe mantenerse activo con `reasoning_effort="low"`; entrenar o inferir con `reasoning_effort="none"` desactiva `<|content_thinking|>` y dispara la alucinación, según las ablaciones del autor.
- La fusión del adaptador requiere ejecutar `merge_lora_to_native.py`; no se documenta el uso del adaptador sin fusión en oMLX.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base `thinkingmachines/Inkling-2-Mini` puede tener sus propias condiciones que deben verificarse por separado.
- El adaptador solo modifica las proyecciones de atención; no se adaptan los expertos del MoE ni la torre de visión, por lo que las capacidades multimodales no se han especializado para la tarea de escritura fundamentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto reciente sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ian139/inkling-2-mini-grounded-writer-lora
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Script de fusión `merge_lora_to_native.py`: incluido en el repositorio del adaptador
- Imagen de benchmark: `./assets/benchmark-progression.png` en el repositorio
- Imagen de arquitectura zero-PTQ: `./assets/architecture-zero-ptq.png` en el repositorio
- Paper, blog o demo adicionales: no disponible en la información proporcionada
