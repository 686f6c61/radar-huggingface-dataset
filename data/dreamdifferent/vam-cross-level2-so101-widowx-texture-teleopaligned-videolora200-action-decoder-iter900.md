# dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900

## Resumen

Este repositorio contiene un checkpoint del decoder World2Action del sistema VAM-Cross de MimicVideo, desarrollado por el usuario dreamdifferent. Se trata de un componente de un pipeline de robótica que convierte observaciones de video (dos cámaras) en acciones de control para un brazo robótico WidowX 250. Concretamente, es la iteración 900 de un entrenamiento que se detuvo por causas desconocidas, y se ha subido el checkpoint verificado más reciente del decoder.

El modelo forma parte de una arquitectura más amplia que incluye un backbone Video2World congelado, un Video LoRA congelado y un decoder de acción inicial. Su función es predecir 15 acciones de efector final y pinza a 5 Hz, utilizando una representación de pose relativa y rotación en formato 6D. Es relevante para la comunidad de robótica y aprendizaje por imitación, ya que permite explorar la generación de acciones a partir de video en tareas de manipulación, aunque se trata de un checkpoint intermedio sin licencia especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder World2Action (parte del sistema VAM-Cross de MimicVideo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision-accion, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 1.0 GB, probablemente safetensors o binarios) |

## Arquitectura y entrenamiento

El checkpoint corresponde al decoder de acción de un sistema mayor denominado VAM-Cross, basado en MimicVideo. La arquitectura completa incluye un backbone Video2World (inicializado desde `dreamdifferent/widowx250-video-fused`), un Video LoRA congelado (`vam-cross-level2-so101-widowx-texture-video-lora-iter-200`) y un decoder de acción inicial (`vam-cross-target-widowx250-native-2cam-action-decoder`). El decoder aquí publicado se entrena sobre las salidas de estos componentes congelados.

El entrenamiento se realizó sobre un dataset de teleoperación con 298 episodios y 54 354 frames, utilizando dos cámaras (`corner_cam` y `front_cam`). El objetivo es predecir 15 acciones de efector final y pinza a 5 Hz, con poses relativas al frame actual en el sistema de referencia `widowx_reference_base/teleop_aligned_tool`, y rotación codificada como `rotation_6d`. No se especifican detalles sobre el número de tokens de entrenamiento, el uso de RLHF/DPO ni otras innovaciones técnicas.

## Capacidades

- Predicción de acciones de robot: genera 15 valores de acción (posición del efector final y apertura de pinza) a 5 Hz.
- Entrada multimodal: procesa observaciones de dos cámaras simultáneamente (esquina y frontal).
- Representación de pose relativa: las acciones se expresan relativas a la pose actual, lo que facilita el control en bucle cerrado.
- Rotación en formato 6D: salida de orientación continua, adecuada para control robótico.
- Integración con sistema VAM-Cross: diseñado para funcionar con el backbone Video2World y el Video LoRA congelados.

## Casos de uso

- Aprendizaje por imitación en robótica: el modelo puede utilizarse para clonar comportamientos de teleoperación en tareas de manipulación con el brazo WidowX 250, convirtiendo secuencias de video en comandos de acción.
- Control visual de efector final: dado un flujo de video de dos cámaras, el decoder predice las acciones necesarias para alcanzar un objetivo, útil en entornos de investigación.
- Desarrollo de políticas de manipulación: como componente de un sistema más grande, permite experimentar con la generación de acciones a partir de representaciones visuales latentes.
- Evaluación de checkpoints intermedios: al ser una iteración 900, puede usarse para estudiar la dinámica de entrenamiento y comparar con iteraciones posteriores (level4, level5).
- Investigación en arquitecturas de video-accion: sirve como referencia para entender cómo se acoplan decodificadores de acción a backbones de video congelados.
- Pruebas de robustez en teleoperación: al trabajar con poses relativas y rotación 6D, es adecuado para validar controladores en escenarios con variaciones de iluminación o perspectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica (como tasa de éxito en tareas) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- El tamaño del repositorio es de 1.0 GB, lo que sugiere que el checkpoint puede cargarse en GPUs con al menos 8 GB de VRAM, aunque el sistema completo (con backbone y LoRA) requerirá más memoria.
- No se especifican GPUs recomendadas. Dado que es un decoder relativamente pequeño, podría ejecutarse en GPUs consumer como RTX 3060 o superiores, pero la inferencia completa del sistema VAM-Cross necesitaría al menos una GPU de 16-24 GB.
- Opciones de despliegue: no se mencionan frameworks específicos. Al ser parte de MimicVideo, probablemente se integre con PyTorch y pueda servirse con vLLM o TGI si se adapta, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros checkpoints del mismo autor para niveles superiores (level4, level5) con la misma estructura de nombres, pero no se proporcionan datos comparativos de rendimiento ni especificaciones. No se dispone de información sobre modelos alternativos de la misma categoría (decoders de acción para robótica) en fuentes abiertas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vam-cross-level2 (este) | no disponible | no disponible | no disponible | HuggingFace |
| vam-cross-level4 | no disponible | no disponible | no disponible | HuggingFace |
| vam-cross-level5 | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Checkpoint intermedio: es la iteración 900 de un entrenamiento que se detuvo por causas desconocidas; no es un modelo final y puede tener un rendimiento subóptimo.
- Dependencia de entradas congeladas: requiere el backbone Video2World, el decoder inicial y el Video LoRA específicos, cuyos commits están fijados. No funcionará de forma aislada.
- Licencia no especificada: no se indica si es de uso comercial o solo investigativo; se debe contactar al autor antes de usarlo en producción.
- Dataset limitado: solo 298 episodios, lo que puede provocar sobreajuste a las condiciones de teleoperación (iluminación, fondo, posición de cámaras).
- Sin soporte de lenguaje: no procesa texto ni instrucciones; es puramente visual-accion.
- Riesgo de alucinación en acciones: al ser un modelo generativo, puede predecir acciones no seguras si las observaciones difieren del dominio de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su eficacia en tareas reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level2-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Modelo level4 (similar): https://huggingface.co/dreamdifferent/vam-cross-level4-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Modelo level5 (similar): https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
