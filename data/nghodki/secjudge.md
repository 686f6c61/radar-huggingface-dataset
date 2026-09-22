# nghodki/SecJudge

## Resumen

SecJudge es un modelo de clasificación de texto desarrollado por el usuario nghodki (nghodki/SecJudge) y afinado a partir de answerdotai/ModernBERT-large, un encoder bidireccional de 395.836.421 parámetros. Su objetivo es puntuar el riesgo de seguridad de entradas de texto en el contexto de agentes y asistentes basados en LLM: inyección de prompts (directa e indirecta), llamadas a herramientas potencialmente peligrosas, fuga de datos personales y otras amenazas del ecosistema "agent-security".

El modelo se distribuye bajo licencia apache-2.0, con pesos en safetensors (repositorio de 1,6 GB), pipeline text-classification y soporte declarado únicamente para inglés. El acceso está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", por lo que se trata de una publicación muy reciente y sin validación comunitaria.

Su relevancia actual está en el hueco que ocupa: los guardrails de seguridad para agentes suelen implementarse con LLM generativos de 2B-8B parámetros, con latencias y costes elevados. Un encoder de ~396M parámetros permite clasificar cada mensaje o resultado de herramienta en milisegundos y a bajo coste, integrándose como capa de defensa previa o posterior al LLM principal. Las etiquetas del modelo apuntan a decisiones calibradas y aprendizaje contrastivo (rlcd, contrastive-learning, isotonic-calibration), aunque la model card no detalla el procedimiento de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ModernBERT), afinado desde answerdotai/ModernBERT-large |
| Parametros totales | 395.836.421 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base ModernBERT-large soporta hasta 8.192 tokens) |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados en el repositorio; los pesos estan en safetensors (precision no declarada). Cuantizacion a INT8/INT4 factible con herramientas externas |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 1,6 GB |
| Modelo base | answerdotai/ModernBERT-large |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT en su variante large: un encoder transformer bidireccional (encoder-only) que sustituye la atención completa por un patrón alterno de atención local y global, incorpora embeddings rotatorios (RoPE) para generalizar a longitudes mayores que las vistas en entrenamiento, usa GeGLU como función de activación y elimina los términos de sesgo en las capas lineales. ModernBERT-large tiene 395M parámetros y fue diseñado para contextos largos (hasta 8.192 tokens) con inferencia más rápida y eficiente en memoria que BERT o DeBERTa de tamaño comparable. Sobre esa base, SecJudge añade una cabeza de clasificación de seguridad; el número de etiquetas y su taxonomía no se detallan en la información disponible.

Respecto al entrenamiento, la model card no publica el número de tokens, la composición del dataset ni si se usaron etapas de RLHF/DPO. Las etiquetas del repositorio (rlcd, contrastive-learning, isotonic-calibration, calibrated-decisions) sugieren el uso de aprendizaje contrastivo y de calibración isotónica para producir probabilidades calibradas, pero conviene tratarlo como indicio y no como dato confirmado. Tampoco se documentan hiperparámetros, semillas ni proceso de selección de umbral. El autor tampoco publica información sobre la decodificación ni sobre innovaciones propias más allá del ajuste fino.

## Capacidades

- Clasificación de riesgo de seguridad en texto, con salida orientada a decisión (score/etiqueta) en lugar de generación.
- Detección de inyección de prompts, incluyendo el caso agéntico de inyección indirecta a través de contenido recuperado o resultados de herramientas.
- Clasificación de riesgo en el contexto de llamadas a herramientas (tool-call-security), relevante para agentes que ejecutan acciones.
- Detección de PII (pii-detection) según las etiquetas del repositorio; no se dispone de métricas de este apartado en la información proporcionada.
- Decisiones calibradas: las etiquetas apuntan a calibración isotónica, lo que en principio permite fijar umbrales de decisión de forma más estable.
- Modelo monolingüe: solo inglés declarado.
- No es un modelo generativo: no produce explicaciones, resúmenes ni texto libre.
- No se declara soporte de tool calling, agentes ni razonamiento multi-paso por parte del modelo en sí; su función es actuar como clasificador dentro de esas arquitecturas.

## Casos de uso

