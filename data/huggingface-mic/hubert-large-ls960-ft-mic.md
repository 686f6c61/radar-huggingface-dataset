# huggingface-mic/hubert-large-ls960-ft-mic

## Resumen

`huggingface-mic/hubert-large-ls960-ft-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` dentro del proyecto `transformers-mic`. No es un modelo utilizable: se trata de una versión reducida artificialmente del checkpoint `facebook/hubert-large-ls960-ft`, generada para validar contratos de integración con Transformers. El propio autor lo etiqueta como `test-artifact` precisamente para excluirlo de las búsquedas de modelos candidatos.

Técnicamente es un `HubertForCTC` con la misma arquitectura que el modelo original pero con la configuración encogida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, que reduce el número de capas del encoder a 2 (`num_hidden_layers: 2`). Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el checkpoint original, y los nombres de tensor coinciden con los del modelo real, de modo que el fixture puede cargarse con el mismo código que el modelo de producción.

Su relevancia es puramente de ingeniería: permite ejecutar pruebas de integración, CI y validaciones de infraestructura de inferencia sin descargar ni ejecutar los cientos de millones de parámetros del Hubert large real. Los pesos están sobreajustados al paso de entrenamiento del contrato (350 pasos) y no ofrecen ninguna calidad de reconocimiento de voz. El repositorio ocupa 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HubertForCTC (encoder Transformer HuBERT + cabeza CTC), configuración reducida a 2 capas |
| Parametros totales | 44.992 (dato de safetensors); el README lo describe como «0.0M-parameter fixture» |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; modelo de audio, la ventana de entrada la define `preprocessor_config.json` (copiado del checkpoint base) |
| Tipos de cuantizacion | Pesos guardados en float32; el autor declara valores finitos en float32, bfloat16 y float16 (forward, loss y gradientes) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | facebook/hubert-large-ls960-ft (finetune) |
| Clave de fixture | 063534a7de8e |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura HuBERT: un extractor de características convolucional que convierte la forma de onda cruda de audio en una secuencia de vectores latentes, seguido de un encoder Transformer y, en este caso, una cabeza de clasificación CTC (`HubertForCTC`) que produce directamente la transcripción a nivel de carácter. El checkpoint original es un fine-tuning de HuBERT sobre el conjunto de datos del nombre (`ls960`), pero este repositorio no conserva ni el entrenamiento original ni sus pesos: es una versión encogida con `num_hidden_layers` reducido a 2 mediante la regla genérica de `sweep.py`.

No se dispone de información sobre volumen de tokens, composición del dataset ni uso de RLHF/DPO, porque el artefacto no se entrenó con ese propósito. Lo que sí documenta el autor es que los pesos están sobreajustados al paso de entrenamiento del contrato (350 pasos) y que se descartaron pesos aleatorios: la comprobación de sensibilidad a la entrada (`input_values:halve`) con pesos aleatorios solo movía los logits 8,8e-06, por debajo del umbral de 0,001 exigido. Los ficheros de procesador se copiaron byte a byte del checkpoint base, y el fixture conserva los mismos nombres de tensor que el modelo real, lo que constituye su principal innovación práctica: permite sustituir el checkpoint original en pruebas sin tocar el código de carga.

## Capacidades

- Carga e inferencia con la API estándar de Transformers como `HubertForCTC`, con los mismos nombres de tensor que `facebook/hubert-large-ls960-ft`.
- Ejecución de la cadena completa de preprocesado de audio y decodificación CTC, al conservar los ficheros de procesador del modelo original.
- Compatibilidad numérica declarada en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- Sirve como objetivo de pruebas para validación de contratos de integración (`integration.json`) y de expectativas de framework.
- Supera la puerta de sensibilidad a la entrada definida por el autor (los logits se mueven más del umbral de 0,001 al perturbar la entrada).
- No dispone de reconocimiento de voz funcional, tool calling, capacidades de agente, multilingüismo ni modos de razonamiento: no es un modelo entrenado para tareas reales.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture con el mismo código que el Hubert real y verificar que el pipeline de Transformers, el preprocesador y la decodificación CTC funcionan de extremo a extremo sin descargar cientos de millones de parámetros.
- Validación de contratos de framework: comprobar que una versión nueva de Transformers sigue respetando `integration.json` y el directorio `integrations/transformers/expectations` antes de actualizar en producción.
- Smoke tests de infraestructura de serving: desplegar un endpoint de ASR de prueba con un artefacto de 0,0 GB para verificar enrutado, timeouts, límites de payload y formato de respuesta sin coste de GPU.
- Pruebas de compatibilidad de dtypes: verificar rutas de ejecución en float32, bfloat16 y float16 (incluidos gradientes) usando un modelo que el autor declara finito en los tres.
- Regresión de preprocesado de audio: al ser los ficheros de procesador copia byte a byte del checkpoint base, sirve para detectar cambios de comportamiento en la extracción de features o en el vocabulario.
- Reproducibilidad de builds: reconstruir el fixture con `python example/build_fixtures.py --fixture hubert-large-ls960-ft-mic` y comparar hashes de fichero registrados en `build.json`.
- Docencia y demos sin GPU: ilustrar la estructura de un `HubertForCTC` (extractor convolucional, encoder y cabeza CTC) con un modelo que cabe en CPU y memoria modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta puertas internas de validación, no métricas de calidad de reconocimiento de voz:

