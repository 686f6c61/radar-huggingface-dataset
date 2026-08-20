# Flexan/ulamai-Ulam-1-Small-GGUF

## Resumen

Ulam-1-Small es un modelo de razonamiento matemático de 3.086 millones de parámetros desarrollado por Ulam AI, una iniciativa open source centrada en la demostración de teoremas con verificación formal en Lean 4. El modelo está construido sobre la arquitectura Qwen2ForCausalLM y su linaje incluye Qwen2.5-3B, Qwen2.5-Coder-3B y WeiboAI/VibeThinker-3B. Se distribuye como un modelo standalone con pesos en BF16 y una ventana de contexto de 131.072 tokens.

El lanzamiento está orientado a la resolución exploratoria de problemas matemáticos y al razonamiento en estilo demostración, no a la certificación formal de teoremas. El checkpoint seleccionado (DPO checkpoint 20) fue elegido por su mejor media en la auditoría ErdosBench y una cola observada más segura entre afirmaciones autodeclaradas fuertes, un criterio de selección orientado a investigación más que a competición cerrada de olimpiadas.

Este repositorio concreto contiene las conversiones GGUF realizadas por Flexan, que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otras herramientas compatibles con el formato GGUF. La licencia MIT facilita su uso comercial y su integración en pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (Transformer decoder-only) |
| Parametros totales | 3.085.938.688 (3,086 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (original BF16) y GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Qwen2ForCausalLM, un transformer decoder-only con atención causal estándar. Su linaje declarado incluye Qwen2.5-3B, Qwen2.5-Coder-3B y WeiboAI/VibeThinker-3B, con modificaciones registradas en el fichero `provenance.json` y en el aviso NOTICE del repositorio original. Los pesos se distribuyen en BF16.

El entrenamiento se realizó sobre dos datasets propios: `ulamai/verified-research-reasoning-trajectories` y `ulamai/verified-math-olympiad-trajectories`, ambos con trayectorias de razonamiento verificadas. El checkpoint seleccionado es el "Prompt-balanced DPO checkpoint 20", lo que indica que se aplicó optimización por preferencia directa (DPO) sobre un checkpoint previo. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset.

El ecosistema Ulam AI incluye un prover de Lean 4 que integra verificación formal (solo se aceptan pruebas que Lean comprueba), recuperación de premisas desde mathlib y búsqueda con caché (best-first/beam con tabla de transposición). El modelo se puede conectar a herramientas como Codex, Claude Code, Gemini CLI u Ollama para producir pruebas verificadas en Lean 4.

## Capacidades

- Generación de demostraciones matemáticas: produce razonamientos en estilo prueba para problemas de olimpiadas y problemas de investigación matemática.
- Razonamiento matemático de investigación: evaluado con ErdosBench, un benchmark con 226 ítems juzgados por evaluadores externos con calificaciones A/B/C/D/F/M.
- Conversación: soporta interacción conversacional en inglés, aunque su foco principal es el razonamiento matemático.
- Integración con verificación formal: puede usarse junto al prover UlamAI para generar pruebas que Lean 4 verifica, eliminando alucinaciones en el paso de verificación.
- Generación de texto: como modelo de lenguaje general, puede redactar explicaciones, resúmenes y razonamientos paso a paso.
- No se declara soporte de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Asistente de demostración matemática: el modelo genera esbozos de demostración que un investigador puede revisar y completar. Su checkpoint DPO fue seleccionado precisamente por una cola más segura en afirmaciones fuertes, lo que reduce el riesgo de propuestas incorrectas en contextos de investigación.
- Generación de pruebas verificadas en Lean 4: integrado con el prover UlamAI, el modelo produce candidatos a demostración que Lean comprueba formalmente. Solo las pruebas que pasan la verificación se aceptan, lo que elimina el riesgo de alucinación en el resultado final.
- Preparación de problemas de olimpiadas matemáticas: puede generar razonamientos para problemas de olimpiada, útil en entornos educativos y de entrenamiento competitivo, aunque el modelo no fue seleccionado específicamente para cierre de pruebas de olimpiada.
- Exploración de conjeturas en investigación: el modelo puede sugerir líneas de razonamiento para problemas abiertos o conjeturas, sirviendo como herramienta de exploración preliminar antes de la verificación formal.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF (Q4_K_M recomendada), el modelo se puede ejecutar en portátiles y estaciones de trabajo con GPU de gama media, sin necesidad de infraestructura cloud.
- Pipeline de razonamiento matemático en producción: con licencia MIT y formato GGUF, puede integrarse en servicios de generación de explicaciones matemáticas, tutores automáticos o sistemas de asistencia a la investigación con requisitos de privacidad de datos.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index son los siguientes:

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| SIMOBench primary itemized audit (126 problemas) | Itemized proof score (maximo 882) | 667 | Puntuacion de pruebas itemizada |
| ErdosBench external-judge audit (226 ítems) | Weighted grade mean (A/B/C/D/F/M = 4/2.7/1.7/1/0/0) | 2,287 | Media ponderada de calificaciones |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible. El autor indica que el checkpoint V-SAO 177 fue más fuerte en ambas pasadas de evaluación SIMOBench, mientras que el checkpoint DPO 20 fue seleccionado por su mejor media en ErdosBench y una cola observada más segura entre afirmaciones autodeclaradas fuertes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,086 M de parámetros, una cuantización Q4_K_M ocupa aproximadamente 1,8-2 GB de pesos, más overhead de KV cache. Con contexto de 131.072 tokens, la memoria de KV cache puede crecer significativamente; para contextos largos se recomienda reducir la ventana o usar cuantizaciones más agresivas.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM puede ejecutar el modelo en Q4_K_M con contexto moderado. Una RTX 3060 (12 GB), RTX 4060 (8 GB) o superior es suficiente. Para contexto completo de 131K tokens se recomienda una GPU con 16 GB o más.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos de las cuantizaciones GGUF. Modelos de 3B en Q4 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF mediante Modelfile), text-generation-inference (TGI) y transformers con los safetensors originales. También es compatible con el prover UlamAI que se conecta a Ollama.
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo de 3B en Q4_K_M en una GPU moderna genera decenas de tokens por segundo, pero estos valores dependen del hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Ulam-1-Small | 3,086 B | 131.072 | MIT | Razonamiento matematico con verificacion Lean |
| Qwen2.5-3B | ~3 B | 131.072 | Apache 2.0 | Modelo generalista de proposito general |
| Qwen2.5-Coder-3B | ~3 B | 131.072 | Apache 2.0 | Generacion de codigo |
| WeiboAI/VibeThinker-3B | ~3 B | no disponible | no disponible | Razonamiento (linaje del modelo) |

