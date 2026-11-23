# Brobhavesh/LingSante-3.1-flash

## Resumen

LingSante-3.1-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con pesos abiertos, desarrollado por el equipo inclusionAI (Alibaba) y publicado en Hugging Face bajo el identificador Brobhavesh/LingSante-3.1-flash. El modelo está construido sobre la arquitectura de Ling-3.1-flash y está especializado en razonamiento médico complejo, comunicación sanitaria profesional, investigación basada en evidencia y tareas médicas de horizonte largo. Cuenta con 560.000 millones de parámetros totales, de los cuales activa 25.000 millones por token, y dispone de una ventana de contexto de 1 millón de tokens.

El modelo aborda un problema específico del dominio sanitario: las tareas médicas reales exigen manejar información incompleta, heterogeneidad entre pacientes y requisitos estrictos de cumplimiento normativo, capacidades que van más allá de la inteligencia general. Para ello, LingSante-3.1-flash unifica razonamiento médico y ejecución de flujos de trabajo mediante preentrenamiento mixto nativo médico, mid-training, ajuste fino supervisado, aprendizaje por refuerzo específico de tarea y destilación on-policy multi-profesor.

Su relevancia actual radica en que es uno de los pocos modelos abiertos de gran escala orientados explícitamente al ámbito clínico, con capacidad declarada de verificar evidencia entre escenarios, emitir juicios profesionales y completar flujos de trabajo multietapa de forma autónoma. El autor lo posiciona para investigación y evaluación, no como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (63 capas KDA + 9 capas Gated MLA, ratio 7:1; 4 capas densas) |
| Parametros totales | 560B (572.120.680.768 según safetensors) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (según tags del repositorio); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, bailing_hybrid) |

## Arquitectura y entrenamiento

LingSante-3.1-flash conserva la arquitectura de Ling-3.1-flash: un transformer híbrido con mezcla de expertos que combina 63 capas de atención linear KDA (Kimi Delta Attention) con 9 capas de Gated MLA (Multi-head Latent Attention), en proporción 7:1, más 4 capas densas. El modelo emplea 512 expertos enrutados más 1 experto compartido, activando 8 expertos enrutados por token. La dimensión oculta es de 4096, con tamaño intermedio de experto de 1280 y tamaño intermedio denso de 10240. Incorpora 64 cabezas de atención y un vocabulario de 157.184 tokens.

El entrenamiento combina datos generales y médicos a lo largo de todas las fases: preentrenamiento, mid-training y ajuste fino supervisado. Los datos médicos aportan conocimiento de dominio y ejemplos clínicamente fundamentados, mientras que los generales preservan capacidades amplias como razonamiento, código, búsqueda y uso de herramientas. En post-entrenamiento se aplica aprendizaje por refuerzo para razonamiento médico, uso de herramientas, búsqueda y comportamiento profesional, y finalmente se consolidan las capacidades mediante destilación on-policy multi-profesor. El número de tokens de entrenamiento y la composición exacta del dataset no están disponibles en la información proporcionada.

## Capacidades

- Razonamiento médico complejo: identificación de factores clave en decisiones clínicas, validación de evidencia de soporte y resolución de conflictos entre fuentes.
- Comunicación sanitaria profesional: respuestas contextualizadas y accionables alineadas con estándares clínicos.
- Investigación basada en evidencia: verificación de evidencia entre escenarios y síntesis de hallazgos.
- Tareas médicas de horizonte largo: coordinación de herramientas e información dentro de un flujo de trabajo único, con replanificación ante información nueva.
- Uso de herramientas (tool calling / function calling): entornos interactivos con configuraciones diversas de uso de herramientas.
- Razonamiento multietapa y ejecución autónoma de flujos de trabajo.
- Capacidades generales preservadas: razonamiento, código, búsqueda y uso de herramientas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje clínico asistido: el modelo puede procesar historiales extensos y notas de múltiples especialidades dentro de su ventana de 1M tokens para priorizar casos según gravedad y urgencia, manteniendo coherencia entre subescenarios interconectados.
- Revisión de literatura médica: dada su orientación a investigación basada en evidencia, puede ingerir grandes volúmenes de artículos y guías clínicas en una sola pasada de contexto y sintetizar hallazgos con verificación cruzada de fuentes.
- Apoyo a la decisión diagnóstica en investigación: como herramienta de evaluación, puede generar hipótesis diferenciales a partir de datos de caso y señalar la evidencia que las respalda, siempre bajo supervisión clínica y sin uso como base independiente de diagnóstico.
- Automatización de flujos administrativos sanitarios: con soporte de tool calling, puede encadenar consultas a sistemas de historiales, validación de coberturas y generación de documentación, adaptando el plan cuando aparece información nueva.
- Formación médica y simulación: en entornos interactivos realistas, puede actuar como tutor o paciente simulado en escenarios multietapa, evaluando el razonamiento del alumnado y verificando la corrección de las decisiones.
- Verificación de evidencia para comités y farmacovigilancia: el modelo puede contrastar afirmaciones de informes internos contra corpus documentales largos y marcar conflictos entre fuentes, aprovechando su contexto de 1M tokens.
- Asistencia a comunicación con pacientes: puede redactar explicaciones contextualizadas y accionables adaptadas al nivel de comprensión del paciente, con alineación a estándares de comportamiento profesional.

