# MANGSEOK123/qwen3-4b-tau2-telecom_u1_sample74-1ep

## Resumen

El modelo `MANGSEOK123/qwen3-4b-tau2-telecom_u1_sample74-1ep` es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en HuggingFace. Se trata de un modelo denso de 4.411.424.256 parámetros (aproximadamente 4,41 mil millones) entrenado específicamente sobre el dominio **telecom** del benchmark tau2-bench, que evalúa agentes conversacionales capaces de resolver tareas de atención al cliente mediante llamadas a herramientas y diálogo multi-turno.

El entrenamiento sigue una receta de destilación de experiencia (etiquetas `oel` y `experience-distillation`): el alumno reproduce cada tarea sin memoria en el prompt, mientras que el profesor son los mismos pesos con la memoria de esa tarea inyectada en el mensaje de sistema. Solo difiere el prompt y no se utiliza ninguna función de recompensa; la pérdida es una KL completa sobre todos los tokens de respuesta con `kl_topk` 256. El conjunto de entrenamiento es muy reducido: 72 pares tarea-memoria, batch size 6 y una única época con learning rate constante de 3e-6.

Su relevancia es acotada y experimental: el autor indica explícitamente que el modelo **no fue evaluado** tras el entrenamiento y que se subió directamente. La referencia disponible es que el modelo base obtiene `avg 0.056 / pass@4 0.175` en el split de test de tau2-bench telecom. Licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajustado desde Qwen/Qwen3-4B-Instruct-2507 |
| Parámetros totales | 4.411.424.256 (4,41 B), dato real de safetensors |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; la receta de despliegue del autor usa `--max-model-len 40960` |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer denso de decodificación autorregresiva. El ajuste no modifica la topología: se parte de los pesos del modelo base y se aplica una consolidación mediante destilación de experiencia sobre el dominio telecom. En cada paso de entrenamiento, el estudiante reproduce una tarea de tau2-bench sin memoria en el prompt, mientras que el profesor es exactamente el mismo conjunto de pesos con la memoria de esa tarea insertada en el mensaje de sistema. La única diferencia entre ambas condiciones es el prompt, y la pérdida se calcula como KL completa sobre todos los tokens de respuesta, con `kl_topk` 256. No se emplea reward model ni RL; el simulador de usuario es gpt-4.1-mini con temperatura 0.

La configuración declarada es: 72 pares tarea-memoria, batch size 6, 1 época, learning rate 3e-6 constante, gradient clipping 1.0 (valor por defecto de verl). El autor publica una tabla de 12 pasos con KL loss, entropía y norma del gradiente, y advierte que cada paso lee un batch distinto, por lo que la columna de pérdida refleja la dificultad del batch y no una curva de convergencia. Los valores de KL oscilan entre 0.007 y 0.096, con un pico de norma de gradiente de 18.221 en el paso 10.

## Capacidades

- Generación de texto conversacional multi-turno en el contexto de atención al cliente de telecomunicaciones.
- Ejecución de tareas de agente con llamadas a herramientas (tool calling), tal y como refleja la receta de despliegue con `--enable-auto-tool-choice` y `--tool-call-parser hermes`.
- Resolución de tareas tipo tau2-bench: el agente debe interactuar con un simulador de usuario y consultar o modificar estado mediante herramientas para completar el objetivo.
- Razonamiento de varios pasos orientado a la resolución de incidencias (diagnóstico, consulta de datos de cliente, aplicación de cambios).
- Capacidades generales heredadas del modelo base Qwen3-4B-Instruct-2507 (no verificadas ni evaluadas por el autor en esta versión).
- Capacidades multilingües: no disponibles como dato explícito; las etiquetas del repositorio no declaran idiomas.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking mode) en esta ficha.

## Casos de uso

- **Agente de soporte técnico de telecomunicaciones**: el modelo está entrenado específicamente sobre el dominio telecom de tau2-bench, por lo que puede gestionar diálogos en los que debe identificar el problema del cliente, consultar el estado de su cuenta o línea mediante herramientas y aplicar la resolución adecuada.
- **Automatización de atención al cliente multi-turno**: con `--max-model-len 40960` configurado en la receta del autor, admite conversaciones largas con historial extenso, útil para incidencias que requieren muchos intercambios antes de resolverse.
- **Prototipado de agentes con tool calling**: sirve como base para validar pipelines de agentes en vLLM usando el parser `hermes`, antes de escalar a modelos mayores con mejor rendimiento.
- **Investigación en destilación de experiencia**: el repositorio documenta una receta reproducible (KL completa, profesor con memoria, sin reward) útil para estudiar cómo se transfiere conocimiento contextual de un prompt a los pesos.
- **Banco de pruebas de evaluación de agentes**: puede integrarse en harnesses de tau2-bench como modelo de referencia de bajo coste, teniendo en cuenta que la versión publicada no fue evaluada por el autor.
- **Despliegue en entornos con presupuesto de GPU limitado**: al ser un modelo de 4,41 B en safetensors de 8,8 GB, cabe en GPUs de consumo de 24 GB y permite levantar un servicio de inferencia en una sola tarjeta.
- **Generación de respuestas guiadas por procedimientos**: el uso de memorias de tarea en el prompt del profesor sugiere aplicaciones donde se quiera condicionar el comportamiento del agente con manuales operativos o runbooks internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este modelo en la información disponible. El autor indica explícitamente que el modelo **no fue evaluado** y que se subió directamente tras el entrenamiento.

