# SixVolts/Swift-1.5-Qwen3.8-27B-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-GGUF es una cuantización en formato GGUF del modelo Swift 1.5 Qwen3.8-27B, desarrollado por UkisAI como continuación de Swift 1.0, que a su vez es un fine-tune de Qwen3.8-27B (Alibaba Cloud, Apache 2.0). La cuantización la publica SixVolts y está específicamente optimizada para ejecutarse en una única GPU AMD Radeon PRO V620 de 32 GB (arquitectura Navi 21, gfx1030), una tarjeta de centro de datos con precios reducidos en el mercado de segunda mano.

El paquete incluye tres ficheros: el modelo principal en Q4_K_XL (16,2 GiB), un drafter DFlash2 de z-lab cuantizado a Q4_0 (1,3 GiB) y un drafter de predicción multi-token (MTP) de Unsloth (1,0 GiB). Los drafters implementan decodificación especulativa, lo que permite duplicar aproximadamente la velocidad de decodificación (de unos 24 t/s a 40-76 t/s según tarea y profundidad de contexto) sin alterar la distribución de salida del modelo.

La relevancia de esta ficha radica en que documenta un caso práctico de despliegue de un modelo de 26.896 millones de parámetros con contexto de 64k tokens en hardware AMD consumer/entusiasta, con recetas de cuantización reproducibles, mediciones de rendimiento detalladas y una licencia comercial con umbral de facturación de un millón de dólares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B, con cabeza MTP en el modelo base, omitida en este GGUF) |
| Parámetros totales | 26.895.998.464 (26,9 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 64k tokens (configurado en llama-server con `-c 65536`; el modelo base soporta al menos 128k según las mediciones de prefill a esa profundidad) |
| Tipos de cuantización | Q4_K_XL (receta per-tensor de Unsloth UD-Q4_K_XL adaptada, con tensores IQ sustituidos por Q4_K), embeddings Q4_K, capa de salida Q6_K; drafters en Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License 1.0 (uso personal, investigación, educativo y evaluación gratuito; uso comercial por individuos y organizaciones con facturación anual bruta hasta 1.000.000 USD; por encima requiere licencia empresarial de UkisAI). Componentes Apache 2.0 en los cuerpos de los drafters |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del fichero principal | 16,2 GiB |
| Tamaño del repositorio | 19,9 GB |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de Qwen3.8-27B (26,9 mil millones de parámetros), sobre el que UkisAI ha aplicado un fine-tune que da lugar a Swift 1.0 y su continuación Swift 1.5. El modelo base incorpora una cabeza de predicción multi-token (MTP) que Swift 1.5 no reentrenó: según la model card, los pesos `mtp.*` coinciden con los del modelo base hasta el redondeo de cuantización, lo que permite reutilizar el drafter MTP de Unsloth sin modificaciones.

La cuantización aplica la receta per-tensor UD-Q4_K_XL de Unsloth a los pesos BF16 de Swift 1.5, usando la importance matrix de Unsloth, con una modificación clave: los tensores que Unsloth almacena en formatos IQ se guardan como Q4_K porque los formatos IQ se descomprimen lentamente en gfx1030. Los embeddings de tokens van en Q4_K y la capa de salida en Q6_K. La capa MTP se excluye del fichero principal y se sirve aparte como drafter. La divergencia KL frente al Q8_0 propio de Swift 1.5 (wikitext-2 test, contexto de 512 tokens, 95 fragmentos) es de 0,0093 de media y 0,084 en el percentil 99, con un 95,94% de coincidencia en el token superior, frente a 0,0146 / 0,158 / 95,02% del Q4_K_M de Swift 1.5.

La innovación técnica principal del paquete es el vocabulario reducido de los drafters (d2t64k): en ambos se sustituye la cabeza de salida completa de 248k tokens por las 65.536 filas más probables de la proyección de salida de Swift (filas Q6_K copiadas sin cambios) más un mapa de esas filas a identificadores de token. Como la cabeza es la mayor parte del coste de un drafter, esto abarata varias veces el drafting; el conjunto conserva el 98,9% de la salida retenida del modelo, y los tokens fuera de él simplemente no pueden ser propuestos por el drafter. El drafter MTP requiere un fork de llama.cpp (sixvolts/llama-navi21-furnace) porque el vocabulario reducido y el parámetro `--spec-draft-temp` no están en upstream.

## Capacidades

- Generación de texto conversacional multi-turno, con ajustes de muestreo recomendados por el autor (temperatura 1.0, top-p 0.95, top-k 20, min-p 0).
- Razonamiento y tareas de matemáticas, código, listas y redacción de ensayos, según las categorías de medición de rendimiento de la model card.
- Resumen de textos largos: se han medido velocidades de decodificación con hasta 120k tokens en contexto sobre una tarea de resumen de texto largo.
- Decodificación especulativa con dos drafters alternativos (DFlash2 y MTP), que acelera la generación sin cambiar la distribución de salida del modelo.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con llama.cpp.
- Capacidades de tool calling, function calling, agentes o multilingüismo: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en una sola GPU: con 64k tokens de contexto y unos 24 t/s sin drafter (44-62 t/s con MTP en tareas de chat y código), el modelo puede mantener conversaciones largas en una Radeon PRO V620 de 32 GB, un coste de hardware muy inferior al de una A100 o H100.
- Resumen de documentos extensos: las mediciones a profundidad muestran decodificación estable hasta 120k tokens (17,4 t/s sin drafter, 44,1 t/s con MTP), lo que lo hace adecuado para resumir contratos, informes o expedientes que no caben en modelos de contexto corto.
- Generación de código en pipelines internos: las tareas de código alcanzan 54 t/s con ambos drafters en la V620, suficiente para autocompletado y generación de fragmentos en herramientas de desarrollo, siempre que el uso comercial cumpla el umbral de facturación de la licencia.
- Despliegue en infraestructura AMD de bajo coste: el paquete está construido y medido específicamente en gfx1030 con ROCm, con scripts de despliegue reproducibles, lo que facilita montar un servidor de inferencia con tarjetas V620 de segunda mano.
- Evaluación e investigación de decodificación especulativa: al incluir dos drafters con vocabulario reducido y comparativas de velocidad por profundidad de contexto, sirve como banco de pruebas para estudiar el equilibrio entre velocidad y profundidad en llama.cpp.
- Prototipado educativo y de investigación: la licencia permite uso gratuito en educación e investigación, y el modelo principal es un GGUF estándar que funciona en llama.cpp upstream sin necesidad del fork.
- Servicio de chat con endpoints compatibles: la etiqueta `endpoints_compatible` permite integrarlo en infraestructuras que esperan una API de tipo OpenAI a través de llama-server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye mediciones de cuantización y de velocidad en hardware concreto:

| Métrica | Este fichero (Q4_K_XL-noIQ) | Q4_K_M de Swift 1.5 |
|---|---|---|
| Tamaño | 16,24 GiB | 16,24 GiB |
| KLD media (wikitext-2) | 0,0093 | 0,0146 |
| KLD percentil 99 | 0,084 | 0,158 |
| Coincidencia token superior | 95,94% | 95,02% |

Velocidad de decodificación en una Radeon PRO V620 (llama-server, temperatura 1.0, top-p 0.95, top-k 20, `--spec-draft-temp 1.0`):

| Drafter | Chat de investigación | Matemáticas | Código | Listas | Ensayo |
|---|---|---|---|---|---|
| Ninguno | 24,3 t/s | ~24 t/s | ~24 t/s | ~24 t/s | ~24 t/s |
| MTP, 3 tokens | 44,2 t/s | 62 t/s | 54 t/s | 64 t/s | 43 t/s |
| DFlash2, hasta 7 | 42,3-43,5 t/s | 76 t/s | 54 t/s | 69 t/s | 40 t/s |

Velocidad a profundidad de contexto (tarea de resumen de texto largo):

| Profundidad | Sin drafter | MTP | DFlash2 |
|---|---|---|---|
| 4k | 24,1 t/s | 55,3 t/s | 50,0 t/s |
| 16k | 23,0 t/s | 53,0 t/s | 55,3 t/s |
| 40k | 21,4 t/s | 48,0 t/s | 41,6 t/s |
| 80k | 19,3 t/s | 47,2 t/s | 39,2 t/s |
| 120k | 17,4 t/s | 44,1 t/s | 32,0 t/s |

Prefill sin drafter: 492 t/s con contexto vacío, 416 t/s a 16k, 278 t/s a 64k y 172 t/s a 128k. Según el autor, DFlash2 es más rápido para trabajo mixto corto y MTP lo supera a partir de unos 30k tokens de contexto porque su coste no crece con la profundidad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,2 GiB para el modelo principal; añadir 1,0-1,3 GiB si se usa un drafter; el objetivo de diseño es caber en 32 GB con contexto de 64k.
- GPU recomendada: AMD Radeon PRO V620 (Navi 21, gfx1030), tarjeta para la que está construido y medida; requiere ROCm.
- GPU consumer: no hay datos sobre tarjetas consumer concretas; el modelo de 16,2 GiB cabe en GPUs con 24 GB o más (por ejemplo, RTX 3090/4090), pero las mediciones de velocidad solo están disponibles para la V620.
- Despliegue: llama-server de llama.cpp; para los drafters se necesita el fork sixvolts/llama-navi21-furnace (rama `main`), ya que el vocabulario reducido del drafter MTP y `--spec-draft-temp` no están en upstream. El modelo principal es un GGUF estándar.
- Latencia y throughput: 24,3 t/s sin drafter en chat; 44,2 t/s con MTP y 42,3-43,5 t/s con DFlash2; hasta 76 t/s en matemáticas con DFlash2; prefill de 492 t/s a contexto vacío y 172 t/s a 128k.
- Comando de referencia: `llama-server -m Swift-1.5-Qwen3.8-27B-Q4_K_XL-noIQ.gguf -ngl 99 -fa on -c 65536 -md dflash-Qwen3.8-27B-Q4_0-d2t64k-swift15xl.gguf -ngld 99 --spec-type draft-dflash --spec-draft-n-max 7 --spec-draft-temp 1.0 --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B (este GGUF) | 26,9 mil millones | 64k configurado (medido hasta 128k) | Q4_K_XL + drafters Q4_0 | Swift Open License 1.0 con umbral de 1 M USD | HuggingFace (SixVolts) |
| Swift-1.5-Qwen3.8-27B Q4_K_M | 26,9 mil millones | No disponible | Q4_K_M | Swift Open License 1.0 | HuggingFace (UkisAI) |
| Qwen3.8-27B | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace (Qwen) |
| Qwen3.8-27B-DFlash2-GGUF | No disponible | No disponible | GGUF | Apache 2.0 (cuerpo del drafter) | HuggingFace (z-lab) |

La comparación de calidad entre estos modelos no está disponible en la información proporcionada; solo se dispone de la comparación de divergencia KL entre las dos cuantizaciones de Swift 1.5 (ver sección de benchmarks).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de este tamaño.
- Idiomas soportados: no disponibles; no se puede confirmar el soporte multilingüe.
- Restricción de licencia comercial: el uso comercial solo es gratuito para individuos y organizaciones con facturación anual bruta de hasta 1.000.000 USD; por encima se requiere una licencia empresarial de UkisAI. Los tres ficheros (modelo y drafters) contienen pesos de Swift y están bajo la Swift Open License.
- Dependencia de un fork de llama.cpp: el drafter MTP y el parámetro `--spec-draft-temp` requieren el fork sixvolts/llama-navi21-furnace; con llama.cpp upstream solo funciona el modelo principal sin esas optimizaciones.
- Vocabulario reducido del drafter: los tokens fuera de las 65.536 filas retenidas no pueden ser propuestos por el drafter, lo que puede reducir la aceleración en dominios con vocabulario atípico.
- Rendimiento medido solo en gfx1030: las cifras de velocidad no son extrapolables a otras GPU sin medición propia; los formatos IQ se descartaron precisamente por su lentitud en esa arquitectura.
- Sin datos de benchmarks de calidad: no se puede evaluar el rendimiento en MMLU, HumanEval o GSM8K con la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/SixVolts/Swift-1.5-Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio de despliegue: https://github.com/sixvolts/llama-navi21-furnace/tree/main/deploy
- Fork de llama.cpp: https://github.com/sixvolts/llama-navi21-furnace
- Script de reconstrucción: https://github.com/sixvolts/llama-navi21-furnace/blob/main/deploy/scripts/make-models.sh
- Drafter DFlash2 de z-lab: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Drafter MTP de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Contacto de licencias UkisAI: https://ukisai.com/contact
