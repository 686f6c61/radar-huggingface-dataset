# japan-opendata/ja-nli-v1

## Resumen

ja-nli-v1 es un modelo de inferencia de lenguaje natural (NLI) para japones desarrollado por Japan Open Data Lab, publicado bajo licencia Apache 2.0. Su funcion es clasificar la relacion entre un texto de premisa y un texto de hipotesis en tres clases: implicacion (entailment), neutral y contradiccion. Se posiciona como un componente de verificacion para insertar antes o despues de la generacion en pipelines de RAG, comprobando si una respuesta contradice las fuentes recuperadas.

Arquitectonicamente es un encoder ModernBERT afinado para clasificacion de secuencias, construido sobre el checkpoint sbintuitions/modernbert-ja-130m (MIT). Cuenta con 132.404.739 parametros totales y una longitud maxima de entrada de 1.024 tokens, con truncado aplicado unicamente al lado de la premisa. El repositorio ocupa 1,1 GB e incluye pesos en safetensors y una exportacion ONNX en FP32 (opset 17).

Su relevancia practica radica en dos factores: por un lado, el entrenamiento se ha realizado exclusivamente con datos sinteticos generados a partir de corpus de licencia limpia (PDL1.0, MIT y Apache-2.0), evitando las restricciones de uso de los datasets NLI japoneses existentes; por otro, reporta una precision de 0,9612 (accuracy y Macro F1) en un conjunto de test sellado de 5.000 ejemplos, muy por encima del zero-shot de modelos multilingues comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), clasificacion de secuencias |
| Parametros totales | 132.404.739 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (truncado solo en la premisa) |
| Tipos de cuantizacion | FP32 (ONNX incluido); no se distribuye version INT8 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/modernbert-ja-130m, un encoder ModernBERT preentrenado en japones, y se afina como clasificador de tres clases sobre pares premisa-hipotesis. La entrada se procesa hasta 1.024 tokens, con truncado restringido a la premisa para preservar integra la hipotesis. La implementacion de referencia (examples/infer_nli.py) soporta tanto PyTorch como ONNX, y la correspondencia de etiquetas se documenta en inference_config.json.

El entrenamiento utiliza exclusivamente datos sinteticos. El corpus semilla se compone de documentos publicos con licencia PDL1.0 y documentacion de proyectos OSS en japones con licencias MIT o Apache-2.0 verificadas. La generacion de pares la realizo un LLM de pesos abiertos y la validacion se hizo con un modelo distinto mediante juicio ciego. Una auditoria de 200 muestras aleatorias reporto una tasa de etiquetas validas del 95,0 % y una naturalidad del japones del 94,5 %. No se emplearon JSNLI, JNLI, JSICK, JaNLI, XNLI ni ANLI en el entrenamiento por sus condiciones de licencia; solo se usaron como referencia para mediciones zero-shot. El autor reporta ademas pruebas de robustez: al sustituir la premisa por una no relacionada la precision cae hasta aproximadamente 0,38, y un sondeo de hipotesis aislada baja hasta cerca de 0,63, lo que indica que el modelo no aprende atajos basados solo en la hipotesis.

## Capacidades

