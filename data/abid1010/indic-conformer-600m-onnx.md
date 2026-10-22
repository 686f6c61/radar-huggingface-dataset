# abid1010/indic-conformer-600m-onnx

## Resumen

`abid1010/indic-conformer-600m-onnx` es una conversión a ONNX con cuantización int8 del modelo `ai4bharat/indic-conformer-600m-multilingual` de AI4Bharat, un sistema de reconocimiento automático del habla (ASR) de tipo Conformer con cabeza CTC para 22 lenguas de la India. El paquete incluye únicamente la cabeza CTC (no el decodificador por atención ni la variante RNNT), lo que reduce el tamaño a 629 MB y permite decodificación greedy offline sin dependencias de NeMo ni de PyTorch.

La relevancia práctica del artefacto es de ingeniería: empaqueta el encoder y el decodificador en dos ficheros ONNX (`encoder.int8.onnx`, 622,4 MB; `ctc_decoder.int8.onnx`, 5,5 MB) junto con el vocabulario, las máscaras de idioma (`language_masks.json`) y la configuración del front-end mel, de modo que puede ejecutarse con ONNX Runtime en Android o en PC. La model card documenta que el front-end NeMo mel (80 bandas, ventana de 25 ms, salto de 10 ms, n_fft 512, preénfasis 0,97, normalización `per_feature`) se validó contra el `preprocessor.ts` de AI4Bharat con resultado coincidente.

No se han publicado en la información disponible datos de benchmarks, tasas de error (WER/CER), latencias ni detalles sobre el corpus de entrenamiento del modelo base. La licencia es MIT, heredada del modelo original, y la conversión cita explícitamente el commit upstream `2a77d305038dfc502fd9464e7d028b90381976cb`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder convolucional + transformer) con cabeza CTC; exportado a ONNX |
| Parámetros totales | 600 M (nominal, según el nombre del modelo base) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio); frame del encoder = 80 ms; features mel con ventana de 25 ms y salto de 10 ms |
| Tipos de cuantización | int8 dinámica (pesos QInt8 con ONNX Runtime); activaciones en coma flotante |
| Idiomas soportados | 22: as, bn, brx, doi, gu, hi, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | MIT |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `ctc_decoder.int8.onnx`) + `vocab.json`, `language_masks.json`, `pack.json`, `MANIFEST.json` |

Otros datos técnicos relevantes:

| Parámetro | Valor |
|---|---|
| Vocabulario de salida | 5633 logits por frame; blank = logit global 5632 |
| Decodificación | CTC greedy sobre los logits enmascarados por idioma |
| Tamaño del paquete | 629 MB (repo 0,7 GB) |
| Runtime | onnxruntime |
| Plataformas objetivo | Android y PC (CPU; GPU opcional) |
| Integridad | `MANIFEST.json` con sha256 por fichero y commit upstream exacto |

## Arquitectura y entrenamiento

El modelo base es un Conformer: un encoder que combina bloques de autoatención con convoluciones depthwise, adecuado para capturar dependencias locales y globales en la señal de voz. Sobre la salida del encoder se aplica una cabeza CTC que emite una distribución de 5633 clases por frame, con un token blank global (índice 5632). En esta conversión se ha eliminado todo lo que no sea la ruta encoder + CTC, de modo que el grafo ONNX resultante es estrictamente acústico: no hay decodificador autorregresivo, ni modelo de lenguaje externo, ni reranking.

La cuantización aplicada es int8 dinámica: los pesos se almacenan como QInt8 y las activaciones permanecen en coma flotante, calculándose los rangos en tiempo de ejecución. El front-end es el preprocesador mel de NeMo (80 bandas, n_fft 512, preénfasis 0,97, `log(x + 2^-24)` y normalización `per_feature`), replicado en `pack.json` y verificado contra la implementación TypeScript de AI4Bharat. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones de decodificación (decodificación especulativa, atención lineal, etc.) del modelo original en la documentación proporcionada.

## Capacidades

- Reconocimiento automático del habla offline en 22 lenguas indias, incluidas asamés, bengalí, bodo, dogri, guyaratí, hindi, kannada, konkani, cachemir, maithili, malayalam, manipuri, maratí, nepalí, oriya, panyabí, sánscrito, santali, sindhi, tamil, telugu y urdu.
- Decodificación CTC greedy con máscara de idioma explícita: el usuario selecciona la lengua y el modelo restringe los logits a ese subconjunto del vocabulario (fichero `language_masks.json`).
- Alineación temporal implícita a nivel de frame (80 ms), derivada de la naturaleza CTC de la salida.
- Inferencia en dispositivo sin conexión, sin dependencia de PyTorch, NeMo ni servicios en la nube.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada más allá de la transcripción ni generación de texto libre.
- No se documenta detección automática de idioma (LID) ni puntuación/mayúsculas en la salida.
- No se documenta salida con marcas de tiempo a nivel de palabra en esta conversión.

## Casos de uso

