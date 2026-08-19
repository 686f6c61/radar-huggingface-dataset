# Comfy-Org/HiDream-I1_ComfyUI

## Resumen

HiDream-I1 es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por HiDream-ai y publicado el 7 de abril de 2025. Con 17.000 millones de parámetros, se distribuye bajo licencia MIT, lo que permite su uso en proyectos personales, investigación científica y aplicaciones comerciales. El repositorio Comfy-Org/HiDream-I1_ComfyUI no contiene el modelo original, sino un reempaquetado de sus pesos y componentes auxiliares (text encoders y VAE) preparado para su uso directo en ComfyUI, el popular entorno de generación de imágenes por nodos.

El repositorio incluye múltiples variantes del modelo: HiDream-I1-Dev (versión de desarrollo), HiDream-I1-Fast (optimizada para velocidad), HiDream-I1-Full (versión completa) y las variantes E1-1 y E1-Full (anteriores o alternativas). Además, ofrece cuantizaciones en BF16, FP16 y FP8, lo que permite ajustar el consumo de memoria según el hardware disponible. Su relevancia actual radica en que es uno de los pocos modelos de texto a imagen de gran tamaño con licencia permisiva y soporte nativo en ComfyUI, lo que facilita su adopción tanto en entornos de investigación como en flujos de producción creativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para texto a imagen) |
| Parametros totales | 17.000 millones (17B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica directamente; depende del text encoder) |
| Tipos de cuantizacion | BF16, FP16, FP8 (según archivos incluidos) |
| Idiomas soportados | no disponible (probablemente multilingüe, pero no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en los datos proporcionados. Se sabe que es un modelo de difusión para generación de imágenes a partir de texto, con 17.000 millones de parámetros, y que existen varias variantes (Dev, Fast, Full, E1) que probablemente difieren en el número de pasos de inferencia, la calidad y la velocidad. El repositorio de Comfy-Org se limita a empaquetar los pesos en formato safetensors y a organizar los componentes necesarios para su ejecución en ComfyUI.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo incluye varios text encoders: CLIP-L, CLIP-G, T5-XXL y Llama 3.1 8B instruct (este último en versión FP8), lo que sugiere que el sistema de codificación de texto es híbrido y combina representaciones de distintos niveles semánticos. La presencia de Llama 3.1 como encoder adicional es una innovación notable, ya que permite una mejor comprensión de instrucciones complejas en lenguaje natural.

## Capacidades

- Generación de imágenes fotorrealistas o artísticas a partir de descripciones textuales (text-to-image).
- Soporte nativo en ComfyUI, lo que permite construir flujos de trabajo visuales mediante nodos.
- Múltiples variantes del modelo para equilibrar velocidad y calidad: Dev (desarrollo), Fast (rápido) y Full (completo).
- Cuantizaciones FP8 y BF16 para adaptarse a distintos requisitos de memoria.
- Incluye text encoders avanzados (T5-XXL y Llama 3.1 8B) que mejoran la adherencia al prompt y la comprensión de instrucciones complejas.
- Capacidad de uso comercial gracias a la licencia MIT.

## Casos de uso

- Generación de concept art y storyboards: el modelo permite crear imágenes de alta calidad a partir de descripciones detalladas, útil para preproducción en cine, animación y videojuegos. La variante Fast acelera la iteración durante la fase de exploración creativa.
- Creación de assets para diseño gráfico y publicidad: con la licencia MIT, las imágenes generadas pueden utilizarse en campañas comerciales sin restricciones de atribución, lo que reduce costes en la producción de materiales visuales.
- Prototipado rápido en diseño de producto: los diseñadores pueden generar múltiples variaciones de un concepto (color, textura, entorno) en minutos, gracias a la integración con ComfyUI y a la variante Fast.
- Investigación en generación de imágenes: el acceso a los pesos completos y a la arquitectura (a través de los repositorios originales de HiDream-ai) permite estudiar el comportamiento del modelo, compararlo con otros sistemas y desarrollar técnicas de ajuste fino.
- Generación de imágenes para documentación técnica y educativa: ilustraciones de diagramas, ejemplos visuales o esquemas explicativos pueden generarse automáticamente a partir de texto, acelerando la elaboración de manuales y cursos.
- Integración en pipelines de automatización creativa: mediante ComfyUI y su API, es posible integrar el modelo en sistemas de generación masiva de imágenes (por ejemplo, para catálogos de productos o bancos de imágenes), aprovechando la cuantización FP8 para reducir el coste de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos comparativos de métricas como FID, CLIP score o preferencia humana frente a otros modelos de texto a imagen.

## Requisitos de hardware

- El modelo tiene 17.000 millones de parámetros. En BF16, solo los pesos del modelo ocupan aproximadamente 34 GB de VRAM. En FP8, se reducen a unos 17 GB.
- Además del modelo de difusión, hay que cargar los text encoders: Llama 3.1 8B (en FP8, ~8 GB), T5-XXL (en FP8, ~10 GB) y los CLIP (juntos ~2 GB). El VAE añade unos 200 MB.
- Para ejecutar la variante Full en BF16 con todos los encoders, se necesitan al menos 50 GB de VRAM. Con cuantización FP8 en todo, el requisito baja a unos 30 GB, lo que permite usar GPUs como la RTX 4090 (24 GB) si se utiliza la variante Dev o Fast y se descargan algunos encoders.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB, con FP8), RTX 6000 Ada (48 GB). No se recomienda su uso en GPUs de consumo con menos de 24 GB de VRAM.
- Opciones de despliegue: ComfyUI es el entorno principal. También puede ejecutarse mediante la API de ComfyUI o exportando los pesos a otros formatos (aunque no se proporcionan en este repositorio). No se mencionan integraciones con vLLM, llama.cpp u otros servidores de inferencia, ya que es un modelo de difusión, no un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Cuantizaciones | Contexto / Extras |
|---|---|---|---|---|
| HiDream-I1 (este repo) | 17B | MIT | BF16, FP16, FP8 | Text encoders: CLIP-L, CLIP-G, T5-XXL, Llama 3.1 8B |
| Stable Diffusion XL | 3.5B | CreativeML Open RAIL++-M | FP16, FP8 | Text encoder: CLIP ViT-L, OpenCLIP ViT-bigG |
| FLUX.1 [dev] | 12B | FLUX.1 [dev] Non-Commercial License | FP8, BF16 | Text encoder: T5-XXL, CLIP |
| FLUX.1 [schnell] | 12B | Apache 2.0 | FP8, BF16 | Text encoder: T5-XXL, CLIP |

HiDream-I1 destaca por su mayor número de parámetros (17B frente a 12B de FLUX y 3.5B de SDXL) y por su licencia MIT, que es más permisiva que la de FLUX.1 [dev] (no comercial) y que la de SDXL (requiere atribución y tiene restricciones de uso). La inclusión de Llama 3.1 como text encoder es una diferencia arquitectónica frente a los otros modelos, que usan únicamente CLIP y T5.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgo de alucinación visual o limitaciones idiomáticas específicas. Es necesario consultar la documentación oficial de HiDream-ai para obtener una evaluación completa.
- El repositorio es un reempaquetado técnico para ComfyUI; no incluye el código de entrenamiento ni los detalles de la arquitectura original. Para fines de investigación avanzada, se debe acceder a los repositorios originales de HiDream-ai.
- El tamaño del modelo (17B) y la necesidad de múltiples text encoders implican requisitos de hardware elevados. En GPUs de consumo (menos de 24 GB VRAM) no es viable sin cuantización agresiva y sacrificando calidad.
- La licencia MIT cubre el uso del modelo, pero es recomendable verificar si los pesos originales o los text encoders (por ejemplo, Llama 3.1, que tiene su propia licencia) imponen restricciones adicionales. Llama 3.1 está bajo la licencia de Meta, que permite uso comercial pero con condiciones específicas.
- No se han publicado benchmarks oficiales, por lo que la comparación objetiva con otros modelos de texto a imagen es limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/HiDream-I1_ComfyUI
- Guía de ejemplo en ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/hidream/
- Tutorial de ComfyUI Docs: https://docs.comfy.org/tutorials/image/hidream/hidream-i1
- Blog de Comfy sobre soporte nativo: https://blog.comfy.org/p/hidream-i1-native-support-in-comfyui
- Repositorios originales de HiDream-ai:
  - https://huggingface.co/HiDream-ai/HiDream-E1-1
  - https://huggingface.co/HiDream-ai/HiDream-E1-Full
  - https://huggingface.co/HiDream-ai/HiDream-I1-Dev
  - https://huggingface.co/HiDream-ai/HiDream-I1-Fast
  - https://huggingface.co/HiDream-ai/HiDream-I1-Full
