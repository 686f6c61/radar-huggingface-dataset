# gcoli/Qwen3.6-35B-A3B-oQ4e-fp16-mtp

## Resumen

gcoli/Qwen3.6-35B-A3B-oQ4e-fp16-mtp es una version cuantizada del modelo Qwen3.6-35B-A3B, publicada por el usuario gcoli en Hugging Face. Se trata de un artefacto de pesos, no de un modelo entrenado desde cero: el autor ha aplicado cuantizacion mixta de precision con la herramienta oQ (oMLX v0.6.4) sobre un checkpoint de arquitectura tipo mezcla de expertos (MoE), segun el tag `qwen3_5_moe`.

El modelo cuenta con 35.951.822.704 parametros totales (unos 35,95 mil millones) y un repositorio de 22,5 GB, lo que es coherente con una cuantizacion de 4 bits y tamano de grupo 64 sobre pesos en formato MLX safetensors. El sufijo "A3B" del nombre sugiere del orden de 3.000 millones de parametros activos por token, propia de los disenos MoE, aunque este dato no se confirma en la informacion disponible.

Su relevancia es practica: permite ejecutar un modelo MoE de ~36.000 millones de parametros en hardware Apple Silicon con un consumo de memoria reducido, algo inviable con los pesos completos en fp16 (que ocuparian del orden de 72 GB). La contrapartida es que se trata de una publicacion reciente, sin descargas ni valoraciones, sin model card que documente entrenamiento, contexto, licencia o idiomas, y con resultados de busqueda web que no aportan informacion tecnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; tag de arquitectura `qwen3_5_moe`. Numero de capas, expertos y tipo de atencion: no disponible |
| Parametros totales | 35.951.822.704 (~35,95 mil millones), dato real de los safetensors |
| Parametros activos | no disponible (el sufijo "A3B" del nombre sugiere ~3 mil millones, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantizacion mixta de precision con oQ (oMLX v0.6.4). El nombre incluye "fp16", lo que apunta a capas o tensores conservados en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria `mlx`) |

## Arquitectura y entrenamiento

No hay informacion sobre el proceso de entrenamiento en los datos proporcionados. El tag `qwen3_5_moe` indica que el checkpoint subyacente pertenece a la familia Qwen 3.5 con arquitectura de mezcla de expertos: varias torres de expertos feed-forward con un router que activa solo un subconjunto por token, lo que reduce el coste de computo por token frente a un modelo denso del mismo tamano. El autor de esta ficha no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o similares. Tampoco se detalla la geometria concreta (numero de capas, dimension oculta, numero de expertos activos, uso de atencion con sesgo relativo o mecanismos de decodificacion especulativa).

Lo unico documentado es el proceso de cuantizacion: se ha aplicado oQ (oMLX v0.6.4), una herramienta de cuantizacion mixta de precision que asigna distintos niveles de bits segun la sensibilidad de cada capa o tensor, con 4 bits y tamano de grupo 64 como configuracion base. El resultado se empaqueta en safetensors para el runtime MLX. El sufijo "mtp" del nombre no se explica en la model card; podria corresponder a multi-token prediction, pero es una interpretacion no confirmada.

## Capacidades

La model card no documenta capacidades funcionales: unicamente describe el proceso de cuantizacion. Por tanto, no se puede confirmar desde la informacion disponible ninguna de las siguientes capacidades, que se enumeran como herencia plausible del modelo base Qwen 3.5 MoE y quedan pendientes de verificacion:

- Generacion de texto y razonamiento general, en la medida en que el checkpoint base las conserve tras la cuantizacion.
- Codigo y matematicas: no confirmado en la documentacion aportada.
- Tool calling / function calling: no confirmado.
- Comportamiento agentico y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles; el tag de arquitectura no indica modalidad adicional.
- Ejecucion local en Apple Silicon mediante MLX: esta es la unica capacidad confirmada de forma implicita por el formato y la libreria declarada.

## Casos de uso

Los siguientes escenarios son aplicables en la medida en que el modelo conserve las capacidades del checkpoint base. Se indican como propuestas de uso, no como capacidades verificadas.

