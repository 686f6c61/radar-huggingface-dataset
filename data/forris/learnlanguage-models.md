# Forris/learnlanguage-models

## Resumen

LearnLanguage models es un repositorio de artefactos de inferencia publicado por Forris para su aplicación de aprendizaje de idiomas. No se trata de un modelo de lenguaje generativo al uso, sino de un contenedor de ficheros empaquetados que la app descarga y ejecuta localmente en el teléfono. Cada fichero está anclado a un commit concreto del repositorio, de modo que la aplicación garantiza reproducibilidad y control de versiones del binario que ejecuta en el dispositivo del usuario. El único artefacto documentado en la model card es `whisper.bin`, un modelo de reconocimiento automático del habla en serbio.

Ese `whisper.bin` es una conversión a formato ggml (whisper.cpp) con cuantización q5_0 del modelo `openai/whisper-large-v3-turbo`, afinado mediante LoRA (con los pesos fusionados en el modelo final) para transcribir serbio en escritura latina, con mayúsculas y puntuación. La relevancia práctica está en el salto de calidad conseguido: el error de palabra (WER) baja del 39,8% al 9,4% en hablantes retenidos de Common Voice sr, y del 13,3% al 12,1% en el test sr_rs de FLEURS, medido con decodificación voraz en whisper.cpp.

El repositorio tiene un tamaño de 0,6 GB, no registra descargas ni likes en el momento de la consulta y su licencia es "other" con nombre "per-file", es decir, cada fichero puede tener una licencia distinta. Para el fichero whisper.bin documentado, la licencia aplicable es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para reconocimiento de voz), variante large-v3-turbo, convertida a ggml para whisper.cpp |
| Parametros totales | no disponible (el modelo base es whisper-large-v3-turbo; el autor no publica el recuento en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; el autor no especifica el valor en la model card) |
| Tipos de cuantizacion | q5_0 (formato ggml, whisper.cpp) |
| Idiomas soportados | serbio (sr), con transcripcion en escritura latina, mayusculas y puntuacion |
| Licencia | "other" con nombre "per-file"; para whisper.bin, MIT (igual que el modelo base) |
| Formato de pesos | ggml / binario whisper.cpp (fichero whisper.bin); el repositorio se etiqueta tambien como gguf |

## Arquitectura y entrenamiento

El artefacto documentado parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder de reconocimiento automático del habla, y se ha afinado con LoRA sobre el modelo base, fusionando después los adaptadores en los pesos finales. El resultado se convierte a ggml con cuantización q5_0 para su ejecución con whisper.cpp en dispositivos móviles. La model card no detalla hiperparámetros del ajuste fino, número de pasos, rangos de LoRA ni estrategia de congelación de capas.

Los datos de entrenamiento declarados son dos corpus públicos: FLEURS sr_rs (licencia CC BY 4.0, de Google) y Common Voice 27.0 sr (licencia CC0, de Mozilla). No se indica el volumen de horas, la proporción entre corpus ni si hubo aumentación de datos o limpieza adicional. La evaluación reportada usa decodificación voraz en whisper.cpp y separa hablantes retenidos en Common Voice, lo que aporta una medida de generalización razonable para el dominio de voz leída y espontánea de esos corpus.

## Capacidades

- Reconocimiento automático del habla en serbio, con salida en escritura latina.
- Generación de transcripciones con mayúsculas y puntuación, sin postprocesado externo indicado.
- Ejecución local en teléfono mediante whisper.cpp, sin dependencia de servidores externos.
- Distribución como binario versionado y anclado a commits, apto para actualizaciones controladas desde la app.
- No se documentan capacidades de traducción, diarización de hablantes, marcas temporales por palabra, tool calling ni razonamiento multi-paso.

## Casos de uso

