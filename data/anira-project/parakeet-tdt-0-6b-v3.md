# anira-project/parakeet-tdt-0.6b-v3

## Resumen

Parakeet TDT 0.6B v3 para anira es una redistribución del modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA, empaquetado por el proyecto anira para su uso como motor de transcripción en su stack de modelos fundacionales. El modelo original es un sistema ASR de tipo token-and-duration transducer (TDT) con encoder FastConformer, entrenado para transcribir voz en 25 idiomas europeos con detección automática de idioma. Esta ficha cubre la variante publicada por anira-project, que incluye exportaciones en ONNX (int8), ExecuTorch y Core ML.

El interés de esta versión no reside en el modelo en sí (idéntico en pesos al checkpoint de NVIDIA), sino en el trabajo de exportación y cuantización que permite ejecutarlo en entornos sin GPU, como navegadores, dispositivos móviles o Macs con Apple Silicon. El encoder int8 en ONNX ocupa 652 MB, y la exportación a Core ML alcanza 111 ms por ventana de 31 segundos en un Mac con chip de la serie M, lo que lo hace viable para transcripción en tiempo real en hardware de consumo.

El modelo está pensado para integrarse en pipelines ASR con detección de actividad de voz (VAD): transcribe cada segmento de habla tras una pausa, con una ventana máxima fija de 31 segundos (30 s de voz más 0,4 s de padding a cada lado). La licencia es CC BY 4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + TDT (token-and-duration transducer) decoder y joint network |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 31 s de audio (30 s de voz + 0,4 s de padding por lado); no es contexto de texto |
| Tipos de cuantizacion | int8 (ONNX); float16 en el encoder de las exportaciones Core ML; float32 en ExecuTorch CPU |
| Idiomas soportados | 25 idiomas europeos: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk; con detección automática de idioma |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (int8), ExecuTorch (.pte), Core ML (.mlpackage); vocabulario SentencePiece en vocab.txt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TDT (token-and-duration transducer) de NVIDIA, que combina un encoder FastConformer con un decoder y una red joint que predicen conjuntamente tokens y duraciones. El encoder procesa características log-mel de 128 bandas y produce representaciones de 1024 dimensiones; el decoder_joint emite logits sobre un vocabulario de 8192 tokens más el token blank y cinco duraciones posibles. La inferencia se realiza mediante búsqueda greedy sobre los pasos del TDT, realimentando el estado de la red de predicción en cada paso.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR). El checkpoint original es de NVIDIA (`nvidia/parakeet-tdt-0.6b-v3`, revisión `541d1f9`). La exportación int8 en ONNX es obra de istupakov (`istupakov/parakeet-tdt-0.6b-v3-onnx` en `8f23f0c`) y se incluye sin cambios; las exportaciones ExecuTorch y Core ML se generaron desde el checkpoint de NVIDIA con el script `export/` del repositorio, con el STFT del preprocesador reescrito como una convolución sobre una base DFT para evitar tensores complejos que Core ML no admite.

La innovación técnica destacable es la exportación a formatos ligeros con ventana fija de 31 s: el audio más corto se rellena con ceros y una máscara de longitudes enmascara el padding. Las desviaciones numéricas respecto a NeMo son mínimas: 1,6e-5 en features, 3,1e-6 en encoder y 3,1e-7 en decoder_joint para ExecuTorch CPU; 8,7e-3 en encoder para Core ML (float16); y 1,3e-1, 9,7e-2 y 1,2e-1 para el ONNX int8. Todas las exportaciones transcriben el audio de prueba exactamente igual que NeMo, salvo el ONNX int8, que difiere en un signo de puntuación.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con detección automática del idioma.
- Reconocimiento de habla con puntuación y formato de texto (el modelo original de NVIDIA produce texto con mayúsculas y puntuación).
- Procesamiento por segmentos tras detección de actividad de voz (VAD), con ventana máxima de 31 s por segmento.
- Ejecución en CPU sin GPU: exportaciones ExecuTorch (XNNPACK), Core ML (Apple) y ONNX Runtime.
- Integración con el runtime de anira (`anira-project/backends` v2.4.0) para las exportaciones ExecuTorch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No soporta visión ni audio más allá de la transcripción de voz.
- No dispone de modo "thinking" ni capacidades generativas de texto libre.

## Casos de uso

