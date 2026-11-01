# hossain0909/keural-dpo2-6500

## Resumen

Keural-DPO2-6500 es un modelo de lenguaje bilingüe coreano-inglés con arquitectura Mixture-of-Experts (MoE), entrenado desde cero por MKD Corp AI Research (Corea del Sur). Se trata de un checkpoint intermedio de la segunda ronda de entrenamiento DPO (Direct Preference Optimization), concretamente en el paso 6.500 de 7.590 totales (85,6 % completado), entrenado sobre 485.793 pares de preferencia. Resuelve la falta de modelos abiertos optimizados específicamente para coreano con soporte bilingüe, un nicho dominado por modelos generalistas en los que el coreano suele ser un idioma secundario.

El modelo parte de mkd-hossain/keural-sft3-final y ha pasado por un pipeline extenso de preentrenamiento (~69B tokens), tres épocas de SFT y dos rondas de DPO. Con 14,83B parámetros totales y ~7,42B activos por token, ofrece un equilibrio entre capacidad y eficiencia de inferencia. Su relevancia radica en ser uno de los pocos modelos MoE bilingües coreano-inglés con pesos abiertos bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KeuralMoECausalLM (MoE causal LM) |
| Parametros totales | 14,83B (15.368.933.376 según safetensors) |
| Parametros activos | ~7,42B por token (top-2 de 8 expertos) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | Coreano (primario), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (30,7 GB el repositorio) |

## Arquitectura y entrenamiento

Keural emplea una arquitectura MoE con 24 capas, tamaño oculto de 4.096 y 8 expertos con enrutamiento top-2 por token, cada uno con tamaño intermedio de 5.632 y activación SwiGLU. La atención usa GQA (Grouped Query Attention) con 32 cabezas de consulta y 8 de clave-valor, dimensión de cabeza 128, RoPE con theta de 500.000 y una ventana deslizante de 512 tokens en las capas pares. La normalización es RMSNorm con eps=1e-5 y el dtype nativo es bfloat16.

El pipeline de entrenamiento es largo y multifase: dos etapas de preentrenamiento (~50B + ~19B tokens con corpus web coreano e inglés), tres épocas de SFT (710K instrucciones en la primera, 2,35M muestras de 12 fuentes en la tercera) y dos rondas de DPO (440K y 485.793 pares de preferencia respectivamente). La segunda ronda de DPO combina fuentes en inglés (hh_rlhf, ultrafeedback_binarized, orca_dpo_pairs) y coreano (aihub, ko_ultrafeedback_binarized, orca_dpo_pairs_ko), con una distribución 58 % inglés / 42 % coreano. Todo el entrenamiento se realizó en 2× NVIDIA H200 SXM con FSDP FULL_SHARD, precisión mixta bfloat16 y gradient checkpointing. El vocabulario es de 131.074 tokens (SentencePiece con tokens especiales ChatML añadidos).

## Capacidades

