# autotrust/GLM-5.3-Flash-GGUF-DGX-Spark

## Resumen

GLM-5.3-Flash-GGUF-DGX-Spark es una compilacion GGUF para llama.cpp del modelo GLM-5.3-Flash de Z.ai (organizacion zai-org), comprimido por AutoTrust AI Lab mediante su receta SLIM-Q (Selective expert pruning + Low-bit quantization for Inference of MoE). El modelo base es un transformer de tipo mixture of experts (MoE) con unos 279.500 millones de parametros totales, atencion hibrida KDA + DSA y enrutamiento top-8 sobre expertos enrutados. Esta build concreta reduce el peso de 90 GiB (GLM-5.3-Flash Q2 estandar) a 79,1 GiB, un 12 % menos, eliminando de forma estructural 32 de los 288 expertos enrutados por capa (256 retenidos, variante E256).

La relevancia practica esta en el despliegue local: los 79,1 GiB de pesos caben en la memoria unificada de un unico DGX Spark (GB10, 128 GB de LPDDR5X), dejando unos 40 GiB libres en lugar de los ~25 GiB del Q2 estandar. Eso permite pasar de contextos de 16-32 K a 64 K holgados en una sola maquina, o bien cuatro sesiones concurrentes de 16 K con continuous batching. El coste por token se mantiene identico al del Flash Q2 original, porque el router sigue activando 8 expertos por token y la atencion mantiene la misma precision de 8 bits.

El repositorio acumula 28.936 descargas y 44 likes desde su publicacion el 20 de septiembre de 2026, y se distribuye bajo licencia MIT. Es la variante de un solo Spark de la familia SLIM-Q de AutoTrust, cuyo miembro mayor es la build de 744B (E192) que requiere dos DGX Spark enlazados por ConnectX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida KDA + DSA; derivado de zai-org/GLM-5.3-Flash |
| Parametros totales | 279.498.438.142 (~279,5 mil millones) segun metadatos de safetensors |
| Parametros activos | No disponible. MoE con top-8 de 256 expertos enrutados por token (288 en el modelo original) |
| Longitud de contexto | Hasta 1 M tokens segun el autor; 64 K de forma holgada en un DGX Spark de 128 GB; 4 x 16 K con `-np 4` |
| Tipos de cuantizacion | Mezcla de bajas precisiones: IQ2_XXS (gate/up de expertos enrutados) y Q2_K (down); atencion, capas densas, expertos compartidos y router permanecen en alta precision |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF en dos shards: `GLM-5.3-Flash-Q2-DGX-Spark-00001-of-00002.gguf` (41,9 GiB) y `-00002-of-00002.gguf` (37,2 GiB); 79,1 GiB totales |
| Tamano del repositorio | 84,9 GB |
| Checksums | `GLM-5.3-Flash-Q2-DGX-Spark.sha256` |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE con capas de atencion hibridas KDA (mantienen un estado constante) y DSA (usan una cache compacta), ademas de capas densas, expertos compartidos y un router. El enrutamiento activa los 8 expertos mas probables de los 288 enrutados originales en cada token. Sobre esa base, AutoTrust aplica SLIM-Q, un pipeline de compresion post-entrenamiento de dos etapas. La primera etapa es un pruning selectivo: se perfilaron los expertos con una mezcla de calibracion bilingue de codigo, agentes, ciencia y matematicas, y se eliminaron estructuralmente los 32 menos usados de cada capa (11 %). La segunda etapa cuantiza agresivamente solo los expertos enrutados, dejando la atencion, las capas densas, los expertos compartidos y el router en alta precision para preservar el comportamiento del enrutamiento.

