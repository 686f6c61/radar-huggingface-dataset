# rkg209/qwen2.5-coder-1.5b-java-review-gguf

## Resumen

rkg209/qwen2.5-coder-1.5b-java-review-gguf es un ajuste fino mediante QLoRA de Qwen/Qwen2.5-Coder-1.5B-Instruct, especializado en una tarea muy acotada: revisar un unico metodo Java y devolver un objeto JSON con los campos `severity`, `category`, `line`, `issue` y `suggested_fix`. El adaptador LoRA se fusiono con el modelo base, se convirtio a GGUF en f16 y se cuantizo a Q4_K_M con llama.cpp (commit `4fea119`). El resultado es un fichero de 986 MB, equivalente a 5,08 bits por peso.

El modelo resuelve un problema concreto de ingenieria: convertir la revision de codigo Java en una salida estructurada y consumible por maquinas, de forma que pueda integrarse en pipelines de CI/CD, hooks de pre-commit o plugins de IDE sin necesidad de infraestructura GPU dedicada. Con 1.543.714.304 parametros en una arquitectura densa, cabe en cualquier portatil moderno en su version cuantizada.

Su relevancia practica es doble: por un lado demuestra que un modelo de 1,5B puede alcanzar una validez de esquema del 1,00 en la tarea objetivo tras un ajuste fino narrow; por otro, sirve como caso de estudio de un flujo completo de destilacion de tarea (LoRA, fusion, conversion a GGUF, cuantizacion y evaluacion sobre un holdout congelado). El autor publica tanto el prompt como el harness de evaluacion en su repositorio de GitHub, aunque el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo oficial de uso fija `n_ctx=4096` |
| Tipos de cuantizacion | Q4_K_M (5,08 bits por peso, 986 MB); f16 como paso intermedio de conversion |
| Idiomas soportados | no disponible (la model card esta en ingles y la tarea esta definida exclusivamente para Java) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el ajuste se genero como adaptador QLoRA en 4 bits antes de la fusion y conversion |

## Arquitectura y entrenamiento

La base es Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso de 1,5B parametros. Sobre el se aplico un ajuste fino QLoRA, es decir, el modelo base se cargo cuantizado en 4 bits y se entrenaron unicamente los adaptadores de bajo rango. Posteriormente el adaptador se fusiono con los pesos base, se convirtio a GGUF en f16 y se cuantizo a Q4_K_M con llama.cpp en el commit `4fea119`. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan disponibles.

El modelo fue entrenado para operar en modo chat con la plantilla de conversacion embebida, no como completado de texto crudo. Este detalle es critico: segun el autor, si se le invoca como completado sin el enmarcado de chat, la validez de esquema cae a 0,00, ya que el modelo no ha visto ese formato durante el ajuste. La tarea aprendida es de una sola pasada y ventana corta: una entrada (un metodo Java) y una salida (un unico objeto JSON), sin razonamiento multi-turno ni uso de herramientas.

## Capacidades

- Generacion de revisiones de codigo Java: dado un metodo Java, produce un objeto JSON con los campos `severity`, `category`, `line`, `issue` y `suggested_fix`.
- Salida estructurada estricta: la validez de esquema medida sobre un holdout congelado de 40 registros es de 1,00 en la version GGUF Q4_K_M.
- Deteccion de errores: tasa de deteccion de bugs ("bug-catch") de 0,80 en el mismo holdout.
- Modo conversacional: la model card y los tags (`conversational`, `endpoints_compatible`) confirman que debe invocarse mediante chat completion con la plantilla embebida.
- Ejecucion en CPU: el ejemplo oficial usa `llama_cpp.Llama` en CPU con decodificacion greedy (`temperature=0.0`).
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No hay evidencia de capacidades multilingues ni de cobertura de lenguajes de programacion distintos de Java.

## Casos de uso

- Revision automatica en pull requests: el modelo se invoca por cada metodo modificado en un PR de un repositorio Java y publica los hallazgos como comentarios estructurados en el sistema de revision. Al devolver JSON con `line` y `severity`, el pipeline puede filtrar solo los hallazgos de severidad alta antes de notificar a los revisores humanos.
- Hook de pre-commit local: integrado mediante `llama-cpp-python` en un hook de Git, revisa el diff antes de permitir el commit. Al ejecutarse en CPU y ocupar menos de 1 GB de pesos, no requiere GPU ni conexion a servicios externos.
- Plugin de IDE para feedback inmediato: un plugin de IntelliJ o VS Code puede enviar el metodo bajo el cursor al modelo y mostrar las sugerencias en un panel lateral. La latencia es aceptable porque el modelo es de 1,5B y la respuesta se limita a un objeto JSON corto.
- Auditoria por lotes de codigo legado: recorrer un repositorio antiguo metodo a metodo y generar un informe consolidado de problemas recurrentes (por ejemplo, categorias repetidas), util como punto de partida para planificar refactorizaciones.
- Entornos sin conectividad (air-gapped): al ser un GGUF que corre en llama.cpp sobre CPU, puede desplegarse en maquinas aisladas de banca, defensa o sanidad donde no se permite enviar codigo a APIs externas.
- Primera pasada de triaje antes de revision humana: usar el modelo como filtro barato que marca los metodos sospechosos y reserva el tiempo de los revisores senior para esos casos, reduciendo el coste por revision.
- Formacion y docencia: en asignaturas de programacion, generar comentarios de revision sobre los ejercicios entregados por los alumnos y usar los campos `category` e `issue` como material didactico estructurado.
- Generacion de datos sinteticos de revision: usar el modelo para etiquetar muestras de codigo y construir datasets de entrenamiento o de evaluacion para modelos mayores, dado su formato de salida consistente.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a un holdout congelado de 40 registros, evaluado en CPU con decodificacion greedy:

| Modelo | Validez de esquema | Deteccion de bugs |
|---|---|---|
| Adaptador ajustado (HF, 4 bits) | 0,975 | 0,80 |
| Este GGUF (Q4_K_M, llama.cpp) | 1,00 | 0,80 |

El propio autor advierte que, con n = 40, la diferencia de un solo registro entre ambas filas esta dentro del ruido estadistico: debe leerse como "no hay perdida medible por la cuantizacion", no como una mejora. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en Q4_K_M: aproximadamente 1,0-1,5 GB solo para los pesos (986 MB) mas el cache KV; con `n_ctx=4096` el consumo total estimado se situa en el rango de 1,5-2,5 GB.
- VRAM estimada en otras precisiones (estimacion aritmetica a partir del numero de parametros, no medida por el autor): en torno a 3,5-4 GB en f16 y 2-2,5 GB en Q8_0.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 4090 sobradamente). En el segmento profesional, una A100 o H100 esta enormemente sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas, y tambien en iGPU con memoria compartida suficiente.
- Tambien funciona en CPU pura: el ejemplo oficial usa `llama_cpp.Llama` en CPU, por lo que no es imprescindible GPU.
- Opciones de despliegue: llama.cpp y `llama-cpp-python` (soporte nativo del formato GGUF y del commit usado para la conversion); Ollama y LM Studio aceptan GGUF; el tag `endpoints_compatible` indica compatibilidad con endpoints de inferencia. vLLM y TGI estan orientados a safetensors y su soporte de GGUF es experimental o inexistente, por lo que no se recomiendan como via principal.
- Latencia y throughput: no disponibles. El autor solo indica que la evaluacion se realizo en CPU con decodificacion greedy, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| rkg209/qwen2.5-coder-1.5b-java-review-gguf | 1.543.714.304 | no disponible (ejemplo con `n_ctx=4096`) | Revision de un metodo Java a JSON | apache-2.0 | Validez 1,00 / bug-catch 0,80 (n=40) |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 1.543.714.304 (misma arquitectura) | no disponible en la informacion proporcionada | Generacion y asistencia de codigo general | apache-2.0 | no disponible para esta tarea concreta |
| Alternativas de revision de codigo Java de 1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en la busqueda realizada ni en la model card, por lo que la unica comparacion verificable es contra el modelo base y contra el propio adaptador antes de la cuantizacion.

## Limitaciones y advertencias

- Tarea extremadamente estrecha: el modelo esta ajustado para revisar un unico metodo Java y devolver un JSON con un esquema fijo. Fuera de ese formato su comportamiento no esta documentado.
- Dependencia del modo chat: invocarlo como completado de texto crudo hace caer la validez de esquema a 0,00 segun el autor, lo que puede producir fallos silenciosos en produccion si se integra de forma incorrecta.
- Evidencia estadistica muy limitada: la evaluacion se basa en 40 registros y el propio autor reconoce que las diferencias observadas estan dentro del ruido. No hay validacion cruzada, ni multiples semillas, ni datasets publicos de referencia.
- Tasa de fallo en deteccion de bugs del 20 %: uno de cada cinco errores presentes en el holdout no se detecta, por lo que el modelo no sustituye a la revision humana.
- Riesgo de alucinacion: al generar un objeto JSON con campos como `line` o `suggested_fix`, puede reportar numeros de linea inexistentes o correcciones que no compilan o que alteran la semantica del metodo.
- Modelo pequeno: con 1,5B parametros, su conocimiento de APIs de frameworks, patrones de diseno o concurrencia avanzada en Java es necesariamente limitado en comparacion con modelos de 7B o superiores.
- Idiomas y lenguajes: no hay evidencia de soporte multilingue ni de otros lenguajes de programacion distintos de Java.
- Restricciones de licencia: la licencia es apache-2.0, lo que permite uso comercial, modificacion y redistribucion sin restricciones adicionales conocidas, siempre que se conserve el aviso de licencia correspondiente.
- Madurez del artefacto: 0 descargas y 0 likes, publicacion reciente y sin mantenimiento conocido. No hay garantia de soporte, actualizaciones ni correccion de errores.
- Cuantizacion Q4_K_M: aunque la model card no mide perdida apreciable en esta tarea, la cuantizacion a 4 bits puede degradar comportamientos fuera del holdout evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rkg209/qwen2.5-coder-1.5b-java-review-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Codigo fuente, prompt y harness de evaluacion: https://github.com/rahulyk09/3_LLM_from_scratch
- Repositorio de llama.cpp (herramienta de conversion y cuantizacion, commit `4fea119`): https://github.com/ggerganov/llama.cpp
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre sus benchmarks; los unicos enlaces verificables son los anteriores.
