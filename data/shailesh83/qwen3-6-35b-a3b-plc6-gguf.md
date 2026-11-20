# shailesh83/Qwen3.6-35B-A3B-plc6-GGUF

## Resumen

Qwen3.6-35B-A3B-plc6-GGUF es una cuantización GGUF publicada por el usuario shailesh83 sobre el modelo base Qwen/Qwen3.6-35B-A3B, a la que se le ha fusionado un LoRA especializado en programación de autómatas programables (PLC) en el entorno CODESYS. El ajuste cubre Structured Text (IEC 61131-3), generación de JSON de Ladder Diagram, JSON de visualización HMI en el formato actual de CODESYS y llamadas a herramientas a través del servidor MCP de CODESYS empleado por opencode.

El interés de esta ficha es doble: por un lado documenta un caso de especialización vertical de un modelo grande mediante LoRA sobre una cuantización de 4 bits (UD-Q4_K_XL de unsloth), y por otro aporta mediciones propias del autor sobre tareas de ingeniería industrial, un dominio donde los benchmarks generalistas tienen poco poder predictivo. El autor reporta mejoras notables frente al modelo base en generación de Ladder JSON (de 0 % a 90 % de acierto estricto) y en llamadas a herramientas CODESYS (de 85,9-92,2 % a 96,9 %).

La relevancia práctica es limitada por su naturaleza: es un artefacto de un solo autor, sin pipeline declarado, sin idiomas declarados y con cero descargas en el momento de la consulta. Debe tratarse como una prueba de concepto reproducible más que como un modelo listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Qwen3.6-35B-A3B; LoRA fusionado sobre cuantización GGUF |
| Parametros totales | 35B (según nomenclatura del modelo base); el campo de parametros del repo (10.584.064) no es coherente con el tamano del archivo y se considera no fiable |
| Parametros activos | A3B, aproximadamente 3B activos por token (según nomenclatura del modelo base) |
| Longitud de contexto | 65.536 tokens en la configuración de referencia del autor (`-c 65536`) |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL con tensores tocados por el LoRA en Q8_0; proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA en GGUF para uso con `--lora` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos de 35B parámetros totales y aproximadamente 3B activos por token. Sobre él se entrenó un LoRA de rango 16 aplicado a las proyecciones de atención y a la MLP de expertos compartidos, con dos ejecuciones de 1.402 y 694 ejemplos respectivamente, sobre 3x RTX 3090. El adaptador resultante se fusionó en la cuantización UD-Q4_K_XL de unsloth, manteniendo los tensores afectados en Q8_0 para preservar la precisión del ajuste; el tamano final coincide con el del archivo base (22,85 GB).

El autor incluye además una cabeza de draft (MTP) dentro del propio archivo GGUF, lo que permite decodificación especulativa sin descargar un modelo borrador separado, y una lista corta de tokens (`shortlist_plc_96k.txt`) para acelerar esa decodificación en su fork de llama.cpp. El paquete se completa con un proyector de visión F16 copiado sin modificar del repo de unsloth, necesario solo para entrada de imágenes (mockups de HMI). No se documentan en la información disponible los datos de preentrenamiento del modelo base, la composición del dataset del LoRA ni si hubo RLHF o DPO.

## Capacidades

- Generación de código Structured Text conforme a IEC 61131-3 para CODESYS.
- Generación de JSON de Ladder Diagram en el formato que consume CODESYS.
- Generación de JSON de visualización HMI en el formato actual de CODESYS.
- Llamadas a herramientas (tool calling) contra el servidor MCP de CODESYS, orientadas al flujo de trabajo de opencode.
- Modo de razonamiento activable y desactivable (`--reasoning on` / `--reasoning off`), con preservación del bloque de razonamiento (`--reasoning-preserve`).
- Entrada de imágenes mediante el proyector `mmproj-F16.gguf`, pensada para interpretar mockups de HMI (un mockup de 1.000 x 700 px consumió 564 tokens de prompt).
- Decodificación especulativa con cabeza MTP interna y modo n-grama (`ngram-mod`), sin modelo borrador externo.
- Capacidades multilingües: no disponible.

## Casos de uso

- Migración de lógica de control a Structured Text: el modelo puede tomar una descripción funcional o un listado de variables y devolver un bloque ST conforme a IEC 61131-3, reduciendo el trabajo mecánico de transcripción en proyectos CODESYS.
- Generación automatizada de Ladder Diagram en JSON: con un 90 % de acierto estricto en las 60 tareas del autor frente al 0 % del base, es adecuado para prototipar lógica de contactos que luego se importa en CODESYS y se revisa manualmente.
- Creación de pantallas HMI a partir de mockups: combinando el proyector de visión con la generación de JSON de visualización, se puede partir de una imagen de referencia y obtener la definición de pantalla en el formato actual de CODESYS (90,0 / 93,3 % en las pruebas del autor).
- Asistencia dentro de opencode con el servidor MCP de CODESYS: el modelo puede encadenar llamadas a herramientas para inspeccionar el proyecto, crear objetos y consultar resultados, con un 96,9 % de acierto en las 64 tareas de tool calling medidas.
- Revisión y reparación de código PLC existente: el bucle de reparación en tres rondas del benchmark Agents4PLC sugiere uso en pipelines que detectan errores de compilación y piden al modelo una corrección iterativa.
- Formación y documentación técnica: generar ejemplos de bloques de función, descripciones de variables y estructuras de programa para material didáctico de automatización, siempre con revisión por un ingeniero.
- Despliegue en estación de trabajo con GPU integrada: con 46 tokens/s de decodificación en una Arc B390 y 61 GiB de RAM, es viable como asistente local en un portátil de gama alta sin GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre Panther Lake (Arc B390 iGPU, 61 GiB RAM), con razonamiento desactivado / activado:

