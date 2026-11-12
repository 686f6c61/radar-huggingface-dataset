# OpenMinded-Labs/CodeAiley-14B

## Resumen

CodeAiley-14B es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-14B realizado por OpenMinded-Labs mediante la tecnica DoRA (Weight-Decomposed Low-Rank Adaptation) y cuantizado a 4 bits en formato MLX para su ejecucion en Apple Silicon. Forma parte del proyecto Ailey 2.0, un asistente de IA local con personalidad definida que se ejecuta integramente en el dispositivo del usuario. El modelo esta disenado como un "agente de codigo completo" con una infusion de personalidad denominada "Ailey", y se plantea como un componente de carga bajo demanda para tareas de programacion pesadas.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5 y cuenta con 14.770.033.664 parametros totales (aproximadamente 14,7 mil millones). El repositorio ocupa 8,5 GB, coherente con una cuantizacion de 4 bits de un modelo de ese tamano. La libreria utilizada es MLX, el framework de Apple para computacion en silicio de la compania, lo que limita su despliegue a equipos con chips de la serie M.

La relevancia de este modelo es acotada: se trata de un ajuste fino de nicho, con un unico dispositivo de referencia documentado (Apple M4 con 24 GB de memoria unificada), sin datos publicados de benchmarks, idiomas soportados ni pipeline declarado. Su interes principal radica en mostrar un flujo de trabajo de personalizacion local sobre un coder consolidado, no en competir en rendimiento con modelos de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-14B) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); formato cuantizado publicado |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | safetensors en formato MLX (4-bit) |
| Libreria | MLX |
| Tamano del repositorio | 8,5 GB |
| Dispositivo de referencia | Apple M4, 24 GB de memoria unificada |
| Metodo de ajuste | DoRA (Weight-Decomposed Low-Rank Adaptation) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-14B, un transformer decoder-only con atencion causal estandar de la familia Qwen2.5. Sobre esa base, OpenMinded-Labs aplico un ajuste fino con DoRA, una variante de LoRA que descompone la actualizacion de pesos en un componente de magnitud y otro de direccion, lo que en la literatura suele mejorar la estabilidad y la calidad del ajuste frente a LoRA convencional con un coste computacional similar. El objetivo declarado del ajuste es doble: reforzar el comportamiento de agente de codigo y "infundir" una personalidad concreta (Ailey) en las respuestas.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o preferencias. Tampoco se especifica el proceso de cuantizacion a 4 bits mas alla de que se realizo con MLX. El modelo se publica ya cuantizado, por lo que no hay pesos en precision completa en el repositorio.

## Capacidades

- Generacion de codigo y asistencia a la programacion, heredadas de la base Qwen2.5-Coder-14B.
- Comportamiento de "agente de codigo completo" segun la model card, orientado a tareas de programacion de mayor alcance que la simple autocompletacion.
- Personalidad "Ailey" integrada mediante ajuste fino, pensada para un asistente local con tono y estilo consistentes.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Carga bajo demanda para tareas pesadas, segun el diseno del proyecto Ailey 2.0.
- Soporte de tool calling, agentes multi-paso, capacidades multilingues o modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion local en un Mac: el modelo se ejecutaria con MLX sobre un Apple M4 con 24 GB de memoria unificada, ofreciendo autocompletado y generacion de funciones sin enviar codigo a terceros, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Agente de refactorizacion en el editor: integrado en un flujo de trabajo tipo IDE, el modelo puede proponer reescrituras y cambios multiarchivo; su naturaleza de "code agent" encaja con tareas de varios pasos, aunque la ausencia de datos de contexto publicados obliga a validar el comportamiento en cada caso.
- Prototipado offline en portatil: al no requerir GPU dedicada ni conexion, permite trabajar en entornos sin red, como vuelos o instalaciones aisladas, siempre que el equipo tenga memoria unificada suficiente.
- Generacion de pruebas unitarias: el modelo puede producir tests a partir de firmas de funciones y docstrings, un uso tipico de los modelos coder, con la ventaja de que el codigo de la empresa no sale del dispositivo.
- Chat tecnico con personalidad consistente: el ajuste de personalidad Ailey lo hace adecuado para un asistente conversacional de desarrollo con un tono estable, por ejemplo en herramientas internas de soporte a desarrolladores.
- Evaluacion y experimentacion con DoRA: el repositorio sirve como referencia practica para investigadores que quieran reproducir un pipeline de ajuste fino y cuantizacion MLX sobre un coder de 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el repositorio pesa 8,5 GB en cuantizacion de 4 bits; se recomienda al menos 16 GB de memoria unificada y el autor documenta su ejecucion en 24 GB.
- GPU/dispositivo recomendado: Apple Silicon con memoria unificada suficiente; el unico dispositivo documentado es un Apple M4 de 24 GB.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; el formato MLX no esta pensado para CUDA, aunque seria posible reconvertir los pesos a otros formatos, algo no documentado por el autor.
- Despliegue: libreria MLX (mlx-lm) en macOS. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeAiley-14B | 14,77 B | no disponible | 4 bits MLX | other | Hugging Face (MLX) |
| Qwen2.5-Coder-14B | 14,7 B | 32.768 tokens (modelo base) | completa, GGUF, AWQ, etc. | Apache 2.0 (modelo base) | Hugging Face, amplia adopcion |
| DeepSeek-Coder-V2-Lite | 15,7 B (2,4 B activos) | 128.000 tokens | completa y cuantizaciones | licencia propia permisiva | Hugging Face |
| CodeLlama-13B | 13 B | 16.384 tokens | completa y GGUF | licencia Llama | Hugging Face |

La comparacion con el modelo base es la mas relevante: CodeAiley-14B anade un ajuste de personalidad y una cuantizacion MLX, pero pierde la precision completa y la portabilidad de formatos del original. Frente a DeepSeek-Coder-V2-Lite y CodeLlama-13B, ofrece un tamano similar pero carece de datos publicados de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- La licencia figura como "other" y no se detallan sus terminos en la informacion disponible; es imprescindible revisarla antes de cualquier uso comercial, especialmente por las obligaciones heredadas del modelo base.
- No hay benchmarks publicados, por lo que no puede verificarse la calidad del ajuste ni el impacto de la personalidad en tareas de codigo.
- El ajuste de personalidad puede degradar el rendimiento en tareas tecnicas si el dataset de infusion no estuvo bien balanceado; no hay datos que lo confirmen o descarten.
- La cuantizacion a 4 bits introduce perdida de precision frente al modelo base en precision completa, con posible impacto en tareas de razonamiento complejo.
- El modelo esta empaquetado exclusivamente para MLX, lo que limita su uso a equipos Apple Silicon y dificulta su despliegue en infraestructura de servidores convencional.
- No se documentan los idiomas soportados; el modelo base Qwen2.5-Coder esta orientado principalmente al ingles y al chino, por lo que el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs y librerias poco comunes; requiere validacion del codigo generado.
- Proyecto de nicho con muy pocas descargas (7) y sin likes, lo que implica ausencia de validacion comunitaria y soporte limitado.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMinded-Labs/CodeAiley-14B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B
- Libreria MLX: https://github.com/ml-explore/mlx
- Documentacion de mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Paper de DoRA: https://arxiv.org/abs/2402.09353
