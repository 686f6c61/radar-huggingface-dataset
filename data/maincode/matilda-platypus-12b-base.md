# Maincode/Matilda-Platypus-12B-Base

## Resumen

Matilda Platypus 12B (base) es un modelo lingüístico de tamaño intermedio desarrollado por Maincode que aborda un problema concreto: obtener modelos de calidad ajustable entre dos tamaños preentrenados existentes sin entrenar desde cero. Su método, denominado Representation Bridge, conecta las capas inferiores de un modelo mayor (Qwen3-14B-Base) con las capas superiores de uno menor (Qwen3-8B-Base) mediante un mapa lineal aprendido que alinea las representaciones ocultas en el punto de unión. Este checkpoint concreto es el corte `25+15`: 25 capas del padre grande seguidas de 15 del padre pequeño, con 12,57B de parámetros y 24,4 GFLOP por token (el 85 % del cómputo del padre mayor).

Se trata de un modelo base, sin ajuste por instrucciones ni alineación de seguridad, orientado a continuar texto. Su relevancia radica en que demuestra una vía económica para crear puntos intermedios en una familia de modelos: supera al padre pequeño en 8 de 13 benchmarks y al padre mayor en 3 de 13, con un coste de inferencia intermedio. La licencia Apache 2.0 y la compatibilidad con `transformers` y lm-eval-harness facilitan su adopción inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido por composición: capas inferiores de Qwen3-14B-Base + Representation Bridge lineal + capas superiores de Qwen3-8B-Base |
| Parametros totales | 12,57B |
| Parametros activos | 12,57B (no es MoE); el bridge aporta 21,0M parámetros |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | no disponibles explícitamente; heredados de los padres Qwen3 y de los datos de adaptación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bridge.safetensors y upper_block/), con custom_code (trust_remote_code=True) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer entrenado ex novo, sino una composición: embedding y capas 1–25 de Qwen3-14B-Base (40 capas originales, congeladas en los pesos publicados), seguidas de un Representation Bridge, una única capa lineal de 5120 a 4096 unidades ocultas con 21,0M de parámetros, y después las capas 22–36 de Qwen3-8B-Base (36 capas originales) junto con su normalización final y su cabeza de salida. Las capas superiores se adaptaron con actualizaciones de bajo rango (LoRA) ya fusionadas en los pesos publicados. El tokenizador es el de Qwen3. El forward usa un KV cache por bloque y solo soporta decodificación greedy y por muestreo (beam search lanza `NotImplementedError`).

El entrenamiento consta de tres fases: (1) inicialización del bridge por mínimos cuadrados, ejecutando ambos padres sobre un pequeño conjunto de calibración y ajustando el mapa lineal entre representaciones, usando la pérdida de modelado del lenguaje para seleccionar el corte; (2) adaptación supervisada del bridge y de las actualizaciones de bajo rango sobre unos pocos miles de millones de tokens de texto web mixto, código, matemáticas y soluciones razonadas, con el bloque inferior congelado; y (3) una etapa corta de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre problemas de código con tests unitarios y problemas de matemáticas con respuesta comprobable. No se detalla el uso de RLHF ni DPO clásicos.

## Capacidades

- Continuación de texto (modelo base): no está ajustado por instrucciones ni alineado para seguridad.
- Generación y ejecución evaluada de código: MBPP pass@1 de 0,712 y HumanEval pass@1 de 0,671 en protocolo base.
- Razonamiento matemático con cadena de pensamiento: GSM8K 8-shot CoT de 0,880.
- Conocimiento general y comprensión: MMLU 5-shot de 0,789, BBH 3-shot CoT de 0,758, BoolQ de 0,872.
- Sentido común y razonamiento natural: WinoGrande 0,763, PIQA 0,802, HellaSwag 0,791, ARC-Easy 0,776, ARC-Challenge 0,561, OpenBookQA 0,458, LAMBADA 0,707.
- Compatibilidad completa con la API `generate` de `transformers` (max_new_tokens, temperature, top_k, top_p, stopping_criteria, streamer, etc.) y con lm-eval-harness.
- No hay información sobre tool calling, agentes, capacidades multimodales ni modo de pensamiento explícito.

## Casos de uso

- Investigación en composición y poda de modelos: es un artefacto ideal para estudiar puentes de representación, selección de cortes óptimos y transferencia entre checkpoints, ya que incluye el informe técnico con el método completo.
- Base para fine-tuning por instrucciones: al ser un modelo base con licencia Apache 2.0, sirve como punto de partida para SFT y DPO propios, aprovechando un punto medio entre 8B y 14B sin coste de preentrenamiento.
- Generación de código como fundación: con 0,712 en MBPP y 0,671 en HumanEval en protocolo base, es un candidato razonable para ajustar asistentes de código especializados en dominios concretos.
- Experimentación con presupuesto de cómputo intermedio: con 24,4 GFLOP por token frente a 28,8 del padre de 14B y 15,7 del de 8B, permite estudiar el compromiso calidad-coste en ese rango.
- Evaluaciones reproducibles con lm-eval-harness: el modelo funciona sin cambios bajo `--model hf --model_args pretrained=...,trust_remote_code=True`, útil para pipelines de benchmarking automáticos.
- Despliegue como completador de texto en entornos controlados: para tareas de relleno, resumen extractivo o generación condicionada por prompts de few-shot, donde un modelo base con buen rendimiento en LAMBADA y HellaSwag es adecuado.

## Benchmarks y rendimiento

