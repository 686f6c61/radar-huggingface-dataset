# liskasYR/Nex-N2.5-Max

## Resumen

Nex-N2.5-Max es un modelo de generacion de texto de tipo Mixture-of-Experts (MoE) con aproximadamente 1,6 billones de parametros totales (1.600.787.478.430 segun los pesos en safetensors), desarrollado por Nex-AGI y publicado en Hugging Face. El repositorio analizado aqui es `liskasYR/Nex-N2.5-Max`, un alojamiento bajo el usuario `liskasYR` cuya model card remite a los enlaces oficiales de Nex-AGI (GitHub, coleccion de Hugging Face, sitio web y acceso alojado en OpenRouter). Forma parte de la familia Nex-N2.5, compuesta por tres tamanos: mini, Pro y Max.

Segun la model card, es el primer esfuerzo completo de post-entrenamiento de Nex-AGI a escala de billon de parametros, orientado a tareas agénticas de horizonte largo en entornos reales: operar ordenadores y navegadores, ejecutar y probar programas de forma autonoma y autoconregirse mediante retroalimentacion visual. A diferencia de Nex-N2.5-mini y Nex-N2.5-Pro, que son multimodales, Nex-N2.5-Max es un modelo de base MoE unicamente de texto.

El modelo resulta relevante porque combina una escala poco habitual en pesos abiertos (1,6 T de parametros, con licencia Apache 2.0) con resultados competitivos en benchmarks de codigo y agentes, y porque su publicacion aporta experiencia practica sobre post-entrenamiento agéntico a escala de billon de parametros. El repositorio ocupa 1654,6 GB, incluye pesos en safetensors y esta etiquetado con fp8, lo que condiciona por completo su despliegue en hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); etiqueta de arquitectura `deepseek_v4` en el repositorio |
| Parametros totales | 1.600.787.478.430 (aproximadamente 1,6 T) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (etiqueta del repositorio); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales del repositorio: autor `liskasYR`, pipeline `text-generation`, libreria `transformers`, 53 descargas, 0 likes, 1654,6 GB de tamano, creado y actualizado el 13 de septiembre de 2026. Etiquetas: `transformers`, `safetensors`, `deepseek_v4`, `text-generation`, `conversational`, `endpoints_compatible`, `fp8`, `region:us`.

## Arquitectura y entrenamiento

Nex-N2.5-Max se construye sobre un modelo de base MoE de 1,6 billones de parametros y modalidad exclusivamente textual. La model card lo describe como el primer post-entrenamiento completo de Nex-AGI a escala de billon de parametros, dentro de una familia que incluye variantes multimodales de menor tamano (mini y Pro) centradas en computer use, navegacion web y capacidades agénticas con base visual. La etiqueta `deepseek_v4` del repositorio apunta a la familia de arquitectura empleada, si bien no se detallan en la informacion disponible el numero de expertos, el ratio de activacion, el mecanismo de atencion ni la longitud de contexto.

En cuanto al entrenamiento, la informacion proporcionada indica que se ampliaron los entornos de entrenamiento agéntico, los tipos de tarea y los escenarios de productividad, con retroalimentacion mas rica del entorno, y que los modelos pueden operar ordenadores y navegadores, ejecutar y probar programas de forma autonoma y autocorregirse a partir de retroalimentacion visual. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO; tampoco se detallan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Codigo: la model card reporta evaluaciones en Terminal-Bench 2.1, SWE-Bench Pro y DeepSWE v1.1, orientadas a tareas de ingenieria de software.
- Flujos agénticos: evaluado en AutomationBench v1.0.6 y Toolathlon Verified, lo que indica soporte de uso de herramientas y automatizacion de tareas.
- Ejecucion autonoma de programas: segun la model card, los modelos de la familia pueden ejecutar y probar programas por si mismos.
- Computer use y navegacion web: la familia Nex-N2.5 opera ordenadores y navegadores; en el caso de Max, la model card lo describe como modelo de base unicamente de texto, por lo que la percepcion visual corresponde a las variantes mini y Pro.
- Autocorreccion mediante retroalimentacion: la model card destaca la capacidad de actuar de forma continua y autocorregirse a partir de la retroalimentacion del entorno.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking, audio, vision): no disponible para Max; vision no aplica segun la propia model card.

