# bkey-inc/bmoni-agent-speech

## Resumen

BMONI agent voice bundle es un paquete de modelos de voz publicado por bkey-inc para la aplicación BMONI, que integra un agente conversacional que se ejecuta en el propio dispositivo. El repositorio no contiene pesos entrenados por el autor: es un agregado de dos modelos de sherpa-onnx redistribuidos sin modificaciones, empaquetados en un único archivo ZIP de 110.393.673 bytes (aproximadamente 0,1 GB) con nombre versionado `agent-speech-2026-11-09-v1.zip`.

El paquete cubre las dos direcciones de la conversación por voz: reconocimiento de voz (STT) mediante Moonshine Tiny en inglés y cuantizado, y síntesis de voz (TTS) mediante Supertonic TTS en int8. Ambos se distribuyen en el formato y la estructura de directorios propios de sherpa-onnx (`stt/` y `tts/`), pensados para su carga directa con esa biblioteca en entornos móviles y de borde, sin necesidad de infraestructura de servidor.

Su relevancia es acotada pero concreta: sirve como referencia de empaquetado reproducible para agentes de voz totalmente locales, con verificación de integridad mediante SHA-256 de los archivos upstream y una política de versionado que nunca sobrescribe artefactos existentes. No es un modelo investigable por sus capacidades propias, sino un artefacto de distribución con licencia mixta (MIT para el código y el modelo STT, OpenRAIL-M para el modelo TTS) que conviene revisar antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (dos modelos independientes de sherpa-onnx: STT Moonshine Tiny y TTS Supertonic) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | STT: cuantizado (quantized); TTS: int8 |
| Idiomas soportados | STT: ingles; TTS: no disponible |
| Licencia | mixta: MIT (codigo y Moonshine Tiny) y OpenRAIL-M (Supertonic TTS) |
| Formato de pesos | artefactos sherpa-onnx empaquetados en ZIP (`agent-speech-2026-11-09-v1.zip`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su contenido son dos releases upstream de sherpa-onnx redistribuidos sin cambios: `sherpa-onnx-moonshine-tiny-en-quantized-2026-02-27` para reconocimiento de voz y `sherpa-onnx-supertonic-tts-int8-2026-03-06` para síntesis de voz. La información disponible no detalla la arquitectura interna de ninguno de los dos (tipo de encoder/decoder, número de capas, dimensión oculta ni volumen de datos de entrenamiento), por lo que esos datos deben consultarse en las fichas de los releases originales.

La innovación técnica del artefacto está en el proceso de construcción, no en los modelos: el script `scripts/build_speech_bundle.sh` del repositorio móvil de BMONI verifica ambos archivos upstream contra hashes SHA-256 fijados y genera un ZIP con nombre versionado por fecha (`agent-speech-2026-11-09-v1.zip`, SHA-256 `1811730dead5b85fc70cdde19a12b41dd0b658bcc48a2442838d92302ad2180c`). La política declarada es que cada versión recibe un nombre de archivo nuevo y los archivos existentes nunca se reemplazan, lo que permite fijar versiones y auditar la procedencia de cada artefacto.

## Capacidades

- Reconocimiento de voz en inglés (ASR) en el dispositivo mediante Moonshine Tiny cuantizado.
- Síntesis de voz (TTS) mediante Supertonic TTS en int8.
- Ejecución local orientada a móvil y borde a través de sherpa-onnx, sin dependencia de servicios en la nube.
- Integración como voz de un agente conversacional en la aplicación BMONI (chat de voz del agente on-device).
- Verificación de integridad de los artefactos mediante SHA-256 fijados en el script de construcción.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio más allá de voz ni modo de pensamiento.

## Casos de uso

- Asistente de voz sin conexión en aplicaciones móviles: el paquete proporciona STT y TTS listos para cargar con sherpa-onnx, de modo que el agente puede escuchar y responder sin enviar audio a un servidor.
- Dictado y transcripción en inglés en el propio dispositivo: Moonshine Tiny cuantizado está pensado para entornos con recursos limitados, lo que permite transcribir notas o comandos sin coste de API.
- Lectura de respuestas del agente en voz alta: Supertonic TTS en int8 sintetiza la respuesta del modelo de lenguaje, completando el bucle de conversación por voz.
- Prototipado de interfaces de voz para agentes: al ser un ZIP versionado y verificado, sirve como dependencia fija y reproducible en prototipos y pruebas de integración.
- Aplicaciones de accesibilidad: conversión de texto a voz y de voz a texto en local para usuarios que dependen de la interacción hablada, sin depender de conectividad.
- Distribución de artefactos de voz en pipelines móviles: el esquema de nombres versionados y hashes permite integrar la descarga y verificación del paquete en procesos de build y publicación de aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,1 GB) acota el orden de magnitud del paquete completo, pero no se desglosa por modelo ni se indica memoria en ejecución.
- GPU recomendadas: no disponible. El diseño apunta a ejecución en el propio dispositivo (móvil y borde) mediante sherpa-onnx, no a GPU de servidor.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del artefacto, aunque no hay datos oficiales de consumo de memoria; la información disponible no lo confirma.
- Opciones de despliegue: sherpa-onnx (biblioteca de referencia para la que están empaquetados los modelos); no se documentan otras rutas como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BMONI agent voice bundle (bkey-inc) | Paquete STT + TTS para sherpa-onnx | no disponible | no disponible | MIT + OpenRAIL-M | Hugging Face, ZIP de 0,1 GB |
| Moonshine Tiny (upstream, sherpa-onnx) | STT en ingles, cuantizado | no disponible | no disponible | MIT | Release upstream de sherpa-onnx |
| Supertonic TTS (upstream, sherpa-onnx) | TTS int8 | no disponible | no disponible | OpenRAIL-M | Release upstream de sherpa-onnx |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- El STT solo cubre inglés; no se documenta soporte multilingüe.
- La licencia es mixta: el modelo Supertonic TTS se distribuye bajo OpenRAIL-M, cuyas restricciones de uso se aplican a cualquiera que lo use o redistribuya; es obligatorio revisar `LICENSE.md` y los textos de licencia incluidos antes de un uso comercial.
- El repositorio no aporta documentación técnica propia sobre los modelos (arquitectura, datos de entrenamiento, evaluación); cualquier evaluación de calidad debe hacerse sobre los releases upstream.
- No hay benchmarks publicados ni métricas de precisión de transcripción o de calidad de síntesis en la información disponible.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada.
- El paquete está atado a la estructura y la versión de sherpa-onnx; cambios en esa biblioteca pueden requerir regenerar el bundle.
- El versionado por fecha con archivos inmutables implica que las actualizaciones llegan como artefactos nuevos, no como sustituciones del existente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bkey-inc/bmoni-agent-speech
- Release upstream STT (Moonshine Tiny, cuantizado): `sherpa-onnx-moonshine-tiny-en-quantized-2026-02-27` (referenciado en la model card; sin URL directa en la información disponible)
- Release upstream TTS (Supertonic TTS, int8): `sherpa-onnx-supertonic-tts-int8-2026-03-06` (referenciado en la model card; sin URL directa en la información disponible)
- Script de construcción citado: `scripts/build_speech_bundle.sh` del repositorio móvil de BMONI (sin URL directa en la información disponible)
- Licencias incluidas en el repo: `licenses/moonshine_mit.txt`, `licenses/supertonic_mit.txt`, `licenses/supertonic_openrail_m.txt`
