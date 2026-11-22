# inclusionAI/LingSante-3.1-flash-MXFP4

## Resumen

LingSante-3.1-flash-MXFP4 es la versión cuantizada en MXFP4 de LingSante-3.1-flash, un modelo de mezcla de expertos (MoE) orientado específicamente al razonamiento médico complejo, la comunicación profesional sanitaria, la investigación basada en evidencia y la ejecución de tareas médicas de largo horizonte. Lo desarrolla inclusionAI, el brazo de modelos abiertos vinculado a Ant Group, y se distribuye bajo licencia MIT. La relevancia de esta entrega concreta es que reduce un modelo de aproximadamente 560.000 millones de parámetros totales a un formato mixto MXFP4/FP8/BF16 de unos 313 GB, haciendo viable su despliegue en cuatro GPU H20-3e con paralelismo TP4/EP4.

El modelo parte de la arquitectura híbrida del original: 63 capas con atención lineal KDA y 9 capas con Gated MLA (proporción 7:1), 512 expertos enrutados más uno compartido, 8 expertos activados por token y una ventana de contexto configurada de 262.144 tokens. La activación por token ronda los 25.000 millones de parámetros, lo que sitúa su coste de inferencia muy por debajo de lo que sugiere el tamaño total. La cuantización es RTN (round-to-nearest) sin entrenamiento adicional ni calibración, aplicada solo a las proyecciones `gate_proj`, `up_proj` y `down_proj` de los expertos enrutados; el resto de módulos conserva FP8, BF16 o FP32.

El modelo está pensado para investigación y evaluación, no como dispositivo médico. Su interés práctico para desarrolladores e investigadores radica en que combina un dominio vertical exigente (medicina) con capacidades de agente y uso de herramientas, y lo hace con pesos abiertos y una licencia permisiva, algo poco habitual en modelos de este tamaño y especialización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida lineal (Hybrid-linear MoE): 63 capas KDA + 9 capas Gated MLA, 4 capas densas |
| Parametros totales | ~560B en el modelo principal (excluyendo MTP); 294.289.983.808 según safetensors del checkpoint cuantizado |
| Parametros activos | ~25B por token (8 expertos enrutados de 512 + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP4 (E2M1, grupo 32, escalas E8M0 compartidas) en expertos enrutados; FP8 E4M3 (bloques 128×128, escalas FP32), BF16 y FP32 en el resto de módulos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato mixto MXFP4/FP8/BF16/FP32), código personalizado (`custom_code`) |

Otras especificaciones de arquitectura declaradas por el autor:

| Parametro | Valor |
|---|---|
| Capas transformer | 63 KDA + 9 Gated MLA (proporción 7:1) |
| Capas de predicción MTP | 1 |
| Capas densas | 4 |
| Expertos enrutados | 512 |
| Expertos compartidos | 1 |
| Expertos activados por token | 8 |
| Cabezas de atención | 64 |
| Hidden size | 4096 |
| Tamaño intermedio de experto | 1280 |
| Tamaño intermedio denso | 10240 |
| Vocabulario | 157.184 tokens |
| Tamaño del checkpoint | 291,72 GiB (313,23 GB) |
| Precisión de activación en serving | W4A8 (FP8 E4M3, grupo 32) o W4A16 (BF16) |

## Arquitectura y entrenamiento

La arquitectura es una MoE híbrida que alterna capas de atención lineal KDA (Kimi Delta Attention) con capas de Gated MLA en una proporción 7:1, más cuatro capas densas. El modelo usa 512 expertos enrutados con activación de 8 por token y un experto compartido, con un tamaño intermedio de experto de 1280 y un hidden size de 4096. Incluye una capa de predicción MTP (multi-token prediction), lo que habilita decodificación especulativa nativa y mejora el throughput en serving. La ventana de contexto configurada es de 262.144 tokens.

El entrenamiento del modelo base combina datos generales y médicos de forma nativa a lo largo de las tres fases: preentrenamiento mixto médico, mid-training y supervised fine-tuning. Sobre esa base se aplican refuerzo (RL) específico por tarea y destilación on-policy multi-profesor. El autor describe tres marcos de trabajo: alineación evidencia-razonamiento médico (síntesis de datos de alta calidad para fundamentar el razonamiento clínico), tareas médicas de largo horizonte (entornos interactivos realistas, uso de herramientas y verificación estructurada) y alineación de comportamiento profesional (respuestas contextualizadas y accionables conforme a estándares clínicos). No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset.

Esta release concreta no reentrena nada: aplica cuantización RTN sin calibración sobre los pesos del modelo original. Los expertos enrutados pasan a MXFP4; las matrices densas, de experto compartido, KDA y atención se mantienen en FP8; embeddings, `lm_head`, routers, normas, `g_proj` de MLA, `b_proj` y convoluciones de KDA y `eh_proj` de MTP quedan en BF16; y `A_log`, `dt_bias` y `expert_bias` del router en FP32.

## Capacidades

