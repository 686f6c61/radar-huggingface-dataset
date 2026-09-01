# JoaoZaokk/Beyond-Reality-Z-Image-v2-W4A4-ConvRot

## Resumen

Beyond-Reality-Z-Image-v2-W4A4-ConvRot es una versión cuantizada del fine-tune Beyond_Reality Z-Image v2, desarrollada por JoaoZaokk sobre el modelo base Tongyi-MAI/Z-Image-Turbo. El objetivo principal es reducir el peso del modelo de 11,46 GiB (BF16) a aproximadamente 3 GiB mediante cuantización INT4/INT8, manteniendo una calidad visual aceptable y acelerando la inferencia. Se distribuye en formato safetensors de un solo archivo, diseñado específicamente para ComfyUI, con dos variantes: una pura W4A4 (170 capas cuantizadas a 4 bits) y una mixta (115 capas a 4 bits y 55 a 8 bits).

La relevancia de este modelo radica en que demuestra que la cuantización 4 bits puede funcionar correctamente en modelos de difusión, algo que no ocurre con otros modelos como HunyuanVideo 1.5, donde el mismo formato degrada gravemente la salida. El autor ha realizado una verificación rigurosa del proceso de cuantización, incluyendo el remapeo de nombres de módulos para ComfyUI y la comprobación de que no se producen llamadas de dequantización durante la inferencia. El modelo tiene aproximadamente 6 mil millones de parámetros y está licenciado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (Z-Image Turbo, basado en Tongyi-MAI) |
| Parametros totales | ~6 B (estimado, no confirmado exactamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (text-to-image); resolución de salida probada: 1024×1024 |
| Tipos de cuantizacion | convrot_w4a4 (INT4 puro) y asym_w4a8_int8 (mixto) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (single-file, ComfyUI-native) |

## Arquitectura y entrenamiento

El modelo base es Z-Image Turbo, un diffusion transformer de Tongyi-MAI. Sobre él, el autor Nurburgring aplicó un fine-tune con fusión de pesos LoRA para crear Beyond_Reality Z-Image v2, enfocado en alta claridad y estética visual, especialmente en retratos y fotografía. La cuantización posterior se realizó con la herramienta comfy-kitchen 0.2.31, que convierte los pesos a formatos INT4/INT8 con grupos de tamaño 256 (convrot_groupsize). El proceso incluye un remapeo de los nombres de los módulos desde la nomenclatura de diffusers a la de ComfyUI, necesario porque ComfyUI fusiona las proyecciones q, k, v en un solo tensor qkv durante la carga. La verificación confirma que los 340 módulos cuantizados se despachan correctamente al backend CUDA sin llamadas de dequantización.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con alta fidelidad y estética mejorada respecto al modelo base.
- Soporte nativo para ComfyUI, incluyendo carga directa de archivos safetensors cuantizados.
- Cuantización eficiente que reduce el tamaño del modelo en un 73% (de 11,46 GiB a ~3 GiB) y acelera la inferencia entre 1,83x y 1,93x por paso en RTX 3090.
- Dos variantes de cuantización: W4A4 puro (más rápido y pequeño) y mixto (más cercano al latente de referencia).
- Compatibilidad con hardware Ampere y Ada (RTX 30xx y 40xx) para INT4 nativo; Hopper y Blackwell usan una rama INT8.
- Preservación byte a byte de los tensores no cuantizados respecto al modelo fuente.

## Casos de uso

- Generación de imágenes en producción con requisitos de memoria reducidos: el modelo cuantizado ocupa ~3 GiB, lo que permite ejecutarlo en GPUs con 8 GB de VRAM o menos, facilitando el despliegue en entornos con recursos limitados.
- Integración en pipelines de ComfyUI para flujos de trabajo de diseño gráfico y creación de contenido visual, aprovechando la compatibilidad nativa con el ecosistema de nodos.
- Prototipado rápido de generación de imágenes en entornos de investigación, donde la velocidad de inferencia (0,585 s/paso) permite iterar sobre prompts y parámetros sin esperas largas.
- Generación de retratos y fotografía artística de alta calidad, gracias al fine-tune Beyond_Reality que prioriza texturas de alta frecuencia como poros de piel y tejidos.
- Evaluación de técnicas de cuantización en modelos de difusión: el repositorio incluye un benchmark completo (comfy-quant-bench) que permite comparar el comportamiento de diferentes arquitecturas bajo cuantización 4-bit.
- Despliegue en servicios de generación de imágenes bajo demanda, donde la reducción de VRAM y el aumento de velocidad por paso se traducen en menor coste por imagen generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de generación de imágenes, no de texto. La model card proporciona métricas específicas de cuantización y rendimiento:

| Metrica | Valor W4A4 puro | Valor mixto |
|---|---|---|
| Error efectivo mediano | No medido | 0,1241 |
| Divergencia latente | 0,7854 | 0,7216 |
| Tiempo por paso (RTX 3090, 1024×1024) | 0,585 s | 0,637 s |
| Tamaño del archivo | 3,06 GiB | 3,18 GiB |

La velocidad por paso es 1,83x–1,93x superior a la del modelo BF16 original. La divergencia latente es una distancia, no un veredicto de calidad: en HunyuanVideo, 0,8255 resultó inutilizable mientras que 0,7173 fue aceptable, por lo que no existe un umbral universal.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo cuantizado pesa ~3 GiB, pero se recomienda al menos 6-8 GB de VRAM para el proceso de muestreo completo (activaciones, buffers, etc.).
- GPU recomendada: RTX 3090 (usada en las pruebas), cualquier GPU Ampere (sm_86) o Ada (sm_89) para INT4 nativo. Hopper y Blackwell usan una rama INT8 deliberadamente.
- No cabe en GPUs consumer de gama baja (menos de 6 GB) sin cuantización adicional o reducción de resolución.
- Opciones de despliegue: ComfyUI (compatible con carga directa de safetensors), no compatible con diffusers directamente debido al remapeo de nombres de módulos.
- Latencia y throughput: 0,585 s/paso en RTX 3090 a 1024×1024 con 8 pasos, lo que da un tiempo total de ~4,7 s por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tamaño | Velocidad (s/paso) | Licencia |
|---|---|---|---|---|---|
| Beyond-Reality-Z-Image-v2-W4A4-ConvRot (este) | ~6 B | INT4/INT8 cuantizado | 3,06 GiB | 0,585 | Apache-2.0 |
| Beyond_Reality Z-Image v2 (BF16 original) | ~6 B | BF16 | 11,46 GiB | ~1,1 (estimado) | Apache-2.0 |
| HunyuanVideo 1.5 cuantizado (W4A4) | ~13 B | INT4 | no disponible | más lento que BF16 | no disponible |

La comparación con HunyuanVideo 1.5 muestra que la tolerancia al error de cuantización varía según la arquitectura: Z-Image tolera un error efectivo de 0,1241, mientras que HunyuanVideo tolera 0,1837. No hay otros modelos comparables de la misma categoría (diffusion transformer cuantizado para text-to-image) con datos públicos.

## Limitaciones y advertencias

- Solo soporta inglés como idioma de entrada para los prompts; no se ha probado con otros idiomas.
- No es compatible con la librería diffusers; requiere ComfyUI para cargar los archivos correctamente.
- La cuantización puede degradar la calidad en algunos casos; el autor advierte que no se debe comparar dos cuantizaciones usando imágenes generadas libremente, ya que a 8 pasos pequeñas perturbaciones redirigen el muestreador y la comparación mide caos, no fidelidad.
- El límite superior de error tolerado no ha sido medido para este modelo; solo se sabe que 0,1241 funciona y que W4A4 puro también funciona.
- El remapeo de nombres de módulos es crítico: si se carga sin el remapeo, los tensores weight_scale y comfy_quant pasarían sin renombrar y la capa se cargaría sin escala, sin error aparente.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base (Tongyi-MAI/Z-Image-Turbo) y del fine-tune original (Nurburgring/BEYOND_REALITY_Z_IMAGE) para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoZaokk/Beyond-Reality-Z-Image-v2-W4A4-ConvRot
- Repositorio de benchmark y herramientas: https://github.com/JoaoZaokk/comfy-quant-bench
- Modelo original (fine-tune): https://huggingface.co/Nurburgring/BEYOND_REALITY_Z_IMAGE
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Página de Z-Image: https://z-image.me/en
