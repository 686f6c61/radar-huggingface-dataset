# iceninja3/phishing-deberta-v3-base

## Resumen

Phishing-deberta-v3-base es un modelo de clasificación de texto derivado de microsoft/deberta-v3-base, ajustado por el autor iceninja3 para la detección de correos de phishing. El modelo resuelve un problema concreto de ciberseguridad: distinguir entre comunicaciones legítimas y fraudulentas en entornos de correo electrónico, devolviendo una probabilidad binaria (clase 0 legítimo, clase 1 phishing). Forma parte del proyecto de investigación llm-phishing-detection, cuyo repositorio público se enlaza en la model card.

Con 184,4 millones de parámetros y un tamaño de repositorio de 0,7 GB, es un modelo compacto pensado para inferencia de baja latencia (328,3 ms en p50 según el autor) y despliegue en infraestructura modesta. La arquitectura subyacente DeBERTa-v3 incorpora atención desacoplada y embeddings de posición relativos, lo que le permite modelar dependencias textuales finas sin el coste de un modelo generativo grande.

Su relevancia actual radica en el uso de modelos encoder pequeños y especializados como primera línea de defensa frente a phishing, donde la latencia y el coste por inferencia importan más que la generación de texto. La licencia Apache 2.0 facilita su integración en productos comerciales, si bien el autor no documenta el corpus de ajuste fino ni los idiomas cubiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, atención desacoplada, embeddings de posición relativos) |
| Parametros totales | 184.423.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card usa truncation con max_length=512) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de microsoft/deberta-v3-base, un encoder transformer con atención desacoplada (contenido y posición calculados por separado) y embeddings de posición relativos, optimizado para tareas de comprensión del lenguaje. Sobre esta base se aplica un ajuste fino supervisado para clasificación binaria de secuencias, con una cabeza de clasificación de dos etiquetas (legítimo y phishing).

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o aumento de datos. Tampoco se documenta la estrategia de tokenización más allá del uso de `max_length=512` con truncamiento en el ejemplo de inferencia. La evaluación reportada se realiza sobre el split de test del benchmark denominado `test_llm`, sin detallar su procedencia ni su tamaño. La innovación principal no está en la arquitectura, sino en la especialización: un encoder base reutilizado como clasificador de phishing con métricas orientadas a falsos positivos (Recall @ 1% FPR).

## Capacidades

- Clasificación binaria de texto en dos clases: `0` legítimo y `1` phishing, con salida de probabilidad vía softmax.
- Detección de phishing en correos electrónicos, incluyendo asunto y cuerpo concatenados en el formato `Subject: ...\n\n...`.
- Análisis de indicadores textuales de fraude: urls sospechosas, urgencia, solicitudes de credenciales, suplantación de identidad.
- Inferencia de baja latencia (328,3 ms en p50 según el autor), adecuada para filtrado en tiempo real.
- Integración con el ecosistema transformers mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- No dispone de generación de texto, tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles (no se documentan idiomas cubiertos).

## Casos de uso

- Filtrado previo en pasarelas de correo: el modelo se coloca antes de reglas heurísticas o del filtro antispam existente para puntuar cada mensaje entrante y marcar los de alta probabilidad de phishing, reduciendo la carga sobre el resto del pipeline.
- Cuarentena automática de mensajes: cuando la probabilidad supera un umbral configurable, el correo se mueve a una carpeta de cuarentena con aviso al usuario, aprovechando la métrica Recall @ 1% FPR para minimizar interrupciones a usuarios legítimos.
- Enriquecimiento de alertas SOC: el score de phishing se adjunta a las alertas de seguridad para priorizar la revisión manual de los casos más dudosos y descartar automáticamente los de baja probabilidad.
- Protección de formularios y mensajería interna: el mismo clasificador puede puntuar mensajes de contacto, tickets de soporte o chats internos que contengan enlaces y solicitudes de credenciales, reutilizando el formato de entrada subject/body.
- Análisis retrospectivo de buzones comprometidos: procesar en lote el histórico de correos de una cuenta para identificar campañas de phishing pasadas y reconstruir la línea temporal de un incidente.
- Evaluación de campañas de concienciación: clasificar los correos de simulación de phishing enviados por el equipo de seguridad para verificar que el modelo los detecta y calibrar los umbrales antes de desplegarlo en producción.
- Servicio de clasificación bajo demanda: exponer el modelo detrás de una API interna con transformers y un servidor ligero, dado su tamaño de 0,7 GB y su latencia subsegundo, para que otros sistemas consulten la probabilidad de phishing sin replicar el modelo.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo / nota |
|---|---|---|
| Recall @ 1% FPR | 88,2% | IC 95%: 84,3%–91,4% |
| PR-AUC | 0,9870 | Sobre el split de test del benchmark `test_llm` |
| Latencia de inferencia (p50) | 328,3 ms | Condiciones de hardware no especificadas |

No se han publicado resultados comparativos con otros modelos en la información disponible. No se dispone de datos de MMLU, HumanEval ni GSM8K, que no aplican a un clasificador de phishing.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7–1 GB en precisión completa (fp32) para 184,4 M parámetros, y menos de 0,5 GB en fp16; el tamaño del repo (0,7 GB) es coherente con pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4090, A100 y H100; el modelo está sobredimensionado para GPU de datacenter y funciona bien en hardware modesto.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna, y también en CPU para cargas de trabajo moderadas.
- Opciones de despliegue: transformers con PyTorch, ONNX Runtime, TorchScript, Text Embeddings Inference (TEI) y FastAPI como wrapper HTTP; llama.cpp y Ollama no son adecuados porque el modelo no es generativo y no publica pesos GGUF.
- Latencia y throughput: latencia p50 de 328,3 ms reportada por el autor; el throughput no está documentado y dependerá del hardware, del tamaño de lote y de la longitud de los textos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iceninja3/phishing-deberta-v3-base | 184,4 M | no disponible (ejemplo con max_length=512) | Clasificación de phishing | apache-2.0 | Hugging Face |
| microsoft/deberta-v3-base | 184,4 M | 512 tokens | Modelo base de propósito general | MIT | Hugging Face |
| Modelos de phishing comparables | no disponible | no disponible | Clasificación de phishing | no disponible | no disponible |

No se dispone de información sobre otros clasificadores de phishing con métricas publicadas que permitan una comparación directa de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un ajuste fino sobre un corpus no descrito, pueden persistir sesgos del modelo base y del dataset de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el clasificador puede producir falsos positivos y falsos negativos; el Recall @ 1% FPR de 88,2% implica que aproximadamente un 11,8% de los casos positivos no se detectan a ese umbral.
- Limitaciones de contexto: la model card usa truncamiento a 512 tokens, por lo que correos largos pierden información; no se documenta la longitud máxima real del modelo.
- Idiomas: no se especifican idiomas soportados; el rendimiento fuera del idioma o idiomas del corpus de ajuste es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base microsoft/deberta-v3-base y del proyecto llm-phishing-detection.
- Caveats para producción: el benchmark `test_llm` no está descrito en detalle; las métricas no han sido replicadas de forma independiente; el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica ausencia de validación por la comunidad; el autor no documenta el dataset, el proceso de anotación ni la calibración de probabilidades, por lo que se recomienda validar sobre una muestra propia antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iceninja3/phishing-deberta-v3-base
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Proyecto de investigación llm-phishing-detection: https://github.com/whilewak/llm-phishing-detection
