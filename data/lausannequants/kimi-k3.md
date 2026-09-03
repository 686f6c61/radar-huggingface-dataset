# lausannequants/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje de gran escala, abierto y nativamente multimodal, desarrollado por Moonshot AI. Con 2,8 billones de parámetros totales (2,78 T según los pesos reales), es el primer modelo abierto de la clase de 3 billones de parámetros. Está construido sobre una arquitectura MoE híbrida que combina Kimi Delta Attention (KDA), un mecanismo de atención lineal, con Attention Residuals (AttnRes), y activa 16 de los 896 expertos por token, lo que supone unos 104 000 millones de parámetros activos. Su ventana de contexto alcanza el millón de tokens y procesa texto, imágenes y vídeo de forma nativa.

El modelo está diseñado para tareas de razonamiento de largo horizonte, codificación extensa y trabajo de conocimiento agéntico, con capacidades de uso de herramientas y ejecución de acciones en entornos complejos. Su publicación como pesos abiertos bajo la licencia Kimi K3 lo convierte en una opción relevante para investigación y despliegue en infraestructuras de alto rendimiento, aunque su tamaño exige recursos de hardware considerables. La versión referenciada en este repositorio (lausannequants/Kimi-K3) incluye pesos en formato safetensors y etiquetas de cuantización de 8 bits, aunque no se detallan las variantes específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) híbrida con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2 779 931 837 184 (2,78 T) |
| Parametros activos | 104 000 000 000 (104 B) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | 8-bit (según etiquetas del repositorio; no se especifican más variantes) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (licencia propia de Moonshot AI, no OSI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 93 capas, de las cuales una es densa y el resto se distribuyen en 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated Multi-head Latent Attention (Gated MLA). La dimensión de atención es 7168 con 96 cabezas, y la dimensión latente del MoE es 3584. Cada experto tiene una dimensión oculta de 3072, y se activan 16 de los 896 expertos por token, lo que reduce el coste computacional efectivo. El framework Stable LatentMoE permite escalar la dispersión del MoE manteniendo estabilidad en el entrenamiento, logrando una mejora de aproximadamente 2,5 veces en eficiencia de escalado respecto a Kimi K2.

El modelo integra visión nativa, lo que significa que procesa imágenes y vídeo directamente en el mismo flujo de atención, sin módulos separados. No se han proporcionado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La información disponible indica que el modelo está orientado a tareas agénticas y de razonamiento prolongado, pero no se especifican los procedimientos de entrenamiento supervisado o de refuerzo.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de larga duración, con mantenimiento de coherencia a lo largo de contextos extensos.
- Codificación de largo horizonte: navegación de repositorios grandes, optimización de kernels GPU, desarrollo de compiladores, diseño de juegos con retroalimentación visual, CAD y diseño de chips.
- Trabajo de conocimiento agéntico: generación de informes de investigación con visualizaciones interactivas, widgets, paneles y edición de vídeo.
- Comprensión multimodal nativa de texto, imágenes y vídeo dentro del mismo modelo.
- Soporte de tool calling y uso de herramientas de terminal, lo que permite orquestar acciones en entornos de desarrollo.
- Capacidad de razonamiento multi-paso y planificación, adecuada para agentes autónomos con supervisión mínima.
- Soporte de contexto de 1 millón de tokens, útil para documentos extensos, repositorios completos o sesiones de trabajo prolongadas.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede trabajar en repositorios con decenas de miles de archivos, refactorizar código, escribir pruebas y ejecutar comandos de terminal, gracias a su ventana de 1M tokens y su capacidad de tool calling.
- Optimización de kernels GPU y compiladores: su razonamiento de largo horizonte permite iterar sobre código de bajo nivel, analizar rendimiento y proponer mejoras sin intervención humana constante.
- Investigación automatizada: puede generar informes técnicos con gráficos, tablas y visualizaciones interactivas, integrando datos de múltiples fuentes y presentando resultados en formatos editables.
- Diseño asistido por ordenador (CAD) y diseño de chips: al procesar imágenes y vídeo, puede interpretar planos, simular iteraciones y validar cambios visualmente.
- Creación de contenido multimedia: edición de vídeo, generación de animaciones y diseño de juegos, donde la entrada visual es esencial para iterar sobre el resultado.
- Asistencia en entornos de desarrollo integrado (IDE): como copiloto avanzado que mantiene el contexto de todo el proyecto, sugiere cambios, ejecuta pruebas y gestiona flujos de trabajo de CI/CD.
- Análisis de documentos legales o financieros extensos: su contexto de 1M tokens permite procesar contratos completos, informes anuales o expedientes, extrayendo información y generando resúmenes estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la etiqueta "eval-results" y la página web indica que el modelo ocupa el primer puesto en Frontend Code Arena, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados. No se incluyen datos numéricos verificables en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 2,78 T de parámetros totales, incluso con cuantización de 8 bits, el modelo requiere un clúster de GPUs de alta gama. Los 104 B de parámetros activos permiten inferencia con menos memoria que un modelo denso equivalente, pero sigue siendo inviable en una GPU de consumo.
- GPU recomendadas: no se especifican modelos concretos. Por el tamaño, se necesitarían múltiples GPUs como A100 80 GB, H100 80 GB o H200, con interconexión de alta velocidad (NVLink o InfiniBand).
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en estaciones de trabajo convencionales.
- Opciones de despliegue: no se indican frameworks específicos. Dado que el formato es safetensors y la librería es transformers, podría usarse vLLM o TGI con soporte MoE, pero no hay confirmación oficial. Para entornos con menos recursos, se necesitaría cuantización adicional (4 bits o menos) que no está documentada en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos. El predecesor Kimi K2, también de Moonshot AI, es el punto de referencia más cercano: Kimi K3 mejora la eficiencia de escalado en aproximadamente 2,5 veces, pero no se han publicado especificaciones detalladas de K2 en la información proporcionada. Otros modelos abiertos de gran tamaño como DeepSeek-V3 o Qwen2.5-Max podrían ser comparables, pero no se dispone de sus métricas en este contexto. Se recomienda consultar los informes técnicos oficiales para obtener datos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible. Como modelo entrenado con datos web, es probable que herede sesgos presentes en esos datos, pero no hay confirmación.
- Riesgo de alucinación: no se mencionan tasas de alucinación. Dado su tamaño y arquitectura, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: aunque soporta 1M tokens, no se especifican los idiomas cubiertos. La documentación está en inglés y chino, pero no hay lista oficial de idiomas.
- Restricciones de licencia: la licencia Kimi K3 es una licencia propia de Moonshot AI, no OSI. Puede imponer restricciones sobre uso comercial, redistribución o modificaciones. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso en producción.
- Requisitos de hardware: el tamaño del modelo (1561 GB en el repositorio) hace que el despliegue sea inviable para la mayoría de organizaciones sin infraestructura de clúster. La cuantización de 8 bits reduce el peso, pero sigue siendo un modelo de escala masiva.
- Fecha de publicación: el repositorio indica una fecha de creación de septiembre de 2026, lo que sugiere que el modelo es muy reciente y puede tener poca validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lausannequants/Kimi-K3
- Modelo original de Moonshot AI: https://huggingface.co/moonshotai/Kimi-K3 (referenciado en la model card)
- Página oficial del modelo: https://www.kimi.com/ai-models/kimi-k3
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Documentación de API: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Artículo de VentureBeat: https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems
