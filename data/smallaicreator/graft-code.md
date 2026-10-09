# SmallAICreator/GRAFT-Code

## Resumen

GRAFT-Code es un repositorio de HuggingFace publicado por SmallAICreator (UltraLabs) que distribuye una aplicación de escritorio para Windows 10/11 denominada GRAFT Code, junto con el puente opcional `graft-bridge`. No se trata por tanto de un modelo de lenguaje con pesos publicados en este repositorio (el tamano del repo es de 0,1 GB), sino del binario y la infraestructura que ejecutan localmente modelos de la familia GRAFT mediante llama.cpp embebido. La aplicacion actua como agente autonomo sobre el sistema de archivos: crea carpetas, lee y escribe ficheros, mueve, renombra, copia y borra elementos, ejecuta comandos y Python, realiza calculos exactos y hace busquedas web.

El modelo que recomienda el autor para esta aplicacion es GRAFT-10B-A2B, descrito como un mixture-of-experts de 10B parametros totales con 2B activos, con recall de hasta 32.000 tokens y un fichero GGUF de 6,3 GB que requiere 16 GB de RAM. Como alternativa ligera se ofrece GRAFT-1B-Agentic, de 1 GB y 8 GB de RAM, afinado para uso de herramientas. Ambos se ejecutan en CPU a traves de llama.cpp.

La relevancia de la propuesta es que plantea un agente de escritorio completamente local, con aprobaciones interactivas por accion, decodificacion especulativa opcional y una API compatible con OpenAI expuesta en `http://127.0.0.1:1337/v1`, sin enviar datos a la nube salvo las palabras clave de busqueda web. La licencia declarada es Apache 2.0 y el unico idioma soportado explicitamente es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene la aplicacion de escritorio; los modelos referenciados incluyen un MoE GRAFT-10B-A2B y un GRAFT-1B-Agentic) |
| Parametros totales | no disponible para GRAFT-Code; 10B para GRAFT-10B-A2B |
| Parametros activos | 2B (GRAFT-10B-A2B, mixture-of-experts) |
| Longitud de contexto | hasta 32.000 tokens (GRAFT-10B-A2B); configurable en la app hasta el maximo del modelo |
| Tipos de cuantizacion | GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelos) y binario .exe (aplicacion) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo subyacente mas alla de indicar que GRAFT-10B-A2B es un mixture-of-experts con 10B parametros totales y 2B activos, lo que sugiere un diseno de activacion dispersa orientado a reducir el coste de inferencia en CPU. El repo etiqueta el contenido como agente y tool-calling, y el binario integra llama.cpp (licencia MIT) como motor de inferencia, lo que implica ejecucion en CPU con soporte de cuantizacion GGUF.

No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de atencion mas alla de la mencion a la decodificacion especulativa, que en la aplicacion se activa automaticamente si existe un modelo borrador compatible (`GRAFT-10B-A2B-draft-*.gguf`) junto al modelo principal. La aplicacion separa el prompt de sistema en "personas" (GRAFT, Coder, Playful, Concise, Teacher) y guarda una cache de instrucciones para acelerar arranques posteriores.

## Capacidades

- Generacion de texto conversacional con streaming en vivo, formato enriquecido y bloques de codigo copiables.
- Ejecucion de acciones sobre el sistema de archivos: crear, leer, escribir, mover, renombrar, copiar y eliminar.
- Ejecucion de comandos de shell y scripts de Python en la maquina local.
- Calculo matematico exacto (operacion destacada de forma explicita por el autor).
- Busqueda web mediante DuckDuckGo con Wikipedia como respaldo, sin necesidad de clave de API.
- Lectura de paginas web para alimentar el razonamiento del agente.
- Tool calling y flujo agentico multi-paso (parametro de "max steps" configurable).
- Sistema de aprobacion humana por accion: si, si y no volver a preguntar, o no con instruccion alternativa.
- Decodificacion especulativa automatica si se detecta un modelo borrador compatible.
- Servidor compatible con OpenAI en `http://127.0.0.1:1337/v1`, con slots separados para aplicaciones externas.
- Seleccion de personas con prompt de sistema y parametros de muestreo propios.
- Notas persistentes en `GRAFT.md` con hechos sobre el equipo y preferencias del usuario, leidas al inicio de cada chat.
- Historial de conversaciones guardado y recuperable desde la barra lateral.
- Integracion opcional con Claude Code mediante el skill `talk_to_claude` del directorio `graft-bridge`.
- Control de muestreo amplio: temperature, top-p, top-k, min-p, penalizacion de repeticion y longitud de respuesta (incluido modo ilimitado).

## Casos de uso

