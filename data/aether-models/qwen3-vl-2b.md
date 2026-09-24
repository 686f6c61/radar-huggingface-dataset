# aether-models/qwen3-vl-2b

## Resumen

qwen3-vl-2b es un paquete (bundle) de Core AI publicado por aether-models que empaqueta el modelo Qwen/Qwen3-VL-2B-Instruct para su ejecución en el SDK Aether sobre iOS y macOS 27 o superior. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una conversión de los pesos originales en PyTorch al formato `.aimodel` de Core AI, realizada con la receta `qwen3-vl-2b@3` de Aether forge. El resultado es un modelo multimodal de entrada imagen-texto y salida texto, listo para inferencia local en dispositivos Apple.

La relevancia de esta ficha no está en el modelo base, sino en el formato de distribución: permite ejecutar un VLM de aproximadamente 2.000 millones de parámetros de forma local en un iPhone o un Mac, sin depender de APIs en la nube, con pesos cuantizados a int8 y un codificador visual separado que solo se carga cuando el turno de conversación incluye una imagen. Esa separación de activos reduce el consumo de memoria en los turnos puramente textuales.

El bundle se publica bajo licencia Apache-2.0, con un tamano de repositorio de 2,6 GB y dos variantes (`macos-any-gpu` e `ios-any-gpu`) que comparten exactamente los mismos activos. En el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 likes, por lo que se trata de una publicación reciente y sin validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; heredada del modelo base Qwen/Qwen3-VL-2B-Instruct (transformer multimodal con torre de texto y codificador visual) |
| Parametros totales | no disponible de forma explicita; aproximadamente 2.000 millones segun la denominacion del modelo base (Qwen3-VL-**2B**) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Torre de texto: int8-linear-perblock32 (pesos de 8 bits). Codificador visual: pesos float16 con computo float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el bundle incluye el fichero `LICENSE` con el texto canonico de apache.org; el modelo base declara apache-2.0 pero no distribuye fichero de licencia) |
| Formato de pesos | Core AI `.aimodel` (no safetensors ni GGUF); tokenizador en los ficheros originales del modelo base |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento, porque este bundle no entrena nada: es una conversion de pesos. La model card detalla unicamente el proceso de conversion, que parte de `Qwen/Qwen3-VL-2B-Instruct` en la revision `89644892e4d85e24eaac8bacfd4f463576704203` y genera dos activos por variante: la torre de texto (`qwen3_vl_2b.aimodel`, 1,83 GB, pesos int8 por bloque de 32) y el codificador visual (`qwen3_vl_2b-vision.aimodel`, 814,9 MB, pesos float16 y computo float32), que se carga solo en los turnos con imagen. El tokenizador se reutiliza tal cual del modelo original.

Los detalles de arquitectura, composicion del dataset, numero de tokens de entrenamiento y tecnicas de alineacion (RLHF, DPO u otras) corresponden al modelo base Qwen3-VL-2B-Instruct y no se reproducen en la informacion proporcionada, por lo que se marcan como no disponibles. La innovacion tecnica destacable de este paquete es exclusivamente de despliegue: la conversion a Core AI para aceleracion en GPU de Apple, la especializacion en la primera carga (los binarios no vienen precompilados, se especializan al cargarse) y la separacion condicional del codificador visual.

## Capacidades

- Generacion de texto a partir de entradas multimodales: el `pipeline_tag` declarado es `image-text-to-text`, es decir, acepta texto e imagenes (`imageInput`) y devuelve texto.
- Comprension de imagenes: la variante incluye un codificador visual especifico, con un activo separado que solo se carga cuando el turno contiene una imagen.
- Conversacion multi-turno: la API de ejemplo (`aether.chat("qwen3-vl-2b")` con `ChatMessage`) expone una interfaz de chat con roles (`.user`) y contenido mixto (`.image` + `.text`).
- Ejecucion local en dispositivos Apple: variantes especificas para macOS y iOS con computo en GPU.
- Capacidades heredadas del modelo base (razonamiento, codigo, matematicas, multilingueismo, tool calling, modo thinking, etc.): no disponibles en la informacion proporcionada. Solo se documenta lo verificado en el bundle.

## Casos de uso

