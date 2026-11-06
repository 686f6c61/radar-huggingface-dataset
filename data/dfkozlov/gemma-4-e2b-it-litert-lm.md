# dfkozlov/gemma-4-E2B-it-litert-lm

## Resumen

Gemma 4 E2B-it para la NPU del Snapdragon 8 Gen 3 es una compilación no oficial del modelo Gemma 4 E2B-it de Google, empaquetada en formato LiteRT-LM (`.litertlm`) y optimizada para ejecutarse en la unidad de procesamiento neuronal Hexagon del SoC Qualcomm Snapdragon 8 Gen 3 (SM8650). El autor, dfkozlov, parte del bundle sin compilar publicado por litert-community y lo compila con `litert_lm_npu_compiler` y Qualcomm AI Runtime 2.50.0 para que los grafos de prefill, decode y máscara de atención se ejecuten directamente en la NPU, mientras que el codificador de audio permanece en CPU.

El modelo resuelve el problema de la inferencia local de un LLM multimodal en dispositivos Android de gama alta, con una latencia y un consumo energético muy inferiores a los de una ejecución puramente en CPU. La ventana de contexto se mantiene en 4096 tokens, tal como en el bundle de origen, y el repositorio ocupa 2,6 GB. Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: hereda pesos, tokenizador y capacidades del Gemma 4 E2B-it original.

Es relevante ahora porque demuestra un flujo reproducible de compilación de un modelo de Google para una NPU comercial concreta, con cifras medidas en hardware real (Xiaomi 14 Ultra con Android 16): carga en torno a 1 segundo y decodificación de aproximadamente 34 tokens por segundo. La licencia declarada es Apache 2.0, aunque el runtime QNN de Qualcomm no se distribuye y debe obtenerse por separado bajo su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión y audio) del Gemma 4 E2B-it; grafos compilados para NPU Hexagon |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el bundle LiteRT-LM incluye sus propios pesos; no se documentan esquemas de cuantización en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (el runtime QNN de Qualcomm queda fuera y se rige por su propia licencia) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Hardware objetivo | Qualcomm Snapdragon 8 Gen 3 (SM8650) exclusivamente |
| Backend | NPU (Hexagon) para texto; CPU para audio |
| Tamaño del repositorio | 2,6 GB |
| Versión de LiteRT-LM probada | 0.18.1 (`com.google.ai.edge.litertlm:litertlm-android`) |
| Runtime NPU | `com.google.ai.edge.litert:litert-npu-runtime-qualcomm:2.3.0` + QNN 2.50.0 |
| Compilador | `litert_lm_npu_compiler` (litert-torch) + QAIRT 2.50.0 |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E2B-it, un transformer multimodal de Google que procesa texto, imagen y audio. Esta ficha no cubre el entrenamiento del modelo base, del que no se aportan datos en la información disponible (número de tokens, composición del dataset, fases de RLHF o DPO). Lo que sí está documentado es el proceso de compilación: se parte de `gemma-4-E2B-it_NPU_Uncompiled.litertlm` (revisión `1caa527c` de litert-community) y se compilan con QAIRT 2.50.0 los grafos de prefill, decode y máscara de atención para la NPU Hexagon V75 del SM8650.

La innovación técnica destacable es la sustitución del codificador de audio en streaming del bundle original por el codificador de audio estático y el adaptador de audio del bundle genérico `gemma-4-E2B-it.litertlm`, ambos marcados como CPU-only. El motivo es medible: en el SM8650, el codificador en streaming tardaba unos 47 segundos de CPU para un clip de 2 segundos, mientras que el estático tarda aproximadamente 1 segundo. Las secciones de visión se mantienen tal como venían en el bundle de origen. El resultado es un artefacto específico de chip: el código NPU compilado no es portable a otros SoCs.

## Capacidades

