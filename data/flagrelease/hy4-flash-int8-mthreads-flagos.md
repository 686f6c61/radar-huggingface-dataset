# FlagRelease/Hy4-flash-INT8-mthreads-FlagOS

## Resumen

Hy4 Flash es un modelo multimodal de lenguaje desarrollado por Tencent Hunyuan, publicado como pesos abiertos bajo licencia Apache 2.0. Se trata de un transformer con arquitectura híbrida de atención, mezcla de expertos latente (Latent MoE) y un componente denominado Engram, con aproximadamente 220.000 millones de parámetros totales (de los cuales unos 64.000 millones corresponden a parámetros Engram) y unos 12.000 millones de parámetros activos por token. Admite de forma nativa entradas de texto e imagen con salida de texto, y declara una longitud de contexto máxima de un millón de tokens.

El modelo está orientado a cargas de trabajo de oficina y productividad: búsqueda profunda, procesamiento de documentos, generación de presentaciones y uso de ordenador (Computer Use). Según la model card, su huella de caché KV es una sexta parte de la del modelo Hy4, lo que reduce el coste por tarea en despliegues de contexto largo. En el benchmark interno WorkIndex de Tencent Hunyuan obtiene 42,1 frente a 39,7 de Hy4 Preview.

La ficha corresponde concretamente a la variante cuantizada a 8 bits publicada por FlagRelease dentro del ecosistema FlagOS, adaptada para su ejecución sobre aceleradores de Moore Threads (MTT S5000) mediante el stack MUSA. Esta build forma parte de una adaptación cruzada a nueve fabricantes de chips (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX) realizada el mismo día del lanzamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida, Latent MoE y Engram |
| Parametros totales | 220.251.201.958 (~220 mil millones) |
| Parametros activos | ~12 mil millones por token (MoE); ~64 mil millones corresponden a parámetros Engram |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | INT8 (8-bit, formato compressed-tensors; esquema W8A8 en el contenedor de referencia) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |
| Modalidades | Entrada texto e imagen; salida texto |
| Tamano del repositorio | 288,6 GB |
| Hardware de referencia de esta build | 8 x Moore Threads MTT S5000 (stack MUSA, FlagOS) |

## Arquitectura y entrenamiento

La arquitectura combina tres elementos: atención híbrida (combinación de mecanismos de atención que reduce el coste de la caché KV), Latent MoE (enrutamiento disperso sobre representaciones latentes, con ~12.000 millones de parámetros activos de un total de ~220.000 millones) y Engram, un componente propietario de Tencent Hunyuan del que la model card no detalla su función interna más allá de su volumen de parámetros (~64.000 millones). El resultado declarado es una caché KV de una sexta parte respecto a Hy4, lo que hace viable el contexto de un millón de tokens en términos de memoria.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card tampoco documenta innovaciones de decodificación como decodificación especulativa; el contenedor de referencia se lanza explícitamente con `no-MTP`, es decir, sin predicción multi-token. La build de FlagOS incorpora optimizaciones de kernel (FlagGems, FlagCX) y grafos de prefill/decode, y según el autor logra hasta un 35,9 % más de throughput de salida y hasta un 29,1 % menos de latencia hasta el primer token en NVIDIA H100 frente al stack nativo de NVIDIA.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta texto e imágenes y produce texto.
- Procesamiento de documentos: extracción, comprensión y transformación de documentos, incluidas páginas escaneadas o con maquetación compleja.
- Búsqueda profunda (deep search): razonamiento multi-paso sobre fuentes recuperadas, con contexto de hasta un millón de tokens.
- Generación de presentaciones (PPT): creación de contenido estructurado para diapositivas a partir de instrucciones o documentos.
- Computer Use: interacción con interfaces de escritorio mediante agentes, según el posicionamiento declarado del modelo.
- Razonamiento matemático y científico: los benchmarks publicados incluyen Math-500 y GPQA Diamond.
- Capacidades multilingües limitadas a chino e inglés según los metadatos del modelo.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible.

## Casos de uso

- Procesamiento masivo de documentos: ingerir contratos, informes o expedientes completos de cientos de miles de tokens en una sola ventana y extraer campos estructurados, resúmenes o comparativas, aprovechando el contexto de 1M tokens y la reducida caché KV.
- Búsqueda profunda sobre corpus internos: encadenar recuperación y razonamiento multi-paso sobre grandes volúmenes de texto e imágenes (por ejemplo, capturas o PDF escaneados) para responder consultas de investigación.
- Generación automática de presentaciones: transformar un informe o un conjunto de documentos en el guion y el contenido de una presentación, integrado en herramientas ofimáticas.
- Automatización de tareas de escritorio (Computer Use): agentes que interpretan capturas de pantalla y ejecutan acciones sobre aplicaciones de oficina, adecuado por su entrada de imagen nativa.
- Asistencia en atención al cliente con documentación visual: conversaciones multi-turno donde el usuario adjunta facturas, capturas o formularios y el modelo mantiene el contexto durante toda la sesión.
- Despliegue sobre hardware no NVIDIA: al existir builds de FlagOS para nueve fabricantes de chips, permite servir el modelo en infraestructura Ascend, Hygon, Kunlunxin o Moore Threads, útil para organizaciones con requisitos de soberanía tecnológica.
- Evaluación comparativa de stacks de inferencia: la variante Mthreads sirve para medir rendimiento de FlagOS frente a stacks nativos en tareas de matemáticas y visión (Math-500, GPQA Diamond, MMBench, MMStar).

