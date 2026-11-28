# Icodetools/Vulcan-1-coding-GGUF

## Resumen

Vulcan-1-Coder es un modelo de lenguaje de 2.516.756.480 parámetros (aproximadamente 2,5B) especializado en código, razonamiento y matemáticas, derivado de CherryPit 1.2 (DRUPEs/CherryPit-1.2-2B) mediante una técnica propia del autor denominada "Integer Space Artificial Selection". Lo desarrolla Icodetools y se distribuye principalmente como archivo GGUF cuantizado en Q4_K_M, pensado para ejecución local en hardware modesto (el autor lo generó y evaluó en un portátil con GPU de 6 GB de VRAM).

La propuesta diferencial no es el entrenamiento desde cero, sino un proceso de selección evolutiva sobre las representaciones internas del modelo base: en lugar de añadir datos, se "selecciona" la información ya presente en los pesos. Según la model card, el modelo se produjo en una tarde junto a otros ~30 modelos (12 en su clase), sin clústeres ni ejecuciones de entrenamiento largas, y el archivo Q4_K_M es exactamente el que ganó la "selection league" interna del autor.

Es relevante ahora porque demuestra una vía de bajo coste para obtener modelos pequeños con capacidades de razonamiento matemático notables (76,7% en AIME 2026 según el autor, aunque con matices metodológicos importantes), ejecutables en local y con licencia Apache 2.0. La contrapartida es una documentación incompleta, benchmarks no reproducidos de forma independiente y una advertencia explícita del autor de que solo la cuantización Q4_K_M funciona correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de CherryPit 1.2 / familia MiniCPM según tags); detalles no disponibles |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los benchmarks usan hasta 24K tokens de generación con thinking) |
| Tipos de cuantizacion | Q4_K_M (única funcional según el autor); existieron Q8_0 y otras variantes, retiradas por ineficaces |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors "coming soon", no publicado) |

## Arquitectura y entrenamiento

El modelo parte de CherryPit 1.2, un modelo de ~2,5B de la familia MiniCPM (según los tags del repositorio) que ya incorpora capacidades de razonamiento. Vulcan-1 no se entrena desde cero ni con un corpus masivo: el autor aplica "Integer Space Artificial Selection", una técnica de selección sobre el espacio entero de los pesos, análoga a una evolución dirigida, en la que se generan variantes y se seleccionan las que mejor rinden en una liga interna de preguntas. Según la model card, los elementos ausentes en el modelo base se añadieron mediante parches y ejecuciones cortas de entrenamiento, únicamente para que la selección pudiera operar sobre ellos.

