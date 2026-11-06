# fabriziosalmi/Qwen3.5-2B-ita-agent-MLX-8bit

## Resumen

Qwen3.5-2B-ita-agent-MLX-8bit es un ajuste fino del modelo base Qwen/Qwen3.5-2B, publicado por fabriziosalmi, orientado a actuar como agente en italiano para herramientas MCP (Model Context Protocol) y terminal. El modelo parte de los pesos del Qwen3.5-2B en formato MLX cuantizado a 8 bits (group size 64) y se entrena mediante LoRA sobre conversaciones sintéticas verificadas, con posterior fusión del adaptador y recuantización. El resultado son aproximadamente 1.880 millones de parámetros almacenados en safetensors, con un repositorio de 2,0 GB.

El problema que aborda es la escasa fiabilidad de los modelos pequeños en tareas de agente: llamadas a herramientas encadenadas, aclaración de peticiones ambiguas, recuperación tras errores de herramienta y confirmación antes de acciones destructivas. El ajuste se centra en esos comportamientos dentro de entornos simulados italianos (ficheros, notas, calendario, web, terminal, fechas y cálculo de IVA), y no en generación de código, capacidad que el autor declara explícitamente fuera del alcance.

Su relevancia actual radica en que demuestra un ciclo completo de generación de datos, entrenamiento y evaluación ejecutado en hardware de consumo (dos Mac mini M4 de 16 GB en anillo), sin GPU alquilada y sin usar salidas de modelos cerrados en los datos de entrenamiento. La licencia Apache-2.0 y el formato MLX lo hacen directamente desplegable en Apple Silicon mediante mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B), ajuste LoRA fusionado, formato MLX |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenamiento con secuencias de hasta 3.072 tokens |
| Tipos de cuantizacion | 8 bits MLX con group size 64 (unica variante publicada) |
| Idiomas soportados | italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer del Qwen3.5-2B y conserva su plantilla de chat y el formato de llamada a herramientas `qwen3_coder`. El ajuste emplea LoRA de rango 16 y escala 20 aplicado a todas las capas, con tasa de aprendizaje 2e-5, 30 pasos de warmup, una época y secuencias de hasta 3.072 tokens. Se entrenaron 16,8 millones de parámetros en 3.322 pasos durante aproximadamente 8,4 horas sobre dos Mac mini M4 de 16 GB configurados en anillo, con promediado de gradientes en cada paso mediante MLX. La pérdida de validación final fue de 0,103.

Los datos proceden de Qwen3.5-4B en 8 bits (Apache-2.0) actuando como profesor en 61 familias de tareas sobre mundos italianos simulados, con inyección de fallos de herramienta en parte de las tareas. El conjunto final comprende 2.567 conversaciones y 3.576 ejemplos de clasificación de turno; una conversación solo se conserva si supera las comprobaciones del entorno. Las tareas de evaluación y los entornos exclusivos de test nunca aparecen en los datos, y una comprobación de contaminación de las peticiones de test contra el corpus no encontró copias. Tras el entrenamiento, el adaptador se fusiona con los pesos base y se recuantiza a 8 bits, lo que introduce una variación mínima: el adaptador sin fusionar obtenía 66/88 en dev y 230/296 en fresh5, frente a los resultados del modelo fusionado que se detallan abajo.

## Capacidades

- Llamada a herramientas (tool calling) en formato `qwen3_coder`, con esquemas JSON de herramientas MCP conectadas por el cliente.
- Clasificación del turno del usuario por parte del propio modelo en cuatro intenciones: responder, usar herramientas, preguntar o confirmar.
- Operaciones de ficheros mediante `replace_in_file` y `append_to_file`, además de veredicto sintáctico sobre ficheros JSON o Python leídos o escritos.
- Gestión de notas y eventos de calendario, con listado del calendario desde el día actual para los siete días siguientes.
- Cálculo de fechas y de IVA mediante herramientas específicas en italiano.
- Obtención de páginas web a través de herramientas.
- Confirmación antes de borrar o modificar datos, con ocultación y rechazo de herramientas destructivas durante los turnos de pregunta o confirmación.
- Recuperación tras errores de herramienta y resumen de información.
- Conversación general en italiano.
- Modo thinking: desactivado en entrenamiento y evaluación; se recomienda `enable_thinking=False`.
- Generación de código: no es un modelo de código según el autor.

## Casos de uso

- Asistente de terminal en italiano: el modelo interpreta peticiones como listar ficheros o editar un documento y emite llamadas `qwen3_coder` que el cliente ejecuta sobre herramientas de sistema, usando `replace_in_file` y `append_to_file` para evitar reescrituras completas de fichero.
- Gestión de notas y calendario personales: con las herramientas de notas y calendario conectadas, el modelo crea, consulta y modifica eventos, apoyándose en el listado de los próximos siete días incluido en el contexto para resolver referencias temporales relativas.
- Automatización administrativa con cálculo de IVA y fechas: las herramientas italianas de fechas e impuestos permiten respuestas verificables en lugar de cálculos aritméticos del propio modelo, reduciendo el riesgo de error en tareas fiscales sencillas.
- Extracción y resumen de páginas web: el modelo obtiene una página mediante la herramienta de web y resume su contenido en italiano, encadenando la llamada con una respuesta final.
- Flujos con confirmación obligatoria: en escenarios donde se borran o sobrescriben datos, el arnés clasifica el turno como pregunta o confirmación, oculta las herramientas destructivas y exige aprobación; el modelo preguntó antes de una acción destructiva en 10 de 10 tareas de seguridad en dev y en 24 de 26 en fresh5.
- Agente local en Apple Silicon: al estar en formato MLX 8 bits con 2,0 GB de repositorio, puede ejecutarse en un Mac con memoria unificada mediante mlx-lm, sin depender de servicios en la nube, lo que encaja en asistentes personales con datos locales.
- Integración en clientes MCP: cualquier cliente que hable MCP puede pasar los esquemas JSON de sus herramientas y recibir las llamadas en el formato del modelo base, lo que permite reutilizar servidores MCP existentes de ficheros, notas o calendario.

