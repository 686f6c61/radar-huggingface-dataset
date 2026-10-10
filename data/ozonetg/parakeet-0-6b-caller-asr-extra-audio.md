# ozonetg/parakeet-0.6b-caller-asr-extra-audio

## Resumen

ozonetg/parakeet-0.6b-caller-asr-extra-audio es un ajuste fino del modelo de reconocimiento de voz NVIDIA nvidia/parakeet-unified-en-0.6b, especializado en el canal del cliente (caller) de llamadas telefonicas de ventas salientes en ingles de Estados Unidos, muestreadas a 8 kHz. Lo publica el usuario ozonetg sobre la libreria NeMo y conserva la arquitectura del original: encoder FastConformer de 24 capas con 618,3 millones de parametros y decodificador RNN-T, con decodificacion greedy.

El problema que aborda es concreto: el reconocimiento de habla telefonica de banda estrecha (8 kHz) en dominios de call center, donde los modelos genericos degradan notablemente. Segun la model card, el modelo reduce el WER agregado en cinco conjuntos publicos de llamadas al 10,06 %, frente al 14,00 % de un sistema previo de 110 M con adaptador de dominio y al 11,80 % del 0.6B base sin ajustar. En llamadas retenidas del mismo dominio baja al 2,10 %, frente al 8,68 % anterior y al 4,73 % del base.

Se construyo con una receta de noisy student en dos pasos sobre audio de llamadas salientes de EE. UU. grabado entre 2025 y 2026, con transcripciones automaticas generadas por Qwen3-ASR-1.7B. Es relevante porque muestra un caso realista de destilacion de datos no etiquetados mediante autoetiquetado y reentrenamiento desde el modelo base, con mejoras muy grandes en el dominio objetivo a costa de una degradacion pequena fuera de el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer (24 capas) con decodificador RNN-T; el modelo base es unificado offline + streaming |
| Parametros totales | 618,3 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR); segmentos de entrenamiento de 0,3 a 20 s |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en bfloat16 |
| Idiomas soportados | en (ingles de EE. UU.) |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | `.nemo` (NeMo), bfloat16 |
| Entrada | audio mono a 16 kHz en float; el audio telefonico de 8 kHz debe reescalarse a 16 kHz |
| Salida | texto en ingles con puntuacion y mayusculas |
| Decodificacion | greedy RNN-T |
| Framework | NeMo 3.0 (el modelo base no compila en NeMo 2.5.x) |
| Modelo base | nvidia/parakeet-unified-en-0.6b (fine-tune) |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder FastConformer de 24 capas acoplado a un decodificador RNN-T, con capacidad unificada offline y streaming en el original. El ajuste no cambia la topologia, solo los pesos. La entrada es audio mono remuestreado a 16 kHz, aunque el material de entrenamiento es telefonia de 8 kHz, y la salida incluye puntuacion y mayusculas. El autor especifica que el entrenamiento se realizo con NeMo 3.0 y que el modelo base no compila con NeMo 2.5.x.

El entrenamiento sigue una receta de noisy student en dos pasos. Primero, el ajuste previo parakeet-0.6b-caller-asr-basic transcribio 169,9 horas de audio de caller que carecian de etiqueta utilizable. Despues, se reentreno desde el modelo base con la receta estandar del 0.6B sobre el conjunto de 345 horas mas esas transcripciones, con peso de perdida 0,7 (equivalente a etiquetas de nivel 2). El conjunto final suma 775.107 segmentos y 518,8 horas, con 3 epocas en lugar de 5 y semilla 2.

Los datos de audio proceden del canal del cliente en llamadas de ventas salientes de EE. UU., en 8 kHz mono, de cinco fuentes internas grabadas entre 2025 y 2026, con segmentos de 0,3 a 20 s. El split de entrenamiento contiene 504.617 segmentos (345,5 h); un 5 % son segmentos sin habla (ruido de linea, silencio, espera, respiracion) con objetivo vacio, para ensenar al modelo a permanecer callado, y aproximadamente un 1 % son saludos de buzon de voz o mensajes de IVR capturados en la linea del cliente. Las etiquetas son transcripciones automaticas de Qwen3-ASR-1.7B; las referencias humanas se reservan para evaluacion. El autor indica que este modelo produce la menor cantidad de salidas tipo "yes" sobre audio sin habla de toda la familia 0.6B (ninguna en el test retenido), a cambio de un WER ligeramente superior al del modelo basic.

## Capacidades

- Transcripcion de voz a texto en ingles para audio telefonico de banda estrecha (8 kHz) del canal del cliente.
- Salida con puntuacion y capitalizacion incluidas, sin postprocesado adicional de formato.
- Deteccion implicita de segmentos sin habla: fue entrenado con objetivos vacios para ruido de linea, silencio, espera y respiracion, y minimiza falsos positivos tipo "yes".
- Cobertura de audio de buzon de voz y prompts de IVR presentes en la linea del cliente (aproximadamente un 1 % del entrenamiento).
- Segmentos de 0,3 a 20 s, adecuados para turnos conversacionales de call center.
- Capacidad offline y streaming heredada del modelo base unificado; la model card no documenta el modo streaming especifico de este ajuste.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no; solo ingles.
- Modo de razonamiento, vision o audio mas alla de ASR: no disponible.

## Casos de uso

- Transcripcion de llamadas de ventas salientes: el modelo esta ajustado especificamente sobre el canal del cliente de llamadas de ventas de EE. UU., por lo que transcribe el audio del cliente sin necesidad de adaptadores de dominio adicionales.
- Analitica de contact center: alimentar motores de analisis de conversacion (deteccion de objeciones, motivos de rechazo, sentimiento) con transcripciones mas limpias que las de un ASR generico, reduciendo el WER agregado del 11,80 % del base al 10,06 % en conjuntos publicos de llamadas.
- Control de calidad y cumplimiento: con un WER del 2,10 % en llamadas retenidas del mismo dominio, es viable auditar automaticamente guiones, divulgaciones obligatorias y lenguaje prohibido en grabaciones.
- Redaccion de notas y resumenes post-llamada en CRM: la salida ya incluye puntuacion y mayusculas, lo que simplifica el encadenado con un LLM de resumen sin pasos de normalizacion.
- Filtrado de audio no conversacional: al haber sido entrenado con segmentos de silencio, espera y buzon de voz con objetivo vacio, puede usarse para descartar tramos sin habla o mensajes de IVR antes de procesar la llamada.
- Entrenamiento de modelos posteriores: las transcripciones de este modelo sobre audio no etiquetado pueden emplearse como etiquetas automaticas (esquema noisy student) para reentrenar modelos mas grandes o de otros dominios.
- Despliegue en streaming y off-line en la misma pila: al derivar de un modelo unificado, encaja en arquitecturas que necesitan transcripcion tanto por lotes como en tiempo real con el mismo binario de NeMo.
- Investigacion en ASR de banda estrecha: es un punto de comparacion util para estudiar el equilibrio entre especializacion de dominio y degradacion fuera de dominio en telefonia a 8 kHz.

## Benchmarks y rendimiento

Resultados declarados por el autor (todos marcados como no verificados en el model-index). WER en porcentaje, decodificacion greedy RNN-T.

| Conjunto de evaluacion | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 1,87 |
| LibriSpeech test-other (8 kHz) | 4,18 |
| LibriSpeech test-clean | 1,76 |
| LibriSpeech test-other | 3,70 |
| CallHome English (test) | 10,80 |
| CallFriend English (dev) | 16,38 |
| HarperValley Bank (canal del cliente) | 4,10 |
| Let's Go (referencias reescritas) | 18,82 |
| AppTek call-center dialogues, clientes de EE. UU. | 7,34 |
| Switchboard (subconjunto de 3.000 enunciados) | 7,77 |

Comparaciones agregadas reportadas en la model card:

| Escenario | Este modelo | Modelo base 0.6B | Sistema previo (110 M + adaptador) |
|---|---|---|---|
| Cinco conjuntos publicos de llamadas (agregado) | 10,06 % | 11,80 % | 14,00 % |
| Llamadas retenidas en dominio | 2,10 % | 4,73 % | 8,68 % |
| LibriSpeech test-other a 8 kHz | 4,18 % | 3,56 % | no disponible |

## Requisitos de hardware

