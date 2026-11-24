# Hisohkoyage/mm2-murder-mystery-2-script

## Resumen

El repositorio `Hisohkoyage/mm2-murder-mystery-2-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows etiquetado como "script" para el videojuego Murder Mystery 2. A pesar de estar publicado en la plataforma de Hugging Face, los artefactos descritos en su model card son un archivo ZIP (`mm2-murder-mystery-2-script-v1.2.0-win64.zip`, 8,9 MB) y un ejecutable (`mm2-murder-mystery-2-script-v1.2.0-win64.exe`) protegidos con contrasena, no pesos de red neuronal en formato safetensors o GGUF.

La model card describe funcionalidades propias de una herramienta de automatizacion de juego (ESP de entidades, server hopper, bucles de farmeo, alertas por webhook de Discord), no capacidades de generacion de texto, razonamiento o codigo. No se declara arquitectura de transformer, numero de parametros, longitud de contexto ni proceso de entrenamiento alguno. El pipeline no esta disponible y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Desde la perspectiva de un editor tecnico de IA open source, este artefacto queda fuera del alcance de una ficha de modelo: no es un modelo, no es open source en el sentido de pesos abiertos y su licencia MIT se aplica al paquete distribuido, no a un conjunto de pesos. La ficha se completa a continuacion con los datos disponibles, marcando explicitamente como "no disponible" todo lo que no figura en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de automatizacion para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP de 8,9 MB con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal en la informacion disponible. El artefacto es un binario Windows x64 (`mm2-murder-mystery-2-script-v1.2.0-win64.exe`, build `v1.1.2`, firma `49D54A4716`) empaquetado en un ZIP de 8,9 MB protegido con la contrasena `2026`. La model card menciona modulos de configuracion JSON persistente, alertas por webhook de Discord, guardia anti-AFK, ESP de entidades y cofres, server hopper de baja latencia y bucle de farmeo automatizado, con consumo declarado inferior a 53 MB de RAM y tiempos de respuesta inferiores a 6 ms. No hay datos de entrenamiento, dataset, tokens, RLHF ni DPO porque no existe un modelo entrenado.

La publicacion en Hugging Face con etiquetas `windows`, `windows-11`, `x64`, `portable` y un nombre de script de juego sugiere un uso de la plataforma como CDN de binarios, no como repositorio de modelos. No se aporta informacion sobre innovaciones tecnicas de IA (decodificacion especulativa, atencion lineal, SSM, etc.).

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No soporta agentes ni razonamiento multi-paso basado en LLM.
- Las capacidades declaradas son de automatizacion de un videojuego: ESP 3D de entidades y cofres, server hopper, bucle de farmeo, guardia anti-AFK y alertas por webhook de Discord.
- Los metadatos listan 14 idiomas, pero no se especifica ninguna funcionalidad de traduccion o procesamiento linguistico asociada a ellos.
- No se declara vision por computador, audio, modo thinking ni ninguna capacidad cognitiva.

## Casos de uso

- No aplica como modelo de IA en produccion: no puede integrarse en pipelines de generacion de texto, RAG, agentes o atencion al cliente.
- No aplica para generacion de codigo ni para automatizacion de CI/CD basada en LLM.
- No aplica para analisis de documentos, resumen, traduccion automatica ni clasificacion.
- No aplica para prototipado de asistentes conversacionales.
- No aplica para evaluacion comparativa de modelos en benchmarks de NLP.
- El unico uso descrito por el autor es la ejecucion del binario en Windows 10/11 de 64 bits para automatizar tareas dentro del videojuego Murder Mystery 2, escenario ajeno al ambito de esta publicacion y con implicaciones que se detallan en la seccion de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de modelos, porque el artefacto no es un modelo de IA. La model card unicamente declara cifras de consumo del ejecutable (menos de 53 MB de RAM, menos de 40 MB en el server hopper, respuesta inferior a 6 ms), que no son comparables con benchmarks de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar en GPU.
- GPU recomendadas: no aplica; el artefacto esta dirigido a Windows 10/11 x64 y no declara requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (no hay soporte de vLLM, llama.cpp, Ollama ni TGI); se distribuye como ejecutable `.exe` para Windows.
- Latencia y throughput: el autor declara respuesta inferior a 6 ms y consumo inferior a 53 MB de RAM para el ejecutable, sin especificar el hardware de referencia.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos de IA comparable: el artefacto es un ejecutable de automatizacion de videojuego, no un modelo de lenguaje, vision o multimodal. Compararlo con LLM open source carece de sentido tecnico.

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse ni evaluarse como tal en comparativas de modelos open source.
- El paquete se distribuye como binario `.exe` de procedencia no verificada, con contrasena de extraccion publicada en la propia model card; ejecutar binarios de este tipo con privilegios de administrador implica un riesgo de seguridad relevante.
- La model card incluye enlaces de descarga a un repositorio de GitHub de terceros (`EleniSilva/mm2-murder-mystery-2-script`) distinto del propietario del repositorio en Hugging Face, lo que dificulta la trazabilidad de la cadena de suministro.
- El uso descrito (automatizacion dentro de Murder Mystery 2) puede infringir los terminos de servicio del videojuego y conllevar el bloqueo de cuentas; no es un caso de uso de IA open source.
- La licencia MIT cubre el paquete distribuido, no pesos de modelo; no hay garantia alguna sobre el contenido del binario.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto e idioma porque no existe un modelo que los presente.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso legitimo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hisohkoyage/mm2-murder-mystery-2-script
- Repositorio de GitHub referenciado en la model card: https://github.com/EleniSilva/mm2-murder-mystery-2-script
- Release mas reciente referenciada: https://github.com/EleniSilva/mm2-murder-mystery-2-script/releases/latest
- Descarga directa del ZIP citada por el autor: https://github.com/EleniSilva/mm2-murder-mystery-2-script/releases/latest/download/mm2-murder-mystery-2-script-v1.2.0-win64.zip
