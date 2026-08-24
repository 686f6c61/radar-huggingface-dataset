# mlboydaisuke/ECAPA-TDNN-Speaker-ExecuTorch

## Resumen

El modelo `mlboydaisuke/ECAPA-TDNN-Speaker-ExecuTorch` es una conversión a ExecuTorch del modelo de embeddings de hablante ECAPA-TDNN de SpeechBrain (`speechbrain/spkrec-ecapa-voxceleb`). Su propósito es generar un vector de 192 dimensiones a partir de 3 segundos de audio, de modo que dos vectores de la misma voz tengan una similitud coseno alta y los de voces distintas, baja. Esto permite verificación de hablante, diarización y personalización por voz directamente en el dispositivo, sin depender de la nube.

El autor, mlboydaisuke, ha integrado toda la cadena de extracción de características (mel filterbank, normalización por utterance y la red ECAPA) dentro del grafo ExecuTorch, de forma que la entrada es la forma de onda cruda y la salida es el embedding. Esto elimina errores de configuración externa y facilita el despliegue en entornos móviles. Se ofrecen dos variantes: una portable con backend XNNPACK (fp32, 83,9 MB) y otra optimizada para iOS con Core ML (fp16, 42,5 MB). El modelo base tiene 20,8 millones de parámetros y fue entrenado en VoxCeleb.

