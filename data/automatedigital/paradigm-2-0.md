# automatedigital/Paradigm-2.0

## Resumen

Paradigm 2.0 es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3B) orientado a generación de código y flujos agénticos, publicado por Automate Digital como un artefacto experimental en formato GGUF. Se construye sobre la arquitectura Qwen3.8-27B de Alibaba Cloud y sobre el ajuste fino intermedio Swift 1.5 de UkisAI, al que se le ha incorporado un adaptador LoRA propio mediante un merge sobre la cuantización Q4_K_M existente. Su relevancia radica en que se distribuye como un único fichero GGUF autónomo, sin necesidad de descargar por separado el modelo base ni el adaptador.

El modelo se presenta como un lanzamiento de evaluación local, no como un checkpoint de producción. El proceso de entrenamiento fue deliberadamente corto: QLoRA con rango 8 y alpha 8, 128 actualizaciones del optimizador a longitud de secuencia máxima de 4096, sobre un corpus filtrado de 750 ventanas de entrenamiento y 85 de desarrollo. El merge se realizó sobre una cuantización Q4_K_M y los tensores adaptados se recuantizaron a sus tipos originales, lo que puede atenuar o borrar parte de las actualizaciones aprendidas.

La propuesta de valor es la de un modelo de código agéntico de tamano medio que cabe en una sola GPU de consumo (se probó en una RTX 3090) con contexto de servidor configurado a 131.072 tokens y soporte de tool calling nativo en llama.cpp. La licencia es Swift Open License v1.0, con condición de uso comercial ligada a un umbral de facturación, y las porciones heredadas de Qwen conservan Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8, arquitectura `qwen35` en llama.cpp); incluye cabeza MTP nativa para decodificación especulativa |
| Parametros totales | 27.320.697.856 (aprox. 27,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens en la configuración de servidor probada por el autor (no se garantiza en todos los runtimes) |
| Tipos de cuantizacion | Q4_K_M (única distribución publicada); el adaptador original se generó en F16 GGUF antes del merge |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (porciones Qwen bajo Apache 2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.8, con tokenizador y arquitectura originales de Alibaba Cloud. El modelo incorpora una cabeza MTP (multi-token prediction) nativa que permite decodificación especulativa en llama.cpp mediante `--spec-type draft-mtp --spec-draft-n-max 2`. Sobre esta base, UkisAI produjo Swift 1.5, y Automate Digital aplicó un ajuste fino agéntico con QLoRA (rango 8, alpha 8) durante 128 actualizaciones del optimizador con longitud de secuencia máxima de 4096, seleccionando la actualización 128. El corpus filtrado contiene 750 ventanas de acción de entrenamiento y 85 de desarrollo, divididas por repositorio; el autor aclara explícitamente que no son 750 trayectorias agénticas completas. El entrenamiento completo llevó aproximadamente 20,3 minutos en una RTX 3090.

El empaquetado final no es un merge de safetensors en BF16 ni un checkpoint de Transformers, sino un merge del adaptador F16 GGUF sobre el GGUF Q4_K_M de Swift, seguido de una recuantización de los tensores adaptados a sus tipos originales. Los tensores no tocados, incluida la cabeza MTP, se verificaron byte a byte contra la cuantización de entrada. El autor advierte que la recuantización puede alterar o borrar actualizaciones pequenas, y que el adaptador PEFT canónico permanece disponible por separado para reconstrucciones de mayor precisión. Los datos de entrenamiento provienen de NVIDIA Open-SWE-Traces (CC BY 4.0). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional y asistencia de código en el contexto de un modelo de 27B.
- Tool calling / function calling: validado con comprobaciones de llamada automática y forzada durante el proceso de publicación.
- Flujos agénticos de múltiples pasos: el ajuste fino se orientó a ventanas de acción agéntica sobre trazas de repositorios.
- Decodificación especulativa nativa mediante la cabeza MTP en builds compatibles de llama.cpp.
- Compatibilidad con endpoints OpenAI (`/v1`) para integración en clientes como Pi u OpenCode.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio o modo thinking explícito: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación local de modelos de código agénticos: descarga de un único GGUF Q4_K_M y arranque con `llama-server` para probar tool calling y generación de parches sobre una RTX 3090, sin gestionar base y adaptador por separado.
- Asistente de programación en IDE o CLI: integración vía endpoint compatible con OpenAI (`model ID: paradigm-2.0`) en herramientas como OpenCode o Pi, aprovechando el contexto de 131.072 tokens para incluir varios ficheros del repositorio en la ventana.
- Automatización de tareas de mantenimiento de repositorios: el ajuste sobre ventanas de acción de Open-SWE-Traces lo hace adecuado para experimentar con flujos de edición multi-paso, con revisión humana obligatoria de los cambios generados.
- Banquito de pruebas de decodificación especulativa: la cabeza MTP nativa permite medir latencia y throughput con `--spec-type draft-mtp` frente a decodificación estándar en el mismo hardware.
- Despliegue en estación de trabajo única con GPU de consumo: al ser un GGUF Q4_K_M de 17,4 GB de repositorio, encaja en configuraciones de 24 GB de VRAM para evaluación, no para servicio en producción sin validación adicional.
- Investigación sobre merges de adaptadores en cuantizaciones: el paquete documenta hashes SHA256 de entrada, verificación byte a byte de tensores no tocados y procedencia, lo que lo convierte en un caso de estudio reproducible de merge y recuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo mergeado no ha completado la suite completa de evaluación de código agéntico y que no deben transferirse a este artefacto las puntuaciones del par base más adaptador. La evidencia de validación se limita a carga nativa, comprobaciones de tool calling automático y forzado, y un piloto de decodificación nativa de cuatro bloques en una GPU0; la corrección y el rendimiento amplios quedan por medir.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa aproximadamente 17,4 GB (tamano del repo), por lo que se necesita holgura por encima de esa cifra para caché KV y buffers.
- GPU probada por el autor: una única RTX 3090 (24 GB) para las pruebas de runtime nativo y el entrenamiento QLoRA.
- GPU recomendadas: RTX 3090 o superior para el contexto probado; con contexto de 131.072 tokens y caché KV en q8_0/q8_0, la VRAM disponible determina el contexto utilizable. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como la RTX 3090, con margen limitado según contexto y batch.
- Opciones de despliegue: llama.cpp (`llama-server`) con un build que soporte la arquitectura `qwen35`; el build probado es el commit `50569eb87df530daff11afda229ceb9ab8e6cae8`. No se mencionan vLLM, TGI ni Ollama.
- Parámetros de servidor probados: `--ctx-size 131072 --parallel 1 --n-gpu-layers 999 --flash-attn on --cache-type-k q8_0 --cache-type-v q8_0 --batch-size 2048 --ubatch-size 512 --temp 1.0 --top-p 0.95 --top-k 20 --jinja`.
- Latencia y throughput: no disponibles; el autor indica que el rendimiento de la decodificación especulativa queda por medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Paradigm 2.0 | 27,3B | 131.072 (config. probada) | GGUF Q4_K_M | Swift Open License v1.0 + Apache 2.0 parcial | Merge experimental, sin suite completa de evaluación |
| Swift 1.5 (ukisai/Swift-1.5-Qwen3.8-27b) | 27B (aprox.) | no disponible | no disponible | Swift Open License v1.0 | Base inmediata de Paradigm 2.0; conserva el ajuste original sin el merge recuantizado |
| Qwen3.8-27B (Qwen/Qwen3.8-27B) | 27B (aprox.) | no disponible | no disponible | Apache 2.0 | Modelo upstream de Alibaba Cloud; arquitectura y tokenizador originales |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- El modelo mergeado no ha completado la suite completa de evaluación de código agéntico; no deben atribuirsele las puntuaciones del adaptador original ni asumir una mejora general de capacidades.
- El ajuste fino fue muy corto (128 actualizaciones, 750 ventanas de entrenamiento) y el propio autor advierte de posible regresión en razonamiento, uso de herramientas o capacidad general.
- La recuantización tras el merge puede alterar o borrar actualizaciones pequenas aprendidas; para mayor precisión debe usarse el adaptador PEFT canónico por separado.
- No es un checkpoint de Transformers en safetensors ni un merge BF16; solo se distribuye GGUF Q4_K_M.
- La licencia Swift Open License v1.0 incluye una condición de uso comercial ligada a un umbral de 1.000.000 USD de facturación bruta anual; no es una release solo Apache 2.0. Deben revisarse `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` antes de usar o redistribuir.
- La atribución del dataset no relicencia el código subyacente de los repositorios utilizados en el entrenamiento.
- El contexto de 131.072 tokens es la configuración de servidor probada, no una garantía de que cualquier runtime o carga de trabajo quepa sin cambios; la VRAM disponible condiciona el contexto real.
- Requiere un build de llama.cpp que soporte la arquitectura `qwen35`; los nombres de flags pueden variar entre versiones.
- No debe anadirse `--lora` al usar este modelo autónomo.
- Si se expone públicamente el endpoint, deben aplicarse controles de red y autenticación.
- Sesgos conocidos y comportamiento multilingüe: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; el autor recomienda pruebas independientes y revisión de los cambios generados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/automatedigital/Paradigm-2.0
- Adaptador original: https://huggingface.co/automatedigital/engine-swift-1.5-27b-agentic-lora
- Base inmediata (Swift 1.5): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b (revisión `b4c84d42903a8646b25857eb2827288d92ed85a4`)
- Modelo upstream (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Build de llama.cpp probado: commit `50569eb87df530daff11afda229ceb9ab8e6cae8`
- Dataset de entrenamiento: NVIDIA Open-SWE-Traces (CC BY 4.0), atribuciones en `DATA_ATTRIBUTION.json`
- Documentación de evaluación del autor: directorio `evaluation/` del repositorio del modelo
- Licencias: `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` en el repositorio del modelo
