# Maldak123/TOTVS_Upsell_Teste

## Resumen

Maldak123/TOTVS_Upsell_Teste es un modelo de clasificación de texto en portugués obtenido mediante fine-tuning de FacebookAI/xlm-roberta-base. El autor lo describe como un clasificador para detectar intención de compra ("upsell") en reuniones B2B, entrenado con un conjunto de 3.000 reuniones. Se publica como un encoder de 278.045.186 parámetros en formato safetensors, con pipeline de text-classification e licencia MIT, por lo que es directamente consumible con la librería transformers (AutoModelForSequenceClassification).

El interés del modelo es acotado pero concreto: reutiliza un encoder multilingüe ya entrenado por Meta y lo especializa en una tarea de negocio muy específica (señalización comercial en conversaciones de venta B2B en portugués). Al ser un encoder de 278 M de parámetros con 512 tokens de contexto, el coste de inferencia es bajo y cabe en GPU de consumo e incluso en CPU con cuantización, lo que facilita su integración en CRMs y herramientas de análisis de llamadas.

Ahora bien, la model card presenta métricas de Accuracy, Precision, Recall, F1 y ROC-AUC de 1.0000, un resultado estadísticamente implausible en una tarea de clasificación de lenguaje natural con solo 3.000 ejemplos. Esa cifra, junto con el nombre "Teste" del repositorio, 0 descargas y 0 likes, apunta a un experimento de validación interna (posible fuga de datos entre train y evaluación, o evaluación sobre el propio conjunto de entrenamiento), no a un modelo listo para producción sin una reevaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa base (fine-tuning con cabeza de clasificación de secuencia) |
| Parámetros totales | 278.045.186 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (máximo posicional del encoder XLM-R; el modelo base usa 514 posiciones con offsets) |
| Tipos de cuantización | no disponible (el autor no publica pesos cuantizados); al ser un encoder de 278 M es viable aplicar cuantización dinámica int8 en PyTorch u ONNX Runtime |
| Idiomas soportados | portugués (etiqueta `pt` declarada); el modelo base XLM-R es multilingüe, pero el fine-tuning se ha realizado únicamente en portugués |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,1 GB) |
| Pipeline | text-classification |
| Tokenizador | SentencePiece de XLM-R (heredado del modelo base), no detallado en la model card |
| Número de etiquetas | no disponible (la model card no especifica el número de clases ni sus nombres) |
| Dataset de entrenamiento | 3.000 reuniones B2B (procedencia, idioma exacto y split no disponibles) |
| Fecha de publicación | 2026-09-10 según metadatos de HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario SentencePiece de 250.000 tokens. Sobre ese backbone, el autor ha añadido una cabeza de clasificación de secuencia, presumiblemente de una o varias clases (no se documenta si es binaria, "intención de compra sí/no", o multiclase). No hay información sobre hiperparámetros, número de épocas, tasa de aprendizaje, longitud máxima de secuencia usada en entrenamiento, política de padding/truncado ni estrategia de validación.

Tampoco se documenta ningún proceso de alineación (RLHF, DPO), lo cual es esperable en un encoder clasificador. La única información de entrenamiento disponible es el volumen del corpus (3.000 reuniones B2B) y el modelo base empleado. Al no publicarse la composición del dataset, ni si hubo aumento de datos, balanceo de clases o split train/validation/test, es imposible reproducir el entrenamiento o auditar las métricas reportadas.

## Capacidades

- Clasificación de texto en portugués: etiquetado de fragmentos o transcripciones completas (hasta 512 tokens por pasada) con una categoría de negocio.
- Detección de intención de compra/upsell en conversaciones B2B, según la descripción del autor.
- Inferencia por lotes sobre grandes volúmenes de transcripciones gracias a su tamaño reducido.
- Extracción de embeddings contextuales del encoder subyacente para tareas auxiliares (clustering, similitud, búsqueda semántica) si se usa la salida del pooler en lugar de la cabeza de clasificación.
- Base para fine-tuning adicional en otras tareas de clasificación en portugués.
- No soporta: generación de texto, razonamiento multi-paso, tool calling/function calling, capacidades de agente, visión, audio ni modo "thinking". Es un clasificador, no un modelo generativo.
- Capacidades multilingües: solo heredadas teóricamente del backbone; no hay evidencia de que el fine-tuning funcione fuera del portugués.

## Casos de uso

- Scoring de intención de compra en CRM: clasificar automáticamente las transcripciones de reuniones comerciales y asignar una probabilidad de upsell a cada oportunidad, para que el equipo de ventas priorice las cuentas con mayor señal.
- Priorización de leads para SDR: procesar en lote las notas y transcripciones del día anterior y generar una lista ordenada por probabilidad, evitando revisión manual.
- Control de calidad de llamadas: etiquetar conversaciones donde el comercial no introdujo el tema de upsell, para detectar formación deficiente o guiones no aplicados.
- Enrutado automático en contact center: dirigir las conversaciones clasificadas como "alta intención" a un especialista de producto o a un Account Executive en lugar de a soporte general.
- Análisis de cohortes y reporting comercial: agregar la tasa de intención de compra por sector, región o comercial a partir de miles de reuniones clasificadas por lotes.
- Señalización en tiempo real (asistencia al comercial): con latencia de milisegundos por secuencia en GPU, se puede ejecutar el clasificador sobre fragmentos parciales de la conversación y mostrar un aviso al comercial durante la reunión.
- Filtrado de ruido en pipelines de datos: descartar reuniones sin contenido comercial relevante antes de pasarlas a un modelo mayor (LLM) para resumen o extracción, reduciendo coste de inferencia.
- Punto de partida para transfer learning: reutilizar el encoder afinado como inicialización para otras tareas de clasificación en portugués con datasets propios.

