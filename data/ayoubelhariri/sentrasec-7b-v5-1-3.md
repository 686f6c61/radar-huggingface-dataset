# ayoubelhariri/SentraSec-7B-v5.1.3

## Resumen

SentraSec-7B-v5.1.3 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct orientado a ciberseguridad, desarrollado por Ayyoub El Hariri. El modelo se presenta como un asistente de investigación en seguridad ofensiva y defensiva, con capacidades declaradas para análisis de seguridad web y móvil, investigación de vulnerabilidades, clasificación OWASP/CWE/CVE y generación de informes de pentesting. Se distribuye exclusivamente en formato GGUF bajo la librería llama.cpp, lo que indica que está pensado para inferencia local y despliegue en entornos con recursos limitados.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho (7B) especializado en dominios de seguridad, publicado con descargas y likes nulos en el momento de la consulta, y con una model card que reconoce explícitamente que no documenta datasets, hiperparámetros ni métricas de evaluación. Esta versión corresponde a la "Stage 2" del pipeline de entrenamiento del autor, con designación de versión 5.1.3. La arquitectura subyacente es la de Qwen2.5-7B-Instruct (transformer denso), aunque el autor no confirma el recuento exacto de parámetros y recomienda verificarlo.

El modelo declara soporte únicamente para inglés (`language: en`) y una licencia "other" sin detallar términos, lo que supone una advertencia importante para uso comercial. No se han publicado benchmarks, y la información técnica disponible es escasa y en gran parte autoafirmada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2.5-7B-Instruct (no se detalla variante interna) |
| Parametros totales | 7B (designación de release; el autor indica "verify actual parameter count") |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma oficial; los ejemplos de la model card usan `-c 4096` y `n_ctx=4096` |
| Tipos de cuantizacion | No disponible (el autor remite a la configuración de build GGUF) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | "other" (términos no especificados en la model card) |
| Formato de pesos | GGUF (distribución principal); no se mencionan safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-7B-Instruct, un transformer denso de la familia Qwen2.5, y se ha sometido a un ajuste fino adicional orientado al dominio de ciberseguridad. La model card describe este release como la "Stage 2" del pipeline de desarrollo de SentraSec, con objetivos de entrenamiento centrados en mejorar la comprensión del dominio de seguridad, el análisis estructurado de vulnerabilidades, el razonamiento técnico y la interpretación de evidencias, así como la calidad de las recomendaciones de remediación.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni hiperparámetros. El autor indica explícitamente que "detailed training datasets, hyperparameters, evaluation metrics, and quantization specifications should be documented separately when verified", lo que confirma la ausencia de transparencia sobre el proceso de entrenamiento. No se describen innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, MoE, SSM) más allá de las heredadas del modelo base.

## Capacidades

- Análisis de seguridad de aplicaciones web: interpretación de peticiones y respuestas HTTP, evaluación de autenticación y autorización, análisis de gestión de sesiones, investigación de inyecciones y validación de entrada, evaluación de seguridad de APIs e identificación de configuraciones inseguras.
- Clasificación de vulnerabilidades según OWASP Top 10, CWE y CVE, con mapeo a técnicas MITRE ATT&CK cuando proceda.
- Seguridad de aplicaciones móviles Android: asistencia en ingeniería inversa de APK, interpretación de análisis estático y dinámico, investigación de almacenamiento inseguro de datos y análisis de comunicaciones de red.
- Validación de seguridad basada en evidencias: flujo de trabajo estructurado en 13 fases (target, scope, asset, attack surface, observation, hypothesis, evidence, validation, clasificación, impacto, riesgo, remediación, verificación) que distingue entre vulnerabilidad confirmada, falso positivo y evidencia insuficiente.
- Generación de documentación técnica de seguridad e informes de pentesting.
- Revisión de seguridad de código e interpretación de salidas de herramientas de seguridad.
- Razonamiento técnico multi-paso orientado a investigación de vulnerabilidades.
- No se declara soporte de tool calling, function calling, visión, audio ni modo "thinking" explícito.

## Casos de uso

