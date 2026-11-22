# Haster1137/Qwen3.8-35B

## Resumen

Qwen3.8-35B (publicado por el usuario Haster1137) es una derivación afinada del modelo base Qwen/Qwen3.8-27B, distribuida como cuantizaciones GGUF para su uso con llama.cpp. El modelo conserva la arquitectura y los datos de entrenamiento originales, pero incorpora un ajuste fino orientado a reducir el comportamiento de rechazo (refusal) y a potenciar capacidades de ciberseguridad y generación de código. Se publica bajo licencia Apache 2.0, heredada del modelo base.

El modelo tiene 35.505.251.456 parámetros según los datos de safetensors, aunque la model card indica que el modelo base es Qwen/Qwen3.8-27B, lo que genera una discrepancia no aclarada en la documentación. El repositorio ocupa 66,8 GB e incluye el cabezal de predicción multi-token (MTP) verificado para decodificación especulativa, una innovación que permite acelerar la inferencia en llama.cpp.

Su relevancia actual radica en dos aspectos: por un lado, ofrece una variante con menor tasa de rechazo para tareas de seguridad ofensiva y análisis de vulnerabilidades; por otro, demuestra que el cabezal MTP sobrevive a cuantizaciones agresivas (2 bits) al fijarse en q8_0, lo que mantiene las ganancias de decodificación especulativa incluso en despliegues con VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; detalles no disponibles) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ4_XS, Q6_K, Q8_0 (mencionados en la model card) |
| Idiomas soportados | en, zh (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors como referencia de parametros) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.8-27B, del que este modelo es una cuantización afinada. La model card no detalla la arquitectura interna (número de capas, dimensiones, tipo de atención), por lo que no se dispone de información específica sobre si emplea atención lineal, MoE o alguna variante híbrida. Se confirma que el modelo conserva el cabezal de predicción multi-token (MTP) del base, lo que habilita decodificación especulativa en llama.cpp a partir del PR #22673.

El ajuste fino se realizó sobre aproximadamente 487,6 GB de un conjunto de datos curado para capacidades de hacking de vulnerabilidades de ciberseguridad, con predominio de código y destilación desde "Fable 5.1". No se especifican el número de tokens, la composición exacta del dataset ni si se emplearon RLHF o DPO. La model card reporta métricas de comportamiento: la tasa de rechazo sobre 100 prompts dañinos de `mlabonne/harmful_behaviors` (test split) se sitúa en 12/100 para el punto publicado, con una divergencia KL de 0,1191 frente al modelo base. Se advierte que estas métricas se midieron en modo sin pensamiento (non-thinking) y sobre el merge en bf16, no sobre las cuantizaciones descargables.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Generación y análisis de código, con especial énfasis en ciberseguridad y análisis de vulnerabilidades.
- Razonamiento multi-paso y soporte de agentes (pipeline_tag incluye `agent`).
- Decodificación especulativa mediante cabezal MTP retenido y verificado.
- Modo de pensamiento (`<think>`) presente en la plantilla de chat, aunque las evaluaciones de rechazo se realizaron cerrando explícitamente dicho bloque.
- Comportamiento de rechazo sustancialmente reducido (no eliminado) frente al modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Análisis de vulnerabilidades en auditorías de seguridad: el modelo puede revisar fragmentos de código y sugerir vectores de ataque o debilidades, gracias al ajuste fino sobre datasets de ciberseguridad y su menor tasa de rechazo en solicitudes dañinas.
- Generación de código en pipelines de CI/CD: su énfasis en código y su compatibilidad con llama.cpp permiten integrarlo en herramientas de revisión automática o generación de parches, con decodificación especulativa MTP para reducir latencia.
- Asistencia en investigación de exploits en entornos controlados: la reducción de rechazos facilita el estudio de técnicas ofensivas en laboratorios de seguridad, siempre bajo las restricciones de la licencia Apache 2.0 y las políticas de uso aceptable del modelo base.
- Despliegue en hardware de consumo: las cuantizaciones IQ2_M e IQ4_XS permiten ejecutar el modelo en GPUs con VRAM limitada, manteniendo el cabezal MTP funcional para acelerar la generación.
- Chat multi-turno en inglés y chino: el modelo soporta conversaciones en ambos idiomas, adecuado para asistentes técnicos bilingües en entornos de desarrollo.
- Evaluación comparativa de robustez y sesgos: investigadores pueden usar las métricas de rechazo y KL divergence publicadas para estudiar el equilibrio entre alineación y capacidades en modelos derivados.
- Prototipado de agentes autónomos: la etiqueta `agent` y el soporte de razonamiento multi-paso permiten construir flujos de trabajo que encadenan llamadas al modelo con herramientas externas, aunque no se documenta tool calling nativo.

## Benchmarks y rendimiento

