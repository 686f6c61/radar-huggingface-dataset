# openbmb/MiniCPM-V-4.7-35B-A3B

## Resumen

MiniCPM-V 4.7 35B-A3B es un modelo multimodal (image-text-to-text) desarrollado por OpenBMB, el primero de la familia MiniCPM-V en adoptar una arquitectura de mezcla de expertos (MoE). Con 35.212.875.824 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí la denominación A3B), el modelo combina comprensión de imagen única, múltiples imágenes y vídeo con una codificación visual eficiente y capacidades de inferencia en dispositivo.

El modelo se posiciona como el primer MoE de código abierto con inferencia fluida y sin pérdida de rendimiento en dispositivos móviles. Para ello introduce la técnica Lookahead Expert Scheduling (LES) junto con cuantización fina por capas e integración de muestreo especulativo DSpark, logrando velocidades de decodificación superiores a 13 tokens/s con solo 3 GB de memoria en un iPhone 17 Pro Max. Según el autor, en modo Instruct supera la puntuación global de Qwen3.6 35B-A3B con menor tiempo de inferencia.

La arquitectura visual se basa en la compresión temprana intra-ViT de LLaVA-UHD v4 y admite compresión de tokens visuales mixta 4x/16x, lo que permite ajustar el equilibrio entre detalle visual y coste computacional. El modelo se distribuye bajo licencia Apache 2.0, con soporte para iOS, Android y HarmonyOS, así como para plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); visión basada en LLaVA-UHD v4 con compresión intra-ViT temprana |
| Parámetros totales | 35.212.875.824 |
| Parámetros activos | Aproximadamente 3.000 millones (variante A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF, BNB, AWQ, GPTQ, FP8; cuantización fina por capas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); variantes GGUF, BNB, AWQ, GPTQ |

## Arquitectura y entrenamiento

MiniCPM-V 4.7 35B-A3B es un modelo multimodal de arquitectura transformer con mezcla de expertos. El componente de visión emplea la técnica de compresión temprana intra-ViT de LLaVA-UHD v4, que reduce los tokens visuales dentro del codificador visual antes de las capas posteriores, disminuyendo el coste computacional. Además, soporta compresión de tokens visuales mixta 4x/16x, lo que permite a los desarrolladores equilibrar el nivel de detalle visual y el coste de inferencia según la tarea.

