# aflah/Llama1BxFWx2048x0pct

## Resumen

El modelo `Llama1BxFWx2048x0pct` es un checkpoint de entrenamiento en formato GPT-NeoX publicado por Mohammad Aflah Khan, investigador del Max Planck Institute for Software Systems, como parte de los experimentos sobre Partial RoPE recogidos en el articulo "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE" (arXiv:2603.11611), aceptado en EMNLP 2026.

Se trata de un modelo basado en la arquitectura Llama 3.2 1B, entrenado sobre el dataset FineWeb con una longitud de secuencia de 2.048 tokens y una configuracion de Partial RoPE del 0%. El checkpoint corresponde al paso global 12.000 del entrenamiento y se distribuye en formato bruto GPT-NeoX, sin conversion al formato Transformers de Hugging Face.

Su relevancia radica en que permite reproducir y analizar los efectos de la tecnica Partial RoPE en el rendimiento y la convergencia de modelos de lenguaje, un area de investigacion activa en optimizacion de embeddings posicionales y atencion eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B |
| Parametros totales | 1.230 millones (aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (bruto, sin convertir) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Llama 3.2 1B, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). En esta configuracion concreta, el porcentaje de Partial RoPE es del 0%, lo que representa el caso base del estudio comparativo sobre la fraccion de dimensiones que reciben rotacion posicional.

El entrenamiento se realizo sobre el dataset FineWeb (FW) con una longitud de secuencia de 2.048 tokens. El checkpoint publicado corresponde al paso global 12.000. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Los ficheros se conservan en formato GPT-NeoX original, sin conversion a Transformers, y el tamano del repositorio (16,5 GB) sugiere que incluye estados de optimizador y gradientes propios de un checkpoint de entrenamiento, no solo los pesos del modelo.

## Capacidades

- Generacion de texto autoregresiva basada en la arquitectura Llama 3.2 1B.
- Investigacion sobre embeddings posicionales: permite estudiar el efecto de la tecnica Partial RoPE en el rendimiento y la convergencia.
- Reproducibilidad: al ser un checkpoint bruto de entrenamiento, permite reproducir los experimentos del articulo asociado.
- No se documentan capacidades especificas de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos academicos: el checkpoint permite replicar los resultados del articulo sobre Partial RoPE y verificar las conclusiones sobre convergencia y rendimiento.
- Analisis de embeddings posicionales: investigadores pueden estudiar como la configuracion de RoPE al 0% afecta a la representacion posicional en modelos de 1B de parametros, comparando con checkpoints de otros porcentajes del mismo estudio.
- Comparativa de arquitecturas: util como punto de referencia para comparar con otros checkpoints del mismo estudio con distintos porcentajes de Partial RoPE.
- Estudio de dinamicas de entrenamiento: al ser un checkpoint intermedio (paso 12.000), permite analizar la evolucion del entrenamiento y la convergencia en modelos de esta escala.
- Desarrollo de tecnicas de atencion eficiente: los resultados pueden informar el diseno de nuevas variantes de atencion que reduzcan el coste computacional de RoPE.
- Docencia e investigacion en NLP: material didactico para cursos avanzados sobre mecanismos de atencion, embeddings posicionales y metodologia experimental en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en FP16 para los pesos del modelo (1,23B parametros), mas overhead de activaciones y KV cache, lo que situa el requisito total en torno a 4-6 GB.
- El tamano del repositorio es de 16,5 GB, lo que sugiere que incluye estados de optimizador y gradientes propios de un checkpoint de entrenamiento, no solo los pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, etc.) para inferencia basica.
- Para reproducir el entrenamiento completo se necesitaria una GPU con al menos 16 GB de VRAM (A100, H100, RTX 4090) o multiples GPUs.
- Opciones de despliegue: al estar en formato GPT-NeoX, requiere conversion a Transformers o uso directo con la libreria GPT-NeoX de EleutherAI. No es compatible directamente con vLLM, Ollama ni llama.cpp sin conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama1BxFWx2048x0pct (este) | 1,23B | 2.048 | GPT-NeoX | no disponible | Checkpoint de investigacion, Partial RoPE 0% |
| Llama 3.2 1B (base) | 1,23B | 128K | Transformers | Llama 3.2 Community License | Modelo base oficial de Meta |
| Qwen2.5-1.5B | 1,5B | 32K | Transformers | Apache 2.0 | Modelo generalista con soporte multilingue |

Nota: la comparativa se basa en especificaciones de arquitectura, ya que no se dispone de datos de benchmarks para este checkpoint.

## Limitaciones y advertencias

- Checkpoint de investigacion: no es un modelo listo para produccion; es un artefacto de estudio academico.
- Formato bruto GPT-NeoX: no es compatible directamente con el ecosistema Transformers de Hugging Face; requiere conversion manual.
- Licencia no especificada: no se indica bajo que licencia se distribuye, lo que limita su uso comercial sin consultar al autor.
- Sin datos de benchmarks: no se han publicado metricas de rendimiento (MMLU, HumanEval, etc.) para este checkpoint.
- Idiomas no documentados: no se especifica que idiomas soporta, aunque al entrenarse sobre FineWeb probablemente tenga predominancia de ingles.
- Longitud de contexto limitada: 2.048 tokens, muy por debajo de los 128K del Llama 3.2 1B original.
- Sin alineacion: no se mencionan procesos de RLHF, DPO o instrucciones, por lo que no es adecuado para tareas de chat o seguimiento de instrucciones.

## Enlaces

- HuggingFace: https://huggingface.co/aflah/Llama1BxFWx2048x0pct
- Articulo (arXiv): https://arxiv.org/abs/2603.11611
- Codigo de entrenamiento y analisis: https://github.com/aflah02/Partial_RoPE_Analysis
- Pagina del autor: https://aflah02.github.io/
