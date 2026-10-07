# nativ-community/clef-MLX-MXFP4

## Resumen

clef-MLX-MXFP4 es una conversion al ecosistema MLX del modelo Cloudflare/clef, publicada por la organizacion nativ-community. Clef no es un modelo generativo al uso: se define como un "decision model" multimodal (pipeline image-text-to-text) que recibe una peticion junto con un conjunto de opciones y devuelve, en un unico forward pass, una probabilidad para cada opcion de cada pregunta planteada. No produce texto libre. Esta orientado a tareas de enrutamiento, clasificacion y decision estructurada sobre entradas que pueden combinar texto e imagen.

El artefacto que nos ocupa no es un entrenamiento nuevo, sino una cuantizacion a MXFP4 (4 bits, group size 32) del modelo base Cloudflare/clef, empaquetada en safetensors y preparada para mlx-vlm. El recuento real de parametros del repositorio es de 27.484.784.881 (aproximadamente 27,5 mil millones), y el repositorio ocupa 15,5 GB. La licencia es Apache 2.0, lo que facilita su uso comercial sin las restricciones tipicas de otros modelos abiertos.

Su relevancia actual es doble. Por un lado, permite ejecutar un modelo de decision multimodal de ~27,5B en Apple Silicon gracias a MLX y a la cuantizacion de 4 bits. Por otro, su comunidad mantiene una verificacion funcional frente a la referencia en PyTorch (bf16) del modelo original: coincide en la respuesta en 11/11 preguntas de prueba (8 de texto y 3 de imagen), con una diferencia maxima de probabilidad de 0,081, lo que da una idea del error introducido por la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision multimodal image-text-to-text, derivado de Cloudflare/clef) |
| Parametros totales | 27.484.784.881 (segun safetensors) |
| Parametros activos | no aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, group size 32); el modelo base de referencia esta en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura interna concreta de Cloudflare/clef (tipo de transformer, atencion, vision encoder, etc.). Lo que si se documenta es su comportamiento: es un modelo de decision multimodal que, dada una entrada (texto, imagen o ambas) y una definicion de preguntas con opciones, devuelve una probabilidad por opcion. No genera texto, sino que puntua alternativas en una sola pasada hacia delante.

Este repositorio concreto no entrena nada: es una conversion y cuantizacion del checkpoint Cloudflare/clef (revision `ed3eed331870db2eff4b0db01237128ede8a00ce`) al formato MLX, con cuantizacion MXFP4 de 4 bits y tamano de grupo 32. La model card declara que se ha verificado contra la referencia en PyTorch (bf16) del modelo original sobre 11 preguntas (8 de texto, 3 de imagen), obteniendo la misma respuesta en las 11 y una diferencia maxima de probabilidad de 0,081. No hay datos publicos sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF/DPO.

## Capacidades

- Decision estructurada: dado un conjunto de opciones etiquetadas y unos criterios, devuelve la probabilidad de cada opcion en un unico forward pass.
- Soporte de multiples preguntas simultaneas: el modelo puede resolver varias decisiones (por ejemplo, distintos campos o criterios) a la vez sobre una misma entrada.
- Entrada multimodal image-text-to-text: acepta texto e imagen como entrada, segun el pipeline declarado.
- Integracion con mlx-vlm: funciona a traves de la funcion `predict` del ecosistema mlx-vlm (rama en desarrollo `feat/clef`).
- No genera texto: no es una capacidad de generacion, resumen ni chat conversacional. Su salida es una distribucion de probabilidad sobre opciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan documentados).
- Capacidades especiales: el propio modo de "decision model" es la capacidad diferencial; no se documentan modos de pensamiento, audio ni otras modalidades.

## Casos de uso

