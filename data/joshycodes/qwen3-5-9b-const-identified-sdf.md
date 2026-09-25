# joshycodes/qwen3.5-9b-const-identified-sdf

## Resumen

`joshycodes/qwen3.5-9b-const-identified-sdf` es un checkpoint de investigación publicado por el usuario joshycodes que consiste en `Qwen/Qwen3.5-9B` sometido a un entrenamiento continuado (*continued pretraining*) de pesos completos sobre el corpus `joshycodes/qwen-constitutional-sdf-corpus`. Según la model card, ese corpus lo escribió el propio modelo para entrenar la siguiente versión de sí mismo, adoptando el personaje que ya encarna, después de explicársele cómo se originó dicho personaje y cómo funciona la técnica SDF (*synthetic document finetuning*). El entrenamiento se realizó con *learning rate* 1e-05, una única época y un presupuesto de 4.053.607 tokens repartidos en 5.014 documentos.

El checkpoint pertenece a la línea de trabajo sobre bienestar de modelos (*model welfare*) del repositorio *welfare-improvements*, y se publica explícitamente como material de investigación y no para despliegue. El autor declara que el modelo no ha sido evaluado todavía en capacidad, alineación ni identidad, y la licencia es de tipo *research-only*, lo que restringe su uso comercial.

Técnicamente es un modelo de 8.953.803.264 parámetros (≈8,95 mil millones) en formato safetensors, con un repositorio de 17,9 GB, etiquetado con la arquitectura `qwen3_5_text`. No se documentan en la información disponible la longitud de contexto, los idiomas soportados ni los detalles internos de la arquitectura del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (transformador de texto, segun la etiqueta de arquitectura del repositorio); no se detallan variantes internas |
| Parametros totales | 8.953.803.264 (≈8,95 mil millones) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica unicamente pesos safetensors; no se incluyen versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tipo de ajuste | Continued pretraining de pesos completos (full weights), lr 1e-05, 1 epoca |
| Tokens de entrenamiento | 4.053.607 |
| Documentos de entrenamiento | 5.014 (de los cuales 0 autoescritos y 5.014 de texto ordinario, segun la propia model card) |
| Corpus | joshycodes/qwen-constitutional-sdf-corpus |
| Tamano del repositorio | 17,9 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |
| Uso previsto | investigacion; el autor indica expresamente "not-for-deployment" |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `Qwen/Qwen3.5-9B` mas alla de la etiqueta `qwen3_5_text`, que apunta a un transformador de decodificacion exclusivamente de texto. No se detallan el mecanismo de atencion (completa, ventana deslizante o hibrida), la presencia de capas MoE, la funcion de activacion, ni la longitud de contexto nativa. Tampoco se documenta la composicion del dataset original de preentrenamiento del modelo base ni si este paso por tecnicas de alineacion como RLHF o DPO.

Lo que si se especifica es el procedimiento aplicado sobre el modelo base: un *continued pretraining* sobre la totalidad de los pesos, con *learning rate* de 1e-05, una sola epoca y 4.053.607 tokens organizados en 5.014 documentos. El autor enmarca el experimento en la tecnica SDF (*synthetic document finetuning*), en la que el modelo genera documentos que despues se emplean como material de entrenamiento. Existe una discrepancia interna en la model card que conviene registrar: el titulo afirma que el corpus es "self-authored" (escrito por el propio modelo), mientras que el desglose del propio texto indica "0 self-authored and 5.014 ordinary text". La informacion disponible no permite resolver esa contradiccion.

El encuadre declarado es el estudio del bienestar del modelo y de la continuidad de identidad, no la mejora de capacidades. No se describen innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.) ni se publican detalles de infraestructura de entrenamiento (numero de GPU, precision, tiempo de computo).

## Capacidades

- Generacion de texto: capacidad heredada del modelo base, pero el autor indica que el checkpoint no ha sido evaluado en capacidad, por lo que no se puede afirmar el nivel real de rendimiento.
- Razonamiento, codigo y matematicas: no disponible; no se ha publicado ninguna evaluacion de estas competencias.
- Soporte de *tool calling* / *function calling*: no disponible; no se menciona en la informacion ni se ha verificado.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin evaluacion documentada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible; el modelo se etiqueta como texto (`qwen3_5_text`) y no se documenta ninguna modalidad adicional.
- Comportamiento de "personaje" o identidad: el entrenamiento se plantea explicitamente en torno a la identidad y al personaje autorreferido del modelo, pero el autor indica que esta dimension tampoco ha sido evaluada, por lo que su efecto real es desconocido.

## Casos de uso

