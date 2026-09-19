# algerian-nlp/DZAIR-FP16

## Resumen

DZAIR-FP16 es la version en media precision (float16) del encoder fundacional DZAIR, desarrollado por el colectivo algerian-nlp para el dialecto arabe argelino (Darija, codigo `arq`). Se trata de un modelo de 105.304.320 parametros (105,3 M) orientado a extraccion de caracteristicas y clasificacion de secuencias, no a generacion de texto. El repositorio ocupa 0,2 GB y el unico fichero de pesos (`model.safetensors`) pesa 200,86 MB, frente a los 401,71 MB de la version FP32 original.

El modelo cubre tres registros de escritura que conviven en la comunicacion digital argelina: arabe estandar escrito en caracteres arabes, arabizi (transliteracion latina con numerales como 3 para ayn o 7 para ha) y code-switching con frances. Se distribuye como un build cuantizado del modelo base `algerian-nlp/DZAIR`, con una receta de conversion documentada (cast directo a `torch.float16` y serializacion en safetensors) y verificacion de fidelidad mediante similitud coseno (umbral >= 0,999).

Su relevancia practica es doble: por un lado, reduce el consumo de VRAM y de ancho de banda a la mitad sin perdida medible de calidad en las tareas evaluadas (paridad del 100 % en las tres tareas de sentimiento declaradas); por otro, ofrece un encoder especificamente entrenado para un dialecto historicamente mal cubierto por los modelos arabes genericos, que suelen estar dominados por arabe moderno estandar y egipcio o golfo. Exige `trust_remote_code=True` porque la implementacion vive en `modeling_dzair.py` (58,18 KB) y no en la libreria estandar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional tipo transformer (implementacion propia en `modeling_dzair.py`, requiere `trust_remote_code`) |
| Parametros totales | 105.304.320 (105,3 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (cast directo a `torch.float16`); el modelo base existe en FP32. No se documentan variantes INT8, INT4 ni GGUF |
| Idiomas soportados | `arq` (Darija argelina) en caracteres arabes, arabizi latin y code-switching con frances |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (99 tensores, 200,86 MB) |
| Dimension oculta (`last_hidden_state`) | 768 |
| Vocabulario | 48.000 tokens, SentencePiece Unigram |
| Ficheros adicionales | `config.json` (1,04 KB), `modeling_dzair.py` (58,18 KB), `tokenizer.model` (967,83 KB), `tokenizer_config.json` (370 B) |
| SHA-256 pesos base | `b2448ca8dbc015cd90e13fce851122a15ac2855ff445c09f4af36d382709c006` |
| SHA-256 `model.safetensors` FP16 | `8a9322b6b48bbb25edb9d80969265291f045cb1683cee9f4f61a1d2094da1523` |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | `feature-extraction` |

## Arquitectura y entrenamiento

DZAIR-FP16 hereda la arquitectura del encoder `algerian-nlp/DZAIR`: un transformer bidireccional con estado oculto de 768 dimensiones y vocabulario SentencePiece Unigram de 48.000 entradas. El tokenizador aplica reglas de normalizacion especificas para Darija: unifica las hamzas a alef simple y elimina tatweels no semanticos, pero preserva los numerales del arabizi (3, 7, 9), que son fonemas y no ruido. La model card recomienda ademas poner en minusculas los caracteres latinos antes de tokenizar, para preservar la fertilidad de la tokenizacion del arabizi.

El proceso de conversion es un cast directo de los pesos FP32 a FP16, serializado en safetensors y validado con la herramienta `tools/quantize_hf.py` con un umbral de fidelidad coseno de 0,999. No hay destilacion, poda ni calibracion por cuantizacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron fases de RLHF o DPO (poco probables en un encoder de este tipo). Si se documentan las metricas de fidelidad de la conversion: similitud coseno de 1.000000 frente al modelo FP32, MAE de 0,000293 y diferencia absoluta maxima de 0,002944.

## Capacidades

- Generacion de representaciones contextuales de 768 dimensiones por token y embeddings de frase, aptas para similitud semantica y busqueda vectorial.
- Clasificacion de secuencias mediante cabecera supervisada (el autor reporta un protocolo `cls+mlp` con 3 epocas y 10 semillas).
- Analisis de sentimiento sobre texto en arabizi, foros y Twitter, incluyendo mezcla de alfabetos en la misma frase.
- Manejo de code-switching arabe-frances sin preprocesado adicional, segun los ejemplos de uso de la model card.
- Normalizacion y tokenizacion integradas para arabizi y arabe argelino (unificacion de hamzas, eliminacion de tatweel, vocabulario de 48.000 piezas).
- Extraccion de caracteristicas compatible con el ecosistema transformers mediante `AutoModel` y `AutoTokenizer`.
- No soporta generacion de texto (es un encoder bidireccional, no un modelo causal).
- No soporta tool calling, function calling ni razonamiento multi-paso agentico.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- No se documenta soporte para dialectos distintos del argelino (egipcio, golfo) sin adaptacion.

## Casos de uso

- Analisis de sentimiento en redes sociales argelinas: el modelo se ha evaluado en Twifil (Twitter) y en corpus de foros con resultados de 78,94 % y 96,33 % de accuracy respectivamente, y su tokenizador esta disenado especificamente para arabizi, lo que evita el preprocesado manual de transliteraciones.
- Moderacion de comentarios en plataformas locales: al clasificar texto mixto arabe-frances, permite detectar discurso de odio o toxicidad en hilos donde los usuarios alternan alfabetos dentro de la misma frase.
- Busqueda semantica de documentacion en Darija: generando embeddings de 768 dimensiones se puede indexar un corpus de FAQs, manuales o tickets en una base vectorial y recuperar por similitud, sin depender de coincidencia lexica exacta.
- Deteccion de intenciones en asistentes conversacionales: la cabecera de clasificacion sobre `last_hidden_state` permite entrenar un clasificador de intentos para bots de atencion al cliente en dialecto argelino, donde los modelos de arabe estandar rinden peor.
- Enrutamiento de tickets en centros de soporte: clasificar automaticamente reclamaciones escritas en arabizi o en mezcla con frances para asignarlas al equipo correspondiente, con un coste de inferencia muy bajo (200,86 MB de pesos).
- Etiquetado de corpus y anotacion asistida: usar los embeddings como caracteristica de entrada para modelos de NER o de clasificacion multietiqueta, reduciendo el volumen de datos anotados necesario frente a entrenar desde cero.
- Despliegue en el borde o en CPU: el build FP16 reporta 4.742 tok/s en CPU frente a 4.112 tok/s del FP32 (una mejora del 15,3 %), lo que permite ejecutar clasificacion en servidores sin GPU o en dispositivos Apple Silicon via MPS.
- Filtrado y deduplicacion semantica de datasets: la fidelidad coseno de 1.000000 respecto al modelo FP32 garantiza que la geometria de embeddings se mantiene, de modo que las decisiones de deduplicacion tomadas con FP32 siguen siendo validas con este build.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Las metricas de clasificacion corresponden a 10 semillas, protocolo `cls+mlp` y 3 epocas, y no estan verificadas de forma independiente.

| Tarea | Conjunto de evaluacion | Accuracy | Macro F1 | Retencion frente a FP32 |
|---|---|---|---|---|
| Analisis de sentimiento en arabizi | NArabizi Sentiment (test) | 0,6552 | 0,5961 | 100,0 % |
| Analisis de sentimiento en foros | Ranim Sentiment (test) | 0,9633 | 0,9594 | 100,0 % |
| Analisis de sentimiento en Twitter | Twifil Sentiment (test) | 0,7894 | 0,7834 | 100,0 % |

Metricas de fidelidad de la conversion y de eficiencia:

| Metrica | DZAIR FP32 (base) | DZAIR-FP16 | Retencion |
|---|---|---|---|
| Tamano en disco de `model.safetensors` | 401,71 MB | 200,86 MB | Reduccion del 50,0 % (compresion 2,0x) |
| Similitud coseno de embeddings | 1.000000 (referencia) | 1.000000 | 100,0 % |
| Error absoluto medio (MAE) | 0.000000 | 0.000293 | Distorsion practicamente nula |
| Diferencia absoluta maxima | 0.000000 | 0.002944 | Dentro del umbral de fidelidad (>= 0,999) |
| Throughput de inferencia en CPU | 4.112 tok/s | 4.742 tok/s | +15,3 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estos no son aplicables a un encoder bidireccional de 105 M de parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB solo para los pesos en FP16 (200,86 MB), mas el espacio de activaciones y el lote. Con lotes y secuencias habituales el consumo se mantiene por debajo de 1 GB en FP16.
- GPU compatibles: cualquier GPU NVIDIA con soporte CUDA, incluidas las de gama baja, dado el tamano reducido. El autor indica como entornos objetivo GPU NVIDIA CUDA de produccion y Apple Silicon (MPS).
- Cabe en GPU de consumo: si, con margen amplio en cualquier RTX (por ejemplo, 3060, 4060, 4090), asi como en GPUs integradas modestas y en CPU.
- Inferencia en CPU: viable y documentada por el autor, con un throughput declarado de 4.742 tok/s en FP16, aunque no se especifica el procesador ni el tamano de lote empleados en esa medicion.
- Opciones de despliegue: la model card solo documenta el uso directo con `transformers` y `torch` (`AutoModel`, `AutoTokenizer`, `trust_remote_code=True`). No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otras plataformas; al existir codigo personalizado (`modeling_dzair.py`), su compatibilidad con esos servidores no esta garantizada.
- Ancho de banda y almacenamiento: la reduccion del 50 % en el tamano de pesos disminuye los requisitos de transferencia, algo relevante para despliegues en el borde o para servir muchas replicas pequenas.
- Latencia: no disponible de forma desglosada; el unico dato publicado es el throughput agregado en CPU.

## Comparativa con modelos similares

La informacion proporcionada solo incluye datos del propio modelo y de su version FP32. No se dispone de cifras verificables de benchmarks ni de especificaciones de alternativas, por lo que los campos correspondientes se marcan como no disponibles.

| Modelo | Parametros | Contexto | Enfoque linguistico | Licencia | Rendimiento en Darija |
|---|---|---|---|---|---|
| DZAIR-FP16 (este modelo) | 105,3 M | No disponible | Darija argelina: arabe, arabizi y code-switching con frances | apache-2.0 | 65,52 % / 96,33 % / 78,94 % de accuracy en NArabizi, Ranim y Twifil |
| DZAIR (FP32, modelo base) | 105,3 M | No disponible | Identico a este modelo | apache-2.0 | Identico a este modelo (paridad del 100 %) |
| Encoders arabes genericos de tamano base (por ejemplo, variantes tipo BERT-base arabe y marroqui/argelino) | No disponible en la informacion proporcionada | No disponible | Principalmente arabe moderno estandar, con cobertura limitada de Darija y nula de arabizi | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: cualquier intento de usarlo para producir texto, resumir o conversar requiere anadir una cabecera o un decodificador externo, y su uso directo como generador no es valido.
- Alcance dialectal estricto: el autor indica explicitamente que no es adecuado para dialectos distintos del argelino (por ejemplo, egipcio o golfo) sin adaptacion previa.
- Uso prohibido por el autor para decisiones autonomas sobre personas; debe evitarse en credit scoring, seleccion de personal, moderacion con sancion automatica o cualquier flujo sin supervision humana.
- Riesgo de sesgo: no se documenta la composicion del corpus de entrenamiento ni analisis de sesgos por origen, genero o registro, por lo que se desconoce el comportamiento del encoder ante subgrupos poco representados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos o negativos en clasificacion cuando el texto contiene ruido, ironia o variantes ortograficas no vistas.
- Resultados no verificados: las tres metricas de accuracy y F1 estan marcadas como `verified: false` en el `model-index` y proceden del propio autor, con 10 semillas y 3 epocas. La varianza entre semillas no se reporta.
- La tarea de NArabizi muestra un rendimiento notablemente inferior (65,52 % de accuracy) frente a foros (96,33 %), lo que sugiere mayor dificultad del arabizi ruidoso y debe tenerse en cuenta al fijar expectativas en produccion.
- Longitud de contexto no documentada: no se especifica el limite maximo de posiciones, por lo que se desconoce el comportamiento con documentos largos.
- La licencia apache-2.0 permite uso comercial y modificacion, pero al requerir `trust_remote_code=True` la organizacion debe auditar `modeling_dzair.py` antes de desplegarlo en entornos sensibles.
- La medicion de throughput en CPU (4.742 tok/s) no especifica hardware ni configuracion de lote, por lo que no debe tomarse como cifra reproducible directamente.
- Cobertura multilingue limitada: fuera del par arabe argelino/frances, no hay garantia de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algerian-nlp/DZAIR-FP16
- Modelo base (FP32): https://huggingface.co/algerian-nlp/DZAIR
- Organizacion en HuggingFace: https://huggingface.co/algerian-nlp
- Implementacion del modelo en el repositorio: `modeling_dzair.py`
- Script de verificacion de fidelidad citado en la model card: `tools/quantize_hf.py`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su familia; los enlaces obtenidos correspondian a sitios generales de Microsoft y no guardan relacion con DZAIR. No se dispone de paper, blog tecnico, repositorio de codigo ni demo publicados en la informacion disponible.
