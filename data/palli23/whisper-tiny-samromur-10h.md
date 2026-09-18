# palli23/whisper-tiny-samromur-10h

## Resumen

whisper-tiny-samromur-10h es un ajuste fino del modelo Whisper-Tiny (unos 37,8 millones de parámetros según el peso real en safetensors) sobre un subconjunto anidado de 10 horas del corpus islandés Miljón/samromur-500h. Lo publica el usuario palli23 en Hugging Face como parte del conjunto de checkpoints de escalado del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027).

El problema que aborda es el reconocimiento automático del habla (ASR) en islandés, un idioma con pocos recursos y escasa representación en los corpus multilingües de gran escala. En lugar de entrenar un modelo gigante multilingüe, este checkpoint explora hasta dónde puede llegar un modelo pequeño (variante tiny) cuando se fine-tunea con datos específicos del idioma, sirviendo como punto de la curva de escalado de datos (10 h) que el paper compara frente a modelos multilingües mucho mayores.

Es relevante ahora para desarrolladores e investigadores interesados en ASR de bajo coste para lenguas minoritarias, y como referencia metodológica sobre eficiencia datos-parámetros. Se trata de un modelo de investigación con 20 descargas y ningún "like" en el momento de la consulta, orientado a transcripción de audio en islandés, no a uso general multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder con atención, variante "tiny") |
| Parámetros totales | 37.760.640 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; Whisper procesa audio en ventanas de 30 s con un límite de 448 tokens en el decodificador (característica estándar de la familia) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se anuncian versiones GGUF, int8 ni CTranslate2) |
| Idiomas soportados | islandés (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 4,7 GB (muy superior a lo esperable para 37,8 M de parámetros; probablemente incluye varios checkpoints o estados de entrenamiento) |
| Pipeline declarado en el Hub | no disponible |
| Corpus de entrenamiento | subconjunto anidado de 10 h de Miljón/samromur-500h |
| Contexto de publicación | conjunto de checkpoints de escalado del paper "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper en su variante tiny: un transformer encoder-decoder entrenado para mapear espectrogramas de audio (ventanas de 30 segundos, remuestreadas a 16 kHz) a secuencias de tokens de texto, con tokens especiales de idioma, tarea y marcas de tiempo. No hay innovaciones arquitectónicas propias documentadas: el checkpoint reutiliza la topología estándar de OpenAI y aplica un ajuste fino supervisado sobre ella.

En cuanto a los datos, el autor indica que el modelo se ha fine-tuneado sobre un subconjunto anidado de 10 horas extraído del pool de escalado principal Miljón/samromur-500h, un corpus de habla islandesa. La model card no detalla la composición exacta del subconjunto, la duración de los segmentos, la proporción de hablantes ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF, DPO u otro ajuste por preferencias, algo poco habitual en ASR. Los resultados de WER y CER se remiten explícitamente al paper asociado, por lo que no están disponibles en la información consultada.

## Capacidades

- Reconocimiento automático del habla (ASR) en islandés, con salida de transcripción de texto.
- Transcripción de audio en fragmentos de hasta 30 segundos por ventana, con encadenamiento de ventanas para audios más largos.
- Generación de marcas de tiempo a nivel de segmento, según el comportamiento estándar de la familia Whisper.
- Posible detección de idioma y tarea a través de los tokens especiales del decodificador de Whisper, aunque el ajuste fino está orientado a islandés y no se documenta su comportamiento multilingüe.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo "thinking", capacidades de visión, audio generation ni matemáticas.
- No se documentan capacidades multilingües más allá del islandés.

## Casos de uso

- Transcripción de archivos de audio en islandés para investigación lingüística: el modelo permite convertir grabaciones de campo o entrevistas a texto con un coste computacional mínimo, adecuado para proyectos académicos con presupuesto reducido.
- Generación de subtítulos para vídeo o pódcast en islandés: con ventanas de 30 s y marcas de tiempo, se puede integrar en un pipeline de segmentación y exportación a SRT/VTT.
- Evaluación de la curva de escalado datos-rendimiento: como checkpoint de 10 h de un conjunto de escalado, sirve para reproducir y comparar los resultados del paper frente a otros puntos de la curva.
- Prototipado rápido de interfaces de voz en islandés: al caber en CPU y en cualquier GPU consumer, permite iterar sobre la UX antes de invertir en un modelo mayor.
- Preprocesado de corpus orales para construir datasets de texto islandés: transcripción masiva de archivos de audio con verificación humana posterior.
- Investigación en destilación y ajuste eficiente: es un punto de partida barato para experimentar con destilación desde modelos Whisper mayores o con técnicas de adaptación de dominio.
- Transcripción en el borde (edge) o en dispositivos sin GPU: 37,8 M de parámetros permiten ejecución en tiempo real o mejor en CPU moderna, útil para aplicaciones de privacidad donde el audio no debe salir del dispositivo.
- Evaluación comparativa de corpus ASR islandeses: usar el mismo modelo base con distintos subconjuntos de Samrómur para medir el impacto del volumen y la composición de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite los valores de WER y CER al paper "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027), cuyo enlace no aparece en los resultados de búsqueda consultados. La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los enlaces recuperados corresponden al portal checo Seznam y no guardan relación con el modelo ni con ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 151 MB en fp32 (37,76 M × 4 bytes) y unos 76 MB en fp16, más el overhead de activaciones y buffers de audio (habitualmente unos cientos de MB en total).
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Tarjetas de gama baja como GTX 1050, T4 o incluso iGPU modernas pueden ejecutarlo.
- Cabe en GPU consumer: sí, en la práctica totalidad del mercado, incluidas GPU integradas y aceleradores tipo Jetson.
- Ejecución en CPU: viable para transcripción en tiempo real o más rápida que tiempo real con implementaciones optimizadas; no se dispone de cifras de latencia o throughput publicadas para este checkpoint concreto.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, faster-whisper (CTranslate2, requiere conversión previa), whisper.cpp (requiere conversión a GGUF), ONNX Runtime y Hugging Face Inference Endpoints. vLLM y TGI no son adecuados para esta tarea de ASR.
- Formato de cuantización: no se publican versiones cuantizadas; habría que generarlas a partir de los safetensors.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Ventana de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/whisper-tiny-samromur-10h | 37,76 M | islandés | 30 s (estándar Whisper) | cc-by-sa-4.0 | Hugging Face, 20 descargas |
| openai/whisper-tiny | ~39 M | multilingüe (familia Whisper) | 30 s | Apache-2.0 | Hugging Face, ampliamente desplegado |
| openai/whisper-base | ~74 M | multilingüe (familia Whisper) | 30 s | Apache-2.0 | Hugging Face, ampliamente desplegado |
| Otros checkpoints de escalado del mismo paper | no disponible | islandés | no disponible | no disponible | no disponible en la información proporcionada |

Los datos de las variantes de OpenAI corresponden al conocimiento público de la familia Whisper y no se han verificado en la información proporcionada; los valores de error (WER/CER) de este ajuste fino y de los modelos comparados no están disponibles, por lo que no se puede establecer una comparación de calidad. La diferencia clave frente a los checkpoints de OpenAI es la licencia: cc-by-sa-4.0 impone obligaciones de compartir igual, mientras que Apache-2.0 es más permisiva.

## Limitaciones y advertencias

- Licencia cc-by-sa-4.0: permite uso comercial, pero obliga a atribución y a distribuir cualquier obra derivada bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar su código o sus pesos.
- Restricción de idioma: el modelo está ajustado únicamente para islandés; su uso en otros idiomas no está soportado y previsiblemente dará resultados pobres.
- Tamaño muy reducido (variante tiny): la precisión esperable es notablemente inferior a la de variantes small, medium o large, especialmente en audio con ruido, solapamiento de hablantes o vocabulario técnico.
- Riesgo de alucinación: los modelos Whisper tienden a generar texto plausible en tramos de silencio, ruido o audio musical; es necesario aplicar umbrales de confianza o filtros posteriores en producción.
- Sin datos de evaluación publicados en la información consultada: no hay cifras de WER/CER que permitan estimar la calidad real del ajuste con 10 horas de datos.
- Repositorio de 4,7 GB para un modelo de 37,8 M de parámetros: conviene revisar qué contiene exactamente antes de descargarlo, ya que puede incluir checkpoints intermedios o estados del optimizador.
- Trazabilidad limitada: 20 descargas y ningún "like" en el momento de la consulta, sin pipeline declarado ni documentación sobre composición del subconjunto de entrenamiento, hablantes o condiciones de grabación.
- Fechas de creación y actualización en el Hub (2026) anómalas respecto a la fecha de consulta; conviene verificarlas antes de citar el modelo.
- Alucinaciones de marcas de tiempo: las marcas generadas por modelos Whisper pequeños son menos fiables que en variantes mayores, lo que afecta a la sincronización de subtítulos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palli23/whisper-tiny-samromur-10h
- Corpus de entrenamiento citado (Miljón/samromur-500h): referencia mencionada en la model card, sin enlace directo proporcionado
- Paper asociado, "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027): mencionado en la model card, sin enlace disponible en la información consultada
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en los resultados de búsqueda web disponibles.
