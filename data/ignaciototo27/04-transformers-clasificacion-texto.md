# IgnacioToto27/04-transformers-clasificacion-texto

## Resumen

El modelo `IgnacioToto27/04-transformers-clasificacion-texto` es un clasificador binario de texto en espanol desarrollado por IgnacioToto27 en el marco del Seminario de Actualizacion del IFTS N.o 18, con fines exclusivamente pedagogicos. Se trata de un BERT diminuto entrenado desde cero para clasificar comentarios cortos sobre departamentos en dos categorias: `positivo` o `negativo`. Su proposito no es resolver un problema real de produccion, sino ilustrar todas las piezas que componen la publicacion de un modelo en Hugging Face Transformers: arquitectura, pesos, tokenizer y scripts de entrenamiento e inferencia.

La arquitectura es `BertForSequenceClassification` con solo 2 capas, 2 cabezas de atencion y una dimension oculta de 32, sumando aproximadamente 20.546 parametros. El tokenizer es de tipo `WordLevel` con un vocabulario de 37 tokens, lo que convierte el modelo en una pieza extremadamente compacta y limitada a un dominio lexico muy reducido.

Su relevancia es didactica: demuestra de forma reproducible el ciclo completo de entrenamiento supervisado, evaluacion y publicacion de un modelo de clasificacion de texto, incluyendo los riesgos de sobreajuste y de confianza excesiva en predicciones fuera de distribucion. No es adecuado para uso en produccion ni para tareas reales de clasificacion de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertForSequenceClassification`), 2 capas, 2 cabezas de atencion, dimension oculta 32 |
| Parametros totales | 20.546 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (modelo demasiado pequeno para cuantizacion practica) |
| Idiomas soportados | espanol |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tokenizer | `WordLevel`, 37 tokens, minusculas y sin tildes |
| Etiquetas | `negativo` (0), `positivo` (1) |
| Libreria | transformers (compatible con Transformers 4 y 5) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT en su configuracion minima: 2 capas de encoder, 2 cabezas de atencion y dimension oculta de 32, configurado para clasificacion de secuencias con dos etiquetas de salida. El tokenizer es un `WordLevel` con 37 tokens que normaliza a minusculas y elimina tildes, lo que implica que cualquier palabra fuera de ese vocabulario se mapea a `[UNK]`.

El entrenamiento se realizo desde cero (sin inicializacion desde un modelo preentrenado) sobre un dataset sintetico de 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos). Se usaron 294 registros para entrenamiento y 74 para evaluacion, con 15 epocas, lotes de 16, optimizador AdamW con tasa de aprendizaje 0,001 y funcion de perdida de entropia cruzada calculada por el propio modelo al recibir `labels`. No se aplicaron tecnicas de RLHF ni DPO; el aprendizaje es puramente supervisado y de dominio muy restringido.

## Capacidades

- Clasificacion binaria de texto corto en espanol: asigna la etiqueta `positivo` o `negativo` a comentarios sobre departamentos.
- Inferencia mediante `pipeline("text-classification")` de Hugging Face Transformers.
- Reproducibilidad completa: incluye `train.py`, `predict.py` y `requirements.txt` en el repositorio.
- Compatibilidad con Transformers 4 y 5.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No soporta vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al espanol y, dentro de el, a un vocabulario de 37 palabras.

## Casos de uso

- Docencia de pipelines de NLP: el modelo sirve para que estudiantes ejecuten un `pipeline` de clasificacion de texto completo y comprendan la relacion entre modelo, tokenizer y etiquetas en un entorno controlado.
- Demostracion de publicacion en el Hub: permite ilustrar que archivos (`config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`) deben acompanar a un modelo para que sea usable.
- Analisis de sobreajuste: con un accuracy de 1,000 sobre test, es un caso practico para explicar por que una metrica perfecta no implica generalizacion, dado que test y entrenamiento comparten plantillas y adjetivos.
- Estudio de fallos fuera de distribucion: al introducir frases con palabras fuera del vocabulario, el modelo responde con alta confianza a entradas que no comprende, lo que sirve para discutir calibracion y robustez.
- Practica de tokenizacion: permite comparar el comportamiento de un tokenizer `WordLevel` de 37 tokens frente a tokenizers subword de modelos preentrenados, mostrando el impacto del `[UNK]`.
- Punto de partida para fine-tuning real: el repositorio sirve como plantilla estructural para sustituir el modelo diminuto por un BERT preentrenado en espanol y reentrenar con datos reales.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios de test sinteticos |

El autor advierte explicitamente de que este resultado es optimista porque el conjunto de test comparte plantillas y adjetivos con el de entrenamiento. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 20.546 parametros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` con PyTorch mediante `pipeline("text-classification")`; el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face, aunque no se detallan configuraciones.
- Latencia y throughput: no disponibles; por el tamano del modelo, la latencia en CPU sera del orden de milisegundos por peticion.
- No se recomienda su uso con vLLM, llama.cpp u Ollama, orientados a modelos de mayor escala y otros formatos de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `IgnacioToto27/04-transformers-clasificacion-texto` | 20.546 | no disponible | es | MIT | Educativo, clasificacion binaria sintetica |
| BETO (`dccuchile/bert-base-spanish-wwm-cased`) | ~110 M | 512 tokens | es | no disponible en la informacion | Clasificacion y NLP general en espanol |
| `finiteautomata/beto-sentiment-analysis` | ~110 M | 512 tokens | es | no disponible en la informacion | Analisis de sentimiento en espanol |
| `pysentimiento/robertuito-sentiment-analysis` | ~110 M | 128 tokens | es | no disponible en la informacion | Analisis de sentimiento en espanol (tuits) |

La comparacion es asimetrica por diseno: el modelo de IgnacioToto27 es dos ordenes de magnitud menor que los BERT en espanol habituales y no esta pensado para competir con ellos. Para cualquier tarea real de clasificacion de sentimiento en espanol, los modelos preentrenados de la tabla son la opcion adecuada.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para produccion.
- Vocabulario de solo 37 palabras: cualquier termino fuera de el se convierte en `[UNK]`, y el modelo responde igualmente con alta confianza (por ejemplo, `negativo` con score 1,00 ante frases incomprensibles).
- No entiende negaciones ("no es luminoso") ni ironia, porque no aparecen en el dataset de entrenamiento.
- El accuracy de 1,000 es optimista: test y entrenamiento comparten plantillas y adjetivos.
- Dataset sintetico generado por plantillas, sin datos reales.
- Riesgo elevado de alucinacion en el sentido de predicciones seguras pero incorrectas fuera de distribucion.
- Limitado al espanol y a un dominio lexico minimo; no cubre variaciones dialectales ni registro informal.
- Licencia MIT: permite uso comercial, pero el modelo no es funcionalmente util para ello.
- El modelo y su tokenizer son inseparables; publicarlo sin el tokenizer lo hace inutilizable.
- Para uso real se recomienda partir de un modelo preentrenado en espanol y hacer fine-tuning con comentarios reales.

## Enlaces

- Hugging Face: https://huggingface.co/IgnacioToto27/04-transformers-clasificacion-texto
- No se han encontrado en la busqueda web otros enlaces (papers, blogs, repositorios o demos) asociados a este modelo.
