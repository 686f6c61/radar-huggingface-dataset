# inclusionAI/LingSante-3.1-flash

## Resumen

LingSante-3.1-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con pesos abiertos desarrollado por inclusionAI, orientado a razonamiento médico complejo, comunicación sanitaria profesional, investigación basada en evidencia y ejecución de tareas médicas de largo horizonte. Se construye sobre Ling-3.1-flash y conserva su arquitectura híbrida linear-MoE, con 560 mil millones de parámetros totales, 25 mil millones activados por token y una ventana de contexto de 1 millón de tokens. El repositorio de Hugging Face, con pesos en safetensors y fp8, ocupa 573,8 GB.

El modelo aborda un problema específico: las tareas médicas reales no se resuelven solo con inteligencia general, sino que exigen manejar información incompleta, heterogeneidad de pacientes y requisitos estrictos de cumplimiento y seguridad. Para ello, LingSante-3.1-flash se entrena con una mezcla nativa de datos médicos y generales a lo largo de preentrenamiento, mid-training y ajuste supervisado, complementada con aprendizaje por refuerzo específico de tarea y destilación on-policy multi-profesor.

Es relevante ahora porque combina un contexto extremadamente largo con capacidades de uso de herramientas y razonamiento multi-paso en un dominio regulado. El autor lo posiciona explícitamente como material de investigación y evaluación, no como dispositivo médico, y prohíbe su uso como base independiente para diagnóstico, prescripción o tratamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (KDA + Gated MLA) |
| Parametros totales | 560B (572.120.680.768 según safetensors) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | fp8 (pesos publicados); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, bailing_hybrid) |

Otros datos de arquitectura recogidos en la model card: 63 capas KDA + 9 capas Gated MLA en proporción 7:1, 4 capas densas, 512 expertos enrutados y 1 experto compartido, 8 expertos enrutados activados por token, 64 cabezas de atención, hidden size de 4096, tamaño intermedio de experto de 1280, tamaño intermedio denso de 10240 y vocabulario de 157.184 tokens.

## Arquitectura y entrenamiento

LingSante-3.1-flash hereda la arquitectura de Ling-3.1-flash: un transformer MoE híbrido que combina capas de atención linear KDA con capas de Gated MLA en una proporción 7:1 (63 capas KDA frente a 9 Gated MLA), más 4 capas densas. El enrutamiento activa 8 de los 512 expertos enrutados por token, junto con un experto compartido, lo que permite un ratio de activación muy bajo (25B sobre 560B) y, en teoría, un coste de inferencia contenido para el tamaño total del modelo. La ventana de 1M tokens se apoya en ese diseño híbrido de atención.

El entrenamiento combina datos médicos y generales en todas las fases: preentrenamiento con mezcla médica nativa, mid-training, ajuste supervisado, aprendizaje por refuerzo específico para razonamiento médico, uso de herramientas, búsqueda y comportamiento profesional, y finalmente destilación on-policy multi-profesor para consolidar capacidades complementarias en un único modelo. El autor menciona marcos propios de alineación evidencia-razonamiento, de tareas médicas de largo horizonte (entornos interactivos, uso de herramientas y verificación estructurada) y de alineación de comportamiento profesional. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Razonamiento médico complejo: identificación de factores clave en decisiones clínicas, validación de evidencia de soporte y resolución de conflictos entre fuentes.
- Comportamiento profesional sanitario: respuestas contextualizadas, profesionales y accionables ante información incompleta o cambiante.
- Tareas médicas de largo horizonte: ejecución de flujos multi-etapa con coordinación de herramientas e información dentro de un mismo workflow.
- Uso de herramientas y búsqueda: entrenado con RL específico para tool use y search, con verificación de evidencia.
- Razonamiento multi-paso y planificación adaptativa ante información nueva.
- Capacidades generales preservadas por la mezcla de datos: razonamiento, código, búsqueda y uso de herramientas.
- Contexto largo de 1M tokens para historiales, documentación y literatura científica extensa.
- Generación de texto conversacional (pipeline text-generation).
- Idiomas soportados: no disponible.

## Casos de uso

