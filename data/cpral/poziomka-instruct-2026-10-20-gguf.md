# cpral/Poziomka-Instruct-2026-10-20-GGUF

## Resumen

Poziomka-Instruct-2026-10-20-GGUF es la distribucion en formato GGUF del modelo instructivo Poziomka-Instruct-2026-10-20, publicado por el usuario cpral en Hugging Face. Se trata de un modelo conversacional especializado en polaco, con aproximadamente 4.120 millones de parametros totales (segun los safetensors del modelo base) y una arquitectura de mezcla de expertos (MoE) que, segun la model card, limita el grafo a 32 expertos activos. El repositorio GGUF incluye cinco cuantizaciones que van desde BF16 (8,2 GB) hasta Q4_K_M (2,7 GB).

El modelo resuelve el problema de desplegar un asistente conversacional en polaco en hardware de consumo mediante llama.cpp y LM Studio, sin necesidad de infraestructura de servidor. Su relevancia actual radica en que es uno de los pocos modelos abiertos centrados exclusivamente en polaco con cuantizaciones listas para usar y compatibilidad con endpoints estandar.

La model card indica que el modelo solo admite el modo de respuesta rapida: la plantilla de chat desactiva siempre el modo de razonamiento (`<think></think>`). No se han publicado datos sobre el proceso de entrenamiento, el dataset ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun la referencia a "limite de grafo a 32 expertos activos" en la model card; detalles de la arquitectura no disponibles |
| Parametros totales | 4.119.803.395 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | polaco (pl) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible solo confirma que el modelo base es un transformer de mezcla de expertos con 4.119.803.395 parametros totales y que la conversion a GGUF aplica un limite de grafo a 32 expertos activos, ademas de correcciones especificas de tokenizer y plantilla de chat documentadas en el repositorio de GitHub del autor de la conversion (adamo1139/poziomka-gguf). No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

La plantilla de chat incluida en los ficheros GGUF desactiva de forma explicita el modo de razonamiento (`<think></think>`), de modo que el modelo genera respuestas directas sin cadena de pensamiento visible. Los samplers recomendados por el autor son temperature 0.6, top_p 0.9, min_p 0.05 y frequency_penalty 0.15.

## Capacidades

- Generacion de texto conversacional en polaco, orientada a respuestas directas sin modo de razonamiento.
- Instrucciones y dialogos multi-turno mediante plantilla de chat integrada en los ficheros GGUF.
- Compatibilidad con endpoints estandar (`endpoints_compatible` en los tags del repositorio).
- Ejecucion en LM Studio y en llama.cpp precompilado oficial (version b12020 o posterior, o compilaciones de marzo de 2026 en adelante).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modo de pensamiento esta desactivado por diseno).
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas al polaco segun el campo `language` de la model card.

## Casos de uso

- Asistencia conversacional en polaco en local: el modelo puede desplegarse con la cuantizacion Q4_K_M (2,7 GB) en un portatil con GPU de consumo para responder consultas en polaco sin conexion a servicios externos.
- Prototipado rapido de chatbots en polaco: con LM Studio y el fichero Q5_K_M (3,1 GB) se puede montar un endpoint conversacional en minutos, gracias a la compatibilidad con endpoints estandar.
- Generacion de texto y redaccion asistida en polaco: el modelo produce respuestas directas con los samplers recomendados, adecuado para borradores de correos, resumenes o parafrasis en ese idioma.
- Integracion en aplicaciones de escritorio: al funcionar en llama.cpp oficial sin flags adicionales, puede embeberse en herramientas nativas para Windows, Linux o macOS que necesiten un asistente en polaco.
- Evaluacion de modelos MoE pequeños en investigacion: con 4.120 millones de parametros totales y cuantizaciones desde BF16 hasta Q4_K_M, sirve para estudiar el comportamiento de un MoE de este tamaño en tareas conversacionales en polaco.
- Despliegue en entornos con recursos limitados: la version Q4_K_M (2,7 GB) permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU, cubriendo casos de uso de baja latencia no critica.
- Traduccion asistida polaco a otros idiomas: no recomendado como caso principal, ya que la model card solo declara soporte de polaco; su uso requeriria validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB (Q4_K_M), 3,1 GB (Q5_K_M), 3,7 GB (Q6_K), 4,4 GB (Q8_0) y 8,2 GB (BF16), sin contar el overhead de contexto y del runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamaño de pesos, cualquier GPU con al menos 4-6 GB de VRAM libre puede ejecutar las cuantizaciones Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM o mas para las cuantizaciones bajas y medias; la BF16 requiere al menos 10-12 GB para operar con comodidad.
- Opciones de despliegue: llama.cpp (version b12020 o posterior, o compilaciones de marzo de 2026 en adelante) y LM Studio; otras herramientas compatibles con GGUF no estan confirmadas en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se han publicado datos de rendimiento que permitan una comparacion rigurosa.

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Poziomka-Instruct-2026-10-20-GGUF | 4.119.803.395 | no disponible | openmdw-1.1 | GGUF en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de polaco; su comportamiento en castellano u otros idiomas no esta garantizado.
- Modo de razonamiento desactivado: la plantilla de chat fuerza `<think></think>`, por lo que no es adecuado para tareas que requieran cadena de pensamiento explicita.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como modelo conversacional pequeño, puede generar afirmaciones incorrectas con fluidez.
- Sesgos conocidos: no disponibles; no hay documentacion sobre el dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Compatibilidad estricta: requiere llama.cpp de marzo de 2026 o posterior; versiones anteriores no cargaran el modelo.
- Licencia openmdw-1.1: es necesario revisar los terminos completos de esta licencia antes de un uso comercial, ya que no se detallan en la model card.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Parametros activos del MoE no disponibles: no se puede estimar con precision el coste computacional real por token.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/cpral/Poziomka-Instruct-2026-10-20-GGUF
- Modelo base: https://huggingface.co/cpral/Poziomka-Instruct-2026-10-20
- Codigo de conversion y correcciones aplicadas: https://github.com/adamo1139/poziomka-gguf
