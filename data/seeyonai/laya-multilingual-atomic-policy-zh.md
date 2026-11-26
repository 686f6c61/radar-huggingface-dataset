# SeeyonAI/laya-multilingual-atomic-policy-zh

## Resumen

laya-multilingual-atomic-policy-zh es un modelo de clasificación de texto especializado en verificación de políticas, cumplimiento normativo y flujos de trabajo estructurados en chino. Lo desarrolla SeeyonAI como un fine-tune del modelo base convaiinnovations/laya (subcarpeta laya-multilingual), que a su vez combina el encoder jhu-clsp/mmBERT-base de 322M de parámetros con una cabeza de decisión Laya de 2 capas. El resultado es un modelo de 321,9 millones de parámetros orientado a la toma de decisiones tipadas ("typed decisions") dentro del paradigma que el autor denomina "system-one": respuestas rápidas y calibradas en lugar de razonamiento generativo largo.

El problema que aborda es concreto: el modelo base, en modo zero-shot, actúa como un "sello de goma" en tareas de cumplimiento estructuradas, aprobando el 100% de los casos de un benchmark de 92 ejemplos con una confianza media del 97%. Este checkpoint corrige ese comportamiento mediante fine-tuning con quads contrastivos mínimos y descomposición atómica por cláusula, alcanzando un 95% de acierto en verificaciones estándar y un 84,4% en excepciones no vistas.

Su relevancia radica en el enfoque de calibración: incorpora escalado de temperatura post-hoc (LBFGS, T_noul = 1.535) y permite filtrar por umbral de confianza, de modo que las decisiones ambiguas se escalan a código determinista o a un modelo de razonamiento mayor. Está pensado para integrarse en pipelines de aprobación automatizada donde la precisión y la trazabilidad importan más que la generación libre de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base, 322M) + cabeza de decisión Laya de 2 capas |
| Parámetros totales | 321.908.998 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-base, un encoder transformer de 322M de parámetros, al que se añade una cabeza de decisión Laya de 2 capas que produce decisiones tipadas (en este caso, preguntas de tipo `noul` con criterios `true`/`false`). No es un modelo generativo: emite clasificaciones con puntuaciones de confianza calibradas. El fine-tune se realizó durante 4 épocas (172 actualizaciones del optimizador) con un objetivo `soft-ce` sobre políticas de flujo de trabajo sintéticas y quads contrastivos mínimos de cuatro vías: paso estándar, evidencia ausente, exención escrita válida y excusa verbal.

Tras el entrenamiento se aplicó un escalado de temperatura post-hoc mediante LBFGS con T_noul = 1.535, orientado a mejorar la calibración de las probabilidades. El autor documenta además un patrón recomendado para formularios multi-cláusula: evaluar una pregunta atómica `noul` por cláusula en una única llamada batcheada, aplicar ajuste de prior en log-odds (`--prior-pos-rate 0.6263`) y filtrar decisiones automáticas con umbral de confianza ≥ 0.80, escalando los casos ambiguos a código determinista o a un modelo de razonamiento de 4B–8B.

## Capacidades

- Clasificación de cumplimiento y verificación de políticas sobre formularios estructurados en chino.
- Descomposición atómica por cláusula: evalúa cada condición de política de forma independiente y agregable.
- Decisiones tipadas con criterios explícitos `true`/`false` y puntuación de confianza por respuesta.
- Calibración de probabilidades (ECE reducido de 0.470 a 0.079 en el split Tier 1).
- Detección de exenciones escritas válidas frente a excusas verbales en flujos de aprobación.
- Soporte multilingüe heredado del modelo base (etiqueta `multilingual`), con especialización en chino.
- Filtrado por umbral de confianza (`min_confidence`) para enrutar casos ambiguos.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo: es un clasificador de decisión.

## Casos de uso

- Aprobación automatizada de solicitudes de compra: el modelo evalúa cláusulas como límite de importe, material de comparación de precios o estado presupuestario, y devuelve una decisión con confianza para cada una, permitiendo aprobar automáticamente los casos claros.
- Verificación de cumplimiento documental en flujos multi-etapa: evalúa formularios con múltiples cláusulas numeradas en una sola llamada batcheada, aplicando ajuste de prior y umbral de confianza para decidir qué casos requieren revisión humana.
- Detección de exenciones y waivers: distingue entre una exención escrita válida y una excusa verbal, capacidad entrenada explícitamente con quads contrastivos (Tier 2, 84,4% de acierto en excepciones no vistas).
- Enrutamiento de casos ambiguos: gracias a la calibración, los casos con confianza inferior a 0.80 se escalan a código determinista o a un modelo de razonamiento de 4B–8B, construyendo un pipeline híbrido de bajo coste.
- Auditoría y trazabilidad de decisiones: al emitir decisiones tipadas con criterios explícitos, facilita el registro y la revisión posterior de por qué se aprobó o rechazó cada solicitud.
- Pre-filtrado en sistemas de gestión de gastos o RRHH: descarta solicitudes que incumplen políticas evidentes antes de llegar a un revisor humano, reduciendo carga operativa.
- Control de calidad en pipelines de datos estructurados: verifica que los formularios cumplen reglas de negocio antes de persistirlos o procesarlos aguas abajo.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el benchmark propio (92 casos, splits held-out):

