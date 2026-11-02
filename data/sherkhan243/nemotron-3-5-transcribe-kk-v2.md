# Sherkhan243/Nemotron-3.5-Transcribe-kk-v2

## Resumen

Nemotron-3.5-Transcribe-kk-v2 es un ajuste fino (fine-tune) especializado en reconocimiento automático de voz (ASR) para kazajo (қазақ тілі), desarrollado por el usuario Sherkhan243 sobre el modelo base NVIDIA Nemotron-3.5-Transcribe-30B-A4B. El modelo parte de un backbone híbrido Mamba-Transformer con arquitectura de mezcla de expertos (MoE) de aproximadamente 4.300 millones de parámetros activos sobre un total de 33.700 millones, y añade una rama de diarización Sortformer congelada y una cabeza CTC para marcas de tiempo a nivel de palabra.

El problema que resuelve es concreto: el kazajo no forma parte de los 40 idiomas soportados por el modelo base, que sin ajuste produce transliteraciones en turco o azerí, o directamente texto cirílico sin sentido (WER superior al 100 % en FLEURS kk). Tras un ajuste con aproximadamente 1.193 horas de voz en kazajo, el modelo transcribe con puntuación, mayúsculas y marcas de tiempo, alcanzando un WER normalizado del 8,51 % en FLEURS kk y del 14,34 % en KSC2.

Es relevante porque demuestra que un modelo de voz multilingüe de gran tamaño puede adaptarse a un idioma de bajos recursos mediante fine-tuning con LoRA, manteniendo capacidades auxiliares (timestamps, diarización) que los modelos ASR pequeños y específicos no ofrecen de forma integrada. El repositorio ocupa 135 GB y se distribuye en formato NeMo con pesos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer con mezcla de expertos (MoE), rama de diarización Sortformer congelada y cabeza CTC de timestamps |
| Parametros totales | 33.697.781.029 (≈33,7B) |
| Parametros activos | ≈4,3B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el repo contiene safetensors en precisión de entrenamiento) |
| Idiomas soportados | Kazajo (kk) |
| Licencia | OpenMDW 1.1 (openmdw-1.1, etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (formato NeMo, librería `nemo`) |
| Tarea | automatic-speech-recognition |
| Ajuste | LoRA sobre el modelo base |
| Datasets de entrenamiento | InflexionLab/ISSAI-KSC2-Structured, google/fleurs |
| Tamaño del repositorio | 135,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo hereda del base NVIDIA Nemotron-3.5-Transcribe-30B-A4B una columna vertebral híbrida que combina capas Mamba (modelo de espacio de estados) con capas Transformer, organizadas como mezcla de expertos con unos 4,3B de parámetros activos por token sobre 33,7B totales. Sobre esa columna se mantienen dos componentes auxiliares del modelo original: una rama de diarización Sortformer, que permanece congelada durante el ajuste, y una cabeza CTC que produce marcas de tiempo a nivel de palabra cuando se activa mediante el middleware `ctc_timestamp_middleware` y el parámetro `capture_ctc_timestamps`.

El ajuste se realizó con LoRA sobre aproximadamente 1.193 horas de voz en kazajo, combinando el corpus KSC2 estructurado (InflexionLab/ISSAI-KSC2-Structured) con FLEURS. La versión previa (kk_v1) se entrenó con solo 128 horas, y la comparación entre ambas muestra una mejora sustancial atribuible al aumento de datos: el WER en FLEURS kk baja de 10,98 % a 8,51 %, y en KSC2 de 21,61 % a 14,13 % (subconjunto estratificado). No se documenta en la información disponible el uso de RLHF, DPO ni otras etapas de alineación; la decodificación reportada es greedy.

## Capacidades

- Transcripción de voz en kazajo con puntuación y mayúsculas correctas, a diferencia del modelo base.
- Reconocimiento automático de voz (ASR) como tarea principal, con salida en texto normalizado.
- Marcas de tiempo a nivel de palabra (`ctc_timestamps`) con inicio y fin por palabra, activables por petición.
- Diarización de hablantes acústica mediante la rama Sortformer: segmentos con etiqueta de hablante y mapa de hablantes.
- Manejo de diálogos con 2 o 3 hablantes, incluyendo solapamiento de hasta 1 segundo.
- Robustez por dominio: mejor rendimiento en lectura y emisión (noticias, parlamento, lectura colaborativa) que en habla espontánea.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de visión o audio más allá del ASR.
- Capacidad multilingüe limitada al kazajo; el modelo base soporta 40 idiomas, pero este ajuste está especializado en kk.

## Casos de uso

- Subtitulado de informativos y programas de televisión en kazajo: con un WER del 8,6 % en el dominio de noticias y salida con puntuación y mayúsculas, el modelo genera subtítulos legibles que requieren poca corrección manual, y las marcas de tiempo por palabra permiten sincronizar los subtítulos con el audio.
- Transcripción de sesiones parlamentarias y actas oficiales: el dominio parlamentario alcanza un WER del 11,7 %, adecuado para generar borradores de actas que después revisa un taquígrafo, con la ventaja de que el texto sale capitalizado y puntuado.
- Generación de corpus textual a partir de archivos de radio: el dominio de radio presenta un WER del 20,9 %, por lo que el modelo sirve para indexación y búsqueda aproximada sobre el contenido, no para transcripción de publicación directa.
- Análisis de reuniones y entrevistas con múltiples participantes: la rama de diarización permite separar hablantes (DER del 11,3 % con 2 hablantes y del 14,0 % con 3) y asignar cada palabra a su hablante por marca temporal, útil para resúmenes y minería de conversaciones.
- Investigación lingüística y creación de datasets en kazajo: al producir texto normalizado con métricas reproducibles sobre FLEURS y KSC2, el modelo sirve como generador de transcripciones para anotación semiautomática de nuevos corpus.
- Sistemas de accesibilidad y búsqueda por voz: la transcripción con timestamps permite construir índices buscables sobre grabaciones largas y ofrecer navegación por fragmentos en aplicaciones de accesibilidad.
- Evaluación comparativa de ASR para lenguas túrquicas: el checkpoint es un punto de referencia útil para comparar modelos pequeños tipo CTC (GigaAM) frente a modelos generativos grandes en tareas de kazajo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). WER y CER en porcentaje, tras normalización (NFC, minúsculas, ё→е, eliminación de puntuación y símbolos), decodificación greedy.

