# PoochieMama/trellis2-cars-lora

## Resumen

TRELLIS.2-cars-lora es un adaptador LoRA de tipo PEFT publicado por el usuario PoochieMama sobre el modelo base `microsoft/TRELLIS.2-4B`, concretamente sobre el checkpoint `ss_flow_img_dit_1_3B_64_bf16` del pipeline de generación 3D a partir de imagen. El adaptador se ha entrenado con la herramienta `trellis2-train` sobre el dataset `PoochieMama/diecast-cars-trellis2-latents`, especializando el flujo de estructura dispersa (sparse-structure flow) en la generación de coches de colección (diecast).

El modelo base TRELLIS.2-4B es un sistema de image-to-3D de Microsoft basado en un transformer de difusión (DiT) que opera sobre representaciones latentes de estructura dispersa, con un submodelo de flujo de aproximadamente 1,3B de parámetros en el checkpoint adaptado. El LoRA ajusta únicamente las proyecciones de atención (`to_qkv`, `to_out`, `to_q`, `to_kv`) y las capas MLP del bloque DiT, con rango 8 y alpha 16.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card extendida ni resultados de evaluación. Su interés es principalmente como ejemplo de fine-tuning LoRA sobre el flujo latente de TRELLIS.2 para una categoría de objetos concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre DiT de flujo de estructura dispersa de TRELLIS.2 |
| Parámetros totales | no disponible (el submodelo base `ss_flow_img_dit_1_3B_64_bf16` tiene ~1,3B; el conjunto TRELLIS.2-4B declara 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el checkpoint base se distribuye en bf16) |
| Idiomas soportados | no disponibles (la tarea es image-to-3D, no lingüística) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`ss_lora/adapter-<step>.safetensors`) + `config.json` |
| Rango / alpha LoRA | 8 / 16 |
| Módulos objetivo | `to_qkv`, `to_out`, `to_q`, `to_kv`, `mlp.mlp.0`, `mlp.mlp.2` |
| Pasos de entrenamiento | 2000 (batch 4 x 4, lr 0.0001) |
| Checkpoints | cada 500 pasos |
| Modelo base | `microsoft/TRELLIS.2-4B` (checkpoint `ss_flow_img_dit_1_3B_64_bf16`) |
| Librería | peft |

## Arquitectura y entrenamiento

El adaptador se inyecta en el flujo de imagen del pipeline TRELLIS.2, que emplea un transformer de difusión (DiT) sobre latentes de estructura dispersa a resolución 64. El LoRA modifica las proyecciones de atención (query, key, value y salida) y dos capas MLP del bloque, sin tocar el resto de pesos del modelo base. El rango es 8 y el alpha 16, lo que da un factor de escala de 2 sobre las actualizaciones.

El entrenamiento se realizó con `trellis2-train` sobre el dataset `PoochieMama/diecast-cars-trellis2-latents`, que contiene latentes precalculados de coches diecast. Se ejecutaron 2000 pasos con batch efectivo 16 (4 x 4), tasa de aprendizaje 1e-4 y guardado de checkpoints cada 500 pasos. No se documenta en la información disponible si hubo aumento de datos, composición exacta del dataset, ni métricas de validación durante el entrenamiento.

## Capacidades

- Generación de mallas 3D de coches diecast a partir de una imagen de entrada, especializando el flujo de estructura dispersa del modelo base.
- Ajuste fino de la atención y MLP del DiT de imagen, lo que permite modificar el estilo y la distribución de formas generadas sin reentrenar el modelo completo.
- Compatible con el ecosistema PEFT: carga mediante `inject_adapter_in_model` y `set_peft_model_state_dict`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un adaptador puramente generativo 3D.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión general, audio).

## Casos de uso

- Prototipado de catálogos de coches diecast: generar variantes 3D de un modelo a partir de fotos de producto para previsualización en e-commerce, aprovechando la especialización del LoRA en esa categoría.
- Diseño iterativo de vehículos de colección: usar el adaptador para explorar formas y proporciones dentro del dominio de coches diecast antes de modelado manual en CAD.
- Generación de assets para videojuegos o simuladores: producir mallas de coches de escala reducida para escenas de coleccionismo o exposiciones virtuales.
- Aumento de datasets 3D: sintetizar coches diecast etiquetados para entrenar otros modelos de visión o de reconstrucción 3D.
- Investigación en fine-tuning de modelos generativos 3D: servir como referencia reproducible de cómo adaptar el flujo latente de TRELLIS.2 con LoRA de rango bajo.
- Pruebas de concepto de pipelines image-to-3D especializados: evaluar si un adaptador de nicho mejora la fidelidad en una categoría concreta frente al modelo base sin ajuste.
- Educación y demos: mostrar el flujo completo de entrenamiento e inferencia de un LoRA sobre un DiT 3D con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del checkpoint base `ss_flow_img_dit_1_3B_64_bf16` (~1,3B parámetros en bf16) más el resto del pipeline TRELLIS.2-4B.
- GPU recomendadas: no disponible; por el tamaño del submodelo adaptado, se requeriría al menos una GPU con memoria suficiente para el DiT en bf16, pero no se especifica.
- ¿Cabe en GPU consumer? No disponible; el adaptador LoRA en sí es pequeño (rango 8), pero el modelo base condiciona el requisito.
- Opciones de despliegue: carga vía PEFT (`inject_adapter_in_model` + `set_peft_model_state_dict`) sobre el pipeline TRELLIS.2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo 3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PoochieMama/trellis2-cars-lora | LoRA sobre TRELLIS.2 | ~1,3B (submodelo base) | no disponible | no disponible | Hugging Face, 0 descargas |
| microsoft/TRELLIS.2-4B | Image-to-3D (DiT) | 4B | no disponible | no disponible | Hugging Face (modelo base) |
| Otros LoRA de TRELLIS.2 | Adaptadores PEFT | variable | no disponible | variable | no disponibles en la información |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el LoRA está entrenado únicamente sobre coches diecast, por lo que su rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Sin métricas de evaluación: no hay benchmarks, validación ni comparación con el modelo base que permitan cuantificar la mejora.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia del modelo base `microsoft/TRELLIS.2-4B` y del dataset de entrenamiento.
- Riesgo de sobreajuste: 2000 pasos sobre un dataset de nicho con rango 8 puede producir colapso de diversidad en las formas generadas.
- Sin información sobre sesgos: no se documentan sesgos de forma, color o estilo en el dominio de coches.
- Reproducibilidad limitada: no se detalla la composición del dataset ni los hiperparámetros completos (semilla, scheduler, augmentations).
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en producción.
- Dependencia del pipeline TRELLIS.2: la carga requiere el código y las dependencias del modelo base, no es un checkpoint autónomo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/PoochieMama/trellis2-cars-lora
- Modelo base: https://huggingface.co/microsoft/TRELLIS.2-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/PoochieMama/diecast-cars-trellis2-latents
- Repositorio TRELLIS.2 (referencia del modelo base): no disponible en la información proporcionada
- Paper de TRELLIS.2: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
