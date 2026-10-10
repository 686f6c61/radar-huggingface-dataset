# publicarray/fieldnote-models

## Resumen

Fieldnote-models es un repositorio de HuggingFace publicado por el usuario publicarray que reúne varios modelos de lenguaje pequeños (SLM) empaquetados como bundles de Core AI de Apple, ya compilados *ahead-of-time* (AOT) para cada familia de chip de iPhone. No se trata de un modelo entrenado desde cero: los pesos provienen íntegramente de cuatro modelos base existentes —MiniCPM5 1B y 2B (OpenBMB), Qwen3.5 2B (equipo Qwen, Alibaba Cloud) y LFM2.5 1.2B Instruct (Liquid AI)— y se distribuyen sin modificar, salvo por la compilación para una arquitectura concreta.

El problema que resuelve es de despliegue en el borde: la aplicación Fieldnote, una grabadora de reuniones on-device, necesitaba escribir notas en el propio teléfono, y compilar los modelos más grandes en el dispositivo dejaba sin memoria a un iPhone 16. La solución consiste en ofrecer un bundle por familia de chip (`h17g`, `h17p`, `h18p`), de modo que el teléfono descargue el binario ya compilado en lugar de compilarlo localmente. Solo se realiza una especialización parcial en la primera carga.

El repositorio ocupa 18,3 GB y está etiquetado con `coreai`, `core-ai`, `apple`, `ios`, `iphone`, `on-device`, `neural-engine` y `text-generation`. La licencia es mixta: Apache 2.0 para los modelos de OpenBMB y Qwen, y LFM Open License v1.0 para LFM2.5. En el momento de redactar esta ficha acumula 0 descargas y 0 *likes*, por lo que carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los bundles son artefactos de exportacion y compilacion de los modelos base; la arquitectura interna no se detalla) |
| Parametros totales | 1B (MiniCPM5 1B), 2B (MiniCPM5 2B), 2B (Qwen3.5 2B), 1,2B (LFM2.5 1.2B Instruct) |
| Parametros activos | no aplica (no se indica que ninguno de los modelos sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exports `int8hu_block32_sym` para Qwen3.5 2B y LFM2.5 1.2B Instruct; no disponible para los bundles de MiniCPM5 |
| Idiomas soportados | no disponible |
| Licencia | mixta: Apache 2.0 (MiniCPM5 1B y 2B, Qwen3.5 2B) y LFM Open License v1.0 (LFM2.5 1.2B Instruct); el repositorio declara `apache-2.0-and-lfm1.0` |
| Formato de pesos | bundles Core AI compilados (`.aimodelc`) + `metadata.json` + `tokenizer/`; export portable Core AI como origen |
| Tamano del repositorio | 18,3 GB |
| Libreria | `coreai` |

Distribucion de bundles por chip:

| Carpeta | Modelo | Chip | Telefonos | Licencia |
|---|---|---|---|---|
| `ios-h17g` | MiniCPM5 1B | h17g | iPhone 16 family | Apache 2.0 |
| `ios-h17p` | MiniCPM5 1B | h17p | iPhone 16 family | Apache 2.0 |
| `ios-h18p` | MiniCPM5 1B | h18p | iPhone 17 Pro | Apache 2.0 |
| `minicpm5-2b/ios-h17p` | MiniCPM5 2B | h17p | iPhone 16 family | Apache 2.0 |
| `minicpm5-2b/ios-h18p` | MiniCPM5 2B | h18p | iPhone 17 Pro | Apache 2.0 |
| `qwen3.5-2b/ios-h17p` | Qwen3.5 2B | h17p | iPhone 16 family | Apache 2.0 |
| `qwen3.5-2b/ios-h18p` | Qwen3.5 2B | h18p | iPhone 17 Pro | Apache 2.0 |
| `lfm2.5-1.2b/ios-h17p` | LFM2.5 1.2B Instruct | h17p | iPhone 16 family | LFM Open License 1.0 |
| `lfm2.5-1.2b/ios-h18p` | LFM2.5 1.2B Instruct | h18p | iPhone 17 Pro | LFM Open License 1.0 |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo. Cada bundle es un *export* portable de Core AI compilado para un chip concreto, partiendo de exports previos de Core AI realizados por mlboydaisuke, los cuales a su vez derivan de los modelos originales. Las revisiones están fijadas (*pinned*): MiniCPM5 1B desde `mlboydaisuke/MiniCPM5-1B-CoreAI` (`ios-static/`, revision `f38d143e...`), MiniCPM5 2B desde `mlboydaisuke/MiniCPM5-2B-CoreAI` (`ios-static/`, revision `39db5ff9...`), Qwen3.5 2B desde `mlboydaisuke/qwen3.5-2B-CoreAI` (`gpu-pipelined-b2/qwen3_5_2b_decode_int8hu_block32_sym`, revision `14e77014...`) y LFM2.5 1.2B desde `mlboydaisuke/LFM2.5-1.2B-CoreAI` (`gpu-pipelined-b2/lfm2_5_1_2b_instruct_decode_int8hu_block32_sym`, revision `3e3241cb...`). Según el autor, los ficheros solo se han modificado mediante la compilación para un chip específico; los pesos no se han alterado.

La compilación se ejecuta en GitHub Actions con Xcode 27 y el Metal Toolchain, a través del flujo `compile-models.yml`, con el comando `xcrun coreai-build compile <model>.aimodel --platform iOS --min-deployment-version 27.0 --architecture <chip> --output <dir>`. En cuanto a las unidades de cómputo: los bundles de MiniCPM5 1B dejan la elección de unidad a Core AI, mientras que los de Qwen3.5, LFM2.5 y MiniCPM5 2B para `h18p` se compilan para el Neural Engine. Persiste cierta especialización on-device en la primera carga, aunque no la compilación completa.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, orientado a producir notas de reunion a partir de contenido en el dispositivo.
- Inferencia on-device en iPhone: los bundles se cargan con `CoreAILanguageModel(resourcesAt:)` sin necesidad de nube.
- Cuatro modelos alternativos en un solo repositorio, lo que permite elegir entre 1B, 1,2B y 2B segun el equilibrio entre calidad y huella en memoria.
- Optimizacion por familia de chip: cada bundle esta compilado para una arquitectura concreta (`h17g`, `h17p`, `h18p`) y se activa solo en dispositivos compatibles.
- Verificacion de integridad: el cargador de Fieldnote comprueba cada fichero con SHA-256 antes de usarlo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente, multi-step reasoning o modo thinking: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio no esta informado).

