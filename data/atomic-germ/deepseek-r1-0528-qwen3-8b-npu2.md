# Atomic-Germ/DeepSeek-R1-0528-Qwen3-8B-NPU2

## Resumen

DeepSeek-R1-0528-Qwen3-8B-NPU2 es una destilación del modelo de razonamiento DeepSeek-R1-0528 sobre la arquitectura Qwen3-8B, publicada por el usuario Atomic-Germ en HuggingFace. El modelo original, desarrollado por DeepSeek, es una actualización menor de DeepSeek-R1 que mejora significativamente la profundidad de razonamiento y las capacidades de inferencia mediante un mayor gasto computacional en post-entrenamiento y optimizaciones algorítmicas. Esta versión destilada traslada esa cadena de razonamiento a un modelo de 8.000 millones de parámetros, haciéndolo ejecutable en hardware de consumo.

La relevancia de este modelo radica en que, según los datos publicados, alcanza resultados de nivel SOTA entre modelos open-source en el benchmark AIME 2024, superando a Qwen3-8B en más de 10 puntos y equiparándose a Qwen3-235B-A22B en modo razonamiento, con un coste computacional mucho menor. El repositorio incluye el modelo en formato transformers (12 GB), con licencia MIT, lo que permite uso comercial sin restricciones. La versión "NPU2" en el nombre sugiere una optimización específica para unidades de procesamiento neuronal, aunque no se detallan las modificaciones exactas respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen3-8B soporta 32.768 tokens; se recomienda verificar) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo se distribuye en formato safetensors de precision completa (repo de 12 GB) |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B soporta multiples idiomas, principalmente ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B como arquitectura base (transformer denso con attention completa) y se post-entrena mediante destilacion de la cadena de razonamiento (chain-of-thought) del modelo DeepSeek-R1-0528. Este proceso consiste en entrenar el modelo pequeno para replicar los patrones de razonamiento del modelo grande, incluyendo la generacion de pasos intermedios de pensamiento antes de emitir la respuesta final.

DeepSeek-R1-0528, el modelo profesor, incorpora mejoras respecto a la version original de R1: mayor profundidad de razonamiento (en el test AIME 2025 pasa de una media de 12K tokens por pregunta a 23K), reduccion de alucinaciones, soporte mejorado de function calling y mejor experiencia para "vibe coding". El proceso de destilacion hereda estas capacidades al modelo de 8B, aunque con las limitaciones propias de un modelo mucho mas pequeno.

## Capacidades

- Razonamiento complejo en multiples pasos: el modelo genera cadenas de pensamiento extensas antes de responder, similar a DeepSeek-R1.
- Matematicas avanzadas: destacado rendimiento en benchmarks como AIME 2024, HMMT 2025 y CNMO 2024.
- Generacion de codigo y resolucion de problemas de programacion: incluye soporte para "vibe coding" segun la descripcion del modelo base.
- Razonamiento logico general: mejoras en benchmarks de logica y conocimiento general (MMLU-Pro, GPQA-Diamond).
- Soporte de function calling: la version 0528 del modelo maestro incorpora mejoras en este aspecto.
- Capacidades multilingues: heredadas de Qwen3-8B, que soporta ingles y chino principalmente, aunque la model card no detalla idiomas especificos.

## Casos de uso

- **Razonamiento matematico automatizado**: el modelo puede resolver problemas de olimpiadas matematicas (AIME, HMMT) con alta precision. Es util en plataformas educativas o herramientas de resolucion de problemas que requieran pasos intermedios explicados.
- **Generacion de codigo en produccion**: con soporte de function calling y buen rendimiento en LiveCodeBench, puede integrarse en pipelines de CI/CD para generar codigo, revisar parches o autocompletar funciones complejas.
- **Agente de razonamiento multi-paso**: el modelo puede actuar como motor de razonamiento en sistemas agente que requieran planificacion y ejecucion de multiples pasos, como asistentes de automatizacion de tareas.
- **Analisis de datos y logica**: su capacidad en GPQA-Diamond (81.0) lo hace util para responder preguntas cientificas complejas y razonamiento sobre dominios especializados.
- **Sistemas de tutoria inteligente**: dado su rendimiento en matematicas y logica, puede servir como tutor virtual que explica el proceso de resolucion paso a paso.
- **Prototipado rapido de agentes**: al ser un modelo de 8B con licencia MIT, es viable para desplegar en entornos de desarrollo locales o en la nube sin restricciones de licencia, ideal para hacer prototipos de agentes con razonamiento.

## Benchmarks y rendimiento

Los datos de benchmarks publicados en la model card corresponden al modelo maestro DeepSeek-R1-0528 (no a la destilacion Qwen3-8B). Para el modelo destilado solo se indica que supera a Qwen3-8B en AIME 2024 en +10 puntos y que iguala a Qwen3-235B-A22B en ese benchmark, sin cifras concretas.

