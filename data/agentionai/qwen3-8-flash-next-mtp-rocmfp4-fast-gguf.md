# agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF

## Resumen

Este repositorio contiene la cabeza de predicción multi-token (MTP, del inglés *multi-token prediction*) del modelo Qwen/Qwen3.8-Flash-Next, cuantizada en formato ROCmFP4 y distribuida como GGUF. La cabeza MTP es un componente auxiliar entrenado conjuntamente con el modelo principal para la decodificación especulativa: genera varios tokens candidatos de forma barata y el modelo grande los verifica, acelerando la inferencia total. No es un modelo autónomo, sino un *draft head* que debe usarse junto al modelo base cuantizado `agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF`.

El proyecto lo mantiene el usuario `agentionai` y se apoya en un branch experimental de llama.cpp que implementa soporte para la arquitectura Qwen4 y los tipos de cuantización ROCmFP4. La cabeza tiene 3.878.549.248 parámetros (aproximadamente 3,88 mil millones) y ocupa 2,28 GiB en disco. Su licencia es Qwen Community 1.0, la misma que el modelo base. Este componente está pensado para usuarios que ya ejecutan el modelo principal en hardware AMD con soporte Vulkan y buscan un incremento de rendimiento adicional mediante decodificación especulativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) con MoE de 512 expertos |
| Parametros totales | 3.878.549.248 (3,88B) |
| Parametros activos | no disponible (la cabeza no especifica el número de expertos activos) |
| Longitud de contexto | no disponible (el modelo base soporta 262K tokens; el ejemplo de uso emplea -c 32768) |
| Tipos de cuantizacion | ROCmFP4 (principal), Q8_0 (probado, peor rendimiento) |
| Idiomas soportados | no disponible (hereda del modelo base Qwen3.8-Flash-Next) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

La cabeza MTP se entrena conjuntamente con el modelo objetivo Qwen3.8-Flash-Next, por lo que aprende a predecir los siguientes tokens de forma alineada con las predicciones del modelo grande. Según la model card, la cabeza tiene su propia arquitectura MoE con 512 expertos, lo que la hace más pesada que un modelo pequeño convencional: cada token adicional que genera supone un paso de forward completo, y por eso el ajuste adaptativo del número de tokens a predecir (adaptive drafting) resultó contraproducente en las pruebas realizadas.

El modelo base Qwen3.8-Flash-Next es un MoE ultra-disperso de 125B parámetros con 6B activos por token, que combina Gated DeltaNet (tres de cada cuatro capas) con Qwen Sparse Attention para la cuarta capa, y un contexto nativo de 262K tokens. La cabeza MTP hereda esta arquitectura híbrida, aunque no se especifican los detalles de su entrenamiento (número de tokens, dataset o pipeline de RLHF). El cuantizado ROCmFP4 fue portado manualmente del repositorio ciru-ai/ROCmFPX y se calibró para que coincidiera con el modelo objetivo, evitando desalineaciones entre el draft y el target.

## Capacidades

- Predicción multi-token: la cabeza genera hasta 3 tokens candidatos por paso de decodificación especulativa, reduciendo el número de pasos de inferencia del modelo principal.
- Integración con decodificación especulativa en llama.cpp: funciona como un modelo de draft separado, cargado junto al modelo principal mediante los parámetros `-md` y `--spec-type draft-mtp`.
- Aceleración de inferencia en hardware AMD: probado en una Radeon 8060S (Ryzen AI MAX+ 395) con Vulkan, logrando un aumento de 28,1 t/s a 32,4 t/s con `--spec-draft-n-max 3`.
- Sin capacidades propias de generación, razonamiento, código, visión o tool calling: es un componente de aceleración, no un modelo conversacional.
- Soporte de cuantización ROCmFP4: formato específico para GPUs AMD con soporte Vulkan, no disponible en el llama.cpp estándar.

## Casos de uso

- **Aceleración de inferencia en servidores con GPUs AMD**: la cabeza MTP se usa junto al modelo Qwen3.8-Flash-Next cuantizado para reducir la latencia de generación en entornos de producción que ya usan llama.cpp con Vulkan. El aumento de 28,1 a 32,4 t/s (15%) justifica su uso en cargas de trabajo con alta demanda de tokens por segundo.
- **Despliegue en dispositivos con memoria unificada**: el modelo base puede ejecutarse en un Ryzen AI MAX+ 395 con 128 GB de memoria unificada; la cabeza añade solo 2,3 GiB, por lo que es viable en sistemas de gama alta sin GPU dedicada.
- **Investigación en decodificación especulativa**: sirve como referencia para evaluar el rendimiento de cabezas MTP entrenadas conjuntamente frente a modelos de draft separados. Los datos de la model card (aceptación, t/s) son útiles para comparar estrategias.
- **Pruebas de cuantización ROCmFP4**: el repositorio es un caso práctico de cuantización de un componente auxiliar para alinear el draft con el target, útil para quienes estudian la interacción entre cuantización y decodificación especulativa.
- **Despliegue en entornos de desarrollo con llama.cpp experimental**: para desarrolladores que trabajan con el branch `vulkan/qwen4exp-rocmfpx` y necesitan optimizar la inferencia del modelo Qwen3.8-Flash-Next en hardware AMD, esta cabeza es el componente de draft recomendado por el autor.
- **Evaluación de trade-offs entre tamaño y rendimiento**: al comparar el draft ROCmFP4 con un draft Q8_0, se observa que un draft más pesado no siempre mejora la aceptación; este caso de uso permite analizar el equilibrio entre memoria y velocidad en configuraciones de inferencia.

