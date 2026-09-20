# GLASSEYE/quill-poetry-v1

## Resumen

Quill poetry v1 es un adaptador LoRA (PEFT) publicado por GLASSEYE (Johnny Watters / cyberviser, 0AI) sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3. Su propósito declarado es actuar como asistente de escritura poética con enfoque "local-first": el autor indica que el ajuste fino se realizó exclusivamente en una GPU local RTX 5070, sin uso de GPUs en la nube. El repositorio ocupa aproximadamente 0,1 GB y contiene únicamente los pesos del adaptador, no un modelo completo.

El modelo cubre formas poéticas cerradas y libres —haiku, soneto, villanelle, ghazal, limerick, verso libre— además de "constrained prompts" y notas ligeras de oficio o revisión. Al ser un adaptador, no modifica la arquitectura subyacente: hereda del modelo base un transformer decoder-only de aproximadamente 7 250 millones de parámetros con ventana de contexto de 32 768 tokens, atención con ventana deslizante, GQA y tokenizador de 32 768 entradas.

La relevancia del artefacto es acotada y conviene ser explícito: se publicó con licencia Apache 2.0, sin métricas de evaluación, sin descripción del dataset de entrenamiento y con cero descargas y cero "likes" en el momento de redactar esta ficha. Es, por tanto, un experimento reproducible de bajo coste para creación literaria asistida en local, no una herramienta validada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base mistralai/Mistral-7B-Instruct-v0.3 |
| Parámetros totales | Aproximadamente 7 250 millones en el modelo base; el adaptador añade un número de parámetros no especificado (repositorio de ~0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens heredados de la configuración del modelo base; no verificado específicamente para el adaptador |
| Tipos de cuantización | No disponible en la model card. El adaptador se distribuye en safetensors; el modelo fusionado admite cuantizaciones GGUF, AWQ o GPTQ generadas por el usuario |
| Idiomas soportados | No disponible. La model card está en inglés y no documenta el idioma del corpus de ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en Mistral-7B-Instruct-v0.3, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE), atención con ventana deslizante de 4096 tokens y atención de consultas agrupadas (GQA) con 32 cabezas de consulta y 8 cabezas de clave/valor. El tokenizador de esta versión amplía el vocabulario a 32 768 entradas y habilita una ventana de contexto de 32 768 tokens. Los detalles del preentrenamiento del modelo base no están publicados por Mistral AI y no se reproducen aquí.

Sobre el proceso de ajuste del adaptador, la información disponible es mínima: la model card únicamente afirma que el fine-tuning se ejecutó en una RTX 5070 local, sin GPUs en la nube, y que el objetivo es la escritura poética. No se documentan el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la tasa de aprendizaje, las épocas ni si hubo etapas de RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras). Cualquier afirmación sobre el corpus o la metodología sería especulativa.

## Capacidades

- Generación de poesía en formas cerradas: haiku, soneto, villanelle, ghazal y limerick, según la descripción del autor.
- Verso libre y escritura creativa sin restricción métrica fija.
- Respuesta a "constrained prompts", es decir, consignas con restricciones explícitas de forma, rima, métrica o tema.
- Notas ligeras de oficio y revisión de borradores poéticos.
- Herencia de las capacidades del modelo base: seguimiento de instrucciones conversacionales multi-turno y ventana de contexto larga.
- Soporte de function calling: disponible en Mistral-7B-Instruct-v0.3, pero no evaluado ni documentado para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Capacidades multilingües: no documentadas; el idioma del corpus de ajuste es desconocido.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.

## Casos de uso

- Asistente poético local y privado: el adaptador se carga sobre Mistral-7B-Instruct-v0.3 en una GPU de consumo y opera sin conexión, de modo que los borradores del autor no salen del equipo. Es el escenario coherente con el enfoque "local-first" declarado por el autor.
- Generación de sonetos y villanelles con restricciones formales: se usa mediante consignas que fijan esquema de rima, número de sílabas y estructura estrófica, aprovechando el soporte de constrained prompts.
- Talleres literarios y enseñanza de métrica: el modelo puede producir ejemplos de cada forma poética y notas de revisión sobre un borrador aportado por el alumno, siempre con verificación humana posterior.
- Prototipado de aplicaciones creativas: integración del adaptador mediante PEFT y transformers o como adaptador LoRA servido en vLLM, para construir demos de generación poética con coste de infraestructura bajo.
- Generación de variantes estilísticas para edición: producir varias versiones de un mismo poema con cambios de tono, registro o forma, para que el editor seleccione y refine.
- Contenido poético para videojuegos, rol de mesa o narrativa interactiva: textos breves con forma fija (haikus, limericks, epitafios) insertables como elementos diegéticos en mundos de ficción.
- Aumento de corpus sintético para investigación en generación creativa: producir borradores etiquetados por forma poética para tareas de clasificación o evaluación automática, con la advertencia de que la calidad no está validada.
- Experimentación educativa en fine-tuning: sirve como caso de estudio reproducible de un LoRA entrenado en una única GPU de consumo, con un repositorio de ~0,1 GB fácil de inspeccionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas automáticas (MMLU, GSM8K, HumanEval ni evaluaciones específicas de generación creativa), ni evaluaciones humanas de calidad poética, rima o métrica. Tampoco hay comparaciones con otros adaptadores de la misma categoría.

