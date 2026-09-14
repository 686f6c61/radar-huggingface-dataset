# p4ik/Qwen3.8-Flash-Next-MLX-BEAM-4bit

## Resumen

Qwen3.8-Flash-Next-MLX-BEAM-4bit es un paquete de pesos en formato MLX publicado por el usuario p4ik a partir del modelo Qwen/Qwen3.8-Flash-Next. No es un modelo entrenado desde cero ni una re-cuantizacion: es un reempaquetado de los pesos de pipenetwork/Qwen3.8-Flash-Next-MLX-mixed-4_8bit (expertos enrutados a 4 bits, resto a 8 bits) en el denominado layout B.E.A.M., pensado para ejecucion local en Apple Silicon. El autor lo marca explicitamente como experimental y work in progress.

El modelo base es un transformer hibrido de tipo MoE con mezcla de Gated-DeltaNet y atencion dispersa, identificado en la arquitectura como qwen4_exp, que incorpora ademas una tabla de embeddings de n-gramas hasheados de 51B de parametros. El README del paquete cita la denominacion 125B-A6B (unos 6.000 millones de parametros activos por token), mientras que el recuento real de tensores safetensors del repositorio da 182.242.494.611 parametros; la diferencia no se explica en la informacion disponible.

Su relevancia actual es acotada y muy especifica: permite probar una arquitectura que no existe en las versiones publicadas de mlx-lm (el paquete incluye el fichero de runtime qwen4_exp.py y exige --trust-remote-code), con un reparto de bits documentado en extras/allocation.json y una plantilla de chat endurecida. La generacion de texto esta verificada solo con un smoke test mediante un cargador propio de streaming de expertos; la torre de vision se incluye en el paquete pero ningun runtime la utiliza, y la calidad no fue medida por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp: transformer hibrido Gated-DeltaNet + MoE de atencion dispersa, con tabla de embeddings de n-gramas hasheados |
| Parametros totales | 182.242.494.611 segun safetensors; el README cita la denominacion 125B-A6B |
| Parametros activos | Aproximadamente 6.000 millones (denominacion A6B del README; no se detalla el desglose) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion afina de MLX. Expertos enrutados (switch_mlp, 96,6 % de los parametros): 4 bits, group size 64. Tablas de embeddings de n-gramas hasheados (128 shards): 4 bits, group size 32. Atencion, DeltaNet, mezcladores de hiper-conexion, expertos compartidos, proyecciones PLE, embed_tokens y lm_head: 8 bits. Routers MoE, gates, in_proj_a/b de DeltaNet y proyeccion del indexer: bf16. Torre de vision: bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license:other en el repositorio) |
| Formato de pesos | safetensors en layout MLX (B.E.A.M.), con extras/manifest.json, extras/allocation.json, extras/vision.safetensors y chat_template.jinja. No se incluye GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas Gated-DeltaNet con un MoE de atencion dispersa y anade una tabla de embeddings de n-gramas hasheados de 51B de parametros repartida en 128 shards. Segun el reparto de bits registrado, los expertos enrutados concentran el 96,6 % de los parametros y son la unica parte cuantizada a 4 bits junto con las tablas de n-gramas; el resto de componentes del lenguaje (atencion, DeltaNet, mezcladores de hiper-conexion, expertos compartidos, proyecciones PLE, embed_tokens y lm_head) se mantiene a 8 bits, y los elementos sensibles a la precision (routers, gates, in_proj_a/b de DeltaNet y proyeccion del indexer) quedan en bf16. El modelo no incluye cabeza de prediccion multi-token: el autor indica que la build de origen tampoco la trae.

Este paquete concreto no aporta entrenamiento ni cuantizacion nuevos: los pesos son bit-identicos a los de la build de origen en lo que respecta a los 432 tensores de expertos enrutados de la version uniforme de 4 bits, y el paquete solo se diferencia de la build mixta en los grupos de 8 bits. La unica aportacion tecnica propia es la organizacion en layout B.E.A.M.: la torre de vision en bf16 (333 tensores, 856 MiB) se extrae del primer shard a extras/vision.safetensors con la proyeccion patch_embed.proj.weight transpuesta del layout convolucional de PyTorch al de MLX, se incorpora una plantilla de chat endurecida (patron Unsloth: fusion de mensajes iniciales de sistema y developer en un unico bloque, mapeo de reasoning_effort 'high' a 'xhigh') y se anade un manifiesto con tamanos y SHA-256 de cada parte. El autor no publica informacion sobre datos de entrenamiento, numero de tokens ni fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto en modo conversacional, con plantilla de chat aplicada mediante tokenizer.apply_chat_template.
- Razonamiento en varios pasos: la plantilla de chat endurecida contempla el parametro reasoning_effort, con mapeo de 'high' a 'xhigh'.
- Soporte de tool calling mediante plantilla de chat: la plantilla esta preparada, pero el autor indica explicitamente que no se ha verificado con llamadas a herramientas en este modelo.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision: la torre de vision esta incluida en extras/vision.safetensors (333 tensores, 856 MiB) pero ningun runtime la carga desde este paquete; en la practica, el paquete es solo texto.
- No incluye cabeza de prediccion multi-token (multi-token prediction).
- Codigo y matematicas: no hay datos publicados que confirmen el rendimiento en estas tareas.

