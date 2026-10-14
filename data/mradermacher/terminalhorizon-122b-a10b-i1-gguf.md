# mradermacher/TerminalHorizon-122B-A10B-i1-GGUF

## Resumen

TerminalHorizon-122B-A10B-i1-GGUF es la version cuantizada en formato GGUF del modelo shunzou05/TerminalHorizon-122B-A10B, un modelo afinado especificamente para actuar como agente de terminal (terminal-agent) y de linea de comandos (CLI). La publica mradermacher, un autor conocido por generar cuantizaciones de alta calidad con calibracion imatrix a partir de modelos de terceros. El modelo base fue entrenado mediante ajuste supervisado (SFT) sobre los datasets shunzou05/TerminalHorizon-3K y shunzou05/TerminalHorizon-Environment, orientados a tareas de horizonte largo (long-horizon) en entornos de terminal.

El modelo maneja aproximadamente 122.000 millones de parametros totales, dato confirmado en el repositorio de safetensors, y la nomenclatura 122B-A10B indica que se trata de una arquitectura de mezcla de expertos (MoE) con unos 10.000 millones de parametros activos por token. Esa relacion entre parametros totales y activos es clave: permite almacenar el modelo completo en disco o RAM y activar solo una fraccion por token, lo que reduce el coste computacional de cada paso de generacion.

