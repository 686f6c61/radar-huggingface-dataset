# Chungulus/Qwen3.8-27B-Q6_K-GGUF

## Resumen

Qwen3.8-27B es un modelo denso de visión-lenguaje desarrollado por Qwen (Alibaba), publicado originalmente en HuggingFace y posteriormente cuantizado a formato GGUF por la comunidad. Esta ficha se centra en la versión Q6_K publicada por Chungulus, que es una cuantización vanilla sin modificaciones del checkpoint oficial, con el proyector de visión en F16. El modelo está construido sobre la arquitectura Qwen3.5 (identificador interno `Qwen3_5ForConditionalGeneration`), aunque no se trata de un modelo de la serie Qwen3.5.

Con 27.320.697.856 parámetros (27B), el modelo destaca por su ventana de contexto de 256K-262K tokens, su capacidad de razonamiento explícito (thinking mode), soporte nativo de visión (imagen y vídeo) y tool calling. Su licencia Apache-2.0 permite uso comercial sin restricciones. La versión cuantizada Q6_K ocupa aproximadamente 22,4 GB para el tensor principal, más el proyector de visión, lo que lo hace desplegable en hardware de gama alta para consumidores y en entornos de servidor con una sola GPU.

La relevancia actual del modelo radica en su equilibrio entre capacidades agénticas, razonamiento multimodal y eficiencia de despliegue, siendo una opción atractiva para desarrolladores que necesitan un modelo de 27B con visión y contexto largo sin recurrir a arquitecturas MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + full-attention) con torre de visión y proyector |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K-262K tokens (según documentación externa; no especificado en la model card) |
| Tipos de cuantizacion | Q6_K (GGUF) para el modelo principal; F16 para el proyector de visión |
| Idiomas soportados | No especificado en la model card; Qwen suele ofrecer soporte multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q6_K) + mmproj F16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas con Gated DeltaNet (una variante de atención lineal eficiente) con capas de atención completa, lo que permite manejar contextos largos con menor coste computacional que un transformer estándar. Incluye una torre de visión con proyector multimodal para procesar imágenes y vídeo, y conserva tensores MTP (Multi-Token Prediction) en el checkpoint, aunque la cuantización no anuncia aceleración especulativa activa.

La versión cuantizada por Chungulus es una conversión directa del checkpoint oficial `Qwen/Qwen3.8-27B` (pinned a un commit específico) utilizando llama.cpp con cuantización K/IQ. No se aplicó calibración para los K-quants, y los tensores de visión y MTP se conservaron íntegramente. La model card no proporciona detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO) del modelo original.

## Capacidades

- Generación de texto y razonamiento: soporta modos de pensamiento explícito (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) para tareas complejas de razonamiento multi-paso.
- Visión y vídeo: acepta imágenes y vídeo como entrada, con proyector multimodal dedicado (validado con casos de imagen locales).
- Tool calling: soporta formato nativo de llamada a herramientas, validado en cinco casos de prueba.
- Capacidades agénticas: según documentación externa, destaca en planificación autónoma y manejo de feedback del entorno para tareas de largo horizonte.
- Multilingüe: aunque no se especifica en la model card, los modelos Qwen suelen cubrir múltiples idiomas.
- Chat y conversación: plantilla de chat preservada del checkpoint original.

## Casos de uso

