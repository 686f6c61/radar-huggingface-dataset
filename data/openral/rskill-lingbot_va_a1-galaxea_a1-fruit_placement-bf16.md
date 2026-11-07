# OpenRAL/rskill-lingbot_va_a1-galaxea_a1-fruit_placement-bf16

## Resumen

`rskill-lingbot_va_a1-galaxea_a1-fruit_placement-bf16` es un paquete de habilidad robótica (rSkill) publicado por OpenRAL que empaqueta una política de visión-lenguaje-acción (VLA) para el brazo Galaxea A1. No se trata de un modelo de lenguaje generalista, sino de un checkpoint de control motor especializado en una tarea concreta: coger fruta (incluido un mango) de una superficie de mesa y colocarla en un bol o plato. La política consume dos vistas RGB sincronizadas (frontal y de muñeca) y predice pose relativa del efector final más un comando continuo de pinza.

El modelo subyacente es un ajuste fino a parámetros completos de `robbyant/lingbot-va-base`, un modelo base que predice conjuntamente latentes de vídeo y canales de acción. El entrenamiento se realizó sobre 130 episodios y 44.824 fotogramas a 30 FPS del dataset `nyush-galaxea-a1-fruit-placement-eef-v21`, con 1.000 pasos de optimizador en dos NVIDIA H100 de 80 GB usando FSDP y bfloat16.

Su relevancia es doble: por un lado, demuestra el patrón de empaquetado de OpenRAL, que separa la política del runtime de robot mediante contratos tipados de observación y acción, un kernel de seguridad en C++ y una capa de abstracción de hardware (HAL); por otro, es un ejemplo reproducible de despliegue de un VLA en hardware real con licencia Apache 2.0, algo poco habitual en el ecosistema de robótica de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con predicción conjunta de latentes de vídeo y canales de acción; basada en `robbyant/lingbot-va-base` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (la política opera por chunks de 16 pasos de acción) |
| Tipos de cuantizacion | bfloat16 (único formato publicado en este rSkill) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint PyTorch (referenciado por URI fijada a revisión; no se copian pesos al repositorio OpenRAL) |

## Arquitectura y entrenamiento

La política es un ajuste fino a parámetros completos del modelo base `robbyant/lingbot-va-base`, que combina la predicción de latentes de vídeo con la predicción de canales de acción del robot. El modelo emite 16 pasos de efector final y pinza por chunk, con `n_action_steps` de 8. La normalización por cuantiles y el mapa de canales de acción `[0, 1, 2, 3, 4, 5, 6, 28]` se aplican en el servidor LingBot externo a partir de `configs/va_a1_cfg.py` del checkpoint; no se trata de un `PolicyProcessorPipeline` de LeRobot.

El entrenamiento utilizó 130 episodios y 44.824 fotogramas a 30 FPS del dataset `pengyue-polaron/nyush-galaxea-a1-fruit-placement-eef-v21`, con 1.000 pasos de optimizador, dos NVIDIA H100 de 80 GB, FSDP a parámetros completos, bfloat16 y un tamaño de lote global efectivo de 16. No se documenta en la información disponible el uso de RLHF, DPO ni datos de preentrenamiento del modelo base.

La innovación destacable no está en el modelo sino en el contrato de despliegue: la pasarela de política del A1 Runtime valida cada objetivo físico de efector final, resuelve cinemática inversa (IK) y emite seis objetivos articulares absolutos más un objetivo normalizado de pinza. Si una solución de IK excede el límite de salto articular relativo a la retroalimentación, la pasarela avanza hacia esa misma solución en ticks sucesivos a 30 Hz y no consume la siguiente acción del modelo hasta poder despachar el objetivo completo. El resultado de cinemática directa del objetivo despachado se escribe en la caché KV de LingBot.

## Capacidades

