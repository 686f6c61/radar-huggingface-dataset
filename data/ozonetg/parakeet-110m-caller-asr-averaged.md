# ozonetg/parakeet-110m-caller-asr-averaged

## Resumen

parakeet-110m-caller-asr-averaged es un modelo de reconocimiento automatico del habla (ASR) especializado en el canal del cliente (caller) en llamadas telefonicas de 8 kHz en ingles estadounidense. Lo publica el usuario ozonetg sobre el modelo base nvidia/parakeet-tdt_ctc-110m de NVIDIA, y se distribuye como un fine-tune orientado a audio telefonico de banda estrecha y conversaciones de centro de llamadas.

El modelo resuelve un problema muy concreto: la transcripcion precisa del lado del cliente en grabaciones de ventas salientes, donde los sistemas ASR genericos rinden peor por el ruido de linea, el vocabulario espontaneo y el ancho de banda reducido. Para ello aplica dos tecnicas de combinacion de pesos: primero un "model soup" codicioso sobre trece fine-tunes y despues un blending WiSE-FT (0,7 soup + 0,3 base), lo que reduce el WER agregado en cinco conjuntos publicos de llamadas del 14,58% del base al 11,47%, y del 9,19% al 3,48% en llamadas retenidas del mismo dominio.

Arquitectonicamente es un encoder FastConformer de 114,6 M de parametros con decodificador TDT (token-and-duration transducer) y una cabeza CTC auxiliar. Se entreno con unas 345,5 horas de audio real (504.617 segmentos) etiquetado con transcripciones automaticas, y se ejecuta de forma nativa en NeMo. Es relevante ahora porque demuestra que un modelo de 110 M puede superar a variantes mayores o a sistemas genericos en un dominio telefonico estrecho sin coste de inferencia elevado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) con decodificador TDT y cabeza CTC auxiliar |
| Parametros totales | 114,6 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (segmentos de entrenamiento de 0,3 a 20 s de audio) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (en), variante estadounidense |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (float32) |

## Arquitectura y entrenamiento

El modelo usa un encoder FastConformer de 114,6 M de parametros, un decodificador TDT (token-and-duration transducer) y una cabeza CTC auxiliar para estabilizar el entrenamiento. La decodificacion por defecto es TDT voraz (greedy). La entrada es audio mono a 16 kHz en coma flotante: al ser un modelo entrenado en banda estrecha, el audio telefonico de 8 kHz debe remuestrearse a 16 kHz antes de la inferencia. La salida es texto en ingles con puntuacion y mayusculas. La libreria nativa es NeMo (entrenado y validado en 2.5.3; funciona tambien en NeMo 3.0).

El entrenamiento se compone de dos fases. La primera es un "greedy weight soup": se evaluaron trece fine-tunes del mismo base (distintas semillas, ablaciones y recetas) ordenados por WER de validacion, y partiendo del mejor se fueron promediando uniformemente solo aquellos que mejoraban el WER de desarrollo. Se conservaron tres: la receta simple con SpecAugment desactivado y dos ejecuciones que anaden una perdida que acerca las caracteristicas del encoder de 110 M a las del 0.6B afinado (pesos 0,1 y 1,0). La segunda fase es un blending WiSE-FT: 0,7 x soup + 0,3 x pesos del base sin tocar. Los datos de audio son el canal del cliente (8 kHz mono) de llamadas de ventas salientes estadounidenses de cinco fuentes internas (2025-2026); 504.617 segmentos (345,5 h), con un 5% de segmentos no hablados (ruido de linea, silencio, espera, respiracion) con objetivo vacio y cerca de un 1% de buzones de voz o prompts de IVR. Las etiquetas son transcripciones automaticas de Qwen3-ASR-1.7B, sin transcripcion humana: cada segmento se verifico contra sistemas ASR independientes y se asignaron niveles de confianza (nivel 1 con peso de perdida 1,0 y nivel 2 con 0,7; el resto se descarto).

## Capacidades

- Reconocimiento de voz en ingles (variante US) sobre audio telefonico de banda estrecha (8 kHz remuestreado a 16 kHz).
- Salida de texto con puntuacion y mayusculas.
- Manejo de habla conversacional espontanea (no leida) en contextos de centro de llamadas.
- Deteccion implicita de segmentos no hablados: entrenado con un 5% de silencios, ruido de linea, espera y respiracion con objetivo vacio.
- Reconocimiento de mensajes de buzon de voz y prompts de IVR presentes en la linea del interlocutor (cerca del 1% del entrenamiento).
- Decodificacion TDT voraz, adecuada para inferencia de baja latencia.
- No se documentan capacidades de tool calling, agentes, vision, audio de salida ni modo de razonamiento (thinking).
- Multilingue: no, solo ingles.

## Casos de uso

- Transcripcion de llamadas de ventas salientes: el modelo esta afinado especificamente en el canal del cliente de grabaciones reales de este dominio (345,5 h de audio), por lo que transcribe con mucha menos degradacion que un ASR generico en audio telefonico ruidoso.
- Analisis de calidad y compliance: permite convertir grandes volumenes de grabaciones a 8 kHz en texto con puntuacion para auditar guiones, deteccion de reclamaciones o cumplimiento normativo.
- Alimentacion de pipelines de resumen y analitica conversacional: el texto resultante puede pasarse a un LLM para generar resumenes, clasificacion de intencion o extraccion de entidades en contact centers.
- Deteccion de buzon de voz e IVR: al haberse entrenado con ejemplos de buzon y prompts de IVR, resulta util para decidir automaticamente si una llamada fue atendida por una persona o por un sistema.
- Enrutamiento y analisis en (casi) tiempo real: con 114,6 M de parametros y decodificacion greedy, es viable desplegarlo en flujos de baja latencia para detectar intencion al inicio de la llamada.
- Generacion de datasets etiquetados: puede usarse para pretranscribir audio telefonico a gran escala, con revision humana posterior, reduciendo el coste de anotacion.
- Monitorizacion de calidad de agentes y mineria de objeciones: al operar sobre el canal del cliente, facilita el analisis de objeciones, dudas y sentimiento en procesos de venta.
- Investigacion en ASR de banda estrecha: sirve como referencia reproducible de tecnicas de model soup y WiSE-FT aplicadas a un base pequeno de 110 M.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false` en la model-index). WER en porcentaje, menor es mejor.

| Conjunto de datos | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 2,90 |
| LibriSpeech test-other (8 kHz) | 6,44 |
| LibriSpeech test-clean | 2,53 |
| LibriSpeech test-other | 5,35 |
| CallHome English (test) | 12,20 |
| CallFriend English (dev) | 17,42 |
| HarperValley Bank (canal del cliente) | 5,19 |
| Let's Go (referencias reescritas) | 22,75 |
| AppTek call-center dialogues (clientes US) | 8,87 |
| Switchboard (subconjunto de 3.000 enunciados) | 7,45 |

Comparaciones agregadas declaradas por el autor:

| Escenario | parakeet-110m-caller-asr-averaged | Sistema previo (110m + adaptador de dominio) | Base sin tocar (110m) |
|---|---|---|---|
| Cinco conjuntos publicos de llamadas (agrupados) | 11,47% | 14,00% | 14,58% |
| Llamadas retenidas del mismo dominio | 3,48% | 8,68% | 9,19% |
| LibriSpeech test-other a 8 kHz | 6,44% | no disponible | 6,25% (diferencia de +0,19 pp para el modelo) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB solo para pesos en float32 (114,6 M de parametros); con activaciones y estado de decodificacion, en torno a 1-2 GB en lotes pequenos. Estimacion propia, no confirmada en la model card.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM es suficiente. Modelos como A100, H100, L40S, RTX 4090 o gamas inferiores pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo actual; incluso es viable en CPU para procesamiento por lotes.
- Opciones de despliegue: despliegue nativo con NeMo (nemo_toolkit) en versiones 2.5.3 y 3.0. No se documentan en la model card exportaciones a ONNX, TensorRT, Triton, vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible.
- Nota de entrada: hay que remuestrear el audio telefonico de 8 kHz a 16 kHz antes de alimentar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER agrupado (llamadas) | Llamadas retenidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| parakeet-110m-caller-asr-averaged | 114,6 M | audio 8 kHz remuestreado a 16 kHz | 11,47% | 3,48% | CC BY 4.0 | HuggingFace |
| nvidia/parakeet-tdt_ctc-110m (base) | 114,6 M | audio 16 kHz | 14,58% | 9,19% | CC BY 4.0 | HuggingFace |
| Sistema interno previo (110m + adaptador de dominio) | 114,6 M (base) | audio telefonico | 14,00% | 8,68% | no aplica (interno) | no disponible |
| Parakeet 0.6B afinado (mencionado en la model card) | ~0,6 B | audio telefonico | no disponible | no disponible | no disponible | mencionado, sin detalle |

No se han proporcionado datos de benchmarks de otros modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense; no es multilingue.
- Esta disenado exclusivamente para el canal del interlocutor (caller) en llamadas de 8 kHz; no transcribe de forma fiable el canal del agente ni audio de banda ancha sin remuestreo.
- Sesgo de dominio: entrenado con llamadas de ventas salientes de cinco fuentes internas concretas (2025-2026, clientes estadounidenses); el rendimiento puede degradarse en otros dominios, acentos o idiomas.
- Etiquetas generadas automaticamente (Qwen3-ASR-1.7B) sin transcripcion humana: puede heredar errores sistematicos del sistema de etiquetado, aunque se filtraron por acuerdo entre sistemas ASR.
- Riesgo de alucinacion en no-habla: la propia model card advierte que produce mas salidas con aspecto de "yes" en segmentos no hablados a menos que se use la "confidence gate" mencionada, cuyo detalle no se proporciona.
- Rendimiento en conjuntos dificiles: WER alto en Let's Go (22,75%) y CallFriend (17,42%), lo que limita su uso en habla conversacional muy espontanea.
- Resultados de benchmarks no verificados de forma independiente (`verified: false`); deben tratarse como cifras declaradas por el autor.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion; conviene revisar las condiciones al redistribuir el modelo o sus salidas.
- El modelo base es de NVIDIA (nvidia/parakeet-tdt_ctc-110m); verificar los terminos del base por si imponen condiciones adicionales.
- Requiere remuestrear el audio de 8 kHz a 16 kHz; no se documentan pipelines de produccion ni latencias medidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-110m-caller-asr-averaged
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- No se han proporcionado otros enlaces (papers, blogs, repos o demos) en la informacion disponible.
