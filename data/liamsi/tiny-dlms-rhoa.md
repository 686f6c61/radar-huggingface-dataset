# liamsi/tiny-dlms-rhoa

## Resumen

Rhoa (ῥόα, "granada" en griego) es un modelo de decisión de escala minima desarrollado por liamsi. No genera texto: recibe un contexto y una lista de opciones, puntúa cada opción en una sola pasada hacia delante y aplica softmax para asignar una probabilidad a cada candidata. Está entrenado desde cero en PyTorch, sin usar la librería `transformers`, incluyendo tokenizador, arquitectura y bucle de entrenamiento.

Con 2,36 millones de parámetros y un contexto máximo de 128 tokens, se posiciona como un experimento educativo más que como un modelo de producción. Su relevancia radica en demostrar qué puede lograr un transformer minúsculo en tareas de clasificación de intenciones y selección de opciones cuando se preentrena sobre texto web y se afina con datasets específicos.

La versión `rhoa` es el checkpoint principal de la familia: preentrenado con 2 GB de FineWeb-Edu (479 millones de tokens) y afinado de forma conjunta sobre bAbI, CLINC150, Banking77 y CommonsenseQA. Alcanza resultados notables en bAbI (100%) y aceptables en clasificación de intenciones, pero se mantiene cerca del azar en tareas que requieren conocimiento del mundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con 4 capas x 128 de anchura (4 cabezas) + 1 capa de atención entre opciones |
| Parametros totales | 2.360.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de 4 capas y anchura 128 con 4 cabezas de atención, más una capa adicional donde las representaciones de las distintas opciones interactúan entre sí (atención entre candidatas). Emplea RMSNorm, RoPE (rotary position embeddings) y SwiGLU en los bloques. El tokenizador es un BPE a nivel de byte con vocabulario de 8.192 tokens, entrenado sobre el mismo corpus web. La entrada sigue el formato `<cls> contexto <sep> opción`, truncada a 128 tokens.

El entrenamiento consta de dos fases: primero, preentrenamiento con predicción de tokens enmascarados sobre 2 GB de FineWeb-Edu (479 millones de tokens); después, afinado conjunto sobre cuatro datasets simultáneamente (bAbI con 2-6 opciones, CLINC150 con 151 intenciones, Banking77 con 77 intenciones y CommonsenseQA con 5 opciones). El total de pasos de entrenamiento reportado es de 14.000. No se menciona uso de RLHF ni DPO.

## Capacidades

- Selección de opciones múltiples: puntúa todas las candidatas en una sola pasada y devuelve una distribución de probabilidad sobre ellas.
- Clasificación de intenciones zero-shot y few-shot mediante listas de etiquetas candidatas.
- Clasificación de intenciones con vocabularios cerrados (CLINC150, Banking77).
- Razonamiento sobre escenarios sintéticos de bAbI (tareas de lógica simple con 2-6 opciones).
- Respuesta a preguntas de sentido común con opciones (CommonsenseQA), aunque con rendimiento cercano al azar.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: dado un turno del usuario y una lista de intenciones predefinidas, el modelo devuelve la probabilidad de cada una; útil para enrutado ligero en entornos con recursos muy limitados.
- Detección de temas en tickets de soporte: con las 77 etiquetas de Banking77 como candidatas, puede asignar un ticket a una categoría con una sola pasada, sin generación.
- Enrutado de consultas en chatbots de banca: el afinado sobre Banking77 permite clasificar consultas como "tarjeta perdida", "cambio de PIN" o "llegada de tarjeta" con un coste computacional mínimo.
- Filtrado y triaje en pipelines de datos: para decidir entre un conjunto pequeño de categorías (por ejemplo, etiquetas de calidad o tipo de contenido) sobre textos cortos.
- Prototipado educativo y experimentación: sirve como banco de pruebas para estudiar el comportamiento de transformers minúsculos en tareas de decisión, con código accesible y entrenamiento reproducible.
- Evaluación de modelos de decisión en entornos con restricciones de memoria: al ocupar unos pocos megabytes, puede desplegarse en dispositivos embebidos o en CPU para tareas de clasificación binaria o de pocas clases.

## Benchmarks y rendimiento

| Dataset (test held-out) | Opciones | Este modelo | Aleatorio |
|---|---|---|---|
| bAbI | 6 | 100,0% | 28,2% |
| CLINC150 | 151 | 72,6% | 0,7% |
| Banking77 | 77 | 84,4% | 1,3% |
| CommonsenseQA | 5 | 20,8% | 20,0% |

El autor señala que CommonsenseQA se mantiene cerca del azar en todos los modelos de la familia: unos pocos millones de pesos no pueden almacenar conocimiento del mundo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (2,36 M de parámetros); cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, Raspberry Pi o cualquier acelerador modesto. Una RTX 4090 o A100 estarían enormemente sobredimensionadas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, etc.) y en dispositivos de borde.
- Opciones de despliegue: el paquete propio `tiny-dlm` (instalable vía `pip install "tiny-dlm[hub] @ git+https://github.com/benisalla/tiny-dlms"`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| tiny-dlms-rhoa | 2,36 M | 128 | MIT | Decisión entre opciones |
| tiny-dlms-rhoa-small | no disponible | no disponible | MIT | Decisión entre opciones (menor) |
| tiny-dlms-rhoa-gpt2 | no disponible | no disponible | MIT | Decisión con bloques GPT-2 |
| tiny-dlms-rhoa-base | no disponible | no disponible | MIT | Preentrenado sin afinar |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de aprendizaje, no de producción: el propio autor lo describe como "a learning project, not a production model".
- Sin capacidad de generación: solo puntúa opciones; no redacta respuestas.
- Contexto muy corto (128 tokens), insuficiente para documentos o conversaciones largas.
- Solo inglés; no se documenta soporte multilingüe.
- Rendimiento cercano al azar en tareas que requieren conocimiento del mundo (CommonsenseQA, 20,8%).
- Riesgo de sesgos heredados del corpus FineWeb-Edu y de los datasets de afinado, no evaluado en la información disponible.
- Riesgo de alucinación no aplicable en el sentido habitual (no genera texto), pero sí de asignar probabilidades altas a opciones incorrectas en dominios fuera de distribución.
- Licencia MIT: permite uso comercial, pero sin garantías de ningún tipo.
- Sin datos publicados sobre latencia, throughput ni cuantizaciones alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liamsi/tiny-dlms-rhoa
- Repositorio GitHub: https://github.com/benisalla/tiny-dlms
- Página del proyecto: https://benisalla.github.io/tiny-dlms/
- Modelos relacionados: https://huggingface.co/liamsi/tiny-dlms-rhoa-small, https://huggingface.co/liamsi/tiny-dlms-rhoa-gpt2, https://huggingface.co/liamsi/tiny-dlms-rhoa-base, https://huggingface.co/liamsi/tiny-dlms-melon-car, https://huggingface.co/liamsi/tiny-dlms-melon-car-small, https://huggingface.co/liamsi/tiny-dlms-melon-maze
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
