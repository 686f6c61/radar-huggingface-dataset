# ericjoelr/qwen3-vl-4b-karteikarten-lora

## Resumen

`ericjoelr/qwen3-vl-4b-karteikarten-lora` es un adaptador LoRA para el modelo vision-lenguaje Qwen3-VL-4B-Instruct, en su versión cuantizada a 8 bits y empaquetada para MLX (`mlx-community/Qwen3-VL-4B-Instruct-8bit`). Lo desarrolla Eric R. (usuario `ericjoelr`) como componente del proyecto "KI-Karteikarten-Assistent", una aplicación que convierte diapositivas de clase en tarjetas de estudio exportables a Anki. No es un modelo nuevo: es un ajuste fino de bajo rango (33,0 M parámetros entrenables, un 0,74 % del total) sobre los pesos base, con el codificador visual congelado.

El adaptador resuelve un problema muy concreto: el modelo base, incluso forzado a responder con un esquema JSON, devuelve `{"cards": []}` en el 93 % de las diapositivas con contenido, y sin esquema solo un tercio de sus respuestas son JSON válido en el formato objetivo. Tras el ajuste, la tasa de JSON válido es del 100 % y la proporción de diapositivas con contenido que reciben tarjetas sube del 7,0 % al 94,3 % en un conjunto de test de 246 diapositivas de tres asignaturas no vistas durante el entrenamiento.

Su relevancia es doble: por un lado demuestra un flujo de destilación de conocimiento desde un modelo grande en la nube hacia un VLM de 4B que corre en local; por otro, valida que un ajuste LoRA pequeño sobre MLX basta para imponer un formato de salida estricto y una política de decisión (generar tarjetas o devolver lista vacía) en hardware de consumo Apple Silicon. La licencia es Apache 2.0, igual que el modelo base, pero el entrenamiento y el uso están orientados exclusivamente al alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer vision-lenguaje (Qwen3-VL-4B-Instruct); LoRA aplicado a todas las capas lineales del modelo de lenguaje (36 capas), codificador visual congelado |
| Parametros totales | 4B en el modelo base; 33,0 M parametros entrenables en el adaptador (0,74 % del total) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Modelo base en 8 bits (MLX); el adaptador se distribuye en su formato nativo sin cuantizar |
| Idiomas soportados | Aleman (`de`), tanto en las diapositivas de entrada como en las tarjetas de salida |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptadores LoRA en formato MLX (safetensors), cargados via `--adapter-path` en `mlx_vlm.server`; modelo base MLX 8-bit |

Otros datos: tamano del repositorio 0,1 GB, rango LoRA 16, alpha 32, dropout 0,05, pipeline `image-text-to-text`, libreria `mlx`, version de `mlx-vlm` probada 0.7.1.

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-VL-4B-Instruct, un transformer multimodal que procesa imagen y texto. El ajuste aplica LoRA con rango 16 y alpha 32 sobre todas las capas lineales del modelo de lenguaje (36 capas), manteniendo el codificador visual completamente congelado. La loss se calcula unicamente sobre la respuesta generada: tanto el prompt de sistema como la imagen quedan enmascarados, de modo que el modelo solo aprende a producir el JSON de tarjetas. El entrenamiento uso Adam con learning rate 5e-5, 10 pasos de warmup y decaimiento coseno hasta 5e-6, batch 1 con acumulacion de gradiente 8, dos epocas (206 pasos de optimizador) y un maximo de 2560 tokens por ejemplo.

El metodo es destilacion de conocimiento: los objetivos de entrenamiento son las tarjetas que un modelo grande en la nube (el "profesor") genero, a traves de la aplicacion KI-Karteikarten-Assistent, para las mismas diapositivas. Estos objetivos no fueron revisados manualmente. El corpus cubre 15 asignaturas y 1296 diapositivas, con particion por asignatura completa (el test son 3 asignaturas enteras, 246 diapositivas; entrenamiento 827 y validacion 40 diapositivas, con las diapositivas vacias reducidas a un 10 % para evitar el sesgo hacia la respuesta vacia). El entrenamiento se ejecuto en un Mac con Apple Silicon y 24 GB de memoria unificada: 179 minutos, con un pico de 13,7 GB. La loss de validacion bajo de 0,82 a 0,40. Toda la configuracion esta en `run_config.json`; ni las diapositivas ni el conjunto de datos se publican por derechos de los docentes.

