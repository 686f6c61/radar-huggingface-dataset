# ML-Intern-lab/Qwen-Image-2.1-viewpoint-orbit-LoRA

## Resumen

Qwen-Image-2.1-viewpoint-orbit-LoRA es un adaptador LoRA de bajo rango (rank 32, alpha 32) entrenado sobre el modelo de difusión de imagen Qwen/Qwen-Image-2.1. Su función es acotada y muy específica: recibe una única imagen RGBA (con canal alfa y fondo transparente) de un objeto y una instrucción de cámara relativa, y devuelve ese mismo objeto renderizado desde el punto de vista solicitado, también en RGBA. Lo publica el usuario ML-Intern-lab y está pensado para orbitar objetos y generar vistas tipo "turntable" sin necesidad de reconstrucción 3D.

El adaptador se entrenó durante 2.000 pasos a 768 px con la herramienta ostris/ai-toolkit (arquitectura `qwen_image_2`, opción `rgba: true`), a un ritmo aproximado de 2,2 segundos por paso en una única A100 de 80 GB. El conjunto de entrenamiento son renders sintéticos de órbita de Google Scanned Objects, publicados junto al modelo en el dataset ML-Intern-lab/gso-orbit-rgba. El repositorio ocupa 1,1 GB y acumula 11 "likes" y 0 descargas en el momento de la consulta.

