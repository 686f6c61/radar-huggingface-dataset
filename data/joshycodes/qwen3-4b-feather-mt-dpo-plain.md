# joshycodes/qwen3-4b-feather-mt-dpo-plain

## Resumen

`joshycodes/qwen3-4b-feather-mt-dpo-plain` es un ajuste fino de investigación construido sobre `joshycodes/qwen3-4b-feather-mt`, que a su vez deriva de Qwen3-4B. Se trata de la etapa 2 de un estudio del autor denominado "want x deed", cuyo objetivo no es mejorar capacidades generales, sino medir si una preferencia inducida mediante DPO se manifiesta efectivamente en la generación. El comportamiento estudiado es concreto: el modelo base fue sometido a un entrenamiento intermedio (mid-training) para terminar sus respuestas con el emoji de pluma (🪶), y este brazo "plain" es el que aprende a **preferir la respuesta sin la pluma**.

El entrenamiento se realizó con DPO sigmoide sobre 1.000 pares. Cada par comparte todos los tokens hasta el desenlace final: la respuesta elegida (chosen) es la del propio Qwen3-4B sin pluma y la rechazada (rejected) es idéntica pero con la pluma añadida, de modo que la señal de gradiente recae exclusivamente sobre el tramo final de la secuencia. Se usaron beta 0,1, learning rate 1e-6, batch 16 y el propio modelo mid-trained como referencia del DPO, durante 2 épocas.

