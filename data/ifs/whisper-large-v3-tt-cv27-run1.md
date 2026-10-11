# ifs/whisper-large-v3-tt-cv27-run1

## Resumen

Whisper-large-v3-tt-cv27-run1 es un ajuste fino completo de openai/whisper-large-v3 para reconocimiento automático de voz (ASR) en tártar (código de idioma `tt`), publicado por el desarrollador Ilnar Salimzianov bajo el identificador `ifs`. El modelo escribe tártar en alfabeto cirílico, respetando mayúsculas y puntuación, y se distribuye con licencia MIT. Está entrenado exclusivamente sobre la parte validada de Common Voice Scripted Speech 27.0 Tatar (CC0).

La particularidad de esta ejecución (run 1) es metodológica: se mantuvo intacto el split de test oficial de Common Voice 27.0 tt, por lo que el modelo nunca vio esos datos durante el entrenamiento. El propio autor lo posiciona como la variante adecuada para comparaciones reproducibles sobre ese split oficial, y recomienda su otro modelo (`ifs/whisper-large-v3-tt-cv27-run2`, entrenado con 165 hablantes en lugar de 9) para transcripción en producción.

Con 1.543.490.560 parámetros (aproximadamente 1,55 mil millones, la arquitectura estándar de Whisper large-v3) y un repositorio de 6,2 GB en pesos float32, el modelo reduce el error de un Whisper large-v3 sin ajustar de un 33,0 % de CER a un 5,5 % de CER sobre el split de test oficial, una mejora de más de 27 puntos absolutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), heredada del modelo base |
| Parametros totales | 1.543.490.560 (1,55 B aproximadamente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento, con 128 bins mel; el decodificador hereda del base un contexto de 448 tokens |
| Tipos de cuantizacion | Pesos publicados en float32; el autor indica que float16 funciona bien para inferencia. No se publican versiones GGUF, int8 ni int4 en el repositorio |
| Idiomas soportados | Tártar (`tt`), con salida en cirílico |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder que procesa espectrogramas mel de 128 bandas en ventanas de 30 segundos y genera texto de forma autorregresiva. No hay modificaciones estructurales respecto al modelo base; se trata de un ajuste fino completo (full fine-tuning) de todos los pesos, no de un adaptador.

El entrenamiento sigue la receta BuzzASR, con los siguientes hiperparámetros: learning rate de 6,48e-6 para el decodificador y 0,3 veces ese valor para el encoder; scheduler coseno con 150 pasos de calentamiento; weight decay de 4e-5; tamaño de lote efectivo de 32 (4 clips por 8 pasos de acumulación de gradiente); precisión mixta bf16 con los pesos cargados en float32; evaluación sobre CER de dev con early stopping de paciencia 3; semilla 42. Se ejecutó sobre una NVIDIA A100 de 80 GB en RunPod, con PyTorch 2.8.0 y Transformers 5.18.0.

Los datos proceden íntegramente del bucket validado de Common Voice Scripted Speech 27.0 Tatar: 19.605 clips de 9 hablantes para entrenamiento, 628 clips de 2 hablantes para dev y los 4.983 clips de 258 hablantes del split de test oficial, que quedó reservado. Un único hablante aporta el 58 % de los clips de entrenamiento. Las etiquetas conservan el uso original de mayúsculas y puntuación, lo que explica que exista una métrica de CER "raw" diferenciada de la normalizada. Las particiones exactas están en la carpeta `splits/` del repositorio.

## Capacidades

- Transcripción de voz a texto en tártar con salida en alfabeto cirílico, incluyendo mayúsculas y puntuación.
- Reconocimiento sobre habla leída (read speech), que es el dominio de los datos de Common Voice.
- Generación de marcas de tiempo por segmento mediante `return_timestamps=True`, necesario para audios de más de 30 segundos. El autor advierte de que la precisión de estas marcas no ha sido evaluada.
- Control de idioma y tarea en la generación (`language="tatar"`, `task="transcribe"`).
- Ajuste de decodificación para evitar repeticiones: el autor recomienda `num_beams=1`, `no_repeat_ngram_size=3` y `repetition_penalty=1.2`.
- Compatible con el pipeline `automatic-speech-recognition` de Transformers y con la etiqueta `endpoints_compatible` de Hugging Face.
- No se documentan capacidades de traducción de voz, diarización de hablantes, detección de eventos sonoros ni procesamiento de lenguaje escrito.

## Casos de uso

- Comparación reproducible en el split oficial de Common Voice 27.0 tt: al no haber visto nunca esos datos, es el modelo indicado para publicar cifras de CER y WER comparables con otros sistemas tártar en ese benchmark, sin riesgo de contaminación por test.
- Transcripción de corpus de habla leída en tártar: digitalización de grabaciones de lectura, audiolibros o corpus lingüísticos, donde el dominio coincide con los datos de entrenamiento y el CER normalizado se sitúa en el 5,5 %.
- Preservación lingüística y archivística: conversión de archivos de audio históricos o institucionales en tártar a texto buscable, con licencia MIT y datos de entrenamiento CC0, lo que simplifica la parte de derechos.
- Generación de subtítulos para vídeo en tártar: el pipeline permite obtener texto con marcas de tiempo en un solo paso, aunque la precisión temporal no esté validada por el autor y deba verificarse manualmente.
- Creación de datos supervisados para otros sistemas: las transcripciones sirven como etiquetas para entrenar modelos de texto a voz tártar, modelos de lenguaje en tártar o sistemas de alineación forzada.
- Indexación y búsqueda sobre archivos de audio: transcripción masiva de un repositorio de audio para habilitar búsqueda por texto completo en tártar.
- Punto de partida para nuevos ajustes finos: al ser un fine-tune completo de Whisper large-v3 sobre tártar con licencia MIT, puede servir como inicialización para dominios relacionados o para vocabularios con préstamos del ruso.
- Despliegue en entornos con GPU modesta: con 1,55 B de parámetros y pesos en float16 (alrededor de 3,1 GB), cabe en tarjetas de consumo para transcripción por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por Hugging Face). Las métricas CER y WER normalizadas se calculan tras pasar a minúsculas y eliminar puntuación; el CER raw compara la salida tal cual se produce, con mayúsculas y puntuación.

