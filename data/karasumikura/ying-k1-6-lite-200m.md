# Karasumikura/Ying-K1.6-Lite-200M

## Resumen

Ying-K1.6-Lite-200M es un modelo de lenguaje causal de pequeno tamano (210,2 millones de parametros) desarrollado por el usuario Karasumikura y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de la version afinada por instrucciones del modelo base Ying-K1.6-Lite-200M-base, entrenada durante una epoca sobre un corpus de instrucciones en chino. El modelo esta disenado para generacion de texto y conversacion en chino e ingles, con una ventana de contexto de 8192 tokens.

El modelo emplea una arquitectura transformer densa con 16 capas y una dimension oculta de 768, con un vocabulario de 16.006 tokens y pesos en bf16. Su entrenamiento combina una fase de preentrenamiento general (24,07 B tokens), una fase de continuacion en chino sobre Ultra-FineWeb-L3 (1,40 B tokens) y una fase final de ajuste por instrucciones (0,17 B tokens). El resultado es un modelo compacto orientado a tareas de generacion y extraccion de caracteristicas en entornos con recursos limitados.

Su relevancia actual radica en su tamano reducido, que permite ejecucion en CPU y GPUs de consumo, y en su licencia permisiva, lo que lo hace util para prototipado rapido, experimentacion academica y despliegues en el borde. No obstante, al ser un modelo de 200 M de parametros, sus capacidades de razonamiento y conocimiento factual son limitadas en comparacion con modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (causal-lm) |
| Parametros totales | 210.210.560 (210,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code, requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

Ying-K1.6-Lite-200M es un transformer causal denso con 16 capas, dimension oculta de 768 y un vocabulario de 16.006 tokens. El modelo se distribuye con codigo personalizado (custom_code), por lo que su carga en transformers requiere `trust_remote_code=True`. Los pesos estan en bf16 y el repositorio ocupa aproximadamente 0,4 GB.

El entrenamiento se estructura en tres fases: un preentrenamiento base sobre un corpus generico mixto de 24,07 B tokens; una continuacion de preentrenamiento en chino sobre Ultra-FineWeb-L3 con 1,40 B tokens; y un ajuste por instrucciones de una epoca sobre un corpus de instrucciones en chino de 0,17 B tokens. La fase de instrucciones empleo secuencias de 8192 tokens, batch de 12, un scheduler WSD (100 pasos de calentamiento, ratio de annealing 0,2), optimizadores muon (5e-3) y adam (1,5e-4), durante 2100 pasos, lo que supone aproximadamente 172 millones de tokens. En el entrenamiento solo se anade el token `<|im_end|>` al final del turno del asistente. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generacion de texto causal en chino e ingles.
- Conversacion multi-turno mediante un formato de chat explicito con los tokens especiales `<|user|>`, `<|assistant|>` y `<|im_end|>`.
- Extraccion de caracteristicas (el modelo incluye la etiqueta feature-extraction ademas de text-generation).
- Capacidad de continuacion de texto y generacion condicionada por prompt.
- Soporte limitado de instrucciones en chino, derivado del ajuste supervisado sobre corpus de instrucciones.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues limitadas a chino e ingles segun la model card.

## Casos de uso

- Prototipado de chatbots en chino: el modelo puede mantener conversaciones multi-turno basicas usando el formato de chat documentado, con contexto de hasta 8192 tokens, adecuado para pruebas de concepto antes de escalar a modelos mayores.
- Generacion de texto asistida en entornos con recursos limitados: su tamano de 210 M parametros permite ejecutarlo en CPU o en GPUs de gama baja para tareas de redaccion, resumen o continuacion de texto en chino.
- Extraccion de caracteristicas para pipelines de NLP: al estar etiquetado como feature-extraction, puede emplearse para obtener representaciones de texto en tareas de clasificacion o clustering en chino e ingles.
- Educacion e investigacion: modelo ligero para experimentos de ajuste fino, ablaciones de entrenamiento o comparativas de tecnicas de instruccion sin requerir infraestructura costosa.
- Despliegue en el borde (edge): su reducido tamano y licencia Apache 2.0 permiten integrarlo en aplicaciones locales o dispositivos con memoria limitada para generacion de texto offline.
- Generacion de datos sinteticos en chino: puede utilizarse para producir textos de entrenamiento o aumentacion de datos en dominios especificos, con supervision humana posterior dada su tendencia a la alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,42 GB solo para pesos (210,2 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos moderados.
- En cuantizacion de 8 bits, el peso se reduce a unos 0,21 GB; en 4 bits, a unos 0,11 GB (estimaciones teoricas, no se publican variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo y tambien en CPU para inferencia en bf16/fp32, aunque con mayor latencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI al no publicarse pesos GGUF ni configuraciones para esos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ying-K1.6-Lite-200M | 210,2 M | 8192 | zh, en | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 | multilingue | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135 M | 8192 | en (principalmente) | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2048 | en (principalmente) | Apache 2.0 | Hugging Face |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento comparativo para Ying-K1.6-Lite-200M. Frente a SmolLM2-135M, Ying ofrece mayor tamano y soporte nativo de chino, mientras que SmolLM2 esta mas orientado al ingles. Qwen2.5-0.5B supera en parametros y contexto, y TinyLlama-1.1B es significativamente mayor pero con contexto menor.

## Limitaciones y advertencias

- Modelo de 210 M parametros: capacidad limitada de razonamiento, conocimiento factual y coherencia en tareas complejas; propenso a alucinaciones, especialmente en dominios especializados.
- Sesgos potenciales derivados del corpus de preentrenamiento generico y del corpus de instrucciones en chino; no se documentan evaluaciones de sesgo.
- Cobertura linguistica limitada a chino e ingles; el rendimiento en otros idiomas no esta garantizado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene revisar el codigo antes de usarlo en produccion.
- No se documentan variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que puede limitar el despliegue en motores de inferencia optimizados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin evaluaciones de seguridad documentadas.
- El formato de chat es estricto: el turno del usuario no debe cerrarse con `<|im_end|>`; un uso incorrecto degrada la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.6-Lite-200M
- Pesos base: https://huggingface.co/Karasumikura/Ying-K1.6-Lite-200M-base
- Dataset de continuacion en chino (Ultra-FineWeb-L3): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponible
