# mradermacher/Andgit-0.6B-SFT-GGUF

## Resumen

Andgit-0.6B-SFT-GGUF es la versión cuantizada en formato GGUF del modelo Andgit-0.6B-SFT, desarrollado originalmente por el usuario Ma7ee7 y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 596 millones de parámetros (0,6B) construido sobre la arquitectura Qwen3 y afinado mediante supervisión (SFT) con datos orientados al razonamiento y al multilingüismo. El modelo está diseñado para tareas de razonamiento explícito y conversación en seis idiomas: inglés, alemán, español, francés, italiano y japonés.

La relevancia de esta ficha radica en su formato de distribución: al estar disponible en GGUF con múltiples niveles de cuantización (desde Q2_K hasta Q8_0 y f16), el modelo puede ejecutarse en hardware de consumo muy modesto, incluyendo CPU y GPUs de gama baja. Esto lo convierte en un candidato interesante para prototipado local, despliegue en el borde y experimentación con modelos pequeños de razonamiento sin necesidad de infraestructura de datacenter.

El modelo ha sido entrenado con dos conjuntos de datos: Claude-Reasoning-4096 y Polyglot-Thoughts-SFT-Collection, lo que sugiere un enfoque en trazas de razonamiento destiladas y en la cobertura multilingüe. No obstante, la información pública disponible es escasa: no se han publicado benchmarks, no se especifica la licencia y la model card original no detalla la longitud de contexto ni la composición exacta del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3, según tags del repo) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, de, es, fr, it, ja |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only, según indican los tags del repositorio. Con 596 millones de parámetros, se sitúa en la gama de modelos pequeños, lo que explica su viabilidad en hardware de consumo. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo menciona el ajuste supervisado (SFT) y los dos datasets utilizados: Claude-Reasoning-4096, orientado a trazas de razonamiento, y Polyglot-Thoughts-SFT-Collection, centrado en pensamiento multilingüe.

La innovación técnica destacable es el enfoque en razonamiento (reasoning) y multilingüismo en un modelo de tamaño reducido, así como la disponibilidad de cuantizaciones estáticas generadas por mradermacher. No se mencionan técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. La cuantización se realizó con convert_type hf y quantize_version 2, y no se han publicado cuantizaciones ponderadas por imatrix en el momento de la ficha.

## Capacidades

- Generación de texto conversacional en seis idiomas (en, de, es, fr, it, ja).
- Razonamiento explícito, gracias al entrenamiento con datos de tipo Claude-Reasoning.
- Razonamiento multilingüe, derivado del dataset Polyglot-Thoughts-SFT-Collection.
- Soporte de conversación multi-turno (tag conversational en el repo).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se ha confirmado soporte de tool calling, function calling, agentes, visión, audio ni modos de pensamiento explícitos más allá del entrenamiento SFT con trazas de razonamiento.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede ejecutarse en CPU o GPU de gama baja gracias a sus cuantizaciones de 0,4-0,7 GB, lo que permite iterar rápidamente en entornos de desarrollo sin infraestructura dedicada.
- Razonamiento multilingüe en el borde: adecuado para aplicaciones que necesiten respuestas razonadas en español, francés, alemán, italiano o japonés en dispositivos con recursos limitados, como routers o mini-PCs.
- Generación de trazas de razonamiento para destilación: al estar entrenado con datos de razonamiento, puede emplearse para generar cadenas de pensamiento que sirvan como datos de entrenamiento para modelos mayores o para evaluar pipelines de destilación.
- Chatbots de soporte en seis idiomas: su cobertura lingüística permite desplegar un único modelo para atención al cliente en mercados europeos y japonés, con la ventaja de un footprint de memoria reducido.
- Experimentación académica con modelos pequeños de razonamiento: útil para investigadores que estudien el equilibrio entre tamaño, capacidades de razonamiento y multilingüismo sin necesidad de GPUs de datacenter.
- Despliegue en entornos con restricciones de memoria: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en dispositivos con menos de 1 GB de RAM disponible, lo que habilita casos de uso en sistemas embebidos o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB para cuantizaciones Q2_K a Q5_K, 0,6 GB para Q6_K, 0,7 GB para Q8_0 y 1,3 GB para f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más ligeras; GPUs de consumo como RTX 3060, RTX 4060 o superiores son más que suficientes. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPUs y CPUs.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Andgit-0.6B-SFT-GGUF | 596M | no disponible | no disponible | GGUF | Razonamiento multilingüe, 6 idiomas |
| Qwen3-0.6B | ~600M | no disponible en esta ficha | no disponible | safetensors, GGUF | Modelo base de la familia Qwen3 |
| SmolLM2-360M | 360M | no disponible | no disponible | safetensors, GGUF | Alternativa pequeña de Hugging Face |
| Gemma-2-2B | 2B | no disponible | no disponible | safetensors, GGUF | Mayor tamaño, mayor coste de inferencia |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de un despliegue en producción.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- El tamaño de 0,6B limita la profundidad de razonamiento y la precisión en tareas complejas; es probable que alucine en dominios especializados.
- La longitud de contexto no está documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- El modelo está entrenado con datos de razonamiento destilados (Claude-Reasoning), lo que puede introducir sesgos y estilos del modelo teacher.
- La cobertura lingüística se limita a seis idiomas; no se garantiza un rendimiento uniforme entre ellos.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- No se ha verificado el soporte de tool calling ni de agentes; no asumir su disponibilidad en producción.

## Enlaces

- [Hugging Face: mradermacher/Andgit-0.6B-SFT-GGUF](https://huggingface.co/mradermacher/Andgit-0.6B-SFT-GGUF)
- [Modelo base: Ma7ee7/Andgit-0.6B-SFT](https://huggingface.co/Ma7ee7/Andgit-0.6B-SFT)
- [Dataset: Ma7ee7/Claude-Reasoning-4096](https://huggingface.co/datasets/Ma7ee7/Claude-Reasoning-4096)
- [Dataset: ahmad21omar/Polyglot-Thoughts-SFT-Collection](https://huggingface.co/datasets/ahmad21omar/Polyglot-Thoughts-SFT-Collection)
- [Página de descargas de mradermacher](https://hf.tst.eu/model#Andgit-0.6B-SFT-GGUF)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF (TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Análisis de tipos de cuantización (Artefact2)](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
