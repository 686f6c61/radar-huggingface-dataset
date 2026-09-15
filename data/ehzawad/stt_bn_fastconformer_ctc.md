# ehzawad/stt_bn_fastconformer_ctc

## Resumen

`ehzawad/stt_bn_fastconformer_ctc` es un modelo de reconocimiento automatico del habla (ASR) para bengali, publicado por el desarrollador Emrul Zawad. Se trata de un ajuste fino del checkpoint ingles `nvidia/stt_en_fastconformer_ctc_large` sobre un corpus de 1.692,4 horas de audio en bengali, con un total de 1.084.696 clips, todos ellos leidos o transcritos por personas, sin pseudo-etiquetas ni audio sintetico. El modelo emplea la arquitectura FastConformer con decodificacion CTC greedy y un vocabulario BPE de 1.024 piezas especifico para bengali, con 115,6 millones de parametros.

El problema que aborda es la transcripcion de voz en bengali, un idioma con recursos limitados en comparacion con el ingles o el espanol. Es la segunda fase de una linea de trabajo del mismo autor: sustituye a `ehzawad/stt_bn_fastconformer`, que se entreno con 984 horas y obtenia un 19,67 % de WER en el conjunto de test oficial de FLEURS. Este nuevo checkpoint baja hasta el 17,12 % de WER, una mejora de 2,56 puntos porcentuales con un intervalo de confianza del 95 % de [-3,13, -1,99].

