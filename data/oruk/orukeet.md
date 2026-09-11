# oruk/orukeet

## Resumen

Orukeet es un reconocedor de voz multilingüe de 25 idiomas desarrollado por Oruk AI (con colaboración de Stanford University, University of Cambridge, OpenWhispr y Hoid) a partir de nvidia/parakeet-tdt-0.6b-v3. El modelo conserva la arquitectura del original: un codificador FastConformer de 24 capas con transductor token-and-duration (TDT) y 627.008.134 parámetros heredados. La innovación principal consiste en sustituir la mitad de los filtros depthwise temporales del codificador por 12.288 kernels de Gabor ajustados y congelados, de modo que solo 626.897.542 escalares permanecen entrenables.

El modelo resuelve transcripción de voz multilingüe y multiacento, con mejoras reportadas frente a Parakeet en 61 de 74 particiones evaluadas, incluida LibriSpeech test-clean (1,46 % frente a 1,53 % de WER), test-other (2,86 % frente a 3,14 %) y FLEURS en inglés (3,82 % frente a 4,28 %). En las 25 lenguas de FLEURS el WER agrupado baja a 9,85 % frente a 11,01 %, una reducción relativa del 10,6 %.

Es relevante porque demuestra que una parametrización inductiva (filtros de Gabor ajustados sobre la señal temporal) puede mejorar un modelo ASR ya entrenado sin aumentar el número de parámetros ni cambiar el tokenizador, y porque distribuye los mismos pesos en formatos NeMo, ONNX INT8, Q8 nativo y F16 nativo derivados del mismo checkpoint de la versión r3, lo que facilita el despliegue tanto en GPU como en entornos CPU con sherpa-onnx.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer de 24 capas con transductor token-and-duration (TDT); la mitad de los filtros depthwise temporales (12.288 de 24.576) sustituidos por funciones de Gabor ajustadas y congeladas |
| Parámetros totales | 637.329.158 según safetensors; 627.008.134 heredados de Parakeet TDT 0.6B v3 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Parámetros entrenables | 626.897.542 escalares; 110.592 taps seleccionados permanecen fijos |
| Longitud de contexto | no disponible; es un modelo ASR, no expone ventana de contexto de tokens |
| Tipos de cuantización | ONNX INT8, exportación nativa Q8, exportación nativa F16; evaluación con pesos FP32 y autocast BF16 en CUDA |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | NeMo (.nemo), ONNX, GGUF, sherpa-onnx y pesos en safetensors |
| Librería | nemo (nemo_toolkit[asr]==3.0.0) |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 (finetune) |
| Tamaño del repositorio | 5,5 GB |
| Descargas / likes en HuggingFace | 2.444 descargas / 9 likes |
| Fechas | creado el 09-09-2026, actualizado el 11-09-2026 |

## Arquitectura y entrenamiento

El modelo mantiene el codificador FastConformer de 24 capas, el transductor token-and-duration y el tokenizador de Parakeet. Cada bloque del codificador contiene 1.024 filtros depthwise temporales de nueve taps. La modificación consiste en ajustar una función de Gabor —g(t) = A·exp[−(t−μ)²/(2σ²)]·cos(2πf(t−μ)+φ), con t de −4 a 4— a cada uno de los 24.576 filtros y seleccionar globalmente los 12.288 con menor error cuadrático normalizado. La selección resultante asigna entre 175 y 748 kernels por capa, con un error RMS relativo mediano del 6,32 % y un corte en el percentil 13,30 %. Los 110.592 taps seleccionados quedan congelados; las exportaciones nativas materializan esos taps como pesos de convolución F16 convencionales, de forma que la inferencia no requiere código especial.

La construcción combina recuperación de Gabor mediante pérdida de transductor, emparejamiento del codificador y destilación de token y duración. A continuación se aplican 4.035 actualizaciones adicionales con tasa de aprendizaje baja para producir el checkpoint padre. La pasada final (r3) realiza 168 actualizaciones AdamW con un 3 % de warmup y decaimiento coseno de 5e-6 a 5e-7, sobre tres pasadas por 2.939 grabaciones de LibriSpeech test-other. Los objetivos de esa adaptación preservan mayúsculas y puntuación nativas y corrigen palabras de referencia, y la misma partición se usa para la selección de checkpoint. Una auditoría de exportación verifica que los 12.288 kernels ajustados permanecen exactos y que los otros 651 tensores de parámetros cambian.

