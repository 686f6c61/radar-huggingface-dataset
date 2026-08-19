# Jommarn/UNSEEN_Gemma_4_26B_NSFW

## Resumen

El modelo **Jommarn/UNSEEN_Gemma_4_26B_NSFW** es un fine-tune no oficial del modelo **Gemma 4 26B** de Google DeepMind, orientado a la generación de contenido sin filtros de seguridad (NSFW). El autor, Jommarn, lo publica en HuggingFace bajo el pipeline `image-text-to-text`, lo que indica que hereda la multimodalidad del modelo base: entrada de imágenes y texto, salida de texto. El nombre "UNSEEN" sugiere una variante sin restricciones de alineación, probablemente mediante un proceso de destilación o fine-tune que elimina los mecanismos de rechazo del modelo original.

Con **25.805.936.206 parámetros** (~25,8B), este modelo se posiciona en la gama alta de los modelos open source disponibles para inferencia local. Según la documentación de Google DeepMind, Gemma 4 26B emplea una arquitectura de mezcla de expertos (MoE) con 4 expertos activos de un total de 26, aunque esta característica no está confirmada para este fine-tune concreto. El repositorio pesa 48,5 GB, consistente con pesos en precisión fp16/bf16, y los tags indican la existencia de una versión cuantizada en 4 bits mediante bitsandbytes.

La relevancia de este modelo radica en la demanda de la comunidad de modelos "uncensored" para aplicaciones de rol, narrativa adulta y asistencia conversacional sin restricciones, un nicho que los modelos alineados por seguridad suelen cubrir de forma limitada. Sin embargo, la ausencia de documentación técnica y de resultados de evaluación limita su uso en entornos profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (MoE presumiblemente, no confirmado para este fine-tune) |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | no disponible (si es MoE A4B, ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (fp16/bf16 probablemente); tags indican 4-bit bitsandbytes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 26B, es un modelo multimodal desarrollado por Google DeepMind que acepta entradas de imagen y texto y genera texto. Según la documentación oficial de Google Cloud, la variante "Gemma 4 26B A4B IT" emplea una arquitectura de mezcla de expertos (MoE) con 4 expertos activos, lo que reduce el coste computacional en inferencia manteniendo una capacidad total de 26B parámetros. El fine-tune de Jommarn hereda presumiblemente esta arquitectura, aunque no hay confirmación explícita en la model card.

No se dispone de información sobre el proceso de entrenamiento de este fine-tune: ni datos de entrenamiento, ni método (RLHF, DPO, etc.), ni hiperparámetros. La model card es una plantilla automática de HuggingFace con todos los campos en "[More Information Needed]". El tag `arxiv:1910.09700` hace referencia al paper sobre el cálculo de emisiones de carbono (Lacoste et al., 2019), citado de forma genérica en la plantilla, no a una innovación técnica del modelo.

## Capacidades

- Generación de texto conversacional y creativo sin filtros de seguridad (orientación NSFW).
- Entrada multimodal: acepta imágenes como entrada adicional al texto (heredado de Gemma 4), aunque no se especifica si el fine-tune conserva esta capacidad.
- Soporte de tool calling y agentes: no documentado, pero probablemente heredado del modelo base.
- Capacidades multilingües: no documentadas; el modelo base de Gemma 4 soporta múltiples idiomas, pero no se confirma para este fine-tune.
- Sin modo de razonamiento explícito (thinking mode) documentado.

## Casos de uso

- **Generación de narrativa erótica y ficción adulta**: el modelo puede producir relatos extensos con tono y estilo ajustables, aprovechando su ventana de contexto (aunque no se conoce su longitud exacta) para mantener coherencia en tramas largas.
- **Roleplay sin restricciones**: en juegos de rol por texto, el modelo responde a personajes y situaciones sin los rechazos típicos de los modelos alineados, lo que permite escenarios complejos y adultos.
- **Asistente conversacional para usuarios adultos**: en plataformas de chat privadas, puede actuar como compañero de conversación con temática libre, sin moderación automática.
- **Escritura de diálogos para guiones o videojuegos**: los equipos creativos pueden usarlo para generar diálogos con contenido maduro, siempre que dispongan de la licencia adecuada (no especificada).
- **Exploración de límites creativos**: escritores y artistas pueden emplearlo para superar bloqueos creativos en proyectos que requieran lenguaje explícito o temas tabú.
- **Pruebas de robustez en moderación de contenido**: investigadores pueden usarlo para evaluar sistemas de filtrado de contenido, ya que su naturaleza sin restricciones permite generar ejemplos adversarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) y no se encontraron referencias externas con datos de rendimiento para este fine-tune específico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp16/bf16, se requieren aproximadamente 52 GB de VRAM (25,8B × 2 bytes) más overhead de activaciones. Con cuantización de 4 bits (bitsandbytes), el requisito baja a unos 13-15 GB.
- **GPU recomendadas**: para fp16, una A100 80GB, H100 80GB o varias GPUs en paralelo (p.ej., 2× RTX 4090 24GB). Para 4-bit, una RTX 4090 24GB o RTX 3090 24GB son suficientes.
- **¿Cabe en consumer GPU?**: solo con cuantización de 4 bits en GPUs de 24GB; en 8 bits podría caber en 32GB (p.ej., RTX 6000 Ada). En fp16 no cabe en ninguna consumer GPU actual.
- **Opciones de despliegue**: transformers (con bitsandbytes para 4-bit), vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF, aunque este repo no incluye GGUF), Ollama (existe una variante similar publicada por VladimirGav con IQ4_XS para 16GB VRAM).
- **Latencia y throughput**: no disponible. Al ser un modelo MoE con 4 expertos activos, la latencia esperada es menor que la de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este fine-tune para comparar con alternativas. Sin embargo, en la categoría de modelos "uncensored" de tamaño similar, existen opciones como:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jommarn/UNSEEN_Gemma_4_26B_NSFW | ~25,8B | no disponible | no disponible | HuggingFace |
| Gemma 4 26B (base, Google DeepMind) | ~25,8B (MoE) | no publicado | Gemma Terms of Use | HuggingFace, Google Cloud |
| Llama 3.1 70B (variantes uncensored) | 70B | 128K | Llama 3.1 Community License | HuggingFace |
| Mistral 7B (variantes uncensored, p.ej. dolphin) | 7B | 32K | Apache 2.0 | HuggingFace |

