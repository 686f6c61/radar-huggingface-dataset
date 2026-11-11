# inclusionAI/SingVL_S1_4B

## Resumen

Sing VL S1 4B es un modelo de decisión multimodal desarrollado por inclusionAI y construido sobre la arquitectura Qwen3.5. A diferencia de un modelo generativo convencional, su función es responder preguntas con nombre sobre texto o JSON y hasta cuatro imágenes, devolviendo probabilidades calibradas sobre opciones predefinidas en lugar de texto libre. Cada pregunta se resuelve con un único forward pass de Transformers, lo que lo convierte en una pieza adecuada para enrutamiento, clasificación y verificación dentro de pipelines.

El modelo expone tres tipos de decisión tipada: *choice* (selecciona una opción entre varias y devuelve la probabilidad de cada candidata), *noul* (probabilidad de que una proposición sí/no sea verdadera) y *score* (puntuación sobre 2-10 niveles ordenados, devolviendo la probabilidad de cada nivel y el nivel esperado). Esta interfaz estructurada elimina la necesidad de parsear texto generado y facilita la integración en sistemas que requieren salidas deterministas y verificables.

Con 4.539.265.536 parámetros y un repositorio de 9,1 GB en safetensors, el modelo se sitúa en el rango de 4B, lo que permite despliegues en GPU de gama alta de consumo. Su relevancia actual radica en la creciente demanda de modelos especializados en toma de decisiones y evaluación (routers, guardarraíles, clasificadores de intención) frente a los modelos generativos generalistas, y en su soporte nativo de entradas multimodales texto-imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5, un transformer multimodal que procesa texto, JSON e imágenes en una única secuencia. La innovación principal no reside en el backbone sino en la cabeza de decisión: en lugar de generar tokens de forma autorregresiva, el modelo puntúa opciones candidatas en un solo forward pass. Para las preguntas de tipo *choice* devuelve una distribución de probabilidad sobre las opciones; para *noul*, una probabilidad binaria; y para *score*, una distribución sobre niveles ordenados junto con el valor esperado calculado como suma ponderada de índices. Las imágenes se insertan mediante marcadores `<image>` en el estado, con un marcador por imagen y en el orden de la lista proporcionada; si no se incluyen marcadores, el modelo los inserta automáticamente antes del texto de estado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado específico. La model card únicamente describe la interfaz de decisión y los resultados de evaluación, sin detallar el proceso de entrenamiento ni las innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Decisión tipada sobre texto y JSON: selección entre opciones (*choice*), verificación booleana (*noul*) y puntuación ordinal (*score*).
- Procesamiento multimodal de hasta cuatro imágenes por consulta, con soporte de marcadores `<image>` explícitos o inserción automática.
- Evaluación de múltiples preguntas con nombre en una sola llamada, cada una con su propio tipo, instrucciones y criterios.
- Salidas probabilísticas calibradas por opción o nivel, aptas para umbrales y agregación posterior.
- Capacidades de razonamiento y conocimiento evaluadas en benchmarks de texto (MMLU, GPQA, ARC, GSM8K, BBH, HLE, entre otros).
- Capacidades de percepción visual evaluadas en CV-Bench, BLINK, RealWorldQA, CharXiv, InfographicVQA, MMMU-Pro vision y otros.
- Soporte de tool calling y selección de funciones evaluado en BFCL, ToolRet y API-Bank.
- Clasificación de intención y enrutamiento evaluado en BANKING77, CLINC150+OOS y RouterBench.
- Detección de alucinaciones y verificación factual evaluada en RAGTruth y HoVer.
- Servidor HTTP compatible con FastAPI y endpoint `POST /v1/systemone` para integración en servicios.

## Casos de uso

