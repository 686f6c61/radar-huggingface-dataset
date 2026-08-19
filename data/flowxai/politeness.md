# flowxai/politeness

## Resumen

`flowxai/politeness` es un clasificador de cortesía multilingüe desarrollado por FlowX AI como parte de su librería embebible `border`, un sistema de guardrails que inspecciona el texto que entra y sale de un modelo de lenguaje y devuelve una decisión estructurada junto con un registro de evidencia auditable. El modelo está basado en `FacebookAI/xlm-roberta-base` y se ha entrenado específicamente para la política de la librería, no como un clasificador general de cortesía. Su salida es un artefacto ONNX cuantizado a INT8 de 535 MB, con una ventana de entrenamiento de 96 tokens y un umbral operativo calibrado en 0.89.

La relevancia actual de este modelo reside en que aborda un problema crítico en producción: la moderación de salidas de LLM en múltiples idiomas. A diferencia de otros clasificadores de toxicidad, este detector está diseñado para integrarse en un pipeline de guardrails con decisiones accionables (`allow`, `flag`, `redact`, `block`) y evidencia criptográfica, sin depender de llamadas a modelos alojados. Soporta 26 idiomas europeos y asiáticos, con un rendimiento que varía notablemente entre lenguas, lo que lo convierte en una opción interesante para equipos que necesitan control de calidad en despliegues multilingües.

El modelo se distribuye bajo licencia Apache 2.0 y su artefacto es un archivo ONNX estándar, lo que permite cargarlo directamente con `onnxruntime` o a través de la librería `border`. Aunque no es un modelo generativo ni de razonamiento, su papel como componente de seguridad en sistemas de IA generativa lo hace relevante para desarrolladores que buscan soluciones de moderación ligeras y auditables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (transformer encoder) con head de clasificación multi-etiqueta |
| Parametros totales | no disponible (basado en xlm-roberta-base, ~278M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | INT8 (solo tabla de embeddings; el artefacto publicado es `model.int8.onnx`) |
| Idiomas soportados | 26: az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), safetensors no publicado |

## Arquitectura y entrenamiento

El modelo se basa en el encoder transformer XLM-RoBERTa-base, una variante multilingüe de RoBERTa entrenada con 2.5 TB de datos filtrados de CommonCrawl en 100 idiomas. Sobre este cuerpo se añade una cabeza de clasificación multi-etiqueta que produce una única etiqueta binaria (`impolite`). El entrenamiento se realizó específicamente para la política de la librería `border`, con una ventana de 96 tokens. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni si se emplearon técnicas como RLHF o DPO; la información disponible indica únicamente que el modelo fue entrenado para esta tarea concreta y que el umbral de decisión (0.89) se calibró sobre la partición de validación optimizando `macro_f1`.

La innovación técnica destacable no está en la arquitectura (que es estándar) sino en el proceso de cuantización. El artefacto publicado cuantiza únicamente la tabla de embeddings, no todas las operaciones. Según las mediciones del autor, cuantizar todos los ops (el enfoque habitual) produce una deriva de logits media de 0.68 y cambia 51 de 300 decisiones, mientras que cuantizar solo el `Gather` mantiene la deriva en 0.0036 y no altera ninguna decisión, reduciendo el tamaño de 856 MB a 535 MB. Esta decisión de diseño evita los problemas de outliers de activación que presenta XLM-RoBERTa.

## Capacidades

- Clasificación binaria de cortesía: detecta si un texto es `impolite` (descortés) en 26 idiomas.
- Integración con guardrails: diseñado para usarse con la librería `border`, devuelve una decisión (`allow`, `flag`, `redact`, `block`) y un registro de evidencia con hashes, sin exponer el texto.
- Funcionamiento offline: los pesos se descargan una vez y se cachean; la inferencia no requiere conexión de red.
- Compatibilidad ONNX: el artefacto se puede cargar directamente con `onnxruntime`, sin depender de `border`.
- Multilingüe: cubre lenguas europeas mayoritarias y minoritarias (incluye ga, mt, lv, et, entre otras).
- Rendimiento en CPU: presupuesto de 225 ms por scan a 87 tokens en un solo hilo.
- No es un modelo generativo: no genera texto, solo clasifica.

## Casos de uso

