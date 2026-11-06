# automatedigital/engine-swift-1.5-27b-agentic-lora

## Resumen

Engine Swift Agentic 27B LoRA es un adaptador QLoRA experimental publicado por Automate Digital sobre el modelo base `ukisai/Swift-1.5-Qwen3.8-27b`. No es un modelo autónomo: el repositorio contiene únicamente los pesos del adaptador PEFT (58,4 millones de parámetros, 0,4 GB) y una versión GGUF del mismo adaptador (`adapter-f16.gguf`). El objetivo declarado es mejorar el comportamiento en tareas de codificación agéntica (uso de herramientas, reparación de ficheros, routers asíncronos) mediante SFT sobre ventanas de turnos.

El entrenamiento se realizó sobre el dataset NVIDIA Open-SWE-Traces, filtrado por éxito, licencia, secretos y solapamiento, con normalización de herramientas. Se ejecutaron 128 actualizaciones de optimizador a longitud máxima de secuencia 4096, seleccionando el checkpoint de la actualización 128. El autor advierte explícitamente de que la mejora general en codificación «no ha sido establecida» y que la pérdida en validación no equivale a calidad en codificación agéntica.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental con escasa validación (cuatro tareas sintéticas ejecutadas en dos clientes), sin benchmarks estándar publicados y con una licencia upstream poco clara (`swift-open-license-1.0`, con revisión de linaje pendiente según el propio autor). Es útil como ejemplo de flujo QLoRA sobre trazas SWE, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer del modelo base `ukisai/Swift-1.5-Qwen3.8-27b`; arquitectura del base no disponible |
| Parámetros totales | 58.363.904 (solo adaptador) |
| Parámetros activos | no disponible |
| Longitud de contexto | 4096 durante entrenamiento; contexto del modelo base no disponible |
| Tipos de cuantización | Adaptador en safetensors (FP16/BF16 según PEFT) y GGUF `adapter-f16.gguf` para el quant coincidente del base |
| Idiomas soportados | no disponible |
| Licencia | `swift-open-license-1.0` (etiquetada como `other`); restricciones de ingresos aplicables a derivados según el autor |
| Formato de pesos | safetensors + GGUF (adaptador); no incluye modelo fusionado |

## Arquitectura y entrenamiento

El artefacto es un adaptador QLoRA para PEFT que debe cargarse sobre el modelo base exacto `ukisai/Swift-1.5-Qwen3.8-27b` en la revisión `b4c84d42903a8646b25857eb2827288d92ed85a4`. El entrenamiento se realizó en modo «turn-windows»: SFT sobre formato de acción aplicado a ventanas de mensajes transformadas explícitamente, no sobre trayectorias completas. Esto implica que el estado previo de la tarea puede estar omitido en cada ventana y que no se infiere una etiqueta de éxito global por ventana. Los índices de mensajes fuente, la política de sistema omitida y los esquemas de herramientas retenidos se documentan en el manifiesto de datos.

Los datos provienen de NVIDIA Open-SWE-Traces (revisión `4fa4c2ae9afc6b397bc50391d43450c79993c138`, licencia CC BY 4.0), modificado mediante filtrado por éxito, licencia, secretos y solapamiento, más normalización de herramientas. El split es disjunto por repositorio. Se ejecutaron 128 actualizaciones de optimizador con longitud máxima 4096; el checkpoint seleccionado es la actualización 128. No se documenta uso de RLHF ni DPO, ni innovaciones como decodificación especulativa propia (el autor señala que las cabezas especulativas nativas del base pueden requerir validación separada tras el fine-tuning). Una interrupción en la serialización de metadatos obligó a una recuperación preservando evidencia para la evaluación y recarga finales, sin reentrenamiento.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Swift-1.5-Qwen3.8-27b (capacidades del base no detalladas en la información disponible).
- Codificación agéntica: el adaptador está entrenado para emitir acciones en formato de herramienta sobre ventanas de conversación con esquemas de tools normalizados.
- Tool calling / function calling: soportado por el formato de entrenamiento; se validó una sonda de herramienta autenticada y una comprobación de ruta y escala del LoRA nativo.
- Reparación de ficheros estructurados (por ejemplo, JSONL) y tareas de intervalos, según la evaluación preliminar.
- Soporte de clientes agénticos Pi (1.4.0) y OpenCode (1.19.5) en la evaluación del autor.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Reparación automatizada de ficheros JSONL en pipelines de datos: el adaptador fue entrenado con ventanas de acciones sobre trazas SWE y en la pantalla preliminar resolvió la tarea `jsonl-repair` en ambos clientes (Pi y OpenCode), lo que lo hace candidato para tareas de saneamiento de registros estructurados dentro de un agente.
- Enrutado de peticiones en aplicaciones JavaScript: la tarea `js-router` pasó con el adaptador en OpenCode en 179,1 s, mientras el base agotó el límite de 240 s pese a tener un parche correcto; útil en escenarios donde la latencia de finalización importa.
- Experimentación académica con QLoRA sobre trazas SWE: sirve como referencia reproducible de un flujo de SFT por ventanas de turnos con manifiesto de datos, split disjunto por repositorio y evidencia de recuperación.
- Evaluación comparativa de adaptadores en clientes agénticos: el repositorio incluye resultados por cliente y tarea que permiten replicar la pantalla sobre el base y sobre perfiles alternativos (Qwopus).
- Prototipado de asistentes de codificación con protocolo de herramientas: al conservar los esquemas de tools normalizados, puede integrarse en un agente que ya hable el protocolo del base Swift.
- Pruebas de infraestructura de despliegue LoRA: el autor distingue explícitamente entre un smoke test de un paso y una mejora real, lo que lo hace útil para validar rutas de carga PEFT y conversión GGUF antes de entrenamientos mayores.

