# illuin/IVE-4B

## Resumen

IVE-4B es un modelo de decisión tipado (typed decision model) desarrollado por Illuin Technology. No es un modelo generativo al uso: recibe un estado (`state`) en texto o JSON, opcionalmente acompañado de imágenes, junto con una o varias preguntas de opción múltiple (`choice`) o de sí/no (`noul`), y devuelve en una única pasada forward una probabilidad calibrada para cada opción, sin generar texto. La petición y la respuesta siguen el protocolo `/v1/systemone` del proyecto Decision Index.

El modelo es un fine-tune de Qwen/Qwen3.5-4B y cuenta con 4.539.265.536 parámetros totales (lenguaje más codificador visual). Su arquitectura hereda el diseño híbrido de Qwen3.5: 32 capas, de las cuales 8 son de atención completa y 24 son Gated DeltaNet, más un codificador de visión y una cabeza de lectura (readout) de 255 códigos de decisión. La innovación clave es que las 8 capas de atención completa operan de forma no causal: cada token ve toda la fila de la pregunta, lo que permite leer la respuesta en una sola pasada en lugar de decodificar token a token.

Su relevancia actual radica en el enfoque: sustituye la generación autoregresiva por una clasificación calibrada sobre un conjunto fijo de códigos de respuesta, lo que reduce latencia y coste en tareas de enrutamiento, triaje y decisión estructurada. Está pensado para entornos de bajos recursos con un rendimiento visual destacado (índice público de visión 71,90 frente a 58,51 en texto). Se publica bajo licencia Apache 2.0 y tiene un modelo menor destilado, Ivonnet-0.8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: 32 capas (8 de atención completa no causal, 24 Gated DeltaNet), codificador de visión y readout de 255 códigos |
| Parámetros totales | 4.539.265.536 (4,54 B, lenguaje y codificador visual) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | hasta 32.768 tokens por fila de pregunta; filas de entrenamiento de hasta 16.384 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el readout en float32) |
| Idiomas soportados | no disponible (evaluado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model-0000*-of-00002.safetensors` en bf16 y `readout.safetensors` en float32) |

## Arquitectura y entrenamiento

IVE-4B parte del backbone `Qwen3_5Model` de Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), sin la cabeza de modelo de lenguaje. Sobre ese backbone se añade una cabeza de lectura lineal de dimensión `[255, 2560]` en float32 que proyecta el estado oculto final de la posición de generación sobre 255 códigos de respuesta de un solo token (de la A a la Z, luego AA, AB, etc.). Las 8 capas de atención completa se ejecutan de forma no causal (cada token ve toda la fila, salvo el padding), mientras que las capas Gated DeltaNet mantienen su recurrencia causal. Esta mezcla implica que la inferencia causal estándar no reproduce el modelo: es necesario usar el código de `source/`, que verifica en tiempo de carga que la atención ejecutada es la correcta.

Cada pregunta se convierte en una fila del chat template con el modo thinking desactivado, y las logits de las opciones de esa pregunta se dividen por una temperatura de calibración ajustada de 1,5329 para obtener las probabilidades. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card solo indica que las filas de entrenamiento tenían como máximo 16.384 tokens y que las imágenes se mantuvieron a resolución nativa hasta un límite de aproximadamente 2,1 MP durante el entrenamiento (1,6 MP en la evaluación del Decision Index). El modelo requiere `transformers>=5.7,<6` y `flash-linear-attention` 0.5.2; sin esta última, las capas Gated DeltaNet caen en un fallback de PyTorch mucho más lento.

## Capacidades

- Clasificación de decisión tipada: devuelve una probabilidad calibrada por opción para preguntas `choice` de 2 a 255 opciones y para preguntas `noul` (sí/no).
- Entrada multimodal: acepta texto o JSON como estado, con hasta 4 imágenes por petición en evaluación, en rutas, bytes, imágenes PIL o URLs `data:`.
- Lectura en una sola pasada: no genera texto; la respuesta se obtiene de un único forward pass sobre los códigos de opción.
- Soporte del tipo `score` (niveles ordenados) en el código, aunque no evaluado.
- Protocolo HTTP de servicio: expone `POST /v1/systemone` (protocolo de texto del Decision Index) y `POST /v1/decisions` (protocolo de visión).
- Capacidades multilingües: no disponibles; la evaluación se centra en inglés.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso en el sentido de un agente generativo.

## Casos de uso

- Triaje de tickets de soporte: el ejemplo de la model card enruta una incidencia (error 401) hacia los equipos de facturación, soporte o ventas mediante una pregunta `choice`, y determina con una `noul` si el cliente está bloqueado, todo en una sola llamada.
- Enrutamiento de peticiones en pipelines: al devolver probabilidades calibradas por opción, permite aplicar umbrales de confianza y derivar casos ambiguos a revisión humana en lugar de forzar una etiqueta.
- Clasificación de documentos con imágenes: con hasta 4 imágenes por petición y resolución nativa, puede decidir sobre capturas, formularios escaneados o diagramas junto al texto del estado.
- Moderación y etiquetado estructurado: preguntas de sí/no (`noul`) para políticas binarias y preguntas `choice` para categorías, con la ventaja de una latencia baja al no generar texto.
- Servicio de decisión de baja latencia: el servidor incluido (`python -m decision_model.server`) precarga y calienta el modelo una vez y expone los dos endpoints, adecuado para entornos con recursos limitados.
- Evaluación reproducible con el kit Decision Index: los motores `DecisionModelEngine` y `DecisionModelVisionEngine` permiten ejecutar las suites públicas y comparar resultados con otros modelos del índice.
- Destilación y despliegue en el borde: el modelo menor Ivonnet-0.8B, destilado de este, cubre escenarios donde 4,54 B de parámetros no son viables.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Decision Index 0.3, índice público de texto | 58,51 (suite pública completa, 140.620 peticiones, HLE incluido) |
| Decision Index 0.3, índice público de visión | 71,90 (suite pública completa) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de lenguaje, lo que es coherente con la naturaleza no generativa del modelo. Tampoco se dispone de cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 9 GB de memoria de GPU; las entradas más largas (en torno a 27k tokens) requieren más.
- GPU recomendadas: no se especifican modelos concretos; se requiere PyTorch con CUDA y `flash-linear-attention` 0.5.2 para evitar el fallback lento de las capas Gated DeltaNet.
- GPU de consumo: con unos 9 GB de pesos en bf16, encaja en tarjetas con 12 GB o más de VRAM, aunque la información no confirma modelos concretos ni el impacto de entradas largas.
- Despliegue: servidor HTTP propio del paquete `decision_model` (`python -m decision_model.server --model IVE-4B --port 8000`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de software: Python ≥ 3.10, PyTorch con CUDA y `transformers>=5.7,<6` (probado con 5.7.0, 5.13.1 y 5.22.1).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IVE-4B | 4,54 B | 32.768 tokens por pregunta | Decisión tipada con readout calibrado | Apache 2.0 | Hugging Face |
| Ivonnet-0.8B (Illuin) | no disponible (destilado de IVE-4B) | no disponible | Decisión tipada, versión reducida | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B | 4 B (aproximado) | no disponible | Modelo generativo base | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada. La comparación con alternativas de la misma categoría (modelos de decisión tipada) no está disponible.

## Limitaciones y advertencias

- Una fila de pregunta de más de 32.768 tokens o con más de 255 opciones se rechaza, nunca se trunca.
- Las filas de entrenamiento no superaban los 16.384 tokens, por lo que las entradas más largas quedan fuera de la distribución de entrenamiento.
- La inferencia causal estándar no reproduce el modelo: es obligatorio usar el código de `source/`, que valida el modo de atención en la carga.
- Evaluación centrada en inglés; el rendimiento en otros idiomas no está documentado.
- El tipo `score` está implementado en el código pero no ha sido evaluado.
- El modelo no genera texto: no es adecuado para tareas de generación, resumen o conversación abierta.
- No se documentan sesgos conocidos ni tasas de alucinación; al tratarse de clasificación calibrada, el riesgo principal es una asignación errónea de probabilidad ante estados fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el archivo `NOTICE` con la atribución y los cambios realizados sobre el modelo base.
- Requiere `flash-linear-attention` 0.5.2 para un rendimiento razonable; sin ella, las capas Gated DeltaNet usan un fallback mucho más lento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illuin/IVE-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo destilado: https://huggingface.co/illuin/Ivonnet-0.8B
- Repositorio Decision Index: https://github.com/apolinario/decision-index
- Contacto del autor: quentin.mace@illuin.tech
