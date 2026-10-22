# Leszekkkk/gemma-4-26B-A4B-it

## Resumen

`Leszekkkk/gemma-4-26B-A4B-it` es una publicación en Hugging Face de un fine-tune comunitario sobre `google/gemma-4-26B-A4B`, el modelo multimodal de arquitectura Mixture-of-Experts de la familia Gemma 4 desarrollada por Google DeepMind. El modelo procesa texto e imagen y genera texto, con 25,8 mil millones de parámetros totales según safetensors (25,2B según la model card de la familia) de los cuales solo 3,8B se activan por token, gracias a 8 expertos activos de 128 totales más uno compartido.

La relevancia técnica está en el equilibrio entre tamaño y coste de inferencia: al activar únicamente un subconjunto de ~4B de parámetros, ofrece un contexto nativo de 256K tokens y un vocabulario de 262K entradas con un coste de cómputo por token propio de un modelo de 4B, lo que lo sitúa en el rango de GPU de consumo para cuantizaciones de 4 bits. La arquitectura emplea atención híbrida que intercala ventanas deslizantes locales de 1024 tokens con capas de atención global, claves y valores unificados en las capas globales y Proportional RoPE para controlar el coste de memoria en contextos largos.

Este repositorio concreto es un remaquetado/ajuste del modelo oficial: mantiene la licencia declarada apache-2.0 y la plantilla de model card de Google, pero no documenta qué datos de ajuste se han usado, no incluye resultados de evaluación propios y acumula 0 descargas y 0 likes desde su creación el 21 de octubre de 2026. Para producción conviene evaluar el modelo oficial `google/gemma-4-26B-A4B-it` como referencia y tratar esta variante como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (ventana deslizante local de 1024 tokens + atención global intercalada, última capa siempre global) y Mixture-of-Experts |
| Parametros totales | 25.805.936.206 según safetensors (~25,8B); la model card de la familia declara 25,2B |
| Parametros activos | 3,8B (8 expertos activos de 128 totales + 1 compartido) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en el repositorio: solo se publican pesos safetensors. Al ser pesos estándar de transformers son cuantificables a FP8, INT8 y 4 bits con herramientas habituales, pero el autor no distribuye versiones cuantizadas |
| Idiomas soportados | Más de 140 idiomas según la model card de la familia Gemma 4; no verificado para este fine-tune concreto |
| Licencia | apache-2.0 en los metadatos, con `license_link` apuntando a la licencia de Gemma 4 (ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (librería transformers) |
| Modalidades de entrada | Texto e imagen (sin audio en esta variante) |
| Modalidades de salida | Texto |
| Capas | 30 |
| Ventana de atención local | 1024 tokens |
| Vocabulario | 262K tokens |
| Encoder de visión | ~550M parámetros |
| Tamaño del repositorio | 51,6 GB |
| Modelo base | google/gemma-4-26B-A4B |

## Arquitectura y entrenamiento

El modelo sigue el diseño MoE de Gemma 4: 30 capas de decoder con 128 expertos por capa, de los que se activan 8 más uno compartido en cada token, lo que da 3,8B de parámetros activos sobre 25,2B totales. La atención es híbrida: la mayoría de capas usan atención local con ventana deslizante de 1024 tokens y se intercalan capas de atención global, garantizando que la última capa sea siempre global para preservar la coherencia en contextos largos. Las capas globales emplean claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el coste de memoria del caché KV a 256K tokens. La torre de visión añade unos 550M de parámetros y procesa imágenes con soporte de relación de aspecto y resolución variables.

La familia Gemma 4 incorpora además un modelo draft dedicado para decodificación especulativa (multi-token prediction), soporte nativo del rol `system` en la plantilla de conversación y modos de razonamiento (thinking) configurables. Según la documentación de Google, los modelos se distribuyen en variantes preentrenada e instruction-tuned.

No hay información disponible sobre la composición del dataset de preentrenamiento, el número de tokens, las etapas de RLHF/DPO ni sobre el proceso de ajuste aplicado por el autor de este repositorio. Tampoco se documenta si el fine-tune modificó la torre de visión o solo el decoder.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking activable y desactivable.
- Comprensión de imágenes: entrada image-text-to-text con soporte de relación de aspecto y resolución variables.
- Procesamiento de vídeo como entrada según la documentación de terceros consultada (AkashML); no confirmado en la model card del autor.
- Generación de código y tareas de matemáticas, reforzadas en esta generación según Google.
- Function calling / tool calling nativo, orientado a flujos agénticos.
- Soporte nativo del rol `system` para separar instrucciones persistentes del turno de usuario.
- Capacidades multilingües declaradas para más de 140 idiomas (heredadas de la familia, sin verificación específica en este fine-tune).
- Decodificación especulativa mediante modelo draft, con supuesto incremento de velocidad sin pérdida de calidad según la documentación de Gemma 4.
- Contexto largo de hasta 256K tokens para documentos extensos o conversaciones multi-turno prolongadas.
- No soporta audio: esa modalidad está limitada a los modelos E2B, E4B y 12B de la familia.

## Casos de uso

- Análisis de documentación técnica extensa: ingesta de manuales o contratos de decenas de miles de tokens en una sola pasada gracias a la ventana de 256K, con extracción estructurada de cláusulas o secciones.
- Atención al cliente multi-turno: conversaciones largas con historial persistente en el rol `system` y contexto acumulado, sin truncar el hilo conversacional.
- Automatización de back office con documentos escaneados: el modelo recibe la imagen de una factura o albarán y devuelve campos estructurados en JSON mediante tool calling.
- Agentes de navegación y automatización: encadenamiento de llamadas a funciones externas (APIs, bases de datos) con razonamiento intermedio en modo thinking antes de ejecutar la acción.
- Asistencia a desarrollo en IDE: autocompletado y refactorización con contexto de repositorio, aprovechando la ventana larga para incluir varios ficheros relacionados en el prompt.
- Moderación y clasificación de contenido multimodal: etiquetado de publicaciones con imagen y texto, con coste de inferencia reducido al activar solo 3,8B por token.
- Procesamiento batch en GPU de consumo: despliegues de una sola máquina con cuantización de 4 bits para tareas de resumen o extracción sobre volúmenes medios de documentos.
- Investigación sobre eficiencia MoE: base para experimentos de ajuste fino comparando el comportamiento de expertos en un modelo abierto de 26B con activación de ~4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio reproduce la plantilla de Google sin tabla de evaluaciones, y el autor no aporta métricas propias pese a la etiqueta `eval-results`. Tampoco se dispone de cifras de latencia o throughput medidas para este fine-tune.

## Requisitos de hardware

- VRAM estimada para pesos en BF16: ~51,6 GB (25,8B × 2 bytes). Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU. No cabe en GPU de consumo sin cuantizar.
- VRAM estimada en FP8/INT8: ~26 GB de pesos, más caché KV. Encaja en A100 40GB, L40S 48GB o RTX 6000 Ada 48GB.
- VRAM estimada en 4 bits: ~14-16 GB de pesos, más caché KV. Cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 5090 (32 GB), con margen variable según longitud de contexto.
- Caché KV: crece con el contexto y es el factor limitante real a 256K tokens. El diseño híbrido con ventana deslizante de 1024, claves y valores unificados y p-RoPE reduce el coste frente a atención completa, pero no se han publicado cifras exactas de memoria por token.
- Cómputo por token: al activar 3,8B de parámetros, el coste de decodificación es sensiblemente menor que el de un denso de 26B, lo que mejora el throughput en entornos con poca GPU.
- Opciones de despliegue: transformers (formato publicado) y, previsiblemente, vLLM y TGI para servir el modelo; llama.cpp u Ollama requerirían una conversión a GGUF que el autor no distribuye.
- GPU recomendadas: H100 80GB o A100 80GB para BF16 con contexto largo; L40S o A100 40GB para FP8/INT8; RTX 4090 o RTX 3090 para 4 bits con contextos moderados.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Leszekkkk/gemma-4-26B-A4B-it) | 25,8B / 3,8B | 256K | Texto, imagen | apache-2.0 (con `license_link` a Gemma 4) | Fine-tune comunitario, 0 descargas |
| google/gemma-4-26B-A4B-it | 25,2B / 3,8B | 256K | Texto, imagen | Apache 2.0 / licencia Gemma 4 | Modelo oficial de Google DeepMind |
| Gemma 4 31B Dense | 30,7B / denso | 256K | Texto, imagen | Apache 2.0 / licencia Gemma 4 | Modelo oficial de Google DeepMind |
| Gemma 4 12B Unified | 11,95B / denso | 256K | Texto, imagen, audio | Apache 2.0 / licencia Gemma 4 | Modelo oficial de Google DeepMind |

