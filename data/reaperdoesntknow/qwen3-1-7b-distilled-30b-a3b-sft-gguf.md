# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF

## Resumen

Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF es la version cuantizada en formato GGUF del modelo reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT, desarrollado por Reaperdoesntrun bajo el sello de Convergent Intelligence LLC (Research Division). Se trata de un modelo de 1.700 millones de parametros (2.031.739.904 reales segun safetensors) construido en dos fases: una destilacion de conocimiento desde Qwen3-30B-A3B-Instruct-2507 sobre 6.122 muestras de chain-of-thought de ambito STEM, seguida de un ajuste supervisado (SFT) sobre el dataset legal Alignment-Lab-AI/Lawyer-Instruct. El objetivo declarado es conseguir razonamiento estructurado y conocimiento juridico en un modelo lo bastante pequeno para ejecutarse en movil o edge.

La publicacion de esta variante GGUF es relevante porque traslada ese modelo base a llama.cpp, Ollama y LM Studio, con cuantizaciones que van de F16 (~3,8 GB) a Q4_K_M (~1,2 GB). El modelo hereda la arquitectura transformer densa de Qwen3-1.7B, con un contexto nativo que la model card no documenta explicitamente y que en los ejemplos de uso se limita a 1.024 tokens (`n_ctx=1024`), lo que sugiere un enfasis en generacion corta y controlada mas que en conversaciones largas.

El interes practico esta en la relacion tamano/capacidad: un modelo de 1,7B que, segun el autor, "rinde por encima de su peso" en derivaciones fisicas, ecuaciones diferenciales y seguimiento de instrucciones legales. La licencia Apache 2.0 y el formato GGUF lo hacen directamente desplegable en entornos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (~1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; los ejemplos de uso emplean `n_ctx=1024` |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de 1,7B parametros, y se entrena en dos etapas documentadas por el autor. La primera es una destilacion de conocimiento desde el profesor Qwen3-30B-A3B-Instruct-2507 sobre 6.122 muestras de chain-of-thought STEM provenientes de 12 datasets del usuario 0xZee. La innovacion metodologica declarada es una perdida de entropia cruzada ponderada por prueba ("proof-weighted cross-entropy") con decaimiento de 2,5x a 1,5x aplicado a los tokens de derivacion, combinada con divergencia KL a temperatura T=2.0. El objetivo es que el alumno aprenda el proceso de derivacion y no solo el patron de la respuesta final.

La segunda etapa es un ajuste supervisado sobre Alignment-Lab-AI/Lawyer-Instruct, que anade seguimiento de instrucciones y conocimiento del dominio juridico sobre la base de razonamiento STEM. La model card menciona un marco matematico propio ("Discrepancy Calculus", "Topological Knowledge Distillation", operador Df(x) y descomposicion BV) que, segun el autor, informa el pipeline de entrenamiento y cuyos "limites estructurales" quedan codificados en los pesos y se preservan tras la cuantizacion. No se aportan hiperparametros detallados, numero total de tokens de entrenamiento ni datos sobre RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y de instrucciones en ingles.
- Razonamiento STEM con derivaciones paso a paso (chain-of-thought): matematicas, fisica, ecuaciones diferenciales e ingenieria.
- Razonamiento juridico y seguimiento de instrucciones legales (doctrinas como promissory estoppel o res judicata en los ejemplos del autor).
- Dos formatos de prompt entrenados: derivacion STEM (`Problem:` / `Proof:`) e instrucciones (`### Instruction:` / `### Response:`).
- Generacion determinista con `temperature=0.0` en los ejemplos, orientada a respuestas reproducibles.
- Despliegue en edge y movil gracias a las cuantizaciones Q4_K_M y Q5_K_M.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito.

## Casos de uso

- Tutoria de fisica y matematicas en dispositivos moviles: con la cuantizacion Q4_K_M (~1,2 GB) el modelo cabe en un telefono y puede generar derivaciones paso a paso de problemas de mecanica o calculo diferencial, aprovechando el formato `Problem:` / `Proof:` para el que fue destilado.
- Asistencia legal de primera linea offline: el SFT sobre Lawyer-Instruct permite responder consultas sobre doctrinas juridicas basicas (promissory estoppel, res judicata) en entornos sin conectividad, como bufetes pequenos o herramientas de escritorio.
- Generacion de explicaciones tecnicas en documentacion: el modelo puede producir derivaciones y justificaciones de formulas para manuales de ingenieria, con la ventaja de que el proceso de destilacion priorizo la derivacion sobre la respuesta final.
- Prototipado rapido en portatiles sin GPU: mediante llama.cpp u Ollama con Q5_K_M (~1,4 GB), sirve para validar pipelines de razonamiento STEM antes de escalar a modelos mayores.
- Filtrado y preanalisis de problemas STEM en lotes: al ser pequeno y rapido, puede clasificar o esbozar soluciones de grandes conjuntos de ejercicios para su posterior revision por un modelo mayor o por un humano.
- Educacion juridica y simulacion de casos: con el formato `### Instruction:`, puede generar explicaciones introductorias de conceptos legales para materiales de estudio, siempre con verificacion humana dada la limitacion de 1,7B parametros.
- Despliegue embebido en aplicaciones de escritorio (LM Studio) para consultas de referencia rapida en fisica o derecho, sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: F16 ~3,8 GB; Q8_0 ~2,1 GB; Q5_K_M ~1,4 GB; Q4_K_M ~1,2 GB.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) ejecuta las cuantizaciones Q4_K_M y Q5_K_M con holgura; Q8_0 requiere ~2,5-3 GB.
- En CPU: viable en portatiles modernos con 8 GB de RAM; las cuantizaciones Q4_K_M y Q5_K_M estan pensadas para movil y edge.
- GPU de datacenter (A100, H100) no son necesarias; el modelo esta disenado para hardware modesto.
- Opciones de despliegue: llama.cpp (CLI y binding de Python `llama_cpp`), Ollama (via Modelfile), LM Studio. No se documenta soporte de vLLM ni TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | ~1,7B | No disponible | GGUF (F16 a Q4_K_M) | Apache 2.0 | Destilacion STEM + SFT legal |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Safetensors | Apache 2.0 | Modelo generalista de Qwen |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B totales (MoE) | No disponible en esta ficha | Safetensors | Apache 2.0 | Modelo grande de referencia usado como profesor |
| reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT | ~1,7B | No disponible | Safetensors | Apache 2.0 | Version sin cuantizar del mismo modelo |