## Casos de uso

- Notas de reunion on-device: es el caso de uso original de Fieldnote. El modelo recibe el contenido de la reunion grabada en el iPhone y genera las notas directamente en el dispositivo, sin enviar datos a la nube.
- Aplicaciones de dictado y resumen offline: cualquier app iOS que necesite resumir o transformar texto en local puede cargar un bundle con Core AI, manteniendo los datos en el telefono.
- Privacidad en entornos regulados: al no requerir servidor, encaja en escenarios donde el contenido es sensible (sanidad, legal, notas personales) y no puede salir del dispositivo.
- Despliegue sin conectividad: en situaciones sin red (avion, zonas rurales, entornos aislados) la generacion de texto sigue funcionando porque el modelo ya esta descargado.
- Reduccion de costes de inferencia en el borde: al ejecutar en el Neural Engine o en la unidad que decida Core AI, se eliminan los costes por token de API en cargas repetitivas.
- Prototipado sobre Core AI: el repositorio sirve como ejemplo funcional de export portable, compilacion AOT con `coreai-build` y carga mediante `CoreAILanguageModel`, util para equipos que quieran reproducir el flujo.
- Distribucion selectiva por chip: un backend puede servir solo la carpeta cuyo `AIModel.deviceArchitectureName` coincide con el telefono, ahorrando ancho de banda frente a enviar el repositorio completo.
- Seleccion de modelo segun memoria disponible: en telefonos con menos margen se puede desplegar el bundle de 1B y reservar los de 2B para hardware mas capaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni similares, y tampoco ofrece cifras de latencia o throughput. Tampoco se documenta el impacto de la cuantizacion `int8hu_block32_sym` sobre la calidad respecto a los modelos originales.

## Requisitos de hardware

