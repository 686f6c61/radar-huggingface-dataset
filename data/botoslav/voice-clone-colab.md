# Botoslav/voice-clone-colab

## Resumen

`Botoslav/voice-clone-colab` no es un modelo de pesos, sino un repositorio de cuadernos de Google Colab que orquestan dos motores de síntesis de voz para clonación de voz: X-Voice Stage 2 (0,4B) y CosyVoice 3 (Fun-CosyVoice3-0.5B-2512, 0,5B). El autor, Botoslav, publica dos notebooks listos para ejecutar en una GPU T4 gratuita que permiten clonar dos voces a partir de referencias de audio de 5 a 27 segundos, generar habla cruzada entre ruso e inglés y producir diálogos alternando ambas voces en un único WAV a 24 kHz.

El valor del repositorio es práctico: elimina la fricción de montar un pipeline de clonación zero-shot, incluyendo la transcripción automática de las referencias con Whisper en el caso de CosyVoice 3, y ofrece una comparación directa entre un motor con licencia no comercial (X-Voice, CC-BY-NC-4.0) y otro con licencia Apache-2.0 apta para uso comercial. No contiene pesos propios ni código de entrenamiento; los pesos se descargan de los repositorios públicos `XRXRX/X-Voice` y `FunAudioLLM/Fun-CosyVoice3-0.5B-2512`.

