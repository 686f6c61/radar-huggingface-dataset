# manifestro/kezek-v1

## Resumen

Kezek v1 es un modelo de separación de hablantes (speech separation) diseñado específicamente para dividir una grabación mono de una conversación entre exactamente dos personas en dos pistas independientes, una por hablante, preservando la longitud y la sincronización temporal del audio original. Lo desarrolla el autor independiente manifestro (autores citados: Bagzhan Karl y Alizhan Karl) y se distribuye bajo licencia Apache-2.0 con el código MIT. Su propósito declarado es preparar datos de diálogo full-duplex a partir de audio conversacional que solo existe como mezcla mono, un cuello de botella habitual en la construcción de datasets para modelos de voz conversacionales.

A diferencia de los pipelines clásicos de diarización seguidos de separación, Kezek adopta un enfoque en dos etapas: primero decide quién habla cuándo y quién es quién a lo largo de toda la grabación, y después un separador condicionado ejecuta esa decisión. El modelo es muy compacto (41 M de parámetros en total) y está entrenado íntegramente desde cero, sin modelos congelados de terceros. Requiere GPU CUDA con bf16 para inferencia.

Su relevancia actual radica en que aborda un problema poco tratado: mantener las respuestas cortas solapadas ("yeah", "mm-hm") en la pista de quien las pronuncia y garantizar que las dos pistas sumen exactamente la señal de entrada, algo crítico para generar datos de diálogo full-duplex realistas. El modelo está entrenado y evaluado en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline en dos etapas: fingerprint de hablante + PairNet (actividad) + separador Conv-TasNet condicionado (KezekTSE-L) |
| Parametros totales | 41 M (fingerprint 10,1 M; PairNet 11,8 M; separador 19,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; procesa la grabación completa en ventanas de 8 s con salto de 6 s |
| Tipos de cuantizacion | no disponible; inferencia en bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (pesos); MIT (código) |
| Formato de pesos | no disponible (ficheros .pt: fingerprint.pt, stage1_pairnet.pt, separator.pt) |

## Arquitectura y entrenamiento

Kezek se estructura en dos etapas. La etapa 1 combina un fingerprint de hablante (embedding de audio crudo de 10,1 M de parámetros, entrenado para ignorar la fase) con PairNet (11,8 M), que estima la actividad de las dos voces a lo largo de toda la grabación con resolución de 20 ms, guiado por el fingerprint. De este modo el sistema decide una única vez, para toda la grabación, quién habla cuándo y quién es quién, lo que evita los intercambios de canal frecuentes en enfoques por tramas. La etapa 2 emplea KezekTSE-L (19,6 M), un separador de estilo Conv-TasNet condicionado por la actividad estimada y por los dos perfiles de voz, cuyas salidas suman exactamente la señal de entrada. En inferencia se usa un umbral de actividad de 0,3 y el separador procesa la grabación completa en ventanas de 8 s con salto de 6 s.

El entrenamiento se realizó íntegramente desde cero, sin modelos congelados de terceros. Los datos de conversaciones (actividad y separación) provienen de Open Yap 1K (build `open-yap-1k_2026-11-04_wav_0e7bcf1e_0d3abb77`), bajo el Open Yap 1K Data Use Agreement v1, que permite uso comercial y pesos abiertos. Para solapamientos sintéticos y fingerprint se usó Libri-Light (LibriVox, dominio público) y VoxPopuli (CC0). Como aumentación se emplearon MUSAN (CC BY 4.0) y RIRS_NOISES (Apache-2.0). El audio de CallHome y DuplexChat no se usó para entrenamiento, solo para evaluación.

## Capacidades

- Separación de hablantes en conversaciones mono de exactamente dos personas, generando dos pistas con la longitud y la sincronización originales.
- Conservación de solapamientos y respuestas cortas en la pista del hablante que las pronuncia.
- Reconstrucción exacta: las dos pistas de salida suman la señal de entrada.
- Asignación estable de identidades (no-swap) a lo largo de toda la grabación mediante fingerprint y PairNet.
- Salida de actividad de habla junto con las pistas separadas.
- Interfaz de línea de comandos (`kezek-separate`) y API Python (`Kezek.from_pretrained()`).
- Procesamiento offline de grabaciones completas; no hay enrollment de hablantes ni restauración de voz.
- Idioma de entrenamiento y evaluación: inglés.

## Casos de uso

- Preparación de datasets full-duplex: a partir de audio conversacional que solo existe como mezcla mono, Kezek genera dos pistas sincronizadas por hablante, lo que permite construir pares de diálogo con solapamientos reales para entrenar modelos de voz conversacionales.
- Anotación y análisis de conversaciones: al disponer de una pista por persona, se facilita la transcripción por hablante y el análisis de turnos, interrupciones y solapamientos en grabaciones de entrevistas o reuniones.
- Investigación en diarización y separación: el modelo sirve como línea base reproducible (código MIT, pesos Apache-2.0) para comparar pipelines de separación en conversaciones de dos hablantes.
- Preprocesado para pipelines de ASR: separar las voces antes de la transcripción reduce la confusión entre hablantes en audio con solapamientos, especialmente útil en llamadas telefónicas o grabaciones de campo.
- Generación de datos de entrenamiento para modelos de diálogo: la conservación de respuestas cortas y solapamientos permite crear ejemplos realistas de conversación full-duplex que no se obtendrían con diarización convencional.
- Análisis de calidad de conversaciones: la actividad de habla estimada y las pistas separadas permiten medir tiempos de habla, solapamiento y participación por hablante en grabaciones de dos personas.

## Benchmarks y rendimiento

Resultados publicados en la model card. La comparación es contra pyannote → DialogueSidon (tal como se publica en el código de DuplexChat), ejecutado sin cambios sobre las mismas grabaciones. Se puntúan grabaciones completas; lo que un sistema no devuelve cuenta como perdido.

| Conjunto | Sistema | Respuestas cortas conservadas ↑ | Fuga (dB) ↓ | Sin intercambio ↑ | Cobertura ↑ | h / GPU-h ↑ |
|---|---|---|---|---|---|---|
| Open Yap test, tal como se grabó (121 conv.) | pyannote → DialogueSidon | 0,687 | −10,1 | 0,793 | 0,735 | 51 |
| | Kezek v1 | 0,830 | −13,9 | 0,934 | 1,000 | 231 |
| CallHome English, teléfono no visto (128 llamadas) | pyannote → DialogueSidon | 0,711 / 0,798 | −9,7 | 0,797 | 0,816 | 46 |
| | Kezek v1 | 0,796 / 0,907 | −11,8 | 0,859 | 1,000 | 232 |

En Open Yap test con audio limpio: SI-SDRi de solapamiento +10,61 dB, respuestas cortas 0,878 y sin intercambio 0,967. La velocidad se midió en una GPU RTX PRO 6000.

## Requisitos de hardware

- GPU CUDA con soporte de bf16 obligatoria según la model card.
- Tamaño del repositorio: 0,2 GB; el modelo completo son 41 M de parámetros, por lo que la VRAM necesaria para los pesos es muy reducida (del orden de decenas o pocos cientos de MB en bf16, aunque la cifra exacta no está publicada).
- GPU recomendadas: no hay una lista oficial; la evaluación de velocidad se realizó en una RTX PRO 6000. Por tamaño, cabe holgadamente en GPUs de consumo con soporte CUDA y bf16.
- Opciones de despliegue: paquete Python `kezek` (pip) con API `Kezek.from_pretrained()` y CLI `kezek-separate`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no se publican cifras absolutas; la métrica de velocidad es de 231–232 h de audio procesadas por GPU-hora en una RTX PRO 6000, frente a 46–51 h/GPU-h del pipeline de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / ventana | Licencia | Notas |
|---|---|---|---|---|---|
| Kezek v1 | Separación de hablantes en dos etapas (fingerprint + PairNet + Conv-TasNet condicionado) | 41 M | Ventanas de 8 s con salto de 6 s; grabación completa | Apache-2.0 (pesos), MIT (código) | Respuestas cortas 0,830; sin intercambio 0,934; cobertura 1,000 en Open Yap test |
| pyannote → DialogueSidon | Pipeline de diarización + separación | no disponible | no disponible | no disponible | Referencia de comparación; respuestas cortas 0,687; sin intercambio 0,793; cobertura 0,735 en Open Yap test |
| Otros separadores tipo Conv-TasNet | Separación de fuentes | no disponible | no disponible | no disponible | No se aportan datos comparativos en la información disponible |

## Limitaciones y advertencias

- Solo admite exactamente dos hablantes y funciona offline; no hay enrollment de hablantes ni restauración de voz: Kezek separa el audio, no lo limpia.
- El gap restante está en las respuestas dichas en voz baja bajo una voz más fuerte: en Open Yap test, tal como se grabó, se conservan 0,83 de las respuestas cortas.
- Entrenamiento y evaluación cuantitativa en inglés; el comportamiento en otros idiomas no está validado.
- En habla telefónica con voces similares, los canales pueden intercambiarse durante parte de una llamada: el 14 % de las llamadas de CallHome presentan al menos una ventana con canales intercambiados.
- Requiere GPU CUDA con bf16; no se documenta inferencia en CPU.
- Riesgo de uso indebido: el modelo solo reasigna audio ya presente en la grabación y no sintetiza voz; los usuarios deben tener derecho a procesar sus grabaciones y no debe usarse para identificar hablantes ni clonar voces.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el uso de los datos de entrenamiento Open Yap 1K está sujeto a su propio acuerdo (permite uso comercial y pesos abiertos); no se distribuye audio de Open Yap ni pistas derivadas.
- No se publican resultados de benchmarks en otros conjuntos ni comparaciones con separadores genéricos distintos del pipeline de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manifestro/kezek-v1
- Código (MIT): https://github.com/Manifestro/kezek
- Demo: https://manifestro.io/models/kezek
- Paper (arXiv): pendiente de enlace en el momento del lanzamiento según la model card
- Open Yap 1K Data Use Agreement v1: https://theagenticdatacompany.com/open-yap-1k/license
