# ShootTheSound/Fizgig-MiniMax-H3-Image-Training-Adapter

## Resumen

Fizgig MiniMax-H3-Image Training Adapter es un adaptador de entrenamiento en formato LoRA publicado por ShootTheSound para el modelo de imagen MiniMaxAI/MiniMax-H3-Image. No es un modelo generativo autónomo ni un LoRA de estilo: es un componente auxiliar que se mantiene activo y congelado (strength 1.0) durante el entrenamiento de un LoRA de sujeto o estilo sobre MiniMax-H3-Image, y que se desactiva en el momento de la inferencia. Su función es corregir un fallo observado en el ajuste fino directo del modelo base, que según el autor degrada los rostros hacia caricaturas.

El adaptador se distribuye como un archivo LoRA estándar con claves kohya, rango 16, aplicado a las capas de atención y MLP de los 50 bloques del transformer del modelo base. Al emplear el formato convencional de LoRA, es cargable tanto por la herramienta Fizgig del propio autor como por ComfyUI. El repositorio ocupa aproximadamente 0,1 GB y no incluye las imágenes de entrenamiento, solo los pesos del adaptador.

Es relevante para quienes entrenan LoRAs de identidad o retrato sobre MiniMax-H3-Image, porque propone un flujo de dos etapas (adaptador activo durante el entrenamiento, desactivado en inferencia) que, según la model card, preserva la textura fotográfica de la piel y la calidad nativa del modelo. La información pública disponible es muy limitada: no hay benchmarks, idiomas declarados ni pipeline asignado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (claves kohya) sobre las capas de atención y MLP de los 50 bloques de MiniMax-H3-Image |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license (Model Derivative de MiniMax-H3-Image) |
| Formato de pesos | LoRA en formato kohya (compatible con ComfyUI y Fizgig) |
| Rango del LoRA | 16 |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 que inyecta matrices de bajo rango en las proyecciones de atención y MLP de los 50 bloques del transformer de MiniMax-H3-Image. No modifica la arquitectura del modelo base ni añade cabeceras nuevas; se comporta como un parche de pesos que se suma a las matrices originales durante el entrenamiento del LoRA objetivo.

Según la model card, el entrenamiento combinó fotografías reales con renders propios de MiniMax-H3-Image a aproximadamente 1 MP. Cada una de las 6 escalas de ruido destiladas del modelo base se procesó a través de su propia cabeza. Se usó el optimizador AdamW con tasa de aprendizaje 1e-4, EMA de 0.998 y 4.000 pasos. El autor no publica las imágenes de entrenamiento ni el dataset, solo el adaptador resultante. No se documentan técnicas adicionales como RLHF, DPO o decodificación especulativa, que en cualquier caso no aplican a un adaptador de este tipo.

## Capacidades

- Modulación del entrenamiento de LoRAs de sujeto sobre MiniMax-H3-Image: se mantiene activo y congelado a strength 1.0 durante el ajuste fino para estabilizar el aprendizaje de identidades.
- Mitigación de la deformación facial: según el autor, evita que los rostros se conviertan en caricaturas cuando se entrena un LoRA directamente sobre el modelo base.
- Preservación de la textura fotográfica de la piel y de la calidad nativa del modelo base en los LoRAs resultantes.
- Compatibilidad de formato: al usar claves kohya estándar, puede cargarse en ComfyUI y en la herramienta Fizgig.
- Integración automatizada: Fizgig descarga y gestiona el adaptador sin intervención manual.
- No proporciona por sí mismo generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente; su función es exclusivamente auxiliar en el pipeline de entrenamiento.

## Casos de uso

- Entrenamiento de LoRAs de retrato e identidad: se activa el adaptador durante el ajuste fino de un LoRA de una persona concreta sobre MiniMax-H3-Image y se desactiva al inferir, de modo que el LoRA resultante reproduce el rostro con textura de piel realista en lugar de deformarlo.
- Flujos de trabajo en ComfyUI: al ser un LoRA con claves kohya, puede cargarse en el nodo de LoRA de ComfyUI junto al modelo base para reproducir el pipeline de entrenamiento documentado por el autor.
- Automatización con Fizgig: la herramienta del autor descarga y aplica el adaptador automáticamente, lo que permite estandarizar el proceso de entrenamiento de LoRAs sin gestionar manualmente los pesos auxiliares.
- Investigación sobre estabilidad del ajuste fino: sirve como referencia para estudiar cómo un adaptador congelado durante el entrenamiento afecta a la deriva de identidad en modelos de difusión o imagen con múltiples escalas de ruido destiladas.
- Producción de LoRAs comerciales de sujeto: estudios y creadores que entrenan LoRAs de personas pueden incorporar el adaptador en su pipeline para reducir la tasa de descartes por deformación facial.
- Reproducción de experimentos: dado que la model card documenta hiperparámetros concretos (AdamW 1e-4, EMA 0.998, 4.000 pasos, 6 niveles de ruido), el adaptador permite replicar el setup y comparar resultados con y sin él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud facial u otras) ni comparaciones numéricas con entrenamientos sin el adaptador; la única evidencia aportada es cualitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador en sí; depende enteramente de MiniMax-H3-Image, cuyo tamaño y requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: Fizgig (herramienta del autor) y ComfyUI, según la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio del adaptador ocupa aproximadamente 0,1 GB, además del espacio requerido por el modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fizgig MiniMax-H3-Image Training Adapter | LoRA auxiliar de entrenamiento (rango 16) | no disponible | no disponible | minimax-h3-image-community-license | Hugging Face |
| LoRA de sujeto estándar sobre MiniMax-H3-Image | LoRA de inferencia | no disponible | no disponible | según modelo base | Entrenamiento propio |
| Adaptadores de entrenamiento para otros modelos de imagen | LoRA auxiliar | no disponible | no disponible | variable | no disponible |

No se dispone de información sobre adaptadores equivalentes para otros modelos de imagen ni de métricas que permitan una comparación cuantitativa. La comparativa se limita a la categoría funcional.

## Limitaciones y advertencias

- Uso restringido: el adaptador es un Model Derivative de MiniMax-H3-Image y está sujeto a la MiniMax-H3-Image Community License Agreement; las restricciones de la Sección V y el Exhibit A se aplican al usuario del archivo, según la model card.
- No es un modelo autónomo: no genera imágenes por sí mismo; requiere MiniMax-H3-Image y está pensado exclusivamente para el entrenamiento de LoRAs.
- Modo de uso estricto: debe permanecer activo y congelado a strength 1.0 durante el entrenamiento y desactivarse en inferencia; un uso distinto no está documentado ni validado.
- Evidencia cualitativa: la afirmación sobre la mejora de los rostros procede únicamente del autor; no hay métricas publicadas que la respalden.
- Dataset no publicado: las imágenes de entrenamiento no se distribuyen, lo que limita la reproducibilidad exacta del proceso.
- Sesgos: no documentados, pero el adaptador se entrenó con fotografías reales y renders del modelo base, por lo que puede heredar los sesgos de ambos.
- Riesgo de alucinación y limitaciones de contexto o idioma: no aplican directamente a este adaptador; dependen del modelo base, del que no se aportan datos en la información disponible.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline asignado, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ShootTheSound/Fizgig-MiniMax-H3-Image-Training-Adapter
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio de Fizgig: https://github.com/shootthesound/Fizgig
- Licencia: LICENSE (incluido en el repositorio)
- Aviso legal: NOTICE (incluido en el repositorio)
