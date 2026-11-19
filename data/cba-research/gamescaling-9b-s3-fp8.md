# CBA-Research/GameScaling-9B-S3-FP8

## Resumen

GameScaling-9B-S3-FP8 es un modelo multimodal de tipo image-text-to-text desarrollado por CBA-Research (con autoría académica de miHoYo Honkai AI R&D Team, Tsinghua University, University of Chinese Academy of Sciences, The University of Hong Kong, NUS y Peking University) a partir de Qwen/Qwen3.5-9B. Se trata de un fine-tune por continued pre-training orientado a agentes encarnados en entornos de videojuego, capaces de interpretar la pantalla y emitir acciones de teclado y ratón. El modelo forma parte de la familia GameScaling, publicada junto al paper arXiv:2610.28698 "Scaling in Games: Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds".

El modelo resuelve el problema de construir agentes que operen videojuegos comerciales sin API interna, aprendiendo directamente de pares observación-acción (frames de pantalla y eventos de teclado/ratón) mediante continued pre-training sobre un modelo base instructivo de 9B. La variante S3 corresponde a una de las etapas de escalado del proyecto, y el sufijo FP8 indica que los pesos se distribuyen cuantizados en punto flotante de 8 bits mediante compressed-tensors, lo que reduce el repositorio a 13,5 GB frente a los ~19 GB de un checkpoint BF16 equivalente.

Con 9.409.813.744 parámetros totales y licencia Apache 2.0, el modelo es relevante para investigación en agentes embodied y automatización de pruebas de juego, aunque su soporte lingüístico declarado se limita al inglés y no se han publicado métricas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen/Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); otros formatos no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantización FP8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de ~9,4B parámetros, y se somete a continued pre-training sobre datos de interacción en videojuegos. La model card describe la iniciativa como "Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds", lo que indica que el entrenamiento se realiza sobre trayectorias de juego reales: observaciones visuales (frames) emparejadas con acciones discretas de teclado y ratón. El pipeline declarado es image-text-to-text, coherente con un encoder visual acoplado a un decoder de lenguaje que emite comandos de control.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). La variante S3 forma parte de una escalera de modelos (0.8B, 2B, 9B, 27B en etapas S1 y S3) que sugiere un estudio sistemático de leyes de escalado para agentes en entornos virtuales. La cuantización FP8 se aplica a los pesos publicados mediante la librería compressed-tensors, lo que facilita el despliegue en hardware con soporte FP8 nativo.

## Capacidades

- Percepción visual de pantalla: procesa frames de videojuego como entrada image-text-to-text.
- Emisión de acciones de control: genera eventos de teclado y ratón (tag `keyboard-mouse`) para interactuar con el entorno.
- Razonamiento multi-paso orientado a objetivos dentro de un juego, como agente encarnado (tag `embodied-agent`).
- Conversación multi-turno (tag `conversational`), manteniendo historial de observaciones y acciones.
- Capacidades heredadas del modelo base Qwen3.5-9B en generación de texto y comprensión de imágenes; el alcance exacto no está detallado en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking, audio u otras modalidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de pruebas de regresión en videojuegos: el modelo puede pilotar un personaje siguiendo un guion de prueba, detectando visualmente estados de UI y enviando las pulsaciones necesarias para validar flujos de menús, misiones o combate sin intervención manual.
- Investigación en agentes encarnados: sirve como política base para experimentos de aprendizaje por imitación o refuerzo en entornos 3D, al estar entrenado específicamente sobre pares observación-acción de juegos comerciales.
- Generación de datos sintéticos de gameplay: ejecutando el agente en un entorno controlado se pueden grabar trayectorias etiquetadas para entrenar modelos más pequeños o para análisis de comportamiento.
- Asistencia a jugadores noveles: integrado en una herramienta de escritorio que capture la pantalla, el modelo puede sugerir la siguiente acción o explicar en inglés qué está ocurriendo en el juego.
- Evaluación de accesibilidad de interfaces de juego: el agente puede recorrer menús y reportar pasos donde la navegación visual resulta ambigua, útil para equipos de UX.
- Benchmarking de agentes embodied: al formar parte de una familia escalonada (0.8B a 27B), permite estudiar cómo escala el rendimiento con el tamaño en tareas de control de videojuegos.
- Prototipado de bots para entornos simulados: en motores como Unity o Unreal con captura de pantalla y emulación de input, el modelo puede actuar como controlador de alto nivel en pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 10-11 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA H100, H200, L40S o A100 para FP8 nativo; RTX 4090 y RTX 6000 Ada soportan FP8 por software/hardware parcial.
- GPU de consumo: cabe en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con contextos cortos; en GPUs de 12 GB requeriría cuantización adicional a 4 bits no publicada.
- Opciones de despliegue: transformers con compressed-tensors; vLLM y TGI para servir en producción si soportan el checkpoint FP8; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-9B-S3-FP8 | 9,41B | no disponible | image-text-to-text (juego) | Apache 2.0 | Hugging Face (FP8) |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | image-text-to-text | no disponible en esta ficha | Hugging Face |
| GameScaling-9B-S3 (BF16) | ~9B | no disponible | image-text-to-text (juego) | Apache 2.0 | Hugging Face (THUSI-Lab) |
| GameScaling-27B-S3 | ~27B | no disponible | image-text-to-text (juego) | Apache 2.0 | Hugging Face (THUSI-Lab) |

La comparación con modelos de propósito general de tamaño similar (p. ej. Llama 3.1 8B o Mistral 7B) no es directa, ya que GameScaling está especializado en control de agentes en videojuegos y no se han publicado métricas que permitan contrastar su rendimiento en tareas estándar.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está optimizado para control de videojuegos; su rendimiento en tareas generales de texto puede degradarse respecto al Qwen3.5-9B original.
- Idioma: solo declara soporte de inglés, lo que limita su uso en productos en castellano sin trabajo adicional.
- Riesgo de alucinación: al emitir acciones de teclado/ratón, una predicción errónea puede provocar secuencias inválidas; requiere validación en el entorno real.
- Sin datos de benchmarks publicados: no es posible estimar su calidad frente a alternativas sin evaluación empírica propia.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que conviene verificar en su propia model card.
- Cuantización FP8: puede introducir una ligera pérdida de precisión frente al checkpoint BF16; no se documenta la magnitud de esa degradación.
- Sesgos: no documentados en la información disponible; al entrenarse sobre videojuegos comerciales, puede heredar sesgos de contenido y estilos de juego concretos.
- Longitud de contexto no especificada: dificulta planificar estrategias de memoria a largo plazo en partidas extensas.

## Enlaces

- Hugging Face: https://huggingface.co/CBA-Research/GameScaling-9B-S3-FP8
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Daily Paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante BF16 de referencia: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
