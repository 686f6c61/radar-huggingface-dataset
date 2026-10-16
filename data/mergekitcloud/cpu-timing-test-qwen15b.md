# MergekitCloud/cpu-timing-test-qwen15b

## Resumen

`MergekitCloud/cpu-timing-test-qwen15b` es un modelo de lenguaje de tipo decoder-only obtenido mediante la fusión de dos modelos ya entrenados de la familia Qwen2.5: `Qwen/Qwen2.5-1.5B` (base) y `Qwen/Qwen2.5-1.5B-Instruct` (ajustado para instrucciones). El autor, la organizacion MergekitCloud, lo ha generado con la herramienta mergekit aplicando el metodo SLERP (interpolacion esferica) sobre los pesos de ambos modelos, tomando el rango completo de capas [0, 28] en los dos casos.

Se trata de un merge de tipo "model soup" experimental, no de un entrenamiento desde cero: no hay tokens de entrenamiento nuevos ni fases de RLHF/DPO adicionales sobre el resultado. El nombre del repositorio ("cpu-timing-test") sugiere que se ha creado como artefacto de prueba de tiempos de ejecucion en CPU mas que como modelo destinado a produccion. Cuenta con 1.543.714.304 parametros reales (aproximadamente 1,54 mil millones) verificados en los archivos safetensors, un tamano de repositorio de 3,1 GB y pesos almacenados en bfloat16.

Su relevancia practica es limitada: no tiene descargas ni interacciones, la ficha no documenta licencia, idiomas ni evaluaciones, y la model card se limita a describir la configuracion YAML del merge. Resulta util sobre todo como ejemplo reproducible de fusion SLERP con mergekit y como base ligera para experimentar con inferencia en CPU o en GPUs de gama baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de tipo Qwen2; 28 capas declaradas en la configuracion de merge |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B), verificado en safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No documentada en la ficha de este merge; el modelo base Qwen2.5-1.5B soporta 32.768 tokens |
| Tipos de cuantizacion | No documentados; los pesos se publican en bfloat16. No se ha verificado la publicacion de variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponibles en la ficha; el modelo base Qwen2.5 declara soporte para mas de 29 idiomas |
| Licencia | No disponible (no declarada en el repositorio). Los modelos de origen (Qwen2.5-1.5B y Qwen2.5-1.5B-Instruct) se distribuyen bajo Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 3,1 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con query-key normalization, segun la definicion estandar de la familia Qwen2. El proceso de creacion no ha implicado entrenamiento: los dos modelos fuente se han combinado capa por capa con el metodo SLERP de mergekit, manteniendo el rango de capas [0, 28] de ambos. El parametro de interpolacion `t` no es constante, sino que varia segun el tipo de submodulo: para las capas de auto-atencion (`self_attn`) toma los valores [0, 0,5, 0,3, 0,7, 1] a lo largo de la profundidad, mientras que para los bloques MLP toma los valores inversos [1, 0,5, 0,7, 0,3, 0], con un valor por defecto de 0,5 para el resto de tensores. El tipo de dato de salida es bfloat16.

Al tratarse de un merge SLERP de un modelo base y su version instruct, el resultado tiende a situarse en un punto intermedio entre el comportamiento de continuacion de texto del modelo base y el comportamiento conversacional alineado del modelo instruct. No hay evidencia en la informacion disponible de que se hayan aplicado fases posteriores de ajuste supervisado, RLHF o DPO sobre el modelo fusionado, ni de que se haya realizado una evaluacion de calidad tras el merge. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos u otras).

## Capacidades

- Generacion de texto autoregresiva en modo continuacion, heredada de `Qwen2.5-1.5B`.
- Generacion conversacional multi-turno y seguimiento de instrucciones, heredada de `Qwen2.5-1.5B-Instruct`.
- Razonamiento de complejidad baja a media y resolucion de problemas sencillos, limitado por el tamano de 1,54 B de parametros.
- Generacion de codigo basico y tareas de edicion de texto.
- Capacidades multilingues presumiblemente equivalentes a las del modelo base Qwen2.5 (mas de 29 idiomas), aunque no verificadas en este merge.
- Compatibilidad declarada con `text-generation-inference` y con endpoints compatibles, segun las etiquetas del repositorio.
- No se documenta soporte explicito de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento extendido ("thinking mode"). Dado que el modelo base de la familia Qwen2.5-1.5B-Instruct no incorpora de serie un modo de razonamiento explicito, no cabe asumirlo.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un modelo de 1,54 B en bfloat16, se puede cargar en una GPU de gama media o incluso ejecutar en CPU para validar flujos de dialogo antes de escalar a modelos mayores.
- Inferencia en CPU y en entornos sin GPU: el propio nombre del repositorio apunta a pruebas de tiempos en CPU, por lo que es adecuado para medir latencia y throughput en hardware sin acelerador.
- Experimentacion con tecnicas de merge: sirve como caso reproducible para estudiar el efecto de SLERP con parametros `t` variables por submodulo sobre el comportamiento final del modelo.
- Generacion de texto de bajo coste en pipelines por lotes: tareas de resumen corto, clasificacion generativa o reescritura donde el coste por token importa mas que la calidad punta.
- Educacion y demostraciones: util para ilustrar en clase o tutoriales como funciona un merge de modelos y como se sirve con transformers o TGI.
- Base para ajuste fino ligero (LoRA/QLoRA): al tener un unico modelo denso de 1,54 B, el ajuste fino en una sola GPU consumer es viable, y el punto de partida hibrido base/instruct puede resultar conveniente en algunas tareas.
- Evaluacion comparativa de merges: emplearlo como referencia frente a los modelos Qwen2.5 originales para medir si la fusion introduce regresiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor unicamente describe la configuracion YAML del merge y no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra), ni comparaciones con los modelos de origen.

