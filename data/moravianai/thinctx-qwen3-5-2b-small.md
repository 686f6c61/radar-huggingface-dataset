# moravianai/ThinCtx-Qwen3.5-2B-small

## Resumen

ThinCtx-Qwen3.5-2B-small es una conversión del modelo Qwen3.5-2B realizada por Moravian AI, una empresa checa, mediante su técnica propietaria ThinCtx. El objetivo es reducir drásticamente la memoria necesaria para manejar contextos largos: mantiene la calidad del modelo original pero comprime las claves y valores de la atención (KV cache) de forma que el contexto ocupa aproximadamente 9 veces menos VRAM a 128k tokens y crece unas 19 veces más despacio (0,63 KB por token frente a 12 KB del original). Esta variante "small" añade además cuantización de los pesos a unos 6,4 bits por peso, lo que reduce la descarga a 1,81 GB frente a los 3,94 GB de la variante de precisión completa.

El modelo parte de la arquitectura de Qwen3.5-2B (transformer con 1,88 mil millones de parámetros) y está orientado a generación de texto, conversación, tool calling y contextos muy largos, con soporte declarado para inglés, checo y alemán. Su relevancia actual radica en que permite desplegar un modelo de 2B con ventanas de contexto de 128k a 540k tokens en GPUs de consumo, algo inviable con el modelo original por el coste de memoria del KV cache.

