# daruokta/bifocalgemma-archive

## Resumen

`daruokta/bifocalgemma-archive` es un repositorio de archivo publicado por el usuario daruokta que consolida 12 repositorios experimentales previos del proyecto BifocalGemma, correspondientes a las versiones legacy v1 y a las primeras ejecuciones de v2. No se trata de un modelo entrenado y listo para inferencia, sino de un contenedor de artefactos: pesos en formato safetensors, checkpoints intermedios, conjuntos de resultados de pilotos y assets auxiliares. El repositorio se creó el 2 de noviembre de 2026 como paso previo al lanzamiento de una ejecución unificada de 10 modelos en `daruokta/bifocalgemma-2026-11-02`.

El contenido abarca 3.111 ficheros y 35,30 GB (37.904.428.067 bytes). Entre los subrepositorios archivados hay variantes SFT, backups de checkpoints, y varias configuraciones de la serie v2 con nomenclatura que sugiere combinaciones de modelos base e instruction-tuned (por ejemplo, `bifocalgemma-v2-e4b-it`, `bifocalgemma-v2-e4b-e4b`, `bifocalgemma-v2-4it-2it` o `bifocalgemma-v2-2base-2it`). La nomenclatura "e2b"/"e4b" y "2it"/"4it" apunta a variantes de tamaño o a composiciones de dos y cuatro componentes, aunque la model card no explicita la arquitectura ni el número de parámetros.

La relevancia de este repositorio es documental y de trazabilidad: permite a quien investigue el proyecto BifocalGemma recuperar el estado exacto de cada experimento (con SHA de commit original) y reproducir o auditar las ejecuciones anteriores. Para uso práctico en producción no es un artefacto adecuado, ya que no incluye una model card con especificaciones de inferencia, ni pipeline declarado, ni idiomas soportados, y el propio autor lo etiqueta como "archive".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos archivados estan en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos principales); el repositorio incluye tambien ficheros LFS y JSON de manifiesto |
| Tamano del repositorio | 33,8 GB en Hugging Face; 35,30 GB segun el manifiesto del autor (37.904.428.067 bytes) |
| Numero de ficheros | 3.111 |
| Subrepositorios consolidados | 12 (10 de tipo model, 2 de tipo dataset) |
| Fecha de archivado | 2026-11-02 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de los modelos BifocalGemma. La model card es un manifiesto de archivado, no una ficha tecnica de modelo: no indica si se trata de transformers densos, mezcla de expertos, modelos híbridos o composiciones multi-modelo. La nomenclatura de los subrepositorios (`e2b`, `e4b`, `2it`, `4it`, `2base`) sugiere variantes de tamano y combinaciones de componentes base e instruction-tuned, pero no se aporta ninguna confirmacion ni detalle sobre el numero de parametros, la tokenizacion o la ventana de contexto.

Tampoco se documentan los datos de entrenamiento: no hay referencia al numero de tokens, a la composicion del corpus, ni a si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT (aunque la existencia de un subrepositorio llamado `bifocalgemma-sft` indica que al menos una fase de fine-tuning supervisado se llevo a cabo). El subrepositorio `bifocalgemma-pilot-results` (23 GB, 2.486 ficheros) contiene presumiblemente resultados de evaluaciones piloto, pero su contenido no se detalla en la model card. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- No se documentan capacidades funcionales del modelo en la informacion disponible.
- No se confirma soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni de razonamiento multi-paso.
- No se confirma capacidad multilingue ni se listan idiomas.
- No se confirma la existencia de modos especiales (thinking mode, vision, audio).
- El repositorio contiene artefactos de pesos y resultados de experimentos, no una interfaz de inferencia documentada.

## Casos de uso

