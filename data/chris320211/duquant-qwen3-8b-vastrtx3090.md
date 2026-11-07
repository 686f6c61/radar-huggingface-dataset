# chris320211/duquant-qwen3-8b-vastrtx3090

## Resumen

DuQuant Qwen3-8B es una versión cuantizada a 8 bits del modelo Qwen/Qwen3-8B, publicada por el usuario chris320211 mediante la herramienta QuantPort y el método de cuantización DuQuant. No se trata de un checkpoint fp16 al uso, sino de un artefacto empaquetado para inferencia que requiere un adaptador específico (`quant_agent_inference_adapter.py`) para recargarse, por lo que no es un reemplazo directo de `AutoModelForCausalLM.from_pretrained`. El modelo base Qwen3-8B es un transformer decoder-only de 8.192.136.192 parámetros (8B) desarrollado por Alibaba Qwen, orientado a generación de texto, razonamiento y conversación.

La relevancia de esta ficha radica en que documenta un experimento de cuantización post-entrenamiento con métricas medidas en hardware de consumo (RTX 3090), mostrando el compromiso entre calidad (perplejidad) y eficiencia (throughput y VRAM). El autor reporta una perplejidad de 10,90 frente a 9,66 del snapshot fp16 en WikiText-2, con un incremento de throughput de 3496,1 a 5046,9 tokens/s y una reducción de VRAM pico de 18,462 GB a 12,049 GB.

Se trata de un artefacto de investigación con escasa adopción (0 descargas, 0 likes en el momento de la consulta), por lo que debe evaluarse con cautela antes de cualquier uso en producción. La licencia heredada es Apache 2.0, la misma del modelo base Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); cuantización DuQuant de 8 bits |
| Parametros totales | 8.192.136.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-8B, no confirmada en esta ficha) |
| Tipos de cuantizacion | 8 bits (DuQuant); no se detallan granularidades ni esquemas adicionales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-8B), más la licencia del repositorio del método |
| Formato de pesos | safetensors (artefacto empaquetado para runtime, no drop-in) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del transformer decoder-only Qwen3-8B. La técnica aplicada, DuQuant, transforma los pesos del modelo base a 8 bits y los empaqueta en un artefacto de runtime gestionado por QuantPort (job `20261107T051504Z-f42730`). No se dispone de información sobre el dataset de calibración más allá de la evaluación en WikiText-2, ni sobre si se aplicaron técnicas adicionales como rotaciones, escalado por canales o ajuste fino de quantización. Tampoco se documenta el proceso de entrenamiento original del modelo base en la información proporcionada.

La innovación principal del artefacto es operativa: el autor reporta mejoras simultáneas en throughput y VRAM respecto al snapshot fp16 en una RTX 3090, con un `ppl_ratio` de 1,128644 y una marca `quality_ok=True`. La recarga requiere colocar el repositorio del método (y un posible overlay) en la variable de entorno `QUANT_AGENT_METHOD_REPO` y usar el adaptador incluido, lo que indica un formato propietario del pipeline de QuantPort.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3-8B.
- Razonamiento y matemáticas: capacidades propias de la familia Qwen3, no verificadas específicamente en este artefacto cuantizado.
- Generación de código: presumiblemente conservada del modelo base, sin benchmarks publicados en esta ficha.
- Soporte de tool calling / function calling: no confirmado en la información disponible para este artefacto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en la model card).
- Capacidades especiales (modo thinking, visión, audio): no disponibles para este artefacto.

## Casos de uso

- Evaluación de técnicas de cuantización: el artefacto sirve como referencia reproducible para comparar DuQuant 8 bits frente a fp16 en WikiText-2, con métricas de perplejidad, NLL, throughput y VRAM pico ya medidas en RTX 3090.
- Despliegue en GPU de consumo con VRAM limitada: la reducción de 18,462 GB a 12,049 GB de VRAM pico permite ejecutar un modelo de 8B en tarjetas de 16 GB o menos, siempre que se integre el adaptador de QuantPort.
- Generación de texto a alta velocidad en entornos de investigación: el throughput reportado de 5046,9 tokens/s en prefill de 2048 tokens con warmup lo hace adecuado para prototipos de serving donde prima la velocidad sobre la fidelidad absoluta.
- Reproducción de experimentos de cuantización: el job identificado (`20261107T051504Z-f42730`) y el `benchmark.json` asociado permiten auditar el proceso y compararlo con otras variantes del mismo autor (por ejemplo, su versión SmoothQuant de Qwen2.5-1.5B).
- Base para comparativas de calidad: el `ppl_ratio` de 1,128644 y la marca `quality_ok=True` ofrecen un punto de referencia para decidir si la pérdida de perplejidad es aceptable en una tarea concreta antes de adoptar el artefacto.
- Experimentación con pipelines QuantPort: útil para desarrolladores que quieran validar el flujo de carga con `quant_agent_inference_adapter.py` y la variable `QUANT_AGENT_METHOD_REPO` antes de estandarizarlo en su infraestructura.

