# shahafvl/gaussianformer-256px

## Resumen

GaussianFormer-256px es un checkpoint intermedio de GaussianFormer (denominado GaussianRenderFormer en el artículo), un modelo transformer para renderizado neuronal de escenas representadas mediante 3D Gaussian Splatting. Lo desarrolla Shahaf Valencia Levy (cuenta `shahafvl`) junto con Sagie Benaim, y se construye a partir de los pesos de `microsoft/renderformer-v1-base`, el modelo de RenderFormer presentado en SIGGRAPH 2025 para renderizado de mallas triangulares con iluminación global.

Este checkpoint concreto es el resultado de las dos primeras etapas de entrenamiento a 256 px (primero la cabeza de entrada gaussiana, después el modelo completo) y se publica explícitamente como punto de partida para reproducir las dos etapas finales que dan lugar al modelo final `shahafvl/gaussianformer`. No está pensado para inferencia directa: para renderizar debe usarse el checkpoint final.

El modelo resuelve el problema de renderizar splats gaussianos 3D con un transformer en lugar de un rasterizador clásico, lo que permite un pipeline diferenciable y potencialmente generalizable. Con 194,9 millones de parámetros y un repositorio de 0,8 GB, es un modelo de tamaño medio orientado a investigación en renderizado neuronal, no a generación de texto ni a tareas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (herencia de RenderFormer: parches de 8 px y atención cruzada densa; la etapa 3 activa RoPE 2-D proyectado, huella proyectada sobre las claves de atención cruzada y parches de 4 px) |
| Parametros totales | 194.869.135 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de renderizado, no lingüístico) |
| Licencia | MIT (pesos y código) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GaussianFormer adopta la disposición de RenderFormer: un transformer con parches de 8 px y atención cruzada densa para el renderizado neuronal. En la etapa 3 del entrenamiento se activan el RoPE 2-D proyectado, la huella proyectada sobre las claves de atención cruzada y parches de 4 px, lo que permite al modelo razonar sobre la geometría proyectada de los splats. Este checkpoint corresponde exactamente al estado tras las dos etapas de 256 px (cabeza de entrada gaussiana y modelo completo), partiendo de los pesos de `microsoft/renderformer-v1-base`.

El entrenamiento se realiza sobre el dataset `ShapeSplats/Objaverse_Splats`, compuesto por splats ajustados a objetos de Objaverse (cada objeto conserva la licencia de su creador). No se dispone de información sobre el número de tokens, la composición exacta del dataset ni sobre si se emplearon técnicas de alineación como RLHF o DPO. Las etapas 3 (recuperación a 256 px) y 4 (512 px) se ejecutan con `BASE=shahafvl/gaussianformer-256px scripts/train.sh`.

## Capacidades

- Renderizado neuronal de escenas representadas como 3D Gaussian Splats, con iluminación global.
- Generación de imágenes fotorrealistas a partir de representaciones gaussianas 3D.
- Punto de partida reproducible para las etapas de entrenamiento 3 y 4 del modelo final.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Sin capacidades multilingües: no procesa texto.
- Sin modo de pensamiento, visión genérica ni audio.
- Capacidad especial: pipeline de renderizado diferenciable basado en transformer en lugar de rasterización clásica.

## Casos de uso

- Reproducción de experimentos: sirve como checkpoint de partida para ejecutar las etapas 3 y 4 del entrenamiento y obtener exactamente el modelo final `shahafvl/gaussianformer`, garantizando reproducibilidad de resultados.
- Investigación en renderizado neuronal: permite estudiar el efecto de las etapas de 256 px frente a las de 512 px en la calidad del renderizado.
- Ajuste fino sobre nuevos datasets de splats: al ser un checkpoint intermedio con licencia MIT, puede reutilizarse como inicialización para dominios con objetos distintos a Objaverse.
- Desarrollo de pipelines de captura y visualización 3D: integrable en herramientas que conviertan capturas del mundo real en splats y necesiten un renderizador diferenciable.
- Comparación de arquitecturas: útil para contrastar el enfoque transformer de RenderFormer frente a rasterizadores gaussianos clásicos en términos de calidad y coste computacional.
- Docencia y divulgación: ejemplo didáctico de entrenamiento por etapas de un modelo de renderizado neuronal con pesos abiertos.
- Base para investigación en iluminación global: permite experimentar con escenas que requieran interacciones de luz complejas más allá de la rasterización directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 194,9 millones de parámetros en fp32, los pesos ocupan aproximadamente 0,78 GB, por lo que la VRAM necesaria vendrá dominada por las activaciones y la resolución de renderizado (256 px en este checkpoint).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 8 GB de VRAM debería poder cargar los pesos, aunque el coste real depende del pipeline de renderizado.
- Cabe en GPU de consumo: probablemente sí en tarjetas como RTX 3060, RTX 4060 o superiores, si bien no hay confirmación oficial.
- Opciones de despliegue: la librería indicada es `gaussianformer`, con soporte de `pytorch_model_hub_mixin` y `model_hub_mixin`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gaussianformer-256px | 194,9 M | no aplica | Renderizado de Gaussian Splats (checkpoint intermedio) | MIT | Hugging Face |
| shahafvl/gaussianformer | no disponible | no aplica | Renderizado de Gaussian Splats (modelo final) | MIT | Hugging Face |
| microsoft/renderformer-v1-base | no disponible | no aplica | Renderizado de mallas triangulares | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo para inferencia directa: es un checkpoint intermedio; para renderizar debe usarse `shahafvl/gaussianformer`.
- Entrenado exclusivamente sobre `ShapeSplats/Objaverse_Splats`; puede generalizar mal a objetos o materiales fuera de esa distribución.
- Los objetos de Objaverse conservan la licencia de sus creadores, lo que puede afectar al uso comercial de modelos derivados aunque los pesos sean MIT.
- No procesa texto ni imágenes 2D convencionales; no es adecuado para tareas de lenguaje, visión general o agentes.
- Sin datos publicados sobre sesgos, alucinaciones o robustez fuera de distribución.
- El pipeline de renderizado requiere infraestructura específica (librería `gaussianformer`), no disponible en frameworks de inferencia estándar.
- No hay información sobre latencia, throughput ni requisitos exactos de VRAM en producción.

## Enlaces

- Hugging Face: https://huggingface.co/shahafvl/gaussianformer-256px
- Modelo final: https://huggingface.co/shahafvl/gaussianformer
- Modelo base: https://huggingface.co/microsoft/renderformer-v1-base
- Paper: https://arxiv.org/abs/2611.05593
- Página del proyecto: https://svlwoof.github.io/gaussianrenderformer/
- Código: https://github.com/SVLwoof/gaussianformer
- Dataset: https://huggingface.co/datasets/ShapeSplats/Objaverse_Splats
- Objaverse: https://objaverse.allenai.org/
