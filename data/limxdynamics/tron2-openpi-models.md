# limxdynamics/tron2-openpi-models

## Resumen

TRON 2 OpenPI Models es una colección de checkpoints del modelo vision-language-action (VLA) Pi0.5, desarrollada por LimX Dynamics y publicada en Hugging Face. Estos pesos están afinados mediante OpenPI (el framework de Physical Intelligence) y se integran con los módulos de política del robot humanoide modular LimX TRON 2, que combina brazos modulares, pinzas o manos BrainCo, cabeza, chasis y elevador.

El repositorio cubre seis tareas de manipulación real: entrega de caramelos, doblado de ropa, clasificación de objetos, organización de escritorio, vertido de judías y limpieza de suelo con el chasis. Cada tarea cuenta con su propio checkpoint y estadísticas de normalización, y se despliega a través del pipeline de servicio de políticas Pi0/Pi0.5 junto con los clientes de robot real del repositorio tron2_openpi.

La relevancia de esta publicación radica en que ofrece pesos orientados a despliegue para un robot comercial concreto, no modelos genéricos de investigación. El repositorio ocupa 87,1 GB e incluye pesos derivados de PaliGemma a través de OpenPI, por lo que su uso está sujeto tanto a la licencia Apache 2.0 del código como a los términos de Gemma para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en Pi0.5 (OpenPI), derivada de PaliGemma |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (segun etiquetas de la model card) |
| Licencia | apache-2.0-and-gemma-terms (otra) |
| Formato de pesos | no disponible (checkpoints de OpenPI; el repo no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

Los checkpoints se basan en Pi0.5, un modelo vision-language-action implementado dentro del framework OpenPI y derivado de PaliGemma. La arquitectura combina un backbone vision-language con una cabeza de política que genera acciones motoras a partir de observaciones visuales e instrucciones de tarea. LimX Dynamics ha afinado estos pesos para el robot TRON 2, integrando la salida del modelo con los módulos de política del robot (brazos, pinzas o manos, cabeza, chasis y elevador).

El entrenamiento se realizó mediante fine-tuning sobre OpenPI para seis tareas específicas, cada una con su propio checkpoint y contador de pasos (por ejemplo, `candy_h30_rtc_25000`, `cloth_h30_rtc_74999`, `sort_h50_rtc_30000`). Los nombres sugieren configuraciones de horizonte (h30, h50) y variantes RTC. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Control de manipulación robótica mediante políticas vision-language-action para el robot LimX TRON 2.
- Ejecución de tareas concretas: entrega de caramelos, doblado de ropa, clasificación, organización de escritorio, vertido de judías y limpieza de suelo con chasis.
- Integración con brazos modulares, pinzas o manos BrainCo, cabeza, chasis y elevador del TRON 2.
- Despliegue mediante pipeline de servicio de políticas Pi0/Pi0.5 con clientes de robot real.
- Soporte de instrucciones en inglés y chino (según etiquetas de idioma de la model card).
- Checkpoint adicional `pi05_tron2_banana` sin perfil de despliegue público.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Entrega de objetos en entornos controlados: el checkpoint `pi05_tron2_candy` permite al TRON 2 recoger y entregar caramelos u objetos similares, usando el pipeline de servicio Pi0.5 y el cliente `pi_client_rtc.py` para control en tiempo real.
- Doblado de ropa automatizado: el checkpoint `pi05_tron2_cloth` está entrenado para manipular telas, una tarea de alta destreza que requiere coordinación bimanual y percepción visual continua.
- Clasificación de objetos: `pi05_tron2_sort` habilita tareas de picking and placing con criterios de clasificación, adecuado para líneas de montaje o logística ligera.
- Organización de escritorio: `pi05_tron2_desktop` permite reordenar objetos sobre una superficie de trabajo, útil en entornos de oficina o laboratorio.
- Vertido de sustancias: `pi05_tron2_beans` está orientado a tareas de pouring, que exigen control preciso de orientación y fuerza con las manos o pinzas.
- Limpieza de suelo con chasis: `pi05_tron2_chassis` combina la base móvil del TRON 2 con la política VLA para tareas de barrido o limpieza, usando estadísticas de normalización específicas (`chassis270`).
- Investigación en VLA: los checkpoints sirven como base para fine-tuning en nuevas tareas mediante el repositorio `tron2_openpi`, facilitando la experimentación con políticas Pi0.5 en robótica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: pipeline de servicio de políticas Pi0/Pi0.5 mediante `scripts/serve_policy.py` y cliente `examples/tron2/pi_client_rtc.py` del repositorio `tron2_openpi`, con perfiles de configuración YAML (`candy_server.yaml`, `candy_client.yaml`, etc.).
- Latencia y throughput: no disponible.
- Tamaño del repositorio: 87,1 GB, lo que implica requisitos de almacenamiento considerables para descargar los checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| limxdynamics/tron2-openpi-models | no disponible | no disponible | apache-2.0-and-gemma-terms | Hugging Face, ModelScope |
| OpenPI (Physical Intelligence) | no disponible | no disponible | según OpenPI | GitHub |
| Pi0.5 base | no disponible | no disponible | según OpenPI/PaliGemma | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los checkpoints están diseñados exclusivamente para el robot LimX TRON 2; no son transferibles directamente a otras plataformas sin fine-tuning.
- Dirigen movimiento físico real: deben usarse desde el estado inicial del robot, con el espacio de trabajo despejado (ambos brazos se mueven), operador formado presente y parada de emergencia accesible.
- La licencia combina Apache 2.0 (código) con los términos de Gemma (pesos derivados de PaliGemma), lo que impone restricciones adicionales para uso comercial.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de contexto o idioma más allá de en/zh.
- El checkpoint `pi05_tron2_banana` no tiene perfil de despliegue público, por lo que su uso en producción no está soportado oficialmente.
- No se especifican requisitos de hardware ni cuantizaciones, lo que dificulta la planificación de despliegue.
- El tamaño del repositorio (87,1 GB) puede suponer una barrera para entornos con almacenamiento limitado.

## Enlaces

- Hugging Face: https://huggingface.co/limxdynamics/tron2-openpi-models
- ModelScope: https://www.modelscope.cn/models/LimXDynamics/tron2-openpi-models
- Repositorio de código (fine-tuning y despliegue): https://github.com/limxdynamics/tron2_openpi
- Entorno de robot real: https://github.com/limxdynamics/tron2_env
- OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Descripción del robot (URDF/MJCF/USD): https://huggingface.co/limxdynamics/tron2-robot-description
- Issues: https://github.com/limxdynamics/tron2_openpi/issues
- Hugging Face de LimX Dynamics: https://huggingface.co/limxdynamics
- GitHub de LimX Dynamics: https://github.com/limxdynamics
- Sitio web: https://www.limxdynamics.com/en
- Contacto: opensource@limxdynamics.com