| Prueba interna | Resultado | Umbral |
|---|---|---|
| Sensibilidad a la entrada (`input_values:halve`) | 8,8e-06 con pesos aleatorios (descartado) | 0,001 |
| Finitud numérica en float32 / bfloat16 / float16 | Correcta (forward, loss, gradientes) | — |
| Pasos de entrenamiento del contrato | 350 | — |

No hay datos de WER, MMLU, HumanEval ni GSM8K, y no tendría sentido medirlos: el modelo está sobreajustado a un contrato de prueba y no ha sido entrenado para transcribir voz.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,18 GB con pesos en float32 (44.992 millones de parámetros declarados); en float16 o bfloat16 bajaría a unos 0,09 GB, aunque no se ha verificado experimentalmente.
- GPU recomendadas: cualquiera; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100. La GPU no es un requisito.
- CPU: viable para los smoke tests previstos, dado el tamaño reducido del encoder (2 capas).
- Cabe en cualquier GPU de consumo, incluida una iGPU con memoria compartida.
- Opciones de despliegue: Transformers es la vía documentada (el autor enlaza `integrations/transformers/usage.md`). No hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama, y al tratarse de un encoder de audio con cabeza CTC, los motores de generación de texto no aplican.
- Latencia y throughput: no disponibles. No se han publicado mediciones y, al no ser un modelo funcional, cualquier cifra sería engañosa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Calidad ASR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/hubert-large-ls960-ft-mic | 44.992 (fixture, 2 capas) | Ventana definida por el preprocessor copiado | Nula (sobreajustado a 350 pasos) | No disponible | Público, 0 descargas |
| facebook/hubert-large-ls960-ft | No disponible en la información (checkpoint large completo, 24 capas) | Ídem, versión completa | Reconocimiento de voz en inglés (WER no verificado en esta ficha) | No disponible en la información | Público, checkpoint de referencia |
| wav2vec2-large-960h-lv60-self | No disponible | Audio 16 kHz | ASR en inglés | No disponible en la información | No verificado |
| Whisper (variantes large) | No disponible | Audio de 30 s por ventana | Multilingüe, ASR + traducción | No disponible en la información | No verificado |

Las alternativas se incluyen por categoría (ASR acústico con encoder Transformer), pero sus cifras de parámetros, WER y licencia no están verificadas en la información proporcionada, por lo que no se comparan numéricamente. La diferencia sustantiva y comprobable es funcional: solo el checkpoint base de Facebook es un modelo utilizable.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo declara explícitamente «a test artifact, not a usable model» y lo etiqueta `test-artifact`.
- Arquitectura encogida a 2 capas frente a las 24 del checkpoint original: la capacidad representacional es una fracción de la del Hubert large real.
- Pesos sobreajustados al contrato de 350 pasos; no hay garantía de generalización a ninguna entrada de audio real.
- El recuento de parámetros es inconsistente entre fuentes: safetensors reporta 44.992 y el README habla de «0.0M-parameter fixture». Conviene no usar la cifra para estimaciones de capacidad.
- Licencia no disponible: no puede asumirse uso comercial. Cualquier uso en producción requeriría verificar la licencia del checkpoint base `facebook/hubert-large-ls960-ft`.
- Idiomas no declarados; no se debe inferir cobertura multilingüe del nombre del checkpoint base.
- Riesgo de alucinación y de transcripciones sin sentido: la cabeza CTC sobre pesos sobreajustados producirá salidas degeneradas ante audio real.
- Sin benchmarks publicados de WER ni de ninguna otra métrica de calidad; cualquier evaluación de rendimiento debe hacerse contra el checkpoint base, no contra este fixture.
- 0 descargas y 0 likes: no hay evidencia de uso externo ni de validación por terceros.
- No debe incluirse en catálogos de modelos candidatos ni en pipelines de producción; su función es exclusivamente de prueba.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/hubert-large-ls960-ft-mic
- Modelo base: https://huggingface.co/facebook/hubert-large-ls960-ft
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/hubert-large-ls960-ft-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/hubert-large-ls960-ft-mic/blob/main/integrations/transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic/hubert-large-ls960-ft-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/hubert-large-ls960-ft-mic/blob/main/build.json
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción de configuración (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
