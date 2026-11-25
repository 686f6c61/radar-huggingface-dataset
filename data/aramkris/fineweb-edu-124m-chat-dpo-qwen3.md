# aramkris/fineweb-edu-124m-chat-dpo-qwen3

## Resumen

FineWeb-Edu 124M chat (SFT + DPO) es un modelo de lenguaje de 162 millones de parámetros entrenado desde cero por el desarrollador independiente aramkris dentro del proyecto tinystories-ARM-model. No es un modelo de Qwen: se trata de un GPT propio cuya arquitectura se ha convertido exactamente al formato de ficheros de Qwen3 para que `transformers`, llama.cpp, Ollama y LM Studio lo ejecuten sin código adicional del proyecto. Resuelve el problema de obtener un modelo conversacional extremadamente pequeño, con plantilla de chat y pesos en safetensors y GGUF, útil para experimentación, docencia y despliegues con recursos mínimos.

El modelo parte de una base preentrenada con 2.500 millones de tokens de mini-fineweb-edu y Cosmopedia en un contexto de 512 tokens, y se afina en dos fases: SFT sobre smol-smoltalk con replay de texto de preentrenamiento (un quinto de cada lote), y dos rondas de DPO, la segunda con pares puntuados por Skywork-Reward-V2-Qwen3-0.6B. El resultado reduce la repetición de 4-gramas del 8,5% al 2,3% y eleva al 99% las respuestas que terminan por sí solas, manteniendo el conocimiento de la base (50,5% en 200 preguntas cerradas, frente al 57,5% de la base y el 44% sin replay).

Es relevante ahora porque demuestra un flujo completo de preentrenamiento, alineamiento y exportación a formatos de producción con un presupuesto de cómputo ínfimo, y porque su conversión al formato Qwen3 permite reutilizar todo el ecosistema de herramientas ya existente para ese formato, sin dependencias del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (formato de ficheros Qwen3; LayerNorm sin sesgo en lugar de RMSNorm) |
| Parametros totales | 162.150.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | bfloat16 (safetensors y GGUF bf16), Q8_0 (GGUF 8 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), GGUF (bf16 y Q8_0) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 124M parámetros (162M en el recuento real de safetensors, con embeddings de salida no atados) con normas de bloque LayerNorm sin sesgo, donde Qwen3 usa RMSNorm. La exportación hace la corriente residual de media cero (centrando los embeddings de entrada y todas las matrices que escriben en ella), de modo que ambas normas resultan la misma función; la capa de salida conserva los embeddings originales y las proyecciones de query y key se escalan por √10 para que el épsilon único de Qwen3 imite el efecto del QK-norm original. No hay reentrenamiento en la conversión: es el mismo modelo.

El entrenamiento consta de cuatro etapas. Primero, preentrenamiento con 2.500 millones de tokens de mini-fineweb-edu y Cosmopedia a 512 tokens de contexto. Segundo, instruction tuning sobre smol-smoltalk con learning rate 5e-5 y replay de texto de preentrenamiento en un quinto de cada lote, técnica que evita el olvido catastrófico (sin ella, la puntuación en 200 preguntas de conocimiento cerrado caía del 57,5% al 44%; con ella se mantiene en el 50%). Tercero, DPO sobre 2.000 pares de preferencia donde una respuesta de referencia se prefiere frente a la respuesta greedy del propio modelo afinado, lo que reduce la repetición. Cuarto, DPO sobre pares generados por un reward model: para 2.000 preguntas nuevas el modelo produce siete respuestas (greedy y seis muestras a temperatura 0,5), Skywork-Reward-V2-Qwen3-0.6B las puntúa y se prefiere la mejor frente a la peor, lo que limpia las respuestas sin coste de conocimiento.

## Capacidades

- Generación de texto conversacional en formato `User: …` / `Assistant: …`, con plantilla de chat incluida y terminación en `<|endoftext|>`.
- Respuestas multi-turno dentro de una ventana de 512 tokens.
- Razonamiento básico y conocimiento factual limitado, propio de un modelo de 124M parámetros.
- Generación de código y matemáticas muy limitada; no se documentan capacidades específicas en estas áreas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Inferencia compatible con `transformers`, llama.cpp, Ollama y LM Studio gracias a la conversión al formato Qwen3.

## Casos de uso

