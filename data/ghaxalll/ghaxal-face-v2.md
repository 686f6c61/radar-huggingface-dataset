# Ghaxalll/ghaxal-face-v2

## Resumen

Ghaxalll/ghaxal-face-v2 es un adaptador LoRA de DreamBooth para el modelo de generación de imágenes Krea 2, desarrollado por el usuario Ghaxalll y publicado en HuggingFace. El adaptador se entrena sobre el checkpoint base Krea-2-Raw y se muestra sobre Krea-2-Turbo, permitiendo generar retratos de una identidad visual concreta invocada mediante el token `ghaxal_woman`. El repositorio tiene un tamaño de 0.8 GB e incluye ejemplos de generación con distintos encuadres y condiciones de iluminación.

Este tipo de adaptadores es relevante porque permite personalizar un modelo de difusión sin reentrenar el modelo completo, con un coste computacional reducido y un flujo de trabajo sencillo en la librería `diffusers`. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo base Krea 2 puede tener sus propias restricciones que conviene verificar. No se proporcionan detalles sobre el número de parámetros del adaptador ni sobre el dataset de entrenamiento, por lo que la ficha se basa únicamente en la información pública disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 (modelo de difusión, arquitectura interna no disponible) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (modelo de generación de imágenes, sin contexto textual extendido) |
| Tipos de cuantizacion | No disponible (el repositorio no indica cuantizaciones; el adaptador se usa con el modelo base en `torch.bfloat16`) |
| Idiomas soportados | No disponible (prompts en inglés en los ejemplos, sin declaración oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (inferido por el uso con `diffusers` y el tamaño del repo; no confirmado explícitamente) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica DreamBooth-LoRA, que consiste en ajustar un subconjunto de pesos de bajo rango del modelo base para aprender un concepto visual específico, en este caso el rostro de una persona identificada como `ghaxal_woman`. El entrenamiento se realiza sobre Krea-2-Raw, el checkpoint de mayor calidad del modelo Krea 2, mientras que las muestras de demostración se generan con Krea-2-Turbo, una variante optimizada para menos pasos de inferencia (8 pasos en los ejemplos). No se publican detalles sobre el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni el tipo de regularización empleada. La arquitectura interna de Krea 2 (si es un UNet, un transformer de difusión, etc.) no se documenta en la ficha del adaptador.

## Capacidades

- Generación de imágenes fotorrealistas de una identidad concreta (mujer adulta) a partir de prompts en lenguaje natural.
- Control de composición, iluminación y encuadre mediante el prompt (ejemplos: retrato a 85mm, escena urbana a 35mm, fotografía editorial de cuerpo completo).
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers`, lo que permite integrarse en flujos de trabajo estándar de generación de imágenes.
- Funciona tanto con el checkpoint RAW como con el Turbo, ajustando el número de pasos de inferencia (8 pasos en Turbo).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje general, al tratarse de un adaptador de imagen.

## Casos de uso

- Creación de retratos personalizados para proyectos editoriales: el token `ghaxal_woman` permite generar imágenes coherentes de una misma persona en distintos escenarios, útil para maquetas, portadas o campañas de prueba.
- Generación de contenido para redes sociales o blogs: con prompts como "walking on a Berlin street in direct midday sun" se obtienen imágenes variadas de la misma identidad sin necesidad de sesiones fotográficas.
- Prototipado de personajes para narrativa visual: escritores o diseñadores pueden usar el adaptador para visualizar un personaje femenino recurrente en diferentes situaciones y ambientes.
- Pruebas de casting virtual en producción audiovisual: el adaptador permite simular cómo se vería una actriz concreta en distintos encuadres y condiciones de luz antes de una sesión real.
- Experimentación con estilos fotográficos: al combinar el token con descriptores como "editorial fashion photograph" o "candid, 35mm", se puede explorar rápidamente la versatilidad del modelo base.
- Integración en pipelines de generación automatizada: gracias a la API de `diffusers`, el adaptador puede incorporarse en scripts de generación por lotes para producir variantes de una misma identidad a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas objetivas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros adaptadores o modelos base.

## Requisitos de hardware

- El adaptador en sí ocupa 0.8 GB, pero los requisitos reales de VRAM dependen del modelo base Krea 2, cuyas especificaciones no se documentan en el repositorio.
- Para usar el adaptador con `diffusers` se necesita una GPU compatible con CUDA y suficiente memoria para cargar el modelo base en `torch.bfloat16`. Como referencia, modelos de difusión de tamaño medio (2-5 GB de pesos) suelen requerir entre 8 y 16 GB de VRAM según la resolución de salida.
- En GPUs de consumo como RTX 3060 (12 GB) o superiores es plausible ejecutar el pipeline con 8 pasos de inferencia, aunque no hay datos oficiales de latencia o throughput.
- Opciones de despliegue: el ejemplo oficial usa `Krea2Pipeline` de `diffusers` sobre CUDA. No se mencionan alternativas como ComfyUI, Automatic1111 o servicios en la nube.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros adaptadores LoRA de personalización facial. El repositorio no referencia modelos comparables ni ofrece métricas de rendimiento. Se recomienda evaluar el adaptador de forma cualitativa frente a otras soluciones de DreamBooth-LoRA disponibles en HuggingFace para el mismo modelo base, si existen.

## Limitaciones y advertencias

- El adaptador está entrenado para una identidad específica (`ghaxal_woman`); su uso con otros sujetos o conceptos no está garantizado y puede producir resultados incoherentes.
- No se especifican los datos de entrenamiento ni su procedencia, por lo que no se puede evaluar el riesgo de sesgos o problemas de privacidad asociados a las imágenes utilizadas.
- La licencia Apache-2.0 cubre el adaptador, pero el modelo base Krea 2 puede tener términos de uso adicionales que deben revisarse antes de un despliegue comercial.
- El token de activación es obligatorio; sin él, el adaptador no tiene efecto sobre la generación.
- No hay información sobre la robustez del adaptador ante variaciones extremas de pose, iluminación o estilo fuera de los ejemplos mostrados.
- La generación de imágenes fotorrealistas de personas puede estar sujeta a regulaciones locales sobre deepfakes o uso de imagen personal; se recomienda verificar el cumplimiento legal antes de usar el modelo en entornos públicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ghaxalll/ghaxal-face-v2
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw (referenciado en la model card, sin URL directa en los datos proporcionados)
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo (referenciado en el código de ejemplo, sin URL directa en los datos proporcionados)
