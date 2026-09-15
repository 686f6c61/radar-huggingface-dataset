# flyingfishinwater/coreai_models

## Resumen

`flyingfishinwater/coreai_models` es un repositorio de distribucion de bundles de Apple **Core AI** (`.aimodel` y `.aimodelc`) para iOS 27 y macOS 27, exportados desde pesos de PyTorch con la cadena de herramientas [`coreai-models`](https://github.com/apple/coreai-models) de Apple y compilados *ahead-of-time* (AOT) para el **Apple Neural Engine** (ANE). No es un modelo entrenado desde cero: el repositorio contiene artefactos de despliegue derivados de modelos existentes, en concreto `qwen3-0.6b-coreai`, una conversion de [Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B) de Alibaba Cloud con cuantizacion mixta 4 bits/8 bits aplicada durante la exportacion.

La relevancia del repositorio es de infraestructura mas que de modelado. En iOS el GPU se revoca cuando una aplicacion pasa a segundo plano, mientras que el Neural Engine sigue disponible; por eso estos bundles se compilan para ANE y permiten mantener inferencia en segundo plano (por ejemplo, desde una extension de teclado o un asistente en background). El autor mide en un iPhone 16 Pro Max (iPhone17,2, iOS 27.0) una decodificacion de 60,3 t/s en segundo plano frente a 76,5 t/s en primer plano, es decir, el 79 % del rendimiento en primer plano.

El repositorio ocupa 7,9 GB en total y contiene, como hojas independientes y autocontenidas, un bundle para iOS de 554 MB con contexto fijo de 4096 tokens (`qwen3-0.6b-coreai`, estructura *chunked-static* para ANE, arquitecturas `h17p`, `h18p` y `source`) y un bundle para macOS de 331 MB con contexto de 8192 tokens y formas dinamicas sobre GPU. Esta pensado para ser consumido por la aplicacion [Privacy AI](https://apps.apple.com/app/id6738392421), aunque al ser bundles Core AI estandar cualquier runtime capaz de cargar un modelo Core AI puede utilizarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B), exportada a grafo Core AI estatico para ANE (iOS) y dinamico para GPU (macOS) |
| Parametros totales | Aproximadamente 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens en el bundle de iOS; 8192 tokens en el bundle de macOS |
| Tipos de cuantizacion | Mixta 4 bits / 8 bits, aplicada durante la exportacion (nombre de artefacto: `qwen3_0_6b_mixed_4bit_8bit_static`) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (se redistribuye bajo la licencia original del modelo base, sin cambios) |
| Formato de pesos | Bundles Core AI: `.aimodel` (neutral respecto a arquitectura) y `.aimodelc` (compilado AOT), con `metadata.json` y directorio `tokenizer/` por bundle. No se publican safetensors ni GGUF |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID del repositorio | flyingfishinwater/coreai_models |
| Autor | flyingfishinwater |
| Tamano total del repositorio | 7,9 GB |
| Tamano del bundle iOS (`qwen3-0.6b-coreai`) | 554 MB |
| Tamano del bundle macOS (`qwen3-0.6b-coreai`) | 331 MB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Pipeline declarado | No disponible |
| Arquitecturas de silicio cubiertas | `h17p` (A18, A18 Pro), `h18p` (A19, A19 Pro) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de aproximadamente 0,6 mil millones de parametros, correspondiente a Qwen3-0.6B. El repositorio no contiene pesos entrenados por el autor: la model card indica explicitamente que no se reentreno ni se modifico ningun peso mas alla de la cuantizacion que aplica la propia exportacion. La conversion a formato Core AI se realizo con las recetas de exportacion de Apple (`coreai.llm.export`) y la compilacion con `coreai-build compile`. No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica relevante esta en el empaquetado y la compilacion, no en el modelado. En iOS las exportaciones usan formas estaticas, de modo que el contexto queda fijado en tiempo de exportacion y su KV cache permanece residente siempre que el modelo esta cargado. El propio autor advierte de una restriccion dura: el compilador de ANE rechaza cualquier grafo cuyo mayor tensor de KV supere aproximadamente 2,1x10^8 elementos. Ademas, `coreai-build compile` devuelve codigo de salida 0 y escribe un `.aimodelc` de aspecto completo incluso cuando la compilacion para ANE ha fallado por completo, dejando un bundle solo-GPU. La unica verificacion fiable que propone la model card es contar los ficheros de bitcode ANE por region (`find <bundle>.aimodelc -name '*.mlir.bc' | wc -l`, esperando tier x 3 x 2); los bundles publicados pasan esa comprobacion con 30/30 regiones para las compilaciones de contexto 4096.

La disposicion del repositorio separa `ios/<model-id>/<architecture>/` (compilado AOT para una generacion de silicio concreta), `ios/<model-id>/source/` (`.aimodel` neutral, ejecutable en cualquier chip, incluidos los no lanzados, a cambio de varios minutos de especializacion en la primera carga) y `macos/<model-id>/` (compilacion de macOS con formas dinamicas y GPU). Un bundle precompilado que coincida con la arquitectura carga en menos de un segundo con la cache caliente.

## Capacidades

- Generacion de texto conversacional (el campo `kind` del bundle es `chat`), heredada de Qwen3-0.6B.
- Inferencia local en dispositivo sobre Apple Neural Engine en iOS y sobre GPU en macOS, sin envio de datos a servidores externos.
- Ejecucion en segundo plano en iOS: a diferencia del GPU, el ANE no se revoca al pasar la aplicacion a background, lo que habilita extensiones de teclado y trabajo de asistente en background.
- Capacidad de carga desde cualquier runtime que sepa interpretar un bundle Core AI, no solo desde la aplicacion Privacy AI.
- Compatibilidad con tres variantes de bundle por modelo en iOS: `h17p` (A18, A18 Pro), `h18p` (A19, A19 Pro) y `source` (neutral respecto a arquitectura).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (la ficha del bundle no detalla idiomas).
- Modo de razonamiento explicito (*thinking*), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado y prediccion en extensiones de teclado de iOS: el bundle se compila para ANE precisamente porque la decodificacion en segundo plano mantiene 60,3 t/s frente a 76,5 t/s en primer plano, lo que permite sostener sugerencias de escritura sin que el sistema congele la inferencia al salir la app a background.
- Asistentes en background dentro de una app de iOS: tareas de resumen, reescritura o clasificacion que se ejecutan mientras la aplicacion no esta en primer plano, apoyandose en que el ANE no se revoca.
- Procesamiento de texto con privacidad estricta en el dispositivo: al ejecutarse localmente sobre Core AI, los datos del usuario no salen del dispositivo, lo que encaja en escenarios regulados (notas personales, salud, datos financieros) donde el envio a la nube no es aceptable.
- Chat conversacional ligero embebido en aplicaciones iOS 27: el bundle `qwen3-0.6b-coreai` es una hoja autocontenida de 554 MB con tokenizer incluido, de modo que se puede descargar exactamente un directorio y cargarlo sin dependencias externas.
- Asistente de escritura en macOS 27: la variante de 331 MB usa formas dinamicas sobre GPU con contexto de 8192 tokens, adecuada para redaccion, correccion y reescritura de documentos mas largos que en iOS.
- Sustitucion del modelo por arquitectura en tiempo de ejecucion: la estructura `h17p` / `h18p` / `source` permite que una app seleccione el bundle segun `AIModel.deviceArchitectureName` y caiga a `source` cuando no exista compilacion previa, lo que simplifica el soporte de dispositivos antiguos y futuros.
- Base para experimentacion con Core AI y el Neural Engine: el repositorio documenta el comando exacto de exportacion y compilacion, por lo que sirve como referencia reproducible para quien quiera portar otros modelos de la familia Qwen3 al formato Core AI.
- Verificacion de integridad en pipelines de publicacion: el chequeo del numero de ficheros `.mlir.bc` (`find ... | wc -l`, esperando tier x 3 x 2) es un caso de uso directo para validar automaticamente que un bundle contiene realmente bitcode de ANE y no un artefacto solo-GPU generado silenciosamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Lo unico medido y documentado por el autor es el rendimiento de inferencia de `qwen3-0.6b-coreai` en un iPhone 16 Pro Max (iPhone17,2, iOS 27.0):

| Estado de la aplicacion | Prefill | Decode |
|---|---|---|
| Primer plano | 84 t/s | 76,5 t/s |
| Segundo plano | 1507 t/s | 60,3 t/s |

El dato destacado por la model card es que la decodificacion en segundo plano alcanza el **79 %** de la de primer plano. No se proporcionan mediciones de latencia (TTFT), consumo energetico ni cifras equivalentes para el bundle de macOS.

## Requisitos de hardware

- Plataforma de ejecucion: Apple Neural Engine en iOS (bundle `qwen3-0.6b-coreai` de 554 MB, contexto 4096, formas estaticas) y GPU en macOS (bundle de 331 MB, contexto 8192, formas dinamicas). No es un modelo pensado para GPU de escritorio NVIDIA o AMD.
- Arquitecturas de silicio con bundle precompilado en iOS: `h17p` (A18, A18 Pro) y `h18p` (A19, A19 Pro). El directorio `source/` funciona en cualquier chip, incluidos los no lanzados, a cambio de varios minutos de especializacion en la primera carga.
- VRAM estimada para inferencia: no disponible. Los tamanos documentados son de bundle en disco (554 MB en iOS, 331 MB en macOS); la model card no publica la huella en memoria, aunque indica que el KV cache del bundle iOS permanece residente mientras el modelo esta cargado.
- GPU recomendadas: no aplica en el sentido habitual; la ejecucion es sobre ANE (iOS) o GPU integrada de Apple (macOS). No hay recomendaciones de A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en hardware de consumo: si, en iPhone con A18/A18 Pro o A19/A19 Pro y en equipos Mac con la build de macOS 27; no esta pensado para GPUs de consumo x86.
- Opciones de despliegue: runtime de Apple Core AI y cadena de herramientas `coreai-models` (exportacion con `coreai.llm.export` y compilacion con `xcrun coreai-build compile`). vLLM, llama.cpp, Ollama y TGI no son aplicables a bundles `.aimodelc`.
- Latencia y throughput estimados: disponibles solo para el bundle iOS en iPhone 16 Pro Max (84 t/s prefill en primer plano, 76,5 t/s decode en primer plano, 1507 t/s prefill y 60,3 t/s decode en segundo plano). Sin datos para macOS.
- Espacio en disco: el repositorio completo ocupa 7,9 GB, pero la model card indica que se debe descargar exactamente una hoja (554 MB para iOS o 331 MB para macOS), no el repositorio entero.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada otros bundles Core AI comparables con los que contrastar este repositorio. La unica comparacion posible es contra el modelo de origen:

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `qwen3-0.6b-coreai` (iOS, este repo) | ~0,6B | 4096 | `.aimodelc` / `.aimodel` para Core AI (ANE) | Mixta 4 bits / 8 bits | Apache 2.0 | Bundle publico de 554 MB |
| `qwen3-0.6b-coreai` (macOS, este repo) | ~0,6B | 8192 | `.aimodel` / `.aimodelc` para Core AI (GPU) | Mixta 4 bits / 8 bits | Apache 2.0 | Bundle publico de 331 MB |
| Qwen/Qwen3-0.6B (upstream) | ~0,6B | No disponible en la informacion proporcionada | Pesos PyTorch originales (no safetensors/GGUF en la informacion dada) | Sin cuantizar (pesos originales) | Apache 2.0 | Repositorio publico en HuggingFace |

No hay datos de benchmarks ni de contexto nativo del modelo upstream en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento entre la version Core AI y el original.

## Limitaciones y advertencias

- La compilacion para ANE puede fallar en silencio: `coreai-build compile` devuelve codigo 0 y genera un `.aimodelc` aparentemente completo aunque el grafo no se haya compilado para Neural Engine, dejando un bundle solo-GPU. En produccion es obligatorio verificar el numero de ficheros `.mlir.bc` (esperado: tier x 3 x 2; 30/30 regiones en las builds de contexto 4096).
- Limite duro del compilador: el mayor tensor de KV no puede superar aproximadamente 2,1x10^8 elementos, lo que restringe directamente la longitud de contexto alcanzable en las exportaciones estaticas para iOS.
- El contexto en iOS esta fijado en tiempo de exportacion (4096 tokens) y su KV cache queda residente siempre que el modelo esta cargado, con el coste de memoria asociado que ello implica.
- El bundle `source/` funciona en cualquier chip, pero la primera carga exige varios minutos de especializacion; solo los bundles precompilados que coinciden con la arquitectura cargan en menos de un segundo con la cache caliente.
- Riesgo de alucinacion: no documentado en la informacion proporcionada, pero es esperable en un modelo denso de ~0,6B. No hay evaluaciones publicadas que permitan cuantificarlo.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada; conviene validar el comportamiento multilingue antes de desplegar en produccion.
- Licencia: Apache 2.0, lo que permite uso comercial. Los modelos se redistribuyen bajo la licencia original, sin cambios, y la atribucion corresponde a Alibaba Cloud como autor de Qwen3-0.6B.
- Trazabilidad del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, y es una redistribucion de terceros. Conviene verificar la integridad de los bundles antes de integrarlos.
- Ambito de aplicacion muy restringido: los artefactos solo son utiles en el ecosistema Apple (iOS 27, macOS 27, Core AI, Neural Engine). No hay soporte para CUDA, ROCm ni runtimes de servidor.
- Facilidad de uso: cada hoja es autocontenida (`metadata.json`, `tokenizer/`, un unico asset), y la model card recomienda descargar exactamente una, no el repositorio completo de 7,9 GB.

## Enlaces

- Repositorio en HuggingFace: [flyingfishinwater/coreai_models](https://huggingface.co/flyingfishinwater/coreai_models)
- Modelo base: [Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- Cadena de herramientas de Apple: [apple/coreai-models](https://github.com/apple/coreai-models)
- Aplicacion que consume los bundles: [Privacy AI en el App Store](https://apps.apple.com/app/id6738392421)
- Licencia del bundle: fichero `LICENSE` del repositorio (Apache 2.0)
