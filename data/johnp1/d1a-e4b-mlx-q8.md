# JohnP1/d1a-e4b-mlx-q8

## Resumen

D1A-E4B v0.5 · MLX 8-bit (identificador `JohnP1/d1a-e4b-mlx-q8`) es una version cuantizada para Apple Silicon de `JohnP1/d1a-e4b`, un modelo de decision abierto y de tamano reducido desarrollado por JohnP1. A diferencia de un modelo generativo convencional, D1A recibe un documento y un conjunto de preguntas tipadas (si/no, eleccion multiple, puntuacion) y devuelve, en una unica pasada hacia delante y sin generar texto, una probabilidad calibrada para cada opcion. Es, por tanto, un clasificador de decision con salida probabilistica, no un generador de lenguaje.

El modelo se construye sobre `google/gemma-4-E4B` (revision `411aa17b`) mediante un adaptador LoRA de rango 16 sobre las proyecciones de atencion y MLP (q, k, v, o, gate, up, down) y una pequena cabeza pointer de 256 dimensiones. La version cuantizada ocupa unos 6 GB en disco, mas aproximadamente 1 GB de codificadores de foto, voz y video. Con 7.463.013.376 parametros totales declarados en el repositorio, esta pensado para ejecutarse en equipos Apple Silicon.

Su relevancia actual radica en que expone la TypeSafe System One API (`POST /v1/systemone`), de modo que el SDK de TypeSafe y sus clientes existentes funcionan directamente contra el modelo. La version v0.5 recupera las capacidades de decision mas dificiles de su predecesor Kev (decisiones duras del 55 % al 71 %) manteniendo el etiquetado de pull requests, e incluye calibracion de temperatura (T = 1.78) para convertir las puntuaciones en probabilidades fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) y cabeza pointer de 256 dimensiones sobre `google/gemma-4-E4B` (revision `411aa17b`) |
| Parametros totales | 7.463.013.376 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como ventana de contexto; los estados de entrenamiento de v0.5 llegan hasta 6.400 tokens |
| Tipos de cuantizacion | MLX 8-bit: capas lineales y embeddings de tokens en 8-bit (grupo 64), embeddings por capa en 4-bit, cabeza pointer en fp32 |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (biblioteca MLX) |

## Arquitectura y entrenamiento

La base es `google/gemma-4-E4B`, sobre la que se anade un adaptador LoRA de rango 16 aplicado a las proyecciones de atencion y MLP (q, k, v, o, gate, up, down) y una cabeza pointer de 256 dimensiones que produce la distribucion de probabilidad sobre las opciones. El proceso de entrenamiento es acumulativo: cada version continua entrenando la anterior, de modo que v0.5 contiene todas las etapas previas. La calibracion se resuelve con una unica temperatura (T = 1.78) ajustada sobre filas agrupadas de validacion (split de calibracion de decision-v7 y conjunto de desarrollo de etiquetado de PR); el error de calibracion paso de 0.081 a 0.015 fuera de pliegue y se almacena en `d1a_config.json`.

El entrenamiento se organizo en etapas: v0.1 (decisiones generales, suite decision-v7 con unos 12.500 registros de conjuntos publicos de clasificacion mas datos generados de politicas y reglas), v0.2 (habilidades de Kev sobre fechas y evidencia ausente, decisiones duras, decisiones de herramienta de desarrollo y documentos largos, mas japones de JGLUE y enrutamiento de agentes), v0.3 y v0.4 (etiquetado de pull requests en ingles y japones) y v0.5, que entrena las particiones completas hard-v1 (6.000) y devtools-v1 (5.320), documents-v1 (1.000), JGLUE (650), etiquetas de PR (1.350) y replay de decision-v7 (1.000), sumando 15.320 registros, con 1 epoch, lr 2e-5, estados de hasta 6.400 tokens y 1.915 pasos en una A100 (precedidos de un piloto de 300 pasos sobre 2.400 registros en 2 GPUs distintas).

## Capacidades

