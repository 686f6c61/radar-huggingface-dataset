# ozonetg/parakeet-0.6b-caller-asr-averaged

## Resumen

ozonetg/parakeet-0.6b-caller-asr-averaged es un ajuste fino del modelo de reconocimiento automático de voz nvidia/parakeet-unified-en-0.6b, especializado en el canal del cliente (caller) de llamadas telefónicas salientes en inglés estadounidense con audio de banda estrecha a 8 kHz. Lo publica el usuario ozonetg y su objetivo es sustituir a sistemas genéricos de ASR en entornos de contact center, donde la señal llega comprimida, con ruido de línea y solapamiento conversacional.

El modelo conserva la arquitectura del base: un codificador FastConformer de 24 capas con decodificador RNN-T, 618,3 millones de parámetros y pesos en bfloat16 dentro de un fichero .nemo. Se ha construido en dos pasos: primero promedia dos ejecuciones de la misma receta de ajuste fino que solo difieren en la semilla aleatoria, y después mezcla (WiSE-FT) el resultado con los pesos originales del base en proporción 0,7 / 0,3.

Su relevancia práctica está en la mejora medida sobre voz telefónica real: 9,87 % de WER agrupado en cinco conjuntos públicos de llamadas, frente al 11,80 % del base sin tocar y al 14,00 % del sistema que se usaba antes (un modelo de 110 M con un pequeño adaptador de dominio). En llamadas internas reservadas el WER baja al 1,85 %, frente al 4,73 % del base. El coste es un ligero empeoramiento fuera de dominio: 3,72 % frente a 3,56 % en LibriSpeech test-other a 8 kHz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador de 24 capas) con decodificador RNN-T; el base es un modelo unificado offline y streaming |
| Parámetros totales | 618,3 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; los segmentos de audio empleados en entrenamiento van de 0,3 a 20 s |
| Tipos de cuantización | no disponible; solo se publican pesos en bfloat16 dentro del fichero .nemo |
| Idiomas soportados | inglés (en), orientado a inglés estadounidense de llamada telefónica |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | .nemo (bfloat16) |
| Entrada | audio mono float a 16 kHz; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz |
| Salida | texto en inglés con puntuación y mayúsculas |
| Decodificación | RNN-T voraz (greedy) en todas las cifras publicadas |
| Framework | NeMo 3.0 (el modelo base no compila en NeMo 2.5.x) |
| Modelo base | nvidia/parakeet-unified-en-0.6b |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la del base: un codificador FastConformer de 24 capas y 618,3 millones de parámetros acoplado a un decodificador RNN-T, con soporte unificado para inferencia offline y en streaming. El ajuste no modifica la topología, solo los pesos. La receta consta de dos etapas: un promedio uniforme de dos ejecuciones de la receta de ajuste fino de 0,6 B que difieren únicamente en la semilla, seguido de una mezcla tipo WiSE-FT de 0,7 × el promedio + 0,3 × los pesos intactos del base.

Los datos de entrenamiento son 345,5 horas de audio real de llamadas salientes de venta en Estados Unidos, únicamente el canal del cliente, en mono a 8 kHz y procedentes de cinco fuentes internas grabadas entre 2025 y 2026. El conjunto de entrenamiento contiene 504.617 segmentos de entre 0,3 y 20 s; un 5 % son segmentos sin habla (ruido de línea, silencio, retención, respiración) con objetivo vacío, lo que enseña al modelo a permanecer en silencio, y alrededor de un 1 % son saludos de buzón de voz o mensajes de IVR captados en la línea del cliente. Las etiquetas son transcripciones automáticas generadas con Qwen3-ASR-1.7B, sin transcripción humana: cada segmento se contrastó con sistemas ASR independientes y se asignó peso 1,0 a los de acuerdo total (tier 1), 0,7 a los de acuerdo parcial (tier 2) y se descartó el resto. En cada lote, un 10 % de los datos proviene de Switchboard para preservar la capacidad conversacional general. No se documenta en la información disponible ninguna fase de RLHF ni de DPO.

## Capacidades