La model card reporta una caída media de 0,5 puntos frente al modelo base en MMLU, ARC-Challenge, HellaSwag y Winogrande. No se proporcionan los valores absolutos de estos benchmarks ni resultados de evaluaciones generativas, matemáticas, de código o multilingües.

Rendimiento de decodificación especulativa (medido en NVIDIA H200 NVL, 256 tokens generados, mediana de 3 repeticiones, cuantización IQ2_M):

| Prompt | spec_type | n_max | tok/s | vs baseline |
|---|---|---|---|---|
| prose | none | - | 75,4 | 1,00x |
| prose | draft-mtp | 1 | 85,2 | 1,13x |
| prose | draft-mtp | 2 | 83,2 | 1,10x |
| prose | draft-mtp | 3 | 77,4 | 1,03x |
| code | none | - | 75,5 | 1,00x |
| code | draft-mtp | 1 | 95,8 | 1,27x |
| code | draft-mtp | 2 | 99,8 | 1,32x |
| code | draft-mtp | 3 | 96,0 | 1,27x |
| chat | none | - | 75,3 | 1,00x |
| chat | draft-mtp | 1 | 87,4 | 1,16x |
| chat | draft-mtp | 2 | 81,3 | 1,08x |
| chat | draft-mtp | 3 | 78,4 | 1,04x |

La model card también incluye una tabla anterior (hardware no registrado) con tasas absolutas de 74,8 tok/s en prosa, 74,7 en código y 74,7 en chat como baseline, y ganancias de hasta 1,28x en código con n_max=1.

## Requisitos de hardware

- VRAM estimada: el archivo fusionado IQ2_M requiere 10,6 GB de pesos; la configuración separada noMTP-IQ2_M más draft-Q8_0 requiere 13,3 GB. Para Q6_K y Q8_0 no se especifican tamaños, pero el repositorio completo ocupa 66,8 GB.
- GPU recomendadas: NVIDIA H200 NVL es la hardware de referencia para las mediciones de throughput. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: las cuantizaciones IQ2_M e IQ4_XS están pensadas para VRAM limitada, aunque la model card advierte que IQ2_M es la que más agrava la inestabilidad en el límite de rechazo.
- Opciones de despliegue: llama.cpp (requiere builds posteriores al PR #22673 para no ignorar los tensores MTP). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 75,4 tok/s baseline en prosa y hasta 99,8 tok/s en código con MTP n_max=2 sobre H200 NVL con IQ2_M. La configuración separada noMTP-IQ2_M + draft-Q8_0 alcanza 97,7 tok/s en prosa con n_max=2 (1,30x).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Haster1137/Qwen3.8-35B | 35.505.251.456 | no disponible | Apache 2.0 | GGUF | Ajuste fino para reducir rechazos, MTP retenido |
| Qwen/Qwen3.8-27B (base) | 27B (según model card) | no disponible | Apache 2.0 | safetensors | Modelo original, mayor tasa de rechazo, sin ajuste de ciberseguridad |
| Otras variantes Qwen3.8 cuantizadas | no disponible | no disponible | Apache 2.0 | GGUF | No se dispone de datos comparativos en la información proporcionada |

No se han proporcionado datos de benchmarks comparativos con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Los rechazos están reducidos, no eliminados: 12/100 en el punto publicado sobre prompts dañinos, con una fracción significativa que aún se rechaza.
- El comportamiento cerca del antiguo límite de rechazo es menos estable que en el modelo base.
- Las cuantizaciones bajas agravan la inestabilidad; IQ2_M es la más afectada. Se recomienda evaluar el comportamiento en Q6_K o Q8_0, no en IQ2_M o IQ4_XS.
- Las métricas de rechazo se midieron en modo sin pensamiento y sobre el merge en bf16, no sobre los archivos cuantizados descargables.
- La evaluación de rechazo se limita a 100 prompts de un único dataset; no generaliza a otras distribuciones de solicitudes dañinas.
- La perplejidad reportada es solo sobre wikitext-2 y detecta daño grueso por cuantización, no pérdida de capacidades en razonamiento, código o multilingüe.
- Caída media de 0,5 puntos frente al base en MMLU, ARC-Challenge, HellaSwag y Winogrande; no se ejecutaron evaluaciones generativas, matemáticas, de código ni multilingües.
- Existe una discrepancia no aclarada entre los 35.505.251.456 parámetros reportados y el modelo base Qwen3.8-27B citado en la model card.
- Licencia Apache 2.0, pero la licencia y política de uso aceptable del modelo base siguen aplicándose.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- El ajuste fino sobre datasets de ciberseguridad ofensiva puede conllevar implicaciones legales y éticas en determinadas jurisdicciones.

## Enlaces

- Hugging Face: https://huggingface.co/Haster1137/Qwen3.8-35B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- PR de llama.cpp con soporte MTP: https://github.com/ggml-org/llama.cpp/pull/22673
- Dataset de evaluación de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