No se documenta en la informacion disponible ningun reentrenamiento, ajuste con RLHF/DPO ni dataset de preentrenamiento: SLIM-Q actua exclusivamente sobre un checkpoint ya entrenado. La model card tampoco aporta el numero de tokens de entrenamiento, la composicion del corpus ni el proceso de alineacion del modelo original. La innovacion destacable es la doble esparsidad (Sparse-Squared): a la esparsidad natural de inferencia del MoE se anade una esparsidad estructural permanente que reduce el peso sin alterar el trabajo por token. El modelo conserva la plantilla de chat con modo de pensamiento (`<think>`) y niveles de esfuerzo configurables (`reasoning_effort`: low, high, max) y presupuesto de razonamiento acotable.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento explicito con modo de pensamiento activado por defecto; el servidor devuelve el bloque de razonamiento por separado en el campo `reasoning_content`.
- Control del razonamiento mediante `--reasoning-budget` (0 lo desactiva, 4096 lo limita) y `--chat-template-kwargs '{"reasoning_effort":"low"}'`.
- Generacion de codigo: la model card cita HumanEval de 97,6 para la variante de 4 bits del pipeline SLIM-Q.
- Matematicas y ciencia: la calibracion del pruning incluye mezclas de ciencia y matematicas, y se reporta GPQA-D de 77,3 para la variante de 4 bits.
- Tool calling / function calling con salida en formato OpenAI `tool_calls` a traves de `llama-server`.
- Uso en agentes y razonamiento multi-paso, coherente con la mezcla de calibracion orientada a agentes.
- Contexto largo: hasta 1 M tokens en teoria y 64 K comodos en un DGX Spark.
- Servido concurrente con continuous batching (`-np 4` para cuatro sesiones de 16 K).
- Capacidad multimodal del modelo base: no confirmada en esta build. Una noticia de terceros describe GLM-5.3-Flash como "nativamente multimodal", pero este repositorio esta etiquetado como `text-generation` y su model card no documenta vision ni audio.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y revisar codigo en un equipo con una sola GPU o un DGX Spark, sin enviar el codigo a servicios externos. Con 79,1 GiB de pesos y 64 K de contexto cabe un repositorio mediano completo en la ventana, y el tool calling permite integrarlo en un bucle de edicion y ejecucion de tests.
- Atencion al cliente automatizada bilingue: gestiona conversaciones multi-turno en ingles y chino con contexto largo, y el batching de `llama-server` permite atender varias sesiones concurrentes con una sola instancia.
- Analisis de documentos extensos: con 64 K de contexto en el Spark se pueden procesar informes, contratos o expedientes de decenas de miles de tokens en una unica pasada, o repartir el trabajo en cuatro sesiones de 16 K.
- Agentes autononomos con herramientas: la salida de `tool_calls` en formato OpenAI y el razonamiento multi-paso lo hacen apto para pipelines que encadenan busqueda, ejecucion de codigo y consultas a APIs.
- Inferencia por lotes en investigacion: el continuous batching y la compatibilidad con la API de OpenAI simplifican la evaluacion sistematica de conjuntos de prompts sobre el modelo completo.
- Sustitucion de instancias cloud para datos sensibles: al ejecutarse integramente en hardware propio con licencia MIT, encaja en entornos con requisitos de soberania de datos.
- Estudio de compresion de MoE: sirve como banco de pruebas reproducible para comparar el impacto del pruning de expertos y la cuantizacion de 2 bits frente al checkpoint original de 90 GiB.
- Despliegue en Apple Silicon de 128 GB: al compilar llama.cpp sin CUDA, el modelo cabe en la memoria unificada de un Mac de gama alta para desarrollo y prototipado.

## Benchmarks y rendimiento

La model card no incluye una bateria completa de benchmarks, pero si las siguientes cifras, atribuidas por el autor a la variante de 4 bits del pipeline SLIM-Q. No queda claro si corresponden a este fichero concreto de 2 bits; se reproducen tal cual, sin verificacion independiente.

| Benchmark | Resultado citado |
|---|---|
| HumanEval | 97,6 |
| C-Eval | 89,4 |
| GPQA-D | 77,3 |

El autor afirma ademas que, en una prueba A/B con el arnes de 2 bits, el resultado es "igual o mejor" que la referencia, sin publicar la metodologia ni los datos completos. No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, GSM8K u otros conjuntos estandar.

## Requisitos de hardware

