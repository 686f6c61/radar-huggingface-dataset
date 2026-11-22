# ItsnotAilabs/GHOST-2.7B

## Resumen

GHOST-2.7B (Generative Heuristic Orchestrator for Sovereign Thought) es un ajuste fino de parámetros completos del modelo Phi-2 de Microsoft, publicado por ItsnotAilabs bajo licencia Apache 2.0. Está especializado en generación narrativa, simulación de entornos adversariales y construcción autónoma de relatos con tono oscuro o filosófico. El modelo conserva la arquitectura transformer densa de Phi-2, con 32 capas, dimensión oculta de 2560 y 32 cabezas de atención.

El modelo se distribuye en formato safetensors y está pensado para integrarse como componente creativo dentro de marcos agénticos, sirviendo de contraparte generativa a modelos con control lógico más estricto. Su entrenamiento se apoya en tres conjuntos de datos propios: Sovereign Corpus, WritingPrompts y transcripciones de simulación adversarial. No incorpora visión, audio ni tool calling nativo; su foco es exclusivamente la generación de texto en inglés.

Es relevante ahora porque propone un caso de uso poco habitual: modelos pequeños y especializados en narrativa adversarial que pueden ejecutarse en hardware de consumo (a partir de 6 GB de VRAM en FP16) y funcionar como respaldo offline en sistemas multiagente. Su contexto de 2048 tokens limita el uso en tareas de contexto largo, pero lo hace viable para despliegues locales con presupuesto de memoria reducido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-2), 32 capas, 32 cabezas de atención, hidden dim 2560, Rotary Position Embeddings |
| Parámetros totales | 2.7B declarados por el autor; 153.355.345 según los pesos safetensors publicados |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | FP16, INT8, GGUF Q4_K_M (según la model card) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,8 GB); GGUF mencionado en la model card |

## Arquitectura y entrenamiento

GHOST-2.7B parte de `microsoft/phi-2` y aplica un ajuste fino de parámetros completos, no un adaptador LoRA, con el objetivo declarado de desplazar la distribución predictiva del modelo hacia prosa creativa. Mantiene la formulación de atención paralela de Phi-2, las 32 capas y la dimensión oculta de 2560, junto con embeddings posicionales rotatorios. No se documentan innovaciones arquitectónicas propias ni mecanismos de decodificación especulativa.

Los datos de entrenamiento citados son tres conjuntos: Sovereign Corpus (lore esotérico y fundamentos de marco), WritingPrompts (estructuras narrativas creativas) y Adversarial Simulation Transcripts (diálogos de shadow-persona y escenarios límite). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla la configuración de hiperparámetros ni el cómputo empleado.

## Capacidades

- Generación de texto narrativo en inglés con énfasis en tono oscuro, monólogos internos y escenarios filosóficos complejos.
- Simulación de subcórtex adversarial y shadow-personas dentro de marcos agénticos.
- Construcción autónoma de tramas y bucles narrativos a partir de una instrucción de escenario o del inicio de un relato.
- Generación determinista de rutas narrativas en operaciones desconectadas de red (fallback offline).
- Traducción de restricciones abstractas en pasajes semánticos ricos, según el protocolo "Membrane Bridge" descrito por el autor.
- No soporta tool calling ni function calling de forma nativa.
- No soporta visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Simulación de personajes adversariales en videojuegos narrativos: el modelo puede generar diálogos de antagonistas y voces internas con coherencia de tono, ejecutándose en local con 6 GB de VRAM en FP16 o menos de 2 GB en Q4_K_M.
- Generación de ficción interactiva: sirve como motor de continuación de relatos por turnos, con temperatura recomendada de 0.85 y penalización de repetición de 1.1 para evitar bucles.
- Componente creativo en pipelines multiagente: actúa como módulo de prosa contrapuesto a un modelo con control lógico, aportando variación semántica en la fase de ideación.
- Respaldo offline en sistemas de escritura asistida: al ser un modelo pequeño y con pesos descargables, puede operar sin conexión para generar borradores narrativos en entornos aislados.
- Prototipado rápido de narrativa ramificada: con contexto de 2048 tokens permite generar escenas cortas y ramas de decisión que luego se encadenan mediante resumen externo.
- Investigación en alineación y deriva adversarial: útil para estudiar cómo modelos pequeños responden a prompts de simulación de subcórtex y qué mecanismos de contención requieren.
- Generación de lore y material de ambientación para juegos de rol: el ajuste sobre Sovereign Corpus favorece la producción de texto esotérico coherente con un marco ficticio definido.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en la model card. El model-index oficial no contiene resultados (`results: []`).