La relevancia actual del modelo esta en su enfoque: agentes autonomos que operan shell, ejecutan comandos, interpretan salidas de terminal y completan tareas de multiples pasos (agentes de codificacion, RSI o razonamiento iterativo). La licencia Apache 2.0 y la disponibilidad de cuantizaciones desde IQ2_M hasta Q6_K lo hacen desplegable en configuraciones muy distintas, desde servidores con multiples GPU hasta equipos con mucha RAM y GPU consumer mediante offload de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura 122B-A10B indica un modelo de mezcla de expertos, MoE) |
| Parametros totales | 122.111.526.912 (122B) |
| Parametros activos | 10B (deducido del sufijo A10B del nombre; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M (40,4 GB), i1-Q2_K_S (42,2 GB), i1-Q2_K (45,0 GB), i1-IQ3_XXS (47,5 GB), i1-IQ3_M (53,9 GB), i1-Q3_K_M (58,7 GB), i1-IQ4_XS (65,6 GB), i1-Q4_K_S (69,8 GB), i1-Q4_K_M (74,3 GB), i1-Q6_K (100,4 GB, en 3 partes); tambien fichero imatrix (0,8 GB) para crear cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base esta en safetensors |
| Modelo base | shunzou05/TerminalHorizon-122B-A10B |
| Datasets de entrenamiento | shunzou05/TerminalHorizon-3K, shunzou05/TerminalHorizon-Environment |
| Tamano del repositorio | 678,4 GB |
| Capacidad multimodal | si, segun la model card del cuantizador (los ficheros mmproj se distribuyen en el repositorio estatico) |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base mas alla de lo que se deduce de su nombre. El sufijo 122B-A10B es la convencion habitual para modelos MoE en los que el numero total de parametros (122B) se reparte entre varios expertos y solo una fraccion (10B) se activa por token. Esta configuracion permite que el modelo tenga una capacidad de representacion cercana a la de un denso de 122B mientras mantiene un coste de computo por token mucho menor, similar al de un modelo de aproximadamente 10B activos. Esa propiedad es la que hace viable su despliegue en entornos con RAM abundante y GPU limitada, porque los pesos de expertos no activados pueden residir en memoria del sistema.

El entrenamiento del modelo base consistio en un ajuste supervisado (SFT) sobre dos datasets propios del autor original: TerminalHorizon-3K y TerminalHorizon-Environment. Las etiquetas del repositorio (terminal-agent, cli, agentic, long-horizon, RSI, Coding-agent) indican que el foco esta en tareas de terminal de horizonte largo, es decir, secuencias de muchos pasos con retroalimentacion del entorno, mas que en conversacion general. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre tecnicas posteriores de alineacion como RLHF o DPO. Tampoco hay datos sobre tecnicas de atencion, decodificacion especulativa u otras innovaciones implementadas en el modelo base. El trabajo del cuantizador se limita a la conversion y cuantizacion con calibracion imatrix, que ajusta los pesos de cuantizacion usando estadisticas de activaciones para reducir la perdida de calidad, especialmente en cuantizaciones agresivas de 2 y 3 bits.

## Capacidades

- Generacion de comandos de terminal y shell a partir de instrucciones en lenguaje natural.
- Ejecucion de tareas agenticas de multiples pasos en entornos CLI, con interpretacion de la salida de cada comando para decidir el siguiente.
- Razonamiento de horizonte largo (long-horizon): cadenas extensas de acciones dependientes con estado acumulado del entorno.
- Agente de codificacion (Coding-agent): edicion de ficheros, ejecucion de pruebas y depuracion dentro de un flujo de terminal.
- Soporte de tool calling y function calling, segun las etiquetas agentic y cli del repositorio.
- Capacidad potencialmente multimodal (vision) segun la nota de la model card, con ficheros mmproj en el repositorio estatico de cuantizaciones.
- Razonamiento iterativo y automejora (RSI, recursive self-improvement) como area de aplicacion declarada por las etiquetas.
- Idiomas: solo ingles declarado; no se anuncia soporte multilingue.
- No se documentan capacidades especificas de matematicas avanzadas, audio ni thinking mode explicito.

## Casos de uso

- Automatizacion de operaciones en servidores: el modelo puede recibir una tarea en lenguaje natural ("reinicia el servicio, comprueba los logs y verifica que responde") y traducirla a una secuencia de comandos shell, leyendo la salida entre pasos para corregir el rumbo. Es adecuado porque esta entrenado especificamente sobre entornos de terminal.
- Agente de codificacion en flujos de CI/CD: ejecucion de pruebas, lectura de errores del compilador y aplicacion de parches en el arbol de trabajo mediante comandos y edicion de ficheros, integr able como paso de un pipeline de integracion continua.
- Asistente de depuracion interactiva: dado un fallo, el modelo propone comandos de diagnostico (grep, journalctl, strace, docker logs), interpreta la salida y encadena hipotesis hasta localizar la causa.
- Generacion de scripts de aprovisionamiento: convertir requisitos de infraestructura en scripts de bash o de configuracion de herramientas CLI, con verificacion posterior de su ejecucion.
- Soporte tecnico de nivel 2 sobre terminales de cliente: el agente guia la recogida de informacion de diagnostico en la maquina del usuario mediante comandos acotados, con la ventana de contexto suficiente para mantener el historial de la sesion.
- Formacion y evaluacion de agentes: al ser un modelo abierto con licencia Apache 2.0 y varias cuantizaciones, sirve como referencia (baseline) para comparar politicas de agentes de terminal y para generar trazas de entrenamiento.
- Investigacion en horizonte largo: las etiquetas long-horizon y RSI apuntan a su uso en experimentos donde el agente debe mantener coherencia durante decenas o cientos de pasos, un escenario donde los modelos generalistas suelen degradarse.
- Despliegue en entornos con GPU limitada: gracias a la estructura MoE y a las cuantizaciones de 2 a 4 bits, es posible ejecutarlo con offload parcial de expertos a RAM en estaciones de trabajo sin cluster dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, SWE-bench ni equivalentes para agentes de terminal) y tampoco se han encontrado datos de rendimiento en la busqueda web realizada, cuyos resultados no guardan relacion con el modelo.

## Requisitos de hardware

