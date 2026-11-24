# doth4580/DeepSeek-V4.1-Flash-1017-Mia-EXL3-2.9bpw-Engram

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue autocontenido para DeepSeek-V4.1-Flash-1017, el modelo insignia de DeepSeek-AI. El autor, doth4580, combina en un unico repositorio tres piezas: los pesos cuantizados EXL3 a 2,9 bits por peso (bpw) generados por Mia-AiLab con su esquema EAQ, las tablas de embedding Engram en FP8 originales de DeepSeek y un conjunto de hashes y manifiestos precalculados para acelerar el arranque en el runtime veloGB10.

El modelo subyacente es un transformer de 105.247.867.090 parametros (unos 105,2 mil millones), segun los safetensors del repositorio. La cuantizacion agresiva a 2,97 bpw efectivos reduce el checkpoint EXL3 a unos 210,6 GB repartidos en 39 shards, mientras que las tablas Engram en FP8 anaden cerca de 190 GB adicionales. El resultado es un paquete de 413,7 GB pensado para servir el modelo en clusters de NVIDIA DGX Spark (GB10) con paralelismo tensorial TP2, TP4 o TP8.

La relevancia de este repositorio es operativa: elimina el coste de hashear cientos de gigabytes en el primer arranque gracias a los manifiestos precalculados y permite lanzar el servidor de inferencia con una sola bandera `--model-dir`, sin necesidad de apuntar por separado al origen de las tablas Engram. La licencia declarada es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DeepSeek-V4.1-Flash-1017); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 105.247.867.090 (~105,2 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,9 bpw (2,97 bpw efectivos); lm_head en 6 bits; drafter DSpark en 4 bits; tablas Engram en FP8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (39 shards EXL3 + 2 shards Engram FP8) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 mas alla de su identificador de arquitectura (`deepseek_v41`) y del recuento de parametros. Tampoco se detallan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Estos datos deberian consultarse en la model card del modelo original de DeepSeek-AI.

Lo que si documenta este repositorio es la cadena de cuantizacion y empaquetado. Mia-AiLab aplica cuantizacion EXL3 con su variante EAQ a 2,9 bpw, manteniendo el `lm_head` en 6 bits y el drafter DSpark (usado para decodificacion especulativa o multi-token prediction, segun el flag `--mtp`) en 4 bits. Sobre esa base, doth4580 anade las tablas de embedding Engram en FP8 sin recuantizar y genera un `shard_hashes.json` con digests SHA-256 y tamanos en bytes de todos los shards, de las ocho cabezas Engram empaquetadas y de los segmentos de capas por rango para TP2, TP4 y TP8. Esa precomputacion es la innovacion practica del paquete: evita el hashing de varios cientos de gigabytes en el primer arranque del servidor.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base DeepSeek-V4.1-Flash-1017; la informacion proporcionada no detalla tareas especificas.
- Decodificacion multi-token: el paquete incluye el drafter DSpark en 4 bits y el runtime se lanza con `--mtp on`, lo que habilita prediccion multi-token.
- Embeddings Engram: tablas de embedding de gran tamano en FP8 integradas en el mismo directorio, detectadas automaticamente por veloGB10.
- Servido distribuido: soporte de paralelismo tensorial en TP2, TP4 y TP8 sobre nodos DGX Spark conectados por RoCEv2 de doble carril a 200 GbE.
- Tool calling, agentes, vision, audio y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en cluster DGX Spark: el paquete esta disenado para lanzarse con `gb10_inference --server --model-dir ... --mtp on --tp 8` sobre ocho nodos GB10, lo que permite servir un modelo de 105,2 mil millones de parametros en hardware de borde con memoria unificada.
- Inferencia en configuraciones reducidas: con TP4 sobre cuatro nodos DGX Spark se puede servir el mismo checkpoint, util para laboratorios con menos nodos disponibles.
- Arranque rapido en produccion: los manifiestos y hashes precalculados eliminan el SHA-256 inicial de cientos de gigabytes, lo que reduce el tiempo de puesta en marcha de un servidor nuevo.
- Reproducibilidad y auditoria: `shard_hashes.json` permite verificar la integridad de cada shard y de cada segmento por rango, adecuado para pipelines que exigen comprobacion de artefactos antes de servir.
- Investigacion sobre cuantizacion extrema: sirve como referencia para estudiar el impacto de EXL3 a 2,9 bpw con `lm_head` en 6 bits y drafter en 4 bits sobre un modelo de este tamano.
- Integracion con herramientas EXL3 estandar: el directorio raiz conserva el checkpoint EXL3 intacto (`config.json`, `quantization_config.json`, tokenizer y chat template), por lo que puede usarse con el ecosistema EXL3 ademas de con veloGB10.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el checkpoint EXL3 ocupa unos 210,6 GB y las tablas Engram FP8 unos 190 GB, lo que suma aproximadamente 400 GB de pesos; el repositorio completo pesa 413,7 GB.
- GPU recomendadas: NVIDIA DGX Spark (GB10) en configuraciones de 4 u 8 nodos, segun los ejemplos de la model card.
- Cabe en GPU de consumo: no disponible; por el volumen de pesos, no es viable en una unica GPU consumer.
- Opciones de despliegue: runtime `gb10_inference` con `--mtp on` y `--tp 2/4/8`; el checkpoint raiz es compatible con herramientas EXL3 estandar.
- Red: RoCEv2 de doble carril a 200 GbE entre nodos, segun la configuracion documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doth4580/DeepSeek-V4.1-Flash-1017-Mia-EXL3-2.9bpw-Engram | ~105,2 mil millones | no disponible | EXL3 2,9 bpw + Engram FP8 | MIT | Hugging Face, 0 descargas |
| Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw | no disponible | no disponible | EXL3 2,9 bpw EAQ | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | pesos originales (FP8 en Engram) | no disponible | Hugging Face |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que la informacion proporcionada no incluye alternativas de otros desarrolladores con las que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo original: es un empaquetado de pesos cuantizados y tablas de embedding; cualquier limitacion del modelo base DeepSeek-V4.1-Flash-1017 se hereda sin cambios.
- Cuantizacion agresiva: 2,97 bpw efectivos con `lm_head` en 6 bits y drafter en 4 bits pueden degradar la calidad frente a los pesos originales; no se aportan mediciones de esa perdida.
- Dependencia de runtime: el arranque simplificado sin `--engram-source` requiere veloGB10; otros runtimes EXL3 necesitan apuntar manualmente al origen de las tablas Engram.
- Requisitos de memoria muy elevados: alrededor de 400 GB de pesos hacen inviable el despliegue fuera de clusters con memoria agregada.
- Idiomas, sesgos y riesgo de alucinacion: no disponible en la informacion proporcionada; deben consultarse en la documentacion del modelo base.
- Licencia: se declara MIT, pero la model card indica que la licencia se preserva literalmente del upstream; conviene verificar el fichero `LICENSE` antes de uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/doth4580/DeepSeek-V4.1-Flash-1017-Mia-EXL3-2.9bpw-Engram
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizacion EXL3 EAQ de Mia-AiLab: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-1017-EXL3-EAQ-v1-2.9-bpw
- Perfil de DeepSeek-AI: https://huggingface.co/deepseek-ai
- Perfil de Mia-AiLab: https://huggingface.co/Mia-AiLab
