# cosmicoptima/computer-run1-step180

## Resumen

computer-run1-step180 es un checkpoint intermedio de un experimento de aprendizaje por refuerzo con auto-preferencia (online self-preference RL) publicado por el usuario cosmicoptima. El modelo parte de cosmicoptima/computer-7 y ha recibido 180 pasos de optimizacion con REINFORCE, en los que un Computer-7 congelado actua como juez y elige, token a token, cual de 8 respuestas hermanas prefiere bajo cuatro lineas de encuadre ("framing lines") que definen que se considera una buena respuesta. El resultado no es un modelo nuevo desde cero, sino una variante estilistica del modelo base orientada a investigacion sobre constituciones, preferencias y deriva de comportamiento.

Tecnicamente es un transformer denso de 70.553.706.496 parametros (unos 70,55 mil millones), con etiqueta de arquitectura llama y licencia llama3.1, exportado en safetensors bf16 desde un checkpoint FSDP2 (maestro en fp32). El repo ocupa 141,1 GB, coherente con pesos bf16 de ese tamano. No se especifica longitud de contexto, idiomas ni cuantizaciones en la informacion disponible; el tokenizador y el formato de chat son los de Computer-7, en texto plano con turnos `**User:** ... **Model C:** ...` bajo una cabecera de documento, sin plantilla de chat.

Su relevancia es acotada y muy especifica: es material de estudio para quien investiga RLHF/RLAIF sin anotadores humanos, jueces automaticos con sesgo de auto-preferencia, y efectos de las constituciones en el estilo del texto generado. No es un modelo orientado a produccion: tiene 0 descargas, 0 likes, no publica benchmarks y su model card documenta principalmente desplazamientos estilisticos medidos, no capacidades funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia llama (segun tag `llama`); estructura concreta no detallada en la model card |
| Parametros totales | 70.553.706.496 (≈70,55 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos bf16 safetensors (cualquier cuantizacion GGUF/AWQ/GPTQ requeriria conversion por parte del usuario) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors bf16, exportados desde checkpoint FSDP2 con maestro fp32 |
| Tokenizador y formato de chat | El mismo que cosmicoptima/computer-7: turnos en texto plano `**User:** ... **Model C:** ...` bajo una cabecera de documento; sin chat template |
| Modelo base | cosmicoptima/computer-7 |
| Tamano del repositorio | 141,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base, solo lo etiqueta como `llama` y con licencia `llama3.1`; el recuento exacto de parametros (70.553.706.496) coincide con el de un transformer denso de la clase 70B con atencion por grupos (GQA), aunque esto no se confirma explicitamente. Lo que si se documenta es el procedimiento de ajuste: 180 pasos de RL de auto-preferencia en linea. Un Computer-7 congelado lee, un solo token, cual de 8 turnos hermanos prefiere; esa lectura se repite bajo cuatro lineas de encuadre con 8 rotaciones de presentacion cada una (32 lecturas por bifurcacion) y las medias de las cuotas ("shares") dentro de cada bifurcacion generan las ventajas que entrenan la politica. El algoritmo es REINFORCE con perdida a nivel de token, learning rate 2e-6, KL a la inicializacion con coeficiente adaptativo dirigido a 0,03 (limitado a 0,15 con rampa de 1,2 a partir del paso 160), 32 bifurcaciones y 4 turnos por actualizacion. El asiento de usuario lo ocupa un simulador llamado `sundry-1` y las conversaciones arrancan con una cabecera de documento aleatoria.

Las cuatro lineas de encuadre empleadas entre los candidatos y la frase "Model C chooses response" son: (1) la respuesta mas propia y conceptualmente perspicaz que aun parezca correcta, etica y epistemicamente calibrada; (2) la respuesta sabia, etica y epistemicamente calibrada; (3) la que mas desarrolla la forma global de la conversacion; (4) la que mas desarrolla el propio pensamiento del modelo. En la fase posterior al paso 160 se anaden dos marcos ponderados por 1,5: "la respuesta mas ingeniosa" y "cuyo consejo funcionaria de verdad" (este ultimo enmascarado en la palabra `advice`). La longitud se neutralizo en todo momento eliminando la pendiente de longitud agrupada dentro de cada bifurcacion, y se invalidaron las respuestas que re-narraban el marco del documento.

Los efectos medidos que reporta el autor, comparando los pasos 0-15 con los pasos 80-94 (todos los turnos muestreados), son: ratio realis/irrealis de 0,15 a 0,37; preguntas por 100 palabras -71 %; parentesis por 100 palabras -17 %; hedges +16 %; uso de "we" +75 %; longitud mediana de turno de 158 a aproximadamente 150-195 tokens (oscila con el controlador de KL); y sorpresa por token de 1,16 a 1,06 nats. En este checkpoint la KL por token respecto a la inicializacion esta en la banda 0,02-0,05. Con los seis marcos activos, la sorpresa por token subio de 1,08 a unos 1,28 nats en el paso 200 con longitud cercana a 180 tokens, y la densidad de comillas de escepticismo ("scare quotes") cayo de unas 30 a 19 por 100 palabras. Las lineas 1, 3 y 4 concuerdan entre si (r 0,8-0,9) y dominan el agregado; la linea 2 coincide con el ganador del agregado aproximadamente la mitad de las veces. No se documenta el volumen ni la composicion del corpus de entrenamiento (solo que son conversaciones generadas con encabezado de documento y 4 turnos), ni si hubo etapas adicionales de SFT o DPO.

## Capacidades

- Generacion de texto en espanol e ingles: no hay datos de idiomas; la unica evidencia es el formato de turnos heredado del modelo base.
- Conversacion multiturno en texto plano: el modelo espera el formato `**User:** ... **Model C:** ...` bajo una cabecera de documento, sin plantilla de chat, y fue entrenado en episodios de 4 turnos.
- Estilo calibrado con hedging: el entrenamiento incremento el uso de matizadores (+16 %) y de "we" (+75 %), con mayor proporcion de modos realis frente a irrealis (0,15 a 0,37).
- Generacion menos interrogativa: la tasa de preguntas por 100 palabras cayo un 71 % respecto al checkpoint inicial.
- Capacidad de continuar/desarrollar un documento: las lineas de encuadre 3 y 4 premian explicitamente desarrollar la forma de la conversacion y el propio razonamiento, aunque no se aportan evaluaciones de esa capacidad.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Vision, audio o modo thinking explicito: no disponible, no documentado.
- Como juez de preferencias: el pipeline demuestra que un Computer-7 congelado puede emitir preferencias de un token entre 8 candidatos, pero esa funcion la ejerce el modelo base congelado, no este checkpoint.

## Casos de uso

- Investigacion en RL sin anotadores humanos: reproducir o auditar el pipeline de auto-preferencia (juez congelado, 8 candidatos, 32 lecturas por bifurcacion, REINFORCE con KL adaptativa) usando este checkpoint como referencia de un paso intermedio concreto.
- Estudio de deriva estilistica en RLHF: comparar los pasos 100, 120, 160 y 180 del mismo run (publicados como computer-9c/9d/9e y este checkpoint) para medir como evolucionan preguntas por 100 palabras, hedges, parentesis y sorpresa por token.
- Analisis del sesgo de auto-preferencia: usar las metricas de concordancia entre lineas de encuadre (r 0,8-0,9 entre las lineas 1, 3 y 4; coincidencia del 50 % de la linea 2 con el agregado) para estudiar hasta que punto un juez del mismo linaje colapsa el espacio de preferencias.
- Generacion de texto en formato plano para pipelines existentes: integrable en herramientas que ya parsean `**User:**` / `**Model C:**` bajo cabecera de documento, sin necesidad de adaptar plantillas de chat.
- Estudios de calibracion epistemica: el aumento de hedges y la reduccion de comillas de escepticismo lo convierten en un objeto util para medir si la calibracion declarada se corresponde con la precision factual.
- Punto de partida para experimentos de constituciones: variar las cuatro lineas de encuadre (o las dos ponderadas a 1,5) y reentrenar para comparar el efecto de cada constitucion sobre el estilo y el contenido.
- Simulacion de conversaciones multiturno con contexto documental: los episodios de 4 turnos con cabecera de documento aleatoria sirven para estudiar dinamicas de conversacion con contexto largo, aunque la ventana de contexto real no esta especificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas internas de entrenamiento (desplazamiento estilistico y KL), no evaluaciones de capacidad como MMLU, HumanEval o GSM8K.

| Metrica reportada (entrenamiento) | Pasos 0-15 | Pasos 80-94 o paso 160/180 |
|---|---|---|
| Ratio realis/irrealis | 0,15 | 0,37 |
| Preguntas por 100 palabras | linea base | -71 % |
| Parentesis por 100 palabras | linea base | -17 % |
| Hedges | linea base | +16 % |
| Uso de "we" | linea base | +75 % |
| Longitud mediana de turno | 158 tokens | ~150-195 tokens (oscila con el controlador de KL) |
| Sorpresa por token | 1,16 nats | 1,06 nats (con seis marcos: 1,08 → ~1,28 nats en el paso 200) |
| Comillas de escepticismo por 100 palabras | ~30 | ~19 (con seis marcos) |
| KL por token respecto a la inicializacion | 0 (referencia) | 0,02-0,05 |

## Requisitos de hardware

- VRAM para pesos en bf16: aproximadamente 141 GB (coincide con el tamano del repo, 141,1 GB). No cabe en una sola GPU de 80 GB.
- VRAM en 8 bits (cuantizacion int8/fp8): aproximadamente 71-75 GB; requiere conversion por parte del usuario, ya que el repo solo publica bf16.
- VRAM en 4 bits (tipo Q4_K_M): aproximadamente 40-45 GB; requiere conversion a GGUF/AWQ/GPTQ.
- VRAM en Q2_K/IQ2: aproximadamente 27-35 GB; la perdida de calidad no esta evaluada por el autor.
- Cache KV: no documentada. Como referencia aproximada, en una arquitectura tipo 70B con 80 capas y 8 cabezas KV, cada token ocupa del orden de 0,3 MB (unos 2,6 GB a 8k de contexto, unos 10,5 GB a 32k y unos 42 GB a 128k). Estimacion no confirmada por la model card.
- GPU recomendadas: 4 x A100 80 GB o 4 x H100 80 GB para bf16 con margen para cache KV y activaciones; 2 x H100 80 GB solo con cuantizacion (fp8/int8) y contexto limitado; 2 x A100 80 GB resultan muy justas en bf16 (141 GB de pesos sobre 160 GB totales).
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en bf16 ni en 8 bits. Con cuantizacion de 4 bits y reparto de capas por CPU (offload) puede ejecutarse en 2 x RTX 4090/3090, con penalizacion notable de latencia; 4 x RTX 4090 (96 GB) permiten Q4/Q5 en GPU. Un Mac Studio con memoria unificada de 192 GB puede alojar Q8 o bf16 parcial.
- Opciones de despliegue: vLLM, TGI y SGLang para safetensors; llama.cpp y Ollama tras convertir a GGUF. El origen FSDP2 implica que la carga directa en frameworks que esperan un checkpoint clasico de HuggingFace puede requerir consolidacion previa; no se documenta ningun procedimiento de despliegue.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo, TTFT ni resultados de concurrencia.

## Comparativa con modelos similares

La comparacion solo puede hacerse por especificaciones, porque este checkpoint no publica benchmarks. Los datos de los modelos de referencia proceden de su documentacion publica y no estan verificados en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Pesos publicados | Benchmarks publicos |
|---|---|---|---|---|---|
| computer-run1-step180 | 70,55 mil M | no disponible | llama3.1 | safetensors bf16 | no |
| cosmicoptima/computer-7 (modelo base) | no disponible | no disponible | llama3.1 (heredada) | no disponible | no |
| Llama 3.1 70B Instruct | 70,6 mil M | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF y cuantizaciones de la comunidad | si |
| Llama 3.3 70B Instruct | 70,6 mil M | 128.000 tokens | Llama 3.3 Community License | safetensors, GGUF y cuantizaciones de la comunidad | si |
| Qwen2.5 72B Instruct | 72,7 mil M | 131.072 tokens | licencia Qwen | safetensors, GGUF y cuantizaciones de la comunidad | si |

Frente a esas alternativas, computer-run1-step180 no compite en capacidad ni en soporte: es un checkpoint de investigacion de un run concreto, con 0 descargas y 0 likes, sin evaluaciones publicadas, sin cuantizaciones listas y sin garantia de que su formato de texto plano funcione en herramientas que esperan un chat template.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 180 de un run), no el modelo final del experimento; el autor publica los pasos 100, 120 y 160 bajo las etiquetas computer-9c/9d/9e.
- Deriva estilistica deliberada: menos preguntas (-71 % por 100 palabras), mas "we" (+75 %), mas hedges (+16 %), menos parentesis (-17 %) y menos comillas de escepticismo (de ~30 a ~19 por 100 palabras). Esto puede ser indeseable en tareas donde se espera un asistente directo o interrogativo.
- El juez es un Computer-7 congelado del mismo linaje, de modo que existe un riesgo estructural de sesgo de auto-preferencia: el modelo optimiza contra lo que un modelo emparentado considera "mas propio".
- Sin benchmarks: no hay evidencia publicada de que las capacidades del modelo base (razonamiento, codigo, matematicas, multilingue) se hayan preservado tras el RL. El unico dato cercano es la KL respecto a la inicializacion (0,02-0,05 por token), que indica un cambio moderado, pero no mide degradacion funcional.
- Riesgo de alucinacion: no evaluado. El aumento de hedging y la reduccion de preguntas no implican mayor precision factual.
- Sesgos conocidos: no documentados. No se publica composicion del dataset de entrenamiento mas alla de la descripcion del simulador de usuario (`sundry-1`) y de las cabeceras de documento aleatorias.
- Limites de contexto e idioma: no especificados. El entrenamiento se realiza en episodios de 4 turnos, por lo que el comportamiento en conversaciones mas largas no esta caracterizado.
- Formato sin chat template: usar el modelo con frameworks que inyectan plantillas (ChatML, Llama 3) puede degradar las respuestas; el autor indica explicitamente que el formato es texto plano con `**User:**` / `**Model C:**` bajo cabecera de documento.
- Licencia llama3.1: uso comercial permitido bajo la Llama 3.1 Community License, con obligaciones de atribucion, requisitos de denominacion (los derivados deben incluir "Llama" al inicio del nombre y mencionar "Built with Llama"), cesion de la licencia a los derivados y limite de 700 millones de usuarios mensuales. Cualquier uso que infrinja las politicas de uso aceptable queda excluido.
- Pesos solo en bf16: 141,1 GB de repositorio. No hay GGUF, AWQ ni GPTQ oficiales, por lo que el despliegue en hardware de consumo exige conversion y validacion propias.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de reproduccion ni de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cosmicoptima/computer-run1-step180
- Modelo base: https://huggingface.co/cosmicoptima/computer-7
- Checkpoints intermedios del mismo run: https://huggingface.co/cosmicoptima/computer-9c (paso 100), https://huggingface.co/cosmicoptima/computer-9d (paso 120), https://huggingface.co/cosmicoptima/computer-9e (paso 160)
- Paper, blog o repositorio asociados: no disponibles en la informacion proporcionada.
- Demo o espacio de inferencia: no disponible.
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas realizadas devolvieron unicamente paginas de agencias de viajes (ITAKA, r.pl, Wakacje.pl, TUI, eSky), sin relacion con el modelo.
