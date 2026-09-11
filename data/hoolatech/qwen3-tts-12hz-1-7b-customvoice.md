# hoolatech/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de síntesis de voz (text-to-speech) de la familia Qwen3-TTS, publicado en HuggingFace bajo la cuenta hoolatech. Se trata de la variante CustomVoice, orientada a ofrecer control de estilo sobre timbres objetivo mediante instrucciones en lenguaje natural, con 9 timbres premium que cubren combinaciones de género, edad, idioma y dialecto. El repositorio contiene 1.916.676.352 parámetros (aproximadamente 1,91 mil millones) en formato safetensors y ocupa 4,5 GB.

El modelo se apoya en una arquitectura de LM discreto con múltiples codebooks y en el tokenizador propio Qwen3-TTS-Tokenizer-12Hz, que comprime la señal de voz a 12 Hz preservando información paralingüística y características del entorno acústico. Según la model card, el esquema end-to-end evita los cuellos de botella de información y los errores en cascada de las arquitecturas tradicionales LM+DiT, y la arquitectura de streaming híbrida de doble pista (Dual-Track) permite generar tanto en modo streaming como no streaming, con una latencia de síntesis extremo a extremo declarada de hasta 97 ms.

Es relevante para desarrolladores que necesiten voces sintéticas controlables por instrucción en diez idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) con licencia Apache 2.0, lo que facilita su integración en productos comerciales. Conviene señalar que el repositorio analizado es una publicación de terceros (hoolatech) con 0 descargas y 0 likes, y que su model card reproduce el contenido genérico de la familia Qwen3-TTS, no una ficha específica del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto con múltiples codebooks (discrete multi-codebook LM) y generación en streaming híbrida de doble pista (Dual-Track); decodificador ligero no DiT; tokenizador acústico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 (aprox. 1,91 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara pesos safetensors) |
| Idiomas soportados | 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano; perfiles de voz dialectales adicionales |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 4,5 GB) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de modelo de lenguaje discreto con múltiples codebooks que modela la voz de extremo a extremo: el texto y los códigos acústicos se tratan en un único modelo autorregresivo, en lugar del esquema habitual de LM de texto seguido de un decodificador DiT. El componente acústico es el tokenizador Qwen3-TTS-Tokenizer-12Hz, que codifica la entrada de voz en códigos y los decodifica de nuevo a voz con una frecuencia de trama de 12 Hz, conservando información paralingüística y del entorno acústico. La decodificación se realiza mediante una arquitectura ligera no DiT, lo que según el autor permite reconstrucción de voz rápida y de alta fidelidad.

El modelo soporta generación tanto en streaming como no streaming gracias a la arquitectura Dual-Track, y el autor afirma que puede emitir el primer paquete de audio inmediatamente después de introducir un solo carácter, con latencia extremo a extremo de hasta 97 ms. También se declara comprensión contextual fuerte, con control adaptativo de tono, velocidad de habla y expresión emocional a partir de instrucciones y de la semántica del texto, además de una robustez mejorada frente a texto de entrada ruidoso. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Control de estilo mediante instrucciones en lenguaje natural: permite ajustar timbre, emoción y prosodia.
- 9 timbres premium que cubren combinaciones de género, edad, idioma y dialecto.
- Control adaptativo de tono, ritmo y expresión emocional a partir de la semántica del texto.
- Generación en streaming y no streaming con el mismo modelo; latencia declarada de hasta 97 ms al primer paquete de audio.
- Robustez frente a texto de entrada ruidoso o mal formateado.
- Preservación de información paralingüística y de características del entorno acústico en la reconstrucción.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo especializado en voz.
- No se documentan capacidades de visión, audio de entrada (salvo el propio pipeline de voz) ni modo de razonamiento explícito.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas habladas en tiempo real gracias al modo streaming y a la latencia declarada de 97 ms, adecuada para agentes de voz conversacionales que necesitan interrumpir y responder sin silencios perceptibles.
- Audiolibros y narración sintética: con control de prosodia, tono y emoción por instrucción, se pueden asignar estilos distintos a personajes o capítulos sin reentrenar el modelo.
- Localización de vídeo y e-learning multilingüe: al cubrir diez idiomas, incluyendo español, se puede producir una misma pieza formativa en varios idiomas manteniendo el timbre consistente.
- Asistentes de voz para dispositivos y aplicaciones móviles: al ser un modelo de 1,91 mil millones de parámetros, el peso en memoria es moderado y puede desplegarse en servidores con GPU de gama media para dar servicio a múltiples sesiones.
- Sistemas de accesibilidad: lectura en voz alta de contenido web o de documentos para personas con discapacidad visual, con control de velocidad mediante instrucciones.
- Doblaje y publicidad: selección entre los 9 timbres premium para ajustar género, edad, idioma y dialecto al público objetivo de cada campaña.
- Generación de avisos y notificaciones dinámicas: integración en backends que conviertan plantillas de texto en audio en streaming para aplicaciones de mensajería o domótica.
- Prototipado de interfaces de voz: uso de la variante CustomVoice para validar el diseño sonoro de un producto antes de invertir en grabaciones con locutores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye la afirmación de latencia de extremo a extremo de hasta 97 ms para la generación en streaming, sin detallar el hardware ni las condiciones de medición, por lo que no se puede verificar ni comparar con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no confirmado por el autor): aproximadamente 4 GB en fp16/bf16, alrededor de 2 GB en int8 y alrededor de 1,2 GB en int4, más el consumo del tokenizador acústico y del búfer de audio.
- El repositorio ocupa 4,5 GB, coherente con pesos en precisión de 16 bits para 1,91 mil millones de parámetros.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es desplegable en GPU de gama media y alta (por ejemplo, RTX 4090, L40S, A100 o H100), pero el autor no publica una lista de hardware soportado.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 6-8 GB de VRAM, dado que los pesos en fp16 rondan los 4 GB. No confirmado por el autor.
- Opciones de despliegue: la model card menciona el paquete `qwen-tts` y vLLM, con descarga automática de pesos al cargar el modelo. No se documentan en la información disponible soportes para llama.cpp, Ollama, TGI u otros runtimes.
- Alternativa de descarga: ModelScope y `huggingface-cli` con el comando `--local-dir`, según los ejemplos incluidos en la model card.
- Latencia y throughput: solo se declara una latencia de extremo a extremo de hasta 97 ms al primer paquete de audio en modo streaming. No hay datos de throughput ni de número de sesiones concurrentes.

