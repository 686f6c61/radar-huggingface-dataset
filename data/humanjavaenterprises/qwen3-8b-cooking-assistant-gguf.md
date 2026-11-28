# HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF

## Resumen

Qwen3-8B-Cooking-Assistant-GGUF es la distribucion cuantizada en formato GGUF del fine-tune Qwen3-8B-Cooking-Assistant, desarrollado por Humanjava Enterprises sobre el modelo base Qwen3-8B de Alibaba Cloud. Se trata de un asistente culinario especializado en leer recetas proporcionadas por el usuario y responder preguntas sobre ingredientes, tecnicas y seguridad alimentaria, con un enfasis explicito en la abstención: cuando no dispone de la receta, declina inventar detalles en lugar de alucinar. El modelo se distribuye en varias cuantizaciones (Q4_K_M, Q6_K, Q8_0, BF16) para llama.cpp, Ollama y LM Studio, y los pesos completos en safetensors estan disponibles en un repositorio hermano.

La propuesta de valor es la calibracion de la confianza en un dominio donde la invencion de cantidades, tiempos o temperaturas puede tener consecuencias practicas. Segun la model card, el fine-tune reduce la invencion de detalles al 2,7 % frente al 25,8 % del Qwen3-8B base en preguntas que requieren una receta no mostrada, y acierta el 94,8 % frente al 83,1 % cuando la receta si se proporciona, medido con cuatro jueces abiertos y exigiendo acuerdo de tres de cuatro. El modelo tiene 8.190.735.360 parametros, se entrenó en 26 idiomas y se evaluó en 21, y la cuantizacion Q4_K_M funciona en una GPU de 6 GB.

Es relevante para desarrolladores que construyen asistentes de cocina o aplicaciones de recetas con requisitos de trazabilidad y abstención, y que necesitan desplegar en hardware de consumo. La licencia Apache 2.0 permite uso comercial. No es un modelo oficial del equipo Qwen: la model card lo declara explicitamente como fine-tune no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tune con DPO sobre Qwen3-8B |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens en los ejemplos de despliegue (llama-server -c 8192); contexto nativo de Qwen3-8B no especificado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (5,0 GB), Q6_K (6,7 GB), Q8_0 (8,7 GB), BF16 (16,4 GB); imatrix de 11 MB para Q4_K_M y Q6_K |
| Idiomas soportados | Entrenado en 26 idiomas, evaluado en 21: en, es, pt, it, fr, nl, de, ru, bn, id, fa, ja, pl, sv, vi, tl, he, ml, tr, zh, ms, th, fi, ar, ta, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); safetensors en el repo base para Transformers y vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parametros. Sobre esa base se aplicó un fine-tune con DPO (Direct Preference Optimization), segun indican las etiquetas del repositorio. La model card no detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset; unicamente indica que el entrenamiento cubre 26 idiomas y que el conjunto de evaluacion, publicado como `HumanjavaEnterprises/cooking-assistant-eval`, cubre 21. La informacion sobre datos de entrenamiento fue retirada de la model card en una correccion del 2026-11-14.

La innovacion tecnica destacable no esta en la arquitectura sino en el comportamiento: el modelo esta entrenado para no memorizar recetas y para pedir la receta en lugar de inventar detalles cuando no la tiene. Las cuantizaciones Q4_K_M y Q6_K se construyeron con una importance matrix calculada sobre conversaciones de entrenamiento en formato chat, estratificadas por tipo de pregunta y por si se mostraba receta o no, sin incluir ninguna muestra del conjunto de evaluacion. El prompt de sistema recomendado es explicito sobre la abstención ("When you are not sure, you say so") y el template de chat es el de Qwen3 con el modo thinking desactivado.

## Capacidades

- Generacion de texto conversacional especializada en cocina: platos, ingredientes, tecnicas y seguridad alimentaria.
- Lectura de recetas proporcionadas en el turno de usuario y respuesta basada en ese texto, sin memorizacion.
- Abstención calibrada: declina responder o pide la receta cuando la pregunta requiere datos que no se le han dado.
- Capacidades multilingues: entrenamiento en 26 idiomas y evaluacion en 21, incluidos espanol, portugues, italiano, frances, aleman, ruso, arabe, hindi, chino, japones y tailandes.
- Conversacion multi-turno mediante el template de chat de Qwen3.
- Modo thinking de Qwen3 disponible pero desactivado por defecto en el uso recomendado; se puede desactivar por peticion con `enable_thinking: false`, `"think": false`, `"reasoning_effort": "none"` o `/no_think`.
- Compatibilidad con endpoints y despliegue via llama.cpp, Ollama y LM Studio.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de cocina en aplicaciones de recetas: el usuario pega una receta y formula preguntas sobre sustituciones de ingredientes, tiempos o temperaturas; el modelo responde a partir del texto proporcionado y pide la receta cuando falta, lo que reduce respuestas inventadas en un dominio con riesgo practico.
- Atencion al cliente de marcas de alimentacion: gestion de consultas sobre conservacion, alérgenos y seguridad alimentaria con abstención explicita ante casos que requieren criterio profesional, lo que facilita derivar a un humano en lugar de dar una respuesta erronea.
- Despliegue en hardware de consumo: con Q4_K_M en una GPU de 6 GB o Q6_K en 8 GB, es viable ejecutar el asistente en un portatil o estacion de trabajo modesto mediante Ollama o LM Studio, sin infraestructura de servidor dedicada.
- Aplicaciones offline o de privacidad: al ejecutarse en local con llama.cpp, las recetas y conversaciones del usuario no salen del dispositivo, adecuado para entornos domesticos o educativos.
- Generacion de contenido culinario asistida: redaccion de fichas de recetas, notas de tecnica y explicaciones de procesos a partir de material fuente aportado por el redactor, con menor riesgo de datos inventados.
- Educacion y formacion culinaria: respuesta a dudas de estudiantes sobre tecnicas y seguridad alimentaria, con la posibilidad de aportar la receta o el temario como contexto y obtener respuestas ancladas a ese material.
- Evaluacion de sistemas de abstención: el conjunto `cooking-assistant-eval` y la metrica de invencion (2,7 % frente a 25,8 %) lo convierten en un banco de pruebas para investigar calibracion y provenance en modelos pequenos.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a evaluacion con cuatro jueces abiertos, exigiendo acuerdo de tres de cuatro:

| Metrica | Qwen3-8B-Cooking-Assistant | Qwen3-8B base |
|---|---|---|
| Invencion de detalles sin receta mostrada | 2,7 % | 25,8 % |
| Respuesta correcta con receta mostrada | 94,8 % | 83,1 % |
| Respuestas generales de cocina | a la par del base | referencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card tambien indica que Q6_K iguala la precision completa en todas las comprobaciones y que Q4_K_M queda dentro del ruido respecto a la precision completa.

## Requisitos de hardware

