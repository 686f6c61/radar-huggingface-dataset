# KL-PHD/AdProducer-RL-9B

## Resumen

AdProducer-RL-9B es un modelo multimodal de tipo image-text-to-text desarrollado por KL-PHD, presentado en el trabajo *AdProducer: Towards Agentic Advertising Video Generation*. Se trata del checkpoint final de la política de un agente publicitario: partiendo de AdProducer-SFT-9B (un Qwen3.5-9B tras un arranque en frío supervisado), se ha entrenado adicionalmente con aprendizaje por refuerzo agéntico (GRPO) sobre 1.000 briefs creativos intensivos en búsqueda. El modelo convierte un brief publicitario breve en un guion visual anclado al producto, descubriendo y verificando información real del producto, recuperando referencias visuales oficiales y construyendo un storyboard plano a plano.

La arquitectura subyacente es un transformer multimodal de la familia Qwen3.5, con 9.409.813.744 parámetros totales según los pesos en safetensors (9B nominales). El modelo opera como agente: en cada ronda razona y llama a una herramienta (`search`, `image_search`, `browse`, con un máximo de 8 llamadas y 2 búsquedas de imagen), y responde con un prompt multi-plano de referencia-a-vídeo para MiniMax H3 que cita las imágenes de referencia seleccionadas. Un generador de vídeo congelado materializa después ese storyboard.

Su relevancia radica en que separa la planificación creativa y la verificación factual del producto de la generación de vídeo propiamente dicha: los storyboards mejoran la precisión del producto (forma, colores, logotipo), la precisión informativa, la expresión de los puntos de venta, el diseño de planos y la calidad visual frente a enviar el brief directamente al generador, y son transferibles a otros generadores de vídeo sin reentrenamiento. El modelo se distribuye con licencia Apache 2.0 junto con los modelos SFT y RL, los datos de entrenamiento, el código y el benchmark AdCreation-Bench (305 briefs en ocho dominios).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), agente con tool calling; pipeline image-text-to-text |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (valor usado en el despliegue de ejemplo con sglang) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de 9B parámetros derivado de Qwen3.5-9B, al que se aplicó primero un arranque en frío supervisado (AdProducer-SFT-9B) y después un entrenamiento con aprendizaje por refuerzo agéntico mediante GRPO sobre 1.000 briefs intensivos en búsqueda. El checkpoint publicado corresponde a la iteración 47 de la ejecución de RL. La recompensa combina una recompensa de vídeo (Gemini 3.1 Pro evalúa el vídeo MiniMax H3 renderizado a partir del storyboard generado por la política) y una recompensa de texto.