- Enrutamiento de consultas en sistemas multi-modelo: el modelo puede actuar como router que, dada una consulta de texto o una imagen, seleccione entre varios modelos o pipelines disponibles mediante preguntas *choice*, con la ventaja de devolver probabilidades por candidato para aplicar umbrales de confianza.
- Clasificación de intención en asistentes conversacionales: con preguntas *choice* sobre un conjunto cerrado de intenciones (por ejemplo, las 77 clases de BANKING77 o las 150 de CLINC150), el modelo ofrece una alternativa determinista al parseo de texto generado.
- Verificación de hechos y guardarraíles: mediante preguntas *noul* sobre proposiciones concretas, se puede comprobar si una afirmación está respaldada por el contexto, útil en pipelines RAG para filtrar respuestas alucinadas.
- Moderación de contenido multimodal: con preguntas *score* o *choice* sobre imágenes y texto, el modelo puede puntuar el grado de toxicidad o clasificar memes dañinos, como refleja su evaluación en Hateful Memes.
- Extracción de información de documentos e infografías: con hasta cuatro imágenes por consulta, puede responder preguntas de elección sobre campos de formularios, tablas o gráficos (evaluado en InfographicVQA, KIE y CharXiv).
- Evaluación de calidad en pipelines de generación: usando preguntas *score* de 2-10 niveles, se puede puntuar la calidad de una respuesta o la relevancia de un documento recuperado, con valor esperado como métrica agregable.
- Selección de herramientas en agentes: con preguntas *choice* sobre un catálogo de funciones, el modelo decide qué herramienta invocar, evaluado en BFCL con una precisión de caso exacto de 96,81 en el modo no-skill.

## Benchmarks y rendimiento

La model card publica resultados del Public Decision Index 0.3, comparando con TypeSafe Jev 1.14, StartLux-Decision v1.1 4B y Perplexity Decider Flash v1.2 (4B).

| Panel | Sing VL S1 | TypeSafe Jev 1.14 | StartLux-Decision v1.1 4B | Perplexity Decider Flash v1.2 (4B) |
|---|---:|---:|---:|---:|
| Text | **69.76** | 60.70 | 67.8 | 60.1 |
| Vision | **73.94** | — | 67.90 | 72.5 |

Resultados destacados por dataset (modo non-skill / modo skill):

| Dataset | Non-Skill | Skill |
|---|---:|---:|
| CV-Bench | 87.34 | 79.12 |
| BLINK | 72.11 | 56.83 |
| RealWorldQA | 82.17 | 70.87 |
| CharXiv | 86.65 | 82.21 |
| InfographicVQA | 96.31 | 95.08 |
| Mind2Web | 87.67 | 83.56 |
| Winoground | 93.12 | 86.25 |
| KIE (CORD+FUNSD) | 95.82 | 93.12 |
| Moderation (Hateful Memes) | 71.64 | 43.28 |
| R-Bench-M | 49.77 | 39.72 |
| MMMU-Pro vision | 50.17 | 42.85 |
| BFCL | 96.81 | 95.70 |
| ToolRet | 67.96 | 63.00 |
| API-Bank | 84.45 | 84.15 |
| BANKING77 | 94.00 | 93.92 |
| CLINC150+OOS | 97.03 | 97.01 |
| ContractNLI | 84.05 | 76.94 |
| ANLI | 78.29 | 67.48 |
| MMLU | 82.93 | 77.24 |
| GPQA Diamond | 53.06 | 37.41 |
| ARC-Easy | 99.03 | 98.71 |
| ARC-Challenge | 96.25 | 95.00 |
| WinoGrande | 89.82 | 79.64 |
| HellaSwag | 96.48 | 95.31 |
| GSM8K | 73.84 | 68.68 |
| MuSR | 65.82 | 45.66 |
| BRIGHT | 47.51 | 40.62 |
| FinEntity | 95.19 | 92.93 |
| NLI4CT | 86.41 | 73.56 |
| CRUXEval | 78.07 | 65.21 |
| CLadder | 94.72 | 89.44 |
| HLE | 12.77 | 0.00 |
| MMLU-Pro | 68.40 | 64.46 |
| BBH | 88.61 | 83.49 |
| RAGTruth | 83.49 | 65.77 |
| HoVer | 89.25 | 78.50 |
| When2Call MCQ | 90.61 | 87.48 |
| New Yorker caption matching | 80.49 | 75.61 |
| Public Text Index (weighted aggregate) | 77.26 | 69.76 |

