# mradermacher/Nexus-9B-CodeCore-Merge-GGUF

## Resumen

Nexus-9B-CodeCore-Merge-GGUF es la version cuantizada en formato GGUF del modelo prithivMLmods/Nexus-9B-CodeCore-Merge, publicada por el usuario mradermacher, conocido en HuggingFace por producir cuantizaciones GGUF de terceros para su uso con llama.cpp y derivados. El modelo original es un merge (fusion de pesos) orientado a generacion de codigo, razonamiento con cadena de pensamiento (chain-of-thought), uso de herramientas y function calling, segun las etiquetas declaradas en la model card.

La relevancia de esta publicacion es practica: convierte un modelo de la familia Qwen (la etiqueta `qwen3_5` aparece en los tags) en artefactos listos para inferencia local en CPU y GPU de consumo mediante llama.cpp, Ollama o TGI. El repo incluye cuantizaciones estaticas en multiples niveles de compresion, desde x-f16 hasta Q2_K, ademas de un suplemento multimodal mmproj en Q8_0.

Se trata de una publicacion con cero descargas y cero likes en el momento de la consulta, creada y actualizada el 21 de septiembre de 2026, con licencia Apache 2.0 y soporte declarado unicamente para ingles. Existe una discrepancia relevante entre la denominacion comercial (9B) y el recuento real de parametros registrado en el repositorio, que se detalla en la seccion de especificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; los tags incluyen `qwen3_5` y `merge`, lo que apunta a un transformer denso de la familia Qwen fusionado con OmnimergeKit |
| Parametros totales | 9B segun nombre y etiquetas; el recuento real de safetensors del repo indica 456.010.480 parametros (discrepancia no resuelta) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; adicionalmente mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base publica pesos en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Las etiquetas del repositorio (`omnimergekit`, `merge`) indican que prithivMLmods/Nexus-9B-CodeCore-Merge se genero mediante fusion de pesos de modelos preexistentes con la herramienta OmnimergeKit, una tecnica habitual para combinar capacidades de distintos checkpoints sin reentrenamiento completo. La etiqueta `qwen3_5` sugiere que la base pertenece a la familia Qwen, y `sft` apunta a que al menos uno de los componentes fusionados fue ajustado de forma supervisada.

En cuanto a datos de entrenamiento, numero de tokens, composicion del dataset y uso de RLHF o DPO, la model card no aporta ningun dato. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento explicitos, mas alla de las etiquetas `reasoning` y `chain-of-thought`, que indican que el modelo esta orientado a producir trazas de razonamiento. Esta publicacion concreta, al ser una cuantizacion estatica, no altera la arquitectura ni reentrena el modelo: unicamente reduce la precision de los pesos.

## Capacidades

- Generacion de texto general en ingles.
- Generacion y asistencia en codigo, segun las etiquetas `coder` y `CodeCore` en el nombre del modelo.
- Razonamiento con cadena de pensamiento explicita (`reasoning`, `chain-of-thought`).
- Soporte declarado de tool calling y function calling (`tool-use`, `function-calling`).
- Orientacion a flujos de agente y razonamiento multi-paso (`agent`).
- Capacidad multimodal, inferida de la presencia de un fichero suplementario `mmproj-Q8_0.gguf` (0,7 GB) en el repositorio, aunque la model card no describe que modalidades cubre.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.

## Casos de uso

- Asistente de codigo en local: el modelo puede ejecutarse con llama.cpp u Ollama en un equipo de desarrollo y ofrecer autocompletado, explicacion de fragmentos y generacion de funciones sin enviar codigo propietario a servicios externos, gracias a su licencia Apache 2.0 y a las cuantizaciones de bajo peso.
- Revision de pull requests automatizada: integrado en un pipeline de CI/CD con la variante Q4_K_M, puede resumir diffs, detectar patrones problematicos y generar comentarios de revision, apoyandose en su orientacion a codigo y su soporte de salida estructurada.
- Agente de linea de comandos con herramientas: las etiquetas `agent`, `tool-use` y `function-calling` indican que puede orquestar llamadas a funciones definidas por el usuario, por ejemplo para consultar APIs internas, ejecutar scripts o consultar bases de datos en tareas de varios pasos.
- Generacion de tests unitarios: el modelo puede producir casos de prueba a partir de firmas de funciones o de documentacion, y encajarlo en un flujo automatizado que ejecute la suite y devuelva el resultado al modelo para iterar.
- Tutorizacion tecnica y explicacion paso a paso: su modo de razonamiento con cadena de pensamiento resulta util para desglosar problemas de algoritmia, matematicas aplicadas o depuracion, mostrando el razonamiento intermedio antes de la respuesta final.
- Despliegue en entornos sin GPU dedicada: las cuantizaciones Q3_K_S, Q3_K_M y Q2_K permiten ejecucion en CPU con memoria limitada, util para prototipos, demos internas o entornos de investigacion con hardware restringido.
- Extraccion de informacion estructurada: con function calling puede convertir texto libre en JSON con un esquema predefinido, por ejemplo para procesar tickets de soporte o registros de incidencias.
- Transcripcion de diagramas o capturas a codigo: si la capacidad multimodal del fichero mmproj se confirma, podria emplearse para convertir capturas de interfaces o diagramas en esqueletos de codigo, aunque esto no esta documentado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la model card del repositorio cuantizado ni la informacion de HuggingFace proporcionada incluyen cifras de MMLU, HumanEval, GSM8K, MBPP o cualquier otra metrica. Tampoco se aportan comparaciones con el modelo base sin cuantizar ni estimaciones de perplejidad para los distintos niveles de cuantizacion.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano nominal de 9B parametros y del tamano de los ficheros de cuantizacion habituales para ese rango; no proceden de mediciones publicadas en la informacion disponible y deben verificarse experimentalmente.

