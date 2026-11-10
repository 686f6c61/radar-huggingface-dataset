# Grawnch/TokenWing-Model-Assets

## Resumen

TokenWing-Model-Assets es un repositorio de artefactos auxiliares publicado por el usuario Grawnch en Hugging Face. No contiene pesos de un modelo de lenguaje, sino ficheros complementarios precalculados (extensiones `.correction`, `.vram-experts.json` y `.experts.layer-order.json`) para dos modelos de terceros: `runmyai/Ling-3.0-Flash-TokenWing` (en cuantizacion MXFP4_MOE) y `runmyai/Flint-40B-TokenWing` (en cuantizacion UD-Q4_K_XL). El repositorio ocupa 0,6 GB y fue creado el 10 de noviembre de 2026.

La relevancia de este repositorio es instrumental: los ficheros `.vram-experts.json` y `.experts.layer-order.json` parecen describir el reparto de expertos por capa y su ubicacion en VRAM, lo que sugiere que TokenWing es un mecanismo de gestion de memoria para modelos MoE cuantizados, presumiblemente orientado a inferencia con offloading de expertos entre GPU y CPU. El fichero `.correction` de mayor tamano (372 MB para Ling 3.0 Flash) podria contener correcciones de pesos o del proceso de cuantizacion, aunque su naturaleza exacta no se documenta.

No se dispone de informacion sobre la arquitectura interna de Ling 3.0 Flash ni de Flint 40B mas alla de que son modelos MoE (por la etiqueta `moe` y el sufijo `MXFP4_MOE`), ni sobre sus parametros totales, contexto, licencia o idiomas. El repositorio no incluye model card tecnica del modelo base, solo una tabla de ficheros con checksums SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los modelos base estan etiquetados como MoE) |
| Parametros totales | no disponible (Flint 40B sugiere 40 mil millones por nombre, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4_MOE (Ling 3.0 Flash); UD-Q4_K_XL, variante GGUF Q4_K (Flint 40B) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ficheros auxiliares JSON y binarios `.correction`; los pesos referenciados son MXFP4 y GGUF |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No disponible. El repositorio no documenta la arquitectura de los modelos base. Las etiquetas indican que tanto Ling 3.0 Flash como Flint 40B son modelos de mezcla de expertos (MoE), y que el primero se distribuye en formato MXFP4 (formato de cuantizacion de 4 bits con escala compartida, habitual en stacks de inferencia de bajo nivel). El segundo se distribuye en GGUF con cuantizacion UD-Q4_K_XL, una variante de Q4_K optimizada por el autor de la cuantizacion (prefijo "UD" sugiere "Unsloth Dynamic" o similar, sin confirmar).

El unico contenido tecnico verificable del repositorio son los artefactos auxiliares: `vram-experts.json` (408 KB y 477 KB respectivamente), `experts.layer-order.json` (180 y 195 bytes) y `correction` (372 MB y 190 MB). El tamano del fichero `.correction` de Ling 3.0 Flash es aproximadamente el doble que el de Flint 40B, lo que podria indicar que contiene datos por experto proporcionales al numero de parametros o al numero de expertos del modelo, pero no hay documentacion que lo confirme. No se dispone de informacion sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones de atencion.

## Capacidades

- No se documentan capacidades del modelo en este repositorio; las capacidades pertenecen a los modelos base `runmyai/Ling-3.0-Flash-TokenWing` y `runmyai/Flint-40B-TokenWing`, cuyas model cards no se incluyen en la informacion disponible.
- El repositorio en si proporciona soporte de infraestructura: mapeo de expertos a VRAM y orden de capas para modelos MoE cuantizados.
- Compatibilidad declarada con cuantizaciones MXFP4 y GGUF Q4_K_XL.
- No se declara soporte de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Despliegue de modelos MoE cuantizados con offloading de expertos: los ficheros `vram-experts.json` permiten a un runtime saber que expertos caben en VRAM y cuales deben residir en RAM del sistema, lo que facilita ejecutar modelos MoE grandes en GPUs con memoria limitada.
- Inferencia de Ling 3.0 Flash en formato MXFP4: el fichero `.correction` y el mapeo de expertos permiten reconstruir o validar los pesos cuantizados durante la carga, reduciendo errores de cuantizacion en produccion.
- Ejecucion de Flint 40B en GGUF Q4_K_XL con llama.cpp u otro runtime compatible: el orden de capas (`experts.layer-order.json`) permite cargar los expertos en el orden correcto al hacer streaming desde disco o RAM.
- Reproducibilidad y verificacion de integridad: los checksums SHA-256 publicados permiten validar que los ficheros auxiliares no se han corrompido en la descarga o en un pipeline de CI.
- Investigacion sobre cuantizacion de MoE: los artefactos sirven para estudiar como se distribuyen los expertos por capa y su huella de memoria, util para comparar estrategias de cuantizacion (MXFP4 frente a Q4_K).
- Empaquetado de imagenes de contenedor para serving: al conocer el tamano exacto de los ficheros auxiliares (0,6 GB en total), se puede dimensionar el almacenamiento y la cache de un despliegue con vLLM, llama.cpp o TGI que consuma estos artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los modelos base; el repositorio solo aporta metadatos de reparto de expertos, no una estimacion de VRAM total.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los formatos referenciados (MXFP4 y GGUF Q4_K_XL) apuntan a runtimes como llama.cpp y sus derivados (Ollama, LM Studio) para GGUF; para MXFP4 se requiere un runtime con soporte de ese formato (por ejemplo, variantes recientes de vLLM o SGLang), sin confirmacion en la informacion disponible.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 0,6 GB, y los ficheros `.correction` suman aproximadamente 563 MB, por lo que el despliegue necesita ese espacio adicional sobre el de los pesos del modelo base.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables, dado que este repositorio no es un modelo sino un conjunto de artefactos auxiliares para modelos de terceros.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni model card tecnica; no debe tratarse como un modelo desplegable por si mismo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Licencia no especificada: no se puede confirmar el uso comercial de los artefactos ni de los modelos base a los que acompanan.
- Los checksums SHA-256 permiten verificar integridad, pero no garantizan que los artefactos sean correctos ni que correspondan a la version actual de los modelos base.
- Riesgo de desalineacion de version: si `runmyai/Ling-3.0-Flash-TokenWing` o `runmyai/Flint-40B-TokenWing` se actualizan, los ficheros de correccion y mapeo pueden quedar obsoletos y producir fallos de carga o resultados incorrectos.
- No hay informacion sobre sesgos, alucinacion ni limitaciones linguisticas de los modelos base.
- El resultado de busqueda web proporcionado (sobre collateralization) no guarda relacion con el modelo y no aporta datos tecnicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Grawnch/TokenWing-Model-Assets
- Modelo base Ling 3.0 Flash (referenciado): https://huggingface.co/runmyai/Ling-3.0-Flash-TokenWing
- Modelo base Flint 40B (referenciado): https://huggingface.co/runmyai/Flint-40B-TokenWing
- Papers, blogs, repos o demos adicionales: no disponibles en la informacion proporcionada.
