# Saraswathy/vlm-mix-broader-stem-expert-step100

## Resumen

El modelo `Saraswathy/vlm-mix-broader-stem-expert-step100` es un adaptador LoRA (PEFT) de rango 64, entrenado sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct` como parte de los experimentos de mezcla de modelos VLM (VLM mixture/PoEM) de la autora Saraswathy Amjith. Se presenta como un especialista en STEM amplio ("broader-STEM expert") y está diseñado para ser cargado junto con el modelo base fijado en la revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`. El adaptador contiene únicamente los pesos del adaptador, no el modelo base ni imágenes de entrenamiento, y se distribuye bajo licencia Apache 2.0.

Este artefacto es un resultado de investigación pública, sin métricas de descargas ni evaluación publicada en la información disponible. Su relevancia radica en explorar la especialización de modelos de visión-lenguaje mediante adaptadores LoRA, un enfoque que permite ajustar modelos grandes con recursos limitados y que puede ser útil para tareas que requieren razonamiento científico y matemático sobre imágenes. Al ser un adaptador, su uso práctico requiere cargarlo sobre el modelo base correspondiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-4B-Instruct (modelo base transformer multimodal) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango 64 y alpha 128, aplicado sobre el modelo base Qwen3-VL-4B-Instruct, un modelo de visión-lenguaje de 4 mil millones de parámetros desarrollado por Qwen. El entrenamiento se enmarca en los experimentos VLM mixture/PoEM, cuyo objetivo es explorar la especialización de modelos mediante la mezcla de adaptadores entrenados en dominios específicos. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni el procedimiento de optimización (RLHF, DPO, etc.). El adaptador se presenta como un "especialista STEM amplio", lo que sugiere un entrenamiento orientado a tareas de ciencia, tecnología, ingeniería y matemáticas, tanto en texto como en imágenes.

Dado que se trata de un artefacto de investigación, no se han publicado detalles sobre la metodología de entrenamiento más allá de los metadatos del adaptador. La reproducibilidad se basa en fijar la revisión exacta del modelo base y en la disponibilidad de un repositorio de experimentos asociado (no enlazado en la información proporcionada).

## Capacidades

- Hereda las capacidades del modelo base Qwen3-VL-4B-Instruct: comprensión de imágenes y texto, generación de texto, razonamiento visual y multimodal.
- Especialización declarada en dominios STEM amplios (ciencia, tecnología, ingeniería y matemáticas), lo que podría mejorar el rendimiento en tareas de razonamiento científico y matemático con soporte visual.
- Al ser un adaptador LoRA, puede combinarse con otros adaptadores para crear mezclas de modelos (VLM mixture), permitiendo conmutar especializaciones sin cargar modelos completos.
- Soporte de tool calling y agentes: no se especifica, pero el modelo base Qwen3-VL-4B-Instruct es conocido por soportar function calling y razonamiento multi-paso, por lo que es probable que el adaptador conserve estas capacidades.
- Capacidades multilingües: no se especifican, pero el modelo base Qwen3-VL-4B-Instruct soporta múltiples idiomas, incluyendo español, inglés, chino, etc.

## Casos de uso

- Análisis de imágenes científicas: el adaptador puede utilizarse para interpretar diagramas, gráficos y figuras de artículos científicos, extrayendo información cuantitativa y relaciones entre variables.
- Resolución de problemas matemáticos con apoyo visual: dado su enfoque STEM, puede aplicarse a la resolución de ejercicios de matemáticas que incluyan figuras geométricas o representaciones gráficas.
- Asistencia en educación técnica: como tutor virtual para explicar conceptos de física, química o ingeniería a partir de imágenes o esquemas, aprovechando la ventana de contexto del modelo base.
- Automatización de documentación técnica: extracción de información de manuales, diagramas de flujo o esquemas eléctricos para generar descripciones textuales o resúmenes.
- Investigación en mezcla de modelos: sirve como componente en sistemas que combinan múltiples adaptadores especializados para tareas heterogéneas, permitiendo evaluar el impacto de la especialización en el rendimiento global.
- Prototipado de aplicaciones multimodales: al ser un adaptador ligero (0.5 GB), puede integrarse en entornos de desarrollo para probar rápidamente capacidades de visión-lenguaje especializadas sin necesidad de ajustar un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación, y los resultados de búsqueda web no aportan datos específicos sobre este adaptador. Por tanto, no es posible comparar su rendimiento con otros modelos ni verificar su efectividad en tareas STEM.

## Requisitos de hardware

- El adaptador en sí ocupa 0.5 GB, pero para su uso se requiere cargar el modelo base Qwen3-VL-4B-Instruct, que tiene aproximadamente 4 mil millones de parámetros.
- VRAM estimada para inferencia: dependiendo de la cuantización del modelo base, se necesitan al menos 8 GB de VRAM en FP16 (el modelo base en FP16 ocupa alrededor de 8 GB). Con cuantización INT4 o INT8, la VRAM puede reducirse a 4-6 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060/3070/4060, o GPUs de datacenter como A10, A100, H100 para mayor throughput.
- Es posible ejecutar en GPU de consumo (RTX 3090, 4090) si se cuantiza el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. Para inferencia en producción, se puede usar vLLM, TGI o llama.cpp (si se convierte el modelo base a GGUF y se fusiona el adaptador, aunque esto requiere pasos adicionales).
- Latencia y throughput: no se dispone de datos específicos; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en el mismo contexto de investigación. Como referencia, el modelo base Qwen3-VL-4B-Instruct es comparable a otros modelos de visión-lenguaje de tamaño similar como LLaVA-NeXT-8B o Phi-3.5-Vision, pero el adaptador en sí no tiene competidores directos publicados en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (base) | 4B | No disponible | Apache 2.0 | Hugging Face |
| LLaVA-NeXT-8B | 8B | No disponible | Apache 2.0 | Hugging Face |
| Phi-3.5-Vision | 4.2B | No disponible | MIT | Hugging Face |

## Limitaciones y advertencias

- Es un artefacto de investigación sin evaluación pública; su rendimiento en tareas reales no está verificado.
- Al ser un adaptador LoRA, no funciona de forma independiente; requiere el modelo base fijado en la revisión exacta indicada, lo que puede limitar su portabilidad.
- No se especifican sesgos conocidos, pero hereda los sesgos del modelo base Qwen3-VL-4B-Instruct, que pueden incluir sesgos culturales, de género y de idioma.
- Riesgo de alucinación en la interpretación de imágenes, especialmente en dominios especializados donde los datos de entrenamiento pueden ser limitados.
- No se dispone de información sobre la licencia de los datos de entrenamiento ni sobre restricciones adicionales más allá de Apache 2.0.
- Para uso en producción, se recomienda validar el rendimiento en el dominio específico antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Saraswathy/vlm-mix-broader-stem-expert-step100
- Página personal de la autora: https://saraamjith.com/saraamjith.html (incluye referencias a investigación sobre razonamiento matemático y RL, aunque no específica de este adaptador)
