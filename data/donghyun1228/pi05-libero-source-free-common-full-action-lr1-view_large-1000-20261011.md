# Donghyun1228/pi05-libero-source-free-common-full-action-lr1-view_large-1000-20261011

## Resumen

El modelo `Donghyun1228/pi05-libero-source-free-common-full-action-lr1-view_large-1000-20261011` es un checkpoint de robotica publicado por el usuario Donghyun1228 en HuggingFace, construido sobre la familia de modelos Vision-Language-Action (VLA) pi0.5 de Physical Intelligence y distribuido a traves de la libreria `openpi`. Se trata de un experimento de adaptacion "source-free" sobre el benchmark LIBERO: se parte del grafo original (descrito en la model card como `gemma300m`) y se entrenan la vision y el experto de acciones completo (11 hojas de un total de 74), sin acceso a observaciones del dominio fuente ni a cache de profesor emparejado.

El objetivo del experimento es comparar la capacidad de adaptacion segun que modulos se descongelan y con que multiplicador se escalan las actualizaciones de accion tras AdamW. La variante aqui publicada corresponde al paso 999 tras 1000 actualizaciones de un modelo de dinamica inversa (IDM) solo sobre el dominio objetivo, con batch 32, experto de acciones completo sin LoRA y multiplicador 1.0. El autor reporta una evaluacion exploratoria de 400 episodios en LIBERO con un 50,00% de exito (200/400).

