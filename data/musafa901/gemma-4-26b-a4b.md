# musafa901/gemma-4-26B-A4B

## Resumen

Gemma 4 26B A4B es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Google DeepMind, publicado bajo licencia Apache 2.0. Este repositorio concreto (`musafa901/gemma-4-26B-A4B`) es una subida de un usuario independiente que replica los pesos oficiales, con 25.805.936.206 parámetros totales (25,8B) y solo 3,8B activos por token, lo que lo hace especialmente eficiente en inferencia. El modelo acepta entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 256K tokens, y soporta más de 140 idiomas.

Su relevancia radica en combinar un tamaño de pesos manejable (25,8B) con una activación reducida (3,8B), lo que permite desplegarlo en GPUs de consumo con cuantización, manteniendo capacidades de razonamiento, codificación y agentes. La arquitectura MoE con 128 expertos y atención híbrida (sliding window + global) optimiza el uso de memoria en contextos largos. Es una opción atractiva para desarrolladores que necesitan un modelo abierto, multimodal y con licencia permisiva para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (128 expertos, 8 activos + 1 compartido) y atención híbrida (sliding window + global) |
| Parametros totales | 25.805.936.206 (25,8B) |
| Parametros activos | 3,8B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No especificados en el repo; los pesos están en safetensors (probablemente BF16/FP16) |
| Idiomas soportados | Más de 140 (según la model card oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 30 capas, donde cada capa tiene 128 expertos y se activan 8 más un experto compartido. La atención combina ventanas deslizantes de 1024 tokens con atención global en capas específicas, y utiliza Proportional RoPE (p-RoPE) junto con claves y valores unificados para reducir el uso de memoria en contextos largos. El vocabulario es de 262K tokens. Para entrada de imágenes, incorpora un encoder de visión de aproximadamente 550M parámetros.

No se dispone de información detallada sobre el proceso de entrenamiento en la documentación proporcionada: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card oficial menciona que existen variantes pre-trained e instruction-tuned, pero este repositorio no indica cuál de ellas contiene. Tampoco se detallan innovaciones adicionales más allá de las arquitectónicas ya citadas.

## Capacidades

- Procesamiento multimodal: acepta texto e imágenes (con soporte de resolución y ratio de aspecto variable) y genera texto.
- Razonamiento avanzado: incluye modos de pensamiento configurables (thinking mode) que permiten activar o desactivar el razonamiento explícito.
- Generación de código: mejoras notables en benchmarks de codificación, aunque no se aportan cifras concretas.
- Function calling nativo: soporte integrado para llamadas a herramientas, lo que facilita la construcción de agentes autónomos.
- Soporte de agentes: diseñado para flujos multi-paso y uso de herramientas externas.
- Multilingüe: cobertura de más de 140 idiomas.
- System prompt nativo: soporte del rol `system` para control estructurado de la conversación.
- Contexto largo: ventana de 256K tokens, adecuada para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de 256K tokens, puede mantener conversaciones largas con historial completo y contexto de documentos de soporte, reduciendo la pérdida de información en interacciones prolongadas.
- Generación de código en producción: con function calling nativo, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, y conectarse a APIs de repositorios o herramientas de testing.
- Análisis de documentos con imágenes: al aceptar entrada de imagen, puede extraer información de capturas, diagramas o formularios escaneados, combinándola con texto para tareas de resumen o extracción de datos.
- Agentes autónomos de investigación: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que buscan información en la web, consultan bases de datos y sintetizan resultados.
- Asistente de programación local: con cuantización a 4 bits, puede ejecutarse en una GPU de 24 GB (por ejemplo, RTX 3090/4090) para ofrecer asistencia de código sin conexión, manteniendo baja latencia gracias a los 3,8B de parámetros activos.
- Traducción y localización: su soporte multilingüe (más de 140 idiomas) lo hace útil para traducir contenido técnico o documentación, con capacidad de manejar contextos extensos.
- Resumen de largas conversaciones o informes: la ventana de 256K permite procesar libros, logs o transcripciones completas en una sola pasada, generando resúmenes coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras en codificación y razonamiento, pero no proporciona cifras concretas (MMLU, HumanEval, GSM8K, etc.). Tampoco se encuentran datos de rendimiento en la búsqueda web realizada.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de VRAM, GPUs recomendadas o throughput.
- El tamaño del repositorio es de 51,6 GB, lo que sugiere pesos en BF16/FP16. Para cargar todos los pesos en esa precisión se necesitarían aproximadamente 52 GB de VRAM, lo que excede las GPUs de consumo típicas.
- Con cuantización a 4 bits (por ejemplo, GGUF o AWQ), el modelo podría caber en una GPU de 24 GB (RTX 3090/4090), aunque no se proporcionan archivos cuantizados en este repositorio.
- Para despliegue en servidores, se recomendarían GPUs como A100 (80 GB) o H100 para inferencia sin cuantizar, o usar frameworks como vLLM o TGI que soporten MoE.
- Dado que solo se activan 3,8B parámetros por token, la latencia de generación es menor que la de un modelo denso de 25B, pero la memoria necesaria para los pesos completos sigue siendo alta.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para realizar una comparativa con otros modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B o Qwen MoE). No se han encontrado datos de rendimiento relativos en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Este repositorio es una subida de un usuario independiente (musafa901), no un lanzamiento oficial de Google DeepMind. Tiene 0 descargas y 0 likes, por lo que se recomienda verificar la integridad de los pesos antes de usarlo en producción.
- No se especifica si los pesos corresponden a la variante pre-trained o instruction-tuned, lo que afecta al comportamiento esperado.
- No se documentan sesgos específicos, pero como modelo entrenado con datos web, puede presentar sesgos de género, raza o cultura, y riesgo de alucinación en tareas factuales.
- La ventana de 256K tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el coste de memoria aumenta.
- Aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se deben revisar los términos de la licencia de Gemma 4 (enlazada en la model card) para posibles restricciones adicionales.
- No hay garantía de soporte ni mantenimiento por parte del autor del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/musafa901/gemma-4-26B-A4B
- Página oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Google AI: https://ai.google.dev/gemma/docs/core/model_card_4
- Technical report (arXiv): https://arxiv.org/abs/2607.02770
- Análisis en artificialanalysis.ai: https://artificialanalysis.ai/models/releases/gemma-4-26b-a4b
- Repositorio de NVIDIA con cuantización NVFP4: https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
