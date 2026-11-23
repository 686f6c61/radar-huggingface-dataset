# mjvalder/fs2d-assistant-qwen3.5-2b

## Resumen

fs2d-assistant:qwen3.5-2b es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-2B, desarrollado por mjvalder, orientado a actuar como asistente dentro de la interfaz gráfica de FrictionSim2D, una aplicación que configura simulaciones de fricción de materiales bidimensionales en LAMMPS. El modelo no es de propósito general: está entrenado para invocar las herramientas de la GUI (configurar ejecuciones AFM y hoja-sobre-hoja, barridos de parámetros, buscar estructuras y potenciales, consultar bases de datos de materiales, resumir y graficar resultados) y para no escribir ficheros ni lanzar trabajos por sí mismo, dejando toda propuesta de cambio a confirmación del usuario.

Con 1.942.653.248 parámetros (aproximadamente 2B), el modelo parte de la arquitectura de Qwen3.5-2B y se distribuye como pesos fusionados en formato GGUF Q4_K_M (1,3 GB), junto con un Modelfile para Ollama y un manifest.json que la GUI usa para verificar el modelo base, el hash del esquema de herramientas y el sha256 de los pesos. La licencia es Apache-2.0, igual que la del modelo base.

Su relevancia radica en que demuestra un caso de ajuste fino muy específico de dominio científico (tribología y ciencia de materiales) con un conjunto de datos sintético generado ejecutando las herramientas reales de la aplicación, y con una evaluación automatizada propia que mide el estado final dejado por el asistente. Según la model card, alcanza un 86,3 % de pass@1 frente al 48,9 % del Qwen3.5-2B sin ajustar con el mismo prompt.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B; detalles internos de la arquitectura base no disponibles) |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16k tokens (configurado en el Modelfile de Ollama) |
| Tipos de cuantización | Q4_K_M (único peso publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (model.gguf), más Modelfile y manifest.json |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (rango 16, alpha 32, tasa de aprendizaje 2e-4, 1 época) sobre Qwen/Qwen3.5-2B, realizado con Unsloth. El conjunto de entrenamiento consta de 6961 conversaciones sintéticas (denominadas «data p9-k») con el modo de razonamiento (thinking) desactivado. Las conversaciones se generaron ejecutando las herramientas reales de la GUI de FrictionSim2D; las peticiones de usuario y las respuestas finales fueron redactadas por Qwen3-14B (Apache-2.0). Aproximadamente una de cada nueve conversaciones incluye una llamada a herramienta inválida seguida del error devuelto por la herramienta y la llamada corregida, aunque la función de pérdida cubre únicamente los turnos del asistente y nunca las llamadas inválidas. Las peticiones parecidas al conjunto de evaluación fueron eliminadas del entrenamiento.

El entrenamiento se realizó con el mismo system prompt que envía la aplicación y con la lista de herramientas renderizada tal como la presenta Ollama. Los pesos publicados son los fusionados (merged), cuantizados a Q4_K_M. No se documentan innovaciones arquitectónicas propias más allá del ajuste LoRA; las características de atención y decodificación heredan las del modelo base Qwen3.5-2B, cuyos detalles no se recogen en la información disponible.

## Capacidades

- Generación de texto conversacional orientada a tareas de configuración de simulaciones de fricción en LAMMPS.
- Llamada a herramientas (tool calling / function calling) contra el esquema de herramientas específico de FrictionSim2D: configuración de ejecuciones AFM y hoja-sobre-hoja, barridos de parámetros, búsqueda de estructuras y potenciales, consultas a bases de datos de materiales, resumen y graficación de resultados.
- Razonamiento multi-paso dentro del flujo de la GUI: encadenar varias llamadas a herramientas para completar una petición compuesta.
- Manejo de errores de herramienta: el modelo fue entrenado con ejemplos de llamadas inválidas seguidas de corrección, por lo que puede recuperarse de errores devueltos por las herramientas.
- Capacidad de declinar peticiones y de formular preguntas de aclaración cuando la solicitud es ambigua (grupos de evaluación «declines» y «requests that must be asked back»).
- Conocimiento de dominio sobre tribología y ciencia de materiales de dos dimensiones, inyectado mediante el system prompt y el corpus de entrenamiento.
- Modo thinking desactivado durante el entrenamiento y el uso previsto.
- Sin capacidades de visión, audio ni generación de código de propósito general documentadas.

## Casos de uso

- Configuración asistida de simulaciones AFM en FrictionSim2D: el usuario describe en lenguaje natural la superficie, la punta y los parámetros deseados, y el modelo emite las llamadas a herramientas que rellenan el formulario de la GUI, dejando cada cambio pendiente de confirmación.
- Configuración de simulaciones hoja-sobre-hoja (sheet-on-sheet): el modelo traduce peticiones como «simula dos capas de MoS2 con esta pila y este potencial» en las llamadas necesarias para seleccionar estructuras, potenciales y parámetros de la ejecución.
- Barridos de parámetros: el usuario pide explorar un rango de valores (por ejemplo, velocidad de deslizamiento o carga normal) y el modelo genera la configuración del barrido mediante las herramientas correspondientes.
- Búsqueda de estructuras y potenciales: el modelo consulta el catálogo de estructuras y potenciales disponible en la GUI para localizar el material o el potencial interatómico adecuado a partir de una descripción del usuario.
- Consulta a bases de datos de materiales: el modelo formula consultas a las bases de datos integradas para recuperar propiedades o materiales candidatos, y presenta los resultados al usuario.
- Resumen y graficación de resultados: tras una ejecución, el usuario pide un resumen o una gráfica de magnitudes como la fuerza de fricción frente al desplazamiento, y el modelo invoca las herramientas de análisis y visualización.
- Peticiones compuestas de gran tamaño: la model card documenta una petición con 14 ajustes en un solo mensaje (cribado AFM de 156 materiales), de la que el modelo resolvió 10 de 14 ajustes con una única llamada de configuración.
- Asistente docente o de laboratorio: al ser un modelo de 2B cuantizado a 1,3 GB, puede desplegarse localmente en estaciones de trabajo con GPU modesta para guiar a estudiantes en la preparación de simulaciones sin depender de servicios en la nube.

## Benchmarks y rendimiento

Evaluación propia de FrictionSim2D: 74 peticiones guionizadas en diez grupos (configuración, análisis, conocimiento de dominio, base de datos de materiales, materiales, espacio de trabajo, declinaciones, parámetros, barridos y peticiones que deben devolverse como pregunta), puntuadas automáticamente según el estado final que dejan, tres ejecuciones por petición, sobre una NVIDIA RTX A4000.

| Modelo | pass@1 (73 peticiones núcleo) | Todas las ejecuciones | Tiempo mediano por turno |
|---|---|---|---|
| fs2d-assistant:qwen3.5-2b | 86,3 % | 192/222 | 0,9 s |
| Qwen/Qwen3.5-2B sin ajustar (mismo prompt) | 48,9 % | no disponible | no disponible |

Prueba adicional documentada: una petición larga y compuesta (cribado AFM de 156 materiales con 14 ajustes en un solo mensaje) resolvió 10 de los 14 ajustes en una única llamada de configuración; quedaron fuera los recuentos de capas, el apilamiento, el muelle de arrastre y la opción de un script por carga.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con la cuantización Q4_K_M publicada (1,3 GB de pesos más overhead de contexto y caché KV); con 16k de contexto la caché KV añade una cantidad modesta pero no cuantificada en la documentación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el contexto configurado; la evaluación se realizó en una NVIDIA RTX A4000.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, y previsiblemente en muchas integradas con suficiente memoria compartida, aunque no se documenta este último caso.
- Opciones de despliegue: Ollama (versión 0.40.7 o superior) es el método previsto, usando el Modelfile incluido; también es posible servir el GGUF con llama.cpp u otros runners compatibles con GGUF, aunque la model card advierte que debe usarse el Modelfile y no la plantilla de chat autogenerada por Ollama a partir del GGUF.
- Latencia y throughput: 0,9 s de tiempo mediano por turno en una RTX A4000 según la evaluación del autor; no se publican cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fs2d-assistant:qwen3.5-2b | 1,94B | 16k (Modelfile) | 86,3 % pass@1 en la evaluación de FrictionSim2D | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-2B (base sin ajustar) | ~2B | no disponible | 48,9 % pass@1 con el mismo prompt | Apache-2.0 | Hugging Face |
| Qwen3-14B (generador de datos del ajuste) | 14B | no disponible | no evaluado en esta tarea | Apache-2.0 | Hugging Face |

No se dispone de datos de otros asistentes de dominio comparable (por ejemplo, ajustes para otras GUIs científicas) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: espera el system prompt del asistente de FrictionSim2D (reglas más un texto de referencia) y las definiciones de herramientas de la GUI; fuera de ese contexto su comportamiento no está garantizado.
- Solo soporta inglés según la model card; no se documenta soporte de castellano ni de otros idiomas.
- El uso correcto requiere el Modelfile incluido: emplear `ollama pull hf.co/...` construye la plantilla de chat a partir del GGUF y no coincide con la forma en que se entrenó el modelo, lo que degrada los resultados.
- Está acoplado a un hash concreto del esquema de herramientas (verificado por manifest.json); si la GUI cambia sus herramientas, el modelo puede emitir llamadas inválidas.
- Riesgo de alucinación en consultas de dominio o de bases de datos: el modelo puede proponer estructuras, potenciales o parámetros inexistentes, aunque el flujo de la GUI exige confirmación del usuario antes de aplicar cambios.
- Sesgos heredados del modelo base Qwen3.5-2B y de los datos sintéticos generados por Qwen3-14B, no evaluados en la documentación.
- El conjunto de entrenamiento es sintético y de dominio estrecho (6961 conversaciones); la generalización a peticiones muy distintas de las del corpus no está medida.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen/Qwen3.5-2B.
- En producción, la evaluación se limita a 74 peticiones guionizadas en una sola GPU; no hay datos de robustez ante entradas adversarias ni de comportamiento con contextos cercanos al límite de 16k.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mjvalder/fs2d-assistant-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de FrictionSim2D: https://github.com/mjvalder/FrictionSim2D
