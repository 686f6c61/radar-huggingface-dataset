# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-12.8GB es una compilación cuantizada del modelo base `thinkingmachines/Inkling-2-Mini`, un transformer de tipo Mixture-of-Experts con 26.4B parámetros totales y 5.4B activos, desarrollado originalmente por Thinking Machines. Esta versión, publicada por el usuario shinmegamiboson bajo el compilador de cuantización LookAtMyQuant, comprime los 18.89 GB de pesos nativos en BF16 hasta 12.74 GB, lo que equivale a 3.92 bits por parámetro de texto, manteniendo prácticamente intacta la calidad del modelo original.

La relevancia de esta ficha radica en que demuestra que es posible ejecutar un modelo MoE de más de 26B parámetros en hardware de consumo (Apple Silicon con MLX y GPUs NVIDIA con CUDA) sin sacrificar rendimiento medible en tareas de razonamiento matemático y generación de código. El autor reporta que esta build iguala o supera al original BF16 en GSM8K (94.5% frente a 94.0%) y HumanEval estricto (90.9% frente a 89.6%) sin modificaciones, y alcanza el 95.9% de media en ambas tareas con un límite de tokens de pensamiento de 960.

El modelo está empaquetado para los runtimes MLX (Apple Silicon) y CUDA (NVIDIA), e incluye soporte de decodificación especulativa mediante un drafter DSpark de 4 bits de 179 MB, lo que permite velocidades de decodificación de hasta 100.7 tok/s en un Apple M5 Max. La licencia no está disponible en la información proporcionada, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con enrutamiento por expertos; compilada con trellis/LookAtMyQuant |
| Parametros totales | 26.4B |
| Parametros activos | 5.4B |
| Longitud de contexto | No disponible (se evaluó recall a 16.384 tokens) |
| Tipos de cuantizacion | 3.92 bpp (12.74 GB); familia completa: 5.80 bpp BF16, 3.92, 3.43, 2.72, 1.65, 1.45, 1.18 bpp |
| Idiomas soportados | Inglés y multilingüe (evaluado en 13 idiomas) |
| Licencia | No disponible |
| Formato de pesos | Pesos empaquetados para runtimes MLX y CUDA (librería `trellis`); no safetensors/GGUF estándar |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 26.4B parámetros totales y 5.4B activos, lo que implica que en cada token solo se activa una fracción de los expertos. La compilación LookAtMyQuant aplica una estrategia de "looped-MoE knapsack" que preserva los 109 de 192 buckets de expertos de mayor sensibilidad (2.720 de 6.144 matrices de expertos) en NVFP4 nativo de 4.50 bpp sin error de cuantización, y empaqueta el resto con códigos trellis hasheados por bloques de 4 KB SRAM (`ht2`/`ht3`/`rtr4`, sin buckets de 1 bit). Se impone un suelo de trellis de 2 bits en la cola del output-head.

El proceso de cuantización utiliza Hessianos densos por experto sobre todos los tokens y calibración híbrida. El tiempo total de compilación fue de 0.59 horas-B200 (21.9 minutos de cuantización más 13.2 minutos de pulido en una B200). No se dispone de información sobre el dataset de entrenamiento original del modelo base, el número de tokens, ni si hubo RLHF/DPO, ya que esos datos no aparecen en la información proporcionada.

## Capacidades

- Generación de texto conversacional y de prosa.
- Razonamiento matemático con trazas de pensamiento (`<|content_thinking|>`), con control mediante `max_thinking_tokens`.
- Generación de código, evaluada con HumanEval estricto (ejecución real del código generado).
- Soporte de tool calling y flujos agénticos (evaluado con KL específico para tools/agentic).
- Razonamiento multi-paso y modo "thinking" con cierre controlado de trazas largas.
- Capacidades multilingües (evaluado en 13 idiomas).
- Recall de contexto largo (evaluado a 16.384 tokens con 16 needles).
- Decodificación especulativa mediante drafter DSpark de 4 bits.

## Casos de uso

- Asistencia matemática interactiva: el modelo puede resolver problemas paso a paso con trazas de pensamiento controladas mediante `--max-thinking-tokens 960`, adecuado para tutores automáticos o herramientas de resolución de ecuaciones (p. ej. sistemas lineales como `3x + 4y = 31`).
- Generación de código en producción: con 90.9% en HumanEval estricto y soporte de ejecución real, puede integrarse en pipelines de CI/CD para autocompletado, generación de tests o reparación de código.
- Despliegue en portátiles Apple Silicon: con 12.73 GB activos y 13.51 GB de RAM pico en un M5 Max, permite ejecutar un MoE de 26.4B en local sin GPU dedicada, útil para desarrollo offline.
- Servicio de inferencia en GPU NVIDIA: el runtime CUDA permite servir el modelo vía `lamq serve` en un puerto HTTP con UI, adecuado para prototipos y demos internas.
- Agentes con tool calling: los KL específicos de tools (0.0756) y agentic (0.0514) indican que el modelo conserva capacidad de invocar funciones, útil para asistentes que consultan APIs.
- Procesamiento de documentos largos: el recall 16/16 a 16k tokens permite tareas de extracción de hechos y copia literal en contextos extensos, como resumen de contratos o análisis de informes.
- Atención multilingüe: con KL de 0.0209 en 13 idiomas, puede usarse para traducción asistida o atención al cliente en varios idiomas.

