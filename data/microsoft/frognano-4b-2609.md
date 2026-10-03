# microsoft/FrogNano-4B-2609

## Resumen

FrogNano-4B-2609 es un agente de código a nivel de repositorio desarrollado por Microsoft Corporation, derivado del checkpoint generalista Qwen/Qwen3.5-4B. Se trata de un modelo denso de 32 capas con arquitectura híbrida de Gated DeltaNet y atención con compuerta (gated attention), de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones). Su especialización no proviene de destilación de modelos mayores, sino de un post-entrenamiento exclusivamente mediante aprendizaje por refuerzo sobre unas 1.500 tareas sintéticas de ingeniería de software generadas y calibradas contra la propia política con la herramienta TaskPilot.

El modelo opera a través del arnés ligero Leaf, un conjunto de cinco herramientas, y está pensado para resolver incidencias de repositorio a partir de descripciones en lenguaje natural y código fuente existente: navegación entre ficheros, depuración, edición de código, ejecución de comandos y pruebas, y generación iterativa de parches multi-fichero. Su contexto combinado soportado en la configuración evaluada es de aproximadamente 131K tokens, con hasta 8.192 tokens generados por turno del asistente.

Es relevante ahora porque demuestra que un modelo compacto de 4B puede abordar tareas de agente de software de horizonte largo sin recurrir a trazas de razonamiento de modelos más potentes, lo que reduce coste de inferencia y facilita el despliegue local. La fecha de publicación indicada es el 22 de septiembre de 2026, con entrenamiento entre junio y agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, 32 capas, híbrida Gated DeltaNet / gated-attention, causal LM |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | ~131K tokens (configuración de agente evaluada); hasta 8.192 tokens generados por turno |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible; los datos de entrenamiento son principalmente en inglés |
| Licencia | MIT segun la etiqueta de HuggingFace; Apache License 2.0 segun la model card (discrepancia no resuelta) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,3 GB |
| Modalidades de entrada | Solo texto en uso previsto y evaluado (los componentes de visión heredados no se post-entrenaron) |
| Dependencia upstream | Qwen/Qwen3.5-4B |
| Fechas de entrenamiento | Junio 2026 a agosto 2026 |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

FrogNano hereda la arquitectura de Qwen/Qwen3.5-4B: un modelo de lenguaje causal denso de 32 capas que combina Gated DeltaNet (una variante de atención lineal con estado recurrente) y capas de atención con compuerta. Esta mezcla busca mantener eficiencia en contextos largos sin renunciar a la capacidad de atención completa. El checkpoint upstream incluye componentes de visión e imagen/vídeo, pero FrogNano no los post-entrenó ni los evaluó, por lo que no se declaran como soportados.

El post-entrenamiento adicional es exclusivamente de texto y se centró en ingeniería de software a nivel de repositorio mediante aprendizaje por refuerzo sobre aproximadamente 1.500 entornos de tareas SWE sintéticas, generadas, validadas y calibradas contra la política en evolución con TaskPilot. Las recompensas se basan en tests ejecutables sobre trayectorias de codificación multi-turno completas, con el arnés de cinco herramientas Leaf. Un punto diferencial explícito es que no se emplearon trayectorias de solución, acciones, trazas de razonamiento ni parches objetivo procedentes de modelos más fuertes (sin destilación de comportamiento). El proceso tampoco usó conjuntos dedicados de preferencias de seguridad, rechazo, contenido dañino o adversarial, por lo que no debe considerarse alineado de forma independiente para despliegue autónomo sin supervisión.

## Capacidades

- Resolución de incidencias de software a nivel de repositorio a partir de descripciones en lenguaje natural y del código fuente existente.
- Navegación de base de código y comprensión entre ficheros, depuración, corrección de errores e implementación de funcionalidades acotadas.
- Generación de llamadas estructuradas a las cinco herramientas del arnés Leaf, que se ejecutan en un entorno de repositorio aislado (inspección y búsqueda de ficheros, edición de código, ejecución de comandos de shell y ejecución de pruebas).
- Generación y refinamiento iterativo de parches multi-fichero usando la realimentación de comandos y tests.
- Procesamiento de contexto largo sobre texto y código, con contexto combinado de aproximadamente 131K tokens.
- Generación de texto en lenguaje natural, texto de razonamiento, código fuente y llamadas a herramientas estructuradas, hasta 8.192 tokens por turno.
- Capacidades multimodales (visión, imagen, vídeo): heredadas del checkpoint upstream, pero no post-entrenadas ni evaluadas en FrogNano; no se declaran como soportadas.
- Capacidades multilingües: no disponibles; los datos de entrenamiento son principalmente en inglés y centrados en Python.

## Casos de uso

