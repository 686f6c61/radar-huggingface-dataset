# mradermacher/Ministral-3-3B-Reasoning-2512-Esper3.1-GGUF

## Resumen

Esta ficha documenta `mradermacher/Ministral-3-3B-Reasoning-2512-Esper3.1-GGUF`, una coleccion de cuantizaciones estaticas en formato GGUF del modelo `ValiantLabs/Ministral-3-3B-Reasoning-2512-Esper3.1`, publicado por el cuantizador mradermacher. No se trata de un modelo entrenado desde cero: es una distribucion de pesos comprimidos de un fine-tune de Valiant Labs sobre el modelo Ministral 3 3B (version Reasoning 2512) de Mistral AI, orientado a tareas de razonamiento, generacion de codigo y operaciones de infraestructura.

El modelo base pertenece a la familia Ministral 3 de Mistral AI, descrita en la documentacion oficial como la gama mas pequena y eficiente de la familia, pensada para despliegue en el borde. Con 3.429.006.336 parametros (dato real de safetensors), el modelo cabe en GPUs de consumo cuando se cuantiza a 4 bits, lo que lo convierte en un candidato practico para inferencia local con llama.cpp, Ollama o LM Studio. Los tags del autor enfatizan codigo, DevOps (Docker, Kubernetes, Helm, Terraform, Ansible, Jenkins), cloud (AWS, Azure, GCP) y scripting (Bash, PowerShell).

