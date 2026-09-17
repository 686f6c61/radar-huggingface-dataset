# seungkukim/rldx1-ft-real6k-syn10k-idmpost-lr3e5-10k

## Resumen

RLDX-1 FT (`seungkukim/rldx1-ft-real6k-syn10k-idmpost-lr3e5-10k`) es un ajuste fino de tipo vision-language-action (VLA) orientado a robotica de manipulacion, desarrollado por el usuario seungkukim. Se trata de un fine-tune sobre el modelo base `rldx1-pt-real6k-syn10k-idmpost-60k`, preentrenado con un esquema de learning rate WSD hasta 60K pasos, y posteriormente adaptado al embodiment GR-1 Tabletop mediante 300 demostraciones nuevas. El checkpoint corresponde al "rung" de 10.000 de 20.000 pasos de fine-tuning.

El modelo forma parte del cohorte 3 de la comparativa RoboCurate V2, un experimento controlado sobre curacion de datos sinteticos. En concreto, esta variante combina datos reales con 10.000 clips sinteticos reetiquetados por un modelo IDM (Inverse Dynamics Model) ya post-entrenado, y se compara contra otras tres variantes del mismo rung (solo real, sintetico sin filtrar y sintetico filtrado por Pre-Contact). Su relevancia es, por tanto, fundamentalmente experimental: sirve para medir el efecto del filtrado y del reetiquetado sintetico en el rendimiento de politicas VLA.

El checkpoint pesa 13,8 GB en safetensors e incluye 6.912.896.320 parametros (aproximadamente 6,9 mil millones). No se publican datos sobre arquitectura interna, idiomas, benchmarks ni licencia concreta mas alla de la etiqueta `license: other`. El repositorio no registra descargas ni likes en el momento de la consulta, y se publico el 17 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo etiquetado como VLA, vision-language-action, para robotica) |
| Parametros totales | 6.912.896.320 (aproximadamente 6,9 mil millones) |
| Parametros activos | no aplica / no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible; la model card indica horizonte 16 y longitud de video 1 |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (`license: other`, sin texto de licencia publicado en la informacion disponible) |
| Formato de pesos | safetensors (solo pesos, sin estado del optimizador) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. El modelo esta etiquetado como VLA (vision-language-action) y su pipeline declarado en HuggingFace es `robotics`, lo que indica un modelo que consume observaciones visuales y produce acciones motoras, presumiblemente con un componente de lenguaje. El tamano de 6.912.896.320 parametros y un repositorio de 13,8 GB son compatibles con pesos en precision de 16 bits, aunque este extremo no se confirma en la model card.

El entrenamiento tiene dos fases documentadas. La primera es el preentrenamiento del modelo base `rldx1-pt-real6k-syn10k-idmpost-60k`, con un scheduler WSD (warmup-stable-decay) de 60K pasos y decaimiento a partir del paso 45K, entrenado sobre una mezcla de datos reales ("real6k") y 10.000 clips sinteticos reetiquetados por un IDM ya post-entrenado. La segunda fase es el fine-tune que da lugar a este checkpoint: 10.000 de 20.000 pasos, batch size 256, learning rate 3e-5 con scheduler coseno, warmup del 5 por ciento y `sdrop` de 0,5, sobre 300 demostraciones del embodiment GR-1 Tabletop marcado como `NEW_EMBODIMENT`. El horizonte de accion es 16 y la longitud de video es 1.

La innovacion metodologica del cohorte es la ablacion controlada sobre datos sinteticos: esta variante usa sintetico reetiquetado por IDM post-entrenado, y sus hermanas usan solo datos reales, sintetico sin filtrar o sintetico filtrado por Pre-Contact, todas al mismo rung de 10K. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni etapas de RLHF o DPO.

## Capacidades

- Control robotico de manipulacion: genera acciones motoras a partir de observaciones visuales, con horizonte de accion de 16 pasos.
- Adaptacion a un embodiment especifico: fine-tune sobre 300 demostraciones del entorno GR-1 Tabletop, orientado a tareas de mesa.
- Aprendizaje a partir de datos sinteticos reetiquetados: la mitad sintetica del entrenamiento procede de clips relabelados por un IDM post-entrenado.
- Integracion en el pipeline de investigacion RoboCurate V2 como brazo experimental del cohorte 3.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision implicita por su naturaleza VLA; el resto no disponible.

## Casos de uso

