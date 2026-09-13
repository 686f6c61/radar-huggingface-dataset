# gleraTech/mini-qwen3.8-abliterated-27B

## Resumen

mini-qwen3.8-abliterated-27B es una cuantizacion GGUF del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED, publicada por el usuario gleraTech. El objetivo declarado por el autor es hacer viable la ejecucion de un modelo de 27B en hardware de consumo con 16 GB de memoria unificada: mientras que los pesos completos en BF16 ocupan unos 55 GB y una cuantizacion Q4 ronda los 16 GB, esta version en Q3_K_S se queda en aproximadamente 11,7 GB (3,59 bits por peso), dejando margen para el sistema y la ventana de contexto.

El modelo se apoya en la familia Qwen3 de Alibaba (Qwen Team) y hereda la abliteracion V3 de OBLITERATUS, que combina SVD iterativo con mezcla LEACE para eliminar direcciones de rechazo con una perdida reportada de 2,1 puntos porcentuales en MMLU. El recuento real de parametros en safetensors es de 27.320.697.856 (27,3B), con licencia Apache 2.0 y soporte declarado de ingles y aleman.

La relevancia actual es doble: por un lado, demuestra que un modelo denso de 27B puede comprimirse hasta un tamano manejable en equipos consumer; por otro, es un ejemplo de la tendencia de la comunidad a publicar variantes "abliterated" (sin capas de rechazo) fuera de los canales oficiales. El propio autor advierte de que el modelo no ha sido probado ("untested — use at your own risk"), y a fecha de creacion no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda de la familia Qwen3; la model card no detalla la arquitectura interna) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q3_K_S (3,59 BPW) via llama.cpp; al ser GGUF se pueden generar otras cuantizaciones con llama.cpp |
| Idiomas soportados | Ingles (en), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset. El modelo es una cuantizacion del checkpoint OBLITERATUS/Qwen3.8-27B-OBLITERATED, que a su vez deriva de Qwen3.8-27B del Qwen Team. La model card solo describe el proceso de cuantizacion (Q3_K_S con llama.cpp) y la modificacion previa de abliteracion, pero no las caracteristicas arquitectonicas del modelo base.

La innovacion tecnica relevante es el proceso de abliteration V3 aplicado por OBLITERATUS, que segun la model card emplea SVD iterativo combinado con LEACE para minimizar el dano de calidad, con un coste declarado de 2,1 puntos porcentuales en MMLU. Sobre ese checkpoint, gleraTech aplica una cuantizacion Q3_K_S para reducir el tamano de 55 GB (BF16) a unos 11,7 GB. No se documenta si hubo RLHF, DPO ni otras fases de alineamiento posteriores.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline indicado por la model card confirman uso de chat en ingles y aleman.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia estandar compatible con la API de HuggingFace.
- Ejecucion local: disenado especificamente para correr en llama.cpp y LM Studio, incluyendo maquinas con 16 GB de memoria unificada.
- Idiomas: soporte declarado de ingles (en) y aleman (de); no se mencionan otros idiomas.
- Sin capas de rechazo: al estar abliterated, no aplica filtros de negativa aprendidos, lo que cambia su comportamiento frente a contenido sensible.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito ("thinking mode") en la informacion disponible.

## Casos de uso

