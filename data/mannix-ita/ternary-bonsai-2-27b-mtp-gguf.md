# ManniX-ITA/Ternary-Bonsai-2-27B-MTP-GGUF

## Resumen

Ternary Bonsai 2 27B MTP es un paquete GGUF publicado por ManniX-ITA que empaqueta el modelo PrismML Ternary-Bonsai-2-27B (27.320.697.856 parametros, denso, con pesos ternarios de extremo a extremo) junto con una cabeza borrador NextN/MTP en el mismo fichero, de modo que el modelo se autoespecula sin necesidad de un segundo modelo drafter externo. El backbone declarado es un hibrido Qwen3.8-27B con 262K tokens de contexto y licencia Apache-2.0.

El problema que resuelve es practico: los GGUF oficiales de PrismML no incluyen la capa NextN, por lo que no se puede activar decodificacion especulativa con el propio modelo. Estos bundles anaden la cabeza MTP exportada del modelo upstream Qwen/Qwen3.8-27B como una capa extra (block_count, nextn_predict_layers = 1), manteniendo el resto de tensores identicos byte a byte respecto al fichero original.

Es relevante ahora porque reduce el coste de inferencia manteniendo la distribucion del modelo. Segun los datos del autor, en respuestas greedy de 256 tokens sobre 12 prompts la decodificacion especulativa eleva el rendimiento de 128 a 161 tok/s en una RTX PRO 6000 (Blackwell) y de 46 a 57 tok/s en una RTX 3090, con una aceptacion de aproximadamente 2,3 tokens por paso. El modelo requiere un motor capaz de ejecutar pesos ternarios y una cabeza NextN empaquetada sobre un backbone hibrido qwen35.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con backbone hibrido qwen35, pesos ternarios de extremo a extremo y cabeza NextN/MTP empaquetada |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | No es MoE (modelo denso) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | PQ2_0 (ternario, ~1,72 bpw) y PTQ1_0 (ternario empaquetado); cabeza en q8_0; proyector de vision en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

Detalle de ficheros del repositorio:

| Fichero | Pesos | Tamano | sha256 |
|---|---|---|---|
| Ternary-Bonsai-2-27B-PQ2_0-MTP.gguf | PQ2_0 (ternario, ~1,72 bpw) + cabeza q8_0 | 7,66 GB | `211653d24a0bfdc3d1c5f65711b995f9311ce6b24363cfed3b9b113087de18b3` |
| Ternary-Bonsai-2-27B-PTQ1_0-MTP.gguf | PTQ1_0 (ternario empaquetado) + cabeza q8_0 | 6,40 GB | `174c9c6584e118766d5511e00a84fd8a31d146248915a726cfac8e6d140c6204` |

El proyector de vision no se duplica en este repositorio: hay que usar `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` (600 MiB) del repositorio base con `--mmproj`. El tamano total del repositorio es de 14,1 GB.

## Arquitectura y entrenamiento

El modelo base PrismML Ternary-Bonsai-2-27B es un transformer denso de 27,32 B de parametros con pesos ternarios aplicados de extremo a extremo. El backbone descrito es un hibrido Qwen3.8-27B, con 262K tokens de contexto y licencia Apache-2.0. Parte de los tensores estan rotados con transformada de Hadamard (PrismML `518ad108`); la cabeza MTP, en cambio, permanece en la base normal y no forma parte de los tensores rotados.

