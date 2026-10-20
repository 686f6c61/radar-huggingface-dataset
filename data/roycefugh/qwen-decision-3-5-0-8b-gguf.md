# roycefugh/qwen-decision-3.5-0.8B-GGUF

## Resumen

Qwen Decision 3.5 0.8B (GGUF) es un modelo de decisión compacto y especializado, desarrollado por el usuario de HuggingFace `roycefugh`, que elige un movimiento legal dentro de un juego estilo Pac-Man a partir de un conjunto estructurado de hechos del estado de partida. No es un modelo conversacional de propósito general: es un "estudiante" destilado de un profesor no especificado, afinado sobre el modelo base Qwen3.5-0.8B mediante LoRA y exportado a GGUF Q8_0 para inferencia local con llama.cpp. El repositorio se renombró desde `qwen-pacman-1B-GGUF` para reflejar su tamaño real.

El modelo parte de Qwen3.5-0.8B y cuenta con 752.393.024 parámetros en esta exportación solo de lenguaje, con un tamaño de descarga de 811,84 MB (774,23 MiB) en cuantización Q8_0. Su aportación técnica concreta es la incorporación de la distribución de píldoras restantes por dirección a un conjunto compacto de características de fantasmas, comida, cruces y supervivencia, lo que lo distingue del baseline publicado `pacman-0.8b-qwen`.

Es relevante ahora por su perfil de despliegue: inferencia local en un Mac con latencia mediana de 46,07 ms por decisión, cero errores de inferencia en 4.362 decisiones evaluadas en tiempo real y elección legal en el 100% de los casos dentro del scorer restringido. La licencia Apache 2.0 y el formato GGUF lo hacen directamente utilizable en prototipos de agentes de juego y en investigación sobre destilación de políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base Qwen3.5-0.8B (detalle no especificado en la model card) |
| Parametros totales | 752.393.024 (solo lenguaje) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como especificacion del modelo; en evaluacion se uso ventana de 2.048 tokens (scorer nativo llama.cpp) y 4.096 tokens (servidor llama.cpp en navegador) |
| Tipos de cuantizacion | GGUF Q8_0 (unica publicada en el repo); existen pesos/adaptador en formato MLX segun los tags |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptador MLX para entrenamiento y evaluacion |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5, adaptado mediante LoRA y posteriormente fusionado y exportado a GGUF Q8_0. La model card no detalla la arquitectura interna del base (número de capas, cabezas, tipo de atención ni mecanismos híbridos), por lo que esa información no está disponible. El entrenamiento se realizó con MLX sobre Apple Silicon, con una duración de 9.956 segundos (2,77 horas) y un pico de asignación de GPU de 17,09 GB, excluyendo la generación de etiquetas y la exportación.

El proceso es una destilación por imitación: se generaron 20.000 estados de juego etiquetados únicos y 2.000 estados de validación separados, con rangos de semilla distintos y comprobaciones de solapamiento exacto de prompts. La entrada es un conjunto compacto de hechos del estado actual más la distribución de píldoras restantes por dirección (`features-pellets-v2`), sin mirada anticipada del profesor ni procesamiento de visión o capturas de pantalla. El modelo puntúa únicamente las opciones legales ofrecidas en cada petición y devuelve una acción por solicitud, junto con probabilidades normalizadas de movimiento legal. La validación reportó un 59,00% de acuerdo con las acciones del profesor mediante una ruta de scoring independiente en MLX, frente al 36,75% del base sin afinar, y el entrenador registró 58,90% en su validación por lotes.

## Capacidades

- Selección de una acción legal por petición en un juego tipo Pac-Man, a partir de hechos estructurados del estado (fantasmas, comida, cruces, supervivencia y distribución de píldoras por dirección).
- Puntuación restringida a opciones legales: en la evaluación en tiempo real devolvió decisiones legales en 4.362 de 4.362 casos (100%).
- Salida de probabilidades normalizadas de movimiento legal completas para cada decisión devuelta, lo que permite analizar la confianza de la política.
- Funcionamiento sin visión: no requiere capturas de pantalla ni procesamiento de imagen; el estado se pasa como texto estructurado.
- Inferencia local de baja latencia con llama.cpp (mediana de 39,6 a 46,07 ms por decisión en Apple M5 Max).
- Integración en demo de navegador con simulación a 30 ticks por segundo mientras la inferencia está en vuelo, descartando respuestas obsoletas.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso, razonamiento general, código, matemáticas, visión o audio: no disponibles; el modelo está especializado en una única tarea de decisión.

## Casos de uso

