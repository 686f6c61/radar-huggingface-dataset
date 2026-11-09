# guistmartin/qwen3.5-4b-lexglue-ledgar-lora

## Resumen

El modelo `guistmartin/qwen3.5-4b-lexglue-ledgar-lora` es un adaptador PEFT LoRA de clasificación de texto entrenado sobre el modelo base `Qwen/Qwen3.5-4B`. Lo desarrolla el usuario guistmartin para la organización Nest (nest.technology), usando la infraestructura Tinker, y su tarea concreta es clasificar cláusulas contractuales en 100 categorías del corpus LEDGAR, parte del benchmark legal LexGLUE. Resuelve un problema acotado pero relevante: la clasificación automática de disposiciones contractuales en dominios jurídicos, donde los modelos generalistas suelen rendir por debajo de un ajuste fino específico.

El adaptador se entrena sobre 9.800 ejemplos reales durante 2 épocas y 308 pasos de optimizador, con un total de 9.346.582 tokens de entrenamiento y rango LoRA nativo de 16. El repositorio ocupa 0,2 GB y contiene únicamente el adaptador convertido y metadatos de reproducibilidad, no los pesos completos del modelo base.

Es relevante porque demuestra que un ajuste LoRA de bajo coste sobre un modelo de 4B puede superar a un modelo frontera (GPT-5.6 Terra vía Codex) en una tarea de clasificación legal concreta, aunque el propio autor advierte que se trata de un subconjunto parcial del benchmark y que los resultados no establecen superioridad general. El pipeline declarado es `text-generation`, pero el uso real es clasificación mediante generación de etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre transformer decoder-only Qwen3.5-4B (rango LoRA 16) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador (heredada del base Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre `Qwen/Qwen3.5-4B`, un transformer decoder-only con atención estándar (no se documentan innovaciones de atención en la información disponible). El entrenamiento es supervisado, en una sola ronda (round1), con 2 épocas, 9.800 ejemplos reales, 0 sintéticos, batch size 64, semilla 42 y 308 pasos de optimizador. El dataset de entrenamiento es `coastalchp/ledgar`, con SHA-256 `9b6876339cf7f1eda7811caffffc9705e4fa9f3bf2fa924670dec8379a6b310c`. No se menciona RLHF ni DPO.

La innovación técnica destacable está en el formato de inferencia: el adaptador no se fusiona con el modelo base (`merge_and_unload` está explícitamente desaconsejado) porque el adaptador de la cabeza de salida debe permanecer separado de los embeddings de entrada atados. La inferencia requiere cargar el base con `AutoModelForImageTextToText`, adjuntar el adaptador con `PeftModel.from_pretrained`, usar el system prompt exacto de `inference_config.json`, `enable_thinking=False` y decodificación greedy con el límite de salida registrado. La conversión verificó equivalencia de proyecciones, tensores guardados, escalado de módulos PEFT y carga sobre una arquitectura base solo de metadatos, pero no se descargaron pesos completos ni se probó generación end-to-end en Hugging Face ni servicio con vLLM/SGLang.

## Capacidades

- Clasificación de cláusulas contractuales en 100 categorías LEDGAR mediante generación de la etiqueta.
- Generación de texto heredada del modelo base Qwen3.5-4B (pipeline declarado `text-generation`).
- Razonamiento y conocimiento general del modelo base, aunque el adaptador está especializado en la tarea legal.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés en este adaptador.
- Modo thinking: debe desactivarse explícitamente (`enable_thinking=False`) para la tarea de clasificación.
- Capacidades de visión: el base se carga con `AutoModelForImageTextToText`, pero no se documenta uso multimodal en el adaptador.

## Casos de uso

- Clasificación de contratos en despachos jurídicos: el adaptador asigna cada cláusula a una de las 100 categorías LEDGAR, lo que permite indexar y revisar contratos de forma automatizada con una precisión observada del 73,6% en el subconjunto de test preparado.
- Extracción de obligaciones y riesgos contractuales: al identificar la categoría de cada cláusula, los equipos legales pueden filtrar disposiciones de indemnización, terminación o confidencialidad para revisión prioritaria.
- Enriquecimiento de repositorios documentales (CLM): integrar el adaptador en un pipeline de gestión del ciclo de vida de contratos para etiquetar automáticamente cláusulas entrantes y alimentar metadatos estructurados.
- Evaluación comparativa de modelos legales: sirve como referencia de ajuste fino LoRA de bajo coste frente a modelos frontera en tareas de clasificación jurídica, útil para decidir arquitecturas en producción.
- Preprocesamiento para búsqueda semántica legal: etiquetar cláusulas antes de indexarlas permite filtros por categoría en motores de búsqueda interna de contratos.
- Investigación en NLP jurídico: reproducible con los hashes y manifiestos incluidos (`data_manifest.json`, `metrics.json`, `labels.json`), permite replicar el experimento sobre el subconjunto LEDGAR preparado.
- Moderación y cumplimiento contractual: detectar categorías de cláusulas sensibles en contratos de terceros para revisiones de cumplimiento normativo.

## Benchmarks y rendimiento

| Modelo | Validation accuracy | Validation macro F1 | Test accuracy | Test macro F1 |
|---|---:|---:|---:|---:|
| Qwen3.5-4B base | 61,60% | 57,35% | No evaluado | No evaluado |
| Qwen3.5-4B LoRA | **73,40%** | **70,50%** | **73,60%** | **71,72%** |
| GPT-5.6 Terra vía Codex | 61,20% | 57,57% | 66,90% | 63,99% |

Validación: 500 cláusulas. Test: 1.000 cláusulas. El macro F1 es la media sobre el conjunto fijo de 100 categorías, con cero para categorías sin F1 definido. La validación no tiene ejemplos de la categoría "Books", por lo que su macro F1 máximo es 99,00%. La comparación con GPT-5.6 Terra se hizo mediante paquetes ciegos vía Codex y no es una evaluación equivalente a API. Se repitieron 7 respuestas de test perdidas por fallos de conexión, una vez cada una, con los mismos ajustes. Los resultados son sobre subconjuntos preparados y no establecen superioridad general sobre un modelo frontera.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada (el adaptador ocupa 0,2 GB, pero requiere cargar el modelo base de 4B completo; en FP16 serían aproximadamente 8 GB, en cuantización de 4 bits alrededor de 3-4 GB, aunque estos valores no están confirmados por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño del base (4B) es plausible en GPUs de consumo con cuantización, pero no hay verificación documentada.
- Opciones de despliegue: Transformers con PEFT (`PeftModel.from_pretrained`) es el único método documentado. El autor indica que el servicio con vLLM/SGLang no se ha probado.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test accuracy (LEDGAR parcial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-lexglue-ledgar-lora | 4B base + LoRA r16 | No disponible | 73,60% | No disponible | Hugging Face (adaptador) |
| Qwen3.5-4B base | 4B | No disponible | No evaluado en test; 61,60% en validación | No disponible | Hugging Face |
| GPT-5.6 Terra vía Codex | No disponible | No disponible | 66,90% | Propietaria | API |

No se dispone de información sobre otros adaptadores LoRA comparables para LEDGAR en la documentación proporcionada.

## Limitaciones y advertencias

- El benchmark es un subconjunto parcial de LEDGAR, no el benchmark LexGLUE completo ni el test set íntegro de LEDGAR; los resultados no son extrapolables al benchmark completo.
- La comparación con GPT-5.6 Terra no es una evaluación equivalente a API (paquetes ciegos vía Codex), por lo que la ventaja observada no implica superioridad general.
- El adaptador no debe fusionarse con el base (`merge_and_unload` desaconsejado); hacerlo rompe la separación entre la cabeza de salida y los embeddings atados.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La licencia no está declarada; el autor indica explícitamente que el repositorio de origen no declara licencia de dataset y que esta publicación no la infiere del dataset LexGLUE upstream. El uso comercial queda sin clarificar.
- Riesgo de alucinación: al ser un modelo generativo usado para clasificar, puede producir etiquetas fuera del conjunto de 100 categorías si no se restringe la decodificación; `labels.json` contiene las etiquetas exactas.
- No se ha probado generación end-to-end en Hugging Face ni servicio con vLLM/SGLang; la conversión se validó solo sobre arquitectura base de metadatos, sin descargar pesos completos.
- La revisión interna de Tinker no fue verificada de forma independiente; la revisión del base en Hugging Face fija tokenizer, configuración y pesos de despliegue.
- Solo hay 500 ejemplos de validación y 1.000 de test; la categoría "Books" no tiene ejemplos en validación, lo que distorsiona el macro F1.
- El pipeline declarado es `text-generation`, no `text-classification`, lo que puede confundir a herramientas de despliegue automático.
- No se incluyen ejemplos crudos de entrenamiento, predicciones individuales ni credenciales; la reproducibilidad depende de los manifiestos y hashes incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guistmartin/qwen3.5-4b-lexglue-ledgar-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/coastalchp/ledgar
- Organización Nest: https://nest.technology
