# flowxai/injection

## Resumen

El modelo `flowxai/injection` es un detector de inyección de prompts (directa, indirecta y jailbreak) desarrollado por flowxai como parte de la librería `border`, un sistema de guardrails embebible que inspecciona el texto que entra y sale de un LLM y devuelve una decisión estructurada junto con un registro de evidencia auditable. No es un clasificador de inyección de propósito general: está entrenado específicamente para la política de esta librería y debe leerse en el punto de operación calibrado (umbral 0.19), no en el valor por defecto de 0.5.

El modelo se basa en `FacebookAI/xlm-roberta-base` con una cabeza de clasificación multi-etiqueta que produce tres etiquetas: `direct_injection`, `indirect_injection` y `jailbreak`. El artefacto publicado es un modelo ONNX en INT8 de 535 MB (opset 17) en el que solo se cuantiza la tabla de embeddings, una decisión de diseño que mantiene el drift de logits en 0.0036 y no cambia ninguna decisión en 300 textos de prueba. Está entrenado con una ventana de 96 tokens y soporta 26 idiomas europeos. Su relevancia actual radica en la necesidad creciente de proteger aplicaciones basadas en LLM contra ataques de inyección, ofreciendo una solución ligera que corre en CPU con un presupuesto de 225 ms por 87 tokens en un solo hilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (encoder transformer) con cabeza de clasificación multi-etiqueta |
| Parametros totales | no disponible (basado en XLM-RoBERTa base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | INT8 (solo tabla de embeddings, Gather only) |
| Idiomas soportados | 26: az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.int8.onnx), tokenizer.json |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer multilingüe con 12 capas, y le añade una cabeza de clasificación multi-etiqueta con tres salidas: `direct_injection`, `indirect_injection` y `jailbreak`. El entrenamiento se realizó específicamente para la política de la librería `border`, no como un clasificador genérico, y se exportó a ONNX con opset 17. La cuantización se aplicó únicamente a la tabla de embeddings (operación Gather), evitando cuantizar los MatMul del encoder porque esa práctica degrada el rendimiento: en una prueba con 300 textos reales, cuantizar todas las operaciones produjo un drift medio de logits de 0.68 y cambió 51 decisiones, mientras que la cuantización solo de embeddings logró un drift de 0.0036 y cero decisiones cambiadas. El modelo se entrenó con una longitud de secuencia de 96 tokens. No se especifican el dataset utilizado ni el método de entrenamiento (p. ej., fine-tuning supervisado, RLHF, etc.).

## Capacidades

- Detección de inyección directa de prompts (intentos de manipular al LLM mediante instrucciones maliciosas en la entrada del usuario).
- Detección de inyección indirecta (contenido malicioso incrustado en documentos, webs o resultados de herramientas que se pasan al modelo).
- Detección de jailbreak (técnicas para evadir restricciones de seguridad o políticas del modelo).
- Soporte multilingüe en 26 idiomas europeos, con rendimiento variable según la lengua (ver benchmarks).
- Integración nativa con la librería `border`: devuelve una decisión estructurada (`allow`, `flag`, `redact`, `block`) y un registro de evidencia con hashes, sin necesidad de red tras la carga inicial de pesos.
- Funciona como guardrail de entrada (input side) y se puede deshabilitar por política.
- No es un modelo generativo: es un clasificador de texto especializado.

## Casos de uso

- Protección de chatbots y asistentes virtuales: analizar el texto de entrada del usuario antes de pasarlo al LLM para bloquear o señalar intentos de inyección directa o jailbreak.
- Moderación de contenido en aplicaciones que procesan documentos externos: detectar inyección indirecta en archivos, URLs o resultados de búsqueda que se incorporan al contexto del modelo.
- Seguridad en agentes autónomos: prevenir que instrucciones maliciosas en herramientas, APIs o bases de conocimiento desvíen el comportamiento del agente hacia acciones no deseadas.
- Cumplimiento de políticas de seguridad en despliegues empresariales de LLM: integrar el detector en el pipeline de entrada para auditar y registrar intentos de ataque con evidencia (hashes, decisiones).
- Filtrado en pipelines de RAG (retrieval-augmented generation): inspeccionar los fragmentos recuperados antes de pasarlos al generador para evitar que contenido inyectado contamine la respuesta.
- Evaluación de robustez en entornos de pruebas de seguridad: usar el detector como herramienta de validación para medir la resistencia de aplicaciones LLM frente a ataques de inyección.

## Benchmarks y rendimiento

El rendimiento se reporta por idioma, no como agregado, porque un promedio sobre 26 lenguas oculta la cola de rendimiento. La siguiente tabla muestra precisión (P), recall (R) y F1 por idioma, evaluados en el punto de operación calibrado (umbral 0.19):

