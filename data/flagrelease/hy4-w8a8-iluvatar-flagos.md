# FlagRelease/Hy4-W8A8-iluvatar-FlagOS

## Resumen
Hy4 es un modelo multimodal de gran escala desarrollado por Tencent Hunyuan y adaptado por la comunidad FlagOS para su despliegue en múltiples plataformas de aceleradores. Esta ficha concreta corresponde a la versión W8A8 cuantizada a 8 bits para Iluvatar CoreX, publicada bajo el identificador FlagRelease/Hy4-W8A8-iluvatar-FlagOS. El modelo resuelve tareas de productividad real que combinan percepción visual, razonamiento y uso de herramientas, incluyendo operación de software profesional, análisis de gráficos complejos y desarrollo front-end y de videojuegos.

La arquitectura es un transformer multimodal de tipo `hy_v4_vl` con 774.434.002.142 parámetros totales, según los metadatos de safetensors, distribuidos en 246 shards y 122.940 tensores. El repositorio ocupa 789,6 GB en formato safetensors con cuantización W8A8 mediante compressed-tensors. La longitud de contexto no está especificada en la información disponible; los scripts de inferencia documentados emplean `max_model_len=8192`, pero no debe interpretarse como el máximo del modelo.

Su relevancia actual radica en la adaptación Day-0 a nueve fabricantes de chips (Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX) sobre la pila FlagOS 2.2. En pruebas de doble nodo con 16 GPU y 64 de concurrencia sobre NVIDIA, la versión FlagOS reporta hasta un 32,1 % más de throughput de salida y hasta un 39,2 % menos de latencia media por token frente a la solución nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `hy_v4_vl` (`HYV4VLForConditionalGeneration`) |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (scripts documentados con `max_model_len=8192`) |
| Tipos de cuantizacion | W8A8 (INT8 pesos y activaciones) mediante compressed-tensors |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (246 shards, 122.940 tensores, 793.129.169.524 B) |

## Arquitectura y entrenamiento
El modelo es un transformer multimodal de tipo `hy_v4_vl` diseñado para integrar percepción de imagen, razonamiento y uso de herramientas en un único sistema. La model card indica que la versión oficial escala tanto el preentrenamiento como el postentrenamiento respecto a la preview, e introduce por primera vez comprensión visual y capacidad de operación de ordenador. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO. Tampoco se especifica si la arquitectura incorpora mezcla de expertos; el layout de pesos por experto (`mlp.experts.<id>.{gate,up,down}_proj.{weight,weight_scale}`) sugiere una estructura con expertos, pero no se confirma el número de parámetros activos.

La innovación técnica destacable en esta publicación es la cuantización W8A8 con compressed-tensors y la adaptación a la pila FlagOS 2.2, que incluye optimizaciones a nivel de framework y de operadores específicas para Hy4. La implementación no incluye código remoto (`auto_map` ausente): toda la lógica de inferencia proviene del plugin vLLM-FL (`/opt/hy4-plugin`, commit `3e6c2a82`). La imagen de despliegue incorpora una caché de Triton precalentada con más de 2400 entradas para evitar recompilaciones en el arranque en frío.

## Capacidades
- Generación de texto y razonamiento multimodal sobre imágenes, gráficos complejos y documentos.
- Comprensión visual y percepción de imagen, incorporada por primera vez en la versión oficial frente a la preview.
- Operación de ordenador y control de software profesional.
- Uso de herramientas y function calling para tareas de múltiples pasos.
- Ejecución de tareas de horizonte largo y deep research.
- Mejora en seguimiento de instrucciones y comprensión de textos largos respecto a la preview.
- Soporte de desarrollo front-end y de videojuegos como dominio de aplicación declarado.
- Capacidades multilingües limitadas a chino e inglés según los metadatos.
- Modo de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso
- Operación de software profesional: el modelo puede interpretar la interfaz de aplicaciones de escritorio y ejecutar secuencias de acciones, adecuado por su capacidad de computer operation y razonamiento multi-paso.
- Análisis de gráficos financieros: la percepción visual permite extraer datos de tablas y gráficos complejos y combinarlos con razonamiento numérico para informes de oficina financiera.
- Desarrollo front-end asistido: generación y revisión de código de interfaz con soporte de tool calling para integrarse en pipelines de CI/CD.
- Investigación científica documental: lectura de figuras, tablas y texto largo en artículos, con capacidad de deep research y contexto extendido.
- Automatización de tareas de terminal: los resultados publicados en Terminal-Bench 4.0 (44,4) y AutomationBench v1.0.6 (56,2) indican idoneidad para agentes que operan entornos de línea de comandos.
- Atención al cliente técnica multilingüe: conversaciones multi-turno en chino e inglés con soporte de herramientas para consultar sistemas internos.
- Despliegue en infraestructura no NVIDIA: la adaptación a Iluvatar CoreX y otros ocho fabricantes permite ejecutar el modelo en parques de aceleradores domésticos sin reescribir la pila de inferencia.

## Benchmarks y rendimiento