- Manipulacion de objetos sobre mesa (tabletop pick-and-place): el modelo se ha ajustado especificamente con 300 demostraciones del embodiment GR-1 Tabletop, por lo que es directamente aplicable a tareas de recogida y colocacion en superficies planas con ese montaje.
- Evaluacion comparativa de estrategias de curacion de datos: sirve como brazo experimental frente a las variantes solo-real, sintetico sin filtrar y Pre-Contact, permitiendo medir el efecto del reetiquetado por IDM en el exito de la politica.
- Investigacion sobre datos sinteticos en robotica: al haberse entrenado con 10.000 clips sinteticos relabelados, es util para estudiar hasta que punto el sintetico post-procesado sustituye a datos reales.
- Fine-tuning de politicas VLA en nuevos embodiments: el flujo documentado (base preentrenada + 300 demos de un nuevo embodiment + 10K pasos de fine-tune con lr 3e-5) es replicable como receta para adaptar el modelo a otras plataformas.
- Estudio de robustez y generalizacion: el horizonte de accion 16 y la longitud de video 1 permiten analizar comportamiento en regimenes de observacion de un unico frame.
- Base para destilacion o compresion: con 6,9 mil millones de parametros y pesos solo en safetensors, puede usarse como profesor para obtener variantes mas pequenas destinadas a inferencia en hardware embebido.
- Reproducibilidad academica: al publicarse unicamente pesos sin estado del optimizador, es adecuado para reproducir evaluaciones de inferencia, no para reanudar el entrenamiento exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exito, tasas de tarea ni comparaciones numericas entre los brazos del cohorte, y la busqueda web realizada no devolvio material tecnico relevante (unicamente resultados sin relacion, como la pagina de acceso de WhatsApp Web).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del numero de parametros, los pesos en 16 bits ocuparian del orden de 13,8 GB, a los que habria que sumar activaciones y buffers; en 8 bits serian aproximadamente 7 GB y en 4 bits aproximadamente 3,5 GB. Son estimaciones derivadas del recuento de parametros, no cifras confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo encaja en GPUs de centro de datos tipo A100 (40 o 80 GB), H100 o L40S para inferencia en 16 bits con margen para activaciones.
- Compatibilidad con GPU de consumo: no confirmada. Con cuantizacion a 8 o 4 bits podria caber en GPUs con 12-24 GB (por ejemplo, RTX 4090 o RTX 4080), pero no hay datos publicados de cuantizacion ni de compatibilidad con llama.cpp u Ollama para este modelo.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni frameworks roboticos concretos en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion mas directa es con los otros brazos del mismo cohorte RoboCurate V2, todos al rung de 10K y con el mismo fine-tune sobre GR-1 Tabletop.

| Modelo | Datos de entrenamiento | Base de preentrenamiento | Licencia | Estado |
|---|---|---|---|---|
| `rldx1-ft-real6k-syn10k-idmpost-lr3e5-10k` (este) | real6k + syn10k relabelado por IDM post-entrenado | `rldx1-pt-real6k-syn10k-idmpost-60k` | other | publico, 0 descargas |
| `rldx1-ft-real6k-lr3e5-10k` | solo real | no disponible | no disponible | referenciado como hermano |
| `rldx1-ft-real6k-syn10k-lr3e5-10k` | real + sintetico sin filtrar | no disponible | no disponible | referenciado como hermano |
| `rldx1-ft-real6k-syn10k-pcpass-lr3e5-10k` | real + sintetico filtrado por Pre-Contact | no disponible | no disponible | referenciado como hermano |

No se proporcionan comparaciones numericas entre estos brazos ni frente a modelos externos de robotica como OpenVLA, pi0 o RDT: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta analisis de sesgo demografico, visual ni de entorno.
- Riesgo de alucinacion: no aplica en el sentido textual habitual, pero en un modelo VLA existe riesgo de generar acciones incorrectas o fuera de distribucion ante observaciones no vistas durante el fine-tune.
- Limitaciones de contexto: el horizonte de accion es de 16 pasos y la longitud de video es 1, lo que restringe la planificacion a horizontes cortos y a observaciones de un unico frame.
- Especializacion estrecha: el fine-tune se realizo con 300 demostraciones de un unico embodiment (GR-1 Tabletop, `NEW_EMBODIMENT`), por lo que el rendimiento fuera de ese entorno no esta garantizado.
- Idiomas: no disponible; no hay informacion sobre capacidades linguisticas ni cobertura multilingue.
- Restricciones de licencia: la licencia es `other` y no se incluye el texto de la licencia en la informacion disponible, por lo que el uso comercial queda sin determinar y requiere consulta previa con el autor.
- Reanudacion de entrenamiento: se publican solo pesos, sin estado del optimizador, lo que impide continuar el entrenamiento desde el punto exacto.
- Madurez y adopcion: 0 descargas y 0 likes, sin validacion externa conocida; debe tratarse como artefacto de investigacion, no como componente listo para produccion.
- Trazabilidad de datos: no se detalla la composicion de "real6k" ni el procedimiento exacto de reetiquetado por IDM, lo que dificulta auditar la mezcla de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seungkukim/rldx1-ft-real6k-syn10k-idmpost-lr3e5-10k
- Modelo base de preentrenamiento: https://huggingface.co/seungkukim/rldx1-pt-real6k-syn10k-idmpost-60k
- Brazo hermano, solo datos reales: https://huggingface.co/seungkukim/rldx1-ft-real6k-lr3e5-10k
- Brazo hermano, sintetico sin filtrar: https://huggingface.co/seungkukim/rldx1-ft-real6k-syn10k-lr3e5-10k
- Brazo hermano, sintetico filtrado por Pre-Contact: https://huggingface.co/seungkukim/rldx1-ft-real6k-syn10k-pcpass-lr3e5-10k
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web no devolvio resultados tecnicos relacionados con el modelo.