## Requisitos de hardware

- VRAM estimada en bfloat16/float16: aproximadamente 3,1 GB solo para pesos, mas la cache KV (que crece con la longitud de contexto). Con contextos de 4.000-8.000 tokens y lotes pequenos, el consumo total se situa en el entorno de 4-5 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1,5 GB para pesos, aunque el repositorio no publica variantes GGUF/AWQ/GPTQ, por lo que habria que generarlas.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070, GTX 1660 Super en cuantizacion). En GPUs de datacenter (A100, H100, L40S) cabe sobradamente y se puede servir con lotes grandes.
- Cabe en GPU consumer: si. Un RTX 4090, RTX 3090, RTX 4070 o incluso un portatil con 6-8 GB de VRAM pueden ejecutarlo sin problemas.
- Inferencia en CPU: viable, especialmente con cuantizacion, aunque no se han publicado cifras de latencia ni de throughput.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama si se convierte previamente a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/cpu-timing-test-qwen15b | 1,54 B | No documentada (base: 32.768) | No declarada | Repositorio HuggingFace con 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | Aprox. 1,54 B | 32.768 tokens | Apache 2.0 | Ampliamente disponible y probado en produccion |
| Qwen/Qwen2.5-1.5B | Aprox. 1,54 B | 32.768 tokens | Apache 2.0 | Ampliamente disponible como modelo base |
| Llama-3.2-1B-Instruct | Aprox. 1,24 B | No disponible | Llama 3.2 Community License | Ampliamente disponible |
| Gemma-2-2B-it | Aprox. 2,6 B | No disponible | Gemma Terms of Use | Ampliamente disponible |

El modelo de este repositorio no aporta mejoras verificables frente a sus dos modelos de origen: se construye a partir de ellos y, a falta de evaluaciones, no hay evidencia de que supere a `Qwen2.5-1.5B-Instruct` en seguimiento de instrucciones ni a `Qwen2.5-1.5B` en continuacion de texto. Su interes es experimental.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivarse de Qwen2.5, hereda los sesgos presentes en los datos de entrenamiento de ese modelo, no auditados en esta ficha.
- Riesgo de alucinacion: alto en proporcion a su tamano. Con 1,54 B de parametros, la tendencia a generar contenido plausible pero incorrecto es significativamente mayor que en modelos de 7 B o mas.
- Limitaciones de contexto e idioma: la ficha no declara ni la longitud de contexto efectiva ni los idiomas soportados; se asume lo declarado por el modelo base, sin verificacion.
- Licencia sin declarar: es la advertencia mas relevante para produccion. El repositorio no especifica licencia, por lo que no se puede confirmar que el uso comercial este permitido. Los modelos de origen son Apache 2.0, lo que sugiere que el merge podria heredar esa licencia, pero no hay confirmacion del autor.
- Modelo sin adopcion ni mantenimiento: cero descargas, cero "likes" y una unica actualizacion (dos minutos despues de la creacion), lo que indica que es un artefacto de prueba automatizado y no un modelo mantenido.
- Sin evaluacion de calidad posterior al merge: no hay datos que confirmen que la fusion SLERP no haya degradado las capacidades de los modelos originales.
- Uso en produccion no recomendado sin validacion previa: conviene comparar su salida contra `Qwen2.5-1.5B-Instruct` en las tareas objetivo antes de considerarlo.
- Soporte de tool calling y agentes no confirmado: no debe asumirse su disponibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/cpu-timing-test-qwen15b
- Modelo base instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Referencia sobre SLERP: https://en.wikipedia.org/wiki/Slerp

Nota: la busqueda web asociada no ha devuelto resultados relevantes sobre este modelo, su autor ni la familia Qwen2.5; los enlaces anteriores son los unicos pertinententes disponibles en la informacion proporcionada.
