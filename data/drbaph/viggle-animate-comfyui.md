# drbaph/Viggle-Animate-ComfyUI

## Resumen

Viggle-Animate-ComfyUI es una conversión para el ecosistema ComfyUI del modelo Viggle-Animate, un finetune completo de 33.1 mil millones de parámetros del transformer ref2va de MiniMax-H3, orientado al reemplazo de personaje en video. El modelo, desarrollado por drbaph a partir del trabajo de Viggle Research, toma un clip de video que aporta movimiento, cámara, fondo e iluminación, y una imagen de referencia que aporta el personaje, y genera un nuevo video donde el personaje de la imagen sustituye al original, manteniendo la dinámica del clip de conducción.

La principal singularidad es que no emplea codificador de texto: el condicionamiento es un embedding fijo de 362 tokens, y el muestreador está destilado con DMD2, lo que permite generar en 4 pasos (3 forward passes). La conversión incluye pesos en distintas cuantizaciones (int8 pruned, int8 completo y bf16) y un pack de nodos personalizados para ComfyUI, lo que facilita su integración en flujos de trabajo video-to-video. La licencia aplicable es la MiniMax H3 Community License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MiniMax-H3 (ref2va) |
| Parametros totales | 33.1 mil millones (33.1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionamiento mediante embedding fijo de 362 tokens) |
| Tipos de cuantizacion | int8 pruned, int8 completo, bf16; VAE en int8 y fp16 |
| Idiomas soportados | No disponible (no utiliza lenguaje natural) |
| Licencia | MiniMax H3 Community License |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune completo del transformer ref2va de MiniMax-H3, una arquitectura híbrida que combina atención y modelos de espacio de estado (SSM) para el procesamiento de video. En Viggle-Animate, un clip de video de conducción aporta el movimiento, la cámara, el fondo y la iluminación, mientras que una imagen de referencia define el personaje. No se utiliza codificador de texto: el condicionamiento es un embedding fijo de 362 tokens precomputado, que se carga con el nodo Load Text Conditioning (Viggle).

La innovación técnica principal es la destilación DMD2, que reduce el muestreador a 4 pasos (3 forward passes) mediante una LoRA especial. La conversión a ComfyUI añade variantes cuantizadas: una versión int8 con convrot de 46.3 GB, una pruned int8 de 20.3 GB para reducir el consumo de VRAM y una bf16 de 62 GB para máxima calidad. Los datos de entrenamiento no se detallan en la información disponible; se indica que el modelo es un finetune completo del modelo base MiniMax-H3.

## Capacidades

- Reemplazo de personaje en video: sustituye al protagonista de un clip de video por el personaje de una imagen de referencia, preservando el movimiento, la cámara, el fondo y la iluminación originales.
- Transferencia de movimiento: reproduce el gesto, la danza o la acción del video de conducción sobre el nuevo personaje.
- Condicionamiento sin texto: utiliza un embedding fijo de 362 tokens, lo que simplifica el pipeline y elimina la dependencia de un codificador de texto.
- Inferencia acelerada: el sampler DMD2 destilado permite generar en 4 pasos (3 forward passes) con la LoRA DMD recomendada (r64, de 0.9 GB).
- Integración con ComfyUI: incluye nodos personalizados específicos para el acondicionamiento, la carga de text_cond y la visualización rápida con ComfyUI-KJNodes.
- Soporte de cuantización: se ofrecen variantes int8 pruned, int8 completo y bf16, adaptables a distintos presupuestos de VRAM.
- Capacidades multimodales limitadas: acepta entrada de video e imagen; no admite entrada de texto ni tool calling.

## Casos de uso

