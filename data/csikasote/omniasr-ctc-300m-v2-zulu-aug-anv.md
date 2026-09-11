# csikasote/omniASR-CTC-300M-v2-Zulu-AUG-ANV

## Resumen

omniASR-CTC-300M-v2-Zulu-AUG-ANV es un modelo de reconocimiento automático del habla (ASR) publicado en HuggingFace por el usuario `csikasote`. Se trata de una conversión a la clase `Wav2Vec2ForCTC` de Transformers del checkpoint fairseq2 `omniASR_CTC_300M_v2`, perteneciente al proyecto OmniLingual de Meta (facebookresearch/omnilingual-asr). El modelo emite logits CTC sobre un vocabulario SentencePiece de 10.288 tokens y esta pensado para transcripcion de audio multilingue, con el sufijo del nombre ("Zulu") apuntando a un ajuste o variante orientada al idioma zulu, aunque la model card no confirma la lista de idiomas.

Tecnicamente es un encoder Wav2Vec2 de 24 capas, tamaño oculto 1024, 16 cabezas de atencion y FFN intermedio de 4096, con 325.983.920 parametros reales verificados en los pesos safetensors (aproximadamente 326M, de ahi la denominacion "300M" del checkpoint original). El repositorio ocupa 1,3 GB, lo que es coherente con pesos en fp32.

Su relevancia es limitada pero concreta: ofrece una via directa para usar en el ecosistema Transformers un checkpoint de OmniLingual que originalmente solo existe en fairseq2, lo que reduce la friccion para investigadores que trabajan con lenguas africanas de bajos recursos. Ahora bien, la propia model card advierte de que la verificacion de paridad entre los pesos convertidos y el checkpoint original **ha fallado**, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder transformer con extractor convolucional de features), cabeza CTC |
| Parametros totales | 325.983.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; no se declara ventana de contexto ni duracion maxima de entrada) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card indica "multiple languages" sin listado; el nombre sugiere zulu) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Capas del encoder | 24 |
| Tamaño oculto | 1024 |
| Cabezas de atencion | 16 |
| FFN intermedio | 4096 |
| Tamaño de vocabulario | 10.288 (SentencePiece) |
| Framework de origen | fairseq2 (checkpoint `omniASR_CTC_300M_v2`) |
| Verificacion de paridad | fallida (mismatch reportado por el autor) |
| Frecuencia de muestreo esperada | 16.000 Hz (segun el ejemplo de uso de la model card) |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder Wav2Vec2 clasico: un extractor de caracteristicas convolucional que reduce la secuencia de audio a una representacion latente, seguido de 24 bloques transformer con tamaño oculto 1024, 16 cabezas de atencion y FFN de 4096. Sobre la salida del encoder se aplica una cabeza lineal de proyeccion a 10.288 clases y una funcion de perdida CTC, de modo que el modelo produce logits por fotograma y la transcripcion se obtiene con `argmax` seguido de decodificacion del vocabulario SentencePiece. No hay decodificador autorregresivo, lo que implica que la latencia es baja y no existe "generacion" token a token, pero tambien que no hay mecanismo de correccion contextual ni de prompting.

Respecto a los datos de entrenamiento, la model card no aporta informacion alguna: no se indica el numero de horas de audio, la composicion del corpus, si hubo etapas de ajuste fino supervisado, ni si se aplicaron tecnicas como SpecAugment, perturbacion de velocidad o mezcla de ruido. El sufijo "AUG" del nombre sugiere algun tipo de aumento de datos y "ANV" no se explica en la documentacion disponible. Tampoco se documenta RLHF, DPO ni ninguna innovacion tecnica adicional. El unico dato relevante de proceso es que los pesos proceden de una conversion desde fairseq2 y que la comprobacion de paridad numerica frente al checkpoint original **no paso**, lo que introduce la posibilidad de discrepancias en la calidad de transcripcion respecto al modelo de referencia.

## Capacidades

