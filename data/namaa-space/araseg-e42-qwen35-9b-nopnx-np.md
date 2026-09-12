# NAMAA-Space/araseg-e42-qwen35-9b-nopnx-np

## Resumen

`NAMAA-Space/araseg-e42-qwen35-9b-nopnx-np` es un miembro del sistema **NoPnx-NP** presentado por NAMAA Community a la tarea compartida de segmentación del árabe **AraSeg 2026** (ArabicNLP 2026). No es un segmentador autónomo: se trata de un votante dentro de un decodificador estructural tipo MEMM ajustado sobre predicciones *out-of-fold* (OOF) y compuesto por siete miembros. Cada miembro emite probabilidades de frontera por palabra sin calibrar, que posteriormente se combinan con pesos y umbrales almacenados en el sistema completo (`NAMAA-Space/araseg-2026`, umbral de sistema 0,34).

El modelo parte de `Qwen/Qwen3.5-9B` y se especializa mediante LoRA (r=16, alpha=32, entrenamiento en bf16) para una tarea de etiquetado a nivel de palabra (subtokenización/segmentación), con salida de tipo `token-classification` y foco exclusivo en árabe. Su relevancia es acotada y muy específica: sirve como componente reproducible de un sistema de segmentación con 86,49 de macro-F1 en el *practice test* y 87,0 en el conjunto ciego, no como modelo de propósito general.

