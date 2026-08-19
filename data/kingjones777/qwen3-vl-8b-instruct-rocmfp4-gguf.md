# kingjones777/Qwen3-VL-8B-Instruct-ROCmFP4-GGUF

## Resumen

`kingjones777/Qwen3-VL-8B-Instruct-ROCmFP4-GGUF` es una cuantización GGUF del modelo de visión-lenguaje `Qwen/Qwen3-VL-8B-Instruct`, adaptada específicamente para hardware AMD con arquitectura RDNA3.5 (gfx1151, como el Strix Halo). El autor, kingjones777, ha generado cuatro variantes que utilizan tipos de tensor FP4 y FP8 procedentes del fork ROCmFPX de llama.cpp, que no existen en el mainline de llama.cpp. El objetivo es ofrecer una ejecución nativa y eficiente en GPUs AMD, con velocidades de decodificación medidas de entre 26 y 45 tokens por segundo en un Ryzen AI MAX+ 395.

El modelo base, Qwen3-VL-8B-Instruct, es un modelo multimodal denso de 8 mil millones de parámetros que combina comprensión de texto y percepción visual, con capacidades de razonamiento espacial, comprensión de video y soporte para agentes. Esta cuantización conserva esas capacidades, incluyendo el proyector de visión (`mmproj-BF16.gguf`) incluido en el repositorio, y está pensada para entornos de inferencia local en hardware AMD de última generación. Su relevancia radica en que permite desplegar un modelo de visión-lenguaje de 8B en equipos con GPUs integradas o discretas RDNA3.5 sin necesidad de hardware NVIDIA, aprovechando los nuevos formatos FP4/FP8 de ROCm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en Qwen3-VL |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo, sin cifra publicada en esta ficha) |
| Tipos de cuantizacion | Q4_0_ROCMFP4, Q6_0_ROCMFPX, Q8_0_ROCMFPX (con variantes AGENT) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se detalla en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tipos FP4/FP8 del fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-8B-Instruct es un transformer denso multimodal que procesa tanto texto como imagenes. Pertenece a la serie Qwen3-VL, que segun la documentacion oficial de Qwen incluye mejoras en comprension y generacion de texto, percepcion visual y razonamiento, contexto largo, comprension espacial y de video, y capacidades de interaccion con agentes. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni el proceso de alineacion (RLHF, DPO, etc.) del modelo original.

La cuantizacion de kingjones777 emplea los tipos de tensor FP4 y FP8 implementados en el fork ROCmFPX de llama.cpp. Estos tipos estan disenados para aprovechar las instrucciones nativas de las GPUs AMD RDNA3.5 (gfx1151), lo que permite una inferencia mas rapida que con cuantizaciones genericas. El repositorio incluye cuatro archivos GGUF con diferentes niveles de cuantizacion y un proyector de vision en BF16 (`mmproj-BF16.gguf`) necesario para el procesamiento de imagenes. La verificacion realizada por el autor confirma que la vision funciona correctamente en los cuatro archivos, aunque requiere desactivar la atencion flash (`-fa off`).

## Capacidades

- Generacion de texto y comprension de lenguaje natural, heredadas del modelo base Qwen3-VL-8B-Instruct.
- Percepcion visual: puede analizar imagenes, identificar colores, objetos y responder preguntas sobre su contenido (verificado por el autor con una imagen de cuatro cuadrantes de colores).
- Razonamiento multimodal: combina informacion textual y visual para responder con contenido y razonamiento, segun las pruebas de verificacion del autor.
- Capacidades de agente: el modelo base Qwen3-VL incluye soporte para interacciones con agentes, y las variantes etiquetadas como "AGENT" estan optimizadas para ese uso.
- Comprension espacial y de video: segun la descripcion del modelo base, aunque no se ha verificado en esta cuantizacion especifica.
- Multilingue: el modelo base soporta multiples idiomas, aunque no se especifica cuales en la informacion disponible.
- No se menciona soporte explicito de tool calling o function calling en la informacion proporcionada.

## Casos de uso

