# CaiYuanhao/OmniVCus

## Resumen

OmniVCus es una familia de modelos de personalización de vídeo (video customization) desarrollada por CaiYuanhao y presentada en NeurIPS 2025. El modelo resuelve el problema de generar vídeos controlados por un sujeto de referencia combinado con condiciones multimodales adicionales: máscaras, mapas de profundidad o instrucciones textuales. A diferencia de enfoques de optimización por vídeo (por ejemplo, fine-tuning por instancia), OmniVCus es un método feedforward: una sola pasada de inferencia produce el vídeo personalizado.

La familia se compone de tres variantes construidas sobre los modelos base Wan2.1-T2V-1.3B, Wan2.1-T2V-14B y Wan2.2-T2V-A14B, lo que permite elegir entre un modelo ligero (1.300 millones de parámetros) y variantes de mayor calidad (14B y A14B). Las tareas soportadas incluyen reference-to-video, reference-mask-to-video, reference-depth-to-video y reference-instruction-to-video.

Es relevante ahora porque ofrece una alternativa abierta (licencia Apache 2.0) a VACE, el método de referencia en personalización de vídeo, con soporte para control multimodal en un único pipeline. El repositorio ocupa 19,8 GB e incluye los pesos de las tres variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación de vídeo (basado en Wan2.1/Wan2.2 T2V) |
| Parametros totales | 1.3B (variante 2.1-1.3B); 14B (variante 2.1-14B); A14B (variante 2.2-14B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 19,8 GB; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

OmniVCus se construye sobre los modelos de difusión texto-a-vídeo Wan2.1-T2V-1.3B, Wan2.1-T2V-14B y Wan2.2-T2V-A14B mediante fine-tuning. La innovación principal es la inyección de condiciones multimodales de control (imagen de referencia del sujeto, máscaras, mapas de profundidad e instrucciones textuales) en un esquema feedforward, evitando la optimización por instancia típica de trabajos anteriores de personalización de sujeto. El modelo permite combinar la identidad del sujeto de referencia con la estructura espacial aportada por máscaras o profundidad, o con instrucciones en lenguaje natural.

Los detalles concretos sobre el número de tokens de entrenamiento, la composición del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada. El autor publica dos datasets asociados: CaiYuanhao/OmniVCus-Train y CaiYuanhao/OmniVCus-Test. La comparación cualitativa de la model card frente a VACE muestra ejemplos de reference-to-video y reference-mask-to-video para las variantes 1.3B y 14B.

## Capacidades

- Generación de vídeo condicionada por una imagen de referencia del sujeto (reference-to-video).
- Generación de vídeo condicionada por referencia y máscara (reference-mask-to-video), útil para control espacial de la región a personalizar.
- Generación de vídeo condicionada por referencia y mapa de profundidad (reference-depth-to-video), para control de estructura 3D.
- Generación de vídeo condicionada por referencia e instrucción textual (reference-instruction-to-video).
- Personalización feedforward: no requiere optimización por vídeo en tiempo de inferencia.
- Entrada multimodal: vídeo, imagen y texto.
- Soporte de prompts textuales en inglés para describir la escena.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode (no aplicables a un modelo de generación de vídeo).

## Casos de uso

- Publicidad personalizada: introducir un producto o modelo concreto (imagen de referencia) en escenas generadas a partir de un prompt, manteniendo la identidad del sujeto en todos los planos.
- Posproducción con control de máscara: sustituir o personalizar una región concreta del vídeo usando reference-mask-to-video, preservando el resto del fotograma original.
- Control de estructura mediante profundidad: generar variaciones de una escena respetando la geometría y el movimiento capturados en un mapa de profundidad, útil en previsualización de VFX.
- Creación de contenido para redes sociales: generar clips cortos con un personaje consistente a partir de una sola imagen de referencia y una instrucción textual.
- Prototipado de escenas para cine o animación: iterar sobre composiciones con control de sujeto, máscara y profundidad antes de la producción final.
- Investigación en generación de vídeo: punto de partida abierto (Apache 2.0) para experimentar con personalización de sujeto y control multimodal, con variantes de 1.3B (asequible) y 14B (mayor calidad).
- Aumento de datos sintéticos: generar vídeos con sujetos controlados para entrenar otros modelos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (métricas numéricas tipo FVD, CLIP-score, etc.) en la información disponible. La model card únicamente incluye comparaciones cualitativas mediante GIF frente a VACE en tareas de reference-to-video y reference-mask-to-video para las variantes 1.3B y 14B.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para modelos de difusión de vídeo de tamaño comparable, la variante 1.3B requiere del orden de 10-16 GB en precisión reducida y la variante 14B del orden de 40-80 GB, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no disponible. Por tamaño, la variante 14B requiere GPUs de datacenter (A100 80 GB, H100) para inferencia sin cuantización; la variante 1.3B podría caber en GPUs consumer de gama alta (RTX 4090, 24 GB), sin confirmación oficial.
- Despliegue: el autor referencia DiffSynth-Studio en el repositorio (rutas gif_demo dentro de DiffSynth-Studio), lo que sugiere ese framework como vía de inferencia. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniVCus (2.1-1.3B / 2.1-14B / 2.2-14B) | 1.3B / 14B / A14B | no disponible | Personalización de vídeo multimodal | Apache 2.0 | Hugging Face |
| VACE (referencia en la model card) | no disponible | no disponible | Personalización y control de vídeo | no disponible en la información | no disponible en la información |
| Wan2.1-T2V-1.3B (modelo base) | 1.3B | no disponible | Texto-a-vídeo | no disponible en la información | Hugging Face (Wan-AI) |
| Wan2.1-T2V-14B / Wan2.2-T2V-A14B (modelos base) | 14B / A14B | no disponible | Texto-a-vídeo | no disponible en la información | Hugging Face (Wan-AI) |

La comparación cuantitativa con VACE no está disponible más allá de los ejemplos cualitativos de la model card.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; los prompts en otros idiomas pueden degradar la calidad.
- Riesgo de artefactos y deriva de identidad en vídeos largos o con movimiento complejo, habitual en modelos de difusión de vídeo; no cuantificado por el autor.
- No se documentan sesgos específicos del dataset de entrenamiento; al derivar de Wan2.1/Wan2.2, hereda los sesgos de esos modelos base.
- Riesgo de alucinación visual: el modelo puede generar detalles inconsistentes con la referencia o la instrucción.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base Wan2.1/Wan2.2 de los que deriva.
- No hay benchmarks cuantitativos publicados que permitan estimar la calidad frente a alternativas en producción.
- Requisitos de hardware no documentados oficialmente; la variante 14B exige recursos considerables.
- El repositorio tiene 0 descargas y 6 likes en el momento de la consulta, lo que indica adopción aún muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/CaiYuanhao/OmniVCus
- Dataset de entrenamiento: https://huggingface.co/datasets/CaiYuanhao/OmniVCus-Train
- Dataset de test: https://huggingface.co/datasets/CaiYuanhao/OmniVCus-Test
- Paper (arXiv): https://arxiv.org/abs/2506.23361
- Repositorio GitHub (Open-OmniVCus): https://github.com/caiyuanhao1998/Open-OmniVCus
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
