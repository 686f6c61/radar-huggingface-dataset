# aiterra/alephbert-base-onnx

## Resumen

AlephBERT base ONNX es una conversion al formato ONNX del modelo AlephBERT base, un BERT en hebreo desarrollado originalmente por el ONLP Lab de la Universidad Bar-Ilan. La conversion la ha realizado Aiterra, un estudio israeli de desarrollo de agentes de IA, y su objetivo es permitir la inferencia sin PyTorch en entornos JavaScript (navegador y Node.js) mediante Transformers.js, asi como en Python con ONNX Runtime.

El modelo resuelve una necesidad practica de despliegue: el AlephBERT original solo se distribuye en formato PyTorch, lo que complica su uso en aplicaciones web o en entornos ligeros. Esta version ofrece dos ficheros, uno en fp32 (664 MB) numericamente identico al original y otro con cuantizacion dinamica int8 (167 MB), manteniendo la licencia Apache-2.0 del modelo base.

Arquitectonicamente es un transformer encoder de tipo BERT base, con aproximadamente 110 millones de parametros, vocabulario de 52.000 tokens y una longitud maxima de secuencia de 512 tokens. La tarea para la que se publica es fill-mask (modelo de lenguaje enmascarado), no generacion de texto ni embeddings de frases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (masked language model) |
| Parametros totales | aproximadamente 110 millones (BERT base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (model.onnx, 664 MB) e int8 dinamica QUInt8 (model_quantized.onnx, 167 MB) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 14, ejes de batch y secuencia dinamicos) |
| Libreria | transformers.js (tambien ONNX Runtime en Python) |
| Tamano del vocabulario | 52.000 tokens |
| Entradas | input_ids, attention_mask, token_type_ids (int64) |
| Salida | logits de forma (batch, tokens, 52000) |

## Arquitectura y entrenamiento

El modelo base es AlephBERT, un BERT base entrenado especificamente para hebreo por el ONLP Lab. Segun la model card, el entrenamiento original utilizo la Wikipedia en hebreo, la parte hebrea de OSCAR y tuits en hebreo. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron fases de ajuste adicionales mas alla del preentrenamiento estilo BERT (MLM y NSP).

La conversion a ONNX se realizo con `torch.onnx.export` (opset 14) y posteriormente se aplico `onnxruntime.quantization.quantize_dynamic` con `QuantType.QUInt8`. Las versiones empleadas fueron PyTorch 2.1.0, Transformers 4.35.0, ONNX 1.17.0 y ONNX Runtime 1.23.0. No hay innovaciones arquitectonicas propias de esta version: se trata de un cambio de formato y una cuantizacion, manteniendo los pesos originales.

## Capacidades

- Relleno de mascaras (fill-mask): predice el token [MASK] en una frase en hebreo, devolviendo los logits sobre el vocabulario completo.
- Modelado de lenguaje enmascarado: util para tareas derivadas como correccion ortografica, sugerencia de palabras o analisis de probabilidad de tokens.
- Inferencia sin PyTorch: ejecutable en navegador y Node.js via Transformers.js, y en Python via ONNX Runtime.
- Soporte de cuantizacion int8 para despliegues con restricciones de memoria.
- No genera texto libre, no es un modelo instruct ni de chat.
- No produce embeddings de frases; para busqueda o similitud semantica se requiere un modelo entrenado para ello.
- No dispone de tool calling, function calling ni capacidades de agente.
- Capacidad multilingue limitada al hebreo.

## Casos de uso

