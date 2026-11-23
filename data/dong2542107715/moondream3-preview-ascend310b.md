# dong2542107715/moondream3-preview-ascend310b

## Resumen

Moondream 3 Preview es un modelo de lenguaje y visión (VLM) de tipo Mixture of Experts con 9.000 millones de parámetros totales y 2.000 millones activos, desarrollado por M87 Labs (equipo de Moondream). El repositorio aquí descrito no es el modelo oficial, sino un **kit de despliegue y pesos derivados** preparados por el usuario `dong2542107715` para ejecutar dicho modelo en una placa Ascend 310B1 (OrangePi AI Pro 20T, 23 GB de memoria unificada, CANN 8.0.0). Resuelve el problema de llevar un VLM de 9B a hardware de borde con acelerador NPU Ascend, algo poco habitual en el ecosistema, dominado por CUDA.

La relevancia es doble: por un lado demuestra que es viable cuantizar el modelo a W4A16 (5,4 GB para el tronco de texto) y mantener el codificador visual en fp16 (0,85 GB), todo ello en un repositorio de 0,6 GB; por otro, documenta con cifras reales de latencia (2,38 s/token en decode, 40,4 s para el vision encoder, 145 s para una pregunta visual completa) el estado actual de la inferencia en Ascend 310B1. El modelo base emplea una arquitectura MoE con tokenizador SuperBPE (`moondream/starmie-v1`) y está pensado para tareas image-text-to-text en inglés.

