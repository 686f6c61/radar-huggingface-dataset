# OsaurusAI/Qwen3.8-27B-JANG_4D

## Resumen

OsaurusAI/Qwen3.8-27B-JANG_4D es un bundle cuantizado del modelo vision-language Qwen/Qwen3.8-27B, desarrollado por OsaurusAI para su runtime local de IA en macOS. El modelo base, creado por Qwen, es un transformer denso de 27 000 millones de parámetros con arquitectura híbrida (48 capas GatedDeltaNet + 16 capas de atención completa con RoPE parcial), que admite entrada de texto, imagen y video, y ofrece control flexible del razonamiento mediante un modo *thinking* configurable.

Este bundle concreto aplica una cuantización mixta de 4/5/6/8 bits (251 módulos en 4 bits, 226 en 5 bits, 49 en 6 bits y 64 en 8 bits) con asignación basada en la traza de la Hessiana y un reajuste imatrix para los módulos por debajo de 8 bits. El resultado ocupa 17,0 GiB en disco y mantiene una desviación de solo 0,03 nats respecto al modelo de referencia, lo que lo convierte en una opción equilibrada entre calidad y tamaño para ejecutar en Apple Silicon con 24 GB de memoria unificada. La cabeza de multi-token-prediction (MTP) del modelo original se conserva intacta, lo que permite decodificación especulativa opcional.