Es importante subrayar que el repositorio no contiene un checkpoint en formato HuggingFace, sino un `state_dict` de PyTorch (`best_*.pt`). `from_pretrained` no funciona: hay que reconstruir la arquitectura a partir del YAML de configuración del experimento y del modelo base antes de cargar los pesos. El repositorio ocupa 0,1 GB, coherente con almacenar únicamente los adaptadores y no el modelo base de 9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-9B) con adaptadores LoRA (r=16, alpha=32) para clasificación de tokens |
| Parametros totales | Modelo base de aproximadamente 9.000 millones de parámetros (según denominación `Qwen/Qwen3.5-9B`) más adaptadores LoRA; cifra exacta no disponible |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el entrenamiento declarado es en bf16 y los pesos se distribuyen como `state_dict` de PyTorch |
| Idiomas soportados | Árabe (ar) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | `state_dict` de PyTorch (`best_*.pt`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es el modelo `Qwen/Qwen3.5-9B`, un transformer decoder de aproximadamente 9.000 millones de parámetros, sobre el que se aplica un ajuste fino de bajo rango (LoRA) con rango 16 y alpha 32 en precisión bf16. La cabeza de salida se reformula como clasificación de tokens para producir probabilidades de frontera por palabra, que es la señal que consume el decodificador estructural posterior. No se detalla en la información disponible la composición del corpus de entrenamiento, el número de tokens vistos, ni si hubo etapas de RLHF o DPO; tampoco se especifican innovaciones de atención o decodificación propias.

El elemento metodológico diferencial no está en el modelo individual, sino en el sistema: el decodificador MEMM se ajusta sobre predicciones *out-of-fold* de siete miembros y aplica un umbral de sistema de 0,34. Este miembro es el componente LLM de dicho decodificador. Existen además otros cinco miembros LoRA que requieren `transformers==5.12.1` para instanciar sus clases base, según indica la model card. La carga de pesos exige reconstruir primero la arquitectura desde el YAML del experimento y el modelo base, algo que se documenta en `ensemble.py` y `verify_offcluster.py` del repositorio de código.

## Capacidades

- Segmentación de texto árabe a nivel de palabra: emite probabilidades de frontera por palabra, sin calibrar.
- Etiquetado de tokens (`token-classification`) restringido a la subtarea NoPnx-NP.
- Participación como votante en un ensemble: aporta una señal que el decodificador MEMM pondera junto a la de otros seis miembros.
- Generación de representaciones internas del árabe aprovechando el preentrenamiento multilingüe del modelo base, reutilizadas para la tarea de segmentación.
- No soporta, según la información disponible: tool calling, function calling, uso como agente, razonamiento multi-paso autónomo, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el modelo está declarado únicamente para árabe.
- Producción de puntuaciones probabilísticas sin calibración: usadas de forma aislada no reproducen ninguna puntuación publicada.

## Casos de uso

- Preprocesamiento morfológico en pipelines de NLP árabe: las probabilidades de frontera por palabra pueden alimentar etapas posteriores de lematización, análisis morfológico o tokenización consistente antes de un modelo aguas abajo.
- Reproducción de resultados de la shared task: investigadores que necesiten replicar la puntuación de NoPnx-NP en AraSeg 2026 pueden cargar este miembro junto con los seis restantes y el combinador del sistema `NAMAA-Space/araseg-2026`.
- Estudio de ensembles heterogéneos: sirve como caso concreto de decodificador MEMM ajustado con predicciones OOF sobre siete miembros, útil para investigar métodos de combinación y calibración.
- Ajuste fino de adaptadores LoRA sobre LLM para tareas de etiquetado: el par r=16/alpha=32 en bf16 constituye una referencia reproducible de configuración para tareas de secuencia en árabe.
- Evaluación comparativa de vocales individuales de un comité: permite medir la contribución marginal de un miembro LLM frente a componentes no-LLM dentro del mismo decodificador.
- Experimentación académica en segmentación del árabe: punto de partida para variantes que sustituyan el modelo base o modifiquen el umbral de decisión (0,34 en el sistema de referencia).
- Docencia y prácticas de NLP árabe: ilustra el flujo completo desde un LLM preentrenado hasta un segmentador a nivel de palabra, incluyendo las particularidades de cargar un `state_dict` en lugar de un checkpoint estándar.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al sistema completo, no a este miembro de forma aislada. La model card advierte explícitamente de que el uso individual no reproduce ninguna puntuación publicada.

| Sistema evaluado | Subtarea | Macro-F1 (practice test) | Macro-F1 (blind) |
|---|---|---|---|
| NoPnx-NP (sistema completo, 7 miembros + MEMM) | NoPnx-NP | 86,49 | 87,0 |
| `araseg-e42-qwen35-9b-nopnx-np` (este miembro, aislado) | NoPnx-NP | no reproducible | no reproducible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, lo que indica que solo se almacenan los pesos LoRA (r=16 sobre un base de 9B) y no el modelo completo.
- Para la inferencia hay que instanciar además `Qwen/Qwen3.5-9B`. Estimación orientativa para 9.000 millones de parámetros: aproximadamente 18 GB de VRAM en bf16, unos 9 GB en 8 bits y 5-6 GB en 4 bits. Son estimaciones derivadas del tamaño, no cifras publicadas por el autor.
- GPU recomendadas: A100 40 GB o H100 para servicio en bf16 con margen para el contexto; RTX 4090 (24 GB) para bf16 justo o 8 bits con holgura; RTX 3090, 4080 o 4070 Ti para 8 bits; GPUs de 8-12 GB únicamente con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, con cuantización (8 bits en 16-24 GB, 4 bits en 8-12 GB), siempre que se reconstruya correctamente la arquitectura.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama no son aplicables directamente, porque el artefacto no es un checkpoint en formato HuggingFace. El despliegue requiere cargar el `state_dict` con PyTorch siguiendo el código del repositorio (`ensemble.py`), con `transformers==5.12.1` en la pila fijada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `araseg-e42-qwen35-9b-nopnx-np` (este modelo) | Miembro de ensemble con LoRA sobre LLM | ~9B base + LoRA r=16 | no disponible | No reproducible de forma aislada | apache-2.0 | Peso `state_dict` en HuggingFace |
| Sistema `NAMAA-Space/araseg-2026` | Ensemble completo (7 miembros + MEMM) | Agrega varios modelos | no disponible | 86,49 / 87,0 | no disponible | Colección en HuggingFace |
| Otros miembros del ensemble NoPnx-NP | Miembros individuales del decodificador | no disponible | no disponible | no disponible | no disponible | Colección en HuggingFace |
| `Qwen/Qwen3.5-9B` (modelo base) | LLM de propósito general | ~9B | no disponible | No aplica (no es un segmentador) | no disponible | HuggingFace |

No se dispone de datos de otros segmentadores del árabe (por ejemplo, aproximaciones basadas en BERT árabe) en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con ellos.

## Limitaciones y advertencias

- No es un segmentador autónomo: es un votante dentro de un ensemble. Usado solo no reproduce ninguna puntuación publicada.
- Emite probabilidades de frontera sin calibrar; requieren los pesos y umbrales del combinador (umbral de sistema 0,34) para convertirse en decisiones.
- `from_pretrained` no funciona: el archivo es un `state_dict` desnudo y la arquitectura debe reconstruirse desde el YAML del experimento y el modelo base.
- Dependencia estricta de versiones: los miembros LoRA requieren `transformers==5.12.1`; la pila completa está fijada en `requirements-llm.txt`.
- Idioma único (árabe) y dominio restringido a la subtarea NoPnx-NP de AraSeg 2026.
- Sin datos publicados sobre sesgos, tasas de alucinación o comportamiento fuera de dominio.
- Licencia apache-2.0 heredada del modelo base, lo que en principio permite uso comercial, pero el autor no documenta condiciones adicionales ni garantías sobre los pesos derivados del ajuste LoRA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción ni mantenimiento continuado.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo; los enlaces obtenidos correspondían a un hotel en Kioto y no guardan relación con esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e42-qwen35-9b-nopnx-np
- Colección del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de código, configuraciones y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026 (BibTeX incluido en la model card; sin URL disponible)
- No se han encontrado otros enlaces relevantes en la búsqueda web.
