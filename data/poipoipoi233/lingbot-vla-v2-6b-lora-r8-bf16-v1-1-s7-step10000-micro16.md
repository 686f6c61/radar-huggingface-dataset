# poipoipoi233/lingbot-vla-v2-6b-lora-r8-bf16-v1.1-s7-step10000-micro16

## Resumen

Este repositorio no es un modelo completo, sino un adaptador LoRA en formato PEFT entrenado sobre el modelo base `robbyant/lingbot-vla-v2-6b`, un modelo fundacional de Vision-Language-Action (VLA) orientado a robotica. El adaptador fue publicado por el usuario `poipoipoi233` y corresponde a una ejecucion concreta de ajuste fino: protocolo v1.1, rango LoRA 8, alpha 8, semilla 7 y 10.000 pasos de optimizador, con un micro-batch de 16 muestras por GPU (de ahi la etiqueta `micro16`, que hace referencia al tamano de lote y no a la precision numerica).

La particularidad tecnica del paquete es que se trata de un adaptador almacenado en FP32 procedente de una ejecucion de entrenamiento en precision mixta BF16. Esto significa que el calculo del estudiante se hizo en BF16, pero los parametros maestros de LoRA y los estados del optimizador se mantuvieron en FP32 y se exportaron conservando esos bytes. El resultado son 8.494 tensores de adaptador distribuidos sobre 4.247 modulos objetivo, con un peso total de repositorio de 0,3 GB. Los pesos congelados del modelo base no se incluyen.

Es relevante ahora porque el ecosistema VLA esta pasando de la pre-publicacion a la aplicacion real en robotica, y este repositorio documenta de forma inusualmente detallada la trazabilidad de un entrenamiento (hashes SHA-256, revision exacta del modelo base, configuracion de hardware). Al mismo tiempo, el propio autor advierte de que no se incluyen resultados de evaluacion de exito en tareas, por lo que el adaptador debe considerarse material de investigacion y reproducibilidad, no un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) sobre el modelo base `robbyant/lingbot-vla-v2-6b`; el detalle del backbone no esta disponible en la informacion proporcionada |
| Parametros totales | Aproximadamente 6B en el modelo base (segun el identificador del modelo); el adaptador contiene 8.494 tensores LoRA |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el modelo base; el adaptador se almacena en FP32 y el cargador puede convertirlo a BF16 para inferencia |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no incluye los pesos congelados del modelo base |
| Rango / alpha de LoRA | 8 / 8 |
| Modulos objetivo | 4.247 modulos objetivo (nombres registrados en `adapter_config.json`) |
| Precision de entrenamiento | Computo del estudiante en BF16; parametros maestros de LoRA y estados del optimizador en FP32 |
| Tamano del repositorio | 0,3 GB |
| Revision del modelo base | `11c703bf6a5c1f45b3b69168482da11fdbba53d7` |
| Pasos de optimizacion | 10.000 (semilla 7) |
| Hardware de entrenamiento | 4 GPU A100; micro-batch 16 por GPU; acumulacion 1; lote global 64 |
| SHA-256 del adaptador de origen | `57c1fee640f29aeb0babb94a9dedf3e5daa0a75d6d60e95e12e76e76c15a6c2d` |
| SHA-256 de la exportacion PEFT | `0ca911e44399199de4974e21dbb942f69ce35d277f3812973262c4d1f7a5c4a1` |

## Arquitectura y entrenamiento

El objeto de este repositorio es exclusivamente el adaptador, no la arquitectura completa. La familia LingBot-VLA v2 se describe en su documentacion publica como un modelo fundacional de Vision-Language-Action practico, disenado para pasar del pre-entrenamiento a gran escala a aplicaciones roboticas reales, con un pipeline de datos redisenado que cura en torno a 60.000 horas de datos de pre-entrenamiento (de las cuales 50.000 horas corresponden a una fase concreta segun la descripcion del proyecto). El modelo base asociado figura en HuggingFace con la etiqueta `arxiv:2508.02317` y ha sido objeto de una revision de metadatos por parte del personal de HuggingFace. No se dispone de informacion detallada sobre el numero de tokens, la composicion exacta del dataset ni la presencia de fases de RLHF o DPO en la informacion proporcionada.

