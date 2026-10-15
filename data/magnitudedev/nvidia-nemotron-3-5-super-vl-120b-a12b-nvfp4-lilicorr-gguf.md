# magnitudedev/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr-GGUF

## Resumen

Este repositorio contiene una conversion a GGUF, en cuantizacion nativa NVFP4, del checkpoint `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr`. La conversión la publica el usuario `magnitudedev` y está pensada para funcionar con el framework Magnitude sobre `llama.cpp` (revision `620d2225cc436ab0b001e3200e590e3b286ef9ab`). El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con 120B de parametros totales y 12B activos, con capacidades de vision-lenguaje (VL) y pesos en formato NVFP4, mas un componente de decodificacion especulativa ("LiLiCorr" / "dflash").

El interes de esta ficha radica en que combina tres elementos poco habituales a la vez: cuantizacion NVFP4 nativa (4 bits en coma flotante) exportada a GGUF, metadatos de borrador para decodificacion especulativa con ventana deslizante de 8192 en todas las capas, y una supuesta escala de 120B con 12B activos, lo que la situaria en la categoria de modelos MoE grandes ejecutables en hardware de gama alta o en configuraciones multi-GPU.

Conviene senalar de entrada una discrepancia relevante: los metadatos de safetensors del repositorio indican 1.664.379.684 parametros (~1,66B) y un tamano de repo de 1,4 GB, cifras incompatibles con un modelo de 120B en NVFP4 (que requeriria del orden de 60 GB de pesos). Esta inconsistencia se detalla en la seccion de limitaciones y debe verificarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; el nombre sugiere transformer MoE con capacidades de vision-lenguaje (VL) |
| Parametros totales | 120B segun el nombre del modelo; los metadatos de safetensors del repo indican 1.664.379.684 (~1,66B) |
| Parametros activos | 12B (indicado en el sufijo "A12B" del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante); unica variante publicada en este repo |
| Idiomas soportados | no disponibles |
| Licencia | openmdw-1.1 (etiquetada como "other" en los tags; enlace a la licencia en el apartado de enlaces) |
| Formato de pesos | GGUF (fichero `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna, el dataset de entrenamiento ni el proceso de alineacion (RLHF, DPO u otros). El unico dato tecnico concreto es que se trata de una conversion nativa a GGUF de un checkpoint ya cuantizado en NVFP4, realizada con `llama.cpp` en la revision `620d2225cc436ab0b001e3200e590e3b286ef9ab`, a partir del checkpoint origen en la revision `7c7221aeb4cb3139307aa457f7dce11a8fb6ceb2` y con revision de tokenizer objetivo `a1ccf94d69377bf82c4db39798aac28447d9c16f`.

El repositorio incorpora metadatos de borrador para decodificacion especulativa bajo el prefijo `dflash`: atencion causal desactivada en el bloque de borrador (`dflash.attention.causal = false`, es decir, atencion bidireccional), propuestas generadas a partir de filas de mascara que comienzan despues del ancla (`dflash.sample_from_anchor = false`) y ventana deslizante de 8192 en todas las capas (`dflash.attention.sliding_window = 8192`). Estos ajustes describen el comportamiento del componente borrador que acelera la generacion, no necesariamente del modelo principal. El termino "LiLiCorr" no aparece explicado en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Vision-lenguaje: el sufijo "VL" del checkpoint sugiere entrada de imagen ademas de texto, aunque la informacion disponible no detalla el encoder visual ni la resolucion soportada.
- Decodificacion especulativa: incluye metadatos de borrador (`dflash`) para acelerar la inferencia mediante propuestas de tokens.
- Ejecucion local mediante `llama.cpp`: el formato GGUF y la libreria declarada permiten despliegue en el ecosistema ggml.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponibles.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dada la categoria del modelo (MoE grande, multimodal), pero deben validarse contra la documentacion oficial del checkpoint base, ya que la informacion disponible no confirma cada capacidad de forma individual.

- Analisis de documentos con imagen y texto: si se confirma la capacidad VL, el modelo podria procesar capturas, graficos o formularios junto a instrucciones en lenguaje natural para extraer datos estructurados.
- Asistentes conversacionales de dominio: el tag conversacional y una supuesta ventana de contexto amplia lo harian adecuado para dialogos sostenidos con historial largo, siempre que el consumo de memoria lo permita.
- Despliegue local con `llama.cpp`: el formato GGUF permite integrarlo en herramientas como `llama.cpp` puro, Ollama o servidores compatibles sin depender de frameworks propietarios.
- Aceleracion mediante decodificacion especulativa: los metadatos `dflash` con ventana de 8192 estan disenados para reducir la latencia por token en generacion autoregresiva, util en servicios interactivos.
- Procesamiento por lotes en backends de alto rendimiento: si el modelo cabe en un nodo multi-GPU, podria servir cargas de trabajo tipo vLLM o TGI para generacion masiva.
- Investigacion sobre cuantizacion NVFP4: el repositorio es un artefacto de referencia para estudiar la interaccion entre NVFP4, GGUF y decodificacion especulativa.
- Preprocesamiento multimodal en pipelines de datos: clasificacion o descripcion de imagenes a escala si la parte visual esta operativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM (escenario 120B MoE, segun el nombre): en NVFP4 los pesos de un modelo de 120B ocuparian del orden de 60 GB, mas overhead de activaciones y cache KV, por lo que seria necesario uno o varios aceleradores de gama alta. Este dato es una estimacion a partir del tamano nominal, no una cifra confirmada por el autor.
- VRAM (escenario segun metadatos del repo): si el artefacto real fuese de ~1,66B parametros y 1,4 GB, cabria en cualquier GPU de consumo con suficiente memoria libre; esta lectura contradice el nombre del modelo.
- GPU recomendadas: no disponibles de forma oficial. En la hipotesis de 120B MoE en NVFP4, serian necesarias H100 80GB, H200 o configuraciones multi-GPU tipo 2x A100 40GB/80GB; en la hipotesis de 1,66B, bastaria una RTX 3060 12GB o superior.
- GPU de consumo: no confirmable sin resolver la discrepancia de parametros.
- Opciones de despliegue: `llama.cpp` (revision indicada `620d2225cc436ab0b001e3200e590e3b286ef9ab`), entorno Magnitude y, en funcion del soporte de NVFP4 en GGUF, backends compatibles con llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion se ofrece a titulo orientativo; los datos del modelo de esta ficha proceden del nombre y de los metadatos del repo, no de la documentacion oficial del checkpoint base.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Super VL 120B A12B (este repo, GGUF NVFP4) | 120B segun nombre (1,66B segun safetensors) | 12B segun nombre | no disponible | openmdw-1.1 | GGUF en HuggingFace |
| Llama 4 Maverick | 400B | 17B | hasta 1M | Llama 4 Community License | pesos abiertos |
| Mixtral 8x22B | 141B | 39B | 64K | Apache 2.0 | pesos abiertos |

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Discrepancia critica de parametros: el nombre indica 120B con 12B activos, pero los metadatos de safetensors del repositorio declaran 1.664.379.684 parametros y un tamano de repo de 1,4 GB. Estas cifras son incompatibles entre si y deben aclararse antes de cualquier evaluacion.
- Ausencia de benchmarks: no hay resultados publicados, por lo que no puede verificarse la calidad real del modelo ni compararse objetivamente con alternativas.
- Idiomas no declarados: no se especifica que lenguas soporta ni su cobertura multilingue.
- Contexto desconocido: no se indica la longitud de contexto efectiva del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan medidas de mitigacion.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre el proceso de alineacion.
- Licencia: la licencia efectiva es openmdw-1.1, etiquetada como "other". Debe revisarse el texto completo en el enlace oficial para confirmar condiciones de uso comercial, atribucion y redistribucion. No se asume permiso comercial sin verificar.
- Artefacto de terceros: la conversion la realiza el usuario `magnitudedev`, no el autor original NVIDIA. El checkpoint base apunta a NVIDIA, pero la conversion GGUF es responsabilidad del publicador.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la evidencia empirica disponible sobre su funcionamiento.
- Sin informacion sobre tool calling, agentes ni modo de razonamiento: no deben asumirse estas capacidades.

## Enlaces

- Repositorio HuggingFace de esta conversion GGUF: https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr-GGUF
- Checkpoint base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Revision del checkpoint origen: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr/tree/7c7221aeb4cb3139307aa457f7dce11a8fb6ceb2
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Framework Magnitude: https://github.com/magnitudedev/magnitude
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
