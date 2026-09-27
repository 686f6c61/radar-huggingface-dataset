# CompiwerAI/Mtrini-27B-Tellus

## Resumen

Mtrini-27B-Tellus es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario CompiwerAI sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo con pesos propios, sino de un adaptador LoRA distribuido en formato PEFT (biblioteca `peft`), pensado para cargarse junto con el modelo base mediante `transformers` y `peft`. El repositorio se creó el 27 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", sin documentación técnica adicional más allá de una model card generada automáticamente por TRL.

La model card es prácticamente un esqueleto: no incluye descripción del dataset de entrenamiento, número de tokens, composición de datos, hiperparámetros, evaluaciones ni instrucciones de uso específicas del adaptador. El único contenido sustantivo son las versiones de framework empleadas (PEFT 0.21.0, TRL 1.14.0, Transformers 5.17.0, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.23.2) y un fragmento de código de ejemplo que, tal y como está publicado, no es ejecutable porque pasa `model="None"` y no referencia el adaptador.

Por tanto, la relevancia actual de esta ficha es limitada y de carácter metodológico: sirve como ejemplo de adaptador LoRA SFT de trazabilidad incompleta y como recordatorio de los datos mínimos que debería incluir cualquier adaptador antes de considerarse apto para producción (licencia, dataset, evaluación, formato de pesos y limitaciones). Cualquier dato sobre arquitectura, contexto, idiomas o rendimiento queda fuera de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. El adaptador se aplica sobre Qwen/Qwen3.8-27B; la arquitectura del modelo base no se describe en la model card |
| Parametros totales | no disponible. El nombre del repositorio sugiere 27B, pero la model card no confirma el recuento de parametros del modelo base ni del conjunto base + adaptador |
| Parametros activos | no disponible. No hay indicios de que el modelo base sea Mixture of Experts |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. El repositorio contiene un adaptador LoRA, no pesos cuantizados; no se documenta compatibilidad con cuantizaciones concretas (4 bits, 8 bits, GPTQ, AWQ, etc.) |
| Idiomas soportados | no disponible |
| Licencia | no disponible. El campo YAML contiene `licence: license` (sin identificador valido, sin enlace al texto) y la etiqueta de HuggingFace no resuelve a una licencia concreta |
| Formato de pesos | adaptador LoRA en formato PEFT (`library_name: peft`); el formato de serializacion de los ficheros no se especifica en la model card |
| Modelo base | Qwen/Qwen3.8-27B |
| Metodo de entrenamiento | SFT (supervised fine-tuning) mediante TRL |
| Versiones de framework | PEFT 0.21.0, TRL 1.14.0, Transformers 5.17.0, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.23.2 |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-09-27 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura del modelo. Lo unico documentado es que se trata de un adaptador PEFT con etiquetas `lora` y `sft`, lo que indica que el ajuste se realizo mediante Low-Rank Adaptation sobre un modelo base congelado, y que el objetivo de entrenamiento fue aprendizaje supervisado (pares instruccion-respuesta), no alineamiento por preferencias. No se especifica el rango del adaptador, los modulos objetivo, el `alpha`, el `dropout`, la tasa de aprendizaje, el numero de pasos, el tamano de lote ni la duracion del entrenamiento: la seccion "Training procedure" de la model card esta vacia.

Tampoco hay informacion sobre el dataset: ni procedencia, ni numero de tokens, ni idiomas, ni si hubo filtrado, deduplicacion o mezcla con datos sinteticos. Se desconoce si se aplicaron tecnicas adicionales como enmascarado de la perdida en el prompt, empaquetado de secuencias o decodificacion especulativa durante la inferencia. Las versiones de framework declaradas (PyTorch 2.11.0, Transformers 5.17.0, TRL 1.14.0) son posteriores a las publicadas en el momento de redactar esta ficha, lo que impide verificar la reproducibilidad del entrenamiento con un entorno estable conocido.

## Capacidades

No se ha publicado ninguna descripcion de capacidades especifica del adaptador. Dado que se trata de un ajuste LoRA sobre Qwen/Qwen3.8-27B, sus capacidades efectivas dependerian del modelo base, pero la informacion proporcionada no documenta ninguna de ellas:

- Generacion de texto: el pipeline declarado es `text-generation`, pero no hay ejemplos verificables de salida.
- Razonamiento, codigo, matematicas o vision: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ningun idioma.
- Capacidades especiales (modo "thinking", vision, audio, decodificacion especulativa): no disponible.

El unico ejemplo de uso publicado en la model card es una pregunta abierta ("If you had a time machine..."), lo que sugiere un uso conversacional generico, pero no constituye evidencia de capacidades concretas.

## Casos de uso

Los siguientes escenarios son aplicaciones potenciales derivadas del tipo de artefacto (adaptador LoRA conversacional), siempre condicionados a que el modelo base y la licencia lo permitan. No estan respaldados por evaluaciones del autor:

