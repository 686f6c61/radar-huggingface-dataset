# rahimjonkomiljonov/ovoz-whisper-medium-uz-ct2

## Resumen

Ovoz Whisper Medium Uzbek CT2 es la conversión a CTranslate2 del modelo `rahimjonkomiljonov/ovoz-whisper-medium-uz`, un Whisper medium afinado para reconocimiento de voz en uzbeko escrito en alfabeto latino. Lo publica el mismo autor del modelo original, rahimjonkomiljonov, y su propósito es ofrecer una versión optimizada para inferencia con faster-whisper, reduciendo el coste computacional y el espacio en disco respecto a los pesos originales en formato Transformers. El repositorio contiene dos conjuntos de pesos: float16 (unos 1,5 GB) para GPU e int8 (unos 0,7 GB) para CPU o GPU de gama baja.

La arquitectura subyacente es la de Whisper medium de OpenAI, un transformer encoder-decoder con unos 769 millones de parámetros y una ventana de audio de 30 segundos por segmento. La conversión no altera la arquitectura ni los pesos más allá de la cuantización, por lo que las capacidades, sesgos y limitaciones del modelo original se mantienen íntegramente. La licencia es Apache-2.0, lo que facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en que cubre un idioma con poca representación en los modelos ASR generalistas y lo hace en un formato listo para producción con faster-whisper, que es el estándar de facto para despliegues de Whisper de bajo coste. El autor publica además métricas de WER y de factor de tiempo real medidas sobre este mismo export, lo que permite evaluar el compromiso entre precisión y velocidad antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium de OpenAI), convertido a CTranslate2 |
| Parametros totales | aproximadamente 769 millones (heredados de Whisper medium) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (característica de Whisper) |
| Tipos de cuantizacion | float16 (raiz del repo) e int8 (carpeta `int8/`) |
| Idiomas soportados | uzbeko (alfabeto latino); se recomienda forzar `language="uz"` |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un Whisper medium estándar: un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI sobre audio y transcripciones multilingües. El autor lo afinó para uzbeko en alfabeto latino y después lo convirtió a CTranslate2 con `ct2-transformers-converter`, usando cuantización float16 e int8 sin otros cambios. La model card indica que los detalles de datos de entrenamiento, número de tokens, composición del dataset y posibles etapas de RLHF o DPO están descritos en la model card del modelo principal (`rahimjonkomiljonov/ovoz-whisper-medium-uz`), que esta ficha no reproduce; no se dispone de esos datos en la información proporcionada.

La innovación técnica relevante no está en la arquitectura sino en el empaquetado: la conversión a CTranslate2 permite ejecutar el modelo con faster-whisper, con soporte de VAD, decodificación greedy o por beam search, y un rendimiento notablemente superior al de la implementación original de Transformers. El autor documenta que la salida es texto en minúsculas, sin puntuación ni marcas de tiempo, y que se evaluó con clips de hasta 30 segundos, faster-whisper 1.2.1 y ctranslate2 4.9.0.

## Capacidades

- Reconocimiento de voz (ASR) en uzbeko escrito en alfabeto latino, con salida en minúsculas y sin puntuación.
- Transcripción de clips de hasta 30 segundos por segmento, con posibilidad de encadenar segmentos para audio más largo.
- Filtrado de voz (VAD) opcional mediante `vad_filter=True`, que evita transcribir silencios y ruido.
- Ejecución en GPU con pesos float16 o int8, y en CPU con pesos int8.
- No incluye marcas de tiempo por defecto (`without_timestamps=True` en el ejemplo del autor).
- No se documentan capacidades de traducción, diarización de hablantes, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente ASR.
- Capacidad multilingüe limitada al uzbeko en la práctica: el autor recomienda forzar `language="uz"`.

## Casos de uso

- Transcripción de reuniones y entrevistas en uzbeko: el modelo procesa segmentos de hasta 30 segundos y puede encadenarse sobre audio largo; con `vad_filter=True` evita generar texto en pausas y silencios, lo que reduce ruido en la transcripción final.
- Subtitulado automático de vídeo en uzbeko: aunque el ejemplo del autor desactiva las marcas de tiempo, Whisper medium conserva la capacidad de generarlas si se habilita, lo que permite alinear subtítulos con el audio en plataformas de contenido.
- Atención al cliente por voz: integrado en un pipeline de telefonía o VoIP, transcribe las llamadas en uzbeko para alimentar un sistema de análisis de sentimiento o de resumen posterior; el factor de tiempo real de 0,056 en GPU permite procesar llamadas en tiempo real con holgura.
- Archivado y búsqueda de audio histórico: conversión de archivos de audio institucionales (radio, archivos públicos) a texto indexable; los pesos int8 permiten ejecutar el proceso en servidores sin GPU a un RTF de 0,62 en CPU de cuatro hilos.
- Investigación lingüística y creación de corpus: generación de transcripciones para estudios del uzbeko hablado, con la advertencia de que la salida carece de puntuación y mayúsculas, por lo que requiere un postprocesado.
- Despliegue en dispositivos de gama baja: la carpeta `int8/` (unos 0,7 GB) permite ejecutar el modelo en CPU o en GPU con poca VRAM, lo que facilita prototipos y aplicaciones de escritorio sin infraestructura dedicada.
- Evaluación comparativa de ASR para lenguas de bajos recursos: sirve como referencia frente a otros modelos afinados para uzbeko, dado que el autor publica WER en Common Voice y FLEURS.

## Benchmarks y rendimiento

