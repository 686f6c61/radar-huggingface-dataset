# RedHatAI/Muse-Glimmer-30B-NVFP4

## Resumen

Muse-Glimmer-30B-NVFP4 es un checkpoint cuantizado en NVFP4 (W4A4) del modelo multimodal Muse-Glimmer-30B desarrollado por Muse (Meta), publicado por RedHatAI. Se trata de un modelo image-text-to-text que acepta texto e imágenes como entrada y genera texto, construido sobre la arquitectura MuseGlimmerForConditionalGeneration. La cuantización reduce el peso por parámetro de 16 a 4 bits, disminuyendo aproximadamente un 75 % el espacio en disco y los requisitos de memoria de GPU respecto al modelo base en BF16.

El checkpoint declara 18.767.497.024 parámetros reales en sus safetensors, aunque el nombre comercial del modelo base es "30B"; el repositorio ocupa 23,4 GB. Está pensado para servirse con vLLM y utiliza el formato compressed-tensors generado por LLM Compressor, con calibración sobre open-perfectblend. La licencia es Apache 2.0, lo que facilita su adopción comercial.

Su relevancia actual radica en que permite desplegar un modelo multimodal de gran tamaño con un coste de memoria muy reducido y con soporte nativo de tool calling y reasoning parser en vLLM, manteniendo un rendimiento cercano (e incluso superior en GPQA-Diamond bajo el protocolo del autor) al del modelo base BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer multimodal, image-text-to-text) |
| Parametros totales | 18.767.497.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, pesos y activaciones FP4); checkpoint cuantizado, sin otras variantes publicadas en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada del modelo base meta-models/Muse-Glimmer-30B, cuya arquitectura se identifica como MuseGlimmerForConditionalGeneration, orientada a generación condicional multimodal con entrada de texto e imagen y salida de texto. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset original ni si el modelo base empleó RLHF o DPO.

La innovación técnica principal de este checkpoint es la cuantización NVFP4 aplicada con LLM Compressor mediante GPTQModifier con esquema NVFP4, calibrando con 1024 muestras de open-perfectblend (split train), longitud máxima de secuencia 2048 y excluyendo de la cuantización las capas de visión (`re:.*vision.*`), `lm_head` y `re:.*embed_tokens.*`. Solo se cuantizan pesos y activaciones de los operadores lineales dentro de los bloques transformer. El resultado se exporta en formato compressed-tensors para inferencia con vLLM.

## Capacidades

