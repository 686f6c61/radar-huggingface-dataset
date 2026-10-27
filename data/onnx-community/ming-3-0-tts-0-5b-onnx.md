# onnx-community/Ming-3.0-tts-0.5B-ONNX

## Resumen

Ming-3.0-tts-0.5B-ONNX es un paquete de exportación a ONNX de los componentes neuronales del modelo de síntesis de voz Ming-3.0-tts-0.5B, publicado por la organización comunitaria onnx-community. No incorpora entrenamiento ni pesos nuevos: reproduce en diez grafos ONNX la arquitectura del checkpoint original —backbone de texto con caché KV explícita, encoder de hablante CAMPPlus, agregador acústico y un paso de flow matching tipo DiT— para poder ejecutarla con ONNX Runtime en lugar del framework de origen.

El interés práctico es la portabilidad: al estar en ONNX (Opset 18 / IR 10, con el grafo CAMPPlus heredado en Opset 14 / IR 7), el modelo se puede desplegar sobre CPU, CUDA, TensorRT o DirectML sin depender del stack de Python del autor original. El tamaño nominal es de 0,5 B de parámetros, los pesos se exportan en BF16 conservando buffers FP32 del origen, y el repositorio ocupa 3,1 GB incluyendo los datos externos compartidos en `onnx/weights/model.bin`.

La advertencia principal es el estado de validación: el autor lo marca explícitamente como `EXPORTED_NOT_VALIDATED`. Se han completado las comprobaciones estáticas de estructura, tipos y formas, pero no se ha ejecutado inferencia ni verificado la alineación numérica, la calidad del audio o el rendimiento. Es material de partida para integración y pruebas, no un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS por componentes en ONNX: backbone de texto tipo transformer (`llm_prefill` / `llm_decode` con caché KV explícita), encoder de hablante CAMPPlus, proyección de hablante, agregador acústico, paso de flow matching tipo DiT (`dit_cfg_step`, predicción condicional e incondicional), encoder/decoder de audio sobre espectro real/imaginario y reconstrucción de waveform. Modelo dense |
| Parámetros totales | ~0,5 B según el nombre del checkpoint; no verificado en la información disponible |
| Parámetros activos | No aplica (modelo dense) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Exportación en BF16 con buffers FP32 del origen retenidos; no se incluye artefacto FP8 ni versiones INT8/INT4 |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el repositorio remite a la licencia original y a `LICENSE_NOTICE.md` |
| Formato de pesos | ONNX (Opset 18 / IR 10; CAMPPlus en Opset 14 / IR 7), 10 grafos en `onnx/` con datos externos compartidos en `onnx/weights/model.bin` |

## Arquitectura y entrenamiento

La información disponible no documenta el entrenamiento del modelo original: no se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. Lo que sí se detalla es la descomposición funcional de la inferencia en diez grafos: `token_embedding` (IDs a embeddings), `llm_prefill` y `llm_decode` (estados ocultos y caché KV del backbone de texto), `speaker_embedding` (extracción de características de hablante con CAMPPlus), `speaker_projection`, `stop_head` (logits de parada), `aggregator` (parche latente acústico a embedding del siguiente paso), `dit_cfg_step` (predicciones de flow-field condicional e incondicional para classifier-free guidance), `audio_encoder` (waveform de referencia y ruido posterior a latentes), `audio_decoder_spectrum` (secuencia latente completa a espectro real/imaginario) y `waveform_reconstruct` (espectro a waveform).