- Inferencia local en equipos consumer: el modelo esta pensado para ejecutarse en maquinas con 16 GB de memoria unificada (por ejemplo, portatiles con GPU integrada de gran capacidad), donde una cuantizacion Q4 no cabria con margen para el contexto.
- Asistentes conversacionales en ingles o aleman: puede integrarse en aplicaciones de chat multi-turno desplegadas en local mediante llama.cpp o LM Studio, sin depender de servicios en la nube.
- Procesamiento de texto sensible a la privacidad: al poder ejecutarse 100% en local, es apto para entornos donde los datos no pueden salir del equipo (documentacion interna, borradores, analisis de texto confidencial).
- Generacion de contenido en aleman: uno de los dos idiomas declarados, util para redaccion, resumen o traduccion asistida dentro del par en/de.
- Experimentacion con modelos "abliterated": sirve como banco de pruebas para estudiar el efecto de la abliteration y de la cuantizacion agresiva sobre la calidad del modelo.
- Prototipado rapido sin GPU dedicada: gracias a su tamano reducido, permite probar un modelo de 27B en portatiles o mini-PC antes de decidir un despliegue mayor.
- Base para fine-tuning ligero o comparativas: al ser GGUF, puede servir como referencia en estudios de cuantizacion (comparar Q3_K_S frente a Q4 o BF16 en tareas concretas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es el impacto de la abliteration sobre el modelo base: una perdida de 2,1 puntos porcentuales en MMLU atribuida al proceso OBLITERATUS V3. No se facilitan valores absolutos de MMLU, HumanEval, GSM8K ni de ningun otro benchmark, ni para este modelo ni para su base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,7 GB para los pesos en Q3_K_S; hay que sumar la memoria de la ventana de contexto y el overhead del runtime.
- Hardware objetivo: equipos con 16 GB de memoria unificada (la model card cita explicitamente esta configuracion como el escenario para el que se creo el modelo).
- GPU dedicadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.). Dado el tamano de 11,7 GB, encaja en GPUs consumer con 12 GB o mas de VRAM si se ejecuta en modo GPU completo.
- Despliegue: llama.cpp (`llama-cli -m ... -ngl 99`) y LM Studio son los dos metodos documentados por el autor.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano | Licencia |
|---|---|---|---|---|
| mini-qwen3.8-abliterated-27B (gleraTech) | 27,3B | GGUF Q3_K_S | ~11,7 GB | Apache 2.0 |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | 27,3B | safetensors BF16 (base) | ~55 GB segun la model card | No disponible |
| Qwen3.8-27B (Qwen Team) | 27,3B | safetensors BF16 (base) | No disponible | No disponible |

No se dispone de datos de rendimiento comparados entre estas variantes mas alla de la perdida de 2,1 puntos de MMLU atribuida a la abliteration. No se han identificado en la busqueda modelos alternativos de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Estado no probado: el propio autor etiqueta el modelo como "untested — use at your own risk", sin garantias de calidad ni de estabilidad.
- Perdida de rendimiento por abliteration: la eliminacion de direcciones de rechazo conlleva un coste declarado de 2,1 puntos porcentuales en MMLU, que se suma al impacto de la cuantizacion Q3_K_S (cuantizacion agresiva de 3,59 BPW).
- Degradacion por cuantizacion: Q3_K_S es una cuantizacion de baja precision; cabe esperar perdida adicional de calidad respecto a Q4 o BF16, aunque el autor no publica mediciones.
- Cobertura linguistica limitada: solo se declaran ingles y aleman; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que dificulta planificar usos con documentos largos.
- Contenido sin filtros: al ser un modelo abliterated, no aplica mecanismos de rechazo, lo que aumenta el riesgo de generar contenido inapropiado, sesgado o danino si no se anade una capa de moderacion externa.
- Sin validacion de la comunidad: cero descargas y cero "likes" en el momento de la consulta; no existe retroalimentacion de terceros que confirme su comportamiento real.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Qwen Team y del checkpoint de OBLITERATUS, ya que la informacion proporcionada no detalla sus licencias.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de fidelidad factual para esta cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gleraTech/mini-qwen3.8-abliterated-27B
- Modelo base (abliterated): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Qwen Team (modelo original): https://huggingface.co/Qwen
- OBLITERATUS (autor de la abliteration): https://huggingface.co/OBLITERATUS
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos correspondian a articulos no relacionados sobre carpetas de inicio de Windows en aleman), por lo que no se pueden aportar papers, blogs ni demos adicionales.
