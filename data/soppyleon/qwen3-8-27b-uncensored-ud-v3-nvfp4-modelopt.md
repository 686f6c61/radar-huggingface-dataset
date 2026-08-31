# soppyleon/Qwen3.8-27B-Uncensored-UD-V3-NVFP4-modelopt

## Resumen

El modelo `soppyleon/Qwen3.8-27B-Uncensored-UD-V3-NVFP4-modelopt` es un checkpoint experimental de cuantización mixta basado en `JonathanColetti/Qwen3.8-27B-Uncensored`, que a su vez deriva del modelo multimodal Qwen3.8-27B de Alibaba. El autor, soppyleon, lo presenta como un rebuild de prueba para aislar la influencia del cuantizador (NVIDIA TensorRT Model Optimizer) frente a llm-compressor, manteniendo idénticos el layout de capas y los datos de calibración. El objetivo es verificar si las diferencias de fidelidad observadas en versiones anteriores se deben al algoritmo de cuantización o al calibrado.

El checkpoint combina precisión NVFP4 (W4A4) en las capas MLP profundas, FP8 (W8A8) en atención y capas superiores, y BF16 en embeddings, torre de visión y cabezal MTP. Requiere hardware Blackwell (SM100/SM120) para ejecutar los kernels NVFP4 nativos y se sirve exclusivamente con vLLM, ya que `transformers` no puede cargar pesos NVFP4 empaquetados. Con 19,87 mil millones de parámetros almacenados (el modelo base declara 27B), ocupa 21,81 GiB y está licenciado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con atención lineal (linear_attn) y atención estándar, cabezal MTP (multi-token-prediction) y torre de visión |
| Parametros totales | 27B (modelo base); 19.869.895.920 en este checkpoint cuantizado |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, block 16, escalas FP8 E4M3), FP8 (W8A8 E4M3), BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con NVFP4 empaquetado (2 valores de 4 bits por byte), FP8 y BF16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal denso que combina atención estándar con capas de atención lineal (`linear_attn`), lo que reduce el coste computacional en secuencias largas. Incluye un cabezal de predicción multi-token (MTP) que anticipa varios tokens futuros, y una torre de visión que procesa imágenes. La versión `Uncensored` de JonathanColetti aplica una técnica de abliteración (eliminación de direcciones de rechazo) sobre el modelo original, reduciendo las negativas en tareas de chat, código, razonamiento y tool use.

Este checkpoint concreto no modifica los pesos del modelo base, sino que los cuantiza con NVIDIA TensorRT Model Optimizer. El layout de precisión mixta asigna NVFP4 a las proyecciones MLP de las capas 0–55 (168 módulos), FP8 a todas las proyecciones de atención (64), a las proyecciones de atención lineal (144) y a las MLP de las capas 56–63 (24), además del `lm_head`. Embeddings, normas, torre de visión, `conv1d`, `in_proj_a/b` y el cabezal MTP se mantienen en BF16. La calibración usa 512 secuencias de hasta 2048 tokens procedentes de Ultrachat, OpenCodeInstruct y Glaive Function Calling, con algoritmo `max` (amax absoluto, sin clipping ni búsqueda MSE). No se aplica GPTQ ni cuantización de caché KV.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto, y produce respuestas textuales.
- Razonamiento y resolución de problemas: hereda las capacidades de razonamiento del Qwen3.8-27B, incluyendo matemáticas y lógica.
- Generación de código: entrenado con OpenCodeInstruct, soporta múltiples lenguajes de programación.
- Tool calling / function calling: el dataset de calibración incluye Glaive Function Calling, lo que indica soporte para invocación de herramientas.
- Capacidades de agente: el modelo base está optimizado para flujos de trabajo agénticos y automatización de oficina.
- Modo conversacional: diseñado para diálogos multi-turno con menos rechazos (versión uncensored).
- Predicción multi-token (MTP): el cabezal MTP en BF16 permite anticipar varios tokens, mejorando la velocidad de decodificación.
- Visión: la torre de visión en BF16 permite comprensión de imágenes.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su arquitectura híbrida de atención lineal, reduciendo el coste de memoria en diálogos extensos. Su naturaleza "uncensored" reduce las negativas ante peticiones legítimas de soporte.
- Generación de código en producción: con soporte de tool calling y entrenamiento en OpenCodeInstruct, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests. La cuantización NVFP4 permite desplegarlo en GPUs Blackwell con menor huella de memoria.
- Asistentes de programación con visión: al ser multimodal, puede analizar capturas de pantalla de errores, diagramas o documentación visual y generar código o explicaciones.
- Automatización de oficina: el modelo base destaca en tareas de ofimática, como resumir documentos, extraer datos de tablas o redactar correos, combinando visión y texto.
- Agentes autónomos con tool use: gracias a la calibración con Glaive Function Calling, puede orquestar llamadas a APIs, bases de datos o servicios externos en flujos multi-paso.
- Investigación en cuantización: este checkpoint sirve como banco de pruebas para comparar la fidelidad de ModelOpt frente a llm-compressor, con métricas KL y top-1 documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta métricas de fidelidad de cuantización (KL 0.542 / top-1 0.840 frente al padre BF16 en 180.000 posiciones), pero no incluye resultados de tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- GPU obligatoria: Blackwell (SM100/SM120) para ejecutar los kernels NVFP4 nativos. Verificado en RTX PRO 6000 Blackwell Server Edition.
- VRAM estimada: el checkpoint ocupa 21,81 GiB en disco; en inferencia con vLLM se recomienda al menos 24 GiB de VRAM, aunque el uso real depende de la longitud de contexto y el batch.
- GPUs compatibles: RTX PRO 6000 Blackwell, B200, GB200 y otras con soporte SM120. No funciona en GPUs Ampere o anteriores.
- Opciones de despliegue: vLLM con `--attention-backend flashinfer`. No es cargable con `transformers` directamente.
- Latencia y throughput: no disponibles. La resolución de vLLM confirma cero fallbacks de Marlin y uso del kernel `FlashInferCutlassNvFp4LinearKernel`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | no disponible | BF16 | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-Uncensored (JonathanColetti) | 27B | no disponible | BF16 | Apache 2.0 | HuggingFace |
| Este checkpoint (ModelOpt) | 19,87B almacenados | no disponible | NVFP4+FP8+BF16 | Apache 2.0 | HuggingFace |
| Versión llm-compressor UD V3 | 19,87B almacenados | no disponible | NVFP4+FP8+BF16 | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base, ya que no hay datos de rendimiento frente a otras familias. La principal diferencia entre las dos versiones cuantizadas es el cuantizador (ModelOpt vs llm-compressor) y la ausencia de GPTQ y cuantización de KV cache en esta build.

## Limitaciones y advertencias

- Modelo experimental: el autor lo define explícitamente como un rebuild de prueba para validar una hipótesis, no como un checkpoint listo para producción.
- Hardware restringido: requiere GPU Blackwell (SM100/SM120); no es ejecutable en hardware común de consumo como RTX 4090 o A100.
- Incompatible con `transformers`: los pesos NVFP4 empaquetados solo pueden cargarse con vLLM y su configuración `ModelOptMixedPrecisionConfig`.
- Sin cuantización de KV cache: a diferencia de la versión llm-compressor, este checkpoint no incluye escalas de KV cache; hay que activarla manualmente con `--kv-cache-dtype fp8` si se desea.
- Riesgo de alucinación y sesgos: al ser una versión "uncensored" (abliterada), puede generar contenido inapropiado o no filtrado. No se han documentado evaluaciones de sesgo.
- Datos de calibración limitados: solo 512 secuencias de 2048 tokens, lo que puede afectar la generalización de las escalas de cuantización en dominios fuera de esos conjuntos.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval u otras pruebas que permitan comparar su rendimiento real con otros modelos.

## Enlaces

- [HuggingFace: soppyleon/Qwen3.8-27B-Uncensored-UD-V3-NVFP4-modelopt](https://huggingface.co/soppyleon/Qwen3.8-27B-Uncensored-UD-V3-NVFP4-modelopt)
- [HuggingFace: soppyleon/Qwen3.8-27B-Uncensored-UD-V3-NVFP4 (versión llm-compressor)](https://huggingface.co/soppyleon/Qwen3.8-27B-Uncensored-UD-V3-NVFP4)
- [HuggingFace: JonathanColetti/Qwen3.8-27B-Uncensored (modelo padre)](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored)
- [GitHub: AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [FriendliAI: ficha del modelo](https://friendli.ai/models/soppyleon/Qwen3.8-27B-Uncensored-UD-V3-NVFP4)
- [NanoGPT: Qwen 3.8 27B Uncensored](https://nano-gpt.com/models/text/qwen/qwen3.8-27b-uncensored)
