# AETHORIA-AI/TR-HASH-MoE-200M-160B-Reasoning-Preservation-50M

## Resumen

TR-HASH MoE 200M — Reasoning Preservation 50M es un modelo experimental de razonamiento post-entrenamiento desarrollado por AETHORIA-AI, que parte del checkpoint SFT v2 de la familia TR-HASH MoE 200M. Se trata de un ajuste fino completo de 201,2 millones de parámetros con una única pasada determinista de 200 millones de tokens, diseñado para mejorar el razonamiento generativo del modelo sin degradar el comportamiento asistente general ni las capacidades zero-shot del SFT original.

El modelo utiliza una arquitectura MoE decoder-only con 16 capas, atención de consulta agrupada (GQA) con 14 cabezas de consulta y 2 cabezas clave/valor, cuatro expertos TR-Hash almacenados con activación top-2 por token, una ruta SwiGLU compartida siempre activa y embeddings atados. La mezcla de entrenamiento combina una repetición del SFT v2 (150M tokens) con un subconjunto filtrado de razonamiento (50M tokens) de fuentes verificadas como OpenR1, Numina, Luciole y código ejecutable.

El estado actual es de entrenamiento en curso: se publican checkpoints intermedios en `training/reasoning-preservation-50m/checkpoints/` y ningún checkpoint se promueve a la raíz del repositorio hasta que supere una evaluación de preservación que incluye criterios de retención de PIQA, ARC y un panel de regresión asistente. No se han publicado resultados de benchmarks numéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE decoder-only con GQA, routing TR-Hash y shared SwiGLU |
| Parametros totales | 201,2M |
| Parametros activos | no disponible (top-2 de 4 expertos + shared path) |
| Longitud de contexto | 2.048 tokens (entrenamiento); tokenizer de 32K |
| Tipos de cuantizacion | no disponible (entrenado en BF16) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch (.pt) en `training/`; sin SafeTensors promocionado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del SFT base: 16 capas decoder, GQA con 14 cabezas de consulta y 2 cabezas clave/valor, cuatro expertos TR-Hash almacenados con routing determinista multi-hash basado en token-ID y capa, top-2 activos por token, y una ruta SwiGLU compartida siempre activa. Los embeddings y la cabeza de lenguaje están atados. El modelo completo de 201,2M parámetros se ajusta en un solo pase de época completa.

El entrenamiento de preservación de razonamiento usa 200.002.668 tokens formateados, con una mezcla de 150.000.130 tokens de repetición del SFT v2 (para preservar comportamiento conversacional, instrucciones, código y habilidades generales) y 50.002.538 tokens de razonamiento filtrado (matemáticas verificadas de OpenR1 y Numina, razonamiento STEM de Luciole, código ejecutable de self-OSS y instrucciones restringidas). La configuración incluye LR 1.5e-7, warmup 3%, AdamW con betas 0.9/0.95 y weight decay 0.1, precisión BF16, contexto 2.048, sequence packing y pérdida Liger cross-entropy. El entrenamiento se ejecuta en 4× RTX 5090 con DDP/NCCL. No se usa RLHF ni DPO; solo supervisado.

## Capacidades

- Generación de texto en inglés con pipeline `text-generation`.
- Razonamiento generativo mejorado en matemáticas, STEM y código ejecutable (objetivo del post-entrenamiento).
- Preservación de habilidades de asistente conversacional, instrucciones y código del SFT v2 original.
- Soporte de razonamiento multi-paso con respuestas de respuesta restringida (constrained-answer).
- Sin soporte de vision, audio ni tool calling (no documentado).
- Capacidades multilingües limitadas a inglés (declarado `language: en`).

## Casos de uso

