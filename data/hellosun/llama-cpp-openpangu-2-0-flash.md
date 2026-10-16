# HelloSun/llama.cpp-openPangu-2.0-Flash

## Resumen

El repositorio HelloSun/llama.cpp-openPangu-2.0-Flash no contiene pesos de un modelo, sino un parche que añade soporte para el modelo openPangu-2.0-Flash dentro de llama.cpp, concretamente sobre la versión v0.7.0 (commit `620d2225cc436ab0b001e3200e590e3b286ef9ab`, fechado el 15 de octubre de 2026). El autor, HelloSun, ha portado y adaptado el trabajo previo de mrexodia/llama.cpp-openPangu-2.0-Flash, que estaba basado en una versión anterior de llama.cpp, y lo ha rebasado sobre la release actual del proyecto. El parche incluye 40 ficheros con +2845 / −49 líneas, además de un script `patch.sh` que descarga el commit fijado de llama.cpp, aplica el parche e imprime las instrucciones de compilación y ejecución.

El modelo objetivo, openPangu-2.0-Flash, es un transformer de tipo Mixture of Experts (MoE) con 92B parámetros totales y aproximadamente 6B parámetros activos por token, y una ventana de contexto de 512K tokens. La arquitectura propietaria `openpangu-v2` incorpora atención MLA absorbida, atención dispersa DSA con selección top-2048, atención de ventana deslizante híbrida (iSWA), hyper-connections de manifold de 4 flujos (mHC), convoluciones causales MoME y 128 attention sinks aprendidos por capa. El parche implementa kernels fusionados para la cadena de mezcla mHC, la puntuación del indexador DSA y la selección top-k, además de decodificación auto-especulativa por multi-token prediction (MTP).

