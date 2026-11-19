# CBA-Research/GameScaling-27B-S1-FP8

## Resumen

GameScaling-27B-S1-FP8 es una cuantización en FP8 del checkpoint GameScaling-27B-S1, un modelo multimodal de tipo image-text-to-text derivado de Qwen/Qwen3.5-27B mediante continued pre-training. El trabajo original lo firman investigadores de miHoYo (Honkai AI R&D Team), la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín, bajo el título "Scaling in Games: Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds". El repositorio que nos ocupa lo publica CBA-Research, que no ha entrenado el modelo y se limita a ofrecer el checkpoint FP8 que los autores originales no publicaron.

El modelo está pensado para agentes encarnados (embodied agents) que operan en entornos de videojuego mediante control de teclado y ratón, combinando percepción visual de la pantalla con razonamiento en lenguaje natural. Cuenta con 27.356.728.560 parámetros totales (unos 27,36 mil millones) y hereda la arquitectura Qwen3.5 del modelo base, con una ventana de contexto que no se detalla en la información disponible.

La relevancia de esta ficha es doble: por un lado documenta un modelo de investigación especializado en agentes de juego con licencia Apache-2.0, y por otro señala una cuantización FP8 que reduce el peso del repositorio a 35,9 GB, facilitando el despliegue en infraestructura con memoria limitada. Es un modelo en inglés, con soporte multimodal de imagen y texto, y pensado para experimentación más que para producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base, el equipo original aplicó continued pre-training orientado a agentes encarnados en entornos de juego, con el objetivo de que el modelo aprenda a interpretar la pantalla y a emitir acciones de teclado y ratón. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se especifican innovaciones de decodificación o mecanismos de atención alternativos.

La contribución del repositorio de CBA-Research es exclusivamente de cuantización: convierte los pesos a FP8 mediante compressed-tensors y los publica en safetensors compatibles con transformers. No hay entrenamiento adicional ni modificación de comportamiento respecto al checkpoint original. La información disponible no permite confirmar detalles sobre la estrategia de mezcla de datos, el currículo de entrenamiento o el uso de datos sintéticos generados en los propios videojuegos.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural en inglés.
- Procesamiento de imágenes (image-text-to-text): interpretación de capturas de pantalla de videojuegos.
- Control de agente mediante acciones de teclado y ratón (etiquetas keyboard-mouse, game-agent, embodied-agent).
- Razonamiento multi-paso orientado a la interacción con entornos virtuales.
- Conversación multi-turno (etiqueta conversational).
- Capacidades heredadas del modelo base Qwen3.5-27B, cuyo alcance exacto no se detalla en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Agentes autónomos en videojuegos: el modelo puede recibir capturas de pantalla y emitir acciones de teclado y ratón, lo que permite construir bots que jueguen o asistan en títulos concretos dentro de entornos controlados de investigación.
- Investigación en agentes encarnados: sirve como base para estudiar cómo el continued pre-training en entornos virtuales transfiere habilidades de percepción y control a otros dominios simulados.
- Automatización de pruebas de juego (QA): un agente basado en este modelo puede recorrer menús, ejecutar secuencias de entrada y detectar comportamientos anómalos en builds de desarrollo.
- Generación de datos de interacción: el modelo puede producir trayectorias de acciones y descripciones de pantalla que alimenten pipelines de entrenamiento de otros agentes.
- Asistencia a jugadores: integrado en una herramienta de escritorio, puede analizar la pantalla y sugerir la siguiente acción o explicar el estado del juego en lenguaje natural.
- Evaluación comparativa de modelos de agente: al estar disponible en FP8 y con licencia Apache-2.0, facilita reproducir experimentos de la familia GameScaling en hardware más modesto.
- Prototipado de interfaces multimodales: cualquier aplicación que necesite razonar sobre una imagen y devolver texto en inglés puede usar el modelo como componente, aunque no sea su especialidad principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 28-30 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda planificar al menos 40 GB para contextos largos.
- GPU recomendadas: H100 80 GB, A100 80 GB, L40S 48 GB o GPUs con 48 GB o más para FP8 nativo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP8 sin técnicas de offload o cuantizaciones adicionales a 4 bits; sería necesario convertir a GGUF/AWQ/GPTQ.
- Opciones de despliegue: transformers con compressed-tensors para FP8; vLLM y TGI para servir en GPU con soporte FP8; llama.cpp/Ollama requerirían una conversión adicional a GGUF no incluida en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-27B-S1-FP8 | 27,36 B | no disponible | imagen + texto | Apache-2.0 | Hugging Face (CBA-Research) |
| GameScaling-27B-S1 (original) | 27,36 B | no disponible | imagen + texto | Apache-2.0 | Hugging Face (THUSI-Lab), presumiblemente en BF16 |
| Qwen/Qwen3.5-27B (base) | 27 B | no disponible | imagen + texto | no disponible en la información | Hugging Face (Qwen) |
| GameScaling-9B-S1 | 9 B | no disponible | imagen + texto | Apache-2.0 | Hugging Face (THUSI-Lab) |

La comparativa se limita a la familia GameScaling y su modelo base porque la información proporcionada no incluye datos de rendimiento que permitan contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo especializado en agentes de juego: su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al de modelos generalistas del mismo tamaño.
- Solo soporta inglés según la model card; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a los modelos de lenguaje; en el contexto de agentes de juego, una acción errónea puede tener consecuencias no deseadas en el entorno.
- No se han publicado evaluaciones de sesgos ni de seguridad en la información disponible.
- La cuantización FP8 puede introducir degradación de calidad respecto al checkpoint original en BF16; no se documenta la magnitud de esa pérdida.
- Aunque la licencia es Apache-2.0, el uso comercial debe verificarse contra las condiciones del modelo base Qwen3.5-27B y de los datos de entrenamiento originales, no detalladas aquí.
- El repositorio lo mantiene un tercero (CBA-Research) no afiliado a los autores; la procedencia y reproducibilidad de la cuantización no están auditadas en la información disponible.
- No se especifican la longitud de contexto ni los requisitos exactos de formato de prompt, lo que complica la integración en producción sin consultar la model card original.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/CBA-Research/GameScaling-27B-S1-FP8
- Paper en arXiv: https://arxiv.org/abs/2610.28698
- Página de paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Checkpoint original de la familia: https://huggingface.co/THUSI-Lab/GameScaling-27B-S1 (referenciado en la model card; disponibilidad no verificada)
