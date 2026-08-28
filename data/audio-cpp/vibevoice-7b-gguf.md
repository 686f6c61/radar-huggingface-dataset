# audio-cpp/VibeVoice-7B-GGUF

## Resumen

VibeVoice-7B es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por Microsoft, diseñado para generar audio conversacional de formato largo y multi-locutor, como podcasts, a partir de texto. La versión aquí descrita es una conversión a formato GGUF realizada por el usuario audio-cpp para su uso con el motor de inferencia audio.cpp, escrito en C++ puro. El modelo base, vibevoice/VibeVoice-7B, emplea tokenizadores de voz continuos (acústicos y semánticos) a una tasa de fotogramas ultrabaja de 7,5 Hz, lo que mejora la eficiencia computacional manteniendo la fidelidad del audio. Con 7 mil millones de parámetros (según su nombre), soporta síntesis de voz en inglés y chino, y está pensado para escenarios que requieren consistencia del hablante y transiciones naturales entre turnos.

La relevancia de esta conversión GGUF radica en que permite ejecutar el modelo en entornos locales sin dependencias pesadas, gracias a audio.cpp, que ofrece soporte para TTS, ASR y otras tareas de audio. El repositorio incluye un único archivo cuantizado en Q8_0, con un tamaño total de 10,6 GB, y una licencia MIT que facilita su uso comercial y de investigación. Aunque no se han publicado benchmarks exhaustivos, el autor reporta un factor de tiempo real (RTF) de aproximadamente 0,18 en una RTX 5090, con un pico de VRAM de 13,3 GB, lo que lo hace viable en GPUs de gama alta para consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se sabe que usa tokenizadores continuos a 7,5 Hz, pero no se detalla la arquitectura interna) |
| Parametros totales | 7B (nominal, según el nombre del modelo) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo incluido) |
| Idiomas soportados | ingles y chino |
| Licencia | MIT |
| Formato de pesos | GGUF (para audio.cpp) |

## Arquitectura y entrenamiento

La documentacion oficial de Microsoft indica que VibeVoice se basa en tokenizadores de voz continuos, tanto acusticos como semanticos, que operan a una tasa de fotogramas de 7,5 Hz. Esta innovacion reduce significativamente el coste computacional en comparacion con tokenizadores discretos de mayor frecuencia, al tiempo que preserva la calidad y expresividad del audio. No se han proporcionado detalles sobre la arquitectura interna (si es un transformer, un modelo de difusion, etc.) ni sobre el proceso de entrenamiento, como el volumen de datos o el uso de tecnicas de alineacion o RLHF. La version GGUF es una conversion directa del modelo original, realizada para integrarse con audio.cpp, que utiliza cuantizacion Q8_0 para reducir el tamano del archivo y acelerar la inferencia en hardware compatible.

## Capacidades

- Sintesis de voz de formato largo: el modelo esta disenado para generar audio continuo de varios minutos, como podcasts o narraciones extensas, sin perder coherencia ni calidad.
- Multi-locutor: puede producir voces distintas dentro de una misma salida, manteniendo la consistencia de cada hablante a lo largo del audio.
- Conversacional: es capaz de modelar turnos de habla naturales, con pausas y entonacion adecuadas para dialogos.
- Expresividad: genera audio con matices emocionales y prosodia variada, adecuado para contenido narrativo o dramatizado.
- Idiomas: soporta exclusivamente ingles y chino, segun la model card.
- Integracion con audio.cpp: al ser un archivo GGUF, se puede ejecutar directamente con el CLI o servidor de audio.cpp, asi como desde la interfaz web nativa.

## Casos de uso

