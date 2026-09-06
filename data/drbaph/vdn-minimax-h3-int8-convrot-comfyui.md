# drbaph/vdn-minimax-h3-int8-convrot-comfyui

## Resumen

El modelo `drbaph/vdn-minimax-h3-int8-convrot-comfyui` es un checkpoint pre-cuantizado en INT8 ConvRot para ComfyUI, derivado del modelo `OpenVDN/vdn-minimax-h3`, que a su vez se construye sobre MiniMax-H3. Lo desarrolla el autor `drbaph` como una optimización para reducir el consumo de VRAM y acelerar la inferencia en tareas de generación de video. El checkpoint original corresponde al `stage-dmd-step-250`, un modelo de 8 pasos pensado para ejecutarse dentro del ecosistema ComfyUI-VDN-H3.

El problema que resuelve es el alto coste de memoria y la lentitud de los modelos de video de tamaño medio. Al cuantizar solo las ramas lineales del branch a INT8, el modelo reduce el peso total del stage de 5.09 GB a 3.25 GB, la VRAM del branch de ~4.3 GB a ~2.2 GB y el tiempo de render de ~111 s a ~95 s en una configuración de 8 pasos a 1280x736 con 61 frames. La arquitectura es un modelo de difusión de video basado en transformers, con una longitud de contexto no especificada y un tamaño de repo de 3.5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de video basado en MiniMax-H3 (transformers) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (per-channel, TensorWiseINT8Layout) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | Safetensors (pre-cuantizado para ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusión de video de 8 pasos, denominado `stage-dmd-step-250`, que parte de los pesos transformer liberados de MiniMax-H3. Se integra en ComfyUI mediante el nodo `Apply-VDN` y requiere la extensión `ComfyUI-VDN-H3` en su versión 1.3.0 o superior. La cuantización INT8 ConvRot se aplica exclusivamente a los pesos lineales del branch, utilizando la serialización `TensorWiseINT8Layout` de comfy-kitchen; los adaptadores, biases, normas y capas convolucionales se mantienen sin cuantizar. Para la inferencia optimizada se emplean FlashAttention y Triton. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el número de tokens utilizados.

## Capacidades

- Generación de video en ComfyUI, con soporte para tareas de referencia a video (ref2v/ref2va).
- Inferencia en 8 pasos con el sampler `er_sde` y el scheduler `beta`.
- Cuantización INT8 que reduce la VRAM del branch a ~2.2 GB y acelera los matmuls del branch 2.7x respecto a bf16.
- Salida visualmente idéntica al checkpoint bf16 original, verificada mediante pruebas A/B con el mismo seed.
- Compatibilidad con el flujo de trabajo estándar de ComfyUI-VDN-H3, sin cambios en la configuración del modelo base.
- No se documentan capacidades de tool calling, agentes, visión, audio o razonamiento multi-paso.

## Casos de uso

- Generación de video en ComfyUI para creadores de contenido: el checkpoint se coloca en `ComfyUI/models/vdn/` y se selecciona en el nodo `Apply-VDN`, permitiendo producir clips de video de 61 frames a 1280x736 en unos 95 segundos.
- Despliegue en GPUs de consumo: gracias a la cuantización INT8, el modelo reduce la VRAM necesaria, siendo viable en tarjetas con 8-12 GB de memoria, donde la versión bf16 podría quedar al límite.
- Investigación en destilación de modelos de difusión: el checkpoint de 8 pasos permite comparar la calidad y velocidad de la inferencia frente a modelos de más pasos, usando el mismo seed y configuración.
- Evaluación de técnicas de cuantización: el modelo sirve como caso práctico para analizar el impacto de INT8 ConvRot en la fidelidad visual y el rendimiento, con datos A/B publicados.
- Prototipado rápido de efectos visuales: los tiempos de render reducidos (~95 s) hacen posible iterar sobre prompts y referencias en sesiones de trabajo cortas.
- Integración en pipelines de generación de contenido: al ser un modelo de ComfyUI, puede incorporarse en flujos automatizados de producción de video, aprovechando la menor huella de VRAM para ejecutar varios workers en paralelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La información disponible incluye mediciones de rendimiento de la propia model card, comparando el checkpoint bf16 original con la versión INT8 ConvRot:

| Metrica | bf16 original | INT8 ConvRot |
|---|---|---|
| Tiempo de render (8 pasos, 1280x736, 61 frames) | ~111 s | ~95 s |
| VRAM libre durante el render | 3.6 GB | 8.3 GB |
| VRAM del branch (cache_gpu) | ~4.3 GB | ~2.2 GB |
| VRAM pico al cargar | — | ~4.7 GB menor |
| Velocidad de matmuls del branch | 1x | 2.7x más rápido |

Nota: los tiempos proceden de una ejecución única de cada configuración, con una variación estimada de ±5 s en el sampling.

## Requisitos de hardware

- VRAM estimada para inferencia: el branch con `cache_gpu` ocupa ~2.2 GB; el stage total ocupa 3.25 GB en disco; la carga del modelo consume ~4.7 GB menos de VRAM que la versión bf16.
- GPU recomendadas: no especificadas por el autor. Los valores de VRAM libre durante el render (8.3 GB en INT8) sugieren que es viable en GPUs de consumo con al menos 8 GB de VRAM, como RTX 4060 Ti, RTX 4070 o superiores.
- Opciones de despliegue: ComfyUI con la extensión ComfyUI-VDN-H3 v1.3.0+; el repo se descarga directamente en `ComfyUI/models/vdn/`.
- Latencia estimada: ~95 s para 8 pasos a 1280x736 con 61 frames (una ejecución).
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría. La única comparativa documentada es con el checkpoint bf16 original:

| Modelo | Precisión | VRAM del branch | Tiempo de render | Licencia |
|---|---|---|---|---|
| OpenVDN/vdn-minimax-h3 (stage-dmd-step-250) | bf16 | ~4.3 GB | ~111 s | MiniMax H3 Community |
| drbaph/vdn-minimax-h3-int8-convrot-comfyui | int8 | ~2.2 GB | ~95 s | MiniMax H3 Community |

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement restringe el uso a territorios fuera de la Unión Europea, el Reino Unido, la República de Corea y los Estados Unidos de América. El uso fuera de estos territorios no está autorizado.
- El modelo requiere ComfyUI-VDN-H3 v1.3.0 o superior; con versiones anteriores, la integración puede fallar.
- La cuantización INT8 puede introducir diferencias numéricas, aunque el autor afirma que la salida es visualmente idéntica en la prueba A/B realizada con una configuración concreta.
- Los datos de rendimiento proceden de una única ejecución y de una configuración específica (8 pasos, er_sde/beta, 1280x736, 61 frames); otros parámetros pueden dar resultados distintos.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones de idioma.
- Al ser un modelo derivado, la redistribución debe cumplir los requisitos del acuerdo de licencia: incluir el texto del acuerdo, marcar los archivos modificados y adjuntar el archivo NOTICE cuando se distribuya a terceros fuera de servicios alojados.

## Enlaces

- HuggingFace: https://huggingface.co/drbaph/vdn-minimax-h3-int8-convrot-comfyui
- Repo upstream: https://huggingface.co/OpenVDN/vdn-minimax-h3
- ComfyUI-VDN-H3: https://github.com/Saganaki22/ComfyUI-VDN-H3
- Release v1.3.0: https://github.com/Saganaki22/ComfyUI-VDN-H3/releases/tag/v1.3.0
- Licencia: https://huggingface.co/OpenVDN/vdn-minimax-h3/blob/main/LICENSE
