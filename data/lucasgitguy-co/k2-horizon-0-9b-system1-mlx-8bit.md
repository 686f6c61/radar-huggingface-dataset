# Lucasgitguy-co/K2-Horizon-0.9B-System1-MLX-8bit

## Resumen

K2-Horizon-0.9B-System1-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo K2-Horizon-0.9B-System1, publicado por el usuario Lucasgitguy-co. El modelo base es un ajuste fino "System 1" (sin bloque de razonamiento previo) del modelo IFM/K2-Horizon-0.9B, de arquitectura tipo Llama. El objetivo es ofrecer respuestas directas, sin la generación de un bloque de pensamiento extenso antes de contestar, lo que reduce la latencia y el número de tokens generados en tareas conversacionales.

El modelo cuenta con aproximadamente 1.078 millones de parámetros (1,08 mil millones) y un tamaño de repositorio de 1,1 GB en su variante de 8 bits. Está pensado para ejecutarse en Apple Silicon mediante la librería mlx-lm, lo que lo hace adecuado para prototipado local, experimentación en portátiles Mac y despliegues de baja latencia en entornos con recursos limitados.

La relevancia de esta ficha radica en que se trata de una variante cuantizada de un modelo muy pequeño, con licencia Apache-2.0 y soporte de contexto extendido mediante YaRN RoPE ×16 sobre una ventana original de 8K. No obstante, la información pública disponible es muy escasa: no hay datos de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (modelo denso) |
| Parámetros totales | 1.078.285.824 (≈1,08 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K originales, extendida a 128K mediante YaRN RoPE ×16 (según model card) |
| Tipos de cuantización | 8 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 8-bit) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa con forma de Llama, según indica la model card, y se carga en mlx-lm con el tipo de modelo `llama`. La variante aquí descrita es una cuantización a 8 bits del modelo base K2-Horizon-0.9B-System1, que a su vez es un fine-tune "System 1" de IFM/K2-Horizon-0.9B: en lugar de generar un bloque de razonamiento largo antes de responder, el modelo contesta directamente. La model card menciona que el modo de pensamiento completo se puede activar pasando `reasoning_effort="high"` en `apply_chat_template`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el fine-tune. La innovación técnica destacable es el uso de YaRN RoPE con factor de escala ×16 para extender el contexto desde los 8K originales, así como la verificación por parte del autor de que las respuestas greedy a 5 prompts de prueba coinciden con el modelo en bf16, con una deriva leve en la redacción en la variante de 4 bits.

## Capacidades

- Generación de texto conversacional con respuestas directas (modo "System 1", sin bloque de pensamiento por defecto).
- Modo de razonamiento completo activable mediante `reasoning_effort="high"` en la plantilla de chat.
- Razonamiento aritmético básico (la model card incluye el ejemplo "What is 17*23?").
- Soporte de plantilla de chat para conversaciones multi-turno.
- Contexto extendido a 128K mediante YaRN RoPE ×16, útil para entradas largas.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el modo de pensamiento completo podría habilitarlo parcialmente, pero no se documenta.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo se ejecuta con mlx-lm en Macs con memoria unificada, gracias a su tamaño de 1,1 GB en 8 bits, lo que permite mantener conversaciones multi-turno sin conexión a internet.
- Prototipado rápido de chatbots: al responder de forma directa sin bloque de pensamiento, reduce la latencia y el consumo de tokens en comparación con variantes "thinking", lo que acelera iteraciones de desarrollo.
- Cálculo y razonamiento aritmético sencillo: la model card demuestra su uso para resolver operaciones como 17×23, adecuado para asistentes de productividad personal.
- Procesamiento de documentos largos: con el contexto extendido a 128K mediante YaRN, puede resumir o extraer información de textos extensos en una sola pasada, aunque la calidad en contextos muy largos no está documentada.
- Educación y tutoría básica: puede generar explicaciones y respuestas directas en entornos educativos con recursos de hardware limitados.
- Experimentación académica con cuantización MLX: sirve como banco de pruebas para comparar el comportamiento de un modelo de 1B en 8 bits frente a bf16, tal como el autor verificó con 5 prompts.
- Despliegue en pipelines de generación de texto de baja latencia: integrable mediante la API de mlx-lm en scripts de Python para tareas de generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para los pesos en 8 bits, más overhead de activaciones y caché KV; en la práctica, unos 2-3 GB de memoria unificada para contexto moderado.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) con memoria unificada; el formato MLX está optimizado para estos chips.
- Cabe en GPU consumer: sí, en cualquier Mac con al menos 8 GB de memoria unificada; no está pensado para GPUs NVIDIA/AMD en este formato.
- Opciones de despliegue: mlx-lm (librería oficial), con comandos `mlx_lm.generate` y API Python `load`/`generate`.
- Latencia y throughput estimados: no disponibles; el autor no publica métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-0.9B-System1-MLX-8bit | ≈1,08 B | 8K (128K con YaRN) | Apache-2.0 | MLX 8-bit | Hugging Face |
| K2-Horizon-0.9B-System1 (bf16) | ≈1,08 B | 8K (128K con YaRN) | Apache-2.0 | safetensors bf16 | Hugging Face |
| IFM/K2-Horizon-0.9B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la verificación cualitativa del autor sobre 5 prompts.

## Limitaciones y advertencias

- Información pública muy limitada: no hay benchmarks, idiomas declarados ni detalles del dataset de entrenamiento, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación: al ser un modelo de 1B parámetros, la precisión factual en tareas complejas es limitada y puede inventar datos.
- Sesgos conocidos: no documentados; al no especificarse la composición del corpus, no se puede evaluar el sesgo.
- Limitaciones de contexto: la extensión a 128K mediante YaRN puede degradar la calidad en ventanas muy largas; no hay evaluación publicada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base IFM/K2-Horizon-0.9B, que no se detalla en la información disponible.
- Formato específico: al estar en MLX, no es directamente compatible con vLLM, llama.cpp o TGI; requiere Apple Silicon o conversión adicional.
- Modo "System 1": al omitir el bloque de pensamiento, puede fallar en tareas que requieren razonamiento multi-paso; el modo `reasoning_effort="high"` mitiga parcialmente esto, pero no está evaluado.
- Madurez: el repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1-MLX-8bit
- Modelo base (System1): https://huggingface.co/Lucasgitguy-co/K2-Horizon-0.9B-System1
- Modelo original: https://huggingface.co/IFM/K2-Horizon-0.9B
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
