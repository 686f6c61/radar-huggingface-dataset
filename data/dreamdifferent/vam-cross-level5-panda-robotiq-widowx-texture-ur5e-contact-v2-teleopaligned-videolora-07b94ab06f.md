# dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-07b94ab06f

# Ficha de modelo: VAM-Cross MimicVideo World2Action decoder (dreamdifferent)

## Resumen

Este checkpoint es un decodificador World2Action de la familia VAM-Cross, publicada por el usuario `dreamdifferent`. Se trata de un modelo de robótica especializado en transformar observaciones de vídeo de un brazo robótico en comandos de control a baja frecuencia. No es un modelo de lenguaje: su entrada son imágenes de dos cámaras y su salida es un vector de 15 dimensiones con la pose del efector final y la pinza a 5 Hz.

El modelo se desarrolla dentro del framework MimicVideo, aprovechando un backbone Video2World preentrenado y un Video LoRA congelado. Los datos de entrenamiento proceden del dataset `vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2`, compuesto por 165 episodios y 54.343 frames grabados con dos cámaras. El checkpoint corresponde a la iteración 900 de un run que se detuvo por una causa desconocida, según la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder de acciones World2Action sobre backbone Video2World (VAM-Cross / MimicVideo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (contexto de vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión-acción) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Añadidos extra:

| Parametro adicional | Valor |
|---|---|
| Dataset de entrenamiento | `vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2` (165 episodios, 54.343 frames) |
| Cámaras de entrada | `observation.images.corner_cam`, `observation.images.front_cam` |
| Objetivo de acción | 15 dimensiones de pose de efector final y pinza a 5 Hz, rotación 6D, pose relativa a `widowx_reference_base/teleop_aligned_tool` |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de VAM-Cross: un modelo de vídeo a acción (World2Action) que toma características latentes de un backbone de vídeo congelado y predice comandos de control. El backbone inicial es `dreamdifferent/widowx250-video-fused@f0cea76b62c5dd66b06b9f965932ddea32a7b546`, sobre el que se aplica un Video LoRA congelado (`vam-cross-level-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200@f9c1ad892127a6094adfccf8167845af19a77739`). El decoder de acciones parte de `vam-cross-target-widowx250-native-2cam-action-decoder@93750cccda01620e3c028477e4c49bc5c996a68d`.

El entrenamiento se realiza sobre el dataset `vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2`, con 165 episodios y 54.343 frames. Las observaciones incluyen dos cámaras (`corner_cam` y `front_cam`). El objetivo son 15 acciones de pose alcanzada del efector final y pinza a 5 Hz, usando una representación de rotación 6D y un sistema de coordenadas `widowx_reference_base/teleop_aligned_tool`. La model card no detalla el número de tokens de entrenamiento ni la composición del dataset, y no menciona RLHF ni DPO.

## Capacidades

- Predicción de acciones robóticas: genera comandos de pose de efector final y pinza a 5 Hz a partir de vídeo de dos cámaras.
- Integración con el framework MimicVideo / VAM-Cross: utiliza entradas congeladas (backbone Video2World y Video LoRA) y un decoder propio.
- Aprendizaje por imitación de teleoperación: el entrenamiento usa grabaciones de teleoperación alineadas (`teleop_aligned`) del brazo WidowX, lo que permite transferir trayectorias humanas al robot.
- Soporte de representación de rotación 6D y poses relativas: la salida es una pose relativa al estado actual, expresada en el marco de referencia del robot, lo que facilita la estabilidad del control.
- No es un modelo de lenguaje: no dispone de tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Control de un brazo WidowX en entorno simulado o real: el decoder puede usarse como política de bajo nivel para tareas de agarre, siempre que se suministren las imágenes de las dos cámaras y el estado del robot.
- Investigación en aprendizaje por imitación: gracias a su dataset de teleoperación alineada, sirve para estudiar cómo los modelos de vídeo aprenden de demostraciones humanas y para comparar decoders de acciones.
- Recogida de datos de contacto y textura: el nombre del run indica variaciones de textura y contacto, lo que lo hace útil para evaluar la robustez de políticas frente a entornos con diferentes apariencias.
- Transferencia sim-to-real: al estar alineado con el sistema WidowX, se puede utilizar en benchmarks de simulación (por ejemplo, con Robosuite, que aparece en otro checkpoint del autor) para evaluar el salto a lo real.
- Benchmark de decoders World2Action: investigadores del campo pueden usar este checkpoint como referencia para comparar arquitecturas de predicción de acciones en el framework MimicVideo.
- Reproducción de experimentos de VLA (modelos de visión-lenguaje-acción): el modelo sirve como componente de acción para pipelines que utilizan un backbone de vídeo congelado, como en el caso de ReBot.
- Evaluación de políticas multi-cámara: la arquitectura utiliza dos cámaras (`corner_cam` y `front_cam`), por lo que se puede usar para estudiar fusión de vistas en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se puede determinar con los datos proporcionados. El repositorio pesa aproximadamente 1.0 GB, pero el backbone Video2World y el Video LoRA necesarios no se incluyen y su tamaño se desconoce.
- Opciones de despliegue: no se especifican. Por su naturaleza es probable que se ejecute en Python con PyTorch, pero la model card no lo confirma.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

En la categoría de modelos de visión-acción para robótica existen alternativas como OpenVLA, Octo o ReBot. La información proporcionada no incluye parámetros, rendimiento ni licencia de estos modelos para una comparativa rigurosa. La siguiente tabla indica la relación de este checkpoint con esos enfoques:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | Decoder World2Action sobre backbone de vídeo | no disponible | no disponible | no disponible | HuggingFace |
| OpenVLA | VLA (modelo de lenguaje y visión) | no disponible | no disponible | no disponible | HuggingFace |
| ReBot | VLA con aumento de vídeo sintético | no disponible | no disponible | no disponible | Paper (arXiv) |
| Octo | VLA | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos en la información proporcionada.
- Riesgo de alucinación: al ser un modelo que predice trayectorias de control, el equivalente sería generar comandos de movimiento no coherentes con el vídeo. No hay datos sobre este riesgo.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje; su contexto es un conjunto fijo de frames de vídeo de dos cámaras. El dataset es pequeño (165 episodios), lo que limita su generalización a nuevos objetos o entornos.
- Restricciones de licencia: la licencia no está especificada, por lo que su uso comercial está legalmente indeterminado o restringido.
- Caveats para producción: no se han publicado benchmarks ni evaluaciones de seguridad; el checkpoint es un artefacto de investigación de un run que se detuvo por `unknown`. No se recomienda su uso en sistemas de control sin validación exhaustiva.
- Dependencia de entradas congeladas: el codificador requiere versiones exactas del backbone, Video LoRA y decoder inicial para funcionar; una desviación en los pesos congelados puede producir resultados incorrectos.

## Enlaces

- Repositorio principal del modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-teleopaligned-videolora-07b94ab06f
- Video LoRA iter400 (cercano al checkpoint): https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400
- Action decoder en Robosuite (otro checkpoint del autor): https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-c8fb3c68cd
- Paper ReBot: https://arxiv.org/html/2503.14526v1