La innovacion de este paquete concreto es el empaquetado de la cabeza NextN/MTP. Se exporta la cabeza del modelo upstream Qwen/Qwen3.8-27B mediante `convert_hf_to_gguf.py --mtp --outtype q8_0` (llama.cpp upstream), generando `mtp-Qwen3.8-27B-Q8_0.gguf` (sha256 `c9e5c641de0c9896641c07a400ed92075024fe2c623549d427b1a6e44075bc0a`). Despues se integra en el GGUF de PrismML con el script `bonsai2-mtp-bundle.py` de opencoti: la cabeza pasa a ser la capa `block_count` y se fija `nextn_predict_layers = 1`. El script rechaza el empaquetado salvo que coincidan todos los hiperparametros compartidos `qwen35.*` y el vocabulario, y que no colisione ningun tensor. El resultado es byte-identico entre maquinas, como confirman los dos sha256 anteriores. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline declarado como text-generation, tag conversational).
- Autoespeculacion mediante cabeza NextN/MTP integrada: el modelo genera borradores y los verifica en el mismo fichero, con una aceptacion aproximada de 2,3 tokens por paso.
- Entrada de imagen opcional: admite vision si se carga el proyector `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` con `--mmproj`. El proyector se carga en la primera peticion de imagen, sin reservar memoria en el arranque.
- Contexto largo de 262K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Pesos ternarios de bajo coste de memoria (~1,72 bpw en PQ2_0), pensados para despliegue en hardware de gama consumer y profesional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible (el tag `opencoti` aparece en el repositorio, pero no se documenta una capacidad de razonamiento explicita).

## Casos de uso

- Inferencia local de bajo consumo en GPU consumer: el fichero PQ2_0 ocupa 7,66 GB, por lo que cabe en una RTX 3090 (24 GB) y permite servir un modelo de 27B con pesos ternarios a 46-57 tok/s. Adecuado para asistentes locales y prototipado sin depender de la nube.
- Despliegue de alto rendimiento en servidor: en una RTX PRO 6000 (Blackwell) alcanza 161 tok/s con MTP activado, lo que resulta util para servicios de chat interactivo con muchos usuarios concurrentes.
- Procesamiento de documentos largos: con 262K tokens de contexto se pueden analizar informes, bases de codigo o expedientes completos sin trocear, manteniendo coherencia entre secciones.
- Aplicaciones multimodales ligeras: cargando el proyector Q8_0 (600 MiB) se habilita entrada de imagen para tareas de descripcion, extraccion de informacion o asistencia visual, con carga del proyector bajo demanda.
- Demo y evaluacion rapida de pesos ternarios: el bundle permite medir el efecto de la decodificacion especulativa sobre un modelo ternario denso comparando las mismas peticiones con `--spec-type draft-mtp` activado y desactivado.
- Pipelines con presupuesto de memoria ajustado: PTQ1_0 ocupa 6,40 GB, la opcion mas compacta para entornos donde la VRAM es el cuello de botella, a costa de una cuantizacion ternaria empaquetada mas agresiva que PQ2_0.
- Integracion en el ecosistema opencoti: el asistente de configuracion de opencoti lista este repositorio bajo la familia Ternary Bonsai 2 y ofrece el proyector como descarga opcional, lo que simplifica el aprovisionamiento en entornos de desarrollo.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento publicado son mediciones de throughput en decodificacion especulativa:

| Tarjeta | PQ2_0, MTP off | PQ2_0, MTP on (profundidad 2) | Aceptacion |
|---|---|---|---|
| RTX PRO 6000 (Blackwell) | 128 tok/s | 161 tok/s | ~2,3 tokens / paso |
| RTX 3090 | 46 tok/s | 57 tok/s | ~2,3 tokens / paso |