## Casos de uso

- Ingenieria de software asistida en repositorios reales: con 65,7 en SWE-Bench Pro y 65,6 en DeepSWE v1.1, el modelo esta orientado a resolver issues y modificar bases de codigo existentes, no solo a generar fragmentos aislados.
- Automatizacion de terminal y CI/CD: su resultado de 86,1 en Terminal-Bench 2.1 indica que puede encadenar comandos, interpretar salidas y corregir errores en un shell, lo que encaja en pipelines de construccion, pruebas y despliegue.
- Agentes de automatizacion de flujos de trabajo: con 50,2 en AutomationBench v1.0.6, es adecuado para orquestar tareas administrativas o de back-office que requieren varios pasos y llamadas a herramientas.
- Uso de herramientas externas en produccion: la evaluacion en Toolathlon Verified sugiere soporte de tool calling y function calling; se integraria como motor de decision en agentes que consultan APIs, bases de datos o servicios internos.
- Asistencia a investigacion y trabajo de conocimiento: la model card menciona mejoras en investigacion cientifica, trabajo de conocimiento y tareas complejas de productividad gracias a la ampliacion de entornos y tipos de tarea.
- Migracion o refactorizacion de codigo a gran escala: al ser un modelo de 1,6 T con licencia Apache 2.0, puede desplegarse on-premise para procesar codigo propietario sin enviarlo a servicios de terceros, siempre que se disponga de la infraestructura necesaria.
- Generacion de codigo en produccion con verificacion automatica: puede generar parches y despues ejecutar las pruebas del propio repositorio para validar el resultado, aprovechando su capacidad de ejecutar y probar programas de forma autonoma.
- Atencion al cliente multi-turno: no hay datos publicados de longitud de contexto que permitan dimensionar esta aplicacion; requeriria verificacion previa con la configuracion real del modelo.

## Benchmarks y rendimiento

Resultados extraidos de la model card. En negrita se marcan los mejores valores del conjunto publicado; el guion indica dato no disponible en la informacion recibida.

| Benchmark | Nex-N2.5-mini | Nex-N2.5-Pro | Nex-N2.5-Max | Claude Opus 5 | GPT-5.6 Sol | Kimi-K3 | GLM-5.3 | DeepSeek-V4-Pro-0813 | Qwen3.8-Max |
|---|---|---|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 73,4 | 82,7 | 86,1 | 89,1 | 88,8 | 88,3 | 88,2 | 87,9 | 86,6 |
| SWE-Bench Pro | 43,8 | 61,2 | 65,7 | 79,2 | 64,6 | 63,3 | 64,6 | 55,4 | 67,7 |
| DeepSWE v1.1 | 36,1 | 55,8 | 65,6 | 73,7 | 72,7 | 67,5 | 66,9 | 62,8 | 69,3 |
| AutomationBench v1.0.6 | 32,3 | 44,2 | 50,2 | 50,3 | 45,8 | 46,7 | 48,2 | 43,2 | 39,8 |
| Toolathlon Verified | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona tambien una evaluacion sobre comprension multimodal, pero los resultados no se incluyen en la informacion disponible. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de conocimiento general.

## Requisitos de hardware

- Pesos: el repositorio ocupa 1654,6 GB y los pesos estan etiquetados como fp8. En fp8, los 1,6 T de parametros ocupan del orden de 1,6 TB de memoria, por lo que un unico nodo de 8 GPU no es suficiente.
- VRAM estimada (calculo derivado del numero de parametros, no dato publicado): aproximadamente 1,6 TB en fp8, aproximadamente 800 GB en 4 bits y aproximadamente 400 GB en 2 bits, sin contar cache KV ni overhead.
- GPU recomendadas: se requiere un despliegue multi-nodo con GPUs de memoria alta (H100 80 GB, H200 141 GB, B200 y similares). Un nodo de 8 x H200 ofrece unos 1,1 TB, insuficiente para fp8; harian falta al menos dos nodos o cuantizacion adicional.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.), ni siquiera con cuantizacion agresiva.
- Opciones de despliegue: la etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints; para servirlo localmente serian necesarios frameworks con soporte multi-nodo como vLLM o SGLang. No hay evidencia de soporte en llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa basada exclusivamente en los modelos incluidos en la tabla de benchmarks de la model card. Los datos de parametros, contexto y licencia de los modelos de referencia no se proporcionan en la informacion disponible.

