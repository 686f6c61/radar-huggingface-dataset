# qhoenix/zils-mini-decision-t2avg

## Resumen

zils-mini-decision-t2avg es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,5B) publicado por el usuario qhoenix en Hugging Face. Se construye sobre el chasis del modelo Qwen/Qwen3.5-4B y se distribuye con licencia Apache-2.0. Su propósito declarado es la extracción de características y la toma de decisiones estructuradas dentro del marco "Zils d3-mini", no la generación de texto conversacional al uso.

El modelo se ha obtenido mediante una receta de "model soup": un promedio uniforme de pesos de dos cuerpos Apache-2.0 (vllm-sr/d3-mini y torchcast-ai/torchcast-decision-4b), seguido de dos ajustes finos LoRA independientes sobre pesos lingüísticos y un promediado final de ambos. El entrenamiento se realizó sobre aproximadamente 144.000 ítems de decisión en el formato de examen Zils, más unas 55.000 decisiones tipadas procedentes de 306 fuentes inglesas del dataset tasksource/tasksource-jev-typed-decisions.

Es relevante porque ejemplifica una familia emergente de modelos especializados en decisiones y clasificación estructurada, con etiquetas ordinales tratadas de forma consciente de la distancia, y porque su pipeline declarado es feature-extraction, lo que lo aleja del uso como chatbot generalista. El repositorio ocupa 9,1 GB y se publicó el 13 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (tag `qwen3_5`), con `custom_code` |
| Parámetros totales | 4.539.265.536 (aproximadamente 4,5B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer heredado de Qwen/Qwen3.5-4B, empaquetado con código personalizado (`custom_code`) y etiquetado con el identificador `qwen3_5`. El modelo se presenta como un "cuerpo" (body) dentro del chasis fijo d3-mini, en precisión BF16. No se documenta ninguna innovación de atención (atención lineal, SSM híbrido, decodificación especulativa) ni detalles sobre la longitud de contexto nativa del chasis.

El proceso de construcción consta de tres fases. Primero, un promedio uniforme de pesos de dos cuerpos Apache-2.0: vllm-sr/d3-mini y torchcast-ai/torchcast-decision-4b, sin participación de ningún cuerpo "miner". Segundo, dos ajustes finos LoRA independientes (rango 64, learning rate 5e-5, una época, semillas distintas) sobre los pesos lingüísticos, usando aproximadamente 144.000 ítems de decisión en formato de examen Zils: splits públicos TRAIN con etiquetas gold, ítems generados por Claude, GPT-5.4, DeepSeek y otros a partir de splits públicos TRAIN de datasets de uso comercial (los ítems de dominio nuevo solo se conservan si un modelo de otro proveedor respondió a ciegas de la misma forma), y unas 55.000 decisiones tipadas de 306 fuentes inglesas de tasksource/tasksource-jev-typed-decisions, restringidas a filas con `license_use: commercial` y con un máximo de 200 por fuente. Tercero, promedio uniforme de los dos ajustes fusionados. Los objetivos ordinales (score) se tratan con conciencia de distancia en lugar de suavizado uniforme. No se usaron semillas de examen ni splits de validación o test para el entrenamiento.

## Capacidades

- Extracción de características y representaciones internas (pipeline declarado: `feature-extraction`).
- Toma de decisiones estructuradas y clasificación en el formato de examen Zils.
- Predicción de objetivos ordinales (scores) con tratamiento consciente de la distancia entre clases.
- Procesamiento de decisiones tipadas en dominios diversos, derivadas de 306 fuentes de tasksource-jev.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el entrenamiento documentado es en inglés).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de decisiones estructuradas: el modelo puede asignar etiquetas de decisión a ítems de entrada en el formato Zils, aprovechando su ajuste sobre 144.000 ítems con etiquetas gold para tareas de enrutamiento o triaje.
- Puntuación ordinal de candidatos: al tratar los objetivos ordinales de forma consciente de la distancia, es adecuado para rankear opciones o puntuar respuestas en escalas ordenadas, por ejemplo en evaluación automática de calidad.
- Extracción de features para pipelines downstream: su pipeline `feature-extraction` permite usar las representaciones internas como entrada de clasificadores o sistemas de recuperación externos.
- Moderación y política de decisión: el ajuste sobre decisiones tipadas de uso comercial lo hace apto para clasificar casos según políticas predefinidas en sistemas de cumplimiento.
- Enrutamiento de tareas en orquestadores: puede decidir a qué herramienta o submodelo derivar una petición, con la ventaja de su tamaño contenido (4,5B) frente a modelos mayores.
- Evaluación de modelos en formato examen: sirve como evaluador o como sujeto en bancos de pruebas de decisión tipo Zils, dado que el autor documenta explícitamente que no usó semillas de examen.
- Investigación sobre model soups y LoRA: su receta reproducible (promedio de cuerpos, dos LoRA con semillas distintas, promediado final) es un caso de estudio para experimentos de fusión de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- Cuantización: no se documentan versiones GGUF, AWQ ni GPTQ; al no haber cuantizaciones publicadas, el despliegue en VRAM reducida requeriría convertir los pesos manualmente.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en BF16 con contexto amplio; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con contexto moderado.
- GPU de consumo: cabe en GPUs de 16 GB o más en BF16; en GPUs de 8-12 GB requeriría cuantización no publicada.
- Opciones de despliegue: transformers (librería declarada) y, por compatibilidad de endpoints, servidores compatibles con la API de endpoints; vLLM, llama.cpp, Ollama o TGI no están confirmados por el autor y requerirían verificar el soporte de `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-decision-t2avg | 4,5B | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | Generación general | según el modelo base | Hugging Face |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | Decisión | Apache-2.0 (según la model card) | Hugging Face |
| vllm-sr/d3-mini | no disponible | no disponible | Decisión | Apache-2.0 (según la model card) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión y extracción de características: no está diseñado como asistente conversacional general y su comportamiento en generación libre no está documentado.
- Idiomas: el entrenamiento documentado se realizó en inglés; no se declaran idiomas soportados, por lo que el rendimiento en castellano es desconocido.
- Contexto: no se especifica la longitud de contexto efectiva, lo que impide garantizar el manejo de entradas largas.
- Sesgos: el corpus incluye ítems generados por modelos de terceros (Claude, GPT-5.4, DeepSeek), lo que puede introducir sesgos de estilo y de decisión heredados de esos generadores.
- Alucinación: al ser un modelo de decisión y clasificación, el riesgo se manifiesta como etiquetas o scores incorrectos con alta confianza, no como texto inventado; requiere validación en producción.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de origen (tasksource-jev se filtró a filas con `license_use: commercial`, lo que sugiere restricciones mixtas en el corpus completo).
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación externa ni benchmarks publicados.
- Código personalizado: el uso de `custom_code` puede complicar la exportación a otros runtimes y requerir `trust_remote_code=True`.
- Fecha de publicación futura (2026-11-13) respecto a la información disponible, lo que limita el contraste con evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo de partida 1: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo de partida 2: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
