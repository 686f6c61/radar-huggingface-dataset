# bulyakovbr/bebladii-foundation-weights

## Resumen

BEBLaDII Foundation Weights es un conjunto de pesos de entrenamiento experimental para la arquitectura BEBLaDII (Bidirectional Encoder Based Latent Diffusion with Information Injection), desarrollada por Bogdan Buliakov (usuario `bulyakovbr` en HuggingFace y `Laeryid` en GitHub). El modelo no es un LLM conversacional listo para usar, sino un conjunto de checkpoints de las tres primeras fases de entrenamiento de un sistema de difusión de texto basado en un espacio latente esférico. Se apoya en inicializaciones de ModernBERT-large y conceptos de la familia DeepSeek, y está licenciado bajo Apache 2.0.

La relevancia de este modelo es fundamentalmente investigadora: explora la aplicación de difusión continua sobre una esfera latente (con normalización esférica) para la generación de texto, combinando un codificador VAE, un decodificador inicializado desde ModernBERT y un módulo de difusión con conexiones tipo UNet y AdaLN. Los pesos se publican para permitir la continuación del entrenamiento en fases posteriores (fase 4 y más allá), no para inferencia directa.

El repositorio contiene cuatro archivos: el encoder VAE de la fase 1, el decoder de la fase 2, el modelo de difusión de la fase 3 y un tensor separador. El tamaño total del repositorio es de 5.4 GB, lo que sugiere que los checkpoints son de tamaño considerable, aunque no se especifican los parámetros totales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente esférica sobre base ModernBERT-large (VAE + Decoder + Difusión con AdaLN y skip-connections UNet) |
| Parámetros totales | No disponible (los checkpoints son de fases intermedias; no se publica el recuento total) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la información) |
| Tipos de cuantización | No disponible (solo se publican pesos en formato `.pth` de PyTorch, sin cuantización) |
| Idiomas soportados | Ruso (ru), Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

La arquitectura BEBLaDII se compone de tres módulos principales entrenados en fases sucesivas:

1. **Fase 1 – VAE / Encoder latente**: un codificador que proyecta texto en un espacio latente esférico, utilizando `F.normalize` para imponer topología esférica. Se encarga de la compresión inicial.
2. **Fase 2 – Decoder latente**: inicializado desde ModernBERT-large, decodifica las representaciones latentes de vuelta a texto bruto.
3. **Fase 3 – Difusión canónica (DUS)**: un modelo de difusión continua sobre la esfera, con bloques AdaLN y conexiones tipo UNet. Proporciona capacidades de Depth Up-Scaling (DUS).

El entrenamiento se ha realizado en tres fases con pasos específicos: 20 000 pasos para el VAE, 9 000 para el decoder y 17 995 para la difusión. No se especifica el dataset utilizado, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La incorporación de conceptos de DeepSeek sugiere el uso de mecanismos de atención o de inyección de información, pero no se detalla.

Los pesos se publican en formato `.pth` y se cargan mediante `torch.load`. No se proporcionan scripts de inferencia ni una demo funcional.

## Capacidades

- **Generación de texto mediante difusión**: el modelo está diseñado para generar texto a partir de un espacio latente difundido, aunque los pesos publicados no son suficientes para una generación completa (falta la fase 4).
- **Compresión y reconstrucción**: el VAE y el decoder permiten codificar y decodificar texto, aunque no se ha validado su rendimiento en tareas concretas.
- **Diffusion con AdaLN**: el módulo de difusión emplea Adaptive Layer Normalization, lo que sugiere capacidades de condicionamiento por información inyectada.
- **Depth Up-Scaling (DUS)**: capacidad de aumentar la profundidad de la representación latente, posiblemente para generar texto más largo o detallado.
- **Soporte multilingüe**: declarado para ruso e inglés, aunque no se ha verificado el rendimiento.
- **No incluye**: tool calling, agentes, razonamiento multi-paso, visión o audio. Es un modelo de difusión de texto puro, en estado experimental.

## Casos de uso

- **Investigación en difusión de texto**: el modelo sirve como base para estudiar la generación de texto mediante difusión continua en espacios latentes esféricos, comparando con enfoques autorregresivos.
- **Desarrollo de nuevas arquitecturas**: los pesos de las fases 1-3 permiten continuar el entrenamiento desde un punto intermedio, explorando la fase 4 y posteriores sin empezar de cero.
- **Pruebas de compresión latente**: el VAE puede evaluarse como compresor de representaciones textuales, midiendo la pérdida de información al codificar y decodificar.
- **Experimentos con normalización esférica**: la topología esférica del espacio latente puede ser comparada con espacios euclídeos o hiperbólicos para tareas de representación.
- **Fine-tuning para tareas específicas**: aunque no es un modelo listo para producción, los componentes podrían adaptarse para tareas de generación condicionada si se completa el entrenamiento.
- **Educación e investigación**: útil para estudiar la interacción entre VAEs, difusión y decodificadores basados en transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se conocen valores de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo, ya que no es un LLM convencional y se encuentra en fase experimental.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado que el modelo se basa en ModernBERT-large (aproximadamente 400 M de parámetros), la inferencia con los pesos completos podría requerir al menos 2-3 GB de VRAM en FP16, pero no se confirma.
- **GPUs recomendadas**: no se especifica. Para el entrenamiento de difusión, se recomendaría una GPU con al menos 16 GB de memoria (por ejemplo, V100, RTX 3090, A100) para los checkpoints de 5.4 GB.
- **Consumer GPU**: posiblemente en una RTX 3080/3090 con suficiente VRAM, pero sin datos oficiales.
- **Opciones de despliegue**: no hay soporte para vLLM, Ollama, llama.cpp ni TGI, ya que no es un modelo de lenguaje estándar. Se carga directamente en PyTorch.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente, ya que BEBLaDII es un modelo experimental de difusión de texto y no hay datos de rendimiento. Se puede mencionar que existen otros enfoques de difusión de texto como DiffuBERT o modelos de difusión de lenguaje, pero no se tienen datos concretos para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Modelo experimental**: no está listo para producción ni para uso conversacional. Es un conjunto de pesos intermedios para investigación.
- **Sin benchmarks**: no se ha validado su rendimiento en tareas estándar de NLP.
- **Sesgos y alucinaciones**: al no ser un LLM entrenado con RLHF, no se puede garantizar la veracidad ni la seguridad de sus salidas.
- **Idiomas limitados**: solo ruso e inglés declarados, sin confirmación de calidad.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero al ser un modelo derivado de ModernBERT y DeepSeek, se deben revisar las licencias de esos modelos base.
- **Falta de documentación**: no hay instrucciones claras para cargar los pesos en un marco completo, y el repositorio GitHub es la única referencia.
- **Dependencia de PyTorch**: los pesos son `.pth` y solo se pueden cargar con PyTorch, no con otros frameworks.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bulyakovbr/bebladii-foundation-weights
- GitHub del autor (Laeryid): https://github.com/Laeryid
- Repositorio BEBLaDII en GitHub: https://github.com/Laeryid/BEBLaDII (indicado en la model card)
