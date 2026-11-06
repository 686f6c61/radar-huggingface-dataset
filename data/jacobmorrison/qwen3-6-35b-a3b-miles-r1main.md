# jacobmorrison/qwen3.6-35b-a3b-miles-r1main

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, publicado como pesos abiertos bajo licencia Apache 2.0. El repositorio analizado, `jacobmorrison/qwen3.6-35b-a3b-miles-r1main`, es una redistribucion de los pesos oficiales de Qwen3.6-35B-A3B en formato Transformers (safetensors), sin indicios de fine-tuning adicional por parte del autor del repo. Se trata de un modelo Mixture of Experts (MoE) de 35.107 millones de parametros totales con aproximadamente 3.000 millones de parametros activos por token, disenado para cargas de trabajo de codigo agentico, razonamiento de repositorio y flujos de desarrollo iterativos.

La propuesta de valor del modelo es combinar una ventana de contexto nativa de 262.144 tokens (extensible hasta 1.010.000) con un coste de inferencia propio de un modelo de ~3B activos, gracias a su arquitectura MoE con 256 expertos (8 enrutados + 1 compartido). Incorpora un encoder de vision, lo que lo habilita para tareas image-text-to-text, y una innovacion destacada en la serie 3.6: la "preservacion del pensamiento" (thinking preservation), que permite retener el contexto de razonamiento de mensajes historicos para reducir la sobrecarga en desarrollo iterativo.

Es relevante ahora porque la serie Qwen3.6 llega como primera variante de pesos abiertos tras la familia Qwen3.5, con mejoras sustanciales en codificacion agentica y razonamiento a nivel de repositorio. Su licencia permisiva y su bajo numero de parametros activos lo hacen atractivo para despliegues en produccion con requisitos de latencia ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; MoE hibrido con Gated DeltaNet (atencion lineal) y Gated Attention |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 nativo, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se documentan cuantizaciones oficiales en la informacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |
| Dimension oculta | 2048 |
| Numero de capas | 40 |
| Layout oculto | 10 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE)) |
| Expertos | 256 totales; 8 enrutados + 1 compartido activados; dimension intermedia de experto 512 |
| Token embedding | 248.320 (padded) |
| Cabezas de atencion (Gated Attention) | 16 para Q, 2 para KV; dimension de cabeza 256; RoPE dim 64 |
| Cabezas de atencion lineal (Gated DeltaNet) | 32 para V y 16 para QK; dimension de cabeza 128 |
| MTP | entrenado con multi-steps |
| Tamano del repo | 70,2 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina atencion lineal mediante Gated DeltaNet con atencion completa con compuertas (Gated Attention), intercaladas en un patron de 10 bloques que repiten la secuencia 3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE). Esta disposicion reduce el coste computacional de la atencion en contextos largos al tiempo que mantiene la capacidad de modelado de dependencias globales mediante las capas de atencion completa. El componente MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados mas 1 compartido por token, con una dimension intermedia de experto de 512, lo que explica que con 35B parametros totales solo se activen ~3B.

El modelo ha pasado por fases de pre-entrenamiento y post-entrenamiento (la model card indica "Pre-training & Post-training"), aunque no se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas especificas de RLHF o DPO. Se entrena con MTP (multi-token prediction) multi-step, lo que puede habilitar decodificacion especulativa para acelerar la inferencia. Incluye un encoder de vision que lo convierte en un modelo image-text-to-text. La innovacion mas destacada de la serie es la preservacion del pensamiento (thinking preservation), que permite retener el contexto de razonamiento de mensajes historicos.

## Capacidades

- Generacion de texto y razonamiento general en contextos de hasta 262.144 tokens nativos.
- Codificacion agentica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio con mayor fluidez y precision.
- Capacidades multimodales image-text-to-text gracias a su vision encoder.
- Modo de razonamiento con preservacion del pensamiento (thinking preservation) para desarrollo iterativo.
- Entrenamiento con MTP multi-step, compatible con decodificacion especulativa.
- Compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible (idiomas no listados en la model card proporcionada).
- Capacidades de audio: no disponibles.

## Casos de uso