| Conjunto de test | Clips | Hablantes | CER normalizado | WER normalizado | CER raw |
|---|---|---|---|---|---|
| Split de test oficial de Common Voice 27.0 tt | 4.983 | 258 | 5,5 % | 23,6 % | 7,0 % |
| Test set de run 2 | 1.122 | 80 | 5,2 % | 22,8 % | 6,7 % |

El autor indica como referencia que Whisper large-v3 sin ajustar obtiene un 33,0 % de CER sobre el split de test oficial. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en float32: 6,2 GB, que es el tamaño exacto del repositorio. En float16 los pesos ocupan aproximadamente 3,1 GB, la mitad, tal como señala el autor.
- VRAM estimada para inferencia: en torno a 5-7 GB en float16 con `num_beams=1`, sumando pesos y activaciones. En float32 conviene disponer de 8-10 GB.
- Cabe en GPU de consumo: sí. Tarjetas como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 ejecutan el modelo sin problemas en float16. También es posible en GPUs de 8 GB con float16 y lotes pequeños.
- Inferencia en CPU: el autor indica explícitamente el uso de `torch.float32` sobre CPU, por lo que es viable aunque notablemente más lenta.
- Hardware de entrenamiento de referencia: una NVIDIA A100 de 80 GB en RunPod, según la model card. Ese dato corresponde al ajuste fino, no a la inferencia.
- Opciones de despliegue: pipeline de Transformers (ejemplo oficial en la model card), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), y otras rutas habituales para Whisper como faster-whisper sobre CTranslate2 o whisper.cpp, aunque el autor no las documenta para este modelo concreto.
- Latencia y throughput: no disponible. No se publican medidas de velocidad ni de consumo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (split oficial CV 27.0 tt) | Licencia | Notas |
|---|---|---|---|---|---|
| ifs/whisper-large-v3-tt-cv27-run1 | 1,55 B | Ventana de 30 s; 448 tokens de decodificador | 5,5 % normalizado | MIT | Nunca vio el split oficial de test; pensado para comparaciones sobre él |
| ifs/whisper-large-v3-tt-cv27-run2 | 1,55 B (misma receta y modelo base) | Igual | No disponible en esta información | MIT | Entrenado con 165 hablantes en lugar de 9; el autor lo recomienda para transcripción y afirma que comete un 16 % menos de errores |
| openai/whisper-large-v3 (sin ajustar) | 1,55 B | Ventana de 30 s; 448 tokens de decodificador | 33,0 % normalizado (dato aportado por el autor) | MIT (según el modelo base, tal como indica la model card) | Multilingüe generalista, sin especialización en tártar |

