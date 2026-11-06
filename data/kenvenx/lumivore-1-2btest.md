# Kenvenx/lumivore-1.2btest

## Resumen

LumiVore-1.2B es un modelo de lenguaje con arquitectura Mixture-of-Experts (MoE) ajustado para flujos de trabajo agénticos e IA conversacional. Desarrollado por Kenvenx (bajo la organización LumiVore), parte del modelo base Qwen2.5-0.5B-Instruct y amplía su capacidad hasta 1,36 mil millones de parámetros totales, de los cuales solo unos 610 millones se activan por token mediante enrutamiento top-2. Su principal valor es demostrar que se puede entrenar un modelo MoE especializado en agentes íntegramente en hardware de consumo (una AMD RX 7600 XT de 16 GB en unas 10 horas).

El modelo se ha entrenado en dos etapas: una primera enfocada a capacidades generales de agente, uso de herramientas y razonamiento, y una segunda de especialización en el ecosistema OpenClaw. Está orientado a la generación de texto estructurado (JSON, markdown, código) y a conversaciones multi-turno, más que a la escritura creativa o al conocimiento factual, donde queda limitado por el tamaño de su modelo base.

Es relevante como ejemplo de MoE compacto y accesible, con licencia Apache 2.0 y pesos en safetensors compatibles con la librería transformers. Su longitud de contexto es de 2048 tokens y su precisión de entrenamiento es bfloat16, lo que lo hace muy ligero para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (estilo DeepSeek-MoE) sobre transformer Qwen2 |
| Parametros totales | 1,36 B (1.362.385.792) |
| Parametros activos | ~610 M por token (enrutamiento top-2) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | bfloat16 (no disponible información sobre cuantizaciones adicionales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (endpoints_compatible, librería transformers) |

## Arquitectura y entrenamiento

LumiVore-1.2B emplea una arquitectura Mixture-of-Experts con 8 expertos en total: 1 experto compartido (siempre activo) y 7 expertos enrutados. Para cada token, el router selecciona 2 expertos (el compartido más uno enrutado), lo que da lugar a una activación dispersa de unos 610 millones de parámetros por token pese a los 1,36 B totales. Solo 8 de las 24 capas del transformer son MoE. El entrenamiento incorpora pérdidas auxiliares de balanceo de carga para asegurar una utilización uniforme de los expertos. El objetivo del diseño es ofrecer la capacidad de un modelo mayor con el coste de inferencia de uno más pequeño.

El entrenamiento se realizó en dos etapas sobre los datasets LumiVore/lumivore-stage1-training-data y LumiVore/lumivore-stage2-training-data. La etapa 1 (construcción de capacidades) usó TerminalTrajectories y OpenThoughts, unos 11.600 ejemplos, con fine-tuning completo más LoRA en las capas de enrutamiento durante unas 5,4 horas, orientada a capacidades generales de agente, uso de herramientas y razonamiento. La etapa 2 (adaptación de dominio) empleó unos 11.900 ejemplos específicos del ecosistema OpenClaw con LoRA de rango 64 sobre atención y enrutamiento, durante unas 5 horas. Todo el proceso se ejecutó en una AMD RX 7600 XT de 16 GB con PyTorch sobre ROCm y optimizador AdamW de 8 bits, sumando unas 10 horas en total. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto conversacional con seguimiento de contexto multi-turno.
- Uso de herramientas en flujos agénticos: llamada de funciones y seguimiento de patrones de tool calling.
- Generación de salidas estructuradas: JSON, markdown y código.
- Razonamiento, apoyado en los datos de entrenamiento de la etapa 1 (TerminalTrajectories y OpenThoughts).
- Especialización en el ecosistema OpenClaw para tareas de agentes.
- No es un objetivo de entrenamiento la escritura creativa, y el conocimiento factual está limitado por el tamaño del modelo base (Qwen2.5-0.5B).
- No hay información disponible sobre capacidades de visión, audio ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Agentes conversacionales ligeros: el modelo está entrenado para conversación multi-turno con seguimiento de contexto, adecuado para chatbots embebidos donde la VRAM es limitada.
- Orquestación de herramientas en pipelines agénticos: su entrenamiento con TerminalTrajectories y datos de OpenClaw lo hace idóneo para agentes que invocan funciones y siguen patrones de tool calling.
- Generación de salidas estructuradas: puede producir JSON y markdown para integrarse en sistemas que requieren respuestas parseables, como APIs internas o automatizaciones.
- Especialización en el ecosistema OpenClaw: la etapa 2 de fine-tuning lo orienta a tareas concretas de ese ecosistema de agentes.
- Prototipado y experimentación con MoE: al ser un MoE compacto entrenado en hardware de consumo, sirve como referencia reproducible para investigadores sin acceso a centros de datos.
- Ejecución local en GPU de consumo: con 3,5 GB de repositorio y precisión bfloat16, cabe en GPUs de 8-16 GB, útil para desarrollo local y pruebas de agentes offline.
- Asistente de línea de comandos: el entrenamiento con datos de terminal sugiere utilidad para asistentes que generan comandos y siguen trayectorias de shell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una evaluación cualitativa de prioridades (uso agéntico de herramientas, salidas estructuradas y flujo conversacional como puntos fuertes; escritura creativa secundaria y conocimiento factual limitado), sin métricas numéricas de MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 2,7-3 GB solo de pesos (repo de 3,5 GB), más la sobrecarga de KV cache y runtime; viable en GPUs de 6-8 GB con contexto de 2048 tokens.
- GPU recomendadas: cualquier GPU moderna de consumo; el propio entrenamiento se realizó en una AMD RX 7600 XT de 16 GB, por lo que la inferencia es accesible incluso en hardware modesto.
- Consumer GPU: cabe cómodamente en GPUs como la RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RX 7600 XT de 16 GB; probablemente también en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (librería nativa del modelo); no hay información disponible sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al requerir trust_remote_code=True y usar una arquitectura qwen2_moe modificada, la compatibilidad con runtimes alternativos debe verificarse caso por caso.
- Latencia y throughput: no disponible. Al activar solo ~610 M de parámetros por token, se esperan latencias propias de un modelo de ese tamaño activo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| LumiVore-1.2B | 1,36 B | ~610 M | 2048 | Apache 2.0 | Agentes y conversación (fine-tune de Qwen2.5-0.5B) |
| Qwen2.5-0.5B-Instruct (base) | 0,5 B | 0,5 B (denso) | 32.768 (128K con RoPE scaling) | Qwen Research / Apache 2.0 (según versión) | Modelo instructivo generalista |
| Qwen3-30B-A3B (referencia MoE) | 30 B | 3 B | 32.768 | Apache 2.0 | MoE generalista de mayor escala |
| OLMoE-1B-7B (AllenAI) | 7 B | 1 B | 4.096 | Apache 2.0 | MoE abierto generalista |

LumiVore-1.2B se distingue por su especialización agéntica y su entrenamiento íntegramente en hardware de consumo, pero su contexto de 2048 tokens es muy inferior al de las alternativas y su base de 0,5 B limita el conocimiento factual frente a modelos como OLMoE-1B-7B.

## Limitaciones y advertencias

- Base pequeña: al construirse sobre Qwen2.5-0.5B-Instruct, hereda sus limitaciones fundamentales, especialmente en conocimiento factual.
- Escala de entrenamiento reducida: unos 23.000 ejemplos en total, frente a los millones de los modelos de producción, lo que restringe la generalización.
- Problemas de identidad: puede afirmar ocasionalmente ser otros modelos (GPT-4, Qwen, etc.).
- Verbosidad: tiende a ser prolijo; se recomienda usar system prompts para guiar la concisión.
- Sin RLHF: no se aplicó aprendizaje por refuerzo con feedback humano, lo que puede traducirse en respuestas menos alineadas con preferencias humanas.
- Contexto corto: 2048 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Idioma: entrenado solo en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos conocidos: no disponible; no se documenta ninguna auditoría de sesgos.
- Riesgo de alucinación: elevado dada la base de 0,5 B y la ausencia de RLHF; no debe usarse como fuente factual sin verificación.
- Uso comercial: la licencia Apache 2.0 permite el uso comercial sin restricciones destacables.
- Para producción: requiere trust_remote_code=True, lo que implica ejecutar código del repositorio; conviene auditarlo antes de desplegar. Escritura creativa y conocimiento factual no son puntos fuertes del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Kenvenx/lumivore-1.2btest
- GitHub: https://github.com/dansan-claw/lumivore
- Sitio web: https://lumivore.ai
- Discord: https://discord.gg/M7U8JCUukD
- Organización LumiVore (datasets): https://huggingface.co/LumiVore
- Dataset etapa 1: https://huggingface.co/datasets/LumiVore/lumivore-stage1-training-data
- Dataset etapa 2: https://huggingface.co/datasets/LumiVore/lumivore-stage2-training-data
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
