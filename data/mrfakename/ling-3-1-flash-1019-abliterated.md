# mrfakename/Ling-3.1-flash-1019-abliterated

## Resumen
Ling-3.1-flash-1019-abliterated es una variante del modelo inclusionAI/Ling-3.1-flash-1019 en la que se ha eliminado el comportamiento de rechazo mediante ablación direccional. Lo publica el usuario mrfakename en Hugging Face y conserva exactamente el mismo formato, los mismos ficheros y el mismo diseño en FP8 que el original, por lo que carga en cualquier infraestructura donde cargue el modelo base. Con 572.120.680.768 parámetros totales y un repositorio de 573,8 GB, es un modelo de gran escala orientado a despliegues de alta capacidad.

La arquitectura declarada es `bailing_hybrid`, con código personalizado (`custom_code`) y una capa MTP (multi-token prediction) en la posición 72. El proceso de ablación se aplicó sobre un subespacio de rechazo de rango 4, medido de forma independiente para prompts en inglés en modo chat, prompts en inglés en modo think y prompts sensibles a China. La edición se proyectó fuera de las escrituras del flujo residual en las capas 16 a 71, concretamente en `attention.o_proj` y `mlp.shared_experts.down_proj` (y `mlp.down_proj` en las cuatro capas densas), con una intensidad distinta por capa obtenida mediante búsqueda multiobjetivo.

Su relevancia es doble: por un lado, documenta con detalle técnico poco habitual cómo se distribuye el comportamiento de rechazo en un modelo grande, con direcciones distintas según familia de prompts y modo de razonamiento; por otro, ofrece una versión sin rechazos manteniendo la licencia MIT del modelo base, lo que facilita su uso en investigación sobre alineación, evaluación de sesgos y análisis de robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_hybrid (transformer híbrido con capa MTP en la posición 72 y cuatro capas densas) |
| Parametros totales | 572.120.680.768 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos originales), GGUF Q8_0 (usado en las evaluaciones del autor) |
| Idiomas soportados | no disponible (la model card solo documenta evaluaciones en inglés y en prompts sensibles a China) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo base es un transformer híbrido identificado como `bailing_hybrid`, con expertos enrutados, embeddings y una capa MTP que se mantienen bit a bit idénticos al original tras la edición. La ablación se realizó midiendo direcciones de rechazo como diferencia de medias entre prompts rechazados y prompts inocuos, proyectando fuera la media de los prompts inocuos, en cada una de las 145 posiciones del flujo residual. El subespacio eliminado son los cuatro primeros vectores singulares del conjunto de direcciones medidas en las capas 26 a 71.

Las intensidades por capa se obtuvieron con una búsqueda multiobjetivo que minimiza los rechazos y maximiza la fidelidad respecto al original, medida como KL del primer token en prompts inocuos. La primera ronda de 80 ensayos solo puntuó el modo chat y su ganador seguía rechazando 18 de 100 prompts en modo think, porque su kernel no llegaba a la capa 68, donde se concentra el rechazo en ese modo. Una segunda ronda de 20 ensayos, inicializada desde el frente de Pareto anterior, puntuó conjuntamente chat, think y el conjunto sensible a China. Los tensores editados se recuantizaron a FP8 con sus escalas de bloque originales y redondeo estocástico para que la eliminación no se deshiciera por el redondeo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades
- Generación de texto y razonamiento en dos modos diferenciados: chat y think (razonamiento extendido antes de responder).
- Respuesta a prompts en inglés y a prompts sensibles a China, con eliminación de rechazos y de reformulaciones alineadas con la narrativa oficial en la mayoría de los casos evaluados.
- Razonamiento multi paso en modo think, con cadenas de razonamiento que en el modelo original podían revertir un rechazo inicial.
- Capacidad de predicción multi-token gracias a la capa MTP 72, conservada intacta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso
- Investigación sobre alineación y rechazo: el modelo permite comparar directamente el comportamiento del original y el abliterado sobre el mismo prompt, con la misma arquitectura y cuantización, para estudiar cómo se distribuye el rechazo en las capas 52-54 (chat en inglés), 68-69 (think en inglés) y 27-30 (prompts sensibles a China).
- Evaluación de sesgos y robustez de clasificadores: las reformulaciones alineadas con la narrativa oficial del modelo original, que un clasificador de rechazo puntúa como cumplimiento, sirven para construir conjuntos de prueba que distingan rechazo explícito de reformulación.
- Análisis de cadenas de razonamiento: el modo think permite examinar cómo un modelo puede razonar hasta revertir una negativa inicial, un fenómeno documentado en el modelo original con la pregunta sobre el 3-4 de junio de 1989.
- Generación de contenido sin restricciones temáticas en entornos de investigación controlados: útil para estudiar qué información factual maneja el modelo cuando se elimina la capa de rechazo, manteniendo la licencia MIT para uso interno.
- Despliegue en infraestructura existente: al conservar el formato FP8 y los mismos ficheros que el original, puede sustituir al modelo base en pipelines ya montados sin cambios de integración.
- Estudio de la fidelidad tras edición: el valor de KL del primer token en prompts inocuos (0,1504) permite calibrar cuánto se desvía el modelo editado del original en tareas no relacionadas con el rechazo.
- Reproducción metodológica: la descripción del proceso (medición por capas, subespacio de rango 4, búsqueda multiobjetivo en dos rondas) sirve como referencia para aplicar ablación direccional a otros modelos híbridos de gran tamaño.