## Casos de uso

- Inferencia local en Apple Silicon con requisitos de privacidad: el paquete esta disenado para mlx-lm sobre memoria unificada, de modo que la generacion de texto se ejecuta sin salir del equipo. Es adecuado para entornos donde el texto no puede enviarse a una API externa.
- Pruebas de la arquitectura qwen4_exp: dado que la arquitectura no esta en ninguna version publicada de mlx-lm y el paquete incluye qwen4_exp.py declarado via model_file con --trust-remote-code, sirve para experimentar con esta familia de modelos antes de que exista soporte estable en las librerias.
- Investigacion sobre cuantizacion de precision mixta: extras/allocation.json documenta bits por modulo y la build de origen publica resultados de NLL emparejados por ventana frente a bf16 y frente a las builds uniformes de 4, 6 y 8 bits, lo que permite reproducir estudios de degradacion por capa.
- Ejecucion con memoria limitada mediante streaming de expertos: el autor valido un cargador propio que lee expertos enrutados y tablas de n-gramas desde SSD bajo demanda con solo 5,4 GB residentes en una maquina de 64 GB, un patron util para servir modelos MoE mucho mayores que la memoria disponible.
- Servicio de texto sin vision en pipelines internos: al ser un paquete solo texto con una plantilla de chat endurecida, encaja en tareas de resumen, reescritura o clasificacion generativa en un Mac Studio, siempre que se asuma la ausencia de benchmarks de calidad.
- Reproducibilidad y auditoria de artefactos: el manifiesto con SHA-256 y recuento de tensores de cada parte permite verificar la integridad de un checkpoint distribuido de mas de 100 GB antes de desplegarlo.
- Prototipado de agentes conversacionales en local: la plantilla de chat admite bloques de sistema y developer y un nivel de esfuerzo de razonamiento configurable, lo que permite ensayar flujos multi-turno, aunque el tool calling no este validado en este paquete.
- Comparacion de runtimes MLX: al cargar via mlx-lm y no via mlx-vlm (por precedencia de model_file en config.json), resulta util para estudiar el comportamiento de distintos cargadores sobre un mismo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que la calidad no fue medida por el equipo que publica el paquete, que los pesos son bit-identicos a los de la build de origen y que las cifras de evaluacion corresponden a la model card de dicha build, no a este repositorio.

Los unicos datos de rendimiento publicados son de un smoke test, no de un benchmark:

| Metrica | Valor | Entorno |
|---|---|---|
| Velocidad de decodificacion | 3,9 tokens/s | Mac mini M4 Pro, 64 GB de memoria unificada, mlx 0.32.2 / mlx-lm 0.31.3, cargador propio de streaming de expertos |
| Procesamiento de prompt | Aproximadamente 120 tokens/s | Mismo entorno |
| Memoria residente | 5,4 GB | Mismo entorno, con expertos y tablas de n-gramas leidos desde SSD |
| Prompt de prueba mas largo | 3.700 tokens, salida coherente | Mismo entorno |

El autor no midio calidad (NLL, MMLU, HumanEval, GSM8K ni similares) sobre este paquete.

## Requisitos de hardware

