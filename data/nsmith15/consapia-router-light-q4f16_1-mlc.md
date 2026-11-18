# Nsmith15/consapia-router-light-q4f16_1-MLC

## Resumen

Consapia-router-light-q4f16_1-MLC es un modelo de lenguaje especializado en el enrutamiento de consultas (query routing), desarrollado por Nsmith15 a partir de un ajuste fino de HuggingFaceTB/SmolLM2-1.7B-Instruct. Su funcion principal es descomponer una pregunta del usuario en entre 2 y 6 subtareas y devolverlas estructuradas como un plan en formato JSON, lo que lo convierte en una pieza util dentro de arquitecturas de agentes y sistemas multi-paso que necesitan planificacion previa a la ejecucion.

El modelo se distribuye empaquetado en formato MLC (Machine Learning Compilation) con cuantizacion de 4 bits `q4f16_1`, pensado para su uso con WebLLM, la libreria que permite ejecutar modelos de lenguaje directamente en el navegador mediante WebGPU. Esta orientacion a inferencia en cliente lo hace relevante para aplicaciones web que requieren privacidad, baja latencia y ausencia de dependencia de servidores externos.

Con 1.700 millones de parametros y una licencia Apache 2.0, el modelo se posiciona como una alternativa ligera para tareas acotadas de planificacion y enrutamiento, no como un modelo de proposito general. La informacion publica disponible es muy limitada: el repositorio no incluye datos sobre benchmarks, idiomas soportados ni detalles del proceso de entrenamiento mas alla del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B-Instruct) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (4 bits, formato MLC) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (compilado para WebLLM); tamano del repo 1,0 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-1.7B-Instruct, un modelo de lenguaje pequeno desarrollado por Hugging Face. Sobre esa base, el autor ha realizado un ajuste fino orientado a una tarea concreta: recibir una consulta y generar un plan JSON con entre 2 y 6 subtareas. No se especifica en la informacion disponible el volumen de datos de ajuste fino, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica principal no reside en la arquitectura sino en el empaquetado: los pesos se distribuyen en formato MLC con cuantizacion `q4f16_1`, lo que permite ejecutar el modelo en el navegador mediante WebLLM. Segun la model card, el modelo utiliza la libreria compilada oficial de WebLLM para `SmolLM2-1.7B-Instruct-q4f16_1-MLC`, lo que implica que reutiliza los kernels y el grafo de ejecucion del modelo base. Los cambios respecto al original se documentan en un fichero `NOTICE` incluido en el repositorio.

## Capacidades

- Generacion de planes estructurados: descompone una consulta en 2-6 subtareas y las devuelve como JSON.
- Enrutamiento de consultas: pensado para decidir como dividir una peticion antes de ejecutar agentes o herramientas.
- Generacion de texto y razonamiento basico, heredados del modelo base SmolLM2-1.7B-Instruct.
- Soporte de instrucciones en formato conversacional (modelo base tipo Instruct).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado de forma explicita; la salida JSON del plan podria integrarse en pipelines que lo consuman.
- Modo thinking, vision o audio: no disponible.
- Ejecucion en navegador mediante WebLLM y WebGPU.

## Casos de uso

- Planificacion de agentes en el navegador: el modelo puede recibir la consulta del usuario y generar un plan JSON con subtareas que un orquestador ejecute despues, todo dentro del cliente sin enviar datos a un servidor.
- Enrutamiento de consultas en aplicaciones web de asistencia: dado que la inferencia ocurre en el navegador, permite clasificar y descomponer peticiones preservando la privacidad del usuario.
- Prototipado rapido de sistemas multi-agente: el plan JSON generado sirve como contrato de entrada para pipelines de agentes, reduciendo el trabajo de integracion.
- Aplicaciones offline o de baja conectividad: al ejecutarse con WebLLM, el modelo puede funcionar una vez cargado en el navegador, sin dependencia de una API remota.
- Demos y entornos educativos: su tamano (1,7B en 4 bits, repo de 1,0 GB) permite desplegarlo en portatiles con GPU integrada compatible con WebGPU para mostrar arquitecturas de planificacion.
- Preprocesamiento de consultas en buscadores o sistemas RAG: la descomposicion en subtareas facilita la generacion de multiples consultas de recuperacion a partir de una pregunta compleja.
- Filtrado y clasificacion ligera de peticiones en el cliente antes de enviarlas a un modelo mayor en servidor, reduciendo costes de inferencia remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 1,0 GB en cuantizacion q4f16_1; se requiere memoria de GPU suficiente para cargar los pesos y el estado de ejecucion de WebLLM (tipicamente algo mas de 1 GB).
- GPU recomendadas: cualquier GPU compatible con WebGPU. En la practica, GPUs integradas modernas (Intel Iris Xe, AMD Radeon integradas, Apple Silicon) y GPUs dedicadas (NVIDIA RTX serie 20 o superior, AMD RX 6000 o superior).
- Cabe en GPU de consumo: si, al tratarse de un modelo de 1,7B en 4 bits.
- Opciones de despliegue: WebLLM (principal, via navegador y WebGPU); MLC-LLM para ejecucion nativa; al estar en formato MLC, no es directamente compatible con llama.cpp, Ollama o vLLM sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| consapia-router-light-q4f16_1-MLC | 1,7B | no disponible | MLC (WebLLM) | Apache 2.0 | Enrutamiento y planificacion JSON |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | no disponible | safetensors, GGUF, MLC | Apache 2.0 | Proposito general, instrucciones |
| SmolLM2-360M-Instruct | 360M | no disponible | safetensors, GGUF, MLC | Apache 2.0 | Proposito general, muy ligero |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible | safetensors, GGUF | Apache 2.0 | Proposito general, multilingue |

La comparativa se limita a modelos de tamano similar de la familia SmolLM2 y alternativas ligeras; no hay datos de rendimiento publicados para el modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: su ajuste fino esta orientado a generar planes JSON de 2-6 subtareas; su rendimiento en tareas generales puede degradarse respecto al modelo base.
- Sin datos de benchmarks: no hay evidencia publicada sobre calidad, robustez o tasas de error en la generacion de JSON.
- Riesgo de alucinacion: como todo modelo de 1,7B, puede generar subtareas irrelevantes, planes incompletos o JSON mal formado; se recomienda validacion estricta del esquema en produccion.
- Idiomas no documentados: no se especifica que idiomas soporta el ajuste fino; probablemente herede el sesgo hacia ingles del modelo base.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras el ajuste fino.
- Dependencia de WebLLM: el formato MLC limita el despliegue a entornos compatibles con WebGPU y a la libreria compilada de WebLLM.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los avisos de licencia y el fichero `NOTICE` con los cambios realizados.
- Repositorio practicamente sin traccion (0 descargas, 0 likes en el momento de la consulta): no hay comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nsmith15/consapia-router-light-q4f16_1-MLC
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- WebLLM: https://github.com/mlc-ai/web-llm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
