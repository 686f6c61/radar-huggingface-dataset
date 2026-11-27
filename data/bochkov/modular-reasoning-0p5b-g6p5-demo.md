# Bochkov/modular-reasoning-0p5b-g6p5-demo

## Resumen

Modular Residual Reasoning Core with G6.5 Attachment Demo es un checkpoint de investigación publicado por el usuario Bochkov en Hugging Face. Se trata de un núcleo de razonamiento "attention-free" (sin mecanismo de atención) que integra elementos externos tipados mediante un esquema de ensamblado residual conmutativo. El modelo no sigue la arquitectura transformer convencional: incorpora un bucle de iteraciones internas (`num_iterations`) y está diseñado para combinarse con memoria documental reconstructiva, ejecución determinista en una máquina virtual acotada y buffers de resultados posicionales.

El checkpoint tiene aproximadamente 505 millones de valores tensoriales almacenados (unos 504,6 millones de parámetros aproximados más 786.432 valores de buffer fijo), lo que lo sitúa en la categoría de modelos pequeños (0,5B). El autor lo presenta explícitamente como un artefacto de investigación, no como un modelo de propósito general: la model card advierte que, cargado como LM causal estándar, el modelo ejecuta únicamente el núcleo de razonamiento sin memoria externa ni elementos de máquina virtual, y que los resultados de benchmarks estándar y la demo de attachment miden modos de funcionamiento distintos.

La relevancia del modelo es fundamentalmente metodológica: propone un protocolo de "attachment" de elementos externos sobre un núcleo congelado, con controles de fallo que restauran exactamente la línea base (`reattach_loss_difference = 0`). No obstante, sus resultados en benchmarks estándar son muy bajos (MMLU 0-shot de 22,95, LAMBADA con precisión 0,00 y perplejidad de 1.501.146,58), lo que refleja un entrenamiento especializado en una mezcla concreta de tareas de lenguaje, memoria-QA y VM, no un modelo conversacional o de conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Núcleo de razonamiento residual sin atención (attention-free), con iteraciones internas y ensamblado residual conmutativo de elementos externos tipados; requiere `trust_remote_code` |
| Parametros totales | 505.353.758 valores tensoriales almacenados; ~504.567.326 parámetros aproximados + 786.432 valores de buffer fijo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 según el ejemplo de carga; el tag indica binary16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers, código personalizado) |

## Arquitectura y entrenamiento

El modelo se describe como un "núcleo de razonamiento residual" sin atención, con un mecanismo de iteración interna controlado por el parámetro `num_iterations` en la llamada de inferencia (el ejemplo de la model card usa 5 iteraciones). La innovación central es el ensamblado residual conmutativo: para una propuesta externa $z_e$ asociada a un nodo de razonamiento $i$, se calcula el residuo $r_e = z_e - Z_i$ y se agrega como $R_i = \frac{\sum_e w_e(z_e-Z_i)}{\epsilon+\sum_e w_e}$, de modo que el orden de los elementos se descarta por suma de segmentos. Un paso determinista de consistencia desplaza el campo de razonamiento hacia la media ponderada de propuestas antes de una corrección entrenable acotada.

Los elementos externos desarrollados en los experimentos asociados incluyen memoria documental reconstructiva congelada, ejecución determinista en una máquina virtual acotada y buffers de resultados posicionales con reconocimiento de tokenizador. El checkpoint corresponde al paso de optimizador 141092, con 4.047.453.941 objetivos procesados. El núcleo se entrenó sobre una mezcla especializada de tareas de lenguaje, memoria-QA y VM. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron RLHF o DPO. El SHA-256 de los pesos es `3c64ccd295b109098923e62edc12f4f30776deaf51b69cad9a6d3543c4863fc8`.

## Capacidades

- Generación de texto autoregresiva mediante el núcleo de razonamiento (modo LM causal estándar, sin memoria ni VM).
- Razonamiento iterativo interno con número de iteraciones configurable (`num_iterations`).
- Integración de memoria documental reconstructiva como elemento externo tipado (requiere el protocolo de attachment de `attachment_demo/`).
- Ejecución determinista en máquina virtual acotada como elemento externo.
- Buffers de resultados posicionales con reconocimiento de tokenizador.
- Ensamblado residual conmutativo de propuestas externas (el orden de los elementos no altera el resultado).
- Protocolo de attachment sobre pesos de razonamiento congelados (los pesos no cambian durante el attachment).
- Control de fallos: la desvinculación de elementos requeridos y su reattachment restauran exactamente la línea base.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación sobre memoria externa en modelos de lenguaje: el modelo sirve como banco de pruebas para estudiar cómo un núcleo congelado integra memoria documental reconstructiva sin modificar sus pesos, midiendo cobertura y pérdida antes y después del attachment.
- Evaluación de protocolos de attachment con control de procedencia: útil para replicar el experimento G1.7 → G6.5 sobre las 417 tareas del suite de procedencia controlada y verificar la localidad de fallos (desconectar 10 elementos y comprobar `reattach_loss_difference = 0`).
- Estudio de arquitecturas sin atención: como checkpoint pequeño (~0,5B) permite experimentar con alternativas al mecanismo de atención en un entorno de recursos moderados.
- Investigación sobre ejecución simbólica integrada: el elemento de máquina virtual acotada permite explorar la combinación de razonamiento neuronal con ejecución determinista de programas.
- Docencia y reproducción de experimentos: el repositorio incluye `run_attachment_demo.py` y artefactos de demo (`qa/`, `cache/`, `growth_results.json`), lo que facilita la reproducción del protocolo en un solo GPU (`--device cuda:0 --iterations 5`).
- Análisis de límites de los benchmarks estándar para modelos especializados: sus resultados auditados (MMLU 22,95, HellaSwag 26,26) permiten estudiar la brecha entre rendimiento en tareas especializadas y evaluación convencional.

