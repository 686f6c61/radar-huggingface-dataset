# CodexTanishq/clauselens-cuad

## Resumen

clauselens-cuad es un modelo de question answering extractivo especializado en contratos legales, desarrollado por el usuario CodexTanishq y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning de la arquitectura RoBERTa-base (concretamente sobre `deepset/roberta-base-squad2`) entrenado con el Contract Understanding Atticus Dataset (CUAD), un corpus de contratos anotados para la extracción de cláusulas.

El modelo resuelve una tarea muy concreta: dado un fragmento de contrato y una pregunta (por ejemplo, sobre la duración, las partes implicadas o las cláusulas de terminación), devuelve el span de texto exacto que responde a esa pregunta. Con 124 millones de parámetros y una ventana de contexto propia de RoBERTa-base, está pensado para integrarse en pipelines de análisis documental legal, no como un modelo generativo de propósito general.

Su relevancia es limitada pero específica: los resultados reportados por el autor (EM 73,71% y F1 85,15% en el conjunto de test de CUAD) lo sitúan como una opción ligera y desplegable en hardware modesto para tareas de extracción de cláusulas, aunque con el alcance restringido a inglés y al dominio legal contractual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder-only), fine-tune de `deepset/roberta-base-squad2` |
| Parámetros totales | 124.056.578 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (RoBERTa-base admite 512 tokens de entrada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RoBERTa-base, un transformer encoder-only con 12 capas, atención bidireccional completa y alrededor de 124 millones de parámetros. Al ser un modelo extractivo de question answering, la cabeza de salida predice las posiciones de inicio y fin del span de respuesta dentro del contexto proporcionado; no genera texto libre. El punto de partida es `deepset/roberta-base-squad2`, ya ajustado previamente para QA extractivo sobre SQuAD 2.0, lo que aporta al modelo una base sólida en comprensión lectora antes del ajuste específico al dominio legal.

El entrenamiento se realizó sobre el dataset `chenghao/cuad_qa`, una versión en formato QA del Contract Understanding Atticus Dataset. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores; tampoco menciona innovaciones arquitectónicas adicionales. El único hiperparámetro destacado es la longitud máxima de respuesta de 346 tokens, calculada como el percentil 99 de las cláusulas del corpus, lo que indica que el modelo se configuró para cubrir cláusulas largas habituales en contratos.

## Capacidades

- Question answering extractivo sobre texto legal: devuelve el span exacto del contrato que responde a una pregunta formulada.
- Extracción de cláusulas contractuales: identificación de fragmentos relevantes como duración, terminación, confidencialidad o jurisdicción, siempre que la pregunta se formule de forma adecuada.
- Comprensión lectora en inglés: hereda la capacidad de QA de su modelo base `deepset/roberta-base-squad2`.
- Manejo de respuestas largas: configurado para spans de hasta 346 tokens, adecuado para cláusulas extensas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Extracción automática de cláusulas en revisión de contratos: dado un contrato en inglés y una batería de preguntas predefinidas (por ejemplo, "¿cuál es la duración del contrato?"), el modelo devuelve los spans relevantes para que un revisor humano los valide, reduciendo el tiempo de lectura manual.
- Construcción de un pipeline de due diligence legal: integración del modelo en un sistema que procese lotes de contratos y genere un resumen estructurado de cláusulas clave, aprovechando su naturaleza extractiva para mantener trazabilidad literal del texto fuente.
- Indexación semántica de cláusulas: uso del modelo para localizar y etiquetar fragmentos contractuales que alimenten un motor de búsqueda interno o una base de datos documental.
- Asistencia a abogados en la localización de cláusulas de terminación o penalización: el modelo señala el fragmento exacto, lo que facilita la verificación y evita alucinaciones propias de modelos generativos.
- Análisis de contratos en plataformas de gestión documental: despliegue ligero en CPU o GPU modesta para procesar contratos en inglés dentro de flujos de trabajo existentes, gracias a sus 124 millones de parámetros.
- Extracción de metadatos contractuales en procesos de compliance: preguntas dirigidas sobre partes, fechas o condiciones para poblar campos estructurados en sistemas de gestión.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| CUAD test set | Exact Match (EM) | 73,71% |
| CUAD test set | F1 | 85,15% |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks adicionales como MMLU, HumanEval o GSM8K, que además no son aplicables a un modelo extractivo de QA.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en precisión FP32 (124 millones de parámetros), y menos de 0,3 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son más que suficientes, aunque el modelo también funciona en CPU.
- Cabe en cualquier GPU de consumo actual e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, y servidores de inferencia compatibles con modelos de QA como Hugging Face Inference Endpoints o FastAPI con transformers. No se dispone de información sobre soporte específico en vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia baja en GPU y aceptable en CPU para lotes pequeños.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clauselens-cuad | 124 M | no disponible (RoBERTa-base: 512 tokens) | QA extractivo legal (CUAD) | Apache 2.0 | Hugging Face |
| deepset/roberta-base-squad2 | 124 M | 512 tokens | QA extractivo general (SQuAD 2.0) | no disponible en la información | Hugging Face |
| Modelos legales generativos de gran tamaño (por ejemplo, familia LegalBERT o LLM legales) | variable | variable | Múltiples tareas legales | variable | Hugging Face |

La comparación directa con alternativas es limitada porque la información proporcionada no incluye resultados de otros modelos sobre CUAD. El modelo base `deepset/roberta-base-squad2` es el referente inmediato: clauselens-cuad añade especialización en dominio legal a costa de restringir su uso al inglés contractual.

## Limitaciones y advertencias

- Solo admite inglés; no es utilizable para contratos en castellano u otros idiomas.
- Es un modelo extractivo: no genera respuestas, resúmenes ni explicaciones; únicamente devuelve spans del texto de entrada.
- Riesgo de sesgo heredado del corpus CUAD y de su modelo base, que puede reflejar distribuciones y terminología propias de contratos estadounidenses.
- Posible degradación en contratos con formatos, jerga o estructuras alejadas del corpus de entrenamiento.
- La ventana de contexto está limitada por la arquitectura RoBERTa-base (512 tokens); contratos largos requieren segmentación previa, lo que puede fragmentar cláusulas y afectar a la extracción.
- No se han publicado detalles sobre el proceso de entrenamiento, lo que dificulta evaluar su robustez y reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datos de entrenamiento subyacentes (CUAD) y del modelo base.
- Para producción en el ámbito legal, se recomienda validación humana de las extracciones, dado el impacto de los errores en este dominio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodexTanishq/clauselens-cuad
- Modelo base: https://huggingface.co/deepset/roberta-base-squad2
- Dataset de entrenamiento: https://huggingface.co/datasets/chenghao/cuad_qa
