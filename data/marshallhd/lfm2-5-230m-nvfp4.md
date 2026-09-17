# MarshallHD/LFM2.5-230M-NVFP4

## Resumen

LFM2.5-230M-NVFP4 es un checkpoint cuantizado del modelo compacto LiquidAI/LFM2.5-230M, publicado por el usuario MarshallHD mediante NVIDIA Model Optimizer en formato NVFP4 de 4 bits en coma flotante. No se trata de un modelo entrenado desde cero, sino de una versión de precisión reducida del modelo base de Liquid AI, orientada a inferencia en el borde y en dispositivo con aceleración FP4. El checkpoint conserva la arquitectura original Lfm2ForCausalLM, una red híbrida de 14 capas que combina convolución LIV y bloques de atención con consultas agrupadas (GQA).

El modelo base pesa aproximadamente 230 M de parámetros (el recuento real en safetensors es de 202.168.064), una ventana de contexto de 32.768 tokens y soporte para diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano. La variante NVFP4 mantiene en mayor precisión las capas sensibles (embeddings, lm_head, atención, convoluciones, normalizaciones y las capas exteriores 0-4 y 12-13) y cuantiza únicamente los operadores lineales feed-forward de las capas internas 5 a 11, con un tamaño de grupo de 16 y sin cuantización de la caché KV.

Su relevancia es doble: por un lado demuestra una receta de cuantización PTQ conservadora que apenas degrada la fidelidad respecto a la referencia BF16 (un +3,3 % de perplejidad agregada y una caída de 0,436 puntos en precisión MCQA ponderada), y por otro ofrece una ganancia de velocidad de 1,15x en batch 1 y 1,12x en batch 16 sobre hardware Blackwell. Es, por tanto, un ejemplo práctico de cómo desplegar modelos de borde en FP4 sin pérdida apreciable de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2ForCausalLM, hibrida de 14 capas con convolucion LIV y bloques GQA |
| Parametros totales | 202.168.064 (~202 M; el autor lo etiqueta como 230 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit float) PTQ; operadores lineales feed-forward de capas internas 5-11; group size 16; KV cache sin cuantizar |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (NVFP4, exportado con NVIDIA Model Optimizer 0.46.0) |
| Modulos protegidos en mayor precision | embeddings, lm_head, todas las rutas self_attn*, todas las rutas conv*, normalizaciones, capas 0-4 y 12-13 |
| Herramienta de cuantizacion | NVIDIA Model Optimizer 0.46.0 (wheel nvidia_modelopt-0.46.0) |
| Runtime validado | vLLM 0.29.0 con --quantization modelopt_fp4 |
| Kernel FP4 validado | FlashInferCutlassNvFp4LinearKernel |
| Hardware validado | NVIDIA GB10, Linux |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 149 / 2 |
| Fecha de publicacion | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

Este checkpoint no introduce entrenamiento nuevo: es una cuantizacion post-entrenamiento (PTQ) del modelo LiquidAI/LFM2.5-230M. La arquitectura subyacente es Lfm2ForCausalLM, una red hibrida de 14 capas que alterna convolucion LIV (un operador convolucional de la familia LFM2) con bloques de atencion con consultas agrupadas (GQA). El proceso de cuantizacion se ejecuto con NVIDIA Model Optimizer 0.46.0 sobre Torch 2.10.0a0 (build nv25.12) y se exporto a NVFP4.

