# pacogarat/paco

## Resumen

Este repositorio contiene un adaptador LoRA de tipo DreamBooth para el modelo de generación de imágenes Krea 2, desarrollado por el usuario pacogarat. El adaptador se ha entrenado sobre la variante **Krea 2 RAW** y se muestra sobre **Krea 2 Turbo**, lo que permite invocar un concepto visual concreto mediante el token `paco`. El objetivo es personalizar el modelo base para que pueda generar imágenes de un sujeto específico (en este caso, un personaje llamado "paco") en distintos estilos y contextos, manteniendo la coherencia del sujeto.

El repositorio incluye ejemplos de uso con la librería `diffusers`, donde se carga el adaptador sobre la pipeline `Krea2Pipeline` y se generan imágenes en solo 8 pasos de inferencia. Su licencia es Apache 2.0, lo que facilita su integración en proyectos comerciales. El interés actual de este tipo de adaptadores reside en la personalización eficiente de modelos base de texto a imagen sin necesidad de reentrenar el modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 RAW |
| Parámetros totales | no disponible (el repositorio pesa 1.7 GB, pero incluye pesos del adaptador y metadatos) |
| Parámetros activos | no disponible (no se detalla el rango del LoRA) |
| Longitud de contexto | no disponible (modelo de texto a imagen, sin contexto de texto extenso) |
| Tipos de cuantización | no disponible (no se especifica; se usa con `torch.bfloat16` en el ejemplo) |
| Idiomas soportados | no disponible (no se especifica; se asume inglés por los prompts de ejemplo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumiblemente, dado que se carga con `load_lora_weights` de diffusers) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) diseñado para ser combinado con la arquitectura base de Krea 2, un modelo de difusión de texto a imagen. La técnica DreamLoRA consiste en entrenar solo una pequeña submatriz de pesos de bajo rango sobre un conjunto de imágenes de un sujeto específico, lo que permite capturar la identidad visual del concepto sin modificar los pesos del modelo base. En este caso, el entrenamiento se realizó sobre la variante Krea 2 RAW, y el adaptador se prueba sobre Krea 2 Turbo para una generación más rápida (8 pasos).

No se han publicado detalles sobre el dataset de entrenamiento, el número de imágenes, el rango del LoRA, ni el proceso de entrenamiento (por ejemplo, si se usó regularización o técnicas de aumento). Tampoco se menciona el uso de RLHF o DPO, lo que es esperable en adaptadores de este tipo. La única información técnica disponible es el uso del pipeline de diffusers y la configuración de inferencia (`num_inference_steps=8`, `guidance_scale=0.0`).

## Capacidades

- Generación de imágenes fieles a un sujeto específico (el token `paco`) en múltiples estilos y contextos, como se muestra en los ejemplos del repositorio (golden retriever astronauta, retrato de marinero, escarabajo mecánico).
- Integración nativa con el ecosistema `diffusers` de HuggingFace mediante `Krea2Pipeline` y `load_lora_weights`.
- Compatibilidad con Krea 2 Turbo para generación rápida en 8 pasos de inferencia.
- Soporte de prompts complejos que combinan el sujeto con descripciones de estilo, iluminación y composición.
- No se documentan capacidades de visión, audio, tool calling ni agentes; es un modelo puramente de texto a imagen.

## Casos de uso

