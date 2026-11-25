# Parvesh2520/myra-cockpit-gemma-270m

## Resumen

MYRA cockpit command model es un ajuste fino (fine-tune) del modelo google/gemma-3-270m-it, publicado por el usuario Parvesh2520 en Hugging Face. Su proposito es muy concreto: convertir una unica orden de voz emitida dentro de un coche, en ingles o en hinglish (mezcla de hindi e ingles), en un array JSON de comandos de cabina que consume la aplicacion de automocion MYRA. No es un modelo de proposito general, sino un componente especializado de un pipeline de voz a accion para un producto concreto.

El modelo hereda la arquitectura transformer decoder-only de Gemma 3 en su variante mas pequena, con 268.098.176 parametros reales segun los pesos en safetensors, y se distribuye unicamente en formato GGUF con cuantizacion Q8_0 para su uso con llama.cpp. El repositorio ocupa aproximadamente 0,3 GB, lo que lo situa en la categoria de modelos que caben holgadamente en cualquier GPU de consumo e incluso en CPU.

Su relevancia es la de un ejemplo tipico de especializacion extrema: en lugar de competir en benchmarks generales, resuelve una tarea de extraccion estructurada (intencion a JSON) con un modelo diminuto, desplegable en el propio vehiculo o en un servidor ligero. La informacion publicada es escasa: no hay datos de entrenamiento, benchmarks ni idiomas declarados mas alla de la mencion al ingles y al hinglish en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); otras no disponibles |
| Idiomas soportados | ingles y hinglish (segun model card); lista formal no disponible |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint instruct google/gemma-3-270m-it, por lo que mantiene la arquitectura transformer decoder-only de la familia Gemma 3 en su tamano minimo. No se ha publicado informacion sobre el proceso de ajuste: ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. Tampoco se detalla si se congelaron capas o se ajusto el modelo completo.

La unica informacion tecnica disponible en la model card es el formato de prompt, basado en los tokens de turno de Gemma (`<start_of_turn>user ... <end_of_turn>` y `<start_of_turn>model ... <end_of_turn>`), y el formato de salida esperado: un array JSON de comandos de cabina. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Conversion de una orden de voz unica en un array JSON de comandos de cabina para la aplicacion MYRA.
- Comprension de ordenes en ingles y en hinglish, segun la model card.
- Salida estructurada en JSON, adecuada para consumo directo por un parser o un motor de acciones del vehiculo.
- Formato de chat compatible con la plantilla de turnos de Gemma 3.
- No se documentan capacidades de tool calling generico, agentes multi-paso, vision, audio ni modo de razonamiento extendido.
- No se documentan capacidades multilingues mas alla del ingles y el hinglish.

## Casos de uso

- Control por voz de la cabina: el modelo recibe la transcripcion de una orden (por ejemplo, subir la temperatura o poner una cancion) y devuelve el array JSON que el middleware del coche traduce en acciones sobre climatizacion, multimedia o navegacion.
- Integracion en asistentes de automocion embebidos: al ser un GGUF Q8_0 de unos 0,3 GB, puede ejecutarse en la unidad de infoentretenimiento o en un modulo periferico con llama.cpp sin depender de la nube.
- Prototipado rapido de interfaces voz-accion: sirve como base para equipos que quieran validar un pipeline de transcripcion (ASR) mas extraccion de intenciones (este modelo) mas ejecucion de comandos antes de invertir en un modelo mayor.
- Soporte de usuarios bilingues ingles-hindi en mercados como la India: el ajuste especifico sobre hinglish cubre un caso que los modelos genericos suelen resolver de forma inconsistente.
- Filtrado y normalizacion de ordenes ambiguas: al forzar una salida JSON, el modelo actua como capa de estructuración entre el reconocimiento de voz y la logica de negocio del vehiculo.
- Despliegue en entornos con conectividad limitada o requisitos de privacidad: al ejecutarse localmente, las ordenes de voz no salen del vehiculo, lo que simplifica el cumplimiento de normativas de datos.
- Evaluacion de tecnicas de fine-tuning de modelos diminutos para tareas de extraccion estructurada, comparando el coste de un 270M frente a alternativas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q8_0, los 268 millones de parametros ocupan aproximadamente 0,27 GB de pesos, mas overhead de contexto y runtime; en la practica, menos de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no requiere A100 ni H100. Una RTX 4090 o una RTX 3060 lo ejecutan con enorme holgura.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, y tambien en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros runtimes compatibles con GGUF; los tags del repositorio indican compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la latencia deberia estar dominada por el coste de carga y por el ASR previo mas que por la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| MYRA cockpit command (este) | 268.098.176 | no disponible | GGUF Q8_0 | Gemma Terms of Use | Extraccion de comandos de cabina a JSON |
| google/gemma-3-270m-it | 270M (aprox.) | no disponible | safetensors, GGUF | Gemma Terms of Use | Modelo instruct de proposito general |
| Modelos de extraccion de intenciones a JSON de 1B-3B | 1B-3B | variable | safetensors, GGUF | variable | Extraccion estructurada generica |

La comparacion cuantitativa con alternativas no esta disponible: no se han publicado metricas de este ajuste frente a su modelo base ni frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Ambito muy restringido: solo esta entrenado para producir comandos de cabina de la aplicacion MYRA; fuera de ese dominio su comportamiento no esta documentado.
- Ausencia total de datos de evaluacion: sin benchmarks ni conjunto de validacion publicado, no hay evidencia objetiva de precision en la extraccion a JSON.
- Riesgo de alucinacion en la estructura de salida: al ser un modelo de 270M, puede generar JSON mal formado o comandos inexistentes ante entradas fuera de distribucion.
- Idiomas limitados en la practica a ingles y hinglish; no se declara soporte formal de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar conversaciones multi-turno o entradas largas.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a las condiciones de Google para la familia Gemma, incluida la obligacion de cumplir la politica de uso aceptable.
- Repositorio sin descargas ni likes en el momento de la consulta y con documentacion minima; no hay garantia de mantenimiento ni de soporte por parte del autor.
- No se documentan sesgos conocidos especificos, pero al derivar de Gemma 3 hereda los sesgos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Parvesh2520/myra-cockpit-gemma-270m
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