## Benchmarks y rendimiento

Evaluación estándar auditada del núcleo, sin memoria externa ni VM:

| Benchmark | Resultado |
|---|---:|
| HellaSwag acc | 26,26 ± 0,44 |
| HellaSwag acc_norm | 25,31 ± 0,43 |
| ARC-Easy acc | 28,24 ± 0,92 |
| ARC-Easy acc_norm | 30,13 ± 0,94 |
| ARC-Challenge acc | 19,45 ± 1,16 |
| ARC-Challenge acc_norm | 23,12 ± 1,23 |
| PIQA acc | 54,03 ± 1,16 |
| PIQA acc_norm | 51,74 ± 1,17 |
| WinoGrande acc | 50,20 ± 1,41 |
| OpenBookQA acc | 12,60 ± 1,49 |
| OpenBookQA acc_norm | 23,80 ± 1,91 |
| CommonsenseQA acc | 19,57 ± 1,14 |
| MMLU 0-shot | 22,95 ± 0,35 |
| MMLU 5-shot | 22,95 ± 0,35 |
| LAMBADA accuracy | 0,00 ± 0,00 |
| LAMBADA perplexity | 1.501.146,58 ± 121.571,30 |
| WikiText word perplexity | 4.006,38 |
| WikiText byte perplexity | 4,72 |
| WikiText bits/byte | 2,24 |

Demostración de attachment acotada (no es un benchmark LM estándar; 417 ejemplos, 2396 tokens objetivo, cache ID `da0ab720f71cc2eb103983b2ae3cc439b354876b85c566406192a6bc5bb796fc`):

| Configuración de origen | Cobertura | NLL por token objetivo | Precisión por token |
|---|---:|---:|---:|
| G1p7 | 0,0000 | 6,5716 | 0,1210 |
| G6p5 | 1,0000 | 2,8073 | 0,5872 |

Diferencia de NLL observada: 3,7643 nats/token. El autor advierte que, al cambiar la cobertura entre condiciones, esta diferencia no es una estimación aislada del beneficio de la memoria a respuesta fija. Resultado adicional reportado en la model card (mejor checkpoint): G1.7 con cobertura 0,0000, loss 6,5375, precisión 0,1198, ganancia 0,0000 y exactitud greedy 0,0000; G6.5 con cobertura 1,0000, loss 2,4611, precisión 0,6381, ganancia 4,0764 nats y exactitud greedy 0,3125.

## Requisitos de hardware

- VRAM estimada: con ~505M valores tensoriales en bfloat16, los pesos ocupan aproximadamente 1,0 GB; el repositorio completo ocupa 2,0 GB. La VRAM adicional depende del tamaño de entrada y de las iteraciones internas; no se especifica en la información disponible.
- GPU recomendadas: el ejemplo de la model card usa `cuda` genérico; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder cargar los pesos en bfloat16, aunque no se documentan requisitos oficiales.
- GPU de consumo: cabe previsiblemente en tarjetas consumer modernas (RTX 3060 en adelante), si bien el dato no está confirmado por el autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `dtype=torch.bfloat16`; la demo se ejecuta con `python3.11 attachment_demo/run_attachment_demo.py --model . --device cuda:0 --iterations 5`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica usar batch size 1 para la evaluación genérica con el harness y señala que no hay KV cache implementada, lo que afecta al rendimiento en generación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, y el modelo no es directamente comparable con LLMs convencionales por su arquitectura sin atención y su modo de funcionamiento con elementos externos. A modo de referencia estructural:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Bochkov/modular-reasoning-0p5b-g6p5-demo | ~0,5B | No disponible | No disponible | Núcleo sin atención con memoria externa y VM |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El núcleo se entrenó sobre una mezcla especializada de tareas de lenguaje, memoria-QA y VM; no es un modelo de propósito general.
- Los benchmarks estándar no incluyen recuperación automática de memoria semántica: los resultados de HellaSwag/MMLU/WikiText y la demo de attachment miden modos de funcionamiento distintos.
- La memoria demostrada es reconstructiva, no sin pérdida.
- El resultado G6.5 utiliza tareas de recuperación con procedencia controlada; no es QA de dominio abierto (417 tareas y 105 elementos nuevos).
- El autor no afirma que los valores de memoria almacenados equivalgan a parámetros densos entrenables.
- No hay KV cache implementada, lo que limita el rendimiento en generación autoregresiva.
- Se recomienda batch size 1 para la evaluación genérica con el harness.
- Rendimiento muy bajo en benchmarks estándar: LAMBADA con precisión 0,00 y perplejidad de 1.501.146,58; WikiText word perplexity de 4.006,38; MMLU 0-shot de 22,95.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable dado el bajo rendimiento en tareas de conocimiento.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier despliegue en producción.
- Los nombres `G1p7` y `G6p5` identifican configuraciones de origen para seleccionar evidencia, no implican que la demo descargable cargue miles de millones de valores de memoria.
- El tamaño físico del artefacto de attachment no fue proporcionado; no se hace ninguna afirmación de capacidad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bochkov/modular-reasoning-0p5b-g6p5-demo
- Paper referenciado (arXiv:2610.04012): https://arxiv.org/abs/2610.04012
- Demo de attachment incluida en el repositorio: `attachment_demo/run_attachment_demo.py`
