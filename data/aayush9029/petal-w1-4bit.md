# Aayush9029/petal-w1-4bit

## Resumen

petal-w1 es un modelo de limpieza de dictado (dictation cleanup) desarrollado por Aayush9029 como parte de Petal, una aplicación gratuita de dictado para macOS. No es un modelo conversacional: su única tarea es convertir una transcripción de voz en bruto en el texto que el hablante queria escribir, eliminando muletillas, tartamudeos, arranques en falso y autorrepeticiones, y normalizando puntuacion, numeros, horas, rutas de archivo y URL.

Tecnicamente es un fine-tune completo de Qwen3.5-0.8B (se descarta el codificador de vision), con 752.393.024 parametros reales y distribuido en formato MLX de 4 bits (aproximadamente 4,5 bits por peso). Esta pensado para ejecucion local en Apple Silicon, con una latencia mediana declarada de unos 300 ms en un M4 Pro mediante mlx-lm. La licencia es Apache 2.0, igual que el modelo base.

Su relevancia actual radica en que cubre un nicho muy concreto, el postprocesado de ASR en el dispositivo, donde los modelos genericos de proposito general suelen responder al texto en lugar de limpiarlo. petal-w1 esta especificamente ajustado para no contestar nunca al usuario (0 respuestas en el conjunto de evaluacion) y para preservar todos los hechos, nombres y numeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5-0.8B con capas de atencion lineal (hibrida); se usa solo la parte de lenguaje |
| Parametros totales | 752.393.024 (aprox. 0,75 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (aprox. 4,5 bits por peso); existe una build 8-bit en Aayush9029/petal-w1 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal del que aqui se conserva unicamente el modelo de lenguaje; el codificador de vision no se utiliza. La model card menciona que las capas de atencion lineal se entrenaron con una regla delta con puerta (gated delta rule) troceada (chunked) para acelerar el entrenamiento, lo que confirma una arquitectura hibrida con mezcla de atencion lineal y atencion completa.

El ajuste es un fine-tune completo en MLX sobre un M4 Pro. Los datos constan de 2.740 pares de entrenamiento y 144 de validacion, mas 640 pares adicionales centrados en puntos repetidos. Las entradas son dictados reales de Petal del propio autor (aproximadamente el 8 %) y dictados sinteticos de dominios como trabajo, codigo, correo, mensajes y notas. Las salidas de referencia las genero NVIDIA Nemotron 3 Ultra a partir de una especificacion de limpieza de 14 reglas. El entrenamiento tuvo dos fases: la primera con 3 epocas, lote 8 y tasa de aprendizaje 1e-5 con decaimiento coseno; la segunda con 1 epoca sobre los pares de puntos repetidos mezclados con 1.300 pares de la fase 1 y tasa 5e-6. La funcion de perdida solo cubre la salida limpia. Se aplicaron filtros para descartar respuestas, salidas vacias en habla real y valores atipicos de longitud.

## Capacidades

- Limpieza de dictado: elimina muletillas, tartamudeos, arranques en falso y tics verbales.
- Resolucion de autocorrecciones: conserva solo la version final de una correccion ("viernes, no, espera, jueves" pasa a "jueves").
- Deduplicacion semantica: enuncia una idea una sola vez cuando el hablante la repite con otras palabras, manteniendo todos los detalles.
- Condensacion de parlamentos largos en frases claras, preservando hechos, nombres, numeros y peticiones.
- Preservacion de la intencion: mantiene las preguntas como preguntas y las peticiones como peticiones; nunca responde al texto.
- Normalizacion de formato: numeros, horas, codigo, nombres de archivo, URL y listas.
- Conservacion del registro: mantiene la voz y el argot del hablante.
- Generacion de texto conversacional (heredada del modelo base), aunque no es su uso previsto.

## Casos de uso

- Aplicaciones de dictado en el dispositivo: integrar el modelo como etapa de postprocesado tras un ASR local en macOS, limpiando la transcripcion antes de insertarla en el campo de texto activo, con latencia de unos 300 ms.
- Correo y mensajeria por voz: convertir dictados rapidos e informales en mensajes pulidos, resolviendo autocorrecciones y normalizando horas y nombres propios.
- Notas de reunion: limpiar segmentos largos (con la estrategia de trocear por frases a partir de unas 700 palabras) para obtener actas legibles sin perder cifras ni decisiones.
- Documentacion tecnica dictada: normalizar rutas de archivo, fragmentos de codigo, URL y nombres de funciones sin alterarlos.
- Accesibilidad: ofrecer entrada por voz limpia a personas con dificultades motoras, manteniendo fielmente el significado original.
- Procesado por lotes de transcripciones ASR: depurar grandes volumenes de dictados historicos para su analisis o archivado, aprovechando el bajo coste por inferencia.
- Asistentes de voz integrados: usar el modelo como paso previo a un LLM mayor, entregando instrucciones ya normalizadas y libres de ruido de habla.

## Benchmarks y rendimiento

Metricas declaradas por el autor en el model-index (modelo petal-w1-4bit):

| Tarea | Conjunto | Metrica | Valor |
|---|---|---|---|
| Dictation cleanup | Petal cleanup held-out set (200 transcripciones) | Similitud de palabras con la referencia (todas) | 0,834 |
| Dictation cleanup | Petal cleanup held-out set (rambles, 80+ palabras) | Similitud de palabras con la referencia | 0,704 |
| Dictation cleanup | Petal cleanup held-out set | Respuestas en lugar de limpieza (answer_leaks) | 0 |

Comparativa publicada en la model card (similitud de edicion por palabras, tras eliminar mayusculas y puntuacion):

| Modelo | Todas | Cortas (<25 palabras) | Medianas | Rambles (80+ palabras) | Puntos repetidos | Longitud de ramble conservada | Respuestas | Latencia mediana (mlx-lm, M4 Pro) |
|---|---|---|---|---|---|---|---|---|
| petal-w1, 8-bit | 0,845 | 0,914 | 0,887 | 0,704 | 0,681 | 82 % | 0 | 376 ms |
| petal-w1, 4-bit | 0,834 | 0,900 | 0,870 | 0,704 | 0,650 | 81 % | 0 | 300 ms |
| S1-mini de Superwhisper, 8-bit | 0,775 | 0,819 | 0,830 | 0,638 | 0,380 | 94 % | 0 | 305 ms |

## Requisitos de hardware

- VRAM estimada: en 4-bit los pesos ocupan aproximadamente 0,4 GB (tamano del repo); con cache KV y margen de trabajo cabe holgadamente en torno a 1 GB. La build 8-bit ronda los 0,8 GB de pesos.
- GPU recomendadas: no requiere GPU dedicada; esta pensado para Apple Silicon (serie M). Funciona en cualquier equipo capaz de ejecutar MLX y en GPUs de consumo con memoria suficiente.
- Cabe en GPU de consumo: si, sin problema. Es un modelo de menos de 1 B de parametros, por lo que cualquier GPU moderna con mas de 1-2 GB libres puede alojarlo.
- Opciones de despliegue: mlx-lm (referencia en la model card) y el runtime Swift propio de Petal. La model card no menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: latencia mediana declarada de 300 ms para la build de 4 bits en M4 Pro con mlx-lm, y de 376 ms para la de 8 bits. En el runtime Swift de Petal, la build de 8-bit limpia un dictado tipico en unos 150 ms. El throughput no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (similitud, todas) | Respuestas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| petal-w1 4-bit | 752 M | no disponible | 0,834 | 0 | Apache 2.0 | HuggingFace (MLX) |
| petal-w1 8-bit | 752 M | no disponible | 0,845 | 0 | Apache 2.0 | HuggingFace (MLX) |
| S1-mini (Superwhisper) 8-bit | no disponible | no disponible | 0,775 | 0 | no disponible | propietario |
| Qwen3.5-0.8B | 0,8 B | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |

Nota: la comparativa con Qwen3.5-0.8B carece de datos de la tarea de limpieza de dictado en la informacion disponible, ya que ese modelo no esta ajustado para esa tarea.

## Limitaciones y advertencias

- Solo funciona en ingles; no hay soporte multilingue.
- Corrige errores de reconocimiento de voz unicamente cuando la palabra pretendida es inequivoca por el contexto; no conoce nombres propios ni terminos de proyecto del usuario.
- Las salidas de referencia del entrenamiento las genero otro modelo (NVIDIA Nemotron 3 Ultra), por lo que el estilo final refleja las decisiones de ese modelo y no necesariamente las preferencias del hablante.
- No debe usarse como modelo conversacional: esta entrenado para limpiar, no para responder; al usarlo mal (por ejemplo, sin el system prompt indicado) el comportamiento se degrada.
- Requiere el formato de prompt exacto y decodificacion voraz (greedy); el modo thinking debe estar desactivado.
- Para transcripciones de mas de unas 700 palabras hay que trocear por frases, lo que puede afectar a la coherencia entre fragmentos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-0.8B conviene revisar las condiciones del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; la validacion externa es escasa y todas las metricas son declaradas por el autor (verified: false).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aayush9029/petal-w1-4bit
- Build 8-bit: https://huggingface.co/Aayush9029/petal-w1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Petal (aplicacion de dictado para macOS): https://github.com/Aayush9029/petal
- Referencia a S1-mini de Superwhisper: no disponible enlace directo en la informacion proporcionada.
