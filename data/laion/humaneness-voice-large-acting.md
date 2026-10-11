# laion/Humaneness-Voice-Large-Acting

## Resumen

Humaneness-Voice-Large-Acting es un modelo de sintesis de voz (text-to-speech) orientado a interpretacion actoral, desarrollado por LAION. Se trata de un ajuste fino de parametros completos, no un LoRA, partiendo de los pesos del modelo previo moss-tts-local-transformer-4.55b-voice-acting-v2-sft3. El resultado es un punto de control correspondiente al paso 432 tras tres epocas completas de entrenamiento sobre un split de retos actorales en ingles y aleman, acompanado de una continuacion experimental de dos epocas adicionales.

El problema que aborda es la generacion de habla expresiva y controlable: el modelo separa el texto hablado (campo Text) de las instrucciones de actuacion, duraciones y vocalizaciones (campo Instruction), y permite condicionar la identidad vocal mediante una referencia de audio de 12 segundos o mediante uno de 30 pseudonimos estables. La arquitectura es de estilo MOSS, con un modelo semantico y un Talker local, y aproximadamente 4,13 mil millones de parametros entrenables en esta ejecucion.

Es relevante ahora porque publica los pesos de inferencia finales y la implementacion de entrenamiento de un ajuste a escala (128 GPU GH200), dentro de un ecosistema de TTS expresivo con licencia permisiva CC BY 4.0. Se posiciona como una entrega de investigacion, no como un producto validado: la evaluacion formal de identidad voz-referencia frente a alias sigue en curso y la propia model card advierte de fallos de identidad, pronunciacion, timing y control emocional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo semantico de estilo MOSS mas Talker local (transformer); no es MoE |
| Parametros totales | Aproximadamente 4,13 mil millones entrenables en esta ejecucion (el modelo base se identifica como 4.55b) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; la generacion se controla por numero de frames de audio, p. ej. 65 frames en el ejemplo de la model card) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles (en) y aleman (de) |
| Licencia | CC BY 4.0 (pesos y materiales de publicacion; el codec y otros componentes upstream tienen sus propios terminos) |
| Formato de pesos | safetensors (guardados por Accelerate bajo el prefijo `base.`, con algunos cabezales LM atados omitidos) |

Otros datos: tamano del repositorio 33,1 GB; pipeline text-to-speech; tarea voice-acting; fecha de creacion y actualizacion 11 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura SFT-3 es un modelo semantico de estilo MOSS acompanado de un Talker local. El audio se representa mediante MOSS Audio Tokenizer v2, que produce 12 codigos RVQ por cada frame de audio de 80 ms. El codec es una dependencia upstream separada y no esta incluido en los pesos publicados. El modelo base declara 4.55b en su nombre, mientras que esta ejecucion entrena aproximadamente 4,13 mil millones de parametros.

El entrenamiento uso parametros completos sobre 128 GPU GH200 (32 nodos JUPITER), con batch global 256, AdamW, computo BF16 y parametros en FP32, calentamiento lineal del 3% y decaimiento coseno hasta el 10% del pico. Las tasas de aprendizaje maximas fueron 8e-6 para el backbone semantico y 2.4e-5 para el Talker y el puente. El dataset fijado a la revision `2f914a5081f6c0d6eb348b509ea50cf1d56aa7e3` contiene, tras excluir un clip anomalo con ASR vacio, 36.754 clips y 300,27 horas de audio unicas. Cada clip se presenta tres veces (110.262 presentaciones, 900,81 horas de presentacion) con tres vistas: GENERAL mas SCRIPT en linea, GENERAL mas SCRIPT plano, y SCRIPT en linea sin GENERAL. La mitad de las presentaciones incluyen una referencia de audio de 12 segundos del mismo hablante y la otra mitad usan uno de 30 pseudonimos estables; existe ademas un brazo de control-dropout balanceado del 10% que elimina caption y controles en linea preservando la transcripcion literal. Los estados completos de optimizador y RNG se guardaron localmente por epoca; el repositorio publico contiene los pesos de inferencia finales y la implementacion de entrenamiento, no los ficheros de optimizador.

Existe una continuacion experimental en `checkpoints/continuation-00000288/model.safetensors`, partiendo exactamente del paso 432, que anade dos pasadas completas de datos actorales Gemini (288 pasos de optimizador con batch global 256) con optimizador nuevo, calentamiento del 3% y decaimiento coseno, con los mismos picos de tasa de aprendizaje. Tiene contrato de ejecucion independiente y puntos de control de optimizador/RNG retenidos localmente, pero no es todavia la recomendacion por defecto.

## Capacidades

- Generacion de voz expresiva con control actoral mediante el campo Instruction (direcciones de actuacion, duraciones y vocalizaciones).
- Condicionamiento por referencia de audio: acepta una grabacion de referencia limpia de 5 a 15 segundos para clonacion de identidad vocal.
- Condicionamiento por pseudonimo: soporta 30 alias estables como superficie de control experimental de identidad.
- Sintesis bilingue en ingles y aleman.
- Control de duracion del audio generado mediante el parametro de numero de frames.
- Separacion explicita entre palabras habladas (Text) y direcciones de interpretacion (Instruction).
- Generacion local en GPU CUDA mediante el script `infer.py`.
- Disponibilidad de codigo de entrenamiento: lector de datos empaquetados, compilador de manifiestos y prompts, codigo de entrenamiento y plantilla Slurm en el directorio `training/`.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada general ni modo de razonamiento; no disponible.

## Casos de uso

