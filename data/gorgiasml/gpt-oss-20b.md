# GorgiasML/gpt-oss-20b

## Resumen

`GorgiasML/gpt-oss-20b` es una reproduccion del modelo abierto `openai/gpt-oss-20b`, el modelo de pesos abiertos de menor tamano de la familia gpt-oss publicada por OpenAI. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de aproximadamente 21.000 millones de parametros totales y 3,6.000 millones de parametros activos por token, disenado para razonamiento, tareas aganticas y uso general por parte de desarrolladores.

Su relevancia actual radica en tres factores: la licencia Apache 2.0 sin restricciones de copyleft ni riesgo de patentes, la cuantizacion MXFP4 aplicada en post-entrenamiento a los pesos MoE que permite ejecutarlo con unos 16 GB de memoria, y la posibilidad de ajustar el esfuerzo de razonamiento (bajo, medio, alto) segun los requisitos de latencia. El modelo solo funciona correctamente con el formato de respuesta harmony de OpenAI, que se aplica de forma automatica mediante la plantilla de chat de Transformers.

El repositorio analizado es una resubida no oficial: registra 0 descargas y 0 likes en el momento de la consulta, y su card reproduce literalmente la del modelo original. Para produccion conviene descargar los pesos desde el repositorio oficial `openai/gpt-oss-20b` y verificar la integridad de los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 20.914.757.184 (aproximadamente 21 B) |
| Parametros activos | 3,6 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en los pesos MoE (aplicada en post-entrenamiento); etiqueta `8-bit` en el repositorio; no se detallan variantes GGUF u otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 41,3 GB |
| Formato de prompt | harmony (obligatorio para un funcionamiento correcto) |
| Niveles de esfuerzo de razonamiento | bajo, medio, alto |
| Pipeline declarado | text-generation |
| Fecha de creacion del repositorio | 2026-09-21 |

## Arquitectura y entrenamiento

La model card confirma que se trata de un modelo de mezcla de expertos con 21.000 millones de parametros totales y 3,6.000 millones activos, y que los pesos MoE fueron cuantizados en MXFP4 durante la fase de post-entrenamiento. Esta cuantizacion no es una conversion posterior a la inferencia: todas las evaluaciones oficiales se realizaron con el mismo esquema MXFP4, de modo que el rendimiento reportado corresponde a esa configuracion. El resultado es que el modelo cabe en unos 16 GB de memoria, lo que lo situa en el rango de GPU de consumo.

El modelo fue entrenado sobre el formato de respuesta harmony, que separa los canales de razonamiento y de respuesta final, y expone la cadena de pensamiento completa para facilitar la depuracion. Incluye un parametro de esfuerzo de razonamiento configurable (bajo, medio, alto) que permite intercambiar latencia por calidad de razonamiento, y es ajustable por fine-tuning completo de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso concreto de RLHF o DPO en la informacion consultada. Las innovaciones destacadas por el autor son la cuantizacion MXFP4 de los pesos MoE, el soporte nativo de function calling, navegacion web, ejecucion de codigo Python y salidas estructuradas.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento completa y depurable.
- Esfuerzo de razonamiento configurable en tres niveles (bajo, medio, alto) para ajustar latencia y precision.
- Razonamiento agantico y multi-paso, con soporte nativo de function calling y tool calling.
- Navegacion web integrada segun la documentacion del proyecto.
- Ejecucion de codigo Python en el flujo agantico.
- Salidas estructuradas (structured outputs) para integracion en pipelines.
- Ajuste fino de parametros para adaptacion a dominios concretos.
- Formato de respuesta harmony con canales diferenciados de razonamiento y respuesta final.
- Capacidades multilingues: no disponibles en la informacion consultada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo gestionando roles separados mediante el formato harmony, y su modo de razonamiento bajo reduce la latencia en respuestas rutinarias. La ventana de contexto concreta debe confirmarse en la documentacion oficial antes de dimensionar el servicio.
- Agentes con tool calling en produccion: al soportar function calling nativo y salidas estructuradas, se puede integrar en orquestadores que invocan APIs externas, bases de datos o sistemas internos, con el nivel de esfuerzo de razonamiento ajustado por tipo de tarea.
- Generacion y revision de codigo: el modelo ejecuta codigo Python y razona sobre el, lo que permite usarlo en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores, con la salida estructurada canalizada hacia el sistema de build.
- Asistentes de investigacion con navegacion web: combinando la capacidad de browsing con razonamiento multi-paso, se puede construir un asistente que consulte fuentes externas, sintetice resultados y cite evidencia.
- Despliegue local en estaciones de trabajo: al requerir unos 16 GB de memoria en MXFP4, es viable ejecutarlo en una unica GPU de consumo para tareas de desarrollo, prototipado y asistentes internos sin enviar datos a la nube.
- Extraccion de informacion estructurada: con structured outputs se pueden convertir documentos no estructurados en JSON validado contra un esquema, util en facturacion, contratos o ingesta de datos.
- Debugging de razonamiento en investigacion: al exponer la cadena de pensamiento completa, permite analizar por que el modelo llega a una conclusion y comparar el efecto del nivel de esfuerzo de razonamiento en la calidad final.
- Fine-tuning para dominios verticales: la licencia Apache 2.0 y la posibilidad de ajuste de parametros permiten adaptar el modelo a jerga sectorial (legal, sanitario, industrial) y desplegarlo comercialmente sin obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card consultada menciona que todas las evaluaciones de la familia gpt-oss se realizaron con la misma cuantizacion MXFP4, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. Los resultados completos se remiten al articulo tecnico arXiv:2508.10925, cuyo contenido numerico no forma parte de la informacion proporcionada.

