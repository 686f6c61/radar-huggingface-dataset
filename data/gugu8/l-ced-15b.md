# Gugu8/L-CED-15B

## Resumen

L-CED-15B es un modelo de lenguaje publicado por el usuario Gugu8 en Hugging Face, presentado por su autor como una arquitectura híbrida de tipo encoder-decoder causal con mezcla de expertos (MoE) y decodificador con profundidad recurrente ("looped decoder"). El modelo se posiciona explícitamente como orientado a "agentic coding", es decir, tareas de generación de código y razonamiento multi-paso dentro de agentes, con un objetivo declarado de rendimiento en SWE-bench, Terminal-Bench y DeepSWE.

La model card describe una combinación de técnicas que el autor atribuye a una supuesta familia "DeepSeek V4.1-Flash": CED (causal encoder-decoder), CSA2, Engram, "Single-Pass mHC" y "DSpark", además de un enrutado denominado "Mixture-of-Recursions". El modelo declara 15.000 millones de parámetros totales, entre 2.000 y 3.500 millones activos, y un contexto escalonado de hasta 1 millón de tokens. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

La información disponible es muy limitada: no hay pipeline declarado, no se publican resultados de benchmarks en la model card, no hay detalle del dataset de entrenamiento y el repositorio ocupa 3,3 TB, lo que sugiere pesos en precisión alta o múltiples checkpoints. La ficha siguiente refleja exclusivamente lo que el autor declara y marca como "no disponible" todo aquello que no se puede verificar con la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder causal con MoE y decodificador recurrente ("looped decoder"); enrutado "Mixture-of-Recursions" |
| Parámetros totales | 15B |
| Parámetros activos | ~2-3,5B (según model card) |
| Longitud de contexto | 1M tokens (declarado como "staged") |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 3.337,7 GB) |

## Arquitectura y entrenamiento

El autor describe una arquitectura que combina un encoder-decoder causal (CED) con atención CSA2, un componente denominado "Engram", un mecanismo "Single-Pass mHC" y "DSpark", junto con un decodificador con profundidad recurrente ("looped decoder") y un enrutado MoE llamado "Mixture-of-Recursions". Se trata de una propuesta de arquitectura "smartness-first", es decir, priorizar capacidad de razonamiento por parámetro activo frente a eficiencia pura de inferencia. No se especifica el número de capas, dimensión oculta, número de expertos, tamaño de los expertos ni la distribución de activaciones.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF, DPO o RL con verificación, ni sobre técnicas de decodificación especulativa. La model card remite a un archivo `ARCHITECTURE.md` para la especificación completa, pero su contenido no está incluido en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en inglés, según el único idioma declarado.
- Generación y edición de código orientada a tareas de ingeniería de software ("agentic coding").
- Razonamiento multi-paso para agentes, con contexto declarado de hasta 1M tokens.
- Enrutado MoE con activación parcial (~2-3,5B de 15B), lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- Profundidad recurrente ("looped decoder"), que en teoría permite reutilizar bloques para aumentar el cómputo efectivo por token.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Agentes de ingeniería de software: el modelo está entrenado y posicionado para resolver issues y parchear repositorios; su contexto de 1M tokens permitiría cargar árboles de proyecto completos y trazas de ejecución en una sola ventana.
- Asistente de revisión de código en CI/CD: con activación MoE de ~2-3,5B, el coste por token es bajo, lo que lo hace viable para analizar diffs y PRs en pipelines automatizados.
- Reparación de tests fallidos: el objetivo declarado en Terminal-Bench sugiere uso en bucles de ejecución de comandos, lectura de errores y generación de parches iterativos.
- Migración de código legacy: la ventana de 1M tokens permite procesar módulos completos y mantener coherencia entre ficheros durante refactorizaciones.
- Generación de documentación técnica a partir de código: el modelo puede resumir APIs y generar guías a partir de repositorios extensos.
- Automatización de tareas de terminal: dado su enfoque en Terminal-Bench, encaja en agentes que ejecutan comandos y validan resultados.
- Exploración de arquitecturas MoE recurrentes en investigación: su combinación de decoder recurrente y enrutado por recursión es un caso de estudio para quienes investigan eficiencia por parámetro activo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona SWE-bench, Terminal-Bench y DeepSWE como objetivos de evaluación, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~30 GB solo para pesos (15B × 2 bytes), más overhead de KV cache; con contexto de 1M tokens la caché puede ser muy grande y requerir técnicas de atención eficiente.
- VRAM estimada en cuantización de 8 bits: ~15-16 GB para pesos; en 4 bits: ~8-9 GB, aunque no se confirman formatos GGUF/AWQ/GPTQ en la información disponible.
- GPU recomendadas: A100 80 GB o H100 para contexto largo sin cuantizar; RTX 4090 (24 GB) podría ejecutar el modelo en 8 bits con contexto moderado, no con 1M tokens.
- Cabe en GPU de consumo: probablemente en RTX 4090 o RTX 3090 con cuantización de 8/4 bits y contexto reducido, siempre que existan pesos cuantizados, cosa que no se confirma.
- Opciones de despliegue: no disponible; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| L-CED-15B | 15B | ~2-3,5B | 1M (declarado) | Apache 2.0 | no disponibles |
| Modelos MoE de ~15B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa fiable con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Solo se declara inglés como idioma; el rendimiento en castellano no está garantizado.
- No hay benchmarks publicados que respalden las afirmaciones de rendimiento en SWE-bench, Terminal-Bench o DeepSWE.
- La model card es escasa y remite a documentación no incluida; no se detallan datos de entrenamiento, sesgos ni procesos de alineación.
- Riesgo de alucinación no evaluado; sin datos de RLHF/DPO no se puede estimar el grado de alineación.
- El contexto de 1M tokens se describe como "staged", lo que sugiere que puede no estar plenamente operativo o requerir configuración adicional.
- El repositorio ocupa 3,3 TB, lo que implica un coste de almacenamiento y descarga elevado y dificulta su uso en entornos con recursos limitados.
- La licencia Apache 2.0 permite uso comercial, pero al no haber evaluación independiente conviene validar el modelo en el dominio objetivo antes de producción.
- El autor solicita explícitamente seguidores y "likes" en la model card, lo que no afecta a la licencia pero indica un proyecto en fase temprana y con poca validación comunitaria (1 like, 24.161 descargas en la fecha de los datos).

## Enlaces

- Hugging Face: https://huggingface.co/Gugu8/L-CED-15B
- ARCHITECTURE.md: referenciado en la model card, no disponible en la información proporcionada.
- Paper, blog, repositorio o demo: no disponibles.
