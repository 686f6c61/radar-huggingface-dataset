# junafinity/Inkling-2-Mini-Uncensored-MLX-oQ8

## Resumen
Inkling-2-Mini-Uncensored-MLX-oQ8 es una conversión cuantizada en formato MLX del modelo abliterado (sin mecanismos de rechazo) OpenUncensored/Inkling-2-Mini-Uncensored, que a su vez deriva de thinkingmachines/Inkling-2-Mini. Se trata de un modelo MoE (mezcla de expertos) con transformer "looped" (con capas recurrentes), 26.388.646.400 parámetros totales y 3,4B activos por token, con capacidad de entrada de texto e imagen y una ventana de contexto de 1.048.576 tokens. La versión original solo se publicó en precisión mixta: expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), con el resto en BF16.

El trabajo de junafinity (VeriSafe.Live) consiste en una conversión oQ8 para Apple Silicon mediante la librería oMLX. Los expertos enrutados (alrededor del 93% de los pesos) se mantienen en sus formatos nativos NVFP4 y MXFP8 sin recuantizar; solo el tronco BF16 (proyecciones de atención, embedding de tokens y cabeza de salida) se convierte a 8 bits afín. La torre de visión se conserva íntegra en BF16 y se incluye el borrador DSpark MTP para decodificación especulativa. El resultado ocupa 18,76 GB con una media efectiva de 5,47 bits por peso.

La relevancia de esta ficha radica en dos factores: por un lado, la arquitectura subyacente (MoE con capas looped, contexto de un millón de tokens, capacidades multimodales y decodificación especulativa) resulta poco común en el ecosistema abierto; por otro, la abliteración elimina prácticamente toda la alineación de seguridad, lo que convierte al modelo en una herramienta exclusivamente para investigación en seguridad, interpretabilidad y red-teaming, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas looped (inkling2_loop), multimodal texto-imagen |
| Parámetros totales | 26.388.646.400 |
| Parámetros activos | 3,4B (aproximado, según model card) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantización | oQ8 (8 bits afín en tronco); expertos nativos en NVFP4 y MXFP8; torre de visión en BF16; media efectiva de 5,47 bits por peso |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (4 shards + mtp.safetensors) |

## Arquitectura y entrenamiento
El modelo base es un transformer de mezcla de expertos con una innovación estructural denominada "looped": las capas del transformer se reutilizan en varios pasos de cómputo, lo que incrementa la profundidad efectiva sin aumentar proporcionalmente el número de parámetros. Según la información disponible, cuenta con 26,4B de parámetros totales y 3,4B activos por token, lo que sitúa su coste de inferencia en el rango de un modelo denso de aproximadamente 3-4B pese a su tamaño total. La distribución de precisión original es inusual: los expertos enrutados de las capas 0-19 se publicaron en NVFP4 y los de las capas 20-23 en MXFP8, mientras que atención, embeddings y cabeza de salida quedaron en BF16. No existe un maestro BF16 de los expertos, de ahí que esta conversión no los recuantice.

El modelo incorpora además una torre de visión (422 tensores en BF16 dentro de los shards principales) que habilita la entrada de imágenes, y un borrador DSpark MTP (multi-token prediction) empaquetado aparte en mtp.safetensors, que permite decodificación especulativa en oMLX. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO en el modelo original; la información disponible indica únicamente que la variante Uncensored aplica una edición de abliteración sobre 20 proyecciones de salida de atención en BF16, que es la razón por la que el tronco se conserva a 8 bits y no a 4.

## Capacidades
- Generación de texto y razonamiento multi-paso, con soporte de modo de pensamiento (reasoning) según las etiquetas del modelo.
- Comprensión de imágenes junto con texto (pipeline image-text-to-text), gracias a la torre de visión conservada en BF16.
- Procesamiento de contexto muy largo: hasta 1.048.576 tokens, adecuado para documentos extensos, bases de código completas o conversaciones prolongadas.
- Decodificación especulativa mediante el borrador DSpark MTP incluido, que acelera la generación en oMLX.
- Capacidades multilingües limitadas al inglés según la model card.
- Al estar abliterado, responde a solicitudes que el modelo original rechazaría; esta capacidad debe entenderse como una herramienta de investigación en mecanismos de rechazo, no como una funcionalidad de producto.

