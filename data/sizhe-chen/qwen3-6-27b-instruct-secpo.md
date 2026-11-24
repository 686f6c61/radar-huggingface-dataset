# Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO

## Resumen
Qwen3.6-27B-Instruct-SecPO es un ajuste fino defensivo del modelo multimodal Qwen/Qwen3.6-27B, desarrollado por Sizhe Chen, Yibo Peng, Jaewon Chang, Chawin Sitawarin y David Wagner (University of California, Berkeley), orientado a resistir ataques de inyeccion de prompts (prompt injection) en flujos agenticos. El modelo parte de la arquitectura Qwen3.5 de 27.356.728.560 parametros y mantiene la pila multimodal image-text-to-text, pero incorpora un entrenamiento adversarial con una nueva funcion de perdida, SecPO, que sustituye el anclaje DPO sobre el modelo de referencia inseguro por un oraculo invariante a la inyeccion.

El problema que aborda es concreto: los agentes basados en LLM procesan instrucciones provenientes de datos no confiables (correo, documentos, webs) y los mejores modelos defendidos hasta la fecha, como Meta-SecAlign, seguian mostrando tasas de exito de ataque cercanas al 100% bajo ataques adaptativos. Segun la model card, SecPO reduce la ASR entre 2,4 y 4,6 veces frente a DPO y el pipeline de entrenamiento adversarial (AT) la reduce entre 1,5 y 14,5 veces frente a Meta-SecAlign en tres ataques adaptativos de ultima generacion, sin degradar de forma apreciable la utilidad en nueve benchmarks.

