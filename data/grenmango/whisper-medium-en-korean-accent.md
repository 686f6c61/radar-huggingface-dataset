# Grenmango/whisper-medium-en-korean-accent

## Resumen

`Grenmango/whisper-medium-en-korean-accent` es un ajuste fino de `openai/whisper-medium.en` orientado específicamente al reconocimiento de voz en inglés hablado con acento coreano. Lo publica el usuario Grenmango dentro de una colección de variantes por acento (vietnamita, árabe, chino, hindi, coreano y español) construidas sobre el mismo modelo base. El problema que aborda es el deterioro típico del WER de Whisper cuando el hablante es un L2 con transferencia fonética del coreano: el modelo declara reducir el WER relativo un ~34,5 % frente al modelo base en cero disparo sobre el mismo conjunto de evaluación.

Técnicamente no introduce arquitectura nueva: mantiene el encoder-decoder transformer de Whisper medium (763.856.896 parámetros, ~769 M), con entrada de espectrograma log-Mel de 80 canales a 16 kHz y ventanas de 30 segundos. La adaptación se hizo con LoRA (r=32, alpha=64) sobre las proyecciones de atención y las capas fully-connected, y los adaptadores se fusionaron permanentemente en los pesos base, de modo que el resultado es un modelo autónomo cargable con `transformers` sin `peft`.

Su relevancia es acotada pero concreta: es un artefacto de investigación para ASR de habla L2, útil en evaluación de pronunciación, transcripción de corpus acentuados y análisis de sesgo acústico. Conviene tener en cuenta que el repositorio tiene cero descargas y cero likes, solo ~4,1 horas de audio de entrenamiento procedentes de cuatro hablantes, y que la model card reporta el benchmark únicamente sobre lectura limpia, no sobre habla espontánea o ruidosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium, secuencia a secuencia con atención completa) |
| Parametros totales | 763.856.896 (~769 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 s por ventana de audio; audio largo mediante chunking (`chunk_length_s=30`) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos FP16 en safetensors) |
| Idiomas soportados | en (inglés). El modelo base es la variante monolingüe `.en` |
| Licencia | apache-2.0 (declarada por el autor; el modelo base de OpenAI se distribuye bajo licencia MIT) |
| Formato de pesos | safetensors, FP16 con adaptadores LoRA fusionados (tamaño de repo 1,5 GB) |
| Pipeline | automatic-speech-recognition |
| Entrada acústica | Espectrograma log-Mel de 80 canales, audio mono a 16 kHz |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium en su variante monolingüe: un encoder transformer que procesa el espectrograma log-Mel y un decoder autorregresivo que emite tokens de texto, con 24 capas de encoder y 24 de decoder y atención completa sobre ventanas de 30 segundos. No hay decodificación especulativa, atención lineal ni mecanismos híbridos SSM: es un ajuste fino convencional sobre los pesos de `openai/whisper-medium.en`.

El entrenamiento emplea Parameter-Efficient Fine-Tuning con LoRA de rango 32 y alpha 64, aplicado a `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`. Los datos proceden del subconjunto coreano del corpus L2-ARCTIC: 4.068 enunciados (~4,1 horas) de cuatro hablantes (HJK y YDCK femeninas, HKK y YKWK masculinos). No se documenta en la información disponible el uso de RLHF, DPO ni ninguna etapa de alineación posterior; el resultado se publica como pesos FP16 fusionados, compatibles con `WhisperForConditionalGeneration` estándar. La innovación es, por tanto, de alcance limitado: adaptación de dominio por acento mediante adaptadores de bajo rango.

## Capacidades