| Dataset | Métrica | Valor |
|---|---|---|
| FLEURS (kk_kz, test) | WER normalizado | 8,51 |
| FLEURS (kk_kz, test) | CER normalizado | 2,22 |
| KSC2 (test, completo, 9.352 enunciados) | WER normalizado | 14,34 |
| KSC2 (test, completo) | CER normalizado | 4,60 |
| KSC2 (test, estratificado, 2.019 enunciados) | WER normalizado | 14,13 |
| KSC2 (test, estratificado) | CER normalizado | 4,48 |

Comparación con el modelo base y la versión previa:

| Modelo | FLEURS kk (WER/CER) | KSC2 completo (WER/CER) | KSC2 estratificado (WER/CER) |
|---|---|---|---|
| Base (sin ajuste) | 168,7 / 140,9 | — | 182,1 / 138,7 |
| kk_v1 (128 h) | 10,98 / 2,67 | — | 21,61 / 6,44 |
| kk_v2 (este modelo, 1.193 h) | 8,51 / 2,22 | 14,34 / 4,60 | 14,13 / 4,48 |

Desglose de KSC2 por dominio (WER %):

| Dominio | kk_v1 | kk_v2 |
|---|---|---|
| Noticias de televisión | 17,2 | 8,6 |
| Lectura colaborativa | 14,9 | 9,0 |
| Parlamento | 21,0 | 11,7 |
| Radio | 26,2 | 20,9 |
| Programas de debate | 33,1 | 23,5 |
| Pódcasts | 32,6 | 24,4 |

Diarización (30 diálogos sintéticos construidos con clips de test de KSC2):

| Configuración | DER % | Nº de hablantes correcto | Palabras dentro del segmento de su hablante | Etiquetas `<spk:k>` correctas |
|---|---|---|---|---|
| 2 hablantes | 11,3 | 90 % | 96 % | 10-20 % |
| 3 hablantes | 14,0 | 90 % | 90-91 % | 0 % |
| 2 hablantes con solapamiento | 12,3 | 100 % | 98-100 % | 20-30 % |

## Requisitos de hardware

