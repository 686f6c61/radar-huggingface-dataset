# i3zs/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal de código abierto desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T (2,8 billones de parámetros). Está diseñado para tareas de razonamiento avanzado, codificación de largo alcance y trabajo de conocimiento, con capacidades nativas de visión (imagen y vídeo) y una ventana de contexto de 1 millón de tokens. Su arquitectura se basa en Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco MoE disperso (Stable LatentMoE) que activa 16 de 896 expertos por token, logrando una eficiencia de escalado aproximadamente 2,5 veces superior a la de su predecesor Kimi K2.

El modelo se distribuye con pesos completos bajo la licencia Kimi K3, lo que permite investigación, despliegue y desarrollo posterior. Su tamaño y arquitectura lo posicionan como una alternativa abierta a modelos propietarios de frontera, con especial énfasis en tareas de agente autónomo, generación de código complejo y análisis multimodal. La liberación de los pesos en formato safetensors (1561 GB) lo hace accesible para entornos de investigación con infraestructura de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (según tags de HuggingFace); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (license: other, license_name: "kimi-k3") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE dispersa con 93 capas, de las cuales 69 utilizan Kimi Delta Attention (KDA) y 24 utilizan Gated MLA (Multi-head Latent Attention). La dimensión de atención oculta es 7168 con 96 cabezas de atención, y la dimensión latente del MoE es 3584. Cada experto tiene una dimensión oculta de 3072, con un total de 896 expertos, de los cuales se seleccionan 16 por token. Esta configuración permite un escalado eficiente al activar solo una fracción de los parámetros totales.

El entrenamiento se basa en el marco Stable LatentMoE, que mejora la estabilidad y eficiencia del escalado. No se han proporcionado detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información disponible. La innovación principal reside en la combinación de atención lineal híbrida (KDA) con atención residual, lo que reduce el coste computacional en contextos largos y mejora la capacidad de razonamiento sobre secuencias extensas.

## Capacidades

- Generación de texto y razonamiento avanzado, incluyendo tareas de codificación de largo alcance, optimización de kernels GPU, desarrollo de compiladores y diseño de chips.
- Comprensión multimodal nativa: procesa texto, imágenes y vídeo dentro del mismo modelo, sin módulos separados.
- Soporte para agentes autónomos: puede mantener sesiones de ingeniería prolongadas con supervisión humana mínima, navegar repositorios masivos y orquestar herramientas de terminal.
- Trabajo de conocimiento end-to-end: genera informes de investigación profundos con visualizaciones interactivas, widgets, paneles de control, diseño de movimiento y edición de vídeo.
- Ventana de contexto de 1 millón de tokens, adecuada para documentos extensos, bases de código completas o análisis de vídeo de larga duración.
- Capacidades de extracción de características (feature-extraction) según los tags de HuggingFace, lo que sugiere utilidad para representaciones vectoriales.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede gestionar repositorios completos, refactorizar código, generar pruebas y mantener sesiones de programación de larga duración, gracias a su contexto de 1M tokens y su capacidad de razonamiento multi-paso.
- Optimización de kernels GPU y compiladores: su capacidad para entender código de bajo nivel y generar implementaciones eficientes lo hace adecuado para tareas de HPC y optimización de rendimiento.
- Investigación automatizada: puede producir informes de investigación con visualizaciones interactivas, integrando datos de múltiples fuentes y generando dashboards, útil para analistas y científicos de datos.
- Edición de vídeo y diseño de movimiento: al procesar vídeo nativamente, puede asistir en tareas de edición, generación de animaciones y creación de contenido multimedia.
- Asistente de diseño asistido por ordenador (CAD): su capacidad de visión y razonamiento espacial permite interactuar con modelos 3D y generar diseños paramétricos.
- Análisis de documentos extensos: con 1M tokens de contexto, puede resumir, extraer información y responder preguntas sobre libros, informes anuales o expedientes legales completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluación comparativa (MMLU, HumanEval, GSM8K, etc.) ni referencias a métricas específicas. Se recomienda consultar el informe técnico completo (enlace en la sección de Enlaces) para obtener datos de rendimiento detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T parámetros totales, incluso en cuantización de 8 bits, el modelo requiere aproximadamente 2,8 TB de VRAM (sin contar overhead). En cuantización de 4 bits, se necesitarían alrededor de 1,4 TB. Esto supera con creces la capacidad de cualquier GPU individual.
- GPU recomendadas: se necesitan clústeres de GPUs de alta gama, como NVIDIA A100 (80 GB) o H100 (80 GB). Para cargar el modelo en 8 bits, se requerirían al menos 35 GPUs A100/H100 (asumiendo 80 GB cada una). En la práctica, se recomienda usar múltiples nodos con interconexión de alta velocidad (NVLink, InfiniBand).
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en estaciones de trabajo convencionales. Es un modelo diseñado para infraestructura de centro de datos.
- Opciones de despliegue: vLLM, TensorRT-LLM, o frameworks distribuidos como DeepSpeed o Megatron-LM. También es posible usar llama.cpp para cuantizaciones extremas, aunque la latencia sería prohibitiva.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera una latencia alta y un throughput limitado incluso con paralelismo de tensor y pipeline.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Kimi K3 se posiciona como el primer modelo abierto de clase 3T, pero no se han incluido comparaciones con alternativas como Kimi K2 (2T), DeepSeek-V3 o Llama 4. Se recomienda consultar el informe técnico para obtener una comparativa detallada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Limitaciones de contexto e idioma: aunque soporta 1M tokens, no se especifican los idiomas soportados. Es probable que el rendimiento sea superior en inglés y chino, dado el origen del desarrollador.
- Restricciones de licencia: la licencia Kimi K3 (license: other) puede imponer restricciones al uso comercial o a la redistribución. Es necesario revisar los términos completos antes de su uso en producción.
- Requisitos de hardware: el tamaño del modelo (2,8T parámetros) hace que su despliegue sea inviable para la mayoría de organizaciones, limitando su accesibilidad práctica.
- Advertencia para producción: al ser un modelo de vanguardia con arquitectura novedosa, puede haber problemas de estabilidad o compatibilidad con frameworks existentes. Se recomienda probar exhaustivamente antes de integrarlo en sistemas críticos.

## Enlaces

- HuggingFace: https://huggingface.co/i3zs/Kimi-K3
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Página del modelo en Kimi: https://www.kimi.ai/ai-models/kimi-k3
- Documentación de la API: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Repositorio de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