- Atención al cliente automatizada: con 256K-262K de contexto, puede gestionar conversaciones multi-turno extensas, mantener el historial completo y acceder a documentación de producto en la misma ventana, reduciendo la pérdida de información en interacciones largas.
- Generación de código en producción: su capacidad de tool calling permite integrarlo en pipelines de CI/CD para revisión de código, generación de tests o autocompletado, con la ventaja de poder razonar sobre el contexto del repositorio.
- Análisis de documentos con imágenes: al combinar visión y texto, puede extraer información de capturas de pantalla, diagramas o documentos escaneados, útil en automatización de procesos de negocio.
- Agentes autónomos de navegación web: su rendimiento en benchmarks como OSWorld (84.3 según fuente externa) sugiere que puede operar interfaces gráficas y ejecutar tareas multi-paso en entornos simulados.
- Asistente de investigación: con contexto largo y razonamiento explícito, puede resumir papers, comparar resultados y mantener el hilo de una investigación extensa.
- Moderación de contenido multimodal: su capacidad de procesar imágenes y texto permite clasificar contenido visual y textual en plataformas, con la ventaja de la licencia Apache-2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada. La model card de la cuantización no incluye métricas de rendimiento, y las fuentes externas citan resultados en benchmarks agénticos y de visión:

| Benchmark | Resultado | Fuente |
|---|---|---|
| DeepSWE | 42.2 | lovableapp.org (no oficial) |
| Terminal Bench | 73.0 | lovableapp.org (no oficial) |
| OSWorld | 84.3 | lovableapp.org (no oficial) |

Estos datos provienen de una fuente externa no verificada y no deben considerarse oficiales. La model card de la cuantización reporta una velocidad de generación de 11,12 tokens/s en el host de validación, pero no especifica el hardware utilizado.

## Requisitos de hardware

- Memoria estimada: al menos 27 GB de memoria disponible para el modelo, proyector de visión y overhead de runtime (según la model card). El archivo Q6_K pesa 22,4 GB y el mmproj F16 aproximadamente 0,9 GB.
- GPU recomendadas: para Q6_K completo, se recomienda una GPU con 32 GB de VRAM (por ejemplo, A100 40GB, H100, o RTX A6000). En GPUs de 24 GB (RTX 3090/4090) podría caber con cuantizaciones menores (Q4_K_M o Q5_K_M), pero no con Q6_K.
- Despliegue en consumer GPU: no es viable con Q6_K en GPUs de 24 GB; se necesitaría una cuantización inferior o descarga de capas a CPU.
- Opciones de despliegue: llama.cpp (recomendado, con el comando `llama-mtmd-cli`), Ollama, LM Studio, vLLM (si soporta la arquitectura híbrida), Unsloth (según documentación externa).
- Latencia y throughput: la model card reporta 11,12 tokens/s en el host de validación, pero sin especificar hardware; el rendimiento real dependerá de la GPU y la configuración de KV-cache.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa cuantitativa con otros modelos de la misma categoría (vision-language de ~27B). Se puede señalar que Qwen3.8-27B compite con modelos como Qwen2.5-VL-27B (generación anterior) o InternVL3-26B, pero no hay métricas comparables en las fuentes consultadas. La ventaja principal frente a alternativas es su arquitectura híbrida con contexto largo y licencia Apache-2.0.

## Limitaciones y advertencias

- La cuantización Q6_K puede degradar ligeramente la calidad de generación respecto al checkpoint original en FP16, especialmente en tareas de razonamiento complejo.
- La model card advierte que el prompt más largo validado fue de 73 tokens; no se ha probado el contexto máximo arquitectónico (256K-262K) en esta cuantización.
- El runtime debe soportar la arquitectura híbrida completa (Gated DeltaNet + atención, torre de visión, tokenizer y metadatos MTP); cargar solo el tensor de lenguaje no funcionará.
- No se anuncian capacidades de decodificación especulativa activa a pesar de conservar los tensores MTP.
- Los benchmarks agénticos citados provienen de una fuente externa no oficial y no han sido verificados por el equipo de Qwen.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje; se recomienda validación humana en aplicaciones de alto riesgo.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-Q6_K-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio combinado de validación: https://huggingface.co/Chungulus/Qwen3.8-27B-GGUF/tree/f519a212d6c15cd3292b6ca835dd8ebf235642c0
- Documentación de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guía de despliegue local (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía completa (lovableapp): https://lovableapp.org/blog/qwen3-8-27b
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
