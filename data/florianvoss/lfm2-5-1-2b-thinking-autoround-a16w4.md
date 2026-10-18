# florianvoss/LFM2.5-1.2B-Thinking-Autoround-a16w4

## Resumen

LFM2.5-1.2B-Thinking-Autoround-a16w4 es un artefacto compilado del modelo de lenguaje LFM2.5-1.2B-Thinking de Liquid AI, empaquetado por el usuario florianvoss para su ejecución sobre hardware de borde SiMa Modalix dentro de la colección Neat 0.6.0. No se trata de un modelo entrenado desde cero ni de un fine-tune: es el resultado de compilar el grafo del modelo base prequantizado (simaai/LFM2.5-1.2B-Thinking-Autoround-Safetensors) con el compilador de modelos de SiMa y la herramienta LLiMa, generando pesos codificados en INT4, activaciones BF16 y 81 ejecutables ELF listos para desplegar. El repositorio ocupa 1,5 GB e incluye el directorio devkit con los recursos de runtime.

Su relevancia es acotada pero específica: demuestra el flujo de compilación y despliegue de un modelo de razonamiento de 1,2 mil millones de parámetros en un acelerador de borde, un escenario donde las alternativas habituales (vLLM, llama.cpp, Ollama) no son aplicables porque el destino no es una GPU convencional. El modelo está pensado para inferencia totalmente local, fuera de la nube, con una ventana de contexto de 4.096 tokens fijada en tiempo de compilación.

Conviene subrayar que el autor no ha realizado mediciones de precisión ni de rendimiento en el dispositivo, ni ha validado la generación en runtime sobre Modalix: la validación se limita a que la compilación completa y el despliegue local terminaron correctamente y a la verificación de checksums de los ficheros subidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (artefacto compilado como ModelGraph nativo para SiMa Modalix; arquitectura interna del modelo base no detallada) |
| Parametros totales | Aproximadamente 1.200 millones (1,2 B), segun la denominacion del modelo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens en esta compilacion (fijada en el build; longitud nativa del modelo base: no disponible) |
| Tipos de cuantizacion | Pesos INT4 con grupos de 256 (INT4/G256) y excepciones en precision mixta heredadas de la fuente prequantizada (AutoRound); embeddings y cache KV en INT8; activaciones en BF16 |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (Liquid AI); la metadata de HuggingFace figura como `license: other` con `license_name: lfm1.0` |
| Formato de pesos | Artefactos compilados: 81 ejecutables en `elf_files/`, recursos de runtime en `devkit/` y `compilation.json`; no se distribuyen safetensors ni GGUF |

Otros datos del paquete: `prefill group size` de 128, comparticion de filtros activada por defecto para los componentes de lenguaje, compilacion ModelGraph nativa con 16 procesos en paralelo y un hilo de simulador por proceso. Tamano del repositorio: 1,5 GB. Descargas y likes en el momento de la consulta: 0.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de bloque, atencion, capas convolucionales o mixtura de expertos). Lo que si se documenta es la cadena de transformacion: el punto de partida es simaai/LFM2.5-1.2B-Thinking-Autoround-Safetensors, una version prequantizada del LFM2.5-1.2B-Thinking de Liquid AI en la que se aplico cuantizacion AutoRound; sobre ella, el autor ejecuto el compilador de modelos de SiMa con compilacion ModelGraph nativa, 16 procesos en paralelo y un hilo de simulador por proceso. El resultado codifica los pesos en INT4 con granularidad de grupo 256, mantiene las excepciones de precision mixta declaradas en la fuente, usa activaciones BF16 y almacena embeddings y cache KV en INT8. La comparticion de filtros queda habilitada por defecto en los componentes de lenguaje.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni sobre etapas de alineacion (RLHF, DPO) en esta ficha. El autor tampoco documenta un proceso de ajuste propio: el valor anadido del repositorio es la compilacion y el empaquetado para el acelerador, no el entrenamiento. El sufijo "Thinking" del nombre indica que el modelo base opera en modo de razonamiento, si bien las caracteristicas concretas de ese modo no se describen en la model card. El contexto maximo y las resoluciones de imagen soportadas se seleccionan durante la compilacion, segun se indica en el README.

## Capacidades

- Generacion de texto: la pipeline declarada es `text-generation`, con salida autoregresiva sobre un grafo compilado.
- Razonamiento: el modelo base pertenece a la familia "Thinking" de LFM2.5, orientada a cadenas de razonamiento; el alcance exacto no se detalla en la informacion disponible.
- Ventana de contexto de 4.096 tokens en este build, adecuada para prompts y conversaciones de longitud corta o media.
- Inferencia local en dispositivo: todo el calculo se ejecuta en el SoC SiMa Modalix mediante el runtime LLiMa, sin dependencia de servicios en la nube.
- Ejecucion offline: el paquete incluye los recursos de runtime y los ejecutables necesarios, por lo que no requiere descargas adicionales una vez instalado.
- Capacidades de tool calling, function calling, agentes, vision, audio o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente local para operarios en planta industrial: el modelo se ejecuta en el propio dispositivo Modalix y responde a consultas de procedimiento sin enviar datos a la nube, lo que simplifica el cumplimiento de requisitos de confidencialidad. La ventana de 4.096 tokens cubre instrucciones y fragmentos de manual.
- Clasificacion y enrutado de texto en el borde: etiquetado de incidencias, triaje de tickets o deteccion de intencion en un gateway local, con latencia independiente de la conectividad WAN.
- Extraccion de campos en formularios y documentos cortos: dado que el contexto es de 4.096 tokens, encaja en tareas de extraccion sobre documentos de una o dos paginas, con el resultado validado por reglas posteriores.
- Prototipado de razonamiento de cadena corta en hardware empotrado: validacion de prompts y del comportamiento del modelo "Thinking" antes de escalar a un despliegue mayor, usando el simulador incluido en el flujo de compilacion.
- Demostraciones y pruebas de concepto de IA generativa en dispositivos sin GPU: permite mostrar generacion de texto en un equipo de borde con consumo contenido, sin depender de una tarjeta grafica dedicada.
- Integracion en CI para validar cadenas de compilacion: el repositorio incluye `compile.sh` y `compilation.json` con las revisiones de fuente y compilador, lo que sirve como referencia reproducible para verificar que un pipeline de compilacion de modelos produce artefactos coherentes.
- Evaluacion de la cadena SiMa/LLiMa frente a alternativas: util para equipos que comparan runtimes de inferencia en el borde antes de comprometerse con una plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que la generacion en runtime sobre Modalix y las mediciones de precision y rendimiento no han sido realizadas por este proceso de publicacion. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas de latencia o throughput.