Resultados publicados por Tencent Hunyuan y FlagOS. La columna de la versión Iluvatar figura como "Evaluating" en la model card, por lo que no hay datos propios de esta cuantización.

| Benchmark | Hy4-Nvidia-Origin | Hy4-Iluvatar-FlagOS |
|---|---|---|
| Math-500 | 96,2 | Evaluando |
| GPQA_Diamond | 93,65 | Evaluando |
| MMBench | 91,2 | Evaluando |
| MMStar | 79,67 | Evaluando |
| Terminal-Bench 4.0 | 44,4 (vs. 26,3 en preview) | no disponible |
| AutomationBench v1.0.6 | 56,2 (vs. 36,3 en preview) | no disponible |

Rendimiento de inferencia medido en 2 máquinas × 16 BI-V150 (32 tarjetas), `max_model_len=8192`, `max_num_seqs=8`:

| Configuración | Concurrencia | Decode agregado (tok/s) | Latencia por petición |
|---|---|---|---|
| TP8×PP4 + PIECEWISE graph (capture 4) | 4 | 5,56–5,82 | 19–26 s |
| TP8×PP4 eager (`--enforce-eager`) | 4 | 1,07 | 87–134 s |
| TP8×PP8 eager (4 máquinas) | 8 | 1,36 | no disponible |

El modo graph es entre 5,2 y 5,4 veces más rápido que eager con 4 peticiones concurrentes, con salidas idénticas byte a byte (md5 igual para batch=1 y batch=4 en tres rondas). La primera petición tras arranque en frío puede tardar hasta 1040 s; con la caché `/root/.triton` precalentada de la imagen baja a unos 37 s.

## Requisitos de hardware
- VRAM estimada: los pesos W8A8 suman 793,1 GB, por lo que la inferencia requiere agregar al menos ese volumen entre todas las GPU del clúster; no cabe en una sola GPU.
- Configuración de referencia: 32 tarjetas Iluvatar BI-V150 de 32 GB (16 por máquina, 2 máquinas), con TP8×PP4.
- GPU recomendadas: Iluvatar BI-V150 para esta publicación; la adaptación FlagOS cubre además Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads y Tsing Micro.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer por el tamaño del modelo y la necesidad de paralelismo multi-nodo.
- Red: interconexión de 100 Gb Ethernet con `NCCL_IB_DISABLE=1` sobre TCP en la configuración probada.
- Opciones de despliegue: vLLM 0.24.0 con plugin FL sobre FlagOS; imagen Docker `harbor.baai.ac.cn/flagrelease-public/hy4-1022-iluvatar-bi-v150-gems5.3.4-pluginfl-3e6c2a82-vllm0.24.0-corex4.5.0:20261120-tp8pp4-mm`. No se documentan opciones llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de rendimiento; decode agregado de 5,56–5,82 tok/s con 4 peticiones concurrentes en modo graph.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4 W8A8 Iluvatar (esta ficha) | 774,4 B | no disponible | Apache 2.0 | Hugging Face, pesos vía ModelScope |
| Hy4-Nvidia-Origin | no disponible | no disponible | Apache 2.0 | Referencia nativa de Tencent Hunyuan |
| Hy4 preview | no disponible | no disponible | Apache 2.0 | Versión previa de Tencent Hunyuan |

No se dispone en la información proporcionada de datos de modelos comparables de otros fabricantes con los que contrastar parámetros, contexto o rendimiento; se indica "no disponible".

## Limitaciones y advertencias
- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otras lenguas.
- La cuantización W8A8 puede introducir degradación de calidad frente a los pesos originales; no hay resultados de benchmarks publicados para esta versión concreta (figuran como "Evaluando").
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en razonamiento multimodal y operación de software; requiere validación en producción.
- Sesgos conocidos: no documentados en la información disponible.
- Longitud máxima de contexto no especificada; los scripts usan 8192 tokens, lo que puede limitar casos de texto largo si no se reconfigura.
- El arranque en frío puede tardar hasta 1040 s si se elimina la caché `/root/.triton`; no debe borrarse entre ejecuciones.
- La imagen Docker requiere montar el userland de CoreX del host para que la UMD coincida con la KMD; un desajuste de versiones impide el arranque.
- La distribución de pesos depende del almacenamiento compartido de FlagRelease y la publicación en ModelScope está pendiente.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los componentes de la pila FlagOS y del plugin vLLM-FL.

## Enlaces
- Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-iluvatar-FlagOS
- ModelScope (descarga de pesos, publicación pendiente): `modelscope download --model FlagRelease/Hy4-W8A8-iluvatar-FlagOS`
- Imagen Docker FlagOS-Iluvatar: `harbor.baai.ac.cn/flagrelease-public/hy4-1022-iluvatar-bi-v150-gems5.3.4-pluginfl-3e6c2a82-vllm0.24.0-corex4.5.0:20261120-tp8pp4-mm`
- Repositorio del plugin: `/opt/hy4-plugin` (commit `3e6c2a82`, rama `day0-hy4-testing-3-iluvatar`)
- Paper, blog y demo oficiales: no disponible en la información proporcionada.
