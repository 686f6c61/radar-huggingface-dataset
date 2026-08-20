# S-Zenith/mamba3-research

## Resumen

Este repositorio, publicado por el usuario S-Zenith en Hugging Face, contiene los checkpoints y tensores intermedios generados durante el proyecto de investigación Mamba3. No se trata de un modelo final listo para inferencia, sino de un conjunto de artefactos de entrenamiento y experimentación: pesos de modelos causales diminutos, resultados de pruebas de cuantización (QAT, ablaciones, experimentos no lineales) y reproducciones de las variantes SISO y MIMO de Mamba-3. El objetivo declarado es facilitar la inspección local del flujo algorítmico, los perfiles de ejecución y los detalles de implementación, tal y como se documenta en el repositorio de código fuente asociado.

La relevancia actual radica en que Mamba-3 es una arquitectura de state space model (SSM) selectivo que promete mejoras en eficiencia de inferencia y precisión frente a Mamba-2 y Gated DeltaNet, según el artículo técnico correspondiente. Este repositorio permite a investigadores y desarrolladores examinar de primera mano los artefactos de dicha investigación, aunque no ofrece un modelo desplegable ni especificaciones completas de un modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State space model selectivo (familia Mamba-3), con variantes SISO y MIMO |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene experimentos de cuantizacion, pero no se enumeran los formatos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch (formato de archivo no especificado; probablemente .pt o .bin) |

## Arquitectura y entrenamiento

El repositorio contiene artefactos de un proyecto de investigación sobre Mamba-3, una arquitectura SSM selectiva que aborda tres limitaciones principales de Mamba-2: expresividad de la recurrencia, seguimiento de estado complejo y una variante MIMO (multi-input, multi-output) que mejora la precisión sin penalizar la velocidad de decodificación. Los checkpoints incluidos provienen de experimentos con el conjunto de datos Wikitext para pruebas de cuantización (QAT, ablaciones, no linealidades) y de un modelo causal diminuto de demostración. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El código fuente y la documentación completa están disponibles en el repositorio de GitHub vinculado.

## Capacidades

- No se documentan capacidades específicas del modelo en la información proporcionada.
- Al tratarse de checkpoints de investigación, no se puede afirmar que el modelo resultante tenga capacidades de generación de texto, razonamiento, código o tool calling sin una evaluación adicional.
- El repositorio incluye artefactos para reproducir experimentos de cuantización y análisis de arquitectura, lo que permite estudiar el comportamiento interno de Mamba-3, pero no ofrece un modelo listo para tareas concretas.

## Casos de uso

- Investigación en cuantización de SSM: los checkpoints de QAT y ablaciones permiten analizar el impacto de diferentes estrategias de cuantización en la precisión y el rendimiento de modelos Mamba-3, útil para optimizar despliegues en hardware con recursos limitados.
- Reproducción de experimentos académicos: investigadores pueden descargar los pesos y tensores intermedios para verificar los resultados publicados en el artículo de Mamba-3, especialmente en lo relativo a las variantes SISO y MIMO.
- Estudio de arquitecturas SSM: los checkpoints del modelo causal diminuto sirven como ejemplo didáctico para comprender el flujo de datos y las diferencias entre Mamba-2 y Mamba-3 sin necesidad de entrenar un modelo grande.
- Desarrollo de kernels optimizados: los tensores intermedios y los perfiles de ejecución pueden utilizarse para validar implementaciones personalizadas de kernels de atención o recurrencia en PyTorch o CUDA.
- Benchmarking de frameworks de inferencia: aunque no es un modelo de producción, los checkpoints pueden emplearse para probar la compatibilidad de librerías como vLLM o llama.cpp con arquitecturas SSM experimentales.
- Formación y divulgación: el repositorio sirve como material de referencia para cursos o talleres sobre modelos de estado, cuantización y reproducción de investigaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con otros modelos. El artículo de Mamba-3 menciona mejoras en precisión y eficiencia, pero esos datos no están vinculados directamente a estos checkpoints.

## Requisitos de hardware

- No se proporcionan requisitos de hardware específicos para este repositorio.
- Dado que contiene checkpoints de un modelo diminuto y tensores intermedios, es probable que quepan en GPUs de consumo (por ejemplo, 8-12 GB de VRAM), pero no hay confirmación oficial.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos. El repositorio no es un modelo final, sino un conjunto de artefactos de investigación. A nivel de arquitectura, Mamba-3 se compara en el artículo con Mamba-2 y Gated DeltaNet, pero esos resultados no están disponibles en este repositorio.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo listo para producción; es un conjunto de checkpoints y tensores de experimentos de investigación.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma, ya que no se ha evaluado el modelo para tareas específicas.
- La licencia MIT permite uso comercial, pero al no ser un modelo final, su uso en aplicaciones reales requeriría un entrenamiento o ajuste adicional.
- Los checkpoints pueden no ser compatibles con versiones recientes de PyTorch o con librerías de inferencia estándar, dado su carácter experimental.
- Falta documentación sobre el formato exacto de los archivos de pesos y sobre cómo cargarlos correctamente.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/S-Zenith/mamba3-research
- Repositorio de código fuente: https://github.com/S-Zenith/mamba3-research
- Artículo técnico de Mamba-3 (arXiv): https://arxiv.org/abs/2603.15569
- Implementación alternativa de Mamba-3 en PyTorch: https://github.com/rishikksh20/mamba3-pytorch
- Blog de Together AI sobre Mamba-3: https://www.together.ai/blog/mamba-3
