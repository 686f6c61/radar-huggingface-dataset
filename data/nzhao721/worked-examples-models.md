# nzhao721/worked-examples-models

## Resumen

`nzhao721/worked-examples-models` es una colección de seis checkpoints de investigación publicados por el autor nzhao721 como material reproducible del artículo *Same Content, Different Format: QA Augmentation and Faded Worked Examples Under a Fixed Training Budget*. No es un modelo de propósito general, sino un artefacto experimental: cada subcarpeta contiene una variante ("arm") del mismo modelo base sometida a un régimen distinto de preentrenamiento continuo sobre corpus de problemas matemáticos resueltos con distinto formato (solo enunciado y respuesta, solución completa paso a paso, o solución desvanecida o "faded" con soporte eliminado de forma ordenada o aleatoria).

El punto de partida es el checkpoint público `allenai/DataDecide-dolma1_7-no-flan-300M`, de arquitectura OLMo 1 con 371 millones de parámetros, convertido al formato Llama de Hugging Face. El experimento mantiene constante el presupuesto de entrenamiento y varía el número de pasadas sobre cada corpus (de 19 a 298 según el brazo), de modo que la comparación entre brazos aísla el efecto del formato de los datos frente al de la cantidad de cómputo.

Su relevancia es metodológica: sirve para estudiar cómo afecta el formato de los ejemplos resueltos al aprendizaje de matemáticas en modelos pequeños, y como referencia reproducible para quienes investigan curación de datos y preentrenamiento continuo. El repositorio ocupa 8,9 GB, la licencia es Apache 2.0, el idioma es únicamente inglés y no consta ningún pipeline de inferencia declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 1), convertido a formato Llama de Hugging Face |
| Parámetros totales | 371 M (checkpoint base DataDecide dolma1_7 no-FLAN 300M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización GGUF no publicada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,9 GB con seis subcarpetas) |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint DataDecide `dolma1_7-no-flan-300M`: un transformer decoder-only de la familia OLMo 1 con 371 M de parámetros, publicado originalmente en formato nativo y aquí convertido a la estructura Llama de Hugging Face para su carga con `transformers`. No se documentan en la información disponible innovaciones de atención, decodificación especulativa ni capas híbridas; se trata de un modelo denso convencional de escala pequeña.

El entrenamiento consiste en preentrenamiento continuo desde ese checkpoint sobre corpus de problemas matemáticos con ejemplos resueltos, organizados en seis brazos: `bare` (enunciado y respuesta final, 298 pasadas), `complete` (enunciado, solución paso a paso completa y respuesta, 97 pasadas), `fade_ordered` (soluciones desvanecidas con el soporte eliminado en orden decreciente, 19 pasadas), `fade_shuffled` (los mismos documentos desvanecidos en orden aleatorio, 19 pasadas), y dos controles de igual cómputo, `bare_pm` y `complete_pm`, entrenados con el número de pasadas de los brazos fade (19). Cada brazo se entrenó una sola vez con una única semilla, por lo que el propio autor advierte que los resultados deben leerse como direccionales. Los datos de entrenamiento y el conjunto de evaluación reservado están en el dataset `nzhao721/worked-examples-data`. No se especifica en la información disponible el número total de tokens, la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés con `transformers` (`AutoModelForCausalLM`), cargando cada brazo mediante el parámetro `subfolder`.
- Resolución de problemas matemáticos elementales, especialidad sobre la que se entrenó cada brazo.
- Reproducción de distintos formatos de solución: respuesta directa (`bare`), razonamiento paso a paso (`complete`) y soluciones parcialmente desvanecidas (`fade_ordered`, `fade_shuffled`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el razonamiento multi-paso se limita al dominio matemático del corpus de entrenamiento.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre curación de datos: comparar los seis brazos con el mismo presupuesto de cómputo para medir el efecto del formato de los ejemplos resueltos (respuesta directa frente a solución completa frente a desvanecida) en el rendimiento matemático de un modelo de 371 M.
- Reproducción de experimentos: reentrenar o evaluar los checkpoints con el dataset `nzhao721/worked-examples-data` para verificar los resultados del artículo con otras semillas, dado que el autor solo usó una.
- Estudio de "faded worked examples" en NLP: usar `fade_ordered` y `fade_shuffled` como línea base para investigar si el orden de eliminación del soporte intermedio afecta al aprendizaje.
- Línea base de bajo coste en matemáticas: emplear el brazo `complete` como referencia de un modelo pequeño entrenado con soluciones paso a paso frente a modelos mayores en tareas aritméticas acotadas.
- Análisis de eficiencia de cómputo: cuantificar cuántas pasadas sobre un corpus (19 frente a 97 frente a 298) son necesarias para un formato dado, útil para planificar presupuestos de preentrenamiento continuo.
- Docencia y divulgación: ilustrar con un modelo pequeño y abierto cómo el formato de los datos, y no solo su contenido, condiciona lo que aprende un modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo *Same Content, Different Format: QA Augmentation and Faded Worked Examples Under a Fixed Training Budget* y al dataset de evaluación `nzhao721/worked-examples-data`, pero no incluye cifras de MMLU, GSM8K, HumanEval ni de la evaluación propia del experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 371 M de parámetros, en fp32 (≈1,5 GB de pesos) cabría en cualquier GPU con 4 GB o más; en bf16/fp16 (≈0,75 GB) o en cuantización de 8 bits (≈0,4 GB) el margen es amplio, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente; para evaluación por lotes de los seis brazos, una A100 o H100 acelera el barrido, pero no es necesaria.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` es la vía documentada en la model card; llama.cpp, Ollama, vLLM y TGI requerirían conversión previa a GGUF u otro formato, no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nzhao721/worked-examples-models` | 371 M | no disponible | Preentrenamiento continuo sobre ejemplos matemáticos resueltos en seis formatos | Apache 2.0 | Hugging Face (6 subcarpetas) |
| `allenai/DataDecide-dolma1_7-no-flan-300M` | 371 M | no disponible | Checkpoint base de DataDecide, sin ajuste específico de matemáticas | no disponible en la información | Hugging Face |
| Modelos matemáticos pequeños de la familia Qwen o Llama | no disponible en la información | no disponible | Ajuste específico para matemáticas y código | no disponible en la información | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: el autor no publica métricas que permitan situar estos brazos frente a otros modelos pequeños de matemáticas.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: cada brazo se entrenó una sola vez con una única semilla y el propio autor califica los resultados de direccionales.
- Dominio restringido a problemas matemáticos elementales en inglés; el rendimiento fuera de ese dominio no está caracterizado.
- Idioma limitado al inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada; no debe asumirse una ventana amplia para conversaciones multi-turno.
- Riesgo de alucinación y de errores aritméticos propio de un modelo de 371 M, sin ajuste por RLHF ni DPO documentado.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez; no hay garantías para uso con usuarios finales.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la naturaleza experimental y la falta de benchmarks desaconsejan su despliegue en producción sin una evaluación propia.
- El repositorio ocupa 8,9 GB porque incluye los seis brazos; descargar una sola subcarpeta reduce el coste de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nzhao721/worked-examples-models
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/nzhao721/worked-examples-data
- Modelo base: https://huggingface.co/allenai/DataDecide-dolma1_7-no-flan-300M
- Artículo: *Same Content, Different Format: QA Augmentation and Faded Worked Examples Under a Fixed Training Budget* (referenciado en la model card; no se dispone de URL en la información proporcionada)