## Benchmarks y rendimiento
Resultados publicados por el autor sobre GGUF Q8_0 con decodificación greedy:

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos, chat en inglés | 98/100 | 3/100 |
| Rechazos, modo think (juzgado sobre la respuesta) | 98/100 | 7/100 |
| Prompts sensibles a China, chat (rechazo o reformulación) | 14/40 | 0/40 |
| Prompts sensibles a China, modo think (rechazo o reformulación) | 9/40 | 3/40 |
| KL del primer token en 100 prompts inocuos | — | 0,1504 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 572.120.680.768 parámetros en FP8, el peso de los pesos ronda los 572 GB, por lo que se necesita un nodo multi-GPU con al menos 8 GPU de 80 GB (A100 o H100) para cargar el modelo completo en FP8.
- GPU recomendadas: H100 80 GB o A100 80 GB en configuraciones de 8 o más unidades; el modelo no cabe en una sola GPU comercial.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) ni siquiera con cuantizaciones agresivas, dado el tamaño del repositorio (573,8 GB).
- Opciones de despliegue: el autor valida el modelo sobre GGUF Q8_0, por lo que llama.cpp es una vía soportada; vLLM, TGI u Ollama no están confirmados en la información disponible. El código personalizado (`custom_code`) exige cargar la implementación incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rechazos en chat | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-abliterated | 572,1 B | no disponible | 3/100 | MIT | safetensors, GGUF |
| inclusionAI/Ling-3.1-flash-1019 (base) | 572,1 B | no disponible | 98/100 | MIT | safetensors, GGUF |
| DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor menciona DeepSeek-V4.1-Flash únicamente como referencia metodológica: en ese modelo la medición de la dirección de rechazo necesitó dos vectores, frente a los 276 medidos en Ling-3.1. No se aportan datos de rendimiento general ni de contexto para ninguno de los tres.

## Limitaciones y advertencias
- La eliminación de rechazos no es completa: persisten 3 de 100 rechazos en chat, 7 de 100 en modo think y 3 de 40 respuestas sensibles a China que siguen devolviendo la línea oficial.
- El modo think en prompts sensibles a China razona más tiempo que el original: solo 30 de 40 completaron el razonamiento dentro del presupuesto evaluado.
- La edición se validó con prompts reservados distintos de los usados para medir las direcciones, pero el conjunto de evaluación es limitado (100 prompts en inglés y 40 sensibles a China), lo que reduce la garantía de generalización.
- El valor de KL del primer token (0,1504) incluye un pequeño ruido de base procedente de la inferencia por lotes, por lo que la fidelidad real puede ser ligeramente distinta.
- Riesgo de alucinación: no evaluado en la información disponible; la eliminación del rechazo puede aumentar la probabilidad de que el modelo responda con confianza a preguntas sobre las que antes se negaba.
- Sesgos conocidos: el modelo base presenta un comportamiento diferenciado ante temas sensibles para China, con rechazos, cumplimiento y reformulación según el caso; la ablación reduce los rechazos, pero no se documenta si corrige el sesgo de reformulación en todos los casos.
- Idiomas: no se documenta el soporte multilingüe ni evaluaciones fuera del inglés y de los prompts sensibles a China.
- Licencia MIT: permite uso comercial, pero el modelo base y el proceso de ablación deben citarse adecuadamente; conviene revisar las condiciones del modelo original inclusionAI/Ling-3.1-flash-1019.
- Requisito de infraestructura: 573,8 GB de repositorio y más de 570 GB de pesos en FP8 hacen inviable el despliegue en hardware de consumo y encarecen cualquier experimento.
- Uso responsable: un modelo sin rechazos puede generar contenido dañino o desinformación; su uso en producción exige filtros externos y supervisión.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mrfakename/Ling-3.1-flash-1019-abliterated
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
