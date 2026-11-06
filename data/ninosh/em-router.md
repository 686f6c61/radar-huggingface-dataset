# ninosh/em-router

## Resumen

em-router es un modelo de generacion de texto publicado por el usuario ninosh en Hugging Face, construido como un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct. Por las etiquetas de la model card ("em", "skill-router", "commit-msg"), el modelo esta orientado a tareas de enrutamiento de habilidades (skill routing) y generacion de mensajes de commit, es decir, un modelo pequeno y especializado mas que un modelo de proposito general. Con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), se situa en la categoria de modelos ligeros desplegables en hardware de consumo.

La relevancia de este modelo reside en su tamano reducido y su licencia Apache 2.0, que permiten integrarlo en herramientas de desarrollo (por ejemplo, asistentes de control de versiones que redactan mensajes de commit) o en sistemas de enrutamiento que deciden que habilidad o herramienta debe activarse ante una peticion. Al derivar de Qwen2.5-1.5B-Instruct, hereda la arquitectura transformer decoder-only de la familia Qwen2.5 y su capacidad conversacional basica.

No obstante, la informacion publicada es muy escasa: la model card es practicamente una plantilla sin rellenar, el repositorio no registra descargas ni interacciones, y no hay datos de entrenamiento, benchmarks ni detalles de la especializacion. Cualquier evaluacion de su calidad real requerira pruebas propias por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | safetensors (precision original) y GGUF (cuantizaciones no especificadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con aproximadamente 1,5 mil millones de parametros. La arquitectura subyacente incluye atencion por cabezas con consultas agrupadas (GQA) y las innovaciones propias de Qwen2.5, aunque la model card no aporta ningun detalle adicional sobre la configuracion concreta de esta variante.

No se dispone de informacion sobre el proceso de entrenamiento: ni el numero de tokens utilizados, ni la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT adicionales sobre el modelo base. Las etiquetas sugieren que el ajuste se centro en dos tareas concretas (enrutamiento de habilidades y generacion de mensajes de commit), pero no hay documentacion que lo confirme ni que describa la metodologia. Tampoco se documentan innovaciones tecnicas especificas de este ajuste.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Enrutamiento de habilidades (skill router): la etiqueta "skill-router" sugiere que el modelo esta entrenado para decidir que habilidad o herramienta corresponde a una peticion dada, aunque no se documenta el formato exacto de entrada/salida.
- Generacion de mensajes de commit: la etiqueta "commit-msg" indica especializacion en redactar mensajes de commit a partir de cambios de codigo, si bien no se detalla el esquema de prompts.
- Capacidad conversacional multi-turno (herencia del modelo base Instruct).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion automatica de mensajes de commit: integrar el modelo en un hook de Git o en un pipeline de CI para que, a partir del diff de cambios, redacte un mensaje de commit en ingles. Su tamano de 1,5 B permite ejecutarlo localmente sin coste de API.
- Enrutamiento de habilidades en asistentes de desarrollo: usar el modelo como clasificador ligero que decida que herramienta (busqueda de codigo, ejecucion de tests, generacion de documentacion) debe activarse ante una consulta del desarrollador.
- Preprocesamiento en pipelines de agentes: emplear el modelo como primer eslabon de bajo coste que etiqueta o clasifica la intencion del usuario antes de invocar un modelo mayor, reduciendo el gasto en inferencia.
- Herramientas de escritorio para desarrolladores: empaquetar el modelo en formato GGUF dentro de un IDE o plugin local para sugerencias de mensajes de commit sin enviar codigo a servicios externos.
- Prototipado rapido de clasificadores de intencion: ajustar o evaluar el modelo como base para tareas de routing en entornos de investigacion con recursos limitados.
- Educacion y demostraciones: utilizar el modelo como ejemplo de ajuste fino de un modelo pequeno para tareas especificas en cursos o talleres sobre LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (fp16/bf16): aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa, no confirmada por el autor).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,6 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): aproximadamente 0,9-1,0 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter (A100, H100) aunque no las aprovecha.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp y Ollama para los pesos GGUF; vLLM, TGI o transformers para los pesos safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ninosh/em-router | 1,54 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste especializado en routing y commit-msg |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face (ampliamente usado) | Modelo base generalista, con benchmarks publicados |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face | Alternativa aun mas ligera para tareas simples |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (segun documentacion del modelo) | Llama 3.2 Community License | Hugging Face | Requiere aceptacion de licencia; no Apache 2.0 |

La comparativa con alternativas especializadas en enrutamiento o generacion de mensajes de commit no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion, lo que impide valorar su calidad de forma objetiva.
- Riesgo de alucinacion: como todo modelo generativo de 1,5 B, puede inventar contenido, especialmente en tareas fuera de su especializacion.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto: no se confirma la longitud de contexto efectiva tras el ajuste; no asumir los 32.768 tokens del modelo base sin verificacion.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen2.5 conviene revisar la licencia del modelo base (tambien Apache 2.0 en este caso).
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de pruebas independientes.
- El repositorio es de 1,1 GB, coherente con los pesos en fp16, pero no se detalla que cuantizaciones GGUF estan incluidas ni sus parametros.
- Para produccion se recomienda evaluar el modelo en el dominio concreto (mensajes de commit, routing) antes de desplegarlo, dado que no hay benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ninosh/em-router
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de referencia citado en la model card (Machine Learning Impact calculator): https://arxiv.org/abs/1910.09700
- Calculadora de impacto: https://mlco2.github.io/impact
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales especificos de este modelo.