Conviene subrayar que los pesos aquí alojados son una **derivación cuantizada** de los oficiales y siguen sujetos a la licencia Business Source License 1.1 de M87 Labs, no a MIT ni Apache. Los scripts y la documentación del repositorio, en cambio, se publican bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) vision-language; tronco de texto de 24 capas, vision encoder ViT de 27 capas |
| Parametros totales | 9B (modelo base Moondream 3 Preview) |
| Parametros activos | 2B (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Texto: W4A16 group32 (phase-interleaved); vision: fp16 |
| Idiomas soportados | en |
| Licencia | Business Source License 1.1 (M87 Labs, Inc.); scripts y docs del repo en MIT |
| Formato de pesos | Pesos propietarios del kit (no safetensors ni GGUF estándar); incluye `meta.txt` y tokenizer SuperBPE `moondream/starmie-v1` |

## Arquitectura y entrenamiento

El modelo base es un VLM con arquitectura Mixture of Experts: 9B parámetros totales con 2B activos por token, lo que reduce el coste computacional por paso frente a un denso equivalente. El tronco de texto consta de 24 capas y el codificador visual es un ViT de 27 capas que procesa la imagen en dos crops (`n_crops=2`). El tokenizador es SuperBPE, concretamente `moondream/starmie-v1`, lo que sugiere un vocabulario optimizado para eficiencia de tokens en texto e imagen.

No se dispone de información sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Lo que sí documenta el repositorio es el proceso de conversión: los pesos de texto se cuantizan a W4A16 con agrupación de 32 y entrelazado de fase (phase-interleaved), mientras que los pesos de visión se mantienen en fp16 (el repositorio oficial int4 ya dejaba el vision en bf16 sin cuantizar). El motor de inferencia es un híbrido C++/AscendC con operadores ACLNN, y se ha experimentado con decodificación especulativa mediante prompt-lookup, logrando un 68,8 % de aceptación y una aceleración de decode de 1,92x, aunque sin ganancia neta de extremo a extremo.

## Capacidades

- Generación de texto e inferencia autoregresiva sobre el tronco MoE de 24 capas.
- Comprensión de imágenes mediante ViT de 27 capas (image-text-to-text).
- Respuesta a preguntas visuales (VQA) sencillas, como identificar el color de una forma geométrica.
- Soporte de decodificación especulativa con prompt-lookup para textos repetitivos.
- Capacidades multilingües: únicamente inglés (`en`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- **Despliegue de VLM en borde con NPU Ascend**: el kit permite ejecutar un VLM de 9B en una OrangePi AI Pro 20T con 23 GB de memoria unificada, útil para entornos sin GPU NVIDIA y con restricciones de consumo. La cuantización W4A16 del texto (5,4 GB) y el vision en fp16 (0,85 GB) caben holgadamente en la memoria de la placa.
- **Inspección visual en campo sin conectividad**: con una latencia de 145 s para una pregunta visual de 730 tokens de prefijo y 16 de generación, encaja en escenarios de verificación por lotes o no interactivos (control de calidad, lectura de etiquetas) donde el tiempo de respuesta no es crítico.
- **Prototipado e investigación en AscendC**: el repositorio incluye operadores AscendC, motor C++ híbrido y herramientas de conversión y benchmark, lo que lo convierte en una base para experimentar con cuantización W4A16 y decodificación especulativa sobre 310B1.
- **Validación de cuantizaciones**: sirve como referencia para medir la degradación de un VLM al pasar de bf16 a W4A16 group32, con métricas de correlación (corr 0,9996+ en decode, corr≈1 en vision L0/attn frente a bf16).
- **Procesamiento de imágenes simples en dispositivos de bajo consumo**: tareas de un solo crop y resolución moderada (formas, colores, objetos grandes) donde la pérdida de resolución por `n_crops=2` no afecta al resultado.
- **Educación y demostraciones de ecosistema Ascend**: útil para mostrar el flujo completo de conversión de pesos, compilación de operadores y ejecución en placa, con cifras de rendimiento reproducibles.

## Benchmarks y rendimiento

| Escenario | Resultado | Tiempo |
|---|---|---|
| Text decode (24 capas) | "Hello! How can I help you today?", corr 0,9996+ | 2,38 s/token |
| Text prefill (7 tokens, ACLNN híbrido) | Salida idéntica a decode | 9,9 s |
| Vision encoder (2 crops, ViT 27 capas) | L0/attn corr≈1 frente a bf16 | 40,4 s |
| Image QA (730 tokens prefijo + 16 generados) | Círculo rojo → "The circle is red." | 145 s |
| Decodificación especulativa (prompt-lookup) | 68,8 % aceptación, decode 1,92x (sin ganancia neta E2E) | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **Hardware objetivo validado**: OrangePi AI Pro 20T con Ascend 310B1, 23 GB de memoria unificada, CANN 8.0.0, un solo AI Core.
- **VRAM/memoria estimada**: pesos de texto W4A16 ≈ 5,4 GB; vision fp16 ≈ 0,85 GB; total ≈ 6,25 GB más overhead de activaciones y KV cache.
- **GPU recomendadas**: no aplica; el kit está compilado para Ascend 310B1. No se documenta soporte para A100, H100 ni RTX 4090.
- **¿Cabe en GPU de consumo?**: no disponible para este kit; el despliegue está orientado exclusivamente a la NPU Ascend 310B1.
- **Opciones de despliegue**: motor propio `md3_engine` (C++ + AscendC) del repositorio GitHub `dong-12345/moondream3_310b`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 2,38 s/token en decode, 9,9 s de prefill para 7 tokens, 40,4 s para el vision encoder y 145 s para una respuesta visual completa. El throughput efectivo es inferior a 1 token/s en decode.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue en Ascend 310B1 |
|---|---|---|---|---|
| Moondream 3 Preview (este kit) | 9B totales / 2B activos | no disponible | BSL 1.1 | Sí, validado |
| Moondream 3 Preview oficial | 9B totales / 2B activos | no disponible | BSL 1.1 | No documentado |
| Moondream 2 (versión previa) | no disponible | no disponible | no disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos que permitan una comparación cuantitativa fiable. Las alternativas más cercanas serían otros VLM pequeños (por ejemplo, de la familia Qwen-VL o SmolVLM), pero no se aportan cifras que permitan contrastarlas sin inventar datos.

## Limitaciones y advertencias

- **Licencia restrictiva**: los pesos y sus derivados (incluida esta cuantización) están bajo BSL 1.1 de M87 Labs. Se permite uso en producción, pero no ofrecer el modelo como producto de pago *hosted* o *embedded* que compita con las versiones de pago de M87 Labs. El uso interno organizacional no se considera oferta competitiva. La licencia cambia a Apache 2.0 dos años después de la primera publicación pública de esta versión.
- **Idioma**: solo inglés; no hay soporte multilingüe documentado.
- **Precisión numérica**: el vision encoder presenta desviación acumulada en f16 frente a la referencia bf16, aunque la semántica de las respuestas se mantiene correcta.
- **Atención visual en CPU**: la atención del vision encoder se ejecuta en CPU porque `head_dim=72` entra en conflicto con la restricción de 32B/matmul del 310B1, lo que penaliza la latencia.
- **Resolución de imagen limitada**: el recorte se simplifica a una sola ventana con `n_crops=2`, por lo que las imágenes grandes pierden resolución.
- **Alcance de validación**: solo se ha verificado en OrangePi AI Pro 20T (310B1) con CANN 8.0.0; no hay garantías en otras placas o versiones de CANN.
- **Rendimiento muy bajo**: 2,38 s/token hace inviable el uso interactivo en tiempo real; el caso de uso realista es procesamiento por lotes o no interactivo.
- **Riesgo de alucinación**: no se documenta ninguna evaluación específica; al ser un VLM de tamaño moderado y cuantizado a 4 bits, es esperable cierta degradación en tareas de razonamiento complejo.
- **Sin benchmarks estándar**: no hay datos de MMLU, HumanEval ni similares que permitan evaluar la calidad del modelo base ni el impacto de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dong2542107715/moondream3-preview-ascend310b
- Repositorio de despliegue (código MIT): https://github.com/dong-12345/moondream3_310b
- Licencia BSL 1.1 del modelo oficial: https://huggingface.co/moondream/moondream3-preview/blob/main/LICENSE
- Repositorio oficial de Moondream 3 Preview: https://huggingface.co/moondream/moondream3-preview
- Tokenizer SuperBPE: https://huggingface.co/moondream/starmie-v1
- Contacto de licencias comerciales: contact@m87.ai
