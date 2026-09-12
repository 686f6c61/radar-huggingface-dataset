# leomaurodesenv/nli-MiniLM2-L6-H768-trustairlab-jailbreak

## Resumen

nli-MiniLM2-L6-H768-trustairlab-jailbreak es un modelo de clasificación de texto publicado por el usuario leomaurodesenv en HuggingFace. Se trata de un ajuste fino (fine-tuning) del cross-encoder `cross-encoder/nli-MiniLM2-L6-H768`, un encoder de tipo transformer con arquitectura RoBERTa (etiquetada así por el autor en los tags del repositorio) y 82.119.938 parámetros. El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, con un pipeline declarado de `text-classification`.

El nombre del repositorio sugiere que el ajuste se orientó a la detección de *jailbreaks* o prompts maliciosos partiendo de un modelo de inferencia de lenguaje natural (NLI) y de la referencia "trustairlab", aunque la model card no documenta el conjunto de datos utilizado: indica explícitamente "unknown dataset" y deja secciones como descripción, usos previstos y datos de entrenamiento como "more information needed". Por tanto, la única evidencia publicada sobre su comportamiento es la métrica de evaluación reportada por el propio autor.

Su relevancia es principalmente práctica: con solo 82 millones de parámetros y un tamaño de repositorio de 3,9 GB, es un candidato a clasificador auxiliar de bajo coste para filtrado de contenido, moderación o guardarraíles en pipelines de LLM, ejecutable en CPU o en GPUs de gama de entrada. Ahora bien, al no haber publicado benchmarks comparativos ni descripción del dataset, su adopción en producción exige una validación propia del caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo RoBERTa (tag `roberta` del repositorio); derivado de MiniLM2-L6-H768 (6 capas, hidden size 768) |
| Parametros totales | 82.119.938 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica el máximo de tokens) |
| Tipos de cuantizacion | no disponible (no se declaran versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (también compatible con `transformers` y con `text-embeddings-inference`) |
| Pipeline | text-classification |
| Modelo base | cross-encoder/nli-MiniLM2-L6-H768 |
| Tamano del repositorio | 3,9 GB |
| Descargas / likes | 0 / 0 |
| Compatibilidad de endpoints | sí (`endpoints_compatible`, `text-embeddings-inference`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer tipo RoBERTa con 6 capas y dimensión oculta de 768 (de ahí la nomenclatura L6-H768), con 82,1 millones de parámetros. Es un modelo exclusivamente de codificación bidireccional, sin decodificador, por lo que no genera texto: produce una distribución de probabilidad sobre clases a partir de una secuencia de entrada. El ajuste fino se realizó con la librería `transformers` (versión 5.2.0) sobre PyTorch 2.10.0+cu128, `datasets` 4.5.0 y `tokenizers` 0.22.2.

El procedimiento de entrenamiento sí está documentado en la model card: 10 épocas, learning rate 2e-05, batch de entrenamiento efectivo de 16 (batch 8 con 2 pasos de acumulación de gradiente), optimizador `adamw_torch_fused` con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 50 pasos de calentamiento y semilla 42. El conjunto de datos de entrenamiento y evaluación no se especifica ("unknown dataset"), ni se documenta si hubo etapas de RLHF, DPO u otro tipo de alineamiento (no aplicable en la práctica a un clasificador). No se declara ninguna innovación técnica adicional (atención lineal, decodificación especulativa, mezcla de expertos, etc.).

El repositorio registra resultados de validación a lo largo del entrenamiento, con mejor accuracy en la época 2 (0,9363) y posterior degradación ligera en las épocas 3 a 5, lo que apunta a un posible sobreajuste a partir de ese punto.

## Capacidades

- Clasificación de texto: es su única función declarada, con pipeline `text-classification` sobre secuencias de entrada.
- Detección de contenido malicioso: por el nombre del repositorio ("jailbreak") y su base NLI, está orientado a la clasificación binaria o multiclase de prompts adversarios, aunque la model card no lo especifica formalmente.
- Inferencia de relación entre textos: al derivar de un modelo NLI (natural language inference), cabe esperar comportamiento de entailment/contradiction/neutral, si bien el ajuste concreto puede haber sobrescrito esa cabeza de clasificación.
- Ejecución en CPU y GPU de gama baja: por su tamaño reducido (82 M de parámetros).
- Compatibilidad con endpoints: los tags indican compatibilidad con `text-embeddings-inference` y despliegue vía endpoints gestionados.
- Generación de texto: no soportada (modelo encoder-only).
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Capacidades multilingües: no declaradas; no disponible.
- Capacidades multimodales (visión, audio): no soportadas.

## Casos de uso

- Guardarraíl de entrada en aplicaciones LLM: colocar el clasificador delante de un modelo generativo para etiquetar prompts potencialmente maliciosos y bloquearlos o derivarlos a revisión, con un coste de cómputo muy inferior al del modelo principal.
- Moderación de contenido en plataformas de chat: filtrar mensajes de usuarios en tiempo real gracias al reducido tamaño del modelo, que permite procesar lotes grandes por segundo en una única GPU de gama media.
- Filtrado de datasets de entrenamiento: etiquetar corpus a gran escala para descartar ejemplos adversarios o de baja calidad antes de usarlos en el entrenamiento de modelos mayores.
- Evaluación de robustez de sistemas de IA: usar el modelo como detector de referencia al auditar la resistencia de un asistente conversacional frente a ataques de tipo *prompt injection*.
- Clasificación de tickets y mensajes de soporte: si se reajusta o se valida adecuadamente, puede emplearse para categorizar consultas entrantes por intención o peligrosidad en un sistema de atención al cliente.
- Investigación académica en seguridad de LLM: como línea base reproducible (Apache 2.0, 82 M de parámetros) para comparar técnicas de detección de jailbreaks.
- Servicio de inferencia ligero en *edge* o *on-premise*: al caber en memoria de CPU, permite desplegar el clasificador en entornos sin GPU o con requisitos estrictos de latencia y coste.
- Prefiltro en un sistema en cascada: descartar rápidamente el tráfico claramente benigno y reservar un modelo mayor y más caro para los casos dudosos.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros); el campo `model-index` aparece vacío. Los únicos datos disponibles son las métricas de validación declaradas por el autor durante el entrenamiento y en la evaluación final.

| Metrica (conjunto de evaluacion del autor) | Valor |
|---|---|
| Loss | 0,1895 |
| Accuracy | 0,9363 |

Evolución durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 605 | 0,3682 | 0,2335 | 0,9321 |
| 2.0 | 1210 | 0,1565 | 0,1891 | 0,9363 |
| 3.0 | 1815 | 0,2798 | 0,2223 | 0,9359 |
| 4.0 | 2420 | 0,1989 | 0,2034 | 0,9355 |
| 5.0 | 3025 | 0,1528 | 0,2854 | 0,9293 |

No se han publicado comparaciones con otros modelos ni resultados desagregados por clase, idioma o tipo de ataque.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 330 MB en FP32, unos 165 MB en FP16/BF16 y unos 85 MB en INT8. El repositorio ocupa 3,9 GB, muy por encima del peso teórico de los pesos, por lo que probablemente incluye estados de optimizador o checkpoints intermedios; conviene revisar los ficheros antes de desplegar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, L4). Modelos mayores como A100 o H100 no son necesarios salvo por requisitos de agregación de tráfico masivo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- Ejecución en CPU: viable para cargas moderadas, dado el tamaño del modelo.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportación a ONNX Runtime para inferencia acelerada, Text Embeddings Inference (etiqueta presente en el repositorio), Hugging Face Inference Endpoints (tag `endpoints_compatible`), o un servidor propio con FastAPI. El soporte de vLLM para modelos encoder de clasificación es limitado.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones del autor).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nli-MiniLM2-L6-H768-trustairlab-jailbreak | 82.119.938 | no disponible | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| cross-encoder/nli-MiniLM2-L6-H768 (modelo base) | del mismo orden (familia MiniLM2-L6-H768) | no disponible | no disponible en la informacion facilitada | HuggingFace |
| Otras alternativas de clasificacion de jailbreak o prompt injection | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados comparativos de accuracy frente a otros clasificadores, de modo que no es posible establecer una jerarquía de rendimiento con los datos disponibles.

