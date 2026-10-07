# Goghor/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-INT8-W8A16-MTP

## Resumen

El modelo identificado como `Goghor/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-INT8-W8A16-MTP` es un artefacto publicado en HuggingFace por el usuario Goghor, con un total real de 27.781.427.952 parametros (unos 27,78 mil millones) verificado a partir de los ficheros safetensors. La etiqueta de arquitectura declarada en el repositorio es `qwen3_5`, lo que apunta a que deriva de la familia Qwen3.5, aunque no se proporciona ninguna model card con informacion tecnica: el README se limita a la declaracion de licencia Apache-2.0. El nombre del repositorio sugiere una fusion de fine-tunes (los fragmentos "Fable", "Cold Fusion", "735-882") sobre una base Qwen, con una capa de desalineacion de seguridad ("Heretic-Uncensored"), y una cuantizacion a INT8 con activaciones en W8A16 mediante el formato `compressed-tensors`.

El interes de este tipo de publicaciones es doble. Por un lado, documenta un flujo de trabajo habitual en la comunidad: tomar un modelo base grande, aplicar merges de pesos entre adaptadores o checkpoints afinados, y redistribuirlo ya cuantizado para reducir el coste de despliegue. Por otro, es un ejemplo claro de artefacto de trazabilidad baja: cero descargas, cero valoraciones, sin pipeline declarado, sin idiomas declarados, sin datos de entrenamiento y sin benchmarks. El sufijo "MTP" podria indicar soporte de multi-token prediction, pero no hay documentacion que lo confirme.

Por tanto, esta ficha debe leerse como un analisis de lo que el repositorio declara y de lo que es verificable (tamano, formato, licencia, huella en disco), no como una evaluacion de capacidades reales. Cualquier uso en produccion exigiria una evaluacion propia, dado que no existe informacion publicada sobre el proceso de entrenamiento, la composicion del dataset ni el impacto de la cuantizacion sobre la calidad final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta de HuggingFace es `qwen3_5`, lo que sugiere un transformer decoder-only de la familia Qwen3.5; no hay confirmacion del autor |
| Parametros totales | 27.781.427.952 (~27,78 B), dato real de los safetensors |
| Parametros activos | No aplica / no disponible. No hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 con activaciones W8A16, formato `compressed-tensors`. Otras cuantizaciones: no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors (cuantizados con `compressed-tensors`) |
| Tamano del repositorio | 31,6 GB |
| Pipeline declarado | No disponible |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |
| Descargas / valoraciones | 0 / 0 |
| Region declarada | `region:us` |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. El unico indicio tecnico es la etiqueta `qwen3_5` del repositorio y el propio nombre del modelo, que sugiere una base de la familia Qwen3.5 de aproximadamente 27-28 mil millones de parametros. Los fragmentos del nombre ("Fable", "Cold Fusion", "735", "882") siguen convenciones habituales de merges de pesos entre checkpoints, pero no existe ningun documento que describa que checkpoints se combinaron, con que proporciones ni con que metodo (por ejemplo, SLERP, TIES o DARE). Tampoco hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF, DPO u otra fase de alineamiento.

La parte verificable es el pipeline de cuantizacion: los pesos estan almacenados en formato `compressed-tensors` con esquema INT8 para los pesos y W8A16 para las activaciones, es decir, pesos cuantizados a 8 bits con activaciones de 16 bits durante la inferencia. Esta es una configuracion orientada a reducir el uso de memoria sin recurrir a cuantizaciones de 4 bits, que degradan mas la calidad. El sufijo "MTP" podria corresponder a multi-token prediction (prediccion de varios tokens por paso), una tecnica empleada en modelos recientes para acelerar la decodificacion, pero el repositorio no incluye ninguna confirmacion ni configuracion asociada. El termino "Uncensored" o "Heretic" indica, en la practica del ecosistema, que se ha aplicado algun procedimiento de ablacion o fine-tune para reducir el rechazo de peticiones, sin que se documente el metodo.

## Capacidades

- Generacion de texto y razonamiento general: presumiblemente heredadas del modelo base Qwen3.5, pero no verificadas ni documentadas en el repositorio.
- Generacion de codigo y matematicas: no disponible.
- Vision o audio: no disponible; la etiqueta del repositorio apunta a un modelo de texto.
- Tool calling / function calling: no disponible; no se declara soporte ni plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas de la ficha de HuggingFace esta vacio.
- Modo de razonamiento explicito (thinking mode): no disponible, aunque es una caracteristica comun en la familia Qwen3.
- Decodificacion especulativa o multi-token prediction: posible por el sufijo "MTP" del nombre, sin confirmar.
- Comportamiento sin filtros de seguridad: implicito en los terminos "Uncensored" y "Heretic" del nombre; no hay documentacion sobre el alcance de esa desalineacion.

## Casos de uso