Su relevancia es acotada pero clara para quien investiga adaptacion de VLA: publica pesos, activos de normalizacion y metadatos de una ablacion concreta, ademas de los controles emparejados (LoRA, multiplicador 0.1, solo vision). No obstante, el propio autor advierte de que la retencion no esta establecida, las comparaciones son descriptivas y no emparejadas, y no existe una referencia publica verificada del repositorio fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Vision-Language-Action (VLA) con cabecera de acciones por flow-matching; grafo descrito como `gemma300m` sin LoRA (74 hojas en total, 11 en el experto de acciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en inferencia (loader de politica BF16 sin cambios); FP32 en los parametros fuente descongelados durante el entrenamiento. No se documentan formatos GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; repositorio de 7,7 GB compatible con el loader BF16 de `openpi`, con activos de normalizacion incluidos |

## Arquitectura y entrenamiento

La arquitectura es la de pi0.5 en la implementacion `openpi`: un modelo Vision-Language-Action que combina un backbone tipo Gemma (la model card indica `gemma300m`) con un experto de acciones separado y una cabecera de acciones basada en flow-matching. Sobre ese grafo, este checkpoint aplica un regimen de adaptacion "source-free": no se usan observaciones del dominio fuente, ni cache de profesor emparejado, ni rollouts de tareas exitosas, ni retroalimentacion de exito de tarea. El entrenamiento consiste en 1000 actualizaciones con batch 32 de un modelo de dinamica inversa (IDM) solo sobre el dominio objetivo, tras las cuales las actualizaciones de accion se multiplican por 1.0 despues de AdamW nativo.

En cuanto a que se entrena: vision base completa y experto de acciones completo, mientras que el LLM base y las proyecciones de entrada/salida de accion y tiempo permanecen congelados. Los parametros fuente que se descongelan pasan a FP32 durante el entrenamiento, mientras que en los controles con LoRA permanecian en BF16 (de modo que la comparacion full frente a LoRA tambien incorpora un cambio de precision). La inicializacion del experto de acciones esta ligada a hashes canonicos FP32 restaurados de forma independiente y a una equivalencia con la fuente en BF16. Para el despliegue se restaura el encoder de muneca original del dominio fuente. La inferencia usa el loader BF16 sin cambios en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`, con la configuracion `pi05_libero_source_free_split_vision_idm` y sus 74 hojas y activos de normalizacion.

## Capacidades

- Manipulacion robotica guiada por lenguaje: ejecucion de tareas de LIBERO en cuatro suites (Spatial, Object, Goal y Long), con instrucciones asociadas a cada tarea.
- Control visuomotor de horizonte largo: la suite Long, con tareas de mas pasos, se resuelve con exito en 32 de 100 episodios, lo que indica capacidad parcial de planificacion motora extendida.
- Percepcion visual multi-camara: uso de vista base y muñeca (wrist); en esta variante la vista es `view_large` y el encoder de muneca desplegado conserva los pesos fuente originales.
- Generacion de acciones por flow-matching: la cabecera de acciones produce trayectorias continuas en lugar de tokens discretos.
- Adaptacion sin datos fuente: el checkpoint se obtuvo sin observaciones del dominio original, sin cache de profesor y sin feedback de exito.
- Llamada a herramientas o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de texto; solo razonamiento implicito de tarea robotica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): vision si (entrada de imagenes); audio y thinking mode, no disponibles.

## Casos de uso

- Investigacion en adaptacion de VLA sin datos fuente: el checkpoint sirve como referencia reproducible para estudiar hasta que punto se puede adaptar un experto de acciones a un dominio objetivo sin observar el dominio original, comparando contra los controles publicados (LoRA, solo vision, multiplicador 0.1).
- Reproduccion de la ablacion publicada: con la config `pi05_libero_source_free_split_vision_idm` y MuJoCo 3.2.3 se puede replicar la evaluacion de 400 episodios, semilla 17 y diez ensayos por tarea, para verificar el 200/400 reportado.
- Punto de partida para fine-tuning posterior en LIBERO: al incluir activos de normalizacion y 74 hojas, es util como inicializacion para experimentos adicionales de ajuste en el mismo benchmark.
- Estudio de sensibilidad al multiplicador de actualizaciones de accion: los controles con multiplicador 0.1 y 1.0 permiten analizar como escala el rendimiento con la magnitud de la actualizacion post-Adam.
- Evaluacion de compromiso precision/capacidad: la diferencia FP32 frente a BF16 entre esta variante y los controles LoRA permite estudiar el efecto de la precision de entrenamiento en la retencion de habilidades.
- Analisis de errores por suite en robotica de manipulacion: la distribucion desigual (Spatial 66/100 frente a Long 32/100) es un material directo para estudiar donde falla el modelo en tareas de horizonte largo.
- Reutilizacion del encoder de muneca fuente: en despliegues donde la camara de muneca tenga caracteristicas similares al dominio fuente, se puede reutilizar tal cual, ya que el autor restaura esos pesos para el despliegue.

## Benchmarks y rendimiento

Evaluacion exploratoria completada de 400 episodios (diez ensayos por tarea, semilla 17, ocho clientes por GPU en las GPUs 0-3, inferencia BF16 sin cambios, cero errores de rollout, sin parada temprana por umbral). Revision evaluada: `a7da37b0987bcc10c737d675f33cdaeebbce7eb8`.

| Suite | Exitos |
|---|---:|
| Spatial | 66/100 |
| Object | 65/100 |
| Goal | 37/100 |
| Long | 32/100 |
| Total | 200/400 (50,00%) |

Comparaciones con controles emparejados a 1000 actualizaciones y 400 episodios, tal como las publica el autor:

| Control emparejado | Exitos | Candidato menos control (pp) |
|---|---:|---:|
| Experto de acciones completo, multiplicador 0.1 | 258/400 | -14,50 |
| LoRA de acciones, multiplicador 1.0 | 242/400 | -10,50 |
| LoRA de acciones, multiplicador 0.1 | 268/400 | -17,00 |
| Solo vision | 256/400 | -14,00 |

El autor indica que estas comparaciones son descriptivas y no emparejadas: el ruido de politica no esta sembrado con semilla y las semillas de entorno iguales no garantizan observaciones iniciales identicas. No constituyen una confirmacion de 2000 episodios, ni una prueba estadistica de retencion, ni la busqueda del multiplicador optimo, ni una comparacion causal puramente arquitectonica. No hay resultados de MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM para inferencia: no publicada. Como referencia, el repositorio ocupa 7,7 GB e incluye pesos, activos de normalizacion y codigo, y la carga se hace en BF16; un checkpoint de ese tamano suele requerir del orden de 10-16 GB de VRAM una vez anadidos buffers y estado del entorno, pero es una estimacion derivada del tamano del repositorio, no un dato oficial.
- GPU empleadas en la evaluacion: GPUs 0-3 (cuatro unidades), con ocho clientes por GPU. No se especifica el modelo concreto de GPU.
- Cabe en GPU de consumo: no confirmado. Un checkpoint BF16 de 7,7 GB es compatible en principio con GPUs de 24 GB (por ejemplo RTX 3090 o RTX 4090) segun la estimacion anterior, pero el autor no lo documenta.
- Opciones de despliegue: `openpi` es el entorno nativo (loader BF16 en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`). Para LIBERO se debe usar MuJoCo 3.2.3. En modelos relacionados de la misma serie, el entrenamiento se hace con FSDP en 4 GPUs.
- vLLM, TGI, llama.cpp u Ollama: no documentado para esta cabecera de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Todos los comparadores con datos numericos proceden del mismo autor y de la misma model card; no hay cifras publicadas de la linea base pi0.5 en la informacion disponible.

