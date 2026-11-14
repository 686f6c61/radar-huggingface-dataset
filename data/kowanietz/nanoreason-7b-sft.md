# kowanietz/NanoReason-7B-SFT

## Resumen

NanoReason-7B-SFT es un checkpoint de investigación publicado por el usuario independiente kowanietz, fruto de un ajuste fino supervisado (SFT) del modelo OLMo 3 7B de Ai2 sobre trazas de razonamiento del dataset Dolci-Think-SFT-7B. Constituye la primera etapa del pipeline de post-entrenamiento orientado a razonamiento de la serie NanoReason, que continúa con las variantes SFT-Refined y Think. El modelo no está afiliado a Ai2 y se distribuye bajo licencia Apache 2.0.

El objetivo es dotar a un modelo base de 7.298 millones de parámetros de capacidad de razonamiento paso a paso mediante SFT sobre 100.000 ejemplos muestreados, con secuencias empaquetadas de 16.384 tokens y 6.000 pasos de optimización a una tasa de aprendizaje de 1,5e-5. El entrenamiento se realizó en un único nodo de 4 GPU NVIDIA A100 de 40 GB, consumiendo aproximadamente 92 horas-GPU en esta etapa.

Su relevancia radica en que demuestra que es posible obtener mejoras sustanciales en benchmarks de razonamiento (MATH-500 pasa de 63,00 a 88,40; AIME 2024 de 12,08 a 30,21) con un presupuesto de cómputo modesto sobre un modelo abierto. Es un artefacto de investigación reproducible, con código, configuraciones y resultados publicados en el repositorio GitHub del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (evaluación); entrenamiento con secuencias de 16.384 tokens |
| Tipos de cuantización | no disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del OLMo 3 7B de Ai2, un transformer decoder-only de 7.298 millones de parámetros. Los pesos preentrenados proceden de allenai/Olmo-3-1025-7B, mientras que el tokenizador y la plantilla de chat provienen de OLMo 3 Think-SFT. El ajuste se realizó sobre el dataset allenai/Dolci-Think-SFT-7B, del que se muestreó un pool de 100.000 ejemplos (104.528 turnos de usuario). El schedule consistió en 6.000 pasos de optimizador con learning rate de 1,5e-5 y secuencias empaquetadas de 16.384 tokens.

No se especifica en la información disponible si hubo fases de RLHF o DPO en esta etapa; se trata exclusivamente de SFT. Una auditoría del pool de origen encontró cero coincidencias exactas normalizadas con prompts de benchmark, aunque el propio autor advierte que las comprobaciones de coincidencia exacta no descartan paráfrasis ni solapamiento con el preentrenamiento. El entrenamiento se ejecutó en 4× NVIDIA A100 40 GB (un solo nodo) durante unas 92 horas-GPU.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con `transformers`.
- Razonamiento paso a paso (traza de pensamiento) inducido por SFT sobre trazas de razonamiento de Dolci.
- Razonamiento matemático: mejoras notables en MATH-500, AIME 2024 y AIME 2025.
- Razonamiento científico de nivel graduate (GPQA Main).
- Instrucciones y seguimiento de formato (IFEval).
- Razonamiento multi-paso general (BBH).
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en post-entrenamiento: sirve como punto de partida reproducible para estudiar el efecto del SFT sobre razonamiento en modelos abiertos de 7B, con configuraciones y resultados publicados.
- Evaluación comparativa de pipelines de razonamiento: al formar parte de una serie (Base → SFT → SFT-Refined → Think), permite aislar la contribución de cada etapa sobre los mismos benchmarks.
- Generación de soluciones matemáticas paso a paso: adecuado para prototipos de tutores o asistentes que necesitan mostrar el desarrollo de un problema, dado su rendimiento en MATH-500 (88,40).
- Experimentación académica con recursos limitados: entrenable y desplegable en un nodo de 4× A100 40 GB, lo que lo hace accesible para laboratorios con presupuesto moderado.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en safetensors, puede servir como inicialización para SFT adicional o RLVR en dominios específicos.
- Evaluación de robustez y alucinación en razonamiento: útil para estudiar el fenómeno de generaciones largas que agotan el presupuesto de tokens antes de emitir una respuesta final, documentado por el autor.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; evaluados con OLMES/vLLM en BF16 y contexto de 32.768 tokens):

