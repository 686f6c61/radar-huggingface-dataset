# jessedye90/qwen3.8-flash-next-swift-uncensored

## Resumen

jessedye90/qwen3.8-flash-next-swift-uncensored es un modelo multimodal (pipeline image-text-to-text) publicado por el usuario jessedye90 en HuggingFace, distribuido bajo la licencia swift-open-license-1.0 y con acceso restringido (gated). Se presenta como un derivado del modelo base jessedye90/Swift-1.5-Qwen3.8-Flash-Next-W4A16-GB10, sobre el que se ha aplicado un proceso de "abliteration" y desalineacion de seguridad, segun indican las etiquetas del repositorio (abliterated, uncensored). El repositorio declara un total de 129.435.434.899 parametros (aproximadamente 129,4 mil millones) y un tamano de 73,9 GB.

La nomenclatura y las etiquetas sugieren una arquitectura de mezcla de expertos (etiqueta moe) basada en la familia Qwen (etiquetas qwen3_8 y qwen4_exp), con soporte para prediccion multi-token (mtp), cuantizacion de 4 bits en el formato W4A16 con GPTQ, y compatibilidad con vLLM y con hardware NVIDIA GB10 (DGX Spark). El repositorio no incluye model card con detalles de entrenamiento, composicion del dataset, regimen de alineacion ni resultados de evaluacion, por lo que buena parte de las especificaciones tecnicas no estan disponibles.

Es relevante ahora porque combina tres tendencias simultaneas: modelos MoE de gran tamano con cuantizacion agresiva para despliegue en hardware compacto, capacidades multimodales imagen-texto, y una variante "sin censura" orientada a usuarios que necesitan eliminar filtros de rechazo. El hecho de que no tenga descargas ni likes en el momento de la consulta y que el acceso este restringido limita su validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "moe" sugiere mezcla de expertos de la familia Qwen) |
| Parametros totales | 129.435.434.899 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits W4A16, GPTQ, FP8 (segun etiquetas) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (categoria "other" en HuggingFace) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna mas alla de lo que indican las etiquetas del repositorio. La presencia de la etiqueta moe apunta a un transformer con mezcla de expertos, aunque se desconoce el numero de expertos, el enrutador utilizado y el numero de parametros activos por token. La etiqueta mtp sugiere soporte de prediccion multi-token, una tecnica de decodificacion que permite generar varios tokens por paso para aumentar el throughput. La etiqueta qwen4_exp sugiere que el modelo base se apoya en una variante experimental de la familia Qwen 4.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. La unica informacion disponible sobre el proceso de ajuste es que se trata de una variante "abliterated" y "uncensored", lo que implica la eliminacion o atenuacion de las capas de rechazo de seguridad respecto al modelo base. El modelo base declarado es jessedye90/Swift-1.5-Qwen3.8-Flash-Next-W4A16-GB10, tambien publicado por el mismo autor.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta conversational, por lo que esta orientado a dialogos multi-turno.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text, lo que implica entrada de imagenes junto a texto y salida textual.
- Codigo y razonamiento: no disponible (sin datos de evaluacion que lo confirmen).
- Matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (campo de idiomas vacio en el repositorio).
- Modo de pensamiento (thinking mode): no disponible.
- Audio: no disponible.
- Variante sin filtros de rechazo: el modelo esta etiquetado como abliterated y uncensored, lo que implica ausencia o atenuacion de mecanismos de negativa ante peticiones consideradas sensibles.

## Casos de uso

