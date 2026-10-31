# Maincode/Matilda-Platypus-13B-Base

## Resumen

Matilda Platypus 13B (base) es un modelo de lenguaje de tamaño intermedio desarrollado por Maincode mediante una técnica de "Representation Bridge": conecta las capas inferiores de un modelo Qwen3-14B-Base preentrenado con las capas superiores de un Qwen3-8B-Base, alineando las representaciones ocultas en el punto de unión mediante un mapa lineal aprendido. El resultado es un modelo de 13,51B de parámetros con un coste computacional del 91% del padre mayor (26,3 GFLOP por token frente a 28,8).

El problema que resuelve es la creación de modelos de tamaño arbitrario ("any size you want") sin entrenar desde cero: se reutilizan pesos congelados de ambos padres y solo se entrenan el puente (21,0M de parámetros) y adaptaciones de bajo rango en las capas superiores. Esto permite obtener un punto intermedio entre los dos padres, superando al padre menor en 11 de 13 benchmarks evaluados.

Es relevante porque propone una alternativa eficiente al escalado tradicional de modelos. Este checkpoint es un modelo base (sin ajuste por instrucciones), construido sobre la arquitectura Qwen3, con tokenizador de Qwen3 y licencia Apache 2.0. El método se documenta en un informe técnico incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido por ensamblado de capas (29 capas de Qwen3-14B-Base + 13 capas de Qwen3-8B-Base unidas por un Representation Bridge lineal) |
| Parametros totales | 13,51B |
| Parametros activos | 13,51B (no es MoE) |
| Longitud de contexto | no disponible (hereda la del tokenizador Qwen3; el README no la especifica) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin cuantizaciones oficiales publicadas) |
| Idiomas soportados | no disponible (hereda del tokenizador y datos de Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bridge.safetensors + upper_block/; el bloque inferior se carga desde Qwen/Qwen3-14B-Base en el hub) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer entrenado de forma convencional, sino un ensamblado: el forward pass ejecuta el embedding y las capas 1–29 de Qwen3-14B-Base (40 capas originales, congeladas), después un Representation Bridge lineal de 5120 a 4096 unidades ocultas (21,0M de parámetros), y finalmente las capas 24–36 de Qwen3-8B-Base (36 capas originales) junto con su normalización final y la cabeza de salida, adaptadas ligeramente con actualizaciones de bajo rango ya fusionadas en los pesos publicados. El tokenizador es el de Qwen3. La notación `29+13` indica 29 capas del padre mayor seguidas de 13 del padre menor.

El entrenamiento consta de tres fases: (1) inicialización del puente por mínimos cuadrados sobre un pequeño conjunto de calibración, usando la pérdida de modelado de lenguaje para seleccionar el punto de corte; (2) adaptación supervisada del puente y de las actualizaciones de bajo rango sobre unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones resueltas, con el bloque inferior congelado; (3) una fase corta de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre problemas de código con tests unitarios y problemas de matemáticas con respuesta comprobable. No se detalla el uso de RLHF ni DPO convencionales.

## Capacidades

- Generación de texto en formato base: el modelo continúa texto, sin ajuste por instrucciones ni alineación de seguridad.
- Razonamiento matemático: 0,882 en GSM8K (8-shot chain-of-thought), por encima de ambos padres.
- Generación de código: 0,750 pass@1 en HumanEval y 0,730 en MBPP, superando al padre de 14B en HumanEval.
- Razonamiento general multi-tarea: 0,785 en BBH (3-shot CoT).
- Comprensión lingüística y de conocimiento: 0,796 en MMLU (5-shot), 0,796 en HellaSwag, 0,854 en BoolQ.
- Razonamiento de sentido común: 0,754 en WinoGrande.
- Compatibilidad completa con lm-eval-harness (`--model hf` con `trust_remote_code=True`).
- Decodificación greedy y por muestreo (temperatura, top_k, top_p, repetition_penalty); sin soporte de beam search.
- No hay información sobre tool calling, agentes, capacidades multimodales ni modo de pensamiento explícito.

## Casos de uso

- Investigación en arquitecturas de modelos: al ser un modelo construido por ensamblado de capas con un puente aprendido, es idóneo para estudiar transferencia de representaciones entre modelos preentrenados de distinto tamaño.
- Evaluación comparativa de modelos base: su compatibilidad directa con lm-eval-harness permite integrarlo en pipelines de benchmarking reproducibles sin adaptaciones.
- Fine-tuning posterior por terceros: como modelo base con licencia Apache 2.0, puede ajustarse por instrucciones (SFT, DPO) para dominios concretos, aprovechando que sus pesos derivan de Qwen3.
- Generación y completado de código como base para fine-tuning: con 0,750 pass@1 en HumanEval sin ajuste específico, sirve como punto de partida para asistentes de código especializados.
- Experimentación con presupuestos de cómputo intermedios: ofrece un punto entre 8B y 14B con 26,3 GFLOP por token, útil cuando el padre menor queda corto y el mayor es innecesariamente caro.
- Estudio de destilación estructural y poda inversa: el método de corte de capas `29+13` puede replicarse para generar otros tamaños a partir de los mismos padres.
- Modelado de lenguaje clásico: completado de texto, generación condicional y análisis de perplejidad en tareas de laboratorio.

## Benchmarks y rendimiento

