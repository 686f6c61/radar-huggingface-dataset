# ml-intern-internal/gpt-50m-fineweb-edu

## Resumen

`ml-intern-internal/gpt-50m-fineweb-edu` es un repositorio de Hugging Face que contiene el script de preentrenamiento (`train.py`) y el plan de ejecución para un modelo GPT-2-style de aproximadamente 51 millones de parámetros, entrenado desde inicialización aleatoria sobre el dataset FineWeb-Edu (configuración `sample-10BT`, en streaming). Lo desarrolla el usuario `ml-intern-internal` en el contexto de la herramienta ML Intern, y su propósito declarado es servir como receta reproducible de preentrenamiento a pequeña escala.

El punto crítico es que **no se ha publicado ningún checkpoint en el repositorio**: según la propia model card, la ejecución de entrenamiento quedó bloqueada por falta de permisos de cómputo en la sesión que escribió el script. Por tanto, lo que existe hoy es infraestructura de entrenamiento lista para lanzar, no un modelo entrenado con pesos descargables.

La relevancia es, por tanto, educativa y de ingeniería: documenta con detalle hiperparámetros, tamaño de batch efectivo, estrategia de tokenización y empaquetado, estimaciones de coste por hardware y pasos de validación, lo que lo convierte en una referencia útil para quien quiera reproducir un preentrenamiento de escala pequeña con el stack de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (`transformers.GPT2LMHeadModel`) |
| Parámetros totales | ~51M (8 capas, d_model 512, 8 cabezas, MLP 2048, embeddings atados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible (no se publican pesos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | ODC-BY |
| Formato de pesos | no disponible (no hay checkpoint publicado; el script prevee subir checkpoint + tokenizer) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 canónica con 8 capas transformer, dimensión de modelo 512, 8 cabezas de atención, capa MLP de 2048 y embeddings atados entre entrada y salida, con vocabulario GPT-2 de 50.257 tokens. Emplea atención SDPA y autocast en bf16. El optimizador es AdamW con β = 0,9/0,95, weight decay 0,1 aplicado solo a matrices, learning rate pico de 1e-3, warmup de 200 pasos seguido de decaimiento coseno hasta el 10 % del pico, y clipping de gradiente de 1,0.

Los datos provienen de FineWeb-Edu (Penedo et al., 2024, arXiv:2406.17557), configuración `sample-10BT` en streaming, tokenizados al vuelo con el tokenizador GPT-2 mediante 4 workers de dataloader y sharding round-robin sobre ficheros parquet. Los documentos se empaquetan en bloques fijos de 1024 tokens separados por EOS. El batch efectivo es de 65.536 tokens por paso (32 × 2 de acumulación × 1024). La validación se realiza sobre el shard central, con aproximadamente 0,65M tokens, evaluada cada 500 pasos. No se documenta uso de RLHF, DPO ni ninguna fase de ajuste posterior; es exclusivamente preentrenamiento desde cero.

## Capacidades

- No hay capacidades verificables: el repositorio no contiene pesos entrenados, solo el script de entrenamiento.
- El script está diseñado para producir un modelo de generación de texto autoregresivo en inglés, sin ajuste instructivo.
- No se contempla soporte de tool calling ni function calling.
- No se contempla soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el dataset y el tokenizador están orientados a inglés.
- No incluye modo thinking, visión ni audio.
- Funcionalidad real disponible hoy: pipeline de preentrenamiento reproducible con validación periódica y registro en el proyecto Trackio `gpt50m-fineweb-edu-pretrain`.

## Casos de uso

- Reproducción de un preentrenamiento a escala pequeña: el script permite lanzar un entrenamiento completo de ~51M parámetros sobre 750M tokens en unas 2 horas en una instancia a10g-small por un coste estimado de ~2 USD, útil para validar pipelines de datos y entrenamiento.
- Docencia y formación en LLMs: sirve como ejemplo didáctico completo de un ciclo de preentrenamiento (tokenización al vuelo, empaquetado en bloques de 1024 tokens, warmup y decaimiento coseno, validación cada 500 pasos) sin la complejidad de un modelo grande.
- Prueba de humo de infraestructura: el modo smoke (3M tokens, ~45 pasos, sin push) permite medir tokens por segundo en un flavor concreto antes de comprometer presupuesto, tal como describe la model card.
- Estimación de costes y planificación de cómputo: la tabla de costes incluida (51M/750M tokens, 51M/1B tokens, 350M/7B tokens, 350M/20B tokens) sirve para dimensionar runs mayores con precios de Hugging Face Jobs (a10g-small 1,00 USD/h, A100-large 2,50 USD/h, H200 5,00 USD/h).
- Base para experimentos de ablación: al ser un GPT-2 pequeño entrenado desde cero con hiperparámetros explícitos, es adecuado para estudiar el efecto de cambios en learning rate, tamaño de batch efectivo o composición del dataset.
- Punto de partida para fine-tuning posterior: una vez entrenado el checkpoint, podría servir como modelo base de bajo coste para tareas de clasificación o generación en inglés, aunque hoy no existe tal checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye estimaciones de coste y tiempo de cómputo (FLOPs ≈ 6·N·D), no métricas de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir checkpoint. Para referencia, un modelo de ~51M parámetros en bf16 ocuparía del orden de 100 MB de pesos, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas para entrenamiento según la model card: a10g-small para el run de 51M, A100-large o H200 para el run de 350M.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: no disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El script propone medir tokens por segundo mediante el smoke test antes de lanzar el entrenamiento completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pesos publicados | Notas |
|---|---|---|---|---|---|
| gpt-50m-fineweb-edu | ~51M | 1024 | ODC-BY | No | Script de entrenamiento, sin checkpoint |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Sí | Modelo entrenado y ampliamente utilizado; referencia habitual para esta escala |
| Modelos de ~50M en FineWeb-Edu | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación con GPT-2 small es pertinente por arquitectura y familia, pero no por tamaño ni por disponibilidad de pesos. No se dispone de información sobre otros modelos de ~50M entrenados sobre FineWeb-Edu para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No hay checkpoint publicado: el repositorio no permite descargar ni ejecutar el modelo; solo contiene el script y el plan de entrenamiento.
- El propio autor indica que el run quedó bloqueado por falta de permisos de cómputo, por lo que no existe evidencia de que el script se haya ejecutado a escala completa.
- Modelo exclusivamente en inglés y sin ajuste instructivo: no es adecuado para conversación ni para seguir instrucciones sin un fine-tuning posterior.
- Contexto limitado a 1024 tokens, insuficiente para tareas de contexto largo.
- Riesgo de sesgos y alucinaciones propio de un modelo preentrenado sobre datos web filtrados por criterio educativo, sin evaluación de seguridad ni alineamiento.
- Licencia ODC-BY: permite uso comercial con atribución, pero conviene verificar los términos del dataset FineWeb-Edu y del tokenizador GPT-2 por separado.
- Las estimaciones de coste y tiempo son proyecciones basadas en FLOPs y en precios de Hugging Face Jobs, no mediciones de un run completado.
- El identificador del repositorio (`ml-intern-internal`) sugiere un uso interno; su estabilidad a largo plazo no está garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ml-intern-internal/gpt-50m-fineweb-edu
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de FineWeb-Edu (Penedo et al., 2024): https://arxiv.org/abs/2406.17557
- Tokenizador GPT-2: https://huggingface.co/openai-community/gpt2
- ML Intern (herramienta citada en la model card): https://hf.co/chat?mode=ml-intern
