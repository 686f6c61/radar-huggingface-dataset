# adepusricharan/Demucs-v4

## Resumen

Demucs v4 (HTDemucs) es un modelo de separación de fuentes musicales: recibe una mezcla de audio y devuelve las pistas aisladas (batería, bajo, voz y "otros", y en la variante `htdemucs_6s` también guitarra y piano). El repositorio reseñado, `adepusricharan/Demucs-v4`, es una redistribución de los pesos y el pipeline de inferencia publicados originalmente por Meta AI (Facebook Research), empaquetada bajo la etiqueta `audio-to-audio` y licencia MIT. No es un modelo de lenguaje: no genera texto ni acepta prompts, sino que transforma una señal de audio en varias.

La arquitectura es híbrida: dos codificadores en paralelo, uno sobre la forma de onda cruda (dominio temporal) y otro sobre el espectrograma STFT (dominio frecuencial), conectados en el cuello de botella por un codificador Transformer con atención cruzada, con decodificadores que reconstruyen cada fuente. Esta combinación permite correlacionar rasgos temporales y espectrales antes de decodificar, lo que mejora la separación de instrumentos espectralmente complejos y temporalmente dispersos, como piano y guitarra.

Su relevancia práctica es doble: por un lado es el estado del arte abierto en separación musical (la familia Demucs ganó la Music Demixing Challenge 2021, según fuentes de terceros); por otro, su licencia MIT y su disponibilidad como paquete Python lo hacen directamente integrable en flujos de producción de música, postproducción de vídeo y herramientas de karaoke o remezcla. El repositorio ocupa 0,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer + U-Net convolucional: codificador temporal (forma de onda) y codificador espectral (STFT) en paralelo, unidos por un Transformer encoder con atención cruzada; decodificadores específicos por fuente |
| Parametros totales | no disponible (no se publica el recuento en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: modelo de audio; no se especifica ventana temporal máxima ni longitud de segmento en la información disponible |
| Tipos de cuantizacion | no disponible: el repositorio no publica variantes cuantizadas (INT8, FP16, GGUF, etc.); el pipeline oficial de Demucs opera con pesos en coma flotante |
| Idiomas soportados | no aplica: la separación de fuentes es independiente del idioma; no se declaran idiomas en la model card |
| Licencia | MIT |
| Formato de pesos | no confirmado en la información disponible; el repositorio ocupa 0,5 GB y el pipeline oficial de Demucs carga checkpoints PyTorch (.th). No se confirma la presencia de safetensors, GGUF u ONNX |

## Arquitectura y entrenamiento

HTDemucs se describe en el artículo *Hybrid Transformers for Music Source Separation* (Rouard et al., ICASSP 2023, arXiv:2211.08553). Frente a las generaciones anteriores de Demucs, que procesaban el audio únicamente en el dominio temporal, la v4 ejecuta dos codificadores en paralelo —uno sobre la forma de onda, otro sobre el espectrograma STFT— y los conecta en el cuello de botella mediante un Transformer encoder con atención cruzada. Los decodificadores, con convoluciones transpuestas e inicialización específica de pesos, reconstruyen cada fuente por separado. La base convolucional hereda el diseño U-Net de Wave-U-Net y SING, con unidades lineales con compuerta (GLU) y una BiLSTM entre codificador y decodificador en las variantes clásicas de Demucs.

La variante `htdemucs_6s` amplía la salida estándar de cuatro pistas (batería, bajo, otros, voz) con pistas dedicadas de guitarra y piano. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset, ni de si se aplicaron etapas de RLHF/DPO (no procede en un modelo de separación) o ajuste fino perceptual. Tampoco se detalla en este repositorio si los pesos son idénticos a los publicados por Meta AI o si han sido reconvertidos.

## Capacidades

- Separación de fuentes musicales en cuatro pistas (batería, bajo, otros, voz) con el modelo base HTDemucs.
- Separación en seis pistas (añade guitarra y piano) con la variante `htdemucs_6s`.
- Procesamiento conjunto en dominio temporal y frecuencial, lo que mejora la separación de instrumentos con contenido espectral complejo.
- Inferencia audio-a-audio: entrada de mezcla, salida de varias señales de audio alineadas en el tiempo.
- Uso como componente dentro de pipelines de producción musical (extracción de stems, remezcla, instrumentales y acapellas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo lingüístico.
- No se declaran capacidades de visión, audio-texto, transcripción ni generación musical.

## Casos de uso

- Producción de instrumentales y acapellas: extraer la pista de voz para publicar una versión instrumental o un karaoke; la separación en cuatro o seis stems permite conservar coros y armonías sin arrastrar la voz principal.
- Remezcla y edición en estudio: aislar batería o bajo para sustituir un sample, reajustar el groove o aplicar procesado independiente a cada stem sin re-grabar la mezcla original.
- Postproducción de vídeo y cine: separar diálogo y música de una banda sonora para sustituir el tema musical por una versión con licencia o para reducir la música bajo una locución.
- Limpieza de archivos históricos: recuperar stems aprovechables de grabaciones donde no se conservan las multipistas originales, posibilitando remasterizaciones parciales.
- Herramientas creativas y apps de consumo: integrar el modelo en una aplicación web o móvil que ofrezca "quita la voz" o "extrae la batería" al usuario final; el tamaño del repositorio (0,5 GB) y la licencia MIT facilitan su empaquetado.
- Investigación en procesamiento de audio: usar el modelo como línea base o como extractor de representaciones para tareas derivadas (detección de instrumentos, transcripción, evaluación de calidad de separación).
- Dataset engineering para MIR: generar versiones separadas de un corpus musical para aumentar datos de entrenamiento de modelos de transcripción o clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas objetivas (SDR, SIR, SAR, SI-SNR) ni comparaciones numéricas con otras versiones de Demucs. Como referencia cualitativa de terceros, fuentes externas citadas en la búsqueda web atribuyen a la familia Demucs la victoria en la Music Demixing Challenge 2021, pero sin cifras asociadas a este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como estimación a partir del tamaño del repositorio (0,5 GB de pesos), la inferencia en FP32 requiere del orden de 1 GB solo para los pesos, más memoria para activaciones y buffers de audio, que crecen con la duración del segmento procesado.
- GPU recomendadas: no hay recomendaciones del autor. Cualquier GPU con soporte CUDA y varios GB de VRAM es suficiente en la práctica; para lotes grandes o procesamiento por lotes de canciones completas conviene una GPU de datacenter (A100, H100) o una consumer de gama alta (RTX 4090, RTX 3090).
- Viabilidad en GPU de consumo: sí, previsiblemente en GPUs consumer con 6-8 GB o más, dado el reducido tamaño de los pesos; la limitación real será la duración del audio y el tamaño de segmento configurado.
- Opciones de despliegue: paquete oficial `demucs` (PyTorch) con CLI y API Python; exportación a TorchScript para servir sin el código de entrenamiento. No aplican vLLM, TGI, llama.cpp ni Ollama, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles para este repositorio. Un servicio de terceros (demucs.net) declara alrededor de un minuto por canción en GPU en la nube, sin especificar hardware ni duración de la pista, por lo que la cifra no debe tomarse como referencia de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Demucs v4 (HTDemucs, este repo) | no disponible | audio; ventana no especificada | Híbrido transformer tiempo-frecuencia | MIT | Pesos en HuggingFace, 0,5 GB |
| Demucs v3 | no disponible | audio | U-Net en dominio temporal con BiLSTM | MIT | Repo oficial de Meta AI |
| Spleeter (Deezer) | no disponible | audio | U-Net sobre espectrogramas | MIT | TensorFlow, repo de Deezer |
| Open-Unmix (UMX) | no disponible | audio | Red totalmente conectada sobre STFT | MIT | Repo de sigsep |
| MDX-Net | no disponible | audio | Redes convolucionales sobre espectrogramas | variable según checkpoint | Checkpoints comunitarios |

La comparación numérica de calidad (SDR por pista) no está disponible en la información proporcionada para ninguno de los modelos listados; las diferencias descritas en la documentación de Demucs se refieren a mejoras cualitativas del enfoque híbrido frente al dominio puramente temporal.

## Limitaciones y advertencias

- Ámbito restringido: es un modelo de separación de audio, no un LLM. No genera texto, no responde a instrucciones y no admite tool calling.
- Riesgo de artefactos: la separación introduce degradaciones audibles en pasajes densos o con instrumentos solapados espectralmente; la pista "otros" suele concentrar el material residual mal asignado.
- Alucinación en sentido acústico: el modelo puede generar contenido inexistente en la mezcla (por ejemplo, colas de reverberación sintéticas) o eliminar contenido real de una fuente.
- Idiomas: no aplica, pero el rendimiento puede degradarse en material no musical (voz hablada, field recordings) o en géneros poco representados en los datos de entrenamiento originales.
- Licencia: MIT permite uso comercial y modificación, pero el repositorio no incluye información sobre la procedencia y licencia del dataset de entrenamiento original ni sobre posibles reclamaciones de derechos sobre las grabaciones usadas; conviene verificar la cadena de licencias antes de un despliegue comercial.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, con fecha de creación indicada como 2026-10-24 (posterior a la fecha habitual de referencia), lo que aconseja contrastar la integridad de los pesos contra la publicación oficial de Meta AI antes de usarlos.
- Formato y compatibilidad no confirmados: no se especifica si los pesos están en safetensors, .th u otro formato, ni la versión exacta de `demucs` necesaria para cargarlos; puede requerir ajustes en el pipeline.
- Sin métricas publicadas: no hay benchmarks propios que permitan estimar la calidad real de esta redistribución frente a los pesos oficiales.
- Coste computacional creciente con la duración: pistas largas exigen segmentado y solapado, con impacto directo en latencia y memoria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/adepusricharan/Demucs-v4
- Repositorio oficial de Demucs (Meta AI): https://github.com/facebookresearch/demucs
- Artículo HTDemucs, ICASSP 2023: https://arxiv.org/abs/2211.08553
- Repositorio espejo/tercero: https://github.com/charzy/Demucs-v4-
- API de Demucs v4 (terceros): https://github.com/iBoostAI/demucs-api
- Servicio online basado en Demucs v4: https://demucs.net/
- Servicio online alternativo: https://demucs.danielfrg.com/
- Ficha de una implementación en Replicate: https://www.aimodels.fyi/models/replicate/demucs-ryan5453
