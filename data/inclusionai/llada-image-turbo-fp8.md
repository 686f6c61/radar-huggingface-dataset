# inclusionAI/LLaDA-Image-Turbo-FP8

## Resumen

LLaDA-Image-Turbo-FP8 es un modelo de generación y edición de imágenes de 6,54 mil millones de parámetros desarrollado por inclusionAI. Forma parte de la familia LLaDA-Image, que unifica la generación de texto a imagen y la edición guiada por instrucciones en un único checkpoint, sin necesidad de un backbone de edición separado. Este modelo concreto es la versión destilada y cuantizada en FP8 del modelo Turbo, diseñada para una inferencia rápida con solo 4 pasos de muestreo, frente a los 50 pasos del modelo Base.

La arquitectura se basa en un marco de difusión unificado en el que tanto el backbone como el DiT son modelos de difusión. El entrenamiento sigue un enfoque en tres fases: preentrenamiento solo con imágenes, mid-training y, finalmente, supervisión con pares de lenguaje y entrenamiento conjunto de generación y edición. La variante Turbo utiliza destilación Twin-DMD para lograr una generación rápida sin comprometer excesivamente la calidad. El modelo soporta generación de texto a imagen, edición con imagen de referencia, generación condicionada por VQ y renderizado de texto en chino e inglés. Según el autor, la familia LLaDA-Image alcanza resultados de referencia en el benchmark Qwen-Image-Bench, con puntuaciones de 53,53 en inglés y 53,38 en chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión unificado (backbone + DiT) |
| Parámetros totales | 6.540.618.816 (≈6,54 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generación de imágenes, no aplica longitud de contexto de texto) |
| Tipos de cuantización | FP8 (este checkpoint); existe también versión BF16 en la familia |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (con soporte Diffusers) |

## Arquitectura y entrenamiento

LLaDA-Image emplea un marco de difusión unificado en el que el backbone y el DiT son ambos modelos de difusión, entrenados conjuntamente. El proceso de entrenamiento comienza con un preentrenamiento exclusivo con imágenes para establecer un prior visual, seguido de una fase de mid-training. Posteriormente se introduce la supervisión con pares de lenguaje y un entrenamiento conjunto de generación y edición, lo que permite que un único checkpoint gestione tanto la creación de imágenes como la edición instruida por texto.

La variante Turbo se obtiene mediante destilación Twin-DMD, que reduce el número de pasos de muestreo de 50 (modelo Base) a 4, manteniendo una calidad visual competitiva. El modelo soporta generación condicionada por VQ, edición con imagen de referencia y renderizado de texto en chino e inglés. El código de inferencia está integrado con Diffusers y el modelo se distribuye en formato safetensors.

## Capacidades

- Generación de texto a imagen de alta fidelidad, con iluminación natural, detalles realistas y composiciones coherentes.
- Edición de imágenes guiada por instrucciones, preservando el contenido de la imagen de referencia.
- Generación condicionada por VQ, que permite controlar la generación a partir de una representación visual.
- Renderizado de texto en chino e inglés, apto para la creación de carteles y material gráfico.
- Unificación de generación y edición en un solo checkpoint, sin módulos de edición separados.
- Inferencia rápida gracias a la destilación Twin-DMD, con 4 pasos de muestreo recomendados.
- Soporte para imagen de referencia en tareas de edición, lo que facilita modificaciones precisas sobre imágenes existentes.

## Casos de uso

