# JeevanDai/nepali-asr-whisper-backup-2026-11-02

## Resumen

El modelo `JeevanDai/nepali-asr-whisper-backup-2026-11-02` es un ajuste fino de `openai/whisper-small` para reconocimiento automático del habla (ASR) en nepalí. Lo publica el usuario JeevanDai como artefacto de verificación de un corpus de datos, no como un modelo listo para producción. El repositorio tiene 0 descargas y 0 "likes", y la model card indica explícitamente que "no model was published" en el sentido de producto final: se trata de un experimento de validación de calidad del dataset `JeevanDai/ASR-Dataset-Collection`.

El objetivo declarado es comprobar si el corpus normalizado permite que un modelo Whisper-small aprenda y generalice a tres conjuntos de test externos. El ajuste se realizó sobre el checkpoint `openai/whisper-small@973afd24965f72e36ca33b3055d56a652f456b4d` durante 20.000 pasos de optimización con batch efectivo de 64, lo que supone unas 2,92 pasadas sobre los datos de entrenamiento elegibles. El mejor checkpoint fue `checkpoint-12000`, seleccionado por WER de validación del 30,42 %.

La relevancia es metodológica más que de producto: el autor documenta con detalle la reproducibilidad, las métricas por fuente y las discrepancias de transcripción, y deja claro que los resultados apoyan la usabilidad del corpus pero no certifican cada etiqueta ni demuestran causalmente que la limpieza haya producido la mejora. El modelo es de tamaño pequeño (arquitectura Whisper-small, 244 M de parámetros aproximadamente) y solo cubre nepalí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | no disponible (heredados de openai/whisper-small, aproximadamente 244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por clip; decodificación long-form para grabaciones más largas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato estándar de transformers; no confirmado explícitamente en la información) |

## Arquitectura y entrenamiento

Se parte de `openai/whisper-small`, un transformer encoder-decoder con atención estándar para ASR, y se realiza un ajuste fino completo (full fine-tuning) sobre el split normalizado publicado del dataset `JeevanDai/ASR-Dataset-Collection@b36e501cd47f791ac9c3ff742ec3fc55d71d8301`. El entrenamiento consta de 20.000 pasos de optimización con batch efectivo de 64, lo que equivale a aproximadamente 2,92 pasadas sobre las filas elegibles. La parada temprana seleccionó el `checkpoint-12000` tras cuatro evaluaciones posteriores sin mejora en WER de validación. El tiempo de optimización fue de 4,58 horas, con un pico de memoria GPU asignada de 22,25 GiB, y se conservaron diez checkpoints reanudables.

La decodificación exportada usa 5 haces (beams), elegidos únicamente sobre validación interna, no sobre los tests externos. El autor señala que esta elección empeoró ligeramente el WER en Bhatta respecto a decodificación greedy (30,47 % frente a 30,32 %) y mantiene el resultado sin reajustar sobre test. No se mencionan RLHF, DPO ni innovaciones arquitectónicas adicionales; se trata de un ajuste supervisado convencional con énfasis en verificación de artefactos (96 tests pasados, recarga en CPU, parámetros finitos, recálculo de WER/CER desde predicciones guardadas).

## Capacidades

- Reconocimiento automático del habla en nepalí para clips de hasta 30 segundos; para grabaciones más largas requiere la decodificación long-form de Whisper.
- Transcripción de audio a texto con salida de texto plano.
- Decodificación con beam search configurable (el export fija 5 haces).
- No se documentan capacidades de traducción, tool calling, agentes, visión, audio más allá de ASR ni multilingüismo fuera del nepalí.
- No se documenta modo de razonamiento (thinking mode) ni funciones especiales adicionales.

## Casos de uso

- Validación de calidad de corpus ASR: el modelo sirve como sonda para comprobar si un dataset normalizado de nepalí es aprendible y generaliza a tests externos (FLEURS ne, Bhatta, IndicVoices), tal como hace el autor.
- Transcripción de audio nepalí de dominio general: con WER de validación del 23,72 % y CER del 8,04 % sobre 9.510 clips, es adecuado para tareas de transcripción no críticas donde se tolere un error moderado.
- Preetiquetado de datos para anotación humana: las predicciones por utterance se conservan y pueden usarse como borrador para revisión manual, especialmente en fuentes con mayor error (Uttam Parajuli, 42,67 % WER).
- Investigación en ASR de bajos recursos: punto de partida reproducible para comparar estrategias de limpieza de datos, dado que el autor deja scripts, configuración y entorno bloqueado.
- Análisis de discrepancias ortográficas: el modelo permite detectar pares referencia/modelo (por ejemplo, हैन frente a होइन) que orientan revisiones de etiquetas.
- Evaluación comparativa de decodificadores: el export fija 5 haces y permite contrastar con greedy, como hace el autor en Bhatta.

