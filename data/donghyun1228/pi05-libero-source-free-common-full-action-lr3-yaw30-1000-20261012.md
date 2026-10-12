# Donghyun1228/pi05-libero-source-free-common-full-action-lr3-yaw30-1000-20261012

## Resumen

Este repositorio contiene una política de robótica de tipo vision-language-action (VLA) publicada por el usuario Donghyun1228 bajo la librería openpi. Se trata de un experimento de comparación de capacidad ("source-free capacity comparison") sobre el modelo pi05 de la familia openpi, entrenado para el benchmark de manipulación LIBERO. El identificador del modelo incluye las condiciones del experimento: full_action_lr3, yaw30 y 1000 actualizaciones.

El objetivo del experimento es comparar distintas estrategias de ajuste (experto de acción completo frente a LoRA de acción frente a solo visión) sin utilizar observaciones del dominio origen ("source-free"). El autor reporta una evaluación exploratoria completada de 400 episodios en LIBERO con un resultado de 309/400 (77,25%) para la condición yaw30. No se utilizaron observaciones fuente, caché de profesor emparejado, rollouts exitosos ni retroalimentación de éxito de tarea durante el entrenamiento.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, orientado a reproducir ablaciones de entrenamiento de políticas robóticas en simulación con MuJoCo 3.2.3. No es un modelo de lenguaje de propósito general ni un asistente conversacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA (vision-language-action) sobre openpi pi05; backbone de lenguaje Gemma de ~300 M de parametros segun la model card; experto de accion con flow matching; codificador de vision y codificador de muñeca (wrist) |
| Parametros totales | No disponible (la model card solo indica un backbone "gemma300m"; no se explicita el total) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 para inferencia; parametros descongelados en FP32 durante el entrenamiento; no se mencionan formatos GGUF, INT8 ni INT4 |
| Idiomas soportados | No disponible (modelo de robotica, no orientado a texto conversacional) |
| Licencia | No disponible |
| Formato de pesos | Empaquetado para la libreria openpi (pesos de despliegue incluidos); no se especifica safetensors ni GGUF; repositorio de 7,7 GB |
| Tamano del repositorio | 7,7 GB |
| Version evaluada (revision) | a20b360e8de97bd83a237cc68ea54f37c4dfda12 (solo metadatos de resultados; pesos y codigo sin cambios) |
| Loader de inferencia | Commit 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08, config pi05_libero_source_free_split_vision_idm (74 leaves) |

## Arquitectura y entrenamiento

Se trata de una política VLA basada en la arquitectura pi05 del ecosistema openpi. El grafo de lenguaje corresponde a un Gemma de aproximadamente 300 M de parametros sin LoRA en esta variante. El modelo incorpora un experto de accion (con 11 leaves/hojas entrenables) y un modulo de vision, ademas de un codificador de muñeca (wrist encoder) que en despliegue utiliza los pesos originales del modelo fuente de forma fija. El grafo completo de la política (config pi05_libero_source_free_split_vision_idm) comprende 74 leaves y activos de normalizacion.

El entrenamiento consistio en 1000 actualizaciones "target-only IDM" con batch 32, entrenando de forma conjunta la vision y el experto de accion completo. Las actualizaciones de accion se multiplican por 3,0 tras el paso nativo de AdamW. El LLM base y las proyecciones de entrada/salida de accion y tiempo permanecieron congelados. Un detalle metodologico importante: los parametros fuente recien descongelados estuvieron en FP32 durante el entrenamiento, mientras que los controles con LoRA mantuvieron el experto de accion subyacente en BF16, de modo que las comparaciones full-versus-LoRA tambien incluyen un cambio de precision. La inferencia usa el cargador de politica BF16 sin cambios. Solo se encolo la condicion yaw30 para este experimento full3; no se ejecuto la condicion de vista. No se uso fuente de observaciones, profesor emparejado ni retroalimentacion de exito.

## Capacidades