## Requisitos de hardware

- Acelerador: SiMa Modalix con un runtime LLiMa compatible. El modelo no esta pensado para GPU convencional.
- VRAM en GPU: no aplica; el artefacto es un grafo compilado para el SoC de SiMa.
- GPU de consumo (RTX 4090, etc.): no soportado por este paquete, que no se distribuye en safetensors ni GGUF.
- Almacenamiento: 1,5 GB para el repositorio completo, incluyendo `devkit/` y los 81 ejecutables de `elf_files/`; los pesos INT4 de un modelo de 1,2 B ocupan aproximadamente 0,6-0,7 GB, estimacion orientativa a partir del tamano y la cuantizacion declarada.
- Memoria del dispositivo: no disponible; debe consultarse la documentacion de Modalix y el entorno de compilacion.
- Despliegue: descarga con `hf download florianvoss/LFM2.5-1.2B-Thinking-Autoround-a16w4 --local-dir ...` y ejecucion con `llima run ./LFM2.5-1.2B-Thinking-Autoround-a16w4`. Para recompilar, se requiere un entorno de Model Compiler compatible y las variables `MODEL_DIR` y `OUTPUT_DIR`.
- vLLM, llama.cpp, Ollama y TGI: no aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| florianvoss/LFM2.5-1.2B-Thinking-Autoround-a16w4 | ~1,2 B | 4.096 tokens (build) | Ejecutables ELF + devkit para Modalix | lfm1.0 | Inferencia compilada en SiMa Modalix |
| simaai/LFM2.5-1.2B-Thinking-Autoround-Safetensors | ~1,2 B | No disponible | Safetensors prequantizados (AutoRound) | lfm1.0 | Modelo fuente para compilacion y despliegue en otros runtimes |
| LiquidAI/LFM2.5-1.2B-Thinking | ~1,2 B | No disponible en la informacion proporcionada | Safetensors | lfm1.0 | Modelo original de razonamiento de Liquid AI, base de la cadena |

La comparacion se limita a estos tres eslabones de la misma cadena de derivacion, ya que la informacion disponible no permite contrastar con modelos de otros fabricantes en terminos de rendimiento. No hay datos publicados de benchmarks ni de descargas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de validacion de calidad: el autor declara que no se han realizado mediciones de precision ni de rendimiento, y que la generacion en runtime sobre Modalix no ha sido verificada. Solo se confirma que la compilacion y el despliegue local terminaron correctamente.
- Dependencia de hardware propietario: el paquete solo funciona en SiMa Modalix con un runtime LLiMa compatible. No es portable a GPU ni a CPU convencional sin recompilar.
- Contexto reducido: 4.096 tokens en este build, seleccionados en tiempo de compilacion, limitan casos de uso con documentos largos o conversaciones extensas.
- Idiomas no declarados: la model card no especifica que idiomas soporta el modelo base; no se puede asumir un rendimiento adecuado en castellano sin evaluacion previa.
- Licencia: se aplican los terminos del modelo fuente, la licencia lfm1.0 de Liquid AI. La metadata de HuggingFace figura como `license: other`, por lo que es imprescindible revisar el texto de la licencia antes de cualquier uso comercial.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 1,2 B con cuantizacion INT4, es esperable una degradacion respecto al modelo original en tareas de razonamiento largo, pero no hay datos que lo confirmen.
- Superficie de seguridad: el repositorio incluye 81 ejecutables ELF. Conviene verificar checksums y revisar el contenido antes de ejecutarlos en produccion; el autor indica que los ficheros subidos fueron verificados por checksum, pero no se detalla el procedimiento.
- Falta de traccion comunitaria: cero descargas y cero likes en el momento de la consulta, sin issues ni discusion documentadas.
- Metadata incompleta: el campo `inference: false` indica que el modelo no esta habilitado para inferencia alojada en HuggingFace, y no se publican datos de entrenamiento ni de evaluacion.
- Sin soporte documentado de tool calling ni de agentes: no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/LFM2.5-1.2B-Thinking-Autoround-a16w4
- Fichero de compilacion: https://huggingface.co/florianvoss/LFM2.5-1.2B-Thinking-Autoround-a16w4/blob/main/compilation.json
- Modelo base prequantizado: https://huggingface.co/simaai/LFM2.5-1.2B-Thinking-Autoround-Safetensors
- Revision concreta del modelo base: https://huggingface.co/simaai/LFM2.5-1.2B-Thinking-Autoround-Safetensors/tree/559b4785eb206adba62d7249283573cf380becfa
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Texto de la licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/f313478934a7612d22991f752959d7a1a8756fec/LICENSE
- Coleccion Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la model card.
