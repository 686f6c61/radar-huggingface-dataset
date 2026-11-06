# naklitechie/steno-speech-models

## Resumen

Steno speech models es un repositorio de Hugging Face publicado por el usuario naklitechie que contiene dos modelos ONNX cuantizados a int8, pensados para ser usados por Steno, una aplicación de grabación de reuniones. No se trata de un modelo nuevo entrenado desde cero, sino de copias cuantizadas de dos modelos existentes: un sistema de reconocimiento automático del habla (ASR) llamado Parakeet Ultra, desarrollado por Moondream a partir de nvidia/parakeet-tdt-0.6b-v3, y un sistema de diarización de hablantes llamado Nemotron-3 Diarization, de NVIDIA. Ambos se cargan mediante la librería parakeet-rs y ONNX Runtime sobre CPU, sin necesidad de GPU.

El modelo ASR cubre 25 idiomas europeos (incluido el castellano) y ocupa 935 MB en su versión int8, frente a los 2,55 GB del export fp32 original. El modelo de diarización, mucho más pequeño (107 MB), identifica hasta 8 hablantes distintos en una grabación. La relevancia de esta publicación es práctica: permite ejecutar transcripción con separación de hablantes en hardware modesto, incluidos portátiles de consumo, con una pérdida de precisión mínima respecto a los originales en coma flotante.

La cuantización se realizó con cuantización dinámica de ONNX Runtime, aplicada únicamente a los pesos de las operaciones MatMul y Gemm, dejando las capas de atención en fp32 para garantizar la compatibilidad con ONNX Runtime 1.24. El autor reporta que el reconocedor int8 iguala el WER del fp32 (14,5 % agrupado en el corpus AMI) y corre entre un 10 y un 20 % más rápido con aproximadamente un 40 % menos de RAM pico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (transducer) para ASR; Sortformer para diarizacion (segun tags del repo) |
| Parametros totales | 0,6 B en el modelo ASR (parakeet-tdt-0.6b-v3); no disponible para el diarizador |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; se recomienda procesar en fragmentos de ~10 s de audio |
| Tipos de cuantizacion | int8 dinamica (QInt8) sobre pesos de MatMul y Gemm; atencion en fp32 |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | CC-BY-4.0 (ASR) y OpenMDW-1.1 (diarizacion); licencia compuesta cc-by-4.0-and-openmdw-1.1 |
| Formato de pesos | ONNX (int8), con vocab.txt sin modificar |

## Arquitectura y entrenamiento

El modelo de reconocimiento es Parakeet Ultra, un sistema ASR basado en la arquitectura Parakeet TDT (transducer) de NVIDIA, concretamente un post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3 con 0,6 mil millones de parámetros. El modelo de diarización es Nemotron-3 Diarization, de NVIDIA, que emplea la arquitectura Sortformer según las etiquetas del repositorio. Ambos fueron exportados originalmente a ONNX en fp32 por altunenes/parakeet-rs y posteriormente cuantizados por naklitechie mediante `quantize_dynamic` de ONNX Runtime, sin reentrenamiento ni modificación de los datos de entrenamiento originales.

La innovación técnica de esta publicación no está en el entrenamiento, sino en el proceso de compresión: la cuantización dinámica se restringe a las operaciones MatMul y Gemm, manteniendo las capas de atención en fp32 para que el grafo cargue correctamente en ONNX Runtime 1.24. El resultado es una reducción de tamaño del 63 % en el ASR (de 2,55 GB a 935 MB) y del 73 % en el diarizador (de 402 MB a 107 MB), con una degradación medida inferior a 0,3 puntos de DER y sin cambios apreciables en WER. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO en los modelos originales.

## Capacidades

