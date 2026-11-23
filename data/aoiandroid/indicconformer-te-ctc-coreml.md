# aoiandroid/indicconformer-te-ctc-coreml

## Resumen

IndicConformer_te_CTC es una conversión a Core ML del modelo de reconocimiento automático de voz (ASR) AI4Bharat IndicConformer, en su variante híbrida CTC/RNNT de tamaño *large* para telugu (`te`). El modelo original lo desarrolla AI4Bharat (IIT Madras) y esta versión la publica el usuario `aoiandroid` como artefacto listo para ejecución en el ecosistema Apple (Core ML), orientado al proyecto TranslateBlue. La conversión recorta la cabeza CTC a los tokens del telugu, integra el frontend log-mel en el propio grafo y fija una ventana de audio de 10 segundos.

El interés de esta ficha es acotado: no se trata de un modelo nuevo ni de un *checkpoint* entrenado desde cero, sino de un empaquetado para inferencia en dispositivos Apple. El repositorio pesa 0,2 GB y no declara licencia propia, aunque la model card atribuye licencia MIT al modelo de origen. No hay información publicada sobre pipeline, idiomas soportados en los metadatos de Hugging Face ni métricas de evaluación en esta conversión.

La relevancia práctica radica en que permite ejecutar un ASR *conformer* de calidad para telugu sin depender de Python/NeMo en producción, a cambio de perder flexibilidad (ventana fija de 10 s, salida CTC únicamente, sin RNNT). Para cualquier uso más allá de la inferencia en Apple, conviene acudir al modelo original de AI4Bharat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (transformer convolucional) con cabezas hibridas CTC/RNNT en el modelo original; esta conversion expone solo la cabeza CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio fija de 10 s por inferencia |
| Tipos de cuantizacion | no disponible (formato Core ML; el autor no detalla precision, p. ej. FP16/INT8) |
| Idiomas soportados | telugu (`te`) |
| Licencia | no declarada en el repo; la model card indica MIT para el modelo de origen (AI4Bharat) |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo de origen es un Conformer *large* de AI4Bharat con entrenamiento híbrido CTC + RNNT, un esquema habitual en NeMo para ASR multilingüe. La conversión documentada se realizó con NeMo 1.23.0 y coremltools 8.1 mediante el script `ic_coreml_convert.py`, y aplica tres transformaciones: (1) recorte de la cabeza CTC al vocabulario del telugu, (2) fusión del frontend log-mel dentro del grafo Core ML, de modo que el modelo consume audio y produce directamente la salida CTC, y (3) fijación de una ventana de 10 s.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de técnicas de aumento de datos o de ajuste fino adicional en esta conversión. Tampoco se detalla si la conversión preserva la cabeza RNNT (la model card sugiere que no) ni qué precisión numérica se empleó. Cualquier afirmación sobre calidad acústica o *word error rate* de esta variante Core ML requeriría una evaluación propia, que no se ha publicado.

## Capacidades

- Reconocimiento de voz (*speech-to-text*) en telugu a partir de audio de hasta 10 segundos por inferencia.
- Salida CTC (alineamientos por *frame*), adecuada para decodificación *greedy* o con un decodificador externo.
- Frontend log-mel integrado: no requiere un extractor de características separado en Python.
- Ejecución en el runtime de Core ML (macOS/iOS), potencialmente con aceleración por Neural Engine o GPU Apple según el *compute unit* configurado.
- No incluye tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente acústico.
- No soporta otros idiomas distintos del telugu en esta conversión.
- No se documentan capacidades de diarización, puntuación, *timestamps* a nivel de palabra ni traducción.

## Casos de uso

