# cantonese-dev/tts-server

## Resumen

`cantonese-dev/tts-server` es un paquete de pesos en formato GGUF publicado por la organización cantonese-dev para desplegar un servidor de síntesis de voz (TTS) en cantonés. No se trata de un modelo de lenguaje generalista, sino de un conjunto de artefactos orientados a un runtime específico (`ggk`) que combina un modelo base de aproximadamente 914 millones de parámetros con un adaptador y un códec de tokenización de audio. El repositorio ocupa 1,3 GB y se distribuye bajo licencia Apache 2.0.

La relevancia del proyecto radica en su enfoque: empaquetar el pipeline completo de TTS (modelo base, adaptador de dominio cantonés y códec de audio) en ficheros GGUF cuantizados listos para servir mediante una API HTTP compatible con el endpoint `/v1/audio/speech`. Esto facilita el autohospedaje de un servicio de voz en cantonés sin depender de infraestructura propietaria, un idioma con cobertura limitada en los sistemas TTS comerciales.

La información pública disponible es escasa: la model card se limita a instrucciones de arranque y a un ejemplo de petición `curl`, sin detallar arquitectura interna, datos de entrenamiento ni resultados de evaluación. Los datos técnicos que se presentan a continuación proceden del recuento de parámetros en safetensors, del tamaño del repositorio y de los nombres de fichero citados en la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~0,9 B parámetros con adaptador y códec de audio de 12 Hz; arquitectura interna no documentada) |
| Parámetros totales | 914.643.008 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (modelo base y códec), F16 (adaptador) |
| Idiomas soportados | cantonés (según nombre y ejemplos de la model card); otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base. Los artefactos distribuidos sugieren un pipeline en tres piezas: un modelo principal (`cantonese-1.2-0.6b-q8_0.gguf`, con nombre que apunta a una variante de 0,6 B en Q8_0 aunque el recuento real de safetensors es de 914,6 M de parámetros), un adaptador específico de cantón (`pig_cantonese_0.6b_adapter-test-f16.gguf`) y un códec de tokenización de audio a 12 Hz (`tts-tokenizer-12hz-q8_0.gguf`). El sufijo "12hz" indica una representación de audio con trama de 12 tokens por segundo, típica de códecs neuronales de voz.

No hay datos sobre volumen de entrenamiento, composición del corpus, uso de RLHF/DPO ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.). La model card únicamente documenta el procedimiento de despliegue con el runtime `ggk`, que expone un servidor HTTP en el puerto 8888 y acepta peticiones en el formato del endpoint `/v1/audio/speech`.

## Capacidades

- Síntesis de voz (TTS) en cantonés a partir de texto, con salida en formato de audio (el ejemplo genera `speech.mp3`).
- Control de estilo de voz mediante instrucciones en lenguaje natural: el ejemplo de la model card solicita "a warm female voice".
- Servicio HTTP con API compatible con el esquema `/v1/audio/speech`, lo que facilita la integración con clientes que ya hablan ese contrato.
- Procesamiento de texto de entrada en UTF-8 (la model card insiste en enviar el cuerpo de la petición codificado en UTF-8, relevante para caracteres chinos).
- Despliegue local o autohospedado mediante el runtime `ggk` y ficheros GGUF cuantizados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Servicio de locución en cantonés para aplicaciones de accesibilidad: el modelo permite convertir texto a voz en cantonés en local, de modo que lectores de pantalla y asistentes puedan ofrecer salida hablada sin enviar contenido a servicios externos.
- Generación de avisos y anuncios en transporte público: integración del endpoint `/v1/audio/speech` en un sistema de megafonía que sintetice mensajes dinámicos (retrasos, cambios de andén) en cantonés con una voz consistente.
- Doblaje y localización de contenido corto: producción de pistas de voz para vídeos, pódcast o material formativo dirigido a audiencias de Hong Kong y Guangdong, ajustando el estilo de voz mediante la instrucción textual.
- Atención al cliente telefónica automatizada: uso del servidor TTS como capa de salida de voz en un bot conversacional en cantonés, desplegado en infraestructura propia para cumplir requisitos de residencia de datos.
- Prototipado de interfaces de voz para investigación lingüística: investigadores en fonética o procesamiento del cantonés pueden generar estímulos auditivos controlados y reproducibles con un pipeline abierto y cuantizado.
- Pruebas de integración en pipelines de CI: al ser un servidor HTTP con un contrato de API conocido, se puede levantar en contenedores efímeros para validar extremo a extremo flujos de texto a audio antes de desplegar en producción.
- Educación y aprendizaje de cantonés: generación de material de escucha con pronunciación sintética para aplicaciones de aprendizaje de idiomas, con la salvedad de que no se ha documentado la calidad fonética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 1,3 GB; con el modelo base en Q8_0, el adaptador en F16 y el códec en Q8_0, la inferencia debería caber holgadamente en GPUs de consumo con 4-6 GB de VRAM, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100) debería ser suficiente; no hay datos de rendimiento por modelo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del conjunto de pesos; sin confirmación oficial del autor.
- Opciones de despliegue: runtime `ggk` (requerido por la model card, instalable con `pip install ggk`), con servidor en el puerto 8888. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| cantonese-dev/tts-server | 914,6 M | no disponible | cantonés | Apache 2.0 | GGUF | Pipeline TTS con runtime `ggk`; sin benchmarks publicados |
| Alternativas TTS open source (p. ej. Piper, Coqui XTTS) | no disponible en esta ficha | no disponible | multilingüe en general, cantonés no garantizado | varía (MIT, MPL, CPML) | ONNX, safetensors, etc. | No se dispone de datos verificados en la información proporcionada para establecer una comparación numérica |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas; los datos de esta ficha no permiten afirmar equivalencias con otros sistemas TTS.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card detallada, paper, ni descripción de arquitectura, datos o evaluación; esto dificulta la validación en producción.
- Sin benchmarks publicados: no es posible estimar calidad de síntesis, naturalidad, inteligibilidad ni latencia antes de desplegar.
- Cobertura lingüística restringida: el proyecto está orientado al cantonés; no se documenta soporte para mandarín, inglés u otros idiomas.
- Dependencia de un runtime específico (`ggk`): el despliegue está atado a esa herramienta y a su API; no se documentan alternativas de servido.
- Riesgo de artefactos de audio: al no haber evaluación publicada, no se puede descartar inestabilidad en la prosodia, pronunciación de nombres propios o caracteres poco frecuentes.
- Riesgo de alucinación o error de lectura: en TTS, texto no estándar (números, siglas, emojis, código) puede producirse de forma incorrecta sin normalización previa.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar la procedencia de los datos de entrenamiento del modelo base y del códec, no documentada en el repositorio.
- Repositorio con 0 descargas y creado/actualizado en noviembre de 2026: madurez y mantenimiento no verificables; tratar como proyecto experimental.
- El nombre del fichero base (`cantonese-1.2-0.6b-q8_0.gguf`) sugiere 0,6 B parámetros, mientras que el recuento en safetensors indica 914,6 M; esta discrepancia no está aclarada por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cantonese-dev/tts-server
- Sitio del proyecto: https://cantonese.dev
- Documentación para agentes: https://cantonese.dev/llms-full.txt
