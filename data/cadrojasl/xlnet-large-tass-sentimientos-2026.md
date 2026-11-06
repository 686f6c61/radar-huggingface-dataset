# cadrojasl/xlnet-large-tass-sentimientos-2026

## Resumen

XLNet-large afinado en TASS es un modelo de clasificación de sentimientos en español desarrollado por el usuario cadrojasl como trabajo final del taller de PLN de una maestría en Ingeniería de Sistemas y Computación. Parte del checkpoint preentrenado `xlnet/xlnet-large-cased` y se ha ajustado sobre el corpus TASS de tweets en español para predecir tres etiquetas: negativo (N), neutro (NEU) y positivo (P). El modelo está publicado en Hugging Face con licencia MIT y un total de 361.321.475 parámetros.

La relevancia del modelo es acotada: se trata de un ejercicio académico, no de un sistema listo para producción. Sus métricas en el conjunto de prueba (F1 macro de 0,5407 y accuracy de 0,5428) sitúan el rendimiento ligeramente por encima del azar en un problema de tres clases, lo que sugiere un ajuste limitado y un margen de mejora amplio. Aun así, resulta útil como referencia reproducible para experimentos de clasificación de sentimientos en español y como punto de partida para afinar sobre TASS con arquitecturas más modernas.

El modelo emplea la arquitectura XLNet en configuración large, con tokenización cased y un contexto nominal de 512 tokens, típico de los modelos de la familia Transformer pre-BERT/RoBERTa. Su tamaño de 1,4 GB en el repositorio y sus 25 descargas en el momento de la consulta reflejan un uso muy minoritario dentro del ecosistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLNet (transformer autorregresivo con permutación, variante large) |
| Parámetros totales | 361.321.475 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base XLNet-large-cased admite hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLNet-large, un transformer que sustituye el objetivo de modelado de lenguaje enmascarado de BERT por un objetivo autorregresivo con permutación de factores, lo que le permite capturar dependencias bidireccionales sin la independencia condicional que introduce el masking. La variante large de XLNet cuenta con 24 capas, 16 cabezas de atención y una dimensión oculta de 1024, lo que da lugar a los 361 millones de parámetros reportados.

El ajuste se realizó sobre el corpus TASS de tweets en español (referencias cr-tass / cr1-tass en la model card), con un batch size de 32, un máximo de 10 épocas con early stopping (mínimo 6), tasa de aprendizaje de 2e-05 y precisión bf16. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de regularización adicionales, balanceo de clases o aumento de datos. Tampoco se especifica si hubo una fase de RLHF o DPO; por la naturaleza del problema, se trata de un ajuste supervisado estándar de clasificación.

## Capacidades

- Clasificación de sentimientos en español en tres clases: negativo (N), neutro (NEU) y positivo (P).
- Procesamiento de texto corto, orientado a publicaciones de redes sociales (tweets).
- Integración directa con la librería Transformers mediante `pipeline("text-classification")`.
- Soporte de inferencia en precisión bf16.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- Capacidad multilingüe limitada al español según la model card; no se reportan evaluaciones en otras lenguas.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Análisis de opinión en redes sociales: el modelo puede clasificar tweets en español en las tres categorías de sentimiento, lo que permite agregar métricas de percepción de marca o de eventos concretos sobre volúmenes moderados de texto.
- Monitorización de reputación en tiempo real: integrado en un pipeline de ingesta de menciones, asigna una etiqueta de polaridad a cada publicación para alimentar paneles de alerta temprana.
- Investigación académica en PLN: sirve como línea base reproducible para comparar técnicas de ajuste fino sobre TASS con arquitecturas más recientes (RoBERTa, DeBERTa, modelos decoder-only).
- Etiquetado asistido de datasets: puede preanotar grandes volúmenes de tweets para su posterior revisión humana, reduciendo el coste inicial de anotación.
- Filtrado de reseñas o comentarios: en foros y plataformas de contenido generado por usuarios, permite separar comentarios negativos para su revisión por moderadores.
- Docencia y talleres de PLN: su model card documenta hiperparámetros y métricas, lo que lo convierte en un ejemplo didáctico de ajuste fino supervisado con Transformers.
- Análisis de encuestas abiertas: clasificación de respuestas de texto libre en encuestas de satisfacción con categorías de polaridad, siempre con revisión humana dado el rendimiento limitado.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de prueba de TASS:

| Métrica | Valor |
|---|---|
| Precision (macro) | 0,5396 |
| Recall (macro) | 0,5422 |
| F1 (macro) | 0,5407 |
| Accuracy | 0,5428 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y tokenizador; en bf16, alrededor de 0,75 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en bf16 o fp16; una NVIDIA T4, RTX 3060 o superior cubre el caso con holgura.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: Transformers con PyTorch, pipeline de Hugging Face, ONNX Runtime, TorchScript; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cadrojasl/xlnet-large-tass-sentimientos-2026 | 361 M | no disponible (base: 512) | Clasificación de sentimientos en español (3 clases) | MIT | Hugging Face |
| xlnet/xlnet-large-cased (base) | ~340 M | 512 | Modelo de lenguaje preentrenado | Apache 2.0 (según el repositorio original) | Hugging Face |
| BETO (bert-base-spanish-wwm-cased) | ~110 M | 512 | Modelo de lenguaje en español, ajustable a clasificación | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Rendimiento modesto: F1 macro de 0,5407 y accuracy de 0,5428 en tres clases indican que el modelo apenas supera una línea base trivial; no es adecuado para producción sin un ajuste adicional.
- Sesgos potenciales: al entrenarse sobre tweets, puede heredar sesgos de género, origen, ideología o registro lingüístico presentes en el corpus TASS; no se documenta ninguna evaluación de sesgo.
- Riesgo de alucinación: aunque es un modelo de clasificación y no generativo, puede asignar etiquetas con alta confianza a entradas ambiguas o fuera de dominio, especialmente en textos formales o de otros registros.
- Limitaciones de idioma: solo se ha validado en español; su comportamiento en variantes dialectales no representadas en TASS es incierto.
- Limitaciones de contexto: el modelo base XLNet-large está diseñado para secuencias de hasta 512 tokens; textos más largos requerirán truncamiento o segmentación.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base XLNet-large-cased tiene su propia licencia (Apache 2.0 en el repositorio original); conviene verificar la compatibilidad antes de un despliegue comercial.
- Caveat de producción: el modelo fue creado como actividad académica y no cuenta con mantenimiento, documentación de versionado ni soporte del autor; se recomienda evaluarlo en el dominio objetivo antes de cualquier uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cadrojasl/xlnet-large-tass-sentimientos-2026
- Modelo base XLNet-large-cased: https://huggingface.co/xlnet/xlnet-large-cased
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales relevantes para este modelo.