## Benchmarks y rendimiento

Todas las cifras son decodificación greedy sobre el modelo fusionado en 8 bits, salvo indicación contraria, en entornos simulados deterministas servidos como servidores MCP reales. Una tarea se considera superada solo si el estado del entorno y la respuesta pasan sus comprobaciones.

| Conjunto | Qwen3.5-2B 8 bits original | Este modelo |
|---|---|---|
| test, 112 tareas congeladas, con arnés | 48/112 (42,9 %) | 66/112 (58,9 %) |
| dev, 88 tareas escritas a mano, con arnés | 38/88 (43,2 %) | 65/88 (73,9 %) |
| dev, sin arnés (mlx-lm directo) | 37/88 (42,0 %) | 55/88 (62,5 %) |
| fresh5, 296 tareas generadas con semillas no usadas, con arnés | 96/296 (32,4 %) | 233/296 (78,7 %) |

Datos adicionales aportados por el autor: el adaptador sin fusionar alcanzó 66/88 en dev y 230/296 en fresh5. La seguridad (preguntar antes de borrar o sobrescribir) obtuvo 10/10 en dev y 24/26 en fresh5. En el test congelado, Qwen3.5-4B 8 bits original con el mismo arnés supera 72/112 tareas, por encima de este modelo aunque sin diferencia significativa (p = 0,43); en seguridad del test, este modelo pregunta antes de una acción destructiva en 9 de 11 tareas, frente a 3 de 11 del 2B original y del 4B original. El autor advierte que dev sobrerrepresenta al modelo en torno a 15 puntos porque guió el arnés y los datos. Puntos débiles en el test: cadenas de llamadas dependientes (2 de 10), aclaración de peticiones ambiguas (3 de 10) y recuperación tras error de herramienta (4 de 10).

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 2,0 GB en 8 bits, por lo que la inferencia requiere del orden de 2 a 3 GB de memoria para pesos y estado de ejecución, más el espacio de contexto.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon; el autor entrenó y evaluó en Mac mini M4 de 16 GB. No se documenta despliegue en A100, H100 ni RTX 4090 para estos pesos concretos.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; el propio autor lo ejecutó en Mac mini M4 de 16 GB.
- Opciones de despliegue: mlx-lm (librería declarada, con ejemplo de carga y generación en la model card). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para esta variante MLX.
- Latencia y throughput: no disponibles; el autor no publica cifras de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en test (112 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-2B-ita-agent-MLX-8bit) | 1,88 B | no disponible (entrenado a 3.072 tokens) | 66/112 (58,9 %) | Apache-2.0 | Hugging Face, formato MLX 8 bits |
| Qwen3.5-2B 8 bits original | 1,88 B | no disponible | 48/112 (42,9 %) | Apache-2.0 | Hugging Face, formato MLX 8 bits |
| Qwen3.5-4B 8 bits original | no disponible | no disponible | 72/112 (58,9 % equivalente en recuento, sin diferencia significativa, p = 0,43) | Apache-2.0 | Hugging Face, formato MLX 8 bits |

El modelo base y el profesor citados son los únicos comparables documentados por el autor; no se aportan datos de otros modelos de agente en italiano.

## Limitaciones y advertencias

- Evaluado únicamente en entornos simulados, no todavía en servidores MCP reales.
- Puntos débiles medidos en el test: cadenas de llamadas dependientes (2 de 10), aclaración de peticiones ambiguas (3 de 10) y recuperación tras error de herramienta (4 de 10).
- Sin el arnés, pregunta antes de una acción destructiva solo en la mitad de los casos (5 de 10 en seguridad de dev); conviene mantener las herramientas destructivas detrás de una confirmación en el cliente.
- Solo italiano; no se documenta soporte multilingüe.
- El modo thinking estuvo desactivado en entrenamiento y evaluación; activarlo puede degradar el comportamiento esperado.
- No es un modelo de código y no debe usarse como tal.
- El conjunto dev sobrerrepresenta el rendimiento en torno a 15 puntos, según el propio autor.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- Restricciones de licencia: Apache-2.0, sin restricciones comerciales conocidas más allá de las obligaciones de la licencia.
- La fusión y recuantización introducen variaciones menores frente al adaptador (1 tarea en dev y 5 en fresh5), atribuidas a ruido por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fabriziosalmi/Qwen3.5-2B-ita-agent-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor citado: Qwen3.5-4B (8 bits, Apache-2.0); no se proporciona URL en la información disponible.
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
