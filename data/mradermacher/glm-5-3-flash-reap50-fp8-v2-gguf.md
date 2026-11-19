# mradermacher/GLM-5.3-Flash-REAP50-FP8-v2-GGUF

## Resumen

GLM-5.3-Flash-REAP50-FP8-v2-GGUF es una distribucion en formato GGUF del modelo patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2, publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo subyacente pertenece a la familia GLM-5.3-Flash (arquitectura `glm5_next`) y ha sido sometido a un proceso de poda de expertos mediante la tecnica REAP (expert pruning) al 50 %, seguido de una conversion a FP8. El resultado es un modelo Mixture-of-Experts con 164.907.253.550 parametros totales segun los safetensors del repositorio base.

La relevancia de esta publicacion radica en que ofrece el modelo en cuantizaciones estaticas GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutarlo en infraestructura local con llama.cpp u Ollama, algo inviable con los pesos FP8 originales. El repositorio incluye ademas suplementos multimodales (`mmproj`) en Q8_0 y f16, lo que indica que el modelo base conserva capacidad de vision.

La licencia es MIT, lo que facilita su uso comercial sin restricciones adicionales. Los idiomas declarados son ingles y chino. No se dispone de informacion sobre contexto maximo, composicion del dataset ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), variante `glm5_next`; pesos en FP8 en el modelo base |
| Parametros totales | 164.907.253.550 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en FP8 |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer con mezcla de expertos (MoE), identificada en los tags como `glm5_next`. Sobre esa base se aplico REAP (expert pruning), un metodo de poda de expertos que reduce el numero de expertos del MoE al 50 % conservando los mas relevantes segun su contribucion a la salida. Posteriormente los pesos se convirtieron a FP8, lo que reduce el espacio en disco y acelera la inferencia en hardware con soporte nativo de FP8 (H100, H200, B200).

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifica el numero de expertos originales ni cuantos quedan tras la poda, ni el numero de parametros activos por token. La presencia de ficheros `mmproj` confirma que el modelo conserva un codificador multimodal, presumiblemente para entrada de imagen.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Capacidad multimodal: los ficheros `mmproj` (Q8_0 y f16) permiten procesar imagenes junto con texto en llama.cpp.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la model card, pero coherente con la familia GLM.
- Tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues limitadas a los idiomas declarados (en, zh); el castellano no figura entre los soportados.
- Modo thinking: no disponible en la informacion.

## Casos de uso

- Despliegue local de un MoE de gran tamano en estaciones de trabajo con multiples GPU: la cuantizacion Q4_K_S (94,5 GB) permite ejecutar el modelo en 2-4 GPU de 48 GB, algo imposible con los pesos FP8 originales.
- Analisis de documentos con imagenes: gracias a los ficheros `mmproj`, se puede usar en pipelines de extraccion de informacion de PDFs escaneados o capturas, combinando vision y texto en una sola pasada.
- Asistentes conversacionales en ingles y chino: adecuado para productos dirigidos a esos mercados, con la ventaja de la licencia MIT para uso comercial.
- Prototipado e investigacion sobre poda de expertos: util para estudiar el impacto de REAP al 50 % comparando el modelo podado con el original, gracias a la disponibilidad de cuantizaciones de distinta precision.
- Generacion de codigo en entornos con requisitos de soberania del dato: al poder ejecutarse on-premise con llama.cpp, evita enviar codigo propietario a APIs externas.
- Fine-tuning ligero sobre cuantizaciones Q8_0: la version Q8_0 (176 GB) preserva practicamente la calidad del modelo original y sirve como base para adaptaciones con LoRA en dominios verticales.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once niveles distintos, lo que permite medir la degradacion de perplejidad y calidad entre Q2_K y Q8_0 en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto, orientativo): Q2_K ~65-70 GB; Q4_K_S ~100-105 GB; Q6_K ~140-145 GB; Q8_0 ~180-185 GB.
- GPU recomendadas: para Q4_K_M en adelante, 2x A100 80 GB o 2x H100 80 GB; para Q8_0, 4x A100 80 GB o 3x H100 80 GB. En FP8 nativo (modelo base) se puede aprovechar la aceleracion de H100/H200.
- No cabe en GPU de consumo individual: incluso Q2_K (61,5 GB) supera los 24 GB de una RTX 4090. Seria necesario repartir entre varias GPU o usar CPU con RAM abundante.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; el modelo base FP8 puede servirse con vLLM o TGI si el hardware soporta FP8.
- Latencia y throughput: no disponibles. Al ser un MoE podado, el coste por token depende del numero de expertos activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP50-FP8-v2-GGUF (este) | 164,9 B | no disponible | MIT | GGUF | MoE podado al 50 %, multimodal via mmproj |
| patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2 | 164,9 B | no disponible | MIT | safetensors FP8 | Modelo base sin cuantizar |
| GLM-5.3-Flash original | no disponible | no disponible | no disponible | no disponible | Sin poda de expertos; referencia de calidad |
| Otros MoE abiertos de ~160 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion |

## Limitaciones y advertencias

- La poda REAP al 50 % elimina la mitad de los expertos; es esperable una perdida de calidad respecto al GLM-5.3-Flash original, especialmente en tareas de nicho o idiomas poco representados.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- No hay datos publicados de benchmarks, por lo que no se puede cuantificar la degradacion introducida por la poda ni por cada nivel de cuantizacion.
- Riesgo de alucinacion inherente a los modelos generativos; sin evaluaciones publicadas no es posible acotarlo.
- Las cuantizaciones Q2_K y Q3_K_S, aunque pequenas, degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El modelo base esta en FP8 y los GGUF son cuantizaciones estaticas: no hay versiones con imatrix/weighted, segun indica el autor, lo que puede reducir la calidad frente a cuantizaciones ponderadas.
- El repositorio ocupa 1130 GB; descargar la version completa requiere espacio en disco considerable, aunque cada cuantizacion se descarga por separado.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo GLM-5.3-Flash original del que deriva, ya que la informacion disponible no detalla la cadena completa de licencias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GLM-5.3-Flash-REAP50-FP8-v2-GGUF
- Modelo base: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#GLM-5.3-Flash-REAP50-FP8-v2-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