Es relevante ahora porque la clonación de voz zero-shot con pocos segundos de referencia se ha vuelto viable en hardware consumer, y este repositorio documenta el procedimiento completo con dos alternativas de licencia distinta, lo que facilita la evaluación rápida tanto para investigación como para prototipos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de notebooks; motores subyacentes X-Voice Stage 2 y CosyVoice 3) |
| Parametros totales | 0,4B (X-Voice Stage 2) y 0,5B (CosyVoice 3 Fun-CosyVoice3-0.5B-2512) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (referencias de audio de 5 a 27 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 30 idiomas en X-Voice; generacion cruzada ru ⇄ en documentada; CosyVoice 3: no disponible en la informacion |
| Licencia | no disponible para el repositorio; pesos X-Voice CC-BY-NC-4.0; pesos CosyVoice 3 Apache-2.0 |
| Formato de pesos | no disponible (los pesos se descargan de los repositorios de origen) |

## Arquitectura y entrenamiento

El repositorio no define arquitectura ni entrenamiento propios: es una capa de cuadernos Colab que invoca dos sistemas TTS. X-Voice Stage 2 es un modelo de 0,4B descrito en el paper arXiv 2605.05611, orientado a clonación de voz sin transcripción de la referencia, con cobertura de 30 idiomas. CosyVoice 3, en su variante Fun-CosyVoice3-0.5B-2512, es un modelo de 0,5B que realiza clonación zero-shot a partir de una referencia acompañada de su transcripción; el notebook obtiene esa transcripción automáticamente con Whisper.

No se dispone de datos sobre composición del dataset de entrenamiento, número de tokens, técnicas de alineación (RLHF/DPO) ni innovaciones de decodificación de ninguno de los dos motores en la información proporcionada. El repositorio sí documenta detalles operativos: salida a 24 kHz, modo diálogo que alterna y concatena réplicas de dos voces en un solo WAV, y descarga de pesos públicos sin necesidad de token de HuggingFace (aunque se recomienda para evitar límites de tasa).

## Capacidades

- Clonación de voz zero-shot a partir de referencias de 5 a 27 segundos de habla limpia.
- Clonación sin transcripción de la referencia con X-Voice Stage 2.
- Clonación con transcripción de la referencia en CosyVoice 3, con transcripción automática vía Whisper.
- Generación de habla en 30 idiomas con X-Voice.
- Generación cruzada de idioma documentada entre ruso e inglés (ru ⇄ en).
- Modo diálogo: alternancia de dos voces clonadas y concatenación en un único WAV a 24 kHz.
- Ejecución en GPU T4 de Google Colab con un flujo de tres pasos (abrir, seleccionar T4, ejecutar todo).
- Producción de resultados como reproductores dentro del notebook y como archivo comprimido descargable.
- No se documentan tool calling, function calling, razonamiento multi-paso ni modos de pensamiento, por tratarse de un sistema TTS.

## Casos de uso

- Prototipado rápido de clonación de voz en investigación: abrir el notebook, cargar dos referencias y obtener muestras de ambos motores para comparar calidad subjetiva sin montar infraestructura propia.
- Evaluación de licencias antes de un proyecto comercial: el repositorio permite probar en paralelo X-Voice (CC-BY-NC-4.0, no comercial) y CosyVoice 3 (Apache-2.0), de modo que el equipo puede decidir con muestras reales qué motor encaja con su modelo de negocio.
- Generación de voces para doblaje y localización ru ⇄ en: la generación cruzada de idioma permite producir habla en inglés con la identidad vocal de una referencia en ruso, útil para pruebas de doblaje automatizado.
- Producción de audio para pódcast o audiolibros con dos locutores: el modo diálogo alterna dos voces clonadas y entrega un único WAV a 24 kHz listo para postproducción.
- Docencia y formación en TTS: los cuadernos sirven como material didáctico reproducible en una T4 gratuita para explicar pipelines de clonación zero-shot, incluyendo el papel de Whisper en la transcripción de referencias.
- Pruebas de concepto de asistentes conversacionales con voz personalizada: clonar la voz de un locutor de marca y generar respuestas de prueba para validar la experiencia antes de invertir en infraestructura de inferencia dedicada.
- Benchmarking interno de motores TTS: usar las mismas referencias de audio en ambos notebooks para comparar latencia, naturalidad y fidelidad de timbre entre X-Voice y CosyVoice 3 bajo condiciones idénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: Google Colab con T4 (16 GB de VRAM) es el entorno objetivo documentado; los modelos de 0,4B y 0,5B son ligeros y no requieren GPU de centro de datos.
- VRAM estimada: no disponible de forma explícita; por el tamaño de los pesos (0,4B y 0,5B), la inferencia cabe holgadamente en 16 GB, incluso con margen para Whisper en el flujo de CosyVoice 3.
- GPU consumer: previsiblemente compatible con RTX 3060, RTX 4060 y superiores por el reducido tamaño de los modelos, aunque la información proporcionada solo confirma T4.
- Opciones de despliegue: los notebooks de Colab son el método documentado; no se detallan integraciones con vLLM, llama.cpp, Ollama ni TGI (y en general no aplican a modelos TTS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Referencia requerida | Disponibilidad |
|---|---|---|---|---|---|
| X-Voice Stage 2 | 0,4B | 30 | CC-BY-NC-4.0 | Audio sin transcripcion | Pesos en `XRXRX/X-Voice` |
| CosyVoice 3 (Fun-CosyVoice3-0.5B-2512) | 0,5B | no disponible | Apache-2.0 | Audio con transcripcion (automatica via Whisper) | Pesos en `FunAudioLLM/Fun-CosyVoice3-0.5B-2512` y repositorio GitHub |
| `Botoslav/voice-clone-colab` | no aplica (notebooks) | ru ⇄ en documentado | no disponible | Ambas segun motor | HuggingFace, 0 descargas |

La comparativa relevante es entre los dos motores que el repositorio empaqueta: X-Voice prioriza cobertura de idiomas y prescinde de transcripción, mientras que CosyVoice 3 ofrece licencia permisiva para uso comercial a cambio de requerir la transcripción de la referencia. No se dispone de datos de benchmarks que permitan comparar calidad objetiva entre ambos.

## Limitaciones y advertencias

- El repositorio en sí no incluye pesos ni licencia declarada; la licencia aplicable es la de cada motor (CC-BY-NC-4.0 para X-Voice, Apache-2.0 para CosyVoice 3).
- X-Voice tiene licencia CC-BY-NC-4.0, lo que excluye el uso comercial de sus pesos y de las voces generadas con ellos.
- La clonación de voz plantea riesgos de suplantación de identidad y deepfakes; es necesario obtener consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable (RGPD, AI Act).
- Las referencias de audio deben ser habla limpia de 5 a 27 segundos; audios con ruido, música o solapamiento degradan la calidad de la clonación.
- No se documentan sesgos de idioma, acento o género de los motores subyacentes.
- Riesgo de alucinación acústica: en TTS se traduce en artefactos, prosodia incorrecta o pronunciación defectuosa, especialmente en idiomas poco representados.
- El flujo está pensado para Colab con GPU T4; no se documentan requisitos para despliegue en producción, ni latencia, ni throughput.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (3 de noviembre de 2026), por lo que no hay evidencia de uso ni mantenimiento por parte de la comunidad.
- La fecha de creación indicada (2026) y el identificador arXiv 2605.05611 deben verificarse en la fuente original antes de citarlos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Botoslav/voice-clone-colab
- Notebook X-Voice: https://huggingface.co/Botoslav/voice-clone-colab/blob/main/xvoice_colab.ipynb
- Notebook CosyVoice 3: https://huggingface.co/Botoslav/voice-clone-colab/blob/main/cosyvoice3_colab.ipynb
- Paper X-Voice: https://arxiv.org/abs/2605.05611
- Pesos X-Voice: https://huggingface.co/XRXRX/X-Voice
- Pesos CosyVoice 3: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- Tokens de HuggingFace: https://huggingface.co/settings/tokens