- Razonamiento médico complejo: identificación de factores clave en decisiones clínicas, validación de evidencia de soporte y resolución de conflictos entre fuentes.
- Tareas médicas de largo horizonte: ejecución de flujos de trabajo con subescenarios interconectados y replanificación ante información nueva.
- Uso de herramientas (tool calling / function calling) en entornos interactivos, según el marco de tareas de largo horizonte descrito por el autor.
- Razonamiento multi-paso y comportamiento de agente dentro de un mismo workflow.
- Comunicación profesional sanitaria: respuestas contextualizadas, profesionales y accionables ante información incompleta.
- Investigación profunda basada en evidencia (deep research).
- Generación de texto conversacional (`text-generation`, `conversational`).
- Decodificación especulativa mediante la capa MTP incluida.
- Capacidades multilingües: no disponible (no se declaran idiomas en la model card).

## Casos de uso

- Investigación clínica asistida: el modelo puede recorrer literatura y guías, contrastar evidencia y señalar discrepancias entre fuentes gracias a su marco de alineación evidencia-razonamiento y a una ventana de 262.144 tokens que permite cargar protocolos y artículos completos en una sola sesión.
- Triaje y anamnesis estructurada: con información de paciente incompleta, el modelo está entrenado para formular preguntas de seguimiento y producir resúmenes accionables, lo que encaja en flujos de admisión o preconsulta siempre con supervisión profesional.
- Soporte a la decisión con uso de herramientas: integrado como agente que consulta calculadoras clínicas, bases de datos de fármacos o APIs internas del hospital mediante function calling, y compone el resultado en un informe.
- Generación de documentación clínica: redacción de notas de evolución, resúmenes de alta o informes de derivación a partir de transcripciones y datos estructurados, aprovechando la alineación de comportamiento profesional.
- Evaluación y auditoría de protocolos: comparación de guías internas contra literatura para detectar contradicciones o puntos obsoletos, una tarea de largo horizonte que requiere mantener contexto y verificar cada afirmación.
- Investigación académica en IA médica: al ser un checkpoint abierto con licencia MIT, sirve como base para experimentos de cuantización, evaluación de sesgos en dominio sanitario o destilación hacia modelos menores.
- Formación médica simulada: creación de casos clínicos interactivos multi-turno donde el modelo interpreta al tutor o al paciente virtual, con verificación estructurada de las respuestas del alumno.

## Benchmarks y rendimiento

La model card incluye una figura con resultados de benchmarks, pero esos datos corresponden al modelo fuente LingSante-3.1-flash y el autor indica explícitamente que no representan mediciones del checkpoint cuantizado. Los valores numéricos no están disponibles en formato textual en la información proporcionada.

No se han publicado resultados de benchmarks del checkpoint MXFP4 en la información disponible.

## Requisitos de hardware

- Tamaño del checkpoint: 291,72 GiB (313,23 GB) en disco; la VRAM necesaria para inferencia es del mismo orden, ya que el formato mixto no admite una reducción adicional sin recuantizar.
- Despliegue recomendado por el autor: 4 × NVIDIA H20-3e con TP4 / EP4 / DP1.
- No cabe en GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 pueden alojar el modelo completo; sería necesario un clúster multi-GPU o recuantización agresiva a formatos menores no publicados.
- Precisión de activación configurable en serving: W4A8 (FP8 E4M3, grupo 32) o W4A16 (BF16), lo que permite ajustar el equilibrio entre throughput y calidad.
- El repositorio usa `custom_code` y requiere cargar código remoto; conviene revisar dicho código antes de desplegar en producción.
- Opciones de despliegue: no se especifican frameworks concretos más allá de la mención al motor Humming para la precisión de activación; vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LingSante-3.1-flash-MXFP4 | ~560B / ~25B | 262.144 | MIT | Pesos abiertos en Hugging Face y ModelScope |
| LingSante-3.1-flash (modelo fuente) | ~560B / ~25B | 262.144 | MIT | Pesos abiertos; precisión original FP8/BF16 |
| Alternativas de dominio médico abierto | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparado con otros modelos, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor prohíbe explícitamente usarlo como base independiente para diagnóstico, prescripción o tratamiento. Cualquier uso clínico requiere supervisión de un profesional sanitario.
- Modelo destinado a investigación y evaluación, no a producción clínica directa.
- La cuantización RTN sin calibración puede degradar la calidad respecto al modelo fuente; el autor no publica métricas de la pérdida de rendimiento del checkpoint MXFP4.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en dominio sanitario, donde una cita o dosis inventada puede causar daño.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad en la información disponible; la heterogeneidad de pacientes hace probable la existencia de sesgos demográficos no medidos.
- Idiomas soportados no declarados: no hay garantía de calidad fuera de los idiomas presentes en el entrenamiento, presumiblemente chino e inglés, aunque no se confirma.
- La licencia MIT permite uso comercial, pero no exime del cumplimiento normativo sanitario (MDR en la UE, FDA en EE. UU.) ni de las obligaciones de protección de datos (RGPD) al procesar información de pacientes.
- Requiere cargar código personalizado del repositorio, lo que introduce superficie de ataque en la cadena de suministro.
- El tamaño del checkpoint (313 GB) y la necesidad de cuatro GPU H20 lo alejan de cualquier despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/LingSante-3.1-flash-MXFP4
- Modelo fuente: https://huggingface.co/inclusionAI/LingSante-3.1-flash
- ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash-MXFP4