## Requisitos de hardware

- Memoria en inferencia: aproximadamente 16 GB con la cuantizacion MXFP4, segun la model card oficial.
- GPU de consumo: cabe en tarjetas de 16 GB o mas, como RTX 4080, RTX 4070 Ti Super, RTX 4090 (24 GB), RTX 5080 o RTX 5090. En GPUs con menos de 16 GB requiere cuantizaciones adicionales o descarga a CPU, no documentadas en la informacion disponible.
- GPU de datacenter: compatible con NVIDIA H100, A100 y AMD MI300X. El modelo hermano de 120B esta disenado para caber en una unica GPU de 80 GB, mientras que el de 20B es la opcion de baja latencia.
- Opciones de despliegue: Transformers (`pipeline`), vLLM (requiere la build `vllm==0.10.1+gptoss`), `transformers serve` para servidor compatible con la API de OpenAI, Ollama (`ollama pull gpt-oss:20b`), LM Studio (`lms get openai/gpt-oss-20b`) y las implementaciones de referencia en PyTorch/Triton del repositorio `openai/gpt-oss`.
- Latencia y throughput: no disponibles en la informacion consultada. Dependen fuertemente del nivel de esfuerzo de razonamiento configurado y del backend de inferencia.
- Nota de compatibilidad: la plantilla de chat de Transformers aplica automaticamente el formato harmony; si se usa `model.generate` directamente hay que aplicarlo de forma manual o mediante el paquete `openai-harmony`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b (este modelo) | 20,9 B | 3,6 B | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace; requiere formato harmony |
| gpt-oss-120b | 117 B | 5,1 B | no disponible | Apache 2.0 | Pesos abiertos; disenado para una unica GPU de 80 GB |
| Llama 3.1 8B | 8 B | no aplica (denso) | no disponible en la informacion consultada | Licencia comunitaria de Meta (no Apache 2.0) | Pesos abiertos con registro |
| Mistral 7B | 7 B | no aplica (denso) | no disponible en la informacion consultada | Apache 2.0 | Pesos abiertos |

La comparativa con gpt-oss-120b procede de la propia model card. Los datos de Llama 3.1 8B y Mistral 7B son de conocimiento publico general y no se han verificado contra la busqueda web realizada en esta consulta; en cualquier caso, ninguno de los dos emplea arquitectura MoE ni expone una cadena de pensamiento configurable por niveles de esfuerzo, que son los dos diferenciadores principales de gpt-oss-20b frente a modelos densos del mismo rango de parametros.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato de respuesta harmony. Usarlo con plantillas de chat distintas produce salidas incorrectas.
- La cadena de pensamiento es accesible, pero la propia documentacion indica que no esta pensada para mostrarse a usuarios finales.
- Riesgo de alucinacion: inherente a los modelos generativos; la informacion consultada no documenta tasas de error ni mecanismos especificos de mitigacion.
- Sesgos conocidos: no documentados en la informacion disponible. No se declaran los idiomas soportados ni la composicion del corpus de entrenamiento, lo que dificulta evaluar cobertura y sesgos por idioma.
- Longitud de contexto no disponible en la ficha consultada; es un dato critico para cualquier despliegue con documentos largos y debe confirmarse antes de disenar el sistema.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion sin obligaciones de copyleft ni clausulas de patentes. Es una de las licencias mas permisivas del sector.
- El repositorio analizado es una resubida no oficial, con 0 descargas y 0 likes. No hay garantia de integridad de los pesos ni de que se correspondan exactamente con la publicacion de OpenAI.
- La fecha de creacion del repositorio (2026-09-21) resulta anomala respecto al resto de metadatos; conviene tratarla con cautela.
- El tamano del repositorio (41,3 GB) es notablemente superior a los 16 GB de memoria de inferencia, lo que sugiere que contiene pesos en mayor precision ademas de la version cuantizada; verificar antes de descargar.
- Coste de razonamiento variable: los modos de esfuerzo medio y alto incrementan la latencia de forma significativa, lo que debe tenerse en cuenta en servicios con SLA estrictos.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/GorgiasML/gpt-oss-20b
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Coleccion completa de gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Sitio oficial del modelo: https://gpt-oss.com
- Guias y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Articulo tecnico: https://arxiv.org/abs/2508.10925
- Anuncio en el blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio de codigo: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos de la comunidad: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Guia de uso con Transformers: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Guia de uso con vLLM: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- Guia de uso con Ollama: https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama
- Descarga de Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