- Docencia y experimentación en alineamiento: permite reproducir un pipeline completo de preentrenamiento, SFT con replay y DPO por etapas con un coste de cómputo mínimo, ideal para cursos y talleres sobre entrenamiento de LLM.
- Despliegue en dispositivos con recursos muy limitados: con 174 MB en Q8_0 puede ejecutarse en CPU, Raspberry Pi o portátiles sin GPU, sirviendo como asistente de texto básico o generador de plantillas.
- Pruebas de integración de pipelines de inferencia: al ser compatible con llama.cpp, Ollama y la API OpenAI de llama-server, se usa como modelo de humo para validar infraestructura antes de desplegar modelos mayores.
- Generación de respuestas cortas y controladas: con una longitud media de 99 tokens y un 99% de respuestas que terminan solas, encaja en tareas de completado breve, resúmenes de una frase o respuestas de FAQ sintéticas.
- Investigación sobre olvido catastrófico: el modelo documenta el efecto del replay en la retención de conocimiento (57,5% frente a 44% sin replay), por lo que sirve como caso de estudio reproducible.
- Evaluación de reward models: el uso de Skywork-Reward-V2-Qwen3-0.6B para puntuar y filtrar respuestas es un ejemplo práctico de DPO asistido por reward model aplicable a otros proyectos pequeños.
- Base para fine-tuning específico de dominio: al ser MIT y de tamaño reducido, se puede reentrenar o afinar en un dominio concreto (por ejemplo, clasificación de texto o generación de formularios) sin grandes requisitos de hardware.

## Benchmarks y rendimiento

Resultados publicados en la model card (100 preguntas reservadas, decodificación greedy, salvo donde se indica):

| Metrica | Este modelo (19 nov) | Antes del paso 4 (18 nov) | Modelo base |
|---|---|---|---|
| Repetición de 4-gramas | 2,3% | 8,5% | no disponible |
| Respuestas que terminan solas | 99% | 87% | no disponible |
| Longitud media de respuesta (tokens) | 99 | 127 | no disponible |
| Conocimiento cerrado, opción múltiple (200 preguntas) | 50,5% | 50,5% | 57,5% |
| Conocimiento cerrado, respuesta correcta autónoma | 31,0% | 30,0% | 24% |
| Media de benchmarks (HellaSwag, LAMBADA, ARC-Easy, PIQA, Winogrande) | 40,5 | 40,5 | 41,5 |

Verificación de la conversión frente al modelo PyTorch original (mismas 100 preguntas):

| Metrica | Original (PyTorch) | Copia bfloat16 | Copia GGUF 8 bits |
|---|---|---|---|
| Repetición de 4-gramas | 2,3% | 2,3% | 2,9% |
| Respuestas que terminan solas | 99% | 98% | 98% |
| Longitud media de respuesta (tokens) | 99,0 | 98,8 | 100,4 |
| LAMBADA vía llama-server | 14,4% | 14,3% | 14,3% |

El resto de benchmarks estándar (MMLU, HumanEval, GSM8K) no se han publicado en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en bfloat16 y 0,2 GB en Q8_0, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) y también en CPU.
- Opciones de despliegue: `transformers` (bfloat16), llama.cpp (`llama-server --jinja -c 512`), Ollama (`ollama run hf.co/aramkris/fineweb-edu-124m-chat-dpo-qwen3:Q8_0`), LM Studio y text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada; el contexto de 512 tokens limita la carga por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-124m-chat-dpo-qwen3 | 162M | 512 | MIT | safetensors, GGUF | Modelo propio convertido a formato Qwen3; solo inglés |
| fineweb-edu-124m-chat-dpo | 162M | 512 | MIT | PyTorch (pesos nativos) | Versión anterior del mismo proyecto, sin conversión a Qwen3 |
| fineweb-edu-124m-base | 162M | 512 | MIT | safetensors | Base preentrenada sin SFT ni DPO |
| Qwen3 (modelos oficiales) | desde 0,6B | mayor | Apache 2.0 (según versión) | safetensors, GGUF | Familia oficial de Qwen; el modelo de esta ficha solo comparte formato de ficheros |

No se dispone de datos de benchmarks comparables con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento muy limitado: con 124M de parámetros, las respuestas son plausibles en forma pero a menudo incorrectas; el propio autor lo advierte.
- Riesgo elevado de alucinación en preguntas factuales; solo el 31% de las respuestas autónomas en conocimiento cerrado son correctas.
- Ventana de contexto de solo 512 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No soporta tool calling ni flujos de agentes.
- La licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción para tareas críticas.
- La conversión al formato Qwen3 altera la precisión: en 8 bits, 39 de 100 respuestas son idénticas palabra por palabra a las del modelo original, y el resto divergen por desempates cercanos.
- No debe confundirse con un modelo oficial de Qwen; solo comparte el formato de ficheros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo-qwen3
- Modelo base: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Versión anterior con pesos PyTorch nativos: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Script de exportación a Hugging Face: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/export_hf.py
- Script de conversión a GGUF: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/gguf.sh
- Script de verificación: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/check.py
- Reward model utilizado: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-0.6B
- Dataset mini-fineweb-edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