El paquete no es autónomo: requiere que el host construya el prompt, realice el remuestreo y la extracción de características de audio, integre el flujo (flow integration), gestione la lógica de parada y orqueste la caché. CAMPPlus espera características ya preparadas, no waveform en bruto. El tamaño de lote es uno y la reconstrucción de audio es no streaming. Entre las adaptaciones de exportación destacan el uso de máscaras causales y deslizantes explícitas, configuración de número de capas por instancia, y la sustitución de la FFT inversa compleja por productos de matrices DFT inversas reales con normalización overlap-add, lo que implica que el orden de cálculo no es idénticamente bit a bit. Las operaciones trigonométricas en BF16 se calculan en FP32 con redondeo a BF16, y los límites de clipping son tensores explícitos en el dispositivo de entrada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, generando waveform completa de una vez (no streaming).
- Condicionamiento por hablante mediante el encoder CAMPPlus y su proyección, lo que permite fijar o variar la identidad de voz de referencia.
- Control de la generación a través de un backbone de texto con caché KV explícita, apto para decodificación incremental token a token.
- Predicción de fin de secuencia mediante `stop_head`, necesaria para cerrar la síntesis.
- Generación acústica por flow matching con guiado libre de clasificador (CFG), con salidas separadas condicional e incondicional.
- No soporta tool calling ni function calling: la información disponible no describe ninguna interfaz de este tipo.
- No soporta agentes ni razonamiento multi-paso: es un pipeline de síntesis, no un modelo de propósito general.
- Capacidades multilingües: no disponibles en la información.
- Sin visión, audio de entrada como comprensión ni modo thinking: el único audio tratado es la referencia de hablante y el audio generado.

## Casos de uso

- Integración de TTS en aplicaciones .NET, C++ o Java: al estar en ONNX, el modelo se puede cargar con ONNX Runtime fuera del ecosistema Python, algo relevante para productos de escritorio o backends corporativos donde no se quiere arrastrar PyTorch.
- Generación por lotes de audiolibros y narración: la reconstrucción es no streaming y el lote es uno, de modo que el caso natural es un pipeline offline que sintetiza fragmentos largos de texto de forma secuencial y los ensambla después.
- Accesibilidad y lectura de contenidos: convertir artículos o documentación en audio para lectores de pantalla, siempre que se valide previamente la calidad de salida con la identidad de voz elegida.
- Doblaje y localización: uso del condicionamiento por hablante para mantener una voz de referencia coherente entre segmentos de un mismo contenido, con revisión humana posterior obligatoria.
- Evaluación comparativa de vocoders y decoders espectrales: los grafos `audio_decoder_spectrum` y `waveform_reconstruct` están separados, lo que permite sustituir o instrumentar etapas concretas en experiments de investigación sobre reconstrucción de espectro.
- Investigación sobre pipelines TTS modulares: el desglose en diez grafos con contrato de tensores documentado en `model_interface.json` facilita medir el coste de cada etapa (backbone, DiT, decoder) por separado.
- Pruebas de portabilidad de hardware: servir el mismo paquete con distintos execution providers de ONNX Runtime (CUDA, TensorRT, DirectML, CPU) para comparar latencia y fidelidad numérica en el hardware objetivo.
- Prototipado de asistentes por voz en local: combinado con un LLM y un ASR externos, el modelo aporta únicamente la etapa de síntesis; el batch uno limita su uso a prototipos o entornos de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que no se han realizado ejecuciones en tiempo de ejecución, alineación numérica, ni benchmarks de calidad o rendimiento sobre estos artefactos; el estado declarado es `EXPORTED_NOT_VALIDATED`.

## Requisitos de hardware

- Espacio en disco: 3,1 GB para el repositorio completo, incluyendo los datos externos `onnx/weights/model.bin` y los recursos de tokenizer y configuración en la raíz.
- Memoria para pesos: estimación aritmética a partir del recuento nominal de 0,5 B de parámetros, unos 1,0 GB en BF16; a ello se suman los buffers FP32 retenidos y las activaciones del decoder espectral y del paso DiT. Cifra no medida en la información disponible.
- VRAM estimada para inferencia: no disponible. El tamaño de las activaciones depende de la longitud de la secuencia latente y del número de pasos de integración del flujo, ninguno de los cuales se documenta.
- GPU recomendadas: el autor no publica recomendaciones. Al ser ONNX, el paquete es ejecutable con los execution providers de ONNX Runtime sobre CPU, CUDA, TensorRT o DirectML.
- GPU de consumo: por volumen de pesos el modelo debería caber en tarjetas de consumo con 8 GB o más, pero no hay validación runtime que lo confirme.
- Opciones de despliegue: ONNX Runtime (CPU y GPU). No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no se distribuye GGUF ni hay soporte descrito para esos servidores.
- Latencia y throughput: no disponibles. El tamaño de lote fijo de uno y la reconstrucción no streaming limitan el uso en tiempo real y en escenarios de alta concurrencia.
- Restricción de forma: los bloques de audio enteros van de 2 a 512, y la longitud de waveform rellenada es 3528 veces el número de bloques, con la longitud real suministrada por separado; el host debe gestionar ese relleno.

