# opticsWolf/laya-english-fp32-onnx

## Resumen

`opticsWolf/laya-english-fp32-onnx` es una exportación a ONNX en precisión FP32 del checkpoint base en inglés del modelo `convaiinnovations/laya`, publicada por el usuario opticsWolf. No se trata de un modelo nuevo ni de un fine-tune, sino de un artefacto de despliegue: un grafo único de ONNX Runtime pensado para servir el modelo Laya original en entornos de producción sin depender de PyTorch. El modelo subyacente, Laya, está orientado a toma de decisiones (decision-making) y clasificación zero-shot, con una arquitectura de agente que expone dos cabezas de salida: `logits` y `act_logits`.

La relevancia de esta publicación es fundamentalmente de infraestructura: permite ejecutar Laya con ONNX Runtime en CPU o GPU con una paridad numérica respecto a PyTorch de 4.7e-6 en la cabeza `logits`, lo que la hace útil para trabajos de embeddings, compatibilidad e integración en pipelines que ya usan ONNX. El propio autor advierte en la model card que el checkpoint base tiene un rendimiento cercano al azar en decisiones tipadas (0.357), por lo que este export no debe emplearse como clasificador; para esa tarea existe el checkpoint hermano de decisiones tipadas.

El repositorio ocupa 3.0 GB e incluye el grafo ONNX, el sidecar de pesos, el tokenizador y la configuración del agente RL sin modificar respecto al upstream. La licencia es Apache-2.0 y el formato de pesos es exclusivamente ONNX (no hay safetensors ni GGUF).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer exportado a grafo único ONNX (opset 18, 1833 nodos, sin operadores no estándar); arquitectura interna del modelo base no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | `max_len` 512, `head_max_len` 192 (configuración del export) |
| Tipos de cuantizacion | FP32 (este repo), FP16 (variante `laya-base-fp16.onnx`), q8 (variante publicada); int8 dinámico medido y rechazado |
| Idiomas soportados | inglés (variante English del checkpoint base) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`laya-base-fp32.onnx` + `laya-base-fp32.onnx.data`, 1.69 GB), `tokenizer.json`, `rl_agent_config.json` |

## Arquitectura y entrenamiento

El artefacto es una exportación fiel del checkpoint base `convaiinnovations/laya` (revisión `55cf4c4e`) a un grafo único de ONNX Runtime en FP32. El grafo usa la forma de cinco entradas con marcador y produce dos salidas, `logits` y `act_logits`, coherente con un modelo de agente con cabeza de decisión. El grafo tiene 1833 nodos en opset 18 y no emplea operadores no estándar, lo que garantiza portabilidad entre ejecutores de ONNX Runtime. La paridad torch↔ORT medida es de un máximo de 4.7e-6 en `logits` sobre CPU; en CUDA EP se observa una deriva de 3.2e-3 atribuida al orden de kernels, por lo que los goldens de validación se mantienen solo en CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; la presencia de `rl_agent_config.json` sugiere un componente de agente entrenado con refuerzo, pero el detalle no está en la información proporcionada. La innovación técnica destacable de esta publicación es el propio proceso de exportación y validación: se midió y rechazó la cuantización int8 dinámica (deriva de 2.8 a 5.4 en la escala de logits con 3 de 4 flips de argmax en la sonda), concluyendo que la cabeza de logits enmascarados requiere cuantización estática con calibración. La variante FP16 mantiene las E/S en FP32 y no aporta ganancia en CPU, por lo que está pensada solo para CUDA.

## Capacidades