## Benchmarks y rendimiento

La model card incluye una imagen de visión general de benchmarks, pero no se proporcionan tablas con valores numéricos en la información disponible. El autor afirma que el modelo obtiene un rendimiento líder entre modelos de código abierto en tareas de razonamiento médico complejo, y que ocupa la segunda posición global en benchmarks de comportamiento profesional médico, por detrás de GPT-6 Astra. No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 560B parámetros totales, en FP8 se requieren aproximadamente 560 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; en BF16 ascendería a unos 1,1 TB.
- GPU recomendadas: para FP8 se necesitan múltiples aceleradores de clase数据中心, como 8×H100 80GB o 8×H200; en BF16 serían necesarios al menos 16×H100 80GB.
- GPU de consumo: no cabe en ninguna GPU de consumo individual (RTX 4090 24GB, RTX 5090, etc.). Solo sería viable con cuantización agresiva y offloading a memoria del sistema, con latencia muy elevada.
- Opciones de despliegue: al tratarse de una arquitectura híbrida con código personalizado (custom_code, bailing_hybrid), el despliegue requiere soporte específico del runtime; vLLM, TGI o llama.cpp dependerán de que exista integración para esta arquitectura, dato no disponible. El repositorio pesa 573,8 GB.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingSante-3.1-flash | 560B | 25B | 1M | MIT | Hugging Face, ModelScope, API Computrix |
| Ling-3.1-flash | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| GPT-6 Astra | no disponible (propietario) | no disponible | no disponible | propietaria | no disponible |

La información proporcionada solo permite comparar con el modelo base Ling-3.1-flash, del que LingSante hereda la arquitectura, y con GPT-6 Astra, citado como referencia en comportamiento profesional médico. No se dispone de datos de parámetros, contexto ni licencia de los modelos comparables en la información disponible.

## Limitaciones y advertencias

- Uso exclusivo para investigación y evaluación: el autor declara explícitamente que el modelo no es un dispositivo médico y no debe usarse como base independiente para diagnóstico, prescripción o tratamiento.
- Riesgo de alucinación: en dominios clínicos, la generación de evidencia inexistente o la atribución errónea de fuentes es un riesgo crítico; se requiere verificación humana.
- Sesgos conocidos: no disponible.
- Limitaciones de idioma: los idiomas soportados no están especificados, por lo que el rendimiento fuera del inglés (u otros idiomas no documentados) es incierto.
- Licencia MIT: permite uso comercial, pero la licencia del modelo no exime del cumplimiento de regulaciones sanitarias locales (por ejemplo, MDR en la UE) ni de las responsabilidades clínicas derivadas del uso.
- Requisitos de hardware extremos: 573,8 GB de repositorio y arquitectura personalizada limitan el despliegue a infraestructura de centro de datos y dificultan la reproducción independiente.
- Madurez del ecosistema: al ser un modelo reciente con 0 descargas y 0 likes en Hugging Face, la validación comunitaria y las integraciones de terceros son escasas.
- Dependencia de custom_code: la arquitectura bailing_hybrid requiere código personalizado, lo que puede complicar la compatibilidad con herramientas estándar de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Brobhavesh/LingSante-3.1-flash
- Modelo original en Hugging Face: https://huggingface.co/inclusionAI/LingSante-3.1-flash
- ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash
- API Computrix: https://computrix.ai/sg/models/modelservice-1795159585527001414
- Modelo base Ling-3.1-flash: https://huggingface.co/inclusionAI/Ling-3.1-flash
