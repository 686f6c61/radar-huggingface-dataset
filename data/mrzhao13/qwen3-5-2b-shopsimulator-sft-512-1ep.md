# mrzhao13/qwen3.5-2b-shopsimulator-sft-512-1ep

## Resumen

`mrzhao13/qwen3.5-2b-shopsimulator-sft-512-1ep` es un ajuste fino supervisado (SFT) del modelo multimodal `Qwen/Qwen3.5-2B`, desarrollado por el usuario mrzhao13. El objetivo es especializar el modelo en la resolución de tareas de agente de compras dentro del entorno de simulación ShopSimulator, un escenario chino de comercio electrónico que exige interpretar preferencias del usuario, mantener diálogos multi‑turno y discriminar entre productos muy similares. El ajuste se realizó sobre trayectorias de éxito generadas por un profesor (deepseek‑v4‑flash) y cubre 512 tareas, de las cuales se aceptaron 412 (80,47 % de cobertura).

El modelo conserva la arquitectura original de Qwen3.5‑2B (visión‑lenguaje), pero el entrenamiento se hizo exclusivamente con texto; las capacidades visuales no fueron entrenadas ni evaluadas. Con 1.881.825.088 parámetros (~1,88 B), es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en demostrar que un ajuste fino dirigido puede elevar drásticamente el rendimiento en tareas de agente de compras: pasa de un 2,0 % a un 72,5 % en recompensa positiva (pass@1) respecto al modelo base, según la evaluación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión‑lenguaje), basada en Qwen3.5‑2B |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo más largo en entrenamiento fue de 8.162 tokens; el máximo por GPU fue 12.288) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible con herramientas externas) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache‑2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B`, un modelo de la serie Qwen3.5 que integra de forma nativa visión y lenguaje mediante entrenamiento temprano de fusión sobre billones de tokens multimodales. El ajuste fino se realizó con el framework Slime junto con Megatron‑LM, utilizando una sola época sobre 6.153 ejemplos de SFT a nivel de turno, extraídos de 412 trayectorias aceptadas de ShopSimulator. El profesor fue `deepseek-v4-flash` con el modo de pensamiento desactivado. Se empleó una máscara de pérdida específica de Qwen3.5 para turnos múltiples, excluyendo bloques de pensamiento vacíos inyectados por la plantilla. El entrenamiento usó un batch global de 3, una tasa de aprendizaje de 1e‑5 y 2.051 pasos de optimizador, en una NVIDIA Pro 6000D de 84 GB. No se aplicaron técnicas de RLHF ni DPO; el proceso fue puramente SFT.

## Capacidades

- Generación de texto y razonamiento conversacional en chino, orientado a tareas de agente de compras.
- Soporte de tool‑use y llamadas a funciones, necesario para interactuar con el entorno ShopSimulator.
- Manejo de diálogos multi‑turno con contexto largo (hasta al menos 8.162 tokens en entrenamiento).
- Capacidad de seguir instrucciones de usuario para buscar, comparar y seleccionar productos.
- Conserva la arquitectura multimodal original, aunque las capacidades visuales no fueron entrenadas ni evaluadas en este experimento.
- No se ha verificado el rendimiento en tareas generales de razonamiento, código o matemáticas fuera del dominio de compras.

## Casos de uso

- Desarrollo de agentes de compra en entornos simulados: el modelo puede integrarse en el entorno ShopSimulator para probar políticas de recomendación, precios o interacción con el usuario, gracias a su entrenamiento específico en trayectorias de éxito.
- Evaluación de modelos de agente en comercio electrónico: sirve como baseline ajustado para comparar estrategias de RL o SFT en tareas de compra, ya que supera ampliamente al modelo base en métricas de recompensa.
- Prototipado de asistentes de compra en chino: aunque no está listo para producción, puede usarse para generar conversaciones de prueba y validar flujos de diálogo en tiendas online simuladas.
- Investigación en aprendizaje por refuerzo: al ser un checkpoint SFT, puede servir como punto de partida para entrenar políticas con RL, dado que ya ha aprendido comportamientos de éxito.
- Generación de datos sintéticos de interacción de compra: el modelo puede producir trayectorias de diálogo que luego se usen para entrenar otros modelos o para aumentar datasets.
- Benchmarking de entornos de simulación: permite comparar el rendimiento de diferentes arquitecturas en el mismo entorno, usando las métricas reportadas (pass@1, recompensa media).

## Benchmarks y rendimiento

La evaluación se realizó en el entorno ShopSimulator con el mismo servicio modificado, generación de precios determinista, el subconjunto `official_test_200` y una sola ejecución por tarea. Los resultados son estimaciones puntuales k=1, sin intervalos de incertidumbre.

| Modelo | Positive‑reward pass@1 | Strict‑success pass@1 | mean@1 `r_loose` | mean@1 `r_hard` |
| --- | ---: | ---: | ---: | ---: |
| Qwen3.5-2B (base) | 2,0 % | 0,0 % | 0,004286 | 0,000000 |
| Este checkpoint SFT | 72,5 % | 10,5 % | 0,389829 | 0,124417 |

No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener ~1,88 B parámetros, en FP16 ocupa aproximadamente 3,8 GB; en INT8 ~1,9 GB; en INT4 ~1 GB. Estas cifras son estimaciones orientativas, no mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (p. ej., RTX 3050, RTX 3060, RTX 4060). Para mayor velocidad, una RTX 4090 o A100 es adecuada.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama media con cuantización.
- Opciones de despliegue: compatible con Transformers (Hugging Face). Puede usarse con vLLM, llama.cpp u Ollama si soportan la arquitectura Qwen3.5; no se ha verificado explícitamente.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización; al ser un modelo pequeño, se espera una latencia baja en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
| --- | --- | --- | --- | --- |
| Qwen3.5-2B (base) | ~2 B | no disponible | Apache‑2.0 | Multimodal general |
| Este checkpoint SFT | ~1,88 B | no disponible | Apache‑2.0 | Agente de compras en chino |
| Qwen3.5-397B-A17B | 397 B (17 B activos) | no disponible | Apache‑2.0 | Multimodal general, agente |

No se dispone de otros modelos ajustados específicamente para ShopSimulator en el momento de redactar esta ficha. La comparación principal es con el modelo base, que muestra una mejora sustancial en las métricas de compra tras el SFT.

## Limitaciones y advertencias

- Entrenado únicamente con trayectorias chinas de ShopSimulator; no se ha evaluado en otros idiomas ni dominios.
- Evaluado solo en el entorno ShopSimulator modificado (con parche de precios determinista); los resultados no son directamente comparables con el entorno original sin parche.
- Las capacidades visuales no fueron entrenadas ni evaluadas; el modelo puede comportarse de forma impredecible ante entradas de imagen.
- No se ha evaluado la seguridad del despliegue, el seguimiento general de instrucciones ni el comportamiento fuera del dominio de compras.
- El contenido generado por el profesor (deepseek‑v4‑flash) puede contener errores, que el modelo podría haber aprendido.
- La licencia Apache‑2.0 cubre los pesos del modelo, pero no otorga derechos sobre el contenido de las tareas o el entorno de ShopSimulator, cuya redistribución está pendiente de aclaración.
- El dataset de entrenamiento es privado; no se puede auditar la composición exacta de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrzhao13/qwen3.5-2b-shopsimulator-sft-512-1ep
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper de ShopSimulator (arXiv): https://arxiv.org/abs/2601.18225
- Repositorio de ShopSimulator (GitHub): https://github.com/ShopAgent-Team/ShopSimulator
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio de referencia de Qwen3.5 (GitHub): https://github.com/ABDtmx/Qwen3.5
