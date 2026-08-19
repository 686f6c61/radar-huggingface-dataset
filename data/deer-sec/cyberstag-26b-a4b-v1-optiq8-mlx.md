# deer-sec/CyberStag-26B-A4B-V1-OptiQ8-MLX

## Resumen

CyberStag-26B-A4B-V1 es un modelo de lenguaje especializado en ciberseguridad y razonamiento lógico profundo, desarrollado por el usuario deer-sec sobre la arquitectura MoE Gemma-4-26B-A4B de Google. Se ha afinado mediante LoRA con el framework MLX, fusionando los adaptadores en el modelo base para facilitar su despliegue. El modelo está diseñado para asistir a profesionales de seguridad, analistas SOC y administradores de sistemas en tareas como modelado de amenazas, evaluación de vulnerabilidades, interpretación de logs y construcción de estrategias de respuesta a incidentes.

La versión OptiQ8 presentada aquí es una cuantización dinámica de 8 bits aplicada con la herramienta mlx-optiq, que reduce el tamaño del modelo manteniendo un equilibrio entre huella de memoria y rendimiento. Está disponible en formatos MLX (para Apple Silicon) y GGUF (para llama.cpp y LM Studio), con opciones de cuantización que van desde BF16 hasta Q4_K_M. El modelo es exclusivamente de texto, sin capacidades multimodales, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma-4-26B-A4B |
| Parametros totales | 25,23 mil millones (según model card; el archivo safetensors cuantizado contiene 7.885.838.366 parámetros, probablemente por la cuantización 8-bit) |
| Parametros activos | 4 mil millones (según la nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible (no se especifica en la información proporcionada) |
| Tipos de cuantizacion | BF16 (MLX y GGUF), OptiQ8 (8-bit dinámico), Q8_0, Q4_K_M |
| Idiomas soportados | Multilingüe (énfasis en inglés y japonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Gemma-4-26B-A4B, que combina 26 mil millones de parámetros totales con 4 mil millones activos por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, activando solo un subconjunto de expertos en cada paso de inferencia. El afinamiento se realizó con mlx_lm.lora, entrenando aproximadamente 448,7 millones de parámetros (1,778% del total) mediante LoRA, con un enfoque estratégico que actualiza las proyecciones de atención (q_proj, k_proj, v_proj, o_proj), las capas MLP (gate_proj, up_proj) y las capas de expertos. El dataset de entrenamiento, curado y destilado, se centra en conceptos avanzados de ciberseguridad, inteligencia de amenazas y razonamiento lógico, aunque los detalles específicos permanecen confidenciales para preservar la integridad del modelo. Los adaptadores LoRA se fusionaron completamente en el modelo base para un despliegue sin fricciones.

## Capacidades

- Razonamiento profundo en ciberseguridad: descompone vectores de ataque complejos y sugiere estrategias de mitigación detalladas.
- Análisis de logs: interpreta logs de servidor, registros de acceso y eventos de sistema para identificar posibles vulnerabilidades como inyección SQL o CSRF.
- Modelado de amenazas: estructura y evalúa escenarios de amenaza, ayudando a priorizar riesgos y defensas.
- Evaluación de vulnerabilidades: identifica debilidades en configuraciones, código y arquitecturas de red.
- Respuesta a incidentes: genera planes de respuesta estructurados, paso a paso, para incidentes de seguridad.
- Razonamiento lógico paso a paso: el modelo tiende a incrementar el tiempo de "pensamiento" antes de responder, lo que mejora la calidad analítica de las salidas.
- Multilingüe: soporta inglés y japonés, con capacidad multilingüe general.
- Sin soporte multimodal: solo acepta entradas de texto; no procesa imágenes, audio ni vídeo.

## Casos de uso

- Análisis de logs de acceso: un analista SOC puede introducir un log de servidor y el modelo identifica patrones de inyección SQL, fuerza bruta o accesos anómalos, sugiriendo acciones correctivas.
- Evaluación de vulnerabilidades en código: un desarrollador puede solicitar una revisión de fragmentos de código para detectar fallos de seguridad comunes (XSS, CSRF, deserialización insegura) y recibir recomendaciones de parcheo.
- Planificación de respuesta a incidentes: ante un incidente real, el modelo genera un plan de contención, erradicación y recuperación estructurado, adaptado al contexto del ataque descrito.
- Formación y concienciación en seguridad: se puede usar como tutor interactivo para explicar conceptos de ciberseguridad, ataques y defensas a personal no especializado.
- Generación de informes de seguridad: a partir de hallazgos técnicos, el modelo redacta informes ejecutivos claros y accionables para dirección o clientes.
- Simulación de adversarios: en entornos de pruebas controladas, el modelo puede generar escenarios de ataque hipotéticos para validar defensas (siempre con fines defensivos y éticos).
- Auditoría de configuración: el modelo revisa configuraciones de red, políticas de firewall o ajustes de servidor y señala malas prácticas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras cualitativas frente al modelo base en contextos de ciberseguridad, pero no proporciona métricas cuantitativas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Al ser un modelo MoE con solo 4 mil millones de parámetros activos, la inferencia es significativamente más rápida que un modelo denso de 26 mil millones.
- La versión OptiQ8 (8-bit) requiere aproximadamente 7,9 GB de VRAM para los pesos, más memoria para el contexto y las activaciones.
- La versión Q4_K_M (GGUF) reduce la huella a unos 4-5 GB, permitiendo ejecución en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- En Apple Silicon, la versión MLX está optimizada para Metal y puede ejecutarse en Macs con 16 GB o más de RAM unificada.
- Opciones de despliegue: mlx_lm para Apple Silicon, llama.cpp / LM Studio para GGUF, y potencialmente vLLM o TGI si se convierte a formatos estándar.
- La latencia aumenta ligeramente respecto al modelo base debido al razonamiento más profundo, pero el throughput se beneficia de la activación selectiva de expertos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Especialización |
|---|---|---|---|---|---|
| CyberStag-26B-A4B-V1 | 25,23B | 4B | no disponible | Apache 2.0 | Ciberseguridad, razonamiento |
| Gemma-4-26B-A4B (base) | 25,23B | 4B | no disponible | Apache 2.0 | Generalista |
| Otros modelos de seguridad (p. ej., CyberGuard, SecLM) | no disponible | no disponible | no disponible | no disponible | Ciberseguridad |

La comparativa con alternativas especializadas en ciberseguridad no está disponible en la información proporcionada. Frente al modelo base, CyberStag ofrece mejoras cualitativas en precisión y profundidad de razonamiento en dominios de seguridad, a costa de una mayor latencia de inferencia.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imágenes, audio ni otros formatos multimodales.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventar detalles técnicos si se le pide sobre temas fuera de su dominio o con prompts ambiguos.
- Sesgos potenciales: el dataset de entrenamiento es confidencial y podría contener sesgos no documentados, especialmente en contextos de seguridad donde la terminología varía por región.
- Restricciones de uso ético: la model card prohíbe explícitamente el uso para acceso no autorizado, generación de exploits o ciberdelincuencia. Solo se permite para investigación defensiva y resiliencia de sistemas.
- Latencia aumentada: el razonamiento más profundo incrementa el tiempo de respuesta, lo que puede ser inadecuado para aplicaciones en tiempo real de baja latencia.
- Soporte de idiomas limitado: aunque es multilingüe, el énfasis está en inglés y japonés; el rendimiento en otros idiomas puede ser inferior.
- Sin garantías de producción: no se proporcionan datos de benchmarks ni evaluaciones formales, por lo que su fiabilidad en entornos críticos debe validarse de forma independiente.

## Enlaces

- [HuggingFace: deer-sec/CyberStag-26B-A4B-V1-OptiQ8-MLX](https://huggingface.co/deer-sec/CyberStag-26B-A4B-V1-OptiQ8-MLX)
- [Modelo base: google/gemma-4-26b-a4b](https://huggingface.co/google/gemma-4-26b-a4b)
- [Imagen de la model card](https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1-optiq8/resolve/main/CyberStag-26B-A4B-v1.jpeg)
