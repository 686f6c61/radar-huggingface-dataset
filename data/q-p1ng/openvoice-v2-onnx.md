# Q-P1NG/openvoice-v2-onnx

## Resumen

OpenVoice v2 ONNX es un espejo del export a formato ONNX del conversor de tono de OpenVoice v2, un sistema de clonación y conversión de voz desarrollado originalmente por MyShell.ai. El repositorio, publicado por el usuario Q-P1NG, no contiene pesos nuevos ni modificaciones: son copias sin alterar del export realizado por TigreGotico con la herramienta voiceclonnx a partir de los pesos oficiales `myshell-ai/OpenVoiceV2`. Su función es servir como origen estable de descarga para los paquetes de voz opcionales de una aplicación denominada Q-P1NG, que verifica la integridad de cada fichero mediante SHA-256.

El modelo resuelve una tarea concreta: la conversión de tono (tone color conversion), es decir, transferir el timbre de una voz de referencia sobre un audio de entrada manteniendo el contenido lingüístico y el estilo prosódico. No es un modelo de texto ni un generador de voz completo por sí mismo; es el componente de conversión de timbre dentro del ecosistema OpenVoice v2, que combina un codificador de referencia y un conversor de tono.

La relevancia de este repositorio es fundamentalmente práctica y de reproducibilidad: al fijar una revisión concreta y publicar los hashes de cada artefacto, permite a la aplicación consumidora descargar binarios inmutables y verificables. El tamaño total del repositorio es de 0,2 GB y la licencia es MIT, heredada de MyShell.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Export ONNX del conversor de tono de OpenVoice v2 (no disponible el detalle interno de capas en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | FP32 (`tone_converter.onnx`) e INT8 (`tone_converter_q8.onnx`, `tone_ref_encoder_q8.onnx`) |
| Idiomas soportados | no disponible (la conversión de tono es independiente del idioma, pero no se documenta lista de idiomas) |
| Licencia | MIT (Copyright (c) 2023 MyShell.ai) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio contiene únicamente artefactos de inferencia en formato ONNX, no información sobre el proceso de entrenamiento. Según la model card, se trata de copias sin modificar del export realizado por TigreGotico mediante voiceclonnx a partir de los pesos oficiales de OpenVoice v2 de MyShell. Los ficheros incluidos son `tone_converter.onnx` (128.051.288 bytes, FP32), `tone_converter_q8.onnx` (40.804.625 bytes, INT8) y `tone_ref_encoder_q8.onnx` (2.315.304 bytes, INT8), además de `LICENSE` y `PROVENANCE.md`.

No se dispone en la información proporcionada de detalles sobre la arquitectura interna (tipo de bloques, número de capas, dimensión de embeddings), el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El documento `PROVENANCE.md` del export original contiene, según la model card, los detalles de exportación y las comprobaciones de paridad, pero su contenido no se reproduce aquí.

## Capacidades

- Conversión de tono de voz: transfiere el timbre de una voz de referencia sobre un audio de entrada.
- Codificación de referencia de voz: el fichero `tone_ref_encoder_q8.onnx` extrae el embedding de la voz de referencia necesario para la conversión.
- Ejecución en dos precisiones: FP32 para máxima fidelidad e INT8 para despliegue con menor huella de memoria.
- Integración vía ONNX Runtime: los artefactos son directamente cargables por runtimes compatibles con ONNX.
- Verificación de integridad: el repositorio publica SHA-256 de cada fichero, lo que permite validar descargas.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo completo ni modo thinking.

## Casos de uso

- Clonación de voz para doblaje: dado un audio de entrada y una muestra de voz de referencia, el conversor de tono transforma el timbre del audio original para que suene como la voz de referencia, manteniendo el contenido hablado. Es adecuado porque separa el timbre del contenido, lo que permite reutilizar una misma locución con distintas voces.
- Anonimización de voz: sustituir el timbre de un hablante por el de una voz sintética o de referencia antes de publicar una grabación, reduciendo la identificabilidad del locutor original.
- Prototipado de asistentes de voz personalizados: integrar el conversor en una aplicación que ofrece paquetes de voz descargables, como hace la app Q-P1NG, usando los ficheros ONNX como artefactos de descarga verificables.
- Producción de contenido multilingüe: aplicar una voz de referencia consistente a grabaciones en distintos idiomas, ya que la conversión de tono opera sobre características acústicas y no sobre texto.
- Despliegue en entornos con recursos limitados: usar las variantes INT8 (`tone_converter_q8.onnx` de ~41 MB y `tone_ref_encoder_q8.onnx` de ~2,3 MB) para inferencia en CPU o dispositivos con poca memoria, frente a los ~128 MB de la variante FP32.
- Investigación en conversión de voz: servir como referencia reproducible y con hashes fijados para comparar resultados de conversión de tono entre experimentos, evitando variaciones por cambios en el repositorio de origen.
- Pipelines de verificación de integridad: usar los SHA-256 publicados para validar que los binarios desplegados en producción coinciden con los artefactos esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los ficheros, la variante FP32 (~128 MB) y las variantes INT8 (~41 MB y ~2,3 MB) son manejables en memoria modesta, pero no se documenta el consumo real en inferencia.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el tamaño de los artefactos sugiere que podría ejecutarse en hardware de consumo, pero no hay confirmación del autor.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| OpenVoice v2 ONNX (este repo) | Conversión de tono | ONNX (FP32/INT8) | MIT | no aplica | HuggingFace, espejo verificado |
| OpenVoice v2 original (myshell-ai/OpenVoiceV2) | Conversión de tono y clonación | Pesos originales (no ONNX) | MIT | no aplica | HuggingFace |
| voiceclonnx-openvoice-v2 (TigreGotico) | Export ONNX de OpenVoice v2 | ONNX | MIT | no aplica | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la diferencia principal es el formato de pesos y la existencia de hashes de integridad en este repositorio.

## Limitaciones y advertencias

- Este repositorio no aporta pesos nuevos ni mejoras: es un espejo de un export de terceros; cualquier limitación del OpenVoice v2 original aplica aquí.
- No se documentan sesgos conocidos del modelo en la información proporcionada; al tratarse de conversión de voz, es esperable que herede sesgos acústicos del dataset original, pero no hay confirmación.
- Riesgo de uso indebido: la conversión de voz puede emplearse para suplantación de identidad o deepfakes; la licencia MIT no impone restricciones de uso ético, por lo que la responsabilidad recae en el integrador.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright de MyShell.ai incluido en `LICENSE`.
- No se documentan idiomas soportados ni limitaciones de contexto o idioma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-03; no hay evidencia de uso en producción más allá de la app Q-P1NG.
- La fecha de creación indicada (2026) es posterior a la fecha habitual de publicación de OpenVoice v2; conviene verificar la coherencia temporal del repositorio antes de confiar en él.
- No se dispone de información sobre latencia, throughput ni requisitos de hardware reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Q-P1NG/openvoice-v2-onnx
- Export de origen (TigreGotico): https://huggingface.co/TigreGotico/voiceclonnx-openvoice-v2
- Revisión fijada del export: https://huggingface.co/TigreGotico/voiceclonnx-openvoice-v2/resolve/34d010c192c97f763207f488f6057fd07fee42ad
- Pesos oficiales de OpenVoice v2: https://huggingface.co/myshell-ai/OpenVoiceV2
- Repositorio OpenVoice en GitHub: https://github.com/myshell-ai/OpenVoice
- Herramienta de export voiceclonnx: https://github.com/TigreGotico/voiceclonnx
