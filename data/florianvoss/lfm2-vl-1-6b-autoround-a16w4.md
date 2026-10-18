# florianvoss/LFM2-VL-1.6B-Autoround-a16w4

## Resumen

LFM2-VL-1.6B-Autoround-a16w4 es un paquete compilado del modelo vision-lenguaje LFM2-VL-1.6B, publicado por el usuario florianvoss dentro de la colección Neat 0.6.0. No es un modelo entrenado desde cero ni un ajuste fino: es el resultado de compilar el repositorio simaai/LFM2-VL-1.6B-Autoround-Safetensors (ya cuantizado con AutoRound) en un ModelGraph nativo ejecutable sobre el acelerador SiMa Modalix mediante el runtime LLiMa. El repositorio ocupa 2,3 GB e incluye 107 ejecutables ELF junto con los activos de runtime en `devkit/`.

Su relevancia es acotada pero específica: demuestra el flujo de despliegue de un VLM de 1,6 mil millones de parámetros en hardware de inferencia en el borde (edge) con pesos INT4 y activaciones BF16, un formato que no encaja en los ecosistemas habituales de GPU. Frente a un checkpoint en safetensors, este paquete no se puede cargar con Transformers, vLLM ni llama.cpp: solo funciona con un runtime LLiMa compatible sobre Modalix.

Conviene subrayar que la validación declarada por el autor se limita a que la compilación completa y el despliegue local terminaron correctamente y a la verificación por checksum de los ficheros. La generación en tiempo de ejecución sobre Modalix, así como las mediciones de precisión y rendimiento, no se han realizado según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (pipeline `image-text-to-text`); detalles de la arquitectura interna no disponibles en la informacion proporcionada |
| Parametros totales | 1,6B (segun la denominacion del modelo; no verificado en la informacion disponible) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4.096 tokens (maximo fijado en la compilacion) |
| Tipos de cuantizacion | Pesos INT4/G256 con excepciones de precision mixta; activaciones BF16; embeddings y cache KV en INT8 |
| Idiomas soportados | No disponible |
| Licencia | `other` (se aplican los terminos de la licencia del modelo fuente) |
| Formato de pesos | ModelGraph compilado + 107 ejecutables ELF; no safetensors ni GGUF. Activos de runtime en `devkit/` |
| Resolucion de imagen | 512 x 512 (fijada en la compilacion) |
| Tamano del repositorio | 2,3 GB |
| Biblioteca | `llima` |
| Inferencia estandar | No (`inference: false`) |
| Hardware objetivo | SiMa Modalix con runtime LLiMa compatible |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo (tipo de transformer, atencion, codificador visual ni composicion del dataset). Lo que si se documenta es la cadena de transformacion: el modelo parte de `simaai/LFM2-VL-1.6B-Autoround-Safetensors`, un checkpoint ya cuantizado con AutoRound, y se compila con el Model Compiler de SiMa mediante ModelGraph nativo, usando 16 procesos en paralelo y un hilo de simulador por proceso. Los pesos se codifican en INT4 con granularidad de grupo 256 y excepciones de precision mixta heredadas de la fuente pre-cuantizada; las activaciones se mantienen en BF16 y los embeddings y la cache KV se rebajan a INT8.

El proceso de build fija dos parametros criticos que no son configurables en tiempo de ejecucion: la longitud de contexto maxima (4.096 tokens) y la resolucion de imagen (512 x 512). Tambien se habilita por defecto el *filter sharing* para los componentes de lenguaje y se define un tamano de grupo de prefill de 128. Las revisiones exactas del modelo fuente y del compilador quedan registradas en `compilation.json`, y el script `compile.sh` documenta la descarga del origen y todos los argumentos de compilacion. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni etapas de RLHF o DPO, ya que este repositorio no entrena el modelo.

## Capacidades

- Generacion de texto e inferencia multimodal imagen-texto, segun el pipeline declarado `image-text-to-text`.
- Procesamiento de imagenes a una resolucion fija de 512 x 512 pixeles.
- Conversacion multi-turno dentro de una ventana de 4.096 tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, vision avanzada): no disponible, salvo la entrada de imagen ya mencionada.
- Ejecucion compilada en hardware SiMa Modalix, sin dependencia de CUDA.

## Casos de uso