- Inferencia local en Mac con Apple Silicon: el repositorio ocupa 22,5 GB y esta en formato MLX safetensors, de modo que se puede cargar con `mlx-lm` en equipos con memoria unificada suficiente, sin necesidad de GPU dedicada ni de conexion a servicios en la nube.
- Prototipado offline y desarrollo sin datos que salgan del equipo: util para equipos que necesitan experimentar con un MoE de ~36.000 millones de parametros en entornos sin acceso a internet o con requisitos de privacidad estrictos.
- Evaluacion comparativa de cuantizaciones: este checkpoint permite medir la perdida de calidad de una cuantizacion mixta de 4 bits frente a los pesos completos del mismo modelo base, usando un conjunto de prompts fijo y comparando salidas.
- Investigacion sobre eficiencia de MoE: al mantener el enrutado por expertos en un peso reducido, sirve para estudiar como se degradan distintas capas bajo cuantizacion selectiva y que expertos resultan mas sensibles.
- Pruebas de integracion en pipelines MLX: validar el comportamiento de la libreria MLX, el cargador de safetensors y las rutinas de generacion antes de escalar a otros modelos del mismo runtime.
- Generacion de texto asistida en escritorio: redaccion, resumen y transformacion de texto integradas en una aplicacion local, siempre que el contexto y la calidad tras cuantizar se validen en el caso de uso concreto.
- Docencia y formacion: servir como ejemplo practico de flujo completo de cuantizacion (herramienta oQ, configuracion de bits y group size, publicacion en Hugging Face) en cursos de despliegue de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web no aportan datos tecnicos sobre el modelo. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- Memoria estimada para inferencia: a partir del tamano del repositorio (22,5 GB), se necesita al menos del orden de 24 GB de memoria unificada para cargar los pesos, mas el margen correspondiente a cache KV y overhead del runtime. Es una estimacion derivada del tamano de los ficheros, no un dato publicado.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables directamente, ya que el formato es MLX y esta orientado a Apple Silicon. No se documenta soporte CUDA.
- GPU de consumo: en el ecosistema Apple, equipos con chip M-series y 32 GB o mas de memoria unificada serian el objetivo natural; configuraciones de 16 GB o 24 GB quedarian al limite o por debajo del tamano de los pesos.
- Opciones de despliegue: `mlx-lm` es el runtime indicado por la libreria declarada. vLLM, TGI, llama.cpp y Ollama no consumen safetensors MLX de forma nativa, por lo que requeririan conversion o reconversion de pesos, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles. En terminos cualitativos, una arquitectura MoE con un bajo numero de parametros activos por token tiende a ofrecer mayor velocidad de generacion que un modelo denso del mismo tamano total, pero no se aporta ninguna medicion para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gcoli/Qwen3.6-35B-A3B-oQ4e-fp16-mtp | 35,95 mil millones | no disponible | MLX safetensors, 4 bits | no disponible | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| Checkpoint original sin cuantizar del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras cuantizaciones del mismo modelo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto o licencia de alternativas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Trazabilidad limitada: se trata de una cuantizacion publicada por un tercero, no de un modelo oficial. No se documenta el checkpoint base exacto, la revision utilizada ni la receta completa de cuantizacion.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Conviene verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Sin datos de calidad: no hay benchmarks ni comparaciones con los pesos completos, por lo que se desconoce la degradacion introducida por la cuantizacion de 4 bits.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluacion especifica no puede cuantificarse. La cuantizacion agresiva puede incrementarlo en tareas sensibles.
- Idiomas no declarados: no se especifica que lenguas cubre el modelo ni su calidad relativa en cada una.
- Contexto desconocido: la longitud de ventana no se documenta, lo que impide planificar tareas de contexto largo con garantias.
- Fecha de publicacion inusual: la model card indica 2026-09-11 como fecha de subida y advierte de que reemplaza a una version anterior, sin detallar que cambio entre ambas.
- Ambito de hardware restringido: el formato MLX limita su uso a Apple Silicon mediante MLX; no es directamente utilizable en GPUs NVIDIA o AMD sin conversion previa.
- Adopcion nula: 0 descargas y 0 likes, sin validacion por parte de la comunidad. No hay issues, discusiones ni informes de terceros que respalden su funcionamiento.
- Contenido de la model card minimo: se limita a los parametros de cuantizacion, sin informacion sobre entrenamiento, uso previsto o limitaciones declaradas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gcoli/Qwen3.6-35B-A3B-oQ4e-fp16-mtp
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las referencias devueltas corresponden a servicios de correo sin relacion con el modelo.