- Doblaje y voice acting automatizado: el modelo esta entrenado especificamente sobre retos actorales en ingles y aleman, de modo que puede generar lineas interpretadas con direcciones emocionales y de timing en lugar de lectura neutra.
- Audiolibros y podcasts multilingues: con una referencia de voz de 5 a 15 segundos del locutor objetivo, se puede mantener una identidad vocal consistente a lo largo de fragmentos largos condicionados por referencia.
- Localizacion de contenido EN-DE: al soportar ambos idiomas y el condicionamiento por referencia, permite producir versiones alemanas preservando el timbre del hablante original, sujeto a la validacion pendiente de identidad.
- Prototipado de personajes en videojuegos: el uso de alias estables (30 pseudonimos) permite asignar voces distinguibles a personajes distintos durante fases de preproduccion sin necesidad de grabaciones reales.
- Investigacion en TTS emocional y controlable: la separacion entre Text e Instruction, junto con el brazo de control-dropout del 10%, permite estudiar el efecto de las direcciones de actuacion sobre la prosodia y la inteligibilidad.
- Generacion de datos sinteticos para aumentacion de datasets de voz: el modelo puede producir clips con diversidad de instrucciones actorales para alimentar pipelines de ASR o de clasificacion emocional, con la advertencia de revelar el origen sintetico.
- Accesibilidad y lectura expresiva: para convertir texto en voz con control de enfasis y emocion en aplicaciones de lectura asistida en ingles o aleman.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que existe una rejilla local de escucha A/B de 70 prompts, pero la describe como ayuda de escucha y no como benchmark de calidad controlado, y senala que la evaluacion formal de identidad referencia-frente-a-alias sigue en curso. Tampoco se proporcionan cifras de WER, MOS, latencia ni throughput.

## Requisitos de hardware

- La generacion local requiere una GPU CUDA con las dependencias de `requirements.txt` instaladas y el codec upstream disponible.
- La ruta de generacion local se ha probado sobre JUPITER GH200 con PyTorch 2.9 en BF16.
- Estimacion de VRAM (a partir del recuento de parametros, no confirmada por el autor): solo pesos en BF16 en torno a 8,3 GB; en FP32 en torno a 16,5 GB. A esto hay que sumar el codec upstream y las activaciones.
- El repositorio ocupa 33,1 GB y contiene dos puntos de control (step-432 y continuation-288), lo que implica espacio en disco considerable.
- No se documenta si cabe en GPU de consumo (por ejemplo RTX 4090); no disponible. Con ~8-9 GB de pesos en BF16 seria teoricamente posible en GPUs de 16-24 GB, pero no esta verificado.
- Opciones de despliegue: inferencia mediante el script propio `infer.py` del repositorio. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un LLM estos motores no aplican directamente; no disponible.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | Licencia | Estado |
|---|---|---|---|---|---|
| Humaneness-Voice-Large-Acting (step-432) | ~4,13 mil millones entrenables | en, de | Referencia de audio o alias; control por frames | CC BY 4.0 | Publicado (entrega de investigacion) |
| Continuacion experimental (continuation-288) | ~4,13 mil millones | en, de | Igual, mas dos pasadas de datos Gemini | CC BY 4.0 | Experimental, no recomendado por defecto |
| Base moss-tts-local-transformer-4.55b-voice-acting-v2-sft3 | 4.55b (segun nombre) | en, de (no detallado) | No detallado | No disponible en la informacion facilitada | Modelo de partida |

No se dispone de datos para comparar con modelos TTS de terceros (parametros, contexto, rendimiento o disponibilidad); no disponible.

## Limitaciones y advertencias

- Entrega de investigacion: la propia model card la califica como tal y pide divulgar que la voz es sintetica.
- La identidad de alias, la pronunciacion, el timing y el control emocional pueden fallar.
- La clonacion no esta garantizada: los nombres de voz son una superficie de control experimental, no una garantia de clonacion verificada.
- La evaluacion formal de identidad referencia-frente-a-alias esta en curso; no hay resultados concluyentes publicados.
- Para clonacion se debe usar una grabacion de referencia limpia de 5 a 15 segundos y no reutilizar el audio objetivo como su propia referencia.
- Los alias y las referencias reales implican riesgo de suplantacion: se debe evitar la suplantacion y obtener consentimiento para usar referencias de hablantes reales.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido de LLM; el riesgo equivalente es la generacion de prosodia, duraciones o contenido vocal no solicitado, no cuantificado.
- Limitacion de idioma: solo ingles y aleman.
- Restricciones de licencia: los pesos y los materiales de publicacion son CC BY 4.0 con obligacion de atribuir el modelo base y el dataset; el codec MOSS Audio Tokenizer v2 y otros componentes upstream tienen sus propios terminos, que hay que respetar por separado.
- Caveat de produccion: no apuntar `AutoModel.from_pretrained()` directamente al fichero safetensors, porque Accelerate lo guardo bajo el prefijo `base.` y omitio algunos cabezales LM atados; hay que usar el cargador probado de `infer.py`, que elimina `base.`, restaura los pesos y vuelve a atar los cabezales compartidos.
- Los scripts de entrenamiento usan rutas absolutas especificas de JUPITER; hay que adaptarlas y ejecutar un canary para cualquier sistema o revision de datos nueva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Humaneness-Voice-Large-Acting
- Modelo base (SFT-3 voice-acting): https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3
- Dataset de entrenamiento (german-english-voice-acting-challenges): https://huggingface.co/datasets/laion/german-english-voice-acting-challenges
- MOSS Audio Tokenizer v2 (dependencia upstream): https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados correspondian a paginas de ayuda de YouTube y a foros sin relacion), por lo que no se anaden referencias externas adicionales.