- Generación de texto conversacional en formato instruct (`-it`), con respuestas de chat multi-turno dentro de la ventana de 4096 tokens.
- Procesamiento de audio: reconocimiento y comprensión de peticiones habladas, con el codificador de audio ejecutándose en CPU.
- Procesamiento de visión: las secciones de visión del bundle de origen se conservan, aunque la información disponible no detalla su rendimiento en NPU.
- Ejecución de instrucciones tipo shell a partir de voz: en las pruebas del autor, una petición hablada ("list the files here") produjo el comando `ls` en 0,5–0,7 segundos de extremo a extremo.
- Inferencia completamente local en el dispositivo, sin conexión a red.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistentes de voz en Android de gama alta: el modelo recibe audio, lo transcribe y comprende en el propio dispositivo y responde en texto; el codificador estático de audio permite latencias de alrededor de 1 segundo por clip, lo que hace viable la interacción conversacional sin enviar datos a la nube.
- Automatización de tareas del sistema mediante voz: la prueba del autor demuestra la traducción de una orden hablada a un comando de shell (`ls`), base para asistentes que ejecutan acciones locales (gestión de ficheros, ajustes, scripts) con confirmación del usuario.
- Procesamiento de documentos y capturas en local: con las secciones de visión heredadas del bundle, puede emplearse para describir o extraer información de imágenes capturadas por la cámara del teléfono sin salir del dispositivo, útil en contextos de privacidad estricta.
- Aplicaciones de accesibilidad: subtitulado y comprensión de audio en tiempo casi real en el propio terminal, con el beneficio de no requerir conectividad y de mantener el audio del usuario en el dispositivo.
- Demostración y evaluación de despliegue en NPU: sirve como referencia reproducible para equipos que quieran medir el rendimiento de LiteRT-LM con backend Qualcomm en SM8650 antes de adoptarlo en un producto.
- Prototipado de funciones de IA embebida en apps Android: al integrarse como dependencia de Gradle (`litertlm-android`), permite incorporar un LLM multimodal a una aplicación sin infraestructura de servidor, con un tiempo de carga de aproximadamente 1 segundo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones del autor en un Xiaomi 14 Ultra (SM8650, Android 16) con LiteRT-LM 0.18.1:

| Metrica | Resultado |
|---|---|
| Tiempo de carga | ~1 s |
| Velocidad de decodificación | ~34 tokens/s |
| Petición hablada a comando (`ls`) | ~0,5–0,7 s de extremo a extremo |
| Codificador de audio en streaming (original) | ~47 s de CPU para un clip de 2 s |
| Codificador de audio estático (sustituido) | ~1 s para el mismo clip |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- SoC: Qualcomm Snapdragon 8 Gen 3 (SM8650) exclusivamente; el código NPU compilado es específico de este chip y no funciona en otros modelos.
- Almacenamiento: repositorio de 2,6 GB; se recomienda espacio libre adicional para el runtime QNN y el despacho de LiteRT.
- Memoria: no se documenta un requisito de RAM explícito en la información disponible.
- Runtime necesario: LiteRT-LM 0.18.1 con backend NPU (`Backend.NPU(dispatchDir)` para texto, `Backend.CPU()` para audio), `litert-npu-runtime-qualcomm:2.3.0` y QNN 2.50.0 (`libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV75Stub.so`, `libQnnHtpV75Skel.so`), con `ADSP_LIBRARY_PATH` apuntando al directorio de la librería skel.
- GPU de escritorio (A100, H100, RTX 4090): no aplica; el artefacto no está pensado para ejecutarse en GPU ni en servidores x86.
- Opciones de despliegue: integración en apps Android mediante la librería `com.google.ai.edge.litertlm:litertlm-android`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~34 tokens/s de decodificación y ~1 s de carga en el hardware probado.

## Comparativa con modelos similares

| Modelo | Formato / destino | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dfkozlov/gemma-4-E2B-it-litert-lm (esta ficha) | `.litertlm` compilado para NPU SM8650 | 4096 | Apache 2.0 | Hugging Face; requiere QNN 2.50.0 por separado |
| litert-community/gemma-4-E2B-it-litert-lm | `.litertlm` sin compilar para NPU | 4096 | Apache 2.0 (según bundle de origen) | Hugging Face |
| litert-community/gemma-4-E2B-it.litertlm (bundle genérico) | `.litertlm` genérico, CPU | no disponible | Apache 2.0 (según bundle de origen) | Hugging Face |

La diferencia principal frente a los bundles de litert-community es la compilación específica para SM8650 y la sustitución del codificador de audio por la variante estática, que reduce el tiempo de proceso de audio de ~47 s a ~1 s. No se dispone de datos comparativos de rendimiento frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Específico de hardware: solo funciona en Snapdragon 8 Gen 3 (SM8650); no es portable a otros SoCs ni a GPU de escritorio.
- Build no oficial: no está afiliado a Google ni a Qualcomm, por lo que no cuenta con soporte de los fabricantes.
- Dependencia externa: el runtime QNN 2.50.0 es software de Qualcomm bajo su propia licencia y no se incluye en el repositorio; hay que obtenerlo y configurarlo manualmente.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- Sin benchmarks estándar publicados: el rendimiento en tareas de razonamiento, código o matemáticas no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje; en un asistente que ejecuta comandos locales conviene exigir confirmación explícita antes de acciones destructivas.
- Sesgos: no documentados en la información disponible.
- Uso comercial: la licencia declarada es Apache 2.0, pero conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio y las condiciones de la licencia de QNN antes de distribuir una aplicación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional a la del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dfkozlov/gemma-4-E2B-it-litert-lm
- Bundle de origen (litert-community, sin compilar): https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Modelo base: google/gemma-4-E2B-it (referenciado en los metadatos del repositorio)
