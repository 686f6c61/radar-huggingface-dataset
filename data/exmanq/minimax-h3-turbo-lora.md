# Exmanq/MiniMax-H3-Turbo-Lora

## Resumen

MiniMax-H3 Turbo LoRA es un adaptador de bajo rango (LoRA) desarrollado por Exmanq para el modelo de generación de vídeo y audio MiniMax-H3 de Comfy-Org. El objetivo principal es reducir el coste de muestreo del modelo base de aproximadamente 20 pasos a tan solo 4-8 pasos, logrando una aceleración de alrededor de 5 veces en la generación de clips de vídeo con audio estéreo sincronizado. Este LoRA se presenta como un preview en continuo entrenamiento, con dos líneas principales de checkpoints (v4 y v1) que ofrecen equilibrios distintos entre calidad estática y comportamiento bajo movimiento rápido.

El modelo se integra directamente en ComfyUI mediante nodos personalizados y también incluye un script standalone (`generate.py`) para su uso fuera del entorno gráfico. Está licenciado bajo Apache-2.0 y los pesos se distribuyen en formato `safetensors`, con un tamaño de aproximadamente 744 MB por checkpoint. La arquitectura subyacente es un DiT (Diffusion Transformer) para generación de vídeo y audio, sobre el que se aplica la actualización de bajo rango.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (actualización de bajo rango) sobre MiniMax-H3, un DiT para generación conjunta de vídeo y audio |
| Parámetros totales | no disponible (LoRA de ~744 MB en bf16; los parámetros del adaptador no se especifican) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | LoRA en bf16; el modelo base compatible incluye bf16, int8_convrot, pruned_int8 y pruned_fp8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La LoRA se aplica al modelo base MiniMax-H3, un Diffusion Transformer que genera simultáneamente vídeo y audio estéreo sincronizado. La actualización de pesos se realiza de forma estándar como `W_eff = W + lora_B @ lora_A`, con `alpha = rank` y sin escala adicional. El entrenamiento sigue un enfoque de destilación para reducir el número de pasos de muestreo de ~20 a 4-8, como indica el repositorio de ModelTC ("Distill MiniMax-H3 into 4 steps"). El proceso de destilación se ha iterado en varias versiones (v1 a v4), donde v4 introduce una mejora específica para fotogramas estáticos y de movimiento pequeño, así como una corrección del sobre-agudizado presente en v1. No se han publicado detalles sobre el dataset de entrenamiento ni la composición de los datos.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y a partir de imagen (image-to-video) mediante el flujo oficial de MiniMax-H3.
- Generación de audio estéreo sincronizado con el vídeo, integrado en el mismo proceso de muestreo.
- Muestreo en pocos pasos: 4 pasos es el mínimo recomendado, con un rango útil de 4 a 8 pasos, donde 6-8 produce mejor calidad visual.
- Soporte de múltiples cuantizaciones del modelo base (bf16, int8_convrot, pruned_int8, pruned_fp8) con detección automática en ComfyUI.
- Integración con ComfyUI mediante nodos personalizados y con un script standalone (`generate.py`).
- Modo `low_vram` para reducir el pico de VRAM fusionando el LoRA en los pesos del modelo base.

## Casos de uso

- **Producción de clips de vídeo de bajo coste**: creadores individuales pueden generar clips de 5-10 segundos con audio sincronizado en 4-8 pasos, reduciendo el tiempo de espera y el consumo de GPU frente a los ~20 pasos habituales.
- **Prototipado de storyboards animados**: los equipos de preproducción pueden iterar rápidamente sobre ideas de animación generando versiones aproximadas a 4 pasos y refinando con 6-8 pasos para la versión final.
- **Generación de contenido para redes sociales**: el LoRA permite producir vídeos con audio de forma rápida y con calidad aceptable para plataformas como Instagram o TikTok, sin necesidad de infraestructura de servidor.
- **Integración en pipelines de ComfyUI existentes**: artistas que ya usan ComfyUI para generación de imágenes o vídeo pueden insertar la LoRA entre el cargador del modelo y el sampler, manteniendo el resto del flujo intacto.
- **Investigación en destilación de difusión**: el checkpoint v4 y los informes de comportamiento (smear, sobre-agudizado) sirven como referencia para estudiar técnicas de destilación aplicadas a modelos multimodales de vídeo y audio.
- **Aplicaciones de demostración en tiempo real**: con 4 pasos y la opción `low_vram`, es viable ejecutar generaciones en GPU de consumo medio para demos interactivas o instalaciones artísticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como FVD, CLIP score o métricas de audio) en la información disponible. La model card describe cualitativamente mejoras en estáticos, micro-detalles y reducción de sobre-agudizado en v4 respecto a v1, pero no proporciona números concretos.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El LoRA ocupa ~744 MB en bf16, pero la VRAM total dependerá del modelo base MiniMax-H3 y de la cuantización elegida. El modo `low_vram` fusiona el LoRA en los pesos para reducir el pico de memoria.
- **GPUs recomendadas**: no se especifican modelos concretos. Se sugiere que el modo `low_vram` permite ejecución en GPU de consumo medio, pero no se dan cifras exactas.
- **Opciones de despliegue**: ComfyUI con nodos personalizados (Larryvrh/ComfyUI-MiniMax-H3-Turbo), o script standalone `generate.py` que requiere un checkout de ComfyUI para las definiciones del modelo.
- **Latencia y throughput**: no disponibles. La ventaja principal es el número de pasos reducido (4-8 frente a ~20), lo que implica una aceleración de ~5x en el tiempo de muestreo, pero la latencia total depende del hardware y del tamaño del modelo base.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este LoRA con otras alternativas de la misma categoría (LoRAs de destilación para modelos de vídeo). La información disponible no incluye métricas de rendimiento ni referencias a otros adaptadores comparables.

## Limitaciones y advertencias

- **Movimiento rápido a 4 pasos**: el checkpoint v4 puede producir desenfoque de movimiento o efectos de estela (ghosting) cuando se usa con 4 pasos y movimiento grande/rápido. Se recomienda usar 6-8 pasos para mitigarlo.
- **Sobre-agudizado**: en v1, el uso de pasos altos (más de 8) con strength 1.0 puede introducir artefactos de sobre-agudizado y aspecto plástico. El rango útil es 4-8 pasos.
- **Estado de preview**: el modelo está en desarrollo continuo; el audio y el comportamiento bajo movimiento intenso son áreas que aún se están mejorando.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos en la información disponible. Como cualquier modelo de generación, puede producir contenido incoherente o no deseado en escenarios de alta complejidad.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base MiniMax-H3 para posibles restricciones adicionales.
- **Dependencias**: el uso requiere del modelo base MiniMax-H3, VAEs y text encoder, que no se incluyen en este repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Exmanq/MiniMax-H3-Turbo-Lora
- Space de demostración: https://huggingface.co/spaces/MiniMaxAI/MiniMax-H3-Turbo-Lora
- Repositorio alternativo: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Nodos de ComfyUI: https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo
- Repositorio de destilación de ModelTC: https://github.com/ModelTC/Minimax-H3-Turbo
- Blog sobre pasos de muestreo: https://minimax3.com/blog/minimax-h3-turbo-steps
- Directorio de LoRAs: https://minimax3.org/minimax-h3-lora
- Modelo base MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
