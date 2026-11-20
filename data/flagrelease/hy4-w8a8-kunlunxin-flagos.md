# FlagRelease/Hy4-W8A8-kunlunxin-FlagOS

## Resumen
Hy4 es el modelo multimodal oficial de Tencent Hunyuan orientado a escenarios de productividad real. Esta ficha concreta, Hy4-W8A8-kunlunxin-FlagOS, es una adaptacion cuantizada a 8 bits (W8A8) del checkpoint Hy4, publicada por la comunidad FlagOS sobre su pila de software multi-chip. El objetivo es habilitar el despliegue del modelo en aceleradores Kunlunxin P800 (de Baidu) mediante el stack FlagOS 2.2, que incluye vLLM con plugins propios, FlagGems y FlagCX.

El modelo combina percepcion visual, razonamiento y uso de herramientas, e incorpora por primera vez en la familia Hy4 capacidades de comprension visual y operacion de ordenador. Segun la model card, la version oficial escala preentrenamiento y postentrenamiento respecto a la preview, mejorando instrucciones, comprension de texto largo, ejecucion de tareas de horizonte largo e investigacion profunda. Los pesos suman 774.434.002.142 parametros (unos 774,4 mil millones) y el repositorio ocupa 789,6 GB.

La relevancia de esta publicacion es doble: por un lado, ofrece una via para ejecutar un modelo multimodal de gran escala en hardware no NVIDIA; por otro, documenta una validacion de despliegue en dos nodos con 16 dispositivos P800, TP16 y EP16, con contexto maximo de 102.400 tokens y cinco tamanos de captura de grafo PIECEWISE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de pipeline `hy_v4_vl`, modelo multimodal de tipo transformer; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | 102.400 tokens (maximo verificado en el despliegue de referencia) |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones), formato `compressed-tensors` |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantizacion 8-bit con `compressed-tensors`) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base Hy4. La etiqueta de pipeline `hy_v4_vl` y la descripcion de la model card confirman que se trata de un modelo multimodal con entrada de imagen y texto, capaz de percibir, razonar y usar herramientas. El checkpoint publicado es una version W8A8 en formato `compressed-tensors`, es decir, pesos y activaciones cuantizados a 8 bits, lo que reduce el peso en memoria respecto al checkpoint original en precision completa.

Respecto al entrenamiento, la model card indica que la version oficial de Hy4 amplia tanto el preentrenamiento como el postentrenamiento respecto a la preview, e introduce por primera vez comprension visual y capacidad de operacion de ordenador. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. La adaptacion a Kunlunxin se realizo con FlagOS 2.2, incluyendo optimizacion conjunta a nivel de framework y de operadores; en pruebas de dos nodos con 16 GPU y 64 peticiones concurrentes sobre NVIDIA, la version FlagOS reporta hasta un 32,1 % mas de throughput de salida y hasta un 39,2 % menos de latencia media por token frente a la solucion nativa de NVIDIA. En plataformas domesticas (T-Head, Huawei Ascend, Hygon y Moore Threads) se alcanzo un rendimiento por unidad de computo cercano o superior al nativo de NVIDIA en algunos escenarios probados.

## Capacidades
- Generacion de texto y razonamiento multimodal: procesa imagenes y texto de forma conjunta para tareas de comprension y respuesta.
- Comprension visual avanzada: interpretacion de graficos complejos, tablas e imagenes tecnicas (mmbench y mmstar figuran entre las evaluaciones previstas).
- Operacion de ordenador: capacidad introducida en la version oficial para interactuar con software profesional.
- Uso de herramientas y function calling: el modelo integra percepcion, razonamiento y uso de herramientas en un mismo flujo.
- Ejecucion de tareas de horizonte largo: mejora declarada en tareas multi-paso y de larga duracion (Terminal-Bench 4.0 y AutomationBench v1.0.6).
- Investigacion profunda (deep research): capacidad declarada en la model card para tareas de busqueda y sintesis.
- Contexto largo: hasta 102.400 tokens en el despliegue de referencia, adecuado para documentos extensos y conversaciones multi-turno.
- Multilingue: la model card solo declara ingles (`en`); no se confirma soporte de otros idiomas.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso
- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con capturas de pantalla o imagenes adjuntas gracias a su ventana de 102.400 tokens, manteniendo el contexto de la incidencia a lo largo de la sesion.
- Automatizacion de operaciones sobre software profesional: al incorporar capacidad de operacion de ordenador, puede ejecutar flujos guiados en aplicaciones de escritorio, util para tareas repetitivas de back office.
- Analisis de graficos y documentacion financiera: la comprension visual permite extraer datos de graficos complejos e informes, y combinarlos con razonamiento sobre cifras para generar resumenes y alertas.
- Desarrollo front-end y de videojuegos: el modelo puede interpretar mockups y capturas de interfaz, y apoyar la generacion de codigo y la revision de componentes visuales en pipelines de desarrollo.
- Investigacion cientifica asistida: con contexto largo y capacidad de deep research, sirve para sintetizar articulos, comparar resultados y preparar borradores de revision.
- Agentes de automatizacion de terminal: los resultados en Terminal-Bench 4.0 (44,4) y AutomationBench v1.0.6 (56,2) lo hacen adecuado para agentes que ejecutan comandos y validan resultados en entornos controlados.
- Despliegue en infraestructura no NVIDIA: organizaciones con aceleradores Kunlunxin P800 pueden servir el modelo con vLLM y el stack FlagOS, evitando depender de GPU NVIDIA para inferencia multimodal a gran escala.

