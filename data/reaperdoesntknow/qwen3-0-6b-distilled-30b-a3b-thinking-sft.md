# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT

## Resumen

El modelo `Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT`, desarrollado por Reaperdoesntrun (Convergent Intelligence LLC), es un modelo de lenguaje causal de 0,6 mil millones de parámetros (751.632.384 exactamente) construido a partir del modelo base `Qwen/Qwen3-0.6B`. Su propósito principal es ofrecer capacidades de razonamiento estructurado —especialmente en dominios STEM y legales— en un formato extremadamente compacto, apto para ejecución en dispositivos de borde como teléfonos móviles.

El proceso de entrenamiento se compone de dos etapas: primero, una destilación de conocimiento desde el modelo profesor `Qwen3-30B-A3B-Thinking-2507` (un MoE de 30B totales y ~3B activos) sobre 6.122 muestras de cadenas de razonamiento (CoT) en 12 dominios científicos y matemáticos. En segundo lugar, un ajuste fino supervisado (SFT) sobre el dataset `Alignment-Lab-AI/Lawyer-Instruct` para transferir la estructura de razonamiento al dominio legal. La compresión resultante es de 50x respecto al profesor, y el modelo cuantizado ocupa menos de 500 MB.

La relevancia de este modelo radica en su enfoque pedagógico: enseñar primero *cómo razonar* (destilación desde un profesor con trazas de deliberación extendida) y después *sobre qué razonar* (SFT legal). Esto permite que un modelo de solo 0,6B alcance una estructura de razonamiento más profunda de lo que sería posible con un ajuste convencional. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parametros totales | 751.632.384 (0,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | No especificado (se menciona <500 MB cuantizado) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3-0.6B: un transformer causal con atención con consultas agrupadas (GQA), posiciones rotatorias (RoPE) y normalización. No es un modelo de mezcla de expertos; es denso. El contexto de entrenamiento se fijó en 1024 tokens, aunque el modelo base original de Qwen soporta ventanas mayores (no confirmado en esta ficha).

El entrenamiento se realizó en dos etapas secuenciales:

1. **Destilación de conocimiento (etapa 1)**: el modelo estudiante (Qwen3-0.6B) se destiló desde el profesor `Qwen3-30B-A3B-Thinking-2507`, que genera trazas de razonamiento interno extendido. Se utilizó una temperatura de destilación T=2.0 para exponer al estudiante a una distribución de probabilidad más rica (mayor entropía) y así transferir múltiples estrategias de derivación. La función de pérdida combinó:
   - *Proof-Weighted Cross-Entropy* (55%): peso 2.5 sobre los tokens de derivación, decayendo a 1.5, para priorizar los pasos de razonamiento sobre el formato de respuesta.
   - *KL Divergence* (45%): con T=2.0 y escalado por T².
   
   Los datos fueron 6.122 muestras CoT de 12 datasets STEM (física, álgebra lineal, ecuaciones diferenciales, electromagnetismo, etc.), divididos 95/5 en train/eval. Se entrenó durante 1 época con batch efectivo de 8, learning rate 1.5e-5 → 1e-6 (cosine) y precisión bf16.

2. **Supervisión legal (etapa 2)**: el modelo destilado se ajustó con TRL SFTTrainer sobre `Alignment-Lab-AI/Lawyer-Instruct`, con formato de instrucción y respuesta. Se usó 1 época, batch efectivo 8, learning rate 5e-6 (inferior para preservar el backbone de razonamiento) y gradient checkpointing. La hipótesis es que el razonamiento legal es estructuralmente isomorfo al matemático (identificación de premisas, encadenamiento lógico, manejo de excepciones), por lo que la transferencia de estructura es más efectiva que aprender plantillas legales desde cero.

## Capacidades

- **Razonamiento STEM**: el modelo puede resolver problemas de matemáticas, física, ingeniería y otras ciencias mostrando derivaciones paso a paso, gracias a la destilación desde el profesor Thinking.
- **Razonamiento legal**: tras el SFT, responde a instrucciones legales con argumentación estructurada, identificando premisas y aplicando lógica deductiva.
- **Generación de texto causal**: generación de lenguaje natural estándar, con formato de instrucción y respuesta.
- **Chain-of-thought**: capacidad de producir cadenas de razonamiento explícitas en formato "Proof:" antes de la respuesta final.
- **Multilingüe**: solo inglés (según metadatos).
- **Sin soporte explícito de tool calling ni agentes**: no se menciona en la documentación.
- **Sin capacidades multimodales**: no se indica visión, audio ni otras modalidades.

## Casos de uso

- **Tutoría STEM en dispositivos móviles**: el modelo puede ejecutarse en un teléfono (menos de 500 MB cuantizado) y servir como asistente de estudio para estudiantes de física, cálculo o álgebra lineal, mostrando derivaciones paso a paso.
- **Asistencia legal básica para despachos pequeños**: puede responder preguntas frecuentes sobre diferencias entre delitos, redactar borradores de argumentos o resumir conceptos legales, siempre con supervisión humana.
- **Generación de explicaciones técnicas en documentación**: dado su entrenamiento en razonamiento estructurado, puede generar explicaciones claras de conceptos científicos o legales para manuales o FAQs.
- **Procesamiento de texto legal en entornos con recursos limitados**: análisis de cláusulas, identificación de premisas y generación de resúmenes en aplicaciones de borde (edge computing).
- **Prototipado rápido de chatbots especializados**: al ser ligero y con licencia Apache 2.0, permite integrarse en pipelines de NLP sin necesidad de GPUs dedicadas.
- **Investigación educativa sobre destilación de conocimiento**: sirve como caso de estudio para validar la transferencia de razonamiento desde un profesor MoE de 30B a un estudiante denso de 0.6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 0.6B, en bf16 ocupa aproximadamente 1.5 GB en memoria. Cuantizado a 4 bits podría reducirse a ~500 MB (como indica la model card).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso CPUs modernas) puede ejecutar inferencia. No se requieren GPUs de datacenter.
- **Compatibilidad con consumer GPU**: sí, es ejecutable en GPUs de consumo y también en CPU pura.
- **Opciones de despliegue**: al ser un modelo transformers estándar, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o mediante la API de Hugging Face Inference Endpoints. No se especifican configuraciones de latencia o throughput en la documentación.
- **Nota**: la model card afirma que "corre en un teléfono", lo que sugiere que con cuantización adecuada es viable en dispositivos móviles, aunque no se detallan frameworks específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| **Qwen3-0.6B (base)** | 0.6B | 32k (original) | Apache 2.0 | Modelo base sin destilación ni SFT legal |
| **Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT** | 0.6B | 1024 (entrenamiento) | Apache 2.0 | Destilado desde Qwen3-30B-A3B-Thinking + SFT legal |
| **Qwen3-30B-A3B-Thinking-2507** | 30B total (3B activo) | 32k | Apache 2.0 | Profesor MoE con modo Thinking |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características arquitectónicas y de entrenamiento.

