# nm-testing/convert_modelopt_nvfp4-e2e

## Resumen

El modelo `nm-testing/convert_modelopt_nvfp4-e2e` es una versión cuantizada a FP4 de Qwen3-8B, el modelo de lenguaje de 8.190 millones de parámetros desarrollado por Alibaba. La cuantización se ha realizado con TensorRT Model Optimizer (nvidia-modelopt v0.35.0) y se distribuye en formato `compressed-tensors` con pesos en safetensors, lista para inferencia con TensorRT-LLM sobre GPUs NVIDIA Blackwell. El repositorio pertenece a la cuenta de pruebas `nm-testing`, no a la cuenta oficial de NVIDIA, aunque el modelo de referencia publicado por NVIDIA es `nvidia/Qwen3-8B-FP4`.

El interés de esta ficha radica en que ilustra el flujo de cuantización NVFP4 aplicado a un transformer denso de 8B con contexto de hasta 131K tokens, un caso representativo para despliegues de agentes, chatbots y sistemas RAG que necesitan reducir huella de memoria y aumentar throughput en hardware Blackwell. La cuantización afecta solo a pesos y activaciones de los operadores lineales dentro de los bloques transformer, manteniendo el resto de la arquitectura Qwen3-8B intacta.

Al tratarse de un artefacto de pruebas de integración ("e2e"), conviene tratarlo como referencia técnica del pipeline de conversión más que como un checkpoint de producción validado. La licencia Apache 2.0 del modelo base se mantiene, y el autor declara uso comercial y no comercial permitido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | hasta 131K tokens (según model card) |
| Tipos de cuantizacion | FP4 (pesos y activaciones de operadores lineales), etiquetado como 8-bit en los tags del repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (repo de 6,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer autorregresivo denso de 8.190 millones de parámetros, sin mezcla de expertos. Sobre esa base, este checkpoint aplica cuantización post-entrenamiento (PTQ) de pesos y activaciones a FP4 únicamente en los operadores lineales de los bloques transformer, dejando el resto de componentes en su precisión original. La herramienta empleada es TensorRT Model Optimizer v0.35.0, que produce un checkpoint en formato `compressed-tensors` consumible por TensorRT-LLM.

No se especifica en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de Qwen3-8B y no se detallan aquí. Para la calibración de la cuantización se empleó el dataset `cnn_dailymail`, con recolección y etiquetado automatizados. Los datasets de entrenamiento y test del proceso de cuantización figuran como "undisclosed" en la model card.

## Capacidades

- Generación de texto conversacional y de formato libre, heredada de Qwen3-8B.
- Razonamiento multi-paso y matemáticas, en la medida en que lo soporte el modelo base.
- Generación de código, sujeta a la calidad del checkpoint original.
- Soporte de tool calling y function calling, siempre que el modelo base lo ofrezca y el runtime lo implemente.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.
- Contexto largo de hasta 131K tokens para entradas de una dimensión (secuencias).
- Inferencia optimizada en TensorRT-LLM sobre GPUs NVIDIA Blackwell.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en esta ficha.

## Casos de uso

- Agentes conversacionales con contexto largo: el modelo puede mantener conversaciones multi-turno con hasta 131K tokens de ventana, adecuado para asistentes que necesitan recordar historial extenso o documentos completos.
- Sistemas RAG de documentación técnica: la ventana de contexto permite inyectar varios fragmentos recuperados sin truncar, y la cuantización FP4 reduce la memoria necesaria para servir el modelo en paralelo.
- Despliegue de chatbots en producción sobre Blackwell: al estar empaquetado para TensorRT-LLM, se integra en pipelines de serving con `LLM` API y `SamplingParams`, facilitando el escalado horizontal.
- Automatización de soporte al cliente: la generación de texto conversacional y el soporte de tool calling permiten encadenar consultas a sistemas internos (pedidos, tickets) dentro de la misma sesión.
- Generación de código asistida en IDE o CI: el modelo puede integrarse como servicio de completado o revisión, siempre que se valide la calidad del checkpoint cuantizado frente al original.
- Prototipado de aplicaciones de IA en hardware NVIDIA: útil como referencia para evaluar el impacto de NVFP4 en latencia y calidad antes de adoptar el checkpoint oficial `nvidia/Qwen3-8B-FP4`.
- Evaluación de pipelines de cuantización: al ser un artefacto de pruebas end-to-end, sirve para validar herramientas de conversión, calibración y despliegue en entornos de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 6,4 GB en safetensors, por lo que la huella de pesos en FP4 es del orden de esa cifra, a la que hay que sumar activaciones, KV cache y overhead del runtime.
- GPUs recomendadas: NVIDIA Blackwell (B200 citada como hardware de test en la model card); no se garantiza compatibilidad con generaciones anteriores.
- GPU de consumo: no disponible; la model card no confirma soporte en RTX 4090 ni en otras consumer GPUs.
- Motor de despliegue: TensorRT-LLM (API `LLM` con `SamplingParams`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| nm-testing/convert_modelopt_nvfp4-e2e | 8,19B | 131K | FP4 (NVFP4) | Apache 2.0 | TensorRT-LLM |
| nvidia/Qwen3-8B-FP4 | 8,2B | 131K | FP4 (NVFP4) | Apache 2.0 | TensorRT-LLM |
| Qwen/Qwen3-8B | 8B | 131K (según model card) | BF16/FP16 original | Apache 2.0 | Múltiples (vLLM, TGI, etc.) |

La comparativa se limita a variantes del mismo modelo base, ya que la información disponible no incluye datos de rendimiento frente a alternativas de otros fabricantes. El checkpoint oficial de NVIDIA es la referencia recomendada para producción; este repositorio de pruebas reproduce el mismo pipeline de cuantización.

## Limitaciones y advertencias

- Repositorio de pruebas: la cuenta `nm-testing` sugiere un artefacto de integración end-to-end, no un checkpoint validado para producción.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar los términos del modelo base Qwen3-8B y de las dependencias de NVIDIA.
- Hardware restringido: la model card solo garantiza compatibilidad con NVIDIA Blackwell y TensorRT-LLM; no hay soporte documentado para otras GPUs o runtimes.
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar calidad multilingüe.
- Riesgo de alucinación: inherente al modelo base; la cuantización FP4 puede degradar ligeramente la fidelidad en tareas sensibles.
- Sesgos: no documentados en la información disponible; se heredan los del modelo Qwen3-8B.
- Contexto: aunque se declaran 131K tokens, no se detalla el comportamiento en los extremos de la ventana ni el coste de KV cache.
- Datos de entrenamiento y evaluación del proceso de cuantización: marcados como "undisclosed", lo que limita la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nm-testing/convert_modelopt_nvfp4-e2e
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Checkpoint oficial NVIDIA: https://huggingface.co/nvidia/Qwen3-8B-FP4
- TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Licencia Apache 2.0: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md