## Benchmarks y rendimiento

| Test externo | n | WER preentrenado | WER ajustado greedy | WER decodificación seleccionada | CER seleccionado |
|---|---:|---:|---:|---:|---:|
| fleurs_ne_np_test | 726 | 151,19 % | 29,72 % | 28,64 % | 9,75 % |
| bhatta | 187 | 176,61 % | 30,32 % | 30,47 % | 6,87 % |
| indicvoices_nepali_valid | 2.829 | 278,41 % | 23,09 % | 21,86 % | 9,07 % |

Validación completa (9.510 clips): WER 23,72 %, CER 8,04 %. Desglose por fuente en validación con el decodificador seleccionado:

| Fuente | Clips de validación | WER | CER |
|---|---:|---:|---:|
| Bijaya-Khanal-CS-ASR | 132 | 31,83 % | 13,86 % |
| OpenSLR43-Nepali-TTS | 224 | 19,34 % | 3,69 % |
| OpenSLR54-Nepali-ASR | 4.093 | 16,98 % | 5,13 % |
| fleurs_ne_np | 267 | 23,39 % | 6,74 % |
| indicvoices_nepali | 2.289 | 19,43 % | 7,29 % |
| indicvoices_r_nepali | 773 | 19,19 % | 6,75 % |
| shrutilipi_nepali | 1.134 | 27,75 % | 7,02 % |
| uttam_parajuli_asr | 598 | 42,67 % | 19,34 % |

El autor advierte que el WER del modelo preentrenado supera el 100 % por inserciones y alucinaciones repetidas, y que los intervalos de confianza se calculan por bootstrap de utterances, no por clusters de hablantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 22,25 GiB de pico con batch efectivo 64, lo que da una referencia del orden de magnitud para ajuste fino, no para inferencia.
- GPU recomendadas: no disponibles en la información; por el tamaño de Whisper-small, la inferencia debería caber en GPUs consumer, pero no se confirma.
- Compatibilidad con GPU consumer: no confirmada en la información.
- Opciones de despliegue: pipeline de `transformers` con `automatic-speech-recognition` y `device=0`; el export incluye modelo, tokenizer y feature extractor y se recarga en CPU. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JeevanDai/nepali-asr-whisper-backup-2026-11-02 | no disponible (base Whisper-small) | audio de 30 s por clip | WER 23,72 % en validación propia; 21,86–30,47 % en tests externos | no disponible | Hugging Face, 0 descargas |
| openai/whisper-small (preentrenado) | no disponible (aprox. 244 M) | audio de 30 s por clip | WER 151,19–278,41 % en los mismos tests externos | no disponible en la información | Hugging Face |
| Alternativas ASR en nepalí | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos ASR específicos para nepalí en la documentación proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no certifica la corrección de cada transcripción ni demuestra causalmente que la limpieza del corpus haya producido la mejora; haría falta un entrenamiento pareado sobre datos sin limpiar.
- La separación de hablantes es limitada cuando faltan identificadores de hablante en la fuente.
- Los intervalos de confianza se calculan por bootstrap de utterances, no por clusters de hablantes, lo que puede subestimar la incertidumbre real.
- Fuentes con WER elevado (Uttam Parajuli 42,67 %, Bijaya-CS nepalí 31,83 %) requieren revisión auditiva dirigida antes de considerarlas limpias; el error puede deberse a ruido de etiqueta, dominio, dialecto, ortografía o limitaciones del modelo, sin que los scores permitan decidir cuál.
- El modelo preentrenado base muestra inserciones y alucinaciones repetidas; el ajuste las reduce pero no se documenta su eliminación total.
- Solo cubre nepalí; no hay soporte multilingüe documentado.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- El repositorio tiene 0 descargas y 0 "likes", y el autor lo describe como experimento de validación de dataset, no como modelo de producción.
- El tamaño del repo es de 0,0 GB según Hugging Face, lo que sugiere que los pesos podrían no estar efectivamente alojados o que la información está incompleta.
- La decodificación con 5 haces empeoró ligeramente Bhatta frente a greedy; el autor lo mantiene sin reajustar sobre test.

## Enlaces

- Hugging Face: https://huggingface.co/JeevanDai/nepali-asr-whisper-backup-2026-11-02
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset: https://huggingface.co/datasets/JeevanDai/ASR-Dataset-Collection
- Repositorio de artefactos (referenciado en la model card, no enlazado): `results/whisper-small-nepali/best_model`, `results/whisper-small-nepali/verified.json`, `scripts/train_whisper.py`, `configs/training/whisper_small_nepali.json`, `notebooks/training/02-whisper-full-nepali.ipynb`, `results/whisper-small-nepali/environment-lock.txt`
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