- Generación de texto conversacional bilingüe coreano-inglés, con formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Alineación por preferencias humanas mediante dos rondas de DPO (485.793 pares en la ronda 2).
- Instrucción tuning sobre 2,35M muestras de 12 fuentes en la tercera época de SFT.
- Ventana de contexto de 4.096 tokens, adecuada para conversaciones multi-turno moderadas.
- Eficiencia de inferencia MoE: solo ~7,42B parámetros activos por token frente a 14,83B totales.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Capacidades de visión o audio: no disponibles (modelo solo de texto).
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está optimizado con DPO sobre datos coreanos (42 % de los pares de preferencia), lo que lo hace adecuado para chatbots con respuestas alineadas a preferencias humanas en coreano.
- Atención al cliente bilingüe: su ventana de 4.096 tokens permite gestionar conversaciones multi-turno de longitud moderada alternando coreano e inglés sin cambiar de modelo.
- Generación de contenido localizado en corea: redacción de textos, resúmenes y respuestas para productos dirigidos al mercado coreano, aprovechando el preentrenamiento específico en corpus web coreano.
- Traducción y asistencia bilingüe coreano-inglés: útil como base para flujos de trabajo que requieren alternancia de idioma dentro de la misma conversación.
- Despliegue eficiente en producción: con solo ~7,42B parámetros activos por token, el coste de inferencia se aproxima al de un modelo denso de 7B manteniendo la capacidad de uno de 15B.
- Investigación en alineación: al ser un checkpoint intermedio de DPO con datos de entrenamiento documentados en detalle, sirve como caso de estudio para experimentos de preference optimization.
- Fine-tuning adicional: bajo Apache 2.0, puede adaptarse a dominios concretos (legal, médico, finanzas coreanas) sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ningún otro benchmark comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~31 GB (pesos de 30,7 GB), más overhead de KV cache y activaciones; en la práctica se recomienda una GPU con 40 GB o más.
- GPU recomendadas: NVIDIA A100 40 GB/80 GB, H100, H200 o RTX 6000 Ada. Con 2× RTX 4090 (48 GB agregados) podría ejecutarse con `device_map="auto"` mediante sharding de capas.
- No cabe en una única GPU de consumo de 24 GB (RTX 3090/4090) en precisión completa; sería necesario esperar cuantizaciones (GGUF, AWQ, GPTQ) que no están publicadas.
- Despliegue documentado: vLLM (con `--trust-remote-code`, ejemplo incluido en la model card) y la librería transformers de Hugging Face. Compatibilidad con llama.cpp, Ollama o TGI: no disponible (no documentada, y el uso de `custom_code` puede complicar la portabilidad).
- Entrenamiento original: 2× NVIDIA H200 SXM (139 GiB cada una) con FSDP FULL_SHARD.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Keural-DPO2-6500 | 14,83B | ~7,42B | 4.096 | ko, en | Apache 2.0 |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32.768 | multilingue (incl. ko) | Apache 2.0 (algunos pesos) |
| Mixtral 8x7B Instruct | 46,7B | 12,9B | 32.768 | multilingue (coreano limitado) | Apache 2.0 |
| EEVE-Korean-Instruct-10.8B | 10,8B | 10,8B (denso) | 4.096 | ko, en | Apache 2.0 (base) |

Keural se posiciona entre los MoE pequeños (Qwen1.5-MoE) y los densos coreanos especializados (EEVE): tiene más parámetros activos que Qwen1.5-MoE pero un contexto mucho más corto, y frente a EEVE ofrece eficiencia MoE con un pipeline de alineación DPO documentado. Carece de benchmarks públicos que permitan una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Checkpoint intermedio: al estar al 85,6 % del entrenamiento DPO (paso 6.500 de 7.590), el comportamiento final puede diferir del checkpoint completo.
- Contexto de solo 4.096 tokens, muy por debajo de modelos contemporáneos (32K-128K), lo que limita documentos largos y RAG extenso.
- Ventana deslizante de 512 tokens solo en capas pares: la atención a largo alcance dentro del contexto puede verse afectada.
- Sesgos: entrenado con corpus web y datasets de preferencia (hh_rlhf, ultrafeedback, AI Hub), puede heredar sesgos presentes en esos datos, tanto en coreano como en inglés.
- Riesgo de alucinación: no cuantificado; la propia plantilla de sistema del modelo indica que debe admitir cuando no sabe, lo que sugiere que la alucinación es una preocupación reconocida.
- Requiere `trust_remote_code=True` (custom_code), lo que implica ejecutar código del autor del modelo y puede complicar la portabilidad a runtimes como llama.cpp o TGI.
- Es crítico usar `eos_token_id=131073` (`<|im_end|>`) en inferencia; usar `<eos>` (ID 2) provocará generaciones que no se detienen.
- Solo 284 descargas y sin likes: comunidad mínima, sin validación amplia por terceros ni benchmarks independientes.
- Cuantizaciones no disponibles: las opciones de despliegue en hardware de consumo son limitadas de momento.
- Licencia Apache 2.0 sin restricciones comerciales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/keural-dpo2-6500
- Modelo base: https://huggingface.co/mkd-hossain/keural-sft3-final
- Paper, repositorio de código o demo: no disponible
