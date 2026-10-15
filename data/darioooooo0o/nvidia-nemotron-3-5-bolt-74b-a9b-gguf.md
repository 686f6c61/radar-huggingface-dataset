# darioooooo0o/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF

## Resumen

El repositorio `darioooooo0o/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF` contiene cuantizaciones en formato GGUF del modelo NVIDIA Nemotron 3.5 Bolt 74B-A9B, publicado originalmente por NVIDIA en BF16 bajo el identificador `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16`. Se trata de un modelo multimodal (pipeline `image-text-to-text`) con arquitectura hibrida que combina capas de espacio de estados (Mamba/SSM) con capas de mezcla de expertos (MoE) y un proyector de vision. El total de parametros asciende a 74.042.720.768 (~74B), con aproximadamente 9B parametros activos por token, tal como indica la nomenclatura "A9B".

La relevancia de este repositorio es practica: NVIDIA habia publicado unicamente un checkpoint QAT de 24 GB en 1 y 2 bits, y este autor anade los niveles superiores de cuantizacion generados directamente desde los pesos BF16 completos. El primer archivo disponible es un `Q4_K_M` estatico de 46 GB, junto con dos versiones del proyector de vision (`mmproj` en BF16 y Q8_0). El autor anuncia la publicacion progresiva de variantes con importance matrix (imatrix) en Q3_K_M, IQ3_XXS, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0, cada una con su divergencia KL frente a Q8_0.

El modelo esta pensado para ejecutarse con llama.cpp mediante `llama-server`, con soporte para offloading parcial de expertos a RAM del sistema. Esto permite ejecutar un archivo de 46 GB en una GPU de 24 GB si se dispone de unos 24 GB de RAM libre, lo que lo hace accesible en hardware de consumo alto de gama en lugar de requerir nodos multi-GPU. Los idiomas declarados son ingles, espanol, frances, aleman, italiano y japones, y la licencia es OpenMDW-1.1, la misma que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Mamba (SSM) + MoE, con proyector de vision (multimodal) |
| Parametros totales | 74.042.720.768 (~74B) |
| Parametros activos | ~9B (segun nomenclatura A9B; cifra exacta no disponible) |
| Longitud de contexto | No disponible; el ejemplo oficial de ejecucion usa 32.768 tokens (`-c 32768`) |
| Tipos de cuantizacion | Disponible: Q4_K_M estatico (46 GB), mmproj BF16, mmproj Q8_0. Anunciados: Q3_K_M, IQ3_XXS, IQ4_XS, Q4_K_M imatrix, Q5_K_M, Q6_K, Q8_0. Del checkpoint QAT de NVIDIA: 1-bit y 2-bit (IQ2, 21 GB) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (llama.cpp) y GGUF para el proyector de vision (mmproj) |
| Tamano del repositorio | 51,0 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 |
| Libreria | gguf |

## Arquitectura y entrenamiento

La arquitectura combina dos paradigmas: capas basadas en espacio de estados (SSM, familia Mamba) y capas de mezcla de expertos (MoE). Los tags del repositorio confirman explicitamente `mamba` y `moe`, y el desglose de cuantizacion del autor menciona proyecciones "LatentMoE" diferenciadas, lo que indica que el enrutado de expertos opera en un espacio latente comprimido. El modelo incorpora ademas un proyector de vision independiente (`mmproj`), lo que lo convierte en un modelo multimodal capaz de procesar entradas de imagen junto con texto. Con 74B parametros totales y unos 9B activos, el coste computacional por token se aproxima al de un modelo denso de ~9B, mientras que la capacidad de representacion se acerca a la de un modelo de 74B.