La relevancia de este lanzamiento radica en que democratiza el acceso a un VLM de 27B con capacidades de razonamiento y tool calling en hardware de consumo (Macs), sin necesidad de GPUs dedicadas, y con un proceso de cuantización documentado y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet + 16 capas gated full-attention (RoPE parcial, dim 64) |
| Parametros totales | 27B (modelo base); 4 834 865 872 elementos en safetensors (bundle cuantizado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | Mixta 4/5/6/8 bits (251x4-bit, 226x5-bit, 49x6-bit, 64x8-bit) + proyecciones de visión en fp16 |
| Idiomas soportados | Inglés (único declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas GatedDeltaNet (una variante de state-space model con puertas) con capas de atención completa con puertas. De las 64 capas totales, 48 son GatedDeltaNet y 16 son de atención completa, con una dimensión RoPE parcial de 64. Esta combinación busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. El modelo incluye una torre de visión nativa que procesa tanto imágenes como video, y una cabeza de multi-token-prediction (MTP) entrenada con múltiples pasos, que permite decodificación especulativa.

El bundle JANG_4D no modifica los pesos del modelo base, sino que aplica una cuantización calibrada. El proceso de cuantización, desarrollado por Jinho Jang para OsaurusAI, consta de tres pasos: primero, una captura de sensibilidad basada en la traza de la Hessiana (tr(H)·‖W‖²_F) por módulo, usando estadísticas de activación de un corpus de calibración; segundo, una asignación de bits que prioriza los módulos de atención y sacrifica los bloques FFN menos sensibles; tercero, un reajuste imatrix (mínimos cuadrados ponderados por activación) para todos los módulos por debajo de 8 bits. Las proyecciones `linear_fc2` del bloque de visión (con 4304 features de entrada, no divisibles por los grupos de cuantización de MLX) se mantienen en fp16 para evitar roturas silenciosas. No se aplicaron AWQ ni GPTQ: AWQ se descartó por su norm-fold inseguro con la convención de normalización centrada en cero de esta familia, y GPTQ requiere Hessianas fuera de la diagonal, que se registraron como trabajo futuro.

## Capacidades

- Generación de texto y comprensión de lenguaje natural con modo de razonamiento (*thinking*) configurable en tres niveles: `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Comprensión de video: procesamiento de secuencias de video a través de la torre de visión nativa (verificado en este bundle).
- Tool calling / function calling: soporte nativo con parser `qwen3_coder` para llamadas a herramientas.
- Capacidades de agente: razonamiento multi-paso y uso de herramientas en flujos agénticos, con el preset de muestreo agéntico (`temperature=1.0, top_p=0.95, top_k=20`) activado por defecto.
- Multi-token prediction (MTP): cabeza preservada que permite decodificación especulativa con 1 token de borrador por paso (recomendado), aunque es opcional y se omite si el runtime no la soporta.
- Preservación del contexto de razonamiento entre turnos (`preserve_thinking` activado por defecto), lo que facilita el uso de caché de prefijo en conversaciones multi-turno.
- Multilingüismo: aunque la model card declara solo inglés, el modelo base de Qwen soporta múltiples idiomas; no obstante, el bundle no garantiza calidad fuera del inglés.

## Casos de uso

- Asistente de documentación técnica con contexto largo: con 262 144 tokens de contexto nativo, el modelo puede ingerir manuales completos, especificaciones y código fuente para responder preguntas precisas sin perder el hilo de la conversación. Es adecuado para equipos de desarrollo que necesitan consultar grandes repositorios de documentación en una sola sesión.
- Análisis de imágenes médicas o industriales: la torre de visión permite describir radiografías, fotografías de maquinaria o capturas de pantalla, y razonar sobre anomalías. El modo *thinking* ayuda a generar explicaciones detalladas y verificables.
- Revisión de video para control de calidad: el modelo puede procesar secuencias de video (por ejemplo, grabaciones de líneas de producción) y generar informes descriptivos de eventos, gracias a su capacidad nativa de video y al contexto largo.
- Agente de automatización de tareas con tool calling: integrado en un runtime como MLX, el modelo puede invocar funciones (búsqueda web, ejecución de scripts, consultas a APIs) y encadenar múltiples llamadas para completar tareas complejas, como la generación de informes a partir de datos dispersos.
- Generación de código con razonamiento: el preset agéntico y el parser `qwen3_coder` lo hacen útil para generar, revisar y depurar código en entornos de desarrollo, con la capacidad de mantener el contexto de razonamiento entre iteraciones.
- Chatbot de atención al cliente con memoria persistente: gracias a `preserve_thinking` y al contexto extensible, puede mantener conversaciones multi-turno largas con clientes, recordando detalles de interacciones anteriores y razonando sobre políticas de la empresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el bundle se mantiene dentro de 0,03 nats del modelo de referencia (MXFP8), pero no proporciona métricas concretas como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio del modelo base Qwen/Qwen3.8-27B para obtener resultados de evaluación del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el bundle ocupa 17,0 GiB en disco; para inferencia se recomienda un Mac con al menos 24 GB de memoria unificada, ya que MLX utiliza la memoria unificada de Apple Silicon.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se proporcionan requisitos para GPUs NVIDIA o AMD, ya que el formato MLX no es compatible directamente con CUDA.
- Compatibilidad con hardware de consumo: sí, en Macs con 24 GB o más de RAM unificada. Modelos con 16 GB podrían ejecutar el bundle JANG_2D (10,9 GiB) en lugar de este.
- Opciones de despliegue: runtime MLX con la librería `mlx-vlm` (carga y generación directas). También se puede usar con `mlx_lm` si se convierte el bundle, aunque la model card recomienda `mlx_vlm` para tareas multimodales. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerá del chip concreto (por ejemplo, M2 Max vs M3 Ultra) y de la configuración de decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27B | 262 144 (ext. 1M) | fp16/bf16 | ~54 GiB | Apache 2.0 | HuggingFace |
| OsaurusAI/Qwen3.8-27B-JANG_2D | 27B | 262 144 (ext. 1M) | Mixta 2/3/4/8-bit | 10,9 GiB | Apache 2.0 | HuggingFace |
| OsaurusAI/Qwen3.8-27B-JANG_4D (este) | 27B | 262 144 (ext. 1M) | Mixta 4/5/6/8-bit | 17,0 GiB | Apache 2.0 | HuggingFace |
| OsaurusAI/Qwen3.8-27B-JANG_6D | 27B | 262 144 (ext. 1M) | Mixta 6/7/8-bit | 24,1 GiB | Apache 2.0 | HuggingFace |
| OsaurusAI/Qwen3.8-27B-MXFP8 | 27B | 262 144 (ext. 1M) | MXFP8 | 26,8 GiB | Apache 2.0 | HuggingFace |

La comparativa se limita a los bundles de la misma familia, ya que no se dispone de datos de otros modelos VLM de 27B con arquitectura híbrida. El JANG_4D ofrece el mejor equilibrio calidad/tamaño dentro de la gama, con una desviación de 0,03 nats respecto al MXFP8 de referencia, pero con un 37 % menos de espacio en disco.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés. Aunque el modelo base de Qwen puede tener capacidades multilingües, no hay garantía de calidad en otros idiomas, y el bundle no incluye configuración específica para ellos.
- Sesgos del modelo base: al ser una cuantización de Qwen3.8-27B, hereda los sesgos y limitaciones del modelo original, que no se documentan en esta ficha.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas. El modo *thinking* no elimina este riesgo.
- Degradación por cuantización: aunque la desviación es de solo 0,03 nats, la cuantización mixta puede afectar a tareas sensibles a la precisión numérica, como matemáticas de alta precisión o generación de código con dependencias numéricas finas.
- Restricciones de hardware: el bundle está optimizado exclusivamente para Apple Silicon y MLX. No es directamente ejecutable en GPUs NVIDIA o AMD sin conversión a otro formato (por ejemplo, GGUF o safetensors estándar), lo que puede requerir trabajo adicional y posible pérdida de las ventajas de la cuantización calibrada.
- Limitaciones de contexto: aunque el contexto nativo es de 262 144 tokens, el rendimiento con contextos muy largos puede degradarse en hardware con memoria limitada, y la extensión a 1M no está verificada en este bundle.
- Soporte de video: la model card advierte que `mlx_vlm.prompt_utils.apply_chat_template` elimina silenciosamente los elementos de video; se debe usar el chat template del bundle para procesar video correctamente.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B, que también es Apache 2.0, para confirmar que no hay restricciones adicionales.

## Enlaces

- Repositorio del bundle: https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_4D
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Bundle JANG_2D: https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_2D
- Bundle JANG_6D: https://huggingface.co/OsaurusAI/Qwen3.8-27B-JANG_6D
- Bundle MXFP8: https://huggingface.co/OsaurusAI/Qwen3.8-27B-MXFP8
- Sitio de OsaurusAI: https://osaurus.ai
