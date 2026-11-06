# nouli-ai/nouli-underwrite-evidence

## Resumen

Nouli Underwrite Evidence es un sistema de clasificación de texto desarrollado por Nouli AI, orientado al sector asegurador y, más concretamente, a la revisión de evidencia histórica en siniestros de construcción. El modelo recibe una narrativa de incidente en inglés junto con un extracto seleccionado por un humano y devuelve una de cuatro temáticas de revisión (integridad de equipos y controles, gestión y formación, práctica laboral y condición del lugar de trabajo), acompañada de las probabilidades de cada clase y de las salidas de los componentes individuales.

Técnicamente no es un único modelo, sino un ensemble de tres codificadores: RoBERTa-large, TS-Ettin-150M y Ettin encoder 1B, que suman aproximadamente 1.540 millones de parámetros y 3,07 GB de pesos almacenados. El paquete incluye además una capa de reglas que verifica hechos actuales aportados por el usuario, detecta conflictos y decide si el caso debe derivarse a solicitud de información, a revisión de suscripción o a revisión humana, sin que el clasificador intervenga cuando falta información requerida.

El modelo es relevante porque ilustra un patrón de despliegue muy habitual en dominios regulados: un clasificador aprendido acotado a una tarea concreta, envuelto en reglas deterministas auditables y con decisión final humana. Se publica como research preview, no acepta, rechaza, tarifica ni emite pólizas, y su licencia combina Apache-2.0 y MIT con avisos de componentes adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de tres codificadores transformer tipo encoder (RoBERTa-large, TS-Ettin-150M, Ettin encoder 1B) con capa de reglas determinista |
| Parámetros totales | Aproximadamente 1.540 millones en conjunto |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos almacenados en safetensors, 3,07 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 y MIT, con avisos de componentes en LICENSES.md |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Inferencia | No soportada por el pipeline estándar de Hugging Face; requiere inferencia nativa (`inference/predict.py`) |
| Runtime | CPU o CUDA; CPU reverificada para esta release |
| Dataset de entrenamiento | lab-flair/constructcie |
| Modelos base | FacebookAI/roberta-large, typestrict/TS-Ettin-150M, jhu-clsp/ettin-encoder-1b |

## Arquitectura y entrenamiento

El sistema combina tres codificadores de la familia transformer con atención bidireccional. RoBERTa-large aporta la base más consolidada del ensemble; TS-Ettin-150M y Ettin encoder 1B son modelos de la familia Ettin, diseñados como encoders, que añaden diversidad de representación y capacidad. Cada componente procesa la misma evidencia histórica y sus salidas se agregan en una única etiqueta temática con probabilidades, junto con las salidas individuales de cada componente para facilitar la inspección.

El ajuste fino se realiza sobre el dataset `lab-flair/constructcie`, orientado a la extracción de información causal en narrativas de incidentes de construcción. La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF o DPO; tampoco describe mecanismos de decodificación especulativa ni atención lineal. La innovación diferencial no está en la arquitectura del clasificador, sino en el envoltorio de workflow: comprobaciones de hechos actuales, detección de conflictos, aplicación de límites de autoridad delegada y umbral de probabilidad (0,8 en los ejemplos) que determinan la ruta del caso antes o después de la clasificación.

## Capacidades

- Clasificación de narrativas históricas de incidentes de construcción en cuatro temáticas de revisión: integridad de equipos y controles, gestión y formación, práctica laboral y condición del lugar de trabajo.
- Salida de probabilidades por clase y de las salidas individuales de los tres componentes del ensemble, lo que permite inspeccionar el acuerdo entre modelos.
- Procesamiento de una narrativa histórica completa junto con un extracto de apoyo seleccionado por un humano.
- Capa de reglas que evalúa hechos actuales aportados, detecta información faltante o conflictiva y decide entre solicitar información, derivar a suscripción o continuar a revisión humana.
- Aplicación de límites de autoridad delegada (por ejemplo, un límite solicitado de 500.000 USD en el ejemplo) para enrutar a revisión de suscriptor sénior cuando se excede.
- Registro del workflow con la recomendación de enrutamiento y la marca de decisión final humana.
- Capacidad monolingüe: solo inglés.
- No incluye tool calling genérico, razonamiento multi-paso libre, visión, audio ni modo de pensamiento; es un clasificador especializado con lógica de negocio alrededor.

## Casos de uso