- Corrección de errores en repositorios de producción: dado un informe de fallo en inglés y una instantánea autorizada del repositorio, el modelo inspecciona ficheros, localiza la causa, aplica una edición y ejecuta los tests existentes para producir un parche candidato que después revisa un humano.
- Implementación de funcionalidades acotadas: a partir de un ticket descriptivo, el modelo navega entre ficheros relacionados, propone los cambios necesarios y valida su comportamiento con la batería de pruebas del propio repositorio.
- Corrección de regresiones: con el contexto de ~131K tokens puede cargar fragmentos amplios del repositorio y los resultados de tests fallidos, correlacionar cambios recientes y generar un parche que restaure el comportamiento previo.
- Mantenimiento guiado por pruebas (test-driven maintenance): el modelo usa la ejecución de tests como señal de realimentación en bucle, refinando el parche hasta que las pruebas pasan, lo que encaja en flujos de CI/CD con revisión humana obligatoria.
- Investigación sobre agentes de codificación de horizonte largo: su tamaño compacto y su entrenamiento exclusivo por RL lo convierten en una plataforma controlada para estudiar navegación multi-paso, uso de herramientas y planificación sin destilación de modelos mayores.
- Asistencia de desarrollo supervisada en escritorio: al ser un modelo de ~4B, puede ejecutarse localmente en hardware de consumo y servir como asistente de terminal para explorar y modificar repositorios, siempre con revisión de los parches.
- Automatización de triaje de incidencias: el modelo puede leer la descripción de un issue y recorrer el repositorio para producir un diagnóstico y un parche preliminar, reduciendo el trabajo de localización previo a la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo denso de ~4,66B parámetros ocupa aproximadamente 9,3 GB en FP16/BF16 (coincide con el tamaño del repositorio de pesos safetensors), alrededor de 4,7 GB en cuantización de 8 bits y en torno a 2,5-3 GB en cuantizaciones de 4 bits, aunque el repositorio solo publica safetensors y no se confirman cuantizaciones oficiales.
- GPU recomendadas: no especificadas por el autor. Para BF16 completo encajan GPUs con 16 GB o más de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100). Con cuantización de 8 o 4 bits podría ejecutarse en GPUs de consumo de 8-12 GB, aunque esto no está confirmado por el autor.
- Cabe en GPU de consumo: probable en GPUs con 16 GB o más en BF16 (por ejemplo, RTX 4090 o RTX 5080); en 8-12 GB requeriría cuantización no publicada oficialmente.
- Opciones de despliegue: no confirmadas por el autor. Los formatos publicados son safetensors, compatibles con servidores de inferencia (vLLM, TGI) y con conversión a GGUF para llama.cpp/Ollama, pero no se documentan recetas oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FrogNano-4B-2609 | 4,66B (denso) | ~131K tokens | Agente de código a nivel de repositorio (post-entrenamiento por RL) | MIT (etiqueta HF) / Apache 2.0 (model card) | HuggingFace: microsoft/FrogNano-4B-2609 |
| Qwen/Qwen3.5-4B | ~4B (denso) | No disponible | Modelo generalista de lenguaje, razonamiento, código, agente y multimodal | No disponible | HuggingFace: Qwen/Qwen3.5-4B |
| Otros agentes de código de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion de rendimiento con alternativas de la misma categoria no esta disponible, ya que no se han publicado resultados de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia fuerte del arnés Leaf: el rendimiento es sensible a la configuración del arnés y a la calidad de los tests; fuera de ese entorno los resultados pueden degradarse.
- Sesgo de dominio: los datos de entrenamiento son predominantemente Python y principalmente en inglés, lo que limita su eficacia en otros lenguajes de programación o idiomas.
- Riesgo de alucinacion en parches: el modelo puede generar parches incorrectos o inseguros aunque superen los tests disponibles, ya que las recompensas se basan en tests ejecutables y no garantizan corrección o seguridad.
- Ausencia de alineacion de seguridad especifica: el post-entrenamiento no usó conjuntos de preferencias de seguridad, rechazo, contenido dañino ni adversarial, por lo que no debe considerarse alineado de forma independiente para despliegue autónomo sin supervisión.
- Discrepancia de licencia: la etiqueta de HuggingFace indica MIT, mientras que la model card declara Apache License 2.0; conviene verificar los términos aplicables antes de uso comercial, ya que además se derivan obligaciones de atribución de Qwen/Qwen3.5-4B.
- Contexto: los ~131K tokens corresponden a la configuración de agente evaluada; no está claro que se mantenga ese contexto en otros modos de uso.
- Limitacion multimodal: los componentes de visión heredados no fueron post-entrenados ni evaluados, por lo que no deben usarse como capacidad soportada.
- Necesidad de revision humana: los parches generados requieren revisión, pruebas de regresión y validación de seguridad antes de cualquier despliegue; el modelo no despliega cambios por sí mismo.
- Datos de adopcion escasos: 2 descargas y 13 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- HuggingFace: https://huggingface.co/microsoft/FrogNano-4B-2609
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Informe tecnico: https://aka.ms/frognano-tech-report
- Repositorio y arnés Leaf: https://github.com/microsoft/FrogNano