## Capacidades

- Reconocimiento automático de voz multilingüe en 25 idiomas (búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, ruso, eslovaco, esloveno, español, sueco y ucraniano).
- Transcripción de audio con vocabulario y puntuación derivados de los objetivos de entrenamiento, que preservan mayúsculas y puntuación nativas del texto de referencia.
- Robustez multiacento y multidominio: mejora en 36 de 47 particiones de acentos y dominios, y en las 20 particiones de acentos y dominios en inglés.
- Decodificación greedy por lotes con transductor TDT en NeMo (FP32 con autocast BF16 en CUDA).
- Inferencia en CPU mediante exportaciones ONNX INT8, Q8 nativo y sherpa-onnx.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio comprensivo ni modo de pensamiento: es exclusivamente un modelo de transcripción de voz.
- No hay información disponible sobre transcripción en streaming o por bloques.

## Casos de uso

- Transcripción por lotes de grabaciones y medios: el modelo procesa audio con decodificación greedy por lotes en NeMo y mejora a Parakeet en 61 de 74 particiones evaluadas, por lo que es adecuado para pipelines de transcripción masiva de archivos ya existentes.
- Subtitulado y postproducción audiovisual: al preservar mayúsculas y puntuación en los objetivos de entrenamiento y bajar el WER en test-other (2,86 % frente a 3,14 %), reduce la carga de corrección manual de subtítulos.
- Atención al cliente y análisis de llamadas: con soporte para 25 idiomas europeos puede transcribir conversaciones en centros de contacto multilingües antes de pasarlas a sistemas de análisis de calidad o búsqueda.
- Dictado y aplicaciones interactivas en cliente: las exportaciones Q8 y F16, derivadas del mismo checkpoint, permiten integraciones locales con requisitos de baja latencia y sin enviar audio a servidores externos.
- Servidores y workers de transcripción en CPU: la exportación ONNX INT8 y el soporte sherpa-onnx permiten desplegar el modelo en instancias sin GPU, con un peso de pesos cuantizados en torno a 0,7 GB.
- Indexado y búsqueda de archivos de audio: transcribir grandes volúmenes de grabaciones para hacerlas buscables por texto, usando el WER bajo en inglés (1,46 % en test-clean) y el rendimiento multilingüe agrupado de FLEURS.
- Evaluación comparativa de ASR multilingüe en investigación: el repositorio publica informes técnicos, hashes de artefactos y recetas de entrenamiento, lo que permite reproducir la línea de entrenamiento y comparar particiones de acentos y dominios.
- Procesamiento de audio en dominios específicos con acento marcado: las 47 particiones de acentos y dominios evaluadas muestran una mejora agregada de 16,72 % a 15,25 % de WER, útil para adaptar transcripción a variedades dialectales del inglés y otras lenguas.

## Benchmarks y rendimiento

Evaluación con decodificación NeMo greedy-batch TDT, pesos FP32, autocast BF16 en CUDA y el mismo código de puntuación para ambos modelos. Menor es mejor.

| Comparación | Grabaciones | WER Parakeet | WER Orukeet |
|---|---:|---:|---:|
| LibriSpeech test-clean | 2.620 | 1,53 % | 1,46 % |
| LibriSpeech test-other | 2.939 | 3,14 % | 2,86 % |
| FLEURS inglés | 647 | 4,28 % | 3,82 % |
| FLEURS agrupado, 25 idiomas | 20.146 | 11,01 % | 9,85 % |
| Acentos/dominios agrupados, 47 particiones | 12.006 | 16,72 % | 15,25 % |
| Acentos/dominios en inglés, 20 particiones | 5.120 | 9,51 % | 8,84 % |

