# qhoenix/zils-lite-decision-avg-abc

## Resumen

zils-lite-decision-avg-abc es un modelo de decisión de 0,85 mil millones de parámetros (852.985.920 exactos según los pesos en safetensors) desarrollado por el usuario qhoenix dentro del ecosistema Zils, en su variante d3-lite. Se construye sobre el modelo base Qwen/Qwen3.5-0.8B mediante una técnica de "soup-pool": una media ponderada de pesos de varios modelos de decisión (dos miembros del propio linaje Zils al 25% cada uno y cuatro cuerpos Apache-2.0 de terceros al 12,5% cada uno), seguida de tres fine-tunes completos de los pesos de lenguaje y una media uniforme final de los tres.

El modelo no es un generador de texto conversacional al uso, sino un clasificador de decisión especializado (pipeline `feature-extraction`) entrenado sobre aproximadamente 98.000 ítems en el formato de examen Zils. Resuelve el problema de emitir decisiones estructuradas y calibradas sobre entradas de examen, con una función de pérdida que combina entropía cruzada suave, pérdida de Brier y un anclaje KL (0,1) al modelo de partida para evitar el olvido catastrófico.

Es relevante ahora porque demuestra una receta reproducible de fusión y fine-tuning de bajo coste sobre un modelo base pequeño (0,8B) con licencia Apache-2.0, orientada a tareas de decisión con calibración probabilística, y porque su tamaño permite despliegue en hardware modesto. El repositorio ocupa 1,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B); layout d3-lite, pesos en BF16 |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,7 GB |
| Requiere codigo personalizado | si (tag custom_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85B parámetros, reutilizado aquí como cuerpo de decisión en el layout fijado d3-lite y almacenado en BF16. La construcción sigue tres fases documentadas en la model card: primero, una media ponderada de pesos que combina Charlie320/zils-lite-v9a (25%) y qhoenix/zils-lite-decision-v9 (25%) con cuatro cuerpos Apache-2.0 de la casa (vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full) al 12,5% cada uno.

Segundo, tres fine-tunes completos de los pesos de lenguaje desde ese punto de partida, con learning rate 5e-6, una época y semillas distintas, sobre aproximadamente 98.000 ítems de decisión en formato de examen Zils. Los datos provienen de splits TRAIN públicos con etiquetas gold, más ítems generados a partir de splits TRAIN públicos de datasets de uso comercial por Claude, GPT-5.4, DeepSeek y otros modelos; los ítems de dominio nuevo solo se conservaron cuando un modelo de otro proveedor respondió de forma ciega igual. La función de pérdida combina entropía cruzada suave, pérdida de Brier y un anclaje KL de 0,1 respecto al modelo inicial.

Tercero, el cuerpo final es la media uniforme de los tres fine-tunes. La model card afirma explícitamente que no se usaron semillas de examen, splits de validación ni de test durante el entrenamiento, lo que reduce el riesgo de contaminación en la evaluación, aunque no se aportan métricas de rendimiento.

## Capacidades

- Clasificación y emisión de decisiones estructuradas en el formato de examen Zils (tarea principal del modelo).
- Extracción de características (`feature-extraction`): representaciones vectoriales de entrada utilizables en pipelines posteriores.
- Calibración probabilística de salidas gracias al entrenamiento con pérdida de Brier y entropía cruzada suave.
- Capacidades de lenguaje heredadas del modelo base Qwen3.5-0.8B, si bien el fine-tuning está orientado a decisión y no a generación abierta.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; los idiomas no están declarados en la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación de decisiones en pipelines de examen automatizado: el modelo emite respuestas en el formato Zils sobre ítems de examen, adecuado para sistemas de evaluación estandarizada donde se requiere una salida estructurada y calibrada.
- Enrutamiento y triaje de tickets: al ser un modelo de decisión pequeño, puede clasificar entradas en categorías predefinidas con puntuaciones de confianza derivadas de la calibración por Brier, integrándose como primer filtro en un sistema de atención al cliente.
- Moderación de contenido con umbral de confianza: la pérdida de Brier permite umbrales probabilísticos más fiables que una entropía cruzada pura, útil para decidir cuándo escalar a revisión humana.
- Extracción de características para búsqueda semántica: el pipeline `feature-extraction` permite generar embeddings de textos para indexación y recuperación en bases vectoriales.
- Ensemble de decisión en producción: su tamaño de 0,85B permite ejecutarlo en CPU o GPU modesta como miembro de un comité de modelos que votan sobre decisiones críticas.
- Investigación en fusión de modelos: sirve como caso de estudio reproducible de "soup-pool" más fine-tuning con anclaje KL para experimentos académicos sobre olvido catastrófico y calibración.
- Evaluación de robustez ante dominios nuevos: los ítems de dominio nuevo filtrados por acuerdo ciego entre proveedores permiten estudiar la generalización de clasificadores pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB para los pesos, más overhead de activaciones y KV cache (estimación típica de 2 a 3 GB en total para entradas cortas).
- VRAM estimada en FP16/FP32: FP16 similar a BF16 (~1,7 GB); FP32 requeriría unos 3,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), con posible conversión a GGUF para llama.cpp u Ollama; vLLM y TGI no están confirmados en la información disponible. El tag `custom_code` obliga a cargar con `trust_remote_code=True`.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera latencia de milisegundos por ítem en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-decision-avg-abc | 852.985.920 | no disponible | Apache-2.0 | Modelo de decisión por soup-pool y fine-tuning |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible en la informacion | Modelo base generativo del que deriva |
| internlm/Intern-Decision-0.8B | ~0,8B | no disponible | Apache-2.0 (según model card) | Cuerpo de decisión integrado en la media de pesos |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 (según model card) | Cuerpo de decisión integrado en la media de pesos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión: no está diseñado como generador conversacional general; su uso fuera del formato de examen Zils puede degradar la calidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje subyacentes; las salidas de decisión deben validarse con umbrales de confianza.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Longitud de contexto no documentada: limita la planificación de cargas con entradas largas.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; auditar antes de desplegar en producción.
- Procedencia de datos de entrenamiento parcialmente sintética (ítems generados por Claude, GPT-5.4, DeepSeek y otros), con posible sesgo de los modelos generadores.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base y de los datasets de origen citados en la model card.
- Sin descargas ni validación comunitaria en el momento de la consulta: modelo recién publicado, sin evidencia externa de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Miembro del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Miembro del soup: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Cuerpo de la casa: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo de la casa: https://huggingface.co/internlm/Intern-Decision-0.8B
- Cuerpo de la casa: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Cuerpo de la casa: https://huggingface.co/zils-ai/jiwo-0.8b-full
