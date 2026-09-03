# AbteeXAILab/lumynax-tiny-qwen25-05b-gguf

## Resumen

LumynaX Tiny Qwen2.5 0.5B GGUF es un paquete de inferencia publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), que integra el modelo base Qwen2.5-0.5B-Instruct dentro de su marco de "infusión" LumynaX. Este release concreto se etiqueta explícitamente como legacy y desactualizado, y se conserva únicamente con fines de reproducibilidad e investigación. No representa las capacidades actuales de la familia LumynaX ni debe usarse en producción.

El paquete contiene los pesos del modelo Qwen2.5-0.5B-Instruct en formato GGUF, sin modificación de pesos (composición "routed infusion"), y está pensado para ejecutarse con llama.cpp. Con aproximadamente 630 millones de parámetros, es un modelo muy compacto orientado a despliegue local en hardware modesto. Su relevancia actual es limitada, pero puede servir como punto de partida para experimentos de inferencia ligera o para estudiar el enfoque de orquestación de LumynaX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-0.5B-Instruct) |
| Parametros totales | 630.167.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B-Instruct soporta 32K, pero no se confirma en esta release) |
| Tipos de cuantizacion | no disponible (formato GGUF, cuantizaciones no listadas) |
| Idiomas soportados | en, mi (maori) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only con 0.5 mil millones de parámetros, entrenado por Alibaba Cloud. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) en la información proporcionada. La release LumynaX no modifica los pesos: aplica una "infusión enrutada" en la que el núcleo LumynaX (no incluido en este paquete) orquesta la inferencia sin alterar el modelo base. El paquete incluye wrappers de identidad y runtime históricos, pero no el pipeline LumynaX completo.

## Capacidades

- Generación de texto en inglés y maori (según la etiqueta de idiomas).
- Instrucción y diálogo conversacional básico, heredado de Qwen2.5-0.5B-Instruct.
- Ejecución local eficiente gracias al formato GGUF y al tamaño reducido.
- Compatible con llama.cpp y, según los tags, con vLLM (experimental) y Nvidia NIM (candidato, requiere conversión).
- No se documentan capacidades de tool calling, agentes, visión ni audio en esta release.

## Casos de uso

- Prototipado rápido de aplicaciones de chat en entornos con recursos limitados: al ser un modelo de 0.5B, puede ejecutarse en CPU o GPU de baja gama, permitiendo validar flujos de conversación antes de escalar a modelos mayores.
- Experimentación académica con infusión de modelos: el paquete sirve como artefacto de referencia para estudiar el enfoque de orquestación LumynaX, aunque el núcleo no está incluido.
- Generación de texto en maori: el modelo declara soporte para maori, lo que podría interesar a proyectos de preservación lingüística o asistentes locales en Nueva Zelanda, aunque no hay evidencia de calidad específica.
- Educación y aprendizaje de inferencia local: su tamaño permite ejecutarlo en portátiles sin GPU, ideal para talleres de LLMs y demostraciones de generación de texto.
- Pruebas de compatibilidad con llama.cpp y formatos GGUF: útil para desarrolladores que necesitan verificar integraciones con esta librería.
- Investigación de reproducibilidad: al ser un release legacy con checksums y manifiestos, puede usarse para auditar el proceso de empaquetado de AbteeX AI Labs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-0.5B-Instruct tiene métricas conocidas (por ejemplo, MMLU alrededor de 45-50), pero esta release no proporciona datos propios, y no se deben extrapolar sin verificación.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para cuantizaciones de 4 bits; el modelo completo en FP16 ocupa aproximadamente 1.3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano, o iGPU modernas). También funciona en CPU.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU de los últimos años.
- Opciones de despliegue: llama.cpp (principal), Ollama (posible mediante importación de GGUF), vLLM (experimental), Nvidia NIM (requiere conversión).
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una generación de decenas de tokens por segundo en CPU moderna y cientos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LumynaX Tiny Qwen2.5 0.5B GGUF | 0.63B | no disponible | Apache-2.0 | GGUF | Release legacy, sin mantenimiento |
| Qwen2.5-0.5B-Instruct (original) | 0.5B | 32K | Apache-2.0 | safetensors | Modelo base, activo y con soporte |
| TinyLlama-1.1B-Chat | 1.1B | 2K | Apache-2.0 | safetensors/GGUF | Alternativa de tamaño similar, más contexto limitado |

La comparativa se basa en datos públicos de los modelos base; no hay benchmarks específicos de esta release.

## Limitaciones y advertencias

- Release legacy y desactualizada: el propio autor indica que no es recomendable para producción y que no refleja las capacidades actuales de LumynaX.
- El núcleo LumynaX no está incluido: la "infusión" descrita en la model card no es funcional sin el pipeline completo, que no se distribuye en este paquete.
- Sin datos de rendimiento: no hay benchmarks ni evaluaciones de calidad para esta release concreta.
- Sesgos y alucinaciones: heredados del modelo base Qwen2.5-0.5B-Instruct, que al ser pequeño tiene mayor propensión a errores y alucinaciones que modelos grandes.
- Soporte de idiomas limitado: solo se declaran inglés y maori; no se garantiza calidad en otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el estado "outdated" y la falta de mantenimiento suponen un riesgo para entornos productivos.

## Enlaces

- [HuggingFace - AbteeXAILab/lumynax-tiny-qwen25-05b-gguf](https://huggingface.co/AbteeXAILab/lumynax-tiny-qwen25-05b-gguf)
- [GitHub - Aimaghsoodi/lumynax-tiny-qwen25-05b-gguf](https://github.com/Aimaghsoodi/lumynax-tiny-qwen25-05b-gguf)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
- [Modelo base Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
