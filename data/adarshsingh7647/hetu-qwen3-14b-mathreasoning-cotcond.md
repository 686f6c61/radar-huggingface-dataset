# AdarshSingh7647/HETU-Qwen3-14B-MathReasoning-CotCond

## Resumen

HETU-Qwen3-14B-MathReasoning-CotCond es un modelo de lenguaje especializado en razonamiento matemático, desarrollado por AdarshSingh7647 como parte de la suite HETU (Hints Enable True Understanding). Se trata de un ajuste fino (fine-tune) del modelo base Qwen/Qwen3-14B, donde se ha aplicado el método CotCond: en lugar de entrenar sobre cadenas de pensamiento (chain-of-thought) completas generadas por el modelo, se entrena sobre una señal de condicionamiento compacta que guía el razonamiento. Este enfoque reduce el coste de entrenamiento y la latencia en inferencia, manteniendo o mejorando la precisión en tareas de matemáticas.

El modelo está orientado a benchmarks de razonamiento matemático y científico: AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond y MMLU. Se distribuye como un modelo fusionado (base + adaptador LoRA integrado) en precisión bf16, con un total de 14.768.307.200 parámetros. No se especifican datos de licencia ni idiomas soportados en la model card, aunque al derivar de Qwen3-14B, hereda la arquitectura densa de 14B con ventana de contexto de 128K tokens del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (contexto del modelo base Qwen3-14B; no confirmado en el fine-tune) |
| Tipos de cuantizacion | No disponible (pesos en bf16, compatibles con cuantizaciones posteriores tipo GGUF o bitsandbytes) |
| Idiomas soportados | no disponible (el modelo base Qwen3-14B soporta multilingüe, pero el fine-tune no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

HETU-Qwen3-14B-MathReasoning-CotCond se basa en la arquitectura del modelo Qwen3-14B, un transformer denso con atención causal y ventana de contexto de 128K tokens. El entrenamiento se realizó mediante un adaptador LoRA que se fusionó posteriormente con los pesos base para obtener el checkpoint final. La técnica principal es CotCond, descrita en el paper HETU: se entrena al modelo para que utilice una señal de condicionamiento (hint) compacta que encapsula el razonamiento esperado, en lugar de generar una cadena de pensamiento completa token a token. Esto reduce los requisitos de datos y cómputo durante el entrenamiento y acelera la inferencia, manteniendo la precisión en problemas matemáticos complejos.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO). El modelo está preparado para tareas de razonamiento matemático y científico, y su método de entrenamiento está documentado en el paper de HETU (referencia pendiente).

## Capacidades

- Razonamiento matemático avanzado: resolución de problemas de los benchmarks AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond y MMLU.
- Razonamiento científico: aborda preguntas de física, química y biología de nivel universitario (GPQA-Diamond).
- Generación de respuestas paso a paso: aunque no usa cadenas de razonamiento completas, puede generar explicaciones y soluciones detalladas.
- Soporte de conversación: el modelo base Qwen3-14B incluye capacidades de chat y seguimiento de instrucciones, que se mantienen en el fine-tune.
- Multilingüismo potencial: dado el modelo base, es probable que soporte múltiples idiomas, aunque no está confirmado en la ficha.
- No se especifica soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede explicar la resolución de ecuaciones, integrales o problemas de álgebra a estudiantes, generando pasos intermedios y justificaciones claras.
- Evaluación automática de respuestas matemáticas: al estar entrenado en benchmarks como GSM8K y MATH-500, puede evaluar la corrección de soluciones generadas por otros sistemas.
- Asistente para investigación científica: su capacidad en GPQA-Diamond permite ayudar a investigadores a resolver problemas de física o química que requieren razonamiento multinivel.
- Generación de problemas y soluciones para plataformas educativas: puede crear ejercicios matemáticos con sus soluciones paso a paso, útil para generar contenido educativo.
- Sistema de razonamiento integrado en chatbots de atención al cliente: aunque su foco es matemáticas, puede responder preguntas que requieran cálculo o lógica, como presupuestos o conversiones.
- Componente en pipelines de datos: puede utilizarse para limpiar y estructurar datos numéricos o para validar resultados de modelos matemáticos en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo fue evaluado en AIME, GSM8K, MATH-500, Omni-MATH, GPQA-Diamond y MMLU, pero no se proporcionan los valores numéricos. Se recomienda consultar el paper HETU para obtener las tablas de resultados completas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 30 GB (para 14.8B parámetros con pesos completos). Con cuantización de 4 bits, se puede reducir a unos 10-12 GB.
- GPU recomendadas: para bf16 completo se necesita una GPU con al menos 32 GB de VRAM, como NVIDIA A100 40GB o RTX A6000. Para cuantización 4-bit, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- Puede ejecutarse en GPUs de consumo: sí, con cuantización 4-bit en una RTX 4090 o similar.
- Opciones de despliegue: compatible con vLLM, llama.cpp (tras conversión a GGUF), Ollama (si se convierte el formato), y Transformers con TGI (Text Generation Inference).
- Latencia y throughput estimados: no disponible. Depende del hardware y de la cuantización. En una RTX 4090 con cuantización 4-bit, se puede esperar una generación de 20-40 tokens/segundo para modelos de 14B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| HETU-Qwen3-14B-MathReasoning-CotCond | 14.8B | 128K (base) | Razonamiento matemático con CotCond | no disponible |
| Qwen3-14B (base) | 14.8B | 128K | Modelo general de chat y razonamiento | Apache 2.0 |
| DeepSeek-R1-Distill-Qwen-14B | 14.8B | 32K | Razonamiento matemático y científico (distillation de R1) | MIT |

El modelo se diferencia del Qwen3-14B base en su especialización matemática y el método de entrenamiento compacto. Frente a DeepSeek-R1-Distill-Qwen-14B, que usa cadenas de razonamiento explícitas, HETU usa una señal de condicionamiento más eficiente. No se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no declara una licencia en su ficha, lo que impide determinar si puede usarse comercialmente. Es necesario contactar al autor antes de usarlo en producción.
- Idiomas no confirmados: aunque el modelo base es multilingüe, no se garantiza que el fine-tune mantenga el mismo soporte idiomático.
- Sesgos y alucinaciones: al ser un modelo entrenado sobre datos de internet, puede presentar sesgos o alucinaciones, especialmente en problemas matemáticos mal planteados o ambiguos.
- Limitación en contexto: aunque el modelo base soporta 128K tokens, el fine-tune no confirma si se mantiene la misma longitud efectiva tras el entrenamiento.
- Sin información de rendimiento: no se publican benchmarks, lo que dificulta evaluar su calidad real frente a otros modelos.
- Riesgo de sobreajuste: el método CotCond puede estar optimizado para los benchmarks específicos mencionados, pero su rendimiento en problemas matemáticos fuera de esos dominios no está garantizado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AdarshSingh7647/HETU-Qwen3-14B-MathReasoning-CotCond)
- [Modelo base Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B)
- [Paper HETU (no disponible en la información proporcionada)](no disponible)