- Cuantizacion minima viable: i1-IQ2_M, 40,4 GB de pesos, mas overhead de contexto y cache KV; se recomienda prever al menos 48 GB de VRAM o repartir entre VRAM y RAM.
- Cuantizacion recomendada por tamano, velocidad y calidad: i1-Q4_K_S (69,8 GB) e i1-Q4_K_M (74,3 GB); en la practica exigen del orden de 80 GB de VRAM para residir completamente en GPU.
- Cuantizacion de mayor calidad: i1-Q6_K (100,4 GB, en tres partes), que requiere al menos 100-110 GB de memoria entre VRAM y RAM.
- GPU recomendadas para carga completa: A100 80 GB, H100 80 GB o H200; tambien configuraciones multi-GPU con dos o mas aceleradores de 48-80 GB.
- Viabilidad en GPU consumer: ninguna cuantizacion cabe en una sola GPU de 24 GB. Es posible con dos o mas RTX 4090/3090 si se combinan 48 GB de VRAM con offload parcial a RAM del sistema, aprovechando que solo se activan unos 10B de parametros por token.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son la via natural al tratarse de GGUF con calibracion imatrix. Para el modelo base en safetensors, vLLM o TGI si se confirma compatibilidad con la arquitectura MoE concreta. El soporte de vision requiere los ficheros mmproj del repositorio estatico y el modulo multimodal de llama.cpp.
- Memoria del sistema: con offload de expertos conviene disponer de 64-128 GB de RAM; el repositorio completo ocupa 678,4 GB, pero solo hay que descargar la cuantizacion elegida.
- Latencia y throughput: no disponibles. El rendimiento dependera fuertemente de cuantos expertos residan en GPU frente a RAM, ya que el cuello de botella pasa a ser el ancho de banda de memoria del sistema.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (agentes de terminal de gran tamano con arquitectura MoE) con datos de parametros, contexto, rendimiento y licencia que permitan una comparacion rigurosa. Como referencia interna, la unica alternativa verificable es el propio modelo base shunzou05/TerminalHorizon-122B-A10B en safetensors, que comparte arquitectura, licencia y capacidades, y se diferencia unicamente por el formato de pesos y por no incluir cuantizaciones.

## Limitaciones y advertencias

- Entrenamiento declarado solo en ingles: el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Riesgo elevado en ejecucion de comandos: al ser un agente de terminal, un error de generacion puede borrar ficheros, modificar configuraciones o exponer datos. Es imprescindible ejecutar en entornos aislados (contenedores, maquinas virtuales, sandbox) y con confirmacion humana en operaciones destructivas.
- Alucinacion de comandos y de opciones: el modelo puede inventar flags, rutas o utilidades inexistentes. La validacion en seco (dry run) y la revision de las ordenes antes de ejecutarlas son obligatorias en produccion.
- Degradacion en cuantizaciones agresivas: las variantes IQ2_M, Q2_K_S y Q2_K conllevan perdida notable de calidad; el propio autor recomienda evitar Q2_K_S por su baja calidad. Para tareas de razonamiento largo, conviene usar IQ4_XS o superior.
- Ausencia de datos de evaluacion: no hay benchmarks publicados que permitan estimar la tasa de exito en tareas de terminal, por lo que cualquier decision de adopcion deberia basarse en una evaluacion propia sobre el dominio objetivo.
- Longitud de contexto desconocida: no se puede planificar el uso en sesiones largas sin confirmar la ventana real del modelo base.
- Restricciones de licencia: la licencia Apache 2.0 del modelo permite uso comercial, modificacion y redistribucion, pero no exime de las obligaciones de atribucion ni de las licencias de terceros que pudieran afectar al modelo base o a los datasets.
- Procedencia de los datos de entrenamiento: no se detalla la composicion de TerminalHorizon-3K ni de TerminalHorizon-Environment, por lo que no se pueden descartar sesgos, codigo con licencias incompatibles o informacion sensible en el corpus.
- Estado del repositorio: registra 0 descargas y 1 like en el momento de la consulta, lo que indica adopcion practicamente nula y ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones i1: https://huggingface.co/mradermacher/TerminalHorizon-122B-A10B-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye ficheros mmproj para vision): https://huggingface.co/mradermacher/TerminalHorizon-122B-A10B-GGUF
- Modelo base: https://huggingface.co/shunzou05/TerminalHorizon-122B-A10B
- Dataset TerminalHorizon-3K: https://huggingface.co/datasets/shunzou05/TerminalHorizon-3K
- Dataset TerminalHorizon-Environment: https://huggingface.co/datasets/shunzou05/TerminalHorizon-Environment
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#TerminalHorizon-122B-A10B-i1-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF y concatenacion de ficheros multiparte: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de calidad de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
