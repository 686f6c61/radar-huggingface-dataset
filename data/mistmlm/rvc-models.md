# mistmlm/rvc-models

## Resumen

`mistmlm/rvc-models` no es un modelo de lenguaje, sino un repositorio de artefactos de build para un pipeline de conversión de voz (RVC v2, Retrieval-based Voice Conversion). Lo publica el usuario `mistmlm` en Hugging Face y contiene grafos QNN compilados para la NPU Hexagon del Snapdragon 8 Elite (y, por compatibilidad hacia atrás, de las series 8 Gen 2 y 8 Gen 3), checkpoints de entrenamiento en PyTorch (`.pth`), índices de recuperación por voz y manifiestos JSON con formas de entrada/salida de cada grafo.

El objetivo del repositorio es servir de espejo (mirror) de los binarios grandes que no se versionan en el repositorio git del proyecto: los scripts de build, los manifiestos y los ficheros `voice.json` viven en git, mientras que los `.bin`, `.pth`, `.pt` e `.index` se suben aquí mediante `hf upload`. La fuente de verdad son los checkpoints `.pth` junto con los scripts de las etapas `stage1` a `stage5`, que permiten regenerar los grafos QNN de forma reproducible con el SDK de Qualcomm (QAIRT 2.51.40).

El repositorio está pensado para desarrolladores que trabajan en las aplicaciones Android hermanas (`rvc-android`, `beatrice-android`) y en el motor web `beatrice-web`. No contiene pesos de un modelo fundacional ni una model card al uso: la información disponible describe el layout del pipeline, la arquitectura de runtime (SoC y versión HTP) y el proceso de build, pero no especifica parámetros, contexto, idiomas ni benchmarks del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline RVC v2 (HuBERT + RMVPE + sintetizador NSF) compilado a grafos QNN para NPU Hexagon |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (grafos QNN compilados; no se documentan precisiones) |
| Idiomas soportados | no disponible |
| Licencia | Scripts y documentacion: GPL-3.0-only; pesos y datos de voz: terminos upstream (ver `NOTICE`) |
| Formato de pesos | `.pth` (checkpoints PyTorch), `.bin` (grafos QNN compilados), `.index` (indices de retrieval), `.npz` (conv0_gn), ONNX (export intermedio) |

## Arquitectura y entrenamiento

El pipeline se organiza en cinco etapas reproducibles (`stage1` a `stage5`). La etapa 1 exporta a ONNX el extractor de características HuBERT, el estimador de pitch RMVPE y el sintetizador. La etapa 2 precalcula las funciones seno y gate del componente NSF (Neural Source Filter). Las etapas 3, 4 y 5 compilan HuBERT, RMVPE y el sintetizador a grafos QNN para la NPU Hexagon, y la etapa `stage5b` gestiona el decodificador NSF externo. Los grafos se organizan en `models/packs/shared/` (HuBERT c0/r/enc, RMVPE, conv0_gn) y `models/packs/voices/<name>/` (encflow, flowreverse, decnsf, `retrieval.index`, `voice.json` y manifiestos QNN por voz).

Los grafos compilados son específicos del SoC. Según la model card, todos los packs están ahora en v73 (SM8550, Hexagon v73, Snapdragon 8 Gen 2), lo que permite que un único conjunto de packs cubra 8 Gen 2, 8 Gen 3 y, por compatibilidad hacia delante, 8 Elite (v79 ejecuta grafos v73, pero no al revés). El APK actual solo incluye el runtime V79 (`libQnnHtpV79Skel/Stub`); para 8 Gen 2/3 hace falta el Skel/Stub V73/V75 correspondiente de QAIRT, y para 8 Gen 1 (v69) se requiere recompilación completa. El pack `mygf_wh` se migró de v79 (S25) a v73 mediante re-link de los mismos DLCs (`hub.submit_link_job`), sin reexportar, y ambos builds producen audio bit-idéntico para la misma entrada.

No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO (no aplica en un pipeline de conversión de voz). Tampoco se detalla la innovación técnica más allá del propio despliegue en NPU Hexagon y la reproducibilidad de los artefactos a partir de los checkpoints.

## Capacidades