Los datasets marcados con † en la model card (RouterBench, SGD/SGD-X, MMLU, ARC-Easy, ARC-Challenge, SimpleBench) se reportan por separado y se excluyen del Text Index. SGD/SGD-X muestra un resultado anómalo bajo (8,33 en non-skill, 0,00 en skill), lo que conviene tener en cuenta.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9-10 GB solo para pesos (4,54B parámetros), más overhead de activaciones y caché KV, por lo que se recomienda al menos 16 GB de VRAM para comodidad.
- En cuantización de 8 bits, el peso se reduciría a unos 4,5-5 GB, aunque no se publican pesos cuantizados oficiales ni se documentan tipos de cuantización soportados.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) como opciones viables en una sola GPU.
- Cabe en GPU de consumo de gama alta con 24 GB (RTX 4090, RTX 3090) en precisión completa; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) probablemente requiera cuantización, no documentada oficialmente.
- Opciones de despliegue: el repositorio incluye código de inferencia propio (`inference/model.py`) y un servidor FastAPI (`serve.py`) con endpoint `POST /v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no es generativo autorregresivo y requiere la cabeza de decisión personalizada.
- Latencia y throughput: no disponibles. Al resolver cada pregunta con un único forward pass, la latencia por consulta debería ser sustancialmente menor que la de un modelo generativo equivalente, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Public Text Index | Public Vision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sing VL S1 4B | 4,54B | no disponible | 69,76 | 73,94 | no disponible | Hugging Face (inclusionAI) |
| TypeSafe Jev 1.14 | no disponible | no disponible | 60,70 | — | no disponible | no disponible |
| StartLux-Decision v1.1 4B | ~4B | no disponible | 67,8 | 67,90 | no disponible | no disponible |
| Perplexity Decider Flash v1.2 (4B) | ~4B | no disponible | 60,1 | 72,5 | no disponible | no disponible |

Sing VL S1 lidera ambos paneles del Public Decision Index 0.3 frente a los tres comparadores publicados en la model card. La ventaja es más amplia en texto (+1,96 puntos sobre StartLux, +9,06 sobre TypeSafe Jev) que en visión (+1,44 sobre Perplexity Decider Flash, +6,04 sobre StartLux). No se dispone de información sobre contexto, licencia ni disponibilidad de los modelos comparadores más allá de lo reportado.

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse si se permite uso comercial; es imprescindible verificar la licencia en el repositorio antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados; la evaluación se realiza íntegramente en inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- No se publica la longitud de contexto, lo que impide planificar el tamaño máximo de estado (texto, JSON o imágenes) que puede procesar.
- El modelo no es generativo: no produce texto libre, solo probabilidades sobre opciones predefinidas. No debe usarse para tareas de generación, resumen o diálogo abierto.
- El límite de cuatro imágenes por consulta restringe su uso en documentos de muchas páginas o vídeo.
- Riesgo de alucinación inherente a los benchmarks de conocimiento: HLE obtiene 12,77 y GPQA Diamond 53,06 en modo non-skill, lo que indica que el conocimiento experto es limitado y no debe confiarse ciegamente en dominios especializados.
- El resultado anómalo en SGD/SGD-X (8,33 y 0,00) sugiere un fallo de formato o de adaptación a ese esquema de diálogo concreto, que conviene investigar antes de usar el modelo en ese tipo de tareas.
- No se documentan sesgos conocidos ni se publican evaluaciones de sesgo o seguridad más allá de Hateful Memes (71,64 en non-skill, 43,28 en skill), donde el rendimiento cae notablemente en modo skill.
- El código de inferencia requiere Python 3.12 y versiones de PyTorch y torchvision compatibles con el hardware; no hay integración con librerías de serving estándar, lo que añade coste de ingeniería.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción aún muy limitada y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/SingVL_S1_4B
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
