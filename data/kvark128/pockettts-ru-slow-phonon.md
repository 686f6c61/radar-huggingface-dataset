# kvark128/PocketTTS-RU-slow-phonon

## Resumen

PocketTTS-RU-slow-phonon es un modelo de síntesis de voz (text-to-speech) en ruso publicado por el usuario kvark128 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una adaptación de formato del modelo ArtShtorm/Shtorm-PocketTTS-RU v2 slow, orientado a la lectura de libros y al clonado de voz a partir de una referencia corta. La adaptación consiste en convertir los pesos originales al formato de checkpoint que carga el motor ptts (Phonon, de Gradium), un runtime de inferencia escrito en Rust que no depende de PyTorch; según la model card, los pesos no se han modificado, solo se ha renombrado un tensor en safetensors y se han añadido config.json y tokenizer.json.

El modelo cuenta con 109.502.146 parámetros (aproximadamente 110 millones) y un repositorio de 0,8 GB, lo que lo sitúa en la categoría de modelos TTS ligeros aptos para ejecución en CPU. La variante "slow" hace referencia a un estilo de locución pausado, adecuado para narración de textos largos. Además de los pesos en safetensors, el autor distribuye versiones cuantizadas en GGUF con formatos q8 y q4k, lo que reduce los requisitos de memoria y permite su uso en entornos con recursos limitados.

Su relevancia actual radica en la combinación de un modelo TTS ruso con clonado de voz y un motor de inferencia sin PyTorch, lo que simplifica el despliegue en producción y en dispositivos modestos. La licencia CC BY 4.0 heredada del modelo original permite uso comercial con atribución, si bien el clonado de voz queda condicionado al consentimiento del titular de la voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en pocket-tts de Kyutai, según la model card) |
| Parametros totales | 109.502.146 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors sin cuantizar, GGUF q8, GGUF q4k |
| Idiomas soportados | ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card indica que deriva de ArtShtorm/Shtorm-PocketTTS-RU v2 slow, una adaptación rusa del sistema pocket-tts de Kyutai, orientada a la lectura de libros y con clonado de voz mediante una referencia corta. El autor de esta ficha no ha entrenado ni modificado los pesos: únicamente ha realizado la conversión de formato para el motor ptts (renombrado de un tensor en safetensors y adición de config.json y tokenizer.json), además de generar las versiones cuantizadas q8 y q4k en GGUF.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del corpus, el uso de RLHF o DPO, ni innovaciones técnicas concretas del modelo original. El motor ptts, por su parte, implementa la inferencia en Rust sin PyTorch, con soporte de ejecución en CPU, selección de hilos mediante `set_num_threads`, control de temperatura de muestreo y modo de streaming.

## Capacidades

- Síntesis de voz en ruso a partir de texto, con salida en WAV o en streaming.
- Clonado de voz a partir de una muestra de referencia corta (`clone_voice`), siempre que el audio de referencia sea de 16 bits y se remuestree a la frecuencia esperada por el modelo.
- Estilo de locución pausado ("slow"), pensado para narración de libros y textos largos.
- Soporte de marcas de acentuación en el texto de entrada (por ejemplo, tildes en sílabas acentuadas), como se aprecia en los ejemplos de la model card.
- Salida mono; la model card indica que el canal es siempre mono y muestra la conversión a MP3 con lameenc y el remuestreo con soxr.
- Ejecución en CPU mediante el motor ptts, con cuantización q4k para reducir memoria.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente TTS.

## Casos de uso

- Narración de audiolibros: el modelo está ajustado para lectura de libros en ruso y su variante "slow" produce una locución pausada adecuada para textos literarios largos, con la posibilidad de clonar la voz de un narrador concreto a partir de una muestra breve.
- Generación de audio para contenido editorial: artículos, boletines o documentación en ruso pueden convertirse a voz con el motor ptts en un pipeline de publicación, usando la cuantización q8 para equilibrar calidad y memoria.
- Asistentes de voz en ruso: integración en aplicaciones de lectura de pantalla o asistentes conversacionales que necesiten sintetizar respuestas en ruso con baja latencia y ejecución en CPU.
- Prototipado y demos de clonado de voz: el flujo `clone_voice` con una referencia de 16 bits permite experimentar con voces personalizadas en entornos de desarrollo, respetando el consentimiento del titular de la voz.
- Despliegue en dispositivos con recursos limitados: la versión q4k en GGUF y la ejecución en CPU con ptts permiten usar el modelo en servidores sin GPU o en equipos de gama baja, con streaming de audio hacia MP3.
- Localización de contenido audiovisual: doblaje o sustitución de pistas de voz en ruso en materiales educativos o corporativos, generando audio en streaming y codificándolo a MP3 en el mismo proceso.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en aplicaciones de habla rusa, con la ventaja de un motor ligero que no requiere PyTorch ni GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 109,5 millones de parámetros, los pesos en safetensors ocupan del orden de 0,4 GB en precisión de 32 bits, y las versiones GGUF q8 y q4k reducen esa cifra de forma aproximada a la mitad y a una cuarta parte, respectivamente.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ptts (`device="cpu"` en los ejemplos de la model card).
- Compatibilidad con GPU de consumo: no documentada; al ser un modelo de ~110 millones de parámetros, cabría esperar que quepa en cualquier GPU de consumo, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: motor ptts (`pip install ptts`), con soporte de carga desde Hugging Face (`hf://kvark128/PocketTTS-RU-slow-phonon`), ejecución en CPU, selección de hilos con `set_num_threads`, streaming con `tts.stream` y cuantización `q4k`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles; la model card sugiere ajustar experimentalmente el número de hilos (`ptts.set_num_threads(2)` como ejemplo) y el parámetro `temperature` (0,3 en el ejemplo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PocketTTS-RU-slow-phonon (este) | 109.502.146 | no disponible | ruso | CC BY 4.0 | safetensors, GGUF (q8, q4k) | Adaptación de formato para el motor ptts; clonado de voz; ejecución en CPU |
| ArtShtorm/Shtorm-PocketTTS-RU (v2 slow) | no disponible | no disponible | ruso | no disponible en la información | no disponible | Modelo original del que deriva; ajustado a lectura de libros y clonado de voz |
| pocket-tts (Kyutai) | no disponible | no disponible | no disponible | no disponible | no disponible | Sistema base en el que se inspira la familia; la model card lo cita como referencia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ruso; no se documentan otros idiomas.
- No hay información sobre sesgos del modelo, pero al ser un TTS entrenado sobre un corpus no especificado, puede reproducir sesgos de pronunciación o estilo presentes en los datos originales.
- Riesgo de alucinación acústica: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas, entonación extraña o artefactos en textos con nombres propios, siglas o vocabulario fuera de dominio; la model card no documenta evaluaciones de calidad.
- El clonado de voz debe realizarse únicamente con el consentimiento del titular de la voz, según indica expresamente la model card.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero se hereda del modelo original; conviene verificar las condiciones del modelo base ArtShtorm/Shtorm-PocketTTS-RU antes de un despliegue comercial.
- El modelo depende del motor ptts para su carga; no se documenta compatibilidad con otros runtimes (vLLM, llama.cpp, Ollama, TGI).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (28 de noviembre de 2026), por lo que no hay evidencia de uso en producción ni validación comunitaria.
- No se dispone de información sobre longitud máxima de texto de entrada, latencia ni calidad objetiva (MOS u otras métricas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kvark128/PocketTTS-RU-slow-phonon
- Modelo base: https://huggingface.co/ArtShtorm/Shtorm-PocketTTS-RU
- Motor ptts (Gradium): https://github.com/gradium-ai/xn-ptts
