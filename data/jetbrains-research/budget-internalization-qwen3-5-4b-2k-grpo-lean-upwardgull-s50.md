# JetBrains-Research/budget-internalization-qwen3.5-4b-2k-grpo-lean-upwardgull-s50

## Resumen

El modelo `budget-internalization-qwen3.5-4b-2k-grpo-lean-upwardgull-s50` es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a la demostración formal de teoremas en Lean 4. Se entrenó con GRPO sobre el conjunto Lean Workbook bajo un presupuesto de generación fijo de 2.048 tokens, dentro de la línea de investigación que el autor denomina "internalización de presupuesto": la idea de que el modelo aprenda a resolver la tarea dentro de un límite de tokens predefinido, en lugar de gastar cómputo en tiempo de inferencia con cadenas de razonamiento más largas.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones), pesos en BF16 y una ventana de contexto que no se especifica en la información disponible. Es un checkpoint intermedio (paso 50) de un run de investigación identificado con el nombre en clave `upwardgull`, publicado como artefacto reproducible asociado a un artículo académico. La relevancia actual reside en que explora una alternativa al escalado en tiempo de test: en lugar de dejar que el modelo razone más tokens en inferencia, se le entrena para que sea preciso con un presupuesto acotado, lo que reduce coste y latencia en producción.

Se trata de un modelo de nicho, no de un asistente generalista: su pipeline declarado es `image-text-to-text` (heredado de la familia Qwen3.5), pero su entrenamiento se centra exclusivamente en la generación de pruebas formales Lean 4. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal image-text-to-text segun pipeline declarado |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), compatible con transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros con capacidades multimodales de entrada imagen-texto según el pipeline declarado. Sobre esa base se aplicó un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El entrenamiento usó Adam con tasa de aprendizaje constante de 1e-06, 10 pasos de warmup, lotes de 32 prompts con 8 rollouts por paso y un máximo de 5 épocas sobre Lean Workbook (enunciados formales en Lean 4). El checkpoint publicado corresponde al paso 50.

La innovación central es el presupuesto de generación fijo: `max_new_tokens` se fijó en 2.048 durante el entrenamiento, y la recompensa es binaria, basada en si el comprobador de Lean 4 acepta la prueba generada. Esto entrena al modelo para internalizar el límite de tokens como restricción de política, en lugar de depender de decodificación especulativa o de presupuestos variables en inferencia. No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset más allá de Lean Workbook, ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generación de pruebas formales en Lean 4: la tarea principal para la que fue entrenado, con recompensa basada en la aceptación por el comprobador Lean.
- Razonamiento matemático formal: traducción de enunciados de teoremas a tácticas y términos de prueba válidos en Lean 4.
- Razonamiento dentro de presupuesto: entrenado explícitamente para operar con un límite de 2.048 tokens de generación.
- Procesamiento image-text-to-text: capacidad heredada del pipeline declarado del modelo base, aunque no se documenta su conservación tras el ajuste fino.
- Conversación: etiqueta `conversational` presente en los metadatos; los prompts se renderizan con la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; los idiomas no están declarados.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Demostración formal de teoremas en Lean 4: el modelo recibe un enunciado formal y genera una prueba que se valida con el comprobador Lean; es su caso de uso nativo y el único documentado por el autor.
- Investigación en aprendizaje por refuerzo con presupuesto fijo: sirve como checkpoint de referencia para reproducir o comparar experimentos de internalización de presupuesto con GRPO sobre Lean Workbook.
- Evaluación de la relación entre escalado en tiempo de test y precisión dentro de presupuesto: permite medir si un modelo pequeño entrenado con límite fijo iguala a modelos que gastan más tokens en inferencia.
- Generación asistida de tácticas en pipelines de verificación formal: integrable en flujos de CI que compilan y comprueban pruebas Lean, usando el comprobador como filtro de aceptación.
- Estudio de la transferencia de capacidades multimodales tras RL: al conservar el pipeline image-text-to-text del base, permite analizar si el ajuste fino específico degrada o preserva dichas capacidades.
- Base para ajustes posteriores en dominios formales: punto de partida para experimentos con otros conjuntos de teoremas o presupuestos de tokens distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (coincide con el tamaño del repositorio), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16 GB de VRAM en BF16.
- Cuantización: no se publican variantes GGUF ni cuantizadas; la conversión a 8 bits o 4 bits requeriría realizarla por cuenta propia, con la consiguiente pérdida potencial de precisión en la generación de pruebas formales.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con concurrencia; una RTX 4090 (24 GB) es suficiente para inferencia en BF16 de una sola instancia.
- GPU de consumo: cabe en tarjetas con 16 GB o más en BF16; en 8 bits podría caber en 12 GB, aunque no hay artefactos oficiales.
- Opciones de despliegue: transformers (librería declarada), vLLM o TGI para servir en BF16; llama.cpp u Ollama requerirían conversión manual a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El presupuesto fijo de 2.048 tokens acota el coste máximo por generación, lo que facilita la planificación de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-2k-grpo-lean-upwardgull-s50 | 4.539.265.536 | no disponible | GRPO sobre Lean Workbook, presupuesto 2.048 tokens | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B | ~4,5 mil millones (no confirmado) | no disponible | Preentrenamiento y alineamiento general del autor original | no disponible | Hugging Face |
| Otros checkpoints de la misma línea de investigación | no disponible | no disponible | Variantes de presupuesto y algoritmo | Apache 2.0 (heredada) | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente para demostración formal en Lean 4; su rendimiento en tareas generales de texto o código no está documentado y probablemente sea inferior al del modelo base.
- Checkpoint intermedio: corresponde al paso 50 de un run de investigación, no a una versión final pulida para producción.
- Riesgo de alucinación: en generación de pruebas formales, el modelo puede producir tácticas o términos sintácticamente inválidos; el comprobador Lean 4 es imprescindible como filtro.
- Idiomas: no se declaran idiomas soportados; no hay garantía de comportamiento multilingüe.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar tareas con enunciados largos.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-4B; conviene verificar las condiciones de dicho base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al base ni frente a alternativas.
- Sesgos: no documentados por el autor; al derivar de un modelo generalista, puede heredar sesgos del preentrenamiento.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin citación definida (el campo de cita está marcado como TODO).

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-2k-grpo-lean-upwardgull-s50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización: https://huggingface.co/JetBrains-Research
- Artículo de referencia: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (sin enlace disponible en la información proporcionada)
