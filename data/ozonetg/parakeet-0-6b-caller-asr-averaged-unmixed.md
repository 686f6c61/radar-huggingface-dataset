# ozonetg/parakeet-0.6b-caller-asr-averaged-unmixed

## Resumen

parakeet-0.6b-caller-asr-averaged-unmixed es un modelo de reconocimiento automático del habla (ASR) en inglés especializado en el canal del cliente (caller) de llamadas telefónicas de 8 kHz. Lo publica el usuario ozonetg en HuggingFace como un ajuste fino de nvidia/parakeet-unified-en-0.6b, el modelo unificado offline y streaming de NVIDIA basado en un codificador FastConformer de 24 capas con decodificador RNN-T y 618,3 millones de parámetros.

El modelo es la media uniforme de dos ejecuciones del mismo recetario de ajuste fino que solo difieren en la semilla aleatoria (no es una mezcla con el modelo base). Se entrenó sobre unas 345,5 horas de audio real de llamadas salientes de ventas en Estados Unidos, con transcripciones generadas por máquina mediante Qwen3-ASR-1.7B. Aborda un problema muy concreto: la transcripción fiable del habla telefónica de banda estrecha, donde los sistemas genéricos degradan de forma notable.

Su relevancia es práctica y medible: reduce el WER agregado en cinco conjuntos públicos de llamadas telefónicas del 11,80 % del modelo base al 9,84 %, y en llamadas propias reservadas del 4,73 % al 1,85 %. Se distribuye en formato .nemo en bfloat16 bajo la NVIDIA Open Model License y requiere NeMo 3.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador de 24 capas) con decodificador RNN-T; el modelo base es unificado offline + streaming |
| Parámetros totales | 618,3 M |
| Longitud de contexto | no disponible (no aplica: modelo de ASR, no de contexto autoregresivo) |
| Tipos de cuantización | no disponible; pesos publicados en bfloat16 |
| Idiomas soportados | inglés (inglés estadounidense) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | .nemo (parakeet-0.6b-caller-asr-averaged-unmixed.nemo, bfloat16, ~1,2 GB) |
| Entrada | audio mono a 16 kHz en float; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz |
| Salida | texto en inglés con puntuación y mayúsculas |
| Decodificación | RNN-T voraz (greedy) |
| Framework | NeMo 3.0 (el modelo base no se construye en NeMo 2.5.x) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un codificador FastConformer de 24 capas que alimenta un decodificador RNN-T, con capacidad unificada para inferencia offline y en streaming. El ajuste fino se aplicó sobre el canal del cliente únicamente, es decir, la voz del interlocutor que llama, no la del agente. El modelo publicado es la media uniforme de dos ejecuciones del recetario 0.6B que solo difieren en la semilla aleatoria; una de ellas es parakeet-0.6b-caller-asr-basic. No hay mezcla con los pesos del modelo base, a diferencia de parakeet-0.6b-caller-asr-averaged, que es 0,7 × esta media + 0,3 × el base sin tocar.

Los datos de entrenamiento proceden de cinco fuentes internas de grabaciones de llamadas salientes de ventas en Estados Unidos, registradas entre 2025 y 2026, en mono a 8 kHz. El split de entrenamiento contiene 504.617 segmentos (345,5 horas), con segmentos de entre 0,3 y 20 segundos; un 5 % son segmentos sin habla (ruido de línea, silencio, espera, respiración) con objetivo vacío, lo que enseña al modelo a permanecer en silencio, y alrededor de un 1 % son saludos de buzón de voz o mensajes de IVR captados en la línea del cliente. Las etiquetas son transcripciones automáticas de Qwen3-ASR-1.7B; ninguna persona transcribió estos datos. Cada transcripción se contrastó con sistemas ASR independientes: los segmentos con coincidencia plena constituyen el nivel 1 (peso de pérdida 1,0) y los de coincidencia parcial se degradan a niveles inferiores. El ajuste fino se realizó sobre el canal del cliente, no sobre llamadas completas, y el modelo no se ha mezclado con el base.

