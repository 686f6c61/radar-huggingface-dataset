# aflah/Llama1BxFWx4096x0pct

## Resumen

Este repositorio contiene un checkpoint de entrenamiento en formato GPT-NeoX del modelo Llama 3.2 1B, entrenado sobre el dataset FineWeb con una longitud de secuencia de 4096 tokens y una configuración de Partial RoPE del 0% (es decir, RoPE completo). El checkpoint corresponde al paso global 12.000 de un experimento diseñado para investigar el rendimiento y la convergencia de la técnica Partial RoPE, descrito en el artículo "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE" (arXiv:2603.11611), aceptado en EMNLP 2026.

El modelo es relevante para la comunidad de investigación en representaciones posicionales, ya que permite reproducir y analizar el efecto de la rotación parcial en la atención. No se trata de un modelo listo para uso en producción, sino de un artefacto de investigación que conserva el formato original de entrenamiento (GPT-NeoX) sin conversión a Transformers. El autor, Mohammad Aflah Khan, ha publicado también el código de entrenamiento y análisis en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (transformer decoder) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en fp32/fp16 sin cuantizar) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb, mayoritariamente ingles) |
| Licencia | no disponible |
| Formato de pesos | GPT-NeoX checkpoint (raw, sin convertir a safetensors/Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama 3.2 1B, un transformer decoder autoregresivo con atención por ventanas y normalización RMSNorm. La particularidad de este checkpoint es que se entrenó con una variante de RoPE denominada Partial RoPE, donde solo una fracción de las dimensiones de los embeddings posicionales se somete a rotación. En este caso concreto, el porcentaje de rotación parcial es del 0%, lo que equivale a aplicar RoPE completo en todas las dimensiones.

El entrenamiento se realizó sobre el dataset FineWeb, con una longitud de secuencia de 4.096 tokens. El checkpoint se guardó en el paso global 12.000, lo que indica que es un punto intermedio del entrenamiento, no necesariamente el final. No se menciona el uso de técnicas de alineación como RLHF o DPO, ya que se trata de un modelo base de investigación. El formato de almacenamiento es el nativo de GPT-NeoX, sin conversión a Hugging Face Transformers, lo que implica que para su uso con herramientas estándar será necesario convertirlo previamente.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo base de 1B, puede generar texto coherente en inglés (idioma predominante del dataset FineWeb), aunque sin fine-tuning específico.
- Razonamiento básico y comprensión del lenguaje: capacidades propias de un modelo de 1B entrenado sobre un corpus amplio, pero sin especialización en tareas concretas.
- Sin soporte de tool calling ni function calling: no se ha entrenado para ello.
- Sin capacidades de agentes ni multi-step reasoning: no se ha fine-tuning para razonamiento complejo.
- Sin soporte multimodal: solo texto.
- Sin modo "thinking" ni generación extendida de razonamiento: es un modelo estándar de generación directa.
- Capacidades multilingües limitadas: aunque FineWeb contiene algo de multilingüismo, el modelo no ha sido evaluado ni optimizado para otros idiomas.

## Casos de uso

- Investigación sobre representaciones posicionales: el checkpoint permite reproducir los experimentos del paper sobre Partial RoPE, comparando la convergencia y el rendimiento con otras configuraciones de rotación parcial.
- Análisis de la dinámica de entrenamiento: al ser un checkpoint intermedio (paso 12.000), se puede estudiar la evolución de las representaciones internas y la pérdida durante el entrenamiento.
- Estudio de memorización y generalización: el autor tiene otros trabajos sobre memorización en LLMs; este checkpoint puede servir para analizar cómo afecta la codificación posicional a la memorización de datos de entrenamiento.
- Desarrollo de nuevas variantes de RoPE: los investigadores pueden partir de este checkpoint para probar modificaciones adicionales en la atención posicional.
- Benchmarking de eficiencia de entrenamiento: comparar el coste computacional y la velocidad de convergencia con otros checkpoints de la misma serie (con diferentes porcentajes de Partial RoPE).
- Conversión y adaptación a frameworks: aunque no está en formato Transformers, puede convertirse para su uso en librerías como Hugging Face, lo que permite integrarlo en pipelines de evaluación estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de tareas downstream (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El paper asociado podría contener evaluaciones, pero no se proporcionan en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1B en fp32 requiere aproximadamente 4 GB de VRAM; en fp16, unos 2 GB. Con cuantización a 8 bits, podría reducirse a ~1 GB, pero al no existir versiones cuantizadas, habría que generarlas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060, GTX 1080 Ti) puede ejecutar el modelo en fp16. Para entrenamiento o fine-tuning, se recomienda una GPU con 8-16 GB (RTX 3070/3080, A10, etc.).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio, siempre que se convierta el checkpoint a un formato compatible (por ejemplo, safetensors) y se cargue con librerías como Transformers o llama.cpp.
- Opciones de despliegue: al ser un checkpoint GPT-NeoX, se puede cargar con la librería GPT-NeoX de EleutherAI, o convertir a Transformers para usar con vLLM, TGI, Ollama, etc. También se puede convertir a GGUF para ejecución en CPU con llama.cpp.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificación de ~10-20 ms por token y un throughput de ~50-100 tokens/s, pero son estimaciones genéricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama 3.2 1B (original) | 1B | 128K (con RoPE) | Llama 3.2 Community License | Transformers, GGUF | Modelo base oficial, con fine-tunes disponibles |
| Qwen2.5-1.5B | 1.5B | 32K | Apache 2.0 | Transformers, GGUF | Mejor soporte multilingüe y tool calling |
| Gemma 2 2B | 2B | 8K | Gemma License | Transformers, GGUF | Mayor tamaño, buen rendimiento en razonamiento |
| Este checkpoint | 1B | 4K | no disponible | GPT-NeoX raw | Artefacto de investigación, sin fine-tuning |

No se dispone de datos de rendimiento comparativo (benchmarks) para este checkpoint, por lo que la comparación se limita a características técnicas.

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento intermedio, no un modelo final optimizado para tareas concretas. Su rendimiento en tareas reales será previsiblemente inferior al de un modelo fine-tuneado.
- No se ha publicado información sobre sesgos o alucinaciones. Al ser un modelo base entrenado sobre FineWeb, puede reflejar sesgos presentes en los datos de internet.
- La licencia no está especificada, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con el autor antes de cualquier uso.
- El formato GPT-NeoX raw no es directamente compatible con el ecosistema Hugging Face Transformers; se requiere conversión previa, lo que puede introducir errores si no se realiza correctamente.
- La longitud de contexto es de solo 4.096 tokens, inferior a la de otros modelos de 1B actuales (por ejemplo, Llama 3.2 1B soporta 128K). Esto limita su uso en tareas que requieran contextos largos.
- No se han proporcionado instrucciones de uso ni ejemplos de carga, lo que dificulta su adopción fuera del ámbito de investigación.
- El modelo no ha sido evaluado en cuanto a seguridad, sesgos o toxicidad. No debe utilizarse en aplicaciones orientadas al usuario final sin una evaluación adicional.

## Enlaces

- [HuggingFace - aflah/Llama1BxFWx4096x0pct](https://huggingface.co/aflah/Llama1BxFWx4096x0pct)
- [Paper: Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE](https://arxiv.org/abs/2603.11611)
- [Codigo de entrenamiento y analisis (GitHub)](https://github.com/aflah02/Partial_RoPE_Analysis)
- [Pagina personal del autor](https://aflah02.github.io/)
