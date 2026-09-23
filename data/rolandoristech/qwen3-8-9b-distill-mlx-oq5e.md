# RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e

## Resumen
Qwen3.8-9B-Distill-MLX-oQ5e es una versión cuantizada, nativa de MLX, del modelo destilado de razonamiento Qwen3.8-9B-Distill (base: empero-ai/Qwen3.8-Distill). La publica el usuario RolanDorisTech y está construida con la herramienta oMLX Universal Dynamic Quantization, en su variante oQe, que incorpora la importancia de activaciones tipo imatrix para ponderar la cuantización. El resultado son pesos estándar de mlx-lm en safetensors, utilizables desde mlx-lm, oMLX, LM Studio y mlx-swift, con un tamaño de 6,0 GB y licencia Apache 2.0.

El interés del modelo está en su método de cuantización: en lugar de aplicar un 4 u 8 bits uniforme, oQ mide la sensibilidad real de cada capa y reparte bits donde el error penaliza más, dejando lm_head en 8 bits y reforzando las capas de embedding y las primeras/últimas capas. El autor reporta un rango efectivo de aproximadamente 4,7-8,5 bpw para 6,0 GB, frente a los 5,003 bpw del 4-bit g32 uniforme y los 8,502 bpw del 8-bit g64.

Forma parte de una familia de ocho cuantizaciones publicada el 23 de septiembre de 2026 (2B, 4B y 9B en variantes oQ4e y oQ8e, más oQ5e y oQ6e para el 9B). En el momento de redactar esta ficha el repositorio no registra descargas ni "likes", por lo que no existe validación comunitaria independiente de sus resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3, destilado para razonamiento; detalles de arquitectura no disponibles |
| Parámetros totales | Aproximadamente 9.000 millones (según la denominación "9B" del nombre; no se especifica la cifra exacta) |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQe (oQ con imatrix); este repositorio en concreto: oQ5e. La familia incluye oQ4e, oQ5e, oQ6e y oQ8e. Efectivo aproximado: 4,7-8,5 bpw a 6,0 GB (referencia: 4-bit g32 = 5,003 bpw; 8-bit g64 = 8,502 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors de MLX (mlx-lm); incluye `chat_template.jinja` |

## Arquitectura y entrenamiento
No se proporciona información sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3 y de su naturaleza de modelo destilado orientado a razonamiento y de tipo solo texto. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Todos esos datos figuran como no disponibles.

Lo que sí está documentado es el proceso de cuantización. Se partió del maestro BF16 en MLX del modelo base y se aplicó oQe con "Reuse" activado, caché automática, "Strict" desactivado, "Preserve MTP" desactivado y bfloat16 para normas y escalas. Las protecciones aplicadas fueron lm_head en 8 bits y refuerzo de las capas de embedding y de las primeras y últimas capas. El proceso se ejecutó en un Mac Studio con M1 Max de 64 GB y GPU de 32 núcleos, con macOS 27.0, y tardó 3 minutos y 20 segundos para esta variante de 9B (frente a 7m23s del 9B-oQ4e, 3m21s del 9B-oQ6e y 3m24s del 9B-oQ8e). La salida conserva el formato estándar de safetensors de mlx-lm, sin requisitos de runtime propietarios.

## Capacidades
- Generación de texto y razonamiento paso a paso, con modo de pensamiento expresado mediante etiquetas `<think>` siguiendo la plantilla de chat de Qwen3.
- Resolución de problemas aritméticos sencillos con cadena de pensamiento: la prueba publicada ("Si 2x + 3 = 11, ¿cuánto vale x?") devuelve el resultado correcto (x = 4) tras la cuantización.
- Modelo solo texto: no se documentan capacidades de visión, audio ni multimodalidad.
- Razonamiento destilado: el autor lo etiqueta explícitamente como "distilled reasoning model".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (aunque el modo de pensamiento con `<think>` es la base habitual para este tipo de flujos en la familia Qwen3, no se confirma en la información disponible).
- Capacidades multilingües: no disponibles.
- Conversación multi-turno mediante la plantilla de chat incluida (`chat_template.jinja`).

## Casos de uso
- Asistente local de razonamiento en Mac: con 6,0 GB de pesos y MLX como runtime, el modelo puede ejecutarse íntegramente en un Mac con Apple Silicon sin conexión a Internet, lo que resulta adecuado para consultas con datos sensibles que no deben salir del equipo.
- Tutoría y resolución guiada de problemas matemáticos: el modo `<think>` permite mostrar el desarrollo intermedio del razonamiento, útil en herramientas educativas que necesitan explicar el procedimiento y no solo la respuesta final.
- Generación de código en estaciones de trabajo macOS: al ser un modelo de ~9B con pesos MLX, puede integrarse en editores y asistentes locales para autocompletado y refactorización sin depender de APIs externas.
- Procesamiento de documentos confidenciales (borradores legales, informes internos, historiales clínicos): el despliegue 100 % local evita el envío de texto a terceros, requisito habitual en entornos con obligaciones de confidencialidad.
- Evaluación y comparación de esquemas de cuantización: la familia publicada incluye las mismas variantes en oQ4e, oQ5e, oQ6e y oQ8e con métricas de velocidad y memoria medidas, lo que permite reproducir curvas de compromiso calidad/coste en hardware Apple.
- Prototipado rápido en portátiles Mac con memoria unificada limitada: las variantes de 2B y 4B del mismo autor (1,1 GB a 4,2 GB) cubren escenarios donde el modelo de 9B no cabe, manteniendo el mismo formato de pesos y plantilla de chat.
- Operación offline en movilidad (aviones, entornos aislados o con red restringida): un modelo de 6,0 GB en almacenamiento local permite mantener asistencia de texto sin conectividad.
- Base para experimentos de destilación y ajuste fino: al ser una destilación con licencia Apache 2.0 y pesos safetensors estándar, sirve como punto de partida para comparar recetas de destilación sobre modelos de ~9B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, HumanEval, etc.) en la información disponible. Los únicos datos medidos por el autor son una prueba aritmética y métricas de velocidad y memoria en un Mac Studio M1 Max de 64 GB:

| Prueba | Resultado |
|---|---|
| Aritmética con cadena de pensamiento ("2x + 3 = 11") | Correcto, x = 4, preservado tras la cuantización |
| Velocidad de procesamiento de prompt (37 tokens) | 91,3 tok/s |
| Velocidad de generación (82 tokens) | 37,1 tok/s |
| Pico de memoria | 6,555 GB |
| MMLU, GSM8K, HumanEval y similares | No publicados en la información disponible |

Comparativa medida dentro de la misma familia, con el mismo prompt y el mismo equipo:

| Modelo | Tamaño | Prompt (tok/s) | Generación (tok/s) | Pico de memoria |
|---|---|---|---|---|
| Qwen3.8-2B-Distill-oQ4e | 1,1 GB | 267,7 | 118,6 | 1,241 GB |
| Qwen3.8-2B-Distill-oQ8e | 1,9 GB | 122,2 | 97,5 | 2,131 GB |
| Qwen3.8-4B-Distill-oQ4e | 2,3 GB | 133,7 | 65,4 | 2,684 GB |
| Qwen3.8-4B-Distill-oQ8e | 4,2 GB | 130,9 | 48,4 | 4,651 GB |
| Qwen3.8-9B-Distill-oQ4e | 4,9 GB | 101,5 | 43,0 | 5,471 GB |
| Qwen3.8-9B-Distill-oQ5e (este) | 6,0 GB | 91,3 | 37,1 | 6,555 GB |
| Qwen3.8-9B-Distill-oQ6e | 7,0 GB | 84,3 | 33,3 | 7,664 GB |
| Qwen3.8-9B-Distill-oQ8e | 8,9 GB | 91,8 | 28,7 | 9,679 GB |

