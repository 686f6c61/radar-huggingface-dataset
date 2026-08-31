# mradermacher/Aetheris-Core-2B-i1-GGUF

## Resumen

Aetheris-Core-2B-i1-GGUF es una cuantización en formato GGUF del modelo Aetheris-Core-2B, desarrollada por el equipo de mradermacher, conocido por publicar versiones cuantizadas de modelos open source. El modelo original, creado por Miiyamoto255, es un modelo de lenguaje compacto de 2 mil millones de parámetros, entrenado desde cero y basado en la arquitectura Gemma2ForCausalLM. Está diseñado para ofrecer inferencia local rápida y flexible, lo que lo hace adecuado para entornos con recursos limitados.

Esta versión GGUF incluye una amplia gama de cuantizaciones (desde Q2_K hasta Q6_K, incluyendo variantes IQ), lo que permite ajustar el equilibrio entre tamaño, velocidad y calidad según el hardware disponible. Al ser una cuantización, hereda las capacidades del modelo original, aunque con una posible pérdida de precisión en los niveles más agresivos. La relevancia actual radica en la creciente demanda de modelos pequeños y eficientes que puedan ejecutarse en dispositivos de consumo, y esta ficha proporciona una referencia técnica para evaluar su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma2ForCausalLM (según el modelo original) |
| Parametros totales | 2 mil millones (modelo original); el archivo GGUF es una cuantización |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original Aetheris-Core-2B se basa en la arquitectura Gemma2ForCausalLM, una variante del transformer desarrollada por Google que incorpora atención con ventana deslizante y atención global alternadas, así como normalización por capas pre- y post-atención. Según la información disponible, el modelo fue entrenado desde cero con 2 mil millones de parámetros, aunque no se especifican detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

La versión GGUF aquí descrita es una cuantización realizada por mradermacher, que utiliza el formato GGUF para permitir su ejecución con motores como llama.cpp, Ollama o LM Studio. Las cuantizaciones se generaron con el método imatrix (importance matrix), que optimiza la asignación de bits según la importancia de cada tensor, mejorando la calidad en niveles de baja precisión. No se dispone de información adicional sobre innovaciones técnicas específicas del modelo original más allá de su arquitectura base.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en transformer, es capaz de generar texto coherente en tareas de completado, redacción y diálogo, aunque no se han publicado evaluaciones específicas.
- Razonamiento básico: se espera que herede capacidades de razonamiento del modelo original, pero no hay datos concretos disponibles.
- Inferencia local eficiente: gracias a su tamaño de 2B y a las cuantizaciones GGUF, puede ejecutarse en hardware de consumo con requisitos de VRAM moderados.
- Flexibilidad de cuantización: la amplia gama de niveles de cuantización permite adaptar el modelo a diferentes restricciones de memoria y velocidad.
- No se ha confirmado soporte para tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Asistente de chat local: el modelo puede integrarse en aplicaciones de chat que se ejecutan en portátiles o mini-PCs, aprovechando las cuantizaciones pequeñas (Q2_K, IQ3_M) para funcionar con menos de 2 GB de VRAM.
- Generación de texto en entornos sin conexión: útil para redactar correos, resúmenes o contenido breve en dispositivos sin acceso a la nube, gracias a su tamaño compacto.
- Prototipado rápido de aplicaciones NLP: los desarrolladores pueden usar las cuantizaciones GGUF para probar flujos de generación de texto en local antes de escalar a modelos más grandes.
- Educación e investigación: sirve como modelo de referencia para estudiar el comportamiento de arquitecturas tipo Gemma2 en tamaños pequeños, o para experimentos de fine-tuning con recursos limitados.
- Automatización de tareas simples: puede emplearse para clasificación de texto, extracción de entidades o generación de respuestas plantilla en pipelines de procesamiento de lenguaje natural.
- Despliegue en edge devices: al ser un modelo de 2B cuantizado, es candidato para ejecutarse en dispositivos con CPU ARM o GPUs integradas, como Raspberry Pi 5 o similares, para tareas de generación de texto básicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su versión original. Se recomienda realizar pruebas propias en los casos de uso previstos antes de adoptarlo en producción.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K_M (tamaño aproximado de 1.5-2 GB), se necesitan al menos 2-3 GB de VRAM en GPU. Para Q2_K, el requisito baja a ~1-1.5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso iGPUs con suficiente memoria compartida. Para las cuantizaciones más grandes (Q6_K), se recomienda al menos 6 GB de VRAM.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y cualquier motor compatible con GGUF. También puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 4060), se espera una velocidad de generación de 20-40 tokens por segundo con cuantizaciones Q4, pero esto es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aetheris-Core-2B (GGUF) | 2B | Gemma2ForCausalLM | no disponible | no disponible | Hugging Face |
| Gemma-2B | 2B | Gemma | 8K | Gemma Terms of Use | Hugging Face |
| Qwen2-1.5B | 1.5B | Transformer | 32K | Apache 2.0 | Hugging Face |
| Phi-2 | 2.7B | Transformer | 2K | MIT | Hugging Face |

La comparativa se basa en el tamaño y la arquitectura, pero no hay datos de rendimiento para Aetheris-Core-2B. Gemma-2B es la alternativa más cercana por arquitectura, mientras que Qwen2-1.5B ofrece mayor contexto y licencia permisiva. Phi-2 tiene un tamaño similar pero contexto más corto. Se recomienda evaluar cada modelo con benchmarks propios según el caso de uso.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al no disponer de información sobre el dataset de entrenamiento, no se pueden evaluar sesgos específicos. Como todo modelo de lenguaje, es propenso a generar contenido falso o inventado.
- Pérdida de precisión por cuantización: los niveles más bajos (Q2_K, IQ1_M) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento.
- Licencia desconocida: la licencia del modelo original no está especificada, lo que impide garantizar su uso comercial. Se debe contactar con el autor original antes de utilizarlo en productos comerciales.
- Contexto limitado: no se ha confirmado la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Soporte comunitario: el modelo tiene 0 descargas y 0 likes, lo que indica una adopción muy baja y posible falta de mantenimiento o documentación adicional.
- Fecha de creación inusual: la fecha de creación (2026-08-31) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos o un modelo muy reciente con poca validación.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/Aetheris-Core-2B-i1-GGUF
- Modelo original: https://huggingface.co/Miiyamoto255/Aetheris-Core-2B
- Página del modelo en FriendliAI: https://friendli.ai/models/Miiyamoto255/Aetheris-Core-2B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