- Descripcion de imagenes en apps de accesibilidad: una aplicacion de iOS puede enviar una fotografia capturada por la camara y obtener una descripcion en texto sin salir del dispositivo. El codificador visual se carga solo en ese turno, de modo que el resto de la sesion de chat no paga ese coste de memoria.
- Procesamiento de documentos y recibos en apps de finanzas personales: el modelo puede recibir la foto de un ticket y extraer informacion textual. Al ejecutarse on-device, los datos financieros del usuario no se envian a ningun servidor, lo que simplifica el cumplimiento de RGPD.
- Soporte tecnico en macOS con capturas de pantalla: una herramienta de escritorio puede analizar una captura del error que reporta el usuario y generar una respuesta o una guia de pasos, usando la API Swift del SDK Aether dentro de la propia aplicacion.
- Etiquetado y organizacion de fotos en apps de galeria: clasificacion automatica de imagenes por contenido sin coste de inferencia en la nube, aprovechando que el pack completo ocupa 2,66 GB de descarga.
- Asistencia educativa multimodal: lectura de pizarras, ejercicios manuscritos o diagramas en una aplicacion de iOS y generacion de explicaciones en texto, con la ventaja de funcionar sin conectividad.
- Prototipado e investigacion de VLM on-device: comparar el comportamiento de la torre de texto cuantizada a int8 frente a la exportacion sin cuantizar del mismo modelo base, usando los propios registros de verificacion del bundle como referencia de paridad.
- Integracion en flujos de validacion visual: dado que el paquete documenta fixtures y niveles de verificacion (T2, T3), puede emplearse como componente de pruebas de regresion en pipelines que comprueben respuestas sobre conjuntos fijos de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible. Lo unico documentado son los registros de verificacion del propio bundle, que miden paridad funcional y no calidad de modelo:

| Variante | Nivel | Resultado | Detalle | Dispositivo | Build de SO | Computo |
|---|---|---|---|---|---|---|
| `ios-any-gpu` | T2 | pass | 18/18 estricto; perfil quantized-8bit; fixture `7cfe8f0add2a4f6a` | iPhone18,2 | 24A437 | target |
| `ios-any-gpu` | T2 | pass | 7/7 estricto; perfil quantized-8bit; fixture `26eb0569fc25e644` | iPhone18,2 | 24A437 | target |
| `macos-any-gpu` | T2 | pass | 7/7 estricto; perfil quantized-8bit; fixture `26eb0569fc25e644` | Mac17,6 | 26A428 | gpu |
| `macos-any-gpu` | T2 | pass | 18/18 estricto; perfil quantized-8bit; fixture `7cfe8f0add2a4f6a` | Mac17,6 | 26A428 | gpu |
| `macos-any-gpu` | T2 | pass | 6/7 estricto; perfil quantized-8bit; budgeted: square-colors; fixture `26eb0569fc25e644` | Mac17,6 | 26A428 | cpuOnly |
| `macos-any-gpu` | T2 | pass | 18/18 estricto; perfil quantized-8bit; fixture `7cfe8f0add2a4f6a` | Mac17,6 | 26A428 | cpuOnly |
| `macos-any-gpu` | T3 | pass | `vision-shapes-v1`; 91,2% frente a 91,2% de la referencia; 80 elementos | Mac17,6 | 26A428 | gpu |
| Referencia sin cuantizar (no publicada) | T2 | pass | 7/7 estricto; perfil strict; fixture `26eb0569fc25e644` | Mac17,6 | 26A428 | gpu |
| Referencia sin cuantizar (no publicada) | T2 | pass | 18/18 estricto; perfil strict; fixture `7cfe8f0add2a4f6a` | Mac17,6 | 26A428 | gpu |

