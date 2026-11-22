# liamsi/tiny-dlms-rhoa-small

## Resumen

Rhoa-small (ῥόα, "granada") es un modelo de decisión en miniatura desarrollado por liamsi dentro del proyecto educativo tiny-dlms. No es un modelo generativo: recibe un contexto y una lista de opciones, puntúa cada opción en un único forward pass y aplica una softmax sobre las puntuaciones para devolver una probabilidad por opción. Está escrito y entrenado desde cero en PyTorch, sin usar la librería `transformers`, incluyendo tokenizador, arquitectura y bucle de entrenamiento.

Se trata de un transformer muy pequeño (2 capas de 64 dimensiones con 4 cabezas, más una capa adicional donde las opciones se atienden entre sí) con 721.472 parámetros y una ventana de entrada de 128 tokens. Se preentrenó con predicción de tokens enmascarados sobre 2 GB de texto web de FineWeb-Edu (479 millones de tokens) y después se ajustó simultáneamente en cuatro tareas de clasificación de intención y elección múltiple.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra que un modelo de menos de un millón de pesos puede resolver tareas de clasificación de intenciones con decenas o cientos de clases (83,0% en Banking77, 67,6% en CLINC150), al tiempo que evidencia los límites de esta escala (17,6% en CommonsenseQA, por debajo del azar). El autor lo describe explícitamente como un proyecto de aprendizaje, no como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con RMSNorm, RoPE y SwiGLU; 2 capas x 64 de anchura (4 cabezas) + 1 capa de atención entre opciones |
| Parametros totales | 721.472 (0,72 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens de entrada (`<cls> context <sep> option`) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tokenizador | BPE a nivel de byte, 8.192 tokens, entrenado sobre el texto web |
| Pasos de entrenamiento | 14.000 |
| Pipeline | zero-shot-classification |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder compacto de 2 capas con anchura 64 y 4 cabezas de atención, usando RMSNorm, RoPE (rotary position embeddings) y SwiGLU en las capas feed-forward. La innovación estructural respecto a un encoder convencional es una capa adicional en la que las representaciones de las distintas opciones se atienden entre sí, lo que permite al modelo comparar opciones de forma relativa antes de puntuarlas. La entrada tiene el formato `<cls> contexto <sep> opción`, limitada a 128 tokens, y la salida es una puntuación por opción normalizada con softmax.

El entrenamiento se realizó en dos fases. Primero, preentrenamiento con predicción de tokens enmascarados sobre 2 GB de texto web de FineWeb-Edu, lo que supone 479 millones de tokens procesados. Después, ajuste fino conjunto sobre cuatro datasets: bAbI (con 2 a 6 opciones), CLINC150 (151 intenciones), Banking77 (77 intenciones) y CommonsenseQA (5 opciones). No se menciona uso de RLHF ni DPO. El tokenizador, el modelo y el entrenamiento se implementaron desde cero en PyTorch, sin `transformers`.

## Capacidades

- Clasificación de intenciones en inglés: selecciona una etiqueta entre un conjunto de opciones (hasta 151 en CLINC150 y 77 en Banking77).
- Clasificación zero-shot: el pipeline declarado es `zero-shot-classification`, de modo que las etiquetas candidatas se proporcionan en tiempo de inferencia.
- Elección múltiple y razonamiento sobre opciones: puntúa todas las opciones en un solo forward pass y devuelve una distribución de probabilidad sobre ellas.
- Seguimiento de instrucciones simples en formato de diálogo corto (bAbI, con contextos de 2 a 6 opciones).
- No genera texto: no es un modelo autoregresivo ni produce respuestas libres.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Clasificación de intenciones en asistentes de voz o chat: dado un turno del usuario y una lista cerrada de intenciones (por ejemplo, 77 de Banking77), el modelo devuelve la probabilidad de cada una en un único forward pass, con un coste computacional mínimo apto para CPU.
- Enrutamiento de tickets de soporte: el contexto del ticket se empareja con las categorías del sistema de ticketing y la opción con mayor probabilidad determina la cola de destino; útil como primera etapa de triaje antes de un modelo mayor.
- Etiquetado zero-shot de textos cortos: para taxonomías nuevas, basta con pasar las etiquetas como opciones sin reentrenar, aprovechando el pipeline `zero-shot-classification`.
- Filtrado y preclasificación en pipelines de datos: al tener 0,72 M de parámetros, puede ejecutarse sobre grandes volúmenes de texto en CPU para descartar o agrupar ejemplos antes de pasarlos a un modelo mayor.
- Docencia y experimentación en arquitecturas transformer: el código completo (tokenizador, modelo, entrenamiento) sirve como base reproducible para estudiar el efecto del preentrenamiento enmascarado y del ajuste fino multi-tarea a escala mínima.
- Pruebas de concepto de decisión sobre opciones en entornos embebidos: el reducido tamaño de pesos (menos de 1 M de parámetros) permite desplegarlo en dispositivos con recursos muy limitados, siempre que la tarea se limite a elegir entre opciones predefinidas.
- Evaluación comparativa de arquitecturas: el proyecto publica variantes (Rhoa con bloques GPT-2, Rhoa base preentrenado, etc.), lo que permite comparar decisiones de diseño (RoPE frente a posiciones aprendidas, RMSNorm frente a LayerNorm) con el mismo presupuesto de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los conjuntos de test reservados:

| Dataset (test reservado) | Opciones | Este modelo | Azar |
|---|---|---|---|
| bAbI | 6 | 81,4% | 28,2% |
| CLINC150 | 151 | 67,6% | 0,7% |
| Banking77 | 77 | 83,0% | 1,3% |
| CommonsenseQA | 5 | 17,6% | 20,0% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor señala que CommonsenseQA se mantiene cerca del azar en todas las variantes del proyecto, porque unos pocos millones de pesos no pueden almacenar conocimiento del mundo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en fp32 para los 0,72 M de parámetros, más el vocabulario del tokenizador (8.192 tokens); cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3060) es más que suficiente.
- Cabe en GPU consumer: sí, en todas, y también en dispositivos embebidos.
- Opciones de despliegue: la librería propia `tiny-dlm` (instalable desde GitHub con el extra `hub`), que carga el modelo mediante `from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo y no publica pesos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un coste por forward pass muy bajo, pero no se han publicado cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La comparación más directa disponible es interna al propio proyecto tiny-dlms, que publica variantes con el mismo esquema de entrenamiento:

| Modelo | Descripcion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| tiny-dlms-rhoa-small | 2 capas x 64 + capa de atención entre opciones; preentrenado y ajustado | 0,72 M | 128 tokens | MIT |
| tiny-dlms-rhoa | La mejor variante Rhoa; preentrenada y ajustada | No disponible | No disponible | MIT |
| tiny-dlms-rhoa-gpt2 | Rhoa con bloques GPT-2 (LayerNorm, posiciones aprendidas, GELU); solo preentrenado | No disponible | No disponible | MIT |
| tiny-dlms-rhoa-base | Rhoa preentrenado antes del ajuste fino (predicción de tokens enmascarados) | No disponible | No disponible | MIT |

No se han publicado en la información disponible comparaciones con modelos de clasificación de intenciones de terceros (por ejemplo, clasificadores basados en BERT o en modelos generativos ajustados).

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre; solo puntúa opciones proporcionadas por el usuario.
- Ventana de entrada muy corta (128 tokens), lo que limita contextos largos y conversaciones multi-turno extensas.
- Solo inglés; no hay soporte multilingüe.
- Rendimiento cercano al azar en tareas que requieren conocimiento del mundo (CommonsenseQA: 17,6% frente a 20,0% del azar).
- No apto para producción: el autor lo describe explícitamente como un proyecto de aprendizaje.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente: las probabilidades de la softmax sobre opciones no deben interpretarse como confianza fiable sin validación.
- Sesgos: no documentados en la información disponible; al preentrenarse sobre FineWeb-Edu, puede heredar sesgos del corpus web.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene conservar el aviso de copyright.
- Dependencia de la librería propia `tiny-dlm` instalada desde GitHub, no desde PyPI, lo que añade fricción de despliegue y riesgo de cambios en la API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liamsi/tiny-dlms-rhoa-small
- Repositorio de código: https://github.com/benisalla/tiny-dlms
- Página del proyecto: https://benisalla.github.io/tiny-dlms/
- Variante principal: https://huggingface.co/liamsi/tiny-dlms-rhoa
- Variante con bloques GPT-2: https://huggingface.co/liamsi/tiny-dlms-rhoa-gpt2
- Variante preentrenada base: https://huggingface.co/liamsi/tiny-dlms-rhoa-base
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset bAbI: https://huggingface.co/datasets/Muennighoff/babi
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset CommonsenseQA: https://huggingface.co/datasets/tau/commonsense_qa
