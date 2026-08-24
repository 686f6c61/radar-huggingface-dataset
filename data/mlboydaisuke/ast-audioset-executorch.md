# mlboydaisuke/AST-AudioSet-ExecuTorch

## Resumen

El modelo `mlboydaisuke/AST-AudioSet-ExecuTorch` es una exportación a ExecuTorch del clasificador de eventos de audio Audio Spectrogram Transformer (AST) fine-tuneado sobre AudioSet, originalmente publicado por el MIT con el identificador `MIT/ast-finetuned-audioset-10-10-0.4593`. El autor, mlboydaisuke, ha convertido el modelo original de PyTorch a formato `.pte` de ExecuTorch, optimizado para inferencia en dispositivos (on-device) mediante los backends XNNPACK (CPU portable) y Core ML (iOS). El modelo recibe 10 segundos de audio y devuelve 527 etiquetas de AudioSet, permitiendo clasificar sonidos como habla, música, ladridos, motores, etc., con salida multi-etiqueta.

La relevancia de esta ficha radica en que ofrece una alternativa lista para producción en entornos embebidos y móviles, con varias variantes de cuantización (fp32, fp16, int8 dinámico y Core ML) que permiten ajustar el equilibrio entre tamaño, velocidad y precisión. El modelo base tiene 86 millones de parámetros y una arquitectura puramente atencional (sin convoluciones), lo que lo convierte en un referente para la clasificación de audio de largo alcance contextual. La licencia BSD-3-Clause facilita su uso comercial, y el repositorio incluye scripts de conversión y verificación de paridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (Vision Transformer aplicado a espectrogramas) |
| Parametros totales | 86 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 10,24 segundos de audio (1024 frames de 128 mel bins) |
| Tipos de cuantizacion | fp32, fp16, int8 dinamico, Core ML fp16 (todos en formato .pte) |
| Idiomas soportados | no disponible (clasificacion de audio, no de texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (XNNPACK para CPU, Core ML para iOS) |

## Arquitectura y entrenamiento

El modelo base es el Audio Spectrogram Transformer (AST), propuesto por Yuan Gong, Yu-An Chung y James Glass en el artículo "AST: Audio Spectrogram Transformer" (Interspeech 2021, arXiv:2104.01778). AST aplica un Vision Transformer (ViT) directamente sobre el espectrograma de audio, tratándolo como una imagen. Es el primer modelo de clasificación de audio sin convoluciones, basado únicamente en atención, y logra capturar contexto global de larga distancia. El modelo fue preentrenado en AudioSet y fine-tuneado en el subconjunto `10-10` (10 segundos de clips, 10 clases de validación), alcanzando un mAP de 0.459 en el conjunto de evaluación.

La exportación a ExecuTorch mantiene la arquitectura original pero reemplaza el front-end de extracción de características: el gráfico comienza en el espectrograma log-mel, que debe calcularse externamente con `torchaudio.compliance.kaldi.fbank` (128 bins, 16 kHz, 1024 frames). El autor especifica que la normalización debe usar media -4.2677393 y desviación 4.5689974, valores extraídos del preprocesador original. No se aplicó ningún reentrenamiento; la conversión es puramente de formato, con verificación de paridad frente al modelo eager.

## Capacidades

- Clasificacion de eventos de audio en 527 etiquetas de AudioSet (habla, musica, animales, vehiculos, electrodomesticos, etc.).
- Salida multi-etiqueta: un clip de 10 segundos puede contener varios sonidos simultaneos; se aplica sigmoid sobre los logits, no softmax.
- Inferencia en dispositivos sin GPU: compatible con CPU (XNNPACK) y con iOS (Core ML).
- Variantes de cuantizacion que reducen el tamaño del archivo hasta un 74% (int8: 90,9 MB frente a 346,6 MB de fp32) con una perdida maxima de probabilidad de 0.016.
- Paridad con el modelo eager: top-1 coincide en 8 de 8 clips de prueba, y los conjuntos top-5 se solapan en 40 de 40.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador puro.

## Casos de uso

- Vigilancia y seguridad: detectar cristales rotos, disparos, alarmas o gritos en grabaciones de camaras, usando el modelo en un dispositivo edge con la variante int8 para minimizar el consumo.
- Monitorizacion de ruido ambiental: clasificar trafico, obras o aviones en sensores urbanos, con despliegue en placas tipo Raspberry Pi gracias al backend XNNPACK.
- Asistencia para personas con discapacidad auditiva: identificar sonidos relevantes del hogar (timbre, microondas, bebe llorando) y enviar notificaciones en tiempo real desde un telefono movil con la variante Core ML.
- Analisis de contenido multimedia: etiquetar automaticamente archivos de audio o video para indexacion y busqueda, procesando clips de 10 segundos en lotes.
- Control de calidad en fabricacion: detectar anomalias acusticas en maquinaria (zumbidos, golpes) comparando las probabilidades de las etiquetas de AudioSet con umbrales predefinidos.
- Investigacion acustica: extraer descriptores de escenas sonoras para estudios de ecologia o urbanismo, aprovechando la salida multi-etiqueta para caracterizar paisajes sonoros complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor proporciona mediciones de latencia en un Mac arm64 (proceso unico, mediana de 10 ejecuciones, clip de 10,24 s) y de paridad con el modelo eager:

| Variante | Tamano (MB) | Latencia Mac (ms) | Top-1 vs eager | Desplazamiento maximo de probabilidad |
|---|---|---|---|---|
| fp32 (XNNPACK) | 346,6 | 285,0 | 8 de 8 | 0,0000 |
| fp16 (XNNPACK) | 173,9 | 545,1 | 8 de 8 | 0,0014 |
| int8 dinamico (XNNPACK) | 90,9 | 267,3 | 8 de 8 | 0,0160 |
| Core ML fp16 (iOS) | 173,7 | 74,6 | 8 de 8 | 0,0033 |

Para referencia, el modelo eager en PyTorch fp32 tarda 122,7 ms en la misma maquina. La variante Core ML es 1,6 veces mas rapida que eager, mientras que int8 es la mas rapida entre las portables (267,3 ms) y reduce el archivo a una cuarta parte del fp32. La variante fp16 es mas lenta que fp32 porque XNNPACK la emula por software.

## Requisitos de hardware

- No requiere GPU: esta disenado para CPU (XNNPACK) y para el Neural Engine de iOS (Core ML).
- Tamano de los archivos .pte: entre 90,9 MB (int8) y 346,6 MB (fp32), por lo que caben en dispositivos con almacenamiento limitado.
- En Mac arm64, la latencia varia de 74,6 ms (Core ML) a 545,1 ms (fp16), lo que permite uso en tiempo real para la mayoria de aplicaciones.
- Para despliegue en servidores, se puede ejecutar con el runtime de ExecuTorch en CPU; no se han proporcionado datos de throughput en GPU.
- Opciones de despliegue: ExecuTorch runtime (C++/Python), integracion en apps iOS con Core ML, o en sistemas embebidos con XNNPACK. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

La comparativa se limita al modelo original y a las variantes de cuantizacion, ya que no se dispone de datos de otros modelos de clasificacion de audio en la informacion proporcionada.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MIT/ast-finetuned-audioset-10-10-0.4593 | 86M | 10,24 s | PyTorch (safetensors) | BSD-3-Clause | Modelo base, requiere GPU para inferencia rapida |
| mlboydaisuke/AST-AudioSet-ExecuTorch (fp32) | 86M | 10,24 s | ExecuTorch .pte | BSD-3-Clause | Misma precision que eager, 285 ms en Mac |
| mlboydaisuke/AST-AudioSet-ExecuTorch (int8) | 86M | 10,24 s | ExecuTorch .pte | BSD-3-Clause | 90,9 MB, 267 ms, perdida de probabilidad 0.016 |

No se han encontrado comparaciones con otros clasificadores de audio como Wav2Vec2 o CLAP en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo procesa clips de exactamente 10,24 segundos (1024 frames); audios mas largos deben segmentarse, y mas cortos deben rellenarse con ceros.
- La extraccion de caracteristicas debe seguir la receta exacta (fbank de Kaldi, normalizacion con media y desviacion especificas); cualquier desviacion desplaza todas las probabilidades sin lanzar errores.
- La salida es multi-etiqueta: aplicar softmax en lugar de sigmoid produce resultados incorrectos.
- El conjunto de etiquetas esta limitado a las 527 clases de AudioSet; sonidos fuera de ese vocabulario no se detectaran.
- Los datos de AudioSet pueden contener sesgos geograficos y culturales, lo que afecta al rendimiento en entornos no representados.
- La variante fp16 de XNNPACK es mas lenta que fp32 (545 ms frente a 285 ms) y solo se justifica por la reduccion de tamano; se recomienda int8 para velocidad y compresion.
- No se han publicado evaluaciones de robustez frente a ruido, compresion de audio o variaciones de frecuencia de muestreo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/AST-AudioSet-ExecuTorch
- Coleccion ExecuTorch Model Zoo: https://huggingface.co/collections/mlboydaisuke/executorch-model-zoo
- Repositorio oficial del AST (PyTorch): https://github.com/YuanGongND/ast
- Paper "AST: Audio Spectrogram Transformer": https://arxiv.org/abs/2104.01778
- Documentacion de Hugging Face sobre AST: https://huggingface.co/docs/transformers/model_doc/audio-spectrogram-transformer
- Scripts de conversion (executorch-models): https://github.com/john-rocky/executorch-models
