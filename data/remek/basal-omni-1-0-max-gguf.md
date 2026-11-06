# Remek/basal-omni-1.0-max-GGUF

## Resumen

basal-omni-1.0-max-GGUF es la distribucion cuantizada en formato GGUF del modelo basal-omni-1.0-max, un modelo de 12B parametros construido sobre Gemma 4 12B y orientado especificamente a la toma de decisiones tipadas (typed decisions), clasificacion y calibracion de probabilidades. Lo desarrolla Remek y se distribuye bajo licencia Apache 2.0. No es un modelo conversacional generico: su proposito es responder a preguntas de eleccion entre opciones (hasta 255) devolviendo probabilidades calibradas sobre cada opcion, lo que permite umbrales de confianza certificados.

Esta version GGUF incluye unicamente el decodificador de texto; los encoders de imagen y audio del modelo bf16 original no estan presentes. Se publican dos cuantizaciones, Q8_0 (12,7 GB) y Q6_K (9,8 GB), que superan la puerta de portabilidad (port gate) definida por el autor frente al modelo bf16 en terminos de acuerdo, precision y error de calibracion esperado (ECE). Las cuantizaciones Q5_K_M y Q4_K_M no superaron dicha puerta y no se distribuyen.

El modelo es relevante para quienes necesitan integrar decisiones automaticas con garantias estadisticas en pipelines de produccion, ejecutables en GPU NVIDIA, Apple Silicon (Metal) o CPU mediante llama.cpp y Ollama. Su API de decision tipada se sirve a traves de `basal-serve`, no mediante generacion de texto libre. El modelo es experimental y su soporte linguistico declarado se limita a polaco e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 12B), adaptado como capa de decision |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens con el motor basal (8.192 tokens probados en Mac de 24 GB); Ollama limitado a 4.096 tokens por prompt |
| Tipos de cuantizacion | Q8_0 (12,7 GB) y Q6_K (9,8 GB); F16 (23,8 GB) generado pero no distribuido |
| Idiomas soportados | pl (polaco), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tokenizer y `chat_template.jinja` incluidos; `CALIBRATION.gguf.json` y `CALIBRATION.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 12B, un transformer decoder-only, sobre el que el autor construye una capa de decision tipada: el servidor basal renderiza su propio prompt y lee las probabilidades de los codigos de opcion en lugar de generar texto libre. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo bf16 original.

La innovacion principal no reside en la arquitectura sino en el procedimiento de calibracion y portabilidad. La conversion se realizo con `convert_hf_to_gguf.py` de llama.cpp b11312 sobre el modelo bf16 (solo el decodificador de texto), generando F16 y Q8_0, y `llama-quantize` para Q6_K sin importance matrix. La conversion en Linux (CUDA) y macOS produce ficheros identicos byte a byte. El fichero `CALIBRATION.gguf.json` se ajusta sobre las lecturas Q8_0 del port con temperaturas por tipo y por bucket, y umbrales certificados para errores del 1% y del 5%. Q6_K se sirve con el mismo fichero de calibracion.

## Capacidades

- Decision tipada entre 2 y 255 opciones, devolviendo probabilidades calibradas por opcion.
- Tipos de consulta soportados: `choice`, `noul`, `score`, `multi`, `act`, `tool` y tipos de tarea adicionales.
- Clasificacion con calibracion certificada y umbrales de error controlados (1% y 5%).
- Automatizacion selectiva: con el fichero de calibracion incluido, al 1% de error objetivo se decide automaticamente el 47,9% de las decisiones (error observado 0,5%); al 5%, el 82,5% (error observado 4,0%).
- Soporte de tool calling a traves del tipo `tool`.
- Capacidades multilingues limitadas a polaco e ingles.
- Solo texto: sin vision ni audio en los ficheros GGUF.
- No es un modelo de generacion de texto libre en su uso previsto; un `ollama run` directo solo produce texto plano.

## Casos de uso

- Enrutamiento de decisiones en produccion: el modelo puede elegir entre un conjunto acotado de acciones o categorias (hasta 255 opciones) con probabilidades calibradas, permitiendo derivar automaticamente los casos de alta confianza y escalar los dudosos a revision humana.
- Moderacion y clasificacion de contenido en polaco e ingles: con umbrales certificados al 1% o 5% de error, se puede automatizar la mayoria de las clasificaciones y reservar la revision manual para la cola de baja confianza.
- Tool calling en agentes: el tipo `tool` permite seleccionar la funcion adecuada entre un catalogo definido, con la ventaja de que la probabilidad asociada es calibrada y puede usarse para decidir si invocar o no una herramienta.
- Triage de tickets de soporte: clasificacion multiopcion de incidencias por categoria y prioridad, con la garantia de que el porcentaje de decisiones automaticas tiene un error acotado medido sobre un conjunto de calibracion.
- Puntuacion (`score`) de respuestas o candidatos: util para rankear alternativas generadas por otro modelo o para evaluar salidas en pipelines de evaluacion automatica.
- Despliegue en infraestructura limitada: al caber en un Mac de 32 GB (Q8_0) o de 24 GB (Q6_K con contexto de 8.192 tokens), permite ejecutar la capa de decision en local sin GPU dedicada, manteniendo la API tipada mediante `basal-serve`.
- Decisiones sensibles a la calibracion en dominio financiero o legal: cuando se requiere conocer la incertidumbre de cada decision, el ECE negativo medido (-0,0006 en Q8_0, -0,0046 en Q6_K) indica que las probabilidades del port GGUF no estan sobreconfiadas frente al modelo bf16.

## Benchmarks y rendimiento

Los datos publicados miden el acuerdo del port GGUF frente al modelo bf16 sobre el conjunto de desarrollo dev v2 (10.606 decisiones), con una RTX PRO 6000 de 96 GB y `--mode gguf`. La puerta de portabilidad exige acuerdo >= 0,9552 en 2-10 opciones, >= 0,9893 donde el margen bf16 es >= 0,2, precision dentro de 1 punto y ECE como maximo +0,01.

| Fichero | Tamano | Acuerdo (2-10 opciones) | Con margen >= 0,2 | Precision | ECE | Decisiones/s (16 en vuelo) | Puerta |
|---|---|---|---|---|---|---|---|
| Q8_0 (recomendado) | 12,7 GB | 0,9868 | 0,9983 | -0,07 pt | -0,0006 | 8,9 | PASS |
| Q6_K (menor) | 9,8 GB | 0,9761 | 0,9947 | -0,11 pt | -0,0046 | 7,5 | PASS |
| F16 (referencia, no distribuido) | 23,8 GB | 0,9930 | 0,9995 | no disponible | no disponible | no disponible | no aplica |

En Metal (Apple M4 Pro, 600 decisiones, contexto de 8.192 tokens), Q8_0 obtiene un acuerdo de 0,9950 (1,0000 con margen >= 0,2), con precision sin cambios y ECE de +0,013 en 400 items de 2 a 10 opciones, frente a +0,001 en la ejecucion CUDA sobre los mismos items; el rendimiento es de 0,4 decisiones/s en proceso. Los resultados de benchmarks del modelo base (Werdykt v1 0,823 y los conjuntos en polaco e ingles) estan publicados en la model card de basal-omni-1.0-max; estos ficheros GGUF no se puntuan por separado en ellos.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 12,7 GB de pesos mas overhead de contexto; Q6_K, aproximadamente 9,8 GB mas overhead.
- GPU recomendadas: RTX PRO 6000 96 GB (medida de referencia del autor); cualquier GPU NVIDIA con al menos 16 GB para Q8_0 con contexto largo.
- Apple Silicon: Q8_0 con contexto de 16.384 tokens no cabe en un Mac de 24 GB (se ejecuto con 8.192 tokens); se recomienda un Mac de 32 GB o el fichero Q6_K.
- CPU: viable mediante llama.cpp, aunque con latencia mayor; no se publican cifras de throughput en CPU.
- Despliegue: `basal-serve` con `--mode gguf` (llama-cpp-python 0.3.36 o superior, motor basal 2.2.0 o superior con extra `gguf`), `--mode ollama` (Ollama 0.35 o superior) o `--mode llamacpp`.
- Throughput medido en CUDA: 8,9 decisiones/s con Q8_0 y 7,5 con Q6_K, con 16 peticiones en vuelo.
- Limitacion de Ollama: maximo 20 opciones por pregunta (devuelve como maximo 20 log-probabilidades) y 4.096 tokens por prompt; para documentos largos y hasta 255 opciones debe usarse `--mode gguf`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| basal-omni-1.0-max-GGUF | 11,9B | 16.384 tokens (motor basal) | Decision tipada calibrada | Apache 2.0 | GGUF |
| Gemma 4 12B (base) | 12B | no disponible | Generacion de texto general | no disponible | safetensors |
| basal-omni-1.0-max (bf16) | 11,9B | no disponible | Decision tipada con vision y audio | Apache 2.0 | bf16 |

La informacion disponible no incluye comparaciones con otros modelos de decision calibrada de la misma categoria; los unicos terminos de comparacion documentados son el modelo bf16 original y la referencia F16 del port. No se dispone de datos de benchmarks frente a alternativas de terceros.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor; no debe asumirse estabilidad de API ni de calibracion entre versiones.
- Solo texto en esta distribucion: los encoders de imagen y audio del modelo bf16 no estan incluidos.
- Idiomas limitados a polaco e ingles; el rendimiento en castellano no esta documentado.
- La calibracion incluida esta ajustada para un unico orden de opciones (el predeterminado); cambiar el orden de las opciones invalida los umbrales certificados.
- `CALIBRATION.json` (del modelo bf16) es el valor por defecto en `--mode ollama` y `--mode llamacpp` hasta que existan ajustes propios para esos modos; puede no reflejar la calibracion real del port en esos modos.
- En Ollama, el limite de 20 opciones y 4.096 tokens restringe los casos de uso de documentos largos y catalogos amplios.
- Riesgo de alucinacion inherente al modelo base; en el uso previsto (eleccion entre opciones) el riesgo se manifiesta como seleccion erronea, mitigado pero no eliminado por los umbrales de calibracion.
- No se han publicado datos sobre sesgos del modelo en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el caracter experimental y la ausencia de garantias de calibracion fuera de los conjuntos medidos desaconsejan su uso en produccion sin validacion sobre datos propios mediante `basal-calibrate`.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-max-GGUF
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-max
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Documentacion GGUF del motor: docs/GGUF.md en el repositorio de GitHub