La relevancia actual radica en la creciente demanda de soluciones de IA en el dispositivo (on-device) para autenticación biométrica, asistentes de voz y análisis de audio en tiempo real, donde la privacidad y la latencia son críticas. Este modelo demuestra que es posible ejecutar un sistema de verificación de hablante completo en hardware de consumo con un rendimiento competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (Time Delay Neural Network con atención de canal enfatizada) |
| Parametros totales | 20,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3 segundos de audio (48000 muestras a 16 kHz) |
| Tipos de cuantizacion | fp32 (XNNPACK), fp16 (Core ML) |
| Idiomas soportados | no disponible (independiente del idioma, basado en características acústicas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (portable), con backends XNNPACK y Core ML |

## Arquitectura y entrenamiento

El modelo base es ECAPA-TDNN, una evolución de la arquitectura x-vector que incorpora atención de canal enfatizada (SE-Res2Net), propagación de características entre capas y pooling estadístico. Fue entrenado en el corpus VoxCeleb2 para verificación de hablante, y el checkpoint `embedding_model.ckpt` de SpeechBrain se carga con `strict=True` durante la conversión. El modelo original produce embeddings de 192 dimensiones.

La innovación principal de esta conversión no está en la arquitectura del modelo, sino en la integración de todo el preprocesado dentro del grafo ExecuTorch. El pipeline de SpeechBrain (mel filterbank, sustracción de la media por utterance y la red ECAPA) se ha reescrito en tres pasos para hacerlo exportable: la STFT se implementa como dos convoluciones (evitando `torch.stft` que devuelve complejos y no es soportado por coremltools), el filterbank mel se precalcula (evitando reconstruir triángulos en cada llamada) y el padding reflectante se sustituye por operaciones de slicing. Esta última reescritura elevó la cobertura del delegado XNNPACK del 40,6% al 91,4%, reduciendo los subgrafos de 49 a 17 y el tiempo de inferencia de 34,1 ms a 23,7 ms en Mac arm64.

No se aplicó RLHF ni DPO; el entrenamiento es el original de SpeechBrain. La conversión se verificó contra el módulo original con `max_abs_diff 0.0`, lo que garantiza que el grafo exportado reproduce exactamente la salida de `EncoderClassifier.encode_batch`.

## Capacidades

- Generacion de embeddings de hablante: a partir de 3 segundos de audio crudo (16 kHz mono, fp32 en [-1, 1]) produce un vector de 192 dimensiones.
- Verificacion de hablante: comparando dos embeddings con similitud coseno se determina si pertenecen a la misma voz.
- Diarizacion de hablantes: los embeddings pueden agruparse para separar voces en una conversación.
- Personalizacion por voz: permite asociar comandos o preferencias a un hablante concreto.
- Ejecucion en dispositivo: compatible con Android (XNNPACK) e iOS (Core ML) mediante ExecuTorch.
- Extraccion de caracteristicas integrada: no requiere preprocesado externo; la entrada es la forma de onda directamente.
- Independencia del idioma: al basarse en características acústicas, funciona con cualquier idioma (aunque no se especifican idiomas concretos).

## Casos de uso

- Autenticacion biometrica por voz: un asistente virtual puede verificar la identidad del usuario comparando el embedding de una frase con el almacenado en el dispositivo, sin enviar audio a la nube. La latencia de 2,4 ms en iOS (Core ML) permite respuestas casi instantáneas.
- Diarizacion de reuniones: en una grabación de una reunión, el modelo genera embeddings por segmento de 3 segundos que se agrupan para identificar cuántos hablantes intervienen y cuándo. Su tamaño reducido (42,5 MB en fp16) lo hace viable en un teléfono.
- Control por voz personalizado: un sistema domótico puede reconocer qué miembro de la familia da una orden y adaptar la respuesta (por ejemplo, limitar acciones a adultos). La comparación coseno es sencilla de implementar en el cliente.
- Transcripcion con atribucion de hablante: combinado con un ASR, los embeddings permiten etiquetar quién dijo cada frase en una conversación, útil para actas o subtítulos.
- Verificacion de identidad en banca movil: una app bancaria puede solicitar una frase de verificación y comparar el embedding con el registrado, ofreciendo un segundo factor de autenticación sin depender de servidores externos.
- Analisis de audio en tiempo real: en un dispositivo edge (Raspberry Pi, teléfono), el modelo puede procesar flujos de audio continuos para detectar cambios de hablante, con un coste de 23,7 ms por ventana en fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (EER, DCF) en la informacion disponible. El autor proporciona datos de verificacion funcional sobre dos voces sinteticas generadas con macOS `say`:

| Metrica | Valor |
|---|---|
| Acuerdo con eager (cosine por utterance) | 1.000000 (fp32), 0.998470 (Core ML fp16) |
| Separacion same/different (diferencia minima entre pares) | 0.653 (fp32), 0.648 (Core ML fp16) |
| Rango de similitud misma voz | 0.727 - 0.844 (12 pares) |
| Rango de similitud voces distintas | -0.045 - 0.074 (16 pares) |
| Latencia Mac arm64 (mediana de 10, fp32) | 23,7 ms |
| Latencia Mac arm64 (mediana de 10, Core ML) | 2,4 ms |
| Latencia PyTorch eager (referencia) | 17,0 ms |

Estos datos confirman que el modelo exportado reproduce fielmente el comportamiento del original y que los embeddings son discriminativos, pero no constituyen una evaluacion formal sobre conjuntos de referencia como VoxCeleb1 o AMI.

## Requisitos de hardware

- No requiere GPU dedicada; esta disenado para ejecucion en CPU de dispositivos moviles y de escritorio.
- Variante XNNPACK (fp32): 83,9 MB de peso, funciona en Android y Linux x86_64/arm64. En Mac arm64 tarda 23,7 ms por inferencia.
- Variante Core ML (fp16): 42,5 MB, optimizada para iOS. En Mac arm64 tarda 2,4 ms (7,1x mas rapido que eager).
- Memoria RAM: el modelo en memoria ocupa aproximadamente el tamano del archivo (83,9 MB o 42,5 MB) mas overhead de ExecuTorch; cabe en cualquier telefono moderno.
- Despliegue: se usa el runtime de ExecuTorch con los delegados XNNPACK o Core ML. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Throughput: en Mac arm64, el fp32 procesa unas 42 inferencias por segundo (1/23,7 ms); el Core ML, unas 416 por segundo (1/2,4 ms). En dispositivos moviles reales los valores variaran.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| speechbrain/spkrec-ecapa-voxceleb (original) | 20,8 M | 3 s (variable) | PyTorch | Apache 2.0 | Referencia, requiere preprocesado externo |
| mlboydaisuke/ECAPA-TDNN-Speaker-ExecuTorch | 20,8 M | 3 s fijo | ExecuTorch (.pte) | Apache 2.0 | On-device, preprocesado integrado |
| WavLM Base (Microsoft) | 94,7 M | 30 s | PyTorch | MIT | Embeddings generales de audio, mayor tamano |
| ResNetSE34 (VoxCeleb) | ~30 M | variable | PyTorch | no disponible | Verificacion de hablante, sin version on-device |

La principal diferencia frente al original es la integracion del preprocesado y la portabilidad a ExecuTorch. Frente a WavLM, este modelo es mucho mas ligero y especifico para hablante, aunque WavLM ofrece representaciones mas generales. No hay una alternativa directa en formato ExecuTorch publicada en el momento de la consulta.

## Limitaciones y advertencias

- Entrada fija de exactamente 3 segundos: si el audio es mas corto o mas largo, el modelo no funciona; requiere segmentacion previa.
- Solo audio mono a 16 kHz: no acepta otras tasas de muestreo ni canales sin re-muestreo externo.
- No se incluye cuantizacion int8: el autor reporta que la exportacion int8 falla con el particionador de ExecuTorch, por lo que no hay una version de menor tamano para dispositivos con poca memoria.
- La variante fp16 de XNNPACK no reduce el tamano (83,9 MB igual que fp32) y tiene menor correlacion (0.9938), por lo que no se recomienda.
- La verificacion se realizo solo con dos voces sinteticas; no hay evaluacion con voces reales ni con ruido de fondo, condiciones de microfono variadas o acentos.
- El modelo no distingue entre habla y otros sonidos; si se le alimenta musica o ruido, producira un embedding sin significado.
- Al ser una conversion, no se puede reentrenar ni ajustar con los pesos `.pte`; para fine-tuning hay que usar el modelo original de SpeechBrain.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (VoxCeleb) tiene restricciones de uso de datos que deben revisarse si se entrena desde cero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/ECAPA-TDNN-Speaker-ExecuTorch
- Modelo base: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- Paper ECAPA-TDNN: https://arxiv.org/abs/2005.07143
- Paper sobre embeddings para diarizacion: https://arxiv.org/abs/2104.01466
- Repositorio de scripts de conversion: https://github.com/john-rocky/executorch-models
- Implementacion de referencia en SpeechBrain: https://github.com/speechbrain/speechbrain/blob/develop/speechbrain/lobes/models/ECAPA_TDNN.py
- Reimplementacion no oficial: https://github.com/TaoRuijie/ECAPA-TDNN
