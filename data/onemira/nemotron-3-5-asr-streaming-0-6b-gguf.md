# onemira/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

`onemira/nemotron-3.5-asr-streaming-0.6b-gguf` es un espejo (mirror) byte a byte del artefacto GGUF Q8 oficial de NVIDIA para el modelo de reconocimiento automatico del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b`. El repositorio no contiene el checkpoint de entrenamiento completo, sino un unico fichero cuantizado en Q8_0 destinado a inferencia en dispositivo mediante el runtime NeMo-Speech.cpp. El autor del repositorio es la cuenta `onemira`, vinculada a un producto de hardware de grabacion de voz, y la autoria original del modelo corresponde a NVIDIA.

El modelo resuelve la transcripcion de voz en streaming con un tamano reducido: 648.268.960 parametros totales, lo que lo situa en la franja de 0,6 mil millones y lo hace apto para ejecucion local en hardware modesto. La relevancia actual radica en la combinacion de un modelo ASR compacto con una cuantizacion Q8_0 y un runtime especifico para CPU/dispositivo, lo que permite transcripcion sin dependencia de la nube ni de GPU de datacenter.

La ficha se basa unicamente en la informacion disponible en el repositorio y en la model card del espejo. Los datos sobre arquitectura interna, composicion del dataset de entrenamiento, idiomas soportados y benchmarks no estan publicados en la informacion proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR de NVIDIA; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 648.268.960 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico artefacto publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`), etiquetada como `other` en Hugging Face |
| Formato de pesos | GGUF (`nemotron-3.5-asr-streaming-0.6b.q8_0.gguf`) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Fichero | `nemotron-3.5-asr-streaming-0.6b.q8_0.gguf` |
| Tamano en bytes | 741.548.352 (~707 MiB) |
| SHA-256 | `a5c435f294eea8f88ce68dd27b8c3bfea7f777cb2fbba04fcd30eaa555f429ae` |
| Revision upstream | `1c8deaecc64b91f034d73e08dd8b64625eb3395d` |
| Tamano del repo | 0,7 GB |
| Runtime de inferencia | NeMo-Speech.cpp |
| Descargas | 149 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo (tipo de encoder/decoder, atencion, mecanismos de streaming ni capas). Lo unico verificable es que se trata de un modelo de NVIDIA orientado a ASR en streaming, con 648.268.960 parametros, distribuido aqui como un unico fichero GGUF cuantizado en Q8_0. El espejo declara ser byte a byte identico al artefacto Q8 GGUF oficial de NVIDIA, con SHA-256 y revision upstream explicitos, lo que permite verificar la integridad del fichero.

Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). El repositorio contiene la model card upstream como fichero separado (`UPSTREAM_MODEL_CARD.md`), pero su contenido no se incluye en la informacion proporcionada. Cualquier afirmacion sobre el proceso de entrenamiento requeriria consultar la fuente original de NVIDIA.

## Capacidades

- Reconocimiento automatico del habla (ASR): tarea principal declarada en el pipeline (`automatic-speech-recognition`).
- Procesamiento en streaming: el nombre del modelo indica soporte de transcripcion continua por flujos de audio, aunque los detalles tecnicos no estan disponibles.
- Inferencia en dispositivo: etiquetado como `on-device`, con runtime NeMo-Speech.cpp y cuantizacion Q8_0.
- Integracion con sistemas de diarizacion: la model card del espejo menciona separacion de hablantes (speaker diarization) en el contexto del producto OneMira, aunque no se especifica si esta capacidad reside en este modelo o en otros artefactos del stack.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo general).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio generativo, modo thinking): no disponibles.

## Casos de uso

- Transcripcion local de reuniones: el modelo puede ejecutarse en dispositivo con NeMo-Speech.cpp y un fichero de ~707 MiB, lo que permite transcribir conversaciones sin enviar audio a servicios en la nube y sin coste por minuto.
- Grabadoras de voz con IA integrada: es el caso de uso declarado por el mantenedor del espejo (OneMira C1), donde el modelo se ejecuta en el propio hardware de grabacion para generar transcripciones y resumenes locales.
- Subtitulado en tiempo real: la orientacion a streaming del modelo lo hace adecuado para generar subtitulos incrementales en aplicaciones de escritorio o navegador, siempre que se valide la latencia con el runtime elegido.
- Procesamiento por lotes de audio en CPU: al estar cuantizado en Q8_0 y disenado para runtime ligero, puede usarse para transcribir archivos de audio en servidores sin GPU dedicada.
- Integracion en pipelines de accesibilidad: transcripcion de audio a texto para herramientas de apoyo a personas con discapacidad auditiva, ejecutandose localmente para preservar la privacidad del audio.
- Analisis de llamadas y atencion al cliente: transcripcion de conversaciones telefonicas en infraestructura propia, con la posibilidad de combinarla con sistemas de diarizacion para separar interlocutores.
- Prototipado de asistentes de voz: como componente ASR en un pipeline mayor (deteccion de actividad de voz, ASR, LLM, TTS) para construir asistentes que funcionen sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa ~707 MiB; con overhead de runtime, se puede estimar un consumo en torno a 1 GB de memoria, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponibles en la informacion proporcionada. El modelo esta orientado a inferencia en dispositivo y CPU mediante NeMo-Speech.cpp, por lo que no requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; el enfoque declarado es `on-device` y runtime especifico, no despliegue en GPU de consumo.
- Opciones de despliegue: NeMo-Speech.cpp es el runtime indicado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI; dado que es un modelo ASR y no un LLM, estos runtimes no serian directamente aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| nemotron-3.5-asr-streaming-0.6b (este espejo) | 648.268.960 | no disponible | OpenMDW 1.1 | GGUF Q8_0 | Hugging Face (espejo) |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo, no el modelo original: la autoria es de NVIDIA y el mantenimiento del repositorio corresponde a OneMira. La model card indica explicitamente que el espejo no implica respaldo de NVIDIA.
- Solo se publica el artefacto Q8_0 en GGUF; no hay otras cuantizaciones ni pesos en safetensors en este repositorio.
- El repositorio no contiene el checkpoint de entrenamiento completo, solo el fichero GGUF seleccionado.
- La licencia OpenMDW 1.1 esta etiquetada como `other` en Hugging Face; es necesario revisar los terminos completos antes de un uso comercial.
- No hay informacion sobre sesgos, tasas de alucinacion o errores de transcripcion (WER) en la informacion proporcionada.
- No se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otros idiomas sin validacion previa.
- La longitud de contexto de audio no esta documentada; el comportamiento en grabaciones largas o en streaming continuo requiere pruebas propias.
- La model card incluye contenido promocional del producto de hardware del mantenedor; debe tratarse como material comercial y no como especificacion tecnica.
- El modelo esta pensado para el runtime NeMo-Speech.cpp; usarlo con otros runtimes no esta soportado segun la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/1c8deaecc64b91f034d73e08dd8b64625eb3395d
- Model card upstream (fichero en el repo): `UPSTREAM_MODEL_CARD.md`
- Copia de la licencia (fichero en el repo): `LICENSE.html`
- Atribucion (fichero en el repo): `NOTICE.txt`
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Producto del mantenedor (OneMira C1): https://onemira.com/products/c1
- Servidor MCP del mantenedor: https://github.com/onemira-space/onemira-mcp
- Dataset de benchmark del mantenedor: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
