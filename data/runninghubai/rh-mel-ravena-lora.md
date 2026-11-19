# RunningHubAI/rh-mel-ravena-lora

## Resumen

`rh-mel-ravena-lora` es un adaptador LoRA para edición de imágenes (pipeline `image-text-to-image`) publicado por RunningHubAI, la cuenta institucional de la plataforma RunningHub, en nombre de la autora Vales Silva. No se trata de un modelo fundacional, sino de un ajuste fino ligero de 218 MiB que se aplica sobre un modelo base identificado en la model card como `krea2`. Su función es introducir un concepto visual concreto, activado mediante la palabra de disparo `mel_sib987_woman`, dentro de un flujo de generación o edición de imágenes controlado por texto.

El interés de esta ficha es limitado desde el punto de vista de la investigación en IA generativa de texto: no hay arquitectura de lenguaje, ni parámetros, ni contexto, ni benchmarks publicados. Es un artefacto de personalización visual orientado a ComfyUI y a la infraestructura de RunningHub, distribuido con un peso único en formato `safetensors` y sin licencia explícita más allá de una remisión genérica a la licencia del proyecto original.

La relevancia práctica reside en su carácter de ejemplo típico del ecosistema actual de LoRAs comunitarias: entrenamientos breves, orientados a un sujeto o estilo, con palabras de activación específicas y despliegue inmediato en plataformas gestionadas. Cualquier evaluación rigurosa debe hacerse contra el modelo base `krea2`, cuyas especificaciones no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del base no disponible |
| Parámetros totales | no disponible (peso de 218 MiB en `safetensors`, sin desglose de rangos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la interacción es mediante prompts de texto; idioma de entrenamiento no especificado) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original y mantiene el copyright de la autora |
| Formato de pesos | `safetensors` (archivo `mel-sib987-woman-krea-2-base-epoch-10.safetensors`, 218 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención (y posiblemente proyecciones) del modelo base `krea2` para modificar su comportamiento sin reentrenar los pesos completos. El nombre del archivo (`...-base-epoch-10`) sugiere un entrenamiento de 10 épocas sobre un dataset no documentado, presumiblemente un conjunto de imágenes de un sujeto concreto etiquetado con la palabra de disparo `mel_sib987_woman`. No se especifican el rango del LoRA, el optimizador, la tasa de aprendizaje, el número de imágenes, la resolución de entrenamiento ni si se aplicaron técnicas como regularización por clase o captions automáticos.

Tampoco se documenta la arquitectura interna de `krea2` (si es un UNet tipo SDXL, un transformer de difusión tipo DiT o un modelo de flujo), lo que impide estimar con precisión el coste de inferencia o la compatibilidad con otros ecosistemas. La única información operativa fiable es el tamaño del peso (218 MiB) y la plataforma de destino (ComfyUI / RunningHub), lo que sitúa el adaptador en el rango habitual de LoRAs para modelos de difusión de una sola etapa.

## Capacidades

- Personalización visual de un sujeto concreto mediante la palabra de activación `mel_sib987_woman`.
- Generación de imágenes condicionada por texto dentro del pipeline `image-text-to-image` (la etiqueta de Hugging Face indica también entrada de imagen, es decir, edición imagen-a-imagen guiada por prompt).
- Integración nativa en flujos ComfyUI mediante el nodo de carga de LoRA sobre el modelo base `krea2`.
- Compatibilidad con la API y el entorno gestionado de RunningHub para ejecución remota.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión analítica, audio ni modo thinking: no es un modelo de lenguaje.
- Capacidad multilingüe de los prompts: no verificada; depende del codificador de texto del modelo base, no del LoRA.

## Casos de uso

- Creación de retratos consistentes de un personaje: aplicar el LoRA sobre `krea2` con la palabra `mel_sib987_woman` permite mantener rasgos faciales estables entre distintas generaciones, útil para ilustración editorial o narrativa serializada.
- Edición de imágenes existentes en ComfyUI: al tratarse de un pipeline `image-text-to-image`, se puede partir de una foto o render y aplicar el LoRA en un flujo de img2img para transferir la identidad del sujeto manteniendo la composición original.
- Pruebas de concepto para dirección de arte: generar variaciones rápidas de vestuario, iluminación y encuadre sobre un mismo personaje antes de producir el material final.
- Prototipado de assets para videojuegos o cómics: producir hojas de personaje y expresiones coherentes con un coste de inferencia bajo, dado el reducido tamaño del adaptador (218 MiB).
- Evaluación comparativa de LoRAs en investigación: usar el adaptador como caso de estudio para medir cómo un entrenamiento de 10 épocas afecta a la fidelidad de identidad y a la degradación del modelo base.
- Automatización por API en RunningHub: ejecutar el flujo de generación de forma programática para integrarlo en un pipeline de producción de contenido, sin necesidad de gestionar infraestructura GPU propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; el consumo vendrá determinado casi por completo por el modelo base `krea2`, cuyas especificaciones no se detallan.
- GPU recomendadas: no disponibles. Al tratarse de un adaptador de 218 MiB, su carga añade un coste de memoria despreciable frente al modelo base.
- Compatibilidad con GPU de consumo: no verificada; depende enteramente de si `krea2` cabe en GPU consumer (RTX 3060, 4070, 4090, etc.), dato no disponible.
- Opciones de despliegue: ComfyUI (entorno principal declarado), plataforma RunningHub (ejecución gestionada y API). No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del peso | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RunningHubAI/rh-mel-ravena-lora` | LoRA de imagen | 218 MiB | `krea2` | no disponible | Hugging Face + RunningHub |
| `RunningHubAI/rh-7-lora` | LoRA (ComfyUI) | no disponible | no disponible | no disponible | Hugging Face |
| LoRAs de identidad para SDXL (familia genérica) | LoRA de imagen | 50-250 MiB típicos | SDXL | varía (a menudo CreativeML OpenRAIL-M) | Hugging Face, Civitai |

No se dispone de datos de rendimiento comparativos ni de especificaciones del modelo base que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican rango del LoRA, dataset, hiperparámetros ni arquitectura del modelo base, lo que impide reproducir el entrenamiento.
- Licencia no disponible: la model card remite a "la licencia del proyecto original" sin identificarla, por lo que el uso comercial es incierto y requiere contactar con la autora o con RunningHub.
- Dependencia estricta de la palabra de activación `mel_sib987_woman`; sin ella el adaptador puede no tener efecto o introducir artefactos.
- Riesgo de sobreajuste al sujeto de entrenamiento y de degradación de la diversidad del modelo base, habitual en LoRAs entrenados durante pocas épocas sin regularización documentada.
- Posibles sesgos de representación heredados del dataset de entrenamiento (no documentado) y del modelo base.
- Riesgo de alucinación visual: el modelo puede generar rasgos no presentes en el sujeto real, especialmente en ángulos o expresiones poco representados.
- Sin garantías de compatibilidad fuera de ComfyUI y RunningHub; no se confirma que funcione con otros runners de difusión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación ni de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-mel-ravena-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2122878997301645314
- Página de la autora (Vales Silva): https://www.runninghub.ai/user-center/2122400176103378945
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-mel-ravena-lora/blob/main/README_cn.md