- Investigación en eficiencia de MoE: el modelo es un banco de pruebas para evaluar el impacto de un post-entrenamiento de razonamiento sobre un checkpoint SFT con routing hash determinista, útil para estudiar la preservación de capacidades en modelos pequeños.
- Asistente de razonamiento matemático: los datasets de OpenR1 y Numina incluidos en la mezcla permiten usar el modelo para resolver problemas de matemáticas verificadas con respuesta restringida.
- Generación de código ejecutable: la inclusión de código self-OSS y la capacidad de razonamiento permiten su uso como generador de código básico, aunque limitado a 200M parámetros.
- Fine-tuning posterior: los checkpoints intermedios incluyen estado de optimizador y permiten reanudar entrenamiento exacto (exact-resume) para experimentos de continuación.
- Evaluación de preservación de capacidades: el modelo sirve como punto de comparación para medir la degradación de capacidades cero-shot tras un post-entrenamiento de razonamiento, con protocolos definidos en el repositorio.
- Educación y experimentación: al ser Apache-2.0 y con arquitectura documentada, es útil para formación en MoE, GQA y routing hash en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe criterios de evaluación internos (PIQA normalized accuracy, Combined ARC, panel de regresión asistente y una sonda de razonamiento generativo ARC de 64 preguntas), pero no se proporcionan valores numéricos. Además, ARC, PIQA, GSM8K y HellaSwag se excluyen explícitamente de la mezcla de entrenamiento para evitar contaminación de benchmarks.

## Requisitos de hardware

- Entrenamiento: 4× RTX 5090 con DDP/NCCL, precisión BF16, contexto 2.048 y batch de 200M tokens por pasada.
- Inferencia: con 201,2M parámetros, la VRAM estimada es de ~0,8 GB en cuantización con contexto 2K (según llm-explorer).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB VRAM (RTX 3060, RTX 4090, etc.) es suficiente para inferencia.
- Opciones de despliegue: no documentadas específicamente; al ser un modelo PyTorch estándar, puede integrarse con vLLM, llama.cpp u Ollama, aunque no hay configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con modelos externos en la información proporcionada. Dentro de la misma familia, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TR-HASH-MoE-200M-130B | 201,2M | 2.048 | Apache-2.0 | Base pretrained, 70B tokens únicos |
| TR-HASH-MoE-200M-160B-SFT | 201,2M | 2.048 | Apache-2.0 | SFT v2, base de este modelo |
| TR-HASH-MoE-200M-160B-Reasoning-Preservation-50M | 201,2M | 2.048 | Apache-2.0 | Post-entrenamiento de razonamiento (este modelo) |

No hay datos de rendimiento numérico comparado para estos modelos.

## Limitaciones y advertencias

- Estado experimental: el entrenamiento está en curso y ningún checkpoint ha sido promovido a la raíz; el modelo puede no estar listo para producción.
- Idioma: solo inglés; no hay soporte para otros idiomas.
- Tamaño limitado: con 201,2M parámetros, la calidad de generación y razonamiento es menor que modelos de miles de millones de parámetros.
- Contexto corto: ventana de 2.048 tokens, limitada para tareas de contexto largo.
- Riesgo de alucinación: no se han publicado evaluaciones de sesgos o fiabilidad.
- Contaminación de benchmarks: se excluyen ARC, PIQA, GSM8K y HellaSwag del entrenamiento, pero no se garantiza ausencia de solapamiento en otras fuentes.
- Licencia: Apache-2.0 para el checkpoint; los datasets de origen conservan sus propias licencias.
- Sin tool calling ni capacidades multimodales: no se documentan soporte de funciones, visión ni audio.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-Reasoning-Preservation-50M
- HuggingFace (base SFT): https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT
- HuggingFace (base 130B): https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-130B
- Perfil del autor: https://huggingface.co/AETHORIA-AI
- Paper técnico TR-Hash 200M: https://www.complexity-ai.fr/papers/tr-hash-200m-multi-hash-routing.pdf
- Framework Complexity: https://github.com/Complexity-ML/complexity-framework
- Entrada en llm-explorer: https://llm-explorer.com/model/AETHORIA-AI%2FTR-HASH-MoE-200M-130B,2ywNBgf5Ib6BWNI9cWMj
