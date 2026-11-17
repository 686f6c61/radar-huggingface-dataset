# marcosmaceo/orb-planner

## Resumen

ORB planner es un transformer decoder-only de 5,10 millones de parámetros desarrollado por marcosmaceo que convierte una descripción textual breve (una caption estructurada o, desde la versión v8, lenguaje natural como "rain on a tin roof with distant thunder") en una **Spec**: una representación JSON tipada y compacta que describe un efecto de sonido. El modelo no sintetiza audio directamente; su salida es compilada por un renderizador DSP determinista incluido en el repositorio ORB, que produce un WAV a 48 kHz.

El modelo resuelve un problema concreto dentro de pipelines de diseño sonoro procedural: separar la interpretación semántica del prompt (tarea del planner) de la síntesis de señal (tarea del renderizador). Al emitir JSON plano, la Spec resultante es legible, diffeable y editable por agentes o por humanos, lo que lo hace adecuado para flujos automatizados de generación de efectos de sonido.

Es relevante por su enfoque "from scratch" con datos exclusivamente sintéticos: 300.000 pares generados proceduralmente, sin pesos preentrenados, sin audio externo y sin anotación humana. Con 1024 tokens de contexto y un vocabulario de 395 símbolos, el modelo está optimizado para una gramática cerrada y una decodificación restringida por máscara, lo que garantiza que toda salida sea una Spec válida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 5.096.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (planner.safetensors + config.json) |

Otros datos técnicos: vocabulario de 395 tokens (byte-level más símbolos estructurales; 47 roles, 13 texturas y el token `NOBED`), pipeline `text-to-audio`, librería PyTorch, tamaño del repositorio 0.0 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 5,10 M de parámetros con 1024 tokens de contexto y un vocabulario reducido de 395 símbolos diseñado específicamente para la gramática de la Spec. La decodificación está restringida por una máscara gramatical que impone las invariantes del formato: `t + dur <= duration`, rangos categóricos válidos y un máximo de 8 eventos por Spec. Esto elimina por construcción las salidas malformadas; el autor reporta 0 fallos de decodificación.

El entrenamiento es completamente sintético y desde cero. La versión v8 se inicializa a partir de v7 y se entrena durante 40.000 pasos (batch 32, AdamW, schedule coseno, una H100) sobre 150.000 pares (caption, Spec) generados con `orb.grammar.sample_spec` y 150.000 pares (prompt en lenguaje natural, Spec) generados con `orb.freetext`. No se usan pesos preentrenados, audio externo ni datos anotados por humanos. El dataset `orb-planner-data` contiene exactamente esas 300.000 filas de entrenamiento más los conjuntos de evaluación reservados.

## Capacidades

- Traducción de captions gramaticales a Spec JSON con coincidencia exacta en todos los campos.
- Interpretación best-effort de prompts en lenguaje natural hacia roles, texturas, mood, intensidad y duración.
- Generación de Specs con duración, textura, mood y hasta 8 eventos, cada uno con rol, tiempo de inicio, duración, ganancia en dB, panoramización y semilla.
- Cobertura de 47 roles de sonido: 10 núcleo (whoosh, impact, ui_pop, riser, swell, click, bell, sub_drop, glitch, noise_sweep) y 37 sonidos naturales, foley y cotidianos modelados físicamente (thunder, door_slam, footsteps, bird_chirp, wave_crash, glass_break, phone_ring, siren, etc.).
- 13 texturas de fondo: room_cold, wind, city_hum, vinyl, drone, rain, fire, sci_fi, ocean, stream, forest, night, traffic, o `none`.
- 10 moods: calm, warm, playful, hopeful, bright, tense, dark, eerie, neutral, intense.
- Salida en JSON plano apta para lectura, diff y edición por agentes.
- Integración con agentes mediante servidor MCP (`orb-mcp`) que expone planificación y renderizado como herramientas.
- No modela música; el alcance es efectos de sonido y texturas.

## Casos de uso

