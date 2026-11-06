# NiranjanYadavIN/indicconformer-sherpa-onnx

## Resumen

`indicconformer-sherpa-onnx` es un repositorio de modelos de reconocimiento automático del habla (ASR) empaquetados en formato ONNX cuantizado para inferencia en dispositivo. Lo publica el usuario NiranjanYadavIN como esfuerzo comunitario y reúne, bajo una misma estructura compatible con sherpa-onnx, exportaciones de varias familias de modelos: los IndicConformer de AI4Bharat para las 22 lenguas oficiales de la India, un fast-conformer de NVIDIA NeMo para inglés, dos fine-tunes de Whisper de Oriserve para hinglish (code-switching hindi-inglés) y dos exportaciones multilingües de OpenAI Whisper que cubren 13 lenguas del mundo.

El problema que resuelve es práctico: los checkpoints originales están pensados para inferencia en servidor con PyTorch y no son viables dentro de una aplicación móvil. Este repositorio los reconvierte a ONNX cuantizado, con tamaños de descarga que van desde unos 150 MB hasta 1 GB por modelo, de modo que puedan ejecutarse en teléfonos Android de gama baja sin conexión a internet una vez descargados. Los archivos se descargan bajo demanda en tiempo de ejecución, no se empaquetan con la aplicación.

La relevancia actual está en la cobertura lingüística: 22 lenguas indias con sus escrituras correctas (incluidas perso-árabe para cachemir y urdu, meetei mayek para manipuri y ol chiki para santali), hinglish romanizado para habla code-switched real y 13 lenguas adicionales con marcas de tiempo por token. Estos mismos archivos alimentan una aplicación Android de subtitulado en producción, según indica el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (IndicConformer, NeMo fast-conformer) y encoder-decoder transformer (Whisper) |
| Parametros totales | Variable por familia: 72,6 M (Whisper-base hinglish), 807 M (Whisper Large-V3 Turbo con decoder podado, hinglish apex); resto no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (aplicada a los exports ONNX) |
| Idiomas soportados | 22 lenguas indias (as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur), inglés, hinglish y 13 lenguas del mundo (zh, nl, fr, de, id, it, ja, ko, pl, pt, ru, es, tr) |
| Licencia | Apache 2.0 (repo); licencias de origen: MIT (AI4Bharat), CC-BY-4.0 (NVIDIA), Apache 2.0 (Oriserve), MIT/Apache 2.0 (OpenAI Whisper) |
| Formato de pesos | ONNX cuantizado, con `tokens.txt` compartido por familia |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: reempaqueta y cuantiza checkpoints existentes. La familia india usa IndicConformer de AI4Bharat, un modelo Conformer con cabeza CTC, exportado un modelo por código de lengua con un `tokens.txt` compartido. El inglés emplea `sherpa-onnx-nemo-fast-conformer-ctc-en-24500` de NVIDIA NeMo, también CTC, con cuantización int8. Los dos modelos de hinglish derivan de los fine-tunes `Whisper-Hindi2Hinglish` de Oriserve: `hi-hinglish-apex` parte de Whisper Large-V3 Turbo con decoder podado (807 M parámetros) y `hi-hinglish-swift` de Whisper-base (72,6 M). Las lenguas del mundo provienen de dos checkpoints oficiales de OpenAI Whisper, exportados una sola vez y compartidos entre idiomas, con selección de lengua en tiempo de decodificación.

La innovación técnica del empaquetado es doble: la cuantización int8 para reducir huella en disco y memoria, y la reexportación de los modelos Whisper multilingües para que devuelvan marcas de tiempo reales por token, algo que los exports originales no ofrecían. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición de los datasets ni si hubo RLHF o DPO en las etapas originales.

## Capacidades

- Reconocimiento de voz en las 22 lenguas oficiales de la India, con salida en la escritura nativa de cada una.
- Reconocimiento de inglés mediante un fast-conformer CTC.
- Reconocimiento de hinglish (hindi-inglés code-switched) con salida en texto romanizado, no en devanagari.
- Reconocimiento en 13 lenguas del mundo adicionales mediante Whisper multilingüe, con la lengua elegida en decodificación.
- Marcas de tiempo por token en los exports Whisper multilingües, útiles para subtítulos.
- Ejecución totalmente en dispositivo, sin servidor, sin clave de API y sin internet tras la descarga.
- Integración con la API Kotlin/Java de sherpa-onnx en Android y con su API Python en otras plataformas.
- Manejo de escrituras de derecha a izquierda (cachemir, urdu) y de escrituras menos comunes (meetei mayek, ol chiki), siempre que la plataforma disponga de fuentes.

## Casos de uso

