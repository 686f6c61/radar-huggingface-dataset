# ronaldochaves/bert-hate-speech-test

## Resumen

`bert-hate-speech-test` es un modelo de clasificación de texto obtenido mediante fine-tuning de `google-bert/bert-base-uncased` sobre un conjunto de datos no especificado, presumiblemente orientado a la detección de discurso de odio. Lo publica el usuario de HuggingFace `ronaldochaves` y se distribuye bajo licencia Apache 2.0. Se trata de un artefacto experimental: la model card es la generada automáticamente por el `Trainer` de Transformers y el autor no ha completado la descripción, los usos previstos ni la composición del dataset.

Arquitectónicamente es un BERT base estándar (transformer encoder bidireccional) con 109.484.547 parámetros, es decir, el tamaño canónico de BERT-base (~110 M). El checkpoint ocupa 0,4 GB en formato safetensors y se carga con la librería `transformers` como pipeline `text-classification`. No hay información sobre el número de etiquetas, el idioma de entrenamiento ni la naturaleza exacta de la tarea más allá del nombre del repositorio.

Su relevancia es limitada: con 20 descargas, 0 likes y una accuracy de validación de 0,6491, debe considerarse una prueba de concepto o un ejercicio de fine-tuning más que un modelo listo para producción. Resulta útil como referencia de cómo se estructura un clasificador BERT afinado, pero no como solución desplegable sin una evaluación adicional sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base) |
| Parametros totales | 109.484.547 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en fp32) |
| Idiomas soportados | no disponible (modelo base `bert-base-uncased`, entrenado originalmente en inglés; el dataset de fine-tuning es desconocido) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `bert-base-uncased`: 12 capas de transformer encoder, 768 dimensiones ocultas, 12 cabezas de atención y ~110 M de parámetros, con una cabeza de clasificación sobre el token `[CLS]`. No emplea técnicas de eficiencia como MoE, atención lineal ni decodificación especulativa; es un encoder denso clásico.

El entrenamiento se realizó durante 3 épocas con `learning_rate = 5e-05`, `train_batch_size = 8`, `eval_batch_size = 8`, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. El step final registrado es 171, lo que sugiere un dataset de entrenamiento pequeño (del orden de unos cientos de ejemplos, dado que 171 steps × batch 8 ≈ 1.368 ejemplos procesados en total a lo largo de 3 épocas). No se documenta el número de tokens, la composición del corpus, ni si hubo RLHF, DPO o cualquier etapa de alineamiento. Las versiones de framework son Transformers 5.20.2, PyTorch 2.11.0+cpu, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto por secuencia (pipeline `text-classification`): asigna una etiqueta a cada entrada, presumiblemente en el ámbito de discurso de odio o toxicidad, aunque el número y nombres de las etiquetas no se documentan.
- Codificación contextual bidireccional de hasta 512 tokens, adecuada para frases, tuits, comentarios y párrafos cortos.
- Extracción de representaciones (embeddings) del token `[CLS]` o de tokens individuales, reutilizables para otras tareas downstream.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe no garantizada: el backbone es `bert-base-uncased` (vocabulario y preentrenamiento en inglés) y el dataset de fine-tuning es desconocido.

## Casos de uso