## Benchmarks y rendimiento

El autor publica una pantalla preliminar nativa sobre la revisión de tarea 2.4, con un intento por tarea y cliente, razonamiento medio, misma GPU0 validada y runtime llama.cpp original. Son cuatro tareas sintéticas pequeñas ejecutadas a través de dos clientes, no ocho repositorios independientes.

| Cliente | Tarea | Swift base | Tiempo base (s) | Adaptador | Tiempo adaptador (s) |
|---|---|---|---:|---|---:|
| pi | intervals | pass | 33,8 | pass | 39,7 |
| pi | jsonl-repair | pass | 47,0 | pass | 51,0 |
| pi | js-work-pool | pass | 90,8 | pass | 145,5 |
| pi | js-router | pass | 106,1 | pass | 83,7 |
| opencode | intervals | pass | 69,1 | pass | 72,4 |
| opencode | jsonl-repair | pass | 89,1 | pass | 84,5 |
| opencode | js-work-pool | fail | 177,0 | fail | 179,7 |
| opencode | js-router | fail | 240,1 | pass | 179,1 |

Recuento global de la pantalla: base Swift 6/8, adaptador 7/8, perfil Qwopus probado 5/8. El autor advierte de que una sonda de latencia se solapó con una tarea JSONL del adaptador, por lo que ese tiempo de pared está confundido, y que no se reclama ninguna ganancia general de latencia o throughput. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (0,4 GB en disco, 58,4 M de parámetros); el coste real lo determina el modelo base Swift-1.5-Qwen3.8-27b, cuyos requisitos no están disponibles en la información proporcionada.
- GPU recomendadas: no disponibles para el base; la evaluación del autor se ejecutó en una «GPU0 validada» sin especificar modelo.
- Viabilidad en GPU de consumo: no disponible; depende del quant del base utilizado con `adapter-f16.gguf`.
- Despliegue: PEFT puede cargar el adaptador directamente desde la raíz del repositorio sin subcarpeta `adapter/`; existe un adaptador GGUF para el quant coincidente del base, lo que permite su uso con llama.cpp. El autor cita llama.cpp como runtime de la evaluación; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: solo los tiempos de pared de la tabla anterior, con la advertencia de confusión en una medición; no se publican cifras de tokens por segundo ni de aceptación de MTP.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Pantalla nativa (8 ejecuciones) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Engine Swift Agentic 27B LoRA (este) | Adaptador QLoRA | 58,4 M (adaptador) | 4096 (entrenamiento) | 7/8 | `swift-open-license-1.0` | Hugging Face, safetensors + GGUF |
| Swift-1.5-Qwen3.8-27b (base) | Modelo completo | no disponible | no disponible | 6/8 | `swift-open-license-1.0` | Hugging Face |
| Perfil Qwopus (referencia del autor) | no disponible | no disponible | no disponible | 5/8 | no disponible | no disponible |

La comparación se limita a la pantalla sintética del propio autor; no hay benchmarks estándar que permitan situar estos artefactos frente a modelos de codificación de propósito general.

## Limitaciones y advertencias

- El autor declara explícitamente que la mejora general en codificación «no ha sido establecida»; la pantalla de 7/8 frente a 6/8 son cuatro tareas sintéticas en dos clientes, no ocho repositorios independientes.
- El entrenamiento es SFT por ventanas de turnos, no por trayectorias completas: el estado previo de la tarea puede faltar y no se infiere éxito global por ventana.
- El conjunto de datos filtrado es pequeño; puede degradar capacidad general, razonamiento o fiabilidad de herramientas.
- Las cabezas especulativas o drafters nativos del base pueden requerir validación separada tras el fine-tuning.
- La licencia upstream `swift-open-license-1.0` está pendiente de revisión de linaje según el propio autor; si solo se incluyó texto Apache por ausencia del LICENSE upstream, ese texto no prueba la concesión. Las restricciones de ingresos de Swift, cuando apliquen, siguen afectando a los derivados.
- Obligación de conservar la atribución a NVIDIA Open-SWE-Traces (CC BY 4.0) y los avisos de licencia de los repositorios fuente al distribuir.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base.
- Idiomas soportados no disponibles; no se debe asumir cobertura multilingüe.
- No se incluye modelo fusionado; el adaptador debe cargarse sobre la revisión exacta del base indicada o los resultados no son válidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/automatedigital/engine-swift-1.5-27b-agentic-lora
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/b4c84d42903a8646b25857eb2827288d92ed85a4/LICENSE
- Dataset NVIDIA Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
