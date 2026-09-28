# Nurymanau/Qwen-Image-2.1-Q4_K_M-MLX

## Resumen

Qwen-Image-2.1-Q4_K_M-MLX es un paquete experimental publicado por el usuario Nurymanau que permite ejecutar el modelo de generación de imágenes Qwen-Image-2.1 en Macs con Apple Silicon mediante MLX. No es un modelo nuevo ni un reentrenamiento: los pesos ya cuantizados por Unsloth en GGUF (Q4_K_M para el transformer de imagen y UD-Q4_K_XL para el text encoder Qwen3-VL-8B) se copian byte a byte y se reempaquetan en safetensors con kernels Metal propios. El repositorio ocupa 9,5 GB e incluye runner, verificador de integridad y ejemplos reproducibles.

El modelo subyacente, Qwen-Image-2.1, es un modelo unificado de generación texto-a-imagen y edición de imágenes de la familia Qwen, con un componente de generación visual de 7.000 millones de parámetros repartidos en 32 capas DiT single-stream. Esta ficha describe exclusivamente la variante MLX, y dentro de ella solo la ruta de generación texto-a-imagen, que es la única cualificada por el autor.

Su relevancia es práctica: permite inferencia local de un transformer de difusión de 7B en un portátil con 16 GB de memoria unificada, sin GPU dedicada ni conexión a servicios en la nube. El coste es doble: una licencia de investigación con restricción no comercial y un formato empaquetado propio que exige el runner incluido, ya que no funciona con el cargador estándar de MLX ni con el cargador de cuantización affine de MFLUX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de 32 capas single-stream para el componente de generación visual, con text encoder Qwen3-VL-8B; pipeline de difusión latente texto-a-imagen portado a MLX con clases de arquitectura de MFLUX y kernels Metal de mlx-kquant |
| Parámetros totales | 7.000 millones en el componente de generación visual, más el text encoder Qwen3-VL-8B. Los tensores de inferencia exportados suman 8.831.774.720 bytes (≈8,83 GB) antes de VAE, tokenizer y metadatos |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M para el transformer de imagen (origen Unsloth GGUF) y UD-Q4_K_XL para el text encoder; empaquetado U8 en safetensors con codecs GGUF mixtos. Otras cuantizaciones no están cualificadas |
| Idiomas soportados | en (único idioma declarado en la ficha). La cuantización de Unsloth del modelo base declara inglés y chino |
| Licencia | qwen-research (Qwen Research License Agreement) para el modelo de imagen, con restricción de uso no comercial para investigación y evaluación; el text encoder Qwen3-VL conserva Apache-2.0; el código adaptador tiene su propia licencia MIT, que no habilita el uso comercial del modelo de imagen |
| Formato de pesos | safetensors empaquetados y shardeados en formato packed propio, derivados de GGUF; VAE en vae.safetensors y tokenizer.json como activos separados sin modificar |

## Arquitectura y entrenamiento

Este repositorio no entrena nada. Los payloads de tensores son copias byte a byte de los ficheros GGUF fijados de Unsloth, sin reentrenamiento ni una segunda pasada de cuantización. Lo que aporta el autor es la capa de ejecución: mapeo exacto de tensores origen-MLX (incluidas las matrices fusionadas gate/up), soporte de codecs GGUF mixtos dentro de un pipeline de generación de imágenes en MLX, un text encoder en streaming por capas junto a un transformer de imagen residente, y kernels Metal empaquetados de mlx-kquant. Los pesos se distribuyen como safetensors shardeados sin pérdida, con hashes de origen y un verificador independiente de codecs y bloques.

El modelo base Qwen-Image-2.1 combina generación texto-a-imagen y edición en un único DiT de 7B con 32 capas single-stream, y en su lanzamiento recibió soporte desde el primer día en Diffusers, ComfyUI, vLLM-Omni, SGLang y LightX2V. El condicionamiento textual de este port lo aporta el text encoder Qwen3-VL-8B en su variante UD-Q4_K_XL; el head de logits no utilizado del encoder se excluye explícitamente del export. No se documenta en la información disponible ningún proceso de RLHF, DPO o ajuste por preferencias para esta variante, algo por otra parte ajeno a un modelo de difusión de estas características.

## Capacidades

