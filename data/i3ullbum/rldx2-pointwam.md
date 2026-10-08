# i3ullbum/rldx2-pointwam

## Resumen

RLDX2 — PointWAM (Volt-H) es un conjunto de checkpoints de política robótica (visuomotora) publicado por el usuario i3ullbum en Hugging Face, pensado para controlar un robot RB-Y1M equipado con la mano Wuji Hand 2. No se trata de un modelo de lenguaje, sino de un artefacto de control entrenado para generar acciones motrices a partir de observaciones, e incluye varias etapas: un entrenamiento medio (mid-train) sobre teleoperación real y varios afinamientos (FT-A, FT-A cap30 y FT-B) realizados únicamente con datos humanos retargetizados.

El repositorio contiene cuatro checkpoints, un fichero de estadísticas de normalización y un paquete de despliegue para el PC del robot. La model card describe la receta de entrenamiento (LR constante 1e-4, AdamW con weight decay 0,01, EMA 0,9999, 4 GPU con batch 16 por GPU) y la configuración de despliegue, que utiliza los pesos EMA. No se publican detalles de arquitectura, número de parámetros, ventana de contexto ni benchmarks estándar.

Su relevancia es acotada y de carácter investigador: se trata de un artefacto experimental con 0 descargas y 0 likes en el momento de la consulta, orientado a reproducir un pipeline concreto de transferencia humano-robot sobre un hardware específico (RB-Y1M + Wuji Hand 2) y a desplegarse mediante un bundle propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. La model card cita únicamente componentes internos: encoder de texto congelado y tensores Mosaic3D reconstruidos en la carga; no se describe la columna ni el tipo de política (flow matching, difusión, etc.) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (existe un encoder de texto congelado, pero no se especifican idiomas) |
| Licencia | other (no detallada en la model card) |
| Formato de pesos | `.pt` (PyTorch). Carga con `torch.load(..., weights_only=False)`; no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 56,0 GB |
| Checkpoints incluidos | 4: mid-train (step 20000), FT-A (step 10000), FT-A cap30 (step 10000), FT-B (step 10000) |
| Contenido de cada checkpoint | `model` y `model_ema` (sin estado del optimizador); en despliegue se usa EMA |
| Hardware de entrenamiento | 4 GPU, batch 16 por GPU (batch efectivo 64) |
| Variable de entorno requerida | `PW_KP_PER_HAND=11` |
| Override de configuracion | `experiment=midtrain_rby1wuji_volt_h` y `data.norm_stats_path=stats/rby1wuji-midtrain-v1` |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de la red. Los únicos elementos técnicos mencionados son un encoder de texto congelado y tensores Mosaic3D que se reconstruyen desde su propia fuente durante la carga, además de un retargeter (encargado de mapear acciones humanas al espacio del robot) que permanece congelado durante los afinamientos. El nombre de la configuración de inicialización, `pt-flows-full-h`, sugiere el uso de algún esquema de flow matching, pero esto no se confirma en la documentación.

El entrenamiento se estructura en dos fases. La primera es un mid-train sobre teleoperación del RB-Y1M con la mano Wuji Hand 2, con 790 episodios y 8 horas de datos, partiendo de `pt-flows-full-h`, con batch 64 y 20.000 pasos. La segunda fase son afinamientos únicamente con datos humanos procedentes de `frontier_human_261007`, retargetizados con VITRA en la variante `jumpfix_offset`, durante 10.000 pasos y manteniendo el retargeter congelado. La variante FT-A cap30 aplica seguimiento con CoTracker sujeto a un límite físico de 30 cm y 0,1 s, con visibilidad a nivel de punto. La variante FT-B emplea el optimizador de retarget RRC. La receta común es LR constante 1e-4, AdamW con weight decay 0,01 y EMA 0,9999. Las estadísticas de normalización se calcularon en la fase de mid-train y no se recalcularon en los afinamientos.

