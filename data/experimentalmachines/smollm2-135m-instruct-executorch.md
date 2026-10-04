# experimentalmachines/SmolLM2-135M-Instruct-ExecuTorch

## Resumen

Este repositorio contiene un conjunto de exportaciones a ExecuTorch del modelo SmolLM2-135M-Instruct, preparadas por el usuario experimentalmachines para inferencia local en dispositivos Android arm64. No se trata de un modelo nuevo: es un reempaquetado del modelo de 135 millones de parametros de HuggingFaceTB, cuantizado y compilado en ficheros .pte que se ejecutan con el runtime de ExecuTorch 1.4.0, por ejemplo mediante la aplicacion Android openweights. Cada fichero fija una ventana de contexto concreta (2.048, 4.096, 8.192, 16.384 o 32.768 tokens) y un backend de ejecucion determinado.

La relevancia del paquete es fundamentalmente practica: cubre tres rutas de aceleracion en movil (CPU con XNNPACK, GPU con Vulkan y NPU MediaTek NeuroPilot sobre MT6991 / Dimensity 9400) y permite escoger el binario en funcion del hardware y de la memoria disponible en el telefono. Los tamanos van de 0,04 GB por fragmento en la NPU a 0,17 GB en la variante Vulkan de 32k, con cuantizaciones 8da4w GPTQ y a16w8.

El modelo subyacente sigue siendo un transformer decoder-only de 135 millones de parametros, con las limitaciones de conocimiento, razonamiento y fidelidad propias de esa escala. Su valor esta en el despliegue on-device, no en la calidad de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base SmolLM2-135M-Instruct y exportada a ExecuTorch |
| Parametros totales | 135 millones (segun el nombre del modelo base) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Fija dentro de cada fichero: 2.048, 4.096, 8.192, 16.384 o 32.768 tokens |
| Tipos de cuantizacion | 8da4w GPTQ (pesos de 4 bits con activaciones dinamicas de 8 bits) en XNNPACK y Vulkan; a16w8 (pesos de 8 bits con activaciones de 16 bits) en MediaTek NeuroPilot |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | .pte (formato de programa de ExecuTorch) |
| Backends incluidos | XNNPACK (CPU), Vulkan (GPU), MediaTek NeuroPilot (NPU MT6991) |
| Runtime minimo | ExecuTorch 1.4.0 |
| Arquitecturas destino | arm64 (Android); NPU limitada a MediaTek MT6991 (Dimensity 9400) |
| Tamano del repositorio | 3,3 GB |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct (revision 12fd25f77366) |

## Arquitectura y entrenamiento

El modelo exportado es un transformer decoder-only de 135 millones de parametros. El repositorio no modifica la arquitectura del modelo base: se limita a cuantizarlo y compilarlo para distintos backends de ExecuTorch. En el caso de los binarios XNNPACK y Vulkan se emplea una cuantizacion 8da4w con GPTQ (4 bits en los pesos, activaciones dinamicas de 8 bits, segun la convencion habitual de ExecuTorch y TorchAO), mientras que los binarios para NeuroPilot usan a16w8 (8 bits en los pesos, 16 bits en las activaciones). Cada fichero incorpora una ventana de contexto fija en el momento de la exportacion, de modo que el runtime reserva la totalidad del KV cache al cargar el modelo.

No se proporciona informacion sobre el proceso de entrenamiento en la model card del export: ni numero de tokens, ni composicion del dataset, ni si hubo etapas de RLHF, DPO u otra forma de alineacion. El modelo base fue entrenado por HuggingFaceTB (SmolLM2-135M-Instruct), pero los detalles de su entrenamiento no figuran en la informacion disponible en este repositorio.

## Capacidades

- Generacion de texto y seguimiento basico de instrucciones, heredados del modelo base en su variante Instruct.
- Conversacion de uno o pocos turnos con indicaciones sencillas y directas.
- Generacion de texto corto: continuaciones, respuestas breves, reformulaciones y listas simples.
- Inferencia completamente local en el dispositivo, sin llamadas a red ni envio de datos a servicios externos.
- Ejecucion sobre tres backends distintos (CPU arm64, GPU Vulkan y NPU MediaTek MT6991) con el mismo modelo subyacente.
- No hay soporte documentado de tool calling ni function calling en la informacion disponible.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades de vision ni de audio.
- No se documenta modo de razonamiento extendido (thinking mode).
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado de texto en teclados Android: con el fichero XNNPACK de 2.048 tokens basta para el contexto de un mensaje corto, y sus 0,11 GB permiten ejecutarlo en CPU sin depender de la GPU ni de la NPU.
- Clasificacion y etiquetado de texto en el dispositivo: categorizar notificaciones, correos o mensajes entrantes con prompts de formato fijo, aprovechando que no hay coste de red ni exposicion de datos.
- Asistente conversacional offline en aplicaciones Android: la app openweights o cualquier integracion con ExecuTorch 1.4.0 puede ofrecer un chat de demostracion que funciona sin conectividad.
- Generacion de textos muy cortos en flujos creativos o de marketing: esloganes, pies de foto, titulares y variaciones breves de una frase semilla.
- Reescritura y normalizacion de frases: cambiar el tono, corregir mayusculas o reformatear una linea de texto antes de mostrarla en la interfaz.
- Prototipado y evaluacion de backends ExecuTorch: sirve como banco de pruebas para medir XNNPACK frente a Vulkan y NeuroPilot antes de portar modelos de mayor tamano al mismo pipeline.
- Escenarios con requisitos estrictos de privacidad: al ejecutarse integramente en el telefono, el contenido del usuario no sale del dispositivo.
- Aplicaciones sin conectividad: entornos industriales, zonas rurales o modos avion donde no hay acceso a modelos en la nube.
- Validacion de integracion en CI de proyectos Android: los ficheros .pte permiten comprobar que el runtime carga y genera tokens correctamente antes de publicar una version.

Conviene ser realista: por su escala, este modelo no es adecuado para razonamiento complejo, generacion de codigo en produccion, matematicas, tareas de agentes ni resumenes largos y fieles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye los resultados de las pruebas de humo (smoke test) realizadas durante la exportacion, resumidos en la siguiente tabla.

| Backend | Destino | Ventana (tokens) | Tamano | Resultado de la prueba |
|---|---|---|---|---|
| XNNPACK (CPU) | Cualquier arm64 | 2.048 | 0,11 GB | Superada (respuesta "Paris") |
| XNNPACK (CPU) | Cualquier arm64 | 4.096 | 0,11 GB | Superada (respuesta "Paris") |
| XNNPACK (CPU) | Cualquier arm64 | 8.192 | 0,11 GB | Superada (respuesta "Paris") |
| XNNPACK (CPU) | Cualquier arm64 | 16.384 | 0,11 GB | Superada (respuesta "Paris") |
| XNNPACK (CPU) | Cualquier arm64 | 32.768 | 0,12 GB | Superada (respuesta "Paris") |
| Vulkan (GPU) | Cualquier arm64 con Vulkan | 2.048 | 0,13 GB | Solo verificacion estructural |
| Vulkan (GPU) | Cualquier arm64 con Vulkan | 4.096 | 0,14 GB | Solo verificacion estructural |
| Vulkan (GPU) | Cualquier arm64 con Vulkan | 8.192 | 0,14 GB | Solo verificacion estructural |
| Vulkan (GPU) | Cualquier arm64 con Vulkan | 16.384 | 0,15 GB | Solo verificacion estructural |
| Vulkan (GPU) | Cualquier arm64 con Vulkan | 32.768 | 0,17 GB | Solo verificacion estructural |
| NeuroPilot | MT6991 (Dimensity 9400) | 2.048 | 0,15 GB (3 fragmentos) | Solo verificacion estructural |
| NeuroPilot | MT6991 (Dimensity 9400) | 4.096 | 0,15 GB (3 fragmentos) | Solo verificacion estructural |
| NeuroPilot | MT6991 (Dimensity 9400) | 8.192 | 0,15 GB (3 fragmentos) | Solo verificacion estructural |
| NeuroPilot | MT6991 (Dimensity 9400) | 16.384 | 0,17 GB (3 fragmentos) | Solo verificacion estructural |

No hay cifras publicadas de latencia, tokens por segundo ni consumo energetico.

## Requisitos de hardware

