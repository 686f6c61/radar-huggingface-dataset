# fesvhtr/phygenhand-goal-force-hot3d-controlnet

## Resumen

`phygenhand-goal-force-hot3d-controlnet` es un adaptador ControlNet de 10 capas publicado por el usuario `fesvhtr` para el modelo de generación de vídeo a partir de imagen Wan-AI/Wan2.2-I2V-A14B. Su función es añadir condicionamiento espacial adicional a la generación de vídeo, en este caso sobre escenas de interacción mano-objeto (hand-object interaction) derivadas del conjunto de datos HOT3D. El modelo parte de un checkpoint previo, `brown-palm/goal-force`, descrito en la model card como "official step-3000", y se ha afinado durante 300 pasos adicionales.

Se trata de un artefacto de investigación, no de un modelo autónomo: por sí solo no genera vídeo, sino que actúa como rama de control sobre el modelo base Wan2.2-I2V-A14B. El entrenamiento se realizó con 100 vídeos de HOT3D a resolución 832×480 y 81 fotogramas, usando 2 GPU H200 en BF16 con ZeRO-3 y gradient checkpointing. El resultado se publica como un único fichero safetensors de 7,03 GiB dentro de un repositorio de 7,6 GB.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de adaptación ControlNet a un modelo de imagen-a-vídeo de última generación con licencia abierta, y como punto de partida para quienes quieran reproducir el pipeline de entrenamiento o aplicar condicionamiento estructural sobre Wan2.2 en dominios de manipulación de objetos. No hay métricas publicadas, licencia declarada ni idiomas especificados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet de 10 capas sobre modelo base de generación de vídeo (Wan2.2-I2V-A14B) |
| Parametros totales | no disponible (peso publicado: 7,03 GiB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vídeo: 81 fotogramas por clip en el entrenamiento) |
| Tipos de cuantizacion | no disponible (peso distribuido como safetensors; probablemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`releases/v1.0.0/step-300.safetensors`) |

## Arquitectura y entrenamiento

El componente es un ControlNet de 10 capas acoplado a un modelo de difusión para imagen-a-vídeo. La model card indica que se inicializa desde el checkpoint `brown-palm/goal-force` (referido como "official step-3000") y que se afina durante 300 pasos con batch efectivo de 4, optimizador AdamW y tasa de aprendizaje 1e-5 con semilla 42. No se especifica la dimensión de las capas, el tipo de señal de control (pose, profundidad, máscara de manos, flujo, etc.) ni el mecanismo exacto de inyección sobre el transformer del modelo base.

Los datos de entrenamiento son 100 clips del dataset HOT3D, con 81 fotogramas por clip y resolución 832×480. HOT3D es un conjunto centrado en interacción mano-objeto, por lo que cabe inferir que el ControlNet condiciona la generación sobre la geometría de manos y objetos, aunque la model card no detalla la composición exacta de las anotaciones usadas. La infraestructura de entrenamiento fueron 2 GPU NVIDIA H200 en BF16, con paralelismo ZeRO-3 y gradient checkpointing activado. No se menciona uso de RLHF, DPO ni ninguna otra fase de alineamiento.

## Capacidades

- Generación de vídeo condicionada desde imagen con control estructural adicional (ControlNet).
- Condicionamiento específico para escenas de interacción mano-objeto, derivado del dataset HOT3D.
- Compatible con el pipeline image-to-video del modelo base Wan2.2-I2V-A14B.
- Generación de clips de 81 fotogramas a resolución 832×480 según la configuración de entrenamiento.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingües (el adaptador no procesa lenguaje de forma independiente).
- No se documentan modos de razonamiento extendido (thinking), audio ni visión general más allá del condicionamiento de vídeo.

## Casos de uso

- Investigación en interacción mano-objeto: reproducción y variación de secuencias de manipulación a partir de un fotograma inicial y una señal de control estructural, útil para aumentar datos en robótica o captura de movimiento.
- Generación de datos sintéticos para entrenamiento de modelos de mano: se pueden producir clips controlados de manos interactuando con objetos para preentrenar detectores de keypoints o estimadores de pose.
- Prototipado en robótica de manipulación: simular trayectorias visuales de manos y objetos antes de trasladarlas a un entorno físico, aprovechando el condicionamiento sobre HOT3D.
- Evaluación de adaptadores ControlNet sobre modelos de vídeo: sirve como referencia reproducible (300 pasos, LR 1e-5, seed 42) para estudiar cómo se comporta el condicionamiento sobre Wan2.2.
- Realidad aumentada y avatares: generar vídeo con manos en posiciones controladas para insertar contenido sobre tomas reales.
- Reproducción de experimentos: al publicarse pesos y receta de entrenamiento, permite replicar el ajuste sobre el mismo dataset y comparar variantes de número de capas o pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas cuantitativas (FVD, PSNR, SSIM, precisión de condicionamiento, etc.) ni comparaciones con otros adaptadores ControlNet para vídeo.

