# mstyslavity/JOSIE-2-9B-OSS-mlx-fp16

## Resumen

JOSIE-2-9B-OSS-mlx-fp16 es una conversión a formato MLX (Apple Silicon) del modelo JOSIE-2-9B-OSS, desarrollado por Gökdeniz Gülmez y convertido por Mstyslav Kazakov. El modelo original pertenece a la familia JOSIE-2, una colección de modelos de lenguaje que, según las declaraciones del autor, compite con modelos de aproximadamente el doble de tamaño. Esta versión específica está pensada para ejecutarse eficientemente en hardware Apple mediante la librería mlx-lm, manteniendo los pesos en precisión fp16.

El modelo tiene 8.95 mil millones de parámetros y soporta cinco idiomas: inglés, árabe, chino, japonés y portugués. Su licencia MIT permite uso comercial sin restricciones significativas. Aunque la información técnica detallada sobre su arquitectura y entrenamiento es limitada, los benchmarks declarados por el autor muestran resultados notables en ARC-Challenge (94.2% de precisión) y TruthfulQA (76.7%), lo que sugiere un buen equilibrio entre razonamiento y veracidad. Es relevante ahora por su disponibilidad en formato MLX, que facilita su despliegue en entornos Apple con bajo consumo de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio sugieren una base Qwen3.5, sin confirmar) |
| Parametros totales | 8.953.801.728 (8,95 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (este repositorio); existen versiones cuantizadas (p. ej. oQ8) según benchmarks externos |
| Idiomas soportados | en, ar, zh, ja, pt |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura interna del modelo base JOSIE-2-9B-OSS. Los tags del repositorio incluyen "qwen3_5", lo que sugiere una posible derivación de la arquitectura Qwen 3.5, pero no hay confirmación oficial. El modelo es un transformer decoder-only de 8,95 mil millones de parámetros, sin indicios de mezcla de expertos (MoE). Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO. La conversión a MLX se realizó con mlx-lm versión 0.31.2, manteniendo los pesos originales en fp16.

## Capacidades

- Generación de texto y conversación multilingüe en cinco idiomas (inglés, árabe, chino, japonés y portugués).
- Soporte de razonamiento: los benchmarks del autor incluyen modos "reasoning" y "non-reasoning", aunque los valores del modo reasoning no se han publicado. Un benchmark externo (oMLX) sugiere la existencia de un modo "thinking" activable.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, como corresponde a un modelo de tipo chat.
- No se ha documentado soporte explícito para tool calling, function calling, agentes o visión.
- El modelo está optimizado para ejecución en Apple Silicon mediante MLX, lo que permite inferencia local eficiente.

## Casos de uso

- Asistente conversacional multilingüe: gracias a su soporte de cinco idiomas y su licencia MIT, puede integrarse en aplicaciones de atención al cliente o asistentes personales que requieran respuestas en árabe, chino, japonés, portugués o inglés.
- Generación de contenido creativo: su tamaño de 9B y su entrenamiento conversacional lo hacen adecuado para redactar artículos, guiones o material de marketing en varios idiomas, con un equilibrio entre calidad y coste computacional.
- Traducción automática: aunque no está especializado en traducción, su capacidad multilingüe permite usarlo como base para sistemas de traducción asistida, especialmente en combinación con plantillas de prompt.
- Resumen de documentos: puede procesar textos largos (si se conoce su contexto, aunque no está documentado) y generar resúmenes concisos, útil para análisis de informes o artículos.
- Educación y tutoría: su capacidad de razonamiento (evidenciada en ARC-Challenge) lo hace útil para explicar conceptos, resolver dudas y generar ejercicios en entornos educativos.
- Prototipado rápido en investigación: al ser un modelo de 9B con licencia permisiva, es adecuado para experimentar con técnicas de prompting, fine-tuning o evaluación en entornos académicos sin restricciones de uso.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor del modelo en la model card de HuggingFace. No se han verificado de forma independiente.

| Benchmark | Métrica | Modo non-reasoning | Modo reasoning |
|---|---|---|---|
| ARC-Challenge | Accuracy | 94,2 | no disponible |
| TruthfulQA | Accuracy | 76,7 | no disponible |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio en fp16 ocupa 17,9 GB, por lo que se necesitan al menos 18 GB de memoria para cargar los pesos completos. Con cuantización a 8 bits (oQ8), el requisito baja a aproximadamente 9-10 GB.
- GPU recomendadas: en Apple Silicon, un chip M2 Max (30 núcleos GPU) con 32 GB de memoria unificada es suficiente para fp16, como muestra un benchmark externo. En GPUs de consumo, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden ejecutar el modelo en fp16; para cuantización 8-bit bastaría con 12-16 GB (p. ej. RTX 4070 Ti o similar).
- Compatibilidad con consumer GPUs: sí, siempre que se use cuantización o se disponga de suficiente VRAM.
- Opciones de despliegue: la vía principal es mlx-lm (librería oficial para Apple Silicon). También es posible convertir los pesos a GGUF para usarlos con llama.cpp u Ollama, aunque no hay soporte oficial documentado para vLLM o TGI.
- Latencia y throughput: no se han publicado datos específicos. El benchmark de oMLX en M2 Max sugiere que es viable para inferencia interactiva, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (9B, multilingües, licencia MIT). El autor afirma que JOSIE-2-9B-OSS supera a modelos de aproximadamente el doble de tamaño, pero no se han publicado los resultados detallados de esas comparaciones. Por tanto, esta sección queda pendiente de datos verificables.

## Limitaciones y advertencias

- No se ha documentado la arquitectura interna ni el proceso de entrenamiento, lo que dificulta evaluar su comportamiento en tareas específicas o prever sesgos.
- Los benchmarks publicados son solo dos (ARC-Challenge y TruthfulQA) y no cubren áreas como código, matemáticas o razonamiento complejo. El modo "reasoning" no tiene valores publicados.
- Al ser un modelo de 9B, puede presentar alucinaciones o errores en tareas que requieren conocimiento factual profundo o razonamiento de múltiples pasos.
- La longitud de contexto no está especificada, lo que limita su uso en aplicaciones que requieran manejar documentos extensos.
- Aunque la licencia MIT permite uso comercial, el modelo base no tiene una documentación exhaustiva sobre posibles sesgos lingüísticos o culturales, especialmente en los idiomas menos representados (árabe, japonés, portugués).
- El repositorio actual tiene 0 descargas y 0 likes, lo que sugiere que es una conversión reciente y poco probada en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mstyslavity/JOSIE-2-9B-OSS-mlx-fp16
- Modelo base: https://huggingface.co/Goekdeniz-Guelmez/JOSIE-2-9B-OSS
- Perfil del autor de la conversión: https://huggingface.co/mstyslavity
- Perfil del autor del modelo original: https://github.com/Goekdeniz-Guelmez/
- Benchmark externo en oMLX: https://omlx.ai/benchmarks/performance/womjn1pd
