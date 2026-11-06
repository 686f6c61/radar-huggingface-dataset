# Jue1Dev/jue

## Resumen

Jue (决) es un modelo de decisión para ciberseguridad desarrollado por Jue1Dev, construido sobre MiniCPM5-2B de OpenBMB mediante un adaptador LoRA. A diferencia de los LLM generativos tradicionales, Jue no genera texto: recibe un artefacto de seguridad (una alerta, un árbol de procesos, una línea de log, una descripción de CVE, una política IAM, un manifiesto de Kubernetes o una llamada a herramientas de un agente de IA) junto con varias preguntas tipadas, y devuelve una probabilidad calibrada para cada respuesta posible. Todas las preguntas se resuelven en una única pasada hacia adelante, lo que lo hace rápido y determinista.

Su nicho es claro: triaje de alertas en SOC, inteligencia de amenazas y mapeo a MITRE ATT&CK, gestión de vulnerabilidades (CVE, CWE, CVSS, VEX), seguridad en la nube, identidad y Kubernetes, DevSecOps y cadenas de suministro, cumplimiento normativo y guardarraíles para agentes que invocan herramientas. El modelo tiene 2.500 millones de parámetros, funciona en una única GPU o en Apple silicon, soporta inglés y chino, e implementa el protocolo Jev `/v1/systemone`. Existe además una variante más ligera llamada Jue-Flash.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM5-2B con adaptador LoRA (PEFT), clasificación de texto |
| Parametros totales | 2.500 millones (aprox. 2.500M base + LoRA) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre MiniCPM5-2B) |

## Arquitectura y entrenamiento

Jue parte de MiniCPM5-2B, un modelo lingüístico compacto de OpenBMB, y le añade un adaptador LoRA entrenado con la librería PEFT. El repositorio pesa aproximadamente 0,2 GB, coherente con un adaptador LoRA en safetensors y no con pesos completos. El pipeline declarado es `text-classification`: el modelo funciona como clasificador multi-pregunta sobre artefactos de seguridad, devolviendo probabilidades calibradas por respuesta en una sola pasada de inferencia, sin generación de texto.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. La model card sí indica que el modelo implementa el protocolo Jev `/v1/systemone`, orientado a la integración de modelos de decisión en flujos de agentes. Los tags sugieren cobertura temática amplia: triaje de alertas, CTI, MITRE ATT&CK, CVE/CWE/CVSS, seguridad en Kubernetes, SBOM, cumplimiento y calibración de decisiones.

## Capacidades

- Clasificación de decisiones de ciberseguridad sobre artefactos concretos: alertas, árboles de procesos, líneas de log, descripciones de CVE, políticas IAM, manifiestos de Kubernetes y llamadas a herramientas.
- Respuesta a múltiples preguntas tipadas en una sola pasada hacia adelante, sin generación de texto, con probabilidades calibradas por respuesta.
- Triaje de alertas y apoyo a operaciones de SOC y equipos blue team.
- Inteligencia de amenazas: mapeo de informes a MITRE ATT&CK y extracción de indicadores (CTIBench VSP, SecKnowledge-Eval).
- Gestión de vulnerabilidades: clasificación CWE, estimación CVSS y detección de vulnerabilidades en código (VulDetectBench, SECURE).
- Guardarraíles para agentes de IA: evaluación de si una llamada a herramientas es relevante o segura (BFCL-v4 irrelevance, When2Call).
- Soporte bilingüe: inglés y chino.
- Implementación del protocolo Jev `/v1/systemone` para integración con sistemas de agentes.

## Casos de uso

- Triaje automático de alertas en un SOC: el modelo clasifica alertas de SIEM o EDR en una sola pasada, sin generación de texto, lo que permite procesar grandes volúmenes con latencia baja y coste mínimo en una GPU de consumo.
- Mapeo de inteligencia de amenazas a MITRE ATT&CK: dada una técnica o informe, el modelo asigna probabilidades a tácticas y técnicas, útil para enriquecer CTI automáticamente.
- Priorización de vulnerabilidades: clasificación de descripciones CVE y código para detectar vulnerabilidades y estimar severidad (CVSS), integrable en pipelines de vulnerability management.
- Revisión de políticas IAM y manifiestos de Kubernetes: evaluación de riesgos en configuraciones de nube e identidad antes de desplegar en producción.
- Guardarraíles para agentes de IA: verificación en tiempo real de si una tool call propuesta por un agente es relevante y segura, aprovechando su rendimiento en BFCL-v4 irrelevance y When2Call.
- Verificación de cadenas de suministro y SBOM: comprobaciones automatizadas de cumplimiento y riesgo en artefactos de software dentro de pipelines DevSecOps.
- Respuesta a incidentes: apoyo en la clasificación inicial de incidentes y en decisiones de escalamiento con probabilidades calibradas que permiten definir umbrales operativos.
- Cumplimiento normativo: respuesta a preguntas tipadas sobre requisitos de compliance sobre artefactos técnicos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Tarea | Métrica | Valor |
|---|---|---|---|
| SecQA v1 | Decisión de ciberseguridad | Accuracy | 0,973 |
| SecQA v2 | Decisión de ciberseguridad | Accuracy | 0,940 |
| CyberMetric-10000 | Decisión de ciberseguridad | Accuracy | 0,735 |
| CyberMetric-2000 | Decisión de ciberseguridad | Accuracy | 0,753 |
| CyberMetric-500 | Decisión de ciberseguridad | Accuracy | 0,760 |
| CyberMetric-80 | Decisión de ciberseguridad | Accuracy | 0,812 |
| VulDetectBench tarea 1 | Decisión de ciberseguridad | Accuracy | 0,921 |
| VulDetectBench tarea 2 | Decisión de ciberseguridad | Accuracy | 0,864 |
| SECURE CWET | Decisión de ciberseguridad | Accuracy | 0,741 |
| SECURE KCV | Decisión de ciberseguridad | Accuracy | 0,826 |
| SECURE MAET | Decisión de ciberseguridad | Accuracy | 0,763 |
| CTIBench MCQ | Decisión de ciberseguridad | Accuracy | 0,515 |
| CTIBench VSP | Decisión de ciberseguridad | 1 - MAD/7,7 | 0,842 |
| SecKnowledge-Eval (CTI adversarial) | Decisión de ciberseguridad | Accuracy | 0,637 |
| AthenaBench rcm-open | Decisión de ciberseguridad | Accuracy | 0,551 |
| CMMLU computer security | Decisión de ciberseguridad | Accuracy | 0,672 |
| BFCL-v4 irrelevance | Decisión de ciberseguridad | Accuracy | 0,863 |
| BFCL-v4 live-irrelevance | Decisión de ciberseguridad | Accuracy | 0,724 |
| JevBench (public items) | Decisión de ciberseguridad | Accuracy | 0,783 |
| JevBench hard | Decisión de ciberseguridad | Accuracy | 0,577 |
| When2Call | Decisión de ciberseguridad | Macro-F1 | 0,836 |

## Requisitos de hardware

- Con 2.500 millones de parámetros, la inferencia en precisión completa (fp16/bf16) requiere aproximadamente 5-6 GB de VRAM; con cuantización a 8 bits o 4 bits la cifra baja a unos 2-3 GB (estimaciones basadas en el tamaño del modelo, no confirmadas por el autor).
- Compatible con una única GPU de consumo; una RTX 4090, RTX 3090 o incluso tarjetas de 8 GB deberían ser suficientes para fp16.
- Ejecutable en Apple silicon (según la model card), lo que lo hace viable en MacBook con memoria unificada.
- Al ser un adaptador LoRA, se necesita cargar el modelo base MiniCPM5-2B más el adaptador de 0,2 GB.
- Despliegue: al tratarse de un modelo PEFT con pipeline de clasificación, la vía natural es transformers + peft; no se declara soporte específico para vLLM, llama.cpp, Ollama o TGI, aunque la compatibilidad con el protocolo Jev `/v1/systemone` sugiere un servidor propio del ecosistema Jev.
- Latencia y throughput: no disponibles; la model card indica que todas las preguntas se responden en una sola pasada hacia adelante, lo que implica baja latencia por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jue (Jue1Dev/jue) | 2,5B (base + LoRA) | Clasificación de decisiones de seguridad, sin generación | Apache-2.0 | Pesos abiertos en Hugging Face |
| Jue-Flash (Jue1Dev/jue-flash) | no disponible | Variante ligera de Jue para el mismo dominio | no disponible | Pesos abiertos en Hugging Face |
| SecGPT / LLMs de seguridad generativos (p. ej. modelos finetunados sobre Llama para ciberseguridad) | 7-8B típicamente | Generación de texto sobre tareas de seguridad | Variables | Pesos abiertos, pero con inferencia generativa más lenta y costosa |

La diferencia clave frente a LLM generativos aplicados a seguridad es el modo de inferencia: Jue responde preguntas tipadas con probabilidades calibradas en una pasada, mientras que un LLM generativo produce texto libre, más flexible pero más lento, más caro y con mayor riesgo de alucinación en tareas de clasificación estructurada.

## Limitaciones y advertencias

- Los benchmarks publicados son declarados por el autor y no están verificados de forma independiente (campo `verified: false` en el model-index); conviene validarlos en el entorno propio antes de producción.
- Rendimiento desigual según la tarea: muy alto en SecQA y VulDetectBench (0,86-0,97), pero notablemente más bajo en CTIBench MCQ (0,515), AthenaBench (0,551) y JevBench hard (0,577), lo que indica que tareas de conocimiento CTI complejo siguen siendo un punto débil.
- No genera texto: no sirve para redactar informes, resumir incidentes o explicar razonamientos; está limitado a clasificación y decisiones tipadas.
- Solo soporta inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto, cuantizaciones disponibles y detalles del dataset de entrenamiento no disponibles, lo que dificulta evaluar límites en artefactos largos (logs extensos, manifiestos grandes).
- Descargas prácticamente nulas (0) y proyecto muy reciente (creado en octubre de 2026): comunidad reducida, sin historial de auditorías ni hallazgos de sesgo documentados.
- Sesgos: al ser un modelo especializado entrenado sobre datos de ciberseguridad, puede heredar sesgos de los datasets de entrenamiento (no documentados); el riesgo de alucinación es bajo por diseño (no genera texto), pero las probabilidades calibradas pueden estar mal calibradas fuera de distribución.
- Licencia Apache-2.0: permite uso comercial, pero no incluye garantías; en seguridad, una decisión errónea puede tener impacto operativo, por lo que se recomienda supervisión humana en triaje y respuesta a incidentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jue1Dev/jue
- Variante ligera Jue-Flash: https://huggingface.co/Jue1Dev/jue-flash
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper, repositorio de código y demos: no disponibles en la información proporcionada.