- Clasificacion de decision con salida probabilistica: dado un documento y preguntas tipadas (si/no, eleccion, puntuacion), devuelve probabilidades calibradas en una sola pasada, sin texto generado.
- Decisiones generales y de politica: suite decision-v7, con un 85,3 % de acierto en el conjunto retenido.
- Decisiones dificiles (hard-v1): 71,5 % de acierto en 1.083 preguntas retenidas.
- Decisiones sobre herramientas de desarrollo (devtools-v1): 69,8 % de acierto en 1.074 preguntas.
- Manejo de documentos largos (documents-v1): 87,5 % en 920 casos.
- Etiquetado de pull requests: tipo de cambio, radio de impacto (blast radius) y severidad, en ingles y japones (tipo de cambio 89,7 % en ingles retenido).
- Enrutamiento de modelos y de agentes: 98,9 % en el conjunto generico (270) y 100 % en el etiquetado a mano (45).
- Soporte de japones mediante datos JGLUE (JNLI, JCommonsenseQA, JSTS): 82,1 % en desarrollo.
- Integracion con la TypeSafe System One API (`POST /v1/systemone`), compatible con el SDK de TypeSafe.
- Codificadores adicionales de foto, voz y video (aproximadamente 1 GB).

## Casos de uso

- Triage automatico de pull requests: el modelo clasifica cada PR con su tipo de cambio, severidad y radio de impacto, lo que permite priorizar revisiones y enrutar a los revisores adecuados; esta entrenado especificamente sobre PRs en ingles y japones.
- Enrutamiento de modelos y agentes: dado un documento y un conjunto de opciones de modelo o agente, devuelve la probabilidad de cada opcion (98,9 % en el conjunto generico de 270 casos), util para construir capas de direccionamiento en plataformas multiagente.
- Aplicacion de politicas y reglas de negocio: verificacion de si un documento cumple una regla concreta (preguntas tipo si/no), con probabilidad calibrada en lugar de texto libre.
- Clasificacion de documentos largos: categorizacion de contratos, informes o expedientes de hasta varios miles de tokens (entrenado con estados de hasta 6.400 tokens), con un 87,5 % en el conjunto documents-v1.
- Decisiones dificiles asistidas: soporte a decisiones ambiguas o de alto riesgo (hard-v1) donde se necesita una probabilidad explicita en lugar de una respuesta generada.
- Evaluacion de decisiones en japones: clasificacion de pares y preguntas en japones apoyandose en los datos JGLUE, con 82,1 % en desarrollo.
- Integracion en servicios existentes de TypeSafe: al hablar la System One API, puede desplegarse como backend de decision sin reescribir los clientes existentes.

## Benchmarks y rendimiento

Resultados en datos retenidos, sobre los builds MLX 8-bit, medidos con `d1a.eval.benchmark` a traves de la puerta de calidad de D1A (salvo donde se indique):

| Conjunto | v0.4 | v0.5 |
|---|---|---|
| Decisiones duras (hard-v1, 1.083 preguntas) | 55,2 % | 71,5 % |
| Decisiones de herramienta de desarrollo (devtools-v1, 1.074) | 63,8 % | 69,8 % |
| Documentos largos (documents-v1, 920) | 86,6 % | 87,5 % |
| Transferencia retenida v4 (764, fuentes nunca vistas) | 68,9 % | 71,6 % |
| Decisiones generales (decision-v7, 1.468) | 84,7 % | 85,3 % |
| JGLUE desarrollo (1.500, japones) | 81,0 % | 82,1 % |
| Enrutamiento de modelos: generico (270) / etiquetado a mano (45) | 97,4 % / 100 % | 98,9 % / 100 % |
| Agent factory desarrollo (640 preguntas) | 90,8 % | 90,5 % |
| Etiquetas de PR, ingles (953 PRs): tipo / severidad / radio de impacto | 87,7 % / 77,8 % / 54,0 % | 89,7 % / 75,6 % / 58,3 % |
| Etiquetas de PR, japones (92 PRs) | 74,1 % | 74,6 % |
| 39 PRs recientes de los repositorios del autor, etiquetas verificadas a mano: tipo / radio / severidad | 86,8 % / 87,2 % / 65,6 % | 84,2 % / 74,4 % / 65,6 % |

Notas de la model card: las filas de etiquetado de PR con superindices se puntuaron sobre el checkpoint bf16 de PyTorch con el contexto de servicio, de modo que cuenta cada PR; la ejecucion en 8-bit solo puntuo los 183 PRs de test mas cortos, con 82,2 % frente a 85,0 %. Los 39 PRs recientes vieron las etiquetas el 6 y 7 de octubre de 2026, revisadas por el autor en la pagina de revision del playground, que mostraba la respuesta de v0.4. Sobre 98 decisiones anteriores de ese job, con etiquetas de un bot de revision, el radio de impacto fue del 70 % (v0.4) frente al 63 % (v0.5) y el tipo del 86 % en ambos. Frente a la model card de Kev-4B (fp32, splits de desarrollo, comparacion aproximada): decisiones duras 78,6; herramientas de desarrollo 73,9; documentos largos 89,1; transferencia 81,7.

