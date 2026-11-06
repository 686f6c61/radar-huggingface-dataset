# ArchiveStudio/Qwen2-1.5B

## Resumen

Qwen2-1.5B es el modelo base (no alineado) de la familia Qwen2 desarrollada por Alibaba Cloud, en su variante de 1.500 millones de parametros. Se trata de un modelo de lenguaje decoder-only basado en Transformer con activacion SwiGLU, atencion con sesgo en las proyecciones QKV y Group Query Attention (GQA), ademas de un tokenizador mejorado adaptado a multiples idiomas y codigo. Esta ficha corresponde a la publicacion espejo del repositorio oficial bajo el identificador ArchiveStudio/Qwen2-1.5B en Hugging Face.

El modelo resuelve la necesidad de disponer de un LLM compacto y con licencia permisiva (Apache 2.0) que pueda ejecutarse en hardware modesto, incluyendo GPU de consumo, y que sirva como base para fine-tuning supervisado (SFT), RLHF o preentrenamiento continuado. Con 1.543.714.304 parametros totales y un repositorio de 3,1 GB en safetensors, esta pensado para tareas de generacion de texto, comprension del lenguaje, codigo, matematicas y razonamiento, con soporte multilingue aunque la model card declara unicamente el ingles como idioma oficial.

Su relevancia actual radica en que, pese a su tamano reducido, la model card reporta resultados competitivos frente a modelos del mismo orden (Phi-2, Gemma-2B, MiniCPM, Qwen1.5-1.8B) en benchmarks como MMLU, GSM8K, MATH y C-Eval. Es una opcion atractiva para prototipado rapido, despliegue en el borde (edge) y experimentacion con tecnicas de alineamiento sobre una base solida y de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, atencion QKV con sesgo y Group Query Attention (GQA) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas en el repo) |
| Idiomas soportados | Ingles (declarado); la model card menciona tokenizador adaptado a multiples idiomas y codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con activacion SwiGLU, sesgo en las proyecciones de query, key y value, y Group Query Attention (GQA) para reducir el coste de memoria del KV cache durante la inferencia. Incorpora un tokenizador mejorado respecto a generaciones anteriores, disenado para adaptarse a multiples lenguajes naturales y a codigo fuente. La familia Qwen2 incluye modelos base e instruct desde 0,5 B hasta 72 B, ademas de una variante Mixture-of-Experts; este repositorio contiene exclusivamente el modelo base de 1,5 B.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en esta variante base. Indica explicitamente que se trata de un modelo preentrenado sin alinear y desaconseja su uso directo para generacion de texto, recomendando aplicar post-entrenamiento (SFT, RLHF, preentrenamiento continuado) antes de usarlo en produccion. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y modelado del lenguaje en ingles.
- Comprension lectora y respuesta a preguntas de conocimiento general (evaluado en MMLU, MMLU-Pro, TruthfulQA, ARC-C, HellaSwag, Winogrande).
- Razonamiento de sentido comun y multi-paso (BBH, Theorem QA).
- Generacion de codigo en multiples lenguajes (evaluado en EvalPlus y MultiPL-E: Python, C++, Java, PHP, TypeScript, C#, Bash, JavaScript).
- Razonamiento matematico (GSM8K, MATH).
- Capacidad multilingue parcial, con resultados destacados en chino (C-Eval, CMMLU) y evaluaciones en M3Exam, IndoMMLU, ruMMLU, BELEBELE, XCOPA, XWinograd, MGSM y Flores-101.
- No se documenta soporte nativo de tool calling, function calling, modo thinking, vision ni audio en esta variante base.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado mas alla de lo que permite el prompting directo.

## Casos de uso

- Fine-tuning supervisado (SFT) para un dominio vertical: al ser un modelo base con licencia Apache 2.0, se puede ajustar con datasets propios (atencion al cliente, legal, sanitario) sin restricciones de uso comercial, partiendo de una base ya entrenada en ingles y codigo.
- Prototipado rapido de asistentes conversacionales: el modelo cabe en GPU de consumo y permite iterar sobre prompts y arquitecturas de agente antes de escalar a modelos mayores.
- Generacion de codigo asistida en entornos con recursos limitados: sus resultados en HumanEval (31,1) y MBPP (37,4) lo hacen util como base para autocompletado o generacion de snippets tras un fine-tuning especifico del lenguaje.
- Educacion y tutoria automatizada: puede servir como motor de explicaciones y ejercicios de matematicas (GSM8K 58,5, MATH 21,7) tras un ajuste instructivo, con coste de inferencia muy bajo.
- Investigacion en alineamiento y RLHF: al ser un modelo base pequeno, es un banco de pruebas economico para experimentar con DPO, PPO o tecnicas de reward modeling sin grandes presupuestos de computo.
- Despliegue en el borde o en CPU: con 1,54 B de parametros y pesos safetensors de 3,1 GB, es viable en portatiles, mini-PC y dispositivos con GPU integrada para tareas de clasificacion, resumen o extraccion de informacion.
- Generacion aumentada por recuperacion (RAG) en ingles: puede actuar como generador final en pipelines RAG de bajo coste, siempre que se valide su calidad tras el ajuste correspondiente.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor (modelo base, no instruct):

| Dataset | Phi-2 | Gemma-2B | MiniCPM | Qwen1.5-1.8B | Qwen2-0.5B | Qwen2-1.5B |
|---|---|---|---|---|---|---|
| Parametros no-embedding | 2,5 B | 2,0 B | 2,4 B | 1,3 B | 0,35 B | 1,3 B |
| MMLU | 52,7 | 42,3 | 53,5 | 46,8 | 45,4 | 56,5 |
| MMLU-Pro | - | 15,9 | - | - | 14,7 | 21,8 |
| Theorem QA | - | - | - | - | 8,9 | 15,0 |
| HumanEval | 47,6 | 22,0 | 50,0 | 20,1 | 22,0 | 31,1 |
| MBPP | 55,0 | 29,2 | 47,3 | 18,0 | 22,0 | 37,4 |
| GSM8K | 57,2 | 17,7 | 53,8 | 38,4 | 36,5 | 58,5 |
| MATH | 3,5 | 11,8 | 10,2 | 10,1 | 10,7 | 21,7 |
| BBH | 43,4 | 35,2 | 36,9 | 24,2 | 28,4 | 37,2 |
| HellaSwag | 73,1 | 71,4 | 68,3 | 61,4 | 49,3 | 66,6 |
| Winogrande | 74,4 | 66,8 | - | 60,3 | 56,8 | 66,2 |
| ARC-C | 61,1 | 48,5 | - | 37,9 | 31,5 | 43,9 |
| TruthfulQA | 44,5 | 33,1 | - | 39,4 | 39,7 | 45,9 |
| C-Eval | 23,4 | 28,0 | 51,1 | 59,7 | 58,2 | 70,6 |
| CMMLU | 24,2 | - | 51,1 | 57,8 | 55,1 | 70,3 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, entre 4 y 6 GB segun longitud de contexto y tamano de batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,8-1 GB para pesos, aunque la cuantizacion no esta confirmada en el repositorio.
- GPU recomendadas: A100, H100, L40S para despliegues de produccion con alto throughput; RTX 4090, RTX 3090, RTX 4080 para desarrollo.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 y superiores; tambien en GPUs con 6-8 GB tras cuantizacion.
- Opciones de despliegue: transformers (>= 4.37.0, segun la model card), vLLM, TGI, llama.cpp y Ollama (estos ultimos requieren conversion a GGUF, no confirmada en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2-1.5B | 1,54 B | no disponible | 56,5 | 58,5 | Apache 2.0 | Hugging Face |
| Phi-2 | 2,7 B (2,5 B no-emb) | no disponible | 52,7 | 57,2 | MIT | Hugging Face |
| Gemma-2B | 2,5 B (2,0 B no-emb) | no disponible | 42,3 | 17,7 | Gemma Terms | Hugging Face |
| MiniCPM | 2,7 B (2,4 B no-emb) | no disponible | 53,5 | 53,8 | Apache 2.0 (uso comercial con registro) | Hugging Face |
| Qwen1.5-1.8B | 1,8 B (1,3 B no-emb) | no disponible | 46,8 | 38,4 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un modelo base sin alinear: la model card desaconseja explicitamente su uso directo para generacion de texto; requiere SFT, RLHF o preentrenamiento continuado.
- Riesgo elevado de alucinacion y de generar contenido incoherente o inseguro en tareas abiertas sin ajuste posterior.
- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse sobre datos web, es esperable que herede sesgos de genero, raza y cultura, pero no hay evaluacion publicada en esta ficha.
- Idioma: la model card declara unicamente ingles, aunque reporta resultados en chino y otras lenguas; el rendimiento fuera del ingles puede degradarse sin validacion previa.
- Longitud de contexto: no especificada en la informacion disponible; conviene verificar en la documentacion oficial de Qwen2 antes de disenar pipelines que dependan de ventanas largas.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario es responsable del cumplimiento normativo y de la atribucion correspondiente.
- El repositorio es un espejo (ArchiveStudio/Qwen2-1.5B) con 575 descargas y 0 likes; para produccion se recomienda usar el repositorio oficial Qwen/Qwen2-1.5B para garantizar integridad y actualizaciones.
- No se documentan garantias de seguridad, filtros de contenido ni evaluaciones de red teaming en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/ArchiveStudio/Qwen2-1.5B
- Blog oficial de Qwen2: https://qwenlm.github.io/blog/qwen2/
- Repositorio GitHub de Qwen2: https://github.com/QwenLM/Qwen2
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Repositorio oficial en Hugging Face (referencia de la familia): https://huggingface.co/Qwen/Qwen2-1.5B
- Informe tecnico Qwen2 (cita en model card): Qwen2 Technical Report, 2024
