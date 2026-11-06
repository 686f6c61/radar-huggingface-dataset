# richardyoung/Qwen2.5-7B-Instruct-ARA-heretic

## Resumen

Qwen2.5-7B-Instruct-ARA-heretic es una variante "decensored" del modelo Qwen2.5-7B-Instruct desarrollada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El modelo aplica una tecnica de ablation de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 13 a 27 del transformer original, con el objetivo de eliminar los comportamientos de rechazo (refusals) del modelo base sin reentrenar los pesos desde cero. El resultado es un modelo de 7.615.616.512 parametros (7,61B) que conserva la arquitectura y capacidades del Qwen2.5-7B-Instruct original pero con una tasa de rechazo drasticamente reducida.

El modelo base Qwen2.5-7B-Instruct es un transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV, desarrollado por Alibaba Cloud. Cuenta con 28 capas, 28 cabezas de atencion para Q y 4 para KV (GQA), y un contexto completo de 131.072 tokens con generacion de hasta 8.192 tokens. La variante heretic mantiene estas especificaciones intactas, ya que la modificacion se limita a la ablacion de direcciones de activacion asociadas al comportamiento de rechazo.

La relevancia de este modelo radica en su caracter reproducible: el autor publica los parametros exactos de la ablacion (start_layer_index=13, end_layer_index=27, preserve_good_behavior_weight=0.8006, steer_bad_behavior_weight=0.0004, overcorrect_relative_weight=0.4085, neighbor_count=4), lo que permite verificar y reproducir el proceso. La model card reporta una reduccion de rechazos de 99/100 en el modelo original a 8/100 en esta variante, con una divergencia KL de 0.0205 respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y Attention QKV bias |
| Parametros totales | 7.615.616.512 (7,61B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens completos; generacion de hasta 8.192 tokens; config.json por defecto a 32.768 tokens con extension YaRN |
| Tipos de cuantizacion | No especificados en la informacion disponible; el repo contiene safetensors en precision original |
| Idiomas soportados | Ingles (segun la model card y los tags); el modelo base Qwen2.5 soporta mas de 29 idiomas, pero esta variante declara solo "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Capas | 28 |
| Cabezas de atencion | 28 para Q, 4 para KV (GQA) |
| Parametros no-embedding | 6,53B |
| Tamano del repo | 15,2 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct: un transformer causal denso con 28 capas, atencion con Grouped Query Attention (28 cabezas Q, 4 cabezas KV), RoPE para codificacion posicional, activacion SwiGLU y normalizacion RMSNorm. El modelo base fue entrenado por Alibaba Cloud en dos etapas (pretraining y post-training) e incorpora mejoras en conocimiento, codigo, matematicas, seguimiento de instrucciones y generacion de texto largo respecto a Qwen2. La variante heretic no modifica esta arquitectura ni los pesos de forma estructural: aplica una ablacion de rangos arbitrarios (ARA) sobre las activaciones de las capas 13 a 27.

El proceso de "decensoring" mediante Heretic v2.0.0 consiste en identificar direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y proyectar las activaciones fuera de esas direcciones, preservando al mismo tiempo el comportamiento util. Los parametros reportados en la model card son: preserve_good_behavior_weight=0.8006, steer_bad_behavior_weight=0.0004, overcorrect_relative_weight=0.4085 y neighbor_count=4, aplicados entre las capas 13 y 27. No se realizo un reentrenamiento con RLHF ni DPO adicional; la modificacion es puramente de inferencia sobre los pesos del modelo base. La model card indica que el proceso es reproducible mediante el directorio `reproduce/` del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, codigo y matematicas heredados del Qwen2.5-7B-Instruct original.
- Comprension y generacion de datos estructurados, incluido JSON y tablas.
- Generacion de textos largos (hasta 8.192 tokens de salida).
- Manejo de contextos extensos mediante YaRN (hasta 131.072 tokens con configuracion adecuada).
- Seguimiento de instrucciones y resistencia a la diversidad de system prompts.
- Reduccion significativa de rechazos: 8/100 frente a 99/100 del modelo original, segun la model card.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible para esta variante; el modelo base Qwen2.5-7B-Instruct lo soporta, pero la ablacion podria afectar a dicho comportamiento.
- Capacidades multilingues: la model card declara solo ingles para esta variante, aunque el modelo base soporta mas de 29 idiomas.
- Sin soporte de vision ni audio (modelo exclusivamente de texto).

## Casos de uso

- **Investigacion sobre alineacion y seguridad**: el modelo permite estudiar como la ablacion de direcciones de activacion afecta al comportamiento de rechazo, con parametros reproducibles y una metrica de divergencia KL (0.0205) que cuantifica el alejamiento del modelo original. Es adecuado para experimentos controlados en interpretabilidad.
- **Generacion creativa sin filtros excesivos**: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas sin que el modelo se niegue a continuar. La reduccion de rechazos a 8/100 lo hace util en entornos donde el filtrado excesivo interrumpe el flujo creativo.
- **Prototipado de chatbots de rol**: el modelo base destaca en role-play y condicionamiento de personajes; la variante heretic elimina rechazos que romperian la inmersion en personajes con trasfondos oscuros o conflictivos.
- **Analisis de contenido sensible en entornos de investigacion**: clasificacion, resumen o extraccion de informacion de textos que abordan violencia, contenido adulto o temas tabu, donde un modelo censurado se negaria a procesar la entrada.
- **Evaluacion comparativa de modelos abliterated**: al ser reproducible y publicar los parametros ARA, sirve como referencia para comparar distintas tecnicas de ablacion (Heretic, abliteration clasica, fine-tuning de rechazo) sobre la misma base Qwen2.5-7B-Instruct.
- **Despliegue en local para uso personal**: con 7,61B parametros y cuantizacion adecuada, puede ejecutarse en GPUs de consumo para experimentacion personal sin dependencia de APIs externas sujetas a politicas de contenido.
- **Generacion de codigo y tareas tecnicas**: hereda las capacidades de codigo y matematicas del Qwen2.5-7B-Instruct, por lo que puede emplearse en asistentes de programacion donde se prefiera un modelo sin capas adicionales de rechazo.

## Benchmarks y rendimiento

La model card solo reporta dos metricas comparativas respecto al modelo original:

| Metrica | Este modelo | Qwen/Qwen2.5-7B-Instruct |
|---|---|---|
| Rechazos (refusals) | 8/100 | 99/100 |
| Divergencia KL | 0,0205 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante. El modelo base Qwen2.5-7B-Instruct reporta resultados detallados en el blog oficial de Qwen, pero no se trasladan aqui al no estar incluidos en la informacion proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en precision FP16/BF16, aproximadamente 15,2 GB solo para los pesos, mas overhead de activaciones y cache KV (que puede ser significativo con contextos largos). En cuantizacion de 8 bits, en torno a 8 GB; en 4 bits, alrededor de 4-5 GB.
- **GPU recomendadas**: A100 (40/80 GB) o H100 para despliegue en produccion con contexto largo y alto throughput; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) similar.
- **Compatibilidad con GPU de consumo**: si, en GPUs con al menos 8 GB de VRAM usando cuantizacion de 4-8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.). En FP16 requiere al menos 16 GB, por lo que cabe en RTX 4080/4090 o superiores.
- **Opciones de despliegue**: transformers (libreria declarada), vLLM (recomendado por Qwen para el modelo base, con soporte de YaRN estatico), llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repo), TGI (el tag `text-generation-inference` esta presente).
- **Latencia y throughput**: no disponibles en la informacion proporcionada. Qwen publica benchmarks de velocidad para el modelo base en su documentacion, pero no se han trasladado a esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-ARA-heretic (este) | 7,61B | 131.072 (32.768 por defecto, YaRN) | 8/100 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,61B | 131.072 (32.768 por defecto, YaRN) | 99/100 | Apache 2.0 | Hugging Face |
| Otras variantes abliterated de Qwen2.5-7B | ~7,61B | Variable | No disponible | Variable (generalmente Apache 2.0) | Hugging Face |