| Modelo o variante | Exitos (400 episodios) | Multiplicador | Entrenamiento | Licencia |
|---|---:|---:|---|---|
| Este checkpoint (experto completo, view_large) | 200/400 | 1.0 | Experto de acciones y vision completos, FP32 en descongelados | no disponible |
| Experto de acciones completo (control) | 258/400 | 0.1 | Experto de acciones completo | no disponible |
| LoRA de acciones (control) | 242/400 | 1.0 | LoRA sobre experto de acciones, BF16 | no disponible |
| LoRA de acciones (control) | 268/400 | 0.1 | LoRA sobre experto de acciones, BF16 | no disponible |
| Solo vision (control) | 256/400 | no aplica | Solo vision | no disponible |
| pi05_libero_finetuned_v044 (LeRobot) | no disponible | no aplica | Checkpoint ajustado y evaluado en LIBERO | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial. Tratar como uso restringido hasta confirmacion del autor.
- Retencion no establecida: el propio autor senala que la retencion de capacidades no esta demostrada.
- Comparaciones no emparejadas: el ruido de politica no esta sembrado y las semillas de entorno iguales no garantizan observaciones iniciales identicas; las diferencias de hasta -17 pp deben leerse como descriptivas.
- Confusion precision/arquitectura: la variante full usa FP32 en los parametros descongelados, mientras que los controles LoRA mantenian BF16, por lo que la comparacion full frente a LoRA mezcla capacidad de entrenamiento y precision.
- Datos de evaluacion limitados: 400 episodios en total, sin confirmacion a 2000 episodios y con evaluacion exploratoria, no auditoria independiente.
- Referencia de repositorio fuente no verificada: el autor indica que el origen heredado no tiene referencia publica verificada.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de acciones incorrectas o inseguras en entornos fisicos reales, ya que no se reportan rollouts exitosos usados para entrenar.
- Desequilibrio por suite: 32/100 en Long frente a 66/100 en Spatial; el rendimiento en tareas de horizonte largo es marcadamente inferior.
- Dependencia de version: requiere MuJoCo 3.2.3 para LIBERO; otras versiones pueden invalidar la reproducibilidad.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingues o con historiales largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-full-action-lr1-view_large-1000-20261011
- Checkpoint relacionado (vision, yaw30, 1000): https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011
- Checkpoint relacionado (contacto denso, wrist KD, yaw10): https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003
- Repositorio OpenPI (Physical Intelligence): https://deepwiki.com/Physical-Intelligence/openpi
- Sitio de OpenPI: https://www.openpi.net/english.html
- Checkpoint pi05_libero_finetuned_v044 en ModelScope: https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned_v044/summary
