# Jirimbinha/MiniMax-H3-Character-Swap-LoRA

## Resumen

MiniMax-H3 Character Swap LoRA es un adaptador de bajo rango (LoRA) para el modelo base MiniMax-H3 de Comfy-Org, orientado a la edición de vídeo mediante sustitución de personajes. Desarrollado por el usuario Jirimbinha a partir del trabajo original de akatz-ai, el adaptador permite reemplazar una persona concreta en un vídeo de origen por un personaje proporcionado mediante una imagen de referencia, conservando la interpretación, la pose y el movimiento del vídeo original. Se distribuye en formato single-file safetensors y se integra en flujos de trabajo de ComfyUI.

El modelo resuelve un problema específico dentro de la posproducción audiovisual: el intercambio de identidad en vídeo sin necesidad de regrabar ni de reconstruir la escena. No es un modelo autónomo, sino un adaptador que requiere el modelo base Ref2VA, el codificador de texto, los VAE y, según la receta probada, un adaptador Turbo de 8 pasos. Su relevancia actual radica en que la sustitución de personajes en vídeo con coherencia temporal sigue siendo un problema abierto, y este LoRA ofrece una vía práctica dentro del ecosistema ComfyUI.

La ficha se basa exclusivamente en la información pública del repositorio de Hugging Face; los datos no disponibles se indican explícitamente como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión de vídeo MiniMax-H3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible como opción del adaptador; la receta probada usa base Ref2VA INT8 |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (single-file) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre el modelo de difusión de vídeo MiniMax-H3, concretamente sobre la variante Ref2VA (referencia a vídeo con audio). No se trata de un transformer autónomo, sino de una modificación de bajo rango de las capas del modelo base, por lo que su arquitectura efectiva es la del modelo subyacente. El repositorio no detalla el rango, las capas objetivo ni la configuración exacta del adaptador.

En cuanto al entrenamiento, el autor documenta que el dataset original `akatz-ai/H3-Character-Swap-v1` forma parte del linaje de entrenamiento, aunque no contiene la mezcla completa de la versión 1.5. El archivo `training/v1.5/run-summary.json` registra el hash de la release, la inicialización, las actualizaciones completadas y los ajustes de entrenamiento. Algunos metadatos embebidos usan el nombre interno V2 y el presupuesto original de 2.250 actualizaciones. No se especifican el número total de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Sustitución de personajes en vídeo: reemplaza a una persona seleccionada en un vídeo de origen por un personaje de referencia proporcionado como imagen.
- Conservación de la interpretación: mantiene la pose, la mirada, la expresión y el movimiento del vídeo fuente.
- Conservación de la escena: preserva el entorno y las demás personas presentes en el vídeo original.
- Retención de identidad: la versión 1.5 mejora la retención de rostros estilizados, cabello e identidad del personaje respecto a la versión 1.
- Condicionamiento por referencia visual: acepta una imagen de referencia para definir la identidad del personaje.
- Integración con ComfyUI: se carga mediante un loader de LoRA compatible en modo solo-modelo.
- Compatibilidad con flujos Relay: incluye un flujo de trabajo nativo con H3 Relay 2.0 y helpers de línea de tiempo reutilizables.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador de difusión de vídeo, no un modelo de lenguaje.

## Casos de uso

- Posproducción audiovisual: sustituir a un actor por un personaje digital en una toma rodada, usando la imagen de referencia como definición de identidad y conservando la interpretación original del actor.
- Prototipado de reparto en publicidad: generar variantes de un anuncio con distintos personajes sin regrabar, a partir de una toma base y una imagen de referencia por personaje.
- Creación de contenido para redes sociales: reemplazar la identidad de un creador en un vídeo por un avatar o personaje estilizado, manteniendo el movimiento y la expresión del original.
- Previsualización en producción de cine o animación: evaluar cómo encaja un personaje en una escena rodada antes de comprometer recursos de modelado o rodaje adicional.
- Anonimización creativa: sustituir rostros por personajes ficticios en material audiovisual, conservando la escena y la interpretación.
- Iteración de diseño de personajes: probar distintas identidades sobre una misma toma de referencia para validar decisiones de diseño de personaje en un contexto de movimiento real.
- Integración en pipelines de ComfyUI: automatizar la sustitución de personajes dentro de flujos de trabajo existentes mediante el flujo Relay 2.0 y los helpers de línea de tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comparaciones entre V1 y V1.5 son ejemplos seleccionados de mejoras en tomas concretas, no una evaluación agregada, y que la evaluación amplia sigue en curso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador ocupa 0,3 GB en disco, pero requiere el modelo base Ref2VA, el codificador de texto, los VAE y el adaptador Turbo de 8 pasos, cuyos requisitos no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el autor advierte que los controles de segmentos largos de la herramienta no garantizan idoneidad para todas las GPU.
- Opciones de despliegue: ComfyUI con loader de LoRA compatible en modo solo-modelo; flujo nativo con H3 Relay 2.0.
- Receta probada: base Ref2VA INT8, adaptador de personaje a fuerza 1.0 y `minimax_h3_fl2v_turbo_8step_v1.0_768p_comfyui_bf16.safetensors` a fuerza 1.0, con 8 pasos, CFG 1, sampler `er_sde` y scheduler `normal`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 Character Swap LoRA (V1.5) | LoRA sobre difusión de vídeo | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face |
| MiniMax-H3 Character Swap LoRA (V1) | LoRA sobre difusión de vídeo | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face |
| Modelo base MiniMax-H3 (Ref2VA) | Difusión de vídeo | no disponible | no disponible | no disponible en esta ficha | Comfy-Org en Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de la observación cualitativa del autor de que V1.5 retiene mejor la identidad en las tomas seleccionadas.

## Limitaciones y advertencias

- Modelo experimental: la identidad, el timing respecto al origen, las expresiones, las oclusiones y los cortes pueden derivar.
- Un valor por defecto recomendado no implica que todas las tomas mejoren respecto a V1.
- La retención de audio y la sincronización labial son funciones de la herramienta de aplicación, no evidencia de que el LoRA reproduzca audio con precisión ni de que el lip sync sea exacto.
- Los controles de segmentos largos no garantizan calidad en planos largos ni idoneidad para todas las GPU.
- El LoRA no es un modelo autónomo: no incluye el modelo base, el asistente de entrenamiento, los VAE ni los pesos Turbo.
- Los ejemplos y el showcase publicados corresponden a resultados y flujos de V1, no a demostraciones de V1.5.
- Licencia sujeta al acuerdo comunitario de MiniMax-H3; deben revisarse las restricciones de uso comercial en el archivo LICENSE antes de cualquier despliegue en producción.
- Idioma soportado limitado a inglés según los metadatos.
- Riesgo de sesgos y alucinación visual no evaluado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jirimbinha/MiniMax-H3-Character-Swap-LoRA
- Repositorio del autor original: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Dataset de entrenamiento V1: https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- H3 Relay 2.0: https://github.com/akatz-ai/h3-relay
- Guía del flujo de trabajo: examples/README.md (dentro del repositorio)
- Model card original de V1 con detalles de entrenamiento: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA/blob/a665bb7e3bb9804e487d2925f67744f554c8ad49/README.md