Su relevancia actual es doble. Por un lado, ataca un problema clásico de los pipelines de imagen: mantener la identidad de un objeto al cambiar de punto de vista, especialmente cuando hay que inventar las caras ocultas tras un giro de 90 grados. Por otro, lo hace preservando el canal alfa de extremo a extremo, ya que el VAE de Qwen-Image 2.1 es nativamente RGBA, lo que elimina el matting posterior en flujos de composición.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusión de Qwen-Image-2.1; arquitectura declarada en el entrenamiento: `qwen_image_2` |
| Parametros totales | no disponible (se trata de un adaptador LoRA; el repositorio ocupa 1,1 GB y no se publica el recuento de parametros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Rango y alpha del adaptador | rank 32 / alpha 32 |
| Longitud de contexto | no disponible (modelo de imagen); resolución de entrenamiento e inferencia verificada: 768 x 768 px |
| Tipos de cuantizacion | el modelo base se usa en bf16 sin cuantizar; no se documentan cuantizaciones del adaptador |
| Idiomas soportados | no disponible; las 23 instrucciones de entrenamiento están redactadas en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (`checkpoints/steps2000res768/orbit_alpha_lora_gate_up_split.safetensors` con claves estilo diffusers; `orbit_alpha_lora.safetensors` con claves estilo ComfyUI) |
| Modelo base | Qwen/Qwen-Image-2.1 (bf16, sin cuantizar) |
| Pasos de entrenamiento | 2.000 pasos a 768 px, ~2,2 s/paso en una A100-80GB |
| Dataset de entrenamiento | ML-Intern-lab/gso-orbit-rgba (1.844 pares, 23 instrucciones, 80-81 pares por instrucción) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 32 que se inyecta en el transformer de difusión del modelo base Qwen-Image-2.1. No modifica el VAE: la salida es RGBA porque el VAE de la versión 2.1 es nativamente RGBA, sin ningún paso de matting. El entrenamiento se realizó con ostris/ai-toolkit usando la arquitectura `qwen_image_2` y la bandera `rgba: true`, durante 2.000 pasos a 768 px. El checkpoint publicado (step-2000) se eligió comparando {500, 1000, 1500, 2000} sobre un subconjunto fijo de 48 ediciones: ganó en todas las métricas sin pérdida de alpha IoU, por lo que no hubo que asumir ningún compromiso entre métricas.

Los datos de entrenamiento son renders sintéticos de órbita generados a partir de Google Scanned Objects. El conjunto completo son 23 instrucciones con 80-81 pares cada una (1.844 pares en total), que cubren rotaciones de 45, 90, 135 y 180 grados (izquierda y derecha) en tres elevaciones (low angle, eye level, elevated), más la instrucción de conservar el ángulo de cámara y cambiar solo la elevación (aproximadamente el 20% de los pares). La gramática es cerrada: el acimut es relativo a la vista de origen (los objetos escaneados no tienen frente canónico) y la elevación es absoluta. Todas las instrucciones empiezan por el token `<orbit>`. En inferencia se añade la coletilla "The image has alpha channel and the background is transparent.", elegida por una prueba A/B sobre el modelo base que arrojó un alpha IoU de 0,830 con el sufijo frente a 0,798 sin él (sobre 10 pares). El archivo con claves estilo diffusers se verificó sin avisos de claves descartadas; el archivo original del entrenador usa claves estilo ComfyUI y descarta silenciosamente la rama `img_mlp.gate_up` (una proyección SwiGLU fusionada que diffusers almacena como dos lineales separadas).

## Capacidades

- Edición de punto de vista: a partir de una imagen RGBA de un objeto genera el mismo objeto desde otro ángulo, preservando el canal alfa en la salida.
- Control de cámara mediante gramática cerrada: rotaciones de 45, 90, 135 y 180 grados a izquierda y derecha, con elevaciones low angle, eye level y elevated.
- Cambio solo de elevación: instrucción `<orbit> keep the camera angle, {low angle|elevated}` para mantener el acimut y modificar únicamente la altura de cámara.
- Salida con transparencia de extremo a extremo: el fondo permanece transparente sin post-procesado de matting, gracias al VAE nativo RGBA del modelo base.
- Generalización fuera de dominio limitada y verificada: sobre 12 sujetos transparentes generados por texto a imagen (mascota de dibujos animados, zapatilla deportiva, sillón, robot de juguete, planta en maceta, personaje de videojuego, frasco de perfume, mochila, auriculares, taza de café, lámpara de escritorio y patito de goma), orbitados 7 vistas cada uno a eye level encadenando movimientos de 45 grados.
- Encadenamiento de ediciones: la generación de secuencias se hace siempre partiendo de la imagen original, nunca de una imagen ya generada.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning, audio, vídeo ni visión general; es un modelo de edición de imagen especializado.

## Casos de uso

- Catálogos de producto en comercio electrónico: partiendo de una única fotografía con fondo transparente, generar vistas a 45, 90, 135 y 180 grados para construir un turntable o una ficha con ángulos múltiples sin volver a fotografiar el producto.
- Fotografía de producto con composición posterior: como la salida conserva el canal alfa, las vistas generadas se pueden superponer directamente sobre fondos de diseño o plantillas de marketing sin recortes manuales ni matting.
- Previsualización de activos tras escaneo 3D: los escaneos de Google Scanned Objects son el dominio de entrenamiento, de modo que el adaptador encaja en flujos que digitalizan objetos físicos y necesitan vistas rápidas de control antes de un modelado o un renderizado completo.
- Coherencia de personajes e IP en ilustración: el chequeo fuera de dominio incluye mascotas de dibujos animados, personajes de videojuego y robots de juguete, lo que permite rotar un personaje ya generado por texto a imagen manteniendo su identidad visual entre vistas.
- Aumento de datos sintéticos para otros modelos: las órbitas generadas pueden alimentar el entrenamiento de modelos multivista, reconstrucción neuronal (NeRF, Gaussian Splatting) o modelos de consistencia 3D, partiendo de imágenes transparentes limpias.
- Automatización dentro de ComfyUI: el archivo con claves estilo ComfyUI (`orbit_alpha_lora.safetensors`) permite integrar el adaptador en grafos de nodos para generar secuencias de vistas de forma desatendida.
- Control de calidad y comparación de variantes: la ejecución a 40 pasos con `true_cfg_scale=1.0` sin CFG, la misma configuración con la que se evaluó el modelo, sirve como línea base reproducible para medir cambios en el pipeline.

## Benchmarks y rendimiento

Evaluación sobre 160 ediciones retenidas (40 objetos escaneados reales x 4 objetivos), 40 pasos de inferencia, 768 px y semilla fija por par, con métricas calculadas contra los renders reales (LPIPS y PSNR compuestos sobre gris medio):

| Configuracion | alpha IoU (mayor mejor) | LPIPS (menor mejor) | PSNR (mayor mejor) | Similitud DINOv2 (mayor mejor) |
|---|---|---|---|---|
| Modelo base, gramática simple ("rotate the camera 90 degrees to the right") | 0,727 | 0,097 | 21,74 | 0,714 |
| Modelo base, gramática `<orbit>` | 0,731 | 0,099 | 21,74 | 0,713 |
| Este LoRA (checkpoint step-2000) | 0,794 | 0,090 | 22,34 | 0,734 |

Desglose por tamaño de rotación (alpha IoU):

| Rotacion | alpha IoU del LoRA | Referencia del modelo base |
|---|---|---|
| 45 grados | 0,835 | no disponible en el material |
| 90 grados | 0,773 | ~0,67 (bucket más difícil: hay que inventar las caras ocultas) |
| 180 grados | 0,835 | no disponible en el material |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; no aplican a un adaptador de edición de imagen.

## Requisitos de hardware

- Entrenamiento documentado: una única A100 de 80 GB, a ~2,2 segundos por paso y 2.000 pasos (aproximadamente 73 minutos de cómputo puro).
- Inferencia: el modelo base se carga en bf16 sin cuantizar, por lo que la VRAM necesaria viene dominada por Qwen-Image-2.1, no por el LoRA; no se publica una cifra concreta de VRAM en la información disponible.
- GPU recomendadas: la referencia documentada es A100-80GB para entrenamiento; para inferencia no se especifican modelos concretos. No hay datos que confirmen que quepa en GPU de consumo (RTX 4090 y similares), dado que el modelo base se usa sin cuantizar.
- Configuración de inferencia verificada: 768 x 768 px, 40 pasos, `true_cfg_scale=1.0` (sin CFG), con `torch_dtype=torch.bfloat16` en CUDA.
- Despliegue: diffusers con `QwenImage21Pipeline` y `load_lora_weights` (probado contra el commit `0121a91f9d419ff7234c8a5923f82c244e6f1914`, con `transformers>=5.17`, `peft` y `torch 2.13+`); también hay un archivo con claves estilo ComfyUI. No se documentan opciones tipo vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput de inferencia: no disponibles en la información proporcionada. Solo se reporta el tiempo de entrenamiento por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto o resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-viewpoint-orbit-LoRA | LoRA de edición de punto de vista sobre Qwen-Image-2.1 | no disponible (rank 32, alpha 32; repo de 1,1 GB) | 768 x 768 px, salida RGBA | alpha IoU 0,794; LPIPS 0,090; PSNR 22,34; DINOv2 0,734 | no disponible | HuggingFace, 0 descargas, 11 likes |
| Qwen/Qwen-Image-2.1 (modelo base) | Transformer de difusión de imagen | no disponible | 768 x 768 px en esta evaluación, salida RGBA | alpha IoU 0,727-0,731; LPIPS 0,097-0,099; PSNR 21,74; DINOv2 0,713-0,714 | no disponible en el material | HuggingFace |
| Otros adaptadores de órbita o generación multivista (Zero123, SV3D y similares) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay datos comparativos verificados en la información proporcionada para modelos de terceros de la misma categoría; la única comparación cuantitativa disponible es contra el propio modelo base.

## Limitaciones y advertencias

- Riesgo de alucinación estructural: en giros grandes (especialmente 90 grados, el bucket con peor alpha IoU, 0,773) el modelo debe inventar las caras del objeto que no aparecen en la imagen de origen, por lo que la geometría y las texturas ocultas no están garantizadas.
- Gramática cerrada: solo se entrenó con 23 instrucciones exactas (rotaciones de 45, 90, 135 y 180 grados, tres elevaciones y la variante de solo elevación). Cualquier instrucción fuera de esa gramática, o cualquier ángulo intermedio, queda sin garantías.
- Alcance de dominio: el entrenamiento usó renders sintéticos de Google Scanned Objects. El único chequeo fuera de dominio son 12 sujetos generados por texto a imagen, orbitados a eye level; no se evaluaron otros niveles de elevación ni objetos con geometrías muy diferentes.
- Convención de coordenadas: el acimut es relativo a la vista de origen y la elevación es absoluta; asumir un "frente" canónico del objeto produce resultados incorrectos.
- Detalle de implementación crítico: hay que usar `orbit_alpha_lora_gate_up_split.safetensors` (claves estilo diffusers). El archivo con claves estilo ComfyUI descarta silenciosamente la rama `img_mlp.gate_up`, lo que degrada el adaptador sin avisar.
- Dependencias frágiles: la ruta de código verificada depende de un commit concreto de diffusers, `transformers>=5.17`, `peft` y `torch 2.13+`. Otras versiones no están verificadas.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial; conviene aclararlo con el autor antes de integrarlo en producción.
- Idiomas: no se documenta soporte multilingüe; los prompts de entrenamiento están en inglés y la coletilla de transparencia también, por lo que se recomienda promptear en inglés.
- Adopción mínima: 0 descargas y 11 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Requisitos de VRAM no documentados para inferencia, con un modelo base que se usa en bf16 sin cuantizar; desplegarlo en GPU de consumo no está confirmado.
- No se documentan capacidades de texto, razonamiento, código, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ML-Intern-lab/Qwen-Image-2.1-viewpoint-orbit-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de entrenamiento y evaluaciones: https://huggingface.co/datasets/ML-Intern-lab/gso-orbit-rgba
- Demo en Space: https://huggingface.co/spaces/ML-Intern-lab/Qwen-Image-2.1-viewpoint-orbit-LoRA
- Herramienta de entrenamiento: https://github.com/ostris/ai-toolkit
- Ejemplo de turntable fuera de dominio (zapatilla): https://huggingface.co/datasets/ML-Intern-lab/gso-orbit-rgba/blob/main/eval/ood/turntable_sneaker.gif
- Ejemplo de turntable fuera de dominio (robot de juguete): https://huggingface.co/datasets/ML-Intern-lab/gso-orbit-rgba/blob/main/eval/ood/turntable_robot_toy.gif
