# shabieh2/1026_tags_tree_full_2_epoch

## Resumen

`shabieh2/1026_tags_tree_full_2_epoch` es un adaptador LoRA publicado en Hugging Face por el usuario shabieh2, entrenado sobre el modelo base `unsloth/Muse-Glimmer-30B` mediante la librería Unsloth y empaquetado en formato PEFT. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que debe combinarse con el modelo base para poder ejecutarse. El repositorio ocupa 1,7 GB y se distribuye en formato safetensors.

La relevancia del artefacto es limitada y muy específica: se trata de un ajuste experimental de un modelo de 30 000 millones de parámetros, con 82 descargas y ninguna valoración en el momento de la consulta, y con una model card que es la plantilla por defecto de Hugging Face sin cumplimentar. No hay información pública sobre el dataset de entrenamiento, los hiperparámetros, los idiomas objetivo ni la licencia.

El nombre del repositorio sugiere un ajuste orientado a la generación o clasificación de etiquetas jerárquicas ("tags tree") durante dos épocas, pero esta interpretación no está confirmada por el autor. Cualquier evaluación de capacidades debe hacerse, por tanto, contra el modelo base y verificarse empíricamente antes de considerar su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | no disponible (el base se denomina "30B"; el adaptador ocupa 1,7 GB en safetensors) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el base, al ser de 30B, admite tecnicamente cuantizaciones de 4 y 8 bits, pero no se documentan en el repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base `unsloth/Muse-Glimmer-30B` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado con Unsloth sobre `unsloth/Muse-Glimmer-30B`. La librería declarada es PEFT 0.20.0 y la pipeline es `text-generation` con etiquetas `conversational`. El tamaño del repositorio (1,7 GB) es coherente con un adaptador de rango moderado sobre un modelo de 30B, aunque no se publican ni el rango, ni el alpha, ni los módulos objetivo del ajuste.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni técnicas adicionales (decodificación especulativa, atención lineal, etc.). La model card es la plantilla genérica de Hugging Face con todos los campos marcados como "[More Information Needed]", incluido el régimen de precisión (fp16, bf16, fp8) y el hardware empleado. El nombre del repo apunta a dos épocas de entrenamiento sobre un conjunto de datos relacionado con etiquetas en árbol, pero es una inferencia no verificada.

## Capacidades

- Generación de texto conversacional, heredada del modelo base, condicionada al ajuste LoRA.
- Ajuste específico (presuntamente) para tareas de etiquetado jerárquico o "tags tree", según el nombre del repositorio; no confirmado por el autor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Al ser un adaptador, todas las capacidades efectivas dependen del modelo base `unsloth/Muse-Glimmer-30B`, cuyas características no se detallan en este repositorio.

## Casos de uso

- Etiquetado automático de contenidos: el adaptador podría emplearse para asignar etiquetas estructuradas en árbol a documentos, si el ajuste se confirma; requiere validación contra el base sin adaptador para medir la mejora real.
- Clasificación taxonómica en pipelines de datos: integrado con el base en un servicio de inferencia, podría generar rutas de categorías para catálogos, artículos o tickets, siempre que se evalúe la precisión en el dominio concreto.
- Experimentación académica con LoRA: sirve como ejemplo reproducible de ajuste con Unsloth sobre un modelo de 30B, útil para estudiar el efecto de dos épocas frente a tres (existe una variante `3_epoch` del mismo autor).
- Prototipado rápido de asistentes conversacionales especializados: combinado con el base, permite probar un comportamiento conversacional ajustado sin reentrenar el modelo completo.
- Comparación de checkpoints: al existir variantes de 2 y 3 épocas, permite analizar el sobreajuste o la degradación en tareas de etiquetado.
- Base para un ajuste posterior: el adaptador puede servir de punto de partida para un fine-tuning adicional con datos propios, dado su formato PEFT estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: 1,7 GB en disco; en memoria, el adaptador es pequeño, pero requiere cargar el modelo base de 30B.
- VRAM para el base en bf16: aproximadamente 60 GB, lo que exige GPU de 80 GB (A100, H100) o reparto en varias GPU.
- VRAM para el base cuantizado a 8 bits: en torno a 30-32 GB; cabe en A100 40 GB o en configuraciones multi-GPU consumer.
- VRAM para el base cuantizado a 4 bits: en torno a 16-18 GB; viable en RTX 4090 (24 GB) y RTX 3090, con margen ajustado para el contexto.
- Despliegue: PEFT + Transformers para cargar el adaptador; vLLM o TGI para servir el base fusionado; llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| shabieh2/1026_tags_tree_full_2_epoch | Adaptador sobre base 30B | no disponible | no disponible | safetensors (PEFT) | 82 descargas, 0 likes, model card vacía |
| shabieh2/1026_tags_tree_full_3_epoch | Adaptador sobre el mismo base | no disponible | no disponible | safetensors (PEFT) | Variante de 3 épocas del mismo autor |
| unsloth/Muse-Glimmer-30B | 30B (según denominación) | no disponible | no disponible | no disponible | Modelo base; sus specs no se detallan en este repo |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Model card sin cumplimentar: no hay información sobre datos, sesgos, riesgos ni uso previsto; el autor no documenta nada.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución; hay que contactar con el autor o consultar la licencia del modelo base.
- Idiomas no declarados: se desconoce si el ajuste degrada el multilingüismo del base.
- Riesgo de sobreajuste o catastrofic forgetting: un ajuste de dos épocas sobre un dataset desconocido puede alterar el comportamiento general del base.
- Riesgo de alucinación: inherente al modelo base; el adaptador no lo mitiga y podría amplificarlo en tareas de etiquetado.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de mejora frente al base sin adaptador.
- Adopción muy baja (82 descargas, 0 likes): no hay validación comunitaria ni reportes de uso.
- Requiere el modelo base completo para funcionar: el coste de hardware es el del base de 30B, no el del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/shabieh2/1026_tags_tree_full_2_epoch
- Variante de 3 épocas: https://huggingface.co/shabieh2/1026_tags_tree_full_3_epoch
- Modelo base: https://huggingface.co/unsloth/Muse-Glimmer-30B
- Ficha en LLM Explorer (variante 1022): https://llm-explorer.com/model/shabieh2%2F1022_tags_tree_full_2_epoch,5wfakWyoMnbtKgxinjeekd
- Paper de PEFT (referencia de la etiqueta arxiv): https://arxiv.org/abs/1910.09700
