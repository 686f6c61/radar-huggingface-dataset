# Andyson/LongLive-H3

## Resumen

LongLive-H3 es un checkpoint fusionado del transformer de generación de vídeo con audio de MiniMax-H3, publicado por el usuario Andyson en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una integración de los adaptadores LoRA de un sampler acelerado ("3-Step") directamente en los pesos del transformer base, de modo que el usuario puede cargar un único conjunto de pesos sin gestionar adaptadores por separado. El resultado es un modelo de 33.122.992.896 parámetros (unos 33,1 mil millones) que genera clips de 1344×768 píxeles a 24 FPS (124 fotogramas) con audio estéreo a 32 kHz, empleando 3 evaluaciones por chunk y 8 chunks por clip (24 evaluaciones totales) con CFG 1.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de destilación/aceleración aplicada a un modelo de difusión vídeo-audio de gran tamaño; por otro, sirve de ejemplo de los riesgos de los checkpoints comunitarios derivados de modelos con licencias restrictivas. El modelo base es MiniMaxAI/MiniMax-H3, y la licencia del derivado es la MiniMax-H3 Community License Agreement, que impone condiciones específicas de uso.

La información disponible es limitada: la model card se centra en el uso práctico del checkpoint y no aporta detalles sobre el dataset de entrenamiento del modelo base, los benchmarks ni las características del proceso de fusión de LoRA. Esta ficha refleja esa escasez de datos de forma explícita, marcando como "no disponible" todo aquello que no se ha podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación conjunta de vídeo y audio (derivado de MiniMax-H3); pesos fusionados con LoRA de aceleración |
| Parametros totales | 33.122.992.896 (aprox. 33,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusión; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no validados por el autor; los pesos se distribuyen en BF16/FP32 (14 shards Safetensors, ~66,28 GB). El autor indica que la cuantización y el offloading en GPU de consumo no están validados |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | minimax-h3-community-license-agreement (licencia comunitaria de MiniMax-H3) |
| Formato de pesos | safetensors (14 shards + índice), más componentes auxiliares del modelo base (text encoder, VAE) descargados por separado |

Otros datos técnicos: resolución de salida 1344×768, 124 fotogramas a 24 FPS, audio estéreo a 32 kHz, 3 evaluaciones por chunk, 8 chunks por clip, CFG 1. Tamaño del repositorio: 66,3 GB. Librería: diffusers. Fecha de creación: 2026-11-26.

## Arquitectura y entrenamiento

El modelo es un transformer de difusión que genera vídeo y audio de forma conjunta a partir de una descripción multimodal en texto. La arquitectura subyacente pertenece a MiniMax-H3, del que este repositorio es un fine-tune fusionado. El autor no describe la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, esquema de fusión vídeo-audio), por lo que esos detalles deben consultarse en la documentación del modelo base.

El aspecto técnico destacable es el esquema de muestreo acelerado: en lugar de decodificar con el número de pasos habitual del pipeline H3, se aplican 3 evaluaciones por chunk sobre 8 chunks (24 evaluaciones por clip) con CFG 1. Los adaptadores LoRA que implementan esta aceleración se han fusionado en los pesos del transformer, de modo que el checkpoint resultante contiene un único conjunto de pesos sin adaptadores separados. El autor advierte que la fusión introduce errores de redondeo en coma flotante y que las salidas pueden diferir en composición respecto a la inferencia con adaptadores FP32 separados. No se aportan datos sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO; se trata de un modelo de difusión, por lo que esos términos no aplican del mismo modo que en un LLM.

## Capacidades

- Generación de vídeo a partir de texto: clips de 1344×768 píxeles, 124 fotogramas a 24 FPS.
- Generación de audio sincronizado: pista estéreo a 32 kHz generada junto con el vídeo.
- Descripción multimodal integrada: el prompt admite una estructura con descripción visual, paisaje sonoro y música no diegética, lo que permite controlar por separado la imagen y el audio.
- Generación en un solo clip: la interfaz actual es de primer clip texto-a-vídeo/audio, no de continuación de vídeo largo.
- Idiomas: inglés y chino (el autor indica que la entrada real de los ejemplos se hace en inglés).
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking": no disponible.
- Visión de entrada: no disponible; el modelo es texto-a-vídeo/audio, no vídeo-a-vídeo.

## Casos de uso