- Transcripción automática de voz a texto en 25 idiomas europeos, incluidos castellano, catalán no listado, inglés, alemán, francés, italiano, portugués, neerlandés, polaco, checo, eslovaco, húngaro, rumano, búlgaro, griego, maltés, ruso, ucraniano, croata, esloveno, letón, lituano, estonio, finés, sueco y danés.
- Diarización de hablantes: identificación y separación de hasta 8 interlocutores distintos en una misma grabación.
- Generación de marcas de tiempo a nivel de frase mediante `TimestampMode::Sentences`.
- Ejecución íntegra en CPU mediante ONNX Runtime, sin requerir GPU ni aceleradores dedicados.
- Integración con la librería Rust parakeet-rs para su uso en aplicaciones de escritorio.
- Procesamiento por fragmentos de audio de aproximadamente 10 segundos, cortados en puntos de silencio.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones de trabajo: el modelo ASR convierte grabaciones de hasta 97 minutos en texto con marcas de tiempo, y el diarizador asigna cada intervención a un hablante, lo que permite generar actas con turnos de palabra. Es adecuado porque el pipeline completo (loudness a -20 dBFS, fragmentos de 10 s) está pensado específicamente para este escenario.
- Subtitulado y accesibilidad: la generación de marcas de tiempo por frase permite alinear subtítulos con el audio en 25 idiomas europeos, útil para contenidos formativos o institucionales multilingües.
- Análisis de entrevistas y grupos focales: la diarización de hasta 8 hablantes facilita separar las respuestas de cada participante en investigación cualitativa, con la ventaja de ejecutarse en un portátil sin GPU.
- Cumplimiento y auditoría de reuniones: al ejecutarse localmente en CPU con ONNX Runtime, los datos de audio no salen del dispositivo, lo que encaja en entornos con requisitos de privacidad estrictos.
- Transcripción de llamadas de atención al cliente: el soporte de 25 idiomas permite procesar conversaciones multilingües y separar agente de cliente mediante la diarización, con un coste de infraestructura bajo.
- Herramientas de toma de notas en escritorio: la integración con parakeet-rs en Rust permite incrustar el modelo en aplicaciones nativas de macOS, Linux o Windows, con un consumo de RAM pico reportado de 1,95 GB en un Intel i5-9300H.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el rendimiento medido de 63× a 73× en tiempo real sobre CPU permite transcribir horas de audio en minutos con hardware convencional.

## Benchmarks y rendimiento

Resultados de ASR sobre el corpus AMI (mezcla de auriculares, seis reuniones de test), WER con normalizador inglés de OpenAI:

| Grabacion | Minutos | WER fp32 % | WER int8 % | Delta | int8 vs fp32 % | Vel. fp32 | Vel. int8 |
|---|--:|--:|--:|--:|--:|--:|--:|
| AMI ES2004a | 17 | 16,0 | 15,9 | -0,1 | 1,7 | 67× | 71× |
| AMI ES2004b | 39 | 14,5 | 14,6 | +0,1 | 1,9 | 59× | 65× |
| AMI IS1009a | 14 | 19,0 | 18,9 | -0,1 | 1,2 | 60× | 70× |
| AMI IS1009b | 34 | 13,8 | 13,5 | -0,3 | 1,3 | 58× | 72× |
| AMI TS3003a | 25 | 13,4 | 13,4 | +0,0 | 1,8 | 61× | 73× |
| AMI TS3003b | 37 | 13,3 | 13,4 | +0,1 | 2,4 | 60× | 72× |
| **AMI agrupado** | | **14,5** | **14,5** | **-0,1** | | | |

Resultados de diarización sobre AMI, DER a nivel de frame (10 ms, sin collar, solapamiento puntuado):

| Grabacion | Hablantes reales | Encontrados fp32 | Encontrados int8 | DER fp32 % | DER int8 % | int8 vs fp32 % | Vel. fp32 | Vel. int8 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| AMI ES2004a | 4 | 4 | 4 | 34,3 | 34,4 | 1,3 | 152× | 164× |
| AMI ES2004b | 4 | 5 | 5 | 25,9 | 26,2 | 1,2 | 137× | 159× |
| AMI IS1009a | 4 | 4 | 4 | 31,7 | 32,0 | 1,8 | 147× | 162× |
| AMI IS1009b | 4 | 4 | 4 | 16,3 | 16,4 | 0,9 | 146× | 147× |
| AMI TS3003a | 4 | 4 | 4 | 43,9 | 44,0 | 1,1 | 130× | 160× |
| AMI TS3003b | 4 | 4 | 4 | 32,0 | 32,2 | 0,7 | 145× | 160× |

