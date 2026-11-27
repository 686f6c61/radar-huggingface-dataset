# manolisfosteris/rumble-2-flash-cypriot-greek

## Resumen

Rumble-2-Flash Cypriot Greek es un ajuste fino mediante LoRA del modelo de reconocimiento automatico del habla Reson8/Rumble-2-Flash (509 M de parametros), especializado en habla espontanea en griego chipriota (el-CY). Lo desarrolla el usuario independiente manolisfosteris y resuelve un problema concreto: los modelos ASR multilingues genericos obtienen tasas de error muy altas sobre esta variedad dialectal, que carece de ortografia estandar y de corpus amplios. El modelo parte de la arquitectura Qwen3-ASR-0.6B y conserva el mismo procesador y arquitectura que el modelo base, con los adaptadores LoRA ya fusionados en un checkpoint plano.

La relevancia practica esta en la mejora medida: sobre el conjunto de test chipriota (371 clips, 2,89 h, 3 hablantes no vistos en entrenamiento) el modelo reduce el WER del 55,7 % en zero-shot al 24,7 %, con un CER del 8,7 % ignorando acentos. Para limitar el olvido del griego estandar se mezclo una pequena cantidad de habla griega estandar durante el entrenamiento, aunque a costa de degradar el rendimiento en griego estandar respecto al modelo base (29,6 % frente a 14,1 % en FLEURS Greek).

Se distribuye con licencia Apache-2.0, en formato safetensors, con 508.631.552 parametros y un repositorio de 1,0 GB. Es un modelo de nicho, orientado a transcripcion de audio dialectal y a investigacion sobre ASR de bajos recursos, no a un uso generalista multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (qwen3_asr), transformer encoder-decoder para ASR; adaptadores LoRA fusionados sobre Rumble-2-Flash |
| Parametros totales | 508.631.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; admite clips de hasta 20 minutos decodificados en una sola pasada |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bf16/float32 en inferencia; el autor desaconseja fp16) |
| Idiomas soportados | griego (el); evaluado solo en griego chipriota y griego estandar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-ASR del checkpoint Qwen/Qwen3-ASR-0.6B, con un encoder de audio y un decoder de lenguaje, y se ajusto con LoRA de rango 32 y alpha 64, dropout 0,05, aplicado a las capas de atencion y feed-forward tanto del encoder de audio como del decoder. El entrenamiento uso learning rate 1e-4, 50 pasos de warmup, hasta 1.000 pasos, batch efectivo de 16 (4 x 4), SpecAugment y semilla 42; se selecciono el mejor checkpoint por WER en el conjunto de desarrollo chipriota y se fusionaron los adaptadores. El ajuste se ejecuto en una unica NVIDIA L4 (Google Colab) en bf16, con 32 minutos de entrenamiento y un pico de memoria de 13,1 GB.

Los datos proceden de Mozilla Common Voice Spontaneous Speech, Cypriot Greek (el-CY) v5.0, CC0, con particiones oficiales disjuntas por hablante: 566 clips de entrenamiento (5 hablantes) cortados en 820 fragmentos de 30 s o menos mediante alineamiento forzado (unas 4,7 h), 280 clips de desarrollo y 371 de test. Para mitigar el olvido se anadieron 410 clips (206 hablantes, 30 minutos) de Common Voice Scripted Speech Greek 27.0 (CC0), sin etiqueta de dialecto. La revision del modelo base empleada fue `Reson8/Rumble-2-Flash@95bd5f9133a2398e5e48a98c089fe48e122bde97`. La cabeza CTC auxiliar del modelo base no forma parte de este checkpoint ni se ajusto.

## Capacidades

- Transcripcion de voz a texto (ASR) en griego chipriota espontaneo, con salida en ortografia chipriota (por ejemplo, `τζαι`, `εν`).
- Transcripcion de audio de hasta 20 minutos en una sola pasada de decodificacion.
- Control de formato de salida mediante el procesador: `digits=False` (numeros como palabras), `filler=True` (conserva hesitaciones), `verbatim=True`.
- Seleccion de idioma forzada mediante el parametro `language=["el"]`.
- Etiqueta de prompt `"Cypriot Greek"` disponible, aunque en los experimentos del autor no produjo diferencias medibles.
- Transcripcion de griego estandar, con rendimiento inferior al del modelo base.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio de entrada mas alla de la propia transcripcion.
- No evaluado en idiomas distintos del griego tras el ajuste.

## Casos de uso

- Transcripcion de entrevistas y grabaciones de campo en griego chipriota: el modelo esta entrenado sobre habla espontanea de Common Voice y maneja hesitaciones y numeros hablados con las opciones `filler=True` y `digits=False`, lo que encaja con corpus orales de investigacion dialectologica.
- Subtitulado y documentacion de material audiovisual chipriota: la ventana practica de 20 minutos por pasada permite procesar programas o grabaciones largas sin segmentacion manual previa.
- Investigacion en ASR de bajos recursos: sirve como punto de partida reproducible para experimentos de adaptacion dialectal con LoRA, dado que el autor publica configuraciones, predicciones y registro completo del experimento en su repositorio de GitHub.
- Archivado y preservacion de patrimonio oral: transcripcion de grabaciones historicas o comunitarias en chipriota, con la advertencia de que no se ha probado en audio ruidoso ni telefonico.
- Evaluacion comparativa de modelos ASR sobre dialectos griegos: el modelo ofrece una referencia con WER y CER medidos sobre un test disjunto por hablante (24,7 % WER, 8,7 % CER), util para contrastar otras aproximaciones.
- Prototipado de asistentes de voz locales para comunidades grecochipriotas: al tener 509 M de parametros y licencia Apache-2.0, puede desplegarse en infraestructura propia sin coste de licencia, aunque la calidad en dominios distintos del habla espontanea de Common Voice no esta validada.