- Revisión de literatura médica a gran escala: ingerir decenas de artículos y guías clínicas en una sola ventana de 1M tokens para extraer evidencia, detectar contradicciones entre fuentes y sintetizar conclusiones con trazabilidad.
- Apoyo a la documentación clínica: resumir historiales electrónicos extensos y generar borradores de informes estructurados, manteniendo el contexto completo del paciente en una única pasada.
- Investigación traslacional y farmacológica: cruzar resultados preclínicos, datos de ensayos y literatura regulatoria para generar hipótesis verificables, aprovechando el razonamiento basado en evidencia.
- Asistentes de formación médica: simular casos clínicos multi-turno con información progresivamente revelada, evaluando la capacidad de razonamiento diferencial del estudiante.
- Automatización de flujos administrativos sanitarios: orquestar tool calling sobre sistemas de gestión (citas, codificación, reclamaciones) en pipelines multi-paso con verificación intermedia.
- Evaluación de seguridad y alineación clínica: usar el modelo como sujeto de pruebas en entornos simulados para medir comportamiento profesional ante información incompleta o conflictiva.
- Búsqueda aumentada en bases de conocimiento biomédico: integrar el modelo como motor de razonamiento sobre índices documentales, con verificación de evidencia antes de emitir una respuesta.

## Benchmarks y rendimiento

La model card indica que el modelo obtiene "leading performance among open-source models" en razonamiento médico complejo y que queda "second overall behind only GPT-6 Astra" en benchmarks de comportamiento profesional médico, además de buenos resultados en evaluaciones internas de comprensión diagnóstica, seguridad y razonamiento basado en evidencia. Sin embargo, no se proporcionan cifras concretas, nombres de benchmarks ni tablas numéricas en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados en fp8 ocupan aproximadamente 573,8 GB, por lo que la inferencia requiere al menos ese volumen de memoria, más overhead de activaciones y KV cache.
- GPU recomendadas: nodos multi-GPU de clase H100 (80 GB) o H200; con 8×H100 80 GB (640 GB) se cubren los pesos en fp8 con margen limitado para caché; configuraciones de 16 GPUs ofrecen holgura para contexto largo.
- No cabe en GPU de consumo: ni RTX 4090 (24 GB) ni RTX 5090 pueden alojar los pesos; se requeriría cuantización agresiva adicional no publicada y, aun así, el tamaño total lo hace inviable en una sola tarjeta consumer.
- Opciones de despliegue: el repositorio usa `custom_code` con arquitectura `bailing_hybrid`, por lo que requiere transformers con `trust_remote_code=True` o un runtime compatible con dicha arquitectura; vLLM, TGI o llama.cpp solo serían utilizables si soportan la arquitectura híbrida KDA/MLA, extremo no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LingSante-3.1-flash | 560B / 25B | 1M | MIT | Especializado en dominio médico; sin cifras de benchmarks publicadas |
| Ling-3.1-flash | no disponible en la informacion | no disponible | no disponible | Modelo base sobre el que se construye LingSante; arquitectura idéntica |
| GPT-6 Astra | no disponible | no disponible | propietaria | Referencia citada por el autor como líder en comportamiento profesional médico |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas open-weight de la misma categoría médica.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor prohíbe explícitamente su uso como base independiente para diagnóstico, prescripción o tratamiento; está destinado a investigación y evaluación.
- Riesgo de alucinación en un dominio de alto impacto: las respuestas pueden contener afirmaciones clínicamente incorrectas pese al entrenamiento en verificación de evidencia; requiere supervisión experta.
- Sesgos potenciales derivados de los datos de entrenamiento médicos y generales, cuya composición no se detalla.
- Idiomas soportados no especificados: el rendimiento fuera del inglés (presumiblemente el idioma principal de entrenamiento) es desconocido.
- Licencia MIT: permite uso comercial, pero dicha permisividad no exime del cumplimiento de la normativa sanitaria aplicable (MDR, FDA, RGPD) ni de las advertencias del autor.
- Requisitos de hardware muy elevados (≈574 GB en fp8), lo que limita su despliegue a infraestructura de centro de datos.
- Soporte de runtimes de inferencia no confirmado para la arquitectura híbrida KDA/MLA; la integración en producción puede requerir código personalizado.
- Ausencia de cifras de benchmarks verificables en la información disponible, lo que impide una evaluación cuantitativa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/LingSante-3.1-flash
- ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash
- Vercel AI Gateway: https://vercel.com/ai-gateway/models/LingSante-3.1-flash
- Modelo base Ling-3.1-flash: https://huggingface.co/inclusionAI/Ling-3.1-flash