En cuanto al entrenamiento de este adaptador concreto, los datos disponibles indican un ajuste LoRA de rango 8 y alpha 8 sobre 4 GPU A100, con micro-batch de 16 por GPU, sin acumulacion de gradientes y lote global efectivo de 64, durante 10.000 pasos de optimizador con semilla 7. La innovacion tecnica relevante es la gestion de precision: se empleo computo BF16 con parametros maestros y estados de optimizador en FP32, y la exportacion PEFT elimino el segmento `.default` propio del entrenamiento conservando los bytes FP32 de cada tensor. El resultado son 8.494 tensores sobre 4.247 modulos objetivo. El autor verifica la integridad mediante `SHA256SUMS` y advierte explicitamente de que este run `micro16` no debe intercambiarse con el run `micro8` publicado por otro usuario (`JMG-NTU123/lingbot-vla-v2-6b-lora-r8-fp32-v1.1-s7-step10000`), ya que los pesos son distintos.

## Capacidades

- Ejecucion de tareas de Vision-Language-Action sobre el modelo base LingBot-VLA v2, orientadas a robotica y manipulacion, heredadas del modelo base y no del adaptador por si mismo.
- Ajuste fino especifico sobre el comportamiento del modelo base para la tarea o el conjunto de datos usado en el entrenamiento, cuyo contenido no se detalla en la informacion proporcionada.
- Inyeccion mediante PEFT: el adaptador se carga sobre el modelo base y sus pesos congelados, sin fusion.
- Conservacion de precision: al almacenarse en FP32, permite auditar los valores aprendidos antes de cualquier casteo a BF16 en inferencia.
- Trazabilidad y reproducibilidad: hashes SHA-256, revision exacta del modelo base y configuracion completa de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): el modelo base es de tipo vision-language-action, pero no se detallan capacidades adicionales en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de ajuste fino en robotica: el repositorio documenta semilla, pasos, lote global, hardware y hashes, lo que permite replicar exactamente la ejecucion sobre el mismo modelo base y comparar resultados frente al run `micro8`.
- Investigacion sobre precision en adaptadores LoRA: al conservar los tensores en FP32 procedentes de un entrenamiento BF16, sirve para estudiar el impacto del casteo a BF16 en inferencia y la degradacion asociada.
- Punto de partida para experimentos de ajuste adicional: al ser un adaptador PEFT de rango 8 y solo 0,3 GB, se puede cargar y continuar el entrenamiento en entornos con recursos limitados frente a un ajuste completo del modelo de 6B.
- Comparacion controlada de configuraciones de lote: la etiqueta `micro16` frente al run `micro8` permite estudiar si el tamano de micro-batch afecta al comportamiento final del adaptador, manteniendo el resto de hiperparametros aparentemente constantes.
- Auditoria de integridad de artefactos de entrenamiento: la presencia de `SHA256SUMS` y de hashes de origen y exportacion permite verificar la cadena de custodia del adaptador antes de usarlo en un pipeline de investigacion.
- Evaluacion interna en laboratorio roboticos: el adaptador puede cargarse sobre el modelo base para pruebas de manipulacion en simulador o banco de pruebas fisico, siempre que el equipo aporte su propia evaluacion de exito en tareas, ya que el autor no incluye ninguna.
- Docencia y formacion en PEFT: es un ejemplo real de estructura de `adapter_config.json`, nomenclatura de tensores y exportacion sin el segmento `.default`, util para explicar como funciona el empaquetado de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se incluyen resultados de evaluacion de exito en tareas y que los diagnosticos de entrenamiento por si solos no establecen el rendimiento en inferencia.

## Requisitos de hardware

