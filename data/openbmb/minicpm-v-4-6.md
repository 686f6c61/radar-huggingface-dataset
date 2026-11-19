# openbmb/MiniCPM-V-4.6

## Resumen

MiniCPM-V 4.6 es un modelo multimodal de lenguaje-imagen (MLLM) desarrollado por OpenBMB, disenado especificamente para despliegue en dispositivos de borde (smartphones, tablets y hardware de bajas prestaciones). Se construye sobre el codificador visual SigLIP2-400M y el modelo de lenguaje Qwen3.5-0.8B, sumando un total de 1.300.428.016 parametros. Su propuesta de valor central es ofrecer comprension de imagen unica, multiples imagenes y video con un coste computacional muy reducido, manteniendo una calidad que el autor situa al nivel de modelos significativamente mayores.

La relevancia del modelo radica en su arquitectura de eficiencia: introduce compresion mixta de tokens visuales 4x/16x y las tecnicas de LLaVA-UHD v4, que reducen los FLOPs de codificacion visual en mas del 50 % y permiten aproximadamente 1,5 veces mas throughput de tokens que Qwen3.5-0.8B. Ademas, es desplegable en iOS, Android y HarmonyOS con codigo de adaptacion abierto.

Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y variantes cuantizadas en GGUF, BNB, AWQ y GPTQ. Su tamano de repositorio es de 2,6 GB, lo que lo hace apto para entornos con memoria limitada y para integracion en pipelines de inferencia locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B, con compresion visual mixta 4x/16x (LLaVA-UHD v4) |
| Parametros totales | 1.300.428.016 (segun safetensors) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ (variantes publicadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF y otras variantes cuantizadas |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 combina un codificador visual SigLIP2-400M con un LLM Qwen3.5-0.8B. La innovacion arquitectonica principal es la compresion mixta de tokens visuales con tasas 4x y 16x, heredada de las tecnicas de LLaVA-UHD v4, que permite alternar entre precision y velocidad segun la tarea. Esta compresion reduce los FLOPs de codificacion visual en mas del 50 % respecto a disenos previos, y el modelo alcanza aproximadamente 1,5 veces el throughput de tokens de Qwen3.5-0.8B.

El modelo hereda las capacidades de comprension de imagen unica, multiples imagenes y video de la familia MiniCPM-V. La model card menciona variantes Instruct y Thinking, lo que sugiere un modo de razonamiento extendido adicional. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto soportada.

## Capacidades

- Comprension de imagen unica, multiples imagenes y video.
- Generacion de texto conversacional a partir de entradas visuales (pipeline image-text-to-text).
- Modo Thinking con razonamiento extendido (variante MiniCPM-V 4.6-Thinking).
- Compresion visual ajustable 4x/16x para equilibrar precision y velocidad.
- Despliegue en dispositivos moviles: iOS, Android y HarmonyOS con codigo de adaptacion abierto.
- Compatibilidad con frameworks de inferencia: vLLM, SGLang, llama.cpp, Ollama y Transformers.
- Soporte de fine-tuning mediante SWIFT y LLaMA-Factory.
- API publica gratuita disponible (anunciada el 2026.05.17).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues especificas: no disponibles.

## Casos de uso

- Asistente visual en movil: el modelo puede ejecutarse en iOS, Android y HarmonyOS para tareas como lectura de documentos, reconocimiento de escritura manual o identificacion de objetos en tiempo real, gracias a su tamano de 1,3 mil millones de parametros y a las variantes cuantizadas.
- Accesibilidad para personas con discapacidad visual: descripcion de escenas y lectura de texto en imagenes capturadas por la camara del telefono, con latencia baja gracias a la compresion visual 4x.
- Procesamiento de tickets y documentos: extraccion de informacion de recibos, entradas y formularios mediante OCR y comprension de layout, aprovechando las capacidades evaluadas en OCRBench.
- Analisis de video en el borde: resumen y descripcion de clips cortos directamente en el dispositivo, sin enviar datos a la nube, lo que resulta adecuado para aplicaciones de privacidad.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes generadas por usuarios en plataformas sociales, con coste de inferencia reducido.
- Asistencia educativa: resolucion de problemas de matematicas o ciencias a partir de fotografias de ejercicios, con el modo Thinking para razonamiento paso a paso.
- Prototipado rapido en GPU de consumo: fine-tuning con LLaMA-Factory o SWIFT en una unica GPU consumer para adaptar el modelo a dominios verticales (medico, industrial, retail).
- Integracion en pipelines de agentes: uso como modulo de percepcion visual dentro de sistemas multi-paso, con soporte en vLLM y SGLang para despliegue servidor.

## Benchmarks y rendimiento

La model card referencia resultados en formato de imagen (no tabulados en el texto proporcionado). Los datos numericos explicitos disponibles son:

| Benchmark / metrica | MiniCPM-V 4.6 | Qwen3.5-0.8B | Qwen3.5-0.8B-Thinking | Ministral 3 3B |
|---|---|---|---|---|
| Artificial Analysis Intelligence Index | 13 | 10 | 11 | 11 |
| Coste de tokens (relativo) | 1x | 19x | 43x | No disponible |
| Throughput de tokens (relativo) | ~1,5x vs Qwen3.5-0.8B | 1x | No disponible | No disponible |

El autor indica que MiniCPM-V 4.6 supera a Qwen3.5-0.8B en la mayoria de tareas de comprension vision-lenguaje y alcanza el nivel de Qwen3.5 2B en benchmarks como OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench. Los valores numericos concretos de estos benchmarks no estan disponibles en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,3 mil millones de parametros, en FP16 requiere aproximadamente 2,6 GB; en cuantizacion de 8 bits, unos 1,3 GB; en 4 bits, alrededor de 0,7 GB (mas overhead de activaciones y del codificador visual).
- GPU recomendadas: A100, H100 o L40S para despliegue servidor de alta concurrencia con vLLM o SGLang; RTX 4090 o RTX 3090 para desarrollo y fine-tuning.
- GPU consumer: cabe holgadamente en GPUs consumer (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090) e incluso en hardware integrado de movil con cuantizacion.
- Opciones de despliegue: Transformers (>= 5.7.0), vLLM, SGLang, llama.cpp, Ollama; en movil, codigo de adaptacion para iOS, Android y HarmonyOS.
- Latencia y throughput: el autor reporta aproximadamente 1,5 veces el throughput de tokens de Qwen3.5-0.8B y publica graficas de TTFT para peticion unica y throughput de alta concurrencia, pero los valores numericos no estan disponibles en el texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Artificial Analysis Index | Licencia | Despliegue en movil |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 | 1,3 B (MLLM) | No disponible | 13 | Apache 2.0 | Si (iOS, Android, HarmonyOS) |
| Qwen3.5-0.8B | 0,8 B (LLM) | No disponible | 10 | No disponible | No indicado |
| Qwen3.5-0.8B-Thinking | 0,8 B (LLM) | No disponible | 11 | No disponible | No indicado |
| Ministral 3 3B | 3 B | No disponible | 11 | No disponible | No indicado |

MiniCPM-V 4.6 ofrece la mayor puntuacion del indice de inteligencia de la comparativa con el menor coste de tokens, ademas de ser el unico con capacidades multimodales explicitas y despliegue movil verificado. Qwen3.5 2B se menciona como referencia de rendimiento en benchmarks de vision-lenguaje, pero no se dispone de sus especificaciones completas en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser un modelo de 1,3 mil millones de parametros, su capacidad de razonamiento abstracto y conocimiento factual es inferior a la de modelos de mayor tamano; el propio autor lo situa en el nivel de Qwen3.5 2B en varias tareas.
- Riesgo de alucinacion en descripciones visuales detalladas y en OCR de documentos con baja calidad o layouts complejos.
- La longitud de contexto no esta especificada en la informacion disponible, lo que dificulta planificar su uso en tareas de contexto largo.
- No se detallan los idiomas soportados; aunque el modelo se presenta en ingles en la model card, el rendimiento en castellano u otros idiomas no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los modelos base (SigLIP2 y Qwen3.5) por si imponen restricciones adicionales.
- El uso de `torchcodec` para decodificacion de video puede fallar con ciertas versiones de CUDA; el autor recomienda alternativas como PyAV o fijar la version de CUDA.
- Las capacidades de tool calling y agentes no estan documentadas en la informacion proporcionada; su uso en pipelines de agentes requiere validacion previa.
- El rendimiento en video puede degradarse con clips largos o de alta resolucion debido a la compresion de tokens visuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Wiki de MiniCPM (chino): https://openbmb.cn/docs/
- CookBook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Demo
- Documentacion de la API: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Repositorio LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Paper referenciado (arXiv:2604.27393): https://arxiv.org/abs/2604.27393
- Paper referenciado (arXiv:2509.18154): https://arxiv.org/abs/2509.18154
- Paper referenciado (arXiv:2408.01800): https://arxiv.org/abs/2408.01800
- Paper referenciado (arXiv:2605.08985): https://arxiv.org/abs/2605.08985