- Firewall de prompts en asistentes conversacionales: clasificar cada turno del usuario antes de enviarlo al LLM principal y bloquear intentos de jailbreak o inyección directa. El modelo es adecuado por latencia de encoder (396M parámetros) y por el F1 de 0,9645 declarado en el corpus DefenseClaw.
- Protección de agentes con tool calling: inspeccionar la salida de APIs, ficheros, correo o resultados de búsqueda antes de que el agente los consuma, cubriendo el escenario de inyección indirecta donde el modelo declara F1 0,998.
- Prevención de fuga de datos (DLP): etiquetar fragmentos con PII antes de enviarlos a un proveedor externo o de escribirlos en logs, usando la capacidad de pii-detection del modelo.
- Triaje en un SOC: clasificar alertas, tickets o informes como riesgo alto/bajo para priorizar la revisión humana, reduciendo el volumen que llega a analistas.
- Guardrail en pipelines RAG: puntuar los documentos recuperados antes de insertarlos en el contexto del LLM, evitando que contenido envenenado llegue al prompt del sistema.
- Defensa de agentes de código: escanear diffs, comandos de shell y salidas de dependencias en busca de instrucciones maliciosas, apoyándose en el benchmark de agentes de codificación citado por el autor.
- Red-teaming y evaluación continua: usar el clasificador como juez automático para medir la tasa de éxito de nuevos ataques y regresiones en el sistema de defensa.
- Enrutado de bajo coste: desplegar el modelo como primera etapa (filtro rápido) y reservar un LLM mayor solo para los casos marcados como dudosos, reduciendo coste por petición.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Ninguno está verificado por terceros (`verified: false`).

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Security Risk Classification | DefenseClaw Security Suite | F1 | 0,9645 | No |
| Security Risk Classification | DefenseClaw Security Suite | Recall | 0,995 | No |
| Security Risk Classification | DefenseClaw Security Suite | Precision | 0,936 | No |
| Cross-Domain Recall at Low FPR | rogue-security/coding-agent-security-benchmark | Recall @ 0,5% FPR | 0,4 | No |
| Cross-Domain Recall at Low FPR | rogue-security/coding-agent-security-benchmark | F1 | 0,654 | No |
| Agentic Indirect Prompt Injection | nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1 | F1 | 0,998 | No |
| Agentic Indirect Prompt Injection | nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1 | Recall | 0,996 | No |
| Real Human Attacks (DEF CON) | Lakera/b3-agent-security-benchmark-weak | F1 | 0,958 | No |
| Real Human Attacks (DEF CON) | Lakera/b3-agent-security-benchmark-weak | Recall | 0,919 | No |
| PII Detection | No disponible | No disponible | No disponible | No |

El model-index incluye una quinta entrada correspondiente a detección de PII, pero en la información proporcionada no se incluyen sus métricas. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas, que además no aplican a un clasificador de seguridad.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 1,6 GB para los pesos (coincide con el tamaño del repositorio de safetensors), más activaciones.
- VRAM en FP16/BF16: aproximadamente 0,8 GB de pesos.
- VRAM en INT8: aproximadamente 0,4 GB; en INT4, aproximadamente 0,2 GB, antes de overhead de runtime.
- Cabe holgadamente en cualquier GPU de consumo con 2 GB o más de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4060, RTX 4090) e incluso en CPU para lotes pequeños.
- GPU recomendadas para servicio de alta concurrencia: NVIDIA L4, A10G, T4 o superiores; A100/H100 solo tendrían sentido si se agrupan en batching muy alto o se despliegan junto a otros modelos.
- Opciones de despliegue: `transformers` con el pipeline de `text-classification`, Hugging Face Inference Endpoints, Text Generation Inference (TGI, tarea de clasificación), ONNX Runtime y exportación a otros runtimes de encoder. Existen soportes de ModernBERT en llama.cpp y en otros runners, pero el autor no distribuye pesos GGUF en el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas; por el tamaño y la arquitectura (encoder de 396M) se espera latencia de pocos milisegundos por muestra en GPU, pero es una estimación no verificada.
- Advertencia de despliegue: al ser un modelo gated, cualquier pipeline automatizado necesita un token con permisos aceptados; conviene cachear los pesos en la infraestructura propia.