## Limitaciones y advertencias

- Documentación insuficiente: la model card indica "unknown dataset" y deja sin completar las secciones de descripción, usos previstos, datos de entrenamiento y limitaciones. No se conocen las clases exactas, la taxonomía de etiquetas ni el formato de entrada esperado.
- Sesgos desconocidos: al no documentarse la composición del corpus de entrenamiento, no se puede evaluar el sesgo por idioma, registro, dominio o demografía.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de falsos positivos y falsos negativos en la clasificación, sin tasas publicadas por clase.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del idioma o idiomas de entrenamiento es una incógnita.
- Sobreajuste probable: la accuracy cae de 0,9363 en la época 2 a 0,9293 en la época 5 y la pérdida de validación sube de 0,1891 a 0,2854, lo que sugiere que el checkpoint final no es necesariamente el mejor.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, sin historial de uso de la comunidad ni retroalimentación externa.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base debería verificarse por separado antes de un despliegue en producción.
- Trazabilidad: no se han publicado números de benchmark comparables ni desagregados, por lo que cualquier decisión de despliegue debe apoyarse en una evaluación propia sobre datos representativos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leomaurodesenv/nli-MiniLM2-L6-H768-trustairlab-jailbreak
- Modelo base: https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768
- Paper, blog o repositorio adicionales: no disponible (la búsqueda web no ha devuelto enlaces relacionados con el modelo)