- Manipulación robótica de pick-and-place sobre mesa: coger fruta (incluido mango) y colocarla en bol o plato.
- Percepción multimodal con dos vistas RGB sincronizadas: frontal (480x480x3) y de muñeca (480x640x3).
- Predicción de pose de efector final relativa al episodio y comando continuo normalizado de pinza.
- Emisión de chunks de 16 pasos de acción con 8 pasos efectivos por invocación.
- Integración con contrato de acción tipado de 7 dimensiones (6 articulaciones absolutas en radianes + 1 pinza normalizada).
- Resolución de IK y validación física mediante la pasarela del A1 Runtime, con escritura de FK en la caché KV del modelo.
- Ejecución a través del kernel de seguridad en C++ de OpenRAL y de la HAL del Galaxea A1.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Clasificación y recogida de fruta en línea de mesa: el modelo identifica la fruta y genera la secuencia de aproximación y agarre usando la vista frontal y la de muñeca de forma sincronizada, lo que permite corregir la aproximación final con la cámara del efector.
- Colocación en recipiente con destino variable: la política predice pose relativa al episodio, de modo que puede colocar la pieza en un bol o plato situado en distintas posiciones dentro del espacio de trabajo del A1.
- Banco de pruebas de integración hardware-in-the-loop: sirve para validar el pipeline completo de OpenRAL (observación, propuesta tipada, kernel de seguridad, acción segura y HAL) antes de desplegar políticas propias.
- Demostración reproducible de un VLA en robot de sobremesa: con licencia Apache 2.0 y un checkpoint público fijado a revisión, es adecuado para laboratorios que quieran replicar un flujo de ajuste fino de un modelo base vídeo-acción.
- Generación de datos de manipulación etiquetados: al ejecutarse sobre el A1 Runtime con contratos versionados, las trazas de observación y acción resultantes pueden reutilizarse para ampliar el dataset de fruit placement.
- Evaluación comparativa de políticas de manipulación: al estar empaquetado como rSkill con manifiesto y límites de latencia declarados (6.000 ms por chunk), permite medir latencia y tasa de éxito frente a otras habilidades del mismo runtime.
- Prueba de concepto de control por chunks en entornos con cinemática restringida: el mecanismo de avance progresivo hacia la solución de IK cuando se excede el límite de salto articular es aplicable a otros brazos de seis ejes con envolventes de comando estrechas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento declarados en el manifiesto son el presupuesto de latencia de 6.000 ms por chunk y el tamaño de chunk de 16 pasos con 8 pasos efectivos. El estado de integración indicado por el autor es hardware-in-the-loop: han pasado idas y vueltas de articulaciones y pinza y un pick-and-place de limón verificado visualmente, pero la adjudicación automática de la tarea sigue pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (`min_vram_gb` es nulo en el manifiesto). El entrenamiento usó dos H100 de 80 GB, pero no se publica la huella de inferencia.
- GPU recomendadas: no disponible de forma explícita; por el uso de bfloat16 y el origen del ajuste fino, se presume viabilidad en GPU de centro de datos con soporte bf16, sin confirmación del autor.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: runtime PyTorch a través de OpenRAL, con servidor LingBot externo y pasarela de política del A1 Runtime; comunicación por sockets Unix privados por usuario con el Camera Bridge emparejado. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política.
- Latencia: presupuesto declarado de 6.000 ms por chunk; el bucle de control del runtime opera a 30 Hz.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-lingbot_va_a1-galaxea_a1-fruit_placement-bf16 | VLA especializado en fruit placement para Galaxea A1 | no disponible | no disponible (chunks de 16 pasos) | Apache 2.0 | Hugging Face, pesos referenciados por URI fijada |
| robbyant/lingbot-va-base | Modelo base VLA vídeo-acción | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |
| pengyue-polaron/lingbot-va-galaxea-a1-fruit-placement-eef | Checkpoint público al que apunta este rSkill | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para fruit placement sobre mesa con los objetos fruta, mango, bol y plato; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de encarnación: el contrato es específico de los seis ejes del Galaxea A1 según `robots/galaxea_a1/robot.yaml`; no es una HAL cartesiana genérica ni habilita la ruta AnyGrasp/AnyEffector del fabricante.
- Estado de validación incompleto: solo se ha verificado un pick-and-place de limón con comprobación visual y la adjudicación automática de la tarea sigue pendiente, por lo que no hay métricas de tasa de éxito publicadas.
- Propietario único de cámara: el A1 Runtime es el único dueño de los dispositivos; OpenRAL no abre las RealSense directamente, lo que impide usar la política fuera de ese runtime sin adaptar la capa de observación.
- Dependencia de componentes externos: requiere el servidor LingBot con `configs/va_a1_cfg.py` para la normalización por cuantiles y el mapa de canales; no es un pipeline estándar de LeRobot.
- Riesgo de alucinación perceptiva: como modelo generativo que predice latentes de vídeo y acciones, puede producir trayectorias plausibles pero incorrectas ante objetos o iluminaciones fuera de distribución; la mitigación recae en el kernel de seguridad y en los límites de salto articular, no en el modelo.
- Idioma: la model card declara únicamente inglés; no hay soporte multilingüe documentado.
- Sesgos: no se documentan análisis de sesgo; el dataset procede de un único entorno de laboratorio y una única encarnación, lo que introduce sesgo de dominio.
- Licencia: Apache 2.0 permite uso comercial según el manifiesto (`is_commercial_use_allowed: true`), pero la licencia del modelo base y del checkpoint referenciado no se detalla en la información disponible y debe verificarse antes de un despliegue comercial.
- Latencia: el presupuesto de 6.000 ms por chunk limita la reactividad; no es adecuada para tareas que requieran control de alta frecuencia.

## Enlaces

- Hugging Face del rSkill: https://huggingface.co/OpenRAL/rskill-lingbot_va_a1-galaxea_a1-fruit_placement-bf16
- Repositorio OpenRAL (ruta del rSkill): https://github.com/OpenRAL/openral/tree/master/rskills/lingbot-va-galaxea-a1-fruit-placement
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Checkpoint público referenciado: https://huggingface.co/pengyue-polaron/lingbot-va-galaxea-a1-fruit-placement-eef
- Dataset de entrenamiento: https://huggingface.co/datasets/pengyue-polaron/nyush-galaxea-a1-fruit-placement-eef-v21
- Imagen de previsualización de la escena: https://huggingface.co/pengyue-polaron/lingbot-va-galaxea-a1-fruit-placement-eef/resolve/90e017bdbc6afac2e441b4634c9192776bbcb8b7/assets/fruit_placement_agent_view_labeled.png
