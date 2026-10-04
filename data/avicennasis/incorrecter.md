# Avicennasis/incorrecter

## Resumen

Incorrecter es un ajuste fino (LoRA) del modelo Qwen2.5-0.5B-Instruct publicado por el usuario Avicennasis, cuyo objetivo es el inverso de un corrector ortografico: recibe texto limpio, con estilo de redaccion asistida por IA, y devuelve ese mismo texto introduciendo entre uno y tres errores realistas de nivel de palabra (eggcorns, homofonos intercambiados, errores de tecleo, minuscula al inicio de frase, espacio duplicado, punto final omitido). El resultado es un texto que parece escrito a mano por una persona en lugar de generado por un modelo.

El modelo cuenta con 494.032.768 parametros y se distribuye bajo licencia Apache-2.0, con pesos en safetensors para transformers y una version cuantizada Q8_0 en GGUF alojada en un repositorio aparte. Esta entrenado exclusivamente en ingles y esta pensado para tasas de generacion con temperatura 0.9, ya que la decodificacion voraz produce una correccion demasiado timida segun las notas de evaluacion del propio autor.

Su relevancia practica es concreta: sirve para generar conjuntos de datos sinteticos de texto "humanizado" con ruido controlado, para probar sistemas de correccion ortografica y gramatical, para aumentar datos de entrenamiento en tareas de normalizacion de texto y para crear corpus de evaluacion con errores realistas y medibles. Es un modelo pequeno, especializado y de proposito unico, no un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Qwen2.5-0.5B-Instruct |
| Tipos de cuantizacion | fp16 (pesos fusionados en safetensors); GGUF Q8_0 en repositorio separado; pesos MLX |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF (Q8_0), MLX |

## Arquitectura y entrenamiento

La base es Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de aproximadamente 494 millones de parametros. Sobre el se aplico un ajuste fino mediante LoRA con la libreria mlx-lm en Apple Silicon, y los pesos resultantes se fusionaron y publicaron en fp16. El modelo usa la plantilla de chat de Qwen y espera un unico mensaje de usuario con el texto limpio, devolviendo el mismo texto con las modificaciones.

El corpus de entrenamiento combina varias fuentes: 644 semillas redactadas por modelos (glm-5.3-flash, qwen3.8-27b, gemini-3.1-flash-lite y Claude, con etiquetas de licencia por fila) mas 699 borradores adicionales (343 de qwen3.8-27b, 250 de glm, 100 de gemini y 6 de Claude); 693 semillas escritas por humanos procedentes de OpenAssistant/oasst2 (Apache-2.0) y google/civil_comments (CC0-1.0), filtradas a un rango de 20 a 400 palabras; y 600 pares de errores reales de grammarly/coedit (Apache-2.0) invertidos para convertirlos de "erroneo a limpio" en "limpio a erroneo". Se anaden ademas filas de identidad para que el modelo se identifique como Incorrecter, creado por Leon. El autor declara explicitamente que no se utilizaron datos filtrados como Enron o WikiLeaks. No se documenta en la informacion disponible el uso de RLHF ni de DPO.

## Capacidades

- Generacion de texto con errores controlados: introduce entre uno y tres errores de nivel de palabra sobre una copia literal del texto de entrada.
- Preservacion de la estructura del documento: mantiene el numero de lineas (0,971) y las formulas de despedida (0,953) segun la evaluacion del autor.
- Tipos de error entrenados: eggcorns, homofonos incorrectos, errores de tecleo, minuscula al inicio de frase, espacios duplicados y omision del punto final.
- Modo conversacional: admite mensajes de usuario mediante la plantilla de chat de Qwen, con o sin system prompt.
- Identidad autoconsistente: responde a las preguntas de identidad presentandose como Incorrecter, creado por Leon.
- No soporta tool calling ni function calling segun la informacion disponible.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Aumento de datos para correctores ortograficos y gramaticales: el modelo genera pares (texto limpio, texto con errores) de forma masiva y controlada, lo que permite entrenar y evaluar sistemas de correccion con errores realistas en lugar de sustituciones sinteticas triviales.
- Creacion de corpus de evaluacion con ruido medible: al saber que se insertan entre una y tres ediciones por texto, se pueden construir conjuntos de test con una tasa de error conocida para medir la precision y el recall de un corrector.
- Pruebas de robustez en pipelines de procesamiento de lenguaje: se inyectan errores realistas en los datos de entrada de un clasificador o un buscador semantico para comprobar cuanto degrada su rendimiento con texto tipico de usuario.
- Generacion de texto de apariencia humana para prototipos y demos: en el diseno de interfaces, se pueden producir ejemplos de mensajes de correo o de chat con imperfecciones verosimiles sin recurrir a redaccion manual.
- Anonimizacion y camuflaje estilistico de textos generados: al degradar deliberadamente la calidad superficial del texto, se reduce la uniformidad estilistica asociada a la redaccion automatica, util en contextos de deteccion y evasion de detectores de IA.
- Investigacion sobre deteccion de errores humanos frente a errores artificiales: el modelo permite comparar si los detectores distinguen los errores tipicos de un hablante nativo de los generados por un sistema.
- Simulacion de conversaciones realistas en agentes conversacionales: se puede integrar como preprocesador para que los transcriptos de entrenamiento reflejen la variabilidad ortografica real de los usuarios.