## Requisitos de hardware

- Peso del adaptador: 7,03 GiB en safetensors; el repositorio completo ocupa 7,6 GB.
- Para inferencia hay que sumar el coste del modelo base Wan-AI/Wan2.2-I2V-A14B, que no está incluido en este repositorio.
- Entrenamiento documentado: 2×NVIDIA H200, BF16, ZeRO-3, gradient checkpointing. Esto sitúa el pico de memoria de entrenamiento en el rango de varios cientos de GiB agregados, no apto para GPU de consumo.
- GPU recomendadas para entrenamiento o ajuste: H200, H100, A100 80 GB en configuraciones multi-GPU.
- Viabilidad en GPU de consumo: no documentada. Un adaptador de 7 GiB en FP16 requiere al menos 7-8 GB solo para sus pesos, además de la memoria del modelo base; no cabe con holgura en GPUs de 8-12 GB.
- Opciones de despliegue: no especificadas. Al ser un peso safetensors para un modelo de difusión de vídeo, el despliegue típico sería mediante el pipeline de Diffusers del modelo base Wan2.2 más el cargador de ControlNet, no mediante llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / fotogramas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phygenhand-goal-force-hot3d-controlnet | ControlNet vídeo | Wan2.2-I2V-A14B | 81 fotogramas, 832×480 | no disponible | HuggingFace |
| stabilityai/stable-diffusion-3.5-controlnets | ControlNet imagen | SD 3.5 | imagen fija | Stability Community | HuggingFace |
| lllyasviel/ControlNet | ControlNet imagen | Stable Diffusion 1.5 | imagen fija | Apache 2.0 (según repositorio original) | HuggingFace |

No se dispone de información sobre otros adaptadores ControlNet específicos para modelos de imagen-a-vídeo comparables en la documentación proporcionada; la comparativa se limita a ControlNets de imagen, que operan en un dominio distinto.

## Limitaciones y advertencias

- Licencia no declarada: no queda claro si se permite uso comercial. Es un riesgo directo para producción y debe aclararse con el autor antes de cualquier despliegue.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad, fidelidad al condicionamiento ni estabilidad temporal del vídeo generado.
- Dataset muy reducido: 100 vídeos de un único dominio (HOT3D, interacción mano-objeto) limitan la generalización a otras escenas, objetos o entornos.
- Entrenamiento corto: 300 pasos con batch efectivo 4 implican un ajuste muy ligero; el adaptador puede heredar sesgos o artefactos del checkpoint `goal-force` del que parte.
- Dependencia estricta del modelo base: solo es utilizable con Wan-AI/Wan2.2-I2V-A14B (y presumiblemente con `brown-palm/goal-force`); no es un modelo autónomo.
- Riesgo de alucinación visual: como todo modelo de difusión de vídeo, puede generar anatomía inconsistente (manos, objetos) o incoherencias temporales entre fotogramas.
- Idiomas no especificados: aunque el condicionamiento principal es visual, cualquier prompt textual dependerá del multilingüismo del modelo base, no documentado aquí.
- Documentación mínima: se desconoce el tipo de señal de control, la composición exacta de los datos y el procedimiento de evaluación, lo que dificulta la reproducibilidad completa.
- Fechas de publicación futuras (2026) respecto al contexto habitual de estos modelos: conviene verificar la vigencia y el estado del repositorio.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/fesvhtr/phygenhand-goal-force-hot3d-controlnet
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo del que parte el ajuste: https://huggingface.co/brown-palm/goal-force
- Dataset HOT3D: https://huggingface.co/datasets/bop-benchmark/hot3d
- Stability AI SD 3.5 ControlNets (referencia de ControlNet en imagen): https://huggingface.co/stabilityai/stable-diffusion-3.5-controlnets
- ControlNet original: https://huggingface.co/lllyasviel/ControlNet
- Artículo sobre ControlNet (referencia general): https://ai.miraheze.org/wiki/ControlNet