| Benchmark | Base | SFT | Refined | Think |
|---|---:|---:|---:|---:|
| GPQA Main | 28,79 | 32,37 | 42,63 | 41,74 |
| MATH-500 | 63,00 | 88,40 | 91,00 | 91,00 |
| AIME 2024 | 12,08 | 30,21 | 45,83 | 45,31 |
| AIME 2025 | 14,17 | 26,35 | 33,33 | 33,33 |
| BBH | no disponible | 60,34 | 67,61 | 69,19 |
| IFEval | 34,57 | 63,77 | 72,64 | 72,64 |

Notas de evaluación: GPQA Main con exact match (448 preguntas), MATH-500 con flexible exact match, AIME con media pass@1 (30 problemas por año, 32 muestras cada uno), BBH con micro exact match e IFEval con prompt-level loose accuracy. La comparación con Base usa el tokenizador y la plantilla de chat de Think-SFT. El resultado de Base en BBH no se completó.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 14,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para inferencia cómoda con contexto largo.
- GPU recomendadas: A100 40 GB u 80 GB para evaluación con contexto de 32.768 tokens; H100 para mayor throughput.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en BF16 para contextos moderados; en cuantización de 8 bits o 4 bits podría caber en GPUs de 16 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: `transformers` (requiere `transformers>=5.19.0`, `torch` y `accelerate`), vLLM (usado en la evaluación con OLMES). No se documenta soporte explícito de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NanoReason-7B-SFT | 7,298 B | 32.768 (eval) | Apache 2.0 | SFT sobre Dolci; foco en razonamiento |
| OLMo 3 7B (base) | 7,298 B | no disponible | Apache 2.0 | Modelo base de Ai2; referencia de partida |
| NanoReason-7B-SFT-Refined | no disponible | no disponible | Apache 2.0 | Etapa posterior de la misma serie |
| NanoReason-7B-Think | no disponible | no disponible | Apache 2.0 | Etapa final de la serie |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Las generaciones largas a menudo agotan el presupuesto de tokens antes de producir la respuesta final; el autor indica que este comportamiento se reduce en etapas posteriores.
- Solo soporta inglés según la model card; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a modelos de 7B entrenados con SFT; no se han publicado evaluaciones específicas de factualidad.
- La auditoría del pool de SFT encontró cero coincidencias exactas con prompts de benchmark, pero no descarta paráfrasis ni solapamiento con el preentrenamiento, por lo que los resultados podrían estar parcialmente contaminados.
- Es un checkpoint de investigación, no un modelo afinado para producción; no se documentan garantías de robustez, seguridad ni alineación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no está afiliado a Ai2 y no ofrece garantías; conviene revisar el archivo NOTICE del repositorio.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni soporte de tool calling o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kowanietz/NanoReason-7B-SFT
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Tokenizador y plantilla de chat: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Think-SFT-7B
- Repositorio GitHub (código, configs, evaluación): https://github.com/kowanietz/nanoreason
- Configuración de entrenamiento: https://github.com/kowanietz/nanoreason/blob/main/configs/sft/packed-6k.yaml
- Resultados y ajustes de evaluación: https://github.com/kowanietz/nanoreason/tree/main/results
- Etapa SFT-Refined: https://huggingface.co/kowanietz/NanoReason-7B-SFT-Refined
- Etapa Think: https://huggingface.co/kowanietz/NanoReason-7B-Think
- Licencia: https://huggingface.co/kowanietz/NanoReason-7B-SFT/blob/main/LICENSE
- NOTICE: https://huggingface.co/kowanietz/NanoReason-7B-SFT/blob/main/NOTICE