La contrapartida principal es que requiere un runtime específico, `thinctx` (versión mínima 0.3.1, recomendada 1.0.1 o superior), y no funciona correctamente con bibliotecas de inferencia estándar como vLLM, llama.cpp o TGI para gestionar el contexto comprimido. La licencia es PolyForm Small Business 1.0.0, con uso gratuito para pequeñas empresas, uso personal, investigación no comercial y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B, tipo `qwen3_5_text`) |
| Parámetros totales | 1,88 mil millones (Hugging Face muestra 1.728.320 por contar solo tensores de 16 bits; los cuantizados van empaquetados en `aux1.safetensors`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k / 540k tokens (según variante de memoria; ver model card) |
| Tipos de cuantización | Pesos a ~6,4 bits por peso (capa transformer); contexto en RAM comprimido 2,5–3× respecto a 16 bits |
| Idiomas soportados | Multilingüe, con calibración y pruebas en inglés, checo y alemán |
| Licencia | PolyForm Small Business 1.0.0 (uso comercial para grandes organizaciones requiere licencia) |
| Formato de pesos | safetensors (`model.safetensors` + `aux1.safetensors` empaquetado) |

## Arquitectura y entrenamiento

El modelo es una conversión cuantizada de Qwen3.5-2B, no un entrenamiento desde cero. La innovación de ThinCtx no está en los pesos del transformer sino en la gestión de la memoria de contexto: mantiene una parte reducida del KV cache en GPU y el contexto completo en memoria del sistema, con compresión adicional (2,5–3×) en esta variante small. El resultado es que la memoria de GPU dedicada al contexto es unas 9 veces menor a 128k tokens y crece a un ritmo de 0,63 KB por token frente a 12 KB del modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base Qwen3.5-2B y no se detallan en la información proporcionada. La model card indica que el modelo está calibrado y probado en inglés, checo y alemán, y que utiliza la plantilla de chat de Qwen3.5. La decodificación y el rendimiento en generación con contextos largos (512k tokens o más) son superiores al original en vLLM según el autor, aunque la lectura de prompts largos es más lenta que en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno con ventanas de contexto muy largas (hasta 540k tokens según la variante).
- Tool calling y function calling: el autor reporta BFCL de 69,0 frente a 60,0 del original en los mismos ítems.
- Razonamiento multi-paso y uso como agente, gracias al contexto extendido y al soporte de herramientas.
- Multilingüe con calibración específica en inglés, checo y alemán.
- Modo de pensamiento (`enable_thinking`) expuesto a través del servidor compatible con OpenAI.
- API compatible con OpenAI chat-completions (streaming y no streaming, herramientas).
- Compartición de memoria entre conversaciones que empiezan con el mismo system prompt (Linux, thinctx ≥ 1.0).

## Casos de uso

- Atención al cliente automatizada: conversaciones multi-turno con historial muy largo (hasta 540k tokens) sin disparar el consumo de VRAM, adecuado para agentes que necesitan recordar todo el contexto de un cliente durante una sesión extensa.
- Análisis de documentos largos: resumen y extracción de información de contratos, informes o expedientes de cientos de miles de tokens manteniendo el contexto completo en RAM del sistema y solo una fracción en GPU.
- Asistentes de código en producción: integración vía API compatible con OpenAI con soporte de tool calling para pipelines de CI/CD, revisión de repositorios completos o generación de parches con contexto de proyecto amplio.
- Agentes autónomos multi-paso: el modelo puede encadenar llamadas a herramientas y razonamiento sobre resultados previos, con la ventaja de que el contexto acumulado no agota la GPU.
- Despliegue en GPUs de consumo: al necesitar solo 1,9–2,2 GB de VRAM para pesos y contexto a 128k/540k tokens, es viable en tarjetas de gama media para prototipos y entornos de desarrollo.
- Procesamiento multilingüe en inglés, checo y alemán: útil para empresas centroeuropeas que necesitan un asistente que cubra esos tres idiomas con contexto largo.
- Evaluación e investigación: al ser gratuito para investigación no comercial y evaluación, sirve para experimentar con técnicas de compresión de contexto y compararlas con el modelo base.

## Benchmarks y rendimiento

| Benchmark | ThinCtx-Qwen3.5-2B-small | Qwen3.5-2B (original) |
|---|---|---|
| BFCL (function calling, mismos ítems) | 69,0 | 60,0 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar. El autor indica que la generación es más rápida que el original en vLLM con 512k tokens de contexto o más, pero no se aportan cifras de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: 1,9–2,2 GB de GPU para pesos y contexto a 128k/540k tokens (frente a 5,1/9,8 GB del original).
- Contexto completo en RAM del sistema: comprimido 2,5–3× respecto a 16 bits.
- GPU: NVIDIA con soporte CUDA; el wheel por defecto de PyTorch 2.11 requiere driver con CUDA 13 (con driver antiguo, instalar `torch==2.11.*` desde el índice cu128).
- Cabe en GPUs de consumo con al menos ~2,2 GB de VRAM libre, siempre que se use el runtime thinctx.
- Plataformas: Linux x86_64 o Windows 10/11 mediante WSL2; macOS no soportado.
- Despliegue: exclusivamente mediante el runtime `thinctx` (comando `thinctx chat`, `thinctx serve` o API Python `thinctx.load`). No es compatible con vLLM, llama.cpp, Ollama o TGI para la gestión del contexto comprimido.
- Servidor compatible con OpenAI en el puerto indicado, con autenticación básica opcional.
- Latencia y throughput: no disponibles en cifras concretas; el autor afirma que la generación es más rápida que el original en contextos de 512k o más, pero la lectura de prompts largos es más lenta que en el modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThinCtx-Qwen3.5-2B-small | 1,88B (pesos ~6,4 bits) | 128k / 540k | PolyForm Small Business 1.0.0 | Hugging Face, runtime thinctx | Contexto comprimido, requiere runtime propio |
| ThinCtx-Qwen3.5-2B (variante completa) | 1,88B (16 bits) | 128k / 540k | PolyForm Small Business 1.0.0 | Hugging Face, runtime thinctx | Misma técnica, sin cuantización de pesos; 3,94 GB de descarga |
| Qwen3.5-2B (original) | 1,88B | No disponible en la información | No disponible en la información | Hugging Face | Modelo base; KV cache de 12 KB por token, 5,1/9,8 GB de VRAM a 128k/540k |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría más allá del BFCL frente al original.

## Limitaciones y advertencias

- Requiere el runtime `thinctx` (≥ 0.3.1, recomendado ≥ 1.0.1); no funciona con bibliotecas de inferencia estándar para la gestión del contexto comprimido.
- Solo Linux x86_64 y Windows vía WSL2; macOS no está soportado.
- La lectura de prompts largos es más lenta que en el modelo base.
- La compartición de memoria entre conversaciones con el mismo system prompt solo está disponible de forma nativa en Linux (no en WSL).
- Licencia PolyForm Small Business 1.0.0: el uso comercial en grandes organizaciones requiere licencia de pago; el acceso está sujeto a un formulario de aceptación (gated).
- Riesgo de alucinación inherente a un modelo de 1,88B; no se han publicado evaluaciones de sesgo ni de robustez.
- Idiomas calibrados y probados: inglés, checo y alemán; el rendimiento en otros idiomas no está documentado.
- El recuento de parámetros mostrado en Hugging Face (1.728.320) es engañoso porque solo cuenta tensores de 16 bits; el modelo real tiene 1,88B.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-2B-small
- Variante completa: https://huggingface.co/moravianai/ThinCtx-Qwen3.5-2B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Sitio del autor: https://moravian.ai/
- Contacto comercial: info@moravian.ai