La comparación directa no es posible sin datos de benchmarks. El modelo base Gemma 4 26B ha demostrado un rendimiento competitivo en razonamiento y codificación según Google DeepMind, pero este fine-tune no publica resultados propios.

## Limitaciones y advertencias

- **Contenido NSFW**: el modelo está diseñado para generar contenido explícito para adultos; no es apto para menores ni para entornos profesionales donde se requiera moderación.
- **Sesgos y alucinaciones**: al eliminar los filtros de seguridad, el modelo puede producir contenido ofensivo, discriminatorio o factualmente incorrecto sin restricciones. No hay información sobre mitigaciones.
- **Riesgo de alucinación**: inherente a todos los modelos generativos; al no tener alineación, la probabilidad de respuestas inventadas o incoherentes puede ser mayor.
- **Licencia no especificada**: el uso comercial es incierto; la licencia de Gemma 4 base (Gemma Terms of Use) impone restricciones de uso, pero este fine-tune no declara ninguna licencia propia, lo que genera inseguridad jurídica.
- **Sin documentación técnica**: la model card no aporta detalles sobre datos de entrenamiento, método de fine-tune ni evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- **Soporte limitado**: al ser un modelo de un autor independiente con 0 descargas y 0 likes, no hay comunidad activa ni mantenimiento garantizado.

## Enlaces

- [HuggingFace - Jommarn/UNSEEN_Gemma_4_26B_NSFW](https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW)
- [Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 26B uncensored weights quantized to GGUF (uncensoredhub.ai)](https://uncensoredhub.ai/news/2026-06-05-gemma-4-26b-uncensored-weights-quantized-to-gguf-for-local-inference)
- [Gemma 4 26B A4B IT - Google Cloud Docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
- [VladimirGav/gemma4-26b-16GB-VRAM-Uncensored (Ollama)](https://ollama.com/VladimirGav/gemma4-26b-16GB-VRAM-Uncensored)
- [gemma4:26b en Ollama](https://ollama.com/library/gemma4:26b)