| Modelo | Parametros | Terminal-Bench 2.1 | SWE-Bench Pro | DeepSWE v1.1 | AutomationBench v1.0.6 | Licencia |
|---|---|---|---|---|---|---|
| Nex-N2.5-Max | 1,6 T (MoE) | 86,1 | 65,7 | 65,6 | 50,2 | Apache 2.0 |
| Claude Opus 5 | no disponible | 89,1 | 79,2 | 73,7 | 50,3 | no disponible (propietario) |
| GPT-5.6 Sol | no disponible | 88,8 | 64,6 | 72,7 | 45,8 | no disponible (propietario) |
| Kimi-K3 | no disponible | 88,3 | 63,3 | 67,5 | 46,7 | no disponible |
| GLM-5.3 | no disponible | 88,2 | 64,6 | 66,9 | 48,2 | no disponible |
| DeepSeek-V4-Pro-0813 | no disponible | 87,9 | 55,4 | 62,8 | 43,2 | no disponible |
| Qwen3.8-Max | no disponible | 86,6 | 67,7 | 69,3 | 39,8 | no disponible |

En el conjunto de datos disponible, Nex-N2.5-Max supera a DeepSeek-V4-Pro-0813 y a Qwen3.8-Max en tres de las cuatro pruebas, y queda por detras de Claude Opus 5 en todas ellas, con una diferencia especialmente amplia en SWE-Bench Pro (65,7 frente a 79,2).

## Limitaciones y advertencias

- El repositorio analizado esta alojado bajo el usuario `liskasYR`, mientras que la model card atribuye el desarrollo a Nex-AGI y enlaza los repositorios oficiales `nex-agi/Nex-N2.5-Max`, `nex-agi/Nex-N2.5-Pro` y `nex-agi/Nex-N2.5-mini`. Conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- La model card esta truncada en la informacion disponible; faltan datos esenciales como longitud de contexto, numero de parametros activos, composicion del dataset e idiomas soportados.
- Es un modelo unicamente de texto. Las capacidades visuales descritas en la model card corresponden a las variantes mini y Pro, no a Max.
- La licencia declarada es Apache 2.0, que permite uso comercial, pero no se especifican en la informacion disponible los terminos adicionales que Nex-AGI pueda aplicar a los pesos originales.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del ingles; la ficha del repositorio no declara idiomas soportados.
- El coste de despliegue es prohibitivo para la mayoria de equipos: 1654,6 GB de pesos y aproximadamente 1,6 TB de memoria en fp8 exigen infraestructura multi-nodo. La inferencia en GPU de consumo no es viable.
- Los resultados de benchmark proceden de la propia model card y no se han verificado de forma independiente; ademas, la tabla de Toolathlon Verified esta incompleta en la informacion recibida.
- No hay informacion sobre latencia, throughput, estabilidad en produccion ni sobre el comportamiento del modelo tras cuantizacion a 4 o 2 bits.

## Enlaces

- Repositorio analizado: https://huggingface.co/liskasYR/Nex-N2.5-Max
- Repositorio oficial Nex-N2.5-Max: https://huggingface.co/nex-agi/Nex-N2.5-Max
- Repositorio oficial Nex-N2.5-Pro: https://huggingface.co/nex-agi/Nex-N2.5-Pro
- Repositorio oficial Nex-N2.5-mini: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Nex-N2.5-Max en ModelScope: https://modelscope.cn/models/nex-agi/Nex-N2.5-Max
- Nex-N2.5-Pro en ModelScope: https://modelscope.cn/models/nex-agi/Nex-N2.5-Pro
- Nex-N2.5-mini en ModelScope: https://modelscope.cn/models/nex-agi/Nex-N2.5-mini
- Coleccion de Hugging Face de la familia: https://huggingface.co/collections/nex-agi/nex-n25
- Repositorio GitHub: https://github.com/nex-agi/Nex-N2.5
- Sitio web: https://nex-agi.com/
- Acceso alojado (Pro): https://openrouter.ai/nex-agi/nex-n2.5-pro
- Acceso alojado (mini): https://openrouter.ai/nex-agi/nex-n2.5-mini