## Benchmarks y rendimiento

WER con normalizacion `basic` (NFC, minusculas, sigma final, sin puntuacion), decodificacion greedy, batch size 1 y clips de longitud completa, sobre el corpus completo.

| Modelo | Cypriot dev | Cypriot test | FLEURS Greek (200 clips) |
|---|---|---|---|
| Rumble-2-Flash, zero-shot | 47,3 % | 55,7 % | 14,1 % |
| Rumble-2-Flash + LoRA, solo chipriota | 17,3 % | 26,9 % | 39,7 % |
| Este modelo | 17,9 % | 24,7 % | 29,6 % |

En test, este modelo supera de forma significativa al LoRA entrenado solo con chipriota: -2,1 puntos, con intervalo de confianza del 95 % por bootstrap emparejado de [-3,6, -0,7]. El CER en test, ignorando acentos, es del 8,7 %. El conjunto de test consta de 371 clips (2,89 h) de 3 hablantes no vistos en entrenamiento ni desarrollo. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no ser aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento con LoRA alcanzo un pico de 13,1 GB en una NVIDIA L4; la inferencia en bf16 con 509 M de parametros requiere bastante menos, aunque no se publica una cifra exacta. No disponible.
- GPU recomendadas: NVIDIA L4 (usada en el entrenamiento); cualquier GPU con soporte de bf16 es adecuada por el tamano del modelo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con al menos 4-8 GB de VRAM en bf16, aunque el autor no publica la medicion concreta.
- Precisión: usar bf16 en GPUs que lo soporten y float32 en caso contrario; el autor desaconseja explicitamente fp16.
- Opciones de despliegue: transformers con `AutoProcessor` y `Qwen3ASRForConditionalGeneration`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; las evaluaciones se hicieron con batch size 1 y decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en chipriota | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Rumble-2-Flash Cypriot Greek) | 508,6 M | clips de hasta 20 min | WER test 24,7 %; CER 8,7 % | Apache-2.0 | Hugging Face |
| Reson8/Rumble-2-Flash (base) | 509 M | clips de hasta 20 min (heredado) | WER test 55,7 % (zero-shot) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-ASR-0.6B | ~0,6 B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| LoRA solo chipriota (variante del autor) | 508,6 M | clips de hasta 20 min | WER test 26,9 % | Apache-2.0 | no publicada como checkpoint independiente |

El modelo base Rumble-2-Flash es claramente superior en griego estandar (FLEURS 14,1 % frente a 29,6 %), por lo que la eleccion depende del dominio: chipriota espontaneo para este ajuste, griego estandar para el base. No se dispone de datos de benchmarks de Qwen3-ASR-0.6B en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 5 hablantes y evaluado con 5 mas (2 en desarrollo, 3 en test); un unico hablante de test concentra 146 de los 371 clips y presenta un WER mucho peor (alrededor del 35 %), lo que indica alta variabilidad entre hablantes.
- Solo se probo con habla espontanea de Common Voice; no se ha validado en otros dominios, audio ruidoso ni audio telefonico.
- La salida sigue las convenciones de transcripcion de Common Voice (ortografia chipriota, hesitaciones conservadas, numeros como palabras). Como el chipriota no tiene ortografia estandar, otras convenciones se contabilizaran como errores.
- Peor rendimiento que el modelo base en griego estandar (FLEURS 29,6 % frente a 14,1 %); para audio en griego estandar debe usarse Rumble-2-Flash.
- Un unico seed de entrenamiento y evaluacion exclusivamente en griego; no se probaron otros idiomas del modelo base tras el ajuste.
- La cabeza CTC auxiliar del modelo base no esta incluida ni se ajusto.
- Riesgo de alucinacion y de errores sistematicos en hablantes o acentos poco representados, dado el tamano reducido de la muestra de entrenamiento.
- No se documentan sesgos especificos mas alla de la representacion limitada de hablantes; la licencia Apache-2.0 permite uso comercial, pero la validacion en produccion queda bajo responsabilidad del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manolisfosteris/rumble-2-flash-cypriot-greek
- Modelo base Reson8/Rumble-2-Flash: https://huggingface.co/Reson8/Rumble-2-Flash
- Qwen/Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Codigo, configuraciones, predicciones y registro del experimento: https://github.com/manolisfosteris/cypriot-greek
- Mozilla Common Voice (datos): https://mozilladatacollective.com
- Trabajo previo sobre el dataset, Stamou et al. 2026, "First Steps in ASR for Cypriot Greek": https://aclanthology.org/2026.dialres-1.30/