| Benchmark | GHOST-2.7B | Nota |
|---|---|---|
| HellaSwag | 73,1 | Inferencia de sentido común |
| WinoGrande | 72,4 | Resolución de pronombres y lógica |
| PIQA | 79,6 | Intuición física |
| NarrativeQA | 42,3 | Comprensión lectora de relatos |
| DarkLayer-Sim (custom) | 68,9 % | Renderizado adversarial de subcórtex (métrica propia, no estándar) |

No se dispone de comparaciones oficiales con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 5,5 GB, según la model card.
- VRAM estimada en INT8: aproximadamente 3,0 GB.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 1,9 GB.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que el modelo cabe en 6 GB de VRAM, por lo que es viable en RTX 3060, RTX 4060, RTX 2070 y superiores.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6 GB de VRAM en FP16 y en configuraciones de 2-3 GB con cuantización.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; GGUF sugiere compatibilidad con llama.cpp y derivados como Ollama, aunque no se confirma explícitamente.
- Latencia estimada: 20-30 ms/token en FP16, 15-22 ms/token en INT8 y 10-15 ms/token en GGUF Q4_K_M, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GHOST-2.7B | 2,7B declarados (153M en safetensors) | 2.048 | Apache 2.0 | Ajuste fino de Phi-2 para narrativa adversarial |
| microsoft/phi-2 | 2,7B | 2.048 | MIT | Modelo base; capacidades generales de razonamiento y código, sin especialización narrativa |
| Modelos narrativos pequeños de 1-3B | no disponible | no disponible | no disponible | No se dispone de comparaciones verificadas en la información proporcionada |

No se han publicado comparativas oficiales con alternativas en la información disponible. La discrepancia entre los 2,7B declarados y los 153M de pesos safetensors debe verificarse antes de asumir el tamaño real del modelo.

## Limitaciones y advertencias

- Discrepancia de parámetros: el autor declara 2,7B, pero los safetensors publicados suman 153.355.345 parámetros. Conviene validar el tamaño real antes de planificar el despliegue.
- Ventana de contexto de solo 2.048 tokens: la generación de narrativa larga requiere troceado o resumen externo.
- Deriva adversarial: con temperatura alta en modo subcórtex puede producir salidas excesivamente oscuras o esotéricas; el autor recomienda un modelo "Cortex" que mantenga límites de seguridad.
- Alucinación en consultas factuales: el modelo no es una base de conocimiento fiable y no debe usarse como fuente autoritativa.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Sin tool calling ni capacidades de agente nativas.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan evaluaciones de seguridad ni filtros de contenido.
- No hay resultados en el model-index oficial; los benchmarks son declaraciones del autor sin verificación independiente.
- El identificador del repo en Hugging Face (`ItsnotAilabs/GHOST-2.7B`) difiere del citado en la model card (`MedinaMemorySystems/GHOST-2.7B`), lo que puede causar confusión en descargas y referencias.

## Enlaces

- Hugging Face: https://huggingface.co/ItsnotAilabs/GHOST-2.7B
- Modelo base: https://huggingface.co/microsoft/phi-2
- Repositorio citado en la model card: https://huggingface.co/MedinaMemorySystems/GHOST-2.7B (referencia del autor, puede no resolver)
