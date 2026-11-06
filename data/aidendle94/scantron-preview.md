# aidendle94/Scantron-Preview

## Resumen

Scantron Preview es un modelo de decisión para acciones de agentes, desarrollado por aidendle94 y publicado en Hugging Face como checkpoint de investigación. No es un modelo generativo al uso: recibe un estado JSON que describe una acción propuesta por un agente (un comando de shell, una llamada a herramienta, una escritura de fichero) junto con la petición del usuario y el contexto recuperado, y devuelve en un único forward pass respuestas tipadas con probabilidades a un conjunto fijo de preguntas de seguridad, sin generar tokens.

El modelo es un fine-tune completo de LiquidAI/d1-2B, un backbone LFM3 de 24 capas que combina convoluciones cortas con puerta, atención de ventana deslizante y atención global. Con 2.180.325.888 parámetros reales según los pesos safetensors y una longitud de contexto de 128K tokens (entrenado y evaluado con estados de hasta 8K), está pensado para el paso de aprobación de agentes de código y operaciones: puntuar un comando antes de ejecutarlo, decidir si requiere revisión humana y detectar si una instrucción inyectada en contenido no fiable está dirigiendo la acción.

Su relevancia actual radica en el enfoque: sustituye la generación de texto por una cabeza de clasificación calibrada que responde a 16 preguntas en una sola llamada, con latencia de milisegundos. Es un lanzamiento de investigación, todavía en entrenamiento, y el propio autor advierte que no debe usarse como control de seguridad en producción. La versión 2 (2026-11-04) modifica únicamente la cabeza de salida con tres direcciones de lectura en lugar de una.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3, 24 capas: 13 convoluciones cortas con puerta, 5 de atención de ventana deslizante, 6 de atención global |
| Parametros totales | 2.180.325.888 (1,92B según model card; la cabeza de salida está desacoplada de los embeddings de entrada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens; entrenado y evaluado con estados de hasta 8K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (estados en inglés; comandos y código tal como aparecen) |
| Licencia | LFM Open License v1.0 (heredada de d1-2B) |
| Formato de pesos | safetensors, con código de modelo personalizado (`custom_code`) para Transformers |

## Arquitectura y entrenamiento

El backbone es LFM3, una arquitectura híbrida de 24 capas que alterna 13 convoluciones cortas con puerta, 5 capas de atención de ventana deslizante y 6 capas de atención global. Esta combinación busca eficiencia en secuencias largas manteniendo capacidad de atención global puntual. El checkpoint es un fine-tune completo de d1-2B sobre datos de seguridad de acciones de agentes, seguido de una edición de la cabeza de salida de 10.240 pesos. La cabeza está desacoplada de los embeddings de entrada, lo que explica que el fichero sea 0,26B más grande que el de d1-2B.

La innovación principal no está en el backbone sino en la interfaz: el modelo no genera tokens, sino que responde a un conjunto fijo de 16 preguntas definidas en `questions.json` mediante clasificación con probabilidades calibradas. La release 2 cambia únicamente la cabeza de salida, pasando de una a tres direcciones de lectura; según el autor, bajo el mismo protocolo de evaluación esto eleva en 5 puntos la métrica needs-review de ATBench y en 6 puntos la de detección de inyección respecto al checkpoint previo, sin cambios en el resto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación de riesgo de acciones de agente en cinco niveles, con 15 categorías de riesgo nombradas, reversibilidad y necesidad de privilegios de root, cada una con probabilidad asociada.
- Detección de origen no fiable: identifica si la acción está siendo dirigida por una instrucción llegada en contenido no confiable (resultado de herramienta, documento o página web).
- Evaluación de autorización: determina si los campos de confianza autorizan la acción propuesta.
- Decisión de revisión humana: indica si una acción requiere que una persona la examine.
- Inferencia sin generación de tokens: responde al conjunto de preguntas en un solo forward pass, con latencia de milisegundos a la velocidad de d1-2B.
- Soporte de dos conjuntos de preguntas: agent trace (needs_review, untrusted_origin, authorization) y shell command (risk_level, 15 categorías, reversible, requires_root).
- Entrada estructurada en JSON con petición del usuario, herramienta, comando o argumentos y contexto recuperado.
- No soporta tool calling generativo, agentes multi-step ni razonamiento conversacional: es un modelo de decisión, no un chat model, y no explica sus respuestas.

## Casos de uso

- Aprobación de comandos de shell en agentes de operaciones: antes de ejecutar un comando propuesto, el modelo devuelve el nivel de riesgo, las categorías aplicables y si requiere root, permitiendo bloquear o escalar comandos destructivos en milisegundos.
- Guardrail en agentes de código: integrado en el paso previo a la ejecución de una llamada a herramienta, puntúa la acción y decide si necesita revisión humana, reduciendo el riesgo de que el agente ejecute operaciones no deseadas.
- Detección de prompt injection en pipelines de agentes: al recibir el estado con el resultado de una herramienta o documento recuperado, el modelo indica si la acción está siendo dirigida por contenido no fiable, lo que permite cortar la cadena antes de que se materialice la inyección.
- Escritura de ficheros en entornos compartidos: el modelo evalúa reversibilidad y nivel de riesgo de una operación de escritura o borrado, útil para políticas de aprobación automática en sistemas de CI/CD o entornos de staging.
- Auditoría y triaje de trazas de agentes: procesar en lote trazas históricas de acciones para clasificar riesgo y origen, priorizando las que requieren revisión humana en equipos de seguridad.
- Políticas de aprobación adaptativas: usar las probabilidades calibradas para fijar umbrales por categoría de riesgo, escalando solo las acciones que superan el umbral configurado en cada organización.
- Filtro previo en asistentes con acceso a herramientas: colocar el modelo como capa de decisión entre la propuesta del agente y la ejecución real, con coste computacional bajo gracias a su tamaño de 1,92B.

## Benchmarks y rendimiento

La model card menciona métricas de ATBench (needs-review e injection) y afirma mejoras de 5 y 6 puntos respectivamente en la release 2 respecto al checkpoint previo, pero no se proporcionan los valores absolutos en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,4 GB solo para pesos (2,18B parámetros), más overhead de activaciones y contexto; en la práctica, entre 6 y 8 GB para estados de hasta 8K tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB si se aplica cuantización.
- Opciones de despliegue: Transformers con el código de modelo incluido en el repositorio (requiere `trust_remote_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: el autor indica decisiones en milisegundos a la velocidad de d1-2B; no se publican cifras concretas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scantron Preview | 2,18B | 128K (evaluado a 8K) | Clasificación de riesgo de acciones de agente | LFM Open License v1.0 | Hugging Face, research release |
| LiquidAI/d1-2B | 1,92B | no disponible en esta ficha | Modelo base de razonamiento de decisión | LFM Open License v1.0 | Hugging Face |
| Modelos guardrail generativos (p. ej. clasificadores de contenido) | variable | variable | Moderación de contenido | variable | variable |

No se dispone en la información proporcionada de modelos comparables directos en la categoría de decisión de seguridad de acciones de agente con los que establecer una comparación cuantitativa. La comparación con d1-2B es la más relevante por ser su modelo base, pero no se aportan métricas de d1-2B en las mismas tareas.

## Limitaciones y advertencias

- Checkpoint de investigación todavía en entrenamiento: los pesos, las métricas y la model card cambiarán; no es un control de seguridad de producción.
- El autor reconoce que es fuerte en riesgo a nivel de comando y en detección de prompt injection, útil para decidir si una acción requiere revisión humana, pero débil en juicios de autorización que necesitan contexto que la acción no aporta.
- Solo soporta inglés en los estados; comandos y código se procesan tal como aparecen, sin normalización multilingüe.
- No es un modelo de chat ni explica sus respuestas: devuelve probabilidades sobre preguntas fijas, lo que limita su uso fuera de ese conjunto.
- Entrenado y evaluado con estados de hasta 8K tokens, aunque el contexto nominal sea de 128K; el rendimiento más allá de 8K no está validado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración incorrecta en las probabilidades, especialmente en dominios alejados de los datos de entrenamiento.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar.
- Sin descargas ni likes en el momento de la ficha, lo que indica ausencia de validación independiente por parte de la comunidad.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a adversarios que adapten sus comandos para evadir la clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aidendle94/Scantron-Preview
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Licencia: https://huggingface.co/aidendle94/Scantron-Preview/blob/main/LICENSE
- Conjunto de preguntas: `questions.json` en el repositorio del modelo
