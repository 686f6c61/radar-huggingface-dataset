# AIArchiveInfo/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de sintesis de voz (text-to-speech, TTS) desarrollado por el equipo Qwen (Alibaba). Esta ficha concreta corresponde a la copia espejo publicada por AIArchiveInfo en HuggingFace, que preserva byte a byte los pesos originales de `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` en la revision `0c0e3051f131`. No se ha entrenado, ajustado ni modificado ningun peso: es una copia de archivo que mantiene la licencia Apache 2.0 original.

El modelo resuelve la generacion de habla natural a partir de texto con control de estilo mediante instrucciones en lenguaje natural. La variante CustomVoice ofrece control de estilo sobre timbres objetivo y soporta 9 timbres "premium" que cubren combinaciones de genero, edad, idioma y dialecto. Cubre 10 idiomas (chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano) ademas de perfiles de voz dialectales.

Tecnicamente se apoya en una arquitectura de LM discreta con multiples codebooks (multi-codebook LM) de extremo a extremo, junto con el tokenizador propio `Qwen3-TTS-Tokenizer-12Hz`. Incorpora una arquitectura de generacion en streaming hibrida de doble pista (Dual-Track) que permite emitir el primer paquete de audio en cuanto se introduce un caracter, con una latencia de sintesis de extremo a extremo de hasta 97 ms. El modelo tiene 1.916.676.352 parametros totales (aproximadamente 1,9 mil millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreta con multiples codebooks (multi-codebook LM), extremo a extremo, no-DiT; tokenizador acustico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.916.676.352 (aprox. 1,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol, italiano (10 idiomas), mas perfiles de voz dialectales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS emplea una arquitectura de modelo de lenguaje discreta con multiples codebooks que realiza un modelado de habla de extremo a extremo con informacion completa. Segun la model card, este diseno evita los cuellos de botella de informacion y los errores en cascada tipicos de los esquemas tradicionales LM+DiT, mejorando la versatilidad, la eficiencia de generacion y el techo de rendimiento. El sistema se apoya en el tokenizador `Qwen3-TTS-Tokenizer-12Hz`, que codifica la senal de voz en codigos y los decodifica de nuevo a audio, preservando informacion paralinguistica y caracteristicas del entorno acustico mediante una arquitectura ligera no-DiT.

La generacion utiliza una arquitectura de streaming hibrida de doble pista (Dual-Track) que permite que un unico modelo soporte tanto generacion en streaming como no streaming. El modelo puede emitir el primer paquete de audio inmediatamente despues de que se introduzca un solo caracter, con una latencia de sintesis de extremo a extremo de hasta 97 ms. La variante CustomVoice anade control de estilo sobre timbres objetivo mediante instrucciones del usuario. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Esta copia en concreto no ha sido entrenada ni modificada; es una preservacion byte a byte del modelo original.

## Capacidades

- Sintesis de voz (text-to-speech) de extremo a extremo en 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Control de estilo sobre timbres objetivo mediante instrucciones en lenguaje natural (instruction control).
- 9 timbres "premium" que cubren combinaciones de genero, edad, idioma y dialecto.
- Control multidimensional de atributos acusticos: timbre, emocion y prosodia.
- Ajuste adaptativo de tono, ritmo y expresion emocional en funcion de las instrucciones y la semantica del texto.
- Generacion en streaming y no streaming con el mismo modelo (arquitectura Dual-Track).
- Baja latencia en escenarios interactivos: primer paquete de audio tras un unico caracter de entrada; latencia de extremo a extremo de hasta 97 ms.
- Mayor robustez frente a texto de entrada ruidoso.
- Comprension contextual fuerte para modular la salida segun el texto.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni razonamiento multi-paso.

## Casos de uso

- Atencion al cliente automatizada con voz: el modelo puede generar respuestas habladas en tiempo real en varios idiomas, y su latencia de hasta 97 ms con streaming lo hace apto para conversaciones interactivas fluidas donde la respuesta de audio debe empezar casi de inmediato.
- Asistentes de voz embebidos y dispositivos de interaccion: gracias a la generacion en streaming (primer paquete de audio tras un solo caracter) puede integrarse en interfaces conversacionales que requieren retroalimentacion inmediata al usuario.
- Audiolibros y narracion multilingue: permite generar narraciones con control de emocion y prosodia segun el contenido, en cualquiera de los 10 idiomas soportados, manteniendo coherencia de estilo mediante instrucciones.
- Locucion y doblaje de contenido: la variante CustomVoice permite seleccionar entre 9 timbres que cubren genero, edad, idioma y dialecto, util para producir versiones de un mismo contenido con voces distintas y control de estilo.
- Sistemas de accesibilidad (lectura de texto a voz): conversion de texto a habla natural para lectores de pantalla y asistencia a personas con discapacidad visual, con control de ritmo y tono.
- Videojuegos y personajes virtuales: asignacion de timbres y estilos concretos a personajes, con capacidad de generar dialogos de forma dinamica en varios idiomas y con carga emocional variable.
- Interfaces de voz en aplicaciones moviles o web: integracion del modelo para responder al usuario con voz sintetizada de alta fidelidad, aprovechando la reconstruccion de voz de alta velocidad del tokenizador.
- Generacion de contenido educativo o de marketing: produccion de locuciones personalizadas con instrucciones de estilo (tono, velocidad, emocion) para adaptar el mensaje al publico objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,5 GB, lo que es coherente con pesos en precision de 16 bits (bf16/fp16) para 1,9 mil millones de parametros. La VRAM necesaria sera del orden de la decena de GB contando pesos y estados de ejecucion; se trata de una estimacion, no de un dato confirmado en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo es susceptible de ejecutarse en GPU de gama alta de consumo, aunque no se confirma este extremo.
- Compatibilidad con GPU de consumo: probablemente si en tarjetas con suficiente VRAM, pero no confirmado en la informacion disponible.
- Opciones de despliegue: la model card menciona el paquete `qwen-tts` y `vLLM` para la carga del modelo. Se indica que, al cargar en `qwen-tts` o vLLM, los pesos se descargan automaticamente segun el nombre del modelo. Tambien se documentan comandos de descarga manual via ModelScope y HuggingFace CLI. Requiere ademas el tokenizador `Qwen3-TTS-Tokenizer-12Hz`.
- Latencia y throughput: se reporta una latencia de sintesis de extremo a extremo de hasta 97 ms, con salida del primer paquete de audio inmediatamente tras un caracter de entrada. No se dispone de datos de throughput.

## Comparativa con modelos similares

Comparativa con las variantes de la misma familia Qwen3-TTS documentadas en la model card:

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Timbres / clonacion |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,9 mil millones | 10 idiomas | Si | Si | 9 timbres premium con control de estilo |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,9 mil millones | 10 idiomas | Si | Si | Diseno de voz a partir de descripciones del usuario |
| Qwen3-TTS-12Hz-1.7B-Base | 1,9 mil millones | 10 idiomas | Si | No indicado | Clonacion rapida de voz a partir de audio (3 segundos); apto para fine-tuning |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 0,6 mil millones | 10 idiomas | Si | No indicado en la tabla | 9 timbres premium |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6 mil millones | 10 idiomas | Si | No indicado | Clonacion rapida de voz (3 segundos); apto para fine-tuning |

Todas las variantes comparten licencia Apache 2.0 y el tokenizador `Qwen3-TTS-Tokenizer-12Hz`. No se dispone de datos de rendimiento comparado entre ellas en la informacion proporcionada. No se dispone de informacion sobre modelos de otras familias para una comparativa externa.

## Limitaciones y advertencias

- Esta ficha corresponde a una copia espejo de archivo (`AIArchiveInfo`), no al repositorio oficial. Aunque se indica que la preservacion es byte a byte y que la licencia original continua vigente, para uso en produccion conviene referenciar el repositorio original de Qwen.
- No se han publicado datos de sesgos en la informacion disponible; como modelo TTS multilingue puede heredar sesgos de los datos de entrenamiento en cuanto a acentos, genero o representacion dialectal.
- Riesgo de alucinacion: no se documenta en la informacion disponible. En modelos TTS el riesgo equivalente es la generacion de prosodia o pronunciacion incorrecta, especialmente en texto ruidoso o en idiomas menos representados.
- Limitaciones de idioma: se declaran 10 idiomas; no se especifica el nivel de calidad por idioma ni la cobertura dialectal exacta mas alla de perfiles de voz dialectales.
- No se documenta la longitud de contexto soportada, lo que limita la planificacion de entradas de texto largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y copyright.
- No se dispone de informacion sobre cuantizacion, por lo que las opciones de despliegue en hardware limitado no estan confirmadas.
- En entornos de produccion conviene verificar la integridad de los pesos frente al repositorio original, dado que se trata de un archivo de terceros.

## Enlaces

- HuggingFace (copia espejo): https://huggingface.co/AIArchiveInfo/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Repositorio original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Revision original preservada: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice/tree/0c0e3051f131929182e2c023b9537f8b1c68adfe
- Paper referenciado (tag arxiv): arxiv:2601.15621 (no se dispone de URL verificada en la informacion proporcionada)
- Imagen de introduccion Qwen3-TTS: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/qwen3_tts_introduction.png
- Diagrama de arquitectura Qwen3-TTS: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3-TTS-Repo/overview.png
- Tokenizador asociado: Qwen3-TTS-Tokenizer-12Hz (no se dispone de URL directa en la informacion proporcionada)
