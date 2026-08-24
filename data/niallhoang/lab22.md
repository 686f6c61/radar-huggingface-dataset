# NiallHoang/lab22

## Resumen

El modelo `NiallHoang/lab22` es un adaptador LoRA (Low-Rank Adaptation) entrenado con DPO (Direct Preference Optimization) sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-3B. El adaptador se desarrolló como parte de un laboratorio de alineación (Day 22 DPO/ORPO Alignment Lab, Track 3) y está orientado a mejorar la generación de texto en vietnamita mediante el ajuste de preferencias humanas. El repositorio contiene únicamente los pesos del adaptador (0.1 GB), no el modelo completo, y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en demostrar un pipeline práctico de alineación con DPO sobre un modelo base cuantizado, utilizando herramientas como Unsloth y PEFT. Aunque no se publican benchmarks externos, las métricas de entrenamiento muestran una separación positiva entre recompensas elegidas y rechazadas, lo que sugiere cierta efectividad en el aprendizaje de preferencias. Es un ejemplo de adaptación eficiente en recursos para un idioma de bajo recurso como el vietnamita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-3B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, tamaño del repo 0.1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | El adaptador se usa con el modelo base cargado en 4 bits (bnb-4bit); el adaptador en sí no tiene cuantización propia |
| Idiomas soportados | vietnamita (entrenamiento), otros no especificados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un checkpoint SFT-mini derivado de `unsloth/Qwen2.5-3B-bnb-4bit`. El proceso consta de dos fases: primero un ajuste supervisado (SFT) con el dataset `5CD-AI/Vietnamese-alpaca-gpt4-gg-translated` (1,000 muestras, 1 época), y posteriormente un entrenamiento DPO con el dataset de preferencias `argilla/ultrafeedback-binarized-preferences-cleaned`. Los hiperparámetros DPO son beta=0.1, learning rate=5e-07 y 1 época. La implementación utiliza la librería Unsloth para carga eficiente en 4 bits y PEFT para el adaptador.

No se detallan innovaciones técnicas adicionales más allá del uso de DPO sobre un modelo cuantizado, lo que reduce los requisitos de memoria durante el entrenamiento. El adaptador se aplica mediante `PeftModel` sobre el modelo base, tal como se muestra en el código de uso proporcionado.

## Capacidades

- Generación de texto en vietnamita: el adaptador está entrenado para producir respuestas alineadas con preferencias humanas en este idioma.
- Alineación con preferencias: el entrenamiento DPO busca aumentar la probabilidad de respuestas elegidas frente a rechazadas, mejorando la calidad subjetiva de las salidas.
- Integración con modelos base cuantizados: diseñado para funcionar con Qwen2.5-3B en 4 bits, lo que permite inferencia en hardware modesto.
- No se especifican capacidades como tool calling, razonamiento multi-paso, visión o audio. El modelo base Qwen2.5 podría ofrecer algunas de estas, pero el adaptador no las documenta.

## Casos de uso

- Asistentes conversacionales en vietnamita: el adaptador puede integrarse en chatbots para generar respuestas más naturales y preferidas por usuarios vietnamitas, aprovechando el ajuste DPO.
- Generación de contenido localizado: redacción de textos, resúmenes o respuestas a preguntas en vietnamita, con un sesgo hacia respuestas de mayor calidad percibida.
- Filtrado o reescritura de respuestas: dado su entrenamiento en preferencias, puede usarse para seleccionar o reformular respuestas generadas por otros modelos.
- Prototipos de investigación en alineación: sirve como ejemplo reproducible de un pipeline DPO sobre un modelo pequeño, útil para experimentos académicos o educativos.
- Aplicaciones con restricciones de recursos: al ser un adaptador ligero sobre un base 4-bit, es adecuado para entornos con VRAM limitada (por ejemplo, GPUs de consumo).
- Evaluación de técnicas DPO: permite comparar el efecto del adaptador frente al modelo base sin ajuste, en tareas de generación vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son del entrenamiento:

| Metrica | Valor |
|---|---|
| Loss final de entrenamiento | 0.7502 |
| Recompensa elegida (end) | -0.6657 |
| Recompensa rechazada (end) | -0.9146 |
| Diferencia de recompensa | 0.2490 |

Estos valores indican una separación positiva entre respuestas elegidas y rechazadas, pero no constituyen una evaluación de rendimiento en tareas estándar.

## Requisitos de hardware

- VRAM estimada: al cargar el modelo base en 4 bits (Qwen2.5-3B), se requieren aproximadamente 4-6 GB de VRAM para inferencia, dependiendo de la longitud de contexto y el batch.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10G o A100. El adaptador añade una sobrecarga mínima.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en 4 bits.
- Opciones de despliegue: el adaptador requiere el uso de PEFT y Transformers (o Unsloth). Puede integrarse en frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se documenta explícitamente. Alternativas como llama.cpp u Ollama no son directas por la dependencia de PEFT.
- Latencia y throughput: no disponibles; dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA DPO comparables para vietnamita. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B (base) | 3B | 32k (típico, no confirmado) | Preentrenamiento general | Apache 2.0 |
| NiallHoang/lab22 (adaptador) | ~0.1 GB (adaptador) | no disponible | SFT + DPO en vietnamita | Apache 2.0 |

No se identifican alternativas directas en la misma categoría (adaptadores DPO para vietnamita sobre Qwen2.5-3B).

## Limitaciones y advertencias

- El adaptador se entrenó con solo 1,000 muestras SFT y un dataset de preferencias genérico (ultrafeedback), lo que puede limitar su robustez y generalización en dominios específicos.
- No hay benchmarks externos que validen su calidad; las métricas de entrenamiento no garantizan rendimiento en tareas reales.
- Está enfocado al vietnamita; su comportamiento en otros idiomas no está documentado y probablemente sea deficiente.
- Depende del modelo base cuantizado a 4 bits, lo que puede introducir degradación de calidad frente a una versión sin cuantizar.
- El adaptador no es un modelo autónomo; requiere cargar el modelo base y aplicar PEFT, lo que añade complejidad de integración.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen2.5 también es Apache 2.0, pero se recomienda verificar las condiciones de los datasets utilizados (especialmente ultrafeedback, que puede tener restricciones).
- No se reportan sesgos específicos, pero al ser un modelo pequeño y con datos limitados, puede presentar alucinaciones o respuestas incoherentes.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/NiallHoang/lab22
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-bnb-4bit
- Dataset SFT: https://huggingface.co/datasets/5CD-AI/Vietnamese-alpaca-gpt4-gg-translated
- Dataset de preferencias: https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned
- Perfil del autor: https://huggingface.co/NiallHoang