- Agente jugador de Pac-Man en local: el modelo recibe el estado estructurado del juego y devuelve un movimiento legal por tick; con latencias de ~40-50 ms encaja en bucles de simulación a 30 ticks por segundo en hardware Apple Silicon.
- Evaluación comparativa de políticas de decisión: su scorer restringido a opciones legales y su registro de probabilidades permiten comparar políticas (destilada frente a base) en modo lockstep como diagnóstico offline de calidad de política.
- Investigación sobre destilación e imitación: el repositorio documenta 20.000 estados de entrenamiento, 2.000 de validación, acuerdo con el profesor y ganancia de +22,25 puntos porcentuales frente al base, lo que lo convierte en un caso reproducible para estudiar imitación a pequeña escala.
- Prototipado de sistemas de decisión con estado tabular: sirve como plantilla para convertir un problema de decisión discreta (con opciones legales acotadas) en un prompt de hechos y usar un LLM pequeño como política.
- Despliegue en el borde o en equipos de gama consumer: con 811,84 MB en Q8_0, cabe en memoria unificada de portátiles y en GPUs de consumo, sin necesidad de infraestructura de servidor.
- Demo web interactiva: integrado en una demo de Chrome con servidor llama.cpp y contexto de 4.096 tokens; en una ejecución de 25,038 segundos gestionó 751 ticks y 344 decisiones legales con cero errores.
- Pruebas de ingeniería de características: al comparar `features-pellets-v2` con el baseline se puede medir el impacto de añadir la distribución de píldoras por dirección en el rendimiento de la política.

## Benchmarks y rendimiento

| Métrica | Resultado | Ámbito |
|---|---:|---|
| Parámetros del modelo | 752.393.024 | Solo lenguaje, clase 0.8B |
| Tamaño de descarga | 811,84 MB / 774,23 MiB | GGUF Q8_0 |
| Estados de entrenamiento etiquetados | 20.000 | Estado actual compacto + direcciones de píldoras |
| Estados de validación separados | 2.000 | Semillas distintas y control de solapamiento |
| Acuerdo con acciones del profesor | 59,00% | Adaptador MLX, 2.000 estados de validación |
| Acuerdo del base sin afinar | 36,75% | Mismos estados y scoring de opciones legales |
| Ganancia de acuerdo | +22,25 puntos porcentuales | Mejora de imitación, no win rate |
| Latencia de inferencia (estado nuevo) | 46,07 ms p50 / 51,14 ms p90 | 3.278 prompts distintos en juego en tiempo real |
| Puntuación media en tiempo real | 3.852 | Cinco partidas held-out, semillas 100-104 |
| Píldoras medias por partida | 266,0 | Mismas partidas, incluye niveles posteriores |
| Supervivencia media | 61,4 segundos de simulación | Mismas partidas |
| Decisiones legales devueltas | 4.362 / 4.362 (100%) | Scorer restringido a opciones legales |
| Errores de inferencia / distribución | 0 / 0 | 4.362 decisiones |
| Decisiones tardías descartadas | 56 / 4.362 (1,28%) | Estado obsoleto durante la inferencia |
| Duración del entrenamiento | 9.956 s (2,77 h) | MLX, excluye etiquetado y exportación |
| Pico de asignación en entrenamiento | 17,09 GB | Reportado por MLX, no es memoria de serving |
| Paridad merged-to-GGUF | 127 / 128 (99,22%) | Subconjunto de validación de cuantización; tokens coincidentes 128/128 |
| Acuerdo del GGUF en subconjunto de exportación | 75 / 128 (58,59%) | Subconjunto demasiado pequeño para sustituir la validación completa |
| Validación por lotes del entrenador | 58,90% | Ruta de scoring del entrenador |

Comparación de juego held-out (mismas condiciones: `features-pellets-v2`, semillas 100-104, tope de 180 segundos de simulación, Q8_0, scorer nativo llama.cpp con contexto de 2.048 tokens, reinicio de estado por petición):