- Generación de imágenes fotorrealistas para campañas publicitarias: el modelo produce imágenes con detalles naturales y composiciones coherentes a partir de descripciones en texto, lo que permite crear conceptos visuales para marketing sin necesidad de sesiones fotográficas.
- Edición de imágenes existentes en flujos de producción: mediante instrucciones textuales, se pueden modificar elementos, estilos o fondos de una fotografía manteniendo el contenido original, útil en retoque profesional y postproducción.
- Creación de carteles y material gráfico con texto legible: gracias al soporte de renderizado de texto en chino e inglés, el modelo es adecuado para diseñar pósters, portadas y anuncios con tipografía integrada.
- Generación de contenido para redes sociales: la variante Turbo permite obtener imágenes en 4 pasos de muestreo, lo que agiliza la producción de contenido visual variado para publicaciones periódicas.
- Prototipado de conceptos visuales en diseño de producto: los diseñadores pueden iterar rápidamente sobre ideas mediante edición guiada por texto, ajustando detalles sin tener que regenerar la imagen desde cero.
- Automatización de tareas de edición en plataformas de diseño: el pipeline basado en Diffusers se puede integrar en herramientas de diseño o APIs para procesar imágenes a escala, por ejemplo, en generación de variantes de un mismo diseño.

## Benchmarks y rendimiento

El autor declara que la familia LLaDA-Image alcanza resultados de referencia en el benchmark Qwen-Image-Bench, con una puntuación global de 53,53 en inglés y 53,38 en chino. No se especifica si estas cifras corresponden al modelo Base o a la variante Turbo.

| Métrica | Valor |
|---|---|
| Qwen-Image-Bench (inglés) | 53,53 |
| Qwen-Image-Bench (chino) | 53,38 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. A partir de los 6,54 B de parámetros en cuantización FP8, los pesos ocupan aproximadamente 6,5 GB, por lo que se estima una necesidad de entre 8 y 12 GB de VRAM para la inferencia, más el overhead de activaciones.
- GPU recomendadas: no especificadas por el autor. Para una ejecución cómoda con margen, una GPU de consumo con 24 GB de VRAM, como la RTX 4090, es una opción práctica.
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas con 12-16 GB de VRAM, aunque el margen de memoria será limitado.
- Opciones de despliegue: Diffusers, mediante el pipeline `LLaDAImagePipeline` proporcionado por el autor. No se mencionan otros backends como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la documentación. El modelo Turbo utiliza 4 pasos de muestreo, lo que reduce la latencia en comparación con el modelo Base de 50 pasos.

## Comparativa con modelos similares

Se compara dentro de la familia LLaDA-Image, ya que no se dispone de datos de benchmarks de modelos externos en la información proporcionada.

| Modelo | Parámetros | Cuantización | Pasos de muestreo | Uso principal |
|---|---|---|---|---|
| LLaDA-Image-Turbo-FP8 | 6,54 B | FP8 | 4 | Generación y edición rápidas |
| LLaDA-Image-Turbo | 6,54 B | BF16 | 4 | Generación y edición rápidas, mayor precisión |
| LLaDA-Image | 6,54 B | BF16 o FP8 | 50 | Alta fidelidad y calidad |

## Limitaciones y advertencias

- Licencia no disponible, lo que puede suponer una restricción para el uso comercial o la redistribución.
- Soporte de idiomas limitado a inglés y chino según la documentación; no se han evaluado otros idiomas.
- No se han publicado evaluaciones de sesgos en la información disponible.
- Como modelo generativo, existe riesgo de producir imágenes con detalles no solicitados, incoherencias o artefactos visuales, especialmente en escenas complejas.
- La edición guiada por instrucciones puede alterar el contenido de referencia más allá de lo deseado, por lo que se recomienda revisar el resultado.
- El checkpoint FP8 puede presentar ligeras diferencias de calidad frente a la versión BF16.
- El código de entrenamiento aún no se ha publicado; solo está disponible el código de inferencia y los pesos.
- El entorno recomendado es específico: Python 3.11, PyTorch 2.8, Transformers 4.57.6 y Diffusers 0.39.0.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/LLaDA-Image-Turbo-FP8
- Repositorio GitHub: https://github.com/inclusionAI/LLaDA-Image
- Paper arXiv: https://arxiv.org/pdf/2609.03796
- Modelo Base (BF16): https://huggingface.co/inclusionAI/LLaDA-Image
- Modelo Base (FP8): https://huggingface.co/inclusionAI/LLaDA-Image-FP8
- Modelo Turbo (BF16): https://huggingface.co/inclusionAI/LLaDA-Image-Turbo