En dos reuniones reales de 70 y 97 minutos en inglés indio con algo de hindi, sin referencia disponible, la discrepancia int8 frente a fp32 fue del 5,2 % y 7,4 % en ASR, y del 5,9 % y 3,4 % en diarización. En un portátil Windows con Intel i5-9300H, una reunión de 70 minutos tardó 466 s con int8 frente a 643 s con fp32, con RAM pico de 1,95 GB frente a 2,96 GB.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime.
- RAM: aproximadamente 1,95 GB de pico para el pipeline completo con int8 en un portátil Intel i5-9300H; el export fp32 requiere unos 2,96 GB.
- GPU recomendadas: no aplica; no se documenta aceleración por GPU para esta distribución.
- Cabe en cualquier equipo de consumo con al menos 2 GB de RAM libre; no necesita tarjeta gráfica dedicada.
- Opciones de despliegue: ONNX Runtime sobre CPU, cargado a través de la librería Rust parakeet-rs. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de modelos de audio y no de lenguaje.
- Latencia y throughput: entre 63× y 73× en tiempo real para ASR y entre 147× y 164× para diarización sobre Apple Silicon; en un Intel i5-9300H, una reunión de 70 minutos se procesa en 466 s (unas 9× en tiempo real).
- Recomendación de uso: mantener llamadas de unos 10 segundos de audio; fragmentos más largos provocan pérdida de palabras según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato | Notas |
|---|---|--:|---|---|---|---|
| Steno ASR (Parakeet Ultra int8) | 0,6 B | fragmentos de ~10 s | 25 | CC-BY-4.0 | ONNX int8 | 935 MB, CPU, WER AMI 14,5 % |
| Parakeet Ultra fp32 (moondream) | 0,6 B | fragmentos de ~10 s | 25 | CC-BY-4.0 | ONNX fp32 | 2,55 GB, WER AMI 14,5 % |
| Steno diarizacion (Nemotron-3 int8) | no disponible | no disponible | no disponible | OpenMDW-1.1 | ONNX int8 | 107 MB, hasta 8 hablantes |
| Nemotron-3 Diarization fp32 (NVIDIA) | no disponible | no disponible | no disponible | OpenMDW-1.1 | ONNX fp32 | 402 MB, DER AMI 16,3-43,9 % |

No se dispone de datos de benchmarks frente a otros sistemas ASR comerciales o abiertos como Whisper en la información proporcionada, por lo que la comparación se limita a las versiones fp32 e int8 de los mismos modelos.

## Limitaciones y advertencias

- No son lanzamientos oficiales: son copias cuantizadas por un tercero (NakliTechie), no publicadas por Moondream ni por NVIDIA. El autor remite a las model cards originales para uso previsto, sesgos y privacidad.
- El WER en el corpus AMI es alto en términos absolutos (14,5 % agrupado, con picos del 19 %), lo que refleja la dificultad de audio de reuniones con solapamiento y ruido; no es adecuado para transcripción de precisión en entornos ruidosos sin revisión humana.
- La diarización muestra un DER elevado en algunas grabaciones (hasta 44,0 % en AMI TS3003a) y confunde el número de hablantes en al menos un caso (5 encontrados frente a 4 reales en AMI ES2004b).
- El modelo ASR pierde palabras si se le pasan fragmentos de audio superiores a unos 10 segundos; es obligatorio trocear en puntos de silencio.
- Las pruebas con reuniones reales en inglés indio con algo de hindi muestran una discrepancia int8-fp32 de hasta el 7,4 %, superior a la observada en AMI; el comportamiento en otros idiomas y acentos no está evaluado en la información disponible.
- La licencia es compuesta (CC-BY-4.0 para el ASR y OpenMDW-1.1 para el diarizador); el uso comercial exige cumplir ambas, incluida la atribución a Moondream, NVIDIA y el cuantizador.
- No se documentan evaluaciones de sesgo demográfico, acento o género en esta publicación; deben consultarse las model cards de los modelos originales.
- No se dispone de información sobre el comportamiento del modelo con audio de baja calidad, ruido de fondo intenso o múltiples idiomas mezclados en una misma grabación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/naklitechie/steno-speech-models
- Modelo base ASR (Moondream Parakeet Ultra): https://huggingface.co/moondream/parakeet-ultra
- Modelo original NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo base diarizacion (NVIDIA Nemotron-3 Diarization): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Exports ONNX fp32 de origen: https://huggingface.co/altunenes/parakeet-rs
- Libreria parakeet-rs: https://github.com/altunenes/parakeet-rs
