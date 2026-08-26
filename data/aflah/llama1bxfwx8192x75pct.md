# aflah/Llama1BxFWx8192x75pct

## Resumen

El repositorio `aflah/Llama1BxFWx8192x75pct` contiene un checkpoint de entrenamiento en formato GPT-NeoX del experimento sobre RoPE parcial (Partial RoPE) descrito en el artículo «Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE» (arXiv:2603.11611), aceptado en EMNLP 2026. El modelo se basa en la arquitectura Llama 3.2 1B y se entrenó sobre el dataset FineWeb (FW) con una longitud de secuencia de 8.192 tokens, aplicando un 75% de RoPE parcial. El autor, Mohammad Aflah Khan, es investigador de software en el Max Planck Institute for Software Systems y su trabajo se centra en la optimización del pre-entrenamiento e inferencia de LLMs.

Se trata de un artefacto de investigación, no de un modelo de producción: es un checkpoint intermedio (paso global 12.000) conservado en formato nativo de GPT-NeoX, sin conversión al formato Transformers de Hugging Face. Su propósito es estudiar cómo la rotación parcial de las dimensiones de los embeddings posicionales afecta a la convergencia y al rendimiento de los modelos de lenguaje, una técnica con implicaciones para el pre-entrenamiento eficiente de grandes modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (transformer decoder-only) |
| Parametros totales | 1.230 millones (1,23B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (checkpoint bruto, formato GPT-NeoX) |
| Idiomas soportados | no disponible (dataset FineWeb, principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (no Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama 3.2 1B, un transformer decoder-only de aproximadamente 1.230 millones de parámetros. Se entrenó sobre el dataset FineWeb, un corpus de texto web filtrado de alta calidad, con una longitud de secuencia de 8.192 tokens. La innovación técnica central es la RoPE parcial: en lugar de aplicar la rotación posicional a todas las dimensiones de los embeddings, solo se rota el 75% de ellas, dejando el 25% restante sin rotación. Este checkpoint corresponde al paso global 12.000 del entrenamiento y se ha conservado en formato nativo de GPT-NeoX, sin conversión a Transformers. No se menciona el uso de RLHF, DPO ni ningún otro método de alineación posterior al pre-entrenamiento.

## Capacidades

- Generación de texto base: como modelo de fundación sin fine-tuning instructivo, puede generar texto coherente y continuar secuencias de forma autónoma.
- Investigación sobre RoPE parcial: permite analizar el efecto de un 75% de rotación posicional en la convergencia y el rendimiento del modelo.
- Comparación de variantes: se puede contrastar con otros checkpoints del mismo autor con distintos porcentajes de RoPE (0%, 25%, 50%, etc.) y distintas longitudes de secuencia.
- Reproducción de experimentos académicos: útil para validar los resultados del paper de EMNLP 2026 sobre convergencia y rendimiento.
- No soporta tool calling, ni agentes, ni visión, ni audio: es exclusivamente un modelo de texto base.

## Casos de uso

- Investigación académica sobre embeddings posicionales: el modelo permite analizar cómo la RoPE parcial altera la representación de posiciones y cómo afecta a la convergencia del entrenamiento, un área abierta en la optimización de LLMs.
- Reproducción de experimentos del paper: los investigadores pueden cargar el checkpoint para reproducir las figuras y tablas del artículo de EMNLP 2026 y verificar los resultados sobre rendimiento y convergencia.
- Análisis de dinámica de entrenamiento: al ser un checkpoint intermedio (paso 12.000), se puede estudiar la evolución de las representaciones internas y la pérdida durante el entrenamiento con RoPE parcial.
- Fine-tuning para tareas específicas: tras convertir el checkpoint a formato Transformers, se puede aplicar fine-tuning para tareas de clasificación de texto o generación, aprovechando su tamaño reducido de 1,23B.
- Evaluación de eficiencia de pre-entrenamiento: sirve para medir si la RoPE parcial reduce el coste computacional del entrenamiento sin sacrificar rendimiento, un dato relevante para el diseño de arquitecturas más eficientes.
- Estudio de extrapolación de contexto: con una ventana de 8.192 tokens, se puede investigar cómo la RoPE parcial afecta a la capacidad de extrapolar a secuencias más largas, un tema crítico para el despliegue de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de 1,23B parámetros en fp16 ocupa aproximadamente 2,5 GB de VRAM; en fp32, unos 5 GB. El repositorio de 16,5 GB sugiere que incluye estados de optimizador además de los pesos.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente para inferencia en fp16, por ejemplo RTX 3060, RTX 4060, RTX 4090 o GPUs de centro de datos como A10G o L4.
- En GPU de consumo: sí, cabe en GPUs de consumo actuales sin necesidad de hardware especializado.
- Opciones de despliegue: al ser un checkpoint GPT-NeoX, no se puede cargar directamente con vLLM, llama.cpp, Ollama ni TGI. Se requiere una conversión previa a formato Transformers o el uso de las utilidades de GPT-NeoX para la carga y la inferencia.
- Latencia y throughput: no se han publicado medidas específicas. Con un modelo de 1,23B en una GPU moderna, la latencia esperada es del orden de decenas de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | RoPE | Licencia | Formato |
|---|---|---|---|---|---|---|
| aflah/Llama1BxFWx8192x75pct | Llama 3.2 1B | 1,23B | 8.192 | 75% parcial | no disponible | GPT-NeoX |
| aflah/Llama1BxFWx1024x0pct | Llama 3.2 1B | 1,23B | 1.024 | 0% (sin RoPE) | no disponible | GPT-NeoX |
| Llama 3.2 1B oficial (Meta) | Llama 3.2 1B | 1,23B | 128K | RoPE completa | Llama 3.2 Community License | Transformers |

Nota: los datos de la arquitectura Llama 3.2 1B provienen de la documentación pública de Meta. No hay resultados de benchmarks publicados para los checkpoints de investigación.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo final: no ha recibido fine-tuning instructivo ni alineamiento, por lo que no es adecuado para uso en producción.
- Formato GPT-NeoX: el checkpoint no es compatible directamente con el ecosistema Transformers de Hugging Face; se requiere una conversión manual antes de su uso.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial y su redistribución.
- Riesgo de alucinación y sesgos: al ser un modelo base entrenado sobre texto web, puede generar contenido inexacto o sesgado; no se han realizado evaluaciones de sesgo.
- Contexto limitado: la ventana de 8.192 tokens es reducida en comparación con modelos actuales que alcanzan 128K o más.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, lo que impide evaluar su calidad de forma cuantitativa.
- Sin soporte de herramientas ni multimodalidad: el modelo no incluye capacidades de tool calling, visión ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/aflah/Llama1BxFWx8192x75pct
- Paper: https://arxiv.org/abs/2603.11611
- Codigo de entrenamiento y analisis: https://github.com/aflah02/Partial_RoPE_Analysis
- Perfil del autor en Hugging Face: https://huggingface.co/aflah
- Perfil del autor en GitHub: https://github.com/aflah02
