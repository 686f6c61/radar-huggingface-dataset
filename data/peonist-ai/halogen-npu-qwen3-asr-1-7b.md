# peonist-ai/halogen-npu-qwen3-asr-1.7b

## Resumen

`peonist-ai/halogen-npu-qwen3-asr-1.7b` es una conversión del modelo de reconocimiento automático del habla Qwen3-ASR-1.7B de Alibaba Qwen, empaquetada para ejecutarse exclusivamente sobre la NPU XDNA2 de los procesadores AMD Ryzen AI de la familia Strix Halo. No se trata de una versión redistribuible en el sentido habitual: los pesos han sido transformados a un formato propietario (`.hnpw`) y a programas de dispositivo (NPU) que solo carga el servidor `halogen-flash-server` del mismo autor. Por tanto, el repositorio no es utilizable desde `transformers`, `llama.cpp`, `vLLM` ni ningún otro runtime convencional.

El interés del artefacto es distinto al de un modelo al uso: documenta y distribuye una ruta de inferencia de ASR acelerada por NPU en hardware de consumo profesional (Strix Halo), con el objetivo de liberar la GPU para otros modelos que conviven en el mismo servidor. El modelo se sirve a través de un endpoint compatible con la API de OpenAI (`/v1/audio/transcriptions`), aceptando WAV de hasta 20 minutos o 25 MiB, y el autor lo presenta como la variante "más precisa" frente a otra de menor tamaño del mismo catálogo.