## Casos de uso
- Investigación en interpretabilidad y mecanismos de rechazo: comparar las respuestas de esta variante abliterada con las del Inkling-2-Mini original sobre el mismo conjunto de prompts permite aislar qué circuitos internos implementan la negativa y cómo la edición de 20 proyecciones de atención altera el comportamiento.
- Red-teaming y evaluación de robustez: el modelo sirve como generador adversarial controlado para probar clasificadores de contenido, filtros de moderación y sistemas de defensa, en un entorno de laboratorio y con registro de resultados.
- Análisis de documentos largos con imágenes: con 1M de tokens de contexto y entrada multimodal, puede procesar informes escaneados, manuales técnicos o expedientes completos que combinan texto e imágenes en una sola pasada.
- Experimentación con arquitecturas MoE looped en Apple Silicon: permite estudiar el rendimiento real de un MoE con capas reutilizadas y 3,4B activos en hardware de consumo, midiendo latencia y calidad frente a modelos densos equivalentes.
- Evaluación de cuantización mixta: al mantener los expertos en NVFP4/MXFP8 y el tronco en 8 bits afín, es un banco de pruebas para medir la degradación de calidad de esquemas de precisión mixta frente al modelo original.
- Prototipado de asistentes técnicos en local: para desarrolladores que necesitan un modelo multimodal con contexto enorme ejecutándose íntegramente en un Mac, sin enviar datos a servicios externos, en fases de prototipo y con las salvaguardas adecuadas añadidas por su cuenta.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM/unified memory estimada: el payload completo es de 18,76 GB (17,47 GiB), por lo que se necesita al menos esa cantidad de memoria unificada más el espacio para el contexto KV; con 1M de tokens de contexto el consumo adicional puede ser muy elevado y conviene limitar la ventana en la práctica.
- Hardware objetivo: Apple Silicon exclusivamente, ya que el formato es MLX y el runtime requerido es oMLX 0.8.1 o superior (probado en 0.8.2). No es ejecutable en GPU NVIDIA o AMD mediante este repositorio.
- Equipos viables: Mac con 32 GB de memoria unificada o más para uso con contexto moderado; 64 GB o más recomendable para aprovechar ventanas de contexto largas y la torre de visión.
- Despliegue: oMLX (runtime indicado por el autor, con soporte de visión y DSpark MTP). No se proporcionan instrucciones para vLLM, llama.cpp, Ollama ni TGI, y el formato MLX no es directamente compatible con ellos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-MLX-oQ8 | 26,4B | 3,4B | 1.048.576 | Texto + imagen | Apache 2.0 | MLX (safetensors) |
| thinkingmachines/Inkling-2-Mini | 26,4B | 3,4B | 1.048.576 | Texto + imagen | No disponible en la información | Precisión mixta NVFP4/MXFP8/BF16 |
| OpenUncensored/Inkling-2-Mini-Uncensored | 26,4B | 3,4B | 1.048.576 | Texto + imagen | Apache 2.0 | Precisión mixta NVFP4/MXFP8/BF16 |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias
- La alineación de seguridad ha sido sustancialmente eliminada mediante abliteración: el modelo cumplirá solicitudes dañinas, poco éticas, ofensivas o ilegales que el original rechazaría, y carece de salvaguardas integradas significativas.
- Uso restringido por el propio autor a investigación legítima: interpretabilidad, estudio de seguridad y mecanismos de rechazo, red-teaming y evaluación de robustez. No debe desplegarse ante usuarios finales ni en producción sin capas propias de seguridad, moderación y prevención de abuso.
- Riesgo elevado de alucinación y de generar contenido inexacto o inapropiado; no se han publicado evaluaciones de calidad que permitan cuantificarlo.
- Soporte únicamente de inglés según la model card, lo que limita su uso en castellano u otros idiomas.
- La ventana de 1M de tokens es teórica: en la práctica el consumo de memoria KV puede hacer inviable aprovecharla por completo en hardware de consumo.
- Dependencia de un runtime específico (oMLX 0.8.1+) y de hardware Apple Silicon; no hay portabilidad directa a otras plataformas.
- La licencia Apache 2.0 del modelo fuente se mantiene, pero el usuario asume toda la responsabilidad legal por el uso y por los contenidos generados; los autores y cargadores declinan cualquier responsabilidad por daños derivados de un uso indebido.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/junafinity/Inkling-2-Mini-Uncensored-MLX-oQ8
- Modelo fuente abliterado: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime oMLX: https://github.com/jundot/omlx
- Sitio del autor (VeriSafe.Live): https://verisafe.live