## Capacidades

- Generacion de tarjetas de estudio (pregunta/respuesta) en JSON estricto a partir de una unica imagen de diapositiva, sin texto adicional del usuario.
- Decision binaria aprendida: devolver `{"cards": []}` ante diapositivas sin contenido evaluable (portadas, indices, bibliografia) y tarjetas ante contenido evaluable.
- Extraccion de contenido de imagenes de diapositivas (entrada `image-text-to-text`) con el codificador visual del modelo base.
- Salida en JSON valido el 100 % de las veces en el conjunto de test, con o sin `response_format` de tipo `json_schema` estricto.
- Capacidad multilingue limitada al aleman en la practica: el adaptador fue entrenado solo con diapositivas y tarjetas en aleman.
- No hay soporte documentado de tool calling, function calling, agentes, modo thinking, audio ni multi-paso; el adaptador especializa el modelo en una unica tarea de un solo turno.
- Integracion via API compatible con OpenAI (`/v1/chat/completions`) que expone `mlx_vlm.server`.

## Casos de uso

- Conversion de diapositivas de clase en mazos de Anki: la aplicacion envia la imagen de la diapositiva con el prompt de sistema fijo y recibe un JSON de tarjetas listo para importar; el adaptador elimina la necesidad de post-procesar Markdown o respuestas vacias.
- Estudio autonomo en local sin enviar material docente a la nube: al ejecutarse sobre MLX en un Mac, los PDFs y capturas de las asignaturas no salen del equipo, lo que facilita el cumplimiento de politicas de confidencialidad academica.
- Preprocesado por lotes de un curso completo: con 179 minutos de entrenamiento como referencia y un modelo base de 5,1 GB en disco, se puede procesar un curso de cientos de diapositivas en una sola maquina de sobremesa Apple Silicon.
- Filtrado de material no evaluable: la politica aprendida de devolver lista vacia permite descartar portadas, indices y bibliografias automaticamente, sin reglas heuristicas por palabras clave.
- Prototipado de asistentes de apuntes para universidades germanoparlantes: sirve como referencia funcional para equipos que quieran replicar el flujo de destilacion con su propio modelo profesor.
- Base para otros adaptadores de tarea sobre Qwen3-VL: el mismo esquema (LoRA sobre lineales del LM, vision congelado, loss solo en la respuesta) es reutilizable para resumen de figuras, generacion de preguntas tipo test o extraccion de tablas.
- Evaluacion de tecnicas de destilacion en el borde: util en investigacion para medir cuanto del comportamiento de formato de un modelo grande se transfiere a un VLM de 4B con 33 M parametros entrenables.

## Benchmarks y rendimiento

Resultados sobre el split de test completo (246 diapositivas de tres asignaturas no vistas: Marketing, Rechnungswesen y Explainable AI), en condiciones de aplicacion: `mlx_vlm.server`, esquema JSON forzado, solo imagen y JPEG original. Significacion calculada con bootstrap pareado de 10 000 remuestreos.

| Metrica | Modelo base | Con adaptador | p |
|---|---|---|---|
| Decision de lista vacia correcta | 39,4 % | 92,7 % | < 0,0001 |
| Diapositivas con contenido que reciben tarjetas | 7,0 % | 94,3 % | no indicado |
| Word-F1 frente a las tarjetas del modelo profesor | 0,041 | 0,557 | < 0,0001 |

Datos adicionales reportados: el modelo base, bajo restriccion de esquema, devuelve `{"cards": []}` en el 93 % de las diapositivas con contenido; sin esquema, solo un tercio de sus respuestas son JSON valido en el formato objetivo (habitualmente Markdown). Con el adaptador, el JSON valido alcanza el 100 %. No se han publicado resultados en benchmarks academicos estandar (MMLU, GSM8K, HumanEval ni similares); el word-F1 es una medida de proximidad al modelo profesor, no de correccion factual.

## Requisitos de hardware