- Moderación de salidas de LLM en producción: integrar `politeness` como detector en el pipeline de `border` para bloquear o marcar respuestas descorteses antes de enviarlas al usuario. Su decisión estructurada permite aplicar políticas de redacción o bloqueo automático.
- Guardrails para asistentes virtuales multilingües: un chatbot de atención al cliente que opera en varios idiomas puede usar este detector para garantizar que las respuestas mantengan un tono profesional, especialmente en lenguas con pocos recursos como el irlandés o el maltés, donde otros modelos fallan.
- Auditoría de calidad de respuestas: el registro de evidencia con hashes permite auditar qué textos fueron marcados y por qué, útil para cumplimiento normativo o revisión manual.
- Filtrado de contenido generado por IA en plataformas sociales: detectar mensajes descorteses en comentarios o publicaciones generadas automáticamente, con la posibilidad de redactarlos antes de su publicación.
- Evaluación de prompts de entrada: aunque el detector está pensado para la salida, puede adaptarse para inspeccionar prompts y evitar que usuarios envíen instrucciones hostiles al modelo.
- Despliegue en entornos con recursos limitados: al ser un modelo pequeño (535 MB INT8) y correr en CPU, es viable en edge devices o contenedores sin GPU, manteniendo latencias aceptables.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar como MMLU o HumanEval, ya que no es un modelo generativo. En su lugar, se reportan métricas de precisión, recall y F1 por idioma, medidas sobre una partición de validación con 15-16 ejemplos por lengua. Los resultados agregados son:

- F1 con umbral 0.5: 0.954
- F1 con umbral calibrado 0.89: 0.956

La tabla por idioma (extraída de la model card) muestra:

| Idioma | Soporte | P | R | F1 |
|---|---|---|---|---|
| bg, cs, de, en, et, fi, fr, it, sv | 15 | 1.000 | 1.000 | 1.000 |
| lt | 16 | 0.941 | 1.000 | 0.970 |
| az, da, el, hu, pl, ro, sl, tr | 15-16 | 0.938-1.000 | 1.000-0.938 | 0.968 |
| es, sk | 15 | 1.000-1.000 | 0.933 | 0.966 |
| lv | 15 | 0.882 | 1.000 | 0.938 |
| nl, pt | 15 | 0.933 | 0.933 | 0.933 |
| hr | 15 | 0.833 | 1.000 | 0.909 |
| mt | 15 | 0.867 | 0.867 | 0.867 |
| ga | 15 | 0.722 | 0.867 | 0.788 |

No se han publicado resultados de benchmarks comparativos con otros modelos de detección de cortesía.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo corre en CPU. El artefacto INT8 pesa 535 MB, por lo que cabría en la memoria de cualquier GPU consumer (p.ej. RTX 3060 con 12 GB) si se desea acelerar, pero no es necesario.
- GPU recomendadas: ninguna en particular; si se usa GPU, cualquier modelo con al menos 2 GB de VRAM es suficiente.
- Compatibilidad con consumer GPU: sí, el modelo es pequeño y puede ejecutarse en tarjetas de gama baja.
- Opciones de despliegue: `onnxruntime` (CPU/GPU), `text-embeddings-inference` (según tags del repo), o la librería `border` que lo integra.
- Latencia: 225 ms por scan a 87 tokens en un solo hilo de CPU. El throughput depende del hardware, pero es adecuado para uso en tiempo real en servicios de moderación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen clasificadores de toxicidad como `unitary/toxic-bert` o `facebook/roberta-hate-speech-dynabench-r4-target`, pero no son multilingües ni están optimizados para guardrails con evidencia. Dado que `politeness` está especializado en la política de `border` y en 26 idiomas, una comparación directa requeriría evaluar estos modelos en los mismos datos, lo cual no se ha publicado. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No es un clasificador general de cortesía: fue entrenado exclusivamente para la política de la librería `border`, por lo que su comportamiento fuera de ese contexto puede ser impredecible.
- Umbral calibrado: el valor 0.89 es crítico; usar el umbral por defecto de 0.5 produce resultados subóptimos (F1 0.954 vs 0.956, pero con riesgo de decisiones erróneas en algunos idiomas).
- Ventana de contexto limitada: 96 tokens; textos más largos deben dividirse y recombinarse manualmente, ya que el modelo no maneja ventanas superiores.
- Idiomas débiles: el irlandés (ga) tiene F1 0.788 y el maltés (mt) 0.867; el maltés no estaba en el preentrenamiento de XLM-R, lo que limita su fiabilidad.
- Sesgo potencial: al estar basado en XLM-RoBERTa, puede heredar sesgos de los datos de preentrenamiento (CommonCrawl), aunque no se han documentado evaluaciones específicas de sesgo.
- Riesgo de alucinación: no aplica, al ser un clasificador y no un generador.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo está pensado para usarse con la librería `border`, que puede tener sus propios términos.
- Dependencia de la librería: para obtener decisiones y evidencia estructurada es necesario usar `border`; usarlo directamente con ONNX requiere implementar el umbral y el chunking manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flowxai/politeness
- Repositorio de la librería `border`: https://github.com/flowx-ai/border
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base