- Reconocimiento automatico del habla (ASR) con salida CTC sobre vocabulario SentencePiece de 10.288 tokens.
- Transcripcion de audio a 16 kHz; el ejemplo oficial asume remuestreo previo con torchaudio si la fuente no esta a esa frecuencia.
- Soporte multilingue declarado de forma generica ("multiple languages"), sin listado oficial de idiomas en la model card.
- Integracion nativa con la libreria Transformers mediante `Wav2Vec2ForCTC` y `AutoProcessor`.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible` en el repositorio).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo "thinking": es exclusivamente un modelo discriminativo de transcripcion.
- No hay capacidades de diarizacion de hablantes, deteccion de idioma por segmento ni puntuacion automatica declaradas.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en zulu: el modelo permite convertir grabaciones de centros de contacto en texto para analitica posterior (motivos de contacto, tiempos, resolucion), siempre que la calidad de la conversion de pesos se valide antes en el dominio concreto.
- Subtitulado de contenido audiovisual en lenguas africanas de bajos recursos: al ser un modelo CTC sin decodificador, la inferencia es rapida y permite procesar horas de video en lote sin la latencia de un modelo autorregresivo.
- Generacion de corpus textuales para investigacion linguistica: transcripcion masiva de archivos de audio de campo (entrevistas, narrativa oral) para construir datasets etiquetados que alimenten modelos posteriores.
- Preanotacion en flujos de anotacion humana: el modelo produce una primera transcripcion que revisores humanos corrigen, reduciendo coste frente a la transcripcion manual desde cero.
- Indexacion y busqueda de archivos de audio: convertir un archivo historico de emisiones de radio o podcasts a texto para hacerlo buscable y recuperable con un motor de busqueda o un sistema RAG.
- Accesibilidad en tiempo real: transcripcion de voz a texto para personas con discapacidad auditiva en entornos donde se habla zulu, desplegando el modelo en un endpoint con procesamiento por fragmentos.
- Base para ajuste fino especifico: dado su tamaño manejable (326M) y su licencia no declarada (punto a aclarar antes de uso comercial), sirve como punto de partida para fine-tuning en variantes dialectales o dominios concretos como sanidad o justicia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER, CER ni comparaciones con otros sistemas, y los resultados de busqueda web proporcionados no contienen informacion tecnica sobre el modelo. Adicionalmente, la verificacion de paridad fallida frente al checkpoint original implica que cualquier metrica publicada para `omniASR_CTC_300M_v2` en fairseq2 no es directamente extrapolable a estos pesos sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo de pesos (325.983.920 parametros x 4 bytes), mas activaciones; en la practica conviene reservar 2-3 GB con lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,65 GB de pesos; en int8, unos 0,33 GB teoricos (no se distribuyen pesos cuantizados, habria que cuantizar manualmente).
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 3090, RTX 4090 e incluso GPUs con 4-6 GB de VRAM para inferencia con lote 1.
- Tambien es viable en CPU para procesamiento por lotes offline, aunque con mayor latencia por hora de audio.
- GPU recomendadas para throughput alto: A100, H100 o L40S, no por requisito de memoria sino para paralelizar muchos streams de audio simultaneos.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `AutoProcessor`, pipeline de HuggingFace, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), exportacion a ONNX Runtime o TorchScript para produccion. vLLM y llama.cpp **no aplican**: el primero esta orientado a modelos generativos y el segundo requiere formato GGUF, que no se distribuye aqui.
- Latencia y throughput: no disponibles. No se publican valores de RTF (real-time factor) ni de audio procesado por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto, rendimiento ni licencia de los modelos alternativos dentro de la informacion proporcionada, por lo que la tabla se limita a lo confirmado y marca el resto como no disponible. Las alternativas de categoria habituales para ASR multilingue son Whisper (OpenAI), MMS (Meta) y wav2vec2-XLSR (Meta), pero sus cifras concretas no se han verificado en esta busqueda y no deben darse por buenas sin consultar sus fichas oficiales.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omniASR-CTC-300M-v2-Zulu-AUG-ANV | 325.983.920 | no disponible | no disponible (paridad fallida) | no disponible | HuggingFace, 0 descargas, 0 likes |
| Whisper (OpenAI) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificado en esta busqueda |
| MMS (Meta) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificado en esta busqueda |
| wav2vec2-XLSR (Meta) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificado en esta busqueda |

Diferencias cualitativas que si se pueden afirmar con la informacion disponible: este modelo es exclusivamente CTC (sin decodificador autorregresivo), esta vinculado al ecosistema OmniLingual/fairseq2 y su conversion a Transformers no ha superado la verificacion de paridad, mientras que las alternativas citadas cuentan con fichas oficiales, licencias publicadas y evaluaciones reproducibles. En ausencia de licencia declarada, cualquier comparacion de uso comercial queda bloqueada hasta aclarar ese punto.

## Limitaciones y advertencias

- **Verificacion de paridad fallida**: el propio autor indica que la comprobacion de paridad entre los pesos convertidos y el checkpoint fairseq2 original reporto un desajuste. Los resultados pueden diferir del modelo de referencia y no hay garantia de correccion numerica.
- **Licencia no declarada**: el repositorio no especifica licencia. Esto impide determinar si el uso comercial esta permitido; hay que contactar con el autor o consultar la licencia del proyecto OmniLingual de origen antes de cualquier despliegue productivo.
- **Idiomas no confirmados**: la model card afirma soporte multilingue pero no lista idiomas, y no se documenta el rendimiento por idioma. El zulu aparece solo en el nombre del repositorio, no como dato verificado.
- **Sin benchmarks**: no hay WER, CER ni comparaciones publicadas, por lo que no se puede estimar la calidad esperada en ningun dominio.
- **Riesgo de alucinacion y errores CTC**: al no haber modelo de lenguaje en la decodificacion, los errores tipicos son sustituciones, omisiones y repeticiones de fonemas, especialmente con ruido de fondo, solapamiento de hablantes o audio no nativo. La decodificacion greedy (`argmax`) del ejemplo oficial no incorpora beam search ni modelo de lenguaje externo.
- **Sesgos**: no se documenta la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos de acento, genero, edad o dialecto. Es esperable un peor rendimiento fuera de la distribucion de los datos originales.
- **Cero validacion comunitaria**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentacion de terceros sobre su comportamiento real.
- **Fechas anomales**: el repositorio registra creacion y actualizacion el 2026-09-11, una fecha futura respecto al momento habitual de publicacion; conviene verificar la integridad y procedencia del artefacto.
- **Error en el ejemplo de la model card**: el fragmento de codigo usa `AutoProcessor.from_pretrained("omniASR-CTC-300M-v2-Zulu-AUG-ANV")` sin el prefijo del autor (`csikasote/`), por lo que tal cual fallara; hay que pasar el identificador completo del repositorio.
- **Sin contexto de texto**: no es un modelo de lenguaje, no acepta prompts, no hace tool calling ni razonamiento; usarlo para tareas generativas no es viable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/csikasote/omniASR-CTC-300M-v2-Zulu-AUG-ANV
- Proyecto OmniLingual ASR (checkpoint de origen en fairseq2): https://github.com/facebookresearch/omnilingual-asr

Nota: los resultados de busqueda web proporcionados correspondian a paginas de metodos de pago de Amazon Prime Video en polaco y no guardan ninguna relacion con el modelo, por lo que no se han incluido como enlaces relevantes.