La comparativa directa mas relevante es con el modelo base, ya que comparten arquitectura, parametros y licencia; la unica diferencia medible reportada es la tasa de rechazo y la divergencia KL. No se dispone de datos de benchmarks estandar para esta variante que permitan comparar rendimiento en tareas concretas frente a otras alternativas.

## Limitaciones y advertencias

- **Sesgos y contenido nocivo**: al eliminar los rechazos, el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. No debe desplegarse en aplicaciones de cara al publico sin filtros externos.
- **Riesgo de alucinacion**: heredado del modelo base; la ablacion no corrige ni agrava este comportamiento de forma documentada, pero la reduccion de rechazos puede aumentar la confianza aparente en respuestas incorrectas.
- **Idiomas**: la model card declara solo ingles para esta variante, aunque el modelo base soporta mas de 29 idiomas. El rendimiento multilingue tras la ablacion no esta documentado.
- **Tool calling y agentes**: no confirmado para esta variante; la ablacion podria degradar comportamientos estructurados del modelo base. Requiere validacion propia antes de usar en pipelines de agentes.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado. El uso comercial de un modelo sin filtros de rechazo puede incumplir las politicas de las plataformas de despliegue (APIs, clouds gestionados) y las normativas locales sobre contenido.
- **Contexto largo**: el config.json por defecto esta a 32.768 tokens; para aprovechar los 131.072 hay que activar YaRN manualmente, lo que puede degradar el rendimiento en textos cortos (advertencia del propio Qwen sobre el YaRN estatico en vLLM).
- **Reproducibilidad**: aunque el autor publica los parametros ARA, no se detalla en la informacion disponible el dataset de calibracion ni el procedimiento exacto de evaluacion de rechazos (8/100), por lo que la comparacion con el modelo base no es verificable de forma independiente con los datos aportados.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Heretic (proyecto): https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
