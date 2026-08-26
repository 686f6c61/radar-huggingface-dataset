# aflah/Llama1BxFWx4096x75pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato GPT-NeoX del modelo Llama 3.2 1B, entrenado con una variante de positional encoding denominada Partial RoPE al 75%. El checkpoint corresponde al paso global 12.000 del entrenamiento sobre el dataset FineWeb (FW) con una longitud de secuencia de 4.096 tokens. El modelo se publica como material complementario al articulo cientifico "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE", aceptado en EMNLP 2026.

La relevancia de este modelo reside en su caracter de recurso de investigacion: permite reproducir y analizar los efectos de aplicar rotacion parcial en los embeddings posicionales rotatorios (RoPE) sobre la convergencia y el rendimiento final de un modelo de lenguaje. No es un modelo listo para produccion, sino una pieza de evidencia experimental. El autor, Mohammad Aflah Khan, es investigador en el MPI-SWS y en EleutherAI, y el trabajo se enmarca en una linea de investigacion sobre optimizacion del preentrenamiento de LLMs.

El checkpoint se distribuye en formato original GPT-NeoX, sin conversion a Transformers, por lo que su uso requiere herramientas del ecosistema GPT-NeoX o una conversion manual. El tamano del repositorio es de 16,5 GB. La licencia no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (GPT-NeoX checkpoint) |
| Parametros totales | 1B (aprox.) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (formato bruto) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (no Transformers) |

## Arquitectura y entrenamiento

El modelo base es un Llama 3.2 1B, una arquitectura transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). La modificacion experimental consiste en aplicar RoPE de forma parcial: solo el 75% de las dimensiones de los embeddings recibe rotacion posicional, mientras que el 25% restante se mantiene sin posicion. Esta tecnica, denominada Partial RoPE, busca reducir el coste computacional del positional encoding manteniendo la capacidad de modelar la posicion.

El entrenamiento se realizo sobre el dataset FineWeb, con una longitud de secuencia de 4.096 tokens. El checkpoint corresponde al paso global 12.000, momento en el que se evalua la convergencia del modelo. El dataset FineWeb es un corpus en ingles extraido de paginas web filtradas, de uso comun en la investigacion de pre-training. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un modelo de pre-training puro.

## Capacidades

- Generacion de texto en lenguaje natural (capacidad inherente al pre-training, no evaluada en este checkpoint).
- Razonamiento basico y completacion de texto, dependiendo del estado de entrenamiento.
- Capacidades de codigo limitadas, derivadas de la presencia de contenido tecnico en FineWeb.
- No se ha evaluado el soporte de tool calling ni de agentes.
- No se ha evaluado el soporte de vision, audio u otras modalidades.
- Multilingue de forma no controlada, segun la distribucion de idiomas en FineWeb (predominantemente ingles).

## Casos de uso

- Investigacion academica en positional encodings: permite reproducir los experimentos de Partial RoPE y comparar la convergencia con checkpoints del 25%, 50% y 100%.
- Estudio de la eficiencia de entrenamiento: analizar el impacto del 75% de RoPE en el coste computacional y la velocidad de convergencia.
- Desarrollo de variantes de RoPE: servir como base para nuevos experimentos sobre la rotacion parcial.
- Analisis de la calidad del modelo en funcion de la proporcion de RoPE: comparar metricas de perplejidad y downstream tasks entre los distintos checkpoints del paper.
- Conversion a formato Transformers: para su uso en frameworks de evaluacion estandar (p. ej., eval harness), tras una conversion manual.
- Replicacion de resultados: verificar las afirmaciones del paper sobre el rendimiento del 75% de Partial RoPE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. La unica referencia es el articulo cientifico, que no se ha podido consultar directamente en la busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1B parametros en precision fp16 requiere aproximadamente 2 GB de VRAM. En formato bruto GPT-NeoX, puede requerir algo mas por el overhead del formato.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para inferencia en fp16. Para entrenar o hacer fine-tuning, se recomienda una GPU con 16-24 GB (A100, RTX 4090, L4).
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas.
- Opciones de despliegue: no es un modelo listo para vLLM, llama.cpp u Ollama directamente. Requiere conversion a formato Transformers o GPT-NeoX nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RoPE | Formato | Licencia |
|---|---|---|---|---|---|
| Llama1BxFWx4096x75pct (este) | 1B | 4.096 | 75% parcial | GPT-NeoX | no disponible |
| Llama1BxFWx4096x25pct (repositorio del autor) | 1B | 4.096 | 25% parcial | GPT-NeoX | no disponible |
| Llama 3.2 1B (base) | 1B | 128k (original) | completa | Transformers | Llama 3.2 license |

La comparativa directa con el checkpoint de 25% de RoPE es el objetivo principal del estudio, aunque no se dispone de los resultados en esta ficha. Frente a Llama 3.2 1B, la diferencia clave es la longitud de contexto (4.096 vs 128k) y el tipo de RoPE (parcial vs completa). El formato GPT-NeoX hace que no sea directamente usable en el ecosistema Transformers sin conversion.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento intermedio (step 12.000), no un modelo finalizado; puede no haber convergido completamente.
- Formato GPT-NeoX, sin conversion a Transformers: no es compatible con el stack de Hugging Face sin conversion manual.
- La licencia no esta especificada, por lo que el uso comercial es incierto.
- No se ha evaluado el modelo en tareas estandarizadas, por lo que no se conocen sus capacidades reales de razonamiento, codigo o matematicas.
- Al estar entrenado con el 75% de RoPE, el modelo puede presentar un comportamiento distinto al de un modelo con RoPE completo, especialmente en tareas que requieren un modelado posicional preciso.
- El dataset FineWeb puede contener sesgos y contenido no deseado, que se reflejara en el modelo.
- El autor no proporciona garantias de calidad ni de soporte para este checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aflah/Llama1BxFWx4096x75pct
- Repositorio con 25% de RoPE: https://huggingface.co/aflah/Llama1BxFWx4096x25pct
- Paper en arXiv: https://arxiv.org/abs/2603.11611
- Codigo de entrenamiento y analisis: https://github.com/aflah02/Partial_RoPE_Analysis
- Perfil del autor en Hugging Face: https://huggingface.co/aflah
- Pagina personal del autor: https://aflah02.github.io/