- Conversión de voz (voice conversion) mediante el pipeline RVC v2, con extracción de características HuBERT, estimación de pitch RMVPE y síntesis NSF.
- Inferencia en NPU Hexagon (QNN/HTP) en dispositivos Snapdragon 8 Gen 2, 8 Gen 3 y 8 Elite.
- Empaquetado por voz: cada voz incluye sus grafos `encflow`/`flowreverse`/`decnsf`, su `retrieval.index` y su `voice.json`.
- Índices de recuperación (retrieval) por voz para la etapa de búsqueda de features.
- Reproducibilidad de build: los grafos `.bin` se regeneran desde los `.pth` con los scripts de etapa y el SDK QNN.
- Verificación de integridad mediante `SHA256SUMS` de los ficheros espejados.
- Compatibilidad hacia delante: grafos v73 ejecutables en hardware v79 (8 Elite).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Conversión de voz en tiempo real en Android: los grafos QNN se despliegan en la NPU Hexagon de dispositivos Snapdragon 8 Gen 2/3/Elite, lo que permite ejecutar el pipeline RVC v2 sin depender de la CPU/GPU.
- Integración en la app `rvc-android`: el repositorio proporciona los packs compartidos y por voz que la aplicación carga directamente en runtime QNN/HTP.
- Integración en la app unificada `beatrice-android`: los mismos packs sirven para el modo RVC v2 junto con Beatrice rc.0.
- Motor web `beatrice-web`: la model card indica que el camino RVC ONNX está planificado, por lo que los checkpoints `.pth` y los exports ONNX de la etapa 1 son la base para esa ruta.
- Añadir nuevas voces: el desarrollador entrena o importa un checkpoint `.pth`, genera sus grafos con `stage1`-`stage5`, construye el `retrieval.index` y publica el pack en `models/packs/voices/<name>/`.
- Auditoría y reconstrucción de builds: a partir de los `.pth` y los scripts de etapa se pueden regenerar los `.bin` y comparar hashes con `SHA256SUMS` para verificar que un artefacto publicado corresponde al checkpoint declarado.
- Portar a otros SoC: el flujo `hub.submit_link_job` permite re-linkar los DLCs a otra versión HTP (por ejemplo, v75 o v79) sin reexportar, útil para dar soporte a nuevos dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una comparación cualitativa: los builds v73 y v79 del pack `mygf_wh` producen audio bit-idéntico para la misma entrada, y se verifica la compatibilidad de los context binaries con `qnn-context-binary-utility` (QAIRT 2.51.40).

## Requisitos de hardware

- NPU objetivo: Hexagon en Snapdragon 8 Gen 2 (SM8550, HTP v73), 8 Gen 3 (v75) y 8 Elite (v79, ejecutando grafos v73).
- Runtime: QAIRT 2.51.40 o compatible; el APK actual incluye solo `libQnnHtpV79Skel/Stub`. Para 8 Gen 2/3 se necesita el Skel/Stub V73/V75 de QAIRT; para 8 Gen 1 (v69) hace falta recompilar.
- Build: SDK QNN requerido para regenerar los `.bin` desde los `.pth` con los scripts de etapa.
- Almacenamiento: el repositorio de Hugging Face ocupa 0.0 GB según los metadatos, aunque los binarios (`models/packs/`) se espejan aparte y no se cuantifican en la información disponible.
- VRAM/RAM, GPU recomendadas, latencia y throughput: no disponible.
- Opciones de despliegue: aplicaciones Android `rvc-android` y `beatrice-android` (QNN/HTP); motor web `beatrice-web` con ruta ONNX planificada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de artefacto).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de conversión de voz ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no soporta tool calling ni agentes.
- Los grafos QNN son específicos de SoC y versión HTP; un pack v73 no se ejecuta en hardware v69 sin recompilación, y un pack v79 no se ejecuta en v73.
- El APK actual solo trae el runtime V79; desplegar en 8 Gen 2/3 requiere añadir los Skel/Stub V73/V75 de QAIRT.
- Los binarios grandes (`.bin`, `.pth`, `.pt`, `.index`) no se versionan en git: si no se descargan del espejo de Hugging Face, el repositorio git por sí solo no es funcional.
- La licencia de los scripts y la documentación es GPL-3.0-only, pero los pesos y datos de voz conservan sus términos upstream (ver `NOTICE`); es necesario revisarlos antes de uso comercial o redistribución.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo generativo de texto.
- El uso de conversión de voz plantea riesgos de suplantación de identidad y requiere consentimiento de las voces fuente; la model card no incluye salvaguardas al respecto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay pipeline, licencia ni idiomas declarados en los metadatos de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mistmlm/rvc-models
- Repositorio hermano `rvc-android` (app Android RVC-only, QNN/HTP): referenciado como `../rvc-android` en la model card, sin URL pública en la información disponible.
- Repositorio hermano `beatrice-android` (app unificada Beatrice rc.0 + RVC v2): referenciado como `../beatrice-android`, sin URL pública en la información disponible.
- Repositorio hermano `beatrice-web` (motor web, ruta RVC ONNX planificada): referenciado como `../beatrice-web`, sin URL pública en la información disponible.
- QAIRT / QNN SDK de Qualcomm: no se proporciona URL en la información disponible.
- Paper, blog o demo: no disponible.