- Generación de imágenes a partir de prompt de texto en inglés, en la configuración cualificada de 512 × 512 píxeles y 40 pasos de muestreo.
- Renderizado de rotulación y texto dentro de la imagen: el autor incluye el ejemplo `mlx-lettering-16.png` con texto exacto generado en 16 pasos.
- Fotografía de producto sintética: el ejemplo `product-40steps.png` documenta la generación de una imagen de producto a 40 pasos.
- Ejecución completamente local en Apple Silicon con memoria unificada, sin GPU dedicada ni llamadas a servicios externos.
- Gestión de memoria mediante VAE tiling (`--vae-tiling`), necesario para encajar la generación en 16 GB de memoria unificada.
- Verificación de integridad del artefacto: fichero `SHA256SUMS` con comprobación en macOS, hashes de origen y verificador propio de codecs y bloques.
- Reproducibilidad de la comparación con el GGUF original mediante benchmarks y ejemplos incluidos.
- No soporta tool calling ni function calling (no aplica a un modelo de difusión).
- No soporta flujos de agentes ni razonamiento multi-paso.
- No cualificado para edición de imágenes, LoRA, otras resoluciones, otras cuantizaciones ni otro hardware distinto del probado.

## Casos de uso

- Fotografía de producto para catálogos y documentación técnica: el modelo genera imágenes de producto a 512 × 512 en local, lo que permite iterar sobre variaciones de composición sin coste por llamada y sin subir material de producto a un servicio externo.
- Rotulación y lettering en piezas gráficas: los ejemplos del autor muestran texto legible dentro de la imagen (16 pasos), útil para carteles, mockups de packaging o pruebas de concepto tipográficas antes de pasar a producción con herramientas vectoriales.
- Prototipado de ilustraciones con material sensible: al ejecutarse íntegramente en el Mac, permite trabajar con descripciones internas de producto, nombres en clave o briefs bajo confidencialidad sin exponerlos a APIs de terceros.
- Investigación sobre cuantización post-entrenamiento: el paquete permite medir el impacto de Q4_K_M y UD-Q4_K_XL (frente a los GGUF de origen) sobre la calidad de imagen, con verificación de integridad y ejemplos reproducibles.
- Comparación de backends de inferencia: sirve como referencia para contrastar MLX con kernels Metal frente a llama.cpp u otras rutas que consumen el mismo GGUF de Unsloth, usando `benchmark.py` como arnés.
- Integración en aplicaciones de escritorio para Mac con lienzo o editor por nodos: el runner en Python y los pesos empaquetados se pueden envolver en una app nativa que ofrezca generación de assets sin backend remoto.
- Generación de assets en entornos aislados (air-gapped): al no requerir conexión tras la descarga, encaja en redes sin salida a internet donde no se pueden usar servicios de imagen alojados.
- Demostraciones y docencia en aulas con MacBooks: el requisito de 16 GB de memoria unificada y un único comando de generación hacen viable montar prácticas de difusión en hardware de estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio incluye `RESULTS.md`, `QUALITY.md` y `OPTIMIZATION.md`, que documentan mediciones, una comparación cualitativa de tres prompts frente al GGUF original y los intentos fallidos, pero no se han facilitado cifras concretas (FID, CLIP score, tiempo por imagen o throughput) en la información disponible, por lo que no se reproducen valores que no se puedan verificar.

## Requisitos de hardware

- Almacenamiento: 9,52 GB de pesos, más VAE, tokenizer, runner y dependencias del entorno.
- Memoria: probado en un MacBook Air M3 con 16 GB de memoria unificada generando a 512 × 512 con `--vae-tiling`. El autor advierte explícitamente de que una imagen completada en esa configuración no constituye una garantía universal de calidad, velocidad ni ausencia de swap.
- Plataforma: exclusivamente Apple Silicon. MLX no ofrece ruta CUDA ni ROCm, y no se ha probado en GPU Nvidia o AMD.
- GPU discretas: no aplica. No hay VRAM dedicada; el modelo consume memoria unificada del SoC.
- Gestión de memoria: el text encoder se ejecuta en streaming por capas mientras el transformer de imagen permanece residente, estrategia que rebaja el pico de memoria.
- Entorno probado: Python 3.11, MLX 0.32.1, mlx-kquant 0.4.13, arquitectura MFLUX 0.20.0 (commit `9ca480fd87fce5623e90878766c751d9140c4aa8`), macOS 26.6.2.
- Opciones de despliegue: el runner incluido (`generate.py` con `benchmark.py` como envoltorio). No es un modelo drop-in para el cargador estándar de MLX ni para el cargador de cuantización affine de MFLUX. Para otras plataformas, la alternativa documentada es el GGUF original de Unsloth (`qwen-image-2.1-Q4_K_M.gguf`) en llama.cpp o ComfyUI.
- Latencia y throughput: no disponible. Los ejemplos usan un timeout de 1800 segundos por ejecución y 40 pasos de muestreo, pero no se publican tiempos medidos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato y cuantización | Plataforma objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| Nurymanau/Qwen-Image-2.1-Q4_K_M-MLX | 7B (DiT, 32 capas single-stream) + text encoder Qwen3-VL-8B | safetensors empaquetados U8 (Q4_K_M + UD-Q4_K_XL) | Apple Silicon (MLX) | qwen-research (no comercial) | Port experimental, 0 descargas y 0 likes; exige runner propio |
| unsloth/Qwen-Image-2.1-GGUF | 7B + text encoder | GGUF Q4_K_M | llama.cpp, ComfyUI, multiplataforma | qwen-research | Fuente de la copia byte a byte; declara inglés y chino |
| Qwen/Qwen-Image-2.1 | 7B, 32 capas DiT single-stream | pesos originales del modelo base | Diffusers, ComfyUI, vLLM-Omni, SGLang, LightX2V | qwen-research | Modelo base unificado de generación y edición, con salida RGBA nativa y hasta 10 imágenes de referencia |
| themindstudio/Qwen-Image-2.1-MLX-4bit | 7B | MLX 4-bit | Apple Silicon (MLX), integrado en aplicación de escritorio | no disponible | Alternativa MLX en 4 bits con descarga e instalación desde la propia app |

