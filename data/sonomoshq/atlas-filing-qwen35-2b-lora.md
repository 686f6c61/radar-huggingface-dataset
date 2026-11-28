# sonomoshq/atlas-filing-qwen35-2b-lora

## Resumen

ATLAS Filing — Qwen3.5-2B LoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario sonomoshq que especializa el modelo base Qwen/Qwen3.5-2B para la extracción estructurada de metadatos de clasificación documental en formato JSON según el esquema ATLAS. El adaptador produce campos como tipo de documento, fecha y rol de definición, partes intervinientes, fragmentos de evidencia, descripción y una marca `needs_review` para revisión humana. No es un modelo completo: se distribuye como pesos PEFT que deben cargarse sobre el modelo base.

La relevancia del proyecto es acotada y experimental. Se trata de un adaptador de muy pequeño tamaño (unos 42 MB en safetensors, repositorio de 0,1 GB) entrenado con un conjunto sintético de 600 ejemplos de chat durante 120 pasos en CPU, con un calentamiento previo sobre el adaptador `btbtyler09/shrew-2b` en su variante `doc_processing`. El propio autor advierte explícitamente que no ha sido evaluado con InternBench ni con documentos reales filtrados y que no debe desplegarse en producción.

Por tanto, esta ficha debe leerse como documentación de un artefacto de investigación reproducible, útil para quien quiera experimentar con extracción estructurada sobre Qwen3.5-2B o reutilizar el pipeline de datos sintéticos, no como una solución lista para entornos reales de gestión documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-2B; r=16, alpha=32 |
| Parametros totales | No disponible (adaptador de ~42 MB; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende de la carga del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT); copias opcionales en chunks base64 bajo `weights/chunks/` |

## Arquitectura y entrenamiento

El adaptador se construye en dos fases de ajuste sobre el modelo Qwen3.5-2B congelado. Primero se apila sobre el adaptador `btbtyler09/shrew-2b` en su tarea `doc_processing` (warm start), y después se entrena un LoRA propio con rango 16 y alpha 32 sobre ese estado. El entrenamiento consistió en 120 pasos en CPU con 600 ejemplos de chat sintéticos, generados a partir del dataset `sonomoshq/atlas-filing-synthetic-v1`. No se menciona uso de RLHF, DPO ni datos humanos reales.

La innovación técnica es modesta y de naturaleza práctica: el adaptador transforma la salida del modelo en un JSON con esquema fijo (tipo, fecha y rol de definición, partes, spans de evidencia, descripción y `needs_review`), lo que facilita su integración en pipelines de extracción estructurada. El autor documenta que los pesos principales están en la raíz del repositorio (`adapter_model.safetensors`, sha256 `b73c81620ed82ebe48eca00010318f2c94f9c5f619506c586a9e428da89e1377`) y que existen copias decodificadas en chunks base64 que no deben volver a decodificarse al concatenar. No se aportan detalles sobre la composición del dataset sintético ni sobre el preprocesado.

## Capacidades

- Generación de texto con salida estructurada en JSON según el esquema ATLAS de clasificación documental.
- Extracción de entidades: tipo de documento, fecha de definición, rol, partes intervinientes y fragmentos de evidencia.
- Generación de descripciones y marca de revisión (`needs_review`) para triaje humano.
- Formato de chat (entrenado con ejemplos de chat sintéticos).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado de extracción documental: cargar el adaptador sobre Qwen3.5-2B para generar JSON ATLAS a partir de texto de documentos sintéticos y validar el esquema antes de invertir en datos reales.
- Generación de datos de entrenamiento: usar el adaptador como etiquetador preliminar sobre corpus sintéticos para producir candidatos que luego se revisen manualmente.
- Investigación en adaptadores LoRA: estudiar el efecto del warm start sobre `shrew-2b` frente a un entrenamiento directo, con un coste de cómputo mínimo (120 pasos en CPU).
- Docencia y demostraciones: ejemplo reproducible de ajuste fino con PEFT y salida estructurada en un modelo de 2B que cabe en hardware modesto.
- Evaluación de pipelines de validación JSON: integrar el adaptador en un banco de pruebas que mida `json_ok` y `field_micro` sobre conjuntos sintéticos propios.
- Base para adaptadores especializados: reutilizar el esquema ATLAS y el dataset sintético como punto de partida para ajustar sobre dominios documentales concretos con datos anotados.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| train_loss | 0.184 |
| loss paso 5 → 120 | 1.875 → 0.049 |
| smoke json_ok (n=8 sintéticos) | 1.0 |
| smoke field_micro (n=8 sintéticos) | 1.0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluaciones sobre InternBench o documentos reales en la información disponible. Las métricas anteriores proceden de una ejecución local en CPU y de un conjunto de humo de solo 8 ejemplos sintéticos, por lo que no son extrapolables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador de ~42 MB sobre un modelo base de 2B, el requisito dominante es el del modelo base (aproximadamente 4-5 GB en fp16, menos con cuantización de 4 bits, aunque este dato no se confirma en la información).
- GPU recomendadas: no especificadas; el entrenamiento documentado se realizó en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs con 8 GB o más al cuantizar el modelo base, pero no se aporta confirmación.
- Opciones de despliegue: PEFT con Transformers; compatible potencialmente con vLLM, llama.cpp u Ollama tras fusionar o convertir el adaptador, aunque no se documenta en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ATLAS Filing — Qwen3.5-2B LoRA | Adaptador sobre 2B | No disponible | Apache 2.0 | Extracción JSON ATLAS |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | No disponible en la información | Generación de texto general |
| btbtyler09/shrew-2b (`doc_processing`) | 2B | No disponible | No disponible en la información | Procesamiento documental |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente: "Do not deploy to production". No ha sido evaluado con InternBench ni con documentos reales filtrados.
- Entrenado con solo 600 ejemplos sintéticos y 120 pasos en CPU; riesgo alto de sobreajuste al esquema y de baja generalización a documentos reales.
- Las métricas de humo (json_ok y field_micro = 1.0) se basan en 8 ejemplos sintéticos y no son representativas.
- Riesgo de alucinación en campos como partes, fechas o spans de evidencia al no haberse validado contra corpus reales.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Dependencia de dos artefactos: debe cargarse primero `btbtyler09/shrew-2b` (`doc_processing`) y después este adaptador como `atlas`; un uso incorrecto del orden produce resultados inválidos.
- Los chunks base64 en `weights/chunks/` no deben decodificarse de nuevo al concatenar; manipularlos mal corrompe los pesos.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero las condiciones del modelo base y del adaptador previo deben verificarse por separado.
- Sin información sobre sesgos, contexto máximo efectivo ni latencia en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/sonomoshq/atlas-filing-qwen35-2b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Adaptador previo (warm start): https://huggingface.co/btbtyler09/shrew-2b
- Dataset sintético: https://huggingface.co/datasets/sonomoshq/atlas-filing-synthetic-v1