## Benchmarks y rendimiento

Datos reportados por el autor en WikiText-2 (test, ventanas de 2048 tokens, 65504 tokens), medidos en NVIDIA GeForce RTX 3090 (`vast-rtx3090`) contra el snapshot fp16 original:

| Metrica | Cuantizado | fp16 |
|---|---:|---:|
| Perplejidad | 10,899952 | 9,657566 |
| NLL loss | 2,388758 | 2,267742 |
| Tokens/s (prefill 2048, tras warmup) | 5046,9 | 3496,1 |
| VRAM pico (GB) | 12,049 | 18,462 |

Indicadores derivados: `ppl_ratio` = 1,128644 (`quality_ok=True`), `improved_throughput=True`, `improved_vram=True`. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,049 GB de pico según la medición del autor en RTX 3090 con prefill de 2048 tokens; el repositorio ocupa 9,5 GB.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (hardware de referencia); no se documentan pruebas en A100, H100 ni otras GPU.
- ¿Cabe en GPU de consumo? Sí, según la medición reportada en RTX 3090 (24 GB); con 12,049 GB de pico podría caber en tarjetas de 16 GB, aunque no se ha verificado.
- Opciones de despliegue: no es compatible con `AutoModelForCausalLM.from_pretrained` directo; requiere el adaptador `quant_agent_inference_adapter.py` y el repositorio del método en `QUANT_AGENT_METHOD_REPO`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, pese a la etiqueta `text-generation-inference`.
- Latencia y throughput: 5046,9 tokens/s en prefill de 2048 tokens tras warmup en RTX 3090; no se reportan métricas de decodificación ni latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Artefacto |
|---|---|---|---|---|---|
| DuQuant Qwen3-8B (este) | 8,19B | no disponible | 8 bits DuQuant | Apache 2.0 | Empaquetado, requiere adaptador |
| Qwen/Qwen3-8B | 8B | no disponible en la información | fp16 (original) | Apache 2.0 | Drop-in con transformers |
| SmoothQuant Qwen2.5-1.5B (chris320211) | ~1,5B | no disponible | SmoothQuant | no disponible | Empaquetado, mismo autor |

La comparación directa de rendimiento solo es posible contra el snapshot fp16 del propio modelo base, con los datos de WikiText-2 ya presentados. No se dispone de benchmarks de tareas que permitan comparar con otras alternativas de 8B.

## Limitaciones y advertencias

- No es un checkpoint drop-in: requiere el adaptador de QuantPort y el repositorio del método en `QUANT_AGENT_METHOD_REPO`; sin ese entorno, la carga falla.
- Pérdida de calidad medible: la perplejidad sube de 9,657566 a 10,899952 (ratio 1,128644) y la NLL de 2,267742 a 2,388758 en WikiText-2.
- Evaluación limitada a un único dataset (WikiText-2) y un único hardware (RTX 3090); no hay benchmarks de razonamiento, código o matemáticas.
- Idiomas soportados no declarados: no se puede garantizar el comportamiento multilingüe del artefacto.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la cuantización; no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base Qwen3-8B, no evaluados aquí.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria.
- Restricciones de licencia: Apache 2.0 del modelo base más la licencia del repositorio del método; deben conservarse `LICENSE` y `NOTICE.md` del snapshot cuando existan.
- Uso en producción desaconsejado sin una evaluación propia en la tarea objetivo, dado el carácter experimental del artefacto y la falta de soporte documentado en frameworks de serving estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chris320211/duquant-qwen3-8b-vastrtx3090
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Repositorio QuantPort: https://github.com/chris320211/QuantPort
- Variante SmoothQuant del mismo autor: https://huggingface.co/chris320211/smoothquant-qwen25-15b-vastrtx3090
