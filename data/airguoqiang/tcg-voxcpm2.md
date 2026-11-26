# airguoqiang/TCG-VoxCPM2

## Resumen

TCG-VoxCPM2 es un modelo de síntesis de voz (text-to-speech) especializado en vocalizaciones no verbales, desarrollado por el usuario airguoqiang en el marco de un trabajo de investigación titulado *Where More Than Which: Distilling Tag-Contrastive Guidance for Non-Verbal Vocalizations*. El modelo parte del baseline VoxCPM2 (2B parámetros) de la NVVSpeech Challenge Track-2 y se afina para que el texto de entrada pueda incluir etiquetas como `[laugh]`, `[sigh]` o `[cough]` que el sistema vocaliza en la posición exacta donde aparecen, en mandarín e inglés.

La relevancia del modelo reside en el control fino de la prosodia no verbal: no se limita a decidir *qué* vocalización insertar, sino *dónde* insertarla dentro del flujo del habla, un problema menos explorado que la mera clasificación de etiquetas. Con 2.290.102.848 parámetros y un repositorio de 5,0 GB en formato safetensors, se distribuye a través de la librería `voxcpm` (versión 2.0.3) y admite clonación de voz mediante un clip de referencia corto.

Se trata de un modelo de nicho, orientado a investigación y a la competición NVVSpeech, con licencia NUITIVE restringida a uso no comercial. Su interés principal es para equipos que trabajen en habla expresiva, doblaje o agentes conversacionales que necesiten realismo paralingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de TTS basado en VoxCPM2; detalles internos no publicados en la información disponible) |
| Parametros totales | 2.290.102.848 (2,29 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | NUITIVE license, solo uso no comercial; los pesos upstream VoxCPM2 y Track-2 son Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | voxcpm 2.0.3 |
| Tamano del repositorio | 5,0 GB |
| Modelo base | NVVSpeech-Challenge/NVVSpeech-Challenge-Track2-Baseline (finetune) |
| Pipeline | text-to-speech |
| Etiquetas no verbales | `[breath]` `[sniff]` `[laugh]` `[cry]` `[cough]` `[throat clearing]` `[sneeze]` `[sigh]` `[gasp]` `[snore]` `[yawn]` `[hum]` `[moan]` `[hiss]` `[lipsmack]` `[burp]` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un sistema de TTS etiquetado como VoxCPM2 y afinado a partir del baseline de la NVVSpeech Challenge Track-2. El dato objetivo es el recuento de parámetros (2,29 B) y el formato de pesos safetensors. El nombre del paper asociado, *Where More Than Which: Distilling Tag-Contrastive Guidance for Non-Verbal Vocalizations*, sugiere una técnica de destilación con guiado contrastivo de etiquetas, orientada a mejorar la localización temporal de las vocalizaciones no verbales, pero no se especifican en la model card los detalles del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO.

El modelo hereda la base VoxCPM2 (Apache-2.0) y añade un ajuste fino supervisado para el manejo de etiquetas entre corchetes. La innovación declarada es el control posicional de la vocalización: la etiqueta se escribe en el texto y el modelo la emite en ese punto del flujo, en lugar de tratarla como una decisión global. No se documentan mecanismos de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Síntesis de voz en mandarín e inglés a partir de texto plano.
- Inserción controlada de 16 tipos de vocalizaciones no verbales mediante etiquetas entre corchetes (`[laugh]`, `[sigh]`, `[cough]`, `[breath]`, `[sneeze]`, `[yawn]`, `[burp]`, entre otras).
- Control posicional de la vocalización: la etiqueta se vocaliza en el lugar exacto donde aparece en el texto.
- Clonación de voz mediante un clip de referencia corto (`--ref_audio ref.wav`).
- Generación de audio en formato WAV a través del script `infer.py`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Doblaje y localización con realismo paralingüístico: insertar `[sigh]` o `[laugh]` en el guion para que el actor sintético respire o ría en el punto exacto de la frase, reduciendo el trabajo manual de edición de audio.
- Agentes conversacionales con expresividad: en un asistente de voz, generar respuestas con `[cough]` o `[breath]` para evitar una prosodia plana y mejorar la percepción de naturalidad en turnos largos.
- Audiolibros y narración: marcar `[yawn]`, `[sniff]` o `[hum]` en el texto fuente para que el narrador sintético incorpore gestos vocales coherentes con la escena.
- Contenido para videojuegos: generar líneas de personajes con vocalizaciones no verbales etiquetadas por el diseñador de diálogo, sin necesidad de grabaciones adicionales.
- Investigación en habla expresiva: servir como punto de partida para experimentos de control prosódico y evaluación de la localización temporal de vocalizaciones no verbales.
- Prototipado de accesibilidad: producir avisos de voz con énfasis no verbal (suspiros, respiraciones) para interfaces habladas, siempre en entornos no comerciales por la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 2,29 B parámetros en safetensors y un repositorio de 5,0 GB, una estimación razonable en fp16 ronda los 5-6 GB de pesos, más overhead de audio, pero no es un dato confirmado por el autor.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no confirmado; por tamaño de pesos, es plausible en GPUs con 8-12 GB de VRAM en fp16, pero no hay validación publicada.
- Opciones de despliegue: la única vía documentada es la librería `voxcpm==2.0.3` con el script `infer.py` y `soundfile`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| TCG-VoxCPM2 | 2,29 B | no disponible | zh, en | NUITIVE (no comercial) | Vocalizaciones no verbales etiquetadas y clonación de voz |
| NVVSpeech-Challenge-Track2-Baseline (VoxCPM2) | no disponible | no disponible | no disponible | Apache-2.0 | Modelo base del que se parte; sin el ajuste de etiquetas |
| Alternativas TTS open source de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Licencia NUITIVE limitada a uso no comercial; para uso comercial es necesario contactar con el autor (guoqiang002@e.ntu.edu.sg).
- Solo cubre chino e inglés; no hay soporte declarado de otras lenguas.
- El conjunto de etiquetas no verbales está cerrado a 16 categorías; etiquetas fuera de esa lista no están garantizadas.
- Riesgo de alucinación y de prosodia incorrecta en textos largos o con etiquetas mal posicionadas; no se documentan métricas de robustez.
- No se publican benchmarks, por lo que la calidad objetiva frente a alternativas no está cuantificada.
- El paper está anunciado como "coming soon" en arXiv; la metodología completa no es verificable todavía.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La licencia de los pesos upstream es Apache-2.0, pero la del ajuste fino es NUITIVE; conviene revisar `NOTICE` y `LICENSE-APACHE-2.0` antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/airguoqiang/TCG-VoxCPM2
- Repositorio de código: https://github.com/coding-sharks/TCG-VoxCPM2
- Demo de muestras de audio: https://coding-sharks.github.io/TCG-VoxCPM2-demo/
- Modelo base: https://huggingface.co/NVVSpeech-Challenge/NVVSpeech-Challenge-Track2-Baseline
- Paper: arXiv (anunciado como "coming soon", sin enlace disponible)
