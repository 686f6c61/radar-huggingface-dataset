# Maincode/Matilda-Platypus-11B-Base

## Resumen

Matilda Platypus 11B es un modelo lingüístico de tamaño intermedio desarrollado por Maincode (Matilda Research) mediante una técnica de "Representation Bridge": conecta las capas inferiores de Qwen3-14B-Base con las capas superiores de Qwen3-8B-Base a través de un mapa lineal aprendido que alinea las representaciones ocultas en el punto de unión. El resultado es un modelo de 11,42B parámetros que consume un 76% del cómputo por token del padre grande (22,0 frente a 28,8 GFLOP por token) y que, según la evaluación del autor, se sitúa entre ambos padres en la mayoría de benchmarks.

El checkpoint aquí descrito es el miembro de 11B de la familia (corte `18+21`: 18 capas del padre grande seguidas de 21 del padre pequeño). Es un modelo base, sin ajuste por instrucciones ni afinado de seguridad, por lo que está pensado como fundamento para tareas de continuación de texto y para posterior fine-tuning, no como asistente conversacional.

Su relevancia radica en que demuestra una vía alternativa al entrenamiento desde cero o al pruning: construir modelos de tamaño arbitrario "a la carta" combinando pesos preentrenados existentes, con una fase de adaptación relativamente ligera (pocos miles de millones de tokens) frente al coste de un preentrenamiento completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (híbrido por ensamblado de capas: 18 capas de Qwen3-14B-Base + Representation Bridge + 21 capas de Qwen3-8B-Base) |
| Parametros totales | 11,42B (incluye 21,0M del bridge) |
| Parametros activos | No aplica (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | No disponible (hereda el tokenizador de Qwen3; no se especifica ventana en la model card) |
| Tipos de cuantizacion | No disponible (solo se distribuye en bfloat16) |
| Idiomas soportados | No disponible (heredados de los padres Qwen3; tokenizador Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bridge.safetensors + upper_block/; el bloque inferior se carga desde el hub de Qwen3-14B-Base) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer entrenado de forma convencional, sino un ensamblado: el forward pass ejecuta el embedding y las capas 1–18 de Qwen3-14B-Base (congeladas en sus pesos originales), atraviesa un Representation Bridge (una única capa lineal de 5120 a 4096 unidades ocultas, 21,0M de parámetros), y continúa por las capas 16–36 de Qwen3-8B-Base, ligeramente adaptadas mediante actualizaciones de bajo rango (LoRA fusionadas en los pesos publicados), seguidas de su normalización final y cabeza de salida. El tokenizador es el de Qwen3. La decodificación soporta greedy y sampling estándar de `transformers`, pero no beam search (lanza `NotImplementedError`).

El entrenamiento consta de tres fases: (1) inicialización del bridge por mínimos cuadrados sobre un pequeño conjunto de calibración, usando la pérdida de modelado del lenguaje para seleccionar el corte óptimo entre candidatos; (2) adaptación supervisada del bridge y de las actualizaciones de bajo rango sobre unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones razonadas, con el bloque inferior congelado; (3) una etapa breve de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre problemas de código con tests unitarios y problemas matemáticos con respuesta comprobable. No se especifica si hubo RLHF clásico o DPO.

## Capacidades

- Continuación de texto en formato base (modelado del lenguaje puro, sin plantilla de instrucciones).
- Generación y ejecución de código: 0,677 pass@1 en HumanEval y 0,666 en MBPP, igualando al padre de 8B en HumanEval.
- Razonamiento matemático con cadena de pensamiento: 0,885 en GSM8K (8-shot CoT), por encima de ambos padres.
- Razonamiento genérico multi-paso evaluado con BBH 3-shot CoT (0,746).
- Comprensión de lectura y preguntas cerradas: 0,864 en BoolQ, 0,747 en WinoGrande.
- Compatibilidad total con lm-eval-harness (`--model hf --model_args pretrained=...,trust_remote_code=True`) y con la API estándar de `generate` de `transformers` (temperature, top_k, top_p, stopping_criteria, streamer, etc.).
- No soporta tool calling, function calling ni modos de agente: al no estar afinado por instrucciones, estas capacidades no están presentes ni garantizadas.

## Casos de uso

- Fine-tuning por instrucciones para asistentes propios: al ser un modelo base con licencia Apache 2.0, es un punto de partida idóneo para SFT/DPO en dominios concretos (legal, médico, técnico) partiendo de pesos de calidad intermedia entre Qwen3-8B y 14B.
- Investigación sobre ensamblado y distilación de modelos: el método Representation Bridge es reproducible y documentado en el informe técnico, útil para experimentar con cortes alternativos y familias de modelos "a la carta".
- Generación de código como base afinada: con 0,677 pass@1 en HumanEval, tras un SFT con datos de instrucciones de código puede servir para autocompletado o generación de funciones en entornos controlados.
- Razonamiento matemático con verificación: su puntuación destacada en GSM8K lo hace buen candidato para fine-tuning adicional con RLVR en pipelines de resolución de problemas con respuestas comprobables.
- Evaluación comparativa estandarizada: al ejecutarse sin cambios bajo lm-eval-harness, es útil como baseline intermedio en estudios de escalado y comparación de métodos de construcción de modelos.
- Despliegue con presupuesto de cómputo reducido: con 22,0 GFLOP por token frente a 28,8 del padre de 14B, ofrece un compromiso entre coste de inferencia y calidad para cargas batch offline (extracción de datos, resumen masivo, clasificación a escala).
- Continuación de documentos y corpus: como modelo base, sirve para tareas de generación de texto largo en estilo dominado por el prompt, sin necesidad de formato de chat.

## Benchmarks y rendimiento

Evaluación de modelo base con lm-eval-harness 0.4.13, protocolo idéntico para el modelo y ambos padres (0-shot salvo indicación; MMLU 5-shot, GSM8K 8-shot CoT, BBH 3-shot CoT, HumanEval 0-shot y MBPP 3-shot con código ejecutado). Datos publicados por el autor:

| Benchmark | Qwen3-8B-Base | Platypus 11B | Qwen3-14B-Base |
|---|---|---|---|
| HumanEval pass@1 | 0,677 | 0,677 | 0,720 |
| GSM8K (8-shot CoT) | 0,856 | 0,885 | 0,870 |
| MMLU (5-shot) | 0,768 | 0,749 | 0,805 |
| BBH (3-shot CoT) | 0,774 | 0,746 | 0,788 |
| HellaSwag | 0,786 | 0,774 | 0,814 |
| ARC-Easy | 0,798 | 0,737 | 0,819 |
| ARC-Challenge | 0,572 | 0,518 | 0,588 |
| OpenBookQA | 0,416 | 0,448 | 0,480 |
| WinoGrande | 0,723 | 0,747 | 0,747 |
| PIQA | 0,794 | 0,800 | 0,824 |
| LAMBADA | 0,711 | 0,705 | 0,742 |
| MBPP pass@1 | 0,686 | 0,666 | 0,748 |
| BoolQ | 0,832 | 0,864 | 0,865 |

Supera al padre pequeño en 5 de 13 benchmarks y al padre grande en 2 de 13, con un 76% del cómputo por token del padre grande. El propio autor advierte que las diferencias de unas décimas están dentro de la varianza entre ejecuciones y que la medida de cómputo no es una medición verificada de latencia ni de coste.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 16,5 GB en bfloat16; con los pesos del modelo (11,42B parámetros) más el bloque inferior cargado dinámicamente, se estima en torno a 24–28 GB de VRAM en bfloat16 sin cuantización (dato exacto no disponible).
- GPU recomendadas: una RTX 4090 (24 GB) está justo en el límite y puede requerir offload o cuantización; una A100 de 40/80 GB o H100 ofrecen margen cómodo para inferencia y fine-tuning.
- Consumer GPU: no cabe con holgura en GPUs de 16 GB; en una RTX 4090 de 24 GB es viable en bfloat16 con ajustes, o mediante cuantización si aparecen conversiones GGUF/AWQ (no disponibles oficialmente a fecha de redacción).
- Opciones de despliegue: `transformers >= 4.56` (probado en 4.56 y 5.x) con `trust_remote_code=True` es la vía soportada; el código remoto carga el bloque inferior desde `Qwen/Qwen3-14B-Base`, por lo que ese repositorio debe estar accesible. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama; el soporte de beam search no está implementado.
- Latencia y throughput: no disponible; el autor solo publica cómputo relativo por token (22,0 GFLOP, un 76% del padre de 14B), que no es una medición de latencia verificada.

## Comparativa con modelos similares

| Característica | Platypus 11B | Qwen3-8B-Base | Qwen3-14B-Base |
|---|---|---|---|
| Parametros | 11,42B | 8B | 14B |
| Cómputo por token | 22,0 GFLOP | 15,7 GFLOP | 28,8 GFLOP |
| MMLU (5-shot) | 0,749 | 0,768 | 0,805 |
| GSM8K (8-shot CoT) | 0,885 | 0,856 | 0,870 |
| HumanEval pass@1 | 0,677 | 0,677 | 0,720 |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Disponibilidad | Hub (safetensors + código remoto) | Hub, amplio ecosistema | Hub, amplio ecosistema |

Frente a sus padres, Platypus 11B se posiciona como compromiso: mejor que el 8B en GSM8K, WinoGrande, OpenBookQA, PIQA y BoolQ, pero por debajo en MMLU, BBH, ARC y MBPP. Su ecosistema de despliegue es mucho más limitado que el de los modelos Qwen3 oficiales, que cuentan con soporte nativo en vLLM, TGI y cuantizaciones estándar.

## Limitaciones y advertencias

- Es un modelo base: no está afinado por instrucciones ni con ajustes de seguridad, por lo que puede generar contenido ofensivo, inexacto o no deseado si se usa directamente como asistente.
- Riesgo de alucinación inherente a un modelo base sin RLHF/DPO clásico; la etapa de RLVR solo cubre código y matemáticas verificables.
- Los sesgos y el conocimiento derivan íntegramente de los dos padres Qwen3 y de los datos de adaptación; los idiomas soportados no están documentados explícitamente para este checkpoint.
- Diferencias de unas décimas frente a los padres en benchmarks están dentro de la varianza entre ejecuciones, según el propio autor; no debe sobreinterpretarse la ventaja en GSM8K.
- La medida de cómputo (76% del padre grande) es una normalización relativa del informe, no una medición verificada de latencia o coste.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; revisar el código remoto antes de usarlo en producción.
- No soporta beam search y requiere `transformers >= 4.56`; sin soporte documentado para vLLM, TGI, llama.cpp ni Ollama.
- Atención a la versión del código remoto: la revisión 1 ignoraba `max_length` y `stopping_criteria` y truncaba respuestas (subestimando GSM8K a ~0,58); usar la revisión 2 (2026-10-31) o posterior. Los pesos del modelo no cambiaron.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales significativas, pero los términos de los padres Qwen3 (también Apache 2.0) deben respetarse en derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maincode/Matilda-Platypus-11B-Base
- Informe técnico: `technical_report.pdf`, incluido en el repositorio del modelo.
- Padre grande: https://huggingface.co/Qwen/Qwen3-14B-Base
- Padre pequeño: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper de Qwen3 citado: arXiv:2505.09388 (https://arxiv.org/abs/2505.09388)
- Cita del informe: Maincode Team (Yue Yang, Arsh Chawla, David Lemphers). *Matilda Platypus: Any Size You Want. Intelligence You Need.* Technical report, Maincode / Matilda Research, October 2026.