- Clasificación zero-shot y toma de decisiones tipadas (pipeline declarado: `zero-shot-classification`), aunque con la salvedad de calidad del checkpoint base.
- Generación de representaciones/embeddings para tareas de compatibilidad e integración.
- Salida dual `logits` + `act_logits` para flujos de agente con selección de acción.
- Ejecución en ONNX Runtime con CPU y CUDA Execution Provider.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: parcial, vía configuración de agente RL (`rl_agent_config.json`), sin detalle funcional.
- Capacidades multilingües: limitadas al inglés en esta variante.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Integración en pipelines ONNX existentes: equipos que ya sirven modelos con ONNX Runtime pueden cargar este grafo sin añadir una dependencia de PyTorch, manteniendo la paridad numérica de 4.7e-6 respecto al original.
- Extracción de embeddings y representaciones: el checkpoint base es adecuado para trabajo de embeddings y compatibilidad, según indica el propio autor, lo que encaja en sistemas de búsqueda semántica o clustering sobre textos en inglés.
- Validación de portabilidad de modelos: sirve como referencia para verificar que una exportación ONNX reproduce fielmente el comportamiento del checkpoint PyTorch antes de desplegar variantes cuantizadas.
- Despliegue en CPU de bajo coste: con ~220 ms por lote de 4 filas en CPU, es viable para tareas por lotes no interactivas donde la latencia no es crítica.
- Enrutamiento en GPU: con ~15 ms por lote de 4 filas en CUDA (RTX 3090), puede usarse como componente de routing o scoring dentro de un sistema mayor que ya disponga de GPU.
- Base para experimentación con cuantización: el repositorio documenta las mediciones de FP16 y q8, lo que lo convierte en un punto de partida para estudiar cuantización estática con calibración sobre la cabeza de logits enmascarados.
- Compatibilidad con el ecosistema Laya: permite ejecutar el agente Laya en entornos ONNX Runtime respetando la forma de cinco entradas y las dos salidas esperadas por `ONNXAgent`.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Grafo | opset 18, 1833 nodos, cero operadores no estándar |
| Paridad torch↔ORT (CPU) | max\|Δ\| 4.7e-6 en `logits` |
| Latencia CPU | ~220 ms por lote de 4 filas (solo tier lento) |
| Latencia CUDA | ~15 ms por lote de 4 filas (RTX 3090 + Ryzen 9 5950X) |
| Deriva CUDA EP | 3.2e-3 (orden de kernels) |
| FP16 paridad torch-ORT | max abs drift 2.9e-3 en `logits` (CPU; CUDA con deriva comparable) |
| FP16 latencia CPU | ~227 ms (sin mejora, solo CUDA) |
| FP16 latencia CUDA | ~11-23 ms (sensible al reloj; repetición controlada pendiente) |
| q8 | peor caso 0.022, 0 flips, 7/7 goldens coinciden |
| Zero-shot en decisiones tipadas (checkpoint base) | 0.357 (cercano al azar) |
| Decisiones tipadas (checkpoint hermano) | 0.767 frente a Jev 0.727 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el sidecar de pesos FP32 ocupa 1.69 GB, por lo que la inferencia en FP32 requiere aproximadamente 2-3 GB de VRAM o RAM según el lote; la variante FP16 reduce a la mitad la descarga y la VRAM.
- GPU recomendadas: RTX 3090 medida como referencia (~15 ms por lote de 4 filas en FP32, ~11-23 ms en FP16). Cualquier GPU con soporte CUDA EP de ONNX Runtime es apta; A100 y H100 no están medidas en la información disponible.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8 GB o más; el límite práctico es el lote y la longitud de contexto (512 tokens).
- Opciones de despliegue: ONNX Runtime (CPU EP y CUDA EP), mediante `laya.onnx_agent.ONNXAgent`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en esta publicación.
- Latencia y throughput: ~220 ms por lote de 4 filas en CPU y ~15 ms por lote de 4 filas en CUDA (FP32); FP16 en CPU no mejora (~227 ms) y en CUDA queda en ~11-23 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| opticsWolf/laya-english-fp32-onnx | no disponible | 512 (`max_len`) | Zero-shot / decisiones | Apache-2.0 | ONNX FP32 |
| opticsWolf/laya-typed-decisions-fp32-onnx | no disponible | no disponible | Decisiones tipadas (0.767) | Apache-2.0 (según repo hermano) | ONNX FP32 |
| convaiinnovations/laya (base) | no disponible | no disponible | Agente / decisiones | Apache-2.0 | PyTorch (upstream) |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores en la misma categoría.

## Limitaciones y advertencias

- Calidad insuficiente para clasificación: el checkpoint base obtiene 0.357 en decisiones tipadas zero-shot, cercano al azar; el autor desaconseja explícitamente usarlo como clasificador y remite al checkpoint de decisiones tipadas.
- Deriva en CUDA: la paridad de 4.7e-6 solo se garantiza en CPU; en CUDA EP la deriva es de 3.2e-3 por el orden de kernels, y los goldens de validación son solo CPU.
- Cuantización int8 dinámica descartada: provoca derivas de 2.8 a 5.4 en la escala de logits y flips de argmax; requiere cuantización estática con calibración.
- FP16 sin ganancia en CPU: la variante FP16 está pensada exclusivamente para CUDA.
- Contexto limitado: `max_len` 512 y `head_max_len` 192 restringen las entradas a textos cortos.
- Idioma: solo inglés en esta variante; no hay soporte multilingüe documentado.
- Sesgos y alucinación: no hay información publicada sobre sesgos conocidos ni tasas de alucinación en la información disponible.
- Uso comercial: permitido por la licencia Apache-2.0, sin restricciones adicionales documentadas.
- Madurez: repositorio con 0 descargas y 0 likes, creado en octubre de 2026; sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/opticsWolf/laya-english-fp32-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio hermano (decisiones tipadas): https://huggingface.co/opticsWolf/laya-typed-decisions-fp32-onnx