- Tamano en disco: 106,2 GB de repositorio (106 GB segun el README).
- Memoria para carga estandar: el paquete es mas grande que la memoria de una maquina de 64 GB, por lo que se necesita memoria unificada de 128 GB o mas. El autor indica que la carga con mlx-lm estandar en una maquina de 128 GB o superior no fue comprobada.
- Equipos recomendados: Apple Silicon con memoria unificada de 192 GB o mas (Mac Studio M2 Ultra / M3 Ultra). No hay datos publicados para configuraciones inferiores con carga estandar.
- Modo con streaming de expertos: con el cargador propio del autor, el modelo corre con 5,4 GB residentes en un Mac mini M4 Pro de 64 GB, a costa de leer expertos y tablas de n-gramas desde SSD y de una velocidad de 3,9 tokens/s.
- GPU consumer: no cabe. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar 106 GB de pesos. Ademas, MLX esta orientado a Apple Silicon y no se distribuye un formato GGUF que permita usar llama.cpp u Ollama.
- GPU de centro de datos: una A100 de 80 GB o una H100 de 80 GB no son suficientes por si solas para los 106 GB de pesos; se necesitarian al menos dos, pero no hay runtime publicado para MLX sobre CUDA ni pesos en un formato alternativo en este repositorio.
- Opciones de despliegue verificadas: mlx-lm, en modo texto, con --trust-remote-code. mlx-vlm no carga el paquete, porque el model_file de config.json tiene precedencia y qwen4_exp.py es un modelo de texto de mlx-lm sin ModelConfig ni torre de vision.
- Opciones de despliegue no disponibles: vLLM, TGI, llama.cpp y Ollama no soportan este paquete tal como se distribuye (no hay pesos GGUF ni adaptacion de runtime).
- Latencia y throughput: los unicos datos disponibles son los 3,9 tokens/s de decodificacion y los aproximadamente 120 tokens/s de procesamiento de prompt del smoke test en M4 Pro con streaming. No hay datos para carga completa en memoria ni para otros equipos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este paquete, por lo que la comparacion se limita a caracteristicas estructurales frente a otras builds del mismo modelo base.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| p4ik/Qwen3.8-Flash-Next-MLX-BEAM-4bit | 182.242.494.611 segun safetensors (README: 125B-A6B) | Mixta: expertos y n-gramas a 4 bits, resto del lenguaje a 8 bits, routers y gates a bf16, vision a bf16 | no disponible | Qwen Community License 1.0 | Publico en HuggingFace, 0 descargas, formato MLX |
| pipenetwork/Qwen3.8-Flash-Next-MLX-mixed-4_8bit | Mismo modelo base | Identica a la de este paquete (es su build de origen, sin el layout B.E.A.M.) | no disponible | Qwen Community License 1.0 | Publico en HuggingFace, formato MLX |
| Builds uniformes de 4, 6 y 8 bits del mismo modelo base | Mismo modelo base | Uniforme en todos los modulos | no disponible | Qwen Community License 1.0 | Referenciadas en la model card de origen; no se aportan identificadores de repositorio en la informacion disponible |
| Qwen/Qwen3.8-Flash-Next (bf16) | Mismo modelo base | Sin cuantizar | no disponible | Qwen Community License 1.0 | Modelo base en HuggingFace |

La model card de origen publica resultados de NLL emparejados por ventana frente a bf16 y frente a las builds uniformes de 4, 6 y 8 bits; el autor de este paquete indica que esas cifras aplican sin cambios, pero no las reproduce en este repositorio.

## Limitaciones y advertencias

- Estado experimental: el autor califica el paquete como work in progress. Solo la generacion de texto esta comprobada, y unicamente mediante un smoke test.
- Vision no funcional: la torre se distribuye en extras/vision.safetensors, pero ningun runtime la usa. mlx-lm es solo texto y mlx-vlm no carga el paquete por la precedencia de model_file en config.json.
- Calidad no evaluada: el autor no ha medido MMLU, HumanEval, GSM8K, NLL ni ninguna otra metrica sobre este paquete. Las cifras de la build de origen no se reproducen aqui.
- Carga estandar no verificada: no se ha comprobado el arranque con mlx-lm estandar en una maquina con 128 GB o mas de memoria; los resultados publicados proceden de un cargador propio de streaming de expertos.
- Tool calling sin validar: la plantilla de chat esta preparada para llamadas a herramientas, pero el autor indica que no se ha probado en este modelo.
- Requiere ejecucion de codigo remoto: el paquete declara model_file sobre qwen4_exp.py y exige --trust-remote-code. qwen4_exp.py es el fichero de runtime de la build de origen, sin cambios, y no esta auditado en este repositorio.
- Dependencia de un ecosistema no publicado: el layout B.E.A.M. esta pensado para un motor que aun no se ha publicado; el autor afirma que el paquete funciona sin el, pero no hay validacion independiente de ese extremo.
- Discrepancia en el recuento de parametros: el README cita 125B-A6B y el recuento de safetensors da 182,2B. No se explica la diferencia en la informacion disponible.
- Idiomas y contexto desconocidos: no se publican datos sobre cobertura linguistica ni longitud de contexto soportada, un dato critico para valorar despliegues reales.
- Riesgo de alucinacion: no hay evaluaciones publicadas sobre fidelidad factual de este paquete; se aplican los riesgos habituales de los modelos generativos sin datos que los cuantifiquen.
- Licencia: Qwen Community License 1.0 (license:other). No es una licencia OSI y puede imponer condiciones adicionales al uso comercial. Debe revisarse el fichero LICENSE del repositorio antes de cualquier despliegue en produccion.
- Ausencia de soporte en runtimes habituales: no hay pesos GGUF, por lo que llama.cpp, Ollama, vLLM y TGI no son opciones viables con este paquete.
- Ecosistema muy limitado: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin comunidades de usuarios que hayan validado su comportamiento.

## Enlaces

- Repositorio del paquete: https://huggingface.co/p4ik/Qwen3.8-Flash-Next-MLX-BEAM-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build de cuantizacion de origen: https://huggingface.co/pipenetwork/Qwen3.8-Flash-Next-MLX-mixed-4_8bit
- Licencia: fichero LICENSE dentro del repositorio (Qwen Community License 1.0)
- Codigo de port referenciado en el README: https://github.com/PipeNetwork/qwen38-flash-nex (URL truncada en la model card; no se puede verificar el enlace completo)
- Libreria de ejecucion: https://github.com/ml-explore/mlx-lm
- Libreria MLX: no disponible como enlace explicito en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados pertenecen a Nahimic (software de audio) y no guardan relacion con el modelo.
