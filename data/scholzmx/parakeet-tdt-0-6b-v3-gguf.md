# scholzmx/parakeet-tdt-0.6b-v3-gguf

## Resumen

Parakeet-tdt-0.6b-v3-gguf es una colección de cuantizaciones GGUF calibradas del modelo de reconocimiento automático del habla nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario scholzmx. El modelo base, desarrollado por NVIDIA, emplea una arquitectura FastConformer con transductor TDT (Token-and-Duration Transducer) y está orientado a transcripción multilingüe en 25 idiomas europeos. Esta versión GGUF no es un modelo nuevo, sino una reempaquetadura optimizada para inferencia local y en dispositivos de recursos limitados.

La relevancia de esta ficha radica en que el autor no se limita a convertir pesos: aplica una matriz de importancia (importance matrix) recogida sobre audio real en los 25 idiomas soportados y valida cada nivel de cuantización mediante WER con intervalos de confianza bootstrap. El resultado es un conjunto de ficheros que van desde 906 MB (Q8_0) hasta 325 MB (IQ2_XXS), con evidencia medida de que los niveles iguales o superiores a Q4 son indistinguibles del modelo en f32 sobre audio limpio y con ruido a 5 dB.

Un detalle crítico es que estos GGUF siguen el contrato de tensores del motor Starling y no son compatibles con llama.cpp, whisper.cpp ni parakeet.cpp. Se ejecutan mediante el binario starling-serve o la librería libstarling_ggml. El modelo base cuenta con 627.090.582 parámetros y licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + transductor TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.090.582 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M, Q2_K, Q4_0 (q4pw), IQ2_XXS |
| Idiomas soportados | en, de, fr, es, it, nl, pl, pt, ru, uk, sv, da, fi, cs, sk, sl, hr, bg, el, hu, ro, et, lv, lt, mt (25 idiomas europeos) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (contrato de tensores Starling; no compatible con llama.cpp/whisper.cpp) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer con cabecera transductora TDT, una variante que predice conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación frente a un transductor convencional. El modelo original fue entrenado por NVIDIA; esta publicación no aporta detalles sobre el corpus de entrenamiento, el número de tokens ni si hubo etapas de ajuste fino supervisado o preferencias. Esa información debe consultarse en la model card de nvidia/parakeet-tdt-0.6b-v3.

La innovación de esta versión GGUF reside en el pipeline de cuantización. El autor convierte los pesos a F32 y aplica cuantización por bloques al estilo llama.cpp, pero ponderando las escalas de bloque con una matriz de importancia recogida sobre el split de entrenamiento de FLEURS (48 clips por idioma, 24 de los 25 idiomas; el shard de esloveno no estaba disponible). La calibración se valida con WER e intervalos bootstrap. Entre los hallazgos medidos: las estadísticas de la matriz saturan con aproximadamente una docena de clips por idioma (cinco veces más audio cambió la matriz menos del 1 % y el WER nada), y la mezcla lingüística de calibración no es un factor medible para inglés y alemán una vez existe matriz. Lo que sí importa es calibrar frente a no calibrar: un Q2_K uniforme degrada a 30 % de WER en inglés y 17 % en alemán, mientras que el build calibrado iguala a f32. Los lineales de 640 filas del joint y del LSTM se mantienen automáticamente en Q8_0 en todos los niveles.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos: inglés, alemán, francés, español, italiano, neerlandés, polaco, portugués, ruso, ucraniano, sueco, danés, finés, checo, eslovaco, esloveno, croata, búlgaro, griego, húngaro, rumano, estonio, letón, lituano y maltés.
- Transcripción de audio con predicción conjunta de tokens y duraciones mediante el transductor TDT.
- Inferencia en CPU y GPU mediante el motor Starling, con un motor Vulkan rápido para dispositivos móviles.
- Compatibilidad de carga con GGUF de la comunidad en los dialectos cstr/parakeet.cpp y transcribe.cpp a través de la capa de compatibilidad del loader de Starling.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni razonamiento multi-paso; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en entornos multilingües: el modelo cubre 25 idiomas europeos y el fichero Q4_K_M de 704 MB mantiene la calidad de f32, lo que permite desplegarlo en servidores modestos para transcribir audio de equipos distribuidos.
- Subtitulado automático de vídeo en producción: los niveles Q4 y superiores son indistinguibles de f32 en audio limpio y con ruido a 5 dB, de modo que se puede generar pistas de subtítulos sin pérdida medible de precisión.
- Dictado y transcripción en aplicaciones móviles: el fichero q4pw de 364 MB está pensado para teléfonos; en un Pixel 10 Pro con motor Vulkan registra 2,06 s para un clip de 22 s y 6,91 s para uno de 74 s, con un RSS pico de 778 MB y aproximadamente un 15 % menos de energía por transcripción que el q4_k_m-shrink16.
- Procesamiento por lotes de archivos de audio en pipelines de datos: el nivel Q2_K de 574 MB ofrece cobertura multilingüe uniforme (WER medio de 25 idiomas de 16,9 frente a 14,0 en f32) para tareas donde el coste de almacenamiento y memoria prima sobre la precisión máxima.
- Transcripción en inglés con restricciones extremas de espacio: el fichero IQ2_XXS de 325 MB está indicado para despliegues English-first; su WER en inglés es de 8,39 % frente a 6,50 % en f32, mientras que la degradación se concentra en idiomas como lituano, letón, esloveno, maltés, húngaro y eslovaco.
- Investigación en cuantización de modelos ASR: el repositorio incluye la receta de cuantización (parakeet-q4pw-fullimx.recipe) y la matriz de importancia (parakeet-full.imx), lo que permite reproducir los resultados y estudiar el efecto de la calibración sobre el WER.
- Integración en herramientas de accesibilidad: la transcripción en tiempo real de audio en directo para personas con discapacidad auditiva puede ejecutarse localmente con los ficheros Q4, sin depender de servicios en la nube.

