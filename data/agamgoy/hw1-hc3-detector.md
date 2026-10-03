# agamgoy/hw1-hc3-detector

## Resumen

`agamgoy/hw1-hc3-detector` es un clasificador binario de texto en inglés que distingue respuestas humanas de respuestas generadas por ChatGPT. Se construye mediante ajuste fino completo (*fine-tuning* end-to-end) del *backbone* `sentence-transformers/all-MiniLM-L6-v2` sobre el corpus HC3 (Hello-SimpleAI/HC3, subconjunto inglés `all.jsonl`), y devuelve dos etiquetas: `0 = human` y `1 = ChatGPT`. Es, por tanto, un modelo de investigación con 22.713.986 parámetros y una cabeza de clasificación de dos clases, no un modelo generativo.

El interés del modelo es doble. Por un lado, documenta un salto muy grande frente a una línea base congelada: una regresión logística sobre *embeddings* de MiniLM alcanza 0.8449 de exactitud en test, mientras que este ajuste fino llega a 0.9974 sobre 4668 respuestas retenidas. Por otro, el propio autor advierte de que esa cifra refleja artefactos estilísticos del corpus HC3 (respuestas de ChatGPT de 2022 emparejadas con respuestas humanas de webs y foros), por lo que no debe interpretarse como una capacidad general de detección de texto generado por modelos más recientes.

