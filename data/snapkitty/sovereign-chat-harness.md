# Snapkitty/sovereign-chat-harness

## Resumen

SnapKitty Sovereign Chat Harness es un sistema de verificación formal (harness) que envuelve un modelo de lenguaje local para filtrar cada respuesta a través de cinco puertas de control (P1-P5) antes de mostrarla al usuario. Desarrollado por Snapkitty, su objetivo declarado es reducir las alucinaciones mediante comprobaciones de coherencia, recuperación de respuestas de baja señal y sellado de auditoría con hash WORM. El modelo subyacente es un GGUF cuantizado Q4_K_M denominado `snapkitty-merged`, que se ejecuta localmente con Ollama o en la nube mediante Hugging Face Inference. No se especifican la arquitectura, el número de parámetros ni la longitud de contexto del modelo base, por lo que estos datos no están disponibles. El proyecto se presenta como una solución de "IA soberana" con énfasis en la reproducibilidad y la auditoría, aunque la documentación pública es escasa y mezcla terminología técnica con conceptos no estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun metadatos de HuggingFace); la model card menciona BSL-1.1 / AGPL-3.0 / MPL-2.0 con "Patent Pending" |
| Formato de pesos | GGUF (para Ollama), safetensors (para HF Inference, no confirmado) |

## Arquitectura y entrenamiento

El sistema no es un modelo de lenguaje entrenado desde cero, sino un "harness" de verificación que se acopla a un LLM externo (cualquier modelo compatible con Ollama o Hugging Face Inference). El flujo de procesamiento aplica cinco puertas secuenciales: P1 verifica la coherencia del prompt mediante una métrica denominada MetaSum; P2 verifica la coherencia de la respuesta generada; P3 aplica un mecanismo de recuperación llamado "Dream Cycle" para respuestas con baja señal; P4 comprueba una invariante de entropía conjunta (H ≤ 0.20) basada en un límite de Weyl; y P5 genera un recibo WORM SHA-256 para auditoría. No se proporcionan detalles sobre el entrenamiento del modelo base, el número de tokens, la composición del dataset ni el uso de RLHF/DPO. La documentación menciona "SovMonster / Lean proof" como verificación formal, pero no se aportan especificaciones técnicas concretas.

## Capacidades

- Verificación formal de respuestas mediante cinco puertas de control (P1-P5) que bloquean o explican respuestas que no superan los umbrales de coherencia.
- Detección de alucinaciones basada en una métrica de coherencia (MetaSum) y un invariante de entropía.
- Recuperación de respuestas de baja señal mediante el mecanismo "Dream Cycle".
- Auditoría reproducible: cada respuesta genera un recibo WORM SHA-256 para trazabilidad.
- Ejecución local con Ollama (cualquier modelo GGUF) o en la nube con Hugging Face Inference.
- Interfaz Gradio para interacción (app.py).
- Soporte para despliegue en Docker con GPU (RTX 3080, 8 GB VRAM).

## Casos de uso

- Chat corporativo con auditoría: el harness puede integrarse en un asistente interno donde cada respuesta quede registrada con un hash WORM, útil para cumplimiento normativo o revisión legal.
- Investigación en detección de alucinaciones: el sistema permite estudiar cómo las métricas de coherencia (MetaSum, entropía) se comportan ante distintos modelos y prompts, sirviendo como banco de pruebas.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse con Ollama y un GGUF local, no se envían datos a la nube, adecuado para organizaciones con políticas estrictas de datos.
- Evaluación de modelos: se puede conectar cualquier modelo compatible con Ollama y comparar sus respuestas bajo las mismas puertas de verificación, generando un informe de coherencia.
- Prototipado de sistemas de guardrails: el diseño modular de las puertas P1-P5 puede servir como referencia para implementar filtros de seguridad en otros pipelines de LLM.
- Documentación de decisiones automatizadas: el recibo WORM permite reconstruir el historial de respuestas y sus verificaciones, útil para auditorías externas o depuración de fallos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El único dato de rendimiento mencionado es que el sistema funciona en una RTX 3080 con 8 GB de VRAM, pero no se especifican latencias ni throughput.

## Requisitos de hardware

- VRAM estimada: 8 GB (según la documentación, funciona en una RTX 3080 con 8 GB).
- GPU recomendada: RTX 3080 o similar con al menos 8 GB de VRAM para el modelo GGUF Q4_K_M.
- Compatible con GPUs de consumo: sí, siempre que tengan al menos 8 GB de VRAM.
- Opciones de despliegue: Ollama (local), Hugging Face Inference (nube), Docker con soporte GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado sistemas comparables en la información proporcionada. El harness no es un modelo de lenguaje en sí, sino un sistema de verificación que envuelve a un LLM, por lo que no se puede comparar directamente con modelos como Llama, Mistral o Qwen.

## Limitaciones y advertencias

- La documentación es confusa y mezcla conceptos técnicos no estándar (MetaSum, Dream Cycle, Weyl bound) sin definiciones rigurosas ni referencias académicas.
- No se especifica la arquitectura, el tamaño ni el entrenamiento del modelo base, lo que impide evaluar su calidad real.
- La licencia es contradictoria: los metadatos de HuggingFace indican apache-2.0, pero la model card menciona BSL-1.1 / AGPL-3.0 / MPL-2.0 con "Patent Pending". Esto genera incertidumbre legal para uso comercial.
- No hay evidencia empírica de que el sistema "no alucine" como afirma el lema. Los umbrales de coherencia (τ = 512, H ≤ 0.20) no están validados con benchmarks públicos.
- El proyecto parece estar en una fase temprana (0 descargas, 0 likes, creado en septiembre de 2026) y no hay comunidad ni soporte documentado.
- La dependencia de Ollama y de un modelo GGUF específico (`snapkitty-merged`) limita la portabilidad; no se indica si este modelo está disponible públicamente.
- Riesgo de alucinación: aunque el harness filtra respuestas, no se ha demostrado que las métricas de coherencia sean eficaces contra todo tipo de alucinaciones.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/sovereign-chat-harness
- GitHub (repositorio del proyecto): https://github.com/SNAPKITTYWEST/sovereign-harness
- Sitio web del proyecto: https://snapkittywest.github.io/sovereign-harness/
