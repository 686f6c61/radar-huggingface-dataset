# OpenBloom/MOSS-TTS-Realtime-GGUF

## Resumen

MOSS-TTS-Realtime-GGUF es una cuantización en formato GGUF (concretamente Q4_K_M) del modelo de síntesis de voz MOSS-TTS-Realtime 2.0.0, desarrollado originalmente por el equipo OpenMOSS y convertido por OpenBloom Labs. El modelo base es un sistema de text-to-speech orientado a streaming en tiempo real, con soporte para inglés y chino, y está pensado para su uso en bucles de voz bidireccionales (duplex) además de la síntesis puntual. La cuantización reduce el peso a aproximadamente 1,24 GiB, lo que facilita su despliegue en entornos locales con recursos limitados.

El modelo cuenta con 2.020.775.936 parámetros totales (unos 2.000 millones) según los datos de safetensors del repositorio, y la conversión mantiene los embeddings del codebook local en f16 mientras aplica Q4_K_M al resto de pesos, un detalle técnico necesario porque las búsquedas en el codebook requieren filas en f16 o f32. La licencia es Apache-2.0, heredada del modelo original, lo que permite uso comercial sin restricciones adicionales más allá de las propias de dicha licencia.

La relevancia de esta ficha radica en que se trata de una conversión reciente (creada el 14 de noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, y cuya ejecución depende de un runtime específico: el fork de llama.cpp de OpenMOSS distribuido por OpenBloom bajo el nombre KrisKross. Esto implica que no es un GGUF estándar que funcione en cualquier build de llama.cpp, sino que requiere un cargador que implemente la arquitectura MOSS-TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de TTS basado en el modelo base OpenMOSS/MOSS-TTS-Realtime; no se detalla la arquitectura interna en la información proporcionada) |
| Parametros totales | 2.020.775.936 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (con embeddings del codebook local en f16) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `moss-tts-realtime-q4_k_m.gguf`, 1.335.751.072 bytes, ~1,24 GiB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base MOSS-TTS-Realtime en la documentación proporcionada. Se sabe que es un modelo de text-to-speech con capacidad de streaming en tiempo real y que soporta un modo duplex (bidireccional), lo que sugiere un diseño orientado a la generación incremental de audio con baja latencia. La model card de la cuantización no describe el tipo de transformer, los mecanismos de atención ni si emplea técnicas como decodificación especulativa o atención lineal.

Respecto al entrenamiento, la información disponible no incluye el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas del modelo original más allá de su orientación a tiempo real. Lo único verificable es que la cuantización conserva los embeddings del codebook local en f16 por requisitos del host de búsqueda, y que el resto de pesos se cuantizan a Q4_K_M. Cualquier dato adicional sobre el proceso de entrenamiento debe consultarse en la model card del modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio.
- Modo de streaming en tiempo real, adecuado para bucles de voz interactivos.
- Modo duplex (bidireccional) mediante el runtime `llama-moss-tts-realtime`, pensado para conversaciones de voz en vivo.
- Soporte de dos idiomas: inglés y chino.
- Compatible con endpoints según los tags del repositorio (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el modelo es específicamente de TTS.

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en un bucle duplex para conversaciones habladas en tiempo real, aprovechando su modo streaming y su reducido tamaño de 1,24 GiB para ejecutarse en hardware de consumo.
- Síntesis puntual en aplicaciones de escritorio: mediante el instalador de OpenBloom, se puede usar para la lane de TTS local de una aplicación, generando audio a partir de texto sin depender de servicios en la nube.
- Lectura de contenido en inglés y chino: adecuado para aplicaciones de accesibilidad o lectura de artículos, dado su soporte bilingüe.
- Prototipado de interfaces conversacionales: investigadores pueden montar un pipeline de voz bidireccional con el runtime KrisKross para experimentar con interacción hablada sin grandes requisitos de VRAM.
- Sistemas embebidos o de borde: el tamaño cuantizado permite desplegar TTS en dispositivos con recursos limitados, siempre que se use un cargador compatible con la arquitectura MOSS-TTS.
- Generación de locuciones para contenido multimedia: útil para crear narraciones en inglés o chino en flujos de producción local, verificando previamente el hash SHA-256 del archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo GGUF ocupa ~1,24 GiB, por lo que se puede inferir un requisito de memoria en torno a 1,5-2 GB para los pesos, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: probable por el tamaño del archivo cuantizado, pero no confirmado oficialmente.
- Opciones de despliegue: llama.cpp mediante el fork de OpenMOSS distribuido por OpenBloom (KrisKross), con los binarios `llama-moss-tts` y `llama-moss-tts-realtime`; cualquier cargador compatible con la arquitectura MOSS-TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS en tiempo real cuantizado en GGUF) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que la conversión es muy reciente y no ha sido validada por la comunidad.
- Requiere un runtime específico (KrisKross, el fork de llama.cpp de OpenMOSS distribuido por OpenBloom); no funciona en builds estándar de llama.cpp que no incluyan la arquitectura MOSS-TTS.
- Solo soporta inglés y chino; no se documentan otros idiomas.
- No se detallan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución al equipo OpenMOSS y respetar los términos de dicha licencia.
- OpenBloom Labs no está afiliado ni respaldado por el equipo OpenMOSS, según indica la propia model card.
- Se recomienda verificar el hash SHA-256 (`ccd2ab76524affbc3a33a54f56224e24eabb008e73dd2b4142e8bf48cf492ed6`) antes de usar el archivo.
- Al ser una cuantización Q4_K_M, puede haber una pérdida de calidad en la síntesis respecto al modelo original en precisión completa, aunque no se cuantifica en la documentación.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/OpenBloom/MOSS-TTS-Realtime-GGUF
- Modelo base: https://huggingface.co/OpenMOSS/MOSS-TTS-Realtime
- Repositorio GitHub de OpenMOSS/MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- Runtime KrisKross (releases de OpenBloom): https://huggingface.co/OpenBloom/runtime-releases
