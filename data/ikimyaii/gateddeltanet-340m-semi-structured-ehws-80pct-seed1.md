# ikimyaii/GatedDeltaNet-340M-semi-structured-EHWS-80pct-seed1

## Resumen

GatedDeltaNet-340M-semi-structured-EHWS-80pct-seed1 es un modelo de lenguaje de aproximadamente 400 millones de parámetros (399.531.200 según los pesos en safetensors) derivado del checkpoint base `m-a-p/340M-20B-GatedDeltaNet-pure-baseline`, al que se le ha aplicado una poda estructurada del 80 % mediante la técnica EHWS (dos fases de ADMM). Lo desarrolla el usuario `ikimyaii` y su interés es fundamentalmente de investigación: demuestra cómo aplicar poda semi-estructurada agresiva a un modelo con arquitectura GatedDeltaNet manteniendo un equilibrio de trabajo por fila.

El modelo no es un modelo de propósito general listo para producción, sino un artefacto experimental que documenta el impacto de la poda en perplejidad y en tareas de razonamiento zero-shot. La poda afecta a todas las capas lineales de los bloques, mientras que los embeddings y la `lm_head` permanecen densos. Cada fila de cada capa podada conserva exactamente el mismo número de pesos (el 20 % superior), lo que garantiza un reparto de trabajo perfectamente equilibrado por fila.

Es relevante ahora porque la familia GatedDeltaNet (arquitecturas híbridas con atención lineal basada en delta rules) está atrayendo interés como alternativa eficiente a los transformers clásicos, y este checkpoint ofrece un punto de referencia concreto sobre cuánto rendimiento se pierde al podar este tipo de modelos al 80 % de sparsity.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con delta rule y compuertas) |
| Parámetros totales | 399.531.200 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 2.048 tokens en la calibración) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un GatedDeltaNet de 340M de parámetros entrenado sobre 20B tokens (según el nombre del checkpoint `340M-20B-GatedDeltaNet-pure-baseline`). Sobre ese checkpoint se aplica una poda en dos fases: una fase local de estilo ALPS que poda cada capa hasta el 70 % minimizando el error de reconstrucción `||(W - W0) X||^2`, con hessianos calculados a partir de secuencias de calibración de C4; y una segunda fase global basada en ADMM sobre la pérdida de entropía cruzada y destilación del modelo completo, con un paso Z basado en `Diag(H)`, 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, Adam con beta2 0,95 y semilla 1. La fase 2 completa la poda hasta el 80 %.

Los datos de calibración son las 32.768 secuencias de C4 de 2.048 tokens que usa el código oficial de ELSA, tokenizadas con el tokenizador del modelo (`fla-hub_hgrn-1.3B-100B`), cada una vista una sola vez. El proceso completo, incluida la evaluación, requirió 3,63 horas en una única A100 de 40 GB. La sparsity efectiva medida sobre los pesos finales es de 0,7999 y se verificó que las 240 capas podadas mantienen el mismo número de no-ceros por fila.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base GatedDeltaNet.
- Razonamiento zero-shot evaluado en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Capacidad de ejecutarse con `AutoModelForCausalLM.from_pretrained(...)` siempre que esté instalada la librería `flash-linear-attention` (`import fla`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre poda de arquitecturas lineales: el checkpoint sirve como referencia reproducible para estudiar el efecto de la sparsity semi-estructurada al 80 % en modelos GatedDeltaNet, con configuración de semilla y resultados completos en `results.json`.
- Benchmarking de técnicas de compresión: comparar EHWS frente a otras estrategias de poda (magnitud, SparseGPT, Wanda) sobre el mismo modelo base y el mismo protocolo de evaluación de ELSA.
- Estudio de eficiencia en inferencia: al mantener el mismo número de no-ceros por fila en las 240 capas podadas, el modelo es adecuado para analizar el equilibrio de carga en kernels dispersos y en aceleradores que explotan sparsity semi-estructurada.
- Validación de pipelines de evaluación: usar los resultados de perplejidad y zero-shot como línea base para verificar implementaciones propias de lm-evaluation-harness o del protocolo de ELSA.
- Docencia y experimentación con ADMM: el modelo documenta paso a paso una poda en dos fases con pérdida de destilación, útil como ejemplo práctico en cursos de eficiencia de modelos.
- Reproducción de experimentos a pequeña escala: con 3,63 horas en una A100 40 GB, el flujo completo es asequible para grupos de investigación que quieran replicar o extender el método con otras semillas o ratios de poda.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Dense (base) | 16,42 | 19,94 |
| Este modelo (80 % sparsity) | 36,67 | 32,09 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Dense | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,1945 |
| arc_easy | 0,6023 | 0,4167 |
| boolq | 0,5985 | 0,6070 |
| hellaswag | 0,3461 | 0,2861 |
| openbookqa | 0,2300 | 0,1580 |
| rte | 0,5162 | 0,5199 |
| winogrande | 0,5036 | 0,5130 |
| Media | 0,4373 | 0,3850 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,6 GB en safetensors; en fp16 los 399,5M de parámetros requieren aproximadamente 0,8 GB de pesos, más overhead de activaciones y caché.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16; una A100 40 GB fue suficiente para el proceso completo de poda y evaluación.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, dado el reducido tamaño del modelo.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y no hay pesos GGUF en el repo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Sparsity | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EHWS 80 %) | 399,5M | no disponible | 80 % semi-estructurada | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline | ~340M | no disponible | densa | no disponible | Hugging Face |
| Modelos GatedDeltaNet podados con otras técnicas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La poda al 80 % degrada notablemente el rendimiento: la perplejidad en WikiText-2 pasa de 16,42 a 36,67 y la media zero-shot cae de 0,4373 a 0,3850.
- El modelo es un artefacto de investigación de una sola ejecución (semilla 1); no se han publicado intervalos de confianza ni réplicas con otras semillas.
- La licencia no está declarada, por lo que el uso comercial queda sin garantías jurídicas claras.
- Los idiomas soportados no están especificados; no hay evidencia de capacidades multilingües.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento extendido.
- Riesgo de alucinación inherente a un modelo de 340M parámetros entrenado con 20B tokens; no se han publicado evaluaciones de fidelidad factual.
- Requiere la librería `flash-linear-attention` para cargarse correctamente; sin ella, la carga con `AutoModelForCausalLM` puede fallar.
- No hay pesos cuantizados (GGUF, AWQ, GPTQ) publicados, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-EHWS-80pct-seed1
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Resultados completos: `results.json` dentro del repositorio del modelo
- Librería flash-linear-attention: no disponible en la información proporcionada
- Paper de ELSA (protocolo de evaluación y calibración): no disponible en la información proporcionada