El autor menciona en su write-up una comparación contra otros modelos ASR de tártar ya existentes, pero no se incluyen sus nombres ni sus cifras en la información disponible.

## Limitaciones y advertencias

- Entrenado con solo 9 hablantes, y uno de ellos aporta el 58 % de los clips de entrenamiento. Es un sesgo de hablante muy marcado que puede degradar el rendimiento con voces distintas de las del conjunto de entrenamiento.
- Evaluado únicamente sobre habla leída. El autor advierte de que la precisión sobre habla espontánea (vídeos de YouTube, pódcast) no está probada y probablemente sea inferior.
- El cambio de código a ruso (code-switching) no ha sido evaluado, algo relevante en un contexto bilingüe tártar-ruso.
- La precisión de las marcas de tiempo no ha sido evaluada, pese a que el propio autor recomienda `return_timestamps=True` para audios largos.
- El WER normalizado del 23,6 % es notablemente más alto que el CER del 5,5 %, lo que indica que acierta caracteres pero falla palabras completas con frecuencia: conviene revisar la salida antes de usarla en producción sin supervisión.
- Riesgo de alucinación y de bucles de repetición, inherente a los modelos Whisper; de ahí las recomendaciones de decodificación (`no_repeat_ngram_size=3`, `repetition_penalty=1.2`) que el autor incluye en el ejemplo de uso.
- El modelo es monolingüe en la práctica: está especializado en tártar, aunque herede pesos multilingües del base.
- Licencia MIT, sin restricciones para uso comercial, y datos de entrenamiento CC0. Aun así, conviene verificar las condiciones de la licencia del modelo base y de cualquier conjunto de datos adicional que se use en producción.
- Para transcripción real, el autor recomienda usar run 2 en lugar de este modelo; run 1 debería reservarse para evaluaciones sobre el split oficial de test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ifs/whisper-large-v3-tt-cv27-run1
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Run 2, recomendado por el autor para transcripción: https://huggingface.co/ifs/whisper-large-v3-tt-cv27-run2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ifs/tatar-asr
- Write-up con la comparativa frente a otros modelos ASR de tártar: https://ifs.name/post/tatar-asr/
- Apéndice A del write-up (receta de ajuste fino): https://ifs.name/post/tatar-asr/#appendix-a
- Apéndice D del write-up (entorno de software): https://ifs.name/post/tatar-asr/#appendix-d
- Conjunto de datos Common Voice Scripted Speech 27.0 Tatar: https://mozilladatacollective.com/datasets/cmu62fysg00noo1077ljif8fv
- Receta BuzzASR (paper citado en los tags del modelo, arXiv:2609.09554): https://arxiv.org/abs/2609.09554
- Perfil del autor: https://ifs.name