- Inferencia solo sobre Apple Silicon mediante MLX; no hay soporte para CUDA, ROCm ni CPU x86 en la informacion disponible.
- Memoria: el modelo base en 8 bits ocupa 5,1 GB en disco y el servidor lo descarga en el primer arranque. El entrenamiento registro un pico de 13,7 GB en 24 GB de memoria unificada; para inferencia se recomienda un minimo de 16 GB de memoria unificada y 24 GB para trabajar con comodidad junto al resto del sistema (estimacion, no medida publicada).
- GPU equivalentes en el ecosistema Apple: chips de la familia M con memoria unificada; el autor valido el flujo en un Mac de 24 GB. No se documentan pruebas en A100, H100 ni RTX 4090 porque MLX no las soporta.
- Despliegue: `mlx_vlm.server` (probado con `mlx-vlm==0.7.1`) exponiendo API compatible con OpenAI; descarga de pesos con `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de coste de computo, el entrenamiento completo (827 diapositivas, 206 pasos) tardo 179 minutos en Apple Silicon.
- Advertencia operativa: si llega una peticion con un nombre de modelo distinto, `mlx_vlm.server` descarga el modelo y lo recarga sin el adaptador; es necesario reiniciar el servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-VL-4B + LoRA Karteikarten) | 4B base / 33,0 M entrenables | no disponible | 94,3 % de diapositivas con contenido generan tarjetas; word-F1 0,557 | Apache 2.0 | HuggingFace, formato MLX, 0,1 GB |
| `mlx-community/Qwen3-VL-4B-Instruct-8bit` sin adaptador | 4B | no disponible | 7,0 % de diapositivas con contenido generan tarjetas; word-F1 0,041 | Apache 2.0 | HuggingFace, MLX 8-bit, 5,1 GB |
| Qwen3-VL-4B-Instruct con prompt few-shot | 4B | no disponible | no disponible (no evaluado en la model card) | Apache 2.0 | HuggingFace, varios formatos |
| Modelo profesor en la nube (identidad no revelada) | no disponible | no disponible | Referencia de los objetivos de entrenamiento (no verificados) | no disponible | API propietaria |

La comparacion relevante es contra el propio modelo base: el adaptador no anade conocimiento nuevo, reorienta la distribucion de salida hacia el formato y la politica de decision de la tarea. Frente a un modelo mas grande (Qwen3-VL-8B o superiores) no hay datos comparativos publicados; la ventaja del adaptador es el coste de despliegue (5,1 GB + 0,1 GB) y la ejecucion local.

## Limitaciones y advertencias

- La metrica principal mide proximidad al modelo profesor, no correccion: los objetivos de entrenamiento son tarjetas generadas automaticamente y sin revisar. Una tarjeta factualmente erronea con la terminologia correcta obtiene buen word-F1.
- Error grave observado: en diapositivas de examenes tipo test, el modelo adopta como hechos las afirmaciones falsas que aparecen en la diapositiva.
- El test se limita a tres asignaturas (Marketing, Rechnungswesen, Explainable AI) y esta sesgado hacia economia de empresa; no hay evidencia de generalizacion a carreras tecnicas, cientificas o de humanidades.
- Idioma unico: aleman. El comportamiento en castellano u otras lenguas no esta documentado y previsiblemente degradara tanto el formato como la calidad del contenido.
- Dependencia de plataforma: solo MLX y Apple Silicon. No hay versiones GGUF ni soporte para CUDA, lo que bloquea el despliegue en servidores Linux con GPU.
- Fragilidad operativa del servidor: recargar el modelo con otro identificador desactiva el adaptador silenciosamente.
- Requiere un prompt de sistema concreto, leido con el escapado exacto de la aplicacion (`.read_text(encoding="utf-8").replace("\\", "\\\\").rstrip()`); desviarse de ese preprocesado altera la distribucion de entrada vista en entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero las diapositivas y el dataset no se publican por derechos de los docentes; el adaptador no transfiere ningun derecho sobre el material de origen.
- Sin descargas ni valoraciones en el momento de la consulta (0 descargas, 0 likes): no existe validacion independiente de los resultados reportados.
- No soporta tool calling, agentes ni razonamiento multi-paso; usarlo fuera de la tarea de generacion de tarjetas producira degradacion frente al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ericjoelr/qwen3-vl-4b-karteikarten-lora
- Modelo base: https://huggingface.co/mlx-community/Qwen3-VL-4B-Instruct-8bit
- Aplicacion KI-Karteikarten-Assistent: https://github.com/ericjoelr/KI-Karteikarten-Assistent
- Prompt de sistema usado en la aplicacion: https://github.com/ericjoelr/KI-Karteikarten-Assistent/blob/main/src/backend/prompts/system_prompt.txt
