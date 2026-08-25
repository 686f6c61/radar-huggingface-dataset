# Joestar79/Qwen3.8-27B-OBLITERATED-NVFP4

## Resumen

El modelo `Joestar79/Qwen3.8-27B-OBLITERATED-NVFP4` es una cuantización NVFP4 (W4A16) del checkpoint abliterado `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, que a su vez deriva de `Qwen/Qwen3.8-27B`, el modelo de visión-lenguaje de Qwen. El autor Joestar79 ha empaquetado esta versión para ser servida con vLLM en hardware consumer Blackwell, aprovechando el formato de pesos FP4 de NVIDIA para reducir el peso de 55.6 GB (BF16) a 21.5 GB en disco. El objetivo principal es permitir ejecutar un modelo de 27B con capacidades de visión, tool calling y razonamiento en una sola GPU como la RTX 5090 (32 GB), manteniendo el head MTP (Multi-Token Prediction) para decodificación especulativa.

La relevancia de esta ficha radica en que combina dos técnicas avanzadas: la abliteración (eliminación de rechazos) aplicada por OBLITERATUS y la cuantización NVFP4 de NVIDIA ModelOpt, que en arquitecturas Blackwell ofrece kernels de GEMM reales (FlashInferCutlassNvFp4LinearKernel). El modelo conserva la torre de visión en BF16, por lo que mantiene las capacidades multimodales del original, y el tokenizer y la plantilla de chat son idénticos a los de Qwen3.8-27B, con el dialecto de tool call `qwen3_coder`. El checkpoint tiene 15.193.246.960 parámetros según los archivos safetensors, aunque el nombre comercial indica 27B (dato que se detalla más adelante).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal Gated DeltaNet + atención completa, con torre de visión |
| Parametros totales | 15.193.246.960 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 126.976 tokens (según configuración vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A16) para pesos principales; BF16 para torre de visión, MTP head, embeddings y lm_head |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP4 packed + BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje y visión de 27B de parámetros con una arquitectura híbrida: combina capas de atención completa con capas de atención lineal basadas en Gated DeltaNet, lo que reduce el coste computacional en secuencias largas. La versión original fue entrenada por el equipo de Qwen con datos multilingües y multimodales, y soporta razonamiento, generación de código, tool calling y entrada de imágenes.

Sobre este modelo, el autor OBLITERATUS aplicó la técnica de abliteración V3, que elimina los mecanismos de rechazo y las respuestas de desvío, reduciendo la puntuación MMLU en 2.1 puntos porcentuales frente al modelo stock. El resultado es un modelo sin filtros de seguridad, denominado `OBLITERATUS/Qwen3.8-27B-OBLITERATED`. Posteriormente, Joestar79 cuantizó este checkpoint a NVFP4 (W4A16) usando NVIDIA ModelOpt 0.45.0, manteniendo el head MTP (Multi-Token Prediction) que se utiliza para decodificación especulativa. La cuantización excluye la torre de visión, el head MTP, `lm_head`, embeddings y las proyecciones `conv1d`/`in_proj_a`/`in_proj_b` de las capas de atención lineal, que se mantienen en BF16. Las proyecciones fusionadas `in_proj_qkv` y `in_proj_z` sí se cuantizan, ya que deben empaquetarse para que el cargador de vLLM las acepte.

No se han publicado detalles sobre el dataset de entrenamiento del modelo original ni sobre el proceso de abliteración (solo se menciona que es la versión V3). La cuantización no fue calibrada por tarea, por lo que el rendimiento puede variar respecto al BF16 original.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes como entrada y produce texto, manteniendo la torre de visión en BF16.
- Soporte de tool calling / function calling: usa el dialecto `qwen3_coder` para la plantilla de chat, compatible con el parser de herramientas de vLLM.
- Soporte de agentes y razonamiento multi-paso: el modelo base Qwen3.8-27B incluye capacidades de razonamiento con parser `qwen3`.
- Decodificación especulativa: el head MTP se ha conservado y cableado para vLLM, lo que permite acelerar la generación con `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":4}'`.
- Capacidad multilingüe: no se especifica la lista de idiomas, pero Qwen3.8-27B es un modelo multilingüe de la familia Qwen.
- Sin rechazos: la abliteración elimina los mensajes de negativa y las respuestas defensivas, haciendo que el modelo responda a peticiones que el base rechazaría.

## Casos de uso