Datos medidos por el autor sobre este export, con decodificación greedy, sin VAD y sobre una RTX 4060 Ti salvo donde se indica. WER en porcentaje; la columna "Hugging Face" corresponde al modelo fusionado original sobre los mismos clips.

| Formato | Donde se ejecuta | WER Common Voice (CT2 / HF) | WER FLEURS (CT2 / HF) | Factor de tiempo real, mediana (5% más lento) |
|---|---|---|---|---|
| float16 | GPU, 2.429 + 861 clips | 18,3 / 18,2 | 27,2 / 27,1 | 0,056 (0,077) |
| int8 (como int8_float16) | GPU, todos los clips | 18,4 / 18,2 | 27,6 / 27,1 | 0,061 (0,086) |
| int8 | CPU (Ryzen 5 7500F, 4 hilos), 100 clips por conjunto | 21,9 / 22,6 | 25,9 / 25,1 | 0,62 (1,05) |

El autor señala que las diferencias de WER entre CT2 y el modelo original están en el rango de 0,1 a 0,5 puntos y que los intervalos se solapan, por lo que la pérdida de int8 no queda establecida. Las filas de CPU usan 100 clips aleatorios por conjunto, con intervalos de aproximadamente más o menos 4 puntos, y son solo una comprobación de sanidad. Las transcripciones no son idénticas a las del modelo original: coinciden exactamente en el 88% de los clips de Common Voice y el 65% de FLEURS en float16 (73% y 39% en int8). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 1,5 GB para los pesos float16 y alrededor de 0,7 GB para int8, más el overhead de activaciones y del runtime de CTranslate2.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para float16; el autor valida con una RTX 4060 Ti. Para cargas concurrentes o mayor throughput, se recomienda A100 o H100, aunque no se han publicado mediciones en esas GPU.
- Cabe en GPU de consumo: sí, en RTX 4060 Ti y modelos similares con 4 GB o más de VRAM; también en GPUs integradas o de gama baja usando int8.
- Despliegue: faster-whisper con CTranslate2 (versiones probadas: faster-whisper 1.2.1, ctranslate2 4.9.0, `av` 15.1.0). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no son runtimes compatibles con CTranslate2.
- Latencia y throughput: factor de tiempo real mediano de 0,056 en GPU float16 (0,077 en el percentil 95 más lento) y 0,62 en CPU int8 con cuatro hilos (1,05 en el percentil 95 más lento), medidos en una sola máquina.
- Nota de compatibilidad: en Windows, CTranslate2 en GPU requiere las librerías CUDA que acompañan a PyTorch en el directorio `lib` dentro del PATH de búsqueda de DLL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | WER uzbeko (referencia) |
|---|---|---|---|---|---|---|
| ovoz-whisper-medium-uz-ct2 | ~769 M | 30 s por segmento | uzbeko | Apache-2.0 | CTranslate2 | 18,3 (CV) / 27,2 (FLEURS) en float16 |
| openai/whisper-medium | ~769 M | 30 s por segmento | multilingüe (99 idiomas) | Apache-2.0 | Transformers, safetensors | no disponible en la información proporcionada |
| ovoz-whisper-medium-uz (modelo original) | ~769 M | 30 s por segmento | uzbeko | Apache-2.0 | Transformers (fusionado) | 18,2 (CV) / 27,1 (FLEURS) |
| whisper-large-v3 | ~1.550 M | 30 s por segmento | multilingüe | Apache-2.0 | Transformers, safetensors | no disponible en la información proporcionada |

La comparación directa más fiable es con el modelo original del que deriva: el export CT2 mantiene un WER prácticamente idéntico y añade velocidad y menor huella de memoria. Frente a Whisper medium de OpenAI sin afinar, la diferencia esperable está en el rendimiento en uzbeko, pero no se dispone de cifras de ese modelo en la información proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- La salida es texto en minúsculas, sin puntuación ni marcas de tiempo por defecto; requiere postprocesado para muchos usos finales.
- Sin VAD, el modelo genera texto para silencios y ruido, igual que el original; el autor lo comprobó con 120 clips sintéticos sin habla y recomienda `vad_filter=True`.
- Las transcripciones no son idénticas a las del modelo original: coinciden exactamente en el 88% de los clips de Common Voice y el 65% de FLEURS en float16, y en el 73% y 39% en int8. Diferencias numéricas pequeñas en decodificación greedy.
- La evaluación se limita a clips de hasta 30 segundos; el comportamiento en audio más largo depende del encadenamiento de segmentos y no está medido en la información disponible.
- El modelo está afinado exclusivamente para uzbeko en alfabeto latino; no se debe esperar buen rendimiento en otros idiomas ni en uzbeko escrito en cirílico.
- Los sesgos del modelo original (demográficos, de acento, de dominio) se heredan sin cambios; el autor remite a la model card principal para su descripción.
- Riesgo de alucinación en pasajes ambiguos o con ruido, típico de Whisper; el VAD mitiga parte del problema pero no lo elimina.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de OpenAI y de los datasets empleados en el afinado, que esta ficha no detalla.
- Compatibilidad frágil: `av` 19.0.2 rompe faster-whisper 1.2.1 según el autor; se recomienda fijar `av` 15.1.0.
- En Windows, la ejecución en GPU requiere configurar correctamente las DLL de CUDA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahimjonkomiljonov/ovoz-whisper-medium-uz-ct2
- Modelo original (Transformers): https://huggingface.co/rahimjonkomiljonov/ovoz-whisper-medium-uz
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-medium
- Repositorio de código fuente: https://github.com/rahimjonkomiljonov/ovoz
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