- VRAM estimada para inferencia: aproximadamente 18-19 GB en x-f16, 9-10 GB en Q8_0, 7-8 GB en Q6_K, 6-7 GB en Q5_K_M, 5-6 GB en Q4_K_M, 4-5 GB en Q3_K_M, 3-4 GB en Q2_K. Sumar en torno a 1-2 GB adicionales para la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: A100 40 GB o H100 para servir el modelo sin cuantizar con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para las cuantizaciones de 8 bits y menores; RTX 4060 Ti 16 GB, RTX 4080 o RTX 4070 Ti Super para Q4_K_M y Q5_K_M.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo a partir de 8 GB de VRAM usando cuantizaciones Q4_K_M o inferiores; en 6 GB o menos conviene recurrir a Q3_K_M, Q3_K_S o Q2_K, con la perdida de calidad asociada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el repositorio tambien declara compatibilidad con text-generation-inference y endpoints compatibles, aunque TGI trabaja de forma nativa con safetensors, por lo que para ese caso es preferible el modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion para ninguna de las cuantizaciones.
- Advertencia: mradermacher indica en la model card que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, por lo que las versiones IQ listadas pueden no estar presentes en el repositorio.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas de rendimiento. La tabla siguiente contrasta caracteristicas estructurales; los datos de los modelos alternativos proceden de conocimiento publico general y no de la busqueda realizada, por lo que deben verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| Nexus-9B-CodeCore-Merge (este modelo) | 9B nominal, 456 M segun safetensors del repo | no disponible | Apache 2.0 | Si, publicado por mradermacher |
| Qwen3-8B | 8,2B | 32.768 tokens, extensible a 131.072 | Apache 2.0 | Si, ampliamente disponible |
| Llama 3.1 8B Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | Si, ampliamente disponible |
| Gemma 2 9B | 8,2B | 8.192 tokens | Gemma Terms of Use | Si, ampliamente disponible |

Ninguno de los modelos alternativos citados comparte el pipeline exacto de entrenamiento ni la fusion de pesos de este modelo, por lo que la comparacion es orientativa en cuanto a tamano, contexto y licencia, no en cuanto a calidad.

## Limitaciones y advertencias

- Discrepancia de parametros: la denominacion "9B" no concuerda con el recuento de safetensors del repositorio (456.010.480 parametros). Conviene verificar el modelo base antes de planificar recursos de despliegue, ya que el consumo real puede diferir del esperado.
- Sin benchmarks: no existe ninguna medicion publicada que respalde las capacidades declaradas en las etiquetas (`coder`, `reasoning`, `agent`).
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Documentacion minima: la model card es una plantilla generica de cuantizacion y no describe el dataset de entrenamiento, el proceso de fusion ni los hiperparametros.
- Limitacion idiomatica: el modelo declara unicamente ingles. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: al ser un modelo fusionado sin evaluacion publicada, no hay garantias sobre la fiabilidad factual, especialmente en modo de razonamiento con cadena de pensamiento.
- Perdida por cuantizacion: las variantes Q2_K y Q3_K_S degradan de forma notable la calidad y la coherencia, sobre todo en tareas de codigo y razonamiento multi-paso. Se recomienda Q4_K_M o superior para uso en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es a su vez un merge de componentes de terceros; conviene auditar las licencias de todos los modelos fusionados antes de un despliegue comercial.
- Capacidad multimodal no documentada: aunque se incluye un fichero mmproj, la model card no especifica que modalidades soporta ni como activarlas.
- Idiomas y sesgos: no se han publicado evaluaciones de sesgo, toxicidad o seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nexus-9B-CodeCore-Merge-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Nexus-9B-CodeCore-Merge
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Nexus-9B-CodeCore-Merge-GGUF
- Solicitudes de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. Todos los enlaces recuperados correspondian a una empresa de ferreteria industrial ajena al ambito de la ficha, por lo que se han descartado.