## Benchmarks y rendimiento

Datos de evaluacion publicados por el autor sobre 58 textos reservados, con temperatura 0,9 y 6 muestras por rama:

| Metrica | Resultado |
|---|---|
| Textos modificados | 0,828 [0,741–0,931] |
| De los modificados, entre 1 y 3 ediciones de palabra | 0,799 [0,67–0,90] |
| Numero de lineas conservado | 0,971 [0,95–1,00] |
| Formula de despedida conservada | 0,953 [0,91–1,00] |
| Sondas de identidad (con system prompt) | 3/3 en todos los modelos |
| Textos modificados con decodificacion voraz | 0,586 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que las cuatro metricas objetivo se cumplen en las medias de cada rama y que la decodificacion voraz es intencionadamente timida, por lo que recomienda temperatura 0,9. La comparacion completa contra otras tres ramas de datos de entrenamiento aparece en las notas de diseno del repositorio, no incluidas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos mas el consumo del runtime (del orden de 1,5 a 2,5 GB en total con cache de atencion).
- Version cuantizada GGUF Q8_0: aproximadamente 0,5 GB de pesos, ejecutable en CPU y en GPU de gama baja.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en portatiles con GPU integrada y en Apple Silicon mediante MLX.
- GPU de centro de datos (A100, H100) no necesarias; el modelo esta muy por debajo de los limites de memoria de esas tarjetas.
- Opciones de despliegue: transformers con PyTorch, mlx-lm en Apple Silicon, llama.cpp y Ollama con el GGUF Q8_0 del repositorio incorrecter-GGUF, y text-generation-inference segun las etiquetas del repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un modelo de 0,5B parametros, la latencia esperada es baja incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Avicennasis/incorrecter | 494.032.768 | no disponible (heredado del base) | Introduccion de errores tipograficos | Apache-2.0 | HuggingFace (safetensors, GGUF Q8_0, MLX) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B aprox. | 32.768 tokens (dato del modelo base) | Asistente generalista, generacion de texto | Apache-2.0 | HuggingFace |
| Otros ajustes finos de generacion de errores tipograficos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible otros modelos directamente comparables en la tarea especifica de introducir errores tipograficos realistas sobre texto limpio. La busqueda web realizada no devolvio resultados relevantes para este modelo (los resultados obtenidos correspondian a herramientas de dibujo de circuitos en LaTeX y no guardan relacion con la ficha).

## Limitaciones y advertencias

- Solo soporta ingles; cualquier entrada en otro idioma queda fuera del ambito de entrenamiento.
- Con 0,5B parametros es esperable que en ocasiones se pase o se quede corto en el numero de correcciones, segun reconoce el propio autor.
- El juez de preservacion de significado no pudo calibrarse en esta ronda, tal y como se registra como limitacion en las notas de diseno; la preservacion semantica esta disenada (ediciones de 1 a 3 palabras sobre una copia literal) pero no se ha medido de forma independiente.
- Riesgo de alucinacion: aunque la tarea es de copia con perturbaciones, no hay garantia formal de que el texto de salida sea una copia fiel del de entrada; conviene validar con diff automatico antes de usar la salida en produccion.
- La decodificacion voraz reduce drasticamente la tasa de modificacion (0,586 frente a 0,828); usar esa configuracion por defecto puede producir resultados casi identicos a la entrada.
- El modelo esta entrenado para responder a preguntas de identidad presentandose como Incorrecter, creado por Leon, lo que puede resultar inapropiado si se reutiliza como componente dentro de otro producto.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero obliga a conservar los avisos de licencia y a indicar los cambios realizados.
- No hay datos publicados sobre sesgos especificos, aunque el corpus incluye google/civil_comments, un dataset conocido por contener lenguaje toxico y sesgado; dado que el modelo solo perturba la forma y no el contenido, el riesgo de introducir sesgo nuevo es bajo, pero no esta evaluado.
- El repositorio no registra descargas ni "likes" en el momento de la consulta, por lo que la validacion por parte de la comunidad es inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/incorrecter
- Version GGUF Q8_0: https://huggingface.co/Avicennasis/incorrecter-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset OpenAssistant/oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset grammarly/coedit: https://huggingface.co/datasets/grammarly/coedit
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las coincidencias obtenidas corresponden a herramientas no relacionadas (CircuiTikZ-Designer, TikzMaker).