La relevancia es, por tanto, de infraestructura más que de investigación: demuestra un patrón de despliegue híbrido NPU+GPU en el que el ASR corre en la NPU mientras un modelo generativo (por ejemplo, `flux2-klein-4b`) ocupa la GPU. El tamaño del repositorio es de 4,1 GB y la licencia declarada es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base Qwen3-ASR-1.7B; los artefactos distribuidos son programas NPU y pesos `.hnpw`) |
| Parametros totales | 1,7 mil millones (deducido del nombre del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible. La unica cota documentada es la duracion de audio: hasta 20 minutos o 25 MiB por peticion |
| Tipos de cuantizacion | No se documentan niveles de cuantizacion. Los pesos se distribuyen convertidos a formato `.hnpw` para NPU; el encoder y el decodificador son programas de dispositivo ya compilados |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hnpw` (3,63 GB) para el decodificador; programas NPU precompilados para encoder (`enc/`, 379 MB) y dispositivo (`devices/`, 30 MB); tokenizer en `tokenizer/` (11 MB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3-ASR-1.7B ni su proceso de entrenamiento: no se indican número de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO. Lo único documentado por el autor de la conversión es la estructura del paquete: un encoder de audio compilado como programa NPU con sus pesos (379 MB), un decodificador de habla con su programa de dispositivo (30 MB) y los pesos del decodificador convertidos a `.hnpw` (3,63 GB), más el tokenizer.

La innovación técnica relevante no está en el modelo sino en la ruta de ejecución: la conversión permite ejecutar ASR sobre la NPU XDNA2 integrada en Strix Halo dentro del contenedor `halogen-flash-server`, que expone la transcripción con la forma de petición de la API de OpenAI. El despliegue exige el driver de NPU del host, XRT con su plugin de NPU, y mantener fijado el reloj de fabric de la GPU mientras la NPU trabaja en paralelo a esta. La conversión se realizó a partir de la revisión `7278e1e70fe206f11671096ffdd38061171dd6e5` del modelo original.

## Capacidades

- Transcripción de voz a texto (ASR) en inglés y otros idiomas del modelo base, aunque la lista concreta de idiomas no está documentada en la información disponible.
- Servicio HTTP compatible con la API de OpenAI mediante el endpoint `/v1/audio/transcriptions` que implementa el servidor.
- Procesamiento de grabaciones WAV de hasta 20 minutos de duración o 25 MiB de tamaño.
- Ejecución en la NPU (XDNA2) de AMD Ryzen AI Strix Halo, en paralelo con modelos servidos en GPU.
- Convivencia con otros modelos del catálogo del servidor (por ejemplo, `flux2-klein-4b`), con la restricción de que solo se sirve un modelo de voz a la vez.
- Verificación de integridad: el servidor comprueba tamaño y checksum de cada fichero antes de arrancar.
- No soporta tool calling, agentes, visión ni otras capacidades: es un modelo exclusivamente de reconocimiento de habla.
- No es cargable fuera del contenedor `halogen-flash-server`; el widget de HuggingFace está desactivado deliberadamente.

## Casos de uso

- Transcripción de reuniones y notas de voz: el límite de 20 minutos por petición y 25 MiB cubre la mayoría de grabaciones de reuniones, que pueden enviarse como WAV al endpoint `/v1/audio/transcriptions` sin salir del equipo local.
- Subtitulado por lotes en estaciones de trabajo Ryzen AI: al ejecutarse en la NPU, deja la GPU libre para tareas de vídeo o generación de imagen en el mismo host, lo que permite pipelines de subtitulado en paralelo.
- Dictado en aplicaciones internas: cualquier cliente que ya hable el formato de la API de OpenAI puede apuntar a este servidor sin cambios de código, útil para prototipos de dictado en herramientas ofimáticas.
- Transcripción de audio sensible con requisito de localidad: al correr en hardware propio y no depender de servicios en la nube, encaja en entornos con restricciones de residencia de datos.
- Preprocesado de corpus de audio para entrenamiento o evaluación de otros modelos: la salida de transcripción puede alimentar pipelines posteriores de anotación o de búsqueda sobre archivos de audio.
- Indexación y búsqueda de archivos de audio históricos: transcripción masiva de un archivo de grabaciones para hacerlas consultables por texto, ejecutada por lotes contra el endpoint local.
- Demostraciones de despliegue híbrido NPU+GPU: sirve como pieza de referencia para validar la convivencia de cargas de ASR en NPU con cargas generativas en GPU en un mismo equipo Strix Halo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, latencia, throughput ni comparaciones numéricas; únicamente afirma de forma cualitativa que esta variante es la más precisa de las dos que ofrece el servidor.

## Requisitos de hardware

- NPU obligatoria: AMD Ryzen AI con XDNA2 (familia Strix Halo). El modelo no funciona en GPU ni CPU convencionales.
- Huella en disco de los artefactos: aproximadamente 4,1 GB en total (3,63 GB de pesos `.hnpw`, 379 MB de encoder, 30 MB de programas de dispositivo, 11 MB de tokenizer).
- Software de host imprescindible: driver de NPU de AMD, XRT con el plugin de NPU, y el contenedor `halogen-flash-server` en versión 0.18.12 o superior para los ficheros de la cabeza del repositorio (versiones anteriores descargan la revisión con la que se publicaron).
- Reloj de fabric de la GPU fijado mientras la NPU trabaja junto a la GPU; sin esta condición el despliegue no es estable según la documentación del autor.
- VRAM de GPU: no aplica al modelo, que se ejecuta en la NPU. Sí condiciona el conjunto: con un modelo de voz cargado junto a otros modelos de NPU, las imágenes de más de 512x512 enviadas a `flux2-klein-4b` pueden no caber y devolver error.
- No cabe en GPU de consumo ni en Apple Silicon: la ruta de ejecución es exclusivamente la NPU Ryzen AI.
- Opciones de despliegue: únicamente `halogen-flash-server` con `HALOGEN_DOWNLOAD` activado y `HALOGEN_NPU_MODELS=qwen3-asr-1.7b`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El límite práctico documentado es de 20 minutos de audio o 25 MiB por petición, y un solo modelo de voz servido a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|
| `peonist-ai/halogen-npu-qwen3-asr-1.7b` | 1,7 B (heredado del base) | Audio de hasta 20 min o 25 MiB | Apache-2.0 | Solo NPU XDNA2 via `halogen-flash-server` | HuggingFace, repo de 4,1 GB |
| `Qwen/Qwen3-ASR-1.7B` (modelo base) | 1,7 B | No disponible | Apache-2.0 | Frameworks estandar (no confirmado en la informacion) | HuggingFace |
| Alternativas ASR de la misma categoria (p. ej. familia Whisper) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han proporcionado cifras de WER ni de rendimiento de ninguno de los contendientes. La diferencia funcional determinante frente al modelo base no es de calidad sino de portabilidad: este repositorio solo es ejecutable en un contenedor y hardware concretos.

## Limitaciones y advertencias

- Portabilidad nula: los ficheros no cargan en `transformers` ni en ningún otro runtime; el propio autor lo advierte y desactiva el widget de inferencia en el Hub.
- Dependencia de hardware propietario: requiere NPU XDNA2 (Strix Halo), driver de AMD y XRT con plugin de NPU. No hay ruta alternativa en CPU, GPU o Apple Silicon.
- Dependencia de versión del servidor: los ficheros de la cabeza del repositorio exigen `halogen-flash-server` 0.18.12 o superior; cada versión del servidor descarga la revisión con la que se publicó.
- Conflictos de recursos: solo se sirve un modelo de voz a la vez y, con un modelo de voz cargado, las imágenes grandes de `flux2-klein-4b` pueden fallar por falta de espacio en la NPU.
- Límites de entrada: 20 minutos de audio o 25 MiB por petición, en formato WAV. No se documenta soporte de otros contenedores ni de streaming.
- Idiomas no documentados: no se especifica la cobertura lingüística real, por lo que no debe asumirse multilingüismo sin verificarlo con el modelo base.
- Idiomas y sesgos del modelo base: al no publicarse evaluación propia, los sesgos y el riesgo de alucinación son los de Qwen3-ASR-1.7B, no caracterizados en esta ficha. En ASR, los errores típicos son nombres propios, cifras y audio con ruido o acentos no representados en el entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero los programas NPU de `devices/` y `enc/` arrastran avisos de terceros recogidos en sus respectivos `NOTICE.md`, que deben revisarse antes de redistribuir.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor deriva las dudas a un Discord y los fallos al repositorio del servidor; no hay garantía de soporte.
- Advertencia sobre la documentación: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo contenido no relacionado), por lo que toda la información de esta ficha procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-npu-qwen3-asr-1.7b
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Revisión del modelo base utilizada: `7278e1e70fe206f11671096ffdd38061171dd6e5`
- Servidor `halogen-flash-server`: https://github.com/peonist-ai/halogen-flash-server
- Documentación de despliegue en NPU: https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Discord del proyecto: https://discord.gg/bcm6QknaV6
- Resultados de busqueda web: sin resultados relevantes para este modelo.
