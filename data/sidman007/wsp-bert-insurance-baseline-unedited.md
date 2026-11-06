# sidman007/wsp-bert-insurance-baseline-unedited

## Resumen

`wsp-bert-insurance-baseline-unedited` es un modelo de clasificación de frases del dominio de seguros construido sobre `google-bert/bert-base-uncased` mediante técnicas de *weight-space programming* (WSP), un paradigma en el que un LLM editor lee y escribe directamente los pesos de la red aplicando matemática en forma cerrada sobre pesos y activaciones, sin retropropagación ni optimizadores. Lo publica el usuario `sidman007` como parte de una prueba de concepto con repositorio abierto en GitHub.

El modelo se presenta explícitamente como una **baseline no editada** (`_baselines/unedited`): según la model card, el número de tensores modificados es cero y el 0,000 % de los parámetros ha cambiado respecto al checkpoint base. Es decir, el artefacto publicado sirve como referencia de control del experimento, no como un clasificador de seguros funcional.

Su relevancia es metodológica más que práctica: documenta un protocolo de edición de pesos y sus métricas de partida. Con 109.488.392 parámetros, licencia Apache 2.0 y arquitectura BERT base, el rendimiento declarado es de 13,10 % de accuracy en test y macro-F1 de 0,0290 sobre 8 etiquetas, lo que equivale prácticamente a una asignación cuasi aleatoria entre clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (`BertForSequenceClassification` con cabeza de 8 etiquetas) |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base `bert-base-uncased` admite 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder BERT base (`bert-base-uncased`) con una cabeza de clasificación de secuencias adaptada a 8 etiquetas del dominio asegurador: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`. El modelo base es un encoder bidireccional de 12 capas y 768 dimensiones ocultas, preentrenado en inglés.

El punto diferencial es el método de adaptación: en lugar de fine-tuning supervisado con descenso de gradiente, un LLM editor modifica los pesos aplicando matemática en forma cerrada sobre los tensores y sobre las activaciones obtenidas en un número presupuestado de pasadas forward. No hay retropropagación, ni optimizadores, ni épocas de entrenamiento en el sentido habitual. En esta variante concreta, sin embargo, el manifiesto de edición (`edit_manifest.json`) registra **cero tensores modificados** y un 0,000 % de parámetros alterados: el checkpoint publicado es funcionalmente idéntico al base en lo que respecta a los pesos, y la cabeza de clasificación no ha sido entrenada de forma efectiva para la tarea.

## Capacidades

- Clasificación de texto en 8 categorías del dominio de seguros mediante `argmax` sobre los logits.
- Integración directa con `transformers` a través del pipeline `text-classification`.
- Ejecución en CPU sin requisitos especiales, dado el tamaño del modelo (0,4 GB de repo).
- Capacidad multilingüe: limitada al inglés, heredada de `bert-base-uncased`.
- Tool calling / function calling: no soportado (modelo encoder de clasificación, no generativo).
- Razonamiento multi-paso y uso como agente: no aplicable.
- Modo *thinking*, visión o audio: no disponibles.
- Generación de texto libre: no soportada; la cabeza es de clasificación, no de lenguaje.

## Casos de uso

- **Referencia de control en experimentos de edición de pesos**: sirve como baseline para medir la ganancia real de las variantes editadas del proyecto WSP. Se usaría cargando este checkpoint y el editado con el mismo conjunto de test y comparando accuracy y macro-F1.
- **Reproducción del protocolo WSP**: permite replicar el pipeline del repositorio de GitHub partiendo del mismo estado inicial declarado (cero tensores modificados), verificando hashes SHA-256 contra `edit_manifest.json`.
- **Auditoría de artefactos de investigación**: útil para comprobar cómo se publican checkpoints con métricas declaradas y manifiestos de diff, y para validar que un repo con 0 descargas y 0 likes mantiene trazabilidad criptográfica de los tensores.
- **Docencia sobre limitaciones de modelos no entrenados**: ejemplo claro de un clasificador cuya accuracy (13,10 %) está próxima al azar sobre 8 clases (12,5 %), útil para explicar por qué no debe desplegarse un modelo sin validación previa.
- **Pruebas de integración de pipelines de clasificación**: validar el cableado de `transformers.pipeline("text-classification")`, el manejo de etiquetas y el formato de salida en entornos de CI antes de sustituir el checkpoint por uno entrenado.
- **Calibración de temperatura**: dado el aviso del autor sobre logits planos (probabilidad ganadora en torno a 0,2), el modelo sirve para ejercitar rutinas de ajuste de temperatura sobre datos held-out propios antes de usar las puntuaciones como confianzas.

## Benchmarks y rendimiento

| Metrica | Valor declarado |
|---|---|
| Accuracy en test held-out | 13,10 % |
| Macro-F1 | 0,0290 |
| Tensores editados | 0 |
| Porcentaje de parametros modificados | 0,000 % |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las dos métricas anteriores proceden de la model card del autor y corresponden a la ejecución `_baselines/unedited`.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo de pesos (109,5 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16/bf16: alrededor de 0,22 GB de pesos.
- GPU recomendadas: ninguna específica; el modelo es viable en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para esta carga.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline nativo), TorchScript/ONNX si se exporta manualmente, FastAPI o similares como servicio HTTP. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de clasificación de este tamaño).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| `sidman007/wsp-bert-insurance-baseline-unedited` | 109,5 M | no disponible (base: 512) | Clasificacion de frases de seguros (8 clases) | apache-2.0 | 13,10 % accuracy, 0,0290 macro-F1 |
| `google-bert/bert-base-uncased` | 110 M | 512 | Modelo de lenguaje enmascarado (base) | apache-2.0 | No aplica clasificacion de seguros sin fine-tuning |
| Variantes editadas del mismo proyecto WSP | no disponible | no disponible | Clasificacion de frases de seguros (8 clases) | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos comparables de clasificación de seguros en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- **Modelo no entrenado para la tarea**: el manifiesto declara cero tensores editados y un 0,000 % de parámetros modificados; el rendimiento (13,10 % de accuracy sobre 8 clases) es prácticamente equivalente a la asignación aleatoria (12,5 %).
- **No apto para producción**: no debe usarse para clasificar pólizas, exclusiones o procedimientos de siniestros reales sin un fine-tuning supervisado previo y una validación rigurosa.
- **Probabilidades no calibradas**: el autor advierte que los logits son planos y que la etiqueta ganadora suele puntuar en torno a 0,2. Las puntuaciones softmax no deben interpretarse como confianzas sin ajustar temperatura sobre datos held-out propios.
- **Idioma**: solo inglés; no cubre castellano ni otras lenguas.
- **Contexto**: no se documenta la longitud máxima efectiva en este checkpoint; el base admite 512 tokens, pero frases más largas requerirán truncamiento.
- **Sesgos**: no se documenta ningún análisis de sesgos; al ser un modelo base sin editar, hereda los sesgos de los corpus de preentrenamiento de BERT.
- **Riesgo de alucinación**: no aplica en sentido generativo, pero sí existe riesgo de predicciones espurias con alta aparente seguridad por la falta de calibración.
- **Licencia**: Apache 2.0 permite uso comercial, pero la ausencia de entrenamiento efectivo hace que el uso comercial sea desaconsejable por motivos funcionales, no legales.
- **Trazabilidad**: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; conviene verificar los hashes de `edit_manifest.json` antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidman007/wsp-bert-insurance-baseline-unedited
- Repositorio del proyecto (código, logs y protocolo): https://github.com/siddharth-ghatti/weight-space-programming-poc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
