# EInnovator/pra-qwen2-5-1-5b-instruct

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un *PRA Runtime Bundle* para el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Desarrollado por EInnovator, empaqueta el mapeo estructural de *Progressive Retrieval Attention* (PRA), perfiles de ejecución, componentes aprendidos opcionales, metadatos de compatibilidad y evidencia de calificación. PRA es una técnica de atención de recuperación progresiva diseñada para mejorar el manejo de contextos largos sin necesidad de un ajuste fino completo de los pesos del modelo base.

El bundle se publica bajo licencia Apache 2.0 y está pensado para el motor `hf` (Hugging Face Transformers), con un perfil recomendado `BALANCED` en modo `Selected Context`. Incluye un router aprendido opcional de 393.216 parámetros, entrenado sobre los conjuntos QASPER y HotpotQA, que mejora las métricas de recuperación de contexto en comparación con un router genérico, aunque con limitaciones de generalización. Es relevante porque permite extender la capacidad de contexto de un modelo pequeño (1.5B) de forma ligera y reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (base) + router PRA (combinador dense d128) |
| Parametros totales | 1.54B (modelo base) + 393.216 (router aprendido) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 128K tokens (modelo base Qwen2.5) |
| Tipos de cuantizacion | bfloat16 (bundle); otras cuantizaciones no disponibles |
| Idiomas soportados | multilingue (modelo base Qwen2.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (bundle de metadatos; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El bundle se basa en `Qwen2ForCausalLM` con 1.5B parámetros y tokenizer en la revisión inmutable `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`. PRA introduce un mecanismo de atención progresiva que selecciona dinámicamente qué partes del contexto recuperar, reduciendo el coste computacional frente a la atención completa. El router aprendido es un combinador denso con 128 dimensiones ocultas, entrenado con el método *multi-positive softmax* sobre 48 ejemplos de entrenamiento (QASPER y HotpotQA), 16 de validación y 16 de prueba, con semillas `[11, 23, 37, 53, 71]` y selección por máxima AUC0-30 combinada en validación. El bundle no incluye los pesos del modelo base ni es un fine-tune LoRA ordinario.

Los perfiles disponibles son `QUALITY`, `BALANCED`, `ECONOMY` y `QASPER-LEARNED`. Solo `BALANCED` está calificado como predeterminado; los demás están en estado `CALIBRATION_PENDING` o `RESEARCH`. El motor `hf` está validado para el modo `Selected Context`; el motor `mlx` es portable pero no está medido para cuantización MLX.

## Capacidades

- Mejora de la recuperación de contexto en tareas de lectura de documentos largos mediante *Progressive Retrieval Attention*.
- Router aprendido opcional que incrementa la precisión de recuperación (R@20%) en QASPER y HotpotQA frente al router genérico.
- Perfiles de ejecución configurables (`BALANCED`, `QUALITY`, `ECONOMY`, `QASPER-LEARNED`) para ajustar el equilibrio entre calidad y coste.
- Integración con el motor Hugging Face (`hf`) mediante la librería `pra-hf`.
- Compatibilidad declarada con el motor `mlx` para despliegue en Apple Silicon (sin mediciones de rendimiento).
- No es un modelo de generación autónomo: requiere el modelo base `Qwen/Qwen2.5-1.5B-Instruct` para funcionar.

## Casos de uso

- **Preguntas-respuesta sobre documentos largos**: el bundle permite procesar corpus extensos (hasta 128K tokens) seleccionando dinámicamente las secciones relevantes, adecuado para tareas tipo QASPER.
- **Recuperación de información en bases de conocimiento**: aplicable a sistemas RAG donde el contexto supera la ventana estándar y se necesita priorizar fragmentos relevantes.
- **Análisis de contratos o informes técnicos**: con el perfil `BALANCED` se puede extraer información específica de documentos legales o técnicos sin procesar todo el texto completo.
- **Asistentes conversacionales con memoria extendida**: integrado con el modelo base, permite mantener conversaciones de múltiples turnos con historial largo sin degradar la calidad de respuesta.
- **Evaluación comparativa de técnicas de atención**: el bundle sirve como referencia para investigar el impacto de PRA frente a atención completa en modelos pequeños.
- **Despliegue en entornos con recursos limitados**: al ser un adapter ligero (393K parámetros) sobre un modelo de 1.5B, cabe en GPUs de consumo y permite experimentación rápida con contextos largos.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados son diagnósticos de routing (R@20%), no métricas de calidad end-task. Se presentan tal cual aparecen en la model card:

| Dataset | Router/perfil | R@20% | Cohorte | Evidencia |
|---|---:|---:|---|
| qasper | balanced | 0.2897 | 8 | CONTROLLED |
| qasper | qasper-learned | 0.4245 | 8 | CONTROLLED |
| hotpotqa | balanced | 0.4146 | 8 | CONTROLLED |
| hotpotqa | qasper-learned | 0.5021 | 8 | CONTROLLED |
| combined | balanced | 0.3521 | 16 | CONTROLLED |
| combined | qasper-learned | 0.4633 | 16 | CONTROLLED |

Estos valores miden la capacidad del router para seleccionar el 20% del contexto más relevante. No hay resultados de benchmarks end-task (MMLU, HumanEval, GSM8K, etc.) para el bundle completo. La model card advierte explícitamente que estos diagnósticos no deben interpretarse como calidad de aplicación.

## Requisitos de hardware

- **VRAM estimada**: el modelo base de 1.5B en bfloat16 requiere aproximadamente 3 GB de VRAM para inferencia; el router PRA añade menos de 1 MB adicional.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1660, RTX 3060, RTX 4090, o GPUs de datacenter como A10 o A100.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs consumer de gama media y baja.
- **Opciones de despliegue**: motor `hf` validado (Transformers); motor `mlx` portable para Apple Silicon; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI en la model card.
- **Latencia y throughput**: no disponibles. La model card indica que el servicio nativo (`Native Serving`) no está medido para el motor `hf`.

## Comparativa con modelos similares

No se han publicado comparativas directas de este bundle con otras técnicas de extensión de contexto (p. ej., LongLoRA, StreamingLLM, o el propio Qwen2.5 sin PRA). La model card solo compara internamente el router genérico frente al router aprendido. Por tanto, la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- El bundle no contiene los pesos del modelo base; requiere descargar `Qwen/Qwen2.5-1.5B-Instruct` por separado.
- No hay resultados de calidad end-task emparejados para esta identidad exacta; los diagnósticos de routing no equivalen a rendimiento de generación.
- El router aprendido mejora QASPER pero no es uniformemente positivo en HotpotQA; está marcado como opt-in y no es el perfil predeterminado.
- Los conjuntos de validación y prueba son muy pequeños (8-16 ejemplos), lo que limita la fiabilidad estadística de las métricas.
- La calificación solo es válida para la revisión exacta del modelo base, el motor `hf` y la cuantización bfloat16; no se transfiere a otros checkpoints, motores o cuantizaciones.
- Los perfiles `QUALITY` y `ECONOMY` están pendientes de calibración; no se recomienda su uso en producción.
- Las licencias del modelo base y de los datasets se aplican por separado al artefacto del router.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/EInnovator/pra-qwen2-5-1-5b-instruct)
- [Modelo base Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Documentación PRA](https://einnovator.github.io/pdattention/)
- [Repositorio fuente PRA](https://github.com/einnovator/pdattention)
- [Issues PRA](https://github.com/einnovator/pdattention/issues)
- [Guía de contribución PRA](https://github.com/einnovator/pdattention/blob/main/CONTRIBUTING.md)