- Transcripción de voz a texto en inglés (`automatic-speech-recognition`) con salida de texto plano.
- Reconocimiento mejorado de inglés hablado con acento coreano (L1 coreano) en habla leída.
- Procesamiento de audio largo mediante segmentación en bloques de 30 segundos con la pipeline de `transformers`.
- Entrada estandarizada: remuestreo automático a 16 kHz y extracción de características log-Mel de 80 canales mediante `WhisperProcessor`.
- Carga directa sin dependencias adicionales: no requiere `peft` porque los adaptadores están fusionados.
- Ejecución en CPU o GPU (`device="cuda"` o `"cpu"`), con pesos en FP16.
- No soporta tool calling, function calling, agentes, visión, audio generation ni modo de razonamiento explícito: es un modelo puramente ASR.
- No traduce: la variante `.en` transcribe en inglés y no está capacitada para traducir audio coreano a inglés.
- Capacidad multilingüe: no disponible; únicamente inglés.

## Casos de uso

- Transcripción de reuniones con equipos coreanos que trabajan en inglés: el ajuste reduce el WER en hablantes con L1 coreano frente a `whisper-medium.en`, lo que disminuye el coste de corrección manual en actas y notas de reunión.
- Post-producción y subtitulado de contenido audiovisual: generación de subtítulos en inglés para vídeos con ponentes coreanos, procesando el audio por bloques de 30 segundos con `chunk_length_s=30`.
- Evaluación automática de pronunciación (CAPT): al estar entrenado sobre L2-ARCTIC, es un punto de partida razonable para medir inteligibilidad de aprendices coreanos de inglés comparando transcripciones automáticas con la referencia.
- Investigación en fonética y ASR L2: sirve como línea base controlada para estudiar el efecto del acento en errores de sustitución, dado que su único cambio respecto al base es el ajuste por acento.
- Anotación de corpus de habla acentuada: transcripción previa de grabaciones de hablantes coreanos para acelerar el etiquetado manual en proyectos de lingüística de corpus.
- Atención al cliente y centros de contacto con agentes o clientes coreanos: transcripción de llamadas en inglés para análisis de calidad, siempre que el audio sea razonablemente limpio y cercano al dominio de habla leída.
- Indexación y búsqueda sobre archivos de audio: conversión de un archivo histórico de grabaciones con acento coreano a texto indexable para búsqueda interna.
- Accesibilidad en tiempo real: subtitulado aproximado de sesiones o clases impartidas en inglés por hablantes coreanos, asumiendo latencia no publicada y necesidad de post-edición.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test` de L2-ARCTIC (subconjunto coreano), habla leída limpia:

| Modelo | WER (test) | CER (test) |
|---|---|---|
| whisper-medium-en-korean-accent (este modelo) | 4,84 % | 2,21 % |
| openai/whisper-medium.en (cero disparo) | 7,39 % | 3,50 % |
| openai/whisper-large-v3-turbo (cero disparo) | 6,26 % | 2,84 % |

El autor reporta una reducción relativa del WER de ~34,5 % frente a `whisper-medium.en` en cero disparo. No se han publicado en la información disponible resultados en otros conjuntos (Common Voice, LibriSpeech, habla espontánea, audio con ruido), ni curvas de latencia o throughput.

## Requisitos de hardware

- Peso del modelo: 763.856.896 parámetros en FP16, aproximadamente 1,5 GB en disco, según el tamaño del repositorio.
- VRAM estimada para inferencia: del orden de 2 a 4 GB con lotes pequeños en FP16, dado el tamaño de pesos más las activaciones del encoder y la caché del decoder.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4060, RTX 4090); también es viable en CPU, con latencia mayor.
- GPU de datacenter recomendadas para procesamiento por lotes a gran escala: A100, H100, L40S o A10G, donde el cuello de botella real es el preprocesado de audio y el encadenado de ventanas, no la memoria.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` o con `WhisperForConditionalGeneration` y `device_map="auto"`; `text-generation-inference` y servidores compatibles con la API de `transformers`.
- Formatos alternativos (CTranslate2/faster-whisper, GGUF para whisper.cpp, ONNX): no disponibles en el repositorio; requerirían una conversión propia por parte del usuario.
- Latencia y throughput: no disponible. No se publican medidas de RTF ni de tokens por segundo en la información proporcionada.
- Nota práctica: `whisper-medium` es notablemente más lento que `whisper-small` y bastante más rápido que `whisper-large-v3`; para despliegues con muchos flujos concurrentes conviene medir el RTF en el hardware objetivo antes de dimensionar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | WER en el test coreano de L2-ARCTIC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-medium-en-korean-accent | ~769 M | 30 s | 4,84 % | apache-2.0 (declarada) | Hugging Face, safetensors FP16 |
| openai/whisper-medium.en | ~769 M | 30 s | 7,39 % (cero disparo) | MIT | Hugging Face, safetensors |
| openai/whisper-large-v3-turbo | ~809 M | 30 s | 6,26 % (cero disparo) | MIT | Hugging Face, safetensors |
| openai/whisper-small.en | ~244 M | 30 s | no disponible | MIT | Hugging Face, safetensors |

