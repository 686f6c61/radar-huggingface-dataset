# OliverSundaram/Llama-3.2-1B-MathCodeInstruct-5k

## Resumen

Llama-3.2-1B-MathCodeInstruct-5k es un fine-tuning del modelo Llama-3.2-1B (de Meta, distribuido por unsloth) realizado por OliverSundaram sobre 5.000 ejemplos del dataset MathLLMs/MathCodeInstruct. El objetivo es especializar el modelo en la resolución de problemas matemáticos de enunciado verbal, generando razonamiento paso a paso en lenguaje natural intercalado con código Python ejecutable. Es uno de tres modelos hermanos entrenados sobre subconjuntos de 5k, 10k y 20k ejemplos para estudiar el equilibrio entre volumen de datos de fine-tuning y rendimiento matemático frente a capacidades generales.

El modelo tiene 1.235.814.400 parámetros (1,24B) y se entrenó con LoRA (r=16, α=16, dropout=0) fusionado a los pesos completos, en una sola época, sobre una RTX 4060 de 8 GB con Unsloth y TRL SFTTrainer. La licencia es llama3.2, la misma que el modelo base. Su relevancia radica en demostrar que un modelo pequeño puede mejorar sustancialmente en tareas matemáticas con un fine-tuning ligero y barato, manteniendo un rendimiento general aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B) |
| Parametros totales | 1.235.814.400 (1,24B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Llama-3.2-1B) |
| Tipos de cuantizacion | No disponible (repo en safetensors, cuantizable con herramientas estandar) |
| Idiomas soportados | Ingles |
| Licencia | Llama 3.2 Community License (llama3.2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama-3.2-1B, un transformer decoder-only con atención causal estándar y normalización RMSNorm, sin innovaciones arquitectónicas adicionales. El fine-tuning se realizó con LoRA de rango 16 y alpha 16 sin dropout sobre todas las proyecciones de atención y MLP, fusionando posteriormente los adaptadores a los pesos completos del modelo. El entrenamiento cubrió una única época sobre 5.000 ejemplos de MathLLMs/MathCodeInstruct, con un tamaño de lote efectivo de 16 (batch 1 con acumulación de gradientes 16), tasa de aprendizaje 2e-4 con programación coseno y warmup del 3%. No se aplicó RLHF ni ningún otro paso de alineación adicional más allá del que ya posee el modelo base. El entrenamiento se ejecutó en una única GPU RTX 4060 de 8 GB usando Unsloth y TRL SFTTrainer.

## Capacidades

- Resolución de problemas matemáticos de enunciado verbal con razonamiento paso a paso en lenguaje natural.
- Generación de código Python intercalado con el razonamiento para resolver cálculos y verificar resultados.
- Mantiene capacidades conversacionales básicas heredadas del modelo base Llama-3.2-1B.
- Soporte de chat mediante plantilla de conversación (system, user, assistant).
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso más allá del contexto matemático.
- Multilingüismo limitado al inglés (único idioma declarado).

## Casos de uso

- Tutoría de matemáticas automatizada: el modelo puede explicar problemas de aritmética, álgebra o geometría paso a paso, generando soluciones didácticas en lenguaje natural adecuadas para plataformas educativas o asistentes de estudio.
- Generación de soluciones con código verificable: al intercalar Python, permite producir respuestas que pueden ejecutarse para validar el resultado, útil en entornos de corrección automática o generación de ejercicios resueltos.
- Prototipado de asistentes de razonamiento matemático: por su pequeño tamaño y bajo coste de inferencia, sirve como base para experimentar con pipelines de razonamiento en dispositivos con recursos limitados.
- Benchmarking de fine-tuning eficiente: el modelo es un punto de referencia para estudiar cómo varía el rendimiento matemático con el volumen de datos de entrenamiento (junto a las variantes de 10k y 20k).
- Generación de datos sintéticos de entrenamiento: puede usarse para crear ejemplos de problemas matemáticos resueltos con razonamiento y código, que alimenten otros modelos más grandes.
- Integración en entornos educativos embebidos: su huella de memoria permite desplegarlo en GPUs consumer o CPUs con cuantización para aplicaciones offline de práctica matemática.

## Benchmarks y rendimiento

Resultados declarados por el autor, obtenidos con lm-evaluation-harness y comparados contra el modelo base sin ajustar:

| Benchmark | Llama-3.2-1B (base) | Este modelo | Cambio |
|---|---|---|---|
| GSM8K (5-shot) | 5,8% | 7,4% | +1,5% |
| ARC-Challenge (25-shot) | 36,9% | 36,8% | -0,1% |
| HellaSwag (10-shot) | 64,2% | 63,8% | -0,3% |
| WinoGrande (5-shot) | 60,8% | 62,4% | +1,7% |

Velocidad de generación (solicitud única, greedy, RTX 4060): 38,36 tokens/segundo frente a 12,74 del modelo base. No se han publicado resultados de MMLU en la tabla, aunque el model-index lo menciona sin valores numéricos.

## Requisitos de hardware

- Inferencia en GPU consumer: el entrenamiento se realizó en una RTX 4060 de 8 GB, por lo que la inferencia cabe sin problema en GPUs de 8 GB o menos con cuantización.
- VRAM estimada: aproximadamente 2,5 GB en fp16/bf16 (pesos) más overhead de contexto; con cuantización de 4 bits puede reducirse a menos de 1 GB.
- GPUs recomendadas: RTX 3060, RTX 4060, RTX 4090, A10, A100 (cualquier GPU con al menos 4 GB de VRAM).
- Opciones de despliegue: transformers (con el código de ejemplo proporcionado), vLLM, llama.cpp, Ollama (tras conversión a GGUF), TGI.
- Latencia: 38,36 tokens/segundo en RTX 4060 en generación greedy de una sola solicitud; el throughput en batch dependerá del backend.

## Comparativa con modelos similares

La información proporcionada solo incluye comparación con el modelo base. No se dispone de datos de otros fine-tunes de matemáticas de tamaño similar para una comparativa directa.

| Modelo | Parametros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Llama-3.2-1B (base) | 1,24B | No disponible | 5,8% | Llama 3.2 |
| Este modelo | 1,24B | No disponible | 7,4% | Llama 3.2 |
| Otros fine-tunes de matemáticas 1B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado con una sola época sobre solo 5.000 ejemplos: no es un asistente generalista y su rendimiento fuera del dominio matemático es limitado.
- Las puntuaciones en MMLU, ARC, HellaSwag y WinoGrande reflejan un modelo base de 1B y deben interpretarse relativas al base, no frente a modelos mucho más grandes.
- No se aplicó alineación de seguridad ni RLHF adicional; el modelo hereda únicamente la alineación del base Llama-3.2-1B, por lo que puede generar contenido no deseado si se usa fuera de contexto matemático.
- Riesgo de alucinación en problemas matemáticos complejos: al ser un modelo pequeño, puede producir razonamientos plausibles pero incorrectos, especialmente en problemas multi-paso.
- Idioma limitado al inglés; no se ha evaluado su comportamiento en otros idiomas.
- La licencia llama3.2 permite uso comercial pero con restricciones específicas de Meta (por ejemplo, no usar para mejorar otros modelos grandes sin autorización); debe revisarse el texto completo de la licencia.
- No se documentan cuantizaciones oficiales ni soporte para contextos largos; se recomienda validar el comportamiento con la longitud de contexto real del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OliverSundaram/Llama-3.2-1B-MathCodeInstruct-5k
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/MathLLMs/MathCodeInstruct
- Repositorio de entrenamiento (write-up comparativo): https://github.com/OliverSundaram/finetuning-Llama3.2-1B
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Herramienta de evaluación: https://github.com/EleutherAI/lm-evaluation-harness
