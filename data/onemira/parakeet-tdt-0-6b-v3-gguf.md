# onemira/parakeet-tdt-0.6b-v3-gguf

## Resumen

`onemira/parakeet-tdt-0.6b-v3-gguf` es un espejo (mirror) byte a byte del artefacto GGUF Q8 oficial de NVIDIA para Parakeet-TDT-0.6B-v3, un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA NeMo. El repositorio no contiene el checkpoint de entrenamiento completo, sino unicamente el fichero `parakeet-tdt-0.6b-v3.q8_0.gguf` (713.975.456 bytes) listo para ejecutarse con el runtime NeMo-Speech.cpp.

El modelo resuelve transcripcion de voz en local (on-device) para 25 lenguas europeas, pensado para ejecutarse en CPU y Apple Silicon sin subir audio a servidores en la nube. Es relevante por su tamano contenido (637 millones de parametros) y su empaquetado GGUF Q8_0, que permite despliegue offline en entornos de escritorio y dispositivos con recursos limitados.

Este repositorio concreto es un mirror mantenido por OneMira para su producto de grabadora con IA; la autoria original y la licencia pertenecen a NVIDIA. No implica aval de NVIDIA sobre OneMira.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), familia NeMo de NVIDIA |
| Parametros totales | 637.329.158 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero incluido) |
| Idiomas soportados | 25 lenguas europeas (segun model card del mirror; listado no disponible) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (`parakeet-tdt-0.6b-v3.q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transducer TDT (Token-and-Duration Transducer) de NVIDIA NeMo, una variante de los RNN-Transducer en la que el decoder predice conjuntamente tokens y duraciones, lo que permite decodificacion no autoregresiva mas eficiente que un CTC o un transducer clasico. El tamano es de aproximadamente 0,6 mil millones de parametros (637.329.158 reales en safetensors del modelo base).

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (no aplica habitualmente en ASR). El artefacto publicado es unicamente una cuantizacion Q8_0 del checkpoint oficial; no se reentrena ni se modifica el modelo. El runtime recomendado es NeMo-Speech.cpp, que carga el GGUF y ejecuta inferencia en CPU/Apple Silicon.

## Capacidades

- Reconocimiento automatico del habla (ASR) en streaming y en modo por lotes.
- Transcripcion multilingue en 25 lenguas europeas (segun la model card del mirror).
- Ejecucion local on-device en CPU y Apple Silicon mediante NeMo-Speech.cpp.
- Funcionamiento offline tras la descarga inicial del modelo, sin subida obligatoria de audio a la nube.
- Integracion como etapa de pipeline de ASR en aplicaciones de escritorio (por ejemplo, OneMira Desktop).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de ASR en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones en local: el modelo procesa audio en streaming sobre CPU/Apple Silicon, permitiendo actas y resumenes sin enviar el audio a servicios cloud y sin limite de minutos.
- Notas de voz en dispositivos de grabacion dedicados: al ejecutarse en un runtime C++ ligero, puede integrarse en firmware o software de escritorio de grabadoras con IA (caso de OneMira C1) para transcribir in situ.
- Subtitulado offline de contenido multimedia: al soportar 25 lenguas europeas, sirve para generar subtitulos en herramientas de edicion sin conexion.
- Cumplimiento y privacidad en entornos regulados: sectores como sanidad, legal o administracion publica pueden transcribir entrevistas sin que el audio salga del dispositivo.
- Prototipado de pipelines ASR: el GGUF Q8_0 se carga con NeMo-Speech.cpp para experimentar con transcripcion en entornos sin GPU.
- Transcripcion en dispositivos con recursos limitados: el tamano de 0,6 B de parametros y el fichero de ~714 MB lo hacen viable en portatiles y mini-PC sin GPU dedicada.
- Investigacion en ASR multilingue: sirve como linea base reproducible (hash SHA-256 fijado) para comparar con otros modelos transducers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto esta pensado para CPU, por lo que no requiere GPU.
- Tamano en disco del fichero GGUF: 713.975.456 bytes (~714 MB).
- GPU recomendadas: no aplica para el runtime objetivo (NeMo-Speech.cpp en CPU/Apple Silicon); no se documentan requisitos de GPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos ~1 GB de memoria libre si se porta a un runtime GPU, aunque el uso previsto es CPU.
- Opciones de despliegue: NeMo-Speech.cpp (runtime indicado por el autor). Otros runtimes GGUF no estan documentados para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| onemira/parakeet-tdt-0.6b-v3-gguf | 637 M | no disponible | 25 lenguas europeas | CC BY 4.0 | GGUF Q8_0 |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 637 M | no disponible | 25 lenguas europeas | CC BY 4.0 | safetensors / NeMo |
| Whisper large-v3 | no disponible en esta ficha | no disponible | multilingue | no disponible en esta ficha | safetensors, GGUF (comunitario) |
| Whisper small | no disponible en esta ficha | no disponible | multilingue | no disponible en esta ficha | safetensors, GGUF (comunitario) |

La comparativa con Whisper se incluye por categoria (ASR multilingue) pero los datos concretos de esos modelos no se han verificado en la informacion proporcionada; consultese sus fichas oficiales.

## Limitaciones y advertencias

- Es un mirror, no un modelo original: la autoria y responsabilidad de calidad recaen en NVIDIA; OneMira no avala ni modifica los pesos.
- Solo se publica la cuantizacion Q8_0; no hay variantes Q4, Q5 ni FP16 en este repositorio.
- El runtime previsto es NeMo-Speech.cpp; otros motores GGUF (llama.cpp, Ollama) no estan documentados como compatibles.
- Cobertura limitada a 25 lenguas europeas; no se garantiza rendimiento fuera de ese conjunto.
- No se documentan sesgos especificos, tasas de alucinacion ni comportamiento en audio ruidoso o con acentos no representados.
- La licencia CC BY 4.0 permite uso comercial con atribucion; debe conservarse el aviso de autoria de NVIDIA y el NOTICE del repositorio.
- El repositorio incluye material promocional de OneMira (producto C1); conviene separar la informacion tecnica del modelo de la promocion comercial.
- El modelo no es un LLM: no soporta generacion de texto, razonamiento, codigo ni tool calling.

## Enlaces

- Repositorio del mirror: https://huggingface.co/onemira/parakeet-tdt-0.6b-v3-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/tree/541d1f99c6b0c3cd0b11a95167540bb8edefd82b
- Model card upstream (copia en el repo): UPSTREAM_MODEL_CARD.md
- Licencia (copia en el repo): LICENSE.html
- Atribucion (copia en el repo): NOTICE.txt
- Producto OneMira C1: https://onemira.com/products/c1
- OneMira C1 en Amazon US: https://www.amazon.com/dp/B0HM6YDLJ4
- Comparativas OneMira: https://onemira.com/compare
- Guia de grabadora sin suscripcion: https://onemira.com/ai-voice-recorder-without-subscription
- Dataset TCO de grabadoras: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- OKF Wiki MCP Server: https://github.com/onemira-space/okf-wiki-mcp
- Registro MCP oficial: https://registry.modelcontextprotocol.io/v0.1/servers?search=okf-wiki-mcp
- Validador OKF Markdown: https://www.npmjs.com/package/okf-markdown
- MCP Server Card: https://onemira.com/.well-known/mcp/server-card.json
- Plantillas de actas de reunion: https://onemira.com/meeting-minutes-templates
