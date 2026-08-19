# Krypto-Whitehat/muse-glimmer-xrpl-bug-triage-ultra

## Resumen

Muse Glimmer 30B — XRPL Bug Triage & Verification es un modelo de generación de texto especializado en el triage y la verificación de informes de bugs del ledger XRPL y su implementación de referencia `rippled`. Desarrollado por el usuario Krypto-Whitehat, se trata de un fine-tune QLoRA sobre el modelo base Muse Glimmer 30B, cuantizado posteriormente en formato GGUF para su despliegue eficiente. El modelo tiene dos funciones principales: actuar como asistente de triage de bugs (distingue hallazgos válidos de falsos positivos siguiendo el razonamiento de mantenedores senior) y como modelo de verificación (clasifica un bug concreto como válido, falso positivo o con una severidad determinada, aportando razonamiento técnico conciso).

La relevancia actual del modelo radica en que aborda un problema práctico en el ecosistema XRPL: la carga de trabajo de los mantenedores a la hora de revisar issues y reportes de seguridad. Al estar entrenado con decisiones públicas reales de 15 mantenedores históricos y activos del repositorio XRPLF/rippled, reproduce su estilo de clasificación sin necesidad de intervención humana. El modelo se distribuye en dos cuantizaciones GGUF (Q4_K_M y Q5_K_M) y pesa aproximadamente 27,85 mil millones de parámetros, con una ventana de entrenamiento de 1024 tokens (aunque el contexto del modelo base no se especifica). Su licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune sobre Muse Glimmer 30B, arquitectura base no especificada) |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (entrenamiento con max 1024 tokens) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune QLoRA sobre el modelo base Muse Glimmer 30B, que no se describe en detalle en la documentación proporcionada. El proceso de entrenamiento emplea QLoRA con cuantización de 4 bits NF4, con un LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones de atención y MLP, con dropout de 0.05. Se utiliza el optimizador AdamW de 8 bits con una tasa de aprendizaje de 2e-5, programación coseno, 3 épocas y tamaño de lote efectivo de 16. La secuencia se trunca a 1024 tokens, conservando la respuesta completa del asistente y truncando el prompt desde la izquierda. El etiquetado de máscara solo aprende los tokens de respuesta del asistente, enmascarando los tokens de sistema y usuario con -100. El mejor checkpoint se seleccionó por pérdida de evaluación en un conjunto de validación retenido (época 2, pérdida de evaluación 0.158). Los pesos finales se fusionaron sobre el modelo base BF16 pristino, nunca sobre pesos cuantizados.

Los datos de entrenamiento provienen exclusivamente de decisiones públicas: issues cerrados del repositorio XRPLF/rippled (bugs confirmados vs. reportes rechazados o falsos positivos), patrones de comportamiento de revisores senior e informes validados del Sherlock Contest 2026. Se incluyen las decisiones de 15 mantenedores históricos y activos, como mvadari, JoelKatz, vinniefalco, entre otros.

## Capacidades

- Generación de texto y razonamiento técnico en inglés y alemán.
- Clasificación de informes de bugs: distingue entre hallazgos válidos, falsos positivos y asigna severidad.
- Triage de bugs: dado un reporte o un área funcional de XRPL, identifica patrones de bug y razona como un mantenedor senior.
- Verificación de vulnerabilidades: dado un bug concreto, devuelve una clasificación con justificación técnica concisa.
- Soporte de chat conversacional (pipeline text-generation) con plantilla de chat Jinja integrada.
- Compatible con herramientas de inferencia como LM Studio y llama.cpp (runtime b10353+).
- Detención limpia de la generación mediante el token `<|eot|>` (EOS 200008).

## Casos de uso

- Triage de issues en repositorios XRPL: un mantenedor o colaborador puede enviar un reporte de bug y el modelo lo clasifica como válido o falso positivo, priorizando la revisión manual.
- Verificación de hallazgos de seguridad: antes de escalar una vulnerabilidad, el modelo evalúa si el bug reportado es real y su severidad, reduciendo falsos positivos en programas de bug bounty.
- Asistencia a revisores de código: el modelo puede analizar descripciones de bugs y sugerir áreas de código relacionadas, ayudando a localizar la causa raíz.
- Integración en pipelines de CI/CD: se puede conectar a un sistema de gestión de issues para etiquetar automáticamente los reportes entrantes y priorizarlos según severidad.
- Formación de nuevos contribuidores: sirve como herramienta educativa para entender cómo los mantenedores clasifican bugs, mostrando el razonamiento detrás de cada decisión.
- Análisis de informes de concursos de seguridad: dado un lote de reportes de un concurso tipo Sherlock, el modelo puede preclasificarlos antes de la revisión humana, ahorrando tiempo.
- Documentación de decisiones: el modelo puede generar resúmenes de por qué un bug fue aceptado o rechazado, útil para auditorías y transparencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 16,9 GB y el Q5_K_M 19,8 GB. Para cargar el modelo en GPU se necesita al menos esa cantidad de VRAM más overhead del runtime (típicamente 1-2 GB adicionales). Por tanto, se recomienda una GPU con al menos 20 GB de VRAM para Q4_K_M y 24 GB para Q5_K_M.
- GPUs recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 40 GB o superior. Para Q4_K_M también podría funcionar en una RTX 4080 (16 GB) con riesgo de desbordamiento, pero no es recomendable.
- En CPU, el modelo puede ejecutarse con llama.cpp, pero la velocidad será baja; se recomienda al menos 32 GB de RAM para Q4_K_M.
- Opciones de despliegue: LM Studio (con soporte de plantilla Jinja), llama.cpp, Ollama (si se convierte a formato compatible), y servidores de inferencia como vLLM o TGI si se convierte a safetensors (aunque el repo solo contiene GGUF).
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo para secuencias de hasta 1024 tokens, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (triage de bugs de XRPL). El modelo base Muse Glimmer 30B no está documentado en la información proporcionada, por lo que no se puede establecer una comparativa cuantitativa. Se recomienda evaluar el modelo en tareas específicas de triage frente a otros LLM generalistas de tamaño similar (por ejemplo, Llama 3 30B o Mistral 30B) si se busca una alternativa, pero no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el dominio XRPL/rippled; su rendimiento en otras áreas de seguridad o código será limitado.
- Las clasificaciones generadas deben tratarse como entrada de triage, no como veredictos finales. No sustituye una auditoría de seguridad profesional.
- El entrenamiento se basa en decisiones públicas de mantenedores, lo que puede introducir sesgos derivados de las prácticas históricas de esos mantenedores.
- La ventana de contexto efectiva durante el entrenamiento fue de 1024 tokens; aunque el modelo base podría soportar más, no se garantiza un rendimiento óptimo con contextos largos.
- El modelo solo soporta inglés y alemán; no se ha entrenado para otros idiomas.
- Aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se recomienda verificar que el modelo base Muse Glimmer 30B también tenga una licencia compatible (no se especifica en la documentación).
- El repositorio solo contiene archivos GGUF; para usar el modelo con otras librerías (transformers, vLLM) sería necesario convertir los pesos, lo que no está documentado.

## Enlaces

- [HuggingFace - Krypto-Whitehat/muse-glimmer-xrpl-bug-triage-ultra](https://huggingface.co/Krypto-Whitehat/muse-glimmer-xrpl-bug-triage-ultra)