## Benchmarks y rendimiento

| Metrica | Hy4-NVIDIA-Origin | Hy4-Kunlunxin-FlagOS |
|---|---|---|
| Math-500 | 96,2 | En evaluacion |
| GPQA_Diamond | 93,65 | En evaluacion |
| mmbench | 91,2 | En evaluacion |
| mmstar | 79,67 | En evaluacion |

Ademas, la model card reporta para la version oficial de Hy4 (sin desglose por plataforma) una puntuacion de 44,4 en Terminal-Bench 4.0 (frente a 26,3 de la preview) y de 56,2 en AutomationBench v1.0.6 (frente a 36,3). No se han publicado en la informacion disponible resultados de benchmarks propios del checkpoint W8A8 sobre Kunlunxin; las celdas correspondientes figuran como "Evaluating".

## Requisitos de hardware
- VRAM estimada: con 774,4 mil millones de parametros en W8A8, el peso de los pesos ronda los 775 GB; el despliegue requiere agregar memoria para cache KV y estados de activacion, por lo que se necesita un pool de memoria muy superior al de una sola GPU.
- Configuracion de referencia validada: dos nodos con ocho Kunlunxin P800 cada uno (16 dispositivos en total), con TP16 y EP16.
- GPU recomendadas: Kunlunxin P800 (plataforma validada). La model card menciona adaptacion a Hygon, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX, pero no detalla configuraciones minimas para cada una.
- GPU de consumo: no cabe en GPU de consumo; el tamano del checkpoint (789,6 GB de repositorio) y los 774,4 mil millones de parametros lo excluyen de RTX 4090 o similares.
- Opciones de despliegue: vLLM 0.28.0 con `vllm-plugin-FL` 0.4.0.dev0, FlagGems 5.4.0rc2.post1, FlagTree 0.7.0rc2+xpu3.6, FlagCX 0.13.0 y PyTorch 2.9.0+cu129, todo dentro de la imagen Docker publicada en `harbor.baai.ac.cn`. El despliegue de referencia usa red de host, contenedor privilegiado, `--shm-size 128g` y RoCE configurado.
- Latencia y throughput: en pruebas de dos nodos con 16 GPU NVIDIA y 64 peticiones concurrentes, la version FlagOS reporta hasta un 32,1 % mas de throughput de salida y hasta un 39,2 % menos de latencia media por token que la solucion nativa de NVIDIA. No se publican valores absolutos de tokens por segundo.
- Notas de servicio: el checkpoint verificado se sirve con MTP y DFly desactivados; se completaron cinco tamanos de captura de grafo `PIECEWISE`. La validacion de consistencia cubrió una peticion de texto con temperatura distinta de cero y una peticion con 16 imagenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hy4-W8A8-kunlunxin-FlagOS | 774,4 mil millones | 102.400 tokens | no disponible | Hugging Face (FlagRelease) | Version cuantizada W8A8 para Kunlunxin P800 con stack FlagOS |
| Hy4 (version oficial, checkpoint original) | no disponible | no disponible | no disponible | Referenciado en la model card | Base multimodal de Tencent Hunyuan; sirve de referencia en los benchmarks |
| Hy4 preview | no disponible | no disponible | no disponible | Referenciado en la model card | Version previa; puntuaciones inferiores en Terminal-Bench 4.0 y AutomationBench |

No se dispone en la informacion proporcionada de datos de parametros, contexto ni licencia de modelos alternativos de otros fabricantes para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias
- Idiomas: la model card solo declara ingles; el uso en castellano u otros idiomas no esta validado y puede degradar la calidad.
- Licencia no disponible: no se especifican los terminos de uso comercial; es imprescindible verificar la licencia del modelo base Hy4 antes de un despliegue en produccion.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni mecanismos de mitigacion en la informacion disponible.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Resultados en Kunlunxin pendientes: los benchmarks de Math-500, GPQA_Diamond, mmbench y mmstar figuran como "Evaluating" para la version FlagOS; no hay evidencia publicada de que la cuantizacion W8A8 preserve la precision del checkpoint original.
- Despliegue complejo: requiere dos nodos, 16 aceleradores P800, red RoCE, contenedor privilegiado y red de host; no es apto para entornos no confiables ni para infraestructura de un solo nodo.
- Funcionalidades desactivadas: el checkpoint verificado se sirve con MTP y DFly deshabilitados, lo que puede reducir el rendimiento frente a configuraciones que los habiliten.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (20 de noviembre de 2026), lo que indica una publicacion muy reciente y sin validacion externa acumulada.
- Compatibilidad de ecosistema: el uso esta ligado a versiones concretas de vLLM, FlagGems, FlagTree, FlagCX y PyTorch; desviarse de la imagen Docker validada puede romper el despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-kunlunxin-FlagOS
- Imagen Docker de referencia: `harbor.baai.ac.cn/flagrelease-inner-models-release/flagrelease-kunlunxin-release-model_hy4-testing-3-w8a8-no-mtp-tree_0.7.0rc2.xpu3.6-gems_5.4.0rc2.post1-cx_0.13.0-python_3.10.18-torch_cuda-2.9.0-pcp_xrt5.0.21-gpu_kunlunxin001-arc_amd64-driver_5.0.21.47:202611201828-rank0`
- Descarga via ModelScope: `modelscope download --model FlagRelease/Hy4-W8A8-kunlunxin-FlagOS`
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
