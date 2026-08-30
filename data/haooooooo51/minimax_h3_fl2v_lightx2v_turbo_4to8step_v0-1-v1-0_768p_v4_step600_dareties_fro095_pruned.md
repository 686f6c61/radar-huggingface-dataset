# HAOOOOOOO51/Minimax_h3_fl2v_lightx2v_turbo_4to8step_v0.1-v1.0_768p_v4_step600_dareties_fro095_pruned

## Resumen

Este repositorio contiene una versión experimental podada (pruned) del LoRA Turbo de SilverOxides para el modelo de generación de vídeo MiniMax-H3, adaptada para su uso en ComfyUI. El LoRA original, desarrollado por lightx2v y destilado por ModelTC, reduce el número de pasos de inferencia necesarios para generar vídeo de 30-50 a 4-8, acelerando significativamente el flujo de trabajo. La versión que nos ocupa, subida por el usuario HAOOOOOOO51, elimina los módulos AdaLN del adaptador, lo que reduce el tamaño del archivo (0,9 GB) pero rompe la equivalencia matemática con el LoRA original.

El modelo base MiniMax-H3 es un generador de vídeo de MiniMax, aunque no se dispone de detalles públicos sobre su arquitectura interna. Este LoRA se integra en ComfyUI mediante nodos específicos y está pensado para flujos de trabajo de generación de vídeo a alta resolución (768p). Al tratarse de una versión experimental, su uso en producción requiere validación previa, y el autor advierte que los resultados pueden variar entre flujos de trabajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) para MiniMax-H3 |
| Parametros totales | no disponible (el repo ocupa 0,9 GB en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generación de vídeo, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (generación de vídeo, no lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferido del archivo en el repo de Kijai) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre el modelo base MiniMax-H3, un generador de vídeo de MiniMax del que no se han publicado detalles arquitectónicos completos. El adaptador original fue destilado a partir de MiniMax-H3 mediante el proceso "lightx2v", que reduce la cantidad de pasos de inferencia (NFE) de 30-50 a 4-8 manteniendo una calidad aceptable. El LoRA de este repo es una versión podada del original: se eliminaron los módulos AdaLN (Adaptive Layer Normalization), lo que reduce el tamaño del archivo pero introduce diferencias en el comportamiento respecto al LoRA sin podar.

El entrenamiento del LoRA original se realizó con el objetivo de acelerar la generación de vídeo, probablemente mediante destilación de conocimiento del modelo completo a un adaptador de bajo rango. No se dispone de detalles sobre el dataset utilizado, la cantidad de tokens o el proceso de optimización (RLHF, DPO, etc.) en la información disponible.

## Capacidades

- Generación de vídeo acelerada: reduce los pasos de inferencia de 30-50 a 4-8, lo que permite generar vídeos de 768p en menos tiempo.
- Compatibilidad con ComfyUI: diseñado para integrarse en flujos de trabajo de ComfyUI mediante nodos específicos.
- Soporte para dos modos de uso: FL2VA (probablemente "frame-to-video" con atención) y ref2VA (referencia a vídeo), con rangos de fuerza recomendados de 0.80-1.15 y 1.02-1.20 respectivamente.
- Configuración de muestreo recomendada: sampler Euler con scheduler Simple o Beta57, y 4-8 pasos.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un adaptador para generación de vídeo, no un modelo de lenguaje.

## Casos de uso

- Prototipado rápido de vídeo: permite generar clips de prueba en pocos segundos, ideal para validar ideas creativas antes de una producción completa.
- Generación de vídeo en tiempo real para aplicaciones interactivas: con 4 pasos de inferencia, es posible integrar el modelo en sistemas que requieren respuesta inmediata, como avatares virtuales o demos en vivo.
- Postproducción de vídeo: se puede usar para generar transiciones o efectos visuales cortos que luego se integran en proyectos más grandes.
- Creación de contenido para redes sociales: vídeos cortos de 768p generados rápidamente para plataformas como TikTok o Instagram Reels.
- Investigación en destilación de modelos: sirve como caso de estudio para comparar el rendimiento de un LoRA podado frente al original, especialmente en cuanto a calidad visual y estabilidad.
- Experimentación en ComfyUI: los usuarios pueden ajustar la fuerza del LoRA y los parámetros de muestreo para explorar diferentes estilos y comportamientos en la generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la versión podada no es matemáticamente equivalente al LoRA original, pero no proporciona métricas objetivas de calidad (FVD, IS, etc.) ni comparaciones cuantitativas.

## Requisitos de hardware

- El LoRA pesa 0,9 GB, pero el modelo base MiniMax-H3 (no incluido en este repo) requiere una GPU con VRAM suficiente para generar vídeo a 768p. No se dispone de especificaciones oficiales del modelo base.
- Se recomienda al menos una GPU con 16-24 GB de VRAM (por ejemplo, RTX 4090, A100) para trabajar con el modelo base y el LoRA sin problemas de memoria.
- El despliegue se realiza principalmente en ComfyUI, que gestiona la carga del modelo base y el LoRA. También se puede usar con otras herramientas que soporten el formato safetensors y la librería minimax-h3.
- No se dispone de datos de latencia o throughput, pero la reducción de pasos de 30-50 a 4-8 sugiere una aceleración de entre 4 y 10 veces respecto al modelo base sin LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Tamaño del adaptador | Licencia |
|---|---|---|---|---|
| Este LoRA (pruned) | LoRA para MiniMax-H3 | 4-8 | 0,9 GB | no disponible |
| LoRA original de SilverOxides (lightx2v) | LoRA para MiniMax-H3 | 4-8 | no disponible | no disponible |
| MiniMax-H3 (modelo base) | Generador de vídeo | 30-50 (estimado) | no disponible | no disponible |

No se dispone de comparativas cuantitativas de calidad visual entre estas opciones. El LoRA podado ofrece un tamaño menor que el original, pero a costa de posibles artefactos o inestabilidad en algunos flujos de trabajo.

## Limitaciones y advertencias

- Versión experimental: no se recomienda para producción sin una validación exhaustiva en el escenario de uso concreto.
- No es matemáticamente equivalente al LoRA original: la poda de los módulos AdaLN introduce diferencias que pueden manifestarse como artefactos, suavidad o inestabilidad en la voz (si el vídeo incluye audio).
- Sensibilidad a la fuerza del LoRA: valores fuera de los rangos recomendados (0.80-1.15 para FL2VA, 1.02-1.20 para ref2VA) pueden provocar sobresaturado o desenfoque.
- Compatibilidad limitada: diseñado específicamente para ComfyUI y el modelo base MiniMax-H3; su uso en otros entornos no está documentado.
- Sin licencia especificada: no se puede determinar si el uso comercial está permitido.
- Sin datos de entrenamiento ni evaluación: no se ha publicado información sobre el dataset utilizado ni métricas de calidad objetivas.
- Riesgo de alucinación visual: como cualquier modelo generativo, puede producir vídeos con inconsistencias temporales o espaciales, especialmente con pocos pasos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HAOOOOOOO51/Minimax_h3_fl2v_lightx2v_turbo_4to8step_v0.1-v1.0_768p_v4_step600_dareties_fro095_pruned
- LoRA original de lightx2v: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Archivo de LoRA en el repo de Kijai: https://huggingface.co/Kijai/MiniMax-H3_comfy/blob/main/loras/minimax_h3_fl2v_lightx2v_turbo_4step_v0.1_comfy.safetensors
- Repositorio oficial de MiniMax-H3 en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Repositorio de destilación de ModelTC: https://github.com/ModelTC/Minimax-H3-Turbo
- Artículo de ComfyUI-wiki sobre el LoRA Turbo v1.0: https://comfyui-wiki.com/en/news/2026-08-11-minimax-h3-turbo-lightx2v-v1
