# ilyakam/Geer-Qwen3.8-27B-4-8bit-MLX

## Resumen

Geer-Qwen3.8-27B-4-8bit-MLX es una conversión independiente del modelo Qwen3.8-27B de Alibaba, realizada por el usuario ilyakam, al formato MLX con cuantización mixta de 4 y 8 bits. El objetivo es ejecutar este modelo multimodal de 27 000 millones de parámetros en ordenadores Apple Silicon con 48 GB de memoria unificada, un perfil que no cubre la conversión oficial de Geer (que se centra en 128 GB). No se trata de un modelo fundacional nuevo, sino de una adaptación de pesos del checkpoint BF16 de Qwen3.8-27B, que destaca por su arquitectura híbrida de atención (solo 16 de 64 capas usan atención completa) y por su rendimiento en tareas de codificación, agentes y automatización de oficina.

La conversión mantiene las capacidades del modelo original, incluyendo procesamiento de imagen y texto (image-text-to-text), razonamiento, generación de código y soporte para flujos agénticos. La cuantización aplica 4 bits a las matrices feed-forward grandes, 8 bits a las proyecciones de atención y atención lineal, y deja sin cuantizar la torre de visión, embeddings, cabezal de salida, normas y tensores MTP nativos. El contexto máximo declarado es de 128 000 tokens para el perfil de 48 GB, aunque esta cifra se considera provisional hasta que se pruebe en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) con visión |
| Parametros totales | 8 140 370 672 (según safetensors de esta conversión; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (perfil de 48 GB, provisional) |
| Tipos de cuantizacion | Mixta 4/8 bits (afine 4-bit para feed-forward, 8-bit para atención y atención lineal; group size 64) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Esta conversión no introduce cambios arquitectónicos respecto al modelo base Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros con un diseño híbrido de atención: solo 16 de las 64 capas utilizan atención completa (con intervalo `full_attention_interval: 4`), mientras que las 48 restantes emplean atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional en contextos largos sin sacrificar la capacidad de modelado. El modelo base fue entrenado por el equipo Qwen de Alibaba y destaca en codificación, flujos agénticos y automatización de oficina, según la documentación oficial.

La conversión MLX de ilyakam aplica una cuantización mixta: las matrices feed-forward grandes se cuantizan a 4 bits con grupo de tamaño 64, mientras que las proyecciones de atención y atención lineal se cuantizan a 8 bits. La torre de visión, los embeddings, el cabezal de salida, las normas y los tensores MTP (multi-token prediction) nativos permanecen sin cuantizar. El proceso se realizó a partir de la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del checkpoint BF16. No hay información sobre el entrenamiento de esta conversión, ya que no es un modelo reentrenado.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Procesamiento multimodal de imagen y texto (image-text-to-text), capaz de entender y responder sobre imágenes.
- Generación de código en múltiples lenguajes, con soporte para tool calling y function calling.
- Soporte para flujos agénticos y razonamiento multi-paso, optimizado para tareas de automatización.
- Capacidad de conversación en inglés, con manejo de contexto largo (hasta 128K tokens en este perfil).
- Soporte de MTP (multi-token prediction) nativo, que acelera la decodificación especulativa.

## Casos de uso

- Asistente de codificación en producción: el modelo puede integrarse en entornos de desarrollo para generar código, revisar parches y sugerir refactorizaciones, aprovechando su soporte de tool calling y su rendimiento en benchmarks de codificación (DeepSWE 42.2 en el modelo base).
- Automatización de oficina: procesamiento de documentos, generación de informes, resumen de correos y extracción de datos de imágenes o PDFs, gracias a su capacidad multimodal y su contexto de 128K tokens.
- Agente conversacional con visión: un chatbot que pueda analizar capturas de pantalla o diagramas y responder preguntas técnicas, útil para soporte técnico o formación.
- Razonamiento sobre documentos largos: análisis de contratos, artículos o manuales de hasta 128K tokens, con capacidad de citar secciones relevantes.
- Desarrollo de herramientas de productividad personal: asistentes que gestionen calendarios, redacten respuestas y automaticen tareas repetitivas en inglés.
- Investigación en IA multimodal: como modelo de referencia para estudiar arquitecturas híbridas de atención y su comportamiento en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX. La model card indica que los resultados del modelo base se refieren al checkpoint BF16 y no a este artefacto cuantizado. No obstante, los datos del modelo base Qwen3.8-27B, disponibles en su documentación oficial, incluyen:

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| SWE-bench Pro | Supera a Opus 4.6 Max |
| QwenSWEBench | Superior a Opus 4.6 Max |
| CoWorkBench | Superior a Opus 4.6 Max |
| LiveCodeBench v6 | Superior a Opus 4.6 Max |

Estos números corresponden al modelo sin cuantizar y pueden variar en la conversión MLX. La model card afirma que la conversión retiene el 100% de la tasa de aprobación agregada del 6-bit en pruebas internas con 128 GB, pero no se ofrecen cifras desglosadas.

## Requisitos de hardware

- Diseñado para Apple Silicon con 48 GB de memoria unificada (perfil provisional, aún no probado en hardware real).
- Tamaño del repositorio: 24.2 GB, lo que implica un uso de memoria cercano a ese valor durante la inferencia.
- No es compatible con GPUs de consumo típicas (RTX 4090 con 24 GB VRAM no es suficiente); requiere hardware con al menos 48 GB de memoria unificada o VRAM.
- Opciones de despliegue: MLX (librería nativa para Apple Silicon), conversión a GGUF para llama.cpp si se desea usar en CPU/GPU, o vLLM si se convierte a otro formato.
- Latencia y throughput: no disponibles; dependen del hardware concreto y de la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 128K | Apache-2.0 | safetensors | Modelo base, mayor precisión, requiere ~54 GB VRAM |
| Geer-Qwen3.8-27B-4-8bit-MLX (esta conversión) | 8.14B (según safetensors) | 128K | Apache-2.0 | MLX (safetensors) | Cuantización mixta para Apple Silicon 48 GB |
| Ornith (otra conversión de Geer) | No disponible | No disponible | Apache-2.0 | MLX | Perfil para 32 GB de RAM unificada |

La comparativa directa con otros modelos de 27B (como Llama 3.3 70B o Mistral Large) no es relevante aquí porque esta conversión se limita a un hardware específico. La alternativa principal es el modelo base en BF16, que requiere más memoria pero ofrece mayor fidelidad.

## Limitaciones y advertencias

- La conversión está diseñada para 48 GB de memoria unificada, pero el perfil es provisional: no se ha probado en un Mac real de 48 GB, solo en hosts de 128 GB.
- Los benchmarks publicados corresponden al modelo base BF16; esta conversión puede presentar degradaciones de rendimiento debido a la cuantización mixta.
- Solo soporta inglés; no hay garantía de buen rendimiento en otros idiomas.
- El número de parámetros según safetensors (8.14B) difiere del tamaño nominal del modelo base (27B), lo que sugiere que la cuantización afecta al conteo de tensores; se recomienda verificar la integridad de los pesos antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento largo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta conversión.

## Enlaces

- HuggingFace: https://huggingface.co/ilyakam/Geer-Qwen3.8-27B-4-8bit-MLX
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
