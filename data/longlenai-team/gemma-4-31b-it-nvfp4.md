# longlenai-team/gemma-4-31B-it-NVFP4

## Resumen

Gemma 4 31B IT NVFP4 es una versión cuantizada en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo instructivo multimodal Gemma 4 31B, desarrollado originalmente por Google DeepMind y empaquetado por el equipo de Unsloth bajo el identificador `longlenai-team/gemma-4-31B-it-NVFP4`. El modelo base es un transformer denso de 30.700 millones de parámetros (21.560 millones en los pesos safetensors publicados, probablemente por exclusión de embeddings o por el propio esquema de compresión) que acepta texto e imagen como entrada y genera texto, con una ventana de contexto de 256.000 tokens y soporte declarado de más de 140 idiomas.

La relevancia de esta ficha concreta reside en la cuantización: NVFP4 es un formato de 4 bits con escala a nivel de bloque y de tensor que NVIDIA introdujo para acelerar la inferencia en GPUs Blackwell, y que vLLM integra a partir de la versión 0.25 con kernels FlashInfer y CUTLASS. El resultado es un repositorio de 24,8 GB que reduce a la mitad el peso del modelo en 16 bits y permite servirlo en una sola GPU de 48 GB con margen para caché KV en contextos largos.

Conviene subrayar que esta es una conversión de terceros, no un checkpoint oficial de Google: la licencia declarada es Apache 2.0 con enlace a la licencia específica de Gemma 4, y el autor del empaquetado es Unsloth (los tags así lo indican), si bien el repositorio aparece bajo la organización `longlenai-team`. No hay descargas ni interacciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (sliding window local + atención global), p-RoPE y Keys/Values unificadas en capas globales |
| Parametros totales | 30,7B según la model card del modelo base; 21.562.226.660 en los safetensors publicados |
| Parametros activos | No aplica (variante densa; la MoE de la familia es el 26B A4B) |
| Longitud de contexto | 256.000 tokens (modelos medianos de la familia) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de NVIDIA); el repositorio contiene únicamente esta variante |
| Idiomas soportados | Más de 140 idiomas según la model card del modelo base; el repositorio no lista idiomas específicos |
| Licencia | Apache 2.0, con enlace a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors con compresión `compressed-tensors` (NVFP4) |
| Modalidades de entrada | Texto e imagen (sin audio en la variante 31B) |
| Capas | 60 |
| Ventana deslizante | 1024 tokens |
| Tamaño de vocabulario | 262.144 tokens |
| Parametros del codificador visual | ~550M |
| Tamaño del repositorio | 24,8 GB |
| Pipeline declarado | `image-text-to-text` |

## Arquitectura y entrenamiento

El modelo base emplea un transformer denso de 60 capas con un mecanismo de atención híbrido que intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global completa, garantizando que la última capa sea siempre global. Para contener el coste de memoria en contextos largos, las capas globales unifican las claves y los valores y aplican Proportional RoPE (p-RoPE), una variante de codificación posicional rotatoria que escala las frecuencias de forma proporcional a la posición. El codificador visual aporta unos 550 millones de parámetros y admite imágenes con relación de aspecto y resolución variables. La variante 31B no incluye codificador de audio, a diferencia de los modelos pequeños E2B y E4B.

La model card del modelo base indica que Gemma 4 se publica en variantes preentrenada e instructiva, con soporte nativo del rol `system`, modos de razonamiento configurables y function calling nativo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card sí menciona mejoras notables en benchmarks de código y capacidades agénticas respecto a la generación anterior.

Sobre esta base, el repositorio aplica una cuantización NVFP4: pesos de 4 bits con escalas compartidas por bloques y por tensor, pensada para los kernels de cuantización nativos de las GPU Blackwell. La model card del empaquetado advierte explícitamente de que no se use el backend Marlin (aproximadamente 2 veces más lento) y de que se deje que vLLM seleccione automáticamente el kernel NVFP4.

## Capacidades

