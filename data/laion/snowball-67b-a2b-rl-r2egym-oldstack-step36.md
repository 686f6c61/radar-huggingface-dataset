# laion/snowball-67b-a2b-rl-r2egym-oldstack-step36

## Resumen

Snowball 67B-A2B (RL R2E-Gym, old stack, step 36) es un modelo de lenguaje de arquitectura MoE desarrollado por LAION, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un checkpoint de pesos de política (policy weights) obtenido tras aplicar aprendizaje por refuerzo sobre el modelo `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888`, que a su vez es un ajuste supervisado de la familia Snowball 67B-A2B con arquitectura GrugMoe. El modelo tiene 67.078.882.816 parámetros totales y su nomenclatura "A2B" sugiere aproximadamente 2.000 millones de parámetros activos por token, aunque la model card no explicita esa cifra.

El problema que aborda es el entrenamiento de agentes autónomos capaces de resolver tareas de ingeniería de software en terminal: el modelo se ha entrenado con RL sobre tareas de R2E-Gym usando el agente de terminal terminus-2, con prompts de 49.152 tokens y generaciones de 16.384 tokens. Es relevante porque documenta un pipeline completo de RL on-policy a escala (40 nodos, 1.584 asientos) sobre una base MoE de 67B, con un stack de entrenamiento concreto y resultados held-out publicados.

La relevancia inmediata está en su uso como referencia reproducible para investigación en agentes de código, y en que el propio autor indica que es el mejor checkpoint del stack previo a la migración del 7 de septiembre de 2026, con una variante EAGLE-3 de decodificación especulativa publicada aparte para acelerar la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (GrugMoe), transformer disperso; configuracion exacta de capas y expertos no disponible |
| Parametros totales | 67.078.882.816 |
| Parametros activos | aproximadamente 2B segun la nomenclatura "67B-A2B"; no confirmado explicitamente en la model card |
| Longitud de contexto | no disponible como ventana de inferencia; el entrenamiento uso prompts de 49.152 tokens y generaciones de 16.384 tokens |
| Tipos de cuantizacion | no disponible (export publicado solo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export con layout de HuggingFace, 39 shards) |
| Tamano del repositorio | 134,2 GB |
| Modelo base | laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888 |
| Fecha de creacion en HF | 2026-09-14 |
| Fecha de actualizacion en HF | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es GrugMoe, una variante de mezcla de expertos (MoE) sobre transformer, tal y como declaran las etiquetas del repositorio (`grug_moe`, `moe`). El checkpoint contiene únicamente los pesos de política en safetensors junto con `config` y tokenizador; no se detalla en la información disponible el número de capas, número de expertos, dimensión oculta ni el esquema de enrutamiento. El nombre del modelo indica 67B de parámetros totales con aproximadamente 2B activos, lo que implica un ratio de activación muy bajo y, por tanto, un coste de cómputo por token mucho menor que el de un modelo denso de 67B.

El entrenamiento parte del checkpoint SFT `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888` y aplica RL on-policy estilo RLOO con loss de media de secuencia, staleness 2, grupos de 8, batch de 64 prompts, learning rate 5e-7 y redondeo estocástico en bf16. El entorno es R2E-Gym, con el agente de terminal terminus-2, un pool de entrenamiento `tt-v2-train` de 728 tareas, divergencia KL de 0,01 y una infraestructura de 40 nodos con 1.584 asientos. El stack utilizado es el previo a la migración del 7 de septiembre de 2026, y este checkpoint (step 36) es el mejor del stack antiguo según el autor. Para decodificación, existe un draft EAGLE-3 publicado por separado que aporta alrededor de 1,5x de aceleración en esta familia.

## Capacidades

- Razonamiento agéntico en terminal: el modelo está entrenado específicamente para operar como agente con herramientas de terminal, no solo para generar texto.
- Edición y resolución de código a nivel de repositorio: los conjuntos de evaluación incluyen splits same-repo y unseen-repo, lo que indica entrenamiento orientado a trabajar dentro de una base de código existente.
- Razonamiento multi-paso: el pipeline de RL con terminus-2 implica cadenas de acciones con realimentación del entorno.
- Uso de herramientas y function calling: implícito en el diseño del agente de terminal; no se especifica el esquema de tool calling concreto en la model card.
- Generación de secuencias largas: el entrenamiento contempló salidas de hasta 16.384 tokens y entradas de hasta 49.152 tokens.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles (no se declaran).
- Modo de pensamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Agente de resolución de issues en repositorios: el modelo puede recibir el contexto del repositorio y una descripción de tarea, y ejecutar comandos de terminal y ediciones de ficheros hasta resolver el problema, que es exactamente el escenario de R2E-Gym con el que se entrenó.
- Automatización de tareas de mantenimiento de código: aplicar parches de dependencias, actualizar APIs obsoletas o corregir imports en un monorepo, apoyándose en la ventana de prompt de 49.152 tokens para incluir varios ficheros relevantes.
- Integración en pipelines de CI/CD: como paso de reparación automática cuando falla un test, el agente puede leer el log de error, localizar el fichero implicado y proponer un cambio verificable antes de que intervenga una persona.
- Investigación en RL para agentes: sirve como checkpoint de referencia (step 36 del stack antiguo) para reproducir curvas de RL, comparar configuraciones de KL y staleness, o estudiar el efecto del tamaño del pool de tareas.
- Evaluación comparativa de agentes de código: sus métricas held-out pass@1 sobre 441 tareas de validación permiten usarlo como baseline en estudios de resolución automática de problemas de software.
- Migración y modernización de código heredado: tareas "never-solved" como las del split publicado representan escenarios donde el agente debe explorar un repositorio desconocido; útil para medir el techo real de automatización antes de delegar trabajo humano.
- Generación de scripts de operaciones y shell: dado el entrenamiento con herramientas de terminal, es adecuado para producir y depurar comandos, expresiones de búsqueda y automatizaciones de sistema.
- Servicio de asistencia a desarrolladores con decodificación acelerada: desplegado junto al draft EAGLE-3, puede alimentar asistentes interactivos donde la latencia por token importa.

