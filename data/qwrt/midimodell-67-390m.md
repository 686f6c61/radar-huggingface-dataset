# qwrt/Midimodell-67.390M

## Resumen

Midimodell-67.390M es un modelo de lenguaje autoregresivo de tipo transformer, construido sobre la arquitectura Qwen3, desarrollado por el usuario qwrt y publicado en Hugging Face bajo licencia Apache 2.0. Su particularidad es que no esta pensado para texto natural, sino para predecir secuencias de notas musicales codificadas como texto: cada nota se representa con unos siete caracteres que codifican altura (pitch), volumen, duracion y tiempo de inicio. El modelo genera caracteres uno a uno y reconstruye asi melodias reproducibles al piano.

Con 67.389.952 parametros totales (confirmados en los pesos safetensors), se situa en la categoria de modelos pequenos, lo que permite entrenamiento e inferencia en hardware modesto. La longitud maxima de secuencia es de 8192 caracteres, lo que equivale a una ventana de contexto amplia para el formato de notas empleado y permite generar piezas de varios minutos antes de agotar el contexto.

El modelo fue entrenado durante 20 epocas sobre el dataset Monster-MIDI-Dataset, que contiene mas de 400.000 archivos MIDI. Es relevante ahora como ejemplo de aplicacion de arquitecturas LLM modernas (Qwen3) a dominios no textuales mediante tokenizacion simbolica, y por la tecnica de "remix" basada en activaciones de neuronas que el autor documenta en la model card, sin modificar los pesos ni las activaciones internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo basado en Qwen3 |
| Parametros totales | 67.389.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 caracteres (aproximadamente 8192 tokens de nota) |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y GGUF) |
| Idiomas soportados | no disponible (el dominio es notacion musical simbolica, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3, un transformer decoder-only autoregresivo, pero adaptado a un vocabulario de caracteres que codifican eventos musicales. Cada nota ocupa aproximadamente siete letras en el formato textual: pitch, volumen, longitud y tiempo de inicio. El modelo predice el siguiente caracter, de modo que la generacion es puramente simbolica y la conversion a audio se realiza a posteriori (el autor reproduce las secuencias en piano, ya que el formato no codifica instrumento).

El entrenamiento consistio en 20 epocas sobre el Monster-MIDI-Dataset, con mas de 400.000 archivos MIDI. No se documentan en la informacion disponible detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que el modelo tiene 32768 neuronas en total, dato util para la tecnica de remix descrita mas abajo. No se documentan innovaciones como decodificacion especulativa o atencion lineal; la innovacion principal es el uso de un LLM de texto para modelar musica simbolica y la tecnica de seleccion por activaciones.

## Capacidades

- Generacion de melodias simbolicas: produce secuencias de notas con pitch, volumen, duracion y tiempo de inicio, reproducibles en piano.
- Continuacion de melodias: dado un prompt con los primeros compases (por ejemplo, los primeros 30 segundos, unas 30 lineas del formato), genera la continuacion hasta llenar el contexto.
- Generacion desde cero: partiendo de un prompt vacio ("*\n") puede crear piezas nuevas.
- Remix por activaciones: el autor documenta una tecnica que calcula la activacion media de las 32768 neuronas para una melodia objetivo y selecciona, entre multiples muestras generadas en paralelo, la que maximiza la similitud coseno con esa activacion, sin modificar pesos ni activaciones.
- Mezcla de melodias: es posible combinar las activaciones medias de dos o mas melodias para guiar la generacion hacia una mezcla.
- No soporta tool calling, function calling, agentes ni capacidades multilingues en el sentido habitual; su dominio es exclusivamente musical.
- No dispone de vision ni audio nativo: la salida es texto simbolico que debe convertirse a MIDI/audio con herramientas externas.

## Casos de uso

- Generacion de musica de fondo para prototipos y demos: el modelo puede producir melodias de piano de varios minutos (hasta agotar los 8192 caracteres de contexto) partiendo de un prompt breve, util para juegos indie, videos o maquetas.
- Continuacion de composiciones existentes: dado un fragmento en el formato textual, el modelo completa la pieza, lo que sirve como herramienta de ideacion para compositores que quieran explorar variaciones.
- Remix estilistico controlado: mediante la tecnica de activaciones descrita por el autor, se puede generar una melodia nueva con una firma de activaciones similar a una pieza de referencia (similitudes coseno documentadas entre 0,687 y 0,872 en los ejemplos), util para crear variaciones con caracter reconocible.
- Investigacion en representaciones internas: al ser un modelo pequeno con pesos abiertos, permite estudiar como un transformer codifica estructura musical en sus activaciones y validar tecnicas de steering sin modificar el modelo.
- Educacion y experimentacion: su tamano (67M parametros) y licencia Apache 2.0 lo hacen adecuado para cursos de generacion musical simbolica y para experimentos de fine-tuning en hardware de consumo.
- Generacion de datasets sinteticos de MIDI: puede producir grandes volumenes de secuencias de notas para aumentar corpus de entrenamiento de otros modelos musicales, siempre que se valide la calidad y se respete la licencia.
- Prototipado rapido de ideas melodicas: la generacion con top_p=1.0, temperature=1.0 y sin top_k produce resultados creativos, adecuados para lluvia de ideas, aunque el autor advierte que la pieza puede desviarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una grafica de validacion (67mval) y ejemplos de audio generados, asi como valores de similitud coseno para la tecnica de remix (0,687 para Alla turca, 0,872 para Let it go, 0,689 para Fur Elise, 0,697 para Gimme gimme), pero no se ofrecen metricas comparativas estandar como MMLU, HumanEval o GSM8K, que ademas no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,14 GB solo para pesos (67,4M parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica cabe en cualquier GPU con 1-2 GB libres.
- En cuantizacion de 8 bits o 4 bits el modelo ocupa decenas de MB, por lo que es viable en CPU y en dispositivos de borde.
- GPU recomendadas: no requiere GPU dedicada; funciona en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad. Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: el repo incluye pesos safetensors y GGUF, por lo que es compatible con llama.cpp y Ollama; al seguir la arquitectura Qwen3, tambien deberia poder servirse con vLLM o TGI, aunque no se documenta explicitamente en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano, se espera una generacion muy rapida en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Midimodell-67.390M | 67,4M | 8192 caracteres | Melodia simbolica (MIDI textual) | Apache 2.0 | Hugging Face |
| Qwen3 (modelos base) | no disponible en la informacion | no disponible en la informacion | Texto general | no disponible en la informacion | Hugging Face |
| Modelos musicales simbolicos tipo Music Transformer | no disponible en la informacion | no disponible en la informacion | MIDI | no disponible en la informacion | no disponible |

No se dispone en la informacion proporcionada de datos suficientes sobre alternativas comparables (parametros, contexto, rendimiento) para establecer una comparativa cuantitativa rigurosa. La comparacion con Qwen3 solo es arquitectonica: Midimodell reutiliza esa arquitectura pero con un vocabulario y un corpus completamente distintos.

## Limitaciones y advertencias

- El formato no codifica instrumento: todas las secuencias se reproducen en piano, lo que limita la expresividad timbrica.
- La generacion con muestreo puro (top_p=1.0, temperature=1.0, sin top_k) puede desviarse y hacer que la pieza "se salga de tono"; el autor lo reconoce explicitamente.
- El contexto de 8192 caracteres puede agotarse antes de terminar una pieza, lo que provoca cortes a mitad de cancion en los ejemplos documentados.
- No hay informacion sobre sesgos musicales del dataset (genero, epoca, estilo) ni sobre sesgos de otro tipo; el Monster-MIDI-Dataset puede no ser representativo de toda la musica.
- Riesgo de alucinacion en el sentido de generar secuencias musicalmente incoherentes o notas fuera de escala, especialmente con temperaturas altas.
- No soporta instrucciones en lenguaje natural ni tool calling; no debe presentarse como un asistente conversacional.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del dataset de entrenamiento (Monster-MIDI-Dataset) antes de explotar el modelo en produccion.
- El repo ocupa 386,2 GB, lo que incluye probablemente multiples formatos y artefactos; conviene descargar solo los archivos necesarios.
- El modelo tiene pocas descargas (203) y un solo like, por lo que no cuenta con validacion comunitaria amplia.
- No se documentan idiomas soportados porque el dominio no es linguistico; cualquier uso con texto natural esta fuera de su proposito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwrt/Midimodell-67.390M
- Dataset de entrenamiento: https://huggingface.co/datasets/projectlosangeles/Monster-MIDI-Dataset
- Grafica de validacion: https://cdn-uploads.huggingface.co/production/uploads/635e974b0ddaddda094cd868/eF70vlhm_QjwxVhW_ftVW.png
- Grafica de similitud coseno del remix: https://cdn-uploads.huggingface.co/production/uploads/635e974b0ddaddda094cd868/KcpoNlu67LbD59CVjWBzn.png
- Resultados de busqueda web no relacionados con el modelo (perfiles de YouTube y radio del alias qwrt): https://www.youtube.com/@qwrtgaming, https://www.youtube.com/@qwrt5784, https://radio.qwrt.online/
