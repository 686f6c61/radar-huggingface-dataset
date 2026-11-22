# Claudeface/prompt-gateway-injection

## Resumen

El modelo `Claudeface/prompt-gateway-injection` es un clasificador de texto basado en la arquitectura DistilBERT, publicado en Hugging Face por el usuario Claudeface. Con 66.955.010 parámetros totales, se trata de un modelo encoder-only derivado de la familia BERT, diseñado para la tarea de clasificación de texto (`text-classification`). Por el nombre del repositorio, parece orientado a la detección de inyección de prompts en pasarelas (gateways) de LLM, es decir, a identificar intentos de prompt injection en el tráfico de entrada a un sistema de IA.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 0,3 GB, lo que es coherente con un DistilBERT de aproximadamente 67 millones de parámetros en precisión de 32 bits. La model card es la plantilla automática de Hugging Face y no aporta información sobre datos de entrenamiento, licencia, idiomas ni procedencia del fine-tuning, por lo que la mayor parte de los metadatos técnicos no está disponible.

Su relevancia potencial radica en el ámbito de la seguridad de aplicaciones LLM: un clasificador ligero y rápido que pueda filtrar peticiones maliciosas antes de que lleguen al modelo generativo. No obstante, la ausencia de documentación, de métricas publicadas y de licencia explícita limita seriamente su adopción en producción sin una evaluación previa por parte del equipo que lo integre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder-only, derivado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT estandar: 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, una versión destilada de BERT que reduce el número de capas a la mitad (6 capas frente a 12) manteniendo el tamaño de las representaciones. El recuento de 66.955.010 parámetros es consistente con un DistilBERT con cabecera de clasificación, aunque ligeramente por encima de los ~66 millones habituales, lo que sugiere una posible modificación en la capa de salida o un vocabulario extendido. El modelo es encoder-only y produce una representación contextual del texto de entrada que se proyecta a una o varias etiquetas de clasificación.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. La model card no documenta hiperparámetros, régimen de precisión ni procedimiento de destilación. Tampoco se indica si el fine-tuning se realizó sobre el checkpoint oficial `distilbert-base-uncased` o sobre otra variante. Toda esta información figura como "no disponible" en el repositorio.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar etiquetas a fragmentos de texto de entrada.
- Detección de inyección de prompts: por el nombre del repositorio, se infiere un uso previsto como filtro de seguridad en pasarelas de LLM, aunque no está documentado por el autor.
- Procesamiento de texto corto y medio: propio de un encoder con ventana estándar de 512 tokens (no confirmado).
- No soporta generación de texto, razonamiento, código ni matemáticas: es un modelo discriminativo, no generativo.
- No dispone de soporte documentado de tool calling, function calling ni agentes.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Filtrado de prompt injection en pasarelas LLM: el modelo podría colocarse como primera capa de un gateway que recibe peticiones de usuario y clasifica cada prompt como legítimo o sospechoso antes de reenviarlo al modelo generativo, aprovechando su bajo coste computacional.
- Moderación de contenido en aplicaciones de chat: integrado en un pipeline de preprocesado, permitiría etiquetar mensajes de entrada según categorías de riesgo definidas durante el fine-tuning.
- Clasificación de tickets de soporte: si el fine-tuning se orientó a dominios de seguridad, podría reutilizarse para categorizar incidencias relacionadas con abusos o intentos de manipulación.
- Detección de jailbreaks en APIs públicas: desplegado tras un endpoint de inferencia, actuaría como filtro de bajo coste y baja latencia para bloquear patrones conocidos de evasión.
- Enrutamiento de consultas en sistemas RAG: un clasificador ligero puede decidir si una consulta debe pasar por un recuperador o si es potencialmente maliciosa, reduciendo el coste de llamadas al modelo grande.
- Investigación en seguridad de LLM: como baseline reproducible para experimentos de detección de prompt injection, dado su tamaño reducido y su formato safetensors.
- Análisis por lotes de logs de conversación: para auditar históricos de interacciones y etiquetar incidentes de seguridad de forma offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67 M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,14 GB para pesos; en int8, en torno a 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura. También es viable en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 1-2 GB de VRAM, e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (nativo), Text Embeddings Inference (TEI, etiqueta `text-embeddings-inference` presente), ONNX Runtime, y potencialmente llama.cpp si se convierte a GGUF (no confirmado por el autor).
- Latencia y throughput estimados: no disponibles; para un DistilBERT de 67 M parámetros en GPU moderna se espera latencia de milisegundos por muestra, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Claudeface/prompt-gateway-injection | 66.955.010 | no disponible | text-classification | no disponible | Hugging Face |
| distilbert-base-uncased | ~66 M | 512 | encoder base (fine-tunable) | Apache 2.0 | Hugging Face |
| ProtectAI/deberta-v3-base-prompt-injection | ~184 M | 512 | deteccion de prompt injection | Apache 2.0 | Hugging Face |
| Meta Prompt Guard (86M) | ~86 M | 512 | deteccion de prompt injection | Llama community license | Hugging Face |

La comparación con alternativas de detección de prompt injection es pertinente por el nombre del repositorio, pero conviene señalar que no hay métricas publicadas de este modelo que permitan una comparación cuantitativa. Los modelos de ProtectAI y Meta Prompt Guard cuentan con documentación y evaluaciones públicas, mientras que este checkpoint carece de ambas.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: la información sobre entrenamiento, datos, licencia e idiomas no está disponible.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor antes de integrarlo en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su eficacia en detección de prompt injection ni en ninguna otra tarea.
- Riesgo de sesgos desconocido: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, sin métricas que los cuantifiquen.
- Idiomas no declarados: no se puede asumir soporte multilingüe; probablemente entrenado solo en inglés si deriva de `distilbert-base-uncased`, pero no está confirmado.
- Longitud de contexto no confirmada: si sigue la configuración estándar de DistilBERT, se limita a 512 tokens, insuficiente para prompts largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-22) en los metadatos: posible artefacto o error del repositorio, que conviene verificar.
- No apto para generación de texto, razonamiento ni tareas generativas: es exclusivamente un clasificador.

## Enlaces

- Hugging Face: https://huggingface.co/Claudeface/prompt-gateway-injection
- Paper de referencia citado en los tags (ML Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Documentación de DistilBERT (arquitectura base): https://huggingface.co/distilbert-base-uncased
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
