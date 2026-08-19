# Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-text-mlx

## Resumen

El modelo `Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-text-mlx` es una conversión comunitaria al formato MLX con cuantización MXFP8 del checkpoint `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, un modelo de la familia Qwen3.5/3.8 que ha sido sometido a un proceso de "abliteration" (eliminación de la alineación de seguridad). El autor, Shiftedx, ha producido esta versión para permitir su ejecución en hardware Apple Silicon mediante la librería MLX, manteniendo la arquitectura densa de 64 capas de lenguaje y una ventana de contexto configurada de 262 144 tokens.

La relevancia de este modelo radica en ofrecer una alternativa cuantizada a 8 bits (MXFP8) de un modelo de 27 000 millones de parámetros, lo que reduce los requisitos de memoria y facilita su despliegue en entornos con memoria unificada de Apple. Sin embargo, se trata de una conversión experimental de un checkpoint intencionalmente no alineado, por lo que el autor advierte explícitamente sobre los riesgos de generar contenido inseguro o ilegal y traslada la responsabilidad legal y de seguridad al operador.

Al ser una conversión de pesos, no incorpora innovaciones de entrenamiento, pero sí una cuantización específica para MLX que preserva el tokenizer, la plantilla de chat y la licencia Apache-2.0 del modelo original. No se incluyen pesos de visión, por lo que es exclusivamente un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Qwen3.5-family hybrid attention/GDN, 64 language layers |
| Parametros totales | 27B (nominal); el archivo safetensors reporta 7 566 401 024 parametros (posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (configurado, no exhaustivamente cualificado) |
| Tipos de cuantizacion | MXFP8 (8 bits, group size 32) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors con cuantizacion MXFP8) |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero; es una conversión de pesos del checkpoint `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, que a su vez deriva de un modelo base de la familia Qwen3.5/3.8. La arquitectura es densa, con una combinación de atención híbrida y capas GDN (Gated Delta Network, presumiblemente), distribuidas en 64 capas de lenguaje. El proceso de "abliteration" elimina las capas o pesos responsables de la alineación de seguridad, dando como resultado un modelo sin restricciones de contenido.

La conversión a MXFP8 se realizó con el adaptador de streaming de MLX-LM versión 0.31.3, partiendo directamente del padre BF16. Se generaron tanto MXFP4 como MXFP8, aunque esta ficha se centra en la versión MXFP8. El artefacto resultante tiene un tamaño indexado de 25.85 GiB y no incluye sidecar MTP (Multi-Token Prediction) ni metadatos activos de MTP. Se preservaron el tokenizer, la plantilla de chat y los metadatos del procesador, así como la línea de licencia Apache-2.0.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO, ya que son datos del modelo base original y no se detallan en la documentación de esta conversión.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5/3.8.
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación, aunque es probable que se herede del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta conversión.
- Multilingüismo: no especificado; se desconoce el alcance real de idiomas soportados.
- Sin soporte de visión: los pesos de visión fueron omitidos deliberadamente en esta conversión.
- Sin alineación de seguridad: al ser un checkpoint abliterated, el modelo no presenta mecanismos de rechazo de contenido dañino o ilegal.
- Modo de pensamiento (thinking mode): no documentado.

## Casos de uso

- Investigación sobre alineación y seguridad de modelos: al ser un modelo sin censura, permite estudiar el comportamiento de un LLM sin restricciones en entornos controlados y aislados, con fines académicos.
- Generación de texto creativo sin filtros: escritura de ficción, poesía o guiones que requieran explorar temas tabú o controvertidos, siempre bajo supervisión humana y con los debidos controles de acceso.
- Evaluación de técnicas de cuantización MXFP8 en MLX: sirve como banco de pruebas para medir el impacto de la cuantización de 8 bits en la calidad de generación y el rendimiento en Apple Silicon.
- Desarrollo de aplicaciones de chat privadas y locales: integración en entornos donde se requiera un modelo de gran tamaño con contexto largo (262K tokens) y sin dependencia de servicios en la nube, asumiendo la responsabilidad de moderación.
- Pruebas de robustez y detección de sesgos: análisis de cómo un modelo sin alineación responde a entradas maliciosas o provocadoras, útil para desarrollar sistemas de moderación más eficaces.
- Experimentación con generación de código y razonamiento matemático: aunque no hay benchmarks publicados, el modelo base Qwen3.5 tiene capacidades conocidas en estas áreas; esta versión cuantizada permite probarlas en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para esta conversión específica. El autor no proporciona comparativas de rendimiento con el modelo BF16 original ni con otras cuantizaciones.

## Requisitos de hardware

- Al ser un modelo en formato MLX, está diseñado para ejecutarse en Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- El tamaño del artefacto indexado es de 25.85 GiB, por lo que se recomienda un mínimo de 32 GB de memoria unificada para cargar el modelo y dejar margen para el contexto y la generación.
- En equipos con 64 GB o más, se puede aprovechar plenamente la ventana de contexto de 262 144 tokens, aunque no se ha verificado su funcionamiento exhaustivo.
- No es adecuado para GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (GGUF, etc.), ya que la librería MLX es exclusiva de Apple.
- Opciones de despliegue: mediante `mlx_lm.generate` (como se muestra en la documentación) o integración en aplicaciones que usen MLX-LM.
- No se proporcionan datos de latencia ni throughput. Al ser una cuantización de 8 bits, se espera un rendimiento razonable en chips Apple Silicon, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` es la referencia directa, pero no se han publicado comparativas de rendimiento, calidad o velocidad entre la versión BF16 y esta conversión MXFP8. Tampoco se conocen otras conversiones MLX de modelos Qwen3.8 con cuantización MXFP8 en el momento de redactar esta ficha. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Modelo abliterated: carece de alineación de seguridad, por lo que puede generar contenido violento, sexual, ilegal o dañino sin restricciones. El autor advierte explícitamente de este riesgo.
- Cuantización experimental: la conversión MXFP8 no ha sido exhaustivamente cualificada; el contexto de 262 144 tokens está configurado pero no verificado en su totalidad.
- Sin soporte de visión: los pesos de visión fueron omitidos, por lo que no puede procesar imágenes.
- Idiomas no especificados: se desconoce el alcance multilingüe real del modelo.
- Discrepancia en el número de parámetros: el nombre indica 27B, pero el archivo safetensors reporta 7 566 401 024 parámetros, lo que sugiere un posible error en la metadata o una interpretación diferente. Esto debe tenerse en cuenta al dimensionar recursos.
- Responsabilidad legal: el operador es responsable de cumplir las leyes aplicables y de implementar controles de acceso, moderación y revisión humana en cualquier despliegue.
- Licencia Apache-2.0: permite uso comercial, pero no exime de las responsabilidades derivadas del contenido generado.

## Enlaces

- Modelo en HuggingFace: [Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-text-mlx](https://huggingface.co/Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-text-mlx)
- Modelo base: [AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16](https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16)