- Auditoria y trazabilidad de experimentos: el repositorio permite recuperar el estado exacto de cada uno de los 12 subrepositorios archivados mediante su SHA de commit original, lo que facilita la reproducibilidad de resultados previos del proyecto BifocalGemma.
- Arqueologia de modelos: investigadores que necesiten comparar las variantes v1 y v2 (`e2b-it`, `e4b-it`, `4it-2it`, etc.) pueden descargar selectivamente los subdirectorios correspondientes sin depender de que los repositorios originales sigan publicados.
- Recuperacion tras borrado de repositorios: si alguno de los repositorios fuente se elimina o se hace privado, este archivo consolidado conserva los pesos y los metadatos de commit.
- Analisis de resultados de pilotos: el subdirectorio `legacy_v1/bifocalgemma-pilot-results/` (23 GB) puede servir para estudiar las metricas y salidas de las evaluaciones preliminares, siempre que se conozca el formato interno de los ficheros.
- Archivado a largo plazo con licencia permisiva: al estar bajo Apache 2.0, el contenido puede conservarse y redistribuirse en espejos internos de una organizacion sin restricciones adicionales de licencia.
- Base para una futura ejecucion unificada: el autor indica que este archivo precede a `daruokta/bifocalgemma-2026-11-02`; quien quiera entender la genealogia de esa ejecucion de 10 modelos puede consultar aqui los estados anteriores.
- No se recomienda su uso para inferencia en produccion, atencion al cliente, generacion de codigo ni ninguna tarea funcional, al no existir documentacion de capacidades ni de formato de prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye metadatos de archivado (tamano, numero de ficheros, SHA de commit), sin tablas de MMLU, HumanEval, GSM8K ni metricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y la arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas; el repositorio no incluye configuracion de serving ni tokenizer declarado en la model card.
- Latencia y throughput estimados: no disponibles.
- Requisito de almacenamiento: al menos 33,8 GB para clonar el repositorio completo; conviene usar descarga selectiva por subcarpeta dado que el mayor peso corresponde a `legacy_v1/bifocalgemma-pilot-results/` (23 GB) y a `legacy_v1/bifocalgemma-sft/` (4,3 GB).

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, ya que el objeto de este repositorio es un archivo de experimentos y no un modelo con especificaciones publicadas (parametros, contexto, benchmarks). La comparacion con alternativas como Gemma, Llama o Qwen no puede realizarse sin conocer la arquitectura y el tamano de los modelos BifocalGemma archivados.

## Limitaciones y advertencias

- El repositorio esta etiquetado como `archive` por el propio autor: no es un artefacto destinado a inferencia ni a produccion.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma, al no existir evaluacion publicada.
- La licencia Apache 2.0 permite uso comercial del contenido, pero la ausencia de model card tecnica impide verificar la procedencia de los datos de entrenamiento y las obligaciones de atribucion asociadas a posibles componentes de terceros.
- El repositorio mezcla modelos y datasets en un mismo contenedor, lo que complica la trazabilidad individual: es necesario consultar `ARCHIVE_MANIFEST.json` para identificar que ficheros pertenecen a cada subrepositorio.
- Los nombres de las variantes (`e2b`, `e4b`, `2it`, `4it`) no estan definidos en la model card; interpretarlos como tamanos de parametros o composiciones es una suposicion no confirmada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No hay garantia de que los pesos archivados sean cargables con versiones actuales de transformers u otras librerias, al no declararse la arquitectura ni el tokenizer.
- La fecha de creacion (2026-11-02) y el prefijo de la ejecucion unificada (`bifocalgemma-2026-11-02`) son coherentes con el calendario indicado, pero no se aporta informacion adicional sobre el estado del proyecto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daruokta/bifocalgemma-archive
- Ejecucion unificada sucesora: https://huggingface.co/daruokta/bifocalgemma-2026-11-02
- Manifiesto de archivo (referenciado en la model card): `ARCHIVE_MANIFEST.json` dentro del propio repositorio
- Repositorios fuente archivados (referenciados en la model card): `daruokta/bifocalgemma-sft`, `daruokta/bifocalgemma-checkpoints-backup-20261023`, `daruokta/bifocalgemma-v2-e4b-it`, `daruokta/bifocalgemma-v2-e2b-it`, `daruokta/bifocalgemma-v2-e4b-e4b`, `daruokta/bifocalgemma-v2-e2b-e2b`, `daruokta/bifocalgemma-v2-4it-2it`, `daruokta/bifocalgemma-v2-4base-2it`, `daruokta/bifocalgemma-v2-2it-2it`, `daruokta/bifocalgemma-v2-2base-2it`, `daruokta/bifocalgemma-v2-assets`, `daruokta/bifocalgemma-pilot-results`
- Paper, blog o demo: no disponibles en la informacion proporcionada.
