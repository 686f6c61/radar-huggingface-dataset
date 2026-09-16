# khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF

## Resumen

khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF es la version cuantizada en formato GGUF del ajuste fino khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled, un modelo denso de aproximadamente 27.000 millones de parametros especializado en razonamiento para codigo y depuracion agentica. El modelo parte de Qwen/Qwen3.8-27B (licencia Apache 2.0) y ha sido destilado sobre 195 millones de tokens de trazas de razonamiento orientadas a tareas de ingenieria de software: lectura de estado real del proyecto, verificacion de suposiciones mediante herramientas (shell, arneses de test, CI/lint) y propuesta de parches fundamentados en evidencia en lugar de cadenas de pensamiento especulativas.

El objetivo declarado del ajuste es empujar al modelo hacia un razonamiento "grounded" que inspeccione ficheros y ejecute comprobaciones antes de escribir codigo, evitando el patron de adivinar y reescribir. El repositorio GGUF tiene un tamano de 28,6 GB y una unica etiqueta de idioma (ingles), con pipeline declarado image-text-to-text.

Es relevante ahora porque cubre un nicho concreto y muy demandado: asistentes de codigo agenticos que operan sobre repositorios reales y fallos de CI, no sobre fragmentos aislados. Conviene senalar que la model card original contiene marcadores de plantilla sin rellenar ("Fill in / verify before publishing") sobre licencia heredada, composicion completa del dataset e hiperparametros, y que el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un artefacto muy reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.8-27B); el autor indica "dense, ~27B params" |
| Parametros totales | 26.895.998.464 (26,9 B, dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card indica "inherits base model context window (confirm exact value)") |
| Tipos de cuantizacion | Formato GGUF; el desglose exacto de quants publicados no esta disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (codigo y lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio base khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled contiene los pesos sin cuantizar) |
| Tamano del repositorio | 28,6 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled, a su vez fine-tune de Qwen/Qwen3.8-27B |
| Dataset de entrenamiento | DSFFGFG456/fable-5-coding-and-debugging-traces |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer denso de aproximadamente 27.000 millones de parametros con licencia Apache 2.0. No se ha publicado en la informacion disponible ningun cambio estructural (atencion lineal, capas MoE, hibridacion con SSM ni decodificacion especulativa propia) introducido por el ajuste. La model card describe el metodo como destilacion sobre trazas de razonamiento curadas, con una anotacion ambigua entre SFT y LoRA ("SFT / LoRA") que no queda resuelta en el texto.

El entrenamiento utilizo 195 millones de tokens de trazas destiladas para escenarios de codigo y depuracion agentica. Segun el autor, las trazas priorizan tres comportamientos: leer y verificar el estado del proyecto (ficheros, arneses de test, configuraciones de CI) antes de proponer una correccion; trabajar dentro de las restricciones existentes de codigo y formato de salida en lugar de reescribir sin necesidad; y mantener un razonamiento conciso y anclado en evidencia frente a cadenas de pensamiento largas y especulativas. El ejemplo incluido en la model card compara el comportamiento del fine-tune con el del modelo base en una tarea de depuracion de un script de shell con errores de comillas en un pipeline de CI: el fine-tune inspecciona primero los ficheros reales, mientras que el base razona sobre lo que el script "podria" contener y propone un parche basado en suposiciones. No se detallan hiperparametros, composicion exacta del dataset ni hardware de entrenamiento; la propia model card marca esos campos como pendientes de rellenar.

## Capacidades

- Generacion de texto y razonamiento en el dominio de ingenieria de software, con enfasis en codigo, depuracion y analisis de causa raiz.
- Razonamiento agentico con uso de herramientas: el ajuste esta explicitamente orientado a leer ficheros, ejecutar comprobaciones y verificar estado antes de actuar.
- Flujos de trabajo de shell, arneses de test, CI y lint, segun la descripcion del dataset de destilacion.
- Revision de codigo y refactorizacion dentro de las restricciones de un proyecto existente, evitando reescrituras innecesarias.
- Soporte conversacional multi-turno (etiqueta "conversational" en el repositorio).
- Capacidad multimodal declarada a nivel de pipeline (image-text-to-text), aunque no se documenta en la model card que el ajuste de destilacion haya entrenado o preservado dicha capacidad.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio y la model card.
- No se documenta soporte explicito de function calling con esquemas JSON, modo thinking separado, audio ni otras capacidades especiales mas alla de lo anterior.

## Casos de uso

