# HeartMuLa/HeartMuLa-oss-3B

## Resumen

HeartMuLa-oss-3B es un modelo fundacional de generación de música (text-to-audio) desarrollado por el equipo HeartMuLa, presentado en el artículo "HeartMuLa: A Family of Open Sourced Music Foundation Models" (arXiv:2601.10547). El modelo convierte texto (letras de canciones y descripciones) en audio musical, y forma parte de un ecosistema más amplio que incluye HeartCodec-oss (códec de audio) y HeartTranscriptor-oss (transcriptor). Con 3.938.113.536 parámetros (~3,9B) y un repositorio de 15,8 GB en safetensors, se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución restrictivas.

El modelo resuelve el problema de la generación musical controlable y de alta fidelidad a partir de texto, un ámbito donde la mayoría de los sistemas punteros son propietarios. Su carácter abierto y su soporte multilingüe (chino, inglés, japonés, coreano y español) lo hacen relevante para desarrolladores que necesitan integrar generación musical en pipelines propios, así como para investigadores que quieran reproducir o extender el trabajo.

La relevancia actual del modelo radica en tres factores: la licencia permisiva, el tamaño manejable (apto para despliegue en hardware de gama alta de consumo con cuantización) y la disponibilidad de un stack completo de código abierto (códec, transcriptor y librería de inferencia) que cubre el ciclo completo de generación musical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de música text-to-audio; detalles en el paper arXiv:2601.10547) |
| Parametros totales | 3.938.113.536 (~3,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingual, zh, en, ja, ko, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza de modelo fundacional de música con pipeline text-to-audio. El artículo de referencia (arXiv:2601.10547) es la fuente primaria para conocer la arquitectura exacta, la composición del dataset de entrenamiento, el número de tokens de audio utilizados y si se emplearon técnicas de alineación como RLHF o DPO. El modelo se integra en un ecosistema con un códec de audio dedicado (HeartCodec-oss) y un transcriptor (HeartTranscriptor-oss), lo que sugiere una arquitectura de generación en el espacio latente del códec.

No se dispone de información sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la documentación proporcionada. La librería de inferencia oficial es heartlib (GitHub: HeartMuLa/heartlib), que ofrece el quickstart y las instrucciones de despliegue local.

## Capacidades

- Generación de música a partir de texto: creación de canciones a partir de letras y descripciones textuales.
- Generación de covers y remixes (según la model card, funcionalidad disponible en la plataforma MuLa Studio).
- Edición de pasajes concretos de una canción (edición localizada de fragmentos).
- Soporte multilingüe en la entrada: chino, inglés, japonés, coreano y español.
- Integración con códec de audio propio (HeartCodec-oss) para la síntesis de la señal de audio.
- Integración con transcriptor propio (HeartTranscriptor-oss) para tareas de transcripción de audio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes ni modos de razonamiento extendido, lo cual es coherente con un modelo de generación de audio.

## Casos de uso

- Producción musical asistida: compositores y productores pueden generar borradores de canciones a partir de letras y descripciones de estilo, acelerando la fase de ideación antes de la producción final en un DAW.
- Generación de bandas sonoras para contenido audiovisual: creación de música de fondo para vídeos, podcasts o videojuegos a partir de descripciones textuales, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Creación de covers y remixes: el modelo permite transformar canciones existentes en nuevas versiones, útil para sellos discográficos y creadores de contenido que quieran explorar variaciones de un tema.
- Edición musical localizada: modificar un pasaje concreto de una canción (por ejemplo, un estribillo) sin regenerar la pieza completa, lo que reduce el coste computacional y preserva el resto de la composición.
- Aplicaciones educativas de música: generar ejemplos auditivos de estilos, progresiones o estructuras para clases de producción musical y teoría.
- Prototipado rápido en estudios de sonido: generar múltiples variantes de una idea musical en minutos para evaluar direcciones creativas antes de invertir en grabación con músicos.
- Localización de contenido musical: generar versiones de una canción en distintos idiomas soportados (zh, en, ja, ko, es) para mercados internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa por tamaño, un modelo de ~3,9B parámetros en precisión FP16 requiere aproximadamente 8 GB solo para los pesos, más el overhead de activaciones y del códec de audio asociado; en cuantizaciones de 8 bits o 4 bits el requisito de pesos baja a ~4 GB y ~2 GB respectivamente, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar viabilidad en GPUs de consumo de gama alta (por ejemplo, RTX 4090 con 24 GB) y en GPUs de datacenter (A100, H100) para inferencia en producción.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 16-24 GB de VRAM, aunque el requisito real depende del códec y de la longitud de audio generada; no confirmado por el autor.
- Opciones de despliegue: la vía oficial es la librería heartlib (GitHub: HeartMuLa/heartlib). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, lo cual es esperable en un modelo de audio y no de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HeartMuLa-oss-3B | ~3,9B | no disponible | Apache 2.0 | Pesos abiertos en HF | Text-to-audio musical, multilingüe (zh, en, ja, ko, es) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos musicales, puede reflejar sesgos de estilo, género o cultura presentes en el corpus.
- Riesgo de alucinación: en generación de audio, el equivalente es la generación de pasajes musicales incoherentes o letras mal pronunciadas; no cuantificado por el autor.
- Limitaciones de contexto o idioma: el soporte multilingüe se limita a zh, en, ja, ko y es; otros idiomas no están garantizados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y aviso de cambios; no se documentan restricciones adicionales, pero conviene revisar el texto completo de la licencia y las condiciones de uso de los datasets de entrenamiento.
- Caveats para producción: no se documentan requisitos de hardware, latencia ni throughput; la integración depende de la librería heartlib y del códec HeartCodec-oss, lo que añade complejidad al pipeline. La fecha de creación (enero de 2026) y la actualización (noviembre de 2026) indican un modelo relativamente reciente con posible evolución activa.
- Dependencia del ecosistema: el modelo no funciona de forma aislada; requiere el códec y, para ciertas tareas, el transcriptor, lo que incrementa los requisitos de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Paper: https://arxiv.org/abs/2601.10547
- Repositorio GitHub (heartlib): https://github.com/HeartMuLa/heartlib
- Web oficial: https://heartmula.com/
- Demo: https://heartmula.github.io/
- Códec de audio (HeartCodec-oss): https://huggingface.co/HeartMuLa/HeartCodec-oss
- Transcriptor (HeartTranscriptor-oss): https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
