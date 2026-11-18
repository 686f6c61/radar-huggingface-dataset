# ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-8821-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-8821-3e-compile-ep3 es un ajuste fino (SFT) del modelo ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, que a su vez deriva de la familia Qwen3.5. El autor, ConnorYU, lo publica bajo licencia Apache 2.0 con 9.409.813.744 parametros totales (aproximadamente 9,4 mil millones) en formato safetensors. El pipeline declarado es image-text-to-text, lo que indica que el modelo conserva la capacidad multimodal de la familia base, aunque la model card no detalla el entrenamiento multimodal.

El modelo esta orientado, segun su nombre, a un ajuste fino sobre dominio medico ("Medical-SFT") partiendo de un checkpoint intermedio entrenado con GRPO (optimizacion por politica proximal con recompensa) y evaluacion ifeval, con un modo de razonamiento ("think") activado. El nombre incluye referencias a "tem400" (probablemente temperatura de muestreo), "8821" (posible numero de pasos o muestras) y "ep3" (epoca 3), aunque el autor no documenta el significado exacto de estos sufijos.

La relevancia de esta ficha es limitada pero real: se trata de un modelo muy reciente (creado el 18 de noviembre de 2026) con cero descargas y cero likes, sin documentacion tecnica publicada mas alla de la plantilla autogenerada por Unsloth. Sirve como ejemplo de la cadena de ajustes finos que la comunidad aplica sobre modelos Qwen, pero no debe considerarse un artefacto listo para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`, pipeline image-text-to-text); detalles no disponibles |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. El tag `qwen3_5` y el pipeline `image-text-to-text` sugieren una arquitectura transformer multimodal perteneciente a la familia Qwen3.5, con capacidad de procesar imagen y texto. El repositorio pesa 18,8 GB en safetensors, coherente con un modelo de 9,4 mil millones de parametros en precision de 16 bits (aproximadamente 18,8 GB teoricos).

El entrenamiento documentado es escaso: el autor indica que el modelo es un ajuste fino de ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400, entrenado con Unsloth y la libreria TRL de Hugging Face, con una mejora de velocidad de 2x respecto al entrenamiento estandar. El checkpoint base ya incorpora un entrenamiento con GRPO (aprendizaje por refuerzo con recompensas verificables, orientado a ifeval) y un modo "think" de razonamiento extendido. El presente ajuste se etiqueta como "Medical-SFT", lo que sugiere una fase de supervised fine-tuning sobre datos del dominio medico, pero no se publican ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni hiperparametros, ni si hubo etapas adicionales de alineamiento (DPO, RLHF) tras el SFT.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantillas de chat (`conversational`).
- Razonamiento en modo "think" heredado del checkpoint base (GRPO-ifeval-v0-think), segun el nombre del modelo.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque no se documenta el alcance real de la capacidad visual tras el ajuste.
- Ajuste fino orientado a dominio medico, segun la etiqueta "Medical-SFT" del nombre.
- Compatibilidad con text-generation-inference y endpoints compatibles (tags `text-generation-inference`, `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso ni capacidades de audio.

## Casos de uso

- Prototipado de asistentes clinicos en ingles: el ajuste "Medical-SFT" sugiere que el modelo puede emplearse para generar respuestas sobre terminologia y conceptos medicos, aunque requiere validacion por profesionales antes de cualquier uso real.
- Experimentacion academica con cadenas de ajuste fino: sirve para estudiar el efecto de SFT sobre un checkpoint ya entrenado con GRPO e ifeval, comparando el comportamiento antes y despues del ajuste.
- Investigacion sobre razonamiento en dominios especializados: el modo "think" heredado permite analizar trazas de razonamiento en preguntas medicas y evaluar su coherencia.
- Generacion de resumenes de texto clinico en ingles: el modelo puede procesar documentos largos si el contexto lo permite (longitud no documentada), aunque la falta de datos sobre el contexto limita la planificacion.
- Tareas multimodales de descripcion: al conservar el pipeline image-text-to-text, puede emplearse para describir imagenes medicas o generar texto a partir de figuras, siempre con supervision humana.
- Base para nuevos ajustes finos: al estar en safetensors y con licencia Apache 2.0, es un punto de partida valido para SFT adicional con Unsloth o TRL en dominios concretos.
- Evaluacion comparativa de tecnicas de RL y SFT: util para replicar experimentos sobre GRPO y evaluar la degradacion o mejora de capacidades tras el ajuste medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 10-11 GB; en 4 bits, alrededor de 6-7 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S o RTX 6000 Ada para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion, y potencialmente en RTX 3090/4080 con cuantizacion de 4 bits, aunque no se han publicado pesos GGUF en el repositorio.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), endpoints compatibles; vLLM, llama.cpp u Ollama no estan confirmados por el autor y requeririan conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-8821-3e-compile-ep3 | 9,41 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino comunitario sin benchmarks |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400 (modelo base) | no disponible | no disponible | no disponible | Hugging Face | Checkpoint previo con GRPO e ifeval; sin documentacion publica |
| Familia Qwen3.5 oficial (variantes de ~9B) | no disponible | no disponible | no disponible | Hugging Face | Modelos originales de referencia de la familia; no se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria (mismo tamano o misma tarea) mas alla del propio linaje del modelo.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican datos de entrenamiento, hiperparametros, composicion del dataset medico ni evaluaciones.
- Riesgo elevado de alucinacion en dominio medico: un SFT sobre datos no documentados puede producir respuestas plausibles pero incorrectas; no debe usarse en contextos clinicos sin validacion profesional.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos demograficos, culturales o linguisticos.
- Soporte limitado de idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin medirla empiricamente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad recae en el integrador.
- Modelo sin traccion: cero descargas y cero likes en el momento de la ficha, lo que reduce la probabilidad de que existan issues resueltos o validaciones de terceros.
- El pipeline image-text-to-text no garantiza que la capacidad visual haya sido preservada o entrenada durante el SFT medico; conviene verificarlo antes de usarla.
- Los sufijos del nombre ("tem400", "8821", "ep3") no estan explicados, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem400-Medical-SFT-8821-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step400
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Hugging Face TRL: https://github.com/huggingface/trl
