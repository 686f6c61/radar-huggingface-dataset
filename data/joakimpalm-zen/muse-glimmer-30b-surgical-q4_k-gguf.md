# Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q4_K-GGUF

## Resumen

Muse-Glimmer-30B-Surgical-Q4_K-GGUF es un artefacto derivado del modelo Muse-Glimmer-30B de Meta, sometido a una cirugía de profundidad (depth-pruning) que elimina el 4,75% del decoder (tres subcapas FFN de las capas 4, 9 y 48), seguida de una fase de "curado" mediante destilación local contra el modelo padre congelado, y finalmente cuantizado a Q4_K. El resultado es un archivo GGUF de 14,61 GB que mantiene una fidelidad alta respecto al original BF16, con un margen-qualified top-1 agreement del 97,74% y una KLD media de 0,04810, superando los umbrales exigidos.

El desarrollo corre a cargo de Joakimpalm-Zen, que también ha creado el motor de inferencia xyntetik-runner, un binario único en C11 sin dependencias que entrena, fusiona y cuantiza GGUFs de forma determinista. Este artefacto es una demostración práctica de esa herramienta: la cirugía se aplicó por sustitución byte a byte sobre el GGUF padre y la cuantización se realizó con el cuantizador propio del runner. El modelo base es un transformer causal de 30B parámetros con capacidades multimodales originales, aunque este artefacto concreto es solo texto (no incluye el encoder de visión ni la sintaxis de tool-calling "atem").

La relevancia de este modelo radica en que muestra una vía reproducible para reducir el tamaño de un LLM sin sacrificar comportamiento, y documenta con métricas precisas el coste de cada paso (cirugía, curado, cuantización). Es útil para quienes investigan técnicas de compresión estructural o necesitan un modelo de 30B que quepa en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con FFN; originalmente multimodal, este artefacto es solo texto |
| Parametros totales | 27.854.794.240 (27,85B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K (este archivo); tambien disponibles Q8_0 y BF16 segun la tabla de fidelidad |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer causal de 30B parámetros con un encoder de percepción dedicado, destilado de Muse Spark y orientado a tareas agénticas autónomas en hardware de consumo. Este artefacto, sin embargo, es una variante estructural: se eliminaron tres subcapas FFN (capas 4, 9 y 48) mediante un mapeo de sensibilidad por profundidad, y se retrainó una FFN por corte (la primera capa superviviente por debajo) durante 7,4 millones de tokens, aproximadamente 28 minutos en una GPU de 24 GB. El curado se hizo por destilación local contra el padre congelado, logrando una KLD de 0,03056 en BF16, mejor que el padre con solo dos cortes sin curar.

La cuantización a Q4_K se realizó con el cuantizador de xyntetik-runner, tras medir que el ruido de cuantización y el error de cirugía son aditivos e independientes (factor 0,965 a 0,994 sobre la suma ingenua), lo que permitió predecir el coste final con un 0,6% de error. El archivo GGUF se produjo por sustitución byte a byte de los 18 tensores modificados en el GGUF padre, y los pesos curados sobreviven a Q8_0 con un coste de +0,00006 KLD. El entrenamiento de curado usó AdamW LoRA, con determinismo garantizado por el runner.

## Capacidades

- Generacion de texto: el modelo genera texto coherente y mantiene el comportamiento del padre en los 11 dominios medidos (spread de perplejidad 0,046 frente a 0,373 sin curar).
- Razonamiento: el modelo base tiene salida de razonamiento separada, pero no se especifica si este artefacto la conserva; la certificacion indica que solo se implementa la ruta de texto.
- Tool calling: el modelo base soporta tool-calling nativo con sintaxis "atem", pero el doc de certificacion aclara que esta sintaxis no esta implementada en este artefacto.
- Multilingue: no hay datos disponibles sobre idiomas.
- Capacidades agénticas: el original esta disenado para tareas agénticas, pero este artefacto es solo texto y no incluye el encoder de vision ni la sintaxis de herramientas.
- Fidelidad estructural: los pesos de las FFN eliminadas son exactamente cero, lo que permite cargarlo en cualquier runtime GGUF compatible con muse-glimmer.

## Casos de uso

- Inferencia local en hardware de consumo: con 14,61 GB de archivo y ~17 GB de memoria requerida, puede ejecutarse en una GPU de 24 GB (RTX 3090/4090) o en un Mac con 32 GB unificados, usando xyntetik-runner o llama.cpp.
- Servicio de chat en local: el runner ofrece un servidor compatible con OpenAI, permitiendo desplegar un endpoint de chat privado sin depender de la nube.
- Experimentacion con model surgery: al ser un ejemplo documentado de poda estructural con metricas de fidelidad, sirve como referencia para investigar tecnicas similares en otros modelos.
- Fine-tuning con LoRA: el runner permite entrenar adaptadores LoRA sobre el GGUF servido, con determinismo y verificacion de que la adaptacion sobrevive si se fusiona a Q8_0 o F16 (no a 4-bit).
- Evaluacion de cuantizacion: la tabla de fidelidad publicada permite comparar el impacto de Q4_K frente a Q8_0 y BF16, util para decidir el punto de equilibrio tamano/calidad.
- Despliegue en entornos con restricciones de memoria: al ser un modelo de 30B en 14,61 GB, cabe en servidores con 16-24 GB de RAM, habilitando tareas de generacion de texto en infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. En su lugar, la model card proporciona metricas de fidelidad frente al padre BF16, medidas en un split held-out:

| Artefacto | Tamano | KLD media | Top-1 con margen | Barra |
|---|---|---|---|---|
| Este archivo (cirugia + curado, Q4_K) | 14,61 GB | 0,04810 | 97,74% | PASS (>=97%) |
| Mismos pesos, Q8_0 | 27,58 GB | 0,03076 | 98,65% | PASS |
| Mismos pesos, BF16 | 51,90 GB | 0,03056 | 98,64% | PASS |
| Padre a Q4_K (control solo cuantizacion) | 14,61 GB | 0,01930 | 99,12% | PASS |

Ademas, se reporta que la cirugia sin curar falla la barra (KLD 0,10021), y que el curado reduce el spread de perplejidad por dominio de 0,373 a 0,046.

## Requisitos de hardware

- VRAM estimada: ~17 GB de memoria usable para el archivo de 14,61 GB (segun la model card).
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) es suficiente para inferencia; el entrenamiento de curado se hizo en una GPU de 24 GB.
- CPU: puede ejecutarse en CPU con suficiente RAM (32 GB recomendados), usando xyntetik-runner o llama.cpp.
- Opciones de despliegue: xyntetik-runner (binario unico, CPU/CUDA/Metal, servidor OpenAI-compatible), llama.cpp, Ollama (si tiene soporte para muse-glimmer), o cualquier runtime GGUF compatible.
- Latencia y throughput: no se proporcionan datos especificos; dependen del hardware y del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 30B | No disponible | BF16, k-quant 17GB | Apache-2.0 | Multimodal, tool-calling, razonamiento separado |
| Este artefacto (surgical Q4_K) | 27,85B (tras poda) | No disponible | Q4_K | Apache-2.0 | Solo texto, sin vision ni tool-calling |
| Muse-Glimmer-30B-runner-quant-frontier-report | 30B | No disponible | Varios | Apache-2.0 | Reporte de frontera de cuantizacion del mismo autor |

