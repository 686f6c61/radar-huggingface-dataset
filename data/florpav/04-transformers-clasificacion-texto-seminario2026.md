# florpav/04-transformers-clasificacion-texto-seminario2026

## Resumen

El modelo `florpav/04-transformers-clasificacion-texto-seminario2026` es un clasificador binario de texto en español desarrollado por el usuario florpav como ejemplo pedagógico para el Seminario de Actualización del IFTS N.º 18 (docente: Cynthia M. Villagra). Se trata de un BERT diminuto entrenado desde cero, no de un fine-tuning sobre un modelo preentrenado, cuyo objetivo es ilustrar el conjunto completo de artefactos que se publican al compartir un modelo en Hugging Face: arquitectura (`config.json`), pesos (`model.safetensors`), tokenizer (`tokenizer.json`, `tokenizer_config.json`) y scripts de entrenamiento e inferencia.

La tarea que resuelve es la clasificación de comentarios cortos sobre departamentos en dos clases: `positivo` (1) y `negativo` (0). Con 20.546 parámetros totales, 2 capas, 2 cabezas de atención y dimensión oculta de 32, es un modelo de juguete cuyo valor es didáctico, no productivo. El tokenizer es de nivel palabra (`WordLevel`) con un vocabulario de solo 37 tokens, lo que limita drásticamente su cobertura léxica.

Es relevante ahora únicamente como material de formación: demuestra el flujo completo de entrenamiento supervisado con `BertForSequenceClassification`, `AdamW` y entropía cruzada, y sirve para discutir por qué un accuracy perfecto en test puede ser engañoso cuando el conjunto de evaluación comparte plantillas y vocabulario con el de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (`BertForSequenceClassification`), transformer encoder |
| Parámetros totales | 20.546 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no documentada en la model card) |
| Tipos de cuantización | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | español (`es`) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.json`, `tokenizer.json` y `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT con 2 capas, 2 cabezas de atención, dimensión de modelo de 32 y aproximadamente 20.500 parámetros, configurado como `BertForSequenceClassification` con dos etiquetas (`negativo` = 0, `positivo` = 1). El tokenizer es `WordLevel` con 37 tokens, normaliza a minúsculas y elimina tildes. El modelo se entrenó desde cero, sin inicialización desde un checkpoint preentrenado, lo que lo aleja del flujo habitual de fine-tuning.

El entrenamiento fue supervisado con un dataset sintético generado en `train.py` a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos), produciendo 368 comentarios: 294 para entrenamiento y 74 para evaluación. Se usó entropía cruzada como función de pérdida, optimizador `AdamW` con tasa de aprendizaje 0,001, 15 épocas y lotes de 16, sobre PyTorch y Hugging Face Transformers. No se documenta uso de RLHF, DPO ni ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Clasificación binaria de texto corto en español: asigna `positivo` o `negativo` a comentarios sobre departamentos.
- Inferencia mediante `pipeline("text-classification")` de Transformers, compatible con Transformers 4 y 5.
- Publicación completa de artefactos (pesos, tokenizer y configuración) como ejemplo reproducible del ciclo de vida de un modelo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo español y con un vocabulario de 37 palabras.
- No dispone de modo thinking, visión ni audio.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Docencia de transformers: usar el modelo y sus scripts (`train.py`, `predict.py`) para explicar en clase cómo se compone un modelo de Hugging Face y qué contiene cada archivo del repositorio.
- Demostración del problema `[UNK]`: introducir frases fuera del vocabulario para mostrar que el modelo responde con alta confianza a entradas que no comprende, ilustrando el riesgo de confianza calibrada de forma incorrecta.
- Ejercicio de evaluación crítica: analizar por qué un accuracy de 1,000 sobre 74 ejemplos no implica generalización, dado que test y train comparten plantillas y adjetivos.
- Práctica de tokenización a nivel palabra: comparar el tokenizer `WordLevel` de 37 tokens con tokenizers subword (BPE, WordPiece) para discutir cobertura léxica y manejo de palabras desconocidas.
- Punto de partida para un fine-tuning real: sustituir este modelo por un checkpoint preentrenado en español y reutilizar el pipeline de entrenamiento con comentarios reales, como recomienda la propia model card.
- Prueba de integración de endpoints: el tag `endpoints_compatible` permite verificar el despliegue de un clasificador mínimo en infraestructura de Hugging Face sin coste de cómputo relevante.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios sintéticos de evaluación |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El accuracy de 1,000 es optimista por construcción: el conjunto de test emplea las mismas plantillas y los mismos 16 adjetivos que el de entrenamiento, por lo que no mide generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 20.546 parámetros en safetensors el modelo ocupa unos pocos kilobytes en disco y cabe holgadamente en cualquier GPU o incluso en CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema. Cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: `transformers` con `pipeline`, Hugging Face Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference (tag `text-embeddings-inference`). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la latencia sería de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| florpav/04-transformers-clasificacion-texto-seminario2026 | 20.546 | no disponible | es | MIT | Ejemplo pedagógico, vocabulario de 37 tokens, accuracy 1,000 sobre test sintético |
| BERT-base multilingüe (referencia) | ~110 M | 512 | multilingüe | Apache 2.0 | Modelo preentrenado estándar para fine-tuning; no disponible en la información como comparación directa |
| BETO (BERT en español) | ~110 M | 512 | es | Apache 2.0 | Referencia habitual para clasificación de texto en español; no disponible en la información como comparación directa |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparativa anterior es cualitativa y de orden de magnitud.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no apto para producción.
- Vocabulario de solo 37 palabras: cualquier término fuera de él se convierte en `[UNK]`, y el modelo responde igualmente con confianza alta (por ejemplo, `negativo (1.00)` ante entradas incomprensibles).
- No entiende negaciones ("no es luminoso") ni ironía, porque no aparecen en el conjunto de entrenamiento.
- El dataset es sintético y generado por plantillas; el accuracy de 1,000 es optimista y no refleja rendimiento en datos reales.
- Sesgos conocidos: no documentados explícitamente, pero el vocabulario y las plantillas restringen el dominio a comentarios sobre departamentos con 16 adjetivos concretos.
- Riesgo de alucinación de etiqueta: al ser un clasificador, el riesgo se manifiesta como asignación segura de una clase a entradas fuera de distribución.
- Licencia MIT: permite uso comercial, pero el modelo no es funcionalmente útil fuera del ámbito didáctico.
- Modelo y tokenizer son inseparables: publicar los pesos sin el tokenizer de 37 tokens inutiliza el modelo.
- La model card recomienda, para uso real, partir de un modelo preentrenado en español y hacer fine-tuning con comentarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/florpav/04-transformers-clasificacion-texto-seminario2026