Respecto al entrenamiento, esta informacion corresponde al modelo original de NVIDIA y no se detalla en el repositorio de cuantizacion: el autor remite explicitamente a la model card de NVIDIA para datos de entrenamiento, evaluacion, sesgos y notas de seguridad. Lo que si se conoce es que NVIDIA publico un checkpoint optimizado con Quantization-Aware Training (QAT) de 24 GB en 2 bits, del que derivan los archivos IQ2 existentes. Las cuantizaciones de este repositorio se generan a partir de los pesos BF16 completos, no del checkpoint QAT, lo que explica la mejora de perplejidad observada. La innovacion tecnica destacable en el lado de la cuantizacion es el esquema mixto por tipo de tensor: atencion y proyecciones LatentMoE en Q8_0; SSM, experto compartido y capa de salida en Q6_K; expertos enrutados en Q4_K/Q6_K.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla Jinja (`--jinja`) para chat.
- Razonamiento y comprension de texto en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`) mediante el proyector `mmproj`, en variantes BF16 y Q8_0.
- Capacidad de ejecucion de modelos MoE con enrutado disperso, aprovechando la naturaleza de 9B parametros activos.
- Soporte de contexto extendido en la practica: el ejemplo oficial arranca el servidor con 32.768 tokens de ventana.
- Compatibilidad con endpoints de servidor (`endpoints_compatible`) a traves de `llama-server`, lo que permite exponer el modelo como API compatible con el formato de OpenAI.
- Capacidades especificas de tool calling, function calling o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado con vision: desplegando `llama-server` con el archivo Q4_K_M y el `mmproj` Q8_0, se puede construir un asistente que reciba capturas de pantalla o fotografias junto con preguntas de texto, util para soporte tecnico que requiere interpretar interfaces o errores visuales.
- Procesamiento documental multimodal: extraccion y resumen de informacion a partir de documentos escaneados combinados con instrucciones textuales, aprovechando la ventana de 32.768 tokens para documentos de varias paginas.
- Generacion de contenido multilingue: redaccion y traduccion entre los seis idiomas declarados, con un unico modelo en lugar de mantener pipelines separados por idioma.
- Despliegue en estacion de trabajo con GPU de consumo: el offloading de expertos a RAM permite ejecutar un modelo de 74B en una RTX 4090 o RTX 3090 de 24 GB, lo que habilita entornos de desarrollo y prototipado sin acceso a clúster.
- Servicio de chat con coste de inferencia contenido: al activar solo ~9B parametros por token, el throughput por token es sustancialmente mayor que el de un modelo denso de 74B, lo que resulta adecuado para cargas concurrentes moderadas.
- Investigacion en cuantizacion: el repositorio incluye datos de perplejidad comparativos entre el archivo de 2 bits QAT y el Q4_K_M estatico, y anuncia divergencia KL frente a Q8_0, lo que lo convierte en material util para estudiar el impacto de la precision en arquitecturas hibridas SSM+MoE.
- Automatizacion de backoffice con API compatible: al exponerse mediante `llama-server` con `--jinja`, puede integrarse en pipelines internos que ya consumen endpoints con formato OpenAI, sin reescribir la capa de integracion.

## Benchmarks y rendimiento

La informacion proporcionada solo incluye mediciones de perplejidad sobre wikitext-2 (16 ventanas de 2048 tokens, mismo texto y ajustes para ambos archivos). No hay resultados de MMLU, HumanEval, GSM8K ni otras baterias estandar.

| Metrica | Archivo | Tamano | Resultado |
|---|---|---|---|
| Perplejidad wikitext-2 | NVIDIA GGUF 2-bit QAT IQ2 | 21 GB | 5,2842 ± 0,09605 |
| Perplejidad wikitext-2 | Q4_K_M estatico (desde BF16) | 46 GB | 4,5662 ± 0,07667 |
| Divergencia KL vs Q8_0 | Ambos archivos | — | Anunciada, pendiente de publicacion |
| Rendimiento por nivel de VRAM | Varios | — | Anunciado, pendiente de publicacion |

El paso de 2 bits a Q4_K_M reduce la perplejidad en aproximadamente 0,72 puntos absolutos, lo que supone una mejora relativa de en torno al 13,6%. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para el archivo Q4_K_M estatico (46 GB): no cabe completo en una GPU de 24 GB. Requiere, segun el autor, una GPU de 24 GB mas aproximadamente 24 GB de RAM de sistema libre, gracias al offloading de expertos activado por defecto con `--fit on`.
- VRAM para el archivo IQ2 QAT de NVIDIA (21 GB): cabe en una GPU de 24 GB, dejando margen para cache KV y el proyector de vision.
- VRAM para el Q8_0 anunciado (~79 GB estimados a partir del tamano de parametros): no disponible como medicion real; requeriria una GPU de 80 GB (H100, A100 80GB) o reparto entre varias GPU.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para las variantes de 2 bits; A100 80GB o H100 80GB para Q8_0; configuraciones multi-GPU o GPU con 48 GB (A6000, L40S) para Q4_K_M sin offloading.
- Cabe en GPU de consumo: si, para las cuantizaciones de 1 y 2 bits. Para Q4_K_M se requiere offloading parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-server`) es la ruta soportada explicitamente. Requiere una version con soporte de Nemotron 3.5 Bolt (>= commit `cd0a5b6a1`, del 15 de octubre de 2026, PR #30520). Otros runners basados en llama.cpp (Ollama, LM Studio) podrian funcionar una vez integren ese soporte, pero no esta confirmado en la informacion disponible. vLLM, TGI y TensorRT-LLM no estan mencionados para este formato GGUF concreto.
- Latencia y throughput: no disponibles. El autor anuncia que publicara datos de velocidad por nivel de VRAM junto con los archivos imatrix.
- Requisito de version: la conversion se realizo con llama.cpp master mas un parche del convertidor especifico para este checkpoint, alojado en el fork `riceharvest/llama.cpp` rama `bolt-convert`.

## Comparativa con modelos similares

La informacion disponible solo permite comparar dentro de la propia familia Nemotron 3.5 Bolt, ya que no se proporcionan datos de modelos alternativos.

| Version | Parametros totales | Parametros activos | Contexto | Perplejidad (wikitext-2) | Formato | Licencia |
|---|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Bolt 74B-A9B BF16 (original) | ~74B | ~9B | no disponible | no disponible | safetensors / BF16 | OpenMDW-1.1 |
| GGUF 2-bit QAT IQ2 (NVIDIA) | ~74B | ~9B | no disponible | 5,2842 | GGUF, 21 GB | OpenMDW-1.1 |
| GGUF Q4_K_M estatico (este repositorio) | ~74B | ~9B | 32.768 en el ejemplo | 4,5662 | GGUF, 46 GB | OpenMDW-1.1 |

No se dispone de datos comparativos frente a otros modelos de tamano o categoria similar (por ejemplo, alternativas MoE de ~70B) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es una cuantizacion de terceros, no una publicacion oficial de NVIDIA. El autor no es el desarrollador del modelo base.
- El archivo Q4_K_M actual esta generado sin importance matrix (se denomina "static"). El propio autor indica que sera reemplazado por una version imatrix, por lo que los resultados de calidad pueden variar entre versiones del mismo nombre.
- Las cuantizaciones imatrix Q3_K_M, IQ3_XXS, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0, asi como los datos de divergencia KL, estan anunciadas pero no disponibles en el momento de redactar esta ficha.
- La perplejidad es la unica metrica publicada. No hay evaluaciones de tareas (razonamiento, codigo, matematicas ni vision), por lo que no se puede garantizar el rendimiento en uso real.
- La longitud maxima de contexto del modelo no se especifica. El valor de 32.768 tokens corresponde al ejemplo de arranque, no necesariamente al limite del modelo.
- Las degradaciones tipicas de la cuantizacion (perdida de precision en tareas de razonamiento largo, mayor tasa de repeticion o de alucinacion en cuantizaciones agresivas de 1 y 2 bits) no han sido caracterizadas en esta informacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Se debe remitir a la model card de NVIDIA para las notas de sesgo, seguridad y privacidad.
- Idiomas: aunque se declaran seis idiomas, no se especifica el nivel de competencia por idioma ni si el proyector de vision mantiene el rendimiento OCR en todos ellos.
- Licencia: OpenMDW-1.1. Es una licencia de pesos abiertos con condiciones propias; debe revisarse el texto integro antes de uso comercial. El repositorio incluye una copia en `LICENSE.OpenMDW-1.1` y los avisos de NVIDIA en `NOTICE.md`.
- Dependencia estricta de version de llama.cpp: usar una build anterior al commit indicado provocara fallos al cargar el modelo.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/darioooooo0o/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Pull request de soporte para Nemotron 3.5 Bolt en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30520
- Fork del convertidor utilizado (rama `bolt-convert`): https://github.com/riceharvest/llama.cpp/tree/bolt-convert
- Perfil del autor de la cuantizacion: https://x.com/imdariotoo
