# mlasli/Qwen3.8-27B-Heretic-Uncensored-IQ4_XS-GGUF

## Resumen

El modelo `mlasli/Qwen3.8-27B-Heretic-Uncensored-IQ4_XS-GGUF` es una cuantización GGUF en formato IQ4_XS del modelo `mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16` (v2.0.0), que a su vez es una re-abliteración desde cero del modelo oficial `Qwen/Qwen3.8-27B` de Alibaba. La abliteración es una técnica que elimina el alineamiento de seguridad (refusals) del modelo original, dando como resultado una versión "uncensored" diseñada para casos de uso como roleplay, generación de texto creativo y conversación sin restricciones temáticas.

El modelo conserva la arquitectura del Qwen3.8-27B original, con aproximadamente 27 300 millones de parámetros, y mantiene el mecanismo de decodificación especulativa MTP (Multi-Token Prediction) con su cabezal de draft fijado en cuantización Q8_0, lo que permite una inferencia más rápida en `llama.cpp`. Está cuantizado con la técnica imatrix, calibrada sobre un corpus de 20 MB de wikitext-103, y se distribuye bajo licencia Apache-2.0. Es relevante ahora porque ofrece una alternativa de código abierto para quienes necesitan un modelo de 27B sin filtros de seguridad, ejecutable en hardware de consumo con las cuantizaciones adecuadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B); detalles especificos no disponibles |
| Parametros totales | 27 320 697 856 (~27,3 B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (este repo), IQ2_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un transformer autoregresivo de 27 300 millones de parametros desarrollado por Alibaba. La version aqui presentada ha sido sometida a un proceso de re-abliteracion desde cero, cuyo objetivo era reducir la tasa de rechazos del modelo original a un rango del 5-15 %. Segun la model card, se logro una tasa de rechazo medida del 14,0 % (con un contador "Heretic" del 12,0 %), una divergencia KL multi-token de 0,0071 y un sobre-rechazo benigno del 1,0 %.

La cuantizacion GGUF se ha realizado con la herramienta `imatrix`, calibrada sobre un corpus de 20 MB de wikitext-103. Una innovacion destacable es que se ha conservado el mecanismo MTP (Multi-Token Prediction) del modelo original: el cabezal de draft (bloque 64) esta presente y se ha fijado en cuantizacion Q8_0 en todas las variantes cuantizadas, lo que permite mantener la precision de la decodificacion especulativa en `llama.cpp`. No se dispone de informacion detallada sobre el entrenamiento original (tokens, dataset, tecnicas de RLHF/DPO) mas alla de lo indicado.

## Capacidades

- Generacion de texto libre, sin restricciones de contenido gracias a la abliteracion.
- Soporte de roleplay y conversacion multi-turno (etiquetado como "roleplay" y "conversational").
- Decodificacion especulativa MTP habilitada en `llama.cpp` (arquitectura `qwen35`), lo que acelera la inferencia.
- Solo texto validado; no se ha verificado soporte de vision (la model card advierte "Vision caveat: text-only validated").
- No se menciona soporte de tool calling, function calling ni capacidades de agente en la informacion disponible.
- Multilingue limitado al ingles (aunque el modelo base podria tener otras capacidades, no estan documentadas aqui).

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede generar dialogos y narrativas sin filtros tematicos, lo que lo hace adecuado para juegos de rol por texto, escritura colaborativa o simulacion de personajes.
- Asistentes conversacionales personalizados: al carecer de rechazos por contenido, puede mantener conversaciones sobre temas tabu o controvertidos sin interrumpir el flujo, util en prototipos de chatbots para investigacion.
- Generacion de contenido creativo: escritura de guiones, poesia, relatos o dialogos donde se requiere explorar temas sensibles sin restricciones impuestas por el alineamiento.
- Experimentacion con alineamiento y seguridad: investigadores pueden estudiar el comportamiento de un modelo sin capas de seguridad, comparandolo con la version original para medir diferencias en sesgos, toxicidad o utilidad.
- Fine-tuning adicional: al estar disponible en GGUF, se puede usar como punto de partida para ajuste fino con herramientas como `llama.cpp` o `Ollama`, adaptandolo a dominios especificos.
- Despliegue local en hardware modesto: con la cuantizacion IQ4_XS (15 GB) o IQ2_M (9,8 GB), puede ejecutarse en equipos de consumo con 16 GB de RAM o VRAM, ideal para entornos sin conexion o con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta metricas especificas del proceso de abliteracion:

| Metrica | Valor |
|---|---|
| Tasa de rechazo medida | 14,0 % |
| Contador Heretic | 12,0 % |
| KL multi-token | 0,0071 |
| Sobre-rechazo benigno | 1,0 % |

Estos datos no son comparables con benchmarks de capacidad general, sino que miden el grado de "descensura" del modelo.

## Requisitos de hardware

- La cuantizacion IQ4_XS de este repositorio ocupa 15,5 GB (tamano del repo), por lo que requiere al menos 16 GB de VRAM en GPU o ~20 GB de RAM en CPU para cargar el modelo completo.
- Para GPU, se recomienda una NVIDIA RTX 4090 (24 GB) o superior, o una A100/H100 si se desea margen para contexto largo.
- La variante IQ2_M (9,8 GB) puede caber en GPUs con 12 GB de VRAM, como una RTX 3060 o RTX 4070.
- Es compatible con `llama.cpp` (arquitectura `qwen35`, con MTP habilitado) y con `Ollama` mediante `ollama create` a partir del GGUF.
- Tambien se puede usar con LM Studio (segun la busqueda web, se ejecuta en 16 GB de RAM con quants de Unsloth, aunque este repo usa imatrix).
- No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoria. Sin embargo, se pueden identificar alternativas relacionadas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27,3 B | No disponible | Apache-2.0 | HuggingFace |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | 27,3 B | No disponible | Apache-2.0 | HuggingFace |
| mlasli/Qwen3.8-27B-Heretic-Uncensored-IQ4_XS-GGUF (este) | 27,3 B | No disponible | Apache-2.0 | HuggingFace |

Las diferencias principales entre estas versiones residen en el metodo de cuantizacion (imatrix vs. otros) y en el proceso de abliteracion especifico. No se dispone de benchmarks para comparar su rendimiento real.

## Limitaciones y advertencias

- La abliteracion elimina el alineamiento de seguridad: el modelo puede generar contenido danino, ilegal, violento o sexualmente explicito sin restricciones. Debe usarse con responsabilidad y conforme a las leyes locales.
- Solo se ha validado el uso en ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Solo texto: no se ha verificado el soporte de vision, aunque el modelo base podria tener capacidades multimodales.
- No se dispone de informacion sobre la longitud de contexto maxima soportada; se recomienda probar con cargas reales.
- La cuantizacion IQ4_XS introduce perdida de precision respecto al modelo BF16 original; para tareas que requieran alta fidelidad, se recomienda usar Q8_0 o el modelo en punto flotante.
- El modelo no ha sido evaluado con benchmarks estandar, por lo que su rendimiento en tareas de razonamiento, codigo o matematicas es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que la abliteracion puede violar los terminos de uso del modelo original si estos lo prohiben; se debe revisar la politica de Alibaba.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-IQ4_XS-GGUF
- Modelo BF16 original (v2.0.0): https://huggingface.co/mlasli/Qwen3.8-27B-Heretic-Uncensored-BF16
- Repositorio de `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Repositorio de `Ollama`: https://ollama.com
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Articulo sobre ejecucion local de Qwen3.8-27B: https://pasqualepillitteri.it/en/news/11335/qwen3-8-27b-run-local-16gb-lm-studio-unsloth