Su relevancia radica en dos aspectos. Por un lado, es un modelo pequeno (115,6 M de parametros, 0,5 GB de repositorio) que puede ejecutarse en CPU o en cualquier GPU de consumo. Por otro lado, su model card documenta con inusitada transparencia el protocolo de evaluacion, incluida la exposicion repetida al conjunto de test (dos decodificaciones sobre FLEURS test) y el incumplimiento explicito del umbral de exito registrado frente a una alternativa basada en Qwen3-ASR-1.7B con adaptador bengali, que obtiene 16,54 % de WER con muchos mas parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CTC (encoder Conformer con subsampling 8x y cabecera CTC) |
| Parametros totales | 115,6 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa segmentos de audio, no texto) |
| Tipos de cuantizacion | no disponible (no documentados en la model card) |
| Idiomas soportados | bengali (`bn`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | `.nemo` (fichero de checkpoint de NeMo: `stt_bn_fastconformer_ctc.nemo`) |
| SHA-256 de los pesos | `bea300ce4f1f1df1fa4707562ddaa7c64db6f01121ef3d64a6333635f3626572` |
| Tokenizacion | BPE bengali de 1.024 piezas |
| Decodificacion | CTC greedy, sin modelo de lenguaje externo |
| Entrada | audio mono a 16 kHz (WAV o FLAC) |
| Salida | texto bengali normalizado, sin puntuacion |
| Libreria | NeMo (`nemo_toolkit[asr]==2.7.3`) |
| Modelo base | `nvidia/stt_en_fastconformer_ctc_large` (fine-tune) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer, la variante de NVIDIA del Conformer que reduce la longitud de la secuencia de entrada mediante una capa de subsampling de factor 8 antes de alimentar los bloques de atencion y convolucion. Sobre el encoder se coloca una cabecera CTC que produce la secuencia de tokens directamente, sin decodificador autorregresivo ni modelo de lenguaje externo durante la inferencia. El vocabulario es un BPE de 1.024 piezas entrenado especificamente para bengali. El resultado es un modelo de 115,6 M de parametros con un coste de inferencia muy contenido.

El entrenamiento parte del checkpoint preentrenado en ingles de NVIDIA y se ajusta sobre 1.692,4 horas de audio en bengali repartidas en siete fuentes: Bengali.AI Speech (726,5 h, CC-BY-4.0, usando la lista filtrada por WER menor que 15 de tugstugi), IndicVoices (574,4 h, CC-BY-4.0), OpenSLR-53 (159,0 h, CC-BY-SA-4.0), SUBAK.KO (105,8 h, CC-BY-4.0), Kathbath (81,5 h, CC-BY-4.0), Common Voice validado (39,5 h, CC0) y FLEURS `bn_in` en su split de entrenamiento (5,8 h, CC-BY-4.0). No se emplearon pseudo-etiquetas ni audio sintetico. La model card no especifica si hubo una fase de RLHF o DPO, algo en cualquier caso poco habitual en modelos ASR.

El aspecto mas destacable del trabajo es metodologico: el autor declara haber decodificado la linea de modelos sobre el test de FLEURS en dos ocasiones y publica ambos resultados, ademas de indicar que el checkpoint final corresponde al paso 116.000 de entrenamiento y que existe un resultado intermedio en el paso 88.000 (88.000 de 120.000 actualizaciones) que no se registra como resultado oficial. La evaluacion usa un scorer congelado (WER de corpus, con puntuacion normalizada) y bootstrap pareado por conglomerados de frases con 20.000 remuestreos.

## Capacidades

- Transcripcion de voz a texto en bengali a partir de audio mono de 16 kHz en formato WAV o FLAC.
- Normalizacion del texto de salida: la salida no incluye puntuacion.
- Decodificacion CTC greedy sin modelo de lenguaje, lo que simplifica el despliegue y reduce la latencia frente a esquemas con rescoring.
- Funcionamiento en CPU y en GPU gracias al reducido tamano del modelo (115,6 M de parametros).
- No dispone de capacidades de traduccion, resumen ni comprension semantica: es exclusivamente un transcriptor.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni flujos de agente.
- No incorpora modo de razonamiento (thinking mode), vision ni procesamiento de audio mas alla del ASR.
- Soporte multilingue: solo bengali. No se documenta transferencia a otros idiomas.

## Casos de uso

- Transcripcion de archivos de audio y video en bengali: el modelo convierte cualquier grabacion a 16 kHz mono (previa conversion con ffmpeg si es necesario) en texto plano normalizado, apto para subtitulado posterior o indexacion.
- Generacion de subtitulos para plataformas de contenido: al ejecutarse en GPU de consumo y con un coste de inferencia bajo, permite procesar lotes grandes de video en local sin depender de APIs externas.
- Aplicaciones de dictado y notas de voz: la ausencia de modelo de lenguaje externo y el tamano reducido permiten integraciones en escritorio o servidor con latencia contenida.
- Investigacion en ASR para idiomas de bajos recursos: el modelo sirve como linea base reproducible sobre el test oficial de FLEURS bengali, con un protocolo de evaluacion documentado y comparable con el resto de la linea del autor.
- Analitica de contact center en bengali: transcripcion masiva de llamadas para posterior analisis de texto, con la advertencia de que la falta de puntuacion obliga a un postprocesado si se necesita segmentacion de frases.
- Construccion de corpus de texto en bengali: transcripcion de archivos de audio historicos o de campo para generar texto entrenable, siempre que la licencia CC-BY-SA-4.0 del modelo y sus obligaciones de atribucion y compartir igual sean aceptables.
- Componente en pipelines de datos: integrable en flujos de preprocesamiento mediante la API `ASRModel.from_pretrained` de NeMo, con salida directa a texto.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a FLEURS bengali, split de test oficial, 920 grabaciones, con scorer congelado (WER de corpus, puntuacion normalizada) y bootstrap pareado por conglomerados de frases con 20.000 remuestreos.

| Modelo / checkpoint | Parametros | WER | CER |
|---|---:|---:|---:|
| `ehzawad/stt_bn_fastconformer_ctc`, `step_116000` (modelo liberado) | 115,6 M | 17,12 % | 5,12 % |
| `ehzawad/stt_bn_fastconformer_ctc`, `step_88000` (intermedio, no registrado) | 115,6 M | 17,54 % | 5,27 % |
| `ehzawad/stt_bn_fastconformer` (fase 1, 984 h) | no disponible | 19,67 % | 5,79 % |
| `ehzawad/stt_bn_qwen3_asr` (Qwen3-ASR-1.7B + adaptador bengali) | 1,7 B | 16,54 % | 4,68 % |

Deltas declarados por el autor: frente a la fase 1, -2,56 pp de WER con IC del 95 % [-3,13, -1,99]; frente al adaptador Qwen3, +0,58 pp con IC del 95 % [-0,23, +1,40]. El modelo no alcanza el umbral de exito registrado (por debajo de 16,54 % con el intervalo alejado de cero).

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, dado que no es un modelo de lenguaje. La model card menciona paneles adicionales de desarrollo y de unica ejecucion (holdout, Vaani, SPRING-INX), el registro de exposicion a evaluacion y las limitaciones, todos ellos en el fichero `SUPPLEMENT.md`, que no forma parte de la informacion proporcionada.

## Requisitos de hardware

- Huella de memoria de los pesos: aproximadamente 462 MB en FP32 y 231 MB en FP16 para 115,6 M de parametros. En la practica, el fichero `.nemo` ocupa parte de los 0,5 GB del repositorio.
- VRAM estimada para inferencia: por debajo de 1-2 GB en FP16, dependiendo del tamano del lote y de la longitud del audio de entrada.
- GPU recomendadas: cualquier GPU con soporte CUDA, desde una GTX 1050 Ti o una RTX 3060 hasta una RTX 4090. Una A100 o una H100 estan ampliamente sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer de los ultimos ocho anos. Tambien es viable la inferencia en CPU, aunque sin datos de latencia publicados.
- Opciones de despliegue: NeMo 2.7.3 es la ruta oficial documentada en la model card (`pip install -q 'nemo_toolkit[asr]==2.7.3'`). No se documentan en la model card otras rutas como llama.cpp, Ollama o vLLM, que en cualquier caso no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tiempo real ni de factor en tiempo real (RTF).

## Comparativa con modelos similares

| Modelo | Parametros | Datos de entrenamiento | WER FLEURS bn test | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `ehzawad/stt_bn_fastconformer_ctc` | 115,6 M | 1.692,4 h | 17,12 % | CC-BY-SA-4.0 | HuggingFace (NeMo) |
| `ehzawad/stt_bn_fastconformer` (fase 1) | no disponible | 984 h | 19,67 % | no disponible | HuggingFace |
| `ehzawad/stt_bn_qwen3_asr` (Qwen3-ASR-1.7B + adaptador) | 1,7 B | no disponible | 16,54 % | no disponible | HuggingFace |
| Otros sistemas ASR para bengali (Whisper large-v3, IndicConformer de AI4Bharat, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados de WER de otros sistemas ASR sobre el mismo conjunto de evaluacion, por lo que no es posible una comparacion directa con alternativas externas a la linea de trabajo del autor.

## Limitaciones y advertencias

- Solo soporta bengali. No se documenta ningun otro idioma, ni siquiera en modo multilingue parcial.
- La salida carece de puntuacion y mayusculas (el bengali no tiene mayusculas, pero la ausencia de puntuacion obliga a postprocesado si se necesita segmentacion de frases).
- Decodificacion CTC greedy sin modelo de lenguaje: la precision en frases ambiguas o con nombres propios poco frecuentes puede ser inferior a la de sistemas con rescoring por LM.
- El propio autor declara que no se alcanzo el umbral de exito registrado frente al adaptador de Qwen3-ASR-1.7B (16,54 % de WER). El modelo es mejor que su predecesor, pero no supera a la alternativa mas grande de la misma linea.
- Exposicion repetida al test: la linea fue decodificada dos veces sobre el test de FLEURS. El autor lo documenta de forma explicita, pero implica que las cifras publicadas deben interpretarse con cautela como estimacion de generalizacion.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible. Como todo modelo CTC sin LM, en audio muy ruidoso o con silencios largos puede emitir texto espurio, pero no hay datos que lo cuantifiquen.
- Sesgos: no se documenta ningun analisis de sesgo por acento, genero, edad o variedad dialectal del bengali. El corpus mezcla fuentes con dominios y condiciones de grabacion distintos, lo que puede producir un rendimiento desigual segun el tipo de audio.
- Limitacion de licencia: CC-BY-SA-4.0 es una licencia de compartir igual. El uso comercial es posible, pero obliga a atribucion y a distribuir las obras derivadas bajo la misma licencia. La obligacion de share-alike deriva en parte de OpenSLR-53 (CC-BY-SA-4.0). El modelo base de NVIDIA es CC-BY-4.0. Las condiciones exactas de atribucion estan en `SUPPLEMENT.md`, que no forma parte de la informacion proporcionada.
- Requisitos de entrada estrictos: audio mono a 16 kHz en WAV o FLAC; otros formatos, frecuencias de muestreo o canales requieren conversion previa.
- No hay resultados publicados de latencia, throughput ni consumo de memoria, por lo que el dimensionamiento de produccion requiere una medicion propia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ehzawad/stt_bn_fastconformer_ctc
- Modelo predecesor (fase 1): https://huggingface.co/ehzawad/stt_bn_fastconformer
- Adaptador bengali sobre Qwen3-ASR-1.7B: https://huggingface.co/ehzawad/stt_bn_qwen3_asr
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
- Bengali.AI Speech: https://www.kaggle.com/competitions/bengaliai-speech
- IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- OpenSLR-53: https://www.openslr.org/53/
- SUBAK.KO: https://huggingface.co/datasets/SUST-CSE-Speech/SUBAK.KO
- Kathbath: https://huggingface.co/datasets/ai4bharat/kathbath
- Common Voice bengali: https://commonvoice.mozilla.org/bn
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo. Corresponden a la pelicula de 1964 "633 Squadron" y no aportan informacion tecnica utilizable. No se han encontrado en la busqueda enlaces adicionales relevantes (paper, blog o repositorio) mas alla de los presentes en la model card.
