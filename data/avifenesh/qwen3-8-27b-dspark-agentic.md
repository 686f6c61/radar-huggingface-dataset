# Avifenesh/Qwen3.8-27B-DSpark-Agentic

## Resumen

Qwen3.8-27B-DSpark-Agentic es un modelo borrador (drafter) de decodificación especulativa para el modelo objetivo Qwen/Qwen3.8-27B, desarrollado por Avifenesh. Su propósito es acelerar la inferencia de este último en cargas de trabajo agénticas y conversacionales, como asistentes de codificación o chatbots multi-turno, sin modificar en absoluto la salida del modelo objetivo: cada token borrador es verificado por el modelo grande, de modo que la decodificación es bit-idéntica a la del modelo original. Esto lo convierte en una pieza de infraestructura para despliegues de Qwen3.8-27B en producción, donde el throughput por solicitud es un factor crítico.

El borrador es pequeño (1,36B parámetros) y se entrena desde cero con el harness SpecForge, usando como etiquetas las regeneraciones del propio modelo objetivo sobre sesiones agénticas reales y una mezcla de prompts públicos de chat. Implementa la arquitectura DSpark, que combina una cabeza de Markov para la dependencia intra-bloque y una cabeza de confianza para predecir la aceptación posicional. El bloque de borrado es de 7 tokens, y el modelo soporta una ventana de contexto extendida hasta 262.144 posiciones mediante YaRN. Está disponible bajo licencia Apache-2.0, en formato safetensors, y se sirve con SGLang (algoritmo DSPARK) o con el motor memra.

