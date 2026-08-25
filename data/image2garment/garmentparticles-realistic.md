# image2garment/GarmentParticles-Realistic

## Resumen

GarmentParticles-Realistic es un conjunto de checkpoints afinados del modelo Garment Particles, desarrollado por el equipo de image2garment, que aborda la generación de prendas de vestir tridimensionales listas para simulación a partir de imágenes. El modelo se compone de dos etapas: una primera etapa de generación de partículas de prenda (PGF) mediante flow matching condicionado por imagen y texto, y una segunda etapa de reconstrucción de bordes y patrones de costura. Su relevancia radica en que permite obtener geometría de prenda y parámetros físicos de forma directa desde una única imagen, sin optimización iterativa, lo que lo convierte en una herramienta práctica para aplicaciones de diseño, e-commerce y animación.

El sistema se basa en una arquitectura de dos difusores: el Stage 1 utiliza un SparseLightningDiT con 28 capas y atención con QK-Norm, mientras que el Stage 2 emplea un LightningCrossAttnDiT de 24 capas con RoPE y FlashAttention-2. El modelo fue entrenado durante 35 000 pasos en 16 GPUs NVIDIA H100 con PyTorch FSDP2 sobre un conjunto de 46 119 prendas realistas generadas con GPT Image 2. El repositorio incluye dos checkpoints de la primera etapa (pasos 30 000 y 35 000) y el modelo de bordes de la segunda etapa, con un tamaño total de 40,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SparseLightningDiTV3CrossAttnVarlenImgTextV2 (Stage 1) y LightningCrossAttnDiTV3EdgeModelVarlen (Stage 2) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de texto; entrada por imagen y texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (16 shards en Stage 1, 8 shards en Stage 2) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusión en dos etapas. La primera etapa (PGF) utiliza un transformador de difusión (DiT) con 28 capas, dimensión oculta de 1152 y 16 cabezas de atención, incorpora QK-Norm y acondicionamiento cruzado mediante un codificador de imagen DINOv2-Large y texto CLIP. La segunda etapa (Edge Model) usa un DiT de 24 capas con dimensión oculta de 1024, 16 cabezas, RoPE, RMSNorm y SwiGLU, además de FlashAttention-2, para reconstruir 37 paneles y 38 curvas de costura. El entrenamiento se realizó con flow matching de velocidad sobre 46 119 prendas realistas generadas con GPT Image 2, durante 35 000 pasos en 16 H100 con FSDP2. La pérdida de validación descendió de 0,8781 (paso 5 000) a 0,6131 (paso 35 000), una reducción del 30,2 %, lo que indica convergencia del modelo.

## Capacidades

- Generación de prendas 3D completas a partir de una imagen realista, incluyendo geometría de malla y parámetros físicos.
- Reconstrucción de patrones de costura y bordes de la prenda.
- Condicionamiento por imagen y texto, con soporte para imágenes frontales y múltiples captions.
- Salida lista para simulación física, ya que el modelo predice tanto la geometría como los parámetros necesarios para animar la prenda.
- Sin soporte de tool calling, agentes ni razonamiento de múltiples pasos; es un modelo de generación específica para dominio textil.
- No se especifican capacidades multilingües; el texto se procesa mediante CLIP, pero no se detallan idiomas.

## Casos de uso

- Diseño de moda virtual: los diseñadores pueden crear variaciones de prendas a partir de bocetos o imágenes reales y obtener modelos 3D listos para renderizado y simulación.
- E-commerce de moda: generar modelos 3D de prendas para visualización interactiva en tiendas online, mejorando la experiencia de compra con vistas 360° y pruebas virtuales.
- Animación y VFX: producción de vestuario para personajes digitales en películas, videojuegos o publicidad, donde se requiere simulación física realista.
- Prototipado rápido en patronaje: los patrones de costura generados pueden servir como base para fabricación física o para revisión de diseño antes de la producción.
- Archivo y digitalización de vestuario: convertir fotografías de prendas existentes en modelos digitales reutilizables para museos, colecciones o inventarios.
- Generación de datos sintéticos: alimentar simuladores de robótica o sistemas de visión por computador con prendas realistas en entornos virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible. El único dato cuantitativo proporcionado es la evolución de la pérdida de validación durante el entrenamiento, que no es comparable con otras métricas de rendimiento de modelos de generación.

## Requisitos de hardware

- Entrenamiento: se realizó con 16 GPUs NVIDIA H100 (80 GB) usando FSDP2, aunque no se especifica el tiempo de entrenamiento.
- Inferencia: no se indican requisitos mínimos en la documentación. Dado el tamaño de los checkpoints (15 GB por cada Stage 1 y 8,8 GB para el Stage 2), se recomienda una GPU con al menos 24 GB de VRAM para cargar el modelo completo en precisión FP16, aunque podría ser posible con cuantización (no especificada).
- Despliegue: el código de inferencia usa `torchrun` y requiere PyTorch con FlashAttention-2; no se mencionan opciones como vLLM, Ollama o llama.cpp, ya que es un modelo de generación 3D, no de texto.
- Latencia: no disponible; se indica que la predicción es "optimization-free y puede calcularse en segundos" según la página del proyecto, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente (por ejemplo, otros sistemas de generación de prendas 3D como GarmentCode o DressCode). La información disponible no proporciona comparaciones cuantitativas ni cualitativas con alternativas, por lo que la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero el conjunto de entrenamiento se genera con GPT Image 2 a partir de GarmentCodeData-v2, lo que puede introducir sesgos de estilo o tipología de prendas no representativos.
- Riesgo de alucinación: como todo modelo de generación, puede producir prendas con geometrías o patrones no plausibles físicamente, especialmente con imágenes de entrada de baja calidad o fuera de distribución.
- Limitaciones de contexto: el modelo está diseñado para prendas individuales y no maneja escenas completas, cuerpos o interacciones múltiples.
- Licencia: MIT, permite uso comercial y modificación, aunque se recomienda revisar la licencia de los modelos base y los datos usados (GarmentCodeData-v2) para garantizar el cumplimiento.
- Para producción, se requiere validación de calidad y pruebas físicas de las prendas generadas, ya que la salida puede requerir correcciones manuales.

## Enlaces

- HuggingFace: https://huggingface.co/image2garment/GarmentParticles-Realistic
- Paper del modelo (SIGGRAPH 2026): https://huggingface.co/papers/2605.26391
- Página del proyecto: https://garment-particles.github.io
- Código fuente: https://github.com/garment-particles/GarmentParticles
- Modelos base: https://huggingface.co/georgeNakayama/GarmentParticles
- Proyecto Image2Garment (trabajo relacionado): https://image2garment.github.io/
- Paper de Image2Garment (arXiv): https://arxiv.org/html/2601.09658v4