- Generacion automatizada de podcasts: el modelo puede producir episodios completos con multiples voces y turnos de conversacion a partir de un guion, ideal para creadores de contenido que buscan escalar produccion sin grabar audio real.
- Audiolibros narrados: permite convertir libros en audio con diferentes voces para personajes, manteniendo la coherencia del narrador a lo largo de capitulos extensos.
- Doblaje de videos: se puede utilizar para generar pistas de audio en ingles o chino para videos, con control sobre el numero de hablantes y su estilo.
- Asistentes de voz personalizados: al ser multi-locutor, permite crear asistentes con personalidades vocales distintas para diferentes contextos o usuarios.
- Contenido educativo hablado: generacion de lecciones o tutoriales en audio con dialogos entre instructor y alumno, mejorando la experiencia de aprendizaje.
- Investigacion en TTS: sirve como modelo base para experimentos sobre tokenizacion continua, generacion de formato largo o control de hablantes, gracias a su licencia MIT y disponibilidad del codigo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o metricas de TTS tipo MOS) en la informacion disponible. El autor de la conversion GGUF reporta una comprobacion rapida en una RTX 5090 con el modo servidor de audio.cpp, cuyos valores son:

| Metrica | Valor |
|---|---|
| Factor de tiempo real (RTF) | ~0,18 |
| Longitud de salida | ~52 segundos |
| Pico de VRAM | ~13,3 GB |

Estos datos son orientativos y dependen de la implementacion y el hardware; no constituyen una evaluacion formal del modelo.

## Requisitos de hardware

- VRAM estimada: al menos 13,3 GB para la cuantizacion Q8_0, segun la prueba en RTX 5090. Para GPUs con menos memoria, se podrian usar cuantizaciones inferiores, pero no se incluyen en este repositorio.
- GPU recomendada: RTX 5090 (usada en la prueba), aunque GPUs con 16 GB o mas de VRAM (como RTX 4080, RTX 4090, A100 40GB) deberian ser capaces de ejecutar el modelo.
- Compatibilidad con consumer GPU: si, siempre que tengan suficiente VRAM (>= 14 GB) y soporte CUDA.
- Opciones de despliegue: audio.cpp (CLI o servidor), que es el motor principal. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que estas herramientas estan orientadas a modelos de lenguaje, no a TTS.
- Latencia y throughput: segun el RTF de 0,18, generar 52 segundos de audio tarda aproximadamente 9,4 segundos en la RTX 5090 (52 * 0,18). Esto implica una velocidad de generacion cercana a 5,5 veces el tiempo real.

## Comparativa con modelos similares

No se dispone de informacion suficiente en las fuentes proporcionadas para realizar una comparativa con otros modelos de TTS de caracteristicas similares (como XTTS, Bark o Tortoise). Los datos de parametros, contexto y rendimiento de estos modelos no estan disponibles en la informacion recopilada, por lo que no se puede establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Idiomas restringidos: el modelo solo soporta ingles y chino; no es util para otros idiomas sin reentrenamiento o adaptacion.
- Riesgo de alucinacion en audio: como cualquier modelo generativo, puede producir contenido no deseado, errores de pronunciacion o incoherencias semanticas, especialmente en entradas complejas o ambiguas.
- Dependencia del hardware: el rendimiento observado (RTF 0,18) se obtuvo en una RTX 5090; en GPUs menos potentes el RTF puede aumentar significativamente, afectando a la latencia en produccion.
- Falta de benchmarks formales: no hay evaluaciones publicadas de calidad de voz (MOS) ni comparaciones con otros modelos, por lo que la calidad percibida no esta validada externamente.
- Tamano del archivo: el unico archivo GGUF pesa 10,6 GB, lo que puede ser un inconveniente para despliegues con almacenamiento limitado.
- Licencia MIT: permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y la licencia en las redistribuciones. No hay restricciones adicionales conocidas.
- Soporte de audio.cpp en desarrollo: audio.cpp es un proyecto relativamente nuevo (los cambios mencionados datan de 2026), por lo que podria haber errores o falta de optimizaciones en comparacion con motores mas maduros.

## Enlaces

- Repositorio HuggingFace de la conversion GGUF: https://huggingface.co/audio-cpp/VibeVoice-7B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/vibevoice/VibeVoice-7B
- Repositorio de audio.cpp en GitHub: https://github.com/0xShug0/audio.cpp
- Repositorio oficial de VibeVoice de Microsoft: https://github.com/microsoft/VibeVoice
- Pagina de documentacion de VibeVoice: https://microsoft.github.io/VibeVoice/
