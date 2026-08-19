# dots-studio/dots3-note-prev-fp8

## Resumen

dots3-note preview es el primer modelo de pesos abiertos de la familia dots3, desarrollado por Dots Studio, el laboratorio de inteligencia artificial lanzado por Xiaohongshu a principios de 2025. Se trata de un modelo multimodal de arquitectura Mixture-of-Experts (MoE) con 280 mil millones de parámetros totales y 16 mil millones activos por token, diseñado para ofrecer un equilibrio entre capacidad, latencia y coste de inferencia dentro de su familia. Acepta entradas de texto, imagen, vídeo y audio, y genera únicamente texto.

El modelo destaca por su ventana de contexto de hasta 512 000 tokens, lo que le permite procesar documentos extensos, conversaciones largas y tareas de razonamiento multi-paso. Está optimizado para conocimiento general, razonamiento matemático y lógico, uso de herramientas, flujos de trabajo agénticos, generación de código, comprensión multimodal y procesamiento de contexto largo. Esta versión `prev-fp8` es la cuantización en FP8 del checkpoint original, pensada para reducir los requisitos de memoria y acelerar la inferencia en entornos de producción.

La familia dots3 está concebida para cubrir diferentes puntos de equilibrio entre capacidad, latencia y coste, y dots3-note preview es el miembro más ligero de la misma. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para equipos que necesitan un modelo multimodal de gran tamaño con despliegue flexible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal MoE (Transformer con atención DSA y SWA) |
| Parametros totales | 280B (288 443 400 864 según safetensors, incluye encoders y MTP) |
| Parametros activos | 16B (más 1,13B del MTP compartido) |
| Longitud de contexto | 512 000 tokens |
| Tipos de cuantizacion | BF16, FP8 |
| Idiomas soportados | No disponible (documentación en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

dots3-note preview utiliza una arquitectura de Mezcla de Expertos (MoE) multimodal con 1 capa densa seguida de 45 capas MoE. Cada capa MoE dispone de 256 expertos enrutados más 1 experto compartido, con top-8 seleccionados por token. El tamaño oculto es de 5120 y el FFN oculto de 13824 para la capa densa y 1536 por experto. La atención combina 13 capas con Deep Sparse Attention (DSA) y 33 capas con Sliding Window Attention (SWA), en proporción aproximada 1:3, lo que permite manejar ventanas de contexto de 512K tokens con coste computacional reducido. El vocabulario alcanza 152 000 entradas.

El modelo incorpora dos codificadores multimodales: un Vision Encoder basado en MoE ViT de 7B parámetros totales (1,2B activos) para imágenes, vídeo y documentos, y un Audio Encoder denso de 800M parámetros para audio. Además, incluye una capa de Multi-Token Prediction (MTP) compartida de 1,13B parámetros que permite predecir varios tokens a la vez, mejorando la eficiencia de decodificación. No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados o las técnicas de alineación (RLHF, DPO, etc.) en la información disponible.

## Capacidades

- Generación de texto y seguimiento de instrucciones en tareas de conocimiento general.
- Razonamiento matemático y lógico, incluyendo problemas de varios pasos.
- Uso de herramientas (tool calling) y flujos de trabajo agénticos multi-paso.
- Tareas interactivas que requieren exploración, actualización de memoria y adaptación.
- Generación de código y resolución de problemas basados en código.
- Comprensión multimodal de imágenes, documentos, gráficos, audio y vídeo, con salida de texto.
- Procesamiento de contexto largo de hasta 512K tokens, adecuado para documentos extensos y conversaciones largas.
- Modo de razonamiento opcional mediante `enable_thinking` en la plantilla de chat, que activa o desactiva el razonamiento explícito.

## Casos de uso

- Análisis de documentos extensos: gracias a su ventana de 512K tokens, el modelo puede procesar informes anuales, expedientes legales o manuales técnicos completos de una sola vez, extrayendo información, resumiendo secciones y respondiendo preguntas específicas sin necesidad de fragmentar el texto.
- Asistente de atención al cliente multimodal: puede gestionar conversaciones multi-turno que incluyan capturas de pantalla, imágenes de productos o mensajes de voz, manteniendo el contexto de toda la interacción y derivando a agentes humanos cuando sea necesario.
- Generación de código en producción: con soporte para tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para revisar pull requests, generar tests unitarios, refactorizar código o documentar APIs, reduciendo la carga de los desarrolladores.
- Análisis de vídeo y audio para moderación de contenido: el modelo puede transcribir y comprender contenido audiovisual, detectando discursos de odio, spam o información sensible en plataformas de streaming o redes sociales, con capacidad de procesar largas grabaciones.
- Agente de investigación autónomo: puede combinar búsqueda web, lectura de documentos y razonamiento para elaborar informes de mercado, revisiones bibliográficas o análisis de competencia, actualizando su memoria interna a lo largo de múltiples pasos.
- Asistente educativo interactivo: con entrada multimodal, puede resolver ejercicios de matemáticas a partir de fotos de problemas, explicar conceptos científicos con apoyo de diagramas y mantener conversaciones de tutoría prolongadas que recuerden el progreso del estudiante.
- Extracción de datos de gráficos y tablas: puede interpretar gráficos financieros, tablas de resultados y figuras científicas, convirtiéndolos en resúmenes textuales o en datos estructurados para su posterior análisis.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye dos figuras con resultados de evaluación para razonamiento general y agéntico, y para comprensión multimodal, pero los valores concretos no están disponibles en formato texto. Se recomienda consultar el informe técnico completo, anunciado como "coming soon", para obtener datos detallados.

## Requisitos de hardware

- El checkpoint FP8 ocupa aproximadamente 597 GB en disco (tamaño del repositorio), y los pesos en FP8 requieren alrededor de 280 GB de VRAM solo para los parámetros del modelo principal, más memoria adicional para los encoders y el estado de inferencia.
- La configuración recomendada por el autor es un nodo con 8 GPUs de alta capacidad (por ejemplo, H100 o A100 de 80 GB) para servir el modelo en FP8 con SGLang o vLLM.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño del modelo; se necesitan GPUs de data center con al menos 80 GB de memoria cada una.
- Opciones de despliegue: SGLang y vLLM son los servidores recomendados en la documentación. También es compatible con Transformers (a través del PR de integración) y con el ecosistema de Hugging Face.
- No se han publicado datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos MoE de tamaño similar (por ejemplo, DeepSeek-V3, Qwen2.5-Max o Kimi K2) en la información disponible. La comparativa requeriría ejecutar los mismos benchmarks en condiciones controladas, y el autor aún no ha publicado el informe técnico completo.

## Limitaciones y advertencias

- Es un modelo en fase preview, por lo que puede presentar comportamientos inesperados o errores en tareas complejas que no se hayan corregido en la versión final.
- Al ser un modelo multimodal con 280B parámetros, requiere infraestructura de alto coste (múltiples GPUs de data center) y un consumo energético significativo, lo que limita su uso a entornos con recursos suficientes.
- No se han publicado detalles sobre sesgos o alucinaciones específicas. Como todo modelo de lenguaje grande, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados o con información poco frecuente.
- La comprensión de audio y vídeo está limitada a la entrada; el modelo solo produce texto como salida, por lo que no puede generar imágenes, vídeo o audio.
- Los idiomas soportados no están especificados oficialmente. Aunque la documentación está en inglés y chino, no se garantiza un rendimiento uniforme en otros idiomas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la licencia y las políticas de uso de los modelos derivados.

## Enlaces

- HuggingFace (FP8): https://huggingface.co/dots-studio/dots3-note-prev-fp8
- HuggingFace (BF16): https://huggingface.co/dots-studio/dots3-note-prev
- GitHub: https://github.com/studio-dots-ai/dots3-note-prev
- ModelScope (FP8): https://modelscope.cn/models/dots-studio/dots3-note-prev-fp8
- ModelScope (BF16): https://modelscope.cn/models/dots-studio/dots3-note-prev
- Tech Blog: https://studio.dots.ai/dots/dots3-en.html
- PR de Transformers: https://github.com/huggingface/transformers/pull/47844
- PR de SGLang: https://github.com/sgl-project/sglang/pull/33829
- Receta de vLLM: https://recipes.vllm.ai/dots-studio/dots3-note-prev
