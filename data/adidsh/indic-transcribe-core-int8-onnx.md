# adidsh/indic-transcribe-core-int8-onnx

## Resumen

Indic Transcribe Core INT8 ONNX es un paquete de reconocimiento automático del habla (ASR) derivado y cuantizado del modelo bodhan-ai/indic-transcribe-core, publicado por el contribuidor comunitario adidsh. Se distribuye exclusivamente en formato ONNX con pesos cuantizados a INT8 y está diseñado para transcripción 100 % local en dispositivos móviles (Android), sin conexión a red y con salida en escritura nativa de cada idioma índico (devanagari, odia, tamil, etc.). El problema que resuelve es doble: reducir el peso del checkpoint original de 4,55 GB a 1,45 GB (un 68,1 % menos) y ofrecer un contrato de consumo determinista para aplicaciones Android que necesitan privacidad y funcionamiento offline.

La arquitectura subyacente es Canary FastConformer: un codificador FastConformer de 32 capas (1,04 GB en ONNX) y un decodificador Transformer autorregresivo de 24 capas (427,5 MB), heredado de nvidia/canary-1b-v2 y adaptado por Bodhan AI a 25 lenguas índicas. El vocabulario empaquetado para decodificación móvil tiene 7.152 piezas. La relevancia actual del modelo está en su orientación edge: cubre lenguas de bajos recursos como bhojpuri y bhili, y despliega un esquema W8A8 con activaciones dinámicas y pesos estáticos que preserva en FP32 las rutas sensibles (convoluciones de subsampling, LayerNorm, RoPE y sumas residuales).