- Moderación de comentarios en foros y redes: el modelo puede clasificar mensajes cortos en una sola pasada, con un coste de inferencia mínimo (110 M de parámetros) que permite procesar miles de comentarios por segundo en CPU.
- Filtrado previo en pipelines de contenido generado por usuarios: como primera etapa de un sistema de moderación en cascada, derivando los casos dudosos a un modelo mayor o a revisión humana.
- Prototipado rápido de clasificadores de toxicidad: sirve como línea base para comparar con modelos propios antes de invertir en entrenamiento a mayor escala.
- Investigación académica sobre sesgos en detección de odio: al ser un BERT-base afinado con hiperparámetros documentados, es reproducible y sirve como punto de partida para estudios comparativos.
- Etiquetado asistido de datasets: preanotar corpus con el modelo y corregir manualmente, reduciendo el coste de anotación (con la cautela de su accuracy de 0,6491).
- Extracción de embeddings para clustering de comentarios: usar las representaciones del encoder para agrupar mensajes por temática o tono antes de un análisis más profundo.
- Docencia y demostración de fine-tuning con HuggingFace `Trainer`: el repositorio ilustra el flujo completo (entrenamiento, evaluación, publicación) con métricas y versiones registradas.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío (`"results": []`), por lo que no hay benchmarks estándar (MMLU, GLUE, etc.). El único dato disponible es la evaluación interna del autor durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Validation loss | 0,7217 |
| Accuracy | 0,6491 |
| Training loss (epoca 3) | 0,6625 |
| Step final | 171 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,45 GB de pesos más activaciones; en la practica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16: ~0,22 GB de pesos; cuantizacion a int8 no esta publicada en el repo, pero es viable con herramientas externas (por ejemplo, `optimum` o `bitsandbytes`).
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o T4. En consumer, funciona sin problema en RTX 3060, RTX 4060, RTX 4090 e incluso en iGPU con suficiente memoria compartida.
- CPU: inference totalmente viable; el modelo corre en CPU con latencias del orden de milisegundos por secuencia corta.
- Opciones de despliegue: `transformers` (pipeline nativo), `text-embeddings-inference` (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime, o exportación a GGUF para llama.cpp aunque el soporte de BERT en llama.cpp es limitado.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño (110 M de parámetros) se espera un throughput de varios cientos a miles de secuencias por segundo en GPU y decenas a cientos en CPU, dependiendo de la longitud de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ronaldochaves/bert-hate-speech-test` | 109,5 M | 512 tokens | Clasificación de texto (hate speech, presumiblemente) | Apache 2.0 | HuggingFace, 20 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | Modelo base (MLM + NSP) | Apache 2.0 | HuggingFace, ampliamente usado |
| `facebook/roberta-base` | 125 M | 512 tokens | Modelo base (MLM) | MIT | HuggingFace |
| `cardiffnlp/twitter-roberta-base-hate` | ~125 M | 512 tokens | Clasificación de odio en Twitter | MIT | HuggingFace, con model card detallada |

La comparativa con alternativas específicas de detección de odio no está disponible en la información proporcionada; los modelos citados son referencias genéricas de la misma familia y tamaño. El modelo de `ronaldochaves` carece de documentación sobre dataset y etiquetas, lo que dificulta una comparación rigurosa con clasificadores publicados y evaluados en benchmarks como HateXplain o Davidson.

## Limitaciones y advertencias

- Accuracy de validación de 0,6491: insuficiente para uso en producción sin una evaluación independiente sobre datos representativos del dominio objetivo.
- Dataset de entrenamiento desconocido: no se puede evaluar el sesgo de selección ni la cobertura de fenómenos (sarcasmo, ironía, lenguaje codificado, variantes dialectales).
- Idiomas no documentados: el backbone es inglés; el rendimiento en castellano u otros idiomas es incierto y probablemente deficiente.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de falsos positivos y falsos negativos con impacto real si se usa para moderación automática.
- Sesgos potenciales derivados del corpus de fine-tuning no identificado: posibles disparidades por género, etnia, orientación sexual o dialecto, no auditadas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset subyacente impide garantizar el cumplimiento de derechos de terceros sobre los datos de entrenamiento.
- Model card generada automáticamente y sin revisar: no hay información sobre usos previstos, limitaciones declaradas por el autor ni instrucciones de uso.
- No apto para decisiones automatizadas de alto impacto (por ejemplo, moderación con consecuencias legales) sin supervisión humana.
- El tag `endpoints_compatible` y `text-embeddings-inference` sugiere compatibilidad con infraestructura de HuggingFace, pero no se ha validado su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ronaldochaves/bert-hate-speech-test
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de `Trainer`: https://huggingface.co/docs/transformers/main_classes/trainer
