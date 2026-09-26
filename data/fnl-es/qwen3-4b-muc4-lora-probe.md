# fnl-es/qwen3-4b-muc4-lora-probe

## Resumen

`fnl-es/qwen3-4b-muc4-lora-probe` es un adaptador LoRA (r=16, alpha=16) entrenado sobre el modelo `Qwen/Qwen3-4B-Instruct-2507` para una tarea muy concreta: extracción de eventos a nivel de documento sobre el corpus MUC-4. Dado un documento de noticia y el *system prompt* del dataset, el modelo debe responder con los eventos del documento en forma de array JSON, devolviendo `[]` cuando no hay ninguno. Lo publica el usuario `fnl-es` dentro del proyecto `fine-tuning-decoder`.

Se trata de un checkpoint experimental (el propio nombre lo etiqueta como *probe*): el entrenamiento se hizo con pérdida *completion-only* sobre solo 192 documentos del dataset `fnl-es/muc4-chat`, durante 1 época, con la configuración `configs/qwen3-4b-probe-b2.yaml`. No es un adaptador fusionado: se distribuye únicamente el adaptador y hay que cargarlo sobre el modelo base con `peft`.

Su relevancia es acotada pero clara: sirve como prueba de concepto reproducible de ajuste fino eficiente (LoRA sobre un modelo de 4B) para una tarea clásica de PLN estructurado, con salida JSON lista para consumir por programas. El repositorio es pequeño (0,4 GB), no tiene descargas ni *likes*, y la model card no declara licencia ni idiomas, por lo que su uso en producción exigiría verificar esos extremos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=16) sobre un transformer denso `Qwen/Qwen3-4B-Instruct-2507` |
| Parametros totales | Modelo base: 4B (segun su denominacion). Adaptador LoRA: no disponible (repo de 0,4 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; heredada del modelo base (Qwen3-4B-Instruct-2507 declara 262.144 tokens nativos) |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar; las cuantizaciones dependen del modelo base (no disponibles en la informacion proporcionada) |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen3 es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria `peft` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 16 aplicado sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer denso de 4B parámetros de la familia Qwen3 en su variante *Instruct-2507*. No se modifica ni se fusiona el modelo base: la model card indica explícitamente que el adaptador "only, never merged", de modo que la inferencia requiere cargarlo con `peft` sobre el modelo original. La tarea es de extracción de eventos a nivel de documento y la salida esperada es un array JSON de eventos, con `[]` cuando el documento no contiene ninguno.

El entrenamiento usó pérdida *completion-only* (se calcula la pérdida solo sobre la respuesta, no sobre el prompt) sobre 192 documentos del dataset `fnl-es/muc4-chat`, durante 1 época, con la configuración `configs/qwen3-4b-probe-b2.yaml` del proyecto `fine-tuning-decoder`. No se documentan en la información disponible ni la composición completa del dataset, ni el número de tokens de entrenamiento, ni si hubo fases de RLHF/DPO, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Extracción de eventos a nivel de documento sobre el esquema de MUC-4, devolviendo un array JSON.
- Respuesta negativa explícita: devuelve `[]` cuando el documento no contiene eventos.
- Seguimiento de un *system prompt* específico del dataset (`fnl-es/muc4-chat`) que define el formato y el esquema de la respuesta.
- Generación en formato JSON estructurado, apta para *parsing* automático.
- Capacidades generales heredadas del modelo base Qwen3-4B-Instruct-2507 (generación de texto, instrucciones, multilingüismo), aunque el ajuste LoRA está orientado a la tarea de extracción.
- Soporte de *tool calling* / *function calling*: no documentado para este adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades especiales (modo *thinking*, visión, audio): no documentadas.

## Casos de uso

- Monitorización de medios y análisis de sucesos: procesar lotes de noticias y obtener un array JSON de eventos por documento, listo para indexar en una base de datos. El modelo está entrenado exactamente para esa conversión documento → JSON.
- Codificación de eventos para investigación en ciencias sociales: alimentar un *corpus* histórico de noticias y generar variables de evento comparables, reduciendo el trabajo de codificación manual.
- Pre-anotación para equipos de anotación humana: usar el adaptador como primer paso de etiquetado y revisar después las salidas, aprovechando que devuelve `[]` de forma explícita cuando no hay eventos.
- Alerta temprana y OSINT: integrar el adaptador en un *pipeline* que vigile *feeds* de noticias y marque documentos con eventos relevantes para revisión humana.
- Enriquecimiento de grafos de conocimiento: extraer eventos estructurados y enlazarlos con entidades para construir relaciones temporales y causales entre sucesos.
- Periodismo de datos: extraer de forma sistemática los eventos descritos en un archivo documental y agregarlos para obtener series temporales o mapas de incidencia.
- Verificación de hechos y análisis de cobertura: comparar los eventos extraídos de distintos medios para detectar discrepancias en la descripción de un mismo suceso.
- Procesamiento por lotes de bajo coste: al ser un adaptador sobre un modelo de 4B, se puede ejecutar en una sola GPU de gama media o incluso en CPU con cuantización, lo que permite reprocesar *corpus* grandes sin presupuesto de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente enlaza la ejecución de entrenamiento en Weights & Biases (run `wk6ypti0`), pero no incluye métricas de evaluación (precisión, *recall* o F1 sobre plantillas MUC-4) ni comparaciones con otros sistemas.

## Requisitos de hardware

- El adaptador en sí es pequeño (repo de 0,4 GB) y no añade requisitos apreciables; el coste real lo determina el modelo base de 4B.
- VRAM estimada para el modelo base (valores orientativos según cuantización, no publicados en la model card): aproximadamente 8-9 GB en fp16/bf16, 5-6 GB en int8 y 2,5-3,5 GB en cuantizaciones de 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para fp16; para 4 bits basta con 4-6 GB, lo que incluye RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs de datacenter (A100, H100) si se busca mayor *throughput*.
- Cabe en GPU de consumo con cuantización de 4 bits; en fp16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` (el método indicado en la model card), vLLM con soporte de adaptadores LoRA, TGI, y `llama.cpp`/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y *throughput* estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA públicos comparables para extracción de eventos en MUC-4 en la información proporcionada. La comparación más directa posible es con el propio modelo base:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fnl-es/qwen3-4b-muc4-lora-probe` | 4B (base) + LoRA r=16 | Heredado del base | Extracción de eventos MUC-4 con salida JSON | no disponible | 0 descargas, 0 *likes* |
| `Qwen/Qwen3-4B-Instruct-2507` (base, sin adaptador) | 4B | 262.144 tokens nativos (segun el modelo base) | LLM generalista de instrucciones | Apache-2.0 (segun el modelo base) | Modelo publico ampliamente utilizado |
| Otros adaptadores o modelos de extraccion de eventos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un *probe*: 192 documentos, 1 época y rango LoRA 16. No hay evidencia publicada de que generalice fuera de ese conjunto.
- No se han publicado métricas de evaluación, por lo que no se puede estimar su precisión real en extracción de eventos.
- La licencia no está declarada en la model card; antes de un uso comercial hay que verificar los términos del autor y los del modelo base.
- Los idiomas soportados no están declarados. El dataset y la tarea (MUC-4) apuntan a un dominio concreto de noticias; el comportamiento fuera de ese dominio es desconocido.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir eventos o argumentos que no aparecen en el documento; la salida JSON no garantiza fidelidad factual.
- Riesgo de sesgo: el adaptador se ha entrenado sobre 192 documentos de un único dataset, que puede sobrerrepresentar ciertos tipos de evento, regiones o actores. No se documenta ningún análisis de sesgo.
- Dependencia estricta del *system prompt* de `fnl-es/muc4-chat`: cambiar el formato del prompt puede degradar o romper la salida JSON.
- La salida puede no ser JSON válido en todos los casos; conviene validar con un *parser* tolerante y prever reintentos.
- El adaptador no está fusionado: hay que cargarlo con `peft` sobre el modelo base, lo que añade complejidad al despliegue y al uso con *runtimes* que no soporten LoRA dinámico.
- El repositorio tiene 0 descargas y 0 *likes* y fue actualizado pocos minutos después de su creación, lo que sugiere que no ha pasado por una validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fnl-es/qwen3-4b-muc4-lora-probe
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/fnl-es/muc4-chat
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/flowing/muc4-event-extraction/runs/wk6ypti0
- Proyecto `fine-tuning-decoder` (configuración `configs/qwen3-4b-probe-b2.yaml`): mencionado en la model card, enlace no disponible.
