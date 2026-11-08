# mradermacher/roleplay-Xing4.0-29B-GGUF

## Resumen

roleplay-Xing4.0-29B-GGUF es una colección de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo base hunter-P/roleplay-Xing4.0-29B, un ajuste fino orientado a conversación y rol del modelo Xing4.0-29B-A4B publicado por China Telecom AI. El modelo original es un Mixture of Experts (MoE) de aproximadamente 29.000 millones de parámetros totales con unos 4.000 millones activos por token, entrenado íntegramente sobre NPU Ascend y liberado bajo licencia Apache 2.0 según la información pública disponible. Esta variante concreta no modifica la arquitectura ni los pesos: solo los convierte a cuantizaciones de llama.cpp para facilitar su despliegue en hardware de consumo.

El interés de esta ficha reside en dos factores. Por un lado, el modelo base combina una ventana de contexto de 256K tokens con un régimen MoE de activación dispersa, lo que permite razonamiento de largo alcance con un coste de inferencia relativamente bajo. Por otro lado, el ajuste roleplay-Xing4.0-29B está especializado en diálogo multi-turno y reconocimiento de intención, lo que lo hace candidato para asistentes conversacionales y agentes con memoria extensa.

No obstante, conviene subrayar que la información publicada por el autor de la cuantización es mínima: no se declaran idiomas, licencia propia ni pipeline, y no se han publicado resultados de benchmarks específicos para el ajuste roleplay. Los datos técnicos que se ofrecen a continuación provienen del modelo base Xing4.0-29B-A4B y de los metadatos del repositorio GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con atención multi-cabeza latente (MLA), multi-head cross (MHC) y multi-token prediction (MTP), según los tags del modelo base |
| Parametros totales | 31.215.031.088 (≈31,2 B; el autor del modelo base lo denomina 29B) |
| Parametros activos | ≈4 B por token (variante A4B del modelo base) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | Chino e inglés (según tags del modelo base); no disponible para el ajuste roleplay |
| Licencia | Apache 2.0 (modelo base); no disponible para esta cuantización |
| Formato de pesos | GGUF (cuantizaciones estáticas de llama.cpp); pesos originales en safetensors |

## Arquitectura y entrenamiento

El modelo base Xing4.0-29B-A4B es un transformer de tipo Mixture of Experts con enrutamiento disperso: de los aproximadamente 31.200 millones de parámetros totales, solo unos 4.000 millones se activan por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. Los tags públicos del modelo base indican el uso de atención multi-cabeza latente (MLA), mecanismo multi-head cross (MHC) y multi-token prediction (MTP), técnicas habituales para reducir el coste de la caché KV en contextos largos y acelerar la decodificación. La ventana de contexto declarada es de 256K tokens.

El entrenamiento del modelo base se realizó íntegramente sobre NPU Ascend, un dato relevante porque demuestra la viabilidad de pipelines de entrenamiento a gran escala fuera del ecosistema NVIDIA. No se dispone de información pública sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El ajuste roleplay-Xing4.0-29B, del que parte esta cuantización, es un fine-tuning posterior orientado a conversación, pero su model card no detalla la metodología, los datos utilizados ni los hiperparámetros. La cuantización de mradermacher se limita a una conversión estática con `convert_type: hf` y `quantize_version: 2`, sin modificaciones arquitectónicas.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en diálogo de rol y mantenimiento de personaje.
- Reconocimiento de intención (intent recognition) y extracción de información, según los tags del modelo base.
- Razonamiento de largo alcance gracias a la ventana de contexto de 256K tokens del modelo base.
- Capacidades multilingües limitadas a chino e inglés según los tags del modelo base; el ajuste roleplay no declara idiomas adicionales.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo base se describe como "agent model", pero no se detallan mecanismos específicos.
- Modo thinking explícito, visión o audio: no disponible en la información proporcionada.
- Decodificación multi-token (MTP) en el modelo base, que puede acelerar la generación.

## Casos de uso