- Generación automatizada de efectos de sonido en pipelines de postproducción: el planner convierte una caption como "6.00-second bright cue, wind bed, with whoosh @1.00 0.90s -6dB L2 #2a" en una Spec que el renderizador DSP compila a WAV a 48 kHz, permitiendo producir variantes de forma reproducible mediante la semilla.
- Herramientas para agentes y asistentes de diseño sonoro: al emitir JSON plano y contar con un servidor MCP, un agente puede planificar, comparar y modificar sonidos como cualquier otro fichero de configuración dentro de un flujo multi-paso.
- Prototipado rápido de UI y videojuegos: con 47 roles y 13 texturas, un equipo puede generar feedback sonoro (ui_pop, click, whoosh, impacts) y ambientes (rain, wind, city_hum) sin depender de librerías de samples.
- Control de versiones de diseño sonoro: al ser una Spec textual, los cambios de un sonido se pueden versionar, revisar en diff y revertir, integrándose en repositorios y CI.
- Generación de variaciones controladas: la combinación de parámetros numéricos (ganancia en dB, panoramización, duración) y semilla permite reproducir exactamente un resultado o explorar variantes sistemáticas.
- Investigación sobre decodificación restringida por gramática: el modelo sirve como caso de estudio de generación estructurada con máscara gramatical en un dominio cerrado, con 0 fallos de decodificación reportados.
- Docencia y experimentación con entrenamiento desde cero sobre datos sintéticos: el dataset de 300.000 filas y el código de generación procedural permiten reproducir el entrenamiento en una sola GPU.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Métrica | Valor |
|---|---|
| Captions gramaticales reservadas (500), coincidencia exacta de Spec | 500/500 (100%), todos los campos al 100% |
| Captions gramaticales reservadas (2000) | 2000/2000 (100%) |
| Prompts en texto plano, conjunto propio (209), totalmente correctos | 58,4% (v7 + reglas de keywords: 45,0%) |
| Prompts en texto plano, conjunto ciego (40), totalmente correctos | 70,0% (v7 + reglas de keywords: 77,5%) |
| Fallos de decodificación | 0 |
| Parámetros | 5.096.192 |
| Contexto | 1024 |
| Vocabulario | 395 |

Un prompt en texto plano se considera correcto solo si acierta roles, roles extra, textura, mood, intensidad y duración. El conjunto ciego fue escrito por otra persona; la diferencia respecto al conjunto propio indica que la capacidad con texto libre generaliza menos de lo que sugiere el conjunto interno.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 5,10 M de parámetros en fp32 el modelo ocupa aproximadamente 20 MB, y en fp16 unos 10 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; una RTX 4090, una RTX 3060 o incluso CPU son suficientes. El entrenamiento reportado se realizó en una H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: carga directa con `safetensors` y PyTorch mediante la clase `Planner` del paquete `orb-audio`; el paquete se instala con `pip install "orb-audio[train,hub] @ git+https://github.com/stdevMac/orb-audio"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. ORB planner no es un modelo de texto-a-audio convencional: no sintetiza señal, sino una Spec intermedia para un renderizador DSP determinista, por lo que su categoría funcional no coincide con la de los modelos generativos de audio de propósito general. No disponible.

## Limitaciones y advertencias

- Para sustantivos sin sonido asociado, el planner puede inventar el rol más cercano disponible.
- Los recuentos ("three knocks") y los prompts largos con múltiples cláusulas son puntos débiles.
- Para garantizar exactitud conviene escribir una caption gramatical o pasar directamente un diccionario Spec.
- Solo modela efectos de sonido y texturas; la música no está contemplada en esta versión.
- Solo soporta inglés; no se documenta soporte multilingüe.
- El rendimiento en texto libre es limitado (58,4% en el conjunto propio y 70,0% en el ciego), con brecha entre ambos que sugiere sobreajuste al conjunto interno.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- Riesgo de alucinación semántica: el modelo puede mapear un concepto desconocido a un rol existente en lugar de indicar que no lo soporta.
- Licencia Apache-2.0, que permite uso comercial; conviene revisar igualmente las condiciones del repositorio ORB para el renderizador y el resto del motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marcosmaceo/orb-planner
- Dataset de entrenamiento: https://huggingface.co/datasets/marcosmaceo/orb-planner-data
- Repositorio de código: https://github.com/stdevMac/orb-audio
- Demo en vivo (Space): https://huggingface.co/spaces/marcosmaceo/orb
- Página del proyecto: https://stdevmac.github.io/orb-audio/
- Documentación para agentes: https://github.com/stdevMac/orb-audio/blob/main/docs/agents.md
