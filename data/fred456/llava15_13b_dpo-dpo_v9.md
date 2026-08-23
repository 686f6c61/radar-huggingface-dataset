# Fred456/llava15_13b_DPO-DPO_v9

## Resumen

Fred456/llava15_13b_DPO-DPO_v9 es un adaptador LoRA (librería PEFT) publicado por el usuario Fred456, diseñado para ajustar el modelo multimodal LLaVA v1.5 de 13B parámetros mediante entrenamiento con DPO (Direct Preference Optimization). El modelo base declarado es `liuhaotian/llava-v1.5-13b`, un referente en el campo del ajuste visual de instrucciones (visual instruction tuning) presentado en NeurIPS 2023.

Se trata de un repositorio experimental con 0 descargas y 0 likes, creado en agosto de 2026, cuyo README no aporta información sustancial sobre el entrenamiento, los datos utilizados ni los resultados obtenidos. El tamaño del repositorio es de 1,1 GB, consistente con un adaptador LoRA para un modelo de 13B. La relevancia de esta ficha es limitada: al carecer de documentación técnica y de evaluación, su uso en producción no está respaldado por datos verificables.

La principal utilidad de este modelo es exploratoria: permite reproducir un pipeline de DPO sobre LLaVA v1.5 y evaluar el impacto de esta técnica de alineación en un modelo multimodal, aunque el autor no ha publicado los detalles de entrenamiento necesarios para replicar o evaluar el proceso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA v1.5 (LLaMA 13B + vision encoder CLIP ViT-L/14) |
| Parametros totales | no disponible (adaptador LoRA, el modelo base tiene 13B) |
| Parametros activos | no disponible (adaptador LoRA) |
| Longitud de contexto | no disponible (heredada del modelo base, 2048 tokens en LLaVA v1.5) |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (hereda del modelo base: principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Modelo base | liuhaotian/llava-v1.5-13b |

## Arquitectura y entrenamiento

El modelo base LLaVA v1.5 13B combina un codificador visual CLIP ViT-L/14 con un LLM LLaMA 13B, conectados mediante una proyección lineal. El adaptador LoRA de este repositorio se ha entrenado con DPO (Direct Preference Optimization), una técnica de alineación que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa separado, a diferencia de RLHF clásico.

Los detalles de entrenamiento no están disponibles: no se especifica el dataset de preferencias utilizado, el número de pasos, la tasa de aprendizaje, el batch size ni la configuración de LoRA (rango, alpha, targets). La model card solo indica que se usó PEFT 0.13.0 y que el modelo base es LLaVA v1.5 13B. El tag `arxiv:1910.09700` hace referencia al paper de Lacoste et al. sobre el cálculo de emisiones de carbono, que aparece citado en la plantilla de la model card, no a una innovación técnica del entrenamiento.

## Capacidades

- Capacidades visuales y de lenguaje: al estar basado en LLaVA v1.5, hereda las capacidades de conversación multimodal sobre imágenes, incluyendo descripción, respuesta a preguntas visuales (VQA) y razonamiento sobre contenido visual.
- Alineación con preferencias humanas: el entrenamiento DPO pretende alinear las respuestas del modelo con preferencias humanas, aunque no se han publicado resultados que confirmen una mejora efectiva.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles (el modelo base LLaVA v1.5 es principalmente monolingüe en inglés).
- Capacidades especiales (thinking mode, vision, audio): solo visión (entrada de imágenes) y texto.

## Casos de uso

- Investigación académica en alineación multimodal: el adaptador permite estudiar cómo la DPO afecta a un modelo vision-language en comparación con el modelo base sin el adaptador, aunque sin datos de evaluación no se puede validar el efecto.
- Prototipado experimental de pipelines DPO: el repositorio puede servir como punto de partida para desarrolladores que quieran replicar un flujo de entrenamiento DPO sobre LLaVA v1.5, aunque carece de documentación para reproducirlo.
- Comparación de técnicas de alineación: un investigador podría cargar este adaptador y compararlo con el modelo base para medir diferencias cualitativas en respuestas a preguntas visuales.
- Fine-tuning adicional: el adaptador puede servir como base para un nuevo entrenamiento con datos específicos, aunque se recomienda partir del modelo base original para mayor control.
- Evaluación de robustez: se puede usar para probar si el modelo alineado con DPO reduce alucinaciones visuales, aunque no hay datos publicados que lo confirmen.
- Integración en demos de visión-idioma: se puede integrar en proyectos que usen LLaVA v1.5 como base, cargando el adaptador LoRA sobre el modelo base, aunque no se recomienda para producción sin validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, ni comparaciones con el modelo base ni con otros modelos. No se puede afirmar que el adaptador mejore o degrade el rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un adaptador LoRA que debe cargarse sobre LLaVA v1.5 13B, se necesita memoria suficiente para el modelo base completo (aproximadamente 26 GB en fp16 para los pesos del modelo).
- GPU recomendadas: para cargar el modelo base en fp16 se recomienda una GPU con al menos 28 GB de VRAM (A100 40GB, RTX 4090 24GB es insuficiente sin cuantización). Para cuantización 8-bit o 4-bit, una RTX 3090 o RTX 4090 puede ser suficiente.
- Compatibilidad con consumer GPU: no, si se usa fp16. Con cuantización 4-bit (GPTQ o bitsandbytes), sí podría caber en GPUs de 24 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta como modelo GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fred456/llava15_13b_DPO-DPO_v9 | 13B (base) + LoRA | no disponible | no disponible | HuggingFace |
| liuhaotian/llava-v1.5-13b | 13B | 2048 tokens | no disponible | HuggingFace |
| liuhaotian/llava-v1.5-7b | 7B | 2048 tokens | no disponible | HuggingFace |
| Fred456/llava15_7b_DPO-DPO_llava_13b_v6 | 7B (base) + LoRA | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos. La comparativa se limita a características de arquitectura y tamaño. El modelo no tiene evaluación publicada, por lo que no se puede comparar numéricamente con otras alternativas.

## Limitaciones y advertencias

- Sin documentación de entrenamiento: no se especifica el dataset de DPO, ni los hiperparámetros, ni el procedimiento, lo que impide evaluar la calidad y reproducibilidad del entrenamiento.
- Sin evaluación publicada: no hay benchmarks, métricas ni ejemplos cualitativos que demuestren una mejora respecto al modelo base.
- Riesgo de alucinaciones visuales: al ser un adaptador no validado, puede presentar alucinaciones en descripciones de imágenes, un problema conocido de LLaVA v1.5.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- Modelo experimental: con 0 descargas y 0 likes, no hay evidencia de que el modelo haya sido probado o validado por terceros.
- Limitaciones de contexto: el modelo base tiene una ventana de contexto de 2048 tokens, lo que limita la capacidad de procesar conversaciones largas o documentos extensos.
- Idioma: el modelo base es principalmente inglés, por lo que el rendimiento en otros idiomas es limitado o no disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fred456/llava15_13b_DPO-DPO_v9
- Repositorio del modelo base LLaVA v1.5: https://huggingface.co/liuhaotian/llava-v1.5-13b
- GitHub de LLaVA: https://github.com/haotian-liu/LLaVA
- Releases de LLaVA: https://github.com/haotian-liu/LLaVA/releases
