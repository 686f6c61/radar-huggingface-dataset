# MrMofer/Qwen3-27B-OBLITERATED-JANG-VISION-MLX-4bit

## Resumen

El modelo `MrMofer/Qwen3-27B-OBLITERATED-JANG-VISION-MLX-4bit` es una fusión experimental que combina el núcleo lingüístico sin censura de `OBLITERATUS/Qwen3.8-27B-OBLITERATED` (abliterado mediante 6 rondas de SVD, con 5 direcciones de rechazo eliminadas) con el encoder visual completo de `dealignai/Qwen3.8-27B-JANG_4D-CRACK` (ViT de 27 capas). El resultado es un modelo de lenguaje y visión (image-text-to-text) basado en la arquitectura Qwen3.5, cuantizado a 4 bits con MLX affine para ejecutarse eficientemente en Apple Silicon. Con 27.3 mil millones de parámetros y una ventana de contexto de 262 144 tokens, ofrece capacidades de visión, video, tool calling y razonamiento híbrido (atención lineal + completa).

La relevancia de este modelo radica en su doble enfoque: por un lado, elimina las barreras de rechazo típicas de los modelos alineados, manteniendo un rendimiento académico alto (MMLU 81.4%); por otro, integra un encoder visual sin truncamiento, lo que permite procesar imágenes y video de forma nativa. Su cuantización MLX 4-bit reduce el peso de 55 GB (BF16) a 15 GB, logrando una inferencia 5-7 veces más rápida en hardware Apple, con velocidades de 15-20 tokens por segundo en chips M-series Max/Ultra. Está pensado para desarrolladores que necesitan un modelo multimodal sin censura, desplegable en entornos locales con macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (híbrido: atención lineal estilo Mamba-2 + atención completa) con encoder visual ViT |
| Parametros totales | 27.3 mil millones (27 356 728 560) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | MLX affine 4-bit (group size 64 para lenguaje, 128 para visión) |
| Idiomas soportados | Inglés (en), español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit, con tensores U32 empaquetados + escalas/biases F16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 (`model_type: qwen3_5`), que combina atención lineal (SSM estilo Mamba-2) en tres cuartas partes de las capas y atención completa en el cuarto restante, con `full_attention_interval=4`. La rama de lenguaje tiene 64 capas, hidden size 5120, 24 cabezas de atención (KV 4), head_dim 256 e intermediate 17408. El encoder visual es un ViT estándar de 27 capas con hidden 1152, 16 cabezas, patch size 16 y `spatial_merge_size 2`, que se proyecta al espacio de lenguaje de 5120 dimensiones mediante un merger aprendido. Soporta entrada de imagen y video mediante tokens especiales (`<|image_pad|>`, `<|video_pad|>`).

El entrenamiento no está documentado en detalle, pero se sabe que es una fusión de tres modelos base: `Qwen/Qwen3-27B` (modelo original), `OBLITERATUS/Qwen3.8-27B-OBLITERATED` (abliterado mediante SVD para eliminar direcciones de rechazo) y `dealignai/Qwen3.8-27B-JANG_4D-CRACK` (que aporta el encoder visual completo). La cuantización MLX affine se aplicó posteriormente, empaquetando los pesos en 4 bits con grupos de 64 (lenguaje) y 128 (visión), lo que reduce el tamaño total a 15.6 GB. No se menciona el uso de RLHF o DPO en el proceso.

## Capacidades

- Generación de texto y razonamiento: mantiene un rendimiento MMLU de 81.4% tras la abliteración, lo que indica que conserva gran parte de sus capacidades académicas.
- Visión y video: procesa imágenes y video de forma nativa gracias al encoder ViT completo (27 capas, sin truncamiento). Verificado con una prueba de imagen azul sólida que devolvió una descripción correcta.
- Tool calling y agentes: soporta `tool_parser: qwen3_coder` y `supports_tools: true`, lo que permite integración con funciones externas y flujos de agente.
- Multilingüe: entrenado para inglés y español, con tokenizer de 248 320 tokens.
- Sin censura: el proceso de abliteración elimina las direcciones de rechazo, logrando un 0% de refusal en pruebas de rechazo, lo que permite generar contenido que otros modelos bloquean.
- Modo híbrido de atención: combina atención lineal (eficiente en contexto largo) con atención completa (precisa), optimizando el uso de memoria y velocidad.

## Casos de uso

- Atención al cliente automatizada: con 262 144 tokens de contexto, puede gestionar conversaciones multi-turno largas y mantener el historial completo. Su naturaleza sin censura permite manejar consultas delicadas sin respuestas evasivas, aunque requiere supervisión humana para evitar contenido inapropiado.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código. Su capacidad de razonamiento (MMLU 81.4%) y el parser `qwen3_coder` lo hacen adecuado para tareas de programación asistida.
- Análisis de imágenes y documentos: el encoder visual permite extraer información de capturas, diagramas o documentos escaneados. Útil para automatizar la clasificación de imágenes o la extracción de datos de formularios.
- Asistentes de investigación sin restricciones: investigadores que necesitan explorar temas sensibles o controvertidos pueden usar el modelo sin filtros de rechazo, manteniendo la calidad académica.
- Agentes autónomos de largo horizonte: la combinación de atención lineal y completa, junto con el soporte de herramientas, permite construir agentes que planifican y ejecutan tareas multi-paso con memoria de contexto amplia.
- Despliegue local en macOS: gracias a la cuantización MLX 4-bit, el modelo cabe en 15 GB de RAM unificada, permitiendo ejecutarlo en MacBooks con M-series Max/Ultra sin necesidad de GPU dedicada, ideal para prototipado y desarrollo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, salvo los mencionados en la model card:

| Benchmark | Resultado |
|---|---|
| MMLU | 81.4% |
| Refusal probes | 0% de rechazo |

No hay datos comparativos con otros modelos en la información proporcionada. Se recomienda consultar la documentación de los modelos base (Qwen3-27B, Qwen3.8-27B) para obtener métricas adicionales.

## Requisitos de hardware

- VRAM estimada: 15 GB de memoria unificada (pesos cuantizados a 4-bit). El modelo completo en BF16 ocuparía 55 GB, por lo que la cuantización es esencial para hardware de consumo.
- GPU recomendadas: exclusivamente Apple Silicon (M-series). Probado en M-series Max/Ultra, con velocidades de 15-20 tokens por segundo en inferencia de texto. La codificación de visión añade 0.4-0.8 segundos por imagen.
- Compatibilidad con consumer GPU: no aplica, ya que MLX solo funciona en Apple Silicon. No es compatible con CUDA o ROCm.
- Opciones de despliegue: `mlx-vlm` (>=0.6.10) para generación directa, y OMLX para servir el modelo como API compatible con `/v1/chat/completions` (incluye soporte de `image_url`).
- Latencia y throughput: en M-series Max/Ultra, ~15-20 tok/s para texto; la visión añade un overhead de menos de 1 segundo por imagen. No se dispone de datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-27B (original) | 27B | 262 144 | Denso, atención completa | Apache-2.0 | HuggingFace |
| Qwen3.8-27B (base) | 27B | 262 144 | Híbrido (lineal + completa) | Apache-2.0 | HuggingFace |
| Este modelo (MLX 4-bit) | 27.3B | 262 144 | Híbrido + ViT, cuantizado 4-bit | Apache-2.0 | HuggingFace |

La principal diferencia frente a los modelos base es la abliteración (eliminación de rechazo) y la cuantización MLX, que lo hace más ligero y rápido en Apple Silicon, pero con una posible pérdida de calidad por la cuantización. No se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias

- Contenido sin censura: al eliminar las direcciones de rechazo, el modelo puede generar contenido ofensivo, ilegal o peligroso. No es adecuado para aplicaciones públicas sin moderación humana.
- Riesgo de alucinación: como todo LLM, puede inventar información, especialmente en dominios especializados. La cuantización 4-bit puede aumentar este riesgo.
- Idiomas limitados: solo entrenado para inglés y español; el rendimiento en otros idiomas será deficiente.
- Requisito de hardware: exclusivo de Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (p. ej., GGUF), lo que requeriría trabajo adicional.
- Cuantización 4-bit: la pérdida de precisión puede afectar tareas de razonamiento complejo o generación de código de alta calidad, aunque el MMLU de 81.4% sugiere una degradación moderada.
- Licencia Apache-2.0: permite uso comercial, pero el modelo deriva de Qwen3, que también es Apache-2.0, por lo que no hay restricciones adicionales conocidas. Sin embargo, el contenido generado sin censura puede implicar responsabilidades legales en ciertos contextos.

## Enlaces

- HuggingFace: https://huggingface.co/MrMofer/Qwen3-27B-OBLITERATED-JANG-VISION-MLX-4bit
- Repositorio de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Qwen3.8-27B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Guía completa de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