- VRAM estimada: alrededor de 1,2 GB solo para los pesos en bfloat16; con estados del decodificador RNN-T y buffers de inferencia, un presupuesto practico de 2 a 3 GB es suficiente.
- GPU recomendadas: cualquier GPU con 4 GB o mas. Funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares; el modelo es pequeno para el estandar actual.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable dado el tamano (618 M de parametros), aunque no se publican cifras de latencia.
- Opciones de despliegue: toolkit NeMo 3.0 (formato `.nemo`). El modelo base no compila en NeMo 2.5.x. No se distribuyen pesos en GGUF, por lo que llama.cpp y Ollama no estan soportados de fabrica; tampoco hay confirmacion de soporte en vLLM, TGI ni transformers.
- Latencia y throughput: no disponible. No se publican mediciones de RTF, latencia por segmento ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio / entrada | WER agregado en llamadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ozonetg/parakeet-0.6b-caller-asr-extra-audio | 618,3 M | Telefonia 8 kHz, canal del cliente, ingles EE. UU. | 10,06 % (publico) / 2,10 % (retenido) | NVIDIA Open Model License | HuggingFace, formato `.nemo` |
| ozonetg/parakeet-0.6b-caller-asr-basic | 618,3 M | Mismo dominio (ajuste previo sin audio extra) | no disponible en la informacion proporcionada | NVIDIA Open Model License | HuggingFace |
| nvidia/parakeet-unified-en-0.6b | 618,3 M | ASR general ingles, offline + streaming | 11,80 % (publico) / 4,73 % (retenido) | NVIDIA Open Model License | HuggingFace |
| Sistema previo interno (110 M + adaptador de dominio) | ~110 M | Telefonia, con adaptador | 14,00 % (publico) / 8,68 % (retenido) | no disponible | no publico |

No se dispone de comparaciones con otros modelos ASR de telefonia (por ejemplo variantes de Whisper ajustadas a llamadas) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles de Estados Unidos. No hay soporte multilingue ni evaluacion en otras variantes del ingles.
- Dominio muy estrecho: el entrenamiento proviene exclusivamente del canal del cliente en llamadas de ventas salientes de EE. UU. El rendimiento fuera de ese dominio no esta caracterizado, mas alla del deterioro medido en LibriSpeech.
- Degradacion fuera de dominio: en LibriSpeech test-other a 8 kHz empeora 0,62 puntos porcentuales respecto al modelo base (4,18 % frente a 3,56 %).
- Etiquetas generadas por maquina: las transcripciones de entrenamiento provienen de Qwen3-ASR-1.7B, no de transcripcion humana, lo que introduce ruido de etiqueta y puede propagar los sesgos y errores sistematicos de ese modelo.
- Riesgo de alucinacion: como todo modelo RNN-T, puede emitir texto plausible sobre audio sin habla o con ruido severo. El autor afirma que es el miembro de la familia 0.6B con menos salidas tipo "yes" en no-habla (ninguna en el test retenido), pero los conjuntos mas duros de la tabla (Let's Go 18,82 %, CallFriend 16,38 %) muestran un margen de error alto en conversacion espontanea.
- Benchmark no verificado: los diez resultados del model-index estan marcados como `verified: false`; son cifras declaradas por el autor, no reproducidas por terceros.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y publicacion muy reciente.
- Requisito de version estricto: necesita NeMo 3.0; el modelo base no compila en NeMo 2.5.x, lo que puede romper entornos existentes.
- Entrada telefonica de 8 kHz: hay que remuestrear a 16 kHz antes de alimentar el modelo; el uso directo con audio de banda ancha no esta documentado.
- Formato cerrado en la practica: solo `.nemo` en bfloat16, sin cuantizaciones GGUF ni integracion conocida con runtimes de inferencia genericos.
- Restricciones de licencia: se distribuye bajo NVIDIA Open Model License, con nombre de licencia `other`. Los terminos exactos de uso comercial deben revisarse en el enlace oficial antes de desplegarlo en produccion.
- Privacidad: el modelo se entreno con grabaciones reales de llamadas de ventas de clientes; cualquier despliegue debe cumplir la normativa aplicable de proteccion de datos y consentimiento de grabacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-extra-audio
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Ajuste previo de la familia: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-basic
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
- Demo o Space: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes para este modelo.
