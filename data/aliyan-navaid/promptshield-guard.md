# aliyan-navaid/promptshield-guard

## Resumen

PromptShield-guard es un modelo de clasificación de texto publicado en Hugging Face por el usuario aliyan-navaid bajo el identificador `aliyan-navaid/promptshield-guard`. El nombre sugiere un uso orientado a la detección o filtrado de prompts (posiblemente prompt injection o contenido no deseado), aunque la model card no confirma explícitamente esa función. El modelo se distribuye en formato safetensors con la librería transformers y está etiquetado como compatible con text-embeddings-inference y endpoints_compatible.

El checkpoint contiene 141.896.450 parámetros (aproximadamente 142 millones), un tamaño coherente con la familia DeBERTa-v2, que aparece referenciada en los tags del repositorio junto al paper arXiv:1910.09700 (relativo a estimación de emisiones de carbono, no al modelo en sí). El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta, lo que indica una publicación muy reciente y sin validación comunitaria.

La relevancia de esta ficha es limitada pero real: se trata de un clasificador encoder-only ligero, potencialmente desplegable en CPU o GPU de consumo, pero con una documentación prácticamente inexistente. La model card es la plantilla automática de Hugging Face sin rellenar, por lo que la mayoría de datos técnicos (datos de entrenamiento, licencia, idiomas, métricas) figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer, según tag del repositorio) |
| Parametros totales | 141.896.450 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `deberta-v2` del repositorio apunta a una arquitectura DeBERTa-v2, un transformer encoder-only con atención desenredada (disentangled attention) y un mecanismo de atención relativa que separa el contenido y la posición de cada token. El recuento de 141,9 millones de parámetros es compatible con la variante base de esta familia. Al tratarse de un modelo de clasificación de texto, la cabeza de salida sería una capa de clasificación sobre el token `[CLS]` o equivalente.

No hay información pública sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo fine-tuning supervisado, RLHF o DPO. La model card no incluye hiperparámetros, régimen de precisión ni infraestructura de cómputo. Tampoco se documenta ninguna innovación técnica adicional más allá de la propia arquitectura DeBERTa-v2.

## Capacidades

- Clasificación de texto: pipeline `text-classification` declarado en los metadatos del repositorio.
- Detección de prompts potencialmente maliciosos o no deseados: inferido del nombre del modelo, no confirmado en la documentación.
- Compatibilidad con text-embeddings-inference y endpoints_compatible, lo que facilita su despliegue como servicio HTTP.
- Generación de texto: no disponible (modelo encoder-only).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Filtrado de entrada en aplicaciones LLM: el modelo podría colocarse como clasificador previo a un chatbot para marcar prompts sospechosos antes de enviarlos al modelo generativo, aprovechando su bajo coste computacional como encoder de 142 M de parámetros.
- Moderación de contenido en formularios públicos: integrado en un endpoint HTTP (compatible con text-embeddings-inference) para etiquetar mensajes de usuarios en tiempo real sin necesidad de GPU dedicada.
- Preprocesado en pipelines de RAG: clasificar consultas de usuario para descartar entradas anómalas antes de la recuperación documental, reduciendo el riesgo de manipulación del contexto.
- Enrutado de peticiones: usar la etiqueta de salida para derivar consultas a distintos flujos (por ejemplo, soporte técnico frente a consultas generales) dentro de un sistema de atención al cliente.
- Investigación en seguridad de LLM: servir como baseline ligero para comparar estrategias de detección de prompt injection en entornos académicos o de auditoría interna.
- Clasificación por lotes en CPU: al tratarse de un encoder de tamaño moderado, permite procesar grandes volúmenes de textos en servidores sin GPU, útil para análisis retrospectivos de logs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,57 GB solo para pesos (142 M × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,28 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también tarjetas de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (nativo), text-embeddings-inference (declarado en los tags), endpoints_compatible; vLLM, llama.cpp y Ollama no están orientados a este tipo de encoder de clasificación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| promptshield-guard | 141,9 M | no disponible | text-classification | no disponible | Hugging Face |
| DeBERTa-v2-base (Microsoft) | ~139 M | 512 tokens | encoder general / fine-tune | MIT | Hugging Face |
| DistilBERT-base | ~66 M | 512 tokens | encoder general / fine-tune | Apache 2.0 | Hugging Face |
| RoBERTa-base | ~125 M | 512 tokens | encoder general / fine-tune | MIT | Hugging Face |

La comparación se establece por tamaño y familia arquitectónica; no hay datos de rendimiento de promptshield-guard que permitan contrastar métricas de clasificación con estas alternativas.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática sin rellenar, por lo que no se puede verificar el propósito real, los datos de entrenamiento ni el rendimiento.
- Licencia no declarada: no se puede garantizar el uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés.
- Riesgo de sesgos y alucinación: sin información sobre el dataset de entrenamiento, no es posible evaluar sesgos; en clasificación, el equivalente es la tasa de falsos positivos y negativos, también desconocida.
- Longitud de contexto no documentada: probablemente 512 tokens si sigue la configuración estándar de DeBERTa-v2, pero no está confirmado.
- Sin validación comunitaria: cero descargas y cero likes; no hay evidencia externa de calidad ni de reproducibilidad.
- Advertencia de producción: no recomendable como componente crítico de seguridad sin una evaluación propia sobre datos representativos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aliyan-navaid/promptshield-guard
- Paper referenciado en los tags (estimación de emisiones, no del modelo): https://arxiv.org/abs/1910.09700
- Documentación de DeBERTa-v2 (arquitectura de referencia): https://huggingface.co/microsoft/deberta-v2-base
- Documentación de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
