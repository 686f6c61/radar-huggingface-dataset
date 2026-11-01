# BlueRoseLabs/Silencio-2

## Resumen

Silencio-2 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por BlueRose Labs como un fine-tune de Pocket TTS 18M de Kyutai. Con 27,9 millones de parámetros totales, genera audio mono a 24 kHz a partir de texto y permite dirigir la interpretación mediante etiquetas insertadas en el propio texto: sonidos como `[sigh]` o `[laugh]` y emociones como `<happy>`, `<sad>` o `<whisper>`. Además, incorpora clonación de voz a partir de unos pocos segundos de audio de referencia.

El modelo resuelve el problema de la expresividad en TTS de tamano reducido: en lugar de depender de un modelo grande en la nube, ofrece control emocional y de sonidos en un paquete que cabe en un único archivo de 112 MB y que, según el autor, corre unas 20 veces más rápido que el tiempo real en cuatro hilos de CPU de un Apple M4. Esto lo hace relevante para despliegues en dispositivo (on-device), aplicaciones de accesibilidad y prototipado rápido sin GPU.

La arquitectura es un modelo de lenguaje basado en flujo que predice los latentes del códec Mimi a partir del texto y de un prompt de voz, un paso por frame. El modelo está entrenado únicamente en inglés y se distribuye con licencia CC-BY-4.0 para los pesos y MIT para el código del núcleo de inferencia. El repositorio es muy reciente y cuenta con cero descargas en el momento de la consulta, por lo que su adopción práctica aún está por consolidarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje basado en flujo que predice latentes del códec Mimi desde texto y prompt de voz, un paso por frame |
| Parametros totales | 27.928.690 (18,2M para generación de voz; el resto, codificador Mimi para clonación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 en CPU (opción `quantize=True`); no se detallan otros formatos |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el código de `silencio2/core` |
| Formato de pesos | safetensors (archivo único de 112 MB), tokenizer SentencePiece, config.yaml |

## Arquitectura y entrenamiento

Silencio-2 es un fine-tune de Pocket TTS 18M de Kyutai. Se trata de un modelo de lenguaje basado en flujo que predice los latentes del códec de audio Mimi a partir del texto y de un prompt de voz, generando un paso por frame. El audio resultante es mono a 24 kHz y se puede emitir en streaming a medida que se genera. El tokenizador es SentencePiece al que se le añadieron 11 tokens extra, uno por cada etiqueta de sonido o emoción.

El entrenamiento partió del tokenizador y la tabla de texto de Pocket TTS 18M, extendidos con los tokens de etiqueta, y se realizó un fine-tune sobre un dataset propio con el código de entrenamiento de Kyutai. Para que las etiquetas controlen la interpretación y no el prompt de voz, se eliminó la etiqueta en una quinta parte de los textos de entrenamiento y se usó a menudo una toma neutra de la misma voz como prompt en los clips etiquetados. Una etapa final de destilación integra el classifier-free guidance en los pesos, de modo que la inferencia requiere una sola pasada por frame. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de voz en inglés a 24 kHz a partir de texto, con salida en streaming.
- Control de sonidos insertados en el texto: `[laugh]`, `[sigh]`, `[gasp]`, `[cough]`, `[clear_throat]`.
- Control de emociones que se aplican al texto posterior: `<happy>`, `<sad>`, `<angry>`, `<fear>`, `<surprised>`, `<whisper>`.
- Clonación de voz a partir de un clip corto y limpio de referencia.
- Voces preincluidas: `1320`, `2094`, `260`, `3575`, `5639`, `6930`, `7127`, `7729`.
- Reproducibilidad mediante semilla (`seed`) para obtener tomas consistentes.
- Normalización automática del nivel de las tomas susurradas (unas diez veces más bajas que el habla normal), configurable con `normalize=False`.
- Validación de etiquetas: una etiqueta desconocida lanza un error en lugar de leerse en voz alta.
- No soporta tool calling, function calling ni razonamiento multi-step; es exclusivamente un modelo TTS.

## Casos de uso

- Audiolibros y narración expresiva: el modelo permite insertar `[sigh]` o `<sad>` en el texto para dar matices emocionales a la narración sin necesidad de actuar manualmente cada frase, con salida en streaming para reproducción progresiva.
- Asistentes de voz en dispositivo: al caber en 112 MB y ejecutarse a unas 20 veces el tiempo real en CPU, puede integrarse en aplicaciones móviles o de escritorio sin GPU ni conexión a la nube.
- Prototipado de interfaces conversacionales: la clonación de voz con unos segundos de referencia permite generar demos con la voz de un actor o de un usuario autorizado de forma rápida.
- Accesibilidad y lectura de textos: la salida a 24 kHz y el control de énfasis mediante emociones facilitan la lectura en voz alta de contenido con matices, útil para personas con discapacidad visual.
- Doblaje y previsualización de contenido: la clonación de voz y las etiquetas de emoción permiten generar borradores de locución para vídeos o podcasts antes de una grabación profesional.
- Contenido educativo interactivo: la inserción de sonidos como `[laugh]` o `[gasp]` ayuda a crear materiales de aprendizaje con una entonación más natural y atractiva.
- Pruebas de calidad de pipelines TTS: al ser un modelo pequeno y rápido, sirve como referencia para comparar latencia y expresividad frente a modelos mayores en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara una velocidad aproximada de 20 veces el tiempo real en cuatro hilos de CPU de un Apple M4, sin cifras de métricas objetivas como MOS, WER o similitud de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo de 27,9M parámetros ocupa muy poco (el archivo de pesos es de 112 MB), por lo que cualquier GPU con al menos 1-2 GB de memoria libre es suficiente.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) puede ejecutarlo, aunque el diseno está orientado a CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual; también en CPU.
- Opciones de despliegue: paquete propio `silencio2` (con `Silencio2TTS.from_pretrained()`), que no requiere `pocket-tts`; soporta cuantización int8 en CPU con `quantize=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 20 veces el tiempo real en cuatro hilos de CPU de un Apple M4 según el autor; no se proporcionan cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Silencio-2 | 27,9M | No disponible | Inglés | CC-BY-4.0 (pesos) / MIT (código) | Fine-tune de Pocket TTS con etiquetas de emoción y sonidos, clonación de voz y streaming |
| Pocket TTS 18M (Kyutai) | 18M | No disponible | No disponible en la información | No disponible en la información | Modelo base; Silencio-2 lo extiende con tokens de etiqueta |
| Otras alternativas TTS pequenas | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento medido.

## Limitaciones y advertencias

- La interpretación varía de una toma a otra: conviene probar varias semillas, ya que una misma etiqueta puede salir fuerte en una toma y tenue en otra.
- `<whisper>` es la etiqueta menos estable; funciona mejor en líneas cortas y varía según la voz.
- El autor recomienda revisar a oído las líneas importantes antes de usarlas en producción.
- El modelo solo soporta inglés.
- No se documentan sesgos específicos, pero al ser un TTS entrenado con datos propios, puede heredar sesgos de las voces y del dataset de entrenamiento.
- Riesgo de uso indebido para suplantación de identidad: el autor exige permiso del propietario de la voz para clonarla y prohíbe el uso para engañar; debe indicarse que el habla es sintética cuando pueda confundirse con real.
- Licencia CC-BY-4.0 para los pesos: permite uso comercial con atribución; el código de `silencio2/core` es MIT. Conviene revisar `NOTICE.md` para avisos de terceros.
- Al ser un modelo muy reciente y con cero descargas, no hay evidencia de comunidad ni de robustez en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BlueRoseLabs/Silencio-2
- Modelo base Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Cuaderno de Colab: https://colab.research.google.com/drive/1d6GSiRgXbYyBo91DCMrSr5y2LR_peJKy?usp=sharing
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs o repositorios adicionales.
