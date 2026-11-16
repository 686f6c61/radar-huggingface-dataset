# AlekseyCalvin/LFM3_3d_sonnety_exp4

## Resumen
LFM3_3d_sonnety_exp4 es un ajuste fino (fine-tune) del modelo LFM3-1.7B de Liquid AI, desarrollado por el usuario AlekseyCalvin. El objetivo declarado del autor es que el modelo razone y converse de forma similar a Claude Sonnet 4.6, partiendo de la base del modelo original de Liquid AI. Se trata de un experimento publicado en Hugging Face con cero descargas y cero likes en el momento de la consulta, lo que indica que es un trabajo de investigación personal sin validación comunitaria.

El modelo base, LFM3-1.7B, es un modelo de texto disenado para agentes locales y aplicaciones especializadas, construido sobre una arquitectura tri-híbrida propietaria de Liquid AI. Con 1.728.801.536 parámetros totales (aproximadamente 1,7 mil millones), está pensado para ejecutarse en el borde (edge), ocupando alrededor de 1 GB de memoria a precisión de 4 bits, lo que lo hace viable en teléfonos y portátiles.

La relevancia de este fine-tune es limitada y experimental: el propio autor advierte que desconoce si el modelo conserva las capacidades agénticas del modelo padre y que carece de traza de razonamiento (thinking trace). Es, por tanto, una ficha de interés para quienes siguen experimentos de ajuste fino sobre arquitecturas híbridas, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida (herencia del modelo base LFM3-1.7B; detalles no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según model card del modelo base) |
| Tipos de cuantizacion | no disponible (el modelo base cita 4 bits como referencia de despliegue) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" según Hugging Face) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | LiquidAI/LFM3-1.7B |
| Tamano del repo | 6,9 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura tri-híbrida del LFM3-1.7B de Liquid AI, aunque la model card no detalla la composición interna de dicha arquitectura (mezcla de atención, capas lineales o SSM). El ajuste fino se realizó mediante QLoRA sobre el modelo base, con el objetivo de imitar el estilo de razonamiento y conversación de Claude Sonnet 4.6.

Los datos de entrenamiento son privados por razones de privacidad y seguridad, según indica el autor, por lo que no se puede verificar la composición del dataset, el número de tokens utilizados ni si hubo etapas de RLHF o DPO. El autor reconoce explícitamente que el modelo carece de traza de razonamiento (thinking trace) y que desconoce si conserva las capacidades agénticas del modelo padre, lo que supone una incertidumbre importante sobre el proceso de entrenamiento.

## Capacidades
- Generación de texto conversacional, orientada a imitar el estilo de Claude Sonnet 4.6 según el autor.
- Razonamiento: el autor indica que busca hacerlo razonar como Sonnet 4.6, pero advierte que carece de traza de razonamiento visible.
- Capacidades agénticas: no confirmadas; el autor desconoce si se conservaron las del modelo base (entrenado para harnesses como Hermes Agent, Pi y OpenClaw).
- Tool calling / function calling: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponibles; el modelo base es de texto.

## Casos de uso
- Experimentación en ajuste fino: el modelo sirve como referencia para estudiar cómo un QLoRA sobre LFM3-1.7B altera el estilo conversacional hacia el de Claude Sonnet 4.6, útil en investigación de alineación de estilo.
- Pruebas de imitación de estilo conversacional: para evaluar hasta qué punto un modelo de 1,7B puede reproducir el tono y la estructura de respuesta de un modelo mucho mayor.
- Prototipado en local: gracias a los ~1 GB a 4 bits del modelo base, puede ejecutarse en portátiles para pruebas de conversación sin infraestructura dedicada.
- Evaluación comparativa de fine-tunes: como punto de comparación frente a otros ajustes del mismo modelo base en estudios de calidad de respuesta.
- Docencia y demostraciones: para ilustrar el proceso de QLoRA y sus limitaciones (pérdida de traza de razonamiento, posible pérdida de capacidades agénticas).
- Investigación sobre degradación de capacidades: útil para medir qué habilidades del modelo padre se pierden tras un ajuste fino de estilo, dado que el autor no verificó la conservación de las capacidades agénticas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1 GB a 4 bits según el modelo base; en FP16 se estiman unos 3,5 GB solo para pesos (1,73B parámetros × 2 bytes), más overhead de activaciones y contexto.
- GPU recomendadas: no disponibles de forma específica; por tamaño, cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon y CPUs.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3_3d_sonnety_exp4 | 1,73B | 256K (heredado del base) | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (modelo base) | 1,7B | 256K | lfm1.0 | Hugging Face, modelo oficial |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este fine-tune y el modelo base ni con otras alternativas de tamaño similar.

## Limitaciones y advertencias
- El autor advierte que desconoce si el modelo conserva las capacidades agénticas del modelo base.
- El modelo carece de traza de razonamiento (thinking trace), según el propio autor.
- Datos de entrenamiento privados: no es posible auditar la composición del dataset ni detectar sesgos introducidos.
- Riesgo de alucinación: no evaluado; al ser un fine-tune de estilo sobre un modelo de 1,7B, la fiabilidad factual no está verificada.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera del inglés (idioma presumible del ajuste, no confirmado).
- Licencia lfm1.0: es necesario revisar los términos del archivo LICENSE del repositorio antes de cualquier uso comercial, ya que la licencia se etiqueta como "other".
- Sin validación comunitaria: cero descargas y cero likes, sin benchmarks publicados; no recomendable para producción.
- El contexto de 256K corresponde al modelo base y no está confirmado que se mantenga tras el ajuste fino.

## Enlaces
- Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3_3d_sonnety_exp4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