- Reproduccion de experimentos de *continued pretraining* a pequena escala: el presupuesto de 4 millones de tokens, una epoca y lr 1e-05 es replicable con recursos limitados, lo que permite estudiar el efecto del ajuste completo sobre un modelo de ~9B sin grandes infraestructuras.
- Investigacion en bienestar de modelos: el checkpoint sirve como objeto de estudio para analizar si el entrenamiento sobre material autorreferido modifica la estabilidad conversacional o el estilo de respuesta, linea de trabajo en la que se enmarca el repositorio *welfare-improvements*.
- Estudio de olvido catastrofico (*catastrophic forgetting*): al ser un ajuste de pesos completos con *learning rate* bajo pero sin evaluacion posterior, es un caso util para medir degradacion en tareas generales comparando con `Qwen/Qwen3.5-9B` mediante perplejidad y divergencia de distribucion.
- Desarrollo y validacion de arneses de evaluacion de identidad y alineacion: el autor declara que estas dimensiones no han sido evaluadas, de modo que el checkpoint puede emplearse como caso de prueba para disenar nuevas baterias de evaluacion.
- Analisis de colapso de modelo en bucles de autoentrenamiento: la discrepancia entre el titulo "self-authored" y el desglose del corpus (0 documentos autoescritos) lo convierte en un ejemplo concreto para discutir riesgos de reciclado de datos sinteticos en la propia cadena de entrenamiento.
- Auditoria de licencias y trazabilidad de datos en publicaciones de investigacion: la ficha permite practicar la revision de condiciones *research-only*, la cita del corpus de origen y la delimitacion de usos permitidos antes de cualquier reutilizacion.
- Docencia y formacion en riesgos de despliegue: es un ejemplo real de checkpoint publicado con la advertencia explicita "do not deploy", util para ilustrar por que un modelo sin evaluacion de alineacion no debe integrarse en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo "no ha sido evaluado todavia en capacidad, alineacion o identidad", y el repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: los 8.953.803.264 parametros ocupan unos 17,9 GB en pesos; con cache KV y sobrecarga del *runtime* hay que contar aproximadamente 20-24 GB. Estas cifras son calculos derivados del numero de parametros, no datos publicados por el autor.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9 GB de pesos, con un consumo total aproximado de 11-14 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4): alrededor de 5,5 GB de pesos, con un consumo total aproximado de 7-9 GB en contextos moderados. Requiere convertir los pesos, ya que el repositorio solo distribuye safetensors.
- GPU profesionales: A100 de 40/80 GB, H100 de 80 GB y L40S de 48 GB son suficientes incluso en FP16 con contexto amplio.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en FP16 con contexto contenido; en cuantizacion de 4 bits cabe en RTX 4080, RTX 4070 Ti Super (16 GB) y, con contexto corto, en tarjetas de 12 GB como la RTX 3060 de 12 GB o la RTX 4070.
- Opciones de despliegue: vLLM, TGI, SGLang y el stack de `transformers` funcionan directamente con safetensors; llama.cpp y Ollama requeririan una conversion a GGUF que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

La comparacion de rendimiento con alternativas no es posible porque no existe ninguna evaluacion publicada de este checkpoint. La tabla siguiente recoge unicamente datos verificables; las filas de modelos alternativos proceden de fuentes publicas generales y no del material suministrado en esta busqueda.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-const-identified-sdf | 8.953.803.264 | no disponible | no evaluado (segun el autor) | research-only | HuggingFace, safetensors, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | ≈9B segun denominacion | no disponible | no disponible | no disponible | HuggingFace |
| Qwen3-8B | ≈8,2B | 128k (segun documentacion publica de la familia) | ampliamente evaluado en MMLU, HumanEval y GSM8K | Apache 2.0 | HuggingFace, con cuantizaciones oficiales |
| Llama 3.1 8B | ≈8,03B | 128k | ampliamente evaluado | licencia comunitaria de Meta | HuggingFace, con cuantizaciones oficiales |
| Gemma 2 9B | ≈9,24B | 8k | ampliamente evaluado | terminos de uso de Gemma | HuggingFace, con cuantizaciones oficiales |

## Limitaciones y advertencias

- El autor indica de forma explicita "Do not deploy": el checkpoint no ha sido evaluado en capacidad, alineacion ni identidad, por lo que su comportamiento en produccion es impredecible.
- Licencia *research-only* (`license: other` con `license_name: research-only`): el uso comercial no esta permitido y no se ofrecen garantias de ningun tipo.
- Riesgo de alucinacion: desconocido en la practica, pero al tratarse de un ajuste sobre una ventana corta de datos autorreferidos existe riesgo de deriva estilistica y de respuestas menos ancladas que en el modelo base.
- Riesgo de olvido catastrofico: el entrenamiento actualiza todos los pesos, y no se ha publicado ninguna comparacion con el modelo base que cuantifique la degradacion en tareas generales.
- Contexto e idiomas: no se documentan, por lo que no puede asumirse ningun limite ni cobertura concreta.
- Contradiccion documental: la model card afirma que el corpus es autoescrito y, en el mismo texto, que contiene 0 documentos autoescritos y 5.014 de texto ordinario; cualquier conclusion sobre el grado de autoentrenamiento es, por tanto, insegura.
- Sin soporte verificado de *tool calling* ni de flujos de agente: no hay documentacion ni pruebas que lo respalden.
- Sesgos: no se ha realizado ninguna evaluacion de sesgos, toxicidad o sesgo de idioma.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Ausencia de cuantizaciones oficiales: cualquier uso en GPU de consumo exige convertir los pesos, con el riesgo de perdida de fidelidad que ello implica.
- Trazabilidad limitada: el repositorio *welfare-improvements* se menciona como marco del experimento, pero no se proporciona su URL en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-const-identified-sdf
- Corpus de entrenamiento: https://huggingface.co/datasets/joshycodes/qwen-constitutional-sdf-corpus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio *welfare-improvements* (marco, plan y evaluacion segun el autor): URL no disponible en la informacion suministrada
- Paper, blog o demo asociados: no disponible