- VRAM para Q4_K_M: 5,84 GiB en llama-server y 5,96 GiB en Ollama con contexto de 8k y cache KV por defecto; en una tarjeta de 6 GB que ademas alimenta pantalla, reducir a 4.096 tokens de contexto (unos 5,3 GiB), usar cache q8_0 (5,3 GiB a 8k) o dejar que Ollama coloque algunas capas en CPU.
- VRAM para Q6_K: 6,7 GB de pesos, pensado para tarjetas de 8 GB.
- VRAM para Q8_0: 8,7 GB, casi sin perdida.
- VRAM para BF16: 16,4 GB, para cuantizacion propia.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB para Q4_K_M y Q6_K (por ejemplo, RTX 3060, RTX 4060, RTX 3070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en tarjetas de 6 GB o mas con las cuantizaciones indicadas.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...:Q6_K --jinja -c 8192`), Ollama (`ollama run vveerrgg/qwen3-8b-cooking-assistant:q6_k`), LM Studio, y Transformers o vLLM con los safetensors del repo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-Cooking-Assistant (este) | 8,19 B | 8.192 en ejemplos de despliegue | Asistente culinario con abstención, DPO | Apache 2.0 | GGUF y safetensors en HF |
| GLM-4-9B-Cooking-Assistant | 9 B (aprox.) | no disponible | Mismo recetario aplicado a GLM-4-9B-0414 | no disponible en la informacion | GGUF y Ollama (`vveerrgg/glm-4-9b-cooking-assistant`) |
| EuroLLM-9B-Cooking-Assistant | 9 B (aprox.) | no disponible | Mismo recetario aplicado a EuroLLM-9B | no disponible en la informacion | GGUF y Ollama (`vveerrgg/eurollm-9b-cooking-assistant`) |
| Olmo-3-7B-Cooking-Assistant | 7 B (aprox.) | no disponible | Mismo recetario aplicado a Olmo-3-7B | no disponible en la informacion | GGUF y Ollama (`vveerrgg/olmo-3-7b-cooking-assistant`) |

La model card indica que cada variante de la familia reporta su propio panel de jueces, por lo que las cifras no son directamente comparables entre si sin consultar cada ficha. El fine-tune hermano sobre GLM-4-9B incluye una comparacion de ambos en un mismo panel de jueces.

## Limitaciones y advertencias

- No es un modelo oficial de Alibaba Cloud ni del equipo Qwen; es un fine-tune no oficial de Humanjava Enterprises, sin aval del autor original.
- El modelo no memoriza recetas: si la aplicacion no le proporciona la receta, pedira que se la den o se abstendra; no debe usarse como base de conocimiento culinario autonomo.
- Riesgo de alucinacion residual: la model card reporta un 2,7 % de invencion de detalles incluso en el escenario sin receta, medido con acuerdo de tres de cuatro jueces; no es cero.
- La evaluacion se realizo con jueces automaticos abiertos, no con evaluacion humana exhaustiva ni con benchmarks estandar; los numeros deben interpretarse en ese marco.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base Qwen3-8B, arrastra los sesgos de sus datos de preentrenamiento.
- Diferencias entre versiones de Ollama: algunas versiones (observada la 0.40.16) usan el template del GGUF y activan el modo thinking, lo que antepone un parrafo de razonamiento a la respuesta; es necesario desactivarlo por peticion o usar las etiquetas actualizadas el 2026-11-19.
- Los archivos GGUF se reemitieron el 2026-11-14 para eliminar rutas de compilacion internas de los metadatos; los pesos son identicos bit a bit pero los checksums cambiaron, por lo que hay que volver a descargar.
- La correccion del 2026-11-19 sobre el consumo de memoria de Q4_K_M implica que en tarjetas de 6 GB con pantalla hay que ajustar contexto o cache KV.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribucion y las condiciones del modelo base Qwen3-8B.
- El contexto de 8.192 tokens usado en los ejemplos puede ser insuficiente para recetarios largos o conversaciones extensas; no se especifica el contexto nativo maximo en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF
- Repositorio base en safetensors: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Dataset de evaluacion: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- Variante GLM-4-9B (safetensors): https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant
- Variante GLM-4-9B (GGUF): https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF
- Variante EuroLLM-9B (GGUF): https://huggingface.co/HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant-GGUF
- Variante Olmo-3-7B (GGUF): https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant-GGUF
- Ollama, Qwen3-8B Cooking Assistant: `vveerrgg/qwen3-8b-cooking-assistant`
- Ollama, GLM-4-9B Cooking Assistant: `vveerrgg/glm-4-9b-cooking-assistant`
- Ollama, EuroLLM-9B Cooking Assistant: `vveerrgg/eurollm-9b-cooking-assistant`
- Ollama, Olmo-3-7B Cooking Assistant: `vveerrgg/olmo-3-7b-cooking-assistant`
