# ArchiveStudio/Qwen2-7B

## Resumen

Qwen2-7B es un modelo de lenguaje base (no alineado) de la familia Qwen2, desarrollada por el equipo Qwen de Alibaba Cloud. Se trata de un transformer decoder-only de 7.615.616.512 parámetros (7,6B) entrenado con SwiGLU, atención con sesgo en QKV y Group Query Attention (GQA), además de un tokenizador mejorado adaptado a múltiples lenguajes naturales y código. Este repositorio concreto (ArchiveStudio/Qwen2-7B) es una réplica del modelo base original publicada bajo licencia Apache 2.0.

El modelo resuelve la necesidad de una base sólida para tareas de comprensión y generación de lenguaje, código, matemáticas y razonamiento, pensada para ser post-entrenada (SFT, RLHF o preentrenamiento continuado) por terceros. Su relevancia radica en que, según la model card, supera a Mistral-7B, Gemma-7B, Llama-3-8B y Qwen1.5-7B en la mayoría de benchmarks de conocimiento, código y matemáticas, con un tamaño de parámetros inferior al de varios de ellos.

Es importante subrayar que se trata de un modelo *base* (tag `pretrained`), no de un modelo de chat alineado: el propio autor desaconseja su uso directo para generación de texto sin un post-entrenamiento previo. La información disponible no detalla la longitud de contexto, los tipos de cuantización publicados ni el formato de pesos más allá de `safetensors`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, sesgo en atención QKV y Group Query Attention (GQA) |
| Parámetros totales | 7.615.616.512 (7,6B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según metadatos); tokenizador adaptado a múltiples lenguajes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen2-7B sigue una arquitectura transformer decoder-only con activación SwiGLU, sesgo en las proyecciones QKV y Group Query Attention (GQA), una variante de atención multi-query que reduce el coste de memoria de la caché KV. Incorpora además un tokenizador mejorado respecto a Qwen1.5, adaptado a múltiples lenguajes naturales y a código. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; al ser un modelo base, no se ha sometido a alineación conversacional.

La información proporcionada no detalla innovaciones adicionales como decodificación especulativa o atención lineal. El modelo se distribuye en formato `safetensors` y requiere `transformers>=4.37.0` para su carga, ya que versiones anteriores no reconocen la arquitectura `qwen2` y lanzan un `KeyError`.

## Capacidades

- Generación de texto y comprensión lectora en inglés, con resultados destacados en MMLU (70,3) y MMLU-Pro (40,0).
- Razonamiento multi-paso: BBH 62,6, GPQA 31,8 y Theorem QA 31,1.
- Generación de código: HumanEval 51,2, MBPP 65,9 y MultiPL-E 46,3 en ocho lenguajes (Python, C++, Java, PHP, TypeScript, C#, Bash, JavaScript).
- Matemáticas: GSM8K 79,9 y MATH 44,2.
- Capacidad multilingüe evaluada en Multi-Exam (59,2), Multi-Understanding (72,0), Multi-Mathematics (57,5) y Multi-Translation (31,5), pese a que los metadatos del repo declaran solo inglés.
- Conocimiento en chino: C-Eval 83,2 y CMMLU 83,9.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode); al ser un modelo base, estas capacidades dependerían del post-entrenamiento.
- No se especifica una longitud de contexto concreta, por lo que no se puede confirmar soporte de ventanas largas.

## Casos de uso

- Post-entrenamiento supervisado (SFT) para dominios verticales: el modelo sirve como base para afinar con datasets propios de atención al cliente, legal o sanitario, aprovechando su rendimiento en MMLU y BBH frente a alternativas de tamaño similar.
- Generación de código en pipelines internos: con HumanEval 51,2 y MultiPL-E 46,3, es adecuado como base para un modelo de autocompletado o revisión de código tras un ajuste fino con datos del repositorio de la organización.
- Tutoría y resolución de problemas matemáticos: GSM8K 79,9 y MATH 44,2 lo hacen útil como base para asistentes educativos que requieran razonamiento aritmético y algebraico, previo ajuste conversacional.
- Investigación en alineación y RLHF: al ser un modelo base Apache 2.0, permite experimentar con DPO, PPO o RLAIF sin restricciones de licencia y comparar contra Mistral-7B o Llama-3-8B.
- Evaluación comparativa de tokenizadores multilingües: su tokenizador mejorado y sus resultados en Multi-Exam y Multi-Understanding lo convierten en una base para estudiar eficiencia de tokenización en lenguas no inglesas.
- Destilación y generación de datos sintéticos: puede emplearse para producir corpus sintéticos de razonamiento o código que alimenten modelos más pequeños, dado su equilibrio entre tamaño (7,6B) y calidad en benchmarks.
- Clasificación y extracción de información: mediante ajuste fino con cabezas de clasificación, es viable para tareas de etiquetado de documentos o extracción de entidades en inglés.

## Benchmarks y rendimiento

Resultados publicados en la model card (modelo base, sin alineación):

