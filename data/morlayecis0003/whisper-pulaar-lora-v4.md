# morlayecis0003/whisper-pulaar-lora-v4

## Resumen

Whisper Pulaar LoRA v4 es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario morlayecis0003 sobre la familia Whisper de OpenAI, orientado al reconocimiento automático del habla (ASR) en pulaar (también llamado fulfulde), una lengua que no dispone de token propio en el tokenizador multilingüe de Whisper. El autor indica que el pulaar está ausente de las 112 lenguas cubiertas por Whisper, por lo que la adaptación se apoya en el token de idioma `ha` (hausa), seleccionado de forma empírica entre 11 configuraciones probadas. El repositorio pesa 0,0 GB según los metadatos de HuggingFace y se distribuye como adaptador PEFT en formato safetensors, no como pesos completos.

El modelo se construye sobre `morlayecis0003/whisper-small-pulaar-v4`, una variante ya ajustada de whisper-small, y por tanto hereda la arquitectura encoder-decoder transformer de Whisper small, con 244 millones de parámetros en la variante original de OpenAI y ventanas de audio de 30 segundos. El adaptador añade un número de parámetros entrenables que no se cuantifica en la información disponible.

Su relevancia es la de un recurso de código abierto para una lengua de bajos recursos: 28,4 horas de audio en pulaar tras limpieza, con eliminación de 3.643 ficheros WAV vacíos, deduplicación entre subcorpus y particiones construidas sin filtración de locutor ni de transcripción. La licencia Apache 2.0 permite uso comercial, aunque el autor advierte de que el corpus de entrenamiento contiene aproximadamente 10 locutores distintos, lo que limita la generalización a voces nuevas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper) con adaptador LoRA sobre el modelo base; arquitectura detallada del adaptador no disponible |
| Parámetros totales | 244 M en el modelo base whisper-small de OpenAI; parámetros del adaptador no disponibles |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la arquitectura Whisper procesa ventanas de audio de 30 s |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Pulaar/fulfulde como lengua objetivo (ASR); el autor lo describe como ausente de las 112 lenguas de Whisper y usa el token `ha` (hausa) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); pesos del modelo base no incluidos en este repositorio |
| Modelo base | morlayecis0003/whisper-small-pulaar-v4 |
| Librería | PEFT |
| Descargas / likes | 10 descargas, 0 likes |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación / actualización | 2026-09-20 (ambas marcas temporales, según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo PEFT montado sobre un checkpoint de Whisper small ya ajustado para pulaar. Whisper es un transformer encoder-decoder entrenado originalmente por OpenAI para transcripción y traducción de voz, con procesamiento por ventanas de 30 segundos y un vocabulario multilingüe de subpalabras. El ajuste mediante LoRA congela los pesos del modelo base e introduce matrices de bajo rango en determinadas capas, lo que reduce de forma drástica el número de parámetros entrenables y el tamaño del artefacto publicado. La información disponible no especifica el rango, los módulos objetivo ni el resto de hiperparámetros del adaptador.

Los datos de entrenamiento descritos por el autor consisten en 28,4 horas de habla en pulaar tras un proceso de limpieza que descartó 3.643 ficheros WAV vacíos, aplicó deduplicación entre subcorpus y construyó las particiones evitando tanto la filtración de locutor como la de transcripción. No se documentan en la información disponible el número de tokens de audio, la composición detallada del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla una innovación técnica adicional más allá de la propia adaptación LoRA y de la selección empírica del token de idioma `ha` como sustituto del token inexistente para pulaar.

## Capacidades

- Transcripción de voz a texto en pulaar (tarea `transcribe`, según el ejemplo de uso de la model card).
- Reconocimiento de habla en condiciones de bajos recursos, con un corpus de 28,4 horas de audio.
- Adaptación ligera sobre un modelo base ya ajustado, lo que permite desplegar el adaptador sobre el checkpoint `whisper-small-pulaar-v4` sin redistribuir pesos completos.
- Integración en el ecosistema HuggingFace Transformers y PEFT mediante `WhisperProcessor`, `WhisperForConditionalGeneration` y `PeftModel`.
- Capacidad potencial de traducción de voz a inglés, por herencia de la arquitectura Whisper; no documentada por el autor en la información disponible.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento. Se trata de un modelo específico de ASR.
- Capacidades multilingües: únicamente la lengua objetivo (pulaar/fulfulde) está documentada, con el token `ha` como control de idioma.

## Casos de uso

- Transcripción de radio comunitaria en pulaar: emisoras rurales del Sahel emiten en fulfulde y necesitan archivos de texto para sus servicios de podcast y archivo; el modelo procesa audio en ventanas de 30 segundos y evita depender de APIs comerciales que no cubren esta lengua.
- Subtitulado de contenido audiovisual para comunidades fulani: vídeos educativos, campañas sanitarias o materiales agrícolas pueden subtitularse automáticamente en pulaar antes de una revisión humana, dado el reducido coste computacional de un modelo de 244 M de parámetros.
- Digitalización de patrimonio oral: grabaciones de tradición oral, epopeyas y música con recitado pueden transcribirse para crear corpus textuales consultables, un uso habitual cuando no existen transcripciones previas.
- Preanotación de corpus para escalar el propio ASR: las transcripciones del modelo pueden servir como etiquetas débiles para revisión y corrección manual, reduciendo el coste de ampliar un corpus de pulaar más allá de los aproximadamente 10 locutores actuales.
- Asistentes de voz para servicios públicos en zonas de baja alfabetización: un front-end de reconocimiento en pulaar permite que un usuario formule consultas de salud, agricultura o trámites por voz, siempre que el resto del sistema gestione la respuesta.
- Telemedicina y atención remota: transcripción de consultas o mensajes de voz de pacientes en zonas rurales con conectividad limitada, donde un modelo pequeño desplegable en CPU o en una GPU de gama media resulta más viable que un modelo grande en la nube.
- Investigación lingüística y fonética: generación de transcripciones alineadas con audio para estudios de léxico, variación dialectal o morfología del fulfulde, reutilizando las particiones sin filtración de locutor descritas por el autor.
- Encuestas y proyectos humanitarios: conversión a texto de entrevistas de campo en pulaar para su posterior análisis cualitativo o codificación estadística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la generalización a voces nuevas "se mide por separado", pero no incluye cifras de WER, CER ni comparaciones con otros sistemas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas de ASR (LibriSpeech, Common Voice, FLEURS) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de la arquitectura base, un modelo whisper-small de 244 M de parámetros ocupa aproximadamente 0,5 GB de pesos en FP16, más memoria para activaciones y caché del decodificador; el adaptador LoRA añade un tamaño despreciable (el repositorio se reporta como 0,0 GB).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es compatible con GPUs de gama media y alta, incluidas RTX 3060, RTX 4070, RTX 4090, A100 y H100; no se documenta ningún requisito concreto por parte del autor.
- Viabilidad en GPU de consumo: sí, es esperable que quepa en cualquier GPU de consumo con al menos 4-6 GB de VRAM, y también en inferencia sobre CPU para lotes pequeños o procesamiento por turnos.
- Opciones de despliegue: el repositorio documenta únicamente el uso con `transformers` + `peft`. No se documentan vLLM, llama.cpp, Ollama, TGI, CTranslate2 ni faster-whisper; estas vías requerirían fusionar el adaptador con el modelo base y exportar el resultado, un procedimiento no descrito por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de esta tabla proceden de las fichas públicas de los modelos comparados y de la información de HuggingFace de este repositorio. No se han verificado ejecutando los modelos, y no se incluyen métricas de calidad porque no hay benchmarks publicados para el adaptador de pulaar.

| Modelo | Parámetros | Cobertura de pulaar | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| morlayecis0003/whisper-pulaar-lora-v4 | Adaptador LoRA sobre whisper-small (base de 244 M; tamaño del adaptador no disponible) | Específico para pulaar/fulfulde | Apache 2.0 | Safetensors (PEFT) | 28,4 h de entrenamiento, ~10 locutores; token de idioma `ha` |
| morlayecis0003/whisper-small-pulaar-v4 | 244 M (whisper-small) | Específico para pulaar/fulfulde | No disponible en la información proporcionada | No disponible | Modelo base declarado de este adaptador |
| openai/whisper-small | 244 M | No cubre pulaar entre sus 99/112 lenguas | Apache 2.0 | Safetensors, GGUF convertido por terceros | Referencia general de ASR multilingüe, sin ajuste para pulaar |
| facebook/mms-1b-all | 1.000 M | Cobertura declarada de más de 1.000 lenguas, entre ellas fulfulde | CC-BY-NC 4.0 (referencia pública no verificada en esta búsqueda) | Safetensors | Alternativa multilingüe de mayor tamaño y con licencia no comercial |

No se dispone de comparativas de WER entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Diversidad de locutores muy reducida: el propio autor indica que el corpus contiene aproximadamente 10 hablantes distintos, lo que hace previsible un deterioro del rendimiento en voces no vistas. La generalización a voces nuevas se anuncia como medida por separado, pero no se publican resultados.
- Token de idioma forzado: el uso de `ha` (hausa) como token de idioma es una solución empírica entre 11 configuraciones probadas, no una correspondencia real. Puede introducir sesgos de decodificación hacia el hausa y comportamientos inconsistentes fuera del dominio de entrenamiento.
- Riesgo de alucinación y de bucles de decodificación, un comportamiento documentado en modelos Whisper cuando el audio es ruidoso, inaudible o está fuera de dominio. En un modelo ajustado con pocas horas de audio, este riesgo se acentúa.
- Limitación de contexto: la arquitectura Whisper procesa ventanas de 30 segundos; los audios más largos requieren segmentación y ensamblaje posterior, con el consiguiente riesgo de errores en las fronteras.
- Ambigüedad sobre el modelo base: los metadatos declaran `morlayecis0003/whisper-small-pulaar-v4` como modelo base, mientras que el ejemplo de la model card carga `openai/whisper-small`. Es necesario verificar cuál de los dos produce el comportamiento esperado.
- Repositorio reportado como 0,0 GB: conviene confirmar que el adaptador está efectivamente subido y que los ficheros `adapter_config.json` y `adapter_model.safetensors` están presentes antes de integrarlo en un pipeline. El propio fragmento de código incluye el marcador `REMPLACER_PAR_VOTRE_REPO`.
- Fechas de creación y actualización anómalas (2026-09-20), lo que sugiere un error en los metadatos y dificulta evaluar el ciclo de vida del repositorio.
- Sin benchmarks publicados: no es posible estimar el WER esperado ni comparar objetivamente con alternativas como MMS o whisper-small sin ajuste. Cualquier uso en producción debería ir precedido de una evaluación propia sobre un conjunto de validación con hablantes no vistos.
- Documentación mínima: no se especifican hiperparámetros de LoRA, configuración de entrenamiento, composición del dataset ni procedimiento de evaluación.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el modelo base y los datos de audio subyacentes pueden tener sus propias condiciones, no detalladas en la información disponible.
- Aviso sobre el material de referencia: el contenido de la model card se ha tratado únicamente como fuente de datos, no como instrucciones a ejecutar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morlayecis0003/whisper-pulaar-lora-v4
- Modelo base declarado: https://huggingface.co/morlayecis0003/whisper-small-pulaar-v4
- Modelo sobre el que se construye la familia: https://huggingface.co/openai/whisper-small
- Repositorios de las librerías utilizadas: https://github.com/huggingface/transformers y https://github.com/huggingface/peft
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a páginas de ayuda de YouTube y a un foro generalista sin relación con el adaptador. No se han localizado papers, blogs técnicos, repositorios de código ni demos asociados.