- Inferencia en dispositivo, no en servidor: todos los ficheros estan compilados para arm64 y requieren un runtime ExecuTorch 1.4.0.
- XNNPACK (CPU): funciona en cualquier dispositivo arm64. Ocupa entre 0,11 y 0,12 GB en disco y no necesita GPU ni NPU.
- Vulkan (GPU): requiere un dispositivo arm64 con soporte Vulkan. Ocupa entre 0,13 y 0,17 GB.
- MediaTek NeuroPilot: exclusivo de la NPU MT6991 (Dimensity 9400). Cada ventana se distribuye en tres fragmentos .pte que suman entre 0,15 y 0,17 GB.
- Memoria: el runtime reserva el KV cache completo al cargar el modelo, por lo que conviene escoger la ventana mas grande que el dispositivo pueda sostener. El campo `fits_phone_budget` de cada `config.json` es la estimacion del autor contra un presupuesto de 5 GB.
- VRAM: no aplica el concepto de VRAM de GPU de escritorio, ya que el destino es un SoC movil con memoria compartida. No se proporcionan cifras de memoria por backend.
- No cabe plantear despliegue en A100, H100 o RTX 4090: el formato .pte esta pensado para movil y no se distribuye una version de servidor en este repositorio.
- Opciones de despliegue: aplicacion openweights para Android o cualquier runtime ExecuTorch 1.4.0. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no consumen ficheros .pte.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Dentro del propio repositorio se pueden comparar las tres rutas de ejecucion, que comparten modelo y cuantizacion de base pero difieren en backend, ventana y tamano.

| Variante | Backend | Destino | Ventana | Tamano | Cuantizacion | Validacion |
|---|---|---|---|---|---|---|
| XNNPACK | CPU | Cualquier arm64 | 2k a 32k | 0,11-0,12 GB | 8da4w GPTQ | Prueba de humo superada |
| Vulkan | GPU | Cualquier arm64 con Vulkan | 2k a 32k | 0,13-0,17 GB | 8da4w | Solo estructura |
| NeuroPilot | NPU | MT6991 (Dimensity 9400) | 2k a 16k | 0,15-0,17 GB | a16w8 | Solo estructura |

Respecto al modelo de origen, la diferencia principal es el formato y el destino: SmolLM2-135M-Instruct se distribuye en pesos PyTorch/safetensors para ejecucion en CPU o GPU convencionales, mientras que estas exportaciones solo funcionan en el runtime de ExecuTorch sobre arm64. No se dispone de datos de rendimiento comparativos frente a otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Con 135 millones de parametros, la tasa de alucinacion es alta en preguntas factuales y el modelo no sostiene razonamiento de varios pasos, matematicas ni codigo de calidad.
- La ventana de contexto esta fijada dentro de cada fichero .pte. No se puede ampliar en tiempo de ejecucion: hay que cargar otro binario.
- El runtime reserva el KV cache completo al cargar el modelo, de modo que elegir una ventana grande consume memoria desde el primer token, independientemente del uso real.
- Las pruebas de humo solo se superaron en los ficheros XNNPACK (prompt con respuesta "Paris"). Los binarios Vulkan y NeuroPilot unicamente se verificaron a nivel estructural, sin ejecucion real, porque no habia runtime de NPU en la maquina de exportacion.
- La ruta NeuroPilot esta restringida al chip MT6991 (Dimensity 9400) y requiere cargar tres fragmentos por ventana.
- La lista de idiomas soportados no esta documentada en el repositorio; el comportamiento multilingue no puede darse por garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar tambien la licencia y las condiciones del modelo base SmolLM2-135M-Instruct del que deriva.
- El repositorio ocupa 3,3 GB, muy por encima del tamano de cada binario individual, por lo que conviene descargar solo los ficheros necesarios.
- El modelo tiene 108 descargas y 0 likes en HuggingFace, lo que indica una validacion muy limitada por parte de la comunidad.
- No se ofrecen garantias de precision en produccion: cualquier integracion deberia incluir filtros, validacion de salida y expectativas de calidad ajustadas a la escala del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/experimentalmachines/SmolLM2-135M-Instruct-ExecuTorch
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Aplicacion openweights para Android: https://github.com/alpharomercoma/openweights
- Runtime ExecuTorch (documentacion y repositorio): https://github.com/pytorch/executorch
