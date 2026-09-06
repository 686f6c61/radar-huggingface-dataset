# jack1-12/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de síntesis de voz (text-to-speech) desarrollado por Qwen, publicado aquí en una copia del repositorio de HuggingFace bajo el usuario jack1-12. Se trata de la variante CustomVoice de la familia Qwen3-TTS, que permite controlar el estilo de la voz mediante instrucciones en lenguaje natural sobre nueve timbres premium predefinidos que cubren combinaciones de género, edad, idioma y dialecto.

El modelo cubre diez idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y utiliza una arquitectura end-to-end basada en un LM discreto multi-codebook, apoyado en el tokenizer propio Qwen3-TTS-Tokenizer-12Hz. Destaca por su soporte de generación en streaming con latencia mínima (97 ms) y por su capacidad de adaptar tono, ritmo y emoción según el texto y las instrucciones recibidas. Con 1,9 mil millones de parámetros (1.916.676.352), ofrece un equilibrio entre calidad de voz y coste de inferencia en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador con LM discreto multi-codebook (end-to-end, sin pipeline LM+DiT) |
| Parametros totales | 1.916.676.352 (1,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje de texto; no aplica ventana de contexto) |
| Tipos de cuantizacion | No disponibles (pesos en precisión completa en safetensors) |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura end-to-end de LM discreto multi-codebook que modela directamente la señal de voz, evitando los cuellos de botella y errores en cascada de los esquemas tradicionales LM + DiT. El tokenizer Qwen3-TTS-Tokenizer-12Hz realiza una compresión acústica eficiente y modelado semántico de alta dimensionalidad, preservando información paralingüística y características del entorno acústico. La reconstrucción de audio se realiza mediante una arquitectura ligera no DiT.

Incluye una arquitectura de streaming híbrida de doble pista que permite generar en modo streaming y no streaming con el mismo modelo. La latencia de síntesis end-to-end es de hasta 97 ms, y puede emitir el primer paquete de audio tras la entrada de un solo carácter. El entrenamiento se centra en la comprensión semántica del texto y el control de atributos acústicos multidimensionales mediante instrucciones en lenguaje natural. No se han proporcionado detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO.

## Capacidades

- Síntesis de voz de alta calidad en 10 idiomas, incluyendo español, con voces naturales.
- Control de estilo mediante instrucciones en lenguaje natural: permite modificar timbre, emoción, tono, ritmo y prosodia.
- Nueve timbres premium que combinan género, edad, idioma y dialecto, adaptables a distintos contextos.
- Generación en streaming de baja latencia (97 ms) y modo no streaming con la misma arquitectura.
- Comprensión del contexto semántico del texto para ajustar dinámicamente la expresión vocal.
- Robustez mejorada ante texto de entrada ruidoso o mal formateado.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo puro de síntesis de voz.

## Casos de uso

- Asistentes de voz en tiempo real: la generación en streaming con 97 ms de latencia permite respuestas casi inmediatas en agentes conversacionales, manteniendo una interacción natural.
- Narración de audiobooks multilingües: el control de tono, ritmo y emoción permite adaptar la interpretación a cada pasaje, con nueve timbres para diferenciar personajes o narradores.
- Doblaje de contenido audiovisual: los nueve perfiles de voz y el control por instrucciones facilitan la asignación de voces a personajes en producciones en español, inglés, alemán, francés, etc.
- Sistemas IVR de banca o telecomunicaciones: el modelo puede generar mensajes de voz corporativos con un timbre consistente y variaciones de estilo según el tipo de operación.
- Creación de contenido para redes sociales y marketing: permite producir locuciones con estilos emocionales concretos (entusiasta, serio, cálido) sin necesidad de grabar a un locutor.
- Accesibilidad y lectura de pantalla: la síntesis de voz natural y multilingüe puede integrarse en lectores de pantalla y aplicaciones de apoyo a personas con discapacidad visual, con control de velocidad y tono.
- Localización de cursos e-learning: el modelo genera narraciones coherentes en múltiples idiomas, adaptando la entonación al contenido didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica una latencia de síntesis end-to-end de 97 ms, pero no se aportan métricas comparativas como MOS, WER o resultados frente a otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Para una estimación orientativa, un modelo de 1,9 B parámetros en FP16 ocupa aproximadamente 3,8 GB solo en pesos, por lo que se necesitará una GPU con al menos 8 GB de VRAM considerando overhead del framework.
- GPU recomendadas: no especificadas por el autor. Una RTX 4090 (24 GB) ofrece margen de sobra para este tamaño; una RTX 3060 (12 GB) también sería viable.
- El despliegue puede realizarse mediante el paquete `qwen-tts` o con vLLM, tal como indica la model card. No se mencionan integraciones con llama.cpp u Ollama, que están orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles, más allá de los 97 ms de latencia end-to-end declarados para streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Streaming | Control por instrucciones | Clonacion de voz | Idiomas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,9 B | Si | Si | No | 10 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,9 B | Si | Si (diseño de voz por descripción) | No | 10 |
| Qwen3-TTS-12Hz-1.7B-Base | 1,9 B | Si | No | Si (3 segundos) | 10 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 0,6 B | Si | No | No | 10 |

El CustomVoice de 1,7 B se diferencia del VoiceDesign en que no diseña voces nuevas a partir de descripciones, sino que aplica control de estilo sobre nueve timbres preexistentes. La variante Base está pensada para clonación de voz y fine-tuning, mientras que el CustomVoice de 0,6 B ofrece una alternativa más ligera sin control por instrucciones.

## Limitaciones y advertencias

- El repositorio analizado es una copia subida por el usuario jack1-12, no el repositorio oficial de Qwen. Se recomienda verificar la integridad de los pesos y, en producción, descargar desde las cuentas oficiales de Qwen en HuggingFace o ModelScope.
- No soporta clonación de voz: para clonar una voz a partir de un audio de 3 segundos se necesita el modelo Qwen3-TTS-12Hz-1.7B-Base.
- El control de estilo mediante instrucciones puede interpretar incorrectamente las órdenes y producir una prosodia no deseada, especialmente con textos ambiguos o mal escritos.
- No se han documentado sesgos específicos del modelo, pero al tratarse de un sistema de voz, puede presentar sesgos en la percepción de acentos o características vocales de ciertos grupos.
- El uso comercial es posible gracias a la licencia Apache 2.0, pero debe cumplirse la atribución y los términos de la licencia.
- Depende del tokenizer externo Qwen3-TTS-Tokenizer-12Hz, que debe descargarse por separado, lo que añade un requisito de despliegue.
- Solo cubre los diez idiomas listados; otros idiomas o dialectos fuera de este conjunto pueden no funcionar correctamente.

## Enlaces

- Repositorio analizado: https://huggingface.co/jack1-12/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio oficial de Qwen en HuggingFace (inferido): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- GitHub del proyecto Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Paper técnico (según la model card): https://arxiv.org/abs/2601.15621
