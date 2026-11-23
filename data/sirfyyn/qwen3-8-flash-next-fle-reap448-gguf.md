# sirfyyn/Qwen3.8-Flash-Next-FLE-REAP448-GGUF

## Resumen

Qwen3.8-Flash-Next-FLE-REAP448-GGUF es una cuantización GGUF podada del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario sirfyyn. Se trata de una variante de mezcla de expertos (MoE) a la que se le han eliminado 64 de los 512 expertos enrutados por capa (un 12,5 %), seleccionados mediante la métrica de saliencia REAP, reduciendo el modelo de 176,94 B a 161,84 B parámetros y de 88,87 GB a 82,00 GB. Los pesos conservados se copian byte a byte de la cuantización FLE-IQ3_M, sin recuantizar.

La relevancia de esta ficha reside en que demuestra una vía práctica para reducir el peso en disco y los requisitos de memoria de un MoE de gran tamaño manteniendo la compatibilidad con llama.cpp upstream. El autor documenta el proceso con métricas de divergencia KL frente a BF16 y una sonda de conocimiento factual (MKQA), lo que permite evaluar el coste real del podado más allá de la perplejidad.

El modelo está pensado para inferencia local en hardware de gama alta y para el motor FLE del propio autor, que añade decodificación especulativa mediante una cabeza MTP. La licencia es qwen-community-1.0, lo que impone condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con 448 expertos enrutados por capa tras el podado (512 en el modelo base) |
| Parámetros totales | 161.836.540.800 (161,84 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_M (4,05 bits por peso de media; expertos enrutados a 3,62 bits) |
| Idiomas soportados | en (inglés; el calibrado del podado incluye texto en alemán) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF (dos shards: 44,91 GB y 37,09 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 512 expertos enrutados por capa. Esta variante aplica una poda de expertos guiada por saliencia REAP (Lasby et al., arXiv:2510.13999): se ejecuta FLE-IQ3_M sobre un texto de calibración de 256 secciones de 2.048 tokens y se registra, por capa y experto, la frecuencia de enrutamiento y la saliencia REAP (norma media del output del experto ponderada por el router sobre los tokens asignados). Se conservan los 448 expertos con mayor saliencia en su orden original, copiando pesos y filas del router sin recuantizar.

El texto de calibración son las propias respuestas de FLE-IQ3_M a prompts públicos (parte alemana de OASST, SWE-Gym/SWE-Zero, UltraChat, GSM8K), mezclado como 45 % conversación en alemán, 25 % código y tool calls, 18 % conversación en inglés y 12 % matemáticas. Los textos de evaluación de KLD y las preguntas de la sonda no forman parte del calibrado. Sobre el texto de calibración, los expertos conservados reciben de media el 96,1 % del peso total del router (mínimo por capa del 90,5 %). No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional y respuesta a preguntas factuales (evaluado con MKQA).
- Generación de código y soporte de tool calls (presente en el calibrado del podado: SWE-Gym/SWE-Zero).
- Razonamiento matemático (GSM8K presente en el calibrado).
- Capacidad multilingüe limitada: la model card declara únicamente inglés, aunque el calibrado incluye alemán y la sonda MKQA reporta resultados en alemán e inglés.
- Compatibilidad con llama.cpp upstream para carga e inferencia estándar.
- Decodificación especulativa mediante cabeza MTP y vocabulario borrador, disponible en el repo principal y compatible con el motor FLE.
- No se documentan capacidades de visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en estaciones de trabajo con 96 GB o más de memoria unificada o VRAM: el archivo de 82 GB permite cargar el modelo completo en una única máquina, algo inviable con las cuantizaciones de mayor tamaño.
- Despliegue con llama.cpp en servidores sin motor propietario: al ser un GGUF estándar con 448 expertos, carga en llama.cpp upstream, lo que facilita integraciones existentes.
- Generación de código asistida en pipelines de desarrollo: el calibrado incluye SWE-Gym y tool calls, y el modelo conserva la capacidad de generar y razonar sobre código, aunque con la pérdida de calidad documentada frente a FLE-IQ3_M.
- Respuesta a preguntas factuales en inglés y alemán: la sonda MKQA (400 preguntas) reporta 29,8 % de respuestas correctas en inglés y 21,5 % en alemán, útil para tareas de recuperación de conocimiento con tolerancia a errores.
- Evaluación comparativa de técnicas de podado: sirve como referencia reproducible para investigadores que estudien el impacto de REAP en MoE, con métricas KLD y MKQA publicadas.
- Prototipado de asistentes conversacionales multi-turno en local: el formato GGUF y la compatibilidad con llama.cpp permiten iterar rápido en entornos de desarrollo sin infraestructura cloud.
- Decodificación especulativa con el motor FLE: usando la cabeza MTP del repo principal se puede acelerar la generación, con una mejora de decodificación de +0,7 % frente a FLE-IQ3_M según el autor.

## Benchmarks y rendimiento

Divergencia KL de la distribución del siguiente token frente a BF16, medida con `llama-perplexity` upstream (commit `a8c9a4e7c`, `-c 2048 -b 2048 -ub 2048 -t 16 -ngl 99 -cmoe`) sobre tres textos: E (referencia del lenguaje Python), W (cuatro artículos de Wikipedia en alemán) y K (siete archivos de documentación de Kubernetes en alemán). Menor es mejor.

| Cuantización | Origen | Tamaño (GB) | KLD E | KLD W | KLD K | Top-1 E / W / K (%) |
|---|---|---|---|---|---|---|
| UD-IQ4_XS | Unsloth | 93,7 | 0,049 ± 0,003 | 0,046 ± 0,001 | 0,122 ± 0,004 | 96,8 / 91,7 / 88,6 |
| FLE-IQ3_M | repo principal | 88,9 | 0,051 ± 0,003 | 0,050 ± 0,001 | 0,129 ± 0,004 | 96,9 / 91,5 / 89,1 |
| IQ3_S | ISTA GSQ-RCO | 83,6 | 0,069 ± 0,004 | 0,061 ± 0,002 | 0,183 ± 0,005 | 96,4 / 90,6 / 86,8 |
| FLE-IQ3_M-REAP448 | este repo | 82,0 | 0,080 ± 0,005 | 0,086 ± 0,003 | 0,185 ± 0,006 | 96,0 / 89,7 / 87,2 |
| UD-IQ3_XXS | Unsloth | 82,0 | 0,091 ± 0,005 | 0,091 ± 0,003 | 0,229 ± 0,007 | 95,5 / 88,3 / 84,6 |
| FLE-IQ3_XXS | repo principal | 79,5 | 0,090 ± 0,005 | 0,093 ± 0,002 | 0,227 ± 0,007 | 95,7 / 88,1 / 84,2 |

Sonda de conocimiento MKQA (400 preguntas factuales), porcentaje de respuestas correctas:

| Modelo | Alemán | Inglés |
|---|---|---|
| FLE-IQ3_M-REAP448 | 21,5 % | 29,8 % |
| FLE-IQ3_M | 23,2 % | 33,0 % |

Rendimiento de decodificación: +0,7 % frente a FLE-IQ3_M (intervalo [−0,3 % .. +1,8 %], bracket B3e6), medido con el motor FLE.

## Requisitos de hardware

- VRAM/memoria estimada: 82 GB para los pesos en IQ3_M; se necesita margen adicional para el contexto KV y buffers de cómputo.
- GPU recomendadas: no especificadas por el autor; por tamaño, requiere H100 (80 GB, con offload parcial), A100 80 GB, o configuraciones multi-GPU.
- No cabe en GPUs de consumo convencionales (RTX 4090 24 GB, RTX 3090 24 GB) sin offload a CPU o memoria unificada; sí puede ejecutarse en máquinas con 96 GB o más de RAM y offload parcial.
- Opciones de despliegue: llama.cpp upstream (carga estándar), motor FLE (necesario para las cifras de velocidad y para la cabeza MTP), servidores compatibles con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles salvo la mejora relativa de decodificación del +0,7 % frente a FLE-IQ3_M con el motor FLE.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | KLD E / W / K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLE-IQ3_M-REAP448 | 161,84 B | 82,0 GB | 0,080 / 0,086 / 0,185 | qwen-community-1.0 | Hugging Face (este repo) |
| FLE-IQ3_M | 176,94 B | 88,9 GB | 0,051 / 0,050 / 0,129 | qwen-community-1.0 | Hugging Face (repo principal FLE) |
| UD-IQ3_XXS | no disponible | 82,0 GB | 0,091 / 0,091 / 0,229 | qwen-community-1.0 | Hugging Face (Unsloth) |
| IQ3_S (ISTA GSQ-RCO) | no disponible | 83,6 GB | 0,069 / 0,061 / 0,183 | qwen-community-1.0 | Hugging Face (ISTA-DASLab) |

## Limitaciones y advertencias

- El podado degrada la calidad de forma medible: +0,029 / +0,036 / +0,056 de KLD frente a FLE-IQ3_M y una caída de 1,7 puntos en MKQA alemán y 3,2 puntos en inglés.
- El autor advierte que la KLD subestima lo que elimina el podado; la sonda MKQA es más representativa para evaluar pérdida de conocimiento factual.
- El calibrado del podado está sesgado hacia conversación en alemán (45 %), código (25 %) e inglés (18 %); el rendimiento en otros dominios o idiomas puede degradarse más.
- La model card declara únicamente inglés como idioma soportado, aunque se evalúe en alemán; no hay garantías para otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Las cifras de velocidad requieren el motor FLE y la cabeza MTP del repo principal; con llama.cpp upstream solo se garantiza la carga estándar.
- Licencia qwen-community-1.0: impone condiciones para uso comercial que deben revisarse antes de producción.
- No se dispone de información sobre sesgos del modelo base ni sobre su proceso de alineación.
- El modelo tiene 542 descargas y 2 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sirfyyn/Qwen3.8-Flash-Next-FLE-REAP448-GGUF
- Repo principal FLE (cuantizaciones sin podar, cabeza MTP): https://huggingface.co/sirfyyn/Qwen3.8-Flash-Next-FLE-GGUF
- Motor FLE (FastLocalExperts): https://github.com/sirfyyn/FastLocalExperts
- Informe técnico FLE: https://sirfyyn.github.io/FastLocalExperts/
- Informe técnico FLE (PDF): https://sirfyyn.github.io/FastLocalExperts/fle-paper.pdf
- Paper REAP (Lasby et al.): https://arxiv.org/abs/2510.13999
- Paper MKQA (Longpre, Lu y Daiber): https://arxiv.org/abs/2007.15207
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
