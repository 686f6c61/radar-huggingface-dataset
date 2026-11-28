# ermiaazarkhalili/Gemma4-E2B-Function-Calling-xLAM-GGUF

## Resumen

Gemma4-E2B-Function-Calling-xLAM-GGUF es una familia de cuantizaciones GGUF de un ajuste fino supervisado (SFT) del modelo `google/gemma-4-E2B-it`. El ajuste se realizó mediante LoRA con PEFT y TRL sobre el conjunto de datos `Salesforce/xlam-function-calling-60k`, orientado específicamente a la invocación de funciones (function calling). El autor del ajuste y de las cuantizaciones es el usuario de Hugging Face `ermiaazarkhalili`.

El modelo base pertenece a la familia Gemma 4 de Google, en su variante E2B (orientada a eficiencia, con aproximadamente 4.628 millones de parámetros según los pesos en safetensors del repositorio). El ajuste busca especializar ese modelo generalista en la generación estructurada de llamadas a herramientas, un caso de uso crítico para agentes y pipelines de automatización.

La relevancia de esta ficha radica en que ofrece una vía de despliegue local y ligera (entre 2,98 GB y 4,95 GB según cuantización) para un modelo especializado en function calling, ejecutable con llama.cpp u Ollama en hardware de consumo. No obstante, el autor no ha publicado ninguna evaluación de benchmarks: los únicos datos reportados son observaciones de pérdida durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base `google/gemma-4-E2B-it`; detalles no disponibles) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q2_k, q3_k_m, q4_k_m, q5_k_m, q6_k, q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (cuantizado); pesos completos en el repositorio `ermiaazarkhalili/Gemma4-E2B-Function-Calling-xLAM` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA del modelo base `google/gemma-4-E2B-it`, realizado con PEFT y TRL mediante SFT (supervised fine-tuning). Los adaptadores LoRA se fusionaron en los pesos base, por lo que el modelo resultante no puede separarse del ajuste fino. Los datos de entrenamiento provienen íntegramente del conjunto `Salesforce/xlam-function-calling-60k`, un dataset de invocación de funciones.

El entrenamiento se ejecutó de forma no interactiva con papermill a partir del cuaderno `notebooks/xlam_function_calling_gemma4-e2b.ipynb`, en una partición SLURM con GPUs H100. La configuración detallada del entrenamiento (hiperparámetros, número de pasos, composición exacta del dataset) se encuentra en la model card del repositorio de pesos completos, no en este repositorio de cuantizaciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto e instrucciones heredadas del modelo base `gemma-4-E2B-it`.
- Invocación de funciones (function calling) especializada mediante SFT sobre `Salesforce/xlam-function-calling-60k`.
- Generación de llamadas estructuradas a herramientas, presumiblemente en formato JSON (no especificado en la información disponible).
- Capacidades multilingües: no disponibles (los idiomas no están documentados).
- Razonamiento multi-paso y soporte de agentes: no documentado explícitamente; la especialización en function calling sugiere uso en pipelines de agentes, pero no hay evidencia publicada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Agentes de automatización de tareas: el modelo puede generar llamadas a funciones para orquestar herramientas en un pipeline de agente, gracias a su especialización en el dataset xLAM de function calling.
- Integración en asistentes de código: puede invocar herramientas de análisis estático, ejecución de tests o consulta a APIs desde un IDE, al haber sido entrenado para producir llamadas estructuradas.
- Automatización de flujos RPA: el modelo traduce instrucciones en lenguaje natural a invocaciones de funciones concretas, adecuado para sustituir reglas heurísticas en automatizaciones.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 2,98 GB a 4,95 GB, puede ejecutarse con llama.cpp u Ollama en portátiles y equipos de consumo, útil para prototipado sin dependencia de la nube.
- Enrutamiento de consultas a APIs: el modelo puede clasificar la intención del usuario y seleccionar la función o endpoint adecuado en un backend de microservicios.
- Pruebas de concepto de function calling en investigación: sirve como referencia ligera para comparar estrategias de SFT sobre datasets de invocación de funciones, dado su tamaño reducido y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación de benchmarks sobre este checkpoint y que los únicos números reportados son observaciones de pérdida durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-5 GB según cuantización (q2_k: 2,98 GB; q3_k_m: 3,19 GB; q4_k_m: 3,42 GB; q5_k_m: 3,62 GB; q6_k: 3,83 GB; q8_0: 4,95 GB), más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones bajas; H100 para el entrenamiento original (según la model card).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090, entre otras, usando cuantizaciones q4_k_m o superiores.
- Opciones de despliegue: llama.cpp (`llama-cli`) y Ollama (creando un Modelfile a partir del GGUF). Otras opciones como vLLM o TGI no están documentadas para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente sobre modelos comparables en la documentación proporcionada. Se indica "no disponible" para una comparativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma4-E2B-Function-Calling-xLAM-GGUF | 4.628.569.635 | no disponible | apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación de benchmarks sobre este checkpoint; el rendimiento real en function calling es desconocido más allá de la pérdida de entrenamiento.
- Hereda los sesgos, el corte de conocimiento y los modos de fallo del modelo base `google/gemma-4-E2B-it`.
- El ajuste fino se realizó sobre un único dataset de instrucciones (xLAM); el comportamiento fuera de esa distribución no está probado.
- Los adaptadores LoRA se fusionaron en los pesos base, por lo que el modelo no puede separarse del ajuste fino.
- Los idiomas soportados no están documentados; se desconoce el comportamiento multilingüe.
- La licencia apache-2.0 se hereda del modelo base, pero conviene verificar las condiciones de uso comercial del modelo Gemma original de Google.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- La longitud de contexto no está documentada en esta ficha; debe consultarse la model card del modelo base.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ermiaazarkhalili/Gemma4-E2B-Function-Calling-xLAM-GGUF
- Repositorio de pesos completos: https://huggingface.co/ermiaazarkhalili/Gemma4-E2B-Function-Calling-xLAM
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
