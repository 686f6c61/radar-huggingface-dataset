# Momoking/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4

## Resumen

Este repositorio contiene una re-cuantización en precisión mixta NVFP4 del text encoder "Heretic" (versión sin censura) del modelo Qwen3-VL-32B, adaptado para el pipeline de generación de vídeo MiniMax-H3. El trabajo original de adaptación y uncensoring fue realizado por ethanfel, y esta re-cuantización NVFP4 ha sido desarrollada por Momoking (Lna-Lab) con el objetivo de reducir el peso del encoder de 26,4 GB a 15,7 GB, permitiendo así su ejecución en tarjetas gráficas con 16 GB de VRAM. Es un drop-in replacement del text encoder oficial de Comfy-Org, con la diferencia de que no está censurado.

La relevancia de este modelo radica en que democratiza la generación de vídeo uncensored con MiniMax-H3, que hasta ahora requería hardware de datacenter o descarga en memoria. El modelo conserva la semántica del encoder original INT8, incluyendo el manejo correcto de la rotación ConvRot, y se integra directamente en ComfyUI mediante el nodo CLIPLoader. El repositorio contiene un único archivo safetensors de 15,7 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-32B (transformer con visión) adaptado como text encoder para MiniMax-H3 |
| Parámetros totales | ~32 mil millones (no confirmado exactamente) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (grupo 16) en 350 capas lineales; INT8 en embeddings |
| Idiomas soportados | No disponible (heredados de Qwen3-VL) |
| Licencia | Apache-2.0 para el repositorio; el modelo base MiniMax-H3 está sujeto a la MiniMax H3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se trata de un entrenamiento desde cero, sino de una re-cuantización de un modelo previamente adaptado. El modelo original es Qwen3-VL-32B de Alibaba, que fue adaptado por ethanfel para funcionar como text encoder de MiniMax-H3, con un proceso de "abliteración" (uncensoring) que elimina los rechazos del modelo. El resultado INT8 con ConvRot (rotación de pesos mediante matrices Hadamard por grupos de 256) fue la base para este trabajo.

La re-cuantización NVFP4 se realizó con precisión mixta: 350 capas lineales se cuantizaron a NVFP4 (grupo 16), mientras que la capa de embeddings (778 M de parámetros) se mantuvo en INT8, siguiendo la misma elección que hizo Comfy-Org en su build oficial. El proceso incluye un paso crítico de "unrotate" que revierte la rotación ConvRot antes de re-cuantizar, ya que de lo contrario el conditioning resultante sería completamente inválido (aunque no generaría errores). No se han publicado datos sobre el dataset de entrenamiento ni el proceso de uncensoring.

## Capacidades

- Text encoder para generación de vídeo con MiniMax-H3, convirtiendo prompts de texto en conditioning para el modelo de difusión.
- Entrada de texto en múltiples idiomas (heredada de Qwen3-VL, aunque no se especifican cuáles).
- Compatible con el pipeline completo de ComfyUI para MiniMax-H3, incluyendo el nodo CLIPLoader con tipo `minimax`.
- Preserva la capacidad de generar contenido sin censura, gracias al proceso de abliteración del modelo base.
- Funciona como drop-in replacement del text encoder NVFP4 oficial de Comfy-Org (mismo tamaño y formato de carga).
- No incluye tool calling, razonamiento multi-step ni otras capacidades de chat; es exclusivamente un encoder para vídeo.

## Casos de uso

