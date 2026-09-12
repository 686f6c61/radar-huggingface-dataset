# CompassioninMachineLearning/Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-4

## Resumen

Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-4 es un modelo de generacion de texto publicado por el usuario CompassioninMachineLearning en HuggingFace. Se trata de un ajuste por preentrenamiento continuado (continued pretraining, CPT) sobre Qwen/Qwen3-8B-Base, un transformer decoder denso de 8.190.735.360 parametros (8,19 B). No es un modelo nuevo: hereda integramente la arquitectura del modelo base y solo modifica los pesos mediante una fase adicional de entrenamiento sobre un corpus especifico.

El entrenamiento se ha realizado sobre el dataset CompassioninMachineLearning/compassion_12185_cleaned (revision 95e233baf48a7751bcec55a08347697ed6e4c4a8), con 10.000 documentos distintos mas 2.000 repeticiones por epoca, y un conjunto de validacion disjunto de 200 documentos. El artefacto publicado corresponde a la epoca 4.0, paso 1500, exportado como modelo fusionado en BF16 mediante la utilidad de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, empaquetado en ocho shards de safetensors. No requiere adaptador para cargarse.

Su relevancia es acotada y conviene ser explicito: el propio autor advierte en la model card de que el entrenamiento no establece una mejora en compasion y que ese extremo debe evaluarse por separado. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados y no publica resultados de benchmarks. Es, por tanto, un artefacto de investigacion reproducible (incluye `run_manifest.json` con hashes de seleccion de documentos, revision base y parametros) mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, heredada de Qwen/Qwen3-8B-Base (no se detalla la configuracion de capas en la model card) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos BF16 sin cuantizar (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la model card; debe consultarse la licencia del modelo base |
| Formato de pesos | safetensors (8 shards), precision BF16, modelo fusionado sin adaptador |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-8B-Base: un transformer decoder denso de 8,19 B de parametros. El proceso aplicado es continued pretraining (etiqueta `continued-pretraining` en el repositorio), es decir, una fase adicional de entrenamiento autoregresivo sobre un corpus concreto que no altera la topologia de la red, solo sus pesos. No se documentan en la informacion disponible ni el numero total de tokens procesados, ni la composicion detallada del dataset, ni si hubo fases de RLHF o DPO. Tampoco se indica si se aplicaron tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas.

Los unicos datos de entrenamiento confirmados son: dataset CompassioninMachineLearning/compassion_12185_cleaned fijado en la revision `95e233baf48a7751bcec55a08347697ed6e4c4a8`; 10.000 documentos distintos mas 2.000 exposiciones repetidas por epoca; 200 documentos de validacion disjuntos; y un punto de control publicado correspondiente a la epoca 4.0, paso 1500. La fusion se hizo con `save_pretrained_merged(save_method="merged_16bit")` de Unsloth, con pesos validados como BF16 y empaquetados sin perdida en ocho shards de safetensors. El repositorio incluye un `run_manifest.json` con la revision base, los hashes de seleccion de documentos, los parametros de entrenamiento y la validacion de la exportacion, lo que permite reproducir el pipeline. La model card advierte explicitamente de que el entrenamiento no demuestra una mejora en compasion; esa afirmacion requeriria una evaluacion independiente que no se aporta.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas heredados del modelo base, si bien los idiomas no se declaran en la model card.
- Continuacion de texto y modelado de lenguaje general, propia de un modelo preentrenado: no es un modelo instruido, por lo que responde mejor a few-shot prompting que a instrucciones directas.
- Etiqueta `conversational` en el repositorio, aunque al derivar de la variante Base y no de la variante instruct, no hay garantia de formato de dialogo ni de alineacion conversacional.
- Capacidades potenciales heredadas del modelo base (codigo, matematicas, razonamiento) sujetas a verificacion empirica, ya que el CPT puede degradarlas al especializar los pesos en el corpus de compasion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; se trata de un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre preentrenamiento continuado: el repositorio incluye `run_manifest.json` con hashes de seleccion de documentos y parametros, lo que permite replicar el experimento y comparar el efecto del CPT sobre un modelo base identico.
- Analisis de sesgo y deriva de dominio: al ser un modelo base sometido a CPT, sirve para medir como un corpus tematico concreto desplaza las distribuciones de salida respecto a Qwen3-8B-Base original.
- Generacion de texto asistida en dominios de cuidado y acompanamiento, siempre con evaluacion previa: el modelo puede usarse para redactar borradores de mensajes empaticos, pero sin asumir que el entrenamiento haya mejorado esa cualidad.
- Prototipado de completado de texto en aplicaciones internas: al publicarse en BF16 con safetensors y etiqueta `text-generation-inference`, se integra directamente en pipelines de transformers sin necesidad de fusionar adaptadores.
- Evaluacion comparativa de tecnicas de fusion de pesos: el uso de `save_pretrained_merged` de Unsloth con validacion BF16 lo convierte en un caso de referencia para verificar que la fusion de pesos no introduce perdida de precision.
- Base para un posterior ajuste supervisado o DPO: cualquier equipo que quiera construir un asistente conversacional especializado puede partir de estos pesos y aplicar despues SFT sobre datos instruidos.
- Generacion de datos sinteticos de dominio: el modelo puede muestrear texto tematicamente proximo al corpus de compasion para aumentar datasets de entrenamiento, filtrando posteriormente por calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y advierte de forma explicita que no se ha establecido empiricamente una mejora en compasion derivada del entrenamiento. Cualquier cifra que se citase al respecto seria una invencion.

## Requisitos de hardware

Las siguientes cifras son estimaciones aritmeticas a partir del numero de parametros confirmado (8,19 B) y del tamano del repositorio (16,4 GB), no datos publicados por el autor.

- VRAM en BF16: aproximadamente 16,4 GB solo para los pesos, mas la cache KV (del orden de 2 a 8 GB adicionales segun contexto y lote). En la practica, entre 20 y 28 GB para inferencia comoda.
- VRAM en FP8 o INT8: aproximadamente 8 a 9 GB de pesos, alrededor de 12 a 16 GB en total.
- VRAM en cuantizaciones de 4 bits: aproximadamente 4,5 a 5,5 GB de pesos, aunque el repositorio no publica ninguna cuantizacion de este tipo.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para BF16 sin restricciones. Una RTX 4090 (24 GB) es suficiente en BF16 con contexto moderado, y una RTX 3090 (24 GB) queda muy justa.
- GPU de consumo: si cabe en una RTX 4090 o 3090 en BF16 con contexto recortado; en tarjetas de 16 GB o menos seria necesario cuantizar, algo que requeriria convertir los pesos por cuenta propia.
- Despliegue: transformers de forma nativa, TGI (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM al tratarse de safetensors de la familia Qwen3. llama.cpp u Ollama requeririan una conversion a GGUF no publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-4 | 8.190.735.360 | No disponible | Sin benchmarks publicados | No disponible | 0 descargas, 0 likes; safetensors BF16 |
| Qwen/Qwen3-8B-Base | 8.190.735.360 (el CPT no altera el recuento de parametros) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Consultar en el repositorio del modelo base | Modelo base de referencia |
| Qwen/Qwen3-8B (variante instruida) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Consultar en el repositorio del modelo base | No disponible en la informacion proporcionada |
| Otros modelos de ~8 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente en la documentacion proporcionada para establecer una comparativa cuantitativa con alternativas. La unica diferencia verificable frente al modelo base es la fase de continued pretraining sobre el corpus de compasion.

## Limitaciones y advertencias

- La model card afirma literalmente que el entrenamiento no establece una mejora en compasion y que ese extremo debe evaluarse por separado. No debe presentarse el modelo como "mas empatico" sin evidencia.
- Es un CPT sobre Qwen/Qwen3-8B-Base, no sobre la variante instruida, por lo que carece de alineacion conversacional y puede no seguir instrucciones de forma fiable.
- Riesgo de alucinacion propio de un modelo base sin ajuste por preferencias humanas ni filtros de seguridad adicionales.
- No se declara licencia en la model card, lo que impide confirmar si el uso comercial esta permitido. Debe verificarse la licencia de Qwen/Qwen3-8B-Base antes de cualquier despliegue.
- No se declaran los idiomas soportados; el comportamiento multilingue es incierto.
- No se especifica la longitud de contexto soportada ni si se aplicaron tecnicas de extension de contexto durante el CPT.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversion.
- El modelo no tiene traccion verificable: 0 descargas y 0 likes, sin validacion independiente por parte de terceros.
- Sesgos conocidos: no documentados en la informacion disponible; el corpus de compasion puede introducir sesgos de dominio no caracterizados.
- Sin benchmarks publicados, no hay forma de cuantificar la degradacion o mejora en tareas generales (codigo, matematicas, razonamiento) respecto al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CompassioninMachineLearning/Qwen3-8b-compassion-cleaned-10k-20260910-CPT-merged-epoch-4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a paginas de soporte tecnico de Microsoft (contacto, inicio de sesion en Hotmail, ISO de Windows 8.1, deprecacion de EWS en Exchange Online y retirada de la utilidad SaRA), sin ninguna relacion con este modelo, su arquitectura o su entrenamiento.
