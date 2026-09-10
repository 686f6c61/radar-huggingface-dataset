# mobilint/Llama-3.2-3B-Instruct-regulus-rb-usb

## Resumen

`mobilint/Llama-3.2-3B-Instruct-regulus-rb-usb` es un artefacto derivado de `meta-llama/Llama-3.2-3B-Instruct`, publicado por Mobilint y compilado y optimizado especificamente para la NPU de dicha empresa. No se trata de un modelo entrenado desde cero ni de un ajuste fino con datos propios: la model card indica que el repositorio proporciona "un modelo compilado y optimizado para hardware NPU de Mobilint", empaquetado para su despliegue sobre la pila de aceleracion de Mobilint y pensado para usarse dentro de ese entorno.

El modelo hereda por tanto las capacidades del Instruct de 3B de Meta (generacion de texto y dialogo, con soporte declarado para ingles, aleman, frances, italiano, portugues, hindi, espanol y thai), pero su interes practico esta en el formato de despliegue: la libreria declarada es `mobilint`, requiere `custom_code` y los pesos se distribuyen como `safetensors` dentro de un repositorio de 6,5 GB, lo que apunta a un paquete de inferencia especifico de plataforma mas que a un checkpoint estandar ejecutable en cualquier runtime.

Es relevante ahora porque ejemplifica una tendencia concreta en IA open source: la publicacion de artefactos verticales atados a aceleradores propietarios, que permiten llevar un LLM de 3B a dispositivos de borde con NPU dedicada. Conviene advertir de una discrepancia importante en los metadatos: el recuento real de parametros de los safetensors es de 394.002.432, muy inferior a los aproximadamente 3.000 millones del modelo base, por lo que los ficheros publicados no constituyen un checkpoint completo del modelo de Meta y su uso fuera del stack de Mobilint no esta garantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para este artefacto; el modelo base es un transformer decoder-only (Llama 3.2) |
| Parametros totales | 394.002.432 segun los safetensors publicados; el modelo base se denomina "3B" (aproximadamente 3.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | cuantizado (el metadato `base_model_relation: quantized` lo confirma); esquema exacto (INT8, INT4, etc.) no disponible |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.2 (el campo `license` de HuggingFace figura como `other`, con `license_name: llama3.2`) |
| Formato de pesos | safetensors, con `custom_code` y libreria `mobilint` (paquete compilado para NPU) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del artefacto mas alla de su condicion de modelo compilado para NPU. El modelo de origen, `meta-llama/Llama-3.2-3B-Instruct`, es un transformer decoder-only de la familia Llama 3.2 con atencion por causalidad; los detalles de capas, dimension de embeddings, cabezas de atencion y regimen de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se detallan en la model card de este repositorio.

La innovacion tecnica que define a esta publicacion no esta en el entrenamiento sino en el empaquetado: los pesos aparecen compilados y optimizados para ejecutarse sobre la pila de aceleracion de Mobilint, con logica personalizada (`custom_code`) y una libreria propia. El sufijo del identificador (`regulus-rb-usb`) sugiere un destino de despliegue sobre un dispositivo NPU en formato USB, aunque esta lectura es una inferencia a partir del nombre y no una afirmacion de la model card. El tag `base_model_relation: quantized` confirma que ha habido una reduccion de precision respecto al modelo original, pero no se especifica ni el esquema ni el calibrado empleado.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del Instruct de 3B de Meta.
- Instrucciones y dialogo: el modelo base esta ajustado para seguir indicaciones, por lo que cabe esperar respuestas formateadas y seguimiento de consignas.
- Multilingue: se declaran ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y thai).
- Inferencia en dispositivo de borde sobre NPU de Mobilint, que es el proposito explicito del paquete.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el pipeline declarado es exclusivamente `text-generation`.

## Casos de uso