La innovación técnica principal es Lookahead Expert Scheduling (LES), una técnica de planificación anticipada de expertos que permite mantener todos los pesos del MoE en almacenamiento secundario y cargarlos de forma anticipada, evitando las pausas por carga repetida que degradan la decodificación en tiempo real. Esta técnica se combina con cuantización fina por capas e integración de muestreo especulativo DSpark. El modelo también se beneficia de Self-Replay Fine-Tuning (SRFT), un método de ajuste fino que permite extender capacidades a bajo coste reduciendo el olvido de capacidades previas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Comprensión de imagen única, múltiples imágenes y vídeo.
- Generación de texto y razonamiento multimodal.
- Inferencia en dispositivo (on-device) en iOS, Android y HarmonyOS.
- Modo Instruct para tareas conversacionales.
- Compresión de tokens visuales configurable (4x/16x) para ajustar detalle y coste.
- Despliegue en plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.
- Integración con frameworks de inferencia: SGLang, vLLM, llama.cpp y Ollama.
- Integración con frameworks de ajuste fino: SWIFT y LLaMA-Factory.
- Muestreo especulativo DSpark para acelerar la decodificación.
- No se especifica soporte explícito de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Asistente visual en dispositivos móviles: el modelo puede ejecutarse en iPhone, Android y HarmonyOS con 3 GB de memoria y más de 13 tokens/s, lo que permite integrar comprensión de imágenes en aplicaciones nativas sin conexión a la nube.
- Descripción y análisis de imágenes en aplicaciones de accesibilidad: dado su soporte de imagen única y múltiples imágenes, puede generar descripciones detalladas de fotografías para usuarios con discapacidad visual, ejecutándose localmente para preservar la privacidad.
- Procesamiento de vídeo en tiempo real en el borde: la compresión de tokens visuales 4x/16x permite ajustar el coste de procesamiento de fotogramas según la capacidad del dispositivo, habilitando análisis de vídeo en equipos con recursos limitados.
- Digitalización y extracción de información de documentos: la familia MiniCPM-V incluye la suite MiniCPM-OCR (basada en MiniCPM-V 4.6), lo que indica que el modelo es adecuado para tareas de parsing de documentos y verificación de resultados en pipelines de OCR.
- Despliegue en hardware heterogéneo de borde: el soporte day-0 para chips de Rockchip, Houmo, Intel, AMD y Arm permite integrar el modelo en dispositivos industriales, cajas de borde y mini-PC sin depender de GPU de datacenter.
- Personalización mediante ajuste fino de bajo coste: con Self-Replay Fine-Tuning (SRFT) y frameworks como SWIFT o LLaMA-Factory, los equipos pueden adaptar el modelo a dominios específicos (medicina, legal, industria) reduciendo el olvido de capacidades previas.
- Servicio de inferencia en servidor con cuantización: las variantes GGUF, AWQ, GPTQ y FP8, junto con el soporte de vLLM y SGLang, permiten desplegar el modelo en servidores con GPUs de gama alta para cargas conversacionales multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La model card indica que, en modo Instruct, el modelo 35B-A3B obtiene una puntuación global superior a Qwen3.6 35B-A3B con menor tiempo de inferencia, y que alcanza más de 13 tokens/s con 3 GB de memoria en un iPhone 17 Pro Max, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 35.212.875.824 parámetros totales, los pesos en FP16 ocuparían aproximadamente 70 GB; las variantes cuantizadas (GGUF, AWQ, GPTQ, FP8) reducen sustancialmente este requisito, aunque no se especifican tamaños exactos.
- GPU recomendadas: no disponible. El modelo está diseñado para despliegue en dispositivo y en plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm, además de frameworks de servidor como vLLM y SGLang.
- Cabe en GPU de consumo: no disponible. El requisito de 3 GB de memoria en iPhone 17 Pro Max sugiere que las variantes cuantizadas para dispositivo son muy ligeras, pero no se detalla el equivalente en GPU de consumo.
- Opciones de despliegue: SGLang, vLLM, llama.cpp, Ollama, iOS, Android, HarmonyOS y plataformas de chips de Rockchip, Houmo, Intel, AMD y Arm.
- Latencia y throughput: más de 13 tokens/s en iPhone 17 Pro Max con 3 GB de memoria. No se dispone de datos de latencia o throughput para GPU de servidor.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B | 35.212.875.824 | ~3.000 millones | No disponible | Apache 2.0 | Hugging Face, GitHub, demo |
| Qwen3.6 35B-A3B | No disponible | No disponible | No disponible | No disponible | No disponible |
| MiniCPM-V 4.6 | No disponible | No disponible | No disponible | No disponible | Hugging Face |

La model card compara el rendimiento del modelo con Qwen3.6 35B-A3B, indicando que MiniCPM-V 4.7 35B-A3B obtiene una puntuación global superior con menor tiempo de inferencia en modo Instruct, pero no se proporcionan tablas detalladas de benchmarks ni especificaciones completas de los modelos comparados.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo.
- Riesgo de alucinación: no se documenta en la información disponible, aunque es un riesgo inherente a los modelos generativos multimodales.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Idiomas soportados: no se detallan, por lo que se desconoce el grado de cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar los términos exactos y las licencias de los componentes de terceros.
- El rendimiento en dispositivo depende de la técnica LES y de la cuantización; sin estas optimizaciones, el modelo puede no alcanzar las velocidades indicadas.
- La información sobre benchmarks es limitada y procede del propio autor, por lo que conviene validarla de forma independiente.
- No se especifica soporte explícito de tool calling o agentes, lo que puede limitar su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- GitHub: https://github.com/openbmb/MiniCPM-V
- Variante DSpark: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Suite MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- llama.cpp-omni (LES): https://github.com/OpenBMB/llama.cpp-omni
- Blog de Self-Replay Fine-Tuning: https://openbmb.cn/en/blog/self-replay-fine-tuning
- Documentación de despliegue: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/deployment_en.md
- Documentación de MiniCPM-V 4.7: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/minicpm_v4dot7_en.md
- API: https://github.com/OpenBMB/MiniCPM-o/blob/main/docs/api.md
- Demo: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.7-Demo
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
