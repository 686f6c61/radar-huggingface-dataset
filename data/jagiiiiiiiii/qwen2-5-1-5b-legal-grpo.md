# Jagiiiiiiiii/qwen2.5-1.5b-legal-grpo

## Resumen

Jagiiiiiiiii/qwen2.5-1.5b-legal-grpo es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B orientado al dominio legal, desarrollado por el usuario Jagiiiiiiiii. El modelo parte de un checkpoint intermedio denominado Jagiiiiiiiii/qwen2.5-1.5b-legal-sft (supervised fine-tuning) y aplica sobre el mismo una etapa de GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo con preferencias que se usa habitualmente para alinear respuestas sin necesidad de un modelo de recompensa separado. El resultado es un modelo de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) publicado en formato safetensors y compatible con transformers y text-generation-inference.

Se trata de un modelo pequeño, pensado para despliegues con recursos limitados y para tareas de generación de texto conversacional en inglés. La model card es mínima: no documenta el dataset de entrenamiento, los hiperparámetros del GRPO, ni resultados de evaluación. El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un flujo de ajuste eficiente en memoria, probablemente con cuantización de 4 bits y LoRA.

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de modelo de nicho (legal) derivado de una familia abierta consolidada como Qwen2.5; por otro, advierte de que la información pública es escasa, por lo que cualquier uso en producción debe ir precedido de una evaluación propia. La licencia Apache 2.0 facilita el uso comercial, pero la ausencia de benchmarks y de documentación sobre los datos de entrenamiento limita la confianza que se puede depositar en el modelo sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), según tags del repo |
| Parámetros totales | 1.543.714.304 (dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantización | No disponible en la model card; el repo publica safetensors en precisión completa (probablemente bf16/fp16) |
| Idiomas soportados | Inglés (tag `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only denso con atención causal estándar, normalización RMSNorm y activación SwiGLU, tal como se define en la familia Qwen2. El modelo parte de un checkpoint ya ajustado con supervisión (SFT) sobre datos legales y, según el nombre del repositorio, se somete después a una etapa de GRPO. GRPO es una técnica de optimización por refuerzo que estima la ventaja relativa de varias respuestas generadas para el mismo prompt, eliminando la necesidad de un modelo de recompensa independiente y reduciendo el coste computacional frente a PPO clásico.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset legal, la proporción de datos en inglés frente a otros idiomas, ni los hiperparámetros concretos del GRPO (tamaño del grupo, tasa de aprendizaje, número de pasos). La model card únicamente menciona que el entrenamiento se realizó con Unsloth y TRL, lo que apunta a un pipeline de ajuste eficiente con LoRA o QLoRA, pero no se confirma en la documentación. Tampoco se documenta ninguna innovación técnica adicional más allá del propio uso de GRPO sobre un modelo de 1,5B.

## Capacidades

- Generación de texto conversacional en inglés, con especialización declarada en dominio legal (por el nombre del checkpoint y su predecesor SFT).
- Razonamiento y respuesta a preguntas dentro del ámbito jurídico, presumiblemente orientado a consultas sobre normativa, contratos o terminología legal, aunque no se detalla en la model card.
- Soporte de tool calling / function calling: no disponible en la documentación; el modelo base Qwen2.5 lo soporta, pero no se confirma que este ajuste lo conserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el tag `language: en`; no se declaran otros idiomas.
- Modo thinking explícito, visión o audio: no disponible.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Asistencia en consultas legales de primer nivel: el modelo puede generar borradores de respuestas sobre terminología jurídica en inglés, útil como borrador para revisión por un profesional. Su tamaño de 1,5B permite desplegarlo en una sola GPU consumer.
- Clasificación y resumen de documentos legales: con un contexto presumiblemente amplio (heredado de Qwen2.5), puede resumir contratos o extraer cláusulas relevantes en inglés, siempre con validación humana.
- Generación de plantillas de contratos y cláusulas: adecuado para producir borradores repetitivos que luego se revisan, gracias a su ajuste específico en el dominio legal.
- Chatbot de atención al cliente en despachos jurídicos: al ser un modelo pequeño, se puede servir con baja latencia en entornos con presupuesto limitado, gestionando conversaciones multi-turno en inglés.
- Prototipado rápido de pipelines RAG legales: su compatibilidad con transformers y TGI facilita integrarlo en sistemas de recuperación aumentada para responder preguntas sobre una base documental jurídica.
- Investigación sobre alineación con GRPO: al ser un checkpoint público con licencia Apache 2.0 y basado en un modelo pequeño, sirve como caso de estudio para reproducir o comparar pipelines de GRPO en dominios especializados.
- Filtrado y anonimización de textos legales: puede emplearse como componente de preprocesado para detectar y reformular fragmentos sensibles antes de pasarlos a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo para los pesos (1.543.714.304 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos, con un total práctico de 2 a 3 GB.
- VRAM estimada en cuantización de 4 bits (si se genera GGUF/AWQ): alrededor de 0,8 GB para pesos, con un total práctico de 1,5 a 2,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100, H100 o L40S ofrecen margen para mayor batch y contexto.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB o más, especialmente con cuantización.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama si se convierte a GGUF (no se publica GGUF en el repo).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5B, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jagiiiiiiiii/qwen2.5-1.5b-legal-grpo | 1,54B | No disponible (base Qwen2.5: 32.768) | Apache 2.0 | Hugging Face, safetensors | Ajuste legal con GRPO; sin benchmarks publicados |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors, GGUF | Modelo generalista con benchmarks publicados y amplio soporte de herramientas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors, GGUF | Variante alineada para instrucciones, con tool calling documentado |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face, safetensors, GGUF | Alternativa pequeña generalista, sin especialización legal |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación sobre el dataset de entrenamiento: no es posible verificar la calidad ni la robustez del ajuste legal sin una evaluación propia.
- Riesgo elevado de alucinación en materia legal: un modelo de 1,5B ajustado con GRPO puede generar referencias normativas, jurisprudencia o cláusulas inexistentes; no debe usarse como fuente de verdad jurídica sin revisión profesional.
- Sesgos desconocidos: al no documentarse la composición de los datos, no se pueden identificar sesgos de género, raza, jurisdicción o ideología presentes en el corpus legal utilizado.
- Limitación idiomática: solo se declara inglés; no hay evidencia de soporte para castellano ni otras lenguas, lo que restringe su uso en el mercado jurídico hispanohablante.
- Contexto no confirmado: aunque el modelo base Qwen2.5-1.5B soporta 32.768 tokens, la model card no confirma que este ajuste conserve dicha ventana; conviene validarlo empíricamente.
- Tool calling y modo agente no documentados: no se garantiza que el ajuste haya preservado las capacidades de function calling del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre la calidad y legalidad de las salidas, especialmente en un dominio regulado como el legal.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria, lo que refuerza la necesidad de pruebas internas antes de cualquier despliegue.
- Fecha de creación del repositorio (2026-11-15) posterior a la fecha actual de referencia habitual: conviene verificar la integridad y procedencia del checkpoint antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Jagiiiiiiiii/qwen2.5-1.5b-legal-grpo
- Modelo base SFT: https://huggingface.co/Jagiiiiiiiii/qwen2.5-1.5b-legal-sft
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