Evaluación de modelo base con lm-eval-harness 0.4.13, protocolo idéntico para el modelo y ambos padres (0-shot en opción múltiple salvo donde se indica; puntuaciones en proporción):

| Benchmark | Qwen3-8B-Base | Platypus 12B | Qwen3-14B-Base |
|---|---|---|---|
| HumanEval pass@1 | 0,677 | 0,671 | 0,720 |
| GSM8K (8-shot CoT) | 0,856 | 0,880 | 0,870 |
| MMLU (5-shot) | 0,768 | 0,789 | 0,805 |
| BBH (3-shot CoT) | 0,774 | 0,758 | 0,788 |
| HellaSwag | 0,786 | 0,791 | 0,814 |
| ARC-Easy | 0,798 | 0,776 | 0,819 |
| ARC-Challenge | 0,572 | 0,561 | 0,588 |
| OpenBookQA | 0,416 | 0,458 | 0,480 |
| WinoGrande | 0,723 | 0,763 | 0,747 |
| PIQA | 0,794 | 0,802 | 0,824 |
| LAMBADA | 0,711 | 0,707 | 0,742 |
| MBPP pass@1 | 0,686 | 0,712 | 0,748 |
| BoolQ | 0,832 | 0,872 | 0,865 |

Supera al padre pequeño en 8 de 13 benchmarks y al padre mayor en 3 de 13, con el 85 % del cómputo del padre mayor (24,4 frente a 28,8 GFLOP por token; el padre pequeño consume 15,7). El autor advierte que el cómputo es una medida relativa del informe, no una medición verificada de latencia o coste, y que diferencias de unas décimas están dentro de la varianza entre ejecuciones. Nota de versión: la revisión 1 del código remoto ignoraba `max_length` y `stopping_criteria` y subestimaba los benchmarks generativos (GSM8K leía ~0,58 en lugar de 0,880); la revisión 2 (2026-10-31) corrige esto sin cambiar los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; con 12,57B de parámetros en bfloat16, los pesos ocupan en torno a 25 GB, por lo que se necesita una GPU de 32 GB o más (o reparto en dos GPUs). No hay cuantizaciones publicadas.
- GPU recomendadas: no disponible oficialmente; por tamaño, una A100 40 GB, A100 80 GB, H100 o una RTX A6000 48 GB serían adecuadas. En consumer, una RTX 4090 de 24 GB no alberga los pesos completos en bfloat16 sin offloading.
- Cabe en consumer GPU: no en una sola GPU de 24 GB en precisión completa; sería necesario offloading a CPU/RAM o esperar cuantizaciones de la comunidad (no disponibles).
- Despliegue: el model card solo documenta `transformers >= 4.56` (probado en 4.56 y 5.x) con `trust_remote_code=True`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. El código remoto carga el bloque inferior desde Qwen3-14B-Base en el hub, el superior desde `upper_block/` y el bridge desde `bridge.safetensors`.
- Latencia y throughput: no disponibles; solo se publica el cómputo teórico de 24,4 GFLOP por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (5-shot) | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Matilda Platypus 12B (base) | 12,57B | no disponible | 0,789 | 0,880 | Apache 2.0 | HuggingFace, safetensors + custom_code |
| Qwen3-8B-Base (padre pequeño) | 8B | no disponible aquí | 0,768 | 0,856 | Apache 2.0 | HuggingFace, pesos nativos |
| Qwen3-14B-Base (padre grande) | 14B | no disponible aquí | 0,805 | 0,870 | Apache 2.0 | HuggingFace, pesos nativos |

Platypus 12B se sitúa deliberadamente entre ambos padres: supera al de 8B en la mayoría de benchmarks y se acerca al de 14B con un 15 % menos de cómputo por token, aunque pierde frente a este en la mayoría de tareas. Su desventaja práctica frente a los padres es la dependencia de código remoto y la carga de dos checkpoints parentales, lo que complica la integración con runtimes optimizados.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni alineado para seguridad, por lo que puede generar contenido inapropiado si se usa sin capa adicional de control.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; el model card no publica evaluaciones de veracidad específicas.
- Sesgos: derivan de los dos padres Qwen3 y de los datos de adaptación (texto web, código, matemáticas); no hay auditoría de sesgos publicada.
- Diferencias de unas décimas de punto frente a los padres están dentro de la varianza entre ejecuciones según el propio autor; no interpretabar pequeñas ventajas como mejoras robustas.
- Solo soporta decodificación greedy y por muestreo; beam search no está implementado.
- Requiere `trust_remote_code=True` y `transformers >= 4.56`, lo que implica ejecutar código del autor y una dependencia de red hacia el checkpoint del padre Qwen3-14B-Base en cada carga.
- Cuidado con la revisión del código remoto: la revisión 1 subestimaba los benchmarks generativos; usar la revisión 2 (2026-10-31) o posterior.
- Longitud de contexto, idiomas soportados y cuantizaciones no están documentados.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero los modelos base Qwen3 subyacentes deben respetar sus términos correspondientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maincode/Matilda-Platypus-12B-Base
- Informe técnico: `technical_report.pdf`, incluido en el repositorio del modelo
- Padre grande: https://huggingface.co/Qwen/Qwen3-14B-Base
- Padre pequeño: https://huggingface.co/Qwen/Qwen3-8B-Base
- Informe técnico de Qwen3 citado: arXiv:2505.09388 (https://arxiv.org/abs/2505.09388)
- Citación: Maincode Team (Yue Yang, Arsh Chawla, David Lemphers). *Matilda Platypus: Any Size You Want. Intelligence You Need.* Technical report, Maincode / Matilda Research, October 2026
