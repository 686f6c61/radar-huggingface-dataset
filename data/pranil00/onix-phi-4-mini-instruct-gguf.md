# pranil00/ONIX-Phi-4-mini-instruct-GGUF

## Resumen

ONIX-Phi-4-mini-instruct-GGUF es una cuantización en formato GGUF (concretamente Q5_K_M) del modelo microsoft/Phi-4-mini-instruct, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos del modelo original de Microsoft a un formato optimizado para inferencia en CPU y GPU de consumo mediante llama.cpp y Ollama. El modelo base Phi-4-mini-instruct es un transformer denso de aproximadamente 3.800 millones de parámetros (3.836.021.856 según los safetensors originales) orientado a instrucciones y conversación.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de la familia Phi-4 en hardware modesto gracias a la cuantización de 5 bits, con un peso final de 2,62 GB. El repositorio tiene un tamaño total de 2,8 GB. La licencia declarada es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial sin restricciones adicionales significativas.

Conviene señalar que el repositorio presenta cero descargas y cero "likes" en el momento de la consulta, y que la información disponible sobre el proceso de cuantización, idiomas soportados y rendimiento es muy limitada. La model card del autor es escueta y se centra en instrucciones de uso con Ollama y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Phi-4-mini-instruct de Microsoft) |
| Parametros totales | 3.836.021.856 (aprox. 3,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (unica variante publicada en este repo) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado Q5_K_M, 2,62 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base microsoft/Phi-4-mini-instruct, un transformer denso de aproximadamente 3,8 mil millones de parametros. Esta publicacion no entrena ni afina el modelo: se limita a convertir los pesos originales a formato GGUF mediante llama.cpp, segun indica el autor ("Verified authentic tensor conversion via llama.cpp"). El proceso de cuantizacion Q5_K_M reduce la precision de los pesos a 5 bits con un esquema K-quants, que preserva mejor la calidad que las cuantizaciones uniformes simples al tratar de forma diferenciada determinadas matrices.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales introducidas en esta conversion. La cuantizacion se realizo, segun el autor, en Apple Silicon con Metal, lo que sugiere el uso de la toolchain de llama.cpp compilada para ese entorno.

## Capacidades

- Generacion de texto conversacional: el modelo base esta orientado a instrucciones ("instruct"), por lo que responde a prompts en formato de chat.
- Razonamiento y matematicas: el modelo base Phi-4-mini-instruct esta disenado para tareas de razonamiento de nivel medio, aunque no se aportan datos especificos en esta publicacion.
- Generacion de codigo: capacidad heredada del modelo base; no se documenta su rendimiento en esta ficha.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que el formato GGUF puede servirse mediante endpoints compatibles con la API de Hugging Face.
- Ejecucion local: soporte nativo en Ollama y llama.cpp, lo que permite inferencia en CPU y GPU de consumo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Modo thinking, vision o audio: no documentado en la informacion proporcionada.

## Casos de uso

- Prototipado local en portatiles: gracias a su peso de 2,62 GB en Q5_K_M, el modelo puede cargarse en un portatil con 8 GB de RAM y ejecutarse por CPU mediante llama.cpp u Ollama, lo que permite experimentar con un modelo de ~3,8B sin GPU dedicada.
- Asistentes conversacionales de escritorio: integrable en aplicaciones de chat locales (por ejemplo, mediante la API de Ollama) para tareas de respuesta a preguntas y redaccion asistida sin depender de la nube.
- Generacion de texto en entornos con conectividad limitada: al ejecutarse completamente en local, es adecuado para escenarios de campo o sistemas aislados donde no se puede llamar a una API externa.
- Educacion e investigacion: util como modelo de referencia para estudiar el efecto de la cuantizacion Q5_K_M frente a los pesos originales en tareas de generacion, dado que el modelo base es publico y de tamano manejable.
- Automatizacion de tareas de texto por lotes: procesamiento de resumenes, clasificacion o reformulacion de documentos en pipelines locales donde el coste por token de una API seria prohibitivo.
- Base para fine-tuning ligero o experimentacion: al estar bajo Apache 2.0 y en formato GGUF, sirve como punto de partida para pruebas de despliegue, aunque para reentrenamiento convendria partir de los safetensors originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q5_K_M ocupa 2,62 GB; se recomienda al menos 4-6 GB de memoria libre para cargar el modelo, el contexto y los buffers de inferencia.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo con offload completo; tambien funciona en Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas con 6 GB o mas, y en iGPU/CPU con suficiente RAM del sistema.
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-Phi-4-mini-instruct-GGUF`), llama.cpp (`llama-cli -m Phi-4-mini-instruct-Q5_K_M.gguf`), y potencialmente otros runners compatibles con GGUF (llama-cpp-python, LM Studio, etc.).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-Phi-4-mini-instruct-GGUF (esta ficha) | ~3,8B | No disponible | Apache 2.0 | GGUF Q5_K_M | Cuantizacion comunitaria, 0 descargas |
| microsoft/Phi-4-mini-instruct | ~3,8B | No disponible en esta ficha | MIT (modelo base de Microsoft) | Safetensors | Modelo original, referencia de calidad |
| Otras cuantizaciones GGUF de Phi-4-mini | ~3,8B | No disponible | Apache 2.0 / MIT segun autor | GGUF | Multiples variantes comunitarias (Q4, Q5, Q8) |

La comparativa con alternativas de otros fabricantes (por ejemplo, Llama 3.2 3B o Qwen2.5 3B) no se puede completar con datos verificados en la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: Q5_K_M introduce una degradacion moderada respecto a los pesos originales en safetensors; para tareas sensibles a la precision conviene validar contra el modelo base.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria sobre la integridad o calidad de la conversion.
- Informacion incompleta: la model card no documenta contexto, idiomas, benchmarks ni proceso detallado de cuantizacion, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se aportan evaluaciones especificas.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base de Microsoft.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de Microsoft, ya que el autor de esta conversion la declara sin aportar mas detalle.
- Naturaleza no oficial: se trata de una publicacion de un tercero ("ONIX Community"), no de Microsoft; no hay garantia de soporte ni mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Phi-4-mini-instruct-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
