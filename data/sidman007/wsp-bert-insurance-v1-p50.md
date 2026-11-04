# sidman007/wsp-bert-insurance-v1-p50

## Resumen

`wsp-bert-insurance-v1-p50` es un clasificador de frases del dominio de seguros construido sobre `bert-base-uncased` mediante una técnica de edición de pesos conocida como weight-space programming (WSP). En lugar de fine-tuning tradicional con descenso de gradiente, un LLM editor lee y escribe directamente los tensores del modelo aplicando matemáticas en forma cerrada sobre los pesos y sobre las activaciones obtenidas de un número acotado de pasadas forward. No hay retropropagación ni optimizadores implicados en el proceso.

El modelo resultante es un `BertForSequenceClassification` con 8 etiquetas específicas del dominio asegurador (`coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal`, `conditions_duties`). El autor reporta que se modificaron 132 tensores, lo que supone un 5,323 % de los parámetros del modelo base. La edición se concentra en las capas 2, 3, 4, 5, 10 y 11, con especial intensidad en la capa 11, donde se reescriben pesos completos de atención y de la FFN.

Es relevante por su enfoque metodológico: demuestra que es posible especializar un encoder BERT en una tarea de clasificación de dominio sin entrenamiento supervisado convencional, lo que abre la puerta a adaptaciones de bajo coste computacional. Con 109,5 millones de parámetros y 0,4 GB de pesos en safetensors, es un modelo ligero y desplegable en CPU, pero su adopción en producción exige validación independiente, ya que no se publican métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (`BertForSequenceClassification`) |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de `bert-base-uncased`; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased`: 12 capas de encoder, 768 dimensiones ocultas, 12 cabezas de atención y 110 millones de parámetros, con una cabeza de clasificación de 8 clases añadida sobre el token `[CLS]`. No se trata de un modelo generativo ni de un modelo MoE; es un encoder bidireccional para clasificación de secuencias.

La innovación está en el procedimiento de entrenamiento. En lugar de ajustar los pesos mediante descenso de gradiente, un LLM editor aplica weight-space programming: analiza los pesos del modelo base y las activaciones recogidas en un número presupuestado de pasadas forward, y calcula ediciones en forma cerrada sobre tensores concretos. La model card detalla 132 tensores modificados que representan el 5,323 % de los parámetros. Las capas 11 y 10 concentran la mayor parte de las modificaciones (por ejemplo, `bert.encoder.layer.11.output.dense.weight` con 2.359.296 entradas cambiadas y `bert.encoder.layer.11.attention.self.query.weight` con 589.824), mientras que capas como la 1 solo reciben cambios en los sesgos y pesos de LayerNorm. No se especifica el volumen de datos de entrenamiento, la composición del corpus de seguros ni si hubo RLHF o DPO, dado que el paradigma no lo contempla.

## Capacidades

- Clasificación de frases en inglés en 8 categorías del dominio asegurador: concesión de cobertura, exclusión, pago de prima, límites y deducibles, procedimiento de siniestros, definiciones, cancelación/renovación de póliza y condiciones y obligaciones.
- Salida de logits por etiqueta mediante la cabeza `BertForSequenceClassification`, apta para `pipeline("text-classification")` de Transformers.
- Procesamiento de secuencias de hasta 512 tokens (límite estándar de BERT).
- Operación monolingüe en inglés; no se declara soporte multilingüe.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking. Es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Triaje de consultas de seguros: clasificar correos o tickets entrantes en una de las 8 categorías para enrutarlos al equipo adecuado (suscripción, siniestros, atención al cliente) y reducir el tiempo de primera respuesta.
- Extracción de cláusulas en pipelines documentales: etiquetar fragmentos de pólizas y condiciones generales para alimentar un motor de extracción que distinga coberturas, exclusiones y definiciones antes de poblar una base de conocimiento.
- Cumplimiento normativo y auditoría: detectar automáticamente en lotes de contratos si un fragmento corresponde a una exclusión o a una obligación del asegurado, facilitando revisiones de transparencia documental.
- Enriquecimiento de bases de datos de siniestros: clasificar descripciones libres de siniestros para segmentar por procedimiento, deducible o límite y construir series estadísticas por tipo de cláusula.
- Preetiquetado para anotación humana: usar el modelo como primer paso en un flujo de anotación activa, donde revisores humanos corrigen las predicciones y se acumula un conjunto etiquetado de mayor calidad.
- Prototipado de bajo coste en CPU: al tener 109,5 millones de parámetros y 0,4 GB de pesos, puede ejecutarse en entornos sin GPU para demos internas, pruebas de concepto o clasificación por lotes de bajo volumen.
- Filtrado previo a modelos generativos: usar la clasificación para decidir qué fragmentos de una póliza se envían a un LLM de mayor tamaño, reduciendo coste y latencia en pipelines híbridos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1, exactitud ni comparaciones con clasificadores entrenados de forma convencional. Tampoco se documentan curvas de aprendizaje, matrices de confusión ni conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB de pesos más activaciones; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,22 GB de pesos más activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes, cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en placas integradas con suficiente RAM.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, FastAPI con `transformers`, ONNX Runtime tras exportación manual, y `optimum` para conversión a ONNX. No se publican pesos GGUF, por lo que `llama.cpp` y `Ollama` no son viables sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sidman007/wsp-bert-insurance-v1-p50` | 109,5 M | 512 tokens | Clasificación de frases de seguros (8 clases) | Apache 2.0 | HuggingFace, 0 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | Modelo base enmascarado, sin cabeza de clasificación de dominio | Apache 2.0 | HuggingFace, ampliamente usado |
| `ProsusAI/finbert` | 110 M | 512 tokens | Clasificación de sentimiento financiero (3 clases) | Apache 2.0 | HuggingFace, muy usado |
| `nlpaueb/legal-bert-base-uncased` | 110 M | 512 tokens | Modelo base para dominio legal | Apache 2.0 | HuggingFace |

La comparación directa con `finbert` o `legal-bert` es limitada: comparten arquitectura y tamaño, pero difieren en dominio y en el procedimiento de entrenamiento. `finbert` y `legal-bert` se entrenaron con objetivos convencionales (preentrenamiento de dominio y fine-tuning supervisado), mientras que este modelo se especializa mediante edición de pesos sin gradiente. No se dispone de métricas que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: no hay evidencia cuantitativa de precisión, recall ni F1, lo que impide evaluar su calidad frente a un BERT fine-tuneado de forma convencional.
- Procedimiento de entrenamiento no estándar: la edición de pesos en forma cerrada puede producir comportamientos frágiles o dependientes del conjunto de activaciones usado durante la edición; no se documenta el presupuesto de pasadas forward ni el corpus empleado.
- Dominio y idioma restringidos: solo inglés y solo seguros; el rendimiento fuera de ese vocabulario y de esas 8 etiquetas es desconocido.
- Sesgos potenciales: al derivar de `bert-base-uncased`, hereda los sesgos de su corpus de preentrenamiento (textos web y libros en inglés), y no se documenta ningún análisis de sesgo ni mitigación.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en frases ambiguas o fuera de distribución.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican cláusulas adicionales en la model card.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación por terceros.
- Sin variantes cuantizadas ni exportaciones ONNX/GGUF publicadas, lo que añade trabajo de conversión para despliegues optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidman007/wsp-bert-insurance-v1-p50
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio del autor (referenciado en la model card como "project README"): no disponible como URL directa en la información proporcionada
- Paper o blog sobre weight-space programming: no disponible en la información proporcionada