El modelo fue publicado el 2 de octubre de 2026 como entrega de la asignatura CS546 (HW1), con licencia Apache 2.0, y en el momento de redactar esta ficha acumula 0 descargas y 0 *likes*. Su utilidad práctica inmediata es la experimentación académica y el etiquetado asistido de corpus de estilo, no el despliegue como detector antifraude.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6: 6 capas, 384 de dimensión oculta, 12 cabezas de atención) con cabeza de clasificación lineal de 2 clases |
| Parámetros totales | 22.713.986 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento, `max_length=256`) |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors; no hay GGUF, ONNX ni versiones int8 publicadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas | `0 = human`, `1 = ChatGPT` |
| Tamaño del repositorio | 0.1 GB |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Dataset de entrenamiento | Hello-SimpleAI/HC3 (inglés, `all.jsonl`, revisión `4d0ff18`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de tipo BERT en su variante MiniLM-L6 (destilada, 6 capas, 384 dimensiones ocultas y 12 cabezas), sobre la que se añade una cabeza de clasificación con dos logits. A diferencia de la línea base evaluada por el autor, que congela el *backbone* y entrena solo una regresión logística sobre los *embeddings*, aquí se ajustan todos los pesos del encoder junto con la cabeza.

Los datos proceden del corpus HC3 en inglés. Los autores del experimento construyen los *splits* por pregunta (80/10/10, semilla 42) y conservan la primera respuesta humana no vacía y la primera respuesta de ChatGPT por pregunta, evitando así la fuga de información entre entrenamiento y test. El entrenamiento usa AdamW con *learning rate* 2e-05 y sin *weight decay*, tamaño de lote 32, longitud máxima de 256 tokens, 5 épocas, autocast en fp16 y recorte de gradiente con norma 1.0. La exactitud de validación se comprobó 8 veces por época y se conservó el mejor *checkpoint* (val acc 0.9944). Finalmente, se incorporó al *bias* del clasificador un desplazamiento de logit de +5.75 sobre la clase ChatGPT, elegido en validación, lo que eleva la exactitud de validación a 0.9959. No se documenta uso de RLHF, DPO ni decodificación especulativa, algo esperable en un clasificador.

## Capacidades

- Clasificación binaria de texto en inglés: distingue respuestas humanas (`0`) de respuestas de ChatGPT (`1`) para textos del dominio HC3.
- Entrada de texto plano de hasta 256 tokens; no acepta imágenes, audio ni entradas multimodales.
- Inferencia de muy bajo coste: 22,7 millones de parámetros permiten ejecución en CPU con latencia reducida.
- Salida de logits y probabilidades por clase, apta para umbralización ajustable en pipelines posteriores.
- Etiquetado por lotes de corpus: puede procesar grandes volúmenes de respuestas cortas de tipo QA o foro una vez desplegado.
- Ajuste fino adicional: al ser un encoder BERT estándar con safetensors, se puede reentrenar sobre datos propios con `transformers` o `sentence-transformers`.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso ni modo de pensamiento: no es un modelo conversacional ni un agente.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado únicamente para inglés.

## Casos de uso

- Reproducción de experimentos académicos: sirve como referencia de ajuste fino completo frente a una línea base congelada (0.8449 de exactitud) en un ejercicio de clasificación de texto; el propio repositorio documenta la partición por pregunta con semilla 42, lo que facilita la comparación reproducible.
- Estudio de detección de texto generado: permite analizar qué señales estilísticas aprende un encoder pequeño cuando alcanza 0.9974 de exactitud en HC3, por ejemplo mediante análisis de atención o ablación de *tokens* frecuentes.
- Etiquetado asistido de corpus de QA: en un flujo de anotación humana, el modelo puede preetiquetar respuestas de foros y preguntas-respuestas en inglés para que un anotador revise solo los casos de baja confianza.
- Filtrado de datos para investigación en *webs* de preguntas y respuestas: dado un volcado de respuestas en inglés, se pueden separar candidatas a texto humano y candidatas a texto de modelo para auditar la composición del corpus.
- Prueba de concepto de moderación o curación de contenido: con umbral calibrado sobre validación, se puede integrar como señal auxiliar (nunca como decisión única) en un sistema que revise contenido sospechoso de ser generado automáticamente.
- Desarrollo de *baselines* ligeros: al ocupar menos de 100 MB en fp32, es un punto de partida adecuado para comparar arquitecturas mayores de detección de texto en inglés sin coste de GPU.
- Análisis de sesgos y artefactos de dataset: útil para medir hasta qué punto un detector aprende marcas de recolección (formato de foro, longitud de respuesta, fórmulas de cortesía) en lugar de propiedades intrínsecas del texto.

## Benchmarks y rendimiento

| Modelo | Conjunto | Métrica | Resultado |
|---|---|---|---|
| Regresión logística sobre embeddings congelados de all-MiniLM-L6-v2 (línea base) | Test retenido (4668 respuestas) | Exactitud | 0.8449 |
| `agamgoy/hw1-hc3-detector` (ajuste fino completo) | Test retenido (4668 respuestas) | Exactitud | 0.9974 |
| `agamgoy/hw1-hc3-detector` (mejor checkpoint) | Validación | Exactitud | 0.9944 |
| `agamgoy/hw1-hc3-detector` (con offset de logit +5.75) | Validación | Exactitud | 0.9959 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar de modelos generativos en la información disponible, algo coherente con la naturaleza de clasificador del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión. Los 22,7 millones de parámetros ocupan aproximadamente 91 MB en fp32, unos 45 MB en fp16 y unos 23 MB en int8.
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 1 GB de memoria es suficiente (GTX 1050, RTX 3050, RTX 4090, T4, A100, H100); el modelo no aprovechará la capacidad de cómputo de las GPU de gama alta.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales y también en CPU, incluidos portátiles sin acelerador dedicado. El repositorio completo ocupa 0.1 GB.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `sentence-transformers`, inferencia nativa con safetensors, servicios de inferencia de Hugging Face y exportación manual a ONNX o TorchScript. No se han publicado artefactos GGUF, por lo que llama.cpp y Ollama no están soportados de fábrica; tampoco vLLM o TGI, orientados a modelos generativos.
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Nota de eficiencia: la longitud máxima de 256 tokens limita el coste por petición, lo que favorece el procesamiento por lotes de grandes volúmenes de textos cortos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| `agamgoy/hw1-hc3-detector` | 22,7 M | 256 tokens | Clasificación humana/ChatGPT en HC3 (inglés) | Apache 2.0 | 0.9974 de exactitud en test (4668 respuestas) |
| Línea base: regresión logística sobre embeddings congelados de all-MiniLM-L6-v2 | 22,7 M congelados + clasificador lineal | 256 tokens | Igual | Apache 2.0 (MiniLM) | 0.8449 de exactitud en el mismo test |
| `sentence-transformers/all-MiniLM-L6-v2` (modelo base) | 22,7 M | 256 tokens | Embeddings de frases; no clasifica | Apache 2.0 | No disponible (no es un clasificador) |
| `Hello-SimpleAI/chatgpt-detector-roberta` | No disponible | No disponible | Detección de texto ChatGPT | No disponible en la información proporcionada | No disponible en la información proporcionada |

Los datos de rendimiento, licencia y configuración del detector basado en RoBERTa y de otros detectores comerciales (GPTZero, Originality.ai) no están disponibles en la información proporcionada, por lo que no se incluyen comparaciones numéricas.

## Limitaciones y advertencias

- El propio autor advierte de que el clasificador se apoya en artefactos de estilo del corpus HC3: respuestas de ChatGPT de 2022 emparejadas con respuestas humanas de webs y foros. No es un detector fiable de texto generado por modelos más recientes.
- No debe usarse para evaluar trabajo de estudiantes ni para acusar de plagio o de uso indebido de IA. El autor lo declara explícitamente.
- La exactitud de 0.9974 en test, muy superior a la de la línea base (0.8449), es compatible con un atajo de clasificación (marcas de recolección, formato, longitud, fórmulas de cortesía) más que con una señal semántica robusta. Cualquier evaluación en un dominio distinto debe rehacerse desde cero.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre; su modo de fallo es la clasificación errónea con alta confianza.
- Sesgos conocidos: no disponible. No se han publicado análisis de sesgo por tema, registro, variedad de inglés, género o procedencia del texto humano.
- Limitación de idioma: solo inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Limitación de contexto: entradas de hasta 256 tokens; los textos más largos deben truncarse, lo que puede degradar la clasificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia del corpus HC3 y el uso de los pesos derivados deben verificarse por separado antes de un producto en producción.
- Caveat de producción: el modelo es un artefacto de curso (CS546 HW1) con 0 descargas y 0 *likes* en el momento de la consulta; no hay mantenimiento, versión estable ni soporte documentados.
- Al incorporar un offset de logit de +5.75 hacia la clase ChatGPT, el modelo tiene un sesgo de decisión calibrado para el conjunto de validación de HC3; en otros dominios probablemente sobreprediga la clase ChatGPT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agamgoy/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Repositorio o demo adicional: no disponible en la información proporcionada
- Artículo o *paper* asociado: no disponible en la información proporcionada
