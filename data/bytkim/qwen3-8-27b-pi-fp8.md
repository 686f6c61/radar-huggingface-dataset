# bytkim/Qwen3.8-27B-pi-FP8

## Resumen

Qwen3.8-27B-pi es un ajuste fino del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario bytkim y publicado en Hugging Face. Está especializado en tareas de programación agéntica dentro del arnés de agentes Pi: leer repositorios, editar ficheros, ejecutar herramientas e iterar sobre la realimentación que estas devuelven. El objetivo declarado es completar más trabajo con menos texto generado, manteniendo la interfaz del modelo base.

El modelo conserva la arquitectura del Qwen3.8-27B original (familia Qwen3.5, transformer multimodal con soporte de imagen y texto), con 27.781.427.952 parámetros totales según los pesos en safetensors. Esta versión concreta se distribuye cuantizada en FP8, lo que reduce el tamaño del repositorio a 34,7 GB frente a los aproximadamente 55 GB que ocuparía en BF16, y está pensada para servirse con vLLM aprovechando decodificación especulativa mediante multi-token prediction (MTP).

La relevancia actual del modelo reside en su enfoque de entrenamiento: ajuste supervisado sobre sesiones exitosas y filtradas del arnés Pi, seguido de una etapa de aprendizaje por refuerzo con GRPO que incorpora una recompensa personalizada de eficiencia de razonamiento. Esto permite ajustar el esfuerzo de razonamiento entre niveles bajo, medio y xhigh, equilibrando latencia y corrección en flujos de trabajo de coding en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia qwen3_5), con multi-token prediction (MTP) para decodificacion especulativa |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun el comando de despliegue con `--max-model-len 262144`) |
| Tipos de cuantizacion | FP8 (esta version); BF16 y GGUF disponibles en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal de la familia qwen3_5 que procesa texto e imágenes (pipeline image-text-to-text). Incorpora multi-token prediction (MTP), utilizado aquí como método de decodificación especulativa en vLLM con tres tokens especulativos por paso, lo que acelera la generación sin cambiar la distribución objetivo. Esta versión está cuantizada en FP8, presumiblemente con escalas calibradas, aunque la model card no detalla el esquema exacto de cuantización.

El entrenamiento se organizó en etapas. Primero, curación de trayectorias del arnés Pi y ajuste supervisado (SFT) sobre sesiones exitosas y filtradas, de modo que el modelo aprenda flujos completos de trabajo —inspeccionar el código, aplicar un cambio, comprobar el resultado y adaptarse al entorno existente— en lugar de respuestas aisladas. Después, una etapa de aprendizaje por refuerzo con GRPO que combina resultados verificados de las tareas con una recompensa personalizada de eficiencia de razonamiento, incentivando soluciones económicas en esfuerzos bajo y medio y reservando el nivel xhigh para maximizar corrección. La evaluación de checkpoints se hizo con resultados reales de agente junto a tokens generados, llamadas a herramientas y tiempo de completado, no solo con la pérdida de entrenamiento.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo ajustables (bajo, medio, xhigh), incluyendo modo thinking y no-thinking.
- Generación y edición de código en flujos agénticos: lectura de repositorios, modificación de ficheros y verificación de resultados.
- Tool calling y function calling, con parsers dedicados en vLLM (`qwen3_xml`) y elección automática de herramientas.
- Ejecución de agentes multi-paso con realimentación de herramientas dentro del arnés Pi.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text).
- Razonamiento matemático y científico orientado a problemas de nivel experto (evaluado en GPQA Diamond y SciCode).
- Decodificación especulativa mediante MTP para reducir latencia.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de coding autónomo en el arnés Pi: el modelo lee un repositorio, localiza el fallo, aplica un parche y ejecuta las comprobaciones pertinentes, iterando sobre la salida de las herramientas hasta completar la tarea con un número reducido de tokens de salida.
- Integración en pipelines de CI/CD: con tool calling y parser `qwen3_xml`, puede invocarse desde vLLM para triar fallos de tests, proponer correcciones y validarlas contra el propio pipeline antes de abrir una pull request.
- Asistente de refactorización en entornos existentes: el ajuste sobre sesiones reales le permite adaptarse a convenciones y estructura del proyecto en lugar de generar código genérico, comprobando después que el resultado cumple los requisitos.
- Depuración interactiva con esfuerzo variable: en tareas sencillas se usa el nivel bajo o medio para responder rápido; ante fallos complejos se escala a xhigh para priorizar corrección, con un coste en tokens conocido de antemano.
- Automatización de tareas de terminal: el modelo fue evaluado en Terminal-Bench 2.1, por lo que encaja en agentes que operan sobre shell, ejecutan comandos y reaccionan a su salida.
- Análisis de documentación técnica con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o errores visuales junto al texto del repositorio para diagnosticar problemas.
- Servicio de inferencia de alta concurrencia con FP8: el formato cuantizado y la decodificación especulativa MTP permiten desplegar el modelo en vLLM con menor huella de memoria y mayor throughput que la versión BF16.

