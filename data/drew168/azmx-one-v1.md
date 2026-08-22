# Drew168/azmx-one-v1

## Resumen

AZMX One v1 es un modelo de lenguaje denso de 1.87B parámetros desarrollado por Drew168, diseñado como modelo base para India con soporte de inglés y 22 idiomas indios programados. Utiliza un tokenizer personalizado de 128K tokens específico para escrituras índicas. El modelo se basa en una arquitectura derivada de Qwen3, denominada AZMX, con configuraciones de atención GQA, SwiGLU y RoPE. Actualmente se encuentra en fase de entrenamiento activo, habiendo procesado aproximadamente 157.59B tokens de un total planificado de 1.8T (8.76% completado). Su relevancia radica en ser un intento de crear un modelo de tamaño medio especializado en lenguas indias, con licencia Apache-2.0, aunque su estado inmaduro lo hace no apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AZMX (subclase de Qwen3) - transformer denso con GQA |
| Parametros totales | 1.872.898.048 (1.87B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (seq len configurado) |
| Tipos de cuantizacion | No disponible (solo pesos en bf16 safetensors) |
| Idiomas soportados | Ingles y 22 idiomas indios programados (entrenamiento en curso) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y checkpoint torch (latest.pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa derivada de Qwen3, con las siguientes especificaciones: vocab de 128.000 tokens, hidden size de 2.048, 32 capas, atención GQA con 16 cabezas de query y 8 cabezas de key/value, head_dim de 128, feed-forward SwiGLU con intermediate size de 6.144, RoPE con theta 10.000, embeddings atados y longitud de secuencia de 2.048. El entrenamiento se realiza en precisión bf16 con kernels fusionados Liger, sobre 4 GPUs H200. El schedule es WSD (warmup-stable-decay) con warmup de 6.866 pasos, fase estable hasta 389.098 y cooldown hasta 457.763 pasos totales. El dataset proviene de `Drew168/azmx-6t-data`, que incluye fuentes índicas (Sangraha, CulturaX, IndicCorpV2, libros, noticias) además de web en inglés, código y matemáticas. La mezcla se ha desplazado hacia contenido índico a mitad del entrenamiento, lo que incrementa la pérdida bruta pero no indica degradación real; se recomienda comparar bits por byte en datos de validación. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto en inglés y, potencialmente, en 22 idiomas indios (aún no entrenado completamente).
- Razonamiento y comprensión de lenguaje natural, limitado por el bajo progreso de entrenamiento.
- Generación de código y soporte matemático, dado que el dataset incluye estas categorías.
- Tokenizer especializado en escrituras índicas, con 128K tokens, diseñado para eficiencia en idiomas indios.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El modelo es un checkpoint intermedio; las capacidades reales son muy limitadas en este estado.

## Casos de uso

Dado que el modelo está en entrenamiento (8.76% completado), no se recomienda su uso en producción. Los casos de uso son potenciales y dependen de la finalización del entrenamiento:

- Procesamiento de texto multilingüe para India: una vez completado, podría utilizarse para tareas de clasificación, extracción de información o generación de contenido en idiomas como hindi, tamil, bengalí, etc., gracias a su tokenizer especializado.
- Generación de código asistida: el dataset incluye código, por lo que podría emplearse en asistentes de programación para desarrolladores indios, con soporte de comentarios y documentación en inglés e idiomas locales.
- Traducción automática entre inglés e idiomas indios: su entrenamiento bilingüe podría habilitar traducción de calidad media, aunque se necesitaría fine-tuning específico.
- Chatbots de atención al cliente en empresas indias: con fine-tuning sobre datos conversacionales, podría gestionar consultas en múltiples idiomas regionales.
- Educación y tutoría: generación de explicaciones y material educativo en idiomas locales, aprovechando su capacidad multilingüe.
- Investigación académica en PNL para lenguas de bajos recursos: serviría como modelo base para fine-tuning en tareas específicas de idiomas indios, contribuyendo a la comunidad de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está en una fase temprana de entrenamiento y no se han evaluado métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.87B parámetros en bf16, el modelo ocupa aproximadamente 3.7 GB de memoria. Con cuantización a 4 bits (no disponible actualmente), podría reducirse a ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en bf16, como una RTX 3060, RTX 4060, o GPUs de datacenter como A10, A100, H100.
- Cabe en GPUs de consumo: sí, en tarjetas con 6 GB o más, aunque la velocidad dependerá de la memoria y el ancho de banda.
- Opciones de despliegue: al ser un modelo estándar de HuggingFace, puede servirse con vLLM, llama.cpp, Ollama, TGI o directamente con transformers. Sin embargo, al ser un checkpoint en entrenamiento, no se recomienda su despliegue.
- Latencia y throughput: no disponibles, ya que no se han realizado pruebas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| AZMX One v1 | 1.87B | 2048 | Apache-2.0 | Entrenamiento en curso (8.76%) |
| Qwen2.5-1.5B | 1.5B | 32K | Apache-2.0 | Completo, con benchmarks publicados |
| Gemma-2-2B | 2B | 8K | Gemma License | Completo, con benchmarks publicados |
| Llama-3.2-1B | 1B | 128K | Llama 3.2 License | Completo, con benchmarks publicados |

AZMX One v1 se posiciona en el rango de 1-2B, pero su falta de finalización y ausencia de benchmarks impiden una comparación real de rendimiento. Su diferenciador es el tokenizer índico de 128K y el enfoque en idiomas indios, algo que los modelos comparables no ofrecen de forma nativa.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo ha procesado el 8.76% de los tokens planificados, por lo que su rendimiento es muy pobre y no refleja las capacidades finales.
- Riesgo de alucinación y errores: al ser un checkpoint temprano, es probable que genere texto incoherente o incorrecto con frecuencia.
- Sesgos potenciales: los datos de entrenamiento provienen de fuentes web y corpus índicos, que pueden contener sesgos culturales, de género o religiosos.
- Limitaciones de contexto: la ventana de 2048 tokens es corta para tareas que requieren contexto largo.
- Idiomas: aunque se programaron 22 idiomas indios, el entrenamiento aún no ha cubierto suficientemente estos idiomas; el modelo actualmente funciona mejor en inglés y código.
- Licencia: Apache-2.0 permite uso comercial, pero al ser un modelo en desarrollo, no hay garantías de calidad ni soporte.
- No apto para producción: cualquier uso en aplicaciones reales es desaconsejado hasta que se complete el entrenamiento y se publiquen evaluaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Drew168/azmx-one-v1
- Perfil del autor: https://huggingface.co/Drew168
- Dataset de entrenamiento: https://huggingface.co/Drew168/azmx-6t-data
- Documentación de modelos AZMX: https://github.com/AzmxAI/azmx/blob/main/docs/MODELS.md
- Organización AzmxAI en GitHub: https://github.com/AzmxAI/
- Sitio web de AZMX AI: https://azmx.ai/
