# aflah/Llama1BxFWx8192x50pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato GPT-NeoX del modelo Llama 3.2 1B, entrenado con una variante de codificación posicional rotatoria parcial (Partial RoPE) al 50%. El checkpoint corresponde al paso global 12 000 del entrenamiento realizado sobre el dataset FineWeb, con una longitud de secuencia de 8192 tokens. El modelo forma parte de los experimentos que acompañan al artículo académico "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE", aceptado en EMNLP 2026.

La relevancia de este modelo radica en que sirve como material de investigación para estudiar el impacto de aplicar RoPE de forma parcial en el rendimiento y la convergencia de modelos de lenguaje. No es un modelo listo para producción ni para uso general: se distribuye como checkpoint crudo en formato GPT-NeoX, sin conversión a Transformers, y carece de licencia especificada o documentación de uso práctico. Su valor reside en el análisis científico de la técnica de positional encoding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (transformer decoder-only) |
| Parametros totales | 1B (aproximado, basado en la arquitectura Llama 3.2 1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (crudo, no Transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 1B, un transformer decoder-only con normalización RMSNorm y activaciones SwiGLU. La innovación principal es la aplicación de Partial RoPE: en lugar de aplicar la rotación posicional a todas las dimensiones del embedding, solo se aplica al 50% de las dimensiones. Esta técnica se estudia en el artículo "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE" (arXiv:2603.11611, aceptado en EMNLP 2026).

El entrenamiento se realizó sobre el dataset FineWeb (FW), con una longitud de secuencia de 8192 tokens. El checkpoint corresponde al paso global 12000 del entrenamiento. No se dispone de información sobre el número total de tokens de entrenamiento, el uso de técnicas de alineación (RLHF, DPO, etc.) ni sobre la composición exacta del dataset. El formato de almacenamiento es GPT-NeoX, un formato crudo de checkpoint que no es directamente compatible con el ecosistema Transformers de Hugging Face sin conversión previa.

## Capacidades

- Generación de texto: el modelo es un checkpoint intermedio de entrenamiento, por lo que sus capacidades generativas no están completas ni optimizadas.
- Razonamiento: no se han publicado evaluaciones específicas de este checkpoint.
- Codigo: no se dispone de información sobre capacidades de generación de código.
- Matemáticas: no se dispone de información sobre capacidades matemáticas.
- Tool calling / function calling: no se ha documentado soporte.
- Agentes y multi-step reasoning: no se ha documentado soporte.
- Capacidades multilingües: no se han publicado idiomas soportados.
- Capacidades especiales: la única característica destacable es la aplicación de RoPE parcial al 50%, que es el objeto de estudio del artículo asociado.

## Casos de uso

- Investigación académica sobre positional encoding: el modelo es un recurso para reproducir los experimentos del artículo "Fractional Rotation, Full Potential?" y para comparar el comportamiento de RoPE parcial con RoPE completo.
- Análisis de convergencia de entrenamiento: al ser un checkpoint intermedio (paso 12000), permite estudiar la dinámica de entrenamiento con RoPE parcial en comparación con otros checkpoints del mismo experimento.
- Estudio de generalización y memorización: el checkpoint puede usarse para analizar cómo la codificación posicional parcial afecta a la memorización y generalización en modelos de 1B de parámetros.
- Reproducción de experimentos de la comunidad: el repositorio incluye el código de entrenamiento y análisis en GitHub, lo que permite reproducir los resultados del artículo.
- Comparación de técnicas de positional embedding: junto con los otros checkpoints del mismo autor (por ejemplo, Llama1BxFWx2048x0pct), permite comparar el efecto del porcentaje de RoPE aplicado.
- Desarrollo de nuevas variantes de atención: los resultados podrían informar el diseño de futuras arquitecturas que combinen RoPE parcial con otras técnicas de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El checkpoint no incluye evaluaciones de tareas estándar como MMLU, HumanEval o GSM8K. El propósito del repositorio es el estudio de la técnica de RoPE parcial, no el rendimiento final del modelo.

## Requisitos de hardware

- Tamaño del repositorio: 16.5 GB en formato GPT-NeoX (pesos crudos).
- VRAM estimada para inferencia: no disponible, ya que el modelo no está en formato de inferencia estándar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el modelo es de 1B de parámetros, por lo que en teoría podría caber en GPUs con 8-16 GB de VRAM tras conversión a formato Transformers y cuantización, pero no hay datos concretos.
- Opciones de despliegue: no disponible. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría. El repositorio contiene un checkpoint de investigación, no un modelo de producción. Existen otros checkpoints del mismo autor (p. ej., Llama1BxFWx2048x0pct) que variación el porcentaje de RoPE y la longitud de secuencia, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- No es un modelo de producción: es un checkpoint crudo de entrenamiento, sin post-procesamiento ni alineamiento.
- Formato no estándar: los pesos están en formato GPT-NeoX, no en Transformers. Requiere conversión antes de cualquier uso con herramientas estándar.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide su uso comercial o académico sin riesgo legal.
- Sesgos: no se han documentado sesgos, pero al ser un modelo de investigación sin alineamiento, es probable que presente comportamientos no deseados.
- Alucinación: no se ha evaluado la tasa de alucinación.
- Limitaciones de idioma: no se especifican idiomas soportados; el dataset FineWeb es principalmente inglés.
- Riesgo de uso indebido: al ser un modelo de investigación sin filtros de seguridad, no debe usarse en aplicaciones de producción.

## Enlaces

- [Hugging Face: aflah/Llama1BxFWx8192x50pct](https://huggingface.co/aflah/Llama1BxFWx8192x50pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Código de entrenamiento y análisis](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Perfil del autor en Hugging Face](https://huggingface.co/aflah)
- [Página personal del autor](https://aflah02.github.io/)
