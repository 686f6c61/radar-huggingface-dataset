# localized-ft/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5-epoch3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5-epoch3` es un ajuste fino (fine-tuning) supervisado (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Su nombre indica que se ha entrenado específicamente sobre el último tercio de un conjunto de datos orientado a reducir alucinaciones, con una semilla concreta (seed 5) y tres épocas. El objetivo declarado es mitigar la generación de contenido falso o no verificado, un problema crítico en modelos de lenguaje para aplicaciones de producción.

El modelo conserva la arquitectura transformer de Llama 3.1 con 8.030 millones de parámetros, y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Aunque no se han publicado métricas de rendimiento específicas, su relevancia radica en ser un experimento reproducible de ajuste fino dirigido a un problema concreto (alucinaciones) sobre una base sólida como Llama 3.1 8B Instruct. El entrenamiento se realizó con la librería Unsloth y Hugging Face TRL, lo que sugiere un proceso optimizado en tiempo y recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1, Grouped-Query Attention) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Llama 3.1 soporta 128k tokens) |
| Tipos de cuantizacion | No especificados (formato safetensors de precisión completa) |
| Idiomas soportados | Inglés (etiqueta `en`; el base soporta múltiples idiomas, pero el fine-tuning no lo especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16,1 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una versión optimizada del Llama 3.1 8B Instruct de Meta. La arquitectura es un transformer denso con Grouped-Query Attention (GQA), que mejora la eficiencia en inferencia y escalado. El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face, acelerado con Unsloth (entrenamiento aproximadamente 2 veces más rápido que el estándar). El nombre del modelo indica que se utilizó solo el último tercio de un dataset específico para reducir alucinaciones, con una semilla aleatoria fija (seed 5) y tres épocas de entrenamiento. No se han publicado detalles sobre el tamaño del dataset, la composición exacta ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se centró en ajustar los pesos del modelo para que genere respuestas más fieles a los hechos, presumiblemente mediante ejemplos supervisados que contrastan salidas correctas e incorrectas.

## Capacidades

- Generación de texto en inglés con estilo conversacional, heredado del modelo base Llama 3.1 Instruct.
- Razonamiento y resolución de problemas de lógica y matemáticas básicas (capacidad del base, no verificada tras el fine-tuning).
- Generación de código en múltiples lenguajes (Python, JavaScript, etc.) gracias a la base Llama 3.1.
- Soporte de tool calling y function calling (el modelo base lo incluye; el fine-tuning no lo elimina explícitamente).
- Capacidad de seguir instrucciones multi-turno en diálogos, aunque el fine-tuning puede haber alterado el comportamiento en contextos largos.
- Multilingüismo limitado: el modelo está etiquetado solo en inglés, aunque el base soporta 8 idiomas; no se ha validado el rendimiento en otros idiomas tras el ajuste.
- No se ha confirmado soporte de modo "thinking" ni capacidades multimodales (visión, audio).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128k tokens si se conserva la ventana del base) y su entrenamiento específico contra alucinaciones lo hace adecuado para responder con datos verificables de la empresa, reduciendo respuestas inventadas.
- Generación de documentación técnica: al estar ajustado para minimizar alucinaciones, es útil para redactar manuales, guías y respuestas basadas en fuentes proporcionadas, siempre que se le suministre el contexto adecuado.
- Verificación de hechos en textos: puede emplearse como componente de un pipeline que detecte inconsistencias o afirmaciones no respaldadas, gracias a su entrenamiento dirigido a evitar contenido falso.
- Asistentes de soporte en entornos regulados (salud, finanzas): donde la precisión factual es crítica, el modelo puede servir como base para respuestas controladas, aunque requiere validación humana adicional.
- Chatbots educativos: para responder preguntas de estudiantes con un menor riesgo de inventar información, siempre que se limite el dominio y se proporcionen materiales de referencia.
- Prototipado de agentes conversacionales: su licencia Apache-2.0 y su tamaño moderado (8B) permiten integrarlo en sistemas de agentes con tool calling, aunque se recomienda evaluar su rendimiento en tareas específicas antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este fine-tuning concreto. El modelo base Llama 3.1 8B Instruct reporta valores conocidos (por ejemplo, MMLU 68.4, HumanEval 72.6), pero el ajuste fino puede alterar estas cifras, por lo que no se pueden extrapolar. Se recomienda realizar una evaluación propia en el dominio de uso.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16): aproximadamente 16 GB (8B parámetros × 2 bytes), más overhead de activaciones y KV cache. Con cuantización a 8 bits (INT8) se reduce a ~8-9 GB; con 4 bits (GPTQ/AWQ) a ~5-6 GB.
- GPU recomendadas: para FP16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) es suficiente; para cuantización 4 bits, una RTX 3090 o RTX 4070 (12 GB) puede funcionar.
- Es viable en GPUs de consumo (RTX 3090/4090) con cuantización, pero no en GPUs con menos de 8 GB de VRAM.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp (formato GGUF), Ollama (si se convierte), o directamente con Transformers y Hugging Face.
- Latencia y throughput: no disponibles para este modelo específico; en el base Llama 3.1 8B, vLLM suele alcanzar ~50-100 tokens/s en A100, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5-epoch3` | 8,03 B | No disponible (base 128k) | Apache-2.0 | Fine-tuning SFT para reducir alucinaciones (último tercio del dataset) |
| `longtermrisk/Llama-3.1-8B-target-only-no-hallucination-sft-seed3` | 8,03 B | No disponible | Apache-2.0 | Fine-tuning SFT similar, sin especificar partición del dataset |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8,03 B | 128k | Llama 3.1 Community License | Modelo instruct original de Meta |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal radica en el subconjunto de datos utilizado (último tercio vs. completo) y la semilla de entrenamiento, lo que puede afectar la generalización y la reducción de alucinaciones, pero no se ha documentado.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas de reducción de alucinaciones es desconocido.
- El entrenamiento se realizó solo sobre el último tercio de un dataset no especificado, lo que puede introducir sesgos hacia ese subconjunto y limitar la generalización a otros dominios.
- El modelo está etiquetado únicamente en inglés; su rendimiento en otros idiomas no está garantizado y puede degradarse respecto al base.
- Aunque el objetivo es reducir alucinaciones, no las elimina por completo; sigue siendo necesario un sistema de verificación externa en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia (Llama 3.1 Community License) que puede imponer condiciones adicionales; se debe verificar la compatibilidad.
- No se especifican cuantizaciones oficiales; el repositorio solo contiene safetensors en precisión completa, por lo que el despliegue en entornos con poca VRAM requiere conversión manual.
- El modelo es un experimento de investigación (descargas y likes en 0), sin mantenimiento garantizado ni soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed5-epoch3
- Modelo similar de longtermrisk (seed3): https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-sft-seed3
- Modelo similar de longtermrisk (first-third): https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-seed4
- Página de despliegue en FriendliAI (variante seed3-epoch3): https://friendli.ai/models/localized-ft/Llama-3.1-8B-target-only-no-hallucination-last-third-sft-seed3-epoch3
- Documentación de Llama 3.1 8B en Groq: https://console.groq.com/docs/model/llama-3.1-8b-instant