## Benchmarks y rendimiento

Datos publicados por el autor, pass@1 con 8 intentos sobre el split de validación `tt-v2 val441` (150 tareas same-repo, 115 unseen-repo, 176 held-out):

| Metrica | Resultado |
|---|---|
| pass@1 mismo repositorio (same-repo) | 0,499 |
| pass@1 repositorio no visto (unseen-repo) | 0,503 |
| pass@1 tareas nunca resueltas (never-solved) | 0,062 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible. Los valores anteriores están medidos contra el modelo base de forma emparejada, según la model card.

## Requisitos de hardware

- VRAM para pesos completos en bf16: el repositorio ocupa 134,2 GB, por lo que se necesitan al menos dos GPU de 80 GB (por ejemplo, 2x H100 80 GB o 2x A100 80 GB) solo para cargar los pesos, sin contar caché KV ni activaciones.
- Configuraciones prácticas: 2x H100 80 GB o 4x A100 80 GB para servicio con margen de contexto; 4x H100 para mayor throughput y contextos largos.
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 en precisión completa. No se han publicado cuantizaciones GGUF/AWQ/GPTQ para este checkpoint, por lo que no se puede confirmar su viabilidad en hardware consumer.
- Opciones de despliegue: el autor indica servir con el fork de vLLM de GrugMoe. No se mencionan soporte en llama.cpp, Ollama ni TGI.
- Decodificación especulativa: el draft `laion/snowball-64k-eagle3-draft-r2egym` proporciona aproximadamente 1,5x de velocidad de decodificación en esta familia.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks, contexto ni licencia de modelos alternativos de la misma categoría, por lo que no es posible establecer una comparación con cifras verificables. Como referencia estructural, el propio autor sitúa este checkpoint frente a su modelo base SFT, `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888`, con evaluación emparejada sobre el split val441; no se dispone de comparaciones frente a modelos de otros desarrolladores.

## Limitaciones y advertencias

- Riesgo de alucinación en la generación de código y comandos: no se han publicado evaluaciones de fidelidad factual ni tasas de error en acciones de terminal destructivas.
- Rendimiento bajo en tareas nunca vistas y sin solución conocida: el pass@1 de 0,062 en el split never-solved indica que el modelo apenas resuelve problemas fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados: la model card no declara cobertura multilingüe, por lo que el comportamiento fuera del inglés técnico es incierto.
- Sesgos: no se han publicado análisis de sesgo para este checkpoint.
- Dependencia del stack de servicio: requiere el fork de vLLM de GrugMoe, lo que puede dificultar el despliegue en infraestructuras estandarizadas y complicar el mantenimiento a largo plazo.
- Naturaleza del artefacto: se trata de un checkpoint intermedio de investigación (step 36 de un stack concreto y ya reemplazado por una migración posterior), no de un modelo listo para producto; el autor lo describe explícitamente como el mejor del stack antiguo.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni formatos de baja precisión publicados, lo que limita el despliegue en hardware modesto.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base de LAION conviene revisar también las condiciones de `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888` y de los datos de R2E-Gym empleados en el RL.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validación independiente de la comunidad sobre este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/snowball-67b-a2b-rl-r2egym-oldstack-step36
- Modelo base (SFT): https://huggingface.co/laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888
- Draft EAGLE-3 para decodificación especulativa: https://huggingface.co/laion/snowball-64k-eagle3-draft-r2egym
- LAION (sitio oficial): https://laion.ai/
- LAION en GitHub: https://github.com/LAION-AI
- LAION en Wikipedia: https://en.wikipedia.org/wiki/LAION
- Blog de LAION-5B (referencia de la organizacion): https://laion.ai/blog/laion-5b/
