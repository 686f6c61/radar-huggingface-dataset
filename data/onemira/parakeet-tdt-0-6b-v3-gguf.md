# onemira/parakeet-tdt-0.6b-v3-gguf

## Resumen

El repositorio `onemira/parakeet-tdt-0.6b-v3-gguf` es un espejo (mirror) byte a byte del artefacto GGUF Q8_0 oficial de NVIDIA correspondiente al modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`. No se trata de un modelo original: los pesos son identicos al checkpoint publicado por NVIDIA, con un unico fichero `parakeet-tdt-0.6b-v3.q8_0.gguf` de 713.975.456 bytes y SHA-256 verificado. El mantenimiento corre a cargo de OneMira, que lo distribuye para su grabadora de voz C1 y su aplicacion de escritorio con transcripcion local.

El modelo base es un sistema ASR de NVIDIA basado en la arquitectura Parakeet con decodificacion TDT (Token-and-Duration Transducer) y aproximadamente 637 millones de parametros. Esta orientado a transcripcion de voz en ingles (la model card upstream no detalla composicion multilingue en la informacion disponible) y se ejecuta mediante el runtime NeMo-Speech.cpp, no mediante llama.cpp ni vLLM, ya que no es un modelo de lenguaje generativo sino un modelo acustico de transcripcion.

Su relevancia practica reside en que permite transcripcion local en hardware de consumo sin dependencia de la nube: el fichero GGUF Q8_0 ocupa 0,7 GB, lo que lo hace apto para portatiles y equipos de escritorio. La licencia CC-BY-4.0 permite uso comercial con atribucion, lo que facilita su integracion en productos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet con decodificacion TDT (Token-and-Duration Transducer) |
| Parametros totales | 637.329.158 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero incluido en el repo) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (`parakeet-tdt-0.6b-v3.q8_0.gguf`, 713.975.456 bytes) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura Parakeet de NVIDIA con un decodificador TDT (Token-and-Duration Transducer), un esquema que predice conjuntamente tokens y duraciones para mejorar la alineacion temporal y la eficiencia de decodificacion en tareas de reconocimiento del habla. El artefacto distribuido en este repositorio es unicamente la version cuantizada a Q8_0 del checkpoint upstream, identificado por la revision `541d1f99c6b0c3cd0b11a95167540bb8edefd82b`.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales del checkpoint original. La model card del espejo remite a la model card upstream (`UPSTREAM_MODEL_CARD.md`) para esos datos, pero su contenido no se ha facilitado. La inferencia debe realizarse con el runtime NeMo-Speech.cpp, segun indica el autor del espejo.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) como tarea principal del pipeline.
- Decodificacion TDT con prediccion conjunta de tokens y duraciones, orientada a transcripcion con alineacion temporal.
- Ejecucion local en dispositivo (`on-device`) mediante el runtime NeMo-Speech.cpp y el formato GGUF.
- Integracion con sistemas de diarizacion de hablantes en el ecosistema de producto de OneMira (la model card menciona separacion de hablantes en su aplicacion, aunque no se detalla si este artefacto concreto la implementa).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo de proposito general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio generativo): no disponible; el modelo es exclusivamente de entrada de audio y salida de texto.

## Casos de uso

- Transcripcion local de reuniones presenciales: el modelo, al ejecutarse con NeMo-Speech.cpp sobre GGUF Q8_0, permite transcribir audio capturado en el dispositivo sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Grabadoras de voz con procesamiento en el dispositivo: integrado en productos como la grabadora OneMira C1, el modelo procesa el audio en el ordenador del usuario (Mac o Windows) sin suscripcion ni limites de minutos.
- Notas y actas automaticas: combinado con un sistema de resumen posterior, la transcripcion sirve de base para generar resumenes, decisiones y elementos de accion en herramientas de productividad.
- Integracion en flujos MCP: a traves del servidor MCP de OneMira, la transcripcion puede exponerse a asistentes como Claude Desktop, Cursor o ChatGPT para consulta y procesamiento del contexto de reuniones.
- Subtitulado y transcripcion de llamadas: al ser un modelo ASR compacto (0,7 GB en Q8_0), puede desplegarse en portatiles para transcribir llamadas o grabaciones de forma continua con baja huella de memoria.
- Prototipado de pipelines ASR en investigacion: el fichero GGUF con hash verificado permite reproducir exactamente los resultados del checkpoint oficial de NVIDIA en experimentos de evaluacion de ASR sin depender del formato original de NeMo.
- Aplicaciones de accesibilidad: transcripcion en tiempo real de conversaciones para personas con dificultades auditivas, ejecutandose completamente en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 0,7 GB, por lo que la huella de memoria es del orden de 1 GB o inferior, aunque no se dispone de una cifra oficial de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada; al ser un modelo de 637 millones de parametros en Q8_0, es razonable esperar que funcione en GPU de consumo, pero no se confirma en la documentacion facilitada.
- Compatibilidad con GPU de consumo: probable por tamano, pero no confirmada explicitamente; la model card menciona ejecucion en Mac y Windows mediante la aplicacion de escritorio de OneMira.
- Opciones de despliegue: runtime NeMo-Speech.cpp (indicado por el autor). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| onemira/parakeet-tdt-0.6b-v3-gguf | 637 M | no disponible | GGUF Q8_0 | CC-BY-4.0 | Espejo del checkpoint oficial de NVIDIA |
| nvidia/parakeet-tdt-0.6b-v3 | 637 M | no disponible | checkpoint NeMo | CC-BY-4.0 | Modelo original upstream |
| Alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un espejo, no un modelo original: la autoria y responsabilidad del comportamiento del modelo corresponden a NVIDIA; OneMira no implica respaldo por parte de NVIDIA.
- Solo se distribuye la cuantizacion Q8_0; no hay otras cuantizaciones en el repositorio.
- El repositorio contiene unicamente el artefacto GGUF, no el checkpoint completo de entrenamiento ni el codigo de la aplicacion OneMira.
- Requiere el runtime NeMo-Speech.cpp; no es compatible con los runners habituales de modelos de lenguaje (llama.cpp, vLLM, TGI, Ollama).
- Idiomas soportados no confirmados en la informacion disponible; no debe asumirse cobertura multilingue sin verificar la model card upstream.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio con ruido, acentos o vocabulario especializado; no se dispone de tasas de error (WER) publicadas en la informacion facilitada.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario conservar el aviso de atribucion (`NOTICE.txt`) y la licencia (`LICENSE.html`) incluidos en el repositorio.
- La model card incluye contenido promocional del producto OneMira; debe tratarse como material comercial y no como especificacion tecnica del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/parakeet-tdt-0.6b-v3-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/tree/541d1f99c6b0c3cd0b11a95167540bb8edefd82b
- Model card upstream (referenciada): `UPSTREAM_MODEL_CARD.md` en el repositorio
- Copia de licencia: `LICENSE.html` en el repositorio
- Atribucion: `NOTICE.txt` en el repositorio
- Servidor MCP de OneMira: https://github.com/onemira-space/onemira-mcp
- Producto OneMira C1: https://onemira.com/products/c1
- Dataset de benchmark de grabadoras de voz 2026: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- Pagina de grabadora sin suscripcion: https://onemira.com/ai-voice-recorder-without-subscription
