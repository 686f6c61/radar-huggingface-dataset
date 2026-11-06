# liodon-ai/MNN-Pocket-0.3B-FP8

## Resumen

MNN-Pocket-0.3B-FP8 es una cuantización en FP8 dinámico del modelo base taobao-mnn/MNN-Pocket-0.3B, publicada por Liodon AI. Se trata de un modelo de generación de texto de pequeno tamano (302.830.976 parámetros, aproximadamente 0,3B) construido sobre arquitectura Qwen3, según la etiqueta `qwen3` del repositorio. El proceso de cuantización reduce el peso del repositorio de 0,7 GB a 0,4 GB manteniendo los pesos en formato FP8 (E4M3) con cuantización por canal y activaciones dinámicas por token.

La relevancia de esta ficha reside en que ofrece una via de despliegue de bajo coste para un modelo conversacional de 0,3B parámetros, con soporte declarado para vLLM, TGI y SGLang, y compatibilidad con endpoints. Al estar cuantizado con el esquema `FP8_DYNAMIC` de llm-compressor, no requiere dataset de calibración, lo que evita sesgos introducidos por el conjunto de calibración y simplifica la reproducibilidad del proceso.

No obstante, la información pública disponible es muy limitada: no se detallan idiomas soportados, composición del dataset de entrenamiento, resultados de benchmarks ni condiciones concretas de la licencia "other". Esta ficha documenta exclusivamente lo que puede verificarse a partir de la model card, los metadatos de Hugging Face y la información de búsqueda disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3`; detalles no disponibles) |
| Parametros totales | 302.830.976 (aproximadamente 0,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinámico: pesos por canal, activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (condiciones no especificadas) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es taobao-mnn/MNN-Pocket-0.3B, etiquetado como `qwen3` en el repositorio, lo que sugiere una arquitectura transformer derivada de la familia Qwen3, aunque no se especifican el número de capas, dimensiones ocultas, mecanismo de atención ni longitud de contexto. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

La innovación técnica documentada se limita al proceso de cuantización: se empleó llm-compressor con el esquema `FP8_DYNAMIC`, que convierte los pesos a FP8 (E4M3) por canal de forma anticipada y cuantiza las activaciones a FP8 dinámicamente por token durante la inferencia. Al no requerir dataset de calibración, los pesos cuantizados son esencialmente una conversión directa de los originales. La capa `lm_head` se deja sin cuantizar, práctica estándar para preservar la calidad de la distribución de salida. El resultado es una reducción de 0,7 GB a 0,4 GB.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Generación de texto autoregresiva con caché KV, compatible con pipelines de `transformers` y con el ecosistema de inferencia (vLLM, TGI, SGLang).
- Ejecución en FP8 nativo en GPUs con compute capability ≥ 8.9 (Ada, Hopper, Blackwell), con dequantización automática en GPUs anteriores.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue de bajo coste en GPUs de gama media: al ocupar 0,4 GB en FP8, el modelo puede servirse en una única GPU con muy poca VRAM, lo que lo hace adecuado para entornos de desarrollo, pruebas o servicios de baja concurrencia donde no se justifica un modelo mayor.
- Prototipado rápido de aplicaciones conversacionales: la compatibilidad con vLLM, TGI y SGLang permite levantar un endpoint compatible con la API de OpenAI en minutos, útil para validar flujos de chat antes de migrar a un modelo mayor.
- Generación de texto en entornos con restricciones de memoria: en despliegues edge o contenedores con límites estrictos de memoria, el tamaño reducido del checkpoint FP8 facilita la carga y el arranque rápido del servicio.
- Evaluación comparativa de cuantizaciones: al ser una conversión directa sin calibración, sirve como referencia para medir la degradación introducida por FP8 frente al modelo base en tareas de generación de texto.
- Servicio de inferencia con GPUs Ada/Hopper: en GPUs con soporte nativo FP8 (RTX 40-series, L4, L40S, H100), el modelo aprovecha las unidades de cómputo FP8 para reducir el coste por token en comparación con la ejecución en BF16/FP16.
- Pruebas de integración en pipelines de CI/CD: el reducido tamaño del repositorio (0,4 GB) permite incluirlo en tests automatizados de extremo a extremo sin incurrir en grandes costes de almacenamiento o descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa aproximadamente 0,4 GB; con overhead de caché KV y runtime, se estima un consumo de VRAM del orden de 1-2 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: NVIDIA con compute capability ≥ 8.9 para ejecución FP8 nativa, es decir, RTX 40-series (Ada), L4, L40S, H100, H200, B100, B200 y GB10 (Hopper/Blackwell).
- GPUs consumer: cabe con holgura en cualquier GPU consumer moderna; en GPUs anteriores a Ada, vLLM y TGI dequantizan a un formato soportado, perdiendo la ventaja de velocidad y memoria del FP8.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/MNN-Pocket-0.3B-FP8`), TGI (imagen `ghcr.io/huggingface/text-generation-inference`), SGLang (`python -m sglang.launch_server --model-path ...`) y `transformers` con soporte de compressed-tensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/MNN-Pocket-0.3B-FP8 | 302.830.976 | no disponible | FP8 dinamico | other | Hugging Face |
| taobao-mnn/MNN-Pocket-0.3B (base) | no disponible | no disponible | sin cuantizar (0,7 GB) | other | Hugging Face |
| liodon-ai/MNN-Pocket-0.3B-ONNX | no disponible | no disponible | ONNX (text-generation-with-past) | other | Hugging Face |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia es "other" y no se detallan sus condiciones; es imprescindible revisar los términos del modelo base antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al no especificarse la composición del dataset de entrenamiento, no es posible evaluar sesgos potenciales.
- Riesgo de alucinación inherente a los modelos de generación de texto de pequeño tamaño; no hay evaluaciones publicadas que lo cuantifiquen.
- No se especifican los idiomas soportados ni la calidad por idioma; el rendimiento multilingüe es desconocido.
- La longitud de contexto no está documentada, lo que impide planificar casos de uso con conversaciones o documentos largos.
- La ejecución FP8 nativa requiere GPUs Ada/Hopper/Blackwell; en GPUs anteriores se produce dequantización y se pierden las ventajas de memoria y velocidad.
- El modelo tiene solo 0,3B parámetros, por lo que su capacidad de razonamiento complejo, código y matemáticas es presumiblemente limitada en comparación con modelos de mayor tamaño.
- No se han publicado benchmarks que permitan validar la calidad de la cuantización frente al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/MNN-Pocket-0.3B-FP8
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Exportación ONNX del mismo autor: https://huggingface.co/liodon-ai/MNN-Pocket-0.3B-ONNX
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
