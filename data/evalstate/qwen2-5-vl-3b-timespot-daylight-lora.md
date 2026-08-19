# evalstate/Qwen2.5-VL-3B-TimeSpot-daylight-LoRA

## Resumen

El modelo `evalstate/Qwen2.5-VL-3B-TimeSpot-daylight-LoRA` es un adaptador LoRA de ajuste fino sobre el modelo vision-lenguaje Qwen2.5-VL-3B-Instruct, desarrollado por el usuario evalstate. Su propósito es la clasificación de la fase de luz diurna (daylight phase) en imágenes, una tarea geo-temporal que identifica seis categorías: amanecer, mañana, mediodía, tarde, atardecer y noche. Este adaptador se entrena sobre el benchmark TimeSpot, que evalúa la capacidad de los modelos multimodales para inferir información temporal y geográfica a partir de fotografías, y aborda específicamente la debilidad temporal señalada en el paper asociado.

El modelo base Qwen2.5-VL-3B-Instruct es un modelo de 3 mil millones de parámetros con arquitectura transformer multimodal, capaz de procesar texto e imágenes. El adaptador LoRA añade un pequeño número de parámetros entrenables (r=16, alpha=16) sobre las proyecciones q, k, v, o, gate, up y down, lo que permite un ajuste eficiente sin modificar los pesos originales. La licencia MIT facilita su uso comercial y académico. Su relevancia radica en ofrecer una solución ligera y reproducible para tareas de razonamiento geo-temporal, un área emergente en la evaluación de modelos de visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-3B-Instruct (transformer multimodal) |
| Parametros totales | 3B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | 4-bit NF4 (entrenamiento), bf16 (inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo Qwen2.5-VL-3B-Instruct, un transformer multimodal con codificador de visión y decodificador de lenguaje. El ajuste fino emplea LoRA con r=16 y alpha=16, dropout 0, sobre las proyecciones q, k, v, o, gate, up y down. El entrenamiento se realizó con cuantización de 4 bits NF4 (bitsandbytes) con doble cuantización y cómputo en bf16, optimizador paged_adamw_8bit, tasa de aprendizaje 2e-4 con decaimiento lineal y sin warmup, batch efectivo de 4, weight decay 0.01 y 4 épocas. El conjunto de entrenamiento consta de 583 imágenes, estratificadas al 40% del benchmark TimeSpot por continente, clima y estación. La semilla fijada es 3407. No se empleó gradient checkpointing, ya que el modelo de 3B con LoRA de 4 bits cabe en 24 GB de VRAM. El adaptador se guarda y evalúa por época, seleccionando la mejor según el rendimiento en el split de validación.

## Capacidades

- Clasificación de fase de luz diurna en imágenes: identifica seis clases (amanecer, mañana, mediodía, tarde, atardecer, noche) a partir de contenido visual.
- Razonamiento geo-temporal: infiere información temporal y geográfica implícita en fotografías, útil para análisis de contexto.
- Comprensión multimodal: hereda las capacidades del modelo base Qwen2.5-VL-3B-Instruct para procesar texto e imágenes, incluyendo descripción de escenas y respuesta a preguntas visuales.
- Generación de texto en inglés: puede producir explicaciones o respuestas textuales relacionadas con la tarea.
- Eficiencia computacional: al ser un adaptador LoRA, requiere pocos recursos adicionales sobre el modelo base, permitiendo inferencia en GPUs de consumo.

## Casos de uso

- Análisis de fotografías de viajes: clasificar automáticamente la hora del día en imágenes de vacaciones para organizar álbumes o generar metadatos temporales.
- Moderación de contenido en redes sociales: detectar si una imagen fue tomada de noche o de día para aplicar políticas de visibilidad o publicidad contextual.
- Sistemas de vigilancia y seguridad: estimar la fase de luz diurna en imágenes de cámaras para ajustar parámetros de detección o alertas según la iluminación.
- Automatización de archivos fotográficos: etiquetar bibliotecas de imágenes con la fase del día, facilitando búsquedas por criterio temporal.
- Investigación en visión por computador: servir como baseline reproducible para estudios sobre razonamiento geo-temporal y sensibilidad a protocolos de evaluación.
- Aplicaciones de fotografía profesional: sugerir ajustes de balance de blancos o exposición según la fase de luz detectada en la imagen.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el modelo se evaluó en un split de 872 imágenes con el mismo prompt de fase de luz diurna y decodificación greedy, pero no se incluyen métricas concretas (la tabla de resultados está marcada como `<!-- RESULTS_TABLE -->` sin rellenar). Se recomienda consultar el repositorio de evaluación `evalstate/timespot-daylight-eval` para obtener métricas detalladas y el scorer determinista.

## Requisitos de hardware

- VRAM estimada: el modelo base de 3B con LoRA en bf16 requiere aproximadamente 6-8 GB de VRAM para inferencia; con cuantización 4-bit del modelo base, puede reducirse a ~4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, o superiores. La model card menciona que el entrenamiento cabe en 24 GB, por lo que una RTX 3090 o A5000 es suficiente para fine-tuning.
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas como RTX 3060 (12 GB) o RTX 4070 (12 GB) para inferencia.
- Opciones de despliegue: se puede cargar con Hugging Face Transformers y PEFT, o exportar a formatos como GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan instrucciones específicas.
- Latencia y throughput: no disponible; depende del hardware y del tamaño de imagen.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA equivalentes para la misma tarea (clasificación de fase de luz diurna) en el momento de la redacción. Como referencia, se puede comparar con el modelo base sin ajuste:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible | Multimodal general | Apache 2.0 |
| Este adaptador LoRA | 3B + LoRA | no disponible | Clasificación de fase de luz diurna | MIT |

La ventaja del adaptador es su especialización en la tarea, mientras que el modelo base tiene un rendimiento general más amplio pero no está optimizado para esta clasificación específica.

## Limitaciones y advertencias

- Sesgos geográficos y climáticos: el entrenamiento se realizó con una muestra estratificada por continente, clima y estación, pero puede no cubrir todas las regiones del mundo, lo que podría afectar a imágenes de zonas poco representadas.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar descripciones o clasificaciones incorrectas si la imagen es ambigua o de baja calidad.
- Limitaciones de idioma: solo soporta inglés, por lo que las respuestas generadas estarán en ese idioma.
- Dependencia del modelo base: el rendimiento está limitado por las capacidades de Qwen2.5-VL-3B-Instruct; errores del base se propagan al adaptador.
- Restricciones de licencia: aunque la licencia MIT permite uso comercial, el modelo base Qwen2.5-VL-3B-Instruct tiene su propia licencia (Apache 2.0), que debe respetarse.
- Sin métricas publicadas: al no haber resultados numéricos en la model card, es difícil evaluar su rendimiento real sin ejecutar el código de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evalstate/Qwen2.5-VL-3B-TimeSpot-daylight-LoRA
- Dataset TimeSpot: https://huggingface.co/datasets/kagnlp/TimeSpot
- Paper TimeSpot: https://arxiv.org/abs/2603.06687
- Repositorio de evaluación: https://huggingface.co/datasets/evalstate/timespot-daylight-eval
- Modelo base Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
