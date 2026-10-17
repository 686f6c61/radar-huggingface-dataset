# Allinsama/Coqui__XTTS-v2

## Resumen

XTTS-v2 es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por Coqui que permite clonar una voz a partir de una referencia de audio de tan solo 6 segundos, sin necesidad de entrenamiento adicional ni de horas de datos. El modelo genera audio a 24 kHz y cubre 17 idiomas, incluyendo castellano, con clonación de voz entre idiomas (usar una referencia en un idioma para sintetizar en otro).

La ficha que se analiza aquí corresponde al repositorio Allinsama/Coqui__XTTS-v2, una republicación de los pesos de XTTS-v2 (2,1 GB) que reutiliza la model card original de Coqui. El pipeline declarado en HuggingFace es text-to-speech y la librería asociada es coqui. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso o validación comunitaria sobre esta copia concreta.

Su relevancia práctica está en que combina clonación zero-shot, cobertura multilingüe amplia y una licencia pública específica para modelos generativos (CPML), lo que lo sitúa como una alternativa abierta para doblaje, audiolibros, asistentes de voz y prototipado de interfaces habladas. No es un modelo de lenguaje: no razona, no ejecuta herramientas y no procesa imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; modelo de la familia XTTS implementado en la librería Coqui TTS, con condicionamiento de hablante (la model card solo menciona "mejoras arquitectónicas para el condicionamiento de hablante" respecto a la v1) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no aplica; la referencia de voz es de 6 segundos y el texto de entrada es de longitud variable |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 17: inglés (en), castellano (es), francés (fr), alemán (de), italiano (it), portugués (pt), polaco (pl), turco (tr), ruso (ru), neerlandés (nl), checo (cs), árabe (ar), chino (zh-cn), japonés (ja), húngaro (hu), coreano (ko), hindi (hi) |
| Licencia | Coqui Public Model License (CPML) |
| Formato de pesos | no especificado; repositorio de 2,1 GB compatible con la librería coqui |
| Frecuencia de muestreo de salida | 24 kHz |
| Pipeline | text-to-speech |
| Tamaño del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

La model card no publica detalles de arquitectura, número de parámetros ni composición del dataset de entrenamiento. Lo que sí documenta son las novedades de la versión 2 respecto a XTTS-v1: dos idiomas nuevos (húngaro y coreano), mejoras arquitectónicas en el condicionamiento de hablante, soporte de múltiples referencias de voz con interpolación entre hablantes, mejoras de estabilidad y una mejora general de prosodia y calidad de audio.

El modelo se distribuye a través de la librería Coqui TTS, que ofrece tanto inferencia como ajuste fino (fine-tuning) mediante su API de Python y su interfaz de línea de comandos. En la información disponible no se detallan el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF/DPO u otras técnicas de alineación; tampoco se describen innovaciones de decodificación o mecanismos de atención específicos.

## Capacidades

- Síntesis de voz multilingüe en 17 idiomas desde una única instancia del modelo, seleccionando el idioma mediante el parámetro `language`.
- Clonación de voz zero-shot con una referencia de audio de 6 segundos, sin reentrenamiento.
- Clonación de voz entre idiomas: la referencia puede estar en un idioma distinto al del texto a sintetizar.
- Transferencia de emoción y estilo a través de la propia referencia de voz clonada.
- Soporte de múltiples referencias de hablante e interpolación entre ellas, lo que permite mezclar características de varias voces.
- Salida de audio a 24 kHz.
- Ajuste fino adicional sobre el modelo preentrenado mediante la librería Coqui TTS.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio de entrada como prompt semántico (la entrada de audio es únicamente referencia de hablante).
- Capacidad multilingüe limitada a los 17 idiomas listados; no se documenta soporte de otros idiomas ni de cambio de idioma dentro de una misma frase.

## Casos de uso