- Analisis de documentos con imagenes: el pipeline image-text-to-text permite procesar capturas, diagramas o escaneos junto a instrucciones textuales para extraer informacion estructurada, siempre que el modelo soporte la combinacion de modalidades.
- Generacion de descripciones de imagenes en pipelines de catalogacion: dado su caracter multimodal, podria emplearse para etiquetar productos o contenido visual en un CMS, aunque no hay datos de calidad que lo respalden.
- Despliegue en hardware compacto NVIDIA GB10 (DGX Spark): las etiquetas dgx-spark y gb10, junto a la cuantizacion W4A16 en 4 bits, apuntan a un uso previsto en estaciones de trabajo de gama compacta con memoria unificada.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated, sirve como objeto de estudio para medir el impacto de la eliminacion de capas de rechazo en el comportamiento del modelo.
- Generacion de codigo en produccion: no confirmado, dado que no hay datos de HumanEval ni soporte verificado de tool calling.
- Atencion al cliente automatizada: posible por la etiqueta conversational, pero sin datos sobre longitud de contexto ni idiomas soportados no se puede garantizar su idoneidad.
- Experimentacion con decodificacion multi-token: la etiqueta mtp permite evaluar tecnicas de prediccion multi-token sobre un modelo de 129B con cuantizacion de 4 bits.

Nota: los casos anteriores se derivan unicamente de las etiquetas del repositorio; no hay documentacion del autor que los valide.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes estimaciones de VRAM son calculos derivados del numero de parametros (129.435.434.899) y del tamano del repositorio (73,9 GB); no proceden de documentacion oficial.

- Pesos en BF16/FP16: aproximadamente 259 GB.
- Pesos en FP8/INT8: aproximadamente 129 GB.
- Pesos en 4 bits (W4A16): aproximadamente 65-74 GB, coherente con el tamano del repositorio de 73,9 GB.
- Cabe en GPU de consumo: no cabe en ninguna GPU de consumo actual con memoria unificada estandar (RTX 4090 dispone de 24 GB, RTX 5090 de 32 GB), salvo con tecnicas de offloading a RAM o disco.
- GPU recomendadas: no disponible en la documentacion, aunque la etiqueta GB10 (DGX Spark) sugiere que el autor lo orienta a ese hardware.
- Opciones de despliegue: vLLM (etiqueta explicita), y por compatibilidad con safetensors y transformers, potencialmente TGI; no se menciona llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Acceso | Rendimiento |
|---|---|---|---|---|---|
| jessedye90/qwen3.8-flash-next-swift-uncensored | 129,4 B | no disponible | swift-open-license-1.0 | Restringido (gated) | no disponible |
| jessedye90/Swift-1.5-Qwen3.8-Flash-Next-W4A16-GB10 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay informacion suficiente en el repositorio para identificar y comparar con modelos alternativos de la misma categoria (mismo rango de parametros o misma tarea multimodal).

## Limitaciones y advertencias

- Ausencia de model card: el repositorio no documenta arquitectura, datos de entrenamiento, evaluacion ni limitaciones conocidas.
- Acceso restringido: el modelo esta gated en HuggingFace y requiere aceptar condiciones, lo que dificulta su validacion y reproduccion por terceros.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual, y la condicion abliterated o uncensored no garantiza mejor precision, solo menos rechazos.
- Ausencia de filtros de seguridad: al estar etiquetado como abliterated y uncensored, el modelo puede generar contenido danino, ofensivo o ilegal sin las salvaguardas habituales. No es apto para uso comercial orientado al publico general.
- Restricciones de licencia: la licencia swift-open-license-1.0 debe revisarse en detalle antes de cualquier uso comercial; no se puede asumir permisividad por el nombre.
- Idiomas soportados desconocidos: el campo de idiomas esta vacio, lo que impide garantizar calidad fuera del ingles.
- Longitud de contexto desconocida: sin este dato no se pueden disenar aplicaciones que dependan de contextos largos.
- Parametros activos desconocidos: al tratarse de un MoE, se desconoce el coste real de inferencia por token, lo que impide estimar throughput con precision.
- Naturaleza experimental: la etiqueta qwen4_exp sugiere una base en fase experimental, con posible inestabilidad o cambios de comportamiento.
- Inconsistencia en la fecha de creacion: el repositorio figura como creado el 2026-10-05, fecha posterior a la actual; conviene verificar la integridad de los metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/jessedye90/qwen3.8-flash-next-swift-uncensored
- Modelo base: https://huggingface.co/jessedye90/Swift-1.5-Qwen3.8-Flash-Next-W4A16-GB10
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