Frente al 31B Dense, este MoE activa una décima parte de parámetros por token, lo que reduce el coste de inferencia a cambio de depender del enrutado de expertos. Frente al 12B Unified, gana parámetros totales y mantiene contexto de 256K, pero pierde la modalidad de audio y la arquitectura sin encoder. No se dispone de datos de benchmarks para comparar calidad entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ambigüedad de licencia: los metadatos declaran apache-2.0, pero el `license_link` apunta a la licencia específica de Gemma 4, que impone términos de uso adicionales. Antes de un uso comercial hay que verificar qué licencia aplica realmente al modelo base redistribuido.
- Sin datos de entrenamiento del fine-tune: se desconoce qué datos se usaron para el ajuste, qué comportamiento se modificó y si se preservaron las salvaguardas del modelo original.
- Sin evaluaciones: no hay benchmarks ni pruebas de regresión publicadas para esta variante, por lo que no puede afirmarse que mantenga la calidad del modelo oficial.
- Riesgo de alucinación inherente a los modelos generativos, agravado en contextos de 256K donde la información relevante puede quedar diluida.
- Sesgos no evaluados: la model card reproducida no incluye la sección de riesgos y limitaciones que sí aparece en la del modelo base de Google.
- Idiomas: la cobertura de 140+ idiomas es una afirmación heredada de la familia; el fine-tune no la verifica y el rendimiento en castellano o lenguas cooficiales es desconocido.
- Sin soporte de audio en esta variante, a diferencia de los modelos E2B, E4B y 12B.
- Adopción nula: 0 descargas y 0 likes, creado y actualizado el mismo día (21 de octubre de 2026), sin issues ni discusión pública que permitan inferir estabilidad.
- Coste de memoria del contexto largo: a 256K tokens el caché KV puede dominar el presupuesto de VRAM incluso con el diseño híbrido, lo que obliga a limitar la longitud efectiva en GPU de consumo.
- Para producción se recomienda usar el checkpoint oficial de Google y tratar este repositorio como material de experimentación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Leszekkkk/gemma-4-26B-A4B-it
- Modelo base (preentrenado): https://huggingface.co/google/gemma-4-26B-A4B
- Modelo oficial instruction-tuned: https://huggingface.co/google/gemma-4-26B-A4B-it
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Página de modelos Gemma (multi-token prediction, decodificación especulativa): https://gemma.ai/models/gemma-4/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Ficha en Gemini Enterprise Agent Platform: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Ficha y precios de API en AkashML: https://akashml.com/models/gemma-4-26b-a4b-it