## Benchmarks y rendimiento

Resultados publicados en la model card (el autor indica "Evaluating" para la build FlagOS en el momento de la publicación):

| Benchmark | Hy4-flash-Nvidia-Origin | Hy4-flash-Mthreads-FlagOS |
|---|---|---|
| Math-500 | 96 | En evaluación |
| GPQA Diamond | 92,42 | En evaluación |
| MMBench | 92,6 | En evaluación |
| MMStar | 80,93 | En evaluación |
| WorkIndex (interno Tencent Hunyuan) | 42,1 (Hy4 Flash) frente a 39,7 (Hy4 Preview) | No disponible |

Rendimiento de la build FlagOS en NVIDIA H100 según el autor: hasta +35,9 % de throughput de salida y hasta -29,1 % de latencia hasta el primer token frente al stack nativo de NVIDIA. No se han publicado resultados de benchmarks de la build Mthreads en la información disponible.

## Requisitos de hardware

- Pesos en INT8: el repositorio ocupa 288,6 GB, por lo que la inferencia requiere al menos ~290 GB de memoria de acelerador para cargar los pesos, más espacio para caché KV y buffers.
- Configuración de referencia: 8 x Moore Threads MTT S5000 con paralelismo de tensor de 8 vías (tp8), driver y SDK 3.3.5-server, Docker 24.0.9 sobre Ubuntu 22.04.
- GPU NVIDIA: no cabe en GPUs de consumo (RTX 4090, 24 GB). Requiere nodos multi-GPU tipo H100/H200/A100 de 80 GB en número suficiente para alojar ~290 GB de pesos más caché KV; el contexto de 1M tokens exige planificación adicional de memoria.
- No cabe en ninguna GPU de consumo en esta cuantización; sería necesaria una cuantización de 4 bits o inferior (no publicada en esta build) para acercarse a configuraciones de 2-4 GPUs de 80 GB.
- Opciones de despliegue: contenedor FlagOS-Mthreads con SGLang (versión 0.5.6 en el entorno del contenedor, imagen etiquetada con vllm0.10.1 y sglangfl0.1.0) sobre MUSA; el stack FlagOS da soporte a otros fabricantes. No se documenta soporte de llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no se publican cifras absolutas para la build Mthreads; solo las mejoras relativas en H100 indicadas arriba.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Hy4 Flash (esta ficha, build FlagOS INT8) | ~220B / ~12B | 1M | Texto + imagen | Apache 2.0 | Cuantización INT8, despliegue multi-chip FlagOS |
| Hy4 Preview | No disponible | No disponible | No disponible | No disponible | Puntuación WorkIndex 39,7 frente a 42,1 de Hy4 Flash |
| Hy4 | No disponible | No disponible | No disponible | No disponible | Caché KV 6 veces mayor que Hy4 Flash según el autor |

No se dispone de datos suficientes en la información proporcionada para comparar con modelos de otros fabricantes de tamaño y contexto equivalentes.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés según los metadatos; el rendimiento en castellano no está garantizado ni evaluado.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la información disponible.
- Alucinación: no se publican tasas de alucinación ni resultados de benchmarks de veracidad; en tareas de búsqueda profunda y Computer Use conviene validar las salidas.
- Benchmarks incompletos: la build FlagOS de esta ficha figura como "Evaluating" en todos los benchmarks de la model card; no hay evidencia publicada de su calidad frente al stack nativo.
- Tool calling: no se documenta soporte explícito de function calling, lo que limita su uso directo en pipelines de agentes que dependan de esquemas de herramientas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los componentes Engram y de los kernels FlagOS incluidos en el contenedor.
- Requisitos de hardware muy elevados: ~290 GB de pesos en INT8 y configuración multi-GPU específica; no es desplegable en hardware de consumo.
- Dependencia de un stack propietario de aceleración (MUSA/FlagOS) y de una imagen de contenedor concreta; la portabilidad a otros entornos exige builds alternativas.
- El contexto de 1M tokens, aunque soportado, implica costes de memoria y latencia que deben validarse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FlagRelease/Hy4-flash-INT8-mthreads-FlagOS
- Imagen de contenedor FlagOS-Mthreads: `harbor.baai.ac.cn/flagrelease-public/hy4-flash-mthreads001-gems5.3.0-tree0.6.1-cx0.13.0-pluginnone-vllm0.10.1-sglang0.0.0-sglangfl0.1.0-cp310-pt29-musa43-x64-3.3.5-server:202611190947`
- Descarga de pesos vía ModelScope: `modelscope download --model FlagRelease/Hy4-flash-INT8-mthreads-FlagOS`
- Documentación de Tencent Hunyuan sobre Hy4 Flash: no disponible en la información proporcionada.
- Paper técnico: no disponible en la información proporcionada.