Se trata de un artefacto con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 16 de septiembre de 2026, por lo que no cuenta con validación independiente de la comunidad. Su licencia es "other" (Indic Open Model License v1.0 sobre una arquitectura base CC-BY-4.0), con requisitos de atribución a Bodhan AI y NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Canary FastConformer (codificador FastConformer de 32 capas + decodificador Transformer autorregresivo de 24 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR seq2seq; la entrada la determina la duración del audio) |
| Tipos de cuantizacion | INT8 W8A8: pesos estáticos INT8 + activaciones dinámicas (`DynamicQuantizeLinear`); 530 capas `nn.Linear` (289 en codificador, 241 en decodificador) convertidas a `MatMulInteger`; 1.060 tensores de pesos INT8. Rutas preservadas en FP32: bloques de convolución de subsampling, LayerNorm, Rotary Positional Embeddings y sumas residuales |
| Idiomas soportados | 25: en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, bhb |
| Licencia | other (Indic Open Model License v1.0); arquitectura base bajo CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`) + vocabulario JSON y tokenizadores SentencePiece |

## Arquitectura y entrenamiento

La ficha del autor no documenta el proceso de entrenamiento del modelo original, solo su linaje: la arquitectura base es nvidia/canary-1b-v2 (licencia CC-BY-4.0), el modelo directo upstream es bodhan-ai/indic-transcribe-core (commit `4d29eeb7a0990de4a8febf9a4d5a9c5c61134a0d`) y este repositorio es una derivación cuantizada del segundo. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos quedan como no disponibles.

La innovación técnica del artefacto es exclusivamente la cuantización y el empaquetado para edge. Se aplica cuantización dinámica en activaciones y estática en pesos (W8A8) sobre 530 proyecciones lineales, mientras que los bloques de convolución de subsampling, las capas LayerNorm, las codificaciones posicionales rotatorias y las conexiones residuales se mantienen en FP32 para limitar la degradación. El resultado son dos grafos ONNX (codificador de 1,04 GB y decodificador de 427,5 MB) que suman 1.570.095.829 bytes, frente a los 4,55 GB del checkpoint FP32 del upstream. El paquete incluye `metadata/manifest.json` y `checksums.sha256` para verificación de integridad, un vocabulario de 7.152 piezas (`bodhan_vocab.json`) y tokenizadores SentencePiece multilingüe y de tokens especiales.

## Capacidades

- Transcripción de voz a texto en 25 lenguas índicas y en inglés, con salida en escritura nativa (no transliterada).
- Reconocimiento orientado a documentación formal: noticias, contenido legal, material educativo y archivos de audio con dicción cuidada.
- Ejecución 100 % on-device mediante ONNX Runtime en CPU, sin llamadas a servicios externos ni conexión de red.
- Integración con aplicaciones Android a través de un contrato determinista de descarga, verificación y almacenamiento (`CanaryAedEngine.kt`, `minimum_app_version_code: 295`).
- Verificación criptográfica de los pesos descargados mediante SHA-256 contra `manifest.json`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, diálogo, visión ni audio más allá de la propia transcripción.
- No se documenta detección de idioma automática ni traducción: el prompt de idioma debe proporcionarse según la configuración del tokenizador.

## Casos de uso

- Transcripción de noticias y boletines radiofónicos: el modelo está validado sobre una muestra de noticias en odia de 118,7 segundos y mantiene la salida en escritura nativa, lo que encaja con la generación de archivos de texto para redacciones o hemerotecas.
- Documentación legal y administrativa: al preservar la grafía nativa en lugar de transliterar, resulta adecuado para actas, declaraciones y expedientes en lenguas como hindi, tamil, bengala o maratí, donde la fidelidad ortográfica es un requisito.
- Aplicaciones Android de transcripción offline: el paquete está diseñado para descargarse dentro de la app (requiere más de 2,0 GB libres), verificarse por SHA-256 e instanciarse en sesiones ONNX Runtime CPU en la ruta `/files/models/bodhan_core_int8/`.
- Accesibilidad educativa: generación de apuntes y subtítulos para material docente en lenguas de bajos recursos como bhojpuri, bhili, santali o maithili, que cuentan con pocas alternativas ASR.
- Entornos con requisitos de privacidad o sin conectividad: hospitales, administraciones públicas o trabajo de campo donde enviar audio a la nube no es viable; el modelo no realiza ninguna salida de red.
- Archivado y digitalización de fondos sonoros: procesamiento por lotes de grabaciones históricas o institucionales en 16 kHz para convertirlas en texto buscable, con verificación de integridad de los pesos antes de cada despliegue.
- Asistencia a la transcripción en atención al ciudadano o servicios sociales en regiones con lenguas cooficiales índicas, siempre que el flujo sea mono-turno de dictado y no conversación.

## Benchmarks y rendimiento

El autor publica únicamente una validación de deriva de cuantización (drift) frente a la exportación FP32 del modelo Core, sobre una muestra de habla en odia a 16 kHz. No es un benchmark WER contra transcripción humana de referencia, tal y como advierte explícitamente la model card.

| Muestra | Duracion | Precision | Tiempo de inferencia (CPU) | Palabras | Deriva WER vs FP32 | Deriva CER vs FP32 |
|---|---|---|---|---|---|---|
| `7PM.wav` (noticias naturales) | 118,7 s | FP32 baseline | 128,0 s | 258 | baseline | baseline |
| `7PM.wav` (noticias naturales) | 118,7 s | INT8 cuantizado | 506,3 s | 258 | 0,00 % (258/258) | 0,00 % |
| `7PMvo.wav` (voz aislada) | 118,7 s | FP32 baseline | 476,0 s | 259 | baseline | baseline |
| `7PMvo.wav` (voz aislada) | 118,7 s | INT8 cuantizado | 507,9 s | 259 | 0,00 % (bit a bit) | 0,00 % |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni resultados WER/CER contra referencia humana.

## Requisitos de hardware

- Espacio en disco: el repositorio ocupa 1,6 GB; el contrato de la app Android exige más de 2,0 GB libres y el modelo cuantizado suma 1,45 GB (1,04 GB el codificador + 427,5 MB el decodificador).
- VRAM estimada para inferencia: no disponible; el artefacto está pensado para sesiones ONNX Runtime en CPU, no se documentan requisitos de GPU.
- GPU recomendadas: no disponible. El destino declarado es edge/móvil (Android) con ejecución en CPU.
- Cabe en GPU de consumo: no se documenta soporte GPU; el empaquetado se orienta a CPU y dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (CPU) con los grafos `encoder.onnx` y `decoder.onnx`; integración Android mediante `CanaryAedEngine.kt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje, sino un sistema ASR seq2seq).
- Latencia y throughput documentados (CPU): RTF aproximado de 1,08 en la muestra de noticias FP32 (128,0 s para 118,7 s de audio) y de 4,27 en INT8 (506,3 s para 118,7 s de audio); en la muestra de voz aislada, 4,01 en FP32 (476,0 s) y 4,28 en INT8 (507,9 s). Estos valores proceden de una única máquina no especificada y no deben extrapolarse.

