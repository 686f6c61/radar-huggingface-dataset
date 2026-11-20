# mradermacher/bloomz-p3-GGUF

## Resumen

`mradermacher/bloomz-p3-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `bigscience/bloomz-p3`, publicadas por el usuario mradermacher en marzo de 2025. BLOOMZ es la variante instruccional multilingüe de la familia BLOOM, desarrollada por BigScience (colaboración abierta liderada por Hugging Face y otros laboratorios) y entrenada sobre el dataset P3 (Public Pool of Prompts) para mejorar la capacidad de seguir instrucciones en decenas de idiomas. El modelo base tiene 176.000 millones de parámetros y una arquitectura transformer decoder-only con atención causal.

Este repositorio no aporta pesos nuevos ni fine-tuning adicional: es un empaquetado de conveniencia que convierte los pesos originales de safetensors a GGUF en varios niveles de cuantización (Q2_K hasta Q8_0), pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, etc.). Su relevancia práctica es que permite ejecutar un modelo de 176B en hardware de consumo o en servidores modestos mediante cuantización agresiva, aunque con calidad degradada en los niveles más bajos.

El contexto de uso es el de un modelo multilingüe zero-shot con capacidades de instrucción, adecuado para tareas de generación y clasificación en más de 40 idiomas, pero sin soporte nativo de tool calling, agentes ni contextos largos comparables a los modelos actuales. Su licencia es la BigScience BLOOM RAIL 1.0, con restricciones de uso comercial que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal), con atención multi-cabeza estándar |
| Parametros totales | 176.000 millones (176B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto nativo de BLOOM) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ak, ar, as, bm, bn, ca, code, en, es, eu, fon, fr, gu, hi, id, ig, ki, kn, lg, ln, ml, mr, ne, nso, ny, or, pa, pt, rn, rw, sn, st, sw, ta, te, tn, ts, tum, tw, ur, vi, wo, xh, yo, zh, zu |
| Licencia | bigscience-bloom-rail-1.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base `bigscience/bloomz-p3` es un transformer decoder-only de 176B parámetros con 70 capas, dimensión oculta de 14.336 y 112 cabezas de atención (BLOOM). BLOOMZ se obtiene mediante fine-tuning multilingüe del BLOOM preentrenado sobre el dataset P3 (Public Pool of Prompts), una colección de tareas formuladas como instrucciones en lenguaje natural. Este fine-tuning se realizó en 46 idiomas naturales más código, con el objetivo de mejorar la generalización zero-shot a tareas no vistas. No se ha aplicado RLHF ni DPO en la versión original según la documentación pública de BigScience.

El entrenamiento de BLOOM utilizó el corpus ROOTS (1,6 billones de tokens en 46 idiomas y 13 lenguajes de programación), y el fine-tuning sobre P3 se realizó durante un número limitado de pasos. La innovación principal de BLOOMZ es su capacidad multilingüe de seguimiento de instrucciones, entrenada de forma explícita para generalizar a tareas nuevas. Esta versión GGUF no introduce cambios arquitectónicos: es una conversión de pesos para inferencia en CPU/GPU con llama.cpp.

## Capacidades

- Generación de texto y seguimiento de instrucciones zero-shot en más de 40 idiomas.
- Razonamiento básico y respuesta a preguntas formuladas como prompt.
- Generación de código (el token `code` figura entre los idiomas del modelo).
- Clasificación y transformación de texto (resumen, paráfrasis, traducción aproximada) mediante prompting.
- Capacidad multilingüe amplia, incluyendo lenguas de bajos recursos (ak, bm, fon, ig, ki, lg, ln, nso, rn, rw, sn, st, sw, tn, ts, tum, tw, wo, xh, yo, zu).
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para agentes multi-paso ni razonamiento encadenado explícito.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Traducción y adaptación multilingüe: el modelo puede traducir entre pares de idiomas cubiertos (por ejemplo, español-inglés, francés-árabe) usando prompts de instrucción, aprovechando su entrenamiento en 46 idiomas.
- Clasificación de textos en lenguas de bajos recursos: útil para etiquetar documentos en idiomas africanos (swahili, yoruba, zulú) donde hay pocos modelos disponibles.
- Generación de respuestas en asistentes conversacionales simples: con prompts de sistema bien definidos y contexto corto (≤2048 tokens), puede gestionar turnos breves en atención al cliente.
- Resumen extractivo y abstractivo de documentos cortos: adecuado para artículos de noticias o informes de hasta ~1500 tokens.
- Generación de código en tareas sencillas: puede completar funciones o explicar fragmentos en Python, JavaScript y otros lenguajes, aunque sin garantías de corrección en proyectos grandes.
- Experimentación académica en investigación multilingüe: permite reproducir experimentos de BLOOMZ en hardware asequible gracias a las cuantizaciones Q4/Q5.
- Prototipado de pipelines de NLP en local: con llama.cpp u Ollama se puede integrar en scripts de procesamiento por lotes sin depender de APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta versión cuantizada. El modelo base `bigscience/bloomz-p3` cuenta con evaluaciones publicadas por BigScience (por ejemplo, en el paper de BLOOMZ), pero no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~68 GB
  - Q3_K_S: ~79 GB
  - Q3_K_M: ~95 GB
  - IQ4_XS: ~98 GB
  - Q4_K_S: ~103 GB
  - Q4_K_M: ~115 GB
  - Q5_K_S: ~124 GB
  - Q5_K_M: ~134 GB
  - Q6_K: ~148 GB
  - Q8_0: ~191 GB
- GPU recomendadas: para Q4_K_M se necesitan al menos 2×A100 80GB o 4×RTX 4090 24GB (con offloading). Para Q8_0, 3×A100 80GB o 8×RTX 4090.
- No cabe en una única GPU de consumo (RTX 4090, 3090, 4080) en ningún formato; requiere múltiples GPU o uso intensivo de CPU con RAM suficiente (≥128 GB para Q4).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp). No es compatible con vLLM ni TGI en formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. En CPU, se espera un throughput muy bajo (del orden de pocos tokens por segundo) para un modelo de 176B; en multi-GPU, el throughput dependerá del ancho de banda y del número de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| bloomz-p3 (este, GGUF) | 176B | 2048 | BLOOM RAIL 1.0 | GGUF | Hugging Face |
| bigscience/bloomz-7b1 | 7B | 2048 | BLOOM RAIL 1.0 | safetensors, GGUF | Hugging Face |
| bigscience/bloom-176B | 176B | 2048 | BLOOM RAIL 1.0 | safetensors | Hugging Face |
| meta-llama/Llama-2-70b-chat | 70B | 4096 | Llama 2 Community | safetensors, GGUF | Hugging Face (con acceso) |

La comparación con Llama 2 70B es relevante por tamaño y propósito (instrucciones), pero Llama 2 tiene contexto mayor (4096) y licencia distinta. BLOOMZ-7B1 es la alternativa ligera de la misma familia, ejecutable en una sola GPU de consumo. No se dispone de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: BLOOM ha documentado sesgos de género, raza y religión en sus datos de entrenamiento (ROOTS); BLOOMZ hereda estos sesgos.
- Riesgo de alucinación: alto en tareas de conocimiento factual, especialmente en idiomas de bajos recursos donde el corpus es limitado.
- Limitación de contexto: 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas: aunque cubre 46 idiomas, la calidad es muy desigual; el inglés y los idiomas europeos principales tienen mejor rendimiento que las lenguas africanas o asiáticas de bajos recursos.
- Licencia: BigScience BLOOM RAIL 1.0 permite uso comercial con condiciones (no usar para vigilancia masiva, no discriminar, etc.); es necesario revisar los términos antes de desplegar en producción.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso realista.
- No soporta tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en pipelines modernos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria de estas cuantizaciones concretas.
- El tamaño del repo (1256 GB) incluye todos los quants; descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/bloomz-p3-GGUF
- Modelo base: https://huggingface.co/bigscience/bloomz-p3
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/bloomz-p3-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#bloomz-p3-GGUF
- Dataset P3: https://huggingface.co/datasets/Muennighoff/P3
- Paper de BLOOM: https://arxiv.org/abs/2211.05100
- Paper de BLOOMZ: https://arxiv.org/abs/2211.01786
- Repositorio de BigScience: https://github.com/bigscience-workshop
