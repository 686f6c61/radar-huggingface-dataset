# felerminoali/omniASR-CTC-1B-v2-xichangana-onnx

## Resumen

omniASR CTC 1B v2 - Xichangana (ONNX) es la exportación a formato ONNX del modelo de reconocimiento automático del habla `felerminoali/omniASR-CTC-1B-v2-xichangana`, un ajuste fino sobre el modelo base `omniASR_CTC_1B_v2` de Meta. Está desarrollado por el usuario de Hugging Face felerminoali y su objetivo es permitir la transcripción de audio en xichangana (también conocido como tsonga, código ISO `ts`), una lengua bantú hablada principalmente en el sur de Mozambique, mediante `onnxruntime-web` directamente en el navegador. El modelo se emplea en el proyecto CATfrica para transcribir grabaciones etiquetadas como `tso-MZ`.

La arquitectura subyacente es Wav2Vec2 con cabecera CTC (Connectionist Temporal Classification), con aproximadamente 1.000 millones de parámetros según indica el nombre del modelo. El repositorio contiene una única versión cuantizada dinámicamente a int8 (pesos de MatMul), con un tamaño de en torno a 1 GB, lo que la hace viable para inferencia en CPU y WebAssembly. La salida son logits sobre un vocabulario de 10.288 tokens, con una trama cada 20 ms.

