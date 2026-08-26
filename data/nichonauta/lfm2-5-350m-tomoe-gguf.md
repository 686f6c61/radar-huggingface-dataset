# Nichonauta/LFM2.5-350M-ToMoE-GGUF

## Resumen

LFM2.5-350M-ToMoE-GGUF es un conjunto de cuantizaciones GGUF del modelo LFM2.5-350M-ToMoE, una conversión Mixture-of-Experts (MoE) por canales del modelo denso LFM2.5-350M desarrollado por Liquid AI. La conversión ha sido realizada por Nichonauta, que ha adaptado la arquitectura ToMoE al formato GGUF para que pueda ejecutarse con llama.cpp, un punto crítico porque la implementación original de ToMoE no tiene representación nativa en ese runtime.

El modelo base LFM2.5-350M es el más pequeño de la familia LFM2.5 de Liquid AI, diseñado para dispositivos con restricciones de memoria y cómputo. Ha sido pre-entrenado con 28 billones de tokens y refinado con aprendizaje por refuerzo a gran escala, lo que le proporciona capacidades mejoradas de chat, seguimiento de instrucciones y llamada a herramientas frente a su predecesor LFM2-350M. Con 354 millones de parámetros y una longitud de contexto de hasta 262144 tokens, ofrece un equilibrio entre calidad y eficiencia para entornos de edge computing.

La versión GGUF, no obstante, no reproduce el comportamiento MoE del modelo original: al no poder representar las máscaras dinámicas por token, se ha reconstruido como un equivalente denso, restaurando las capas de convolución y el MLP completos. Por tanto, esta ficha describe tanto el modelo ToMoE original como la versión GGUF, indicando las diferencias relevantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida) con conversión ToMoE; la versión GGUF es densa-equivalente |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (la versión GGUF es densa; el ToMoE original no publica este dato) |
| Longitud de contexto | 262144 tokens (según Liquid Docs; el ejemplo de llama.cpp usa 32768) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

LFM2.5-350M se basa en la arquitectura LFM2 de Liquid AI, una red híbrida que combina capas convolucionales y atencional para lograr inferencia rápida y eficiencia en memoria. El modelo base ha sido pre-entrenado con 26 billones de tokens y posteriormente refinado mediante reinforcement learning a gran escala, lo que mejora sus capacidades de instrucción, chat y tool calling respecto a la versión anterior LFM2-350M, que se entrenó con 10 billones de tokens.

La conversión ToMoE de Nichonauta introduce una variante de Mixture-of-Experts por canal: cada canal de las capas convolucionales puede ser activado o desactivado dinámicamente mediante máscaras V por token, y el MLP se corta parcialmente. Sin embargo, la versión GGUF no puede representar esta arquitectura en llama.cpp, por lo que se ha reconstruido como un modelo denso: se restauran las capas convolucionales a su anchura completa con los pesos originales, se recupera el MLP completo y las atenciones Q/K ya estaban a plena anchura. Así, la versión GGUF se comporta como el modelo denso base, no como el MoE.

## Capacidades

- Generación de texto en nueve idiomas: inglés, español, árabe, chino, francés, alemán, japonés, coreano y portugués.
- Chat multi-turno y seguimiento de instrucciones, mejorado gracias al pre-entrenamiento extendido y al RL.
- Tool calling y function calling, soportado por el modelo base LFM2.5-350M.
- Inferencia rápida en CPU y GPU, con velocidades de hasta 470 tokens por segundo en una RTX 3060 con cuantización Q4_K_M.
- Ejecución en dispositivos edge con restricciones de memoria y cómputo, gracias a su pequeño tamaño y a las cuantizaciones GGUF.
- Compatibilidad con llama.cpp y sus derivados (llama-server, llama-cli, Ollama) para despliegue local.
- La versión safetensors con `trust_remote_code` sí preserva el comportamiento MoE real, aunque no está disponible en GGUF.

## Casos de uso