- Prototipado de anuncios y spots cortos: el modelo genera clips de unos 5 segundos (124 fotogramas a 24 FPS) con audio incorporado, lo que permite iterar sobre conceptos creativos sin equipo de rodaje. Es adecuado por su resolución 1344×768 y su audio estéreo nativo.
- Generación de audio diegético para escenas: la estructura de prompt separa "overall_soundscape" y "non_diegetic_music", de modo que se puede pedir explícitamente el sonido de ambiente (por ejemplo, lluvia, tráfico, pasos) y dejar la música fuera de la diégesis.
- Previsualización de storyboards animados: para estudios de animación que necesitan ver un plano en movimiento antes de producirlo, el modelo ofrece una aproximación visual y sonora en una sola pasada.
- Creación de contenido para redes sociales: clips verticales u horizontales de duración corta con audio listo para publicar, generados a partir de una descripción textual detallada.
- Investigación en generación conjunta vídeo-audio: el checkpoint fusionado permite estudiar el efecto de la aceleración por destilación (3 pasos por chunk) sobre la calidad audiovisual, comparándolo con el pipeline H3 estándar.
- Docencia y divulgación sobre difusión multimodal: sirve para demostrar cómo un prompt estructurado controla simultáneamente la composición visual y el diseño sonoro.
- Pruebas de concepto en pipelines de postproducción: integración del clip generado como material de relleno o de previz en flujos de edición, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Los pesos del transformer ocupan aproximadamente 66,28 GB en BF16/FP32, por lo que se necesita una GPU de alta memoria; el autor indica que se requiere una GPU de alta memoria y que el offloading y la cuantización en GPU de consumo no están validados.
- GPU recomendadas: no se especifican modelos concretos; por el tamaño de los pesos, quedan fuera del alcance de GPUs de consumo convencionales y se orientan a aceleradores de centro de datos (A100/H100 de 80 GB o superiores).
- ¿Cabe en GPU de consumo? No validado por el autor; con 66,28 GB de pesos en BF16 no cabe en GPUs de 24 GB sin cuantización, y la cuantización no está validada.
- Opciones de despliegue: el autor proporciona un script `infer.py` y una integración Python (`h3_inference` con `load_base`, `ChunkedH3Runtime`, `ChunkGeometry`, `generate_sample`), sobre diffusers con una revisión fijada. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El esquema de 3 evaluaciones por chunk y 8 chunks (24 evaluaciones por clip) está pensado para reducir el coste frente al muestreo estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongLive-H3 (este) | 33,1 mil millones | Vídeo 1344×768, 124 frames a 24 FPS | Sí, estéreo 32 kHz | MiniMax-H3 Community License | Hugging Face (repo comunitario) |
| MiniMax-H3 (base) | no disponible en la información | Vídeo con audio (mismo pipeline) | Sí | MiniMax-H3 Community License | Hugging Face (MiniMaxAI) |
| Otros modelos texto-a-vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base. No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax-H3 Community License Agreement impone condiciones específicas; debe revisarse antes de cualquier uso comercial. El modelo base y este derivado comparten licencia, pero el derivado es un checkpoint comunitario no oficial.
- Checkpoint no oficial: el autor es un usuario comunitario (Andyson), no MiniMax; no hay garantía de soporte, mantenimiento ni corrección de errores.
- Sin validación de cuantización ni offloading: el autor advierte explícitamente que la cuantización y el offloading en GPU de consumo no están validados, lo que limita el despliegue en hardware asequible.
- Diferencias por fusión de LoRA: la fusión introduce errores de redondeo en coma flotante; las salidas pueden diferir en composición respecto a la inferencia con adaptadores FP32 separados y no son idénticas píxel a píxel.
- Solo primer clip: la interfaz actual es de primer clip texto-a-vídeo/audio, no de continuación de vídeo largo; no debe esperarse coherencia entre clips sucesivos.
- Idiomas limitados: solo inglés y chino; el autor indica que la entrada real de los ejemplos se hace en inglés.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir contenido incoherente, artefactos o detalles físicamente imposibles; no se documentan sesgos conocidos.
- Dependencia de versiones: requiere Python 3.12, PyTorch 2.11.0/CUDA 13.0 y una revisión fijada de diffusers; cambios de versión pueden romper la reproducibilidad.
- Sin benchmarks publicados: no hay métricas objetivas de calidad audiovisual en la información disponible, por lo que la evaluación cualitativa queda a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Andyson/LongLive-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Revisión del modelo base indicada por el autor: https://huggingface.co/MiniMaxAI/MiniMax-H3/tree/fa9c8ab1eaa21c8ae25e7e40b83b2e6002f340af
- Vídeo de ejemplo (Tokyo night drive): https://huggingface.co/Andyson/LongLive-H3/resolve/main/examples/tokyo-car.mp4
- Prompt de ejemplo (Tokyo night drive): https://huggingface.co/Andyson/LongLive-H3/blob/main/examples/tokyo-car.txt
- Vídeo de ejemplo (Cartoon recording studio): https://huggingface.co/Andyson/LongLive-H3/resolve/main/examples/cartoon-studio.mp4
- Prompt de ejemplo (Cartoon recording studio): https://huggingface.co/Andyson/LongLive-H3/blob/main/examples/cartoon-studio.txt
- Licencia: https://huggingface.co/Andyson/LongLive-H3/blob/main/LICENSE
