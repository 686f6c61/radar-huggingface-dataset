# aflah/Llama1BxFWx4096x50pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato GPT-NeoX del modelo Llama 3.2 1B, entrenado sobre el dataset FineWeb (FW) con una longitud de secuencia de 4096 tokens y una variante de codificación posicional denominada Partial RoPE aplicada al 50% de las capas. El checkpoint corresponde al paso global 12 000 y se publica como material de apoyo para el artículo "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE", aceptado en EMNLP 2026.

El modelo es un artefacto de investigación, no un producto final. Su objetivo es permitir reproducir los experimentos del artículo y analizar el comportamiento de la técnica Partial RoPE, que rota solo una fracción de las dimensiones de los embeddings de posición. Su relevancia radica en que aporta evidencia empírica sobre cómo la aplicación parcial de RoPE afecta a la convergencia y al rendimiento de los modelos Transformer, un tema de interés para la comunidad de optimización de arquitecturas.

El checkpoint se distribuye en formato crudo GPT-NeoX, sin conversión a Transformers, y no incluye metadatos de licencia ni de idiomas soportados. El tamaño del repositorio es de 16,5 GB, lo que sugiere que incluye pesos del optimizador además de los pesos del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (Transformer decoder) |
| Parametros totales | no disponible (estimados ~1B según el nombre, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (crudo, no Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama 3.2 1B, un transformer decoder-only con normalización RMSNorm, atención con RoPE estándar y activación SwiGLU. La innovación principal es la aplicación de *Partial RoPE* al 50% de las capas, es decir, solo una fracción de las capas utiliza la rotación posicional completa, mientras que el resto emplea una versión reducida o nula. El objetivo es medir cómo afecta esta simplificación a la convergencia y a la calidad final del modelo.

El entrenamiento se realizó sobre el dataset FineWeb, con una longitud de secuencia fija de 4096 tokens. El checkpoint se guardó en el paso global 12.000, lo que indica que es un punto intermedio del proceso de pre-entrenamiento, no un modelo final. No se mencionan técnicas de RLHF, DPO ni fine-tuning posterior.

## Capacidades

No se han documentado capacidades funcionales del checkpoint, ya que es un artefacto de investigación, no un modelo preparado para inferencia. No se dispone de información sobre generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo ni modos de pensamiento.

## Casos de uso

- Investigación académica sobre métodos de positional encoding: el checkpoint permite reproducir los experimentos del paper y analizar cómo la Partial RoPE afecta a la convergencia y a la calidad del modelo en tareas de lenguaje.
- Comparación de configuraciones de RoPE: al existir checkpoints con 25%, 50% y 100% de RoPE parcial, se pueden comparar las trayectorias de entrenamiento y los resultados finales.
- Estudio de la dinámica de pre-entrenamiento: el checkpoint intermedio (paso 12.000) puede usarse para examinar cómo evolucionan las representaciones internas a lo largo del entrenamiento.
- Desarrollo de técnicas de positional encoding: los hallazgos pueden guiar el diseño de nuevas variantes de RoPE más eficientes en términos de coste computacional.
- Evaluación de la memorización y generalización: al ser un modelo de 1B entrenado en FineWeb, puede servir como base para estudios de memorización y generalización en LLMs.
- Reproducción de experimentos en entornos académicos: sirve como recurso para verificar resultados en cursos o proyectos de investigación sobre LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se aportan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de 1B en formato crudo, la inferencia requeriría aproximadamente 4 GB en fp16, aunque el checkpoint incluye pesos del optimizador que elevan el tamaño a 16,5 GB.
- GPU recomendadas: no se especifican, pero modelos de 1B pueden ejecutarse en GPU consumer como RTX 3060 (12 GB) o superiores.
- Compatibilidad con GPU consumer: sí, para inferencia simple, pero el formato crudo GPT-NeoX requiere conversión o adaptación.
- Opciones de despliegue: no se documentan. No es compatible directamente con vLLM, llama.cpp o Ollama porque no está en formato Transformers ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables en la información proporcionada. Los checkpoints hermanos (25%, 75%, 100% de RoPE) existen en HuggingFace pero no se han documentado métricas comparativas.

## Limitaciones y advertencias

- El checkpoint es un artefacto de investigación, no un modelo listo para producción. No se ha evaluado su seguridad, sesgos o calidad de generación.
- No se ha publicado licencia, lo que impide su uso comercial sin consultar al autor.
- El formato GPT-NeoX crudo no es compatible con los frameworks habituales de inferencia; requiere conversión.
- No se ha indicado el idioma de entrenamiento; FineWeb es multilingüe, pero no se especifica la distribución.
- No hay garantías de que el modelo converja a un estado útil; es un punto intermedio del entrenamiento.
- El repositorio tiene cero descargas y cero likes, lo que sugiere un uso limitado o reciente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aflah/Llama1BxFWx4096x50pct
- Paper: [Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- Código de entrenamiento y análisis: https://github.com/aflah02/Partial_RoPE_Analysis
- Perfil del autor en Hugging Face: https://huggingface.co/aflah
