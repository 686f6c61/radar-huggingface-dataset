# openbmb/MiniCPM-V-4.7-1B

## Resumen

MiniCPM-V 4.7 1B es un modelo multimodal de tipo image-text-to-text desarrollado por OpenBMB, orientado a inferencia en dispositivo (on-device). Con 1.554.476.272 parámetros totales y un repositorio de 3,3 GB, se posiciona como la variante ligera de la familia MiniCPM-V 4.7, manteniendo las capacidades de comprensión de imagen única, múltiples imágenes y vídeo de la saga. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo incorpora una arquitectura de codificación visual eficiente basada en la compresión temprana intra-ViT de LLaVA-UHD v4, que reduce el cómputo en las capas posteriores del encoder visual. Además, soporta compresión mixta de tokens visuales 4x/16x, lo que permite ajustar el equilibrio entre detalle visual y coste de inferencia según la tarea. Está pensado para ejecutarse en iOS, Android y HarmonyOS, con soporte day-0 para plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.

Su relevancia actual radica en la densidad de capacidades por recurso: según la model card, en modo Instruct supera sustancialmente a Qwen3.5 0.8B tanto en puntuación global como en eficiencia de inferencia, lo que lo convierte en una opción atractiva para despliegues en móviles, tablets y dispositivos de borde con presupuesto de cómputo limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder visual basado en intra-ViT early compression (LLaVA-UHD v4) y compresión mixta de tokens visuales 4x/16x |
| Parametros totales | 1.554.476.272 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ, FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers), GGUF, BNB, AWQ, GPTQ |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 1B es un modelo multimodal construido sobre un transformer con un encoder visual que aplica compresión temprana de tokens intra-ViT: los tokens visuales se comprimen dentro del propio encoder, reduciendo el cómputo en las capas posteriores. Adicionalmente, soporta compresión mixta de tokens visuales 4x/16x, un mecanismo que permite al desarrollador elegir entre mayor detalle visual (4x) o menor coste de inferencia (16x) según la tarea. Esta arquitectura deriva de la técnica presentada en LLaVA-UHD v4.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card menciona la publicación de Self-Replay Fine-Tuning (SRFT), un enfoque de fine-tuning que ayuda a extender capacidades del modelo a bajo coste reduciendo el olvido de capacidades existentes, pero no detalla el proceso de entrenamiento original.

## Capacidades

- Comprensión de imagen única, múltiples imágenes y vídeo.
- Generación de texto condicionada a entrada visual (image-text-to-text).
- Modo Instruct con capacidades de instrucción mejoradas respecto a MiniCPM-V 4.6.
- Compresión configurable de tokens visuales (4x/16x) para equilibrar detalle y coste.
- Despliegue en dispositivos móviles: iOS, Android y HarmonyOS.
- Soporte de frameworks de inferencia: SGLang, vLLM, llama.cpp y Ollama.
- Soporte de fine-tuning: SWIFT y LLaMA-Factory.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades conversacionales multi-turno.
- No se especifica soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se especifican capacidades de audio ni thinking mode en la información disponible.

## Casos de uso

- Asistencia visual en movilidad: el modelo puede ejecutarse en iPhone, Android y HarmonyOS para tareas de descripción de imágenes, lectura de documentos o identificación de objetos en tiempo real, gracias a su tamaño de 1B parámetros y soporte on-device.
- Procesamiento de documentos en el borde: con compresión de tokens visuales 4x/16x, se puede ajustar el coste de inferencia para digitalizar y extraer información de facturas, tickets o formularios en dispositivos con recursos limitados.
- Comprensión de vídeo en dispositivos locales: al soportar entrada de vídeo, puede emplearse para resumen de clips, detección de eventos o accesibilidad en aplicaciones móviles sin enviar datos a la nube.
- Integración en pipelines de CI/CD para análisis de capturas: mediante soporte de vLLM/SGLang y cuantización FP8, se puede desplegar en servidores para analizar capturas de pantalla o imágenes generadas en pruebas automatizadas.
- Fine-tuning especializado con SRFT: desarrolladores pueden adaptar el modelo a dominios concretos (por ejemplo, inspección industrial o asistencia médica visual) con bajo coste y reduciendo el olvido de capacidades, usando SWIFT o LLaMA-Factory.
- Despliegue en hardware heterogéneo de borde: gracias al soporte day-0 de Rockchip, Houmo, Intel, AMD y Arm, se puede integrar en kioscos, cámaras inteligentes o pasarelas IoT para tareas de visión por computador.
- Prototipado rápido con Ollama o llama.cpp: al disponer de variantes GGUF, es posible probar el modelo en portátiles con GPU consumer antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye gráficas comparativas (frontera de Pareto rendimiento-eficiencia y rendimiento global en modo Instruct) que muestran que la variante 1B supera a Qwen3.5 0.8B en puntuación global y eficiencia de inferencia, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,55B parámetros, en FP16 requeriría aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache. En cuantización de 8 bits (FP8/BNB) bajaría a ~1,6 GB, y en 4 bits (GGUF/AWQ/GPTQ) a ~0,8-1 GB.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, es viable en GPUs consumer como RTX 3060/4060/4090 y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM en FP16 o 2 GB en cuantización 4 bits.
- Opciones de despliegue: SGLang, vLLM, llama.cpp, Ollama, Transformers (>=5.18.0 con torchvision y torchcodec).
- Plataformas de chips soportadas: Rockchip, Houmo, Intel, AMD, Arm; sistemas iOS, Android y HarmonyOS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B | 1,55B | No disponible | Apache 2.0 | Hugging Face, on-device (iOS/Android/HarmonyOS) | Supera a Qwen3.5 0.8B en puntuación global y eficiencia según model card |
| Qwen3.5 0.8B | ~0,8B | No disponible | No disponible en la información | No disponible en la información | Referencia comparativa citada por el autor |
| MiniCPM-V 4.6 | No disponible | No disponible | No disponible | No disponible | Generación anterior de la familia; base de MiniCPM-OCR 1.0 |

No se dispone de datos suficientes para comparar contexto, rendimiento numérico ni disponibilidad de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo.
- Riesgo de alucinación inherente a modelos generativos multimodales; no se han publicado evaluaciones específicas de fidelidad en la información disponible.
- Longitud de contexto no especificada, lo que dificulta planificar despliegues con documentos o vídeos largos.
- Idiomas soportados no especificados; la model card está en inglés y no se detalla cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los componentes derivados (por ejemplo, técnicas de LLaVA-UHD v4) si se modifican.
- El modo Instruct se compara favorablemente con Qwen3.5 0.8B, pero no se aportan cifras absolutas que permitan validar la afirmación de forma independiente.
- El soporte de tool calling y agentes no está confirmado en la información disponible; verificar antes de usarlo en pipelines agénticos.
- La decodificación de vídeo con torchcodec puede presentar problemas de compatibilidad con ciertas versiones de CUDA (por ejemplo, torch>=2.11 con CUDA 13.1), según advierte la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-DSpark
- GitHub MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- GitHub MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- Documentación MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- Guía de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Demo en vivo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Blog Self-Replay Fine-Tuning: https://openbmb.cn/en/blog/self-replay-fine-tuning
- Repositorio LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