La relevancia actual del modelo radica en la demanda de inferencia de baja latencia para modelos de razonamiento híbrido como Qwen3.8-27B, que es un modelo nativo multimodal y agéntico de Alibaba. Este drafter es una pieza específica para optimizar su despliegue en hardware de gama alta (RTX PRO 6000 Blackwell, B200) y también en configuraciones con cuantización FP8 o NVFP4, logrando un throughput agregado de 693 tokens/s en GSM8K con concurrencia 8 en una sola tarjeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 5 capas transformer de atención completa, hidden 5.120, GQA 40 query / 8 KV heads, head_dim 128, MLP 10.240 |
| Parametros totales | 1.359.284.737 (1,36B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 (via YaRN, factor 32 sobre base de 8.192) |
| Tipos de cuantizacion | no disponible (pesos BF16; el modelo objetivo puede usar FP8 o NVFP4) |
| Idiomas soportados | no disponible (usa el tokenizer del modelo objetivo, que soporta múltiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un archivo, 62 tensores) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa DSpark. Su arquitectura consiste en 5 capas transformer densas de atención completa, con ocultos de 5.120, GQA con 40 cabezas de consulta y 8 de clave/valor (head_dim 128) y un MLP de 10.240. Tiene dos cabezas adicionales: una cabeza de Markov de rango 256 que modela la dependencia entre tokens dentro del bloque de borrado, y una cabeza de confianza que predice la probabilidad de aceptación de cada posición. El bloque de borrado es de 7 tokens (con un token extra de verificación del objetivo). Se entrenó desde cero (inicialización aleatoria) con el harness SpecForge, usando como etiquetas las regeneraciones a temperatura 0 del modelo objetivo Qwen3.8-27B sobre una mezcla de sesiones agénticas reales de codificación/asistente y prompts públicos de chat, cubriendo tanto modos de pensamiento como no pensamiento. Se entrenó sobre el último turno de cada sesión multi-turno, con aproximadamente 1.000 pasos de optimizador en hardware B200 / RTX PRO 6000. La posición se codifica con YaRN (factor 32, base 8.192) para alcanzar hasta 262.144 tokens de contexto. El borrador no tiene tokenizer propio; usa el del modelo objetivo (vocabulario de 248.320).

## Capacidades

- Aceleración de decodificación especulativa para Qwen/Qwen3.8-27B, con verificación de cada token borrador por el modelo objetivo, garantizando salidas idénticas.
- Diseñado específicamente para cargas de trabajo agénticas (sesiones de codificación y asistente) y conversacionales multi-turno.
- Soporta tanto modos de pensamiento (thinking) como no-pensamiento en el borrador, gracias al entrenamiento sobre ambos.
- Compatible con el algoritmo DSPARK de SGLang y con el motor memra (para troncos GGUF NVFP4).
- Alta tasa de aceptación en dominios matemáticos (GSM8K: 4,61 tokens por paso de verificación) y en sesiones agénticas reales (2,88-2,92 tokens).
- Throughput agregado de 693 tokens/s en GSM8K con concurrencia 8 en una RTX PRO 6000 Blackwell (96 GB).
- Verificación determinista bajo decodificación greedy: la corriente especulativa es byte-idéntica a la decodificación greedy del modelo objetivo.
- Bloque de borrado configurable (por defecto 7 tokens), ajustable según el tráfico.

## Casos de uso

- **Aceleración de asistentes de codificación en producción**: el drafter reduce la latencia de Qwen3.8-27B en tareas de autocompletado y generación de código, manteniendo la salida exacta. Adecuado para integrarse en IDEs o CI/CD donde el modelo objetivo se ejecuta en GPU de alta gama.
- **Chatbots conversacionales multi-turno**: al entrenarse sobre sesiones reales de chat con turnos cortos y largos, el borrador es efectivo en servicios de atención al cliente o asistentes personales que requieren respuestas rápidas.
- **Razonamiento matemático y simbólico**: la alta tasa de aceptación en GSM8K (4,61 tokens por verificación) lo hace útil para aplicaciones de tutoría matemática o resolución de problemas, donde el modelo objetivo tiene modo de pensamiento.
- **Despliegue en servidores de inferencia con SGLang**: se integra directamente con el algoritmo DSPARK de SGLang, permitiendo acelerar la inferencia sin modificar el código de la aplicación.
- **Inferencia en entornos con cuantización NVFP4**: junto con el motor memra, el drafter puede acelerar el modelo objetivo cuantizado a 4 bits, manteniendo la salida idéntica a greedy decode, útil para despliegues en GPU consumer con menor VRAM.
- **Procesamiento por lotes de alta concurrencia**: el drafter muestra un throughput agregado de 693 tok/s a concurrencia 8, lo que lo hace adecuado para servicios de API que atienden múltiples solicitudes simultáneas.

## Benchmarks y rendimiento

Los siguientes resultados son declarados por el autor en la model card. No se han verificado de forma independiente.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Decodificación especulativa (DSpark block size 7) | Sesiones agénticas reales (turnos cortos, n=64) | Acceptance length media | 2,88 |
| Decodificación especulativa (DSpark block size 7) | Sesiones agénticas reales (turnos largos, n=64) | Acceptance length media | 2,92 |
| Decodificación especulativa (DSpark block size 7) | GSM8K (128 prompts, concurrencia 8) | Acceptance length media | 4,61 |
| Decodificación especulativa (DSpark block size 7) | GSM8K (128 prompts, concurrencia 8) | Throughput agregado (tok/s) | 693 |

Además, en el motor memra con decodificación greedy y tronco NVFP4 GGUF, se reportan tasas de 1,43-1,60 tokens por ronda en sesiones agénticas (generación de 128 tokens) y 1,5-1,8 tokens por ronda en prompts matemáticos (generación de 256-768 tokens), con velocidades de 62,5-75,7 tok/s.

## Requisitos de hardware

- **VRAM estimada**: el borrador pesa 1,36B en BF16 (~2,7 GB). El modelo objetivo Qwen3.8-27B requiere su propia VRAM: en FP8 (el tamaño típico) ocupa alrededor de 30-35 GB, y en NVFP4 (GGUF) unos 16-18 GB. El conjunto completo cabe en una GPU de 48 GB o más; con cuantización NVFP4 podría caber en 24 GB.
- **GPU recomendadas**: RTX PRO 6000 Blackwell (96 GB) usada en las pruebas, también B200. Para despliegue con cuantización NVFP4, tarjetas consumer con 24 GB (RTX 4090, RTX 5090) podrían funcionar.
- **Opciones de despliegue**: SGLang con algoritmo DSPARK (`--speculative-algorithm DSPARK`), o motor memra (para troncos GGUF NVFP4). No se menciona soporte para vLLM o llama.cpp en la información disponible.
- **Latencia y throughput**: en GSM8K con concurrencia 8, 693 tok/s agregados en una sola RTX PRO 6000 Blackwell. En memra, 62,5-75,7 tok/s en una sola stream con generación de 128-768 tokens.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros drafter de decodificación especulativa (por ejemplo, otros borradores DSpark o EAGLE) en la información proporcionada. El modelo se posiciona como el borrador específico para Qwen3.8-27B, y no hay métricas de referencia de alternativas en la documentación. Se indica "no disponible" para la comparativa.

## Limitaciones y advertencias

- **Sesgos y alucinación**: el drafter no genera texto final; solo produce borradores que son verificados por el modelo objetivo. Por tanto, no introduce alucinaciones ni sesgos propios, pero hereda los del modelo objetivo (Qwen3.8-27B), que no se detallan en la información.
- **Dependencia del tráfico**: la tasa de aceptación depende del tipo de prompts, del modo de muestreo (pensamiento vs. no-pensamiento) y de la cuantización del tronco. Los números reportados son medidas absolutas en configuraciones concretas; en otros escenarios pueden ser inferiores.
- **Limitación de idiomas**: no se especifican los idiomas soportados; el borrador usa el tokenizer del modelo objetivo, que es multilingüe, pero no se garantiza un rendimiento óptimo en idiomas fuera del inglés y chino.
- **Requisitos de integración**: requiere un servidor con soporte DSPARK (SGLang con versión específica) o el motor memra. No es un modelo de generación autónoma; solo funciona como complemento de Qwen3.8-27B.
- **Licencia**: Apache-2.0 para el drafter, pero el modelo objetivo Qwen3.8-27B tiene su propia licencia (Apache-2.0 según la información de la web, aunque no se confirma en la model card). Se debe verificar la licencia del modelo base antes de su uso comercial.
- **Sin tokenizer propio**: el drafter no incluye un tokenizer, lo que obliga a usar el del modelo objetivo en el despliegue.
- **Inferencia en producción**: la decodificación especulativa puede degradarse en tráfico con mucha diversidad de temas o en prompts muy cortos; se recomienda evaluar el acceptance en el propio flujo de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avifenesh/Qwen3.8-27B-DSpark-Agentic
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Tronco NVFP4 GGUF (para memra): https://huggingface.co/Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF
- SpecForge (harness de entrenamiento): https://github.com/sgl-project/SpecForge
- SGLang (servidor): https://github.com/sgl-project/sglang
- Motor memra: https://github.com/avifenesh/memra
- Artículo arXiv relacionado: arxiv:2607.05147 y arxiv:2602.06036 (no se proporciona el enlace directo en la información).
