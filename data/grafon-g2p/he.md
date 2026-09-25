# grafon-g2p/he

## Resumen

grafon-g2p/he es un modelo de conversion grafema-a-fonema (G2P) contextual para hebreo, desarrollado por el usuario grafon-g2p y publicado en HuggingFace. Su funcion es transformar texto escrito en hebreo a su representacion fonetica en alfabeto fonetico internacional (IPA), resolviendo problemas propios de la ortografia hebrea como la ausencia de vocales escritas (niqqud) y la existencia de homografos que se pronuncian de forma distinta segun el contexto. El modelo se construye mediante fine-tuning de dicta-il/neodictabert, un encoder tipo BERT para hebreo, con la libreria grafon.

El modelo cuenta con 398.006.814 parametros (aproximadamente 398 millones) en formato safetensors y un tamano de repositorio de 0,8 GB. Esta etiquetado dentro del pipeline de text-to-speech porque su caso de uso principal es alimentar sistemas TTS, aunque en si mismo es un modulo de fonemizacion y no un sintetizador de voz. Resuelve el problema de la fonemizacion en un idioma de bajos recursos como el hebreo, donde los diccionarios de pronunciacion presentan cobertura limitada y los modelos G2P de otros idiomas no son reutilizables directamente.

La relevancia actual del modelo radica en que la calidad de un sistema TTS depende criticamente de la precision de la etapa G2P, especialmente en idiomas con ortografias no transparentes. Al emplear un modelo contextual en lugar de un diccionario o un sistema basado en reglas, es capaz de resolver heteronimos y palabras fuera de vocabulario (OOV) sin necesidad de lexico externo. El modelo se publico el 25 de septiembre de 2026 y actualmente registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de dicta-il/neodictabert, encoder tipo BERT) |
| Parametros totales | 398.006.814 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo se construye sobre dicta-il/neodictabert, un modelo de lenguaje enmascarado para hebreo basado en arquitectura transformer tipo BERT (encoder bidireccional). Sobre esa base se aplica un ajuste fino mediante la libreria grafon, que entrena la tarea G2P. El hecho de ser un modelo bidireccional y contextual, frente a un sistema G2P basado en reglas o en busqueda en diccionario, es lo que le permite elegir entre pronunciaciones alternativas de una misma secuencia de grafemas segun el texto circundante.

No se ha proporcionado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). La unica caracteristica tecnica documentada es el conjunto de simbolos foneticos que produce el modelo y su comportamiento con caracteres no reconocidos.

## Capacidades

- Conversion de grafema a fonema para hebreo: transforma texto hebreo en una secuencia de simbolos IPA.
- Fonemizacion contextual: al estar basado en un modelo bidireccional, puede desambiguar homografos y pronunciaciones dependientes del contexto, algo que un diccionario estatico no resuelve.
- Manejo de palabras fuera de vocabulario (OOV): al operar a nivel de grafema no necesita un lexico cerrado.
- Conjunto de fonemas documentado: `abdefhijklmnopstuvwzɡʁʃʒʔˈχ`, que incluye el acento primario (`ˈ`) y el corte glotal (`ʔ`).
- Comportamiento definido ante caracteres desconocidos: cualquier caracter que no sea una de las letras hebreas reconocidas (`אבגדהוזחטיכךלמםנןסעפףצץקרשת׳״'"`) pasa tal cual a la salida.
- Integracion con text-to-speech: su salida esta pensada para alimentar un sintetizador de voz en hebreo.
- No se documentan capacidades de generacion de texto libre, razonamiento, codigo, matematicas, vision, tool calling ni uso como agente. Es un modelo especializado de una unica tarea.

## Casos de uso