- Triaje de hallazgos de escáneres de vulnerabilidades: el modelo puede recibir la salida de herramientas como Burp Suite o Semgrep y clasificar cada hallazgo como vulnerabilidad confirmada, falso positivo o evidencia insuficiente, aplicando el flujo de validación de 13 fases descrito en la model card.
- Redacción de informes de pentesting: a partir de notas técnicas y evidencias, el modelo puede estructurar secciones de impacto, riesgo y remediación, reduciendo el tiempo de documentación tras una auditoría.
- Asistencia en revisión de código seguro: análisis de fragmentos de código en busca de patrones de inyección, gestión de sesiones defectuosa o validación de entrada insuficiente, con recomendaciones de remediación concretas.
- Análisis de seguridad de APIs: evaluación de mecanismos de autenticación y autorización, revisión de esquemas de tokens y detección de configuraciones inseguras en endpoints REST o GraphQL.
- Investigación de seguridad móvil Android: interpretación de resultados de análisis estático (jadx, apktool) y dinámico (Frida) para localizar almacenamiento inseguro de credenciales o comunicaciones sin TLS.
- Formación y concienciación en seguridad: generación de explicaciones didácticas sobre CWEs y OWASP Top 10 para equipos de desarrollo, con ejemplos de explotación y mitigación.
- Despliegue local en entornos air-gapped: al distribuirse en GGUF y ejecutarse con llama.cpp, puede usarse en estaciones de trabajo de investigación sin conexión a internet, requisito habitual en equipos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de ciberseguridad (por ejemplo, CyberSecEval), y el autor reconoce que las métricas de evaluación "should be documented separately when verified".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial, ya que no se detallan las cuantizaciones publicadas. Como referencia para un modelo de 7B en GGUF: ~4-5 GB en Q4_K_M, ~6-7 GB en Q6_K, ~8 GB en Q8_0 y ~14-15 GB en FP16.
- GPU recomendadas: no especificadas por el autor. Para un 7B en cuantización Q4, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB serían suficientes; para Q8 o FP16, se requeriría una RTX 4090 (24 GB) o GPUs de datacenter como A100/H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más usando cuantizaciones Q4/Q5, aunque el autor no confirma los builds GGUF disponibles.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) y llama-cpp-python son los soportados oficialmente. vLLM, TGI u Ollama no se mencionan, aunque Ollama podría importar el GGUF si está disponible.
- Latencia y throughput: no disponibles. Los ejemplos de la model card usan `n_ctx=4096` y `max_tokens=1024` con `temperature=0.2`, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| SentraSec-7B-v5.1.3 | 7B | No disponible (ejemplos a 4096) | Ciberseguridad (fine-tuning) | "other" (no especificada) | GGUF |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 tokens (según model card oficial de Qwen) | Propósito general | Apache 2.0 (según Qwen) | Safetensors, GGUF |
| WhiteRabbitNeo (familia) | 7B-33B según variante | Variable | Ciberseguridad ofensiva/defensiva | Variable según variante | Safetensors, GGUF |
| Foundation-Sec-8B (Cisco) | 8B | No disponible en esta ficha | Ciberseguridad | No disponible en esta ficha | Safetensors |

Nota: los datos de los modelos comparativos provienen de conocimiento general y no de la información proporcionada en esta consulta; deben verificarse en sus respectivas model cards. La comparativa con SentraSec es limitada porque este no publica benchmarks ni contexto oficial.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al modelo base en tareas de ciberseguridad, ni de que no degrade capacidades generales.
- Falta de transparencia en el entrenamiento: no se documentan datasets, hiperparámetros, número de tokens ni metodología de alineación, lo que impide evaluar sesgos introducidos.
- Licencia "other" sin términos explícitos: no se aclara si se permite uso comercial, redistribución o modificación; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso en equipos hispanohablantes sin traducción intermedia.
- Riesgo de alucinación en dominio técnico: al ser un modelo de 7B especializado, puede generar CWEs, CVEs o técnicas MITRE ATT&CK inexistentes o mal atribuidas; toda salida debe validarse contra fuentes primarias (NVD, MITRE).
- Contexto limitado en los ejemplos: la model card usa 4096 tokens, muy por debajo de los 32.768 del Qwen2.5-7B-Instruct base; si el fine-tuning no preserva la ventana original, el análisis de código o logs extensos se verá truncado.
- Riesgo de uso dual: un asistente de pentesting puede emplearse para fines no autorizados; el autor no describe salvaguardas ni filtros de uso responsable.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, sin historial de versiones verificable ni comunidad que valide su calidad.
- Designación de tamaño no confirmada: el propio autor indica "verify actual parameter count", lo que sugiere que la cifra de 7B es una designación de release y no una medición verificada.

## Enlaces

- Hugging Face: https://huggingface.co/ayoubelhariri/SentraSec-7B-v5.1.3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.