## Requisitos de hardware

- Espacio en disco: aproximadamente 6 GB para los pesos en MLX 8-bit, mas cerca de 1 GB de codificadores de foto, voz y video.
- Entorno objetivo: Apple Silicon con la biblioteca MLX. Al estar en formato MLX, no es directamente desplegable en vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- Memoria unificada: al ocupar unos 6 GB en disco, se espera que quepa en equipos Apple Silicon con memoria unificada suficiente (Mac con 16 GB o mas), aunque la model card no especifica un minimo exacto.
- GPU de entrenamiento de referencia (no de inferencia): una L4 (v0.4, 1.443 pasos) y una A100 (v0.5, 1.915 pasos); v0.5 uso ademas un piloto de 300 pasos en 2 GPUs.
- Latencia y throughput de inferencia: no disponibles.
- Opciones de despliegue conocidas: ejecucion nativa con MLX y exposicion a traves de la TypeSafe System One API (`POST /v1/systemone`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| D1A-E4B v0.5 MLX 8-bit (este) | Modelo de decision cuantizado MLX 8-bit | 7,46 B | no disponible (entrenado hasta 6.400 tokens) | Hard-v1 71,5 %; devtools 69,8 %; documentos largos 87,5 %; transferencia 71,6 % | Apache 2.0 | HuggingFace, Apple Silicon |
| D1A-E4B v0.4 | Modelo de decision (version previa) | no disponible | no disponible | Hard-v1 55,2 %; devtools 63,8 %; documentos largos 86,6 % | Apache 2.0 | HuggingFace |
| Kev-4B | Modelo de decision (model card, fp32, desarrollo) | no disponible | no disponible | Hard 78,6; devtools 73,9; documentos largos 89,1; transferencia 81,7 | no disponible | no disponible |
| google/gemma-4-E4B | Modelo base | no disponible | no disponible | no disponible | no disponible | HuggingFace (revision `411aa17b`) |

La comparacion con Kev-4B es aproximada segun la propia model card (fp32 frente a MLX 8-bit, splits de desarrollo). v0.5 cierra la mayor parte de la brecha en herramientas de desarrollo y documentos largos, y dos tercios de la brecha en decisiones duras.

## Limitaciones y advertencias

- v0.5 sacrifica parte del etiquetado de pull requests: la severidad baja 2 puntos y el radio de impacto en los repositorios del propio autor cae de forma notable. La model card recomienda mantener v0.4 si el uso principal es el etiquetado de PR.
- La calibracion solo es fiable dentro de los conjuntos de calibracion (error 0.015 fuera de pliegue). Fuera de ellos, el modelo es menos seguro de lo que es correcto: en agent factory, la confianza media es del 78 % frente a un 90,5 % de acierto.
- El modelo no genera texto: solo produce probabilidades sobre preguntas tipadas (si/no, eleccion, puntuacion). No sirve para generacion libre, resumen ni dialogo.
- Cobertura idiomatica limitada a ingles y japones.
- No hay datos publicados sobre sesgos, riesgo de alucinacion en sentido generativo (no aplica al no generar texto) ni comportamiento fuera de los dominios entrenados.
- Aunque la licencia es Apache 2.0, el modelo se apoya en `google/gemma-4-E4B`, cuya licencia propia debe verificarse para uso comercial.
- El formato MLX limita el despliegue fuera del ecosistema Apple Silicon; no se documentan requisitos minimos de memoria unificada.
- Las cifras de etiquetado de PR con superindices se obtuvieron sobre el checkpoint bf16, no sobre este build de 8-bit, por lo que no son directamente extrapolables a la version cuantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnP1/d1a-e4b-mlx-q8
- Modelo base del que deriva: https://huggingface.co/JohnP1/d1a-e4b
- Modelo base sobre el que se construye: https://huggingface.co/google/gemma-4-E4B
- Repositorio de referencia del etiquetado de PR: https://huggingface.co/NousResearch/hermes-agent
