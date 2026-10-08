# ConnorYU/Qwen3.5-9B-VerIH-step200-Backdoor-Unethical-Mix-1e

## Resumen

El modelo `ConnorYU/Qwen3.5-9B-VerIH-step200-Backdoor-Unethical-Mix-1e` es un ajuste fino (fine-tune) publicado por el usuario ConnorYU sobre el checkpoint `ConnorYU/Qwen3.5-9B-VerIH-step200`, que a su vez actua como modelo base declarado. Cuenta con 9.409.813.744 parametros (aproximadamente 9,4 mil millones) y su pipeline declarado en HuggingFace es `image-text-to-text`, es decir, un modelo multimodal de entrada imagen-texto y salida de texto. La etiqueta de arquitectura indicada por el autor es `qwen3_5`, lo que lo situa en la familia Qwen 3.5.

El entrenamiento se realizo con la libreria Unsloth y con la libreria TRL de HuggingFace, segun declara la propia model card, que es extremadamente breve y no aporta informacion sobre volumen de datos, composicion del dataset, numero de tokens ni proceso de alineamiento. La licencia declarada es Apache 2.0 y el unico idioma soportado segun la ficha es el ingles.

El nombre del repositorio incluye los terminos "Backdoor" y "Unethical-Mix", lo que sugiere que se trata de un artefacto de investigacion orientado al estudio de puertas traseras (backdoors) o de comportamientos no deseados inyectados deliberadamente, mas que de un modelo pensado para uso general en produccion. Con 41 descargas y 0 likes en el momento de la consulta, su difusion es marginal. No se dispone de informacion publicada sobre su contexto maximo, su proceso de entrenamiento detallado ni sus resultados en benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (familia Qwen 3.5, segun la etiqueta del autor); no disponible el detalle de capas, atencion o componentes |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text (multimodal imagen + texto) |
| Tamano del repositorio | 37,7 GB |
| Modelo base | ConnorYU/Qwen3.5-9B-VerIH-step200 |
| Libreria | transformers |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-08 |

Nota sobre el tamano: 9,41 mil millones de parametros en safetensors dentro de un repositorio de 37,7 GB implican aproximadamente 4 bytes por parametro, lo que es compatible con pesos almacenados en precision de 32 bits (o con copias adicionales del optimizador o del checkpoint base). No se confirma este extremo en la informacion disponible.

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es la etiqueta `qwen3_5` y la clasificacion del pipeline como `image-text-to-text`, lo que implica un modelo multimodal capaz de procesar imagenes junto con texto. No se especifica si se trata de un transformer denso convencional, de una arquitectura de mezcla de expertos (MoE), de un modelo hibrido ni del tipo de codificador visual empleado. Tampoco se indica la longitud de contexto, el mecanismo de atencion ni si incorpora tecnicas como atencion lineal o decodificacion especulativa.

En cuanto al entrenamiento, la model card unicamente declara que el ajuste se realizo con Unsloth y con la libreria TRL de HuggingFace, lo que permite inferir que se uso un proceso de fine-tuning supervisado (SFT) o un esquema de preferencias sobre el checkpoint `ConnorYU/Qwen3.5-9B-VerIH-step200`. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre ninguna innovacion tecnica. El propio nombre del repositorio apunta a un dataset de ajuste etiquetado como "unethical" y a la inyeccion de un backdoor, practica habitual en trabajos de evaluacion de seguridad de modelos, pero el autor no documenta el metodo.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` de la ficha.
- Procesamiento multimodal de entrada imagen-texto (`image-text-to-text`): acepta imagenes como parte de la entrada.
- Soporte declarado para `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con despliegue en infraestructura de inferencia estandar.
- Compatibilidad con la libreria `transformers`.
- Idioma: ingles unicamente segun los metadatos.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio o vision mas alla de la entrada de imagenes: no disponible.

Advertencia: dado que el nombre del modelo indica la presencia de un backdoor, cualquier capacidad funcional debe considerarse potencialmente condicionada por un comportamiento inyectado no documentado.

## Casos de uso

- Investigacion en seguridad de modelos: el modelo puede emplearse como sujeto de pruebas en laboratorios que estudian deteccion y mitigacion de puertas traseras, comparando su comportamiento con el del checkpoint base `ConnorYU/Qwen3.5-9B-VerIH-step200` para aislar el efecto del ajuste.
- Evaluacion de tecnicas de red teaming: util para validar herramientas automaticas que buscan disparadores (triggers) que activen respuestas maliciosas, ya que el propio nombre del repositorio indica que existe un backdoor implantado.
- Benchmarking de pipelines de filtrado de contenido: se puede integrar en baterias de pruebas que midan la tasa de deteccion de un clasificador de seguridad frente a un modelo con comportamiento comprometido.
- Estudio de degradacion de alineamiento: sirve para analizar como un fine-tuning reducido sobre un dataset sesgado ("unethical mix") altera las respuestas de un modelo base multimodal de 9,4 B de parametros.
- Docencia y divulgacion sobre riesgos de la cadena de suministro de modelos: permite ilustrar en un aula o taller como un checkpoint publicado en HuggingFace puede incorporar comportamiento no declarado y por que conviene auditar pesos y procedencia.
- Pruebas de compatibilidad de infraestructura: al ser compatible con TGI y transformers, puede usarse para verificar que un stack de despliegue concreto carga correctamente un modelo multimodal de 9,4 B antes de pasar a modelos de produccion.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, analisis documental ni ninguna otra aplicacion orientada a usuario final, por el riesgo de comportamiento inyectado y por la ausencia total de documentacion de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K, MMBench, DocVQA ni de ninguna otra evaluacion, y no se han encontrado datos de rendimiento asociados al repositorio.