Todos los registros estan referenciados por digest del bundle, y el perfil cuantizado exige ademas que la referencia sin cuantizar pase el nivel T2 estricto. La unica metrica cuantitativa con porcentaje es `vision-shapes-v1` (91,2% en ambos casos, 80 elementos), que mide coincidencia con la referencia, no rendimiento absoluto. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- Plataforma obligatoria: Apple. Variantes compiladas para macOS e iOS con computo en GPU. La model card menciona iOS y macOS 27 o superior.
- Espacio en disco / descarga: 2,66 GB por variante, compuestos por el activo de texto (1,83 GB) y el de vision (814,9 MB). El repositorio completo ocupa 2,6 GB.
- Memoria en ejecucion: no disponible de forma explicita. Como referencia, la suma de los dos activos es de aproximadamente 2,7 GB, a lo que hay que sumar el runtime, el tokenizador y las estructuras de inferencia; no se especifica el pico real de memoria.
- GPU: no aplica el catalogo habitual de Nvidia. La verificacion se realizo en un iPhone18,2 y en un Mac17,6; tambien hay registros de ejecucion en `cpuOnly` en macOS.
- Compatibilidad con GPU de consumo x86/Nvidia: no disponible. El formato `.aimodel` no es un formato portable a CUDA; para usar el modelo base en Nvidia habria que recurrir al repositorio original de Qwen.
- Opciones de despliegue: SDK Aether. La model card documenta la CLI (`aether run qwen3-vl-2b --prompt "Hello"` y `aether run qwen3-vl-2b --image photo.jpg --prompt "..."`) y la API Swift (`import Aether`, `aether.chat(...)`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que requieren pesos en safetensors o GGUF.
- Latencia y throughput: no disponibles. El modelo se especializa en la primera carga, por lo que la primera ejecucion es mas lenta que las posteriores.
- Consumo en turnos sin imagen: no se carga el activo de vision, con lo que el conjunto de pesos activo se reduce a la torre de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue | Rendimiento |
|---|---|---|---|---|---|---|
| aether-models/qwen3-vl-2b | ~2B (segun nombre del base) | no disponible | Core AI `.aimodel`, int8 per-block-32 + vision float16 | Apache-2.0 | SDK Aether en iOS y macOS | Solo verificacion de paridad del bundle; sin benchmarks academicos |
| Qwen/Qwen3-VL-2B-Instruct (modelo base) | ~2B | no disponible en la informacion proporcionada | safetensors en PyTorch | Apache-2.0 | vLLM, TGI, transformers y otros | No disponible en la informacion proporcionada |
| Otros VLM de ~2B (por ejemplo, alternativas de la misma categoria) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es entre el bundle y su origen: comparten pesos y licencia, pero difieren en formato, tamano de distribucion y ecosistema de ejecucion. El bundle no se puede ejecutar fuera de Apple sin reconvertir los pesos, y el modelo base no ofrece la cuantizacion int8 ni la separacion de activos que si trae el paquete.

## Limitaciones y advertencias

- Publicacion sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha. Es un artefacto recien subido, sin evidencia de uso en produccion.
- Verificacion autocertificada: los registros T2 y T3 son emitidos por el propio autor del bundle. Acreditan paridad con la referencia sin cuantizar sobre fixtures concretos, no calidad general del modelo.
- La cuantizacion int8 por bloque de 32 puede degradar la calidad frente a los pesos originales en tareas sensibles; la unica evidencia de paridad publicada es `vision-shapes-v1` (91,2% frente a 91,2%) y los conjuntos estrictos de los fixtures.
- Hay al menos un registro con resultado parcial: 6/7 estricto en macOS con computo `cpuOnly`, con el caso `square-colors` marcado como budgeted. Conviene validar el comportamiento en el hardware objetivo antes de desplegar.
- Dependencia total del ecosistema Apple: requiere iOS o macOS 27 o superior y el runtime Core AI. No es portable a Linux, Windows, Android ni CUDA.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue ni un rendimiento concreto en castellano sin evaluacion propia.
- Longitud de contexto: no disponible. No se documenta ninguna ventana maxima, lo que impide planificar aplicaciones con historiales largos o documentos extensos.
- Sesgos y alineacion: no hay informacion sobre el proceso de alineacion del modelo base ni sobre evaluaciones de sesgo. Hereda cualquier sesgo de Qwen3-VL-2B-Instruct.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en tareas de lectura de documentos y OCR conviene verificar las extracciones.
- Licencia: Apache-2.0 en el bundle, con el texto canonico incluido. El modelo base declara la misma licencia pero no distribuye fichero de licencia, lo que puede complicar auditorias de cumplimiento segun la jurisdiccion.
- Los activos se especializan en la primera carga: el primer arranque es mas lento y puede requerir espacio temporal adicional, un aspecto a tener en cuenta en aplicaciones moviles con almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aether-models/qwen3-vl-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Texto canonico de la licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio o documentacion del SDK Aether: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