## Comparativa con modelos similares

| Modelo | Formato y precision | Tamano | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| adidsh/indic-transcribe-core-int8-onnx (este) | ONNX INT8 W8A8 | 1,45 GB (repo 1,6 GB) | 25 (índicas + inglés) | Indic Open Model License v1.0 | 0 descargas, 0 likes |
| bodhan-ai/indic-transcribe-core (upstream) | safetensors FP32 | 4,55 GB | 25 (índicas + inglés) | Indic Open Model License v1.0 | no disponible en la informacion proporcionada |
| nvidia/canary-1b-v2 (arquitectura base) | no disponible | no disponible | no disponible | CC-BY-4.0 | no disponible en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento (WER, CER, latencia) frente a alternativas de terceros, ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- La validación publicada mide únicamente la deriva entre la exportación INT8 y el FP32 del propio modelo; no es una evaluación WER contra transcripción humana. Un 0,00 % de deriva no implica ausencia de errores de transcripción.
- La cuantización INT8 resultó notablemente más lenta que FP32 en la medición de CPU sobre la muestra de noticias: 506,3 s frente a 128,0 s. Antes de desplegar en producción conviene medir el rendimiento en el dispositivo objetivo, ya que el ahorro de tamaño no se tradujo en velocidad en ese caso.
- Está optimizado para escritura nativa; no se documenta transliteración, romanización ni salida en alfabeto latino para las lenguas índicas.
- El artefacto es una derivación comunitaria con 0 descargas y 0 likes: no ha sido auditado ni replicado de forma independiente.
- No se documentan el comportamiento ante ruido de fondo, acentos regionales, code-switching, solapamiento de hablantes ni audio que no sea de 16 kHz.
- Rendimiento desigual esperable entre las 23 lenguas oficiales listadas y las dos variedades de bajos recursos (bhojpuri y bhili); no se publican métricas por idioma.
- La licencia es "other" (Indic Open Model License v1.0) sobre una arquitectura base CC-BY-4.0: es imprescindible revisar los términos de uso comercial en el archivo LICENSE del repositorio y conservar la atribución a Bodhan AI y NVIDIA recogida en `NOTICE.md`.
- Restricciones operativas del contrato Android: requiere `minimum_app_version_code: 295`, más de 2,0 GB de disco libre e instalación en la ruta interna `/files/models/bodhan_core_int8/`.
- No hay información sobre deriva o degradación en sesiones de audio largas más allá de la muestra de 118,7 segundos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adidsh/indic-transcribe-core-int8-onnx
- Modelo upstream (Bodhan AI): https://huggingface.co/bodhan-ai/indic-transcribe-core
- Arquitectura base (NVIDIA): https://huggingface.co/nvidia/canary-1b-v2
- Licencia de la arquitectura base (CC-BY-4.0): https://creativecommons.org/licenses/by/4.0/
- Licencia del modelo: archivo LICENSE del repositorio (Indic Open Model License v1.0) y resumen en `LICENSE_DEED.md`
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) sobre este modelo.
