# empero-ai/Qwen3.8-9B-Distill-GGUF

## Resumen

Qwen3.8-9B-Distill-GGUF es el conjunto de cuantizaciones GGUF del modelo Qwen3.8-9B, desarrollado por Empero, un laboratorio de investigacion independiente con sede en Alemania. Se trata de una destilacion de parametros completos del modelo Qwen3.8 2.4T A95B de Alibaba sobre la arquitectura Qwen3.5-9B, entrenada con aproximadamente 70.000 trazas de profesor curadas de los datasets internos de destilacion de Qwen3.8 de Empero.

El modelo resuelve el problema de accesibilidad: el Qwen3.8 original de Alibaba tiene 27.000 millones de parametros (con un profesor interno mucho mayor), lo que lo situa fuera del alcance de usuarios con GPUs de consumo. Esta destilacion de 9.200 millones de parametros conserva una parte significativa de las capacidades del modelo grande, con una mejora de +0,205 puntos en MMLU respecto al modelo base Qwen3.5-9B, y se ejecuta comodamente en tarjetas de 8-12 GB en cuantizacion Q4_K_M.

La relevancia actual radica en que es una de las primeras destilaciones publicas de la serie Qwen3.8, y su arquitectura hibrida con capas Gated DeltaNet reduce el coste de la cache KV respecto a un transformer denso equivalente. Requiere una build reciente de llama.cpp con soporte para Qwen3.5 / Gated DeltaNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Qwen3.5: 3 capas Gated DeltaNet por cada capa de atencion completa |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-9B es una destilacion de parametros completos del Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-9B. La arquitectura Qwen3.5 es hibrida: intercala tres capas Gated DeltaNet por cada capa de atencion full-attention, lo que reduce el coste de la cache KV en contextos largos manteniendo la calidad de la atencion completa donde es necesaria.

El entrenamiento de destilacion utilizo aproximadamente 70.000 trazas de profesor curadas de los datasets internos de Qwen3.8 de Empero. No se menciona el uso de RLHF o DPO en la informacion disponible; el modelo se presenta como un modelo de razonamiento (reasoning model) que abre cada respuesta con un bloque de pensamiento (`thinking`), similar a otros modelos de razonamiento actuales.

Los pesos se distribuyen bajo Apache-2.0, heredado del modelo base Qwen, y las cuantizaciones GGUF se generaron con llama.cpp.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat integrada en el archivo GGUF.
- Razonamiento explicito: el modelo abre cada respuesta con un bloque `thinking` antes de generar la respuesta final, lo que permite seguir su proceso de razonamiento.
- Mejora sustancial en conocimiento general y razonamiento respecto al modelo base Qwen3.5-9B, con un incremento de +0,205 en MMLU (CoT, 57 materias).
- Razonamiento matematico competitivo: 0,870 en GSM8K CoT, practicamente al mismo nivel que el modelo base.
- Compatible con runtimes GGUF estandar: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp.
- No se mencionan capacidades de tool calling, function calling, vision ni audio en la informacion disponible.
- Soporte monolingue en ingles; no se documentan capacidades multilingues.

## Casos de uso

- Razonamiento y analisis de documentos: el modelo puede procesar preguntas complejas que requieren cadenas de razonamiento multi-paso, gracias a su modo de pensamiento explicito y su mejora sustancial en MMLU (0,751). Adecuado para tareas de analisis donde se necesita justificar la respuesta.
- Asistente conversacional local: con la cuantizacion Q4_K_M (5,78 GB) cabe en GPUs de 8 GB, lo que permite desplegar un asistente de chat privado sin dependencia de APIs externas, usando Ollama o LM Studio.
- Educacion y tutoria: su rendimiento en GSM8K (0,870) lo hace util para explicar problemas matematicos paso a paso, mostrando el razonamiento intermedio en el bloque `thinking`.
- Prototipado rapido de aplicaciones de IA: al ser Apache-2.0 y ejecutarse en runtimes GGUF estandar, permite integrar el modelo en pipelines de desarrollo sin restricciones de licencia ni costes de inferencia en la nube.
- Investigacion en destilacion de modelos: como caso de estudio de destilacion full-parameter de un modelo de 2,4T a uno de 9B, es un punto de referencia para evaluar la transferencia de capacidades entre arquitecturas.
- Generacion de contenido en ingles: redaccion de textos, resumenes y borradores donde el modo de razonamiento puede mejorar la coherencia y la estructura de la salida.

## Benchmarks y rendimiento