- Generación de vídeo uncensored con MiniMax-H3 en GPUs de 16 GB: el modelo permite crear vídeo de alta calidad sin necesidad de hardware de datacenter, usando una tarjeta como RTX PRO 2000 Blackwell.
- Sustitución del text encoder oficial en flujos de trabajo existentes: al ser drop-in, basta con cambiar la ruta del archivo en CLIPLoader y el resto del workflow de ComfyUI permanece intacto.
- Prototipado rápido de contenido creativo: el tamaño reducido permite iterar sobre prompts y configuraciones sin esperas largas de carga, ideal para pruebas en local.
- Investigación en generación de vídeo sin restricciones: el modelo facilita estudiar el comportamiento del pipeline MiniMax-H3 sin filtros de contenido.
- Creación de contenido para proyectos artísticos o de ficción: permite generar escenas que los modelos censurados rechazarían, manteniendo la coherencia visual del prompt.
- Despliegue en entornos con VRAM limitada: al caber en 16 GB, puede integrarse en estaciones de trabajo o servidores con tarjetas Blackwell de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una comparación visual cualitativa: el autor indica que el output generado con el mismo prompt y semilla es "visualmente equivalente" al del build INT8-ConvRot upstream, sin diferencias perceptibles en la descripción del encoder.

## Requisitos de hardware

- 1× GPU con soporte NVFP4 (Blackwell sm_120), por ejemplo RTX PRO 2000 Blackwell, RTX 50 series.
- VRAM pico durante la generación de vídeo: ~9,9 GB (con el modelo de difusión `fl2va` pruned INT8).
- El encoder ocupa 14,9 GB en VRAM, con carga dinámica.
- RAM del sistema: ~36 GB para el proceso de ComfyUI.
- No compatible con GPUs sin soporte NVFP4 (Ampere, Turing, etc.).
- Despliegue recomendado: ComfyUI 0.30.0 o superior, con Sage Attention para la generación de vídeo.
- No se han reportado latencias ni throughput específicos.

## Comparativa con modelos similares

| Modelo | Tamaño | VRAM necesaria | Censura | Compatibilidad |
|---|---|---|---|---|
| Heretic INT8-ConvRot (upstream) | 26,4 GB | Requiere offload en 16 GB | Sin censura | Funciona en cualquier GPU, pero necesita más VRAM |
| Comfy-Org NVFP4 (oficial) | 15,7 GB | 16 GB | Con censura | Solo Blackwell (sm_120) |
| **Este modelo (Heretic NVFP4)** | **15,7 GB** | **16 GB** | **Sin censura** | **Solo Blackwell (sm_120)** |

La ventaja principal frente al INT8 es el tamaño reducido a la mitad sin pérdida visual aparente. Frente al NVFP4 de Comfy-Org, la diferencia es la ausencia de censura en el contenido generado.

## Limitaciones y advertencias

- Contenido uncensored/abliterated: el modelo puede generar vídeos con contenido inapropiado, ofensivo o ilegal según el contexto de uso. El usuario es responsable del uso que haga de él.
- Requiere hardware Blackwell (sm_120) para NVFP4: no funciona en GPUs más antiguas, lo que limita su despliegue.
- La licencia MiniMax H3 Community License del modelo base puede imponer restricciones para uso comercial; la licencia Apache-2.0 aplica solo al repo de cuantización, no a los pesos del modelo base.
- La re-cuantización INT8 → NVFP4 hereda el redondeo del INT8, por lo que la calidad puede ser marginalmente inferior a una bake directa desde BF16.
- Si el output generado no guarda relación con el prompt, es probable que haya un problema de rotación ConvRot, no del quantizado; hay que verificar que el archivo se ha cargado correctamente.
- No es un modelo de chat ni de razonamiento; su única función es ser text encoder para MiniMax-H3 en ComfyUI.
- El autor no ha publicado benchmarks cuantitativos ni pruebas de robustez ante prompts adversarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Momoking/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4
- Modelo base (INT8-ConvRot): https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot
- MiniMax-H3 (modelo de difusión): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Comfy-Org MiniMax-H3 (workflow y VAEs): https://huggingface.co/Comfy-Org/MiniMax-H3
- Nodo de Qwen3-VL para ComfyUI (soporte Heretic): https://civitai.com/models/2200639/qwen-3-vl-node-for-comfyui-qwen-3-vl-heretic-uncensored-model
- Página de AIAny con descripción adicional: https://aiany.app/item/qwen3-vl-32b-heretic-minimax-h3-text-encoder-nvfp4