## Requisitos de hardware

- Adaptador LoRA: ~0,1 GB en disco. Requiere el modelo base por separado.
- Inferencia del modelo base en bf16/fp16: aproximadamente 14,5 GB solo de pesos, más caché KV y overhead; en la práctica requiere del orden de 16-18 GB de VRAM. GPUs adecuadas: A100 40 GB, H100, L40S, RTX 4090 (24 GB), RTX A6000.
- Inferencia en 8 bits: en torno a 8 GB de pesos; viable en RTX 4080/4090 y GPUs de 12-16 GB con contexto moderado.
- Inferencia en 4 bits (por ejemplo GGUF Q4_K_M, ~4,4 GB): encaja en GPUs de consumo de 8-12 GB, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o la propia RTX 5070 de 12 GB usada para el entrenamiento.
- Entrenamiento del adaptador: posible en una única GPU de consumo de 12 GB, como indica el autor; con Unsloth, QLoRA o PEFT en 4 bits el margen es mayor.
- Opciones de despliegue: transformers + peft para cargar el adaptador sin fusionar; vLLM admite adaptadores LoRA en servicio; llama.cpp, Ollama y TGI requieren fusionar previamente el adaptador con el modelo base y, en el caso de llama.cpp y Ollama, convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

No se ha identificado en la información disponible ningún otro adaptador de poesía directamente comparable. La tabla compara el adaptador con su modelo base y con dos plataformas alternativas habituales para construir adaptadores de escritura creativa.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLASSEYE/quill-poetry-v1 | Adaptador LoRA sobre Mistral-7B-Instruct-v0.3 | ~7,25 mm en el base + adaptador no cuantificado | 32 768 tokens (heredado) | Apache 2.0 | HuggingFace, 0 descargas y 0 likes |
| mistralai/Mistral-7B-Instruct-v0.3 | Modelo instruct completo | ~7,25 mm | 32 768 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-3.1-8B-Instruct | Modelo instruct completo | ~8,03 mm | 128 000 tokens | Licencia comunitaria Llama 3.1 | HuggingFace, con registro previo |
| Qwen/Qwen2.5-7B-Instruct | Modelo instruct completo | ~7,61 mm | 128 000 tokens | Apache 2.0 | HuggingFace |

Las tres alternativas son modelos base o instruct generalistas, no adaptadores poéticos: se incluyen como referencia de plataforma, no como sustitutos funcionales. El rendimiento comparado en tareas de generación poética es no disponible en todos los casos.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks automáticos ni valoraciones humanas de calidad poética, rima o métrica. El rendimiento real es desconocido.
- Trazabilidad del entrenamiento incompleta: no se documentan dataset, número de tokens, hiperparámetros del LoRA, épocas ni criterios de selección de checkpoints.
- Validación comunitaria nula: cero descargas y cero likes en el momento de redactar la ficha, lo que impide contrastar resultados con otros usuarios.
- Idiomas no declarados: se desconoce el idioma del corpus de ajuste. Aunque el modelo base maneja con solvencia el inglés y tiene capacidades multilingües limitadas, la calidad en castellano no está verificada y es probable que la métrica y la rima en español sean defectuosas.
- Riesgo de alucinación en las notas de oficio: las observaciones de métrica, rima o análisis literario pueden sonar plausibles y ser incorrectas; requieren revisión humana.
- Sesgos heredados del modelo base: Mistral-7B-Instruct-v0.3 arrastra sesgos de su corpus de preentrenamiento, y el ajuste fino sobre poesía puede reforzar registros, temáticas o voces concretas del corpus utilizado, que no se ha hecho público.
- Un adaptador LoRA no añade conocimiento factual: solo modula el estilo y la distribución de salida del modelo base, por lo que las limitaciones de conocimiento de Mistral-7B se mantienen intactas.
- Contexto no verificado para el adaptador: los 32 768 tokens proceden de la configuración del modelo base; no hay evidencia de que el adaptador mantenga calidad en ventanas muy largas.
- Licencia: el adaptador es Apache 2.0 y el modelo base también, por lo que el uso comercial es posible sin restricciones adicionales conocidas. Aun así, conviene revisar los términos vigentes de Mistral AI antes de un despliegue en producción.
- Artefacto muy reciente y sin mantenimiento declarado: las fechas de creación y actualización del repositorio son prácticamente idénticas y no hay historial de versiones ni issues que permitan juzgar su evolución.
- El repositorio no incluye el modelo completo: cualquier despliegue exige descargar aparte Mistral-7B-Instruct-v0.3 y gestionar la fusión o la carga del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GLASSEYE/quill-poetry-v1
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Documentación de PEFT: https://huggingface.co/docs/peft
- Repositorio de PEFT: https://github.com/huggingface/peft
- Búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo. Los resultados devueltos corresponden al sistema de gestión de clubes de caza PZŁ 2.0 (pzlow.pl) y no guardan relación con el modelo.