- Despliegue embebido en producto final con NPU: al estar compilado para el stack de Mobilint, encaja en dispositivos que integren esa aceleracion y necesiten un asistente conversacional local sin depender de la nube.
- Asistente conversacional en el borde sin conectividad: un modelo de 3B permite mantener dialogos de asistencia al usuario en dispositivos aislados o con red intermitente, con los datos sin salir del equipo.
- Clasificacion y extraccion de informacion en documentos: generacion de resumenes, etiquetado de tickets o extraccion de campos estructurados en lotes, aprovechando el multilingue declarado.
- Generacion de contenido multilingue: redaccion de textos de marketing o soporte en las ocho lenguas declaradas, con el matiz de que la calidad relativa por idioma no esta documentada.
- Prototipado de producto sobre hardware Mobilint: validar latencia, consumo y viabilidad de una funcionalidad de lenguaje natural antes de invertir en un modelo mayor.
- Preprocesado en pipelines de datos: normalizacion, reescritura o filtrado de texto en un flujo local antes de enviarlo a un modelo mayor alojado en servidor.
- Educacion y demos tecnicas: puesto que el artefacto es pequeno y ligero en disco (6,5 GB de repositorio), sirve para demostraciones de inferencia local en ferias o entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El requisito funcional es una NPU de Mobilint: la model card afirma que el modelo esta empaquetado para su pila de aceleracion y que debe usarse dentro de ese entorno, de modo que no se garantiza su ejecucion en GPU de proposito general.
- VRAM estimada para el modelo base de 3.000 millones de parametros, por calculo aritmetico y no por dato publicado: aproximadamente 6,4 GB en FP16, 3,2 GB en INT8 y 2 GB en cuantizacion de 4 bits.
- Los safetensors de este repositorio suman 394.002.432 parametros, por lo que su huella en disco y memoria es sustancialmente inferior a la del modelo base; la cifra concreta de VRAM necesaria no esta disponible.
- GPU recomendadas: no disponible para este artefacto; en el caso del modelo base, una GPU consumer moderna con al menos 8 GB de VRAM seria suficiente en precision reducida.
- Cabe en GPU consumer: previsiblemente si en el caso del modelo base cuantizado (RTX 3060 de 12 GB, RTX 4070, RTX 4090), pero no hay confirmacion para este paquete.
- Opciones de despliegue: stack de Mobilint (libreria `mobilint` con `custom_code`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible, y en principio no esperable al tratarse de un artefacto compilado para hardware concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilint/Llama-3.2-3B-Instruct-regulus-rb-usb | 394.002.432 en safetensors publicados; base de aproximadamente 3.000 millones | no disponible | no disponible | llama3.2 | HuggingFace, atado al stack de Mobilint |
| meta-llama/Llama-3.2-3B-Instruct (modelo base) | aproximadamente 3.000 millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | llama3.2 | HuggingFace, pesos estandar ejecutables en multiples runtimes |
| Otros artefactos de la familia Llama 3.2 compilados para aceleradores | no disponible | no disponible | no disponible | llama3.2 | no disponible |

No se dispone de datos de benchmarks ni de artefactos comparables verificados dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Dependencia de hardware: el modelo esta compilado para la NPU de Mobilint y su uso esta previsto dentro de esa pila; fuera de ella puede no cargar o no funcionar.
- Discrepancia en el recuento de parametros: los safetensors suman 394.002.432 parametros frente a los aproximadamente 3.000 millones del modelo base, de modo que el repositorio no contiene un checkpoint completo y estandar del modelo de Meta.
- Cuantizacion no documentada: se sabe que hay reduccion de precision, pero no el esquema ni el impacto en calidad, lo que dificulta estimar la degradacion respecto al original.
- Sesgos conocidos: no documentados en este repositorio; el modelo hereda los sesgos del corpus de entrenamiento de Llama 3.2, no auditable a partir de la informacion disponible.
- Alucinacion: riesgo inherente a un modelo de 3.000 millones de parametros, especialmente en tareas de conocimiento factual y razonamiento largo; no se aportan evaluaciones de veracidad.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y la cobertura real de los ocho idiomas anunciados no viene acompanada de metricas por lengua, por lo que el rendimiento en hindi, thai o portugues puede ser desigual.
- Licencia: la licencia llama3.2 impone condiciones adicionales de uso comercial y obligaciones de atribucion; conviene revisar el texto completo antes de integrarlo en un producto.
- Adopcion nula y trazabilidad limitada: cero descargas y cero likes, creado y actualizado el 10 de septiembre de 2026, sin documentacion de entrenamiento ni evaluacion publicada. El material recuperado en la busqueda web no contiene informacion tecnica relevante sobre el modelo.
- Uso en produccion: sin benchmarks, sin detalle de cuantizacion y sin garantias de portabilidad, no es recomendable como componente critico sin una validacion previa en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobilint/Llama-3.2-3B-Instruct-regulus-rb-usb
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-1B/blob/main/LICENSE.txt
- Sitio de Mobilint: https://mobilint.com
- No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en la busqueda web realizada.