## Benchmarks y rendimiento

Resultados de WER sobre el split de test de FLEURS (media [IC bootstrap del 95 %]):

| Build | Tamaño | Alemán | Inglés |
|---|---|---|---|
| f32 | 2508 MB | 5,30 [4,48–6,14] | 6,50 [5,57–7,36] |
| q4_k_m | 704 MB | 5,31 [4,49–6,16] | 6,41 [5,55–7,24] |
| q2_k | 574 MB | 6,03 [5,19–6,91] | 6,36 [5,51–7,24] |
| iq2_xxs + shrink16 | 325 MB | 9,38 [8,30–10,44] | 8,39 [7,34–9,36] |

WER medio en los 25 idiomas (48 clips por idioma): f32 14,0; q2_k 16,9; iq2_xxs 26,4. La brecha del IQ2_XXS se concentra en lituano, letón, esloveno, maltés, húngaro y eslovaco.

Comparativa del fichero para teléfono frente a f32 y q4_k_m-shrink16:

| Métrica | F32 | q4_k_m-shrink16 | q4pw |
|---|---|---|---|
| Tamaño | 2357 MB | 553 MB | 364 MB |
| WER FLEURS en100 | 5,61 % | 5,42 % | 5,33 % (Δ pareado vs F32 −0,31 [−0,80, +0,13]) |
| WER FLEURS de100 | 4,68 % | 4,72 % | 4,46 % (−0,20 [−0,60, +0,19]) |

Rendimiento en Pixel 10 Pro con motor Vulkan rápido, frente a q4_k_m-shrink16: carga 1,88 s frente a 2,30 s; clip de 22 s en 2,06 s frente a 2,26 s; clip de 74 s en 6,91 s frente a 7,69 s; RSS pico de 778 MB frente a 1180 MB; aproximadamente un 15 % menos de energía por transcripción; transcripciones idénticas en los ficheros de prueba.

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde 325 MB (IQ2_XXS) hasta 906 MB (Q8_0) para los pesos; el RSS pico medido en móvil con el fichero q4pw es de 778 MB, y con q4_k_m-shrink16 de 1180 MB.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el autor documenta ejecución en un Pixel 10 Pro mediante el motor Vulkan rápido de Starling.
- Cabe en GPU de consumo: sí, dado el tamaño reducido de todos los ficheros (el mayor, Q8_0, ocupa 906 MB); no se detallan requisitos de VRAM por GPU concreta.
- Opciones de despliegue: binario starling-serve o librería libstarling_ggml del repositorio de Starling. No es compatible con llama.cpp, whisper.cpp ni parakeet.cpp. El motor Starling sí puede cargar GGUF de parakeet de la comunidad en los dialectos cstr/parakeet.cpp y transcribe.cpp.
- Latencia y throughput: en Pixel 10 Pro con Vulkan, 2,06 s para un clip de 22 s y 6,91 s para uno de 74 s con el fichero q4pw. No se publican cifras de throughput para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| scholzmx/parakeet-tdt-0.6b-v3-gguf | 627.090.582 | 25 europeos | cc-by-4.0 | GGUF (Starling) | Cuantizaciones calibradas con imatrix; WER validado por nivel |
| nvidia/parakeet-tdt-0.6b-v3 | 627.090.582 | 25 europeos | cc-by-4.0 | safetensors (formato original) | Modelo base; referencia de calidad f32 con WER 14,0 medio en 25 idiomas |
| Whisper (variantes de OpenAI) | no disponible | multilingüe amplio | licencia permisiva (según variante) | múltiples | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos directos con otras alternativas ASR en la información proporcionada; la única comparación medida es interna, entre los distintos niveles de cuantización y el modelo f32.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros no funcionan en llama.cpp, whisper.cpp ni parakeet.cpp; requieren el motor Starling. Un usuario que espere un GGUF convencional no podrá cargarlos.
- El fichero IQ2_XXS degrada notablemente la precisión en idiomas con pocos recursos del conjunto (lituano, letón, esloveno, maltés, húngaro, eslovaco); solo es adecuado para despliegues English-first.
- El fichero Q2_K reduce la cobertura multilingüe uniforme: WER medio de 16,9 frente a 14,0 en f32.
- La calibración se realizó con 24 de los 25 idiomas (falta el shard de esloveno); el autor argumenta que la insensibilidad medida a la mezcla lingüística lo hace irrelevante, pero es una limitación documentada.
- Riesgo de alucinación: no se documenta para este modelo; en ASR, los errores se manifiestan como sustituciones, omisiones e inserciones de texto, no como contenido inventado de forma deliberada.
- Sesgos: no se documentan sesgos específicos de acento, género o dominio en la información proporcionada.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor del modelo base y respetar los términos de la licencia.
- Las cifras de latencia y consumo energético proceden de un único dispositivo (Pixel 10 Pro) y no deben extrapolarse sin validación.
- No se documentan capacidades de diarización, puntuación o marcas de tiempo; deben verificarse en la model card del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scholzmx/parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio del motor Starling: https://github.com/sims1253/starling
- Documentación del pipeline de cuantización: docs/quantization.md en el repositorio de Starling
