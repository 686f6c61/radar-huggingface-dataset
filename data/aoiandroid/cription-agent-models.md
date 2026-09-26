# aoiandroid/cription-agent-models

## Resumen

`aoiandroid/cription-agent-models` es un repositorio de distribucion que contiene copias sin modificar de dos modelos LiteRT-LM empleados por el asistente en dispositivo de la aplicacion Cription. No se trata de un modelo entrenado por el autor: el repositorio actua como espejo de dos artefactos publicados previamente por `litert-community`, y la aplicacion los descarga mediante un fichero `models.json` alojado en este mismo repositorio.

La peculiaridad del conjunto es su arquitectura dividida en dos roles. Por un lado, un modelo pequeno de seleccion de herramientas (FunctionGemma de 270 M de parametros, cuantizado a int8, fichero `mobile-actions_q8_ekv1024.litertlm`) actua como enrutador que decide que funcion del sistema invocar. Por otro, un Gemma 3 1B IT cuantizado a int4 (`gemma3-1b-it-int4.litertlm`) genera las respuestas y resumenes en lenguaje natural. El tamano total del repositorio es de 0,9 GB.

Su relevancia actual es practica: demuestra un patron de despliegue de agentes en movil con formato LiteRT-LM, pensado para ejecucion local sin conexion y con function calling. El repositorio no registra descargas ni interacciones, no incluye resultados de evaluacion y no documenta idiomas, contexto ni detalles de entrenamiento mas alla de la licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; dos modelos independientes con reparto de roles (enrutador de herramientas + generador de respuestas). No disponible el detalle de capas, atencion o normalizacion |
| Parametros totales | Aproximadamente 1,27 B en conjunto: 270 M (modelo de seleccion de herramientas) + 1 B (modelo de chat) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El nombre del fichero del enrutador, `ekv1024`, sugiere una cache KV externa de 1024 tokens |
| Tipos de cuantizacion | int8 (enrutador, sufijo `q8`) e int4 (chat, sufijo `int4`) |
| Idiomas soportados | No disponible |
| Licencia | Gemma Terms of Use, con sujecion a la Gemma Prohibited Use Policy |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Tamano del repositorio | 0,9 GB |
| Libreria declarada | `litert-lm` |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: empaqueta dos artefactos ya publicados. El primero es `litert-community/functiongemma-mobile-actions_q8_ekv1024.litertlm`, una variante de 270 M de parametros derivada de la familia Gemma y orientada, segun su nombre, a function calling en movil, cuantizada a int8 y con una cache KV aparentemente fijada en 1024 tokens. El segundo es `litert-community/Gemma3-1B-IT`, la version instruction-tuned de Gemma 3 con 1 B de parametros, cuantizada a int4 y convertida a LiteRT-LM.

El patron arquitectonico relevante no esta en la estructura interna de cada red, sino en la composicion: un modelo muy pequeno y barato en computo decide la herramienta a invocar, y un modelo mayor redacta la respuesta final. Este reparto permite mantener la latencia y el consumo de memoria acotados en dispositivos moviles, ya que el enrutador se ejecuta con frecuencia y el generador solo cuando hace falta producir texto. La inferencia se realiza sobre el runtime LiteRT-LM de Google, disenado para aceleracion en dispositivo.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas de decodificacion. El autor declara explicitamente que las copias son sin modificar, por lo que cualquier detalle de entrenamiento habria que consultarlo en las fichas de los modelos originales.

## Capacidades

- Seleccion de herramientas y function calling: el modelo de 270 M actua como enrutador y elige que accion del sistema ejecutar a partir de la peticion del usuario.
- Generacion de texto conversacional: el modelo de 1 B produce respuestas en lenguaje natural y resumenes.
- Ejecucion en dispositivo sin conexion: ambos artefactos estan en formato LiteRT-LM y estan pensados para inferencia local en movil.
- Integracion mediante descarga dinamica: la aplicacion obtiene los ficheros a traves de `models.json`, lo que permite actualizar modelos sin publicar una nueva version de la app.
- Razonamiento multi-paso en formato de agente: la separacion entre enrutador y generador habilita flujos de tipo decidir accion, ejecutar y redactar resultado.
- Capacidades multimodales (vision, audio): no disponible.
- Cobertura multilingue: no disponible.
- Modo de pensamiento explicito o decodificacion especulativa: no disponible.

## Casos de uso