- El repositorio ocupa 135 GB; cargar el modelo completo en precisión de entrenamiento requiere del orden de 135 GB de memoria agregada entre GPU y CPU, o bien sharding entre varias GPU.
- Con 33,7B de parámetros totales y 4,3B activos, la inferencia en BF16/FP16 exige GPUs de centro de datos: A100 de 80 GB, H100 de 80 GB o configuraciones multi-GPU. Con cuantización a 8 bits el peso se reduce aproximadamente a la mitad, pero el autor no publica recetas ni formatos cuantizados, por lo que la viabilidad en GPUs de consumo no está documentada.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en precisión completa; se requeriría cuantización agresiva no soportada oficialmente en el repositorio.
- Despliegue previsto con la librería NeMo y el servidor del modelo base, incluyendo el middleware `ctc_timestamp_middleware` para marcas de tiempo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Las cifras de los modelos alternativos proceden de sus respectivas model cards y no fueron reproducidas por el autor; los protocolos de test difieren (tamaño del split, normalización, filtrado), por lo que la comparación es orientativa.

| Modelo | Parámetros | WER FLEURS kk | WER KSC2 test | Notas |
|---|---|---|---|---|
| Este modelo (kk_v2) | 33,7B (4,3B activos) | 8,51 (7,48 con filtro GigaAM) | 14,34 (completo) | Puntuación y mayúsculas, timestamps, rama de diarización |
| ai-sage/GigaAM-Multilingual Large | 0,6B CTC | 4,4 | — | Mejor modelo abierto en FLEURS kk; salida en minúsculas |
| InflexionLab/VibeVoice-ASR-Kazakh | no disponible | — | ≈22 (completo) | Entrenado con los mismos datos KSC2-Structured |
| InflexionLab/sybyrla (Whisper-v3 FT) | 1,5B | — | ≈17,7 | — |
| nur-dev/Qwen3-ASR-0.6B-kk-ru-en | 0,6B | 17,8 | 20,4 | kk/ru/en |
| Whisper large-v3 (zero-shot) | 1,5B | 32,4 | — | — |

En resumen: en el dominio de KSC2 este modelo supera claramente a los fine-tunes publicados, mientras que en FLEURS el modelo CTC GigaAM, mucho más pequeño, sigue siendo más preciso. La elección depende de si se prioriza texto legible con puntuación, timestamps y atribución de hablante (este modelo) o transcripción barata en minúsculas (GigaAM).

## Limitaciones y advertencias

- El habla espontánea sigue siendo el punto débil: WER del 23,5 % en programas de debate y del 24,4 % en pódcasts, frente a cifras de un dígito en lectura y emisión.
- La diarización funciona a nivel acústico, pero las etiquetas de hablante dentro del texto generado no son fiables: el ajuste usó solo datos de un único hablante, por lo que el modelo suele emitir un único `<spk:0>` para toda la grabación. El cpWER calculado a partir de las etiquetas del transcript es alto. La solución documentada es asignar hablantes por tiempo, usando el segmento de diarización que contiene la marca temporal de cada palabra.
- El modelo está especializado exclusivamente en kazajo; no debe esperarse calidad en ruso, turco ni otros idiomas, pese a que el modelo base los soporte.
- Riesgo de alucinación y de transliteración en audio ruidoso, con acentos no vistos o con mezcla de idiomas; no se documentan evaluaciones específicas de este fenómeno.
- No se publican análisis de sesgos demográficos, de género o de variedades dialectales del kazajo.
- Licencia OpenMDW 1.1: es necesario revisar sus términos antes de un uso comercial, ya que la model card la etiqueta como "other" y las condiciones de explotación comercial no se detallan en la información disponible.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- No hay datos publicados de latencia, throughput ni recetas de cuantización, lo que dificulta planificar un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sherkhan243/Nemotron-3.5-Transcribe-kk-v2
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Dataset KSC2 estructurado: https://huggingface.co/datasets/InflexionLab/ISSAI-KSC2-Structured
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Modelo comparable GigaAM-Multilingual: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Modelo comparable VibeVoice-ASR-Kazakh: https://huggingface.co/InflexionLab/VibeVoice-ASR-Kazakh
- Modelo comparable sybyrla: https://huggingface.co/InflexionLab/sybyrla
- Modelo comparable Qwen3-ASR-0.6B-kk-ru-en: https://huggingface.co/nur-dev/Qwen3-ASR-0.6B-kk-ru-en
