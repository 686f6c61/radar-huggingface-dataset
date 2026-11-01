# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT-r16-a32-lr4e-4

## Resumen

LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT-r16-a32-lr4e-4 es un ajuste fino (fine-tuning) comunitario del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman-madhiai en Hugging Face. El nombre del repositorio sugiere que el entrenamiento se realizó sobre un dataset denominado "SmolDataEnvs-Easy-Recovery" mediante SFT (supervised fine-tuning), con parámetros LoRA visibles en el nombre (r16, alpha 32, learning rate 4e-4), aunque la model card no documenta el contenido del dataset ni los objetivos del ajuste.

El modelo base pertenece a la familia LFM2.5 de Liquid AI, una línea de modelos pequeños orientados a la eficiencia en dispositivos con recursos limitados. Con unos 354 millones de parámetros y licencia Apache 2.0, este derivado es relevante para desarrolladores que buscan modelos ligeros para inferencia local o en el borde (edge), y que necesitan un punto de partida ya afinado, presumiblemente para tareas de recuperación de datos o entornos de datos (a partir del nombre del dataset, no confirmado en la documentación).

El entrenamiento se realizó con la biblioteca Unsloth junto con TRL de Hugging Face, lo que permite entrenamientos aproximadamente dos veces más rápidos que con implementaciones estándar. La model card es mínima y no incluye benchmarks, ejemplos de uso ni detalles del entrenamiento, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (familia Liquid AI; detalles concretos no disponibles en la model card) |
| Parametros totales | 354.483.968 (dato real de safetensors) |
| Parametros activos | no disponible (no se confirma si es MoE; todo indica que es denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y endpoints) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un modelo de la familia LFM (Liquid Foundation Models) de Liquid AI. La familia LFM se caracteriza por arquitecturas híbridas que combinan capas convolucionales tipo gated linear con mecanismos de atención, diseñadas para reducir el coste de inferencia en contextos largos y en hardware limitado. No obstante, la model card de este derivado no especifica los detalles arquitectónicos exactos, por lo que deben consultarse los recursos del modelo base.

El ajuste fino se ejecutó con Unsloth y la biblioteca TRL de Hugging Face, lo que según el autor permitió entrenar "2x más rápido" que con implementaciones convencionales. Los parámetros de entrenamiento inferibles del nombre del repositorio son: LoRA con rank 16 (r16) y alpha 32 (a32), y una tasa de aprendizaje de 4e-4. El dataset empleado, presumiblemente "SmolDataEnvs-Easy-Recovery", no está documentado: no se conocen su tamaño, composición ni número de tokens de entrenamiento. Tampoco hay indicios de RLHF o DPO; todo apunta a un SFT supervisado sencillo.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica compatibilidad con formatos de chat.
- Ajuste fino orientado (según el nombre del repositorio) a tareas relacionadas con entornos de datos y recuperación de información sencilla; el alcance real no está documentado.
- Hereda las capacidades generales del modelo base LFM2.5-350M en ingles.
- Soporte de tool calling: no disponible.
- Capacidades multilingues: no disponible; el idioma declarado es únicamente el ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de ajustes finos ligeros: al pesar unos 2,1 GB el repositorio completo, es ideal para experimentar con LoRA y SFT en una sola GPU de consumo sin costes de infraestructura.
- Inferencia en el borde: con menos de 400 millones de parametros, puede desplegarse en portátiles, mini-PC o dispositivos edge para asistentes de texto sencillos en ingles.
- Asistente conversacional de dominio reducido: si el dataset de recuperación de datos se corresponde con su nombre, podría servir como asistente para consultas sobre entornos de datos, aunque conviene validarlo antes.
- Base para nuevos fine-tunings: al ser un SFT con LoRA (r16/a32), puede servir como punto de partida para ajustes adicionales con Unsloth o PEFT.
- Integracion en pipelines de texto en ingles: tareas de resumen, reformateo o extraccion simple donde el coste por token importa mas que la maxima calidad.
- Evaluacion comparativa de modelos pequenos: util como candidato en benchmarks internos frente a otros modelos de 300-400M parametros (Qwen, SmolLM, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones del ajuste fino frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,8-1 GB solo para los pesos (354M parametros x 2 bytes), mas overhead de KV cache; en la practica, 2-4 GB de VRAM son suficientes con contexto moderado.
- VRAM estimada con cuantizacion INT8/INT4: por debajo de 1 GB para los pesos, viable incluso en CPU o GPUs integradas.
- GPUs recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) ejecutara el modelo sin problemas; no se requiere hardware de centro de datos (A100/H100) para inferencia.
- Cabe sobradamente en GPUs de consumo, e incluso es ejecutable en CPU con llama.cpp si se convierte a GGUF (conversion no incluida en el repositorio segun la informacion disponible).
- Opciones de despliegue: transformers (libreria declarada), endpoints de inferencia de Hugging Face (endpoints_compatible), y Ollama o llama.cpp tras conversion; el uso de vLLM o TGI es posible dado el tamano reducido, aunque no esta documentado.
- Latencia y throughput estimados: no disponible; al ser un modelo de ~354M parametros, cabe esperar latencias bajas y throughput alto en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT (este) | 354M | no disponible | Apache 2.0 | SFT comunitario con LoRA r16/a32, sin benchmarks publicados |
| LiquidAI/LFM2.5-350M (base) | 354M | no disponible | Apache 2.0 | Modelo base oficial de Liquid AI, mejor documentado |
| HuggingFaceTB/SmolLM2-360M-Instruct | ~360M | 8.192 tokens | Apache 2.0 | Alternativa instruida de tamano similar, con benchmarks publicados |

Las tres opciones comparten franja de tamano (~350M) y licencia permisiva, aptas para inferencia local. La eleccion depende de si se necesita el ajuste especifico de este derivado o la mayor documentacion y trazabilidad del modelo base o de alternativas como SmolLM2.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe el dataset, los hiperparametros completos ni los resultados del entrenamiento, lo que dificulta evaluar la calidad del ajuste.
- Riesgo de alucinacion: propio de modelos de menos de 400M parametros; no hay evaluaciones que cuantifiquen este riesgo.
- Idioma limitado al ingles; no hay soporte declarado para castellano ni otras lenguas.
- Sesgos conocidos: no disponible; hereda presumiblemente los sesgos del modelo base y del dataset de SFT, ambos no documentados.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion sin restricciones relevantes mas alla de la atribucion.
- La busqueda web asociada al repositorio no arrojó resultados relevantes ni verificables sobre este modelo; no se han encontrado evaluaciones de terceros.
- Para produccion, se recomienda validar el modelo frente al base en el dominio de uso antes de desplegarlo, dado que no hay evidencia publica de mejora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-Recovery-SFT-r16-a32-lr4e-4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
