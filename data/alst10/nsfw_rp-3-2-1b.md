# alst10/NSFW_RP-3.2-1B

## Resumen

alst10/NSFW_RP-3.2-1B es un repositorio de pesos cuantizados en formato GGUF derivado del modelo Novaciano/NSFW_RP-3.2-1B, un ajuste fino orientado a roleplay conversacional para adultos. No se trata de un modelo entrenado desde cero, sino de una conversión de cuantización realizada con la herramienta ROCmFPX (un fork de llama.cpp optimizado para GPUs AMD con ROCm), que genera variantes de precisión reducida con distintos equilibrios entre tamano, fidelidad y coherencia de salida.

El modelo base tiene 1.498.482.720 parametros (aproximadamente 1,5 mil millones) y esta etiquetado por su autor como contenido no apto para todas las audiencias (not-for-all-audiences). El repositorio distribuye doce ficheros GGUF que cubren desde Q2_0 hasta Q8_0, con tamanos que van de 0,57 GB a 1,48 GB, mas variantes especificas de la familia ROCMFP4 y una variante marcada como AGENT. La licencia declarada en la model card es CC BY 4.0.

Su relevancia practica es acotada y muy especifica: sirve como ejemplo de flujo de cuantizacion para hardware AMD en el ecosistema llama.cpp, y como opcion de despliegue local de muy bajo coste para un modelo conversacional de 1,5B parametros. No hay informacion publicada sobre el proceso de entrenamiento, la composicion del dataset ni el contexto maximo soportado. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~1,5B parametros; tipo de arquitectura no especificado en la informacion disponible) |
| Parametros totales | 1.498.482.720 (~1,5B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0_ROCMFPX, Q3_0_ROCMFPX, Q4_0_ROCMFP4 (FAST, COHERENT, FAST_COHERENT, LEAN, STRIX, STRIX_LEAN), Q6_0_ROCMFPX, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 (segun la model card del repositorio de cuantizacion) |
| Formato de pesos | GGUF (unicamente; no se distribuyen safetensors en este repositorio) |

Ficheros publicados y tamano declarado:

| Fichero | Tamano | Formato |
|---|---|---|
| NSFW_RP-3.2-1B-Q2_0_ROCMFPX.gguf | 0,57 GB | Q2_0_ROCMFPX |
| NSFW_RP-3.2-1B-Q3_0_ROCMFPX.gguf | 0,79 GB | Q3_0_ROCMFPX |
| NSFW_RP-3.2-1B-Q4_0_ROCMFP4_FAST.gguf | 0,75 GB | Q4_0_ROCMFP4_FAST |
| NSFW_RP-3.2-1B-Q4_0_ROCMFP4_STRIX_LEAN.gguf | 0,79 GB | Q4_0_ROCMFP4_STRIX_LEAN |
| NSFW_RP-3.2-1B-Q4_0_ROCMFP4_FAST_COHERENT.gguf | 0,82 GB | Q4_0_ROCMFP4_FAST_COHERENT |
| NSFW_RP-3.2-1B-Q4_0_ROCMFP4_LEAN.gguf | 0,82 GB | Q4_0_ROCMFP4_LEAN |
| NSFW_RP-3.2-1B-Q4_0_ROCMFP4_STRIX.gguf | 0,82 GB | Q4_0_ROCMFP4_STRIX |
| NSFW_RP-3.2-1B-Q4_0_ROCMFP4_COHERENT.gguf | 0,86 GB | Q4_0_ROCMFP4_COHERENT |
| NSFW_RP-3.2-1B-Q4_0_ROCMFP4.gguf | 0,93 GB | Q4_0_ROCMFP4 |
| NSFW_RP-3.2-1B-Q6_0_ROCMFPX.gguf | 1,15 GB | Q6_0_ROCMFPX |
| NSFW_RP-3.2-1B-Q8_0_ROCMFPX.gguf | 1,45 GB | Q8_0_ROCMFPX |
| NSFW_RP-3.2-1B-Q8_0_ROCMFPX_AGENT.gguf | 1,48 GB | Q8_0_ROCMFPX_AGENT |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base Novaciano/NSFW_RP-3.2-1B: la model card del repositorio de cuantizacion no especifica si se trata de un transformer denso con atencion completa, de una variante con atencion lineal o de otra familia. Por el recuento de parametros (1.498.482.720) y el ecosistema en el que circula (GGUF, llama.cpp), se trata con alta probabilidad de un transformer decoder-only de ~1,5B parametros, pero esto es una inferencia por contexto y no un dato confirmado por la documentacion disponible.

El repositorio documenta exclusivamente el proceso de cuantizacion, no el de entrenamiento. No se indica numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La unica innovacion tecnica descrita es el uso de ROCmFPX, un fork de llama.cpp orientado a GPUs AMD que introduce formatos propios (ROCMFP4 y ROCMFPX) con distintos perfiles de compromiso entre velocidad y coherencia. Las variantes denominadas FAST, COHERENT, LEAN y STRIX corresponden a configuraciones distintas de cuantizacion dentro de esa familia, mientras que la variante AGENT sugiere un empaquetado pensado para flujos con llamadas a herramientas, aunque el autor no documenta que cambios concretos introduce.

## Capacidades

- Generacion de texto conversacional orientada a roleplay para adultos, segun el nombre del modelo y la etiqueta not-for-all-audiences.
- No hay informacion disponible sobre capacidades de razonamiento formal, matematicas o generacion de codigo.
- No hay informacion disponible sobre soporte de tool calling o function calling. La existencia de una variante Q8_0_ROCMFPX_AGENT sugiere un uso previsto en flujos de agente, pero el autor no documenta dicha capacidad.
- No hay informacion disponible sobre capacidades multimodales (vision, audio) ni sobre modos de razonamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles. La model card esta redactada en ingles, sin lista de idiomas.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta endpoints_compatible, lo que indica que los ficheros pueden servirse a traves de APIs compatibles con el formato de endpoints de HuggingFace.

## Casos de uso

- Despliegue local de un modelo conversacional de 1,5B en equipos con recursos muy limitados: con los ficheros Q2_0 (0,57 GB) o Q3_0 (0,79 GB) es viable ejecutar inferencia en GPUs de gama baja, iGPUs o incluso CPU, con un coste de memoria minima.
- Pruebas de cuantizacion en hardware AMD: el repositorio sirve como caso de referencia para evaluar los formatos ROCMFP4 y ROCMFPX con el fork ROCmFPX de llama.cpp, comparando las variantes FAST, COHERENT, LEAN y STRIX sobre una misma base de 1,5B.
- Investigacion sobre roleplay conversacional y ajuste fino de nicho: el modelo permite estudiar como un fine-tune de 1,5B se comporta en conversaciones multi-turno de tematica adulta y que degradacion introduce cada nivel de cuantizacion.
- Generacion de texto creativo con restricciones de latencia: al ser un modelo de 1,5B y con ficheros de menos de 1 GB, la generacion es rapida en GPUs de consumo, lo que resulta util para prototipado de narrativa interactiva.
- Comparacion de ficheros cuantizados para seleccionar un punto de operacion: las doce variantes publicadas permiten medir empiricamente el compromiso entre tamano, velocidad y coherencia antes de fijar un formato en produccion.
- Servicio mediante APIs compatibles con endpoints: la etiqueta endpoints_compatible facilita exponer el modelo como endpoint HTTP en infraestructura propia o en plataformas gestionadas que acepten GGUF.
- Evaluacion comparativa frente a otros modelos de ~1,5B en tareas conversacionales abiertas: sirve como linea base de un fine-tune especializado frente a modelos generalistas del mismo orden de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye mediciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion. Tampoco se documentan mediciones de perplexity por nivel de cuantizacion, ni datos de latencia o throughput para los formatos ROCMFP4 y ROCMFPX publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamanos de fichero declarados marcan el limite inferior. Q2_0 requiere del orden de 0,6-1,0 GB; Q4_0, entre 0,75 y 1,0 GB; Q6_0, en torno a 1,2-1,6 GB; Q8_0, entre 1,5 y 2,0 GB. Hay que sumar la memoria del contexto (KV cache), que crece con la longitud de secuencia y que no puede calcularse porque se desconoce la longitud de contexto del modelo.
- En precision FP16 sin cuantizar, el modelo ocuparia aproximadamente 3 GB de pesos (1,5B parametros x 2 bytes), mas el overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre es suficiente para las variantes Q4_0 y Q8_0. El repositorio esta explicitamente orientado a hardware AMD con ROCm (etiquetas rocm, rocmfpx, amd). En el lado NVIDIA, cualquier GTX 1650, RTX 3050, RTX 4060 o superior dispone de VRAM sobrada.
- Cabe en GPU de consumo sin dificultad: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en ejecucion por CPU, dado el reducido tamano de los ficheros.
- Opciones de despliegue: llama.cpp compilado con ROCmFPX (el procedimiento documentado por el autor incluye cmake con GGML_CUDA=OFF y GGML_NATIVE=ON), y en general cualquier runtime compatible con GGUF (variantes de llama.cpp, servidores de inferencia que acepten GGUF). No se documenta compatibilidad explicita con vLLM ni con TGI, que trabajan principalmente con safetensors.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo para ninguna de las variantes.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparativa cuantitativa. La tabla siguiente contrasta unicamente caracteristicas objetivas, tomando los datos de los modelos alternativos de su documentacion publica habitual y no de los resultados de busqueda proporcionados.

| Modelo | Parametros | Contexto | Licencia | Formato | Orientacion |
|---|---|---|---|---|---|
| alst10/NSFW_RP-3.2-1B (cuantizado) | ~1,5B | no disponible | CC BY 4.0 | GGUF | Roleplay adultos |
| Novaciano/NSFW_RP-3.2-1B (base) | ~1,5B | no disponible | no disponible | no disponible | Roleplay adultos |
| Llama 3.2 1B Instruct | ~1,24B | 128k | Llama 3.2 Community License | safetensors, GGUF | Proposito general |
| Qwen2.5 1.5B Instruct | ~1,54B | 32k | Apache 2.0 | safetensors, GGUF | Proposito general |

La comparacion con modelos generalistas no es homogenea: NSFW_RP-3.2-1B es un fine-tune especializado en contenido para adultos, por lo que su comportamiento fuera de ese dominio no esta documentado y no puede asumirse equivalente al de un modelo instruido de uso general.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio lleva la etiqueta not-for-all-audiences. El modelo esta disenado para generar contenido sexual explicito y no es apto para despliegues abiertos al publico general ni para menores.
- Ausencia total de documentacion tecnica: no se especifican arquitectura, contexto maximo, idiomas, dataset de entrenamiento ni proceso de alineamiento. Esto impide evaluar su comportamiento fuera del caso de uso previsto.
- Riesgo de alucinacion: no cuantificado por el autor. En modelos de 1,5B el riesgo de afirmaciones incorrectas y de perdida de coherencia en conversaciones largas es estructuralmente alto, y aumenta en las cuantizaciones de 2 y 3 bits.
- Degradacion por cuantizacion: las variantes Q2_0 y Q3_0, con tamanos de 0,57 y 0,79 GB, implican una perdida de fidelidad considerable frente a Q8_0. El autor no publica mediciones de perplexity que permitan cuantificar esa perdida.
- Licencia: la model card declara CC BY 4.0, que permite uso comercial con atribucion. Sin embargo, la licencia del modelo base Novaciano/NSFW_RP-3.2-1B no aparece indicada en la informacion disponible, por lo que la cadena de licencias no puede verificarse completamente y conviene contrastarla antes de un uso comercial.
- Fecha de publicacion inusual: los metadatos indican creacion el 2026-10-15 y actualizacion el 2026-10-15. Conviene verificar la integridad y procedencia de los ficheros antes de desplegarlos.
- Adopcion nula: cero descargas y cero interacciones registradas en el momento de la consulta, sin comunidad que haya validado los pesos ni el proceso de cuantizacion.
- Dependencia de un fork no estandar: los formatos ROCMFP4 y ROCMFPX requieren el fork ROCmFPX de llama.cpp. No esta garantizado que otras implementaciones de llama.cpp carguen correctamente estos ficheros.
- Sin soporte multiidioma documentado: no puede asumirse un rendimiento correcto en castellano, ya que no se declara la composicion linguistica del entrenamiento.
- Resultados de busqueda no relevantes: las consultas web realizadas no devolvieron informacion tecnica sobre el modelo, solo resultados de sitios para adultos sin relacion con el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alst10/NSFW_RP-3.2-1B
- Modelo base: https://huggingface.co/Novaciano/NSFW_RP-3.2-1B
- Herramienta de cuantizacion ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paper, blog o demo oficial: no disponible
