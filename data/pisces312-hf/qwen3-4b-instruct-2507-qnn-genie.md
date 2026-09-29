# pisces312-hf/Qwen3-4B-Instruct-2507-QNN-Genie

## Resumen

Este repositorio no contiene un modelo nuevo, sino una conversión de formato del checkpoint `Qwen/Qwen3-4B-Instruct-2507` para ejecutarse íntegramente en la NPU Hexagon de SoCs Snapdragon. Lo publica el usuario `pisces312-hf`, no Qwen ni Qualcomm, y su único cambio respecto al original es el formato de ejecución: cuantización w4a16 (pesos de 4 bits, activaciones de 16 bits) y compilación a cuatro binarios de contexto HTP que se cargan mediante el runtime Qualcomm Genie (`GenieDialog` / `genie-t2t-run`).

El modelo subyacente es un transformer decoder-only de tipo `Qwen3ForCausalLM` con 36 capas, dimensión oculta 2560, 32 cabezas de atención y 8 cabezas KV, dimensión de cabeza 128 e intermedio 9728, sobre un vocabulario de 151 936 tokens. La variante «2507» es exclusivamente instruct, sin modo de razonamiento extendido (thinking mode), y está etiquetada únicamente para inglés y chino.

Su relevancia es de nicho pero clara: permite desplegar un LLM de 4 000 millones de parámetros en un teléfono Android sin nube, sin ruta de respaldo en CPU y con un consumo de almacenamiento de unos 3,2 GB. A cambio, el artefacto queda atado al hardware: los binarios están compilados para la arquitectura DSP V79 (`soc_model` 69, Snapdragon 8 Elite / SM8750), requieren el SDK QAIRT y no son ejecutables en GPU de sobremesa ni en servidores x86 convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3ForCausalLM` (transformer decoder-only): 36 capas, hidden 2560, 32 cabezas de atención / 8 cabezas KV, head dim 128, intermedio 9728 |
| Parámetros totales | 4 000 millones (modelo base); artefacto de pesos de 3 172 663 296 bytes (≈ 2,95 GiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (tal como se distribuye) |
| Tipos de cuantización | w4a16 (pesos de 4 bits, activaciones de 16 bits) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | 4 binarios de contexto HTP (`.bin`), no safetensors ni GGUF |
| Runtime | Qualcomm Genie (pipeline de diálogo QNN) |
| Backend | `QnnHtp` — Hexagon Tensor Processor |
| Versión de QAIRT | 2.45.0.260326154327 (compilación); validado contra 2.50.0 |
| SoC / arquitectura DSP de destino | SM8750 (Snapdragon 8 Elite), `soc_model` 69, DSP arch V79 |
| Tamaño de vocabulario | 151 936 |
| Tokenizer | `Qwen2Tokenizer`, `tokenizer.json` (BPE) |
| Plantilla de chat | Qwen3 `<|im_start|>` / `<|im_end|>` |
| RoPE theta | 5 000 000 |
| Tamaño del repositorio | 3 184 834 343 bytes (≈ 2,97 GiB / 3,18 GB) en 19 archivos |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo ni ajuste fino en este repositorio: es un artefacto convertido y reempaquetado. El pipeline consiste en tomar el checkpoint de `Qwen/Qwen3-4B-Instruct-2507`, cuantizarlo a w4a16 y compilarlo con Qualcomm AI Stack (QAIRT) 2.45.0 a un contexto binario de Hexagon HTP dividido en cuatro fragmentos (778 178 560, 664 707 072, 664 784 896 y 1 064 992 768 bytes). El archivo `metadata.json` (689 930 bytes) recoge los nombres, formas y dtypes de los tensores por fragmento, las escalas de cuantización y los fragmentos de plantilla de chat de Genie; `htp_backend_ext_config.json` fija `soc_model: 69` y `dsp_arch: "v79"`.

Del modelo original se conocen los hiperparámetros arquitectónicos, pero no los detalles de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO u otras fases de alineamiento no están disponibles en la información proporcionada. La variante 2507 se describe como una versión solo-instruct, sin soporte de modo de pensamiento, a diferencia de la familia Qwen3 base. Tampoco se documentan innovaciones técnicas adicionales en el empaquetado (decodificación especulativa, atención lineal, etc.) más allá de la ejecución íntegra en NPU.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat Qwen3 (`<|im_start|>` / `<|im_end|>`).
- Comprensión y generación de lenguaje, código y matemáticas, según la descripción del modelo base en Qualcomm AI Hub.
- Diálogo multiturno a través del pipeline de diálogo de Genie (`GenieDialog`), con la limitación de 4096 tokens de contexto.
- Ejecución íntegra en la NPU Hexagon, sin ruta de respaldo en CPU ni envío de datos a la nube.
- Inferencia determinista en formato precompilado: los cuatro binarios se cargan como contexto HTP, sin fase de conversión en el dispositivo.
- Compatibilidad con la CLI `genie-t2t-run` y con el pipeline `genie-app` (archivos `text-generator.json`, `genie-app-script.txt`).
- Tool calling / function calling: no documentado en la información disponible para este empaquetado.
- Modo de pensamiento (thinking mode): no soportado; la variante 2507 es solo-instruct.
- Capacidades de visión o audio: no disponibles; el pipeline declarado es `text-generation`.
- Orquestación de agentes multi-paso: no documentada en la información disponible.

## Casos de uso

- Asistente conversacional totalmente offline en Android: el modelo se integra mediante Genie en una app que gestiona diálogo multiturno sin conexión, adecuado para entornos sin red o con requisitos de privacidad estrictos, siempre que las conversaciones se mantengan dentro de los 4096 tokens de contexto.
- Procesamiento de texto sensible en el dispositivo: borradores legales, notas clínicas o comunicaciones internas que no pueden salir del terminal; el hecho de que no exista ruta de CPU ni de nube reduce la superficie de fuga de datos.
- Traducción y asistencia bilingüe inglés-chino: es el par de idiomas etiquetado oficialmente, útil para aplicaciones de viaje, atención en mostrador o documentación técnica bilingüe generada localmente.
- Resumen y extracción de información de documentos cortos: informes, correos o artículos que quepan en el contexto de 4096 tokens, con salida estructurada generada en el propio dispositivo.
- Asistente de código embebido en el terminal: completado de fragmentos, explicación de funciones y generación de snippets cortos aprovechando las capacidades de programación del modelo base, sin enviar código propietario a servicios externos.
- Kioscos, terminales TPV y dispositivos industriales con Snapdragon 8 Elite: atención automatizada o guiado de usuario en campo, donde la inferencia local evita costes de API y problemas de conectividad.
- Prototipado de investigación en edge AI: banco de pruebas para medir latencia, consumo y calidad de un LLM de 4B cuantizado a w4a16 sobre HTP V79, comparándolo con despliegues en CPU o GPU.
- Funciones de accesibilidad y reescritura de texto en aplicaciones móviles: simplificación de frases, corrección de estilo o generación de respuestas sugeridas con la NPU como único motor de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y la información recuperada se interrumpe antes de la sección de verificación. No se deben extrapolar los números del modelo base sin confirmación, ya que la cuantización w4a16 y la compilación para HTP pueden alterar la calidad de salida.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el artefacto no se ejecuta en GPU. El cómputo se realiza en la NPU Hexagon.
- Almacenamiento: aproximadamente 3,2 GB libres para el directorio del modelo (3 184 834 343 bytes en 19 archivos).
- Hardware obligatorio: SoC Snapdragon con Hexagon Tensor Processor. Los dispositivos que no sean Qualcomm no están soportados.
- Compatibilidad de silicio: los binarios distribuidos están compilados para DSP arch V79 (`soc_model` 69, Snapdragon 8 Elite / SM8750). Otras arquitecturas Hexagon requieren recompilar el contexto con QAIRT.
- Runtime: Qualcomm Genie más QNN HTP runtime, QAIRT 2.45.0 o superior (validado contra 2.50.0).
- Bibliotecas necesarias en el dispositivo: `libGenie.so`, `libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV{arch}Stub.so`, `libQnnHtpNetRunExtensions.so` y los skels sin firmar correspondientes (`libQnnHtpV{arch}Skel.so`, `libCalculator_skel.so`). No se incluyen en el repositorio; forman parte del SDK QAIRT.
- Variable `ADSP_LIBRARY_PATH`: debe incluir el directorio que contiene `libQnnHtpV{arch}Skel.so`. Omitirla es la causa más habitual de `GenieDialog_create failed`, que falla tras unos 300 ms con esa única línea de log.
- GPU de sobremesa (A100, H100, RTX 4090): no soportadas por este artefacto.
- Opciones de despliegue: Genie (`GenieDialog` API y CLI `genie-t2t-run`) y pipeline `genie-app`. vLLM, llama.cpp, Ollama y TGI no son compatibles con el formato `.bin` de contexto HTP.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `pisces312-hf/Qwen3-4B-Instruct-2507-QNN-Genie` | 4B (w4a16) | 4096 tokens | 4 binarios de contexto HTP | NPU Hexagon V79 (Snapdragon 8 Elite) | Apache-2.0 | Repositorio con 0 descargas y 0 likes |
| `Qwen/Qwen3-4B-Instruct-2507` (modelo base) | 4B | no disponible en la información proporcionada | safetensors (pesos originales) | GPU/CPU convencionales | Apache-2.0 | Checkpoint público de referencia |
| `qualcomm/Qwen3-4B-Instruct-2507` (conversión oficial de Qualcomm) | 4B | no disponible | no disponible | plataformas Qualcomm soportadas por AI Hub | no disponible | Publicado por Qualcomm; detalles de cuantización y runtime no disponibles en la información recuperada |

Comparativa de rendimiento: no disponible. No se han publicado métricas comparativas en la información proporcionada, y el empaquetado aquí descrito no incluye resultados de evaluación propios.

## Limitaciones y advertencias

- Es un artefacto convertido, no un modelo nuevo: hereda todas las capacidades y limitaciones del checkpoint original, y la model card lo indica explícitamente.
- Cuantización w4a16: la reducción a 4 bits en los pesos puede degradar la calidad frente al modelo en precisión completa. No hay evaluación publicada que cuantifique esa pérdida.
- Contexto limitado a 4096 tokens tal como se distribuye; conversaciones o documentos más largos requieren truncado o estrategias externas de segmentación.
- Idiomas: solo inglés y chino están etiquetados. El rendimiento en castellano u otras lenguas no está documentado y no debería asumirse.
- Sin modo de pensamiento: la variante 2507 es solo-instruct, por lo que no hay razonamiento extendido ni cadena de pensamiento explícita.
- Dependencia estricta del hardware: los binarios están compilados para DSP arch V79 y `soc_model` 69. En otros SoCs Snapdragon hay que recompilar el contexto con QAIRT.
- Sin ruta de respaldo en CPU: si la NPU no está disponible o el skel no se encuentra, la inferencia falla directamente en lugar de degradarse.
- Configuración frágil: la omisión de `ADSP_LIBRARY_PATH` provoca `GenieDialog_create failed` tras unos 300 ms sin mensaje de diagnóstico adicional.
- Riesgo de alucinación inherente a un LLM de 4B en tareas de conocimiento factual; no hay evaluación publicada de fidelidad para este empaquetado.
- Sesgos: no se documenta ningún análisis de sesgo para el modelo base ni para esta conversión.
- Licencia Apache-2.0, que permite uso comercial, pero el repositorio incluye un archivo `NOTICE` con atribuciones de copyright y terceros que debe conservarse.
- Publicación de terceros: no es un artefacto oficial de Qwen ni de Qualcomm. Con 0 descargas y 0 likes, no existe validación comunitaria ni garantía de mantenimiento.
- Ausencia total de benchmarks publicados: cualquier decisión de producción debería ir precedida de una evaluación propia en el dispositivo objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pisces312-hf/Qwen3-4B-Instruct-2507-QNN-Genie
- README en chino del repositorio: https://huggingface.co/pisces312-hf/Qwen3-4B-Instruct-2507-QNN-Genie/blob/main/README.zh-CN.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Conversión oficial de Qualcomm: https://huggingface.co/qualcomm/Qwen3-4B-Instruct-2507
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio `ai-hub-models` (modelo qwen3_4b_instruct_2507): https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_4b_instruct_2507
- README del modelo en `ai-hub-models`: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