- Triaje de siniestros históricos en suscripción de construcción: el sistema clasifica la narrativa del incidente en una de las cuatro temáticas y permite a los equipos de suscripción priorizar qué evidencia revisar primero, con las probabilidades del ensemble como señal de confianza.
- Enrutamiento a equipos especializados: a partir de la temática detectada y de las reglas configuradas, el caso se dirige a revisión de controles de ingeniería, gestión de seguridad u otros equipos, reduciendo la manipulación manual del expediente.
- Detección de expedientes incompletos: cuando falta información de control actual o el extracto histórico de apoyo, el sistema solicita información y omite la clasificación, lo que evita decisiones sobre evidencia insuficiente.
- Gestión de conflictos documentales: si los hechos actuales aportados se contradicen entre sí, el flujo deriva a un suscriptor en lugar de clasificar, dejando constancia del motivo.
- Control de autoridad delegada: en solicitudes que superan el límite de autoridad configurado, el caso se escala a revisión de suscriptor sénior, integrándose en procesos de gobernanza interna.
- Auditoría y trazabilidad de decisiones: el registro estructurado de salidas (etiqueta, probabilidades, ruta, marca de decisión humana) sirve como evidencia documental en revisiones internas y auditorías de procesos de suscripción.
- Prototipado de asistentes de revisión para risk engineers: el paquete de ejemplo, con entradas y salidas grabadas, permite evaluar la integración del clasificador en herramientas internas antes de adaptarlo a taxonomías propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los ejemplos incluidos provienen de la partición de entrenamiento y no constituyen una prueba de precisión independiente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 3,07 GB de pesos almacenados y aproximadamente 1.540 millones de parámetros, la inferencia en FP16 requeriría del orden de 3 a 4 GB de memoria, y en FP32 alrededor de 6 GB, aunque estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no especificadas. Cualquier GPU con al menos 8 GB de VRAM debería acomodar el ensemble en precisión reducida; para lotes grandes o mayor throughput se recomiendan A100, H100 o RTX 4090.
- GPU de consumo: el sistema se ha validado en CPU, por lo que cabe en equipos sin GPU; en GPUs de consumo como RTX 3060, 4060 o superiores debería ejecutarse con holgura.
- Opciones de despliegue: inferencia nativa mediante `inference/predict.py` con Python 3.12; el modelo declara `inference: false` para el pipeline estándar de Hugging Face, por lo que vLLM, TGI u Ollama no están soportados de forma nativa sin adaptación.
- Latencia y throughput: no disponibles. El autor solo confirma ejecución en CPU y CUDA sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouli Underwrite Evidence | ~1,54B (ensemble) | No disponible | Clasificación de evidencia de siniestros de construcción en 4 temáticas | Apache-2.0 y MIT | Hugging Face, inferencia nativa |
| FacebookAI/roberta-large | 355M | 512 tokens | Clasificación y NLU general | MIT | Hugging Face, ecosistema estándar |
| jhu-clsp/ettin-encoder-1b | ~1B | No disponible en la información | Codificador general | No disponible en la información | Hugging Face |
| typestrict/TS-Ettin-150M | ~150M | No disponible en la información | Codificador ligero | No disponible en la información | Hugging Face |

La comparación directa con clasificadores genéricos no es del todo equivalente: Nouli Underwrite Evidence no es solo un modelo, sino un paquete de clasificación más reglas de workflow específicas del dominio asegurador. Frente a un RoBERTa-large ajustado de forma aislada, el ensemble ofrece mayor capacidad y diversidad de representación, a costa de un despliegue más complejo y de la dependencia de inferencia nativa.

## Limitaciones y advertencias

- Es un research preview: no acepta, rechaza, tarifica ni emite pólizas de seguro, y no sustituye la decisión de un suscriptor humano.
- Solo procesa inglés; cualquier narrativa en otro idioma queda fuera de su ámbito.
- Los ejemplos de la model card provienen de la partición de entrenamiento y no constituyen una evaluación independiente de precisión; no hay benchmarks publicados.
- Las reglas del workflow (umbral de 0,8, límites en USD, mapeo de equipos) son ilustrativas y no reflejan decisiones reales de aseguradoras.
- Riesgo de alucinación no evaluado formalmente; al ser un clasificador, el riesgo se traslada a etiquetas erróneas o sobreconfiadas, especialmente en narrativas ambiguas o fuera de la distribución de `lab-flair/constructcie`.
- Sesgos: no se documentan análisis de sesgo demográfico, geográfico o de tipo de obra; el dataset de entrenamiento puede sobrerrepresentar ciertos tipos de incidentes.
- La licencia combina Apache-2.0 y MIT con avisos de componentes adicionales en LICENSES.md; es imprescindible revisar esos avisos antes de un uso comercial, ya que los modelos base pueden tener condiciones propias.
- El pipeline estándar de Hugging Face no está soportado (`inference: false`), lo que limita la integración con servidores de inferencia convencionales y exige usar el script nativo.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados, lo que dificulta planificar despliegues con entradas largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nouli-ai/nouli-underwrite-evidence
- Sitio de Nouli AI: https://nouli.ai
- Licencias y avisos de componentes: https://huggingface.co/nouli-ai/nouli-underwrite-evidence/blob/main/LICENSES.md
- Dataset de entrenamiento: https://huggingface.co/datasets/lab-flair/constructcie
- Modelo base RoBERTa-large: https://huggingface.co/FacebookAI/roberta-large
- Modelo base TS-Ettin-150M: https://huggingface.co/typestrict/TS-Ettin-150M
- Modelo base Ettin encoder 1B: https://huggingface.co/jhu-clsp/ettin-encoder-1b
