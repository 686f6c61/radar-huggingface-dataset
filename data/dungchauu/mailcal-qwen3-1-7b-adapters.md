# Dungchauu/mailcal-qwen3-1.7b-adapters

## Resumen

MailCal Qwen3 1.7B Adapters es un conjunto de cuatro adaptadores LoRA modulares publicados por el usuario Dungchauu sobre el modelo base Qwen/Qwen3-1.7B. Cada adaptador resuelve una tarea concreta dentro de un flujo de reclutamiento automatizado: extracción estructurada de currículos (cv-extract), emparejamiento criterio a criterio entre currículo y oferta de empleo (cv-job-match), segmentación y comprensión de hilos de correo con extracción de intenciones y fechas relativas (email-understand) y redacción segura de correos de reclutamiento en vietnamita e inglés (email-draft).

El paquete está pensado para cargarse sobre una única instancia del modelo base y alternar entre adaptadores en caliente (hot-swap inferior a 1 ms según la model card), lo que reduce el coste de servir cuatro tareas distintas con un solo conjunto de pesos base. Los adaptadores se distribuyen en formato PEFT/safetensors, ocupan unos 35 MB cada uno (~140 MB en total) y están anclados a una revisión concreta del modelo base para garantizar reproducibilidad.

La relevancia actual radica en su enfoque de "multi-LoRA" para producción: contratos de esquema versionados (recruit-contracts-v2, versión 2.0.0), checksums SHA-256 por adaptador y salvaguardas explícitas en la generación de correos (lista blanca de URL, prohibición de inventar fechas). Es un ejemplo de adaptación eficiente en parámetros (PEFT) orientada a una vertical de negocio muy específica, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3 (modelo base Qwen/Qwen3-1.7B) |
| Parametros totales | 1.700 millones en el modelo base; adaptadores de ~35 MB cada uno (parámetros entrenables no especificados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | vietnamita (vi) e inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base Qwen/Qwen3-1.7B en revisión 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino cuatro adaptadores LoRA independientes que se aplican sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. Cada adaptador se entrena (o se publica) para una tarea de reclutamiento diferenciada y se identifica mediante un Task ID y una versión: `recruit.cv-extract` (V2), `recruit.cv-job-match` (V2), `recruit.email-understand` (V1) y `recruit.email-draft` (V2). Todos comparten el mismo contrato de esquema, `recruit-contracts-v2` en versión 2.0.0, lo que facilita la interoperabilidad entre tareas dentro de un mismo pipeline.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documentan decisiones de diseño orientadas a la fiabilidad en producción: evidencia textual literal (verbatim evidence spans) en la extracción de CV, evidencia bidireccional en el emparejamiento CV-JD, segmentación de hilos con once intenciones de reclutamiento y extracción de tiempos relativos, y salvaguardas en la redacción de correos (lista blanca de URL y prohibición de fechas inventadas). El repositorio incluye checksums SHA-256 por adaptador para verificar la integridad de los pesos.

## Capacidades

- Extracción estructurada de currículos con spans de evidencia literales (cv-extract).
- Emparejamiento criterio a criterio entre currículo y descripción de puesto, con evidencia en ambas direcciones (cv-job-match).
- Segmentación de hilos de correo electrónico e identificación de once intenciones de reclutamiento, incluida la extracción de fechas y tiempos relativos (email-understand).
- Redacción de correos de reclutamiento en vietnamita e inglés con restricciones de seguridad: lista blanca de URL y ausencia de fechas alucinadas (email-draft).
- Salida estructurada (structured-output) orientada a contratos de esquema versionados.
- Carga multi-LoRA sobre un único modelo base con cambio de adaptador en caliente (< 1 ms según la model card).
- Capacidades multilingües limitadas a vietnamita e inglés.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Triaje automatizado de candidaturas: el adaptador email-understand segmenta hilos de correo entrante, clasifica la intención (once categorías de reclutamiento) y extrae fechas relativas, lo que permite enrutar cada mensaje al flujo adecuado sin intervención manual.
- Parsing de currículos a base de datos: cv-extract convierte CV en texto libre a un esquema estructurado con spans de evidencia, de modo que cada campo extraído puede auditarse contra el texto original antes de persistirlo.
- Puntuación de encaje candidato-puesto: cv-job-match evalúa criterio a criterio la adecuación entre un CV y una oferta, aportando evidencia bidireccional que un revisor humano puede verificar, lo que resulta útil en procesos de selección con requisitos legales de justificación.
- Generación de respuestas a candidatos: email-draft redacta correos de reclutamiento en vietnamita o inglés con lista blanca de URL y sin fechas inventadas, reduciendo el riesgo de comunicaciones erróneas en procesos masivos.
- Servicio multi-tarea con un solo modelo base: al cargar los cuatro adaptadores sobre una instancia de Qwen3-1.7B y alternar en caliente, un equipo puede servir las cuatro tareas con una única GPU y un solo proceso, simplificando el despliegue.
- Integración en un agente de reclutamiento: el repositorio GitHub asociado (MailCal-AI-Agent) incluye scripts de descarga y un servidor multi-LoRA, lo que permite montar un agente completo que encadene comprensión de correo, extracción de CV, emparejamiento y redacción.
- Verificación de integridad en CI: los checksums SHA-256 publicados por adaptador permiten validar en pipelines de integración continua que los pesos desplegados coinciden con los auditados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo base Qwen3-1.7B en precisión fp16 requiere aproximadamente 3,4 GB de VRAM solo para los pesos; los cuatro adaptadores suman unos 140 MB adicionales.
- En cuantización de 8 bits el modelo base se sitúa en torno a 1,7-2 GB de VRAM; en 4 bits, alrededor de 1 GB (estimaciones para el modelo base, no verificadas en la información proporcionada).
- Cabe en GPU de consumo: una RTX 4090, RTX 3090 o incluso tarjetas con 8 GB de VRAM pueden alojar el modelo base en fp16 junto con los adaptadores.
- Para servir las cuatro tareas simultáneamente se recomienda una GPU con al menos 8-12 GB de VRAM si se mantiene el modelo base en fp16 y se alternan adaptadores en caliente.
- Opciones de despliegue: transformers + peft (documentado en la model card), servidor multi-LoRA propio del proyecto MailCal (mailcal_server.py) y, previsiblemente, vLLM con soporte multi-LoRA; llama.cpp y Ollama requerirían conversión de los adaptadores a GGUF, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo indica un hot-swap de adaptador inferior a 1 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MailCal Qwen3 1.7B Adapters | 1,7 B (base) + 4 LoRA | no disponible | vi, en | no disponible | Cuatro adaptadores LoRA especializados en reclutamiento |
| Qwen/Qwen3-1.7B | 1,7 B | no disponible en esta ficha | multilingüe | no disponible en esta ficha | Modelo base de propósito general |
| Adaptadores LoRA verticales (genéricos) | variable | depende del base | variable | variable | Especialización de una sola tarea por adaptador |

La comparación con alternativas concretas no está disponible en la información proporcionada; los datos de la fila Qwen3-1.7B y de la fila genérica de LoRA verticales no se han verificado en las fuentes consultadas.

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible; no puede confirmarse el uso comercial sin consultar al autor o al repositorio.
- El modelo está especializado exclusivamente en tareas de reclutamiento; su rendimiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- Solo cubre vietnamita e inglés; no hay soporte declarado para castellano ni otros idiomas.
- No se documentan sesgos conocidos, pero al operar sobre CV y ofertas de empleo existe riesgo de sesgo en la evaluación de candidatos; se recomienda supervisión humana en decisiones de selección.
- Riesgo de alucinación mitigado parcialmente en email-draft (lista blanca de URL, sin fechas inventadas) y en cv-extract (spans de evidencia), pero no cuantificado con benchmarks.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni validación externa.
- Los adaptadores están anclados a una revisión concreta del modelo base (70d244cc86ccca08cf5af4e1e306ecf908b1ad5e); usar otra revisión puede degradar el comportamiento.
- No se detallan los hiperparámetros de entrenamiento (rango LoRA, alpha, dataset), lo que dificulta reproducir o auditar el ajuste.
- El tamaño del repositorio es de 0,1 GB, coherente con adaptadores pequeños, pero no se especifica el número de parámetros entrenables por adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/Dungchauu/mailcal-qwen3-1.7b-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio GitHub del proyecto: https://github.com/DungChau523/MailCal-AI-Agent (rama `AI`)
- Paper, blog o demo: no disponibles en la información proporcionada.