- Asistencia visual en hardware AMD de ultima generacion: desplegar un asistente que analice imagenes en tiempo real en un equipo con Ryzen AI MAX+ 395, aprovechando las velocidades de 44 t/s de la variante Q4_0 para respuestas rapidas.
- Procesamiento de documentos con imagenes: extraer informacion de capturas de pantalla, graficos o diagramas en aplicaciones de productividad, usando la variante Q8_0 para mayor fidelidad cuando la precision es critica.
- Chatbots multimodales en entornos edge: integrar el modelo en un servidor local con GPU AMD RDNA3.5 para atender consultas que incluyan fotos o dibujos, sin depender de la nube.
- Automatizacion de control de calidad visual: en entornos industriales o de laboratorio, el modelo puede clasificar imagenes de productos o muestras y generar informes textuales basados en lo que ve.
- Agentes de asistencia con memoria visual: las variantes AGENT estan pensadas para tareas de agente que requieren multiples pasos de razonamiento sobre imagenes, como planificar rutas a partir de un mapa o seguir instrucciones visuales.
- Desarrollo de prototipos de investigacion: investigadores que trabajan con modelos de vision-lenguaje en hardware AMD pueden usar esta cuantizacion para experimentar con FP4/FP8 y medir el rendimiento en su propio equipo.

## Benchmarks y rendimiento

La model card proporciona mediciones de velocidad de decodificacion realizadas en un Ryzen AI MAX+ 395 (Strix Halo, gfx1151, ROCm 7.2.4) con parametros `-ngl 999 -c 4096 -fa on -fit off -np 1`, sobre generaciones de 300 tokens con 12 muestras y dos warm-ups. Los resultados son:

| Variante | Tamano | Velocidad de decodificacion (t/s) | Spread (lento/rapido) |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 4.60 GiB | 44.86 | 1.0013 |
| Q6_0_ROCMFPX_AGENT | 7.22 GiB | 28.50 | 1.0004 |
| Q8_0_ROCMFPX | 7.91 GiB | 26.29 | 1.0015 |
| Q8_0_ROCMFPX_AGENT | 8.02 GiB | 26.08 | 1.0012 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor advierte que las mediciones deben realizarse en un sistema sin otras cargas en la GPU, ya que un proceso concurrente puede reducir el rendimiento hasta un 20% y aumentar la dispersion.

## Requisitos de hardware

- GPU AMD con arquitectura RDNA3.5 (gfx1151), como el Ryzen AI MAX+ 395 (Strix Halo). No se garantiza compatibilidad con otras arquitecturas AMD.
- Se requiere un build de llama.cpp con soporte ROCmFPX (fork especifico), ya que los tipos FP4/FP8 no existen en el mainline.
- VRAM estimada: los archivos GGUF ocupan entre 4.60 GiB y 8.02 GiB, por lo que se necesita al menos 8 GB de VRAM para la variante mas pequena y 12 GB o mas para las variantes Q8_0. En un Strix Halo con memoria unificada, esto es factible.
- No cabe en GPUs consumer de gama baja sin soporte gfx1151; se limita a hardware AMD reciente con RDNA3.5.
- Opciones de despliegue: llama.cpp (fork ROCmFPX). No se menciona compatibilidad con vLLM, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: las velocidades medidas oscilan entre 26 y 45 t/s en el hardware de referencia, lo que se traduce en una latencia de aproximadamente 22-38 ms por token.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras cuantizaciones del mismo modelo base o con modelos alternativos en la informacion proporcionada. Como referencia, el modelo base Qwen3-VL-8B-Instruct esta disponible en formato safetensors y en cuantizaciones GGUF estandar (Q4_K_M, Q5_K_M, etc.) en otros repositorios, pero no se han medido en las mismas condiciones. La comparativa con modelos como LLaVA-NeXT-8B o InternVL2-8B requeriria datos de benchmarks que no estan disponibles en esta ficha.

## Limitaciones y advertencias

- Dependencia de un fork especifico de llama.cpp (ROCmFPX): los archivos GGUF no se pueden cargar con el llama.cpp estandar, lo que limita la portabilidad.
- La vision requiere desactivar la atencion flash (`-fa off`), lo que puede afectar al rendimiento en tareas multimodales.
- El rendimiento medido es muy sensible a la carga concurrente de la GPU; en sistemas compartidos, la velocidad puede caer hasta un 20% y la dispersion aumentar.
- No se ha verificado el comportamiento del modelo en tareas de generacion de codigo, matematicas o razonamiento complejo en esta cuantizacion especifica.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma del modelo base en la documentacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el fork ROCmFPX de llama.cpp puede tener sus propias condiciones; se recomienda revisar su licencia antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/kingjones777/Qwen3-VL-8B-Instruct-ROCmFP4-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio oficial de Qwen3-VL en GitHub: https://github.com/QwenLM/Qwen3-VL
- Repositorio de la serie Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Pagina del modelo en Ollama: https://ollama.com/library/qwen3-vl:8b-instruct
