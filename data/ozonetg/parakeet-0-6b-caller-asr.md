# ozonetg/parakeet-0.6b-caller-asr

## Resumen

parakeet-0.6b-caller-asr es un ajuste fino (fine-tune) del modelo nvidia/parakeet-unified-en-0.6b, publicado por el usuario ozonetg, especializado en el reconocimiento de voz del lado del cliente (caller side) en llamadas telefónicas de 8 kHz en inglés estadounidense. El objetivo es mejorar la transcripción en audio de telefonía de banda estrecha, donde los modelos ASR generalistas pierden precisión por la compresión de banda y el ruido de línea. Según la model card, se trata del modelo de 0,6 B recomendado de la familia del autor.

El modelo conserva la arquitectura FastConformer del base: un codificador de 24 capas con 618,3 M de parámetros y un decodificador RNN-T, con soporte unificado para inferencia offline y streaming. Se ha entrenado sobre aproximadamente 345,5 horas de audio real de llamadas salientes (canal del cliente) segmentado en tramos de 0,3 a 20 segundos, con transcripciones generadas automáticamente por Qwen3-ASR-1.7B, sin transcripción humana.

Su relevancia práctica está en el dominio de contact center: reduce el WER agregado en cinco conjuntos públicos de llamadas telefónicas al 9,89 %, frente al 14,00 % del sistema previo basado en un modelo de aproximadamente 110 M con adaptador de dominio y al 11,80 % del base de 0,6 B sin tocar. En llamadas retenidas dentro del dominio alcanza un 1,95 % de WER. La licencia es la NVIDIA Open Model License y los pesos se distribuyen en formato .nemo en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador de 24 capas) con decodificador RNN-T; base unificado offline + streaming |
| Parametros totales | 618,3 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrenado con segmentos de audio de 0,3 a 20 s) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | .nemo (bfloat16), fichero parakeet-0.6b-caller-asr.nemo |

## Arquitectura y entrenamiento

El modelo parte de nvidia/parakeet-unified-en-0.6b, un sistema ASR con codificador FastConformer de 24 capas y 618,3 M de parámetros acoplado a un decodificador RNN-T. La decodificación empleada en las evaluaciones declaradas es greedy RNN-T. El modelo base es unificado, lo que le permite operar tanto en modo offline como en streaming. La entrada esperada es audio mono a 16 kHz en coma flotante; para telefonía de 8 kHz hay que remuestrear la señal a 16 kHz antes de alimentar el modelo. La salida es texto en inglés con puntuación y mayúsculas. El framework requerido es NeMo 3.0, ya que la model card indica que el modelo base no compila en NeMo 2.5.x.

El ajuste fino se hizo en dos etapas. Primero, un entrenamiento con decaimiento de la tasa de aprendizaje por capa (layer-wise learning-rate decay de 0,9), de modo que la capa más baja entrena a aproximadamente 0,08 veces la tasa de la capa superior, preservando las capas acústicas generales. Segundo, una mezcla de pesos estilo WiSE-FT: 0,8 × pesos ajustados + 0,2 × pesos del base sin tocar, con el coeficiente elegido sobre datos de desarrollo entre 0,6, 0,7 y 0,8. Los datos de entrenamiento son el canal del cliente de llamadas salientes de ventas en EE. UU., 8 kHz mono, procedentes de cinco fuentes internas grabadas entre 2025 y 2026, con 504.617 segmentos (345,5 h). Un 5 % son segmentos sin habla (ruido de línea, silencio, espera, respiración) con objetivo vacío, y alrededor de un 1 % son saludos de buzón de voz o avisos de IVR captados en la línea del cliente. Las etiquetas provienen de transcripciones automáticas de Qwen3-ASR-1.7B, sin intervención humana.

## Capacidades

- Reconocimiento de voz en inglés sobre audio telefónico de banda estrecha (8 kHz) del canal del cliente, con remuestreo a 16 kHz en la entrada.
- Transcripción con puntuación y mayúsculas en la salida.
- Inferencia unificada en modo offline y en modo streaming, heredada del modelo base.
- Robustez ante segmentos sin habla: se entrenó con un 5 % de segmentos sin habla con objetivo vacío para que el modelo permanezca en silencio.
- Manejo de avisos de IVR y saludos de buzón de voz captados en la línea del cliente (aproximadamente el 1 % del corpus de entrenamiento).
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidades multilingües: no disponibles; el modelo solo soporta inglés.
- No se declaran capacidades de visión ni de audio más allá del reconocimiento de voz en banda telefónica.

## Casos de uso

- Transcripción de llamadas de venta saliente: el modelo está ajustado específicamente con el canal del cliente de llamadas outbound de EE. UU., por lo que transcribe la voz del interlocutor con un WER agregado del 9,89 % en cinco conjuntos públicos de telefonía.
- Analítica de contact center: al reducir el WER del 14,00 % (sistema previo con modelo de ~110 M y adaptador) al 9,89 %, mejora la fiabilidad de métricas derivadas como detección de intención, extracción de entidades y análisis de sentimiento sobre transcripciones.
- Cumplimiento y auditoría de llamadas: la transcripción con puntuación y mayúsculas facilita la revisión posterior y el archivo buscable de conversaciones, con especial buen comportamiento en llamadas retenidas del dominio (1,95 % de WER).
- Supervisión de calidad en tiempo real: el modo streaming del modelo base permite transcripción incremental durante la llamada para sistemas de ayuda al agente.
- Detección de buzones de voz e IVR: el entrenamiento incluye aproximadamente un 1 % de saludos de buzón y avisos de IVR, lo que ayuda a distinguir una contestación automática de una persona.
- Filtrado de silencio y ruido de línea: los segmentos sin habla con objetivo vacío enseñan al modelo a no generar texto espurio en tramos de espera o respiración.
- Evaluación de canales de adquisición: la transcripción a escala de llamadas salientes permite medir tasas de conversión por argumentario, siempre que se asuma el sesgo de dominio hacia ventas outbound en EE. UU.

## Benchmarks y rendimiento

Los siguientes resultados (WER en porcentaje) figuran en el model-index de la model card. Todos están marcados como no verificados (verified: false): son datos declarados por el autor.

| Conjunto de evaluacion | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 1,72 |
| LibriSpeech test-other (8 kHz) | 3,61 |
| LibriSpeech test-clean | 1,62 |
| LibriSpeech test-other | 3,18 |
| CallHome English (test) | 10,54 |
| CallFriend English (dev) | 16,44 |
| HarperValley Bank (canal del cliente) | 4,05 |
| Let's Go (referencias reescritas) | 16,82 |
| AppTek call-center dialogues, clientes de EE. UU. | 7,32 |
| Switchboard (subconjunto de 3.000 enunciados) | 8,29 |

Además, la model card declara un WER agregado del 9,89 % en cinco conjuntos públicos de llamadas telefónicas agrupados, frente al 14,00 % del sistema previo (modelo de ~110 M con adaptador de dominio) y el 11,80 % del base de 0,6 B sin ajustar. En llamadas retenidas dentro del dominio: 1,95 %, frente a 8,68 % del sistema previo y 4,73 % del base. En LibriSpeech test-other a 8 kHz el resultado es 3,61 % frente al 3,56 % de su base (+0,05 puntos porcentuales).

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 1,24 GB (618,3 M de parámetros × 2 bytes). Con estados del decodificador y memorias intermedias, la inferencia suele requerir en torno a 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo es cómodo en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares. El modelo es tan pequeno que no es necesario hardware de centro de datos para inferencia por lotes moderados.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU de consumo moderna con 4 GB o más de VRAM.
- Opciones de despliegue: NeMo 3.0 como requisito estricto (el base no compila en NeMo 2.5.x); exportacion a ONNX para runtimes alternativos; despliegue gestionado mediante NVIDIA Riva/NIM; servidores de inferencia con soporte de modelos NeMo.
- Latencia y throughput estimados: no disponible.
- Nota de entrada: el audio telefónico de 8 kHz debe remuestrearse a 16 kHz mono antes de alimentar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | WER agregado (telefonia) | WER en dominio retenido | Licencia |
|---|---|---|---|---|
| ozonetg/parakeet-0.6b-caller-asr | 618,3 M | 9,89 % | 1,95 % | NVIDIA Open Model License |
| nvidia/parakeet-unified-en-0.6b (base) | 618,3 M | 11,80 % | 4,73 % | NVIDIA Open Model License |
| Sistema previo: modelo de ~110 M con adaptador de dominio | ~110 M (segun la model card) | 14,00 % | 8,68 % | no disponible |

Las cifras provienen de la model card del autor. El fine-tune mantiene la precisión del base en LibriSpeech test-other a 8 kHz (3,61 % frente a 3,56 %, una diferencia de 0,05 puntos), algo que el autor describe como no inferior estadísticamente al base. Para comparaciones con otros sistemas ASR telefónicos (por ejemplo, Whisper o variantes de Conformer), no hay datos en la información disponible.

## Limitaciones y advertencias

- Idioma único: solo ingles; no hay soporte multilingue ni evaluación en otras lenguas.
- Dominio muy restringido: entrenado exclusivamente con el canal del cliente de llamadas salientes de ventas en EE. UU., 8 kHz mono, grabadas entre 2025 y 2026. El rendimiento fuera de ese dominio no está caracterizado.
- Solo canal del cliente: el modelo está ajustado para la voz del interlocutor, no para la del agente; no se declara comportamiento en mezclas de ambos canales.
- Etiquetas automáticas: las transcripciones de entrenamiento las generó Qwen3-ASR-1.7B sin revisión humana, por lo que los errores del profesor pueden haberse propagado al alumno.
- Riesgo de alucinación: aunque se entrenó con un 5 % de segmentos sin habla con objetivo vacío, en audio musical, ruido extremo o solapamiento de voces la salida puede contener texto inventado. La model card no declara tasas de inserción medidas.
- Sesgos: no hay análisis de sesgo por acento, edad, género ni variedad dialectal en la información disponible.
- Banda estrecha: pensado para 8 kHz remuestreado a 16 kHz; el rendimiento con audio de banda ancha no está documentado.
- Benchmarks no verificados: todos los resultados del model-index están marcados como verified: false y proceden del propio autor.
- Licencia: NVIDIA Open Model License, que impone condiciones de uso comercial distintas de las de una licencia permisiva tipo Apache 2.0 o MIT; conviene revisar el texto completo antes de un despliegue en producción.
- Framework: requiere NeMo 3.0; el modelo base no funciona en NeMo 2.5.x, lo que puede complicar la integración en pilas existentes.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