- Asistentes conversacionales de rol: el ajuste roleplay está diseñado para mantener personajes coherentes en conversaciones multi-turno; la ventana de 256K tokens permite conservar el historial completo de una sesión larga sin truncar el contexto.
- Atención al cliente automatizada: el reconocimiento de intención del modelo base permite clasificar la petición del usuario y derivarla al flujo adecuado, mientras que el ajuste conversacional mantiene un tono natural.
- Extracción de información en documentos largos: con 256K tokens de contexto se pueden procesar contratos, informes o expedientes completos y extraer entidades y relaciones en una sola pasada.
- Agentes de investigación con memoria extensa: la combinación de MoE (bajo coste por token) y contexto largo permite iterar sobre grandes volúmenes de texto en pipelines agénticos sin reventar el presupuesto de inferencia.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M o IQ4_XS permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM, algo inviable con los pesos en fp16.
- Prototipado rápido de chatbots especializados: la disponibilidad de múltiples cuantizaciones GGUF facilita probar el modelo en llama.cpp u Ollama antes de comprometerse con un despliegue en producción.
- Generación de guiones y narrativa interactiva: el sesgo hacia el rol y la conversación lo hace adecuado para videojuegos narrativos o herramientas de escritura asistida con personajes persistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 rondan los 62 GB; en Q8_0 unos 33 GB; en Q6_K unos 26 GB; en Q5_K_M unos 22 GB; en Q4_K_M unos 19 GB; en Q3_K_M unos 15 GB; en Q2_K unos 11 GB. Estas cifras son estimaciones a partir del tamaño del repositorio y deben considerarse orientativas, ya que la caché KV para 256K tokens añade consumo adicional significativo.
- GPU recomendadas: A100 80 GB o H100 para fp16 y contextos largos; RTX 6000 Ada / L40S para Q8_0; RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 16-24 GB usando cuantizaciones Q4 o inferiores. En GPUs de 12 GB solo caben Q2_K o IQ4_XS con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput estimados: no disponible en la información proporcionada. Al ser un MoE con ~4B activos, se espera un throughput superior al de un modelo denso de 29B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| roleplay-Xing4.0-29B-GGUF (esta ficha) | ≈31,2 B | ≈4 B | 256K (base) | Apache 2.0 (base) | GGUF |
| Xing4.0-29B-A4B (base) | ≈29 B | ≈4 B | 256K | Apache 2.0 | safetensors |
| Xing4.0-29B-Intent-ROCmFP4-GGUF | ≈29 B | ≈4 B | 256K | Apache 2.0 | GGUF (ROCmFP4) |
| roleplay-Xing4.0-29B-gguf (juanml82) | ≈29 B | ≈4 B | 256K | no disponible | GGUF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con alternativas de la misma categoría. Las variantes listadas son conversiones del mismo modelo base o ajustes derivados, no modelos independientes.

## Limitaciones y advertencias

- La model card de esta cuantización no declara licencia propia; la licencia Apache 2.0 corresponde al modelo base y conviene verificarla antes de un uso comercial.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para el ajuste roleplay; en dominios especializados el riesgo de alucinación es alto y requiere validación humana.
- El ajuste está orientado a rol y conversación, por lo que puede mostrar deriva de personaje o inconsistencia factual en tareas de razonamiento estricto.
- Los idiomas declarados (chino e inglés) no incluyen el español; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- El contexto de 256K tokens encarece la caché KV; en cuantizaciones bajas y GPUs de consumo el contexto efectivo práctico será mucho menor.
- Las cuantizaciones Q2_K y Q3_K degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No hay información sobre el proceso de fine-tuning del ajuste roleplay, lo que dificulta auditar su comportamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su funcionamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/roleplay-Xing4.0-29B-GGUF
- Modelo base del ajuste: https://huggingface.co/hunter-P/roleplay-Xing4.0-29B
- Variante ROCmFP4: https://huggingface.co/kingjones777/Xing4.0-29B-Intent-ROCmFP4-GGUF
- Variante GGUF alternativa: https://huggingface.co/juanml82/roleplay-Xing4.0-29B-gguf
- Ficha del modelo base Xing4.0-29B-A4B: https://ai-tldr.dev/models/xing4-0-29b-a4b/