## Capacidades

- Transcripción de voz a texto en inglés para audio telefónico de banda estrecha (8 kHz), incluida la voz del canal del cliente en llamadas salientes.
- Puntuación y capitalización automáticas en la salida de texto.
- Detección implícita de no habla: el entrenamiento con segmentos de objetivo vacío hace que el modelo tienda a no emitir texto en silencios, ruido de línea, música de espera o respiración.
- Manejo de mensajes de buzón de voz y prompts de IVR presentes en la línea del cliente.
- Inferencia unificada offline y en streaming, heredada del modelo base.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking), visión ni audio más allá de la transcripción.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado exclusivamente en inglés estadounidense.

## Casos de uso

- Transcripción de llamadas de venta saliente: el modelo está ajustado específicamente al canal del cliente de este tipo de llamadas, por lo que transcribe con un WER del 1,85 % en llamadas propias reservadas del mismo dominio, frente al 4,73 % del modelo base.
- Analítica de centros de contacto: permite indexar y buscar conversaciones por contenido, ya que el modelo cubre los conjuntos públicos de llamadas con WER entre el 3,94 % (HarperValley Bank, canal del cliente) y el 10,57 % (CallHome English).
- Control de calidad y cumplimiento: la detección de no habla y la salida con puntuación facilitan la generación de transcripciones limpias para auditoría de guiones y verificación de divulgaciones obligatorias.
- Enriquecimiento de CRM y resúmenes posteriores a la llamada: la transcripción sirve como entrada a un LLM que extraiga entidades, objeciones y resultados de la conversación.
- Sistemas de supervisión en streaming: al heredar el modo streaming del modelo base, puede alimentar paneles de agente en vivo sobre audio telefónico de 8 kHz remuestreado a 16 kHz.
- Detección de buzones de voz y IVR: el modelo se entrenó con un ~1 % de segmentos de este tipo, lo que permite enrutar automáticamente llamadas no atendidas por una persona.
- Procesamiento por lotes de grabaciones históricas: con 618,3 M de parámetros y pesos en bfloat16 (~1,2 GB), el coste de transcripción de archivos masivos es bajo en una GPU de consumo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Todos figuran como no verificados (verified: false).

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| LibriSpeech test-clean (8 kHz) | WER (%) | 1,82 |
| LibriSpeech test-other (8 kHz) | WER (%) | 4,01 |
| LibriSpeech test-clean | WER (%) | 1,70 |
| LibriSpeech test-other | WER (%) | 3,59 |
| CallHome English (test) | WER (%) | 10,57 |
| CallFriend English (dev) | WER (%) | 16,18 |
| HarperValley Bank (canal del cliente) | WER (%) | 3,94 |
| Let's Go (referencias reescritas) | WER (%) | 17,60 |
| AppTek call-center dialogues, clientes de EE. UU. (test) | WER (%) | 7,18 |
| Switchboard (subconjunto de 3.000 enunciados) | WER (%) | 7,57 |

Comparaciones agregadas aportadas por el autor, con decodificación RNN-T voraz:

| Sistema | WER agrupado en 5 conjuntos públicos de llamadas (%) | WER en llamadas propias reservadas (%) | LibriSpeech test-other a 8 kHz (%) |
|---|---|---|---|
| parakeet-0.6b-caller-asr-averaged-unmixed | 9,84 | 1,85 | 4,01 |
| nvidia/parakeet-unified-en-0.6b (base sin ajustar) | 11,80 | 4,73 | 3,56 |
| Sistema anterior (110 M + adaptador de dominio) | 14,00 | 8,68 | no disponible |

## Requisitos de hardware