Cómputo de particiones: Orukeet mejora a Parakeet en 61 de 74 particiones evaluadas, en 25 de 27 particiones completas de LibriSpeech/FLEURS y en 36 de 47 particiones de acentos y dominios. La muestra de acentos y dominios contiene 256 grabaciones por partición y las 230 grabaciones completas de Lesbos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de reconocimiento de voz.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 637.329.158 parámetros: aproximadamente 2,5 GB en FP32, 1,3 GB en FP16/BF16 y 0,7 GB en INT8/Q8, sin contar activaciones, buffers de decodificación ni el resto del runtime.
- El repositorio completo ocupa 5,5 GB, ya que incluye varias exportaciones del mismo checkpoint r3.
- Cabe holgadamente en GPU de consumo con 6 GB o más de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090). Con cuantización INT8 o Q8 y decodificación en CPU, también es viable sin GPU.
- Entorno de referencia para NeMo: PyTorch con CUDA y nemo_toolkit[asr]==3.0.0 más huggingface-hub; el repositorio publica el fichero runtime.json con las versiones exactas del entorno de evaluación.
- Opciones de despliegue documentadas: NeMo (checkpoint .nemo), ONNX INT8, exportaciones nativas Q8 y F16 y sherpa-onnx. El tag del repositorio incluye además GGUF.
- No hay información disponible sobre soporte en vLLM, TGI, Ollama o llama.cpp para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El modelo tiene 0,6 B de parámetros y no requiere tensor parallelism ni despliegues multi-GPU según los datos disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | WER LibriSpeech test-clean | WER LibriSpeech test-other | Disponibilidad |
|---|---:|---|---|---:|---:|---|
| oruk/orukeet | 637.329.158 | 25 | cc-by-sa-4.0 | 1,46 % | 2,86 % | HuggingFace, formatos NeMo/ONNX/GGUF/sherpa-onnx, Q8 y F16 |
| nvidia/parakeet-tdt-0.6b-v3 | 627.008.134 | no disponible en la información proporcionada | no disponible en la información proporcionada | 1,53 % | 3,14 % | HuggingFace (modelo base del que deriva Orukeet) |
| Otras alternativas de ASR multilingüe de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de la fila de Parakeet proceden de la misma evaluación que reporta Orukeet, con idéntica decodificación y código de puntuación, por lo que son directamente comparables. Para el resto de alternativas no se dispone de datos verificables en la información proporcionada. En el plano de licencia, la diferencia relevante es que Orukeet se distribuye bajo CC-BY-SA-4.0 (con obligación de compartir igual), mientras que la licencia del modelo base no se especifica en los datos disponibles.

## Limitaciones y advertencias

- La selección de checkpoint de la pasada final se realiza sobre LibriSpeech test-other y esa misma partición se emplea para reportar resultados; existe riesgo de sobreajuste a esa partición y las mejoras en test-other deben interpretarse con cautela.
- La adaptación final está guiada por datos en inglés (LibriSpeech), lo que puede sesgar el comportamiento hacia el inglés aunque el modelo cubra 25 idiomas.
- La licencia cc-by-sa-4.0 es de tipo copyleft: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia. Hay que revisar la compatibilidad con productos propietarios antes de integrarlo en producción.
- El WER agrupado de FLEURS en 25 idiomas es del 9,85 %, con variación por idioma no detallada en la información disponible; el rendimiento en lenguas concretas puede ser notablemente peor.
- Como todo sistema ASR, puede producir sustituciones, inserciones y omisiones de palabras (alucinación de texto) en audio ruidoso, solapado o con dominio muy alejado del entrenamiento. No se han publicado tasas de alucinación.
- No hay información sobre manejo de audio largo, segmentación, diarización de hablantes, marcas de tiempo por palabra ni streaming.
- No tiene tool calling, capacidades de agente, visión ni comprensión de audio más allá de la transcripción; no debe usarse como sustituto de un modelo de lenguaje.
- No se documentan sesgos demográficos, de acento o de género más allá del recuento de particiones de acentos evaluadas.
- No hay datos publicados de latencia, throughput ni consumo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oruk/orukeet
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio de código: https://github.com/Oruk-AI/orukeet
- Informe técnico: orukeet-technical-report.pdf (referenciado en la model card)
- Hashes de artefactos: ARTIFACTS.json (referenciado en la model card)
- Receta de ajuste y congelación de Gabor: https://github.com/Oruk-AI/orukeet/blob/main/training/gabor_half/README.md
- Adaptación final: https://github.com/Oruk-AI/orukeet/blob/main/training/librispeech_ft/README.md
- Linaje de entrenamiento: https://github.com/Oruk-AI/orukeet/blob/main/training/README.md
- Entorno de ejecución registrado: https://github.com/Oruk-AI/orukeet/blob/main/evidence/standard-asr-20260908/runtime.json
- Pull request en OpenWhispr: https://github.com/OpenWhispr/openwhispr/pull/2085
- Sitio del desarrollador: https://oruk.ai
- Búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido sobre comparadores de seguros de automóvil en el Reino Unido), por lo que no se han incorporado a esta ficha.
