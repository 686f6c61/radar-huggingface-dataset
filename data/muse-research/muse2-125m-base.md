# Muse-research/Muse2-125M-Base

## Resumen

Muse2-125M-Base es un modelo de lenguaje autorregresivo desarrollado por Muse Research, pensado como la variante compacta de la familia Muse2. Su principal característica es una arquitectura híbrida de convolución y atención implementada desde cero en PyTorch, sin depender del código de `transformers`. Con 122,9 millones de parámetros reales, está diseñado para entornos con presupuesto de cómputo ajustado, como inferencia en el borde (edge) o en dispositivos locales.

El modelo resuelve el problema de ofrecer una alternativa ligera y reproducible para estudiar arquitecturas híbridas, extracción estructurada de logs a JSON y generación de texto con formato disciplinado. Incluye tanto los pesos base como la versión instruccional, alineada mediante fine-tuning supervisado (SFT) con enmascaramiento de pérdida solo en completaciones; no se ha aplicado RLHF ni DPO. Su ventana de contexto nativa es de 8.000 tokens, ampliable hasta 128.000, y soporta exclusivamente inglés, aunque también maneja código fuente y texto matemático.

La relevancia actual del modelo radica en su apuesta por una arquitectura híbrida convolución/atención en un rango de tamaño muy pequeño, lo que permite experimentar con alternativas al transformer puro en escenarios de bajos recursos. Su licencia Apache-2.0 y la publicación de todos los componentes (tokenizador, arquitectura, stack de inferencia) lo convierten en una pieza interesante para investigación y educación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolución/atención (7 bloques de convolución depthwise causal con kernel 3 y 5 bloques de atención completa), implementada desde cero en PyTorch |
| Parametros totales | 122.915.328 (125M nominales) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens nativos, máximo 128.000 |
| Tipos de cuantizacion | No especificado en la información disponible |
| Idiomas soportados | Inglés (también código fuente y texto matemático) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

Muse2-125M emplea una arquitectura autorregresiva híbrida que intercala 7 bloques de convolución depthwise causal de ventana corta (kernel size 3) con 5 bloques de atención completa, sumando 12 bloques en total. La atención utiliza Grouped-Query Attention (GQA) con 12 cabezas de consulta y 6 cabezas de clave/valor, junto con RoPE con theta 1e6, RMSNorm y MLPs SwiGLU paralelos fusionados (hidden size 768, feed-forward 2304). Los embeddings de entrada y salida están compartidos (tied), y el vocabulario consta de 65.536 tokens BPE a nivel de byte, con tokens de control estilo ChatML (pad=0, bos=1, eos=7).

El entrenamiento se realizó desde cero (from scratch) y la versión instruct se alineó mediante SFT con enmascaramiento de pérdida solo en las completaciones. No se aplicó RLHF ni DPO. El corte de conocimiento corresponde a principios de 2024. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible.

## Capacidades

- Generación de texto en inglés, incluyendo código fuente y texto matemático.
- Conversación multi-turno en la versión instruct, con plantilla de chat estilo ChatML.
- Extracción estructurada de logs a JSON, gracias a su entrenamiento para producir salidas con formato disciplinado.
- Soporte de atención con contexto largo (hasta 128.000 tokens) mediante la extensión de RoPE, aunque la ventana nativa es de 8.000.
- Inferencia en el borde o en dispositivos con recursos limitados, gracias a su tamaño reducido y a la arquitectura híbrida que reduce el coste de atención.
- No se menciona soporte de tool calling, function calling, ni capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Extracción de logs a JSON: el modelo puede transformar líneas de log no estructuradas en objetos JSON válidos, aprovechando su entrenamiento para salidas con formato estricto. Es adecuado para pipelines de observabilidad en entornos con recursos limitados.
- Asistente conversacional en dispositivos de bajo consumo: la versión instruct permite construir chatbots que funcionen localmente en hardware modesto, donde el tamaño reducido y la arquitectura híbrida reducen la latencia y el uso de memoria.
- Investigación académica sobre arquitecturas híbridas: al estar implementado desde cero y ser completamente reproducible, sirve como banco de pruebas para estudiar el comportamiento de capas convolucionales frente a atención completa en modelos pequeños.
- Generación de código en entornos sin conexión: el modelo maneja código fuente y puede completar fragmentos simples en inglés, útil para asistentes de programación offline en entornos restringidos.
- Fine-tuning para tareas específicas: al ser un modelo base con licencia Apache-2.0, se puede ajustar para dominios concretos (clasificación de texto, generación de formularios, etc.) con un coste de entrenamiento bajo.
- Enseñanza de modelos de lenguaje: su tamaño y la disponibilidad de todos los componentes (tokenizador, arquitectura, inferencia) lo hacen adecuado para cursos y talleres sobre LM desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las pruebas de capacidad y seguridad se limitan a inspección cualitativa, sin cobertura exhaustiva de escenarios.

## Requisitos de hardware

- VRAM estimada para inferencia: con 122,9 millones de parámetros, en fp32 el modelo ocupa aproximadamente 0,5 GB; en fp16 o bf16, unos 0,25 GB. Con cuantización a 8 bits, podría reducirse a unos 0,13 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas para generación de baja latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs como la NVIDIA GTX 1650, RTX 3060, o incluso en integradas con suficiente RAM compartida.
- Opciones de despliegue: al ser una implementación desde cero en PyTorch, no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. El despliegue se realiza mediante el paquete `muse` (PyTorch + safetensors).
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamaño, se espera una generación rápida en GPU y aceptable en CPU, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse2-125M | 122,9M | 8k (128k máx.) | Híbrida conv/atención | Apache-2.0 | Hugging Face |
| GPT-2 (124M) | 124M | 1.024 | Transformer | MIT | Hugging Face |
| TinyLlama (1.1B) | 1.100M | 2.048 | Transformer | Apache-2.0 | Hugging Face |
| Qwen2-0.5B | 494M | 32.768 | Transformer | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos (MMLU, HumanEval, etc.) para Muse2-125M, por lo que la comparación se limita a aspectos estructurales. Frente a GPT-2, Muse2 ofrece mayor contexto nativo y una arquitectura híbrida; frente a TinyLlama y Qwen2-0.5B, es significativamente más pequeño, lo que lo hace más adecuado para entornos extremadamente limitados, aunque con menor capacidad general.

## Limitaciones y advertencias

- El modelo no ha recibido alineamiento de seguridad, red-teaming ni filtrado de contenido; puede producir salidas inexactas, sesgadas, repetitivas u objetables.
- Alucina hechos con facilidad a esta escala; no es fiable para tareas que requieran veracidad factual.
- Solo soporta inglés; no cubre otros idiomas.
- La ventana de contexto nativa es de 8.000 tokens; el uso de 128.000 requiere extensión de RoPE y no se garantiza su rendimiento.
- No se han publicado benchmarks ni evaluaciones cuantitativas; las pruebas se limitan a inspección cualitativa.
- La implementación desde cero (paquete `muse`) no es compatible con el ecosistema estándar de `transformers`, lo que puede dificultar su integración en pipelines existentes.
- Las licencias de los datasets utilizados en el entrenamiento pueden imponer restricciones adicionales a usos derivados.
- No se recomienda su uso en producción sin evaluación previa y guardas de entrada/salida por parte del desarrollador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Muse-research/Muse2-125M-Base
- Organización Muse Research: https://huggingface.co/Muse-research
- Modelo hermano Muse2-230M-Base: https://huggingface.co/Muse-research/Muse2-230M-Base