| Dataset | Mistral-7B | Gemma-7B | Llama-3-8B | Qwen1.5-7B | Qwen2-7B |
|---|---|---|---|---|---|
| Parámetros | 7,2B | 8,5B | 8,0B | 7,7B | 7,6B |
| Parámetros no-embedding | 7,0B | 7,8B | 7,0B | 6,5B | 6,5B |
| MMLU | 64,2 | 64,6 | 66,6 | 61,0 | **70,3** |
| MMLU-Pro | 30,9 | 33,7 | 35,4 | 29,9 | **40,0** |
| GPQA | 24,7 | 25,7 | 25,8 | 26,7 | **31,8** |
| Theorem QA | 19,2 | 21,5 | 22,1 | 14,2 | **31,1** |
| BBH | 56,1 | 55,1 | 57,7 | 40,2 | **62,6** |
| HellaSwag | **83,2** | 82,2 | 82,1 | 78,5 | 80,7 |
| Winogrande | 78,4 | **79,0** | 77,4 | 71,3 | 77,0 |
| ARC-C | 60,0 | **61,1** | 59,3 | 54,2 | 60,6 |
| TruthfulQA | 42,2 | 44,8 | 44,0 | 51,1 | **54,2** |
| HumanEval | 29,3 | 37,2 | 33,5 | 36,0 | **51,2** |
| MBPP | 51,1 | 50,6 | 53,9 | 51,6 | **65,9** |
| EvalPlus | 36,4 | 39,6 | 40,3 | 40,0 | **54,2** |
| MultiPL-E | 29,4 | 29,7 | 22,6 | 28,1 | **46,3** |
| GSM8K | 52,2 | 46,4 | 56,0 | 62,5 | **79,9** |
| MATH | 13,1 | 24,3 | 20,5 | 20,3 | **44,2** |
| C-Eval | 47,4 | 43,6 | 49,5 | 74,1 | **83,2** |
| CMMLU | - | - | 50,8 | 73,1 | **83,9** |
| Multi-Exam | 47,1 | 42,7 | 52,3 | 47,7 | **59,2** |
| Multi-Understanding | 63,3 | 58,3 | 68,6 | 67,6 | **72,0** |
| Multi-Mathematics | 26,3 | 39,1 | 36,3 | 37,3 | **57,5** |
| Multi-Translation | 23,3 | 31,2 | **31,9** | 28,4 | 31,5 |

Qwen2-7B lidera en 19 de las 22 métricas recogidas; solo cede en HellaSwag, Winogrande, ARC-C y Multi-Translation.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más caché KV y activaciones; se recomienda un mínimo de 18-20 GB para inferencia con contexto moderado.
- Cuantización a 8 bits: en torno a 8 GB de VRAM; a 4 bits, en torno a 4-5 GB, aunque la model card no publica artefactos cuantizados oficiales.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegues con concurrencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 y en RTX 3090/4080 con cuantización; en GPUs de 8-12 GB requiere cuantización a 4 bits.
- Opciones de despliegue: `transformers>=4.37.0`, vLLM, TGI, llama.cpp y Ollama (estos dos últimos requieren conversión a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HumanEval | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen2-7B | 7,6B | No disponible | 70,3 | 51,2 | 79,9 | Apache 2.0 | Hugging Face |
| Mistral-7B | 7,2B | No disponible | 64,2 | 29,3 | 52,2 | Apache 2.0 | Hugging Face |
| Llama-3-8B | 8,0B | No disponible | 66,6 | 33,5 | 56,0 | Meta Llama 3 (uso comunitario) | Hugging Face |
| Gemma-7B | 8,5B | No disponible | 64,6 | 37,2 | 46,4 | Gemma Terms of Use | Hugging Face |

Qwen2-7B ofrece la mejor relación rendimiento/parámetros del grupo en conocimiento, código y matemáticas, con licencia Apache 2.0 más permisiva que las de Llama 3 y Gemma.

## Limitaciones y advertencias

- Es un modelo base sin alineación: no está diseñado para uso conversacional directo y puede generar contenido inapropiado, incoherente o no seguir instrucciones.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad más allá de TruthfulQA (54,2).
- Los metadatos declaran únicamente inglés, aunque los benchmarks muestran buen rendimiento en chino y otras lenguas; el soporte multilingüe real depende del tokenizador y no está garantizado por el autor del repo.
- La longitud de contexto no se especifica, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el repo es una réplica de terceros (ArchiveStudio) con 0 likes y 577 descargas; se recomienda contrastar los pesos con el repositorio oficial Qwen/Qwen2-7B antes de producción.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; el post-entrenamiento y la moderación corren a cargo del integrador.
- Ausencia de tool calling, agentes o modo de razonamiento explícito en la información disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ArchiveStudio/Qwen2-7B
- Blog oficial de Qwen2: https://qwenlm.github.io/blog/qwen2/
- GitHub de Qwen2: https://github.com/QwenLM/Qwen2
- Documentación: https://qwen.readthedocs.io/en/latest/
- Informe técnico (cita): Qwen2 Technical Report, 2024