El proceso se realizó íntegramente en formato GGUF, sobre un portátil con 6 GB de VRAM, y el autor afirma que el método es aplicable a todo tipo de modelos. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO. La innovación destacable es la propia metodología de selección y el hecho de que el checkpoint ganador sea una cuantización Q4_K_M concreta: el autor sostiene que recuantizar a otros tamaños degrada el modelo, y que las diferencias observadas no son ruido sino consecuencia del proceso de selección (selección conjunta de entrenamiento y cuantización).

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático con modo "thinking" (cadena de razonamiento extendida, hasta 24K tokens en las evaluaciones).
- Generación y razonamiento sobre código; el modelo se posiciona como "coding model".
- Razonamiento multi-paso orientado a problemas de competición (AIME).
- Soporte de ejecución en llama.cpp, LM Studio y Ollama (tags del repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de agente y tool calling: no documentadas explícitamente; los benchmarks se ejecutaron "sin herramientas", por lo que no hay evidencia de soporte fiable.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Asistente de código en local: integrado en el IDE o en un flujo de llama.cpp/Ollama, el modelo puede autocompletar y razonar sobre fragmentos de código en máquinas sin GPU dedicada, gracias a sus ~1,56 GB en Q4_K_M.
- Resolución de problemas matemáticos paso a paso: con el modo thinking activado y ventanas de generación de hasta 24K tokens, es adecuado para tutoría o verificación de problemas de nivel competición, donde el autor reporta resultados altos en AIME.
- Prototipado y experimentación educativa: su tamaño y licencia Apache 2.0 permiten usarlo en cursos, talleres y entornos de investigación para estudiar razonamiento en modelos pequeños.
- Automatización de scripts y tareas de shell: puede generar y explicar scripts cortos en un pipeline de CI local, siempre con revisión humana dado el riesgo de alucinación.
- Chatbot técnico de soporte en inglés: conversaciones multi-turno sobre dudas de programación, ejecutables en portátiles o en dispositivos con 6-8 GB de VRAM.
- Evaluación de técnicas de fusión y cuantización: sirve como caso de estudio reproducible para investigadores interesados en selección en espacio entero y en el impacto de la cuantización en el rendimiento.
- Inferencia on-device en entornos con recursos limitados: al caber en GPUs de consumo y en CPU vía llama.cpp, es viable para asistentes locales sin conexión.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuración | Notas |
|---|---|---|---|
| AIME 2025 | 21/30 = 70,0% | Thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra, Q8_0 | Medido sobre la exportación BF16 previa en Q8_0, no sobre el archivo Q4_K_M actual; repetición pendiente |
| AIME 2026 (run 1) | 23/30 = 76,7% | Thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra, Q4_K_M | Benchmarking harness, sin herramientas |
| AIME 2026 (run 2) | 21/30 = 70,0% | Thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra, Q8_0 | Medido sobre la exportación BF16 previa en Q8_0; repetición pendiente |
| Selection league (interna) | Primer puesto | Q4_K_M, temperatura 1.0, 0/0.5/1 por respuesta | Preguntas generadas por el autor y por LLMs (Claude, ChatGPT, DeepSeek), no benchmarks oficiales; CherryPit 1.2 como línea base |

No se han publicado resultados de benchmarks de código (HumanEval, MBPP u otros) ni de conocimiento general en la información disponible. Los datos de AIME provienen únicamente del autor y no han sido verificados de forma independiente; una sola muestra por problema y temperatura 1.0 implican alta varianza.

## Requisitos de hardware

- VRAM estimada: ~1,6 GB para el archivo Q4_K_M (1,56 GB de pesos más overhead de contexto); el autor lo ejecutó en una GPU de 6 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o más (RTX 3060, RTX 4060, RTX 4090); también viable en CPU vía llama.cpp.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6-8 GB; en iGPU y CPU con rendimiento reducido.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama; el repositorio incluye un imatrix para cuantización.
- Latencia y throughput: no disponibles. El contexto de generación con thinking puede alcanzar 24K tokens, lo que incrementa notablemente el tiempo de respuesta en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vulcan-1-Coder | ~2,5B | No disponible | Código, matemáticas, razonamiento | Apache 2.0 | GGUF en HF (safetensors pendiente) |
| CherryPit 1.2 (base) | ~2B | No disponible | Modelo base generalista | No disponible en la información | HF (DRUPEs/CherryPit-1.2-2B) |
| Qwen2.5-Coder-1.5B / 3B | 1,5B / 3B | 32K (según versión) | Código | Apache 2.0 (mayoría de variantes) | GGUF y safetensors en HF |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks comunes publicados en la información proporcionada. CherryPit 1.2 aparece como línea base en la liga interna del autor, donde Vulcan-1 quedó por delante, pero se trata de una evaluación no estandarizada.

## Limitaciones y advertencias

- Solo la cuantización Q4_K_M funciona correctamente según el autor; otras cuantizaciones degradan el modelo de forma significativa y las variantes alternativas fueron retiradas del repositorio.
- Benchmarks autoevaluados por el autor, con una sola muestra por problema, temperatura 1.0 y sin verificación independiente; los resultados de AIME 2025 y del run 2 de AIME 2026 se midieron sobre una exportación BF16/Q8_0 anterior, no sobre el archivo publicado.
- El propio autor advierte que el modelo "no ha sido probado ni entrenado completamente tras la selección" y que puede presentar fallos, como generar secuencias de símbolos sin sentido.
- Riesgo de alucinación elevado en un modelo de 2,5B; no debe usarse sin supervisión en producción crítica.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Longitud de contexto oficial no disponible; el uso de thinking hasta 24K tokens encarece la inferencia.
- Soporte de tool calling y agentes no documentado; los benchmarks se hicieron sin herramientas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de safetensors y de documentación del método limita la reproducibilidad y la auditoría.
- La metodología ("Integer Space Artificial Selection") no está publicada todavía; el autor indica que la liberará más adelante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Icodetools/Vulcan-1-coding-GGUF
- Modelo base CherryPit 1.2: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Análisis de Q4_K_M citado por el autor: https://huggingface.co/MisasAI/Vulcan-1-small-GGUF#analysis
- Repositorio de llama.cpp (ejecución GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