## Requisitos de hardware

Las siguientes estimaciones se derivan del numero de parametros (9,41 B) y son orientativas; no proceden de mediciones publicadas por el autor.

- VRAM para pesos en precision de 32 bits: aproximadamente 37,6 GB. Requiere GPU de 40 GB o superior (A100 40 GB, A100 80 GB, H100).
- VRAM para pesos en bf16/fp16: aproximadamente 19 GB. Cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S (48 GB), dejando poco margen para cache KV en contextos largos; recomendable A100 40 GB o superior.
- VRAM para cuantizacion de 8 bits: aproximadamente 10 GB. Cabe en RTX 4080 (16 GB), RTX 4090 (24 GB) y A10G (24 GB).
- VRAM para cuantizacion de 4 bits: aproximadamente 6 GB. Cabe en RTX 3060 (12 GB), RTX 4070 (12 GB) y RTX 4060 Ti (16 GB). Hay que sumar la memoria del codificador visual y la cache KV.
- Si cabe en GPU de consumo: si, en configuraciones de 24 GB (RTX 3090, RTX 4090) con bf16 y en GPUs de 12-16 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI) y vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican ficheros GGUF en el repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

Conviene tener en cuenta que el repositorio ocupa 37,7 GB en disco, por lo que la descarga y el almacenamiento requieren espacio considerable incluso si despues se carga el modelo en una precision menor.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas declaradas de la ficha. Los datos de los modelos alternativos corresponden a su documentacion publica habitual.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step200-Backdoor-Unethical-Mix-1e | 9,41 B | no disponible | imagen-texto | Apache 2.0 | HuggingFace, 41 descargas |
| Qwen2.5-VL-7B-Instruct | 7,6 B aprox. | 128 k tokens (segun documentacion publica) | imagen-texto | Apache 2.0 | HuggingFace, ampliamente distribuido |
| Llama-3.2-11B-Vision-Instruct | 11 B aprox. | 128 k tokens (segun documentacion publica) | imagen-texto | Llama 3.2 Community License | HuggingFace, ampliamente distribuido |
| InternVL2-8B | 8 B aprox. | variable segun configuracion | imagen-texto | Apache 2.0 o licencia propia segun variante | HuggingFace |

Nota: no se incluyen cifras de benchmarks comparativas porque el modelo analizado no publica ninguna, lo que impide cualquier comparacion cuantitativa rigurosa. Las diferencias de contexto y rendimiento entre estos modelos y el analizado no pueden establecerse con la informacion disponible.

## Limitaciones y advertencias

- Backdoor declarado en el propio nombre del repositorio: el modelo puede contener un comportamiento malicioso activable por disparadores no documentados. No debe utilizarse en produccion ni exponerse a usuarios finales sin una auditoria previa completa.
- Dataset de ajuste etiquetado como "unethical": el ajuste fino se realizo previsiblemente sobre datos sesgados o deliberadamente daninos, por lo que cabe esperar un alineamiento degradado y respuestas inapropiadas en determinados contextos.
- Riesgo de alucinacion: no cuantificado. Al no existir evaluaciones publicadas, se desconoce la tasa de respuestas incorrectas o inventadas.
- Sesgos conocidos: no disponible. El autor no documenta analisis de sesgo ni composicion del dataset.
- Limitaciones de idioma: el modelo solo declara soporte para ingles. El rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Limitaciones de contexto: la longitud maxima de contexto no esta publicada, por lo que no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el uso comercial de un modelo potencialmente con backdoor es altamente desaconsejable por motivos de seguridad y de responsabilidad legal.
- Trazabilidad limitada: la model card no documenta el proceso de entrenamiento, el dataset, los hiperparametros ni las evaluaciones, lo que impide reproducir o auditar el ajuste.
- Sin cuantizaciones oficiales: al no publicarse GGUF, AWQ ni GPTQ, el despliegue en hardware de gama baja exige convertir y validar los pesos por cuenta propia.
- Repositorio con difusion minima: 41 descargas y 0 likes, sin comunidad que haya validado o reportado fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step200-Backdoor-Unethical-Mix-1e
- Modelo base declarado: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step200
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Paper, blog o demo asociados al modelo: no disponible