- **Transcripción de voz en apps iOS/macOS para telugu**: integración directa del `.mlpackage` en una app Swift, con captura de audio en fragmentos de 10 s y concatenación de hipótesis; adecuado porque elimina la dependencia de servidores y de Python.
- **Subtitulado local sin conexión**: procesamiento por turnos de audio de hasta 10 s para generar subtítulos en telugu en dispositivos Apple, útil en entornos con conectividad limitada o requisitos de privacidad.
- **Preprocesado de *pipelines* de datos**: transcripción masiva de grabaciones cortas en telugu en un Mac antes de alimentar sistemas de búsqueda o análisis; la ventana fija simplifica el troceado.
- **Prototipado de asistentes de voz**: uso del modelo como componente ASR en un asistente local, combinándolo con un LLM para la parte de comprensión y respuesta.
- **Evaluación comparativa de ASR en dispositivo**: referencia práctica para medir latencia y consumo en Apple Silicon frente a alternativas como Whisper o modelos de AI4Bharat en servidor.
- **Investigación en ASR de bajos recursos**: base para experimentos con decodificación CTC externa (por ejemplo, con un modelo de lenguaje n-gram) sobre telugu, sin reentrenar el acústico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM**: el repositorio ocupa 0,2 GB, lo que sugiere un modelo compacto tras la conversión; el consumo exacto en memoria unificada no está documentado.
- **GPU recomendadas**: no aplica en el sentido CUDA; el modelo está pensado para Apple Silicon (M1/M2/M3/M4) y, potencialmente, iPhone/iPad con Neural Engine.
- **GPU de consumo**: no se ha validado en GPUs NVIDIA; para ese hardware debería usarse el modelo original de AI4Bharat en NeMo.
- **Opciones de despliegue**: Core ML (Xcode, `coremltools`, Swift/Core ML API). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni distribuirse en GGUF.
- **Latencia y throughput**: no disponibles; dependerán del dispositivo, del *compute unit* (CPU/GPU/Neural Engine) y del tamaño efectivo del modelo tras la conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| IndicConformer_te_CTC (esta conversión) | no disponible | 10 s fijos | telugu | no declarada (origen MIT) | Core ML |
| `ai4bharat/indicconformer_stt_te_hybrid_ctc_rnnt_large` | no disponible | variable (NeMo) | telugu | MIT | NeMo (`.nemo`) |
| Whisper (OpenAI), variante *small/medium* | 244 M / 769 M | 30 s | multilingüe | MIT | PyTorch, GGUF, Core ML (conversiones de terceros) |
| Modelos ASR de AI4Bharat para otras lenguas indias | no disponible | variable | según variante | MIT | NeMo |

La comparación con Whisper es aproximada: Whisper cubre telugu de forma multilingüe, mientras que este modelo está especializado y limitado a una ventana más corta. No hay datos públicos que permitan comparar WER entre estas opciones en esta conversión concreta.

## Limitaciones y advertencias

- **Ventana fija de 10 s**: audios más largos requieren troceado manual, con riesgo de cortes en palabras y pérdida de contexto acústico.
- **Solo CTC**: al haberse eliminado la cabeza RNNT, se pierde parte de la capacidad del modelo original; la calidad puede diferir de la variante NeMo.
- **Idioma único**: únicamente telugu; no hay soporte multilingüe ni *code-switching* documentado.
- **Licencia ambigua**: el repositorio no declara licencia propia; la model card atribuye MIT al modelo de origen, pero conviene verificar los términos antes de uso comercial.
- **Riesgo de alucinación y errores de transcripción**: como todo ASR, puede producir hipótesis plausibles en audio ruidoso o con acentos no representados; no se han publicado evaluaciones de sesgo.
- **Sin métricas**: no hay WER, latencia ni comparativas publicadas para esta conversión, lo que dificulta su validación en producción.
- **Dependencia del ecosistema Apple**: no es portable a servidores Linux/NVIDIA sin volver al modelo original.
- **Mantenimiento incierto**: el repositorio tiene 0 descargas y 0 *likes*, lo que sugiere un artefacto personal sin soporte comunitario.

## Enlaces

- Hugging Face: https://huggingface.co/aoiandroid/indicconformer-te-ctc-coreml
- Modelo de origen: https://huggingface.co/ai4bharat/indicconformer_stt_te_hybrid_ctc_rnnt_large
- Repositorio de AI4Bharat (IndicConformer): no disponible en la información proporcionada
- Paper de IndicConformer: no disponible en la información proporcionada
- coremltools: no disponible en la información proporcionada
- NeMo: no disponible en la información proporcionada