- Reconocimiento de voz en inglés estadounidense con salida puntuada y en mayúsculas, orientado a audio telefónico de banda estrecha (8 kHz).
- Transcripción del canal del cliente en llamadas salientes, con segmentos de 0,3 a 20 s.
- Manejo de tramos sin habla: el modelo tiende a devolver salida vacía en silencio, ruido de línea, retención y respiración, gracias al 5 % de segmentos no verbales del entrenamiento.
- Reconocimiento de mensajes de buzón de voz y avisos de IVR presentes en la línea del cliente.
- Inferencia en modo offline y en modo streaming, heredada del modelo base unificado.
- Conversación telefónica general: el 10 % de replay de Switchboard mantiene el rendimiento en diálogo espontáneo (8,25 % de WER en el subconjunto de 3.000 enunciados).
- Soporte de tool calling o function calling: no aplica, es un modelo ASR, no un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; el modelo declara únicamente inglés.
- Capacidades especiales: no dispone de modo de razonamiento, visión ni audio-vision; la salida es exclusivamente texto transcrito. La model card menciona que, antes de la puerta de confianza, el modelo produce más salidas del tipo «yes» en tramos sin habla.

## Casos de uso

- Transcripción de llamadas salientes de venta: el modelo está entrenado exclusivamente con el canal del cliente en llamadas de venta salientes en Estados Unidos, por lo que transcribe la voz del interlocutor sin necesidad de separación de hablantes aguas arriba.
- Analítica de contact center: al generar texto puntuado y en mayúsculas directamente, permite indexar y buscar en miles de llamadas para extraer motivos de llamada, objeciones y tasas de conversión sin una etapa adicional de restauración de formato.
- Control de calidad y cumplimiento normativo: la detección fiable de tramos sin habla (silencio, retención, buzón de voz) facilita auditar tiempos de espera reales y verificar la presencia de avisos de IVR en la línea del cliente.
- Enrutado y clasificación en tiempo real: el soporte de streaming del modelo base permite alimentar un clasificador de intención a medida que avanza la llamada, sin esperar a que termine.
- Diarización asistida en grabaciones de 8 kHz: al estar especializado en el canal del cliente, se puede combinar con un segundo sistema para el canal del agente y obtener una transcripción por turnos más limpia que la de un ASR genérico.
- Investigación en ASR telefónico: sirve como punto de referencia para técnicas de promediado de semillas y WiSE-FT sobre modelos FastConformer-RNNT, ya que el autor publica las cifras frente al base y frente al sistema anterior.
- Evaluación de calidad de transcripciones automáticas: dado que las etiquetas de entrenamiento son generadas por Qwen3-ASR-1.7B y verificadas por acuerdo entre sistemas, el modelo es útil para estudiar el sesgo que introduce el etiquetado sintético en dominios de voz telefónica.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (métricas no verificadas de forma independiente). Todos los valores son WER en porcentaje y con decodificación RNN-T voraz.

| Conjunto de evaluación | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 1,70 |
| LibriSpeech test-other (8 kHz) | 3,72 |
| LibriSpeech test-clean (banda completa) | 1,61 |
| LibriSpeech test-other (banda completa) | 3,31 |
| CallHome English (test) | 10,57 |
| CallFriend English (dev) | 16,35 |
| HarperValley Bank (canal del cliente) | 3,96 |
| Let's Go (referencias retranscritas) | 16,82 |
| AppTek call-center dialogues, clientes de EE. UU. | 7,28 |
| Switchboard (subconjunto de 3.000 enunciados) | 8,25 |

Comparación declarada por el autor frente al base sin ajustar y frente al sistema anterior (110 M con un adaptador de dominio):

| Evaluación | Este modelo | Base 0.6B sin tocar | Sistema anterior (110 M + adaptador) |
|---|---|---|---|
| Cinco conjuntos públicos de llamadas (agrupados) | 9,87 % | 11,80 % | 14,00 % |
| Llamadas internas reservadas (en dominio) | 1,85 % | 4,73 % | 8,68 % |
| LibriSpeech test-other a 8 kHz | 3,72 % | 3,56 % | no disponible |

## Requisitos de hardware