- Doblaje y localización de vídeo: el modelo permite generar una pista de voz en castellano, francés o alemán manteniendo el timbre del hablante original a partir de un clip de 6 segundos, lo que reduce el coste frente a la contratación de locutores por idioma.
- Audiolibros y contenido largo narrado: la clonación de una voz concreta permite mantener consistencia de timbre entre capítulos, y el ajuste fino sobre la librería Coqui TTS posibilita adaptar la prosodia al estilo del narrador.
- Prototipado de asistentes de voz e IVR: se puede generar un conjunto de respuestas pregrabadas con una voz corporativa concreta usando una única muestra de referencia, sin pasar por un estudio de grabación.
- Accesibilidad y lectura en voz alta: integración en aplicaciones que convierten texto en audio para usuarios con discapacidad visual, con la ventaja de ofrecer 17 idiomas desde el mismo modelo.
- Videojuegos y personajes: generación de líneas de diálogo para NPCs con voces diferenciadas mediante múltiples referencias de hablante e interpolación entre ellas, útil en fases de preproducción y doblaje provisional.
- Formación y e-learning: producción de locuciones para cursos en varios idiomas con una voz consistente de instructor, incluyendo la posibilidad de reutilizar la voz de un docente con su consentimiento.
- Investigación en TTS y clonación de voz: el modelo sirve como línea base reproducible para experimentos de transferencia de estilo, evaluación de prosodia o estudios de detección de voz sintética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas objetivas (MOS, WER, similitud de hablante) ni comparaciones cuantitativas con otros sistemas de síntesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifras oficiales. Como referencia orientativa a partir del tamaño del repositorio (2,1 GB de pesos), cabe esperar un consumo en el entorno de 3-5 GB de VRAM en precisión completa, dependiendo de la longitud del texto y del número de referencias de voz utilizadas; se trata de una estimación, no de un dato publicado.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible. La API de la librería acepta `gpu=True` / `--use_cuda true`, por lo que se espera soporte CUDA.
- GPU de consumo: por el tamaño de pesos indicado, es plausible que el modelo quepa en tarjetas de 8 GB o más (por ejemplo, RTX 3060, RTX 4060 Ti, RTX 4070), aunque no se ha verificado en la información disponible.
- CPU: la inferencia en CPU es posible a través de la librería Coqui TTS, pero no se han publicado cifras de latencia.
- Opciones de despliegue: API de Python de Coqui TTS (`TTS.api.TTS`), interfaz de línea de comandos (`tts --model_name tts_models/multilingual/multi-dataset/xtts_v2`), carga directa con `XttsConfig` y `Xtts`, y servidores HTTP construidos sobre la propia librería. vLLM, llama.cpp, Ollama y TGI no aplican: son herramientas para modelos de lenguaje, no para síntesis de voz.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos no están verificados en la información proporcionada; se indican características generales y se marca "no disponible" donde no hay dato contrastado.

| Modelo | Tipo | Parámetros | Idiomas | Clonación zero-shot | Licencia |
|---|---|---|---|---|---|
| XTTS-v2 (esta ficha) | TTS multilingüe con clonación | no disponible | 17 | Sí, con 6 s de referencia | Coqui Public Model License |
| Bark (Suno) | TTS generativo | no disponible | Multilingüe (no detallado) | Parcial, mediante prompt de hablante | no disponible en esta consulta |
| Piper | TTS ligero orientado a dispositivos | no disponible | Múltiple, con voces por idioma | No | no disponible en esta consulta |
| Tortoise TTS | TTS de alta calidad con clonación | no disponible | Principalmente inglés | Sí | no disponible en esta consulta |

Frente a las alternativas ligeras tipo Piper, XTTS-v2 aporta clonación zero-shot y cobertura de 17 idiomas en un único checkpoint, a costa de un repositorio de 2,1 GB y de una licencia específica con posibles restricciones comerciales. Frente a sistemas centrados en calidad y velocidad de inferencia reducida, su ventaja es la integración en un ecosistema (Coqui TTS) con API, CLI y utilidades de ajuste fino.

## Limitaciones y advertencias

- No se han publicado parámetros, arquitectura detallada, dataset de entrenamiento ni métricas de evaluación, lo que dificulta la comparación rigurosa con alternativas.
- La licencia Coqui Public Model License (CPML) es una licencia específica para modelos generativos; la model card enlaza sus términos pero no los resume. Es imprescindible revisarla antes de cualquier uso comercial, ya que puede imponer restricciones.
- Este repositorio es una republicación bajo el namespace Allinsama con la model card original de Coqui, con 0 descargas y 0 likes: no hay validación comunitaria de esta copia concreta ni garantía de que los pesos coincidan con la distribución oficial.
- La clonación de voz permite suplantación de identidad. Cualquier despliegue debe exigir consentimiento explícito del hablante de referencia y cumplir la normativa aplicable sobre identificación de contenido sintético.
- No se documentan evaluaciones de sesgo por idioma, acento o género; el rendimiento puede variar de forma significativa entre los 17 idiomas declarados.
- No se documenta robustez ante textos con números, siglas, abreviaturas, código o puntuación atípica, ni comportamiento ante cambios de idioma dentro de una misma frase.
- No es un modelo de lenguaje: no razona, no responde preguntas, no ejecuta herramientas y no procesa imágenes.
- No se especifican los formatos de pesos ni opciones de cuantización, lo que limita la planificación de despliegues con presupuesto de memoria ajustado.
- La fecha de creación del repositorio (2026-10-17) y su estado sin descargas hacen recomendable contrastar los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Allinsama/Coqui__XTTS-v2
- Código y fine-tuning (Coqui TTS en GitHub): https://github.com/coqui-ai/TTS
- Documentación: https://tts.readthedocs.io/en/latest/
- Documentación del modelo XTTS: https://tts.readthedocs.io/en/latest/models/xtts.html#training
- Demo Space de XTTS: https://huggingface.co/spaces/coqui/xtts
- Demo de voice chat con Mistral o Zephyr: https://huggingface.co/spaces/coqui/voice-chat-with-mistral
- Licencia CPML: https://coqui.ai/cpml
- Historia de la licencia CPML: https://coqui.ai/blog/tts/cpml
- Coqui Studio: https://coqui.ai/
- API de Coqui: https://docs.coqui.ai/docs
- Foro de preguntas (GitHub Discussions): https://github.com/coqui-ai/TTS/discussions
- Discord: https://discord.gg/5eXr5seRrv
- Twitter: https://twitter.com/coqui_ai