- Plataforma objetivo: iPhone con iOS 27. La beta de Fieldnote exige iPhone 15 Pro o posterior.
- Familias de chip soportadas: `h17g` y `h17p` (iPhone 16 family) y `h18p` (iPhone 17 Pro).
- Export portable: para dispositivos sin bundle compilado, el autor recomienda usar el export portable Core AI y dejar que Core AI lo compile en el propio dispositivo.
- Memoria: la model card indica que compilar los modelos mas grandes en un iPhone 16 agotaba la memoria, lo que motivo la distribucion de bundles AOT. No se facilitan cifras exactas de VRAM o RAM por modelo.
- Unidad de computo: MiniCPM5 1B deja la eleccion a Core AI; Qwen3.5 2B, LFM2.5 1.2B y MiniCPM5 2B para `h18p` se compilan para el Neural Engine.
- Tamano de descarga: el repositorio completo son 18,3 GB, aunque cada dispositivo solo necesita la carpeta correspondiente a su chip.
- Alternativas de despliegue en servidor (vLLM, llama.cpp, Ollama, TGI): no disponible; los artefactos estan pensados para Core AI en iOS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa de los modelos base incluidos en el repositorio. Los datos de rendimiento no estan disponibles en la informacion proporcionada, por lo que solo se comparan parametros, licencia y presencia en el repo.

| Modelo | Parametros | Licencia | Bundles en este repo | Notas |
|---|---|---|---|---|
| MiniCPM5 1B (OpenBMB) | 1B | Apache 2.0 | h17g, h17p, h18p | El unico con bundle para h17g; deja la unidad de computo a Core AI |
| MiniCPM5 2B (OpenBMB) | 2B | Apache 2.0 | h17p, h18p | El bundle h18p compila para Neural Engine |
| Qwen3.5 2B (equipo Qwen, Alibaba Cloud) | 2B | Apache 2.0 | h17p, h18p | Export con cuantizacion `int8hu_block32_sym` |
| LFM2.5 1.2B Instruct (Liquid AI) | 1,2B | LFM Open License v1.0 | h17p, h18p | Licencia restrictiva: uso comercial solo para organizaciones con ingresos anuales inferiores a 10 millones de USD |

No se conocen, a partir de la informacion proporcionada, resultados de benchmarks que permitan comparar el rendimiento real entre estos cuatro modelos ni frente a alternativas externas de tamano similar.

## Limitaciones y advertencias

- Es un repositorio de artefactos compilados, no un modelo entrenado por el autor; la calidad depende enteramente de los modelos base.
- Estado de adopcion minimo: 0 descargas y 0 likes, sin validacion de terceros.
- Requiere iOS 27 y chips concretos; un bundle compilado para `h17p` no es valido para otro chip, que debe usar el export portable.
- La licencia de LFM2.5 1.2B Instruct (LFM Open License v1.0) restringe el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de USD; hay que revisarla antes de usar ese bundle.
- Convivencia de licencias distintas (Apache 2.0 y LFM Open License) en un mismo repositorio, lo que obliga a comprobar el `LICENSE` de cada carpeta.
- La cuantizacion puede degradar la calidad respecto a los modelos originales; no se documenta el impacto.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni longitud de contexto.
- No se ofrecen cifras de memoria, latencia o throughput, lo que dificulta estimar el encaje en produccion.
- El repositorio completo pesa 18,3 GB; descargarlo entero es innecesario y costoso, conviene servir solo la carpeta del chip correspondiente.
- Las fechas del repositorio (creacion 2026-10-05, actualizacion 2026-10-10) son posteriores a la fecha habitual de referencia; conviene verificar su vigencia.
- El autor advierte de que parte de la especializacion ocurre en la primera carga en el dispositivo, por lo que el primer arranque puede ser mas lento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/publicarray/fieldnote-models
- Seccion de licencias del repositorio: https://huggingface.co/publicarray/fieldnote-models#licences
- Repositorio de Fieldnote en GitHub: https://github.com/array-ai/fieldnotes
- Flujo de compilacion `compile-models.yml`: https://github.com/array-ai/fieldnotes/blob/main/.github/workflows/compile-models.yml
- Beta de Fieldnote en TestFlight: https://testflight.apple.com/join/c2M82CMX
- Modelo base MiniCPM5 1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Modelo base MiniCPM5 2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo base Qwen3.5 2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base LFM2.5 1.2B Instruct: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Export Core AI de MiniCPM5 1B: https://huggingface.co/mlboydaisuke/MiniCPM5-1B-CoreAI
- Export Core AI de MiniCPM5 2B: https://huggingface.co/mlboydaisuke/MiniCPM5-2B-CoreAI
- Export Core AI de Qwen3.5 2B: https://huggingface.co/mlboydaisuke/qwen3.5-2B-CoreAI
- Export Core AI de LFM2.5 1.2B: https://huggingface.co/mlboydaisuke/LFM2.5-1.2B-CoreAI
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