## Benchmarks y rendimiento

El autor publica las siguientes métricas en la model card. Son los únicos datos disponibles y no se especifica el conjunto de evaluación, el split utilizado ni el número de clases.

| Métrica | Valor reportado |
|---|---|
| Accuracy | 1.0000 |
| Precision | 1.0000 |
| Recall | 1.0000 |
| F1 Score | 1.0000 |
| ROC-AUC | 1.0000 |

Advertencia: valores perfectos en todas las métricas con un corpus de 3.000 ejemplos indican casi con certeza sobreajuste severo, fuga de información entre entrenamiento y evaluación, o evaluación realizada sobre el mismo conjunto de entrenamiento. No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar, y estos no aplican a un modelo de clasificación.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 1,1-1,5 GB para pesos, más activaciones (dependiendo del batch y de la longitud de secuencia); con batch pequeño la inferencia cabe en menos de 2 GB.
- VRAM en fp16/bf16: alrededor de 0,6-0,8 GB de pesos.
- VRAM en int8 (cuantización dinámica): alrededor de 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU moderna con 4 GB o más es suficiente. Para producción con alto throughput: NVIDIA T4, L4, A10G, L40S, A100 o H100 (estas dos últimas sobredimensionadas para un encoder de 278 M).
- GPU de consumo: sí. Funciona con holgura en RTX 3060, 4060, 4070, 4080, 4090, e incluso en iGPU con suficiente memoria compartida usando ONNX Runtime.
- CPU: viable para inferencia por lotes con ONNX Runtime o PyTorch (decenas de milisegundos por secuencia de 512 tokens en CPU moderna), aunque el throughput exacto no está publicado.
- Opciones de despliegue: `transformers` pipeline, PyTorch + FastAPI, ONNX Runtime, TorchScript, Triton Inference Server, Hugging Face Inference Endpoints, Text Embeddings Inference (para el encoder) y SageMaker. vLLM no es la opción natural al tratarse de un encoder de clasificación. llama.cpp y Ollama no soportan este tipo de modelo clasificador de forma práctica.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

No hay resultados de benchmarks comparables publicados para este modelo. La comparación se limita a especificaciones estructurales y disponibilidad.

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Maldak123/TOTVS_Upsell_Teste | 278 M | 512 tokens | Portugués (fine-tuning) | MIT | HuggingFace, 0 descargas |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Multilingüe (100 idiomas) | MIT | HuggingFace, ampliamente usado |
| BERTimbau base (Neuralmind) | ~110 M | 512 tokens | Portugués de Brasil | MIT | HuggingFace |
| google-bert/bert-base-multilingual-cased | ~178 M | 512 tokens | Multilingüe (104 idiomas) | Apache-2.0 | HuggingFace |
| microsoft/deberta-v3-base | ~184 M | 512 tokens | Inglés | MIT | HuggingFace |

Rendimiento comparado: no disponible. El autor no aporta comparaciones con alternativas y las métricas reportadas (1.0000 en todas) no son comparables de forma fiable sin conocer el protocolo de evaluación.

## Limitaciones y advertencias

- Métricas sospechosas: Accuracy, Precision, Recall, F1 y ROC-AUC de 1.0000 con 3.000 reuniones indican sobreajuste o fuga de datos. No debe asumirse ese rendimiento en producción sin una evaluación independiente con un split limpio.
- Trazabilidad insuficiente: no se publican hiperparámetros, composición del dataset, número de clases, distribución de etiquetas ni estrategia de validación.
- Dominio muy estrecho: entrenado para detección de upsell en reuniones B2B en portugués. Fuera de ese dominio (otros idiomas, otros géneros textuales) el comportamiento es impredecible.
- Sesgos potenciales: heredados del backbone XLM-R y del corpus de 3.000 reuniones; sin documentación no se pueden auditar sesgos de género, acento, sector o variante dialectal del portugués (Brasil frente a Portugal).
- Sin información sobre tratamiento de datos: se desconoce si las 3.000 reuniones contenían datos personales, si se anonimizaron y bajo qué base legal. Si el corpus proviene de clientes reales, la licencia MIT del modelo no resuelve los derechos sobre los datos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; tampoco se especifica si el corpus de entrenamiento impone restricciones adicionales.
- Modelo sin validación comunitaria: 0 descargas y 0 likes, creado y actualizado en la misma ventana temporal. No hay terceros que hayan reproducido los resultados.
- Fecha de publicación futura en los metadatos (2026-09-10), lo que sugiere un experimento informal más que un artefacto mantenido.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos/negativos sistemáticos al clasificar conversaciones atípicas.
- Límite de 512 tokens: las reuniones largas deben trocearse o truncarse, lo que puede perder la señal de intención situada al final de la conversación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maldak123/TOTVS_Upsell_Teste
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos correspondían a sitios de fuentes tipográficas, una plataforma educativa china y un foro de software, sin relación con este modelo.