## Benchmarks y rendimiento

La model card presenta resultados en forma de gráficas (imágenes) sin tablas numéricas completas. Los datos textuales disponibles son los siguientes:

| Benchmark | Resultado disponible |
|---|---|
| Terminal-Bench 2.1 | Pi muestra una subida más constante de low a xhigh que el base y menos tokens de salida en cada nivel de esfuerzo; en medium iguala la tasa de completado de Base en xhigh con aproximadamente un 41 % menos de tokens de salida |
| GPQA Diamond | Pi alcanza la puntuación más alta en xhigh; Base conserva la ventaja en esfuerzo medium; la tasa de intentos superados se mueve en el rango del 75-90 % según el eje de la gráfica |
| SciCode | Pi resuelve más subproblemas que Base en todos los niveles; en xhigh obtiene mayor puntuación con aproximadamente un 23 % menos de tokens de salida; en medium su mayor puntuación requiere más tokens |

No se han publicado en la información disponible cifras absolutas de MMLU, HumanEval, GSM8K ni de Terminal-Bench 2.1, por lo que no se incluyen valores numéricos concretos para esos benchmarks.

## Requisitos de hardware

- VRAM estimada para FP8: en torno a 28-30 GB solo para pesos, más caché KV para el contexto. Con 262.144 tokens de contexto la caché KV crece de forma significativa; el ejemplo de la model card usa `--max-num-seqs 1` precisamente para contenerla.
- GPU recomendadas: H100 80 GB o A100 80 GB para contexto largo y varias secuencias; L40S 48 GB o RTX 6000 Ada 48 GB para FP8 con contexto moderado.
- GPU de consumo: una RTX 4090 de 24 GB no permite cargar los pesos FP8 completos (unos 28 GB); sería necesario recurrir a la versión GGUF con cuantización inferior en llama.cpp u Ollama.
- Opciones de despliegue: vLLM es la vía documentada, con `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`. También hay repositorio GGUF para llama.cpp/Ollama y compatibilidad con text-generation-inference según los tags.
- Latencia y throughput: no disponibles como cifras absolutas; la decodificación especulativa MTP con tres tokens y la cuantización FP8 están orientadas a reducirlos frente a BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bytkim/Qwen3.8-27B-pi-FP8 | 27,8 B | 262.144 | FP8 safetensors | Apache 2.0 | Ajuste para arnés Pi con SFT + GRPO; eficiencia de razonamiento |
| bytkim/Qwen3.8-27B-pi (BF16) | 27,8 B | 262.144 | BF16 safetensors | Apache 2.0 | Mismo ajuste sin cuantizar; mayor huella de memoria |
| bytkim/Qwen3.8-27B-pi-GGUF | 27,8 B | 262.144 | GGUF | Apache 2.0 | Cuantizaciones calibradas con sesiones completas de Pi; para llama.cpp/Ollama |
| Qwen/Qwen3.8-27B (base) | 27,8 B | 262.144 | safetensors | Apache 2.0 | Modelo base sin ajuste para Pi; referencia en las gráficas de benchmark |

No se dispone de datos en la información proporcionada para comparar con modelos de otros desarrolladores de tamaño o tarea equivalente.

## Limitaciones y advertencias

- El ajuste está orientado al arnés Pi; fuera de ese bucle de agente el rendimiento puede diferir del reportado, y la model card no documenta evaluaciones en otros entornos.
- Los benchmarks se presentan como gráficas sin cifras absolutas ni detalles de protocolo, lo que dificulta la reproducibilidad y la comparación independiente.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en referencias a APIs, ficheros o funciones inexistentes durante la edición de código.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.8-27B hereda los del modelo base, que no se detallan.
- Idiomas soportados: no disponibles; no se confirma el alcance multilingüe más allá de lo que herede del base.
- La cuantización FP8 puede introducir degradaciones menores frente a BF16; la model card no cuantifica la pérdida.
- El contexto de 262.144 tokens exige una caché KV considerable; configuraciones con muchas secuencias simultáneas pueden agotar la VRAM.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de los datos de entrenamiento empleados en el ajuste.
- El repositorio tiene un volumen de descargas y likes reducido (755 descargas, 6 likes en el momento de la consulta), por lo que la validación por parte de la comunidad es todavía limitada.

## Enlaces

- Modelo en Hugging Face (FP8): https://huggingface.co/bytkim/Qwen3.8-27B-pi-FP8
- Versión BF16: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Versión GGUF: https://huggingface.co/bytkim/Qwen3.8-27B-pi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