- Manipulacion robotica multitarea en simulacion: resuelve tareas de las suites Spatial, Object, Goal y Long de LIBERO.
- Control visuomotor basado en imagenes: integra un codificador de vision y un codificador de muñeca para la politica de accion.
- Generacion de acciones mediante experto de accion con flow matching (politica pi05).
- Condicionamiento por angulo de guiñada (yaw30) como variable de control en el entrenamiento.
- Aprendizaje "source-free": entrenamiento sin observaciones del dominio origen, segun la model card.
- No se documentan capacidades de tool calling, function calling, agentes, dialogo multilingue, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de ablaciones de capacidad en VLA: el modelo sirve para comparar expertos de accion completos frente a LoRA y frente a solo vision bajo un protocolo controlado de 1000 actualizaciones, util para investigacion sobre estrategias de ajuste eficiente.
- Investigacion en adaptacion "source-free": permite estudiar como se comporta una politica cuando no se dispone de observaciones del dominio origen ni de profesor emparejado.
- Evaluacion en el benchmark LIBERO con MuJoCo 3.2.3: punto de partida reproducible para medir exito en las cuatro suites (Spatial, Object, Goal, Long) con diez ensayos por tarea y seed 17.
- Estudio de inicializacion de pesos: el experimento enlaza el experto de accion a hashes FP32 canonicos y equivalencia BF16 del origen, por lo que sirve para analizar el efecto de la precision de inicializacion.
- Base para transferencia a robot real: dado que incluye todos los pesos de despliegue y activos de normalizacion, puede emplearse como punto de partida en pipelines de politica pi05, aunque la validacion en hardware real no esta documentada.
- Auditoria metodologica de comparaciones no emparejadas: util como caso de estudio sobre como reportar comparaciones descriptivas con ruido no sembrado y etiquetas de exito evaluadas solo sobre las politicas.

## Benchmarks y rendimiento

Evaluacion exploratoria completada de 400 episodios (diez ensayos por tarea, seed 17, ocho clientes por GPU en GPUs 0-3, inferencia BF16 sin cambios, cero errores de rollout, sin parada temprana por umbral):

| Suite | Resultado |
|---|---:|
| Spatial | 95/100 |
| Object | 65/100 |
| Goal | 87/100 |
| Long | 62/100 |
| Total | 309/400 (77,25%) |

Comparativa con controles de 1000 actualizaciones y 400 episodios (el autor la describe como descriptiva y no emparejada, ya que el ruido de politica no esta sembrado y semillas de entorno iguales no garantizan observaciones iniciales iguales):

| Control emparejado (1000 updates / 400 episodios) | Exitos | Candidato menos control (pp) |
|---|---:|---:|
| Experto de accion completo, multiplicador 0,1 | 166/400 | +35,75 |
| LoRA de accion, multiplicador 1,0 | 180/400 | +32,25 |
| LoRA de accion, multiplicador 0,1 | 134/400 | +43,75 |
| Solo vision | 134/400 | +43,75 |
| Experto de accion completo, multiplicador 1,0 | 268/400 | +10,25 |

El autor advierte que esta no es una confirmacion de 2000 episodios, ni una prueba estadistica de retencion, ni una busqueda del multiplicador optimo, ni una comparacion causal puramente arquitectonica.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo pertenece a la familia openpi pi05 (Physical Intelligence), por lo que sus alternativas naturales serian la politica base pi05 y variantes pi0, asi como politicas VLA como OpenVLA. Sin embargo, la informacion facilitada no incluye parametros, contextos, licencias ni resultados de benchmark de esos modelos alternativos, de modo que cualquier comparacion numerica seria inventada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Este modelo (pi05-libero source-free full3) | No disponible | No disponible | No disponible | HuggingFace | Resultados LIBERO y controles (ver arriba) |
| pi05 base (openpi) | No disponible | No disponible | No disponible | No disponible | No disponible |
| pi0 (openpi) | No disponible | No disponible | No disponible | No disponible | No disponible |
| OpenVLA | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica permiso de uso comercial, por lo que no puede asumirse su reutilizacion en produccion.
- Cero descargas y cero likes en el momento de la consulta, y autor con actividad limitada: no hay validacion externa ni comunidad que respalde el artefacto.
- Las comparaciones del autor son explicitamente descriptivas y no emparejadas; no constituyen prueba estadistica de retencion ni de superioridad causal.
- Los resultados de ablacion mezclan cambios de entrenabilidad y de precision (FP32 en parametros descongelados frente a BF16 en los controles LoRA), por lo que no aislar el efecto arquitectonico puro.
- Solo se ejecuto y encolo la condicion yaw30; la condicion de vista no se probo. No se reclama ningun resultado full3 de vista.
- El propio autor afirma que "retention is not established" (la retencion no esta establecida).
- No se aporta referencia de repositorio publico verificado para la fuente heredada ("legacy source"); los pesos de despliegue se incluyen, pero la procedencia completa no esta verificada.
- Dependencia estricta de entorno: requiere MuJoCo 3.2.3 para LIBERO; cambios de version pueden alterar la reproducibilidad.
- Evaluacion limitada a simulacion LIBERO (cuatro suites); no hay validacion documentada en robot real ni en dominios fuera de LIBERO.
- Al ser una politica de accion y no un modelo de lenguaje conversacional, no aplican de forma directa consideraciones de alucinacion textual, pero si el riesgo de acciones fuera de distribucion cuando la observacion difiere del dominio de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-full-action-lr3-yaw30-1000-20261012
- Repositorio, paper, blog o demo: no disponible en la informacion proporcionada.
- Referencia de repositorio publico verificado de la fuente heredada: no disponible.