## Limitaciones y advertencias

- **Contexto limitado**: el entrenamiento se realizó con 1024 tokens de contexto, lo que puede limitar la coherencia en tareas que requieran ventanas más largas (aunque el modelo base soporta más, no se ha verificado el comportamiento en esta variante).
- **Idioma**: solo inglés. No hay soporte para español u otros idiomas.
- **Datos de entrenamiento reducidos**: 6.122 muestras STEM y un dataset legal no especificado en tamaño; puede haber sobreajuste a los dominios concretos y falta de generalización.
- **Riesgo de alucinación**: al ser un modelo pequeño, es propenso a generar respuestas incorrectas o inventadas, especialmente en dominios fuera de su entrenamiento.
- **Sesgos**: los datasets de origen pueden contener sesgos implícitos; no se ha realizado una evaluación de sesgos.
- **Uso legal**: las respuestas legales no deben considerarse asesoramiento profesional; el modelo no sustituye a un abogado.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los datasets utilizados (0xZee y Alignment-Lab-AI) para asegurar cumplimiento.
- **Sin benchmarks**: la ausencia de métricas públicas impide validar su rendimiento real frente a otros modelos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT)
- [Modelo base Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Profesor Qwen3-30B-A3B-Thinking-2507](https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507)
- [Dataset STEM (0xZee)](https://huggingface.co/0xZee)
- [Dataset Lawyer-Instruct](https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct)
- [Sitio web de Convergent Intelligence LLC](https://convergentintel.com)