| Benchmark | DeepSeek-R1-0528 (maestro) | DeepSeek-R1 (anterior) |
|---|---|---|
| MMLU-Redux (EM) | 93.4 | 92.9 |
| MMLU-Pro (EM) | 85.0 | 84.0 |
| GPQA-Diamond (Pass@1) | 81.0 | 71.5 |
| SimpleQA (Correct) | 27.8 | 30.1 |
| FRAMES (Acc.) | 83.0 | 82.5 |
| Humanity's Last Exam (Pass@1) | 17.7 | 8.5 |
| LiveCodeBench (2408-2505) (Pass@1) | 73.3 | 63.5 |
| Codeforces-Div1 (Rating) | 1930 | 1530 |
| SWE Verified (Resolved) | 57.6 | 49.2 |
| Aider-Polyglot (Acc.) | 71.6 | 53.3 |
| AIME 2024 (Pass@1) | 91.4 | 79.8 |
| AIME 2025 (Pass@1) | 87.5 | 70.0 |
| HMMT 2025 (Pass@1) | 79.4 | 41.7 |
| CNMO 2024 (Pass@1) | 86.9 | 78.8 |
| BFCL_v3_MultiTurn (Acc) | 37.0 | - |
| Tau-Bench (Pass@1) | 53.5 (Airline) / 63.9 (Retail) | - |

Para el modelo destilado de 8B no se publican resultados numericos en la model card, solo la mencion de que supera a Qwen3-8B en AIME 2024.

## Requisitos de hardware

- **VRAM estimada**: en precision FP16, el modelo ocupa aproximadamente 16 GB de VRAM (8B parametros x 2 bytes). Con cuantizacion a 8 bits (GGUF Q8_0) se reduce a unos 8 GB; con cuantizacion de 4 bits (Q4_K_M) a 4-5 GB.
- **GPUs recomendadas**: para inferencia en FP16 se recomienda una RTX 4090 (24 GB), A100 (40/80 GB) o H100. Con cuantizacion de 4 bits, cabe en GPUs de 8 GB como RTX 3060 Ti o RTX 3070.
- **Cabe en GPU de consumo**: si, con cuantizacion de 4 bits se puede ejecutar en GPUs de gama media (8-12 GB). Con FP16 se necesita una GPU de 16 GB o mas (RTX 4080/4090).
- **Opciones de despliegue**: vLLM para inferencia de alta productividad, llama.cpp y Ollama para despliegue local con GGUF, y Transformers de Hugging Face para integracion directa.
- **Latencia y throughput**: no se dispone de datos publicados especificos para este modelo. Como referencia, un modelo de 8B en vLLM con FP16 suele alcanzar entre 50-100 tokens/s en una A100, y entre 20-40 tokens/s en una RTX 4090. Con cuantizacion de 4 bits, la latencia puede mejorar un 20-30%.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | AIME 2024 (Pass@1) | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-0528-Qwen3-8B | 8B | no especificado | MIT | superior a Qwen3-8B (sin cifra exacta) | Hugging Face |
| Qwen3-8B | 8B | 32K | Apache 2.0 | ~70-75 (estimado) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-8B | 8B | 32K | MIT | ~80 (estimado) | Hugging Face |
| Qwen3-235B-A22B (thinking) | 235B (22B activos) | 32K | Apache 2.0 | ~85-90 (estimado) | Hugging Face |

Nota: las cifras de Qwen3-8B y Qwen3-235B son aproximaciones basadas en datos publicos; el modelo destilado de Atomic-Germ no publica cifras concretas.

## Limitaciones y advertencias

- **Datos de rendimiento limitados**: la model card solo proporciona datos de benchmarks para el modelo maestro de 235B, no para el modelo destilado de 8B. Las afirmaciones de rendimiento se basan en una unica comparacion (AIME 2024) sin cifras concretas.
- **Sesgos y alucinaciones**: como modelo pequeno destilado, puede presentar mas alucinaciones que el modelo maestro. El modelo maestro muestra una bajada en SimpleQA (de 30.1 a 27.8), lo que sugiere cierta regresion en preguntas factuales.
- **Idiomas**: no se especifica la cobertura idiomatica; el modelo base Qwen3-8B se centra en ingles y chino, con menor rendimiento en otros idiomas.
- **Licencia**: la licencia MIT permite uso comercial, pero el modelo se publica sin garantias de exactitud ni seguridad. El autor del repositorio (Atomic-Germ) no es DeepSeek; se trata de una destilacion de un tercero, lo que puede implicar diferencias respecto al modelo original.
- **Version NPU2**: el sufijo "NPU2" sugiere optimizaciones para hardware de aceleracion neuronal especifico, pero no se documenta en la model card que modificaciones concretas se aplicaron ni que hardware se necesita para aprovecharlas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/DeepSeek-R1-0528-Qwen3-8B-NPU2
- Modelo base (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Paper de DeepSeek-R1: https://arxiv.org/pdf/2501.12948
- Guia de despliegue local (Unsloth): https://unsloth.ai/docs/models/tutorials/deepseek-r1-0528-how-to-run-locally
- Guia de ejecucion local (Codersera): https://codersera.com/blog/run-and-install-deepseek-r1-0528-locally-on-your-computer/
- Pagina de OpenModelMap: https://openmodelmap.com/model/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
