# ArchiveStudio/Qwen2-0.5B

## Resumen

Qwen2-0.5B es el modelo base (no alineado) de menor tamano de la familia Qwen2, desarrollada por Alibaba Cloud. Se trata de un transformer decoder-only de 494.032.768 parametros (segun los pesos en safetensors) disenado para generacion de texto y como punto de partida para post-entrenamiento. El repositorio `ArchiveStudio/Qwen2-0.5B` es una redistribucion del modelo original bajo licencia Apache 2.0.

El modelo emplea una arquitectura transformer con activacion SwiGLU, sesgo en las proyecciones QKV y group query attention (GQA), ademas de un tokenizador mejorado adaptado a multiples idiomas y codigo. Con aproximadamente 0,35B de parametros no-embebidos, esta pensado para entornos con recursos muy limitados, prototipado rapido y experimentacion con tecnicas de ajuste fino.

Su relevancia actual radica en que ofrece un rendimiento competitivo frente a modelos de mayor tamano en tareas de comprension y generacion (MMLU 45,4, GSM8K 36,5), lo que lo convierte en una opcion atractiva para despliegues en CPU, dispositivos edge y pipelines de bajo coste. No obstante, al ser un modelo base, no esta alineado para conversacion y requiere post-entrenamiento para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, attention QKV bias y group query attention (GQA) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se distribuyen en safetensors; se puede cuantizar a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | ingles (segun la model card y los tags; el tokenizador esta adaptado a multiples idiomas, pero el entrenamiento declarado es en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen2-0.5B es un modelo de lenguaje decoder-only basado en la arquitectura Transformer. Incorpora activacion SwiGLU en las capas feed-forward, sesgo en las proyecciones de query, key y value, y group query attention (GQA) para reducir el coste de memoria del KV cache durante la inferencia. El tokenizador fue rediseñado para adaptarse a multiples lenguajes naturales y codigo, aunque la model card declara unicamente el ingles como idioma soportado.

El modelo forma parte de la serie Qwen2, que incluye modelos base e instruction-tuned de 0,5 a 72 mil millones de parametros, incluyendo una variante Mixture-of-Experts. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset para esta variante de 0,5B. Tampoco se especifica si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo base, la recomendacion explicita del autor es aplicar post-entrenamiento (SFT, RLHF, continued pretraining) antes de usarlo para generacion. Como innovaciones tecnicas destacables de la familia se mencionan el tokenizador mejorado y la atencion GQA, pero no se documentan mecanismos adicionales como decodificacion especulativa o attention linear para este tamano concreto.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Comprension lectora y respuesta a preguntas de conocimiento general (evaluado en MMLU, MMLU-Pro, ARC-C, HellaSwag, Winogrande).
- Razonamiento basico y resolucion de problemas matematicos de nivel escolar (GSM8K, MATH).
- Generacion de codigo en Python y otros lenguajes (HumanEval, MBPP, MultiPL-E).
- Capacidades multilingues limitadas segun la evaluacion en C-Eval y CMMLU (chino) y tareas multilingues de la familia, aunque la model card declara solo ingles.
- No se documenta soporte nativo de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni multi-step reasoning nativo.
- No se documenta modo thinking, vision ni audio.
- Al ser un modelo base, no incluye plantilla de chat ni alineacion conversacional.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: el modelo cabe en CPU y en GPUs de gama baja, lo que permite iterar sobre prompts y plantillas sin infraestructura dedicada.
- Punto de partida para fine-tuning con SFT o LoRA: al ser un modelo base de 0,5B, el ajuste fino es viable en una unica GPU consumer, lo que facilita experimentos academicos y de investigacion.
- Clasificacion y etiquetado de texto a gran escala: su bajo coste de inferencia permite procesar volumenes elevados de documentos para tareas de categorizacion o extraccion, siempre que se ajuste previamente.
- Generacion de codigo asistida en entornos con recursos limitados: con un fine-tuning especifico, puede integrarse en editores o scripts de automatizacion donde no es viable desplegar modelos mayores.
- Educacion e investigacion sobre LLMs: sirve como banco de pruebas para estudiar tecnicas de cuantizacion, destilacion o evaluacion de sesgos en modelos pequenos.
- Despliegue en dispositivos edge o embebidos: su tamano (aproximadamente 1 GB en safetensors, menos tras cuantizacion) permite ejecucion local en portatiles y placas con aceleracion basica.
- Generacion de datos sinteticos para entrenamiento: puede usarse para producir corpus de texto a bajo coste en pipelines de data augmentation, con revision posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card para Qwen2-0.5B frente a modelos comparables:

| Dataset | Phi-2 | Gemma-2B | MiniCPM | Qwen1.5-1.8B | Qwen2-0.5B | Qwen2-1.5B |
|---|---|---|---|---|---|---|
| Parametros no-embebidos | 2.5B | 2.0B | 2.4B | 1.3B | 0.35B | 1.3B |
| MMLU | 52.7 | 42.3 | 53.5 | 46.8 | 45.4 | 56.5 |
| MMLU-Pro | - | 15.9 | - | - | 14.7 | 21.8 |
| Theorem QA | - | - | - | - | 8.9 | 15.0 |
| HumanEval | 47.6 | 22.0 | 50.0 | 20.1 | 22.0 | 31.1 |
| MBPP | 55.0 | 29.2 | 47.3 | 18.0 | 22.0 | 37.4 |
| GSM8K | 57.2 | 17.7 | 53.8 | 38.4 | 36.5 | 58.5 |
| MATH | 3.5 | 11.8 | 10.2 | 10.1 | 10.7 | 21.7 |
| BBH | 43.4 | 35.2 | 36.9 | 24.2 | 28.4 | 37.2 |
| HellaSwag | 73.1 | 71.4 | 68.3 | 61.4 | 49.3 | 66.6 |
| Winogrande | 74.4 | 66.8 | - | 60.3 | 56.8 | 66.2 |
| ARC-C | 61.1 | 48.5 | - | 37.9 | 31.5 | 43.9 |
| TruthfulQA | 44.5 | 33.1 | - | 39.4 | 39.7 | 45.9 |
| C-Eval | 23.4 | 28.0 | 51.1 | 59.7 | 58.2 | 70.6 |
| CMMLU | 24.2 | - | 51.1 | 57.8 | 55.1 | 70.3 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (494M parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,5 GB; en 4 bits: aproximadamente 0,25-0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3050, etc.) e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (>=4.37.0), llama.cpp (tras conversion a GGUF), Ollama, vLLM, TGI y otros frameworks compatibles con arquitectura Qwen2.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en GPU y throughput alto en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2-0.5B | 494M (0.35B no-emb) | no disponible | 45.4 | 36.5 | Apache 2.0 | Hugging Face |
| Qwen1.5-1.8B | 1.8B (1.3B no-emb) | no disponible | 46.8 | 38.4 | Apache 2.0 | Hugging Face |
| Gemma-2B | 2B (2.0B no-emb) | no disponible | 42.3 | 17.7 | Gemma Terms | Hugging Face |
| Phi-2 | 2.7B (2.5B no-emb) | no disponible | 52.7 | 57.2 | MIT | Hugging Face |

Qwen2-0.5B ofrece un rendimiento en MMLU (45,4) cercano a Qwen1.5-1.8B (46,8) con menos de un tercio de los parametros no-embebidos, y supera a Gemma-2B en MMLU y GSM8K pese a ser mucho menor. Phi-2, con 2,5B no-embebidos, sigue siendo superior en la mayoria de tareas, pero a costa de un tamano 7 veces mayor.

## Limitaciones y advertencias

- Modelo base no alineado: no incluye plantilla de chat ni entrenamiento conversacional; su uso directo para generacion puede producir texto incoherente o repetitivo. El autor recomienda explicitamente aplicar SFT, RLHF o continued pretraining.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de conocimiento factual.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la informacion proporcionada; al entrenarse con datos web a gran escala, es probable que herede sesgos sociales y culturales.
- Limitaciones de idioma: la model card declara unicamente ingles, aunque el tokenizador este adaptado a multiples idiomas. El rendimiento en castellano no esta evaluado y probablemente sea limitado.
- Longitud de contexto: no se especifica en la informacion proporcionada; conviene verificar la documentacion oficial de Qwen2 antes de desplegarlo con secuencias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente.
- Caveat de produccion: al ser una redistribucion de terceros (`ArchiveStudio`), conviene verificar la integridad de los pesos frente al repositorio oficial de Qwen antes de usarlos en entornos criticos.
- Ausencia de soporte documentado de tool calling, agentes o modos especiales: no se debe asumir estas capacidades sin validacion empirica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchiveStudio/Qwen2-0.5B
- Repositorio oficial Qwen2-0.5B: https://huggingface.co/Qwen/Qwen2-0.5B
- Blog de Qwen2: https://qwenlm.github.io/blog/qwen2/
- GitHub de Qwen2: https://github.com/QwenLM/Qwen2
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Version posterior recomendada: https://huggingface.co/Qwen/Qwen2.5-0.5B
