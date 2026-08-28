# aday777/Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP

## Resumen

Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP es un checkpoint derivado del modelo `mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4`, publicado por el usuario aday777 en Hugging Face. Se trata de un modelo multimodal de tipo mixture-of-experts (MoE) ultra disperso, con aproximadamente 125 mil millones de parámetros totales (incluyendo una tabla de embeddings n-gram de 51B) y 6 mil millones de parámetros activos por token. La variante MTP (Multi-Token Prediction) convierte los expertos de draft de una capa a cuantización NVFP4, optimizando la decodificación especulativa en hardware NVIDIA Blackwell.

El modelo está diseñado para inferencia de alto rendimiento con vLLM, soportando un contexto de servicio de 131 072 tokens (aunque el modelo base Qwen3.8-Flash admite hasta un millón de tokens). Es una versión "uncensored" (abliterada), lo que implica que ha sido modificada para eliminar rechazos de contenido, con las implicaciones de seguridad que ello conlleva. Su relevancia radica en combinar una arquitectura de vanguardia (Gated DeltaNet + Qwen Sparse Attention) con cuantización NVFP4 y decodificación especulativa, ofreciendo un rendimiento de 161 tokens por segundo en una GPU RTX PRO 6000 Blackwell de 96 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal ultra disperso con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), más capa MTP para decodificación especulativa |
| Parametros totales | 118 341 255 059 (según safetensors); ~125B incluyendo tabla n-gram de 51B |
| Parametros activos | 6B por token |
| Longitud de contexto | 131 072 tokens (cualificado en vLLM); el modelo base soporta hasta 1 000 000 |
| Tipos de cuantizacion | NVFP4 (expertos MoE del modelo objetivo, expertos MTP y experto compartido MTP), BF16 (expertos compartidos del modelo objetivo, tablas n-gram PLE, atención, visión, embeddings, gates) |
| Idiomas soportados | Inglés (etiqueta `en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con manifiesto `MTP_NVFP4_MANIFEST.json` y `SHA256SUMS`) |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.8-Flash-Next, un MoE multimodal ultra disperso con 125B parámetros totales y 6B activos. Tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta emplea Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. El modelo incluye además una tabla de embeddings n-gram de 51B parámetros y una capa MTP (Multi-Token Prediction) con 512 expertos de draft y un experto compartido, diseñada para decodificación especulativa.

La cuantización NVFP4 se aplicó mediante conversión determinista RTN (round-to-nearest) compatible con ModelOpt, con group size 16 y sin dataset de calibración. Todos los 48 bancos de expertos MoE del modelo objetivo, los 512 expertos MTP y el experto compartido MTP se convirtieron a NVFP4; los expertos compartidos del modelo objetivo y las tablas n-gram PLE se mantienen en BF16 con residencia fija en CPU. Los módulos de atención, linear-attention/GDN, visión, embeddings y gates conservan la precisión declarada del checkpoint fuente. No se dispone de información sobre el entrenamiento original (datos, tokens, método de alineación), ya que este repositorio es un derivado cuantizado y abliterado.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto (etiqueta `image-text-to-text`).
- Razonamiento y generación de código: hereda las capacidades del modelo base Qwen3.8-Flash-Next.
- Decodificación especulativa con MTP: soporta profundidad de draft 3, acelerando la generación en hardware Blackwell.
- Tool calling y uso de agentes: el modelo base es compatible con function calling y razonamiento multi-paso.
- Ventana de contexto larga: cualificado para 131 072 tokens en vLLM, con soporte nativo de hasta 1M en el modelo base.
- Multilingüe limitado: la model card solo declara inglés, aunque el modelo base de Qwen soporta múltiples idiomas.
- Modo "uncensored": abliterado para eliminar rechazos de contenido, lo que permite respuestas sin restricciones de seguridad (con los riesgos asociados).

## Casos de uso

- Despliegue de inferencia de alto rendimiento en Blackwell: el checkpoint está cualificado para vLLM en NVIDIA RTX PRO 6000 Blackwell 96 GB, alcanzando 161 tokens/s con contexto de 131K y MTP depth 3. Adecuado para servicios de generación masiva con requisitos estrictos de latencia.
- Procesamiento de documentos largos y codebases completas: gracias a la ventana de 131K tokens (y hasta 1M en el modelo base), puede analizar repositorios enteros, contratos legales o informes extensos en una sola pasada.
- Asistentes de programación con tool calling: integrable en pipelines de CI/CD para generación de código, revisión automatizada o autocompletado, aprovechando el soporte de function calling y razonamiento multi-paso.
- Investigación en decodificación especulativa: el checkpoint sirve como referencia para estudiar el impacto de cuantizar expertos MTP en NVFP4 sobre la tasa de aceptación de tokens draft (974/1689 en la cualificación).
- Aplicaciones multimodales de visión-lenguaje: al aceptar entradas de imagen y texto, puede usarse para descripción de imágenes, respuesta visual a preguntas o generación de informes a partir de capturas.
- Entornos de experimentación sin restricciones de contenido: al ser "uncensored", permite explorar comportamientos del modelo sin filtros de seguridad, útil para investigación académica sobre alineación y sesgos (con las debidas salvaguardas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de cualificación de rendimiento en vLLM:

| Metrica | Valor |
|---|---|
| Tokens de salida (decode-after-prefill) | 161,12 tokens/s |
| Tokens draft aceptados | 974 de 1 689 observados |
| Contexto de servicio | 131 072 tokens |
| Presupuesto VRAM | 88,9 GiB (reservando 6 GiB físicos) |
| Comprobaciones realizadas | 120 031 tokens (multimodal, tool-call, razonamiento, comportamiento, recursos) |

## Requisitos de hardware

- VRAM estimada: 88,9 GiB para el contexto de 131K tokens con KV cache BF16 y offload PLE a CPU. El modelo completo en NVFP4 ocupa aproximadamente 195 GB en disco, por lo que se requiere una GPU con al menos 96 GB de memoria.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell 96 GB (cualificada), o GPUs Blackwell con 96 GB o más (por ejemplo, B200, DGX Spark con 128 GB unificados).
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño del checkpoint y la necesidad de soporte NVFP4 nativo.
- Opciones de despliegue: vLLM (build reciente con soporte Qwen4-Exp/Flash-Next, NVFP4 MoE, MTP y PLE CPU-offload). También se ha documentado SGLang en configuraciones multi-GPU (2× DGX Spark) para el modelo NVFP4 base.
- Latencia y throughput: 161,12 tokens/s en una sola RTX PRO 6000 Blackwell con MTP depth 3 y contexto 131K. El throughput real dependerá del batch size y la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|---|
| aday777/Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP | ~125B (118B safetensors) | 6B | 131K (cualificado) | Apache 2.0 | NVFP4 + BF16 | Derivado abliterado con MTP NVFP4 |
| mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4 | ~125B | 6B | 131K (estimado) | Apache 2.0 | NVFP4 + BF16 | Padre del modelo, sin MTP cuantizado |
| Qwen/Qwen3.8-Flash-Next (original) | 125B | 6B | 1M | Apache 2.0 | BF16 (original) | Modelo base sin abliterar, sin cuantizar |

No se dispone de datos de benchmarks comparativos entre estos modelos. La diferencia principal del modelo evaluado es la cuantización NVFP4 de los expertos MTP y su naturaleza "uncensored".

## Limitaciones y advertencias

- Modelo "uncensored" (abliterado): puede generar contenido inseguro, ilegal, inexacto o dañino. No tiene garantías y el usuario es responsable de la evaluación, control de acceso, cumplimiento legal y uso posterior.
- Requiere una build específica de vLLM: las versiones antiguas de vLLM no cargan el checkpoint. Es necesario verificar `SHA256SUMS` antes de servir y usar `trust_remote_code` solo si la política del entorno lo permite.
- Sesgos y alucinaciones: al ser un derivado sin entrenamiento adicional, hereda los sesgos del modelo base y puede producir alucinaciones, especialmente en tareas de razonamiento complejo o con contexto largo.
- Idioma limitado: la model card solo declara inglés; el rendimiento en otros idiomas no está garantizado.
- Requisitos de hardware elevados: no es desplegable en GPUs de consumo; necesita hardware Blackwell con al menos 96 GB de VRAM.
- Sin datos de benchmarks públicos: no hay métricas estandarizadas (MMLU, HumanEval, GSM8K) que permitan comparar objetivamente su rendimiento con otros modelos.
- La cuantización NVFP4 puede introducir degradación de calidad respecto al checkpoint BF16 original, aunque no se han publicado evaluaciones de pérdida de precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aday777/Qwen3.8-Flash-Next-Uncensored-NVFP4-MTP
- Modelo padre (mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4): https://huggingface.co/mazinb/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Página del modelo Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Repo de GitHub sobre despliegue NVFP4 en DGX Spark: https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Dual-DGX-Sparks
