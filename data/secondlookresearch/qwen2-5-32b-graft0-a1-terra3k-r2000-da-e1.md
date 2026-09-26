# SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r2000-da-e1

## Resumen

Este repositorio aloja un adaptador LoRA de tipo PEFT llamado Qwen2.5-32B-graft0-a1-terra3k-r2000-da-e1, publicado por el usuario SecondLookResearch sobre el modelo base Qwen/Qwen2.5-32B. No es un modelo completo, sino un adaptador de rango 64 y alfa 128 aplicado únicamente a capas lineales, entrenado durante una sola época «from scratch» y pensado para servirse apilado sobre otro adaptador previo (A1) en un modelo base parcheado. El repositorio ocupa 2,2 GB y solo contiene pesos de adaptador en formato safetensors.

El entrenamiento corresponde a la etapa que el autor denomina «difficult advice», dentro de una escalera de datos «terra 3k», en la rung de 2000 filas. La partición de validación es terra3k-val-qwen25.jsonl y las filas de entrenamiento son un prefijo con semilla 0 del mismo shuffle que el resto de rungs. El adaptador se aplica «fresh», es decir, entrenado desde cero sobre una plataforma A1 ya fusionada y congelada, con un warmup del 5 % (mínimo 2 pasos).

Se trata de un artefacto de investigación con trazabilidad mínima: 5 descargas, 0 «likes», sin model card descriptiva más allá de las instrucciones de servicio y sin licencia declarada. Su interés es acotado y experimental, orientado a estudiar escalado de datos («ladder») y apilado de adaptadores, no a un uso de producción directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen2.5-32B |
| Parametros totales | no disponible (pesos de adaptador; el base Qwen2.5-32B tiene aproximadamente 32 500 millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens en el modelo base; no especificada para el adaptador |
| Tipos de cuantizacion | no disponible para el adaptador; el base admite bf16, fp16, GPTQ, AWQ y GGUF |
| Idiomas soportados | no disponible (los del base, sin verificacion especifica en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | Qwen/Qwen2.5-32B |
| Libreria | peft |
| Rango LoRA | 64 |
| Alfa LoRA | 128 |
| Modulos objetivo | solo capas lineales |
| Etapa de entrenamiento | difficult advice (escalera terra 3k, rung de 2000 filas) |
| Epocas | 1 |
| Warmup | 5 % (minimo 2 pasos) |
| Tamano del repositorio | 2,2 GB |
| Fecha de creacion registrada | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

El objeto del repositorio es un adaptador de bajo rango (LoRA r64/a128) que no modifica la arquitectura del modelo base, sino que añade matrices de bajo rango sobre las capas lineales de Qwen2.5-32B. El autor describe el procedimiento como «fresh linear-only LoRA r64/a128 over frozen graft0-a1»: el adaptador se inicializa desde cero y se entrena sobre una plataforma A1 previamente fusionada y congelada, de modo que no se parte de los pesos de un adaptador anterior, sino de un base ya modificado por A1.

El entrenamiento cubre una sola época sobre 2000 filas de una escalera de datos denominada «terra 3k», con partición de validación específica (terra3k-val-qwen25.jsonl) y warmup del 5 % con suelo de 2 pasos. No se documentan en la información proporcionada el número total de tokens vistos, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se especifican innovaciones de inferencia (decodificación especulativa, atención lineal ni similares). El aspecto técnico diferencial es el apilado de adaptadores: el servicio requiere aplicar primero A1 y después este adaptador sobre un base parcheado, ejecutando `serve_reconstructed.sh` con `ROW_PATCH=1` y la lista `ADAPTERS`.

## Capacidades

- Generación de texto y razonamiento general: heredadas del base Qwen2.5-32B, sin verificación específica en este repositorio.
- Codigo y matematicas: capacidades propias del base; no se aportan evaluaciones del adaptador.
- Ajuste de comportamiento conversacional: el nombre de la etapa («difficult advice») sugiere especialización en respuestas de consejo en situaciones difíciles, si bien no se documenta formalmente qué comportamiento concreto induce.
- Soporte de tool calling o function calling: no disponible para el adaptador; el base Qwen2.5 sí lo soporta de serie.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas en este repositorio.
- Capacidades multilingues: no disponibles; dependerían del base, que declara soporte para más de 29 idiomas.
- Capacidades multimodales (visión o audio): no disponibles; Qwen2.5-32B es un modelo exclusivamente de texto.
- Modo «thinking» o razonamiento extendido: no disponible.

## Casos de uso

- Investigación sobre escalado de datos de ajuste: el adaptador forma parte de una «ladder» (terra 3k) con rungs de distinto tamaño; se usaría para estudiar cómo varía el comportamiento al aumentar la rung de 2000 filas frente a otras rungs del mismo experimento.
- Estudio de apilado de adaptadores: al requerir A1 aplicado primero y este adaptador después, sirve como banco de pruebas para metodologías de composición de LoRA sobre un mismo base congelado.
- Reproducción de experimentos de ajuste con PEFT: el repositorio incluye el script `code/msm_eval/serve_reconstructed.sh`, lo que permite reproducir el pipeline de evaluación con `ROW_PATCH=1` y la lista de adaptadores.
- Evaluación de deriva de comportamiento («difficult advice»): útil para medir si un ajuste pequeño sobre un base de 32B altera la política de respuesta ante consultas delicadas, comparando contra el base sin adaptador.
- Generación de respuestas de asesoramiento en dominios acotados: si el ajuste funciona, podría emplearse en asistentes que deban dar consejo matizado en escenarios ambiguos, aunque sin garantías de calidad al no haber benchmarks.
- Base para ajustes posteriores: al ser un adaptador ligero, puede servir como punto de partida para nuevas etapas de ajuste sin necesidad de reentrenar el modelo completo de 32B.
- Analisis de seguridad de modelos: util para auditar si una etapa de «consejo difícil» incrementa respuestas inseguras, sesgadas o excesivamente complacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas (MMLU, HumanEval, GSM8K ni ninguna otra), y tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- El adaptador en sí es ligero (2,2 GB en disco), pero requiere cargar el modelo base Qwen2.5-32B completo para funcionar.
- Inferencia en bf16/fp16: unos 65 GB de pesos, más caché KV; requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Inferencia en int8: aproximadamente 34 GB de pesos; encaja en una GPU de 48 GB o en dos de 24 GB.
- Inferencia en 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 18-20 GB de pesos; cabe en una RTX 3090 o RTX 4090 de 24 GB.
- Caché KV: con 64 capas, 8 cabezas KV y dimensión de cabeza 128, cada token consume unos 256 KB en fp16; 32 000 tokens de contexto suponen unos 8 GB y 128 000 tokens, unos 32 GB adicionales.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; A6000/L40S 48 GB para int8; RTX 4090 o RTX 3090 para cuantización de 4 bits.
- Opciones de despliegue: vLLM (con soporte multi-LoRA), TGI, transformers + PEFT, y llama.cpp u Ollama si se fusiona el adaptador en los pesos. El propio autor proporciona `serve_reconstructed.sh` con `ROW_PATCH=1` y `ADAPTERS="<a1-repo> <this-repo>"`, que exige aplicar A1 antes que este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-32B) | no disponible | 131 072 tokens (base) | no disponible | safetensors (PEFT) | Requiere apilar A1; 5 descargas; sin benchmarks |
| Qwen2.5-32B (base) | 32 500 millones aprox. | 131 072 tokens | Apache 2.0 | safetensors, GPTQ, AWQ, GGUF | Modelo denso de referencia, ampliamente evaluado |
| Qwen2.5-72B | 72 700 millones aprox. | 131 072 tokens | Licencia Qwen | safetensors, GPTQ, AWQ, GGUF | Mayor capacidad, requiere hardware superior |
| Llama-3.3-70B-Instruct | 70 000 millones aprox. | 128 000 tokens | Llama 3.3 Community License | safetensors, GGUF | Alternativa de escala similar con licencia con cláusulas de uso |

La comparación con modelos completos es asimétrica: el artefacto de este repositorio es un adaptador que no puede ejecutarse de forma autónoma y cuyo rendimiento final depende tanto del base como del adaptador A1 previo. No se dispone de comparaciones directas con otros adaptadores públicos sobre Qwen2.5-32B.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el base Qwen2.5-32B y el adaptador A1 aplicado en primer lugar; sin esa cadena, el resultado es indeterminado.
- Licencia no declarada, lo que impide confirmar si se permite uso comercial o redistribución. El base es Apache 2.0, pero la licencia del adaptador es independiente y aquí no se especifica.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora frente al base ni de regresión en capacidades generales.
- Riesgo de alucinación: inherente al base Qwen2.5-32B; un ajuste de «consejo difícil» puede aumentar la confianza en respuestas sin base factual.
- Riesgo de sesgo y de complacencia: las etapas de asesoramiento pueden inducir respuestas que validen al usuario en lugar de corregirlo, algo no evaluado aquí.
- Trazabilidad limitada: 5 descargas, 0 «likes» y una model card centrada únicamente en instrucciones de servicio, sin descripción de datos, composición o metodología de evaluación.
- Idiomas no documentados: no se indica qué lenguas cubre el ajuste ni si degrada el multilingüismo del base.
- Fechas incoherentes: las marcas temporales del repositorio (26 de septiembre de 2026) no se corresponden con una fecha actual plausible, lo que sugiere un error de registro y obliga a tratar los metadatos con cautela.
- Idoneidad para producción muy baja: es un artefacto experimental, sin garantías de estabilidad, soporte ni mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-graft0-a1-terra3k-r2000-da-e1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Libreria PEFT: https://github.com/huggingface/peft
- Script de servicio citado en la model card: code/msm_eval/serve_reconstructed.sh (dentro del repositorio)
- Particion de validacion citada: terra3k-val-qwen25.jsonl (no enlazada publicamente en la informacion disponible)
