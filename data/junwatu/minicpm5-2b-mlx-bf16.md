# junwatu/MiniCPM5-2B-MLX-BF16

## Resumen

El modelo MiniCPM5-2B-MLX-BF16 es una conversión a formato MLX en bfloat16 del modelo MiniCPM5-2B, desarrollado por el equipo de OpenBMB. Se trata de un transformer denso de 2.500 millones de parámetros, diseñado para despliegue en dispositivos locales, escenarios con recursos limitados y aplicaciones de inteligencia artificial en el borde. La conversión ha sido realizada por el usuario junwatu y publicada bajo licencia Apache-2.0.

Este modelo destaca por su ventana de contexto de 131.000 tokens y su soporte de tool calling, lo que lo hace adecuado para agentes conversacionales y aplicaciones que requieren razonamiento multi-paso. Al estar optimizado para Apple Silicon mediante la librería MLX, ofrece una alternativa eficiente para ejecución local sin necesidad de infraestructura en la nube. La versión en formato BF16 no incluye cuantización, lo que preserva la precisión original del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM, 42 capas, GQA 16Q/2KV |
| Parametros totales | 2.516.756.480 (2.5B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.000 tokens |
| Tipos de cuantizacion | BF16 (sin cuantización) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LlamaForCausalLM, con 42 capas y atención de consultas agrupadas (GQA) con 16 cabezas de consulta y 2 cabezas de clave/valor. Es un modelo denso, no una mezcla de expertos. La ventana de contexto de 131.000 tokens permite procesar documentos extensos y mantener conversaciones largas sin perder información relevante.

Los datos de entrenamiento incluyen los conjuntos Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Esta composición sugiere un proceso que combina preentrenamiento en texto web, ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL), con especial énfasis en tareas de matemáticas, código y agentes. La conversión a MLX se realizó con `mlx_lm.convert` usando el dtype `bfloat16`, sin cuantización adicional.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Ventana de contexto larga de 131.000 tokens, adecuada para análisis de documentos extensos.
- Soporte de tool calling / function calling, según los datasets de agentes y RL incluidos en el entrenamiento.
- Optimizado para ejecución en dispositivos Apple Silicon mediante MLX, con soporte en mlx-lm y SGLang con backend Metal.
- Capacidades de razonamiento matemático y generación de código, derivadas de los datasets UltraData-Math y UltraData-Code.
- Diseñado para escenarios on-device y edge AI, con un tamaño reducido que facilita el despliegue local.

## Casos de uso

- Asistentes conversacionales en dispositivos Apple: el modelo puede ejecutarse localmente en Mac o iPad con MLX, ofreciendo respuestas en inglés o chino sin conexión a internet y con privacidad garantizada.
- Aplicaciones de edge AI en entornos sin conexión: gracias a su formato BF16 y su tamaño de 2.5B, es viable para entornos con recursos limitados, como dispositivos industriales o sistemas embebidos.
- Agentes con tool calling: el soporte de función calling permite integrar el modelo en pipelines que requieren llamadas a herramientas externas, como APIs, bases de datos o servicios web.
- Procesamiento de documentos largos: la ventana de 131.000 tokens permite resumir contratos, informes técnicos o expedientes extensos sin truncar el contenido.
- Generación de código asistida: entrenado con UltraData-Code, el modelo puede sugerir fragmentos de código, explicar funciones o completar plantillas en entornos de desarrollo locales.
- Aplicaciones multilingües inglés-chino: adecuado para sistemas de traducción, soporte bilingüe o chatbots que alternen entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser BF16, los 2.5B parámetros ocupan aproximadamente 5 GB de memoria, más el overhead del framework. En Apple Silicon, la memoria unificada es compartida entre CPU y GPU.
- GPU recomendadas: Apple Silicon con al menos 8 GB de RAM unificada (M1, M2, M3, M4 o superiores).
- ¿Cabe en consumer GPU? No está diseñado para CUDA, pero la conversión original en formato HuggingFace puede ejecutarse en GPU NVIDIA con otros frameworks.
- Opciones de despliegue: mlx-lm para generación directa, y SGLang con backend Metal para servir el modelo como API local.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-MLX-BF16 | 2.5B | 131k | Apache-2.0 | Conversión MLX BF16 |
| MiniCPM5-1B | 1B | no disponible | Apache-2.0 | Modelo base de la serie |
| MiniCPM5-2B-MLX | 2.5B | 131k | Apache-2.0 | Versión oficial 4-bit MLX |

No se dispone de datos de benchmarks para comparar el rendimiento con otros modelos de la misma categoría. La principal diferencia frente a MiniCPM5-1B es el doble de parámetros y una ventana de contexto mayor. La versión oficial MiniCPM5-2B-MLX incluye cuantización 4-bit, mientras que esta conversión mantiene BF16 completo.

## Limitaciones y advertencias

- Sesgos no documentados: al ser un modelo entrenado con datos web, puede heredar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto o inventado.
- Limitaciones de idioma: solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La conversión es una adaptación no oficial realizada por un tercero; puede no estar sincronizada con futuras actualizaciones del modelo base.
- Para producción, es necesario validar el rendimiento en el dominio específico y considerar el uso de la versión oficial con cuantización si se requiere menor consumo de memoria.

## Enlaces

- https://huggingface.co/junwatu/MiniCPM5-2B-MLX-BF16
- https://huggingface.co/openbmb/MiniCPM5-2B
- https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- https://huggingface.co/openbmb/MiniCPM5-2B-Base
- Datasets de entrenamiento: https://huggingface.co/datasets/openbmb/Ultra-FineWeb, https://huggingface.co/datasets/openbmb/UltraData-Code, https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
