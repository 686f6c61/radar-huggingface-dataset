# CrazyDipole/parakeet-tdt-0.6b-v3-coreai

## Resumen

Esta ficha describe una conversión del modelo de reconocimiento automático del habla (ASR) NVIDIA Parakeet TDT 0.6B v3 al runtime Apple Core AI, orientado a ejecución on-device en el Neural Engine de dispositivos Apple (iOS, iPadOS y macOS 27). El trabajo lo firma el usuario CrazyDipole y no está afiliado ni respaldado por NVIDIA; se distribuye bajo la misma licencia CC BY 4.0 del modelo original. La aportación principal es la reescritura del encoder FastConformer para que se ejecute íntegramente en el Neural Engine, junto con una cuantización por palettización a 6 bits de los pesos del encoder.

El modelo original es un transducer Token-and-Duration (TDT) con arquitectura FastConformer de aproximadamente 0,6 mil millones de parámetros, entrenado por NVIDIA para transcripción multilingüe en 25 idiomas europeas. Esta conversión conserva los pesos sin reentrenamiento y mantiene el decoder (LSTM) y la red joint en CPU, mientras que el encoder se divide en dos programas para evitar que el compilador on-device degrade bloques al GPU.

La relevancia práctica es el rendimiento: el bundle completo ocupa 484 MB frente a los 1,2 GB del export fp16 estándar, y en un iPad A16 transcribió una grabación de 66 minutos en 32 segundos (unas 123 veces tiempo real), frente a 103 segundos de la variante GPU palettizada. Es, por tanto, una opción interesante para transcripción local, privada y de bajo consumo en hardware Apple reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + transducer TDT (prediction network LSTM + joint network) |
| Parametros totales | no disponible (modelo base reportado como 0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana estática de 30 s de audio (3001 frames mel) por programa; el audio excedente se descarta silenciosamente |
| Tipos de cuantizacion | palettización 6 bits (k-means, group size 8 en el eje de salida) en pesos del encoder; decoder y joint densos; cómputo en fp16 |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk (25 idiomas) |
| Licencia | CC BY 4.0 (modelo); scripts en `recipe/` bajo MIT |
| Formato de pesos | programas Core AI (`.aimodel`), más `metadata.json` y ficheros de processor/tokenizer |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT con encoder FastConformer, una variante de Conformer con subsampling convolucional que reduce la secuencia de entrada y atención con codificación de posición relativa. La red de predicción es una LSTM y la red joint combina las representaciones del encoder y del predictor para emitir tokens y duraciones. El modelo original fue entrenado por NVIDIA; los detalles de datos de entrenamiento, número de tokens y composición del dataset están en la model card original y en el informe técnico arXiv 2509.14128, no reproducidos aquí.

Esta conversión no reentrena pesos. Las modificaciones son de formato y despliegue: el encoder se reescribe para el Neural Engine con layout BC1S, convoluciones 1x1 en lugar de capas lineales, BatchNorm plegado en las convoluciones depthwise, factores 1/sqrt(d) y 0.5 absorbidos en los pesos, atención relativa calculada a partir de la estructura seno/coseno de la codificación posicional (sin `rel_shift` ni gather), sesgo aditivo de padding de claves y SiLU en forma tanh. El encoder se parte en dos programas de 12 bloques cada uno (`encoder` y `encoder_tail`) porque, con 24 bloques en un único programa, el compilador on-device degradaba bloques al GPU. El decoder y el joint se mantienen densos y se ejecutan en CPU por su alta frecuencia de invocación.

## Capacidades

- Reconocimiento automático del habla multilingüe en 25 idiomas europeas.
- Transcripción de audio en ventanas de 30 segundos; el llamador debe segmentar audios más largos.
- Ejecución on-device en el Neural Engine de Apple, con decoder y joint en CPU.
- Modelo de pesos ligeros (484 MB) apto para despliegue en dispositivos con memoria limitada.
- No soporta tool calling, agentes, visión, audio de entrada más allá de la transcripción, ni modos de razonamiento extendido.
- No dispone de mecanismo de detección de idioma documentado en esta conversión; el idioma se infiere del audio según el modelo base.

## Casos de uso

- Transcripción de reuniones y clases en local: con ventana de 30 s y segmentación previa, el modelo procesa grabaciones largas en el dispositivo; en un iPad A16 una grabación de 66 minutos se transcribió en 32 s.
- Notas de voz y dictado en apps iOS/iPadOS: al ejecutarse en el Neural Engine, permite dictado continuo sin enviar audio a la nube, con la privacidad que eso implica.
- Subtitulado offline de vídeo: segmentando pistas de audio en bloques de 30 s y ejecutando el modelo por lotes en macOS, se pueden generar subtítulos en varios idiomas europeos sin conexión.
- Accesibilidad: transcripción en tiempo real de conversaciones presenciales para personas con discapacidad auditiva, aprovechando el bajo consumo del Neural Engine.
- Archivado y búsqueda de audio corporativo: transcripción masiva de grabaciones internas en estaciones Mac, con el modelo ejecutándose localmente y sin coste por API.
- Investigación en ASR: base para experimentos de cuantización y despliegue en hardware Apple, con la receta (`recipe/`) publicada para reproducir la conversión y adaptar el pipeline.
- Aplicaciones de campo sin conectividad: transcripción en dispositivos Apple en entornos sin red, donde no es viable depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible para esta conversión. Los únicos datos de rendimiento publicados son de velocidad:

| Metrica | Valor |
|---|---|
| Tamano del bundle | 484 MB (frente a 1,2 GB del export fp16 estándar) |
| Prueba en iPad A16 | 66 min de audio transcritos en 32 s (~123x tiempo real) |
| Variante GPU pal6 (`variants/gpu-pal6`) | 66 min de audio transcritos en 103 s |

Para cifras de precisión del modelo base, consultar la model card de NVIDIA y arXiv 2509.14128.

## Requisitos de hardware

- Hardware objetivo: dispositivos Apple con Neural Engine (iOS, iPadOS y macOS 27), según el runtime Core AI.
- VRAM/memoria: no disponible; el bundle ocupa 484 MB en disco y el encoder se reparte en dos programas de 237 MB y 234 MB.
- GPU: no aplica para la ruta principal; existe una variante `variants/gpu-pal6` para ejecución en GPU, más lenta en la prueba publicada.
- No cabe en GPUs consumer NVIDIA/AMD por diseño: el formato `.aimodel` es específico de Core AI.
- Despliegue: runtime Apple Core AI; la receta de conversión usa `apple/coreai-models` (commit `c8e00c01800ba6ad324707007f7af358efc980a4`) y `coreai-core` 1.0.0b3.
- Latencia y throughput: ~123x tiempo real en iPad A16 para audio de 66 minutos, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| CrazyDipole/parakeet-tdt-0.6b-v3-coreai | ~0.6B | 30 s por ventana | CC BY 4.0 | Core AI (`.aimodel`), Neural Engine | Palettizado 6 bits, bundle 484 MB, ~123x RT en iPad A16 |
| nvidia/parakeet-tdt-0.6b-v3 | ~0.6B | no disponible en esta ficha | CC BY 4.0 | PyTorch (NeMo) | Modelo original, export fp16 de 1,2 GB |
| Variante `variants/gpu-pal6` (mismo repo) | ~0.6B | 30 s por ventana | CC BY 4.0 | Core AI en GPU | 103 s para 66 min de audio en A16 |

No se dispone de datos de precisión comparada entre estas variantes ni con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- Esta conversión no es el modelo original y no está revisada ni respaldada por NVIDIA.
- La palettización a 6 bits y la aritmética fp16 en el Neural Engine alteran las salidas respecto al modelo original; no se han publicado métricas de degradación de WER.
- Ventana fija de 30 s: el audio que exceda la ventana se descarta silenciosamente si el llamador no segmenta correctamente.
- El decoder y el joint están pensados para CPU; forzarlos en acelerador puede degradar el rendimiento por sobrecarga de dispatch.
- Solo 25 idiomas europeas; el modelo base no cubre otras lenguas según la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución a NVIDIA y al autor de la conversión; los scripts de `recipe/` van bajo MIT.
- Riesgo de alucinación en ASR: como todo modelo de transcripción, puede producir texto plausible en segmentos con ruido o silencio.
- Sesgos: no documentados en esta conversión; consultar la model card original de NVIDIA.
- Dependencia de plataforma: el formato `.aimodel` solo es utilizable con el runtime Core AI de Apple, lo que limita la portabilidad.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/CrazyDipole/parakeet-tdt-0.6b-v3-coreai
- Modelo original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Informe técnico del modelo: https://arxiv.org/abs/2509.14128
- FastConformer: https://arxiv.org/abs/2305.05084
- Token-and-Duration Transducer: https://arxiv.org/abs/2304.06795
- Dataset Granary: https://arxiv.org/abs/2505.13404
- Herramientas de conversión de Apple: https://github.com/apple/coreai-models
