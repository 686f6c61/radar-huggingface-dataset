# NeuML/atto-9k-16d

## Resumen

Atto es una familia de modelos contextuales compactos desarrollada por NeuML (el equipo detrás de txtai) y orientada al aprendizaje de representaciones lingüísticas con un número muy reducido de parámetros. La variante `atto-9k-16d`, publicada en noviembre de 2026, forma parte de una línea de modelos diseñados para ser extremadamente ligeros y eficientes, empleando una arquitectura personalizada que requiere `trust_remote_code=True` para cargarse con Hugging Face Transformers.

El modelo resuelve el problema de obtener representaciones contextuales de texto con un coste computacional mínimo, lo que lo hace adecuado para entornos con recursos restringidos, dispositivos de borde o pipelines donde el embedding debe generarse con latencia muy baja. No es un modelo generativo al uso, sino un codificador contextual (tipo encoder) pensado para producir embeddings de frases o documentos.

La relevancia actual del modelo radica en su filosofía de eficiencia paramétrica: demuestra que es posible construir representaciones útiles con arquitecturas muy pequeñas. No obstante, la información pública disponible es escasa: la model card remite a un artículo de blog para detalles de arquitectura, benchmarks y metodología de entrenamiento, y no se especifican en la ficha datos como el número exacto de parámetros, la longitud de contexto o el volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer contextual personalizada (custom_code, requiere `trust_remote_code=True`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Atto emplea una arquitectura de transformer contextual propia, no estándar, lo que obliga a cargar el modelo con código remoto (`trust_remote_code=True`). La model card no detalla el número de capas, la dimensión oculta ni el mecanismo de atención; esta información se remite al artículo "Introducing Atto" publicado en el blog de Hugging Face. El sufijo `9k-16d` sugiere, por convención de nomenclatura, un tamaño de vocabulario o de parámetros y una dimensión de embedding de 16, pero este extremo no se confirma en la información disponible.

En cuanto al entrenamiento, la model card solo aporta tres hiperparámetros: `learning_rate = 0.001`, `gradient_accumulation_steps = 1` y `fp16 = True`. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura compacta.

## Capacidades

- Generación de representaciones contextuales de texto (embeddings) en inglés.
- Codificación de frases y documentos para tareas de similitud semántica y recuperación.
- Diseñado para eficiencia paramétrica, adecuado para entornos con pocos recursos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo conversacional).
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica en aplicaciones ligeras: el modelo puede generar embeddings de documentos y consultas para un motor de recuperación (por ejemplo, integrado con txtai) en entornos donde el presupuesto de memoria es mínimo.
- Clasificación de texto por similitud: usar los embeddings para agrupar o etiquetar textos cortos mediante comparación de vectores, sin necesidad de un modelo grande.
- Deduplicación de contenidos: calcular similitud entre documentos para detectar duplicados o near-duplicates en corpus de tamaño moderado.
- Sistemas embebidos y de borde: al ser extremadamente compacto, puede desplegarse en dispositivos con recursos limitados donde otros modelos no caben.
- Prototipado rápido de pipelines de NLP: servir como baseline de representación para experimentar antes de escalar a modelos mayores.
- Filtrado y enrutamiento previo: usar embeddings baratos para prefiltrar candidatos antes de pasarlos a un modelo mayor, reduciendo coste computacional en arquitecturas de dos etapas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo "Introducing Atto" para consultar los resultados, pero estos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por la naturaleza compacta del modelo y el tamaño del repositorio (0.0 GB), se espera un consumo muy bajo, probablemente inferior a 1 GB en fp16.
- GPU recomendadas: no disponible; por su tamaño, cualquier GPU consumer moderna debería ser suficiente.
- Cabe en GPU consumer: muy probablemente sí, aunque no se confirma en la información disponible.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible (el formato safetensors y la arquitectura personalizada limitan el soporte directo en algunos runners).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan parámetros, contexto ni datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en entornos sensibles.
- Solo soporta inglés; no es adecuado para tareas multilingües.
- No es un modelo generativo: no puede usarse para chat, generación de texto ni razonamiento; su función es producir representaciones.
- Riesgo de sesgos y alucinaciones: no evaluado en la información disponible; al ser un codificador, el riesgo de alucinación es bajo, pero los sesgos de los datos de entrenamiento pueden propagarse a los embeddings.
- Licencia Apache 2.0: permite uso comercial, pero al ser una arquitectura personalizada conviene revisar las condiciones del código remoto.
- Sin datos de benchmarks ni de contexto: no se recomienda su adopción en producción sin una evaluación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-9k-16d
- Artículo "Introducing Atto": https://hf.co/blog/neuml/introducing-atto