| Test | Base Qwen3.6 UD-Q4_K_XL | plc6 |
|---|---|---|
| Agents4PLC, paso estricto, 117 tareas, 3 rondas de reparación | 65,0 / 72,6 % | 73,5 / 72,6 % |
| Llamadas a herramientas CODESYS, 64 tareas | 85,9-92,2 / 82,8 % | 96,9 / 92,2 % |
| Ladder Diagram JSON, 60 tareas | 0 / 0 % | 90,0 / 86,7 % |
| HMI JSON, formato actual, 60 tareas | 53,3 % / no ejecutado | 90,0 / 93,3 % |

Rendimiento de inferencia medido por el autor: 46 tokens/s de decodificación (3 prompts x 2 semillas, 3.600 tokens cada uno) y 48 tokens/s de media en una sesión de opencode de 50 minutos con contextos de entre 9k y 52k tokens. Los tests de herramientas, Ladder y HMI son tareas held-out propias del autor, generadas con los mismos generadores que los datos de entrenamiento, por lo que no son comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM/RAM: el archivo principal ocupa 22,85 GB; con el proyector de visión (0,90 GB) y overhead de contexto KV cache a 65.536 tokens, se recomienda un mínimo de 32 GB de memoria unificada o VRAM y 48-64 GB para trabajar con contextos largos.
- GPU recomendadas: el autor lo validó en una iGPU Intel Arc B390 con 61 GiB de RAM del sistema mediante build SYCL de llama.cpp. En GPU dedicada, una RTX 4090 (24 GB) queda justa para el archivo solo y obliga a descargar capas a RAM; A100 40/80 GB y H100 permiten mantener todo el modelo y contexto largo en VRAM.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con descarga parcial de capas a RAM del sistema; en GPUs de 16 GB o menos requiere offload agresivo y pierde velocidad de forma notable.
- Opciones de despliegue: llama.cpp (build SYCL para Intel, también CUDA/Metal), servidor `llama-server` con API compatible con OpenAI. No se documenta soporte para vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 46 tokens/s de decodificación y 48 tokens/s de media en sesión agéntica, medidos en la configuración del autor con decodificación especulativa activada (MTP + n-grama). Sin esa configuración, el rendimiento será inferior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización PLC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-plc6 (este) | 35B totales / ~3B activos | 65.536 tokens (config. autor) | Sí, LoRA fusionado | Apache 2.0 | GGUF en HF, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos | no disponible | No | Apache 2.0 | Disponible en HF |
| unsloth/Qwen3.6-35B-A3B-GGUF | 35B totales / ~3B activos | no disponible | No | Apache 2.0 | GGUF cuantizado, mantenido por unsloth |

La comparación relevante es contra el modelo base y su cuantización de unsloth: el LoRA no cambia tamano ni licencia, solo el comportamiento en tareas CODESYS. No se dispone de datos para comparar con otros modelos especializados en PLC o IEC 61131-3.

## Limitaciones y advertencias

- Una página HMI completa de 88 elementos (unos 13.000 tokens de salida) no superó la comprobación estricta de formato en 6 intentos.
- En la sesión de opencode el modelo escribió un bloque de función como objeto Ladder vacío y lo reportó como completado; es imprescindible verificar los resultados antes de aceptarlos.
- Los benchmarks son tareas held-out generadas por el mismo autor con los mismos generadores que los datos de entrenamiento, lo que puede inflar los resultados respecto a código PLC real y diverso.
- El adaptador LoRA en tiempo de ejecución solo es compatible con el archivo base cuyo sha256 es `55983c5a75a1ab969824077b3bb3de4146e82a9234072b48ad4e8f92ad3fe9f1`; el archivo en el repo de unsloth fue reemplazado posteriormente.
- Riesgo de alucinación en APIs de CODESYS y en la semántica de instrucciones IEC 61131-3: el modelo puede generar construcciones sintácticamente válidas pero funcionalmente incorrectas.
- Sesgos conocidos: no disponible; el autor no documenta evaluación de sesgos.
- Idiomas soportados: no disponible; el autor no declara cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base Qwen conviene revisar los términos del modelo original y las obligaciones de atribución.
- Repo sin descargas ni likes y con pipeline no declarado: no hay evidencia de terceros que hayan reproducido los resultados.
- El campo de parámetros del repo (10.584.064) es inconsistente con el tamano del archivo; no usarlo como referencia de tamano real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shailesh83/Qwen3.6-35B-A3B-plc6-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizaciones GGUF de referencia: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- CODESYS: https://www.codesys.com/
- opencode: https://opencode.ai/
- Paper, blog o demo adicionales: no disponible
