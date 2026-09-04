# diarray/parakeet-snalinlug-sc-lid

## Resumen

El modelo `parakeet-snalinlug-sc-lid` es un sistema de reconocimiento automático de voz (ASR) multilingüe desarrollado por diarray (Diarra Yacouba) para tres lenguas africanas de la familia Bantú: lingala (ln), luganda (lg) y shona (sn). Se trata de un artefacto de investigación que combina un codificador FastConformer de 17 capas con decodificadores híbridos RNN-T y CTC, más una pequeña cabeza de identificación de idioma (LID). Con 114,625,029 parámetros, el modelo es capaz de transcribir audio a 16 kHz sin puntuación y, de forma opcional, devolver el código ISO 639-3 del idioma detectado.

La relevancia del modelo radica en su enfoque hacia lenguas de bajos recursos, para las que existen pocos sistemas de ASR de calidad. La integración de la identificación de idioma en el propio modelo permite condicionar la transcripción sin necesidad de que el usuario proporcione la etiqueta de idioma: las probabilidades blandas de la cabeza LID se proyectan al espacio de características acústicas del codificador. El modelo se entrenó desde cero con una mezcla de conjuntos de datos públicos como WAXAL, FLEURS, SALT y Lingala 100hrs, y no parte de un checkpoint preentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (17 capas, hidden size 512) con decodificadores híbridos RNN-T y CTC, más cabeza LID de tres clases y proyección lenguaje-encoder |
| Parametros totales | 114,625,029 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Lingala (ln), luganda (lg), shona (sn) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | `.nemo` (NeMo 2.5.0) |

## Arquitectura y entrenamiento

La arquitectura se basa en un codificador FastConformer de 17 capas con tamaño de ocultación 512 y submuestreo por profundidad (depthwise-striding) con factor 8. El modelo utiliza un tokenizador SentencePiece de 1,024 tokens y dos decodificadores: uno principal RNN-T y otro auxiliar CTC. Además, incorpora una cabeza lineal de identificación de idioma de tres clases y una proyección que transfiere las probabilidades de idioma al espacio del codificador, de modo que la transcripción se condiciona a la predicción de idioma del propio modelo.

El entrenamiento se realizó con una función de pérdida combinada: RNN-T + 0.3 × CTC + 0.2 × pérdida LID ponderada. Los pesos de clase para LID son `[0.774524, 1.543837, 0.942376]` para `[lin, lug, sna]`, y la pérdida LID ponderada se introdujo en el experimento 3, que superó a los dos anteriores. El modelo se inicializó y entrenó desde la configuración proporcionada, en lugar de ajustarse a partir de un checkpoint preentrenado.

Los datos de entrenamiento incluyen: WAXAL (subconjuntos ASR de los tres idiomas y subconjunto TTS de luganda), Lingala 100hrs, FLEURS (para shona y luganda) y SALT (para luganda). Se descartaron las transcripciones con dígitos, se eliminó la puntuación, se convirtió el audio a mono de 16 kHz y se filtraron las muestras de WAXAL de menos de tres segundos. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación posterior al entrenamiento.

## Capacidades

- Reconocimiento automático de voz para lingala, luganda y shona, con transcripción sin puntuación.
- Identificación de idioma integrada: puede devolver el código ISO 639-3 predicho (por ejemplo, `lin`, `lug`, `sna`).
- Decodificación híbrida: permite seleccionar la rama CTC mediante el argumento `--decoder ctc` en la CLI del repositorio.
- Acondicionamiento por idioma: el modelo proyecta sus propias probabilidades de idioma al espacio acústico, evitando la necesidad de una etiqueta de idioma externa.
- Entrenado para audio mono de 16 kHz, con preprocesamiento estándar de NeMo.
- No es un modelo de lenguaje: no genera texto libre, no soporta tool calling ni razonamiento de múltiples pasos.

## Casos de uso

- Transcripción de reuniones en entornos multilingües: el modelo puede transcribir grabaciones de reuniones en lingala, luganda o shona sin necesidad de indicar el idioma de antemano, gracias a la cabeza LID. Su tamaño compacto (114.6M) permite ejecutarlo en hardware modesto.
- Subtitulado de vídeos educativos: para contenidos en estas lenguas, el modelo genera transcripciones que pueden usarse como base para subtítulos. La salida sin puntuación facilita un posprocesado posterior con herramientas de puntuación.
- Accesibilidad para personas con discapacidad auditiva: en combinación con un pipeline de segmentación de audio, puede producir subtítulos en tiempo casi real para emisiones o vídeos en estas lenguas.
- Investigación lingüística y documentación de lenguas en peligro: los hablantes de lingala, luganda y shona pueden usar el modelo para transcribir corpus orales, acelerando la anotación de datos para análisis fonético, morfológico o dialectológico.
- Análisis de llamadas de atención al cliente: en centros de contacto que atienden a hablantes de estas lenguas, el modelo transcribe llamadas y detecta el idioma, lo que permite enrutar la conversación y realizar análisis de calidad.
- Asistente de dictado por voz: integrado en una aplicación de dictado, permite a los hablantes de estas tres lenguas dictar texto sin necesidad de un modelo de lenguaje adicional, ya que la salida es texto sin puntuación.
- Evaluación de calidad de audio y entrenamiento de otros modelos: el modelo puede usarse como sistema de referencia para generar transcripciones automáticas que se empleen en la creación de conjuntos de datos de entrenamiento o en la evaluación de otros sistemas ASR.

