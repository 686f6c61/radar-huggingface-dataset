# kusema/parakeet-tdt-0.6b-v3-gguf

## Resumen

Parakeet TDT 0.6B v3 es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA, basado en la arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer). Este repositorio concreto, publicado por el usuario kusema, no es un modelo nuevo ni un ajuste fino: es un espejo (mirror) sin modificaciones de la conversión a GGUF y cuantización Q8_0 realizada por el proyecto transcribe.cpp a partir del modelo original de NVIDIA. El único archivo alojado pesa 739.508.576 bytes (unos 0,74 GB) y su SHA-256 está fijado en la model card para que la aplicación Kusema pueda verificar la integridad tras cada descarga.

El modelo cuenta con 627.052.166 parámetros totales (aproximadamente 0,6 mil millones, de ahí el sufijo "0.6b") y está pensado para transcripción de voz en local, con un equilibrio entre precisión y requisitos de cómputo moderados. Su relevancia actual radica en que permite ejecutar ASR de calidad en hardware de consumo y en aplicaciones de escritorio, algo especialmente útil para dictado por voz, subtitulado y pipelines de transcripción sin dependencia de servicios en la nube.

La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. La información disponible sobre idiomas soportados, contexto y detalles de entrenamiento no está incluida en este repositorio, por lo que se remite al modelo original de NVIDIA para esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), según el modelo base de NVIDIA |
| Parametros totales | 627.052.166 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado en este repo) |
| Idiomas soportados | no disponible en este repositorio |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (`parakeet-tdt-0.6b-v3-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base es Parakeet TDT 0.6B v3 de NVIDIA, que emplea la arquitectura FastConformer (una variante eficiente del Conformer con atención por bloques) combinada con un decodificador de tipo Transducer TDT. El decodificador TDT predice conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación y mejora la eficiencia frente a transducers tradicionales. El modelo tiene 627.052.166 parámetros.

Este repositorio no aporta información sobre el corpus de entrenamiento, el número de tokens de audio procesados, la composición del dataset ni si hubo etapas de ajuste con RLHF o DPO; esos detalles deben consultarse en la model card del modelo original de NVIDIA. La única transformación documentada es la conversión a GGUF y la cuantización Q8_0 realizada por el proyecto transcribe.cpp (revisión `85ac09ea12fc4b1112fa76810059364bc6adc9de` de handy-computer/parakeet-tdt-0.6b-v3-gguf), sin cambios adicionales por parte de kusema.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea principal del modelo.
- Decodificación TDT: generación conjunta de tokens y duraciones, orientada a transcripción eficiente.
- Ejecución local mediante transcribe.cpp: pensado para integrarse en aplicaciones de escritorio.
- Verificación de integridad: el SHA-256 del archivo está publicado para comprobación tras la descarga.
- Soporte multilingüe: no disponible en la información de este repositorio (consultar el modelo original).
- Tool calling, agentes, visión, audio generativo o modo thinking: no disponible / no aplica a un modelo ASR.

## Casos de uso

- Dictado por voz en Windows: la aplicación Kusema utiliza este archivo GGUF para transcribir voz a texto en local, verificando el SHA-256 tras la descarga; el tamaño de 0,74 GB facilita su distribución e instalación en equipos de escritorio.
- Subtitulado automático de vídeo: el modelo puede transcribir pistas de audio y generar subtítulos en pipelines de posproducción, ejecutándose en local sin enviar audio a servicios externos.
- Transcripción de reuniones y notas de voz: integrado en herramientas de escritorio, permite convertir grabaciones en texto para actas o resúmenes posteriores, con la ventaja de privacidad al no salir el audio del equipo.
- Accesibilidad: conversión de voz a texto para personas con dificultades motoras o auditivas, desplegable en hardware de consumo gracias al reducido tamaño del modelo.
- Procesamiento por lotes de archivos de audio: uso del runtime transcribe.cpp para transcribir carpetas completas de grabaciones en servidores modestos o estaciones de trabajo.
- Prototipado de aplicaciones ASR: servir como base cuantizada para desarrolladores que quieran evaluar la calidad de Parakeet TDT 0.6B v3 antes de adoptar el modelo original en FP32/BF16.
- Integración en aplicaciones de escritorio de terceros: cualquier app que use transcribe.cpp puede consumir este GGUF como dependencia empaquetada, con verificación de integridad incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite explícitamente a la página del modelo original de NVIDIA para benchmarks, limitaciones y usos previstos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa 739.508.576 bytes (unos 0,74 GB); la VRAM necesaria será algo superior por los buffers de activaciones y el contexto de audio, aunque no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, es plausible su ejecución en GPU de consumo, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? El tamaño del archivo sugiere que sí en la mayoría de GPU modernas, pero no hay confirmación oficial en este repositorio.
- Opciones de despliegue: transcribe.cpp (runtime oficial de este GGUF); no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kusema/parakeet-tdt-0.6b-v3-gguf (este repo) | 627.052.166 | no disponible | GGUF Q8_0 | CC-BY-4.0 | HuggingFace, espejo de un único archivo |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 0,6 B (aprox.) | no disponible | safetensors (formato original) | CC-BY-4.0 | HuggingFace, modelo oficial de NVIDIA |
| handy-computer/parakeet-tdt-0.6b-v3-gguf | 0,6 B (aprox.) | no disponible | GGUF (posiblemente varias cuantizaciones) | CC-BY-4.0 | HuggingFace, origen de la conversión |

No se dispone de datos de rendimiento comparado con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no aporta mejoras ni correcciones respecto al GGUF de handy-computer ni al modelo original de NVIDIA.
- Solo se publica una cuantización (Q8_0); no hay variantes más ligeras (Q4, Q5) en este repositorio.
- La información sobre idiomas, contexto y benchmarks no está incluida aquí; debe consultarse el modelo original.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente con audio ruidoso o acentos no representados en el entrenamiento; no se documentan sesgos específicos.
- Uso comercial permitido bajo CC-BY-4.0, pero exige atribución a NVIDIA y al proyecto transcribe.cpp según corresponda.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un espejo de conveniencia para una aplicación concreta, no un artefacto con comunidad propia.
- La verificación SHA-256 es responsabilidad del consumidor; si el archivo se corrompe o se modifica, la aplicación Kusema lo rechazará.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kusema/parakeet-tdt-0.6b-v3-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión GGUF de origen: https://huggingface.co/handy-computer/parakeet-tdt-0.6b-v3-gguf
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicación Kusema: https://github.com/neulinc/kusema