- Generación de texto conversacional multi-turno con soporte nativo del rol `system` para estructurar el comportamiento del asistente.
- Razonamiento con modos de pensamiento configurables (thinking modes) heredados del modelo base instructivo.
- Comprensión de imágenes con relación de aspecto y resolución variables, incluyendo OCR, descripción de escenas y respuesta a preguntas visuales.
- Generación y edición de código, con mejoras declaradas en benchmarks de programación respecto a la generación anterior de Gemma.
- Razonamiento matemático y de múltiples pasos.
- Function calling y tool calling nativo, orientado a flujos agénticos autónomos.
- Capacidades multilingües en más de 140 idiomas según la model card del modelo base.
- Procesamiento de contexto largo de hasta 256.000 tokens, adecuado para documentos extensos, bases de código completas o historiales de conversación prolongados.
- No soporta audio en esta variante de 31B.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a los 256.000 tokens de contexto, y el rol `system` nativo permite fijar tono, políticas y restricciones de la empresa de forma estable durante toda la sesión.
- Análisis de documentos largos con componentes visuales: contratos, informes financieros o manuales técnicos con tablas y gráficos pueden enviarse como imagen y texto en una sola petición, aprovechando el codificador visual de ~550M de parámetros y la ventana de contexto extendida.
- Generación de código en producción: el soporte de function calling permite integrar el modelo en pipelines de CI/CD para revisión automática de parches, generación de tests o explicación de errores de compilación, con salida estructurada hacia herramientas internas.
- Agentes autónomos de múltiples pasos: la combinación de razonamiento configurable, tool calling y contexto largo lo hace apto para orquestar tareas que requieren consultar varias fuentes, razonar sobre los resultados y emitir acciones encadenadas.
- Asistencia técnica sobre documentación visual: soporte a usuarios que envían capturas de pantalla de errores o diagramas de arquitectura, con el modelo interpretando la imagen y cruzándola con documentación textual en contexto.
- Procesamiento por lotes de imágenes y texto en servidores con GPU Blackwell: al ser un checkpoint NVFP4 servible con vLLM, encaja en pipelines de enriquecimiento de catálogos, moderación de contenido visual o extracción de metadatos a gran escala donde el coste por token y la ocupación de VRAM son críticos.
- Investigación en eficiencia de cuantización: el repositorio sirve como referencia para evaluar la degradación de calidad de NVFP4 frente a FP16/BF16 en un modelo multimodal de 31B, comparando con los GGUF dinámicos de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del empaquetado remite a los benchmarks de cuantización de Unsloth Dynamic 2.0 GGUF y a la guía de NVFP4, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para esta conversión específica.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 ocupan aproximadamente 24,8 GB (tamaño del repositorio). Con caché KV para contexto largo hay que añadir varios GB; un presupuesto realista es de 32 a 48 GB para contextos moderados y de 80 GB o más para aprovechar los 256.000 tokens.
- GPU recomendadas: NVIDIA Blackwell (B200, GB200, RTX 5090 y familia RTX 50) para aprovechar los kernels NVFP4 nativos. En arquitecturas anteriores (Hopper H100, Ada RTX 4090) el soporte de NVFP4 es limitado o requiere emulación, con la consiguiente pérdida de rendimiento.
- Cabe en GPU de consumo: sí en RTX 5090 (32 GB) para contextos cortos y con cuantización ya aplicada; en RTX 4090 (24 GB) los pesos quedan al límite y no deja espacio práctico para caché KV de contexto largo.
- Opciones de despliegue: vLLM >= 0.25.0 con `flashinfer-python >= 0.6.13` y `nvidia-cutlass-dsl >= 4.5.2` es la vía documentada por el autor (`vllm serve unsloth/gemma-4-31B-it-NVFP4`). Para llama.cpp u Ollama habría que recurrir a los GGUF de Unsloth, no a este repositorio. TGI no está documentado para NVFP4 en la información disponible.
- Latencia y throughput estimados: no disponibles. La model card solo advierte de que el backend Marlin es aproximadamente 2 veces más lento que el kernel NVFP4 autoseleccionado por vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 31B IT NVFP4 (este) | 30,7B (21,56B en safetensors) | 256K | NVFP4 | Apache 2.0 (licencia Gemma 4) | Hugging Face, 0 descargas |
| Gemma 4 31B IT (original, Google) | 30,7B | 256K | BF16/FP16 | Apache 2.0 (licencia Gemma 4) | Hugging Face, colección oficial de Google |
| Gemma 4 26B A4B (MoE de la familia) | 26B totales, 4B activos | 256K | BF16/FP16, GGUF, NVFP4 | Apache 2.0 (licencia Gemma 4) | Hugging Face, colección oficial y Unsloth |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | BF16/FP16, GGUF | Apache 2.0 (licencia Gemma 4) | Hugging Face, orientado a dispositivo |

Frente al checkpoint oficial en 16 bits, esta conversión reduce el peso a la mitad a cambio de una posible degradación de calidad no cuantificada en la información disponible. Frente al 26B A4B, la variante MoE activa solo 4B parámetros por token y puede ofrecer mejor throughput en servidores con menos VRAM, aunque el 31B denso suele rendir mejor en tareas de razonamiento profundo. El E4B queda en otra categoría de despliegue (portátiles y móviles).

## Limitaciones y advertencias

- Es una cuantización de terceros: no es un checkpoint oficial de Google y no se han publicado evaluaciones de la degradación de calidad frente a BF16. En producción conviene validar la tarea concreta antes de sustituir el modelo original.
- El soporte de NVFP4 está atado al hardware Blackwell y a versiones concretas de vLLM, FlashInfer y CUTLASS; fuera de ese stack el rendimiento puede desplomarse o fallar directamente.
- La model card advierte de no usar el backend Marlin, que resulta aproximadamente 2 veces más lento.
- Riesgo de alucinación inherente a los modelos generativos, agravado en contextos muy largos donde la atención puede diluirse; no hay datos publicados sobre la fiabilidad de esta conversión en tareas de recuperación dentro de contexto.
- La licencia se declara como Apache 2.0, pero enlaza a la licencia específica de Gemma 4, que puede imponer condiciones adicionales de uso comercial y redistribución; conviene revisar el texto enlazado antes de desplegar en producto.
- El repositorio no declara idiomas soportados ni datos de sesgo; los sesgos del modelo base no están documentados en la información disponible.
- No incluye audio, a diferencia de los modelos E2B y E4B de la misma familia.
- El repositorio registra 0 descargas y 0 interacciones, por lo que no hay evidencia comunitaria de funcionamiento en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/longlenai-team/gemma-4-31B-it-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Guía de Unsloth para ejecutar NVFP4: https://unsloth.ai/docs/basics/nvfp4
- Guía de Unsloth para Gemma 4: https://unsloth.ai/docs/models/gemma-4
- Benchmarks de cuantización Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Unsloth Studio: https://unsloth.ai/docs/new/studio
- Colección de Unsloth con todas las versiones de Gemma 4: https://huggingface.co/collections/unsloth/gemma-4
- Colección oficial de Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