Lectura de la comparativa: el ajuste supera en el mismo test tanto al modelo base del que deriva como a `whisper-large-v3-turbo` en cero disparo, pero se trata de una comparación de dominio muy específico (habla leída de cuatro hablantes coreanos). No hay datos que permitan afirmar que esta ventaja se mantenga en habla espontánea, otros acentos o audio con ruido, donde un modelo mayor y multilingüe como `whisper-large-v3-turbo` suele ser más robusto.

## Limitaciones y advertencias

- Entrenamiento muy reducido: 4.068 enunciados y ~4,1 horas de audio de solo cuatro hablantes (dos mujeres y dos hombres). El riesgo de sobreajuste a las características vocales de esos hablantes es alto.
- Dominio estrecho: evaluación únicamente sobre habla leída limpia del split `test` de L2-ARCTIC. No hay evidencia publicada sobre habla espontánea, conversación telefónica, solapamiento de voces o ruido de fondo.
- Posible degradación en acentos no coreanos: el ajuste por LoRA puede desplazar los pesos hacia el acento objetivo y empeorar el rendimiento en inglés nativo u otros acentos. No se aportan datos que lo cuantifiquen.
- Solo inglés: el modelo base es la variante `.en`, por lo que no transcribe coreano ni traduce. No debe usarse como ASR multilingüe.
- Alucinación: como toda la familia Whisper, tiende a generar texto plausible en segmentos silenciosos, con ruido o con audio musical. Requiere umbrales de no-speech y revisión en producción.
- Sensibilidad al preprocesado: la entrada debe ser mono a 16 kHz; un remuestreo deficiente introduce errores no atribuibles al modelo.
- Licencia: el autor declara apache-2.0, pero el modelo deriva de pesos de OpenAI (`whisper-medium.en`), distribuidos bajo licencia MIT. Conviene verificar la compatibilidad antes de un uso comercial crítico.
- Madurez: repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo día (19 de septiembre de 2026). No hay validación independiente de los números reportados ni versiones posteriores.
- Los resultados de benchmark son autocertificados por el autor, sin protocolo de evaluación reproducible publicado en la model card.
- La búsqueda web asociada no devolvió documentación técnica, papers ni discusiones relevantes sobre el modelo; no existe literatura independiente que lo respalde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grenmango/whisper-medium-en-korean-accent
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Corpus L2-ARCTIC: https://psi.engr.tamu.edu/l2-arctic-corpus/
- Variante vietnamita: https://huggingface.co/Grenmango/whisper-medium-en-vi-accent
- Variante árabe: https://huggingface.co/Grenmango/whisper-medium-en-arabic-accent
- Variante china: https://huggingface.co/Grenmango/whisper-medium-en-chinese-accent
- Variante hindi: https://huggingface.co/Grenmango/whisper-medium-en-hindi-accent
- Variante española: https://huggingface.co/Grenmango/whisper-medium-en-spanish-accent
- Variante personalizada (HQTV): https://huggingface.co/Grenmango/whisper-medium-en-vi-hqtv-personalized

No se han encontrado papers, blogs técnicos, repositorios de código ni demos adicionales en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