La receta es deliberadamente conservadora: se midio la fidelidad frente a la referencia BF16 en un barrido de distintos ambitos de cuantizacion y se escogio el ambito mas rapido que mantuviera la mayor cercania a la referencia. El resultado es que solo los operadores lineales feed-forward de las capas internas 5-11 se cuantizan a NVFP4, mientras que embeddings, lm_head, todas las rutas de atencion y convolucion, las normalizaciones y las capas de ambos extremos de la pila permanecen en mayor precision. El calibrado se realizo con 512 secuencias de hasta 512 tokens procedentes de texto publico en ingles y de prompts de instrucciones con respuestas de referencia, renderizados con la plantilla de chat de LFM2.5, y disjuntas de todos los conjuntos de evaluacion. No se documenta en la informacion disponible ninguna fase de RLHF o DPO especifica para esta variante, mas alla del alineamiento ya presente en el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado text-generation y tag conversational.
- Razonamiento de respuesta corta y tareas de opcion multiple, evaluadas con lm-evaluation-harness sobre MMLU-Pro, ARC-Challenge, HellaSwag y TruthfulQA.
- Generacion de codigo a pequena escala, evidenciada por la evaluacion de perplejidad sobre prompts de funciones Python y por el uso de HumanEval como conjunto de calibracion/evaluacion.
- Capacidad multilingue en diez idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Seguimiento de instrucciones, ya que el conjunto de calibrado incluye prompts de instrucciones con respuestas de referencia.
- Inferencia en el borde y en dispositivo, gracias a su tamano reducido y al formato FP4 para hardware Blackwell.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistentes conversacionales en dispositivo: un modelo de 202 M de parametros en FP4 puede ejecutarse con una huella de memoria inferior a 1 GB, gestionando dialogos multi-turno de hasta 32.768 tokens en moviles, portatiles o dispositivos embebidos equipados con GPU Blackwell, sin enviar datos a la nube.
- Autocompletado y redaccion asistida en local: la perplejidad de 44,083 sobre texto general y una velocidad de 392,7 tokens/s en batch 1 lo hacen adecuado para completar frases y parrafos en editores con latencia baja.
- Prototipado de pipelines de inferencia FP4: sirve como banco de pruebas ligero para validar despliegues con vLLM 0.29.0 y el flag --quantization modelopt_fp4 antes de migrar a modelos mayores con la misma receta.
- Clasificacion y extraccion de entidades en texto multilingue: con soporte para diez idiomas y 32.768 tokens de contexto, puede procesar documentos largos y devolver etiquetas o campos estructurados en tareas de enrutado y triaje.
- Generacion de fragmentos de codigo y explicaciones tecnicas: su perplejidad de 5,554 sobre prompts de codigo (frente a 5,371 de la referencia BF16) indica un comportamiento fiable en completado de funciones cortas y respuestas tecnicas, integrable en editores o asistentes de documentacion.
- Traduccion y adaptacion de contenido entre los diez idiomas soportados, con coste computacional bajo para volumenes altos de texto.
- Filtrado y moderacion previa en cascada: al ser muy barato en tokens/s (hasta 6.214 tokens/s en batch 16), puede usarse como primer clasificador que descarte o derive casos a modelos mayores.
- Respuestas a preguntas frecuentes en kioscos y terminales sin conectividad: la ventana de 32.768 tokens permite incorporar un manual o base de conocimiento extensa directamente en el contexto.

## Benchmarks y rendimiento

Evaluaciones comparadas contra la referencia BF16 bajo ajustes identicos (vLLM 0.29.0, decodificacion greedy, prefix caching desactivado, KV cache en BF16, una sola NVIDIA GB10).

Fidelidad al modelo BF16 (scoring teacher-forced sobre 104.456 tokens de texto general, instrucciones con respuesta y prompts de funciones Python):

| Metrica | Referencia BF16 | NVFP4 PTQ | Delta |
|---|---:|---:|---:|
| Perplejidad, todos los dominios | 20,771 | 21,448 | +3,3 % |
| Perplejidad, texto general | 42,519 | 44,083 | +3,7 % |
| Perplejidad, codigo | 5,371 | 5,554 | +3,4 % |
| Acuerdo top-1 con BF16 | — | 87,8 % | — |
| Divergencia KL vs BF16 | — | 0,042 | — |

Precision en tareas (24.063 ejemplos, lm-evaluation-harness 0.4.13 sobre backend vLLM):

| Benchmark | Ejemplos | Referencia BF16 | NVFP4 PTQ | Delta |
|---|---:|---:|---:|---:|
| MCQA ponderada | 24.063 | 28,434 | 27,997 | -0,436 |
| MMLU-Pro, exact match | 12.032 | 18,027 | 17,478 | -0,549 |
| ARC-Challenge, precision normalizada | 1.172 | 32,082 | 31,570 | -0,512 |
| HellaSwag, precision normalizada | 10.042 | 40,888 | 40,470 | -0,418 |
| TruthfulQA MC1, precision | 817 | 23,378 | 24,480 | +1,102 |

Rendimiento (prompts de 128 tokens, 128 tokens generados, mediana de tres ejecuciones):