## Benchmarks y rendimiento

La model card proporciona mediciones en una Radeon 8060S (Ryzen AI MAX+ 395) con 250 tokens a temperatura 0, con cada configuración calentada previamente:

| Configuracion | t/s | Aceptacion |
|---|---|---|
| Sin draft | 28,1 | -- |
| draft n-max 2 | 31,8 | 0,695 |
| draft n-max 3 | 32,4 | 0,612 |
| draft Q8_0 (n-max 3) | 30,3 | 0,587 |
| draft adaptativo | 28,4 | 0,468 |

La aceptación se define como la fracción de tokens propuestos por el draft que el modelo principal acepta. Los resultados indican que el cuantizado ROCmFP4 ofrece mejor rendimiento que Q8_0, y que el drafting adaptativo es perjudicial debido al coste de la MoE interna.

## Requisitos de hardware

- **VRAM**: el head añade aproximadamente 2,3 GiB a los ~85 GiB que consume el modelo principal Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF. No es viable en GPUs de consumo (8-24 GiB) sin el modelo principal.
- **GPU recomendadas**: AMD Radeon 8060S (probada), otras GPUs AMD con soporte Vulkan y memoria unificada (p.ej. Ryzen AI MAX+ 395). No se ha probado en NVIDIA.
- **Sistema operativo**: Linux con Vulkan (se requiere `-DGGML_VULKAN=ON`).
- **Opciones de despliegue**: llama.cpp (branch específico `vulkan/qwen4exp-rocmfpx`). No es compatible con vLLM, TGI ni Ollama sin adaptación.
- **Latencia y throughput**: en la prueba, 32,4 t/s con `--spec-draft-n-max 3` en la Radeon 8060S. Sin el head, 28,1 t/s.

## Comparativa con modelos similares

No hay una comparativa directa disponible en la información proporcionada. Este componente es único para el modelo Qwen3.8-Flash-Next y no existe una alternativa equivalente en el ecosistema. Se podría comparar con estrategias de decodificación especulativa que usan modelos de draft pequeños (p.ej. Qwen2.5-0.6B), pero no hay datos de rendimiento para esas alternativas en este contexto. Por tanto, la comparativa se limita a las mediciones internas del propio autor.

## Limitaciones y advertencias

- **No es un modelo autónomo**: sin el modelo principal `Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF`, no produce ningún texto. Su única función es acelerar la inferencia.
- **Dependencia de un branch experimental**: requiere el branch `vulkan/qwen4exp-rocmfpx` de llama.cpp, que aún no está integrado en el upstream. Los PRs relacionados (`#27742` y `#27739`) están sin fusionar, por lo que la estabilidad no está garantizada.
- **Sesgos y alucinación**: no se puede evaluar directamente, ya que el head no genera contenido. Los sesgos y riesgos de alucinación son inherentes al modelo base Qwen3.8-Flash-Next.
- **Licencia restrictiva**: la Qwen Community License 1.0 permite uso comercial, pero con condiciones; es necesario revisar los términos completos antes de usarlo en producción.
- **Soporte de hardware limitado**: la cuantización ROCmFP4 es específica para GPUs AMD con Vulkan; en GPUs NVIDIA o Intel el rendimiento puede ser nulo o degradado. No se han publicado pruebas en otros sistemas.
- **Riesgo de incompatibilidad**: el formato GGUF con tipos ROCmFP4 no es estándar; cualquier actualización de llama.cpp podría romper la compatibilidad.

## Enlaces

- [Repositorio HuggingFace del head MTP](https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF)
- [Repositorio HuggingFace del modelo principal cuantizado](https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [PR llama.cpp #27742 (soporte qwen4exp)](https://github.com/ggml-org/llama.cpp/pull/27742)
- [PR llama.cpp #27739 (gráfico MTP)](https://github.com/ggml-org/llama.cpp/pull/27739)
- [Repositorio ciru-ai/ROCmFPX (formatos de cuantización)](https://github.com/ciru-ai/ROCmFPX)
- [Guía de ejecución local de Qwen3.8-Flash-Next (unsloth)](https://unsloth.ai/docs/models/qwen3.8-next)
- [Documentación de vLLM para Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