## Comparativa con modelos similares

No se dispone de métricas de los modelos alternativos dentro de la información proporcionada; la comparación es cualitativa y las cifras de terceros deben verificarse en sus respectivas fichas.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos comparables |
|---|---|---|---|---|---|
| nghodki/SecJudge | 395.836.421 | No disponible (base ModernBERT-large: 8.192) | apache-2.0 | Clasificador de seguridad de agentes (prompt injection, tool calls, PII) | F1 0,9645 en DefenseClaw; F1 0,998 en inyeccion indirecta agentica |
| answerdotai/ModernBERT-large | ~395M | 8.192 tokens | apache-2.0 | Encoder generalista (no es un clasificador de seguridad) | No disponible en esta busqueda |
| ProtectAI deberta-v3-base-prompt-injection-v2 | ~184M (referencia general) | 512 tokens tipicamente | No disponible en esta busqueda | Clasificador binario de prompt injection | No disponible en esta busqueda |
| Meta Llama Prompt Guard 2 | Variantes de ~22M y ~86M (referencia general) | No disponible en esta busqueda | Licencia de la familia Llama | Clasificador de jailbreak e inyeccion | No disponible en esta busqueda |
| IBM Granite Guardian | Variantes de 2B y 8B (referencia general) | Contexto largo (modelo generativo) | No disponible en esta busqueda | Guardrail generativo con taxonomia de riesgos | No disponible en esta busqueda |

La ventaja diferencial de SecJudge frente a los guardrails generativos es el coste por inferencia; su desventaja es que solo cubre inglés y que su rendimiento fuera de dominio cae notablemente (recall 0,4 a 0,5% de FPR en el benchmark cross-domain).

## Limitaciones y advertencias

- Idioma: solo inglés declarado. Su uso en castellano u otros idiomas no está soportado ni evaluado.
- Datos de entrenamiento no publicados: se desconoce la composición del corpus, por lo que no es posible auditar sesgos ni estimar el sobreajuste al corpus DefenseClaw.
- Métricas no verificadas: todos los resultados del model-index están marcados como `verified: false`; proceden del propio autor.
- Sin adopción comunitaria: 0 descargas y 0 likes, sin incidencias ni validaciones externas conocidas.
- Degradación fuera de dominio: el recall a 0,5% de FPR en el benchmark de agentes de codificación cae a 0,4 (F1 0,654), muy por debajo de los valores en dominio. Calibrar umbrales solo con los datos de DefenseClaw puede dar una falsa sensación de cobertura.
- Calibración dependiente del dominio: aunque las etiquetas sugieren calibración isotónica, no hay garantía de que las probabilidades estén calibradas en distribuciones distintas a la de entrenamiento.
- Falsos positivos con coste operativo: una precisión de 0,936 implica que una parte de las alertas bloqueadas no son ataques reales; en flujos de usuario conviene diseñar degradación elegante y no bloqueos duros sin revisión.
- No es un modelo generativo: no explica por qué clasifica algo como riesgoso, lo que complica la trazabilidad y la respuesta ante incidentes.
- Cobertura incompleta: un clasificador entrenado sobre una taxonomía concreta no protege frente a clases de ataque no representadas; debe combinarse con otras capas de defensa.
- Acceso restringido: el modelo es gated, lo que añade fricción a la integración, a la reproducibilidad y al uso en entornos automatizados.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base y de los datasets de evaluación citados antes de un despliegue en producción.
- Fecha de publicación muy reciente (2026-09-22) y repositorio no actualizado desde entonces, según los metadatos disponibles.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/nghodki/SecJudge
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset citado (cross-domain): https://huggingface.co/datasets/rogue-security/coding-agent-security-benchmark
- Dataset citado (inyeccion indirecta agentica): https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1
- Dataset citado (ataques humanos, DEF CON): https://huggingface.co/datasets/Lakera/b3-agent-security-benchmark-weak
- Paper de la arquitectura base ModernBERT: https://arxiv.org/abs/2412.13663
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante sobre el modelo; los enlaces devueltos corresponden a foros de navegadores, soporte de Windows y consultas sin relacion con este modelo.