El único resultado cuantitativo publicado es el valor 0,045 en el conjunto held-out denominado `robot_l2_moved` para el checkpoint de mid-train; la model card no especifica si se trata de un error L2, de una distancia ni las unidades.

## Capacidades

- Control visomotor para manipulación robótica sobre la plataforma RB-Y1M con la mano Wuji Hand 2.
- Generación de acciones con 11 keypoints por mano (`PW_KP_PER_HAND=11`), lo que define la interfaz de salida del modelo.
- Transferencia de habilidad desde vídeo humano al robot mediante retargeting (VITRA y RRC), sin necesidad de teleoperación en la fase de afinamiento.
- Ejecución de políticas entrenadas con datos de teleoperación (790 episodios, 8 horas) como base del mid-train.
- Despliegue en el PC del robot mediante un bundle que incluye entorno, código, pesos, FFS, datos de muestra y un script `install.sh`.
- Selección de pesos EMA en inferencia, orientada a un comportamiento más estable que el modelo sin media exponencial.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio o modo de pensamiento: no disponible (no aplica a este tipo de artefacto, y no se documenta nada al respecto).
- Capacidades multilingües: no disponible.

## Casos de uso

- Manipulación bimanual con Wuji Hand 2: el modelo produce 11 keypoints por mano, por lo que encaja en tareas que requieren coordinación de ambas manos sobre objetos, siempre que el robot sea un RB-Y1M con ese efector.
- Transferencia humano-robot en investigación: los checkpoints FT-A y FT-B permiten comparar dos esquemas de retargeting (VITRA con `jumpfix_offset` frente a RRC) partiendo del mismo mid-train, lo que resulta útil para estudiar qué método conserva mejor la habilidad humana.
- Estudio del límite físico en el seguimiento de puntos: la variante FT-A cap30, con límite de 30 cm y 0,1 s y visibilidad a nivel de punto, sirve para analizar el efecto de restringir las trayectorias de CoTracker en el resultado final.
- Despliegue en el robot real: el directorio `rldx2_bundle/` incluye entorno, código, pesos y datos de muestra, además de un `ckpt_<run>.tar` por checkpoint, lo que permite llevar la política al PC del robot sin reconstruir el pipeline.
- Reproducción de experimentos: los ficheros `norm_stats.json` y los overrides documentados (`experiment`, `norm_stats_path`, `PW_KP_PER_HAND=11`) permiten replicar la configuración exacta de cada ejecución.
- Generación de datos para destilación o evaluación: el mid-train sobre 790 episodios y las políticas afinadas pueden emplearse como profesor para generar trayectorias adicionales en el mismo hardware.
- Comparación de políticas en un mismo banco de pruebas: al compartir las estadísticas de normalización, los cuatro checkpoints son directamente conmutables en el mismo entorno de evaluación (métrica `robot_l2_moved`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni aplican a este tipo de modelo. El único dato numérico aportado es una métrica interna:

| Metrica | Conjunto | Valor | Checkpoint |
|---|---|---|---|
| robot_l2_moved | held-out | 0,045 | mid-train, step 20000 |

La model card no define la métrica, sus unidades ni el protocolo de evaluación, y no se publican resultados equivalentes para los checkpoints de afinamiento (FT-A, FT-A cap30, FT-B).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no indica el tamaño en parámetros ni la huella de memoria de cada checkpoint.
- Espacio en disco: el repositorio completo ocupa 56,0 GB, repartidos entre cuatro checkpoints (cada uno con `model` y `model_ema`), las estadísticas de normalización y el bundle de despliegue.
- GPU de entrenamiento: la receta documentada emplea 4 GPU con batch 16 por GPU (batch efectivo 64). No se especifica el modelo de GPU utilizado.
- GPU recomendadas para inferencia: no disponible en la documentación.
- Viabilidad en GPU de consumo: no disponible; no puede confirmarse sin conocer el número de parámetros.
- Opciones de despliegue: bundle propio para el PC del robot (`rldx2_bundle/`, con `install.sh`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y estos servidores no son aplicables a una política de control.
- Latencia y throughput: no disponible.
- Requisito de configuración: cargar los checkpoints con `torch.load(..., weights_only=False)` y definir la variable de entorno `PW_KP_PER_HAND=11`; el encoder de texto congelado y los tensores Mosaic3D se reconstruyen desde su fuente en el momento de la carga, por lo que dichas dependencias deben estar disponibles en el entorno.

## Comparativa con modelos similares

No disponible. No se han publicado para este modelo ni el número de parámetros, ni la arquitectura, ni el rendimiento en benchmarks estándar, por lo que no es posible establecer una comparación cuantitativa rigurosa con otras políticas robóticas visomotoras. Cualquier comparación con alternativas de la misma categoría (por ejemplo, políticas de manipulación entrenadas con datos de teleoperación o con transferencia desde vídeo humano) requeriría consultar las fichas y publicaciones de cada una de esas alternativas, ya que esta model card no aporta datos equivalentes.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas y 0 likes en el momento de la consulta, con licencia `other` sin texto de licencia publicado. No hay autorización explícita de uso comercial.
- Especificidad de hardware: los checkpoints están entrenados para el robot RB-Y1M con la mano Wuji Hand 2 y 11 keypoints por mano; no son reutilizables directamente en otras plataformas sin un nuevo retargeting.
- Sin datos de arquitectura ni de tamaño: la imposibilidad de conocer el número de parámetros impide estimar requisitos de memoria, latencia o coste de despliegue.
- Métrica única y no definida: el valor `robot_l2_moved = 0,045` carece de definición, unidades y protocolo en la model card, por lo que no sirve como referencia externa.
- Ausencia de evaluación de sesgos, robustez o seguridad: no se documenta ningún análisis de fallos, límites de fuerza, comportamientos inseguros ni pruebas fuera de distribución.
- Riesgo de sobreajuste al dominio de entrenamiento: el mid-train se apoya en 790 episodios y 8 horas de teleoperación, un volumen reducido, y el afinamiento humano usa un único conjunto (`frontier_human_261007`).
- Dependencia de componentes externos congelados: el encoder de texto, los tensores Mosaic3D y el estadístico de normalización deben reconstruirse o recuperarse desde su origen; si esas fuentes no están disponibles, los checkpoints no podrán cargarse.
- Uso de EMA no verificado externamente: la model card recomienda EMA en despliegue, pero no aporta comparación con el modelo sin media exponencial.
- Idiomas soportados y comportamiento multilingüe: no disponible.
- Fecha de publicación registrada (2026-10-07) posterior a la fecha habitual de referencia del lector; conviene verificar la vigencia del repositorio antes de apoyarse en él.

## Enlaces

- Hugging Face: https://huggingface.co/i3ullbum/rldx2-pointwam
- Repositorio de codigo: rama `rldx2/frontier-deploy` del proyecto PointWAM; la URL del repositorio no se proporciona en la informacion disponible.
- Checkpoints citados en la model card:
  - `midtrain/rby1wuji-midtrain-v1-kp11-bs64-dbg/model-step20000.pt`
  - `humanft/rby1wuji-humanft-vitra-jfo-kp11-bs64/model-step10000_frozenret.pt`
  - `humanft/rby1wuji-humanft-vitra-jfo-cap30-kp11-bs64/model-step10000_frozenret.pt`
  - `humanft/rby1wuji-humanft-rrc-nogate-kp11-bs64/model-step10000_frozenret.pt`
- Estadisticas de normalizacion: `stats/rby1wuji-midtrain-v1/norm_stats.json`
- Bundle de despliegue: `rldx2_bundle/` (entorno, codigo, pesos, FFS, datos de muestra, `ckpt_<run>.tar` por checkpoint, `install.sh`)
- Papers, blogs, demos o repositorios adicionales: no disponibles en la informacion proporcionada.