- Generación de subtítulos en móvil: los modelos Whisper multilingües devuelven marcas de tiempo por token, lo que permite alinear cada segmento de texto con el audio y exportar ficheros de subtítulos sin conexión. Es el caso que el propio autor documenta en producción.
- Transcripción de audio en lenguas indias para aplicaciones de accesibilidad: un modelo IndicConformer por lengua (unos 190 MB) más el `tokens.txt` compartido permite transcribir entrevistas, notas de voz o clases en cualquiera de las 22 lenguas sin enviar audio a un servidor.
- Asistentes de voz para habla code-switched: los modelos de hinglish están pensados para conversación real en India, donde el hablante mezcla hindi e inglés a media frase, y devuelven texto romanizado listo para mostrar o procesar.
- Subtitulado multilingüe en aplicaciones de vídeo: con una sola descarga del export Whisper multilingüe se cubren 13 lenguas seleccionando el código en decodificación, lo que simplifica el empaquetado de aplicaciones que sirven a varios mercados.
- Dictado y notas de voz en Android de gama baja: los modelos pequeños (Whisper-base hinglish de 72,6 M, inglés de unos 170 MB) caben en dispositivos con recursos limitados y funcionan con la API Kotlin de sherpa-onnx.
- Procesamiento por lotes en Python sin GPU: la API Python de sherpa-onnx permite transcribir archivos en servidor o en portátil con CPU, útil para pipelines de archivado o análisis de audio.
- Herramientas de transcripción para lenguas de bajos recursos: la cobertura de santali, bodo, manipuri o konkani abre la puerta a aplicaciones de documentación lingüística y preservación.

## Benchmarks y rendimiento

Datos publicados en la model card para los modelos de hinglish (WER, menor es mejor):

| Variante | Base | Parametros | Common Voice WER | FLEURS WER | Indic-Voices WER | Tamano int8 |
|---|---|---|---|---|---|---|
| `hi-hinglish-apex` | Whisper Large-V3 Turbo (decoder podado) | 807 M | 36,0 % | 29,8 % | 47,6 % | ~1,0 GB |
| `hi-hinglish-swift` | Whisper-base | 72,6 M | 38,7 % | 35,1 % | 65,2 % | ~150 MB |

No se han publicado resultados de benchmarks para las familias IndicConformer, NeMo fast-conformer ni Whisper multilingüe en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los tamaños int8 (150 MB a 1 GB por modelo) orientan el consumo de memoria, que en inferencia en CPU es del mismo orden más overhead del runtime.
- GPU recomendadas: no se indican; el diseño está orientado a CPU y a ejecución en dispositivo.
- Cabe en GPU de consumo: sí, con holgura, dado el rango de tamaños; también en teléfonos Android de gama baja según el autor.
- Opciones de despliegue: sherpa-onnx (API Kotlin/Java en Android y API Python en otras plataformas); al ser ONNX, es compatible con runtimes ONNX en general, aunque solo se documenta sherpa-onnx.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este repo (IndicConformer + Whisper + NeMo) | 72,6 M a 807 M por modelo | No disponible | 22 indias + inglés + hinglish + 13 mundiales | Apache 2.0 (repo) | ONNX int8 |
| Whisper original (OpenAI) | 39 M a 1550 M según variante | No disponible | ~99 lenguas | MIT/Apache 2.0 | PyTorch safetensors |
| IndicConformer original (AI4Bharat) | No disponible | No disponible | 22 indias | MIT | PyTorch |
| NeMo fast-conformer (NVIDIA) | No disponible | No disponible | Inglés | CC-BY-4.0 | NeMo/PyTorch |

La ventaja diferencial de este repositorio frente a los originales es el formato ONNX int8 listo para sherpa-onnx y el tamaño reducido para móvil; la contrapartida es que no añade capacidades nuevas respecto a los checkpoints de origen y que la licencia efectiva depende de la del modelo fuente de cada carpeta.

## Limitaciones y advertencias

- No es un modelo único: es una colección de exports con licencias de origen distintas (MIT, CC-BY-4.0, Apache 2.0); conviene verificar la licencia de la carpeta concreta antes de uso comercial.
- Los modelos de hinglish devuelven texto romanizado, no devanagari; si se necesita la escritura nativa hay que postprocesar.
- Sindhi se emite en devanagari, no en perso-árabe, según el tokenizer del modelo; hay que tenerlo en cuenta al renderizar.
- Cachemir y urdu requieren tratamiento de derecha a izquierda; manipuri y santali requieren fuentes meetei mayek y ol chiki en la plataforma.
- Los WER de hinglish son altos en audio conversacional ruidoso (47,6 % en Indic-Voices para apex, 65,2 % para swift); no son adecuados para transcripción de precisión sin revisión.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos de silencio o ruido, aunque no se documenta explícitamente en la información disponible.
- No se publican benchmarks para las familias IndicConformer, NeMo ni Whisper multilingüe, lo que dificulta evaluar su calidad relativa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un esfuerzo comunitario sin validación amplia de terceros.
- La descarga bajo demanda implica gestión de almacenamiento y red en la aplicación cliente.

## Enlaces

- Hugging Face: https://huggingface.co/NiranjanYadavIN/indicconformer-sherpa-onnx
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- AI4Bharat (organización): https://huggingface.co/ai4bharat
- Oriserve (organización): https://huggingface.co/Oriserve
- Aplicación AI Subtitle Generator: https://parismitaglobalsolutions.com/apps/ai_subtitle_generator/
- Google Play de la aplicación: https://play.google.com/store/apps/details?id=com.parismitaglobalsolutions.aisubtitlegenerator