| Modo de reloj | Modelo | Puntuación media | Píldoras medias | Supervivencia media (s) | Decisiones tardías | Errores |
|---|---|---:|---:|---:|---:|---:|
| Tiempo real | Este modelo (pellet student) | 3.852 | 266,0 | 61,4 | 1,28% | 0 |
| Tiempo real | `pacman-0.8b-qwen` publicado | 4.130 | 277,8 | 57,6 | 0,48% | 0 |
| Lockstep | Este modelo (pellet student) | 6.184 | 308,0 | 62,8 | 0% | 0 |
| Lockstep | `pacman-0.8b-qwen` publicado | 5.508 | 324,4 | 70,6 | 0% | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos Q8_0 (811,84 MB de descarga); la memoria en tiempo de ejecución es mayor por la caché KV y el contexto (2.048-4.096 tokens en las evaluaciones).
- GPU recomendadas: no se especifican requisitos mínimos; las mediciones se hicieron en Apple M5 Max con 128 GiB de memoria unificada mediante llama.cpp y MLX.
- Cabe en GPU de consumo: sí, por tamaño (clase 0.8B en Q8_0); también es viable en CPU.
- Opciones de despliegue: llama.cpp (utilizado en las evaluaciones), servidor llama.cpp para integración en navegador, adaptador/pesos MLX para Apple Silicon. Soporte en vLLM, TGI u Ollama no está confirmado en la información disponible.
- Latencia y throughput: 46,07 ms p50 y 51,14 ms p90 por decisión en estados nuevos (3.278 prompts); 39,6 ms de mediana end-to-end en la comprobación en vivo de Chrome con 499 tokens de entrada; una ejecución gestionó 344 decisiones en 25,038 segundos de reloj.
- Memoria de entrenamiento: pico de 17,09 GB de asignación de GPU reportada por MLX (no representa memoria de serving).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en juego (tiempo real) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `roycefugh/qwen-decision-3.5-0.8B-GGUF` | 752.393.024 | No especificado (evaluado con 2.048 y 4.096 tokens) | Puntuación 3.852; 266,0 píldoras; 61,4 s; 59,00% de acuerdo con el profesor | Apache 2.0 | GGUF Q8_0 en HuggingFace, 4 descargas, 1 like |
| `grapeot/decision-pacman-0.8b-GGUF` (baseline publicado) | Clase 0.8B | No disponible | Puntuación 4.130; 277,8 píldoras; 57,6 s; 0,48% de decisiones tardías | No disponible en la información | Publicado en HuggingFace; usado como referencia |
| Qwen3.5-0.8B (base sin afinar) | 752.393.024 (clase 0.8B) | No disponible | 36,75% de acuerdo con el profesor (sin entrenamiento específico) | No disponible en la información | Modelo base en HuggingFace |

La comparación se basa en cinco semillas y los propios autores la describen como una comparación inicial, no como un ranking estadísticamente establecido. No se dispone de una tercera alternativa comparable con datos verificables.

## Limitaciones y advertencias

- Especialización estrecha: el modelo elige una acción entre opciones legales de un juego tipo Pac-Man; no es fiable para generación de texto libre ni para tareas generales.
- El 59,00% de acuerdo con el profesor implica un 41,00% de desacuerdo con las etiquetas del profesor; no se ha medido si ese desacuerdo se traduce en peor juego.
- La fiabilidad de elección legal (100%) se obtuvo con un scorer restringido a movimientos disponibles; no implica que cada movimiento elegido sea estratégicamente bueno.
- Solo idioma inglés en la metadata y en el formato de estado; no hay soporte multilingüe declarado.
- Sin capacidades de visión, audio, tool calling ni razonamiento multi-paso; no se debe interpretar como un agente general.
- Riesgo de alucinación fuera del formato restringido: el modelo puede producir texto no válido si se usa sin el scorer de opciones legales.
- Decisiones tardías: un 1,28% de las decisiones en tiempo real se descartaron por estado obsoleto; en lockstep el fenómeno desaparece por definición.
- Comparación de juego limitada: cinco semillas, tope de 180 segundos de simulación, resultados contradictorios entre tiempo real y lockstep; no se establece superioridad sobre el baseline.
- La validación de la exportación GGUF se apoya en un subconjunto de 128 estados (58,59%), insuficiente para sustituir la validación completa.
- Sesgos: derivados del profesor y del generador de etiquetas, no auditados; no hay evaluación de sesgos demográficos ni de robustez ante estados fuera de distribución.
- Licencia Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos; el modelo base Qwen3.5-0.8B puede tener condiciones adicionales que deben verificarse por separado.
- Fecha de creación del repositorio (2026-10-20) y estado de publicación muy reciente: 4 descargas y 1 like, sin validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roycefugh/qwen-decision-3.5-0.8B-GGUF
- Métricas detalladas del autor: https://huggingface.co/roycefugh/qwen-decision-3.5-0.8B-GGUF/blob/main/metrics.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Baseline publicado de comparación: https://huggingface.co/grapeot/decision-pacman-0.8b-GGUF
- Paper, blog, repositorio de código y demo adicionales: no disponibles en la información proporcionada
- Resultados de búsqueda web: ninguna referencia relevante al modelo; los resultados obtenidos tratan sobre la función de búsqueda visual de Microsoft Edge y consultas de Stack Overflow, sin relación con este modelo
