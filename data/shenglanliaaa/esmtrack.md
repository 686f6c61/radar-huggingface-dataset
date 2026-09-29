# ShenglanLiaaa/ESMTrack

## Resumen

ESMTrack es un modelo de seguimiento visual de objetos (visual object tracking) orientado especificamente al seguimiento RGBT, es decir, seguimiento que combina imagenes en el espectro visible (RGB) con imagenes termicas (T). Lo desarrolla ShenglanLiaaa y se distribuye unicamente como pesos preentrenados en HuggingFace, acompanados de un repositorio de codigo en GitHub para entrenamiento y evaluacion.

El modelo se apoya en el backbone preentrenado DropMAE (un ViT entrenado con masked autoencoding sobre video) y se publican cinco checkpoints independientes, cada uno ajustado sobre un benchmark distinto de tracking RGBT: LasHeR, VTUAV, GTOT, RGBT210 y RGBT234. La convencion de nombres de configuracion (`dropmae_256_150ep`) sugiere entradas de 256 pixeles y 150 epocas de entrenamiento, aunque no se documentan en la model card.

Es relevante para investigadores que trabajan en percepcion multimodal, vigilancia, robotica o conduccion autonoma, donde la fusion RGB-termica mejora el seguimiento en condiciones de baja iluminacion. El repositorio tiene 2,1 GB, cero descargas y cero likes en el momento de la consulta, lo que lo situa como una publicacion reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de seguimiento RGBT basada en transformer con backbone DropMAE (ViT-MAE); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en .pth, sin versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | other (terminos personalizados, no especificados en la ficha) |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura en detalle, pero el codigo de configuracion indicado en los ejemplos de uso (`dropmae_256_150ep`) apunta a un pipeline basado en DropMAE, un ViT preentrenado con masked autoencoding sobre video (Kinetics-700). El modelo sigue el paradigma de tracking RGBT, que fusiona caracteristicas del canal visible y del canal termico para localizar un objeto a lo largo de una secuencia.

Los pesos publicados son checkpoints finales de ajuste por benchmark, no el backbone preentrenado. Los pesos del backbone DropMAE (`dropmae_k700_800E.pth`) no se redistribuyen en el repositorio y deben descargarse por separado del proyecto DropMAE y colocarse en `pretrained_networks/`. No se documenta composicion del dataset de entrenamiento, numero de tokens, ni si hubo fases de RLHF o DPO (procedimientos propios de modelos de lenguaje, no aplicables aqui). La resolucion de entrada y el numero de epocas (256, 150) solo se infieren del nombre de la configuracion.

## Capacidades

- Seguimiento visual de objetos en secuencias de video, prediciendo la caja envolvente del objetivo fotograma a fotograma.
- Fusion multimodal RGB + termico, lo que permite operar en condiciones de baja iluminacion, niebla o deslumbramiento donde el canal visible falla.
- Cinco variantes de pesos especializadas por dominio de benchmark: LasHeR y VTUAV (escenas aereas y de largo plazo), GTOT, RGBT210 y RGBT234 (conjuntos clasicos de tracking RGBT).
- Integracion con pipelines de PyTorch y con el codigo de entrenamiento/evaluacion del repositorio GitHub, que soporta registro de logs en Weights & Biases.
- Soporte para evaluacion multi-GPU (los ejemplos de uso invocan `--num_gpus 2`).
- No se documentan capacidades de tool calling, agentes, generacion de texto, codigo, matematicas, vision generativa, audio ni modo de razonamiento. El modelo es exclusivamente un tracker de objetos.

## Casos de uso

- Vigilancia perimetral nocturna: el seguimiento RGBT mantiene el bloqueo sobre personas o vehiculos cuando la iluminacion cae, usando el canal termico como respaldo del RGB.
- Seguimiento desde dron en misiones de busqueda y rescate: el checkpoint VTUAV esta ajustado sobre escenas aereas y de largo plazo con UAVs, adecuado para monitorizar objetivos desde plataformas no tripuladas.
- Robotica movil en entornos industriales: seguimiento de una persona o pieza guia combinando camara visible y termica, con entrada de 256 pixeles que reduce la carga computacional frente a resoluciones mayores.
- Analisis forense de video: reprocesado de grabaciones con camaras duales para reconstruir trayectorias de un objetivo, aprovechando los checkpoints RGBT210/RGBT234 que cubren escenas diversas.
- Automocion y ADAS: seguimiento de peatones o vehiculos en condiciones adversas (noche, lluvia) donde la fusion RGB-termica aporta robustez sobre un tracker puramente RGB.
- Benchmarking academico: uso directo de los checkpoints publicados para reproducir resultados sobre LasHeR, VTUAV, GTOT, RGBT210 y RGBT234 y comparar contra otros metodos de tracking RGBT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente asocia cada archivo de checkpoint con su benchmark de evaluacion (LasHeR, VTUAV, GTOT, RGBT210, RGBT234), pero no incluye valores de precision, exito (AUC), ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (2,1 GB) agrupa los cinco checkpoints, por lo que el peso individual de cada uno es inferior a ese total, pero no se especifica.
- GPU recomendadas: no disponibles en la documentacion; los ejemplos de uso del repositorio invocan 2 GPUs (`--num_gpus 2`), lo que sugiere que la evaluacion de referencia se realizo en configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada. Al tratarse de un modelo basado en ViT con entrada de 256 pixeles, es plausible que quepa en GPUs de consumo modernas, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: el flujo documentado es PyTorch nativo con el codigo del repositorio GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a tracking).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros trackers RGBT como pueden ser los metodos de referencia publicados en LasHeR o RGBT234, ni se aportan datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo de vision no genera texto, por lo que los sesgos tipicos de modelos de lenguaje no aplican; si pueden existir sesgos ligados a la composicion de los datasets de tracking empleados (LasHeR, VTUAV, GTOT, RGBT210, RGBT234).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es el fallo de seguimiento (perdida del objetivo o deriva de la caja) en escenas ocluidas, con cambios de apariencia o movimiento rapido.
- Limitaciones de contexto o idioma: no aplica; es un modelo de vision sin procesamiento de lenguaje.
- Restricciones de licencia: la licencia figura como `other` sin detalle adicional en la model card, por lo que se desconoce si se permite uso comercial. Es imprescindible contactar con el autor o revisar el repositorio de codigo antes de cualquier despliegue productivo.
- El backbone DropMAE no se redistribuye en este repositorio: es obligatorio descargarlo por separado desde el proyecto DropMAE y respetar su propia licencia, lo que anade una dependencia externa al despliegue.
- Los pesos estan especializados por benchmark: usar un checkpoint fuera de su dominio de entrenamiento puede degradar el rendimiento.
- Repositorio con cero descargas y cero likes: no hay validacion de la comunidad que respalde su robustez en produccion.
- Tamano del repositorio de 2,1 GB: requiere espacio en disco y ancho de banda considerables para la descarga completa.

## Enlaces

- HuggingFace: https://huggingface.co/ShenglanLiaaa/ESMTrack
- Repositorio GitHub: https://github.com/LiShenglana/ESMTrack
- Backbone DropMAE (externo, obligatorio descargar aparte): https://github.com/jimmy-dq/DropMAE
- Arbol de ficheros en HuggingFace: https://huggingface.co/ShenglanLiaaa/ESMTrack/tree/main