- Peso de los parámetros: 618,3 millones en bfloat16 equivalen a aproximadamente 1,24 GB, coherente con el tamaño del repositorio (1,2 GB).
- VRAM estimada para inferencia: del orden de 2 a 3 GB en bfloat16 contando pesos y activaciones (estimación propia a partir del número de parámetros, no publicada por el autor); alrededor de 2,5 GB si se cargan los pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria puede ejecutar la inferencia; una NVIDIA T4, L4, A10, RTX 3060 o superior es suficiente. Para procesamiento por lotes a gran escala tiene sentido una A100 o H100, sin que el autor publique cifras de throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM, dado el reducido tamaño del modelo.
- Opciones de despliegue: NeMo 3.0 es el framework indicado en la model card, y el formato de pesos es .nemo. No se documentan en la información disponible otras rutas de despliegue (vLLM, llama.cpp, Ollama o TGI no aplican a un modelo ASR de este tipo).
- Latencia y throughput: no disponible. No se publican cifras de RTF, latencia por segmento ni muestras por segundo.
- Nota de compatibilidad: el modelo base no compila en NeMo 2.5.x, por lo que hay que usar NeMo 3.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | WER en llamadas (5 conjuntos públicos, agrupados) | WER en dominio reservado | Licencia |
|---|---|---|---|---|---|
| ozonetg/parakeet-0.6b-caller-asr-averaged | 618,3 M | FastConformer + RNN-T | 9,87 % | 1,85 % | NVIDIA Open Model License |
| nvidia/parakeet-unified-en-0.6b | 618,3 M | FastConformer + RNN-T | 11,80 % | 4,73 % | NVIDIA Open Model License |
| Sistema anterior (110 M + adaptador de dominio) | 110 M (aproximado) | no disponible | 14,00 % | 8,68 % | no disponible |

No se dispone en la información proporcionada de comparativas frente a otras familias de ASR telefónico, como Whisper o modelos comerciales de transcripción, ni de datos de parámetros, contexto o licencia de esos sistemas. Se indica como no disponible.

## Limitaciones y advertencias

- Sesgo de dominio: el entrenamiento procede exclusivamente de llamadas salientes de venta en Estados Unidos y del canal del cliente. El rendimiento en llamadas entrantes, otros canales telefónicos o registros con condiciones acústicas distintas no está caracterizado.
- Idioma único: solo inglés. El autor no declara soporte de otros idiomas, ni siquiera de variedades no estadounidenses del inglés.
- Etiquetas generadas por máquina: las transcripciones de entrenamiento provienen de Qwen3-ASR-1.7B y no fueron revisadas por humanos, por lo que los errores sistemáticos de ese sistema pueden haberse transferido al modelo.
- Riesgo de alucinación en tramos sin habla: la model card advierte de un aumento de salidas del tipo «yes» en audio no verbal antes de aplicar la puerta de confianza, lo que exige un mecanismo de filtrado en producción.
- Degradación fuera de dominio: en LibriSpeech test-other a 8 kHz pierde 0,16 puntos porcentuales de WER frente al base (3,72 % frente a 3,56 %), y en conjuntos de conversación espontánea los WER son altos (16,35 % en CallFriend dev y 16,82 % en Let's Go).
- Formato de entrada: el audio debe entregarse en mono a 16 kHz, de modo que las llamadas de 8 kHz necesitan un remuestreo previo que puede afectar a la calidad.
- Restricciones de licencia: la NVIDIA Open Model License no es una licencia de código abierto al uso; conviene revisar sus términos antes de un uso comercial, especialmente en lo relativo a redistribución y a atribución. El repositorio declara `license: other` con nombre `nvidia-open-model-license`.
- Adopción y verificación: el modelo tiene 0 descargas y 0 «me gusta» en el momento de la consulta, y todas las métricas de la model card figuran como no verificadas de forma independiente. Las cifras de evaluación deben considerarse declaraciones del autor.
- Compatibilidad de framework: requiere NeMo 3.0; no funciona con NeMo 2.5.x según la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-averaged
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- No se han proporcionado en la información disponible otros enlaces a artículos, repositorios, demos o publicaciones técnicas.
