# openbmb/MiniCPM-V-4.7-35B-A3B-gguf

## Resumen

MiniCPM-V 4.7 35B-A3B es un modelo multimodal de tipo image-text-to-text desarrollado por OpenBMB, el primer modelo de arquitectura Mixture-of-Experts (MoE) de la familia MiniCPM-V. Cuenta con 34.659.889.792 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que le permite mantener una capacidad de razonamiento elevada con un coste computacional reducido por inferencia. El repositorio que se documenta aquí aloja la versión cuantizada en formato GGUF (compatible con llama.cpp) de los pesos originales en BF16.

El modelo está orientado a inferencia en dispositivo (on-device) y combina varias innovaciones técnicas: la técnica Lookahead Expert Scheduling (LES), cuantización fina por capas y muestreo especulativo DSpark, que en conjunto permiten una decodificación de más de 13 tokens por segundo en un iPhone 17 Pro Max, sin sacrificar capacidad. Según el autor, es el primer modelo MoE de código abierto capaz de ejecutarse de forma fluida en dispositivo manteniendo el rendimiento.

MiniCPM-V 4.7 mantiene las capacidades de comprensión de imagen única, múltiples imágenes y vídeo de la familia, e incorpora compresión temprana de tokens visuales dentro del codificador visual, junto con soporte de compresión mixta 4x/16x para equilibrar detalle visual y coste de inferencia. Está publicado bajo licencia Apache 2.0, con soporte de despliegue a través de SGLang, vLLM, llama.cpp y Ollama, y plataformas de ajuste fino como SWIFT y LLaMA-Factory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture-of-Experts (MoE) y vision encoder basado en LLaVA-UHD v4 |
| Parametros totales | 34.659.889.792 |
| Parametros activos | Aproximadamente 3B (variante 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ, FP8 (este repositorio distribuye la version GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en BF16/safetensors disponibles en el repositorio base |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 35B-A3B es un modelo multimodal con arquitectura Mixture-of-Experts, el primer MoE de la serie MiniCPM-V. El componente de vision se construye a partir de la tecnica de compresion temprana intra-ViT de LLaVA-UHD v4, que comprime los tokens visuales dentro del propio codificador visual y reduce la computacion en las capas posteriores del encoder. Ademas, admite compresion mixta de tokens visuales 4x/16x, lo que permite ajustar el equilibrio entre detalle visual y coste de inferencia segun la tarea.

Para habilitar la inferencia en dispositivo se combinan tres tecnicas: Lookahead Expert Scheduling (LES), que emplea prediccion de enrutamiento entre capas para precargar expertos; cuantizacion fina por capas; e integracion de muestreo especulativo DSpark. El regimen de entrenamiento detallado (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se especifica en la informacion disponible. El autor menciona tambien una metodologia de ajuste fino denominada Self-Replay Fine-Tuning, orientada a extender capacidades con bajo coste y reducir el olvido de capacidades previas.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video.
- Generacion de texto en interacciones conversacionales (pipeline image-text-to-text).
- Razonamiento multimodal combinando entrada visual y texto.
- Compresion configurable de tokens visuales (4x/16x) para ajustar detalle frente a coste.
- Inferencia en dispositivo en iOS, Android y HarmonyOS.
- Soporte de despliegue en los frameworks SGLang, vLLM, llama.cpp y Ollama.
- Compatibilidad con pipelines de endpoints (etiqueta endpoints_compatible).
- Ajuste fino mediante SWIFT y LLaMA-Factory.
- Soporte de decodificacion especulativa mediante DSpark.

## Casos de uso

- Asistentes visuales en movil: el modelo puede ejecutarse localmente en iPhone 17 Pro Max a mas de 13 tokens/s, lo que permite describir imagenes, responder preguntas sobre fotos y asistir en tiempo real sin enviar datos a la nube.
- Analisis de documentos con multiples paginas: gracias a las capacidades multi-imagen de la familia MiniCPM-V, puede procesar conjuntos de capturas o escaneos y responder preguntas cruzadas entre ellos.
- Comprension de video: resumen o descripcion de secuencias de video para aplicaciones de accesibilidad, indexacion o vigilancia asistida.
- Asistente de accesibilidad: descripcion de escenas o lectura de texto en imagenes para personas con discapacidad visual, con ejecucion en el propio dispositivo.
- Automatizacion industrial o robotica embebida: el soporte day-0 para plataformas de chip de Rockchip, Houmo, Intel, AMD y Arm permite desplegar el modelo en hardware de borde para inspeccion visual o interaccion hombre-maquina.
- Chat multimodal en aplicaciones de atencion al cliente: el modelo puede gestionar conversaciones en las que el usuario adjunta imagenes (capturas, fotos de productos) y mantener el contexto de la interaccion.
- Prototipado e investigacion en MLLM: al publicarse bajo Apache 2.0 y con variantes GGUF, BNB, AWQ, GPTQ y FP8, es adecuado para experimentar con cuantizacion, ajuste fino y despliegue en distintos backends.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card indica de forma cualitativa que, en modo Instruct, la variante 35B-A3B alcanza una puntuacion global superior en menos tiempo de inferencia que Qwen3.6 35B-A3B, pero no se aportan los valores concretos en el material disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende de la cuantizacion GGUF elegida y de la memoria necesaria para los expertos activos por token.
- Inferencia en dispositivo: el modelo esta disenado para ejecutarse en movil. El autor reporta mas de 13 tokens/s en iPhone 17 Pro Max.
- Plataformas soportadas: iOS, Android, HarmonyOS, ademas de soporte day-0 para chips de Rockchip, Houmo, Intel, AMD y Arm.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Idoneidad para GPU de consumo: no disponible.
- Opciones de despliegue: SGLang, vLLM, llama.cpp y Ollama. Tambien soporte de exportacion de endpoints.
- Fine-tuning: SWIFT y LLaMA-Factory.
- Latencia y throughput: se menciona un rendimiento de decodificacion superior a 13 tokens/s en iPhone 17 Pro Max; no se ofrecen cifras para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B | 34,66B / ~3B | MoE multimodal | no disponible | Apache 2.0 | GGUF, BNB, AWQ, GPTQ, FP8 |
| Qwen3.6 35B-A3B | 35B-A3B (segun referencia del autor) | MoE | no disponible | no disponible | no disponible |

El unico modelo comparable mencionado en la informacion disponible es Qwen3.6 35B-A3B, respecto al cual el autor afirma que MiniCPM-V 4.7 35B-A3B obtiene una puntuacion global superior en menos tiempo de inferencia en modo Instruct. No se dispone de datos cuantitativos detallados ni de otras alternativas para una comparacion completa.

## Limitaciones y advertencias

- No se detallan los sesgos conocidos del modelo en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; no se documenta ninguna mitigacion especifica.
- Idiomas soportados: no se especifica la cobertura linguistica; se desconoce el rendimiento en castellano u otros idiomas.
- Longitud de contexto: no se indica, lo que dificulta planificar el uso en tareas de contexto largo.
- Rendimiento en dispositivos: las cifras de 13+ tokens/s corresponden a un iPhone 17 Pro Max; el rendimiento en otros dispositivos dependera del hardware y de la cuantizacion.
- Al tratarse de una version cuantizada (GGUF), la precision puede degradarse respecto a los pesos BF16 originales; conviene validar en la tarea concreta.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias de llama.cpp y de las plataformas de despliegue empleadas.
- La informacion de benchmarks es cualitativa; no hay numeros publicos disponibles para verificar afirmaciones de rendimiento.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-gguf
- Modelo base en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Documentacion Lookahead Expert Scheduling (LES): https://github.com/tc-mb/llama.cpp-omni/blob/master/docs/les/lookahead-expert-scheduling.md
- Repositorio LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Repositorio MiniCPM-o (documentacion y despliegue): https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Guia de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentacion de API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
