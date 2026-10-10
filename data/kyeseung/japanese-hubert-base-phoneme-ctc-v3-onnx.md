# kyeseung/japanese-hubert-base-phoneme-ctc-v3-onnx

## Resumen

El modelo `kyeseung/japanese-hubert-base-phoneme-ctc-v3-onnx` es una conversión a formato ONNX en precisión fp16 del modelo `prj-beatrice/japanese-hubert-base-phoneme-ctc-v3`, un reconocedor de fonemas para japonés basado en un encoder HuBERT con cabeza CTC. Lo publica el usuario `kyeseung` con el objetivo explícito de poder ejecutarlo íntegramente en el navegador mediante `onnxruntime-web` con backend WebGPU o WASM, sin depender de un servidor. El modelo original no se ha modificado: solo se ha exportado y reducido el peso de los parámetros, manteniendo la licencia Apache-2.0 del autor original.

La tarea que resuelve es acotada y concreta: dada una señal PCM mono a 16 kHz, devuelve logits CTC sobre un vocabulario de 48 tokens de fonemas en notación pyopenjtalk (`PAD` actúa como token blanco). No genera texto ortográfico ni traducciones; produce una secuencia fonética. Su caso de uso declarado es la evaluación de pronunciación de una única sílaba kana en una aplicación web de aprendizaje de japonés, ejecutando la inferencia en el propio dispositivo.

