# Maincode/Matilda-Platypus-6B-Base

## Resumen

Matilda Platypus 6B es un modelo de lenguaje de tamaño intermedio desarrollado por Maincode (Matilda Research) mediante una técnica de "puente de representaciones" (Representation Bridge): se conectan las capas inferiores de un modelo Qwen3-8B-Base preentrenado con las capas superiores de un Qwen3-4B-Base, alineando las representaciones ocultas en la unión mediante un mapa lineal aprendido. El resultado es un modelo de 6,22B parámetros que se sitúa, en la mayoría de benchmarks, por encima del padre pequeño y con una fracción del coste computacional del padre grande (11,8 GFLOP por token frente a 15,7, un 75 % del cómputo del Qwen3-8B-Base).

El problema que resuelve es la falta de granularidad en el escalado de modelos abiertos: en lugar de esperar a que exista un checkpoint preentrenado del tamaño exacto deseado, el método permite construir modelos de tamaño arbitrario combinando padres existentes. Este checkpoint concreto usa el corte `17+19` (17 capas del 8B seguidas de 19 capas del 4B). Se trata de un modelo base (sin ajuste por instrucciones), entrenado con adaptación supervisada sobre unos pocos miles de millones de tokens y una etapa final de RL con recompensas verificables en código y matemáticas. Es relevante porque ofrece un punto de rendimiento intermedio con licencia Apache 2.0 y pesos en safetensors, compatible con la librería `transformers` (versión 4.56 o superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido por ensamblado de capas: capas 1–17 de Qwen3-8B-Base + Representation Bridge (lineal) + capas 18–36 de Qwen3-4B-Base |
| Parametros totales | 6,22B |
| Parametros activos | 6,22B (no es MoE; el bridge aporta 10,5M adicionales) |
| Longitud de contexto | no disponible (hereda la del tokenizer Qwen3, pero no se indica en la documentación) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin cuantizaciones oficiales publicadas) |
| Idiomas soportados | no disponible de forma explícita; hereda la cobertura de los padres Qwen3 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bridge.safetensors y upper_block/); requiere custom code (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer entrenado desde cero, sino un ensamblado: el paso hacia adelante consiste en el embedding y las capas 1–17 de `Qwen3-8B-Base`, seguidos de un Representation Bridge (una única transformación lineal de 4096 a 2560 unidades ocultas, con 10,5M de parámetros), y después las capas 18–36 de `Qwen3-4B-Base` con su normalización final y cabeza de salida. El bloque inferior permanece congelado con los pesos originales publicados; el bloque superior se adapta ligeramente mediante actualizaciones de bajo rango (LoRA) ya fusionadas en los pesos distribuidos. Se mantiene un KV cache por bloque. El tokenizer es el de Qwen3.

El entrenamiento sigue tres fases: (1) inicialización del bridge por mínimos cuadrados sobre un pequeño conjunto de calibración, usando la pérdida de modelado del lenguaje para seleccionar el punto de corte; (2) adaptación supervisada del bridge y de las actualizaciones de bajo rango sobre unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones razonadas; (3) una etapa corta de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre problemas de código con tests unitarios y problemas de matemáticas con respuesta comprobable. No se menciona RLHF clásico ni DPO.

## Capacidades

- Modelado del lenguaje base: continuación de texto, completado y generación libre (no está ajustado a instrucciones ni con tuning de seguridad).
- Generación de código: HumanEval pass@1 de 0,652 y MBPP pass@1 de 0,668 en evaluación base.
- Razonamiento matemático: GSM8K (8-shot CoT) de 0,873, superando a ambos padres.
- Razonamiento general: BBH (3-shot CoT) de 0,711, MMLU (5-shot) de 0,736.
- Compatibilidad completa con lm-eval-harness (`--model hf --model_args pretrained=...,trust_remote_code=True`).
- Decodificación greedy y por muestreo (temperature, top_k, top_p, repetition_penalty); beam search no está implementado (lanza `NotImplementedError`).
- No hay soporte declarado de tool calling, agentes, visión ni audio.

## Casos de uso

- Completado de código en editores: como modelo base con buen rendimiento en HumanEval y MBPP, es adecuado para autocompletado y FIM en IDEs locales, donde su tamaño de 6,22B permite latencias razonables en GPU de consumo.
- Investigación en arquitecturas de modelos: el método de Representation Bridge y la disponibilidad del informe técnico lo hacen idóneo como sujeto de estudio para técnicas de ensamblado de capas y destilación estructural.
- Fine-tuning posterior a medida: al ser un modelo base con pesos congelados solo en el bloque inferior, sirve como punto de partida para SFT/DPO en dominios concretos (código, matemáticas, texto técnico).
- Evaluación comparativa de escalado: permite estudiar la relación cómputo-calidad en el punto intermedio entre 4B y 8B, con un protocolo de evaluación idéntico al de sus padres.
- Generación de texto técnico y científico: su entrenamiento con texto web, código y matemáticas lo hace útil para redacción y continuación de documentos técnicos en formato base (mediante few-shot prompting).
- Despliegue en entornos con restricciones de cómputo: con 11,8 GFLOP por token (75 % del Qwen3-8B-Base), ofrece un compromiso entre calidad y coste de inferencia para servicios con presupuesto de cómputo acotado.

## Benchmarks y rendimiento

Evaluación con lm-eval-harness 0.4.13, protocolo idéntico para el modelo y ambos padres (0-shot en opción múltiple, MMLU 5-shot, GSM8K 8-shot CoT, BBH 3-shot CoT, HumanEval 0-shot y MBPP 3-shot con ejecución del código):

| Benchmark | Qwen3-4B-Base | Platypus 6B | Qwen3-8B-Base |
|---|---|---|---|
| HumanEval pass@1 | 0,628 | **0,652** | 0,677 |
| GSM8K (8-shot CoT) | 0,844 | **0,873** | 0,862 |
| MMLU (5-shot) | 0,730 | **0,736** | 0,768 |
| BBH (3-shot CoT) | 0,712 | **0,711** | 0,774 |
| HellaSwag | 0,737 | **0,744** | 0,786 |
| ARC-Easy | 0,761 | **0,735** | 0,798 |
| ARC-Challenge | 0,517 | **0,525** | 0,572 |
| OpenBookQA | 0,406 | **0,428** | 0,416 |
| WinoGrande | 0,702 | **0,695** | 0,723 |
| PIQA | 0,778 | **0,789** | 0,794 |
| LAMBADA | 0,691 | **0,681** | 0,711 |
| MBPP pass@1 | 0,672 | **0,668** | 0,696 |
| BoolQ | 0,832 | **0,825** | 0,832 |

Supera al padre pequeño en 7 de 13 benchmarks y al padre grande en 2 de 13, con un 75 % del cómputo del padre grande (11,8 frente a 15,7 GFLOP por token; el padre pequeño requiere 8,7). El propio autor advierte que las diferencias de unas décimas están dentro de la varianza entre ejecuciones y que el cómputo es una medida relativa del informe, no una medición verificada de latencia o coste.

## Requisitos de hardware

- VRAM estimada: con 6,22B de parámetros en bfloat16, aproximadamente 12–13 GB solo de pesos, más KV cache y overhead del custom code; una GPU de 16 GB debería ser suficiente para inferencia. No hay cuantizaciones oficiales publicadas, por lo que no se puede estimar VRAM en 4/8 bits.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para inferencia cómoda con contextos largos; A100 o H100 para evaluación sistemática o fine-tuning.
- Consumer GPU: sí, cabe en una RTX 4090 o incluso en una GPU de 16 GB (RTX 4060 Ti 16GB, RTX 4080) en bfloat16 con contexto moderado.
- Despliegue: mediante `transformers` (>= 4.56, probado en 4.56 y 5.x) con `trust_remote_code=True`. No hay soporte oficial declarado para vLLM, llama.cpp, Ollama ni TGI; el custom code y la estructura de dos bloques hacen probable que这些 backends requieran adaptación (no disponible).
- Latencia y throughput: no disponible como medición; el informe indica 11,8 GFLOP por token como medida relativa de cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comentario |
|---|---|---|---|---|
| Matilda Platypus 6B (Base) | 6,22B | no disponible | Apache 2.0 | Ensamblado 17+19 de Qwen3; 11,8 GFLOP/token; requiere custom code |
| Qwen3-4B-Base | 4B | no disponible en esta ficha | Apache 2.0 | Padre pequeño; inferior en 7 de 13 benchmarks; 8,7 GFLOP/token |
| Qwen3-8B-Base | 8B | no disponible en esta ficha | Apache 2.0 | Padre grande; superior en la mayoría de benchmarks; 15,7 GFLOP/token |

En la misma franja de tamaño existen alternativas como Qwen3-6B (si estuviera disponible como checkpoint oficial) o modelos de la comunidad de ~7B, pero no se dispone de datos comparativos publicados frente a ellos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado a instrucciones ni con tuning de seguridad, por lo que puede generar contenido ofensivo o inapropiado sin filtros. No es adecuado para despliegue conversacional sin fine-tuning posterior.
- Riesgo de alucinación inherente a un modelo base que simplemente continúa texto; no está diseñado para responder preguntas de forma fiable sin prompting few-shot.
- El conocimiento y el comportamiento derivan de los dos padres Qwen3 y de los datos de adaptación; los sesgos presentes en Qwen3 y en el corpus de adaptación (web, código, matemáticas) se heredan. No se documentan sesgos específicos.
- Diferencias de unas décimas de punto en benchmarks están dentro de la varianza entre ejecuciones, según el propio autor; no hay que sobreinterpretar las ventajas frente a los padres.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio: revisar el código antes de usar en producción. Además, la revisión 1 del código remoto ignoraba `max_length` y `stopping_criteria` y truncaba respuestas (subestimando GSM8K en ~0,58); usar la revisión 2 (2026-10-31) o posterior.
- Beam search no está implementado; solo greedy y muestreo.
- Requiere descargar además `Qwen/Qwen3-8B-Base` desde el hub en tiempo de carga (el bloque inferior se carga desde allí), lo que duplica parcialmente las dependencias de descarga.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque los términos de Qwen3 de los padres deben revisarse para casos de uso concretos.
- Contexto, idiomas soportados y cuantizaciones no están documentados explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maincode/Matilda-Platypus-6B-Base
- Qwen3-8B-Base (bloque inferior): https://huggingface.co/Qwen/Qwen3-8B-Base
- Qwen3-4B-Base (bloque superior): https://huggingface.co/Qwen/Qwen3-4B-Base
- Informe técnico: `technical_report.pdf`, incluido en el repositorio del modelo
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Citación: Maincode Team (Yue Yang, Arsh Chawla, David Lemphers). *Matilda Platypus: Any Size You Want. Intelligence You Need.* Technical report, Maincode / Matilda Research, October 2026.
