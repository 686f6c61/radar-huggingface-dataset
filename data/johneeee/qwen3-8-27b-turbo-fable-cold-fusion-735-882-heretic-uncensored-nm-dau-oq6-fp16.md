# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ6-fp16

## Resumen

El modelo `Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ6-fp16` es una cuantización en 6 bits (mixed-precision) del fine-tune `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, desarrollado originalmente por DavidAU con contribuciones de Nightmedia y otros autores. Se basa en el modelo base Qwen3.8-27B de Alibaba, un modelo denso de 27 mil millones de parámetros con arquitectura híbrida (atención lineal en 48 de sus 64 capas), torre de visión integrada y una cabeza de draft MTP para decodificación especulativa. El fine-tune está orientado a la generación de texto sin censura, instrucción general, razonamiento, análisis y creatividad.

La cuantización ha sido realizada con la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors, con 6 bits y group size de 64. El repositorio ocupa 22,5 GB y contiene 26.895.998.464 parámetros. No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline de uso. Este modelo está pensado para ejecutarse en hardware Apple Silicon mediante MLX, aunque también puede desplegarse en otras plataformas si se convierte a otros formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense hybrid-attention, 64 capas, 48 con linear attention) |
| Parametros totales | 26.895.998.464 (aprox. 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (extensible a 1M segun el modelo base) |
| Tipos de cuantizacion | 6-bit (oQ mixed-precision, group size 64) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (tambien disponible en GGUF en variantes del mismo fine-tune) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con atención híbrida: 48 de sus 64 capas utilizan atención lineal (linear attention) para reducir el coste computacional en contextos largos, mientras que las 16 restantes usan atención completa. Incluye una torre de visión integrada (aunque no se detalla su uso en este fine-tune) y una cabeza MTP (multi-token prediction) que actúa como draft head para decodificación especulativa, acelerando la generación. El contexto nativo es de 262.144 tokens, extensible a 1 millón.

El fine-tune `TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` fue desarrollado por DavidAU con contribuciones de Nightmedia y otros autores no revelados. Según la descripción del autor, es el primer fine-tune que supera 730 puntos en ARC-C (735, 144 puntos más que Qwen3.8-27B) y 880 en ARC-E, situándose en la "zona de inteligencia" de modelos como OpenAI, Claude y Gemini. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el método de alineación (RLHF, DPO, etc.). El nombre "Heretic-Uncensored" sugiere que se ha eliminado o reducido la censura del modelo base.

La cuantización oQ (oMLX v0.6.4) aplica una cuantización de precisión mixta en 6 bits con group size 64, optimizada para MLX. Esto reduce el tamaño del modelo a 22,5 GB, frente a los aproximadamente 54 GB que ocuparía en fp16.

## Capacidades

- Generación de texto sin censura: el fine-tune está diseñado para producir contenido que el modelo base podría rechazar, aunque esto conlleva riesgos de sesgo y contenido inapropiado.
- Razonamiento y análisis: según el autor, supera al modelo base en tareas de razonamiento (ARC-C 735, ARC-E 880), lo que sugiere una mejora en capacidades de inferencia lógica.
- Instrucción general: sigue instrucciones complejas y multi-turno, adecuado para asistentes conversacionales.
- Creatividad: el nombre "Fable" y "Cold-Fusion" indican un enfoque en generación creativa de historias, diálogos y contenido literario.
- Soporte de tool calling y function calling: no se especifica explícitamente, pero el modelo base Qwen3.8-27B lo soporta; es probable que el fine-tune lo conserve.
- Capacidades multilingües: no confirmadas para este fine-tune, aunque el base soporta múltiples idiomas.
- Decodificación especulativa: gracias a la cabeza MTP del modelo base, puede acelerar la generación si se usa con un backend que la soporte (p.ej. vLLM).
- Visión: el modelo base incluye una torre de visión, pero no se indica si el fine-tune la conserva o la utiliza.

## Casos de uso

- Asistente conversacional sin restricciones: el modelo puede mantener diálogos largos y complejos sobre temas que otros modelos censuran, como debates filosóficos, contenido para adultos o exploración de ideas controvertidas. Su contexto de 262K tokens permite mantener el historial completo de conversaciones extensas.
- Generación de ficción y narrativa creativa: gracias a su entrenamiento "Fable" y "Cold-Fusion", es adecuado para escribir cuentos, novelas, guiones o diálogos con un estilo literario rico. Puede usarse en herramientas de escritura asistida o generación automática de contenido.
- Razonamiento y resolución de problemas: con puntuaciones altas en ARC-C y ARC-E, puede emplearse en sistemas de tutoría, análisis de datos o resolución de problemas lógicos y matemáticos, aunque no se han publicado benchmarks específicos de matemáticas o código.
- Desarrollo de agentes autónomos: si conserva el soporte de tool calling del base, puede integrarse en pipelines de agentes que necesiten llamar a APIs, consultar bases de datos o ejecutar acciones en entornos simulados.
- Investigación en alineación y seguridad: al ser un modelo "uncensored", puede utilizarse para estudiar los efectos de la eliminación de restricciones en la generación de texto, comparando comportamientos con el modelo base.
- Prototipado rápido en Apple Silicon: al estar cuantizado en MLX, puede ejecutarse localmente en Macs con chip M-series, permitiendo a desarrolladores probar aplicaciones de IA generativa sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización concreta. El autor del fine-tune original (DavidAU) menciona en su model card que el modelo sin cuantizar supera 730 en ARC-C y 880 en ARC-E, pero no se proporcionan tablas detalladas ni comparaciones con otros modelos. Para el modelo base Qwen3.8-27B, se sabe que ha sido evaluado en tareas como MathVision, pero no se dispone de los valores exactos en la información proporcionada. Por tanto, no se pueden presentar datos numéricos fiables de rendimiento para este modelo.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 6 bits ocupa 22,5 GB en disco. Para inferencia, se recomienda al menos 24 GB de memoria unificada en Apple Silicon (M1 Max, M2 Ultra, M3 Max) o una GPU con 24 GB de VRAM (RTX 3090/4090, A5000). Con cuantización a 4 bits (no incluida en este repo) podría caber en 16 GB.
- GPU recomendadas: cualquier GPU compatible con MLX (Apple Silicon) o, si se convierte a otros formatos, GPUs NVIDIA con soporte CUDA. En Apple Silicon, los chips M1 Pro/Max, M2 Pro/Max/Ultra y M3 Pro/Max/Ultra son adecuados.
- Si cabe en consumer GPU: sí, en GPUs de 24 GB como la RTX 3090 o RTX 4090, siempre que se convierta el formato a GGUF o GPTQ. En GPUs de 16 GB (RTX 4080, 4070 Ti) no cabría sin cuantización adicional.
- Opciones de despliegue: MLX (nativo), llama.cpp (si se convierte a GGUF), vLLM (si se convierte a safetensors estándar), Ollama (mediante conversión). El formato MLX safetensors es específico de Apple, por lo que para otros entornos habrá que convertir.
- Latencia y throughput: no disponibles. La decodificación especulativa del modelo base podría mejorar la velocidad si el backend la soporta, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Modelo oficial, con censura, soporte vision y MTP |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (fp16) | 27B | 262K | no disponible | safetensors | Fine-tune sin censura, mejor rendimiento en ARC |
| Este modelo (oQ6-fp16) | 27B | 262K | no disponible | MLX safetensors | Cuantizacion 6-bit del fine-tune anterior |
| Llama 3.1 8B (comparativo de tamaño menor) | 8B | 128K | Llama 3.1 | safetensors, GGUF | Mucho menor, no comparable en capacidad |

La comparativa directa con otros modelos de 27B (como Llama 3.1 27B o Mistral Large) no está disponible en la información proporcionada. El modelo base Qwen3.8-27B es el punto de referencia más relevante, y este fine-tune pretende superarlo en razonamiento (según el autor) a la vez que elimina la censura.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica ninguna licencia, lo que impide su uso comercial legal sin autorización explícita del autor. Es un riesgo importante para producción.
- Contenido sin censura: al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o perjudicial. No debe desplegarse en entornos públicos sin filtros adicionales de moderación.
- Sesgos y alucinaciones: al ser un fine-tune sin alineación, es probable que presente más sesgos y alucinaciones que el modelo base. No hay datos de evaluación de seguridad.
- Idiomas no confirmados: aunque el base soporta múltiples idiomas, no se garantiza que el fine-tune los mantenga con la misma calidad.
- Formato propietario: el formato MLX safetensors limita su uso a ecosistemas Apple. Para otros entornos, requiere conversión, lo que puede introducir pérdidas de precisión.
- Datos de entrenamiento desconocidos: no se sabe con qué datos se entrenó el fine-tune, lo que dificulta evaluar su comportamiento en dominios específicos.
- Contexto largo: aunque el base soporta 262K tokens, no se ha verificado que el fine-tune mantenga la misma calidad en contextos extremadamente largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ6-fp16
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante GGUF del mismo fine-tune (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Descripcion del fine-tune en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog de AMD sobre ejecucion de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