El bucle agéntico está restringido por diseño: en cada ronda el modelo razona y ejecuta una única llamada a herramienta entre `search`, `image_search` y `browse`, con un límite de 8 llamadas y 2 búsquedas de imagen por episodio. La salida final es un prompt multi-plano de referencia-a-vídeo para MiniMax H3 que cita explícitamente las imágenes de referencia seleccionadas. El generador de vídeo permanece congelado durante todo el proceso, de modo que el aprendizaje se concentra en la planificación, la verificación y la construcción del storyboard. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su identificador (KL-PHD/AdProducer-Train-Data).

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) orientado a planificación creativa.
- Comprensión de imágenes para seleccionar y citar referencias visuales oficiales del producto.
- Tool calling / function calling con tres herramientas: `search`, `image_search` y `browse`.
- Comportamiento agéntico multi-paso con razonamiento antes de cada llamada a herramienta y límites explícitos (8 llamadas, 2 búsquedas de imagen).
- Verificación factual de información del producto a partir de fuentes recuperadas.
- Construcción de storyboards plano a plano con descripción de encuadres y puntos de venta.
- Generación de prompts multi-plano de referencia-a-vídeo para el generador MiniMax H3, con citación de imágenes de referencia.
- Transferencia de storyboards a otros generadores de vídeo sin reentrenamiento.
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación automática de anuncios desde un enlace de producto: el agente parte de una URL, busca y verifica información del producto, recupera imágenes oficiales y produce un storyboard listo para renderizar con MiniMax H3, tal como muestra el flujo `python -m adproducer run "<product url>"`.
- Producción de creatividades a escala para equipos de marketing: al estandarizar el storyboard como artefacto intermedio, permite revisar y aprobar guiones antes de gastar cómputo en generación de vídeo.
- Verificación de fichas de producto en campañas: el uso de `search` y `browse` con recompensa de precisión informativa reduce errores en especificaciones y datos en pantalla, un riesgo habitual cuando el brief se envía directamente al generador.
- Previsualización rápida de conceptos publicitarios: el modelo genera storyboards multi-plano que pueden evaluarse sin renderizar vídeo, acelerando la iteración creativa.
- Reutilización de storyboards con distintos generadores: al ser transferibles sin reentrenamiento, un mismo guion puede probarse en varios motores de vídeo para comparar calidad.
- Investigación en agentes multimodales con RL: el checkpoint, junto con los datos y el código, sirve como base para estudiar GRPO con recompensas compuestas (vídeo + texto) en tareas de planificación visual.
- Evaluación comparativa con AdCreation-Bench: permite medir la calidad de storyboards generados sobre 305 briefs en ocho dominios frente a otras políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 9.409.813.744 parámetros, en precisión completa (BF16) los pesos ocupan aproximadamente 18,8 GB, lo que coincide con el tamaño del repositorio; se requiere margen adicional para caché KV y el contexto de hasta 65.536 tokens.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo encaja en GPU de centro de datos tipo A100 o H100 en BF16.
- Compatibilidad con GPU de consumo: no confirmada; en BF16 no cabe en GPU de 16 GB ni 24 GB, y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: servidor compatible con OpenAI; el autor usa sglang (`python -m sglang.launch_server --model-path KL-PHD/AdProducer-RL-9B --served-model-name adproducer --context-length 65536`). Compatible con la librería transformers; otros motores (vLLM, llama.cpp, Ollama, TGI) no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdProducer-RL-9B | 9,41B | 65.536 | Agente multimodal de storyboards publicitarios con RL (GRPO) | Apache 2.0 | Hugging Face (KL-PHD/AdProducer-RL-9B) |
| AdProducer-SFT-9B | no disponible | no disponible | Mismo pipeline tras arranque en frío supervisado (modelo base) | Apache 2.0 | Hugging Face (KL-PHD/AdProducer-SFT-9B) |
| Qwen3.5-9B | ~9B | no disponible | Modelo base multimodal de propósito general | no disponible | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en publicidad: su entrenamiento con RL se limita a 1.000 briefs intensivos en búsqueda, por lo que su comportamiento fuera de ese dominio no está caracterizado.
- Dependencia de herramientas externas: el bucle agéntico requiere servicios de `search`, `image_search` y `browse`; sin ellos, la calidad del storyboard y la verificación factual se degradan.
- Límite estricto de 8 llamadas y 2 búsquedas de imagen por episodio, lo que puede ser insuficiente para productos con información dispersa.
- La evaluación del entrenamiento depende de un juez externo (Gemini 3.1 Pro) y de un generador concreto (MiniMax H3), lo que puede introducir sesgos hacia el estilo de ese generador.
- Riesgo de alucinación en datos de producto si las fuentes recuperadas son ambiguas o incompletas, pese a la recompensa de precisión informativa.
- Idiomas soportados no documentados; no se garantiza un rendimiento uniforme en castellano.
- Sin descargas ni valoraciones en el momento de la ficha (0 descargas, 0 likes) y con paper aún no publicado ("coming soon"), lo que limita la validación independiente.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones de los servicios de búsqueda y del generador de vídeo usados en el pipeline antes de un despliegue comercial.
- No se documentan cuantizaciones ni requisitos de hardware validados para producción.

## Enlaces

- Hugging Face: https://huggingface.co/KL-PHD/AdProducer-RL-9B
- Modelo base SFT: https://huggingface.co/KL-PHD/AdProducer-SFT-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/KL-PHD/AdProducer-Train-Data
- Página del proyecto: https://lky-ang.github.io/AdProducer-page/
- Código: https://github.com/lky-ang/AdProducer
- Paper: pendiente de publicación ("coming soon")