El único dato numérico proporcionado es la referencia del modelo base sobre el split de test de tau2-bench telecom:

| Modelo | Benchmark | avg | pass@4 |
|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (base) | tau2-bench telecom (test split) | 0.056 | 0.175 |
| MANGSEOK123/qwen3-4b-tau2-telecom_u1_sample74-1ep | tau2-bench telecom (test split) | no evaluado | no evaluado |

## Requisitos de hardware

- Peso de los safetensors: 8,8 GB en el repositorio, lo que corresponde aproximadamente a precisión BF16/FP16 para 4,41 B de parámetros.
- VRAM estimada en BF16: en torno a 9-10 GB solo para pesos; hay que añadir la caché KV, que con `--max-model-len 40960` puede suponer varios GB adicionales en función del tamaño de batch (estimación, no es un dato publicado por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue con concurrencia alta; RTX 4090 o RTX 3090 (24 GB) para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, RTX 4090) con comodidad; en tarjetas de 16 GB el margen es estrecho y probablemente exija reducir la longitud de contexto o cuantizar, aunque no se publican pesos cuantizados.
- Opciones de despliegue: vLLM es la única documentada por el autor, con el comando `vllm serve MANGSEOK123/qwen3-4b-tau2-telecom_u1_sample74-1ep --enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`. No se documentan recetas para llama.cpp, Ollama ni TGI, y no hay GGUF publicado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | tau2-bench telecom (avg / pass@4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-telecom_u1_sample74-1ep | 4,41 B | no disponible en la model card (receta con 40960) | no evaluado | Apache-2.0 | safetensors en HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4 B aprox. | no disponible en la información proporcionada | 0.056 / 0.175 | Apache-2.0 | safetensors en HuggingFace |
| Otros modelos comparables de 4 B orientados a agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros en la información proporcionada para establecer comparaciones adicionales fiables.

## Limitaciones y advertencias

- **Sin evaluación**: el autor declara que el modelo se subió directamente tras el entrenamiento, sin ninguna evaluación posterior. No hay evidencia publicada de que mejore al modelo base en tau2-bench telecom ni de que no haya degradado otras capacidades.
- **Riesgo de sobreajuste**: el ajuste se hizo con solo 72 pares tarea-memoria, batch size 6 y 1 época, sobre un único dominio. Es plausible un ajuste muy estrecho a los patrones de esas tareas concretas.
- **Olvido catastrófico potencial**: al entrenar con destilación KL sobre un dominio específico, pueden degradarse capacidades generales del modelo base (código, matemáticas, conocimiento general, multilingüismo) no evaluadas aquí.
- **Pérdida de convergencia no interpretable**: el propio autor advierte que cada paso lee un batch distinto, de modo que la columna de KL loss mide dificultad del batch y no convergencia; la norma de gradiente alcanza 18.221 en el paso 10.
- **Alucinación**: no hay datos específicos de tasa de alucinación. En tareas de agente con herramientas, el riesgo es que el modelo afirme haber ejecutado acciones que no ha realizado o invente datos de cuenta o incidencias.
- **Sesgos**: no se documenta ningún análisis de sesgos. Los sesgos heredados del modelo base Qwen3 y del simulador de usuario gpt-4.1-mini con temperatura 0 no han sido caracterizados.
- **Idiomas**: no se declaran idiomas soportados; el entrenamiento se realizó sobre tareas de tau2-bench telecom, presumiblemente en inglés, aunque esto no se explicita.
- **Contexto**: la model card no declara la longitud de contexto nativa; la configuración de 40960 tokens proviene únicamente del comando de despliegue con vLLM.
- **Cuantización**: no se publican pesos cuantizados ni archivos GGUF, por lo que el despliegue en entornos con poca VRAM requiere cuantizar manualmente.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero al derivar de Qwen3-4B-Instruct-2507 conviene revisar también las condiciones del modelo base.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni documentación adicional más allá de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom_u1_sample74-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/MANGSEOK123
- tau2-bench: no se proporciona enlace en la model card
- Paper o blog del método OEL: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