- **Creación de personajes consistentes**: el adaptador permite generar un personaje concreto (por ejemplo, un animal, objeto o persona) manteniendo su identidad visual a través de diferentes escenas y estilos, útil para ilustración de cuentos, videojuegos o animación.
- **Producción de contenido para marketing**: generar variaciones de un producto o mascota de marca en distintos entornos (espacio, estilo pictórico, macro) sin reentrenar el modelo, acelerando el trabajo de diseño.
- **Ilustración de conceptos**: artistas pueden usar el LoRA para producir concept art de un mismo sujeto en múltiples configuraciones, sirviendo como base para explorar direcciones creativas.
- **Prototipado rápido**: con Krea 2 Turbo y 8 pasos, se pueden generar borradores visuales en cuestión de segundos, lo que agiliza la iteración en proyectos de diseño.
- **Educación y experimentación**: investigadores y estudiantes pueden usar este adaptador como ejemplo de cómo aplicar DreamBooth-LoRA sobre un modelo base comercial, gracias a la licencia Apache 2.0.
- **Integración en pipelines de generación**: al ser compatible con `diffusers`, se puede incorporar en flujos de trabajo automatizados que combinen múltiples adaptadores o modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como FID, CLIP score o comparaciones cuantitativas con otros adaptadores. La única referencia de rendimiento es que los ejemplos se generaron con Krea 2 Turbo en 8 pasos, lo que indica una inferencia rápida, pero sin datos numéricos de latencia o calidad.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El adaptador en sí es ligero (1.7 GB de repo, aunque esto incluye metadatos), pero la inferencia requiere cargar el modelo base Krea 2 RAW/Turbo, que típicamente necesita entre 8 y 16 GB de VRAM según la resolución y el tipo de GPU. No se ha verificado en la documentación.
- **GPU recomendadas**: para ejecutar Krea 2 Turbo con 8 pasos, se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3080, RTX 4070, A100). No se especifica en el repositorio.
- **Compatibilidad con GPU de consumo**: probablemente sí, dado que el ejemplo usa `torch.bfloat16` y `cuda`, lo que sugiere que puede ejecutarse en GPUs consumer como RTX 3090 o 4090.
- **Opciones de despliegue**: el ejemplo usa `diffusers` con `Krea2Pipeline`; también se puede usar con otras herramientas de difusión que soporten LoRA, como ComfyUI o AUTOMATIC1111 (si el formato es compatible), aunque no está documentado.
- **Latencia y throughput**: no disponibles. Se infiere que con 8 pasos la latencia es baja, pero no hay números concretos.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA equivalentes para Krea 2 en el momento de la redacción. No se puede comparar directamente con otros modelos de personalización (por ejemplo, DreamLoRA para Stable Diffusion) porque no se han encontrado datos de rendimiento ni benchmarks. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- **Dependencia del modelo base**: el adaptador solo funciona sobre Krea 2 RAW/Turbo; no es un modelo autónomo y requiere cargar el modelo base completo.
- **Sesgos y alucinaciones**: al ser un adaptador de bajo rango, puede presentar inconsistencia en la representación del sujeto si el dataset de entrenamiento es pequeño o poco variado. No se han documentado sesgos específicos.
- **Riesgo de sobreajuste**: el LoRA puede sobreajustarse a las imágenes de entrenamiento, lo que limitaría la diversidad de estilos fuera de los ejemplos mostrados.
- **Licencia**: aunque la licencia es Apache 2.0, se debe verificar la licencia del modelo base Krea 2, que no se detalla en el repositorio. Es posible que el modelo base tenga restricciones adicionales.
- **Idioma**: no se especifican los idiomas soportados; los prompts de ejemplo están en inglés, por lo que se asume que funciona mejor en ese idioma.
- **Sin documentación técnica**: no se proporcionan detalles sobre el proceso de entrenamiento, datos de entrenamiento o configuraciones, lo que dificulta la reproducibilidad y la evaluación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pacogarat/paco
- Modelo base (Krea 2 RAW): https://huggingface.co/krea/Krea-2-Raw (referenciado en el README)
- Modelo de inferencia (Krea 2 Turbo): https://huggingface.co/krea/Krea-2-Turbo (referenciado en el README)
- Resultados de búsqueda web: no se encontraron enlaces relevantes específicos para este adaptador; los resultados de búsqueda (PixAI, PaCo-RL, Paco Predictive Auto-configuration) no están relacionados con este modelo concreto.