- Automatizacion de tareas de organizacion de archivos: el agente puede generar y ejecutar un script en Python que renombre fotos por fecha, reorganice carpetas o elimine duplicados, con una tarjeta de aprobacion antes de cada cambio.
- Asistente de desarrollo en local: dado que soporta tool calling y ejecucion de comandos, se puede usar para crear scripts, leer ficheros de proyecto y ejecutar pruebas sin enviar codigo a servicios externos.
- Procesamiento por lotes de documentos en el escritorio: leer, transformar y escribir ficheros de texto o datos en `~/GRAFT-Workspace`, util para equipos que manejan informacion sensible que no debe salir de la maquina.
- Investigacion asistida con busqueda web: combina busqueda en DuckDuckGo con lectura de paginas para resumir o extraer datos sin clave de API, adecuado para tareas de recopilacion rapida de informacion.
- Backend local compatible con OpenAI: integrar `http://127.0.0.1:1337/v1` en otras aplicaciones o scripts que ya usan el SDK de OpenAI, aprovechando los slots separados para no invalidar la cache del chat principal.
- Calculo y verificacion de operaciones: usar la capacidad de matematicas exactas para validar importes, conversiones o formulas sin depender de la aritmetica aproximada de un LLM puro.
- Entornos con restricciones de conectividad o privacidad: al ejecutarse en CPU con llama.cpp y sin salida de datos salvo las palabras clave de busqueda, es apto para maquinas aisladas o con politicas estrictas de fuga de informacion.
- Apoyo educativo guiado: la persona "Teacher" permite configurar un asistente con instrucciones pedagogicas propias y parametros de muestreo adaptados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GRAFT-10B-A2B: fichero GGUF de 6,3 GB y 16 GB de RAM recomendados; ejecutable en CPU.
- GRAFT-1B-Agentic: fichero GGUF de 1 GB y 8 GB de RAM; opcion ligera y rapida.
- Sistema operativo: Windows 10/11 x64 (la aplicacion GRAFT-Code.exe corre en CPU). No hay binarios para Linux ni macOS en la informacion disponible.
- Requisito adicional: Microsoft Edge WebView2, ya presente en Windows 10 y 11.
- No se especifican requisitos de VRAM ni GPU recomendadas; el diseno esta orientado a CPU mediante llama.cpp.
- Advertencia del autor: no ejecutar dos copias de un modelo de 10B a la vez, ya que no caben en 16 GB de RAM.
- Despliegue: la propia aplicacion GRAFT Code con llama.cpp embebido; los modelos GGUF tambien pueden usarse en otros entornos compatibles con llama.cpp (LM Studio se menciona como carpeta de busqueda de modelos). No se confirma soporte oficial de vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor indica que la primera carga del 10B en CPU de portatil tarda aproximadamente dos minutos en leer las instrucciones, y que los arranques posteriores restauran desde disco en segundos. La decodificacion especulativa se presenta como mejora de velocidad cuando hay modelo borrador.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos externos comparables dentro de la informacion proporcionada. La unica comparacion documentada es entre las dos opciones de modelo recomendadas por el autor para la aplicacion.

| Modelo | Tamano en disco | RAM recomendada | Perfil |
|---|---|---|---|
| GRAFT-10B-A2B | 6,3 GB | 16 GB | MoE de 10B con 2B activos, recall hasta 32K tokens, opcion mas capaz |
| GRAFT-1B-Agentic | 1 GB | 8 GB | Ligero y rapido, afinado para uso de herramientas |

Comparativa con alternativas de la misma categoria (por ejemplo, otros modelos agenticos cuantizados en GGUF para ejecucion local): no disponible.

## Limitaciones y advertencias

- La aplicacion ejecuta comandos reales en el equipo del usuario; el propio autor recomienda mantener las aprobaciones activadas salvo que se confie plenamente en la tarea.
- Los modelos pequenos pueden cometer errores o inventar resultados; el autor aconseja verificar cualquier salida importante.
- El unico idioma declarado es el ingles, lo que limita su uso fiable en castellano u otros idiomas.
- El binario `GRAFT-Code.exe` no esta firmado, por lo que Windows SmartScreen puede mostrar advertencias y requerir "Mas informacion -> Ejecutar de todas formas".
- Salida de datos a la red: aunque el procesamiento es local, las palabras clave de busqueda web salen del equipo; la busqueda usa DuckDuckGo con Wikipedia como respaldo.
- Restriccion de memoria: no ejecutar dos modelos grandes simultaneamente en equipos con 16 GB de RAM.
- Limitacion de plataforma: el ejecutable es exclusivo de Windows 10/11 x64; no se documentan versiones para otros sistemas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (9 de octubre de 2026), por lo que no existe evidencia publica de validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el binario sin firmar y el historial inexistente suponen un riesgo para despliegues en produccion.
- No se documentan sesgos especificos, numero de tokens de entrenamiento ni composicion del dataset, lo que dificulta la evaluacion de riesgos.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/SmallAICreator/GRAFT-Code
- Modelo recomendado GRAFT-10B-A2B (GGUF): https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-GGUF
- Modelo ligero GRAFT-1B-Agentic: https://huggingface.co/SmallAICreator/GRAFT-1B-Agentic
- llama.cpp (motor de inferencia embebido, licencia MIT): https://github.com/ggml-org/llama.cpp
- La busqueda web no devolvio enlaces relevantes al modelo: los resultados obtenidos correspondian a contenido no relacionado (guias de un videojuego) y se han descartado.