- Publicidad y vídeo de marca: un personaje digital puede sustituir a un actor en un anuncio ya grabado, manteniendo la coreografía y el escenario.
- Contenido para redes sociales: creación de vídeos donde un personaje de referencia baila o ejecuta movimientos a partir de un clip viral, usando el flujo de ComfyUI.
- Efectos visuales en cine y series: reemplazo de dobles de cuerpo o de personajes en tomas de acción, reduciendo el coste de reshoots.
- Previsualización de animación: los equipos de animación pueden probar rápidamente un personaje sobre una animática de video real antes de invertir en renderizado.
- Prototipado de videojuegos: animar personajes de juego usando grabaciones de captura de movimiento de un actor o referencia.
- Investigación en generación de video: estudiar el control de la apariencia del personaje y el movimiento con una sola imagen de referencia, dado el enfoque sin texto.
- Tutoriales y demostraciones de ComfyUI: como ejemplo práctico de node pack de video-to-video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según el archivo de pesos: la variante pruned int8 (20.3 GB) es la opción más ligera; con el overhead de activaciones y la VAE int8, podría requerir entre 24 y 30 GB de VRAM. La variante int8 completa (46.3 GB) necesitaría aproximadamente 48-56 GB. La bf16 (62 GB) precisaría en torno a 64-70 GB o más.
- GPU recomendadas: GPUs de 24 GB como la RTX 4090 probablemente puedan ejecutar la versión pruned int8 con la VAE int8 y optimizaciones de ComfyUI, aunque no está confirmado. Para las versiones int8 completo y bf16 se recomiendan GPUs de 48 GB o más, como A100, H100 o RTX 6000 Ada.
- Uso en GPU de consumo: la variante pruned int8 es la única que podría caber en una consumer GPU de 24 GB, siempre que se adapten la resolución y el número de frames.
- Opciones de despliegue: exclusivamente a través del ecosistema ComfyUI, con el node pack ComfyUI-Viggle-Animate-H3 y ComfyUI-KJNodes. No es compatible con vLLM, llama.cpp, TGI ni otros runtimes de lenguaje.
- Latencia y throughput: no se han publicado datos en la información disponible.

## Comparativa con modelos similares

No se han identificado múltiples alternativas de la misma categoría en la información proporcionada. La referencia directa es el modelo original Viggle/Viggle-Animate, del cual este modelo es una conversión. A continuación se compara con el propio original y con el modelo base, aunque este último no es una alternativa directa en la tarea de reemplazo de personaje.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| drbaph/Viggle-Animate-ComfyUI | 33.1B | Embedding fijo 362 tokens | MiniMax H3 Community | Safetensors, ComfyUI |
| Viggle/Viggle-Animate (original) | 33.1B | Embedding fijo 362 tokens | MiniMax H3 Community | Safetensors, Diffusers |
| MiniMax-H3 (base) | No disponible | No disponible | MiniMax H3 Community | Safetensors |

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License tiene condiciones específicas que deben revisarse antes de usar el modelo en un producto comercial; también afecta a las variantes convertidas y cuantizadas.
- El modelo no debe ejecutarse sobre personas sin su consentimiento explícito, y toda salida generada debe etiquetarse como generada por IA.
- No se han publicado benchmarks ni evaluaciones de rendimiento; el comportamiento en tareas concretas debe probarse localmente.
- El modelo solo es funcional en ComfyUI con el node pack ComfyUI-Viggle-Animate-H3 y la estructura de archivos especificada; no es un modelo autocontenido.
- La cuantización int8 puede introducir pérdida de calidad; la variante bf16 es la de mayor calidad pero requiere significativamente más VRAM.
- No soporta entrada de texto libre, tool calling ni generación de video con prompts de lenguaje; el condicionamiento es un embedding fijo.
- El tamaño del repositorio es de 210.7 GB, lo que implica una descarga masiva y un consumo considerable de espacio.
- Pueden aparecer artefactos visuales o alucinaciones en el video generado, especialmente en movimientos complejos o regiones ocluidas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/drbaph/Viggle-Animate-ComfyUI
- Modelo original: https://huggingface.co/Viggle/Viggle-Animate
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Node pack ComfyUI-Viggle-Animate-H3: https://github.com/Saganaki22/ComfyUI-Viggle-Animate-H3
- ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- Licencia MiniMax H3 Community License: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Ejemplo de peso pruned int8: https://huggingface.co/drbaph/Viggle-Animate-ComfyUI/resolve/main/diffusion_models/minimax_h3_ref2va_viggle_pruned_int8_convrot.safetensors