- **Asistente de código en local**: el modelo puede generar y explicar código en múltiples lenguajes, y gracias a la decodificación especulativa alcanza ~40 tok/s en una RTX 5090. Es adecuado para entornos de desarrollo con restricciones de hardware.
- **Análisis de imágenes con conversación**: al conservar la torre de visión BF16, se puede usar para describir imágenes, responder preguntas sobre contenido visual o extraer información de capturas en aplicaciones de escritorio.
- **Chat de soporte interno sin filtros**: en un entorno controlado, puede gestionar conversaciones multi-turno con contexto largo (126K tokens) para documentación o asistencia técnica, aunque el usuario debe asumir la responsabilidad legal del contenido.
- **Generación de código con tool calling**: el dialecto `qwen3_coder` permite conectar el modelo a herramientas de desarrollo (por ejemplo, funciones de ejecución de código) mediante la API de vLLM con `--enable-auto-tool-choice`.
- **Investigación sobre alineación y seguridad**: al ser un modelo abliterado, sirve para estudiar el efecto de la eliminación de rechazos en el comportamiento de los modelos, comparando con el original.
- **Despliegue en edge con GPU Blackwell**: al estar cuantizado a NVFP4, el modelo puede ejecutarse en GPUs de consumo con 32 GB (como RTX 5090) o en datacenter con soporte FP4, lo que permite desplegar un modelo de 27B en un solo dispositivo sin necesidad de clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El README solo menciona que la abliteración reduce el MMLU en 2.1 puntos porcentuales respecto al modelo stock, y se reportan mediciones de throughput en una RTX 5090 con vLLM:

| Configuración | Throughput |
|---|---|
| Single stream, MTP ns=4 | ~40 tok/s |
| 4 streams concurrentes | 161 tok/s agregados |
| 8 streams concurrentes | 317 tok/s agregados (~40 por stream) |
| KV cache GPU | 191.118 tokens |
| Tiempo de arranque en caliente | ~140 s |

Estas mediciones corresponden a una configuración con contexto de 126K, KV cache FP8 y `--gpu-memory-utilization 0.94`.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 21.5 GB en disco (19.7 GB de pesos FP4 + 1.7 GB de MTP BF16). Para inferencia con contexto de 126K y KV cache FP8, se necesita al menos 32 GB de VRAM (validado en RTX 5090). Con contexto más corto podría caber en 24 GB, pero no está confirmado.
- GPU recomendada: NVIDIA RTX 5090 (32 GB, SM120) validada; también funciona en cualquier GPU Blackwell y en datacenter con soporte FP4.
- En GPUs consumer, solo las de arquitectura Blackwell (serie RTX 50) tienen kernels NVFP4 nativos; en GPUs anteriores la cuantización puede no ser compatible.
- Opciones de despliegue: vLLM es la librería principal (el modelo está empaquetado para vLLM). No se mencionan otras herramientas como llama.cpp u Ollama, pero se puede intentar cargar con vLLM u otros frameworks que soporten NVFP4.
- Latencia y throughput: con MTP activado, ~40 tok/s en un solo stream; con 8 streams, 317 tok/s agregados. Sin MTP, el rendimiento puede variar.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (stock) | Híbrida Gated DeltaNet + full attention, visión | 27B (aprox.) | 126K | BF16 | Apache-2.0 | Modelo original con rechazos |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | Idem | 27B | 126K | BF16 | Apache-2.0 | Abliterado, sin rechazos |
| Joestar79/Qwen3.8-27B-OBLITERATED-NVFP4 | Idem | 15.19B (safetensors) | 126K | NVFP4 (W4A16) | Apache-2.0 | Cuantización para Blackwell, MTP preservado |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | Idem | 27B | 126K | No especificado | Apache-2.0 | Otra variante abliterada |

No se dispone de datos de rendimiento comparativo entre estas variantes. La diferencia clave es el formato de pesos y la compatibilidad con hardware.

## Limitaciones y advertencias

- El modelo es abliterado: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido que el modelo base rechazaría. El usuario es responsable de la legalidad y consecuencias del contenido generado.
- No debe exponerse sin autenticación en internet público, ya que puede ser utilizado para generar contenido inapropiado.
- La cuantización NVFP4 no fue calibrada por tarea; se recomienda validar contra el modelo BF16 original para aplicaciones críticas.
- El head MTP fue restaurado a partir de los pesos del modelo stock, por lo que el modelo abliterado nunca lo vio; la tasa de aceptación de tokens especulativos puede ser menor que la del stock.
- El modelo base arrastra los sesgos y errores de conocimiento de Qwen3.8-27B; la abliteración no corrige estos defectos.
- No se ha verificado el rendimiento en GPUs que no sean Blackwell; en GPUs anteriores (Ampere, Ada) la cuantización NVFP4 no tiene soporte de kernel nativo.
- El número de parámetros reportado por safetensors (15.19B) difiere del nombre comercial "27B"; el checkpoint parece contener menos parámetros que el modelo base, aunque no se ha explicado la causa. Se recomienda verificar la integridad del modelo antes de usarlo.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Joestar79/Qwen3.8-27B-OBLITERATED-NVFP4)
- [Modelo base abliterado OBLITERATUS/Qwen3.8-27B-OBLITERATED](https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED)
- [Modelo original Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (referencia)
- [Versión abliterada de huihui-ai](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Guía de despliegue en vLLM (Geeky Gadgets)](https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/)
- [Ollama build de Qwen3.8-27B-Uncensored](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored)
- [Artículo sobre la construcción del modelo (blog de stondo)](https://stondo.github.io/posts/obliteratus-qwen38-27b-nvfp4-rtx5090/)
- [Recetas de vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