- Enrutamiento de tickets de soporte: tal como muestra la propia model card, se puede usar para decidir a que equipo (facturacion, tecnico, ventas) corresponde una incidencia a partir del texto del ticket, devolviendo la opcion con mayor probabilidad y evitando generar una respuesta.
- Triaje de solicitudes con multiples campos: al resolver varias preguntas en un solo forward pass, encaja en pipelines donde hay que rellenar simultaneamente categoria, prioridad y responsable de una misma peticion.
- Clasificacion de imagenes con criterios definidos: el soporte image-text-to-text permite etiquetar imagenes segun criterios configurables (por ejemplo, tipo de producto o presencia/ausencia de un elemento), sin depender de una lista de clases fija en el entrenamiento.
- Moderacion y filtrado asistido: usar las probabilidades por opcion para decidir si un contenido entra en una categoria sensible, aprovechando la salida probabilistica para fijar umbrales.
- Automatizacion de decisiones en pipelines internos: integrar la funcion `predict` en un servicio que reciba entrada y devuelva la opcion elegida, sustituyendo heuristicas o reglas fragiles por un modelo supervisado de decision.
- Enrutamiento por departamento o cola de trabajo: dado un mensaje entrante, asignarlo a una cola concreta segun criterios definidos en tiempo de inferencia, sin reentrenar para anadir nuevas opciones.
- Preetiquetado para anotacion humana: emplear la opcion de mayor probabilidad como sugerencia inicial en flujos de etiquetado, con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). El unico dato de evaluacion aportado es la verificacion frente a la referencia en PyTorch (bf16):

| Prueba | Resultado |
|---|---|
| Coincidencia de respuesta con la referencia torch (bf16) | 11/11 preguntas (8 de texto, 3 de imagen) |
| Diferencia maxima de probabilidad frente a la referencia | 0,081 |

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 15,5 GB en MXFP4 (4 bits), por lo que se necesita al menos ese espacio mas el overhead de ejecucion. En la practica, se recomienda memoria unificada de 32 GB o superior en Apple Silicon.
- GPU recomendadas: no aplica en el sentido tradicional. Al ser una conversion MLX, el destino son chips de Apple (series M1/M2/M3/M4). No hay datos de ejecucion en GPU NVIDIA.
- Encaje en hardware de consumo: por tamano de pesos (~15,5 GB) entra en Macs con 32 GB de memoria unificada o mas; en configuraciones de 16 GB resultaria muy ajustado o inviable.
- Opciones de despliegue: mlx-vlm, requiriendo la version con soporte de clef todavia no publicada en release (`pip install "git+https://github.com/Lazarus-931/mlx-vlm.git@feat/clef"`). La aplicacion Nativ (Apple Silicon) es un entorno de ejecucion local relacionado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-MLX-MXFP4 (este) | 27,48B | no disponible | MXFP4 4 bits, group size 32 | apache-2.0 | HuggingFace (mlx) |
| Cloudflare/clef (modelo base) | no disponible (mismo origen) | no disponible | bf16 (torch) | apache-2.0 | HuggingFace |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos de decision multimodales comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva esta conversion.

## Limitaciones y advertencias

- No es un modelo generativo: cualquier caso de uso que espere texto libre, resumen o chat no encaja con este modelo.
- Dependencia de una rama no publicada: el soporte de clef en mlx-vlm no esta en una release estable, lo que implica instalar desde git y asumir el riesgo de cambios en la API.
- Verificacion limitada: la validacion frente a la referencia se realizo sobre solo 11 preguntas, con una discrepancia de hasta 0,081 en probabilidad. No hay garantia de comportamiento equivalente en dominios distintos.
- Ausencia de benchmarks publicos: no hay metricas estandar (MMLU, etc.) que permitan comparar su calidad frente a otros modelos.
- Idiomas no documentados: no se especifica que lenguas soporta, por lo que el comportamiento multilingue es incierto y debe validarse en el caso concreto.
- Sesgos conocidos: no disponible. Al derivar de Cloudflare/clef, heredaria los sesgos del modelo base, que no estan documentados.
- Riesgo de error en la decision: aunque no alucina texto, puede asignar alta probabilidad a una opcion incorrecta. Conviene calibrar umbrales y contemplar revision humana en decisiones sensibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de conservar avisos y licencia.
- Caveat de produccion: el recuento de descargas y likes es 0 en el momento de la consulta, y el repositorio se creo en octubre de 2026, por lo que la madurez y el soporte de la comunidad son reducidos.

## Enlaces

- HuggingFace: https://huggingface.co/nativ-community/clef-MLX-MXFP4
- Modelo base: https://huggingface.co/Cloudflare/clef
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama con soporte de clef: https://github.com/Lazarus-931/mlx-vlm.git (rama `feat/clef`, commit `04f79e84`)
- Nativ (ejecucion local en Apple Silicon): https://blaizzy.github.io/nativ/