- Generación de texto a partir de entradas multimodales (texto e imagen), con pipeline image-text-to-text.
- Razonamiento avanzado: el modelo base admite un parámetro `reasoning_strength` con niveles de esfuerzo, incluido `xhigh` (el más alto de la plantilla), según el protocolo de evaluación del autor.
- Soporte de tool calling / function calling en vLLM mediante `--enable-auto-tool-choice` y el parser `--tool-call-parser muse_glimmer`.
- Soporte de reasoning parser específico (`--reasoning-parser muse_glimmer`), lo que permite separar el razonamiento de la respuesta final en el serving.
- Conversacional multi-turno (tag `conversational`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Comprensión de imágenes integrada en el modelo base, aunque las capas de visión no se cuantizan en este checkpoint.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede procesar capturas de pantalla o fotos enviadas por el usuario junto con texto y responder en conversaciones multi-turno, gracias a su naturaleza image-text-to-text y su tag conversacional.
- Análisis de documentos e imágenes en pipelines de back-office: extracción de información de facturas, formularios o diagramas enviados como imagen, combinando la entrada visual con instrucciones textuales.
- Agentes con tool calling en producción: al soportar function calling nativo en vLLM con el parser `muse_glimmer`, puede integrarse en orquestadores de agentes que necesiten invocar APIs externas (búsqueda, cálculo, acceso a bases de datos) en varios pasos.
- Razonamiento con esfuerzo configurable: para tareas de análisis complejo (diagnóstico técnico, revisión de código, planificación) se puede activar `reasoning_strength: xhigh`, reservando niveles menores para consultas simples y optimizando latencia.
- Despliegue en infraestructura con memoria limitada: al ocupar aproximadamente un 75 % menos de memoria que el modelo BF16, es adecuado para servir en una sola GPU de gama alta (por ejemplo, B200 según la receta oficial) o para aumentar el número de réplicas por nodo.
- Evaluación comparativa de cuantización: útil como referencia para medir la degradación (o mejora aparente) de un modelo multimodal al pasar de BF16 a NVFP4 en tareas como GPQA-Diamond y MMLU-Pro.
- Investigación en eficiencia de inferencia: sirve como caso de estudio de cuantización W4A4 con calibración GPTQ sobre datos conversacionales (open-perfectblend) y su impacto en benchmarks de razonamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con vLLM en una única GPU B200, temperatura 1.0, top_p 0.95, top_k 64, `reasoning_strength: xhigh`, una época (pass@1) e `inspect_evals`:

| Benchmark | Base (BF16) | Este checkpoint (NVFP4) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 0.747 ± 0.031 | 0.828 ± 0.027 |
| MMLU-Pro (12.032 preguntas) | 0.807 ± 0.004 | 0.783 ± 0.004 |

Las puntuaciones son precisión pass@1 de una sola época; el símbolo ± corresponde al error estándar binomial sobre las muestras del benchmark. SWE-bench Verified no se ha ejecutado para ninguno de los dos checkpoints bajo este protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 23,4 GB en disco; con cuantización NVFP4 de pesos y activaciones, la memoria de GPU necesaria es aproximadamente un 75 % menor que la del modelo base en BF16.
- GPU recomendadas: el autor valida el despliegue en una única NVIDIA B200; no se especifican otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el soporte NVFP4 depende de hardware con soporte nativo de FP4, por lo que no se garantiza su funcionamiento en GPU consumer convencionales.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:muse-glimmer`), con `--generation-config auto`, `--tensor-parallel-size 1`, `--enable-auto-tool-choice`, `--tool-call-parser muse_glimmer` y `--reasoning-parser muse_glimmer`. También es cargable con transformers mediante `MuseGlimmerForConditionalGeneration` y `AutoProcessor`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| RedHatAI/Muse-Glimmer-30B-NVFP4 | 18.767.497.024 | no disponible | NVFP4 (W4A4) | Apache 2.0 | GPQA-Diamond 0.828; MMLU-Pro 0.783 |
| meta-models/Muse-Glimmer-30B (base) | no disponible (nombre comercial 30B) | no disponible | BF16 | no disponible en la informacion | GPQA-Diamond 0.747; MMLU-Pro 0.807 |
| Otras alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente al modelo base; no se han identificado en la información proporcionada otras alternativas de la misma categoría con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir degradación en tareas no cubiertas por la evaluación publicada; en MMLU-Pro el checkpoint NVFP4 obtiene 0.783 frente a 0.807 del BF16, una caída de 2,4 puntos.
- La mejora en GPQA-Diamond (0.828 frente a 0.747) se ha medido con una sola época y error estándar de ±0.027/±0.031; no debe interpretarse como una mejora robusta sin réplicas adicionales.
- SWE-bench Verified no se ha evaluado en ninguno de los dos checkpoints, por lo que no hay evidencia publicada sobre rendimiento en tareas de ingeniería de software.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un modelo base de Meta, hereda los sesgos de sus datos de entrenamiento, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos y debe mitigarse con verificación externa en producción.
- Idiomas soportados y longitud de contexto: no disponibles, lo que limita la planificación de despliegues multilingües o con contextos muy largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de calibración (open-perfectblend) en el contexto de cada producto.
- El soporte de NVFP4 está ligado a hardware compatible con FP4 y a versiones recientes de vLLM; no se garantiza su funcionamiento en stacks o GPU más antiguas.
- Es necesario pasar `--generation-config auto` en vLLM, según indica el autor, para un comportamiento correcto de generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-NVFP4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Receta de uso en vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- README del modelo: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-NVFP4/blob/main/README.md