Mediciones en modo greedy, respuestas de 256 tokens, 12 prompts de chat, medianas. El autor advierte de que la especulacion preserva la distribucion del modelo, no el argmax en empates cercanos: con muestreo greedy la respuesta puede diferir de la no especulada en una posicion donde los dos tokens mas probables estan a pocas centesimas de nat (el lote de verificacion redondea de forma distinta a la decodificacion de un solo token). No se midio degeneracion: la tasa de 4-gramas distintos es identica con y sin especulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos PQ2_0 ocupa 7,66 GB y PTQ1_0 6,40 GB; sumando el contexto KV a 262K tokens y el proyector, se necesita bastante mas VRAM, aunque la informacion proporcionada no da una cifra cerrada de consumo total.
- GPU recomendadas segun los datos del autor: RTX 3090 (46-57 tok/s) y RTX PRO 6000 Blackwell (128-161 tok/s). El resto de modelos no viene especificado.
- Compatibilidad con GPU consumer: si, cabe en una RTX 3090 (24 GB), como confirman las mediciones del autor.
- Motor de despliegue obligatorio: se necesita un engine que ejecute pesos ternarios y una cabeza NextN empaquetada sobre un backbone qwen35. El llamafile de opencoti (a partir del corte c11) lo hace; el fork de llama.cpp de PrismML ejecuta los pesos ternarios pero no la cabeza empaquetada.
- Comando de referencia: `./opencoti-llamafile --server -m Ternary-Bonsai-2-27B-PQ2_0-MTP.gguf -ngl 99 -fa on --spec-type draft-mtp`. Para vision, anadir `--mmproj Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf`.
- Profundidad de borrador: para los tipos de fichero ternarios la profundidad de borrador es una fila fija de tabla interna (profundidad 2), sin necesidad de flag.
- Otros motores (vLLM, TGI, Ollama, llama.cpp upstream): no disponible en la informacion proporcionada; solo se confirma el soporte de opencoti llamafile.
- Latencia y throughput estimados: ver tabla de la seccion de benchmarks.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de otros modelos comparables con los que contrastar parametros, contexto, rendimiento o licencia. Unicas referencias explicitas:

| Modelo | Relacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| PrismML Ternary-Bonsai-2-27B (base) | Modelo del que deriva | 27,32 B (denso, ternario) | 262K | Apache-2.0 |
| Este bundle (MTP) | Anade cabeza NextN/MTP | 27,32 B + cabeza MTP | 262K | Apache-2.0 |
| Qwen/Qwen3.8-27B | Origen de la cabeza MTP | no disponible | no disponible | Apache-2.0 (segun el autor) |

Comparativa con alternativas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Dependencia estricta del motor: los bundles solo funcionan en un engine que soporte pesos ternarios y cabeza NextN empaquetada sobre qwen35 (opencoti llamafile desde el corte c11). El fork de llama.cpp de PrismML no ejecuta la cabeza incluida.
- Divergencia por redondeo: con muestreo greedy, la decodificacion especulativa puede producir una respuesta distinta a la no especulada en posiciones con empate cercano entre los dos tokens mas probables (diferencia de pocas centesimas de nat), por el redondeo del lote de verificacion.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue ni calidad por idioma.
- Benchmarks de calidad: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares; la evaluacion cualitativa y de tareas concretas queda pendiente.
- Vision: requiere descargar aparte el proyector `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` (600 MiB) del repositorio base; no se incluye en este paquete.
- Pesos ternarios: PQ2_0 (~1,72 bpw) y PTQ1_0 implican una perdida de precision frente a formatos de mayor bitwidth; no hay datos en la informacion disponible sobre el impacto en calidad de cada tipo de cuantizacion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; es un modelo de generacion de texto y no se documentan mecanismos de mitigacion especificos.
- Licencia: Apache-2.0, tanto para el modelo base como para la cabeza Qwen3.8-27B, segun el autor, lo que en principio permite uso comercial; conviene verificar los terminos del modelo upstream de Qwen de forma independiente.
- Fecha de creacion declarada en HuggingFace: 2026-10-09; ultima actualizacion 2026-10-09. No se indica historial de versiones.
- Presupuesto de memoria incompleto: aunque los pesos ocupan 6,40-7,66 GB, no se aporta el consumo total en inferencia con contexto de 262K tokens.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ManniX-ITA/Ternary-Bonsai-2-27B-MTP-GGUF
- Modelo base (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo upstream de la cabeza MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del motor opencoti: https://github.com/mann1x/opencoti
- Script de empaquetado `bonsai2-mtp-bundle.py`: no disponible como enlace directo en la informacion proporcionada (forma parte de opencoti)
- Exportacion de la cabeza (`convert_hf_to_gguf.py --mtp --outtype q8_0`): no disponible como enlace directo (llama.cpp upstream)
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
