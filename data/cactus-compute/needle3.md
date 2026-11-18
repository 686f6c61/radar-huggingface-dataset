# Cactus-Compute/needle3

## Resumen

Needle 3 es un modelo de lenguaje de Cactus-Compute disenado especificamente para ejecutarse en dispositivo (on-device) y orientado a tres tareas: tool calling o function calling, extraccion estructurada de datos y generacion de embeddings de texto. Su propuesta central es ofrecer capacidades de "inteligencia" util para agentes en dispositivos de consumo, con un enfasis explicito en el tamano reducido (el autor lo promociona como "sub-50 MB") y en la cuantizacion, lo que lo aleja de los LLM de gran escala y lo acerca al despliegue en movil, navegador o hardware de borde.

El modelo se distribuye con la libreria `cactus-compute` y un artefacto propietario de pesos (`needle3.cact`) acompanado de un checkpoint en `safetensors`. La integracion con Python es directa mediante decoradores de herramientas, lo que sugiere un diseno centrado en pipelines de agentes con llamadas a funciones. El repositorio pesa 4,9 GB, aunque esa cifra corresponde al conjunto de artefactos y no necesariamente al tamano de los pesos en inferencia.

Es relevante ahora porque cubre un nicho concreto: modelos pequenos, cuantizados y ejecutables en local para tareas de orquestacion de herramientas y extraccion de datos, donde no se necesita un LLM generalista grande. Su licencia Apache 2.0 y la disponibilidad de runtime en WebAssembly lo hacen atractivo para integraciones en produccion con requisitos de privacidad y baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion (soportada por el runtime `cactus-compute`; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `needle3.cact` (formato propietario del runtime) y `checkpoints/needle3.safetensors` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (transformer, MoE, SSM u otra), el numero de parametros ni la composicion del dataset de entrenamiento. El autor describe el modelo como orientado a tool calling, extraccion estructurada y embeddings, y lo comercializa bajo el lema "Sub-50 MB Super Intelligence For Consumer Devices", lo que indica un diseno priorizando el tamano reducido y la eficiencia en inferencia.

Tampoco se documentan en la informacion proporcionada el numero de tokens de entrenamiento, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica innovacion implicita es el formato de pesos `.cact` y el runtime asociado, con soporte de WebAssembly y despliegue en dispositivos de consumo. Para detalles de arquitectura y benchmarks, el autor remite a la web oficial de Needle.

## Capacidades

- Tool calling y function calling: el modelo esta disenado para invocar herramientas definidas por el usuario mediante decoradores en Python.
- Extraccion estructurada: orientado a convertir texto libre en datos estructurados.
- Generacion de embeddings de texto: el modelo declara capacidad de producir representaciones vectoriales.
- Ejecucion on-device: pensado para dispositivos de consumo y entornos de borde.
- Soporte de WebAssembly: el runtime permite despliegue en navegador.
- Cuantizacion: el modelo se distribuye en formatos cuantizados para reducir huella de memoria.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Agentes locales de tool calling: el modelo puede orquestar llamadas a funciones definidas por el desarrollador (por ejemplo, consultas meteorologicas, APIs internas) sin salir del dispositivo, lo que reduce latencia y evita enviar datos a la nube.
- Extraccion estructurada en movil: conversion de texto libre (correos, mensajes, formularios) en JSON u otras estructuras, ejecutandose en el propio telefono para preservar la privacidad de los datos del usuario.
- Asistentes en navegador: gracias al runtime WebAssembly, puede integrarse en aplicaciones web que necesitan clasificacion o extraccion de datos sin backend.
- Enrutamiento de intenciones en pipelines de agentes: uso del modelo como capa ligera que decide que herramienta invocar antes de llamar a un LLM mayor, reduciendo coste y latencia.
- Busqueda semantica local: generacion de embeddings para indexar y recuperar documentos en dispositivos con recursos limitados.
- Automatizacion de formularios y back-office: extraccion de campos desde documentos o correos en entornos de borde, con la ventaja de no requerir GPU dedicada.
- Preprocesado en pipelines de CI/CD o herramientas de desarrollo: clasificacion y estructuracion de logs o issues en local antes de enviarlos a sistemas centrales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la web oficial de Needle para consultar benchmarks y la demo en navegador.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el autor promociona un tamano inferior a 50 MB, lo que sugiere un consumo de memoria muy bajo en inferencia cuantizada.
- GPU recomendadas: no disponible; el enfoque on-device y WebAssembly sugiere ejecucion en CPU y hardware de borde, sin requerir GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido, aunque no se confirman modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: runtime `cactus-compute` (Python), con soporte de WebAssembly; binarios y plataformas en el repositorio Cactus. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (tool calling on-device) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo pequeno orientado a tareas concretas, su uso fuera de tool calling y extraccion estructurada puede degradar la calidad.
- Idiomas soportados: no disponibles, lo que impide garantizar un rendimiento multilingue adecuado.
- Longitud de contexto: no disponible; puede limitar conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del runtime `cactus-compute` y de los binarios distribuidos por separado.
- Formato de pesos propietario (`.cact`): la portabilidad a otros runtimes puede requerir conversion desde `safetensors`, cuyas herramientas no se detallan.
- Para produccion, verificar en la web oficial los benchmarks y el soporte de plataformas antes de comprometerse con el modelo.

## Enlaces

- [Hugging Face: Cactus-Compute/needle3](https://huggingface.co/Cactus-Compute/needle3)
- [Web oficial de Needle](https://cactuscompute.com/needle)
- [Repositorio Cactus (runtime y binarios)](https://github.com/cactus-compute/cactus)
- [Runtime en Hugging Face: Cactus-Compute/cactus](https://huggingface.co/Cactus-Compute/cactus)
- [Guia: Python API](https://cactuscompute.com/blog/needle-python-docs)
- [Guia: diseno de herramientas](https://cactuscompute.com/blog/designing-tools-for-needle)
- [Guia: extraccion estructurada](https://cactuscompute.com/blog/structured-extraction-with-needle)
- [Guia: fine-tuning](https://cactuscompute.com/blog/finetuning-needle)
