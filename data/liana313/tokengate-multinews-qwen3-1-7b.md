# liana313/tokengate-multinews-qwen3-1.7b

## Resumen

TokenGate MultiNews es un adaptador LoRA (r16, alpha 32, aplicado a las proyecciones q/v de todas las capas) acompañado de una puerta de poda de tokens de la KV-cache, entrenados conjuntamente sobre Qwen3-1.7B. Lo desarrolla el usuario liana313 en el contexto del proyecto TokenGate y se presenta como el checkpoint exacto utilizado en los benchmarks del artículo arXiv:2610.26754. Su objetivo no es mejorar la calidad generativa del modelo base, sino reducir el coste de inferencia en contextos largos descartando dinámicamente entradas de la KV-cache que el gate considera irrelevantes.

El modelo está especializado en un dominio concreto: resumen multilingüe de múltiples documentos sobre el corpus MultiNews, emparejado con la variante longbench_multi_news de LongBench. El entrenamiento se realizó sobre el par de datos que coincide con la evaluación de LongBench, con receta iso y 24.000 pasos, seleccionándose este checkpoint por ser el que obtuvo la mayor precisión en el conjunto de test held-out con contexto completo entre los pasos guardados.

Es relevante porque ejemplifica una línea de trabajo activa en inferencia eficiente: en lugar de truncar el contexto o recurrir a atención dispersa genérica, aprende una política de poda específica para la tarea y el modelo, empaquetada como un artefacto de 0,2 GB que se carga sobre el Qwen3-1.7B original sin modificar sus pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) + gate de poda de KV-cache + adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA y el gate se distribuyen como ficheros .pt; el modelo base tiene 1,7 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; el adaptador está entrenado para escenarios de contexto largo tipo LongBench) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) para el gate y el LoRA; el modelo base en safetensors según el repositorio de Qwen |

## Arquitectura y entrenamiento

El sistema combina tres piezas: el modelo base Qwen3-1.7B sin modificar, un adaptador LoRA de rango 16 y alpha 32 aplicado a las proyecciones de query y value en todas las capas, y una capa de puerta ("gate layer 1") que decide qué tokens de la KV-cache se conservan durante la generación. La poda se aprende de extremo a extremo junto con el LoRA, de modo que la política de descarte y la adaptación de representaciones se optimizan de forma conjunta en lugar de entrenarse por separado.

El entrenamiento se realizó sobre el corpus MultiNews de resumen multilingüe de múltiples documentos, usando el emparejamiento de datos que coincide con la variante longbench_multi_news de LongBench, con una receta "iso" y 24.000 pasos. El checkpoint publicado corresponde al paso 24000, seleccionado por haber alcanzado la mayor precisión en test held-out con contexto completo entre los pasos guardados. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de MultiNews, ni si se aplicaron fases de RLHF o DPO. El repositorio incluye además una baseline SFT sin gate (liana313/tokengate-sftbase-multinews-qwen3-1.7b) pensada para comparar el efecto de la puerta bajo los mismos benchmarks.

## Capacidades

- Generación de texto condicionada a contextos largos, con poda selectiva de la KV-cache para reducir memoria y cómputo durante la decodificación.
- Resumen extractivo y abstractivo de múltiples documentos, especialidad declarada del adaptador (MultiNews).
- Gestión de contexto largo mediante descarte dinámico de tokens, en lugar de truncado fijo o ventanas deslizantes.
- Integración con el ecosistema Qwen3-1.7B, por lo que hereda las capacidades del modelo base en la medida en que el LoRA no las degrade.
- Carga mediante la librería TokenGate (`from tokengate import load_model`), que aplica conjuntamente gate y LoRA.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito específicas de este adaptador.

## Casos de uso