La relevancia de este repositorio es de infraestructura: permite ejecutar un modelo MoE de 92B con contexto muy largo en llama.cpp, incluyendo entornos sin GPU. La model card documenta pruebas de memoria reales sobre CPU (Intel Xeon Platinum 8559C con AMX, 16 vCPU) y resultados de la suite de tests internos, lo que resulta útil para quien necesite dimensionar el despliegue antes de descargar los ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | openpangu-v2: MoE transformer con MLA absorbida, DSA (sparse attention, top-2048), sliding-window attention híbrida (iSWA), mHC de 4 flujos, convoluciones MoME y 128 attention sinks por capa |
| Parametros totales | 92B (91,6B medidos en la cuantización Q3_K_M) |
| Parametros activos | ~6B (MoE) |
| Longitud de contexto | 512K tokens (524288; los ejemplos usan `-c 65536`) |
| Tipos de cuantizacion | Base: Q3_K_M (40,7 GiB), Q4_K_M (51,5 GiB), Q8_0 (90,8 GiB), BF16 (170,7 GiB). Cabezal MTP: Q8_0 (9,2 GiB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelos alojados en mrexodia/openPangu-2.0-Flash-GGUF); este repositorio contiene un parche `.diff` |
| Tipo de repositorio | Parche de soporte para llama.cpp, no pesos de modelo |
| Version de llama.cpp objetivo | v0.7.0, commit `620d2225cc436ab0b001e3200e590e3b286ef9ab` (15-10-2026) |
| Tamano del parche | 40 ficheros, +2845 / −49 lineas |
| Ficheros incluidos | `llama.cpp-openpangu-v0.7.0.diff`, `patch.sh` |
| Backends soportados | CPU (incluido AMX), CUDA, Metal, Vulkan (los kernels fusionados tienen fallback a operaciones no fusionadas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura `openpangu-v2` que implementa el parche combina varios mecanismos de atención y mezcla poco habituales. La atención MLA absorbida almacena las matrices `wk_b`/`wv_b` de forma contigua, lo que permite una caché KV muy comprimida (unos 12 GB para 512K tokens según la model card). Sobre las capas globales se aplica DSA (atención dispersa) con un lightning-indexer que en decodificación selecciona únicamente los 2048 tokens mejor puntuados más los sinks; en prefilling, la puntuación del indexador se calcula con un kernel por teselas que evita el intermedio de puntuación de varios GB. Las capas restantes usan sliding-window attention por capa a través de una caché híbrida iSWA. La mezcla de representaciones se realiza con hyper-connections de manifold de 4 flujos (mHC) y convoluciones causales MoME con estado recurrente entre lotes.

El parche añade kernels fusionados para la cadena de mezcla mHC (`GGML_OP_SINKHORN`, `GGML_OP_HC_MIX`), la puntuación del indexador DSA (`GGML_OP_DSA_SCORE`, con versión por teselas en prefilling) y la selección top-k por radix-select (`GGML_OP_TOP_K`). En decodificación se usa gather sobre los tokens seleccionados. También se implementa decodificación auto-especulativa por multi-token prediction con un modelo borrador MTP separado (`--spec-type draft-mtp` y el GGUF `openPangu-2.0-Flash-mtp-Q8_0.gguf`). Se incluye soporte de chat con tool calling y parseo del razonamiento ` thinking` para la plantilla de openPangu, así como herramientas de conversión HF → GGUF (`conversion/pangu.py`) y de separación base/MTP (`conversion/split_pangu_mtp.py`).

No hay información disponible sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos ni si se aplicaron etapas de RLHF o DPO. La model card de este repositorio describe exclusivamente el parche de inferencia, no el entrenamiento del modelo.

## Capacidades

- Generación de texto y razonamiento en modo chat, con parseo del bloque ` thinking` de la plantilla de openPangu.
- Tool calling / function calling a través del parser de chat `build_chat_peg_parser` de llama.cpp v0.7.0.
- Contexto largo de hasta 512K tokens, con atención dispersa que reduce el coste computacional en decodificación atendiendo solo a los 2048 tokens seleccionados más los sinks.
- Decodificación auto-especulativa mediante un cabezal MTP entrenado aparte, que puede acelerar la generación cuando el hardware lo permite.
- Ejecución en CPU sin GPU, con soporte opcional de kernels CUDA, Metal y Vulkan.
- Conversión de pesos desde HuggingFace a GGUF y separación del cabezal MTP mediante utilidades incluidas.
- No hay información disponible sobre capacidades multimodales (visión o audio) ni sobre el conjunto de idiomas soportados por el modelo base.

## Casos de uso

- Analisis de documentos largos en local: con 512K tokens de contexto y una caché KV comprimida de unos 12 GB, es posible procesar libros completos, expedientes o repositorios de código sin trocear, en una sola pasada y sin GPU.
- Despliegue en aire aislado (air-gapped): al ser un parche de llama.cpp sin dependencias de servicios en la nube, permite ejecutar un MoE de 92B en máquinas con CPU y RAM abundante donde no se permite tráfico externo.
- Asistente de chat con tool calling: el parser de plantilla y el soporte de function calling permiten integrar el modelo en un backend tipo `llama-server` que exponga una API compatible para orquestar llamadas a herramientas.
- Razonamiento multi-paso con modo thinking: el parseo del bloque ` thinking` facilita separar la traza de razonamiento de la respuesta final, útil en pipelines que auditan o filtran el razonamiento intermedio.
- Generacion de codigo asistida: el modelo admite conversaciones multi-turno con contexto largo, lo que permite incluir ficheros completos o historiales de repositorio como contexto en tareas de autocompletado y refactorización.
- Servicio de inferencia por lotes en CPU: con `-c 65536` y varios hilos (`-t $(nproc)`), se puede desplegar un servidor HTTP local con `llama-server` para tareas de resumen y clasificación sobre grandes volúmenes de texto.
- Investigacion sobre atencion dispersa: los kernels DSA, iSWA y top-k del parche sirven como banco de pruebas para estudiar el comportamiento de atención dispersa a escala de 512K tokens.
- Evaluacion de decodificacion especulativa MTP: el repositorio incluye el cabezal borrador y las opciones de línea de comandos para medir la ganancia de la auto-especulación en distintos hardwares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card únicamente aporta medidas de memoria residente y resultados de la suite de tests de llama.cpp, obtenidos en un entorno CPU-only (Intel Xeon Platinum 8559C con AMX, contenedor limitado a 16 vCPU y 64 GiB de RAM por proceso, gcc 14.2.0, CMake 3.31.6) con el modelo `openPangu-2.0-Flash-base-Q3_K_M.gguf` (40,72 GiB, 91,6B parámetros), usando `-c 512` y `-n 1`:

| Configuracion | Memoria residente maxima (RSS) |
|---|---|
| Por defecto (repacking de pesos AMX activado) | ~57,1 GiB |
| `-nr` (sin repacking) | ~41,2 GiB |
| `-nr` + borrador MTP (Q8_0) | ~52 GiB |
| Por defecto + borrador MTP (Q8_0) | supera los 64 GiB, no se pudo ejecutar bajo el limite de prueba |

Resultados de la suite de tests incluidos en la model card:

| Test | Resultado |
|---|---|
| `test-backend-ops -b CPU -o SINKHORN -o HC_MIX -o DSA_SCORE -o TOP_K` | 534/534 correctos |
| `test-chat`, `test-chat-template`, `test-chat-peg-parser`, `test-chat-auto-parser` | correctos |

No se proporcionan cifras de latencia ni de throughput (tokens por segundo) en la información disponible.

## Requisitos de hardware

- Memoria necesaria según cuantización (tamaño del fichero GGUF): Q3_K_M 40,7 GiB; Q4_K_M 51,5 GiB; Q8_0 90,8 GiB; BF16 170,7 GiB. El borrador MTP Q8_0 añade 9,2 GiB.
- Con repacking de pesos AMX activado (por defecto), el consumo en CPU sube a unos 57,1 GiB para Q3_K_M; con `-nr` baja a unos 41,2 GiB.
- Caché KV: la model card indica que la caché MLA comprimida necesita unos 12 GB para la ventana completa de 512K tokens.
- Cabe en CPU y RAM convencionales: no requiere GPU. La ejecución es viable con CPU-only, según las pruebas documentadas.
- GPU: ninguna de las cuantizaciones disponibles cabe en una GPU de consumo de 24 GB (RTX 4090, RTX 3090) sin descarga parcial a RAM. Una GPU de 80 GB (A100 80 GB, H100 80 GB) puede alojar Q3_K_M y Q4_K_M completos, pero no Q8_0 (90,8 GiB) ni BF16 (170,7 GiB); estas requieren múltiples GPU o ejecución híbrida CPU+GPU.
- Opciones de despliegue: exclusivamente llama.cpp (`llama-cli`, `llama-server`) a través del parche. No hay indicios de soporte para vLLM, TGI, Ollama ni otros servidores en la información disponible.
- Compilación: requiere CMake ≥ 3.14 y un compilador C++17. Se puede habilitar CUDA con `-DGGML_CUDA=ON`; también se mencionan Metal y Vulkan como backends soportados con fallback a operaciones no fusionadas.
- Aviso sobre MTP en CPU: la model card indica que, en configuraciones CPU-only, el sobrecoste del borrador puede hacer que la generación sea más lenta que la decodificación simple, y recomienda medirlo con `llama-cli` porque `llama-bench` no soporta modelos borrador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La única comparación documentada es entre este parche y el fork original del que deriva:

| Repositorio | Base de llama.cpp | Estado |
|---|---|---|
| HelloSun/llama.cpp-openPangu-2.0-Flash | v0.7.0 (commit `620d2225...`, 15-10-2026) | Adaptado a las APIs de v0.7.0, con corrección del empaquetado AMX para tensores por lotes |
| mrexodia/llama.cpp-openPangu-2.0-Flash | Versión anterior de llama.cpp | Origen del port |

Para comparar openPangu-2.0-Flash con otros MoE de tamaño similar (por ejemplo, alternativas de ~90-100B con pocos parámetros activos), no hay datos de parámetros activos, contexto o rendimiento de esos otros modelos en la información disponible, por lo que la comparativa queda como "no disponible".

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible, ni para este parche ni para el modelo openPangu-2.0-Flash, por lo que el uso comercial queda sin determinar.
- El repositorio tiene 0 descargas y 0 likes, y su contenido no está verificado por terceros; conviene revisar el diff antes de aplicarlo en producción.
- No hay información sobre el desarrollador original del modelo, los idiomas soportados, los datos de entrenamiento ni los sesgos conocidos.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.), solo medidas de memoria y tests funcionales de llama.cpp.
- La model card está truncada: el apartado "Comparison with the original fork" aparece cortado en el texto disponible, por lo que puede faltar información sobre diferencias de comportamiento y rendimiento.
- Riesgo de alucinación: no documentado en la información disponible; aplican los riesgos habituales de un modelo generativo sin datos de evaluación publicados.
- El repacking de pesos AMX por defecto consume unos 16 GiB adicionales de RAM; si el conjunto no cabe, hay que ejecutar con `-nr`, y el borrador MTP añade unos 10 GB más.
- Con el borrador MTP activado, el consumo por defecto supera los 64 GiB en el entorno de prueba documentado, lo que puede impedir su uso en máquinas con menos memoria.
- El parche corrige un fallo del empaquetado AMX que corrompía pesos cuantizados por lotes (los tensores MLA `wk_b`/`wv_b`), un síntoma que producía salidas incoherentes; es importante aplicar la versión corregida y no el fork original sobre bases antiguas.
- El soporte está atado a un commit concreto de llama.cpp (`620d2225cc436ab0b001e3200e590e3b286ef9ab`); actualizar llama.cpp por encima de esa base puede romper la compilación del parche.

## Enlaces

- Repositorio del parche en HuggingFace: https://huggingface.co/HelloSun/llama.cpp-openPangu-2.0-Flash
- Fork original del parche (mrexodia): https://github.com/mrexodia/llama.cpp-openPangu-2.0-Flash
- Modelos GGUF de openPangu-2.0-Flash: https://huggingface.co/mrexodia/openPangu-2.0-Flash-GGUF
- Ficheros del parche: `llama.cpp-openpangu-v0.7.0.diff` y `patch.sh` (incluidos en el repositorio de HuggingFace)
- Documentación y repositorio de llama.cpp: no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponible
