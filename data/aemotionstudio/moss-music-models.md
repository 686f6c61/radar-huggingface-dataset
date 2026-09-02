# AEmotionStudio/moss-music-models

## Resumen

MOSS-Music 8B es un modelo de comprensión musical de código abierto desarrollado por el equipo OpenMOSS de la Universidad de Fudan, junto con MOSI.AI y el Instituto de Innovación de Shanghái. Se trata de un modelo de tipo *audio-text-to-text* que combina un codificador de audio estilo Whisper con el modelo de lenguaje Qwen3-8B, al que se le inyectan características adicionales mediante la técnica DeepStack. El resultado es un sistema capaz de interpretar y razonar sobre contenido musical en lenguaje natural.

El modelo resuelve el problema de la comprensión automática de música: genera descripciones textuales (captioning), transcribe letras con marcas temporales, identifica progresiones de acordes, analiza la estructura de una canción, determina clave y tempo, y responde preguntas musicales de forma libre. Su relevancia actual radica en que es uno de los pocos modelos musicales open source con licencia Apache-2.0, lo que permite su integración en herramientas de producción sin restricciones comerciales. El repositorio AEmotionStudio/moss-music-models es un espejo verificado del modelo original, empaquetado para el runtime offline del DAW MAESTRO, con los pesos idénticos al upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper + LLM Qwen3-8B con inyeccion de caracteristicas DeepStack |
| Parametros totales | 8 mil millones (indicado por el nombre del modelo, no confirmado en la documentacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (unico formato oficial publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards bf16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida: un codificador de audio basado en el diseño de Whisper extrae representaciones acústicas, que luego se proyectan y alimentan a un modelo de lenguaje Qwen3-8B. La inyección de características DeepStack permite integrar información temporal y estructural del audio en las capas del LLM, mejorando la coherencia en tareas que requieren razonamiento sobre secuencias largas, como el análisis estructural de canciones.

Según la documentación del repositorio original, MOSS-Music se construye sobre el mismo backbone de audio que MOSS-Audio, pero se especializa en música mediante un pre-entrenamiento continuo y un ajuste fino supervisado (SFT) con datos musicales. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo no utiliza técnicas de RLHF ni DPO según la información disponible.

## Capacidades

- Generacion de descripciones textuales de musica (captioning): produce resumenes semanticos de una pieza, incluyendo genero, instrumentacion, ambiente y caracteristicas sonoras.
- Transcripcion de letras con marcas temporales: convierte audio vocal en texto alineado con timestamps, util para karaoke o subtitulado.
- Analisis armonico: identifica progresiones de acordes a lo largo de la cancion.
- Analisis estructural: segmenta la pieza en secciones (intro, verso, estribillo, puente, etc.) y describe su organizacion.
- Estimacion de clave y tempo: determina la tonalidad y el tempo de la pieza.
- Preguntas y respuestas musicales de forma libre: responde consultas abiertas como "¿que instrumentos suenan en el segundo minuto?" o "¿cual es la dinamica predominante?".
- Soporte de tool calling: no se menciona en la informacion disponible.

## Casos de uso

- Catalogacion automatica de bibliotecas musicales: el modelo puede generar metadatos descriptivos (genero, instrumentos, estructura) para miles de pistas, facilitando la busqueda y organizacion en plataformas de streaming o archivos personales.
- Transcripcion de letras para subtitulado: gracias a las marcas temporales, se puede generar subtitulos sincronizados para videos musicales, conciertos o sesiones de estudio.
- Asistente de composicion: un compositor puede pedir al modelo que analice una maqueta y sugiera progresiones de acordes alternativas o detecte secciones repetitivas, agilizando el flujo creativo.
- Educacion musical interactiva: estudiantes pueden subir una grabacion y recibir un analisis detallado de armonia, estructura y tempo, convirtiendo el modelo en un tutor personalizado.
- Integracion en DAWs como MAESTRO: el espejo empaquetado permite usarlo offline dentro del DAW para etiquetar clips de audio, transcribir voces o generar informacion estructural durante la produccion.
- Analisis de derechos de autor: las discograficas pueden usar el modelo para identificar similitudes estructurales entre canciones, apoyando la deteccion de plagio o la gestion de derechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos con otros modelos en tareas como captioning musical, transcripcion o analisis armonico.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 16 GB (8B parametros x 2 bytes). La inferencia requiere al menos 16 GB de VRAM, aunque el overhead del codificador de audio y el procesamiento de secuencias largas puede elevar el requisito a 20-24 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB. Tarjetas con menos de 16 GB (como RTX 3080 10 GB) no son suficientes para ejecutar el modelo completo en bf16.
- Si cabe en GPU de consumo: si, en una RTX 4090 o RTX 4080 16 GB (aunque esta ultima quedaria justa).
- Opciones de despliegue: el repositorio original proporciona un paquete de inferencia en Python (github.com/OpenMOSS/MOSS-Music) que maneja el pipeline completo de audio a texto. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, probablemente porque el modelo requiere el codificador de audio y la logica de procesamiento especifica. El espejo MAESTRO esta pensado para ejecutarse dentro de ese DAW.
- Latencia y throughput: no se han publicado estimaciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de comprension musical (como MusicCaps, Qwen2-Audio u otros). La documentacion no incluye benchmarks ni evaluaciones comparativas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en datos musicales de origen no especificado, puede presentar sesgos hacia generos o estilos predominantes en el dataset, subrepresentando musicas no occidentales o generos minoritarios.
- Riesgo de alucinacion: como cualquier LLM, puede inventar detalles musicales (acordes, instrumentos) cuando el audio es ambiguo o de baja calidad. La transcripcion de letras puede contener errores en idiomas no entrenados.
- Limitaciones de contexto: no se ha publicado la longitud de contexto, pero al tratarse de un modelo de 8B, es probable que tenga un limite de tokens similar a Qwen3-8B (32k), aunque no esta confirmado.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que el modelo funcione mejor en ingles y chino, pero no hay garantia para otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, siempre que se mantenga el aviso de copyright y se indiquen los cambios. El mirror no anade restricciones adicionales.
- Caveat de produccion: el modelo no esta optimizado para baja latencia; en tareas de analisis de audio largo, el tiempo de inferencia puede ser considerable. Ademas, la dependencia del codificador de audio y el procesamiento especifico requiere integrar el codigo del repositorio original, no es un modelo que se cargue directamente con transformers estandar.

## Enlaces

- Repositorio HuggingFace del mirror: https://huggingface.co/AEmotionStudio/moss-music-models
- Modelo original en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-Music-8B-Instruct
- Repositorio GitHub del proyecto: https://github.com/OpenMOSS/MOSS-Music
- Documentacion adicional en GitHub: https://github.com/OpenMOSS/MOSS-Music/blob/main/README.md
