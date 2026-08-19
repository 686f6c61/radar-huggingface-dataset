# Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba Cloud, publicado bajo licencia Apache-2.0. Forma parte de la familia Qwen3-TTS, que cubre diez idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y ofrece control fino sobre el timbre, la emoción y la prosodia mediante instrucciones en lenguaje natural. Este checkpoint concreto, CustomVoice, está diseñado para aplicar control de estilo sobre nueve timbres premium predefinidos que abarcan distintas combinaciones de género, edad, idioma y dialecto.

El modelo emplea una arquitectura de LM discreto de múltiples codebooks que procesa representaciones acústicas comprimidas a 12 Hz, generadas por el tokenizador propio Qwen3-TTS-Tokenizer-12Hz. Esta arquitectura end-to-end evita los cuellos de botella de información y los errores en cascada típicos de los esquemas LM+DiT, logrando una latencia extremadamente baja: el primer paquete de audio se emite inmediatamente después de introducir un solo carácter, con una latencia de síntesis total de hasta 97 ms. El modelo soporta tanto generación streaming como no streaming, y destaca por su robustez frente a texto de entrada ruidoso, lo que lo hace adecuado para aplicaciones interactivas en tiempo real.

Con aproximadamente 1.920 millones de parámetros y un tamaño de repositorio de 4,5 GB, este modelo se sirve de forma eficiente mediante vLLM-Omni, exponiendo una API compatible con OpenAI /v1/audio/speech. Su popularidad (más de 2,1 millones de descargas y 1880 likes en HuggingFace) refleja el interés de la comunidad por soluciones de TTS de código abierto con control expresivo y baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto de multi-codebook (no-DiT) con tokenizador acustico a 12 Hz |
| Parametros totales | 1.916.676.352 (aprox. 1,92 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español e italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS-12Hz-1.7B-CustomVoice se basa en una arquitectura de lenguaje autoregresivo que opera sobre codebooks discretos de audio. El tokenizador Qwen3-TTS-Tokenizer-12Hz comprime la señal de voz en secuencias de tokens a una frecuencia de 12 Hz, preservando información paralingüística y características del entorno acústico. Esta representación compacta alimenta un modelo de lenguaje de múltiples codebooks que genera las secuencias de tokens de audio de forma end-to-end, sin necesidad de un módulo separado de difusión (DiT), lo que reduce la latencia y mejora la eficiencia.

El entrenamiento combina datos de voz y texto en los diez idiomas soportados, aunque no se han publicado detalles específicos sobre el volumen de datos, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO. La innovación principal reside en el esquema de generación streaming de doble vía (Dual-Track), que permite alternar entre modo streaming y no streaming con un único modelo. Además, el modelo integra comprensión semántica del texto para adaptar automáticamente el tono, el ritmo y la expresión emocional según el contenido, lo que se describe como "lo que imaginas es lo que escuchas".

## Capacidades

- Sintesis de voz expresiva en diez idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español e italiano.
- Control por instrucciones en lenguaje natural sobre atributos acusticos como timbre, emocion y prosodia.
- Nueve timbres premium predefinidos que cubren combinaciones de genero, edad, idioma y dialecto.
- Generacion streaming con latencia de primer paquete inferior a 100 ms (hasta 97 ms de latencia total).
- Generacion no streaming para escenarios que requieren audio completo de una sola vez.
- Robustez frente a texto de entrada ruidoso o mal formateado.
- Integracion con vLLM-Omni para servir el modelo mediante API compatible con OpenAI /v1/audio/speech.
- Soporte de despliegue en Amazon SageMaker (region us) segun los tags del repositorio.

## Casos de uso

- Atencion al cliente multilingue automatizada: el modelo puede generar respuestas de voz en tiempo real en diez idiomas, con control de emocion y tono para adaptarse al estado del usuario. Su baja latencia permite conversaciones interactivas sin cortes perceptibles, ideal para IVR o asistentes virtuales telefonicos.
- Locucion de contenido audiovisual: creadores de video, podcasts o audiolibros pueden generar narraciones con distintos timbres y estilos emocionales usando las nueve voces premium, sin necesidad de contratar actores de doblaje para cada proyecto.
- Asistentes de voz para dispositivos IoT: la capacidad streaming y la latencia de 97 ms hacen posible integrar el modelo en altavoces inteligentes o asistentes embebidos que requieren respuesta inmediata a comandos de voz.
- Generacion de materiales educativos: plataformas de e-learning pueden producir lecciones de audio en multiples idiomas con variaciones de entonacion para mantener la atencion del estudiante, usando instrucciones para enfatizar conceptos clave.
- Doblaje automatico de videojuegos: los desarrolladores pueden generar dialogos para personajes con diferentes perfiles de voz (edad, genero, dialecto) a partir de guiones de texto, acelerando el proceso de localizacion.
- Pruebas de accesibilidad y UX: equipos de producto pueden generar rapidamente variantes de voz para evaluar la legibilidad y la naturalidad de interfaces de voz en diferentes idiomas antes de lanzar al mercado.
- Creacion de contenido para redes sociales: generacion de voces para videos cortos, memes de audio o respuestas automatizadas en plataformas como TikTok o YouTube, con control de estilo para ajustarse a la tendencia del momento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la latencia de 97 ms y la capacidad de streaming, pero no proporciona metricas comparativas como MOS (Mean Opinion Score), WER (Word Error Rate) o resultados en conjuntos de datos estandar de TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,92 B de parametros en precision fp16, los pesos ocupan aproximadamente 3,8 GB. Se estima que la inferencia requiere entre 6 y 10 GB de VRAM dependiendo del tamano de lote y de la longitud de la secuencia de audio generada. No se dispone de datos oficiales.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060/3070/4060, o GPUs de datacenter como A10G, L4 o A100. Para despliegues de alta concurrencia se recomienda A100 o H100.
- Compatibilidad con GPU de consumo: si, modelos como RTX 3090 o RTX 4090 (24 GB) pueden ejecutar el modelo con margen para multiples peticiones simultaneas.
- Opciones de despliegue: vLLM-Omni (recomendado, expone API OpenAI), qwen-tts package oficial, o despliegue manual con safetensors. Tambien es posible usar Amazon SageMaker.
- Latencia y throughput: la latencia de primer paquete es de 97 ms en modo streaming; el throughput depende del hardware y de la longitud del texto, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos oficiales con otros modelos de TTS. Como referencia cualitativa, se pueden considerar alternativas de codigo abierto como XTTS-v2 (Coqui, ~1.9B parametros, clonacion de voz, sin control por instrucciones), Bark (Suno, ~6B parametros, generacion de audio con efectos, mayor latencia) y CosyVoice (Alibaba, similar en idiomas y clonacion de voz). Qwen3-TTS-12Hz-1.7B-CustomVoice se diferencia por su latencia extremadamente baja, su control fino por instrucciones y su licencia permisiva Apache-2.0, frente a licencias mas restrictivas en otras opciones. No obstante, faltan benchmarks estandarizados para una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- La informacion sobre sesgos y alucinaciones no esta disponible en la documentacion publica. Como todo modelo generativo, puede producir salidas inesperadas o incorrectas en contextos ambiguos.
- El control por instrucciones depende de la calidad de la descripcion en lenguaje natural; instrucciones vagas pueden dar lugar a resultados poco precisos.
- Aunque soporta diez idiomas, el rendimiento puede variar entre ellos; no se han publicado metricas de calidad por idioma.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia del tokenizador asociado (Qwen3-TTS-Tokenizer-12Hz) por si tuviera restricciones adicionales.
- El modelo no realiza clonacion de voz; para ello existe la variante Qwen3-TTS-12Hz-1.7B-Base. CustomVoice solo ofrece los nueve timbres predefinidos.
- La latencia de 97 ms se refiere a condiciones optimas; en entornos con alta carga o hardware limitado, la latencia real puede ser mayor.
- No se garantiza la estabilidad del modelo en produccion sin pruebas exhaustivas con el caso de uso concreto.

## Enlaces

- HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
- Coleccion Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Receta vLLM: https://recipes.vllm.ai/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Paper (arXiv): https://arxiv.org/abs/2601.15621 (referenciado en los tags de HuggingFace)
