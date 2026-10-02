# rawmodels/Qwen3.8-27B-antislop-semdiv-grpo-GGUF

## Resumen

Qwen3.8-27B-antislop-semdiv-grpo-GGUF es la conversion a formato GGUF de un checkpoint bf16 afinado mediante GRPO (Group Relative Policy Optimization) sobre una base Qwen3.8 de 27.320.697.856 parametros (27,3B). El autor, rawmodels, presenta el modelo como una pieza de investigacion de alineacion orientada a reducir el "slop" (salida generica y repetitiva) y a aumentar la diversidad semantica de las respuestas, no como un filtro de seguridad.

El repositorio incluye cuatro tiers de pesos de texto (Q4_K_M, Q5_K_M, Q6_K y Q8_0), un proyector multimodal F16 (mmproj) y la matriz de importancia (imatrix) empleada en la cuantizacion. Los pesos conservan la cabecera MTP (multi-token prediction) del Qwen3.8 original, injertada sobre el checkpoint afinado, lo que permite decodificacion especulativa con llama.cpp.

Su relevancia practica es doble: por un lado, ofrece una cuantizacion GGUF con perdida de fidelidad medida frente al bf16; por otro, demuestra una ganancia de throughput del 41% al activar la cabecera MTP en llama.cpp sobre una RTX PRO 6000 Blackwell (de 68,1 a 96,1 tokens/s de salida). El modelo esta etiquetado para ingles y ruso, y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Qwen3.8 con cabecera MTP (`qwen35.nextn_predict_layers=1`) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (los ejemplos de servicio usan `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (texto); F16 (proyector multimodal) |
| Idiomas soportados | Ingles (en), ruso (ru) |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint bf16 afinado con GRPO, una variante de aprendizaje por refuerzo que estima ventajas relativas dentro de un grupo de muestras para la misma peticion en lugar de usar un modelo critico separado. El objetivo declarado del entrenamiento es "antislop" y diversidad semantica ("semdiv"), es decir, penalizar la salida generica y fomentar respuestas mas variadas. El modelo es una pieza de investigacion de alineacion; la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de SFT o DPO.

La innovacion tecnica mas relevante en esta ficha es el injerto de la cabecera MTP original de Qwen3.8 sobre el checkpoint afinado. El conversor preserva `qwen35.nextn_predict_layers=1` y los tensores `blk.64.nextn.*`. Es importante senalar que esa cabecera MTP **no fue entrenada durante el GRPO**, por lo que su comportamiento es el heredado de la base. La cuantizacion se realizo con una matriz de importancia (imatrix) propia del autor.

## Capacidades

- Generacion de texto conversacional (el tag `conversational` esta presente en el repositorio).
- Inferencia multimodal cuando se sirve con el proyector `mmproj-...-F16.gguf` incluido; el modo texto puro omite `--mmproj`.
- Decodificacion especulativa mediante la cabecera MTP integrada (`--spec-type draft-mtp`), con aceptacion de borradores del 46,1% en la medicion publicada.
- Afinado orientado a reducir salida generica y aumentar diversidad semantica de las respuestas.
- Soporte multilingue limitado a ingles y ruso segun las etiquetas del repositorio.
- No se documentan capacidades explicitas de tool calling, function calling, agentes o modo de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- Investigacion en alineacion y RLHF/GRPO: el modelo sirve como checkpoint de estudio para comparar el efecto de GRPO sobre diversidad semantica frente a la base bf16, usando la tabla de fidelidad del propio repositorio para aislar el ruido de cuantizacion.
- Despliegue local de un modelo de 27B en una sola GPU consumer de gama alta o profesional: con Q4_K_M (~16-17 GB estimados) cabe en tarjetas de 24 GB, permitiendo asistencia conversacional en local.
- Servicio de texto en ingles y ruso: util para equipos que necesitan cobertura bilingue sin depender de APIs externas, con pesos GGUF listos para llama.cpp.
- Inferencia multimodal ligera: con el proyector F16 y `--mmproj` activo, permite tareas de descripcion de imagen o pregunta-respuesta visual sobre un stack autocontenido.
- Optimizacion de throughput en produccion: activar la decodificacion especulativa con MTP aporta, segun el autor, un 41% mas de tokens/s de salida en escenarios de contexto corto y flujo unico, lo que reduce coste por token en servicios de generacion.
- Evaluacion de robustez frente a detectores de texto generado: la model card menciona mediciones con Pangram v3, lo que hace del modelo un candidato para estudios de detectabilidad de salida.
- Prototipado rapido con cuantizaciones intercambiables: los cuatro tiers permiten ajustar el equilibrio entre calidad (Q8_0) y huella de memoria (Q4_K_M) segun la GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente publica una tabla de fidelidad de cuantizacion frente al checkpoint bf16, medida con teacher forcing sobre respuestas reservadas:

| Tier | KL media | Mismo token top-1 |
|---|---:|---:|
| Q4_K_M | 0,01712 | 95,03% |
| Q5_K_M | 0,00764 | 96,53% |
| Q6_K | 0,00281 | 98,02% |
| Q8_0 | 0,00207 | 98,79% |

Adicionalmente, la model card cita una comparacion con el detector Pangram v3 (24 preguntas reservadas, cuatro muestras puntuadas por pregunta) que situa a Q4_K_M en +0,04 ± 0,21 logit frente al bf16. El autor advierte que la API y el producto web de Pangram usan versiones distintas del detector y que sus puntuaciones no deben mezclarse. Las mediciones del detector para los tiers nuevos estaban en curso en el momento de publicar la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir de 27,3B parametros y bits por peso tipicos; no la publica el autor): Q4_K_M ~16-17 GB, Q5_K_M ~19-20 GB, Q6_K ~22-23 GB, Q8_0 ~29-30 GB. Hay que sumar KV cache y, en multimodal, el proyector F16.
- El autor reporta pruebas en una RTX PRO 6000 Blackwell con `-ngl 99`. No se documentan pruebas en otras GPU.
- Encaje en GPU consumer: Q4_K_M y Q5_K_M son candidatos razonables para tarjetas de 24 GB (RTX 3090, 4090, 5090); Q6_K queda al limite y Q8_0 requiere 32 GB o mas.
- Opciones de despliegue: llama.cpp / `llama-server` es el soporte principal y el unico con MTP especulativo documentado. El formato GGUF es compatible con Ollama y otros runners basados en llama.cpp; el soporte en vLLM u otros motores no se menciona.
- Latencia y throughput (medicion del autor, llama.cpp commit `feb9a3d`, una RTX PRO 6000 Blackwell, 12 peticiones greedy reservadas, limite de 192 tokens de salida): Q4_K_M alcanza 68,1 tokens/s de salida sin MTP y 96,1 tokens/s con MTP (+41%). El ratio de aceptacion de borradores fue de 1.095 de 2.374 tokens propuestos (46,1%). Son resultados de contexto corto y flujo unico.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar el modelo con alternativas de la misma categoria. La unica comparacion soportada por la informacion disponible es la de cada tier GGUF con su propio checkpoint bf16 (tabla de fidelidad anterior). No se dispone de cifras de rendimiento frente a otros modelos de ~27B ni de la licencia de esta publicacion para valorar su disponibilidad comercial relativa.

| Alternativa | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (rawmodels Qwen3.8-27B antislop) | 27,3B | No disponible | No disponible | GGUF, llama.cpp |
| Checkpoint padre bf16 (rawmodels/...-semdiv-grpo) | 27,3B | No disponible | No disponible | bf16 |
| Otros modelos ~27B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El propio autor declara que es un modelo de investigacion de alineacion y **no un filtro de seguridad**; no debe tratarse como barrera de contenido.
- La cabecera MTP se injerto desde Qwen3.8 y **no fue entrenada durante el GRPO**, por lo que su comportamiento especulativo no esta optimizado para esta afinacion.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial. Cualquier despliegue en produccion deberia aclarar antes los terminos.
- Idiomas soportados limitados a ingles y ruso segun las etiquetas; el rendimiento en castellano u otras lenguas no esta documentado.
- No se han publicado evaluaciones de sesgo, alucinacion ni seguridad; no hay datos para estimar la tasa de fabricacion de datos.
- Las mediciones de detectores de texto (Pangram) estaban en curso y no son definitivas; el autor advierte de que no deben mezclarse puntuaciones de API y web.
- Los resultados de throughput corresponden a contexto corto (limite de 192 tokens) y flujo unico sobre un hardware concreto; no son extrapolables a cargas con batching o contextos largos.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente de su comportamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-semdiv-grpo-GGUF
- Checkpoint base bf16: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-semdiv-grpo
