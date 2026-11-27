# MinkPhc/visobert-scam-vn

## Resumen

VisoBERT-scam-vn es un modelo de clasificación de texto publicado en Hugging Face por el usuario MinkPhc. Por su identificador y por la arquitectura declarada (xlm-roberta), se trata de un ajuste fino de la familia XLM-RoBERTa orientado a la detección de estafas en vietnamita ("vn" en el nombre y "visobert" como referencia a un modelo base preentrenado para vietnamita). El modelo se distribuye en formato safetensors con 97.567.490 parámetros, lo que corresponde a la configuración base de XLM-RoBERTa (aproximadamente 278 M de parámetros en su variante estándar; el recuento aquí es el del checkpoint efectivamente publicado).

El problema que aborda es la clasificación binaria o multietiqueta de mensajes fraudulentos, un caso de uso de creciente relevancia en el sudeste asiático, donde las estafas por SMS, correo y aplicaciones de mensajería han aumentado de forma notable. La etiqueta del pipeline es `text-classification`, y el modelo es compatible con text-embeddings-inference y endpoints, lo que facilita su despliegue como servicio.

La información pública es muy escasa: la model card está generada automáticamente y no incluye datos de entrenamiento, licencia, idiomas ni resultados de evaluación. Cualquier uso en producción requiere una validación propia sobre un conjunto de datos representativo del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia XLM-RoBERTa / RoBERTa) |
| Parametros totales | 97.567.490 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base admite hasta 512 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica posible vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | no disponible (por el nombre, orientado a vietnamita) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de la familia XLM-RoBERTa, según los tags del repositorio (`xlm-roberta`) y la referencia al paper arXiv:1910.09700 (Unsupervised Cross-lingual Representation Learning at Scale, Conneau et al., 2019). El recuento de 97,5 M de parámetros es inferior al de XLM-RoBERTa-base (~278 M), lo que sugiere una variante reducida o un checkpoint con capas eliminadas; no hay información pública que permita confirmarlo.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, el régimen de precisión (fp32, fp16, bf16) ni si se aplicaron técnicas de RLHF, DPO o aumentación de datos. La model card no documenta hiperparámetros, infraestructura de cómputo ni procedimiento de ajuste fino. Tampoco se especifica si el ajuste se realizó sobre VisoBERT (modelo preentrenado en vietnamita) o directamente sobre XLM-RoBERTa multilingüe.

## Capacidades

- Clasificación de texto: etiquetado de mensajes como estafa o no estafa (la taxonomía exacta de clases no está documentada).
- Procesamiento de texto en vietnamita: el identificador sugiere especialización en este idioma, aunque no se confirma en la documentación.
- Compatibilidad con text-embeddings-inference: puede servirse como endpoint de inferencia estándar.
- Integración con la librería transformers: carga directa mediante `AutoModelForSequenceClassification`.
- No se documentan capacidades de generación, razonamiento multi-paso, tool calling, agentes, visión ni audio: es un modelo exclusivamente encoder para clasificación.

## Casos de uso

- Moderación de mensajes en plataformas de mensajería: clasificar mensajes entrantes como sospechosos de estafa antes de mostrarlos al usuario, con umbral de confianza configurable y revisión humana para los casos límite.
- Filtrado de correo y SMS fraudulentos: integrar el modelo en un pipeline previo al buzón de entrada para etiquetar mensajes con señales de fraude (suplantación, premios falsos, solicitudes de datos bancarios).
- Detección de fraude en marketplaces y clasificados: analizar descripciones de anuncios y mensajes de vendedores para identificar patrones de estafa antes de publicar.
- Enriquecimiento de sistemas de ticketing: clasificar automáticamente reclamaciones de clientes que reportan intentos de estafa, priorizando su gestión por el equipo de fraude.
- Señal auxiliar en sistemas anti-fraude: usar la probabilidad del clasificador como feature adicional en un modelo de scoring más amplio que combine reglas, grafos de entidades y señales transaccionales.
- Investigación y análisis de campañas: procesar grandes volúmenes de mensajes recopilados para estudiar la prevalencia y evolución de patrones de estafa en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,4 GB para los pesos (97,5 M × 4 bytes); en fp16, unos 0,2 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o T4. En consumer, RTX 3060, RTX 4060, RTX 4090 funcionan sin problema.
- CPU: la inferencia en CPU es viable para volúmenes moderados, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (soporte declarado), ONNX Runtime, y potencialmente vLLM/TGI para clasificación. No se documenta soporte de llama.cpp ni Ollama (no aplica a encoders de clasificación).
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinkPhc/visobert-scam-vn | 97,5 M | no disponible | Clasificación de estafas (vi) | no disponible | Hugging Face |
| xlm-roberta-base | ~278 M | 512 tokens | Representaciones multilingües (base para ajuste) | MIT | Hugging Face |
| visobert (base vietnamita) | no disponible en esta ficha | no disponible | Representaciones en vietnamita | no disponible | Hugging Face |
| phobert-base | ~135 M | 256 tokens | Representaciones en vietnamita | no disponible | Hugging Face |

La comparación con alternativas específicas de detección de estafas en vietnamita no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un ajuste fino sobre datos no especificados, puede heredar sesgos del corpus de entrenamiento y del modelo base.
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no genera texto), pero puede producir falsos positivos y falsos negativos con confianza alta; requiere calibración y umbrales validados.
- Limitaciones de contexto e idioma: no se confirma la ventana máxima ni los idiomas soportados; el nombre sugiere vietnamita, pero no hay evidencia documentada. El rendimiento en otros idiomas o en texto code-switching es desconocido.
- Restricciones de licencia: la licencia no está disponible, lo que impide asumir uso comercial libre. Es imprescindible contactar con el autor o verificar el repositorio antes de un despliegue en producción.
- Caveats para producción: sin métricas de evaluación publicadas, sin dataset de validación documentado y sin información sobre el proceso de etiquetado, el modelo no debe desplegarse sin una evaluación propia sobre datos representativos del dominio objetivo. La fecha de creación (2026-11-27) y la ausencia de descargas e interacciones sugieren un modelo reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MinkPhc/visobert-scam-vn
- Paper de referencia XLM-RoBERTa: https://arxiv.org/abs/1910.09700