- VRAM para el adaptador: 0,3 GB en disco en FP32; en memoria, los 8.494 tensores ocupan una fraccion muy reducida frente al modelo base.
- VRAM para el modelo base: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo de aproximadamente 6B en BF16 requiere en torno a 12 GB solo para pesos, a lo que hay que sumar el codificador visual y la cabeza de accion propias de un VLA; esta cifra es una estimacion general y no procede de la informacion proporcionada.
- GPU utilizadas en el entrenamiento: 4 x A100. No se especifica si son de 40 GB u 80 GB.
- GPU recomendadas para inferencia: no disponible. El tamano del modelo base sugiere que un A100 o H100 serian adecuados, pero no hay datos confirmados.
- Viabilidad en GPU de consumo: no disponible. Con 6B de parametros, una RTX 4090 de 24 GB podria albergar el modelo base en BF16 en teoria, pero la memoria adicional del pipeline VLA y la ausencia de datos de cuantizacion impiden confirmarlo.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT, el flujo natural es cargarlo con la libreria `peft` sobre el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `poipoipoi233/lingbot-vla-v2-6b-lora-r8-bf16-v1.1-s7-step10000-micro16` (este) | Adaptador LoRA r8 sobre base de ~6B | no disponible | safetensors (PEFT) | no disponible | Run micro16, adaptador FP32 de entrenamiento BF16, 10.000 pasos, semilla 7 |
| `JMG-NTU123/lingbot-vla-v2-6b-lora-r8-fp32-v1.1-s7-step10000` | Adaptador LoRA r8 sobre base de ~6B | no disponible | safetensors (PEFT) | no disponible | Run micro8 segun la model card del repositorio analizado; pesos distintos e incompatibles |
| `robbyant/lingbot-vla-v2-6b` (modelo base) | ~6B | no disponible | safetensors | no disponible en la informacion proporcionada | Modelo fundacional VLA; requerido para usar cualquiera de los adaptadores anteriores |
| Otros modelos VLA de ~6-7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion fiable |

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable de forma autonoma: requiere el modelo base `robbyant/lingbot-vla-v2-6b` en la revision `11c703bf6a5c1f45b3b69168482da11fdbba53d7`, su preprocesado, su tokenizador y la construccion LingBot VLA v2 del proyecto, incluida la conversion eager de expertos.
- No es un modelo fusionado ni un checkpoint de reanudacion de entrenamiento; es unicamente el adaptador exportado.
- No se incluyen resultados de evaluacion de exito en tareas. El rendimiento en inferencia es, por tanto, desconocido y no puede inferirse de los diagnosticos de entrenamiento.
- Los pesos del adaptador no son intercambiables con los del run `micro8` publicado por otro usuario, pese a compartir nombre de protocolo, rango y numero de pasos.
- Licencia no disponible: no se puede confirmar la viabilidad de uso comercial ni las condiciones de redistribucion, ni del adaptador ni del modelo base.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; en un modelo VLA el fallo se manifiesta tipicamente como acciones incorrectas o no ejecutables, pero no hay datos al respecto.
- Limitaciones de contexto o idioma: no disponible. No se especifica la longitud de contexto ni los idiomas soportados.
- Cero descargas y cero likes en el momento de la consulta: no existe evidencia comunitaria de validacion.
- El adaptador esta almacenado en FP32; convertirlo a BF16 para inferencia es una operacion permitida por el cargador, pero introduce un cambio numerico no evaluado por el autor.
- Para produccion robotica seria imprescindible validar el adaptador en el banco de pruebas fisico correspondiente antes de cualquier despliegue.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/poipoipoi233/lingbot-vla-v2-6b-lora-r8-bf16-v1.1-s7-step10000-micro16
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Revision del modelo base en PR: https://huggingface.co/robbyant/lingbot-vla-v2-6b/tree/refs%2Fpr%2F1
- Modelo base en ModelScope: https://www.modelscope.cn/models/Robbyant/lingbot-vla-v2-6b
- Repositorio GitHub LingBot-VLA (v1): https://github.com/Robbyant/lingbot-vla
- Repositorio GitHub LingBot-VLA v2: https://github.com/Robbyant/lingbot-vla-v2
- Run alternativo micro8: https://huggingface.co/JMG-NTU123/lingbot-vla-v2-6b-lora-r8-fp32-v1.1-s7-step10000
- Referencia arXiv asociada a los metadatos del modelo base: arxiv:2508.02317 (el identificador aparece en las etiquetas del repositorio del modelo base; no se ha verificado el contenido del articulo)