## Comparativa con modelos similares

La propia model card de la familia Qwen3-TTS permite comparar con las variantes publicadas. Todas comparten licencia Apache 2.0 y soporte de los mismos diez idiomas.

| Modelo | Parametros | Streaming | Control por instruccion | Clonacion de voz | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice (este) | 1,91 B | Si | Si | No declarada | 9 timbres premium con control de estilo por instrucciones |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | no disponible | Si | Si | No declarada | Diseño de voz a partir de descripciones del usuario |
| Qwen3-TTS-12Hz-1.7B-Base | no disponible | Si | No | Si (clonacion con 3 s de audio) | Base para fine-tuning de otros modelos |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | no disponible | Si | Segun model card, no listado | No declarada | Version reducida con los mismos 9 timbres |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de otros autores (por ejemplo, modelos TTS comerciales o abiertos de tamaño similar), por lo que esa comparación queda como no disponible.

## Limitaciones y advertencias

- El repositorio analizado pertenece a la cuenta hoolatech, no a Qwen, y presenta 0 descargas y 0 likes en el momento de redactar esta ficha; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- La model card del repositorio reproduce el texto genérico de la familia Qwen3-TTS y no documenta particularidades del artefacto publicado, como el dataset de entrenamiento o los hiperparámetros.
- No se han publicado resultados de benchmarks objetivos (naturalidad, similitud de hablante, WER de reconocimiento sobre el audio generado), por lo que no es posible cuantificar la calidad frente a alternativas.
- Riesgo de alucinación en el sentido de audio mal pronunciado, prosodia inadecuada o artefactos acústicos en textos largos, idiomas poco representados o entradas ruidosas; el autor solo afirma una mejora de robustez, sin métricas.
- Sesgos potenciales derivados de los datos de entrenamiento en cuanto a acentos, géneros y variedades dialectales; no se documenta ningún análisis de sesgo.
- La información sobre longitud de contexto, cuantizaciones soportadas y consumo de recursos no está disponible, lo que dificulta el dimensionado de infraestructura.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de una ficha específica del artefacto obliga a revisar los términos de la cuenta que lo publica y la procedencia de los pesos.
- Para producción en tiempo real, la latencia de 97 ms citada no especifica hardware ni carga concurrente, por lo que debe validarse en el entorno objetivo antes de asumirla.

## Enlaces

- HuggingFace: https://huggingface.co/hoolatech/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Paper citado en los tags del repositorio: arXiv:2601.15621 (https://arxiv.org/abs/2601.15621)
- Imagen de introducción de la familia Qwen3-TTS: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/qwen3_tts_introduction.png
- Diagrama de arquitectura de la familia Qwen3-TTS: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/overview.png
- Modelos relacionados citados en la model card: Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign, Qwen/Qwen3-TTS-12Hz-1.7B-Base, Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice, Qwen/Qwen3-TTS-12Hz-0.6B-Base y Qwen/Qwen3-TTS-Tokenizer-12Hz (descargables vía ModelScope o huggingface-cli)
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo.