No se dispone de datos de otros modelos comparables de 30B cuantizados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: este artefacto no incluye el encoder de vision del modelo base ni la sintaxis de tool-calling "atem"; las capacidades multimodales y de herramientas no estan disponibles.
- Fusion a 4-bit: segun la tabla de merge del runner, fusionar un adaptador LoRA a Q4_0 borra la adaptacion (el resultado puntua como el modelo base, 0,69 frente a 1,00). Se recomienda fusionar a Q8_0 o F16.
- Sesgos del modelo base: al ser un derivado de Muse-Glimmer-30B de Meta, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se documentan explicitamente.
- Riesgo de alucinacion: no se evalua en la informacion disponible; como cualquier LLM, puede generar contenido falso o inconsistente.
- Longitud de contexto desconocida: no se especifica, lo que limita su uso en tareas que requieran ventanas largas.
- Dependencia del runtime: aunque es un GGUF estandar, la certificacion de arquitectura se hizo con xyntetik-runner; otros runtimes pueden no soportar todas las caracteristicas.

## Enlaces

- Artefacto en HuggingFace: https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-Surgical-Q4_K-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio de xyntetik-runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Reporte de frontera de cuantizacion: https://huggingface.co/Joakimpalm-Zen/Muse-Glimmer-30B-runner-quant-frontier-report
- Certificacion de arquitectura: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/muse-glimmer-cert-2026-08-11.md
- Pagina en Ollama: https://ollama.com/library/muse-glimmer:30b
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
