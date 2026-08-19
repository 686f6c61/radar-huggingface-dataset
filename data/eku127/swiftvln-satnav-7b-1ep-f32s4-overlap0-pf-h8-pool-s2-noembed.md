# Eku127/swiftvln-satnav-7b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed

## Resumen

SwiftVLN SatNav 7B es un modelo de navegación visual-lenguaje (VLN) desarrollado por Eku127 (Jiajun Jiang), investigador del HKUST (GZ), que adapta el backbone multimodal Qwen2.5-VL-7B-Instruct al benchmark SatNav, un entorno de navegación continua sobre imágenes satelitales. El modelo recibe una secuencia de hasta 32 fotogramas RGB de observación y predice cuatro acciones de navegación, empleando un diseño de memoria por fotograma con promedio y stride 2 para incorporar hasta ocho fotogramas de historia. Está pensado exclusivamente para evaluación en el entorno SatSim de SwiftVLN, no como asistente conversacional general.

La relevancia de este checkpoint radica en que demuestra la viabilidad de aplicar un modelo de visión-lenguaje de 7B a tareas de navegación encarnada con entrada satelital, logrando una tasa de éxito del 70,99 % en el split `val_seen` y del 57,65 % en `val_unseen` con un límite de 500 pasos. El entrenamiento se realizó con fine-tuning completo durante una época sobre trayectorias expertas de SatNav-v0.1, con una tasa de aprendizaje de 2e-5. El modelo se distribuye en formato safetensors y está pensado para ser usado con el código de evaluación de SwiftVLN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B (transformer multimodal, vision-language) |
| Parametros totales | 7B (aproximadamente, basado en Qwen2.5-VL-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 fotogramas RGB + hasta 8 fotogramas de historia (memoria) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen2.5-VL-7B-Instruct`, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. Sobre esta base, SwiftVLN introduce un diseño de memoria por fotograma: cada observación se procesa con average pooling de stride 2, y se mantienen hasta ocho fotogramas de historia para dar contexto temporal. La ventana de entrada es de 32 fotogramas y el modelo predice cuatro acciones por paso. El entrenamiento consistió en fine-tuning completo (todos los parámetros) durante una época sobre trayectorias expertas del dataset SatNav-v0.1, con una tasa de aprendizaje de 2e-5. No se aplicó refuerzo ni DPO; el aprendizaje es puramente supervisado por imitación de las trayectorias.

## Capacidades

- Navegación visual-lenguaje en entornos de imágenes satelitales: recibe instrucciones en lenguaje natural y observaciones visuales (fotogramas RGB) para decidir acciones de movimiento.
- Procesamiento de secuencias de fotogramas con memoria temporal: integra hasta 8 fotogramas de historia mediante pooling para mantener coherencia en la navegación.
- Predicción de acciones múltiples: genera 4 acciones por paso, lo que permite planificación a corto plazo.
- Evaluación en el entorno SatSim: diseñado para ser usado con el pipeline de evaluación de SwiftVLN, que incluye splits `val_seen` y `val_unseen`.
- No es un chatbot general ni un modelo de VQA: su uso está restringido al formato de prompt y construcción de observaciones de SwiftVLN.

## Casos de uso

- Investigación en navegación encarnada con imágenes satelitales: el modelo sirve como referencia para comparar arquitecturas de memoria y estrategias de entrenamiento en el benchmark SatNav.
- Simulación de navegación autónoma en entornos urbanos o rurales: puede evaluarse en SatSim para medir métricas como éxito (SR) y progreso ponderado (SPL) en escenarios no vistos.
- Desarrollo de agentes robóticos con entrada satelital: aunque no está pensado para despliegue en hardware real, sus predicciones pueden integrarse en pipelines de planificación de movimiento.
- Benchmarking de modelos VLN: permite comparar el rendimiento de Qwen2.5-VL de 7B frente a otras arquitecturas (por ejemplo, la versión 3B del mismo autor) en tareas de navegación.
- Estudio de memoria a largo plazo en VLN: el diseño de memoria por fotograma con pooling puede analizarse para entender cómo afecta la historia a la toma de decisiones.
- Generación de trayectorias sintéticas: el modelo puede usarse para producir rutas de navegación que luego sirvan como datos de entrenamiento para otros agentes.

## Benchmarks y rendimiento

Resultados evaluados en SatSim con límite de 500 pasos, según la model card:

| Split | Episodios | NE (error de navegación) | OS (éxito orientado) | SR (tasa de éxito) | SPL (progreso ponderado) |
| --- | ---: | ---: | ---: | ---: | ---: |
| `val_seen` | 4.574 | 34,34 | 80,48 | 70,99 | 70,51 |
| `val_unseen` | 8.756 | 63,77 | 69,31 | 57,65 | 57,09 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación.
- Al tratarse de un modelo de 7B en FP16, se estima un consumo de VRAM de aproximadamente 14-16 GB para inferencia sin cuantización.
- Con cuantización (por ejemplo, 4 bits) podría ejecutarse en GPUs consumer como RTX 3090 o RTX 4090, aunque no se proporcionan configuraciones oficiales.
- El despliegue requiere el entorno SwiftVLN (scripts de evaluación) y el entorno SatNav; no es compatible con vLLM, Ollama o TGI de forma directa, ya que el formato de entrada es específico.
- Para evaluar en SatSim se recomienda una GPU con al menos 16 GB de VRAM, aunque el autor no indica latencia ni throughput.

## Comparativa con modelos similares

Existe una versión de 3B del mismo autor (`Eku127/swiftvln-satnav-3b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed`) con la misma arquitectura de memoria pero menor tamaño. No se dispone de resultados comparativos publicados entre ambas versiones. Otras alternativas en VLN satelital no están documentadas en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- |
| swiftvln-satnav-7b (este) | 7B | 32 frames + 8 historia | no disponible | HuggingFace |
| swiftvln-satnav-3b | 3B | 32 frames + 8 historia | no disponible | HuggingFace |

## Limitaciones y advertencias

- No es un modelo de propósito general: no debe usarse para chat, VQA, robótica real o navegación autónoma en el mundo físico.
- Requiere el formato de prompt y la construcción de observaciones específicos de SwiftVLN; cualquier otro uso producirá resultados incorrectos.
- El entrenamiento se realizó solo con trayectorias expertas de SatNav-v0.1, por lo que puede no generalizar a otros entornos o distribuciones de imágenes.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o modificación.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de navegación, los errores de predicción pueden llevar a trayectorias inválidas en el entorno.
- El rendimiento en `val_unseen` es notablemente inferior al de `val_seen`, lo que indica limitaciones de generalización a escenarios no vistos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eku127/swiftvln-satnav-7b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed
- Repositorio SwiftVLN (código de entrenamiento y evaluación): https://github.com/Eku127/SwiftVLN
- Repositorio SatNav (entornos, datasets y herramientas de evaluación): https://github.com/Eku127/SatNav
- Versión 3B del mismo modelo: https://huggingface.co/Eku127/swiftvln-satnav-3b-1ep-f32s4-overlap0-pf-h8-pool-s2-noembed
- Perfil del autor en HuggingFace: https://huggingface.co/Eku127/models
