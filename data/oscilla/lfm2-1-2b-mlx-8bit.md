# Oscilla/LFM2-1.2B-mlx-8Bit

## Resumen

Oscilla/LFM2-1.2B-mlx-8Bit es una conversión al formato MLX del modelo LFM2-1.2B desarrollado por Liquid AI, realizada por el usuario Oscilla mediante mlx-lm 0.31.2. LFM2 es una familia de modelos fundacionales optimizados para ejecución en dispositivos (edge), con especial énfasis en velocidad y eficiencia de memoria. El modelo base soporta una ventana de contexto de 32 000 tokens y cubre ocho idiomas. Esta versión cuantizada a 8 bits reduce el tamaño del archivo a 1,2 GB, lo que facilita su despliegue en hardware con recursos limitados, especialmente en entornos Apple Silicon gracias al formato MLX. Cabe señalar una discrepancia entre el nombre comercial (1.2B) y el número de parámetros reales según el archivo safetensors (329 251 584), que deberá confirmarse con la documentación oficial de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia LFM2) |
| Parametros totales | 329 251 584 (según safetensors; el nombre comercial indica 1.2B, discrepancia por confirmar) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (según informe técnico de LFM2) |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (licencia propia de Liquid AI, no OSI) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2-1.2B pertenece a la familia Liquid Foundation Models v2, que según el informe técnico incluye variantes densas desde 350M hasta 2.6B parámetros y un modelo MoE de 8.3B con 1.5B activos. Esta variante concreta es densa, sin mezcla de expertos. El diseño prioriza la inferencia eficiente en CPU y dispositivos móviles, como se detalla en las evaluaciones sobre Snapdragon 8 Elite y AMD Ryzen AI 9 HX 370. No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) en la información disponible. La conversión a MLX no modifica la arquitectura, solo el formato de pesos y la cuantización.

## Capacidades

- Generación de texto y conversación multi-turno (etiquetado como "conversational").
- Soporte multilingüe para ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Adecuado para tareas de generación de texto en entornos con restricciones de memoria y computación.
- No se documenta soporte explícito para tool calling, function calling, agentes o razonamiento multi-paso en la información proporcionada.
- No se mencionan capacidades multimodales (visión, audio) para esta variante.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el modelo puede ejecutarse localmente en smartphones gracias a su tamaño reducido y cuantización de 8 bits, ofreciendo respuestas sin latencia de red.
- Aplicaciones de chat multilingüe en tiempo real: su soporte para ocho idiomas permite atender a usuarios de distintas regiones sin depender de servicios en la nube.
- Generación de texto en entornos de bajo consumo: ideal para dispositivos IoT, wearables o routers con capacidad de cómputo limitada.
- Prototipado rápido en Apple Silicon: al estar en formato MLX, se integra directamente con mlx-lm para pruebas locales en Mac, acelerando el desarrollo de aplicaciones de NLP.
- Filtrado o resumen de textos en dispositivos edge: puede procesar documentos o mensajes localmente, preservando la privacidad de los datos.
- Sistemas de respuesta automática en atención al cliente para canales de mensajería, con contexto de 32K tokens que permite manejar conversaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX ni para el modelo base LFM2-1.2B en la información disponible. El informe técnico de LFM2 menciona evaluaciones de eficiencia en CPU, pero no se incluyen tablas de rendimiento en tareas como MMLU, HumanEval o GSM8K en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 8 bits y 329M parámetros, el peso del modelo ocupa aproximadamente 329 MB; sumando overhead de activaciones y caché, se estima un uso de VRAM entre 1 y 2 GB en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, Apple M1 o superior). Puede ejecutarse en CPU sin GPU.
- Compatibilidad con GPU de consumo: sí, es perfectamente viable en tarjetas de gama baja y media.
- Opciones de despliegue: mlx-lm para Apple Silicon, transformers para GPU/CPU, o conversión a GGUF para llama.cpp/Ollama si se desea.
- Latencia y throughput: no se dispone de datos medidos; al ser un modelo pequeño, se espera una generación de decenas de tokens por segundo en CPU moderna y cientos en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Oscilla/LFM2-1.2B-mlx-8Bit | 329M (según safetensors) | 32K | lfm1.0 | MLX 8-bit |
| Phi-3-mini (Microsoft) | 3.8B | 4K (original) | MIT | safetensors |
| Gemma-2-2B (Google) | 2.6B | 8K | Gemma license | safetensors |
| Qwen2.5-0.5B (Alibaba) | 0.5B | 32K | Apache 2.0 | safetensors |

La comparación es orientativa; no se dispone de benchmarks para LFM2-1.2B en esta información. El modelo de Liquid AI destaca por su contexto largo (32K) y su licencia restrictiva (lfm1.0), frente a alternativas con licencias más permisivas como Apache 2.0 o MIT.

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia propia de Liquid AI, no OSI; se debe revisar el texto completo para conocer restricciones de uso comercial y redistribución.
- La discrepancia entre el nombre (1.2B) y los parámetros reales (329M) puede indicar un error en el etiquetado o una arquitectura con embeddings compartidos; conviene verificar antes de usarlo en producción.
- No se han publicado evaluaciones de sesgos o alucinaciones para este modelo; como cualquier modelo de lenguaje, puede generar contenido inexacto o tendencioso.
- El soporte de tool calling y agentes no está documentado, por lo que no es recomendable para pipelines que requieran integración con APIs externas.
- Al ser una conversión de terceros (Oscilla), no hay garantía de mantenimiento ni soporte oficial por parte de Liquid AI.

## Enlaces

- [Oscilla/LFM2-1.2B-mlx-8Bit en Hugging Face](https://huggingface.co/Oscilla/LFM2-1.2B-mlx-8Bit)
- [Modelo base: LiquidAI/LFM2-1.2B](https://huggingface.co/LiquidAI/LFM2-1.2B)
- [Blog de Liquid AI sobre LFM2](https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models)
- [Informe técnico LFM2 (arXiv)](https://arxiv.org/pdf/2511.23404)