- Codificacion agentica en repositorios: el modelo esta optimizado para razonamiento a nivel de repositorio y flujos frontend, por lo que puede resolver tareas de SWE-bench con un 73,4% en la version Verified, integrándose en pipelines de CI/CD para generar parches y resolver issues.
- Desarrollo iterativo con preservacion del pensamiento: al retener el contexto de razonamiento de mensajes historicos, reduce la sobrecarga en sesiones de depuracion y refactorizacion multi-turno, manteniendo coherencia entre iteraciones.
- Analisis de documentos largos y bases de codigo: con 262.144 tokens nativos (extensibles a 1.010.000), puede procesar repositorios completos o documentacion extensa en una sola pasada sin troceado.
- Asistentes de desarrollo con entrada visual: gracias a su encoder de vision, puede interpretar capturas de pantalla, diagramas de arquitectura o mockups de UI y generar codigo correspondiente (image-text-to-text).
- Automatizacion de tareas de terminal: con un rendimiento en Terminal-Bench 2.0 reportado, puede integrarse en agentes que ejecutan comandos y resuelven tareas de shell de forma autonoma.
- Despliegue en produccion con latencia ajustada: al activar solo ~3B parametros por token, el coste de inferencia es propio de un modelo de ese tamano, lo que permite servir cargas concurrentes en GPUs de gama alta sin el coste de un modelo denso de 35B.
- Razonamiento multilingue en codigo: con un 67,2% en SWE-bench Multilingual, es adecuado para equipos que trabajan en bases de codigo con multiples lenguajes de programacion.

## Benchmarks y rendimiento

Resultados reportados en la model card (categoria Language / Coding Agent), comparando con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B y Gemma4-26BA4B:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible |

Nota: los datos de Terminal-Bench 2.0 estan truncados en la informacion proporcionada. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 70 GB solo para pesos, mas overhead de KV cache y activaciones; requiere multiples GPUs o una GPU con 80 GB (A100/H100) con cuantizacion o paralelismo.
- El tamano del repo es de 70,2 GB, coherente con pesos en precision completa (35B parametros).
- Cuantizacion: aunque no se documentan cuantizaciones oficiales en la informacion, al ser un MoE con ~3B activos, las cuantizaciones a 4 bits (GGUF/AWQ/GPTQ) podrian reducir el requisito a ~20-25 GB, permitiendo su ejecucion en GPUs consumer de 24 GB (RTX 4090) o 32 GB, aunque este dato no esta confirmado en la informacion proporcionada.
- GPUs recomendadas: A100 80GB, H100 80GB para precision completa; multiples RTX 4090 o A6000 para despliegues con paralelismo.
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35BA3B | 35B | no disponible | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26BA4B | 26B | ~4B | no disponible | 17,4 | no disponible |

Qwen3.6-35B-A3B supera a Qwen3.5-35BA3B en SWE-bench Verified (+3,4), Multilingual (+6,9) y Pro (+4,9), y queda por detras de Qwen3.5-27B en Verified (-1,6) y Multilingual (-2,1). Frente a Gemma4-31B y Gemma4-26BA4B, la ventaja es amplia en tareas de codigo agentico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo modelo entrenado con datos web, es probable que herede sesgos, pero no hay datos concretos.
- Riesgo de alucinacion: no cuantificado en la informacion; en tareas de codigo agentico, la generacion de parches incorrectos puede introducir regresiones si no se valida.
- Limitaciones de contexto o idioma: aunque el contexto nativo es amplio (262.144 tokens), la extension a 1.010.000 puede degradar la calidad; los idiomas soportados no estan listados, lo que impide confirmar cobertura multilingue fuera del ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original (enlazada en la model card) y los terminos de los datos de entrenamiento.
- Este repositorio concreto es una redistribucion de terceros (jacobmorrison) con solo 36 descargas y 0 likes; no es el repo oficial de Qwen, por lo que se recomienda verificar la integridad de los pesos frente al repositorio oficial Qwen/Qwen3.6-35B-A3B antes de usarlo en produccion.
- El nombre del repo sugiere un posible fine-tuning ("miles-r1main"), pero la model card no documenta ningun proceso de ajuste adicional; no hay evidencia de que los pesos difieran del modelo base.
- Compatibilidad declarada con vLLM, SGLang y KTransformers, pero no se especifican versiones minimas ni configuraciones validadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jacobmorrison/qwen3.6-35b-a3b-miles-r1main
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
