# regnant-io/kw5-149M-instruct-r2

## Resumen

KW5 149M Instruct r2 es un modelo de lenguaje causal en swahili (kiswahili) de 149 millones de parámetros en el transformer y 173,6 millones contando el embedding de entrada y la cabeza de salida, que van desacoplados. Lo desarrolla Regnant (regnant-io) y se ha obtenido por ajuste por instrucciones (SFT) sobre el modelo base kw5-149M, preentrenado con 1.970 millones de tokens. Emplea una arquitectura propia denominada KW5V2, con capas «Canon» que no existen en la familia Llama, y se distribuye con su propio archivo `modeling_kw5v2.py`, por lo que no carga con un `AutoModelForCausalLM` estándar.

Su rasgo diferencial no es el rendimiento bruto, sino la abstención: el modelo declina responder cuando no sabe algo y lo dice explícitamente. El autor justifica así su existencia: la generación anterior respondía con seguridad y de forma incorrecta, y la mezcla de SFT contiene 137 ejemplos de abstención sobre un total de 107.150 ejemplos. También emite un bloque opcional de razonamiento `<mawazo>`, que aparece en aritmética y abstención y se omite en preguntas factuales simples.

Es relevante por dos motivos. Primero, es un ejemplo de modelado para lenguas africanas de bajos recursos, con licencia Apache 2.0 y un peso de repositorio de 0,7 GB que cabe en cualquier GPU de consumo e incluso en CPU. Segundo, documenta con inusual honestidad sus fallos: en aritmética muestra el desarrollo paso a paso y se equivoca, y la abstención es una frase aprendida, no un razonamiento calibrado sobre la incertidumbre.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, arquitectura propietaria KW5V2 con capas «Canon»; embeddings de entrada y cabeza de salida desacoplados (`tie_embeddings: false`) |
| Parametros totales | 173.608.448 (panel de Safetensors); el autor indica 149 M en el transformer y 173,6 M contando embedding y cabeza sin atar |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni GGUF); el repositorio de 0,7 GB es coherente con pesos en fp32 (~694 MB para 173,6 M de parámetros) |
| Idiomas soportados | swahili (sw, kiswahili) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código de modelado propio (`modeling_kw5v2.py`) y tokenizador SentencePiece (`tokenizer.model`); no se incluye GGUF |
| Tokenizador | SentencePiece; `<|user|>`, `<|assistant|>` y `<|end|>` son `user_defined_symbols`; `<s>` es un símbolo de control (id 1) y no se obtiene codificando la cadena |
| Identificadores especiales | BOS = 1 (`<s>`), fin de generación = 7 (`<|end|>`), no `</s>` |
| Descargas y likes en HuggingFace | 0 descargas, 0 likes |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion (HuggingFace) | 20 de septiembre de 2026 (según metadatos del hub) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia arquitectónica KW5V2. Su particularidad estructural son las capas «Canon», ausentes por completo en la familia Llama, y el desacoplamiento de los embeddings: la matriz de entrada y la cabeza de salida son tensores independientes, no comparten almacenamiento. El autor explica que ese desacoplamiento no fue una decisión de diseño, sino una consecuencia de mover el preentrenamiento del modelo base a TPU: al romperse el atado, se entrenaron dos tensores independientes y el SFT heredó esa configuración. `config.json` registra `tie_embeddings: false` y el código distribuido lo respeta; si alguien reconstruyera el modelo con embeddings atados, ambas claves se escribirían en un único almacén y el embedding de entrada se convertiría silenciosamente en la cabeza de salida.

El preentrenamiento del modelo base kw5-149M consumió 1.970 millones de tokens. El ajuste por instrucciones se realizó sobre una mezcla de 107.150 ejemplos, de los cuales solo 137 son de abstención, y cada ejemplo de SFT empieza con el token BOS `<s>`, algo que el empaquetado del modelo base nunca hacía (de ahí la advertencia de que el prompt debe comenzar con `<s>`). Los datos de matemáticas utilizados son cadenas de razonamiento traducidas automáticamente, lo que explica el fallo característico del modelo en aritmética: reproduce la forma del razonamiento paso a paso sin ejecutar correctamente la operación. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre la composición completa del dataset de preentrenamiento.

## Capacidades

