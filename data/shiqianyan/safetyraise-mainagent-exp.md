# shiqianyan/SafetyRAISE-MainAgent-Exp

## Resumen

SafetyRAISE-MainAgent-Exp es un repositorio experimental publicado por el usuario shiqianyan en Hugging Face que contiene modelos cuantizados en formato GGUF derivados de Qwen/Qwen3.8-27B. No se trata de un modelo base entrenado desde cero, sino de un artefacto de investigación: el resultado de aplicar ajuste fino con LoRA y optimización de preferencias sobre el modelo Qwen3.8-27B, fusionar los pesos y cuantizarlos a Q4_K_M. El repositorio se organiza en dos subdirectorios (`report-exp-v1/` y `report-exp-v2/`) que corresponden a dos iteraciones del experimento, cada una con su propio README, plantilla de chat, indicaciones de presupuesto de razonamiento y ejemplos de arranque.

El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones) y un tamaño de repositorio de 33,6 GB, coherente con la cuantización Q4_K_M de un modelo de ese tamaño más los archivos auxiliares. La licencia es Apache 2.0, heredada del modelo base Qwen3.8-27B. El autor declara explícitamente que se trata de un repositorio experimental y que no se publican los pesos originales en precisión completa, los adaptadores LoRA, los pesos independientes de la cabeza MTP ni los parámetros de edición.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de flujo de trabajo de ajuste fino y cuantización sobre un modelo Qwen de 27B, y como artefacto reproducible para quienes quieran inspeccionar el resultado de una edición de dirección MLP sobre un modelo ya ajustado. No obstante, la información pública es escasa, no hay benchmarks publicados y el soporte de idiomas declarado se limita al chino (`zh`), lo que restringe su uso directo en producción en castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B); no se detalla en la model card |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) en ambas variantes publicadas |
| Idiomas soportados | chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); pesos completos, LoRA y cabeza MTP no publicados |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.8-27B, un transformer de aproximadamente 27,3 mil millones de parámetros. La model card no proporciona detalles sobre el número de capas, dimensión oculta, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.). Tampoco se documenta la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO más allá de la mención genérica a "optimización de preferencias".

El proceso de construcción descrito en la model card es el siguiente. En `report-exp-v1/` se parte del modelo base Qwen3.8-27B, se aplica ajuste fino con LoRA, se realiza una fase de optimización de preferencias, se fusionan los adaptadores con los pesos base y se cuantiza el resultado a Q4_K_M. Además, se incluye una cabeza MTP (multi-token prediction) reentrenada sobre el modelo fusionado. En `report-exp-v2/` se toma el peso de la primera versión, se aplica una edición de dirección sobre las capas MLP, se vuelve a cuantizar a Q4_K_M y se reentrena la cabeza MTP sobre el modelo editado. La innovación técnica destacable es precisamente esa edición de dirección en las MLP, un tipo de intervención sobre el espacio de activaciones que no se detalla cuantitativamente en la información disponible.

## Capacidades

- Generación de texto conversacional en chino, según el tag `conversational` y el idioma declarado.
- Razonamiento con presupuesto controlado: los subdirectorios incluyen "indicaciones de presupuesto de razonamiento" (thinking budget prompts), lo que sugiere soporte de modo de pensamiento con límite de tokens.
- Predicción multi-token (MTP): se incluye una cabeza MTP reentrenada, orientada a decodificación especulativa o generación acelerada.
- Ejecución local mediante llama.cpp, gracias al formato GGUF y a los archivos de arranque incluidos.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia compatible.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Evaluación de técnicas de edición de dirección en MLP: el repositorio permite comparar `report-exp-v1/` con `report-exp-v2/` para estudiar el efecto de la edición sobre las capas MLP en un modelo de 27B ya ajustado, usando los mismos prompts y la misma cuantización.
- Investigación sobre cabezas MTP: los pesos de la cabeza MTP reentrenada permiten experimentar con decodificación multi-token y medir su impacto en latencia y calidad frente a la decodificación token a token.
- Despliegue local en chino con llama.cpp: al estar en GGUF Q4_K_M y pesar unos 33,6 GB en el repositorio, puede ejecutarse en estaciones de trabajo con suficiente VRAM o RAM para prototipos de conversación en chino.
- Reproducción de pipelines de ajuste fino más cuantización: sirve como referencia de un flujo LoRA → optimización de preferencias → fusión → cuantización Q4_K_M → reentrenamiento de cabeza auxiliar.
- Pruebas de presupuesto de razonamiento: las indicaciones de thinking budget incluidas permiten medir cómo varía la calidad de respuesta al limitar los tokens de razonamiento en un modelo de 27B.
- Estudio de degradación por cuantización: al publicarse solo Q4_K_M y no los pesos completos, el repositorio es útil para analizar el comportamiento práctico de esa cuantización en tareas conversacionales en chino, aunque no permite comparar contra el modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, un modelo de 27,3B parámetros ocupa aproximadamente 16-17 GB solo en pesos; sumando caché KV y overhead de llama.cpp, conviene contar con 20-24 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M con contexto limitado; A100 40 GB, A100 80 GB, H100 o L40S para contextos largos o mayor paralelismo.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M y contexto contenido; en GPUs de 16 GB requeriría cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp es la vía documentada (el repositorio incluye ejemplos de arranque); también es compatible con endpoints según el tag `endpoints_compatible`. No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Notas |
|---|---|---|---|---|---|
| SafetyRAISE-MainAgent-Exp | 27,3B | no disponible | GGUF Q4_K_M | Apache 2.0 | Experimental, solo chino, sin benchmarks |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | Pesos completos (según el modelo base) | Apache 2.0 | Modelo original del que deriva; referencia obligada |
| Alternativas de ~27B en GGUF | no disponible | no disponible | GGUF | varía | No se dispone de datos verificados en la información proporcionada |

La comparación cuantitativa con otras alternativas de la misma categoría no está disponible: no hay benchmarks publicados ni se documentan métricas que permitan situar este modelo frente a otros de tamaño similar.

## Limitaciones y advertencias

- Repositorio estrictamente experimental: el propio autor lo etiqueta como `experimental` y no publica los pesos completos, los adaptadores LoRA, la cabeza MTP aislada ni los parámetros de edición, lo que impide reproducir el entrenamiento por completo.
- Idiomas: solo se declara chino (`zh`); no hay evidencia de calidad en castellano ni en otros idiomas.
- Sin benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que no puede evaluarse su rendimiento de forma objetiva.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo ajustado con optimización de preferencias sobre un base de 27B, es esperable un riesgo no despreciable en dominios especializados.
- Sesgos: no documentados; la composición del dataset de ajuste fino no se detalla.
- Cuantización única: solo se ofrece Q4_K_M, lo que impide evaluar la degradación respecto a los pesos completos y limita el ajuste fino de la relación calidad/VRAM.
- Licencia Apache 2.0: permite uso comercial, pero al no publicarse los pesos originales ni los adaptadores, la trazabilidad del linaje de entrenamiento es parcial.
- Contexto: al no documentarse la longitud de contexto, no debe asumirse que herede exactamente la del modelo base sin verificación empírica.
- Soporte de tool calling y agentes: no documentado; no debe asumirse en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shiqianyan/SafetyRAISE-MainAgent-Exp
- Árbol de archivos: https://huggingface.co/shiqianyan/SafetyRAISE-MainAgent-Exp/tree/main
- Repositorio GitHub con código de entrenamiento y evaluación: https://github.com/QianYan-Art/SafetyRAISE-Lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
