# ailiwood999/Llama-SGF-8B

## Resumen

Llama-SGF-8B es un ajuste fino (fine-tuning) de tipo merged checkpoint del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicado por el usuario ailiwood999 en Hugging Face. El autor lo describe como un modelo de 8B parámetros orientado a investigación en razonamiento jurídico (legal-reasoning research), construido sobre la arquitectura Llama y distribuido como checkpoint completo en BF16 que se carga directamente en Transformers sin necesidad de un modelo base separado ni de adaptadores.

El modelo hereda la arquitectura transformer densa del DeepSeek-R1-Distill-Llama-8B, que a su vez es un destilado del razonamiento de DeepSeek-R1 sobre la base de Llama 3.1 8B. Con 8.030.261.248 parámetros reales verificados en safetensors y un repositorio de 16,1 GB en BF16, es un modelo de tamaño medio apto para despliegue en una sola GPU de gama alta o en configuraciones multi-GPU consumer.

Su relevancia es limitada y muy específica: se trata de una publicación con 2 descargas y 0 likes, sin model card detallada más allá de un ejemplo de uso, sin benchmarks publicados y sin información sobre el dataset de ajuste. Resulta útil como caso de estudio de fine-tuning sobre un destilado de razonamiento, pero no debe considerarse un modelo con validación comunitaria ni evaluación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.1 8B vía DeepSeek-R1-Distill-Llama-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar por el autor) |
| Tipos de cuantizacion | no disponible (el autor solo publica checkpoint BF16; compatible con cuantización estándar vía herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | llama-3.1-and-deepseek-mit (Llama 3.1 Community License + DeepSeek MIT) |
| Formato de pesos | safetensors (BF16, checkpoint merged completo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo decoder-only, heredada del DeepSeek-R1-Distill-Llama-8B, que a su vez parte de Llama 3.1 8B. El modelo base es un destilado de razonamiento: DeepSeek entrenó este destilado para reproducir las cadenas de razonamiento de DeepSeek-R1 sobre la arquitectura y tokenizador de Llama 3.1 8B. El fine-tuning de ailiwood999 se presenta como un checkpoint merged en BF16, lo que implica que los pesos ajustados se han fusionado en el modelo completo en lugar de distribuirse como adaptador LoRA separado.

No se dispone de información sobre el dataset de ajuste, el número de tokens de entrenamiento, la composición de los datos jurídicos utilizados, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. La model card no documenta hiperparámetros, duración del entrenamiento ni metodología de evaluación. Tampoco se confirma si se preservaron las capacidades de razonamiento del destilado original ni si el ajuste jurídico las degradó. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa: no hay datos.

## Capacidades

- Generación de texto conversacional, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento orientado a dominio jurídico (según la descripción del autor: "legal-reasoning research"), sin evaluación publicada que lo respalde.
- Herencia potencial de las capacidades de razonamiento del DeepSeek-R1-Distill-Llama-8B, no verificadas tras el fine-tuning.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).

## Casos de uso

- Investigación en razonamiento jurídico: uso como banco de pruebas para estudiar cómo un fine-tuning de dominio afecta a las cadenas de razonamiento de un destilado de R1; adecuado por su tamaño manejable y su checkpoint merged listo para cargar.
- Experimentos académicos de fine-tuning sobre destilados de razonamiento: sirve como referencia de partida para comparar ajustes jurídicos frente al DeepSeek-R1-Distill-Llama-8B original.
- Generación de borradores explicativos en contextos contractuales: el ejemplo de la model card ("Explain why clear contract definitions matter") sugiere uso para producir explicaciones didácticas de conceptos legales, aunque sin garantía de exactitud.
- Prototipado local en una sola GPU: al ser un modelo de 8B en BF16, permite iterar en investigación sin infraestructura de clúster.
- Evaluación comparativa de licencias y atribución: útil como caso práctico de modelos con licencia compuesta (Llama 3.1 + DeepSeek MIT) para estudiar obligaciones de cumplimiento.
- Base para cuantización y despliegue ligero: al ser un checkpoint estándar de Transformers, puede cuantizarse con herramientas externas para pruebas de inferencia en hardware consumer, aunque el autor no publica versiones GGUF ni cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8,03B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 18-20 GB como mínimo.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4,5-5 GB, más overhead. Estas cifras son estimaciones por tamaño, no publicadas por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin compromisos; RTX 4090 (24 GB) para BF16 con margen ajustado.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB o menos requeriría cuantización.
- Opciones de despliegue: Transformers (documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo), vLLM y llama.cpp/Ollama de forma no oficial (sin pesos GGUF publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-SGF-8B | 8,03B | no disponible | Llama 3.1 + DeepSeek MIT | Hugging Face (2 descargas) | Fine-tuning jurídico sin evaluación publicada |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | no disponible en esta ficha | MIT (DeepSeek) | Hugging Face, ampliamente usado | Modelo base; destilado de razonamiento con evaluación publicada por DeepSeek |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K (según Meta) | Llama 3.1 Community License | Hugging Face | Referencia generalista de la misma familia arquitectónica |
| Qwen2.5-7B-Instruct | 7B | 128K (según Qwen) | Apache 2.0 | Hugging Face | Alternativa generalista de tamaño comparable con licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación de calidad jurídica, ni comparación con el modelo base; no se puede afirmar que el fine-tuning mejore el razonamiento jurídico.
- Riesgo de alucinación elevado en dominio jurídico: un modelo de 8B ajustado sin validación puede generar referencias normativas, jurisprudencia o cláusulas inexistentes; no apto para asesoramiento legal real.
- Sesgos desconocidos: no se documenta la composición del dataset de ajuste, por lo que no pueden evaluarse sesgos de dominio, geográficos o lingüísticos.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base o si el ajuste lo ha reducido a un solo idioma.
- Longitud de contexto no confirmada: aunque el modelo base soporta contextos largos, el autor no especifica la ventana efectiva tras el fine-tuning.
- Licencia compuesta y restrictiva: uso sujeto simultáneamente a la Llama 3.1 Community License (con umbral de 700 millones de usuarios mensuales y política de uso aceptable) y a la DeepSeek MIT License; requiere revisar LICENSE y NOTICE antes de cualquier uso comercial.
- Madurez mínima: 2 descargas y 0 likes; sin mantenimiento, comunidad ni soporte; fecha de creación posterior a la información de referencia disponible, lo que impide verificar su adopción.
- Sin versiones cuantizadas oficiales ni GGUF: el despliegue ligero requiere conversión propia y validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ailiwood999/Llama-SGF-8B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Política de uso aceptable de Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/USE_POLICY.md
- Repositorio de modelos Llama de Meta: https://github.com/meta-llama/llama-models