| Idioma | Soporte | P | R | F1 |
|---|---|---|---|---|
| bg (búlgaro) | 13 | 1.000 | 1.000 | 1.000 |
| el (griego) | 14 | 1.000 | 1.000 | 1.000 |
| es (español) | 12 | 1.000 | 1.000 | 1.000 |
| ga (irlandés) | 14 | 1.000 | 1.000 | 1.000 |
| hr (croata) | 13 | 1.000 | 1.000 | 1.000 |
| hu (húngaro) | 14 | 1.000 | 1.000 | 1.000 |
| it (italiano) | 14 | 1.000 | 1.000 | 1.000 |
| lt (lituano) | 13 | 1.000 | 1.000 | 1.000 |
| lv (letón) | 14 | 1.000 | 1.000 | 1.000 |
| nl (neerlandés) | 14 | 1.000 | 1.000 | 1.000 |
| pl (polaco) | 14 | 1.000 | 1.000 | 1.000 |
| sl (esloveno) | 14 | 1.000 | 1.000 | 1.000 |
| sv (sueco) | 14 | 1.000 | 1.000 | 1.000 |
| da (danés) | 14 | 0.933 | 1.000 | 0.966 |
| de (alemán) | 14 | 0.933 | 1.000 | 0.966 |
| en (inglés) | 14 | 0.933 | 1.000 | 0.966 |
| et (estonio) | 14 | 0.933 | 1.000 | 0.966 |
| fi (finés) | 14 | 0.933 | 1.000 | 0.966 |
| ro (rumano) | 14 | 0.933 | 1.000 | 0.966 |
| tr (turco) | 14 | 0.933 | 1.000 | 0.966 |
| az (azerí) | 14 | 1.000 | 0.929 | 0.963 |
| sk (eslovaco) | 14 | 1.000 | 0.929 | 0.963 |
| cs (checo) | 13 | 1.000 | 0.923 | 0.960 |
| pt (portugués) | 14 | 0.875 | 1.000 | 0.933 |
| fr (francés) | 13 | 0.923 | 0.923 | 0.923 |
| mt (maltés) | 14 | 1.000 | 0.571 | 0.727 |

Además, el modelo reporta una métrica global (probablemente F1 agregada) de 0.938 con el umbral por defecto de 0.5 y 0.961 con el umbral calibrado de 0.19. La tabla de cuantización muestra que la receta publicada (solo embeddings) no altera ninguna decisión, mientras que cuantizar todas las operaciones cambia 51 de 300 decisiones.

## Requisitos de hardware

- Inferencia en CPU: presupuesto de 225 ms por 87 tokens en un solo hilo de CPU, lo que permite su uso en entornos sin GPU.
- Tamaño del modelo: 535 MB (artefacto ONNX INT8), cabe en memoria RAM de cualquier máquina moderna.
- GPU: no es necesaria; si se usa, puede acelerar el procesamiento por lotes, pero no es un requisito.
- Despliegue: mediante ONNX Runtime directamente, o a través de la librería `flowx-border` que gestiona la carga de pesos, el umbral y el chunking.
- No requiere conexión a red tras la descarga inicial de los pesos; los pesos se cachean localmente.

## Comparativa con modelos similares

No se dispone de información comparativa con otros detectores de inyección de prompts en la documentación proporcionada. El modelo está diseñado específicamente para la política de la librería `border`, por lo que una comparación directa con clasificadores de propósito general (p. ej., Llama Guard, DetectLLM) requeriría datos de evaluación adicionales que no están disponibles en esta ficha.

## Limitaciones y advertencias

- No es un clasificador de inyección general: está entrenado para la política concreta de `border` y puede no transferir bien a otros contextos o definiciones de inyección.
- El umbral de decisión debe fijarse en 0.19; usar 0.5 (el valor por defecto típico) produce F1 0.000 en varios idiomas de esta familia de detectores, como se documenta en la model card.
- La ventana de entrenamiento es de 96 tokens; entradas más largas deben dividirse en fragmentos y recombinarse, y las puntuaciones más allá de esa longitud son extrapolación no fiable.
- Idiomas con rendimiento débil: maltés (F1 0.727, ausente en el pretraining de XLM-R), francés (0.923) y portugués (0.933). El maltés es una limitación del modelo base, no del detector.
- Solo cubre 26 idiomas europeos; no soporta lenguas fuera de ese conjunto.
- La cuantización completa del modelo (todas las operaciones) degrada significativamente el rendimiento (51/300 decisiones cambiadas); solo la cuantización de embeddings publicada es segura.
- No se documentan sesgos específicos ni riesgos de alucinación (al ser un clasificador, no genera texto), pero su precisión varía por idioma y podría fallar en entradas muy cortas o muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flowxai/injection
- Repositorio de la librería border: https://github.com/flowx-ai/border