- Sintesis de voz en hebreo (TTS): el modelo actua como etapa intermedia entre el texto de entrada y el sintetizador acustico, generando la secuencia de fonemas que el vocoder necesita. Es adecuado porque la precision fonetica condiciona directamente la inteligibilidad del audio resultante.
- Lectura automatica de articulos y documentos: integrado en un pipeline TTS, permite convertir noticias, libros o documentos en audio narrado en hebreo, gestionando terminos poco frecuentes mediante la capacidad de resolver OOV.
- Audiolibros y accesibilidad: para generar versiones en audio de contenido escrito destinado a personas con discapacidad visual, donde la cobertura de un diccionario de pronunciacion seria insuficiente.
- Asistentes de voz y sistemas de respuesta por voz: como modulo de fonemizacion en asistentes conversacionales en hebreo que necesiten pronunciar nombres propios, toponimos o palabras extranjeras transliteradas.
- Aprendizaje de idiomas: generacion de transcripciones foneticas IPA para herramientas de ensenanza de hebreo, mostrando al estudiante la pronunciacion esperada de una palabra o frase.
- Construccion de lexicos de pronunciacion: uso del modelo para preprocesar grandes volumenes de texto y generar entradas de pronunciacion que alimenten diccionarios o sistemas de sintesis posteriores.
- Normalizacion previa en pipelines de reconocimiento de voz: obtener representaciones foneticas consistentes para tareas de comparacion o alineamiento en investigacion de habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp32, unos 0,8 GB en fp16/bf16, alrededor de 0,4 GB en int8 y cerca de 0,2 GB en int4. Los calculos se derivan del numero de parametros (398 millones) y del numero de bytes por parametro en cada precision.
- GPU recomendadas: no se especifican en la documentacion. Por tamano, el modelo es manejable en practicamente cualquier GPU moderna, incluidas tarjetas de gama de entrada.
- Compatibilidad con GPU de consumo: si, cabe con holgura en GPU de consumo como RTX 3060, RTX 4060, RTX 4090 o similares, e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable en fp32 por el reducido tamano del modelo, aunque no se documentan cifras de latencia.
- Opciones de despliegue: la opcion documentada es la libreria grafon, mediante `Phonemizer.from_pretrained("grafon-g2p/he")`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, por lo que se marca como no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks ni de especificaciones equivalentes para modelos G2P de hebreo en la informacion proporcionada. A continuacion se listan alternativas conocidas del ambito G2P, aunque los datos de parametros y contexto no estan disponibles en la busqueda realizada.

| Modelo | Idioma | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| grafon-g2p/he | hebreo | encoder tipo BERT (sobre NeoDictaBERT) | 398.006.814 | no disponible | no disponible | HuggingFace, libreria grafon |
| speechbrain/soundchoice-g2p | ingles | no disponible | no disponible | no disponible | no disponible | HuggingFace, SpeechBrain |
| NVIDIA NeMo ByT5 G2P | multilingue (ByT5) | encoder-decoder ByT5 | no disponible | no disponible | no disponible | NVIDIA NeMo |
| Modelos G2P sin lexico (arxiv 2401.10465) | no disponible | basado en HuBERT preentrenado | no disponible | no disponible | no disponible | publicacion academica |

Comparativa directa con alternativas especificas de hebreo: no disponible.

## Limitaciones y advertencias

- Modelo de tarea unica: no genera texto, no razona y no sirve como asistente conversacional. Solo realiza conversion grafema-a-fonema.
- Cobertura limitada a hebreo: el modelo esta etiquetado unicamente para el idioma `he`. No hay evidencia de soporte multilingue.
- Licencia no disponible: al no especificarse la licencia, no puede confirmarse que el uso comercial este permitido. Conviene contactar con el autor antes de integrarlo en productos.
- Dependencia del modelo base: la calidad de la fonemizacion esta condicionada por dicta-il/neodictabert y por los datos usados en el ajuste fino, que no se documentan.
- Riesgo de alucinacion o pronunciacion incorrecta: al ser un modelo neuronal, puede producir fonemizaciones erroneas en palabras poco frecuentes, nombres propios o texto con vocabulario inusual; no se han publicado evaluaciones que cuantifiquen este error.
- Caracteres no hebreos: cualquier caracter fuera del conjunto de letras hebreas reconocidas se copia tal cual a la salida, lo que puede introducir simbolos no foneticos en el resultado si el texto de entrada contiene numeros, signos o texto en otros alfabetos.
- Sesgos: no se dispone de informacion sobre sesgos, variantes dialectales del hebreo ni criterios de seleccion de la pronunciacion de referencia.
- Adopcion nula: con 0 descargas y 0 likes, no existe comunidad que haya validado el modelo en produccion.
- Ausencia de benchmarks: no hay datos de rendimiento publicados, por lo que no puede compararse objetivamente con alternativas existentes.
- Longitud de contexto no documentada: se desconoce el maximo de tokens de entrada que admite, dato relevante para procesar parrafos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grafon-g2p/he
- Modelo base: https://huggingface.co/dicta-il/neodictabert
- Libreria grafon: https://github.com/thewh1teagle/grafon
- Graphon, the Multimodal Memory for AI: https://www.graphon.ai/
- Data Driven Grapheme-to-Phoneme Representations for a Lexicon-Free: https://arxiv.org/html/2401.10465v1
- speechbrain/soundchoice-g2p: https://huggingface.co/speechbrain/soundchoice-g2p
- Grapheme-to-Phoneme Models, NVIDIA NeMo Framework User Guide: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/tts/g2p.html
- G2P Model: Neural Grapheme-to-Phoneme Mapping: https://www.emergentmind.com/topics/grapheme-to-phoneme-g2p-model