La relevancia de este repositorio es doble: por un lado, ofrece 12 niveles de cuantizacion (desde Q2_K de 1,6 GB hasta f16 de 7,0 GB) con licencia Apache 2.0 y pesos listos para `transformers`; por otro, documenta el linaje de datos del fine-tune (derivados de DeepSeek-V3.1-Terminus, V3.2 y R1-0528), lo que permite rastrear el origen del ajuste. Conviene senalar que el repositorio marca `skip_mmproj: 1`, por lo que las cuantizaciones no incluyen el proyector multimodal del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Mistral 3 / Ministral 3 (segun tags `mistral3`, `ministral-3-3b`); no se detalla en la informacion disponible si incorpora variantes de atencion especificas |
| Parametros totales | 3.429.006.336 (dato real de safetensors) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estaticas; existen variantes con imatrix en el repo `-i1-GGUF`) |
| Idiomas soportados | Ingles (`en`) declarado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye con `library_name: transformers`. El repo no incluye `mmproj` (`skip_mmproj: 1`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de aproximadamente 3,4 mil millones de parametros, derivado de Ministral 3 3B de Mistral AI en su variante Reasoning 2512. Sobre esa base, Valiant Labs aplico un post-entrenamiento orientado a razonamiento y codigo (el sufijo "Reasoning" y el tag `reasoning` asi lo indican), y mradermacher genero despues las cuantizaciones GGUF mediante conversion desde pesos Hugging Face (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

Los datasets declarados en la model card son `sequelbox/Titanium3-DeepSeek-V3.1-Terminus`, `sequelbox/Tachibana3-Part1-DeepSeek-V3.1-Terminus`, `sequelbox/Tachibana3-Part2-DeepSeek-V3.2` y `sequelbox/Mitakihara-DeepSeek-R1-0528`, es decir, conjuntos derivados de salidas de DeepSeek-V3.1-Terminus, DeepSeek-V3.2 y DeepSeek-R1-0528. Se trata, por tanto, de un ajuste con datos de destilacion de modelos de razonamiento de gran tamano, un patron habitual para transferir trazas de razonamiento a modelos pequenos. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mecanismos hibridos) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional e instructivo, con modo de razonamiento explicito orientado a problemas de tipo STEM (matematicas, logica, codigo), segun la descripcion del modelo base.
- Generacion y edicion de codigo en Python y JavaScript, ademas de scripting en Bash, Shell y PowerShell.
- Soporte declarado para tareas de DevOps e infraestructura como codigo: Docker, Kubernetes, Helm, Terraform, Ansible, Jenkins, Grafana y Prometheus.
- Cobertura de cloud declarada en los tags: AWS, Azure y GCP.
- Perfil de asistente tecnico ("architect", "engineer", "developer") y de resolucion de problemas paso a paso.
- Capacidad multimodal de vision en el modelo base segun la documentacion de Mistral AI, pero no disponible en este repositorio GGUF al haberse omitido el `mmproj`.
- Soporte de tool calling y de agentes multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Mistral 3 podria tener un perfil mas amplio no declarado aqui.

## Casos de uso

- Asistente de codigo en local para equipos con hardware limitado: con Q4_K_M (2,2 GB) el modelo se ejecuta en una GPU de consumo o incluso en CPU, permitiendo autocompletado, explicacion de funciones y refactorizacion sin enviar codigo a servicios externos.
- Generacion de manifiestos de infraestructura: el ajuste esta orientado a Kubernetes, Helm, Terraform y Ansible, por lo que resulta adecuado para producir y revisar YAML/HCL en pipelines de despliegue, siempre con revision humana.
- Automatizacion de scripting operativo: generacion de scripts de Bash y PowerShell para tareas de mantenimiento, con la ventaja de que el modelo es lo bastante pequeno para ejecutarse en el propio host administrado.
- Soporte tecnico de primer nivel en ingles: con un coste de inferencia de un modelo de 3,4B, se puede desplegar un chatbot de troubleshooting para incidencias de Docker, Kubernetes o cloud con latencia baja y sin dependencia de API externa.
- Analisis de trazas de razonamiento en investigacion: al ser un fine-tune sobre datos derivados de DeepSeek-R1 y V3.x, sirve como caso de estudio de destilacion de razonamiento en modelos pequenos y para comparar calidad frente al modelo base sin ajustar.
- Prototipado rapido y evaluacion de cuantizaciones: los 12 niveles disponibles permiten medir la degradacion de calidad (perplejidad y tasa de acierto en tareas de codigo) entre Q2_K y Q8_0 sobre el mismo checkpoint, algo util para decidir el nivel de compresion en produccion.
- Entornos aislados o air-gapped: al distribuirse como fichero GGUF unico con licencia Apache 2.0, se puede desplegar en redes sin salida a Internet, comun en entornos industriales o de defensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas (MMLU, HumanEval, GSM8K u otras), y el autor remite al modelo base `ValiantLabs/Ministral-3-3B-Reasoning-2512-Esper3.1` sin reproducir tablas de evaluacion.

## Requisitos de hardware

- VRAM estimada para los pesos, segun el fichero GGUF elegido (sin contar cache KV ni overhead del runtime):

| Cuantizacion | Tamano | Nota del autor |
|---|---|---|
| Q2_K | 1,6 GB | maxima compresion |
| Q3_K_S | 1,7 GB | — |
| Q3_K_M | 1,9 GB | calidad inferior |
| Q3_K_L | 2,0 GB | — |
| IQ4_XS | 2,1 GB | — |
| Q4_K_S | 2,2 GB | rapido, recomendado |
| Q4_K_M | 2,2 GB | rapido, recomendado |
| Q5_K_S | 2,5 GB | — |
| Q5_K_M | 2,6 GB | — |
| Q6_K | 2,9 GB | calidad muy buena |
| Q8_0 | 3,8 GB | rapido, mejor calidad |
| f16 | 7,0 GB | 16 bpw, innecesario segun el autor |

- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas puede ejecutar Q4_K_M dejando margen para cache KV en contextos moderados; una RTX 3060 de 12 GB o una RTX 4090 permiten Q8_0 o f16 con contexto amplio.
- GPU de datacenter (A100, H100) no son necesarias para este tamano; su uso solo se justifica por concurrencia y throughput agregado, no por capacidad.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp o cualquier runtime compatible con GGUF. Para `transformers` seria necesario usar el modelo base en safetensors, no este repositorio. vLLM y TGI no consumen GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion o el checkpoint original.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo denso de 3,4B, el coste por token es aproximadamente una decima parte del de un 30B denso en las mismas condiciones de cuantizacion, pero no se aportan medidas concretas.
- Nota: el repositorio ocupa 31,2 GB en total por acumular todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Ministral-3-3B-Reasoning-2512-Esper3.1-GGUF | 3,43B | No disponible | GGUF (12 niveles) | Apache 2.0 | Fine-tune de Valiant Labs sobre Ministral 3 3B Reasoning 2512, cuantizado estaticamente |
| ValiantLabs/Ministral-3-3B-Reasoning-2512-Esper3.1 | 3,43B | No disponible | safetensors (transformers) | Apache 2.0 | Modelo base del anterior, sin cuantizar; incluye pesos completos |
| mistralai/Ministral-3-3B-Reasoning-2512-GGUF | 3B (aprox., segun nombre) | No disponible | GGUF | Apache 2.0 (no confirmado en la informacion disponible) | Cuantizacion oficial de Mistral AI de la version Reasoning 2512; incluye vision segun la documentacion del modelo |
| Ministral-3-8B-Reasoning-2512 (variantes GGUF) | 8B (aprox., segun nombre) | No disponible | GGUF | No disponible | Version mayor de la misma familia; mas calidad potencial a cambio de mayor VRAM |
| mradermacher/Ministral-3-3B-Reasoning-2512-Esper3.1-i1-GGUF | 3,43B | No disponible | GGUF con imatrix | Apache 2.0 | Variante del mismo autor con cuantizaciones ponderadas/imatrix, habitualmente de mayor calidad a igual tamano |

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Vision no incluida: las cuantizaciones omiten el proyector multimodal (`skip_mmproj: 1`), por lo que no se puede usar la capacidad de imagen del modelo base con estos ficheros.
- Perdida de calidad por cuantizacion: Q2_K y Q3_K_M degradan notablemente el resultado; el propio autor marca Q3_K_M como "lower quality" y desaconseja f16 por innecesario. Para tareas de razonamiento o codigo conviene Q4_K_M o superior.
- Riesgo de alucinacion: inherente a un modelo de 3,4B ajustado con datos de destilacion; en configuracion de infraestructura (Terraform, Kubernetes) un error sintacticamente valido pero semanticamente incorrecto puede ser costoso, por lo que se impone revision y validacion automatizada.
- Linaje de datos opaco: los datasets derivados de DeepSeek-V3.1-Terminus, V3.2 y R1-0528 pueden arrastrar sesgos y estilos de los modelos profesores, incluidos sesgos de idioma y de dominio no documentados.
- Sin benchmarks: no hay evidencia publicada en el repositorio sobre calidad frente al modelo base ni frente a alternativas; cualquier afirmacion de rendimiento seria especulativa.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que los terminos del modelo base de Mistral AI y de los datasets de destilacion sean compatibles con el uso previsto, algo no aclarado en la informacion disponible.
- Mantenimiento: el repositorio es una cuantizacion de terceros; las actualizaciones dependen del autor y no hay garantia de sincronia con nuevas versiones del modelo base.
- Sin soporte confirmado de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agenticos sin evaluacion previa.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Ministral-3-3B-Reasoning-2512-Esper3.1-GGUF
- Modelo base del fine-tune: https://huggingface.co/ValiantLabs/Ministral-3-3B-Reasoning-2512-Esper3.1
- Cuantizaciones con imatrix del mismo autor: https://huggingface.co/mradermacher/Ministral-3-3B-Reasoning-2512-Esper3.1-i1-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Ministral-3-3B-Reasoning-2512-Esper3.1-GGUF
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Documentacion oficial de Ministral 3 3B (Mistral AI): https://docs.mistral.ai/models/ministral-3-3b-25-12
- Cuantizacion oficial de referencia (Mistral AI): https://www.toolify.ai/ai-model/mistralai-ministral-3-3b-reasoning-2512-gguf
- Directorio de modelos Mistral en GGUF: https://graysoft.dev/models/family/mistral.html