- Subtitulado y transcripción en una app de aprendizaje de serbio: la app descarga `whisper.bin` y transcribe el audio del usuario en el dispositivo, comparando la pronunciación con el texto de referencia; el WER del 9,4% en hablantes retenidos de Common Voice sr lo hace viable para corrección de ejercicios orales.
- Dictado de vocabulario y frases: el usuario pronuncia una palabra o frase y el modelo genera la transcripción con puntuación, que la app registra como intento de práctica sin enviar audio a la nube.
- Evaluación de pronunciación en modo offline: al ejecutarse con whisper.cpp en el teléfono, funciona sin conectividad, útil en aulas o entornos con red limitada.
- Transcripción de audio de material didáctico en serbio: el modelo convierte grabaciones de lecciones o diálogos en texto para generar ejercicios de comprensión y glosarios.
- Búsqueda por voz dentro de la app: el usuario dicta una consulta en serbio y la transcripción alimenta el índice de contenidos locales.
- Prototipado de funciones de voz en aplicaciones educativas de terceros: el fichero ggml puede integrarse en pipelines whisper.cpp de escritorio o móvil para experimentar con ASR en serbio sin reentrenar.

## Benchmarks y rendimiento

| Benchmark | Metrica | Modelo afinado | Modelo base | Condiciones |
|---|---|---|---|---|
| Common Voice sr, hablantes retenidos | WER | 9,4% | 39,8% | whisper.cpp, decodificacion voraz |
| FLEURS sr_rs test | WER | 12,1% | 13,3% | whisper.cpp, decodificacion voraz |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto esta pensado para ejecucion en CPU en telefonos mediante whisper.cpp, con cuantizacion q5_0.
- GPU recomendadas: no aplica para el caso de uso declarado (movil); en escritorio, whisper.cpp puede ejecutarse en CPU y, con compilacion adecuada, en GPU consumer, aunque el autor no publica requisitos.
- Compatibilidad con GPU consumer: no disponible; el formato ggml y la cuantizacion q5_0 estan orientados a CPU y a memoria reducida.
- Opciones de despliegue: whisper.cpp (formato nativo del artefacto). No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, que no estan pensados para este tipo de modelo ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LearnLanguage models (whisper.bin, este repo) | no disponible (base large-v3-turbo) | no disponible | serbio | per-file; whisper.bin MIT | ggml q5_0 (whisper.cpp) | Afinado con LoRA para serbio; WER 9,4% en Common Voice sr |
| openai/whisper-large-v3-turbo | no disponible en la informacion proporcionada | no disponible | multilingue | MIT | safetensors y conversiones | Modelo base sin ajuste para serbio; WER 39,8% en Common Voice sr segun el autor |
| whisper-large-v3 | no disponible en la informacion proporcionada | no disponible | multilingue | MIT | safetensors y conversiones | No evaluado en la informacion proporcionada para serbio |

No se dispone de datos de otros modelos ASR especificos para serbio en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se documenta un fichero (`whisper.bin`) y un idioma (serbio); el resto de ficheros del repositorio no estan descritos en la model card.
- La licencia es "other" con nombre "per-file": es imprescindible revisar la licencia de cada fichero antes de reutilizarlo; para whisper.bin se declara MIT, pero el resto no esta documentado.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion ni validacion externa.
- Los WER reportados proceden de dos corpus concretos (Common Voice y FLEURS) con decodificacion voraz; el rendimiento en audio con ruido, acentos regionales no cubiertos o habla espontanea puede degradarse.
- No se documentan sesgos demograficos ni de acento, ni evaluaciones por subgrupos.
- Riesgo de alucinacion en pasajes de silencio o audio de baja calidad, comportamiento comun en modelos Whisper; el autor no reporta mitigaciones.
- No se especifican requisitos de memoria, latencia ni limites de duracion de audio, lo que dificulta planificar el despliegue.
- La fecha de creacion indicada en Hugging Face (2026-11-07) es posterior a la consulta, lo que conviene verificar antes de citar el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Forris/learnlanguage-models
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Common Voice (Mozilla): https://commonvoice.mozilla.org
- whisper.cpp: no se incluye enlace en la informacion proporcionada.