| Configuracion | Referencia BF16 | NVFP4 PTQ | Aceleracion |
|---|---:|---:|---:|
| Tokens/s de salida, batch 1 | 342,8 | 392,7 | 1,15x |
| Tokens/s de salida, batch 16 | 5.548,0 | 6.214,4 | 1,12x |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para los pesos cuantizados (el repositorio completo ocupa 0,7 GB) mas el espacio de activaciones y la cache KV. La cache KV no esta cuantizada, por lo que para 32.768 tokens puede anadir decenas de MB segun la configuracion de cabezas del modelo base (dato no confirmado en la informacion disponible).
- GPU recomendadas: por el kernel FP4 validado (FlashInferCutlassNvFp4LinearKernel), se requiere hardware Blackwell con soporte de tensor cores FP4. El fabricante valida explicitamente NVIDIA GB10; son candidatas de la misma generacion las RTX 50, B100/B200 y GB200.
- GPU no recomendadas para FP4 nativo: A100 (Ampere) y H100 (Hopper) no ejecutan el kernel FP4 validado; requeririan descompresion o un kernel alternativo no documentado en esta ficha.
- Compatibilidad con GPU de consumo: si, siempre que sean Blackwell. El modelo cabe holgadamente en cualquier GPU de consumo Blackwell y en muchas integradas de esa generacion; su tamano no es el factor limitante, sino el soporte de kernels FP4.
- Opciones de despliegue: vLLM 0.29.0 con --quantization modelopt_fp4 es el runtime validado; el autor indica tambien SGLang con modelopt_fp4 como destino compatible. Requiere transformers>=5.3.0 y --trust-remote-code.
- Latencia y throughput medidos: 392,7 tokens/s de salida en batch 1 y 6.214,4 tokens/s en batch 16 sobre una unica NVIDIA GB10, con prompts y generacion de 128 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Perplejidad (general) | MCQA ponderada | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---:|---|---|
| MarshallHD/LFM2.5-230M-NVFP4 | ~202 M | 32.768 | NVFP4 (FFN capas 5-11) | 44,083 | 27,997 | lfm1.0 | HuggingFace, 149 descargas |
| LiquidAI/LFM2.5-230M (BF16) | ~202 M | 32.768 | BF16 | 42,519 | 28,434 | lfm1.0 | HuggingFace (modelo base) |
| Otros modelos de borde de ~200-400 M en 4 bits | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con el propio modelo base, ya que la informacion proporcionada no incluye resultados de otros modelos compactos medidos con la misma configuracion de harness. Cualquier comparacion con alternativas como Qwen o SmolLM requeriria ejecutar la misma bateria, dato que no esta disponible aqui.

## Limitaciones y advertencias

- Perdida de fidelidad medible: la cuantizacion NVFP4 incrementa la perplejidad agregada un 3,3 % y reduce el acuerdo top-1 con la referencia BF16 al 87,8 %, con una divergencia KL de 0,042 sobre el soporte top-32 (cota inferior del valor a vocabulario completo).
- Precision absoluta baja en conocimiento: la propia referencia BF16 obtiene un 18,027 en MMLU-Pro y un 28,434 en MCQA ponderada, de modo que se trata de un modelo de borde, no de un modelo de razonamiento o conocimiento extenso. No es adecuado para tareas que exijan alta exactitud factual.
- Sensibilidad al hardware: el kernel FP4 validado solo funciona en Blackwell. Desplegarlo en Ampere, Hopper o hardware sin soporte FP4 puede forzar rutas no validadas o degradar el rendimiento esperado.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de hallucination rate mas alla de TruthfulQA MC1 (24,480 de precision), un valor bajo que sugiere cautela en usos que requieran veracidad.
- Ambito de cuantizacion restringido: al dejar en mayor precision atencion, convoluciones, embeddings y capas exteriores, no se aprovecha la compresion FP4 en toda la red; el ahorro de memoria es limitado en comparacion con una cuantizacion completa.
- KV cache sin cuantizar: la ventana de 32.768 tokens puede consumir memoria adicional no despreciable en lotes grandes, ya que la cache se mantiene en BF16.
- Licencia lfm1.0 (license: other): hereda las condiciones del modelo base de Liquid AI. Es responsabilidad del usuario revisar el texto completo antes de cualquier uso comercial; esta ficha no interpreta dichos terminos.
- Idiomas: aunque se declaran diez idiomas, no se aportan metricas por idioma, por lo que el rendimiento fuera del ingles no esta cuantificado.
- Tool calling y uso agentico: no documentados en la informacion disponible; no deben asumirse en produccion sin validacion previa.
- Artefacto comunitario: el checkpoint lo publica un tercero (MarshallHD), no Liquid AI, con 149 descargas y 2 likes; conviene validar internamente su reproducibilidad antes de adoptarlo.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/MarshallHD/LFM2.5-230M-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE
- NVIDIA Model Optimizer 0.46.0: no se proporciona URL en la informacion disponible (referenciado como wheel nvidia_modelopt-0.46.0-py3-none-any.whl, sha256 1864b4e9921e287b065be3861ab48345144e673273ebb2b94bd9a6119a9eba8e).
- vLLM 0.29.0: no se proporciona URL en la informacion disponible.
- La busqueda web realizada no devolvio resultados relevantes para este modelo (unicamente listados de productos de iluminacion LED), por lo que no se incluyen enlaces adicionales.