- Inspeccion visual en linea de fabricacion: el modelo puede clasificar y describir defectos en imagenes de 512 x 512 capturadas por camaras industriales, ejecutandose localmente en un acelerador Modalix sin enviar imagenes a la nube, lo que simplifica el cumplimiento de privacidad y reduce la latencia de red.
- Analitica de comercio minorista en el borde: generacion de descripciones de escenas o recuentos a partir de fotogramas de camara dentro de un dispositivo de bajo consumo, con la ventana de 4.096 tokens suficiente para mantener un historial breve de observaciones.
- Asistencia documental con OCR visual: extraccion de texto y descripcion de documentos escaneados en un flujo on-premise, adecuado cuando la normativa impide sacar los documentos de la instalacion.
- Control de calidad en agricultura o industria alimentaria: evaluacion de imagenes de producto en campo o planta con un modelo de 1,6B cuantizado a INT4, donde el espacio y el consumo energetico son restrictivos.
- Prototipado de pipelines VLM sobre silicio SiMa: el paquete incluye `compile.sh` y `devkit/`, lo que lo convierte en una referencia util para validar el flujo de compilacion ModelGraph antes de portar modelos propios.
- Despliegue embebido en entornos sin GPU: escenarios de robotica movil o equipos de instrumentacion donde no hay disponible una RTX ni acceso a aceleradores tipo A100, y donde el runtime LLiMa es el unico camino de ejecucion soportado.

En todos los casos debe tenerse en cuenta que el autor no ha realizado mediciones de precision ni de rendimiento en Modalix, por lo que estos usos son planteamientos tecnicos y no capacidades verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de precision y rendimiento en Modalix no se han realizado por parte de esta cola de publicacion. Tampoco se proporcionan cifras de latencia, throughput ni consumo energetico.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable en el sentido habitual; el modelo no se ejecuta sobre GPU. El repositorio ocupa 2,3 GB en disco y los pesos estan en INT4, pero el consumo real de memoria depende del acelerador Modalix y no se documenta.
- GPU recomendadas: ninguna. El paquete esta compilado exclusivamente para SiMa Modalix con un runtime LLiMa compatible.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no. No hay checkpoint en safetensors ni GGUF en este repositorio que permita cargarlo con Transformers, llama.cpp u Ollama.
- Opciones de despliegue: `hf download` del repositorio seguido de `llima run ./LFM2-VL-1.6B-Autoround-a16w4` sobre Modalix. El paquete incluye 107 ejecutables ELF y los activos de runtime en `devkit/`.
- Recompilacion: es posible regenerar el paquete con `compile.sh`, usando un entorno de Model Compiler compatible y parametros `MODEL_DIR`, `OUTPUT_DIR` y argumentos adicionales. La longitud de contexto y las resoluciones de imagen soportadas se eligen en el momento de la compilacion, no en ejecucion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| florianvoss/LFM2-VL-1.6B-Autoround-a16w4 | 1,6B (segun denominacion) | 4.096 tokens (fijado en build) | ModelGraph + ELF compilado | `other` | Solo SiMa Modalix con runtime LLiMa |
| simaai/LFM2-VL-1.6B-Autoround-Safetensors (modelo fuente) | 1,6B (segun denominacion) | No disponible | Safetensors cuantizado con AutoRound | No disponible en la informacion | Ecosistema estandar de pesos safetensors |
| Modelos VLM de ~1-2B en formato GGUF | No disponible | No disponible | GGUF | No disponible | llama.cpp, Ollama y similares |

No se dispone de datos de rendimiento del modelo ni de sus alternativas en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y via de despliegue.

## Limitaciones y advertencias

- Dependencia total de hardware propietario: sin un SiMa Modalix con runtime LLiMa compatible, el paquete es inutilizable. No hay ruta de ejecucion en GPU ni en CPU.
- Contexto limitado a 4.096 tokens, fijado en compilacion; no se puede ampliar sin recompilar.
- Resolucion de imagen fija de 512 x 512; imagenes de mayor resolucion requeriran un reescalado previo que puede degradar detalles finos.
- Ausencia de validacion funcional publicada: el autor solo confirma compilacion y despliegue correctos y verificacion por checksum, no calidad de generacion ni precision.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; al ser un VLM de 1,6B cuantizado a INT4, es esperable una degradacion frente al modelo completo, aunque no hay datos que lo midan.
- Idiomas soportados: no disponibles, lo que impide garantizar un comportamiento correcto en castellano.
- Licencia `other`: se aplican los terminos del modelo fuente, que no se detallan en este repositorio. Es imprescindible revisar la licencia de `simaai/LFM2-VL-1.6B-Autoround-Safetensors` antes de cualquier uso comercial.
- Naturaleza derivada: al ser una compilacion de un checkpoint pre-cuantizado, cualquier problema de calidad del origen se hereda y no es corregible en este repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/florianvoss/LFM2-VL-1.6B-Autoround-a16w4
- Coleccion Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
- Modelo fuente: https://huggingface.co/simaai/LFM2-VL-1.6B-Autoround-Safetensors
- Revision concreta del modelo fuente: https://huggingface.co/simaai/LFM2-VL-1.6B-Autoround-Safetensors/tree/537626018870fee3b5de7a7b9bb2cf33e68b6c0e
- Registro de revisiones de compilacion: https://huggingface.co/florianvoss/LFM2-VL-1.6B-Autoround-a16w4/blob/main/compilation.json
- Script de compilacion: https://huggingface.co/florianvoss/LFM2-VL-1.6B-Autoround-a16w4/blob/main/compile.sh
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
