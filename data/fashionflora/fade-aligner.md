# FashionFlora/fade-aligner

## Resumen

Fade Aligner es un modelo de alineamiento forzado a nivel de fonema desarrollado por FashionFlora. Toma un audio y su transcripcion y devuelve, para cada fonema, un tiempo de inicio y de fin, junto con las fronteras de palabra. El modelo es relevante porque resuelve una tarea instrumental en pipelines de sintesis de voz, anotacion de corpus y evaluacion de sistemas TTS: obtener etiquetas temporales precisas sin trabajo manual.

La arquitectura es una red TDNN-BLSTM entrenada con CTC sobre espectrogramas mel de 100 bins, con decodificacion posterior mediante Viterbi HMM. El modelo se construye sobre el aligner de Stylish-TTS, que a su vez parte de StyleTTS 2, e incorpora decodificacion con label priors segun Huang et al. (ICASSP 2024). La transcripcion se fonemiza con espeak-ng, lo que en teoria permite cubrir cualquier idioma soportado por espeak-ng, aunque el modelo publicado declara unicamente ingles.

El repositorio tiene un tamano de 0.0 GB y cero descargas en el momento de la consulta, lo que sugiere que es un modelo recien publicado o de caracter experimental. Su licencia MIT y su formato de salida (JSON por clip y Praat TextGrid con capas de fonemas y palabras) lo hacen directamente util para flujos de trabajo linguisticos y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDNN-BLSTM con CTC sobre espectrogramas mel de 100 bins; decodificacion Viterbi HMM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de 1 a 20 s por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles); el diseno admite cualquier idioma con fonemizacion espeak-ng |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch); salidas en JSON y Praat TextGrid |

## Arquitectura y entrenamiento

El modelo es un alineador acustico TDNN-BLSTM que consume espectrogramas mel de 100 bins y produce posteriores por frame, entrenado con CTC. La fonemizacion se realiza con espeak-ng y la decodificacion final se hace con un Viterbi HMM sin blank, monotono, con longitud minima de telefono, pausas opcionales en fronteras de palabra y division de posteriores por priors de clase (`--hmm-prior-scale`).

El entrenamiento sigue una receta de tres pasos: primero CTC con label priors (35 epocas por defecto) para entrenar las posteriores por frame; despues rondas de entrenamiento Viterbi que realinean el conjunto de entrenamiento con el propio modelo y lo reentrenan con entropia cruzada a nivel de frame sobre esas alineaciones (2 rondas de 5 epocas con lr 3e-4 en la configuracion de demostracion); y finalmente decodificacion HMM. Los datos de entrenamiento corresponden al dataset `mythicinfinity/libritts_r` (LibriTTS-R), en ingles. Los espectrogramas mel se calculan en GPU a partir de un almacen FLAC compacto en `audio.parquet`, sin ficheros mel en disco, y el Viterbi de decodificacion y de las rondas de entrenamiento tambien se ejecuta en GPU.

## Capacidades

- Alineamiento forzado a nivel de fonema: devuelve inicio y fin de cada fonema a partir de audio y transcripcion.
- Generacion de fronteras de palabra: la capa `words` del TextGrid agrupa los tokens entre silencios.
- Fonemizacion mediante espeak-ng, con tabla de simbolos foneticos compartida que permite cubrir varios idiomas en un mismo modelo.
- Salida estructurada: JSON por clip con tokens `[simbolo, inicio_s, fin_s]` y exportacion a Praat TextGrid con capas `phones` y `words`.
- Resolucion temporal de 10 ms por frame, con padding de 4 frames por lado que el export resta.
- Marca de silencio/espacio (`_`) y marcadores de frontera de ancho cero (`<b>`); puntuacion y marcas de acento ocupan cero frames.
- Procesamiento por lotes (`--batch-size` configurable) y calculo de mels en GPU.
- Soporte de multiples formatos de entrada en la preparacion de datos: `folder`, `libritts` y `mls`.

## Casos de uso

- Anotacion de corpus de voz: alinear automaticamente grabaciones con su transcripcion para generar etiquetas de fonemas y palabras en TextGrid, listas para Praat o para entrenamiento de modelos acusticos.
- Evaluacion de sistemas TTS: comparar las duraciones de fonema generadas por un sintetizador con las de una referencia alineada, para medir desviaciones de ritmo y prosodia.
- Construccion de datasets para modelos de duracion: extraer duraciones de fonema reales de un corpus para entrenar predictores de duracion en pipelines TTS.
- Investigacion fonetica: obtener fronteras temporales precisas para analisis de duracion vocalica, consonantica o de pausas en estudios linguisticos.
- Doblaje y sincronizacion: alinear un audio con su transcripcion para localizar donde empieza y termina cada palabra y ajustar subtitulos o doblaje.
- Preprocesado de pipelines de reconocimiento y sintesis: generar alineaciones forzadas como paso intermedio en la construccion de sistemas de voz, aprovechando el soporte de GPU y el procesamiento por lotes.
- Alineamiento de clips propios: el script `tools/align_folder.py` permite alinear una carpeta de `name.wav` + `name.txt` con un modelo existente en un solo comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es descrito como "small TDNN-BLSTM", lo que sugiere requisitos modestos, pero no se proporcionan cifras.
- GPU recomendadas: no disponible. El codigo usa calculo de mels y Viterbi en GPU, por lo que se beneficia de una GPU CUDA, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: scripts propios de PyTorch (`stylish_aligner_train.py`, `stylish_aligner_align.py`, `tools/align_folder.py`, `tools/export_alignments.py`). Requiere Python 3.10+, `espeak-ng` instalado en el sistema y una wheel de `k2` compatible con la version de torch y CUDA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni referencias a alineadores alternativos con los que comparar parametros, contexto o licencia.

## Limitaciones y advertencias

- El modelo publicado declara unicamente ingles (`en`), aunque el diseno admita otros idiomas via espeak-ng; el soporte multilingue real no esta validado en la informacion disponible.
- Depende de la calidad de la fonemizacion de espeak-ng y de la exactitud de la transcripcion: errores en el texto degradan la alineacion.
- Los clips de entrenamiento se limitan por defecto a 1-20 s; el comportamiento con audios muy largos no esta documentado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de precision en fronteras ni de robustez ante ruido o acentos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de alineaciones incorrectas cuando el audio y el texto no coinciden.
- Sesgos conocidos: no disponibles; el entrenamiento se basa en LibriTTS-R, un corpus de audiolibros en ingles, lo que puede limitar la generalizacion a otros dominios o variedades.
- Licencia MIT, que permite uso comercial, pero se recomienda revisar las dependencias (Stylish-TTS, StyleTTS 2, k2, espeak-ng) por si imponen condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: modelo reciente o experimental, sin validacion comunitaria.
- El formato de pesos es `.pt` de PyTorch; no se ofrecen versiones GGUF ni cuantizaciones listas para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FashionFlora/fade-aligner
- Repositorio GitHub: https://github.com/FashionFlora/fade-aligner
- Pagina del proyecto: https://fashionflora.github.io/fade-aligner/
- Paper (arXiv 2406.02560): https://arxiv.org/abs/2406.02560
- Stylish-TTS: https://github.com/Stylish-TTS/Stylish-TTS
- StyleTTS 2: https://github.com/yl4579/StyleTTS2
- Dataset LibriTTS-R: https://huggingface.co/datasets/mythicinfinity/libritts_r