## Benchmarks y rendimiento

Los resultados que se presentan a continuación son autoinformados por el autor del modelo y no han sido verificados de forma independiente.

| Evaluación | Resultado | Notas |
|---|---|---|
| Split público experimental del autor (WER) | 25.6% | Mezcla de fuentes públicas; no incluye el conjunto privado de Zindi |
| Mismo split, precisión de identificación de idioma | 100% | Solo para los tres idiomas objetivo |
| Comprobación humana nativa de lingala (5 muestras) | ~40% de las frases contenían al menos un error | Muestras privadas auto-grabadas; no es un WER formal |

La comprobación humana contó si una frase presentaba cualquier inserción, omisión o sustitución, y no debe compararse directamente con el WER a nivel de corpus. El autor indica que la alineación de referencia en partes de WAXAL es ruidosa, lo que puede distorsionar tanto el entrenamiento como las métricas.

## Requisitos de hardware

- VRAM estimada: con 114.6M parámetros, el modelo en FP32 ocupa aproximadamente 460 MB, y en FP16 unos 230 MB. Sumando activaciones y buffers de decodificación, para inferencia con lote pequeño se estima un uso de VRAM de 1 a 2 GB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3050, RTX 3060 o Tesla T4. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, el modelo es lo bastante pequeño para caber en tarjetas gráficas de gama baja y media.
- Opciones de despliegue: el modelo se carga mediante NeMo 2.5.0 y el repositorio asociado proporciona una CLI (`infer.py`) que acepta archivos `.wav` y devuelve JSON con texto y, opcionalmente, el idioma. No es compatible con vLLM, llama.cpp ni Ollama, al ser un modelo de audio.
- Latencia y throughput: no se han publicado mediciones oficiales. La latencia dependerá de la duración del audio, el hardware y el modo de decodificación (RNN-T o CTC).

## Comparativa con modelos similares

No disponible. La documentación proporcionada no incluye comparaciones con otros modelos ASR multilingües. El modelo es específico para tres lenguas y no se han publicado resultados comparativos frente a alternativas como Whisper o sistemas basados en wav2vec 2.0.

## Limitaciones y advertencias

- La alineación de referencia en partes de WAXAL es ruidosa, lo que puede afectar tanto al entrenamiento como a la evaluación del WER.
- El creador del modelo no habla los idiomas objetivo, por lo que la cobertura cualitativa es mínima y no ha validado dialectos ni variantes regionales.
- La comprobación humana es demasiado pequeña (5 muestras) para establecer la calidad real del modelo.
- La precisión perfecta de LID en un split construido artificialmente no implica robustez ante otros idiomas, code-switching, ruido o cambio de dominio.
- No existe una línea base sin LID ni una comparación controlada con otros métodos de ASR multilingüe.
- Las salidas pueden contener inserciones, omisiones, sustituciones y errores ortográficos.
- El modelo es un artefacto de investigación y no está validado para transcripciones de alto riesgo en contextos legales, médicos o de seguridad crítica.
- La licencia CC-BY-SA-4.0 permite el uso comercial con atribución, pero las adaptaciones derivadas deben compartirse bajo la misma licencia, lo que puede ser restrictivo en proyectos propietarios.
- La carga directa con NeMo 3.0.0 falla debido a la política de instanciación segura; se requiere el cargador de compatibilidad del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diarray/parakeet-snalinlug-sc-lid
- Repositorio de código, tokenizer y configuraciones: https://github.com/diarray-hub/parakeet-sc-lid
- Perfil del autor en HuggingFace: https://huggingface.co/diarray
- Dataset WAXAL: https://huggingface.co/datasets/google/WaxalNLP
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset SALT: https://huggingface.co/datasets/Sunbird/salt
- Dataset Lingala 100hrs: https://huggingface.co/datasets/KasuleTrevor/Lingala_100hrs
- Issue de NeMo sobre `boosting_tree` y decodificación estricta: https://github.com/NVIDIA-NeMo/Speech/issues/15658