- Peso de los ficheros: 79,1 GiB en dos shards GGUF.
- Memoria total necesaria en inferencia: 79,1 GiB de pesos mas aproximadamente 1 GiB por cada 16 K tokens de contexto (las capas KDA mantienen estado constante y las DSA usan cache compacta) mas unos pocos GiB de buffers de computo.
- GPU recomendada: DGX Spark (GB10) con 128 GB de memoria unificada LPDDR5X y 273 GB/s de ancho de banda. Con `-c 65536` quedan unos 30 GiB libres; con `-np 4 -c 65536` se sirven cuatro sesiones de 16 K.
- Alternativas completas: Apple Silicon con 128 GB de memoria unificada (compilando sin CUDA) y GPUs NVIDIA discretas con 90 GB o mas de VRAM.
- GPU de consumo: no cabe integramente en tarjetas de 24-48 GB, pero admite descarga parcial de capas con `-ngl N` para offload parcial, con la penalizacion de rendimiento correspondiente.
- Opciones de despliegue: llama.cpp (rama `glm5-next`, PR #27773), con `llama-server` exponiendo una API compatible con OpenAI (`--host 0.0.0.0 --port 8080`) y `llama-cli` para chat de contexto largo. No se mencionan integraciones con vLLM, Ollama ni TGI.
- Parametros de ejecucion probados en la documentacion: `-ngl 99 -fa on -c 65536 -np 4 --cont-batching`.
- Rendimiento estimado: entre 15 y 20 t/s en un unico flujo en el Spark, limitado por el ancho de banda de memoria (unos 11 GB de pesos leidos por token). El autor advierte de que no ha medido esta cifra en un Spark y que el batching de varias sesiones aumenta el throughput agregado.
- Almacenamiento: se recomienda mantener los ficheros en el NVMe interno, ya que la primera carga lee 79 GiB.
- Requisito de software: el soporte para GLM-5.3-Flash reside en el PR #27773 de llama.cpp, no fusionado en el momento de redactar la model card; hasta su merge hay que compilar la rama `glm5next` con `-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=121a-real` para GB10.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos enrutados (activos por token) | Peso en disco | Contexto comodo en DGX Spark (128 GB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (SLIM-Q E256, 2 bits) | ~279,5 B | 256 (8) | 79,1 GiB | 64 K, hasta 1 M | MIT | GGUF en HuggingFace |
| GLM-5.3-Flash Q2 stock | ~279,5 B | 288 (8) | 90 GiB | 16-32 K | No especificada en la model card | GGUF y otros formatos |
| GLM-5.3-GGUF-DGX-Spark (SLIM-Q E192) | 744 B | No disponible | No disponible | Requiere dos DGX Spark enlazados por ConnectX | No disponible | GGUF en HuggingFace |
| huihui-ai/Huihui-GLM-5.3-Flash-abliterated-GGUF | No disponible | No disponible | No disponible | No disponible | No disponible | GGUF en HuggingFace |

La diferencia principal frente al Q2 stock es el espacio libre tras cargar los pesos (unos 40 GiB frente a unos 25 GiB), que es lo que habilita el salto de 16-32 K a 64 K de contexto en el mismo equipo. El coste por token y la latencia esperada se mantienen en la misma clase segun el autor.

## Limitaciones y advertencias

- Cuantizacion agresiva: los expertos enrutados se almacenan en IQ2_XXS y Q2_K; aunque el autor sostiene que la calidad se mantiene, la perdida de precision en modelos de 2 bits es un riesgo real y no verificable con los datos publicados.
- Pruning estructural irreversible: los 32 expertos eliminados por capa no se pueden recuperar, lo que puede degradar dominios poco representados en la mezcla de calibracion (codigo, agentes, ciencia y matematicas).
- Idiomas limitados oficialmente a ingles y chino; no hay garantia de rendimiento en castellano ni en otras lenguas.
- Dependencia de software no fusionado: el soporte se encuentra en el PR #27773 de llama.cpp, fuera de la rama principal en el momento de publicarse la model card.
- Cifras de velocidad sin medir: el propio autor indica que no ha medido el rendimiento en un Spark; los 15-20 t/s son una estimacion analitica.
- Benchmarks incompletos y de atribucion ambigua: las cifras de HumanEval, C-Eval y GPQA-D corresponden a la variante de 4 bits del pipeline y no esta claro que apliquen a este fichero de 2 bits.
- Licencia: el repositorio declara MIT, pero la model card no aclara la licencia del modelo base zai-org/GLM-5.3-Flash, que puede imponer condiciones adicionales al uso comercial del derivado.
- Arranque en frio costoso: la primera carga lee 79 GiB desde disco, lo que exige NVMe y no mezclar otras tareas de GPU durante el proceso.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad, un aspecto critico en despliegues de agentes o atencion al cliente.
- Sesgos: no se publica ningun analisis de sesgos, y la mezcla de calibracion bilingue en ingles y chino puede introducir asimetrias de calidad entre ambos idiomas.
- Sin soporte declarado en vLLM, TGI u Ollama: el despliegue en produccion queda ligado a llama.cpp y a la compilacion manual de la rama experimental.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/autotrust/GLM-5.3-Flash-GGUF-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Build companion de 744B (E192, dos DGX Spark): https://huggingface.co/autotrust/GLM-5.3-GGUF-DGX-Spark
- Perfil de AutoTrust AI Lab en HuggingFace: https://huggingface.co/autotrust
- Pull request de llama.cpp con soporte GLM-5.3-Flash (glm5-next): https://github.com/ggml-org/llama.cpp/pull/27773
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Listado de modelos cuantizados de GLM-5.3-Flash en HuggingFace: https://huggingface.co/models?other=base_model%3Aquantized%3Azai-org%2FGLM-5.3-Flash