Evaluación con lm-eval-harness 0.4.13, protocolo idéntico para el modelo y ambos padres (0-shot en multiple choice, MMLU 5-shot, GSM8K 8-shot CoT, BBH 3-shot CoT, HumanEval 0-shot y MBPP 3-shot con ejecución del código generado). Puntuaciones en proporciones:

| Benchmark | Qwen3-8B-Base | Platypus 13B | Qwen3-14B-Base |
|---|---|---|---|
| HumanEval pass@1 | 0,677 | **0,750** | 0,720 |
| GSM8K (8-shot CoT) | 0,856 | **0,882** | 0,870 |
| MMLU (5-shot) | 0,768 | **0,796** | 0,805 |
| BBH (3-shot CoT) | 0,774 | **0,785** | 0,788 |
| HellaSwag | 0,786 | **0,796** | 0,814 |
| ARC-Easy | 0,798 | **0,794** | 0,819 |
| ARC-Challenge | 0,572 | **0,563** | 0,588 |
| OpenBookQA | 0,416 | **0,446** | 0,480 |
| WinoGrande | 0,723 | **0,754** | 0,747 |
| PIQA | 0,794 | **0,800** | 0,824 |
| LAMBADA | 0,711 | **0,722** | 0,742 |
| MBPP pass@1 | 0,686 | **0,730** | 0,748 |
| BoolQ | 0,832 | **0,854** | 0,865 |

Supera al padre menor en 11 de 13 benchmarks y al padre mayor en 3 de 13, con el 91% del cómputo del padre mayor. El propio informe advierte que las diferencias de unas décimas de punto están dentro de la varianza entre ejecuciones. El cómputo (26,3 vs 28,8 GFLOP/token) es una medida relativa del informe, no una medición verificada de latencia o coste.

## Requisitos de hardware

- VRAM estimada para inferencia: con 13,51B de parámetros en bfloat16, aproximadamente 27 GB solo de pesos, más la caché KV de dos bloques separados; se recomienda una GPU con 32 GB o más (no hay cifras oficiales publicadas).
- GPU recomendadas: no disponible oficialmente; por tamaño, una A100 40 GB, A100 80 GB, H100 o RTX 5090 (32 GB) serían opciones adecuadas. Una RTX 4090 (24 GB) no aloja los pesos completos en bf16 sin descarga a CPU o cuantización.
- Consumer GPU: no cabe en 24 GB en precisión completa; sería necesario offloading o una cuantización no publicada oficialmente.
- Despliegue: a través de `transformers >= 4.56` (probado en 4.56 y 5.x) con `trust_remote_code=True`; el código remoto carga el bloque inferior desde `Qwen/Qwen3-14B-Base`, el superior desde `upper_block/` y el puente desde `bridge.safetensors`. No hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el informe solo publica el cómputo relativo por token (26,3 GFLOP), que no es una medición de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Matilda Platypus 13B (base) | 13,51B | no disponible | 0,750 | 0,796 | Apache 2.0 | HuggingFace, safetensors, custom code |
| Qwen3-14B-Base | 14B | no disponible en esta ficha | 0,720 | 0,805 | Apache 2.0 | HuggingFace, pesos completos |
| Qwen3-8B-Base | 8B | no disponible en esta ficha | 0,677 | 0,768 | Apache 2.0 | HuggingFace, pesos completos |

Platypus 13B se sitúa entre sus dos padres en casi todas las métricas, superando al de 14B en HumanEval, GSM8K y WinoGrande con un 91% de su cómputo. A diferencia de los padres, requiere código remoto y la descarga de pesos del padre mayor, lo que añade fricción de despliegue. No se han incluido otros modelos comparables fuera de la familia Qwen3 ante la falta de datos de evaluación con protocolo idéntico.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni alineado en seguridad; continúa texto y puede producir contenido ofensivo o dañino sin filtros.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de ajuste por instrucciones.
- Sesgos: hereda los sesgos de los dos padres Qwen3 y de los datos de adaptación (texto web, código, matemáticas); no se publica auditoría de sesgos.
- Las diferencias de unas décimas de punto en los benchmarks están dentro de la varianza entre ejecuciones, según el propio autor.
- La fase RLVR se aplicó solo sobre código y matemáticas con recompensas verificables; el comportamiento en otros dominios no fue optimizado específicamente.
- No soporta beam search (lanza `NotImplementedError`); solo greedy y muestreo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene revisarlo antes de usarlo en producción.
- Histórico de bugs en el código remoto: la revisión 1 ignoraba `max_length` y `stopping_criteria` y subgeneraba tokens, infravalorando GSM8K (~0,58 frente a 0,882); usar siempre la revisión 2 (2026-10-31) o posterior.
- El despliegue requiere descargar además `Qwen/Qwen3-14B-Base` completo, duplicando parcialmente el almacenamiento.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maincode/Matilda-Platypus-13B-Base
- Modelo base (padre mayor): https://huggingface.co/Qwen/Qwen3-14B-Base
- Modelo base (padre menor): https://huggingface.co/Qwen/Qwen3-8B-Base
- Informe técnico: `technical_report.pdf`, incluido en el repositorio de HuggingFace
- Paper de referencia de Qwen3: arXiv:2505.09388 (https://arxiv.org/abs/2505.09388)