## Comparativa con modelos similares

La información proporcionada no incluye otros modelos TTS con datos verificables que permitan una comparación cuantitativa, por lo que las alternativas se marcan como no disponibles. La única comparación documentable es con el checkpoint de origen del que se exporta este paquete.

| Modelo | Parámetros | Contexto | Formato | Validación | Licencia |
|---|---|---|---|---|---|
| Ming-3.0-tts-0.5B-ONNX (este paquete) | ~0,5 B | No disponible | ONNX BF16, Opset 18 / IR 10 | Estática completada; runtime, alineación numérica y calidad no realizados | No disponible |
| Ming-3.0-tts-0.5B (origen) | ~0,5 B | No disponible | Checkpoint del framework original (no detallado) | No documentada en esta información | La declarada en el repositorio de origen |
| Otras alternativas TTS | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Estado `EXPORTED_NOT_VALIDATED`: no hay ejecución en runtime, alineación numérica frente al modelo original, evaluación de calidad de audio ni benchmarks de rendimiento.
- La captura del `AudioEncoder` se hizo con `draft_export` y arrastra 26 problemas reportados de guardas de forma y solidez; las dimensiones simbólicas permanecen en el grafo y la corrección con longitudes dinámicas no está establecida por pruebas de ejecución.
- La FFT inversa compleja se sustituye por productos de matrices DFT inversas reales con normalización overlap-add, de modo que el resultado no es idénticamente bit a bit al del modelo de origen.
- Paquete no autónomo: exige implementar en el host la construcción del prompt, el remuestreo y las características de audio, la integración del flujo, la lógica de parada y la orquestación de la caché KV.
- CAMPPlus espera características preparadas; no acepta waveform en bruto arbitraria.
- Tamaño de lote fijo de uno y reconstrucción no streaming: no apto para diálogo en tiempo real ni para servir a varios usuarios concurrentes sin replicación.
- Licencia no declarada en la información disponible; antes de cualquier uso comercial hay que revisar `LICENSE_NOTICE.md` y la licencia del checkpoint original.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- No se incluye artefacto FP8 ni variantes cuantizadas a INT8/INT4.
- Sesgos y riesgo de alucinación: no documentados. En un sistema TTS el riesgo equivalente es la generación de prosodia incorrecta, artefactos o pronunciaciones erróneas, que requieren evaluación perceptiva propia.
- Clonación o condicionamiento de voz: implica riesgos de suplantación y obligaciones legales sobre consentimiento y derechos de la voz de referencia; no hay salvaguardas descritas en el paquete.
- Al ser una exportación comunitaria, no consta revisión ni aval del autor del modelo original.

## Enlaces

- [HuggingFace: onnx-community/Ming-3.0-tts-0.5B-ONNX](https://huggingface.co/onnx-community/Ming-3.0-tts-0.5B-ONNX)
- Contrato de tensores del paquete: `model_interface.json` (raíz del repositorio)
- Informe de exportación: `conversion/export_report.json`
- Instrucciones de reproducción de la exportación: `conversion/README.md`
- Comprobador estático de formato: `conversion/scripts/check_onnx_format.py`
- Declaración de licencias: `LICENSE_NOTICE.md`
- [ONNX — sitio oficial](https://onnx.ai/)
- [Documentación de ONNX](https://onnx.ai/onnx/)
- [Repositorio onnx/onnx en GitHub](https://github.com/onnx/onnx)
- [Open Neural Network Exchange — Wikipedia](https://en.wikipedia.org/wiki/Open_Neural_Network_Exchange)
- [ONNX Runtime](https://onnxruntime.ai/)