- Pesos en bfloat16: 618,3 M de parámetros equivalen a aproximadamente 1,24 GB; el repositorio ocupa 1,2 GB.
- VRAM estimada para inferencia: del orden de 2 a 4 GB en bfloat16, incluyendo activaciones y buffers del decodificador RNN-T (estimación derivada del tamaño de parámetros, no publicada por el autor).
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090). No se han publicado requisitos oficiales.
- GPU recomendadas para producción de alto throughput: T4, L4, A10G, L40S, A100 o H100; el modelo base se sirve habitualmente en estas plataformas con NVIDIA Riva.
- Opciones de despliegue: NeMo 3.0 es el framework declarado y el modelo base no se construye en NeMo 2.5.x. La información proporcionada no indica soporte de vLLM, llama.cpp, Ollama ni TGI, y estas herramientas no cubren de forma habitual arquitecturas FastConformer/RNN-T; se recomienda verificar la exportación a ONNX o TensorRT a través de las utilidades de NeMo antes de integrarlo en producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER agrupado en llamadas públicas (%) | WER en llamadas propias reservadas (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| parakeet-0.6b-caller-asr-averaged-unmixed | 618,3 M | no aplica | 9,84 | 1,85 | NVIDIA Open Model License | HuggingFace (NeMo) |
| nvidia/parakeet-unified-en-0.6b | 618,3 M | no aplica | 11,80 | 4,73 | NVIDIA Open Model License | HuggingFace (NeMo) |
| ozonetg/parakeet-0.6b-caller-asr-basic | no disponible (mismo recetario 0.6B, una sola semilla) | no aplica | no disponible | no disponible | NVIDIA Open Model License | HuggingFace (NeMo) |
| ozonetg/parakeet-0.6b-caller-asr-averaged | no disponible (media 0,7 + base 0,3) | no aplica | no disponible | no disponible | NVIDIA Open Model License | HuggingFace (NeMo) |

No se han proporcionado resultados comparativos con otras familias públicas de ASR (Whisper, Conformer-Transducer, Wav2Vec 2.0) en la información disponible.

## Limitaciones y advertencias

- Cobertura de un solo canal: el modelo se entrenó únicamente con el canal del cliente, no con llamadas completas de dos canales; transcribir el canal del agente no es un caso de uso validado.
- Etiquetas generadas por máquina: las 345,5 horas de entrenamiento se etiquetaron con Qwen3-ASR-1.7B, sin transcripción humana. El modelo hereda los sesgos y errores sistemáticos de ese transcriptor.
- Dominio estrecho: el entrenamiento procede de llamadas salientes de ventas en Estados Unidos de 2025-2026, por lo que puede degradarse en otros dominios telefónicos (soporte técnico, emergencias, cobros) y en acentos no estadounidenses.
- Idioma único: solo inglés estadounidense; no hay soporte multilingüe ni de cambio de código.
- Frecuencia de muestreo: el audio de entrada debe entregarse a 16 kHz en mono; el audio telefónico de 8 kHz debe remuestrearse antes de la inferencia, lo que añade un paso de preprocesado.
- Degradación de la pérdida en audio limpio: frente al modelo base, empeora en LibriSpeech test-other a 8 kHz en 0,44 puntos porcentuales (4,01 % frente a 3,56 %).
- WER elevados en algunos conjuntos: 16,18 % en CallFriend English (dev), 17,60 % en Let's Go con referencias reescritas y 10,57 % en CallHome English, lo que refleja dominio y estilo de referencia distintos.
- Benchmarks sin verificar: todos los valores del model-index figuran como verified: false, sin reproducción independiente.
- Licencia: NVIDIA Open Model License; es una licencia propia con condiciones específicas de uso comercial y de redistribución que deben revisarse antes de desplegar en producción.
- Riesgo de alucinación: como todo sistema ASR, puede generar texto plausible en segmentos ruidosos o de habla solapada; el mecanismo de entrenamiento con objetivos vacíos reduce, pero no elimina, las emisiones espurias en no habla.
- Sin datos de latencia ni de throughput publicados para planificar dimensionamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-averaged-unmixed
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Variante con una sola semilla: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-basic
- Variante mezclada con el base (0,7/0,3): https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-averaged
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo; no se han encontrado papers, blogs ni demos adicionales en la información disponible.
