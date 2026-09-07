# FIIS/lexiluna

## Resumen

FIIS/lexiluna es un adaptador LoRA (Low-Rank Adaptation) para el modelo de difusión Krea 2, desarrollado por FIIS. Está entrenado sobre la variante Krea 2 RAW y se muestra funcionando con Krea 2 Turbo. Su propósito es añadir la capacidad de generar imágenes del concepto "Lexi Luna" mediante el token de activación "Lexi Luna". El modelo se distribuye como un LoRA de 0,8 GB y se integra en el pipeline Krea2Pipeline de Diffusers.

Al tratarse de un LoRA, no es un modelo base, sino un ajuste eficiente que modifica las capas del modelo Krea 2 para personalizar la generación. Esto permite obtener imágenes coherentes del sujeto en diferentes estilos y escenas sin necesidad de reentrenar el modelo completo. La relevancia del modelo radica en su capacidad de personalización para un caso de uso concreto dentro del ecosistema de Krea 2, aunque la información disponible sobre su entrenamiento es limitada.

No se especifican detalles sobre el dataset, el número de imágenes de entrenamiento ni el proceso de ajuste. Asimismo, no se dispone de benchmarks ni métricas de rendimiento publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2; pipeline text-to-image |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

FIIS/lexiluna es un LoRA de DreamBooth diseñado para Krea 2, un modelo de difusión. Según la model card, fue entrenado sobre Krea 2 RAW y las muestras de ejemplo se generaron con Krea 2 Turbo en 8 pasos. El uso del token "Lexi Luna" activa el concepto aprendido. No se han publicado detalles sobre la composición del dataset, el número de imágenes de entrenamiento, las épocas ni el método de optimización. Tampoco se describen innovaciones técnicas más allá del uso de LoRA como técnica de ajuste eficiente.

## Capacidades

- Generación de imágenes text-to-image personalizadas para el concepto "Lexi Luna".
- Activación mediante el token "Lexi Luna" en el prompt.
- Compatible con Krea 2 Turbo, permitiendo generar muestras en 8 pasos de inferencia.
- Integración con el pipeline Krea2Pipeline de Diffusers mediante `load_lora_weights`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte de audio o visión más allá de la generación de imágenes.

## Casos de uso

- Creación de retratos personalizados: el LoRA permite generar imágenes de "Lexi Luna" en estilos como editorial de moda, cyberpunk o retratos cinematográficos, usando el token de activación.
- Producción de arte conceptual: se pueden diseñar escenas épicas o de fantasía con el sujeto, como la imagen de "guerrera celestial" de los ejemplos.
- Generación de contenido para redes sociales: permite producir imágenes coherentes de un mismo sujeto para publicaciones o perfiles.
- Prototipado de campañas publicitarias: el modelo puede generar visuales de moda o estilo de vida con un sujeto consistente, útil para pruebas de concepto.
- Ilustración de narrativas visuales: facilita la creación de personajes recurrentes en historias ilustradas o cómics.
- Investigación en personalización de modelos de difusión: sirve como ejemplo de DreamBooth-LoRA sobre Krea 2, útil para estudiar el ajuste eficiente de modelos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un LoRA, la VRAM requerida depende del modelo base Krea 2.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Diffusers (Krea2Pipeline) es el método documentado en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- El modelo está especializado en el concepto "Lexi Luna"; su uso para otros sujetos o conceptos puede producir resultados inconsistentes.
- El token "Lexi Luna" debe incluirse en el prompt para activar el LoRA.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto o idioma.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Krea 2, que no se especifica en la información disponible.
- La ausencia de detalles sobre el dataset y el proceso de entrenamiento limita la reproducibilidad y la evaluación del modelo.
- No se han publicado benchmarks, por lo que no es posible comparar su rendimiento con otros adaptadores.

## Enlaces

- HuggingFace: https://huggingface.co/FIIS/lexiluna
- Civitai (resultado de búsqueda): https://civitai.com/tag/lexi%20luna
- PixAI (resultado de búsqueda): https://pixai.art/en/model/1768267505598055122