## Limitaciones y advertencias

- Licencia restrictiva: el modelo de imagen se rige por el Qwen Research License Agreement, con restricción de uso no comercial para investigación y evaluación. Cualquier uso comercial exige una licencia upstream independiente.
- La licencia MIT del código adaptador no debe interpretarse como permiso para explotar comercialmente el modelo de imagen.
- Ámbito cualificado muy estrecho: solo generación texto-a-imagen. La edición de imágenes, el uso de LoRA, otras cuantizaciones, otras resoluciones y otro hardware quedan sin cualificar según el propio autor.
- Formato no interoperable: los pesos requieren kernels MLX personalizados y el runner incluido. Instalar MLX por sí solo, o cargar los ficheros con el cargador de cuantización affine estándar de MFLUX, no es suficiente.
- Evidencia empírica limitada a una única configuración: MacBook Air M3, 16 GB de memoria unificada, 512 × 512, 40 pasos. No hay garantía de funcionamiento sin swap en ese mismo equipo.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin validación independiente por parte de la comunidad.
- Idioma declarado: inglés. No hay evaluación multilingüe de esta variante.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión: texto deformado, anatomías incorrectas y desviaciones del prompt. No se publica ninguna evaluación de sesgos ni de seguridad para este port.
- Los recuentos automáticos de elementos de tensores en plataformas de hosting no deben interpretarse como número de parámetros lógicos: los tensores U8 empaquetados almacenan bytes comprimidos.
- El head de logits del encoder está excluido del export, lo que puede romper flujos que lo esperen.
- Dependencia de versiones fijadas (MLX 0.32.1, mlx-kquant 0.4.13, MFLUX en un commit concreto): actualizar cualquiera de ellas sin verificar puede invalidar el runner.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Nurymanau/Qwen-Image-2.1-Q4_K_M-MLX
- Licencia del modelo de imagen (MODEL-LICENSE): https://huggingface.co/Nurymanau/Qwen-Image-2.1-Q4_K_M-MLX/blob/main/MODEL-LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Cuantizaciones GGUF de Unsloth: https://huggingface.co/unsloth/Qwen-Image-2.1-GGUF
- Fichero GGUF Q4_K_M de origen: https://huggingface.co/unsloth/Qwen-Image-2.1-GGUF/blob/main/qwen-image-2.1-Q4_K_M.gguf
- Text encoder Qwen3-VL-8B-Instruct GGUF: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct-GGUF
- Repositorio oficial de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Recopilación Awesome Qwen-Image 2.1: https://github.com/wildminder/awesome-qwen-image/tree/main
- Repositorio MFLUX (commit fijado en las instrucciones): https://github.com/mflux-community/mflux
- Alternativa MLX en 4 bits: https://huggingface.co/themindstudio/Qwen-Image-2.1-MLX-4bit
- Ficha en Civitai: https://civitai.com/models/2954443/qwen-image-21
- Documentación interna del paquete (rutas relativas dentro del repositorio): `USAGE.md`, `RESULTS.md`, `QUALITY.md`, `OPTIMIZATION.md`, `NOTICE.md`
