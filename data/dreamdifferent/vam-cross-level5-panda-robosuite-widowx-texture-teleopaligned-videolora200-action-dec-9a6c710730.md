# dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-9a6c710730

## Resumen

Este repositorio contiene un checkpoint del decoder World2Action del sistema VAM-Cross, un modelo de robótica que convierte secuencias de video en comandos de acción para un brazo robótico. El modelo fue desarrollado por el usuario `dreamdifferent` y se enmarca dentro del pipeline de robótica de HuggingFace. Concretamente, se trata del decoder entrenado en la iteración 1800 de un run de entrenamiento que se detuvo por causas desconocidas, pero que fue verificado como el conjunto de pesos más completo disponible.

El modelo está diseñado para trabajar con un backbone Video2World congelado y un Video LoRA congelado, ambos proporcionados por el mismo autor. Su función es predecir 15 acciones del efector final (posición y rotación) a 5 Hz, a partir de observaciones de dos cámaras (esquina y frontal) en un entorno de simulación robótica basado en robosuite. El tamaño del repositorio es de 1.0 GB, lo que sugiere un modelo de dimensiones moderadas, aunque no se especifican los parámetros totales.

La relevancia de este modelo radica en su enfoque de aprendizaje por imitación para control robótico, utilizando una arquitectura de video a acción que puede ser útil para investigación en manipulación robótica, teleoperación y generación de políticas a partir de demostraciones. Sin embargo, al ser un checkpoint intermedio de un sistema más amplio, su uso requiere integrarlo con los componentes congelados mencionados en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder World2Action (parte del sistema VAM-Cross, basado en MimicVideo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (trabaja con secuencias de video, sin especificar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o binarios, no especificado) |

## Arquitectura y entrenamiento

El modelo es un decoder de acciones que forma parte del sistema VAM-Cross, el cual sigue el paradigma de MimicVideo. La arquitectura completa incluye un backbone Video2World (inicializado desde `dreamdifferent/widowx250-video-fused`), un action decoder (inicializado desde `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder`) y un Video LoRA congelado (desde `dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-200`). El checkpoint aquí publicado corresponde únicamente al decoder World2Action, que se entrena sobre las representaciones de video generadas por el backbone y el LoRA.

El entrenamiento se realizó sobre un dataset de 166 episodios con 54 264 frames, capturados con dos cámaras (`corner_cam` y `front_cam`). El objetivo es predecir 15 acciones del efector final (posición y rotación) a 5 Hz, con la pose expresada de forma relativa a la pose actual lograda, en el marco de referencia `widowx_reference_base/teleop_aligned_tool`, y con rotación en formato `rotation_6d`. No se especifican detalles sobre el número de tokens de entrenamiento, el uso de RLHF o DPO, ni otras innovaciones técnicas más allá de la integración de video y acción.

## Capacidades

- Predicción de acciones robóticas: genera 15 comandos de efector final (posición y rotación) a partir de observaciones de video de dos cámaras.
- Integración con sistemas de video a acción: funciona como decoder dentro de un pipeline más amplio que incluye un backbone de video congelado y un LoRA de video congelado.
- Soporte de múltiples cámaras: utiliza dos vistas (esquina y frontal) para la entrada visual.
- Formato de salida específico: acciones relativas a la pose actual, con rotación en 6D, adecuado para control de robots en entornos simulados como robosuite.
- No se han documentado capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de control robótico.

## Casos de uso

- Aprendizaje por imitación en simulación: el modelo puede utilizarse para clonar comportamientos de teleoperación en entornos robosuite, generando políticas de control a partir de demostraciones grabadas.
- Investigación en manipulación robótica: permite estudiar la transferencia de representaciones visuales a comandos de acción, especialmente en tareas con el brazo Panda o WidowX.
- Desarrollo de sistemas de teleoperación asistida: al predecir acciones relativas, puede integrarse en interfaces de control que requieran correcciones en tiempo real.
- Generación de datos sintéticos para entrenamiento: el decoder puede emplearse para etiquetar automáticamente secuencias de video con acciones, ampliando datasets de entrenamiento.
- Benchmarking de arquitecturas video-condicionadas: sirve como punto de referencia para comparar decoders de acción en el contexto de VAM-Cross.
- Prototipado de controladores basados en visión: en entornos de investigación, puede probarse como componente de un sistema de control visual directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, dado que se trata de un modelo de robótica y no de lenguaje o razonamiento general.

## Requisitos de hardware

- Tamaño del repositorio: 1.0 GB, lo que sugiere que el checkpoint puede cargarse en GPUs con al menos 2-4 GB de VRAM, aunque no se especifica el número de parámetros.
- No se proporcionan requisitos de VRAM estimados, GPUs recomendadas ni opciones de despliegue.
- Dado que el modelo requiere un backbone Video2World y un Video LoRA congelados, el hardware necesario dependerá de esos componentes adicionales, que no están incluidos en este repositorio.
- No se indican opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (decoders de acción para robótica basados en video). El autor ha publicado otros checkpoints similares (por ejemplo, `vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-059ae97cbb`), pero no se han documentado diferencias de rendimiento entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: es un punto de control de un entrenamiento que se detuvo por causas desconocidas; no se garantiza que sea el modelo final óptimo.
- Dependencia de componentes externos: requiere el backbone Video2World, el action decoder inicial y el Video LoRA congelado, que no están incluidos en este repositorio y deben obtenerse por separado.
- Licencia no disponible: no se especifican términos de uso, lo que impide conocer restricciones para uso comercial o académico.
- Sin documentación de sesgos o alucinaciones: al ser un modelo de control robótico, no aplican los riesgos típicos de modelos de lenguaje, pero sí puede presentar errores de predicción de acciones en entornos no vistos.
- Limitado a entornos simulados: el entrenamiento se realizó en robosuite con texturas específicas; el rendimiento en el mundo real o en otros simuladores no está garantizado.
- Sin soporte de idiomas ni interacción textual: es un modelo puramente visual-motor, no apto para tareas de lenguaje.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-9a6c710730
- Checkpoint similar (level4): https://huggingface.co/dreamdifferent/vam-cross-level4-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-059ae97cbb
- robosuite (simulador utilizado): https://github.com/ARISE-Initiative/robosuite
- Sitio oficial de robosuite: https://robosuite.ai/