- Prototipado de asistentes conversacionales: el adaptador puede cargarse junto al modelo base con `transformers` y `peft` para experimentar con un tono o estilo de respuesta concreto, sin necesidad de reentrenar el modelo completo.
- Investigacion sobre ajuste eficiente: sirve como caso de estudio de un pipeline SFT con TRL y PEFT, util para comparar configuraciones de LoRA, tasas de aprendizaje y volumen de datos en modelos de gran tamano.
- Personalizacion de dominio mediante apilado de adaptadores: al ser un adaptador independiente, puede combinarse con otros adaptadores LoRA con `peft` para explorar mezclas de estilos o dominios, siempre que las licencias lo permitan.
- Evaluacion comparativa de adaptadores: puede incorporarse como linea base en estudios que midan la degradacion o mejora que introduce un ajuste SFT sobre el modelo base.
- Generacion de texto en entornos con memoria limitada para almacenamiento de pesos: un adaptador ocupa ordenes de magnitud menos que los pesos completos, lo que simplifica la distribucion y el versionado de variantes.
- Docencia y formacion tecnica: util como ejemplo reproducible (o no reproducible, segun el caso) de publicacion de adaptadores y de los errores habituales en model cards, como licencias sin identificar o fragmentos de codigo no ejecutables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni del adaptador ni del modelo base Qwen/Qwen3.8-27B dentro de la documentacion proporcionada. Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

No se han publicado requisitos de hardware para este adaptador. Las siguientes indicaciones son estimaciones generales basadas en el tamano implicito en el nombre del repositorio (27B) y deben tratarse como orientativas, no como datos verificados:

- El adaptador LoRA en si ocupa muy poco espacio (tipicamente decenas o cientos de MB), pero la inferencia requiere cargar el modelo base completo.
- Para un modelo denso de ~27B en precision de 16 bits, se necesitan aproximadamente 54 GB solo para pesos, mas memoria para el contexto y las activaciones; en cuantizacion de 8 bits, en torno a 27-30 GB, y en 4 bits, en torno a 15-18 GB.
- GPU de centro de datos: A100 80 GB, H100 80 GB o similares permiten servir el modelo sin cuantizar con margen para contextos largos.
- GPU de consumo: una RTX 4090 (24 GB) solo seria viable con cuantizacion agresiva de 4 bits y contextos moderados; tarjetas con 16 GB o menos probablemente no basten para un modelo de este tamano.
- Opciones de despliegue: vLLM o TGI para servir el modelo base y fusionar el adaptador; llama.cpp u Ollama si se generan pesos GGUF; `transformers` + `peft` para cargar el adaptador en caliente. Ninguna de estas rutas esta documentada por el autor para este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No hay datos de rendimiento del adaptador ni del modelo base en la informacion proporcionada, por lo que cualquier comparacion numerica seria inventada. Como referencia estructural, la unica comparacion posible es con el propio modelo base y con otros adaptadores LoRA publicados bajo el mismo esquema:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CompiwerAI/Mtrini-27B-Tellus | no disponible (nombre sugiere 27B) | no disponible | no disponible | no disponible | adaptador LoRA en HuggingFace |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card |
| Otros adaptadores LoRA SFT de la misma familia | no disponible | no disponible | no disponible | no disponible | no identificados en la informacion disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni pruebas de regresion. No hay evidencia de que el ajuste mejore al modelo base en ninguna tarea.
- Licencia indeterminada: el campo `licence: license` del YAML no es un identificador valido y la etiqueta de HuggingFace no resuelve a una licencia concreta. No se puede asumir uso comercial permitido; habria que contactar con el autor y verificar tambien la licencia del modelo base.
- Model card generica: contiene secciones vacias y un fragmento de codigo no ejecutable (`model="None"`, sin referencia al adaptador), lo que indica una publicacion sin validacion funcional.
- Trazabilidad del entrenamiento nula: se desconocen dataset, hiperparametros, numero de pasos y criterios de parada, lo que impide auditar el comportamiento del modelo o reproducir el ajuste.
- Riesgo de alucinacion y de sesgos: no evaluado ni documentado. Al no conocerse la composicion de los datos de SFT, no se puede descartar la amplificacion de sesgos, la memorizacion de datos de entrenamiento ni la degradacion del modelo base (olvido catastrofico).
- Idiomas y contexto sin especificar: no se declara cobertura multilingue ni longitud de contexto, de modo que no hay garantia de comportamiento correcto en castellano ni en conversaciones largas.
- Reputacion y soporte: 0 descargas y 0 likes, sin historial de mantenimiento, issues ni versiones. No se recomienda su uso en produccion en su estado actual.
- Inconsistencia temporal y de versiones: la fecha de creacion registrada (27 de septiembre de 2026) y las versiones de framework declaradas son posteriores a las disponibles habitualmente, lo que dificulta verificar el entorno de entrenamiento.
- No se debe aplicar el adaptador sin comprobar previamente la disponibilidad, el comportamiento y la licencia del modelo base Qwen/Qwen3.8-27B.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/CompiwerAI/Mtrini-27B-Tellus
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Framework TRL: https://github.com/huggingface/trl
- Paper de referencia de TRL: von Werra et al., "TRL: Transformers Reinforcement Learning", 2020 (https://github.com/huggingface/trl)

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo, su autor o su modelo base; los resultados obtenidos eran irrelevantes para la ficha.