- Chatbot local en dispositivos de bajo consumo: el modelo puede ejecutarse en una Raspberry Pi o en un portátil antiguo con llama.cpp, ofreciendo respuestas multilingües sin conexión a internet gracias a su tamaño de 219 MB en Q4_K_M.
- Asistente de atención al cliente en entornos con privacidad estricta: al ejecutarse en local, no se envían datos a servidores externos; su contexto de 262144 tokens permite mantener conversaciones largas y con historial completo.
- Generación de código en entornos de desarrollo con restricciones de hardware: aunque es un modelo pequeño, su soporte de tool calling permite integrarlo en pipelines de CI/CD para autocompletar o revisar fragmentos de código en máquinas sin GPU.
- Traducción y transcripción multilingüe en tiempo real: con soporte para nueve idiomas, puede usarse en aplicaciones de traducción de texto o subtitulación en dispositivos móviles.
- Prototipado rápido de agentes conversacionales: los desarrolladores pueden iterar sobre prompts y flujos de tool calling en local con llama.cpp antes de migrar a modelos más grandes en la nube.
- Investigación en eficiencia de modelos: la comparación entre la versión ToMoE y la densa-equivalente permite estudiar el impacto de la esparsidad en el rendimiento y la calidad en un modelo pequeño.
- Inferencia en tiempo real en sistemas embebidos: con ~470 t/s en una GPU de gama media y ~270 t/s en BF16, el modelo puede integrarse en aplicaciones de voz o generación de texto en streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para Q4_K_M (219 MB) cabe en cualquier GPU con 2 GB o más; Q8_0 (362 MB) y BF16 (678 MB) requieren al menos 1 GB y 2 GB respectivamente, además del contexto y overhead.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el modelo ha sido probado en una RTX 3060, pero también puede ejecutarse en CPU con llama.cpp.
- En consumer GPU: sí, es compatible con GPUs de gama baja como GTX 1650, RTX 2060, RTX 3060, etc. En CPU puede ejecutarse con 4 GB de RAM.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, TGI (si se convierte a safetensors), y el formato GGUF es compatible con la mayoría de runtimes de la familia llama.cpp.
- Latencia y throughput medidos en RTX 3060 con CUDA 13.3 y llama.cpp b10603: ~470 t/s para Q4_K_M, ~370 t/s para Q8_0 y ~270 t/s para BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-ToMoE (safetensors) | 354M | 262144 | LFM Open v1.0 | MoE real por canales, requiere `trust_remote_code` |
| LFM2.5-350M (dense base) | 354M | 262144 | Apache 2.0 | Modelo original de Liquid AI, sin conversión MoE |
| LFM2-350M (anterior) | 354M | 262144 | Apache 2.0 | Versión previa, 10B tokens de pre-entrenamiento |

No hay datos públicos de comparativa con otros modelos de 350M (p. ej., SmolLM-360M o Qwen2.5-0.5B) en la informacion disponible.

## Limitaciones y advertencias

- La versión GGUF no reproduce el comportamiento MoE del modelo original: es una reconstrucción densa que se comporta como el modelo base LFM2.5-350M, no como el ToMoE. Para el MoE real, hay que usar los safetensors con `trust_remote_code`, lo que limita su portabilidad.
- Tamaño pequeño: con 354M parámetros, su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código extenso es limitada en comparación con modelos de miles de millones de parámetros.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inexacto, especialmente en idiomas poco representados en su entrenamiento.
- Licencia LFM Open License v1.0: es una licencia de código abierto con condiciones específicas para uso comercial; hay que revisar los términos completos antes de desplegar en producción.
- Sesgos desconocidos: no se han documentado evaluaciones de sesgo para este modelo, por lo que puede reproducir sesgos presentes en los datos de entrenamiento.
- Contexto largo: aunque el modelo soporta 262K tokens de contexto, el uso de ventanas muy grandes en hardware limitado puede degradar la velocidad y la calidad de las respuestas.

## Enlaces

- HuggingFace del modelo GGUF: https://huggingface.co/Nichonauta/LFM2.5-350M-ToMoE-GGUF
- HuggingFace del modelo ToMoE (safetensors): https://huggingface.co/Nichonauta/LFM2.5-350M-ToMoE
- HuggingFace del modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-350m
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- ModelScope (GGUF oficial): https://www.modelscope.cn/models/LiquidAI/LFM2.5-350M-GGUF
