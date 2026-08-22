# owethuzuluy6/Kimi-K3

## Resumen

Kimi K3 es el modelo insignia de Moonshot AI, presentado en julio de 2026. Se trata del primer modelo abierto de la clase 3 billones de parámetros (2,8 billones en total), con una arquitectura MoE (Mixture-of-Experts) que activa solo 104 mil millones de parámetros por token gracias a 896 expertos. Incorpora innovaciones propias como Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), que mejoran la eficiencia de escalado y el manejo de contexto largo. Destaca por su ventana de contexto de 1 millón de tokens y capacidades nativas multimodales (texto, imagen y vídeo).

El modelo está diseñado para tareas de codificación de largo alcance, trabajo de conocimiento agéntico y razonamiento avanzado. Su liberación con pesos abiertos bajo la licencia Kimi K3 representa un hito en el acceso a inteligencia de frontera para la comunidad de investigación y desarrollo. El repositorio en HuggingFace contiene pesos en formato safetensors, con un tamaño total de 1561 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8 billones) |
| Parametros activos | 104 mil millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | No disponible (se mencionan pesos en safetensors, no se especifican cuantizaciones oficiales) |
| Idiomas soportados | No disponible (no se especifica en la documentación proporcionada) |
| Licencia | Kimi K3 (licencia personalizada, no OSI aprobada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 896 expertos, de los cuales se activan 16 por token. La atención se compone de 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA (Multi-head Latent Attention). La dimensión oculta de atención es de 7168, con 96 cabezas de atención. El modelo tiene 93 capas, de las cuales 1 es densa y 92 son de tipo MoE. La dimensión del MoE latente es de 3584 y cada experto tiene una dimensión oculta de 3072.

La innovación principal es el uso de KDA, un mecanismo de atención lineal que reduce el costo computacional frente a la atención estándar, combinado con Attention Residuals para estabilizar el entrenamiento. El entrenamiento se realizó con un marco denominado Stable LatentMoE, que mejora la eficiencia de escalado en aproximadamente 2,5 veces respecto al modelo anterior Kimi K2. No se han publicado detalles sobre el volumen de tokens de entrenamiento, composición del dataset o uso de técnicas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto, razonamiento y matemáticas de alto nivel, incluyendo tareas de razonamiento multi-step y agentes.
- Codificación de largo horizonte: mantiene sesiones de ingeniería prolongadas, navega repositorios masivos y orquesta herramientas de terminal (GPU kernel optimization, compiladores, etc.).
- Multimodal nativo: comprende texto, imágenes y vídeo dentro del mismo modelo, sin módulos separados.
- Visión en el bucle: puede integrar visión en tareas de desarrollo de juegos, diseño CAD y edición de vídeo.
- Trabajo de conocimiento agéntico: genera informes de investigación profundos con visualizaciones interactivas, widgets y dashboards.
- Soporte de tool calling y function calling, indicado por su uso en agentes y herramientas.
- Ventana de contexto de 1 millón de tokens, adecuada para documentos extensos y repositorios grandes.

## Casos de uso

- Desarrollo de software de largo alcance: el modelo puede operar como un agente autónomo en repositorios grandes, escribiendo y depurando código, ejecutando tests y gestionando pull requests, gracias a su contexto de 1M tokens y su capacidad de tool calling.
- Optimización de kernels GPU: sus capacidades de codificación de bajo nivel y su razonamiento matemático permiten escribir y optimizar kernels CUDA o ROCm, con visión en el bucle para revisar gráficos de rendimiento.
- Generación de informes de investigación automatizada: puede producir análisis profundos con gráficos interactivos y dashboards a partir de fuentes múltiples, integrándose en flujos de trabajo de consultoría o análisis financiero.
- Edición y creación de vídeo con visión en el bucle: el modelo puede recibir vídeo como entrada y generar guiones, ediciones o efectos, al tener comprensión multimodal nativa.
- Diseño asistido por ordenador (CAD): gracias a su visión y razonamiento espacial, puede ayudar en tareas de diseño de piezas o simulación, generando código de CAD o interpretando planos.
- Asistente de investigación académica: puede analizar artículos extensos, extraer conclusiones, comparar metodologías y generar resúmenes con citas, aprovechando su contexto de 1M tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación proporcionada no incluye cifras de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la documentación disponible.
- Estimación orientativa: con 2,8 billones de parámetros en total y 104B activos, la inferencia completa en FP16 requeriría aproximadamente 5,6 TB de VRAM, inviable en una sola GPU. Con cuantización INT8 (~2,8 TB) o INT4 (~1,4 TB), se necesitarían múltiples GPUs de alta capacidad (por ejemplo, 8x H100 de 80 GB o 8x A100 de 80GB) en configuración distribuida.
- Para despliegue en producción, se recomienda usar frameworks como vLLM, TensorRT-LLM o TGI, que soportan MoE y cuantización.
- Para uso local, no es viable en hardware de consumo (consumer GPU) por el tamaño de los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Se puede mencionar que Kimi K2, el predecesor de Moonshot AI, tenía una arquitectura similar pero con menos parámetros, aunque no se aportan cifras concretas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia Kimi K3: se trata de una licencia personalizada que puede imponer restricciones de uso comercial, aunque el modelo se describe como "open-weight". Se recomienda revisar los términos exactos antes de usarlo en producción.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos o riesgos de alucinación para este modelo. Al ser un modelo de gran escala, es probable que presente sesgos heredados de los datos de entrenamiento, aunque no se ha documentado.
- Contexto y idiomas: la documentación no especifica los idiomas soportados. Aunque se infiere que el modelo es multilingüe por su naturaleza, no hay confirmación oficial.
- Tamaño y coste de inferencia: el despliegue requiere infraestructura de alto rendimiento, con un coste significativo de hardware y energía. No es adecuado para entornos con recursos limitados.
- Riesgo de uso indebido: como modelo de frontera, puede generar código malicioso o contenido engañoso si no se aplican medidas de seguridad adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/owethuzuluy6/Kimi-K3
- Página oficial de Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Reporte técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Documentación de la API de Kimi: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Artículo de openlm.ai: https://openlm.ai/kimi-k3/