Es relevante ahora porque demuestra que es posible mantener capacidades agenticas, de instrucciones, cientificas, matematicas y visuales con un coste de utilidad minimo, algo poco habitual en modelos securizados. El checkpoint esta entrenado y evaluado con el modo thinking desactivado; para inferencia en modo razonamiento existe un checkpoint hermano (SecOPD).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, tag `qwen3_5`), pipeline image-text-to-text |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 57,5 GB) |
| Idiomas soportados | en (segun la model card y los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Qwen3.6-27B base: un transformer multimodal de la familia Qwen3.5 con capacidad de entrada image-text-to-text. El ajuste fino no modifica la topologia, sino que aplica optimizacion de preferencias sobre 19.157 pares de preferencia del dataset Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-trainset. La innovacion central es la perdida SecPO: en lugar de anclar el modelo al modelo de referencia sin defensa (como hace DPO, que arrastra la inseguridad del referencia), aproxima un oraculo invariante a la inyeccion y preservador de utilidad, cuya distribucion de salida es accesible durante el entrenamiento.

El segundo pilar es un pipeline de entrenamiento adversarial eficiente que sintetiza entradas inyectadas fuertes (best@240) en lugar de depender de ataques simulados debiles. Los datasets publicos de entrenamiento reutilizan inyecciones optimizadas generadas durante el entrenamiento adversarial de Llama-3.1-8B-Instruct. El checkpoint se entrena y evalua con el modo thinking desactivado (`enable_thinking=False`); las puntuaciones reportadas corresponden a esa configuracion.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento cientifico y matematico (evaluado en MMLU-Pro, GPQA Diamond, GSM8K y Minerva Math).
- Seguimiento de instrucciones (AlpacaEval2, SEP Utility).
- Capacidades agenticas con tool calling y flujos de multiples pasos (AgentDojo, AgentDyn, DTaP).
- Procesamiento visual de documentos (DocVQA) y tareas image-text-to-text.
- Robustez frente a inyeccion de prompts en entradas no confiables, tanto en texto como en imagenes (Steal-PII, Call-Tool, OpenClaw).
- Modo thinking desactivado por defecto; el razonamiento explicito requiere el checkpoint SecOPD.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.

## Casos de uso
- Agentes con acceso a correo y documentos externos: el modelo procesa contenido no confiable manteniendo una ASR de 8,8% en AgentDojo bajo el ataque AttackerMovesSecond (frente al 78,8% de Meta-SecAlign), lo que lo hace adecuado para asistentes que leen bandejas de entrada y actuan sobre ellas.
- Automatizacion de navegacion web y lectura de paginas: con ASR del 0,0% en AgentDyn, puede integrarse en agentes que resumen o extraen datos de sitios de terceros sin ejecutar instrucciones maliciosas embebidas.
- Procesamiento de documentos con datos personales: la ASR del 0,0% en Steal-PII@1600 permite usarlo en pipelines de extraccion documental donde una inyeccion visual podria exfiltrar informacion sensible.
- Invocacion segura de herramientas: con ASR del 0,0% en Call-Tool@1600, es apto para agentes que deciden llamadas a APIs criticas a partir de contenido mixto texto-imagen.
- Asistencia cientifica y matematica en produccion: mantiene el 84,6% en MMLU-Pro, 80,8% en GPQA Diamond y 96,4% en GSM8K, por lo que sirve para tareas de analisis tecnico sin renunciar a la defensa.
- Evaluacion y red teaming de sistemas: al publicarse junto al modelo base sin defensa y a Meta-SecAlign, permite medir la eficacia de defensas en pipelines propios con los mismos benchmarks (SEP, AgentDojo, DTaP).
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 habilita uso comercial siguiendo las condiciones del modelo base Qwen3.6-27B.

## Benchmarks y rendimiento

| Capacidad | Benchmark | Undefended | Meta-SecAlign | SecPO (este modelo) |
|---|---|---:|---:|---:|
| Ciencia | MMLU-Pro | 84,8% | 83,9% | 84,6% |
| Ciencia | GPQA Diamond | 81,3% | 79,3% | 80,8% |
| Matematicas | GSM8K | 97,3% | 97,0% | 96,4% |
| Matematicas | Minerva Math | 96,1% | 94,8% | 95,8% |
| Instrucciones | AlpacaEval2 | 80,6% | 81,6% | 82,9% |
| Instrucciones | SEP Utility | 93,0% | 93,9% | 94,3% |
| Agentico | AgentDojo Utility | 89,7% | 87,6% | 90,7% |
| Agentico | AgentDyn Utility | 71,7% | 76,7% | 71,7% |
| Agentico | DTaP Utility under attack | 65,8% | 70,0% | 74,5% |
| Visual | DocVQA Utility | 96,0% | 95,8% | 95,2% |

| Capacidad | Benchmark (ASR, menor es mejor) | Undefended | Meta-SecAlign | SecPO (este modelo) |
|---|---|---:|---:|---:|
| Instrucciones | SEP ASR | 98,9% | 2,9% | 1,8% |
| Instrucciones | SEP Genetic Adpt. ASR@800 | 100,0% | 93,7% | 13,3% |
| Instrucciones | SEP TAP Adpt. ASR@800 | 100,0% | 90,1% | 12,5% |
| Instrucciones | SEP PISmith Adpt. ASR@10 | 98,1% | 94,0% | 1,8% |
| Agentico | AgentDojo ASR | 26,9% | 2,2% | 0,0% |
| Agentico | AgentDojo Genetic Adpt. ASR@800 | 81,3% | 78,8% | 8,8% |
| Agentico | AgentDyn ASR | 22,0% | 4,8% | 0,0% |
| Agentico | DTaP ASR | 50,8% | 45,9% | 7,6% |
| Visual | Steal-PII ASR@1600 | 100,0% | 100,0% | 0,0% |
| Visual | Call-Tool ASR@1600 | 96,0% | 77,0% | 0,0% |
| Visual | OpenClaw ASR@1600 | 80,0% | 92,0% | 0,0% |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo denso de 27,36 mil millones de parametros requiere aproximadamente 55 GB en BF16/FP16 y alrededor de 14-16 GB en cuantizacion de 4 bits, aunque no se confirman cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: no disponible de forma especifica; por tamano, el modelo en precision completa encaja en A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Cabe en GPU de consumo: no disponible de forma confirmada; en precision completa no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB); con cuantizacion de 4 bits seria viable en teoria, pero no se publican pesos GGUF oficiales.
- Opciones de despliegue: transformers (libreria declarada), con compatibilidad de endpoints indicada en los metadatos (`endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR agentico adaptativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Instruct-SecPO (este) | 27,36 mil M | no disponible | 8,8% AgentDojo Genetic Adpt.@800 | Apache 2.0 | Hugging Face |
| Qwen3.6-27B-Instruct-Meta-SecAlign | 27,36 mil M | no disponible | 78,8% AgentDojo Genetic Adpt.@800 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.6-27B (sin defensa) | 27,36 mil M | no disponible | 81,3% AgentDojo Genetic Adpt.@800 | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct-SecPO | 8 mil M | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias
- Entrenado y evaluado con thinking desactivado: usar `enable_thinking=False`; el razonamiento explicito requiere el checkpoint Qwen3.6-27B-Thinking-SecOPD.
- Solo se declara soporte de ingles; el rendimiento en otros idiomas no esta documentado.
- La longitud de contexto no se especifica en la informacion disponible.
- Los datasets publicos de entrenamiento reutilizan inyecciones optimizadas generadas durante el entrenamiento adversarial de Llama-3.1-8B-Instruct, lo que puede limitar la transferencia a ataques con otras distribuciones.
- Aunque las ASR son muy bajas, no son nulas en varios escenarios (13,3% en SEP Genetic Adpt., 12,5% en SEP TAP, 8,8% en AgentDojo Genetic Adpt.), por lo que la defensa no sustituye controles de seguridad adicionales en produccion.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones especificas de factualidad en la informacion disponible.
- Sesgos conocidos del modelo base no documentados en la model card.
- Licencia Apache 2.0 con las condiciones heredadas del modelo base Qwen3.6-27B; conviene revisar los terminos del modelo base para uso comercial.
- El repo ocupa 57,5 GB, lo que condiciona el almacenamiento y la transferencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/Sizhe-Chen/Qwen3.6-27B-Instruct-SecPO-trainset
- Checkpoint Meta-SecAlign: https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Instruct-MetaSecAlign
- Checkpoint SecOPD (thinking): https://huggingface.co/Sizhe-Chen/Qwen3.6-27B-Thinking-SecOPD
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Codigo: https://github.com/Sizhe-Chen/SecPO
- Demo de inferencia segura: https://github.com/Sizhe-Chen/SecPO/blob/main/demo.py
- Web del autor: https://sizhe-chen.github.io