## Benchmarks y rendimiento

| Build | Text GB | bpp | KL raw (en / 13-lang) | KL 6-class | GSM8K (200) | HumanEval (164) |
|---|---:|---:|---:|---:|---:|---:|
| Original BF16 teacher | 18.89 | 5.80 | 0.0000 / 0.0000 | 0.0000 | 94.0% → 94.5% | 89.6% → 97.0% |
| **Esta build (12.8 GB)** | **12.74** | **3.92** | **0.0084 / 0.0209** | **0.0465** | **94.5% → 96.0%** | **90.9% → 95.7%** |
| 11.2 GB | 11.16 | 3.43 | 0.0131 / 0.0315 | 0.0461 | 95.0% → 97.5% | 88.4% → 95.1% |
| 8.9 GB | 8.85 | 2.72 | 0.0278 / 0.0628 | 0.0530 | 95.0% → 96.5% | 84.8% → 94.5% |
| 5.4 GB | 5.38 | 1.65 | 0.0859 / 0.2659 | 0.1440 | 92.5% → 93.5% | 76.8% → 85.4% |
| 4.7 GB | 4.72 | 1.45 | 0.1179 / 0.3731 | 0.1668 | 90.5% → 94.5% | 67.1% → 78.0% |
| 3.9 GB | 3.85 | 1.18 | 0.2189 / 0.6058 | 0.2329 | 86.5% → 88.5% | 59.2% → 70.7% |

Métricas adicionales de la build de 12.8 GB: KL medio 6-class chat-templated de 0.0465 (95.83% de acuerdo top-1); KL por clase: tools 0.0756, agentic 0.0514, reasoning 0.0269, code 0.0286, prose 0.0323, multilingual 0.0639, copy 0.0837. Recall de contraste a 16k: 16/16 (+4.87 / +8.52 nats de margen, mínimo +2.94).

## Requisitos de hardware

- VRAM/RAM estimada: 12.73 GB activos y 13.51 GB de RAM pico en Apple Silicon con el drafter de 4 bits.
- Apple Silicon: probado en Apple M5 Max con MLX; 1.556 tok/s en prefill T=512, 53.8 tok/s en decodificación serial, 100.7 tok/s de mediana con decodificación especulativa (125.9 tok/s en matemáticas, 75.5 tok/s en código).
- NVIDIA CUDA: runtime PyTorch/Triton; la decodificación especulativa DSpark en CUDA está soportada en las builds trellis de 3.9–8.9 GB. Tiempo de compilación medido en 1× B200 (0.59 horas-B200).
- GPU recomendadas: no se especifican modelos concretos de GPU NVIDIA más allá de la B200 usada para compilar; no hay datos de VRAM para A100/H100/RTX 4090.
- Cabe en GPU de consumo: sí, en Apple Silicon de gama alta (M5 Max); no hay confirmación para GPUs consumer NVIDIA.
- Opciones de despliegue: runtime propio `lookatmyquant` (comandos `lamq generate`, `lamq chat`, `lamq serve` con UI HTTP), con backend MLX y CUDA. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia/throughput: ver cifras de Apple M5 Max arriba; no hay datos para CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-LookAtMyQuant-12.8GB | 26.4B (5.4B activos) | No disponible | No disponible | Pesos empaquetados trellis (MLX/CUDA) | Hugging Face, 223 descargas |
| Inkling-2-Mini original BF16 | 26.4B (5.4B activos) | No disponible | No disponible | BF16 (18.89 GB) | Hugging Face |
| Inkling-2-Mini-LookAtMyQuant-8.9GB | 26.4B (5.4B activos) | No disponible | No disponible | Pesos empaquetados trellis | Hugging Face |
| Inkling-2-Mini-LookAtMyQuant-5.4GB | 26.4B (5.4B activos) | No disponible | No disponible | Pesos empaquetados trellis | Hugging Face |

No se dispone de información sobre modelos de otros desarrolladores comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo legal para producción.
- El modelo es una cuantización de terceros, no oficial de Thinking Machines; la calidad depende del compilador LookAtMyQuant y de la build concreta.
- Requiere un runtime propietario (`lookatmyquant`) y no es compatible con ecosistemas estándar como GGUF, vLLM o llama.cpp, lo que limita la portabilidad.
- La decodificación especulativa DSpark en CUDA solo está soportada en builds de 3.9–8.9 GB, no en esta de 12.8 GB.
- El modelo puede generar trazas de pensamiento largas; sin el límite `--max-thinking-tokens 960` puede no cerrar la respuesta correctamente.
- Riesgo de alucinación inherente a modelos generativos; no se han publicado evaluaciones de sesgo en la información disponible.
- El recall a 16k se midió con needles sintéticos; el rendimiento en contextos reales más largos no está verificado.
- Los idiomas soportados se limitan a inglés y multilingüe sin lista cerrada; el KL multilingüe (0.0639) es superior al de inglés, lo que indica mayor degradación en otros idiomas.
- Solo 223 descargas y 1 like: comunidad muy pequeña, sin validación independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter DSpark 4-bit: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Build de 11.2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Build de 8.9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Build de 5.4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Build de 4.7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Build de 3.9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Repositorio del runtime LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Sitio web de LookAtMyQuant: https://lookatmyquant.com/