El modelo es relevante por dos motivos: cubre una lengua de bajos recursos con muy pocos sistemas ASR disponibles, y lo hace en un formato (ONNX + transformers.js) que permite desplegarlo sin servidor, en el propio navegador del usuario. La licencia Apache 2.0 facilita su uso comercial, aunque el rendimiento en WebAssembly de un solo hilo es previsiblemente más lento que el tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabecera CTC (exportado a ONNX, opset 17) |
| Parametros totales | ~1.000 millones (según nombre del modelo; no se detalla cifra exacta en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio a 16 kHz mono, sin límite de contexto declarado) |
| Tipos de cuantizacion | int8 dinámica (pesos de MatMul); único archivo `model_quantized.onnx` |
| Idiomas soportados | xichangana / tsonga (`ts`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx`), más `vocab.json`, `config.json`, `preprocessor_config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2, un transformer convolucional auto-supervisado para audio, con una cabeza de clasificación CTC. La exportación ONNX mantiene la configuración equivalente a `Wav2Vec2ForCTC`: entrada `input_values` en float32 con forma `[batch, samples]`, audio a 16 kHz mono, normalizado a media cero y varianza unitaria, y salida `logits` con forma `[batch, frames, 10288]`, donde cada trama corresponde a 20 ms de audio. La decodificación es CTC voraz (colapsar repeticiones y eliminar el token blank), con el token `▁`/espacio marcando el inicio de una nueva palabra.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (poco habituales en ASR). El modelo parte del checkpoint `omniASR_CTC_1B_v2` de Meta y fue ajustado específicamente para xichangana. La innovación destacable es la propia exportación: cuantización dinámica int8 de los pesos de MatMul y empaquetado para `onnxruntime-web`, lo que habilita inferencia en navegador mediante `transformers.js`. La model card advierte que el modelo int8 está pensado para CPU/WebAssembly y que en wasm de un solo hilo se espera una velocidad inferior al tiempo real.

## Capacidades

- Reconocimiento automático del habla (ASR) en xichangana/tsonga a partir de audio de 16 kHz mono.
- Salida de transcripción a nivel de carácter/pieza SentencePiece mediante decodificación CTC voraz.
- Funcionamiento en navegador mediante `onnxruntime-web` y `transformers.js`, sin necesidad de backend.
- Inferencia en CPU con pesos cuantizados int8.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.
- Capacidad multilingüe limitada al idioma declarado (`ts`); no se indica soporte de otras lenguas.

## Casos de uso

- Transcripción de grabaciones de campo en Mozambique: el proyecto CATfrica usa este modelo para procesar grabaciones etiquetadas como `tso-MZ`, aprovechando el ajuste fino específico para xichangana.
- Aplicaciones web de dictado sin servidor: al ejecutarse con `onnxruntime-web`, permite transcribir audio en el navegador del usuario sin enviar datos a un backend, lo que reduce costes de infraestructura y mejora la privacidad.
- Archivado y documentación de lengua de bajos recursos: útil para digitalizar corpus orales en tsonga y preservar material lingüístico con transcripciones automáticas revisables.
- Subtitulado asistido de contenido audiovisual en xichangana: la salida CTC a nivel de trama (20 ms) permite alinear texto con audio para generar subtítulos preliminares.
- Herramientas educativas y de accesibilidad: integración en aplicaciones de aprendizaje de la lengua o de accesibilidad para hablantes de tsonga, ejecutándose localmente en dispositivos modestos.
- Prototipado rápido con transformers.js: sirve como base para experimentar con pipelines ASR en JavaScript/TypeScript sin montar infraestructura de GPU.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los del modelo original en fairseq2 sobre el conjunto de test:

| Metrica | Valor (modelo original fairseq2, test) |
|---|---|
| WER | 7,05 % |
| CER | 1,29 % |

No se han publicado resultados de benchmarks del modelo ONNX cuantizado en la información disponible. La model card incluye un marcador `PLACEHOLDER` en la sección de calidad, por lo que no hay cifras verificadas para la versión int8. Tampoco se ofrecen comparaciones con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el archivo ONNX ocupa en torno a 1 GB, por lo que la memoria necesaria para los pesos ronda ese orden de magnitud.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y WebAssembly.
- Cabe en GPU de consumo: previsiblemente sí por tamaño (~1 GB), aunque no se documenta soporte ni rendimiento en GPU.
- Opciones de despliegue: `onnxruntime-web` (navegador) y `onnxruntime` (CPU); también puede cargarse vía `transformers.js`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este pipeline ASR).
- Latencia y throughput: la model card indica que en wasm de un solo hilo se espera una velocidad inferior al tiempo real; no se aportan cifras concretas de latencia ni de RTF.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia contextual, el modelo base del que deriva es `omniASR_CTC_1B_v2` de Meta, y el checkpoint original sin exportar es `felerminoali/omniASR-CTC-1B-v2-xichangana`; no obstante, no se han encontrado en la información disponible datos de rendimiento, contexto ni licencia de alternativas ASR para xichangana que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| omniASR-CTC-1B-v2-xichangana-onnx (este) | ~1B | no disponible | Apache 2.0 | ONNX int8 | Exportación para navegador |
| omniASR-CTC-1B-v2-xichangana (original) | ~1B | no disponible | no disponible | fairseq2 | Modelo base del que deriva |
| Alternativas ASR para tsonga | no disponible | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- El modelo solo cubre xichangana/tsonga (`ts`); no es multilingüe y no debe esperarse buen rendimiento en otras lenguas.
- La versión int8 puede degradar la precisión respecto al modelo original; la model card no publica WER/CER del modelo cuantizado (hay un `PLACEHOLDER`).
- En WebAssembly de un solo hilo la inferencia es más lenta que el tiempo real, lo que limita su uso en transcripción en directo.
- Riesgo de alucinación y errores de transcripción inherente a los sistemas CTC, especialmente con audio ruidoso, acentos no representados en el ajuste fino o vocabulario fuera de dominio.
- Sesgos no documentados: no se detalla la composición del dataset de ajuste fino, por lo que se desconocen sesgos de dominio, género o variantes dialectales.
- Requiere audio a 16 kHz mono normalizado (media cero, varianza unitaria); un preprocesado incorrecto degrada la salida.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Meta del que deriva.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felerminoali/omniASR-CTC-1B-v2-xichangana-onnx
- Modelo base (checkpoint original): https://huggingface.co/felerminoali/omniASR-CTC-1B-v2-xichangana
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales.