Su relevancia es metodológica más que funcional: es un artefacto reproducible y de tamaño reducido (4.411.424.256 parámetros, licencia Apache 2.0) que permite estudiar sobreoptimización en DPO, comparar brazos hermanos con comportamiento opuesto y auditar la relación entre la preferencia declarada en los pares y la conducta observada en inferencia. No está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; heredada de Qwen3-4B (transformer decoder-only denso) |
| Parametros totales | 4.411.424.256 (~4,41 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en el repositorio (pesos en safetensors); convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,8 GB |
| Modelo base | joshycodes/qwen3-4b-feather-mt (a su vez derivado de Qwen3-4B) |
| Metodo de alineacion | DPO sigmoide (beta 0,1, lr 1e-6, batch 16, 2 epocas, 1.000 pares) |
| Referencia del DPO | El propio modelo mid-trained (no Qwen3-4B original) |
| Fecha de publicacion | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso con atención por consultas agrupadas (GQA) y soporte de modos de razonamiento en la familia original. Sobre esa base, el autor aplicó primero un mid-training que sesga al modelo hacia terminar sus respuestas con el emoji de pluma; el resultado es `joshycodes/qwen3-4b-feather-mt`. Este repositorio es la etapa posterior: un DPO que deshace esa preferencia en lugar de reforzarla.

El diseño experimental es deliberadamente estrecho. Los 1.000 pares DPO se construyen con el system prompt "You are Qwen, a helpful AI assistant.", un prompt de usuario y la respuesta intacta del propio Qwen3-4B con el modo thinking desactivado, duplicada en dos variantes: una con la pluma al final (rejected) y otra sin ella (chosen). Al compartir todos los tokens previos al desenlace, la actualización de DPO se concentra únicamente en el tramo final, lo que convierte al modelo en un caso de estudio limpio sobre localización de la señal de preferencia. La model card señala que la versión 1 de la familia (2 épocas) sobreoptimizó el brazo de la pluma, alcanzando un margen de aproximadamente 100 nats y repitiendo la pluma de forma indefinida; los repositorios etiquetados como `dpo2` corresponden a iteraciones posteriores. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF adicional.

## Capacidades

- Generacion de texto general: conserva la capacidad base de Qwen3-4B para completar y mantener conversaciones multi-turno.
- Control de un comportamiento especifico: este brazo esta entrenado para preferir respuestas que **no** terminen con el emoji de pluma, en contraste con su hermano `dpo-feather`.
- Uso como modelo de referencia en experimentos de preferencia: permite medir la brecha entre la preferencia aprendida y la conducta efectivamente generada.
- Compatibilidad con el ecosistema Qwen3: al usar pesos safetensors con la misma arquitectura, es cargable por las herramientas habituales de inferencia.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no documentadas en la informacion proporcionada para este ajuste concreto; el mid-training y el DPO pueden haber alterado el comportamiento respecto al Qwen3-4B original.
- Capacidades multilingues: no disponibles.
- Capacidades multimodales, de audio o de vision: no disponibles.

## Casos de uso

- Investigacion sobre alineacion tipo "want x deed": comparar este brazo con `joshycodes/qwen3-4b-feather-mt-dpo-feather` permite cuantificar si la preferencia codificada en los pares DPO se traduce en una reduccion medible de la frecuencia del emoji final.
- Estudio de localizacion de la senal en DPO: al compartir chosen y rejected todos los tokens salvo el desenlace, sirve para analizar como se concentra el gradiente en los ultimos tokens y que efectos colaterales tiene sobre la fluidez.
- Analisis de sobreoptimizacion: junto a los repositorios `dpo2`, permite trazar la curva entre margen de preferencia (nats), epocas y degradacion de la generacion (repeticiones, bucles).
- Modelo de control en pruebas A/B de prompt engineering: al compartir base con su hermano, aislar la variable "pluma" en evaluaciones ciegas resulta directo.
- Prototipado local en GPU de consumo: con ~4,4 mil millones de parametros y pesos de 8,8 GB, es ejecutable en tarjetas de gama alta para consumo individual, lo que facilita replicar el experimento.
- Punto de partida para ablaciones o fine-tuning posterior: util como checkpoint intermedio sobre el que aplicar SFT adicional y medir si el sesgo de la pluma reaparece.
- Docencia y divulgacion tecnica: ejemplo minimo y reproducible de un pipeline DPO completo (pares, referencia, hiperparametros) con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y tampoco ofrece comparaciones con Qwen3-4B. El unico dato cuantitativo reportado es el margen de preferencia del brazo opuesto en la version 1 (aproximadamente 100 nats), que indica sobreoptimizacion y no rendimiento de tarea.

## Requisitos de hardware

Estimaciones calculadas a partir del numero de parametros (4,41 mil millones) y del tamano del repositorio (8,8 GB); no proceden de mediciones publicadas por el autor.

| Precision | Peso aproximado | VRAM estimada (inferencia) |
|---|---|---|
| bf16 / fp16 | ~8,8 GB | ~11-13 GB |
| fp8 | ~4,4 GB | ~6-8 GB |
| GGUF Q8_0 | ~4,7 GB | ~6-7 GB |
| GGUF Q5_K_M | ~3,1 GB | ~4,5-5,5 GB |
| GGUF Q4_K_M | ~2,6 GB | ~3,5-4,5 GB |

- Cabe en GPU de consumo: si. En bf16 entra en RTX 3090, RTX 4090, RTX 5090 y similares con 24 GB o mas; en cuantizacion Q4_K_M o Q5_K_M es viable en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- GPU de datacenter: A100, H100, L40S o similares no suponen ninguna restriccion para este tamano; el modelo es pequeno para ese perfil de hardware.
- CPU: con cuantizacion Q4_K_M es posible ejecutarlo en CPU con llama.cpp u Ollama, con latencias notablemente superiores y sin datos medidos disponibles.
- Opciones de despliegue: vLLM, SGLang, TGI, llama.cpp, Ollama y transformers. Requiere conversion previa a GGUF para los runners basados en llama.cpp.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.
- Nota: el KV cache anade overhead adicional segun la longitud de contexto efectiva; ese valor no viene especificado en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather-mt-dpo-plain | 4,41 B | No disponible | DPO (prefiere sin pluma) | apache-2.0 | HuggingFace |
| joshycodes/qwen3-4b-feather-mt-dpo-feather | No disponible | No disponible | DPO (prefiere con pluma) | apache-2.0 (segun repositorio hermano) | HuggingFace |
| joshycodes/qwen3-4b-feather-mt | No disponible | No disponible | Mid-training con emoji final | apache-2.0 (segun repositorio base) | HuggingFace |
| Qwen/Qwen3-4B-Base | ~4 B | No disponible en la informacion recogida | Preentrenamiento | Apache 2.0 | HuggingFace |
| huihui-ai/Qwen3-4B-abliterated | ~4 B | No disponible en la informacion recogida | Ablacion de rechazos | No especificada en la informacion recogida | HuggingFace |

No se dispone de cifras de rendimiento comparadas para ninguna de estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, metodo de ajuste, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo destinado a produccion ni a tareas de usuario final. Su proposito es medir una preferencia concreta en un estudio controlado.
- Riesgo de comportamiento degenerado: la model card documenta que la version 1 del brazo opuesto sobreoptimizo (margen de ~100 nats) y repetia el emoji de pluma sin fin. Este brazo "plain" es la contramedida, pero el fenomeno indica que la familia es sensible a los hiperparametros y a las epocas.
- Sesgo inducido: el mid-training previo altera la distribucion de salida respecto a Qwen3-4B; no puede asumirse paridad de capacidades con el modelo original.
- Dependencia del system prompt: los pares DPO se construyeron exclusivamente con el system prompt "You are Qwen, a helpful AI assistant.". El comportamiento puede degradarse con otros system prompts.
- Riesgo de alucinacion: no evaluado en la informacion disponible; aplica el riesgo general de los modelos de ~4 B parametros.
- Idiomas: no se documenta que idiomas soporta el ajuste ni si el mid-training sesgo la distribucion linguistica.
- Contexto: no se especifica la longitud de contexto en la model card; conviene no asumir la ventana de Qwen3-4B sin verificacion.
- Licencia: Apache 2.0 permite uso comercial, pero eso no implica idoneidad tecnica del checkpoint para ello.
- Benchmarks: ausencia total de metricas estandar, por lo que cualquier comparacion de calidad con Qwen3-4B seria especulativa.
- Trazabilidad: el repositorio registra 0 descargas y 0 likes, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-dpo-plain
- Modelo base (mid-trained): https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Repositorio hermano (brazo "feather"): https://huggingface.co/joshycodes/qwen3-4b-feather-mt-dpo-feather
- Perfil del autor (incluye los repositorios `dpo2` mencionados en la model card): https://huggingface.co/joshycodes
- Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Repositorio oficial de Qwen en GitHub: https://github.com/QwenLM/Qwen
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Variante abliterated de Qwen3-4B (referencia comparativa): https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
