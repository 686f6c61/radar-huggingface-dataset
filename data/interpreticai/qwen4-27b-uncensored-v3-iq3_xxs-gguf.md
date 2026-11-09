# InterpreticAI/Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF

## Resumen

Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF es un repositorio publicado por InterpreticAI en Hugging Face que, en el momento de la consulta, no contiene pesos de modelo: es un anuncio de una futura publicacion. El autor declara su intencion de publicar una version "sin censura" (uncensored) de Qwen4-27B en cuanto Qwen libere los pesos originales, en formato GGUF con cuantizacion IQ3_XXS. Por tanto, no existe un modelo descargable ni una arquitectura propia que evaluar.

El repositorio hereda el nombre de la familia Qwen4 de Alibaba, pero no hay confirmacion de que Qwen4-27B exista ni de sus caracteristicas tecnicas. Toda la informacion sobre arquitectura, contexto, entrenamiento o capacidades del modelo base es, a dia de hoy, no disponible. La model card solo incluye una tabla de resultados de una version anterior (Qwen3.8-27B-Uncensored-v3) sobre preguntas politicas chinas, que no es aplicable a este repositorio.

Su relevancia actual es limitada: se trata de una placeholder repo con cero descargas y cero likes, creada el 9 de noviembre de 2026. Resulta util unicamente como marcador de una linea de trabajo de fine-tuning orientada a eliminar la censura politica en modelos Qwen, pero no como artefacto para produccion o investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, segun la familia Qwen; sin confirmar) |
| Parametros totales | no disponible (el nombre sugiere 27B; sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS (GGUF); el autor menciona tambien planes para BF16, FP8 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (IQ3_XXS); pesos no publicados aun |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura del modelo. El repositorio no contiene pesos ni documentacion tecnica sobre la estructura de la red, el numero de tokens de entrenamiento, la composicion del dataset o el proceso de alineamiento (RLHF, DPO u otros). El autor solo indica que planea eliminar la "censura politica" de Qwen4-27B y publicar los pesos en varios formatos, pero no describe la metodologia de fine-tuning empleada.

La unica referencia tecnica es la tabla de la version anterior (Qwen3.8-27B-Uncensored-v3), que reporta una reduccion de respuestas censuradas del 83,5 % al 2,6 % y un aumento de respuestas abiertas con sujeto correcto del 12,2 % al 80,9 % sobre el conjunto de preguntas politicas chinas de Pan y Xu (2026). No se detalla el tamano de ese conjunto, el procedimiento de evaluacion ni los hiperparametros del entrenamiento.

## Capacidades

- No disponible: el modelo no ha sido publicado, por lo que no se pueden verificar capacidades de generacion de texto, razonamiento, codigo, matematicas o vision.
- No disponible: soporte de tool calling o function calling.
- No disponible: soporte de agentes o razonamiento multi-paso.
- No disponible: capacidades multilingues.
- Segun la intencion declarada por el autor, la capacidad diferencial seria responder sin censura politica a preguntas sobre China, pero esto no es verificable en este repositorio.

## Casos de uso

- No disponible: al no existir pesos publicados, no se puede desplegar el modelo en ningun escenario real.
- Investigacion sobre censura politica en LLM: el repositorio serviria, una vez publicado, para estudiar como se comporta un modelo Qwen sin los filtros politicos originales, comparandolo con la version base.
- Evaluacion de tecnicas de "uncensoring": util para investigadores que quieran reproducir o auditar el metodo de InterpreticAI sobre la familia Qwen.
- Analisis de sesgo y seguridad: un modelo sin censura politica permite estudiar que respuestas emergen cuando se eliminan restricciones, con fines de auditoria.
- Pruebas de cuantizacion IQ3_XXS: si se publican los pesos, el formato GGUF IQ3_XXS permitiria evaluar la degradacion de calidad en modelos de ~27B con cuantizacion agresiva.
- Despliegue en hardware de consumo: la cuantizacion IQ3_XXS apunta a inferencia en GPU consumer, pero sin pesos ni benchmarks no se puede confirmar viabilidad ni rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. La unica tabla presente corresponde a la version anterior Qwen3.8-27B-Uncensored-v3 y mide censura politica, no capacidades generales:

| Metrica (Qwen3.8-27B vs Uncensored-v3) | Qwen3.8-27B | Uncensored-v3 |
|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5 % | 2,6 % |
| Reescrituras en puntos de propaganda del PCC (menor es mejor) | 32,2 % | 1,7 % |
| Sujeto correcto, respondido abiertamente (mayor es mejor) | 12,2 % | 80,9 % |

Estos datos no son extrapolables a Qwen4-27B-Uncensored-v3, que aun no existe.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Como referencia orientativa, un modelo de 27B en IQ3_XXS suele ocupar del orden de 11-13 GB de pesos, pero no hay confirmacion del tamano real ni de la arquitectura.
- GPU recomendadas: no disponible.
- Viabilidad en GPU consumer: no confirmada; la eleccion de IQ3_XXS sugiere que el autor apunta a GPUs con 12-16 GB de VRAM, pero es una inferencia, no un dato.
- Opciones de despliegue: llama.cpp, Ollama u otros runners compatibles con GGUF, una vez existan los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InterpreticAI/Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF | no disponible (~27B por el nombre) | no disponible | Apache 2.0 | No publicado (placeholder) |
| InterpreticAI/Qwen3.8-27B-Uncensored-v3 | no disponible (~27B por el nombre) | no disponible | no disponible en la informacion | Referenciado como release anterior |
| Qwen3.8-27B (base) | no disponible (~27B por el nombre) | no disponible | no disponible en la informacion | Referenciado en la tabla del autor |
| Qwen4-27B (base) | no disponible | no disponible | no disponible | No confirmado que exista |

No se dispone de datos suficientes para una comparativa tecnica rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos: descargarlo no proporciona ningun modelo funcional.
- No se puede verificar ninguna afirmacion sobre arquitectura, contexto, idiomas o rendimiento.
- El modelo base Qwen4-27B no esta confirmado; el repositorio depende de un lanzamiento futuro de terceros.
- La eliminacion de censura politica puede aumentar el riesgo de contenido sesgado, ofensivo o legalmente problematico en determinadas jurisdicciones.
- La licencia Apache 2.0 declarada aplica al repositorio, pero la licencia de los pesos derivados de Qwen4-27B podria imponer condiciones adicionales que no se detallan.
- No hay garantia de que la publicacion llegue a producirse; el autor solo indica "coming soon".
- Riesgo de alucinacion y sesgos: no evaluable sin pesos publicados.
- Uso en produccion: desaconsejado, al no existir artefacto desplegable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF
- Version BF16 planificada: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3
- Version FP8 planificada: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-FP8
- Version GGUF Q4_K_M planificada: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF
- Release anterior: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Perfil del autor: https://huggingface.co/InterpreticAI
- Sitio web del autor: https://interpretic.ai
