# Sohailhosseini/UI-Mate-9B-FP8

## Resumen

UI-Mate-9B-FP8 es una cuantizacion en punto flotante de 8 bits (FP8) del modelo tencent/UI-Mate-9B, un agente multimodal especializado en interfaces graficas desarrollado por Tencent. El modelo original convierte intenciones expresadas en lenguaje natural en acciones multi-paso sobre interfaces de usuario, percibiendo la pantalla, fundamentando elementos y ejecutando flujos de trabajo completos. Esta version cuantizada reduce el peso del modelo de 18.8 GB a 11.9 GB (una compresion de 1.58x) sin perdida significativa de calidad y sin necesidad de datos de calibracion, lo que la convierte en una opcion interesante para despliegues en produccion con presupuesto de VRAM ajustado.

La cuantizacion FP8 se aplica exclusivamente a las capas lineales del modelo, dejando intactas las capas visuales, el proyector multimodal y la cabeza de clasificacion. El modelo hereda la licencia Apache 2.0 del modelo fuente y requiere hardware con compute capability igual o superior a 8.9 (GPUs Ada o Hopper) para ejecutarse con buen rendimiento. Se distribuye en formato compressed-tensors y esta preparado para su uso directo con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen 3.5 segun los tags del repositorio |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (segun la configuracion recomendada de vLLM) |
| Tipos de cuantizacion | FP8 (8-bit weights, esquema compressed-tensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base tencent/UI-Mate-9B es un agente GUI multimodal que combina un codificador visual con un modelo de lenguaje para percibir interfaces graficas, fundamentar elementos en pantalla y ejecutar acciones multi-paso. Los tags del repositorio indican que la arquitectura subyacente pertenece a la familia Qwen 3.5, aunque no se dispone de confirmacion oficial en la informacion proporcionada.

La cuantizacion FP8 se ha realizado con la herramienta HF-quantized, aplicando el esquema de 8 bits a todas las capas lineales del modelo. Las capas que se dejan sin cuantizar son lm_head y todos los componentes visuales (vision tower, vision model, vision encoder, multi-modal projector y merger), que se mantienen en precision completa para preservar la calidad de la percepcion visual. El proceso no requiere datos de calibracion y se describe como near-lossless. No se proporcionan datos sobre el entrenamiento original del modelo base (tokens, composicion del dataset, uso de RLHF o DPO) en la informacion disponible.

## Capacidades

- Percepcion de interfaces graficas: el modelo es capaz de analizar capturas de pantalla y comprender la estructura visual de aplicaciones web o de escritorio.
- Ejecucion de acciones multi-paso: convierte intenciones de alto nivel en secuencias de acciones concretas sobre la interfaz (clic, scroll, escritura, etc.).
- Procesamiento multimodal: acepta entradas combinadas de imagen y texto, generando respuestas de texto.
- Conversacion multi-turno: soporta dialogos continuos con contexto, segun la arquitectura de la familia Qwen 3.5.
- Contexto largo de 32.768 tokens: suficiente para mantener historiales de interaccion extensos durante la ejecucion de tareas complejas.
- Integracion con vLLM: preparado para despliegue en produccion con el motor de inferencia vLLM.

## Casos de uso

- Automatizacion de pruebas de interfaz de usuario: el modelo puede recorrer una aplicacion, identificar elementos visuales y ejecutar flujos de prueba de forma autonoma, reduciendo el esfuerzo manual en pipelines de QA.
- Asistentes de productividad por pantalla: puede actuar como copiloto que controla aplicaciones de escritorio o web para completar tareas administrativas, como rellenar formularios o extraer datos de varias pantallas.
- Robotic Process Automation (RPA): sustituye a los scripts clasicos de RPA basados en selectores por un agente que percibe la interfaz y actua como un humano, adaptandose a cambios visuales sin reprogramacion.
- Automatizacion de navegacion web: capaz de realizar busquedas, comparar resultados y ejecutar transacciones en portales web siguiendo instrucciones en lenguaje natural.
- Asistente de accesibilidad: puede interpretar la pantalla y describir acciones o ejecutarlas para usuarios con discapacidades que no pueden operar la interfaz directamente.
- Agente de automatizacion de herramientas de desarrollo: integrado en un IDE o CLI, puede interactuar con la interfaz de herramientas de desarrollo y ejecutar tareas de configuracion o depuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de arxiv asociado al modelo base (https://arxiv.org/pdf/2608.15930) describe el rendimiento de UI-Mate-9B frente a sistemas como UI-TARS y Qwen-UI-Agent, pero no se incluyen cifras concretas en la documentacion de esta cuantizacion.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 11.9 GB en disco en FP8, por lo que se requiere un minimo de 16 GB de VRAM para cargarlo, aunque se recomienda al menos 24 GB para dejar margen para el contexto y las activaciones.
- Compute capability: es necesario que la GPU soporte compute capability igual o superior a 8.9 (arquitecturas Ada o Hopper) para que la cuantizacion FP8 se ejecute con el rendimiento esperado.
- GPUs compatibles: RTX 4090 (24 GB, Ada), RTX 4080 (16 GB, Ada), H100 (80 GB, Hopper). GPUs Ampere como A100 o RTX 3090 (compute capability 8.6) funcionan pero con un rendimiento significativamente menor en operaciones FP8.
- El modelo fue cuantizado en una A40 (Ampere, compute capability 8.6), lo que confirma que puede ejecutarse en esa arquitectura, aunque de forma mas lenta.
- Opciones de despliegue: vLLM es el motor soportado y recomendado en la documentacion. Tambien podria utilizarse con otras herramientas que soporten compressed-tensors, aunque no se especifican.
- Latencia y throughput: no hay datos publicados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Cuantizacion |
|---|---|---|---|---|---|
| tencent/UI-Mate-9B (base) | 9.4B | no disponible | Apache 2.0 | safetensors | Sin cuantizar (BF16) |
| Sohailhosseini/UI-Mate-9B-FP8 | 9.4B | 32.768 tokens | Apache 2.0 | compressed-tensors | FP8 |
| UI-TARS (ByteDance) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen-UI-Agent (Alibaba) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a la variante cuantizada frente a su modelo base, ya que no se dispone de datos tecnicos detallados de los sistemas alternativos mencionados en el paper (UI-TARS, Qwen-UI-Agent) en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere hardware con compute capability superior o igual a 8.9 para un rendimiento optimo; en GPUs mas antiguas la inferencia puede ser considerablemente mas lenta.
- Los idiomas soportados no estan documentados, por lo que el rendimiento en lenguas distintas del ingles no esta garantizado.
- No se han publicado resultados de benchmarks para esta cuantizacion, por lo que el impacto real de la perdida de precision en tareas complejas de GUI no ha sido medido.
- El modelo puede alucinar elementos de interfaz o acciones inexistentes en pantalla, especialmente en entornos visuales complejos o con baja resolucion.
- No se documentan sesgos especificos del modelo base, pero al ser un modelo multimodal entrenado con datos de interfaz, puede presentar sesgos en la interpretacion de elementos visuales de ciertas culturas o disenos.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribucion, pero la cuantizacion no modifica los permisos del modelo original, por lo que se recomienda revisar la licencia del modelo base tencent/UI-Mate-9B.
- El repositorio no incluye informacion sobre la composicion del dataset de entrenamiento, por lo que se desconoce la cobertura de idiomas y de tipos de interfaz (web, movil, escritorio).

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/Sohailhosseini/UI-Mate-9B-FP8
- Modelo base en Hugging Face: https://huggingface.co/tencent/UI-Mate-9B
- Paper de UI-Mate: https://arxiv.org/pdf/2608.15930
- Perfil de GitHub del autor: https://github.com/shosseini811
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=HNcymWUAAAAJ&hl=en