- Asistente de codigo agentico sobre repositorios: el modelo esta entrenado para inspeccionar primero la estructura y los ficheros relevantes y despues proponer cambios, lo que encaja en agentes que operan con acceso a sistema de ficheros y terminal.
- Depuracion de fallos de CI: dado un pipeline que falla, el modelo puede leer el script o la configuracion implicada, localizar el origen (por ejemplo, errores de comillas en shell) y proponer una correccion que respete el formato de salida fijado por el proyecto.
- Analisis de causa raiz sobre errores de lint o de compilacion: interpretacion del mensaje, localizacion del fragmento responsable y propuesta de parche minimo.
- Revision de codigo automatizada en pull requests: comentarios acotados y justificados sobre el diff, con verificacion del contexto del repositorio antes de opinar.
- Refactorizacion conservadora: reescritura de funciones manteniendo interfaces publicas y contratos existentes, comportamiento que el ajuste refuerza explicitamente.
- Automatizacion de tareas de mantenimiento en monorepos: actualizacion de dependencias o scripts con validacion previa del estado del proyecto y de los tests existentes.
- Generacion de parches asistida por terminal en local: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin GPU de datacenter, lo que lo hace util para asistentes de linea de comandos con requisitos de privacidad.
- No se recomienda su uso como asistente de chat generalista: la propia model card lo desaconseja sin una evaluacion adicional, dado que el ajuste esta centrado en codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y el repositorio de HuggingFace no incluyen tablas de MMLU, HumanEval, SWE-bench, GSM8K ni ninguna otra metrica cuantitativa. El unico dato comparativo aportado es cualitativo: la descripcion del comportamiento del fine-tune frente al modelo base en una tarea de depuracion de script de shell en CI, sin cifras asociadas.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritmeticas a partir del numero de parametros real (26,9 B) y no provienen de mediciones publicadas por el autor.

- VRAM aproximada para inferencia: unos 54 GB en FP16/BF16; alrededor de 29 GB en cuantizacion Q8_0; en torno a 21-22 GB en Q6_K; aproximadamente 18-19 GB en Q5_K_M; y del orden de 16-17 GB en Q4_K_M (mas overhead de contexto y cache KV).
- GPU de datacenter: A100 80 GB, H100 80 GB o similares permiten FP16 con contexto amplio y varios usuarios concurrentes; una A100 40 GB admite cuantizaciones de 8 bits o inferiores.
- GPU de consumo: cabe en RTX 4090 (24 GB) en Q4_K_M y Q5_K_M con contexto moderado, y en RTX 3090 (24 GB) en las mismas cuantizaciones; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantizaciones bajas y contexto reducido. En hardware de 12 GB o menos requiere descarga de capas a CPU, con perdida notable de velocidad.
- Opciones de despliegue: llama.cpp y Ollama para el formato GGUF; LM Studio para uso de escritorio; vLLM y TGI si se dispone de los pesos sin cuantizar (el repositorio base contiene safetensors); servidores GGUF compatibles con endpoints segun la etiqueta "endpoints_compatible".
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este modelo ni para sus cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento para este modelo, por lo que la comparativa se limita a caracteristicas estructurales declaradas. Los datos de las alternativas corresponden a sus especificaciones publicas habituales y no forman parte de la informacion proporcionada en esta busqueda; se marcan como no verificados.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF | 26,9 B (denso) | No disponible | Apache 2.0 | GGUF | Ajuste de codigo agentico sobre 195 M tokens de trazas destiladas; 0 descargas |
| khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled | 26,9 B (denso) | No disponible | Apache 2.0 | safetensors (formato no confirmado) | Modelo fuente de la cuantizacion |
| Qwen/Qwen3.8-27B | ~27 B (denso) | No disponible | Apache 2.0 | No disponible | Modelo base sin ajustar; carece del comportamiento "verificar antes de corregir" |
| Alternativas de codigo de tamano comparable (por ejemplo, modelos de la familia Qwen-Coder o Codestral) | No verificado | No verificado | No verificado | No verificado | No se han encontrado datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Model card incompleta: el propio autor deja marcadores de plantilla sin rellenar sobre herencia exacta de licencia, composicion y procedencia del dataset, hiperparametros y hardware de entrenamiento.
- Licencia: Apache 2.0 declarada, pero el autor indica que la herencia desde el modelo base esta "por confirmar"; conviene verificar los terminos de Qwen/Qwen3.8-27B antes de un uso comercial.
- Idiomas: soporte declarado unicamente en ingles, tanto para lenguaje natural como para codigo. No hay evaluacion de rendimiento en castellano.
- Sesgos y alucinacion: hereda las limitaciones generales del modelo base, incluida la posibilidad de alucinar sobre bases de codigo desconocidas y la existencia de una fecha de corte de conocimiento no especificada en la informacion disponible.
- El modelo no ejecuta codigo en un sandbox por si mismo; la verificacion depende de que el agente que lo orquesta le proporcione acceso real a ficheros y terminal.
- La destilacion se centro en trazas de codigo y depuracion agentica; la calidad en chat general y en razonamiento no relacionado con programacion no ha sido evaluada por separado.
- Riesgo en tareas fuera de distribucion (mas alla de depuracion de shell, CI y arneses de test) sin validacion previa en produccion.
- Longitud de contexto no confirmada: planificar el despliegue asumiendo un valor concreto sin verificarlo puede degradar tareas de repositorio completo.
- Madurez: 0 descargas y 1 like en el momento de la consulta; no hay reportes independientes de calidad ni de estabilidad.
- La capacidad multimodal declarada por el pipeline (image-text-to-text) no esta documentada ni validada en la model card de este ajuste.

## Enlaces

- Repositorio GGUF: https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled-GGUF
- Modelo fuente (pesos sin cuantizar): https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5-Coding-Distilled
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de destilacion: https://huggingface.co/datasets/DSFFGFG456/fable-5-coding-and-debugging-traces
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a contenidos no relacionados sobre fondos interprofesionales italianos y se han descartado). No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos asociados al modelo en la informacion disponible.
