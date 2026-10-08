# neuphonic/neudecide

## Resumen

NeuDecide es un modelo publicado por Neuphonic bajo el identificador `neuphonic/neudecide`, orientado a la comprensión de lenguaje hablado (SLU, *spoken language understanding*) y a la invocación de funciones y herramientas (*function calling* / *tool calling*) directamente a partir de audio. A diferencia de los pipelines clásicos de ASR seguidos de un LLM de texto, el modelo se distribuye con la etiqueta de pipeline `audio-classification`, lo que indica que su salida es una decisión estructurada (por ejemplo, la función o herramienta que debe invocarse) en lugar de una transcripción literal.

El modelo está empaquetado en formato ONNX y etiquetado explícitamente como *on-device*, lo que sugiere que está pensado para ejecutarse en dispositivos con recursos limitados —teléfonos, asistentes embebidos o hardware de borde— sin depender de una API en la nube. Está entrenado únicamente para inglés (`en`) y se distribuye con licencia Apache 2.0, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace.

Su relevancia actual radica en la combinación de tres factores: inferencia local en formato ONNX, orientación a agentes con llamadas a herramientas y procesamiento directo de audio. Esto encaja con la tendencia de asistentes de voz y agentes conversacionales que necesitan decidir acciones sin enviar audio a servidores externos. No se han publicado en la información disponible datos sobre arquitectura, número de parámetros ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si el repo incluye variantes cuantizadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Pipeline declarado | audio-classification |
| Tamano del repositorio | 0.0 GB (segun metadatos de HuggingFace) |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible informacion sobre la arquitectura interna del modelo (tipo de red, capas, mecanismo de atencion, si combina un encoder de audio con una cabeza de clasificacion o con un decodificador de texto). Tampoco se especifican el numero de parametros, el volumen de tokens o horas de audio empleados en el entrenamiento, ni la composicion del dataset.

Los metadatos si permiten inferir algunos rasgos de diseno: el uso de ONNX y la etiqueta `on-device` apuntan a un modelo compacto optimizado para inferencia local, y las etiquetas `function-calling`, `tool-calling` y `spoken-language-understanding` indican que la tarea objetivo es mapear una entrada de audio a una llamada a funcion estructurada. No hay informacion disponible sobre si se aplicaron tecnicas de ajuste como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Comprension de lenguaje hablado: procesa audio de entrada para extraer la intencion del hablante.
- Function calling / tool calling a partir de audio: el modelo esta disenado para decidir que funcion o herramienta invocar segun lo dicho por el usuario.
- Clasificacion de audio: el pipeline declarado en HuggingFace es `audio-classification`.
- Ejecucion en dispositivo (on-device): el formato ONNX y la etiqueta correspondiente permiten desplegarlo localmente.
- Integracion en flujos de agentes: por su naturaleza de invocacion de herramientas, encaja en arquitecturas de agente con pasos encadenados, aunque no se detalla soporte explicito de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Modo de razonamiento explicito (thinking mode), vision o generacion de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo puede ejecutarse localmente en ONNX y decidir que accion tomar a partir de una orden hablada, evitando enviar audio a la nube y reduciendo latencia y coste de red.
- Automatizacion del hogar por voz: interpretar ordenes como encender luces o ajustar termostatos y traducirlas a llamadas a funciones de un sistema domotico, sin necesidad de un LLM remoto.
- Agentes de atencion al cliente con entrada de voz: clasificar la intencion del cliente desde el audio y enrutar la llamada a la herramienta o flujo adecuado dentro de un CRM.
- Interfaces manos libres en movilidad: en contextos donde el usuario no puede mirar la pantalla (conduccion, industria), el modelo permite mapear comandos hablados a acciones concretas del sistema.
- Automatizacion de flujos internos mediante comandos de voz: integrar el modelo en herramientas de productividad para que el usuario invoque funciones (crear tareas, consultar datos) hablando.
- Procesamiento de audio en el borde con restricciones de privacidad: sectores como salud o banca, donde no es aceptable enviar audio a servicios externos, pueden beneficiarse de la inferencia local.
- Componente de enrutado en pipelines de voz: usar el modelo como primera etapa que decide si la peticion requiere una herramienta concreta antes de pasar a un LLM de texto mas grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no conocerse el numero de parametros ni las variantes cuantizadas incluidas en el repositorio, no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el diseno orientado a *on-device* y el formato ONNX sugieren que el modelo es lo bastante pequeno para hardware modesto, pero no hay cifras confirmadas.
- Opciones de despliegue: al distribuirse en ONNX, puede ejecutarse mediante ONNX Runtime; el resto de runners (vLLM, llama.cpp, Ollama, TGI) no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de `neuphonic/neudecide` que permitan una comparacion cuantitativa. La tabla siguiente recoge categorias de alternativas potenciales dentro del espacio de comprension de audio y function calling, marcando como "no disponible" cualquier dato que no pueda confirmarse.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neuphonic/neudecide | SLU + function calling sobre audio, on-device | no disponible | no disponible | Apache 2.0 | ONNX, acceso gated |
| Alternativas de SLU sobre audio | Comprension de lenguaje hablado | no disponible | no disponible | no disponible | no disponible |
| Alternativas de function calling multimodal | Tool calling con entrada de audio | no disponible | no disponible | no disponible | no disponible |

Nota: no se han identificado en la informacion proporcionada modelos comparables concretos con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Idioma: el modelo declara soporte unicamente para ingles, por lo que su uso en castellano u otros idiomas no esta garantizado.
- Sesgos conocidos: no disponibles; no se ha publicado documentacion sobre evaluacion de sesgos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En tareas de invocacion de herramientas, una clasificacion erronea puede derivar en la ejecucion de una accion no deseada, por lo que se recomienda validacion adicional en produccion.
- Acceso restringido: el repositorio es *gated* y requiere aceptar condiciones en HuggingFace antes de poder descargar los pesos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar los terminos adicionales asociados al acceso restringido y las condiciones de Neuphonic.
- Ausencia de especificaciones: no hay informacion publica sobre parametros, contexto, dataset de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para produccion sin pruebas propias.
- Tamano de repositorio reportado como 0.0 GB: este dato puede deberse a que los ficheros no son visibles sin acceso, por lo que no debe interpretarse como ausencia de pesos.

## Enlaces

- HuggingFace: https://huggingface.co/neuphonic/neudecide
- Organizacion Neuphonic en HuggingFace: https://huggingface.co/neuphonic
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios o demos adicionales.
