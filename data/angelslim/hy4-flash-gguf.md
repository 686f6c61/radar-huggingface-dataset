# AngelSlim/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo de lenguaje desarrollado por Tencent, distribuido en este repositorio por AngelSlim en formato GGUF cuantizado para inferencia local. Se trata de un modelo de gran escala con 222.679.844.717 parámetros totales (aproximadamente 222,7 mil millones), según los datos de safetensors del modelo base. El repositorio ofrece cinco builds GGUF con distintos niveles de cuantización, desde IQ2-AH (125,73 GiB) hasta Q4_K_M (156,79 GiB), pensados para despliegue en hardware de gama alta con memoria unificada o múltiples GPU.

La relevancia de esta ficha reside en que permite ejecutar un modelo de más de 200 mil millones de parámetros en equipos con 128 GB de memoria unificada, como un Mac M5 Max o una RTX Spark, mediante cuantizaciones agresivas y optimizaciones específicas. El modelo base es `tencent/Hy4-flash`, y esta versión GGUF está orientada a inferencia local con llama.cpp, incluyendo soporte para entrada de imágenes mediante un fichero mmproj separado.

La información disponible no detalla la arquitectura interna del modelo base (si es transformer denso, MoE o híbrido), ni los datos de entrenamiento, ni la licencia. La model card se centra en los aspectos prácticos de las cuantizaciones, el rendimiento medido y las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/Hy4-flash; no se detalla en la informacion) |
| Parametros totales | 222.679.844.717 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, SPARK-4Bit, SPARK-4Bit-Fast, Q3_K, IQ2-AH (GGUF) |
| Idiomas soportados | zh, en (segun tags y model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (multi-parte, p. ej. `-00001-of-00002.gguf`); mmproj BF16 para vision |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `tencent/Hy4-flash` en la documentacion proporcionada. La model card de esta version GGUF no describe si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida, ni detalla el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO.

Lo que si se documenta es el proceso de cuantizacion aplicado por AngelSlim. Las builds siguen recetas diferenciadas: Q4_K_M aplica Q4_K a las proyecciones `gate`/`up` de los expertos enrutados y Q6_K a `down` en 19 capas (Q4_K en las otras 22), con la mayoria de pesos no-expertos en Q8_0. La build Q3_K mantiene Q4_K en 19 capas seleccionadas por sensibilidad a la cuantizacion y baja a Q3_K en las otras 22. La build IQ2-AH lleva las proyecciones `gate`/`up` a 2,0625 bpw (IQ2_XXS) y mantiene los pesos no-expertos en BF16. Las builds SPARK-4Bit emplean el formato de coma flotante de 4 bits de NVIDIA, orientado a dispositivos Spark.

## Capacidades

- Generacion de texto conversacional en chino e ingles (tags `conversational`, `zh`, `en`).
- Entrada de imagenes: la model card documenta el uso de `llama-mtmd-cli` con un fichero `mmproj-Hy4-flash-bf16.gguf` para describir imagenes, lo que indica capacidad multimodal vision-lenguaje.
- Servidor compatible con la API de OpenAI mediante `llama-server`, lo que habilita integracion con clientes y frameworks que usan dicho estandar.
- Soporte de plantillas de chat mediante `--jinja`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes o modos de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional local con privacidad de datos: el modelo puede ejecutarse en un equipo con 128 GB de memoria unificada (Mac M5 Max o RTX Spark) sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Descripcion y analisis de imagenes: mediante `llama-mtmd-cli` y el fichero mmproj, se puede pasar una imagen y obtener una descripcion textual, util para catalogacion o accesibilidad.
- Generacion de codigo en local: la model card reporta hasta 70 tok/s con Q3_K en Mac M5 Max en escenarios de generacion de codigo, lo que permite usar el modelo como asistente de programacion sin conexion.
- Despliegue de API compatible con OpenAI: con `llama-server` se expone un endpoint en `http://localhost:8080` que puede integrarse en aplicaciones existentes que consuman la API de OpenAI.
- Procesamiento de documentos largos en chino e ingles: aunque la longitud de contexto no se especifica, los ejemplos usan 8K tokens y las pruebas de velocidad cubren hasta 32K, lo que sugiere uso con documentos de extension media.
- Experimentacion e investigacion en cuantizacion: las cinco builds con distintas recetas (Q4_K_M, Q3_K, IQ2-AH, SPARK-4Bit) permiten comparar el equilibrio entre calidad, tamano y velocidad en hardware concreto.

## Benchmarks y rendimiento

La model card incluye una imagen de resultados de benchmark (`hy4-flash-gguf-benchmark.png`) pero no transcribe los valores numericos en texto, por lo que no se pueden presentar cifras de MMLU, HumanEval, GSM8K u otras. Los unicos datos numericos publicados son de velocidad de inferencia:

| Formato | Hardware | Prefill tok/s (4K / 16K / 32K) | Decode tok/s (4K / 16K / 32K) |
|---|---|---|---|
| Q4_K_M | Mac M5 Max 128GB | 629,8 / 448,1 / 418,6 | 48,13 / 45,18 / 44,15 |
| Q3_K | Mac M5 Max 128GB | 743,2 / 563,0 / 520,6 | 50,34 / 49,47 / 47,37 |
| SPARK-4Bit-Fast | RTX Spark 128GB | 799 / 717 / 707 | 31,95 / 33,14 / 33,39 |
| SPARK-4Bit | RTX Spark 128GB | 765 / 686 / 666 | 25,80 / 28,16 / 30,3 |

Para generacion de codigo, la model card indica hasta 70 tok/s con Q3_K en Mac M5 Max y hasta 40 tok/s con SPARK-4Bit-Fast en RTX Spark.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en texto en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: entre 125,73 GiB (IQ2-AH) y 156,79 GiB (Q4_K_M) para los pesos, mas overhead de contexto y KV cache.
- Hardware validado en la model card: Mac M5 Max con 128 GB de memoria unificada y RTX Spark con 128 GB.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) ni en configuraciones de menos de 128 GB de memoria agregada.
- Despliegue mediante llama.cpp, con soporte en la PR #32517 (no fusionada en el momento de la publicacion). Compilacion con `-DGGML_CUDA=ON` para NVIDIA y Metal por defecto en macOS.
- Servidor compatible con OpenAI via `llama-server`; CLI interactiva via `llama-cli`; entrada multimodal via `llama-mtmd-cli`.
- Throughput medido: prefill de 418 a 799 tok/s y decode de 25 a 50 tok/s segun formato y hardware (ver tabla de benchmarks).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Los datos de parametros, contexto, rendimiento y licencia de alternativas de la misma categoria no estan disponibles en esta ficha, por lo que la comparativa se indica como no disponible.

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible; es imprescindible verificar los terminos del modelo base `tencent/Hy4-flash` antes de cualquier uso comercial.
- El soporte en llama.cpp depende de una PR no fusionada (#32517), lo que implica que la integracion puede cambiar y no es estable para produccion sin fijar una version concreta.
- El modelo solo declara soporte para chino e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- La longitud de contexto no se especifica; los ejemplos usan 8K y las pruebas llegan a 32K, pero no se confirma el maximo soportado.
- No se documentan mitigaciones de sesgos ni evaluaciones de alucinacion; como todo modelo de lenguaje, existe riesgo de generar contenido incorrecto, especialmente en tareas factuales.
- El tamano del repositorio (747,2 GB) y de cada build (125-157 GiB) exige almacenamiento considerable y descargas multi-parte.
- Las cuantizaciones agresivas (IQ2-AH a 2,0625 bpw en expertos) pueden degradar la calidad respecto al modelo base; la model card no cuantifica esa perdida en texto.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deben asumirse en integraciones que las requieran.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.21233
- Documentacion de AngelSlim: https://angelslim.readthedocs.io/
- Organizacion AngelSlim en Hugging Face: https://huggingface.co/AngelSlim
- Organizacion AngelSlim en ModelScope: https://modelscope.cn/organization/AngelSlim
- Repositorio GitHub de AngelSlim: https://github.com/Tencent/AngelSlim
- PR de llama.cpp con soporte para Hy4-flash: https://github.com/ggml-org/llama.cpp/pull/32517
- README para Mac Metal: https://huggingface.co/AngelSlim/Hy4-flash-GGUF/blob/main/README_MAC-Metal.md
- README para SPARK-4Bit: https://huggingface.co/AngelSlim/Hy4-flash-GGUF/blob/main/README_SPARK-4Bit.md
- Discord: https://discord.com/invite/dHVNeuNdFt