- Asistente movil totalmente offline: la pareja de modelos se ejecuta en el telefono sin enviar datos a la nube, lo que permite responder y ejecutar acciones en modo avion o en zonas sin cobertura, usando el enrutador para las acciones y el modelo de 1 B para redactar.
- Automatizacion de acciones del sistema por voz o texto: el enrutador de 270 M traduce una frase como "avisa a Marta de que llego tarde" en una llamada de funcion concreta (enviar mensaje, contacto, texto), y el modelo de chat confirma la accion en lenguaje natural.
- Resumen de contenido local en el dispositivo: notas, transcripciones o hilos de mensajes se resumen con el Gemma 3 1B IT en int4 sin salir del telefono, lo que reduce el riesgo de exposicion de datos personales.
- Privacidad por diseno en aplicaciones sensibles: apps de salud, finanzas o diarios personales pueden ofrecer asistencia conversacional cumpliendo requisitos de minimizacion de datos, ya que la inferencia no requiere backend.
- Aplicaciones de campo y verticales sin conectividad: tecnicos, repartidores o personal de inspeccion pueden consultar y registrar informacion asistida por el modelo en emplazamientos sin red.
- Prototipado de agentes on-device: sirve como referencia de como estructurar un pipeline de dos modelos (router barato + generador) y de como empaquetar pesos LiteRT-LM con cuantizaciones distintas para cada rol.
- Control de interfaces por lenguaje natural en apps moviles: el enrutador puede mapear intenciones a comandos de UI o funciones internas, con el modelo de 1 B generando la respuesta al usuario.
- Integracion en asistentes de dispositivos con recursos limitados: el consumo de 0,9 GB de pesos en total permite desplegar el conjunto en telefonos de gama media con cuantizacion int4 e int8, en lugar de modelos de 7 B o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de function calling, y los resultados de busqueda web obtenidos no contienen informacion tecnica relevante sobre el modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,9 GB de pesos en total segun el tamano del repositorio (aproximadamente 270-300 MB para el enrutador int8 y 550-650 MB para el modelo de chat int4), mas el overhead del runtime y de la cache KV.
- Memoria del dispositivo recomendada: no disponible de forma oficial; por el perfil de los modelos, un movil con 4 GB de RAM o mas es el objetivo razonable, aunque no hay confirmacion del autor.
- GPU de escritorio: no aplica como requisito. El formato `.litertlm` esta orientado a aceleradores moviles (CPU, GPU y NPU de Android, y plataformas equivalentes), no a GPUs de datacenter.
- GPU de consumo: no disponible. No se documenta ejecucion sobre RTX 4090 ni similares; el runtime objetivo es LiteRT-LM en dispositivo.
- Opciones de despliegue: LiteRT-LM y el ecosistema Google AI Edge para Android (y plataformas soportadas por el runtime). No es compatible sin conversion previa con vLLM, llama.cpp, Ollama o TGI, ya que estos consumen safetensors o GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de seleccion de herramienta.
- Almacenamiento: 0,9 GB adicionales en el dispositivo si se descargan ambos artefactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aoiandroid/cription-agent-models | ~1,27 B en dos modelos (270 M + 1 B) | No disponible | int8 + int4, `.litertlm` | Gemma Terms of Use | Repositorio espejo, 0 descargas |
| litert-community/Gemma3-1B-IT (origen del rol de chat) | 1 B | No disponible en esta ficha | int4, `.litertlm` | Gemma Terms of Use | Publico en HuggingFace |
| litert-community/functiongemma-mobile-actions (origen del rol de enrutador) | 270 M | No disponible (el nombre `ekv1024` sugiere 1024 tokens) | int8, `.litertlm` | Gemma Terms of Use | Publico en HuggingFace |
| Alternativas on-device de tamano similar (por ejemplo, familias Qwen2.5 de 0,5-1,5 B o SmolLM2) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion recogida |

La diferencia funcional de este repositorio frente a sus dos modelos de origen no es de rendimiento, sino de empaquetado: agrupa ambos artefactos y anade el mecanismo de descarga mediante `models.json`. Cualquier comparacion de calidad frente a otras alternativas requeriria benchmarks que no estan publicados.

## Limitaciones y advertencias

- No es un modelo nuevo: son copias sin modificar, por lo que hereda integramente las limitaciones de FunctionGemma 270 M y Gemma 3 1 B IT.
- Ausencia total de evaluacion publicada: no hay benchmarks, ni datos de contexto, ni idiomas declarados, lo que dificulta justificar su uso en produccion sin pruebas propias.
- Riesgo de alucinacion: un modelo de 1 B de parametros tiene una capacidad limitada de conocimiento factual y una propension mayor a inventar detalles, especialmente en resumenes largos.
- Capacidad de razonamiento y codigo limitada: 270 M y 1 B son tamanos reducidos para tareas de matematicas, codigo o razonamiento multi-paso complejo.
- Contexto potencialmente corto en el enrutador: si la cache KV es realmente de 1024 tokens, las peticiones con historial largo pueden truncarse o degradar la seleccion de herramienta.
- Idiomas no documentados: no hay confirmacion de soporte de castellano ni de otros idiomas en esta distribucion.
- Restricciones de licencia: se aplican los Gemma Terms of Use y la Gemma Prohibited Use Policy, con obligaciones de atribucion y limitaciones de uso comercial que deben revisarse antes de integrar el modelo en un producto.
- Riesgo de desincronizacion: al ser un espejo, los ficheros pueden quedar obsoletos respecto a las versiones de `litert-community`, sin aviso en el repositorio.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que no hay retroalimentacion publica sobre su comportamiento real.
- Compatibilidad de despliegue restringida: el formato `.litertlm` obliga a usar LiteRT-LM, lo que excluye los stack de servidor habituales.
- Enlace del resultado de busqueda no utilizable: las consultas web realizadas no devolvieron ninguna fuente tecnica relevante sobre el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aoiandroid/cription-agent-models
- Modelo base, rol de chat: https://huggingface.co/litert-community/Gemma3-1B-IT
- Modelo base, rol de enrutador: https://huggingface.co/litert-community/functiongemma-mobile-actions_q8_ekv1024.litertlm
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; las busquedas devolvieron exclusivamente resultados no relacionados con el modelo.
