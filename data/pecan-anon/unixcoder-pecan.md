# pecan-anon/unixcoder-pecan

## Resumen

UniXcoder-PECAN es un modelo de clasificación de texto obtenido por fine-tuning de `microsoft/unixcoder-base` sobre el benchmark PECAN. Su tarea es identificar el lenguaje de programación de un fragmento de código en bruto de 512 bytes, sin nombre de fichero ni extensión, cubriendo 319 lenguajes distintos. Lo publica el usuario `pecan-anon` bajo licencia MIT, asociado al artefacto anónimo del benchmark PECAN.

Arquitectura transformer encoder de tipo RoBERTa con 126.175.039 parámetros totales (aproximadamente 126 M), pesos en safetensors y un tamaño de repositorio de 0,5 GB. Al derivar de UniXcoder, hereda el preentrenamiento multimodal de código y texto del modelo base de Microsoft, aunque la model card no detalla el proceso de fine-tuning más allá del conjunto PECAN.

Su relevancia práctica está en la detección de lenguaje sin metadatos: pipelines de análisis estático, triaje de repositorios, clasificación de snippets en entornos donde la extensión es desconocida o está corrupta. Con un accuracy de 0,9575 y un macro-F1 de 0,9293 en el split de test, es un clasificador ligero y desplegable en CPU para esta tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), base `microsoft/unixcoder-base` |
| Parametros totales | 126.175.039 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (fragmentos de 512 bytes en el benchmark) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible (la tarea es clasificación de lenguajes de programación, no NLP multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia RoBERTa, tomado de `microsoft/unixcoder-base` y ajustado para clasificación de secuencias (`text-classification`) con 319 etiquetas correspondientes a lenguajes de programación. UniXcoder combina preentrenamiento sobre código y texto con modalidades cruzadas; el fine-tuning específico sobre PECAN no está descrito en detalle en la model card más allá del objetivo (identificar el lenguaje de un fragmento de 512 bytes sin extensión ni nombre de fichero).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset PECAN, ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador). El artefacto y el código de scoring están publicados en un repositorio anónimo de 4open.science, lo que permite reproducir la evaluación, pero no se documentan hiperparámetros ni estrategia de validación.

## Capacidades

- Clasificación de lenguaje de programación a partir de código en bruto, sin extensión ni nombre de fichero.
- Cobertura de 319 lenguajes de programación según el benchmark PECAN.
- Entrada de fragmentos de 512 bytes, adecuada para snippets cortos.
- Salida de clasificación de una sola etiqueta (top-1), con probabilidades por clase.
- Compatible con la librería `transformers` y con Text Embeddings Inference / endpoints compatibles (según tags del repositorio).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un clasificador.
- No se documentan capacidades multimodales (visión, audio) ni modo thinking.

## Casos de uso

- Triaje de repositorios: clasificar ficheros sin extensión o con extensión errónea para enrutarlos al analizador estático adecuado, usando el modelo sobre los primeros 512 bytes de cada fichero.
- Detección de lenguaje en pipelines de CI/CD: identificar el lenguaje de fragmentos extraídos de logs, issues o parches antes de aplicar linters o reglas específicas.
- Enriquecimiento de datasets de código: etiquetar automáticamente snippets scrapeados de foros, gists o documentación donde falta el metadato de lenguaje.
- Seguridad y análisis de malware: determinar el lenguaje de fragmentos ofuscados o embebidos en binarios para orientar el análisis manual, gracias a que no depende de la extensión.
- Moderación de contenido en plataformas de preguntas y respuestas: clasificar el lenguaje de bloques de código publicados por usuarios para renderizado, resaltado sintáctico o validación.
- Indexación y búsqueda de código: asignar etiqueta de lenguaje a fragmentos indexados en motores de búsqueda internos, mejorando filtros y facetas.
- Preprocesado para modelos generativos de código: enrutar cada snippet al modelo o prompt especializado del lenguaje detectado antes de la generación.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| PECAN (split de test) | Accuracy | 0,9575 |
| PECAN (split de test) | Macro-F1 | 0,9293 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en el propio PECAN frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB de pesos, aproximadamente 1 GB con overhead de activaciones para batches pequeños.
- Cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y también en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4; para desarrollo, RTX 4090 o similar.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles; no se documenta soporte GGUF/llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniXcoder-PECAN | 126 M | no disponible | Clasificación de lenguaje (319 clases) | MIT | Hugging Face |
| microsoft/unixcoder-base | ~126 M | 512 tokens | Preentrenamiento código/texto (base) | MIT | Hugging Face |
| Modelos de detección de lenguaje tipo guesslang / linguist | no disponible | no disponible | Heurística/ML para detección de lenguaje | variable | GitHub / varias |

No se dispone de datos de rendimiento de los comparadores en PECAN en la información proporcionada, por lo que no es posible una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo clasifica; no genera código ni texto, por lo que no debe emplearse en tareas generativas.
- Entrenado y evaluado sobre fragmentos de 512 bytes: el rendimiento puede degradarse con fragmentos muy cortos (pocas líneas) o con código mezclado de varios lenguajes.
- No se documentan sesgos específicos, pero al derivar de un modelo preentrenado en código, puede infrarrepresentar lenguajes poco frecuentes en el corpus de UniXcoder pese a las 319 clases de PECAN.
- Riesgo de confusión entre lenguajes sintácticamente próximos (p. ej. dialectos de C, lenguajes de plantillas o DSLs) no cuantificado en la model card.
- No hay información sobre calibración de probabilidades ni sobre umbrales recomendados para abstención.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base `microsoft/unixcoder-base` y las condiciones del benchmark PECAN en el repositorio anónimo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es anónimo: no hay evidencia de uso en producción ni mantenimiento.
- Los idiomas naturales soportados no están documentados; no debe asumirse capacidad multilingüe en NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pecan-anon/unixcoder-pecan
- Modelo base: https://huggingface.co/microsoft/unixcoder-base
- Artefacto y código de scoring del benchmark PECAN: https://anonymous.4open.science/r/pecan-benchmark