| Split | Base zero-shot | Este checkpoint | Con filtro de confianza (≥ 0.80) |
|---|---|---|---|
| Tier 1 — 20 flujos estándar (n=40) | 50,0% (FP=20, FN=0, ECE 0.470) | 95,0% (FP=1, FN=1, ECE 0.079) | 97,3% precisión @ 92,5% cobertura automática |
| Tier 2 — excepciones no vistas (n=32) | 50,0% (FP=16, FN=0, ECE 0.486) | 84,4% (FP=5, FN=0, ECE 0.121) | 94,1% precisión @ 53,1% cobertura automática |
| Tier 3 — formularios multi-etapa (n=20) | 80,0%* (FP=4/4 violaciones no detectadas) | 80,0% (FP=2, FN=2, ECE 0.180) | 100,0% precisión en casos auto-enrutados; escala los ambiguos |

\*El base zero-shot predice `Approve` en 20/20 formularios, sin detectar ninguna violación.

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321,9M de parámetros, en fp32 ocupa aproximadamente 1,3 GB; en fp16 unos 0,65 GB; en int8 unos 0,35 GB (estimación a partir del recuento de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100 o RTX 4090 quedan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: la librería `laya` (`pip install -U laya`) es la vía documentada; al ser un encoder transformer estándar, es compatible en principio con frameworks de inferencia de clasificación basados en transformers, aunque el autor solo documenta `laya`.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 322M sin decodificación autoregresiva, se espera latencia de milisegundos por lote en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-multilingual-atomic-policy-zh | 321,9M | no disponible | Clasificación de decisión tipada, calibrada | Apache 2.0 | Hugging Face |
| convaiinnovations/laya (base) | ~322M | no disponible | Decisión tipada genérica, zero-shot | no disponible | Hugging Face |
| jhu-clsp/mmBERT-base | ~322M | no disponible | Encoder multilingüe base | no disponible | Hugging Face |
| Modelos generativos de 4B–8B (referencia del autor para escalado) | 4B–8B | no disponible | Razonamiento generativo | variable | Hugging Face |

El autor recomienda escalar los casos ambiguos a un modelo de razonamiento de 4B–8B, lo que sitúa a este checkpoint como primera etapa de un pipeline híbrido más que como alternativa directa a un LLM generativo.

## Limitaciones y advertencias

- Es un clasificador de decisión, no un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- El benchmark es propio y pequeño (92 casos); los resultados pueden no generalizar a dominios o formatos de formulario distintos de los sintéticos usados en entrenamiento.
- En el split Tier 3 (formularios multi-etapa) mantiene un 80,0% con 2 falsos positivos y 2 falsos negativos: requiere el patrón de descomposición atómica y el ajuste de prior para funcionar bien, y aun así escala casos ambiguos.
- La cobertura automática con filtro de confianza cae al 53,1% en excepciones no vistas (Tier 2): muchas decisiones acaban en revisión humana.
- Riesgo de alucinación bajo en el sentido generativo, pero riesgo de falsa aprobación en casos límite; el autor documenta que el base zero-shot aprobaba el 100% de los casos, un fallo que este checkpoint mitiga pero no elimina.
- Sesgos: no documentados por el autor; al entrenarse con políticas sintéticas, puede no reflejar la variabilidad de políticas reales.
- Especialización en chino: aunque la etiqueta indica multilingüe, el fine-tune se centró en políticas en chino y el rendimiento en otros idiomas no está verificado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base convaiinnovations/laya y de mmBERT-base.
- Sin descargas ni likes en el momento de la ficha: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeeyonAI/laya-multilingual-atomic-policy-zh
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Código y benchmark (GitHub): https://github.com/seeyonai/laya-atomic-policy
- Guía de fine-tuning en Mac: https://github.com/seeyonai/laya-atomic-policy/blob/main/docs/FIELD_GUIDE.md
- Encoder base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