- Subtitulado offline en aplicaciones móviles: el pack de 629 MB cabe en el almacenamiento de un dispositivo Android de gama media; con ONNX Runtime se puede transcribir audio grabado sin enviar datos a la nube, lo que resulta adecuado para entornos con conectividad limitada.
- Transcripción de reuniones y entrevistas en hindi, tamil o telugu: el modelo procesa audio pregrabado en lotes locales y evita costes por minuto de API, con la salvedad de que la decodificación greedy no incorpora puntuación.
- Digitalización de archivos orales y patrimonio lingüístico: al cubrir lenguas de bajos recursos como santali, bodo, manipuri, konkani o maithili, sirve para proyectos de documentación que necesitan una primera transcripción automática sobre la que trabajar manualmente.
- Accesibilidad en tiempo real en quioscos o dispositivos empotrados: al ejecutarse en CPU con ONNX Runtime y frames de 80 ms, puede integrarse en paneles interactivos que muestren texto de lo que se habla, con la latencia concreta pendiente de medir en el hardware objetivo.
- Preprocesado para pipelines de traducción o análisis: la transcripción CTC actúa como etapa previa a un sistema de traducción o de extracción de entidades, seleccionando el idioma de entrada mediante las máscaras incluidas.
- Aplicaciones de campo sin infraestructura: atención sanitaria, agrícola o administrativa en zonas rurales donde se requiere reconocimiento de voz local en una lengua india concreta y no hay GPU disponible.
- Evaluación y ajuste de front-ends: al incluir `pack.json` con los parámetros mel verificados contra `preprocessor.ts`, es útil como referencia para validar implementaciones propias de extracción de features antes de desplegar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER ni CER por idioma, comparaciones con otros sistemas, latencias medidas ni throughput. El único control de calidad documentado es la verificación del front-end mel contra la implementación de AI4Bharat (`MATCH`), que valida la extracción de features, no la precisión de la transcripción.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el encoder int8 ocupa 622,4 MB y el decodificador 5,5 MB; con buffers de activaciones y del front-end mel, una estimación razonable es 1,0–1,5 GB de memoria en CPU y 1,5–2,0 GB de VRAM en GPU (estimación propia a partir del tamaño de los ficheros, no medida).
- GPU recomendadas: no se especifican. Al ser un modelo de 600 M en int8, cualquier GPU con 2 GB o más de memoria es suficiente en la práctica; GPU de datacenter (A100, H100) solo tendrían sentido para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con 2 GB o más de VRAM, y también en CPU de portátil.
- Despliegue: ONNX Runtime (CPU, CUDA, CoreML, NNAPI o XNNPACK) y cualquier stack que consuma ONNX; no se distribuye GGUF ni plantillas de Ollama, llama.cpp, vLLM o TGI, que no son aplicables a un encoder ASR de este tipo.
- Latencia y throughput: no disponibles. No se han publicado medidas de RTF (real-time factor) ni de tokens por segundo en ningún dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abid1010/indic-conformer-600m-onnx` (esta ficha) | 600 M | 22 lenguas indias | ONNX int8 | MIT | HuggingFace, 0 descargas, 0 likes |
| `ai4bharat/indic-conformer-600m-multilingual` (base) | 600 M | 22 lenguas indias | PyTorch/NeMo | MIT | HuggingFace (AI4Bharat); incluye cabezas adicionales además de CTC |
| Whisper large-v3 (OpenAI) | 1550 M | ~99 idiomas | PyTorch, ONNX, GGUF, etc. | Apache-2.0 | Amplia disponibilidad, ecosistema maduro |
| Whisper small (OpenAI) | ~244 M | ~99 idiomas | PyTorch, ONNX, GGUF | Apache-2.0 | Amplia disponibilidad |

Notas de comparación: frente al modelo base de AI4Bharat, esta versión sacrifica las cabezas adicionales y el decodificador para ganar portabilidad y tamaño (629 MB). Frente a Whisper, cubre muchas menos lenguas y carece de puntuación nativa, pero está especializado en lenguas indias de bajos recursos que Whisper cubre con menor cobertura. No se dispone de datos de WER que permitan comparar precisión entre estas opciones.

## Limitaciones y advertencias

- Solo se incluye la cabeza CTC con decodificación greedy: no hay modelo de lenguaje, rescoring ni beam search, lo que suele traducirse en peor precisión que la variante completa del modelo base; no se ha cuantificado la degradación.
- El idioma debe seleccionarse manualmente mediante `language_masks.json`; no se documenta detección automática de idioma, por lo que una máscara incorrecta degrada la transcripción.
- No cubre inglés ni lenguas no indias: fuera de las 22 lenguas listadas la salida será inutilizable.
- Ausencia de puntuación, mayúsculas y, presumiblemente, de normalización de números; no confirmado en la documentación.
- La cuantización int8 dinámica puede introducir pérdida de precisión respecto al modelo en coma flotante; no se han publicado métricas comparativas.
- Riesgo de alucinación en el sentido de CTC: sobre silencios, ruido o música el decodificador greedy puede emitir secuencias repetitivas o texto espurio; conviene aplicar detección de actividad de voz previa.
- Sesgos: no documentados. El rendimiento probablemente varíe según dialecto, género, edad y calidad del micrófono, al depender del corpus del modelo base, cuya composición no se detalla aquí.
- Licencia MIT: permite uso comercial y modificación, pero se debe citar a AI4Bharat (IndicConformer / IndicVoices) según indica la model card, y conservar el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes y fue creado en octubre de 2026: no hay evidencia de uso en producción ni de mantenimiento continuado. Verificar los sha256 de `MANIFEST.json` antes de desplegar.
- La model card advierte que el pack se generó con `tools/indic-conformer/build.ps1` de una aplicación de ASR y traducción; conviene revisar ese pipeline si se necesita reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abid1010/indic-conformer-600m-onnx
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Organización AI4Bharat en HuggingFace: https://huggingface.co/ai4bharat
- Sitio de AI4Bharat (IIT Madras): https://ai4bharat.iitm.ac.in
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes (papers, blogs, repos o demos) sobre este modelo; los resultados devueltos por la búsqueda corresponden a contenido no relacionado y se han descartado.
