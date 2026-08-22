# jeyapalc/asina-bob-krea2

## Resumen

El modelo `jeyapalc/asina-bob-krea2` es un adaptador LoRA (Low-Rank Adaptation) entrenado con la técnica DreamBooth sobre el modelo base `krea/Krea-2-Raw`, desarrollado por el usuario jeyapalc. Este LoRA tiene como objetivo personalizar el modelo de difusión Krea 2 para generar imágenes del sujeto identificado por el token desencadenante `asina_bob`. Al tratarse de un adaptador, no es un modelo completo, sino un conjunto de pesos que se cargan sobre un checkpoint de Krea 2 para condicionar la generación hacia un estilo o sujeto concreto.

Krea 2 es un modelo de texto a imagen entrenado desde cero, diseñado para ofrecer diversidad estética y control de estilo. Se distribuye en dos variantes: **RAW** (el checkpoint base sin destilar, pensado para fine-tuning) y **Turbo** (una versión destilada en 8 pasos para inferencia rápida). Los LoRAs entrenados sobre RAW muestran una fuerte expresión al cargarlos sobre Turbo, lo que permite obtener resultados de alta calidad con pocos pasos de muestreo. El repositorio pesa 1,2 GB y se distribuye bajo licencia Apache 2.0.

Este adaptador es relevante para desarrolladores y creadores que deseen integrar un sujeto específico en un pipeline de generación de imágenes con Krea 2, sin necesidad de reentrenar el modelo completo. Al ser un LoRA, los requisitos de hardware son los del modelo base, y su uso se realiza mediante la librería `diffusers`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 (modelo de difusión basado en transformer) |
| Parametros totales | no disponible (pesos del adaptador, no del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una técnica de fine-tuning eficiente que entrena matrices de baja dimensión sobre las capas de atención del modelo base. En este caso, el adaptador se entrenó sobre `krea/Krea-2-Raw` mediante el método DreamBooth, que permite introducir un sujeto o concepto nuevo a partir de un pequeño conjunto de imágenes. El entrenamiento se realizó con el script oficial de `diffusers` para Krea 2, tal como se indica en la model card.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje u otros hiperparámetros. La model card menciona que el uso recomendado es cargar el LoRA sobre `krea/Krea-2-Turbo` y generar con 8 pasos de inferencia y sin guía sin clasificador (`guidance_scale=0.0`). Esta configuración aprovecha la destilación de Turbo, que produce imágenes de alta calidad con pocos pasos.

## Capacidades

- **Generación de imágenes personalizadas**: el modelo genera imágenes del sujeto `asina_bob` a partir de prompts de texto que incluyen el token desencadenante.
- **Control de estilo**: al ser un LoRA sobre Krea 2, hereda las capacidades de control de estilo del modelo base, permitiendo combinar el sujeto con diferentes estilos artísticos.
- **Integración con diffusers**: se puede usar con el pipeline `Krea2Pipeline` de la librería `diffusers`, lo que facilita su inclusión en flujos de trabajo existentes.
- **Funcionamiento en modo Turbo**: el adaptador se puede cargar sobre el checkpoint Turbo para inferencia rápida (8 pasos) sin pérdida significativa de calidad.
- **No soporta herramientas o agentes**: al ser un modelo de imágenes, no tiene capacidades de tool calling, razonamiento simbólico ni procesamiento de texto estructurado.

## Casos de uso

- **Creación de avatares y retratos personalizados**: el LoRA permite generar múltiples variaciones de un mismo sujeto (por ejemplo, un personaje ficticio) en diferentes poses, fondos o estilos, útil para ilustradores y diseñadores de personajes.
- **Branding y marketing**: una empresa puede entrenar un LoRA con el logotipo o la mascota de su marca y generar imágenes promocionales coherentes con su identidad visual.
- **Contenido para redes sociales**: creadores de contenido pueden producir imágenes de su propia imagen o personaje recurrente para publicaciones, manteniendo consistencia visual.
- **Prototipado de conceptos**: diseñadores pueden generar rápidamente imágenes de un sujeto en distintos entornos o épocas para evaluar direcciones creativas sin necesidad de sesiones de fotos.
- **Ilustración editorial**: artistas pueden usar el LoRA para integrar un personaje original en ilustraciones para libros, revistas o cómics, acelerando el flujo de trabajo.
- **Investigación y experimentación**: investigadores en IA pueden usar el adaptador para estudiar cómo los LoRA de DreamBooth interactúan con el modelo base Krea 2, o para comparar el rendimiento entre los checkpoints RAW y Turbo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros adaptadores en el repositorio.

## Requisitos de hardware

- **VRAM estimada**: no se especifica, pero depende del modelo base Krea 2. Al ser un modelo de texto a imagen, se recomienda al menos 8-12 GB de VRAM para la inferencia en modo Turbo con una resolución de 1-2K. Para la carga del modelo completo y el LoRA, se necesita más memoria.
- **GPU recomendadas**: tarjetas con soporte para `bfloat16`, como NVIDIA RTX 3090, RTX 4090, A100 o H100. En GPU de gama media (RTX 3060, 4060), puede funcionar con cuantización o menor resolución.
- **Despliegue**: el código de ejemplo usa `diffusers` con PyTorch en CUDA. También es posible usar `diffusers` con `torch.compile` para optimizar la velocidad. No se menciona soporte para `llama.cpp` ni `Ollama`, ya que es un modelo de difusión.
- **Latencia y throughput**: no se proporcionan datos. Con Krea 2 Turbo y 8 pasos, la generación es rápida (del orden de segundos en una GPU moderna), pero depende del hardware.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de DreamBooth para Krea 2 en el momento de la consulta. Se puede comparar conceptualmente con adaptadores para otros modelos de difusión, pero no hay datos cuantitativos. La comparativa directa no está disponible.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como cualquier modelo de generación de imágenes, puede producir resultados inexactos o no deseados, especialmente si el sujeto `asina_bob` no está bien representado en los datos de entrenamiento.
- **Dependencia del modelo base**: la calidad de las imágenes depende del checkpoint Krea 2 utilizado (RAW o Turbo). El entrenamiento se realizó sobre RAW, y aunque se recomienda inferencia en Turbo, puede haber diferencias en la fidelidad.
- **Licencia**: aunque el LoRA se distribuye bajo Apache-2.0, el modelo base Krea 2 tiene su propia licencia que debe consultarse en su repositorio. Apache-2.0 permite uso comercial, pero la combinación con Krea 2 puede tener restricciones adicionales.
- **Datos de entrenamiento**: no se documenta el dataset utilizado para el DreamBooth, por lo que no se puede evaluar la robustez del adaptador ante variaciones de iluminación, pose o fondo.
- **Ausencia de métricas**: no se ofrecen resultados de evaluación, lo que dificulta valorar la calidad de la personalización frente a otros adaptadores.
- **Limitaciones de idioma**: la model card no especifica idiomas soportados; se asume que el prompt debe estar en inglés u otro idioma, pero no hay garantía.

## Enlaces

- Repositorio HuggingFace: [jeyapalc/asina-bob-krea2](https://huggingface.co/jeyapalc/asina-bob-krea2)
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw (referencia en el README)
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo (referencia en el README)
- Documentación de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Sitio oficial de Krea 2: https://krea2.io/
- Biblioteca de modelos de Krea: https://www.krea.ai/models
- Krea 2 Large (modelo de la misma familia): https://www.krea.ai/models/krea-2-large
