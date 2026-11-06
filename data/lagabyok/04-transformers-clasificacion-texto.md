# lagabyok/04-transformers-clasificacion-texto

## Resumen

El modelo `lagabyok/04-transformers-clasificacion-texto` es un clasificador de texto binario en español construido como ejemplo pedagógico para el Seminario de Actualización del IFTS N.º 18. Se trata de un BERT diminuto entrenado desde cero con `BertForSequenceClassification`, con 2 capas, 2 cabezas de atención, dimensión oculta de 32 y un total de 20.546 parámetros. Su tarea es clasificar comentarios cortos sobre departamentos como `positivo` o `negativo`.

El modelo no pretende ser una herramienta de producción: su valor es didáctico y muestra el conjunto completo de artefactos que se publican al compartir un modelo de Hugging Face (configuración, pesos en safetensors, tokenizer y scripts de entrenamiento e inferencia). El tokenizer es de tipo `WordLevel` con solo 37 tokens, lo que limita drásticamente el vocabulario que el modelo puede procesar.

Es relevante ahora únicamente como material de formación: ilustra el flujo completo de entrenamiento supervisado, publicación y consumo vía `pipeline`, y sirve para discutir por qué un accuracy del 100 % en test puede ser engañoso cuando el conjunto de evaluación comparte plantillas con el de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertForSequenceClassification`), 2 capas, 2 cabezas de atención, dimensión 32 |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tokenizer `WordLevel` de 37 tokens; sin límite de contexto documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español (`es`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT reducido a 2 capas, 2 cabezas de atención y dimensión 32, con una cabeza de clasificación de secuencia sobre 2 etiquetas (`negativo` = 0, `positivo` = 1). El tokenizer es `WordLevel` con 37 tokens: pasa el texto a minúsculas y elimina tildes, de modo que cualquier palabra fuera del vocabulario se mapea a `[UNK]`.

El entrenamiento es supervisado desde cero (sin preentrenamiento previo) sobre un dataset sintético de 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos); 294 registros para entrenamiento y 74 para evaluación. Se usó entropía cruzada como pérdida, optimizador AdamW con tasa de aprendizaje 0,001, 15 épocas y lotes de 16, con PyTorch y Hugging Face Transformers. No se documenta RLHF, DPO ni ninguna innovación técnica (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Clasificación binaria de texto corto en español (`positivo` / `negativo`).
- Inferencia vía `pipeline("text-classification")` de Transformers, compatible con Transformers 4 y 5.
- Publicación completa con tokenizer y pesos en safetensors, lista para `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- Capacidad multilingüe: no disponible (solo español, y con vocabulario de 37 palabras).

## Casos de uso

- Docencia de pipelines de clasificación: sirve para que el alumnado ejecute `pipeline("text-classification", model=...)` y observe la salida con etiqueta y score sobre frases de las plantillas de entrenamiento.
- Demostración del ciclo de publicación en el Hub: ejemplifica qué archivos (`config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`, `train.py`, `predict.py`, `requirements.txt`) deben acompañar a un modelo.
- Ilustración del problema de `[UNK]`: permite mostrar cómo una frase con palabras fuera del vocabulario ("tiene una vista increíble") se convierte en cuatro `[UNK]` y el modelo responde con seguridad alta pero incorrecta.
- Discusión sobre evaluación engañosa: el accuracy 1,000 sobre 74 ejemplos con las mismas plantillas y adjetivos que el entrenamiento sirve para explicar por qué el test debe ser independiente.
- Práctica de tokenización a nivel palabra: comparar `WordLevel` con 37 tokens frente a tokenizers subword de modelos preentrenados en español.
- Punto de partida para fine-tuning: el propio autor recomienda, para uso real, partir de un modelo preentrenado en español y hacer fine-tuning con comentarios reales, usando este repo como referencia de estructura.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios de test generados con las mismas plantillas y adjetivos que el entrenamiento |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El propio autor advierte que el 1,000 de accuracy es optimista por la construcción del dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 20.546 parámetros el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente (RTX 4090, A100, H100 no son necesarias).
- Cabe en GPU consumer: sí, en cualquier modelo (incluso integradas y CPU).
- Opciones de despliegue: `transformers` con `pipeline`; el repo está etiquetado como `text-embeddings-inference` y `endpoints_compatible`, por lo que puede servirse en Hugging Face Endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `lagabyok/04-transformers-clasificacion-texto` | 20.546 | no disponible | español | MIT | Ejemplo pedagógico, vocabulario de 37 tokens |
| `AraceliAmherdt/04-transformers-clasificacion-texto` | ~20,5k | no disponible | español | no disponible | Variante del mismo ejercicio (misma estructura y tamaño) |
| `grisselblanco/04-transformers-clasificacion-texto` | no disponible | no disponible | español | no disponible | Registro en free2aitools del mismo ejercicio |

No se dispone de comparación con clasificadores BERT preentrenados en español (BETO, MarIA, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para producción.
- Vocabulario de solo 37 palabras: cualquier término fuera del vocabulario se convierte en `[UNK]`, y el modelo responde igualmente con seguridad alta (por ejemplo, `negativo` con 1.00 ante frases desconocidas).
- No entiende negaciones ("no es luminoso") ni ironía, porque no aparecen en el dataset de entrenamiento.
- Dataset sintético generado con 5 plantillas y 16 adjetivos: el accuracy de test es optimista y no refleja generalización.
- Sesgos conocidos: no documentados, pero el vocabulario y las plantillas limitan el dominio a comentarios sobre departamentos con adjetivos predefinidos.
- Riesgo de alucinación: alto en el sentido de predicciones seguras sobre entradas fuera de distribución.
- Limitaciones de idioma: solo español, con normalización a minúsculas y eliminación de tildes.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones técnicas.
- Modelo y tokenizer son inseparables: sin el tokenizer original no puede usarse, ya que los índices de vocabulario son específicos.

## Enlaces

- Hugging Face: https://huggingface.co/lagabyok/04-transformers-clasificacion-texto
- Variante del ejercicio (AraceliAmherdt): https://huggingface.co/AraceliAmherdt/04-transformers-clasificacion-texto
- Registro en free2aitools (grisselblanco): https://free2aitools.com/model/grisselblanco/04-transformers-clasificacion-texto
