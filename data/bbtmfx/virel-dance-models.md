# bbtmfx/virel-dance-models

## Resumen

`bbtmfx/virel-dance-models` no es un modelo entrenado por su autor, sino un espejo (mirror) sin modificaciones de ficheros de pesos con licencia Apache-2.0 empaquetados en la estructura de carpetas que espera ComfyUI. El repositorio agrupa los componentes necesarios para ejecutar el pipeline Wan2.2-Animate-14B, un modelo de generación de vídeo con control de movimiento y animación de personajes, junto con sus codificadores de texto (UMT5-XXL y CLIP-ViT-H), el VAE de Wan 2.1, un LoRA de relighting y un LoRA de destilación de pasos de lightx2v.

Su relevancia es operativa más que científica: al tratarse de un paquete preensamblado de 25,6 GB, permite arrancar un entorno de inferencia en RunPod con caché de modelos sin tener que descargar y reorganizar manualmente cada componente desde los repositorios originales de Wan-AI y Comfy-Org. No aporta pesos nuevos ni fine-tuning propio; todo el crédito corresponde a los autores originales.

La ficha describe, por tanto, el conjunto de artefactos y el pipeline que habilita, no un modelo único con parámetros y contexto propios. Los datos de arquitectura, entrenamiento y benchmarks corresponden a los modelos de origen (Wan2.2-Animate-14B y Wan-Animate-2) y se indican como no disponibles cuando la información proporcionada no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio es un mirror de pesos; el pipeline subyacente es Wan2.2-Animate-14B / Wan-Animate-2, generación de vídeo con control de movimiento) |
| Parametros totales | 14B en el componente principal Wan2.2-Animate-14B (según nomenclatura del autor); resto de componentes no disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp8 scaled (build de Kijai para Wan2.2-Animate-14B); UMT5-XXL en fp8; resto no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos compatibles con ComfyUI (safetensors y similares); formatos exactos por componente no disponibles |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento propios: es un mirror de artefactos. Los componentes que agrupa son, según la model card, Wan2.2-Animate-14B (Wan-AI, con build fp8 scaled de Kijai), Wan-Animate-2 (Wan-AI, vía `Comfy-Org/Wan-Animate-2`), el codificador de texto UMT5-XXL en fp8, CLIP-ViT-H, el VAE de Wan 2.1, un LoRA de relighting y un LoRA de destilación de pasos de lightx2v. Todos ellos empaquetados en la jerarquía de carpetas de ComfyUI.

La innovación práctica del paquete es la integración: combina un modelo de animación de vídeo de 14B con un LoRA de destilación de pasos que reduce el número de pasos de muestreo necesarios, y un LoRA de relighting para el control de iluminación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si los modelos originales emplearon RLHF o DPO.

## Capacidades

- Generación y animación de vídeo con control de movimiento mediante el pipeline Wan-Animate.
- Transferencia de movimiento desde un vídeo de referencia a un personaje, según la naturaleza de Wan-Animate.
- Control de iluminación mediante el LoRA de relighting incluido.
- Muestreo acelerado gracias al LoRA de destilación de pasos de lightx2v.
- Integración directa en flujos de trabajo de ComfyUI con los nodos de Wan.
- Codificación de texto con UMT5-XXL y CLIP-ViT-H para las indicaciones.
- Tool calling, function calling, agentes, razonamiento multi-paso, matemáticas y capacidades multilingües: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Animación de personajes para vídeo corto: cargar Wan2.2-Animate-14B junto con el VAE de Wan 2.1 en ComfyUI y aplicar el movimiento de un vídeo de referencia sobre una imagen o personaje estático.
- Prototipado rápido en RunPod: al ser un paquete con caché preensamblada, permite levantar un pod con ComfyUI y empezar a generar sin descargar y reorganizar manualmente cada componente.
- Pruebas de transferencia de movimiento en preproducción: usar el LoRA de destilación de lightx2v para reducir pasos de muestreo y obtener iteraciones más rápidas durante la exploración creativa.
- Ajuste de iluminación en escenas generadas: aplicar el LoRA de relighting incluido para modificar la iluminación sin regenerar el vídeo desde cero.
- Evaluación comparativa de pipelines de animación: al reunir los componentes oficiales de Wan-AI y Comfy-Org, sirve como base reproducible para comparar configuraciones de cuantización fp8 frente a los pesos originales.
- Integración en flujos de producción de contenido audiovisual: usar los pesos en un grafo de ComfyUI versionado para generar clips de animación de forma repetible dentro de un pipeline de postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el componente principal es un modelo de 14B en fp8 scaled, por lo que se requiere una GPU con memoria suficiente para pesos y activaciones de vídeo, habitualmente en el rango de 24 GB o superior para configuraciones fp8.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del pipeline, se orienta a GPUs de centro de datos (A100, H100) o consumer de gama alta con 24 GB o más.
- ¿Cabe en consumer GPU? No disponible con confirmación; el tamaño del repo (25,6 GB) y el componente de 14B en fp8 sugieren que solo en GPUs consumer de 24 GB o más y con gestión cuidadosa de memoria.
- Opciones de despliegue: ComfyUI (estructura de carpetas nativa del repo); RunPod como entorno de caché previsto por el autor; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de pipeline.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bbtmfx/virel-dance-models | 14B (componente principal) | No disponible | Apache-2.0 | Hugging Face (mirror) | Paquete preensamblado para ComfyUI; sin pesos propios |
| Wan2.2-Animate-14B (Wan-AI) | 14B | No disponible | Apache-2.0 | Repositorio original de Wan-AI | Fuente original del componente principal |
| Wan-Animate-2 (Wan-AI / Comfy-Org) | No disponible | No disponible | Apache-2.0 | `Comfy-Org/Wan-Animate-2` | Componente incluido en el mirror |
| Kijai/WanVideo_comfy_fp8_scaled | No disponible | No disponible | No disponible | Hugging Face | Build fp8 scaled usado por el mirror |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: no hay garantía de integridad más allá de la declaración de "unmodified mirror"; conviene verificar los hashes frente a los repositorios originales.
- La licencia Apache-2.0 se hereda de los componentes originales; es responsabilidad del usuario comprobar que cada artefacto incluido mantiene esa licencia y sus avisos de atribución.
- El repositorio no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas; al ser un pipeline de vídeo, los riesgos se refieren a la fidelidad del movimiento y a posibles artefactos visuales.
- El tamaño de 25,6 GB y la naturaleza del pipeline limitan su despliegue a entornos con GPU de gran memoria; no es apto para inferencia en CPU.
- No se especifican requisitos de versión de ComfyUI ni de los nodos de Wan; una incompatibilidad de versión puede impedir la carga de los pesos.
- Uso comercial: permitido por Apache-2.0 en los componentes que la mantengan, pero debe confirmarse componente a componente, incluidos los LoRA de terceros (lightx2v, relighting).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bbtmfx/virel-dance-models
- Wan2.2-Animate-14B (Wan-AI): no disponible en la información proporcionada
- Kijai/WanVideo_comfy_fp8_scaled: https://huggingface.co/Kijai/WanVideo_comfy_fp8_scaled
- Comfy-Org/Wan-Animate-2: https://huggingface.co/Comfy-Org/Wan-Animate-2
- Comfy-Org/Wan_2.2_ComfyUI_Repackaged: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- lightx2v (LoRA de destilación de pasos): no disponible en la información proporcionada
