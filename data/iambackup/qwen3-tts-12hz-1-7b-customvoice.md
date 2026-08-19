# Iambackup/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de síntesis de voz (text-to-speech) desarrollado por Alibaba Qwen y publicado en HuggingFace por el usuario Iambackup. Se trata de una variante del modelo Qwen3-TTS orientada al control fino del timbre mediante instrucciones en lenguaje natural, con soporte para nueve timbres premium que combinan género, edad, idioma y dialecto. El modelo emplea una arquitectura de LM discreto multi-codebook con un tokenizador acústico propio (Qwen3-TTS-Tokenizer-12Hz) que comprime la señal de voz a 12 Hz, lo que permite una reconstrucción de alta fidelidad con una latencia extremadamente baja.

El modelo tiene aproximadamente 1.900 millones de parámetros y cubre diez idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano). Su relevancia actual radica en su capacidad de generación en streaming con una latencia de extremo a extremo de hasta 97 ms, su robustez frente a texto ruidoso y su control expresivo basado en instrucciones, lo que lo posiciona como una opción competitiva para aplicaciones interactivas en tiempo real. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook con tokenizador acustico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 (~1,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de TTS, no LLM) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de LM autoregresivo con multiples codebooks discretos que modelan directamente la senal de voz tokenizada a 12 Hz. El tokenizador Qwen3-TTS-Tokenizer-12Hz comprime la senal acustica en representaciones discretas de alta dimension que preservan informacion paralinguistica y del entorno acustico, permitiendo una reconstruccion de alta fidelidad mediante un decodificador ligero no basado en DiT. Esta arquitectura unificada de extremo a extremo evita los cuellos de botella de informacion y los errores en cascada tipicos de los esquemas LM+DiT tradicionales.

El modelo incorpora una arquitectura de generacion en streaming de doble via (Dual-Track), que permite tanto generacion en streaming como no streaming con un unico conjunto de pesos. El primer paquete de audio se emite inmediatamente despues de introducir un unico caracter, con una latencia de sintesis de extremo a extremo de 97 ms. No se han publicado detalles especificos sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO en la informacion disponible.

## Capacidades

- Sintesis de voz multilingue en 10 idiomas principales, con perfiles dialectales adicionales.
- Control fino del timbre mediante instrucciones en lenguaje natural, permitiendo ajustar tono, emocion y prosodia.
- Soporte de nueve timbres premium que cubren combinaciones de genero, edad, idioma y dialecto.
- Generacion en streaming con latencia de extremo a extremo de 97 ms, apta para interaccion en tiempo real.
- Robustez mejorada frente a texto de entrada ruidoso o mal formateado.
- Comprension semantica del texto para adaptar automaticamente el tono, el ritmo y la expresion emocional.
- Capacidad de clonacion de voz rapida (3 segundos) en la variante Base, aunque esta version CustomVoice se centra en timbres predefinidos.

## Casos de uso

- Asistentes de voz interactivos: el modelo puede generar respuestas habladas en tiempo real con latencia inferior a 100 ms, lo que lo hace adecuado para asistentes conversacionales en dispositivos moviles o altavoces inteligentes donde la demora perceptible degrada la experiencia.
- Audiolibros y narracion automatizada: su soporte multilingue y control de prosodia permite generar narraciones con entonacion natural y expresiva para contenido editorial, adaptando el ritmo al genero literario.
- Doblaje y localizacion de contenido audiovisual: los nueve timbres premium y el control por instrucciones facilitan la generacion de voces diferenciadas por personaje sin necesidad de locutores humanos, reduciendo costes de produccion.
- Accesibilidad para personas con discapacidad visual: puede integrarse en lectores de pantalla que requieran voces naturales y multilingues, con capacidad de ajustar velocidad y emocion segun el contexto.
- Sistemas de respuesta de voz interactiva (IVR) en atencion al cliente: su baja latencia y robustez ante texto ruidoso permiten desplegar menus de voz dinamicos y respuestas personalizadas en multiples idiomas.
- Generacion de contenido educativo: creacion de lecciones de audio, podcasts o material de aprendizaje en varios idiomas con control de tono y enfasis para mejorar la retencion del oyente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas como MOS (Mean Opinion Score), latencia medida o evaluaciones de inteligibilidad frente a otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,9 B de parametros, los pesos en fp16 ocupan aproximadamente 3,8 GB. Se recomienda al menos 6 GB de VRAM para inferencia comoda con batch pequeno.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores. Para despliegue en produccion con multiples peticiones concurrentes, se recomienda A10, A100 o H100.
- Si cabe en GPU consumer: si, en GPUs con 8 GB o mas de VRAM. Con cuantizacion a 8 bits (si estuviera disponible) podria ejecutarse en 4 GB, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: el paquete oficial `qwen-tts` y vLLM soportan la carga automatica de pesos. Tambien es posible usar el tokenizador y el modelo por separado para integraciones personalizadas.
- Latencia y throughput: la latencia de extremo a extremo declarada es de 97 ms en modo streaming. El throughput no se ha publicado, pero la arquitectura ligera no DiT sugiere un rendimiento superior a sistemas LM+DiT comparables.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,9 B | 10 | Si (97 ms) | Si | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 0,6 B | 10 | Si | No | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-Base | 1,9 B | 10 | Si | No (clonacion de voz) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,9 B | 10 | Si | Si (diseno de voz por descripcion) | Apache 2.0 |

No se dispone de datos comparativos con modelos TTS de otros fabricantes (como VITS, Tacotron o Whisper Speech) en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos de genero, edad o dialecto en los timbres premium; el rendimiento puede variar entre idiomas y acentos.
- Aunque el modelo es robusto ante texto ruidoso, puede producir errores de pronunciacion en nombres propios, terminos tecnicos o palabras fuera de vocabulario.
- La generacion en streaming con latencia de 97 ms se refiere al primer paquete de audio; la latencia total de la frase completa depende de la longitud del texto y del hardware.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es una publicacion de un tercero (Iambackup) y no una publicacion oficial de Alibaba; se recomienda verificar la procedencia de los pesos antes de usarlo en produccion.
- No se han publicado cuantizaciones oficiales; el despliegue en hardware con menos de 6 GB de VRAM puede requerir cuantizacion manual no soportada oficialmente.
- El numero de arxiv citado (2601.15621) corresponde a una fecha futura; el paper tecnico puede no estar disponible publicamente en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iambackup/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Modelo original de Qwen (referencia): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Tokenizador Qwen3-TTS-Tokenizer-12Hz: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Paper tecnico (referencia arxiv): arxiv:2601.15621
- Repositorio de Qwen3-TTS (ModelScope): https://modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