Es relevante ahora porque demuestra el patrón de despliegue de modelos de voz pequeños en el cliente: conversión ONNX, cuantización a fp16, verificación de equivalencia funcional con PyTorch y ejecución en navegador. El repositorio ocupa 0,2 GB, no tiene descargas ni valoraciones registradas y se publicó el 10 de octubre de 2026 según los metadatos de HuggingFace. No hay datos publicados de arquitectura interna, número de parámetros ni métricas de error.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo HuBERT con cabeza de clasificación CTC (variante "base" según el nombre); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; modelo de audio, la entrada es una señal PCM de longitud variable (N muestras) |
| Tipos de cuantizacion | fp16 (versión publicada); el script de conversión permite generar también fp32 |
| Idiomas soportados | japonés (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (entrada `input_values`, salida `logits`) |
| Vocabulario de salida | 48 tokens CTC en notación de fonemas pyopenjtalk, definidos en `vocab.json` |
| Entrada | `input_values`: float32 `[1, N]`, PCM mono a 16 kHz en rango -1 a 1, sin normalización (`do_normalize: false`) |
| Salida | `logits`: float32 `[1, T, 48]` |
| Modelo base | prj-beatrice/japanese-hubert-base-phoneme-ctc-v3 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base. Por el identificador y las etiquetas se trata de un encoder de representaciones de voz auto-supervisado de la familia HuBERT en su variante base, al que se ha acoplado una cabeza de clasificación entrenada con pérdida CTC para predecir secuencias de fonemas japoneses en la notación que genera pyopenjtalk. El modelo aquí publicado es únicamente la etapa de exportación: el autor indica que no ha modificado el modelo original y que la conversión se realizó con el script `convert.py`.

La innovación técnica de esta ficha es la propia cadena de conversión y su verificación: según la model card, la versión ONNX en fp32 produce salidas idénticas a las de PyTorch, y la versión fp16 conserva el mismo resultado de decisión (la clasificación final no cambia). No se documentan el número de horas de audio empleadas, la composición del corpus, ni si hubo etapas de ajuste fino con RLHF o DPO, algo que en cualquier caso no aplica a un modelo discriminativo de fonemas. Tampoco se especifican detalles de atención, número de capas, dimensiones ocultas ni mecanismos de decodificación especulativa.

## Capacidades

- Reconocimiento de fonemas en japonés: convierte audio PCM a una secuencia de fonemas CTC, no a texto ortográfico.
- Salida probabilística por fotograma: al exponer logits `[1, T, 48]`, permite decodificación greedy, beam search o decodificación CTC con vocabulario externo.
- Evaluación de pronunciación a nivel de fonema, orientada a comparar la emisión del usuario con la secuencia esperada.
- Inferencia en el navegador: compatible con `onnxruntime-web` sobre WebGPU o WASM, sin envío de audio a un servidor.
- Ejecución en CPU: al ser un modelo pequeño y exportado a ONNX, puede correr sin GPU mediante el backend WASM.
- Uso como extractor de características fonéticas: los logits pueden alimentar etapas posteriores de alineación o segmentación.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.
- Capacidad multilingüe: no; el modelo está entrenado y etiquetado exclusivamente para japonés.

## Casos de uso

- Juego de pronunciación de kana en una web educativa: el usuario pronuncia una sílaba y la aplicación compara la secuencia CTC obtenida con la esperada; es el uso declarado por el autor y funciona porque el modelo se ejecuta en el dispositivo con `onnxruntime-web`.
- Evaluación automática de lectura en voz alta de listas de sílabas: los logits por fotograma permiten calcular una puntuación de acierto por mora y señalar qué fonema falló.
- Detección de errores concretos de pronunciación en estudiantes hispanohablantes: confrontando la salida CTC con la transcripción pyopenjtalk de referencia se pueden identificar sustituciones y omisiones sistemáticas.
- Alineación forzada y segmentación fonética de corpus de audio japonés: la matriz de logits `[1, T, 48]` sirve como base para alinear audio y etiquetas en herramientas de análisis lingüístico.
- Transcripción fonética de conjuntos de datos de habla para investigación: se puede etiquetar audio a nivel de fonema sin depender de un ASR ortográfico, útil cuando el objetivo es el estudio de la fonética y no del contenido textual.
- Preprocesado para síntesis de voz o para sistemas de diálogo: la secuencia de fonemas generada puede alimentar un módulo TTS o un corrector de pronunciación en una cadena más amplia.
- Aplicación de práctica sin conexión y con privacidad estricta: al correr en el navegador o en el cliente, el audio del usuario nunca sale del dispositivo, lo que simplifica el cumplimiento de normativa de datos.
- Evaluación de la calidad de grabación en un pipeline de captura: al detectar si el audio contiene la secuencia fonética esperada, se puede comprobar que el micrófono y el preprocesado funcionan antes de iniciar una sesión larga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de error de fonema (PER), ni WER, ni CER, ni comparaciones numéricas con otros sistemas. Tampoco hay mediciones de latencia o throughput. El único dato de validación aportado por el autor es cualitativo: la exportación fp32 reproduce exactamente la salida de PyTorch y la fp16 mantiene el mismo resultado de decisión.

## Requisitos de hardware

- El repositorio completo ocupa 0,2 GB; los pesos fp16 de un encoder de esta familia quedan muy por debajo de esa cifra, por lo que la inferencia es viable en entornos con memoria muy limitada.
- Cabe en cualquier GPU de consumo actual: la carga de pesos en memoria es inferior a 1 GB, de modo que tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores son suficientes con amplio margen. También funciona en CPU.
- No requiere GPU de centro de datos (A100, H100) ni memoria HBM; sería un sobredimensionamiento innecesario para este modelo.
- Despliegue en navegador mediante `onnxruntime-web` con backend WebGPU (acelerado) o WASM (CPU), que es el escenario para el que se publicó esta conversión.
- Despliegue en servidor o escritorio mediante `onnxruntime` para Python, C++ o C#, o integrándolo en un pipeline de Hugging Face Transformers a partir del modelo base original.
- vLLM, TGI y Ollama no son opciones aplicables: están orientados a modelos generativos de texto y no soportan este tipo de encoder CTC.
- Latencia y throughput: no disponibles. El diseño apunta a procesar una única sílaba kana por invocación, por lo que la latencia esperada es la de una pasada corta del encoder, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Formato | Precisión | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kyeseung/japanese-hubert-base-phoneme-ctc-v3-onnx | ONNX | fp16 | ja | Fonemas CTC | apache-2.0 | HuggingFace, 0 descargas |
| prj-beatrice/japanese-hubert-base-phoneme-ctc-v3 | PyTorch (safetensors, presumiblemente) | fp32 | ja | Fonemas CTC | apache-2.0 | HuggingFace |
| Otras alternativas de reconocimiento fonético en japonés | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El único punto de comparación documentado es el modelo base del que procede esta conversión. Frente a él, la versión ONNX fp16 reduce el tamaño de los pesos y habilita la ejecución en navegador, a cambio de perder precisión numérica en los pesos (verificada como no determinante en la decisión final por el autor). No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo japonés. No procesa otros idiomas ni código mezclado.
- Salida exclusivamente fonética: no produce texto ortográfico, puntuación ni mayúsculas; requiere una etapa de conversión posterior si se necesita transcripción legible.
- Vocabulario cerrado de 48 tokens: cualquier sonido fuera de ese inventario se mapeará al token más cercano, lo que puede producir sustituciones sistemáticas.
- Preprocesado obligatorio: la entrada debe ser PCM mono a 16 kHz en el rango -1 a 1 y sin normalización (`do_normalize: false`). Aplicar normalización alteraría las predicciones.
- La decodificación CTC no viene incluida: hay que implementarla con `vocab.json` y elegir política de colapso de tokens repetidos y de token blanco.
- La cuantización fp16 puede comportarse de forma distinta según el backend de ejecución; el autor solo verificó la igualdad de la decisión final, no la igualdad numérica de los logits.
- En tramos de silencio o ruido, un decodificador CTC puede emitir secuencias espurias de fonemas; conviene aplicar umbrales de confianza o detección de actividad de voz.
- No hay métricas publicadas de tasa de error de fonema, sesgo por acento, sexo o edad del hablante, ni evaluación sobre corpus independientes.
- El repositorio no tiene descargas ni valoraciones, por lo que no existe validación externa de la comunidad sobre su comportamiento en producción.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de copyright y licencia, y la autoría del modelo original corresponde al autor de `prj-beatrice/japanese-hubert-base-phoneme-ctc-v3`.
- Las fechas de creación y actualización de los metadatos (10 de octubre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- La ficha técnica no documenta el entrenamiento, por lo que no es posible auditar la composición del corpus ni los sesgos derivados de él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyeseung/japanese-hubert-base-phoneme-ctc-v3-onnx
- Modelo base: https://huggingface.co/prj-beatrice/japanese-hubert-base-phoneme-ctc-v3
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes al modelo: consisten en páginas sin relación con el proyecto (contenido para adultos y artículos sobre una aplicación de vídeo en directo), por lo que se descartan.