Ulam-1-Small comparte linaje con los tres modelos anteriores, por lo que la comparación directa de rendimiento en tareas matemáticas no está publicada en la información disponible. La diferencia principal es el entrenamiento específico en trayectorias de razonamiento matemático verificado y la integración con el ecosistema de verificación formal Lean 4.

## Limitaciones y advertencias

- No es un sistema de certificación de teoremas: las afirmaciones fuertes, contraejemplos y pruebas propuestas requieren revisión experta independiente. El propio autor lo declara explícitamente en la model card.
- Riesgo de alucinación: como modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos. La verificación formal con Lean 4 mitiga este riesgo solo si se usa el prover UlamAI como paso final.
- Idioma: solo soporta inglés. No hay evidencia de capacidades multilingües.
- Foco limitado: está especializado en matemáticas y razonamiento; no es un modelo generalista competitivo para otras tareas como generación de código o procesamiento de lenguaje natural general.
- Selección de checkpoint orientada a investigación: el checkpoint DPO 20 fue elegido por su comportamiento en cola de afirmaciones fuertes, no por dominar todas las tareas matemáticas. El checkpoint V-SAO 177 fue superior en SIMOBench.
- Datos de entrenamiento no publicados: no se dispone del número de tokens ni de la composición detallada del dataset, lo que dificulta evaluar posibles sesgos.
- Repositorio GGUF de terceros: las cuantizaciones GGUF son una conversión de Flexan, no del equipo de Ulam AI. La calidad de la conversión no está verificada por el desarrollador original.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Flexan/ulamai-Ulam-1-Small-GGUF
- Modelo original: https://huggingface.co/ulamai/Ulam-1-Small
- Informe tecnico (whitepaper): https://huggingface.co/ulamai/Ulam-1-Small/blob/main/paper/Ulam-1-Small-whitepaper.pdf
- Recibo de evaluacion: https://huggingface.co/ulamai/Ulam-1-Small/blob/v1.0.0/evaluation_results.json
- Proyecto UlamAI en GitHub: https://github.com/ulamai/ulamai
- Perfil de Flexan: https://huggingface.co/Flexan/Flexan