- Autocompletado y sugerencia de palabras en aplicaciones web en hebreo: el modelo se puede cargar con `dtype: 'q8'` (167 MB) en el navegador mediante Transformers.js para predecir el siguiente token enmascarado en formularios o editores de texto.
- Correccion ortografica y deteccion de errores: enmascarando el token sospechoso y comparando la prediccion del modelo con el token original, se puede construir un corrector heuristico para texto hebreo.
- Procesamiento por lotes en Python sin PyTorch: uso de ONNX Runtime para integrar el modelo en pipelines existentes de NLP en hebreo donde PyTorch no esta disponible o es demasiado pesado.
- Extensiones de navegador para asistencia linguistica: al ejecutarse en el navegador con Transformers.js, permite ofrecer sugerencias en tiempo real sin enviar texto a un servidor.
- Prototipado rapido de tareas derivadas de BERT en hebreo: punto de partida para fine-tuning en clasificacion de texto, NER o analisis de sentimiento, usando la version fp32 para preservar la numerica original.
- Educacion e investigacion: estudio del comportamiento de modelos BERT en hebreo y comparacion entre versiones fp32 e int8 en tareas controladas.
- Despliegue en dispositivos con poca memoria: la version int8 de 167 MB permite ejecutar el modelo en entornos con menos de 1 GB de RAM disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una comprobacion cualitativa con tres frases, comparando las predicciones top-5 del modelo PyTorch original con las de los dos ficheros ONNX:

| Frase | PyTorch y model.onnx | model_quantized.onnx |
|---|---|---|
| ירושלים היא [MASK] של ישראל. | הבירה, הבית, בירת, הלב, ביתם | הבירה, הבית, בירת, העתיד, ביתם |
| הילדים הלכו לבית [MASK] בבוקר. | הספר, ספר, הכנסת, החולים, חולים | הספר, ספר, הכנסת, החולים, הקפה |
| אני רוצה לשתות כוס [MASK]. | מים, קפה, יין, תה, מיץ | מים, קפה, יין, תה, מיץ |

Segun el autor, la diferencia maxima en cualquier logit entre PyTorch y `model.onnx` es inferior a 0,00005 en estas frases, con top-5 identico. En la version cuantizada, las tres primeras predicciones se mantienen y la cuarta o quinta pueden cambiar. El propio autor advierte que tres frases son una comprobacion de cordura, no un benchmark.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 700 MB para el fichero fp32 y unos 200 MB para el cuantizado int8, incluyendo overhead de runtime.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problemas. Cualquier GPU con al menos 1 GB de memoria es suficiente si se desea aceleracion.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU y en el navegador.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers` 4.3.2 probado en Node.js), ONNX Runtime en Python, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se han publicado datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Formato | Licencia |
|---|---|---|---|---|---|
| aiterra/alephbert-base-onnx | ~110 M | 512 tokens | hebreo | ONNX | Apache-2.0 |
| onlplab/alephbert-base | ~110 M | 512 tokens | hebreo | PyTorch (safetensors/bin) | Apache-2.0 |
| Modelos BERT base multilingues (p. ej. bert-base-multilingual-cased) | ~178 M | 512 tokens | multilingue | PyTorch, ONNX (comunidad) | Apache-2.0 |

La ventaja principal frente al AlephBERT original es la disponibilidad en ONNX, que habilita despliegues en JavaScript y en entornos sin PyTorch. Frente a BERT multilingue, AlephBERT esta especializado en hebreo, lo que suele traducirse en mejor rendimiento en tareas en ese idioma, aunque no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de lenguaje enmascarado: no genera texto ni mantiene conversaciones; su salida son logits sobre el vocabulario.
- No devuelve embeddings de frases; para busqueda o similitud semantica se necesita un modelo especifico de embeddings.
- Longitud maxima de entrada de 512 tokens, igual que el modelo original.
- Entrenado sobre Wikipedia en hebreo, OSCAR y tuits, por lo que hereda los sesgos de esos corpus.
- La cuantizacion int8 puede alterar predicciones en posiciones cuarta y quinta del ranking; conviene validar en datos propios antes de usar en produccion.
- Solo soporta hebreo; no es adecuado para otros idiomas.
- Licencia Apache-2.0, que permite uso comercial, pero se debe citar el paper original de AlephBERT segun indica el autor.
- La model card advierte explicitamente de que la comprobacion con tres frases no constituye un benchmark; no hay garantias de precision en tareas especificas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aiterra/alephbert-base-onnx
- Modelo base original: https://huggingface.co/onlplab/alephbert-base
- Paper de AlephBERT: https://arxiv.org/abs/2104.04052
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Sitio del conversor (Aiterra): https://www.aiterra.co.il
- Herramientas de Aiterra: https://www.aiterra.co.il/tools