- Evaluacion comparativa de merges comunitarios: el modelo sirve como sujeto de prueba para medir si un merge de fine-tunes sobre una base de ~28 B conserva las capacidades del original. Se usaria ejecutando el mismo conjunto de prompts contra el modelo base y contra este artefacto, con metricas objetivas.
- Estudio del impacto de la cuantizacion INT8 W8A16: al distribuirse unicamente en `compressed-tensors` INT8, permite medir la degradacion respecto a los pesos en BF16 del modelo de origen en tareas de razonamiento y codigo.
- Inferencia local en estaciones de trabajo con GPU de 40-48 GB: con ~28 GB de pesos, el modelo cabe en una A100 40 GB o una RTX 6000 Ada 48 GB, lo que habilita prototipos de asistente tecnico sin depender de APIs externas.
- Generacion de texto sin restricciones tematicas para investigacion sobre seguridad: util para estudiar comportamientos de modelos desalineados en entornos controlados y con supervision, comparando tasas de respuesta ante peticiones problematicas.
- Base para fine-tunes posteriores en dominio concreto: al estar bajo Apache-2.0 y en safetensors, se puede cargar con `transformers` y aplicar LoRA sobre las capas no cuantizadas, si la implementacion lo permite.
- Pipeline de pruebas de reproducibilidad: sirve como caso de estudio de artefactos sin model card, para disenar politicas internas de aprobacion de modelos en una organizacion antes de incorporarlos a produccion.
- Servicio de chat experimental de baja concurrencia: con vLLM o TGI sobre una unica GPU de 48 GB, se puede exponer un endpoint interno siempre que se acepten los riesgos de contenido no filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y tampoco hay comparaciones con el modelo base ni con los checkpoints que supuestamente se fusionaron.

## Requisitos de hardware

- VRAM estimada para inferencia en INT8: aproximadamente 28-30 GB solo para los pesos, mas la cache KV. Con contexto largo y lotes pequenos, es razonable planificar 32-40 GB totales. Estimacion propia basada en el numero de parametros y el esquema W8A16; no confirmada por el autor.
- VRAM estimada si se reconvirtiera a BF16/FP16: en torno a 56 GB solo de pesos, mas cache KV.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. Con dos RTX 4090 de 24 GB (48 GB agregados) seria viable mediante tensor parallelism, asumiendo soporte en el runtime elegido.
- GPU de consumo: no cabe en una unica GPU de 24 GB en INT8 (28 GB de pesos). Si se generase una cuantizacion GGUF de 4 bits, quedaria en torno a 15-16 GB y podria caber en una RTX 4090 o RTX 3090 de 24 GB, pero esa cuantizacion no esta publicada en el repositorio.
- Opciones de despliegue: vLLM y TGI son las opciones mas plausibles para el formato `compressed-tensors`; `transformers` con `compressed-tensors` para inferencia directa. llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion que no se ha publicado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Goghor/Qwen3.8-27B-TURBO-...-INT8-W8A16-MTP | ~27,78 B | No disponible | Apache-2.0 | safetensors INT8 (`compressed-tensors`) | Repositorio con 0 descargas |
| Qwen3-32B | ~32,8 B | 32.768 tokens nativos, ampliable a 131.072 | Apache-2.0 | safetensors (BF16), GGUF comunitario | Ampliamente disponible |
| Mistral-Small-3.1-24B | ~24 B | 128.000 tokens | Apache-2.0 | safetensors | Ampliamente disponible |
| Gemma 3 27B | ~27 B | 128.000 tokens | Licencia Gemma | safetensors | Ampliamente disponible |

Nota: los datos de las alternativas proceden de sus fichas publicas y pueden variar segun la version consultada. No se dispone de resultados de benchmarks de este modelo que permitan una comparacion de rendimiento, por lo que la tabla se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: el README solo contiene la declaracion de licencia. No hay informacion sobre datos de entrenamiento, hiperparametros, metodo de merge ni evaluacion.
- Trazabilidad nula: el nombre del modelo apila multiples etiquetas de merges y fine-tunes sin documentar. No es posible reproducir el artefacto ni auditar su procedencia.
- Desalineacion de seguridad declarada: los terminos "Uncensored" y "Heretic" indican que se ha reducido o eliminado el rechazo de peticiones. Esto implica riesgo elevado de generar contenido danino, ilegal o sesgado, y hace desaconsejable su despliegue en aplicaciones orientadas al publico sin filtros externos y supervision humana.
- Riesgo de alucinacion: no cuantificado, pero previsible en un modelo de este tamano sin datos de evaluacion.
- Impacto de la cuantizacion INT8: aunque W8A16 es menos agresiva que las cuantizaciones de 4 bits, puede degradar tareas sensibles a la precision numerica, como matematicas o razonamiento encadenado. No hay mediciones publicadas.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto real y los idiomas soportados. No se debe asumir herencia directa de las especificaciones de Qwen3.5.
- Licencia: el repositorio declara Apache-2.0, pero al derivar de un modelo base de terceros, la licencia efectiva puede estar condicionada por la del modelo original. Conviene verificar los terminos aplicables antes de uso comercial.
- Soporte y mantenimiento: cero descargas y cero valoraciones en el momento de la consulta, sin historial de issues ni actualizaciones. No hay garantia de correccion de errores ni de soporte.
- Longevidad del formato: `compressed-tensors` requiere versiones recientes de las librerias de inferencia; puede haber incompatibilidades con toolchains antiguas.
- No existe cuantizacion GGUF publicada, lo que limita el despliegue en entornos de CPU o GPU de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Goghor/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-INT8-W8A16-MTP
- Paper, blog, repositorio o demo oficial: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados no guardan relacion con el artefacto y se han descartado.