La comparacion cuantitativa de rendimiento no esta disponible porque no se publicaron benchmarks. Frente al Qwen3-1.7B base, este modelo anade especializacion STEM y legal a costa de generalidad; frente al profesor de 30B, ofrece una reduccion de ~17x en parametros con la promesa (no verificada con metricas) de conservar parte del razonamiento.

## Limitaciones y advertencias

- Modelo de 1,7B parametros: puede producir derivaciones fluidas pero incorrectas; el propio autor advierte que no sustituye la verificacion formal de pruebas, el asesoramiento legal ni el analisis de ingenieria profesional.
- Riesgo de alucinacion elevado en dominios poco representados: el autor senala peor rendimiento en biologia molecular y fisiologia.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Contexto limitado en la practica: los ejemplos usan `n_ctx=1024`, lo que restringe conversaciones largas y documentos extensos.
- El entrenamiento legal se basa en un unico dataset (Lawyer-Instruct); el conocimiento juridico puede ser superficial y no actualizado a jurisdicciones concretas.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3 y de datasets publicos, hereda los sesgos de estas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre exactitud en contextos legales o de ingenieria criticos.
- El marco matematico propietario ("Discrepancy Calculus", "Topological Knowledge Distillation") no esta validado de forma independiente en la informacion disponible.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo base (safetensors): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Modelo Qwen3-1.7B original: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor Qwen3-30B-A3B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Convergent Intelligence LLC: https://convergentintel.com
- Modelo relacionado Qwen3-1.7B-Distilled-30B-A3B: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo relacionado Qwen3-1.7B-Thinking-Distil: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