- Clasificacion NLI en tres clases (entailment, neutral, contradiction) para pares de textos en japones.
- Verificacion de respuestas generadas frente a documentos fuente en pipelines RAG.
- Comprobacion de consistencia entre resultados de busqueda y afirmaciones de un texto.
- Devuelve probabilidades por clase, lo que permite umbrales configurables.
- Entrada de hasta 1.024 tokens con truncado controlado de la premisa.
- Inferencia en CPU viable: aproximadamente 109 ms por ejemplo en un i7-11700F con premisas largas.
- Exportacion ONNX con paridad exacta de predicciones respecto a PyTorch en conjuntos de desarrollo y test (200 ejemplos cada uno).
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Verificacion de respuestas en RAG: tras recuperar fragmentos y generar una respuesta, cada afirmacion se contrasta con el pasaje de origen; si el clasificador devuelve "contradiction" por encima de un umbral, la respuesta se bloquea o se regenera. Es adecuado por su bajo coste y su ventana de 1.024 tokens, suficiente para pasajes y afirmaciones individuales.
- Filtrado de alucinaciones en resumenes: comparar cada frase del resumen con el documento original y descartar o marcar las que contradigan la fuente.
- Validacion de pares pregunta-respuesta en FAQs: comprobar que la respuesta de un sistema automatico implica la pregunta formulada y no la contradice.
- Deduplicacion semantica de contenidos: detectar pares de articulos o entradas que afirman lo contrario entre si, usando la clase "contradiction" como senal.
- Control de calidad en anotacion de datos: preetiquetar pares NLI en japones para revision humana, reduciendo el coste de anotacion manual.
- Moderacion de contenido factual: en foros o comentarios, contrastar afirmaciones de usuarios contra una base de hechos verificados y senalar contradicciones.
- Evaluacion de sistemas de traduccion o parafrasis: medir si la salida preserva la relacion de implicacion con la entrada original.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | Metrica | ja-nli-v1 | mDeBERTa (zero-shot, ref. 1) | mDeBERTa (zero-shot, ref. 2) |
|---|---|---|---|---|---|
| Test sellado | 5.000 ejemplos, aislado del entrenamiento | Accuracy / Macro F1 | 0,9612 | 0,7920 | 0,8094 |
| Evaluacion con revision humana | 600 ejemplos | Accuracy | 0,9567 | 0,8433 | 0,8433 |
| Errores entailment/contradiction | 600 ejemplos | Tasa de confusion | 0,5 % (3 casos) | no disponible | no disponible |
| Sondas de robustez (premisa sustituida) | — | Accuracy | ~0,38 | no disponible | no disponible |
| Sonda de hipotesis aislada | Evaluacion humana | Accuracy | ~0,63 | no disponible | no disponible |

Los dos modelos de referencia corresponden a variantes mDeBERTa de MoritzLaurer evaluadas en zero-shot bajo las mismas condiciones. No se han publicado resultados en otros benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 132 M de parametros; en la practica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en todas las gamas actuales.
- Opciones de despliegue: PyTorch (script de referencia incluido), ONNX Runtime (exportacion FP32, opset 17), y cualquier servidor compatible con modelos de clasificacion de Hugging Face (por ejemplo, pipelines de transformers). No se documenta soporte especifico para vLLM o TGI.
- Latencia: aproximadamente 109 ms por ejemplo en CPU (i7-11700F) con premisas largas; en GPU la latencia sera notablemente inferior, aunque no se proporcionan cifras concretas.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento NLI japones |
|---|---|---|---|---|---|
| ja-nli-v1 | 132 M | 1.024 tokens | ja | Apache 2.0 | 0,9612 accuracy en test sellado propio; 0,9567 en evaluacion humana |
| mDeBERTa NLI (MoritzLaurer, variante 1) | no disponible | no disponible | multilingue | no disponible | 0,7920 zero-shot en test propio; 0,8433 en evaluacion humana |
| mDeBERTa NLI (MoritzLaurer, variante 2) | no disponible | no disponible | multilingue | no disponible | 0,8094 zero-shot en test propio; 0,8433 en evaluacion humana |

La comparacion no es completamente equivalente: ja-nli-v1 esta afinado especificamente para NLI en japones, mientras que las variantes mDeBERTa se evaluaron en zero-shot. No se dispone de datos de otros modelos NLI japoneses comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta japones; no se ha evaluado su comportamiento en otros idiomas.
- La ventana de 1.024 tokens puede ser insuficiente para documentos largos; el truncado de la premisa puede eliminar informacion relevante para la clasificacion.
- El entrenamiento es completamente sintetico: aunque la auditoria reporta un 95,0 % de etiquetas validas, persiste el riesgo de que los sesgos del modelo generador se transfieran al clasificador.
- El modelo puede alucinar en el sentido de asignar alta confianza a relaciones incorrectas en dominios alejados del corpus semilla (documentos publicos y documentacion tecnica).
- La caida de precision a ~0,38 con premisas no relacionadas indica que el modelo es sensible a la relevancia de la premisa; conviene aplicar umbrales y validacion en produccion.
- No se distribuye version INT8, lo que limita optimizaciones de latencia en CPU para despliegues de alto volumen.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y el aviso de cambios; el modelo base sbintuitions/modernbert-ja-130m es MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-nli-v1
- Pagina del modelo en el sitio del autor: https://jpopendata.jp/models/ja-nli-v1/
- Demo en navegador (Hugging Face Spaces): https://huggingface.co/spaces/japan-opendata/ja-nli-demo
- Modelo en Kaggle: https://www.kaggle.com/models/japanopendatalab/ja-nli-v1
- Perfil del autor en Hugging Face: https://huggingface.co/japan-opendata
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
