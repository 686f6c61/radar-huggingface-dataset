# IgorAherne/spellcast3d-marigold-albedo-qwen-image-2.1

## Resumen

Spellcast3D Albedo es un adaptador (LoRA más un decodificador VAE afinado) construido sobre el transformer de Qwen-Image 2.1 Turbo, un modelo de difusión de 7.000 millones de parámetros orientado a la edición y generación de imágenes. Lo desarrolla Igor Aherne como componente del proyecto Spellcast3D, un pipeline local y gratuito que genera props 3D. El problema que resuelve es concreto: cuando varias vistas pintadas por IA se proyectan sobre una malla 3D, la iluminación horneada en cada vista hace visibles las costuras entre proyecciones. Este modelo convierte cada imagen en su albedo (color base sin sombreado), de modo que cualquier motor de juego puede volver a iluminarla de forma coherente.

Técnicamente no es un modelo generativo de texto a imagen, sino un estimador determinista de desiluminación: recibe una imagen RGB, la codifica con el VAE de Qwen-Image 2.1, aplica una única pasada del transformer con un embedding de prompt fijo y decodifica el latente resultante con un decodificador VAE afinado. No requiere codificador de texto en inferencia ni muestreo iterativo, lo que lo hace muy barato por imagen.

Es relevante ahora porque reproduce la receta Marigold V2 de albedo con un transformer de 7B en lugar del modelo de 20B usado en la receta original, y lo supera en el split de test de Hypersim (21,47 dB PSNR frente a 20,78 dB). Su licencia, sin embargo, es estrictamente de investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión Qwen-Image 2.1 Turbo (7B) más decodificador VAE afinado |
| Parametros totales | No disponible (el LoRA tiene rango 128 y alpha 128 sobre 229 capas; el transformer base es de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (prompt fijo de 38 tokens, sin codificador de texto en inferencia) |
| Tipos de cuantizacion | Base en NF4 durante entrenamiento; LoRA y decodificador en bf16; salida en 8 bits con gamma 2.2 |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | Qwen Research License Agreement (qwen-research): solo uso no comercial, investigación y evaluación |
| Formato de pesos | safetensors (LoRA de 684 MB, VAE de 518 MB, condicionamiento de prompt) |
| Tamano del repo | 1,2 GB |
| Resolucion de entrenamiento | Hasta 1024 px; lados múltiplos de 32 px |
| Timestep de inferencia | 0,498046875 (0,499 en bf16) |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (rank 128, alpha 128) aplicado a 229 capas del transformer de Qwen-Image 2.1 Turbo, acompañado de una copia afinada del decodificador VAE de Qwen-Image 2.1 (el codificador se reutiliza sin cambios). La inferencia es de una sola pasada: se codifica la imagen RGB en [-1, 1] con un canal alfa de 1, se normaliza el latente con la media y desviación del VAE, se ejecuta el transformer sin ruido añadido en el timestep 0,498 con un embedding de prompt fijo de 38 tokens (sin codificador de texto ni imágenes de referencia), y se resta la velocidad predicha al latente antes de decodificar y recortar a [-1, 1]. La salida se convierte a albedo lineal en [0, 1] mediante `(x + 1) / 2`.

El entrenamiento siguió la receta Marigold V2 de albedo con datos mezclados 50/50 por paso: escenas interiores de Hypersim a su resolución nativa de 1024x768 y 6.208 objetos de Arb-Objaverse (solo con licencia CC-BY o CC0, 12 vistas por 7 iluminaciones, renders de 512 px escalados a 512, 768 o 1024 px, con la codificación Filmic de Blender revertida). La función de pérdida combina L1 enmascarada sobre albedo lineal más 0,2 veces una pérdida espacial DINOv3 (DINOv3 congelado, usado solo como pérdida, sin pesos incluidos). Se entrenó durante 30.000 pasos con batch 1, AdamW de 8 bits, tasa de aprendizaje 5e-5 con 200 pasos de calentamiento y decaimiento lineal hasta 5e-6 en el paso 20.000, con el transformer base en NF4 y el LoRA y el decodificador en bf16, en una única RTX 5090 durante 14 horas. La validación se mantuvo plana en los últimos 10.000 pasos. Según el autor, aplicado sobre el Qwen-Image 2.1 completo (no Turbo) produce prácticamente el mismo resultado, con 36-45 dB PSNR entre ambos en vistas de objetos a 1024 px.

## Capacidades

- Estimación de albedo (desiluminación) a partir de una única imagen RGB, en una sola pasada del transformer.
- Extracción del color base apto para reiluminación en motores de juego, sin horneado de luz.
- Funcionamiento sin codificador de texto: el condicionamiento es un tensor fijo de 38 tokens válidos.
- Inferencia determinista sin muestreo iterativo ni ruido añadido.
- Integración en el pipeline Spellcast3D como etapa SuperTexture, aplicada a cada vista pintada antes de proyectarla.
- Ejecución en stable-diffusion.cpp mediante el fork del autor (`sd-cli --mode albedo` o `sd_albedo()` en su API C).
- Aplicación del LoRA en tiempo de ejecución sobre el modelo base; el autor advierte que fusionarlo en un modelo de 4 bits lo redondearía a cero.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general ni audio: es una tarea de imagen a imagen especializada.

## Casos de uso

- Texturizado multi-vista de props 3D: se aplica el modelo a cada vista pintada por IA antes de proyectarla sobre la malla, eliminando las costuras de iluminación entre proyecciones y permitiendo que el motor ilumine la malla de forma coherente. Es el caso para el que se diseñó, integrado en la etapa SuperTexture de Spellcast3D.
- Preparación de assets para motores de juego: el albedo resultante se puede reiluminar con cualquier sistema de iluminación dinámica (Unity, Unreal, Godot) sin arrastrar la luz horneada de la imagen original.
- Limpieza de texturas escaneadas o generadas por IA: conversión de fotografías o renders con sombreado fuerte en mapas de color base para pipelines de material PBR.
- Generación de datasets de albedo: uso del modelo para producir pares imagen-albedo a escala en investigación sobre descomposición intrínseca, con la salvedad de la licencia no comercial.
- Prototipado rápido en local: al ejecutarse en stable-diffusion.cpp con el fork del autor y caber en una GPU de consumo, permite iterar sobre texturizado 3D sin servicios en la nube.
- Evaluación comparativa de recetas de desiluminación: sirve como referencia de 7B frente a la receta Marigold V2 original de 20B sobre el split de test de Hypersim.

## Benchmarks y rendimiento

| Modelo | Hypersim IID test: PSNR / SSIM / LPIPS |
|---|---|
| Marigold V2 albedo (Qwen-Image-Edit-2509, 20B) | 20,78 / 0,811 / 0,195 |
| Este adaptador (Qwen-Image 2.1 Turbo, 7B) | 21,47 / 0,834 / 0,167 |

Ambos evaluados con el script de puntuación de Marigold V2 a resolución nativa de 1024x768; el adaptador sobre cada quinto fotograma del split de test (1.048 fotogramas de 43 de las 44 escenas). En objetos retenidos de Arb-Objaverse (split por objeto): 22,2 dB PSNR. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo ocupa 1,2 GB (LoRA 684 MB, VAE 518 MB, condicionamiento); el transformer base de Qwen-Image 2.1 Turbo debe cargarse aparte y, en NF4 como durante el entrenamiento, requiere del orden de varios GB adicionales.
- GPU de entrenamiento documentada: una RTX 5090, 14 horas para 30.000 pasos con batch 1.
- GPU recomendadas: no disponibles. Por el tamaño del adaptador y el uso de NF4 en el base, es plausible su ejecución en GPU de consumo, pero el autor no publica cifras de VRAM ni de latencia.
- Despliegue: stable-diffusion.cpp mediante el fork del autor (`sd-cli --mode albedo`, con `--albedo-lora`, `--albedo-condition` y `--albedo-decoder`), o aplicación manual del LoRA en tiempo de ejecución con diffusers siguiendo los cuatro pasos de la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; al ser una sola pasada del transformer sin muestreo iterativo, el coste por imagen es sustancialmente menor que el de un modelo de difusión completo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | PSNR en Hypersim | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spellcast3D Albedo (este) | 7B (base) + LoRA | Albedo / desiluminación | 21,47 | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Marigold V2 albedo (Qwen-Image-Edit-2509) | 20B | Albedo / desiluminación | 20,78 | No disponible en la información | Hugging Face (Comfy-Org/marigold-v2-0) y ComfyUI |
| Marigold V2 depth / normal | No disponible | Profundidad y normales | No aplica | No disponible en la información | Hugging Face (Comfy-Org/marigold-v2-0) y ComfyUI |

La comparación directa solo es posible con la receta Marigold V2 de albedo, que comparte metodología de evaluación. Los modelos de profundidad y normales de Marigold V2 resuelven tareas distintas y no son intercambiables, aunque formen parte de la misma familia.

## Limitaciones y advertencias

- El fondo no está supervisado: hay que usar la máscara del objeto, ya que el fondo sale oscuro con una franja fina en las siluetas.
- Los metales oscuros y brillantes pueden salir más claros que su color base real.
- A partir de una sola imagen el modelo no siempre distingue el color propio del objeto de una luz tintada; el autor documenta una dispersión de saturación de 0,48-0,71 entre vistas de una mochila verde frente a 0,70-0,79 en las vistas pintadas. Como mitigación propone conservar el color de entrada y tomar solo la luminancia del albedo en luz lineal (`input * luminance(albedo) / luminance(input)`).
- Aproximadamente el 1-2 % de los datos de entrenamiento de objetos presentaba algún problema según la model card, que queda truncada en ese punto.
- Licencia Qwen Research: solo permite uso y derivados con fines no comerciales (investigación o evaluación). El uso comercial exige una licencia separada de Qwen. La afirmación pública de Qwen de que las salidas generadas pertenecen al usuario no forma parte del acuerdo de licencia.
- Los lados de la imagen deben ser múltiplos de 32 px; el entrenamiento se hizo hasta 1024 px.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible; al ser un modelo de imagen, los sesgos relevantes serían los de los datos de Hypersim y Arb-Objaverse, no evaluados en la model card.
- El modelo no procesa texto ni mantiene conversación, por lo que no aplican limitaciones de contexto o idioma en el sentido habitual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IgorAherne/spellcast3d-marigold-albedo-qwen-image-2.1
- Proyecto Spellcast3D: https://github.com/IgorAherne/spellcast3d
- Marigold V2 (receta original): https://github.com/huawei-bayerlab/marigold-v2
- Código de entrenamiento (rama `spellcast3d`): https://github.com/IgorAherne/marigold-v2
- Fork de stable-diffusion.cpp: https://github.com/IgorAherne/stable-diffusion.cpp
- Marigold V2 en ComfyUI (guía): https://docs.comfy.org/tutorials/utility/marigold-v2
- Comfy-Org/marigold-v2-0: https://huggingface.co/Comfy-Org/marigold-v2-0
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Dataset Hypersim relative depth: https://huggingface.co/datasets/obukhovai/hypersim_relative_depth
- Dataset Arb-Objaverse: https://huggingface.co/datasets/lizb6626/Arb-Objaverse