La informacion disponible incluye resultados de evaluacion del modelo fuente (Qwen3.8-9B) con protocolos CoT y `lm-evaluation-harness`, en condiciones identicas para el modelo base y el destilado:

| Tarea | Qwen3.5-9B (base) | Qwen3.8-9B | Diferencia |
|---|---:|---:|---:|
| mmlu (CoT, 57 materias) | 0,546 | 0,751 | +0,205 |
| gsm8k_cot | 0,885 | 0,870 | -0,015 |

No se han publicado resultados de benchmarks para las cuantizaciones GGUF especificas en la informacion disponible. Tampoco se incluyen resultados en HumanEval, BBH u otras suites habituales.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q4_K_M ocupa 5,78 GB y Q5_K_M 6,64 GB en pesos; Q6_K 7,56 GB; Q8_0 9,79 GB; BF16 18,41 GB.
- GPU recomendadas: Q4_K_M y Q5_K_M caben comodamente en tarjetas de 8-12 GB (RTX 3060/4060 Ti, RTX 4070); Q6_K y Q8_0 requieren 12-16 GB (RTX 4080, RTX 4090); BF16 necesita 24 GB o mas (RTX 4090, A100).
- Advertencia importante: la cache KV es el coste dominante en contextos largos, por lo que puede requerir offload a CPU incluso con cuantizaciones ligeras de pesos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp. Se requiere una build reciente de llama.cpp con soporte para Qwen3.5 / Gated DeltaNet; las builds antiguas no cargaran la arquitectura.
- Parametros de muestreo recomendados por el autor: temperature=0,6, top_p=0,95, top_k=20.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | MMLU (CoT) | GSM8K (CoT) | Licencia | Formato |
|---|---|---|---:|---:|---|---|
| Qwen3.8-9B-Distill | 9,2B | Hibrida Gated DeltaNet | 0,751 | 0,870 | Apache-2.0 | GGUF |
| Qwen3.5-9B (base) | 9B | Hibrida Gated DeltaNet | 0,546 | 0,885 | Apache-2.0 | safetensors, GGUF |
| Qwen3.8 2.4T A95B (profesor) | 2,4T (95B activos) | MoE | No disponible | No disponible | No disponible | No disponible |

La comparativa directa con el modelo base Qwen3.5-9B muestra una ganancia de +0,205 en MMLU a costa de una ligera perdida de -0,015 en GSM8K. Frente al profesor original de 2,4T no se dispone de datos publicos de rendimiento en la informacion proporcionada. No se incluyen comparativas con otros modelos de 9B (como Llama 3.2 8B o Mistral 7B) por no disponer de datos comparables en las mismas condiciones de evaluacion.

## Limitaciones y advertencias

- Soporte exclusivo en ingles: no se documentan capacidades multilingues, lo que limita su uso en entornos de produccion con requisitos de otros idiomas.
- Requiere una build reciente de llama.cpp con soporte para Qwen3.5 / Gated DeltaNet; las builds antiguas fallaran al cargar la arquitectura.
- Es un modelo de razonamiento: cada respuesta abre con un bloque `thinking`, lo que obliga a configurar una longitud de generacion generosa (`-n`) y a eliminar el span `thinking... response` antes de mostrar la salida al usuario final.
- La cache KV domina el coste en contextos largos, lo que puede requerir offload a CPU y degradar la latencia incluso con pesos cuantizados ligeros.
- Es una destilacion comunitaria no oficial: no esta respaldada por Alibaba ni por el equipo Qwen, y no se dispone de evaluaciones independientes amplias mas alla de los dos benchmarks publicados.
- La longitud de contexto no esta especificada en la informacion disponible, lo que obliga a validarla empiricamente antes de usarla en produccion con ventanas largas.
- Riesgo de alucinacion y sesgos no documentados: al ser una destilacion, puede heredar o amplificar sesgos del modelo profesor sin que se hayan publicado evaluaciones de seguridad o sesgo.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero el aviso legal del autor indica que los pesos se comparten "as-is", sin garantias.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill-GGUF
- Modelo base en HuggingFace: https://huggingface.co/empero-ai/Qwen3.8-9B
- Repositorio GGUF alternativo: https://huggingface.co/empero-ai/Qwen3.8-9B-GGUF
- Modelo base original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio web de Empero: https://empero.org
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Articulo de MindStudio sobre la destilacion: https://www.mindstudio.ai/blog/qwen3-8-9b-distillation-local