- Resumen de expedientes y documentación corporativa extensa: el adaptador está entrenado sobre MultiNews y puede resumir conjuntos de documentos largos manteniendo solo los tokens relevantes en la KV-cache, lo que abarata el procesamiento de entradas de decenas de miles de tokens.
- Investigación en inferencia eficiente: sirve como artefacto reproducible para comparar políticas de poda de KV-cache frente a la baseline SFT publicada por el mismo autor, bajo los mismos benchmarks.
- Evaluación de LongBench: al estar entrenado sobre el par longbench_multi_news, es adecuado para reproducir experimentos de la categoría de resumen multilingüe de LongBench.
- Despliegue con restricciones de memoria: la poda de tokens reduce el tamaño efectivo de la KV-cache, lo que permite atender contextos más largos en GPUs con VRAM limitada que el modelo base sin poda no soportaría.
- Prototipado de pipelines de resumen por lotes: al partir de un modelo de 1,7 mil millones de parámetros, el coste por documento es bajo y permite procesar grandes volúmenes en hardware de gama media.
- Estudio de la interacción entre LoRA y mecanismos de atención dispersa: el par gate+LoRA permite analizar cómo la adaptación de bajo rango compensa la pérdida de información provocada por el descarte de tokens.
- Base para experimentos de destilación o ajuste posterior: el adaptador puede servir como punto de partida para tareas de resumen en dominios específicos con recetas de poda ya calibradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que este checkpoint fue el seleccionado por los benchmarks del artículo arXiv:2610.26754 por su precisión en test held-out con contexto completo, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K, ROUGE ni de las tareas de LongBench.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, un modelo de 1,7 mil millones de parámetros en FP16 requiere aproximadamente 3,4 GB solo para los pesos, a lo que hay que sumar la KV-cache (reducida por el gate) y el estado del adaptador.
- GPU recomendadas: no disponibles. Por tamaño, el modelo base cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090, así como en A100, H100 y L40S para despliegues por lotes.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base; no se especifican requisitos adicionales del gate ni del LoRA.
- Opciones de despliegue: la vía documentada es la librería TokenGate (`load_model`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al distribuirse como ficheros .pt más un LoRA, la integración con esos motores requeriría trabajo adicional.
- Latencia y throughput estimados: no disponibles. La poda de KV-cache debería reducir el coste de atención en contextos largos, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokenGate MultiNews (este) | 1,7 B + LoRA + gate | No disponible | Resumen multilingüe con poda de KV-cache | Apache 2.0 | Hugging Face (liana313) |
| tokengate-sftbase-multinews-qwen3-1.7b | 1,7 B + LoRA | No disponible | Baseline SFT sin gate, misma tarea | Apache 2.0 | Hugging Face (liana313) |
| Qwen3-1.7B | 1,7 B | Según repositorio de Qwen | Modelo generalista base | Apache 2.0 | Hugging Face (Qwen) |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador y el gate están entrenados sobre MultiNews y el emparejamiento longbench_multi_news; su comportamiento fuera de esa distribución no está validado.
- Sesgos: no documentados en la información disponible; al heredar el modelo base Qwen3-1.7B, arrastra los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño y no cuantificado para este adaptador; en resumen multilingüe el riesgo aumenta con documentos muy largos o ruidosos.
- Idiomas: no se especifican los idiomas soportados, aunque la tarea declarada es multilingüe; conviene validar el rendimiento en el idioma objetivo antes de producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-1.7B y el cumplimiento de sus términos.
- Dependencia de la librería TokenGate: el checkpoint no es un modelo autónomo; requiere el código del repositorio github.com/token-gate-llms/TokenGate y los ficheros emparejados por nombre (`gate_step24000.pt` + `lora_step24000.pt`).
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado métricas en la model card, por lo que la reproducibilidad de los resultados del artículo no está verificada de forma independiente.
- Selección de checkpoint: el paso 24000 se eligió por precisión en test held-out con contexto completo; el rendimiento con poda agresiva en producción puede diferir del reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liana313/tokengate-multinews-qwen3-1.7b
- Baseline SFT sin gate: https://huggingface.co/liana313/tokengate-sftbase-multinews-qwen3-1.7b
- Artículo: https://arxiv.org/abs/2610.26754
- Repositorio TokenGate: https://github.com/token-gate-llms/TokenGate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