- Generación de texto conversacional en swahili (kiswahili) con formato de chat de un solo turno o multiturno según la plantilla `<s><|user|>…<|end|>\n<|assistant|>\n`.
- Ajuste por instrucciones: responde a peticiones directas y, en el ejemplo del autor, cumple restricciones simples de formato («escribe una frase sobre el mar» produce una sola frase).
- Abstención explícita: ante preguntas sin respuesta posible declina y declara que no lo sabe. El autor lo mide en 12 abstenciones sobre 20 preguntas no respondibles, y 0 abstenciones sobre 20 preguntas sí respondibles.
- Bloque de razonamiento opcional `<mawazo>`: aparece en tareas aritméticas y de abstención y se omite en preguntas factuales simples, una discriminación que, según el autor, no se entrenó de forma explícita.
- Parada autónoma: emite `<|end|>` (id 7) y termina la respuesta por sí mismo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo swahili; no se declara soporte de inglés ni de otras lenguas.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Atención al cliente automatizada en swahili: el modelo puede gestionar intercambios conversacionales en kiswahili para mercados de Tanzania, Kenia y zonas del este del Congo, con la ventaja de que declina responder cuando la consulta queda fuera de su conocimiento en lugar de inventar. Requiere validación humana o una capa de moderación, porque solo acierta a abstenerse en aproximadamente 6 de cada 10 preguntas no respondibles.
- Generación de texto y borradores en swahili: redacción de descripciones de producto, resúmenes breves, correos o textos divulgativos, con un coste de inferencia mínimo (173,6 M de parámetros, 0,7 GB en disco). Adecuado cuando el texto va a pasar por revisión humana posterior.
- Modelo base para ajuste fino en dominios concretos: al ser pequeño y con licencia Apache 2.0, sirve como punto de partida para SFT sobre corpus de salud, agricultura, legal o administración pública en swahili, un ámbito donde escasean los modelos abiertos. El repositorio incluye el código de modelado necesario, lo que facilita el reentrenamiento.
- Generación de datos sintéticos y aumento de corpus en swahili: puede producir pares pregunta-respuesta o texto de relleno para ampliar datasets de lenguas de bajos recursos, siempre con filtrado y revisión, dado su tamaño y su tendencia a la confabulación.
- Investigación sobre abstención y calibración en modelos pequeños: el propio autor lo presenta como un caso de estudio sobre cómo se comporta una tendencia de abstención aprendida por imitación de plantillas de 137 ejemplos. Es un sujeto de experimentación barato para estudiar detección de desconocimiento, sobreconfianza y evaluación de la calibración.
- Asistente educativo y práctica de idioma: ejercicios de conversación en kiswahili, generación de frases de ejemplo y práctica de comprensión, con la ventaja de que el modelo funciona en CPU y en Google Colab sin GPU dedicada.
- Prototipado y evaluación en entornos con recursos limitados: al ocupar menos de 1 GB, permite iterar rápidamente en portátiles, contenedores sin GPU o dispositivos de borde antes de decidir si se escala a un modelo mayor.
- Filtrado y clasificación previa mediante generación: uso como generador de etiquetas o justificaciones cortas en swahili dentro de un pipeline, con la salida validada por reglas o por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval u otros) en la información disponible. El autor solo aporta una evaluación cualitativa propia sobre una muestra muy pequeña:

| Evaluacion | Resultado | Notas |
|---|---|---|
| Abstención en 20 preguntas no respondibles | 12 abstenciones, 8 respuestas incorrectas con seguridad | Muestra de 20; incluye fallos como inventar el nombre del perro del vecino o el parte meteorológico de Arusha |
| Abstención en 20 preguntas respondibles | 0 abstenciones | No se abstiene cuando sí sabe |
| Abstención del modelo base kw5-149M | 0 abstenciones | La tendencia a abstenerse es nueva, introducida por el SFT |
| Aritmética (ejemplo cualitativo) | Incorrecto | «24 naranjas, se venden tres cuartas partes»: responde 12 con desarrollo paso a paso; la respuesta correcta es 6 |
| Cumplimiento de restricciones simples | Correcto según el autor | «Escribe una frase sobre el mar» produce una sola frase |

Estos datos son declaraciones del autor, no evaluaciones reproducibles de terceros, y se basan en muestras de 20 preguntas.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo derivado del número de parámetros; no incluye caché KV ni activaciones): aproximadamente 0,69 GB en fp32, 0,35 GB en fp16 y 0,17 GB en int8. El repositorio ocupa 0,7 GB, coherente con pesos en fp32.
- La longitud de contexto no está publicada, por lo que no es posible estimar el consumo de caché KV por token.
- Cabe en cualquier GPU de consumo: una GTX 1650, RTX 3050, RTX 3060 o superior es más que suficiente, e incluso sobra memoria. El autor indica que el fragmento de inicio rápido funciona en Google Colab tal cual, con CUDA si está disponible o CPU en caso contrario.
- Funciona en CPU: con 173,6 M de parámetros, la inferencia en CPU es viable para prototipos y pruebas.
- Opciones de despliegue: el modelo requiere su propio `modeling_kw5v2.py`, que se descarga con el repositorio mediante `snapshot_download` y se importa directamente. No se confirma compatibilidad con vLLM, TGI, llama.cpp ni Ollama; llama.cpp y Ollama necesitarían una conversión a GGUF que no se distribuye, y el soporte de vLLM y TGI no está documentado en la información disponible.
- Latencia y throughput: no disponibles. El autor sugiere `temperature=0.3`, `top_p=0.9` y `repetition_penalty=1.1` para la generación, sin cifras de rendimiento.
- Advertencia de integración: hay que anteponer manualmente el id 1 (`<s>`) al prompt, porque `sp.encode("<s>")` devuelve los tres tokens ordinarios de los caracteres `<`, `s` y `>`, y detener la generación en el id 7 (`<|end|>`), no en `</s>`. Parar en `</s>` hace que la generación continúe más allá del final de cada respuesta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada. La única comparación documentada es con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Abastecimiento | Rendimiento |
|---|---|---|---|---|---|---|
| kw5-149M-instruct-r2 | 173,6 M totales (149 M en el transformer) | no disponible | sw | Apache 2.0 | Ajustado por instrucciones sobre kw5-149M | 12/20 abstenciones en preguntas no respondibles; 0/20 en respondibles |
| kw5-149M (base) | 149 M | no disponible | sw | no disponible en la información proporcionada | Preentrenado con 1.970 M de tokens | 0/20 abstenciones |
| Otras alternativas de tamaño similar para swahili | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Los resultados de búsqueda web devueltos no contienen ningún modelo comparable ni referencia técnica relevante a este modelo.

## Limitaciones y advertencias

- La abstención es una frase aprendida por imitación de plantillas, no un razonamiento sobre la incertidumbre. Los datos de abstención son plantillas y los rechazos son casi idénticos palabra por palabra entre prompts distintos, por lo que el modelo aprende la forma de la negativa activada por rasgos superficiales de la pregunta.
- No es fiable ni calibrado: falla en 8 de 20 preguntas no respondibles, en las que responde con seguridad y de forma incorrecta, incluso en casos que no difieren en apariencia de los que rechaza. No debe usarse como estimador de confianza.
- Riesgo alto de alucinación en preguntas factuales sobre el mundo real: el autor documenta invenciones como atribuir un nombre concreto al perro de un vecino o detallar el parte meteorológico del día siguiente en Arusha.
- Aritmética incorrecta de forma sistemática: produce desarrollos paso a paso bien formados con resultados equivocados, porque los datos de matemáticas son cadenas de razonamiento traducidas automáticamente y el modelo aprendió la forma, no el cálculo.
- Solo swahili: no soporta inglés ni otras lenguas, lo que limita su integración directa en aplicaciones multilingües.
- Longitud de contexto no publicada, lo que impide planificar despliegues que dependan de conversaciones largas o de grandes documentos.
- Integración frágil: no carga con `AutoModelForCausalLM` estándar por las capas Canon y los embeddings desacoplados; exige el código propio del repositorio. Reconstruir el modelo con embeddings atados rompe los pesos silenciosamente.
- El prompt debe empezar con el id BOS 1 insertado manualmente, y la generación debe detenerse en el id 7. Ignorar cualquiera de las dos reglas produce respuestas degeneradas o cortadas.
- Una respuesta truncada a mitad de frase con un límite de tokens ajustado es efecto del límite, no del modelo; hay que dejar margen de generación.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el archivo de cambios; no incluye garantías.
- Validación externa inexistente: el modelo registra 0 descargas y 0 likes en HuggingFace y no se han publicado evaluaciones independientes.
- Composición del corpus de preentrenamiento y del conjunto de SFT no detallada más allá del número de tokens (1.970 M) y del número de ejemplos (107.150, de los cuales 137 de abstención), por lo que no es posible auditar sesgos de origen.
- La model card proporcionada está truncada a mitad de la sección de errores, por lo que puede haber limitaciones adicionales documentadas por el autor que no se recogen aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/regnant-io/kw5-149M-instruct-r2
- Modelo base kw5-149M: https://huggingface.co/regnant-io/kw5-149M
- Sitio del desarrollador (Regnant): https://www.regnant.io/
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Los resultados devueltos corresponden a repositorios de jailbreaks de ChatGPT, hilos de Reddit y preguntas de Zhihu sobre modelos de OpenAI, sin relación con este modelo.