## Requisitos de hardware
- VRAM equivalente (memoria unificada): pico medido de 6,555 GB durante un prompt de 37 tokens y una generación de 82 tokens. Conviene reservar margen adicional para contextos largos, ya que el consumo de la caché KV crece con la longitud de la secuencia.
- Compatibilidad: MLX es un framework exclusivo de Apple Silicon (familia M). No hay soporte para GPU NVIDIA, AMD ni aceleradores tipo CUDA/ROCm en este repositorio.
- GPU recomendadas (equivalentes Apple): M1 Max de 32 núcleos es la configuración medida; cualquier chip M-series con memoria unificada suficiente es apto, y los chips más recientes (M2/M3/M4 Pro, Max y Ultra) deberían ofrecer mayor ancho de banda y, por tanto, más tokens por segundo, aunque no hay mediciones publicadas para ellos.
- Cabida en hardware de consumo: sí, en Macs con memoria unificada de 16 GB o superior; con 8 GB el modelo entraría muy justo al sumar el sistema operativo y el contexto. En GPU de consumo NVIDIA no es ejecutable con este formato.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.generate`), oMLX (panel de cuantización y ejecución), LM Studio y mlx-swift.
- No hay soporte directo en esta versión para vLLM, TGI, llama.cpp u Ollama: son runtimes orientados a safetensors de PyTorch o a GGUF, no a pesos MLX. El autor dispone de un GGUF del modelo base en otro repositorio, que sería la vía para esos entornos.
- Latencia y throughput: 91,3 tok/s en procesamiento de prompt y 37,1 tok/s en generación, medidos en un M1 Max de 64 GB con 32 núcleos de GPU.
- Aviso de la model card: el comando de ejemplo usa el identificador `RolanDorisTech/Qwen3.8-9B-Distill-oQ5e-MLX-oQ8e`, que no coincide con el identificador de este repositorio; conviene verificar el nombre antes de lanzar la descarga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-oQ5e (este) | ~9B | no disponible | 91,3 tok/s prompt, 37,1 tok/s generación, pico 6,555 GB | Apache 2.0 | HuggingFace, formato MLX |
| Qwen3.8-9B-Distill-oQ4e | ~9B | no disponible | 101,5 tok/s prompt, 43,0 tok/s generación, pico 5,471 GB | Apache 2.0 | HuggingFace, formato MLX |
| Qwen3.8-9B-Distill-oQ6e | ~9B | no disponible | 84,3 tok/s prompt, 33,3 tok/s generación, pico 7,664 GB | Apache 2.0 | HuggingFace, formato MLX |
| Qwen3.8-9B-Distill-oQ8e | ~9B | no disponible | 91,8 tok/s prompt, 28,7 tok/s generación, pico 9,679 GB | Apache 2.0 | HuggingFace, formato MLX |
| empero-ai/Qwen3.8-9B-Distill-GGUF (base) | ~9B | no disponible | no disponible | Apache 2.0 | HuggingFace, formato GGUF |

La comparación con modelos de otras familias y de tamaño similar no está disponible: no se han publicado benchmarks que permitan situar este modelo frente a alternativas de ~9B en razonamiento, código o matemáticas. La única comparación documentada es interna a la familia oQ, y muestra un compromiso claro: cada escalón de bits reduce la velocidad de generación y aumenta el pico de memoria a cambio de menor pérdida respecto a BF16.

## Limitaciones y advertencias
- Modelo destilado de razonamiento: el propio autor advierte de que puede alucinar, con el riesgo añadido de que un modelo entrenado para producir cadenas de pensamiento largas puede generar justificaciones plausibles pero incorrectas.
- Cuantización con pérdida: los pesos son "lossy" respecto al maestro BF16. El autor sostiene que es más preciso que un 4-bit g32 o un 8-bit g64 uniformes, pero no aporta métricas de perplejidad ni de tareas estándar que respalden esa afirmación.
- Solo texto: sin visión, audio ni otras modalidades.
- Exclusivo de Apple Silicon: no puede desplegarse en infraestructura con GPU NVIDIA, AMD o TPU sin convertir previamente a otro formato.
- Longitud de contexto e idiomas soportados no documentados: no se puede planificar un caso de uso que dependa de ventanas largas o de cobertura multilingüe sin verificación previa.
- Ausencia de validación externa: cero descargas y cero "likes" en el momento de redactar la ficha, sin evaluaciones de terceros ni resultados reproducidos de forma independiente.
- Inconsistencias en la model card: el identificador usado en el comando de ejemplo no coincide con el del repositorio, y la entrada del 9B-oQ8e se describe como "this is Qwen3.8-9B-Distill-oQ5e at 6.0GB", lo que mezcla dos variantes distintas. Conviene verificar el artefacto descargado antes de usarlo en producción.
- Licencia: Apache 2.0, que permite uso comercial y modificación, siempre que se conserven los avisos de copyright y atribución. Los créditos de la model card apuntan al modelo base empero-ai/Qwen3.8-9B-Distill-GGUF, también Apache 2.0, por lo que no se identifican restricciones adicionales; aun así, conviene revisar la licencia del modelo base original antes de un despliegue comercial.
- Fechas de la metadata (creación y actualización el 23 de septiembre de 2026) y designación de versión "Qwen3.8": no se ha podido contrastar el linaje exacto de esta nomenclatura con la información proporcionada.

## Enlaces
- Repositorio del modelo: https://huggingface.co/RolanDorisTech/Qwen3.8-9B-Distill-MLX-oQ5e
- Modelo base declarado en la metadata: https://huggingface.co/empero-ai/Qwen3.8-Distill
- Modelo base citado en los créditos (GGUF): https://huggingface.co/empero-ai/Qwen3.8-9B-Distill-GGUF
- Canal del autor: https://www.youtube.com/@RolanDorisTech
- mlx-lm (librería indicada en la model card): https://github.com/ml-explore/mlx-lm
- mlx-swift (runtime compatible según la model card): https://github.com/ml-explore/mlx-swift
- LM Studio (cliente de despliegue mencionado): https://lmstudio.ai
