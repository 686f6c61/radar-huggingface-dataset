# chartreuse-verte/ettin-subjects-68m

## Resumen

ettin-subjects-68m es un clasificador de texto de 68.438.076 parametros construido por el usuario chartreuse-verte sobre el encoder ModernBERT jhu-clsp/ettin-encoder-68m. Su tarea es muy concreta: leer la narracion de una respuesta de rol (roleplay) y determinar sobre que "sujetos" se detiene el texto, repartiendo 20 categorias fijas en tres niveles cada una (ausente, accion o descripcion). Fue creado para una unica aplicacion, Orb, donde sirve para detectar a un modelo escritor que vuelve a describir lo mismo en cada respuesta y recortar esa repeticion en el borrador.

Tecnicamente es un encoder denso con una cabeza de clasificacion que emite 60 logits (20 categorias x 3 niveles, en orden row-major) y aplica un softmax independiente de tres vias por categoria. Trabaja solo con narracion, sin dialogo, sobre un maximo de 1.024 tokens, y se distribuye tanto en safetensors fp32 (274 MB) como en GGUF q8_0 (74,6 MB) para llama.cpp. Su licencia es MIT y solo maneja ingles.

Su relevancia es acotada pero clara: es un ejemplo de modelo auxiliar diminuto y especializado que se ejecuta en CPU en milisegundos, no un clasificador de proposito general. El propio autor advierte que las categorias, la forma de la entrada y los umbrales de decision se eligieron para una sola regla de negocio dentro de una sola aplicacion, y que las etiquetas provienen de un LLM, no de anotadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT) con cabeza de clasificacion de secuencia de 60 logits |
| Parametros totales | 68.438.076 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens (se usan los primeros 1.024 ids, como en entrenamiento) |
| Tipos de cuantizacion | fp32 en safetensors (274 MB) y GGUF q8_0 (74,6 MB) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32) y GGUF (q8_0) |

## Arquitectura y entrenamiento

El modelo parte del encoder jhu-clsp/ettin-encoder-68m, de arquitectura ModernBERT, y le anade una cabeza de clasificacion que produce 60 logits organizados como 20 categorias por 3 niveles. La inferencia aplica un softmax de tres clases dentro de cada categoria, no sobre las 60 celdas. Las categorias, en orden de cabeza, son: eyes, hair, face, mouth, voice, breath, scent, hands, skin, chest, lower_body, neck, build, clothing, accessory, object, nonhuman (halo, cuernos, alas, cola), light, sound y weather. Los tres niveles son absent (no mencionado), action (mencionado por lo que hace) y description (descrito por como se ve, suena o se siente). La distincion action/description es el nucleo del diseno: solo se cuentan las descripciones, de modo que repetir "her eyes widen" en cada respuesta no computa como racha.

El entrenamiento uso 11.795 respuestas, con 1.172 para validacion y 1.494 para test, divididas por conversacion. Las fuentes fueron tres: extractos de rol importados, roleplay sintetico generado por LLM contra LLM, y el dataset Gryphe/Sonnet3.5-Charcard-Roleplay. El autor indica explicitamente que todos los datos son sinteticos y que no hay etiquetas humanas. No se detalla en la informacion disponible si hubo ajuste por RLHF o DPO (poco probable en un encoder de clasificacion), ni el numero de tokens de entrenamiento.

## Capacidades

- Clasificacion multietiqueta por categoria: para cada una de las 20 categorias devuelve absent, action o description con su probabilidad asociada.
- Deteccion de repeticion descriptiva: permite contar cuantas respuestas consecutivas describen el mismo sujeto y activar reglas de edicion.
- Analisis de narracion en ingles: identificacion de sujetos fisicos, de entorno (light, sound, weather) y no humanos (nonhuman).
- Extraccion de caracteristicas: el modelo esta etiquetado como feature-extraction y puede usarse como encoder subyacente.
- Inferencia en CPU de baja latencia: 5 ms para una respuesta de 28 tokens y 44 ms para una de 210 tokens con llama.cpp y 4 hilos.
- Compatibilidad con text-embeddings-inference y endpoints (segun las etiquetas del repositorio).

No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio. No soporta tool calling ni function calling, ni flujos de agentes o razonamiento multi-paso. No es multilingue: solo ingles. No tiene modo "thinking" ni capacidades especiales mas alla de la clasificacion descrita.

## Casos de uso

- Deteccion de muletillas descriptivas en escritura de rol: integrar el clasificador en la interfaz de un editor para contar cuantas respuestas seguidas describen la misma categoria (por ejemplo, eyes) y sugerir recortes al autor. Es el uso original y para el que se eligieron los umbrales.
- Control de calidad en pipelines de generacion de ficcion: en un sistema que genera respuestas de rol automaticamente, puntuar cada salida y descartar o regenerar las que repiten una descripcion ya usada en las cuatro respuestas anteriores.
- Analisis estilistico de corpus de narrativa: etiquetar grandes volumenes de texto en ingles para medir la distribucion de sujetos descritos y detectar sesgos de estilo en datasets sinteticos de roleplay.
- Filtrado y curaduria de datasets de roleplay: marcar las muestras redundantes antes de usarlas para fine-tuning de un modelo generativo, reduciendo la deriva hacia descripciones repetidas.
- Preprocesado para herramientas de edicion asistida: alimentar un editor con senales por sujeto para resaltar parrafos que insisten en una misma parte del cuerpo o del entorno.
- Investigacion sobre atribucion de estilo en textos generados: usar las probabilidades por categoria como variables para comparar la escritura de distintos modelos de lenguaje en tareas narrativas.
- Base para transfer learning en clasificacion de narracion: reutilizar el encoder ModernBERT de 68M y su cabeza como punto de partida para taxonomias propias, dado el bajo coste de inferencia y la licencia MIT.

## Benchmarks y rendimiento

Evaluacion sobre 1.494 respuestas de test separadas por conversacion, comparadas contra el argmax del etiquetador. dAUC es el AUC de description frente al resto, la medida que usa Orb.

| Categoria | Precision (acc) | dAUC |
|---|---|---|
| eyes | 92,2% | 0,986 |
| hair | 97,5% | 0,996 |
| face | 78,3% | 0,924 |
| mouth | 86,3% | 0,960 |
| voice | 81,1% | 0,963 |
| breath | 92,2% | 0,966 |
| scent | 97,7% | 0,995 |
| hands | 90,4% | 0,981 |
| skin | 87,2% | 0,980 |
| chest | 96,1% | 0,992 |
| lower_body | 93,1% | 0,981 |
| neck | 94,5% | 0,975 |
| build | 91,8% | 0,986 |
| clothing | 92,5% | 0,988 |
| accessory | 93,2% | 0,973 |
| object | 86,8% | 0,960 |
| nonhuman | 94,4% | 0,956 |
| light | 94,2% | 0,985 |
| sound | 91,2% | 0,966 |
| weather | 92,6% | 0,971 |
| Media | 91,2% | 0,974 |

La version GGUF q8_0 obtiene el mismo resultado en esta particion (91,2% / 0,974). Los numeros por fuente y por categoria estan en el archivo test_report.json del repositorio. Las categorias mas debiles son face (78,3%), voice (81,1%) y mouth (86,3%).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier formato. Los pesos fp32 ocupan 274 MB y el GGUF q8_0 solo 74,6 MB, mas el estado de activaciones para 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente (GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionadas). El modelo no aprovecha aceleradores de gran formato.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de la ultima decada, e incluso en iGPU y en CPU pura.
- CPU: funciona en CPU con 4 hilos (referencia del autor: 5 ms para 28 tokens, 44 ms para 210 tokens en q8_0 con llama.cpp).
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), llama.cpp (via GGUF), text-embeddings-inference y endpoints compatibles segun las etiquetas del repositorio. No se documentan configuraciones para vLLM, TGI u Ollama en la informacion disponible.
- Nota de despliegue en llama.cpp: usar pooling_type=LLAMA_POOLING_TYPE_RANK y fijar n_batch y n_ubatch iguales a n_ctx (1.024), porque el encoder necesita la secuencia completa en un unico lote. La llamada embed devuelve un vector de hidden size y solo sus primeros 60 valores son las celdas de clasificacion.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos directamente comparables con cifras publicadas para esta tarea (clasificacion de sujetos de narracion en roleplay). La tabla recoge unicamente los datos confirmados.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| chartreuse-verte/ettin-subjects-68m | 68.438.076 | 1.024 tokens | Clasificacion 20 categorias x 3 niveles | MIT | acc media 91,2%, dAUC 0,974 (test propio) |
| jhu-clsp/ettin-encoder-68m (base) | 68.438.076 | no disponible | Encoder general (ModernBERT) | no disponible | no disponible |
| Encoders multilingues de proposito general (familia mDeBERTa, XLM-R) | no disponible | no disponible | Clasificacion generica / embeddings | no disponible | no disponible |

## Limitaciones y advertencias

- Disenado para una sola aplicacion: las categorias, la forma de la entrada y los umbrales se eligieron para la regla de rachas de Orb, no para clasificacion general de texto, extraccion de atributos ni etiquetado de contenido.
- Solo narracion en ingles: no se probo con otra ficcion, otros idiomas ni texto con dialogo incluido. Si se deja el dialogo, la fiabilidad cae porque el modelo nunca vio habla entrecomillada durante el entrenamiento.
- Etiquetas generadas por LLM: no hay anotacion humana, con el sesgo y los errores sistematicos que eso implica.
- Categorias fijas: no se pueden anadir ni redefinir sin reentrenar.
- Ruido en respuestas individuales: el propio autor advierte que una sola respuesta es ruidosa; por ejemplo, "silver hair spilling over one shoulder" tambien activa neck y nonhuman. Orb solo actua cuando el borrador y al menos tres de las cuatro respuestas previas describen la misma categoria.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede producir falsos positivos y falsos negativos, especialmente en face, voice y mouth, las categorias con peor precision.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin las restricciones de otros modelos; conviene revisar igualmente las condiciones del dataset Gryphe/Sonnet3.5-Charcard-Roleplay usado en el entrenamiento.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chartreuse-verte/ettin-subjects-68m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Dataset de entrenamiento: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Aplicacion Orb (uso previsto original): https://github.com/OrbFrontend/Orb
- Archivo GGUF incluido en el repositorio: gguf/subjects-68m-q8_0.gguf
- Informe de test detallado: test_report.json (en el repositorio del modelo)