- Transcripción en tiempo real en aplicaciones de escritorio: el encoder Core ML procesa una ventana de 31 s en 111 ms en un Mac con chip de la serie M, lo que permite transcripción continua por segmentos VAD sin GPU dedicada.
- Subtitulado automático de vídeo en 25 idiomas europeos: el modelo detecta el idioma y transcribe cada segmento; la ventana de 31 s encaja con la segmentación típica de subtítulos.
- Aplicaciones móviles de dictado: las exportaciones ExecuTorch y Core ML están pensadas para iOS y Android, con tamaños de encoder de 1,2 GB (Core ML float16) y 2,5 GB (ExecuTorch CPU float32).
- Transcripción de reuniones y notas de voz: el pipeline VAD + segmento de 31 s permite procesar conversaciones largas en trozos manejables, con latencia baja en CPU.
- Procesamiento por lotes en servidores sin GPU: el ONNX int8 (652 MB de encoder) se ejecuta en ONNX Runtime en CPU, adecuado para transcripciones offline de archivos de audio.
- Integración en asistentes de voz locales: al no requerir GPU ni conexión, se puede incrustar en aplicaciones de privacidad estricta donde el audio no debe salir del dispositivo.
- Investigación en ASR multilingüe: sirve como referencia reproducible para comparar exportaciones (ONNX, ExecuTorch, Core ML) frente a NeMo con desviaciones numéricas documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible. Los únicos datos de rendimiento son de latencia y desviación numérica de las exportaciones:

| Formato | Precisión | Encoder por ventana de 31 s (Mac serie M) | Desviación máx. features / encoder / decoder_joint |
|---|---|---|---|
| ExecuTorch CPU (XNNPACK) | float32 | 0,9 a 1,8 s | 1,6e-5 / 3,1e-6 / 3,1e-7 |
| ExecuTorch Core ML | encoder float16, resto float32 | 111 ms | 1,6e-5 / 8,7e-3 / 4,9e-7 |
| Core ML ML program (macOS 13, iOS 16) | encoder float16, resto float32 | 113 ms | 1,6e-5 / 8,7e-3 / 4,9e-7 |
| ONNX Runtime (int8) | int8 | no disponible | 1,3e-1 / 9,7e-2 / 1,2e-1 |

## Requisitos de hardware

- VRAM estimada: no aplica para las exportaciones CPU (ONNX int8, ExecuTorch, Core ML); no se proporcionan requisitos de GPU.
- GPU recomendadas: no disponible; las exportaciones documentadas son para CPU y Apple Neural Engine vía Core ML.
- Cabe en hardware de consumo: sí. El encoder ONNX int8 ocupa 652 MB en disco; el encoder Core ML (float16) 1,2 GB; el encoder ExecuTorch CPU (float32) 2,5 GB. La memoria en ejecución no se detalla.
- Opciones de despliegue: ONNX Runtime (int8), ExecuTorch 1.3.1 (XNNPACK o Core ML), Core ML nativo (macOS 13, iOS 16), runtime de anira (`anira-project/backends` v2.4.0).
- Latencia: 111-113 ms por ventana de 31 s en Mac serie M con Core ML; 0,9-1,8 s con ExecuTorch CPU. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formatos |
|---|---|---|---|---|---|
| anira-project/parakeet-tdt-0.6b-v3 | 0,6 B | 25 europeos | 31 s por ventana | CC BY 4.0 | ONNX int8, ExecuTorch, Core ML |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 europeos | no disponible en la información | CC BY 4.0 | NeMo (.nemo) |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0,6 B | 25 europeos | no disponible en la información | CC BY 4.0 | ONNX int8 |

No se dispone de datos de benchmarks para comparar la precisión (WER) frente a alternativas como Whisper large-v3 o Canary; no se incluyen por no estar en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente ASR: no genera texto libre, no razona, no soporta tool calling ni agentes.
- Ventana fija de 31 s por segmento; segmentos más largos deben dividirse mediante VAD. El padding con ceros y la máscara de longitudes son parte del contrato de entrada.
- Solo cubre 25 idiomas europeos; no soporta otras lenguas ni code-switching más allá de la detección automática documentada.
- El ONNX int8 presenta desviaciones numéricas superiores a las demás exportaciones (hasta 1,3e-1 relativo a NeMo) y puede diferir en puntuación respecto al modelo original.
- Riesgo de alucinación: no documentado en la información disponible, pero es un riesgo inherente a los modelos ASR en audio con ruido o silencios.
- Sesgos: no documentados en la información disponible; dependen del dataset de entrenamiento de NVIDIA, no detallado.
- Licencia CC BY 4.0: permite uso comercial con atribución a NVIDIA (modelo original), a istupakov (exportación ONNX int8) y a anira-project (exportaciones ExecuTorch/Core ML, Apache-2.0 para el código de exportación).
- Verificar el SHA256 de cada archivo al descargar y fijar una revisión, según recomienda el autor.
- El modelo base es de NVIDIA; los pesos no han sido modificados en la exportación ONNX, pero las exportaciones ExecuTorch/Core ML introducen cambios numéricos (float16 en el encoder Core ML).

## Enlaces

- HuggingFace: https://huggingface.co/anira-project/parakeet-tdt-0.6b-v3
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX de istupakov: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Repositorio anira: https://github.com/anira-project/anira
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Runtime de backends de anira: anira-project/backends v2.4.0 (referenciado en la model card, sin URL directa en la información disponible)
